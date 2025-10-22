/**
 * AI Chat Feature - Main Export Index
 * Professional chat system with streaming support, type safety, and modern React patterns
 */

// === Type Definitions ===
export type {
  IChatAPIConfig,
  IChatActions,
  IChatError,
  IChatFileAttachment,
  IChatMessage,
  IChatState,
  IChatStreamCallbacks,
  IChatStreamChunk,
  IChatStreamConfig,
  IFileUploadMetadata,
  IThinkingManagerState,
  IUseChatReturn,
  TChatErrorType,
  TChatMessageType,
  TThinkingType,
} from './types/chat.types';

// === API Client ===
export { ChatAPIClient, chatAPI, createChatClient } from './clients/chat-api.client';

// === React Hooks ===
export {
  useAgentChatContext,
  type IUseAgentChatContextConfig,
  type IUseAgentChatContextReturn,
} from './hooks/use-agent-chat-context';
export { useChat } from './hooks/use-chat';
export { useChatStream } from './hooks/use-chat-stream';

// === Utilities ===
export {
  ThinkingMessageManager,
  createThinkingManager,
  extractFunctionName,
  formatFunctionName,
  formatStatusMessage,
  processStreamChunk,
  splitJSONStream,
} from './utils/stream.utils';

// === Pages/Components ===
export { default as AgentChat } from './pages/agent-chat';
export { default as AIChat } from './pages/ai-chat';
