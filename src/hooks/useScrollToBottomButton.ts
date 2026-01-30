import { useState, useEffect, useCallback, useRef, RefObject } from 'react';

interface UseScrollToBottomButtonOptions {
  /** Ref to the scrollable container */
  containerRef: RefObject<HTMLElement>;
  /** Distance from bottom to consider "at bottom" (default: 100) */
  threshold?: number;
  /** Current message count to track new messages */
  messageCount: number;
}

interface UseScrollToBottomButtonReturn {
  /** Whether the button should be visible */
  isVisible: boolean;
  /** Count of unread/new messages */
  unreadCount: number;
  /** Handler to scroll to bottom and reset state */
  scrollToBottom: () => void;
  /** Whether user is currently at bottom */
  isAtBottom: boolean;
}

/**
 * Hook to manage scroll-to-bottom button visibility and state
 * Shows a button when user scrolls up and new messages arrive
 */
export function useScrollToBottomButton({
  containerRef,
  threshold = 100,
  messageCount
}: UseScrollToBottomButtonOptions): UseScrollToBottomButtonReturn {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousMessageCount = useRef(messageCount);
  const isInitialMount = useRef(true);

  // Check if user is at bottom of scroll container
  const checkScrollPosition = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const atBottom = distanceFromBottom <= threshold;

    setIsAtBottom(atBottom);

    // Reset unread count when user scrolls to bottom
    if (atBottom) {
      setUnreadCount(0);
    }
  }, [containerRef, threshold]);

  // Scroll event listener
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Initial check
    checkScrollPosition();

    element.addEventListener('scroll', checkScrollPosition, { passive: true });
    return () => element.removeEventListener('scroll', checkScrollPosition);
  }, [containerRef, checkScrollPosition]);

  // Detect new messages when not at bottom
  useEffect(() => {
    // Skip initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousMessageCount.current = messageCount;
      return;
    }

    const newMessages = messageCount - previousMessageCount.current;

    if (!isAtBottom && newMessages > 0) {
      setUnreadCount(prev => prev + newMessages);
    }

    previousMessageCount.current = messageCount;
  }, [messageCount, isAtBottom]);

  // Scroll to bottom handler
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setUnreadCount(0);
      setIsAtBottom(true);
    }
  }, [containerRef]);

  return {
    isVisible: !isAtBottom,
    unreadCount,
    scrollToBottom,
    isAtBottom
  };
}
