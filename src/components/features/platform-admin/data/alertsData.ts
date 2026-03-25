import type { AlertRule, AnomalyDetectionRule, AlertHistoryItem } from './platformAdminTypes';

// ---- Alert Rules (enhanced with AlertThreshold[] structure) ----
// Note: We extend the existing AlertRule interface by enriching thresholdSteps
export const MOCK_ENHANCED_ALERT_RULES: AlertRule[] = [
  {
    id: 'ar-001',
    name: '토큰 사용량 임계 알림',
    enabled: true,
    thresholdSteps: [
      { threshold: '50%', channels: ['in-app'], target: 'tenant', action: 'notify' },
      { threshold: '75%', channels: ['email', 'in-app'], target: 'tenant', action: 'notify' },
      { threshold: '100%', channels: ['email', 'in-app', 'slack'], target: 'all', action: 'throttle' },
    ],
  },
  {
    id: 'ar-002',
    name: 'API 호출 속도 제한 알림',
    enabled: true,
    thresholdSteps: [
      { threshold: '80%', channels: ['in-app'], target: 'tenant', action: 'notify' },
      { threshold: '100%', channels: ['email', 'slack'], target: 'all', action: 'block' },
    ],
  },
  {
    id: 'ar-003',
    name: '월간 비용 예산 초과',
    enabled: true,
    thresholdSteps: [
      { threshold: '70%', channels: ['email'], target: 'platform', action: 'notify' },
      { threshold: '90%', channels: ['email', 'slack'], target: 'all', action: 'notify' },
      { threshold: '100%', channels: ['email', 'slack', 'webhook'], target: 'all', action: 'throttle' },
    ],
  },
  {
    id: 'ar-004',
    name: '동시 세션 초과 알림',
    enabled: false,
    thresholdSteps: [
      { threshold: '90%', channels: ['in-app'], target: 'tenant', action: 'notify' },
      { threshold: '100%', channels: ['email', 'in-app'], target: 'all', action: 'block' },
    ],
  },
  {
    id: 'ar-005',
    name: '미결제 경고',
    enabled: true,
    thresholdSteps: [
      { threshold: 'D+7', channels: ['email'], target: 'tenant', action: 'notify' },
      { threshold: 'D+14', channels: ['email', 'in-app'], target: 'all', action: 'throttle' },
      { threshold: 'D+30', channels: ['email', 'slack'], target: 'platform', action: 'block' },
    ],
  },
];

// ---- Anomaly Detection Rules ----
export const MOCK_ANOMALY_RULES: AnomalyDetectionRule[] = [
  {
    id: 'ad-001',
    name: '비용 급증 감지',
    metricType: 'cost_spike',
    sensitivity: 'medium',
    baselineWindowDays: 7,
    enabled: true,
  },
  {
    id: 'ad-002',
    name: '에러율 스파이크 감지',
    metricType: 'error_rate',
    sensitivity: 'high',
    baselineWindowDays: 3,
    enabled: true,
  },
  {
    id: 'ad-003',
    name: '레이턴시 이상 감지',
    metricType: 'latency',
    sensitivity: 'low',
    baselineWindowDays: 14,
    enabled: false,
  },
  {
    id: 'ad-004',
    name: 'API 호출 폭증 감지',
    metricType: 'api_call',
    sensitivity: 'medium',
    baselineWindowDays: 7,
    enabled: true,
  },
];

// ---- Alert History (re-export from existing for Alerts tab) ----
export const MOCK_ALERT_HISTORY_EXTENDED: AlertHistoryItem[] = [
  { id: 'ah-001', tenantName: '삼성전자', message: '토큰 한도 95% 도달 — 자동 경고 발송', severity: 'warning', timestamp: '2026-03-18 08:42', channels: 'email, in-app' },
  { id: 'ah-002', tenantName: '현대자동차', message: '월간 비용 ₩10,660,000 초과 (예산 82%)', severity: 'warning', timestamp: '2026-03-18 07:15', channels: 'email, slack' },
  { id: 'ah-003', tenantName: '스타트업 A', message: 'API 에러율 12.4% 급등 — 이상 감지 트리거', severity: 'critical', timestamp: '2026-03-17 23:08', channels: 'email, slack, in-app' },
  { id: 'ah-004', tenantName: 'D 그룹', message: '동시 세션 100% 도달 — API 호출 차단', severity: 'critical', timestamp: '2026-03-17 21:33', channels: 'email, in-app' },
  { id: 'ah-005', tenantName: 'E 코퍼레이션', message: '미결제 D+7 경고 발송', severity: 'info', timestamp: '2026-03-17 09:00', channels: 'email' },
  { id: 'ah-006', tenantName: '삼성전자', message: '비용 급증 이상 감지 — 전일 대비 234% 증가', severity: 'critical', timestamp: '2026-03-16 14:22', channels: 'email, slack, webhook' },
  { id: 'ah-007', tenantName: '현대자동차', message: '토큰 한도 75% 도달', severity: 'info', timestamp: '2026-03-15 11:40', channels: 'in-app' },
  { id: 'ah-008', tenantName: 'F 테크', message: 'API 호출 속도 제한 80% 도달', severity: 'warning', timestamp: '2026-03-14 16:55', channels: 'in-app' },
];
