import React from 'react';
import { CheckCircle2, Loader2, AlertCircle, Clock, ArrowLeft } from 'lucide-react';
import { AgentDefinition, AgentTask, AgentToolCall } from './types';
import { STATUS_CONFIG } from './constants';

interface AgentDetailViewProps {
  agent: AgentDefinition;
  task: AgentTask;
  onBack: () => void;
}

const ToolCallStatusIcon: React.FC<{ status: AgentToolCall['status'] }> = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />;
    case 'running':
      return <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />;
    case 'failed':
      return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
    case 'pending':
    default:
      return <Clock className="w-3.5 h-3.5 text-gray-400" />;
  }
};

export const AgentDetailView: React.FC<AgentDetailViewProps> = ({
  agent,
  task,
  onBack,
}) => {
  const config = STATUS_CONFIG[task.status];

  return (
    <div data-testid="agent-detail-view" className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
        <button
          type="button"
          onClick={onBack}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <span className="text-lg">{agent.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{agent.name}</h3>
          <p className="text-xs text-gray-500 truncate">{agent.role}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${config.badgeClass}`}>
          {config.label}
        </span>
      </div>

      {/* Progress */}
      {(task.status === 'running' || task.status === 'completed') && (
        <div className="px-4 pt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">진행률</span>
            <span className="text-xs font-medium text-gray-700">{task.progress}%</span>
          </div>
          <div
            className="w-full bg-gray-100 rounded-full h-1.5"
            role="progressbar"
            aria-valuenow={task.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${agent.name} 진행률`}
          >
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Current Action */}
      {task.status === 'running' && (
        <div className="px-4 pt-3 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
          <span className="text-sm text-blue-700">{task.currentAction}</span>
        </div>
      )}

      {/* Error */}
      {task.status === 'failed' && task.error && (
        <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{task.error}</p>
          </div>
        </div>
      )}

      {/* Tool Call Log */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          실행 로그
        </h4>
        {task.toolCalls.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">아직 실행된 도구가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {task.toolCalls.map((tc) => (
              <div
                key={tc.id}
                className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-lg border border-gray-100"
              >
                <ToolCallStatusIcon status={tc.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-gray-800">{tc.toolName}</span>
                    {tc.completedAt && (
                      <span className="text-[10px] text-gray-400">
                        {tc.completedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    )}
                  </div>
                  {tc.input && <p className="text-xs text-gray-500 truncate">{tc.input}</p>}
                  {tc.output && (
                    <p className="text-xs text-gray-700 mt-1 bg-white px-2 py-1 rounded border border-gray-100 truncate">
                      {tc.output}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Result */}
      {task.status === 'completed' && task.result && (
        <div className="px-4 pb-4 border-t border-gray-200 pt-3">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">결과</h4>
          <p className="text-sm text-gray-700 mb-2">{task.result.summary}</p>
          {task.result.artifacts && task.result.artifacts.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.result.artifacts.map((artifact) => (
                <span
                  key={artifact}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                >
                  {artifact}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentDetailView;
