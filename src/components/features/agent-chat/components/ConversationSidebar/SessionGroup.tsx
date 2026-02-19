import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { AgentChatSession } from './mockSessions';
import ConversationSessionItem from './ConversationSessionItem';

interface SessionGroupProps {
  label: string;
  sessions: AgentChatSession[];
  activeSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  defaultExpanded?: boolean;
  showDate?: boolean;
}

export const SessionGroup: React.FC<SessionGroupProps> = ({
  label,
  sessions,
  activeSessionId,
  onSessionSelect,
  defaultExpanded = true,
  showDate = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (sessions.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center gap-1.5 px-3 py-1.5 group"
      >
        {isExpanded
          ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        }
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex-1 text-left">
          {label}
        </span>
        <span className="text-[10px] font-medium text-gray-300 tabular-nums bg-gray-100 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
          {sessions.length}
        </span>
      </button>
      {isExpanded && (
        <div className="space-y-0.5 px-1.5">
          {sessions.map((session) => (
            <ConversationSessionItem
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
              onClick={() => onSessionSelect(session.id)}
              showDate={showDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionGroup;
