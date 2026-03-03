/**
 * ScheduledTasksView — QA Edge Case Tests
 *
 * Tests for edge cases, data boundaries, and error scenarios
 * that the dev tests do not cover.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { ScheduledTasksView } from './ScheduledTasksView';
import { MOCK_SCHEDULED_TASKS } from './scheduledTasksData';
import { formatDateTime, formatDuration, getRecurrenceLabel } from './scheduledTasksData';

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
// Edge Case 1: Delete all tasks → empty state
// =============================================

describe('Empty State — all tasks deleted', () => {
  it('shows empty state message after deleting all tasks', () => {
    render(<ScheduledTasksView />);

    // Delete all tasks one by one
    for (let i = 0; i < MOCK_SCHEDULED_TASKS.length; i++) {
      const deleteButtons = screen.queryAllByText('삭제');
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
      }
    }

    expect(screen.getByTestId('empty-task-list')).toBeInTheDocument();
    expect(screen.getByText('예약된 작업이 없습니다.')).toBeInTheDocument();
  });

  it('shows 0 in KPI cards after all tasks deleted', () => {
    render(<ScheduledTasksView />);

    for (let i = 0; i < MOCK_SCHEDULED_TASKS.length; i++) {
      const deleteButtons = screen.queryAllByText('삭제');
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
      }
    }

    expect(screen.getByTestId('kpi-전체 작업')).toHaveTextContent('0');
    expect(screen.getByTestId('kpi-활성 작업')).toHaveTextContent('0');
    expect(screen.getByTestId('kpi-총 실행 횟수')).toHaveTextContent('0');
    expect(screen.getByTestId('kpi-성공률')).toHaveTextContent('0%');
  });
});

// =============================================
// Edge Case 2: Rapid sequential actions
// =============================================

describe('Rapid Sequential Actions', () => {
  it('handles multiple rapid deletes without error', () => {
    render(<ScheduledTasksView />);

    // Rapidly click delete on first two tasks
    const deleteButtons = screen.getAllByText('삭제');
    fireEvent.click(deleteButtons[0]);
    fireEvent.click(deleteButtons[1]);

    // Should still render without crashing
    expect(screen.getByTestId('scheduled-tasks-view')).toBeInTheDocument();
  });

  it('handles rapid pause/resume toggles', () => {
    render(<ScheduledTasksView />);

    // Find first active task's pause button
    const pauseButtons = screen.getAllByText('일시정지');
    const actionPauseBtn = pauseButtons.find(btn => !btn.hasAttribute('aria-pressed'));
    if (actionPauseBtn) {
      fireEvent.click(actionPauseBtn);
    }

    // Now find resume button and click
    const resumeButtons = screen.getAllByText('재개');
    if (resumeButtons.length > 0) {
      fireEvent.click(resumeButtons[0]);
    }

    // Should still render without crashing
    expect(screen.getByTestId('scheduled-tasks-view')).toBeInTheDocument();
  });
});

// =============================================
// Edge Case 3: Run Now — execution record appended
// =============================================

describe('Run Now', () => {
  it('increments execution count after run now', () => {
    render(<ScheduledTasksView />);

    // Get initial execution count for first active task
    const firstTaskExecCount = MOCK_SCHEDULED_TASKS[0].executionHistory.length;

    // Click "즉시 실행" for first active task
    const runNowButtons = screen.getAllByText('즉시 실행');
    fireEvent.click(runNowButtons[0]);

    // Execution count KPI should increase
    const totalExecs = MOCK_SCHEDULED_TASKS.reduce((sum, t) => sum + t.executionHistory.length, 0);
    expect(screen.getByTestId('kpi-총 실행 횟수')).toHaveTextContent(String(totalExecs + 1));
  });

  it('updates lastRun after run now is clicked', () => {
    render(<ScheduledTasksView />);

    // Get "즉시 실행" buttons (only for active tasks)
    const runNowButtons = screen.getAllByText('즉시 실행');
    fireEvent.click(runNowButtons[0]);

    // After run now, the execution history button should show new records
    const historyButtons = screen.getAllByText('실행 이력');
    fireEvent.click(historyButtons[0]);

    // Check that execution history panel shows "즉시 실행 완료."
    const historyPanel = screen.getByTestId('execution-history');
    expect(within(historyPanel).getByText('즉시 실행 완료.')).toBeInTheDocument();
  });
});

// =============================================
// Edge Case 4: Filter interaction with actions
// =============================================

describe('Filter + Action Interactions', () => {
  it('maintains filter state after task action', () => {
    render(<ScheduledTasksView />);

    // Set filter to "활성"
    const filterGroup = screen.getByRole('group', { name: '상태 필터' });
    const activeBtn = within(filterGroup).getByText('활성');
    fireEvent.click(activeBtn);

    // Verify only active tasks visible
    const activeTasks = MOCK_SCHEDULED_TASKS.filter(t => t.status === 'active');
    expect(screen.queryByText('경쟁사 뉴스 모니터링')).not.toBeInTheDocument(); // paused

    // Run Now on an active task
    const runNowButtons = screen.getAllByText('즉시 실행');
    if (runNowButtons.length > 0) {
      fireEvent.click(runNowButtons[0]);
    }

    // Filter should still be "활성"
    expect(activeBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('paused task disappears from active filter', () => {
    render(<ScheduledTasksView />);

    // Set filter to "활성"
    const filterGroup = screen.getByRole('group', { name: '상태 필터' });
    const activeBtn = within(filterGroup).getByText('활성');
    fireEvent.click(activeBtn);

    const activeBefore = screen.getAllByText('편집').length;

    // Pause first active task
    const pauseButtons = screen.getAllByText('일시정지');
    const actionPauseBtn = pauseButtons.find(btn => !btn.hasAttribute('aria-pressed'));
    if (actionPauseBtn) {
      fireEvent.click(actionPauseBtn);
    }

    const activeAfter = screen.getAllByText('편집').length;
    expect(activeAfter).toBeLessThan(activeBefore);
  });
});

// =============================================
// Edge Case 5: Helper function edge cases
// =============================================

describe('Helper Functions — Edge Cases', () => {
  it('formatDuration handles exactly 60 seconds', () => {
    expect(formatDuration(60000)).toBe('1분');
  });

  it('formatDuration handles 0 ms', () => {
    expect(formatDuration(0)).toBe('0초');
  });

  it('formatDuration handles large values', () => {
    expect(formatDuration(3661000)).toBe('61분 1초');
  });

  it('formatDateTime handles various ISO strings', () => {
    const result = formatDateTime('2026-01-01T00:00:00');
    expect(result).toMatch(/01\/01 0[0-9]:00/); // timezone dependent
  });

  it('getRecurrenceLabel handles all valid types', () => {
    expect(getRecurrenceLabel('once')).toBe('1회');
    expect(getRecurrenceLabel('daily')).toBe('매일');
    expect(getRecurrenceLabel('weekly')).toBe('매주');
    expect(getRecurrenceLabel('monthly')).toBe('매월');
  });
});

// =============================================
// Edge Case 6: Create task via form
// =============================================

describe('Task Creation Flow', () => {
  it('adds new task to the table after form submission', async () => {
    const user = userEvent.setup();
    render(<ScheduledTasksView />);

    const initialCount = MOCK_SCHEDULED_TASKS.length;

    // Open create dialog
    fireEvent.click(screen.getByTestId('create-task-btn'));

    // Fill form
    const nameInput = screen.getByTestId('schedule-form-name');
    const instructionsInput = screen.getByTestId('schedule-form-instructions');

    await user.clear(nameInput);
    await user.type(nameInput, '테스트 작업');
    await user.clear(instructionsInput);
    await user.type(instructionsInput, '테스트 지시사항');

    // Submit
    const submitBtn = screen.getByText('생성');
    await user.click(submitBtn);

    // New task should appear
    expect(screen.getByText('테스트 작업')).toBeInTheDocument();

    // KPI should update
    expect(screen.getByTestId('kpi-전체 작업')).toHaveTextContent(String(initialCount + 1));
  });
});

// =============================================
// Edge Case 7: Execution history panel open/close
// =============================================

describe('Execution History Panel', () => {
  it('closes execution history panel when close button clicked', () => {
    render(<ScheduledTasksView />);

    // Open history for first task
    const historyButtons = screen.getAllByText('실행 이력');
    fireEvent.click(historyButtons[0]);
    expect(screen.getByTestId('execution-history')).toBeInTheDocument();

    // Close panel
    const closeBtn = screen.getByLabelText('닫기');
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId('execution-history')).not.toBeInTheDocument();
  });

  it('shows empty history message for task with no executions', () => {
    render(<ScheduledTasksView />);

    // Create a new task (which will have empty execution history)
    fireEvent.click(screen.getByTestId('create-task-btn'));
    const nameInput = screen.getByTestId('schedule-form-name');
    fireEvent.change(nameInput, { target: { value: '빈 이력 작업' } });
    const instructionsInput = screen.getByTestId('schedule-form-instructions');
    fireEvent.change(instructionsInput, { target: { value: '테스트' } });
    fireEvent.click(screen.getByText('생성'));

    // View history for the new task
    const historyButtons = screen.getAllByText('실행 이력');
    // New task is prepended, so first "실행 이력" in the new task row
    fireEvent.click(historyButtons[0]);

    expect(screen.getByText('실행 이력이 없습니다.')).toBeInTheDocument();
  });

  it('switches history panel when viewing different tasks', () => {
    render(<ScheduledTasksView />);

    // Open history for first task
    const historyButtons = screen.getAllByText('실행 이력');
    fireEvent.click(historyButtons[0]);
    const panel = screen.getByTestId('execution-history');
    const firstTaskName = MOCK_SCHEDULED_TASKS[0].name;
    expect(within(panel).getByText(firstTaskName)).toBeInTheDocument();

    // Open history for second task
    const historyButtons2 = screen.getAllByText('실행 이력');
    fireEvent.click(historyButtons2[1]);
    const panel2 = screen.getByTestId('execution-history');
    const secondTaskName = MOCK_SCHEDULED_TASKS[1].name;
    expect(within(panel2).getByText(secondTaskName)).toBeInTheDocument();
  });
});
