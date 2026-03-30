'use client';

import React from 'react';
import { Library } from 'lucide-react';
import { useArtifactLibrary } from '../../context/ArtifactLibraryContext';
import { useArtifactPanel } from '../../context/ArtifactPanelContext';
import { ArtifactLibraryFilters } from './ArtifactLibraryFilters';
import { ArtifactLibraryCard } from './ArtifactLibraryCard';
import { LibraryArtifact } from '../../../../../types/artifact-library.types';
import { ArtifactPreviewType } from '../../types';

interface ArtifactLibraryPanelProps {
  onScrollToMessage?: (messageId: string) => void;
}

function getPreviewTypeForArtifact(type: LibraryArtifact['type']): ArtifactPreviewType {
  switch (type) {
    case 'markdown': case 'document': return 'markdown';
    case 'pdf': return 'pdf';
    case 'docx': return 'docx';
    case 'xlsx': return 'xlsx';
    case 'csv': return 'csv';
    case 'pptx': return 'pptx';
    case 'ppt': return 'ppt';
    case 'chart': return 'chart';
    case 'slide-outline': return 'slide-outline';
    default: return 'markdown';
  }
}

export const ArtifactLibraryPanel: React.FC<ArtifactLibraryPanelProps> = ({
  onScrollToMessage,
}) => {
  const {
    libraryArtifacts,
    filteredArtifacts,
    filter,
    setFilter,
    toggleFavorite,
    deleteArtifact,
  } = useArtifactLibrary();

  const { openArtifactTab, activeTabId } = useArtifactPanel();

  const handleSelect = (artifact: LibraryArtifact) => {
    openArtifactTab(
      {
        id: artifact.id,
        title: artifact.title,
        type: artifact.type,
        createdAt: artifact.createdAt,
        messageId: artifact.messageId,
        fileSize: artifact.fileSize,
      },
      getPreviewTypeForArtifact(artifact.type)
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Filters */}
      <ArtifactLibraryFilters
        filter={filter}
        onFilterChange={setFilter}
        totalCount={libraryArtifacts.length}
        filteredCount={filteredArtifacts.length}
      />

      {/* Artifact List */}
      <div className="space-y-0.5">
        {filteredArtifacts.length === 0 ? (
          <div className="py-6 text-center">
            <Library className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {libraryArtifacts.length === 0
                ? '저장된 아티팩트가 없습니다'
                : '검색 결과가 없습니다'}
            </p>
            {libraryArtifacts.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                에이전트가 생성한 결과물이 자동으로 저장됩니다
              </p>
            )}
          </div>
        ) : (
          filteredArtifacts.map((artifact) => (
            <ArtifactLibraryCard
              key={artifact.id}
              artifact={artifact}
              isSelected={activeTabId === artifact.id}
              onSelect={handleSelect}
              onToggleFavorite={toggleFavorite}
              onDelete={deleteArtifact}
              onScrollToMessage={onScrollToMessage}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(ArtifactLibraryPanel);
