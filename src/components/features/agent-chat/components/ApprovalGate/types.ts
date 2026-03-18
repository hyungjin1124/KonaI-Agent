/** Action types for approval classification */
export type ActionType = 'create' | 'modify' | 'delete' | 'execute' | 'custom';

/** Risk levels controlling UI rendering tier */
export type RiskLevel = 'low' | 'medium' | 'high';

/** Individual approval item in multi-item mode */
export interface ApprovalItem {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  metadata?: Record<string, unknown>;
}

/** Result returned from approval decision */
export interface ApprovalGateResult {
  decision: 'approved' | 'rejected' | 'modify';
  approvedItemIds?: string[];
  rejectedItemIds?: string[];
  reason?: string;
  schemaData?: Record<string, unknown>;
  /** AI SDK tool call ID (present when used via needsApproval adapter) */
  toolCallId?: string;
}

/**
 * MCP Elicitation-compatible JSON Schema subset.
 * Flat object with primitive types only (string, number, boolean).
 */
export interface ElicitationSchema {
  type: 'object';
  properties: Record<
    string,
    {
      type: 'string' | 'number' | 'boolean';
      title?: string;
      description?: string;
      default?: string | number | boolean;
      enum?: (string | number)[];
    }
  >;
  required?: string[];
}

/** Props for the main ApprovalGate component */
export interface ApprovalGateProps {
  /** Action classification (create, modify, delete, execute, custom) */
  actionType: ActionType;
  /** Risk level controlling the UI tier (low=toast, medium=inline, high=modal) */
  riskLevel: RiskLevel;
  /** Title displayed in the approval UI */
  title: string;
  /** Optional description with additional context */
  description?: string;

  /** Called when user approves */
  onApprove: (result: ApprovalGateResult) => void;
  /** Called when user rejects */
  onReject: (result: ApprovalGateResult) => void;
  /** Called when user requests modification (optional) */
  onModify?: (result: ApprovalGateResult) => void;
  /** Called when the gate is dismissed without decision */
  onClose?: () => void;

  /** Items for multi-item approval mode (AC4) */
  items?: ApprovalItem[];

  /** MCP Elicitation-compatible JSON Schema for structured input (AC3) */
  schema?: ElicitationSchema;

  /** Show "Allow for this session" checkbox (AC6) */
  showSessionPermission?: boolean;
  /** Callback when session permission changes */
  onSessionPermissionChange?: (actionType: ActionType, allowed: boolean) => void;

  /** AI SDK tool call ID for needsApproval integration */
  toolCallId?: string;

  /** Custom button labels */
  approveLabel?: string;
  rejectLabel?: string;
  modifyLabel?: string;
}

// ─── AI SDK needsApproval 호환 타입 ─────────────────────────

/** AI SDK tool approval 상태 (needsApproval 패턴) */
export type ToolApprovalStatus =
  | 'approval-requested'
  | 'approval-responded'
  | 'output-available'
  | 'output-denied';

/** AI SDK의 도구 호출 정보 (approval 대기 중) */
export interface ToolApprovalRequest {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  status: ToolApprovalStatus;
}

/** addToolApprovalResponse 호출 형태 */
export interface ToolApprovalResponse {
  id: string;
  approved: boolean;
}

/** 도구명 → risk/action 매핑 설정 */
export interface ToolRiskMapping {
  riskLevel: RiskLevel;
  actionType: ActionType;
}

/** useApprovalGateAdapter가 변환한 개별 pending approval */
export interface PendingApproval {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  riskLevel: RiskLevel;
  actionType: ActionType;
}

/** useApprovalGateAdapter 반환 타입 */
export interface ApprovalGateAdapterResult {
  pendingApprovals: PendingApproval[];
  approveToolCall: (toolCallId: string) => void;
  rejectToolCall: (toolCallId: string) => void;
  hasPendingApprovals: boolean;
}

/** 조건부 승인 함수 생성 설정 */
export interface ApprovalConditionConfig {
  actionType: ActionType;
  riskLevel: RiskLevel;
  autoApproveRoles?: string[];
}

/** Session Permission 관리 인터페이스 */
export interface SessionPermissionStore {
  isAutoApproved: (actionType: ActionType) => boolean;
  setAutoApproved: (actionType: ActionType, allowed: boolean) => void;
  clear: () => void;
}

/** Props shared by the tier-specific sub-components */
export interface ApprovalTierProps {
  title: string;
  description?: string;
  onApprove: () => void;
  onReject: () => void;
  onModify?: () => void;
  onClose?: () => void;
  approveLabel: string;
  rejectLabel: string;
  modifyLabel?: string;

  /** Rendered content (items list, schema form, etc.) */
  children?: React.ReactNode;

  /** Session permission UI */
  sessionPermissionCheckbox?: React.ReactNode;
}
