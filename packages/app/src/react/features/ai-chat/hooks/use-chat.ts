/**
 * Professional React hook for complete chat state management
 * Combines streaming, message history, file uploads, and error handling
 */

import { useCallback, useRef, useState } from 'react';
import { ChatAPIClient } from '../clients/chat-api.client';
import {
  IChatFileAttachment,
  IChatMessage,
  IUseChatReturn,
  TThinkingType,
} from '../types/chat.types';
import { useChatStream } from './use-chat-stream';

/**
 * Hook configuration interface
 */
interface IUseChatConfig {
  /** Agent ID */
  agentId: string;
  /** Chat/Conversation ID */
  chatId: string;
  /** Avatar URL for AI messages */
  avatar?: string;
  /** Custom chat API client */
  client?: ChatAPIClient;
  /** Custom headers for requests */
  headers?: Record<string, string>;
  /** Called when chat completes successfully */
  onChatComplete?: (message: string) => void;
  /** Called when error occurs */
  onError?: (error: Error) => void;
}

/**
 * Main chat hook for complete state management
 * Provides all functionality needed for a chat interface
 *
 * @param config - Hook configuration
 * @returns Complete chat state and actions
 *
 * @example
 * ```typescript
 * const {
 *   messages,
 *   isGenerating,
 *   sendMessage,
 *   retryLastMessage,
 *   stopGenerating,
 *   clearMessages,
 * } = useChat({
 *   agentId: 'agent-123',
 *   chatId: 'chat-456',
 *   avatar: '/avatar.png',
 * });
 *
 * // Send a message
 * await sendMessage('Hello, AI!');
 *
 * // Send with files
 * await sendMessage('Analyze these files', [file1, file2]);
 *
 * // Retry last message
 * await retryLastMessage();
 *
 * // Stop generation
 * stopGenerating();
 * ```
 */
export const useChat = (config: IUseChatConfig): IUseChatReturn => {
  const { agentId, chatId, avatar, client, headers, onChatComplete, onError } = config;

  // State management
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs for retry functionality
  const lastUserMessageRef = useRef<{
    message: string;
    files?: File[] | Array<{ file: File; metadata: { publicUrl?: string; fileType?: string } }>;
  } | null>(null);

  // Current AI message being constructed
  const currentAIMessageRef = useRef<string>('');

  // Stream management
  const { isStreaming, error, startStream, abortStream, clearError } = useChatStream({
    client,
    onStreamStart: () => {
      currentAIMessageRef.current = '';
    },
    onStreamEnd: () => {
      setIsProcessing(false);
    },
  });

  /**
   * Uploads files and returns attachment metadata
   * Skips upload if files already have publicUrl
   */
  const uploadFiles = useCallback(
    async (
      files: File[] | Array<{ file: File; metadata: { publicUrl?: string; fileType?: string } }>,
    ): Promise<IChatFileAttachment[]> => {
      const clientInstance = client || new ChatAPIClient();

      // Check if files are already uploaded (have metadata with publicUrl)
      const filesWithMetadata = files as Array<{
        file: File;
        metadata: { publicUrl?: string; fileType?: string };
      }>;

      if (filesWithMetadata[0] && 'metadata' in filesWithMetadata[0]) {
        // Files are already uploaded, just extract the attachment info
        return filesWithMetadata
          .filter((f) => f.metadata.publicUrl)
          .map((f) => ({
            url: f.metadata.publicUrl || '',
            name: f.file.name,
            type: f.metadata.fileType || f.file.type,
            size: f.file.size,
          }));
      }

      // Files need to be uploaded
      const rawFiles = files as File[];
      const uploadPromises = rawFiles.map((file) => clientInstance.uploadFile(file, agentId));

      try {
        return await Promise.all(uploadPromises);
      } catch (uploadError) {
        throw new Error(
          `Failed to upload files: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`,
        );
      }
    },
    [client, agentId],
  );

  /**
   * Adds a user message to the chat
   */
  const addUserMessage = useCallback(
    (
      message: string,
      files?: File[] | Array<{ file: File; metadata: { publicUrl?: string; fileType?: string } }>,
    ) => {
      const userMessage: IChatMessage = {
        id: Date.now(),
        message,
        type: 'user',
        me: true,
        timestamp: Date.now(),
        files: files?.map((file) => {
          if ('metadata' in file) {
            return file as { file: File; metadata: { publicUrl?: string; fileType?: string } };
          }
          return {
            file: file as File,
            metadata: { fileType: (file as File).type, isUploading: false },
          };
        }),
      };

      setMessages((prev) => [...prev, userMessage]);
    },
    [],
  );

  /**
   * Adds an AI message to the chat (initially empty, for streaming)
   */
  const addAIMessage = useCallback(() => {
    const aiMessage: IChatMessage = {
      id: Date.now() + 1,
      message: '',
      type: 'system',
      me: false,
      avatar,
      isReplying: true,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, aiMessage]);
  }, [avatar]);

  /**
   * Updates the current AI message content
   */
  const updateAIMessage = useCallback((content: string, isError: boolean = false) => {
    setMessages((prev) => {
      const updated = [...prev];
      const lastMessageIndex = updated.length - 1;

      if (lastMessageIndex >= 0 && updated[lastMessageIndex].type === 'system') {
        updated[lastMessageIndex] = {
          ...updated[lastMessageIndex],
          message: content,
          isReplying: false,
          isError,
        };
      }

      return updated;
    });
  }, []);

  /**
   * Updates thinking/status message for current AI response
   */
  const updateThinkingMessage = useCallback((thinkingMessage: string) => {
    setMessages((prev) => {
      const updated = [...prev];
      const lastMessageIndex = updated.length - 1;

      if (lastMessageIndex >= 0 && updated[lastMessageIndex].type === 'system') {
        updated[lastMessageIndex] = {
          ...updated[lastMessageIndex],
          thinkingMessage,
        };
      }

      return updated;
    });
  }, []);

  /**
   * Sends a message to the AI
   * Accepts either raw File[] or FileWithMetadata[] (already uploaded)
   */
  const sendMessage = useCallback(
    async (
      message: string,
      files?: File[] | Array<{ file: File; metadata: { publicUrl?: string; fileType?: string } }>,
    ): Promise<void> => {
      // Validate input
      if (!message.trim() && (!files || files.length === 0)) {
        return;
      }

      // Store for retry
      lastUserMessageRef.current = { message, files };

      try {
        setIsProcessing(true);
        clearError();

        // Upload files if present
        let attachments: IChatFileAttachment[] = [];
        if (files && files.length > 0) {
          attachments = await uploadFiles(files);
        }

        // Add user message to UI
        addUserMessage(message, files);

        // Add empty AI message for streaming
        addAIMessage();

        // Start streaming
        await startStream(
          {
            agentId,
            chatId,
            message,
            attachments,
            signal: new AbortController().signal, // Signal managed by useChatStream
            headers,
          },
          {
            onContent: (content: string) => {
              // Accumulate content
              currentAIMessageRef.current += content;
              updateAIMessage(currentAIMessageRef.current);
            },
            onThinking: (thinkingMsg: string, _type: TThinkingType) => {
              // Update thinking message
              updateThinkingMessage(thinkingMsg);
            },
            onToolCall: (toolName: string, args: Record<string, unknown>) => {
              // Log tool calls (can be extended for UI display)
              console.log('Tool call:', toolName, args);
            },
            onDebug: (debug) => {
              // Log debug info (can be extended for debug UI)
              console.log('Debug:', debug);
            },
            onError: (streamError) => {
              // Handle stream errors
              const errorMessage = streamError.isAborted
                ? 'Response generation was cancelled'
                : streamError.message;

              updateAIMessage(errorMessage, true);

              if (onError) {
                onError(new Error(errorMessage));
              }
            },
            onComplete: () => {
              // Finalize message
              const finalMessage = currentAIMessageRef.current;
              updateAIMessage(finalMessage);

              if (onChatComplete) {
                onChatComplete(finalMessage);
              }
            },
          },
        );
      } catch (sendError) {
        const errorMessage =
          sendError instanceof Error ? sendError.message : 'Failed to send message';

        updateAIMessage(errorMessage, true);

        if (onError) {
          onError(sendError instanceof Error ? sendError : new Error(errorMessage));
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [
      agentId,
      chatId,
      headers,
      uploadFiles,
      addUserMessage,
      addAIMessage,
      updateAIMessage,
      updateThinkingMessage,
      startStream,
      clearError,
      onChatComplete,
      onError,
    ],
  );

  /**
   * Retries the last sent message
   */
  const retryLastMessage = useCallback(async (): Promise<void> => {
    if (!lastUserMessageRef.current) {
      return;
    }

    const { message, files } = lastUserMessageRef.current;

    // Remove last two messages (user message and failed AI response)
    setMessages((prev) => prev.slice(0, -2));

    // Resend the message
    await sendMessage(message, files);
  }, [sendMessage]);

  /**
   * Stops the current generation
   */
  const stopGenerating = useCallback(() => {
    abortStream();

    // Mark current message as stopped
    setMessages((prev) => {
      const updated = [...prev];
      const lastMessageIndex = updated.length - 1;

      if (lastMessageIndex >= 0 && updated[lastMessageIndex].type === 'system') {
        updated[lastMessageIndex] = {
          ...updated[lastMessageIndex],
          isReplying: false,
          thinkingMessage: undefined,
        };
      }

      return updated;
    });
  }, [abortStream]);

  /**
   * Clears all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    lastUserMessageRef.current = null;
    currentAIMessageRef.current = '';
  }, []);

  /**
   * Clears error state
   */
  const clearErrorState = useCallback(() => {
    clearError();
  }, [clearError]);

  return {
    // State
    messages,
    isGenerating: isStreaming,
    isProcessing,
    error,
    isRetrying: false, // Can be implemented if needed
    lastUserMessage: lastUserMessageRef.current?.message || null,

    // Actions
    sendMessage,
    retryLastMessage,
    stopGenerating,
    clearMessages,
    clearError: clearErrorState,
  };
};
