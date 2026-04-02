'use client';

import React, { useState } from 'react';
import { DollarSign, Coins, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { KPICard } from '@/components/shared/atoms/KPICard';
import {
  COST_USAGE_KPI,
  DAILY_COST_DATA,
  MODEL_TOTALS,
  MODEL_TOKEN_TOTALS,
} from '../data/monitoringMockData';

// ── Types ─────────────────────────────────────────────────────────────────────

type ViewMode = 'cost' | 'token';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatKRW(value: number): string {
  if (value >= 1_000_000) return `₩${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₩${Math.round(value / 1_000)}K`;
  return `₩${value}`;
}

function formatTokens(value: number): string {
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}M`;
  return `${value}K`;
}

const MODEL_COLORS = {
  claude: '#FF3C42',
  gpt4o: '#3B82F6',
  other: '#94A3B8',
} as const;

const MODEL_LABELS: Record<string, string> = {
  claude: 'Claude Opus 4',
  gpt4o: 'GPT-4o',
  other: '기타',
};

// 비용 뷰 dataKey → 토큰 뷰 dataKey 매핑
const COST_KEYS = ['claude', 'gpt4o', 'other'] as const;
const TOKEN_KEYS: Record<string, string> = {
  claude: 'claudeTokens',
  gpt4o: 'gpt4oTokens',
  other: 'otherTokens',
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  viewMode: ViewMode;
}

function ChartTooltip({ active, payload, label, viewMode }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const dayData = DAILY_COST_DATA.find((d) => d.date === label);
  const total = payload.reduce((sum, p) => sum + p.value, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-900 mb-2">{label}</p>
      {payload.map((p) => {
        // 메인 키에서 모델 이름 추출
        const modelKey = viewMode === 'cost' ? p.dataKey : p.dataKey.replace('Tokens', '');
        const cost = dayData ? (dayData[modelKey as keyof typeof dayData] as number) : 0;
        const tokens = dayData ? (dayData[TOKEN_KEYS[modelKey] as keyof typeof dayData] as number) : 0;

        return (
          <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-gray-600 w-[80px]">{MODEL_LABELS[modelKey]}</span>
            {viewMode === 'cost' ? (
              <>
                <span className="font-medium text-gray-900 w-[56px] text-right tabular-nums">
                  {formatKRW(p.value)}
                </span>
                <span className="text-gray-400 w-[48px] text-right tabular-nums">
                  {tokens}K tok
                </span>
              </>
            ) : (
              <>
                <span className="font-medium text-gray-900 w-[56px] text-right tabular-nums">
                  {p.value}K tok
                </span>
                <span className="text-gray-400 w-[56px] text-right tabular-nums">
                  {formatKRW(cost)}
                </span>
              </>
            )}
          </div>
        );
      })}
      <div className="border-t border-gray-100 mt-1.5 pt-1.5 flex items-center justify-between">
        <span className="text-gray-500">합계</span>
        <span className="font-semibold text-gray-900 tabular-nums">
          {viewMode === 'cost' ? formatKRW(total) : `${formatTokens(total)} tok`}
        </span>
      </div>
    </div>
  );
}

// ── Custom Legend ──────────────────────────────────────────────────────────────

function ChartLegend({ viewMode }: { viewMode: ViewMode }) {
  const totals = viewMode === 'cost' ? MODEL_TOTALS : MODEL_TOKEN_TOTALS;
  const items = COST_KEYS.map((key) => ({
    key,
    label: MODEL_LABELS[key],
    color: MODEL_COLORS[key],
    total: totals[key],
  }));

  return (
    <div className="flex items-center gap-4 justify-center pt-2">
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-1.5 text-xs">
          <span
            className="w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-gray-600">{item.label}</span>
          <span className="text-gray-400 tabular-nums">
            ({viewMode === 'cost' ? formatKRW(item.total) : `${formatTokens(item.total)} tok`})
          </span>
        </div>
      ))}
    </div>
  );
}

// ── View Toggle ───────────────────────────────────────────────────────────────

function ViewToggle({ viewMode, onChange }: { viewMode: ViewMode; onChange: (v: ViewMode) => void }) {
  const btnBase = 'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors';
  const active = 'bg-gray-900 text-white';
  const inactive = 'text-gray-500 hover:text-gray-700';

  return (
    <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
      <button className={`${btnBase} ${viewMode === 'cost' ? active : inactive}`} onClick={() => onChange('cost')}>
        비용
      </button>
      <button className={`${btnBase} ${viewMode === 'token' ? active : inactive}`} onClick={() => onChange('token')}>
        토큰
      </button>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CostUsageSection() {
  const [viewMode, setViewMode] = useState<ViewMode>('cost');

  const isCostView = viewMode === 'cost';

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-bold text-gray-900">비용 / 사용량</h3>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <KPICard
          title="이번 달 비용"
          value={COST_USAGE_KPI.monthCost.value}
          change={COST_USAGE_KPI.monthCost.change}
          trend="up"
          icon={<DollarSign size={14} />}
        />
        <KPICard
          title="총 토큰 사용량"
          value={COST_USAGE_KPI.totalTokens.value}
          icon={<Coins size={14} />}
        />
        <KPICard
          title="일평균 비용"
          value={COST_USAGE_KPI.avgDailyCost.value}
          icon={<TrendingUp size={14} />}
        />
      </div>

      {/* 모델별 일별 비용/토큰 스택 바 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            {isCostView ? '모델별 일별 비용' : '모델별 일별 토큰'}
          </h4>
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DAILY_COST_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => isCostView ? formatKRW(v) : `${v}K`}
              />
              <Tooltip content={<ChartTooltip viewMode={viewMode} />} />
              {isCostView ? (
                <>
                  <Bar dataKey="claude" name="Claude Opus 4" stackId="s" fill={MODEL_COLORS.claude} radius={[0, 0, 0, 0]} barSize={14} />
                  <Bar dataKey="gpt4o" name="GPT-4o" stackId="s" fill={MODEL_COLORS.gpt4o} radius={[0, 0, 0, 0]} barSize={14} />
                  <Bar dataKey="other" name="기타" stackId="s" fill={MODEL_COLORS.other} radius={[2, 2, 0, 0]} barSize={14} />
                </>
              ) : (
                <>
                  <Bar dataKey="claudeTokens" name="Claude Opus 4" stackId="s" fill={MODEL_COLORS.claude} radius={[0, 0, 0, 0]} barSize={14} />
                  <Bar dataKey="gpt4oTokens" name="GPT-4o" stackId="s" fill={MODEL_COLORS.gpt4o} radius={[0, 0, 0, 0]} barSize={14} />
                  <Bar dataKey="otherTokens" name="기타" stackId="s" fill={MODEL_COLORS.other} radius={[2, 2, 0, 0]} barSize={14} />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ChartLegend viewMode={viewMode} />
      </div>
    </section>
  );
}
