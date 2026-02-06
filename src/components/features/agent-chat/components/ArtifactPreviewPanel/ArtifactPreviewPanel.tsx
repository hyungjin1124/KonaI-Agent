import React, { useState } from 'react';
import { PanelRightClose, Maximize2, Minimize2, Download } from 'lucide-react';
import PPTGenPanel, { PPTConfig } from '../../../../PPTGenPanel';
import { Artifact, SlideItem, DashboardType, SlideOutlineDeck, SlideOutline, SlideLayoutType } from '../../types';
import { SlideOutlineFileList } from '../SlideOutlineHITL/sidebar/SlideOutlineFileList';
import { SlideOutlineEditor } from '../SlideOutlineHITL/editor/SlideOutlineEditor';
import { MarkdownPreviewPanel } from '../MarkdownPreviewPanel';

interface ArtifactPreviewPanelProps {
  isOpen: boolean;
  artifact: Artifact | null;
  previewType: 'ppt' | 'dashboard' | 'chart' | 'slide-outline' | 'markdown' | null;
  onClose: () => void;
  onDownload?: () => void;
  // PPT Preview Props
  pptConfig?: PPTConfig;
  pptStatus?: 'setup' | 'generating' | 'done';
  pptProgress?: number;
  pptCurrentStageIndex?: number;
  pptSlides?: SlideItem[];
  onPptSlidesChange?: (slides: SlideItem[]) => void;
  onPptProgressChange?: (progress: number) => void;
  onPptComplete?: () => void;
  onPptSlideStart?: (slideId: number, totalSlides: number) => void;
  onPptSlideComplete?: (slideId: number, totalSlides: number) => void;
  onPptCancel?: () => void;
  // Dashboard Preview Props
  dashboardType?: DashboardType;
  dashboardScenario?: string;
  dashboardComponent?: React.ReactNode;
  // Slide Outline HITL Props
  slideOutlineDeck?: SlideOutlineDeck | null;
  selectedOutlineId?: string | null;
  selectedOutline?: SlideOutline | null;
  onSelectOutline?: (id: string) => void;
  onOutlineContentChange?: (id: string, content: string) => void;
  onOutlineLayoutChange?: (id: string, layout: SlideLayoutType) => void;
  onApproveOutline?: (id: string) => void;
  onMarkNeedsRevision?: (id: string) => void;
  onApproveAll?: () => void;
  onPreviousOutline?: () => void;
  onNextOutline?: () => void;
  onGeneratePPT?: () => void;
  onEnterRevisionMode?: (outlineId: string) => void;
  isAllOutlinesApproved?: boolean;
  approvedOutlineCount?: number;
  totalOutlineCount?: number;
  // Markdown Preview Props
  markdownContent?: string;
  markdownMode?: 'read' | 'edit';
  onMarkdownModeChange?: (mode: 'read' | 'edit') => void;
  onMarkdownContentChange?: (content: string) => void;
  markdownEditingState?: 'idle' | 'editing' | 'shimmer';
}

export const ArtifactPreviewPanel: React.FC<ArtifactPreviewPanelProps> = ({
  isOpen,
  artifact,
  previewType,
  onClose,
  onDownload,
  // PPT Props
  pptConfig,
  pptStatus = 'setup',
  pptProgress = 0,
  pptCurrentStageIndex = 0,
  pptSlides = [],
  onPptSlidesChange,
  onPptProgressChange,
  onPptComplete,
  onPptSlideStart,
  onPptSlideComplete,
  onPptCancel,
  // Dashboard Props
  dashboardComponent,
  // Slide Outline HITL Props
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
  isAllOutlinesApproved = false,
  approvedOutlineCount = 0,
  totalOutlineCount = 0,
  // Markdown Props
  markdownContent = '',
  markdownMode = 'read',
  onMarkdownModeChange,
  onMarkdownContentChange,
  markdownEditingState = 'idle',
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFileListExpanded, setIsFileListExpanded] = useState(true);

  if (!isOpen) return null;

  const renderPreview = () => {
    // dashboard/chart/slide-outline/markdown 타입은 artifact 없이도 렌더링 가능
    if (!artifact && previewType !== 'ppt' && previewType !== 'dashboard' && previewType !== 'chart' && previewType !== 'slide-outline' && previewType !== 'markdown') {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p>미리보기할 항목을 선택해주세요</p>
        </div>
      );
    }

    switch (previewType) {
      case 'slide-outline':
        if (!slideOutlineDeck || !onSelectOutline) {
          return (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p>슬라이드 개요를 불러오는 중...</p>
            </div>
          );
        }
        const currentOutlineIndex = slideOutlineDeck.outlines.findIndex(
          (o) => o.id === selectedOutlineId
        );
        return (
          <div className="h-full flex">
            {/* 좌측: 파일 목록 사이드바 */}
            <div className="w-64 border-r border-gray-200 overflow-y-auto flex-shrink-0">
              <SlideOutlineFileList
                deck={slideOutlineDeck}
                selectedOutlineId={selectedOutlineId ?? null}
                isExpanded={isFileListExpanded}
                onToggle={() => setIsFileListExpanded(!isFileListExpanded)}
                onSelectOutline={onSelectOutline}
                onQuickApprove={onApproveOutline || (() => {})}
                onApproveAll={onApproveAll || (() => {})}
                onGeneratePPT={onGeneratePPT || onClose}
                isAllApproved={isAllOutlinesApproved}
                approvedCount={approvedOutlineCount}
                totalCount={totalOutlineCount}
              />
            </div>
            {/* 우측: 편집기 */}
            <div className="flex-1 min-w-0">
              <SlideOutlineEditor
                outline={selectedOutline ?? null}
                currentIndex={currentOutlineIndex >= 0 ? currentOutlineIndex : 0}
                totalCount={slideOutlineDeck.outlines.length}
                onContentChange={onOutlineContentChange || (() => {})}
                onLayoutChange={onOutlineLayoutChange || (() => {})}
                onApprove={onApproveOutline || (() => {})}
                onMarkNeedsRevision={onMarkNeedsRevision || (() => {})}
                onPrevious={onPreviousOutline || (() => {})}
                onNext={onNextOutline || (() => {})}
                onClose={onClose}
                onEnterRevisionMode={onEnterRevisionMode}
              />
            </div>
          </div>
        );

      case 'markdown':
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
            onModeChange={onMarkdownModeChange || (() => {})}
            onContentChange={onMarkdownContentChange || (() => {})}
            onClose={onClose}
            editingState={markdownEditingState}
          />
        );

      case 'ppt':
        if (!pptConfig || !onPptSlidesChange) {
          return (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p>PPT 설정을 불러오는 중...</p>
            </div>
          );
        }
        return (
          <PPTGenPanel
            status={pptStatus}
            config={pptConfig}
            progress={pptProgress}
            currentStageIndex={pptCurrentStageIndex}
            slides={pptSlides}
            onSlidesChange={onPptSlidesChange}
            onProgressChange={onPptProgressChange}
            onComplete={onPptComplete}
            onSlideStart={onPptSlideStart}
            onSlideComplete={onPptSlideComplete}
            onCancel={onPptCancel || (() => {})}
            onTogglePanel={onClose}
          />
        );

      case 'dashboard':
      case 'chart':
        if (dashboardComponent) {
          return dashboardComponent;
        }
        return (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>대시보드를 불러오는 중...</p>
          </div>
        );

      default:
        // Generic preview for documents, images, etc.
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-500">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {artifact?.title || '알 수 없는 파일'}
              </h3>
              <p className="text-sm mb-4">
                {artifact?.type} • {artifact?.fileSize || '알 수 없는 크기'}
              </p>
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  <Download size={16} />
                  다운로드
                </button>
              )}
            </div>
          </div>
        );
    }
  };

  // PPT, Dashboard, Chart, Slide Outline, Markdown 미리보기의 경우 별도 헤더 표시 안함 (내부에 자체 헤더 있음)
  const showHeader = previewType !== 'ppt' && previewType !== 'dashboard' && previewType !== 'chart' && previewType !== 'slide-outline' && previewType !== 'markdown';

  return (
    <div className={`h-full flex flex-col bg-white border-l border-r border-gray-200 transition-all duration-300 ${isMaximized ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header - only for non-PPT types */}
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900 text-sm">
              {artifact?.title || '미리보기'}
            </h3>
            {artifact?.type && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                {artifact.type.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {onDownload && (
              <button
                onClick={onDownload}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="다운로드"
              >
                <Download size={16} className="text-gray-500" />
              </button>
            )}
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title={isMaximized ? '축소' : '최대화'}
            >
              {isMaximized ? (
                <Minimize2 size={16} className="text-gray-500" />
              ) : (
                <Maximize2 size={16} className="text-gray-500" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="패널 접기"
            >
              <PanelRightClose size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderPreview()}
      </div>
    </div>
  );
};

export default ArtifactPreviewPanel;
