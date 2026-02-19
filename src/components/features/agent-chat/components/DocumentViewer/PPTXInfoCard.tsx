'use client';

import React, { useCallback } from 'react';
import { Presentation, Download } from 'lucide-react';
import { DocumentViewerToolbar } from './DocumentViewerToolbar';

interface PPTXInfoCardProps {
  fileData: ArrayBuffer;
  fileName: string;
  onClose: () => void;
}

export const PPTXInfoCard: React.FC<PPTXInfoCardProps> = ({ fileData, fileName, onClose }) => {
  const fileSizeKB = (fileData.byteLength / 1024).toFixed(1);

  const handleDownload = useCallback(() => {
    const blob = new Blob([fileData], {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [fileData, fileName]);

  return (
    <div className="h-full flex flex-col bg-white">
      <DocumentViewerToolbar
        fileName={fileName}
        fileType="pptx"
        zoom={1.0}
        onZoomChange={() => {}}
        onDownload={handleDownload}
        onClose={onClose}
      />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-500">
        <div className="p-4 bg-orange-50 rounded-full">
          <Presentation size={48} className="text-orange-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-1">{fileName}</h3>
          <p className="text-sm text-gray-500">{fileSizeKB} KB</p>
          <p className="text-xs text-gray-400 mt-2">PPTX 미리보기는 지원되지 않습니다</p>
        </div>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Download size={16} />
          다운로드하여 열기
        </button>
      </div>
    </div>
  );
};
