import React, { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts';
import { ThumbsUp, Star } from '../../../icons';
import { KPICard } from '../../../shared/atoms/KPICard';
import { ChartWidget } from '../../../shared/molecules/ChartWidget';
import { Badge } from '../../../ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../ui/table';
import {
  FEEDBACK_KPI, MOCK_FEEDBACK,
  FEEDBACK_STATUS_LABELS, FEEDBACK_SENTIMENT_LABELS,
} from '../data/feedbackData';
import type { PlatformFeedbackItem, FeedbackStatus } from '../data/platformAdminTypes';

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#22c55e',
  neutral: '#94a3b8',
  negative: '#ef4444',
};

const STATUS_STYLE: Record<FeedbackStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  reviewed: 'bg-blue-100 text-blue-700 border-blue-200',
  resolved: 'bg-green-100 text-green-700 border-green-200',
  dismissed: 'bg-gray-100 text-gray-500 border-gray-200',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function buildSentimentPieData(items: PlatformFeedbackItem[]) {
  const counts = { positive: 0, neutral: 0, negative: 0 };
  for (const item of items) {
    counts[item.sentiment]++;
  }
  return [
    { name: '긍정', value: counts.positive, color: SENTIMENT_COLORS.positive },
    { name: '중립', value: counts.neutral, color: SENTIMENT_COLORS.neutral },
    { name: '부정', value: counts.negative, color: SENTIMENT_COLORS.negative },
  ];
}

function buildRatingDistribution(items: PlatformFeedbackItem[]) {
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const item of items) {
    if (item.rating) dist[item.rating]++;
  }
  return Object.entries(dist).map(([rating, count]) => ({ rating: `${rating}점`, count }));
}

const FeedbackMonitoringTab: React.FC = () => {
  const [tenantFilter, setTenantFilter] = useState('전체');
  const [sentimentFilter, setSentimentFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [selectedFeedback, setSelectedFeedback] = useState<PlatformFeedbackItem | null>(null);

  const tenantOptions = useMemo(() => {
    const names = [...new Set(MOCK_FEEDBACK.map(f => f.tenantName))];
    return ['전체', ...names];
  }, []);

  const filtered = useMemo(() => {
    return MOCK_FEEDBACK.filter(f => {
      if (tenantFilter !== '전체' && f.tenantName !== tenantFilter) return false;
      if (sentimentFilter !== '전체' && f.sentiment !== sentimentFilter) return false;
      if (statusFilter !== '전체' && f.status !== statusFilter) return false;
      return true;
    });
  }, [tenantFilter, sentimentFilter, statusFilter]);

  const sentimentData = useMemo(() => buildSentimentPieData(filtered), [filtered]);
  const ratingData = useMemo(() => buildRatingDistribution(filtered), [filtered]);

  const kpi = FEEDBACK_KPI;

  return (
    <div>
      {/* Data freshness */}
      <div className="flex justify-end mb-2">
        <span className="text-[11px] text-gray-400">마지막 업데이트: {new Date().toLocaleString('ko-KR')}</span>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <KPICard title="총 피드백 (30일)" value={String(kpi.totalFeedback30d)} icon={<ThumbsUp size={14} />} />
        <KPICard title="평균 평점" value={String(kpi.avgRating)} icon={<Star size={14} />} />
        <KPICard title="긍정률" value={`${kpi.positiveRate}%`} />
        <KPICard
          title="미답변"
          value={String(kpi.pendingCount)}
          footerBadge={
            kpi.pendingCount > 0
              ? <Badge variant="outline" className="rounded-full text-xs bg-amber-100 text-amber-700 border-amber-200">확인 필요</Badge>
              : undefined
          }
        />
        <KPICard title="주요 이슈" value={kpi.topIssueCategory} />
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
          aria-label="감정 필터"
          value={sentimentFilter}
          onChange={e => setSentimentFilter(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          <option value="전체">전체 감정</option>
          <option value="positive">긍정</option>
          <option value="neutral">중립</option>
          <option value="negative">부정</option>
        </select>
        <select
          aria-label="피드백 상태 필터"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          <option value="전체">전체 상태</option>
          <option value="pending">대기</option>
          <option value="reviewed">검토됨</option>
          <option value="resolved">해결됨</option>
          <option value="dismissed">반려</option>
        </select>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length}건</span>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <ChartWidget title="감정 분포" height={200}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                style={{ fontSize: 10 }}
              >
                {sentimentData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartWidget>

        <ChartWidget title="평점 분포" height={200}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratingData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="rating" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="count" name="건수" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWidget>
      </div>

      {/* Feedback table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs">시간</TableHead>
              <TableHead className="text-xs">테넌트</TableHead>
              <TableHead className="text-xs">사용자</TableHead>
              <TableHead className="text-xs text-center">평점</TableHead>
              <TableHead className="text-xs text-center">감정</TableHead>
              <TableHead className="text-xs">코멘트</TableHead>
              <TableHead className="text-xs text-center">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-sm text-gray-400">
                  피드백이 없습니다.
                </TableCell>
              </TableRow>
            )}
            {filtered.map(fb => (
              <TableRow
                key={fb.feedbackId}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedFeedback(selectedFeedback?.feedbackId === fb.feedbackId ? null : fb)}
              >
                <TableCell className="text-xs text-gray-500 font-mono whitespace-nowrap">{formatTime(fb.createdAt)}</TableCell>
                <TableCell className="text-sm font-medium text-gray-900">{fb.tenantName}</TableCell>
                <TableCell className="text-sm text-gray-700">{fb.userName}</TableCell>
                <TableCell className="text-center text-sm">
                  {fb.rating ? `${'★'.repeat(fb.rating)}${'☆'.repeat(5 - fb.rating)}` : '—'}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: SENTIMENT_COLORS[fb.sentiment] }}
                    title={FEEDBACK_SENTIMENT_LABELS[fb.sentiment]}
                  />
                </TableCell>
                <TableCell className="text-sm text-gray-700 max-w-[250px] truncate" title={fb.comment}>{fb.comment}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={`rounded-full text-xs font-medium ${STATUS_STYLE[fb.status]}`}>
                    {FEEDBACK_STATUS_LABELS[fb.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail slide-over */}
      {selectedFeedback && (
        <>
          <div className="fixed inset-0 z-30 bg-black/20" onClick={() => setSelectedFeedback(null)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="피드백 상세"
            className="fixed inset-y-0 right-0 z-40 w-[420px] max-w-full bg-white shadow-2xl overflow-y-auto animate-slide-in-right"
          >
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">피드백 상세</h3>
                <button onClick={() => setSelectedFeedback(null)} aria-label="닫기" className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`rounded-full text-xs font-medium ${STATUS_STYLE[selectedFeedback.status]}`}>
                  {FEEDBACK_STATUS_LABELS[selectedFeedback.status]}
                </Badge>
                <span
                  className="text-xs px-2 py-0.5 rounded-full border font-medium"
                  style={{ color: SENTIMENT_COLORS[selectedFeedback.sentiment], borderColor: SENTIMENT_COLORS[selectedFeedback.sentiment], backgroundColor: `${SENTIMENT_COLORS[selectedFeedback.sentiment]}15` }}
                >
                  {FEEDBACK_SENTIMENT_LABELS[selectedFeedback.sentiment]}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">테넌트</span>
                  <p className="font-medium text-gray-900">{selectedFeedback.tenantName}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">사용자</span>
                  <p className="font-medium text-gray-900">{selectedFeedback.userName}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">카테고리</span>
                  <p className="font-medium text-gray-900">{selectedFeedback.category || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">평점</span>
                  <p className="font-medium text-gray-900">
                    {selectedFeedback.rating ? `${'★'.repeat(selectedFeedback.rating)}${'☆'.repeat(5 - selectedFeedback.rating)}` : '—'}
                  </p>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <span className="text-xs font-medium text-gray-500 mb-1.5 block">전체 코멘트</span>
                <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 leading-relaxed">{selectedFeedback.comment}</p>
              </div>

              {selectedFeedback.responseNote && (
                <div>
                  <span className="text-xs font-medium text-gray-500 mb-1.5 block">대응 노트</span>
                  <p className="text-sm text-blue-800 bg-blue-50 rounded-lg p-3 leading-relaxed">{selectedFeedback.responseNote}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">작성 시간</span>
                  <p className="font-mono text-xs text-gray-900">{formatTime(selectedFeedback.createdAt)}</p>
                </div>
                {selectedFeedback.respondedAt && (
                  <div>
                    <span className="text-gray-500 text-xs">대응 시간</span>
                    <p className="font-mono text-xs text-gray-900">{formatTime(selectedFeedback.respondedAt)}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 text-xs">관련 대화</span>
                  <p className="font-mono text-xs text-blue-600">{selectedFeedback.conversationId}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FeedbackMonitoringTab;
