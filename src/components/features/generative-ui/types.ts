// Generative UI — Phase 1 + Phase 2
// Phase 1: Static Component Selection MVP (에이전트가 카탈로그에서 type 선택)
// Phase 2: Inline Ephemeral Visualization + Dynamic Update + A2UI Catalog

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
  /** Phase 2: 인라인 모드 시 축소 렌더링 (padding/header 축소, 차트 높이 제한) */
  compact?: boolean;
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

// ─── Phase 2: Inline Ephemeral Visualization ────────────────────

export interface InlineGenerativeUIProps {
  /** 에이전트 메시지 콘텐츠 (generative-ui 코드펜스 포함 가능) */
  messageContent: string;
  /** 메시지 ID (동적 업데이트 참조용) */
  messageId: string;
  /** Artifact 패널로 전환 콜백 */
  onSaveToArtifact?: (spec: GenerativeUISpec) => void;
  className?: string;
}

/** 동적 업데이트 Spec (기존 시각화 참조 + 데이터 교체) */
export interface GenerativeUIUpdateSpec {
  targetMessageId: string;
  update: Partial<GenerativeUISpec>;
}

// ─── Phase 2: A2UI Compatible Catalog ───────────────────────────

export interface A2UICatalogEntry {
  type: GenerativeComponentType;
  displayName: string;
  description: string;
  category: 'chart' | 'metric' | 'data';
  schema: {
    dataType: string;
    requiredFields: string[];
    optionalFields?: string[];
  };
}

export interface A2UICatalog {
  version: string;
  vendor: string;
  components: A2UICatalogEntry[];
}
