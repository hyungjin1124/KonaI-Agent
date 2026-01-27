
import React, { useEffect, useState } from 'react';
import {
  CheckCircle2, Loader2, FileText, Sparkles,
  LayoutTemplate, Palette, Type, Image as ImageIcon,
  MousePointerClick, Clock, AlertCircle, Play, Pause, XCircle, PanelRightClose
} from './icons';

export interface PPTConfig {
  theme: 'Corporate Blue' | 'Modern Dark' | 'Nature Green';
  tone: 'Data-driven' | 'Formal' | 'Storytelling';
  topics: string[];
  titleFont: string;
  bodyFont: string;
  slideCount: number;
}

interface PPTGenPanelProps {
  status: 'setup' | 'generating' | 'done';
  config: PPTConfig;
  progress: number;
  currentStageIndex: number;
  onCancel: () => void;
  onTogglePanel?: () => void;
}

const STAGES = [
  '보고서 구조 분석 및 목차 생성',
  '슬라이드 레이아웃 최적화',
  '테마 및 타이포그래피 적용',
  '데이터 시각화 및 차트 생성',
  '비주얼 계층 구조 조정',
  '프레젠테이션 최종 마무리'
];

const THEME_STYLES = {
  'Corporate Blue': { bg: 'bg-slate-50', accent: 'bg-blue-600', text: 'text-slate-900', sub: 'text-slate-500' },
  'Modern Dark': { bg: 'bg-gray-900', accent: 'bg-emerald-500', text: 'text-white', sub: 'text-gray-400' },
  'Nature Green': { bg: 'bg-stone-50', accent: 'bg-green-700', text: 'text-stone-800', sub: 'text-stone-600' }
};

const PPTGenPanel: React.FC<PPTGenPanelProps> = ({ status, config, progress, currentStageIndex, onCancel, onTogglePanel }) => {
  const [thumbnails, setThumbnails] = useState<number[]>([]);
  const themeStyle = THEME_STYLES[config.theme];

  // Simulate thumbnails appearing during generation
  useEffect(() => {
    if (status === 'generating') {
      const count = Math.ceil((progress / 100) * config.slideCount);
      setThumbnails(Array.from({ length: count }, (_, i) => i + 1));
    } else if (status === 'setup') {
      setThumbnails([]);
    }
  }, [progress, status, config.slideCount]);

  // --- Render: Setup / Preview Mode ---
  if (status === 'setup') {
    return (
      <div className="h-full flex flex-col bg-gray-50/50 p-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
              <LayoutTemplate size={18} className="text-[#FF3C42]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Live Preview</h3>
              <p className="text-xs text-gray-500">설정에 따라 실시간으로 업데이트됩니다</p>
            </div>
          </div>
          {onTogglePanel && (
            <button
              onClick={onTogglePanel}
              className="p-2 text-gray-500 hover:text-black hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
              title="패널 접기"
            >
              <PanelRightClose size={18} />
            </button>
          )}
        </div>

        {/* Live Preview Card */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className={`w-full aspect-video rounded-xl shadow-2xl border border-gray-200/50 transition-all duration-500 flex flex-col overflow-hidden relative group ${themeStyle.bg}`}>
            
            {/* Slide Header */}
            <div className="absolute top-6 left-8 right-8 flex justify-between items-start">
              <div className={`w-8 h-8 rounded ${themeStyle.accent} opacity-90 flex items-center justify-center`}>
                <span className="text-white font-bold text-xs">K</span>
              </div>
              <div className={`text-xs font-medium opacity-50 ${themeStyle.text}`}>2025 CONFIDENTIAL</div>
            </div>

            {/* Slide Body */}
            <div className="flex-1 flex flex-col justify-center px-12 md:px-16 z-10">
              <div className={`text-sm font-bold uppercase tracking-widest mb-4 opacity-70 ${themeStyle.accent === 'bg-emerald-500' ? 'text-emerald-400' : 'text-[#FF3C42]'}`}>
                Business Report
              </div>
              <h1 
                className={`text-4xl md:text-5xl font-bold mb-6 leading-tight transition-all duration-300 ${themeStyle.text}`}
                style={{ fontFamily: config.titleFont }}
              >
                Q4 2025<br/>경영 실적 보고서
              </h1>
              <p 
                className={`text-lg md:text-xl font-light max-w-md leading-relaxed transition-all duration-300 ${themeStyle.sub}`}
                style={{ fontFamily: config.bodyFont }}
              >
                전략기획실 | 2025.12.31
              </p>
            </div>

            {/* Visual Decor elements */}
            <div className={`absolute bottom-0 right-0 w-1/3 h-full opacity-5 ${themeStyle.text} pointer-events-none`}>
               <svg viewBox="0 0 100 100" fill="currentColor">
                 <path d="M50 0 L100 100 L0 100 Z" />
               </svg>
            </div>
            
            {/* Hover Indicator */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
              <div className="px-4 py-2 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-gray-900 shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all">
                표지 미리보기
              </div>
            </div>
          </div>

          {/* Config Summary Chips */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 flex items-center gap-2 shadow-sm">
              <Palette size={12} className="text-gray-400" />
              {config.theme}
            </div>
            <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 flex items-center gap-2 shadow-sm">
              <Sparkles size={12} className="text-gray-400" />
              {config.tone}
            </div>
            <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 flex items-center gap-2 shadow-sm">
              <FileText size={12} className="text-gray-400" />
              {config.slideCount} Slides
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Render: Generating Mode ---
  return (
    <div className="h-full flex flex-col bg-white animate-fade-in-up overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Loader2 size={18} className="text-[#FF3C42] animate-spin" />
            Generating Presentation...
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">AI Agent가 보고서를 생성하고 있습니다</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-gray-700 transition-all">
            <Pause size={16} />
          </button>
          <button onClick={onCancel} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-red-500 transition-all">
            <XCircle size={16} />
          </button>
          {onTogglePanel && (
            <button
              onClick={onTogglePanel}
              className="p-2 text-gray-500 hover:text-black hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
              title="패널 접기"
            >
              <PanelRightClose size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-1">
        <div 
          className="h-full bg-[#FF3C42] transition-all duration-300 ease-out shadow-[0_0_10px_rgba(255,60,66,0.3)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* Stage List */}
        <div className="mb-8 space-y-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Process Status</h4>
          <div className="space-y-3 relative">
             {/* Connector Line */}
             <div className="absolute left-3 top-2 bottom-4 w-0.5 bg-gray-100 -z-10"></div>
             
             {STAGES.map((stage, idx) => {
               const isComplete = idx < currentStageIndex;
               const isCurrent = idx === currentStageIndex;
               
               return (
                 <div key={idx} className={`flex items-center gap-4 transition-all duration-500 ${isCurrent ? 'scale-100 opacity-100' : isComplete ? 'opacity-50' : 'opacity-30'}`}>
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 bg-white ${
                     isComplete ? 'border-[#FF3C42] text-[#FF3C42]' : 
                     isCurrent ? 'border-[#FF3C42] animate-pulse' : 'border-gray-200'
                   }`}>
                     {isComplete ? <CheckCircle2 size={12} strokeWidth={3} /> : 
                      isCurrent ? <div className="w-2 h-2 rounded-full bg-[#FF3C42]" /> : null}
                   </div>
                   <span className={`text-sm font-medium ${isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>{stage}</span>
                   {isCurrent && <span className="text-xs text-[#FF3C42] font-bold animate-pulse ml-auto">Processing...</span>}
                 </div>
               );
             })}
          </div>
        </div>

        {/* Live Thumbnails Grid */}
        <div>
          <div className="flex justify-between items-center mb-4">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Slide Previews ({thumbnails.length}/{config.slideCount})</h4>
             <span className="text-[10px] text-gray-400 font-mono">{progress}% Complete</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {thumbnails.map((id) => (
              <div key={id} className="aspect-video bg-gray-50 rounded border border-gray-100 flex items-center justify-center animate-fade-in-up relative overflow-hidden group">
                 {/* Mock Content */}
                 <div className="w-3/4 space-y-2 opacity-30 group-hover:opacity-50 transition-opacity">
                    <div className="w-1/2 h-2 bg-gray-400 rounded"></div>
                    <div className="w-full h-1 bg-gray-300 rounded"></div>
                    <div className="w-full h-1 bg-gray-300 rounded"></div>
                    <div className="w-2/3 h-1 bg-gray-300 rounded"></div>
                 </div>
                 <div className="absolute top-2 left-2 text-[10px] font-bold text-gray-300">{id < 10 ? `0${id}` : id}</div>
                 
                 {/* Scanning Effect */}
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_1.5s_infinite]"></div>
              </div>
            ))}
            {/* Loading Placeholder */}
            {thumbnails.length < config.slideCount && (
              <div className="aspect-video bg-gray-50/30 rounded border border-dashed border-gray-200 flex items-center justify-center">
                 <Loader2 size={16} className="text-gray-300 animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PPTGenPanel;
