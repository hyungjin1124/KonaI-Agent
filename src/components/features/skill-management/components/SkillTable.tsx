'use client';

import React, { useMemo } from 'react';
import { Layers } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { SkillTableRow } from './SkillTableRow';
import type { TeamSkill, TeamMember } from '@/types/skill-management.types';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface SkillTableProps {
  skills: TeamSkill[];
  selectedId: string | null;
  isPanelOpen: boolean;
  teamMembers: TeamMember[];
  onRowClick: (skillId: string) => void;
  onToggleActivation: (skillId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Column definitions
// ─────────────────────────────────────────────────────────────────────────────

interface ColumnDef {
  key: string;
  label: string;
  /** When true, column is hidden while panel is open */
  collapsible: boolean;
  className?: string;
}

const COLUMNS: ColumnDef[] = [
  { key: 'name',           label: '이름',     collapsible: false, className: 'pl-6' },
  { key: 'description',    label: '설명',     collapsible: true  },
  { key: 'category',       label: '카테고리',  collapsible: true  },
  { key: 'author',         label: '작성자',    collapsible: false },
  { key: 'modifiedAt',     label: '수정일',    collapsible: true  },
  { key: 'version',        label: '버전',     collapsible: true  },
  { key: 'callCount',      label: '호출 수',   collapsible: false },
  { key: 'activeMembers',  label: '활성 멤버', collapsible: true  },
  { key: 'activation',     label: '활성화',    collapsible: false, className: 'pr-6' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Group header row
// ─────────────────────────────────────────────────────────────────────────────

interface GroupHeaderRowProps {
  label: string;
  count: number;
  isActivated: boolean;
  colSpan: number;
}

function GroupHeaderRow({
  label,
  count,
  isActivated,
  colSpan,
}: GroupHeaderRowProps) {
  return (
    <TableRow
      className={[
        'border-b border-t select-none hover:bg-transparent',
        isActivated
          ? 'bg-green-50/60 border-green-100'
          : 'bg-gray-50/70 border-gray-100',
      ].join(' ')}
    >
      <TableCell colSpan={colSpan} className="py-2.5 pl-6 pr-6">
        <div className="flex items-center gap-2">
          {/* Status dot */}
          <span
            className={[
              'inline-block w-2 h-2 rounded-full',
              isActivated ? 'bg-green-500' : 'bg-gray-400',
            ].join(' ')}
            aria-hidden
          />
          <span
            className={[
              'text-xs xl:text-sm font-semibold tracking-wide uppercase',
              isActivated ? 'text-green-700' : 'text-gray-500',
            ].join(' ')}
          >
            {label}
          </span>
          <span
            className={[
              'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold',
              isActivated
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-200 text-gray-500',
            ].join(' ')}
          >
            {count}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Layers size={24} className="text-gray-400" />
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">
        아직 팀에 등록된 스킬이 없습니다
      </p>
      <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
        채팅에서 스킬을 만들어보세요
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function SkillTable({
  skills,
  selectedId,
  isPanelOpen,
  teamMembers,
  onRowClick,
  onToggleActivation,
}: SkillTableProps) {
  // ── Split and sort groups ──────────────────────────────────────────────────
  const { activatedSkills, deactivatedSkills } = useMemo(() => {
    const activated = skills
      .filter((s) => s.isActivatedByMe)
      .sort((a, b) => b.callCount - a.callCount);

    const deactivated = skills
      .filter((s) => !s.isActivatedByMe)
      .sort(
        (a, b) =>
          b.lastModifiedAt.localeCompare(a.lastModifiedAt)
      );

    return { activatedSkills: activated, deactivatedSkills: deactivated };
  }, [skills]);

  // ── Column span: full vs panel-open ──────────────────────────────────────
  const visibleColumns = useMemo(
    () =>
      isPanelOpen
        ? COLUMNS.filter((c) => !c.collapsible)
        : COLUMNS,
    [isPanelOpen]
  );

  const colSpan = visibleColumns.length;

  // ── Empty state ───────────────────────────────────────────────────────────
  if (skills.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="w-full">
      <Table>
        {/* ── Header ──────────────────────────────────────────────────── */}
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-gray-200">
            {visibleColumns.map((col) => (
              <TableHead
                key={col.key}
                className={[
                  'text-xs xl:text-sm font-semibold text-gray-400 uppercase tracking-wide h-10',
                  col.className ?? 'px-2',
                ].join(' ')}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {/* ── Activated group ─────────────────────────────────────── */}
          {activatedSkills.length > 0 && (
            <>
              <GroupHeaderRow
                label="활성화"
                count={activatedSkills.length}
                isActivated
                colSpan={colSpan}
              />
              {activatedSkills.map((skill) => (
                <SkillTableRow
                  key={skill.id}
                  skill={skill}
                  isSelected={selectedId === skill.id}
                  isPanelOpen={isPanelOpen}
                  teamMembers={teamMembers}
                  onClick={() => onRowClick(skill.id)}
                  onToggle={() => onToggleActivation(skill.id)}
                />
              ))}
            </>
          )}

          {/* ── Deactivated group ───────────────────────────────────── */}
          {deactivatedSkills.length > 0 && (
            <>
              <GroupHeaderRow
                label="비활성"
                count={deactivatedSkills.length}
                isActivated={false}
                colSpan={colSpan}
              />
              {deactivatedSkills.map((skill) => (
                <SkillTableRow
                  key={skill.id}
                  skill={skill}
                  isSelected={selectedId === skill.id}
                  isPanelOpen={isPanelOpen}
                  teamMembers={teamMembers}
                  onClick={() => onRowClick(skill.id)}
                  onToggle={() => onToggleActivation(skill.id)}
                />
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default SkillTable;
