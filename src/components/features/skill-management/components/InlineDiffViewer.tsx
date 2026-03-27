'use client';

import React, { useState, useMemo } from 'react';
import { diffLines, type Change } from 'diff';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface InlineDiffViewerProps {
  oldText: string;
  newText: string;
  fromVersion: string;
  toVersion: string;
  onClose: () => void;
  /** Show [Unified | Side-by-side] toggle — only in full-page mode */
  showViewToggle?: boolean;
}

type DiffViewMode = 'unified' | 'side-by-side';

/** Minimum unchanged lines to trigger collapsing */
const COLLAPSE_THRESHOLD = 5;
/** Context lines to keep around changes */
const CONTEXT_LINES = 2;

// ── Segment types for rendering ──────────────────────────────────────────────

interface DiffLine {
  text: string;
  type: 'added' | 'removed' | 'unchanged';
}

interface VisibleSegment {
  kind: 'lines';
  lines: DiffLine[];
  chunkIndex?: number; // for anchor scrolling (only set on change lines)
}

interface CollapsedSegment {
  kind: 'collapsed';
  lineCount: number;
  lines: DiffLine[];
  segmentIndex: number;
}

type Segment = VisibleSegment | CollapsedSegment;

// ── Helpers ──────────────────────────────────────────────────────────────────

function changesToLines(changes: Change[]): DiffLine[] {
  const lines: DiffLine[] = [];
  for (const change of changes) {
    const type: DiffLine['type'] = change.added
      ? 'added'
      : change.removed
        ? 'removed'
        : 'unchanged';
    const rawLines = change.value.split('\n');
    // diffLines appends a trailing \n, so the last split element is empty
    for (let i = 0; i < rawLines.length; i++) {
      if (i === rawLines.length - 1 && rawLines[i] === '') continue;
      lines.push({ text: rawLines[i], type });
    }
  }
  return lines;
}

function buildSegments(allLines: DiffLine[]): Segment[] {
  const segments: Segment[] = [];
  let chunkIdx = 0;
  let segIdx = 0;
  let i = 0;

  while (i < allLines.length) {
    const line = allLines[i];

    if (line.type !== 'unchanged') {
      // Collect contiguous change lines
      const changeLines: DiffLine[] = [];
      while (i < allLines.length && allLines[i].type !== 'unchanged') {
        changeLines.push(allLines[i]);
        i++;
      }
      segments.push({ kind: 'lines', lines: changeLines, chunkIndex: chunkIdx });
      chunkIdx++;
    } else {
      // Collect contiguous unchanged lines
      const unchangedLines: DiffLine[] = [];
      while (i < allLines.length && allLines[i].type === 'unchanged') {
        unchangedLines.push(allLines[i]);
        i++;
      }

      if (unchangedLines.length > COLLAPSE_THRESHOLD) {
        // Keep top context (if not at the very beginning)
        const isStart = segments.length === 0;
        const isEnd = i >= allLines.length;
        const topCtx = isStart ? 0 : CONTEXT_LINES;
        const botCtx = isEnd ? 0 : CONTEXT_LINES;

        if (topCtx > 0) {
          segments.push({ kind: 'lines', lines: unchangedLines.slice(0, topCtx) });
        }

        const collapsedLines = unchangedLines.slice(topCtx, unchangedLines.length - botCtx);
        if (collapsedLines.length > 0) {
          segments.push({
            kind: 'collapsed',
            lineCount: collapsedLines.length,
            lines: collapsedLines,
            segmentIndex: segIdx++,
          });
        }

        if (botCtx > 0) {
          segments.push({ kind: 'lines', lines: unchangedLines.slice(unchangedLines.length - botCtx) });
        }
      } else {
        segments.push({ kind: 'lines', lines: unchangedLines });
      }
    }
  }

  return segments;
}

// ── Unified Diff Render ──────────────────────────────────────────────────────

function UnifiedDiffView({
  segments,
  expandedCollapsed,
  onToggleCollapsed,
}: {
  segments: Segment[];
  expandedCollapsed: Set<number>;
  onToggleCollapsed: (idx: number) => void;
}) {
  return (
    <div className="font-mono text-xs leading-relaxed">
      {segments.map((seg, si) => {
        if (seg.kind === 'collapsed') {
          if (expandedCollapsed.has(seg.segmentIndex)) {
            return (
              <div key={`seg-${si}`}>
                {seg.lines.map((line, li) => (
                  <div key={li} className="px-3 py-0.5 text-gray-500">
                    {line.text || '\u00A0'}
                  </div>
                ))}
              </div>
            );
          }
          return (
            <button
              key={`seg-${si}`}
              onClick={() => onToggleCollapsed(seg.segmentIndex)}
              className="w-full text-center py-1.5 text-[11px] text-gray-400 italic hover:text-gray-600 hover:bg-gray-50 transition-colors border-y border-dashed border-gray-200"
            >
              ··· (변경 없음, {seg.lineCount}줄) ···
            </button>
          );
        }

        return (
          <div
            key={`seg-${si}`}
            id={seg.chunkIndex !== undefined ? `diff-chunk-${seg.chunkIndex}` : undefined}
          >
            {seg.lines.map((line, li) => (
              <div
                key={li}
                className={cn(
                  'px-3 py-0.5',
                  line.type === 'added' && 'bg-green-50 text-green-900',
                  line.type === 'removed' && 'bg-red-50 text-red-900 line-through',
                  line.type === 'unchanged' && 'text-gray-600',
                )}
              >
                <span className="inline-block w-4 text-gray-300 select-none mr-2">
                  {line.type === 'added' ? '+' : line.type === 'removed' ? '−' : ' '}
                </span>
                {line.text || '\u00A0'}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── Side-by-Side Diff Render ─────────────────────────────────────────────────

function SideBySideDiffView({ allLines }: { allLines: DiffLine[] }) {
  // Split into left (old: unchanged + removed) and right (new: unchanged + added)
  const leftLines: (DiffLine | null)[] = [];
  const rightLines: (DiffLine | null)[] = [];

  let i = 0;
  while (i < allLines.length) {
    const line = allLines[i];
    if (line.type === 'unchanged') {
      leftLines.push(line);
      rightLines.push(line);
      i++;
    } else if (line.type === 'removed') {
      // Collect consecutive removed, then added for alignment
      const removed: DiffLine[] = [];
      while (i < allLines.length && allLines[i].type === 'removed') {
        removed.push(allLines[i]);
        i++;
      }
      const added: DiffLine[] = [];
      while (i < allLines.length && allLines[i].type === 'added') {
        added.push(allLines[i]);
        i++;
      }
      const maxLen = Math.max(removed.length, added.length);
      for (let j = 0; j < maxLen; j++) {
        leftLines.push(j < removed.length ? removed[j] : null);
        rightLines.push(j < added.length ? added[j] : null);
      }
    } else if (line.type === 'added') {
      leftLines.push(null);
      rightLines.push(line);
      i++;
    }
  }

  const renderLine = (line: DiffLine | null) => {
    if (!line) {
      return <div className="px-2 py-0.5 bg-gray-50 text-transparent select-none">&nbsp;</div>;
    }
    return (
      <div
        className={cn(
          'px-2 py-0.5',
          line.type === 'added' && 'bg-green-50 text-green-900',
          line.type === 'removed' && 'bg-red-50 text-red-900 line-through',
          line.type === 'unchanged' && 'text-gray-600',
        )}
      >
        {line.text || '\u00A0'}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-0 font-mono text-xs leading-relaxed border-t border-gray-200">
      {/* Headers */}
      <div className="px-2 py-1 bg-red-50/50 text-[10px] font-semibold text-red-600 border-b border-r border-gray-200">
        이전 버전
      </div>
      <div className="px-2 py-1 bg-green-50/50 text-[10px] font-semibold text-green-600 border-b border-gray-200">
        현재 버전
      </div>
      {/* Lines */}
      <div className="border-r border-gray-200">
        {leftLines.map((line, i) => (
          <React.Fragment key={i}>{renderLine(line)}</React.Fragment>
        ))}
      </div>
      <div>
        {rightLines.map((line, i) => (
          <React.Fragment key={i}>{renderLine(line)}</React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function InlineDiffViewer({
  oldText,
  newText,
  fromVersion,
  toVersion,
  onClose,
  showViewToggle = false,
}: InlineDiffViewerProps) {
  const [viewMode, setViewMode] = useState<DiffViewMode>('unified');
  const [expandedCollapsed, setExpandedCollapsed] = useState<Set<number>>(new Set());

  const changes = useMemo(() => diffLines(oldText, newText), [oldText, newText]);
  const allLines = useMemo(() => changesToLines(changes), [changes]);
  const segments = useMemo(() => buildSegments(allLines), [allLines]);

  // Count stats
  const addedCount = allLines.filter((l) => l.type === 'added').length;
  const removedCount = allLines.filter((l) => l.type === 'removed').length;

  const toggleCollapsed = (idx: number) => {
    setExpandedCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="mt-3 rounded-lg border border-gray-200 overflow-hidden bg-white">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-[11px] font-semibold text-gray-500">
          원문 비교: {fromVersion} → {toVersion}
        </span>

        <div className="flex items-center gap-2">
          {/* View mode toggle — full page only */}
          {showViewToggle && (
            <div className="flex items-center">
              <button
                onClick={() => setViewMode('unified')}
                className={cn(
                  'px-2 py-0.5 text-[10px] rounded-l border',
                  viewMode === 'unified'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50',
                )}
              >
                Unified
              </button>
              <button
                onClick={() => setViewMode('side-by-side')}
                className={cn(
                  'px-2 py-0.5 text-[10px] rounded-r border-t border-r border-b',
                  viewMode === 'side-by-side'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50',
                )}
              >
                Side-by-side
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Diff content */}
      <div className="max-h-[400px] overflow-y-auto">
        {viewMode === 'unified' ? (
          <UnifiedDiffView
            segments={segments}
            expandedCollapsed={expandedCollapsed}
            onToggleCollapsed={toggleCollapsed}
          />
        ) : (
          <SideBySideDiffView allLines={allLines} />
        )}
      </div>

      {/* Footer summary */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-200">
        <span className="text-[11px] text-gray-400">
          {addedCount > 0 && (
            <span className="text-green-600">추가 {addedCount}줄</span>
          )}
          {addedCount > 0 && removedCount > 0 && <span className="mx-1">·</span>}
          {removedCount > 0 && (
            <span className="text-red-600">삭제 {removedCount}줄</span>
          )}
          {addedCount === 0 && removedCount === 0 && '변경 없음'}
        </span>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={10} />
          닫기
        </button>
      </div>
    </div>
  );
}
