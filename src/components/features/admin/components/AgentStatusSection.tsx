'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { CheckCircle2, XCircle, Zap, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { KPICard } from '@/components/shared/atoms/KPICard';
import { ErrorDetailPanel } from './ErrorDetailPanel';
import { AGENT_STATUS_KPI, AGENT_ERRORS } from '../data/monitoringMockData';
import type { AgentError } from '../types/admin.types';

// ── Types ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const ERROR_TYPE_COLORS: Record<string, string> = {
  Timeout: 'bg-amber-50 text-amber-700 border-amber-200',
  'Model Error': 'bg-red-50 text-red-700 border-red-200',
  'Tool Error': 'bg-violet-50 text-violet-700 border-violet-200',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function AgentStatusSection() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedError, setSelectedError] = useState<AgentError | null>(null);

  const visibleErrors = useMemo(
    () => AGENT_ERRORS.slice(0, visibleCount),
    [visibleCount],
  );

  const canShowMore = visibleCount < AGENT_ERRORS.length;

  const handleShowMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, AGENT_ERRORS.length));
  }, []);

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-bold text-gray-900">에이전트 상태</h3>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <KPICard
          title="성공률"
          value={AGENT_STATUS_KPI.successRate.value}
          change={AGENT_STATUS_KPI.successRate.change}
          trend="up"
          icon={<CheckCircle2 size={14} />}
        />
        <KPICard
          title="실패율"
          value={AGENT_STATUS_KPI.failureRate.value}
          change={AGENT_STATUS_KPI.failureRate.change}
          trend="down"
          icon={<XCircle size={14} />}
        />
        <KPICard
          title="총 실행 수"
          value={AGENT_STATUS_KPI.totalExecutions.value}
          change={AGENT_STATUS_KPI.totalExecutions.change}
          trend="up"
          icon={<Zap size={14} />}
        />
      </div>

      {/* Error list + panel overlay container */}
      <div className="relative">
        {/* Error table */}
        <div className="rounded-md border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-[140px]">시간</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-[80px]">사용자</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-[100px]">에러 타입</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-[160px]">실패 단계</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">요약</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleErrors.map((err) => (
                <TableRow
                  key={err.id}
                  className={[
                    'cursor-pointer transition-colors',
                    selectedError?.id === err.id
                      ? 'bg-red-50/60 border-l-2 border-l-[#FF3C42]'
                      : 'hover:bg-gray-50/60',
                  ].join(' ')}
                  onClick={() => setSelectedError(err)}
                >
                  <TableCell className="text-xs text-gray-500 tabular-nums">{err.time}</TableCell>
                  <TableCell className="text-sm text-gray-700 font-medium">{err.userName}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0.5 ${ERROR_TYPE_COLORS[err.errorType] || ''}`}
                    >
                      {err.errorType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600 truncate max-w-[160px]">{err.failedStep}</TableCell>
                  <TableCell className="text-xs text-gray-600 truncate max-w-[300px]">{err.summary}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Show more */}
          {canShowMore && (
            <div className="border-t border-gray-100 px-4 py-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-gray-700 gap-1"
                onClick={handleShowMore}
              >
                더 보기
                <ChevronDown className="h-3.5 w-3.5" />
                <span className="text-gray-400 ml-1">
                  ({visibleCount}/{AGENT_ERRORS.length})
                </span>
              </Button>
            </div>
          )}
        </div>

        {/* Error detail panel overlay */}
        {selectedError && (
          <ErrorDetailPanel
            error={selectedError}
            onClose={() => setSelectedError(null)}
          />
        )}
      </div>
    </section>
  );
}
