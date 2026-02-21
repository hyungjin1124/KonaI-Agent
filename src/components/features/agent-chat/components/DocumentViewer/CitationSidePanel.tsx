import { memo } from 'react';
import { Quote, X, ExternalLink } from 'lucide-react';
import type { Citation } from './types';

interface CitationSidePanelProps {
  citations: Citation[];
  onClose: () => void;
}

export const CitationSidePanel = memo(function CitationSidePanel({
  citations,
  onClose,
}: CitationSidePanelProps) {
  if (citations.length === 0) {
    return (
      <div className="w-64 shrink-0 border-l border-gray-200 bg-gray-50/50 flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
            <Quote className="w-3.5 h-3.5" />
            인용 소스
          </div>
          <button
            onClick={onClose}
            className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
            aria-label="인용 패널 닫기"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <p className="text-xs text-gray-400 text-center">
            이 문서에 인용 소스가 없습니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <aside
      className="w-64 shrink-0 border-l border-gray-200 bg-gray-50/50 flex flex-col overflow-hidden"
      aria-label="인용 소스 패널"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
          <Quote className="w-3.5 h-3.5" />
          인용 소스
          <span className="ml-1 px-1.5 py-0.5 bg-gray-200 rounded-full text-[10px] text-gray-500">
            {citations.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
          aria-label="인용 패널 닫기"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {citations.map((citation) => (
          <div
            key={citation.id}
            id={`citation-${citation.id}`}
            className="rounded-lg border border-gray-200 bg-white p-2.5 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                {citation.number}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-800 line-clamp-2">
                  {citation.title}
                </p>
                {citation.excerpt && (
                  <p className="mt-1 text-[11px] text-gray-500 line-clamp-3">
                    {citation.excerpt}
                  </p>
                )}
                {citation.url && (
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-3 h-3" />
                    원본 보기
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
});
