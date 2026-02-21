# Select: Approval / Rejection

- **ID**: approval_rejection
- **Status**: partial
- **Priority**: critical
- **Complexity**: moderate
- **Contexts**: [chat_view, agent_scenario]
- **Dependencies**: 없음
- **Obsidian Sources**:
  - Insights/agent-ui/patterns/approval-gate-component.md
  - Insights/agent-ui/patterns/risk-based-rendering.md
- **Existing Source Files**:
  - src/hooks/useSlideOutlineHITL.ts
  - src/hooks/usePPTScenario.ts
  - src/hooks/useScenarioOrchestration.ts

## Notes

현재 PPT 시나리오 훅에 결합된 HITL 로직을 범용 ApprovalGate 컴포넌트로 분리.
MCP Elicitation 호환 + async HITL 설계 반영 (2026-02-21 리서치 갱신).
