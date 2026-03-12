# Plan: Prompt Management

## 파일 구조
| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| src/components/features/prompt-management/promptManagementData.ts | 타입 정의 + Mock 데이터 + 헬퍼 함수 | 신규 |
| src/components/features/prompt-management/PromptManagementView.tsx | 메인 컴포넌트 (목록 + CRUD + 인라인 테스트) | 신규 |
| src/components/features/prompt-management/index.ts | 배럴 export | 신규 |
| src/components/AdminView.tsx | 8번째 탭(프롬프트 관리) 추가 | 수정 |

## Props Interface
```typescript
// 메인 뷰는 Props 없이 자체 상태 관리
// (AdminView에서 <PromptManagementView /> 로 호출)
```

## 타입 설계
```typescript
type PromptStatus = 'draft' | 'active' | 'archived';
type PromptCategory = 'system' | 'task' | 'persona' | 'guard' | 'custom';

interface PromptVersion {
  version: number;
  content: string;
  createdAt: string;
  createdBy: string;
  changeSummary: string;
}

interface PromptTemplate {
  id: string;
  name: string;
  category: PromptCategory;
  status: PromptStatus;
  currentVersion: number;
  content: string;       // 현재 버전 내용
  variables: string[];   // {{var}} 추출
  description: string;
  versions: PromptVersion[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  charCount: number;
}

interface PromptTestResult {
  input: Record<string, string>;
  output: string;
  timestamp: string;
}
```

## 상태 설계
- `templates: PromptTemplate[]` — 전체 프롬프트 목록 (CRUD용 useState)
- `selectedTemplate: PromptTemplate | null` — 편집/상세보기 대상
- `isCreateDialogOpen: boolean` — 생성/편집 다이얼로그 제어
- `isDeleteDialogOpen: boolean` — 삭제 확인 다이얼로그 제어
- `searchQuery: string` — 검색어
- `categoryFilter: string` — 카테고리 필터
- `statusFilter: string` — 상태 필터
- `activeTab: 'edit' | 'versions' | 'test'` — 다이얼로그 내 탭 (편집/버전이력/테스트)

## 통합 지점
- AdminView.tsx에 8번째 `<TabsTrigger value="prompts">` + `<TabsContent value="prompts">` 추가
- Icon: `Sparkles` (이미 icons/index.ts에 export됨)
- Feature view import: `import { PromptManagementView } from './features/prompt-management'`

## UI 구조
1. **필터 바**: 검색 Input + 카테고리 Select + 상태 Select + "새 프롬프트" Button
2. **프롬프트 목록 테이블**: 이름, 카테고리 배지, 상태 배지, 버전, 최종 수정일, 액션 버튼
3. **생성/편집 다이얼로그** (Dialog, 넓은 폭):
   - 3탭 구조: 편집 | 버전 이력 | 테스트
   - 편집 탭: 이름, 카테고리 Select, 설명, 프롬프트 Textarea + 문자수, 변수 표시
   - 버전 이력 탭: 버전 목록 (번호, 날짜, 변경자, 요약)
   - 테스트 탭: 변수 입력 폼 + 모의 응답 미리보기
4. **삭제 확인 다이얼로그**: AlertDialog 패턴

## Acceptance Criteria 매핑
| # | Criteria | 구현 위치 |
|---|----------|-----------|
| AC-1 | 프롬프트 목록 테이블 | PromptManagementView.tsx — 메인 테이블 |
| AC-2 | 생성/편집 다이얼로그 | PromptManagementView.tsx — Dialog 내 편집 탭 |
| AC-3 | 버전 이력 표시 | PromptManagementView.tsx — Dialog 내 버전 탭 |
| AC-4 | 인라인 테스트 패널 | PromptManagementView.tsx — Dialog 내 테스트 탭 |
| AC-5 | 카테고리 필터 + 검색 | PromptManagementView.tsx — 필터 바 |
| AC-6 | 프롬프트 삭제 | PromptManagementView.tsx — 삭제 확인 다이얼로그 |
| AC-7 | 상태 관리 배지 | promptManagementData.ts — StatusBadge 서브컴포넌트 |
| AC-8 | Mock 데이터 10건+, 각 2버전+ | promptManagementData.ts — MOCK_TEMPLATES |
| AC-9 | data-testid 부여 | 모든 주요 엘리먼트에 data-testid |
| AC-10 | AdminView 8번째 탭 통합 | AdminView.tsx 수정 |
| AC-11 | useState 기반 로컬 상태 | PromptManagementView.tsx — 8개 useState |

## 테스트 시나리오
| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | AC-1 | 렌더 시 프롬프트 목록 테이블이 표시됨 | getByTestId('prompt-table'), 행 수 확인 | must |
| 2 | AC-1 | 각 행에 이름, 카테고리, 상태, 버전, 수정일이 표시됨 | getByText로 mock 데이터 값 확인 | must |
| 3 | AC-2 | "새 프롬프트" 버튼 클릭 시 다이얼로그 열림 | userEvent.click + getByTestId('prompt-dialog') | must |
| 4 | AC-2 | 편집 다이얼로그에 이름, 카테고리, 설명, Textarea, 문자수 표시 | getByTestId 각 필드 확인 | must |
| 5 | AC-3 | 버전 이력 탭 클릭 시 버전 목록 표시 | userEvent.click 버전 탭 + getAllByTestId('version-row') | must |
| 6 | AC-4 | 테스트 탭 클릭 시 변수 입력 폼 표시 | userEvent.click 테스트 탭 + getByTestId('test-panel') | must |
| 7 | AC-5 | 검색 입력 시 목록 필터링 | userEvent.type 검색어 + 행 수 변화 확인 | must |
| 8 | AC-5 | 카테고리 필터 선택 시 목록 필터링 | Select 변경 + 행 수 확인 | must |
| 9 | AC-6 | 삭제 버튼 클릭 시 확인 다이얼로그 표시 | userEvent.click + getByText('삭제') 확인 | must |
| 10 | AC-7 | 상태 배지가 올바른 색상으로 표시됨 | getAllByTestId('status-badge') 클래스 확인 | must |
| 11 | AC-8 | Mock 데이터 10건 이상 존재 | MOCK_TEMPLATES.length >= 10 | must |
| 12 | AC-8 | 각 템플릿에 2개 이상 버전 존재 | MOCK_TEMPLATES.every(t => t.versions.length >= 2) | must |
| 13 | AC-9 | 주요 엘리먼트에 data-testid 존재 | getByTestId 확인 | must |
| 14 | AC-11 | CRUD: 생성 시 목록에 추가됨 | 생성 후 행 수 증가 확인 | should |
| 15 | AC-11 | CRUD: 편집 시 내용 변경됨 | 편집 후 해당 행 내용 변경 확인 | should |
| 16 | AC-2 | 변수 {{var}} 자동 추출 | content에 {{name}} 입력 → 변수 표시 영역에 name 표시 | should |
| 17 | AC-5 | 상태 필터 선택 시 목록 필터링 | Select 변경 + 행 수 변화 확인 | should |
| 18 | — | smoke test: 렌더 에러 없음 | render(<PromptManagementView />) 에러 없이 완료 | must |
| 19 | AC-4 | 테스트 실행 버튼 클릭 시 모의 응답 표시 | userEvent.click + getByTestId('test-result') | should |
| 20 | AC-2 | 문자수 카운터 표시 | getByTestId('char-count') 텍스트 확인 | must |
