/**
 * Chat Message Component
 * Routes to appropriate message component based on message type
 */
import { FC } from 'react';

import {
  ReplyLoader,
  SystemMessage,
  ThinkingMessage,
  UserMessage,
} from '@react/features/ai-chat/components';
import { IChatMessage } from '../types/chat.types';

import '../styles/index.css';

/**
 * Chat component properties
 */
interface ChatProps extends IChatMessage {
  /** Callback to scroll chat to bottom */
  scrollToBottom?: () => void;
}

/**
 * Chat Component
 * Renders appropriate message component based on message type and state
 *
 * @param props - Chat message properties
 * @returns Appropriate message component
 */
export const Chat: FC<ChatProps> = ({
  type,
  files,
  avatar,
  message,
  onRetryClick,
  thinkingMessage,
  scrollToBottom,
}) => {
  // ✅ Type-based discrimination - type is single source of truth

  // Loading state (replying/retrying)
  if (type === 'loading') {
    return <ReplyLoader />;
  }

  // Thinking message
  if (type === 'thinking') {
    return <ThinkingMessage message={message} avatar={avatar} />;
  }

  // User message
  if (type === 'user') {
    return <UserMessage message={message} files={files} />;
  }

  // Error message
  if (type === 'error') {
    return (
      <SystemMessage
        avatar={avatar}
        message={message || 'Something went wrong'}
        isError={true}
        onRetryClick={onRetryClick}
        isRetrying={false}
        thinkingMessage={thinkingMessage}
        onTypingProgress={() => scrollToBottom?.()}
        onTypingComplete={() => scrollToBottom?.()}
        typingAnimation={false}
      />
    );
  }

  // System message with typing animation
  return (
    <SystemMessage
      avatar={avatar}
      message={message}
      isError={false}
      onRetryClick={onRetryClick}
      isRetrying={false}
      thinkingMessage={thinkingMessage}
      onTypingProgress={() => scrollToBottom?.()}
      onTypingComplete={() => scrollToBottom?.()}
      typingAnimation={true}
    />
  );
};
