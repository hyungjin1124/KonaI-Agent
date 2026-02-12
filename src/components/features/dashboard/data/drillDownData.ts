// Drill-down mock data for Sales Analysis Dashboard
// Types colocated here (Karpathy: no single-use type files)

export interface RevenueFactorDrillPoint {
  name: string;
  value: number;
  description: string;
  type: 'increase';
}

export interface CostCorrelationDrillPoint {
  name: string;
  automation: number;
  costRatio: number;
}

export interface KPIDrillPoint {
  date: string;
  value: number;
}

export interface DrillDimension<T> {
  id: string;
  label: string;
  data: T[];
}

export interface MultiDimensionDrill<T> {
  title: string;
  dimensions: DrillDimension<T>[];
}

// Revenue Bridge drill-down: factor name → multi-dimension breakdown
export const revenueFactorDrillData: Record<string, MultiDimensionDrill<RevenueFactorDrillPoint>> = {
  '물량 효과 (Q)': {
    title: '물량 효과 상세',
    dimensions: [
      {
        id: 'by_customer', label: '거래처별',
        data: [
          { name: 'A은행', value: 1.8, description: '+20만장', type: 'increase' },
          { name: 'B은행', value: 0.9, description: '+10만장', type: 'increase' },
          { name: 'C은행', value: 0.5, description: '+5만장', type: 'increase' },
          { name: '기타', value: 0.3, description: '+3만장', type: 'increase' },
        ],
      },
      {
        id: 'by_product', label: '제품별',
        data: [
          { name: 'Gold Edition', value: 1.5, description: '+12만장', type: 'increase' },
          { name: 'Standard', value: 1.2, description: '+15만장', type: 'increase' },
          { name: 'LED Metal', value: 0.8, description: '+8만장', type: 'increase' },
        ],
      },
      {
        id: 'by_region', label: '지역별',
        data: [
          { name: '수도권', value: 2.0, description: '+22만장', type: 'increase' },
          { name: '영남', value: 0.8, description: '+9만장', type: 'increase' },
          { name: '호남', value: 0.5, description: '+5만장', type: 'increase' },
          { name: '기타 지역', value: 0.2, description: '+2만장', type: 'increase' },
        ],
      },
    ],
  },
  '단가 효과 (P)': {
    title: '단가 효과 상세',
    dimensions: [
      {
        id: 'by_product', label: '제품별',
        data: [
          { name: 'Gold Edition', value: 0.8, description: 'ASP +12%', type: 'increase' },
          { name: 'Standard', value: 0.4, description: 'ASP +5%', type: 'increase' },
          { name: 'LED Metal', value: 0.3, description: 'ASP +15%', type: 'increase' },
        ],
      },
      {
        id: 'by_channel', label: '채널별',
        data: [
          { name: '직접 영업', value: 0.9, description: 'ASP +10%', type: 'increase' },
          { name: '파트너 채널', value: 0.4, description: 'ASP +6%', type: 'increase' },
          { name: '온라인', value: 0.2, description: 'ASP +3%', type: 'increase' },
        ],
      },
    ],
  },
};

// Cost Correlation drill-down: month → multi-dimension breakdown
export const costCorrelationDrillData: Record<string, MultiDimensionDrill<CostCorrelationDrillPoint>> = {
  '10월': {
    title: '10월 상세',
    dimensions: [
      {
        id: 'by_factory', label: '공장별',
        data: [
          { name: '1공장', automation: 50, costRatio: 65 },
          { name: '2공장', automation: 35, costRatio: 70 },
          { name: '3공장', automation: 30, costRatio: 72 },
        ],
      },
      {
        id: 'by_process', label: '공정별',
        data: [
          { name: '인쇄', automation: 60, costRatio: 58 },
          { name: '라미네이팅', automation: 40, costRatio: 68 },
          { name: '임베딩', automation: 25, costRatio: 75 },
        ],
      },
    ],
  },
  '11월': {
    title: '11월 상세',
    dimensions: [
      {
        id: 'by_factory', label: '공장별',
        data: [
          { name: '1공장', automation: 65, costRatio: 62 },
          { name: '2공장', automation: 50, costRatio: 66 },
          { name: '3공장', automation: 45, costRatio: 68 },
        ],
      },
      {
        id: 'by_process', label: '공정별',
        data: [
          { name: '인쇄', automation: 72, costRatio: 55 },
          { name: '라미네이팅', automation: 55, costRatio: 64 },
          { name: '임베딩', automation: 38, costRatio: 72 },
        ],
      },
    ],
  },
  '12월': {
    title: '12월 상세',
    dimensions: [
      {
        id: 'by_factory', label: '공장별',
        data: [
          { name: '1공장', automation: 85, costRatio: 58 },
          { name: '2공장', automation: 72, costRatio: 63 },
          { name: '3공장', automation: 68, costRatio: 66 },
        ],
      },
      {
        id: 'by_process', label: '공정별',
        data: [
          { name: '인쇄', automation: 88, costRatio: 52 },
          { name: '라미네이팅', automation: 75, costRatio: 60 },
          { name: '임베딩', automation: 55, costRatio: 68 },
        ],
      },
    ],
  },
};

// KPI drill-down: kpiId → multi-dimension breakdown
export const kpiDrillData: Record<string, MultiDimensionDrill<KPIDrillPoint>> = {
  revenue: {
    title: '12월 매출 추이',
    dimensions: [
      {
        id: 'by_day', label: '일별',
        data: [
          { date: '12/01', value: 1.2 },
          { date: '12/05', value: 1.5 },
          { date: '12/10', value: 1.4 },
          { date: '12/15', value: 1.8 },
          { date: '12/20', value: 2.1 },
          { date: '12/25', value: 1.9 },
          { date: '12/28', value: 2.3 },
        ],
      },
      {
        id: 'by_week', label: '주별',
        data: [
          { date: '1주차', value: 5.2 },
          { date: '2주차', value: 6.1 },
          { date: '3주차', value: 7.0 },
          { date: '4주차', value: 6.8 },
        ],
      },
    ],
  },
  cost: {
    title: '12월 원가율 추이',
    dimensions: [
      {
        id: 'by_day', label: '일별',
        data: [
          { date: '12/01', value: 65 },
          { date: '12/05', value: 64 },
          { date: '12/10', value: 63 },
          { date: '12/15', value: 62.5 },
          { date: '12/20', value: 62 },
          { date: '12/25', value: 61.5 },
          { date: '12/28', value: 62 },
        ],
      },
      {
        id: 'by_week', label: '주별',
        data: [
          { date: '1주차', value: 64.5 },
          { date: '2주차', value: 63.2 },
          { date: '3주차', value: 62.0 },
          { date: '4주차', value: 61.8 },
        ],
      },
    ],
  },
  asp: {
    title: '12월 ASP 추이',
    dimensions: [
      {
        id: 'by_day', label: '일별',
        data: [
          { date: '12/01', value: 28 },
          { date: '12/05', value: 29 },
          { date: '12/10', value: 30 },
          { date: '12/15', value: 31 },
          { date: '12/20', value: 32 },
          { date: '12/25', value: 33 },
          { date: '12/28', value: 34 },
        ],
      },
      {
        id: 'by_week', label: '주별',
        data: [
          { date: '1주차', value: 28.5 },
          { date: '2주차', value: 30.0 },
          { date: '3주차', value: 31.5 },
          { date: '4주차', value: 33.5 },
        ],
      },
    ],
  },
};
