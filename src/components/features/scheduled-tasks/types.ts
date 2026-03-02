export type TaskStatus = 'active' | 'paused' | 'completed' | 'failed';

export type RecurrenceType = 'once' | 'daily' | 'weekly' | 'monthly';

export type TaskStatusFilter = 'all' | TaskStatus;

export interface ExecutionRecord {
  id: string;
  executedAt: string;
  status: 'success' | 'failure';
  durationMs: number;
  resultSummary: string;
}

export interface ScheduledTask {
  id: string;
  name: string;
  instructions: string;
  recurrence: RecurrenceType;
  scheduledTime: string; // HH:mm
  scheduledDay?: number; // 0-6 for weekly, 1-31 for monthly
  status: TaskStatus;
  createdAt: string;
  nextRun: string | null;
  lastRun: string | null;
  executionHistory: ExecutionRecord[];
}
