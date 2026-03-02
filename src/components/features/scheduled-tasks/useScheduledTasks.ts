import { useState, useMemo, useCallback } from 'react';
import type { ScheduledTask, TaskStatusFilter, ExecutionRecord } from './types';
import { MOCK_SCHEDULED_TASKS } from './scheduledTasksData';

export interface ScheduledTasksKPI {
  total: number;
  active: number;
  paused: number;
  totalExecutions: number;
  successRate: string;
}

export function useScheduledTasks() {
  const [tasks, setTasks] = useState<ScheduledTask[]>(MOCK_SCHEDULED_TASKS);
  const [filter, setFilter] = useState<TaskStatusFilter>('all');

  const filteredTasks = useMemo(
    () => filter === 'all' ? tasks : tasks.filter(t => t.status === filter),
    [tasks, filter],
  );

  const kpi = useMemo<ScheduledTasksKPI>(() => {
    const allExecs = tasks.flatMap(t => t.executionHistory);
    const successCount = allExecs.filter(e => e.status === 'success').length;
    const rate = allExecs.length > 0 ? Math.round((successCount / allExecs.length) * 100) : 0;
    return {
      total: tasks.length,
      active: tasks.filter(t => t.status === 'active').length,
      paused: tasks.filter(t => t.status === 'paused').length,
      totalExecutions: allExecs.length,
      successRate: `${rate}%`,
    };
  }, [tasks]);

  const addTask = useCallback((taskData: Omit<ScheduledTask, 'id' | 'createdAt' | 'executionHistory' | 'lastRun' | 'nextRun' | 'status'> & { status?: ScheduledTask['status'] }) => {
    const newTask: ScheduledTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      status: taskData.status ?? 'active',
      createdAt: new Date().toISOString(),
      lastRun: null,
      nextRun: new Date().toISOString(), // simplified
      executionHistory: [],
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Pick<ScheduledTask, 'name' | 'instructions' | 'recurrence' | 'scheduledTime' | 'scheduledDay'>>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const pauseTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: 'paused' as const, nextRun: null } : t,
    ));
  }, []);

  const resumeTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: 'active' as const, nextRun: new Date().toISOString() } : t,
    ));
  }, []);

  const runNow = useCallback((id: string) => {
    const execRecord: ExecutionRecord = {
      id: `exec-${Date.now()}`,
      executedAt: new Date().toISOString(),
      status: 'success',
      durationMs: Math.floor(Math.random() * 60000) + 5000,
      resultSummary: '즉시 실행 완료.',
    };
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, lastRun: execRecord.executedAt, executionHistory: [execRecord, ...t.executionHistory] }
        : t,
    ));
    return execRecord;
  }, []);

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    filter,
    setFilter,
    kpi,
    addTask,
    updateTask,
    deleteTask,
    pauseTask,
    resumeTask,
    runNow,
  };
}
