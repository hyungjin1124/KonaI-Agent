# QA Report: Artifact Panel (Split View)

## 판정: CONDITIONAL PASS

---

## Acceptance Criteria 검증

| # | Criteria | Dev 판정 | QA 판정 | 불일치 | 비고 |
|---|----------|---------|---------|--------|------|
| 1 | Props → ArtifactContext 리팩터링, 서브컴포넌트 3개+ | PASS | PASS | - | ArtifactPanelContext + 5 renderers + Header + TabBar = 8개 서브컴포넌트 |
| 2 | 탭 바에서 최대 8개 아티팩트 관리 | PASS | PASS | - | `MAX_TABS=8`, 초과 시 가장 오래된 비활성 탭 자동 제거 (Context:89-93) |
| 3 | 탭에 아이콘+제목(truncate)+닫기 | PASS | PASS | - | 9개 타입별 아이콘, `max-w-[180px] truncate`, X 닫기 버튼 |
| 4 | 키보드: Ctrl+Tab 탭 전환, Ctrl+W 탭 닫기 | PASS | PASS | - | Context:160-187 useEffect 키보드 리스너, metaKey(Mac) 지원 |
| 5 | 드래그 리사이즈 25%-70% | PASS | PARTIAL | ⚠️ | CoworkLayout `MIN_LEFT_PANEL_PERCENT=30`, `MIN_CENTER_PANEL_PERCENT=30` → 실제 범위 30%-70% (AC는 25%-70% 명시) |
| 6 | 전체화면 토글이 탭 보존 | PASS | PASS | - | `isMaximized`는 Context 독립 상태, tabs 배열에 영향 없음 |
| 7 | 아티팩트 생성 시 자동 탭 열기 | PASS | PASS | - | handleSend 내 openArtifactTab 호출 확인 |
| 8 | ArtifactsSection 클릭 → 탭 전환/열기 | PASS | PASS | - | handleArtifactSelectForPreview → openArtifactTab (기존 탭은 switchTab) |

- Dev 일치율: 87.5% (AC5 불일치)
- QA 독립 판정: 7/8 passed (1 PARTIAL)

### AC5 상세 분석

Dev는 "CoworkLayout 기존 구현 유지 (MIN=25%, MAX=70%)"로 PASS 판정했으나, 실제 코드 확인 결과:
- `CoworkLayout.tsx:25` — `MIN_LEFT_PANEL_PERCENT = 30` (25% 아님)
- `CoworkLayout.tsx:26` — `MIN_CENTER_PANEL_PERCENT = 30`
- `AgentChatView.tsx:94`에 `MIN_PANEL_WIDTH=25` 상수가 있으나 CoworkLayout에서 사용하지 않음
- 결과적으로 좌측 패널 최소 30%, 중앙 패널 최소 30%로 실제 리사이즈 범위는 30%-70%

**심각도: Minor** — 5% 차이이며, 30%가 실용적으로 더 적절할 수 있음. AC 명세와의 차이를 기록.

---

## 엣지 케이스 테스트

| # | 시나리오 | 결과 | 심각도 | 상세 |
|---|---------|------|--------|------|
| 1 | 빈 탭 상태 (tabs=[]) | PASS | - | `isPanelOpen = tabs.length > 0` → false, 키보드 리스너 비활성화 |
| 2 | MAX_TABS(8) 초과 시 탭 자동 제거 | PASS | - | 가장 오래된 비활성 탭 제거 후 새 탭 추가 |
| 3 | 동일 탭 재열기 | PASS | - | `existing` 탭 감지 시 활성화만 수행, 중복 생성 없음 |
| 4 | 긴 탭 제목 | PASS | - | `max-w-[180px] truncate` CSS로 처리, title attr에 전체 텍스트 |
| 5 | 마지막 탭 닫기 (closeTab) | PASS (부분) | major | 탭 자체는 올바르게 제거되고 `isPanelOpen=false`가 되나, AgentChatView의 centerPanelState/artifactPreview가 동기화되지 않음 (아래 UX 플로우 참조) |
| 6 | Ctrl+W로 모든 탭 순차 닫기 | PASS (부분) | major | 위와 동일한 동기화 문제 |
| 7 | isMaximized 상태에서 마지막 탭 닫기 | PASS | - | closeTab → isPanelOpen=false → 키보드 리스너 제거, isMaximized 상태 유지되나 패널 자체가 표시 안 됨 |
| 8 | 빠른 연속 탭 전환 (Ctrl+Tab 연타) | PASS | - | `setTabs` 내부의 `setActiveTabId`가 functional updater 사용하여 안전 |

- 추가 테스트 작성: 0개 (코드 리뷰 기반 정적 분석으로 대체)
- 통과: 6개, 부분 통과: 2개 (동기화 이슈)

---

## UX 플로우 검증

### 콜백 배선 감사

| # | Provider/Component | 콜백 Prop | 연결 상태 | 심각도 | 비고 |
|---|-------------------|-----------|----------|--------|------|
| 1 | ArtifactPanelProvider | `onPanelOpenChange` | ❌ 미연결 | Major | L1768, L1851 모두 미전달. plan.md 통합 지점에 명시됨 |
| 2 | ArtifactPanelProvider | `onActiveTabChange` | ❌ 미연결 | Major | L1768, L1851 모두 미전달. plan.md 통합 지점에 명시됨 |
| 3 | ArtifactPanelProvider | `documentData` | ✅ 연결 | - | |
| 4 | ArtifactPanelProvider | `csvContent` | ✅ 연결 | - | |
| 5 | ArtifactPanelProvider | `markdownContents` | ✅ 연결 | - | |
| 6 | ArtifactPanelProvider | `markdownEditingState` | ✅ 연결 | - | |
| 7 | ArtifactPanelBridge (ref) | `openArtifactTab` | ✅ 연결 | - | handleArtifactSelectForPreview에서 사용 |
| 8 | ArtifactPanelBridge (ref) | `openTab` | ✅ 연결 | - | Bridge에서 노출 |
| 9 | ArtifactPanelBridge (ref) | `closePanel` | ✅ 연결 | - | handleCloseCenterPanel에서 사용 |

- plan.md 통합 지점 대조: 7/9 연결 확인 (**2개 미연결: onPanelOpenChange, onActiveTabChange**)

### 미연결 콜백 영향 분석

`onPanelOpenChange`와 `onActiveTabChange`가 미연결됨으로 인해 발생하는 문제:

1. **개별 탭 닫기(X 버튼/Ctrl+W) → 마지막 탭 닫힘 시**: Context에서 `isPanelOpen=false`가 되지만 AgentChatView의 `centerPanelState.isOpen`은 여전히 `true` → CoworkLayout이 3-panel 모드를 유지하나 centerPanel 콘텐츠가 없어 빈 영역 발생
2. **전체 닫기(패널 접기 버튼)**: `handleCloseCenterPanel`이 3개 상태 시스템을 모두 리셋하므로 문제 없음
3. **탭 전환(클릭/Ctrl+Tab)**: Context 내부에서만 처리되므로 문제 없음

**결론**: "패널 접기" 버튼으로 닫으면 정상, 개별 탭 X 버튼으로 마지막 탭을 닫으면 레이아웃 깨짐.

### 이중 상태 동기화

| # | 상태 A | 상태 B | A→B 경로 | B→A 경로 | 결과 |
|---|--------|--------|---------|---------|------|
| 1 | Context `isPanelOpen` (=tabs.length>0) | `centerPanelState.isOpen` | `onPanelOpenChange` (미연결) | `handleCloseCenterPanel` → `closePanel()` | ⚠️ A→B 단방향 끊김 |
| 2 | Context `activeTab` | `artifactPreview.selectedArtifact` | `onActiveTabChange` (미연결) | `handleArtifactSelectForPreview` → `openArtifactTab` | ⚠️ A→B 단방향 끊김 |
| 3 | Context `isPanelOpen` | `artifactPreview.isOpen` | `onPanelOpenChange` (미연결) | `handleArtifactSelectForPreview` | ⚠️ A→B 단방향 끊김 |

모든 이중 상태 쌍에서 B→A (AgentChatView → Context) 경로는 정상이나, A→B (Context → AgentChatView) 경로가 `onPanelOpenChange`/`onActiveTabChange` 미연결로 끊겨 있음.

### 종료 상태 시나리오

| # | 시나리오 | 기대 동작 | 실제 동작 | 결과 | 심각도 |
|---|---------|----------|----------|------|--------|
| 1 | 패널 접기 버튼으로 닫기 | 3개 상태 리셋, 2-panel 복귀 | `handleCloseCenterPanel` → centerPanelState, artifactPreview, Context 모두 리셋 | PASS | - |
| 2 | 마지막 탭 X 버튼으로 닫기 | 패널 닫힘, 2-panel 복귀 | Context에서만 tabs=[] → centerPanelState.isOpen=true 유지 → 빈 중앙 패널 | FAIL | Major |
| 3 | Ctrl+W로 마지막 탭 닫기 | 패널 닫힘, 2-panel 복귀 | 시나리오 2와 동일 | FAIL | Major |

### 핵심 사용자 플로우

#### Flow 1: 사이드바에서 아티팩트 클릭 → 탭 열기 → 닫기

```
[사이드바 아티팩트 클릭]
  → handleArtifactSelectForPreview
  → artifactPanelRef.openArtifactTab(artifact, previewType) ← Context 탭 추가
  → setCenterPanelState({ isOpen: true, content })        ← AgentChatView 상태 동기화
  → setArtifactPreview({ isOpen: true, ... })              ← AgentChatView 상태 동기화
  → CoworkLayout isCenterPanelOpen=true → 3-panel 모드
  → [정상 표시]

[패널 접기 버튼 클릭]
  → handleCloseCenterPanel
  → setCenterPanelState({ isOpen: false })                 ← AgentChatView 리셋
  → setArtifactPreview({ isOpen: false })                  ← AgentChatView 리셋
  → artifactPanelRef.closePanel()                          ← Context 리셋
  → CoworkLayout isCenterPanelOpen=false → 2-panel 모드
```
기대: 정상 닫힘 → 2-panel 복귀
결과: **PASS**

#### Flow 2: 사이드바에서 아티팩트 클릭 → 탭 X 버튼으로 마지막 탭 닫기

```
[사이드바 아티팩트 클릭] → (Flow 1과 동일하게 열림)

[탭 X 버튼 클릭]
  → ArtifactTabBar onCloseTab(tabId)
  → ArtifactPreviewPanel onCloseTab → Context closeTab(tabId)
  → Context: tabs=[] → isPanelOpen=false
  → Context: onPanelOpenChangeRef.current?.(false) ← ⚠️ 미연결 (undefined)
  → AgentChatView: centerPanelState.isOpen = true (변경 안 됨!)
  → CoworkLayout: isCenterPanelOpen = centerPanelState.isOpen = true
  → CoworkLayout: centerPanel 콘텐츠 = ArtifactPreviewPanel (Context tabs=[])
  → ArtifactPreviewPanel: tabs.length===0 → 빈 패널 렌더링
  → [빈 중앙 패널 표시, 좌측 패널 축소된 상태 유지]
```
기대: 패널 닫힘 → 2-panel 복귀
결과: **FAIL** — 빈 중앙 패널이 남아 레이아웃 깨짐

#### Flow 3: 여러 탭 열고 → Ctrl+W로 전부 닫기

```
[여러 아티팩트 클릭으로 다중 탭 생성]
[Ctrl+W 반복]
  → Context closeTab → 탭 하나씩 제거
  → 마지막 탭 닫힐 때 → Flow 2와 동일한 문제 발생
```
기대: 마지막 탭 닫히면 패널 닫힘
결과: **FAIL** — Flow 2와 동일

- 플로우 테스트 작성: 0개 (코드 리뷰 기반 정적 분석으로 대체)
- 통과: 1개, 실패: 2개

---

## 통합 테스트

- 컴포넌트 통합: PASS (ArtifactsSection, CoworkLayout, DocumentViewer 연결 확인)
- 빌드 통합: PASS (`next build` 성공)
- 타입 호환성: PASS (`tsc --noEmit` — artifact_panel 파일에 신규 에러 없음)

---

## 접근성 검증

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | ARIA 속성 — 탭 닫기 버튼 | PASS | `aria-label="{title} 탭 닫기"` 적용 (ArtifactTabBar:85) |
| 2 | ARIA 속성 — 탭 바 구조 | FAIL | `role="tablist"` 미적용. 탭 컨테이너가 일반 `<div>`. WAI-ARIA Tabs 패턴 미준수 |
| 3 | ARIA 속성 — 개별 탭 | FAIL | `role="tab"`, `aria-selected` 미적용. `<button>`으로만 구현 |
| 4 | ARIA 속성 — 탭 패널 | FAIL | `role="tabpanel"`, `aria-labelledby` 미적용 |
| 5 | ARIA 속성 — 헤더 액션 버튼 | WARN | `title` 속성만 사용, `aria-label` 미적용 (다운로드, 최대화, 패널 접기) |
| 6 | 키보드 접근성 — Ctrl+Tab/W | PASS | Context에서 전역 키보드 리스너로 구현 |
| 7 | 키보드 접근성 — 탭 닫기 | PASS | `<span role="button" tabIndex={0}>` + Enter/Space onKeyDown |
| 8 | 키보드 접근성 — Arrow 네비게이션 | FAIL | WAI-ARIA Tabs 패턴은 Arrow Left/Right로 탭 전환 요구, 미구현 |
| 9 | 포커스 관리 — 포커스 인디케이터 | FAIL | `focus-visible` 스타일 미적용. 탭 버튼, 닫기 버튼, 헤더 버튼 모두 브라우저 기본 아웃라인만 의존 |
| 10 | 포커스 관리 — 최대화 시 포커스 트랩 | WARN | 전체화면 모드에서 포커스 트랩 없음 (Tab 키로 패널 외부 요소에 접근 가능) |
| 11 | 색상 대비 | PASS | Tailwind 기본 컬러 사용, 충분한 대비 |
| 12 | 스크린리더 구조 | FAIL | 탭 목적/관계를 전달하는 시맨틱 구조 부재 |

---

## 발견된 이슈

### 심각도: Critical (배포 차단)
- (없음)

### 심각도: Major (수정 강력 권고)
- [ ] **[M1] onPanelOpenChange/onActiveTabChange 미연결** — `AgentChatView.tsx:1768,1851` ArtifactPanelProvider에 두 콜백 미전달. plan.md 통합 지점에 명시되었으나 미구현. 마지막 탭 개별 닫기 시 빈 중앙 패널 잔류.
- [ ] **[M2] WAI-ARIA Tabs 패턴 미적용** — `ArtifactTabBar.tsx:46` 탭 바에 `role="tablist"`, 개별 탭에 `role="tab"` + `aria-selected`, 패널에 `role="tabpanel"` 미적용. 스크린리더 사용자에게 탭 인터페이스로 인식 불가.
- [ ] **[M3] 포커스 인디케이터 미적용** — `ArtifactTabBar.tsx:53`, `ArtifactPanelHeader.tsx:43,49,60` 모든 인터랙티브 요소에 `focus-visible:ring` 스타일 없음. 키보드 사용자가 현재 포커스 위치 파악 불가.

### 심각도: Minor (후속 수정 가능)
- [ ] **[m1] AC5 리사이즈 범위 불일치** — `CoworkLayout.tsx:25` `MIN_LEFT_PANEL_PERCENT=30` (AC 명세: 25%). 실용적 차이 미미하나 명세와 불일치.
- [ ] **[m2] 헤더 버튼 aria-label 누락** — `ArtifactPanelHeader.tsx:43-66` 다운로드/최대화/패널 접기 버튼에 `title`만 있고 `aria-label` 없음. 일부 스크린리더에서 접근성 저하.
- [ ] **[m3] Arrow 키 탭 네비게이션 미구현** — WAI-ARIA Tabs 패턴은 Arrow Left/Right로 탭 전환 권장. 현재 Ctrl+Tab만 지원.

---

## 수정 요청

CONDITIONAL PASS — 배포는 가능하나 다음 이슈 수정 강력 권고:

| # | 수정 항목 | 관련 파일 | 심각도 | 설명 |
|---|----------|----------|--------|------|
| 1 | onPanelOpenChange/onActiveTabChange 연결 | `AgentChatView.tsx` | Major | ArtifactPanelProvider에 두 콜백을 전달하여 마지막 탭 닫기 시 centerPanelState/artifactPreview 자동 동기화. 구현은 간단: `onPanelOpenChange={(isOpen) => { if (!isOpen) handleCloseCenterPanel(); }}` 패턴 |
| 2 | WAI-ARIA Tabs 패턴 적용 | `ArtifactTabBar.tsx`, `ArtifactPreviewPanel.tsx` | Major | 탭 바에 `role="tablist"`, 탭에 `role="tab"` + `aria-selected`, 패널에 `role="tabpanel"` + `aria-labelledby` 추가 |
| 3 | 포커스 인디케이터 추가 | `ArtifactTabBar.tsx`, `ArtifactPanelHeader.tsx` | Major | 모든 인터랙티브 요소에 `focus-visible:ring-2 focus-visible:ring-orange-500` 등 추가 |
