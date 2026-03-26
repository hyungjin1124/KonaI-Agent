# Plan: Artifact Panel Phase 2 — 아티팩트 라이브러리 + 버전 히스토리

## 개요

Phase 1 완료(탭 관리, Context 기반 상태, 6개 렌더러, 키보드 내비게이션) 위에 Phase 2를 구현한다:
- ArtifactLibraryContext (자동 저장 + 유형 필터 + 검색 + 정렬)
- 버전 히스토리 (생성/수정 추적, 복원)
- 채팅↔아티팩트 양방향 링크
- ArtifactsSection "현재 대화" / "라이브러리" 탭 전환
- ArtifactPanelHeader 버전 히스토리 버튼

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `context/ArtifactLibraryContext.tsx` | 라이브러리 상태 관리 (저장/삭제/필터/버전/즐겨찾기) | 신규 |
| `types.ts` | LibraryArtifact, ArtifactVersion, ArtifactFilter 타입 추가 | 수정 |
| `components/RightSidebar/ArtifactsSection.tsx` | "현재 대화" / "라이브러리" 탭 + 필터/검색 UI | 수정 |
| `components/ArtifactPreviewPanel/ArtifactPanelHeader.tsx` | 버전 히스토리 버튼 추가 | 수정 |
| `components/ArtifactPreviewPanel/VersionHistoryPanel.tsx` | 버전 목록 + 복원 UI | 신규 |
| `components/ArtifactPreviewPanel/ArtifactPreviewPanel.tsx` | 버전 히스토리 패널 통합 | 수정 |
| `AgentChatView.tsx` | ArtifactLibraryProvider 감싸기, 자동 저장 연동 | 수정 |

## Props Interface

```typescript
// 라이브러리 아티팩트 (영속 저장용)
interface LibraryArtifact extends Artifact {
  conversationId: string;
  savedAt: Date;
  updatedAt: Date;
  versionCount: number;
  isFavorited: boolean;
  tags: string[];
}

// 아티팩트 버전
interface ArtifactVersion {
  id: string;
  artifactId: string;
  versionNumber: number;
  content: string;
  label?: string;
  createdAt: Date;
}

// 필터 옵션
interface ArtifactFilter {
  types?: ArtifactType[];
  searchQuery?: string;
  favoritesOnly?: boolean;
  sortBy?: 'date' | 'name' | 'type';
  sortDirection?: 'asc' | 'desc';
}
```

## 상태 설계

### ArtifactLibraryContext (신규)
- `libraryArtifacts: LibraryArtifact[]` — 전체 라이브러리
- `filteredArtifacts: LibraryArtifact[]` — 필터 적용 결과 (computed)
- `filter: ArtifactFilter` — 현재 필터
- `versions: Record<string, ArtifactVersion[]>` — 아티팩트별 버전
- Actions: saveArtifact, deleteArtifact, toggleFavorite, setFilter, saveVersion, restoreVersion, getVersions, getArtifactsByConversation, getArtifactByMessageId
- localStorage 영속화 (데모 단계)

### ArtifactPanelContext (변경 없음)
- 기존 탭 관리 UI 상태 유지

## 통합 지점

1. `AgentChatView` → `ArtifactLibraryProvider` 감싸기 (ArtifactPanelProvider 바깥)
2. 아티팩트 생성 시 `saveArtifact()` 호출 (자동 저장)
3. `ArtifactsSection` → useArtifactLibrary() 사용하여 라이브러리 뷰 렌더링
4. `ArtifactPanelHeader` → 버전 히스토리 토글 버튼 추가
5. `ArtifactPreviewPanel` → VersionHistoryPanel 사이드 패널

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | ArtifactsSection "현재 대화"/"라이브러리" 탭 전환 | ArtifactsSection |
| 2 | 에이전트 생성 아티팩트 자동 저장 | AgentChatView → saveArtifact |
| 3 | 유형별 필터링 (최소 4종) | ArtifactLibraryContext + ArtifactsSection |
| 4 | 라이브러리 내 키워드 검색 | ArtifactLibraryContext |
| 5 | 아티팩트별 버전 히스토리 | ArtifactLibraryContext + VersionHistoryPanel |
| 6 | 마크다운 아티팩트 이전 버전 복원 | restoreVersion() |
| 7 | 아티팩트 클릭 → 관련 채팅 스크롤 (양방향 링크) | ArtifactsSection → messageId 기반 |
| 8 | 채팅 메시지에서 아티팩트 빠른 접근 | 기존 openTab 활용 |
| 9 | 대화 삭제 시 아티팩트 유지 | 대화 독립 생명주기 |
| 10 | Breadcrumb: 타입 > 파일명 > 버전 | VersionHistoryPanel |

## 테스트 시나리오

| # | AC | 시나리오 | 테스트 방법 | 우선순위 |
|---|-----|---------|-----------|---------|
| 1 | AC-2 | saveArtifact 호출 → libraryArtifacts에 추가됨 | renderHook + act | must |
| 2 | AC-3 | setFilter({ types: ['markdown'] }) → markdown만 반환 | renderHook + act | must |
| 3 | AC-4 | setFilter({ searchQuery: '매출' }) → 제목 매칭 | renderHook + act | must |
| 4 | AC-5 | saveVersion → getVersions 배열 증가 | renderHook + act | must |
| 5 | AC-6 | restoreVersion → 새 버전 생성 + 내용 복원 | renderHook + act | must |
| 6 | AC-9 | 대화별 아티팩트 격리 조회 | getArtifactsByConversation | must |
| 7 | AC-1 | 탭 전환 UI 렌더링 | RTL render + userEvent | should |
| 8 | AC-7 | messageId 기반 양방향 링크 | getArtifactByMessageId | should |
| 9 | AC-10 | 즐겨찾기 토글 + 필터 | toggleFavorite + setFilter | should |
