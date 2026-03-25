'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Maximize2, Minimize2, Copy, MessageSquare, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { TeamSkill, TeamMember } from '@/types/skill-management.types';
import { CURRENT_USER } from '../data/skillMockData';

interface SkillSlidePanelHeaderProps {
  skill: TeamSkill;
  teamMembers: TeamMember[];
  onClose: () => void;
  onCopy: () => void;
  onChatEdit: () => void;
  onToggleActivation: () => void;
  /** Returns error message string on failure, null on success */
  onRename?: (skillId: string, newName: string) => string | null;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'data-analysis': 'bg-blue-50 text-blue-700 border-blue-200',
  document: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  automation: 'bg-amber-50 text-amber-700 border-amber-200',
  communication: 'bg-violet-50 text-violet-700 border-violet-200',
};

const CATEGORY_LABELS: Record<string, string> = {
  'data-analysis': '데이터 분석',
  document: '문서 생성',
  automation: '업무 자동화',
  communication: '커뮤니케이션',
};

// ── Active Members Text Display ──────────────────────────────────────────────

function ActiveMembersText({
  activatedBy,
  teamMembers,
}: {
  activatedBy: string[];
  teamMembers: TeamMember[];
}) {
  const memberMap = new Map(teamMembers.map((m) => [m.id, m]));
  const members = activatedBy
    .map((id) => memberMap.get(id))
    .filter((m): m is TeamMember => !!m);

  if (members.length === 0) {
    return <span className="text-gray-400">—</span>;
  }

  const MAX_VISIBLE = 2;
  const visibleNames = members.slice(0, MAX_VISIBLE).map((m) => m.name);
  const overflowCount = members.length - MAX_VISIBLE;

  if (overflowCount <= 0) {
    return <span className="text-gray-600">{visibleNames.join(', ')}</span>;
  }

  return (
    <span className="text-gray-600">
      {visibleNames.join(', ')}{' '}
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">
            외 {overflowCount}명
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-2" align="start">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 px-1">
            활성 멤버 ({members.length})
          </p>
          <div className="space-y-1.5 py-1">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-2 px-1">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                  {m.name.charAt(0)}
                </div>
                <span className="text-xs text-gray-700">{m.name}</span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </span>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function SkillSlidePanelHeader({
  skill,
  teamMembers,
  onClose,
  onCopy,
  onChatEdit,
  onToggleActivation,
  onRename,
  isExpanded,
  onToggleExpand,
}: SkillSlidePanelHeaderProps) {
  const isActive = skill.isActivatedByMe;
  const isAuthor = skill.authorId === CURRENT_USER.id;

  const categoryColorClass =
    CATEGORY_COLORS[skill.category] ?? 'bg-gray-50 text-gray-600 border-gray-200';
  const categoryLabel = CATEGORY_LABELS[skill.category] ?? skill.category;

  // ── Inline name editing ──────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(skill.name);
  const [editError, setEditError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync editValue when skill changes externally
  useEffect(() => {
    setEditValue(skill.name);
    setIsEditing(false);
    setEditError(null);
  }, [skill.id, skill.name]);

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed === skill.name) {
      setIsEditing(false);
      setEditError(null);
      return;
    }
    if (onRename) {
      const error = onRename(skill.id, trimmed);
      if (error) {
        setEditError(error);
        return;
      }
    }
    setIsEditing(false);
    setEditError(null);
  }, [editValue, skill.id, skill.name, onRename]);

  const handleCancel = useCallback(() => {
    setEditValue(skill.name);
    setIsEditing(false);
    setEditError(null);
  }, [skill.name]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel],
  );

  return (
    <div className="px-5 pt-4 pb-0">
      {/* Close / expand row */}
      <div className="flex items-center justify-end gap-1 mb-3">
        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label={isExpanded ? '패널 축소' : '패널 확장'}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        )}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="패널 닫기"
        >
          <X size={16} />
        </button>
      </div>

      {/* Skill name — inline editable for author */}
      {isEditing ? (
        <div className="mb-1">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setEditError(null);
            }}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={[
              'w-full text-xl xl:text-[22px] font-bold text-gray-900 leading-tight',
              'bg-transparent border-b-2 outline-none py-0.5 transition-colors',
              editError ? 'border-red-400' : 'border-blue-400',
            ].join(' ')}
            aria-label="스킬 이름 수정"
          />
          {editError && (
            <p className="text-xs text-red-500 mt-1">{editError}</p>
          )}
        </div>
      ) : (
        <h2
          className={[
            'text-xl xl:text-[22px] font-bold text-gray-900 leading-tight mb-1 group',
            isAuthor && onRename ? 'cursor-pointer hover:text-gray-700' : '',
          ].join(' ')}
          onClick={isAuthor && onRename ? () => setIsEditing(true) : undefined}
          title={isAuthor && onRename ? '클릭하여 이름 수정' : undefined}
        >
          {skill.name}
          {isAuthor && onRename && (
            <Pencil
              size={14}
              className="inline-block ml-2 text-gray-300 group-hover:text-gray-500 transition-colors"
              aria-hidden
            />
          )}
        </h2>
      )}

      {/* Description */}
      {skill.description && (
        <p className="text-sm xl:text-[15px] text-gray-500 mb-2 leading-snug line-clamp-1">
          {skill.description}
        </p>
      )}

      {/* Category badge + status */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs xl:text-sm font-medium ${categoryColorClass}`}
        >
          {categoryLabel}
        </span>
        <span
          className={`text-xs xl:text-sm font-semibold ${
            isActive ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          {isActive ? '활성화 중' : '비활성'}
        </span>
      </div>

      {/* Meta info */}
      <div className="text-xs xl:text-sm text-gray-400 mb-3 leading-relaxed flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <span className="text-gray-600 font-medium">{skill.author}</span>
        <span>·</span>
        <span>{skill.version}</span>
        <span>·</span>
        <span>호출 {skill.callCount}회</span>
        <span>·</span>
        <span>생성 {skill.createdAt}</span>
        <span>·</span>
        <span>수정 {skill.lastModifiedAt}</span>
      </div>

      {/* Active members */}
      <p className="text-xs xl:text-sm text-gray-400 mb-2">
        활성 멤버:{' '}
        <ActiveMembersText activatedBy={skill.activatedBy} teamMembers={teamMembers} />
      </p>

      {/* Copy source (only when present) */}
      {skill.copySource && (
        <p className="text-xs xl:text-sm text-gray-400 mb-3">
          복사 출처:{' '}
          <span className="text-gray-600">
            {skill.copySource.originalAuthor}의 &lsquo;{skill.copySource.originalSkillName}&rsquo;
          </span>
        </p>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap pb-4">
        {/* 복사 — always visible */}
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
          className="gap-1.5 text-xs xl:text-sm h-8"
        >
          <Copy size={13} />
          복사
        </Button>

        {/* 채팅에서 편집 — author only */}
        {isAuthor && (
          <Button
            variant="outline"
            size="sm"
            onClick={onChatEdit}
            className="gap-1.5 text-xs xl:text-sm h-8"
          >
            <MessageSquare size={13} />
            채팅에서 편집
          </Button>
        )}
      </div>
    </div>
  );
}
