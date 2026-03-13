/**
 * Generative UI — QA Edge Case Tests (Phase 1 + Phase 2)
 *
 * QA Engineer가 작성한 엣지 케이스 테스트.
 * 개발자 테스트(GenerativeUIRenderer.test.tsx)와 분리.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';

import { parseGenerativeUISpec, extractGenerativeUIFromMessage } from './parseGenerativeUI';
import { GenerativeUIRenderer } from './GenerativeUIRenderer';
import { GenerativeUIFallback } from './GenerativeUIFallback';
import { InlineGenerativeUI } from './InlineGenerativeUI';
import { useInlineGenerativeUI } from './useInlineGenerativeUI';
import type {
  GenerativeUISpec,
  KPIDataSpec,
  GenerativeUIUpdateSpec,
} from './types';

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
  description: '2026년 Q1 매출 추이',
  data: {
    data: [
      { month: 'Jan', revenue: 4200, cost: 2100 },
      { month: 'Feb', revenue: 3800, cost: 1900 },
    ],
    series: [
      { dataKey: 'revenue', name: '매출', color: '#FF3C42' },
      { dataKey: 'cost', name: '비용', color: '#3B82F6' },
    ],
    xAxisKey: 'month',
  },
};

// =============================================
// 1. 데이터 경계 테스트
// =============================================

describe('QA: Data Boundary Tests', () => {
  describe('Empty data', () => {
    it('handles chart with empty data array', () => {
      const spec: GenerativeUISpec = {
        type: 'bar-chart',
        data: {
          data: [],
          series: [{ dataKey: 'v', name: 'Value', color: '#FF3C42' }],
          xAxisKey: 'month',
        },
      };
      render(<GenerativeUIRenderer spec={spec} />);
      expect(screen.getByTestId('generative-ui-renderer')).toBeInTheDocument();
    });

    it('handles chart with empty series array', () => {
      const spec: GenerativeUISpec = {
        type: 'bar-chart',
        data: {
          data: [{ month: '1월', v: 100 }],
          series: [],
          xAxisKey: 'month',
        },
      };
      render(<GenerativeUIRenderer spec={spec} />);
      expect(screen.getByTestId('generative-ui-renderer')).toBeInTheDocument();
    });

    it('handles stat-grid with empty items array', () => {
      const result = parseGenerativeUISpec({
        type: 'stat-grid',
        data: { items: [] },
      });
      // Empty items array passes isStatGridDataSpec since every() on empty returns true
      if (result.success) {
        const spec = result.spec;
        render(<GenerativeUIRenderer spec={spec} />);
        expect(screen.getByTestId('generative-ui-stat-grid')).toBeInTheDocument();
      }
    });

    it('handles table with empty rows', () => {
      const spec: GenerativeUISpec = {
        type: 'data-table',
        data: {
          columns: [{ key: 'name', label: 'Name' }],
          rows: [],
        },
      };
      render(<GenerativeUIRenderer spec={spec} />);
      expect(screen.getByTestId('generative-ui-table')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('handles table with empty columns', () => {
      const spec: GenerativeUISpec = {
        type: 'data-table',
        data: {
          columns: [],
          rows: [{ name: 'test' }],
        },
      };
      render(<GenerativeUIRenderer spec={spec} />);
      expect(screen.getByTestId('generative-ui-table')).toBeInTheDocument();
    });
  });

  describe('Large data', () => {
    it('handles chart with 100 data points', () => {
      const data = Array.from({ length: 100 }, (_, i) => ({ x: `Item ${i}`, y: Math.random() * 1000 }));
      const spec: GenerativeUISpec = {
        type: 'bar-chart',
        data: {
          data,
          series: [{ dataKey: 'y', name: 'Value', color: '#FF3C42' }],
          xAxisKey: 'x',
        },
      };
      render(<GenerativeUIRenderer spec={spec} />);
      expect(screen.getByTestId('generative-ui-renderer')).toBeInTheDocument();
    });

    it('handles stat-grid with 20 items', () => {
      const items = Array.from({ length: 20 }, (_, i) => ({
        label: `Metric ${i}`,
        value: Math.floor(Math.random() * 10000),
        change: { value: Math.random() * 50, direction: (i % 2 === 0 ? 'up' : 'down') as 'up' | 'down' },
      }));
      const spec: GenerativeUISpec = {
        type: 'stat-grid',
        data: { items },
      };
      render(<GenerativeUIRenderer spec={spec} />);
      expect(screen.getByTestId('generative-ui-stat-grid')).toBeInTheDocument();
    });

    it('handles table with 100 rows', () => {
      const rows = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Product ${i}`, amount: i * 100 }));
      const spec: GenerativeUISpec = {
        type: 'data-table',
        data: {
          columns: [
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Name' },
            { key: 'amount', label: 'Amount' },
          ],
          rows,
        },
      };
      render(<GenerativeUIRenderer spec={spec} />);
      expect(screen.getByTestId('generative-ui-table')).toBeInTheDocument();
    });
  });

  describe('Long text', () => {
    it('handles very long title', () => {
      const longTitle = 'A'.repeat(500);
      const spec: GenerativeUISpec = {
        type: 'kpi-card',
        title: longTitle,
        data: { label: 'Test', value: 100 },
      };
      render(<GenerativeUIRenderer spec={spec} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles very long KPI label', () => {
      const longLabel = 'Very Long Metric Name '.repeat(20).trim();
      const spec: GenerativeUISpec = {
        type: 'kpi-card',
        data: { label: longLabel, value: '₩42억' },
      };
      render(<GenerativeUIRenderer spec={spec} />);
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('handles long table cell values', () => {
      const longText = 'B'.repeat(1000);
      const spec: GenerativeUISpec = {
        type: 'data-table',
        data: {
          columns: [{ key: 'name', label: 'Name' }],
          rows: [{ name: longText }],
        },
      };
      render(<GenerativeUIRenderer spec={spec} />);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });

  describe('Special characters & i18n', () => {
    it('handles emoji in title', () => {
      const spec: GenerativeUISpec = {
        type: 'kpi-card',
        title: '📊 매출 현황 🚀',
        data: { label: '매출', value: '₩42억' },
      };
      render(<GenerativeUIRenderer spec={spec} />);
      expect(screen.getByText('📊 매출 현황 🚀')).toBeInTheDocument();
    });

    it('handles HTML entities in data', () => {
      const spec: GenerativeUISpec = {
        type: 'kpi-card',
        data: { label: 'Revenue & Loss', value: '<strong>42</strong>' },
      };
      render(<GenerativeUIRenderer spec={spec} />);
      expect(screen.getByText('<strong>42</strong>')).toBeInTheDocument();
    });

    it('handles unicode characters in table data', () => {
      const spec: GenerativeUISpec = {
        type: 'data-table',
        data: {
          columns: [{ key: 'name', label: '名前' }],
          rows: [
            { name: '日本語テスト' },
            { name: '한국어 테스트' },
            { name: 'Ünïcödé Tëst' },
          ],
        },
      };
      render(<GenerativeUIRenderer spec={spec} />);
      expect(screen.getByText('日本語テスト')).toBeInTheDocument();
      expect(screen.getByText('한국어 테스트')).toBeInTheDocument();
    });
  });
});

// =============================================
// 2. parseGenerativeUISpec 엣지 케이스
// =============================================

describe('QA: parseGenerativeUISpec Edge Cases', () => {
  it('rejects undefined input', () => {
    const result = parseGenerativeUISpec(undefined);
    expect(result.success).toBe(false);
  });

  it('rejects array input', () => {
    const result = parseGenerativeUISpec([1, 2, 3]);
    expect(result.success).toBe(false);
  });

  it('rejects string input', () => {
    const result = parseGenerativeUISpec('not an object');
    expect(result.success).toBe(false);
  });

  it('rejects number input', () => {
    const result = parseGenerativeUISpec(42);
    expect(result.success).toBe(false);
  });

  it('rejects empty string type', () => {
    const result = parseGenerativeUISpec({ type: '', data: {} });
    expect(result.success).toBe(false);
  });

  it('rejects numeric type', () => {
    const result = parseGenerativeUISpec({ type: 123, data: {} });
    expect(result.success).toBe(false);
  });

  it('rejects data: null for valid type', () => {
    const result = parseGenerativeUISpec({ type: 'bar-chart', data: null });
    expect(result.success).toBe(false);
  });

  it('rejects data: undefined for valid type', () => {
    const result = parseGenerativeUISpec({ type: 'bar-chart' });
    expect(result.success).toBe(false);
  });

  it('preserves rawData in error result for debugging', () => {
    const input = { type: 'invalid', data: { foo: 'bar' } };
    const result = parseGenerativeUISpec(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.rawData).toEqual(input);
    }
  });

  it('handles chart data with missing series', () => {
    const result = parseGenerativeUISpec({
      type: 'bar-chart',
      data: { data: [{ x: 1 }], xAxisKey: 'x' },
    });
    expect(result.success).toBe(false);
  });

  it('handles kpi-card data with number value', () => {
    const result = parseGenerativeUISpec({
      type: 'kpi-card',
      data: { label: 'Test', value: 42 },
    });
    expect(result.success).toBe(true);
  });

  it('handles kpi-card data with missing label', () => {
    const result = parseGenerativeUISpec({
      type: 'kpi-card',
      data: { value: 42 },
    });
    expect(result.success).toBe(false);
  });
});

// =============================================
// 3. extractGenerativeUIFromMessage 엣지 케이스
// =============================================

describe('QA: extractGenerativeUIFromMessage Edge Cases', () => {
  it('handles empty string', () => {
    const result = extractGenerativeUIFromMessage('');
    expect(result).toBeNull();
  });

  it('handles multiple code fences — picks the first', () => {
    const message = `
\`\`\`generative-ui
{"type":"kpi-card","data":{"label":"First","value":1}}
\`\`\`

Some text

\`\`\`generative-ui
{"type":"kpi-card","data":{"label":"Second","value":2}}
\`\`\`
`;
    const result = extractGenerativeUIFromMessage(message);
    expect(result?.success).toBe(true);
    if (result?.success) {
      expect((result.spec.data as KPIDataSpec).label).toBe('First');
    }
  });

  it('handles code fence with different language tag', () => {
    const message = '```json\n{"type":"kpi-card","data":{"label":"Test","value":1}}\n```';
    const result = extractGenerativeUIFromMessage(message);
    expect(result).toBeNull();
  });

  it('handles malformed JSON with trailing comma', () => {
    const message = '```generative-ui\n{"type":"kpi-card","data":{"label":"Test","value":1},}\n```';
    const result = extractGenerativeUIFromMessage(message);
    expect(result?.success).toBe(false);
  });

  it('handles nested code fences', () => {
    const message = '````generative-ui\n```\n{"type":"kpi-card"}\n```\n````';
    const result = extractGenerativeUIFromMessage(message);
    expect(result === null || !result.success).toBe(true);
  });

  it('handles very large JSON in code fence', () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => ({ x: `Item${i}`, y: i }));
    const json = JSON.stringify({
      type: 'bar-chart',
      data: {
        data: largeData,
        series: [{ dataKey: 'y', name: 'Value', color: '#FF3C42' }],
        xAxisKey: 'x',
      },
    });
    const message = `\`\`\`generative-ui\n${json}\n\`\`\``;
    const result = extractGenerativeUIFromMessage(message);
    expect(result?.success).toBe(true);
  });
});

// =============================================
// 4. GenerativeUIRenderer 상태 전환 테스트
// =============================================

describe('QA: GenerativeUIRenderer State & Rerender', () => {
  it('calls onError callback for each invalid render', () => {
    const onError = vi.fn();
    const invalidSpec = { type: 'invalid', data: {} } as unknown as GenerativeUISpec;
    const { rerender } = render(<GenerativeUIRenderer spec={invalidSpec} onError={onError} />);
    expect(onError).toHaveBeenCalledTimes(1);

    const anotherInvalid = { type: 'also-invalid', data: {} } as unknown as GenerativeUISpec;
    rerender(<GenerativeUIRenderer spec={anotherInvalid} onError={onError} />);
    expect(onError).toHaveBeenCalledTimes(2);
  });

  it('transitions from valid to invalid spec', () => {
    const validSpec: GenerativeUISpec = {
      type: 'kpi-card',
      data: { label: 'Test', value: 100 },
    };
    const { rerender } = render(<GenerativeUIRenderer spec={validSpec} />);
    expect(screen.getByTestId('generative-ui-kpi')).toBeInTheDocument();

    const invalidSpec = { type: 'bad', data: {} } as unknown as GenerativeUISpec;
    rerender(<GenerativeUIRenderer spec={invalidSpec} />);
    expect(screen.getByTestId('generative-ui-fallback')).toBeInTheDocument();
  });

  it('transitions from invalid to valid spec', () => {
    const invalidSpec = { type: 'bad', data: {} } as unknown as GenerativeUISpec;
    const { rerender } = render(<GenerativeUIRenderer spec={invalidSpec} />);
    expect(screen.getByTestId('generative-ui-fallback')).toBeInTheDocument();

    const validSpec: GenerativeUISpec = {
      type: 'kpi-card',
      data: { label: 'Test', value: 100 },
    };
    rerender(<GenerativeUIRenderer spec={validSpec} />);
    expect(screen.getByTestId('generative-ui-kpi')).toBeInTheDocument();
  });

  it('handles className prop being applied', () => {
    const spec: GenerativeUISpec = {
      type: 'kpi-card',
      data: { label: 'Test', value: 100 },
    };
    render(<GenerativeUIRenderer spec={spec} className="custom-class" />);
    const renderer = screen.getByTestId('generative-ui-renderer');
    expect(renderer.className).toContain('custom-class');
  });
});

// =============================================
// 5. GenerativeUIFallback 인터랙션 테스트
// =============================================

describe('QA: GenerativeUIFallback Interaction', () => {
  it('toggles raw data display on/off', async () => {
    const user = userEvent.setup();
    render(<GenerativeUIFallback error="Error" rawData={{ test: 'data' }} />);

    const toggleBtn = screen.getByText('원본 데이터 보기');
    await user.click(toggleBtn);
    expect(screen.getByText(/"test": "data"/)).toBeInTheDocument();
    expect(screen.getByText('원본 데이터 숨기기')).toBeInTheDocument();

    await user.click(screen.getByText('원본 데이터 숨기기'));
    expect(screen.queryByText(/"test": "data"/)).not.toBeInTheDocument();
  });

  it('handles string rawData correctly', () => {
    render(<GenerativeUIFallback error="Parse error" rawData="{invalid json}" />);
  });

  it('handles deeply nested rawData', async () => {
    const user = userEvent.setup();
    const deepData = { a: { b: { c: { d: { e: 'deep' } } } } };
    render(<GenerativeUIFallback error="Error" rawData={deepData} />);

    await user.click(screen.getByText('원본 데이터 보기'));
    expect(screen.getByText(/"e": "deep"/)).toBeInTheDocument();
  });
});

// =============================================
// 6. GenerativeUIRendererAdapter 엣지 케이스
// =============================================

describe('QA: GenerativeUIRendererAdapter', () => {
  it('renders loading state when spec is undefined', async () => {
    const { GenerativeUIRendererAdapter } = await import(
      '../agent-chat/components/ArtifactPreviewPanel/renderers/GenerativeUIRendererAdapter'
    );
    render(<GenerativeUIRendererAdapter onClose={() => {}} />);
    expect(screen.getByText('생성형 UI를 불러오는 중...')).toBeInTheDocument();
  });

  it('renders spec when provided', async () => {
    const { GenerativeUIRendererAdapter } = await import(
      '../agent-chat/components/ArtifactPreviewPanel/renderers/GenerativeUIRendererAdapter'
    );
    const spec: GenerativeUISpec = {
      type: 'kpi-card',
      data: { label: 'Test', value: 100 },
    };
    render(<GenerativeUIRendererAdapter spec={spec} onClose={() => {}} />);
    expect(screen.getByTestId('generative-ui-kpi')).toBeInTheDocument();
  });
});

// =============================================
// 7. Number formatting edge cases
// =============================================

describe('QA: Number Formatting', () => {
  it('formats large KPI values with toLocaleString', () => {
    const spec: GenerativeUISpec = {
      type: 'kpi-card',
      data: { label: 'Revenue', value: 1234567890 },
    };
    render(<GenerativeUIRenderer spec={spec} />);
    expect(screen.getByText('1,234,567,890')).toBeInTheDocument();
  });

  it('formats table number values with toLocaleString', () => {
    const spec: GenerativeUISpec = {
      type: 'data-table',
      data: {
        columns: [{ key: 'amount', label: 'Amount' }],
        rows: [{ amount: 9876543 }],
      },
    };
    render(<GenerativeUIRenderer spec={spec} />);
    expect(screen.getByText('9,876,543')).toBeInTheDocument();
  });

  it('handles zero value in KPI', () => {
    const spec: GenerativeUISpec = {
      type: 'kpi-card',
      data: { label: 'Zero', value: 0 },
    };
    render(<GenerativeUIRenderer spec={spec} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles negative change value', () => {
    const spec: GenerativeUISpec = {
      type: 'kpi-card',
      data: {
        label: 'Revenue',
        value: '₩10억',
        change: { value: -5.2, direction: 'down' },
      },
    };
    render(<GenerativeUIRenderer spec={spec} />);
    expect(screen.getByText('-5.2%')).toBeInTheDocument();
  });
});

// =============================================
// 8. Phase 2: InlineGenerativeUI 엣지 케이스
// =============================================

describe('QA Phase 2: InlineGenerativeUI Edge Cases', () => {
  describe('Dynamic updates edge cases', () => {
    it('handles empty updates array', () => {
      const { result } = renderHook(() =>
        useInlineGenerativeUI({
          messageContent: makeCodeFenceMessage(VALID_BAR_CHART_SPEC),
          messageId: 'msg-1',
          updates: [],
        })
      );
      expect(result.current.spec?.title).toBe('월별 매출 현황');
    });

    it('handles multiple sequential updates to same message', () => {
      const updates: GenerativeUIUpdateSpec[] = [
        { targetMessageId: 'msg-1', update: { title: 'First Update' } },
        { targetMessageId: 'msg-1', update: { title: 'Second Update' } },
        { targetMessageId: 'msg-1', update: { title: 'Final Update' } },
      ];

      const { result } = renderHook(() =>
        useInlineGenerativeUI({
          messageContent: makeCodeFenceMessage(VALID_BAR_CHART_SPEC),
          messageId: 'msg-1',
          updates,
        })
      );

      // Last update wins
      expect(result.current.spec?.title).toBe('Final Update');
    });

    it('handles update that changes component type', () => {
      const updates: GenerativeUIUpdateSpec[] = [
        {
          targetMessageId: 'msg-1',
          update: {
            type: 'kpi-card',
            data: { label: 'Revenue', value: '₩42억' },
          },
        },
      ];

      const { result } = renderHook(() =>
        useInlineGenerativeUI({
          messageContent: makeCodeFenceMessage(VALID_BAR_CHART_SPEC),
          messageId: 'msg-1',
          updates,
        })
      );

      expect(result.current.spec?.type).toBe('kpi-card');
    });

    it('handles mixed relevant/irrelevant updates', () => {
      const updates: GenerativeUIUpdateSpec[] = [
        { targetMessageId: 'other-msg', update: { title: 'Wrong message' } },
        { targetMessageId: 'msg-1', update: { title: 'Right message' } },
        { targetMessageId: 'yet-another', update: { title: 'Also wrong' } },
      ];

      const { result } = renderHook(() =>
        useInlineGenerativeUI({
          messageContent: makeCodeFenceMessage(VALID_BAR_CHART_SPEC),
          messageId: 'msg-1',
          updates,
        })
      );

      expect(result.current.spec?.title).toBe('Right message');
    });
  });

  describe('Compact mode rendering edge cases', () => {
    it('compact mode preserves all content (title, description, label)', () => {
      const spec: GenerativeUISpec = {
        type: 'kpi-card',
        title: 'Title Visible',
        description: 'Description Visible',
        data: { label: 'Revenue', value: '₩42억', subtitle: 'Goal exceeded' },
      };

      render(<GenerativeUIRenderer spec={spec} compact />);
      expect(screen.getByText('Title Visible')).toBeInTheDocument();
      expect(screen.getByText('Description Visible')).toBeInTheDocument();
      expect(screen.getByText('Revenue')).toBeInTheDocument();
    });

    it('InlineGenerativeUI renders with max-height constraint', () => {
      render(
        <InlineGenerativeUI
          messageContent={makeCodeFenceMessage(VALID_BAR_CHART_SPEC)}
          messageId="msg-h"
        />
      );

      const inlineEl = screen.getByTestId('inline-generative-ui');
      expect(inlineEl.querySelector('.max-h-80')).toBeTruthy();
    });
  });

  describe('onSaveToArtifact wiring', () => {
    it('save button passes current (updated) spec, not original', async () => {
      const onSave = vi.fn();
      const user = userEvent.setup();

      const updates: GenerativeUIUpdateSpec[] = [
        {
          targetMessageId: 'msg-save',
          update: { title: 'Updated Title' },
        },
      ];

      render(
        <InlineGenerativeUI
          messageContent={makeCodeFenceMessage(VALID_BAR_CHART_SPEC)}
          messageId="msg-save"
          onSaveToArtifact={onSave}
          updates={updates}
        />
      );

      await user.click(screen.getByTestId('save-to-artifact-button'));
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Updated Title' })
      );
    });
  });

  describe('Fallback behavior in inline mode', () => {
    it('renders fallback with error styling in inline mode', () => {
      const invalidContent = '결과:\n```generative-ui\n{not valid}\n```';
      render(
        <InlineGenerativeUI messageContent={invalidContent} messageId="msg-fb" />
      );
      const errorEl = screen.getByTestId('inline-generative-ui-error');
      expect(errorEl).toBeInTheDocument();
      expect(errorEl.className).toContain('border');
    });

    it('returns null for plain text (no code fence)', () => {
      const { container } = render(
        <InlineGenerativeUI messageContent="plain text" messageId="msg-null" />
      );
      expect(container.firstChild).toBeNull();
    });
  });
});
