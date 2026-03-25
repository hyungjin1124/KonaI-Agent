'use client';

import React, { useState, useCallback } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '../../../ui/popover';
import type { AccessLevel } from '../../../../types';

interface AccessMatrixCellProps {
  level: AccessLevel;
  isModified: boolean;
  onLevelSelect: (newLevel: AccessLevel) => void;
  /** Optional label shown at top of popover (e.g. "기본값 — 하위 7개 뷰에 일괄 적용") */
  label?: string;
  /** Whether this cell represents a view-level override */
  isOverride?: boolean;
  /** Callback to revert override back to inherited subcategory default */
  onRevertToInherited?: () => void;
  /** The inherited level from parent subcategory (shown in revert button) */
  inheritedLevel?: AccessLevel;
}

const LEVEL_CONFIG: Record<
  AccessLevel,
  { icon: string; className: string; label: string }
> = {
  full: {
    icon: '●',
    className: 'bg-green-100 text-green-700',
    label: '전체접근',
  },
  dept_restricted: {
    icon: '◐',
    className: 'bg-blue-100 text-blue-700',
    label: '부서제한',
  },
  summary_only: {
    icon: '○',
    className: 'bg-gray-100 text-gray-600',
    label: '요약만',
  },
  no_access: {
    icon: '—',
    className: 'bg-red-50 text-red-400',
    label: '접근불가',
  },
  column_masked: {
    icon: '🔒',
    className: 'bg-amber-100 text-amber-700',
    label: '컬럼마스킹',
  },
};

const ALL_LEVELS: AccessLevel[] = ['full', 'dept_restricted', 'summary_only', 'no_access', 'column_masked'];

export const AccessMatrixCell = React.memo(function AccessMatrixCell({
  level,
  isModified,
  onLevelSelect,
  label,
  isOverride,
  onRevertToInherited,
  inheritedLevel,
}: AccessMatrixCellProps) {
  const [open, setOpen] = useState(false);
  const config = LEVEL_CONFIG[level];

  const handleSelect = useCallback((newLevel: AccessLevel) => {
    if (newLevel !== level) {
      onLevelSelect(newLevel);
    }
    setOpen(false);
  }, [level, onLevelSelect]);

  const handleRevert = useCallback(() => {
    onRevertToInherited?.();
    setOpen(false);
  }, [onRevertToInherited]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={config.label}
          aria-label={config.label}
          aria-pressed={level !== 'no_access'}
          className={`w-10 h-8 flex items-center justify-center text-sm cursor-pointer select-none rounded transition-opacity hover:opacity-80 ${config.className}${isModified ? ' ring-2 ring-amber-400' : ''}${isOverride ? ' ring-2 ring-offset-1 ring-indigo-400' : ''}`}
        >
          <span aria-hidden="true">{config.icon}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        aria-label="접근 수준 선택"
        className="w-auto p-1 flex flex-col gap-0.5"
        align="center"
        sideOffset={4}
      >
        {label && (
          <div className="px-2.5 py-1.5 text-[10px] text-gray-500 border-b border-gray-100 mb-0.5">
            {label}
          </div>
        )}
        {ALL_LEVELS.map(l => {
          const cfg = LEVEL_CONFIG[l];
          const isActive = l === level;
          return (
            <button
              key={l}
              type="button"
              onClick={() => handleSelect(l)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-gray-100 font-semibold text-gray-900'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span aria-hidden="true" className={`w-5 text-center ${cfg.className} rounded px-0.5`}>
                {cfg.icon}
              </span>
              <span>{cfg.label}</span>
            </button>
          );
        })}
        {isOverride && onRevertToInherited && inheritedLevel && (
          <>
            <div className="border-t border-gray-100 my-0.5" />
            <button
              type="button"
              onClick={handleRevert}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded text-xs whitespace-nowrap text-gray-500 hover:bg-gray-50 w-full"
            >
              <span aria-hidden="true" className="w-5 text-center">↩</span>
              <span>상속으로 되돌리기 ({LEVEL_CONFIG[inheritedLevel].label})</span>
            </button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
});
