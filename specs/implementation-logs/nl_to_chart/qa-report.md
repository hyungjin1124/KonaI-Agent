# QA Report: Natural Language to Chart

## 판정: PASS

---

## Acceptance Criteria 검증

| # | Criteria | Dev 판정 | QA 판정 | 불일치 | 비고 |
|---|----------|---------|---------|--------|------|
| 1 | NL 쿼리 → 차트 렌더링 | PASS | PASS | - | GeneralChatView.handleSend → processQuery → NLChartRenderer 정상 연결 |
| 2 | Heuristic fallback 기본 차트 | PASS | PASS | - | 동기 함수, 지연 없음 |
| 3 | 1 metric × 1 categorical → Bar | PASS | PASS | - | chartHeuristics.ts:68 |
| 4 | 1 metric × 1 temporal → Line | PASS | PASS | - | chartHeuristics.ts:42-48 |
| 5 | 비율 데이터 → Pie | PASS | PASS | - | chartHeuristics.ts:50-56 |
| 6 | Artifact Panel 'chart' preview | PASS | PASS | - | ArtifactPreviewPanel:107 chart→DashboardRenderer 라우팅 확인 |
| 7 | 차트 타입 override | PASS | PASS | - | ChartTypeSelector → changeChartType → config.chartType 업데이트 확인 |
| 8 | hover tooltip, legend | PASS | PASS | - | 모든 차트 타입에 Tooltip + Legend 포함 |
| 9 | 차트 선택 이유 텍스트 | PASS | PASS | - | reasoning이 차트 헤더(NLChartRenderer:41) + 채팅 메시지(GeneralChatView:172) 양쪽 표시 |

- Dev 일치율: 100%
- QA 독립 판정: 9/9 passed (Phase 2/3 범위 3건 N/A 제외)

> Note: AC1(LLM 3초), AC2(strict tool_use), AC11(다중 위젯)은 Phase 1 MVP 범위 외로 평가 대상에서 제외.

---

## 엣지 케이스 테스트

| # | 시나리오 | 결과 | 심각도 | 상세 |
|---|---------|------|--------|------|
| 1 | 빈 문자열/공백 쿼리 | PASS | - | isChartQuery, processQuery 모두 정상 반환 |
| 2 | 1000+ 문자 쿼리 | PASS | - | 키워드 포함 시 감지, 미포함 시 false |
| 3 | 특수문자/이모지/HTML/regex 메타문자 | PASS | - | 크래시 없음 |
| 4 | 연속 빠른 processQuery 호출 | PASS | - | 마지막 호출 결과 정상 반영 |
| 5 | chartResult 없이 changeChartType | PASS | - | null 유지, 크래시 없음 |
| 6 | 빈 data 배열 (6개 차트 타입 모두) | PASS | - | 모든 타입 렌더링 성공 |
| 7 | 빈 series 배열 | PASS | - | pie series[0]?.dataKey ?? 'value' fallback 동작 |
| 8 | 600+ 문자 title/reasoning | PASS | - | 텍스트 표시 확인 |
| 9 | 빈 alternatives 배열 | PASS | - | currentType만 렌더링 |
| 10 | alternatives에 currentType 중복 | PASS | - | filter로 중복 제거 |
| 11 | findMatchingDataset 빈/공백/무의미 입력 | PASS | - | 기본 데이터셋(monthly_revenue) 반환 |
| 12 | 대소문자 혼합 키워드 | PASS | - | toLowerCase 정규화 동작 |
| 13 | clearChart 멱등성 | PASS | - | 다중 호출 안전 |

- 추가 테스트 작성: 53개 (`src/components/features/nl-chart/nl-chart.qa.test.tsx`)
- 통과: 53개, 실패: 0개

---

## UX 플로우 검증

### 콜백 배선 감사

| # | Provider/Component | 콜백 Prop | 연결 상태 | 심각도 | 비고 |
|---|-------------------|-----------|----------|--------|------|
| 1 | ArtifactPanelProvider | onPanelOpenChange | ✅ | - | GeneralChatView:406 → !isOpen → setIsCenterPanelOpen(false) |
| 2 | ArtifactPanelBridge | openArtifactTab | ✅ | - | ref 패턴으로 연결, GeneralChatView:179에서 호출 |
| 3 | ArtifactPanelBridge | closePanel | ✅ | - | handleCloseCenterPanel:129에서 호출 |
| 4 | NLChartRenderer | onChangeChartType | ✅ | - | GeneralChatView:322 → changeChartType 연결 |
| 5 | ChartTypeSelector | onSelect | ✅ | - | NLChartRenderer:49에서 onChangeChartType 전달 |
| 6 | ArtifactPreviewPanel | onClose | ✅ | - | GeneralChatView:317 → handleCloseCenterPanel |
| 7 | RightSidebar | onArtifactSelect | ✅ | - | GeneralChatView:393 → openArtifactTab + setIsCenterPanelOpen |
| 8 | RightSidebar | onArtifactDownload | ✅ (no-op) | minor | 빈 함수 전달. 다운로드 기능 미구현이나 Phase 1 범위 외 |

- plan.md 통합 지점 대조: 6/6 연결 확인
  1. ✅ GeneralChatView.handleSend → processQuery() 호출
  2. ✅ 차트 결과 → chartArtifact 생성 → openArtifactTab
  3. ✅ centerPanel 열기/닫기 상태 관리
  4. ✅ ArtifactPanelProvider 감싸기
  5. ✅ ArtifactPanelBridge ref 패턴 적용
  6. ✅ dashboardRendererProps에 NLChartRenderer 전달

### 이중 상태 동기화

| # | 상태 A | 상태 B | A→B 경로 | B→A 경로 | 결과 |
|---|--------|--------|---------|---------|------|
| 1 | isCenterPanelOpen (GeneralChatView) | isPanelOpen (ArtifactPanelContext) | openArtifactTab → tabs 추가 → isPanelOpen=true | onPanelOpenChange(!isOpen) → setIsCenterPanelOpen(false) | ✅ |
| 2 | chartResult (useNLChart) | dashboardComponent (centerPanel JSX) | chartResult → NLChartRenderer 렌더 | N/A (단방향) | ✅ |

> 이중 상태 패턴: `isCenterPanelOpen`과 `isPanelOpen`(ArtifactPanelContext)이 같은 의미. 양방향 동기화 경로 존재:
> - A→B: `setIsCenterPanelOpen(true)` + `openArtifactTab()` → tabs 추가 → `isPanelOpen=true`
> - B→A: 탭 전부 닫힘 → `isPanelOpen=false` → `onPanelOpenChange(false)` → `setIsCenterPanelOpen(false)`

### 종료 상태 시나리오

| # | 시나리오 | 기대 동작 | 실제 동작 | 결과 | 심각도 |
|---|---------|----------|----------|------|--------|
| 1 | 차트 패널 닫기 (X 버튼) | centerPanel 닫힘, 좌측 패널 전체 확장 | handleCloseCenterPanel → isCenterPanelOpen=false, CoworkLayout 2-panel 모드 전환 | PASS | - |
| 2 | 새 대화 시작 (handleNewChat) | 차트 + 메시지 + 파일 모두 초기화 | clearChart + setIsCenterPanelOpen(false) + setChartArtifacts([]) + setMessages([]) | PASS | - |
| 3 | 세션 변경 (handleSessionSelect) | 이전 차트 결과 초기화 | clearChart + 상태 초기화 (동일 패턴) | PASS | - |

### 핵심 사용자 플로우

#### Flow 1: NL 쿼리 → 차트 생성 → 타입 변경 → 초기화
```
[사용자: "월별 매출 추이 보여줘" 입력]
  → [GeneralChatView.handleSend]
  → [setMessages: 사용자 메시지 추가]
  → [useNLChart.processQuery] → NLChartResult (chartType: line)
  → [setChartArtifacts: 아티팩트 추가]
  → [setTimeout 800ms] → [setMessages: 어시스턴트 메시지 추가]
  → [artifactPanelRef.openArtifactTab(chart, 'chart')]
  → [setIsCenterPanelOpen(true)]
  → [CoworkLayout: 3-panel 모드]
  → [ArtifactPreviewPanel → DashboardRenderer → NLChartRenderer]
  → [사용자: 막대 차트 클릭]
  → [ChartTypeSelector.onSelect('bar')]
  → [useNLChart.changeChartType('bar')]
  → [chartResult.config.chartType → 'bar']
  → [NLChartRenderer 리렌더: BarChart]
```
기대: 차트가 line에서 bar로 변경, 데이터 유지
결과: PASS

#### Flow 2: 비차트 쿼리 처리
```
[사용자: "안녕하세요" 입력]
  → [handleSend] → [processQuery] → null 반환
  → [else 분기: 기본 텍스트 응답]
  → [centerPanel 열리지 않음]
```
기대: 차트 패널 열리지 않고 텍스트 응답만 표시
결과: PASS

#### Flow 3: 패널 닫기 후 사이드바에서 재열기
```
[사용자: 차트 패널 X 클릭]
  → [handleCloseCenterPanel] → [isCenterPanelOpen=false] + [closePanel]
  → [CoworkLayout: 2-panel 모드]
  → [사용자: RightSidebar 아티팩트 클릭]
  → [onArtifactSelect] → [openArtifactTab] + [setIsCenterPanelOpen(true)]
  → [CoworkLayout: 3-panel 모드]
```
기대: 패널 다시 열리고 이전 차트 표시
결과: PASS (단, chartResult가 유지되므로 차트 렌더링 가능)

- 플로우 테스트 작성: 11개 (`src/components/features/nl-chart/nl-chart.flow.qa.test.tsx`)
- 통과: 11개, 실패: 0개

---

## 통합 테스트

- 컴포넌트 통합: PASS (ArtifactPanelContext, ArtifactPreviewPanel, DashboardRenderer, CoworkLayout, RightSidebar)
- 빌드 통합: PASS (`npm run build` 성공, / 페이지 207kB)
- 타입 호환성: PASS (nl-chart 관련 TypeScript 에러 0건. 기존 에러는 LiveboardView, usePPTScenario 등 무관 파일)

---

## 접근성 검증

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | ARIA 속성 | PASS | ChartTypeSelector: radiogroup + radio + aria-checked + aria-label. Table: role="table" |
| 2 | 키보드 접근성 | PASS (Minor) | button 기반으로 Tab 접근 가능. Arrow키 그룹 내비게이션은 미구현 (WAI-ARIA 권장) |
| 3 | 포커스 관리 | PASS (Minor) | 패널 열림 시 자동 포커스 이동 없음. 기능 동작에는 영향 없음 |
| 4 | 색상 대비 | PASS | 활성 #FF3C42/white(~4.2:1), 비활성 gray-100/gray-600 적절 |
| 5 | 스크린리더 | PASS | title, reasoning 텍스트 직접 노출. Recharts 차트 자체는 라이브러리 수준 |

---

## 발견된 이슈

### 심각도: Critical (배포 차단)
없음

### 심각도: Major (수정 강력 권고)
없음

### 심각도: Minor (후속 수정 가능)
- [ ] ChartTypeSelector Arrow키 그룹 내비게이션 미구현 — `ChartTypeSelector.tsx` (WAI-ARIA Radio Group Pattern 권장)
- [ ] 차트 패널 열림 시 포커스 자동 이동 없음 — `GeneralChatView.tsx:180` 근처
- [ ] NLChartRenderer에 `aria-label` 미설정 — `NLChartRenderer.tsx:37` (data-testid만 있음)
- [ ] RightSidebar onArtifactDownload에 빈 함수 전달 — `GeneralChatView.tsx:396` (다운로드 미구현, Phase 1 범위 외)
- [ ] 비차트 쿼리 후에도 이전 chartResult 유지됨 — `useNLChart.ts:19-21` (processQuery가 null 반환해도 setChartResult 미호출. GeneralChatView에서 별도 처리하므로 기능 문제 없으나, hook 수준에서 일관성 개선 가능)

---

## 수정 요청

PASS 판정으로 수정 요청 없음. Minor 이슈는 후속 배치에서 해결 가능.
