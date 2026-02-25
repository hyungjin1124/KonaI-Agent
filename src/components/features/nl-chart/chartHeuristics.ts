import { NLChartType, DatasetMeta } from './types';

interface HeuristicResult {
  recommended: NLChartType;
  alternatives: NLChartType[];
  reasoning: string;
}

const CHART_KEYWORDS: Record<NLChartType, string[]> = {
  bar: ['비교', '비교하', '막대', '순위', '랭킹', 'top', '상위'],
  line: ['추이', '추세', '변화', '트렌드', '월별', '연도별', '기간', '시계열'],
  pie: ['비율', '비중', '구성', '점유율', '분포', '퍼센트', '%'],
  area: ['누적', '영역', '스택'],
  composed: ['복합', '혼합', '함께'],
  table: ['표', '테이블', '목록', '리스트', '상세'],
};

export function recommendChartType(
  query: string,
  dataset: DatasetMeta
): HeuristicResult {
  const normalizedQuery = query.toLowerCase();

  // Step 1: 쿼리 키워드에서 명시적 차트 타입 감지
  for (const [chartType, keywords] of Object.entries(CHART_KEYWORDS) as [NLChartType, string[]][]) {
    if (keywords.some((kw) => normalizedQuery.includes(kw))) {
      return {
        recommended: chartType,
        alternatives: getAlternatives(chartType, dataset),
        reasoning: generateReasoning(chartType, dataset, 'keyword'),
      };
    }
  }

  // Step 2: 데이터 타입 기반 Heuristic
  return recommendByDataType(dataset);
}

function recommendByDataType(dataset: DatasetMeta): HeuristicResult {
  const { dataType, metrics } = dataset;

  if (dataType === 'temporal') {
    return {
      recommended: 'line',
      alternatives: ['bar', 'area', 'composed'],
      reasoning: generateReasoning('line', dataset, 'dataType'),
    };
  }

  if (dataType === 'ratio') {
    return {
      recommended: 'pie',
      alternatives: ['bar', 'table'],
      reasoning: generateReasoning('pie', dataset, 'dataType'),
    };
  }

  // categorical
  if (metrics.length >= 2) {
    return {
      recommended: 'composed',
      alternatives: ['bar', 'table'],
      reasoning: generateReasoning('composed', dataset, 'dataType'),
    };
  }

  return {
    recommended: 'bar',
    alternatives: ['pie', 'table'],
    reasoning: generateReasoning('bar', dataset, 'dataType'),
  };
}

function getAlternatives(primary: NLChartType, dataset: DatasetMeta): NLChartType[] {
  const allTypes: NLChartType[] = ['bar', 'line', 'pie', 'composed', 'area', 'table'];
  const alternatives = allTypes.filter((t) => t !== primary);

  // 데이터 타입에 따라 적합한 대안 우선 정렬
  if (dataset.dataType === 'temporal') {
    return alternatives.sort((a, b) => {
      const temporalOrder: NLChartType[] = ['line', 'area', 'bar', 'composed', 'table', 'pie'];
      return temporalOrder.indexOf(a) - temporalOrder.indexOf(b);
    });
  }

  return alternatives.slice(0, 3);
}

function generateReasoning(
  chartType: NLChartType,
  dataset: DatasetMeta,
  source: 'keyword' | 'dataType'
): string {
  const reasons: Record<NLChartType, string> = {
    bar: `카테고리별 값을 비교하는 데 막대 차트가 적합합니다. ${dataset.metrics.length}개 지표(${dataset.metrics.join(', ')})를 비교합니다.`,
    line: `시간에 따른 변화를 보여주는 데 꺾은선 차트가 적합합니다. ${dataset.xAxisLabel} 기준으로 추이를 분석합니다.`,
    pie: `전체 대비 각 항목의 비율을 보여주는 데 파이 차트가 적합합니다. ${dataset.data.length}개 항목의 구성비를 표시합니다.`,
    area: `시간에 따른 누적 변화를 보여주는 영역 차트를 사용합니다.`,
    composed: `여러 지표를 함께 비교하기 위해 복합 차트를 사용합니다. ${dataset.metrics.join(', ')}을(를) 동시에 표시합니다.`,
    table: `데이터를 상세하게 확인할 수 있는 표 형태로 표시합니다.`,
  };

  const prefix = source === 'keyword' ? '쿼리에서 감지된 의도에 따라 ' : '데이터 특성 분석 결과 ';
  return prefix + reasons[chartType];
}

// 쿼리가 차트 생성 요청인지 판별
const CHART_TRIGGER_KEYWORDS = [
  '차트', '그래프', '시각화', '보여', '분석',
  '추이', '추세', '비교', '비율', '분포',
  '매출', '수익', '비용', '성장', '실적',
  'chart', 'graph', 'visualize', 'trend', 'compare',
];

export function isChartQuery(query: string): boolean {
  const normalizedQuery = query.toLowerCase();
  return CHART_TRIGGER_KEYWORDS.some((kw) => normalizedQuery.includes(kw));
}
