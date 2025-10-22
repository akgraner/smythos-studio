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
interface IChatsProps {
  agent: AgentDetails; // Agent details for avatar display
  messages: IChatMessage[]; // Array of chat messages to display
  handleScroll: () => void; // Scroll event handler
  containerRef: RefObject<HTMLElement>; // Container ref for scroll control
  smartScrollToBottom: (smooth?: boolean) => void; // Smart scroll to bottom function
  handleFileDrop: (droppedFiles: File[]) => Promise<void>; // File drop handler for drag-and-drop uploads
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
export const Chats: FC<IChatsProps> = (props) => {
  const { agent, messages, containerRef, handleFileDrop, ...scroll } = props;
  const { handleScroll, smartScrollToBottom } = scroll;

  const ref = useRef<HTMLDivElement>(null);
  const { retryLastMessage } = useChatContext();
  const dropzoneRef = useDragAndDrop({ onDrop: handleFileDrop });

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
        className="w-full h-full max-w-4xl flex-1 pb-4 space-y-2.5 px-2.5"
      >
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
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
