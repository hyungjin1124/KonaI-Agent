import React from 'react';
import { X, FileText, BarChart2, Presentation, FileDown, Table2, File, Image, Layout } from 'lucide-react';
import { ArtifactTab, ArtifactPreviewType } from '../../types';

interface ArtifactTabBarProps {
  tabs: ArtifactTab[];
  activeTabId: string | null;
  onSwitchTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
}

const getTabIcon = (previewType: ArtifactPreviewType) => {
  switch (previewType) {
    case 'ppt':
      return <Presentation className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />;
    case 'chart':
    case 'dashboard':
      return <BarChart2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />;
    case 'pdf':
      return <FileDown className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />;
    case 'docx':
      return <FileText className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />;
    case 'markdown':
      return <FileText className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />;
    case 'xlsx':
    case 'csv':
      return <Table2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />;
    case 'pptx':
      return <Presentation className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />;
    case 'slide-outline':
      return <Layout className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />;
    default:
      return <File className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />;
  }
};

export const ArtifactTabBar: React.FC<ArtifactTabBarProps> = ({
  tabs,
  activeTabId,
  onSwitchTab,
  onCloseTab,
}) => {
  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 overflow-x-auto scrollbar-hide min-h-[36px]">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            onClick={() => onSwitchTab(tab.id)}
            className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
              max-w-[180px] min-w-0 group transition-colors
              ${isActive
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }
            `}
            title={tab.title}
          >
            {getTabIcon(tab.previewType)}
            <span className="truncate">{tab.title}</span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }
              }}
              className={`
                ml-0.5 p-0.5 rounded transition-opacity flex-shrink-0
                ${isActive
                  ? 'opacity-60 hover:opacity-100 hover:bg-gray-200'
                  : 'opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-gray-200'
                }
              `}
              aria-label={`${tab.title} 탭 닫기`}
            >
              <X className="w-3 h-3" />
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default React.memo(ArtifactTabBar);
