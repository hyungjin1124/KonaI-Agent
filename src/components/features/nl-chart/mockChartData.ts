import { DatasetMeta } from './types';

const COLORS = {
  primary: '#FF3C42',
  secondary: '#3B82F6',
  tertiary: '#10B981',
  quaternary: '#F59E0B',
  fifth: '#8B5CF6',
  sixth: '#EC4899',
};

export const MOCK_DATASETS: DatasetMeta[] = [
  {
    id: 'monthly_revenue',
    keywords: ['월별', '매출', '추이', '수익', '월', '트렌드', '성장'],
    description: '월별 매출 추이',
    xAxisKey: 'month',
    xAxisLabel: '월',
    yAxisLabel: '매출 (억원)',
    dataType: 'temporal',
    metrics: ['매출'],
    data: [
      { month: '1월', revenue: 42 },
      { month: '2월', revenue: 38 },
      { month: '3월', revenue: 51 },
      { month: '4월', revenue: 47 },
      { month: '5월', revenue: 53 },
      { month: '6월', revenue: 61 },
      { month: '7월', revenue: 58 },
      { month: '8월', revenue: 65 },
      { month: '9월', revenue: 72 },
      { month: '10월', revenue: 68 },
      { month: '11월', revenue: 78 },
      { month: '12월', revenue: 85 },
    ],
    series: [
      { dataKey: 'revenue', name: '매출', color: COLORS.primary },
    ],
  },
  {
    id: 'revenue_comparison',
    keywords: ['비교', '사업부', '부서', '지역', '국내', '해외', '부문'],
    description: '사업부별 매출 비교',
    xAxisKey: 'division',
    xAxisLabel: '사업부',
    yAxisLabel: '매출 (억원)',
    dataType: 'categorical',
    metrics: ['매출', '이익'],
    data: [
      { division: '카드사업', revenue: 320, profit: 48 },
      { division: '결제사업', revenue: 280, profit: 42 },
      { division: 'DID사업', revenue: 150, profit: 30 },
      { division: '데이터사업', revenue: 120, profit: 36 },
      { division: '해외사업', revenue: 90, profit: 12 },
    ],
    series: [
      { dataKey: 'revenue', name: '매출', color: COLORS.primary },
      { dataKey: 'profit', name: '이익', color: COLORS.secondary },
    ],
  },
  {
    id: 'market_share',
    keywords: ['비율', '비중', '구성', '점유율', '분포', '퍼센트', '시장'],
    description: '사업부별 매출 비중',
    xAxisKey: 'name',
    xAxisLabel: '사업부',
    yAxisLabel: '비율 (%)',
    dataType: 'ratio',
    metrics: ['비중'],
    data: [
      { name: '카드사업', value: 33 },
      { name: '결제사업', value: 29 },
      { name: 'DID사업', value: 16 },
      { name: '데이터사업', value: 13 },
      { name: '해외사업', value: 9 },
    ],
    series: [
      { dataKey: 'value', name: '비중', color: COLORS.primary },
    ],
  },
  {
    id: 'quarterly_performance',
    keywords: ['분기', '분기별', '실적', 'q1', 'q2', 'q3', 'q4', '성장률'],
    description: '분기별 실적 추이',
    xAxisKey: 'quarter',
    xAxisLabel: '분기',
    yAxisLabel: '금액 (억원)',
    dataType: 'temporal',
    metrics: ['매출', '영업이익'],
    data: [
      { quarter: '2025 Q1', revenue: 230, operatingProfit: 35 },
      { quarter: '2025 Q2', revenue: 258, operatingProfit: 42 },
      { quarter: '2025 Q3', revenue: 275, operatingProfit: 48 },
      { quarter: '2025 Q4', revenue: 310, operatingProfit: 55 },
    ],
    series: [
      { dataKey: 'revenue', name: '매출', color: COLORS.primary, type: 'bar' },
      { dataKey: 'operatingProfit', name: '영업이익', color: COLORS.secondary, type: 'line' },
    ],
  },
  {
    id: 'cost_breakdown',
    keywords: ['비용', '원가', '경비', '지출', '코스트', '구성'],
    description: '비용 구성 분석',
    xAxisKey: 'category',
    xAxisLabel: '비용 항목',
    yAxisLabel: '비용 (억원)',
    dataType: 'categorical',
    metrics: ['비용'],
    data: [
      { category: '인건비', cost: 180 },
      { category: 'IT인프라', cost: 95 },
      { category: '마케팅', cost: 72 },
      { category: '임차료', cost: 45 },
      { category: '기타', cost: 38 },
    ],
    series: [
      { dataKey: 'cost', name: '비용', color: COLORS.quaternary },
    ],
  },
];

export function findMatchingDataset(query: string): DatasetMeta {
  const normalizedQuery = query.toLowerCase();

  let bestMatch: DatasetMeta | null = null;
  let bestScore = 0;

  for (const dataset of MOCK_DATASETS) {
    const score = dataset.keywords.reduce((acc, kw) => {
      return acc + (normalizedQuery.includes(kw) ? 1 : 0);
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = dataset;
    }
  }

  // 기본값: 월별 매출 추이 (가장 범용적)
  return bestMatch ?? MOCK_DATASETS[0];
}
