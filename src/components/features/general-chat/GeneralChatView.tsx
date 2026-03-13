import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, ArrowUp } from '../../icons';
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
import { AttachedFileChip } from '../agent-chat/components/ChatInputArea/AttachedFileChip';
import { DropZoneOverlay } from '../agent-chat/components/ChatInputArea/DropZoneOverlay';
import { ChatPanel } from './components/ChatPanel';
import { UnifiedChatInput } from './components/UnifiedChatInput';
import { LeftSidebar } from './components/LeftSidebar/LeftSidebar';
import { ChatMessage, ChatSession } from './types';
import { useBranching } from './hooks/useBranching';
import { useNLChart, NLChartRenderer, NLDashboardRenderer, isDashboardQuery } from '../nl-chart';
import { ModelSwitcher } from '../model-switcher';
import { DEFAULT_MODEL_ID } from '@/constants/models';
import { useToast } from '@/context/ToastContext';

const MOCK_SESSIONS: ChatSession[] = [
  { id: 's1', title: 'Q4 경영 실적 분석', preview: '최근 실적 데이터를 요약...', createdAt: new Date('2025-12-28'), updatedAt: new Date('2025-12-28'), messageCount: 8 },
  { id: 's2', title: 'DID 사업부 원가 진단', preview: '원가 효율성 관련 분석...', createdAt: new Date('2025-12-27'), updatedAt: new Date('2025-12-27'), messageCount: 12 },
  { id: 's3', title: '일본 지사 환율 리스크', preview: '환율 변동 대응 전략...', createdAt: new Date('2025-12-26'), updatedAt: new Date('2025-12-26'), messageCount: 5 },
  { id: 's4', title: '신규 플랫폼 기획', preview: '새 서비스 아이디어 정리...', createdAt: new Date('2025-12-20'), updatedAt: new Date('2025-12-20'), messageCount: 24 },
  { id: 's5', title: '12월 매출 심층 분석', preview: '월별 추이를 보면...', createdAt: new Date('2025-12-15'), updatedAt: new Date('2025-12-15'), messageCount: 6 },
];

const getFileType = (filename: string): AttachedFile['type'] => {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.md')) return 'markdown';
  if (lower.endsWith('.txt')) return 'text';
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.docx')) return 'docx';
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'xlsx';
  if (lower.endsWith('.csv')) return 'csv';
  if (lower.endsWith('.pptx') || lower.endsWith('.ppt')) return 'pptx';
  return 'other';
};

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
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Toast for file validation errors
  const { showToast } = useToast();

  // Branching
  const {
    branches,
    activeBranchId,
    activeMessages: messages,
    createBranch,
    switchBranch,
    deleteBranch,
    addMessage,
    getBranchesAtMessage,
    resetBranching,
  } = useBranching();

  // File attachment state (drag from file tree)
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  // Right sidebar state (expanded by default)
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<SidebarSection[]>([
    'progress',
    'artifacts',
  ]);

  // NL-to-Chart + Dashboard
  const {
    chartResult, processQuery, changeChartType, clearChart,
    dashboardResult, processDashboardQuery, changeWidgetChartType, clearDashboard,
  } = useNLChart();
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

  // Keyboard shortcuts for branching
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Ctrl+Shift+B — create branch from last assistant message
      if (e.ctrlKey && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        const lastMsg = [...messages].reverse().find((m) => m.type === 'assistant');
        if (lastMsg) createBranch(lastMsg.id);
        return;
      }
      // Ctrl+[ — switch to previous branch
      if (e.ctrlKey && e.key === '[') {
        e.preventDefault();
        const idx = branches.findIndex((b) => b.id === activeBranchId);
        if (idx > 0) switchBranch(branches[idx - 1].id);
        return;
      }
      // Ctrl+] — switch to next branch
      if (e.ctrlKey && e.key === ']') {
        e.preventDefault();
        const idx = branches.findIndex((b) => b.id === activeBranchId);
        if (idx < branches.length - 1) switchBranch(branches[idx + 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [messages, branches, activeBranchId, createBranch, switchBranch]);

  // Handlers
  const handleNewChat = useCallback(() => {
    setActiveSessionId(null);
    resetBranching();
    setInputValue('');
    clearChart();
    clearDashboard();
    setIsCenterPanelOpen(false);
    setChartArtifacts([]);
  }, [clearChart, clearDashboard, resetBranching]);

  const handleSessionSelect = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    resetBranching();
    setAttachedFile(null);
    clearChart();
    clearDashboard();
    setIsCenterPanelOpen(false);
    setChartArtifacts([]);
  }, [clearChart, clearDashboard, resetBranching]);

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

    addMessage(userMessage);
    setInputValue('');
    setIsLoading(true);

    // Try Dashboard query first, then single chart
    if (isDashboardQuery(content)) {
      clearChart(); // Clear previous chart to prevent state masking
      const dashResult = processDashboardQuery(content);
      if (dashResult) {
        const dashArtifact: Artifact = {
          id: `dashboard-${Date.now()}`,
          title: dashResult.dashboardConfig.title,
          type: 'chart',
          createdAt: new Date(),
          messageId: userMessage.id,
        };

        setChartArtifacts((prev) => [...prev, dashArtifact]);

        setTimeout(() => {
          const assistantMessage: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            type: 'assistant',
            content: `📊 **${dashResult.dashboardConfig.title}**\n\n${dashResult.reasoning}\n\n대시보드 패널에서 ${dashResult.dashboardConfig.widgets.length}개 위젯을 확인하세요.`,
            timestamp: new Date(),
          };
          addMessage(assistantMessage);
          setIsLoading(false);

          artifactPanelRef.current?.openArtifactTab(dashArtifact, 'dashboard');
          setIsCenterPanelOpen(true);
        }, 1000);

        return;
      }
    }

    // Try NL-to-Chart
    clearDashboard(); // Clear previous dashboard to prevent state masking
    const result = processQuery(content);

    if (result) {
      const chartArtifact: Artifact = {
        id: `chart-${Date.now()}`,
        title: result.config.title,
        type: 'chart',
        createdAt: new Date(),
        messageId: userMessage.id,
      };

      setChartArtifacts((prev) => [...prev, chartArtifact]);

      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          type: 'assistant',
          content: `📊 **${result.config.title}**\n\n${result.reasoning}\n\n차트 패널에서 결과를 확인하세요. 차트 상단에서 다른 차트 유형으로 변경할 수 있습니다.`,
          timestamp: new Date(),
        };
        addMessage(assistantMessage);
        setIsLoading(false);

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
            '안녕하세요! 질문에 대해 분석을 시작하겠습니다. 잠시만 기다려 주세요.\n\n현재 데모 모드로 실행 중입니다. 실제 AI 응답은 백엔드 연동 후 제공됩니다.\n\n💡 **팁**: "월별 매출 추이 보여줘", "사업부별 비교 차트" 같은 데이터 분석 질문을 입력하면 차트를 자동 생성합니다.\n\n📋 **대시보드**: "종합 현황 대시보드", "심층 분석 대시보드" 같은 질문으로 멀티 위젯 대시보드를 생성할 수 있습니다.',
          timestamp: new Date(),
        };
        addMessage(assistantMessage);
        setIsLoading(false);
      }, 1500);
    }
  }, [inputValue, isLoading, attachedFile, processQuery, processDashboardQuery, clearChart, clearDashboard, addMessage]);

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
      <LeftSidebar
        isCollapsed={isLeftSidebarCollapsed}
        onToggleCollapse={handleToggleLeftSidebar}
        sessions={MOCK_SESSIONS}
        activeSessionId={activeSessionId}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
        branches={branches}
        activeBranchId={activeBranchId}
        onSwitchBranch={switchBranch}
        onDeleteBranch={deleteBranch}
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
          onCreateBranch={createBranch}
          onSwitchBranch={switchBranch}
          onDeleteBranch={deleteBranch}
          getBranchesAtMessage={getBranchesAtMessage}
          activeBranchId={activeBranchId}
        />
      </div>
    </div>
  );

  // Center Panel (Artifact Preview for charts/dashboards)
  const dashboardComponent = dashboardResult ? (
    <NLDashboardRenderer
      dashboardConfig={dashboardResult.dashboardConfig}
      onChangeWidgetChartType={changeWidgetChartType}
    />
  ) : chartResult ? (
    <NLChartRenderer
      result={chartResult}
      onChangeChartType={changeChartType}
    />
  ) : undefined;

  const centerPanelContent = isCenterPanelOpen ? (
    <ArtifactPreviewPanel
      onClose={handleCloseCenterPanel}
      dashboardRendererProps={{
        dashboardComponent,
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
        const previewType: ArtifactPreviewType = artifact.id.startsWith('dashboard-') ? 'dashboard' : 'chart';
        artifactPanelRef.current?.openArtifactTab(artifact, previewType);
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
