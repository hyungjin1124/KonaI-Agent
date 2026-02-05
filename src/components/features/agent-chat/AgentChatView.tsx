import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
// NOTE: 아이콘들은 HomeView, ChatInputArea 등 하위 컴포넌트에서 직접 import함
import Dashboard from '../dashboard/Dashboard';
import { SampleInterfaceContext, PPTConfig } from '../../../types';
import { SlideItem, Artifact, RightPanelType, ProgressTask, ContextItem, SidebarSection, ArtifactPreviewState, CenterPanelState } from './types';
import { useCaptureStateInjection, StateInjectionHandlers, useScrollToBottomButton, useSlideOutlineHITL } from '../../../hooks';
import { AnomalyResponse, DefaultResponse, PPTDoneResponse, SalesAnalysisDoneResponse } from './components/AgentResponse';
import { ChainOfThought } from './components/ChainOfThought';
import ScrollToBottomButton from './components/ScrollToBottomButton';
import PPTScenarioRenderer, { ActiveHitl } from './components/PPTScenarioRenderer';
import { SLIDE_OUTLINE_CONTENTS, type SlideFile } from './components/ToolCall/constants';
import SalesAnalysisScenarioRenderer from './components/SalesAnalysisScenarioRenderer';
import { CoworkLayout } from './layouts';
import { RightSidebar } from './components/RightSidebar';
import { ArtifactPreviewPanel } from './components/ArtifactPreviewPanel';
import { ChatInputArea } from './components/ChatInputArea';
import { HomeView } from './views';

// 대화 메시지 타입 정의
interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  dashboardType?: 'financial' | 'did' | 'ppt';
  dashboardScenario?: string;
  pptStatus?: 'idle' | 'setup' | 'generating' | 'done';
  cotComplete?: boolean; // Chain of Thought 완료 여부
}

const AgentChatView: React.FC<{ initialQuery?: string; initialContext?: SampleInterfaceContext }> = ({
  initialQuery,
  initialContext
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showDashboard, setShowDashboard] = useState(!!initialQuery);
  const [userQuery, setUserQuery] = useState(initialQuery || '');
  const [dashboardType, setDashboardType] = useState<'financial' | 'did' | 'ppt'>('financial');

  const [dashboardScenario, setDashboardScenario] = useState<string | undefined>(undefined);

  // 시나리오 완료 상태 추적
  const [salesAnalysisComplete, setSalesAnalysisComplete] = useState(false);
  const [anomalyDetectionComplete, setAnomalyDetectionComplete] = useState(false);

  // 대화 히스토리 상태
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Chain of Thought 완료 상태 (메시지 ID별 관리)
  const [cotCompleteMap, setCotCompleteMap] = useState<Record<string, boolean>>({});

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
  const [artifactPreview, setArtifactPreview] = useState<ArtifactPreviewState>({
    isOpen: false,
    selectedArtifact: null,
    previewType: null,
  });

  // 수정 2: 가운데 패널 상태 (Artifact Preview 독립 제어)
  const [centerPanelState, setCenterPanelState] = useState<CenterPanelState>({
    isOpen: false,
    content: null,
  });

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
    setCenterPanelState({ isOpen: true, content: 'ppt-preview' });
  }, []);

  const slideOutlineHITL = useSlideOutlineHITL({
    onAllApproved: handleSlideOutlineAllApproved,
  });

  // 슬라이드 개요 검토 시작 핸들러 (PPTScenarioRenderer에서 호출)
  const handleSlideOutlineReviewStart = useCallback(() => {
    slideOutlineHITL.initializeDeck();
    setCenterPanelState({ isOpen: true, content: 'slide-outline' });
  }, [slideOutlineHITL.initializeDeck]);

  // PPT 생성 핸들러 (슬라이드 개요 모두 승인 후 호출)
  const handleGeneratePPTFromOutline = useCallback(() => {
    // 슬라이드 개요 검토 완료 - PPT 생성 패널로 전환
    setCenterPanelState({ isOpen: true, content: 'ppt-preview' });
  }, []);

  // 마크다운 파일 생성 콜백 (slide_planning 도구에서 호출)
  const TOTAL_SLIDE_FILES = 7; // PPT_SLIDE_FILES.length

  const handleMarkdownFileGenerated = useCallback((file: SlideFile) => {
    if (!file?.filename || !file?.title) {
      console.warn('handleMarkdownFileGenerated: Invalid file data', file);
      return;
    }

    const artifactId = `artifact-md-${file.filename}`;

    // 중복 체크 및 아티팩트 추가
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
      handleSend(initialQuery, true);
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
  const handleSend = useCallback((text: string, immediate: boolean = false) => {
    if (!showDashboard) {
        setInputValue(text);
    }

    setUserQuery(text);

    // Auto-detect triggered by context or text
    const isDidRequest = text.includes('DID') || text.includes('메탈') || text.includes('칩셋');
    const isPptRequest = text.includes('PPT') || text.includes('보고서') || text.includes('슬라이드');
    const isFinancialRequest = text.includes('코나아이') || text.includes('ERP') || text.includes('매출') || text.includes('실적') || text.includes('분석') || text.includes('원가');

    // Specific scenarios
    let targetScenario: string | undefined = undefined;

    if (contextData?.scenario) {
        targetScenario = contextData.scenario;
    } else {
        const isSalesAnalysisScenario = isFinancialRequest && (
            text.includes("원가") ||
            text.includes("원인") ||
            text.includes("매출")
        );
        if (isSalesAnalysisScenario) targetScenario = 'sales_analysis';
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
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: text,
      timestamp: new Date(),
    };

    // 2. 에이전트 응답 메시지를 히스토리에 추가
    const agentMessage: ChatMessage = {
      id: `agent-${Date.now()}`,
      type: 'agent',
      content: '',
      timestamp: new Date(),
      dashboardType: targetType,
      dashboardScenario: targetScenario,
      pptStatus: targetPptStatus,
    };

    setChatHistory(prev => [...prev, userMessage, agentMessage]);

    setDashboardType(targetType);
    if (targetScenario) setDashboardScenario(targetScenario);
    // 시나리오 전환 시 이전 완료 상태 리셋
    setSalesAnalysisComplete(false);
    setAnomalyDetectionComplete(false);
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
  }, [showDashboard, contextData]);

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
    setCotCompleteMap({}); // Clear CoT completion states
    setArtifacts([]); // Clear artifacts
    setRightPanelType('dashboard'); // Reset panel type
    hasProcessedInitialQuery.current = false; // Reset initial query flag
    setIsSlideGenerationComplete(false); // 슬라이드 생성 완료 상태 리셋
    setActiveHitl(null); // HITL 상태 리셋
    setHitlResumeCallback(null); // HITL 콜백 리셋
    setThemeFontCompleteCallback(null); // 테마/폰트 선택 콜백 리셋
    setSlidePlanningCompleteCallback(null); // 슬라이드 계획 완료 콜백 리셋
    setGeneratedFileCount(0); // 생성된 파일 수 리셋
  }, []);

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

  // CoT 완료 핸들러
  const handleCotComplete = useCallback((messageId: string) => {
    setCotCompleteMap(prev => ({ ...prev, [messageId]: true }));
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

  // 아티팩트 선택 (미리보기 패널 열기)
  const handleArtifactSelectForPreview = useCallback((artifact: Artifact) => {
    // 마크다운 파일: 중앙 패널에서 미리보기
    if (artifact.type === 'markdown') {
      setCenterPanelState({ isOpen: true, content: 'markdown-preview' });
      setArtifactPreview({
        isOpen: true,
        selectedArtifact: artifact,
        previewType: 'markdown',
        markdownMode: 'read',
      });
      return;
    }

    // PPT 파일: 중앙 패널에서 완성된 PPT 결과물 보기
    if (artifact.type === 'ppt') {
      setCenterPanelState({ isOpen: true, content: 'ppt-result' });
      setArtifactPreview({
        isOpen: true,
        selectedArtifact: artifact,
        previewType: 'ppt',
      });
      return;
    }

    // Chart (시각화 결과): 중앙 패널에서 대시보드 표시
    if (artifact.type === 'chart') {
      // chart 아티팩트의 scenario 정보를 사용하여 적절한 대시보드 표시
      if (artifact.id.includes('sales')) {
        setDashboardScenario('sales_analysis');
      } else if (artifact.id.includes('anomaly')) {
        setDashboardScenario('anomaly_cost_spike');
      }
      setDashboardType('financial');
      setCenterPanelState({ isOpen: true, content: 'dashboard' });
      setArtifactPreview({
        isOpen: true,
        selectedArtifact: artifact,
        previewType: 'chart',
      });
      return;
    }

    // 기타 (document 등): 중앙 패널에서 기본 미리보기
    setCenterPanelState({ isOpen: true, content: null });
    setArtifactPreview({
      isOpen: true,
      selectedArtifact: artifact,
      previewType: 'dashboard',
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
  }, []);

  // 수정 3: HITL 플로팅 패널 상태 변경 핸들러
  const handleActiveHitlChange = useCallback((
    hitl: ActiveHitl | null,
    resumeCallback: (stepId: string, selectedOption: string) => void
  ) => {
    setActiveHitl(hitl);
    setHitlResumeCallback(() => resumeCallback);

    // 슬라이드 개요 검토 HITL 시 중앙 패널 자동 열기
    if (hitl?.toolType === 'slide_outline_review') {
      const firstArtifact = artifacts.find(a => a.id === 'artifact-md-00_metadata.md');
      if (firstArtifact) {
        setCenterPanelState({ isOpen: true, content: 'markdown-preview' });
        setArtifactPreview({
          isOpen: true,
          selectedArtifact: firstArtifact,
          previewType: 'markdown',
          markdownMode: 'read',
        });
      }
    }

    // 테마/폰트 선택 HITL 시 중앙 패널: PPT 미리보기로 전환
    if (hitl?.toolType === 'theme_font_select') {
      setCenterPanelState({ isOpen: true, content: 'ppt-preview' });
    }
  }, [artifacts]);

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
                onRequestSalesAnalysis={handleRequestSalesAnalysis}
                isRightPanelCollapsed={isRightPanelCollapsed}
                onOpenRightPanel={() => openRightPanelWithContext({
                  dashboardType: 'ppt',
                  pptStatus: pptStatus === 'done' ? 'done' : 'setup'
                })}
                onOpenCenterPanel={() => handleOpenCenterPanel('ppt-preview')}
                onProgressUpdate={setProgressTasks}
                onActiveHitlChange={handleActiveHitlChange}
                slideGenerationState={slideGenerationState}
                isSlideGenerationComplete={isSlideGenerationComplete}
                // Slide Outline Review Props
                onSlideOutlineReviewStart={handleSlideOutlineReviewStart}
                isSlideOutlineReviewComplete={slideOutlineHITL.isAllApproved}
                // Theme/Font Select Props
                onThemeFontComplete={handleThemeFontComplete}
                // 마크다운 파일 생성 콜백
                onMarkdownFileGenerated={handleMarkdownFileGenerated}
                // 슬라이드 계획 완료 콜백
                onSlidePlanningComplete={handleSlidePlanningComplete}
              />
            );
        } else {
            // 히스토리 메시지만 PPTDoneResponse로 표시
            return (
              <PPTDoneResponse
                slideCount={pptConfig.slideCount}
                onRequestSalesAnalysis={handleRequestSalesAnalysis}
                isRightPanelCollapsed={isRightPanelCollapsed}
                currentDashboardType={dashboardType}
                onOpenRightPanel={() => openRightPanelWithContext({
                  dashboardType: 'ppt',
                  pptStatus: 'done'
                })}
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
    const msgDashboardType = message.dashboardType || 'financial';
    const msgDashboardScenario = message.dashboardScenario;
    const msgPptStatus = isLatest ? pptStatus : (message.pptStatus || 'done');
    const isCotComplete = cotCompleteMap[message.id] ?? false;

    // PPT 시나리오와 Sales Analysis 시나리오는 자체 렌더러 사용 (CoT 대신 도구 호출/답변 번갈아 표시)
    if (msgDashboardType === 'ppt' || msgDashboardScenario === 'sales_analysis') {
      return renderActualResponse(message, isLatest);
    }

    // 다른 시나리오는 기존 CoT 패턴 유지
    const shouldShowCot = isLatest;

    // CoT와 실제 응답을 함께 렌더링
    return (
      <>
        {/* CoT 섹션 - 진행 중이거나 완료된 경우 모두 표시 */}
        {shouldShowCot && (
          <ChainOfThought
            isActive={!isCotComplete}
            isComplete={isCotComplete}
            onComplete={() => handleCotComplete(message.id)}
            stepDuration={1200}
          />
        )}

        {/* 실제 응답 - CoT 완료 후 표시 */}
        {isCotComplete && renderActualResponse(message, isLatest)}
      </>
    );
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

    // 좌측 패널 (채팅 영역)
    const leftPanelContent = (
      <div ref={leftPanelRef} className="h-full overflow-y-auto custom-scrollbar scroll-smooth relative">
        <div className="py-6 max-w-3xl mx-auto px-6">
          {/* 대화 히스토리 렌더링 */}
          {chatHistory.length > 0 ? (
            chatHistory.map((message, index) => {
              const isLatestAgent = message.type === 'agent' &&
                index === chatHistory.length - 1;

              return (
                <div key={message.id}>
                  {message.type === 'user' ? (
                    // User Query Bubble
                    <div className="flex justify-end mb-10 mt-6">
                      <div className="bg-gray-100 text-black px-5 py-4 rounded-2xl rounded-tr-sm max-w-[90%] border border-gray-200 shadow-sm">
                        <p className="text-sm leading-relaxed whitespace-pre-line font-medium">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    // Agent Response
                    <div className="mb-6">
                      {renderAgentResponseForMessage(message, isLatestAgent)}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            // Fallback: 기존 단일 메시지 렌더링 (초기 상태)
            <>
              <div className="flex justify-end mb-10 mt-6">
                <div className="bg-gray-100 text-black px-5 py-4 rounded-2xl rounded-tr-sm max-w-[90%] border border-gray-200 shadow-sm">
                  <p className="text-sm leading-relaxed whitespace-pre-line font-medium">{userQuery}</p>
                </div>
              </div>
              {renderAgentResponse()}
            </>
          )}

          <div className="h-6"></div>
        </div>

        {/* Scroll to Bottom Button */}
        <ScrollToBottomButton
          isVisible={showScrollButton}
          unreadCount={unreadCount}
          onClick={scrollToBottom}
        />
      </div>
    );

    // 입력 영역 - ChatInputArea 컴포넌트 사용
    const inputAreaContent = (
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
    );

    // 중앙 패널 (Artifact Preview - PPT/Dashboard/Slide Outline/Markdown)
    // previewType 결정: centerPanelState.content 기반으로 우선 결정
    const centerPanelPreviewType =
      centerPanelState.content === 'markdown-preview' ? 'markdown'
      : centerPanelState.content === 'slide-outline' ? 'slide-outline'
      : centerPanelState.content === 'ppt-preview' ? 'ppt'
      : centerPanelState.content === 'ppt-result' ? 'ppt'  // 아티팩트에서 PPT 클릭 시
      : centerPanelState.content === 'dashboard' ? (artifactPreview.previewType || 'dashboard')
      : dashboardType === 'ppt' ? 'ppt'
      : artifactPreview.previewType || 'dashboard';

    // PPT 아티팩트 클릭 시 완성된 결과물 표시 (pptStatus를 'done'으로 설정)
    const effectivePptStatus = centerPanelState.content === 'ppt-result'
      ? 'done'
      : (pptStatus === 'idle' ? 'setup' : pptStatus as 'setup' | 'generating' | 'done');

    const centerPanelContent = isCenterPanelOpen ? (
      <ArtifactPreviewPanel
        isOpen={true}
        artifact={artifactPreview.selectedArtifact}
        previewType={centerPanelPreviewType}
        onClose={handleCloseCenterPanel}
        onDownload={() => handleDownloadArtifact(artifactPreview.selectedArtifact!)}
        // PPT Props
        pptConfig={pptConfig}
        pptStatus={effectivePptStatus}
        pptProgress={pptProgress}
        pptCurrentStageIndex={pptCurrentStage}
        pptSlides={pptSlides}
        onPptSlidesChange={setPptSlides}
        onPptProgressChange={handlePptProgressChange}
        onPptComplete={handlePptComplete}
        onPptSlideStart={handleSlideStart}
        onPptSlideComplete={handleSlideComplete}
        onPptCancel={handleReset}
        // Dashboard Props
        dashboardType={dashboardType}
        dashboardScenario={dashboardScenario}
        dashboardComponent={
          dashboardType !== 'ppt' ? (
            <Dashboard
              type={dashboardType}
              scenario={dashboardScenario}
              onTogglePanel={handleCloseCenterPanel}
              isLoading={dashboardScenario === 'sales_analysis' && !isVisualizationComplete}
            />
          ) : undefined
        }
        // Slide Outline HITL Props
        slideOutlineDeck={slideOutlineHITL.deck}
        selectedOutlineId={slideOutlineHITL.selectedOutlineId}
        selectedOutline={slideOutlineHITL.selectedOutline}
        onSelectOutline={slideOutlineHITL.selectOutline}
        onOutlineContentChange={slideOutlineHITL.updateOutlineContent}
        onOutlineLayoutChange={slideOutlineHITL.updateOutlineLayout}
        onApproveOutline={slideOutlineHITL.approveOutline}
        onMarkNeedsRevision={slideOutlineHITL.markNeedsRevision}
        onApproveAll={slideOutlineHITL.approveAll}
        onPreviousOutline={slideOutlineHITL.selectPreviousOutline}
        onNextOutline={slideOutlineHITL.selectNextOutline}
        onGeneratePPT={handleGeneratePPTFromOutline}
        isAllOutlinesApproved={slideOutlineHITL.isAllApproved}
        approvedOutlineCount={slideOutlineHITL.approvedCount}
        totalOutlineCount={slideOutlineHITL.totalCount}
        // Markdown Preview Props
        markdownContent={artifactPreview.selectedArtifact ? markdownContents[artifactPreview.selectedArtifact.id] || '' : ''}
        markdownMode={artifactPreview.markdownMode || 'read'}
        onMarkdownModeChange={handleMarkdownModeChange}
        onMarkdownContentChange={(content) => {
          if (artifactPreview.selectedArtifact) {
            handleMarkdownContentChange(artifactPreview.selectedArtifact.id, content);
          }
        }}
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
        contextItems={contextItems}
      />
    );

    return (
      <div ref={containerRef} data-testid="analysis-view" className="w-full h-full animate-fade-in-up overflow-hidden">
        <CoworkLayout
          leftPanel={leftPanelContent}
          centerPanel={centerPanelContent}
          isCenterPanelOpen={isCenterPanelOpen}
          rightPanel={rightSidebarContent}
          isRightPanelCollapsed={isRightPanelCollapsed}
          inputArea={inputAreaContent}
        />
      </div>
    );
  }

  // Prevent Home View from rendering during transition
  if (!showDashboard && userQuery) {
    return null;
  }

  // 2. Initial Home View - HomeView 컴포넌트 사용
  return (
    <HomeView
      inputValue={inputValue}
      setInputValue={setInputValue}
      contextData={contextData}
      setContextData={setContextData}
      textareaRef={textareaRef}
      onSend={handleSend}
    />
  );
};

export default AgentChatView;
