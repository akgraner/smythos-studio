export interface FileMetadata {
  key?: string;
  publicUrl?: string;
  fileType?: string;
  previewUrl?: string;
  isUploading?: boolean;
}

export interface FileWithMetadata {
  file: File;
  metadata: FileMetadata;
  id: string;
}

/**
 * Shared chat message interface
 * Backward compatible with legacy code while supporting new type system
 *
 * Note: Prefer using type-based discrimination for new code:
 * - Use `type === 'user'` instead of `me` boolean
 * - Use `type === 'loading'` instead of `isReplying`/`isRetrying`
 * - Use `type === 'error'` instead of `isError` boolean
 */
export interface IChatMessage {
  /** Legacy: whether message is from current user. Use `type === 'user'` instead */
  me: boolean;

  /** Message content */
  message: string;

  /**
   * Message type - determines rendering and state
   * New types: 'loading' (replaces isReplying/isRetrying), 'error' (replaces isError)
   */
  type?: 'user' | 'system' | 'thinking' | 'loading' | 'error';

  /** Avatar URL for system messages */
  avatar?: string;

  /** Legacy: AI is generating response. Use `type === 'loading'` instead */
  isReplying?: boolean;

  /** Legacy: Error state. Use `type === 'error'` instead */
  isError?: boolean;

  /** Attached files */
  files?: FileWithMetadata[];

  /** Inline thinking message */
  thinkingMessage?: string;

  /** Legacy: Retry in progress. Use `type === 'loading'` instead */
  isRetrying?: boolean;

  /** Retry callback */
  onRetryClick?: () => void;
}
