import React from 'react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from '../../../../icons';
import { ChatSession } from '../../types';
import ChatSessionItem from './ChatSessionItem';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  sessions,
  activeSessionId,
  onSessionSelect,
  onNewChat,
}) => {
  // Collapsed state
  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-[#FAFAFA] border-r border-gray-200 flex flex-col items-center py-3 gap-3">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
          title="사이드바 펼치기"
        >
          <PanelLeftOpen size={18} />
        </button>
        <button
          onClick={onNewChat}
          className="p-2 rounded-lg bg-[#FF3C42] text-white hover:bg-[#E5363B] transition-colors"
          title="새 작업"
        >
          <Plus size={18} />
        </button>
      </div>
    );
  }

  // Expanded state
  return (
    <div className="w-[180px] h-full bg-[#FAFAFA] border-r border-gray-200 flex flex-col">
      {/* Header - New Task Button */}
      <div className="px-3 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 text-sm font-medium"
          >
            <Plus size={16} className="text-gray-500" />
            <span>새 작업</span>
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
            title="사이드바 접기"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
      </div>

      {/* Section Label */}
      <div className="px-3 py-2">
        <span className="text-xs font-medium text-gray-400">최근 항목</span>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto px-2">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-2">
            <p className="text-xs text-gray-400">작업 기록이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {sessions.map((session) => (
              <ChatSessionItem
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                onClick={() => onSessionSelect(session.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
