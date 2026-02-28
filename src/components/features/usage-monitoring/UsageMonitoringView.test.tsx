/**
 * UsageMonitoringView — Unit Tests
 *
 * Tests for Usage Monitoring Dashboard component.
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
  it('renders chart containers (ResponsiveContainer)', () => {
    render(<UsageMonitoringView />);
    // Daily trend + Agent distribution + Model cost = 3 ResponsiveContainers
    const containers = screen.getAllByTestId('responsive-container');
    expect(containers.length).toBe(3);
  });

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
