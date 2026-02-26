/**
 * NL-to-Chart -- QA Edge Case Tests
 *
 * Tests edge cases that developers might miss:
 * empty/whitespace inputs, very long strings, special characters,
 * rapid sequential calls, missing state, empty data/series,
 * idempotent operations, and deduplication behavior.
 *
 * Uses Vitest + React Testing Library with jsdom environment.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';

import { isChartQuery, recommendChartType } from './chartHeuristics';
import { findMatchingDataset, MOCK_DATASETS } from './mockChartData';
import { useNLChart } from './useNLChart';
import { NLChartRenderer } from './NLChartRenderer';
import { ChartTypeSelector } from './ChartTypeSelector';
import type { NLChartResult, NLChartType } from './types';

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
// Helpers
// =============================================

function makeResult(overrides: Partial<NLChartResult> = {}): NLChartResult {
  return {
    config: {
      chartType: 'bar',
      title: 'Test Chart',
      data: [{ category: 'A', value: 10 }],
      series: [{ dataKey: 'value', name: 'Value', color: '#FF3C42' }],
      xAxisKey: 'category',
      xAxisLabel: 'Category',
      yAxisLabel: 'Amount',
    },
    reasoning: 'Test reasoning',
    alternatives: ['line', 'pie'],
    queryKeywords: ['test'],
    ...overrides,
  };
}

const noop = vi.fn();

// =============================================
// 1. Empty/whitespace-only queries
// =============================================

describe('Edge: empty and whitespace-only queries', () => {
  it('isChartQuery returns false for empty string', () => {
    expect(isChartQuery('')).toBe(false);
  });

  it('isChartQuery returns false for whitespace-only string', () => {
    expect(isChartQuery('   ')).toBe(false);
    expect(isChartQuery('\t\n')).toBe(false);
  });

  it('processQuery returns null for empty string', () => {
    const { result } = renderHook(() => useNLChart());
    let processResult: ReturnType<typeof result.current.processQuery>;

    act(() => {
      processResult = result.current.processQuery('');
    });

    expect(processResult!).toBeNull();
    expect(result.current.chartResult).toBeNull();
  });

  it('processQuery returns null for whitespace-only string', () => {
    const { result } = renderHook(() => useNLChart());
    let processResult: ReturnType<typeof result.current.processQuery>;

    act(() => {
      processResult = result.current.processQuery('    ');
    });

    expect(processResult!).toBeNull();
    expect(result.current.chartResult).toBeNull();
  });
});

// =============================================
// 2. Very long queries
// =============================================

describe('Edge: very long queries', () => {
  it('detects chart keyword in a 1000+ character query', () => {
    const padding = 'a'.repeat(1000);
    const longQuery = `${padding} 차트 ${padding}`;
    expect(isChartQuery(longQuery)).toBe(true);
  });

  it('processQuery handles a long query containing a keyword', () => {
    const { result } = renderHook(() => useNLChart());
    const longQuery = 'x'.repeat(500) + ' 매출 추이 보여줘 ' + 'y'.repeat(500);

    act(() => {
      result.current.processQuery(longQuery);
    });

    expect(result.current.chartResult).not.toBeNull();
    expect(result.current.chartResult!.config.data.length).toBeGreaterThan(0);
  });

  it('isChartQuery returns false for a long query with no keywords', () => {
    const longQuery = 'abc '.repeat(500);
    expect(isChartQuery(longQuery)).toBe(false);
  });
});

// =============================================
// 3. Special characters in queries
// =============================================

describe('Edge: special characters in queries', () => {
  it('does not crash on emoji input', () => {
    expect(() => isChartQuery('Show me a chart')).not.toThrow();
    expect(isChartQuery('chart')).toBe(true);
  });

  it('does not crash on HTML entities', () => {
    expect(() => isChartQuery('<script>alert("xss")</script> chart')).not.toThrow();
    expect(isChartQuery('<b>chart</b>')).toBe(true);
  });

  it('handles unicode special characters gracefully', () => {
    expect(() => isChartQuery('\u0000\u200B\uFEFF')).not.toThrow();
    expect(isChartQuery('\u0000\u200B\uFEFF')).toBe(false);
  });

  it('handles regex-special characters without crashing', () => {
    expect(() => isChartQuery('매출 .*+?^${}()|[]\\ 차트')).not.toThrow();
    expect(isChartQuery('매출 .*+?^${}()|[]\\ 차트')).toBe(true);
  });

  it('findMatchingDataset does not crash on special characters', () => {
    expect(() => findMatchingDataset('<script>alert(1)</script>')).not.toThrow();
    const dataset = findMatchingDataset('<>!@#$%^&*()');
    expect(dataset).toBeDefined();
    expect(dataset.id).toBeTruthy();
  });
});

// =============================================
// 4. Rapid sequential processQuery calls
// =============================================

describe('Edge: rapid sequential processQuery calls', () => {
  it('last call wins when processQuery is called multiple times', () => {
    const { result } = renderHook(() => useNLChart());

    act(() => {
      result.current.processQuery('매출 비교 차트');
      result.current.processQuery('비율 분석 보여줘');
      result.current.processQuery('월별 추이 시각화');
    });

    // The last query should determine the final state
    expect(result.current.chartResult).not.toBeNull();
    expect(result.current.chartResult!.config.chartType).toBe('line');
  });

  it('processQuery followed by clearChart leaves chartResult null', () => {
    const { result } = renderHook(() => useNLChart());

    act(() => {
      result.current.processQuery('매출 차트');
      result.current.clearChart();
    });

    expect(result.current.chartResult).toBeNull();
  });

  it('alternating processQuery and clearChart leaves correct final state', () => {
    const { result } = renderHook(() => useNLChart());

    act(() => {
      result.current.processQuery('매출 차트');
    });

    act(() => {
      result.current.clearChart();
    });

    act(() => {
      result.current.processQuery('비율 분석 보여줘');
    });

    expect(result.current.chartResult).not.toBeNull();
    expect(result.current.chartResult!.config.chartType).toBe('pie');
  });
});

// =============================================
// 5. changeChartType with no prior chartResult
// =============================================

describe('Edge: changeChartType with no prior chartResult', () => {
  it('does not crash when chartResult is null', () => {
    const { result } = renderHook(() => useNLChart());

    expect(result.current.chartResult).toBeNull();

    expect(() => {
      act(() => {
        result.current.changeChartType('pie');
      });
    }).not.toThrow();

    expect(result.current.chartResult).toBeNull();
  });

  it('changeChartType after clearChart does not crash', () => {
    const { result } = renderHook(() => useNLChart());

    act(() => {
      result.current.processQuery('매출 차트');
    });

    act(() => {
      result.current.clearChart();
    });

    expect(() => {
      act(() => {
        result.current.changeChartType('line');
      });
    }).not.toThrow();

    expect(result.current.chartResult).toBeNull();
  });
});

// =============================================
// 6. NLChartRenderer with empty data array
// =============================================

describe('Edge: NLChartRenderer with empty data', () => {
  it('renders bar chart without crash when data is empty', () => {
    const emptyDataResult = makeResult({
      config: {
        chartType: 'bar',
        title: 'Empty Data Chart',
        data: [],
        series: [{ dataKey: 'value', name: 'Value', color: '#FF3C42' }],
        xAxisKey: 'category',
      },
    });

    expect(() => {
      render(<NLChartRenderer result={emptyDataResult} onChangeChartType={noop} />);
    }).not.toThrow();

    expect(screen.getByTestId('nl-chart-renderer')).toBeInTheDocument();
    expect(screen.getByText('Empty Data Chart')).toBeInTheDocument();
  });

  it('renders pie chart without crash when data is empty', () => {
    const emptyDataResult = makeResult({
      config: {
        chartType: 'pie',
        title: 'Empty Pie',
        data: [],
        series: [{ dataKey: 'value', name: 'Value', color: '#FF3C42' }],
        xAxisKey: 'name',
      },
    });

    expect(() => {
      render(<NLChartRenderer result={emptyDataResult} onChangeChartType={noop} />);
    }).not.toThrow();
  });

  it('renders table without crash when data is empty', () => {
    const emptyDataResult = makeResult({
      config: {
        chartType: 'table',
        title: 'Empty Table',
        data: [],
        series: [{ dataKey: 'value', name: 'Value', color: '#FF3C42' }],
        xAxisKey: 'category',
        xAxisLabel: 'Category',
      },
    });

    render(<NLChartRenderer result={emptyDataResult} onChangeChartType={noop} />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // Table should have headers but no body rows
    const tbody = table.querySelector('tbody');
    expect(tbody).toBeTruthy();
    expect(tbody!.querySelectorAll('tr')).toHaveLength(0);
  });

  it('renders line chart without crash when data is empty', () => {
    const emptyDataResult = makeResult({
      config: {
        chartType: 'line',
        title: 'Empty Line',
        data: [],
        series: [{ dataKey: 'value', name: 'Value', color: '#FF3C42' }],
        xAxisKey: 'month',
      },
    });

    expect(() => {
      render(<NLChartRenderer result={emptyDataResult} onChangeChartType={noop} />);
    }).not.toThrow();
  });

  it('renders area chart without crash when data is empty', () => {
    const emptyDataResult = makeResult({
      config: {
        chartType: 'area',
        title: 'Empty Area',
        data: [],
        series: [{ dataKey: 'value', name: 'Value', color: '#FF3C42' }],
        xAxisKey: 'month',
      },
    });

    expect(() => {
      render(<NLChartRenderer result={emptyDataResult} onChangeChartType={noop} />);
    }).not.toThrow();
  });

  it('renders composed chart without crash when data is empty', () => {
    const emptyDataResult = makeResult({
      config: {
        chartType: 'composed',
        title: 'Empty Composed',
        data: [],
        series: [{ dataKey: 'value', name: 'Value', color: '#FF3C42' }],
        xAxisKey: 'quarter',
      },
    });

    expect(() => {
      render(<NLChartRenderer result={emptyDataResult} onChangeChartType={noop} />);
    }).not.toThrow();
  });
});

// =============================================
// 7. NLChartRenderer with empty series
// =============================================

describe('Edge: NLChartRenderer with empty series', () => {
  it('renders bar chart without crash when series is empty', () => {
    const emptySeriesResult = makeResult({
      config: {
        chartType: 'bar',
        title: 'No Series Bar',
        data: [{ category: 'A', value: 10 }],
        series: [],
        xAxisKey: 'category',
      },
    });

    expect(() => {
      render(<NLChartRenderer result={emptySeriesResult} onChangeChartType={noop} />);
    }).not.toThrow();

    expect(screen.getByText('No Series Bar')).toBeInTheDocument();
  });

  it('renders pie chart without crash when series is empty', () => {
    const emptySeriesResult = makeResult({
      config: {
        chartType: 'pie',
        title: 'No Series Pie',
        data: [{ name: 'A', value: 10 }],
        series: [],
        xAxisKey: 'name',
      },
    });

    // pie uses series[0]?.dataKey ?? 'value', so it should fallback
    expect(() => {
      render(<NLChartRenderer result={emptySeriesResult} onChangeChartType={noop} />);
    }).not.toThrow();
  });

  it('renders table with only xAxisKey column when series is empty', () => {
    const emptySeriesResult = makeResult({
      config: {
        chartType: 'table',
        title: 'No Series Table',
        data: [{ category: 'A' }],
        series: [],
        xAxisKey: 'category',
        xAxisLabel: 'Category',
      },
    });

    render(<NLChartRenderer result={emptySeriesResult} onChangeChartType={noop} />);

    const table = screen.getByRole('table');
    const headers = within(table).getAllByRole('columnheader');
    expect(headers).toHaveLength(1);
    expect(headers[0]).toHaveTextContent('Category');
  });
});

// =============================================
// 8. NLChartRenderer with very long title/reasoning
// =============================================

describe('Edge: NLChartRenderer with very long title and reasoning', () => {
  it('renders and displays a 500+ character title', () => {
    const longTitle = 'A'.repeat(600);
    const longResult = makeResult({
      config: {
        ...makeResult().config,
        title: longTitle,
      },
    });

    render(<NLChartRenderer result={longResult} onChangeChartType={noop} />);

    const titleElement = screen.getByText(longTitle);
    expect(titleElement).toBeInTheDocument();
    expect(titleElement.textContent).toHaveLength(600);
  });

  it('renders and displays a 500+ character reasoning', () => {
    const longReasoning = 'B'.repeat(600);
    const longResult = makeResult({
      reasoning: longReasoning,
    });

    render(<NLChartRenderer result={longResult} onChangeChartType={noop} />);

    const reasoningElement = screen.getByText(longReasoning);
    expect(reasoningElement).toBeInTheDocument();
    expect(reasoningElement.textContent).toHaveLength(600);
  });

  it('renders without crash when both title and reasoning are long', () => {
    const longResult = makeResult({
      config: {
        ...makeResult().config,
        title: 'T'.repeat(1000),
      },
      reasoning: 'R'.repeat(1000),
    });

    expect(() => {
      render(<NLChartRenderer result={longResult} onChangeChartType={noop} />);
    }).not.toThrow();
  });
});

// =============================================
// 9. ChartTypeSelector with empty alternatives
// =============================================

describe('Edge: ChartTypeSelector with empty alternatives', () => {
  it('renders only the currentType when alternatives is empty', () => {
    render(
      <ChartTypeSelector currentType="bar" alternatives={[]} onSelect={noop} />
    );

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(1);
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(radios[0]).toHaveTextContent('막대');
  });

  it('the single button is still interactive', async () => {
    const onSelect = vi.fn();
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();

    render(
      <ChartTypeSelector currentType="pie" alternatives={[]} onSelect={onSelect} />
    );

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(1);

    await user.click(radios[0]);
    expect(onSelect).toHaveBeenCalledWith('pie');
  });
});

// =============================================
// 10. ChartTypeSelector with duplicate currentType in alternatives
// =============================================

describe('Edge: ChartTypeSelector deduplication', () => {
  it('filters duplicate when currentType appears in alternatives', () => {
    render(
      <ChartTypeSelector
        currentType="bar"
        alternatives={['bar', 'line']}
        onSelect={noop}
      />
    );

    const radios = screen.getAllByRole('radio');
    // Should be bar + line = 2, not bar + bar + line = 3
    expect(radios).toHaveLength(2);

    const checkedRadios = screen.getAllByRole('radio', { checked: true });
    expect(checkedRadios).toHaveLength(1);
  });

  it('handles alternatives with all duplicates of currentType', () => {
    render(
      <ChartTypeSelector
        currentType="pie"
        alternatives={['pie', 'pie', 'pie']}
        onSelect={noop}
      />
    );

    const radios = screen.getAllByRole('radio');
    // The filter removes all 'pie' from alternatives, leaving just the one currentType
    expect(radios).toHaveLength(1);
    expect(radios[0]).toHaveTextContent('파이');
  });
});

// =============================================
// 11. findMatchingDataset with empty string
// =============================================

describe('Edge: findMatchingDataset with empty or meaningless input', () => {
  it('returns first dataset for empty string', () => {
    const dataset = findMatchingDataset('');
    expect(dataset).toBeDefined();
    expect(dataset.id).toBe(MOCK_DATASETS[0].id);
  });

  it('returns first dataset for whitespace-only string', () => {
    const dataset = findMatchingDataset('   ');
    expect(dataset).toBeDefined();
    expect(dataset.id).toBe(MOCK_DATASETS[0].id);
  });

  it('returns a valid dataset structure for gibberish input', () => {
    const dataset = findMatchingDataset('xyzzy plugh');
    expect(dataset.id).toBeTruthy();
    expect(dataset.data).toBeDefined();
    expect(Array.isArray(dataset.data)).toBe(true);
    expect(dataset.series).toBeDefined();
    expect(Array.isArray(dataset.series)).toBe(true);
    expect(dataset.xAxisKey).toBeTruthy();
  });
});

// =============================================
// 12. Case sensitivity
// =============================================

describe('Edge: case sensitivity', () => {
  it('isChartQuery detects uppercase "CHART"', () => {
    expect(isChartQuery('SHOW ME A CHART')).toBe(true);
  });

  it('isChartQuery detects mixed-case "Chart"', () => {
    expect(isChartQuery('Chart data')).toBe(true);
  });

  it('isChartQuery detects uppercase "GRAPH"', () => {
    expect(isChartQuery('GRAPH of revenue')).toBe(true);
  });

  it('isChartQuery detects mixed-case "Trend"', () => {
    expect(isChartQuery('Revenue Trend')).toBe(true);
  });

  it('isChartQuery detects all-caps "VISUALIZE"', () => {
    expect(isChartQuery('VISUALIZE DATA')).toBe(true);
  });

  it('isChartQuery detects all-caps "COMPARE"', () => {
    expect(isChartQuery('COMPARE revenues')).toBe(true);
  });
});

// =============================================
// 13. clearChart is idempotent
// =============================================

describe('Edge: clearChart idempotency', () => {
  it('calling clearChart twice does not crash', () => {
    const { result } = renderHook(() => useNLChart());

    act(() => {
      result.current.processQuery('매출 차트');
    });

    expect(result.current.chartResult).not.toBeNull();

    expect(() => {
      act(() => {
        result.current.clearChart();
      });
      act(() => {
        result.current.clearChart();
      });
    }).not.toThrow();

    expect(result.current.chartResult).toBeNull();
  });

  it('calling clearChart on fresh hook (never processed) does not crash', () => {
    const { result } = renderHook(() => useNLChart());

    expect(result.current.chartResult).toBeNull();

    expect(() => {
      act(() => {
        result.current.clearChart();
      });
    }).not.toThrow();

    expect(result.current.chartResult).toBeNull();
  });

  it('calling clearChart three times in sequence does not crash', () => {
    const { result } = renderHook(() => useNLChart());

    expect(() => {
      act(() => {
        result.current.clearChart();
        result.current.clearChart();
        result.current.clearChart();
      });
    }).not.toThrow();

    expect(result.current.chartResult).toBeNull();
  });
});

// =============================================
// 14. Additional boundary edge cases
// =============================================

describe('Edge: recommendChartType with minimal dataset', () => {
  it('handles dataset with single data point', () => {
    const minimalDataset = {
      id: 'minimal',
      keywords: [],
      description: 'minimal',
      xAxisKey: 'x',
      xAxisLabel: 'X',
      yAxisLabel: 'Y',
      dataType: 'categorical' as const,
      metrics: ['m1'],
      data: [{ x: 'only', m1: 1 }],
      series: [{ dataKey: 'm1', name: 'M1', color: '#000' }],
    };

    expect(() => recommendChartType('test', minimalDataset)).not.toThrow();
    const result = recommendChartType('test', minimalDataset);
    expect(result.recommended).toBeTruthy();
    expect(result.alternatives.length).toBeGreaterThan(0);
  });

  it('handles dataset with empty metrics array', () => {
    const emptyMetricsDataset = {
      id: 'empty_metrics',
      keywords: [],
      description: 'no metrics',
      xAxisKey: 'x',
      xAxisLabel: 'X',
      yAxisLabel: 'Y',
      dataType: 'categorical' as const,
      metrics: [],
      data: [],
      series: [],
    };

    expect(() => recommendChartType('test', emptyMetricsDataset)).not.toThrow();
    const result = recommendChartType('test', emptyMetricsDataset);
    // metrics.length < 2, so should recommend bar for categorical
    expect(result.recommended).toBe('bar');
  });
});

describe('Edge: all chart types render without crash for each NLChartType', () => {
  const chartTypes: NLChartType[] = ['bar', 'line', 'pie', 'area', 'composed', 'table'];

  for (const chartType of chartTypes) {
    it(`renders ${chartType} type without crash`, () => {
      const result = makeResult({
        config: {
          chartType,
          title: `${chartType} test`,
          data: [{ category: 'A', value: 10 }],
          series: [{ dataKey: 'value', name: 'Value', color: '#FF3C42' }],
          xAxisKey: 'category',
        },
      });

      expect(() => {
        render(<NLChartRenderer result={result} onChangeChartType={noop} />);
      }).not.toThrow();
    });
  }
});
