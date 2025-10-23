/**
 * AI Chat Feature - Main Export Index
 * Professional chat system with streaming support, type safety, and modern React patterns
 */

// === Type Definitions ===
export * from './types/chat.types';

// === API Client ===
export { chatAPI, ChatAPIClient, createChatClient } from './clients/chat-api.client';

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
  createThinkingManager,
  extractFunctionName,
  formatFunctionName,
  formatStatusMessage,
  processStreamChunk,
  splitJSONStream,
  ThinkingMessageManager,
} from './utils/stream.utils';
