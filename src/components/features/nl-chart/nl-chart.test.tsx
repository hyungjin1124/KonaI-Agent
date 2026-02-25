/**
 * NL-to-Chart — Unit Tests
 *
 * Tests for heuristics, hook, and renderer components.
 * Uses Vitest + React Testing Library with jsdom environment.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';

import { isChartQuery, recommendChartType } from './chartHeuristics';
import { findMatchingDataset, MOCK_DATASETS } from './mockChartData';
import { useNLChart } from './useNLChart';
import { NLChartRenderer } from './NLChartRenderer';
import { ChartTypeSelector } from './ChartTypeSelector';
import type { NLChartResult, DatasetMeta } from './types';

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

// =============================================
// isChartQuery — 차트 쿼리 감지
// =============================================

describe('isChartQuery', () => {
  it('detects Korean chart-related keywords', () => {
    expect(isChartQuery('월별 매출 추이 보여줘')).toBe(true);
    expect(isChartQuery('사업부별 비교 차트')).toBe(true);
    expect(isChartQuery('비율 분석해줘')).toBe(true);
    expect(isChartQuery('시각화 해줘')).toBe(true);
  });

  it('detects English chart-related keywords', () => {
    expect(isChartQuery('show me a chart')).toBe(true);
    expect(isChartQuery('compare trends')).toBe(true);
    expect(isChartQuery('visualize data')).toBe(true);
  });

  it('returns false for non-chart queries', () => {
    expect(isChartQuery('안녕하세요')).toBe(false);
    expect(isChartQuery('오늘 날씨 어때?')).toBe(false);
    expect(isChartQuery('회의실 예약해줘')).toBe(false);
  });

  it('handles data-related keywords', () => {
    expect(isChartQuery('매출 데이터를 보여줘')).toBe(true);
    expect(isChartQuery('수익 현황')).toBe(true);
  });
});

// =============================================
// recommendChartType — Heuristic 차트 타입 추천
// =============================================

describe('recommendChartType', () => {
  it('recommends bar for categorical data', () => {
    const dataset = MOCK_DATASETS.find((d) => d.id === 'revenue_comparison')!;
    const result = recommendChartType('사업부별 비교', dataset);
    expect(result.recommended).toBe('bar');
    expect(result.alternatives).not.toContain('bar');
    expect(result.reasoning).toBeTruthy();
  });

  it('recommends line for temporal data', () => {
    const dataset = MOCK_DATASETS.find((d) => d.id === 'monthly_revenue')!;
    const result = recommendChartType('월별 추이', dataset);
    expect(result.recommended).toBe('line');
  });

  it('recommends pie for ratio data', () => {
    const dataset = MOCK_DATASETS.find((d) => d.id === 'market_share')!;
    const result = recommendChartType('비율 분석', dataset);
    expect(result.recommended).toBe('pie');
  });

  it('prefers explicit keyword over data type heuristic', () => {
    const dataset = MOCK_DATASETS.find((d) => d.id === 'monthly_revenue')!;
    // 데이터는 temporal이지만, "비교" 키워드가 있으면 bar 추천
    const result = recommendChartType('월별 매출 비교', dataset);
    expect(result.recommended).toBe('bar');
  });

  it('falls back to data type when no keyword matched', () => {
    const dataset = MOCK_DATASETS.find((d) => d.id === 'monthly_revenue')!;
    const result = recommendChartType('알려줘', dataset);
    // temporal → line
    expect(result.recommended).toBe('line');
  });

  it('recommends composed for multi-metric categorical data', () => {
    const multiMetricDataset: DatasetMeta = {
      id: 'test',
      keywords: [],
      description: 'test',
      xAxisKey: 'name',
      xAxisLabel: '',
      yAxisLabel: '',
      dataType: 'categorical',
      metrics: ['metric1', 'metric2'],
      data: [],
      series: [],
    };
    const result = recommendChartType('확인', multiMetricDataset);
    expect(result.recommended).toBe('composed');
  });
});

// =============================================
// findMatchingDataset — 데이터셋 매칭
// =============================================

describe('findMatchingDataset', () => {
  it('matches monthly revenue dataset', () => {
    const dataset = findMatchingDataset('월별 매출 추이');
    expect(dataset.id).toBe('monthly_revenue');
  });

  it('matches comparison dataset', () => {
    const dataset = findMatchingDataset('사업부별 비교');
    expect(dataset.id).toBe('revenue_comparison');
  });

  it('matches market share dataset', () => {
    const dataset = findMatchingDataset('시장 점유율 비율');
    expect(dataset.id).toBe('market_share');
  });

  it('falls back to monthly_revenue for unknown queries', () => {
    const dataset = findMatchingDataset('알 수 없는 쿼리');
    expect(dataset.id).toBe('monthly_revenue');
  });
});

// =============================================
// useNLChart — Hook 테스트
// =============================================

describe('useNLChart', () => {
  it('returns null for non-chart queries', () => {
    const { result } = renderHook(() => useNLChart());
    let processResult: ReturnType<typeof result.current.processQuery>;

    act(() => {
      processResult = result.current.processQuery('안녕하세요');
    });

    expect(processResult!).toBeNull();
    expect(result.current.chartResult).toBeNull();
  });

  it('returns chart result for chart queries', () => {
    const { result } = renderHook(() => useNLChart());

    act(() => {
      result.current.processQuery('월별 매출 추이 보여줘');
    });

    expect(result.current.chartResult).not.toBeNull();
    expect(result.current.chartResult!.config.chartType).toBe('line');
    expect(result.current.chartResult!.config.data.length).toBeGreaterThan(0);
    expect(result.current.chartResult!.reasoning).toBeTruthy();
  });

  it('supports chart type override', () => {
    const { result } = renderHook(() => useNLChart());

    act(() => {
      result.current.processQuery('월별 매출 추이');
    });

    expect(result.current.chartResult!.config.chartType).toBe('line');

    act(() => {
      result.current.changeChartType('bar');
    });

    expect(result.current.chartResult!.config.chartType).toBe('bar');
  });

  it('clears chart result', () => {
    const { result } = renderHook(() => useNLChart());

    act(() => {
      result.current.processQuery('매출 차트');
    });

    expect(result.current.chartResult).not.toBeNull();

    act(() => {
      result.current.clearChart();
    });

    expect(result.current.chartResult).toBeNull();
  });
});

// =============================================
// NLChartRenderer — 렌더링 테스트
// =============================================

describe('NLChartRenderer', () => {
  const mockResult: NLChartResult = {
    config: {
      chartType: 'bar',
      title: '사업부별 매출 비교',
      data: [
        { division: '카드사업', revenue: 320 },
        { division: '결제사업', revenue: 280 },
      ],
      series: [{ dataKey: 'revenue', name: '매출', color: '#FF3C42' }],
      xAxisKey: 'division',
      xAxisLabel: '사업부',
      yAxisLabel: '매출 (억원)',
    },
    reasoning: '카테고리별 값을 비교하는 데 막대 차트가 적합합니다.',
    alternatives: ['pie', 'table'],
    queryKeywords: ['비교', '사업부'],
  };

  const onChangeChartType = vi.fn();

  it('renders without error', () => {
    const { container } = render(
      <NLChartRenderer result={mockResult} onChangeChartType={onChangeChartType} />
    );
    expect(container).toBeTruthy();
  });

  it('displays chart title', () => {
    render(<NLChartRenderer result={mockResult} onChangeChartType={onChangeChartType} />);
    expect(screen.getByText('사업부별 매출 비교')).toBeInTheDocument();
  });

  it('displays reasoning text', () => {
    render(<NLChartRenderer result={mockResult} onChangeChartType={onChangeChartType} />);
    expect(screen.getByText(/카테고리별 값을 비교/)).toBeInTheDocument();
  });

  it('renders chart type selector', () => {
    render(<NLChartRenderer result={mockResult} onChangeChartType={onChangeChartType} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders chart container', () => {
    render(<NLChartRenderer result={mockResult} onChangeChartType={onChangeChartType} />);
    expect(screen.getByTestId('nl-chart-renderer')).toBeInTheDocument();
  });

  it('renders table for table type', () => {
    const tableResult = {
      ...mockResult,
      config: { ...mockResult.config, chartType: 'table' as const },
    };
    render(<NLChartRenderer result={tableResult} onChangeChartType={onChangeChartType} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

// =============================================
// ChartTypeSelector — 차트 타입 선택 UI
// =============================================

describe('ChartTypeSelector', () => {
  const onSelect = vi.fn();

  it('renders all chart type options', () => {
    render(
      <ChartTypeSelector
        currentType="bar"
        alternatives={['line', 'pie']}
        onSelect={onSelect}
      />
    );

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3); // bar + line + pie
  });

  it('marks current type as checked', () => {
    render(
      <ChartTypeSelector
        currentType="bar"
        alternatives={['line', 'pie']}
        onSelect={onSelect}
      />
    );

    const checkedRadio = screen.getByRole('radio', { checked: true });
    expect(checkedRadio).toHaveTextContent('막대');
  });

  it('calls onSelect when clicking a different type', async () => {
    const user = userEvent.setup();
    render(
      <ChartTypeSelector
        currentType="bar"
        alternatives={['line', 'pie']}
        onSelect={onSelect}
      />
    );

    const lineButton = screen.getAllByRole('radio').find((el) =>
      el.textContent?.includes('꺾은선')
    )!;
    await user.click(lineButton);

    expect(onSelect).toHaveBeenCalledWith('line');
  });
});
