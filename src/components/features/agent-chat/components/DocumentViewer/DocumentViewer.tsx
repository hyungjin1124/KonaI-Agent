'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { DOCXViewer } from './DOCXViewer';
import { PPTXInfoCard } from './PPTXInfoCard';
import { DocumentTOCSidebar } from './DocumentTOCSidebar';
import { CitationSidePanel } from './CitationSidePanel';
import { FullscreenPortal } from './FullscreenPortal';
import { useDocumentTOC } from './useDocumentTOC';
import { Loader2 } from 'lucide-react';
import type { Citation, ViewMode } from './types';

const PDFViewer = dynamic(() => import('./PDFViewer').then((mod) => mod.PDFViewer), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 gap-2 text-gray-500">
      <Loader2 size={20} className="animate-spin" />
      <span className="text-sm">PDF 뷰어 로딩 중...</span>
    </div>
  ),
});

const XLSXViewer = dynamic(() => import('./XLSXViewer').then((mod) => mod.XLSXViewer), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 gap-2 text-gray-500">
      <Loader2 size={20} className="animate-spin" />
      <span className="text-sm">스프레드시트 로딩 중...</span>
    </div>
  ),
});

const CSVViewer = dynamic(() => import('./CSVViewer').then((mod) => mod.CSVViewer), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 gap-2 text-gray-500">
      <Loader2 size={20} className="animate-spin" />
      <span className="text-sm">CSV 로딩 중...</span>
    </div>
  ),
});

interface DocumentViewerProps {
  fileData?: ArrayBuffer;
  textContent?: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'csv' | 'pptx';
  onClose: () => void;
  citations?: Citation[];
}

// File types that support heading-based TOC
const TOC_SUPPORTED_TYPES = new Set(['pdf', 'docx']);

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  fileData,
  textContent,
  fileName,
  fileType,
  onClose,
  citations: externalCitations,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showTOC, setShowTOC] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('embedded');
  const [isNarrow, setIsNarrow] = useState(false);

  const tocEnabled = TOC_SUPPORTED_TYPES.has(fileType);

  // Responsive: auto-hide sidebars when container is < 1024px
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const narrow = width < 1024;
        setIsNarrow(narrow);
        if (narrow) {
          setShowTOC(false);
          setShowCitations(false);
        }
      }
    });

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);
  const { tocItems, activeTOCId, scrollToHeading, extractHeadings } = useDocumentTOC({
    containerRef: contentRef,
    fileType,
    enabled: tocEnabled,
  });

  const citations = externalCitations ?? [];

  // Auto-extract headings after content renders
  const handleContentReady = useCallback(() => {
    if (tocEnabled) {
      // Small delay to let DOM settle after viewer renders
      setTimeout(extractHeadings, 500);
    }
  }, [tocEnabled, extractHeadings]);

  // Re-extract headings when fileData changes
  useEffect(() => {
    handleContentReady();
  }, [fileData, textContent, handleContentReady]);

  const toggleTOC = useCallback(() => setShowTOC((prev) => !prev), []);
  const toggleCitations = useCallback(() => setShowCitations((prev) => !prev), []);
  const toggleFullscreen = useCallback(() => {
    setViewMode((prev) => (prev === 'fullscreen' ? 'embedded' : 'fullscreen'));
  }, []);

  // Pass extra toolbar props to child viewers
  const toolbarExtras = {
    showTOC,
    onToggleTOC: tocEnabled ? toggleTOC : undefined,
    hasTOCItems: tocItems.length > 0,
    showCitations,
    onToggleCitations: toggleCitations,
    hasCitations: citations.length > 0,
    viewMode,
    onToggleFullscreen: toggleFullscreen,
  };

  const renderViewer = () => {
    switch (fileType) {
      case 'pdf':
        return fileData ? (
          <PDFViewer
            fileData={fileData}
            fileName={fileName}
            onClose={onClose}
            toolbarExtras={toolbarExtras}
          />
        ) : null;
      case 'docx':
        return fileData ? (
          <DOCXViewer
            fileData={fileData}
            fileName={fileName}
            onClose={onClose}
            toolbarExtras={toolbarExtras}
          />
        ) : null;
      case 'xlsx':
        return fileData ? (
          <XLSXViewer
            fileData={fileData}
            fileName={fileName}
            onClose={onClose}
            toolbarExtras={toolbarExtras}
          />
        ) : null;
      case 'csv':
        return textContent ? (
          <CSVViewer
            content={textContent}
            fileName={fileName}
            onClose={onClose}
            toolbarExtras={toolbarExtras}
          />
        ) : null;
      case 'pptx':
        return fileData ? (
          <PPTXInfoCard fileData={fileData} fileName={fileName} onClose={onClose} />
        ) : null;
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            지원하지 않는 문서 형식입니다.
          </div>
        );
    }
  };

  const content = (
    <div ref={wrapperRef} className="relative flex h-full overflow-hidden">
      {/* TOC Sidebar — overlay when narrow */}
      {showTOC && tocEnabled && (
        <div className={isNarrow ? 'absolute left-0 top-0 bottom-0 z-30 shadow-lg' : ''}>
          <DocumentTOCSidebar
            items={tocItems}
            activeTOCId={activeTOCId}
            onItemClick={scrollToHeading}
            onClose={toggleTOC}
          />
        </div>
      )}

      {/* Main viewer content */}
      <div ref={contentRef} className="flex-1 min-w-0 overflow-hidden" data-scroll-container>
        {renderViewer()}
      </div>

      {/* Citation Side Panel — overlay when narrow */}
      {showCitations && (
        <div className={isNarrow ? 'absolute right-0 top-0 bottom-0 z-30 shadow-lg' : ''}>
          <CitationSidePanel citations={citations} onClose={toggleCitations} />
        </div>
      )}
    </div>
  );

  if (viewMode === 'fullscreen') {
    return <FullscreenPortal onExit={toggleFullscreen}>{content}</FullscreenPortal>;
  }

  return content;
};
