// ============================================================================
// Platform Administration Types
// ============================================================================

// --- Tenant ---
export type TenantPlan = 'Enterprise' | 'Business' | 'Starter';
export type TenantStatus = 'Active' | 'Trial' | 'Suspended' | 'Inactive';
export type HealthLevel = 'healthy' | 'warning' | 'danger';

export interface TenantHealthMetrics {
  errorRate: number;
  responseTimeSec: number;
  tokenLimitUsage: number;
  lastActivityAgo: string;
  lastActivityMinutes: number;
  paymentStatus: 'paid' | 'unpaid' | 'trial';
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  status: 'Active' | 'Revoked';
  createdAt: string;
  lastUsed?: string;
  scope?: string;
  expiresAt?: string;
}

export interface ResourceLimits {
  rateLimitPerMin: number;
  tokenLimitPerMonth: string;
  maxConcurrentSessions: number;
  maxUsers: number;
  fileStorageGb: number;
  dataRetentionMonths: number;
}

export interface SuspendedDataPolicy {
  canViewDashboard: boolean;
  canExportData: boolean;
  canAccessApi: boolean;
  retentionDays: number;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  industry?: TenantIndustry;
  plan: TenantPlan;
  status: TenantStatus;
  healthScore: number;
  healthLevel: HealthLevel;
  metrics: TenantHealthMetrics;
  contact: { name: string; email: string; phone: string };
  contractPeriod: { start: string; end: string };
  memo?: string;
  apiKeys: ApiKey[];
  resourceLimits: ResourceLimits;
  tags: string[];
  suspendedDataPolicy?: SuspendedDataPolicy;
}

// --- Usage & Alerts ---
export interface UsageSummary {
  totalApiCalls: { value: string; change: string };
  totalTokens: { value: string };
  activeSessions: { value: string };
  thresholdExceeded: { value: string };
}

export interface TenantUsageRow {
  tenantId: string;
  tenantName: string;
  apiCalls: string;
  tokens: string;
  agentRuns: string;
  limitPercent: number;
  alertStatus: string;
  alertLevel: 'normal' | 'warning' | 'danger';
}

export interface DailyApiCallData {
  date: string;
  [tenantName: string]: number | string;
}

export interface TokenConsumptionData {
  date: string;
  inputTokens: number;
  outputTokens: number;
}

export type AlertChannel = 'email' | 'in-app' | 'slack' | 'webhook';

export interface AlertThresholdStep {
  threshold: string;
  channels: AlertChannel[];
  target: 'tenant' | 'platform' | 'all';
  action?: string;
  webhookUrl?: string;
}

export type AlertMetric = 'error_rate' | 'response_time' | 'token_usage' | 'cost' | 'custom';

export interface AlertRule {
  id: string;
  name: string;
  metric?: AlertMetric;
  enabled: boolean;
  thresholdSteps: AlertThresholdStep[];
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface AlertHistoryItem {
  id: string;
  tenantName: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  channels: string;
}

// --- Billing ---
export interface BillingSummary {
  monthlyRevenue: { value: string; change: string };
  outstanding: { value: string };
  paidCount: { value: string };
  unpaidCount: { value: string };
}

export interface TenantBillingRow {
  tenantId: string;
  tenantName: string;
  plan: TenantPlan;
  baseFee: string;
  overage: string;
  total: string;
  paymentStatus: 'paid' | 'unpaid' | 'trial';
}

export interface MonthlyRevenueData {
  month: string;
  enterprise: number;
  business: number;
  starter: number;
}

export interface PlanDistributionData {
  name: string;
  value: number;
  color: string;
}

// --- Platform Audit Log ---
export type PlatformEventType = 'api_key' | 'tenant_config' | 'user_permission' | 'auth_login' | 'billing';
export type PlatformSeverity = 'Critical' | 'Warning' | 'Info';

export interface PlatformAuditEvent {
  id: string;
  timestamp: string;
  eventType: PlatformEventType;
  severity: PlatformSeverity;
  action: string;
  description: string;
  actor: string;
  ip: string;
  tenantName?: string;
  detail: string;
}

export interface PlatformAuditSummary {
  todayEvents: { value: string };
  weeklyWarnings: { value: string };
  activeTenants: { value: string };
  lastExport: { value: string; subtitle: string };
}

export type PlatformAuditViewMode = 'timeline' | 'table';

// --- Tenant Create ---
export type TenantIndustry = 'finance' | 'manufacturing' | 'healthcare' | 'retail' | 'education' | 'other';

export interface TenantCreateInput {
  // Step 1
  name: string;
  domain: string;
  industry: TenantIndustry;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  // Step 2
  plan: TenantPlan;
  contractStart: string;
  contractEnd: string;
  // Step 3
  adminEmail: string;
  useInviteLink: boolean;
  enableSso: boolean;
  // Step 4
  tags: string[];
  memo: string;
  deployDemoAgent: boolean;
}

// --- Activity Monitoring ---
export type TraceStatus = 'success' | 'failure' | 'timeout';

export interface TraceStep {
  id: string;
  name: string;
  type: 'llm' | 'tool' | 'retrieval' | 'output';
  startMs: number;
  durationMs: number;
  status: TraceStatus;
  model?: string;
  tokenCount?: number;
}

export interface AgentTrace {
  traceId: string;
  agentName: string;
  tenantName: string;
  status: TraceStatus;
  startedAt: string;
  durationMs: number;
  ttftMs: number;
  tokenCount: number;
  cost: number;
  steps: TraceStep[];
}

export interface AgentPerformanceMetrics {
  avgTtftMs: number;
  p50TtftMs: number;
  p95TtftMs: number;
  p99TtftMs: number;
  avgLatencyMs: number;
  successRate: number;
  totalTraces: number;
}

export interface SkillUsageStat {
  skillId: string;
  skillName: string;
  category: string;
  callCount: number;
  avgLatencyMs: number;
  successRate: number;
  avgCost: number;
}

// --- Cost Management ---
export interface ModelCostBreakdown {
  modelName: string;
  cost: number;
  tokenCount: number;
  percentage: number;
  color: string;
}

export interface DailyCostData {
  date: string;
  [modelName: string]: number | string;
}

export interface CostForecastData {
  date: string;
  actualCost?: number;
  forecastedCost?: number;
  budget: number;
}

export interface CostSummary {
  totalCost: { value: string; change: string };
  efficiency: { value: string; subtitle: string };
  budgetUsage: { value: string; percent: number };
  forecast: { value: string; isOverBudget: boolean };
}

// --- Alerts ---
export type AlertAction = 'notify' | 'throttle' | 'block';

export interface AlertThreshold {
  percent: number;
  channels: AlertChannel[];
  action: AlertAction;
  webhookUrl?: string;
}

export interface AnomalyDetectionRule {
  id: string;
  name: string;
  metricType: 'cost_spike' | 'error_rate' | 'latency' | 'api_call';
  sensitivity: 'low' | 'medium' | 'high';
  baselineWindowDays: number;
  enabled: boolean;
}

// --- Conversations ---
export type ConversationStatus = 'active' | 'completed' | 'abandoned';

export interface ConversationSummary {
  conversationId: string;
  tenantId: string;
  tenantName: string;
  userId: string;
  userName: string;
  agentName: string;
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
  status: ConversationStatus;
  avgResponseTimeSec: number;
  tokenCount: number;
  topic?: string;
  satisfactionScore?: number;
}

export interface ConversationKPI {
  activeConversations: number;
  totalToday: number;
  avgMessagesPerConversation: number;
  avgResponseTimeSec: number;
  completionRate: number;
}

// --- Errors ---
export type ErrorCategory = 'timeout' | 'validation' | 'permission' | 'rate_limit'
  | 'model_error' | 'internal' | 'network' | 'unknown';

export type ErrorSeverity = 'critical' | 'warning' | 'info';

export interface PlatformError {
  errorId: string;
  tenantId: string;
  tenantName: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  endpoint: string;
  model?: string;
  occurredAt: string;
  userId?: string;
  conversationId?: string;
  stackTrace?: string;
  resolved: boolean;
}

export interface ErrorKPI {
  totalErrors24h: number;
  criticalCount: number;
  topCategory: ErrorCategory;
  errorRateTrend: 'increasing' | 'stable' | 'decreasing';
  affectedTenants: number;
}

export interface ErrorRateTimeSeries {
  timestamp: string;
  total: number;
  byCategory: Partial<Record<ErrorCategory, number>>;
}

// --- Feedback ---
export type FeedbackType = 'positive' | 'negative' | 'neutral';
export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface PlatformFeedbackItem {
  feedbackId: string;
  tenantId: string;
  tenantName: string;
  userId: string;
  userName: string;
  conversationId: string;
  type: FeedbackType;
  rating?: number;
  comment: string;
  category?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: FeedbackStatus;
  createdAt: string;
  respondedAt?: string;
  responseNote?: string;
}

export interface FeedbackKPI {
  totalFeedback30d: number;
  avgRating: number;
  positiveRate: number;
  pendingCount: number;
  topIssueCategory: string;
}
