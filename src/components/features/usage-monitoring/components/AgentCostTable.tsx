import React, { useState, useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from '../../../icons';
import { ChartWidget } from '../../../shared/molecules/ChartWidget';
import { AGENT_COST_DATA } from '../usageMonitoringData';
import type { AgentCostBreakdown } from '../usageMonitoringData';

type SortField = 'costUsd' | 'totalTokens' | 'activeUsers';
type SortDir = 'asc' | 'desc';

function formatTokens(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return String(value);
}

function SparkLine({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="w-[80px] h-[24px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function SortIcon({ field, current, dir }: { field: SortField; current: SortField; dir: SortDir }) {
  if (field !== current) return <ChevronDown size={12} className="text-gray-300" />;
  return dir === 'desc'
    ? <ChevronDown size={12} className="text-gray-700" />
    : <ChevronUp size={12} className="text-gray-700" />;
}

export function AgentCostTable() {
  const [sortField, setSortField] = useState<SortField>('costUsd');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(() => {
    return [...AGENT_COST_DATA].sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDir === 'desc' ? -diff : diff;
    });
  }, [sortField, sortDir]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  const totalCost = AGENT_COST_DATA.reduce((sum, a) => sum + a.costUsd, 0);

  return (
    <ChartWidget
      title="에이전트별 비용 분해"
      subtitle={`총 $${totalCost.toLocaleString()}`}
      height={280}
      insightSummary="PPT 에이전트가 전체 비용의 37%를 차지하며, 상위 2개 에이전트가 62%를 소비합니다."
      insightDetail={
        <div className="space-y-3 text-sm">
          <p>에이전트별 비용 파레토 분석 결과, PPT 에이전트($1,056)와 분석 에이전트($704)가 전체 $2,847 중 62%를 차지합니다.</p>
          <p>PPT 에이전트는 사용자 수 대비 비용이 가장 높아(사용자당 $23.5/월), 템플릿 캐싱으로 토큰 절감 가능성이 있습니다.</p>
          <p><strong>권장 액션:</strong> PPT 에이전트의 반복 패턴 분석 후 프리셋 템플릿을 도입하면 월 $200~300 절감이 예상됩니다.</p>
        </div>
      }
      expandTestId="agent-cost-insight"
    >
      <div className="overflow-x-auto" data-testid="agent-cost-table">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-2 text-xs font-bold text-gray-500">에이전트</th>
              <th
                className="text-right py-2 px-2 text-xs font-bold text-gray-500 cursor-pointer select-none"
                onClick={() => handleSort('totalTokens')}
              >
                <span className="inline-flex items-center gap-0.5">
                  토큰 <SortIcon field="totalTokens" current={sortField} dir={sortDir} />
                </span>
              </th>
              <th
                className="text-right py-2 px-2 text-xs font-bold text-gray-500 cursor-pointer select-none"
                onClick={() => handleSort('costUsd')}
              >
                <span className="inline-flex items-center gap-0.5">
                  비용 (USD) <SortIcon field="costUsd" current={sortField} dir={sortDir} />
                </span>
              </th>
              <th className="text-right py-2 px-2 text-xs font-bold text-gray-500">Credits</th>
              <th
                className="text-right py-2 px-2 text-xs font-bold text-gray-500 cursor-pointer select-none"
                onClick={() => handleSort('activeUsers')}
              >
                <span className="inline-flex items-center gap-0.5">
                  사용자 <SortIcon field="activeUsers" current={sortField} dir={sortDir} />
                </span>
              </th>
              <th className="text-right py-2 px-2 text-xs font-bold text-gray-500">7일 트렌드</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((agent: AgentCostBreakdown) => (
              <tr key={agent.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: agent.color }} />
                    <span className="font-medium text-gray-900 text-xs">{agent.name}</span>
                  </div>
                </td>
                <td className="text-right py-2 px-2 text-xs text-gray-600">{formatTokens(agent.totalTokens)}</td>
                <td className="text-right py-2 px-2 text-xs font-bold text-gray-900">${agent.costUsd.toLocaleString()}</td>
                <td className="text-right py-2 px-2 text-xs text-gray-600">{agent.billedCredits}</td>
                <td className="text-right py-2 px-2 text-xs text-gray-600">{agent.activeUsers}</td>
                <td className="py-2 px-2 flex justify-end">
                  <SparkLine data={agent.weeklyTrend} color={agent.color} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartWidget>
  );
}
