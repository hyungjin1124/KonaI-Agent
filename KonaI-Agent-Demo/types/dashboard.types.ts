import { ReactNode } from 'react';
import { Layout } from 'react-grid-layout';

// Re-export Layout type for convenience
export type { Layout };

// Grid Layout Types
export type GridLayout = Layout[];

// Widget Registry Types
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
  render: () => ReactNode;
}

// Dashboard Props
export interface DashboardProps {
  type?: 'financial' | 'did' | 'ppt';
  scenario?: DashboardScenario;
}

export type DashboardScenario =
  | 'sales_analysis'
  | 'anomaly_cost_spike'
  | 'did_analysis'
  | undefined;

// View Mode Types
export type DashboardViewMode = 'analysis' | 'custom_dashboard';

// Slide Types (for PPT)
export type SlideLayout = 'title' | 'list' | 'bullets' | 'chart' | 'split' | 'center';

export interface Slide {
  id: number;
  layout: SlideLayout;
  title: string;
  subtitle?: string;
  items?: string[];
  left?: string;
  right?: string;
  chartType?: string;
}

// PPT Status
export type PPTStatus = 'idle' | 'setup' | 'generating' | 'done';

// Widget Wrapper Props
export interface WidgetWrapperProps {
  id: WidgetId;
  children: ReactNode;
  className?: string;
  isPinned: boolean;
  onToggle: (id: WidgetId) => void;
}
