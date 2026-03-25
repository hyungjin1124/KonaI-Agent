import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { AlertCircle, TrendingDown, TrendingUp } from '../../../icons';
import { KPICard } from '../../../shared/atoms/KPICard';
import { ChartWidget } from '../../../shared/molecules/ChartWidget';
import { Badge } from '../../../ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../ui/table';
import {
  ERROR_KPI, MOCK_ERRORS, ERROR_RATE_TIMESERIES,
  ERROR_CATEGORY_LABELS, ERROR_SEVERITY_LABELS,
} from '../data/errorData';
import type { PlatformError, ErrorCategory, ErrorSeverity } from '../data/platformAdminTypes';

const SEVERITY_STYLE: Record<ErrorSeverity, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
};

const CATEGORY_COLORS: Record<string, string> = {
  timeout: '#ef4444',
  validation: '#f59e0b',
  permission: '#8b5cf6',
  rate_limit: '#f97316',
  model_error: '#ec4899',
  internal: '#dc2626',
  network: '#6366f1',
  unknown: '#94a3b8',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// Build chart data for category distribution
function buildCategoryChartData(errors: PlatformError[]) {
  const counts: Record<string, number> = {};
  for (const e of errors) {
    counts[e.category] = (counts[e.category] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([category, count]) => ({
      category: ERROR_CATEGORY_LABELS[category] || category,
      count,
      fill: CATEGORY_COLORS[category] || '#94a3b8',
    }))
    .sort((a, b) => b.count - a.count);
}

const ErrorDashboardTab: React.FC = () => {
  const [tenantFilter, setTenantFilter] = useState('전체');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [selectedError, setSelectedError] = useState<PlatformError | null>(null);

  const tenantOptions = useMemo(() => {
    const names = [...new Set(MOCK_ERRORS.map(e => e.tenantName))];
    return ['전체', ...names];
  }, []);

  const categoryOptions = useMemo(() => {
    const cats = [...new Set(MOCK_ERRORS.map(e => e.category))];
    return ['전체', ...cats];
  }, []);

  const filtered = useMemo(() => {
    return MOCK_ERRORS.filter(e => {
      if (tenantFilter !== '전체' && e.tenantName !== tenantFilter) return false;
      if (categoryFilter !== '전체' && e.category !== categoryFilter) return false;
      return true;
    });
  }, [tenantFilter, categoryFilter]);

  const categoryChartData = useMemo(() => buildCategoryChartData(filtered), [filtered]);

  const kpi = ERROR_KPI;
  const trendIcon = kpi.errorRateTrend === 'increasing'
    ? <TrendingUp size={14} className="text-red-500" />
    : kpi.errorRateTrend === 'decreasing'
    ? <TrendingDown size={14} className="text-green-500" />
    : undefined;

  const trendLabel = kpi.errorRateTrend === 'increasing' ? '증가' : kpi.errorRateTrend === 'decreasing' ? '감소' : '안정';

  return (
    <div>
      {/* Data freshness */}
      <div className="flex justify-end mb-2">
        <span className="text-[11px] text-gray-400">마지막 업데이트: {new Date().toLocaleString('ko-KR')}</span>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <KPICard title="24시간 에러" value={String(kpi.totalErrors24h)} icon={<AlertCircle size={14} />} />
        <KPICard
          title="Critical"
          value={String(kpi.criticalCount)}
          footerBadge={
            kpi.criticalCount > 0
              ? <Badge variant="outline" className="rounded-full text-xs bg-red-100 text-red-700 border-red-200">즉시 조치</Badge>
              : undefined
          }
        />
        <KPICard title="최빈 에러 유형" value={ERROR_CATEGORY_LABELS[kpi.topCategory] || kpi.topCategory} />
        <KPICard title="추세" value={trendLabel} icon={trendIcon} />
        <KPICard title="영향 테넌트" value={String(kpi.affectedTenants)} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <select
          aria-label="테넌트 필터"
          value={tenantFilter}
          onChange={e => setTenantFilter(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          {tenantOptions.map(opt => <option key={opt}>{opt}</option>)}
        </select>
        <select
          aria-label="에러 유형 필터"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          <option value="전체">전체 유형</option>
          {categoryOptions.filter(c => c !== '전체').map(cat => (
            <option key={cat} value={cat}>{ERROR_CATEGORY_LABELS[cat] || cat}</option>
          ))}
        </select>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length}건</span>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <ChartWidget title="시간별 에러율" height={200}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ERROR_RATE_TIMESERIES} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="total" name="총 에러" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWidget>

        <ChartWidget title="에러 유형별 분포" height={200}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} tickLine={false} width={70} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="count" name="건수" radius={[0, 4, 4, 0]}>
                {categoryChartData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartWidget>
      </div>

      {/* Error table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs">시간</TableHead>
              <TableHead className="text-xs">테넌트</TableHead>
              <TableHead className="text-xs">유형</TableHead>
              <TableHead className="text-xs">심각도</TableHead>
              <TableHead className="text-xs">메시지</TableHead>
              <TableHead className="text-xs text-center">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-sm text-gray-400">
                  에러가 없습니다.
                </TableCell>
              </TableRow>
            )}
            {filtered.map(err => (
              <TableRow
                key={err.errorId}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedError(selectedError?.errorId === err.errorId ? null : err)}
              >
                <TableCell className="text-xs text-gray-500 font-mono whitespace-nowrap">{formatTime(err.occurredAt)}</TableCell>
                <TableCell className="text-sm font-medium text-gray-900">{err.tenantName}</TableCell>
                <TableCell>
                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                    {ERROR_CATEGORY_LABELS[err.category] || err.category}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`rounded-full text-xs font-medium ${SEVERITY_STYLE[err.severity]}`}>
                    {ERROR_SEVERITY_LABELS[err.severity]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-700 max-w-[300px] truncate" title={err.message}>{err.message}</TableCell>
                <TableCell className="text-center">
                  {err.resolved
                    ? <Badge variant="outline" className="rounded-full text-xs bg-green-100 text-green-700 border-green-200">해결됨</Badge>
                    : <Badge variant="outline" className="rounded-full text-xs bg-red-100 text-red-700 border-red-200">미해결</Badge>
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail slide-over */}
      {selectedError && (
        <>
          <div className="fixed inset-0 z-30 bg-black/20" onClick={() => setSelectedError(null)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="에러 상세"
            className="fixed inset-y-0 right-0 z-40 w-[460px] max-w-full bg-white shadow-2xl overflow-y-auto animate-slide-in-right"
          >
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">에러 상세</h3>
                <button onClick={() => setSelectedError(null)} aria-label="닫기" className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`rounded-full text-xs font-medium ${SEVERITY_STYLE[selectedError.severity]}`}>
                  {ERROR_SEVERITY_LABELS[selectedError.severity]}
                </Badge>
                {selectedError.resolved
                  ? <Badge variant="outline" className="rounded-full text-xs bg-green-100 text-green-700 border-green-200">해결됨</Badge>
                  : <Badge variant="outline" className="rounded-full text-xs bg-red-100 text-red-700 border-red-200">미해결</Badge>
                }
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="text-sm text-gray-900 font-medium">{selectedError.message}</div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">테넌트</span>
                  <p className="font-medium text-gray-900">{selectedError.tenantName}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">유형</span>
                  <p className="font-medium text-gray-900">{ERROR_CATEGORY_LABELS[selectedError.category]}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">엔드포인트</span>
                  <p className="font-mono text-xs text-gray-900 break-all">{selectedError.endpoint}</p>
                </div>
                {selectedError.model && (
                  <div>
                    <span className="text-gray-500 text-xs">모델</span>
                    <p className="font-medium text-gray-900">{selectedError.model}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 text-xs">발생 시간</span>
                  <p className="font-mono text-xs text-gray-900">{formatTime(selectedError.occurredAt)}</p>
                </div>
                {selectedError.conversationId && (
                  <div>
                    <span className="text-gray-500 text-xs">관련 대화</span>
                    <p className="font-mono text-xs text-blue-600">{selectedError.conversationId}</p>
                  </div>
                )}
              </div>

              {selectedError.stackTrace && (
                <>
                  <div className="h-px bg-gray-100" />
                  <div>
                    <span className="text-xs font-medium text-gray-500 mb-1.5 block">스택 트레이스</span>
                    <pre className="text-[11px] text-gray-700 bg-gray-50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap font-mono">
                      {selectedError.stackTrace}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ErrorDashboardTab;
