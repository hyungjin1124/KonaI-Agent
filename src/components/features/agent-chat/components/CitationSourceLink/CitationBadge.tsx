import React from 'react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Citation } from '../../types';

interface CitationBadgeProps {
  citation: Citation;
}

export const CitationBadge: React.FC<CitationBadgeProps> = ({ citation }) => {
  const badge = (
    <button
      className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-[10px] font-semibold rounded bg-gray-200 text-gray-600 hover:bg-[#FF3C42] hover:text-white transition-colors cursor-pointer align-super leading-none"
      aria-label={`출처 ${citation.index}: ${citation.title}`}
      onClick={() => {
        if (citation.url) {
          window.open(citation.url, '_blank', 'noopener,noreferrer');
        }
      }}
    >
      {citation.index}
    </button>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs bg-white text-gray-900 border border-gray-200 shadow-lg p-3 rounded-lg"
        >
          <p className="text-xs font-semibold text-gray-900 leading-snug">
            {citation.title}
          </p>
          {citation.snippet && (
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed line-clamp-2">
              {citation.snippet}
            </p>
          )}
          {citation.domain && (
            <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-gray-100 text-[8px] text-center leading-3 font-bold text-gray-500">
                {citation.domain.charAt(0).toUpperCase()}
              </span>
              {citation.domain}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
