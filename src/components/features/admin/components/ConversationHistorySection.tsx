'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConversationSlidePanel } from './ConversationSlidePanel';
import { CONVERSATION_RECORDS, CONVERSATION_USERS } from '../data/conversationHistoryData';
import type { ConversationRecord } from '../types/admin.types';

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

type DateFilter = '전체' | '오늘' | '최근 7일' | '최근 30일';
type StatusFilter = '전체' | '완료' | '오류';

// ── Component ─────────────────────────────────────────────────────────────────

export function ConversationHistorySection() {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('전체');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('전체');

  // Pagination
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Panel
  const [selectedRecord, setSelectedRecord] = useState<ConversationRecord | null>(null);

  const isPanelOpen = selectedRecord !== null;

  // Filter logic
  const filtered = useMemo(() => {
    let result = CONVERSATION_RECORDS;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.summary.toLowerCase().includes(q) ||
          r.userName.toLowerCase().includes(q),
      );
    }

    if (userFilter !== 'all') {
      result = result.filter((r) => r.userName === userFilter);
    }

    if (dateFilter !== '전체') {
      const now = new Date(2026, 2, 26); // Mock current date
      let cutoff: Date;
      switch (dateFilter) {
        case '오늘':
          cutoff = new Date(2026, 2, 26);
          break;
        case '최근 7일':
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '최근 30일':
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoff = new Date(0);
      }
      result = result.filter((r) => {
        const d = new Date(r.date.replace(/\./g, '-'));
        return d >= cutoff;
      });
    }

    if (statusFilter !== '전체') {
      result = result.filter((r) => r.status === statusFilter);
    }

    return result;
  }, [searchQuery, userFilter, dateFilter, statusFilter]);

  const visibleRecords = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );

  const canShowMore = visibleCount < filtered.length;

  const handleShowMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
  }, [filtered.length]);

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-bold text-gray-900">대화 이력 조회</h3>

      {/* Filter bar */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="relative flex-1 max-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="대화 요약 또는 사용자 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="h-8 w-[100px] text-xs">
            <SelectValue placeholder="사용자" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 사용자</SelectItem>
            {CONVERSATION_USERS.map((u) => (
              <SelectItem key={u} value={u}>{u}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
          <SelectTrigger className="h-8 w-[100px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="전체">전체 기간</SelectItem>
            <SelectItem value="오늘">오늘</SelectItem>
            <SelectItem value="최근 7일">최근 7일</SelectItem>
            <SelectItem value="최근 30일">최근 30일</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="h-8 w-[90px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="전체">전체 상태</SelectItem>
            <SelectItem value="완료">완료</SelectItem>
            <SelectItem value="오류">오류</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length}건
        </span>
      </div>

      {/* Table + Panel layout (skill management pattern) */}
      <div className="flex gap-0 h-[520px]">
        {/* Table side */}
        <div
          className={[
            'transition-all duration-300 ease-in-out overflow-hidden',
            isPanelOpen ? 'w-[55%]' : 'w-full',
          ].join(' ')}
        >
          <div className="rounded-md border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                    <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-[80px]">사용자</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-[120px]">날짜</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">대화 요약</TableHead>
                    {!isPanelOpen && (
                      <>
                        <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-[80px]">스킬</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-[100px]">모델</TableHead>
                      </>
                    )}
                    <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-[60px]">상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleRecords.map((record) => (
                    <TableRow
                      key={record.id}
                      className={[
                        'cursor-pointer transition-colors',
                        selectedRecord?.id === record.id
                          ? 'bg-red-50/60 border-l-2 border-l-[#FF3C42]'
                          : 'hover:bg-gray-50/60',
                      ].join(' ')}
                      onClick={() => setSelectedRecord(record)}
                    >
                      <TableCell className="text-sm font-medium text-gray-700">{record.userName}</TableCell>
                      <TableCell className="text-xs text-gray-500 tabular-nums">
                        {isPanelOpen ? record.date.split(' ')[0] : record.date}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 truncate max-w-[240px]">
                        {record.summary}
                      </TableCell>
                      {!isPanelOpen && (
                        <>
                          <TableCell>
                            {record.skill ? (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 text-blue-600 border-blue-200 bg-blue-50">
                                {record.skill}
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">{record.model}</TableCell>
                        </>
                      )}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={[
                            'text-[10px] px-1.5 py-0.5',
                            record.status === '완료'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200',
                          ].join(' ')}
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Show more */}
            {canShowMore && (
              <div className="border-t border-gray-100 px-4 py-2 text-center shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500 hover:text-gray-700 gap-1"
                  onClick={handleShowMore}
                >
                  더 보기
                  <ChevronDown className="h-3.5 w-3.5" />
                  <span className="text-gray-400 ml-1">
                    ({visibleCount}/{filtered.length})
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Panel side */}
        <div
          className={[
            'transition-all duration-300 ease-in-out overflow-hidden',
            isPanelOpen ? 'w-[45%]' : 'w-0',
          ].join(' ')}
        >
          {selectedRecord && (
            <ConversationSlidePanel
              record={selectedRecord}
              onClose={() => setSelectedRecord(null)}
            />
          )}
        </div>
      </div>
    </section>
  );
}
