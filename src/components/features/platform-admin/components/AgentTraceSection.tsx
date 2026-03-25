import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from '../../../ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../ui/table';
import { CheckCircle2, AlertCircle, Clock } from '../../../icons';
import TraceWaterfallPanel from './TraceWaterfallPanel';
import SkillUsageTable from './SkillUsageTable';
import {
  AGENT_PERFORMANCE_METRICS,
  MOCK_AGENT_TRACES,
  MOCK_SKILL_USAGE,
  TRACE_STATUS_DIST,
} from '../data/activityData';
import type { AgentTrace } from '../data/platformAdminTypes';

type SubView = 'trace' | 'skill';

const statusConfig = {
  success: { icon: <CheckCircle2 size={13} className="text-green-600" />, label: '성공', cls: 'bg-green-100 text-green-700 border-green-200' },
  failure: { icon: <AlertCircle size={13} className="text-red-500" />, label: '실패', cls: 'bg-red-100 text-red-700 border-red-200' },
  timeout: { icon: <Clock size={13} className="text-amber-500" />, label: '타임아웃', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
};

const MetricCard: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex flex-col gap-0.5">
    <div className="text-[11px] text-gray-500">{label}</div>
    <div className="text-lg font-semibold text-gray-900">{value}</div>
    {sub && <div className="text-[10px] text-gray-400">{sub}</div>}
  </div>
);

type TraceStatus = 'all' | 'success' | 'failure' | 'timeout';

const AgentTraceSection: React.FC = () => {
  const [subView, setSubView] = useState<SubView>('trace');
  const [selectedTrace, setSelectedTrace] = useState<AgentTrace | null>(null);
  const [statusFilter, setStatusFilter] = useState<TraceStatus>('all');
  const [tenantFilter, setTenantFilter] = useState('all');
  const m = AGENT_PERFORMANCE_METRICS;

  const uniqueTenants = useMemo(() => [...new Set(MOCK_AGENT_TRACES.map(t => t.tenantName))].sort(), []);

  const filteredTraces = useMemo(() =>
    MOCK_AGENT_TRACES.filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (tenantFilter !== 'all' && t.tenantName !== tenantFilter) return false;
      return true;
    }),
    [statusFilter, tenantFilter],
  );

  return (
    <div className="mt-4">
      {/* Sub-tab toggle */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-0.5 w-fit">
        {([['trace', '에이전트 트레이스'], ['skill', '스킬 사용 분석']] as [SubView, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSubView(id)}
            className={`text-xs px-4 py-1.5 rounded-md transition-all ${
              subView === id ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {subView === 'trace' && (
        <>
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <MetricCard label="TTFT P50" value={`${m.p50TtftMs}ms`} sub="중앙값" />
            <MetricCard label="TTFT P95" value={`${m.p95TtftMs}ms`} sub="95 백분위" />
            <MetricCard label="TTFT P99" value={`${m.p99TtftMs}ms`} sub="99 백분위" />
            <MetricCard label="평균 레이턴시" value={`${(m.avgLatencyMs / 1000).toFixed(2)}s`} sub={`성공률 ${m.successRate}%`} />
          </div>

          {/* Status donut + trace table */}
          <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-3 mb-4">
            {/* Donut */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center">
              <div className="text-xs font-medium text-gray-600 mb-2">실행 결과 분포</div>
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={TRACE_STATUS_DIST} dataKey="value" innerRadius={35} outerRadius={55} paddingAngle={3}>
                    {TRACE_STATUS_DIST.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: number) => [v.toLocaleString(), '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1 mt-2 w-full">
                {TRACE_STATUS_DIST.map(s => (
                  <div key={s.name} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ background: s.fill }} />
                      {s.name}
                    </span>
                    <span className="font-medium text-gray-700">{s.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trace list table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">최근 트레이스</span>
                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as TraceStatus)}
                    className="h-7 text-[11px] border border-gray-200 rounded-md px-2 bg-white text-gray-600"
                  >
                    <option value="all">전체 상태</option>
                    <option value="success">성공</option>
                    <option value="failure">실패</option>
                    <option value="timeout">타임아웃</option>
                  </select>
                  <select
                    value={tenantFilter}
                    onChange={e => setTenantFilter(e.target.value)}
                    className="h-7 text-[11px] border border-gray-200 rounded-md px-2 bg-white text-gray-600"
                  >
                    <option value="all">전체 테넌트</option>
                    {uniqueTenants.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs">에이전트</TableHead>
                    <TableHead className="text-xs">테넌트</TableHead>
                    <TableHead className="text-xs">상태</TableHead>
                    <TableHead className="text-xs text-right">TTFT</TableHead>
                    <TableHead className="text-xs text-right">실행 시간</TableHead>
                    <TableHead className="text-xs text-right">토큰</TableHead>
                    <TableHead className="text-xs text-right">비용</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTraces.map(trace => {
                    const sc = statusConfig[trace.status];
                    return (
                      <TableRow
                        key={trace.traceId}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setSelectedTrace(trace)}
                      >
                        <TableCell className="text-sm font-medium text-gray-900">{trace.agentName}</TableCell>
                        <TableCell className="text-sm text-gray-600">{trace.tenantName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`rounded-full text-xs flex items-center gap-1 w-fit ${sc.cls}`}>
                            {sc.icon}{sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-right text-gray-700">
                          {trace.ttftMs > 0 ? `${trace.ttftMs}ms` : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-right text-gray-700">
                          {(trace.durationMs / 1000).toFixed(2)}s
                        </TableCell>
                        <TableCell className="text-sm text-right text-gray-700">
                          {trace.tokenCount > 0 ? trace.tokenCount.toLocaleString() : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-right text-gray-700">
                          {trace.cost > 0 ? `$${trace.cost.toFixed(3)}` : '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}

      {subView === 'skill' && <SkillUsageTable data={MOCK_SKILL_USAGE} />}

      {/* Waterfall slide panel */}
      {selectedTrace && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelectedTrace(null)}
          />
          <TraceWaterfallPanel
            trace={selectedTrace}
            onClose={() => setSelectedTrace(null)}
          />
        </>
      )}
    </div>
  );
};

export default AgentTraceSection;
