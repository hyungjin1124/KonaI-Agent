// ── 사용자 관리 타입 ────────────────────────────────────────────────────────

export type SimpleUserRole = '일반' | '관리자';
export type SimpleUserStatus = '활성' | '비활성';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  team: string;
  role: SimpleUserRole;
  status: SimpleUserStatus;
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
  errorType: AgentErrorType;
  failedStep: string;
  summary: string;
  conversationId: string;
}

// ── 비용/사용량 ───────────────────────────────────────────────────────────

export interface CostUsageKPI {
  monthCost: { value: string; change: string };
  totalTokens: { value: string };
  avgDailyCost: { value: string };
}

export interface DailyTokenCostData {
  date: string;
  claude: number;
  gpt4o: number;
  other: number;
  cumulativeCost: number;
}

export interface ModelCostRatio {
  model: string;
  percentage: number;
  amount: string;
  color: string;
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
  returnRate: { value: string };
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
