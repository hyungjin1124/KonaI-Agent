# Select: Tool Call Display

- **ID**: tool_call_display
- **Status**: not_implemented
- **Priority**: critical
- **Complexity**: moderate
- **Contexts**: [chat_view, agent_scenario]
- **Dependencies**: 없음
- **Obsidian Sources**: Insights/agent-ui/patterns/tool-call-visualization.md
- **Existing Source Files**: 없음 (관련: src/components/features/agent-chat/components/ToolCall/constants.ts)
- **Last Researched**: 2026-02-23

## 선정 사유
- Review Decision 2026-02-22에서 Batch 1 즉시 실행으로 APPROVED
- priority: critical 미구현 컴포넌트
- 에이전트 채팅에서 도구 호출 시각화는 핵심 UX
- 기존 TOOL_METADATA(30+ 도구), usePPTScenario, ApprovalGate 위에 확장 가능

## 관련 기존 자산
- `TOOL_METADATA`: 30+ 도구의 icon, labelRunning, labelComplete, subtools 정의
- `usePPTScenario`: 단계 추적 상태 머신
- `ApprovalGate`: risk-based 3-tier 승인 UI (toast/inline/modal)
- Radix UI: Collapsible, Accordion 프리미티브 사용 가능
