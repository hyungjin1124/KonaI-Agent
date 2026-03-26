# Plan: Artifact Panel Phase 2 — 아티팩트 라이브러리 + 버전 히스토리

## 개요

Phase 1 완료(탭 관리, Context 상태, 키보드 내비게이션, 6개 렌더러) 기반 위에 Phase 2를 구현한다:
- **아티팩트 라이브러리**: 자동 저장 + 유형 필터 + 키워드 검색 + 대화 독립 생명주기
- **버전 히스토리**: 아티팩트별 버전 추적 + 마크다운 diff + 복원
- **양방향 링크**: 아티팩트↔채팅 메시지 상호 내비게이션
- **Breadcrumb**: 타입 > 파일명 > 버전

## 핵심 설계 결정

1. **별도 ArtifactLibraryContext**: 기존 ArtifactPanelContext(UI 상태)와 분리. 영속 데이터(저장된 아티팩트, 버전)를 관리
2. **데모 단계 스토리지**: localStorage + in-memory (프로덕션에서 백엔드 전환)
3. **기존 UI 재활용**: InlineDiffViewer(skill-management), Badge, ScrollArea 등

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `src/types/artifact-library.types.ts` | Library 전용 타입 | 신규 |
| `src/components/features/agent-chat/context/ArtifactLibraryContext.tsx` | Library 상태 관리 (영속 데이터) | 신규 |
| `src/components/features/agent-chat/hooks/useArtifactLibrary.ts` | Library 유틸리티 Hook (검색, 필터) | 신규 |
| `src/components/features/agent-chat/components/ArtifactLibrary/ArtifactLibraryPanel.tsx` | 라이브러리 메인 패널 (필터+목록+검색) | 신규 |
| `src/components/features/agent-chat/components/ArtifactLibrary/ArtifactLibraryCard.tsx` | 개별 아티팩트 카드 | 신규 |
| `src/components/features/agent-chat/components/ArtifactLibrary/ArtifactVersionHistory.tsx` | 버전 히스토리 사이드패널 | 신규 |
| `src/components/features/agent-chat/components/ArtifactLibrary/ArtifactBreadcrumb.tsx` | 타입>파일명>버전 Breadcrumb | 신규 |
| `src/components/features/agent-chat/components/RightSidebar/ArtifactsSection.tsx` | "현재 대화"/"라이브러리" 탭 전환 추가 | 수정 |
| `src/components/features/agent-chat/components/ArtifactPreviewPanel/ArtifactPanelHeader.tsx` | 버전 히스토리 버튼 + Breadcrumb 추가 | 수정 |
| `src/components/features/agent-chat/components/ArtifactPreviewPanel/ArtifactPreviewPanel.tsx` | 버전 히스토리 사이드패널 통합 | 수정 |
| `src/components/features/agent-chat/types.ts` | Artifact 인터페이스 확장 (Phase 2 필드) | 수정 |

## Props Interface

### 신규 타입 (artifact-library.types.ts)

```typescript
// 라이브러리 아티팩트 (Artifact 확장)
export interface LibraryArtifact {
  id: string;
  title: string;
  type: ArtifactType;
  createdAt: Date;
  updatedAt: Date;
  messageId: string;
  conversationId: string;
  fileSize?: string;
  // Phase 2 확장
  isFavorited: boolean;
  tags: string[];
  versionCount: number;
  lastAccessedAt: Date;
}

// 버전 항목
export interface ArtifactVersion {
  id: string;
  artifactId: string;
  versionNumber: number;
  content: string; // 마크다운 텍스트 또는 직렬화 가능한 콘텐츠
  createdAt: Date;
  messageId?: string;
  changeDescription?: string;
}

// 필터 상태
export interface ArtifactFilter {
  types: ArtifactType[];
  searchQuery: string;
  sortBy: 'created' | 'modified' | 'name' | 'accessed';
  sortDirection: 'asc' | 'desc';
  favoritesOnly: boolean;
}

// Library Context 값
export interface ArtifactLibraryContextValue {
  // 데이터
  libraryArtifacts: LibraryArtifact[];
  versions: Record<string, ArtifactVersion[]>; // artifactId → versions
  // 필터
  filter: ArtifactFilter;
  setFilter: (filter: Partial<ArtifactFilter>) => void;
  filteredArtifacts: LibraryArtifact[];
  // 액션
  saveArtifact: (artifact: Artifact, content?: string, conversationId?: string) => void;
  deleteArtifact: (artifactId: string) => void;
  toggleFavorite: (artifactId: string) => void;
  // 버전
  saveVersion: (artifactId: string, content: string, changeDescription?: string) => void;
  restoreVersion: (artifactId: string, versionId: string) => void;
  getVersions: (artifactId: string) => ArtifactVersion[];
  // 링크
  getArtifactsByConversation: (conversationId: string) => LibraryArtifact[];
  getArtifactByMessageId: (messageId: string) => LibraryArtifact | undefined;
}
```

## 상태 설계

### ArtifactLibraryContext (영속 데이터)
- `libraryArtifacts: LibraryArtifact[]` — 저장된 모든 아티팩트
- `versions: Record<string, ArtifactVersion[]>` — 버전 히스토리
- `filter: ArtifactFilter` — 현재 필터/검색 상태
- localStorage 동기화: `useEffect`로 상태 변경 시 자동 저장

### ArtifactPanelContext (기존 유지)
- UI 상태 (탭, 활성 탭, 최대화)는 변경 없음
- 새 기능: 버전 히스토리 패널 열림/닫힘 상태만 추가

## 통합 지점

### 1. ArtifactsSection → 탭 전환
- "현재 대화" 탭: 기존 artifacts[] 목록 (변경 없음)
- "라이브러리" 탭: ArtifactLibraryPanel 표시

### 2. 자동 저장 트리거
- AgentChatView에서 아티팩트 생성 시 `saveArtifact()` 호출
- 마크다운 편집 완료 시 `saveVersion()` 호출

### 3. 양방향 링크
- 아티팩트 카드 클릭 → `onScrollToMessage(messageId)` 콜백
- 채팅 메시지의 아티팩트 참조 → `openArtifactTab()` 호출

### 4. ArtifactPanelHeader 확장
- Breadcrumb: 타입 아이콘 + "파일명" + 버전 표시
- 버전 히스토리 토글 버튼 (History 아이콘)

### 5. Provider 계층
```
<ArtifactLibraryProvider>
  <ArtifactPanelProvider>
    {/* 기존 UI */}
  </ArtifactPanelProvider>
</ArtifactLibraryProvider>
```

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | "현재 대화"/"라이브러리" 탭 전환 UI | ArtifactsSection.tsx (탭 헤더 추가) |
| 2 | 자동 저장 메커니즘 | ArtifactLibraryContext.saveArtifact() |
| 3 | 유형별 필터링 (4종+) | ArtifactLibraryPanel → filter.types |
| 4 | 키워드 검색 | ArtifactLibraryPanel → filter.searchQuery |
| 5 | 버전 히스토리 | ArtifactVersionHistory + versions state |
| 6 | 이전 버전 복원 | ArtifactLibraryContext.restoreVersion() |
| 7 | 아티팩트→채팅 스크롤 | ArtifactLibraryCard.onScrollToMessage |
| 8 | 채팅→아티팩트 접근 | 메시지 내 아티팩트 링크 아이콘 |
| 9 | 대화 삭제 시 아티팩트 유지 | Library 독립 저장 (localStorage) |
| 10 | Breadcrumb | ArtifactBreadcrumb.tsx |

## 테스트 시나리오

| # | AC | 시나리오 | 테스트 방법 | 우선순위 |
|---|-----|---------|-----------|---------|
| 1 | AC1 | 탭 클릭 시 "현재 대화"↔"라이브러리" 전환 | RTL render + click + assert visibility | must |
| 2 | AC2 | 아티팩트 생성 시 라이브러리에 자동 저장 확인 | saveArtifact 호출 후 libraryArtifacts에 존재 확인 | must |
| 3 | AC3 | 유형 필터 선택 시 해당 타입만 표시 | setFilter({types: ['pdf']}) → filteredArtifacts 검증 | must |
| 4 | AC4 | 검색어 입력 시 제목 매칭 필터링 | setFilter({searchQuery: 'test'}) → 결과 검증 | must |
| 5 | AC5 | 버전 히스토리에 버전 목록 표시 | saveVersion 2회 후 getVersions 개수 확인 | must |
| 6 | AC6 | 이전 버전 복원 시 콘텐츠 변경 | restoreVersion 후 현재 콘텐츠 확인 | must |
| 7 | AC7 | 아티팩트 카드 클릭 시 onScrollToMessage 호출 | RTL click + callback mock 검증 | should |
| 8 | AC9 | localStorage에 저장 후 Context 재생성 시 데이터 유지 | JSON.parse(localStorage) 검증 | must |
| 9 | AC10 | Breadcrumb에 타입 아이콘 + 제목 표시 | RTL render + text content 검증 | should |
| 10 | - | 빈 라이브러리 상태 안내 메시지 표시 | 빈 배열로 렌더링 시 안내 메시지 확인 | should |
