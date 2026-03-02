import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../ui/table';
import { Button } from '../../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu';
import { TaskStatusBadge } from './TaskStatusBadge';
import type { ScheduledTask } from '../types';
import { getRecurrenceLabel, formatDateTime } from '../scheduledTasksData';

interface TaskTableProps {
  tasks: ScheduledTask[];
  onEdit: (task: ScheduledTask) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
  onRunNow: (id: string) => void;
  onViewHistory: (task: ScheduledTask) => void;
}

export function TaskTable({
  tasks,
  onEdit,
  onPause,
  onResume,
  onDelete,
  onRunNow,
  onViewHistory,
}: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400" data-testid="empty-task-list">
        <p className="text-sm">예약된 작업이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/80">
            <TableHead className="text-xs font-bold text-gray-500 uppercase w-[30%]">작업명</TableHead>
            <TableHead className="text-xs font-bold text-gray-500 uppercase">빈도</TableHead>
            <TableHead className="text-xs font-bold text-gray-500 uppercase">상태</TableHead>
            <TableHead className="text-xs font-bold text-gray-500 uppercase">다음 실행</TableHead>
            <TableHead className="text-xs font-bold text-gray-500 uppercase">최근 실행</TableHead>
            <TableHead className="text-xs font-bold text-gray-500 uppercase text-right">실행 횟수</TableHead>
            <TableHead className="text-xs font-bold text-gray-500 uppercase text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map(task => (
            <TableRow key={task.id} className="hover:bg-gray-50/50 transition-colors">
              <TableCell>
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.name}</p>
                  <p className="text-xs text-gray-400 truncate max-w-[280px]">{task.instructions}</p>
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-600">{getRecurrenceLabel(task.recurrence)}</TableCell>
              <TableCell><TaskStatusBadge status={task.status} /></TableCell>
              <TableCell className="text-sm text-gray-600">
                {task.nextRun ? formatDateTime(task.nextRun) : '—'}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {task.lastRun ? formatDateTime(task.lastRun) : '—'}
              </TableCell>
              <TableCell className="text-sm text-gray-600 text-right">
                {task.executionHistory.length}회
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="작업 메뉴">
                      <MoreDotsIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(task)}>편집</DropdownMenuItem>
                    {task.status === 'active' && (
                      <>
                        <DropdownMenuItem onClick={() => onPause(task.id)}>일시정지</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRunNow(task.id)}>즉시 실행</DropdownMenuItem>
                      </>
                    )}
                    {task.status === 'paused' && (
                      <DropdownMenuItem onClick={() => onResume(task.id)}>재개</DropdownMenuItem>
                    )}
                    {task.status === 'failed' && (
                      <DropdownMenuItem onClick={() => onResume(task.id)}>재시도</DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onViewHistory(task)}>실행 이력</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(task.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MoreDotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="3" r="1.5" fill="currentColor" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
      <circle cx="8" cy="13" r="1.5" fill="currentColor" />
    </svg>
  );
}
