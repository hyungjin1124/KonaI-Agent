# QA Report: Natural Language to Chart (Phase 2)

## 판정: PASS

> 수정 사이클 1/3 후 재검증. Major 이슈 2건 수정 완료.

---

## Acceptance Criteria 검증

| # | Criteria | Dev 판정 | QA 판정 | 불일치 | 비고 |
|---|----------|---------|---------|--------|------|
| 1 | NL 쿼리 → DashboardConfig JSON 생성 | PASS | PASS | - | isDashboardQuery → processDashboardQuery → DashboardConfig 정상 |
| 2 | DashboardConfig 2+위젯, 유효 차트 config | PASS | PASS | - | 3개 템플릿 모두 2+ 위젯 확인 |
| 3 | react-grid-layout 12-column grid 배치 | PASS | PASS | - | ResponsiveGridLayout cols={{ lg: 12 }} 확인 |
| 4 | Sankey: nodes/links 플로우 시각화 | PASS | PASS | - | Recharts Sankey + null fallback to table |
| 5 | Treemap: 계층 영역 시각화 | PASS | PASS | - | Recharts Treemap + TreemapContent 커스텀 렌더러 |
| 6 | Heatmap: 2D 매트릭스 색상 강도 시각화 | PASS | PASS | - | 커스텀 SVG + getColor gradient + hover tooltip + legend |
| 7 | Waterfall: 누적 양수/음수 시각화 | PASS | PASS | - | BarChart + stacked base/value + 양수/음수/total 색분리 |
| 8 | 대시보드 ArtifactPanel 'dashboard' preview | PASS | PASS | - | openArtifactTab(dashArtifact, 'dashboard') 확인 |
| 9 | 위젯별 차트 타입 override | PASS | PASS | - | changeWidgetChartType + widgetId 기반 개별 변경 |

- Dev 일치율: 100%
- QA 독립 판정: 9/9 passed

---

## 엣지 케이스 테스트

| # | 시나리오 | 결과 | 심각도 | 상세 |
|---|---------|------|--------|------|
| 1 | HeatmapChart 빈 데이터 배열 | PASS | - | 빈 배열 시 빈 SVG, 크래시 없음 |
| 2 | HeatmapChart min===max 단일 값 | PASS | - | ratio=0.5 처리 |
| 3 | HeatmapChart 음수/0 값 | PASS | - | getColor 정상 |
| 4 | HeatmapChart 10x10 대량 매트릭스 | PASS | - | 101개 rect 정상 |
| 5 | HeatmapChart hover tooltip | PASS | - | mouseEnter/Leave 정상 |
| 6 | NLDashboardRenderer 빈 위젯 | PASS | - | 빈 상태 메시지 표시 |
| 7 | NLDashboardRenderer optional props | PASS | - | 미전달 시 크래시 없음 |
| 8 | Dashboard compact mode (no selector) | PASS | - | radiogroup 미표시 |
| 9 | Sankey/Treemap/Heatmap null fallback | PASS | - | 모두 table fallback |
| 10 | 빠른 연속 위젯 타입 변경 | PASS | - | 마지막 값으로 안정 |
| 11 | 존재하지 않는 위젯 ID 변경 | PASS | - | 무해하게 통과 |
| 12 | null 상태에서 changeWidgetChartType | PASS | - | 에러 없음 |
| 13 | clearDashboard 멱등성 | PASS | - | 이중 호출 안전 |
| 14 | chart/dashboard 상태 독립성 | PASS | - | 상호 영향 없음 |
| 15 | isDashboardQuery 경계값 | PASS | - | 빈/공백/혼합 키워드 |
| 16 | 대시보드 레이아웃 무결성 | PASS | - | 3템플릿 widget-layout 수 일치, 12-col 이내 |
| 17 | findMatchingDashboard 미매칭 fallback | PASS | - | executive_overview fallback |

- 추가 테스트 작성: 80개 (nl-chart.qa.test.tsx — Phase 1: 53개, Phase 2: 27개)
- 통과: 80개, 실패: 0개

---

## UX 플로우 검증

### 콜백 배선 감사

| # | Provider/Component | 콜백 Prop | 연결 상태 | 심각도 | 비고 |
|---|-------------------|-----------|----------|--------|------|
| 1 | NLDashboardRenderer | onChangeWidgetChartType | ✅ | - | GeneralChatView:415 연결 |
| 2 | NLDashboardRenderer | onWidgetClick | ❌ | Minor | Optional, Phase 2b용 예비 인터페이스 |
| 3 | NLChartRenderer | onChangeChartType | ✅ | - | GeneralChatView:420 연결 |
| 4 | ArtifactPreviewPanel | onClose | ✅ | - | handleCloseCenterPanel 연결 |

- plan.md 통합 지점 대조: 3/3 연결 확인

### 이중 상태 동기화

| # | 상태 A | 상태 B | A→B 경로 | B→A 경로 | 결과 | 심각도 |
|---|--------|--------|---------|---------|------|--------|
| 1 | dashboardResult | chartResult | clearChart() in handleSend | clearDashboard() in handleSend | ✅ | - |

**상세 (수정 후)**: handleSend()에서 isDashboardQuery 분기 진입 시 `clearChart()`, processQuery 분기 진입 시 `clearDashboard()` 호출. 동시 비-null 상태가 방지되어 렌더링 ternary가 항상 최신 결과를 표시.

### 종료 상태 시나리오

| # | 시나리오 | 기대 동작 | 실제 동작 | 결과 | 심각도 |
|---|---------|----------|----------|------|--------|
| 1 | 대시보드 clear | empty state | empty (chartResult도 정리됨) | PASS | - |
| 2 | 대시보드+차트 모두 clear | empty state | empty state | PASS | - |

### 핵심 사용자 플로우

#### Flow 1: 대시보드 쿼리 → 렌더링 → 위젯 변경 → 클리어
```
[사용자 "종합 현황 대시보드"] → [handleSend] → [isDashboardQuery=true]
  → [clearChart()] → [processDashboardQuery] → [DashboardResult 4-widget]
  → [openArtifactTab('dashboard')] → [NLDashboardRenderer grid]
  → [changeWidgetChartType(w1, 'bar')] → [w1만 변경]
  → [clearDashboard] → [empty state]
```
결과: PASS

#### Flow 2: 차트 → 대시보드 → 상태 전환 (수정 후)
```
[사용자 "매출 차트"] → [clearDashboard()] → [chartResult 설정] → [차트 렌더링]
  → [사용자 "종합 대시보드"] → [clearChart()] → [dashboardResult 설정]
  → [렌더링: dashboard 표시 (chartResult=null)]
  → [대시보드 clear] → [empty state (chartResult도 null)]
```
결과: PASS — 상태 마스킹 해소

#### Flow 3: Artifact 사이드바 재오픈 (수정 후)
```
[대시보드 아티팩트 생성 (id: "dashboard-xxx")] → [chartArtifacts에 추가]
  → [사이드바 클릭] → [artifact.id.startsWith('dashboard-') → previewType='dashboard']
  → [openArtifactTab(artifact, 'dashboard')]
```
결과: PASS — previewType 구분 정상

- 플로우 테스트 작성: 17개 (nl-chart.flow.qa.test.tsx — Phase 1: 11개, Phase 2: 6개)
- 통과: 17개, 실패: 0개

---

## 통합 테스트

- 컴포넌트 통합: PASS (GeneralChatView, ArtifactPreviewPanel, NLChartRenderer, NLDashboardRenderer, HeatmapChart, ChartTypeSelector)
- 빌드 통합: PASS (npm run build — 11 pages 정상 생성)
- 타입 호환성: PASS (nl_to_chart 관련 0 에러. tsc --noEmit의 37개 에러는 모두 agent-chat 기존 파일)

---

## 접근성 검증

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | ARIA 속성 | PASS | ChartTypeSelector: role="radiogroup", aria-label, role="radio", aria-checked |
| 2 | 키보드 접근성 | PASS | 네이티브 button, Tab/Enter 지원 |
| 3 | 포커스 관리 | PASS | 인라인 렌더링, 포커스 트랩 불필요 |
| 4 | 테이블 접근성 | PASS | role="table", thead/tbody 시맨틱 구조 |
| 5 | HeatmapChart SVG | Minor | role/aria-label 미설정 |

---

## 발견된 이슈

### 심각도: Critical (배포 차단)
없음

### 심각도: Major (수정 강력 권고)
- [x] **상태 마스킹: handleSend()에서 이전 결과 미정리** — 수정 완료 (수정 사이클 1). clearChart()/clearDashboard() 호출 추가.
- [x] **Artifact 사이드바 재오픈 시 previewType 미구분** — 수정 완료 (수정 사이클 1). artifact.id prefix 기반 previewType 결정.

### 심각도: Minor (후속 수정 가능)
- [ ] isDashboardQuery → processDashboardQuery null 시 사용자 피드백 없음 — `GeneralChatView.tsx:212-244`
- [ ] NLDashboardRenderer.onWidgetClick 미연결 — `GeneralChatView.tsx:415`. Phase 2b용 예비 인터페이스
- [ ] HeatmapChart SVG 접근성 — `HeatmapChart.tsx:57-150`. role/aria-label 미설정
