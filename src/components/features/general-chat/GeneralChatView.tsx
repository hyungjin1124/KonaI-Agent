import React, { useState, useCallback, useRef } from 'react';
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
  FILE_TREE_DRAG_MIME_TYPE,
} from '../agent-chat/types';
import { ArtifactPanelProvider, useArtifactPanel } from '../agent-chat/context/ArtifactPanelContext';
import { ArtifactPreviewPanel } from '../agent-chat/components/ArtifactPreviewPanel/ArtifactPreviewPanel';
import { ConversationSidebar, MOCK_AGENT_SESSIONS } from '../agent-chat/components/ConversationSidebar';
import { AttachedFileChip } from '../agent-chat/components/ChatInputArea/AttachedFileChip';
import { DropZoneOverlay } from '../agent-chat/components/ChatInputArea/DropZoneOverlay';
import { ChatPanel } from './components/ChatPanel';
import { ChatMessage } from './types';
import { useNLChart, NLChartRenderer } from '../nl-chart';
import { ModelSwitcher } from '../model-switcher';
import { DEFAULT_MODEL_ID } from '@/constants/models';

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    setAttachedFile(null);
    clearChart();
    setIsCenterPanelOpen(false);
    setChartArtifacts([]);
  }, [clearChart]);

  const handleSessionSelect = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    setMessages([]);
    setAttachedFile(null);
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

  const handleSend = useCallback(() => {
    if (!inputValue.trim() && !attachedFile) return;
    if (isLoading) return;

    const content = attachedFile
      ? `${inputValue.trim() ? inputValue.trim() + '\n\n' : ''}📎 ${attachedFile.name}`
      : inputValue.trim();

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setAttachedFile(null);
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
  }, [inputValue, isLoading, attachedFile, processQuery]);

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

  // Drag & Drop handlers (counter-based flicker prevention)
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    // File tree item drag
    const fileTreeDataStr = e.dataTransfer.getData(FILE_TREE_DRAG_MIME_TYPE);
    if (fileTreeDataStr) {
      try {
        const data = JSON.parse(fileTreeDataStr) as { id: string; name: string; extension: string };
        setAttachedFile({
          id: `filetree-${Date.now()}`,
          name: data.name,
          type: getFileType(data.name),
          content: '',
          size: 0,
          lastModified: new Date(),
        });
      } catch { /* ignore parse errors */ }
      return;
    }

    // OS native file drop
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setAttachedFile({
        id: `file-${Date.now()}`,
        name: file.name,
        type: getFileType(file.name),
        content: '',
        size: file.size,
        lastModified: new Date(file.lastModified),
      });
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setAttachedFile(null);
  }, []);

  const hasInput = !!(inputValue.trim() || attachedFile);

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
    <div
      className="border-t border-gray-200 bg-white px-4 py-3 relative"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <DropZoneOverlay isVisible={isDragging} />
      <div className="max-w-3xl mx-auto">
        {/* Model Switcher + Attached File */}
        {(selectedModelId || attachedFile) && (
          <div className="flex items-center gap-2 mb-2">
            <ModelSwitcher
              value={selectedModelId}
              onValueChange={setSelectedModelId}
              className="w-[200px]"
            />
            {attachedFile && (
              <AttachedFileChip file={attachedFile} onRemove={handleRemoveFile} />
            )}
          </div>
        )}
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
              disabled={!hasInput || isLoading}
              className={`p-2 rounded-lg transition-all ${
                hasInput && !isLoading
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
