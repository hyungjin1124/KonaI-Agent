import React from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react';
import { ProgressTask } from '../../types';

interface ProgressSectionProps {
  tasks: ProgressTask[];
  isExpanded: boolean;
  onToggle: () => void;
}

const getStatusIcon = (status: ProgressTask['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case 'running':
      return <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'pending':
    default:
      return <Circle className="w-4 h-4 text-gray-300" />;
  }
};

const getStatusColor = (status: ProgressTask['status']) => {
  switch (status) {
    case 'completed':
      return 'text-gray-700';
    case 'running':
      return 'text-gray-900 font-medium';
    case 'error':
      return 'text-red-600';
    case 'pending':
    default:
      return 'text-gray-400';
  }
};

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  tasks,
  isExpanded,
  onToggle,
}) => {
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;

  return (
    <div className="border-b border-gray-200">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-sm font-medium text-gray-900">진행 상황</span>
        </div>
        {totalCount > 0 && (
          <span className="text-xs text-gray-500">
            {completedCount}/{totalCount}
          </span>
        )}
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="px-4 pb-3 space-y-1">
          {tasks.length === 0 ? (
            <div className="py-2 text-sm text-gray-400">
              <span>작업의 진행 상황을 확인하세요.</span>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 py-1.5 pl-2"
              >
                {getStatusIcon(task.status)}
                <span className={`text-sm ${getStatusColor(task.status)}`}>
                  {task.label}
                </span>
                {task.progress !== undefined && task.status === 'running' && (
                  <span className="text-xs text-gray-400 ml-auto">
                    {task.progress}%
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressSection;
