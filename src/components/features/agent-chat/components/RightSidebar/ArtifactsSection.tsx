import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, BarChart2, Image, File, Download, Presentation, FileDown, Table2, Library } from 'lucide-react';
import { Artifact, ARTIFACT_DRAG_MIME_TYPE } from '../../types';
import { ArtifactLibraryPanel } from '../ArtifactLibrary/ArtifactLibraryPanel';

type TabId = 'current' | 'library';

interface ArtifactsSectionProps {
  artifacts: Artifact[];
  selectedArtifactId?: string;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: (artifact: Artifact) => void;
  onDownload: (artifact: Artifact) => void;
  onScrollToMessage?: (messageId: string) => void;
}

const getArtifactIcon = (type: Artifact['type']) => {
  switch (type) {
    case 'ppt':
      return <Presentation className="w-4 h-4 text-orange-500" />;
    case 'chart':
      return <BarChart2 className="w-4 h-4 text-blue-500" />;
    case 'pdf':
      return <FileDown className="w-4 h-4 text-red-500" />;
    case 'docx':
      return <FileText className="w-4 h-4 text-blue-600" />;
    case 'document':
      return <FileText className="w-4 h-4 text-gray-600" />;
    case 'markdown':
      return <FileText className="w-4 h-4 text-purple-500" />;
    case 'image':
      return <Image className="w-4 h-4 text-green-500" />;
    case 'xlsx':
    case 'csv':
      return <Table2 className="w-4 h-4 text-green-600" />;
    case 'pptx':
      return <Presentation className="w-4 h-4 text-orange-500" />;
    default:
      return <File className="w-4 h-4 text-gray-400" />;
  }
};

export const ArtifactsSection: React.FC<ArtifactsSectionProps> = ({
  artifacts,
  selectedArtifactId,
  isExpanded,
  onToggle,
  onSelect,
  onDownload,
  onScrollToMessage,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('current');

  return (
    <div className="border-b border-gray-200">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-sm font-medium text-gray-900">작업 폴더</span>
        </div>
        {artifacts.length > 0 && (
          <span className="text-xs text-gray-500">{artifacts.length}</span>
        )}
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="px-4 pb-3">
          {/* Tab Bar */}
          <div className="flex items-center gap-1 mb-2 border-b border-gray-100">
            <button
              onClick={() => setActiveTab('current')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'current'
                  ? 'text-orange-600 border-orange-500'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
              role="tab"
              aria-selected={activeTab === 'current'}
            >
              <FileText className="w-3.5 h-3.5" />
              현재 대화
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'library'
                  ? 'text-orange-600 border-orange-500'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
              role="tab"
              aria-selected={activeTab === 'library'}
            >
              <Library className="w-3.5 h-3.5" />
              라이브러리
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'current' ? (
            <div className="space-y-1">
              {artifacts.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">생성된 파일이 없습니다</p>
              ) : (
                artifacts.map((artifact) => (
                  <div
                    key={artifact.id}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        ARTIFACT_DRAG_MIME_TYPE,
                        JSON.stringify({ id: artifact.id, title: artifact.title, type: artifact.type, fileSize: artifact.fileSize })
                      );
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-grab active:cursor-grabbing group transition-colors ${
                      selectedArtifactId === artifact.id
                        ? 'bg-orange-50 border border-orange-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onSelect(artifact)}
                  >
                    {getArtifactIcon(artifact.type)}
                    <span className="text-sm text-gray-700 flex-1 truncate">
                      {artifact.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(artifact);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                      title="다운로드"
                    >
                      <Download className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <ArtifactLibraryPanel onScrollToMessage={onScrollToMessage} />
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(ArtifactsSection);
