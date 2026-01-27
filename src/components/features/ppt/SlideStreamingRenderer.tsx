import React from 'react';
import SlideContentRenderer from './SlideContentRenderer';
import { SlideItem, StreamingState } from '../agent-chat/types';
import { PPTConfig } from '../../../types';
import { Loader2 } from '../../icons';

interface SlideStreamingRendererProps {
  slide: SlideItem | null;
  streamingState: StreamingState;
  config: PPTConfig;
  totalSlides: number;
}

const SlideStreamingRenderer: React.FC<SlideStreamingRendererProps> = ({
  slide,
  streamingState,
  config,
  totalSlides
}) => {
  // No slide selected
  if (!slide) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50/50">
        <Loader2 size={32} className="text-gray-300 animate-spin mb-4" />
        <p className="text-sm text-gray-400">슬라이드를 생성하고 있습니다...</p>
      </div>
    );
  }

  const isStreaming = slide.status === 'generating' && streamingState.isStreaming;
  const slideNumber = slide.id < 10 ? `0${slide.id}` : String(slide.id);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Slide preview area */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-100/50">
        <div className="w-full max-w-4xl">
          {/* Slide frame */}
          <div className="aspect-video rounded-xl shadow-2xl overflow-hidden border border-gray-200/50 relative">
            <SlideContentRenderer
              content={slide.content}
              config={config}
              streamingState={streamingState}
              isStreaming={isStreaming}
            />

            {/* Generating overlay */}
            {slide.status === 'generating' && (
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-[#FF3C42] text-white text-xs font-bold rounded-full flex items-center gap-2 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                생성 중
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            slide.status === 'generating' ? 'bg-[#FF3C42]/10 text-[#FF3C42]' :
            slide.status === 'completed' ? 'bg-green-50 text-green-600' :
            'bg-gray-100 text-gray-500'
          }`}>
            {slide.status === 'generating' ? '생성 중' :
             slide.status === 'completed' ? '완료' : '대기 중'}
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {slide.content.title}
          </span>
        </div>
        <div className="text-sm text-gray-400 font-mono">
          Slide {slideNumber} / {totalSlides < 10 ? `0${totalSlides}` : totalSlides}
        </div>
      </div>
    </div>
  );
};

export default SlideStreamingRenderer;
