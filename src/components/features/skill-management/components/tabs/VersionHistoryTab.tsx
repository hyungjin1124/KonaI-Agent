'use client';

import React, { useState } from 'react';
import { Clock, GitBranch, RotateCcw, User, ChevronRight, FileText, ChevronDown, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TeamSkill, ChangeEntry, ChangeTag, SkillVersionEntry } from '@/types/skill-management.types';
import { CURRENT_USER, MOCK_DYNAMIC_COMPARISONS } from '../../data/skillMockData';
import { InlineDiffViewer } from '../InlineDiffViewer';
import { DynamicComparisonBlock } from '../DynamicComparisonBlock';

// ── Props ─────────────────────────────────────────────────────────────────────

interface VersionHistoryTabProps {
  skill: TeamSkill;
  onRestoreVersion?: (version: string) => void;
  /** Panel is in full-width expanded mode — enables side-by-side diff toggle */
  isExpanded?: boolean;
  /** 특정 버전 복사 (v11) */
  onCopyVersion?: (version: string) => void;
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
  /** Called when user clicks an entry row — passes entry index for scroll-to-chunk */
  onEntryClick?: (entryIndex: number) => void;
  /** Whether entries are clickable (diff is available) */
  clickable?: boolean;
}

function AiSummaryBlock({ entries, expanded, onToggle, isLatest, onEntryClick, clickable }: AiSummaryBlockProps) {
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
          <div
            key={i}
            className={`space-y-0.5 ${clickable ? 'cursor-pointer rounded px-1 -mx-1 hover:bg-blue-50/60 transition-colors' : ''}`}
            onClick={clickable ? () => onEntryClick?.(i) : undefined}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            onKeyDown={clickable ? (e) => { if (e.key === 'Enter') onEntryClick?.(i); } : undefined}
          >
            <div className="flex items-center gap-2">
              <TagBadge tag={entry.tag} />
              <span className="text-xs xl:text-sm text-gray-700">{entry.subject}</span>
              {clickable && (
                <span className="ml-auto text-[10px] text-gray-300 shrink-0">↓ 원문</span>
              )}
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

export function VersionHistoryTab({ skill, onRestoreVersion, isExpanded, onCopyVersion }: VersionHistoryTabProps) {
  // Set of version strings whose AI summary is expanded
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [restoredVersion, setRestoredVersion] = useState<string | null>(null);
  // Version string for which the diff viewer is open (compared against its previous version)
  const [diffOpenVersion, setDiffOpenVersion] = useState<string | null>(null);
  // Chunk index to highlight in the diff viewer (from AI summary click)
  const [highlightChunk, setHighlightChunk] = useState<{ version: string; index: number } | null>(null);
  // Dynamic comparison: { version: string, compareWith: string } — which card is showing a non-adjacent comparison
  const [dynamicComparison, setDynamicComparison] = useState<{ version: string; compareWith: string } | null>(null);

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
          const isSummaryExpanded = isLatest || expandedVersions.has(entry.version);
          const canRestore = isMySkill && !isLatest;

          // Find the previous version (next in sorted array = older)
          const sortedIndex = sorted.findIndex((v) => v.version === entry.version);
          const prevEntry: SkillVersionEntry | undefined = sorted[sortedIndex + 1];
          const hasDiff = !!(entry.promptSnapshot && prevEntry?.promptSnapshot);
          const isDiffOpen = diffOpenVersion === entry.version;

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
                  {onCopyVersion && (
                    <button
                      onClick={() => onCopyVersion(entry.version)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] xl:text-xs font-medium text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors"
                      title={`${entry.version} 기반으로 복사`}
                    >
                      <Copy size={10} />
                      이 버전으로 복사
                    </button>
                  )}
                </div>
              </div>

              {/* Card body: AI summary + diff */}
              <div className="px-3 py-2.5">
                <AiSummaryBlock
                  entries={entry.changeEntries}
                  expanded={isSummaryExpanded}
                  onToggle={() => toggleExpand(entry.version)}
                  isLatest={isLatest}
                  clickable={hasDiff}
                  onEntryClick={(entryIndex) => {
                    // Open diff if not already open, then scroll to chunk
                    if (!isDiffOpen) setDiffOpenVersion(entry.version);
                    // Use requestAnimationFrame to wait for diff to render when first opened
                    const apply = () => setHighlightChunk({ version: entry.version, index: entryIndex });
                    if (isDiffOpen) apply();
                    else requestAnimationFrame(() => requestAnimationFrame(apply));
                  }}
                />

                {/* Action buttons row */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {/* "원문 비교" button — only for non-first versions with snapshots */}
                  {hasDiff && (
                    <button
                      onClick={() =>
                        setDiffOpenVersion(isDiffOpen ? null : entry.version)
                      }
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] xl:text-xs font-medium transition-colors ${
                        isDiffOpen
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <FileText size={11} />
                      원문 비교
                    </button>
                  )}

                  {/* "다른 버전과 비교" dropdown — for versions with 2+ older versions */}
                  {(() => {
                    // Other versions to compare with (exclude direct predecessor)
                    const otherVersions = sorted.filter(
                      (v) => v.version !== entry.version && v.version !== prevEntry?.version,
                    );
                    if (otherVersions.length === 0) return null;

                    const isComparing = dynamicComparison?.version === entry.version;

                    return (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] xl:text-xs font-medium transition-colors ${
                              isComparing
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            다른 버전과 비교
                            <ChevronDown size={11} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[120px]">
                          {otherVersions.map((v) => (
                            <DropdownMenuItem
                              key={v.version}
                              onClick={() =>
                                setDynamicComparison(
                                  isComparing && dynamicComparison?.compareWith === v.version
                                    ? null
                                    : { version: entry.version, compareWith: v.version },
                                )
                              }
                              className="text-xs"
                            >
                              <span className="font-mono font-medium">{v.version}</span>
                              <span className="text-gray-400 ml-1.5">{v.modifiedAt}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  })()}
                </div>

                {/* Dynamic comparison block */}
                {dynamicComparison?.version === entry.version && (() => {
                  const compKey = `${skill.id}:${entry.version}:${dynamicComparison.compareWith}`;
                  const entries = MOCK_DYNAMIC_COMPARISONS[compKey];
                  if (!entries) return null;

                  return (
                    <DynamicComparisonBlock
                      fromVersion={dynamicComparison.compareWith}
                      toVersion={entry.version}
                      entries={entries}
                      onClose={() => setDynamicComparison(null)}
                    />
                  );
                })()}

                {/* Inline diff viewer */}
                {isDiffOpen && prevEntry?.promptSnapshot && entry.promptSnapshot && (
                  <InlineDiffViewer
                    oldText={prevEntry.promptSnapshot}
                    newText={entry.promptSnapshot}
                    fromVersion={prevEntry.version}
                    toVersion={entry.version}
                    onClose={() => setDiffOpenVersion(null)}
                    showViewToggle={isExpanded}
                    highlightChunkIndex={
                      highlightChunk?.version === entry.version ? highlightChunk.index : null
                    }
                    onHighlightComplete={() => setHighlightChunk(null)}
                  />
                )}
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
