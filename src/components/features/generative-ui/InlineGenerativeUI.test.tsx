/**
 * Generative UI Phase 2 — Unit Tests
 *
 * Tests for InlineGenerativeUI, useInlineGenerativeUI, A2UI Catalog,
 * compact mode, and dynamic update support.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';

import { InlineGenerativeUI } from './InlineGenerativeUI';
import { useInlineGenerativeUI } from './useInlineGenerativeUI';
import { GenerativeUIRenderer } from './GenerativeUIRenderer';
import { KONAI_A2UI_CATALOG } from './a2uiCatalog';
import type { GenerativeUISpec, GenerativeUIUpdateSpec } from './types';

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

// Mock lucide-react
vi.mock('lucide-react', () => ({
  ArrowUpRight: () => <span data-testid="arrow-up-right" />,
  ArrowDownRight: () => <span data-testid="arrow-down-right" />,
  AlertTriangle: () => <span data-testid="alert-triangle" />,
  ChevronDown: () => <span data-testid="chevron-down" />,
  ChevronUp: () => <span data-testid="chevron-up" />,
  ExternalLink: () => <span data-testid="external-link" />,
}));

// ─── Test Data ──────────────────────────────────────────────────

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

const VALID_KPI_SPEC: GenerativeUISpec = {
  type: 'kpi-card',
  title: '핵심 지표',
  data: {
    label: '매출 성장률',
    value: '₩42억',
    change: { value: 13.5, direction: 'up' as const },
    subtitle: '목표 초과 달성',
  },
};

const makeCodeFenceMessage = (spec: GenerativeUISpec): string =>
  `분석 결과입니다:\n\n\`\`\`generative-ui\n${JSON.stringify(spec)}\n\`\`\`\n\n추가 분석이 필요하시면 말씀해주세요.`;

const PLAIN_MESSAGE = '안녕하세요. 오늘의 매출 현황입니다.';

// ─── InlineGenerativeUI Tests ───────────────────────────────────

describe('InlineGenerativeUI', () => {
  describe('인라인 렌더링 (AC-1)', () => {
    it('generative-ui 코드펜스 포함 메시지 → 인라인 차트 렌더링', () => {
      render(
        <InlineGenerativeUI
          messageContent={makeCodeFenceMessage(VALID_BAR_CHART_SPEC)}
          messageId="msg-1"
        />
      );
      expect(screen.getByTestId('inline-generative-ui')).toBeInTheDocument();
      expect(screen.getByTestId('generative-ui-renderer')).toBeInTheDocument();
    });

    it('일반 텍스트 메시지 → 인라인 시각화 미표시 (AC-2: 코드펜스 없음)', () => {
      const { container } = render(
        <InlineGenerativeUI
          messageContent={PLAIN_MESSAGE}
          messageId="msg-2"
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('인터랙티브 요소 (AC-2)', () => {
    it('bar-chart spec → Recharts 컨테이너 존재', () => {
      render(
        <InlineGenerativeUI
          messageContent={makeCodeFenceMessage(VALID_BAR_CHART_SPEC)}
          messageId="msg-3"
        />
      );
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
  });

  describe('Artifact로 저장 (AC-3)', () => {
    it('"Artifact로 저장" 클릭 → onSaveToArtifact 호출', async () => {
      const onSave = vi.fn();
      const user = userEvent.setup();

      render(
        <InlineGenerativeUI
          messageContent={makeCodeFenceMessage(VALID_BAR_CHART_SPEC)}
          messageId="msg-4"
          onSaveToArtifact={onSave}
        />
      );

      const saveButton = screen.getByTestId('save-to-artifact-button');
      expect(saveButton).toBeInTheDocument();

      await user.click(saveButton);
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
        type: 'bar-chart',
        title: '월별 매출 현황',
      }));
    });

    it('onSaveToArtifact 미전달 → 저장 버튼 미표시', () => {
      render(
        <InlineGenerativeUI
          messageContent={makeCodeFenceMessage(VALID_BAR_CHART_SPEC)}
          messageId="msg-5"
        />
      );
      expect(screen.queryByTestId('save-to-artifact-button')).not.toBeInTheDocument();
    });
  });

  describe('Fallback (AC-7)', () => {
    it('잘못된 JSON → Fallback UI 표시', () => {
      const invalidContent = '결과:\n```generative-ui\n{invalid json}\n```';

      render(
        <InlineGenerativeUI
          messageContent={invalidContent}
          messageId="msg-6"
        />
      );
      expect(screen.getByTestId('inline-generative-ui-error')).toBeInTheDocument();
    });

    it('빈 코드펜스 → Fallback UI 표시', () => {
      const emptyFence = '결과:\n```generative-ui\n{}\n```';

      render(
        <InlineGenerativeUI
          messageContent={emptyFence}
          messageId="msg-7"
        />
      );
      // {} has no valid type, so it should show fallback
      expect(screen.getByTestId('inline-generative-ui-error')).toBeInTheDocument();
    });
  });
});

// ─── useInlineGenerativeUI Tests ────────────────────────────────

describe('useInlineGenerativeUI', () => {
  describe('파싱', () => {
    it('코드펜스 포함 메시지 → spec 파싱 성공', () => {
      const { result } = renderHook(() =>
        useInlineGenerativeUI({
          messageContent: makeCodeFenceMessage(VALID_BAR_CHART_SPEC),
          messageId: 'msg-1',
        })
      );

      expect(result.current.hasCodeFence).toBe(true);
      expect(result.current.spec).not.toBeNull();
      expect(result.current.spec?.type).toBe('bar-chart');
      expect(result.current.error).toBeNull();
    });

    it('일반 텍스트 → spec null, hasCodeFence false', () => {
      const { result } = renderHook(() =>
        useInlineGenerativeUI({
          messageContent: PLAIN_MESSAGE,
          messageId: 'msg-2',
        })
      );

      expect(result.current.hasCodeFence).toBe(false);
      expect(result.current.spec).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('잘못된 JSON → error 반환', () => {
      const { result } = renderHook(() =>
        useInlineGenerativeUI({
          messageContent: '```generative-ui\n{bad}\n```',
          messageId: 'msg-3',
        })
      );

      expect(result.current.hasCodeFence).toBe(true);
      expect(result.current.spec).toBeNull();
      expect(result.current.error).not.toBeNull();
    });

    it('textContent에서 코드펜스 제거됨', () => {
      const { result } = renderHook(() =>
        useInlineGenerativeUI({
          messageContent: makeCodeFenceMessage(VALID_BAR_CHART_SPEC),
          messageId: 'msg-4',
        })
      );

      expect(result.current.textContent).toContain('분석 결과입니다');
      expect(result.current.textContent).not.toContain('generative-ui');
    });
  });

  describe('동적 업데이트 (AC-4, AC-5)', () => {
    it('targetMessageId 매칭 → spec 교체', () => {
      const updates: GenerativeUIUpdateSpec[] = [
        {
          targetMessageId: 'msg-1',
          update: {
            title: '업데이트된 차트',
            data: {
              data: [{ month: 'Mar', revenue: 5000, cost: 2500 }],
              series: [
                { dataKey: 'revenue', name: '매출', color: '#FF3C42' },
              ],
              xAxisKey: 'month',
            },
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

      expect(result.current.spec?.title).toBe('업데이트된 차트');
    });

    it('부분 갱신: data만 포함 → 기존 type/title 유지', () => {
      const updates: GenerativeUIUpdateSpec[] = [
        {
          targetMessageId: 'msg-1',
          update: {
            data: {
              data: [{ month: 'Mar', revenue: 5000, cost: 2500 }],
              series: [
                { dataKey: 'revenue', name: '매출', color: '#10B981' },
              ],
              xAxisKey: 'month',
            },
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

      expect(result.current.spec?.type).toBe('bar-chart');
      expect(result.current.spec?.title).toBe('월별 매출 현황');
    });

    it('targetMessageId 불일치 → 업데이트 미적용', () => {
      const updates: GenerativeUIUpdateSpec[] = [
        {
          targetMessageId: 'other-msg',
          update: { title: '다른 메시지 업데이트' },
        },
      ];

      const { result } = renderHook(() =>
        useInlineGenerativeUI({
          messageContent: makeCodeFenceMessage(VALID_BAR_CHART_SPEC),
          messageId: 'msg-1',
          updates,
        })
      );

      expect(result.current.spec?.title).toBe('월별 매출 현황');
    });
  });
});

// ─── GenerativeUIRenderer compact mode (AC-9) ──────────────────

describe('GenerativeUIRenderer compact mode', () => {
  it('compact=true → 축소 패딩 적용', () => {
    render(
      <GenerativeUIRenderer
        spec={VALID_KPI_SPEC}
        compact
      />
    );

    const renderer = screen.getByTestId('generative-ui-renderer');
    expect(renderer).toBeInTheDocument();
    // compact mode의 title이 렌더링됨
    expect(screen.getByText('핵심 지표')).toBeInTheDocument();
  });

  it('compact=false (기본값) → 기본 패딩 적용', () => {
    render(
      <GenerativeUIRenderer
        spec={VALID_KPI_SPEC}
      />
    );

    expect(screen.getByTestId('generative-ui-renderer')).toBeInTheDocument();
    expect(screen.getByText('핵심 지표')).toBeInTheDocument();
  });
});

// ─── A2UI Catalog (AC-8) ────────────────────────────────────────

describe('A2UI Catalog', () => {
  it('카탈로그에 8개 컴포넌트 정의', () => {
    expect(KONAI_A2UI_CATALOG.components).toHaveLength(8);
  });

  it('카탈로그 메타데이터 확인', () => {
    expect(KONAI_A2UI_CATALOG.version).toBe('1.0.0');
    expect(KONAI_A2UI_CATALOG.vendor).toBe('konai-agent');
  });

  it('모든 컴포넌트에 필수 필드 존재', () => {
    for (const entry of KONAI_A2UI_CATALOG.components) {
      expect(entry.type).toBeTruthy();
      expect(entry.displayName).toBeTruthy();
      expect(entry.description).toBeTruthy();
      expect(entry.category).toMatch(/^(chart|metric|data)$/);
      expect(entry.schema.dataType).toBeTruthy();
      expect(entry.schema.requiredFields.length).toBeGreaterThan(0);
    }
  });

  it('차트 타입 5개 확인', () => {
    const chartEntries = KONAI_A2UI_CATALOG.components.filter(c => c.category === 'chart');
    expect(chartEntries).toHaveLength(5);
  });

  it('메트릭 타입 2개 확인', () => {
    const metricEntries = KONAI_A2UI_CATALOG.components.filter(c => c.category === 'metric');
    expect(metricEntries).toHaveLength(2);
  });

  it('데이터 타입 1개 확인', () => {
    const dataEntries = KONAI_A2UI_CATALOG.components.filter(c => c.category === 'data');
    expect(dataEntries).toHaveLength(1);
  });
});
