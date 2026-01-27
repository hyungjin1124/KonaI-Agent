// Dashboard Static Data
// 컴포넌트 외부로 이동하여 리렌더링 방지

// Monthly Sales Data
export const monthlyData = [
  { name: '1월', sales: 8.2, lastYear: 7.5 },
  { name: '2월', sales: 8.5, lastYear: 7.8 },
  { name: '3월', sales: 9.1, lastYear: 8.2 },
  { name: '4월', sales: 9.8, lastYear: 8.5 },
  { name: '5월', sales: 10.2, lastYear: 9.1 },
  { name: '6월', sales: 10.5, lastYear: 9.4 },
  { name: '7월', sales: 11.2, lastYear: 9.8 },
  { name: '8월', sales: 11.5, lastYear: 10.2 },
  { name: '9월', sales: 12.1, lastYear: 10.5 },
  { name: '10월', sales: 12.8, lastYear: 11.2 },
  { name: '11월', sales: 13.5, lastYear: 11.8 },
  { name: '12월', sales: 15.1, lastYear: 12.5 },
];

// Pie Chart Data (Business Composition)
export const pieData = [
  { name: '플랫폼', value: 38 },
  { name: '핀테크', value: 27 },
  { name: '커머스', value: 20 },
  { name: 'B2B 솔루션', value: 10 },
  { name: '해외사업', value: 5 },
];

// Platform Detail Data
export const platformDetailData = [
  { name: '지역화폐', value: 45 },
  { name: '코나카드', value: 30 },
  { name: '택시 앱', value: 15 },
  { name: '기타 플랫폼', value: 10 },
];

// Client Data
export const clientData = [
  { name: '고객A', value: 14.2 },
  { name: '고객B', value: 12.8 },
  { name: '고객C', value: 10.5 },
  { name: '고객D', value: 9.2 },
  { name: '고객E', value: 8.5 },
];

// Revenue Factor Data (Bridge Chart)
export const revenueFactorData = [
  { name: '11월 매출 (기본)', value: 37, type: 'base', description: '전월 실적' },
  { name: '물량 효과 (Q)', value: 3.5, type: 'increase', description: 'A은행 +20만장' },
  { name: '단가 효과 (P)', value: 1.5, type: 'increase', description: 'ASP +8%' },
  { name: '12월 매출 (확정)', value: 42, type: 'total', description: '당월 실적' },
];

// Cost Correlation Data
export const costCorrelationData = [
  { name: '10월', automation: 40, costRatio: 68 },
  { name: '11월', automation: 55, costRatio: 65 },
  { name: '12월', automation: 75, costRatio: 62 },
];

// Anomaly Cost Trend Data
export const anomalyCostTrendData = [
  { time: '09:00', cost: 62 },
  { time: '10:00', cost: 63 },
  { time: '11:00', cost: 62 },
  { time: '12:00', cost: 64 },
  { time: '13:00', cost: 72 }, // Spike
  { time: '14:00', cost: 71 },
  { time: '15:00', cost: 69 }, // Recovering
];

// DID Revenue Data
export const didRevenueData = [
  { name: 'Q1', domestic: 85, overseas: 145 },
  { name: 'Q2', domestic: 92, overseas: 160 },
  { name: 'Q3', domestic: 88, overseas: 185 },
  { name: 'Q4', domestic: 105, overseas: 210 },
];

// Chart Colors
export const COLORS = ['#000000', '#555555', '#848383', '#AAAAAA', '#E5E7EB'];
