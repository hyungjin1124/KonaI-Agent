# Select: Artifact Panel Phase 2 — 아티팩트 라이브러리 + 버전 히스토리

- **ID**: artifact_panel
- **Status**: needs_update (Phase 1 완료, Phase 2 구현 대기)
- **Priority**: critical
- **Complexity**: complex
- **Contexts**: [chat_view, artifact_panel]
- **Dependencies**:
  - `markdown_renderer` — **implemented** (MarkdownRenderer in renderers/)
  - `code_block` — **not_implemented** ⚠️ (Phase 2 범위 외)
  - `document_viewer` — **implemented** ✅
- **Obsidian Sources**: `Insights/agent-ui/patterns/artifact-panel-layout.md`
- **Last Researched**: 2026-03-27
- **Existing Source Files** (Phase 1):
  - `src/components/features/agent-chat/context/ArtifactPanelContext.tsx`
  - `src/components/features/agent-chat/components/ArtifactPreviewPanel/ArtifactPreviewPanel.tsx`
  - `src/components/features/agent-chat/components/ArtifactPreviewPanel/ArtifactPanelHeader.tsx`
  - `src/components/features/agent-chat/components/ArtifactPreviewPanel/ArtifactTabBar.tsx`
  - `src/components/features/agent-chat/components/ArtifactPreviewPanel/renderers/*`
  - `src/components/features/agent-chat/components/RightSidebar/ArtifactsSection.tsx`
  - `src/components/features/agent-chat/types.ts`

## Phase 2 구현 범위

리서치 문서(2026-03-26) 기반 Phase 2 타겟:
1. **ArtifactLibraryContext** — 자동 저장, 대화 독립 생명주기, 유형 필터, 검색, 정렬
2. **버전 히스토리** — 아티팩트별 버전 추적, 복원
3. **채팅↔아티팩트 양방향 링크** — messageId 기반 양방향 네비게이션
4. **ArtifactsSection 확장** — "현재 대화" / "라이브러리" 탭 전환 UI
5. **ArtifactPanelHeader 확장** — 버전 히스토리 토글 버튼

## QA 테스트 사전 작성

- `ArtifactLibraryContext.qa.test.tsx` — 엣지 케이스 테스트 사전 작성됨
- `ArtifactLibraryContext.flow.qa.test.tsx` — 플로우 테스트 사전 작성됨
