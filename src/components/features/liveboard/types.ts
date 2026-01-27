import { AgentContextData } from '../../../types';

// Widget Types
export type WidgetId =
  | 'revenue_growth_kpi'
  | 'cost_efficiency_kpi'
  | 'asp_kpi'
  | 'revenue_bridge_chart'
  | 'cost_correlation_chart'
  | 'monthly_trend_chart'
  | 'business_composition_chart'
  | 'top_clients_chart'
  | 'yoy_growth_chart'
  | 'anomaly_cost_chart';

export interface WidgetConfig {
  id: WidgetId;
  title: string;
  minW: number;
  minH: number;
  defaultW: number;
  defaultH: number;
  render: () => React.ReactNode;
}

// Props Interface
export interface LiveboardViewProps {
  onAskAgent?: (data: AgentContextData) => void;
}

// Widget Selection Item
export interface WidgetSelectionItem {
  id: string;
  title: string;
  type: string;
  date: string;
  checked: boolean;
}
