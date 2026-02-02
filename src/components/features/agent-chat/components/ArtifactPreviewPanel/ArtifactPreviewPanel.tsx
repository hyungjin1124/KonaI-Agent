import React from 'react';
import { X, Maximize2, Minimize2, Download } from 'lucide-react';
import PPTGenPanel, { PPTConfig } from '../../../../PPTGenPanel';
import { Artifact, SlideItem, DashboardType } from '../../types';

interface ArtifactPreviewPanelProps {
  isOpen: boolean;
  artifact: Artifact | null;
  previewType: 'ppt' | 'dashboard' | 'chart' | null;
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
}) => {
  const [isMaximized, setIsMaximized] = React.useState(false);

  if (!isOpen) return null;

  const renderPreview = () => {
    if (!artifact && previewType !== 'ppt') {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p>미리보기할 항목을 선택해주세요</p>
        </div>
      );
    }

    switch (previewType) {
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

  // PPT 미리보기의 경우 PPTGenPanel 자체에 헤더가 있으므로 별도 헤더 표시 안함
  const showHeader = previewType !== 'ppt';

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
              title="닫기"
            >
              <X size={16} className="text-gray-500" />
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
