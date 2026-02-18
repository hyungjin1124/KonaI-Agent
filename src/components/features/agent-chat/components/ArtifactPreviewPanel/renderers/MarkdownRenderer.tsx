import React from 'react';
import { MarkdownPreviewPanel } from '../../MarkdownPreviewPanel';
import { Artifact } from '../../../types';

export interface MarkdownRendererProps {
  artifact: Artifact | null;
  markdownContent: string;
  markdownMode: 'read' | 'edit';
  onModeChange: (mode: 'read' | 'edit') => void;
  onContentChange: (content: string) => void;
  onClose: () => void;
  editingState: 'idle' | 'editing' | 'shimmer';
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  artifact,
  markdownContent,
  markdownMode,
  onModeChange,
  onContentChange,
  onClose,
  editingState,
}) => {
  if (!artifact) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>마크다운 파일을 선택해주세요</p>
      </div>
    );
  }

  return (
    <MarkdownPreviewPanel
      artifact={artifact}
      content={markdownContent}
      mode={markdownMode}
      onModeChange={onModeChange}
      onContentChange={onContentChange}
      onClose={onClose}
      editingState={editingState}
    />
  );
};

export default MarkdownRenderer;
