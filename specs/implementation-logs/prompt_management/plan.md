# Plan: Prompt Management

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `src/components/features/prompt-management/promptManagementData.ts` | 타입, 상수, Mock 데이터, 헬퍼 | 신규 |
| `src/components/features/prompt-management/PromptManagementView.tsx` | 메인 컴포넌트 (목록+CRUD+편집+버전+테스트) | 신규 |
| `src/components/features/prompt-management/index.ts` | barrel export | 신규 |
| `src/components/AdminView.tsx` | 탭 추가 (프롬프트 관리) | 수정 |
| `src/components/icons/index.ts` | FileCode icon 추가 | 수정 |

## Props Interface

```typescript
// 메인 뷰 — props 없음 (admin 탭 패턴)
export function PromptManagementView() { ... }
```

## 핵심 타입 설계

```typescript
type PromptStatus = 'draft' | 'active' | 'archived';
type ModerationLevel = 'low' | 'medium' | 'high';
type PromptCategory = 'system' | 'task' | 'safety' | 'persona' | 'custom';

interface PromptTemplate {
  id: string;
  name: string;
  category: PromptCategory;
  content: string;                    // 시스템 프롬프트 본문 ({{변수}} 지원)
  status: PromptStatus;
  modelId: string;                    // 바인딩된 모델 ID
  moderationLevel: ModerationLevel;
  currentVersion: number;
  versions: PromptVersion[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface PromptVersion {
  version: number;
  content: string;
  modelId: string;
  moderationLevel: ModerationLevel;
  changeNote: string;
  createdAt: string;
  createdBy: string;
}

interface TestResult {
  input: Record<string, string>;  // 변수명 → 값
  output: string;                 // 모의 응답
  timestamp: string;
}
```

## 상태 설계

- `templates: PromptTemplate[]` — useState, MOCK_TEMPLATES로 초기화
- `searchQuery: string` — 검색어
- `categoryFilter: PromptCategory | 'all'` — 카테고리 필터
- `statusFilter: PromptStatus | 'all'` — 상태 필터
- `selectedTemplate: PromptTemplate | null` — 편집/상세 보기 중인 템플릿
- `isEditorOpen: boolean` — 편집 다이얼로그 열림 상태
- `isDeleteDialogOpen: boolean` — 삭제 확인 다이얼로그
- `editorMode: 'create' | 'edit'` — 편집 모드
- `activeTab: 'edit' | 'versions' | 'test'` — 에디터 내부 탭

## UI 레이아웃

### 메인 뷰 (목록)
```
┌──────────────────────────────────────────────────┐
│ [Search]  [Category ▼] [Status ▼]  [+ 새 프롬프트] │
├──────────────────────────────────────────────────┤
│ 이름 | 카테고리 | 모델 | 버전 | 상태 | 수정일 | 관리  │
│ ─── | ────── | ─── | ── | ── | ──── | ──   │
│ ... rows ...                                      │
└──────────────────────────────────────────────────┘
```

### 편집 다이얼로그 (Sheet, right side)
```
┌─────────────────────────────────────────────┐
│ 프롬프트 편집: {name}                         │
│                                             │
│ [편집] [버전 이력] [테스트]    ← 내부 탭      │
│                                             │
│ ┌─ 편집 탭 ──────────────────────────────┐ │
│ │ 제목: [..........]                      │ │
│ │ 카테고리: [▼ system]                    │ │
│ │ 모델: [▼ Claude Opus 4.6]              │ │
│ │ 모더레이션: ○Low ●Medium ○High          │ │
│ │ 시스템 프롬프트:                         │ │
│ │ ┌──────────────────────────────────┐   │ │
│ │ │ 당신은 {{role}} 전문가입니다...    │   │ │
│ │ │                                  │   │ │
│ │ └──────────────────────────────────┘   │ │
│ │ 432자 / ~108 tokens                    │ │
│ │ 변경 요약: [..........]                 │ │
│ └────────────────────────────────────────┘ │
│                                             │
│ [취소]  [저장 (새 버전 생성)]                  │
└─────────────────────────────────────────────┘
```

## 통합 지점

- `AdminView.tsx`: TabsTrigger + TabsContent 추가 (value="prompt-management")
- Icon: FileCode (lucide-react) 사용 — icons/index.ts에 추가 필요

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| AC-1 | 템플릿 목록 테이블 | `PromptManagementView.tsx` — renderPromptTable() |
| AC-2 | 생성/편집 다이얼로그 | `PromptManagementView.tsx` — Sheet 편집기 (편집 탭) |
| AC-3 | 불변 스냅샷 버전 이력 | `PromptManagementView.tsx` — Sheet 편집기 (버전 이력 탭) |
| AC-4 | 인라인 테스트 패널 | `PromptManagementView.tsx` — Sheet 편집기 (테스트 탭) |
| AC-5 | 모델 바인딩 드롭다운 | `PromptManagementView.tsx` — 편집 탭 내 Select |
| AC-6 | 모더레이션 감도 설정 | `PromptManagementView.tsx` — 편집 탭 내 RadioGroup |
| AC-7 | 카테고리 필터 + 검색 | `PromptManagementView.tsx` — 툴바 |
| AC-8 | 삭제 (확인 다이얼로그) | `PromptManagementView.tsx` — Dialog 확인 |
| AC-9 | 상태 관리 (draft/active/archived) | `promptManagementData.ts` — StatusBadge |
| AC-10 | Mock 데이터 10건+, 각 2+버전 | `promptManagementData.ts` — MOCK_TEMPLATES |
| AC-11 | data-testid 부여 | 모든 주요 요소에 부여 |
| AC-12 | AdminView 탭 통합 | `AdminView.tsx` 수정 |
| AC-13 | useState 기반 CRUD | `PromptManagementView.tsx` — useState + handlers |

## 테스트 시나리오

| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | AC-1 | 초기 렌더링 시 목록 테이블에 mock 데이터 표시 | RTL render → screen.getByTestId('prompt-table') 확인 | must |
| 2 | AC-2 | "새 프롬프트" 클릭 → 편집 Sheet 열림 → 제목/카테고리/본문 입력 → 저장 → 목록에 추가 | userEvent.click + fillForm + submit → 새 row 확인 | must |
| 3 | AC-3 | 기존 템플릿 편집 → 저장 → 버전 이력에 새 버전 추가 확인 | 편집→저장 후 버전이력 탭에서 새 버전 row 확인 | must |
| 4 | AC-4 | 테스트 탭에서 변수 입력 → "테스트 실행" → 모의 응답 표시 | userEvent로 변수 입력→실행→응답 영역 확인 | must |
| 5 | AC-5 | 모델 바인딩 드롭다운에 모델 목록 표시 및 선택 | Select 컴포넌트 열기→옵션 확인→선택 | must |
| 6 | AC-6 | 모더레이션 감도 라디오 버튼 선택 반영 | RadioGroup 클릭→checked 상태 확인 | must |
| 7 | AC-7 | 검색어 입력 → 필터링된 결과 표시, 카테고리 필터 → 해당 카테고리만 표시 | Input change event → 필터링 결과 row count 확인 | must |
| 8 | AC-8 | 삭제 버튼 → 확인 다이얼로그 → 확인 → 목록에서 제거 | 삭제→확인→queryByText로 제거 확인 | must |
| 9 | AC-9 | 상태 배지 렌더링 (draft=회색, active=녹색, archived=회색) | Badge 컴포넌트 className 확인 | should |
| 10 | AC-11 | 주요 요소에 data-testid 존재 | getByTestId로 각 요소 접근 가능 확인 | must |
| 11 | AC-12 | AdminView에서 프롬프트 관리 탭 클릭 → PromptManagementView 렌더 | TabsTrigger 클릭→TabsContent 확인 | should |
| 12 | AC-13 | CRUD 동작이 useState 기반 로컬 상태로 동작 | 생성/수정/삭제 후 상태 변경 확인 | must |
| 13 | — | 변수 `{{var}}` 하이라이팅 표시 | Textarea 내 변수 패턴 감지 → 하이라이팅 확인 | should |
| 14 | — | 빈 목록 시 empty state 표시 | 모든 항목 삭제 후 empty state 확인 | should |
