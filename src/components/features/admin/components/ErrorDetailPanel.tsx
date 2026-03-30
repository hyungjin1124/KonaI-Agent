'use client';

import React from 'react';
import {
  X,
  ExternalLink,
  AlertTriangle,
  Clock,
  User,
  Cpu,
  Zap,
  RefreshCw,
  MessageSquare,
  AlertCircle,
  Users,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AgentError } from '../types/admin.types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ErrorDetailPanelProps {
  error: AgentError;
  onClose: () => void;
  onViewConversation?: (conversationId: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ErrorDetailPanel({ error, onClose, onViewConversation }: ErrorDetailPanelProps) {
  const typeColor: Record<string, string> = {
    Timeout: 'bg-amber-50 text-amber-700 border-amber-200',
    'Model Error': 'bg-red-50 text-red-700 border-red-200',
    'Tool Error': 'bg-violet-50 text-violet-700 border-violet-200',
  };

  const typeIcon: Record<string, React.ReactNode> = {
    Timeout: <Clock className="h-4 w-4 text-amber-600" />,
    'Model Error': <AlertTriangle className="h-4 w-4 text-red-500" />,
    'Tool Error': <Zap className="h-4 w-4 text-violet-600" />,
  };

  return (
    <div className="absolute inset-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col animate-in slide-in-from-right-2 duration-200">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2 min-w-0">
          {typeIcon[error.errorType] ?? <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
          <Badge
            variant="outline"
            className={`text-[11px] px-2 py-0.5 ${typeColor[error.errorType] || ''}`}
          >
            {error.errorType}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Meta: 시간 + 사용자 */}
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
          {error.time}
        </span>
        <span className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-gray-400" />
          {error.userName}
          <span className="text-gray-400">({error.userTeam})</span>
        </span>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* §1 오류 정보 */}
        <div>
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">오류 정보</h4>
          <div className="space-y-2">
            <InfoRow icon={<AlertCircle className="h-3.5 w-3.5" />} label="에러 타입" value={error.errorType} />
            <InfoRow icon={<Target className="h-3.5 w-3.5" />} label="실패 단계" value={error.failedStep} />
            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
              <p className="text-[10px] text-gray-400 font-medium mb-1">에러 메시지</p>
              <code className="text-xs font-mono text-gray-700 leading-relaxed break-all">
                {error.errorMessage}
              </code>
            </div>
            <InfoRow icon={<Cpu className="h-3.5 w-3.5" />} label="사용 모델" value={error.model} />
            <InfoRow icon={<Zap className="h-3.5 w-3.5" />} label="사용 스킬" value={error.skill ?? '—'} />
            <InfoRow icon={<RefreshCw className="h-3.5 w-3.5" />} label="재시도" value={`${error.retryCount} (자동 재시도 후 최종 실패)`} />
          </div>
        </div>

        {/* §2 판단 가이드 */}
        <div>
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">판단 가이드</h4>
          <div className="space-y-2">
            <GuideRow
              icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
              label="유사 오류"
              value={`최근 24시간 동일 에러 ${error.similarErrorCount}건`}
              highlight={error.similarErrorCount >= 3}
            />
            <GuideRow
              icon={<Users className="h-3.5 w-3.5 text-blue-500" />}
              label="영향 범위"
              value={error.affectedUsers}
              highlight={error.affectedUsers.includes('외')}
            />
            <GuideRow
              icon={<Target className="h-3.5 w-3.5 text-purple-500" />}
              label="추정 원인"
              value={error.estimatedCause}
            />
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs gap-1.5"
          onClick={() => window.open(`https://langfuse.example.com/trace/${error.conversationId}`, '_blank')}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          LangFuse 트레이스
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs gap-1.5"
          onClick={() => onViewConversation?.(error.conversationId)}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          대화 원문 보기
        </Button>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-400">{icon}</span>
      <span className="text-gray-500 w-[72px] shrink-0 text-xs">{label}</span>
      <span className="font-medium text-gray-800 text-xs">{value}</span>
    </div>
  );
}

function GuideRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-start gap-2 rounded-lg p-2.5 ${highlight ? 'bg-amber-50/50 border border-amber-100' : 'bg-gray-50 border border-gray-100'}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] text-gray-400 font-medium mb-0.5">{label}</p>
        <p className={`text-xs ${highlight ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{value}</p>
      </div>
    </div>
  );
}
