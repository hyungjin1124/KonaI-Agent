# Plan: Natural Language to Chart

## 구현 범위

Phase 1 MVP — Pattern B+E: 목데이터 기반 NL→Heuristic→Recharts 렌더링
- 자연어 입력을 감지하여 차트를 생성하는 핵심 파이프라인
- Heuristic 차트 타입 추천 (LLM API 호출 없이 데모 가능)
- 생성된 차트를 ArtifactPanel의 'chart' preview type으로 렌더링
- 차트 타입 변경(override) 지원

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `src/components/features/nl-chart/types.ts` | NL-to-Chart 타입 정의 | 신규 |
| `src/components/features/nl-chart/chartHeuristics.ts` | Heuristic 차트 타입 추천 로직 | 신규 |
| `src/components/features/nl-chart/mockChartData.ts` | 데모용 목데이터 (NL 쿼리 → 데이터 매핑) | 신규 |
| `src/components/features/nl-chart/NLChartRenderer.tsx` | 동적 차트 렌더링 컴포넌트 | 신규 |
| `src/components/features/nl-chart/ChartTypeSelector.tsx` | 차트 타입 오버라이드 셀렉터 | 신규 |
| `src/components/features/nl-chart/useNLChart.ts` | NL→Chart 변환 Hook (핵심 로직) | 신규 |
| `src/components/features/nl-chart/index.ts` | barrel export | 신규 |
| `src/components/features/general-chat/GeneralChatView.tsx` | NL-to-Chart 통합 | 수정 |

## 아키텍처 설계

### 데이터 플로우

```
User NL Query (GeneralChatView.handleSend)
  → useNLChart.processQuery(query)
     → (1) isChartQuery? 패턴 매칭으로 판별
     → (2) mockChartData에서 매칭되는 데이터셋 선택
     → (3) chartHeuristics로 최적 차트 타입 추천
     → (4) NLChartResult 반환 { chartType, data, config, reasoning }
  → ArtifactPanelProvider.openArtifactTab(chartArtifact, 'chart')
  → ArtifactPreviewPanel → DashboardRenderer
     → NLChartRenderer(chartConfig) → Recharts 컴포넌트
```

### 핵심 결정사항

1. **GeneralChatView에 ArtifactPanelProvider 추가**: 현재 GeneralChatView는 ArtifactPanel과 연결되지 않음. 차트 렌더링을 위해 ArtifactPanelProvider로 감싸고 CoworkLayout의 centerPanel에 ArtifactPreviewPanel을 배치.
2. **차트 쿼리 감지**: 키워드 기반 패턴 매칭 (예: "차트", "그래프", "추이", "비교", "분포", "시각화")으로 NL 입력이 차트 요청인지 판별. 데모 프로젝트이므로 간단한 룰 기반.
3. **목데이터 매핑**: 미리 정의된 데이터셋(월별 매출, 지역별 비교, 카테고리별 분포 등)과 NL 쿼리를 키워드 매칭하여 연결.
4. **ArtifactPanelBridge 패턴 재사용**: AgentChatView와 동일한 ref 브릿지 패턴으로 context 외부에서 artifact 탭 열기.

## Props Interface

```typescript
// src/components/features/nl-chart/types.ts

export type NLChartType = 'bar' | 'line' | 'pie' | 'composed' | 'area' | 'table';

export interface NLChartDataPoint {
  [key: string]: string | number;
}

export interface NLChartSeries {
  dataKey: string;
  name: string;
  color: string;
  type?: 'bar' | 'line' | 'area';
}

export interface NLChartConfig {
  chartType: NLChartType;
  title: string;
  data: NLChartDataPoint[];
  series: NLChartSeries[];
  xAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface NLChartResult {
  config: NLChartConfig;
  reasoning: string;          // "왜 이 차트를 선택했는지" 설명
  alternatives: NLChartType[];  // 대안 차트 타입
  queryKeywords: string[];     // 감지된 키워드
}
```

## 상태 설계

### useNLChart Hook
- `chartResult: NLChartResult | null` — 현재 생성된 차트 결과
- `isProcessing: boolean` — 처리 중 상태
- `processQuery(query: string): Promise<NLChartResult | null>` — NL 쿼리 처리
- `changeChartType(type: NLChartType): void` — 차트 타입 오버라이드
- `clearChart(): void` — 초기화

### GeneralChatView 추가 상태
- `isCenterPanelOpen: boolean` — ArtifactPanel 표시 여부
- `dashboardComponent: React.ReactNode | null` — 렌더링할 차트 컴포넌트
- ArtifactPanelProvider + ArtifactPanelBridge ref

## 통합 지점

1. **GeneralChatView.handleSend** 수정:
   - 사용자 메시지 처리 후 `useNLChart.processQuery()` 호출
   - 차트 결과가 있으면 → chartArtifact 생성 → openArtifactTab → centerPanel 열기
   - 차트 결과가 없으면 → 기존 텍스트 응답 유지
2. **GeneralChatView 레이아웃** 수정:
   - ArtifactPanelProvider로 감싸기
   - CoworkLayout centerPanel에 ArtifactPreviewPanel 배치
   - dashboardRendererProps에 NLChartRenderer 전달

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | 자연어 쿼리 입력 → 차트 렌더링 | useNLChart.processQuery → NLChartRenderer |
| 2 | Heuristic fallback 기본 차트 렌더링 | chartHeuristics.ts |
| 3 | 1 metric × 1 categorical → Bar Chart | chartHeuristics.ts 규칙 |
| 4 | 1 metric × 1 temporal → Line Chart | chartHeuristics.ts 규칙 |
| 5 | 비율 데이터 → Pie Chart | chartHeuristics.ts 규칙 |
| 6 | Artifact Panel의 'chart' preview type | GeneralChatView → openArtifactTab('chart') |
| 7 | 차트 타입 변경 요청 시 override | ChartTypeSelector + useNLChart.changeChartType |
| 8 | 차트 기본 상호작용(hover tooltip, legend) | NLChartRenderer Recharts 기본 기능 |
| 9 | 차트 타입 선택 이유 텍스트 표시 | NLChartResult.reasoning → 채팅 메시지에 표시 |

## 테스트 시나리오

| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | Heuristic 차트 추천 | metric+categorical 데이터 → Bar | jest unit test on chartHeuristics | must |
| 2 | Heuristic 차트 추천 | metric+temporal 데이터 → Line | jest unit test on chartHeuristics | must |
| 3 | Heuristic 차트 추천 | 비율 데이터 → Pie | jest unit test on chartHeuristics | must |
| 4 | NLChartRenderer 렌더링 | BarChart config → 렌더링 확인 | RTL render + screen.getByRole | must |
| 5 | NLChartRenderer 렌더링 | LineChart config → 렌더링 확인 | RTL render + screen.getByRole | must |
| 6 | 차트 타입 변경 | ChartTypeSelector 클릭 → 차트 변경 | RTL userEvent.click + 상태 확인 | must |
| 7 | useNLChart 쿼리 처리 | "월별 매출 추이" → 차트 결과 반환 | jest unit test on hook | must |
| 8 | useNLChart 비차트 쿼리 | "안녕하세요" → null 반환 | jest unit test on hook | must |
| 9 | NLChartRenderer fallback | 알 수 없는 타입 → Table 렌더링 | RTL render | should |
| 10 | ChartTypeSelector 대안 표시 | alternatives 배열 → 버튼 렌더링 | RTL render + getByRole('button') | should |
