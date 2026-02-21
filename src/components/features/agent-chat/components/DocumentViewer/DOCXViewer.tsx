'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { renderAsync } from 'docx-preview';
import { DocumentViewerToolbar } from './DocumentViewerToolbar';
import { Loader2 } from 'lucide-react';

interface DOCXViewerProps {
  fileData: ArrayBuffer;
  fileName: string;
  onClose: () => void;
  toolbarExtras?: Record<string, unknown>;
}

export const DOCXViewer: React.FC<DOCXViewerProps> = ({
  fileData,
  fileName,
  onClose,
  toolbarExtras,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    setIsLoading(true);
    setError(null);

    const container = containerRef.current;
    container.innerHTML = '';

    renderAsync(fileData, container, undefined, {
      className: 'docx-preview-content',
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      breakPages: true,
      ignoreLastRenderedPageBreak: true,
      experimental: false,
    })
      .then(() => {
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err?.message || 'DOCX 렌더링 실패');
        setIsLoading(false);
      });
  }, [fileData]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([fileData], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [fileData, fileName]);

  return (
    <div
      className={`h-full flex flex-col bg-white ${isMaximized ? 'fixed inset-0 z-50' : ''}`}
      role="document"
      aria-label={`DOCX 문서: ${fileName}`}
    >
      <DocumentViewerToolbar
        fileName={fileName}
        fileType="docx"
        zoom={zoom}
        onZoomChange={setZoom}
        onDownload={handleDownload}
        onClose={onClose}
        isMaximized={isMaximized}
        onToggleMaximize={() => setIsMaximized(!isMaximized)}
        {...toolbarExtras}
      />

      <div className="flex-1 overflow-auto bg-gray-50">
        {isLoading && (
          <div className="flex items-center justify-center h-64 gap-2 text-gray-500">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">DOCX 변환 중...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-64 text-red-500 text-sm">
            {error}
          </div>
        )}

        <div
          ref={containerRef}
          className="docx-viewer-container p-4"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
          }}
          aria-hidden={isLoading}
        />
      </div>

      {/* Scoped styles for docx-preview output */}
      <style jsx global>{`
        .docx-viewer-container .docx-wrapper {
          background: transparent;
          padding: 0;
        }
        .docx-viewer-container .docx-wrapper > section.docx {
          background: white;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
          margin: 0 auto 16px;
          padding: 40px 56px;
          min-height: auto;
        }
        .docx-viewer-container table {
          border-collapse: collapse;
        }
        .docx-viewer-container table td,
        .docx-viewer-container table th {
          border: 1px solid #d1d5db;
          padding: 4px 8px;
        }
      `}</style>
    </div>
  );
};
