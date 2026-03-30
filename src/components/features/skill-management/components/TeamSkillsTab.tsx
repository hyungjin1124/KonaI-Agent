'use client';

import React, { useState, useMemo, useCallback } from 'react';
import type { TeamSkill, SkillCategory, SkillSourceFilter } from '@/types/skill-management.types';
import { SKILL_CATEGORIES } from '@/types/skill-management.types';
import { CURRENT_USER, TEAM_MEMBERS } from '../data/skillMockData';
import { SkillFilters } from './SkillFilters';
import { SkillTable } from './SkillTable';
import { SkillSlidePanel } from './SkillSlidePanel';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TeamSkillsTabProps {
  skills: TeamSkill[];
  onSkillsChange: React.Dispatch<React.SetStateAction<TeamSkill[]>>;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TeamSkillsTab({ skills, onSkillsChange, showToast }: TeamSkillsTabProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | 'all'>('all');
  const [authorFilter, setAuthorFilter] = useState<string>('all');
  const [activeMemberFilter, setActiveMemberFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<SkillSourceFilter>('all');

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
      // 출처 필터 (v11)
      if (sourceFilter === 'team' && skill.isMarketplaceRef) return false;
      if (sourceFilter === 'marketplace' && !skill.isMarketplaceRef) return false;
      return true;
    });
  }, [skills, searchQuery, categoryFilter, authorFilter, activeMemberFilter, sourceFilter]);

  // ── Handlers ───────────────────────────────────────────────────────────────

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
      onSkillsChange((prev) =>
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
          const updatedActivatedBy = next
            ? [...s.activatedBy, CURRENT_USER.id]
            : s.activatedBy.filter((id) => id !== CURRENT_USER.id);
          return { ...s, isActivatedByMe: next, activatedBy: updatedActivatedBy };
        }),
      );
    },
    [onSkillsChange, showToast],
  );

  /** 자동 넘버링: "{이름} (2)", "(3)"... 동일 작성자 기준 */
  const generateCopyName = useCallback(
    (baseName: string) => {
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

  /** 복사: fromVersion이 있으면 특정 버전 기반 복사 (v11) */
  const handleCopy = useCallback(
    (skillId: string, fromVersion?: string) => {
      const source = skills.find((s) => s.id === skillId);
      if (!source) return;

      const copyName = generateCopyName(source.name);
      const now = new Date();
      const today = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
      const targetVersion = fromVersion ?? source.version;

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
        // 마켓플레이스 필드 초기화 (복사본은 독립 팀 스킬)
        isMarketplaceRef: undefined,
        marketplaceRefId: undefined,
        isPublishedToMarketplace: false,
        authorTeam: undefined,
        copySource: {
          originalSkillId: source.id,
          originalSkillName: source.name,
          originalAuthor: source.author,
          baseVersion: fromVersion,
        },
        versionHistory: [
          {
            version: 'v1',
            modifiedAt: today,
            modifiedBy: CURRENT_USER.name,
            changeEntries: [{ tag: '추가', subject: `${source.author}의 '${source.name}' ${targetVersion}에서 복사` }],
          },
        ],
      };

      onSkillsChange((prev) => [newSkill, ...prev]);
      setSelectedSkillId(newSkill.id);
      showToast(`'${copyName}' 스킬이 생성되었습니다`, 'success');
    },
    [skills, onSkillsChange, showToast, generateCopyName],
  );

  /** 이름 수정: 중복 검증 포함 */
  const handleRename = useCallback(
    (skillId: string, newName: string): string | null => {
      const trimmed = newName.trim();
      if (!trimmed) return '이름을 입력해주세요';

      const target = skills.find((s) => s.id === skillId);
      if (!target) return '스킬을 찾을 수 없습니다';

      const isDuplicate = skills.some(
        (s) => s.id !== skillId && s.authorId === target.authorId && s.name === trimmed,
      );
      if (isDuplicate) return '같은 이름의 스킬이 이미 존재합니다';

      onSkillsChange((prev) =>
        prev.map((s) => (s.id === skillId ? { ...s, name: trimmed } : s)),
      );
      return null;
    },
    [skills, onSkillsChange],
  );

  const handleChatEdit = useCallback(() => {
    showToast('채팅 편집 기능은 준비 중입니다', 'info');
  }, [showToast]);

  /** 전사 공개 토글 (v10) */
  const handleTogglePublish = useCallback(
    (skillId: string) => {
      onSkillsChange((prev) =>
        prev.map((s) => {
          if (s.id !== skillId) return s;
          const next = !s.isPublishedToMarketplace;
          setTimeout(() => {
            showToast(
              `"${s.name}" ${next ? '전사 공개' : '비공개'}로 전환되었습니다`,
              'success',
            );
          }, 0);
          return { ...s, isPublishedToMarketplace: next };
        }),
      );
    },
    [onSkillsChange, showToast],
  );

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
            sourceFilter={sourceFilter}
            onSourceChange={setSourceFilter}
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
                    setSourceFilter('all');
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
            onCopyVersion={(version) => handleCopy(selectedSkill.id, version)}
            onTogglePublish={() => handleTogglePublish(selectedSkill.id)}
          />
        )}
      </div>
    </div>
  );
}
