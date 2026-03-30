'use client';

import React from 'react';
import { FileText, BarChart2, Image, File, Presentation, FileDown, Table2, Star, Trash2 } from 'lucide-react';
import { LibraryArtifact } from '../../../../../types/artifact-library.types';
import { ArtifactType } from '../../types';

interface ArtifactLibraryCardProps {
  artifact: LibraryArtifact;
  isSelected?: boolean;
  onSelect: (artifact: LibraryArtifact) => void;
  onToggleFavorite: (artifactId: string) => void;
  onDelete: (artifactId: string) => void;
  onScrollToMessage?: (messageId: string) => void;
}

function getArtifactIcon(type: ArtifactType) {
  switch (type) {
    case 'ppt': return <Presentation className="w-4 h-4 text-orange-500" />;
    case 'chart': return <BarChart2 className="w-4 h-4 text-blue-500" />;
    case 'pdf': return <FileDown className="w-4 h-4 text-red-500" />;
    case 'docx': return <FileText className="w-4 h-4 text-blue-600" />;
    case 'document': return <FileText className="w-4 h-4 text-gray-600" />;
    case 'markdown': return <FileText className="w-4 h-4 text-purple-500" />;
    case 'image': return <Image className="w-4 h-4 text-green-500" />;
    case 'xlsx': case 'csv': return <Table2 className="w-4 h-4 text-green-600" />;
    case 'pptx': return <Presentation className="w-4 h-4 text-orange-500" />;
    default: return <File className="w-4 h-4 text-gray-400" />;
  }
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR');
}

function getTypeLabel(type: ArtifactType): string {
  const map: Record<string, string> = {
    document: '문서', markdown: '마크다운', ppt: 'PPT', chart: '차트',
    image: '이미지', pdf: 'PDF', docx: 'Word', xlsx: 'Excel',
    csv: 'CSV', pptx: 'PPTX', 'slide-outline': '슬라이드 개요',
  };
  return map[type] || type;
}

export const ArtifactLibraryCard: React.FC<ArtifactLibraryCardProps> = ({
  artifact,
  isSelected,
  onSelect,
  onToggleFavorite,
  onDelete,
  onScrollToMessage,
}) => {
  return (
    <div
      className={`group flex items-start gap-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-orange-50 border border-orange-200'
          : 'hover:bg-gray-50 border border-transparent'
      }`}
      onClick={() => onSelect(artifact)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(artifact);
        }
      }}
    >
      {/* Icon */}
      <div className="mt-0.5 flex-shrink-0">
        {getArtifactIcon(artifact.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-gray-900 truncate">
            {artifact.title}
          </span>
          {artifact.isFavorited && (
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">{getTypeLabel(artifact.type)}</span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-500">{formatRelativeDate(artifact.updatedAt)}</span>
          {artifact.versionCount > 1 && (
            <>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-500">v{artifact.versionCount}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(artifact.id); }}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title={artifact.isFavorited ? '즐겨찾기 해제' : '즐겨찾기'}
          aria-label={artifact.isFavorited ? '즐겨찾기 해제' : '즐겨찾기'}
        >
          <Star className={`w-3.5 h-3.5 ${artifact.isFavorited ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
        </button>
        {onScrollToMessage && artifact.messageId && (
          <button
            onClick={(e) => { e.stopPropagation(); onScrollToMessage(artifact.messageId); }}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="채팅으로 이동"
            aria-label="채팅 메시지로 이동"
          >
            <FileText className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(artifact.id); }}
          className="p-1 hover:bg-red-100 rounded transition-colors"
          title="삭제"
          aria-label="아티팩트 삭제"
        >
          <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default React.memo(ArtifactLibraryCard);
