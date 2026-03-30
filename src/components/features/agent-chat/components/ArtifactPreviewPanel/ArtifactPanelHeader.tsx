import React from 'react';
import { PanelRightClose, Maximize2, Minimize2, Download, Clock } from 'lucide-react';
import { ArtifactTabBar } from './ArtifactTabBar';
import { ArtifactTab, ArtifactType } from '../../types';
import { ArtifactBreadcrumb } from '../ArtifactLibrary/ArtifactBreadcrumb';

interface ArtifactPanelHeaderProps {
  tabs: ArtifactTab[];
  activeTabId: string | null;
  isMaximized: boolean;
  onSwitchTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onToggleMaximize: () => void;
  onClosePanel: () => void;
  onDownload?: () => void;
  onToggleVersionHistory?: () => void;
  isVersionHistoryOpen?: boolean;
  versionCount?: number;
  currentVersion?: number;
}

export const ArtifactPanelHeader: React.FC<ArtifactPanelHeaderProps> = ({
  tabs,
  activeTabId,
  isMaximized,
  onSwitchTab,
  onCloseTab,
  onToggleMaximize,
  onClosePanel,
  onDownload,
  onToggleVersionHistory,
  isVersionHistoryOpen,
  versionCount,
  currentVersion,
}) => {
  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className="border-b border-gray-200 bg-gray-50/80">
      {/* 탭 바 + 액션 */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 overflow-hidden">
          <ArtifactTabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSwitchTab={onSwitchTab}
            onCloseTab={onCloseTab}
          />
        </div>
        {/* 액션 버튼 */}
        <div role="toolbar" aria-label="패널 액션" className="flex items-center gap-0.5 px-2 flex-shrink-0">
          {onToggleVersionHistory && (
            <button
              onClick={onToggleVersionHistory}
              className={`p-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${
                isVersionHistoryOpen ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100 text-gray-500'
              }`}
              aria-label="버전 히스토리"
              aria-pressed={isVersionHistoryOpen}
              title="버전 히스토리"
            >
              <Clock size={15} />
            </button>
          )}
          {onDownload && (
            <button
              onClick={onDownload}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
              aria-label="다운로드"
            >
              <Download size={15} className="text-gray-500" />
            </button>
          )}
          <button
            onClick={onToggleMaximize}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
            aria-label={isMaximized ? '축소' : '최대화'}
          >
            {isMaximized ? (
              <Minimize2 size={15} className="text-gray-500" />
            ) : (
              <Maximize2 size={15} className="text-gray-500" />
            )}
          </button>
          <button
            onClick={onClosePanel}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
            aria-label="패널 접기"
          >
            <PanelRightClose size={15} className="text-gray-500" />
          </button>
        </div>
      </div>
      {/* Breadcrumb */}
      {activeTab?.artifact && (
        <div className="px-3 py-1.5 border-t border-gray-100">
          <ArtifactBreadcrumb
            type={activeTab.artifact.type}
            title={activeTab.title}
            versionCount={versionCount}
            currentVersion={currentVersion}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(ArtifactPanelHeader);
