// ============================================================================
// Usage Monitoring Mock Data
// ============================================================================
// Mock 데이터 레이어. 추후 API 교체 시 이 파일만 변경하면 됨.

export interface DailyUsageData {
  date: string;
  tokens: number;
  cost: number;
}

export interface AgentUsageData {
  name: string;
  runs: number;
  tokens: number;
  color: string;
}

export interface ModelCostData {
  name: string;
  cost: number;
  tokens: number;
  color: string;
}

export type PeriodFilter = '7d' | '30d' | '90d';

// --- KPI Summary ---

export interface UsageKPISummary {
  totalTokens: { value: string; change: string; trend: 'up' | 'down' | 'neutral' };
  totalCost: { value: string; change: string; trend: 'up' | 'down' | 'neutral' };
  activeUsers: { value: string; change: string; trend: 'up' | 'down' | 'neutral' };
  agentRuns: { value: string; change: string; trend: 'up' | 'down' | 'neutral' };
}

export const USAGE_KPI_SUMMARY: UsageKPISummary = {
  totalTokens: { value: '12.4M', change: '+18.2%', trend: 'up' },
  totalCost: { value: '$2,847', change: '+12.5%', trend: 'up' },
  activeUsers: { value: '156', change: '+8.3%', trend: 'up' },
  agentRuns: { value: '3,241', change: '-2.1%', trend: 'down' },
};

// --- Daily Usage (30 days) ---

function generateDailyData(days: number): DailyUsageData[] {
  const data: DailyUsageData[] = [];
  const baseDate = new Date('2026-02-01');

  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // 주중 사용량이 더 높고, 약간의 성장 추세
    const baseTokens = isWeekend ? 250000 : 420000;
    const growthFactor = 1 + (i / days) * 0.15;
    const noise = 0.8 + Math.random() * 0.4;
    const tokens = Math.round(baseTokens * growthFactor * noise);
    const costPerToken = 0.000022 + Math.random() * 0.000005;

    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      tokens,
      cost: Math.round(tokens * costPerToken * 100) / 100,
    });
  }
  return data;
}

export const DAILY_USAGE_90D = generateDailyData(90);
export const DAILY_USAGE_30D = DAILY_USAGE_90D.slice(-30);
export const DAILY_USAGE_7D = DAILY_USAGE_90D.slice(-7);

export function getDailyUsageByPeriod(period: PeriodFilter): DailyUsageData[] {
  switch (period) {
    case '7d':
      return DAILY_USAGE_7D;
    case '30d':
      return DAILY_USAGE_30D;
    case '90d':
      return DAILY_USAGE_90D;
  }
}

// --- Agent Usage Distribution ---

export const AGENT_USAGE_DATA: AgentUsageData[] = [
  { name: 'PPT 에이전트', runs: 1243, tokens: 4800000, color: '#FF3C42' },
  { name: '분석 에이전트', runs: 987, tokens: 3200000, color: '#2563EB' },
  { name: '채팅 에이전트', runs: 654, tokens: 2800000, color: '#10B981' },
  { name: '데이터 에이전트', runs: 357, tokens: 1600000, color: '#F59E0B' },
];

// --- Model Cost Distribution ---

export const MODEL_COST_DATA: ModelCostData[] = [
  { name: 'GPT-4o', cost: 1420, tokens: 3200000, color: '#10B981' },
  { name: 'Claude 3.5 Sonnet', cost: 890, tokens: 4100000, color: '#8B5CF6' },
  { name: 'GPT-4o-mini', cost: 320, tokens: 3800000, color: '#3B82F6' },
  { name: 'Claude 3 Haiku', cost: 217, tokens: 1300000, color: '#F59E0B' },
];

// --- Period Labels ---

export const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: '7d', label: '7일' },
  { value: '30d', label: '30일' },
  { value: '90d', label: '90일' },
];
