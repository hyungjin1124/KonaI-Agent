import React from 'react';
import { PanelLeft, PanelLeftClose, Plus } from 'lucide-react';
import { AgentChatSession } from './mockSessions';
import ConversationSessionItem from './ConversationSessionItem';
import { Button } from '../../../../ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../../../ui/tooltip';
import { ScrollArea } from '../../../../ui/scroll-area';
import { Separator } from '../../../../ui/separator';

interface ConversationSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  sessions: AgentChatSession[];
  activeSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  sessions,
  activeSessionId,
  onSessionSelect,
  onNewChat,
}) => {
  if (isCollapsed) {
    return (
      <div className="h-full shrink-0 w-12 border-r border-gray-200 bg-gray-50/50 flex items-start justify-center pt-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
            >
              <PanelLeft className="w-5 h-5 text-gray-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">대화 목록 열기</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="h-full shrink-0 w-[260px] border-r border-gray-200 bg-gray-50/50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <Button
          variant="ghost"
          onClick={onNewChat}
          className="flex items-center gap-2 px-2 py-1.5 h-auto text-gray-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4 text-gray-500" />
          <span>새 대화</span>
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8"
            >
              <PanelLeftClose className="w-4 h-4 text-gray-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">대화 목록 닫기</TooltipContent>
        </Tooltip>
      </div>

      {/* Section Label */}
      <div className="px-3 py-2">
        <span className="text-xs font-medium text-gray-400">최근 대화</span>
      </div>

      {/* Session List */}
      <ScrollArea className="flex-1 px-2 pb-2">
        <div className="space-y-0.5">
          {sessions.map((session) => (
            <ConversationSessionItem
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
              onClick={() => onSessionSelect(session.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationSidebar;
