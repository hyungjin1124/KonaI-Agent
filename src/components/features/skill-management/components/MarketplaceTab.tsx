'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Flame } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import type { MarketplaceSkill, TeamSkill, SkillCategory } from '@/types/skill-management.types';
import { SKILL_CATEGORIES } from '@/types/skill-management.types';
import { mockMarketplaceSkills, MARKETPLACE_TEAMS } from '../data/marketplaceMockData';
import { SkillSlidePanel } from './SkillSlidePanel';

// ── Types ─────────────────────────────────────────────────────────────────────

interface MarketplaceTabProps {
  teamSkills: TeamSkill[];
  onAddReference: (skill: MarketplaceSkill) => void;
  onCopyFromMarketplace: (skill: MarketplaceSkill) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

// ── Category badge ────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<SkillCategory, { label: string; className: string }> = {
  'data-analysis': { label: '데이터 분석', className: 'bg-blue-50 text-blue-700' },
  document: { label: '문서 생성', className: 'bg-emerald-50 text-emerald-700' },
  automation: { label: '업무 자동화', className: 'bg-amber-50 text-amber-700' },
  communication: { label: '커뮤니케이션', className: 'bg-violet-50 text-violet-700' },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function MarketplaceTab({
  teamSkills,
  onAddReference,
  onCopyFromMarketplace,
  showToast,
}: MarketplaceTabProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | 'all'>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedSkill = useMemo(
    () => mockMarketplaceSkills.find((s) => s.id === selectedSkillId) ?? null,
    [selectedSkillId],
  );

  const filteredSkills = useMemo(() => {
    return mockMarketplaceSkills
      .filter((skill) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesSearch =
            skill.name.toLowerCase().includes(q) ||
            skill.description.toLowerCase().includes(q) ||
            skill.author.toLowerCase().includes(q) ||
            skill.authorTeam.toLowerCase().includes(q);
          if (!matchesSearch) return false;
        }
        if (categoryFilter !== 'all' && skill.category !== categoryFilter) return false;
        if (teamFilter !== 'all' && skill.authorTeam !== teamFilter) return false;
        return true;
      })
      .sort((a, b) => b.orgCallCount - a.orgCallCount); // 인기순 정렬
  }, [searchQuery, categoryFilter, teamFilter]);

  const isAlreadyActivated = useCallback(
    (marketplaceSkillId: string) =>
      teamSkills.some((s) => s.marketplaceRefId === marketplaceSkillId),
    [teamSkills],
  );

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

  const handleActivate = useCallback(() => {
    if (!selectedSkill) return;
    if (isAlreadyActivated(selectedSkill.id)) {
      showToast('이미 팀에 활성화된 스킬입니다', 'info');
      return;
    }
    onAddReference(selectedSkill);
  }, [selectedSkill, isAlreadyActivated, onAddReference, showToast]);

  const handleCopy = useCallback(() => {
    if (!selectedSkill) return;
    onCopyFromMarketplace(selectedSkill);
  }, [selectedSkill, onCopyFromMarketplace]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      data-testid="marketplace-tab"
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
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="스킬 검색..."
                className="pl-8 h-8 text-sm bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>

            {/* Category filter */}
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as SkillCategory | 'all')}>
              <SelectTrigger className="h-8 w-auto min-w-[100px] text-xs border-gray-200">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                {SKILL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-xs">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Team filter */}
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="h-8 w-auto min-w-[90px] text-xs border-gray-200">
                <SelectValue placeholder="소속 팀" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">전체 팀</SelectItem>
                {MARKETPLACE_TEAMS.map((team) => (
                  <SelectItem key={team} value={team} className="text-xs">
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-gray-200">
                  <TableHead className="text-xs xl:text-sm font-semibold text-gray-400 uppercase tracking-wide h-10 pl-6 px-2">이름</TableHead>
                  {!isPanelOpen && (
                    <>
                      <TableHead className="text-xs xl:text-sm font-semibold text-gray-400 uppercase tracking-wide h-10 px-2">설명</TableHead>
                      <TableHead className="text-xs xl:text-sm font-semibold text-gray-400 uppercase tracking-wide h-10 px-2">카테고리</TableHead>
                    </>
                  )}
                  <TableHead className="text-xs xl:text-sm font-semibold text-gray-400 uppercase tracking-wide h-10 px-2">작성자 · 팀</TableHead>
                  {!isPanelOpen && (
                    <TableHead className="text-xs xl:text-sm font-semibold text-gray-400 uppercase tracking-wide h-10 px-2">활성 팀</TableHead>
                  )}
                  <TableHead className="text-xs xl:text-sm font-semibold text-gray-400 uppercase tracking-wide h-10 px-2">전사 호출</TableHead>
                  <TableHead className="text-xs xl:text-sm font-semibold text-gray-400 uppercase tracking-wide h-10 pr-6 px-2">상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSkills.map((skill) => {
                  const activated = isAlreadyActivated(skill.id);
                  const isSelected = selectedSkillId === skill.id;
                  return (
                    <TableRow
                      key={skill.id}
                      onClick={() => handleRowClick(skill.id)}
                      className={[
                        'cursor-pointer transition-all duration-150 hover:bg-gray-50/80',
                        isSelected
                          ? 'bg-red-50/40 hover:bg-red-50/50 shadow-[inset_2px_0_0_#FF3C42]'
                          : 'bg-white',
                      ].join(' ')}
                    >
                      {/* 이름 */}
                      <TableCell className="py-3.5 pl-6 pr-2 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          {skill.isPopular && (
                            <Flame size={14} className="shrink-0 text-orange-500" />
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

                      {/* 설명 & 카테고리 (collapsed when panel open) */}
                      {!isPanelOpen && (
                        <>
                          <TableCell className="py-3.5 px-2 max-w-[200px]">
                            <p className="text-[13px] xl:text-[15px] text-gray-600 truncate" title={skill.description}>
                              {skill.description}
                            </p>
                          </TableCell>
                          <TableCell className="py-3.5 px-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs xl:text-sm font-medium ${CATEGORY_CONFIG[skill.category].className}`}>
                              {CATEGORY_CONFIG[skill.category].label}
                            </span>
                          </TableCell>
                        </>
                      )}

                      {/* 작성자 · 팀 */}
                      <TableCell className="py-3.5 px-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {skill.author.charAt(0)}
                          </div>
                          <span className="text-[13px] xl:text-[15px] text-gray-700 truncate">
                            {skill.author}
                          </span>
                          <span className="text-[11px] xl:text-xs text-gray-400">
                            · {skill.authorTeam}
                          </span>
                        </div>
                      </TableCell>

                      {/* 활성 팀 (collapsed when panel open) */}
                      {!isPanelOpen && (
                        <TableCell className="py-3.5 px-2">
                          <span className="text-[13px] xl:text-[15px] text-gray-600">
                            {skill.activeTeamCount}개 팀
                          </span>
                        </TableCell>
                      )}

                      {/* 전사 호출 수 */}
                      <TableCell className="py-3.5 px-2">
                        <span className="text-[13px] xl:text-[15px] font-bold text-gray-800">
                          {skill.orgCallCount.toLocaleString()}
                        </span>
                      </TableCell>

                      {/* 상태 */}
                      <TableCell className="py-3.5 pr-6 pl-2">
                        {activated ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] xl:text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                            활성화됨
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] xl:text-xs font-medium text-gray-400 border border-gray-200">
                            미활성
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredSkills.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-sm text-gray-500">조건에 맞는 스킬이 없습니다.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setTeamFilter('all');
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
            teamMembers={[]}
            onClose={handleClosePanel}
            onCopy={handleCopy}
            onChatEdit={() => {}}
            onToggleActivation={() => {}}
            isExpanded={isExpanded}
            onToggleExpand={handleToggleExpand}
            panelMode="marketplace"
            onActivate={handleActivate}
            isAlreadyActivated={isAlreadyActivated(selectedSkill.id)}
          />
        )}
      </div>
    </div>
  );
}
