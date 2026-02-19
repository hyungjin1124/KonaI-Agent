import React, { useState, useCallback, useRef } from 'react';
import { Plus, ArrowUp } from '../../icons';
import { CoworkLayout } from '../agent-chat/layouts';
import { RightSidebar } from '../agent-chat/components/RightSidebar';
import {
  ProgressTask,
  Artifact,
  ContextItem,
  SidebarSection,
} from '../agent-chat/types';
import { ConversationSidebar, MOCK_AGENT_SESSIONS } from '../agent-chat/components/ConversationSidebar';
import { ChatPanel } from './components/ChatPanel';
import { ChatMessage } from './types';

export const GeneralChatView: React.FC = () => {
  // Left sidebar state
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Right sidebar state (expanded by default)
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<SidebarSection[]>([
    'progress',
    'artifacts',
  ]);

  // Empty state for right sidebar
  const tasks: ProgressTask[] = [];
  const artifacts: Artifact[] = [];
  const contextItems: ContextItem[] = [];

  // Check if in empty state (no messages)
  const isEmptyState = messages.length === 0 && !isLoading;

  // Handlers
  const handleNewChat = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
    setInputValue('');
  }, []);

  const handleSessionSelect = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    setMessages([]);
  }, []);

  const handleToggleLeftSidebar = useCallback(() => {
    setIsLeftSidebarCollapsed((prev) => !prev);
  }, []);

  const handleToggleRightSidebar = useCallback(() => {
    setIsRightSidebarCollapsed((prev) => !prev);
  }, []);

  const handleToggleSection = useCallback((section: SidebarSection) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  }, []);

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        type: 'assistant',
        content:
          '안녕하세요! 질문에 대해 분석을 시작하겠습니다. 잠시만 기다려 주세요.\n\n현재 데모 모드로 실행 중입니다. 실제 AI 응답은 백엔드 연동 후 제공됩니다.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  }, [inputValue, isLoading]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Auto-resize textarea
  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(e.target.value);
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    },
    []
  );

  // Left Panel (Chat History Sidebar + Chat Messages)
  const leftPanelContent = (
    <div className="flex h-full">
      {/* Left Sidebar */}
      <ConversationSidebar
        isCollapsed={isLeftSidebarCollapsed}
        onToggleCollapse={handleToggleLeftSidebar}
        sessions={MOCK_AGENT_SESSIONS}
        activeSessionId={activeSessionId}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
      />
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col bg-[#F7F9FB]">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onSend={handleSend}
        />
      </div>
    </div>
  );

  // Input Area (only shown when there are messages)
  const inputArea = isEmptyState ? null : (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] focus-within:border-[#FF3C42] focus-within:ring-1 focus-within:ring-[#FF3C42] transition-all shadow-sm flex items-end p-2 gap-2">
          {/* Plus Button */}
          <button className="p-2 mb-0.5 text-[#848383] hover:text-[#FF3C42] hover:bg-gray-50 rounded-lg transition-colors">
            <Plus size={20} />
          </button>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="데이터 분석, 보고서 생성, 또는 업무 지시를 입력하세요..."
            rows={1}
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-[#000000] placeholder-[#848383] text-sm font-medium resize-none py-2.5 max-h-[120px] overflow-y-auto leading-relaxed"
          />

          {/* Send Button */}
          <div className="flex items-center gap-1 mb-0.5">
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className={`p-2 rounded-lg transition-all ${
                inputValue.trim() && !isLoading
                  ? 'bg-[#FF3C42] text-white shadow-sm hover:bg-[#E5363B]'
                  : 'bg-gray-100 text-[#848383] cursor-not-allowed'
              }`}
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Right Panel
  const rightPanel = (
    <RightSidebar
      isCollapsed={isRightSidebarCollapsed}
      expandedSections={expandedSections}
      onToggleSection={handleToggleSection}
      onToggleCollapse={handleToggleRightSidebar}
      tasks={tasks}
      artifacts={artifacts}
      selectedArtifactId={undefined}
      onArtifactSelect={() => {}}
      onArtifactDownload={() => {}}
      contextItems={contextItems}
    />
  );

  return (
    <div className="w-full h-full">
      <CoworkLayout
        leftPanel={leftPanelContent}
        centerPanel={null}
        isCenterPanelOpen={false}
        rightPanel={rightPanel}
        isRightPanelCollapsed={isRightSidebarCollapsed}
        inputArea={inputArea}
      />
    </div>
  );
};

export default GeneralChatView;
