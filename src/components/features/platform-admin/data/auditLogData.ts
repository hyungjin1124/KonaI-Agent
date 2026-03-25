import type { PlatformAuditEvent, PlatformAuditSummary } from './platformAdminTypes';

export const PLATFORM_AUDIT_SUMMARY: PlatformAuditSummary = {
  todayEvents: { value: '847' },
  weeklyWarnings: { value: '12' },
  activeTenants: { value: '18/24' },
  lastExport: { value: '3월 14일', subtitle: 'CSV · 관리자' },
};

export const MOCK_PLATFORM_AUDIT_EVENTS: PlatformAuditEvent[] = [
  {
    id: 'pe1',
    timestamp: '14:23',
    eventType: 'api_key',
    severity: 'Warning',
    action: 'API 키 폐기',
    description: '삼성전자 Legacy key (v1) 폐기',
    actor: 'admin@konai.com',
    ip: '10.0.1.42',
    tenantName: '삼성전자',
    detail: 'sk-leg-****-c912 → status: active → revoked',
  },
  {
    id: 'pe2',
    timestamp: '11:47',
    eventType: 'tenant_config',
    severity: 'Info',
    action: '리소스 제한 변경',
    description: '현대자동차 토큰 한도 수정',
    actor: 'ops@konai.com',
    ip: '10.0.1.38',
    tenantName: '현대자동차',
    detail: 'token_limit: 300M → 500M',
  },
  {
    id: 'pe3',
    timestamp: '10:15',
    eventType: 'tenant_config',
    severity: 'Info',
    action: '테넌트 생성',
    description: '"C 파트너스" 온보딩',
    actor: 'admin@konai.com',
    ip: '10.0.1.42',
    tenantName: 'C 파트너스',
    detail: 'tnt_c_partners · plan: Business · status: trial',
  },
  {
    id: 'pe4',
    timestamp: '09:32',
    eventType: 'auth_login',
    severity: 'Critical',
    action: '인증 실패',
    description: '삼성전자 반복 로그인 실패 (5회)',
    actor: 'unknown@samsung.com',
    ip: '203.248.xx.xx',
    tenantName: '삼성전자',
    detail: 'attempts: 5 · lockout: true',
  },
  {
    id: 'pe5',
    timestamp: '어제 17:08',
    eventType: 'api_key',
    severity: 'Info',
    action: 'API 키 발급',
    description: '스타트업 A Staging 키 발급',
    actor: 'ops@konai.com',
    ip: '10.0.1.38',
    tenantName: '스타트업 A',
    detail: 'sk-stg-****-d4a1 · scope: staging · expires: 2026-09-01',
  },
  {
    id: 'pe6',
    timestamp: '어제 14:51',
    eventType: 'user_permission',
    severity: 'Info',
    action: '권한 변경',
    description: '현대자동차 박영수 역할 변경',
    actor: 'admin@hyundai.com',
    ip: '192.168.xx.xx',
    tenantName: '현대자동차',
    detail: 'role: Viewer → Data Manager',
  },
];

export const EVENT_TYPE_OPTIONS = [
  { value: 'all', label: '전체 이벤트' },
  { value: 'api_key', label: 'API 키 관리' },
  { value: 'tenant_config', label: '테넌트 설정' },
  { value: 'user_permission', label: '사용자 권한' },
  { value: 'auth_login', label: '인증/로그인' },
  { value: 'billing', label: '빌링' },
];

export const SEVERITY_OPTIONS = [
  { value: 'all', label: '전체 심각도' },
  { value: 'Critical', label: 'Critical' },
  { value: 'Warning', label: 'Warning' },
  { value: 'Info', label: 'Info' },
];

export const PERIOD_OPTIONS = [
  { value: '24h', label: '최근 24시간' },
  { value: '7d', label: '최근 7일' },
  { value: '30d', label: '최근 30일' },
];

export const TENANT_FILTER_OPTIONS = [
  { value: 'all', label: '전체 테넌트' },
  { value: '삼성전자', label: '삼성전자' },
  { value: '현대자동차', label: '현대자동차' },
  { value: '스타트업 A', label: '스타트업 A' },
  { value: 'B Corp', label: 'B Corp' },
  { value: 'C 파트너스', label: 'C 파트너스' },
  { value: 'D 그룹', label: 'D 그룹' },
];

export function filterAuditEvents(
  events: PlatformAuditEvent[],
  filters: { tenant?: string; eventType?: string; severity?: string; search?: string }
): PlatformAuditEvent[] {
  let result = events;
  if (filters.tenant && filters.tenant !== 'all') {
    result = result.filter(e => e.tenantName === filters.tenant);
  }
  if (filters.eventType && filters.eventType !== 'all') {
    result = result.filter(e => e.eventType === filters.eventType);
  }
  if (filters.severity && filters.severity !== 'all') {
    result = result.filter(e => e.severity === filters.severity);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(e =>
      e.actor.toLowerCase().includes(q) ||
      e.ip.toLowerCase().includes(q) ||
      e.detail.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
    );
  }
  return result;
}

// Chart data for analysis section
export const EVENT_TYPE_DISTRIBUTION = [
  { type: 'API 키', count: 234 },
  { type: '테넌트 설정', count: 189 },
  { type: '인증/로그인', count: 312 },
  { type: '사용자 권한', count: 67 },
  { type: '빌링', count: 45 },
];

export function generateHourlyVolume() {
  const data = [];
  for (let h = 0; h < 24; h++) {
    data.push({
      hour: `${h.toString().padStart(2, '0')}:00`,
      info: Math.round(20 + Math.random() * 30),
      warning: Math.round(2 + Math.random() * 5),
      critical: Math.round(Math.random() * 2),
    });
  }
  return data;
}

export const HOURLY_VOLUME = generateHourlyVolume();
