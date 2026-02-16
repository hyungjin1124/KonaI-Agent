'use client';

import React from 'react';
import { PDFViewer } from './PDFViewer';
import { DOCXViewer } from './DOCXViewer';

interface DocumentViewerProps {
  fileData: ArrayBuffer;
  fileName: string;
  fileType: 'pdf' | 'docx';
  onClose: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  fileData,
  fileName,
  fileType,
  onClose,
}) => {
  switch (fileType) {
    case 'pdf':
      return <PDFViewer fileData={fileData} fileName={fileName} onClose={onClose} />;
    case 'docx':
      return <DOCXViewer fileData={fileData} fileName={fileName} onClose={onClose} />;
    default:
      return (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
          지원하지 않는 문서 형식입니다.
        </div>
      );
  }
};
