import React, { useState, useMemo } from 'react';
import { Search, X, Shield, ToggleLeft, ToggleRight, RotateCcw, CheckCircle, XCircle, Share2, Download, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuditLogEntry, AuditAction } from '@/types/skill-management.types';

interface AuditLogPanelProps {
  logs: AuditLogEntry[];
}

const ACTION_CONFIG: Record<AuditAction, { icon: React.ReactNode; label: string; colorClass: string }> = {
  enable: { icon: <ToggleRight size={13} />, label: '활성화', colorClass: 'text-green-600 bg-green-50' },
  disable: { icon: <ToggleLeft size={13} />, label: '비활성화', colorClass: 'text-gray-500 bg-gray-100' },
  policy_change: { icon: <Shield size={13} />, label: '정책 변경', colorClass: 'text-blue-600 bg-blue-50' },
  rollback: { icon: <RotateCcw size={13} />, label: '롤백', colorClass: 'text-amber-600 bg-amber-50' },
  approve: { icon: <CheckCircle size={13} />, label: '승인', colorClass: 'text-green-600 bg-green-50' },
  reject: { icon: <XCircle size={13} />, label: '반려', colorClass: 'text-red-500 bg-red-50' },
  publish: { icon: <Share2 size={13} />, label: '공유', colorClass: 'text-purple-600 bg-purple-50' },
  install: { icon: <Download size={13} />, label: '설치', colorClass: 'text-blue-600 bg-blue-50' },
  delete: { icon: <Trash2 size={13} />, label: '삭제', colorClass: 'text-red-600 bg-red-50' },
};

const AuditLogPanel: React.FC<AuditLogPanelProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<AuditAction | 'all'>('all');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.skillTitle.toLowerCase().includes(search.toLowerCase()) ||
        log.performedBy.toLowerCase().includes(search.toLowerCase()) ||
        log.detail.toLowerCase().includes(search.toLowerCase());
      const matchesAction = filterAction === 'all' || log.action === filterAction;
      return matchesSearch && matchesAction;
    });
  }, [logs, search, filterAction]);

  const actionCounts = useMemo(() => {
    const counts: Partial<Record<AuditAction, number>> = {};
    logs.forEach((l) => {
      counts[l.action] = (counts[l.action] || 0) + 1;
    });
    return counts;
  }, [logs]);

  return (
    <div className="space-y-4">
      {/* Search + filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이력 검색"
            className="pl-9 pr-8 bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Action filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setFilterAction('all')}
          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
            filterAction === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          전체 ({logs.length})
        </button>
        {(Object.entries(ACTION_CONFIG) as [AuditAction, typeof ACTION_CONFIG[AuditAction]][]).map(([action, config]) => {
          const count = actionCounts[action] || 0;
          if (count === 0) return null;
          return (
            <button
              key={action}
              onClick={() => setFilterAction(action)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                filterAction === action
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Log list */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">변경 이력이 없습니다.</p>
            {(search || filterAction !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => { setSearch(''); setFilterAction('all'); }}
              >
                필터 초기화
              </Button>
            )}
          </div>
        ) : (
          filteredLogs.map((log) => {
            const config = ACTION_CONFIG[log.action];
            return (
              <div key={log.id} className="px-5 py-3 flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${config.colorClass}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-gray-900 truncate">{log.skillTitle}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${config.colorClass}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{log.detail}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {log.performedBy} · {log.performedAt}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="text-xs text-gray-400 text-right">
        {filteredLogs.length}개 이력 표시
      </p>
    </div>
  );
};

export default AuditLogPanel;
