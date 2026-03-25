import React from 'react';
import { Badge } from '../../../ui/badge';
import { X, CheckCircle2, AlertCircle, Clock } from '../../../icons';
import type { AgentTrace } from '../data/platformAdminTypes';

interface TraceWaterfallPanelProps {
  trace: AgentTrace;
  onClose: () => void;
}

const typeColors: Record<string, { bg: string; text: string; label: string }> = {
  llm: { bg: 'bg-indigo-500', text: 'text-indigo-700', label: 'LLM' },
  tool: { bg: 'bg-violet-500', text: 'text-violet-700', label: '도구' },
  retrieval: { bg: 'bg-sky-500', text: 'text-sky-700', label: '검색' },
  output: { bg: 'bg-emerald-500', text: 'text-emerald-700', label: '출력' },
};

const statusIcon = (status: string) => {
  if (status === 'success') return <CheckCircle2 size={12} className="text-green-600" />;
  if (status === 'failure') return <AlertCircle size={12} className="text-red-500" />;
  return <Clock size={12} className="text-amber-500" />;
};

const TraceWaterfallPanel: React.FC<TraceWaterfallPanelProps> = ({ trace, onClose }) => {
  const maxMs = trace.steps.reduce((acc, s) => Math.max(acc, s.startMs + s.durationMs), 1);

  return (
    <div role="dialog" aria-modal="true" aria-label="에이전트 트레이스 상세" className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-2xl border-l border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
        <div>
          <div className="text-sm font-semibold text-gray-900">{trace.agentName}</div>
          <div className="text-xs text-gray-500 mt-0.5">{trace.traceId} · {trace.tenantName} · {trace.startedAt}</div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">
          <X size={16} />
        </button>
      </div>

      {/* Summary */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex-shrink-0">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: '상태', value: trace.status === 'success' ? '성공' : trace.status === 'failure' ? '실패' : '타임아웃' },
            { label: '총 시간', value: `${(trace.durationMs / 1000).toFixed(2)}s` },
            { label: 'TTFT', value: trace.ttftMs > 0 ? `${trace.ttftMs}ms` : '—' },
            { label: '비용', value: trace.cost > 0 ? `$${trace.cost.toFixed(3)}` : '—' },
          ].map(m => (
            <div key={m.label}>
              <div className="text-[10px] text-gray-500">{m.label}</div>
              <div className="text-xs font-medium text-gray-900 mt-0.5">{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Waterfall */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-3">실행 단계</div>

        {/* Timeline header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-36 flex-shrink-0" />
          <div className="flex-1 flex justify-between text-[10px] text-gray-400">
            <span>0ms</span>
            <span>{Math.round(maxMs / 2)}ms</span>
            <span>{maxMs}ms</span>
          </div>
        </div>

        {/* Steps */}
        {trace.steps.map((step) => {
          const colors = typeColors[step.type] ?? typeColors.tool;
          const left = (step.startMs / maxMs) * 100;
          const width = Math.max((step.durationMs / maxMs) * 100, 1);

          return (
            <div key={step.id} className="flex items-center gap-2 mb-2.5">
              <div className="w-36 flex-shrink-0 flex items-center gap-1.5">
                {statusIcon(step.status)}
                <div>
                  <div className="text-[11px] font-medium text-gray-800 leading-tight truncate max-w-[110px]">{step.name}</div>
                  {step.model && <div className="text-[10px] text-gray-400 leading-tight">{step.model}</div>}
                </div>
              </div>
              <div className="flex-1 relative h-5 bg-gray-100 rounded">
                <div
                  className={`absolute h-full rounded ${colors.bg} opacity-80`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
                <div className="absolute inset-y-0 right-1 flex items-center">
                  <span className="text-[10px] text-gray-500 whitespace-nowrap">{step.durationMs}ms</span>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 rounded ${colors.text} border-current bg-transparent`}
              >
                {colors.label}
              </Badge>
            </div>
          );
        })}

        {/* Token details */}
        {trace.tokenCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">토큰 상세</div>
            <div className="grid grid-cols-2 gap-2">
              {trace.steps.filter(s => s.tokenCount && s.tokenCount > 0).map(step => (
                <div key={step.id} className="bg-gray-50 rounded-lg p-2.5">
                  <div className="text-[11px] text-gray-500">{step.name}</div>
                  <div className="text-sm font-medium text-gray-900 mt-0.5">
                    {step.tokenCount?.toLocaleString()} 토큰
                  </div>
                  {step.model && <div className="text-[10px] text-gray-400">{step.model}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TraceWaterfallPanel;
