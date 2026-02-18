import React from 'react';
import { DocumentViewer } from '../../DocumentViewer';
import { Artifact, ArtifactPreviewType } from '../../../types';

export interface DocumentRendererProps {
  artifact: Artifact | null;
  previewType: Extract<ArtifactPreviewType, 'pdf' | 'docx' | 'xlsx' | 'csv' | 'pptx'>;
  documentData?: ArrayBuffer;
  textContent?: string;
  onClose: () => void;
}

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  artifact,
  previewType,
  documentData,
  textContent,
  onClose,
}) => {
  if (previewType === 'csv') {
    if (!textContent) {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p>CSV 데이터를 불러오는 중...</p>
        </div>
      );
    }
    return (
      <DocumentViewer
        textContent={textContent}
        fileName={artifact?.title || 'data.csv'}
        fileType="csv"
        onClose={onClose}
      />
    );
  }

  if (!documentData) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>문서를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <DocumentViewer
      fileData={documentData}
      fileName={artifact?.title || `document.${previewType}`}
      fileType={previewType}
      onClose={onClose}
    />
  );
};

export default DocumentRenderer;
