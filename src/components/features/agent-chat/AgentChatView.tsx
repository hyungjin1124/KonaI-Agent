import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, Mic, ArrowUp, FileText, Globe, Box, Palette, MoreHorizontal,
  TrendingUp, PieChart, Users, RotateCcw, MonitorPlay, FileImage, Sparkles, Check, ChevronDown, Wand2, Paperclip, X,
  ArrowRight, GripVertical, FolderOpen
} from '../../icons';
import Dashboard from '../dashboard/Dashboard';
import PPTGenPanel from '../../PPTGenPanel';
import { SampleInterfaceContext, PPTConfig, SuggestionItem, QuickActionChip } from '../../../types';
import { SlideItem, Artifact, RightPanelType } from './types';
import { useCaptureStateInjection, StateInjectionHandlers } from '../../../hooks';
import { SalesAnalysisResponse, AnomalyResponse, DefaultResponse, PPTDoneResponse } from './components/AgentResponse';
import { ChainOfThought } from './components/ChainOfThought';
import { ArtifactsPanel } from './components/ArtifactsPanel';

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

  // --- 아티팩트 상태 ---
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [rightPanelType, setRightPanelType] = useState<RightPanelType>('dashboard');

  // 캡처 자동화용 상태 주입 핸들러
  const stateInjectionHandlers = useMemo<StateInjectionHandlers>(() => ({
    setShowDashboard,
  }), []);

  // 외부 상태 주입 훅 사용 (Puppeteer 캡처 자동화 지원)
  useCaptureStateInjection(stateInjectionHandlers);

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

  // Handle PPT Generation Simulation
  useEffect(() => {
    if (pptStatus === 'generating') {
      const interval = setInterval(() => {
        setPptProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setPptStatus('done');
            return 100;
          }
          // Calculate stage based on progress
          const newStage = Math.min(5, Math.floor((prev + 1) / 16));
          setPptCurrentStage(newStage);
          return prev + 1; // Increment progress
        });
      }, 50); // Speed of generation simulation

      return () => clearInterval(interval);
    }
  }, [pptStatus]);

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

  const chips = [
    { icon: <FileText size={14} />, label: '슬라이드 제작' },
    { icon: <Globe size={14} />, label: '데이터 시각화' },
    { icon: <Box size={14} />, label: 'Wide Research' },
    { icon: <Palette size={14} />, label: '비디오 생성' },
    { icon: <MoreHorizontal size={14} />, label: '더보기' },
  ];

  interface SuggestionItem {
    title: string;
    description?: string;
    prompt: string;
    icon: React.ReactNode;
  }

  // useMemo로 suggestedPrompts 캐싱 (JSX 포함 객체 재생성 방지)
  const suggestedPrompts = useMemo<SuggestionItem[]>(() => [
    {
      title: '실적 분석',
      description: '코나아이 ERP의 2025년 월별 매출 데이터를 분석 및 시각화',
      prompt: '코나아이 ERP의 2025년 월별 매출 데이터를 분석하여 시각화:\n- 월별 매출 추이\n- 사업부별 매출 구성\n- 주요 거래처 Top 10\n- 전년 동기 대비 성장률 KPI 카드 차트',
      icon: <TrendingUp size={20} className="text-[#FF3C42]" />
    },
    {
      title: 'DID 리포트',
      description: 'DID 사업부 매출 및 원가 효율성 상세 분석 요청',
      prompt: 'DID 사업부의 2025년 성과를 분석해줘:\n- 국내/해외 매출 비중 추이\n- 메탈 카드 원가율 분석\n- 주력 칩셋 판매 순위',
      icon: <PieChart size={20} className="text-[#FF6D72]" />
    },
    {
      title: 'PPT 생성',
      description: 'Q4 2025 경영 실적 보고서 PPT 생성',
      prompt: `Q4 2025 경영 실적 보고서 PPT를 만들어주세요.\n다음 섹션을 포함해주세요:\n- 표지 (회사 로고, 보고 일자)\n- 목차\n- 요약 (Executive Summary)\n- 재무 성과 (매출, 영업이익, 순이익)\n- 주요 사업 성과 (신규 계약, 프로젝트 완료율)\n- 향후 계획`,
      icon: <FileText size={20} className="text-[#FF9DA0]" />
    },
    {
      title: '인사이트',
      prompt: '환율 1,500원 달성 시 이번 분기 원가 영향 분석 및 대처 방안',
      icon: <Users size={20} className="text-black" />
    },
  ], []);

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
    // 시나리오 전환 시 우측 패널 자동 열기
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
    setChatHistory([]); // Clear chat history
    setCotCompleteMap({}); // Clear CoT completion states
    setArtifacts([]); // Clear artifacts
    setRightPanelType('dashboard'); // Reset panel type
    hasProcessedInitialQuery.current = false; // Reset initial query flag
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

  useEffect(() => {
    if (showDashboard && leftPanelRef.current) {
        leftPanelRef.current.scrollTop = leftPanelRef.current.scrollHeight;
    }
  }, [showDashboard, userQuery, pptStatus]);

  const handleGenerateStart = useCallback(() => {
    setPptStatus('generating');
    setPptProgress(0);
  }, []);

  const updatePptConfig = useCallback(<K extends keyof PPTConfig>(key: K, value: PPTConfig[K]) => {
    setPptConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleTopic = useCallback((topic: string) => {
    setPptConfig(prev => {
      const exists = prev.topics.includes(topic);
      if (exists) return { ...prev, topics: prev.topics.filter(t => t !== topic) };
      return { ...prev, topics: [...prev.topics, topic] };
    });
  }, []);

  // CoT 완료 핸들러
  const handleCotComplete = useCallback((messageId: string) => {
    setCotCompleteMap(prev => ({ ...prev, [messageId]: true }));
  }, []);

  // 실제 응답 렌더링 헬퍼 함수
  const renderActualResponse = (message: ChatMessage, isLatest: boolean) => {
    const msgDashboardType = message.dashboardType || 'financial';
    const msgDashboardScenario = message.dashboardScenario;
    const msgPptStatus = isLatest ? pptStatus : (message.pptStatus || 'done');

    // 1. PPT Scenario
    if (msgDashboardType === 'ppt') {
        if (msgPptStatus === 'setup' && isLatest) {
            return renderPPTSetup();
        } else if (msgPptStatus === 'generating' && isLatest) {
            return renderPPTGenerating();
        } else {
            return (
              <PPTDoneResponse
                slideCount={pptConfig.slideCount}
                onRequestSalesAnalysis={handleRequestSalesAnalysis}
                isRightPanelCollapsed={isRightPanelCollapsed}
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
        return <AnomalyResponse agentMessage={agentMessage} />;
    }

    // 3. Sales Analysis Scenario
    if (msgDashboardType === 'financial' && msgDashboardScenario === 'sales_analysis') {
        return (
          <SalesAnalysisResponse
            onComplete={isLatest ? handleSalesAnalysisComplete : undefined}
            onRequestPPT={handleRequestPPT}
            isRightPanelCollapsed={isRightPanelCollapsed}
            onOpenRightPanel={() => openRightPanelWithContext({
              dashboardType: 'financial',
              dashboardScenario: 'sales_analysis'
            })}
          />
        );
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
    const msgPptStatus = isLatest ? pptStatus : (message.pptStatus || 'done');
    const isCotComplete = cotCompleteMap[message.id] ?? false;

    // PPT setup/generating은 CoT 없이 바로 렌더링
    if (msgDashboardType === 'ppt' && (msgPptStatus === 'setup' || msgPptStatus === 'generating') && isLatest) {
      return renderActualResponse(message, isLatest);
    }

    // CoT 표시 여부 결정 (최신 메시지에만 CoT 표시)
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

  // PPT Setup 렌더링 헬퍼
  const renderPPTSetup = () => (
    <div className="flex gap-4 mb-2 animate-fade-in-up">
      <div className="w-8 h-8 rounded bg-[#FF3C42] flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <span className="text-white font-bold text-xs">K</span>
      </div>
      <div className="flex-1 space-y-4">
        <div className="prose prose-sm">
          <p className="text-gray-900 font-medium">Q4 2025 경영 실적 보고서 PPT 생성을 요청하셨군요. 세부 설정을 확인해주세요.</p>
        </div>

        {/* Configuration Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-6">
           {/* Theme */}
           <div className="space-y-2">
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">디자인 테마</label>
             <div className="grid grid-cols-3 gap-2">
               {(['Corporate Blue', 'Modern Dark', 'Nature Green'] as const).map((theme) => (
                 <button
                   key={theme}
                   onClick={() => updatePptConfig('theme', theme)}
                   className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                     pptConfig.theme === theme
                     ? 'border-[#FF3C42] bg-red-50 text-[#FF3C42]'
                     : 'border-gray-200 hover:border-gray-300 text-gray-600'
                   }`}
                 >
                   {theme}
                 </button>
               ))}
             </div>
           </div>

           {/* Tone */}
           <div className="space-y-2">
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">톤앤매너</label>
             <div className="flex gap-4">
               {(['Data-driven', 'Formal', 'Storytelling'] as const).map((tone) => (
                 <label key={tone} className="flex items-center gap-2 cursor-pointer group">
                   <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                     pptConfig.tone === tone ? 'border-[#FF3C42]' : 'border-gray-300'
                   }`}>
                     {pptConfig.tone === tone && <div className="w-2 h-2 rounded-full bg-[#FF3C42]" />}
                   </div>
                   <span className={`text-sm ${pptConfig.tone === tone ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-700'}`}>
                     {tone}
                   </span>
                   <input type="radio" className="hidden" checked={pptConfig.tone === tone} onChange={() => updatePptConfig('tone', tone)} />
                 </label>
               ))}
             </div>
           </div>

           {/* Topics */}
           <div className="space-y-2">
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">포함할 주요 내용</label>
             <div className="space-y-1.5">
               {['Executive Summary', 'Q4 Revenue Overview', 'YoY Comparison', 'Regional Performance', 'Future Outlook'].map((topic) => (
                 <div
                   key={topic}
                   onClick={() => toggleTopic(topic)}
                   className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                     pptConfig.topics.includes(topic)
                     ? 'bg-blue-50 border-blue-200'
                     : 'border-transparent hover:bg-gray-50'
                   }`}
                 >
                   <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                     pptConfig.topics.includes(topic) ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 bg-white'
                   }`}>
                     {pptConfig.topics.includes(topic) && <Check size={10} />}
                   </div>
                   <span className="text-sm text-gray-700">{topic}</span>
                 </div>
               ))}
             </div>
           </div>

           {/* Count & Font */}
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">폰트 스타일</label>
                 <div className="relative">
                    <select
                      value={pptConfig.titleFont}
                      onChange={(e) => updatePptConfig('titleFont', e.target.value)}
                      className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#FF3C42]"
                    >
                      <option value="Pretendard">Pretendard</option>
                      <option value="Noto Sans KR">Noto Sans KR</option>
                      <option value="Montserrat">Montserrat</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">슬라이드 수</label>
                 <input
                   type="number"
                   value={pptConfig.slideCount}
                   onChange={(e) => updatePptConfig('slideCount', e.target.value === '' ? '' : parseInt(e.target.value))}
                   className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#FF3C42]"
                   min={5} max={50}
                 />
              </div>
           </div>

           {/* Action Button */}
           <button
             onClick={handleGenerateStart}
             className="w-full py-3 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform active:scale-[0.99]"
           >
             <Wand2 size={16} />
             설정 완료 및 생성 (Generate)
           </button>
        </div>

        <p className="text-xs text-gray-400">
          * 우측 패널에서 실시간 미리보기를 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );

  // PPT Generating 렌더링 헬퍼
  const renderPPTGenerating = () => (
    <div className="flex gap-4 mb-2 animate-fade-in-up">
      <div className="w-8 h-8 rounded bg-[#FF3C42] flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <span className="text-white font-bold text-xs">K</span>
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-gray-900 font-medium">보고서를 생성하고 있습니다. 잠시만 기다려주세요...</p>
        <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
           <div className="flex justify-between text-xs text-gray-500 mb-1">
             <span>Progress</span>
             <span>{pptProgress}%</span>
           </div>
           <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
             <div className="h-full bg-[#FF3C42] transition-all duration-300" style={{ width: `${pptProgress}%` }}></div>
           </div>
        </div>
      </div>
    </div>
  );

  // Helper to render content based on dashboard type (기존 호환용)
  const renderAgentResponse = () => {
    // 1. PPT Scenario
    if (dashboardType === 'ppt') {
        if (pptStatus === 'setup') {
            return (
                <div className="flex gap-4 mb-2 animate-fade-in-up">
                  <div className="w-8 h-8 rounded bg-[#FF3C42] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <span className="text-white font-bold text-xs">K</span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="prose prose-sm">
                      <p className="text-gray-900 font-medium">Q4 2025 경영 실적 보고서 PPT 생성을 요청하셨군요. 세부 설정을 확인해주세요.</p>
                    </div>
                    
                    {/* Configuration Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-6">
                       {/* Theme */}
                       <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">디자인 테마</label>
                         <div className="grid grid-cols-3 gap-2">
                           {(['Corporate Blue', 'Modern Dark', 'Nature Green'] as const).map((theme) => (
                             <button
                               key={theme}
                               onClick={() => updatePptConfig('theme', theme)}
                               className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                                 pptConfig.theme === theme 
                                 ? 'border-[#FF3C42] bg-red-50 text-[#FF3C42]' 
                                 : 'border-gray-200 hover:border-gray-300 text-gray-600'
                               }`}
                             >
                               {theme}
                             </button>
                           ))}
                         </div>
                       </div>
    
                       {/* Tone */}
                       <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">톤앤매너</label>
                         <div className="flex gap-4">
                           {(['Data-driven', 'Formal', 'Storytelling'] as const).map((tone) => (
                             <label key={tone} className="flex items-center gap-2 cursor-pointer group">
                               <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                 pptConfig.tone === tone ? 'border-[#FF3C42]' : 'border-gray-300'
                               }`}>
                                 {pptConfig.tone === tone && <div className="w-2 h-2 rounded-full bg-[#FF3C42]" />}
                               </div>
                               <span className={`text-sm ${pptConfig.tone === tone ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-700'}`}>
                                 {tone}
                               </span>
                               <input type="radio" className="hidden" checked={pptConfig.tone === tone} onChange={() => updatePptConfig('tone', tone)} />
                             </label>
                           ))}
                         </div>
                       </div>
    
                       {/* Topics */}
                       <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">포함할 주요 내용</label>
                         <div className="space-y-1.5">
                           {['Executive Summary', 'Q4 Revenue Overview', 'YoY Comparison', 'Regional Performance', 'Future Outlook'].map((topic) => (
                             <div 
                               key={topic} 
                               onClick={() => toggleTopic(topic)}
                               className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                                 pptConfig.topics.includes(topic) 
                                 ? 'bg-blue-50 border-blue-200' 
                                 : 'border-transparent hover:bg-gray-50'
                               }`}
                             >
                               <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                 pptConfig.topics.includes(topic) ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 bg-white'
                               }`}>
                                 {pptConfig.topics.includes(topic) && <Check size={10} />}
                               </div>
                               <span className="text-sm text-gray-700">{topic}</span>
                             </div>
                           ))}
                         </div>
                       </div>
    
                       {/* Count & Font */}
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">폰트 스타일</label>
                             <div className="relative">
                                <select 
                                  value={pptConfig.titleFont}
                                  onChange={(e) => updatePptConfig('titleFont', e.target.value)}
                                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#FF3C42]"
                                >
                                  <option value="Pretendard">Pretendard</option>
                                  <option value="Noto Sans KR">Noto Sans KR</option>
                                  <option value="Montserrat">Montserrat</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">슬라이드 수</label>
                             <input
                               type="number"
                               value={pptConfig.slideCount}
                               onChange={(e) => updatePptConfig('slideCount', e.target.value === '' ? '' : parseInt(e.target.value))}
                               className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#FF3C42]"
                               min={5} max={50}
                             />
                          </div>
                       </div>
    
                       {/* Action Button */}
                       <button 
                         onClick={handleGenerateStart}
                         className="w-full py-3 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform active:scale-[0.99]"
                       >
                         <Wand2 size={16} />
                         설정 완료 및 생성 (Generate)
                       </button>
                    </div>
                    
                    <p className="text-xs text-gray-400">
                      * 우측 패널에서 실시간 미리보기를 확인할 수 있습니다.
                    </p>
                  </div>
                </div>
            );
        } else if (pptStatus === 'generating') {
           return (
             <div className="flex gap-4 mb-2 animate-fade-in-up">
               <div className="w-8 h-8 rounded bg-[#FF3C42] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                 <span className="text-white font-bold text-xs">K</span>
               </div>
               <div className="flex-1 space-y-2">
                 <p className="text-gray-900 font-medium">보고서를 생성하고 있습니다. 잠시만 기다려주세요...</p>
                 <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{pptProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-[#FF3C42] transition-all duration-300" style={{ width: `${pptProgress}%` }}></div>
                    </div>
                 </div>
               </div>
             </div>
           );
        } else {
            // --- Complete State (Streaming) ---
            return <PPTDoneResponse slideCount={pptConfig.slideCount} onRequestSalesAnalysis={handleRequestSalesAnalysis} />;
        }
    }

    // 2. Anomaly Detection Scenario (Streaming)
    if (dashboardScenario === 'anomaly_cost_spike') {
        const agentMessage = contextData?.agentMessage || "이상 징후가 감지되었습니다.";
        return <AnomalyResponse agentMessage={agentMessage} />;
    }

    // 3. Sales Analysis Scenario (Streaming)
    const isSalesAnalysis = (dashboardType === 'financial' && dashboardScenario === 'sales_analysis');

    if (isSalesAnalysis) {
        return <SalesAnalysisResponse onComplete={handleSalesAnalysisComplete} onRequestPPT={handleRequestPPT} />;
    }

    // Default Fallback (Streaming)
    return <DefaultResponse dashboardType={dashboardType} />;
  };

  // 1. Result View (Split Layout)
  if (showDashboard) {
    const ARTIFACTS_PANEL_WIDTH = 18; // 아티팩트 패널 전용 너비 (15~20% 범위)
    const effectiveWidth = rightPanelType === 'artifacts' ? ARTIFACTS_PANEL_WIDTH : rightPanelWidth;
    const leftPanelWidthStyle = isRightPanelCollapsed ? '100%' : `${100 - effectiveWidth}%`;
    const rightPanelWidthStyle = isRightPanelCollapsed ? '0%' : `${effectiveWidth}%`;

    return (
        <div ref={containerRef} data-testid="analysis-view" className="flex w-full h-full animate-fade-in-up overflow-hidden relative">
             {/* Left Panel: User Query & Agent Analysis */}
             <div
               className="h-full flex flex-col border-r border-gray-200 bg-white transition-all duration-300 relative"
               style={{ width: leftPanelWidthStyle }}
             >
                 {/* 아티팩트 버튼 - absolute로 우측 상단 고정 */}
                 {isRightPanelCollapsed && artifacts.length > 0 && (
                   <div className="absolute top-4 right-6 z-10">
                     <button
                       onClick={openArtifactsPanel}
                       className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium border border-gray-200 shadow-sm"
                       title="이 작업의 모든 파일 보기"
                     >
                       <FolderOpen size={16} />
                       <span className="px-1.5 py-0.5 bg-gray-200 rounded-full text-xs font-bold">
                         {artifacts.length}
                       </span>
                     </button>
                   </div>
                 )}
                 <div ref={leftPanelRef} className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
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
                 </div>

                 {/* Bottom Input Area */}
                 <div className="p-4 pb-6 bg-white border-t border-gray-100 shrink-0 flex justify-center">
                   <div className="w-full max-w-3xl">
                    {/* 추천 프롬프트 칩 - 시나리오 완료 상태에 따라 표시 */}
                    {(pptStatus === 'done' || salesAnalysisComplete) && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {pptStatus === 'done' && (
                          <>
                            <button
                              onClick={() => handleSend('이 데이터로 매출 심층 분석해줘')}
                              className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 bg-white hover:border-[#FF3C42] hover:text-[#FF3C42] transition-colors"
                            >
                              이 데이터로 매출 심층 분석해줘
                            </button>
                            <button
                              onClick={() => handleSend('원가율 추이 분석해줘')}
                              className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 bg-white hover:border-[#FF3C42] hover:text-[#FF3C42] transition-colors"
                            >
                              원가율 추이 분석해줘
                            </button>
                          </>
                        )}
                        {salesAnalysisComplete && (
                          <>
                            <button
                              onClick={() => handleSend('이 분석 결과로 PPT 만들어줘')}
                              className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 bg-white hover:border-[#FF3C42] hover:text-[#FF3C42] transition-colors"
                            >
                              이 분석 결과로 PPT 만들어줘
                            </button>
                            <button
                              onClick={() => handleSend('경영진 보고서 생성해줘')}
                              className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-200 bg-white hover:border-[#FF3C42] hover:text-[#FF3C42] transition-colors"
                            >
                              경영진 보고서 생성해줘
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    <div className="relative bg-[#F3F4F6] rounded-xl border border-transparent focus-within:border-[#FF3C42] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#FF3C42] transition-all p-2 flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-[#FF3C42] transition-colors">
                            <Plus size={20} />
                        </button>
                        <textarea
                            ref={textareaRef}
                            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-[#000000] placeholder-gray-400 resize-none h-10 py-2 text-sm max-h-32 overflow-y-auto custom-scrollbar"
                            placeholder="추가 요청이나 질문을 입력하세요..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (inputValue.trim()) {
                                        handleSend(inputValue);
                                    }
                                }
                            }}
                        />
                        <button className="p-2 text-gray-400 hover:text-[#FF3C42] transition-colors">
                            <Mic size={20} />
                        </button>
                        <button 
                            className={`p-2 rounded-lg transition-all ${inputValue.trim() ? 'bg-[#FF3C42] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            disabled={!inputValue.trim()}
                            onClick={() => {
                                if (inputValue.trim()) {
                                    handleSend(inputValue);
                                }
                            }}
                        >
                            <ArrowUp size={18} />
                        </button>
                    </div>
                   </div>
                 </div>
             </div>

             {/* Resize Handle */}
             {!isRightPanelCollapsed && (
               <div
                 className="w-1 h-full bg-gray-200 hover:bg-[#FF3C42] cursor-col-resize flex items-center justify-center group transition-colors relative z-10"
                 onMouseDown={handleResizeStart}
               >
                 <div className="absolute w-4 h-12 flex items-center justify-center">
                   <GripVertical size={12} className="text-gray-400 group-hover:text-white transition-colors" />
                 </div>
               </div>
             )}

             {/* Right Panel: Visualization Dashboard */}
             <div
               data-testid="analysis-result"
               className={`h-full bg-gray-50 custom-scrollbar transition-all duration-300 relative ${
                 isRightPanelCollapsed ? 'overflow-hidden' : 'overflow-y-auto'
               } ${(dashboardType === 'ppt' || rightPanelType === 'artifacts') && !isRightPanelCollapsed ? 'p-0' : isRightPanelCollapsed ? 'p-0' : 'p-6'}`}
               style={{ width: rightPanelWidthStyle }}
             >
                {/* Panel Content */}
                {!isRightPanelCollapsed && (
                  <>
                    {/* Switch between Artifacts Panel, PPT Panel, and Dashboard */}
                    {rightPanelType === 'artifacts' ? (
                      <ArtifactsPanel
                        artifacts={artifacts}
                        onClose={() => {
                          setRightPanelType('dashboard');
                          toggleRightPanel();
                        }}
                        onDownloadAll={handleDownloadAllArtifacts}
                        onDownloadItem={handleDownloadArtifact}
                      />
                    ) : dashboardType === 'ppt' ? (
                      <PPTGenPanel
                        status={pptStatus === 'idle' ? 'setup' : pptStatus as 'setup'|'generating'|'done'}
                        config={pptConfig}
                        progress={pptProgress}
                        currentStageIndex={pptCurrentStage}
                        onCancel={handleReset}
                        onTogglePanel={toggleRightPanel}
                        slides={pptSlides}
                        onSlidesChange={setPptSlides}
                      />
                    ) : (
                      <Dashboard type={dashboardType} scenario={dashboardScenario} onTogglePanel={toggleRightPanel} />
                    )}
                  </>
                )}
             </div>

        </div>
    );
  }

  // Prevent Home View from rendering during transition
  if (!showDashboard && userQuery) {
      return null;
  }

  // 2. Initial Home View
  return (
    <div data-testid="analysis-view" className="flex flex-col items-center justify-center w-full h-full max-w-3xl mx-auto px-6 pb-20 animate-fade-in-up">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#000000] tracking-tight">
           무엇을 도와드릴까요?
        </h1>
      </div>

      <div className="w-full flex flex-col gap-6">
        <div className="relative bg-[#FFFFFF] rounded-2xl border border-[#848383] focus-within:border-[#FF3C42] transition-all shadow-lg p-4">
          
          {/* Context Chip (Visual Indicator) */}
          {contextData && (
             <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100 animate-fade-in-up">
                <Paperclip size={12} />
                <span>Context: {contextData.name}</span>
                <button onClick={() => setContextData(null)} className="ml-1 hover:text-blue-900"><X size={12}/></button>
             </div>
          )}

          <textarea
            ref={textareaRef}
            rows={1}
            className={`w-full bg-transparent border-none focus:ring-0 focus:outline-none text-[#000000] placeholder-[#848383] resize-none text-base max-h-[200px] overflow-y-auto ${contextData ? 'pt-8' : ''}`}
            style={{ padding: '16px 0' }}
            placeholder="작업을 할당하거나 무엇이든 질문하세요"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputValue.trim()) handleSend(inputValue);
                }
            }}
          />
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full text-[#848383] hover:text-[#FF3C42] transition-colors">
                <Plus size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full text-[#848383] hover:text-[#FF3C42] transition-colors">
                <Mic size={20} />
              </button>
              <button 
                className={`p-2 rounded-full transition-all ${inputValue ? 'bg-[#FF3C42] text-white' : 'bg-gray-200 text-[#848383] cursor-not-allowed'}`}
                disabled={!inputValue}
                onClick={() => inputValue && handleSend(inputValue)}
              >
                <ArrowUp size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* 퀵 액션 칩 */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {chips.map((chip, idx) => (
            <button 
              key={idx} 
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#848383] bg-[#FFFFFF] hover:bg-gray-50 hover:border-[#FF3C42] text-xs font-medium text-[#848383] hover:text-[#FF3C42] transition-all"
            >
              {chip.icon}
              {chip.label}
            </button>
          ))}
        </div>

        {/* 추천 질문 섹션 */}
        <div className="w-full mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedPrompts.map((item, idx) => (
                <button 
                key={idx}
                className="p-4 rounded-xl border border-[#848383] bg-[#FFFFFF] hover:bg-gray-50 hover:border-[#FF3C42] text-left transition-all group flex items-start gap-4 shadow-sm hover:shadow-md"
                onClick={() => handleSend(item.prompt)}
                >
                <div className="mt-0.5 p-2.5 rounded-lg bg-[#FFFFFF] border border-[#848383] group-hover:border-[#FF3C42] shrink-0">
                    {item.icon}
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-[#848383] group-hover:text-[#FF3C42]">{item.title}</span>
                    <span className="text-sm text-[#000000] leading-snug line-clamp-2 whitespace-pre-line">
                    {item.description || item.prompt}
                    </span>
                </div>
                </button>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AgentChatView;
