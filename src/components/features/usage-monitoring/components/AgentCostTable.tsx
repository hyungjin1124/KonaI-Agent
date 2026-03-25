import React from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { ChartWidget } from '../../../shared/molecules/ChartWidget';
import { MODEL_COST_DATA } from '../usageMonitoringData';

function formatTokens(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return String(value);
}

// Simple weekly trend sparkline (mock data for models)
const MODEL_TRENDS: Record<string, number[]> = {
  'GPT-4o': [180, 210, 195, 220, 205, 240, 230],
  'Claude 3.5 Sonnet': [110, 125, 118, 135, 128, 142, 138],
  'GPT-4o-mini': [40, 45, 42, 50, 48, 55, 52],
  'Claude 3 Haiku': [25, 30, 28, 32, 30, 35, 33],
};

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

export function AgentCostTable() {
  const totalCost = MODEL_COST_DATA.reduce((sum, m) => sum + m.cost, 0);

  return (
    <ChartWidget
      title="모델별 비용 분해"
      subtitle={`총 $${totalCost.toLocaleString()}`}
      height={220}
      insightSummary="GPT-4o가 전체 비용의 50%를 차지합니다. 경량 작업의 모델 전환으로 비용 절감 가능."
      insightDetail={
        <div className="space-y-3 text-sm">
          <p>모델별 비용 분석 결과, GPT-4o($1,420)가 전체 $2,847 중 50%를 차지하며 비용 최적화의 핵심 대상입니다.</p>
          <p>Claude 3.5 Sonnet($890, 31%)은 토큰당 비용 효율이 가장 높으며, GPT-4o-mini($320, 11%)는 경량 작업에 적합합니다.</p>
          <p><strong>권장 액션:</strong> 단순 질의 응답, 요약 등 경량 작업을 GPT-4o에서 GPT-4o-mini 또는 Claude 3 Haiku로 전환하면 월 $400~600 절감이 가능합니다.</p>
        </div>
      }
      expandTestId="model-cost-insight"
    >
      <div className="overflow-x-auto" data-testid="model-cost-table">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-2 text-xs font-bold text-gray-500">모델</th>
              <th className="text-right py-2 px-2 text-xs font-bold text-gray-500">토큰</th>
              <th className="text-right py-2 px-2 text-xs font-bold text-gray-500">비용 (USD)</th>
              <th className="text-right py-2 px-2 text-xs font-bold text-gray-500">비율</th>
              <th className="text-right py-2 px-2 text-xs font-bold text-gray-500">7일 트렌드</th>
            </tr>
          </thead>
          <tbody>
            {MODEL_COST_DATA.map((model) => (
              <tr key={model.name} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: model.color }} />
                    <span className="font-medium text-gray-900 text-xs">{model.name}</span>
                  </div>
                </td>
                <td className="text-right py-2 px-2 text-xs text-gray-600">{formatTokens(model.tokens)}</td>
                <td className="text-right py-2 px-2 text-xs font-bold text-gray-900">${model.cost.toLocaleString()}</td>
                <td className="text-right py-2 px-2 text-xs text-gray-600">{Math.round((model.cost / totalCost) * 100)}%</td>
                <td className="py-2 px-2 flex justify-end">
                  <SparkLine data={MODEL_TRENDS[model.name] || [0]} color={model.color} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartWidget>
  );
}
