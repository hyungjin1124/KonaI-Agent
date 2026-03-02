# Select: Chat Input (Multi-modal)

- **ID**: chat_input
- **Status**: partial
- **Priority**: high
- **Complexity**: moderate
- **Contexts**: [chat_view]
- **Dependencies**: 없음 (독립 구현 가능)
- **Obsidian Sources**: Insights/agent-ui/patterns/multimodal-input-patterns.md
- **Last Researched**: 2026-03-02

## Existing Source Files

| 파일 | 역할 | 재사용도 |
|------|------|---------|
| `src/components/ChatInterface.tsx` | 대시보드 입력 (126줄) | 60% |
| `src/components/features/general-chat/GeneralChatView.tsx` | 채팅 입력 (437줄) | 80% |
| `src/components/features/agent-chat/components/ChatInputArea/ChatInputArea.tsx` | 에이전트 채팅 입력 (382줄) | 100% |
| `src/components/features/agent-chat/components/ChatInputArea/AttachedFileChip.tsx` | 첨부 파일 칩 (84줄) | 100% |
| `src/components/features/agent-chat/components/ChatInputArea/DropZoneOverlay.tsx` | 드롭존 오버레이 (39줄) | 100% |

## QA Test Files (구현체 없음)

| 파일 | 설명 |
|------|------|
| `src/components/features/general-chat/components/UnifiedChatInput/UnifiedChatInput.qa.test.tsx` | 엣지케이스 테스트 (396줄) |
| `src/components/features/general-chat/components/UnifiedChatInput/UnifiedChatInput.flow.qa.test.tsx` | 통합 플로우 테스트 (365줄) |

## 선정 사유

- 8회 연속 리뷰에서 구현 권장됨
- 리서치 완료 (2026-03-02 업데이트, 10개 제품 비교)
- 의존성 없음, 즉시 구현 가능
- 채팅 입력은 AI 제품의 가장 기본적인 인터페이스 — critical 사용자 가치
