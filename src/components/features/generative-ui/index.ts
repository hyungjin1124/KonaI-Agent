// Phase 1
export { GenerativeUIRenderer } from './GenerativeUIRenderer';
export { GenerativeUIFallback } from './GenerativeUIFallback';
export { parseGenerativeUISpec, extractGenerativeUIFromMessage } from './parseGenerativeUI';

// Phase 2
export { InlineGenerativeUI } from './InlineGenerativeUI';
export { useInlineGenerativeUI } from './useInlineGenerativeUI';
export { KONAI_A2UI_CATALOG } from './a2uiCatalog';

export type {
  GenerativeUISpec,
  GenerativeComponentType,
  GenerativeUIRendererProps,
  GenerativeUIParseResult,
  ChartDataSpec,
  ChartSeriesSpec,
  KPIDataSpec,
  StatGridDataSpec,
  TableDataSpec,
  CatalogEntry,
  // Phase 2
  InlineGenerativeUIProps,
  GenerativeUIUpdateSpec,
  A2UICatalogEntry,
  A2UICatalog,
} from './types';
