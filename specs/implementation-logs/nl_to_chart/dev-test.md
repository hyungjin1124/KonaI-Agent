# Dev Test Report: Natural Language to Chart

## 정적 분석
- TypeScript: PASS (nl_to_chart 관련 0 에러)
- ESLint: N/A (프로젝트에 ESLint 설정 없음)
- Build: PASS (next build 성공)

## 단위 테스트

| # | 테스트명 | 결과 |
|---|---------|------|
| 1 | isChartQuery - detects Korean chart-related keywords | PASS |
| 2 | isChartQuery - detects English chart-related keywords | PASS |
| 3 | isChartQuery - returns false for non-chart queries | PASS |
| 4 | isChartQuery - handles data-related keywords | PASS |
| 5 | recommendChartType - recommends bar for categorical data | PASS |
| 6 | recommendChartType - recommends line for temporal data | PASS |
| 7 | recommendChartType - recommends pie for ratio data | PASS |
| 8 | recommendChartType - prefers explicit keyword over data type | PASS |
| 9 | recommendChartType - falls back to data type when no keyword | PASS |
| 10 | recommendChartType - recommends composed for multi-metric | PASS |
| 11 | findMatchingDataset - matches monthly revenue | PASS |
| 12 | findMatchingDataset - matches comparison dataset | PASS |
| 13 | findMatchingDataset - matches market share | PASS |
| 14 | findMatchingDataset - falls back for unknown queries | PASS |
| 15 | useNLChart - returns null for non-chart queries | PASS |
| 16 | useNLChart - returns chart result for chart queries | PASS |
| 17 | useNLChart - supports chart type override | PASS |
| 18 | useNLChart - clears chart result | PASS |
| 19 | NLChartRenderer - renders without error | PASS |
| 20 | NLChartRenderer - displays chart title | PASS |
| 21 | NLChartRenderer - displays reasoning text | PASS |
| 22 | NLChartRenderer - renders chart type selector | PASS |
| 23 | NLChartRenderer - renders chart container | PASS |
| 24 | NLChartRenderer - renders table for table type | PASS |
| 25 | ChartTypeSelector - renders all chart type options | PASS |
| 26 | ChartTypeSelector - marks current type as checked | PASS |
| 27 | ChartTypeSelector - calls onSelect when clicking | PASS |

- 총 테스트: 27개
- 통과: 27개, 실패: 0개

## 시나리오 커버리지

| # | 시나리오 | 우선순위 | 테스트 위치 | 결과 |
|---|---------|---------|-----------|------|
| 1 | metric+categorical → Bar | must | nl-chart.test.tsx:L88 | PASS |
| 2 | metric+temporal → Line | must | nl-chart.test.tsx:L95 | PASS |
| 3 | 비율 데이터 → Pie | must | nl-chart.test.tsx:L101 | PASS |
| 4 | BarChart config → 렌더링 | must | nl-chart.test.tsx:L219 | PASS |
| 5 | LineChart config → useNLChart 결과 | must | nl-chart.test.tsx:L155 | PASS |
| 6 | 차트 타입 변경 클릭 | must | nl-chart.test.tsx:L255 | PASS |
| 7 | 차트 쿼리 → 결과 반환 | must | nl-chart.test.tsx:L149 | PASS |
| 8 | 비차트 쿼리 → null 반환 | must | nl-chart.test.tsx:L139 | PASS |
| 9 | table 타입 렌더링 | should | nl-chart.test.tsx:L241 | PASS |
| 10 | alternatives 배열 → 버튼 렌더링 | should | nl-chart.test.tsx:L248 | PASS |

- must 커버리지: 8/8 (100%)
- should 커버리지: 2/2 (100%)

## Acceptance Criteria 자가 검증

| # | Criteria | 코드 구현 | 테스트 커버 | 판정 |
|---|----------|----------|-----------|------|
| 1 | NL 쿼리 → 차트 렌더링 | GeneralChatView.handleSend + useNLChart + NLChartRenderer | useNLChart 테스트 | PASS |
| 2 | Heuristic fallback 기본 차트 | chartHeuristics.ts | recommendChartType 테스트 | PASS |
| 3 | 1 metric × 1 categorical → Bar | chartHeuristics.ts:L54 | 테스트 #5 | PASS |
| 4 | 1 metric × 1 temporal → Line | chartHeuristics.ts:L47 | 테스트 #6 | PASS |
| 5 | 비율 데이터 → Pie | chartHeuristics.ts:L52 | 테스트 #7 | PASS |
| 6 | Artifact Panel 'chart' preview | GeneralChatView:L139 openArtifactTab | 정적 분석 | PASS |
| 7 | 차트 타입 override | ChartTypeSelector + changeChartType | 테스트 #17, #27 | PASS |
| 8 | hover tooltip, legend | NLChartRenderer Recharts 기본 | Recharts 라이브러리 기능 | PASS |
| 9 | 차트 선택 이유 텍스트 | reasoning → 채팅 + 차트 헤더 | 테스트 #21 | PASS |

## QA 전달 사항
- Phase 1 MVP: 목데이터 기반, LLM API 미연동
- 테스트 시 시도할 쿼리 예시: "월별 매출 추이 보여줘", "사업부별 비교 차트", "시장 점유율 비율", "분기별 실적 분석", "비용 구성 차트"
- 비차트 쿼리 시 차트 팁 메시지가 표시됨
- 차트 타입 셀렉터에서 다른 유형 클릭 시 즉시 변경됨
- 알려진 제한사항: 실제 LLM API 미연동, 5개 목데이터셋으로 제한, liveboard 위젯 등록 미구현 (Phase 3)
