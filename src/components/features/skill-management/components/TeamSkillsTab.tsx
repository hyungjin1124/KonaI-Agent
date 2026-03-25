'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { TeamSkill, SkillCategory } from '@/types/skill-management.types';
import { SKILL_CATEGORIES } from '@/types/skill-management.types';
import { mockTeamSkills, CURRENT_USER, TEAM_MEMBERS } from '../data/skillMockData';
import { SkillFilters } from './SkillFilters';
import { SkillTable } from './SkillTable';
import { SkillSlidePanel } from './SkillSlidePanel';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ToastState {
  msg: string;
  type: 'success' | 'error' | 'info';
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TeamSkillsTab() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [skills, setSkills] = useState<TeamSkill[]>(mockTeamSkills);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | 'all'>('all');
  const [authorFilter, setAuthorFilter] = useState<string>('all');
  const [activeMemberFilter, setActiveMemberFilter] = useState<string>('all');
  const [toast, setToast] = useState<ToastState | null>(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedSkill = useMemo(
    () => skills.find((s) => s.id === selectedSkillId) ?? null,
    [skills, selectedSkillId],
  );

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const categoryLabel =
          SKILL_CATEGORIES.find((c) => c.id === skill.category)?.label ?? '';
        const matchesSearch =
          skill.name.toLowerCase().includes(q) ||
          skill.description.toLowerCase().includes(q) ||
          skill.author.toLowerCase().includes(q) ||
          categoryLabel.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (categoryFilter !== 'all' && skill.category !== categoryFilter) return false;
      if (authorFilter !== 'all' && skill.authorId !== authorFilter) return false;
      if (activeMemberFilter !== 'all' && !skill.activatedBy.includes(activeMemberFilter)) return false;
      return true;
    });
  }, [skills, searchQuery, categoryFilter, authorFilter, activeMemberFilter]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, type: ToastState['type'] = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  React.useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleRowClick = useCallback((skillId: string) => {
    setSelectedSkillId(skillId);
    setIsPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setIsExpanded(false);
    setSelectedSkillId(null);
  }, []);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleToggleActivation = useCallback(
    (skillId: string) => {
      setSkills((prev) =>
        prev.map((s) => {
          if (s.id !== skillId) return s;
          const next = !s.isActivatedByMe;
          const skillName = s.name;
          setTimeout(() => {
            showToast(
              `"${skillName}" ${next ? '활성화' : '비활성화'}되었습니다`,
              'success',
            );
          }, 0);
          // Update activatedBy list
          const updatedActivatedBy = next
            ? [...s.activatedBy, CURRENT_USER.id]
            : s.activatedBy.filter((id) => id !== CURRENT_USER.id);
          return { ...s, isActivatedByMe: next, activatedBy: updatedActivatedBy };
        }),
      );
    },
    [showToast],
  );

  /** 자동 넘버링: "{이름} (2)", "(3)"... 동일 작성자 기준 */
  const generateCopyName = useCallback(
    (baseName: string) => {
      // 기존 "(N)" 접미사 제거하여 원본 이름 추출
      const stripped = baseName.replace(/\s*\(\d+\)$/, '');
      const mySkillNames = new Set(
        skills.filter((s) => s.authorId === CURRENT_USER.id).map((s) => s.name),
      );
      for (let n = 2; ; n++) {
        const candidate = `${stripped} (${n})`;
        if (!mySkillNames.has(candidate)) return candidate;
      }
    },
    [skills],
  );

  const handleCopy = useCallback(
    (skillId: string) => {
      const source = skills.find((s) => s.id === skillId);
      if (!source) return;

      const copyName = generateCopyName(source.name);
      const now = new Date();
      const today = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

      const newSkill: TeamSkill = {
        ...source,
        id: `skill-copy-${Date.now()}`,
        name: copyName,
        author: CURRENT_USER.name,
        authorId: CURRENT_USER.id,
        createdAt: today,
        lastModifiedAt: today,
        version: 'v1',
        callCount: 0,
        activatedBy: [CURRENT_USER.id],
        isActivatedByMe: true,
        creationSource: 'copied',
        copySource: {
          originalSkillId: source.id,
          originalSkillName: source.name,
          originalAuthor: source.author,
        },
        versionHistory: [
          {
            version: 'v1',
            modifiedAt: today,
            modifiedBy: CURRENT_USER.name,
            changeEntries: [{ tag: '추가', subject: `${source.author}의 '${source.name}' ${source.version}에서 복사` }],
          },
        ],
      };

      setSkills((prev) => [newSkill, ...prev]);
      setSelectedSkillId(newSkill.id);
      showToast(`'${copyName}' 스킬이 생성되었습니다`, 'success');
    },
    [skills, showToast, generateCopyName],
  );

  /** 이름 수정: 중복 검증 포함 */
  const handleRename = useCallback(
    (skillId: string, newName: string): string | null => {
      const trimmed = newName.trim();
      if (!trimmed) return '이름을 입력해주세요';

      const target = skills.find((s) => s.id === skillId);
      if (!target) return '스킬을 찾을 수 없습니다';

      // 동일 작성자의 다른 스킬과 이름 중복 검사
      const isDuplicate = skills.some(
        (s) => s.id !== skillId && s.authorId === target.authorId && s.name === trimmed,
      );
      if (isDuplicate) return '같은 이름의 스킬이 이미 존재합니다';

      setSkills((prev) =>
        prev.map((s) => (s.id === skillId ? { ...s, name: trimmed } : s)),
      );
      return null; // 성공
    },
    [skills],
  );

  const handleChatEdit = useCallback(() => {
    showToast('채팅 편집 기능은 준비 중입니다', 'info');
  }, [showToast]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      data-testid="team-skills-tab"
      className="relative flex flex-1 h-full min-h-0 overflow-hidden"
    >
      {/* ── Table Area ── */}
      <div
        className={[
          'flex flex-col min-h-0 overflow-hidden transition-all duration-300 ease-in-out',
          isPanelOpen
            ? isExpanded ? 'w-0 opacity-0 overflow-hidden' : 'w-[55%]'
            : 'w-full',
        ].join(' ')}
      >
        {/* Filter bar */}
        <div className="shrink-0 border-b border-gray-200 bg-white px-8 py-3">
          <SkillFilters
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            authorFilter={authorFilter}
            activeMemberFilter={activeMemberFilter}
            teamMembers={TEAM_MEMBERS}
            onSearchChange={setSearchQuery}
            onCategoryChange={setCategoryFilter}
            onAuthorChange={setAuthorFilter}
            onActiveMemberChange={setActiveMemberFilter}
          />
        </div>

        {/* Skill table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <SkillTable
              skills={filteredSkills}
              selectedId={selectedSkillId}
              isPanelOpen={isPanelOpen}
              teamMembers={TEAM_MEMBERS}
              onRowClick={handleRowClick}
              onToggleActivation={handleToggleActivation}
            />

            {filteredSkills.length === 0 && skills.length > 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-sm text-gray-500">조건에 맞는 스킬이 없습니다.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setAuthorFilter('all');
                    setActiveMemberFilter('all');
                  }}
                  className="mt-3 text-xs text-gray-400 underline hover:text-gray-600"
                >
                  필터 초기화
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Slide Panel Area ── */}
      <div
        className={[
          'shrink-0 border-l border-gray-200 bg-white overflow-hidden transition-all duration-300 ease-in-out',
          isPanelOpen
            ? isExpanded ? 'w-full opacity-100' : 'w-[45%] opacity-100'
            : 'w-0 opacity-0 pointer-events-none',
        ].join(' ')}
      >
        {isPanelOpen && selectedSkill && (
          <SkillSlidePanel
            key={selectedSkillId ?? undefined}
            skill={selectedSkill}
            teamMembers={TEAM_MEMBERS}
            onClose={handleClosePanel}
            onCopy={() => handleCopy(selectedSkill.id)}
            onChatEdit={handleChatEdit}
            onToggleActivation={() => handleToggleActivation(selectedSkill.id)}
            onRename={handleRename}
            isExpanded={isExpanded}
            onToggleExpand={handleToggleExpand}
          />
        )}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          role="alert"
          className={[
            'fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 text-white text-sm rounded-lg shadow-lg animate-fade-in-up',
            toast.type === 'success'
              ? 'bg-green-600'
              : toast.type === 'error'
              ? 'bg-red-600'
              : 'bg-gray-700',
          ].join(' ')}
        >
          <span>{toast.msg}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-1 text-white/70 hover:text-white"
            aria-label="알림 닫기"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
