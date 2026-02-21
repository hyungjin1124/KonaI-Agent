'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { DocumentViewerToolbar } from './DocumentViewerToolbar';
import { Loader2 } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PDFViewerProps {
  fileData: ArrayBuffer;
  fileName: string;
  onClose: () => void;
  toolbarExtras?: Record<string, unknown>;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  fileData,
  fileName,
  onClose,
  toolbarExtras,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isMaximized, setIsMaximized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize the file data to avoid re-renders triggering reloads
  const fileSource = useMemo(() => ({ data: new Uint8Array(fileData) }), [fileData]);

  const handleLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= numPages) {
        setCurrentPage(page);
      }
    },
    [numPages],
  );

  const handleDownload = useCallback(() => {
    const blob = new Blob([fileData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [fileData, fileName]);

  const handleFitToWidth = useCallback(() => {
    if (!containerRef.current) return;
    // Default PDF page width is 612pt ≈ 816px at 96dpi
    const containerWidth = containerRef.current.clientWidth - 32; // subtract padding
    const pdfDefaultWidth = 612;
    setZoom(containerWidth / pdfDefaultWidth);
  }, []);

  const handleFitToPage = useCallback(() => {
    if (!containerRef.current) return;
    const containerHeight = containerRef.current.clientHeight - 32;
    const pdfDefaultHeight = 792;
    setZoom(containerHeight / pdfDefaultHeight);
  }, []);

  return (
    <div
      className={`h-full flex flex-col bg-white ${isMaximized ? 'fixed inset-0 z-50' : ''}`}
      role="document"
      aria-label={`PDF 문서: ${fileName}`}
    >
      <DocumentViewerToolbar
        fileName={fileName}
        fileType="pdf"
        currentPage={currentPage}
        totalPages={numPages}
        onPageChange={handlePageChange}
        zoom={zoom}
        onZoomChange={setZoom}
        onFitToWidth={handleFitToWidth}
        onFitToPage={handleFitToPage}
        onDownload={handleDownload}
        onClose={onClose}
        isMaximized={isMaximized}
        onToggleMaximize={() => setIsMaximized(!isMaximized)}
        {...toolbarExtras}
      />

      {/* Screen reader live region for page changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {numPages > 0 && `${currentPage}페이지 / 총 ${numPages}페이지`}
      </div>

      <div ref={containerRef} className="flex-1 overflow-auto bg-gray-100">
        <Document
          file={fileSource}
          onLoadSuccess={handleLoadSuccess}
          loading={
            <div className="flex items-center justify-center h-64 gap-2 text-gray-500">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">PDF 로딩 중...</span>
            </div>
          }
          error={
            <div className="flex items-center justify-center h-64 text-red-500 text-sm">
              PDF 파일을 불러올 수 없습니다.
            </div>
          }
          className="flex flex-col items-center py-4 gap-4"
        >
          <Page
            pageNumber={currentPage}
            scale={zoom}
            className="shadow-lg"
            loading={
              <div className="flex items-center justify-center h-64 gap-2 text-gray-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">페이지 렌더링 중...</span>
              </div>
            }
          />
        </Document>
      </div>
    </div>
  );
};
