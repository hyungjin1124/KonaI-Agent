'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { DOCXViewer } from './DOCXViewer';
import { PPTXInfoCard } from './PPTXInfoCard';
import { Loader2 } from 'lucide-react';

// pdfjs-dist uses Object.defineProperty at module eval time which fails during SSR.
// Dynamic import with ssr:false ensures it only loads in the browser.
const PDFViewer = dynamic(() => import('./PDFViewer').then((mod) => mod.PDFViewer), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 gap-2 text-gray-500">
      <Loader2 size={20} className="animate-spin" />
      <span className="text-sm">PDF 뷰어 로딩 중...</span>
    </div>
  ),
});

// SheetJS may trigger SSR issues — load dynamically
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
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  fileData,
  textContent,
  fileName,
  fileType,
  onClose,
}) => {
  switch (fileType) {
    case 'pdf':
      return fileData ? <PDFViewer fileData={fileData} fileName={fileName} onClose={onClose} /> : null;
    case 'docx':
      return fileData ? <DOCXViewer fileData={fileData} fileName={fileName} onClose={onClose} /> : null;
    case 'xlsx':
      return fileData ? <XLSXViewer fileData={fileData} fileName={fileName} onClose={onClose} /> : null;
    case 'csv':
      return textContent ? <CSVViewer content={textContent} fileName={fileName} onClose={onClose} /> : null;
    case 'pptx':
      return fileData ? <PPTXInfoCard fileData={fileData} fileName={fileName} onClose={onClose} /> : null;
    default:
      return (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
          지원하지 않는 문서 형식입니다.
        </div>
      );
  }
};
