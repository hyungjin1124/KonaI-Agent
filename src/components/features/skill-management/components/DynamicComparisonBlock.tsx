'use client';

import React from 'react';
import type { DynamicComparisonEntry, ChangeTag } from '@/types/skill-management.types';

// ── Tag badge (reuse style from VersionHistoryTab) ───────────────────────────

const TAG_COLORS: Record<ChangeTag, string> = {
  '추가': 'bg-blue-50 text-blue-700 border-blue-200',
  '변경': 'bg-amber-50 text-amber-700 border-amber-200',
  '삭제': 'bg-red-50 text-red-700 border-red-200',
  '개선': 'bg-green-50 text-green-700 border-green-200',
};

// ── Props ────────────────────────────────────────────────────────────────────

interface DynamicComparisonBlockProps {
  fromVersion: string;
  toVersion: string;
  entries: DynamicComparisonEntry[];
  onClose: () => void;
  onShowDiff?: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export function DynamicComparisonBlock({
  fromVersion,
  toVersion,
  entries,
  onClose,
  onShowDiff,
}: DynamicComparisonBlockProps) {
  // Parse version numbers for range description
  const fromNum = parseInt(fromVersion.replace('v', ''), 10);
  const toNum = parseInt(toVersion.replace('v', ''), 10);
  const spanCount = Math.abs(toNum - fromNum);

  return (
    <div className="rounded-md bg-gray-50/50 border-l-2 border-blue-300 pl-3 pr-3 py-2.5 mt-3 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] xl:text-xs font-semibold text-gray-500 tracking-wide">
          🤖 {toVersion} ↔ {fromVersion} AI 비교 분석
        </span>
        <button
          onClick={onClose}
          className="text-[10px] xl:text-xs text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="비교 블록 닫기"
        >
          닫기
        </button>
      </div>

      {/* Range description */}
      {spanCount > 1 && (
        <p className="text-[11px] xl:text-xs text-gray-400">
          {fromVersion} 이후 {spanCount}개 버전에 걸쳐 변경된 내용:
        </p>
      )}

      {/* Entries */}
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <div key={i} className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] xl:text-xs font-bold border ${TAG_COLORS[entry.tag]}`}
              >
                {entry.tag}
              </span>
              <span className="text-xs xl:text-sm text-gray-700">{entry.subject}</span>
              {entry.occurredIn && (
                <span className="text-[10px] xl:text-xs text-gray-400 shrink-0">
                  ({entry.occurredIn})
                </span>
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

      {/* Actions */}
      {onShowDiff && (
        <div className="pt-1">
          <button
            onClick={onShowDiff}
            className="text-[11px] xl:text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            원문 비교 보기
          </button>
        </div>
      )}
    </div>
  );
}
