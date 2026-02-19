import React, { useState, useEffect } from 'react';
import { PanelLeft, PanelLeftClose, SquarePen, FolderOpen, MessageSquare, Search } from 'lucide-react';
import { AgentChatSession } from './mockSessions';
import { SidebarMode } from './types';
import { ChatHistoryPanel } from './ChatHistoryPanel';
import { FileDirectoryPanel } from './FileDirectoryPanel';
import { SearchCommandDialog } from './SearchCommandDialog';
import { Button } from '../../../../ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../../../ui/tooltip';
import { Tabs, TabsList, TabsTrigger } from '../../../../ui/tabs';

interface ConversationSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  sessions: AgentChatSession[];
  activeSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onSearch?: () => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  sessions,
  activeSessionId,
  onSessionSelect,
  onNewChat,
}) => {
  const [mode, setMode] = useState<SidebarMode>('chat-history');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchDialog = (
    <SearchCommandDialog
      open={isSearchOpen}
      onOpenChange={setIsSearchOpen}
      sessions={sessions}
      onSessionSelect={(id) => {
        onSessionSelect(id);
        setIsSearchOpen(false);
      }}
    />
  );

  if (isCollapsed) {
    return (
      <>
        <div className="h-full shrink-0 w-12 border-r border-gray-200 bg-gray-50/50 flex flex-col items-center gap-2 pt-3">
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
            <TooltipContent side="right">
              {mode === 'chat-history' ? '대화 목록 열기' : '파일 탐색기 열기'}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNewChat}
              >
                <SquarePen className="w-[18px] h-[18px] text-gray-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">새 작업</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-[18px] h-[18px] text-gray-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">검색</TooltipContent>
          </Tooltip>
        </div>
        {searchDialog}
      </>
    );
  }

  return (
    <>
      <div className="h-full shrink-0 w-[260px] border-r border-gray-200 bg-gray-50/50 flex flex-col overflow-hidden">
        {/* Header Row 1 — actions + collapse */}
        <div className="flex items-center gap-1 px-1.5 py-1.5 border-b border-gray-200">
          {/* New Chat */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNewChat}
                className="h-8 w-8 shrink-0"
              >
                <SquarePen className="w-4 h-4 text-gray-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">새 작업</TooltipContent>
          </Tooltip>

          {/* Search */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="h-8 w-8 shrink-0"
              >
                <Search className="w-4 h-4 text-gray-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">검색</TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          {/* Collapse */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="h-8 w-8 shrink-0"
              >
                <PanelLeftClose className="w-3.5 h-3.5 text-gray-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">목록 닫기</TooltipContent>
          </Tooltip>
        </div>

        {/* Header Row 2 — mode tabs */}
        <div className="px-1.5 py-1 border-b border-gray-100">
          <Tabs value={mode} onValueChange={(v) => setMode(v as SidebarMode)}>
            <TabsList className="h-8 w-full">
              <TabsTrigger value="file-directory" className="text-xs flex-1 gap-1">
                <FolderOpen className="w-3.5 h-3.5" />
                파일
              </TabsTrigger>
              <TabsTrigger value="chat-history" className="text-xs flex-1 gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                대화
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Mode Content */}
        {mode === 'chat-history' ? (
          <ChatHistoryPanel
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSessionSelect={onSessionSelect}
          />
        ) : (
          <FileDirectoryPanel />
        )}
      </div>
      {searchDialog}
    </>
  );
};

export default ConversationSidebar;
