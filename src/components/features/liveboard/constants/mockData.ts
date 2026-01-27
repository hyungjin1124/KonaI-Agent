// Liveboard Mock Data
// 데이터 상수 정의 - 렌더러와 분리

// Revenue Bridge Chart Data
export const revenueFactorData = [
  { name: '11월 매출 (기본)', value: 37, type: 'base', description: '전월 실적' },
  { name: '물량 효과 (Q)', value: 3.5, type: 'increase', description: 'A은행 +20만장' },
  { name: '단가 효과 (P)', value: 1.5, type: 'increase', description: 'ASP +8%' },
  { name: '12월 매출 (확정)', value: 42, type: 'total', description: '당월 실적' },
];

// Cost Correlation Chart Data
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

// Sales Trend Data
export const salesTrendData2025 = [
  { name: '10월', sales: 32 },
  { name: '11월', sales: 37 },
  { name: '12월', sales: 42, active: true },
];

// Metal Product Data
export const metalProductData = [
  { name: 'Standard', value: 18.5, color: '#000000' },
  { name: 'Gold Premium', value: 12.2, color: '#FFD700' },
  { name: 'LED Metal', value: 8.4, color: '#FF3C42' },
  { name: 'Bio-Metal', value: 2.9, color: '#E5E7EB' },
];

// Metal Daily Data
export const metalDailyData = [
  { day: '12/22', revenue: 1.2 },
  { day: '12/23', revenue: 1.5 },
  { day: '12/24', revenue: 1.8 },
  { day: '12/25', revenue: 0.8 },
  { day: '12/26', revenue: 2.4 },
  { day: '12/27', revenue: 2.2 },
  { day: '12/28', revenue: 2.3 },
];

// Product Breakdown Data
export const productBreakdownData = [
  { name: 'Standard Metal', value: 450, color: '#000000' },
  { name: 'Gold/Premium', value: 320, color: '#FFD700' },
  { name: 'LED Metal', value: 180, color: '#FF3C42' },
];

// Japan Scenario Data
export const japanScenarioData: Record<string, { revenue: number; profit: number; margin: number }> = {
  '9.0': { revenue: 1120, profit: 72, margin: 6.4 },
  '9.5': { revenue: 1180, profit: 80, margin: 6.8 },
  '10.0': { revenue: 1240, profit: 95, margin: 7.7 },
};

// Cost Efficiency Data
export const costEfficiencyData = [
  { name: '10월', ratio: 68, cost: 21.8, target: 65 },
  { name: '11월', ratio: 65, cost: 24.0, target: 65 },
  { name: '12월', ratio: 62, cost: 26.0, target: 65 },
];

// DID Analysis Data
export const didAnalysisData = [
  { name: '10월', orders: 2.5, revenue: 1.8 },
  { name: '11월', orders: 2.2, revenue: 2.0 },
  { name: '12월', orders: 1.7, revenue: 1.9 },
];

// Customer Growth Data
export const customerGrowthData = [
  { name: 'A은행', nov: 5.0, dec: 12.0, growth: 140.0 },
  { name: 'B카드', nov: 8.0, dec: 11.0, growth: 37.5 },
  { name: 'C카드', nov: 15.0, dec: 14.0, growth: -6.7 },
  { name: '기타', nov: 9.0, dec: 5.0, growth: -44.4 },
];

// Benchmark Data
export const benchmarkData = [
  { name: '자사(Kona I)', cost: 62, fill: '#FF3C42' },
  { name: '경쟁사 A', cost: 68, fill: '#9CA3AF' },
  { name: '경쟁사 B', cost: 71, fill: '#9CA3AF' },
  { name: '경쟁사 C', cost: 65, fill: '#9CA3AF' },
];

// Analyst Report Response
export const ANALYST_REPORT_RESPONSE = `
**[2026년 사업 전망 보고서]**

**1. 종합 전망**
추가해주신 12월 4주차 데이터를 포함하여 분석한 결과, 2026년은 **매출 5,200억 원(+18% YoY)** 달성이 유력합니다.

**2. 핵심 성장 동력**
*   **프리미엄 라인업 확대:** Gold Edition 및 LED Metal 카드의 수요가 전년 대비 45% 증가할 것으로 예측됩니다.
*   **글로벌 시장 침투:** 일본 및 동남아 시장의 수주 잔고가 1분기부터 매출로 실현됩니다.

**3. 리스크 요인 및 대응**
*   원자재 공급망 불안정성이 존재하나, 장기 계약을 통해 2026년 상반기 물량은 이미 확보되었습니다.

상세한 내용은 하단의 리포트 파일을 다운로드하여 확인하시기 바랍니다.
`;

// Widget Selection Default Items
export const defaultWidgetSelection = [
  { id: 'kpi', title: '주요 경영 지표 (Main KPIs)', type: 'KPI Grid', date: '2025.12.28', checked: true },
  { id: 'chart1', title: '메탈카드 월별 매출 추이', type: 'Line Chart', date: '2025.12.28', checked: true },
  { id: 'chart2', title: '원가율 개선 추이', type: 'Composed Chart', date: '2025.12.28', checked: true },
  { id: 'chart3', title: '고객사별 매출 성장 분석', type: 'Bar Chart', date: '2025.12.28', checked: true },
  { id: 'chart4', title: 'DID 칩 수주 vs 매출 흐름', type: 'Composed Chart', date: '2025.12.28', checked: true },
  { id: 'stock', title: '주식 관련 재무 지표', type: 'Stock Grid', date: '2025.12.28', checked: true },
];

// Time Filter Options
export const timeOptions = ['일간', '주간', '월간', '연간'];
