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
  // Phase 2: 고급 차트용 데이터셋
  {
    id: 'revenue_flow',
    keywords: ['흐름', '플로우', '유입', '전환', '경로', '채널', '산키'],
    description: '매출 채널별 흐름',
    xAxisKey: 'name',
    xAxisLabel: '',
    yAxisLabel: '',
    dataType: 'flow',
    metrics: ['유입량'],
    data: [],
    series: [],
    sankeyData: {
      nodes: [
        { name: '온라인 광고' },
        { name: '오프라인 광고' },
        { name: '자연 유입' },
        { name: '웹사이트 방문' },
        { name: '앱 방문' },
        { name: '상담 요청' },
        { name: '가입 완료' },
        { name: '첫 거래' },
      ],
      links: [
        { source: 0, target: 3, value: 450 },
        { source: 0, target: 4, value: 280 },
        { source: 1, target: 3, value: 180 },
        { source: 1, target: 5, value: 120 },
        { source: 2, target: 3, value: 320 },
        { source: 2, target: 4, value: 200 },
        { source: 3, target: 5, value: 400 },
        { source: 3, target: 6, value: 350 },
        { source: 4, target: 5, value: 200 },
        { source: 4, target: 6, value: 280 },
        { source: 5, target: 6, value: 450 },
        { source: 5, target: 7, value: 170 },
        { source: 6, target: 7, value: 680 },
      ],
    },
  },
  {
    id: 'budget_hierarchy',
    keywords: ['계층', '트리맵', '예산', '항목별', '세부'],
    description: '예산 항목별 배분',
    xAxisKey: 'name',
    xAxisLabel: '',
    yAxisLabel: '',
    dataType: 'hierarchical',
    metrics: ['예산'],
    data: [],
    series: [],
    treemapData: [
      {
        name: '경영지원',
        children: [
          { name: '인건비', size: 180, color: COLORS.primary },
          { name: '임차료', size: 45, color: '#FF6B6F' },
          { name: '복리후생', size: 32, color: '#FF9B9D' },
        ],
      },
      {
        name: 'IT',
        children: [
          { name: '인프라', size: 95, color: COLORS.secondary },
          { name: '개발인력', size: 120, color: '#60A5FA' },
          { name: '라이선스', size: 28, color: '#93C5FD' },
        ],
      },
      {
        name: '마케팅',
        children: [
          { name: '디지털 마케팅', size: 45, color: COLORS.tertiary },
          { name: '오프라인', size: 27, color: '#6EE7B7' },
        ],
      },
      {
        name: '신사업',
        children: [
          { name: 'R&D', size: 65, color: COLORS.quaternary },
          { name: '해외 진출', size: 38, color: '#FCD34D' },
        ],
      },
    ],
  },
  {
    id: 'monthly_division_performance',
    keywords: ['히트맵', '월별', '부서별', '성과', '매트릭스', '격자'],
    description: '월별 사업부 성과 매트릭스',
    xAxisKey: 'x',
    xAxisLabel: '월',
    yAxisLabel: '사업부',
    dataType: 'matrix',
    metrics: ['성과지수'],
    data: [],
    series: [],
    heatmapData: [
      { x: '1월', y: '카드', value: 78 }, { x: '2월', y: '카드', value: 82 },
      { x: '3월', y: '카드', value: 91 }, { x: '4월', y: '카드', value: 85 },
      { x: '5월', y: '카드', value: 88 }, { x: '6월', y: '카드', value: 95 },
      { x: '1월', y: '결제', value: 65 }, { x: '2월', y: '결제', value: 72 },
      { x: '3월', y: '결제', value: 68 }, { x: '4월', y: '결제', value: 75 },
      { x: '5월', y: '결제', value: 80 }, { x: '6월', y: '결제', value: 78 },
      { x: '1월', y: 'DID', value: 45 }, { x: '2월', y: 'DID', value: 52 },
      { x: '3월', y: 'DID', value: 58 }, { x: '4월', y: 'DID', value: 62 },
      { x: '5월', y: 'DID', value: 70 }, { x: '6월', y: 'DID', value: 75 },
      { x: '1월', y: '데이터', value: 55 }, { x: '2월', y: '데이터', value: 60 },
      { x: '3월', y: '데이터', value: 65 }, { x: '4월', y: '데이터', value: 72 },
      { x: '5월', y: '데이터', value: 78 }, { x: '6월', y: '데이터', value: 82 },
    ],
  },
  {
    id: 'quarterly_waterfall',
    keywords: ['폭포', '워터폴', '증감', '변동', '요인', '기여'],
    description: '분기 매출 증감 요인',
    xAxisKey: 'category',
    xAxisLabel: '항목',
    yAxisLabel: '금액 (억원)',
    dataType: 'categorical',
    metrics: ['금액'],
    data: [
      { category: '전기 매출', base: 0, value: 280, total: 280 },
      { category: '카드 성장', base: 280, value: 45, total: 325 },
      { category: '결제 성장', base: 325, value: 30, total: 355 },
      { category: '해외 진출', base: 355, value: 20, total: 375 },
      { category: '마케팅 비용', base: 375, value: -25, total: 350 },
      { category: 'IT 투자', base: 350, value: -15, total: 335 },
      { category: '당기 매출', base: 0, value: 335, total: 335 },
    ],
    series: [
      { dataKey: 'value', name: '증감', color: COLORS.tertiary },
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
