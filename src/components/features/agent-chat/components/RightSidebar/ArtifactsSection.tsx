import React from 'react';
import { ChevronDown, ChevronRight, FileText, BarChart2, Image, File, Download, Presentation } from 'lucide-react';
import { Artifact } from '../../types';

interface ArtifactsSectionProps {
  artifacts: Artifact[];
  selectedArtifactId?: string;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: (artifact: Artifact) => void;
  onDownload: (artifact: Artifact) => void;
}

const getArtifactIcon = (type: Artifact['type']) => {
  switch (type) {
    case 'ppt':
      return <Presentation className="w-4 h-4 text-orange-500" />;
    case 'chart':
      return <BarChart2 className="w-4 h-4 text-blue-500" />;
    case 'document':
      return <FileText className="w-4 h-4 text-gray-600" />;
    case 'markdown':
      return <FileText className="w-4 h-4 text-purple-500" />;
    case 'image':
      return <Image className="w-4 h-4 text-green-500" />;
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
}) => {
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
        <div className="px-4 pb-3 space-y-1">
          {artifacts.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">생성된 파일이 없습니다</p>
          ) : (
            artifacts.map((artifact) => (
              <div
                key={artifact.id}
                className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer group transition-colors ${
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
      )}
    </div>
  );
};

export default ArtifactsSection;
