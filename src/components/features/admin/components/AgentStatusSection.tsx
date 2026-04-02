'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { CheckCircle2, XCircle, Zap, ChevronDown, ExternalLink } from 'lucide-react';
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
import { AGENT_STATUS_KPI, AGENT_ERRORS } from '../data/monitoringMockData';

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
const MAX_VISIBLE = 50;

const ERROR_TYPE_COLORS: Record<string, string> = {
  Timeout: 'bg-amber-50 text-amber-700 border-amber-200',
  'Model Error': 'bg-red-50 text-red-700 border-red-200',
  'Tool Error': 'bg-violet-50 text-violet-700 border-violet-200',
};

const TH = 'text-[10px] font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap';

// ── Component ─────────────────────────────────────────────────────────────────

export function AgentStatusSection() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const capped = Math.min(AGENT_ERRORS.length, MAX_VISIBLE);

  const visibleErrors = useMemo(
    () => AGENT_ERRORS.slice(0, Math.min(visibleCount, capped)),
    [visibleCount, capped],
  );

  const canShowMore = visibleCount < capped;

  const handleShowMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, capped));
  }, [capped]);

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

      {/* Error table */}
      <div className="rounded-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                <TableHead className={`${TH} w-[90px]`}>시간</TableHead>
                <TableHead className={`${TH} w-[64px]`}>사용자</TableHead>
                <TableHead className={`${TH} w-[120px]`}>요청 요약</TableHead>
                <TableHead className={`${TH} w-[80px]`}>스킬</TableHead>
                <TableHead className={`${TH} w-[80px]`}>모델</TableHead>
                <TableHead className={`${TH} w-[84px]`}>에러 타입</TableHead>
                <TableHead className={`${TH} w-[80px]`}>실패 단계</TableHead>
                <TableHead className={`${TH} w-[60px] text-right`}>유사(24h)</TableHead>
                <TableHead className={`${TH} w-[48px] text-right`}>영향</TableHead>
                <TableHead className={`${TH} w-[36px]`} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleErrors.map((err) => (
                <TableRow
                  key={err.id}
                  className={[
                    'cursor-pointer transition-colors',
                    highlightedId === err.id
                      ? 'bg-red-50/60 border-l-2 border-l-[#FF3C42]'
                      : 'hover:bg-gray-50/60',
                  ].join(' ')}
                  onClick={() => setHighlightedId(highlightedId === err.id ? null : err.id)}
                >
                  <TableCell className="text-[11px] text-gray-500 tabular-nums">{err.time}</TableCell>
                  <TableCell className="text-[11px] text-gray-700 font-medium">{err.userName}</TableCell>
                  <TableCell className="text-[11px] text-gray-600 truncate max-w-[120px]" title={err.requestSummary}>
                    {err.requestSummary}
                  </TableCell>
                  <TableCell className="text-[11px] text-gray-500">{err.skill ?? '—'}</TableCell>
                  <TableCell className="text-[11px] text-gray-500">{err.model}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0.5 ${ERROR_TYPE_COLORS[err.errorType] || ''}`}
                    >
                      {err.errorType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-gray-600 truncate max-w-[80px]" title={err.failedStep}>
                    {err.failedStep}
                  </TableCell>
                  <TableCell className="text-[11px] text-gray-700 tabular-nums text-right font-medium">
                    {err.similarErrorCount}건
                  </TableCell>
                  <TableCell className="text-[11px] text-gray-700 tabular-nums text-right font-medium">
                    {err.affectedUserCount}명
                  </TableCell>
                  <TableCell className="px-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://langfuse.example.com/trace/${err.conversationId}`, '_blank');
                      }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Show more / limit message */}
        {canShowMore ? (
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
                ({visibleCount}/{capped})
              </span>
            </Button>
          </div>
        ) : visibleCount >= MAX_VISIBLE && AGENT_ERRORS.length > MAX_VISIBLE ? (
          <div className="border-t border-gray-100 px-4 py-2.5 text-center">
            <p className="text-[11px] text-gray-400">
              최근 {MAX_VISIBLE}건까지 표시됩니다. 전체 오류를 보려면 <span className="font-medium text-gray-600">대화 이력</span> 탭에서 상태=오류로 필터하세요.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
