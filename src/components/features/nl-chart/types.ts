// NL-to-Chart types
// Phase 1: Heuristic-based chart type recommendation with mock data
// Phase 2+: Claude strict tool_use integration (types are forward-compatible)

export type NLChartType = 'bar' | 'line' | 'pie' | 'composed' | 'area' | 'table';

export interface NLChartDataPoint {
  [key: string]: string | number;
}

export interface NLChartSeries {
  dataKey: string;
  name: string;
  color: string;
  type?: 'bar' | 'line' | 'area';
}

export interface NLChartConfig {
  chartType: NLChartType;
  title: string;
  data: NLChartDataPoint[];
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
  dataType: 'temporal' | 'categorical' | 'ratio';
  metrics: string[];
  data: NLChartDataPoint[];
  series: NLChartSeries[];
}
