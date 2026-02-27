# Select: Chat Input (Multi-modal)

- **ID**: chat_input
- **Status**: partial
- **Priority**: high
- **Complexity**: moderate
- **Contexts**: [chat_view]
- **Dependencies**: none (no explicit dependencies in catalog)
- **Obsidian Sources**: Insights/agent-ui/patterns/multimodal-input-patterns.md
- **Existing Source Files**:
  - `src/components/ChatInterface.tsx`
  - `src/components/features/general-chat/GeneralChatView.tsx`
  - `src/components/features/agent-chat/components/ChatInputArea/ChatInputArea.tsx`
  - `src/components/features/agent-chat/components/ChatInputArea/AttachedFileChip.tsx`
  - `src/components/features/agent-chat/components/ChatInputArea/DropZoneOverlay.tsx`

## Selection Rationale

- 7회 연속 리뷰에서 권장된 항목 (Batch 2 최상위)
- status `partial`: 기본 입력 + D&D + 파일 첨부 구현 완료, + 메뉴 / 이미지 클립보드 / 복수 파일 / 접근성 미구현
- Phase 1 (MVP) 구현 범위: + 메뉴 허브, 이미지 클립보드, 복수 파일, 파일 타입/크기 검증, 접근성
- Phase 2 (@mention)는 별도 사이클로 분리
