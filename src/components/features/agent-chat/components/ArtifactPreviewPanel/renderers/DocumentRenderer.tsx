import React from 'react';
import { DocumentViewer } from '../../DocumentViewer';
import { Artifact, ArtifactPreviewType, Citation } from '../../../types';

export interface DocumentRendererProps {
  artifact: Artifact | null;
  previewType: Extract<ArtifactPreviewType, 'pdf' | 'docx' | 'xlsx' | 'csv' | 'pptx'>;
  documentData?: ArrayBuffer;
  textContent?: string;
  citations?: Citation[];
  onClose: () => void;
}

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  artifact,
  previewType,
  documentData,
  textContent,
  citations,
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
        citations={citations}
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
      citations={citations}
      onClose={onClose}
    />
  );
};

export default DocumentRenderer;
