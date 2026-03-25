import React, { useState, useMemo } from 'react';
import { MessageSquare, Clock, Check } from '../../../icons';
import { KPICard } from '../../../shared/atoms/KPICard';
import { Badge } from '../../../ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../ui/table';
import { CONVERSATION_KPI, MOCK_CONVERSATIONS } from '../data/conversationData';
import type { ConversationSummary, ConversationStatus } from '../data/platformAdminTypes';

const STATUS_STYLE: Record<ConversationStatus, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
  abandoned: 'bg-gray-100 text-gray-500 border-gray-200',
};

const STATUS_LABEL: Record<ConversationStatus, string> = {
  active: '진행 중',
  completed: '완료',
  abandoned: '이탈',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const ConversationsTab: React.FC = () => {
  const [tenantFilter, setTenantFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [selectedConv, setSelectedConv] = useState<ConversationSummary | null>(null);

  const tenantOptions = useMemo(() => {
    const names = [...new Set(MOCK_CONVERSATIONS.map(c => c.tenantName))];
    return ['전체', ...names];
  }, []);

  const filtered = useMemo(() => {
    return MOCK_CONVERSATIONS.filter(c => {
      if (tenantFilter !== '전체' && c.tenantName !== tenantFilter) return false;
      if (statusFilter !== '전체' && c.status !== statusFilter) return false;
      return true;
    });
  }, [tenantFilter, statusFilter]);

  const kpi = CONVERSATION_KPI;

  return (
    <div>
      {/* Data freshness */}
      <div className="flex justify-end mb-2">
        <span className="text-[11px] text-gray-400">마지막 업데이트: {new Date().toLocaleString('ko-KR')}</span>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <KPICard title="활성 대화" value={String(kpi.activeConversations)} icon={<MessageSquare size={14} />} />
        <KPICard title="오늘 총 대화" value={String(kpi.totalToday)} />
        <KPICard title="평균 메시지 수" value={String(kpi.avgMessagesPerConversation)} />
        <KPICard title="평균 응답 시간" value={`${kpi.avgResponseTimeSec}s`} icon={<Clock size={14} />} />
        <KPICard title="완료율" value={`${kpi.completionRate}%`} icon={<Check size={14} />} />
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
          aria-label="대화 상태 필터"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          <option value="전체">전체 상태</option>
          <option value="active">진행 중</option>
          <option value="completed">완료</option>
          <option value="abandoned">이탈</option>
        </select>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length}건</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs">테넌트</TableHead>
              <TableHead className="text-xs">사용자</TableHead>
              <TableHead className="text-xs">에이전트</TableHead>
              <TableHead className="text-xs">시작 시간</TableHead>
              <TableHead className="text-xs text-center">메시지</TableHead>
              <TableHead className="text-xs text-center">응답 시간</TableHead>
              <TableHead className="text-xs text-center">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-sm text-gray-400">
                  대화가 없습니다.
                </TableCell>
              </TableRow>
            )}
            {filtered.map(conv => (
              <TableRow
                key={conv.conversationId}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedConv(selectedConv?.conversationId === conv.conversationId ? null : conv)}
              >
                <TableCell className="text-sm font-medium text-gray-900">{conv.tenantName}</TableCell>
                <TableCell className="text-sm text-gray-700">{conv.userName}</TableCell>
                <TableCell className="text-sm text-gray-600">{conv.agentName}</TableCell>
                <TableCell className="text-xs text-gray-500 font-mono">{formatTime(conv.startedAt)}</TableCell>
                <TableCell className="text-sm text-center">{conv.messageCount}</TableCell>
                <TableCell className="text-sm text-center">
                  <span className={conv.avgResponseTimeSec > 3 ? 'text-red-600 font-medium' : ''}>
                    {conv.avgResponseTimeSec}s
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={`rounded-full text-xs font-medium ${STATUS_STYLE[conv.status]}`}>
                    {STATUS_LABEL[conv.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail slide-over */}
      {selectedConv && (
        <>
          <div className="fixed inset-0 z-30 bg-black/20" onClick={() => setSelectedConv(null)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="대화 상세"
            className="fixed inset-y-0 right-0 z-40 w-[420px] max-w-full bg-white shadow-2xl overflow-y-auto animate-slide-in-right"
          >
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">대화 상세</h3>
                <button onClick={() => setSelectedConv(null)} aria-label="닫기" className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
              </div>
              <Badge variant="outline" className={`rounded-full text-xs font-medium ${STATUS_STYLE[selectedConv.status]}`}>
                {STATUS_LABEL[selectedConv.status]}
              </Badge>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">테넌트</span>
                  <p className="font-medium text-gray-900">{selectedConv.tenantName}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">사용자</span>
                  <p className="font-medium text-gray-900">{selectedConv.userName}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">에이전트</span>
                  <p className="font-medium text-gray-900">{selectedConv.agentName}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">토픽</span>
                  <p className="font-medium text-gray-900">{selectedConv.topic || '—'}</p>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">시작 시간</span>
                  <p className="font-mono text-xs text-gray-900">{formatTime(selectedConv.startedAt)}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">마지막 메시지</span>
                  <p className="font-mono text-xs text-gray-900">{formatTime(selectedConv.lastMessageAt)}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">메시지 수</span>
                  <p className="font-medium text-gray-900">{selectedConv.messageCount}건</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">평균 응답 시간</span>
                  <p className="font-medium text-gray-900">{selectedConv.avgResponseTimeSec}s</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">토큰 소비</span>
                  <p className="font-medium text-gray-900">{selectedConv.tokenCount.toLocaleString()}</p>
                </div>
                {selectedConv.satisfactionScore && (
                  <div>
                    <span className="text-gray-500 text-xs">만족도</span>
                    <p className="font-medium text-gray-900">{'★'.repeat(selectedConv.satisfactionScore)}{'☆'.repeat(5 - selectedConv.satisfactionScore)}</p>
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-100" />

              <div className="text-xs text-gray-400 text-center py-4">
                보안 정책에 따라 대화 내용은 요약 정보만 표시됩니다.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConversationsTab;
