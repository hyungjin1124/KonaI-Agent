import React from 'react';
import { FileText, X, Presentation, BarChart2, Image } from 'lucide-react';
import { AttachedFile } from '../../types';

interface AttachedFileChipProps {
  file: AttachedFile;
  onRemove: (id: string) => void;
}

/**
 * 첨부된 파일을 표시하는 칩 컴포넌트
 * - 파일 아이콘 + 파일명 + 제거 버튼
 * - 호버 시 scale 애니메이션
 */
export const AttachedFileChip: React.FC<AttachedFileChipProps> = ({
  file,
  onRemove,
}) => {
  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Artifact 타입별 아이콘
  const getIcon = () => {
    if (file.artifactType) {
      switch (file.artifactType) {
        case 'ppt': return <Presentation size={14} className="text-orange-500 flex-shrink-0" />;
        case 'chart': return <BarChart2 size={14} className="text-blue-500 flex-shrink-0" />;
        case 'image': return <Image size={14} className="text-green-500 flex-shrink-0" />;
        case 'markdown': return <FileText size={14} className="text-purple-500 flex-shrink-0" />;
      }
    }
    return <FileText size={14} className="text-gray-500 flex-shrink-0" />;
  };

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5
                 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium
                 hover:bg-gray-200 hover:scale-[1.02]
                 transition-all duration-150 ease-out
                 group cursor-default
                 border border-gray-200 shadow-sm"
    >
      {getIcon()}
      <span className="max-w-[140px] truncate" title={file.name}>
        {file.name}
      </span>
      {file.size > 0 && (
        <span className="text-gray-400 text-[10px]">
          ({formatFileSize(file.size)})
        </span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(file.id);
        }}
        className="ml-0.5 p-0.5 rounded-full
                   opacity-60 hover:opacity-100
                   hover:bg-gray-300
                   transition-all duration-150"
        title="파일 제거"
      >
        <X size={12} />
      </button>
    </div>
  );
};

export default AttachedFileChip;
