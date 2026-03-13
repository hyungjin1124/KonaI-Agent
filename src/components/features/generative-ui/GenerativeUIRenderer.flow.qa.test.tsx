/**
 * Generative UI — Flow QA Tests (Phase 1 + Phase 2)
 *
 * QA Engineer가 작성한 UX 플로우 테스트.
 * Provider + 부모 컴포넌트를 함께 렌더링하여 상태 전파를 검증한다.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';

import { GenerativeUIRenderer } from './GenerativeUIRenderer';
import { InlineGenerativeUI } from './InlineGenerativeUI';
import { useInlineGenerativeUI } from './useInlineGenerativeUI';
import type { GenerativeUISpec, KPIDataSpec, GenerativeUIUpdateSpec } from './types';

// Mock recharts
vi.mock('recharts', () => {
  const MockComponent = ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="recharts-mock">{children}</div>
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

vi.mock('lucide-react', () => ({
  ArrowUpRight: () => <span data-testid="arrow-up-right" />,
  ArrowDownRight: () => <span data-testid="arrow-down-right" />,
  AlertTriangle: () => <span data-testid="alert-triangle" />,
  ChevronDown: () => <span data-testid="chevron-down" />,
  ChevronUp: () => <span data-testid="chevron-up" />,
  ExternalLink: () => <span data-testid="external-link" />,
}));

const makeCodeFenceMessage = (spec: GenerativeUISpec): string =>
  `분석 결과입니다:\n\n\`\`\`generative-ui\n${JSON.stringify(spec)}\n\`\`\`\n\n추가 분석이 필요하시면 말씀해주세요.`;

const VALID_BAR_CHART_SPEC: GenerativeUISpec = {
  type: 'bar-chart',
  title: '월별 매출 현황',
  data: {
    data: [{ month: 'Jan', revenue: 4200, cost: 2100 }],
    series: [
      { dataKey: 'revenue', name: '매출', color: '#FF3C42' },
      { dataKey: 'cost', name: '비용', color: '#3B82F6' },
    ],
    xAxisKey: 'month',
  },
};

// =============================================
// Flow 1: spec 전환 시나리오
// =============================================

describe('QA Flow: Spec Switching', () => {
  it('transitions between different chart types smoothly', () => {
    const chartData = {
      data: [{ m: '1월', v: 100 }],
      series: [{ dataKey: 'v', name: 'Value', color: '#FF3C42' }],
      xAxisKey: 'm',
    };

    const barSpec: GenerativeUISpec = { type: 'bar-chart', title: 'Bar Chart', data: chartData };
    const lineSpec: GenerativeUISpec = { type: 'line-chart', title: 'Line Chart', data: chartData };
    const pieSpec: GenerativeUISpec = { type: 'pie-chart', title: 'Pie Chart', data: chartData };

    const { rerender } = render(<GenerativeUIRenderer spec={barSpec} />);
    expect(screen.getByText('Bar Chart')).toBeInTheDocument();

    rerender(<GenerativeUIRenderer spec={lineSpec} />);
    expect(screen.getByText('Line Chart')).toBeInTheDocument();
    expect(screen.queryByText('Bar Chart')).not.toBeInTheDocument();

    rerender(<GenerativeUIRenderer spec={pieSpec} />);
    expect(screen.getByText('Pie Chart')).toBeInTheDocument();
    expect(screen.queryByText('Line Chart')).not.toBeInTheDocument();
  });

  it('transitions from chart to KPI card', () => {
    const chartData = {
      data: [{ m: '1월', v: 100 }],
      series: [{ dataKey: 'v', name: 'Value', color: '#FF3C42' }],
      xAxisKey: 'm',
    };
    const chartSpec: GenerativeUISpec = { type: 'bar-chart', data: chartData };
    const kpiSpec: GenerativeUISpec = {
      type: 'kpi-card',
      data: { label: 'Revenue', value: '₩42억' },
    };

    const { rerender } = render(<GenerativeUIRenderer spec={chartSpec} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();

    rerender(<GenerativeUIRenderer spec={kpiSpec} />);
    expect(screen.getByTestId('generative-ui-kpi')).toBeInTheDocument();
    expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument();
  });

  it('transitions from KPI to stat-grid preserving no leaked state', () => {
    const kpiSpec: GenerativeUISpec = {
      type: 'kpi-card',
      data: { label: 'Revenue', value: '₩42억' },
    };
    const statGridSpec: GenerativeUISpec = {
      type: 'stat-grid',
      data: {
        items: [
          { label: 'Metric A', value: 100 },
          { label: 'Metric B', value: 200 },
        ],
      },
    };

    const { rerender } = render(<GenerativeUIRenderer spec={kpiSpec} />);
    expect(screen.getByTestId('generative-ui-kpi')).toBeInTheDocument();

    rerender(<GenerativeUIRenderer spec={statGridSpec} />);
    expect(screen.getByTestId('generative-ui-stat-grid')).toBeInTheDocument();
    expect(screen.queryByText('₩42억')).not.toBeInTheDocument();
  });
});

// =============================================
// Flow 2: Fallback → Recovery
// =============================================

describe('QA Flow: Fallback Recovery', () => {
  it('recovers from fallback when valid spec is provided', () => {
    const invalidSpec = { type: 'unknown', data: {} } as unknown as GenerativeUISpec;
    const validSpec: GenerativeUISpec = {
      type: 'kpi-card',
      data: { label: 'Test', value: 100 },
    };

    const { rerender } = render(<GenerativeUIRenderer spec={invalidSpec} />);
    expect(screen.getByTestId('generative-ui-fallback')).toBeInTheDocument();

    rerender(<GenerativeUIRenderer spec={validSpec} />);
    expect(screen.getByTestId('generative-ui-kpi')).toBeInTheDocument();
    expect(screen.queryByTestId('generative-ui-fallback')).not.toBeInTheDocument();
  });

  it('onError is called only for invalid specs, not valid ones', () => {
    const onError = vi.fn();
    const invalidSpec = { type: 'bad', data: {} } as unknown as GenerativeUISpec;
    const validSpec: GenerativeUISpec = {
      type: 'kpi-card',
      data: { label: 'Test', value: 100 },
    };

    const { rerender } = render(<GenerativeUIRenderer spec={invalidSpec} onError={onError} />);
    expect(onError).toHaveBeenCalledTimes(1);

    rerender(<GenerativeUIRenderer spec={validSpec} onError={onError} />);
    expect(onError).toHaveBeenCalledTimes(1);
  });
});

// =============================================
// Flow 3: Multi-spec rendering (stat-grid as container)
// =============================================

describe('QA Flow: Stat-Grid as Multi-KPI Container', () => {
  it('renders multiple KPI cards inside stat-grid with correct grid layout', () => {
    const items: KPIDataSpec[] = [
      { label: 'Revenue', value: '₩42억', change: { value: 13.5, direction: 'up' } },
      { label: 'Cost', value: '8.2%', change: { value: 2.1, direction: 'down' } },
      { label: 'Users', value: 1500, change: { value: 22, direction: 'up' } },
      { label: 'Agents', value: 24 },
    ];

    const spec: GenerativeUISpec = {
      type: 'stat-grid',
      data: { items },
    };

    render(<GenerativeUIRenderer spec={spec} />);
    const grid = screen.getByTestId('generative-ui-stat-grid');

    expect(grid.style.gridTemplateColumns).toBe('repeat(2, 1fr)');
    expect(grid.children).toHaveLength(4);

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Cost')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Agents')).toBeInTheDocument();
  });

  it('renders 5 items with 3-column grid', () => {
    const items: KPIDataSpec[] = Array.from({ length: 5 }, (_, i) => ({
      label: `Metric ${i + 1}`,
      value: (i + 1) * 100,
    }));

    const spec: GenerativeUISpec = {
      type: 'stat-grid',
      data: { items },
    };

    render(<GenerativeUIRenderer spec={spec} />);
    const grid = screen.getByTestId('generative-ui-stat-grid');
    expect(grid.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
  });

  it('renders 1 item with 2-column grid (minimum)', () => {
    const items: KPIDataSpec[] = [
      { label: 'Only Metric', value: 42 },
    ];

    const spec: GenerativeUISpec = {
      type: 'stat-grid',
      data: { items },
    };

    render(<GenerativeUIRenderer spec={spec} />);
    const grid = screen.getByTestId('generative-ui-stat-grid');
    expect(grid.style.gridTemplateColumns).toBe('repeat(2, 1fr)');
  });
});

// =============================================
// Flow 4: Adapter → Renderer Integration
// =============================================

describe('QA Flow: Adapter Integration', () => {
  it('GenerativeUIRendererAdapter renders loading when spec is undefined', async () => {
    const { GenerativeUIRendererAdapter } = await import(
      '../agent-chat/components/ArtifactPreviewPanel/renderers/GenerativeUIRendererAdapter'
    );

    render(<GenerativeUIRendererAdapter onClose={() => {}} />);
    expect(screen.getByText('생성형 UI를 불러오는 중...')).toBeInTheDocument();
  });

  it('GenerativeUIRendererAdapter renders spec and transitions correctly', async () => {
    const { GenerativeUIRendererAdapter } = await import(
      '../agent-chat/components/ArtifactPreviewPanel/renderers/GenerativeUIRendererAdapter'
    );

    const spec: GenerativeUISpec = {
      type: 'kpi-card',
      data: { label: 'Revenue', value: '₩42억' },
    };

    const { rerender } = render(
      <GenerativeUIRendererAdapter spec={undefined} onClose={() => {}} />
    );
    expect(screen.getByText('생성형 UI를 불러오는 중...')).toBeInTheDocument();

    rerender(<GenerativeUIRendererAdapter spec={spec} onClose={() => {}} />);
    expect(screen.getByTestId('generative-ui-kpi')).toBeInTheDocument();
    expect(screen.queryByText('생성형 UI를 불러오는 중...')).not.toBeInTheDocument();
  });
});

// =============================================
// Flow 5: Phase 2 Ephemeral → Persistent 전환
// =============================================

describe('QA Flow: Phase 2 Ephemeral → Persistent Path', () => {
  it('InlineGenerativeUI renders inline, save button triggers artifact callback', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();

    render(
      <InlineGenerativeUI
        messageContent={makeCodeFenceMessage(VALID_BAR_CHART_SPEC)}
        messageId="msg-flow-1"
        onSaveToArtifact={onSave}
      />
    );

    // Step 1: Inline ephemeral rendering
    expect(screen.getByTestId('inline-generative-ui')).toBeInTheDocument();
    expect(screen.getByTestId('generative-ui-renderer')).toBeInTheDocument();

    // Step 2: Save to artifact
    await user.click(screen.getByTestId('save-to-artifact-button'));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'bar-chart', title: '월별 매출 현황' })
    );
  });

  it('Multiple messages with different specs render independently', () => {
    const kpiSpec: GenerativeUISpec = {
      type: 'kpi-card',
      data: { label: 'Revenue', value: '₩42억' },
    };
    const tableSpec: GenerativeUISpec = {
      type: 'data-table',
      data: {
        columns: [{ key: 'name', label: 'Name' }],
        rows: [{ name: 'Product A' }],
      },
    };

    render(
      <>
        <InlineGenerativeUI
          messageContent={makeCodeFenceMessage(VALID_BAR_CHART_SPEC)}
          messageId="msg-a"
        />
        <InlineGenerativeUI
          messageContent={makeCodeFenceMessage(kpiSpec)}
          messageId="msg-b"
        />
        <InlineGenerativeUI
          messageContent={makeCodeFenceMessage(tableSpec)}
          messageId="msg-c"
        />
      </>
    );

    const inlineUIs = screen.getAllByTestId('inline-generative-ui');
    expect(inlineUIs).toHaveLength(3);
  });
});

// =============================================
// Flow 6: Phase 2 Dynamic Update Chain
// =============================================

describe('QA Flow: Phase 2 Dynamic Update Chain', () => {
  it('update chain: initial → update title → update data → final state', () => {
    const update1: GenerativeUIUpdateSpec = {
      targetMessageId: 'msg-chain',
      update: { title: 'Updated Title' },
    };
    const update2: GenerativeUIUpdateSpec = {
      targetMessageId: 'msg-chain',
      update: {
        data: {
          data: [{ month: 'Mar', revenue: 5500, cost: 2800 }],
          series: [{ dataKey: 'revenue', name: '매출(수정)', color: '#10B981' }],
          xAxisKey: 'month',
        },
      },
    };

    const { result } = renderHook(() =>
      useInlineGenerativeUI({
        messageContent: makeCodeFenceMessage(VALID_BAR_CHART_SPEC),
        messageId: 'msg-chain',
        updates: [update1, update2],
      })
    );

    // Title from update1, data from update2, type from original
    expect(result.current.spec?.title).toBe('Updated Title');
    expect(result.current.spec?.type).toBe('bar-chart');
  });

  it('InlineGenerativeUI re-renders when updates prop changes', () => {
    const msg = makeCodeFenceMessage(VALID_BAR_CHART_SPEC);

    const { rerender } = render(
      <InlineGenerativeUI messageContent={msg} messageId="msg-rerender" />
    );
    expect(screen.getByText('월별 매출 현황')).toBeInTheDocument();

    const updates: GenerativeUIUpdateSpec[] = [
      { targetMessageId: 'msg-rerender', update: { title: '변경된 제목' } },
    ];

    rerender(
      <InlineGenerativeUI messageContent={msg} messageId="msg-rerender" updates={updates} />
    );
    expect(screen.getByText('변경된 제목')).toBeInTheDocument();
    expect(screen.queryByText('월별 매출 현황')).not.toBeInTheDocument();
  });
});
