
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Mic, ArrowUp, FileText, Globe, Box, Palette, MoreHorizontal, 
  TrendingUp, PieChart, Users, RotateCcw, MonitorPlay, Layers, 
  FileImage, Sparkles, Check, ChevronDown, Wand2
} from 'lucide-react';
import Dashboard from './Dashboard';
import PPTGenPanel, { PPTConfig } from './PPTGenPanel';

const ChatInterface: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [dashboardType, setDashboardType] = useState<'financial' | 'did' | 'ppt'>('financial');
  
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

  const handleSend = (text: string) => {
    if (!showDashboard) {
        setInputValue(text);
    }
    
    setUserQuery(text);
    
    const isDidRequest = text.includes('DID') || text.includes('메탈') || text.includes('칩셋');
    const isPptRequest = text.includes('PPT') || text.includes('보고서') || text.includes('슬라이드');
    const isFinancialRequest = text.includes('코나아이') || text.includes('ERP') || text.includes('매출') || text.includes('실적');

    let targetType: 'financial' | 'did' | 'ppt' | null = null;
    
    if (isPptRequest) {
      targetType = 'ppt';
      setPptStatus('setup'); // Start PPT Setup Flow
    } else if (isDidRequest) {
      targetType = 'did';
      setPptStatus('idle');
    } else if (isFinancialRequest) {
      targetType = 'financial';
      setPptStatus('idle');
    }

    if (targetType) {
        setDashboardType(targetType);
        
        if (showDashboard) {
             setInputValue('');
        } else {
             setTimeout(() => {
                 setShowDashboard(true);
                 setInputValue('');
             }, 800);
        }
    } else {
        if (showDashboard) setInputValue('');
    }
  };

  const handleReset = () => {
    setInputValue('');
    setShowDashboard(false);
    setUserQuery('');
    setDashboardType('financial');
    setPptStatus('idle');
    setPptProgress(0);
  };

  useEffect(() => {
    if (showDashboard && leftPanelRef.current) {
        leftPanelRef.current.scrollTop = leftPanelRef.current.scrollHeight;
    }
  }, [showDashboard, userQuery, pptStatus]); // Added pptStatus dependency

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
    if (dashboardType === 'ppt') {
        if (pptStatus === 'setup') {
          // --- Conversational Form ---
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
             <div data-testid="ppt-generating-indicator" className="flex gap-4 mb-2 animate-fade-in-up">
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
            // --- Complete State (Existing Logic) ---
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

    // Default for financial/did
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
        <div data-testid="ppt-chat-interface" className="flex w-full h-full animate-fade-in-up overflow-hidden">
             {/* Left Panel: User Query & Agent Analysis */}
             <div className="w-1/2 h-full flex flex-col border-r border-gray-200 bg-white">
                 <div ref={leftPanelRef} className="flex-1 overflow-y-auto p-6 custom-scrollbar scroll-smooth">
                     {/* Top Controls */}
                     <div className="flex items-center justify-between mb-8 sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-2">
                         <button 
                            onClick={handleReset}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-[#FF3C42] hover:border-[#FF3C42] transition-colors"
                         >
                            <RotateCcw size={12} /> 처음으로
                         </button>
                     </div>

                     {/* User Query Bubble */}
                     <div className="flex justify-end mb-10">
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
             <div className={`h-full overflow-y-auto bg-gray-50 custom-scrollbar ${dashboardType === 'ppt' ? 'w-1/2 p-0' : 'w-1/2 p-6'}`}>
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
                  <Dashboard type={dashboardType} />
                )}
             </div>
        </div>
    );
  }

  // 2. Initial Home View
  return (
    <div data-testid="ppt-chat-interface" className="flex flex-col items-center justify-center w-full h-full max-w-3xl mx-auto px-6 pb-20 animate-fade-in-up">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#000000] tracking-tight">
           무엇을 도와드릴까요?
        </h1>
      </div>

      <div className="w-full flex flex-col gap-6">
        <div className="relative bg-[#FFFFFF] rounded-2xl border border-[#848383] focus-within:border-[#FF3C42] transition-all shadow-lg p-4">
          <textarea
            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-[#000000] placeholder-[#848383] resize-none h-20 text-base"
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

export default ChatInterface;
