import type {
  ActionType,
  RiskLevel,
  ApprovalConditionConfig,
  SessionPermissionStore,
} from './types';

/**
 * AI SDK needsApproval 조건부 승인 함수 팩토리.
 *
 * needsApproval: createApprovalCondition({ actionType, riskLevel, autoApproveRoles })
 *
 * 반환되는 async 함수는 도구 입력(args)을 받아 승인 필요 여부를 결정한다.
 * true = 승인 필요, false = 자동 승인 (게이트 스킵)
 */

/** Risk level별 기본 승인 정책 */
const RISK_REQUIRES_APPROVAL: Record<RiskLevel, boolean> = {
  low: false,
  medium: true,
  high: true,
};

/**
 * 조건부 승인 함수 생성.
 * AI SDK `needsApproval` 속성에 직접 할당 가능한 async 함수를 반환한다.
 *
 * @example
 * ```ts
 * tool({
 *   description: 'Delete file',
 *   needsApproval: createApprovalCondition({
 *     actionType: 'delete',
 *     riskLevel: 'high',
 *     autoApproveRoles: ['admin'],
 *   }),
 *   execute: async (args) => { ... },
 * })
 * ```
 */
export function createApprovalCondition(
  config: ApprovalConditionConfig,
  options?: {
    userRole?: string;
    sessionStore?: SessionPermissionStore;
  },
): (args: Record<string, unknown>) => Promise<boolean> {
  const { riskLevel, actionType, autoApproveRoles } = config;
  const { userRole, sessionStore } = options ?? {};

  return async (_args: Record<string, unknown>): Promise<boolean> => {
    // 1. Session permission: 사용자가 "이 세션에서 자동 승인" 체크한 경우 스킵
    if (sessionStore?.isAutoApproved(actionType)) {
      return false;
    }

    // 2. RBAC: 사용자 역할이 autoApproveRoles에 포함되면 스킵
    if (userRole && autoApproveRoles?.includes(userRole)) {
      return false;
    }

    // 3. Risk level 기반 기본 정책
    return RISK_REQUIRES_APPROVAL[riskLevel];
  };
}

/**
 * RBAC 기반 조건부 승인 함수 — createApprovalCondition의 편의 래퍼.
 *
 * @example
 * ```ts
 * needsApproval: createRBACCondition('viewer', {
 *   actionType: 'execute',
 *   riskLevel: 'medium',
 *   autoApproveRoles: ['admin', 'operator'],
 * })
 * ```
 */
export function createRBACCondition(
  userRole: string,
  config: ApprovalConditionConfig,
  sessionStore?: SessionPermissionStore,
): (args: Record<string, unknown>) => Promise<boolean> {
  return createApprovalCondition(config, { userRole, sessionStore });
}

/**
 * In-memory Session Permission 저장소 생성.
 * "이 세션에서 동일 작업 자동 승인" 체크 시 사용.
 */
export function createSessionPermissionStore(): SessionPermissionStore {
  const permissions = new Map<ActionType, boolean>();

  return {
    isAutoApproved(actionType: ActionType): boolean {
      return permissions.get(actionType) === true;
    },
    setAutoApproved(actionType: ActionType, allowed: boolean): void {
      if (allowed) {
        permissions.set(actionType, true);
      } else {
        permissions.delete(actionType);
      }
    },
    clear(): void {
      permissions.clear();
    },
  };
}
