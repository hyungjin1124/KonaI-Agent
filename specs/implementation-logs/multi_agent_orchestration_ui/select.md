# Select: Multi-Agent Orchestration UI

- **ID**: multi_agent_orchestration_ui
- **Status**: not_implemented → implementing
- **Priority**: high
- **Complexity**: complex
- **Contexts**: [chat_view, agent_scenario, monitoring]
- **Dependencies**:
  - `tool_call_display` — **implemented**
  - `multi_step_progress` — **partial** (시나리오 훅에서 상태 관리는 있으나, 범용 UI 컴포넌트로 분리 필요)
- **Obsidian Sources**: Insights/agent-ui/patterns/multi-agent-orchestration-ui.md
- **Existing Source Files**: `src/components/features/multi-agent/` (12 files, ~1,400 lines — Phase 1 컴포넌트 이미 구현)
- **Last Researched**: 2026-03-05
- **Notes**: 5가지 패턴 분류: Transparent Supervisor, Visible Orchestrator Tree, Visual Graph Editor, Role-Based Crew Builder, Code-First. KonaI-Agent는 Visible Orchestrator + Sidebar Task List 하이브리드 권장. parallel_execution_view를 포괄하는 상위 개념으로, 함께 구현 권장.

## 구현 상태 분석 (2026-03-05)

Phase 1 핵심 컴포넌트(12개 파일)는 이미 구현 완료:
- types.ts, constants.ts, useMultiAgentOrchestration.ts
- AgentTaskCard, AgentTaskList, AgentDetailView
- OrchestrationSummaryBanner, HandoffIndicator, AgentResultsSummary
- MultiAgentScenarioRenderer, index.ts, test file

**남은 작업**: 채팅 뷰 통합, 전용 라우트, Dashboard 트리거, Done response
