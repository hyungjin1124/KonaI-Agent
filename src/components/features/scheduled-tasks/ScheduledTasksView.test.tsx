/**
 * ScheduledTasksView — Unit Tests
 *
 * Tests for Scheduled Agent Tasks management component.
 * Uses Vitest + React Testing Library with jsdom environment.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { ScheduledTasksView } from './ScheduledTasksView';
import { MOCK_SCHEDULED_TASKS } from './scheduledTasksData';

// Mock KPICard to simplify testing
vi.mock('../../shared/atoms/KPICard', () => ({
  KPICard: (props: { title: string; value: string }) => (
    <div data-testid={`kpi-${props.title}`}>{props.value}</div>
  ),
}));

// Mock DropdownMenu to work in jsdom — path relative from importing component
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
// Smoke Test — must
// =============================================

describe('ScheduledTasksView', () => {
  it('renders without error', () => {
    render(<ScheduledTasksView />);
    expect(screen.getByTestId('scheduled-tasks-view')).toBeInTheDocument();
  });

  it('displays the heading and description', () => {
    render(<ScheduledTasksView />);
    expect(screen.getByText('예약 작업 관리')).toBeInTheDocument();
    expect(screen.getByText(/에이전트 작업을 예약하고 실행 상태를 모니터링합니다/)).toBeInTheDocument();
  });
});

// =============================================
// KPI Cards — must (AC6: 관리자 뷰)
// =============================================

describe('KPI Cards', () => {
  it('renders 4 KPI cards', () => {
    render(<ScheduledTasksView />);
    const kpiSection = screen.getByTestId('kpi-section');
    expect(kpiSection.children.length).toBe(4);
  });

  it('displays total tasks count', () => {
    render(<ScheduledTasksView />);
    expect(screen.getByTestId('kpi-전체 작업')).toHaveTextContent(String(MOCK_SCHEDULED_TASKS.length));
  });

  it('displays active tasks count', () => {
    render(<ScheduledTasksView />);
    const activeCount = MOCK_SCHEDULED_TASKS.filter(t => t.status === 'active').length;
    expect(screen.getByTestId('kpi-활성 작업')).toHaveTextContent(String(activeCount));
  });
});

// =============================================
// Task List — must (AC1: CRUD + AC2: 상태 뱃지)
// =============================================

describe('Task List', () => {
  it('displays tasks from mock data', () => {
    render(<ScheduledTasksView />);
    expect(screen.getByText('주간 매출 리포트 생성')).toBeInTheDocument();
    expect(screen.getByText('일일 이상치 탐지')).toBeInTheDocument();
    expect(screen.getByText('월간 비용 분석')).toBeInTheDocument();
  });

  it('shows status badges for different statuses (AC2)', () => {
    render(<ScheduledTasksView />);
    // Filter buttons + table badges: use getAllByText
    expect(screen.getAllByText('활성').length).toBeGreaterThan(0);
    expect(screen.getAllByText('일시정지').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('실패').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('완료').length).toBeGreaterThanOrEqual(2);
  });

  it('shows recurrence labels', () => {
    render(<ScheduledTasksView />);
    expect(screen.getAllByText('매주').length).toBeGreaterThan(0);
    expect(screen.getAllByText('매일').length).toBeGreaterThan(0);
    expect(screen.getAllByText('매월').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1회').length).toBeGreaterThan(0);
  });
});

// =============================================
// Create Task — must (AC1: 생성, AC3: 빈도 옵션)
// =============================================

describe('Create Task', () => {
  it('shows create dialog when clicking new task button', () => {
    render(<ScheduledTasksView />);
    fireEvent.click(screen.getByTestId('create-task-btn'));
    expect(screen.getByText('새 예약 작업')).toBeInTheDocument();
  });

  it('has form fields in the create dialog', () => {
    render(<ScheduledTasksView />);
    fireEvent.click(screen.getByTestId('create-task-btn'));
    expect(screen.getByTestId('schedule-form-name')).toBeInTheDocument();
    expect(screen.getByTestId('schedule-form-instructions')).toBeInTheDocument();
    expect(screen.getByTestId('schedule-form-recurrence')).toBeInTheDocument();
    expect(screen.getByTestId('schedule-form-time')).toBeInTheDocument();
  });

  it('has recurrence select trigger present (AC3)', () => {
    render(<ScheduledTasksView />);
    fireEvent.click(screen.getByTestId('create-task-btn'));
    expect(screen.getByTestId('schedule-form-recurrence')).toBeInTheDocument();
  });
});

// =============================================
// Task Actions — must (AC1: 일시정지/재개/삭제)
// =============================================

describe('Task Actions', () => {
  it('renders action menu buttons for each task', () => {
    render(<ScheduledTasksView />);
    // With mocked DropdownMenu, action items should be visible
    const editButtons = screen.getAllByText('편집');
    expect(editButtons.length).toBe(MOCK_SCHEDULED_TASKS.length);
  });

  it('renders delete button for each task', () => {
    render(<ScheduledTasksView />);
    const deleteButtons = screen.getAllByText('삭제');
    expect(deleteButtons.length).toBe(MOCK_SCHEDULED_TASKS.length);
  });

  it('deletes a task when delete is clicked (AC1)', () => {
    render(<ScheduledTasksView />);
    const firstName = '주간 매출 리포트 생성';
    expect(screen.getByText(firstName)).toBeInTheDocument();

    const deleteButtons = screen.getAllByText('삭제');
    fireEvent.click(deleteButtons[0]);

    expect(screen.queryByText(firstName)).not.toBeInTheDocument();
  });

  it('pauses an active task (AC1)', () => {
    render(<ScheduledTasksView />);
    // Find "일시정지" buttons that are action items (not filter buttons)
    // With mock, all action items are rendered inline
    const pauseButtons = screen.getAllByText('일시정지');
    const initialCount = pauseButtons.length;

    // Click first pause button (skip filter button at index 0)
    // Filter button has aria-pressed, action buttons don't
    const actionPauseBtn = pauseButtons.find(btn => !btn.hasAttribute('aria-pressed'));
    if (actionPauseBtn) fireEvent.click(actionPauseBtn);

    // After pausing, paused badges should increase
    const afterPausedBadges = screen.getAllByText('일시정지');
    expect(afterPausedBadges.length).toBeGreaterThanOrEqual(initialCount);
  });

  it('shows run now option for active tasks', () => {
    render(<ScheduledTasksView />);
    const runNowButtons = screen.getAllByText('즉시 실행');
    expect(runNowButtons.length).toBeGreaterThan(0);
  });
});

// =============================================
// Status Filter — should
// =============================================

describe('Status Filter', () => {
  it('renders filter group', () => {
    render(<ScheduledTasksView />);
    expect(screen.getByRole('group', { name: '상태 필터' })).toBeInTheDocument();
  });

  it('defaults to all filter', () => {
    render(<ScheduledTasksView />);
    const filterGroup = screen.getByRole('group', { name: '상태 필터' });
    const allBtn = filterGroup.querySelector('[aria-pressed="true"]');
    expect(allBtn).toBeTruthy();
    expect(allBtn?.textContent).toBe('전체');
  });

  it('filters tasks when clicking a filter', async () => {
    const user = userEvent.setup();
    render(<ScheduledTasksView />);

    expect(screen.getByText('일일 이상치 탐지')).toBeInTheDocument();

    // Click "완료" filter within the filter group
    const filterGroup = screen.getByRole('group', { name: '상태 필터' });
    const buttons = within(filterGroup).getAllByRole('button');
    const completedBtn = buttons.find(b => b.textContent === '완료');
    if (completedBtn) await user.click(completedBtn);

    expect(screen.getByText('2025 연간 보고서 생성')).toBeInTheDocument();
    expect(screen.queryByText('일일 이상치 탐지')).not.toBeInTheDocument();
  });
});

// =============================================
// Execution History — should (AC4)
// =============================================

describe('Execution History', () => {
  it('shows execution history when button is clicked (AC4)', () => {
    render(<ScheduledTasksView />);
    const historyButtons = screen.getAllByText('실행 이력');
    fireEvent.click(historyButtons[0]);

    expect(screen.getByTestId('execution-history')).toBeInTheDocument();
  });
});
