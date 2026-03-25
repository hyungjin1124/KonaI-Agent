import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, AlertTriangle, Download } from '../../../icons';
import { KPICard } from '../../../shared/atoms/KPICard';
import { ChartWidget } from '../../../shared/molecules/ChartWidget';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../ui/table';
import {
  COST_SUMMARY,
  MODEL_COST_BREAKDOWN,
  DAILY_COST_DATA,
  COST_FORECAST_DATA,
  COST_MODEL_COLORS,
  MOCK_TENANT_COST,
} from '../data/costData';

const DAILY_COST_MODELS = ['GPT-4o', 'Claude Sonnet', 'Claude Opus', 'GPT-4o-mini', 'Claude Haiku'];

interface CostManagementTabProps {
  onNavigateToTab?: (tab: string) => void;
}

const CostManagementTab: React.FC<CostManagementTabProps> = ({ onNavigateToTab }) => {
  const { totalCost, efficiency, budgetUsage, forecast } = COST_SUMMARY;

  return (
    <div>
      {/* Data freshness */}
      <div className="flex justify-end mb-2">
        <span className="text-[11px] text-gray-400">마지막 업데이트: {new Date().toLocaleString('ko-KR')}</span>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard
          title="이번 달 총 비용"
          value={totalCost.value}
          change={totalCost.change}
          trend="up"
          icon={<TrendingUp size={14} />}
        />
        <KPICard
          title="비용 효율"
          value={efficiency.value}
          subtitle={efficiency.subtitle}
        />
        <KPICard
          title="예산 소진율"
          value={`${budgetUsage.percent}%`}
          subtitle={budgetUsage.value}
          footerBadge={
            budgetUsage.percent > 80
              ? <Badge variant="outline" className="rounded-full text-xs bg-amber-100 text-amber-700 border-amber-200">주의</Badge>
              : undefined
          }
        />
        <KPICard
          title="월말 예상 비용"
          value={forecast.value}
          subtitle={forecast.isOverBudget ? '예산(₩19,500,000) 초과 예상' : '예산 이내'}
          footerBadge={
            forecast.isOverBudget
              ? <Badge variant="outline" className="rounded-full text-xs bg-red-100 text-red-700 border-red-200">예산 초과</Badge>
              : undefined
          }
        />
      </div>

      {/* Budget over warning */}
      {forecast.isOverBudget && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-sm text-amber-800">
          <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
          <span>현재 추세 유지 시 이번 달 말 예상 비용이 예산을 초과할 것으로 예측됩니다.{' '}
            <button onClick={() => onNavigateToTab?.('alerts')} className="underline font-medium hover:text-amber-900">알림 규칙을 확인하세요 →</button>
          </span>
        </div>
      )}

      {/* Toolbar: period filter + export */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
          {['이번 달', '지난 달', '최근 3개월'].map(label => (
            <button key={label} className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-white text-gray-900 shadow-sm first:bg-white [&:not(:first-child)]:bg-transparent [&:not(:first-child)]:text-gray-500 [&:not(:first-child)]:shadow-none hover:text-gray-700">
              {label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <Download size={13} className="mr-1" />CSV 내보내기
        </Button>
      </div>

      {/* Charts row 1: donut + daily stacked bar */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-3 mb-4">
        {/* Model cost donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col">
          <div className="text-sm font-medium text-gray-900 mb-3">모델별 비용 분포</div>
          <div className="flex justify-center">
            <ResponsiveContainer width={180} height={160}>
              <PieChart>
                <Pie
                  data={MODEL_COST_BREAKDOWN}
                  dataKey="cost"
                  nameKey="modelName"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {MODEL_COST_BREAKDOWN.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 11 }}
                  formatter={(v: number) => [`₩${v.toLocaleString()}`, '비용']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-1">
            {MODEL_COST_BREAKDOWN.map(m => (
              <div key={m.modelName} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                  <span className="text-gray-700 truncate max-w-[130px]">{m.modelName}</span>
                </span>
                <span className="font-medium text-gray-900">{m.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily cost stacked bar */}
        <ChartWidget title="일별 모델별 비용 (₩)" height={240}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DAILY_COST_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: number) => [`₩${v}`, '']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {DAILY_COST_MODELS.map((model) => (
                <Bar
                  key={model}
                  dataKey={model}
                  stackId="cost"
                  fill={COST_MODEL_COLORS[model]}
                  radius={model === DAILY_COST_MODELS[DAILY_COST_MODELS.length - 1] ? [2, 2, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartWidget>
      </div>

      {/* Cost Forecast Chart */}
      <ChartWidget title="비용 예측 — 실적 / 예측 / 예산" height={220} className="mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={COST_FORECAST_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} interval={3} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₩${v}`} />
            <Tooltip
              contentStyle={{ fontSize: 11 }}
              formatter={(v: number) => [`₩${v.toLocaleString()}`, '']}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="actualCost"
              name="실적"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="forecastedCost"
              name="예측"
              stroke="#a78bfa"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="budget"
              name="예산"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartWidget>

      {/* Tenant cost table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/30">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">테넌트별 비용 내역</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs">테넌트</TableHead>
              <TableHead className="text-xs text-right">입력 토큰</TableHead>
              <TableHead className="text-xs text-right">출력 토큰</TableHead>
              <TableHead className="text-xs text-right">총 비용</TableHead>
              <TableHead className="text-xs text-right">예산 대비</TableHead>
              <TableHead className="text-xs text-right">전월 대비</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_TENANT_COST.map(row => (
              <TableRow key={row.tenantId}>
                <TableCell className="text-sm font-medium text-gray-900">{row.tenantName}</TableCell>
                <TableCell className="text-sm text-right text-gray-700">{row.inputTokens}</TableCell>
                <TableCell className="text-sm text-right text-gray-700">{row.outputTokens}</TableCell>
                <TableCell className="text-sm font-medium text-right text-gray-900">{row.totalCost}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className={`rounded-full text-xs font-medium ${
                    row.budgetPercent >= 90 ? 'bg-red-100 text-red-700 border-red-200' :
                    row.budgetPercent >= 70 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-green-100 text-green-700 border-green-200'
                  }`}>{row.budgetPercent}%</Badge>
                </TableCell>
                <TableCell className={`text-sm text-right font-medium ${
                  row.change.startsWith('+') ? 'text-red-600' : 'text-green-600'
                }`}>{row.change}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CostManagementTab;
