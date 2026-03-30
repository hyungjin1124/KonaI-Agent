'use client';

import React from 'react';
import { Search, Star, X } from 'lucide-react';
import { ArtifactFilter, ARTIFACT_TYPE_FILTERS } from '../../../../../types/artifact-library.types';
import { ArtifactType } from '../../types';

interface ArtifactLibraryFiltersProps {
  filter: ArtifactFilter;
  onFilterChange: (partial: Partial<ArtifactFilter>) => void;
  totalCount: number;
  filteredCount: number;
}

export const ArtifactLibraryFilters: React.FC<ArtifactLibraryFiltersProps> = ({
  filter,
  onFilterChange,
  totalCount,
  filteredCount,
}) => {
  const handleTypeToggle = (types: ArtifactType[]) => {
    const allSelected = types.every(t => filter.types.includes(t));
    if (allSelected) {
      onFilterChange({ types: filter.types.filter(t => !types.includes(t)) });
    } else {
      onFilterChange({ types: [...new Set([...filter.types, ...types])] });
    }
  };

  const hasActiveFilters = filter.types.length > 0 || filter.searchQuery || filter.favoritesOnly;

  return (
    <div className="space-y-2">
      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="아티팩트 검색..."
          value={filter.searchQuery}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          className="w-full pl-8 pr-8 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-300 focus:border-orange-300"
          aria-label="아티팩트 검색"
        />
        {filter.searchQuery && (
          <button
            onClick={() => onFilterChange({ searchQuery: '' })}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded"
            aria-label="검색어 지우기"
          >
            <X className="w-3 h-3 text-gray-400" />
          </button>
        )}
      </div>

      {/* 유형 필터 */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => onFilterChange({ favoritesOnly: !filter.favoritesOnly })}
          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border transition-colors ${
            filter.favoritesOnly
              ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
          aria-pressed={filter.favoritesOnly}
        >
          <Star className={`w-3 h-3 ${filter.favoritesOnly ? 'fill-yellow-500' : ''}`} />
        </button>
        {ARTIFACT_TYPE_FILTERS.map((group) => {
          const isActive = group.types.every(t => filter.types.includes(t));
          return (
            <button
              key={group.label}
              onClick={() => handleTypeToggle(group.types)}
              className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                isActive
                  ? 'bg-orange-50 border-orange-300 text-orange-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              aria-pressed={isActive}
            >
              {group.label}
            </button>
          );
        })}
      </div>

      {/* 필터 상태 */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {filteredCount}/{totalCount}개 표시
          </span>
          <button
            onClick={() => onFilterChange({
              types: [],
              searchQuery: '',
              favoritesOnly: false,
            })}
            className="text-xs text-orange-600 hover:text-orange-700"
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ArtifactLibraryFilters);
