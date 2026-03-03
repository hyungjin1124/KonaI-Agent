# Plan: Chat Input (Multi-modal) — Phase 1 MVP

## 구현 범위

Phase 1 (MVP)만 구현. Phase 2 (@mention), Phase 3 (고급 기능)은 별도 사이클.

**핵심 변경**: GeneralChatView의 인라인 입력을 재사용 가능한 `UnifiedChatInput` 컴포넌트로 교체.
기존 ChatInputArea(대시보드용)는 변경하지 않음 — 대시보드 전용 기능(HITL, 제안 칩)이 많아 통합 시 복잡도가 과도하게 증가.

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `src/components/features/general-chat/components/UnifiedChatInput/UnifiedChatInput.tsx` | 통합 채팅 입력 컴포넌트 | 신규 |
| `src/components/features/general-chat/components/UnifiedChatInput/PlusMenu.tsx` | + 메뉴 드롭업 | 신규 |
| `src/components/features/general-chat/components/UnifiedChatInput/useFileAttachment.ts` | 파일 첨부 로직 훅 | 신규 |
| `src/components/features/general-chat/components/UnifiedChatInput/constants.ts` | 파일 타입/크기 상수 | 신규 |
| `src/components/features/general-chat/components/UnifiedChatInput/index.ts` | 배럴 export | 신규 |
| `src/components/features/general-chat/GeneralChatView.tsx` | 인라인 입력 → UnifiedChatInput 교체 | 수정 |
| `src/components/features/general-chat/components/ChatPanel/ChatPanel.tsx` | 빈 상태 입력 → UnifiedChatInput 교체 | 수정 |
| `src/components/features/agent-chat/types.ts` | AttachedFile 타입에 image 추가 | 수정 |

## Props Interface

```typescript
interface UnifiedChatInputProps {
  // 입력 상태
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  textareaRef?: RefObject<HTMLTextAreaElement>;
  disabled?: boolean;
  placeholder?: string;

  // 파일 첨부
  attachedFiles: AttachedFile[];
  onFilesChange: (files: AttachedFile[]) => void;

  // 모델 선택 (선택적)
  showModelSwitcher?: boolean;
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;

  // 레이아웃 변형
  variant?: 'default' | 'centered';  // default: 하단 고정, centered: 빈 상태 중앙
  className?: string;
}
```

## 상태 설계

### useFileAttachment Hook

```typescript
interface UseFileAttachmentReturn {
  attachedFiles: AttachedFile[];
  isDragging: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  handlePaste: (e: ClipboardEvent) => void;
  dragHandlers: {
    onDragOver: (e: DragEvent) => void;
    onDragEnter: (e: DragEvent) => void;
    onDragLeave: (e: DragEvent) => void;
    onDrop: (e: DragEvent) => void;
  };
}
```

- 최대 5개 파일 동시 첨부
- 파일 타입 검증: 이미지(PNG/JPG/GIF/WebP) + 문서(PDF/DOCX/XLSX/CSV/TXT/MD/JSON)
- 파일 크기 제한: 10MB/파일
- 이미지 클립보드 붙여넣기 (Ctrl+V)
- 기존 D&D 패턴 재사용 (카운터 기반 플리커 방지)

### PlusMenu

Radix `DropdownMenu` 사용 (src/components/ui/dropdown-menu.tsx).
- 파일 첨부 (숨겨진 input trigger)
- 이미지 업로드 (accept=image/*)
- 웹 링크 추가 (placeholder — Phase 2 연기)

## 통합 지점

1. **GeneralChatView** (L335-391): 기존 인라인 `inputArea`를 `<UnifiedChatInput variant="default" />` 로 교체
2. **ChatPanel** (L53-105): 빈 상태 입력을 `<UnifiedChatInput variant="centered" />` 로 교체
3. **AttachedFile 타입**: `'image'` 타입 추가 (클립보드/이미지 업로드용)
4. **Toast**: `useToast`로 파일 타입/크기 에러 표시

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | 단일 입력 컴포넌트 | UnifiedChatInput (variant='default' / 'centered') |
| 2 | + 메뉴 | PlusMenu.tsx (Radix DropdownMenu) |
| 3 | 이미지 클립보드 | useFileAttachment.handlePaste |
| 4 | 첨부 파일 칩 | UnifiedChatInput 내 AttachedFileChip 배열 렌더 |
| 5 | 복수 파일 지원 | useFileAttachment (max 5, flex-wrap) |
| 6 | 파일 타입 검증 | useFileAttachment.addFiles → validateFile |
| 7 | 파일 크기 제한 | useFileAttachment.addFiles → validateFile |
| 8 | ModelSwitcher 통합 | UnifiedChatInput (showModelSwitcher prop) |
| 9 | 접근성 | aria-label, aria-expanded, role 속성 |

## 테스트 시나리오

| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | 단일 입력 컴포넌트 | variant='default' 렌더 → textarea + send 버튼 표시 | RTL render + screen.getByRole | must |
| 2 | 단일 입력 컴포넌트 | variant='centered' 렌더 → 중앙 배치 확인 | RTL render + className 확인 | must |
| 3 | + 메뉴 | Plus 버튼 클릭 → 드롭다운 메뉴 3개 항목 표시 | userEvent.click + getByRole('menuitem') | must |
| 4 | 이미지 클립보드 | Ctrl+V로 이미지 붙여넣기 → 첨부 파일 추가 | fireEvent.paste + clipboardData mock | must |
| 5 | 복수 파일 지원 | 5개 파일 추가 → 모두 칩으로 표시 | addFiles 5회 호출 + chip 카운트 | must |
| 6 | 복수 파일 제한 | 6번째 파일 추가 시도 → 에러 토스트 | addFiles 6회 → toast 호출 확인 | should |
| 7 | 파일 타입 검증 | .exe 파일 추가 → 에러 토스트 | addFiles with invalid ext | must |
| 8 | 파일 크기 제한 | 15MB 파일 추가 → 에러 토스트 | addFiles with large file mock | must |
| 9 | ModelSwitcher 통합 | showModelSwitcher=true → ModelSwitcher 렌더 | RTL render + getByRole('combobox') | should |
| 10 | 접근성 | textarea에 aria-label, 전송 버튼 aria-label | getByLabelText 쿼리 | must |
| 11 | Enter 키 전송 | Enter 키 → onSend 호출 | userEvent.keyboard | must |
| 12 | Shift+Enter 줄바꿈 | Shift+Enter → onSend 미호출 | userEvent.keyboard | should |
| 13 | 드래그앤드롭 | 파일 드롭 → 첨부 추가 | fireEvent.drop | should |
| 14 | 파일 제거 | 칩 X 버튼 클릭 → 해당 파일 제거 | userEvent.click on remove button | must |
