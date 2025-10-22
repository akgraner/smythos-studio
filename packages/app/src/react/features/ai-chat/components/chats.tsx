/**
 * Chats Component
 * Displays chat messages with auto-scroll, drag-and-drop, and retry functionality
 */
/* eslint-disable no-unused-vars */
import { IChatMessage } from '@react/features/ai-chat';
import { Chat } from '@react/features/ai-chat/components';
import { useChatContext } from '@react/features/ai-chat/contexts';
import { useDragAndDrop } from '@react/features/ai-chat/hooks';
import { AgentDetails } from '@src/react/shared/types/agent-data.types';
import { FC, MutableRefObject, RefObject, useEffect, useRef } from 'react';

/**
 * Chats component properties
 */
interface MessagesProps {
  /** Agent details for avatar display */
  agent: AgentDetails;

  /** Array of chat messages to display */
  messages: IChatMessage[];

  /** Scroll event handler */
  handleScroll: () => void;

  /** Container ref for scroll control */
  containerRef: RefObject<HTMLElement>;

  /** Smart scroll to bottom function */
  smartScrollToBottom: (smooth?: boolean) => void;

  /** File drop handler for drag-and-drop uploads */
  handleFileDrop: (droppedFiles: File[]) => Promise<void>;
}

/**
 * Combines multiple refs into a single ref callback
 * Useful for managing multiple refs on the same element
 *
 * @param refs - Array of refs to combine
 * @returns Combined ref callback
 */
const combineRefs =
  <T extends HTMLElement>(...refs: Array<RefObject<T> | MutableRefObject<T | null>>) =>
  (element: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return;
      (ref as MutableRefObject<T | null>).current = element;
    });
  };

/**
 * Chats Component
 * Renders chat messages with smart auto-scroll and drag-and-drop support
 */
export const Chats: FC<MessagesProps> = (props) => {
  const { agent, messages, containerRef, handleFileDrop, ...scroll } = props;
  const { handleScroll, smartScrollToBottom } = scroll;

  const ref = useRef<HTMLDivElement>(null);
  const { retryLastMessage } = useChatContext();
  const dropzoneRef = useDragAndDrop({ onDrop: handleFileDrop });

  /**
   * Smart auto-scroll effect
   * Auto-scrolls only for system messages (AI responses), not user messages
   * This ensures better UX - user stays in place when they send a message
   */
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    // ✅ Use type-based discrimination instead of 'me' boolean
    const isSystemMessage = lastMessage.type === 'system';

    if (isSystemMessage) {
      smartScrollToBottom();
    }
  }, [messages, smartScrollToBottom]);

  const avatar = agent?.aiAgentSettings?.avatar;

  return (
    <div
      data-chat-container
      onScroll={handleScroll}
      ref={combineRefs(containerRef, dropzoneRef)}
      className="w-full h-full overflow-auto relative scroll-smooth mt-16 flex justify-center items-center"
    >
      <div
        ref={ref}
        onScroll={handleScroll}
        className="w-full h-full max-w-4xl flex-1 pb-4 space-y-6 px-2.5"
      >
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;

          // ✅ Use type-based discrimination - Only enable retry for error messages that are last
          const canRetry = message.type === 'error' && isLastMessage;
          const onRetryClick = canRetry ? retryLastMessage : undefined;

          return (
            <Chat
              key={index}
              {...message}
              avatar={avatar}
              onRetryClick={onRetryClick}
              scrollToBottom={smartScrollToBottom}
            />
          );
        })}
      </div>
    </div>
  );
};
