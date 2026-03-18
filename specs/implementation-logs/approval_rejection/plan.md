# Plan: Approval / Rejection — AI SDK needsApproval Update

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `src/components/features/agent-chat/components/ApprovalGate/types.ts` | AI SDK 호환 타입 추가 | 수정 |
| `src/components/features/agent-chat/components/ApprovalGate/useApprovalGateAdapter.ts` | AI SDK `approval-requested` → ApprovalGate props 변환 훅 | 신규 |
| `src/components/features/agent-chat/components/ApprovalGate/approvalConditions.ts` | 조건부 승인 팩토리 + Session Permission 관리 | 신규 |
| `src/components/features/agent-chat/components/ApprovalGate/ApprovalGate.tsx` | `toolCallId` prop 추가, 결과에 toolCallId 포함 | 수정 |
| `src/components/features/agent-chat/components/ApprovalGate/index.ts` | 새 모듈 export 추가 | 수정 |
| `src/components/features/agent-chat/components/ApprovalGate/useApprovalGateAdapter.test.ts` | 어댑터 훅 테스트 | 신규 |
| `src/components/features/agent-chat/components/ApprovalGate/approvalConditions.test.ts` | 조건부 승인 팩토리 테스트 | 신규 |

## 핵심 인터페이스

### AI SDK 호환 타입 (types.ts 추가)

```typescript
/** AI SDK tool approval 상태 (needsApproval 패턴) */
type ToolApprovalStatus = 'approval-requested' | 'approval-responded' | 'output-available' | 'output-denied';

/** AI SDK의 도구 호출 정보 (approval 대기 중) */
interface ToolApprovalRequest {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  status: ToolApprovalStatus;
}

/** addToolApprovalResponse 호출 형태 */
interface ToolApprovalResponse {
  id: string;
  approved: boolean;
}

/** useApprovalGateAdapter 반환 타입 */
interface ApprovalGateAdapterResult {
  /** 승인 대기 중인 도구 호출 목록 → ApprovalGate에 전달할 props */
  pendingApprovals: Array<{
    toolCallId: string;
    toolName: string;
    args: Record<string, unknown>;
    riskLevel: RiskLevel;
    actionType: ActionType;
  }>;
  /** 개별 도구 호출 승인 */
  approveToolCall: (toolCallId: string) => void;
  /** 개별 도구 호출 거절 */
  rejectToolCall: (toolCallId: string) => void;
  /** 대기 중 여부 */
  hasPendingApprovals: boolean;
}
```

### createApprovalCondition (approvalConditions.ts)

```typescript
/** 조건부 승인 함수 생성을 위한 설정 */
interface ApprovalConditionConfig {
  actionType: ActionType;
  riskLevel: RiskLevel;
  /** 자동 승인 허용 역할 목록 */
  autoApproveRoles?: string[];
}

/** Session Permission 관리 */
interface SessionPermissionStore {
  isAutoApproved: (actionType: ActionType) => boolean;
  setAutoApproved: (actionType: ActionType, allowed: boolean) => void;
  clear: () => void;
}
```

## 상태 설계

### useApprovalGateAdapter
- 입력: AI SDK `useChat`의 messages에서 `approval-requested` 상태 도구 호출 추출
- 입력: `toolRiskMapping: Record<string, { riskLevel, actionType }>` — 도구명 → risk 매핑
- 출력: `ApprovalGateAdapterResult`
- 내부: `addToolApprovalResponse` 콜백을 래핑

### approvalConditions
- `createApprovalCondition(config)` → `async (args) => boolean` 형태의 needsApproval 함수
- `createSessionPermissionStore()` → in-memory Map 기반 세션 허가 관리
- `createRBACCondition(userRole, config)` → 역할 기반 조건부 승인

## 통합 지점

1. **ApprovalGate 자체**: `toolCallId` prop 추가 (선택적). 결과 객체에 포함.
2. **어댑터 훅 사용 패턴**: AI SDK `useChat` 사용 시 → `useApprovalGateAdapter` → ApprovalGate
3. **기존 코드 무영향**: 기존 사용처에서 `toolCallId` 미전달 시 기존 동작 유지

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| AC1 | useApprovalGateAdapter: approval-requested → riskLevel/actionType 매핑 | useApprovalGateAdapter.ts |
| AC2 | onApprove/onReject → addToolApprovalResponse({id, approved}) 호출 | useApprovalGateAdapter.ts: approveToolCall/rejectToolCall |
| AC3 | createApprovalCondition → needsApproval: async fn 형태 | approvalConditions.ts |
| AC4 | 기존 3-tier UI 유지 + #FF3C42 accent | 기존 코드 변경 없음 |
| AC5 | schema prop MCP Elicitation 호환 유지 | 기존 코드 변경 없음 |
| AC6 | items prop multi-item 유지 | 기존 코드 변경 없음 |
| AC7 | Session Permission → 조건부 승인 함수 자동 스킵 | approvalConditions.ts: SessionPermissionStore 통합 |
| AC8 | 접근성 유지 (alertdialog, alert, aria-live) | 기존 코드 변경 없음 |
| AC9 | 키보드 유지 (Enter/Escape/Tab) | 기존 코드 변경 없음 |

## 테스트 시나리오

| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | AC1 | approval-requested 상태 도구를 pendingApprovals에 포함 | renderHook + mock messages | must |
| 2 | AC1 | toolRiskMapping으로 riskLevel/actionType 매핑 | renderHook + assert | must |
| 3 | AC2 | approveToolCall → addToolApprovalResponse({approved: true}) | vi.fn() assert | must |
| 4 | AC2 | rejectToolCall → addToolApprovalResponse({approved: false}) | vi.fn() assert | must |
| 5 | AC3 | createApprovalCondition(low, admin) → false (자동 승인) | 순수 함수 테스트 | must |
| 6 | AC3 | createApprovalCondition(high, viewer) → true (승인 필요) | 순수 함수 테스트 | must |
| 7 | AC7 | SessionPermissionStore: set → isAutoApproved returns true | 순수 함수 테스트 | must |
| 8 | AC7 | session permission 스킵 시 createApprovalCondition → false | 순수 함수 + store 연동 | must |
| 9 | AC1 | approval-responded 상태 도구는 pendingApprovals에서 제외 | renderHook | should |
| 10 | AC3 | autoApproveRoles 미지정 시 항상 승인 필요 | 순수 함수 테스트 | should |
| 11 | AC7 | clear() 호출 시 모든 세션 허가 초기화 | 순수 함수 테스트 | should |
