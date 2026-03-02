import React from 'react';
import { Badge } from '../../../ui/badge';
import type { TaskStatus } from '../types';

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  active: { label: '활성', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  paused: { label: '일시정지', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: '완료', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  failed: { label: '실패', className: 'bg-red-50 text-red-700 border-red-200' },
};

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
}
