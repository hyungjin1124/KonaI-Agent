import React from 'react';
import { Citation } from '../../types';

interface SourceLinkListProps {
  citations: Citation[];
}

export const SourceLinkList: React.FC<SourceLinkListProps> = ({ citations }) => {
  const citationsWithUrl = citations.filter((c) => c.url);

  if (citationsWithUrl.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
        출처
      </p>
      <div className="flex flex-wrap gap-1.5">
        {citationsWithUrl.map((citation) => (
          <a
            key={citation.id}
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-gray-600 bg-gray-50 border border-gray-150 rounded-lg hover:bg-gray-100 hover:border-gray-300 hover:text-gray-900 transition-colors group"
            aria-label={`출처 ${citation.index}: ${citation.title}`}
          >
            <span className="inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold rounded bg-gray-200 text-gray-500 group-hover:bg-[#FF3C42] group-hover:text-white transition-colors">
              {citation.index}
            </span>
            <span className="max-w-[180px] truncate font-medium">
              {citation.title}
            </span>
            {citation.domain && (
              <span className="text-gray-400 text-[10px] hidden sm:inline">
                · {citation.domain}
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
};
