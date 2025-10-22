/**
 * Professional Chat Type System
 *
 * Clean, minimal, and reusable type definitions for the chat system.
 * Follows DRY principles - no redundant properties.
 *
 * @module chat.types
 */

// ============================================================================
// CORE MESSAGE TYPES
// ============================================================================

/**
 * Message type discriminator
 * Complete state representation through type alone
 *
 * - 'user': Message from user
 * - 'system': Response from AI/system
 * - 'thinking': AI is processing/thinking
 * - 'loading': AI is generating response (replying/retrying)
 * - 'error': Error occurred during processing
 */
export type TMessageType = 'user' | 'system' | 'thinking' | 'loading' | 'error';

/**
 * Core chat message interface
 *
 * Design principles:
 * - Type-based discrimination - `type` is single source of truth
 * - No redundant boolean flags (isReplying, isRetrying, isError)
 * - Minimal required fields
 * - Optional fields for specific use cases
 */
export interface IChatMessage {
  /** Unique identifier */
  id?: string | number;

  /** Message content */
  message: string;

  /**
   * Message type - single source of truth for state
   * Replaces: isReplying, isRetrying, isError, me booleans
   */
  type: TMessageType;

  // ============================================================================
  // CONVERSATION TRACKING
  // ============================================================================

  /**
   * Conversation Turn ID
   * Groups all messages (thinking, function calls, responses) related to
   * a single user query. All AI responses for one user message share the same turnId.
   *
   * @example
   * ```
   * User: "What's the weather?" → turnId: "turn_001"
   * AI: "Thinking..." → turnId: "turn_001" (same)
   * AI: "Using skill: weather" → turnId: "turn_001" (same)
   * AI: "It's sunny!" → turnId: "turn_001" (same)
   *
   * User: "Thanks!" → turnId: "turn_002" (new)
   * AI: "You're welcome!" → turnId: "turn_002" (same)
   * ```
   */
  conversationTurnId?: string;

  /**
   * Message ID (future)
   * Unique identifier from backend for this specific message
   * Will be available after SDK integration
   *
   * @example "msg_abc123-def456-ghi789"
   */
  messageId?: string;

  // ============================================================================
  // USER MESSAGE PROPERTIES
  // ============================================================================

  /** Attached files (user messages only) */
  files?: IMessageFile[];

  // ============================================================================
  // SYSTEM MESSAGE PROPERTIES
  // ============================================================================

  /** Avatar URL for system/AI messages */
  avatar?: string;

  /** Inline thinking/status message during generation */
  thinkingMessage?: string;

  // ============================================================================
  // INTERACTIVE PROPERTIES
  // ============================================================================

  /** Retry callback for error messages */
  onRetryClick?: () => void;

  /** Message timestamp (optional, for future use) */
  timestamp?: number;
}

/**
 * File attachment structure
 * Simplified from previous complex nested structure
 */
export interface IMessageFile {
  /** The actual File object */
  file: File;

  /** File metadata */
  metadata: {
    /** Public URL after upload */
    publicUrl?: string;
    /** MIME type */
    fileType?: string;
    /** Unique key for tracking */
    key?: string;
    /** Upload in progress indicator */
    isUploading?: boolean;
    /** Preview URL for images */
    previewUrl?: string;
  };

  /** Required ID for React keys and tracking */
  id: string;
}

/**
 * Type alias for backward compatibility
 * Same as IMessageFile - fully compatible
 * @deprecated Use IMessageFile instead for new code
 */
export type FileWithMetadata = IMessageFile;

// ============================================================================
// STREAMING TYPES
// ============================================================================

/**
 * Stream chunk from backend
 * Only includes actually used properties
 */
export interface IStreamChunk {
  /**
   * Conversation Turn ID
   * Groups all AI responses (thinking, function calls, content) for a single user message
   * All responses in one conversation turn share the same turnId
   *
   * @example "turn_1735123456789_abc123xyz"
   */
  conversationTurnId?: string;

  /**
   * Message ID (future)
   * Unique identifier from backend for this specific message
   * Will be available after SDK integration
   *
   * @example "msg_abc123-def456-ghi789"
   */
  messageId?: string;

  /** Content chunk for streaming responses */
  content?: string;

  /** Status/thinking message */
  status_message?: string;

  /** Function/tool name */
  function?: string;

  /** Function call details */
  function_call?: {
    name?: string;
    arguments?: Record<string, unknown>;
  };

  /** Debug information */
  debug?: string;

  /** Debug tracking hash */
  hashId?: string;

  /** Debug session indicator */
  debugOn?: boolean;

  /** Error message */
  error?: string;

  /** Error indicator */
  isError?: boolean;
}

/**
 * Thinking message type discriminator
 */
export type TThinkingType = 'general' | 'function' | 'status';

/**
 * Stream configuration for API calls
 */
export interface IStreamConfig {
  /** Target agent ID */
  agentId: string;

  /** Conversation ID */
  chatId: string;

  /** User message content */
  message: string;

  /** File attachments */
  attachments?: IFileAttachment[];

  /** Abort signal for cancellation */
  signal: AbortSignal;

  /** Custom headers */
  headers?: Record<string, string>;
}

/**
 * File attachment for API
 */
export interface IFileAttachment {
  /** Public URL */
  url: string;

  /** Filename */
  name?: string;

  /** MIME type */
  type?: string;

  /** File size */
  size?: number;
}

/**
 * Stream event callbacks
 */
/* eslint-disable no-unused-vars */
export interface IStreamCallbacks {
  /** Content chunk received - now includes optional conversationTurnId */
  onContent: (content: string, conversationTurnId?: string) => void;

  /** Thinking/status update - now includes optional conversationTurnId */
  onThinking?: (message: string, type: TThinkingType, conversationTurnId?: string) => void;

  /** Tool/function call detected - now includes optional conversationTurnId */
  onToolCall?: (
    toolName: string,
    args: Record<string, unknown>,
    conversationTurnId?: string,
  ) => void;

  /** Debug information received */
  onDebug?: (debug: IStreamChunk) => void;

  /** Error occurred - error object now includes conversationTurnId */
  onError: (error: IChatError) => void;

  /** Stream started */
  onStart?: () => void;

  /** Stream completed */
  onComplete: () => void;
}
/* eslint-enable no-unused-vars */

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Error type classification
 */
export type TErrorType = 'stream' | 'network' | 'abort' | 'system';

/**
 * Chat error structure
 */
export interface IChatError {
  /** Error message */
  message: string;

  /** Error type */
  type: TErrorType;

  /** Conversation turn ID for grouping */
  conversationTurnId?: string;

  /** Original error object */
  originalError?: Error | unknown;

  /** User-initiated abort flag */
  isAborted?: boolean;
}

// ============================================================================
// HOOK INTERFACES
// ============================================================================

/**
 * Chat hook configuration
 */
/* eslint-disable no-unused-vars */
export interface IUseChatConfig {
  /** Agent ID */
  agentId: string;

  /** Chat/Conversation ID */
  chatId: string;

  /** Avatar URL for AI messages */
  avatar?: string;

  /** Custom API client */
  client?: unknown; // Avoid circular dependency

  /** Custom headers */
  headers?: Record<string, string>;

  /** Chat completion callback */
  onChatComplete?: (message: string) => void;

  /** Error callback */
  onError?: (error: Error) => void;
}

/**
 * Chat hook return type
 */
export interface IUseChatReturn {
  // State
  messages: IChatMessage[];
  isGenerating: boolean;
  isProcessing: boolean;
  error: IChatError | null;

  // Actions
  sendMessage: (message: string, files?: File[] | IMessageFile[]) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  stopGenerating: () => void;
  clearMessages: () => void;
  clearError: () => void;
}
/* eslint-enable no-unused-vars */

// ============================================================================
// API CLIENT TYPES
// ============================================================================

/**
 * API client configuration
 */
export interface IAPIConfig {
  /** Base API URL */
  baseUrl?: string;

  /** Default headers */
  defaultHeaders?: Record<string, string>;

  /** Request timeout */
  timeout?: number;

  /** Retry configuration */
  retry?: {
    attempts: number;
    delay: number;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract user messages
 */
export type TUserMessage = IChatMessage & { type: 'user' };

/**
 * Extract system messages
 */
export type TSystemMessage = IChatMessage & { type: 'system' };

/**
 * Extract thinking messages
 */
export type TThinkingMessage = IChatMessage & { type: 'thinking' };

/**
 * Extract loading messages
 */
export type TLoadingMessage = IChatMessage & { type: 'loading' };

/**
 * Extract error messages
 */
export type TErrorMessage = IChatMessage & { type: 'error' };

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if message is from user
 */
export const isUserMessage = (message: IChatMessage): message is TUserMessage => {
  return message.type === 'user';
};

/**
 * Check if message is from system
 */
export const isSystemMessage = (message: IChatMessage): message is TSystemMessage => {
  return message.type === 'system';
};

/**
 * Check if message is thinking indicator
 */
export const isThinkingMessage = (message: IChatMessage): message is TThinkingMessage => {
  return message.type === 'thinking';
};

/**
 * Check if message is loading (replying/retrying)
 */
export const isLoadingMessage = (message: IChatMessage): message is TLoadingMessage => {
  return message.type === 'loading';
};

/**
 * Check if message is error
 */
export const isErrorMessage = (message: IChatMessage): message is TErrorMessage => {
  return message.type === 'error';
};
