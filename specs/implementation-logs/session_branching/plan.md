# Plan: Session Branching / Forking

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `src/components/features/general-chat/types.ts` | ChatMessage/ChatSession 타입 확장 (parentMessageId, branchId 등) | 수정 |
| `src/components/features/general-chat/hooks/useBranching.ts` | 분기 CRUD 로직 Hook | 신규 |
| `src/components/features/general-chat/components/BranchIndicator/BranchIndicator.tsx` | 메시지의 분기 존재 인디케이터 + 분기 목록 팝오버 | 신규 |
| `src/components/features/general-chat/components/BranchIndicator/index.ts` | barrel export | 신규 |
| `src/components/features/general-chat/components/ChatPanel/ChatPanel.tsx` | 메시지별 hover 시 "분기 생성" 버튼 + BranchIndicator 렌더링 | 수정 |
| `src/components/features/general-chat/components/LeftSidebar/LeftSidebar.tsx` | 현재 세션의 분기 목록 인라인 표시 | 수정 |
| `src/components/features/general-chat/components/LeftSidebar/BranchItem.tsx` | 분기 항목 렌더링 (들여쓰기 + 아이콘) | 신규 |
| `src/components/features/general-chat/GeneralChatView.tsx` | useBranching Hook 통합, 분기 상태 관리 | 수정 |
| `src/components/features/general-chat/hooks/useBranching.test.ts` | Hook 단위 테스트 | 신규 |
| `src/components/features/general-chat/components/BranchIndicator/BranchIndicator.test.tsx` | BranchIndicator 컴포넌트 테스트 | 신규 |

## Props Interface

```typescript
// types.ts 확장
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Citation[];
  // NEW
  parentMessageId?: string | null;  // null = root message
  branchId?: string;                // which branch this belongs to
}

interface BranchInfo {
  id: string;
  name: string;
  forkPointMessageId: string;  // 분기 시작 메시지 ID
  createdAt: Date;
  messageCount: number;
}

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  // NEW
  branches: BranchInfo[];
  activeBranchId: string;       // 현재 활성 분기 ID
}

// BranchIndicator.tsx
interface BranchIndicatorProps {
  messageId: string;
  branches: BranchInfo[];       // 이 메시지에서 시작하는 분기들
  activeBranchId: string;
  onSwitchBranch: (branchId: string) => void;
  onCreateBranch: (messageId: string) => void;
}

// BranchItem.tsx
interface BranchItemProps {
  branch: BranchInfo;
  isActive: boolean;
  onClick: () => void;
  onDelete?: (branchId: string) => void;
}
```

## 상태 설계

`useBranching` Hook이 분기 관련 모든 상태와 로직을 캡슐화:

```typescript
interface UseBranchingReturn {
  // State
  branches: BranchInfo[];
  activeBranchId: string;
  activeMessages: ChatMessage[];  // 활성 분기의 메시지만 선형 추출

  // Actions
  createBranch: (forkPointMessageId: string, name?: string) => string;  // returns branchId
  switchBranch: (branchId: string) => void;
  deleteBranch: (branchId: string) => void;
  renameBranch: (branchId: string, name: string) => void;
  addMessage: (message: ChatMessage) => void;

  // Queries
  getBranchesAtMessage: (messageId: string) => BranchInfo[];
  hasBranches: (messageId: string) => boolean;
}
```

내부 상태: 전체 메시지를 Map<branchId, ChatMessage[]>로 관리. 활성 분기 전환 시 해당 분기의 메시지 배열을 activeMessages로 노출.

## 통합 지점

1. **GeneralChatView**: useBranching Hook 호출. 기존 `messages` state를 `useBranching.activeMessages`로 대체. `handleSend`에서 `addMessage` 사용.
2. **ChatPanel**: 각 메시지에 hover 시 "분기" 버튼 표시. BranchIndicator 렌더링.
3. **LeftSidebar**: 활성 세션 아래에 분기 목록 표시 (BranchItem 사용).
4. **라우팅 변경 없음**: 분기는 세션 내부 개념이므로 URL 변경 불필요.

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| AC1 | 분기 생성 액션 트리거 | ChatPanel: 메시지 hover "분기 생성" 버튼 → useBranching.createBranch |
| AC2 | 분기 시 대화 이력 보존 | useBranching.createBranch: forkPoint까지 메시지 복사 |
| AC3 | 분기 시각적 인디케이터 | BranchIndicator: ⎇ 아이콘 + "N개 분기" 배지 |
| AC4 | 분기 목록 표시 + 전환 | BranchIndicator 팝오버 + useBranching.switchBranch |
| AC5 | LeftSidebar 분기 표시 | LeftSidebar: 활성 세션 아래 BranchItem 렌더링 |
| AC6 | 분기 전환 시 메시지 갱신 | useBranching.switchBranch → activeMessages 변경 → ChatPanel 리렌더 |
| AC7 | 분기 삭제 | BranchItem: 삭제 버튼 → useBranching.deleteBranch |
| AC8 | 키보드 단축키 | GeneralChatView: Ctrl+Shift+B (생성), Ctrl+[/] (전환) |
| AC9 | Undo 지원 | Phase 2로 연기 (MVP에서는 삭제 확인 dialog으로 대체) |

## 테스트 시나리오

| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | AC1 분기 생성 | 메시지가 있는 상태에서 createBranch(messageId) 호출 → 새 분기 생성됨 | useBranching Hook renderHook + act | must |
| 2 | AC2 이력 보존 | 3개 메시지 후 2번째에서 분기 → 분기에 1,2번 메시지만 포함 | useBranching Hook 상태 검증 | must |
| 3 | AC3 인디케이터 | 분기가 있는 메시지에 BranchIndicator 렌더 → ⎇ 아이콘 표시 | RTL render + getByRole | must |
| 4 | AC4 분기 전환 | BranchIndicator 클릭 → 팝오버에 분기 목록 → 분기 클릭 → switchBranch 호출 | RTL userEvent.click + mock callback | must |
| 5 | AC5 사이드바 분기 | 분기가 있는 세션 선택 → LeftSidebar에 분기 목록 표시 | RTL render + queryAllByTestId | must |
| 6 | AC6 메시지 갱신 | switchBranch 호출 → activeMessages가 해당 분기 메시지로 변경 | useBranching Hook 상태 검증 | must |
| 7 | AC7 분기 삭제 | deleteBranch 호출 → branches에서 제거됨, 다른 분기로 전환 | useBranching Hook 상태 검증 | must |
| 8 | AC8 키보드 | Ctrl+Shift+B 입력 → createBranch 호출 | RTL fireEvent.keyDown | should |
| 9 | AC9 삭제 확인 | 분기 삭제 시 확인 dialog 표시 | RTL userEvent + dialog 확인 | should |
| 10 | 엣지: 빈 세션 | 메시지 없는 상태에서 분기 생성 시도 → 무시됨 | useBranching Hook | should |
| 11 | 엣지: 단일 분기 삭제 | 마지막 분기(primary) 삭제 시도 → 불가 | useBranching Hook | should |
| 12 | 엣지: 분기 이름 충돌 | 같은 이름 분기 생성 → 자동 번호 부여 | useBranching Hook | could |
