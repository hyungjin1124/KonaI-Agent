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
import { Button } from '@/components/ui/button';
import { DOMAIN_LIST, SOURCE_TYPE_LIST } from '../data/viewTableMockData';
import type { ViewTableDomain, SourceType } from '../types/data.types';

interface ViewTableFiltersProps {
  searchQuery: string;
  domainFilter: ViewTableDomain | 'all';
  sourceTypeFilter: SourceType | 'all';
  onSearchChange: (value: string) => void;
  onDomainChange: (value: ViewTableDomain | 'all') => void;
  onSourceTypeChange: (value: SourceType | 'all') => void;
}

export function ViewTableFilters({
  searchQuery,
  domainFilter,
  sourceTypeFilter,
  onSearchChange,
  onDomainChange,
  onSourceTypeChange,
}: ViewTableFiltersProps) {
  const hasActiveFilter = searchQuery.trim() !== '' || domainFilter !== 'all' || sourceTypeFilter !== 'all';

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <div className="relative flex-1 max-w-[280px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="뷰테이블 이름 또는 설명 검색"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      <Select
        value={domainFilter}
        onValueChange={(v) => onDomainChange(v as ViewTableDomain | 'all')}
      >
        <SelectTrigger className="h-8 w-[120px] text-xs">
          <SelectValue placeholder="도메인" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 도메인</SelectItem>
          {DOMAIN_LIST.map((domain) => (
            <SelectItem key={domain} value={domain}>
              {domain}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sourceTypeFilter}
        onValueChange={(v) => onSourceTypeChange(v as SourceType | 'all')}
      >
        <SelectTrigger className="h-8 w-[120px] text-xs">
          <SelectValue placeholder="소스 유형" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 소스</SelectItem>
          {SOURCE_TYPE_LIST.map((st) => (
            <SelectItem key={st} value={st}>
              {st}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilter && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-gray-500 hover:text-gray-700 h-8 px-2"
          onClick={() => {
            onSearchChange('');
            onDomainChange('all');
            onSourceTypeChange('all');
          }}
        >
          초기화
        </Button>
      )}
    </div>
  );
}
