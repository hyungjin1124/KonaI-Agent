/**
 * FeedbackSummaryView — Read-only feedback summary for Admin (client)
 *
 * Shows KPI cards + quality trend chart only.
 * No editable table, no status changes — those are in Platform Admin.
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  ThumbsUp, TrendingUp, TrendingDown,
  MessageSquare, Target, AlertTriangle,
} from '../../icons';
import {
  type PeriodFilter,
  QUALITY_KPI,
  PERIOD_OPTIONS,
  getDailyQualityByPeriod,
} from './feedbackQualityData';

// --- KPI Card ---
function KPICard({ title, value, change, trend, icon }: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}) {
  const isPositiveTrend = (trend === 'up' && !title.includes('미해결')) ||
    (trend === 'down' && title.includes('미해결'));
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium">{title}</span>
        <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
        isPositiveTrend ? 'text-green-600' : 'text-red-500'
      }`}>
        {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {change}
        <span className="text-gray-400 ml-1">전월 대비</span>
      </div>
    </div>
  );
}

// --- Chart Tooltip ---
function ChartTooltipContent({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const satisfaction = payload.find(p => p.dataKey === 'satisfaction');
  const positive = payload.find(p => p.dataKey === 'positive');
  const negative = payload.find(p => p.dataKey === 'negative');
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-xs">
      <div className="font-bold text-gray-900 mb-1.5">{label}</div>
      {satisfaction && (
        <div className="flex items-center gap-2 text-blue-600">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          만족도: {satisfaction.value}%
        </div>
      )}
      {positive && (
        <div className="flex items-center gap-2 text-green-600 mt-0.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          긍정: {positive.value}건
        </div>
      )}
      {negative && (
        <div className="flex items-center gap-2 text-red-500 mt-0.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          부정: {negative.value}건
        </div>
      )}
    </div>
  );
}

export function FeedbackSummaryView() {
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const kpi = QUALITY_KPI;
  const dailyData = useMemo(() => getDailyQualityByPeriod(period), [period]);

  return (
    <div className="space-y-6">
      {/* Period Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-900">피드백 요약</h4>
          <p className="text-xs text-gray-500 mt-0.5">에이전트 응답 품질 현황 (읽기 전용)</p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg" role="group" aria-label="기간 선택">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                period === opt.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-pressed={period === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="전체 만족도"
          value={`${kpi.satisfactionRate}%`}
          change={kpi.satisfactionChange}
          trend="up"
          icon={<ThumbsUp size={16} />}
        />
        <KPICard
          title="응답 품질"
          value={`${kpi.goodQualityRate}%`}
          change={kpi.qualityChange}
          trend="up"
          icon={<Target size={16} />}
        />
        <KPICard
          title="총 피드백"
          value={kpi.totalFeedback.toLocaleString()}
          change={kpi.feedbackChange}
          trend="up"
          icon={<MessageSquare size={16} />}
        />
        <KPICard
          title="미해결 쿼리"
          value={`${kpi.unresolvedRate}%`}
          change={kpi.unresolvedChange}
          trend="down"
          icon={<AlertTriangle size={16} />}
        />
      </div>

      {/* Quality Trend Chart */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-gray-900">품질 추이</h4>
            <p className="text-xs text-gray-500 mt-0.5">일별 만족도 및 피드백 건수</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" /> 만족도(%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-green-500 rounded-full" /> 긍정
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-red-400 rounded-full" /> 부정
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[70, 100]} />
            <Tooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="satisfaction" stroke="#3B82F6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="positive" stroke="#22C55E" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            <Line type="monotone" dataKey="negative" stroke="#EF4444" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
