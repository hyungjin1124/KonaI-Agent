import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  CheckCircle2, Loader2, FileText, Sparkles,
  LayoutTemplate, Palette, Pause, XCircle, PanelRightClose, Download
} from './icons';
import { SlideThumbnailList, SlideStreamingRenderer, generateMockSlides } from './features/ppt';
import { SlideItem, StreamingState } from './features/agent-chat/types';

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
  slides: SlideItem[];
  onSlidesChange: (slides: SlideItem[]) => void;
}

// Export status type for type safety
export type PPTGenPanelStatus = PPTGenPanelProps['status'];

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

const PPTGenPanel: React.FC<PPTGenPanelProps> = ({ status, config, progress, currentStageIndex, onCancel, onTogglePanel, slides, onSlidesChange }) => {
  const themeStyle = THEME_STYLES[config.theme];

  // Local alias for slides setter (for backwards compatibility)
  const setSlides = onSlidesChange;
  const [selectedSlideId, setSelectedSlideId] = useState<number>(1);
  const [streamingState, setStreamingState] = useState<StreamingState>({
    currentSlideId: 1,
    streamedContent: { title: '', subtitle: '', bulletPoints: [] },
    isStreaming: false,
    cursorVisible: true
  });

  // Ref to track slides without triggering useEffect re-runs
  const slidesRef = useRef<SlideItem[]>([]);

  // Keep slidesRef in sync with slides state
  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  // Initialize slides when generation starts
  useEffect(() => {
    if (status === 'generating' && slides.length === 0) {
      const mockSlides = generateMockSlides(config.slideCount);
      const initialSlides: SlideItem[] = mockSlides.map((content, idx) => ({
        id: idx + 1,
        status: idx === 0 ? 'generating' : 'pending',
        content
      }));
      setSlides(initialSlides);
      setSelectedSlideId(1);
    } else if (status === 'setup') {
      setSlides([]);
      setSelectedSlideId(1);
    }
    // Note: Removed status === 'done' slides update to prevent flickering
    // Slides status is already managed by progress-based completion in the next useEffect
  }, [status, config.slideCount]);

  // Progress-based slide completion simulation
  useEffect(() => {
    if (slides.length === 0) return;

    // When done, mark all slides as completed (only if not already all completed)
    if (status === 'done') {
      const allCompleted = slides.every(s => s.status === 'completed');
      if (!allCompleted) {
        setSlides(slides.map(slide => ({
          ...slide,
          status: 'completed'
        })));
      }
      return;
    }

    if (status !== 'generating') return;

    const completedCount = Math.floor((progress / 100) * config.slideCount);
    const currentGeneratingId = Math.min(completedCount + 1, config.slideCount);

    setSlides(slides.map(slide => {
      if (slide.id < currentGeneratingId) {
        return { ...slide, status: 'completed' };
      }
      if (slide.id === currentGeneratingId) {
        return { ...slide, status: 'generating' };
      }
      return { ...slide, status: 'pending' };
    }));

    // Auto-select the currently generating slide
    if (selectedSlideId < currentGeneratingId) {
      setSelectedSlideId(currentGeneratingId);
    }

    // Update streaming state
    setStreamingState(prev => ({
      ...prev,
      currentSlideId: currentGeneratingId,
      isStreaming: true
    }));
  }, [progress, status, config.slideCount, slides.length]);

  // Typing effect simulation - uses slidesRef to avoid re-triggering on slides change
  useEffect(() => {
    if (status !== 'generating' && status !== 'done') return;

    const selectedSlide = slidesRef.current.find(s => s.id === selectedSlideId);
    if (!selectedSlide || selectedSlide.status === 'pending') return;

    const { content } = selectedSlide;
    const isCurrentlyGenerating = selectedSlide.status === 'generating';

    if (!isCurrentlyGenerating) {
      // Show completed slide fully
      setStreamingState(prev => ({
        ...prev,
        currentSlideId: selectedSlideId,
        streamedContent: {
          title: content.title,
          subtitle: content.subtitle || '',
          bulletPoints: content.bulletPoints || []
        },
        isStreaming: false
      }));
      return;
    }

    // Streaming effect for generating slide
    let charIndex = 0;
    const fullTitle = content.title;
    const fullSubtitle = content.subtitle || '';
    const fullBullets = content.bulletPoints || [];

    const typeNextChar = () => {
      // Calculate what to show based on charIndex
      const titleLength = fullTitle.length;
      const subtitleLength = fullSubtitle.length;
      const totalBulletChars = fullBullets.reduce((acc, b) => acc + b.length, 0);
      const totalChars = titleLength + subtitleLength + totalBulletChars;

      if (charIndex >= totalChars) {
        // Typing complete - mark as not streaming
        setStreamingState(prev => ({
          ...prev,
          isStreaming: false
        }));
        return;
      }

      let streamedTitle = '';
      let streamedSubtitle = '';
      let streamedBullets: string[] = [];

      if (charIndex < titleLength) {
        streamedTitle = fullTitle.slice(0, charIndex + 1);
      } else if (charIndex < titleLength + subtitleLength) {
        streamedTitle = fullTitle;
        streamedSubtitle = fullSubtitle.slice(0, charIndex - titleLength + 1);
      } else {
        streamedTitle = fullTitle;
        streamedSubtitle = fullSubtitle;
        let bulletCharIndex = charIndex - titleLength - subtitleLength;
        for (const bullet of fullBullets) {
          if (bulletCharIndex >= bullet.length) {
            streamedBullets.push(bullet);
            bulletCharIndex -= bullet.length;
          } else if (bulletCharIndex >= 0) {
            streamedBullets.push(bullet.slice(0, bulletCharIndex + 1));
            break;
          }
        }
      }

      setStreamingState(prev => ({
        ...prev,
        streamedContent: {
          title: streamedTitle,
          subtitle: streamedSubtitle,
          bulletPoints: streamedBullets
        }
      }));

      charIndex++;
    };

    // Initial state
    setStreamingState(prev => ({
      ...prev,
      currentSlideId: selectedSlideId,
      streamedContent: { title: '', subtitle: '', bulletPoints: [] },
      isStreaming: true
    }));

    // Start typing - slower speed (100ms for more readable streaming)
    const typingInterval = setInterval(typeNextChar, 100);

    return () => clearInterval(typingInterval);
  }, [selectedSlideId, status]);  // Removed 'slides' from dependencies

  // Cursor blink effect
  useEffect(() => {
    if (!streamingState.isStreaming) return;

    const blinkInterval = setInterval(() => {
      setStreamingState(prev => ({
        ...prev,
        cursorVisible: !prev.cursorVisible
      }));
    }, 500);

    return () => clearInterval(blinkInterval);
  }, [streamingState.isStreaming]);

  // Handle slide selection
  const handleSlideSelect = useCallback((id: number) => {
    setSelectedSlideId(id);
  }, []);

  const selectedSlide = slides.find(s => s.id === selectedSlideId) || null;

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

  // Check if generation is complete
  const isComplete = status === 'done';

  // --- Render: Generating/Done Mode (2-Column Layout) ---
  return (
    <div className="h-full flex flex-col bg-white animate-fade-in-up overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            {isComplete ? (
              <>
                <CheckCircle2 size={18} className="text-green-500" />
                Presentation Complete!
              </>
            ) : (
              <>
                <Loader2 size={18} className="text-[#FF3C42] animate-spin" />
                Generating Presentation...
              </>
            )}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isComplete
              ? `${config.slideCount}개의 슬라이드가 생성되었습니다`
              : `${currentStageIndex + 1}/6 ${STAGES[currentStageIndex]}`
            }
          </p>
        </div>
        <div className="flex gap-2">
          {isComplete ? (
            <button className="px-4 py-2 bg-[#FF3C42] text-white rounded-lg text-sm font-medium hover:bg-[#E63338] transition-all flex items-center gap-2">
              <Download size={16} />
              다운로드
            </button>
          ) : (
            <>
              <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-gray-700 transition-all">
                <Pause size={16} />
              </button>
              <button onClick={onCancel} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-red-500 transition-all">
                <XCircle size={16} />
              </button>
            </>
          )}
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
          className={`h-full transition-all duration-300 ease-out ${
            isComplete ? 'bg-green-500' : 'bg-[#FF3C42] shadow-[0_0_10px_rgba(255,60,66,0.3)]'
          }`}
          style={{ width: isComplete ? '100%' : `${progress}%` }}
        />
      </div>

      {/* 2-Column Layout: Thumbnails + Streaming Renderer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Thumbnail List (30%) */}
        <div className="w-[30%] min-w-[180px] border-r border-gray-100">
          <SlideThumbnailList
            slides={slides}
            selectedSlideId={selectedSlideId}
            onSlideSelect={handleSlideSelect}
            config={config}
            progress={isComplete ? 100 : progress}
          />
        </div>

        {/* Right: Streaming Renderer (70%) */}
        <div className="flex-1">
          <SlideStreamingRenderer
            slide={selectedSlide}
            streamingState={streamingState}
            config={config}
            totalSlides={config.slideCount}
          />
        </div>
      </div>
    </div>
  );
};

export default PPTGenPanel;
