'use client';

import React, { useState } from 'react';
import { Clock, GitBranch, RotateCcw, User, ChevronRight } from 'lucide-react';
import type { TeamSkill, ChangeEntry, ChangeTag } from '@/types/skill-management.types';
import { CURRENT_USER } from '../../data/skillMockData';

// ── Props ─────────────────────────────────────────────────────────────────────

interface VersionHistoryTabProps {
  skill: TeamSkill;
  onRestoreVersion?: (version: string) => void;
}

// ── Tag badge ─────────────────────────────────────────────────────────────────

const TAG_COLORS: Record<ChangeTag, string> = {
  '추가': 'bg-blue-50 text-blue-700 border-blue-200',
  '변경': 'bg-amber-50 text-amber-700 border-amber-200',
  '삭제': 'bg-red-50 text-red-700 border-red-200',
  '개선': 'bg-green-50 text-green-700 border-green-200',
};

function TagBadge({ tag }: { tag: ChangeTag }) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] xl:text-xs font-bold border ${TAG_COLORS[tag]}`}
    >
      {tag}
    </span>
  );
}

// ── AI Change Summary block ───────────────────────────────────────────────────

interface AiSummaryBlockProps {
  entries: ChangeEntry[];
  expanded: boolean;
  onToggle: () => void;
  isLatest: boolean;
}

function AiSummaryBlock({ entries, expanded, onToggle, isLatest }: AiSummaryBlockProps) {
  if (entries.length === 0) return null;

  const first = entries[0];
  const remainingCount = entries.length - 1;

  // Collapsed one-liner (only for non-latest)
  if (!isLatest && !expanded) {
    return (
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 text-left group"
        aria-label="AI 변경 요약 펼치기"
      >
        <span className="text-[11px] xl:text-xs text-gray-400 shrink-0">🤖</span>
        <TagBadge tag={first.tag} />
        <span className="text-xs xl:text-sm text-gray-600 truncate">{first.subject}</span>
        {remainingCount > 0 && (
          <span className="text-[11px] xl:text-xs text-gray-400 shrink-0">
            외 {remainingCount}건
          </span>
        )}
        <ChevronRight
          size={12}
          className="ml-auto shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors"
        />
      </button>
    );
  }

  // Expanded block
  return (
    <div className="rounded-md bg-gray-50/50 border-l-2 border-blue-300 pl-3 pr-3 py-2.5 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] xl:text-xs font-semibold text-gray-500 tracking-wide">
          🤖 AI 변경 요약
        </span>
        {/* Collapse toggle for non-latest expanded state */}
        {!isLatest && (
          <button
            onClick={onToggle}
            className="text-[10px] xl:text-xs text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="AI 변경 요약 접기"
          >
            접기
          </button>
        )}
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <div key={i} className="space-y-0.5">
            <div className="flex items-center gap-2">
              <TagBadge tag={entry.tag} />
              <span className="text-xs xl:text-sm text-gray-700">{entry.subject}</span>
            </div>
            {entry.impact && (
              <p className="text-[11px] xl:text-xs text-gray-500 pl-[3.25rem] leading-relaxed">
                → {entry.impact}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

const VISIBLE_VERSIONS_DEFAULT = 3;

export function VersionHistoryTab({ skill, onRestoreVersion }: VersionHistoryTabProps) {
  // Set of version strings whose AI summary is expanded
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [restoredVersion, setRestoredVersion] = useState<string | null>(null);

  // Most recent first
  const sorted = [...skill.versionHistory].sort((a, b) =>
    b.modifiedAt.localeCompare(a.modifiedAt),
  );

  const isMySkill = skill.authorId === CURRENT_USER.id;

  const visibleEntries = showAll ? sorted : sorted.slice(0, VISIBLE_VERSIONS_DEFAULT);
  const hiddenCount = sorted.length - VISIBLE_VERSIONS_DEFAULT;

  const toggleExpand = (version: string) => {
    setExpandedVersions((prev) => {
      const next = new Set(prev);
      if (next.has(version)) {
        next.delete(version);
      } else {
        next.add(version);
      }
      return next;
    });
  };

  const handleRestore = (version: string) => {
    const confirmed = window.confirm(
      `"${version}" 버전으로 스킬을 복구하시겠습니까?\n현재 버전의 내용이 덮어씌워집니다.`,
    );
    if (!confirmed) return;

    setRestoredVersion(version);
    onRestoreVersion?.(version);
    setTimeout(() => setRestoredVersion(null), 3000);
  };

  if (sorted.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <GitBranch size={20} className="text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">버전 이력이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 py-2">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs xl:text-sm font-semibold text-gray-400 uppercase tracking-wider">
          버전 이력
        </h3>
        <span className="text-xs xl:text-sm text-gray-400">{sorted.length}개 버전</span>
      </div>

      {/* Restore toast */}
      {restoredVersion && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-xs xl:text-sm text-green-700">
          <RotateCcw size={12} />
          <span>{restoredVersion} 버전으로 복구되었습니다.</span>
        </div>
      )}

      {/* Version cards */}
      <div className="space-y-2">
        {visibleEntries.map((entry, index) => {
          const isLatest = index === 0;
          const isExpanded = isLatest || expandedVersions.has(entry.version);
          const canRestore = isMySkill && !isLatest;

          return (
            <div
              key={entry.version}
              className="rounded-lg border border-gray-200 bg-white overflow-hidden"
            >
              {/* Card header */}
              <div
                className={[
                  'flex items-center justify-between px-3 py-2',
                  isLatest ? 'bg-gray-900' : 'bg-gray-50',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm xl:text-[15px] font-bold font-mono ${
                      isLatest ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {entry.version}
                  </span>
                  {isLatest && (
                    <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] xl:text-xs font-semibold">
                      현재
                    </span>
                  )}
                  {entry.isRestore && entry.restoredFrom && (
                    <span
                      className={`text-[10px] ${
                        isLatest ? 'text-gray-300' : 'text-gray-400'
                      }`}
                    >
                      ({entry.restoredFrom} 복구)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-1.5 text-[11px] xl:text-xs ${
                      isLatest ? 'text-gray-300' : 'text-gray-400'
                    }`}
                  >
                    <User size={10} />
                    <span>{entry.modifiedBy}</span>
                    <span className="opacity-60">·</span>
                    <Clock size={10} />
                    <span>{entry.modifiedAt}</span>
                  </div>

                  {canRestore && (
                    <button
                      onClick={() => handleRestore(entry.version)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] xl:text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                      title={`${entry.version}으로 복구`}
                    >
                      <RotateCcw size={10} />
                      이 버전으로 복구
                    </button>
                  )}
                </div>
              </div>

              {/* Card body: AI summary */}
              <div className="px-3 py-2.5">
                <AiSummaryBlock
                  entries={entry.changeEntries}
                  expanded={isExpanded}
                  onToggle={() => toggleExpand(entry.version)}
                  isLatest={isLatest}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more / less toggle */}
      {sorted.length >= VISIBLE_VERSIONS_DEFAULT + 1 && (
        <div className="text-center pt-1">
          {!showAll ? (
            <button
              onClick={() => setShowAll(true)}
              className="text-xs xl:text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              이전 버전 더 보기 ({hiddenCount}개)
            </button>
          ) : (
            <button
              onClick={() => setShowAll(false)}
              className="text-xs xl:text-sm text-gray-400 hover:text-gray-600 hover:underline transition-colors"
            >
              접기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
