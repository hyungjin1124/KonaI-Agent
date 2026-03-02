import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { KPICard } from '../../shared/atoms/KPICard';
import { useScheduledTasks } from './useScheduledTasks';
import { ScheduleForm } from './components/ScheduleForm';
import { TaskTable } from './components/TaskTable';
import { ExecutionHistory } from './components/ExecutionHistory';
import { STATUS_FILTER_OPTIONS } from './scheduledTasksData';
import type { ScheduledTask, RecurrenceType, TaskStatusFilter } from './types';

export const ScheduledTasksView: React.FC = () => {
  const {
    tasks,
    filter,
    setFilter,
    kpi,
    addTask,
    updateTask,
    deleteTask,
    pauseTask,
    resumeTask,
    runNow,
  } = useScheduledTasks();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [historyTask, setHistoryTask] = useState<ScheduledTask | null>(null);

  const handleCreate = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const handleEdit = (task: ScheduledTask) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleSave = (data: {
    name: string;
    instructions: string;
    recurrence: RecurrenceType;
    scheduledTime: string;
    scheduledDay?: number;
  }) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
  };

  return (
    <div className="space-y-6" data-testid="scheduled-tasks-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">예약 작업 관리</h3>
          <p className="text-sm text-gray-500 mt-0.5">에이전트 작업을 예약하고 실행 상태를 모니터링합니다.</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#1A1A1A] hover:bg-black text-white shadow-sm"
          data-testid="create-task-btn"
        >
          <PlusIcon />
          <span className="ml-1.5">새 작업</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-section">
        <KPICard
          title="전체 작업"
          value={String(kpi.total)}
          icon={<CalendarIcon />}
        />
        <KPICard
          title="활성 작업"
          value={String(kpi.active)}
          icon={<PlayIcon />}
        />
        <KPICard
          title="총 실행 횟수"
          value={String(kpi.totalExecutions)}
          icon={<RepeatIcon />}
        />
        <KPICard
          title="성공률"
          value={kpi.successRate}
          icon={<CheckIcon />}
        />
      </div>

      {/* Status Filter */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit" role="group" aria-label="상태 필터">
        {STATUS_FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value as TaskStatusFilter)}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              filter === opt.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-pressed={filter === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Task Table */}
      <TaskTable
        tasks={tasks}
        onEdit={handleEdit}
        onPause={pauseTask}
        onResume={resumeTask}
        onDelete={deleteTask}
        onRunNow={runNow}
        onViewHistory={setHistoryTask}
      />

      {/* Execution History Panel */}
      {historyTask && (
        <ExecutionHistory task={historyTask} onClose={() => setHistoryTask(null)} />
      )}

      {/* Create / Edit Form */}
      <ScheduleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
        onSave={handleSave}
      />
    </div>
  );
};

// --- Inline Icons ---

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1 5.5H13" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 1V3M10 1V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 2.5L12 7L4 11.5V2.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 7C1.5 4 3.5 2 7 2C10.5 2 12.5 4.5 12.5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12.5 7C12.5 10 10.5 12 7 12C3.5 12 1.5 9.5 1.5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M10.5 2L12.5 4L14 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7.5L6 10.5L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
