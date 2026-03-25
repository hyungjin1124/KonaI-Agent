import type { UsageSummary, TenantUsageRow, AlertRule, AlertHistoryItem, DailyApiCallData, TokenConsumptionData } from './platformAdminTypes';

export const USAGE_SUMMARY: UsageSummary = {
  totalApiCalls: { value: '1.2M', change: '↑ 18%' },
  totalTokens: { value: '847M' },
  activeSessions: { value: '328' },
  thresholdExceeded: { value: '3' },
};

export const MOCK_TENANT_USAGE: TenantUsageRow[] = [
  { tenantId: 'tnt_samsung', tenantName: '삼성전자', apiCalls: '482K', tokens: '312M', agentRuns: '1,247', limitPercent: 62, alertStatus: '정상', alertLevel: 'normal' },
  { tenantId: 'tnt_hyundai', tenantName: '현대자동차', apiCalls: '298K', tokens: '198M', agentRuns: '876', limitPercent: 84, alertStatus: '90% 알림 발송됨', alertLevel: 'warning' },
  { tenantId: 'tnt_b_corp', tenantName: 'B Corp', apiCalls: '—', tokens: '—', agentRuns: '—', limitPercent: 100, alertStatus: '서비스 제한 중', alertLevel: 'danger' },
  { tenantId: 'tnt_startup_a', tenantName: '스타트업 A', apiCalls: '41K', tokens: '28M', agentRuns: '94', limitPercent: 23, alertStatus: '정상', alertLevel: 'normal' },
];

export function generateDailyApiCalls(days: number): DailyApiCallData[] {
  const data: DailyApiCallData[] = [];
  const now = new Date(2026, 2, 17);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      '삼성전자': Math.round(12000 + Math.random() * 6000),
      '현대자동차': Math.round(8000 + Math.random() * 4000),
      '스타트업 A': Math.round(1000 + Math.random() * 800),
      'D 그룹': Math.round(7000 + Math.random() * 3000),
    });
  }
  return data;
}

export function generateTokenConsumption(days: number): TokenConsumptionData[] {
  const data: TokenConsumptionData[] = [];
  const now = new Date(2026, 2, 17);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      inputTokens: Math.round(15 + Math.random() * 10),
      outputTokens: Math.round(10 + Math.random() * 8),
    });
  }
  return data;
}

export const DAILY_API_CALLS_30D = generateDailyApiCalls(30);
export const TOKEN_CONSUMPTION_30D = generateTokenConsumption(30);

export const MOCK_ALERT_RULES: AlertRule[] = [
  {
    id: 'ar1',
    name: '토큰 사용량 임계 경고',
    enabled: true,
    thresholdSteps: [
      { threshold: '75%', channels: ['email'], target: 'tenant' },
      { threshold: '90%', channels: ['email', 'in-app'], target: 'all' },
      { threshold: '100%', channels: ['email', 'in-app', 'slack'], target: 'all', action: '서비스 제한' },
    ],
  },
  {
    id: 'ar2',
    name: 'API Rate Limit 경고',
    enabled: true,
    thresholdSteps: [
      { threshold: '80%', channels: ['in-app'], target: 'platform' },
      { threshold: '95%', channels: ['email', 'in-app'], target: 'all' },
      { threshold: '100%', channels: ['in-app', 'email'], target: 'all', action: '429 거부' },
    ],
  },
  {
    id: 'ar3',
    name: '비용 초과 경고',
    enabled: true,
    thresholdSteps: [
      { threshold: '기본료 100%', channels: ['email'], target: 'tenant' },
      { threshold: '150%', channels: ['email', 'in-app'], target: 'all' },
      { threshold: '200%', channels: ['email', 'in-app'], target: 'all', action: '자동 승인 요청' },
    ],
  },
  {
    id: 'ar4',
    name: '에러율 이상 감지',
    enabled: false,
    thresholdSteps: [
      { threshold: '5%+ (30분)', channels: ['in-app'], target: 'platform' },
      { threshold: '10%+', channels: ['email', 'in-app', 'slack'], target: 'all' },
    ],
  },
  {
    id: 'ar5',
    name: '비활성 테넌트 감지',
    enabled: false,
    thresholdSteps: [
      { threshold: '7일 미접속', channels: ['in-app'], target: 'platform' },
      { threshold: '30일 미접속', channels: ['email'], target: 'platform' },
      { threshold: '체험판 D-7', channels: ['email'], target: 'tenant' },
    ],
  },
];

export const MOCK_ALERT_HISTORY: AlertHistoryItem[] = [
  { id: 'ah1', tenantName: 'B Corp', message: '월간 토큰 100% 소진. 서비스 제한 적용.', severity: 'critical', timestamp: '오늘 11:05', channels: '이메일+인앱+Slack' },
  { id: 'ah2', tenantName: '현대자동차', message: '토큰 90% 도달 (450M / 500M).', severity: 'warning', timestamp: '오늘 08:30', channels: '이메일+인앱' },
  { id: 'ah3', tenantName: '현대자동차', message: '비용 기본료 114% 도달.', severity: 'warning', timestamp: '어제 22:15', channels: '이메일' },
  { id: 'ah4', tenantName: '스타트업 A', message: '체험판 D-12 만료 안내.', severity: 'info', timestamp: '어제 09:00', channels: '이메일 (자동)' },
];
