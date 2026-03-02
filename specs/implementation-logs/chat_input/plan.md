# Plan: Chat Input (Multi-modal) — UnifiedChatInput

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `src/components/features/general-chat/components/UnifiedChatInput/UnifiedChatInput.tsx` | 메인 통합 입력 컴포넌트 | 신규 |
| `src/components/features/general-chat/components/UnifiedChatInput/PlusMenu.tsx` | + 메뉴 (Radix DropdownMenu) | 신규 |
| `src/components/features/general-chat/components/UnifiedChatInput/useUnifiedInput.ts` | 파일 처리, D&D, 클립보드 로직 Hook | 신규 |
| `src/components/features/general-chat/components/UnifiedChatInput/constants.ts` | 파일 타입/크기 제한 상수 | 신규 |
| `src/components/features/general-chat/components/UnifiedChatInput/types.ts` | Props 인터페이스, 타입 정의 | 신규 |
| `src/components/features/general-chat/components/UnifiedChatInput/index.ts` | 배럴 export | 신규 |
| `src/components/features/general-chat/components/UnifiedChatInput/UnifiedChatInput.test.tsx` | 단위 테스트 | 신규 |
| `src/components/features/general-chat/GeneralChatView.tsx` | UnifiedChatInput 통합 | 수정 |
| `src/components/features/general-chat/components/ChatPanel/ChatPanel.tsx` | UnifiedChatInput 통합 (빈 상태) | 수정 |

## Props Interface

```typescript
interface UnifiedChatInputProps {
  // 필수
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: (text: string, files?: AttachedFile[]) => void;

  // 레이아웃
  variant?: 'default' | 'centered';

  // 기능 토글
  showModelSwitcher?: boolean;
  showPlusMenu?: boolean;
  showSuggestionChips?: boolean;
  showHitlPanel?: boolean;
  disabled?: boolean;

  // 모델 선택
  selectedModelId?: string;
  onModelChange?: (id: string) => void;

  // HITL
  activeHitl?: ActiveHitl | null;
  hitlResumeCallback?: ((stepId: string, selectedOption: string) => void) | null;
  onHitlClose?: () => void;

  // 제안 칩
  suggestionChips?: { label: string; onClick: () => void }[];

  // Refs
  textareaRef?: RefObject<HTMLTextAreaElement>;

  // 콜백
  onValidationError?: (message: string) => void;

  // placeholder
  placeholder?: string;
}
```

## 상태 설계

### useUnifiedInput Hook
- `attachedFiles: AttachedFile[]` — 복수 파일 (최대 5개)
- `isDragging: boolean` — D&D 상태
- `dragCounterRef: RefObject<number>` — 플리커 방지 카운터
- `fileInputRef: RefObject<HTMLInputElement>` — 숨겨진 파일 인풋

### Hook 메서드
- `addFiles(fileList: FileList)` — 파일 유효성 검증 → 추가
- `removeFile(id: string)` — 파일 제거
- `clearFiles()` — 전체 초기화
- `handleDragEnter/Leave/Over/Drop` — D&D 핸들러
- `handlePaste(e: ClipboardEvent)` — 클립보드 이미지 처리
- `handleFilePick()` — + 메뉴에서 파일 선택
- `handleImagePick()` — + 메뉴에서 이미지 선택
- `handleSend()` — 전송 (텍스트 + 파일)

## 통합 지점

### GeneralChatView.tsx (수정)
- 기존 58줄 입력 영역을 `<UnifiedChatInput>` 1개로 교체
- props: `variant="default"`, `showModelSwitcher={true}`, `showPlusMenu={true}`

### ChatPanel.tsx (수정)
- 빈 상태의 중앙 배치 입력을 `<UnifiedChatInput variant="centered">` 로 교체
- 메시지 존재 시 ChatPanel에서는 입력 영역 미렌더링 (GeneralChatView가 담당)

### ChatInputArea (미수정 — Phase 1에서 보존)
- ChatInputArea는 대시보드용으로 현재 유지. 에이전트 시나리오의 HITL/PPT 로직이 깊이 결합되어 있어, Phase 1에서는 별도 보존하고 향후 통합.

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | 단일 입력 컴포넌트 (UnifiedChatInput) | UnifiedChatInput.tsx |
| 2 | 기능 토글 Props | types.ts → UnifiedChatInputProps |
| 3 | + 메뉴 | PlusMenu.tsx (Radix DropdownMenu) |
| 4 | 이미지 클립보드 | useUnifiedInput.ts → handlePaste |
| 5 | 첨부 파일 칩 | UnifiedChatInput.tsx → AttachedFileChip 재사용 |
| 6 | 복수 파일 지원 (최대 5개) | useUnifiedInput.ts → addFiles |
| 7 | 파일 타입 검증 | constants.ts + useUnifiedInput.ts |
| 8 | 파일 크기 제한 (10MB) | constants.ts + useUnifiedInput.ts |
| 9 | ModelSwitcher 통합 | UnifiedChatInput.tsx → showModelSwitcher prop |
| 10 | 드래그앤드롭 통합 | useUnifiedInput.ts → D&D handlers |
| 11 | HITL 패널 통합 | UnifiedChatInput.tsx → showHitlPanel prop |
| 12 | 접근성 | UnifiedChatInput.tsx — ARIA, 키보드 내비게이션 |

## 테스트 시나리오

| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | 단일 입력 컴포넌트 | 렌더링 시 textarea + 전송 버튼 존재 | RTL render + getByRole | must |
| 2 | variant="centered" | centered 변형에서 중앙 정렬 클래스 적용 | RTL render + container class check | must |
| 3 | + 메뉴 | + 버튼 클릭 → 3개 메뉴 항목 표시 | RTL click + getByRole('menuitem') | must |
| 4 | 이미지 클립보드 | Ctrl+V로 이미지 붙여넣기 → 첨부 칩 표시 | RTL fireEvent.paste + blob | must |
| 5 | 복수 파일 (최대 5개) | 6번째 파일 첨부 시도 → onValidationError 호출 | RTL + mock callback | must |
| 6 | 파일 타입 검증 | .exe 파일 첨부 → 거절 | RTL drop + mock | must |
| 7 | 파일 크기 제한 | 11MB 파일 → 거절 | RTL drop + mock | must |
| 8 | Enter 전송 | Enter → onSend 호출, Shift+Enter → 줄바꿈 | RTL keyDown | must |
| 9 | 파일만 전송 | 텍스트 없이 파일 첨부 → 전송 가능 | RTL render + click send | must |
| 10 | 전송 후 초기화 | 전송 후 첨부 파일 + 텍스트 클리어 | RTL + state assertion | must |
| 11 | D&D 파일 | 파일 드롭 → 첨부 칩 표시 | RTL fireEvent.drop | should |
| 12 | D&D 아티팩트 | ARTIFACT_DRAG_MIME_TYPE 드롭 → 첨부 | RTL fireEvent.drop + dataTransfer | should |
| 13 | ModelSwitcher 표시/숨김 | showModelSwitcher={false} → 미렌더링 | RTL queryByTestId | should |
| 14 | disabled 상태 | disabled=true → textarea + 버튼 비활성 | RTL getByRole + disabled attr | should |
| 15 | 접근성 레이블 | textarea aria-label, 전송 버튼 aria-label 존재 | RTL getByLabelText | must |

> 기존 QA 테스트 파일(UnifiedChatInput.qa.test.tsx, UnifiedChatInput.flow.qa.test.tsx)의 테스트 시나리오도 모두 통과해야 함.
