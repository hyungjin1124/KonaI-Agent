import React from 'react';
import { Check, Loader2 } from '../../icons';
import { SlideItem, SlideContent } from '../agent-chat/types';

interface SlideThumbnailItemProps {
  slide: SlideItem;
  isSelected: boolean;
  onClick: () => void;
  themeStyle: {
    bg: string;
    accent: string;
    text: string;
    sub: string;
  };
}

const SlideThumbnailItem: React.FC<SlideThumbnailItemProps> = ({
  slide,
  isSelected,
  onClick,
  themeStyle
}) => {
  const { id, status, content } = slide;
  const slideNumber = id < 10 ? `0${id}` : String(id);

  // Status-based styles
  const getContainerStyles = () => {
    const baseStyles = 'aspect-video rounded-lg border-2 cursor-pointer transition-all duration-200 relative overflow-hidden';

    if (isSelected) {
      return `${baseStyles} border-[#FF3C42] shadow-md ring-2 ring-[#FF3C42]/20`;
    }
    if (status === 'generating') {
      return `${baseStyles} border-[#FF3C42]/50 animate-pulse`;
    }
    if (status === 'completed') {
      return `${baseStyles} border-gray-200 hover:border-gray-300 hover:shadow-sm`;
    }
    // pending
    return `${baseStyles} border-dashed border-gray-200 opacity-50`;
  };

  // Render mini slide content preview
  const renderMiniContent = () => {
    if (status === 'pending') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className="text-[8px] text-gray-300">대기 중</div>
        </div>
      );
    }

    // Mini slide preview based on content type
    return (
      <div className={`w-full h-full p-2 ${themeStyle.bg}`}>
        {content.type === 'cover' && (
          <div className="h-full flex flex-col justify-center items-center">
            <div className={`w-4 h-4 rounded ${themeStyle.accent} mb-1 flex items-center justify-center`}>
              <span className="text-white text-[6px] font-bold">K</span>
            </div>
            <div className={`text-[7px] font-bold text-center leading-tight ${themeStyle.text}`}>
              {content.title.length > 20 ? content.title.slice(0, 20) + '...' : content.title}
            </div>
          </div>
        )}

        {content.type === 'toc' && (
          <div className="h-full flex flex-col">
            <div className={`text-[6px] font-bold mb-1 ${themeStyle.text}`}>{content.title}</div>
            <div className="flex-1 space-y-0.5">
              {content.bulletPoints?.slice(0, 3).map((_, i) => (
                <div key={i} className={`h-1 rounded ${themeStyle.accent} opacity-30`} style={{ width: `${60 + i * 10}%` }} />
              ))}
            </div>
          </div>
        )}

        {content.type === 'content' && (
          <div className="h-full flex flex-col">
            <div className={`text-[6px] font-bold mb-1 truncate ${themeStyle.text}`}>{content.title}</div>
            <div className="flex-1 space-y-0.5">
              {content.bulletPoints?.slice(0, 4).map((_, i) => (
                <div key={i} className="flex items-center gap-0.5">
                  <div className={`w-0.5 h-0.5 rounded-full ${themeStyle.accent}`} />
                  <div className={`h-0.5 rounded bg-gray-300`} style={{ width: `${55 + (i % 3) * 15}%` }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {content.type === 'chart' && (
          <div className="h-full flex flex-col">
            <div className={`text-[6px] font-bold mb-1 truncate ${themeStyle.text}`}>{content.title}</div>
            <div className="flex-1 flex items-end justify-center gap-0.5 pb-1">
              {content.chartData?.values.slice(0, 4).map((v, i) => (
                <div
                  key={i}
                  className={`w-2 rounded-t ${themeStyle.accent}`}
                  style={{ height: `${(v / Math.max(...(content.chartData?.values || [100]))) * 100}%`, opacity: 0.7 + i * 0.1 }}
                />
              ))}
            </div>
          </div>
        )}

        {content.type === 'comparison' && (
          <div className="h-full flex flex-col">
            <div className={`text-[6px] font-bold mb-1 truncate ${themeStyle.text}`}>{content.title}</div>
            <div className="flex-1 flex gap-1">
              <div className="flex-1 bg-gray-200 rounded opacity-50" />
              <div className={`flex-1 rounded ${themeStyle.accent} opacity-70`} />
            </div>
          </div>
        )}

        {content.type === 'summary' && (
          <div className="h-full flex flex-col justify-center items-center">
            <div className={`text-[7px] font-bold text-center ${themeStyle.text}`}>
              {content.title}
            </div>
            <div className={`mt-1 w-3/4 h-0.5 rounded ${themeStyle.accent} opacity-50`} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={getContainerStyles()} onClick={onClick}>
      {/* Slide number badge */}
      <div className={`absolute top-1 left-1 z-10 text-[8px] font-bold px-1 rounded ${
        status === 'generating' ? 'bg-[#FF3C42] text-white' :
        status === 'completed' ? 'bg-white/90 text-gray-600' :
        'bg-gray-100 text-gray-400'
      }`}>
        {slideNumber}
      </div>

      {/* Status indicator */}
      <div className="absolute top-1 right-1 z-10">
        {status === 'completed' && (
          <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
            <Check size={8} className="text-white" strokeWidth={3} />
          </div>
        )}
        {status === 'generating' && (
          <Loader2 size={10} className="text-[#FF3C42] animate-spin" />
        )}
      </div>

      {/* Mini content preview */}
      {renderMiniContent()}

      {/* Shimmer effect for generating */}
      {status === 'generating' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shimmer_1.5s_infinite]" />
      )}

      {/* Selection ring overlay */}
      {isSelected && (
        <div className="absolute inset-0 ring-2 ring-[#FF3C42] ring-inset rounded-lg pointer-events-none" />
      )}
    </div>
  );
};

export default SlideThumbnailItem;
