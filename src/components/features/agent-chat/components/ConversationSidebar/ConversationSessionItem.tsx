import React from 'react';
import { AgentChatSession } from './mockSessions';

interface ConversationSessionItemProps {
  session: AgentChatSession;
  isActive: boolean;
  onClick: () => void;
}

const statusConfig: Record<string, { dot: string; label: string }> = {
  running:      { dot: 'bg-blue-500 animate-pulse', label: '진행 중' },
  hitl_pending: { dot: 'bg-orange-500',              label: 'HITL 대기' },
};

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

export const ConversationSessionItem: React.FC<ConversationSessionItemProps> = ({
  session,
  isActive,
  onClick,
}) => {
  const status = session.status;
  const config = status ? statusConfig[status] : null;
  const dayOfWeek = dayNames[new Date(session.date).getDay()];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2.5 py-2 rounded-lg transition-all group ${
        isActive
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
      title={session.title}
    >
      <div className="flex items-center gap-1.5">
        {config && (
          <span
            className={`shrink-0 w-2 h-2 rounded-full ${config.dot}`}
            title={config.label}
          />
        )}
        <span className="text-sm truncate leading-snug font-medium">
          {session.title}
        </span>
      </div>
      <div className="text-[10px] text-gray-400 mt-0.5">
        <span>{session.date} ({dayOfWeek})</span>
      </div>
    </button>
  );
};

export default ConversationSessionItem;
