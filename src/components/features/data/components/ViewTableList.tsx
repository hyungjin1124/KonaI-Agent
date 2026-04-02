'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { ViewTable } from '../types/data.types';

// ── Sort types ────────────────────────────────────────────────────────────────

type SortField = 'viewName' | 'domain' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

// ── Source badge color map ────────────────────────────────────────────────────

const SOURCE_BADGE_CLASSES: Record<string, string> = {
  ERP: 'bg-blue-50 text-blue-700 border-blue-200',
  Jira: 'bg-purple-50 text-purple-700 border-purple-200',
  Excel: 'bg-green-50 text-green-700 border-green-200',
  API: 'bg-orange-50 text-orange-700 border-orange-200',
  기타: 'bg-gray-50 text-gray-600 border-gray-200',
};

// ── Component ─────────────────────────────────────────────────────────────────

interface ViewTableListProps {
  viewTables: ViewTable[];
  totalCount: number;
  selectedId: string | null;
  isPanelOpen: boolean;
  onRowClick: (viewId: string) => void;
}

export function ViewTableList({
  viewTables,
  totalCount,
  selectedId,
  isPanelOpen,
  onRowClick,
}: ViewTableListProps) {
  const [sortField, setSortField] = useState<SortField>('viewName');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const toggleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDir('asc');
      return field;
    });
  }, []);

  const sorted = useMemo(() => {
    return [...viewTables].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'viewName') {
        cmp = a.viewName.localeCompare(b.viewName, 'ko');
      } else if (sortField === 'domain') {
        cmp = a.domain.localeCompare(b.domain, 'ko');
      } else if (sortField === 'updatedAt') {
        cmp = a.updatedAt.localeCompare(b.updatedAt);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [viewTables, sortField, sortDir]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 text-gray-300" />;
    return sortDir === 'asc'
      ? <ArrowUp className="h-3 w-3 ml-1 text-gray-600" />
      : <ArrowDown className="h-3 w-3 ml-1 text-gray-600" />;
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <button
      className="flex items-center text-xs font-medium text-gray-500 whitespace-nowrap hover:text-gray-700 transition-colors"
      onClick={() => toggleSort(field)}
    >
      {label}
      <SortIcon field={field} />
    </button>
  );

  return (
    <div className="flex flex-col">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/80">
            <TableHead className="text-xs font-medium text-gray-500 whitespace-nowrap">
              <SortHeader field="viewName" label="뷰테이블 이름" />
            </TableHead>
            <TableHead className="text-xs font-medium text-gray-500 whitespace-nowrap">
              소스
            </TableHead>
            {!isPanelOpen && (
              <TableHead className="text-xs font-medium text-gray-500 whitespace-nowrap">
                <SortHeader field="domain" label="도메인" />
              </TableHead>
            )}
            {!isPanelOpen && (
              <TableHead className="text-xs font-medium text-gray-500 whitespace-nowrap">
                허용 대상
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isPanelOpen ? 2 : 4}
                className="text-center py-16 text-sm text-gray-400"
              >
                조건에 맞는 뷰테이블이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((vt) => (
              <TableRow
                key={vt.viewId}
                className={[
                  'cursor-pointer transition-colors',
                  selectedId === vt.viewId
                    ? 'bg-red-50/60 border-l-2 border-l-[#FF3C42]'
                    : 'hover:bg-gray-50/60',
                ].join(' ')}
                onClick={() => onRowClick(vt.viewId)}
              >
                {/* 뷰테이블 이름 */}
                <TableCell className="py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {vt.viewName}
                    </span>
                    {!vt.isActive && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        비활성
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px]">
                    {vt.viewId}
                  </p>
                </TableCell>

                {/* 소스 */}
                <TableCell className="py-2.5">
                  <Badge
                    variant="outline"
                    className={`text-xs font-normal ${SOURCE_BADGE_CLASSES[vt.sourceType] ?? ''}`}
                  >
                    {vt.sourceType}
                  </Badge>
                </TableCell>

                {/* 도메인 (collapsible) */}
                {!isPanelOpen && (
                  <TableCell className="py-2.5">
                    <Badge variant="outline" className="text-xs font-normal">
                      {vt.domain}
                    </Badge>
                  </TableCell>
                )}

                {/* 허용 대상 (collapsible) */}
                {!isPanelOpen && (
                  <TableCell className="py-2.5 text-xs text-gray-600 whitespace-nowrap">
                    {vt.accessSummary === '전체 허용' ? (
                      <span className="text-emerald-600">{vt.accessSummary}</span>
                    ) : vt.accessSummary === '—' ? (
                      <span className="text-gray-400">{vt.accessSummary}</span>
                    ) : (
                      vt.accessSummary ?? '—'
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* 건수 표시 */}
      <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 text-right">
        {viewTables.length} / {totalCount}
      </div>
    </div>
  );
}
