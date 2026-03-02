import type {
  GenerativeUISpec,
  GenerativeComponentType,
  GenerativeUIParseResult,
  ChartDataSpec,
  KPIDataSpec,
  StatGridDataSpec,
  TableDataSpec,
} from './types';

const VALID_TYPES: GenerativeComponentType[] = [
  'bar-chart',
  'line-chart',
  'pie-chart',
  'area-chart',
  'composed-chart',
  'data-table',
  'kpi-card',
  'stat-grid',
];

const CHART_TYPES: GenerativeComponentType[] = [
  'bar-chart',
  'line-chart',
  'pie-chart',
  'area-chart',
  'composed-chart',
];

function isChartDataSpec(data: unknown): data is ChartDataSpec {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    Array.isArray(d.data) &&
    Array.isArray(d.series) &&
    typeof d.xAxisKey === 'string'
  );
}

function isKPIDataSpec(data: unknown): data is KPIDataSpec {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return typeof d.label === 'string' && (typeof d.value === 'string' || typeof d.value === 'number');
}

function isStatGridDataSpec(data: unknown): data is StatGridDataSpec {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return Array.isArray(d.items) && d.items.every(isKPIDataSpec);
}

function isTableDataSpec(data: unknown): data is TableDataSpec {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return Array.isArray(d.columns) && Array.isArray(d.rows);
}

function validateDataForType(type: GenerativeComponentType, data: unknown): boolean {
  if (CHART_TYPES.includes(type)) return isChartDataSpec(data);
  if (type === 'kpi-card') return isKPIDataSpec(data);
  if (type === 'stat-grid') return isStatGridDataSpec(data);
  if (type === 'data-table') return isTableDataSpec(data);
  return false;
}

export function parseGenerativeUISpec(input: unknown): GenerativeUIParseResult {
  if (typeof input !== 'object' || input === null) {
    return { success: false, error: 'Input is not an object', rawData: input };
  }

  const obj = input as Record<string, unknown>;

  if (typeof obj.type !== 'string' || !VALID_TYPES.includes(obj.type as GenerativeComponentType)) {
    return {
      success: false,
      error: `Invalid type: "${String(obj.type)}". Valid types: ${VALID_TYPES.join(', ')}`,
      rawData: input,
    };
  }

  const type = obj.type as GenerativeComponentType;

  if (!obj.data) {
    return { success: false, error: 'Missing "data" field', rawData: input };
  }

  if (!validateDataForType(type, obj.data)) {
    return {
      success: false,
      error: `Invalid data structure for type "${type}"`,
      rawData: input,
    };
  }

  const spec: GenerativeUISpec = {
    type,
    data: obj.data as GenerativeUISpec['data'],
    ...(typeof obj.title === 'string' && { title: obj.title }),
    ...(typeof obj.description === 'string' && { description: obj.description }),
    ...(typeof obj.options === 'object' && obj.options !== null && { options: obj.options as Record<string, unknown> }),
    ...(typeof obj.layout === 'object' && obj.layout !== null && { layout: obj.layout as GenerativeUISpec['layout'] }),
  };

  return { success: true, spec };
}

/**
 * 에이전트 응답 텍스트에서 ```generative-ui JSON 블록을 추출하여 파싱한다.
 */
export function extractGenerativeUIFromMessage(content: string): GenerativeUIParseResult | null {
  const fencePattern = /```generative-ui\s*\n([\s\S]*?)```/;
  const match = content.match(fencePattern);

  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1]);
    return parseGenerativeUISpec(parsed);
  } catch {
    return {
      success: false,
      error: 'Failed to parse JSON from generative-ui code fence',
      rawData: match[1],
    };
  }
}
