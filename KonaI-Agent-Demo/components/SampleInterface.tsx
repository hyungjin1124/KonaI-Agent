import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Plus, Mic, ArrowUp, FileText, Globe, Box, Palette, MoreHorizontal,
  TrendingUp, PieChart, Users, RotateCcw, MonitorPlay, FileImage, Sparkles, Check, ChevronDown, Wand2, Paperclip, X,
  ArrowRight
} from 'lucide-react';
import Dashboard from './Dashboard';
import PPTGenPanel from './PPTGenPanel';
import { SampleInterfaceContext, PPTConfig, SuggestionItem, QuickActionChip } from '../types';
import { useCaptureStateInjection, StateInjectionHandlers } from '../hooks';

const SampleInterface: React.FC<{ initialQuery?: string; initialContext?: SampleInterfaceContext }> = ({
  initialQuery,
  initialContext
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showDashboard, setShowDashboard] = useState(!!initialQuery);
  const [userQuery, setUserQuery] = useState(initialQuery || '');
  const [dashboardType, setDashboardType] = useState<'financial' | 'did' | 'ppt'>('financial');

  const [dashboardScenario, setDashboardScenario] = useState<string | undefined>(undefined);

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

  // 캡처 자동화용 상태 주입 핸들러
  const stateInjectionHandlers = useMemo<StateInjectionHandlers>(() => ({
    setShowDashboard,
  }), []);

  // 외부 상태 주입 훅 사용 (Puppeteer 캡처 자동화 지원)
  useCaptureStateInjection(stateInjectionHandlers);

  // Auto-trigger if initialQuery is provided
  useEffect(() => {
    if (initialQuery) {
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

  const suggestedPrompts: SuggestionItem[] = [
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
  ];

  // Added 'immediate' parameter to control transition delay
  const handleSend = (text: string, immediate: boolean = false) => {
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
    
    if (isPptRequest) {
      targetType = 'ppt';
      setPptStatus('setup');
    } else if (isDidRequest) {
      targetType = 'did';
      setPptStatus('idle');
    } else {
      targetType = 'financial';
      setPptStatus('idle');
    }

    setDashboardType(targetType);
    if (targetScenario) setDashboardScenario(targetScenario);

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
  };

  const handleReset = () => {
    setInputValue('');
    setShowDashboard(false);
    setUserQuery('');
    setDashboardType('financial');
    setDashboardScenario(undefined);
    setPptStatus('idle');
    setPptProgress(0);
    setContextData(null); // Clear context
  };

  useEffect(() => {
    if (showDashboard && leftPanelRef.current) {
        leftPanelRef.current.scrollTop = leftPanelRef.current.scrollHeight;
    }
  }, [showDashboard, userQuery, pptStatus]);

  const handleGenerateStart = () => {
    setPptStatus('generating');
    setPptProgress(0);
  };

  const updatePptConfig = <K extends keyof PPTConfig>(key: K, value: PPTConfig[K]) => {
    setPptConfig(prev => ({ ...prev, [key]: value }));
  };

  const toggleTopic = (topic: string) => {
    setPptConfig(prev => {
      const exists = prev.topics.includes(topic);
      if (exists) return { ...prev, topics: prev.topics.filter(t => t !== topic) };
      return { ...prev, topics: [...prev.topics, topic] };
    });
  };

  // Helper to render content based on dashboard type
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
                               onChange={(e) => updatePptConfig('slideCount', parseInt(e.target.value) || 0)}
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
            // --- Complete State ---
            return (
                <div className="flex gap-4 mb-2 animate-fade-in-up">
                    <div className="w-8 h-8 rounded bg-[#FF3C42] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                        <span className="text-white font-bold text-xs">K</span>
                    </div>
                    <div className="flex-1 space-y-6">
                        <div className="prose prose-sm">
                            <h3 className="text-lg font-bold text-black mb-2">
                                Presentation created: Q4 2025 경영 실적 보고서
                            </h3>
                            <p className="text-gray-700 leading-relaxed text-sm mb-4">
                                요청하신 내용을 바탕으로 경영 실적, 재무 성과, 사업부별 주요 성과 및 향후 계획을 포함한 <strong>{pptConfig.slideCount}장의 슬라이드</strong>를 초안으로 작성했습니다.
                            </p>
                        </div>

                        {/* Related Queries / Actions for PPT */}
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Related Actions</p>
                            
                            <button className="w-full text-left p-3 rounded-lg border bg-white border-gray-200 hover:border-[#FF3C42] hover:text-[#FF3C42] transition-colors text-sm flex items-center justify-between group">
                                <span>최신 ERP 데이터 연동 및 차트 업데이트</span>
                                <Plus size={14} className="text-gray-400 group-hover:text-[#FF3C42]" />
                            </button>
                            <button className="w-full text-left p-3 rounded-lg border bg-white border-gray-200 hover:border-[#FF3C42] hover:text-[#FF3C42] transition-colors text-sm flex items-center justify-between group">
                                <span>각 사업부별 대표 이미지 플레이스홀더 추가</span>
                                <FileImage size={14} className="text-gray-400 group-hover:text-[#FF3C42]" />
                            </button>
                            <button className="w-full text-left p-3 rounded-lg border bg-white border-gray-200 hover:border-[#FF3C42] hover:text-[#FF3C42] transition-colors text-sm flex items-center justify-between group">
                                <span>'향후 계획' 슬라이드에 세부 로드맵 추가</span>
                                <Sparkles size={14} className="text-gray-400 group-hover:text-[#FF3C42]" />
                            </button>
                        </div>
                        
                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mt-2">
                            <MonitorPlay size={16} />
                            <span>슬라이드 쇼 모드로 보기</span>
                        </button>
                    </div>
                </div>
            );
        }
    }

    // 2. Anomaly Detection Scenario
    if (dashboardScenario === 'anomaly_cost_spike') {
        const agentMessage = contextData?.agentMessage || "이상 징후가 감지되었습니다.";
        
        return (
            <div className="flex gap-4 mb-2 animate-fade-in-up">
                <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center shrink-0 mt-1 shadow-sm animate-pulse">
                    <span className="text-white font-bold text-xs">!</span>
                </div>
                <div className="flex-1 space-y-6">
                    <div className="prose prose-sm max-w-none text-gray-800">
                        <h3 className="text-lg font-bold text-red-600 mb-3 border-b border-red-100 pb-2 flex items-center gap-2">
                           [Urgent] 공정 원가율 이상 급등 감지
                        </h3>
                        
                        <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-4">
                            <p className="font-medium text-red-900 leading-relaxed">
                                {agentMessage.split('**').map((part: string, i: number) => 
                                    i % 2 === 1 ? <strong key={i} className="bg-red-200/50 px-1 rounded">{part}</strong> : part
                                )}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-900 mb-2">원인 분석 (Root Cause Analysis)</h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                <li><strong>13:00~14:00 구간</strong> 자동화 설비 3호기 센서 오작동으로 인한 수율 저하 발생</li>
                                <li>긴급 투입된 수동 검수 인력 비용이 실시간 노무비에 반영됨</li>
                            </ul>
                        </div>

                        <div className="pt-2">
                            <h4 className="font-bold text-gray-900 mb-2">권장 조치 (Action Items)</h4>
                            <div className="space-y-2">
                                <button className="w-full text-left p-3 rounded-xl bg-black text-white hover:bg-gray-800 transition-all text-sm flex items-center justify-between group shadow-md">
                                    <span className="font-bold">현장 책임자(김철수 부장) 즉시 호출 및 설비 점검 지시</span>
                                    <ArrowRight size={16} />
                                </button>
                                <button className="w-full text-left p-3 rounded-xl border bg-white border-gray-200 hover:border-red-500 hover:text-red-600 transition-all text-sm flex items-center justify-between group">
                                    <span>3호기 가동 중단 및 예비 4호기 대체 투입 시뮬레이션</span>
                                    <RotateCcw size={16} className="text-gray-400 group-hover:text-red-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Enhanced Sales Analysis Scenario (Integrated Approach) - MODIFIED: Text-based Analytical Narrative
    const isSalesAnalysis = (dashboardType === 'financial' && dashboardScenario === 'sales_analysis');

    if (isSalesAnalysis) {
        return (
            <div className="flex gap-4 mb-2 animate-fade-in-up w-full">
                <div className="w-8 h-8 rounded bg-[#FF3C42] flex items-center justify-center shrink-0 mt-1 shadow-sm h-fit">
                    <span className="text-white font-bold text-xs">K</span>
                </div>
                <div className="flex-1 min-w-0">
                    {/* Deep Analysis Text Content */}
                    <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
                        
                        {/* Section 1: Executive Summary */}
                        <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                            12월 경영 실적 심층 분석: 양적 성장과 질적 개선의 동시 달성
                        </h3>
                        <p className="mb-6">
                            2025년 12월 결산 결과, 당사는 <strong>월 매출 420억 원</strong>을 기록하며 전월(370억 원) 대비 <strong>+13.5%의 가파른 성장세</strong>를 실현했습니다. 이는 당초 목표치였던 385억 원을 약 9% 초과 달성한 수치로, 올해 들어 가장 높은 월간 실적입니다. 더욱 고무적인 점은 매출 성장과 함께 영업이익률이 <strong>18.2%</strong>(전월비 +2.1%p)로 개선되었다는 사실입니다. 이는 단순한 물량 확대(Volume Growth)를 넘어, 수익성 중심의 제품 믹스 개선과 공정 효율화가 동시에 이루어진 '질적 성장'의 결과로 분석됩니다.
                        </p>

                        <hr className="my-6 border-gray-200" />

                        {/* Section 2: Revenue Drivers */}
                        <h4 className="text-lg font-bold text-gray-900 mb-3 text-blue-800">
                            1. 매출 상승의 핵심 동인 (Revenue Drivers Breakdown)
                        </h4>
                        <p className="mb-4">
                            금번 매출 상승은 크게 <strong>P(가격)와 Q(수량)의 동반 상승</strong>에 기인합니다. 세부 요인은 다음과 같습니다.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-6 text-gray-700">
                            <li>
                                <strong>주요 고객사 수주 확대 (Volume Effect):</strong> 최대 고객사인 <strong>A은행</strong>의 신규 체크카드 런칭에 따른 초도 물량 20만 장 공급이 12월에 집중되었습니다. 또한, 연말 카드사들의 예산 소진 목적의 선발주 물량이 유입되며 B2B 부문 매출을 견인했습니다.
                            </li>
                            <li>
                                <strong>제품 믹스 개선에 따른 ASP 상승 (Price Effect):</strong> 기존 일반 플라스틱 카드 대비 단가가 3배 이상 높은 <strong>'Gold Edition' 메탈 카드</strong>의 출고 비중이 전월 12%에서 18%로 확대되었습니다. 특히 B카드사의 VIP 라인업 개편 전략과 맞물려 고부가 제품군 매출이 전월 대비 22억 원 증가했습니다.
                            </li>
                            <li>
                                <strong>계절적 성수기 효과:</strong> 12월은 전통적인 결제 단말기 및 카드 교체 수요가 높은 시기로, 플랫폼 사업부의 결제 수수료 매출 또한 전월 대비 8% 자연 증가하며 실적 하단을 지지했습니다.
                            </li>
                        </ul>

                        {/* Section 3: Cost Structure Analysis */}
                        <h4 className="text-lg font-bold text-gray-900 mb-3 text-green-800">
                            2. 원가 구조 및 수익성 분석 (Cost Efficiency Deep Dive)
                        </h4>
                        <p className="mb-4">
                            매출 증가보다 주목할 점은 <strong>원가율의 획기적 개선(68% → 62%)</strong>입니다. 원가율 6%p 하락은 영업이익 규모를 약 25억 원 추가 확보하는 효과를 냈습니다.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-6 text-gray-700">
                            <li>
                                <strong>공정 자동화 효과 가시화:</strong> 지난 10월 도입된 <strong>3라인 후가공 자동화 설비</strong>의 가동률이 12월 들어 95% 궤도에 올랐습니다. 이로 인해 수작업 공정 대비 불량률이 2.1%에서 0.5% 미만으로 급감하였으며, 단위당 노무비가 15% 절감되는 직접적인 효과를 거두었습니다.
                            </li>
                            <li>
                                <strong>원자재 조달 최적화:</strong> 최근 니켈 등 원자재 가격 변동성이 확대되었으나, 구매팀의 <strong>'메탈 플레이트 6개월분 선계약(Hedging)'</strong> 전략이 주효했습니다. 시장가 대비 약 12% 저렴한 단가로 자재를 투입함으로써 재료비 원가 경쟁력을 유지할 수 있었습니다.
                            </li>
                            <li>
                                <strong>고정비 레버리지 효과:</strong> 매출 규모(Q)가 커지면서 감가상각비 등 고정비 비중이 희석되는 '영업 레버리지' 효과가 극대화되었습니다. 이는 공장 가동률 상승이 수익성 개선으로 직결되는 제조업의 전형적인 선순환 구조입니다.
                            </li>
                        </ul>

                        <hr className="my-6 border-gray-200" />

                        {/* Section 4: Strategic Recommendations */}
                        <h4 className="text-lg font-bold text-gray-900 mb-3">
                            3. 향후 리스크 및 전략적 제언 (Strategic Outlook)
                        </h4>
                        <p className="mb-4">
                            긍정적인 12월 실적에도 불구하고, 2026년 1분기를 대비한 몇 가지 리스크 관리와 전략적 의사결정이 필요합니다.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
                            <strong className="block text-gray-900 mb-2">💡 CEO Action Items</strong>
                            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                                <li>
                                    <strong>저수익 고객군 구조조정 검토:</strong> 현재 역성장 중인 <strong>C카드사</strong> 등 저마진 범용 제품 위주의 고객사에 대해서는 단가 인상 협상 또는 'Premium Mix'로의 전환을 강력히 제안해야 합니다. 수익성이 낮은 매출은 과감히 축소하고, 고부가 라인에 생산 CAPA를 집중하는 '선택과 집중' 전략이 유효합니다.
                                </li>
                                <li>
                                    <strong>설비 투자(CAPEX) 조기 집행:</strong> 현재 가동률이 95%에 육박함에 따라, 1분기 예상 수주 물량을 소화하기 위해서는 <strong>자동화 라인 2호기 발주</strong>를 서둘러야 합니다. 납기 리드타임을 고려할 때 1월 내 의사결정이 필요합니다.
                                </li>
                                <li>
                                    <strong>환율 리스크 모니터링:</strong> 원자재 수입 비중이 높은 만큼, 최근 환율 상승 기조에 대비하여 1분기 결제 통화 포트폴리오를 점검할 필요가 있습니다.
                                </li>
                            </ol>
                        </div>
                        
                        <p className="text-sm text-gray-500 mt-4 text-right">
                            * 본 분석은 ERP 실시간 데이터(2025.12.31 기준)를 토대로 작성되었습니다.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Default Fallback
    return (
        <div className="flex gap-4 mb-2 animate-fade-in-up">
            <div className="w-8 h-8 rounded bg-[#FF3C42] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <span className="text-white font-bold text-xs">K</span>
            </div>
            <div className="flex-1 space-y-6">
                <div className="prose prose-sm">
                    <h3 className="text-lg font-bold text-black mb-2">
                        {dashboardType === 'did' ? 'DID 사업부 분석 리포트' : '데이터 분석 결과 리포트'}
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm mb-4">
                        {dashboardType === 'did' 
                            ? '요청하신 DID 사업부의 매출 구성, 원가율 추이 및 주요 칩셋 판매량을 분석했습니다. 글로벌 시장 비중 확대와 원가 절감 노력이 가시적인 성과를 보이고 있습니다.'
                            : '요청하신 코나아이 ERP 2025년 데이터를 기반으로 월별 매출, 사업부 구성, 주요 거래처 현황을 시각화했습니다. 데이터 분석 결과, 전반적인 성장세가 확인됩니다.'
                        }
                    </p>
                </div>

                {/* Analysis Highlights Cards */}
                <div className="space-y-3">
                        {dashboardType === 'did' ? (
                        <>
                            <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 hover:border-orange-200 transition-colors">
                                <h4 className="font-bold text-orange-900 text-sm mb-1 flex items-center gap-2">
                                    <span className="text-lg">🌍</span> 글로벌 매출 비중 확대
                                </h4>
                                <p className="text-orange-800 text-xs leading-relaxed pl-7">
                                    해외 매출 비중이 전분기 대비 <strong>대폭 증가하여 66%</strong>를 달성했습니다. 이는 DID 기술의 해외 수출 계약 건수 증가에 기인합니다.
                                </p>
                            </div>
                            <div className="p-4 bg-green-50/50 rounded-xl border border-green-100 hover:border-green-200 transition-colors">
                                <h4 className="font-bold text-green-900 text-sm mb-1 flex items-center gap-2">
                                    <span className="text-lg">📉</span> 원가율 1.7%p 개선
                                </h4>
                                <p className="text-green-800 text-xs leading-relaxed pl-7">
                                    메탈 카드 공정 자동화 도입으로 원가율이 <strong>13.5%</strong>까지 낮아졌으며, 이는 사업부 수익성 개선의 핵심 요인입니다.
                                </p>
                            </div>
                        </>
                        ) : (
                        <>
                            {/* Card 1: Seasonality */}
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 hover:border-blue-200 transition-colors">
                                <h4 className="font-bold text-blue-900 text-sm mb-1 flex items-center gap-2">
                                    <span className="text-lg">📈</span> 연말 매출 급증 (Seasonality)
                                </h4>
                                <p className="text-blue-800 text-xs leading-relaxed pl-7">
                                    11월부터 매출이 가파르게 상승하여 <strong>12월에 연중 최고치(151억 원)</strong>를 기록했습니다. 이는 연말 프로모션 효과와 IT 예산 집행이 4분기에 집중된 결과로 해석됩니다.
                                </p>
                            </div>
                            
                            {/* Card 2: Business Focus */}
                            <div className="p-4 bg-[#FFF8F6] rounded-xl border border-stone-200 hover:border-stone-300 transition-colors">
                                <h4 className="font-bold text-stone-900 text-sm mb-1 flex items-center gap-2">
                                    <span className="text-lg">💼</span> 핵심 사업부 집중도 심화
                                </h4>
                                <p className="text-stone-700 text-xs leading-relaxed pl-7">
                                    <strong>플랫폼(38%)</strong>과 <strong>핀테크(27%)</strong> 사업부가 전체 매출의 과반(65%)을 차지하며 회사의 캐시카우 역할을 하고 있습니다. 신사업인 B2B 솔루션도 10% 비중으로 안착했습니다.
                                </p>
                            </div>

                            {/* Card 3: Dependency (Restored) */}
                            <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 hover:border-orange-200 transition-colors">
                                <h4 className="font-bold text-orange-900 text-sm mb-1 flex items-center gap-2">
                                    <span className="text-lg">⚠️</span> 상위 거래처 의존도
                                </h4>
                                <p className="text-orange-800 text-xs leading-relaxed pl-7">
                                    상위 3개 거래처(Top 3)가 전체 매출의 <strong>약 31%</strong>를 점유하고 있습니다. 리스크 분산을 위해 중소형 클라이언트 확대 전략이 필요합니다.
                                </p>
                            </div>

                            {/* Card 4: YoY Growth (Restored) */}
                            <div className="p-4 bg-green-50/50 rounded-xl border border-green-100 hover:border-green-200 transition-colors">
                                <h4 className="font-bold text-green-900 text-sm mb-1 flex items-center gap-2">
                                    <span className="text-lg">🚀</span> 지속적인 YoY 성장
                                </h4>
                                <p className="text-green-800 text-xs leading-relaxed pl-7">
                                    전월 대비 변동성은 존재하나, 전년 동기(YoY) 대비로는 꾸준한 우상향 추세를 유지하고 있어 2025년 목표 달성이 긍정적입니다.
                                </p>
                            </div>
                        </>
                        )}
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                        우측 패널에서 상세 차트와 원본 데이터를 확인하실 수 있습니다. 추가 분석이 필요하면 말씀해 주세요.
                    </p>
                </div>
            </div>
        </div>
    );
  };

  // 1. Result View (Split Layout)
  if (showDashboard) {
    return (
        <div data-testid="analysis-view" className="flex w-full h-full animate-fade-in-up overflow-hidden">
             {/* Left Panel: User Query & Agent Analysis */}
             <div className="w-1/2 h-full flex flex-col border-r border-gray-200 bg-white">
                 <div ref={leftPanelRef} className="flex-1 overflow-y-auto p-6 custom-scrollbar scroll-smooth">
                     
                     {/* User Query Bubble */}
                     <div className="flex justify-end mb-10 mt-6">
                        <div className="bg-gray-100 text-black px-5 py-4 rounded-2xl rounded-tr-sm max-w-[90%] border border-gray-200 shadow-sm">
                            <p className="text-sm leading-relaxed whitespace-pre-line font-medium">{userQuery}</p>
                        </div>
                     </div>

                     {/* Agent Response Area (Dynamic) */}
                     {renderAgentResponse()}
                     
                     <div className="h-6"></div>
                 </div>

                 {/* Bottom Input Area */}
                 <div className="p-4 pb-6 bg-white border-t border-gray-100 shrink-0">
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

             {/* Right Panel: Visualization Dashboard */}
             <div data-testid="analysis-result" className={`h-full overflow-y-auto bg-gray-50 custom-scrollbar ${dashboardType === 'ppt' ? 'w-1/2 p-0' : 'w-1/2 p-6'}`}>
                {/* Switch between Generation Panel and Final Dashboard */}
                {(dashboardType === 'ppt' && pptStatus !== 'done') ? (
                  <PPTGenPanel 
                    status={pptStatus === 'idle' ? 'setup' : pptStatus as 'setup'|'generating'} 
                    config={pptConfig}
                    progress={pptProgress}
                    currentStageIndex={pptCurrentStage}
                    onCancel={handleReset}
                  />
                ) : (
                  <Dashboard type={dashboardType} scenario={dashboardScenario} />
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

export default SampleInterface;
