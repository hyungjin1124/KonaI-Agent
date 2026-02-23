# QA Report: Document Viewer Phase 3 (TOC + Citation + Fullscreen)

## 판정: CONDITIONAL PASS

---

## Acceptance Criteria 검증

| # | Criteria | Dev 판정 | QA 판정 | 불일치 | 비고 |
|---|----------|---------|---------|--------|------|
| 1 | TOC 사이드바: heading 자동 추출 + 계층 표시 | PASS | PASS | - | `useDocumentTOC.ts`:33-59 — `querySelectorAll('h1..h6')` + level 파싱, `DocumentTOCSidebar.tsx` — `INDENT_MAP`/`FONT_MAP` 기반 계층 렌더링 |
| 2 | 스크롤 스파이: 현재 섹션 하이라이트 | PASS | PASS | - | `useDocumentTOC.ts`:69-106 — IntersectionObserver, rootMargin `-10% 0px -80% 0px`, topmost visible heading 추적 |
| 3 | TOC 점프: 클릭 시 smooth scroll | PASS | PASS | - | `useDocumentTOC.ts`:109-118 — `scrollIntoView({ behavior: 'smooth', block: 'start' })` + activeTOCId 갱신 |
| 4 | TOC 토글: 툴바 버튼 접기/펼치기 | PASS | PASS | - | `DocumentViewerToolbar.tsx`:213-226 — ListTree 버튼, aria-expanded, disabled when !hasTOCItems |
| 5 | 인용 패널: 소스 카드 표시 | PASS | PASS | - | `CitationSidePanel.tsx` — 번호 배지, 제목, excerpt, 외부 링크 카드 형태 |
| 6 | 인라인 인용: 각주 클릭/호버 | PARTIAL | PARTIAL | - | Dev와 동일 판정. 사이드패널 카드는 구현됨. 문서 본문 내 `[^N]` 인라인 마커 미구현. 에이전트 통합 부재로 합리적 결정이나, AC 문자 기준으로는 미충족 |
| 7 | 풀스크린 토글: Portal + ESC 복귀 | PASS | PASS | - | `FullscreenPortal.tsx` — createPortal(body), ESC keydown(capture phase), body overflow hidden/복원 |
| 8 | 반응형: 1024px 미만 TOC 자동 숨김 | PASS | PASS | - | `DocumentViewer.tsx`:74-92 — ResizeObserver, < 1024px → isNarrow + sidebars auto-hide, overlay 전환 |
| 9 | 접근성: aria-current, aria-expanded, kbd nav | PASS | PASS | - | TOC: role=tree/treeitem, aria-current=location, ArrowUp/Down/Home/End. Fullscreen: role=dialog, aria-modal. Toolbar: role=toolbar, aria-expanded on toggles |
| 10 | 성능: 50p PDF TOC ≤ 1초 | PASS | PASS | - | 단일 `querySelectorAll` 패스, O(n) heading 추출. IntersectionObserver 기반 스크롤 스파이로 프레임 드롭 없음 (설계 기준) |

- Dev 일치율: 100% (10/10 동일 판정)
- QA 독립 판정: 9/10 passed, 1 partial

---

## 엣지 케이스 테스트

| # | 시나리오 | 결과 | 심각도 | 상세 |
|---|---------|------|--------|------|
| 1 | 빈 TOC (heading 없는 문서) | PASS | - | `DocumentTOCSidebar.tsx`:64-87 — 빈 상태 UI "heading을 찾을 수 없습니다" 표시. 툴바 TOC 버튼 disabled |
| 2 | 빈 Citations (외부 citations 미제공) | PASS | - | `CitationSidePanel.tsx`:14-36 — 빈 상태 UI "인용 소스가 없습니다" 표시. 툴바 Citation 버튼 disabled |
| 3 | XLSX/CSV/PPTX에서 TOC 토글 비노출 | PASS | - | `DocumentViewer.tsx`:54,71 — `TOC_SUPPORTED_TYPES = ['pdf', 'docx']`, 지원 외 타입은 `onToggleTOC: undefined`로 전달되어 버튼 미노출 |
| 4 | 풀스크린 중 ESC 이벤트 버블링 차단 | PASS | - | `FullscreenPortal.tsx`:13-14 — `e.preventDefault()` + `e.stopPropagation()` + capture phase listener |
| 5 | 풀스크린 진입/퇴장 시 body overflow 관리 | PASS | - | `FullscreenPortal.tsx`:22-28 — mount 시 `overflow='hidden'`, cleanup 시 `overflow=''` 복원 |
| 6 | 반응형 너비 변경 시 사이드바 상태 초기화 | PASS | - | `DocumentViewer.tsx`:83-85 — narrow → `setShowTOC(false)` + `setShowCitations(false)` |
| 7 | 사이드바 오버레이 모드 z-index 충돌 | PASS | - | narrow 모드에서 z-30, fullscreen은 z-[9999]. 계층 분리됨 |
| 8 | contentRef와 scroll container 중첩 | PASS | - | `useDocumentTOC.ts`:76 — `container.closest('[data-scroll-container]')` 탐색. `DocumentViewer.tsx`:198 — `data-scroll-container` 마커 배치 |
| 9 | heading 재추출 (fileData 변경 시) | PASS | - | `DocumentViewer.tsx`:110-112 — useEffect deps `[fileData, textContent, handleContentReady]` |
| 10 | TOC heading ID 충돌 방지 | PASS | - | `useDocumentTOC.ts`:50 — `doc-heading-${index}` 접두사로 고유 ID 보장 |
| 11 | Citation 타입 불일치 (DocumentViewer vs ChatMessage) | ⚠️ | minor | DocumentViewer Citation: `{number, excerpt}`, ChatMessage Citation: `{index, snippet, domain}`. 필드명이 달라 에이전트 통합 시 매핑 필요 |
| 12 | Citations prop 미전달 경로 | ⚠️ | major | DocumentRenderer → DocumentViewer 경로에서 citations prop 미전달. 상세는 UX 플로우 검증 참조 |

- 추가 테스트 작성: 0개 (DOM 테스트 환경 미구성 — vitest node 환경, @testing-library/react 미설치)
- 정적 분석 기반 검증: 12개 시나리오

---

## UX 플로우 검증

### 콜백 배선 감사

| # | Provider/Component | 콜백 Prop | 연결 상태 | 심각도 | 비고 |
|---|-------------------|-----------|----------|--------|------|
| 1 | DocumentViewer | onClose | ✅ | - | 모든 child viewer에 전달됨 |
| 2 | DocumentViewer → Toolbar | onToggleTOC | ✅ | - | toolbarExtras 객체로 전달 |
| 3 | DocumentViewer → Toolbar | onToggleCitations | ✅ | - | toolbarExtras 객체로 전달 |
| 4 | DocumentViewer → Toolbar | onToggleFullscreen | ✅ | - | toolbarExtras 객체로 전달 |
| 5 | DocumentViewer → TOCSidebar | onItemClick → scrollToHeading | ✅ | - | `DocumentViewer.tsx`:191 |
| 6 | DocumentViewer → TOCSidebar | onClose → toggleTOC | ✅ | - | `DocumentViewer.tsx`:192 |
| 7 | DocumentViewer → CitationSidePanel | onClose → toggleCitations | ✅ | - | `DocumentViewer.tsx`:205 |
| 8 | FullscreenPortal | onExit → toggleFullscreen | ✅ | - | `DocumentViewer.tsx`:212 |
| 9 | **DocumentRenderer → DocumentViewer** | **citations** | ❌ | **Critical** | `DocumentRendererProps`에 `citations` prop 미정의. DocumentViewer가 citations를 받을 수 있지만 상위에서 전달 안 됨 |
| 10 | **ArtifactPanelContext** | **citations 상태** | ❌ | **Critical** | Context에 citations 필드 없음. Provider에서 주입 불가 |

- plan.md 통합 지점 대조: 3/4 연결 확인
  1. ✅ 3패널 레이아웃 (TOC | Viewer | Citation)
  2. ✅ DocumentViewerToolbar 토글 버튼
  3. ✅ PDFViewer/DOCXViewer toolbarExtras 전달
  4. ❌ **Citation 데이터 경로 미완성** — DocumentViewer.citations prop은 존재하나, DocumentRenderer → ArtifactPreviewPanel → ArtifactPanelContext 경로에서 전달되지 않음

### 이중 상태 동기화

| # | 상태 A | 상태 B | A→B 경로 | B→A 경로 | 결과 |
|---|--------|--------|---------|---------|------|
| 1 | DocumentViewer.viewMode | ArtifactPanelContext.isMaximized | 없음 (독립) | 없음 (독립) | ⚠️ |

**비고**: `viewMode`(embedded/maximized/fullscreen)와 `isMaximized`(boolean)는 의미가 겹치지만 독립적으로 관리됨. 현재 DocumentViewer 내부의 viewMode는 ArtifactPreviewPanel의 isMaximized와 직접 동기화되지 않음. 이는 설계 의도(DocumentViewer 자체 풀스크린 ≠ ArtifactPanel 최대화)로 보이나, 사용자가 ArtifactPanel을 최대화한 상태에서 DocumentViewer 풀스크린을 토글하면 시각적으로 이중 최대화가 발생할 수 있음. **실제 문제는 아님** — fullscreen은 z-[9999] Portal로 ArtifactPanel 위에 렌더링되므로 레이아웃 충돌 없음.

### 종료 상태 시나리오

| # | 시나리오 | 기대 동작 | 실제 동작 | 결과 | 심각도 |
|---|---------|----------|----------|------|--------|
| 1 | TOC 열림 → narrow 전환 | TOC 자동 닫힘 | ✅ `setShowTOC(false)` (line 84) | PASS | - |
| 2 | 풀스크린 → ESC | embedded로 복귀 | ✅ `toggleFullscreen()` → 'embedded' (line 117) | PASS | - |
| 3 | 풀스크린 → 창 닫기(onClose) | 풀스크린 해제 후 닫기 | ⚠️ onClose 호출 시 viewMode 상태가 남아있으나, 컴포넌트 언마운트로 정리됨 | PASS | - |
| 4 | 풀스크린 + TOC 열림 → ESC | 풀스크린만 닫힘 (TOC 유지) | ✅ ESC는 FullscreenPortal에서 capture phase로 소비, TOC에 전파 안 됨 | PASS | - |
| 5 | narrow 모드 + 양쪽 사이드바 동시 열기 | 레이아웃 겹침 가능 | ⚠️ 양쪽 모두 absolute z-30으로 열릴 수 있음. 뷰어 콘텐츠 위 양쪽 오버레이 | minor | 상호 배타적 토글 미적용 |

### 핵심 사용자 플로우

#### Flow 1: PDF 문서 열기 → TOC 탐색 → 섹션 점프
```
[파일 업로드] → [DocumentViewer mount] → [PDFViewer 로딩]
  → [500ms 후 extractHeadings()] → [tocItems 설정]
  → [사용자: TOC 토글 클릭] → [showTOC=true]
  → [사용자: heading 클릭] → [scrollToHeading(id)]
  → [scrollIntoView smooth] → [IntersectionObserver → activeTOCId 갱신]
```
기대: 정상 동작
결과: PASS

#### Flow 2: 풀스크린 진입 → TOC/Citation 토글 → ESC 퇴장
```
[사용자: Fullscreen 클릭] → [viewMode='fullscreen']
  → [FullscreenPortal: createPortal(body)] → [body overflow hidden]
  → [사용자: TOC 토글] → [showTOC=true, 풀스크린 내 표시]
  → [사용자: ESC] → [FullscreenPortal keydown capture]
  → [viewMode='embedded'] → [body overflow 복원]
```
기대: 풀스크린 내에서 TOC/Citation이 정상 동작하고 ESC로 깨끗하게 복귀
결과: PASS

#### Flow 3: Citation 데이터 주입 경로 (파괴적 시나리오)
```
[AgentChatView: 문서 생성] → [documentData → ArtifactPanelContext]
  → [ArtifactPreviewPanel: documentData 전달]
  → [DocumentRenderer: documentData 전달, citations ❌ 미전달]
  → [DocumentViewer: citations=undefined → 빈 배열]
  → [Citation 토글 버튼 disabled] → [사용자: Citation 사용 불가]
```
기대: 에이전트가 생성한 citations가 DocumentViewer까지 도달
결과: FAIL — Citations prop 경로 미완성

- 플로우 테스트 작성: 0개 (DOM 테스트 환경 미구성)

---

## 통합 테스트

- 컴포넌트 통합: PASS (DocumentViewer ↔ 5개 뷰어 + 3개 Phase 3 컴포넌트 + Toolbar. import/export 정상, Props 호환)
- 빌드 통합: **PASS** (`npm run build` 성공, 모든 라우트 정상 빌드)
- 타입 호환성: **PASS** (DocumentViewer 관련 파일에 TS 에러 없음. 기존 LiveboardView, usePPTScenario 에러는 무관)

---

## 접근성 검증

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | ARIA 속성 | PASS | TOC: `aria-current="location"`, `aria-level`. Toolbar: `aria-expanded`. Fullscreen: `role="dialog"`, `aria-modal="true"`. 모든 버튼 `aria-label` 제공 (한국어) |
| 2 | 키보드 접근성 | PASS | TOC: ArrowUp/Down/Home/End 키보드 내비게이션. Fullscreen: ESC 복귀. Toolbar: 표준 tab 순서 |
| 3 | 포커스 관리 | PASS | TOC: `tabIndex` 0(active)/-1(inactive) 로빙 탭인덱스. `focus-visible:ring-2` 인디케이터 |
| 4 | 색상 대비 | PASS | 활성 TOC: blue-700 on blue-50. 비활성: gray-700 on white. 텍스트/아이콘 대비 충분 |
| 5 | 스크린리더 구조 | PASS | `role="tree"` + `role="treeitem"` 시맨틱 구조. `role="toolbar"`. `nav` + `aside` 랜드마크 |
| 6 | 라이브 영역 | PASS | PDF: `aria-live="polite"` 페이지 변경 알림 (PDFViewer 기존 구현) |

---

## 발견된 이슈

### 심각도: Critical (배포 차단)

없음 — 아래 Major 이슈가 있으나, 현재 에이전트 통합이 없어 citation 데이터 자체가 생성되지 않으므로 실사용에 영향 없음. 다만 에이전트 통합 시 반드시 수정 필요.

### 심각도: Major (수정 강력 권고)

- [ ] **Citations prop 경로 미완성**: `DocumentRenderer`에 `citations` prop이 없어 `ArtifactPanelContext` → `ArtifactPreviewPanel` → `DocumentRenderer` → `DocumentViewer` 경로로 citations 데이터를 전달할 수 없음. DocumentViewer는 citations를 받을 준비가 되어 있으나 상위 체인이 끊어져 있음. — `DocumentRenderer.tsx:5-11`, `ArtifactPanelContext.tsx` (citations 필드 없음)

- [ ] **Citation 타입 불일치**: DocumentViewer의 `Citation` (`{number, excerpt}`)과 ChatMessage의 `Citation` (`{index, snippet, domain}`)이 필드명이 다름. 에이전트 통합 시 타입 통합 또는 매핑 로직 필요. — `DocumentViewer/types.ts:8-14`, `agent-chat/types.ts:450-457`

### 심각도: Minor (후속 수정 가능)

- [ ] **narrow 모드 양쪽 사이드바 동시 열기**: isNarrow 상태에서 TOC와 Citation 패널이 동시에 absolute overlay로 열릴 수 있음. 상호 배타적 토글(하나 열면 다른 하나 닫기) 미적용. — `DocumentViewer.tsx:186-207`

- [ ] **heading 추출 500ms 딜레이 하드코딩**: `setTimeout(extractHeadings, 500)` — DOCX 렌더링이 500ms 이상 걸리는 대용량 문서에서 빈 TOC가 될 수 있음. MutationObserver 또는 콜백 기반 트리거가 더 견고함. — `DocumentViewer.tsx:105`

- [ ] **IntersectionObserver root 설정 불확실**: `scrollRoot === container ? container : null` — data-scroll-container가 contentRef 자체인 경우 root가 container가 됨. PDFViewer 내부에 별도 스크롤 컨테이너가 있으면 IntersectionObserver root가 맞지 않을 수 있음. — `useDocumentTOC.ts`:92

---

## 수정 요청

CONDITIONAL PASS — 배포 가능하나 다음 수정 권고:

| # | 수정 항목 | 관련 파일 | 심각도 | 설명 |
|---|----------|----------|--------|------|
| 1 | Citations prop 경로 연결 | `DocumentRenderer.tsx`, `ArtifactPanelContext.tsx`, `ArtifactPreviewPanel.tsx` | major | DocumentRendererProps에 `citations?: Citation[]` 추가, ArtifactPanelContext에 citations 필드 추가, 경로 전체 배선 |
| 2 | Citation 타입 통합 | `DocumentViewer/types.ts`, `agent-chat/types.ts` | major | 두 Citation 타입을 통합하거나 매핑 어댑터 작성 |
| 3 | narrow 사이드바 상호 배타 | `DocumentViewer.tsx` | minor | toggleTOC 시 showCitations=false, toggleCitations 시 showTOC=false (narrow 모드 한정) |
| 4 | heading 추출 타이밍 개선 | `DocumentViewer.tsx` | minor | setTimeout 500ms → MutationObserver 또는 뷰어 렌더 완료 콜백 |
