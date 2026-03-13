# Plan: Knowledge Base Management

## 파일 구조
| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| src/components/features/knowledge-base/knowledgeBaseData.ts | 타입, Mock 데이터, 헬퍼 | 신규 |
| src/components/features/knowledge-base/KnowledgeBaseView.tsx | 메인 컴포넌트 | 신규 |
| src/components/features/knowledge-base/KnowledgeBaseView.test.tsx | 단위 테스트 | 신규 |
| src/components/features/knowledge-base/index.ts | Barrel export | 신규 |
| src/components/AdminView.tsx | 6번째 탭 추가 | 수정 |

## 상태 설계
- `collections`: KnowledgeCollection[] (MOCK_COLLECTIONS 초기값)
- `selectedCollectionId`: string | null (null = 그리드 뷰)
- `searchQuery`: string (문서 검색)
- `typeFilter`: string (파일 타입 필터)
- `isUploadOpen`: boolean (업로드 다이얼로그)
- `isDragging`: boolean (드래그 앤 드롭 상태)

## UI 구조
1. **Collection Grid View** (selectedCollection === null)
   - 3열 요약 바 (컬렉션 수, 총 문서, 총 용량)
   - 2열 컬렉션 카드 그리드
   - 각 카드: 아이콘, 이름, 설명, 문서 수, 용량, 접근 레벨

2. **Document List View** (selectedCollection !== null)
   - 헤더: 뒤로가기 + 컬렉션 정보 + 상태/접근 배지
   - 툴바: 검색 + 타입 필터 + 업로드 버튼
   - 문서 테이블: 파일명, 타입, 크기, 업로드일, 상태
   - 푸터: 문서 수 + 총 용량

3. **Upload Dialog**
   - 드래그 앤 드롭 영역
   - 파일 선택 버튼
   - 지원 형식 안내

## Acceptance Criteria 매핑
| # | Criteria | 구현 위치 |
|---|----------|-----------|
| AC-1 | 컬렉션 그리드 오버뷰 | KnowledgeBaseView.tsx: Collection Grid View |
| AC-2 | 컬렉션별 문서 목록 | KnowledgeBaseView.tsx: Document List View |
| AC-3 | 문서 업로드 UI | KnowledgeBaseView.tsx: Upload Dialog |
| AC-4 | 문서 검색 + 타입 필터 | KnowledgeBaseView.tsx: Toolbar |
| AC-5 | 문서 상태 표시 | StatusBadge 서브컴포넌트 |
| AC-6 | 접근 레벨 표시 | AccessBadge 서브컴포넌트 |
| AC-7 | 컬렉션 상태 배지 | CollectionStatusBadge 서브컴포넌트 |
| AC-8 | 요약 통계 | Summary Bar (3열 그리드) |
| AC-9 | 뒤로가기 네비게이션 | handleBack + ArrowLeft 버튼 |
| AC-10 | data-testid 접근성 | 주요 요소 7+ testid |
| AC-11 | Mock 데이터 + useState | knowledgeBaseData.ts + useState |
