
import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, Activity, Download, PanelRightClose,
  MessageCircleQuestion, ArrowLeft, Share2, Globe, Factory, Cpu, ShieldCheck,
  Play, ChevronLeft, ChevronRight, LayoutGrid, Monitor, Layout
} from 'lucide-react';
import { PieChartClickData } from '../types';

interface DashboardProps {
  type?: 'financial' | 'did' | 'ppt';
}

interface Slide {
    id: number;
    layout: 'title' | 'list' | 'bullets' | 'chart' | 'split' | 'center';
    title: string;
    subtitle?: string;
    items?: string[];
    left?: string;
    right?: string;
    chartType?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ type = 'financial' }) => {
  const [compositionView, setCompositionView] = useState<'overview' | 'platform_detail'>('overview');
  const [currentSlide, setCurrentSlide] = useState(0);

  // --- Financial Data ---
  const monthlyData = [
    { name: '1월', sales: 8.2, lastYear: 7.5 },
    { name: '2월', sales: 8.5, lastYear: 7.8 },
    { name: '3월', sales: 9.1, lastYear: 8.2 },
    { name: '4월', sales: 9.8, lastYear: 8.5 },
    { name: '5월', sales: 10.2, lastYear: 9.1 },
    { name: '6월', sales: 10.5, lastYear: 9.4 },
    { name: '7월', sales: 11.2, lastYear: 9.8 },
    { name: '8월', sales: 11.5, lastYear: 10.2 },
    { name: '9월', sales: 12.1, lastYear: 10.5 },
    { name: '10월', sales: 12.8, lastYear: 11.2 },
    { name: '11월', sales: 13.5, lastYear: 11.8 },
    { name: '12월', sales: 15.1, lastYear: 12.5 },
  ];

  const pieData = [
    { name: '플랫폼', value: 38 },
    { name: '핀테크', value: 27 },
    { name: '커머스', value: 20 },
    { name: 'B2B 솔루션', value: 10 },
    { name: '해외사업', value: 5 },
  ];

  const platformDetailData = [
    { name: '지역화폐', value: 45 },
    { name: '코나카드', value: 30 },
    { name: '택시 앱', value: 15 },
    { name: '기타 플랫폼', value: 10 },
  ];

  const clientData = [
    { name: '고객A', value: 14.2 },
    { name: '고객B', value: 12.8 },
    { name: '고객C', value: 10.5 },
    { name: '고객D', value: 9.2 },
    { name: '고객E', value: 8.5 },
  ];

  // --- DID Data ---
  const didRevenueData = [
    { name: 'Q1', domestic: 85, overseas: 145 },
    { name: 'Q2', domestic: 92, overseas: 160 },
    { name: 'Q3', domestic: 88, overseas: 185 },
    { name: 'Q4', domestic: 105, overseas: 210 },
  ];

  const metalCardCostData = [
    { name: 'Jan', cost: 15.2 },
    { name: 'Feb', cost: 14.8 },
    { name: 'Mar', cost: 14.5 },
    { name: 'Apr', cost: 14.1 },
    { name: 'May', cost: 13.8 },
    { name: 'Jun', cost: 13.5 },
  ];

  const topChipsData = [
    { name: 'Kona Chip A', value: 450, color: '#10B981' }, 
    { name: 'Kona Chip B', value: 320, color: '#3B82F6' },
    { name: 'Secure Element X', value: 280, color: '#666666' },
    { name: 'NFC Controller', value: 150, color: '#999999' },
    { name: 'Bio Sensor', value: 90, color: '#CCCCCC' },
  ];

  // --- PPT Data ---
  const slides: Slide[] = [
    { id: 1, layout: 'title', title: 'Q4 2025\n경영 실적 보고서', subtitle: '2025.12.31 | 전략기획실' },
    { id: 2, layout: 'list', title: '목차', items: ['01. 경영 성과 요약', '02. 주요 재무 지표', '03. 사업부별 성과', '04. 2026 목표 및 전략'] },
    { id: 3, layout: 'bullets', title: 'Executive Summary', items: ['매출 3,700억 원 달성 (YoY +12.5%)', '영업이익 500억 원 기록 (이익률 13.5%)', 'DID 해외 사업 매출 비중 66% 돌파'] },
    { id: 4, layout: 'chart', title: '재무 성과 (Financial Highlights)', chartType: 'bar' },
    { id: 5, layout: 'bullets', title: '주요 사업 성과', items: ['플랫폼 사업부: 월간 활성 사용자(MAU) 15% 증가', 'DID 사업부: 메탈 카드 원가율 1.7%p 절감', '글로벌 파트너십 3건 신규 체결'] },
    { id: 6, layout: 'split', title: '향후 계획', left: 'R&D 투자 확대\n- 차세대 보안 칩셋 개발\n- 블록체인 플랫폼 고도화', right: '신규 사옥 이전 준비\n- 업무 환경 개선\n- 스마트 오피스 구축' },
    { id: 7, layout: 'center', title: 'Q&A', subtitle: '감사합니다' },
  ];

  const COLORS = ['#000000', '#555555', '#848383', '#AAAAAA', '#E5E7EB'];

  const handlePieClick = (data: PieChartClickData | null) => {
    if (data && data.name === '플랫폼') {
      setCompositionView('platform_detail');
    }
  };

  const renderSlideContent = (slide: Slide) => {
      switch(slide.layout) {
          case 'title':
              return (
                  <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up">
                      <div className="w-20 h-20 bg-black rounded-full mb-8 flex items-center justify-center">
                          <span className="text-white font-bold text-2xl">K</span>
                      </div>
                      <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight whitespace-pre-line">{slide.title}</h1>
                      <div className="h-1 w-24 bg-[#FF3C42] mb-6"></div>
                      <p className="text-xl text-gray-500">{slide.subtitle}</p>
                  </div>
              );
          case 'list':
              return (
                  <div className="h-full flex flex-col p-4 animate-fade-in-up">
                      <h2 className="text-3xl font-bold text-gray-900 mb-10 pb-4 border-b-2 border-gray-100">{slide.title}</h2>
                      <div className="flex-1 flex flex-col justify-center space-y-6 pl-8">
                          {slide.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4 text-2xl font-medium text-gray-700">
                                  <span className="text-[#FF3C42] font-bold">{idx + 1}.</span>
                                  <span>{item.replace(/^\d+\.\s/, '')}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              );
          case 'bullets':
              return (
                  <div className="h-full flex flex-col p-4 animate-fade-in-up">
                      <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-gray-100">{slide.title}</h2>
                      <div className="flex-1 flex flex-col justify-center space-y-6">
                          {slide.items?.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                  <div className="mt-2.5 w-2 h-2 rounded-full bg-[#FF3C42] shrink-0"></div>
                                  <p className="text-xl leading-relaxed text-gray-700">{item}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              );
          case 'chart':
               return (
                  <div className="h-full flex flex-col p-4 animate-fade-in-up">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4 pb-4 border-b-2 border-gray-100">{slide.title}</h2>
                      <div className="flex-1 w-full h-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="lastYear" name="2024" fill="#E5E7EB" />
                                <Bar dataKey="sales" name="2025" fill="#000000" />
                            </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-center text-sm text-gray-500 mt-4">단위: 십억 원 (KRW Billion)</p>
                  </div>
               );
          case 'split':
              return (
                  <div className="h-full flex flex-col p-4 animate-fade-in-up">
                      <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-gray-100">{slide.title}</h2>
                      <div className="flex-1 grid grid-cols-2 gap-12">
                          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                              <h3 className="text-xl font-bold text-[#FF3C42] mb-4">전략 과제 A</h3>
                              <p className="whitespace-pre-line text-lg text-gray-700 leading-relaxed">{slide.left}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                              <h3 className="text-xl font-bold text-blue-600 mb-4">전략 과제 B</h3>
                              <p className="whitespace-pre-line text-lg text-gray-700 leading-relaxed">{slide.right}</p>
                          </div>
                      </div>
                  </div>
              );
          case 'center':
              return (
                  <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up bg-slate-900 text-white rounded-lg -m-12 p-12">
                      <h1 className="text-6xl font-bold mb-6">{slide.title}</h1>
                      <p className="text-2xl text-gray-300">{slide.subtitle}</p>
                  </div>
              );
          default:
              return null;
      }
  };

  // --- Render PPT View ---
  if (type === 'ppt') {
     return (
        <div className="flex h-full flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
            {/* PPT Header */}
            <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 bg-white shrink-0">
                <div className="flex items-center gap-2">
                    <Layout className="text-[#FF3C42]" size={18} />
                    <span className="font-semibold text-sm text-gray-800">Q4 2025 경영 실적 보고서.pptx</span>
                    <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded">Auto-Saved</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="프레젠테이션 시작"><Play size={18} className="fill-current"/></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="다운로드"><Download size={18} /></button>
                    <button className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md flex items-center gap-1.5 hover:bg-gray-800 transition-colors ml-2">
                        <Share2 size={12} /> Share
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden bg-[#F3F4F6]">
                {/* Thumbnails Sidebar */}
                <div className="w-52 bg-white border-r border-gray-200 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar shrink-0">
                    {slides.map((slide, idx) => (
                        <div 
                            key={slide.id} 
                            onClick={() => setCurrentSlide(idx)}
                            className={`group cursor-pointer flex flex-col gap-1 transition-all ${currentSlide === idx ? 'opacity-100 scale-[1.02]' : 'opacity-60 hover:opacity-100'}`}
                        >
                            <div className="flex justify-between items-center px-1">
                                <span className={`text-[10px] font-bold ${currentSlide === idx ? 'text-[#FF3C42]' : 'text-gray-400'}`}>{idx + 1}</span>
                            </div>
                            <div className={`aspect-video w-full rounded-lg border-2 overflow-hidden bg-white relative shadow-sm transition-all ${currentSlide === idx ? 'border-[#FF3C42] ring-2 ring-red-50' : 'border-gray-100 group-hover:border-gray-300'}`}>
                                {/* Mini Preview - Simplified Layout Representation */}
                                <div className="absolute inset-0 p-2 flex flex-col">
                                    {slide.layout === 'title' && (
                                        <div className="flex flex-col items-center justify-center h-full gap-1">
                                            <div className="w-4 h-4 rounded-full bg-gray-200"/>
                                            <div className="w-16 h-1 bg-gray-800 rounded"/>
                                            <div className="w-8 h-0.5 bg-gray-300 rounded"/>
                                        </div>
                                    )}
                                    {slide.layout === 'list' && (
                                        <div className="flex flex-col h-full gap-1 pt-1 pl-1">
                                            <div className="w-10 h-1 bg-gray-800 rounded mb-1"/>
                                            <div className="w-16 h-0.5 bg-gray-300 rounded"/>
                                            <div className="w-16 h-0.5 bg-gray-300 rounded"/>
                                            <div className="w-16 h-0.5 bg-gray-300 rounded"/>
                                        </div>
                                    )}
                                    {(slide.layout === 'bullets' || slide.layout === 'split') && (
                                        <div className="flex flex-col h-full gap-1 pt-1 pl-1">
                                            <div className="w-12 h-1 bg-gray-800 rounded mb-1"/>
                                            <div className="flex gap-1">
                                                <div className="w-1 h-1 rounded-full bg-gray-300"/>
                                                <div className="w-20 h-0.5 bg-gray-300 rounded"/>
                                            </div>
                                            <div className="flex gap-1">
                                                <div className="w-1 h-1 rounded-full bg-gray-300"/>
                                                <div className="w-18 h-0.5 bg-gray-300 rounded"/>
                                            </div>
                                        </div>
                                    )}
                                    {slide.layout === 'chart' && (
                                        <div className="flex flex-col h-full gap-1 pt-1">
                                            <div className="w-12 h-1 bg-gray-800 rounded ml-1 mb-1"/>
                                            <div className="flex items-end justify-center h-full gap-1 pb-1">
                                                <div className="w-2 h-4 bg-gray-200 rounded-t"/>
                                                <div className="w-2 h-6 bg-gray-300 rounded-t"/>
                                                <div className="w-2 h-3 bg-gray-200 rounded-t"/>
                                                <div className="w-2 h-5 bg-gray-300 rounded-t"/>
                                            </div>
                                        </div>
                                    )}
                                    {slide.layout === 'center' && (
                                        <div className="flex flex-col items-center justify-center h-full bg-gray-800 -m-2">
                                            <div className="w-10 h-1 bg-white/50 rounded"/>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Preview Area */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                   <div className="flex-1 p-8 md:p-12 flex items-center justify-center overflow-auto">
                        <div className="aspect-video w-full max-w-5xl bg-white shadow-xl rounded-lg border border-gray-200 flex flex-col transition-all duration-300 relative">
                             {/* Slide Content Render */}
                             {renderSlideContent(slides[currentSlide])}
                             
                             {/* Slide Footer */}
                             {slides[currentSlide].layout !== 'center' && (
                                <div className="absolute bottom-4 right-6 text-xs text-gray-300 font-medium">
                                    CONFIDENTIAL | 2025
                                </div>
                             )}
                        </div>
                   </div>

                   {/* Floating Pagination Controls */}
                   <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-white px-2 py-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 z-10">
                        <button 
                            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                            disabled={currentSlide === 0}
                            className="p-1.5 hover:bg-gray-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        <div className="px-3 flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-700 min-w-[3rem] text-center">
                                {currentSlide + 1} <span className="text-gray-300">/</span> {slides.length}
                            </span>
                        </div>

                        <button 
                            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                            disabled={currentSlide === slides.length - 1}
                            className="p-1.5 hover:bg-gray-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                        
                        <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
                        
                        <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-black transition-colors" title="모두 보기">
                            <LayoutGrid size={14} />
                        </button>
                   </div>
                </div>
            </div>
        </div>
     )
  }

  // --- Common Dashboard Global Header for Financial/DID ---
  const renderCommonHeader = () => (
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">
           {type === 'did' ? 'DID Business Unit Analysis' : '2025 Performance Dashboard'}
        </h2>
        <div className="flex items-center gap-2">
           <button className="p-2 text-gray-500 hover:text-black hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200" title="공유하기">
             <Share2 size={18} />
           </button>
           <button className="p-2 text-gray-500 hover:text-black hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200" title="데이터 다운로드">
             <Download size={18} />
           </button>
           <button className="p-2 text-gray-500 hover:text-black hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200" title="패널 접기">
             <PanelRightClose size={18} />
           </button>
        </div>
      </div>
  );

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in-up pb-10 h-full">
      {renderCommonHeader()}

      {type === 'did' ? (
        /* --- DID Dashboard Layout --- */
        <div className="flex flex-col gap-6">
           {/* Chart 1: Domestic vs Overseas Revenue */}
           <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-[#10B981] transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">DID 분기별 매출 구성 (국내 vs 해외)</p>
                        <h4 className="text-xl font-bold text-gray-900 mt-1">Global 66% 달성 <span className="text-sm text-green-500 font-medium ml-1">▲ 해외사업부 주도</span></h4>
                    </div>
                    <div className="p-1.5 bg-green-50 text-green-600 rounded-lg"><Globe size={18}/></div>
                </div>
                <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={didRevenueData} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} dy={5} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} cursor={{fill: '#F9FAFB'}} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                            {/* Domestic: Blue, Overseas: Green/Teal (Higher) */}
                            <Bar dataKey="domestic" name="국내사업부" fill="#3B82F6" barSize={32} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="overseas" name="해외사업부" fill="#10B981" barSize={32} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
           </div>

           {/* Chart 2: Cost Trend */}
           <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-[#10B981] transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">메탈 카드 원가율 추이</p>
                        <h4 className="text-xl font-bold text-gray-900 mt-1">13.5% <span className="text-sm text-green-500 font-medium ml-1">▼ 1.7%p</span></h4>
                    </div>
                    <div className="p-1.5 bg-green-50 text-green-600 rounded-lg"><Factory size={18}/></div>
                </div>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={metalCardCostData}>
                             <defs>
                                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} dy={5} />
                            <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Area type="monotone" dataKey="cost" name="원가율(%)" stroke="#10B981" strokeWidth={2} fill="url(#colorCost)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
           </div>

           {/* Chart 3: Chip Sales */}
           <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-[#3B82F6] transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">주력 칩셋 판매량 Top 5</p>
                        <h4 className="text-xl font-bold text-gray-900 mt-1">Kona Chip A 1위</h4>
                    </div>
                    <div className="p-1.5 bg-gray-50 text-gray-600 rounded-lg"><Cpu size={18}/></div>
                </div>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={topChipsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fontWeight: 500}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} cursor={{fill: '#F9FAFB'}} />
                            <Bar dataKey="value" barSize={16} radius={[0, 4, 4, 0]}>
                                {topChipsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
           </div>
        </div>
      ) : type === 'financial' ? (
        /* --- Financial Dashboard Layout (Default) --- */
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* KPI 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 relative overflow-hidden group hover:border-[#FF3C42] transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <TrendingUp size={12} /> +12.6% YoY
                        </span>
                    </div>
                    <button className="text-gray-400 hover:text-[#FF3C42] transition-colors" title="이 지표에 대해 질문하기">
                        <MessageCircleQuestion size={16} />
                    </button>
                </div>
                <div className="text-3xl font-bold text-black mb-1">₩128.4b</div>
                <div className="text-gray-500 text-sm">2025 총매출</div>
                
                <div className="absolute right-4 bottom-4 w-24 h-12 opacity-20 group-hover:opacity-40 transition-opacity">
                   <svg viewBox="0 0 100 50" className="w-full h-full stroke-black fill-none stroke-2">
                     <path d="M0 40 Q 25 45 50 25 T 100 5" />
                   </svg>
                </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 relative overflow-hidden group hover:border-[#FF3C42] transition-colors shadow-sm">
                 <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <Activity size={12} /> 안정적
                        </span>
                    </div>
                    <button className="text-gray-400 hover:text-[#FF3C42] transition-colors" title="이 지표에 대해 질문하기">
                        <MessageCircleQuestion size={16} />
                    </button>
                </div>
                <div className="text-3xl font-bold text-black mb-1">₩10.7b</div>
                <div className="text-gray-500 text-sm">월평균 매출</div>
                 
                 <div className="absolute right-4 bottom-4 w-24 h-12 opacity-20 flex items-end gap-1 group-hover:opacity-40 transition-opacity">
                   <div className="w-1/4 h-[40%] bg-black"></div>
                   <div className="w-1/4 h-[60%] bg-black"></div>
                   <div className="w-1/4 h-[80%] bg-black"></div>
                   <div className="w-1/4 h-[100%] bg-black"></div>
                </div>
            </div>

            {/* Full Width Charts */}
            <div className="col-span-1 xl:col-span-2 space-y-6">
                {/* Chart 1: Monthly Sales Trend */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-black mb-0.5">월별 매출 추이</h3>
                            <p className="text-xs text-gray-500">2025년 매출(₩b), 계절성 반영</p>
                        </div>
                        <button className="text-gray-400 hover:text-[#FF3C42] transition-colors" title="이 차트에 대해 질문하기">
                            <MessageCircleQuestion size={16} />
                        </button>
                    </div>
                    <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData} margin={{top: 5, right: 10, left: -20, bottom: 0}}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#848383'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#848383'}} />
                        <Tooltip 
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                            itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                        />
                        <Line type="monotone" dataKey="sales" stroke="#000000" strokeWidth={2} dot={{r: 3, fill: '#000000'}} activeDot={{r: 6, fill: '#FF3C42'}} />
                        </LineChart>
                    </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Business Composition */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
                                {compositionView === 'platform_detail' && (
                                    <button 
                                        onClick={() => setCompositionView('overview')}
                                        className="p-1 hover:bg-gray-100 rounded-full mr-1 transition-colors"
                                    >
                                        <ArrowLeft size={14} />
                                    </button>
                                )}
                                {compositionView === 'overview' ? '사업부별 매출 구성' : '플랫폼 사업부 세부 현황'}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {compositionView === 'overview' 
                                    ? '2025년 합계 기준 비중 (플랫폼 클릭 시 상세 보기)' 
                                    : '플랫폼 부문 서비스별 매출 기여도'}
                            </p>
                        </div>
                        <button className="text-gray-400 hover:text-[#FF3C42] transition-colors" title="이 차트에 대해 질문하기">
                            <MessageCircleQuestion size={16} />
                        </button>
                    </div>

                    <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        {compositionView === 'overview' ? (
                            <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                                onClick={handlePieClick}
                                className="cursor-pointer"
                            >
                                {pieData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]} 
                                    className="hover:opacity-80 transition-opacity outline-none"
                                />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
                            </PieChart>
                        ) : (
                            <BarChart data={platformDetailData} layout="vertical" margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tickLine={false} axisLine={false} tick={{fontSize: 11, fill: '#333', fontWeight: 500}} />
                                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                <Bar dataKey="value" barSize={24} radius={[0, 4, 4, 0]}>
                                    {platformDetailData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#FF3C42' : '#555555'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                    
                    {compositionView === 'overview' && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-4 text-center pointer-events-none">
                            <span className="text-2xl font-bold text-black">100%</span>
                        </div>
                    )}
                    </div>
                </div>

                {/* Chart 3 & 4 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Chart 3: Top Clients */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-sm font-bold text-black mb-1">주요 거래처 Top 5</h3>
                                <p className="text-xs text-gray-500">2025 매출 (₩b)</p>
                            </div>
                            <button className="text-gray-400 hover:text-[#FF3C42] transition-colors" title="이 차트에 대해 질문하기">
                                <MessageCircleQuestion size={16} />
                            </button>
                        </div>
                        <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={clientData} barSize={20} margin={{top: 0, right: 10, left: 10, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={40} tickLine={false} axisLine={false} tick={{fontSize: 11, fill: '#848383'}} />
                            <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {clientData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#000000' : '#848383'} />
                                ))}
                            </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart 4: YoY Growth */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-sm font-bold text-black mb-1">전년 동기 대비 성장률</h3>
                                <p className="text-xs text-gray-500">2024 vs 2025 월별 비교</p>
                            </div>
                            <button className="text-gray-400 hover:text-[#FF3C42] transition-colors" title="이 차트에 대해 질문하기">
                                <MessageCircleQuestion size={16} />
                            </button>
                        </div>
                        <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} barGap={2} margin={{top: 5, right: 10, left: -20, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#848383'}} interval={1} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#848383'}} />
                            <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                            <Legend iconType="circle" wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
                            <Bar name="2024" dataKey="lastYear" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                            <Bar name="2025" dataKey="sales" fill="#000000" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;
