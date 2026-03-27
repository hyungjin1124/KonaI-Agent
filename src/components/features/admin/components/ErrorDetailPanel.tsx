'use client';

import React from 'react';
import { X, ExternalLink, AlertTriangle, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AgentError } from '../types/admin.types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ErrorDetailPanelProps {
  error: AgentError;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ErrorDetailPanel({ error, onClose }: ErrorDetailPanelProps) {
  const typeColor: Record<string, string> = {
    Timeout: 'bg-amber-50 text-amber-700 border-amber-200',
    'Model Error': 'bg-red-50 text-red-700 border-red-200',
    'Tool Error': 'bg-violet-50 text-violet-700 border-violet-200',
  };

  return (
    <div className="absolute inset-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col animate-in slide-in-from-right-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <span className="text-sm font-semibold text-gray-900 truncate">오류 상세</span>
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Meta */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-500">시간</span>
            <span className="font-medium text-gray-900 ml-auto">{error.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-500">사용자</span>
            <span className="font-medium text-gray-900 ml-auto">{error.userName}</span>
          </div>
        </div>

        {/* Error type & step */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16 shrink-0">에러 타입</span>
            <Badge
              variant="outline"
              className={`text-[11px] px-2 py-0.5 ${typeColor[error.errorType] || ''}`}
            >
              {error.errorType}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16 shrink-0">실패 단계</span>
            <span className="text-sm font-medium text-gray-800">{error.failedStep}</span>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1 font-medium">오류 요약</p>
          <p className="text-sm text-gray-800 leading-relaxed">{error.summary}</p>
        </div>

        {/* Conversation ID */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">대화 ID</span>
          <code className="text-xs font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
            {error.conversationId}
          </code>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs gap-1.5"
          onClick={() => window.open(`https://langfuse.example.com/trace/${error.conversationId}`, '_blank')}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          LangFuse에서 트레이스 보기
        </Button>
      </div>
    </div>
  );
}
