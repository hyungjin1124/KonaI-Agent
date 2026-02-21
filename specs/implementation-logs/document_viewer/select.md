# Select: Document Viewer (docx/pdf/pptx) — Phase 3 Update

- **ID**: document_viewer
- **Status**: needs_update (Phase 1+2 구현 완료, Phase 3 확장 필요)
- **Priority**: high
- **Complexity**: complex
- **Contexts**: artifact_panel, chat_view
- **Dependencies**: (none — all satisfied)
- **Obsidian Sources**: Insights/agent-ui/patterns/document-viewer-patterns.md
- **Last Researched**: 2026-02-21
- **Existing Source Files**:
  - `src/components/features/agent-chat/components/DocumentViewer/DocumentViewer.tsx`
  - `src/components/features/agent-chat/components/DocumentViewer/PDFViewer.tsx`
  - `src/components/features/agent-chat/components/DocumentViewer/DOCXViewer.tsx`
  - `src/components/features/agent-chat/components/DocumentViewer/XLSXViewer.tsx`
  - `src/components/features/agent-chat/components/DocumentViewer/CSVViewer.tsx`
  - `src/components/features/agent-chat/components/DocumentViewer/PPTXInfoCard.tsx`
  - `src/components/features/agent-chat/components/DocumentViewer/DocumentViewerToolbar.tsx`
  - `src/components/features/agent-chat/components/DocumentViewer/index.ts`
  - `src/components/features/agent-chat/components/ArtifactPreviewPanel/ArtifactPreviewPanel.tsx`
  - `src/components/features/agent-chat/components/ArtifactPreviewPanel/ArtifactPanelHeader.tsx`
  - `src/components/features/agent-chat/context/ArtifactPanelContext.tsx`

## 선정 사유

ChatGPT Deep Research UI 리디자인(2026-02-10)으로 3패널 풀스크린 문서 뷰어가 표준화됨.
현재 Phase 1+2(PDF/DOCX/XLSX/CSV 뷰잉)가 완료되어 있으므로, Phase 3으로 다음 3가지 확장을 추가:
1. **TOC 사이드바**: heading 파싱 + 스크롤 스파이 + 클릭 점프
2. **인용 사이드패널**: 소스 목록 + 인라인 각주
3. **풀스크린 토글**: CSS Portal 기반 뷰포트 전체 점유

## Notes

- feature/document_viewer 브랜치에서 이미 작업 중
- isMaximized 상태가 ArtifactPanelContext에 존재하여 풀스크린 확장 비용 낮음
- 리서치 문서 Phase 4(내보내기)는 이번 구현 범위에서 제외
