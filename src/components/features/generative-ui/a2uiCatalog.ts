import type { A2UICatalog } from './types';

/**
 * KonaI-Agent A2UI 호환 컴포넌트 카탈로그
 *
 * A2UI (Agent-to-User Interface) 프로토콜 v0.9 기반으로 정의된
 * 에이전트가 선택 가능한 UI 컴포넌트 목록. 각 엔트리는 컴포넌트의
 * 타입, 데이터 스키마, 필수/선택 필드를 선언한다.
 *
 * 에이전트는 이 카탈로그를 참조하여 적합한 컴포넌트 타입을 선택하고,
 * 스키마에 맞는 데이터를 GenerativeUISpec으로 반환한다.
 */
export const KONAI_A2UI_CATALOG: A2UICatalog = {
  version: '1.0.0',
  vendor: 'konai-agent',
  components: [
    {
      type: 'bar-chart',
      displayName: 'Bar Chart',
      description: '카테고리별 수치를 비교하는 막대 차트',
      category: 'chart',
      schema: {
        dataType: 'ChartDataSpec',
        requiredFields: ['data', 'series', 'xAxisKey'],
        optionalFields: ['xAxisLabel', 'yAxisLabel'],
      },
    },
    {
      type: 'line-chart',
      displayName: 'Line Chart',
      description: '시계열 추세를 표시하는 라인 차트',
      category: 'chart',
      schema: {
        dataType: 'ChartDataSpec',
        requiredFields: ['data', 'series', 'xAxisKey'],
        optionalFields: ['xAxisLabel', 'yAxisLabel'],
      },
    },
    {
      type: 'pie-chart',
      displayName: 'Pie Chart',
      description: '비율/구성을 표시하는 파이 차트',
      category: 'chart',
      schema: {
        dataType: 'ChartDataSpec',
        requiredFields: ['data', 'series', 'xAxisKey'],
      },
    },
    {
      type: 'area-chart',
      displayName: 'Area Chart',
      description: '누적 추세를 표시하는 영역 차트',
      category: 'chart',
      schema: {
        dataType: 'ChartDataSpec',
        requiredFields: ['data', 'series', 'xAxisKey'],
        optionalFields: ['xAxisLabel', 'yAxisLabel'],
      },
    },
    {
      type: 'composed-chart',
      displayName: 'Composed Chart',
      description: '막대/라인/영역을 조합한 복합 차트',
      category: 'chart',
      schema: {
        dataType: 'ChartDataSpec',
        requiredFields: ['data', 'series', 'xAxisKey'],
        optionalFields: ['xAxisLabel', 'yAxisLabel'],
      },
    },
    {
      type: 'data-table',
      displayName: 'Data Table',
      description: '행/열 기반 데이터 테이블',
      category: 'data',
      schema: {
        dataType: 'TableDataSpec',
        requiredFields: ['columns', 'rows'],
      },
    },
    {
      type: 'kpi-card',
      displayName: 'KPI Card',
      description: '핵심 지표를 단일 카드로 표시 (값, 변화율)',
      category: 'metric',
      schema: {
        dataType: 'KPIDataSpec',
        requiredFields: ['label', 'value'],
        optionalFields: ['change', 'subtitle'],
      },
    },
    {
      type: 'stat-grid',
      displayName: 'Stat Grid',
      description: '복수 KPI를 그리드 레이아웃으로 표시',
      category: 'metric',
      schema: {
        dataType: 'StatGridDataSpec',
        requiredFields: ['items'],
      },
    },
  ],
};
