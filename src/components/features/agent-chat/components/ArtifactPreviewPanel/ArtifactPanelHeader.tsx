import React from 'react';
import { PanelRightClose, Maximize2, Minimize2, Download } from 'lucide-react';
import { ArtifactTabBar } from './ArtifactTabBar';
import { ArtifactTab } from '../../types';

interface ArtifactPanelHeaderProps {
  tabs: ArtifactTab[];
  activeTabId: string | null;
  isMaximized: boolean;
  onSwitchTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onToggleMaximize: () => void;
  onClosePanel: () => void;
  onDownload?: () => void;
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
}) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80">
      {/* 탭 바 */}
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
  );
};

export default React.memo(ArtifactPanelHeader);
