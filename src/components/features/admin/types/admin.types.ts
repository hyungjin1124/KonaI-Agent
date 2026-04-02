// ── 사용자 관리 타입 ────────────────────────────────────────────────────────

export type SimpleUserRole = '일반' | '관리자';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  team: string;
  role: SimpleUserRole;
  status: '활성' | '비활성'; // ERP 동기화 데이터용, UI에서 미표시 (v6 설계)
  lastActivityDate: string; // yyyy.mm.dd
  avatarColor?: string;
}

// ── 멤버 디렉토리 타입 ─────────────────────────────────────────────────────

export interface DirectoryTeam {
  id: string;
  name: string;
  members: DirectoryMember[];
}

export interface DirectoryMember {
  id: string;
  name: string;
  email: string;
  team: string;
  alreadyAdded: boolean;
}

// ── 모니터링 공통 ──────────────────────────────────────────────────────────

export type MonitoringPeriod = '최근 7일' | '최근 30일' | '최근 90일';

// ── 에이전트 상태 ──────────────────────────────────────────────────────────

export interface AgentStatusKPI {
  successRate: { value: string; change: string };
  failureRate: { value: string; change: string };
  totalExecutions: { value: string; change: string };
}

export type AgentErrorType = 'Timeout' | 'Model Error' | 'Tool Error';

export interface AgentError {
  id: string;
  time: string;
  userName: string;
  userTeam: string;
  requestSummary: string; // 사용자 첫 메시지 요약 (최대 20자)
  errorType: AgentErrorType;
  failedStep: string;
  summary: string;
  errorMessage: string;
  model: string;
  skill: string | null;
  retryCount: string;
  conversationId: string;
  // 판단 가이드 (테이블 컬럼으로 표시)
  similarErrorCount: number; // 유사(24h): 최근 24시간 동일 에러 타입 건수
  affectedUserCount: number; // 영향: 동일 오류를 겪은 사용자 수
  estimatedCause: string;
}

// ── 비용/사용량 ───────────────────────────────────────────────────────────

export interface CostUsageKPI {
  monthCost: { value: string; change: string };
  totalTokens: { value: string };
  avgDailyCost: { value: string };
}

export interface DailyCostData {
  date: string;
  claude: number;
  gpt4o: number;
  other: number;
  // 툴팁용 토큰 수
  claudeTokens: number;
  gpt4oTokens: number;
  otherTokens: number;
}

// ── 대화 이력 ─────────────────────────────────────────────────────────────

export type ConversationStatus = '완료' | '오류';

export interface ConversationRecord {
  id: string;
  userName: string;
  team: string;
  date: string;
  summary: string;
  skill: string | null;
  model: string;
  status: ConversationStatus;
  turnCount: number;
  messages: ConversationMessage[];
  errorSummary?: ErrorSummary;
  langfuseTraceId?: string;
}

export interface ConversationMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  skillCall?: string;
}

export interface ErrorSummary {
  type: string;
  step: string;
  message: string;
}

// ── 활동 리포트 ───────────────────────────────────────────────────────────

export type ActivityLevel = '활발' | '보통' | '미사용';

export interface UserActivity {
  userName: string;
  team: string;
  lastActivityDate: string;
  weeklyConversations: number;
  activityLevel: ActivityLevel;
}

export interface SkillUsageRecord {
  skillName: string;
  callCount: number;
  userCount: number;
  author: string;
  authorTeam: string;
}

export interface ServiceMetrics {
  regularUsageRate: { value: string };
  artifactCount: { value: string };
  skillExecutions: { value: string };
}

export interface ArtifactDistribution {
  type: string;
  percentage: number;
  count: number;
  color: string;
}

export interface ActiveUserTrend {
  date: string;
  count: number;
}

// ── 그룹 관리 ─────────────────────────────────────────────────────────────

export type GroupType = 'ERP' | '자체';

export interface ERPGroupMember {
  userId: string;
  name: string;
  department: string;
  role: SimpleUserRole;
}

export interface GroupViewAccess {
  viewId: string;
  viewName: string;
  domain: string;
  secuValue: string;
  basis: string;
}

export interface ERPGroup {
  id: string;
  name: string;
  groupType: GroupType;
  memberCount: number;
  members: ERPGroupMember[];
  accessibleViewCount: number;
  viewAccess: GroupViewAccess[];
}

// ── 모델 설정 ─────────────────────────────────────────────────────────────

export type ApiKeyStatus = '정상' | '만료 임박' | '만료';

export interface ModelConfig {
  id: string;
  provider: string;
  modelName: string;
  apiKeyStatus: ApiKeyStatus;
  daysToExpiry?: number;
  isActive: boolean;
}
