import { DashboardConfig, DatasetMeta } from './types';
import { MOCK_DATASETS } from './mockChartData';

interface DashboardTemplate {
  id: string;
  keywords: string[];
  config: DashboardConfig;
}

function getDataset(id: string) {
  return MOCK_DATASETS.find((d) => d.id === id)!;
}

export const MOCK_DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: 'executive_overview',
    keywords: ['종합', '현황', '대시보드', '전체', '경영', '한 화면', '오버뷰', '요약', '브리핑'],
    config: {
      title: '경영 현황 종합 대시보드',
      description: '매출 추이, 사업부별 비교, 비용 구성, 분기 실적을 한 화면에 표시합니다.',
      widgets: [
        {
          id: 'w1',
          config: {
            chartType: 'line',
            title: '월별 매출 추이',
            ...pickChartData(getDataset('monthly_revenue')),
          },
        },
        {
          id: 'w2',
          config: {
            chartType: 'pie',
            title: '사업부별 매출 비중',
            ...pickChartData(getDataset('market_share')),
          },
        },
        {
          id: 'w3',
          config: {
            chartType: 'composed',
            title: '분기별 매출 & 영업이익',
            ...pickChartData(getDataset('quarterly_performance')),
          },
        },
        {
          id: 'w4',
          config: {
            chartType: 'bar',
            title: '비용 구성 분석',
            ...pickChartData(getDataset('cost_breakdown')),
          },
        },
      ],
      layout: [
        { i: 'w1', x: 0, y: 0, w: 6, h: 2 },
        { i: 'w2', x: 6, y: 0, w: 6, h: 2 },
        { i: 'w3', x: 0, y: 2, w: 6, h: 2 },
        { i: 'w4', x: 6, y: 2, w: 6, h: 2 },
      ],
    },
  },
  {
    id: 'advanced_analytics',
    keywords: ['고급', '분석', '심층', '플로우', '히트맵', '워터폴', '상세'],
    config: {
      title: '심층 분석 대시보드',
      description: '매출 채널 흐름, 사업부 성과 매트릭스, 매출 증감 요인을 분석합니다.',
      widgets: [
        {
          id: 'w1',
          config: {
            chartType: 'sankey',
            title: '매출 채널별 전환 흐름',
            ...pickChartData(getDataset('revenue_flow')),
          },
        },
        {
          id: 'w2',
          config: {
            chartType: 'heatmap',
            title: '월별 사업부 성과 매트릭스',
            ...pickChartData(getDataset('monthly_division_performance')),
          },
        },
        {
          id: 'w3',
          config: {
            chartType: 'waterfall',
            title: '분기 매출 증감 요인',
            ...pickChartData(getDataset('quarterly_waterfall')),
          },
        },
        {
          id: 'w4',
          config: {
            chartType: 'treemap',
            title: '예산 항목별 배분',
            ...pickChartData(getDataset('budget_hierarchy')),
          },
        },
      ],
      layout: [
        { i: 'w1', x: 0, y: 0, w: 12, h: 3 },
        { i: 'w2', x: 0, y: 3, w: 6, h: 3 },
        { i: 'w3', x: 6, y: 3, w: 6, h: 2 },
        { i: 'w4', x: 6, y: 5, w: 6, h: 2 },
      ],
    },
  },
  {
    id: 'sales_performance',
    keywords: ['매출', '영업', '세일즈', '실적', '성과'],
    config: {
      title: '매출 성과 대시보드',
      description: '매출 추이와 사업부별 비교, 증감 요인을 분석합니다.',
      widgets: [
        {
          id: 'w1',
          config: {
            chartType: 'line',
            title: '월별 매출 추이',
            ...pickChartData(getDataset('monthly_revenue')),
          },
        },
        {
          id: 'w2',
          config: {
            chartType: 'bar',
            title: '사업부별 매출 & 이익',
            ...pickChartData(getDataset('revenue_comparison')),
          },
        },
        {
          id: 'w3',
          config: {
            chartType: 'waterfall',
            title: '매출 증감 요인',
            ...pickChartData(getDataset('quarterly_waterfall')),
          },
        },
      ],
      layout: [
        { i: 'w1', x: 0, y: 0, w: 12, h: 2 },
        { i: 'w2', x: 0, y: 2, w: 6, h: 2 },
        { i: 'w3', x: 6, y: 2, w: 6, h: 2 },
      ],
    },
  },
];

function pickChartData(dataset: DatasetMeta) {
  return {
    data: dataset.data,
    series: dataset.series,
    xAxisKey: dataset.xAxisKey,
    xAxisLabel: dataset.xAxisLabel,
    yAxisLabel: dataset.yAxisLabel,
    sankeyData: dataset.sankeyData,
    treemapData: dataset.treemapData,
    heatmapData: dataset.heatmapData,
  };
}

export function findMatchingDashboard(query: string): DashboardTemplate | null {
  const normalizedQuery = query.toLowerCase();

  let bestMatch: DashboardTemplate | null = null;
  let bestScore = 0;

  for (const template of MOCK_DASHBOARD_TEMPLATES) {
    const score = template.keywords.reduce((acc, kw) => {
      return acc + (normalizedQuery.includes(kw) ? 1 : 0);
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = template;
    }
  }

  return bestScore > 0 ? bestMatch : MOCK_DASHBOARD_TEMPLATES[0];
}
