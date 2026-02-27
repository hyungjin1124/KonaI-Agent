import React, { useState, useCallback, useRef } from 'react';
import { CoworkLayout } from '../agent-chat/layouts';
import { RightSidebar } from '../agent-chat/components/RightSidebar';
import {
  ProgressTask,
  Artifact,
  ArtifactPreviewType,
  ContextItem,
  SidebarSection,
  AttachedFile,
} from '../agent-chat/types';
import { ArtifactPanelProvider, useArtifactPanel } from '../agent-chat/context/ArtifactPanelContext';
import { ArtifactPreviewPanel } from '../agent-chat/components/ArtifactPreviewPanel/ArtifactPreviewPanel';
import { ConversationSidebar, MOCK_AGENT_SESSIONS } from '../agent-chat/components/ConversationSidebar';
import { ChatPanel } from './components/ChatPanel';
import { UnifiedChatInput } from './components/UnifiedChatInput';
import { ChatMessage } from './types';
import { useNLChart, NLChartRenderer } from '../nl-chart';
import { DEFAULT_MODEL_ID } from '@/constants/models';
import { useToast } from '@/context/ToastContext';

// Bridge pattern: expose ArtifactPanelContext methods via ref
const ArtifactPanelBridge: React.FC<{
  bridgeRef: React.MutableRefObject<{
    openArtifactTab: (artifact: Artifact, previewType: ArtifactPreviewType) => void;
    closePanel: () => void;
  } | null>;
}> = ({ bridgeRef }) => {
  const panel = useArtifactPanel();
  bridgeRef.current = {
    openArtifactTab: panel.openArtifactTab,
    closePanel: panel.closePanel,
  };
  return null;
};

export const GeneralChatView: React.FC = () => {
  // Left sidebar state
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Toast for file validation errors
  const { showToast } = useToast();

  // Right sidebar state (expanded by default)
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<SidebarSection[]>([
    'progress',
    'artifacts',
  ]);

  // NL-to-Chart
  const { chartResult, processQuery, changeChartType, clearChart } = useNLChart();
  const [isCenterPanelOpen, setIsCenterPanelOpen] = useState(false);
  const artifactPanelRef = useRef<{
    openArtifactTab: (artifact: Artifact, previewType: ArtifactPreviewType) => void;
    closePanel: () => void;
  } | null>(null);

  // Model selection
  const [selectedModelId, setSelectedModelId] = useState<string>(DEFAULT_MODEL_ID);

  // Track chart artifacts for sidebar
  const [chartArtifacts, setChartArtifacts] = useState<Artifact[]>([]);

  // Empty state for right sidebar
  const tasks: ProgressTask[] = [];
  const contextItems: ContextItem[] = [];

  // Check if in empty state (no messages)
  const isEmptyState = messages.length === 0 && !isLoading;

  // Handlers
  const handleNewChat = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
    setInputValue('');
    clearChart();
    setIsCenterPanelOpen(false);
    setChartArtifacts([]);
  }, [clearChart]);

  const handleSessionSelect = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    setMessages([]);
    clearChart();
    setIsCenterPanelOpen(false);
    setChartArtifacts([]);
  }, [clearChart]);

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

  const handleCloseCenterPanel = useCallback(() => {
    setIsCenterPanelOpen(false);
    artifactPanelRef.current?.closePanel();
  }, []);

  const handleSend = useCallback((attachedFiles?: AttachedFile[]) => {
    if (!inputValue.trim() && (!attachedFiles || attachedFiles.length === 0)) return;
    if (isLoading) return;

    const fileNames = attachedFiles?.map((f) => f.name).join(', ');
    const content = fileNames
      ? `${inputValue.trim() ? inputValue.trim() + '\n\n' : ''}📎 ${fileNames}`
      : inputValue.trim();

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Try NL-to-Chart first
    const result = processQuery(content);

    if (result) {
      // Chart query detected — generate chart artifact
      const chartArtifact: Artifact = {
        id: `chart-${Date.now()}`,
        title: result.config.title,
        type: 'chart',
        createdAt: new Date(),
        messageId: userMessage.id,
      };

      setChartArtifacts((prev) => [...prev, chartArtifact]);

      // Simulate processing delay
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          type: 'assistant',
          content: `📊 **${result.config.title}**\n\n${result.reasoning}\n\n차트 패널에서 결과를 확인하세요. 차트 상단에서 다른 차트 유형으로 변경할 수 있습니다.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);

        // Open chart in artifact panel
        artifactPanelRef.current?.openArtifactTab(chartArtifact, 'chart');
        setIsCenterPanelOpen(true);
      }, 800);
    } else {
      // Non-chart query — standard response
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          type: 'assistant',
          content:
            '안녕하세요! 질문에 대해 분석을 시작하겠습니다. 잠시만 기다려 주세요.\n\n현재 데모 모드로 실행 중입니다. 실제 AI 응답은 백엔드 연동 후 제공됩니다.\n\n💡 **팁**: "월별 매출 추이 보여줘", "사업부별 비교 차트" 같은 데이터 분석 질문을 입력하면 차트를 자동 생성합니다.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1500);
    }
  }, [inputValue, isLoading, processQuery]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleValidationError = useCallback((message: string) => {
    showToast({ type: 'error', title: '파일 첨부 오류', message });
  }, [showToast]);

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
          selectedModelId={selectedModelId}
          onModelChange={setSelectedModelId}
          onValidationError={handleValidationError}
        />
      </div>
    </div>
  );

  // Center Panel (Artifact Preview for charts)
  const centerPanelContent = isCenterPanelOpen ? (
    <ArtifactPreviewPanel
      onClose={handleCloseCenterPanel}
      dashboardRendererProps={{
        dashboardComponent: chartResult ? (
          <NLChartRenderer
            result={chartResult}
            onChangeChartType={changeChartType}
          />
        ) : undefined,
      }}
    />
  ) : null;

  // Input Area (only shown when there are messages)
  const inputArea = isEmptyState ? null : (
    <UnifiedChatInput
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onSend={handleSend}
      textareaRef={textareaRef}
      disabled={isLoading}
      showModelSwitcher
      selectedModelId={selectedModelId}
      onModelChange={setSelectedModelId}
      onValidationError={handleValidationError}
    />
  );

  // Right Panel
  const rightPanel = (
    <RightSidebar
      isCollapsed={isRightSidebarCollapsed}
      expandedSections={expandedSections}
      onToggleSection={handleToggleSection}
      onToggleCollapse={handleToggleRightSidebar}
      tasks={tasks}
      artifacts={chartArtifacts}
      selectedArtifactId={undefined}
      onArtifactSelect={(artifact) => {
        artifactPanelRef.current?.openArtifactTab(artifact, 'chart');
        setIsCenterPanelOpen(true);
      }}
      onArtifactDownload={() => {}}
      contextItems={contextItems}
    />
  );

  return (
    <ArtifactPanelProvider
      markdownContents={{}}
      markdownEditingState="idle"
      onPanelOpenChange={(isOpen) => {
        if (!isOpen) setIsCenterPanelOpen(false);
      }}
    >
      <ArtifactPanelBridge bridgeRef={artifactPanelRef} />
      <div className="w-full h-full">
        <CoworkLayout
          leftPanel={leftPanelContent}
          centerPanel={centerPanelContent}
          isCenterPanelOpen={isCenterPanelOpen}
          rightPanel={rightPanel}
          isRightPanelCollapsed={isRightSidebarCollapsed}
          inputArea={inputArea}
        />
      </div>
    </ArtifactPanelProvider>
  );
};

export default GeneralChatView;
