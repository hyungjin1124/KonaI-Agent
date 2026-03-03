import React from 'react';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import type { ScheduledTask } from '../types';
import { formatDateTime, formatDuration } from '../scheduledTasksData';

interface ExecutionHistoryProps {
  task: ScheduledTask | null;
  onClose: () => void;
}

export function ExecutionHistory({ task, onClose }: ExecutionHistoryProps) {
  if (!task) return null;

  return (
    <div className="border border-gray-100 rounded-xl bg-white p-4 space-y-4" data-testid="execution-history">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-900">실행 이력</h4>
          <p className="text-xs text-gray-500 mt-0.5">{task.name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="닫기">
          <CloseIcon />
        </Button>
      </div>

      {task.executionHistory.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">실행 이력이 없습니다.</p>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {task.executionHistory.map(exec => (
            <div
              key={exec.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                exec.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700">
                    {formatDateTime(exec.executedAt)}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      exec.status === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {exec.status === 'success' ? '성공' : '실패'}
                  </Badge>
                  <span className="text-[10px] text-gray-400">{formatDuration(exec.durationMs)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{exec.resultSummary}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
