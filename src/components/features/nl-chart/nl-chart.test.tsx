/**
 * NL-to-Chart — Unit Tests
 *
 * Tests for heuristics, hook, and renderer components.
 * Phase 1 + Phase 2 (dashboard, advanced chart types).
 * Uses Vitest + React Testing Library with jsdom environment.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';

import { isChartQuery, isDashboardQuery, recommendChartType } from './chartHeuristics';
import { findMatchingDataset, MOCK_DATASETS } from './mockChartData';
import { findMatchingDashboard } from './mockDashboardConfigs';
import { useNLChart } from './useNLChart';
import { NLChartRenderer } from './NLChartRenderer';
import { ChartTypeSelector } from './ChartTypeSelector';
import { HeatmapChart } from './HeatmapChart';
import type { NLChartResult, DatasetMeta, HeatmapDataPoint } from './types';

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
    Sankey: (props: Record<string, unknown>) => <div data-testid="recharts-sankey" data-node-count={JSON.stringify(props.data)} />,
    Treemap: (props: Record<string, unknown>) => <div data-testid="recharts-treemap" data-key={props.dataKey as string} />,
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

  it('detects Phase 2 advanced chart keywords', () => {
    expect(isChartQuery('채널 흐름 플로우')).toBe(true);
    expect(isChartQuery('히트맵 성과 분석')).toBe(true);
    expect(isChartQuery('워터폴 증감')).toBe(true);
    expect(isChartQuery('트리맵 항목별')).toBe(true);
  });
});

// =============================================
// isDashboardQuery — 대시보드 쿼리 감지
// =============================================

describe('isDashboardQuery', () => {
  it('detects dashboard-related keywords', () => {
    expect(isDashboardQuery('종합 현황 대시보드 보여줘')).toBe(true);
    expect(isDashboardQuery('한 화면에 전체 현황')).toBe(true);
    expect(isDashboardQuery('경영 오버뷰 보여줘')).toBe(true);
  });

  it('returns false for single-chart queries', () => {
    expect(isDashboardQuery('월별 매출 추이 보여줘')).toBe(false);
    expect(isDashboardQuery('사업부별 비교 차트')).toBe(false);
  });

  it('returns false for non-chart queries', () => {
    expect(isDashboardQuery('안녕하세요')).toBe(false);
  });

  it('detects advanced analytics dashboard', () => {
    expect(isDashboardQuery('심층 분석 대시보드')).toBe(true);
    expect(isDashboardQuery('고급 분석 화면')).toBe(true);
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
    const result = recommendChartType('월별 매출 비교', dataset);
    expect(result.recommended).toBe('bar');
  });

  it('falls back to data type when no keyword matched', () => {
    const dataset = MOCK_DATASETS.find((d) => d.id === 'monthly_revenue')!;
    const result = recommendChartType('알려줘', dataset);
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

  // Phase 2: 고급 차트 타입 추천
  it('recommends sankey for flow data type', () => {
    const dataset = MOCK_DATASETS.find((d) => d.id === 'revenue_flow')!;
    const result = recommendChartType('채널 확인', dataset);
    expect(result.recommended).toBe('sankey');
  });

  it('recommends treemap for hierarchical data type', () => {
    const dataset = MOCK_DATASETS.find((d) => d.id === 'budget_hierarchy')!;
    const result = recommendChartType('예산 확인', dataset);
    expect(result.recommended).toBe('treemap');
  });

  it('recommends heatmap for matrix data type', () => {
    const dataset = MOCK_DATASETS.find((d) => d.id === 'monthly_division_performance')!;
    const result = recommendChartType('성과 확인', dataset);
    expect(result.recommended).toBe('heatmap');
  });

  it('recommends sankey for flow keyword', () => {
    const dataset = MOCK_DATASETS.find((d) => d.id === 'monthly_revenue')!;
    const result = recommendChartType('채널 전환 흐름', dataset);
    expect(result.recommended).toBe('sankey');
  });

  it('recommends waterfall for waterfall keyword', () => {
    const dataset = MOCK_DATASETS.find((d) => d.id === 'quarterly_waterfall')!;
    const result = recommendChartType('증감 요인', dataset);
    expect(result.recommended).toBe('waterfall');
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

  // Phase 2: 고급 데이터셋 매칭
  it('matches sankey flow dataset', () => {
    const dataset = findMatchingDataset('채널 전환 흐름');
    expect(dataset.id).toBe('revenue_flow');
    expect(dataset.sankeyData).toBeDefined();
    expect(dataset.sankeyData!.nodes.length).toBeGreaterThan(0);
  });

  it('matches treemap dataset', () => {
    const dataset = findMatchingDataset('예산 계층 트리맵');
    expect(dataset.id).toBe('budget_hierarchy');
    expect(dataset.treemapData).toBeDefined();
  });

  it('matches heatmap dataset', () => {
    const dataset = findMatchingDataset('월별 부서별 히트맵 성과');
    expect(dataset.id).toBe('monthly_division_performance');
    expect(dataset.heatmapData).toBeDefined();
  });

  it('matches waterfall dataset', () => {
    const dataset = findMatchingDataset('분기 매출 증감 워터폴');
    expect(dataset.id).toBe('quarterly_waterfall');
  });
});

// =============================================
// findMatchingDashboard — 대시보드 매칭
// =============================================

describe('findMatchingDashboard', () => {
  it('matches executive overview dashboard', () => {
    const result = findMatchingDashboard('종합 현황 대시보드');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('executive_overview');
    expect(result!.config.widgets.length).toBeGreaterThanOrEqual(2);
  });

  it('matches advanced analytics dashboard', () => {
    const result = findMatchingDashboard('고급 심층 분석');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('advanced_analytics');
  });

  it('returns default dashboard for unmatched query', () => {
    const result = findMatchingDashboard('anything');
    expect(result).not.toBeNull();
  });

  it('dashboard config has valid layout', () => {
    const result = findMatchingDashboard('종합 현황 대시보드');
    expect(result!.config.layout.length).toBe(result!.config.widgets.length);
    result!.config.layout.forEach((item) => {
      expect(item.w).toBeGreaterThan(0);
      expect(item.w).toBeLessThanOrEqual(12);
      expect(item.h).toBeGreaterThan(0);
    });
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

  // Phase 2: Dashboard tests
  it('processes dashboard query', () => {
    const { result } = renderHook(() => useNLChart());

    act(() => {
      result.current.processDashboardQuery('종합 현황 대시보드 보여줘');
    });

    expect(result.current.dashboardResult).not.toBeNull();
    expect(result.current.dashboardResult!.dashboardConfig.widgets.length).toBeGreaterThanOrEqual(2);
    expect(result.current.dashboardResult!.reasoning).toBeTruthy();
  });

  it('returns null for non-dashboard queries', () => {
    const { result } = renderHook(() => useNLChart());
    let processResult: ReturnType<typeof result.current.processDashboardQuery>;

    act(() => {
      processResult = result.current.processDashboardQuery('월별 매출 추이');
    });

    expect(processResult!).toBeNull();
    expect(result.current.dashboardResult).toBeNull();
  });

  it('supports widget chart type change', () => {
    const { result } = renderHook(() => useNLChart());

    act(() => {
      result.current.processDashboardQuery('종합 현황 대시보드');
    });

    const firstWidgetId = result.current.dashboardResult!.dashboardConfig.widgets[0].id;
    const originalType = result.current.dashboardResult!.dashboardConfig.widgets[0].config.chartType;

    act(() => {
      result.current.changeWidgetChartType(firstWidgetId, 'bar');
    });

    expect(result.current.dashboardResult!.dashboardConfig.widgets[0].config.chartType).toBe('bar');
    // Other widgets unchanged
    if (result.current.dashboardResult!.dashboardConfig.widgets.length > 1) {
      expect(result.current.dashboardResult!.dashboardConfig.widgets[1].config.chartType).not.toBe('bar');
    }
  });

  it('clears dashboard result', () => {
    const { result } = renderHook(() => useNLChart());

    act(() => {
      result.current.processDashboardQuery('대시보드');
    });

    expect(result.current.dashboardResult).not.toBeNull();

    act(() => {
      result.current.clearDashboard();
    });

    expect(result.current.dashboardResult).toBeNull();
  });

  it('processes sankey chart query', () => {
    const { result } = renderHook(() => useNLChart());

    act(() => {
      result.current.processQuery('채널 전환 흐름 보여줘');
    });

    expect(result.current.chartResult).not.toBeNull();
    expect(result.current.chartResult!.config.chartType).toBe('sankey');
    expect(result.current.chartResult!.config.sankeyData).toBeDefined();
  });

  it('processes heatmap chart query', () => {
    const { result } = renderHook(() => useNLChart());

    act(() => {
      result.current.processQuery('월별 부서별 히트맵 성과 보여줘');
    });

    expect(result.current.chartResult).not.toBeNull();
    expect(result.current.chartResult!.config.chartType).toBe('heatmap');
    expect(result.current.chartResult!.config.heatmapData).toBeDefined();
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

  // Phase 2: Advanced chart rendering
  it('renders sankey chart', () => {
    const sankeyResult: NLChartResult = {
      config: {
        chartType: 'sankey',
        title: '매출 채널별 흐름',
        data: [],
        series: [],
        xAxisKey: 'name',
        sankeyData: {
          nodes: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
          links: [{ source: 0, target: 1, value: 100 }, { source: 1, target: 2, value: 80 }],
        },
      },
      reasoning: '흐름 분석',
      alternatives: ['table'],
      queryKeywords: ['흐름'],
    };
    render(<NLChartRenderer result={sankeyResult} onChangeChartType={onChangeChartType} />);
    expect(screen.getByTestId('recharts-sankey')).toBeInTheDocument();
  });

  it('renders treemap chart', () => {
    const treemapResult: NLChartResult = {
      config: {
        chartType: 'treemap',
        title: '예산 배분',
        data: [],
        series: [],
        xAxisKey: 'name',
        treemapData: [{ name: '경영지원', children: [{ name: '인건비', size: 180 }] }],
      },
      reasoning: '계층 분석',
      alternatives: ['bar'],
      queryKeywords: ['계층'],
    };
    render(<NLChartRenderer result={treemapResult} onChangeChartType={onChangeChartType} />);
    expect(screen.getByTestId('recharts-treemap')).toBeInTheDocument();
  });

  it('renders waterfall chart (via BarChart)', () => {
    const waterfallResult: NLChartResult = {
      config: {
        chartType: 'waterfall',
        title: '매출 증감 요인',
        data: [
          { category: '전기 매출', base: 0, value: 280, total: 280 },
          { category: '성장', base: 280, value: 45, total: 325 },
          { category: '비용', base: 325, value: -25, total: 300 },
        ],
        series: [{ dataKey: 'value', name: '증감', color: '#10B981' }],
        xAxisKey: 'category',
      },
      reasoning: '증감 분석',
      alternatives: ['bar'],
      queryKeywords: ['증감'],
    };
    render(<NLChartRenderer result={waterfallResult} onChangeChartType={onChangeChartType} />);
    // Waterfall renders via BarChart mock
    expect(screen.getByTestId('nl-chart-renderer')).toBeInTheDocument();
  });

  it('hides reasoning and selector in compact mode', () => {
    render(<NLChartRenderer result={mockResult} onChangeChartType={onChangeChartType} compact />);
    expect(screen.getByText('사업부별 매출 비교')).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.queryByText(/카테고리별 값을 비교/)).not.toBeInTheDocument();
  });
});

// =============================================
// HeatmapChart — 히트맵 렌더링
// =============================================

describe('HeatmapChart', () => {
  const mockHeatmapData: HeatmapDataPoint[] = [
    { x: '1월', y: '카드', value: 78 },
    { x: '2월', y: '카드', value: 82 },
    { x: '1월', y: '결제', value: 65 },
    { x: '2월', y: '결제', value: 72 },
  ];

  it('renders without error', () => {
    const { container } = render(<HeatmapChart data={mockHeatmapData} />);
    expect(container).toBeTruthy();
  });

  it('renders correct number of cells', () => {
    render(<HeatmapChart data={mockHeatmapData} />);
    const testEl = screen.getByTestId('heatmap-chart');
    const rects = testEl.querySelectorAll('rect');
    // 2 x-labels * 2 y-labels = 4 data cells + 1 legend rect = 5
    expect(rects.length).toBe(5);
  });

  it('displays cell values', () => {
    render(<HeatmapChart data={mockHeatmapData} />);
    expect(screen.getByText('78')).toBeInTheDocument();
    // 82 appears both as cell value and legend max label
    expect(screen.getAllByText('82').length).toBeGreaterThanOrEqual(1);
    // 65 appears both as cell value and legend min label
    expect(screen.getAllByText('65').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('72')).toBeInTheDocument();
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

  it('renders Phase 2 chart types', () => {
    render(
      <ChartTypeSelector
        currentType="sankey"
        alternatives={['treemap', 'heatmap', 'waterfall']}
        onSelect={onSelect}
      />
    );

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(4);
    expect(screen.getByText('Sankey')).toBeInTheDocument();
    expect(screen.getByText('트리맵')).toBeInTheDocument();
    expect(screen.getByText('히트맵')).toBeInTheDocument();
    expect(screen.getByText('워터폴')).toBeInTheDocument();
  });
});

// =============================================
// Phase 1 Regression — 단일 차트 호환성
// =============================================

describe('Phase 1 Regression', () => {
  it('single chart flow still works after Phase 2 changes', () => {
    const { result } = renderHook(() => useNLChart());

    act(() => {
      result.current.processQuery('월별 매출 추이 보여줘');
    });

    expect(result.current.chartResult).not.toBeNull();
    expect(result.current.chartResult!.config.chartType).toBe('line');
    expect(result.current.dashboardResult).toBeNull();
  });

  it('dashboard and chart states are independent', () => {
    const { result } = renderHook(() => useNLChart());

    act(() => {
      result.current.processQuery('매출 차트 보여줘');
    });

    act(() => {
      result.current.processDashboardQuery('종합 현황 대시보드');
    });

    expect(result.current.chartResult).not.toBeNull();
    expect(result.current.dashboardResult).not.toBeNull();

    act(() => {
      result.current.clearChart();
    });

    expect(result.current.chartResult).toBeNull();
    expect(result.current.dashboardResult).not.toBeNull();
  });
});
