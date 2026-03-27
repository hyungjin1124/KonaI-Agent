'use client';

import React, { useState } from 'react';
import { X, ExternalLink, ChevronRight, User, Bot, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { ConversationRecord } from '../types/admin.types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ConversationSlidePanelProps {
  record: ConversationRecord;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ConversationSlidePanel({ record, onClose }: ConversationSlidePanelProps) {
  const [messagesOpen, setMessagesOpen] = useState(true);
  const [errorOpen, setErrorOpen] = useState(!!record.errorSummary);

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {record.summary}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-gray-400 hover:text-gray-700 shrink-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>{record.userName} · {record.team}</span>
          <span>{record.date}</span>
          <span>{record.turnCount}턴</span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          {record.skill && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 text-blue-600 border-blue-200 bg-blue-50">
              {record.skill}
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 text-gray-600 border-gray-200">
            {record.model}
          </Badge>
          <Badge
            variant="outline"
            className={[
              'text-[10px] px-1.5 py-0.5',
              record.status === '완료'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200',
            ].join(' ')}
          >
            {record.status}
          </Badge>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Messages */}
        <Collapsible open={messagesOpen} onOpenChange={setMessagesOpen}>
          <CollapsibleTrigger className="w-full px-4 py-2.5 flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider hover:bg-gray-50 transition-colors">
            <ChevronRight className={`h-3.5 w-3.5 transition-transform ${messagesOpen ? 'rotate-90' : ''}`} />
            대화 내용 ({record.messages.length})
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-3 space-y-2.5">
              {record.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={[
                    'flex gap-2.5 text-sm',
                    msg.role === 'user' ? '' : '',
                  ].join(' ')}
                >
                  <div className={[
                    'h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    msg.role === 'user'
                      ? 'bg-gray-200 text-gray-600'
                      : 'bg-[#FF3C42]/10 text-[#FF3C42]',
                  ].join(' ')}>
                    {msg.role === 'user'
                      ? <User className="h-3.5 w-3.5" />
                      : <Bot className="h-3.5 w-3.5" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-medium text-gray-400">
                        {msg.role === 'user' ? record.userName : 'Agent'}
                      </span>
                      <span className="text-[10px] text-gray-300 tabular-nums">{msg.timestamp}</span>
                      {msg.skillCall && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 text-violet-600 border-violet-200 bg-violet-50">
                          {msg.skillCall}
                        </Badge>
                      )}
                    </div>
                    <p className={[
                      'text-xs leading-relaxed',
                      msg.content.startsWith('[오류]')
                        ? 'text-red-600 font-medium'
                        : 'text-gray-700',
                    ].join(' ')}>
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Error Summary */}
        <Collapsible open={errorOpen} onOpenChange={setErrorOpen}>
          <CollapsibleTrigger className="w-full px-4 py-2.5 flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider hover:bg-gray-50 transition-colors border-t border-gray-100">
            <ChevronRight className={`h-3.5 w-3.5 transition-transform ${errorOpen ? 'rotate-90' : ''}`} />
            에러 요약
            {!record.errorSummary && (
              <span className="text-gray-400 font-normal normal-case ml-1">(없음)</span>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-3">
              {record.errorSummary ? (
                <div className="bg-red-50/60 border border-red-100 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-700 border-red-200">
                      {record.errorSummary.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">실패 단계:</span> {record.errorSummary.step}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{record.errorSummary.message}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400">에러가 발생하지 않았습니다.</p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Footer */}
      {record.langfuseTraceId && (
        <div className="shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs gap-1.5"
            onClick={() => window.open(`https://langfuse.example.com/trace/${record.langfuseTraceId}`, '_blank')}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            LangFuse에서 상세 트레이스 보기
          </Button>
        </div>
      )}
    </div>
  );
}
