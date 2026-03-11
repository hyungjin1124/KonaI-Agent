// NL-to-Chart types
// Phase 1: Heuristic-based chart type recommendation with mock data
// Phase 2: Multi-widget dashboard generation + advanced chart types

export type NLChartType =
  | 'bar' | 'line' | 'pie' | 'composed' | 'area' | 'table'
  | 'sankey' | 'treemap' | 'heatmap' | 'waterfall';

export interface NLChartDataPoint {
  [key: string]: string | number;
}

export interface NLChartSeries {
  dataKey: string;
  name: string;
  color: string;
  type?: 'bar' | 'line' | 'area';
}

// --- Sankey ---
export interface SankeyNode {
  name: string;
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// --- Treemap ---
export interface TreemapDataItem {
  name: string;
  size?: number;
  children?: TreemapDataItem[];
  color?: string;
}

// --- Heatmap ---
export interface HeatmapDataPoint {
  x: string;
  y: string;
  value: number;
}

export interface NLChartConfig {
  chartType: NLChartType;
  title: string;
  data: NLChartDataPoint[];
  sankeyData?: SankeyData;
  treemapData?: TreemapDataItem[];
  heatmapData?: HeatmapDataPoint[];
  series: NLChartSeries[];
  xAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface NLChartResult {
  config: NLChartConfig;
  reasoning: string;
  alternatives: NLChartType[];
  queryKeywords: string[];
}

export interface DatasetMeta {
  id: string;
  keywords: string[];
  description: string;
  xAxisKey: string;
  xAxisLabel: string;
  yAxisLabel: string;
  dataType: 'temporal' | 'categorical' | 'ratio' | 'flow' | 'hierarchical' | 'matrix';
  metrics: string[];
  data: NLChartDataPoint[];
  series: NLChartSeries[];
  sankeyData?: SankeyData;
  treemapData?: TreemapDataItem[];
  heatmapData?: HeatmapDataPoint[];
}

// --- Dashboard ---
export interface WidgetConfig {
  id: string;
  config: NLChartConfig;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardConfig {
  title: string;
  description: string;
  widgets: WidgetConfig[];
  layout: LayoutItem[];
}

export interface DashboardResult {
  dashboardConfig: DashboardConfig;
  reasoning: string;
}
