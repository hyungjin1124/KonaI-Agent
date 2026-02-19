# Select: Artifact Panel (Split View)

- **ID**: artifact_panel
- **Status**: not_implemented
- **Priority**: critical
- **Complexity**: complex
- **Contexts**: [chat_view, artifact_panel]
- **Dependencies**:
  - `markdown_renderer` — **not_implemented** ⚠️
  - `code_block` — **not_implemented** ⚠️
  - `document_viewer` — **implemented** ✅
- **Obsidian Sources**: `Insights/agent-ui/patterns/artifact-panel-layout.md`
- **Last Researched**: 2026-02-18
- **Existing Source Files**: (none in catalog, but existing codebase has)
  - `src/components/features/agent-chat/components/ArtifactPreviewPanel/ArtifactPreviewPanel.tsx`
  - `src/components/features/agent-chat/AgentChatView.tsx`
  - `src/components/features/agent-chat/components/RightSidebar/ArtifactsSection.tsx`
  - `src/components/features/agent-chat/types.ts`
  - `src/components/features/agent-chat/layouts/CoworkLayout.tsx`

## 의존성 분석

- `document_viewer`: 구현 완료 — PDF, DOCX, XLSX, CSV, PPTX 지원
- `markdown_renderer`: 미구현 — 현재 `MarkdownPreviewPanel`이 기본 마크다운 렌더링 제공. Phase 1에서는 기존 코드 활용
- `code_block`: 미구현 — Phase 1 범위 밖. 마크다운 내 코드블록은 기본 `<pre>` 처리

## 구현 범위 판단

의존성 미충족(`markdown_renderer`, `code_block`)이나 **Phase 1 범위인 탭 관리 + 구조 리팩터링**은 의존성 없이 진행 가능:
- 탭 관리 (열기/닫기/전환)
- ArtifactContext 도입으로 props 분리
- 기존 DocumentViewer, PPT, Dashboard 등 렌더러 활용
- 키보드 내비게이션
- 전체화면 토글 개선
