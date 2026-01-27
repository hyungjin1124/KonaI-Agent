/**
 * Centralized Widget Metadata Registry
 *
 * This registry contains the shared metadata for all dashboard widgets.
 * Individual components (Dashboard, LiveboardView) provide their own render functions
 * since they depend on local state and data.
 */

import { WidgetId, WidgetMetadata } from './types';

export const WIDGET_METADATA: Record<WidgetId, WidgetMetadata> = {
  revenue_growth_kpi: {
    id: 'revenue_growth_kpi',
    title: '매출 성장률',
    minW: 2,
    minH: 2,
    defaultW: 4,
    defaultH: 3,
    category: 'kpi',
  },
  cost_efficiency_kpi: {
    id: 'cost_efficiency_kpi',
    title: '원가 효율성',
    minW: 2,
    minH: 2,
    defaultW: 4,
    defaultH: 3,
    category: 'kpi',
  },
  asp_kpi: {
    id: 'asp_kpi',
    title: '평균 판매 단가',
    minW: 2,
    minH: 2,
    defaultW: 4,
    defaultH: 3,
    category: 'kpi',
  },
  revenue_bridge_chart: {
    id: 'revenue_bridge_chart',
    title: '매출 증감 요인 분석',
    minW: 4,
    minH: 4,
    defaultW: 6,
    defaultH: 8,
    category: 'chart',
  },
  cost_correlation_chart: {
    id: 'cost_correlation_chart',
    title: '자동화율과 원가율 상관관계',
    minW: 4,
    minH: 4,
    defaultW: 6,
    defaultH: 8,
    category: 'chart',
  },
};

// Helper functions
export const getWidgetMetadata = (id: WidgetId): WidgetMetadata => WIDGET_METADATA[id];

export const getAllWidgetIds = (): WidgetId[] =>
  Object.keys(WIDGET_METADATA) as WidgetId[];

export const getKPIWidgets = (): WidgetMetadata[] =>
  Object.values(WIDGET_METADATA).filter((w) => w.category === 'kpi');

export const getChartWidgets = (): WidgetMetadata[] =>
  Object.values(WIDGET_METADATA).filter((w) => w.category === 'chart');
