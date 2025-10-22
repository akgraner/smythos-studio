/**
 * React hook for managing chat streaming with abort control
 * Provides clean interface for streaming chat responses with lifecycle management
 */

import { IChatError, IStreamCallbacks, IStreamConfig } from '@react/features/ai-chat';
import { ChatAPIClient } from '@react/features/ai-chat/clients/chat-api.client';
import { useCallback, useRef, useState } from 'react';

/**
 * Hook configuration interface
 */
interface IUseChatStreamConfig {
  /** Chat API client instance */
  client?: ChatAPIClient;
  /** Called when stream starts */
  onStreamStart?: () => void;
  /** Called when stream completes */
  onStreamEnd?: () => void;
}

/**
 * Hook return interface
 */
interface IUseChatStreamReturn {
  /** Whether a stream is currently active */
  isStreaming: boolean;
  /** Current error if any */
  error: IChatError | null;
  /** Start a new chat stream */
  startStream: (config: IStreamConfig, callbacks: IStreamCallbacks) => Promise<void>; // eslint-disable-line no-unused-vars
  /** Abort the current stream */
  abortStream: () => void;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Custom hook for managing chat streaming with abort control
 * Handles stream lifecycle, abort signals, and error states
 *
 * @param config - Hook configuration
 * @returns Stream state and control functions
 *
 * @example
 * ```typescript
 * const { isStreaming, startStream, abortStream } = useChatStream({
 *   onStreamStart: () => console.log('Stream started'),
 *   onStreamEnd: () => console.log('Stream ended'),
 * });
 *
 * // Start streaming
 * await startStream(
 *   {
 *     agentId: 'agent-123',
 *     chatId: 'chat-456',
 *     message: 'Hello!',
 *     signal: abortController.signal,
 *   },
 *   {
 *     onContent: (content) => console.log(content),
 *     onError: (error) => console.error(error),
 *     onComplete: () => console.log('Done'),
 *   }
 * );
 *
 * // Abort streaming
 * abortStream();
 * ```
 */
export const useChatStream = (config: IUseChatStreamConfig = {}): IUseChatStreamReturn => {
  const { client, onStreamStart, onStreamEnd } = config;

  // State management
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<IChatError | null>(null);

  // Refs for lifecycle management
  const abortControllerRef = useRef<AbortController | null>(null);
  const clientRef = useRef<ChatAPIClient>(client || new ChatAPIClient());

  /**
   * Starts a new chat stream
   * Automatically manages abort controller and lifecycle callbacks
   */
  const startStream = useCallback(
    async (streamConfig: IStreamConfig, callbacks: IStreamCallbacks): Promise<void> => {
      // Abort any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Clear previous error
      setError(null);

      // Set streaming state
      setIsStreaming(true);

      // Notify start
      if (onStreamStart) {
        onStreamStart();
      }

      try {
        // Wrap callbacks to manage lifecycle
        const wrappedCallbacks: IStreamCallbacks = {
          ...callbacks,
          onError: (streamError: IChatError) => {
            setError(streamError);
            callbacks.onError(streamError);
          },
          onComplete: () => {
            setIsStreaming(false);
            abortControllerRef.current = null;

            if (onStreamEnd) {
              onStreamEnd();
            }

            callbacks.onComplete();
          },
        };

        // Start streaming with abort signal
        await clientRef.current.streamChat(
          {
            ...streamConfig,
            signal: abortController.signal,
          },
          wrappedCallbacks,
        );
      } catch (streamError) {
        // Handle errors
        const chatError = streamError as IChatError;
        setError(chatError);
        setIsStreaming(false);
        abortControllerRef.current = null;

        if (onStreamEnd) {
          onStreamEnd();
        }

        throw chatError;
      }
    },
    [onStreamStart, onStreamEnd],
  );

  /**
   * Aborts the current stream
   * Safe to call even if no stream is active
   */
  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);

      if (onStreamEnd) {
        onStreamEnd();
      }
    }
  }, [onStreamEnd]);

  /**
   * Clears error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isStreaming,
    error,
    startStream,
    abortStream,
    clearError,
  };
};
