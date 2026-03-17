/**
 * FeedbackQualityView — Feedback & Quality Management Dashboard
 *
 * Admin quality dashboard with:
 * - 4 KPI summary cards (satisfaction, quality, total feedback, unresolved)
 * - Quality trend chart (Recharts LineChart)
 * - Feedback list table with filters
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  ThumbsUp, ThumbsDown, TrendingUp, TrendingDown,
  Search, MessageSquare, Target, AlertTriangle, User, Bot,
} from '../../icons';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../ui/sheet';
import {
  type FeedbackItem,
  type PeriodFilter,
  type FeedbackFilter,
  type AgentFilter,
  QUALITY_KPI,
  MOCK_FEEDBACK,
  PERIOD_OPTIONS,
  FEEDBACK_FILTER_OPTIONS,
  getDailyQualityByPeriod,
  filterFeedback,
  getUniqueAgents,
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

// --- Feedback Type Badge ---
function FeedbackBadge({ type }: { type: FeedbackItem['feedbackType'] }) {
  if (type === 'positive') {
    return (
      <Badge variant="outline" className="text-xs font-medium gap-1 bg-green-50 text-green-700 border-green-200">
        <ThumbsUp size={10} /> 긍정
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs font-medium gap-1 bg-red-50 text-red-700 border-red-200">
      <ThumbsDown size={10} /> 부정
    </Badge>
  );
}

// --- Status Badge (read-only) ---
function StatusBadge({ status }: { status: FeedbackItem['status'] }) {
  const styles = {
    reviewed: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    resolved: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  const labels = { reviewed: '검토됨', pending: '미검토', resolved: '조치완료' };
  return (
    <Badge variant="outline" className={`text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </Badge>
  );
}

// --- Status Select (editable) ---
const STATUS_OPTIONS: { value: FeedbackItem['status']; label: string }[] = [
  { value: 'pending', label: '미검토' },
  { value: 'reviewed', label: '검토됨' },
  { value: 'resolved', label: '조치완료' },
];

function StatusSelect({ status, onChange }: {
  status: FeedbackItem['status'];
  onChange: (newStatus: FeedbackItem['status']) => void;
}) {
  const styles: Record<string, string> = {
    reviewed: 'text-green-700',
    pending: 'text-amber-700',
    resolved: 'text-blue-700',
  };
  return (
    <Select value={status} onValueChange={(v) => onChange(v as FeedbackItem['status'])}>
      <SelectTrigger className={`h-7 w-[100px] text-xs font-medium border-gray-200 ${styles[status]}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map(opt => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// --- Feedback Detail Drawer ---
function FeedbackDetail({ item, onClose, onStatusChange }: {
  item: FeedbackItem;
  onClose: () => void;
  onStatusChange: (id: string, status: FeedbackItem['status']) => void;
}) {
  return (
    <Sheet open onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-lg">피드백 상세</SheetTitle>
          <SheetDescription>{item.date} · {item.userName}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">기본 정보</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400 text-xs">사용자</span>
                <div className="mt-1 flex items-center gap-1.5">
                  <User size={14} className="text-gray-400" />
                  <span className="font-medium text-gray-900">{item.userName}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-400 text-xs">에이전트</span>
                <div className="mt-1 flex items-center gap-1.5">
                  <Bot size={14} className="text-purple-500" />
                  <span className="font-medium text-gray-900">{item.agentName}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-400 text-xs">피드백</span>
                <div className="mt-1"><FeedbackBadge type={item.feedbackType} /></div>
              </div>
              <div>
                <span className="text-gray-400 text-xs">상태</span>
                <div className="mt-1">
                  <StatusSelect status={item.status} onChange={(s) => onStatusChange(item.id, s)} />
                </div>
              </div>
            </div>
          </div>

          {/* Response Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">응답 요약</h4>
            <p className="text-sm text-gray-700">{item.responseSummary}</p>
          </div>

          {/* User Comment */}
          {item.comment && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">사용자 코멘트</h4>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-800">
                {item.comment}
              </div>
            </div>
          )}

          {/* Conversation Context */}
          {item.conversationContext && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">대화 컨텍스트</h4>
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <User size={12} className="text-blue-600" />
                    <span className="text-xs font-bold text-blue-700">사용자 질문</span>
                  </div>
                  <p className="text-sm text-blue-800">{item.conversationContext.userQuery}</p>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Bot size={12} className="text-purple-600" />
                    <span className="text-xs font-bold text-purple-700">에이전트 응답</span>
                  </div>
                  <p className="text-sm text-purple-800">{item.conversationContext.agentResponse}</p>
                </div>
              </div>
            </div>
          )}

          {/* ID */}
          <div className="pt-4 border-t text-xs text-gray-400 font-mono">
            ID: {item.id}
          </div>
        </div>
      </SheetContent>
    </Sheet>
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

// --- Main Component ---
export function FeedbackQualityView() {
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [feedbackFilter, setFeedbackFilter] = useState<FeedbackFilter>('all');
  const [agentFilter, setAgentFilter] = useState<AgentFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(MOCK_FEEDBACK);

  const kpi = QUALITY_KPI;
  const agentOptions = useMemo(() => getUniqueAgents(feedbackItems), [feedbackItems]);
  const dailyData = useMemo(() => getDailyQualityByPeriod(period), [period]);
  const filteredFeedback = useMemo(
    () => filterFeedback(feedbackItems, feedbackFilter, searchQuery, period, agentFilter),
    [feedbackItems, feedbackFilter, searchQuery, period, agentFilter],
  );

  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);

  const handleStatusChange = useCallback((id: string, newStatus: FeedbackItem['status']) => {
    setFeedbackItems(prev => prev.map(item =>
      item.id === id ? { ...item, status: newStatus } : item
    ));
    // Also update selectedItem if the drawer is open for this item
    setSelectedItem(prev => prev?.id === id ? { ...prev, status: newStatus } : prev);
  }, []);

  return (
    <div className="space-y-6" data-testid="feedback-quality-view">
      {/* Header + Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">피드백 & 품질 관리</h3>
          <p className="text-sm text-gray-500 mt-0.5">에이전트 응답 품질과 사용자 피드백을 모니터링합니다.</p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg self-start sm:self-auto" role="group" aria-label="기간 선택" data-testid="period-filter">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-cards">
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
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5" data-testid="quality-chart">
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

      {/* Feedback Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-gray-900">피드백 목록</h4>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-sm"
                aria-label="피드백 검색"
              />
            </div>
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="w-[160px] h-8 text-sm" aria-label="에이전트 필터" data-testid="agent-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {agentOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg" role="group" aria-label="피드백 유형 필터" data-testid="feedback-filter">
              {FEEDBACK_FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFeedbackFilter(opt.value)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                    feedbackFilter === opt.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-pressed={feedbackFilter === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">날짜</TableHead>
                <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">사용자</TableHead>
                <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">응답 요약</TableHead>
                <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">피드백</TableHead>
                <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">코멘트</TableHead>
                <TableHead className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedback.map(item => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-blue-50/50 transition-colors"
                  onClick={() => setSelectedItem(item)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${item.userName}의 피드백 — ${item.responseSummary}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedItem(item); } }}
                >
                  <TableCell className="px-4 py-3 text-sm text-gray-500 font-mono whitespace-nowrap">
                    {item.date}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">{item.userName}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="text-sm text-gray-700 truncate max-w-[300px] block">{item.responseSummary}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <FeedbackBadge type={item.feedbackType} />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {item.comment ? (
                      <span className="text-xs text-gray-500 truncate max-w-[200px] block">{item.comment}</span>
                    ) : (
                      <span className="text-xs text-gray-300">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <StatusSelect status={item.status} onChange={(s) => handleStatusChange(item.id, s)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredFeedback.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm" data-testid="empty-state">
              조건에 맞는 피드백이 없습니다.
            </div>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          {filteredFeedback.length}건의 피드백
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedItem && (
        <FeedbackDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
