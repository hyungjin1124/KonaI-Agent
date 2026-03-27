'use client';

import React from 'react';
import { DollarSign, Coins, TrendingUp } from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { KPICard } from '@/components/shared/atoms/KPICard';
import {
  COST_USAGE_KPI,
  DAILY_TOKEN_COST_DATA,
  MODEL_COST_RATIOS,
} from '../data/monitoringMockData';

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

      {/* Dual Y-axis chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">일별 토큰 사용량 & 누적 비용</h4>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={DAILY_TOKEN_COST_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
                interval={4}
              />
              {/* Left Y: tokens (K) */}
              <YAxis
                yAxisId="tokens"
                orientation="left"
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}K`}
              />
              {/* Right Y: cumulative cost (K₩) */}
              <YAxis
                yAxisId="cost"
                orientation="right"
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `₩${v}K`}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              {/* Stacked bars */}
              <Bar yAxisId="tokens" dataKey="claude" name="Claude" stackId="tokens" fill="#FF3C42" radius={[0, 0, 0, 0]} barSize={14} />
              <Bar yAxisId="tokens" dataKey="gpt4o" name="GPT-4o" stackId="tokens" fill="#3B82F6" radius={[0, 0, 0, 0]} barSize={14} />
              <Bar yAxisId="tokens" dataKey="other" name="기타" stackId="tokens" fill="#94A3B8" radius={[2, 2, 0, 0]} barSize={14} />
              {/* Cumulative cost line */}
              <Line
                yAxisId="cost"
                type="monotone"
                dataKey="cumulativeCost"
                name="누적 비용"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model cost ratio bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">모델별 비용 비율</h4>
        <div className="space-y-2.5">
          {MODEL_COST_RATIOS.map((ratio) => (
            <div key={ratio.model} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-[110px] truncate shrink-0">{ratio.model}</span>
              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${ratio.percentage}%`,
                    backgroundColor: ratio.color,
                  }}
                />
              </div>
              <span className="text-xs font-bold text-gray-700 w-[36px] text-right tabular-nums">{ratio.percentage}%</span>
              <span className="text-xs text-gray-500 w-[60px] text-right tabular-nums">{ratio.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
