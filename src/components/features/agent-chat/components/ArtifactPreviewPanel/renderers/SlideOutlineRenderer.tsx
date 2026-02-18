import React, { useState } from 'react';
import { SlideOutlineFileList } from '../../SlideOutlineHITL/sidebar/SlideOutlineFileList';
import { SlideOutlineEditor } from '../../SlideOutlineHITL/editor/SlideOutlineEditor';
import { SlideOutlineDeck, SlideOutline, SlideLayoutType } from '../../../types';

export interface SlideOutlineRendererProps {
  slideOutlineDeck: SlideOutlineDeck;
  selectedOutlineId: string | null;
  selectedOutline: SlideOutline | null;
  onSelectOutline: (id: string) => void;
  onOutlineContentChange: (id: string, content: string) => void;
  onOutlineLayoutChange: (id: string, layout: SlideLayoutType) => void;
  onApproveOutline: (id: string) => void;
  onMarkNeedsRevision: (id: string) => void;
  onApproveAll: () => void;
  onPreviousOutline: () => void;
  onNextOutline: () => void;
  onGeneratePPT: () => void;
  onEnterRevisionMode?: (outlineId: string) => void;
  isAllOutlinesApproved: boolean;
  approvedOutlineCount: number;
  totalOutlineCount: number;
  onClose: () => void;
}

export const SlideOutlineRenderer: React.FC<SlideOutlineRendererProps> = ({
  slideOutlineDeck,
  selectedOutlineId,
  selectedOutline,
  onSelectOutline,
  onOutlineContentChange,
  onOutlineLayoutChange,
  onApproveOutline,
  onMarkNeedsRevision,
  onApproveAll,
  onPreviousOutline,
  onNextOutline,
  onGeneratePPT,
  onEnterRevisionMode,
  isAllOutlinesApproved,
  approvedOutlineCount,
  totalOutlineCount,
  onClose,
}) => {
  const [isFileListExpanded, setIsFileListExpanded] = useState(true);

  const currentOutlineIndex = slideOutlineDeck.outlines.findIndex(
    (o) => o.id === selectedOutlineId
  );

  return (
    <div className="h-full flex">
      <div className="w-64 border-r border-gray-200 overflow-y-auto flex-shrink-0">
        <SlideOutlineFileList
          deck={slideOutlineDeck}
          selectedOutlineId={selectedOutlineId}
          isExpanded={isFileListExpanded}
          onToggle={() => setIsFileListExpanded(!isFileListExpanded)}
          onSelectOutline={onSelectOutline}
          onQuickApprove={onApproveOutline}
          onApproveAll={onApproveAll}
          onGeneratePPT={onGeneratePPT}
          isAllApproved={isAllOutlinesApproved}
          approvedCount={approvedOutlineCount}
          totalCount={totalOutlineCount}
        />
      </div>
      <div className="flex-1 min-w-0">
        <SlideOutlineEditor
          outline={selectedOutline ?? null}
          currentIndex={currentOutlineIndex >= 0 ? currentOutlineIndex : 0}
          totalCount={slideOutlineDeck.outlines.length}
          onContentChange={onOutlineContentChange}
          onLayoutChange={onOutlineLayoutChange}
          onApprove={onApproveOutline}
          onMarkNeedsRevision={onMarkNeedsRevision}
          onPrevious={onPreviousOutline}
          onNext={onNextOutline}
          onClose={onClose}
          onEnterRevisionMode={onEnterRevisionMode}
        />
      </div>
    </div>
  );
};

export default SlideOutlineRenderer;
