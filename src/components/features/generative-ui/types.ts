// Generative UI — Phase 1: Static Component Selection MVP
// 에이전트가 사전정의된 컴포넌트 카탈로그에서 type을 선택하여 UI를 생성하는 패턴

export type GenerativeComponentType =
  | 'bar-chart'
  | 'line-chart'
  | 'pie-chart'
  | 'area-chart'
  | 'composed-chart'
  | 'data-table'
  | 'kpi-card'
  | 'stat-grid';

export interface ChartSeriesSpec {
  dataKey: string;
  name: string;
  color: string;
  type?: 'bar' | 'line' | 'area';
}

export interface ChartDataSpec {
  data: Record<string, string | number>[];
  series: ChartSeriesSpec[];
  xAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface KPIDataSpec {
  label: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down';
  };
  subtitle?: string;
}

export interface StatGridDataSpec {
  items: KPIDataSpec[];
}

export interface TableDataSpec {
  columns: { key: string; label: string }[];
  rows: Record<string, string | number>[];
}

export interface GenerativeUISpec {
  type: GenerativeComponentType;
  title?: string;
  description?: string;
  data: ChartDataSpec | KPIDataSpec | StatGridDataSpec | TableDataSpec;
  options?: Record<string, unknown>;
  layout?: {
    width?: 'full' | 'half' | 'third';
  };
}

export interface GenerativeUIRendererProps {
  spec: GenerativeUISpec;
  onError?: (error: string) => void;
  className?: string;
}

export interface CatalogEntry {
  type: GenerativeComponentType;
  label: string;
  description: string;
  validateData: (data: unknown) => boolean;
}

export type GenerativeUIParseResult =
  | { success: true; spec: GenerativeUISpec }
  | { success: false; error: string; rawData?: unknown };
