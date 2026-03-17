// ============================================================================
// Audit Log Mock Data
// ============================================================================
// Mock 데이터 레이어. 추후 API 교체 시 이 파일만 변경하면 됨.

// --- Types ---

export type ActorType = 'user' | 'agent' | 'system';
export type ActionCategory = 'data_access' | 'settings_change' | 'tool_call' | 'authentication';
export type Severity = 'info' | 'warning' | 'critical';
export type ActionResult = 'success' | 'failure' | 'partial';
export type TimeRange = '24h' | '7d' | '30d' | 'all';

export interface AuditLogActor {
  type: ActorType;
  name: string;
  id: string;
}

export interface AuditLogAction {
  type: string;
  category: ActionCategory;
  description: string;
}

export interface AuditLogResource {
  type: string;
  id: string;
  name: string;
}

export interface AuditLogResultInfo {
  status: ActionResult;
  details?: string;
}

export interface AuditLogChange {
  field: string;
  before: string;
  after: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: AuditLogActor;
  action: AuditLogAction;
  resource: AuditLogResource;
  result: AuditLogResultInfo;
  severity: Severity;
  sessionId?: string;
  reasoningSummary?: string;
  changes?: AuditLogChange[];
  metadata?: Record<string, string>;
}

// --- KPI Summary ---

export interface AuditKPISummary {
  totalEvents: { value: string; change: string; trend: 'up' | 'down' | 'neutral' };
  agentActions: { value: string; change: string; trend: 'up' | 'down' | 'neutral' };
  warnings: { value: string; change: string; trend: 'up' | 'down' | 'neutral' };
  recentActivity: { value: string; change: string; trend: 'up' | 'down' | 'neutral' };
}

export const AUDIT_KPI_SUMMARY: AuditKPISummary = {
  totalEvents: { value: '2,847', change: '+12.3%', trend: 'up' },
  agentActions: { value: '1,204', change: '+28.5%', trend: 'up' },
  warnings: { value: '23', change: '-15.0%', trend: 'down' },
  recentActivity: { value: '342', change: '+5.2%', trend: 'up' },
};

// --- Filter Options ---

export const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '24h', label: '최근 24시간' },
  { value: '7d', label: '최근 7일' },
  { value: '30d', label: '최근 30일' },
  { value: 'all', label: '전체' },
];

export const ACTOR_TYPE_OPTIONS: { value: ActorType | 'all'; label: string }[] = [
  { value: 'all', label: '전체 액터' },
  { value: 'user', label: '사용자' },
  { value: 'agent', label: '에이전트' },
  { value: 'system', label: '시스템' },
];

export const ACTION_CATEGORY_OPTIONS: { value: ActionCategory | 'all'; label: string }[] = [
  { value: 'all', label: '전체 액션' },
  { value: 'data_access', label: '데이터 접근' },
  { value: 'settings_change', label: '설정 변경' },
  { value: 'tool_call', label: '도구 호출' },
  { value: 'authentication', label: '인증' },
];

export const SEVERITY_OPTIONS: { value: Severity | 'all'; label: string }[] = [
  { value: 'all', label: '전체 심각도' },
  { value: 'info', label: '정보' },
  { value: 'warning', label: '경고' },
  { value: 'critical', label: '위험' },
];

// --- Mock Data (50+ entries) ---

const USERS = [
  { name: '홍길동', id: 'user-001' },
  { name: '김철수', id: 'user-002' },
  { name: '이영희', id: 'user-003' },
  { name: '박민수', id: 'user-004' },
  { name: '최지은', id: 'user-005' },
];

const AGENTS = [
  { name: 'KonaI 분석 에이전트', id: 'agent-001' },
  { name: 'KonaI 리포트 에이전트', id: 'agent-002' },
  { name: 'KonaI 데이터 에이전트', id: 'agent-003' },
  { name: 'KonaI PPT 에이전트', id: 'agent-004' },
];

function generateMockEntries(): AuditLogEntry[] {
  const entries: AuditLogEntry[] = [];
  const baseDate = new Date('2026-03-11T18:00:00');

  // --- Agent tool calls ---
  const agentToolCalls = [
    { action: 'SQL 쿼리 실행', resource: '매출 데이터베이스', reasoning: 'Q4 매출 분석 요청에 대해 sales_2025 테이블에서 월별 집계 쿼리를 실행했습니다.' },
    { action: '외부 API 호출', resource: 'CRM API', reasoning: '고객 이탈율 분석을 위해 CRM 시스템에서 최근 3개월 고객 데이터를 조회했습니다.' },
    { action: '파일 생성', resource: 'analysis_report.pptx', reasoning: '분기별 성과 리포트 생성 요청에 따라 PPT 파일을 자동 생성했습니다.' },
    { action: 'RAG 문서 검색', resource: '사내 정책 문서', reasoning: '휴가 정책 질문에 대해 HR 정책 문서 3건을 검색하여 답변을 구성했습니다.' },
    { action: '데이터 파이프라인 실행', resource: 'ETL 파이프라인', reasoning: '일일 데이터 동기화 스케줄에 따라 소스 DB에서 분석 DB로 데이터를 전송했습니다.' },
    { action: '차트 생성', resource: '대시보드 위젯', reasoning: '사용자가 요청한 매출 추이 시각화를 위해 라인 차트를 생성했습니다.' },
    { action: '이메일 초안 생성', resource: '이메일 시스템', reasoning: '월간 보고 이메일 초안을 요청받아 지난달 KPI 데이터를 기반으로 작성했습니다.' },
    { action: '슬랙 메시지 전송', resource: 'Slack #analytics', reasoning: '일일 리포트 자동 전송 설정에 따라 전일 대비 핵심 지표 변동을 공유했습니다.' },
  ];

  agentToolCalls.forEach((tc, i) => {
    const agent = AGENTS[i % AGENTS.length];
    const hourOffset = i * 2.5;
    entries.push({
      id: `log-tc-${String(i + 1).padStart(3, '0')}`,
      timestamp: new Date(baseDate.getTime() - hourOffset * 3600000).toISOString(),
      actor: { type: 'agent', name: agent.name, id: agent.id },
      action: { type: tc.action, category: 'tool_call', description: `${agent.name}이(가) ${tc.action}을 수행했습니다.` },
      resource: { type: 'tool', id: `tool-${i + 1}`, name: tc.resource },
      result: { status: i === 4 ? 'partial' : 'success', details: i === 4 ? '일부 레코드 전송 실패 (3/1000)' : undefined },
      severity: i === 4 ? 'warning' : 'info',
      sessionId: `sess-${String(Math.floor(i / 2) + 1).padStart(3, '0')}`,
      reasoningSummary: tc.reasoning,
    });
  });

  // --- Agent data access ---
  const agentDataAccess = [
    { resource: '고객 개인정보 DB', desc: '고객 분석을 위해 개인정보 테이블에 접근' },
    { resource: '재무 데이터', desc: '분기 보고서 생성을 위해 재무 데이터 조회' },
    { resource: '인사 기록', desc: 'HR 분석 요청에 따라 인사 기록 열람' },
    { resource: '계약 문서', desc: '계약 검토 에이전트가 계약서 접근' },
  ];

  agentDataAccess.forEach((da, i) => {
    const agent = AGENTS[i % AGENTS.length];
    const hourOffset = 20 + i * 4;
    const isPII = i === 0 || i === 2; // 고객 개인정보 DB, 인사 기록
    entries.push({
      id: `log-da-${String(i + 1).padStart(3, '0')}`,
      timestamp: new Date(baseDate.getTime() - hourOffset * 3600000).toISOString(),
      actor: { type: 'agent', name: agent.name, id: agent.id },
      action: { type: '데이터 조회', category: 'data_access', description: da.desc },
      resource: { type: 'database', id: `db-${i + 1}`, name: da.resource },
      result: { status: 'success' },
      severity: isPII ? 'warning' : 'info',
      sessionId: `sess-${String(i + 10).padStart(3, '0')}`,
      reasoningSummary: isPII ? '개인정보 포함 데이터에 접근했습니다. 데이터 마스킹이 적용되었습니다.' : undefined,
      metadata: isPII ? { privacy_level: 'PII', masking: 'applied' } : undefined,
    });
  });

  // --- User authentication events ---
  const authEvents = [
    { user: USERS[0], action: '로그인', success: true },
    { user: USERS[1], action: '로그인', success: true },
    { user: USERS[2], action: '로그인 실패', success: false },
    { user: USERS[2], action: '로그인 실패', success: false },
    { user: USERS[2], action: '로그인 실패', success: false },
    { user: USERS[3], action: '로그인', success: true },
    { user: USERS[4], action: '비밀번호 변경', success: true },
    { user: USERS[0], action: '로그아웃', success: true },
    { user: USERS[1], action: '2FA 인증', success: true },
    { user: USERS[3], action: 'API 키 생성', success: true },
  ];

  authEvents.forEach((ae, i) => {
    const hourOffset = 1 + i * 3;
    entries.push({
      id: `log-auth-${String(i + 1).padStart(3, '0')}`,
      timestamp: new Date(baseDate.getTime() - hourOffset * 3600000).toISOString(),
      actor: { type: 'user', name: ae.user.name, id: ae.user.id },
      action: { type: ae.action, category: 'authentication', description: `${ae.user.name}의 ${ae.action}` },
      resource: { type: 'auth', id: 'auth-system', name: '인증 시스템' },
      result: { status: ae.success ? 'success' : 'failure', details: ae.success ? undefined : '비밀번호 불일치' },
      severity: !ae.success && i >= 3 ? 'critical' : !ae.success ? 'warning' : 'info',
    });
  });

  // --- Settings changes ---
  const settingsChanges = [
    {
      user: USERS[0], desc: '에이전트 모델 변경', resource: 'KonaI 분석 에이전트',
      changes: [{ field: 'model', before: 'claude-3-haiku', after: 'claude-sonnet-4-6' }],
    },
    {
      user: USERS[0], desc: '사용량 알림 임계값 변경', resource: '알림 설정',
      changes: [{ field: 'token_alert_threshold', before: '100,000', after: '200,000' }],
    },
    {
      user: USERS[1], desc: '대시보드 위젯 추가', resource: '라이브보드',
      changes: [{ field: 'widget_count', before: '6', after: '8' }],
    },
    {
      user: USERS[0], desc: '사용자 역할 변경', resource: '이영희 계정',
      changes: [{ field: 'role', before: 'Viewer', after: 'Data Manager' }],
    },
    {
      user: USERS[0], desc: '데이터 보존 정책 수정', resource: '보안 설정',
      changes: [{ field: 'retention_days', before: '90', after: '180' }],
    },
    {
      user: USERS[1], desc: '에이전트 자율성 수준 조정', resource: 'KonaI 리포트 에이전트',
      changes: [{ field: 'autonomy_level', before: 'supervised', after: 'semi-autonomous' }],
    },
    {
      user: USERS[0], desc: '접근 권한 수정', resource: '권한 매트릭스',
      changes: [
        { field: 'data_management.canEdit', before: 'false', after: 'true' },
        { field: 'data_management.canDelete', before: 'false', after: 'true' },
      ],
    },
  ];

  settingsChanges.forEach((sc, i) => {
    const hourOffset = 5 + i * 6;
    entries.push({
      id: `log-sc-${String(i + 1).padStart(3, '0')}`,
      timestamp: new Date(baseDate.getTime() - hourOffset * 3600000).toISOString(),
      actor: { type: 'user', name: sc.user.name, id: sc.user.id },
      action: { type: sc.desc, category: 'settings_change', description: `${sc.user.name}이(가) ${sc.desc}을(를) 수행했습니다.` },
      resource: { type: 'settings', id: `settings-${i + 1}`, name: sc.resource },
      result: { status: 'success' },
      severity: i === 5 ? 'warning' : 'info',
      changes: sc.changes,
    });
  });

  // --- System events ---
  const systemEvents = [
    { action: '일일 백업 완료', resource: '백업 시스템', severity: 'info' as Severity },
    { action: '토큰 사용량 임계값 초과', resource: '모니터링', severity: 'warning' as Severity },
    { action: '에이전트 오류 감지', resource: 'KonaI 데이터 에이전트', severity: 'critical' as Severity },
    { action: '스케줄 작업 실행', resource: 'Cron 스케줄러', severity: 'info' as Severity },
    { action: '인증서 갱신', resource: 'SSL 인증서', severity: 'info' as Severity },
    { action: '데이터베이스 연결 풀 경고', resource: 'DB 커넥션 풀', severity: 'warning' as Severity },
    { action: '자동 스케일링 트리거', resource: '인프라', severity: 'info' as Severity },
    { action: '보안 스캔 완료', resource: '보안 시스템', severity: 'info' as Severity },
    { action: '미승인 접근 시도 차단', resource: '방화벽', severity: 'critical' as Severity },
    { action: '로그 아카이빙 완료', resource: '스토리지', severity: 'info' as Severity },
  ];

  systemEvents.forEach((se, i) => {
    const hourOffset = 2 + i * 7;
    entries.push({
      id: `log-sys-${String(i + 1).padStart(3, '0')}`,
      timestamp: new Date(baseDate.getTime() - hourOffset * 3600000).toISOString(),
      actor: { type: 'system', name: '시스템', id: 'system' },
      action: { type: se.action, category: 'data_access', description: se.action },
      resource: { type: 'system', id: `sys-${i + 1}`, name: se.resource },
      result: { status: se.severity === 'critical' ? 'failure' : 'success', details: se.severity === 'critical' ? '자동 복구 시도 중' : undefined },
      severity: se.severity,
    });
  });

  // --- Additional user data access events ---
  const userDataAccess = [
    { user: USERS[1], resource: '매출 리포트', desc: '월간 매출 리포트 다운로드' },
    { user: USERS[3], resource: '고객 목록', desc: '영업 고객 목록 조회' },
    { user: USERS[1], resource: '분석 대시보드', desc: '데이터 대시보드 접근' },
    { user: USERS[0], resource: '감사 로그', desc: '감사 로그 내보내기' },
    { user: USERS[4], resource: '비용 리포트', desc: '월간 비용 리포트 조회' },
    { user: USERS[3], resource: '파이프라인 설정', desc: '데이터 파이프라인 설정 조회' },
    { user: USERS[0], resource: '에이전트 성과', desc: '에이전트 성과 대시보드 조회' },
    { user: USERS[2], resource: '사내 문서', desc: '정책 문서 검색' },
    { user: USERS[1], resource: '토큰 사용 이력', desc: 'API 토큰 사용 이력 조회' },
    { user: USERS[4], resource: '팀 활동 로그', desc: '팀 활동 로그 조회' },
    { user: USERS[0], resource: '시스템 설정', desc: '시스템 설정 페이지 접근' },
  ];

  userDataAccess.forEach((uda, i) => {
    const hourOffset = 0.5 + i * 5;
    entries.push({
      id: `log-uda-${String(i + 1).padStart(3, '0')}`,
      timestamp: new Date(baseDate.getTime() - hourOffset * 3600000).toISOString(),
      actor: { type: 'user', name: uda.user.name, id: uda.user.id },
      action: { type: uda.desc, category: 'data_access', description: `${uda.user.name}이(가) ${uda.desc}을(를) 수행했습니다.` },
      resource: { type: 'data', id: `data-${i + 1}`, name: uda.resource },
      result: { status: 'success' },
      severity: 'info',
    });
  });

  // Sort by timestamp descending
  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return entries;
}

export const MOCK_AUDIT_LOG_ENTRIES = generateMockEntries();

// --- Filter helpers ---

export function filterByTimeRange(entries: AuditLogEntry[], range: TimeRange): AuditLogEntry[] {
  if (range === 'all') return entries;

  const now = new Date('2026-03-11T18:00:00');
  const hours = { '24h': 24, '7d': 168, '30d': 720 };
  const cutoff = new Date(now.getTime() - hours[range] * 3600000);

  return entries.filter(e => new Date(e.timestamp) >= cutoff);
}

export function filterEntries(
  entries: AuditLogEntry[],
  filters: {
    timeRange: TimeRange;
    actorType: ActorType | 'all';
    category: ActionCategory | 'all';
    severity: Severity | 'all';
    search: string;
    piiOnly?: boolean;
  }
): AuditLogEntry[] {
  let filtered = filterByTimeRange(entries, filters.timeRange);

  if (filters.actorType !== 'all') {
    filtered = filtered.filter(e => e.actor.type === filters.actorType);
  }

  if (filters.category !== 'all') {
    filtered = filtered.filter(e => e.action.category === filters.category);
  }

  if (filters.severity !== 'all') {
    filtered = filtered.filter(e => e.severity === filters.severity);
  }

  if (filters.piiOnly) {
    filtered = filtered.filter(e => e.metadata?.privacy_level === 'PII');
  }

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(e =>
      e.actor.name.toLowerCase().includes(q) ||
      e.action.type.toLowerCase().includes(q) ||
      e.action.description.toLowerCase().includes(q) ||
      e.resource.name.toLowerCase().includes(q)
    );
  }

  return filtered;
}
