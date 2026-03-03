# Select: Agent Self-Review / Auto-Validation

- **ID**: agent_self_review
- **Status**: not_implemented
- **Priority**: high
- **Complexity**: moderate
- **Contexts**: [chat_view, agent_scenario]
- **Dependencies**:
  - tool_call_display: **implemented** ✅
  - approval_rejection: **implemented** ✅
- **Obsidian Sources**: Insights/agent-ui/patterns/agent-self-review.md
- **Existing Source Files**: (없음 — 신규 구현)

## 선정 사유

- Review Decision 2026-02-27 Batch 1 승인 (APPROVE-1)
- GitHub Copilot, Cursor, Apple Xcode 3개 제품 동시 발표(Feb 26)로 패턴 성숙도 높음
- 기존 tool_call_display + approval_rejection 패턴 확장으로 구현 가능
- ROI: HIGH (moderate 복잡도 / high 사용자 가치)
- 모든 의존성 충족
