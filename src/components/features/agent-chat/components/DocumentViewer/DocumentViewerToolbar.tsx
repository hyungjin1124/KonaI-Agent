import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Download,
  Maximize2,
  Minimize2,
  X,
  ListTree,
  Quote,
  Fullscreen,
} from 'lucide-react';
import type { ViewMode } from './types';

interface DocumentViewerToolbarProps {
  fileName: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'csv' | 'pptx';
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitToWidth?: () => void;
  onFitToPage?: () => void;
  onDownload: () => void;
  onClose: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  // Phase 3: TOC, Citation, Fullscreen
  showTOC?: boolean;
  onToggleTOC?: () => void;
  hasTOCItems?: boolean;
  showCitations?: boolean;
  onToggleCitations?: () => void;
  hasCitations?: boolean;
  viewMode?: ViewMode;
  onToggleFullscreen?: () => void;
}

const ZOOM_STEPS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export const DocumentViewerToolbar: React.FC<DocumentViewerToolbarProps> = ({
  fileName,
  fileType,
  currentPage,
  totalPages,
  onPageChange,
  zoom,
  onZoomChange,
  onFitToWidth,
  onFitToPage,
  onDownload,
  onClose,
  isMaximized = false,
  onToggleMaximize,
  showTOC = false,
  onToggleTOC,
  hasTOCItems = false,
  showCitations = false,
  onToggleCitations,
  hasCitations = false,
  viewMode = 'embedded',
  onToggleFullscreen,
}) => {
  const [pageInputValue, setPageInputValue] = useState('');
  const [isEditingPage, setIsEditingPage] = useState(false);

  const handleZoomIn = () => {
    const nextStep = ZOOM_STEPS.find((s) => s > zoom);
    onZoomChange(nextStep ?? ZOOM_STEPS[ZOOM_STEPS.length - 1]);
  };

  const handleZoomOut = () => {
    const prevStep = [...ZOOM_STEPS].reverse().find((s) => s < zoom);
    onZoomChange(prevStep ?? ZOOM_STEPS[0]);
  };

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInputValue, 10);
    if (!isNaN(page) && page >= 1 && page <= (totalPages ?? 1) && onPageChange) {
      onPageChange(page);
    }
    setIsEditingPage(false);
    setPageInputValue('');
  };

  return (
    <div
      className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50/80"
      role="toolbar"
      aria-label="문서 뷰어 도구 모음"
    >
      {/* Left: File info */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded font-medium uppercase">
          {fileType}
        </span>
        <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
          {fileName}
        </span>
      </div>

      {/* Center: Page navigation (PDF only) */}
      {fileType === 'pdf' && totalPages != null && onPageChange && (
        <div className="flex items-center gap-1" role="navigation" aria-label="페이지 탐색">
          <button
            onClick={() => onPageChange((currentPage ?? 1) - 1)}
            disabled={!currentPage || currentPage <= 1}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="이전 페이지"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>

          {isEditingPage ? (
            <input
              type="text"
              value={pageInputValue}
              onChange={(e) => setPageInputValue(e.target.value)}
              onBlur={handlePageInputSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePageInputSubmit();
                if (e.key === 'Escape') {
                  setIsEditingPage(false);
                  setPageInputValue('');
                }
              }}
              className="w-10 text-center text-xs border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#FF3C42]"
              autoFocus
              aria-label="페이지 번호 입력"
            />
          ) : (
            <button
              onClick={() => {
                setIsEditingPage(true);
                setPageInputValue(String(currentPage ?? 1));
              }}
              className="text-xs text-gray-700 px-1.5 py-0.5 hover:bg-gray-200 rounded transition-colors"
              aria-label={`현재 ${currentPage}페이지, 총 ${totalPages}페이지. 클릭하여 페이지 이동`}
            >
              {currentPage} / {totalPages}
            </button>
          )}

          <button
            onClick={() => onPageChange((currentPage ?? 1) + 1)}
            disabled={!currentPage || currentPage >= (totalPages ?? 1)}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="다음 페이지"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
      )}

      {/* Right: Zoom + Actions */}
      <div className="flex items-center gap-1">
        {/* Zoom controls */}
        <button
          onClick={handleZoomOut}
          disabled={zoom <= ZOOM_STEPS[0]}
          className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="축소"
        >
          <Minus size={14} className="text-gray-600" />
        </button>
        <span className="text-xs text-gray-600 w-10 text-center tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
          className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="확대"
        >
          <Plus size={14} className="text-gray-600" />
        </button>

        {/* Fit-to presets */}
        {(onFitToWidth || onFitToPage) && (
          <>
            <div className="w-px h-4 bg-gray-300 mx-1" />
            {onFitToWidth && (
              <button
                onClick={onFitToWidth}
                className="text-[10px] px-1.5 py-0.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"
                aria-label="너비에 맞추기"
                title="너비에 맞추기"
              >
                너비
              </button>
            )}
            {onFitToPage && (
              <button
                onClick={onFitToPage}
                className="text-[10px] px-1.5 py-0.5 rounded hover:bg-gray-200 text-gray-600 transition-colors"
                aria-label="페이지에 맞추기"
                title="페이지에 맞추기"
              >
                페이지
              </button>
            )}
          </>
        )}

        {/* TOC / Citation / Fullscreen toggles */}
        {(onToggleTOC || onToggleCitations || onToggleFullscreen) && (
          <>
            <div className="w-px h-4 bg-gray-300 mx-1" />

            {onToggleTOC && (
              <button
                onClick={onToggleTOC}
                className={`p-1.5 rounded transition-colors ${
                  showTOC ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200 text-gray-600'
                } ${!hasTOCItems ? 'opacity-40 cursor-not-allowed' : ''}`}
                disabled={!hasTOCItems}
                aria-label={showTOC ? '목차 숨기기' : '목차 보기'}
                aria-expanded={showTOC}
                title="목차 (TOC)"
              >
                <ListTree size={14} />
              </button>
            )}

            {onToggleCitations && (
              <button
                onClick={onToggleCitations}
                className={`p-1.5 rounded transition-colors ${
                  showCitations ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200 text-gray-600'
                } ${!hasCitations ? 'opacity-40 cursor-not-allowed' : ''}`}
                disabled={!hasCitations}
                aria-label={showCitations ? '인용 패널 숨기기' : '인용 패널 보기'}
                aria-expanded={showCitations}
                title="인용 소스"
              >
                <Quote size={14} />
              </button>
            )}

            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'fullscreen' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200 text-gray-600'
                }`}
                aria-label={viewMode === 'fullscreen' ? '풀스크린 종료' : '풀스크린'}
                aria-expanded={viewMode === 'fullscreen'}
                title="풀스크린"
              >
                <Fullscreen size={14} />
              </button>
            )}
          </>
        )}

        <div className="w-px h-4 bg-gray-300 mx-1" />

        {/* Download */}
        <button
          onClick={onDownload}
          className="p-1.5 rounded hover:bg-gray-200 transition-colors"
          aria-label="다운로드"
        >
          <Download size={14} className="text-gray-600" />
        </button>

        {/* Maximize */}
        {onToggleMaximize && viewMode !== 'fullscreen' && (
          <button
            onClick={onToggleMaximize}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            aria-label={isMaximized ? '축소' : '최대화'}
          >
            {isMaximized ? (
              <Minimize2 size={14} className="text-gray-600" />
            ) : (
              <Maximize2 size={14} className="text-gray-600" />
            )}
          </button>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-gray-200 transition-colors"
          aria-label="닫기"
        >
          <X size={14} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
};
