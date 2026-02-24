# Select: Markdown Renderer

- **ID**: markdown_renderer
- **Status**: not_implemented
- **Priority**: critical
- **Complexity**: moderate
- **Contexts**: [chat_view, artifact_panel]
- **Dependencies**: (none)
- **Obsidian Sources**:
  - Insights/agent-ui/patterns/markdown-renderer.md
  - Insights/agent-ui/patterns/streaming-response-rendering.md
- **Existing Source Files**: (none)
- **Last Researched**: 2026-02-24

## Selection Rationale

markdown_renderer는 priority: critical 미구현 컴포넌트로 가장 많은 후속 의존성을 보유:
- streaming_typing (critical) — markdown_renderer에 의존
- code_block (high) — markdown_renderer에 의존
- mermaid_diagram (medium) — markdown_renderer에 의존

이전 리뷰(2026-02-22)에서 Batch 2로 지정, Batch 1(tool_call_display) 완료로 승격.

## Dependency Check

의존성 없음 — 즉시 구현 가능.
