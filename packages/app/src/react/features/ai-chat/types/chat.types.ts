/* eslint-disable no-unused-vars */
/**
 * Comprehensive TypeScript type definitions for the Chat System
 * Provides type safety for chat messages, streaming, API responses, and state management
 */

/**
 * File attachment with metadata
 */
export interface IChatFileAttachment {
  /** Public URL of the uploaded file */
  url: string;
  /** Original filename */
  name?: string;
  /** MIME type of the file */
  type?: string;
  /** File size in bytes */
  size?: number;
}

/**
 * Chat message types
 * Compatible with shared type definition
 */
export type TChatMessageType = 'user' | 'system' | 'thinking';

/**
 * Error types for chat responses
 */
export type TChatErrorType = 'stream_error' | 'system_error' | 'network_error' | 'abort_error';

/**
 * Thinking/status message types for UX feedback
 */
export type TThinkingType = 'general' | 'function' | 'status';

/**
 * Chat message structure
 * Compatible with shared IChatMessage type
 */
export interface IChatMessage {
  /** Unique message identifier */
  id?: string | number;
  /** Message content */
  message: string;
  /** Message type */
  type: TChatMessageType;
  /** Whether this message is from the current user (required for compatibility) */
  me: boolean;
  /** Avatar URL for system messages */
  avatar?: string;
  /** Attached files */
  files?: Array<{
    file: File;
    metadata: { publicUrl?: string; fileType?: string; isUploading?: boolean };
    id?: string;
  }>;
  /** Whether the AI is currently replying */
  isReplying?: boolean;
  /** Error indicator */
  isError?: boolean;
  /** Error type classification */
  errorType?: TChatErrorType;
  /** Hide message bubble (e.g., for file-only messages) */
  hideMessage?: boolean;
  /** Thinking/processing message to display */
  thinkingMessage?: string;
  /** Timestamp */
  timestamp?: number;
  /** Whether this is the first message */
  isFirstMessage?: boolean;
  /** Whether this is the last message */
  isLast?: boolean;
  /** Whether this message is being retried */
  isRetrying?: boolean;
  /** Function to call when retry is clicked */
  onRetryClick?: () => void;
}

/**
 * Stream chunk response format from ChatService
 */
export interface IChatStreamChunk {
  /** Message role (system/user/assistant) */
  role?: string;
  /** Content chunk for streaming responses */
  content?: string;
  /** Debug information */
  debug?: string;
  /** Tool/function title */
  title?: string;
  /** Status message for function execution */
  status_message?: string;
  /** Function name */
  function?: string;
  /** Function call information */
  function_call?: {
    name?: string;
    arguments?: Record<string, unknown>;
  };
  /** Hash ID for debug tracking */
  hashId?: string;
  /** Debug session active indicator */
  debugOn?: boolean;
  /** Call parameters for debugging */
  callParams?: string | Record<string, unknown>;
  /** Additional parameters */
  parameters?: unknown[];
  /** Error message */
  error?: string;
  /** Error indicator */
  isError?: boolean;
  /** Error type */
  errorType?: TChatErrorType;
}

/**
 * Chat streaming configuration
 */
export interface IChatStreamConfig {
  /** Agent ID */
  agentId: string;
  /** Conversation/Chat ID */
  chatId: string;
  /** User message */
  message: string;
  /** File attachments */
  attachments?: IChatFileAttachment[];
  /** Abort signal for cancellation */
  signal: AbortSignal;
  /** Custom headers */
  headers?: Record<string, string>;
}

/**
 * Callbacks for chat streaming events
 */
export interface IChatStreamCallbacks {
  /** Called when content chunk arrives */
  onContent: (content: string) => void;
  /** Called when thinking/status updates occur */
  onThinking?: (message: string, type: TThinkingType) => void;
  /** Called when function/tool is being used */
  onToolCall?: (toolName: string, args: Record<string, unknown>) => void;
  /** Called when debug information arrives */
  onDebug?: (debug: IChatStreamChunk) => void;
  /** Called when an error occurs */
  onError: (error: IChatError) => void;
  /** Called when streaming starts */
  onStart?: () => void;
  /** Called when streaming completes */
  onComplete: () => void;
}

/**
 * Chat error with detailed information
 */
export interface IChatError {
  /** Error message */
  message: string;
  /** Error type classification */
  type: TChatErrorType;
  /** Original error object */
  originalError?: Error | unknown;
  /** Whether this is a user-initiated abort */
  isAborted?: boolean;
}

/**
 * Chat state interface
 */
export interface IChatState {
  /** All messages in the conversation */
  messages: IChatMessage[];
  /** Whether AI is currently generating a response */
  isGenerating: boolean;
  /** Whether input is being processed (uploading files, etc.) */
  isProcessing: boolean;
  /** Current error if any */
  error: IChatError | null;
  /** Whether retry is in progress */
  isRetrying: boolean;
}

/**
 * Chat actions interface
 */
export interface IChatActions {
  /** Send a new message */
  sendMessage: (message: string, files?: File[]) => Promise<void>;
  /** Retry the last message */
  retryLastMessage: () => Promise<void>;
  /** Stop current generation */
  stopGenerating: () => void;
  /** Clear all messages */
  clearMessages: () => void;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Hook return type combining state and actions
 */
export interface IUseChatReturn extends IChatState, IChatActions {
  /** Last user message for retry functionality */
  lastUserMessage: string | null;
}

/**
 * Thinking message manager state
 */
export interface IThinkingManagerState {
  /** Current thinking type */
  type: TThinkingType | null;
  /** Current message being displayed */
  message: string;
  /** Function name (for function type) */
  functionName?: string;
  /** Status message (for status type) */
  statusMessage?: string;
}

/**
 * API client configuration
 */
export interface IChatAPIConfig {
  /** Base URL for the chat API */
  baseUrl?: string;
  /** Default headers */
  defaultHeaders?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Retry configuration */
  retry?: {
    attempts: number;
    delay: number;
  };
}

/**
 * File upload metadata
 */
export interface IFileUploadMetadata {
  /** Public URL after upload */
  publicUrl: string;
  /** File type */
  fileType: string;
  /** Upload status */
  isUploading: boolean;
  /** Upload error if any */
  error?: string;
}
