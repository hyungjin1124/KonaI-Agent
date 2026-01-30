import React from 'react';
import { ChevronDown } from '../../../icons';

interface ScrollToBottomButtonProps {
  /** Whether the button should be visible */
  isVisible: boolean;
  /** Count of unread/new messages (optional) */
  unreadCount?: number;
  /** Click handler to scroll to bottom */
  onClick: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Floating button that appears when user scrolls up in chat
 * Allows quick navigation back to the latest messages
 */
const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  isVisible,
  unreadCount = 0,
  onClick,
  className = ''
}) => {
  if (!isVisible) return null;

  const hasUnread = unreadCount > 0;
  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <button
      onClick={onClick}
      className={`
        absolute bottom-24 left-1/2 -translate-x-1/2 z-20
        flex items-center gap-2 px-4 py-2.5
        bg-white border border-gray-200 rounded-full
        shadow-lg hover:shadow-xl
        text-gray-700 hover:text-[#FF3C42] hover:border-[#FF3C42]
        transition-all duration-300 animate-fade-in-up
        focus:outline-none focus:ring-2 focus:ring-[#FF3C42] focus:ring-offset-2
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      aria-label={
        hasUnread
          ? `${unreadCount}개의 새 메시지로 스크롤`
          : '최신 메시지로 스크롤'
      }
      aria-live="polite"
      type="button"
    >
      <ChevronDown size={18} />
      <span className="text-sm font-medium">
        {hasUnread ? `${displayCount}개의 새 메시지` : '맨 아래로'}
      </span>
    </button>
  );
};

export default ScrollToBottomButton;
