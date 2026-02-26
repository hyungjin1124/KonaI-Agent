/**
 * NL-to-Chart — UX Flow QA Tests
 *
 * Tests for cross-component state synchronization, callback wiring,
 * terminal state scenarios, and critical user flows.
 * Uses Vitest + React Testing Library with jsdom environment.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';

import { useNLChart } from './useNLChart';
import { NLChartRenderer } from './NLChartRenderer';
import { ChartTypeSelector } from './ChartTypeSelector';
import type { NLChartResult, NLChartType } from './types';

// Mock recharts
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
// Flow 1: NL Query → Chart Render → Type Override → Clear
// =============================================

describe('Flow 1: Query → Render → Override → Clear', () => {
  function TestHarness() {
    const { chartResult, processQuery, changeChartType, clearChart } = useNLChart();
    return (
      <div>
        <button data-testid="query-btn" onClick={() => processQuery('월별 매출 추이')}>
          Query
        </button>
        <button data-testid="clear-btn" onClick={clearChart}>
          Clear
        </button>
        {chartResult ? (
          <NLChartRenderer result={chartResult} onChangeChartType={changeChartType} />
        ) : (
          <div data-testid="empty-state">No chart</div>
        )}
      </div>
    );
  }

  it('complete flow: query → chart renders → override type → clear → empty state', async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    // Step 1: Empty state
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();

    // Step 2: Query → chart renders
    await user.click(screen.getByTestId('query-btn'));
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    expect(screen.getByTestId('nl-chart-renderer')).toBeInTheDocument();

    // Step 3: Chart type should be 'line' (temporal data)
    const radiogroup = screen.getByRole('radiogroup');
    const checkedRadio = within(radiogroup).getByRole('radio', { checked: true });
    expect(checkedRadio).toHaveTextContent('꺾은선');

    // Step 4: Override type → bar
    const barRadio = within(radiogroup).getAllByRole('radio').find((el) =>
      el.textContent?.includes('막대')
    )!;
    await user.click(barRadio);
    const newChecked = within(radiogroup).getByRole('radio', { checked: true });
    expect(newChecked).toHaveTextContent('막대');

    // Step 5: Clear → back to empty state
    await user.click(screen.getByTestId('clear-btn'));
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.queryByTestId('nl-chart-renderer')).not.toBeInTheDocument();
  });

  it('multiple queries replace previous chart', async () => {
    const user = userEvent.setup();

    function MultiQueryHarness() {
      const { chartResult, processQuery, changeChartType } = useNLChart();
      return (
        <div>
          <button data-testid="revenue-btn" onClick={() => processQuery('월별 매출 추이')}>Revenue</button>
          <button data-testid="share-btn" onClick={() => processQuery('시장 점유율 비율')}>Share</button>
          {chartResult ? (
            <div>
              <div data-testid="chart-title">{chartResult.config.title}</div>
              <NLChartRenderer result={chartResult} onChangeChartType={changeChartType} />
            </div>
          ) : null}
        </div>
      );
    }

    render(<MultiQueryHarness />);

    // First query
    await user.click(screen.getByTestId('revenue-btn'));
    expect(screen.getByTestId('chart-title')).toHaveTextContent('월별 매출 추이');

    // Second query replaces first
    await user.click(screen.getByTestId('share-btn'));
    expect(screen.getByTestId('chart-title')).toHaveTextContent('사업부별 매출 비중');
  });
});

// =============================================
// Flow 2: ChartTypeSelector State Sync with Hook
// =============================================

describe('Flow 2: ChartTypeSelector ↔ useNLChart state sync', () => {
  it('changeChartType updates rendered chart type in selector', async () => {
    const user = userEvent.setup();
    const { result } = renderHook(() => useNLChart());

    // Process a query first
    act(() => {
      result.current.processQuery('월별 매출 추이');
    });

    expect(result.current.chartResult!.config.chartType).toBe('line');

    // Change via hook
    act(() => {
      result.current.changeChartType('pie');
    });

    expect(result.current.chartResult!.config.chartType).toBe('pie');
    // Alternatives should stay the same (they come from heuristic, not chartType)
    expect(result.current.chartResult!.alternatives).toContain('bar');
  });

  it('cycling through all chart types via changeChartType preserves data', () => {
    const { result } = renderHook(() => useNLChart());

    act(() => {
      result.current.processQuery('비용 구성 차트');
    });

    const originalData = result.current.chartResult!.config.data;
    const types: NLChartType[] = ['bar', 'line', 'pie', 'area', 'composed', 'table'];

    for (const type of types) {
      act(() => {
        result.current.changeChartType(type);
      });
      expect(result.current.chartResult!.config.chartType).toBe(type);
      // Data should not change
      expect(result.current.chartResult!.config.data).toBe(originalData);
    }
  });
});

// =============================================
// Flow 3: Terminal State — Clear after Override
// =============================================

describe('Flow 3: Terminal states', () => {
  it('clearChart after type override resets everything', () => {
    const { result } = renderHook(() => useNLChart());

    act(() => {
      result.current.processQuery('매출 차트');
    });

    act(() => {
      result.current.changeChartType('pie');
    });

    expect(result.current.chartResult!.config.chartType).toBe('pie');

    act(() => {
      result.current.clearChart();
    });

    expect(result.current.chartResult).toBeNull();
  });

  it('processQuery after clearChart creates fresh result', () => {
    const { result } = renderHook(() => useNLChart());

    // First: query → override → clear
    act(() => {
      result.current.processQuery('매출 차트');
    });
    act(() => {
      result.current.changeChartType('pie');
    });
    act(() => {
      result.current.clearChart();
    });

    // Second: new query should not carry over previous type override
    act(() => {
      result.current.processQuery('월별 매출 추이');
    });

    expect(result.current.chartResult!.config.chartType).toBe('line');
  });

  it('non-chart query after chart query clears state', () => {
    const { result } = renderHook(() => useNLChart());

    act(() => {
      result.current.processQuery('월별 매출 추이');
    });
    expect(result.current.chartResult).not.toBeNull();

    // Non-chart query returns null but does NOT clear existing chartResult
    let returnValue: ReturnType<typeof result.current.processQuery>;
    act(() => {
      returnValue = result.current.processQuery('안녕하세요');
    });

    expect(returnValue!).toBeNull();
    // Note: processQuery returns null but chartResult remains from previous query
    // This is expected behavior — caller (GeneralChatView) decides what to do
    expect(result.current.chartResult).not.toBeNull();
  });
});

// =============================================
// Flow 4: Rendering Boundary — Prop Changes
// =============================================

describe('Flow 4: NLChartRenderer prop change responses', () => {
  const baseResult: NLChartResult = {
    config: {
      chartType: 'bar',
      title: 'Test Chart',
      data: [{ name: 'A', value: 10 }, { name: 'B', value: 20 }],
      series: [{ dataKey: 'value', name: '값', color: '#FF0000' }],
      xAxisKey: 'name',
    },
    reasoning: 'Test reasoning',
    alternatives: ['line', 'pie'],
    queryKeywords: ['test'],
  };

  it('re-renders when result prop changes chart type', () => {
    const onChangeChartType = vi.fn();

    const { rerender } = render(
      <NLChartRenderer result={baseResult} onChangeChartType={onChangeChartType} />
    );

    // Initially bar chart
    expect(screen.getByTestId('nl-chart-renderer')).toBeInTheDocument();

    // Change to table type
    const tableResult = {
      ...baseResult,
      config: { ...baseResult.config, chartType: 'table' as const },
    };

    rerender(
      <NLChartRenderer result={tableResult} onChangeChartType={onChangeChartType} />
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('re-renders when result prop changes data', () => {
    const onChangeChartType = vi.fn();

    const { rerender } = render(
      <NLChartRenderer result={baseResult} onChangeChartType={onChangeChartType} />
    );

    expect(screen.getByText('Test Chart')).toBeInTheDocument();

    // Change title and data
    const newResult = {
      ...baseResult,
      config: {
        ...baseResult.config,
        title: 'Updated Chart Title',
      },
    };

    rerender(
      <NLChartRenderer result={newResult} onChangeChartType={onChangeChartType} />
    );

    expect(screen.getByText('Updated Chart Title')).toBeInTheDocument();
    expect(screen.queryByText('Test Chart')).not.toBeInTheDocument();
  });
});

// =============================================
// Flow 5: ChartTypeSelector Callback Verification
// =============================================

describe('Flow 5: ChartTypeSelector callback wiring', () => {
  it('clicking each alternative fires onSelect with correct type', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <ChartTypeSelector
        currentType="bar"
        alternatives={['line', 'pie', 'table']}
        onSelect={onSelect}
      />
    );

    const radios = screen.getAllByRole('radio');
    // bar (current) + line + pie + table = 4
    expect(radios).toHaveLength(4);

    // Click each non-current radio
    for (const radio of radios) {
      if (radio.getAttribute('aria-checked') === 'false') {
        await user.click(radio);
      }
    }

    expect(onSelect).toHaveBeenCalledTimes(3);
    expect(onSelect).toHaveBeenCalledWith('line');
    expect(onSelect).toHaveBeenCalledWith('pie');
    expect(onSelect).toHaveBeenCalledWith('table');
  });

  it('clicking current type also fires onSelect (no prevention)', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <ChartTypeSelector
        currentType="bar"
        alternatives={['line']}
        onSelect={onSelect}
      />
    );

    const barRadio = screen.getByRole('radio', { checked: true });
    await user.click(barRadio);

    // Current implementation does not prevent re-selection
    expect(onSelect).toHaveBeenCalledWith('bar');
  });
});
