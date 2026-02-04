import React from 'react';
import { ChatSession } from '../../types';

interface ChatSessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onClick: () => void;
}

export const ChatSessionItem: React.FC<ChatSessionItemProps> = ({
  session,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2 py-2 rounded-lg transition-all text-sm truncate ${
        isActive
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
      title={session.title}
    >
      {session.title}
    </button>
  );
};

export default ChatSessionItem;
