import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Search, Download, FileText, RefreshCw } from '../../../icons';
import { KPICard } from '../../../shared/atoms/KPICard';
import { ChartWidget } from '../../../shared/molecules/ChartWidget';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../ui/table';
import {
  PLATFORM_AUDIT_SUMMARY, MOCK_PLATFORM_AUDIT_EVENTS,
  EVENT_TYPE_OPTIONS, SEVERITY_OPTIONS, PERIOD_OPTIONS, TENANT_FILTER_OPTIONS,
  filterAuditEvents, EVENT_TYPE_DISTRIBUTION, HOURLY_VOLUME,
} from '../data/auditLogData';
import type { PlatformAuditViewMode, PlatformAuditEvent, PlatformSeverity } from '../data/platformAdminTypes';

const ITEMS_PER_PAGE = 6;

const severityBadge = (severity: PlatformSeverity) => {
  const style = severity === 'Critical'
    ? 'bg-red-100 text-red-700 border-red-200'
    : severity === 'Warning'
    ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-blue-100 text-blue-700 border-blue-200';
  return <Badge variant="outline" className={`rounded-full text-xs font-medium ${style}`}>{severity}</Badge>;
};

const eventIcon = (severity: PlatformSeverity) => {
  const style = severity === 'Critical'
    ? 'bg-red-100 text-red-600'
    : severity === 'Warning'
    ? 'bg-amber-100 text-amber-600'
    : severity === 'Info'
    ? 'bg-green-100 text-green-600'
    : 'bg-blue-100 text-blue-600';
  const symbol = severity === 'Critical' ? '!' : severity === 'Warning' ? '⚙' : '+';
  return (
    <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs flex-shrink-0 ${style}`}>
      {symbol}
    </div>
  );
};

const PlatformAuditLogTab: React.FC = () => {
  const [viewMode, setViewMode] = useState<PlatformAuditViewMode>('timeline');
  const [tenantFilter, setTenantFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('24h');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const POLL_INTERVAL_MS = 30_000;

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    // In production: re-fetch audit events from API here
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 600);
  }, []);

  useEffect(() => {
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  const filteredEvents = useMemo(
    () => filterAuditEvents(MOCK_PLATFORM_AUDIT_EVENTS, {
      tenant: tenantFilter,
      eventType: eventTypeFilter,
      severity: severityFilter,
      search: searchQuery,
    }),
    [tenantFilter, eventTypeFilter, severityFilter, searchQuery]
  );

  const pagedEvents = filteredEvents.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);

  const handleExport = (format: 'csv' | 'json') => {
    const data = filteredEvents.map(e => ({
      timestamp: e.timestamp, action: e.action, description: e.description,
      actor: e.actor, ip: e.ip, severity: e.severity, detail: e.detail,
    }));
    if (data.length === 0) return; // I-1: empty array guard
    const escapeCSV = (v: unknown): string => {
      const s = String(v ?? '');
      // I-2: prefix injection chars to prevent formula execution
      const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
      return safe.includes(',') || safe.includes('\n') || safe.includes('"')
        ? `"${safe.replace(/"/g, '""')}"`
        : safe;
    };
    const content = format === 'json'
      ? JSON.stringify(data, null, 2)
      : [Object.keys(data[0]).join(','), ...data.map(r => Object.values(r).map(escapeCSV).join(','))].join('\n');
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `platform-audit-log.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard title="오늘 이벤트" value={PLATFORM_AUDIT_SUMMARY.todayEvents.value} icon={<FileText size={14} />} />
        <KPICard title="경고 이벤트 (이번 주)" value={PLATFORM_AUDIT_SUMMARY.weeklyWarnings.value} />
        <KPICard title="활동 테넌트" value={PLATFORM_AUDIT_SUMMARY.activeTenants.value} />
        <KPICard title="마지막 내보내기" value={PLATFORM_AUDIT_SUMMARY.lastExport.value} subtitle={PLATFORM_AUDIT_SUMMARY.lastExport.subtitle} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <select value={tenantFilter} onChange={e => { setTenantFilter(e.target.value); setPage(0); }} className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700">
          {TENANT_FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={eventTypeFilter} onChange={e => { setEventTypeFilter(e.target.value); setPage(0); }} className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700">
          {EVENT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={severityFilter} onChange={e => { setSeverityFilter(e.target.value); setPage(0); }} className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700">
          {SEVERITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={periodFilter} onChange={e => { setPeriodFilter(e.target.value); setPage(0); }} className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700">
          {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="relative flex-1 max-w-[200px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
            placeholder="행위자, IP, 리소스 검색..."
            className="h-8 text-xs pl-8"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] text-gray-400 whitespace-nowrap">
            {isRefreshing ? '새로고침 중...' : `업데이트: ${lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[11px]"
            onClick={refresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={12} className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />새로고침
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-[11px]" onClick={() => handleExport('csv')}>
            <Download size={12} className="mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-[11px]" onClick={() => handleExport('json')}>
            <Download size={12} className="mr-1" /> JSON
          </Button>
        </div>
      </div>

      {/* View toggle + event list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">이벤트 타임라인</span>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setViewMode('timeline')} className={`text-[11px] px-2.5 py-1 rounded-md transition-all ${viewMode === 'timeline' ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500'}`}>
              타임라인
            </button>
            <button onClick={() => setViewMode('table')} className={`text-[11px] px-2.5 py-1 rounded-md transition-all ${viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500'}`}>
              테이블
            </button>
          </div>
        </div>

        {viewMode === 'timeline' ? (
          <div className="p-3">
            {pagedEvents.map(event => (
              <TimelineItem
                key={event.id}
                event={event}
                expanded={expandedEventId === event.id}
                onToggle={() => setExpandedEventId(prev => prev === event.id ? null : event.id)}
              />
            ))}
            {pagedEvents.length === 0 && (
              <p className="text-xs text-gray-400 py-6 text-center">일치하는 이벤트가 없습니다.</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs">시각</TableHead>
                <TableHead className="text-xs">액션</TableHead>
                <TableHead className="text-xs">설명</TableHead>
                <TableHead className="text-xs">행위자</TableHead>
                <TableHead className="text-xs">IP</TableHead>
                <TableHead className="text-xs">심각도</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedEvents.map(e => (
                <React.Fragment key={e.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedEventId(prev => prev === e.id ? null : e.id)}
                  >
                    <TableCell className="text-xs text-gray-500">{e.timestamp}</TableCell>
                    <TableCell className="text-sm font-medium">{e.action}</TableCell>
                    <TableCell className="text-xs text-gray-600">{e.description}</TableCell>
                    <TableCell className="text-xs text-gray-500">{e.actor}</TableCell>
                    <TableCell className="text-xs text-gray-500 font-mono">{e.ip}</TableCell>
                    <TableCell>{severityBadge(e.severity)}</TableCell>
                  </TableRow>
                  {expandedEventId === e.id && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-gray-50/80 px-4 py-3">
                        <EventDetailPanel event={e} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-6">
        <span>{filteredEvents.length === 0 ? '결과 없음' : `총 ${filteredEvents.length}건 중 ${page * ITEMS_PER_PAGE + 1}-${Math.min((page + 1) * ITEMS_PER_PAGE, filteredEvents.length)}`}</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-7 text-[11px]" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← 이전</Button>
          <Button variant="outline" size="sm" className="h-7 text-[11px]" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>다음 →</Button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 my-6" />

      {/* Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartWidget title="이벤트 유형별 분포 (7일)" height={180}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={EVENT_TYPE_DISTRIBUTION} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="type" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWidget>

        <ChartWidget title="시간대별 이벤트 볼륨" height={180}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HOURLY_VOLUME} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="info" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} stackId="1" />
              <Area type="monotone" dataKey="warning" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} stackId="1" />
              <Area type="monotone" dataKey="critical" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} stackId="1" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWidget>
      </div>
    </div>
  );
};

// Shared detail panel for expanded event
const EventDetailPanel: React.FC<{ event: PlatformAuditEvent }> = ({ event }) => (
  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
    <div>
      <span className="text-gray-400">이벤트 유형</span>
      <p className="font-medium text-gray-700 mt-0.5">{event.eventType}</p>
    </div>
    <div>
      <span className="text-gray-400">심각도</span>
      <p className="mt-0.5">{severityBadge(event.severity)}</p>
    </div>
    {event.tenantName && (
      <div>
        <span className="text-gray-400">테넌트</span>
        <p className="font-medium text-gray-700 mt-0.5">{event.tenantName}</p>
      </div>
    )}
    <div>
      <span className="text-gray-400">행위자 / IP</span>
      <p className="font-medium text-gray-700 mt-0.5">{event.actor} · <span className="font-mono">{event.ip}</span></p>
    </div>
    <div className="col-span-2">
      <span className="text-gray-400">상세 정보</span>
      <p className="font-mono text-gray-600 mt-0.5 px-2 py-1.5 bg-white rounded border border-gray-200 leading-relaxed">{event.detail}</p>
    </div>
  </div>
);

// Timeline item sub-component
const TimelineItem: React.FC<{ event: PlatformAuditEvent; expanded: boolean; onToggle: () => void }> = ({ event, expanded, onToggle }) => (
  <div
    className="py-2 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50/50 rounded-md transition-colors"
    onClick={onToggle}
  >
    <div className="flex gap-3">
      {eventIcon(event.severity)}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-900 leading-relaxed">
          <strong className="font-medium">{event.action}</strong> — {event.description}
        </div>
        <div className="flex gap-2 text-[11px] text-gray-400 mt-0.5">
          <span>{event.actor}</span>
          <span>IP {event.ip}</span>
          <span>{event.timestamp}</span>
        </div>
        {!expanded && (
          <div className="text-[11px] text-gray-600 font-mono mt-1 px-2 py-1 bg-gray-50 rounded-md inline-block">
            {event.detail}
          </div>
        )}
      </div>
      {severityBadge(event.severity)}
    </div>
    {expanded && (
      <div className="mt-2 ml-10 p-3 bg-gray-50/80 rounded-lg border border-gray-100">
        <EventDetailPanel event={event} />
      </div>
    )}
  </div>
);

export default PlatformAuditLogTab;
