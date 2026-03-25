import type { Tenant, TenantHealthMetrics, HealthLevel } from './platformAdminTypes';

export function calculateHealthScore(m: TenantHealthMetrics): number {
  const errorScore = Math.max(0, 100 - m.errorRate * 20) * 0.30;
  const responseScore = Math.max(0, 100 - (m.responseTimeSec - 1) * 33) * 0.20;
  const tokenScore = Math.max(0, 100 - m.tokenLimitUsage) * 0.25;
  const activityScore = Math.max(0, 100 - (m.lastActivityMinutes / 14.4)) * 0.15;
  const paymentScore = (m.paymentStatus === 'paid' ? 100 : m.paymentStatus === 'trial' ? 70 : 0) * 0.10;
  return Math.round(errorScore + responseScore + tokenScore + activityScore + paymentScore);
}

export function getHealthLevel(score: number): HealthLevel {
  if (score >= 70) return 'healthy';
  if (score >= 40) return 'warning';
  return 'danger';
}

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 'tnt_samsung',
    name: '삼성전자',
    domain: 'samsung.com',
    industry: 'manufacturing',
    plan: 'Enterprise',
    status: 'Active',
    healthScore: 92,
    healthLevel: 'healthy',
    metrics: { errorRate: 0.3, responseTimeSec: 1.2, tokenLimitUsage: 62, lastActivityAgo: '2분 전', lastActivityMinutes: 2, paymentStatus: 'paid' },
    contact: { name: '김철수', email: 'cheolsu@samsung.com', phone: '02-1234-5678' },
    contractPeriod: { start: '2025-03-15', end: '2026-03-14' },
    memo: 'AI 혁신팀 주관, 분기 리뷰 예정',
    apiKeys: [
      { id: 'k1', name: 'Production key', keyPrefix: 'sk-prod-****-a3f2', status: 'Active', createdAt: '2025-03-15', lastUsed: '2분 전' },
      { id: 'k2', name: 'Staging key', keyPrefix: 'sk-stg-****-b7e1', status: 'Active', createdAt: '2025-04-02', lastUsed: '3시간 전' },
      { id: 'k3', name: 'Legacy key (v1)', keyPrefix: 'sk-leg-****-c912', status: 'Revoked', createdAt: '2025-01-10' },
    ],
    resourceLimits: { rateLimitPerMin: 10000, tokenLimitPerMonth: '500M tokens', maxConcurrentSessions: 200, maxUsers: 200, fileStorageGb: 100, dataRetentionMonths: 12 },
    tags: ['정상'],
  },
  {
    id: 'tnt_hyundai',
    name: '현대자동차',
    domain: 'hyundai.com',
    industry: 'manufacturing',
    plan: 'Business',
    status: 'Active',
    healthScore: 64,
    healthLevel: 'warning',
    metrics: { errorRate: 3.8, responseTimeSec: 2.1, tokenLimitUsage: 84, lastActivityAgo: '18분 전', lastActivityMinutes: 18, paymentStatus: 'paid' },
    contact: { name: '박영수', email: 'ypark@hyundai.com', phone: '02-2345-6789' },
    contractPeriod: { start: '2025-06-01', end: '2026-05-31' },
    apiKeys: [
      { id: 'k4', name: 'Production key', keyPrefix: 'sk-prod-****-d4e5', status: 'Active', createdAt: '2025-06-01', lastUsed: '18분 전' },
      { id: 'k5', name: 'Test key', keyPrefix: 'sk-tst-****-f6g7', status: 'Active', createdAt: '2025-07-15', lastUsed: '2일 전' },
    ],
    resourceLimits: { rateLimitPerMin: 5000, tokenLimitPerMonth: '300M tokens', maxConcurrentSessions: 100, maxUsers: 100, fileStorageGb: 50, dataRetentionMonths: 6 },
    tags: ['한도 84%', '에러↑'],
  },
  {
    id: 'tnt_startup_a',
    name: '스타트업 A',
    domain: 'startup-a.io',
    plan: 'Starter',
    status: 'Trial',
    healthScore: 85,
    healthLevel: 'healthy',
    metrics: { errorRate: 0.8, responseTimeSec: 1.5, tokenLimitUsage: 23, lastActivityAgo: '1시간 전', lastActivityMinutes: 60, paymentStatus: 'trial' },
    contact: { name: '이지은', email: 'jieun@startup-a.io', phone: '010-1111-2222' },
    contractPeriod: { start: '2026-03-01', end: '2026-03-31' },
    apiKeys: [
      { id: 'k6', name: 'Staging key', keyPrefix: 'sk-stg-****-d4a1', status: 'Active', createdAt: '2026-03-01', lastUsed: '1시간 전', scope: 'staging', expiresAt: '2026-09-01' },
    ],
    resourceLimits: { rateLimitPerMin: 1000, tokenLimitPerMonth: '50M tokens', maxConcurrentSessions: 10, maxUsers: 10, fileStorageGb: 5, dataRetentionMonths: 3 },
    tags: ['체험판 D-12'],
  },
  {
    id: 'tnt_b_corp',
    name: 'B Corp',
    domain: 'bcorp.co.kr',
    plan: 'Business',
    status: 'Suspended',
    healthScore: 28,
    healthLevel: 'danger',
    metrics: { errorRate: 12.4, responseTimeSec: 4.8, tokenLimitUsage: 100, lastActivityAgo: '14일 전', lastActivityMinutes: 20160, paymentStatus: 'unpaid' },
    contact: { name: '최민호', email: 'mh@bcorp.co.kr', phone: '02-3456-7890' },
    contractPeriod: { start: '2025-09-01', end: '2026-08-31' },
    apiKeys: [],
    resourceLimits: { rateLimitPerMin: 5000, tokenLimitPerMonth: '300M tokens', maxConcurrentSessions: 100, maxUsers: 50, fileStorageGb: 50, dataRetentionMonths: 6 },
    tags: ['미결제', '정지'],
  },
  {
    id: 'tnt_c_partners',
    name: 'C 파트너스',
    domain: 'cpartners.com',
    plan: 'Business',
    status: 'Trial',
    healthScore: 51,
    healthLevel: 'warning',
    metrics: { errorRate: 0, responseTimeSec: 0, tokenLimitUsage: 0, lastActivityAgo: '3일 전', lastActivityMinutes: 4320, paymentStatus: 'trial' },
    contact: { name: '정수민', email: 'sumin@cpartners.com', phone: '02-4567-8901' },
    contractPeriod: { start: '2026-03-10', end: '2026-04-09' },
    apiKeys: [
      { id: 'k7', name: 'Test key', keyPrefix: 'sk-tst-****-h8i9', status: 'Active', createdAt: '2026-03-10' },
    ],
    resourceLimits: { rateLimitPerMin: 5000, tokenLimitPerMonth: '300M tokens', maxConcurrentSessions: 100, maxUsers: 50, fileStorageGb: 50, dataRetentionMonths: 6 },
    tags: ['72h 미사용'],
  },
  {
    id: 'tnt_d_group',
    name: 'D 그룹',
    domain: 'dgroup.co.kr',
    industry: 'finance',
    plan: 'Enterprise',
    status: 'Active',
    healthScore: 88,
    healthLevel: 'healthy',
    metrics: { errorRate: 0.5, responseTimeSec: 1.3, tokenLimitUsage: 45, lastActivityAgo: '5분 전', lastActivityMinutes: 5, paymentStatus: 'paid' },
    contact: { name: '한지영', email: 'jiyoung@dgroup.co.kr', phone: '02-5678-9012' },
    contractPeriod: { start: '2025-01-01', end: '2025-12-31' },
    apiKeys: [
      { id: 'k8', name: 'Production key', keyPrefix: 'sk-prod-****-j0k1', status: 'Active', createdAt: '2025-01-01', lastUsed: '5분 전' },
      { id: 'k9', name: 'Staging key', keyPrefix: 'sk-stg-****-l2m3', status: 'Active', createdAt: '2025-02-15', lastUsed: '1일 전' },
    ],
    resourceLimits: { rateLimitPerMin: 10000, tokenLimitPerMonth: '500M tokens', maxConcurrentSessions: 200, maxUsers: 150, fileStorageGb: 100, dataRetentionMonths: 12 },
    tags: ['정상'],
  },
];

export function computeTenantKPI(tenants: Tenant[]) {
  const total = tenants.length;
  const healthy = tenants.filter(t => t.healthLevel === 'healthy').length;
  const warning = tenants.filter(t => t.healthLevel === 'warning').length;
  const danger = tenants.filter(t => t.healthLevel === 'danger').length;

  const allKeys = tenants.flatMap(t => t.apiKeys);
  const totalKeys = allKeys.length;
  const activeKeys = allKeys.filter(k => k.status === 'Active').length;
  const revokedKeys = totalKeys - activeKeys;

  return {
    total: { value: String(total), change: '', subtitle: '' },
    healthy: { value: String(healthy) },
    warningDanger: { warning: String(warning), danger: String(danger) },
    apiKeys: {
      value: String(totalKeys),
      subtitle: `${activeKeys} active · ${revokedKeys} revoked`,
    },
  };
}

export function filterTenants(
  tenants: Tenant[],
  filters: { status?: string; search?: string }
): Tenant[] {
  let result = tenants;
  if (filters.status && filters.status !== '헬스 상태 전체') {
    const statusMap: Record<string, string[]> = {
      '정상': ['healthy'],
      '주의': ['warning'],
      '위험': ['danger'],
      '비활성': [],
    };
    const levels = statusMap[filters.status];
    if (levels?.length) {
      result = result.filter(t => levels.includes(t.healthLevel));
    } else if (filters.status === '비활성') {
      result = result.filter(t => t.status === 'Inactive' || t.status === 'Suspended');
    }
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(t =>
      t.name.toLowerCase().includes(q) || t.domain.toLowerCase().includes(q)
    );
  }
  return result;
}
