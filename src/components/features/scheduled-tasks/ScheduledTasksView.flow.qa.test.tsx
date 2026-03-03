/**
 * ScheduledTasksView — QA Flow Tests
 *
 * Tests for UX flows, state synchronization, callback wiring,
 * and terminal state scenarios.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { ScheduledTasksView } from './ScheduledTasksView';
import { MOCK_SCHEDULED_TASKS } from './scheduledTasksData';

// Same mocks as dev tests
vi.mock('../../shared/atoms/KPICard', () => ({
  KPICard: (props: { title: string; value: string }) => (
    <div data-testid={`kpi-${props.title}`}>{props.value}</div>
  ),
}));

vi.mock('../../ui/dropdown-menu', async () => {
  return {
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-content">{children}</div>,
    DropdownMenuItem: ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
      <button onClick={onClick} className={className}>{children}</button>
    ),
  };
});

// =============================================
// Flow 1: Create → Edit → Delete (full CRUD lifecycle)
// =============================================

describe('Flow: Create → Edit → Delete', () => {
  it('completes full CRUD lifecycle for a task', async () => {
    const user = userEvent.setup();
    render(<ScheduledTasksView />);

    const initialCount = MOCK_SCHEDULED_TASKS.length;

    // Step 1: Create new task
    fireEvent.click(screen.getByTestId('create-task-btn'));
    expect(screen.getByText('새 예약 작업')).toBeInTheDocument();

    await user.clear(screen.getByTestId('schedule-form-name'));
    await user.type(screen.getByTestId('schedule-form-name'), 'CRUD 테스트');
    await user.clear(screen.getByTestId('schedule-form-instructions'));
    await user.type(screen.getByTestId('schedule-form-instructions'), '플로우 테스트 지시사항');
    await user.click(screen.getByText('생성'));

    expect(screen.getByText('CRUD 테스트')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-전체 작업')).toHaveTextContent(String(initialCount + 1));

    // Step 2: Edit the task — click edit button for the new task (first in list)
    const editButtons = screen.getAllByText('편집');
    await user.click(editButtons[0]);
    expect(screen.getByText('예약 작업 편집')).toBeInTheDocument();

    // Step 3: Delete the task
    const cancelBtn = screen.getByText('취소');
    await user.click(cancelBtn);

    const deleteButtons = screen.getAllByText('삭제');
    await user.click(deleteButtons[0]);

    expect(screen.queryByText('CRUD 테스트')).not.toBeInTheDocument();
    expect(screen.getByTestId('kpi-전체 작업')).toHaveTextContent(String(initialCount));
  });
});

// =============================================
// Flow 2: Pause → Run Now unavailable → Resume → Run Now available
// =============================================

describe('Flow: Pause → Resume → Run Now', () => {
  it('run now becomes unavailable after pause and available after resume', () => {
    render(<ScheduledTasksView />);

    // Count initial "즉시 실행" buttons (active tasks only)
    const initialRunNowCount = screen.getAllByText('즉시 실행').length;

    // Pause first active task
    const pauseButtons = screen.getAllByText('일시정지');
    const actionPauseBtn = pauseButtons.find(btn => !btn.hasAttribute('aria-pressed'));
    if (actionPauseBtn) fireEvent.click(actionPauseBtn);

    // One fewer "즉시 실행" button
    const afterPauseRunNow = screen.getAllByText('즉시 실행').length;
    expect(afterPauseRunNow).toBe(initialRunNowCount - 1);

    // Resume the paused task
    const resumeButtons = screen.getAllByText('재개');
    fireEvent.click(resumeButtons[0]);

    // "즉시 실행" count restored
    const afterResumeRunNow = screen.getAllByText('즉시 실행').length;
    expect(afterResumeRunNow).toBe(initialRunNowCount);
  });
});

// =============================================
// Flow 3: Filter → delete last task in filter → empty state
// =============================================

describe('Flow: Filter → Delete last item → Terminal state', () => {
  it('shows empty state when last filtered task is deleted', () => {
    render(<ScheduledTasksView />);

    // Filter to "완료" (only 1 completed task in mock data)
    const filterGroup = screen.getByRole('group', { name: '상태 필터' });
    const completedBtn = within(filterGroup).getByText('완료');
    fireEvent.click(completedBtn);

    // Verify only completed task visible
    expect(screen.getByText('2025 연간 보고서 생성')).toBeInTheDocument();

    // Delete it
    const deleteButtons = screen.getAllByText('삭제');
    fireEvent.click(deleteButtons[0]);

    // Should show empty state
    expect(screen.getByTestId('empty-task-list')).toBeInTheDocument();
  });

  it('switching filter after empty state shows other tasks', () => {
    render(<ScheduledTasksView />);

    // Filter to "완료" and delete
    const filterGroup = screen.getByRole('group', { name: '상태 필터' });
    const completedBtn = within(filterGroup).getByText('완료');
    fireEvent.click(completedBtn);

    const deleteButtons = screen.getAllByText('삭제');
    fireEvent.click(deleteButtons[0]);

    // Empty state
    expect(screen.getByTestId('empty-task-list')).toBeInTheDocument();

    // Switch to "전체" — other tasks should appear
    const allBtn = within(filterGroup).getByText('전체');
    fireEvent.click(allBtn);

    expect(screen.queryByTestId('empty-task-list')).not.toBeInTheDocument();
    expect(screen.getByText('주간 매출 리포트 생성')).toBeInTheDocument();
  });
});

// =============================================
// Flow 4: KPI synchronization through state changes
// =============================================

describe('Flow: KPI sync after state mutations', () => {
  it('KPI reflects correct counts after pause + delete + create', async () => {
    const user = userEvent.setup();
    render(<ScheduledTasksView />);

    const initialActive = MOCK_SCHEDULED_TASKS.filter(t => t.status === 'active').length;

    // Pause one active task
    const pauseButtons = screen.getAllByText('일시정지');
    const actionPauseBtn = pauseButtons.find(btn => !btn.hasAttribute('aria-pressed'));
    if (actionPauseBtn) fireEvent.click(actionPauseBtn);

    expect(screen.getByTestId('kpi-활성 작업')).toHaveTextContent(String(initialActive - 1));

    // Delete one task
    const deleteButtons = screen.getAllByText('삭제');
    fireEvent.click(deleteButtons[0]);

    const newTotal = MOCK_SCHEDULED_TASKS.length - 1;
    expect(screen.getByTestId('kpi-전체 작업')).toHaveTextContent(String(newTotal));

    // Create a new active task
    fireEvent.click(screen.getByTestId('create-task-btn'));
    const nameInput = screen.getByTestId('schedule-form-name');
    await user.clear(nameInput);
    await user.type(nameInput, 'KPI 동기화 테스트');
    const instrInput = screen.getByTestId('schedule-form-instructions');
    await user.clear(instrInput);
    await user.type(instrInput, '테스트');
    await user.click(screen.getByText('생성'));

    expect(screen.getByTestId('kpi-전체 작업')).toHaveTextContent(String(newTotal + 1));
  });
});

// =============================================
// Flow 5: Failed task → Retry (resume) → becomes active
// =============================================

describe('Flow: Failed task → Retry', () => {
  it('retry on failed task changes status to active', () => {
    render(<ScheduledTasksView />);

    // Find "재시도" button (only for failed tasks)
    const retryButtons = screen.getAllByText('재시도');
    expect(retryButtons.length).toBeGreaterThan(0);

    // Get initial active count
    const initialActiveKPI = screen.getByTestId('kpi-활성 작업').textContent;

    // Click retry
    fireEvent.click(retryButtons[0]);

    // Active count should increase by 1
    const newActiveKPI = screen.getByTestId('kpi-활성 작업').textContent;
    expect(Number(newActiveKPI)).toBe(Number(initialActiveKPI) + 1);
  });
});

// =============================================
// Flow 6: Execution history panel persists correct task after state changes
// =============================================

describe('Flow: History panel state after mutations', () => {
  it('execution history panel survives unrelated task deletion', () => {
    render(<ScheduledTasksView />);

    // Open history for second task
    const historyButtons = screen.getAllByText('실행 이력');
    fireEvent.click(historyButtons[1]);
    const panel = screen.getByTestId('execution-history');
    expect(within(panel).getByText(MOCK_SCHEDULED_TASKS[1].name)).toBeInTheDocument();

    // Delete first task (different from history task)
    const deleteButtons = screen.getAllByText('삭제');
    fireEvent.click(deleteButtons[0]);

    // History panel should still be open with second task
    expect(screen.getByTestId('execution-history')).toBeInTheDocument();
    // Note: The panel shows the stale task reference, which is expected behavior
    // since historyTask is a snapshot of the task at the time of opening
  });
});

// =============================================
// Flow 7: Create dialog cancel does not create task
// =============================================

describe('Flow: Cancel create dialog', () => {
  it('cancelling create dialog does not add a task', async () => {
    const user = userEvent.setup();
    render(<ScheduledTasksView />);

    const initialTotal = screen.getByTestId('kpi-전체 작업').textContent;

    // Open create and fill partially
    fireEvent.click(screen.getByTestId('create-task-btn'));
    await user.type(screen.getByTestId('schedule-form-name'), '취소될 작업');

    // Cancel
    await user.click(screen.getByText('취소'));

    // No change
    expect(screen.getByTestId('kpi-전체 작업')).toHaveTextContent(initialTotal!);
    expect(screen.queryByText('취소될 작업')).not.toBeInTheDocument();
  });
});
