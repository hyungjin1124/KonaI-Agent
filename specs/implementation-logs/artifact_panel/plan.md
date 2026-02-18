# Plan: Artifact Panel (Split View) — Updated

## 개요

Phase 1 구현: 기존 `ArtifactPreviewPanel`(50+ props)을 `ArtifactPanelContext` 기반 탭 관리 시스템으로 리팩터링. 이미 작성된 Context/Header/TabBar/Renderers 파일을 AgentChatView에 통합하고, 렌더러 Registry 패턴을 완성한다.

## 핵심 변경 사항

### 이미 존재하는 파일 (수정만 필요)
- `context/ArtifactPanelContext.tsx` — 탭별 데이터(documentData, csvContent, markdownContents, ppt/dashboard/outline props) 관리 추가
- `ArtifactPanelHeader.tsx` — 완성됨, 통합만 필요
- `ArtifactTabBar.tsx` — 완성됨, 통합만 필요
- `renderers/DocumentRenderer.tsx` — 완성됨
- `renderers/PPTRenderer.tsx` — 완성됨
- `renderers/DashboardRenderer.tsx` — 완성됨
- `renderers/MarkdownRenderer.tsx` — 완성됨

### 새로 생성할 파일
- `renderers/SlideOutlineRenderer.tsx` — 슬라이드 개요 편집기 렌더러 분리
- `renderers/index.ts` — 렌더러 Registry

### 주요 수정 파일
- `ArtifactPreviewPanel.tsx` — Context 기반으로 리팩터링, Header 교체, 렌더러 Registry 사용
- `AgentChatView.tsx` — ArtifactPanelProvider 감싸기, openTab/closeTab 전환, props 대폭 축소
- `ArtifactsSection.tsx` — openTab 호출로 전환

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `context/ArtifactPanelContext.tsx` | 탭 상태 + 타입별 데이터 관리 | 수정 |
| `renderers/SlideOutlineRenderer.tsx` | 슬라이드 개요 렌더러 | 신규 |
| `renderers/index.ts` | 렌더러 Registry (previewType → component) | 신규 |
| `ArtifactPreviewPanel.tsx` | Context 기반 리팩터링 | 수정 |
| `AgentChatView.tsx` | Provider 통합, props 축소 | 수정 |
| `ArtifactsSection.tsx` | openTab 연동 | 수정 |

## 상태 설계

### ArtifactPanelContext 확장 (탭별 데이터)

```typescript
interface ArtifactPanelContextValue {
  // 기존 (변경 없음)
  tabs: ArtifactTab[];
  activeTabId: string | null;
  openTab: (tab: ArtifactTab) => void;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  isMaximized: boolean;
  toggleMaximize: () => void;
  isPanelOpen: boolean;
  closePanel: () => void;

  // 추가: 탭별 데이터 (AgentChatView에서 주입)
  documentData?: ArrayBuffer;
  csvContent?: string;
  markdownContents: Record<string, string>;
  markdownEditingState: 'idle' | 'editing' | 'shimmer';
}
```

### AgentChatView 변경 요약
1. `<ArtifactPanelProvider>` 감싸기
2. `artifactPreview` + `centerPanelState` → Context의 `openTab`/`closeTab`으로 대체
3. `handleArtifactSelectForPreview` → Context `openTab` 호출
4. ArtifactPreviewPanel에 50+ props 전달 → Context에서 읽기

## 통합 지점

### AgentChatView → ArtifactPanelProvider
- onPanelOpenChange: side panel auto-hide/restore 연동
- onActiveTabChange: 활성 탭 변경 시 데이터 동기화

### ArtifactsSection → Context
- onSelect → useArtifactPanel().openTab() 호출

### PPTScenarioRenderer → Context (간접)
- 시나리오에서 setCenterPanelState → openTab 호출로 전환

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | props를 ArtifactContext로 리팩터링, 서브컴포넌트 3개+ | Context + 5개 렌더러 + Header |
| 2 | 탭 바에서 최대 8개 아티팩트 관리 | ArtifactPanelContext (MAX_TABS=8) |
| 3 | 탭에 아이콘+제목(truncate)+닫기 | ArtifactTabBar |
| 4 | 키보드: Ctrl+Tab, Ctrl+W | ArtifactPanelContext useEffect |
| 5 | 드래그 리사이즈 25%-70% | CoworkLayout 기존 유지 |
| 6 | 전체화면 토글이 탭 보존 | Context isMaximized |
| 7 | 아티팩트 생성 시 자동 탭 열기 | AgentChatView → openTab |
| 8 | ArtifactsSection 클릭 → 탭 전환/열기 | ArtifactsSection → openTab |
