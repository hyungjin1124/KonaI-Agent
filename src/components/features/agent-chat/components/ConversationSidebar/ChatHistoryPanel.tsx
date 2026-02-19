import React, { useMemo } from 'react';
import { ScrollArea } from '../../../../ui/scroll-area';
import { AgentChatSession } from './mockSessions';
import { SessionGroup } from './SessionGroup';

interface ChatHistoryPanelProps {
  sessions: AgentChatSession[];
  activeSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
}

export const ChatHistoryPanel: React.FC<ChatHistoryPanelProps> = ({
  sessions,
  activeSessionId,
  onSessionSelect,
}) => {
  const { activeSessions, pastSessions } = useMemo(() => {
    const active: AgentChatSession[] = [];
    const past: AgentChatSession[] = [];

    for (const session of sessions) {
      if (session.status === 'running' || session.status === 'hitl_pending' || session.status === 'completed') {
        active.push(session);
      } else {
        past.push(session);
      }
    }

    return { activeSessions: active, pastSessions: past };
  }, [sessions]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ScrollArea className="flex-1 pt-2 pb-2">
        <div>
          <SessionGroup
            label="실행 중"
            sessions={activeSessions}
            activeSessionId={activeSessionId}
            onSessionSelect={onSessionSelect}
            defaultExpanded={true}
          />

          {activeSessions.length > 0 && pastSessions.length > 0 && (
            <div className="mx-3 my-2 border-t border-gray-200/80" />
          )}

          <SessionGroup
            label="과거 대화"
            sessions={pastSessions}
            activeSessionId={activeSessionId}
            onSessionSelect={onSessionSelect}
            defaultExpanded={true}
            showDate={true}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatHistoryPanel;
