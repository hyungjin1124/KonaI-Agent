'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { TeamSkill, SkillCategory, TeamMember } from '@/types/skill-management.types';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface SkillTableRowProps {
  skill: TeamSkill;
  isSelected: boolean;
  isPanelOpen: boolean;
  teamMembers: TeamMember[];
  onClick: () => void;
  onToggle: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Category badge config
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  SkillCategory,
  { label: string; className: string }
> = {
  'data-analysis': {
    label: '데이터 분석',
    className: 'bg-blue-50 text-blue-700',
  },
  document: {
    label: '문서 생성',
    className: 'bg-emerald-50 text-emerald-700',
  },
  automation: {
    label: '업무 자동화',
    className: 'bg-amber-50 text-amber-700',
  },
  communication: {
    label: '커뮤니케이션',
    className: 'bg-violet-50 text-violet-700',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Avatar color palette (deterministic by user ID)
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'from-slate-400 to-slate-600',
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-amber-600',
  'from-violet-400 to-violet-600',
  'from-rose-400 to-rose-600',
];

function getAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: SkillCategory }) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs xl:text-sm font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

function AuthorAvatar({ name }: { name: string }) {
  const initial = name.charAt(0);
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
        {initial}
      </div>
      <span className="text-[13px] xl:text-[15px] text-gray-700 truncate">{name}</span>
    </div>
  );
}

function CallCount({ count }: { count: number }) {
  return (
    <span className="text-[13px] xl:text-[15px] font-bold text-gray-800">
      {count.toLocaleString()}
    </span>
  );
}

/** Active member avatar stack: max 2 initials + "+N" overflow with popover */
function ActiveMemberAvatars({
  activatedBy,
  teamMembers,
}: {
  activatedBy: string[];
  teamMembers: TeamMember[];
}) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, handleClickOutside]);

  if (activatedBy.length === 0) {
    return <span className="text-xs xl:text-sm text-gray-300">—</span>;
  }

  const memberMap = new Map(teamMembers.map((m) => [m.id, m]));
  const members = activatedBy
    .map((id) => memberMap.get(id))
    .filter((m): m is TeamMember => !!m);

  const visibleMembers = members.slice(0, 2);
  const overflowCount = members.length - 2;

  const allMembersList = (
    <div className="space-y-1.5 py-1">
      {members.map((m) => (
        <div key={m.id} className="flex items-center gap-2 px-1">
          <div
            className={`w-5 h-5 rounded-full bg-gradient-to-br ${getAvatarColor(m.id)} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}
          >
            {m.name.charAt(0)}
          </div>
          <span className="text-xs text-gray-700">{m.name}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex items-center -space-x-1.5" onClick={(e) => e.stopPropagation()}>
      {visibleMembers.map((m) => (
        <div
          key={m.id}
          className={`w-6 h-6 rounded-full bg-gradient-to-br ${getAvatarColor(m.id)} flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white`}
          title={m.name}
        >
          {m.name.charAt(0)}
        </div>
      ))}
      {overflowCount > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 ring-2 ring-white hover:bg-gray-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
            >
              +{overflowCount}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-2" align="start" ref={popoverRef}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 px-1">
              활성 멤버 ({members.length})
            </p>
            {allMembersList}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function SkillTableRow({
  skill,
  isSelected,
  isPanelOpen,
  teamMembers,
  onClick,
  onToggle,
}: SkillTableRowProps) {
  const handleToggleWrapperClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <TableRow
      onClick={onClick}
      data-selected={isSelected}
      className={[
        'cursor-pointer transition-all duration-150',
        'hover:bg-gray-50/80',
        isSelected
          ? 'bg-red-50/40 hover:bg-red-50/50 shadow-[inset_2px_0_0_#FF3C42]'
          : 'bg-white',
      ].join(' ')}
    >

      {/* ── 이름 column ──────────────────────────────────────────────── */}
      <TableCell className="py-3.5 pl-6 pr-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          {skill.isMarketplaceRef && (
            <span className="shrink-0 text-[11px]" title="마켓플레이스 참조">🏪</span>
          )}
          <span
            className={[
              'text-[13px] xl:text-[15px] font-semibold truncate',
              isSelected ? 'text-brand-primary' : 'text-gray-900',
            ].join(' ')}
            title={skill.name}
          >
            {skill.name}
          </span>
        </div>
      </TableCell>

      {/* ── Collapsible columns (hidden when panel is open) ────────────── */}
      {!isPanelOpen && (
        <>
          {/* 설명 */}
          <TableCell className="py-3.5 px-2 max-w-[200px]">
            <p className="text-[13px] xl:text-[15px] text-gray-600 truncate" title={skill.description}>
              {skill.description}
            </p>
          </TableCell>

          {/* 카테고리 */}
          <TableCell className="py-3.5 px-2">
            <CategoryBadge category={skill.category} />
          </TableCell>
        </>
      )}

      {/* ── 작성자 (always visible) ───────────────────────────────────── */}
      <TableCell className="py-3.5 px-2">
        <AuthorAvatar name={skill.author} />
      </TableCell>

      {!isPanelOpen && (
        <>
          {/* 수정일 — yyyy.mm.dd */}
          <TableCell className="py-3.5 px-2">
            <span className="text-xs xl:text-sm text-gray-400 font-mono">
              {skill.lastModifiedAt}
            </span>
          </TableCell>

          {/* 버전 */}
          <TableCell className="py-3.5 px-2">
            <span className="text-xs xl:text-sm font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              {skill.version}
            </span>
          </TableCell>
        </>
      )}

      {/* ── 호출 수 (always visible) ──────────────────────────────────── */}
      <TableCell className="py-3.5 px-2">
        <CallCount count={skill.callCount} />
      </TableCell>

      {/* ── 활성 멤버 (hidden when panel is open) ─────────────────────── */}
      {!isPanelOpen && (
        <TableCell className="py-3.5 px-2">
          <ActiveMemberAvatars
            activatedBy={skill.activatedBy}
            teamMembers={teamMembers}
          />
        </TableCell>
      )}

      {/* ── 활성화 toggle (always visible) ───────────────────────────── */}
      <TableCell className="py-3.5 pr-6 pl-2">
        <div onClick={handleToggleWrapperClick}>
          <Switch
            checked={skill.isActivatedByMe}
            onCheckedChange={() => onToggle()}
            className="data-[state=checked]:bg-brand-primary"
            aria-label={`${skill.name} 활성화 ${skill.isActivatedByMe ? '끄기' : '켜기'}`}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

export default SkillTableRow;
