import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Activity, Download } from '../../../icons';
import { KPICard } from '../../../shared/atoms/KPICard';
import { ChartWidget } from '../../../shared/molecules/ChartWidget';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../ui/table';
import AgentTraceSection from './AgentTraceSection';
import {
  USAGE_SUMMARY, MOCK_TENANT_USAGE, DAILY_API_CALLS_30D, TOKEN_CONSUMPTION_30D,
} from '../data/usageAlertData';

const TENANT_COLORS: Record<string, string> = {
  '삼성전자': '#6366f1',
  '현대자동차': '#8b5cf6',
  '스타트업 A': '#a78bfa',
  'D 그룹': '#c4b5fd',
};

const levelBadge = (level: string, text: string) => {
  const style = level === 'normal'
    ? '' : level === 'warning'
    ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-red-100 text-red-700 border-red-200';
  if (level === 'normal') return <span className="text-xs text-gray-500">{text}</span>;
  return <Badge variant="outline" className={`rounded-full text-xs font-medium ${style}`}>{text}</Badge>;
};

const ActivityMonitoringTab: React.FC = () => {
  const [tenantFilter, setTenantFilter] = useState('전체 테넌트');
  const [periodFilter, setPeriodFilter] = useState('최근 30일');

  const filteredUsage = useMemo(
    () => tenantFilter === '전체 테넌트'
      ? MOCK_TENANT_USAGE
      : MOCK_TENANT_USAGE.filter(u => u.tenantName === tenantFilter),
    [tenantFilter]
  );

  return (
    <div>
      {/* Data freshness */}
      <div className="flex justify-end mb-2">
        <span className="text-[11px] text-gray-400">마지막 업데이트: {new Date().toLocaleString('ko-KR')}</span>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard title="총 API 호출 (이번 달)" value={USAGE_SUMMARY.totalApiCalls.value} change={USAGE_SUMMARY.totalApiCalls.change} trend="up" icon={<Activity size={14} />} />
        <KPICard title="총 토큰 소비" value={USAGE_SUMMARY.totalTokens.value} />
        <KPICard title="활성 에이전트 세션" value={USAGE_SUMMARY.activeSessions.value} />
        <KPICard title="평균 TTFT" value="1,240ms" subtitle="P95: 2,850ms" />
      </div>

      {/* Filters + Export */}
      <div className="flex items-center gap-2 mb-4">
        <select aria-label="테넌트 필터" value={tenantFilter} onChange={e => setTenantFilter(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300">
          <option>전체 테넌트</option><option>삼성전자</option><option>현대자동차</option>
        </select>
        <select aria-label="기간 필터" value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300">
          <option>최근 30일</option><option>최근 7일</option><option>최근 90일</option>
        </select>
        <Button variant="outline" size="sm" className="h-8 text-xs ml-auto">
          <Download size={13} className="mr-1" />CSV 내보내기
        </Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <ChartWidget title="API 호출량 추이" height={200}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DAILY_API_CALLS_30D} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              {Object.entries(TENANT_COLORS).map(([name, color]) => (
                <Area key={name} type="monotone" dataKey={name} stroke={color} fill={color} fillOpacity={0.15} strokeWidth={1.5} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartWidget>

        <ChartWidget title="토큰 소비 추이" height={200}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={TOKEN_CONSUMPTION_30D} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="inputTokens" name="Input" stackId="a" fill="#6366f1" />
              <Bar dataKey="outputTokens" name="Output" stackId="a" fill="#a78bfa" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWidget>
      </div>

      {/* Agent Trace Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">에이전트 트레이스</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
        <AgentTraceSection />
      </div>

      {/* Usage table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/30">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">테넌트별 사용량</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs">테넌트</TableHead>
              <TableHead className="text-xs">API 호출</TableHead>
              <TableHead className="text-xs">토큰</TableHead>
              <TableHead className="text-xs">에이전트 실행</TableHead>
              <TableHead className="text-xs">한도 대비</TableHead>
              <TableHead className="text-xs">알림 상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsage.map(row => (
              <TableRow key={row.tenantId}>
                <TableCell className="text-sm font-medium">{row.tenantName}</TableCell>
                <TableCell className="text-sm">{row.apiCalls}</TableCell>
                <TableCell className="text-sm">{row.tokens}</TableCell>
                <TableCell className="text-sm">{row.agentRuns}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`rounded-full text-xs font-medium ${
                    row.limitPercent >= 100 ? 'bg-red-100 text-red-700 border-red-200' :
                    row.limitPercent > 75 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-green-100 text-green-700 border-green-200'
                  }`}>{row.limitPercent}%</Badge>
                </TableCell>
                <TableCell>{levelBadge(row.alertLevel, row.alertStatus)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ActivityMonitoringTab;
