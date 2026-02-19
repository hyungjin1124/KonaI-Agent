import React from 'react';
import { Loader2 } from 'lucide-react';
import { AgentChatSession } from './mockSessions';

interface ConversationSessionItemProps {
  session: AgentChatSession;
  isActive: boolean;
  onClick: () => void;
  showDate?: boolean;
}

const statusConfig: Record<string, { type: 'dot' | 'spinner'; color: string; label: string }> = {
  running:      { type: 'spinner', color: 'text-blue-500', label: '진행 중' },
  hitl_pending: { type: 'dot',     color: 'bg-orange-500',  label: 'HITL 대기' },
  completed:    { type: 'dot',     color: 'bg-green-500',   label: '완료' },
};

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

export const ConversationSessionItem: React.FC<ConversationSessionItemProps> = ({
  session,
  isActive,
  onClick,
  showDate = true,
}) => {
  const status = session.status;
  const config = status ? statusConfig[status] : null;
  const dayOfWeek = dayNames[new Date(session.date).getDay()];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-all group ${
        isActive
          ? 'bg-gray-200/80 text-gray-900'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
      title={session.title}
    >
      <div className="flex items-center gap-1.5">
        {config && config.type === 'spinner' && (
          <span title={config.label} className="shrink-0 flex items-center">
            <Loader2 className={`w-3 h-3 animate-spin ${config.color}`} />
          </span>
        )}
        {config && config.type === 'dot' && (
          <span
            className={`shrink-0 w-2 h-2 rounded-full ${config.color}`}
            title={config.label}
          />
        )}
        <span className="text-[13px] truncate leading-snug font-medium">
          {session.title}
        </span>
      </div>
      {showDate && (
        <div className="text-[10px] text-gray-400 mt-0.5">
          {session.date} ({dayOfWeek})
        </div>
      )}
    </button>
  );
};

export default ConversationSessionItem;
