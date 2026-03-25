import type {
  ModelCostBreakdown,
  DailyCostData,
  CostForecastData,
  CostSummary,
} from './platformAdminTypes';

export const COST_SUMMARY: CostSummary = {
  totalCost: { value: '₩16,701,100', change: '+18%' },
  efficiency: { value: '₩5.5', subtitle: '토큰당 비용' },
  budgetUsage: { value: '₩16,701,100 / ₩19,500,000', percent: 85.6 },
  forecast: { value: '₩19,916,000', isOverBudget: true },
};

export const MODEL_COST_BREAKDOWN: ModelCostBreakdown[] = [
  { modelName: 'GPT-4o', cost: 6210, tokenCount: 48200000, percentage: 48.3, color: '#6366f1' },
  { modelName: 'Claude Sonnet 4.6', cost: 3420, tokenCount: 28100000, percentage: 26.6, color: '#8b5cf6' },
  { modelName: 'Claude Opus 4.6', cost: 1840, tokenCount: 5200000, percentage: 14.3, color: '#a78bfa' },
  { modelName: 'GPT-4o-mini', cost: 890, tokenCount: 89400000, percentage: 6.9, color: '#c4b5fd' },
  { modelName: 'Claude Haiku 4.5', cost: 310, tokenCount: 62100000, percentage: 2.4, color: '#ddd6fe' },
  { modelName: '기타', cost: 177, tokenCount: 9100000, percentage: 1.4, color: '#e5e7eb' },
];

// Last 14 days of actual cost data by model
function generateDailyCostData(): DailyCostData[] {
  const data: DailyCostData[] = [];
  const models = ['GPT-4o', 'Claude Sonnet', 'Claude Opus', 'GPT-4o-mini', 'Claude Haiku'];
  const baseValues = [210, 115, 62, 30, 11];

  for (let i = 13; i >= 0; i--) {
    const d = new Date('2026-03-18');
    d.setDate(d.getDate() - i);
    const label = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    const row: DailyCostData = { date: label };
    models.forEach((m, idx) => {
      const noise = 1 + (Math.sin(i * idx + idx) * 0.2);
      row[m] = Math.round(baseValues[idx] * noise);
    });
    data.push(row);
  }
  return data;
}

export const DAILY_COST_DATA: DailyCostData[] = generateDailyCostData();

export const COST_MODEL_COLORS: Record<string, string> = {
  'GPT-4o': '#6366f1',
  'Claude Sonnet': '#8b5cf6',
  'Claude Opus': '#a78bfa',
  'GPT-4o-mini': '#c4b5fd',
  'Claude Haiku': '#ddd6fe',
};

// Cost forecast: past 18 days actual + 12 days forecast
function generateCostForecast(): CostForecastData[] {
  const data: CostForecastData[] = [];
  const budget = 500; // daily budget
  let cumActual = 0;
  let cumForecast = 0;
  let cumBudget = 0;

  for (let i = 29; i >= 0; i--) {
    const d = new Date('2026-03-18');
    d.setDate(d.getDate() - i);
    const label = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    const dailyBase = 420 + Math.sin(i * 1.3) * 60;
    cumBudget += budget;

    const isActual = i >= 0; // treat all as having data for demo
    if (i > 0) {
      // past — only actual
      const actual = Math.round(dailyBase * (1 + (Math.random() * 0.15)));
      cumActual += actual;
      data.push({ date: label, actualCost: cumActual, budget: cumBudget });
    } else {
      // today onwards — forecast only
      const forecast = Math.round(dailyBase * 1.1);
      cumForecast = cumActual + forecast;
      data.push({ date: label, actualCost: cumActual, forecastedCost: cumForecast, budget: cumBudget });
    }
  }

  // Add 12 more future days
  for (let i = 1; i <= 12; i++) {
    const d = new Date('2026-03-18');
    d.setDate(d.getDate() + i);
    const label = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    cumBudget += budget;
    const forecast = Math.round(430 * (1 + Math.sin(i) * 0.12));
    cumForecast += forecast;
    data.push({ date: label, forecastedCost: cumForecast, budget: cumBudget });
  }

  return data;
}

export const COST_FORECAST_DATA: CostForecastData[] = generateCostForecast();

// Tenant cost table
export interface TenantCostRow {
  tenantId: string;
  tenantName: string;
  inputTokens: string;
  outputTokens: string;
  totalCost: string;
  budgetPercent: number;
  change: string;
}

export const MOCK_TENANT_COST: TenantCostRow[] = [
  { tenantId: 't1', tenantName: '삼성전자', inputTokens: '28.4M', outputTokens: '12.1M', totalCost: '₩7,046,000', budgetPercent: 90.3, change: '+22%' },
  { tenantId: 't2', tenantName: '현대자동차', inputTokens: '19.2M', outputTokens: '8.4M', totalCost: '₩4,784,000', budgetPercent: 73.6, change: '+15%' },
  { tenantId: 't3', tenantName: '스타트업 A', inputTokens: '8.1M', outputTokens: '3.2M', totalCost: '₩2,004,600', budgetPercent: 51.4, change: '+8%' },
  { tenantId: 't4', tenantName: 'D 그룹', inputTokens: '5.8M', outputTokens: '2.1M', totalCost: '₩1,565,200', budgetPercent: 40.1, change: '+31%' },
  { tenantId: 't5', tenantName: 'E 코퍼레이션', inputTokens: '2.3M', outputTokens: '0.9M', totalCost: '₩651,300', budgetPercent: 16.7, change: '-3%' },
  { tenantId: 't6', tenantName: 'F 테크', inputTokens: '1.1M', outputTokens: '0.4M', totalCost: '₩322,400', budgetPercent: 8.3, change: '+5%' },
];
