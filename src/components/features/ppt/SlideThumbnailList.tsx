import React from 'react';
import SlideThumbnailItem from './SlideThumbnailItem';
import { SlideItem } from '../agent-chat/types';
import { PPTConfig } from '../../../types';

interface SlideThumbnailListProps {
  slides: SlideItem[];
  selectedSlideId: number;
  onSlideSelect: (id: number) => void;
  config: PPTConfig;
  progress: number;
}

const THEME_STYLES = {
  'Corporate Blue': { bg: 'bg-slate-50', accent: 'bg-blue-600', text: 'text-slate-900', sub: 'text-slate-500' },
  'Modern Dark': { bg: 'bg-gray-900', accent: 'bg-emerald-500', text: 'text-white', sub: 'text-gray-400' },
  'Nature Green': { bg: 'bg-stone-50', accent: 'bg-green-700', text: 'text-stone-800', sub: 'text-stone-600' }
};

const SlideThumbnailList: React.FC<SlideThumbnailListProps> = ({
  slides,
  selectedSlideId,
  onSlideSelect,
  config,
  progress
}) => {
  const themeStyle = THEME_STYLES[config.theme];
  const completedCount = slides.filter(s => s.status === 'completed').length;
  const generatingSlide = slides.find(s => s.status === 'generating');

  return (
    <div className="h-full flex flex-col bg-gray-50/50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            슬라이드
          </h4>
          <span className="text-[10px] font-mono text-gray-400">
            {completedCount}/{config.slideCount}
          </span>
        </div>
        {/* Mini progress bar */}
        <div className="mt-2 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FF3C42] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Thumbnail list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {slides.map((slide) => (
          <SlideThumbnailItem
            key={slide.id}
            slide={slide}
            isSelected={slide.id === selectedSlideId}
            onClick={() => {
              // Only allow selecting completed or generating slides
              if (slide.status !== 'pending') {
                onSlideSelect(slide.id);
              }
            }}
            themeStyle={themeStyle}
          />
        ))}
      </div>

      {/* Current generating indicator */}
      {generatingSlide && (
        <div className="px-4 py-2 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FF3C42] animate-pulse" />
            <span className="text-[10px] text-gray-600 font-medium">
              슬라이드 {generatingSlide.id} 생성 중...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideThumbnailList;
