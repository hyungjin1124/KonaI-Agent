'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SkillCategory, SkillSourceFilter, TeamMember } from '@/types/skill-management.types';
import { SKILL_CATEGORIES } from '@/types/skill-management.types';

interface SkillFiltersProps {
  searchQuery: string;
  categoryFilter: SkillCategory | 'all';
  authorFilter: string;
  activeMemberFilter: string;
  teamMembers: TeamMember[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: SkillCategory | 'all') => void;
  onAuthorChange: (value: string) => void;
  onActiveMemberChange: (value: string) => void;
  /** 출처 필터 (v11) */
  sourceFilter?: SkillSourceFilter;
  onSourceChange?: (value: SkillSourceFilter) => void;
}

export function SkillFilters({
  searchQuery,
  categoryFilter,
  authorFilter,
  activeMemberFilter,
  teamMembers,
  onSearchChange,
  onCategoryChange,
  onAuthorChange,
  onActiveMemberChange,
  sourceFilter,
  onSourceChange,
}: SkillFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="스킬 검색..."
          className="pl-8 h-8 text-sm bg-gray-50 border-gray-200 focus:bg-white"
        />
      </div>

      {/* Category filter */}
      <Select value={categoryFilter} onValueChange={(v) => onCategoryChange(v as SkillCategory | 'all')}>
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

      {/* Author filter */}
      <Select value={authorFilter} onValueChange={onAuthorChange}>
        <SelectTrigger className="h-8 w-auto min-w-[90px] text-xs border-gray-200">
          <SelectValue placeholder="작성자" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">전체 작성자</SelectItem>
          {teamMembers.map((m) => (
            <SelectItem key={m.id} value={m.id} className="text-xs">
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Active member filter */}
      <Select value={activeMemberFilter} onValueChange={onActiveMemberChange}>
        <SelectTrigger className="h-8 w-auto min-w-[100px] text-xs border-gray-200">
          <SelectValue placeholder="활성 멤버" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">전체 멤버</SelectItem>
          {teamMembers.map((m) => (
            <SelectItem key={m.id} value={m.id} className="text-xs">
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 출처 필터 (v11) */}
      {sourceFilter !== undefined && onSourceChange && (
        <Select value={sourceFilter} onValueChange={(v) => onSourceChange(v as SkillSourceFilter)}>
          <SelectTrigger className="h-8 w-auto min-w-[100px] text-xs border-gray-200">
            <SelectValue placeholder="출처" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">전체 출처</SelectItem>
            <SelectItem value="team" className="text-xs">팀 내 생성</SelectItem>
            <SelectItem value="marketplace" className="text-xs">마켓플레이스 참조</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
