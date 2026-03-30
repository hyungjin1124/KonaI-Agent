# Fix Request: Artifact Panel — Phase 2

## QA 판정: CONDITIONAL PASS
## 수정 사이클: 1/3

### 수정 항목

- [x] **[Major] onScrollToMessage 미배선** — `RightSidebar.tsx:8-22` + `RightSidebar.tsx:70-77`

  `RightSidebarProps`에 `onScrollToMessage` prop이 정의되지 않아 `ArtifactsSection`에 전달되지 않음.
  결과적으로 라이브러리 카드의 "채팅으로 이동" 버튼이 렌더링되지 않음 (AC7 PARTIAL).
  plan.md 통합 지점 #3 미완성.

  **수정 방향**:
  1. `RightSidebar.tsx`의 `RightSidebarProps`에 `onScrollToMessage?: (messageId: string) => void` 추가
  2. `ArtifactsSection` 렌더링 시 `onScrollToMessage={onScrollToMessage}` 전달
  3. `AgentChatView.tsx`에서 `RightSidebar`에 채팅 메시지 스크롤 핸들러 전달
     - 데모 단계: `(messageId) => console.log('scroll to', messageId)` 또는 실제 스크롤 구현
     - 실제 구현: 채팅 메시지 ref를 이용한 scrollIntoView
