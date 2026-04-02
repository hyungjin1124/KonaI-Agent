'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GroupSlidePanel } from './GroupSlidePanel';
import { ERP_GROUPS } from '../data/groupMockData';
import type { ERPGroup } from '../types/admin.types';

type SortField = 'name' | 'memberCount';
type SortDir = 'asc' | 'desc';

interface GroupManagementTabProps {
  initialGroupId?: string | null;
  onNavigateToUser: (userId: string) => void;
}

export function GroupManagementTab({ initialGroupId, onNavigateToUser }: GroupManagementTabProps) {
  const [groups] = useState<ERPGroup[]>(ERP_GROUPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(initialGroupId ?? null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const isPanelOpen = selectedGroupId !== null;

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );

  // Auto-select from URL param
  useEffect(() => {
    if (initialGroupId && initialGroupId !== selectedGroupId) {
      setSelectedGroupId(initialGroupId);
    }
  }, [initialGroupId]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredGroups = useMemo(() => {
    let result = groups;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((g) => g.name.toLowerCase().includes(q));
    }
    return result;
  }, [groups, searchQuery]);

  const sortedGroups = useMemo(() => {
    const sorted = [...filteredGroups];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'memberCount') cmp = a.memberCount - b.memberCount;
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return sorted;
  }, [filteredGroups, sortField, sortDir]);

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }, [sortField]);

  const handleRowClick = useCallback((groupId: string) => {
    setSelectedGroupId(groupId);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedGroupId(null);
  }, []);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    return sortDir === 'asc'
      ? <ArrowUp className="h-3 w-3 text-gray-700" />
      : <ArrowDown className="h-3 w-3 text-gray-700" />;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 space-y-3 mb-4">
        <div>
          <p className="text-sm text-gray-500 mt-0.5">
            등록된 그룹 {groups.length}개
            {searchQuery && <span className="text-gray-400"> · 검색 결과 {filteredGroups.length}개</span>}
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-[280px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="그룹 이름 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Table + Panel */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* Table area */}
        <div
          className={[
            'flex flex-col min-h-0 overflow-hidden transition-all duration-300 ease-in-out',
            isPanelOpen ? 'w-[55%]' : 'w-full',
          ].join(' ')}
        >
          <div className="flex-1 overflow-y-auto">
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                    <TableHead className="w-[200px]">
                      <button
                        onClick={() => toggleSort('name')}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
                      >
                        그룹명 <SortIcon field="name" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[80px] text-xs font-medium text-gray-500">유형</TableHead>
                    <TableHead className="w-[80px]">
                      <button
                        onClick={() => toggleSort('memberCount')}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
                      >
                        인원 <SortIcon field="memberCount" />
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedGroups.map((group) => (
                    <TableRow
                      key={group.id}
                      className={[
                        'cursor-pointer transition-colors',
                        selectedGroupId === group.id
                          ? 'bg-red-50/60 border-l-2 border-l-[#FF3C42]'
                          : 'hover:bg-gray-50/60',
                      ].join(' ')}
                      onClick={() => handleRowClick(group.id)}
                    >
                      <TableCell className="py-2 text-sm text-gray-900 font-medium">
                        {group.name}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {group.groupType}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-gray-600 tabular-nums">
                        {group.memberCount}명
                      </TableCell>
                    </TableRow>
                  ))}
                  {sortedGroups.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-sm text-gray-400">
                        {searchQuery ? '검색 결과가 없습니다.' : '등록된 그룹이 없습니다.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Slide panel area */}
        <div
          className={[
            'shrink-0 border-l border-gray-200 bg-white overflow-hidden transition-all duration-300 ease-in-out',
            isPanelOpen
              ? 'w-[45%] opacity-100'
              : 'w-0 opacity-0 pointer-events-none',
          ].join(' ')}
        >
          {isPanelOpen && selectedGroup && (
            <GroupSlidePanel
              key={selectedGroupId}
              group={selectedGroup}
              onClose={handleClosePanel}
              onNavigateToUser={onNavigateToUser}
            />
          )}
        </div>
      </div>
    </div>
  );
}
