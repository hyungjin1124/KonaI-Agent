import { WidgetId } from '../types';

export interface WidgetMetadata {
  id: WidgetId;
  title: string;
  minW: number;
  minH: number;
  defaultW: number;
  defaultH: number;
  category: 'kpi' | 'chart' | 'analysis';
}

export const WIDGET_METADATA: Record<WidgetId, Omit<WidgetMetadata, 'id'>> = {
  revenue_growth_kpi: {
    title: '매출 성장률',
    minW: 2,
    minH: 2,
    defaultW: 4,
    defaultH: 3,
    category: 'kpi',
  },
  cost_efficiency_kpi: {
    title: '원가 효율성',
    minW: 2,
    minH: 2,
    defaultW: 4,
    defaultH: 3,
    category: 'kpi',
  },
  asp_kpi: {
    title: '평균 판매 단가',
    minW: 2,
    minH: 2,
    defaultW: 4,
    defaultH: 3,
    category: 'kpi',
  },
  revenue_bridge_chart: {
    title: '매출 증감 요인 분석',
    minW: 4,
    minH: 4,
    defaultW: 6,
    defaultH: 8,
    category: 'chart',
  },
  cost_correlation_chart: {
    title: '자동화율과 원가율 상관관계',
    minW: 4,
    minH: 4,
    defaultW: 6,
    defaultH: 8,
    category: 'chart',
  },
  anomaly_cost_chart: {
    title: '시간대별 원가율 추이',
    minW: 4,
    minH: 4,
    defaultW: 6,
    defaultH: 8,
    category: 'analysis',
  },
  monthly_trend_chart: {
    title: '월별 매출 추이',
    minW: 4,
    minH: 4,
    defaultW: 12,
    defaultH: 8,
    category: 'chart',
  },
  business_composition_chart: {
    title: '사업부별 매출 구성',
    minW: 4,
    minH: 4,
    defaultW: 6,
    defaultH: 8,
    category: 'chart',
  },
  top_clients_chart: {
    title: '주요 거래처 Top 5',
    minW: 4,
    minH: 4,
    defaultW: 6,
    defaultH: 8,
    category: 'chart',
  },
  yoy_growth_chart: {
    title: 'YoY 성장률',
    minW: 4,
    minH: 4,
    defaultW: 6,
    defaultH: 8,
    category: 'chart',
  },
};

// Get widget metadata by id
export const getWidgetMetadata = (id: WidgetId): WidgetMetadata => {
  return {
    id,
    ...WIDGET_METADATA[id],
  };
};

// Get all widgets by category
export const getWidgetsByCategory = (category: 'kpi' | 'chart' | 'analysis'): WidgetMetadata[] => {
  return (Object.keys(WIDGET_METADATA) as WidgetId[])
    .filter((id) => WIDGET_METADATA[id].category === category)
    .map((id) => ({ id, ...WIDGET_METADATA[id] }));
};

// Get all widget ids
export const getAllWidgetIds = (): WidgetId[] => {
  return Object.keys(WIDGET_METADATA) as WidgetId[];
};
