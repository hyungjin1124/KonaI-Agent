import React, { useState, useMemo } from 'react';
import {
  Search, Activity, Bot, AlertTriangle, Clock,
  User, Monitor, ArrowRight, ChevronDown, ChevronUp,
} from '../../icons';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../ui/sheet';
import { KPICard } from '../../shared/atoms/KPICard';
import {
  AUDIT_KPI_SUMMARY,
  MOCK_AUDIT_LOG_ENTRIES,
  TIME_RANGE_OPTIONS,
  ACTOR_TYPE_OPTIONS,
  ACTION_CATEGORY_OPTIONS,
  SEVERITY_OPTIONS,
  filterEntries,
  type AuditLogEntry,
  type TimeRange,
  type ActorType,
  type ActionCategory,
  type Severity,
} from './auditLogData';

// --- Sub-components ---

const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  const styles: Record<Severity, string> = {
    info: 'bg-gray-100 text-gray-600 border-gray-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    critical: 'bg-red-100 text-red-700 border-red-200',
  };
  const labels: Record<Severity, string> = {
    info: '정보',
    warning: '경고',
    critical: '위험',
  };
  return (
    <Badge variant="outline" className={`rounded-full font-bold text-[11px] ${styles[severity]}`}>
      {severity === 'warning' && <AlertTriangle size={10} className="mr-0.5" />}
      {severity === 'critical' && <AlertTriangle size={10} className="mr-0.5" />}
      {labels[severity]}
    </Badge>
  );
};

const ActorBadge: React.FC<{ type: ActorType; name: string }> = ({ type, name }) => {
  const icons: Record<ActorType, React.ReactNode> = {
    user: <User size={12} className="shrink-0" />,
    agent: <Bot size={12} className="shrink-0" />,
    system: <Monitor size={12} className="shrink-0" />,
  };
  const styles: Record<ActorType, string> = {
    user: 'text-blue-700 bg-blue-50 border-blue-100',
    agent: 'text-purple-700 bg-purple-50 border-purple-100',
    system: 'text-gray-600 bg-gray-50 border-gray-100',
  };
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${styles[type]}`}>
      {icons[type]}
      <span className="truncate max-w-[120px]">{name}</span>
    </div>
  );
};

const ResultBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    success: 'text-green-700',
    failure: 'text-red-600',
    partial: 'text-amber-600',
  };
  const labels: Record<string, string> = {
    success: '성공',
    failure: '실패',
    partial: '부분 성공',
  };
  return (
    <span className={`text-xs font-medium ${styles[status] ?? 'text-gray-500'}`}>
      {labels[status] ?? status}
    </span>
  );
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
}

// --- Detail Drawer ---

const AuditLogDetail: React.FC<{ entry: AuditLogEntry; onClose: () => void }> = ({ entry, onClose }) => (
  <Sheet open onOpenChange={(open) => { if (!open) onClose(); }}>
    <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
      <SheetHeader className="mb-6">
        <SheetTitle className="text-lg">{entry.action.type}</SheetTitle>
        <SheetDescription>
          {new Date(entry.timestamp).toLocaleString('ko-KR')}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">기본 정보</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400 text-xs">액터</span>
              <div className="mt-1"><ActorBadge type={entry.actor.type} name={entry.actor.name} /></div>
            </div>
            <div>
              <span className="text-gray-400 text-xs">심각도</span>
              <div className="mt-1"><SeverityBadge severity={entry.severity} /></div>
            </div>
            <div>
              <span className="text-gray-400 text-xs">리소스</span>
              <p className="mt-1 font-medium text-gray-900">{entry.resource.name}</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">결과</span>
              <div className="mt-1"><ResultBadge status={entry.result.status} /></div>
            </div>
          </div>
          {entry.result.details && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              {entry.result.details}
            </div>
          )}
        </div>

        {/* Session Info */}
        {entry.sessionId && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">세션 정보</h4>
            <p className="text-sm font-mono text-gray-600">{entry.sessionId}</p>
          </div>
        )}

        {/* Agent Reasoning */}
        {entry.reasoningSummary && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">에이전트 추론 요약</h4>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-sm text-purple-800">
              <Bot size={14} className="inline mr-1.5 -mt-0.5" />
              {entry.reasoningSummary}
            </div>
          </div>
        )}

        {/* Changes (before/after) */}
        {entry.changes && entry.changes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">변경 이력</h4>
            <div className="space-y-2">
              {entry.changes.map((change, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 mb-2">{change.field}</div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded font-mono text-xs line-through">
                      {change.before}
                    </span>
                    <ArrowRight size={14} className="text-gray-400 shrink-0" />
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded font-mono text-xs">
                      {change.after}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        {entry.metadata && Object.keys(entry.metadata).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">메타데이터</h4>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
              {Object.entries(entry.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-gray-500 font-mono">{key}</span>
                  <span className="text-gray-900 font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">상세 설명</h4>
          <p className="text-sm text-gray-600">{entry.action.description}</p>
        </div>

        {/* ID */}
        <div className="pt-4 border-t text-xs text-gray-400 font-mono">
          ID: {entry.id}
        </div>
      </div>
    </SheetContent>
  </Sheet>
);

// --- Main View ---

const ITEMS_PER_PAGE = 20;

export const AuditLogView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [actorFilter, setActorFilter] = useState<ActorType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ActionCategory | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const filteredEntries = useMemo(
    () => filterEntries(MOCK_AUDIT_LOG_ENTRIES, {
      timeRange,
      actorType: actorFilter,
      category: categoryFilter,
      severity: severityFilter,
      search: searchQuery,
    }),
    [timeRange, actorFilter, categoryFilter, severityFilter, searchQuery]
  );

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (value: T) => {
      setter(value);
      setCurrentPage(1);
    };

  const kpi = AUDIT_KPI_SUMMARY;

  return (
    <div className="space-y-6" data-testid="audit-log-view">
      {/* KPI Summary Bar */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="총 이벤트"
          value={kpi.totalEvents.value}
          change={kpi.totalEvents.change}
          trend={kpi.totalEvents.trend}
          icon={<Activity size={14} />}
        />
        <KPICard
          title="에이전트 액션"
          value={kpi.agentActions.value}
          change={kpi.agentActions.change}
          trend={kpi.agentActions.trend}
          icon={<Bot size={14} />}
        />
        <KPICard
          title="경고"
          value={kpi.warnings.value}
          change={kpi.warnings.change}
          trend={kpi.warnings.trend}
          icon={<AlertTriangle size={14} />}
        />
        <KPICard
          title="최근 24시간"
          value={kpi.recentActivity.value}
          change={kpi.recentActivity.change}
          trend={kpi.recentActivity.trend}
          icon={<Clock size={14} />}
        />
      </div>

      {/* Filter Panel */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700"
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          aria-expanded={filtersExpanded}
          aria-controls="audit-log-filters"
        >
          <span>필터</span>
          {filtersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {filtersExpanded && (
          <div id="audit-log-filters" className="px-4 pb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="액터, 액션, 리소스 검색..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-9 h-9 text-sm"
                aria-label="감사 로그 검색"
              />
            </div>
            <Select value={timeRange} onValueChange={handleFilterChange(setTimeRange)}>
              <SelectTrigger className="w-[140px] h-9 text-sm" aria-label="시간 범위">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actorFilter} onValueChange={handleFilterChange(setActorFilter)}>
              <SelectTrigger className="w-[130px] h-9 text-sm" aria-label="액터 타입">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTOR_TYPE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={handleFilterChange(setCategoryFilter)}>
              <SelectTrigger className="w-[130px] h-9 text-sm" aria-label="액션 카테고리">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_CATEGORY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={handleFilterChange(setSeverityFilter)}>
              <SelectTrigger className="w-[130px] h-9 text-sm" aria-label="심각도">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Log Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-[130px]">타임스탬프</TableHead>
                <TableHead className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">액터</TableHead>
                <TableHead className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">액션</TableHead>
                <TableHead className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">리소스</TableHead>
                <TableHead className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-[80px]">결과</TableHead>
                <TableHead className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-[80px]">심각도</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEntries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className="cursor-pointer hover:bg-blue-50/50 transition-colors"
                  onClick={() => setSelectedEntry(entry)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${entry.action.type} — ${entry.actor.name}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedEntry(entry); } }}
                >
                  <TableCell className="px-4 py-3 text-xs text-gray-500 font-mono whitespace-nowrap">
                    {formatTimestamp(entry.timestamp)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <ActorBadge type={entry.actor.type} name={entry.actor.name} />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700 max-w-[250px] truncate">
                    {entry.action.type}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 max-w-[180px] truncate">
                    {entry.resource.name}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <ResultBadge status={entry.result.status} />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <SeverityBadge severity={entry.severity} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Empty State */}
        {paginatedEntries.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            검색 조건에 맞는 로그가 없습니다.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {filteredEntries.length}건 중 {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredEntries.length)}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedEntry && (
        <AuditLogDetail
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
};
