import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
// NOTE: 아이콘들은 HomeView, ChatInputArea 등 하위 컴포넌트에서 직접 import함
import Dashboard from '../dashboard/Dashboard';
import { SampleInterfaceContext, PPTConfig } from '../../../types';
import { SlideItem, Artifact, ArtifactPreviewType, RightPanelType, ProgressTask, ContextItem, SidebarSection, ArtifactPreviewState, CenterPanelState, AttachedFile, Citation } from './types';
import { useCaptureStateInjection, StateInjectionHandlers, useScrollToBottomButton, useSlideOutlineHITL } from '../../../hooks';
import { AnomalyResponse, DefaultResponse, PPTDoneResponse, SalesAnalysisDoneResponse, MultiAgentDoneResponse } from './components/AgentResponse';
import PPTScenarioRenderer, { ActiveHitl } from './components/PPTScenarioRenderer';
import { SLIDE_OUTLINE_CONTENTS, type SlideFile, CONSOLIDATED_SLIDE_FILE, CONSOLIDATED_SLIDE_OUTLINE_CONTENT, SLIDE_OUTLINE_SECTION_COUNT } from './components/ToolCall/constants';
import SalesAnalysisScenarioRenderer from './components/SalesAnalysisScenarioRenderer';
import { CoworkLayout } from './layouts';
import { RightSidebar } from './components/RightSidebar';
import { ArtifactPreviewPanel } from './components/ArtifactPreviewPanel';
import { ChatInputArea } from './components/ChatInputArea';
import { generateMockModifiedMarkdown } from './utils/markdownUtils';
import ChatHistoryPanel, { ChatMessage } from './components/ChatHistoryPanel';
import { ConversationSidebar, MOCK_AGENT_SESSIONS } from './components/ConversationSidebar';
import { ArtifactPanelProvider, useArtifactPanel } from './context/ArtifactPanelContext';
import { ArtifactLibraryProvider } from './context/ArtifactLibraryContext';
import { ArtifactAutoSaveBridge } from './components/ArtifactLibrary/ArtifactAutoSaveBridge';
import { useNLChart, NLChartRenderer } from '../nl-chart';
import { MultiAgentScenarioRenderer } from '../multi-agent';
import { extractGenerativeUIFromMessage } from '../generative-ui';
import type { GenerativeUISpec } from '../generative-ui';

// Re-export ChatMessage for external use
export type { ChatMessage };

// Bridge: Context 메서드를 ref로 노출 (콜백에서 접근 가능하게)
const ArtifactPanelBridge: React.FC<{
  bridgeRef: React.MutableRefObject<{
    openArtifactTab: (artifact: Artifact, previewType: ArtifactPreviewType) => void;
    openTab: (tab: { id: string; artifact: Artifact | null; previewType: ArtifactPreviewType; title: string }) => void;
    closePanel: () => void;
  } | null>;
}> = ({ bridgeRef }) => {
  const panel = useArtifactPanel();
  bridgeRef.current = {
    openArtifactTab: panel.openArtifactTab,
    openTab: panel.openTab,
    closePanel: panel.closePanel,
  };
  return null;
};

const AgentChatView: React.FC<{ initialQuery?: string; initialContext?: SampleInterfaceContext; onNavigateToChat?: () => void }> = ({
  initialQuery,
  initialContext,
  onNavigateToChat,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showDashboard, setShowDashboard] = useState(!!initialQuery);
  const [userQuery, setUserQuery] = useState(initialQuery || '');
  const [dashboardType, setDashboardType] = useState<'financial' | 'did' | 'ppt'>('financial');

  const [dashboardScenario, setDashboardScenario] = useState<string | undefined>(undefined);

  // 시나리오 완료 상태 추적
  const [salesAnalysisComplete, setSalesAnalysisComplete] = useState(false);
  const [anomalyDetectionComplete, setAnomalyDetectionComplete] = useState(false);
  const [multiAgentComplete, setMultiAgentComplete] = useState(false);

  // 대화 히스토리 상태
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Context state
  const [contextData, setContextData] = useState<SampleInterfaceContext | null>(initialContext || null);
  
  // --- PPT Generation State ---
  const [pptStatus, setPptStatus] = useState<'idle' | 'setup' | 'generating' | 'done'>('idle');
  const [pptProgress, setPptProgress] = useState(0);
  const [pptCurrentStage, setPptCurrentStage] = useState(0);
  const [pptConfig, setPptConfig] = useState<PPTConfig>({
    theme: 'Corporate Blue',
    tone: 'Data-driven',
    topics: ['Executive Summary', 'Q4 Revenue Overview'],
    titleFont: 'Pretendard',
    bodyFont: 'Pretendard',
    slideCount: 15
  });

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitialQuery = useRef(false);

  // ArtifactPanel Context 메서드 참조 (콜백에서 사용)
  const artifactPanelRef = useRef<{
    openArtifactTab: (artifact: Artifact, previewType: ArtifactPreviewType) => void;
    openTab: (tab: { id: string; artifact: Artifact | null; previewType: ArtifactPreviewType; title: string }) => void;
    closePanel: () => void;
  } | null>(null);

  // --- 좌측 대화 히스토리 사이드바 상태 ---
  const [isConversationSidebarOpen, setIsConversationSidebarOpen] = useState(true);

  // --- 우측 패널 상태 ---
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(60); // 퍼센트 단위 (PPT/Dashboard용)
  const [isResizing, setIsResizing] = useState(false);
  const MIN_PANEL_WIDTH = 25; // 최소 25%
  const MAX_PANEL_WIDTH = 70; // 최대 70%

  // --- PPT Slides 상태 (패널 접기/펼치기에도 유지) ---
  const [pptSlides, setPptSlides] = useState<SlideItem[]>([]);

  // --- 슬라이드 생성 상태 (좌우 패널 동기화용) ---
  const [slideGenerationState, setSlideGenerationState] = useState<{
    currentSlide: number;
    completedSlides: number[];
    totalSlides: number;
  }>({
    currentSlide: 0,
    completedSlides: [],
    totalSlides: 0
  });

  // --- 슬라이드 생성 완료 상태 (PPTGenPanel → PPTScenarioRenderer 동기화) ---
  const [isSlideGenerationComplete, setIsSlideGenerationComplete] = useState(false);

  // --- 매출 분석 시각화 완료 상태 (Skeleton 제어용) ---
  const [isVisualizationComplete, setIsVisualizationComplete] = useState(false);

  // --- 아티팩트 상태 ---
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const artifactsRef = useRef<Artifact[]>([]); // stale closure 방지용 ref
  artifactsRef.current = artifacts;
  const [rightPanelType, setRightPanelType] = useState<RightPanelType>('dashboard');

  // --- 마크다운 콘텐츠 상태 (artifact ID → content 매핑) ---
  const [markdownContents, setMarkdownContents] = useState<Record<string, string>>({});

  // --- Cowork Layout 상태 (Claude Cowork 스타일) ---
  const [sidebarExpandedSections, setSidebarExpandedSections] = useState<SidebarSection[]>(['progress', 'artifacts', 'context']);
  const [progressTasks, setProgressTasks] = useState<ProgressTask[]>([]);
  const [contextItems, setContextItems] = useState<ContextItem[]>([]);

  // 수정 3: HITL 플로팅 패널 상태
  const [activeHitl, setActiveHitl] = useState<ActiveHitl | null>(null);
  const [hitlResumeCallback, setHitlResumeCallback] = useState<((stepId: string, selectedOption: string) => void) | null>(null);
  const [themeFontCompleteCallback, setThemeFontCompleteCallback] = useState<(() => void) | null>(null);
  const [slidePlanningCompleteCallback, setSlidePlanningCompleteCallback] = useState<(() => void) | null>(null);
  const [generatedFileCount, setGeneratedFileCount] = useState(0);
  const generatedFileIdsRef = useRef<Set<string>>(new Set());
  const slidePlanningTimersRef = useRef<NodeJS.Timeout[]>([]);
  const [isOutlineRevisionMode, setIsOutlineRevisionMode] = useState(false);
  const [revisionApprovalPending, setRevisionApprovalPending] = useState(false);
  const [markdownEditingState, setMarkdownEditingState] = useState<'idle' | 'editing' | 'shimmer'>('idle');
  const revisionTimersRef = useRef<NodeJS.Timeout[]>([]);
  const [artifactPreview, setArtifactPreview] = useState<ArtifactPreviewState>({
    isOpen: false,
    selectedArtifact: null,
    previewType: null,
  });
  // Document Viewer용 바이너리 데이터 (PDF/DOCX/XLSX/PPTX)
  const [documentData, setDocumentData] = useState<ArrayBuffer | undefined>(undefined);
  // CSV 텍스트 콘텐츠
  const [csvContent, setCsvContent] = useState<string | undefined>(undefined);

  // 수정 2: 가운데 패널 상태 (Artifact Preview 독립 제어)
  const [centerPanelState, setCenterPanelState] = useState<CenterPanelState>({
    isOpen: false,
    content: null,
  });

  // NL-to-Chart
  const { chartResult, processQuery: processChartQuery, changeChartType, clearChart } = useNLChart();

  // Generative UI specs (탭 ID → spec 매핑)
  const [generativeUISpecs, setGenerativeUISpecs] = useState<Record<string, import('../generative-ui').GenerativeUISpec>>({});

  // --- 아티팩트 열기/닫기 시 사이드 패널 자동 숨김/복원 ---
  const savedSidePanelStateRef = useRef<{
    isConversationSidebarOpen: boolean;
    isRightPanelCollapsed: boolean;
  } | null>(null);
  const prevCenterPanelOpenRef = useRef(false);
  const conversationSidebarOpenRef = useRef(isConversationSidebarOpen);
  conversationSidebarOpenRef.current = isConversationSidebarOpen;
  const rightPanelCollapsedRef = useRef(isRightPanelCollapsed);
  rightPanelCollapsedRef.current = isRightPanelCollapsed;

  useEffect(() => {
    const isCenterOpen = centerPanelState.isOpen || artifactPreview.isOpen;
    const wasOpen = prevCenterPanelOpenRef.current;

    if (isCenterOpen && !wasOpen) {
      // 센터 패널 열림: 현재 상태 저장 후 사이드 패널 닫기
      savedSidePanelStateRef.current = {
        isConversationSidebarOpen: conversationSidebarOpenRef.current,
        isRightPanelCollapsed: rightPanelCollapsedRef.current,
      };
      setIsConversationSidebarOpen(false);
      setIsRightPanelCollapsed(true);
    } else if (!isCenterOpen && wasOpen) {
      // 센터 패널 닫힘: 저장된 상태로 복원
      if (savedSidePanelStateRef.current) {
        setIsConversationSidebarOpen(savedSidePanelStateRef.current.isConversationSidebarOpen);
        setIsRightPanelCollapsed(savedSidePanelStateRef.current.isRightPanelCollapsed);
        savedSidePanelStateRef.current = null;
      }
    }

    prevCenterPanelOpenRef.current = isCenterOpen;
  }, [centerPanelState.isOpen, artifactPreview.isOpen]);

  // 캡처 자동화용 상태 주입 핸들러
  const stateInjectionHandlers = useMemo<StateInjectionHandlers>(() => ({
    setShowDashboard,
  }), []);

  // 외부 상태 주입 훅 사용 (Puppeteer 캡처 자동화 지원)
  useCaptureStateInjection(stateInjectionHandlers);

  // Scroll to bottom button hook
  const { isVisible: showScrollButton, unreadCount, scrollToBottom, isAtBottom } = useScrollToBottomButton({
    containerRef: leftPanelRef,
    threshold: 100,
    messageCount: chatHistory.length
  });

  // --- Slide Outline HITL 훅 ---
  // 모든 슬라이드 승인 완료 핸들러 (PPT 생성 단계로 전환)
  const handleSlideOutlineAllApproved = useCallback(() => {
    // 슬라이드 개요 검토 완료 - PPT 생성 패널로 전환
    artifactPanelRef.current?.openTab({
      id: 'ppt-gen',
      artifact: null,
      previewType: 'ppt',
      title: 'PPT 생성',
    });
    setCenterPanelState({ isOpen: true, content: 'ppt-preview' });
  }, []);

  const slideOutlineHITL = useSlideOutlineHITL({
    onAllApproved: handleSlideOutlineAllApproved,
  });

  // 슬라이드 개요 검토 시작 핸들러 (PPTScenarioRenderer에서 호출)
  const handleSlideOutlineReviewStart = useCallback(() => {
    slideOutlineHITL.initializeDeck();
    // 첫 번째 마크다운 아티팩트를 선택하여 MarkdownPreviewPanel로 표시
    // artifactsRef 사용: usePPTScenario 타이머 체인의 stale closure 방지
    const firstMdArtifact = artifactsRef.current.find(a => a.type === 'markdown');
    if (firstMdArtifact) {
      artifactPanelRef.current?.openArtifactTab(firstMdArtifact, 'markdown');
      setArtifactPreview({
        isOpen: true,
        selectedArtifact: firstMdArtifact,
        previewType: 'markdown',
        markdownMode: 'read',
      });
    }
    setCenterPanelState({ isOpen: true, content: 'markdown-preview' });
  }, [slideOutlineHITL.initializeDeck]);

  // 슬라이드 개요 수정 모드 진입 핸들러 ("수정 필요" 클릭 시)
  const handleEnterRevisionMode = useCallback((outlineId: string) => {
    setIsOutlineRevisionMode(true);

    // 에이전트 안내 메시지를 채팅에 추가
    const guideMessage: ChatMessage = {
      id: `agent-revision-${Date.now()}`,
      type: 'agent',
      content: '해당 슬라이드에 수정이 필요하시군요. 수정할 파일을 첨부하고 요청 사항을 입력해 주세요. 직접 편집기에서 수정하실 수도 있습니다. 수정이 완료되면 "슬라이드 생성"이라고 입력해 주세요.',
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, guideMessage]);
  }, []);

  // PPT 생성 핸들러 (슬라이드 개요 모두 승인 후 호출)
  const handleGeneratePPTFromOutline = useCallback(() => {
    // 슬라이드 개요 검토 완료 - PPT 생성 패널로 전환
    artifactPanelRef.current?.openTab({
      id: 'ppt-gen',
      artifact: null,
      previewType: 'ppt',
      title: 'PPT 생성',
    });
    setCenterPanelState({ isOpen: true, content: 'ppt-preview' });
  }, []);

  // 마크다운 파일 생성 콜백 (slide_planning 시작 시 타이머에서 호출)
  const TOTAL_SLIDE_FILES = SLIDE_OUTLINE_SECTION_COUNT;

  const handleMarkdownFileGenerated = useCallback((file: SlideFile) => {
    if (!file?.filename || !file?.title) {
      console.warn('handleMarkdownFileGenerated: Invalid file data', file);
      return;
    }

    const artifactId = `artifact-md-${file.filename}`;

    // 중복 카운트 방지 (타이머 + UI 렌더링 양쪽에서 호출될 수 있음)
    if (generatedFileIdsRef.current.has(artifactId)) return;
    generatedFileIdsRef.current.add(artifactId);

    // 아티팩트 추가
    setArtifacts(prev => {
      if (prev.find(a => a.id === artifactId)) return prev;
      return [...prev, {
        id: artifactId,
        title: file.filename,
        type: 'markdown' as const,
        createdAt: new Date(),
        messageId: chatHistory[chatHistory.length - 1]?.id || `generated-${Date.now()}`,
      }];
    });

    // 상세 콘텐츠 저장 (SLIDE_OUTLINE_CONTENTS에서 가져오기, 없으면 기본 템플릿)
    const detailedContent = SLIDE_OUTLINE_CONTENTS[file.filename]
      || `# ${file.title}\n\n슬라이드 내용을 여기에 작성하세요.`;

    setMarkdownContents(prev => ({
      ...prev,
      [artifactId]: detailedContent
    }));

    // 생성된 파일 수 추적 (슬라이드 계획 완료 판단용)
    setGeneratedFileCount(prev => prev + 1);
  }, [chatHistory]);

  // slide_planning 단계 시작 시 단일 마크다운 파일을 섹션별 스트리밍으로 생성
  const handleSlidePlanningStart = useCallback(() => {
    // 이전 타이머 정리
    slidePlanningTimersRef.current.forEach(t => clearTimeout(t));
    slidePlanningTimersRef.current = [];
    generatedFileIdsRef.current.clear();
    setGeneratedFileCount(0);

    const artifactId = `artifact-md-${CONSOLIDATED_SLIDE_FILE.filename}`;
    const sections = CONSOLIDATED_SLIDE_OUTLINE_CONTENT.split('\n\n---\n\n');

    // 아티팩트 1개 즉시 생성
    setArtifacts(prev => {
      if (prev.find(a => a.id === artifactId)) return prev;
      return [...prev, {
        id: artifactId,
        title: CONSOLIDATED_SLIDE_FILE.filename,
        type: 'markdown' as const,
        createdAt: new Date(),
        messageId: chatHistory[chatHistory.length - 1]?.id || `generated-${Date.now()}`,
      }];
    });

    // 섹션별 스트리밍 (1초 간격으로 콘텐츠 누적)
    let accumulatedContent = '';
    sections.forEach((section, idx) => {
      const timer = setTimeout(() => {
        accumulatedContent += (idx > 0 ? '\n\n---\n\n' : '') + section;
        setMarkdownContents(prev => ({
          ...prev,
          [artifactId]: accumulatedContent,
        }));
        // 섹션 카운트 증가 (기존 완료 판단 로직 재활용)
        setGeneratedFileCount(prev => prev + 1);
      }, (idx + 1) * 1000);
      slidePlanningTimersRef.current.push(timer);
    });
  }, [chatHistory]);

  // 모든 마크다운 파일 생성 완료 시 슬라이드 계획 완료
  useEffect(() => {
    if (generatedFileCount >= TOTAL_SLIDE_FILES && slidePlanningCompleteCallback) {
      slidePlanningCompleteCallback();
      // 리셋 (다음 시나리오를 위해)
      setGeneratedFileCount(0);
      setSlidePlanningCompleteCallback(null);
    }
  }, [generatedFileCount, slidePlanningCompleteCallback]);

  // 마크다운 콘텐츠 변경 핸들러
  const handleMarkdownContentChange = useCallback((artifactId: string, content: string) => {
    setMarkdownContents(prev => ({
      ...prev,
      [artifactId]: content
    }));
  }, []);

  // 마크다운 모드 변경 핸들러
  const handleMarkdownModeChange = useCallback((mode: 'read' | 'edit') => {
    setArtifactPreview(prev => ({
      ...prev,
      markdownMode: mode
    }));
  }, []);

  // Auto-trigger if initialQuery is provided (중복 실행 방지)
  useEffect(() => {
    if (initialQuery && !hasProcessedInitialQuery.current) {
      hasProcessedInitialQuery.current = true;
      // Pass 'true' to skip animation delay for immediate transition
      handleSend(initialQuery, undefined, true);
    }
  }, [initialQuery]);

  // Handle Context Injection
  useEffect(() => {
    if (initialContext) {
        setContextData(initialContext);
        // If context has a scenario, set it
        if (initialContext.scenario) {
            setDashboardScenario(initialContext.scenario);
            // Ensure financial type if generic
            if (!initialContext.type) setDashboardType('financial');
        }
    }
  }, [initialContext]);

  // Unified auto-resize logic for both Landing and Dashboard views
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue, showDashboard]);

  // --- 리사이즈 핸들러 ---
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;

      // 좌측 패널 비율 계산 (마우스 위치 기준)
      const leftPanelPercent = (mouseX / containerWidth) * 100;
      const rightPanelPercent = 100 - leftPanelPercent;

      // 범위 제한
      if (rightPanelPercent >= MIN_PANEL_WIDTH && rightPanelPercent <= MAX_PANEL_WIDTH) {
        setRightPanelWidth(rightPanelPercent);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, MIN_PANEL_WIDTH, MAX_PANEL_WIDTH]);

  const toggleRightPanel = useCallback(() => {
    setIsRightPanelCollapsed(prev => !prev);
  }, []);

  // 아티팩트 패널 열기
  const openArtifactsPanel = useCallback(() => {
    setRightPanelType('artifacts');
    setIsRightPanelCollapsed(false);
  }, []);

  // 아티팩트 다운로드 핸들러
  const handleDownloadArtifact = useCallback((artifact: Artifact) => {
    console.log('Download artifact:', artifact.title);
    // TODO: 실제 다운로드 로직 구현
  }, []);

  const handleScrollToMessage = useCallback((messageId: string) => {
    const container = leftPanelRef.current;
    if (!container) return;
    const el = container.querySelector(`[data-message-id="${messageId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleDownloadAllArtifacts = useCallback(() => {
    console.log('Download all artifacts:', artifacts.length);
    // TODO: 실제 다운로드 로직 구현
  }, [artifacts.length]);

  // 아티팩트 클릭 핸들러 - 해당 타입에 맞는 패널 열기
  const handleArtifactClick = useCallback((artifact: Artifact) => {
    setRightPanelType('dashboard');

    switch (artifact.type) {
      case 'ppt':
        setDashboardType('ppt');
        setIsRightPanelCollapsed(false);
        break;
      case 'chart':
        setDashboardType('financial');
        if (artifact.id.includes('sales')) {
          setDashboardScenario('sales_analysis');
        } else if (artifact.id.includes('anomaly')) {
          setDashboardScenario('anomaly_cost_spike');
        }
        setIsRightPanelCollapsed(false);
        break;
      default:
        console.log('Unsupported artifact type:', artifact.type);
    }
  }, []);

  // 컨텍스트와 함께 우측 패널 열기 (히스토리의 특정 메시지 컨텍스트로 패널 전환)
  const openRightPanelWithContext = useCallback((context: {
    dashboardType: 'financial' | 'did' | 'ppt';
    pptStatus?: 'idle' | 'setup' | 'generating' | 'done';
    dashboardScenario?: string;
  }) => {
    setDashboardType(context.dashboardType);
    if (context.pptStatus !== undefined) setPptStatus(context.pptStatus);
    setDashboardScenario(context.dashboardScenario);
    setIsRightPanelCollapsed(false);
  }, []);

  // PPT progress is now controlled by slide completion callbacks from PPTGenPanel
  const handlePptProgressChange = useCallback((newProgress: number) => {
    setPptProgress(newProgress);
    // Calculate stage based on progress (6 stages total)
    const newStage = Math.min(5, Math.floor(newProgress / 16));
    setPptCurrentStage(newStage);
  }, []);

  const handlePptComplete = useCallback(() => {
    setPptStatus('done');
    setPptProgress(100);
    setPptCurrentStage(5);
    setIsSlideGenerationComplete(true); // PPTScenarioRenderer에 완료 신호 전달
  }, []);

  // 슬라이드 생성 시작 핸들러 (좌우 패널 동기화)
  const handleSlideStart = useCallback((slideId: number, totalSlides: number) => {
    setSlideGenerationState(prev => ({
      ...prev,
      currentSlide: slideId,
      totalSlides
    }));
  }, []);

  // 슬라이드 완료 핸들러 (좌우 패널 동기화)
  const handleSlideComplete = useCallback((slideId: number, totalSlides: number) => {
    setSlideGenerationState(prev => ({
      currentSlide: slideId < totalSlides ? slideId + 1 : slideId,
      completedSlides: [...prev.completedSlides, slideId],
      totalSlides
    }));
  }, []);

  // PPT 완료 시 아티팩트 생성
  useEffect(() => {
    if (pptStatus === 'done' && pptSlides.length > 0) {
      const existingPptArtifact = artifacts.find(a => a.type === 'ppt');
      if (!existingPptArtifact) {
        const pptArtifact: Artifact = {
          id: `artifact-ppt-${Date.now()}`,
          title: 'Q4 2025 경영 실적 보고서',
          type: 'ppt',
          createdAt: new Date(),
          messageId: chatHistory[chatHistory.length - 1]?.id || '',
          fileSize: `${pptSlides.length} slides`,
        };
        setArtifacts(prev => [...prev, pptArtifact]);
      }
    }
  }, [pptStatus, pptSlides.length]);

  // 매출 분석 완료 시 아티팩트 생성
  useEffect(() => {
    if (salesAnalysisComplete) {
      const existingSalesArtifact = artifacts.find(a => a.id.startsWith('artifact-sales-'));
      if (!existingSalesArtifact) {
        const salesArtifact: Artifact = {
          id: `artifact-sales-${Date.now()}`,
          title: '12월 경영 실적 심층 분석',
          type: 'chart',
          createdAt: new Date(),
          messageId: chatHistory[chatHistory.length - 1]?.id || '',
          fileSize: '3 KPI, 2 Charts',
        };
        setArtifacts(prev => [...prev, salesArtifact]);
      }
    }
  }, [salesAnalysisComplete]);

  // 이상 탐지 완료 시 아티팩트 생성
  useEffect(() => {
    if (anomalyDetectionComplete) {
      const existingAnomalyArtifact = artifacts.find(a => a.id.startsWith('artifact-anomaly-'));
      if (!existingAnomalyArtifact) {
        const anomalyArtifact: Artifact = {
          id: `artifact-anomaly-${Date.now()}`,
          title: '원가율 이상 탐지 분석',
          type: 'chart',
          createdAt: new Date(),
          messageId: chatHistory[chatHistory.length - 1]?.id || '',
          fileSize: '1 Chart',
        };
        setArtifacts(prev => [...prev, anomalyArtifact]);
      }
    }
  }, [anomalyDetectionComplete]);

  // useCallback으로 핸들러 최적화
  const handleSend = useCallback((text: string, attachedFile?: AttachedFile, immediate: boolean = false) => {
    if (!showDashboard) {
        setInputValue(text);
    }

    // 수정 모드에서 "슬라이드 생성" 텍스트 감지 → 시나리오 재개
    if (isOutlineRevisionMode && (
      text.includes('슬라이드 생성') || text.includes('PPT 생성')
    )) {
      setIsOutlineRevisionMode(false);
      setRevisionApprovalPending(true);

      // 사용자 메시지 추가
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: text,
        timestamp: new Date(),
      };

      // 에이전트 확인 메시지 추가
      const confirmMessage: ChatMessage = {
        id: `agent-resume-${Date.now()}`,
        type: 'agent',
        content: '수정된 슬라이드 개요가 승인되었습니다. 이제 테마와 폰트를 선택해 주세요.',
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, userMessage, confirmMessage]);

      // 모든 슬라이드 승인 → isAllApproved=true → PPTScenarioRenderer useEffect → completeSlideOutlineReview()
      slideOutlineHITL.approveAll();

      setInputValue('');
      return;
    }

    // 수정 모드에서 텍스트만 입력 (파일 첨부 없음) → 현재 활성 개요 마크다운 수정
    if (isOutlineRevisionMode && !attachedFile) {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: text,
        timestamp: new Date(),
      };
      const revisionAgentMsgId = `agent-revision-response-${Date.now()}`;
      setChatHistory(prev => [...prev, userMessage]);

      // 현재 활성 consolidated 아티팩트의 콘텐츠 가져오기
      const consolidatedArtifactId = `artifact-md-${CONSOLIDATED_SLIDE_FILE.filename}`;
      const currentContent = markdownContents[consolidatedArtifactId] || '';

      if (currentContent) {
        // 3단계 프로그레시브 편집 애니메이션
        revisionTimersRef.current.forEach(t => clearTimeout(t));
        revisionTimersRef.current = [];

        const existingArtifact = artifactsRef.current.find(
          a => a.id === consolidatedArtifactId
        );

        // Phase 1: 패널 오픈 + 편집 상태
        setMarkdownEditingState('editing');
        if (existingArtifact) {
          artifactPanelRef.current?.openArtifactTab(existingArtifact, 'markdown');
          setArtifactPreview({
            isOpen: true,
            selectedArtifact: existingArtifact,
            previewType: 'markdown',
            markdownMode: 'read',
          });
          setCenterPanelState({ isOpen: true, content: 'markdown-preview' });
        }

        // Phase 2 (800ms): shimmer
        const t1 = setTimeout(() => setMarkdownEditingState('shimmer'), 800);
        revisionTimersRef.current.push(t1);

        // Phase 3 (1800ms): 수정 적용
        const t2 = setTimeout(() => {
          const modifiedContent = generateMockModifiedMarkdown(currentContent, text);

          setMarkdownContents(prev => ({
            ...prev,
            [consolidatedArtifactId]: modifiedContent,
          }));

          if (existingArtifact) {
            artifactPanelRef.current?.openArtifactTab(existingArtifact, 'markdown');
            setArtifactPreview({
              isOpen: true,
              selectedArtifact: existingArtifact,
              previewType: 'markdown',
              markdownMode: 'read',
            });
          }

          const confirmMsg: ChatMessage = {
            id: revisionAgentMsgId,
            type: 'agent',
            content: `슬라이드 개요가 요청에 맞게 수정되었습니다. 추가 수정이 필요하면 요청해 주세요. 수정이 완료되면 "슬라이드 생성"이라고 입력해 주세요.`,
            timestamp: new Date(),
          };
          setChatHistory(prev => [...prev, confirmMsg]);
          setCenterPanelState({ isOpen: true, content: 'markdown-preview' });

          const t3 = setTimeout(() => setMarkdownEditingState('idle'), 300);
          revisionTimersRef.current.push(t3);
        }, 1800);
        revisionTimersRef.current.push(t2);
      }

      setInputValue('');
      return;
    }

    // 수정 모드에서 파일 첨부 수정 요청 → 시나리오에 영향 없이 처리
    if (isOutlineRevisionMode && attachedFile && attachedFile.type === 'markdown') {
      const userMessageContent = `${text}\n\n📎 첨부: ${attachedFile.name}`;
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: userMessageContent,
        timestamp: new Date(),
      };
      const revisionAgentMsgId = `agent-revision-response-${Date.now()}`;
      setChatHistory(prev => [...prev, userMessage]);

      // 컨텍스트에 파일 추가
      const fileContextItem: ContextItem = {
        id: `ctx-${attachedFile.id}`,
        type: 'file',
        name: attachedFile.name,
        icon: 'file-text',
        status: 'connected',
      };
      setContextItems(prev => {
        const workFilesIndex = prev.findIndex(item => item.name === '작업 파일');
        if (workFilesIndex >= 0) {
          const updated = [...prev];
          const workFiles = { ...updated[workFilesIndex] };
          workFiles.children = [...(workFiles.children || []), fileContextItem];
          updated[workFilesIndex] = workFiles;
          return updated;
        }
        return [...prev, fileContextItem];
      });

      // 3단계 프로그레시브 편집 애니메이션
      const capturedAttachedFile = attachedFile;
      const capturedText = text;

      // 이전 타이머 정리
      revisionTimersRef.current.forEach(t => clearTimeout(t));
      revisionTimersRef.current = [];

      // Phase 1 (즉시): 패널 오픈 + "파일 분석 중..." 오버레이
      setMarkdownEditingState('editing');
      const existingArtifactImmediate = artifactsRef.current.find(
        a => a.type === 'markdown' && a.title === capturedAttachedFile.name
      );
      if (existingArtifactImmediate) {
        artifactPanelRef.current?.openArtifactTab(existingArtifactImmediate, 'markdown');
        setArtifactPreview({
          isOpen: true,
          selectedArtifact: existingArtifactImmediate,
          previewType: 'markdown',
          markdownMode: 'read',
        });
        setCenterPanelState({ isOpen: true, content: 'markdown-preview' });
      }

      // Phase 2 (800ms): shimmer 전환
      const t1 = setTimeout(() => {
        setMarkdownEditingState('shimmer');
      }, 800);
      revisionTimersRef.current.push(t1);

      // Phase 3 (1800ms): 수정된 콘텐츠 적용
      const t2 = setTimeout(() => {
        let effectiveContent = capturedAttachedFile.content;
        if (!effectiveContent && capturedAttachedFile.sourceArtifactId) {
          effectiveContent = markdownContents[capturedAttachedFile.sourceArtifactId] || '';
          if (!effectiveContent && slideOutlineHITL.deck) {
            const outline = slideOutlineHITL.deck.outlines.find(
              o => capturedAttachedFile.sourceArtifactId?.includes(o.fileName)
            );
            if (outline) effectiveContent = outline.markdownContent;
          }
        }

        const modifiedContent = generateMockModifiedMarkdown(effectiveContent, capturedText);

        // 기존 아티팩트를 찾아서 콘텐츠만 업데이트 (새 파일 생성 X)
        const existingArtifact = artifactsRef.current.find(
          a => a.type === 'markdown' && a.title === capturedAttachedFile.name
        );

        if (existingArtifact) {
          setMarkdownContents(prev => ({
            ...prev,
            [existingArtifact.id]: modifiedContent,
          }));
          artifactPanelRef.current?.openArtifactTab(existingArtifact, 'markdown');
          setArtifactPreview({
            isOpen: true,
            selectedArtifact: existingArtifact,
            previewType: 'markdown',
            markdownMode: 'read',
          });
        } else {
          const artifactId = `artifact-md-modified-${Date.now()}`;
          const newArtifact: Artifact = {
            id: artifactId,
            title: capturedAttachedFile.name,
            type: 'markdown',
            createdAt: new Date(),
            messageId: revisionAgentMsgId,
          };
          setArtifacts(prev => [...prev, newArtifact]);
          setMarkdownContents(prev => ({
            ...prev,
            [artifactId]: modifiedContent,
          }));
          artifactPanelRef.current?.openArtifactTab(newArtifact, 'markdown');
          setArtifactPreview({
            isOpen: true,
            selectedArtifact: newArtifact,
            previewType: 'markdown',
            markdownMode: 'read',
          });
        }

        // deck에 동기화
        if (slideOutlineHITL.deck) {
          const matchingOutline = slideOutlineHITL.deck.outlines.find(
            o => o.fileName === capturedAttachedFile.name
          );
          if (matchingOutline) {
            slideOutlineHITL.updateOutlineContentAndReset(
              matchingOutline.id, modifiedContent
            );
          }
        }

        // 에이전트 확인 메시지
        const confirmMsg: ChatMessage = {
          id: revisionAgentMsgId,
          type: 'agent',
          content: `${capturedAttachedFile.name} 파일이 요청에 맞게 수정되었습니다. 추가 수정이 필요하면 파일을 첨부해 주세요. 수정이 완료되면 "슬라이드 생성"이라고 입력해 주세요.`,
          timestamp: new Date(),
        };
        setChatHistory(prev => [...prev, confirmMsg]);
        setCenterPanelState({ isOpen: true, content: 'markdown-preview' });

        // 편집 상태 해제 (CSS transition 완료 대기)
        const t3 = setTimeout(() => setMarkdownEditingState('idle'), 300);
        revisionTimersRef.current.push(t3);
      }, 1800);
      revisionTimersRef.current.push(t2);

      setInputValue('');
      return;
    }

    setUserQuery(text);

    // NL-to-Chart: 차트 쿼리 감지 (시나리오 감지보다 먼저 시도)
    const nlChartResult = processChartQuery(text);
    if (nlChartResult && !attachedFile) {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: text,
        timestamp: new Date(),
      };

      const chartArtifact: Artifact = {
        id: `chart-${Date.now()}`,
        title: nlChartResult.config.title,
        type: 'chart',
        createdAt: new Date(),
        messageId: userMessage.id,
      };

      setChatHistory(prev => [...prev, userMessage]);
      setArtifacts(prev => [...prev, chartArtifact]);
      setShowDashboard(true);

      setTimeout(() => {
        const agentMessage: ChatMessage = {
          id: `agent-chart-${Date.now()}`,
          type: 'agent',
          content: `📊 **${nlChartResult.config.title}**\n\n${nlChartResult.reasoning}\n\n차트 패널에서 결과를 확인하세요. 차트 상단에서 다른 차트 유형으로 변경할 수 있습니다.`,
          timestamp: new Date(),
        };
        setChatHistory(prev => [...prev, agentMessage]);

        artifactPanelRef.current?.openArtifactTab(chartArtifact, 'chart');
        setCenterPanelState({ isOpen: true, content: 'chart' });
      }, 800);

      setInputValue('');
      return;
    }

    // Generative UI: 대시보드/KPI/통계 요청 감지
    const isGenerativeUIRequest =
      !attachedFile && (
        text.includes('대시보드') || text.includes('KPI') || text.includes('통계') ||
        text.includes('현황판') || text.includes('지표')
      );

    if (isGenerativeUIRequest) {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: text,
        timestamp: new Date(),
      };

      const tabId = `gen-ui-${Date.now()}`;
      const guiSpec: GenerativeUISpec = {
        type: 'stat-grid',
        title: '주요 경영 지표 현황',
        description: '에이전트가 생성한 실시간 KPI 대시보드입니다.',
        data: {
          items: [
            { label: '매출 성장률', value: '₩42억', change: { value: 13.5, direction: 'up' }, subtitle: '목표 37억 초과 달성' },
            { label: '원가 절감률', value: '8.2%', change: { value: 2.1, direction: 'up' }, subtitle: '전분기 대비 개선' },
            { label: '활성 에이전트', value: 24, change: { value: 6, direction: 'up' }, subtitle: '신규 배포 3건' },
            { label: 'API 호출', value: '1.2M', change: { value: 15, direction: 'up' }, subtitle: '일 평균 기준' },
          ],
        },
      };

      setGenerativeUISpecs(prev => ({ ...prev, [tabId]: guiSpec }));

      const guiArtifact: Artifact = {
        id: tabId,
        title: guiSpec.title || '생성형 UI',
        type: 'generative-ui' as Artifact['type'],
        createdAt: new Date(),
        messageId: userMessage.id,
      };

      setChatHistory(prev => [...prev, userMessage]);
      setArtifacts(prev => [...prev, guiArtifact]);
      setShowDashboard(true);

      setTimeout(() => {
        const agentMessage: ChatMessage = {
          id: `agent-gui-${Date.now()}`,
          type: 'agent',
          content: `📊 **${guiSpec.title}**\n\n${guiSpec.description}\n\n아티팩트 패널에서 결과를 확인하세요.`,
          timestamp: new Date(),
        };
        setChatHistory(prev => [...prev, agentMessage]);

        artifactPanelRef.current?.openTab({
          id: tabId,
          artifact: guiArtifact,
          previewType: 'generative-ui',
          title: guiSpec.title || '생성형 UI',
        });
        setCenterPanelState({ isOpen: true, content: 'generative-ui' });
      }, 800);

      setInputValue('');
      return;
    }

    // Auto-detect triggered by context or text
    const isDidRequest = text.includes('DID') || text.includes('메탈') || text.includes('칩셋');
    const isPptRequest = text.includes('PPT') || text.includes('보고서') || text.includes('슬라이드');
    const isFinancialRequest = text.includes('코나아이') || text.includes('ERP') || text.includes('매출') || text.includes('실적') || text.includes('분석') || text.includes('원가');

    // Specific scenarios
    let targetScenario: string | undefined = undefined;

    if (contextData?.scenario) {
        targetScenario = contextData.scenario;
    } else {
        const isMultiAgentScenario = text.includes('멀티 에이전트') || text.includes('에이전트 팀') || text.includes('종합 보고서');
        const isSalesAnalysisScenario = isFinancialRequest && (
            text.includes("원가") ||
            text.includes("원인") ||
            text.includes("매출")
        );
        if (isMultiAgentScenario) targetScenario = 'multi_agent';
        else if (isSalesAnalysisScenario) targetScenario = 'sales_analysis';
    }

    let targetType: 'financial' | 'did' | 'ppt' = 'financial';
    let targetPptStatus: 'idle' | 'setup' | 'generating' | 'done' = 'idle';

    if (isPptRequest) {
      targetType = 'ppt';
      targetPptStatus = 'setup';
      setPptStatus('setup');
    } else if (isDidRequest) {
      targetType = 'did';
      setPptStatus('idle');
    } else {
      targetType = 'financial';
      setPptStatus('idle');
    }

    // 1. 사용자 메시지를 히스토리에 추가
    const userMessageContent = attachedFile
      ? `${text}\n\n📎 첨부: ${attachedFile.name}`
      : text;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: userMessageContent,
      timestamp: new Date(),
    };

    // 2. 에이전트 확인 텍스트 메시지 (citations 포함)
    const scenarioCitations: Citation[] = targetScenario === 'sales_analysis' ? [
      { id: 'cite-erp', index: 1, title: '영림원 ERP 재무 데이터', url: 'https://erp.konai.com/financial/2025-q4', domain: 'erp.konai.com', snippet: '2025년 4분기 연결 재무제표 및 사업부별 매출 데이터' },
      { id: 'cite-e2max', index: 2, title: 'E2MAX 원가 분석 시스템', url: 'https://e2max.konai.com/cost-analysis', domain: 'e2max.konai.com', snippet: '사업부별 원가율 추이 및 원가 구성 상세 데이터' },
      { id: 'cite-portal', index: 3, title: '플랫폼 포탈 운영 지표', url: 'https://portal.konai.com/metrics/2025-q4', domain: 'portal.konai.com', snippet: '트랜잭션 처리량, 고객사별 매출, 서비스 가동률' },
    ] : targetType === 'ppt' ? [
      { id: 'cite-erp-ppt', index: 1, title: '경영 실적 보고서 원본', url: 'https://erp.konai.com/reports/2025-q4', domain: 'erp.konai.com', snippet: '2025년 4분기 경영 실적 종합 보고서' },
      { id: 'cite-strategy', index: 2, title: '사업 전략 기획안', url: 'https://docs.konai.com/strategy/2026', domain: 'docs.konai.com', snippet: '2026년 사업부별 전략 방향 및 핵심 추진 과제' },
    ] : [];

    const confirmText = targetScenario === 'multi_agent'
      ? '멀티 에이전트 협업을 시작합니다. 4개 전문 에이전트가 병렬로 데이터 수집, 분석, 시각화, 보고서 작성을 수행합니다.'
      : targetScenario === 'sales_analysis'
        ? '요청하신 매출 실적 분석을 시작합니다. ERP, E2MAX, 플랫폼 포탈의 데이터를 연동하여 종합 분석을 수행합니다.'
        : targetType === 'ppt'
          ? '요청하신 PPT 생성을 시작합니다. 경영 실적 데이터를 기반으로 프레젠테이션을 구성합니다.'
          : '';

    // 3. 에이전트 시나리오 응답 메시지를 히스토리에 추가
    const agentMessage: ChatMessage = {
      id: `agent-${Date.now()}`,
      type: 'agent',
      content: '',
      timestamp: new Date(),
      dashboardType: targetType,
      dashboardScenario: targetScenario,
      pptStatus: targetPptStatus,
    };

    if (confirmText && scenarioCitations.length > 0) {
      const confirmMessage: ChatMessage = {
        id: `agent-confirm-${Date.now()}`,
        type: 'agent',
        content: confirmText,
        timestamp: new Date(),
        citations: scenarioCitations,
      };
      setChatHistory(prev => [...prev, userMessage, confirmMessage, agentMessage]);
    } else {
      setChatHistory(prev => [...prev, userMessage, agentMessage]);
    }

    // 3. 첨부 파일이 있는 경우 Mock 수정 응답 생성
    if (attachedFile && attachedFile.type === 'markdown') {
      // 컨텍스트에 파일 추가
      const fileContextItem: ContextItem = {
        id: `ctx-${attachedFile.id}`,
        type: 'file',
        name: attachedFile.name,
        icon: 'file-text',
        status: 'connected',
      };
      setContextItems(prev => {
        const workFilesIndex = prev.findIndex(item => item.name === '작업 파일');
        if (workFilesIndex >= 0) {
          const updated = [...prev];
          const workFiles = { ...updated[workFilesIndex] };
          workFiles.children = [...(workFiles.children || []), fileContextItem];
          updated[workFilesIndex] = workFiles;
          return updated;
        }
        return [...prev, fileContextItem];
      });

      // Mock 수정된 마크다운 생성 (1.5초 후)
      setTimeout(() => {
        // 콘텐츠 해석 (artifact 드래그 시 content가 비어있을 수 있음)
        let effectiveContent = attachedFile.content;
        if (!effectiveContent && attachedFile.sourceArtifactId) {
          effectiveContent = markdownContents[attachedFile.sourceArtifactId] || '';
          if (!effectiveContent && slideOutlineHITL.deck) {
            const outline = slideOutlineHITL.deck.outlines.find(
              o => attachedFile.sourceArtifactId?.includes(o.fileName)
            );
            if (outline) effectiveContent = outline.markdownContent;
          }
        }

        const modifiedContent = generateMockModifiedMarkdown(effectiveContent, text);
        const artifactId = `artifact-md-modified-${Date.now()}`;

        // 아티팩트 추가
        const modifiedArtifact: Artifact = {
          id: artifactId,
          title: `수정됨_${attachedFile.name}`,
          type: 'markdown',
          createdAt: new Date(),
          messageId: agentMessage.id,
        };
        setArtifacts(prev => [...prev, modifiedArtifact]);

        // 마크다운 콘텐츠 저장
        setMarkdownContents(prev => ({
          ...prev,
          [artifactId]: modifiedContent,
        }));

        // 중앙 패널에서 미리보기 열기
        artifactPanelRef.current?.openArtifactTab(modifiedArtifact, 'markdown');
        setArtifactPreview({
          isOpen: true,
          selectedArtifact: modifiedArtifact,
          previewType: 'markdown',
          markdownMode: 'read',
        });
        setCenterPanelState({ isOpen: true, content: 'markdown-preview' });
      }, 1500);
    }

    // 4. PDF/DOCX/XLSX/PPTX 첨부 파일 → Document Viewer로 표시
    if (attachedFile && (attachedFile.type === 'pdf' || attachedFile.type === 'docx' || attachedFile.type === 'xlsx' || attachedFile.type === 'pptx') && attachedFile.arrayBuffer) {
      const docArtifact: Artifact = {
        id: `artifact-${attachedFile.type}-${Date.now()}`,
        title: attachedFile.name,
        type: attachedFile.type,
        createdAt: new Date(),
        messageId: agentMessage.id,
        fileSize: attachedFile.size ? `${(attachedFile.size / 1024).toFixed(1)} KB` : undefined,
      };
      setArtifacts(prev => [...prev, docArtifact]);

      // 바이너리 데이터 설정 후 중앙 패널에서 Document Viewer 열기
      setDocumentData(attachedFile.arrayBuffer);
      artifactPanelRef.current?.openArtifactTab(docArtifact, attachedFile.type as ArtifactPreviewType);
      setArtifactPreview({
        isOpen: true,
        selectedArtifact: docArtifact,
        previewType: attachedFile.type,
      });
      setCenterPanelState({ isOpen: true, content: 'document-preview' });
    }

    // 5. CSV 첨부 파일 → Spreadsheet Viewer로 표시
    if (attachedFile && attachedFile.type === 'csv') {
      const csvArtifact: Artifact = {
        id: `artifact-csv-${Date.now()}`,
        title: attachedFile.name,
        type: 'csv',
        createdAt: new Date(),
        messageId: agentMessage.id,
        fileSize: attachedFile.size ? `${(attachedFile.size / 1024).toFixed(1)} KB` : undefined,
      };
      setArtifacts(prev => [...prev, csvArtifact]);

      setCsvContent(attachedFile.content);
      artifactPanelRef.current?.openArtifactTab(csvArtifact, 'csv');
      setArtifactPreview({
        isOpen: true,
        selectedArtifact: csvArtifact,
        previewType: 'csv',
      });
      setCenterPanelState({ isOpen: true, content: 'document-preview' });
    }

    setDashboardType(targetType);
    if (targetScenario) setDashboardScenario(targetScenario);
    // 시나리오 전환 시 이전 완료 상태 리셋
    setSalesAnalysisComplete(false);
    setAnomalyDetectionComplete(false);
    setMultiAgentComplete(false);
    // 시각화 완료 상태 리셋 (Skeleton UI가 제대로 표시되도록)
    setIsVisualizationComplete(false);
    // 수정 1: 우측 사이드바 기본값 열림 유지 (PPT 시나리오 시작 시에도 닫지 않음)
    setIsRightPanelCollapsed(false);
    // 아티팩트 패널에서 대시보드로 전환
    setRightPanelType('dashboard');

    // Trigger UI Update
    if (showDashboard) {
         setInputValue('');
    } else {
         if (immediate) {
             setShowDashboard(true);
             setInputValue('');
         } else {
             setTimeout(() => {
                 setShowDashboard(true);
                 setInputValue('');
             }, 800);
         }
    }
  }, [showDashboard, contextData, isOutlineRevisionMode, slideOutlineHITL, markdownContents, setContextItems, setArtifacts, setMarkdownContents, setCenterPanelState, processChartQuery]);

  const handleReset = useCallback(() => {
    setInputValue('');
    setShowDashboard(false);
    setUserQuery('');
    setDashboardType('financial');
    setDashboardScenario(undefined);
    setPptStatus('idle');
    setPptProgress(0);
    setPptSlides([]); // Clear slides
    setContextData(null); // Clear context
    setSalesAnalysisComplete(false);
    setAnomalyDetectionComplete(false);
    setIsVisualizationComplete(false); // 시각화 완료 상태 리셋
    setChatHistory([]); // Clear chat history
setArtifacts([]); // Clear artifacts
    setRightPanelType('dashboard'); // Reset panel type
    hasProcessedInitialQuery.current = false; // Reset initial query flag
    setIsSlideGenerationComplete(false); // 슬라이드 생성 완료 상태 리셋
    setActiveHitl(null); // HITL 상태 리셋
    setHitlResumeCallback(null); // HITL 콜백 리셋
    setThemeFontCompleteCallback(null); // 테마/폰트 선택 콜백 리셋
    setSlidePlanningCompleteCallback(null); // 슬라이드 계획 완료 콜백 리셋
    setGeneratedFileCount(0); // 생성된 파일 수 리셋
    generatedFileIdsRef.current.clear(); // 파일 중복 추적 리셋
    slidePlanningTimersRef.current.forEach(t => clearTimeout(t)); // 타이머 정리
    slidePlanningTimersRef.current = [];
    setIsOutlineRevisionMode(false); // 수정 모드 리셋
    setRevisionApprovalPending(false); // revision 승인 상태 리셋
    setMarkdownEditingState('idle'); // 마크다운 편집 상태 리셋
    revisionTimersRef.current.forEach(t => clearTimeout(t));
    revisionTimersRef.current = [];
    savedSidePanelStateRef.current = null;
    prevCenterPanelOpenRef.current = false;
    clearChart(); // NL-to-Chart 상태 리셋
  }, [clearChart]);

  // 대화 히스토리 사이드바 토글
  const handleToggleConversationSidebar = useCallback(() => {
    setIsConversationSidebarOpen(prev => !prev);
  }, []);

  // 사이드바에서 새 대화 시작 → GeneralChatView로 전환
  const handleNewChatFromSidebar = useCallback(() => {
    onNavigateToChat?.();
  }, [onNavigateToChat]);

  // PPT 완료 후 → 매출 분석 시나리오로 전환
  const handleRequestSalesAnalysis = useCallback(() => {
    const queryText = '매출 실적 상세 분석';

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: queryText,
      timestamp: new Date(),
    };

    // 에이전트 응답 메시지 추가
    const agentMessage: ChatMessage = {
      id: `agent-${Date.now()}`,
      type: 'agent',
      content: '',
      timestamp: new Date(),
      dashboardType: 'financial',
      dashboardScenario: 'sales_analysis',
      pptStatus: 'idle',
    };

    setChatHistory(prev => [...prev, userMessage, agentMessage]);

    setPptStatus('idle');
    setPptProgress(0);
    setDashboardType('financial');
    setDashboardScenario('sales_analysis');
    setSalesAnalysisComplete(false);
    setIsVisualizationComplete(false); // 시각화 완료 상태 리셋 (Skeleton UI 표시)
    setIsRightPanelCollapsed(false); // 시나리오 전환 시 우측 패널 자동 열기
    setUserQuery(queryText);
  }, []);

  // 매출 분석 완료 후 → PPT 생성 시나리오로 전환
  const handleRequestPPT = useCallback(() => {
    const queryText = '분석 결과 기반 PPT 생성';

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: queryText,
      timestamp: new Date(),
    };

    // 에이전트 응답 메시지 추가
    const agentMessage: ChatMessage = {
      id: `agent-${Date.now()}`,
      type: 'agent',
      content: '',
      timestamp: new Date(),
      dashboardType: 'ppt',
      dashboardScenario: undefined,
      pptStatus: 'setup',
    };

    setChatHistory(prev => [...prev, userMessage, agentMessage]);

    setDashboardScenario(undefined);
    setDashboardType('ppt');
    setPptStatus('setup');
    setSalesAnalysisComplete(false);
    setIsRightPanelCollapsed(false); // 시나리오 전환 시 우측 패널 자동 열기
    setUserQuery(queryText);
  }, []);

  // 매출 분석 완료 핸들러
  const handleSalesAnalysisComplete = useCallback(() => {
    setSalesAnalysisComplete(true);
  }, []);

  // 이상 탐지 완료 핸들러
  const handleAnomalyDetectionComplete = useCallback(() => {
    setAnomalyDetectionComplete(true);
  }, []);

  // 멀티 에이전트 오케스트레이션 완료 핸들러
  const handleMultiAgentComplete = useCallback(() => {
    setMultiAgentComplete(true);
  }, []);

  // Auto-scroll to bottom only if user is already at bottom
  useEffect(() => {
    if (showDashboard && leftPanelRef.current && isAtBottom) {
        leftPanelRef.current.scrollTop = leftPanelRef.current.scrollHeight;
    }
  }, [showDashboard, userQuery, pptStatus, isAtBottom]);

  const handleGenerateStart = useCallback(() => {
    setPptStatus('generating');
    setPptProgress(0);
    setIsRightPanelCollapsed(false);
    // 중앙 패널 열기 (테마/폰트 선택 완료 후 PPT 생성 시작)
    artifactPanelRef.current?.openTab({
      id: 'ppt-gen',
      artifact: null,
      previewType: 'ppt',
      title: 'PPT 생성',
    });
    setCenterPanelState({ isOpen: true, content: 'ppt-preview' });
    // 슬라이드 생성 상태 초기화
    setSlideGenerationState({
      currentSlide: 0,
      completedSlides: [],
      totalSlides: 0
    });
    setIsSlideGenerationComplete(false); // 슬라이드 생성 완료 상태 리셋
  }, []);

  const updatePptConfig = useCallback(<K extends keyof PPTConfig>(key: K, value: PPTConfig[K]) => {
    setPptConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  // --- Cowork Layout 핸들러 ---

  // 사이드바 섹션 토글
  const handleToggleSidebarSection = useCallback((section: SidebarSection) => {
    setSidebarExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  }, []);

  // 아티팩트 선택 (미리보기 패널 열기) — Context openTab 사용
  const handleArtifactSelectForPreview = useCallback((artifact: Artifact) => {
    // 타입별 previewType 결정
    let previewType: ArtifactPreviewType;
    let centerContent: CenterPanelState['content'];

    switch (artifact.type) {
      case 'markdown':
        previewType = 'markdown';
        centerContent = 'markdown-preview';
        break;
      case 'ppt':
        previewType = 'ppt';
        centerContent = 'ppt-result';
        break;
      case 'chart':
        previewType = 'chart';
        centerContent = 'dashboard';
        if (artifact.id.includes('sales')) {
          setDashboardScenario('sales_analysis');
        } else if (artifact.id.includes('anomaly')) {
          setDashboardScenario('anomaly_cost_spike');
        }
        setDashboardType('financial');
        break;
      case 'pdf':
      case 'docx':
      case 'xlsx':
      case 'pptx':
      case 'csv':
        previewType = artifact.type;
        centerContent = 'document-preview';
        break;
      default:
        previewType = 'dashboard';
        centerContent = null;
    }

    // Context에 탭 열기
    artifactPanelRef.current?.openArtifactTab(artifact, previewType);

    // centerPanelState 동기화 (side panel auto-hide 로직용)
    setCenterPanelState({ isOpen: true, content: centerContent });
    setArtifactPreview({
      isOpen: true,
      selectedArtifact: artifact,
      previewType,
      markdownMode: artifact.type === 'markdown' ? 'read' : undefined,
    });
  }, []);

  // 미리보기 패널 닫기
  const handleClosePreviewPanel = useCallback(() => {
    setArtifactPreview({
      isOpen: false,
      selectedArtifact: null,
      previewType: null,
    });
  }, []);

  // 수정 2: 가운데 패널 열기 (조건 A, B, C, D)
  const handleOpenCenterPanel = useCallback((content: 'ppt-preview' | 'dashboard' = 'ppt-preview') => {
    // Context에 해당 탭 열기
    if (content === 'ppt-preview') {
      artifactPanelRef.current?.openTab({
        id: 'ppt-gen',
        artifact: null,
        previewType: 'ppt',
        title: 'PPT 생성',
      });
    } else if (content === 'dashboard') {
      artifactPanelRef.current?.openTab({
        id: 'dashboard-view',
        artifact: null,
        previewType: 'dashboard',
        title: '대시보드',
      });
    }
    setCenterPanelState({
      isOpen: true,
      content,
    });
  }, []);

  // 가운데 패널 닫기 (독립적)
  const handleCloseCenterPanel = useCallback(() => {
    setCenterPanelState({
      isOpen: false,
      content: null,
    });
    // 아티팩트 프리뷰도 함께 닫기
    setArtifactPreview({
      isOpen: false,
      selectedArtifact: null,
      previewType: null,
    });
    // Context 패널도 닫기
    artifactPanelRef.current?.closePanel();
  }, []);

  // 수정 3: HITL 플로팅 패널 상태 변경 핸들러
  const handleActiveHitlChange = useCallback((
    hitl: ActiveHitl | null,
    resumeCallback: (stepId: string, selectedOption: string) => void
  ) => {
    setActiveHitl(hitl);
    setHitlResumeCallback(() => resumeCallback);

    // 슬라이드 개요 검토 HITL: 가운데 패널은 onSlideOutlineReviewStart에서 이미 열림 (slide-outline)
    // 여기서 다시 열지 않음

    // 테마/폰트 선택 HITL 시 중앙 패널: PPT 미리보기로 전환
    if (hitl?.toolType === 'theme_font_select') {
      artifactPanelRef.current?.openTab({
        id: 'ppt-gen',
        artifact: null,
        previewType: 'ppt',
        title: 'PPT 생성',
      });
      setCenterPanelState({ isOpen: true, content: 'ppt-preview' });
    }
  }, []);

  // 테마/폰트 선택 완료 콜백 핸들러
  const handleThemeFontComplete = useCallback((completeCallback: () => void) => {
    setThemeFontCompleteCallback(() => completeCallback);
  }, []);

  // 슬라이드 계획 완료 콜백 핸들러
  const handleSlidePlanningComplete = useCallback((completeCallback: () => void) => {
    setSlidePlanningCompleteCallback(() => completeCallback);
  }, []);

  // PPT 시나리오 Progress Task 매핑
  const PPT_SCENARIO_TASK_GROUPS = useMemo(() => [
    { id: 'planning', label: '작업 계획 수립', stepIds: ['agent_greeting', 'tool_planning'] },
    { id: 'data_source', label: '데이터 소스 선택', stepIds: ['tool_data_source', 'agent_data_source_confirm'] },
    { id: 'data_query', label: '데이터 조회', stepIds: ['tool_erp_connect', 'tool_parallel_query', 'tool_data_query_1', 'tool_data_query_2', 'tool_data_query_3', 'tool_data_query_4'] },
    { id: 'data_validation', label: '데이터 검증', stepIds: ['tool_data_validation', 'agent_validation_confirm'] },
    { id: 'ppt_setup', label: 'PPT 설정', stepIds: ['tool_ppt_setup', 'agent_setup_confirm'] },
    { id: 'slide_generation', label: '슬라이드 생성', stepIds: ['tool_web_search', 'tool_slide_planning', 'tool_slide_generation'] },
    { id: 'completion', label: '완료', stepIds: ['tool_completion', 'agent_final'] },
  ], []);

  // PPT 상태에 따라 Progress 업데이트
  useEffect(() => {
    if (dashboardType === 'ppt') {
      let tasks: ProgressTask[] = [];

      if (pptStatus === 'setup') {
        tasks = PPT_SCENARIO_TASK_GROUPS.map((group, index) => ({
          id: group.id,
          label: group.label,
          status: index === 0 ? 'running' : 'pending',
        }));
      } else if (pptStatus === 'generating') {
        // 슬라이드 생성 중
        const slideProgress = slideGenerationState.totalSlides > 0
          ? Math.round((slideGenerationState.completedSlides.length / slideGenerationState.totalSlides) * 100)
          : 0;

        tasks = PPT_SCENARIO_TASK_GROUPS.map((group) => ({
          id: group.id,
          label: group.label,
          status: group.id === 'slide_generation'
            ? 'running'
            : group.id === 'completion'
              ? 'pending'
              : 'completed',
          progress: group.id === 'slide_generation' ? slideProgress : undefined,
        }));
      } else if (pptStatus === 'done') {
        tasks = PPT_SCENARIO_TASK_GROUPS.map((group) => ({
          id: group.id,
          label: group.label,
          status: 'completed',
        }));
      }

      setProgressTasks(tasks);
    } else if (dashboardScenario === 'sales_analysis') {
      // 매출 분석 시나리오는 SalesAnalysisScenarioRenderer에서 onProgressUpdate를 통해 상세 진행상황 관리
      // 여기서 덮어쓰지 않음 - 시나리오 렌더러에서 설정한 상세 태스크 유지
    } else {
      // 기본 상태
      setProgressTasks([]);
    }
  }, [dashboardType, pptStatus, slideGenerationState, dashboardScenario, PPT_SCENARIO_TASK_GROUPS]);

  // Context Items 업데이트 (데이터 소스에 따라)
  useEffect(() => {
    if (dashboardType === 'ppt' || dashboardType === 'financial') {
      setContextItems([
        {
          id: 'folder-1',
          type: 'folder',
          name: 'Documents',
          children: [
            { id: 'file-1', type: 'file', name: 'Q4_Report.xlsx' },
          ],
        },
        {
          id: 'connector-erp',
          type: 'connector',
          name: '영림원 ERP',
          status: 'connected',
          icon: 'erp',
        },
        {
          id: 'connector-e2max',
          type: 'data-source',
          name: 'E2MAX',
          status: 'connected',
        },
      ]);
    } else {
      setContextItems([]);
    }
  }, [dashboardType]);

  // 실제 응답 렌더링 헬퍼 함수
  const renderActualResponse = (message: ChatMessage, isLatest: boolean) => {
    const msgDashboardType = message.dashboardType || 'financial';
    const msgDashboardScenario = message.dashboardScenario;
    const msgPptStatus = isLatest ? pptStatus : (message.pptStatus || 'done');

    // 1. PPT Scenario - 새로운 시나리오 렌더러 사용
    if (msgDashboardType === 'ppt') {
        // 최신 메시지는 항상 PPTScenarioRenderer 사용 (done 상태에서도 대화 내역 유지)
        if (isLatest) {
            return (
              <PPTScenarioRenderer
                userQuery={userQuery}
                pptConfig={pptConfig}
                onPptConfigUpdate={updatePptConfig}
                onPptStatusChange={setPptStatus}
                onScenarioComplete={handlePptComplete}
                onOpenCenterPanel={() => handleOpenCenterPanel('ppt-preview')}
                onProgressUpdate={setProgressTasks}
                onActiveHitlChange={handleActiveHitlChange}
                slideGenerationState={slideGenerationState}
                isSlideGenerationComplete={isSlideGenerationComplete}
                // Slide Outline Review Props
                onSlideOutlineReviewStart={handleSlideOutlineReviewStart}
                isSlideOutlineReviewComplete={slideOutlineHITL.isAllApproved}
                isOutlineRevisionMode={isOutlineRevisionMode}
                isRevisionApproval={revisionApprovalPending}
                // Theme/Font Select Props
                onThemeFontComplete={handleThemeFontComplete}
                // 마크다운 파일 생성 콜백
                onMarkdownFileGenerated={handleMarkdownFileGenerated}
                // 슬라이드 계획 시작/완료 콜백
                onSlidePlanningStart={handleSlidePlanningStart}
                onSlidePlanningComplete={handleSlidePlanningComplete}
                // 슬라이드 개요 수정 필요 콜백 (HITL 플로팅 패널에서 호출)
                onSlideOutlineRevisionRequested={() => handleEnterRevisionMode('')}
              />
            );
        } else {
            // 히스토리 메시지만 PPTDoneResponse로 표시
            return (
              <PPTDoneResponse
                slideCount={pptConfig.slideCount}
                onRequestSalesAnalysis={handleRequestSalesAnalysis}
                isCenterPanelOpen={centerPanelState.isOpen || artifactPreview.isOpen}
                onOpenCenterPanel={() => {
                  setCenterPanelState({ isOpen: true, content: 'ppt-result' });
                }}
              />
            );
        }
    }

    // 2. Anomaly Detection Scenario
    if (msgDashboardScenario === 'anomaly_cost_spike') {
        const agentMessage = contextData?.agentMessage || "이상 징후가 감지되었습니다.";
        return (
          <AnomalyResponse
            agentMessage={agentMessage}
            isRightPanelCollapsed={isRightPanelCollapsed}
            currentDashboardType={dashboardType}
            currentDashboardScenario={dashboardScenario}
            onOpenRightPanel={() => openRightPanelWithContext({
              dashboardType: 'financial',
              dashboardScenario: 'anomaly_cost_spike'
            })}
            onComplete={isLatest ? handleAnomalyDetectionComplete : undefined}
          />
        );
    }

    // 3. Sales Analysis Scenario
    if (msgDashboardType === 'financial' && msgDashboardScenario === 'sales_analysis') {
        // 최신 메시지만 SalesAnalysisScenarioRenderer 사용
        if (isLatest) {
          return (
            <SalesAnalysisScenarioRenderer
              userQuery={userQuery}
              onScenarioComplete={handleSalesAnalysisComplete}
              onRequestPPT={handleRequestPPT}
              isRightPanelCollapsed={isRightPanelCollapsed}
              onOpenRightPanel={() => openRightPanelWithContext({
                dashboardType: 'financial',
                dashboardScenario: 'sales_analysis'
              })}
              onOpenCenterPanel={handleOpenCenterPanel}
              onProgressUpdate={setProgressTasks}
              onActiveHitlChange={handleActiveHitlChange}
              onVisualizationComplete={setIsVisualizationComplete}
            />
          );
        } else {
          // 히스토리 메시지는 SalesAnalysisDoneResponse 사용
          return (
            <SalesAnalysisDoneResponse
              onRequestPPT={handleRequestPPT}
              isRightPanelCollapsed={isRightPanelCollapsed}
              currentDashboardType={dashboardType}
              currentDashboardScenario={dashboardScenario}
              onOpenRightPanel={() => openRightPanelWithContext({
                dashboardType: 'financial',
                dashboardScenario: 'sales_analysis'
              })}
            />
          );
        }
    }

    // 4. Multi-Agent Orchestration Scenario
    if (msgDashboardScenario === 'multi_agent') {
      if (isLatest) {
        return (
          <MultiAgentScenarioRenderer
            scenarioId="sales_analysis"
            onComplete={handleMultiAgentComplete}
          />
        );
      } else {
        return (
          <MultiAgentDoneResponse
            onRequestPPT={handleRequestPPT}
          />
        );
      }
    }

    // Default Fallback
    return (
      <DefaultResponse
        dashboardType={msgDashboardType}
        isRightPanelCollapsed={isRightPanelCollapsed}
        onOpenRightPanel={() => openRightPanelWithContext({
          dashboardType: msgDashboardType
        })}
      />
    );
  };

  // Helper to render agent response for a specific message
  const renderAgentResponseForMessage = (message: ChatMessage, isLatest: boolean) => {
    return renderActualResponse(message, isLatest);
  };

  // 이전 메시지 응답 렌더링 (히스토리용 - CoT 없이)
  const renderPreviousAgentResponse = (message: ChatMessage) => {
    return renderActualResponse(message, false);
  };

  // Helper to render content based on dashboard type (기존 호환용 - Fallback)
  // NOTE: chatHistory가 없는 초기 상태에서만 사용됨. renderActualResponse 재사용.
  const renderAgentResponse = () => {
    // 임시 메시지 객체 생성하여 renderActualResponse 재사용
    const fallbackMessage: ChatMessage = {
      id: `fallback-${Date.now()}`,
      type: 'agent',
      content: '',
      timestamp: new Date(),
      dashboardType,
      dashboardScenario,
      pptStatus,
    };
    return renderActualResponse(fallbackMessage, true);
  };

  // 1. Result View (Cowork Layout - 3-Panel)
  if (showDashboard) {
    // 수정 2: 가운데 패널 열림 조건 단순화
    // centerPanelState.isOpen 또는 artifactPreview.isOpen으로만 제어
    // 시나리오 시작 시 자동으로 열리지 않고, tool_visualization 단계에서만 열림
    const isCenterPanelOpen = centerPanelState.isOpen || artifactPreview.isOpen;

    // 좌측 패널 (대화 히스토리 사이드바 + 채팅 영역 + 입력 영역)
    const leftPanelContent = (
      <div className="flex h-full">
        <ConversationSidebar
          isCollapsed={!isConversationSidebarOpen}
          onToggleCollapse={handleToggleConversationSidebar}
          sessions={MOCK_AGENT_SESSIONS}
          activeSessionId="current"
          onSessionSelect={() => {}}
          onNewChat={handleNewChatFromSidebar}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <ChatHistoryPanel
              leftPanelRef={leftPanelRef}
              chatHistory={chatHistory}
              userQuery={userQuery}
              pptStatus={pptStatus}
              isOutlineRevisionMode={isOutlineRevisionMode}
              pptConfig={pptConfig}
              centerPanelState={centerPanelState}
              artifactPreview={artifactPreview}
              showScrollButton={showScrollButton}
              unreadCount={unreadCount}
              scrollToBottom={scrollToBottom}
              renderAgentResponseForMessage={renderAgentResponseForMessage}
              renderAgentResponse={renderAgentResponse}
              onRequestSalesAnalysis={handleRequestSalesAnalysis}
              onOpenCenterPanel={(content) => setCenterPanelState({ isOpen: true, content })}
            />
          </div>
          <div className="shrink-0">
            <ChatInputArea
              inputValue={inputValue}
              setInputValue={setInputValue}
              textareaRef={textareaRef}
              onSend={handleSend}
              activeHitl={activeHitl}
              hitlResumeCallback={hitlResumeCallback}
              onHitlClose={() => setActiveHitl(null)}
              pptConfig={pptConfig}
              updatePptConfig={updatePptConfig}
              onGenerateStart={handleGenerateStart}
              onThemeFontComplete={themeFontCompleteCallback ?? undefined}
              pptStatus={pptStatus}
              salesAnalysisComplete={salesAnalysisComplete}
            />
          </div>
        </div>
      </div>
    );

    // 중앙 패널 (Artifact Preview - PPT/Dashboard/Slide Outline/Markdown)
    // previewType 결정: centerPanelState.content 기반으로 우선 결정
    const centerPanelPreviewType =
      centerPanelState.content === 'chart' ? 'chart'
      : centerPanelState.content === 'markdown-preview' ? 'markdown'
      : centerPanelState.content === 'slide-outline' ? 'slide-outline'
      : centerPanelState.content === 'ppt-preview' ? 'ppt'
      : centerPanelState.content === 'ppt-result' ? 'ppt'  // 아티팩트에서 PPT 클릭 시
      : centerPanelState.content === 'document-preview' ? (artifactPreview.previewType as 'pdf' | 'docx' | 'xlsx' | 'csv' | 'pptx') // 문서 뷰어
      : centerPanelState.content === 'dashboard' ? (artifactPreview.previewType || 'dashboard')
      : dashboardType === 'ppt' ? 'ppt'
      : artifactPreview.previewType || 'dashboard';

    // PPT 아티팩트 클릭 시 완성된 결과물 표시 (pptStatus를 'done'으로 설정)
    const effectivePptStatus = centerPanelState.content === 'ppt-result'
      ? 'done'
      : (pptStatus === 'idle' ? 'setup' : pptStatus as 'setup' | 'generating' | 'done');

    const centerPanelContent = isCenterPanelOpen ? (
      <ArtifactPreviewPanel
        onClose={handleCloseCenterPanel}
        onDownload={() => artifactPreview.selectedArtifact && handleDownloadArtifact(artifactPreview.selectedArtifact)}
        // PPT Renderer Props (grouped)
        pptRendererProps={{
          pptConfig: pptConfig,
          pptStatus: effectivePptStatus,
          pptProgress: pptProgress,
          pptCurrentStageIndex: pptCurrentStage,
          pptSlides: pptSlides,
          onPptSlidesChange: setPptSlides,
          onPptProgressChange: handlePptProgressChange,
          onPptComplete: handlePptComplete,
          onPptSlideStart: handleSlideStart,
          onPptSlideComplete: handleSlideComplete,
          onPptCancel: handleReset,
          onClose: handleCloseCenterPanel,
        }}
        // Dashboard Renderer Props (grouped)
        dashboardRendererProps={{
          dashboardComponent: centerPanelState.content === 'chart' && chartResult ? (
            <NLChartRenderer
              result={chartResult}
              onChangeChartType={changeChartType}
            />
          ) : dashboardType !== 'ppt' ? (
            <Dashboard
              type={dashboardType}
              scenario={dashboardScenario}
              onTogglePanel={handleCloseCenterPanel}
              isLoading={dashboardScenario === 'sales_analysis' && !isVisualizationComplete}
            />
          ) : undefined,
        }}
        // Slide Outline Renderer Props (grouped)
        slideOutlineRendererProps={slideOutlineHITL.deck ? {
          slideOutlineDeck: slideOutlineHITL.deck,
          selectedOutlineId: slideOutlineHITL.selectedOutlineId,
          selectedOutline: slideOutlineHITL.selectedOutline,
          onSelectOutline: slideOutlineHITL.selectOutline,
          onOutlineContentChange: slideOutlineHITL.updateOutlineContent,
          onOutlineLayoutChange: slideOutlineHITL.updateOutlineLayout,
          onApproveOutline: slideOutlineHITL.approveOutline,
          onMarkNeedsRevision: slideOutlineHITL.markNeedsRevision,
          onApproveAll: slideOutlineHITL.approveAll,
          onPreviousOutline: slideOutlineHITL.selectPreviousOutline,
          onNextOutline: slideOutlineHITL.selectNextOutline,
          onGeneratePPT: handleGeneratePPTFromOutline,
          onEnterRevisionMode: handleEnterRevisionMode,
          isAllOutlinesApproved: slideOutlineHITL.isAllApproved,
          approvedOutlineCount: slideOutlineHITL.approvedCount,
          totalOutlineCount: slideOutlineHITL.totalCount,
        } : undefined}
        // Markdown handlers
        onMarkdownModeChange={handleMarkdownModeChange}
        onMarkdownContentChange={(content) => {
          if (artifactPreview.selectedArtifact) {
            handleMarkdownContentChange(artifactPreview.selectedArtifact.id, content);
          }
        }}
        // Generative UI specs
        generativeUISpecs={generativeUISpecs}
      />
    ) : null;

    // 우측 사이드바
    const rightSidebarContent = (
      <RightSidebar
        isCollapsed={isRightPanelCollapsed}
        expandedSections={sidebarExpandedSections}
        onToggleSection={handleToggleSidebarSection}
        onToggleCollapse={toggleRightPanel}
        tasks={progressTasks}
        artifacts={artifacts}
        selectedArtifactId={artifactPreview.selectedArtifact?.id}
        onArtifactSelect={handleArtifactSelectForPreview}
        onArtifactDownload={handleDownloadArtifact}
        onScrollToMessage={handleScrollToMessage}
        contextItems={contextItems}
      />
    );

    return (
      <ArtifactLibraryProvider>
      <ArtifactPanelProvider
        documentData={documentData}
        csvContent={csvContent}
        markdownContents={markdownContents}
        markdownEditingState={markdownEditingState}
        onPanelOpenChange={(isOpen) => { if (!isOpen) handleCloseCenterPanel(); }}
      >
        <ArtifactPanelBridge bridgeRef={artifactPanelRef} />
        <ArtifactAutoSaveBridge artifacts={artifacts} markdownContents={markdownContents} />
        <div ref={containerRef} data-testid="analysis-view" className="w-full h-full animate-fade-in-up overflow-hidden">
          <CoworkLayout
            leftPanel={leftPanelContent}
            centerPanel={centerPanelContent}
            isCenterPanelOpen={isCenterPanelOpen}
            rightPanel={rightSidebarContent}
            isRightPanelCollapsed={isRightPanelCollapsed}
          />
        </div>
      </ArtifactPanelProvider>
    </ArtifactLibraryProvider>
    );
  }

  // 2. Empty State (showDashboard=false) — 빈 상태 랜딩 UI
  const emptyLeftPanel = (
    <div className="flex h-full">
      <ConversationSidebar
        isCollapsed={!isConversationSidebarOpen}
        onToggleCollapse={handleToggleConversationSidebar}
        sessions={MOCK_AGENT_SESSIONS}
        activeSessionId={null}
        onSessionSelect={() => {}}
        onNewChat={() => {}}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 빈 상태 랜딩 */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-full max-w-2xl flex flex-col items-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FF3C42] rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="text-xl font-semibold text-gray-800">KonaAgent</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              무엇을 도와드릴까요?
            </h2>
          </div>
        </div>
        {/* 입력 영역 */}
        <div className="shrink-0">
          <ChatInputArea
            inputValue={inputValue}
            setInputValue={setInputValue}
            textareaRef={textareaRef}
            onSend={handleSend}
            activeHitl={null}
            hitlResumeCallback={null}
            onHitlClose={() => {}}
            pptConfig={pptConfig}
            updatePptConfig={updatePptConfig}
            onGenerateStart={handleGenerateStart}
            pptStatus={pptStatus}
            salesAnalysisComplete={false}
          />
        </div>
      </div>
    </div>
  );

  const emptyRightSidebar = (
    <RightSidebar
      isCollapsed={isRightPanelCollapsed}
      expandedSections={sidebarExpandedSections}
      onToggleSection={handleToggleSidebarSection}
      onToggleCollapse={toggleRightPanel}
      tasks={[]}
      artifacts={[]}
      selectedArtifactId={undefined}
      onArtifactSelect={() => {}}
      onArtifactDownload={() => {}}
      onScrollToMessage={handleScrollToMessage}
      contextItems={[]}
    />
  );

  return (
    <ArtifactLibraryProvider>
    <ArtifactPanelProvider
      documentData={documentData}
      csvContent={csvContent}
      markdownContents={markdownContents}
      markdownEditingState={markdownEditingState}
      onPanelOpenChange={(isOpen) => { if (!isOpen) handleCloseCenterPanel(); }}
    >
      <ArtifactPanelBridge bridgeRef={artifactPanelRef} />
      <ArtifactAutoSaveBridge artifacts={artifacts} markdownContents={markdownContents} />
      <div ref={containerRef} className="w-full h-full overflow-hidden">
        <CoworkLayout
          leftPanel={emptyLeftPanel}
          centerPanel={null}
          isCenterPanelOpen={false}
          rightPanel={emptyRightSidebar}
          isRightPanelCollapsed={isRightPanelCollapsed}
        />
      </div>
    </ArtifactPanelProvider>
    </ArtifactLibraryProvider>
  );
};

export default AgentChatView;
