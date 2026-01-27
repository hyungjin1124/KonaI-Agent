/**
 * Shared Widget Types
 * Used by Dashboard, LiveboardView, and other widget-consuming components
 */

export type WidgetId =
  | 'revenue_growth_kpi'
  | 'cost_efficiency_kpi'
  | 'asp_kpi'
  | 'revenue_bridge_chart'
  | 'cost_correlation_chart';

export interface WidgetMetadata {
  id: WidgetId;
  title: string;
  minW: number;
  minH: number;
  defaultW: number;
  defaultH: number;
  category: 'kpi' | 'chart';
}

export interface WidgetConfig extends WidgetMetadata {
  render: () => React.ReactNode;
}
