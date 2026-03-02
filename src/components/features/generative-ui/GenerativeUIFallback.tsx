import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface GenerativeUIFallbackProps {
  error: string;
  rawData?: unknown;
}

export const GenerativeUIFallback: React.FC<GenerativeUIFallbackProps> = ({
  error,
  rawData,
}) => {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center" data-testid="generative-ui-fallback">
      <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-amber-500" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        렌더링할 수 없습니다
      </h3>
      <p className="text-xs text-gray-500 max-w-sm mb-4">
        {error}
      </p>

      {rawData !== undefined && (
        <div className="w-full max-w-lg">
          <button
            onClick={() => setShowRaw(prev => !prev)}
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showRaw ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            원본 데이터 {showRaw ? '숨기기' : '보기'}
          </button>
          {showRaw && (
            <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 text-left overflow-auto max-h-60 whitespace-pre-wrap break-all">
              {typeof rawData === 'string'
                ? rawData
                : JSON.stringify(rawData, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
