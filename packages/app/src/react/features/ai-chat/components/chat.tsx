import { FC } from 'react';

import { IChatMessage } from '@react/features/ai-chat';
import {
  ReplyLoader,
  SystemMessage,
  ThinkingMessage,
  UserMessage,
} from '@react/features/ai-chat/components';

import '../styles/index.css';

interface IChatProps extends IChatMessage {
  scrollToBottom?: () => void; // Callback to scroll chat to bottom
}

/**
 * Chat Component
 * Renders appropriate message component based on message type and state
 *
 * @param props - Chat message properties
 * @returns Appropriate message component
 */
export const Chat: FC<IChatProps> = (props) => {
  const { type, files, avatar, message, onRetryClick, thinkingMessage, scrollToBottom } = props;

  // Loading state (replying/retrying)
  if (type === 'loading') return <ReplyLoader />;

  // Thinking message
  if (type === 'thinking') return <ThinkingMessage message={message} avatar={avatar} />;

  // User message
  if (type === 'user') return <UserMessage message={message} files={files} />;

  // Error message
  if (type === 'error')
    return <SystemMessage isError message={message} onRetryClick={onRetryClick} />;

  // System message (default)
  return (
    <SystemMessage
      avatar={avatar}
      message={message}
      typingAnimation
      thinkingMessage={thinkingMessage}
      onTypingComplete={() => scrollToBottom?.()}
      onTypingProgress={() => scrollToBottom?.()}
    />
  );
};
