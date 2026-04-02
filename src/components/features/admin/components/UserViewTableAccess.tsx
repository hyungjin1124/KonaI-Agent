'use client';

import React, { useState, useMemo } from 'react';
import { CheckCircle2, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
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
import { getUserViewAccess } from '@/components/features/data/data/viewTableMockData';
import type { AccessStatusFilter, UserViewTableAccess as UserViewTableAccessType } from '@/components/features/data/types/data.types';

interface UserViewTableAccessProps {
  userId: string;
}

export function UserViewTableAccess({ userId }: UserViewTableAccessProps) {
  const [statusFilter, setStatusFilter] = useState<AccessStatusFilter>('전체');
  const [expandedViewId, setExpandedViewId] = useState<string | null>(null);

  const allAccess = getUserViewAccess(userId);

  const filteredAccess = useMemo(() => {
    if (statusFilter === '전체') return allAccess;
    return allAccess.filter((a) => a.accessStatus === statusFilter);
  }, [allAccess, statusFilter]);

  const allowedCount = allAccess.filter((a) => a.accessStatus === '허용').length;
  const blockedCount = allAccess.filter((a) => a.accessStatus === '차단').length;

  if (allAccess.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-gray-400">
        접근 현황 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary + filter */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-600">
          접근 가능: <span className="font-semibold text-emerald-600">{allowedCount}개</span>
          {' / '}
          차단: <span className="font-semibold text-red-500">{blockedCount}개</span>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as AccessStatusFilter)}
        >
          <SelectTrigger className="h-7 w-[100px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="전체">전체</SelectItem>
            <SelectItem value="허용">허용만</SelectItem>
            <SelectItem value="차단">차단만</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Access table */}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/80">
            <TableHead className="text-xs font-medium text-gray-500 w-[160px]">뷰테이블</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 w-[50px]">접근</TableHead>
            <TableHead className="text-xs font-medium text-gray-500">허용 근거</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 w-[140px]">RLS 범위</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAccess.map((access) => (
            <React.Fragment key={access.viewId}>
              <TableRow
                className={[
                  'transition-colors',
                  access.derivedDetail ? 'cursor-pointer hover:bg-gray-50/60' : '',
                ].join(' ')}
                onClick={() => {
                  if (access.derivedDetail) {
                    setExpandedViewId((prev) =>
                      prev === access.viewId ? null : access.viewId,
                    );
                  }
                }}
              >
                <TableCell className="py-2">
                  <div className="flex items-center gap-1.5">
                    {access.derivedDetail && (
                      expandedViewId === access.viewId
                        ? <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
                        : <ChevronRight className="h-3 w-3 text-gray-400 shrink-0" />
                    )}
                    <span className="text-sm text-gray-900">{access.viewName}</span>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  {access.accessStatus === '허용' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                </TableCell>
                <TableCell className="py-2 text-xs text-gray-500">
                  {access.accessBasis}
                </TableCell>
                <TableCell className="py-2 text-xs text-gray-500 font-mono">
                  {access.rlsScope ?? <span className="text-gray-300">-</span>}
                </TableCell>
              </TableRow>

              {/* Derived detail rows */}
              {access.derivedDetail && expandedViewId === access.viewId && (
                access.derivedDetail.map((detail) => (
                  <TableRow key={`${access.viewId}-${detail.pgmseq}`} className="bg-gray-50/40">
                    <TableCell className="py-1.5 pl-10">
                      <span className="text-xs text-gray-500">
                        pgmseq {detail.pgmseq} ({detail.erpScreenName})
                      </span>
                    </TableCell>
                    <TableCell className="py-1.5">
                      {detail.accessStatus === '허용' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-300" />
                      )}
                    </TableCell>
                    <TableCell className="py-1.5 text-xs text-gray-400">
                      {detail.basis}
                    </TableCell>
                    <TableCell className="py-1.5" />
                  </TableRow>
                ))
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
