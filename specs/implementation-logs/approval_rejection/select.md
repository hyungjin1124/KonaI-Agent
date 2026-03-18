# Select: Approval / Rejection (UPDATE)

- **ID**: approval_rejection
- **Status**: needs_update
- **Priority**: critical
- **Complexity**: moderate
- **Contexts**: [chat_view, agent_scenario]
- **Dependencies**: 없음 (모두 충족)
- **Obsidian Sources**:
  - Insights/agent-ui/patterns/approval-gate-component.md
  - Insights/agent-ui/patterns/risk-based-rendering.md
- **Existing Source Files**:
  - src/components/features/agent-chat/components/ApprovalGate/types.ts
  - src/components/features/agent-chat/components/ApprovalGate/ApprovalGate.tsx
  - src/components/features/agent-chat/components/ApprovalGate/ApprovalToast.tsx
  - src/components/features/agent-chat/components/ApprovalGate/ApprovalInlineCard.tsx
  - src/components/features/agent-chat/components/ApprovalGate/ApprovalModal.tsx
  - src/components/features/agent-chat/components/ApprovalGate/ApprovalItemRow.tsx
  - src/components/features/agent-chat/components/ApprovalGate/index.ts
  - src/components/features/agent-chat/components/ApprovalGate/ApprovalGate.test.tsx

## Update Scope

AI SDK 6 `needsApproval` 선언적 HITL 패턴 어댑터 레이어 추가.
기존 ApprovalGate 컴포넌트의 3-tier 렌더링은 그대로 유지하면서,
승인 플로우의 상태 관리를 AI SDK 호환 패턴으로 표준화.

Phase 1 범위:
- `useApprovalGateAdapter` 훅: AI SDK `approval-requested` 상태 → ApprovalGate props 변환
- `createApprovalCondition` 팩토리: RBAC 기반 조건부 승인 함수 생성
- Session Permission과 조건부 승인 함수 통합
- 기존 ApprovalGate에 `toolCallId` 옵션 추가
