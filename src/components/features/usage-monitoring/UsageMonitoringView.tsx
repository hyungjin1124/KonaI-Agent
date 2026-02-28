import React, { useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, BarChart,
  PieChart, Pie, Cell,
} from 'recharts';
import { Activity, CreditCard, Users, Bot } from '../../icons';
import { KPICard } from '../../shared/atoms/KPICard';
import { ChartWidget } from '../../shared/molecules/ChartWidget';
import {
  USAGE_KPI_SUMMARY,
  AGENT_USAGE_DATA,
  MODEL_COST_DATA,
  PERIOD_OPTIONS,
  getDailyUsageByPeriod,
} from './usageMonitoringData';
import type { PeriodFilter } from './usageMonitoringData';

const TOOLTIP_STYLE = {
  borderRadius: '8px',
  border: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

function formatTokens(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return String(value);
}

export const UsageMonitoringView: React.FC = () => {
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const dailyData = getDailyUsageByPeriod(period);
  const kpi = USAGE_KPI_SUMMARY;

  return (
    <div className="space-y-6" data-testid="usage-monitoring-view">
      {/* Period Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">AI 사용량 모니터링</h3>
          <p className="text-sm text-gray-500 mt-0.5">에이전트 사용량, 비용, 성능을 한눈에 확인합니다.</p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg" role="group" aria-label="기간 선택">
          {PERIOD_OPTIONS.map((opt) => (
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
          title="총 토큰 사용량"
          value={kpi.totalTokens.value}
          change={kpi.totalTokens.change}
          trend={kpi.totalTokens.trend}
          icon={<Activity size={14} />}
          subtitle="전주 대비"
        />
        <KPICard
          title="총 비용 (USD)"
          value={kpi.totalCost.value}
          change={kpi.totalCost.change}
          trend={kpi.totalCost.trend}
          icon={<CreditCard size={14} />}
          subtitle="전주 대비"
        />
        <KPICard
          title="활성 사용자"
          value={kpi.activeUsers.value}
          change={kpi.activeUsers.change}
          trend={kpi.activeUsers.trend}
          icon={<Users size={14} />}
          subtitle="전주 대비"
        />
        <KPICard
          title="에이전트 실행 수"
          value={kpi.agentRuns.value}
          change={kpi.agentRuns.change}
          trend={kpi.agentRuns.trend}
          icon={<Bot size={14} />}
          subtitle="전주 대비"
        />
      </div>

      {/* Charts Row 1: Daily Trend (full width) */}
      <ChartWidget
        title="일별 토큰 사용량 / 비용 추이"
        subtitle={`최근 ${period === '7d' ? '7일' : period === '30d' ? '30일' : '90일'}`}
        height={280}
        insightSummary="주중 사용량이 주말 대비 평균 68% 높으며, 최근 2주간 꾸준한 상승 추세를 보입니다."
        insightDetail={
          <div className="space-y-3 text-sm">
            <p>일별 토큰 사용량 분석 결과, 주중(월~금) 평균 42만 토큰, 주말(토~일) 평균 25만 토큰으로 주중 사용량이 68% 높습니다.</p>
            <p>최근 2주간 일 평균 사용량이 380K → 450K로 약 18% 상승하여, 에이전트 활용도가 증가하고 있음을 시사합니다.</p>
            <p><strong>권장 액션:</strong> 비용 최적화를 위해 비피크 시간대(21:00~06:00)에 배치 작업을 스케줄링하는 것을 고려하세요.</p>
          </div>
        }
        expandTestId="daily-trend-insight"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              interval={period === '90d' ? 6 : period === '30d' ? 2 : 0}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={formatTokens}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `$${v}`}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value: number, name: string) => {
                if (name === '토큰') return [formatTokens(value), name];
                return [`$${value.toFixed(2)}`, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar
              yAxisId="left"
              dataKey="tokens"
              name="토큰"
              fill="#E5E7EB"
              radius={[4, 4, 0, 0]}
              barSize={period === '90d' ? 6 : period === '30d' ? 12 : 24}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cost"
              name="비용 (USD)"
              stroke="#FF3C42"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartWidget>

      {/* Charts Row 2: Agent Distribution + Model Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Agent Usage Distribution */}
        <ChartWidget
          title="에이전트 유형별 실행 수"
          height={220}
          insightSummary="PPT 에이전트가 전체 실행의 38%를 차지하며 가장 활발하게 사용됩니다."
          insightDetail={
            <div className="space-y-3 text-sm">
              <p>에이전트 유형별 실행 분석 결과, PPT 에이전트(1,243회)가 전체 3,241회 실행 중 38%를 차지하며 가장 높은 활용도를 보입니다.</p>
              <p>분석 에이전트(987회, 30%)가 2위이며, 채팅 에이전트(654회, 20%)와 데이터 에이전트(357회, 11%)가 뒤를 잇습니다.</p>
              <p><strong>권장 액션:</strong> PPT 에이전트의 높은 사용량을 고려하여, 자주 사용되는 템플릿을 캐싱하면 토큰 소비를 15~20% 절감할 수 있습니다.</p>
            </div>
          }
          expandTestId="agent-distribution-insight"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={AGENT_USAGE_DATA}
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value: number) => [`${value.toLocaleString()}회`, '실행 수']}
              />
              <Bar dataKey="runs" barSize={20} radius={[0, 4, 4, 0]}>
                {AGENT_USAGE_DATA.map((entry, index) => (
                  <Cell key={`agent-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartWidget>

        {/* Model Cost Distribution */}
        <ChartWidget
          title="모델별 비용 분포"
          height={220}
          insightSummary="GPT-4o가 전체 비용의 50%를 차지합니다. GPT-4o-mini 전환으로 비용 절감 가능."
          insightDetail={
            <div className="space-y-3 text-sm">
              <p>모델별 비용 분석 결과, GPT-4o($1,420)가 전체 $2,847 중 50%를 차지하며 비용 최적화의 핵심 대상입니다.</p>
              <p>Claude 3.5 Sonnet($890, 31%)은 토큰당 비용 효율이 가장 높으며, GPT-4o-mini($320, 11%)는 경량 작업에 적합합니다. Claude 3 Haiku($217, 8%)는 가장 비용 효율적인 옵션입니다.</p>
              <p><strong>권장 액션:</strong> 단순 질의 응답, 요약 등 경량 작업을 GPT-4o에서 GPT-4o-mini 또는 Claude 3 Haiku로 전환하면 월 $400~600 절감이 가능합니다.</p>
            </div>
          }
          expandTestId="model-cost-insight"
        >
          <div className="flex items-center h-full gap-4">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MODEL_COST_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    dataKey="cost"
                    paddingAngle={2}
                    stroke="none"
                  >
                    {MODEL_COST_DATA.map((entry, index) => (
                      <Cell key={`model-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '비용']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 pr-2 min-w-[140px]">
              {MODEL_COST_DATA.map((model) => (
                <div key={model.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: model.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-700 truncate">{model.name}</div>
                    <div className="text-[10px] text-gray-400">${model.cost.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartWidget>
      </div>
    </div>
  );
};

export default UsageMonitoringView;
