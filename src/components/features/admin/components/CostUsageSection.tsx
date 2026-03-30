'use client';

import React from 'react';
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
} from '../data/monitoringMockData';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatKRW(value: number): string {
  if (value >= 1_000_000) return `₩${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₩${Math.round(value / 1_000)}K`;
  return `₩${value}`;
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
}

function CostTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  // 해당 날짜의 원본 데이터에서 토큰 수 가져오기
  const dayData = DAILY_COST_DATA.find((d) => d.date === label);

  const tokenKeys: Record<string, keyof typeof dayData & string> = {
    claude: 'claudeTokens',
    gpt4o: 'gpt4oTokens',
    other: 'otherTokens',
  };

  const total = payload.reduce((sum, p) => sum + p.value, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-900 mb-2">{label}</p>
      {payload.map((p) => {
        const tokens = dayData ? (dayData[tokenKeys[p.dataKey] as keyof typeof dayData] as number) : 0;
        return (
          <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-gray-600 w-[80px]">{MODEL_LABELS[p.dataKey]}</span>
            <span className="font-medium text-gray-900 w-[56px] text-right tabular-nums">
              {formatKRW(p.value)}
            </span>
            <span className="text-gray-400 w-[48px] text-right tabular-nums">
              {tokens}K tok
            </span>
          </div>
        );
      })}
      <div className="border-t border-gray-100 mt-1.5 pt-1.5 flex items-center justify-between">
        <span className="text-gray-500">합계</span>
        <span className="font-semibold text-gray-900 tabular-nums">{formatKRW(total)}</span>
      </div>
    </div>
  );
}

// ── Custom Legend ──────────────────────────────────────────────────────────────

function CostLegend() {
  const items = [
    { key: 'claude', label: 'Claude Opus 4', color: MODEL_COLORS.claude, total: MODEL_TOTALS.claude },
    { key: 'gpt4o', label: 'GPT-4o', color: MODEL_COLORS.gpt4o, total: MODEL_TOTALS.gpt4o },
    { key: 'other', label: '기타', color: MODEL_COLORS.other, total: MODEL_TOTALS.other },
  ];

  return (
    <div className="flex items-center gap-4 justify-center pt-2">
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-1.5 text-xs">
          <span
            className="w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-gray-600">{item.label}</span>
          <span className="text-gray-400 tabular-nums">({formatKRW(item.total)})</span>
        </div>
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CostUsageSection() {
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

      {/* 모델별 일별 비용 스택 바 (단일 Y축) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">모델별 일별 비용</h4>
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
                tickFormatter={(v: number) => formatKRW(v)}
              />
              <Tooltip content={<CostTooltip />} />
              <Bar dataKey="claude" name="Claude Opus 4" stackId="cost" fill={MODEL_COLORS.claude} radius={[0, 0, 0, 0]} barSize={14} />
              <Bar dataKey="gpt4o" name="GPT-4o" stackId="cost" fill={MODEL_COLORS.gpt4o} radius={[0, 0, 0, 0]} barSize={14} />
              <Bar dataKey="other" name="기타" stackId="cost" fill={MODEL_COLORS.other} radius={[2, 2, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <CostLegend />
      </div>
    </section>
  );
}
