/**
 * Generative UI — Unit Tests
 *
 * Tests for parseGenerativeUI, extractGenerativeUIFromMessage,
 * GenerativeUIRenderer (type dispatch), and GenerativeUIFallback.
 * Uses Vitest + React Testing Library with jsdom environment.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import { parseGenerativeUISpec, extractGenerativeUIFromMessage } from './parseGenerativeUI';
import { GenerativeUIRenderer } from './GenerativeUIRenderer';
import { GenerativeUIFallback } from './GenerativeUIFallback';
import type { GenerativeUISpec, ChartDataSpec, KPIDataSpec, StatGridDataSpec, TableDataSpec } from './types';

// Mock recharts to avoid rendering issues in jsdom
vi.mock('recharts', () => {
  const MockComponent = ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid={props['data-testid'] || 'recharts-mock'}>{children}</div>
  );
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    BarChart: MockComponent,
    LineChart: MockComponent,
    PieChart: MockComponent,
    AreaChart: MockComponent,
    ComposedChart: MockComponent,
    Bar: () => <div data-testid="bar" />,
    Line: () => <div data-testid="line" />,
    Pie: ({ children }: { children?: React.ReactNode }) => <div data-testid="pie">{children}</div>,
    Area: () => <div data-testid="area" />,
    Cell: () => <div data-testid="cell" />,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
  };
});

// Mock lucide-react
vi.mock('lucide-react', () => ({
  ArrowUpRight: () => <span data-testid="arrow-up-right" />,
  ArrowDownRight: () => <span data-testid="arrow-down-right" />,
  AlertTriangle: () => <span data-testid="alert-triangle" />,
  ChevronDown: () => <span data-testid="chevron-down" />,
  ChevronUp: () => <span data-testid="chevron-up" />,
}));

// ─── Test fixtures ──────────────────────────────────────────────

const CHART_DATA: ChartDataSpec = {
  data: [
    { month: '1월', revenue: 100 },
    { month: '2월', revenue: 120 },
    { month: '3월', revenue: 140 },
  ],
  series: [{ dataKey: 'revenue', name: '매출', color: '#FF3C42' }],
  xAxisKey: 'month',
  yAxisLabel: '매출 (억원)',
};

const KPI_DATA: KPIDataSpec = {
  label: '매출 성장률',
  value: '₩42억',
  change: { value: 13.5, direction: 'up' },
  subtitle: '목표 37억 초과 달성',
};

const STAT_GRID_DATA: StatGridDataSpec = {
  items: [
    { label: '매출', value: '₩42억', change: { value: 13.5, direction: 'up' } },
    { label: '원가', value: '8.2%', change: { value: 2.1, direction: 'down' } },
  ],
};

const TABLE_DATA: TableDataSpec = {
  columns: [
    { key: 'name', label: '이름' },
    { key: 'amount', label: '금액' },
  ],
  rows: [
    { name: '제품 A', amount: 1000 },
    { name: '제품 B', amount: 2000 },
  ],
};

// =============================================
// parseGenerativeUISpec — JSON 파싱 검증
// =============================================

describe('parseGenerativeUISpec', () => {
  it('parses a valid bar-chart spec', () => {
    const result = parseGenerativeUISpec({
      type: 'bar-chart',
      title: '월별 매출',
      data: CHART_DATA,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.spec.type).toBe('bar-chart');
      expect(result.spec.title).toBe('월별 매출');
    }
  });

  it('parses a valid kpi-card spec', () => {
    const result = parseGenerativeUISpec({
      type: 'kpi-card',
      data: KPI_DATA,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.spec.type).toBe('kpi-card');
    }
  });

  it('parses a valid stat-grid spec', () => {
    const result = parseGenerativeUISpec({
      type: 'stat-grid',
      data: STAT_GRID_DATA,
    });
    expect(result.success).toBe(true);
  });

  it('parses a valid data-table spec', () => {
    const result = parseGenerativeUISpec({
      type: 'data-table',
      data: TABLE_DATA,
    });
    expect(result.success).toBe(true);
  });

  it('rejects null input', () => {
    const result = parseGenerativeUISpec(null);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('not an object');
    }
  });

  it('rejects invalid type', () => {
    const result = parseGenerativeUISpec({ type: 'unknown-type', data: {} });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid type');
    }
  });

  it('rejects missing data field', () => {
    const result = parseGenerativeUISpec({ type: 'bar-chart' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Missing "data"');
    }
  });

  it('rejects invalid data structure for chart', () => {
    const result = parseGenerativeUISpec({
      type: 'bar-chart',
      data: { invalid: true },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data structure');
    }
  });

  it('preserves optional fields (title, description, options, layout)', () => {
    const result = parseGenerativeUISpec({
      type: 'bar-chart',
      title: 'Test',
      description: 'Description',
      data: CHART_DATA,
      options: { animate: true },
      layout: { width: 'full' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.spec.title).toBe('Test');
      expect(result.spec.description).toBe('Description');
      expect(result.spec.options).toEqual({ animate: true });
      expect(result.spec.layout).toEqual({ width: 'full' });
    }
  });
});

// =============================================
// extractGenerativeUIFromMessage — 코드 펜스 추출
// =============================================

describe('extractGenerativeUIFromMessage', () => {
  it('extracts valid generative-ui JSON from message', () => {
    const message = `결과를 보여드리겠습니다.

\`\`\`generative-ui
{"type":"bar-chart","title":"매출","data":{"data":[{"m":"1월","v":100}],"series":[{"dataKey":"v","name":"값","color":"red"}],"xAxisKey":"m"}}
\`\`\`

위 차트를 확인해주세요.`;

    const result = extractGenerativeUIFromMessage(message);
    expect(result).not.toBeNull();
    expect(result?.success).toBe(true);
  });

  it('returns null when no code fence exists', () => {
    const result = extractGenerativeUIFromMessage('일반 텍스트 메시지입니다.');
    expect(result).toBeNull();
  });

  it('returns error for invalid JSON in code fence', () => {
    const message = '```generative-ui\n{invalid json}\n```';
    const result = extractGenerativeUIFromMessage(message);
    expect(result).not.toBeNull();
    expect(result?.success).toBe(false);
  });
});

// =============================================
// GenerativeUIRenderer — type 기반 dispatch
// =============================================

describe('GenerativeUIRenderer', () => {
  it('renders without error', () => {
    const spec: GenerativeUISpec = {
      type: 'bar-chart',
      title: '테스트 차트',
      data: CHART_DATA,
    };
    render(<GenerativeUIRenderer spec={spec} />);
    expect(screen.getByTestId('generative-ui-renderer')).toBeInTheDocument();
  });

  it('renders bar-chart type', () => {
    const spec: GenerativeUISpec = { type: 'bar-chart', data: CHART_DATA };
    render(<GenerativeUIRenderer spec={spec} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders line-chart type', () => {
    const spec: GenerativeUISpec = { type: 'line-chart', data: CHART_DATA };
    render(<GenerativeUIRenderer spec={spec} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders pie-chart type', () => {
    const spec: GenerativeUISpec = { type: 'pie-chart', data: CHART_DATA };
    render(<GenerativeUIRenderer spec={spec} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders area-chart type', () => {
    const spec: GenerativeUISpec = { type: 'area-chart', data: CHART_DATA };
    render(<GenerativeUIRenderer spec={spec} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders composed-chart type', () => {
    const spec: GenerativeUISpec = {
      type: 'composed-chart',
      data: {
        ...CHART_DATA,
        series: [
          { dataKey: 'revenue', name: '매출', color: '#FF3C42', type: 'bar' },
          { dataKey: 'growth', name: '성장률', color: '#3B82F6', type: 'line' },
        ],
      },
    };
    render(<GenerativeUIRenderer spec={spec} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders data-table type', () => {
    const spec: GenerativeUISpec = { type: 'data-table', data: TABLE_DATA };
    render(<GenerativeUIRenderer spec={spec} />);
    expect(screen.getByTestId('generative-ui-table')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('이름')).toBeInTheDocument();
    expect(screen.getByText('제품 A')).toBeInTheDocument();
  });

  it('renders kpi-card type', () => {
    const spec: GenerativeUISpec = { type: 'kpi-card', data: KPI_DATA };
    render(<GenerativeUIRenderer spec={spec} />);
    expect(screen.getByTestId('generative-ui-kpi')).toBeInTheDocument();
    expect(screen.getByText('매출 성장률')).toBeInTheDocument();
    expect(screen.getByText('₩42억')).toBeInTheDocument();
  });

  it('renders stat-grid type', () => {
    const spec: GenerativeUISpec = { type: 'stat-grid', data: STAT_GRID_DATA };
    render(<GenerativeUIRenderer spec={spec} />);
    expect(screen.getByTestId('generative-ui-stat-grid')).toBeInTheDocument();
    expect(screen.getByText('매출')).toBeInTheDocument();
    expect(screen.getByText('원가')).toBeInTheDocument();
  });

  it('renders title and description', () => {
    const spec: GenerativeUISpec = {
      type: 'kpi-card',
      title: '차트 제목',
      description: '차트 설명',
      data: KPI_DATA,
    };
    render(<GenerativeUIRenderer spec={spec} />);
    expect(screen.getByText('차트 제목')).toBeInTheDocument();
    expect(screen.getByText('차트 설명')).toBeInTheDocument();
  });

  it('renders fallback for invalid spec', () => {
    // Pass an object that will fail re-validation
    const invalidSpec = { type: 'invalid-type', data: {} } as unknown as GenerativeUISpec;
    render(<GenerativeUIRenderer spec={invalidSpec} />);
    expect(screen.getByTestId('generative-ui-fallback')).toBeInTheDocument();
  });

  it('calls onError for invalid spec', () => {
    const onError = vi.fn();
    const invalidSpec = { type: 'invalid-type', data: {} } as unknown as GenerativeUISpec;
    render(<GenerativeUIRenderer spec={invalidSpec} onError={onError} />);
    expect(onError).toHaveBeenCalled();
  });
});

// =============================================
// GenerativeUIFallback — 에러 표시
// =============================================

describe('GenerativeUIFallback', () => {
  it('renders error message', () => {
    render(<GenerativeUIFallback error="테스트 에러" />);
    expect(screen.getByTestId('generative-ui-fallback')).toBeInTheDocument();
    expect(screen.getByText('렌더링할 수 없습니다')).toBeInTheDocument();
    expect(screen.getByText('테스트 에러')).toBeInTheDocument();
  });

  it('shows raw data when toggle clicked', async () => {
    const user = userEvent.setup();
    render(<GenerativeUIFallback error="에러" rawData={{ foo: 'bar' }} />);

    const toggleButton = screen.getByText('원본 데이터 보기');
    await user.click(toggleButton);

    expect(screen.getByText(/"foo": "bar"/)).toBeInTheDocument();
  });

  it('does not show raw data toggle when rawData is undefined', () => {
    render(<GenerativeUIFallback error="에러" />);
    expect(screen.queryByText('원본 데이터 보기')).not.toBeInTheDocument();
  });
});
