/**
 * UsageMonitoringView — Unit Tests
 *
 * Tests for Usage Monitoring Dashboard component (Phase 1 + Phase 2).
 * Uses Vitest + React Testing Library with jsdom environment.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { UsageMonitoringView } from './UsageMonitoringView';
import {
  DAILY_USAGE_30D,
  DAILY_USAGE_7D,
  DAILY_USAGE_90D,
  USAGE_KPI_SUMMARY,
  AGENT_USAGE_DATA,
  MODEL_COST_DATA,
  AGENT_HEALTH_DATA,
  AGENT_COST_DATA,
  TEAM_BUDGET_DATA,
  USER_USAGE_DATA,
  getDailyUsageByPeriod,
} from './usageMonitoringData';

// Mock recharts to avoid rendering issues in jsdom
vi.mock('recharts', () => {
  const MockComponent = ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid={props['data-testid'] || 'recharts-mock'}>{children}</div>
  );
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    ComposedChart: MockComponent,
    BarChart: MockComponent,
    PieChart: MockComponent,
    LineChart: MockComponent,
    Bar: () => <div data-testid="bar" />,
    Line: () => <div data-testid="line" />,
    Pie: ({ children }: { children?: React.ReactNode }) => <div data-testid="pie">{children}</div>,
    Cell: () => <div data-testid="cell" />,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
  };
});

// Mock NotificationContext for TeamBudgetSection
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

// =============================================
// Smoke Test
// =============================================

describe('UsageMonitoringView', () => {
  it('renders without error', () => {
    render(<UsageMonitoringView />);
    expect(screen.getByTestId('usage-monitoring-view')).toBeInTheDocument();
  });

  it('displays the heading and description', () => {
    render(<UsageMonitoringView />);
    expect(screen.getByText('AI 사용량 모니터링')).toBeInTheDocument();
    expect(screen.getByText(/에이전트 사용량, 비용, 성능을 한눈에 확인합니다/)).toBeInTheDocument();
  });
});

// =============================================
// KPI Cards — must
// =============================================

describe('KPI Cards', () => {
  it('renders 4 KPI cards with correct titles', () => {
    render(<UsageMonitoringView />);
    expect(screen.getByText('총 토큰 사용량')).toBeInTheDocument();
    expect(screen.getByText('총 비용 (USD)')).toBeInTheDocument();
    expect(screen.getByText('활성 사용자')).toBeInTheDocument();
    expect(screen.getByText('에이전트 실행 수')).toBeInTheDocument();
  });

  it('displays KPI values from mock data', () => {
    render(<UsageMonitoringView />);
    expect(screen.getByText(USAGE_KPI_SUMMARY.totalTokens.value)).toBeInTheDocument();
    expect(screen.getByText(USAGE_KPI_SUMMARY.totalCost.value)).toBeInTheDocument();
    expect(screen.getByText(USAGE_KPI_SUMMARY.activeUsers.value)).toBeInTheDocument();
    expect(screen.getByText(USAGE_KPI_SUMMARY.agentRuns.value)).toBeInTheDocument();
  });

  it('displays change percentages on KPI cards', () => {
    render(<UsageMonitoringView />);
    expect(screen.getByText(USAGE_KPI_SUMMARY.totalTokens.change)).toBeInTheDocument();
    expect(screen.getByText(USAGE_KPI_SUMMARY.totalCost.change)).toBeInTheDocument();
    expect(screen.getByText(USAGE_KPI_SUMMARY.activeUsers.change)).toBeInTheDocument();
    expect(screen.getByText(USAGE_KPI_SUMMARY.agentRuns.change)).toBeInTheDocument();
  });
});

// =============================================
// Charts Rendering — must
// =============================================

describe('Charts', () => {
  it('renders daily trend chart title', () => {
    render(<UsageMonitoringView />);
    expect(screen.getByText('일별 토큰 사용량 / 비용 추이')).toBeInTheDocument();
  });

  it('renders agent distribution chart title', () => {
    render(<UsageMonitoringView />);
    expect(screen.getByText('에이전트 유형별 실행 수')).toBeInTheDocument();
  });

  it('renders model cost distribution chart title', () => {
    render(<UsageMonitoringView />);
    expect(screen.getByText('모델별 비용 분포')).toBeInTheDocument();
  });

  it('renders model cost legend items', () => {
    render(<UsageMonitoringView />);
    MODEL_COST_DATA.forEach((model) => {
      expect(screen.getByText(model.name)).toBeInTheDocument();
    });
  });
});

// =============================================
// Period Filter — should
// =============================================

describe('Period Filter', () => {
  it('renders period filter buttons', () => {
    render(<UsageMonitoringView />);
    expect(screen.getByText('7일')).toBeInTheDocument();
    expect(screen.getByText('30일')).toBeInTheDocument();
    expect(screen.getByText('90일')).toBeInTheDocument();
  });

  it('defaults to 30d period', () => {
    render(<UsageMonitoringView />);
    const btn30d = screen.getByText('30일');
    expect(btn30d).toHaveAttribute('aria-pressed', 'true');
  });

  it('changes active period on click', async () => {
    const user = userEvent.setup();
    render(<UsageMonitoringView />);

    const btn7d = screen.getByText('7일');
    await user.click(btn7d);
    expect(btn7d).toHaveAttribute('aria-pressed', 'true');

    const btn30d = screen.getByText('30일');
    expect(btn30d).toHaveAttribute('aria-pressed', 'false');
  });
});

// =============================================
// Mock Data Integrity — should
// =============================================

describe('Mock Data', () => {
  it('has 30+ daily data points for 30d period', () => {
    expect(DAILY_USAGE_30D.length).toBeGreaterThanOrEqual(30);
  });

  it('has 7 daily data points for 7d period', () => {
    expect(DAILY_USAGE_7D.length).toBe(7);
  });

  it('has 90 daily data points for 90d period', () => {
    expect(DAILY_USAGE_90D.length).toBe(90);
  });

  it('getDailyUsageByPeriod returns correct data for each period', () => {
    expect(getDailyUsageByPeriod('7d')).toHaveLength(7);
    expect(getDailyUsageByPeriod('30d')).toHaveLength(30);
    expect(getDailyUsageByPeriod('90d')).toHaveLength(90);
  });

  it('agent usage data has 4 agents', () => {
    expect(AGENT_USAGE_DATA).toHaveLength(4);
  });

  it('model cost data has 4 models', () => {
    expect(MODEL_COST_DATA).toHaveLength(4);
  });

  it('daily data has required fields', () => {
    DAILY_USAGE_7D.forEach((d) => {
      expect(d).toHaveProperty('date');
      expect(d).toHaveProperty('tokens');
      expect(d).toHaveProperty('cost');
      expect(typeof d.tokens).toBe('number');
      expect(typeof d.cost).toBe('number');
    });
  });
});

// =============================================
// AI Insight Footer — should
// =============================================

describe('AI Insight', () => {
  it('renders insight summary for daily trend chart', () => {
    render(<UsageMonitoringView />);
    expect(screen.getByText(/주중 사용량이 주말 대비/)).toBeInTheDocument();
  });

  it('renders insight summary for agent distribution', () => {
    render(<UsageMonitoringView />);
    expect(screen.getByText(/PPT 에이전트가 전체 실행의/)).toBeInTheDocument();
  });

  it('renders insight summary for model cost', () => {
    render(<UsageMonitoringView />);
    expect(screen.getByText(/GPT-4o가 전체 비용의/)).toBeInTheDocument();
  });
});

// =============================================
// Phase 2: Health Status Strip — must
// =============================================

describe('Health Status Strip', () => {
  it('renders the health status strip', () => {
    render(<UsageMonitoringView />);
    expect(screen.getByTestId('health-status-strip')).toBeInTheDocument();
  });

  it('renders all agent health chips', () => {
    render(<UsageMonitoringView />);
    AGENT_HEALTH_DATA.forEach((agent) => {
      expect(screen.getByTestId(`health-chip-${agent.id}`)).toBeInTheDocument();
    });
  });

  it('displays agent names in health strip', () => {
    render(<UsageMonitoringView />);
    const strip = screen.getByTestId('health-status-strip');
    AGENT_HEALTH_DATA.forEach((agent) => {
      expect(within(strip).getByText(agent.name)).toBeInTheDocument();
    });
  });

  it('shows healthy count', () => {
    render(<UsageMonitoringView />);
    const healthyCount = AGENT_HEALTH_DATA.filter((a) => a.status === 'healthy').length;
    expect(screen.getByText(`${healthyCount}/${AGENT_HEALTH_DATA.length} 정상`)).toBeInTheDocument();
  });

  it('shows latency and error rate for non-down agents', () => {
    render(<UsageMonitoringView />);
    const healthyAgent = AGENT_HEALTH_DATA.find((a) => a.status === 'healthy')!;
    expect(screen.getByText(`${healthyAgent.latencyMs}ms`)).toBeInTheDocument();
    expect(screen.getByText(`${healthyAgent.errorRate}%`)).toBeInTheDocument();
  });

  it('shows offline label for down agents', () => {
    render(<UsageMonitoringView />);
    const downAgent = AGENT_HEALTH_DATA.find((a) => a.status === 'down');
    if (downAgent) {
      expect(screen.getByText('오프라인')).toBeInTheDocument();
    }
  });
});

// =============================================
// Phase 2: Agent Cost Table — must
// =============================================

describe('Agent Cost Table', () => {
  it('renders the agent cost table', () => {
    render(<UsageMonitoringView />);
    expect(screen.getByTestId('agent-cost-table')).toBeInTheDocument();
  });

  it('renders all 5 agents in the cost table', () => {
    render(<UsageMonitoringView />);
    const table = screen.getByTestId('agent-cost-table');
    AGENT_COST_DATA.forEach((agent) => {
      expect(within(table).getByText(agent.name)).toBeInTheDocument();
    });
  });

  it('displays cost values for agents', () => {
    render(<UsageMonitoringView />);
    const table = screen.getByTestId('agent-cost-table');
    AGENT_COST_DATA.forEach((agent) => {
      expect(within(table).getByText(`$${agent.costUsd.toLocaleString()}`)).toBeInTheDocument();
    });
  });

  it('displays billed credits for agents', () => {
    render(<UsageMonitoringView />);
    const table = screen.getByTestId('agent-cost-table');
    AGENT_COST_DATA.forEach((agent) => {
      expect(within(table).getByText(String(agent.billedCredits))).toBeInTheDocument();
    });
  });

  it('sorts by cost on header click', async () => {
    const user = userEvent.setup();
    render(<UsageMonitoringView />);
    const table = screen.getByTestId('agent-cost-table');
    const costHeader = within(table).getByText('비용 (USD)');

    // Default: desc (highest first)
    const rows = within(table).getAllByRole('row');
    // First data row (index 1, skip header)
    expect(rows[1]).toHaveTextContent(AGENT_COST_DATA[0].name); // PPT (highest cost)

    // Click to sort asc
    await user.click(costHeader);
    const rowsAfter = within(table).getAllByRole('row');
    const lastAgent = [...AGENT_COST_DATA].sort((a, b) => a.costUsd - b.costUsd)[0];
    expect(rowsAfter[1]).toHaveTextContent(lastAgent.name);
  });

  it('renders agent cost insight summary', () => {
    render(<UsageMonitoringView />);
    expect(screen.getByText(/PPT 에이전트가 전체 비용의 37%/)).toBeInTheDocument();
  });
});

// =============================================
// Phase 2: Team Budget Section — must
// =============================================

describe('Team Budget Section', () => {
  it('renders the team budget section', () => {
    render(<UsageMonitoringView />);
    expect(screen.getByTestId('team-budget-section')).toBeInTheDocument();
  });

  it('renders all 3 teams', () => {
    render(<UsageMonitoringView />);
    const section = screen.getByTestId('team-budget-section');
    TEAM_BUDGET_DATA.forEach((team) => {
      expect(within(section).getByText(team.name)).toBeInTheDocument();
    });
  });

  it('renders budget progress bars with correct aria attributes', () => {
    render(<UsageMonitoringView />);
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBe(TEAM_BUDGET_DATA.length);
  });

  it('shows percentage for each team', () => {
    render(<UsageMonitoringView />);
    TEAM_BUDGET_DATA.forEach((team) => {
      const percent = Math.round((team.currentUsage / team.monthlyTokenQuota) * 100);
      const section = screen.getByTestId(`team-budget-${team.id}`);
      expect(within(section).getByText(`${percent}%`)).toBeInTheDocument();
    });
  });

  it('triggers notification for teams over 90% budget', () => {
    mockAddAnomaly.mockClear();
    render(<UsageMonitoringView />);
    const overBudgetTeams = TEAM_BUDGET_DATA.filter(
      (t) => Math.round((t.currentUsage / t.monthlyTokenQuota) * 100) >= 90
    );
    expect(mockAddAnomaly).toHaveBeenCalledTimes(overBudgetTeams.length);
  });
});

// =============================================
// Phase 2: User Usage Table — must
// =============================================

describe('User Usage Table', () => {
  it('renders the user usage table', () => {
    render(<UsageMonitoringView />);
    expect(screen.getByTestId('user-usage-table')).toBeInTheDocument();
  });

  it('renders first page of 5 users', () => {
    render(<UsageMonitoringView />);
    const table = screen.getByTestId('user-usage-table');
    const rows = within(table).getAllByRole('row');
    // header + 5 data rows
    expect(rows.length).toBe(6);
  });

  it('shows user names on first page', () => {
    render(<UsageMonitoringView />);
    const table = screen.getByTestId('user-usage-table');
    // Default sort: totalTokens desc, first 5
    const sorted = [...USER_USAGE_DATA].sort((a, b) => b.totalTokens - a.totalTokens);
    sorted.slice(0, 5).forEach((user) => {
      expect(within(table).getByText(user.name)).toBeInTheDocument();
    });
  });

  it('navigates to next page', async () => {
    const user = userEvent.setup();
    render(<UsageMonitoringView />);

    const nextBtn = screen.getByLabelText('다음 페이지');
    await user.click(nextBtn);

    // Page 2 should show different users
    const table = screen.getByTestId('user-usage-table');
    const sorted = [...USER_USAGE_DATA].sort((a, b) => b.totalTokens - a.totalTokens);
    expect(within(table).getByText(sorted[5].name)).toBeInTheDocument();
  });

  it('filters by team', async () => {
    const user = userEvent.setup();
    render(<UsageMonitoringView />);

    // Click Engineering filter
    const engBtn = screen.getByRole('button', { name: 'Engineering' });
    await user.click(engBtn);

    const table = screen.getByTestId('user-usage-table');
    const engUsers = USER_USAGE_DATA.filter((u) => u.team === 'Engineering');
    const rows = within(table).getAllByRole('row');
    // header + min(5, engUsers.length) data rows
    expect(rows.length).toBe(Math.min(5, engUsers.length) + 1);
  });

  it('renders team filter buttons', () => {
    render(<UsageMonitoringView />);
    expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument();
    TEAM_BUDGET_DATA.forEach((team) => {
      expect(screen.getByRole('button', { name: team.name })).toBeInTheDocument();
    });
  });
});

// =============================================
// Phase 2: Mock Data Integrity — should
// =============================================

describe('Phase 2 Mock Data', () => {
  it('has 5 agents in health data', () => {
    expect(AGENT_HEALTH_DATA).toHaveLength(5);
  });

  it('has 5 agents in cost breakdown', () => {
    expect(AGENT_COST_DATA).toHaveLength(5);
  });

  it('agent cost data has 7-day trend arrays', () => {
    AGENT_COST_DATA.forEach((agent) => {
      expect(agent.weeklyTrend).toHaveLength(7);
    });
  });

  it('has 3 teams in budget data', () => {
    expect(TEAM_BUDGET_DATA).toHaveLength(3);
  });

  it('has at least 1 team over 90% budget', () => {
    const overBudget = TEAM_BUDGET_DATA.filter(
      (t) => Math.round((t.currentUsage / t.monthlyTokenQuota) * 100) >= 90
    );
    expect(overBudget.length).toBeGreaterThanOrEqual(1);
  });

  it('has 12 users in usage data', () => {
    expect(USER_USAGE_DATA).toHaveLength(12);
  });

  it('user data has required fields', () => {
    USER_USAGE_DATA.forEach((u) => {
      expect(u).toHaveProperty('name');
      expect(u).toHaveProperty('email');
      expect(u).toHaveProperty('team');
      expect(u).toHaveProperty('totalTokens');
      expect(u).toHaveProperty('costUsd');
      expect(u).toHaveProperty('activeAgents');
      expect(Array.isArray(u.activeAgents)).toBe(true);
    });
  });
});
