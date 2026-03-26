'use client';

import React, { useState, useMemo } from 'react';
import { Clock, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import { ArtifactVersion } from '../../../../../types/artifact-library.types';

interface ArtifactVersionHistoryProps {
  versions: ArtifactVersion[];
  currentContent?: string;
  onRestore: (versionId: string) => void;
  onClose: () => void;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('ko-KR', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** 간단한 인라인 diff: 줄 단위 추가/삭제 표시 */
function computeSimpleDiff(oldText: string, newText: string): { type: 'same' | 'add' | 'remove'; line: string }[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const result: { type: 'same' | 'add' | 'remove'; line: string }[] = [];

  const maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];
    if (oldLine === newLine) {
      result.push({ type: 'same', line: newLine || '' });
    } else {
      if (oldLine !== undefined) result.push({ type: 'remove', line: oldLine });
      if (newLine !== undefined) result.push({ type: 'add', line: newLine });
    }
  }
  return result;
}

export const ArtifactVersionHistory: React.FC<ArtifactVersionHistoryProps> = ({
  versions,
  currentContent,
  onRestore,
  onClose,
}) => {
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);

  // 최신순 정렬
  const sortedVersions = useMemo(
    () => [...versions].sort((a, b) => b.versionNumber - a.versionNumber),
    [versions]
  );

  const latestVersion = sortedVersions[0];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-900">버전 히스토리</span>
          <span className="text-xs text-gray-500">({versions.length})</span>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          닫기
        </button>
      </div>

      {/* Version List */}
      <div className="flex-1 overflow-y-auto">
        {sortedVersions.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center">
            버전 기록이 없습니다
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedVersions.map((version, idx) => {
              const isLatest = version.id === latestVersion?.id;
              const isExpanded = expandedVersionId === version.id;
              const prevVersion = idx < sortedVersions.length - 1 ? sortedVersions[idx + 1] : null;

              return (
                <div key={version.id} className="px-3 py-2">
                  {/* Version header */}
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setExpandedVersionId(isExpanded ? null : version.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedVersionId(isExpanded ? null : version.id);
                      }
                    }}
                  >
                    {isExpanded
                      ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      : <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-gray-900">
                          v{version.versionNumber}
                        </span>
                        {isLatest && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-green-100 text-green-700 rounded">
                            최신
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-gray-500">
                          {formatDateTime(version.createdAt)}
                        </span>
                        {version.changeDescription && (
                          <>
                            <span className="text-[11px] text-gray-400">·</span>
                            <span className="text-[11px] text-gray-500 truncate">
                              {version.changeDescription}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 복원 버튼 (최신 버전이 아닐 때만) */}
                    {!isLatest && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestore(version.id);
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 rounded transition-colors"
                        title="이 버전으로 복원"
                        aria-label={`v${version.versionNumber}로 복원`}
                      >
                        <RotateCcw className="w-3 h-3" />
                        복원
                      </button>
                    )}
                  </div>

                  {/* Expanded: Diff View */}
                  {isExpanded && prevVersion && (
                    <div className="mt-2 ml-5 p-2 bg-gray-50 rounded text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto">
                      {computeSimpleDiff(prevVersion.content, version.content).map((line, i) => (
                        <div
                          key={i}
                          className={`whitespace-pre-wrap ${
                            line.type === 'add'
                              ? 'bg-green-100 text-green-800'
                              : line.type === 'remove'
                              ? 'bg-red-100 text-red-800 line-through'
                              : 'text-gray-600'
                          }`}
                        >
                          {line.type === 'add' ? '+ ' : line.type === 'remove' ? '- ' : '  '}
                          {line.line}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Expanded: No previous version (first version) */}
                  {isExpanded && !prevVersion && (
                    <div className="mt-2 ml-5 p-2 bg-gray-50 rounded">
                      <span className="text-xs text-gray-500">초기 버전 — 이전 비교 대상 없음</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ArtifactVersionHistory);
