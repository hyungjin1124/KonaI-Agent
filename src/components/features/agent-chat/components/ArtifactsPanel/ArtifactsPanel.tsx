import React from 'react';
import {
  PanelRightClose,
  Download,
  FileText,
  Code,
  LayoutTemplate,
  BarChart2,
  FileImage
} from '../../../../icons';
import { Artifact, ArtifactType } from '../../types';

interface ArtifactsPanelProps {
  artifacts: Artifact[];
  onClose: () => void;
  onDownloadAll: () => void;
  onDownloadItem: (artifact: Artifact) => void;
  onArtifactClick?: (artifact: Artifact) => void;
}

const ARTIFACT_ICONS: Record<ArtifactType, React.FC<{ size?: number; className?: string }>> = {
  document: FileText,
  markdown: Code,
  ppt: LayoutTemplate,
  chart: BarChart2,
  image: FileImage,
};

const ARTIFACT_TYPE_LABELS: Record<ArtifactType, string> = {
  document: '문서',
  markdown: 'MD',
  ppt: 'PPT',
  chart: '차트',
  image: '이미지',
};

export const ArtifactsPanel: React.FC<ArtifactsPanelProps> = ({
  artifacts,
  onClose,
  onDownloadAll,
  onDownloadItem,
  onArtifactClick,
}) => {
  return (
    <div className="h-full flex flex-col bg-gray-50 animate-fade-in-up">
      {/* Header */}
      <div className="px-6 py-5 flex justify-between items-center shrink-0">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">아티팩트</h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onDownloadAll}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors border border-gray-300"
          >
            <Download size={14} />
            모두 다운로드
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
            title="패널 접기"
          >
            <PanelRightClose size={18} />
          </button>
        </div>
      </div>

      {/* Artifact List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
        <div className="space-y-2">
          {artifacts.map((artifact) => {
            const Icon = ARTIFACT_ICONS[artifact.type];
            const typeLabel = ARTIFACT_TYPE_LABELS[artifact.type];

            return (
              <div
                key={artifact.id}
                onClick={() => onArtifactClick?.(artifact)}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gray-100 rounded-lg">
                    <Icon size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{artifact.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                        {typeLabel}
                      </span>
                      {artifact.fileSize && (
                        <span className="text-xs text-gray-500">{artifact.fileSize}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadItem(artifact);
                  }}
                  className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="다운로드"
                >
                  <Download size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {artifacts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <FileText size={32} className="mb-2 opacity-50" />
            <p className="text-sm">생성된 파일이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtifactsPanel;
