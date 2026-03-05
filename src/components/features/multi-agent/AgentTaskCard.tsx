import React from 'react';
import { CheckCircle2, Loader2, AlertCircle, Clock, RotateCcw } from 'lucide-react';
import { AgentDefinition, AgentTask } from './types';
import { STATUS_CONFIG } from './constants';

interface AgentTaskCardProps {
  agent: AgentDefinition;
  task: AgentTask;
  isSelected: boolean;
  onSelect: () => void;
  onRetry?: () => void;
}

const StatusIcon: React.FC<{ status: AgentTask['status'] }> = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case 'running':
      return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
    case 'failed':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'pending':
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

export const AgentTaskCard: React.FC<AgentTaskCardProps> = ({
  agent,
  task,
  isSelected,
  onSelect,
  onRetry,
}) => {
  const config = STATUS_CONFIG[task.status];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      data-testid={`agent-card-${agent.id}`}
      className={`w-full text-left rounded-lg border p-3 transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-400 bg-blue-50/50 shadow-sm'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      {/* Header: Icon + Name + Status Badge */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base flex-shrink-0" role="img" aria-label={agent.role}>
            {agent.icon}
          </span>
          <span className="text-sm font-medium text-gray-900 truncate">
            {agent.name}
          </span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${config.badgeClass}`}>
          {config.label}
        </span>
      </div>

      {/* Role */}
      <p className="text-xs text-gray-500 mb-2 truncate">{agent.role}</p>

      {/* Current Action */}
      {task.status === 'running' && (
        <div className="flex items-center gap-1.5 mb-2">
          <Loader2 className="w-3 h-3 text-blue-500 animate-spin flex-shrink-0" />
          <span className="text-xs text-blue-700 truncate">{task.currentAction}</span>
        </div>
      )}

      {/* Error */}
      {task.status === 'failed' && task.error && (
        <div className="flex items-start gap-1.5 mb-2">
          <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-red-600 line-clamp-2">{task.error}</span>
        </div>
      )}

      {/* Progress Bar */}
      {(task.status === 'running' || task.status === 'completed') && (
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
      )}

      {/* Result Summary */}
      {task.status === 'completed' && task.result && (
        <p className="text-xs text-gray-600 mt-2 line-clamp-1">{task.result.summary}</p>
      )}

      {/* Retry Button */}
      {task.status === 'failed' && onRetry && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
          className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
          aria-label={`${agent.name} 재시도`}
        >
          <RotateCcw className="w-3 h-3" />
          재시도
        </button>
      )}
    </div>
  );
};

export default AgentTaskCard;
