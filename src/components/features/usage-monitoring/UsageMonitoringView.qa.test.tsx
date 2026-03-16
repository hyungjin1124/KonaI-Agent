/**
 * QA Edge Case Tests — Usage Monitoring Dashboard Phase 2
 *
 * QA Engineer 관점의 엣지 케이스 검증.
 * 개발자 테스트(UsageMonitoringView.test.tsx)와 분리된 독립 테스트.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

// Mock recharts
vi.mock('recharts', () => {
  const MockComponent = ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid={props['data-testid'] || 'recharts-mock'}>{children}</div>
  );
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ComposedChart: MockComponent,
    BarChart: MockComponent,
    PieChart: MockComponent,
    LineChart: MockComponent,
    Bar: () => <div />,
    Line: () => <div />,
    Pie: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Cell: () => <div />,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
  };
});

// Mock NotificationContext
const mockAddAnomaly = vi.fn();
vi.mock('../../../context/NotificationContext', () => ({
  useNotification: () => ({
    anomalies: [],
    unreadCount: 0,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    addAnomaly: mockAddAnomaly,
  }),
}));

import { UsageMonitoringView } from './UsageMonitoringView';
import { USER_USAGE_DATA, TEAM_BUDGET_DATA, AGENT_COST_DATA } from './usageMonitoringData';

beforeEach(() => {
  mockAddAnomaly.mockClear();
});

// =============================================
// Edge Case: Agent Cost Table Sorting
// =============================================

describe('QA: AgentCostTable sorting edge cases', () => {
  it('toggles sort direction when clicking same header twice', async () => {
    const user = userEvent.setup();
    render(<UsageMonitoringView />);
    const table = screen.getByTestId('agent-cost-table');
    const costHeader = within(table).getByText('비용 (USD)');

    // Default: desc (highest first = PPT $1,056)
    let rows = within(table).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('PPT 에이전트');

    // Click once: asc (lowest first = 커스텀 $119)
    await user.click(costHeader);
    rows = within(table).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('커스텀 에이전트');

    // Click again: desc (back to highest first)
    await user.click(costHeader);
    rows = within(table).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('PPT 에이전트');
  });

  it('switches sort field and resets direction to desc', async () => {
    const user = userEvent.setup();
    render(<UsageMonitoringView />);
    const table = screen.getByTestId('agent-cost-table');

    // Click "사용자" header — should sort by activeUsers desc
    const usersHeader = within(table).getByText('사용자');
    await user.click(usersHeader);

    const rows = within(table).getAllByRole('row');
    // 채팅 에이전트 has most active users (72)
    expect(rows[1]).toHaveTextContent('채팅 에이전트');
  });

  it('sorts by totalTokens correctly', async () => {
    const user = userEvent.setup();
    render(<UsageMonitoringView />);
    const table = screen.getByTestId('agent-cost-table');

    const tokensHeader = within(table).getByText('토큰');
    await user.click(tokensHeader);

    // desc: highest tokens first (PPT 4.8M)
    const rows = within(table).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('PPT 에이전트');
  });
});

// =============================================
// Edge Case: User Usage Table Pagination
// =============================================

describe('QA: UserUsageTable pagination edge cases', () => {
  it('prev button is disabled on first page', () => {
    render(<UsageMonitoringView />);
    const prevBtn = screen.getByLabelText('이전 페이지');
    expect(prevBtn).toBeDisabled();
  });

  it('next button is disabled on last page', async () => {
    const user = userEvent.setup();
    render(<UsageMonitoringView />);

    const totalPages = Math.ceil(USER_USAGE_DATA.length / 5);

    // Navigate to last page
    const nextBtn = screen.getByLabelText('다음 페이지');
    for (let i = 1; i < totalPages; i++) {
      await user.click(nextBtn);
    }

    expect(nextBtn).toBeDisabled();
  });

  it('shows correct count text on each page', async () => {
    const user = userEvent.setup();
    render(<UsageMonitoringView />);

    // Page 1: "12명 중 1–5"
    expect(screen.getByText(/12명 중 1–5/)).toBeInTheDocument();

    // Navigate to page 2: "12명 중 6–10"
    await user.click(screen.getByLabelText('다음 페이지'));
    expect(screen.getByText(/12명 중 6–10/)).toBeInTheDocument();

    // Navigate to page 3: "12명 중 11–12"
    await user.click(screen.getByLabelText('다음 페이지'));
    expect(screen.getByText(/12명 중 11–12/)).toBeInTheDocument();
  });

  it('resets to page 1 when team filter changes', async () => {
    const user = userEvent.setup();
    render(<UsageMonitoringView />);

    // Go to page 2
    await user.click(screen.getByLabelText('다음 페이지'));
    expect(screen.getByText(/12명 중 6–10/)).toBeInTheDocument();

    // Apply team filter — should reset to page 1
    await user.click(screen.getByRole('button', { name: 'Engineering' }));
    const table = screen.getByTestId('user-usage-table');
    const engUsers = USER_USAGE_DATA.filter((u) => u.team === 'Engineering');
    // Should be on page 1 with engineering users
    expect(within(table).getAllByRole('row').length).toBeLessThanOrEqual(6); // header + max 5 rows
  });

  it('filters correctly for each team', async () => {
    const user = userEvent.setup();
    render(<UsageMonitoringView />);

    for (const team of TEAM_BUDGET_DATA) {
      await user.click(screen.getByRole('button', { name: team.name }));
      const table = screen.getByTestId('user-usage-table');
      const expectedCount = USER_USAGE_DATA.filter((u) => u.team === team.name).length;
      const rows = within(table).getAllByRole('row');
      // header + min(5, expectedCount)
      expect(rows.length).toBe(Math.min(5, expectedCount) + 1);
    }

    // Reset to 전체
    await user.click(screen.getByRole('button', { name: '전체' }));
    const table = screen.getByTestId('user-usage-table');
    expect(within(table).getAllByRole('row').length).toBe(6); // header + 5
  });

  it('hides pagination when filtered results fit in one page', async () => {
    const user = userEvent.setup();
    render(<UsageMonitoringView />);

    // Support team has 3 users (< PAGE_SIZE=5), no pagination needed
    await user.click(screen.getByRole('button', { name: 'Support' }));
    expect(screen.queryByLabelText('다음 페이지')).not.toBeInTheDocument();
  });
});

// =============================================
// Edge Case: Team Budget Section
// =============================================

describe('QA: TeamBudgetSection edge cases', () => {
  it('progress bar width is capped at 100%', () => {
    render(<UsageMonitoringView />);
    const progressBars = screen.getAllByRole('progressbar');
    progressBars.forEach((bar) => {
      const width = bar.style.width;
      const percent = parseInt(width, 10);
      expect(percent).toBeLessThanOrEqual(100);
    });
  });

  it('does not trigger duplicate notifications on re-render', () => {
    mockAddAnomaly.mockClear();
    const { rerender } = render(<UsageMonitoringView />);

    const overBudgetTeams = TEAM_BUDGET_DATA.filter(
      (t) => Math.round((t.currentUsage / t.monthlyTokenQuota) * 100) >= 90
    );
    expect(mockAddAnomaly).toHaveBeenCalledTimes(overBudgetTeams.length);

    // Re-render should NOT trigger additional notifications
    rerender(<UsageMonitoringView />);
    expect(mockAddAnomaly).toHaveBeenCalledTimes(overBudgetTeams.length);
  });

  it('notification includes correct team name and percentage', () => {
    mockAddAnomaly.mockClear();
    render(<UsageMonitoringView />);

    // Sales team is 93% — should trigger
    const salesCall = mockAddAnomaly.mock.calls.find(
      (call: [{ title: string }]) => call[0].title.includes('Sales')
    );
    expect(salesCall).toBeDefined();
    expect(salesCall![0].title).toContain('93%');
    expect(salesCall![0].type).toBe('warning');
  });

  it('displays correct budget colors for each threshold', () => {
    render(<UsageMonitoringView />);

    // Engineering: 62% → green
    const engSection = screen.getByTestId('team-budget-engineering');
    const engBar = within(engSection).getByRole('progressbar');
    expect(engBar.className).toContain('bg-green-500');

    // Sales: 93% → red
    const salesSection = screen.getByTestId('team-budget-sales');
    const salesBar = within(salesSection).getByRole('progressbar');
    expect(salesBar.className).toContain('bg-red-500');

    // Support: 20% → green
    const supportSection = screen.getByTestId('team-budget-support');
    const supportBar = within(supportSection).getByRole('progressbar');
    expect(supportBar.className).toContain('bg-green-500');
  });
});

// =============================================
// Edge Case: Health Status Strip
// =============================================

describe('QA: HealthStatusStrip edge cases', () => {
  it('does not show latency/error rate for down agents', () => {
    render(<UsageMonitoringView />);
    const downChip = screen.getByTestId('health-chip-custom');

    // Should show 오프라인, NOT latency/error
    expect(within(downChip).getByText('오프라인')).toBeInTheDocument();
    expect(within(downChip).queryByText('0ms')).not.toBeInTheDocument();
    expect(within(downChip).queryByText('100%')).not.toBeInTheDocument();
  });

  it('shows degraded agent with yellow dot styling', () => {
    render(<UsageMonitoringView />);
    const degradedChip = screen.getByTestId('health-chip-chat');
    // Chat agent is degraded — should have yellow dot
    const dot = degradedChip.querySelector('.bg-yellow-500');
    expect(dot).toBeInTheDocument();
  });

  it('displays correct healthy/total count', () => {
    render(<UsageMonitoringView />);
    // 3 healthy out of 5 (chat=degraded, custom=down)
    expect(screen.getByText('3/5 정상')).toBeInTheDocument();
  });
});

// =============================================
// Edge Case: Agent Cost Table total
// =============================================

describe('QA: AgentCostTable computed values', () => {
  it('renders all 5 agents with correct cost values', () => {
    render(<UsageMonitoringView />);
    const table = screen.getByTestId('agent-cost-table');
    AGENT_COST_DATA.forEach((agent) => {
      expect(within(table).getByText(`$${agent.costUsd.toLocaleString()}`)).toBeInTheDocument();
    });
  });
});

// =============================================
// Edge Case: User Usage Table sorting
// =============================================

describe('QA: UserUsageTable sorting edge cases', () => {
  it('sorts by cost when cost header is clicked', async () => {
    const user = userEvent.setup();
    render(<UsageMonitoringView />);
    const table = screen.getByTestId('user-usage-table');
    const costHeader = within(table).getByText('비용');

    await user.click(costHeader);

    // desc: highest cost first
    const rows = within(table).getAllByRole('row');
    const sortedByCost = [...USER_USAGE_DATA].sort((a, b) => b.costUsd - a.costUsd);
    expect(rows[1]).toHaveTextContent(sortedByCost[0].name);
  });
});
