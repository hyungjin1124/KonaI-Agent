// Recharts Tooltip/Formatter Props
export interface TooltipFormatterPayload {
  description?: string;
  name?: string;
  value?: number;
  type?: string;
  [key: string]: unknown;
}

export interface TooltipFormatterProps {
  value: number;
  name: string;
  payload: TooltipFormatterPayload;
  dataKey?: string;
}

// Pie Chart Click Data
export interface PieChartClickData {
  name: string;
  value: number;
  percent?: number;
  fill?: string;
  cx?: number;
  cy?: number;
}

// Bar Click Event Data
export interface BarClickEventData {
  name: string;
  value: number;
  dataKey?: string;
  payload?: Record<string, unknown>;
}

// LabelList Render Props
export interface LabelListRenderProps {
  x: number;
  y: number;
  width: number;
  height: number;
  value: string | number;
  index: number;
}

// Line Chart Dot Props
export interface LineDotRenderProps {
  cx: number;
  cy: number;
  r: number;
  payload: {
    name: string;
    value: number;
    [key: string]: unknown;
  };
  index: number;
}

// Chart Data Types
export interface MonthlyDataPoint {
  name: string;
  sales: number;
  lastYear: number;
}

export interface PieDataPoint {
  name: string;
  value: number;
  fill?: string;
}

export interface ClientDataPoint {
  name: string;
  value: number;
}

export interface RevenueFactorDataPoint {
  name: string;
  value: number;
  type: 'base' | 'increase' | 'total';
  description: string;
}

export interface CostCorrelationDataPoint {
  name: string;
  automation: number;
  costRatio: number;
}

export interface AnomalyCostDataPoint {
  time: string;
  cost: number;
}

export interface DIDRevenueDataPoint {
  name: string;
  domestic: number;
  overseas: number;
}
