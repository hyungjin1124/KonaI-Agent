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

// --- Agent Usage Distribution (단일 에이전트) ---

export const AGENT_USAGE_DATA: AgentUsageData[] = [
  { name: 'KonaI Agent', runs: 3241, tokens: 12400000, color: '#1A1A1A' },
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

// ============================================================================
// Phase 2 — Agent Cost Breakdown, Team Budgets, Health Status, User Usage
// ============================================================================

// --- Agent Health Status ---

export type HealthStatus = 'healthy' | 'degraded' | 'down';

export interface AgentHealthStatus {
  id: string;
  name: string;
  status: HealthStatus;
  latencyMs: number;
  errorRate: number;
}

export const AGENT_HEALTH_DATA: AgentHealthStatus[] = [
  { id: 'konai', name: 'KonaI Agent', status: 'healthy', latencyMs: 245, errorRate: 0.3 },
];

// --- Agent Cost Breakdown ---

export interface AgentCostBreakdown {
  id: string;
  name: string;
  totalTokens: number;
  costUsd: number;
  billedCredits: number;
  activeUsers: number;
  weeklyTrend: number[];
  color: string;
}

export const AGENT_COST_DATA: AgentCostBreakdown[] = [
  { id: 'konai', name: 'KonaI Agent', totalTokens: 12400000, costUsd: 2847, billedCredits: 1424, activeUsers: 156, weeklyTrend: [352, 395, 382, 433, 418, 466, 460], color: '#1A1A1A' },
];

// --- Agent Daily Usage (for drilldown) ---

export interface AgentDailyUsage {
  date: string;
  tokens: number;
  cost: number;
  runs: number;
}

function generateAgentDailyData(baseTokens: number, baseCost: number, baseRuns: number): AgentDailyUsage[] {
  const data: AgentDailyUsage[] = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date('2026-02-28');
    date.setDate(date.getDate() + i);
    const noise = 0.7 + Math.random() * 0.6;
    const tokens = Math.round(baseTokens * noise);
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      tokens,
      cost: Math.round(baseCost * noise * 100) / 100,
      runs: Math.round(baseRuns * noise),
    });
  }
  return data;
}

export const AGENT_DAILY_USAGE: Record<string, AgentDailyUsage[]> = {
  konai: generateAgentDailyData(886000, 203, 232),
};

// --- Team Budget Allocation ---

export interface TeamBudget {
  id: string;
  name: string;
  monthlyTokenQuota: number;
  currentUsage: number;
  budgetUsd: number;
  spentUsd: number;
  memberCount: number;
}

export const TEAM_BUDGET_DATA: TeamBudget[] = [
  { id: 'engineering', name: 'Engineering', monthlyTokenQuota: 10000000, currentUsage: 6200000, budgetUsd: 2000, spentUsd: 1240, memberCount: 45 },
  { id: 'sales', name: 'Sales', monthlyTokenQuota: 4000000, currentUsage: 3720000, budgetUsd: 800, spentUsd: 744, memberCount: 28 },
  { id: 'support', name: 'Support', monthlyTokenQuota: 2500000, currentUsage: 500000, budgetUsd: 500, spentUsd: 100, memberCount: 15 },
];

// --- User Usage Data ---

export interface UserUsageData {
  id: string;
  name: string;
  email: string;
  team: string;
  totalTokens: number;
  costUsd: number;
  activeAgents: string[];
  lastActivity: string;
}

export const USER_USAGE_DATA: UserUsageData[] = [
  { id: 'u1', name: '김현진', email: 'hj.kim@konai.com', team: 'Engineering', totalTokens: 820000, costUsd: 180.4, activeAgents: ['KonaI'], lastActivity: '2분 전' },
  { id: 'u2', name: '이서연', email: 'sy.lee@konai.com', team: 'Engineering', totalTokens: 650000, costUsd: 143.0, activeAgents: ['KonaI'], lastActivity: '15분 전' },
  { id: 'u3', name: '박지훈', email: 'jh.park@konai.com', team: 'Sales', totalTokens: 580000, costUsd: 127.6, activeAgents: ['KonaI'], lastActivity: '1시간 전' },
  { id: 'u4', name: '정민수', email: 'ms.jung@konai.com', team: 'Engineering', totalTokens: 520000, costUsd: 114.4, activeAgents: ['KonaI'], lastActivity: '30분 전' },
  { id: 'u5', name: '최유나', email: 'yn.choi@konai.com', team: 'Sales', totalTokens: 480000, costUsd: 105.6, activeAgents: ['KonaI'], lastActivity: '3시간 전' },
  { id: 'u6', name: '한도윤', email: 'dy.han@konai.com', team: 'Support', totalTokens: 420000, costUsd: 92.4, activeAgents: ['KonaI'], lastActivity: '45분 전' },
  { id: 'u7', name: '송예린', email: 'yr.song@konai.com', team: 'Engineering', totalTokens: 380000, costUsd: 83.6, activeAgents: ['KonaI'], lastActivity: '2시간 전' },
  { id: 'u8', name: '윤태호', email: 'th.yoon@konai.com', team: 'Sales', totalTokens: 310000, costUsd: 68.2, activeAgents: ['KonaI'], lastActivity: '5시간 전' },
  { id: 'u9', name: '임수빈', email: 'sb.lim@konai.com', team: 'Support', totalTokens: 250000, costUsd: 55.0, activeAgents: ['KonaI'], lastActivity: '1일 전' },
  { id: 'u10', name: '오지현', email: 'jh.oh@konai.com', team: 'Engineering', totalTokens: 190000, costUsd: 41.8, activeAgents: ['KonaI'], lastActivity: '3시간 전' },
  { id: 'u11', name: '강민재', email: 'mj.kang@konai.com', team: 'Sales', totalTokens: 170000, costUsd: 37.4, activeAgents: ['KonaI'], lastActivity: '6시간 전' },
  { id: 'u12', name: '배은서', email: 'es.bae@konai.com', team: 'Support', totalTokens: 140000, costUsd: 30.8, activeAgents: ['KonaI'], lastActivity: '1일 전' },
];
