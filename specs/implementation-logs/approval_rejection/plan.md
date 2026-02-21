# Plan: Approval / Rejection (ApprovalGate)

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `src/components/features/agent-chat/components/ApprovalGate/types.ts` | ApprovalGate 전용 타입 정의 | 신규 |
| `src/components/features/agent-chat/components/ApprovalGate/ApprovalGate.tsx` | 메인 컴포넌트 (riskLevel 기반 3-tier 렌더링 오케스트레이터) | 신규 |
| `src/components/features/agent-chat/components/ApprovalGate/ApprovalInlineCard.tsx` | medium-risk: 인라인 카드 UI | 신규 |
| `src/components/features/agent-chat/components/ApprovalGate/ApprovalModal.tsx` | high-risk: 모달 다이얼로그 UI | 신규 |
| `src/components/features/agent-chat/components/ApprovalGate/ApprovalToast.tsx` | low-risk: 토스트 알림 UI | 신규 |
| `src/components/features/agent-chat/components/ApprovalGate/ApprovalItemRow.tsx` | 다중 항목 승인 시 개별 항목 행 | 신규 |
| `src/components/features/agent-chat/components/ApprovalGate/index.ts` | Barrel export | 신규 |
| `src/components/features/agent-chat/components/ApprovalGate/ApprovalGate.test.tsx` | 단위 테스트 | 신규 |

## Props Interface

```typescript
// === Core Types ===

type ActionType = 'create' | 'modify' | 'delete' | 'execute' | 'custom';
type RiskLevel = 'low' | 'medium' | 'high';

interface ApprovalItem {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  metadata?: Record<string, unknown>;
}

interface ApprovalGateResult {
  decision: 'approved' | 'rejected' | 'modify';
  approvedItemIds?: string[];
  rejectedItemIds?: string[];
  reason?: string;
  schemaData?: Record<string, unknown>; // MCP Elicitation form data
}

// === Main Component Props ===

interface ApprovalGateProps {
  // Core
  actionType: ActionType;
  riskLevel: RiskLevel;
  title: string;
  description?: string;

  // Handlers
  onApprove: (result: ApprovalGateResult) => void;
  onReject: (result: ApprovalGateResult) => void;
  onModify?: (result: ApprovalGateResult) => void;
  onClose?: () => void;

  // Multi-item support (AC4)
  items?: ApprovalItem[];

  // MCP Elicitation schema (AC3)
  schema?: Record<string, unknown>; // JSON Schema subset

  // Session permission (AC6)
  showSessionPermission?: boolean;
  onSessionPermissionChange?: (actionType: ActionType, allowed: boolean) => void;

  // Customization
  approveLabel?: string;
  rejectLabel?: string;
  modifyLabel?: string;
}
```

## 상태 설계

### ApprovalGate 내부 state
- `itemStatuses: Map<string, 'pending' | 'approved' | 'rejected'>` — 개별 항목 상태
- `reason: string` — 거절/수정 사유
- `schemaFormData: Record<string, unknown>` — MCP elicitation 폼 데이터
- `sessionPermission: boolean` — "이 세션에서 자동 승인" 체크

### 외부 연동
- AgentChatView의 `activeHitl` state → ApprovalGate 표시/숨김
- `hitlResumeCallback` → approve/reject 시 시나리오 재개

## 통합 지점

### 1. AgentChatView에서의 사용
기존 HITLFloatingPanel과 동일한 패턴으로 통합. `activeHitl.toolType`이 ApprovalGate 관련 타입일 때 ApprovalGate를 렌더링.

```
activeHitl.toolType === 'slide_outline_review' → ApprovalGate (medium-risk, items mode)
activeHitl.toolType === 'data_validation' → ApprovalGate (medium-risk)
Future: 'approval_gate' toolType → 범용 ApprovalGate
```

### 2. 독립 사용 (Phase 1 범위)
ApprovalGate는 독립 컴포넌트로도 사용 가능. PPT 시나리오 외에도 아무 곳에서나 import하여 riskLevel + actionType만 전달하면 동작.

### 3. 기존 코드 영향 최소화
Phase 1에서는 기존 HITLFloatingPanel이나 usePPTScenario를 수정하지 않음. ApprovalGate는 새로운 독립 컴포넌트로 추가하고, AgentChatView에서 조건부로 사용.

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| AC1 | Generic ApprovalGate — actionType, riskLevel, handlers 수용 | `ApprovalGate.tsx` Props interface |
| AC2 | riskLevel별 3가지 UI 변형 (toast/inline/modal), #FF3C42 accent | `ApprovalToast.tsx`, `ApprovalInlineCard.tsx`, `ApprovalModal.tsx` |
| AC3 | schema prop → JSON Schema 자동 폼 렌더링 | `ApprovalInlineCard.tsx` + `ApprovalModal.tsx` 내 SchemaForm 렌더링 |
| AC4 | items prop → 다중 항목 개별 승인/거부 | `ApprovalItemRow.tsx` + items 모드 렌더링 |
| AC5 | Orchestration ScenarioStep.approvalGate 연동 가능 | ApprovalGate를 AgentChatView에서 조건부 렌더링 |
| AC6 | Session Permission: "Allow for Session" → 자동 승인 | `showSessionPermission` prop + checkbox UI |
| AC7 | 접근성: Modal=alertdialog+focus trap, Inline=alert+aria-live | Radix Dialog role 속성 활용 |
| AC8 | 키보드: Enter=approve, Escape=reject, Tab=항목 이동 | onKeyDown handler 구현 |

## 렌더링 로직 상세

```
if (riskLevel === 'low')    → ApprovalToast: 하단 토스트, 5초 auto-dismiss, "취소" 버튼
if (riskLevel === 'medium') → ApprovalInlineCard: 채팅 내 인라인 카드, border-left #FF3C42
if (riskLevel === 'high')   → ApprovalModal: Radix Dialog 모달, focus trap, #FF3C42 CTA
```

items가 있으면 ApprovalItemRow를 리스트로 렌더링 (inline/modal 내부에서).
schema가 있으면 JSON Schema 기반 폼 필드를 자동 생성.
