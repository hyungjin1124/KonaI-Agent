# Select: Artifact Panel (Split View) — Phase 2

- **ID**: artifact_panel
- **Status**: needs_update (Phase 1 implemented → Phase 2 update)
- **Priority**: critical
- **Complexity**: complex
- **Contexts**: [chat_view, artifact_panel]
- **Dependencies**:
  - markdown_renderer: **implemented** ✅
  - code_block: **not_implemented** ⚠️ (Phase 2에 직접 영향 없음)
  - document_viewer: **needs_update** (Phase 1-3 완료, 기능 사용 가능) ✅
- **Obsidian Sources**: Insights/agent-ui/patterns/artifact-panel-layout.md
- **Last Researched**: 2026-03-26
- **Existing Source Files**:
  - src/components/features/agent-chat/context/ArtifactPanelContext.tsx
  - src/components/features/agent-chat/components/ArtifactPreviewPanel/ArtifactPreviewPanel.tsx
  - src/components/features/agent-chat/components/ArtifactPreviewPanel/ArtifactPanelHeader.tsx
  - src/components/features/agent-chat/components/ArtifactPreviewPanel/ArtifactTabBar.tsx
  - src/components/features/agent-chat/components/ArtifactPreviewPanel/renderers/*.tsx
  - src/components/features/agent-chat/components/RightSidebar/ArtifactsSection.tsx
  - src/components/features/agent-chat/types.ts

## Phase 2 타겟 (Review Decision 2026-03-26 기반)

아티팩트 라이브러리(자동 저장+유형 필터+검색) + 버전 히스토리 + 채팅↔아티팩트 양방향 링크.
ChatGPT Library(2026-03-23) + LobeChat Agent Documents 패턴 반영.

## 선정 사유

- last_researched 2026-02-18 → 2026-03-26 갱신 완료 (36일 STALE 해소)
- ChatGPT Library + LobeChat Agent Documents 패턴 동시 등장으로 패턴 변화 감지
- Review Decision 2026-03-26에서 APPROVE-1 (Batch 1)로 승인
