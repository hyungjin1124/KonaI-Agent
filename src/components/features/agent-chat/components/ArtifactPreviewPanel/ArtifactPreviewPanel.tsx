import React, { useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import { useArtifactPanel } from '../../context/ArtifactPanelContext';
import { useArtifactLibraryOptional } from '../../context/ArtifactLibraryContext';
import { ArtifactPanelHeader } from './ArtifactPanelHeader';
import { DocumentRenderer } from './renderers/DocumentRenderer';
import { PPTRenderer, PPTRendererProps } from './renderers/PPTRenderer';
import { DashboardRenderer, DashboardRendererProps } from './renderers/DashboardRenderer';
import { MarkdownRenderer } from './renderers/MarkdownRenderer';
import { SlideOutlineRenderer, SlideOutlineRendererProps } from './renderers/SlideOutlineRenderer';
import { GenerativeUIRendererAdapter } from './renderers/GenerativeUIRendererAdapter';
import { ArtifactVersionHistory } from '../ArtifactLibrary/ArtifactVersionHistory';
import { SkillDraftRenderer } from '../../../skill-draft/components/SkillDraftRenderer';
import type { GenerativeUISpec } from '../../../generative-ui';

interface ArtifactPreviewPanelProps {
  onClose: () => void;
  onDownload?: () => void;
  // PPT Props (시나리오 연결)
  pptRendererProps?: PPTRendererProps;
  // Dashboard Props
  dashboardRendererProps?: DashboardRendererProps;
  // Slide Outline HITL Props
  slideOutlineRendererProps?: Omit<SlideOutlineRendererProps, 'onClose'>;
  // Markdown handlers
  onMarkdownModeChange?: (mode: 'read' | 'edit') => void;
  onMarkdownContentChange?: (content: string) => void;
  // Generative UI specs (탭 ID → spec 매핑)
  generativeUISpecs?: Record<string, GenerativeUISpec>;
}

export const ArtifactPreviewPanel: React.FC<ArtifactPreviewPanelProps> = ({
  onClose,
  onDownload,
  pptRendererProps,
  dashboardRendererProps,
  slideOutlineRendererProps,
  onMarkdownModeChange,
  onMarkdownContentChange,
  generativeUISpecs,
}) => {
  const {
    tabs,
    activeTabId,
    activeTab,
    switchTab,
    closeTab,
    isMaximized,
    toggleMaximize,
    closePanel,
    documentData,
    csvContent,
    citations,
    markdownContents,
    markdownEditingState,
    skillDraft,
    skillDraftHandlers,
  } = useArtifactPanel();

  const library = useArtifactLibraryOptional();
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  if (!activeTab) return null;

  const handleClosePanel = () => {
    closePanel();
    onClose();
  };

  // 버전 히스토리 관련
  const activeArtifactId = activeTab.artifact?.id;
  const versions = activeArtifactId ? library?.getVersions(activeArtifactId) || [] : [];
  const hasVersions = versions.length > 0;
  const latestVersionNumber = hasVersions ? versions[versions.length - 1].versionNumber : undefined;
  const versionCount = hasVersions ? versions.length : undefined;

  const handleToggleVersionHistory = useCallback(() => {
    setIsVersionHistoryOpen(prev => !prev);
  }, []);

  const handleRestoreVersion = useCallback((versionId: string) => {
    if (activeArtifactId && library) {
      library.restoreVersion(activeArtifactId, versionId);
    }
  }, [activeArtifactId, library]);

  const renderContent = () => {
    const { previewType, artifact } = activeTab;

    switch (previewType) {
      case 'slide-outline':
        if (!slideOutlineRendererProps?.slideOutlineDeck) {
          return (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p>슬라이드 개요를 불러오는 중...</p>
            </div>
          );
        }
        return (
          <SlideOutlineRenderer
            {...slideOutlineRendererProps}
            onClose={handleClosePanel}
          />
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
          <MarkdownRenderer
            artifact={artifact}
            markdownContent={artifact ? markdownContents[artifact.id] || '' : ''}
            markdownMode="read"
            onModeChange={onMarkdownModeChange || (() => {})}
            onContentChange={onMarkdownContentChange || (() => {})}
            onClose={handleClosePanel}
            editingState={markdownEditingState}
          />
        );

      case 'ppt':
        if (!pptRendererProps?.pptConfig) {
          return (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p>PPT 설정을 불러오는 중...</p>
            </div>
          );
        }
        return <PPTRenderer {...pptRendererProps} onClose={handleClosePanel} />;

      case 'generative-ui':
        return (
          <GenerativeUIRendererAdapter
            spec={generativeUISpecs?.[activeTab.id]}
            onClose={handleClosePanel}
          />
        );

      case 'skill-draft':
        if (!skillDraft) {
          return (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p>스킬 드래프트를 불러오는 중...</p>
            </div>
          );
        }
        return (
          <SkillDraftRenderer
            draft={skillDraft}
            onSave={skillDraftHandlers?.onSave ?? (() => {})}
            onDiscard={skillDraftHandlers?.onDiscard ?? (() => {})}
          />
        );

      case 'dashboard':
      case 'chart':
        return <DashboardRenderer dashboardComponent={dashboardRendererProps?.dashboardComponent} />;

      case 'pdf':
      case 'docx':
      case 'xlsx':
      case 'pptx':
        if (!documentData) {
          return (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p>문서를 불러오는 중...</p>
            </div>
          );
        }
        return (
          <DocumentRenderer
            artifact={artifact}
            previewType={previewType}
            documentData={documentData}
            citations={citations}
            onClose={handleClosePanel}
          />
        );

      case 'csv':
        if (!csvContent) {
          return (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p>CSV 데이터를 불러오는 중...</p>
            </div>
          );
        }
        return (
          <DocumentRenderer
            artifact={artifact}
            previewType="csv"
            textContent={csvContent}
            citations={citations}
            onClose={handleClosePanel}
          />
        );

      default:
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

  return (
    <div className={`h-full flex flex-col bg-white border-l border-r border-gray-200 transition-all duration-300 ${isMaximized ? 'fixed inset-0 z-50' : ''}`}>
      {/* Tab Header */}
      <ArtifactPanelHeader
        tabs={tabs}
        activeTabId={activeTabId}
        isMaximized={isMaximized}
        onSwitchTab={switchTab}
        onCloseTab={closeTab}
        onToggleMaximize={toggleMaximize}
        onClosePanel={handleClosePanel}
        onDownload={onDownload}
        onToggleVersionHistory={hasVersions ? handleToggleVersionHistory : undefined}
        isVersionHistoryOpen={isVersionHistoryOpen}
        versionCount={versionCount}
        currentVersion={latestVersionNumber}
      />

      {/* Content + Version History Side Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab.id}`}
          aria-labelledby={`tab-${activeTab.id}`}
          className="flex-1 overflow-hidden"
        >
          {renderContent()}
        </div>

        {/* Version History Side Panel */}
        {isVersionHistoryOpen && hasVersions && (
          <div className="w-64 border-l border-gray-200 flex-shrink-0 overflow-hidden">
            <ArtifactVersionHistory
              versions={versions}
              currentContent={activeArtifactId ? markdownContents[activeArtifactId] : undefined}
              onRestore={handleRestoreVersion}
              onClose={() => setIsVersionHistoryOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtifactPreviewPanel;
