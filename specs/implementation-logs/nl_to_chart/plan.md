# Plan: Natural Language to Chart (Phase 2 — 멀티 위젯 대시보드)

## 구현 범위

Phase 2a — 멀티 위젯 대시보드 생성 + 고급 차트 4종 추가
- 단일 NL 쿼리 → 2개 이상 위젯이 포함된 DashboardConfig 생성
- react-grid-layout 12-column grid로 위젯 배치
- 고급 차트 4종: Sankey, Treemap, Heatmap(커스텀 SVG), Waterfall
- 대시보드가 ArtifactPanel의 'dashboard' preview type으로 렌더링
- 위젯별 차트 타입 변경(override) 지원
- Phase 2b/2c 인터페이스 준비 (위젯 클릭 후속 질문 핸들러)

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `src/components/features/nl-chart/types.ts` | DashboardConfig, WidgetConfig, LayoutItem 타입 추가 | 수정 |
| `src/components/features/nl-chart/chartHeuristics.ts` | 대시보드 쿼리 감지 + 고급 차트 키워드 추가 | 수정 |
| `src/components/features/nl-chart/mockChartData.ts` | 대시보드용 멀티 데이터셋 + 고급 차트 데이터 추가 | 수정 |
| `src/components/features/nl-chart/useNLChart.ts` | processDashboardQuery 추가 | 수정 |
| `src/components/features/nl-chart/NLChartRenderer.tsx` | Sankey/Treemap/Heatmap/Waterfall 렌더링 추가 | 수정 |
| `src/components/features/nl-chart/ChartTypeSelector.tsx` | 신규 차트 타입 라벨/아이콘 추가 | 수정 |
| `src/components/features/nl-chart/NLDashboardRenderer.tsx` | 멀티 위젯 대시보드 렌더러 (react-grid-layout) | 신규 |
| `src/components/features/nl-chart/mockDashboardConfigs.ts` | 대시보드 목 설정 (위젯+레이아웃) | 신규 |
| `src/components/features/nl-chart/HeatmapChart.tsx` | 커스텀 SVG 히트맵 차트 | 신규 |
| `src/components/features/nl-chart/index.ts` | 신규 export 추가 | 수정 |
| `src/components/features/general-chat/GeneralChatView.tsx` | 대시보드 쿼리 감지 + 렌더링 통합 | 수정 |

## 아키텍처 설계

### 데이터 플로우 (Phase 2)

```
User NL Query ("종합 현황 대시보드 보여줘")
  → useNLChart.processDashboardQuery(query)
     → (1) isDashboardQuery? 키워드 감지 ("대시보드", "한 화면에", "종합")
     → (2) 적합한 DashboardConfig 매칭 (mockDashboardConfigs)
     → (3) DashboardResult 반환 { dashboardConfig, reasoning }
  → ArtifactPanelProvider.openArtifactTab(artifact, 'dashboard')
  → ArtifactPreviewPanel → DashboardRenderer
     → NLDashboardRenderer(dashboardConfig)
        → react-grid-layout 12-column grid
        → 각 위젯: NLChartRenderer 인스턴스
```

### 핵심 결정사항

1. **Heatmap**: @nivo/heatmap 대신 커스텀 SVG rect 매트릭스로 구현. 번들 크기 증가 방지. hover tooltip + 색상 범례 직접 구현.
2. **DashboardConfig**: Phase 1 NLChartConfig를 확장하여 WidgetConfig[] + LayoutItem[]을 포함. 기존 NLChartResult와 별도 DashboardResult 타입.
3. **단일 차트 vs 대시보드 분기**: `isDashboardQuery()`가 true면 대시보드, false면 기존 단일 차트 → Phase 1 코드 100% 유지.
4. **위젯별 차트 변경**: 각 위젯 독립적으로 ChartTypeSelector 보유 → 위젯 ID로 상태 관리.

## Props Interface

```typescript
// 신규 타입 (types.ts에 추가)

export type NLChartType = 'bar' | 'line' | 'pie' | 'composed' | 'area' | 'table'
  | 'sankey' | 'treemap' | 'heatmap' | 'waterfall';

// Sankey 데이터 구조
export interface SankeyNode { name: string; }
export interface SankeyLink { source: number; target: number; value: number; }
export interface SankeyData { nodes: SankeyNode[]; links: SankeyLink[]; }

// Treemap 데이터 구조
export interface TreemapDataItem {
  name: string;
  size?: number;
  children?: TreemapDataItem[];
  color?: string;
}

// Heatmap 데이터 구조
export interface HeatmapDataPoint { x: string; y: string; value: number; }

// 확장된 ChartConfig (union data)
export interface NLChartConfig {
  chartType: NLChartType;
  title: string;
  data: NLChartDataPoint[];      // 기존 차트용
  sankeyData?: SankeyData;       // Sankey용
  treemapData?: TreemapDataItem[];  // Treemap용
  heatmapData?: HeatmapDataPoint[];  // Heatmap용
  series: NLChartSeries[];
  xAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

// 대시보드 설정
export interface WidgetConfig {
  id: string;
  config: NLChartConfig;
}

export interface LayoutItem {
  i: string;    // 위젯 ID
  x: number;    // 0-11 (12-column grid)
  y: number;    // row position
  w: number;    // 1-12 columns
  h: number;    // rows
}

export interface DashboardConfig {
  title: string;
  description: string;
  widgets: WidgetConfig[];
  layout: LayoutItem[];
}

export interface DashboardResult {
  dashboardConfig: DashboardConfig;
  reasoning: string;
}
```

## 상태 설계

### useNLChart Hook 확장
- `dashboardResult: DashboardResult | null` — 대시보드 결과
- `processDashboardQuery(query: string): DashboardResult | null` — 대시보드 쿼리 처리
- `changeWidgetChartType(widgetId: string, type: NLChartType): void` — 위젯별 차트 변경
- `clearDashboard(): void` — 대시보드 초기화
- 기존 `chartResult`, `processQuery`, `changeChartType`, `clearChart` 유지

### GeneralChatView 변경
- handleSend에서 isDashboardQuery 체크 추가
- 대시보드 결과 시 artifact type 'dashboard'로 생성

## 통합 지점

1. **GeneralChatView.handleSend** 수정:
   - isDashboardQuery(content) → processDashboardQuery(content) → artifact type 'dashboard'
   - 기존 isChartQuery → processQuery 흐름 유지 (fallback)
2. **ArtifactPreviewPanel**: 이미 'dashboard' case가 DashboardRenderer로 라우팅됨 → 수정 불필요
3. **DashboardRenderer**: dashboardComponent prop으로 NLDashboardRenderer 전달

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | NL "종합 현황 대시보드" → DashboardConfig 생성 | useNLChart.processDashboardQuery |
| 2 | DashboardConfig 2+위젯, 유효한 차트 config | mockDashboardConfigs.ts |
| 3 | react-grid-layout 12-column grid 배치 | NLDashboardRenderer.tsx |
| 4 | Sankey: nodes/links 플로우 시각화 | NLChartRenderer + Recharts Sankey |
| 5 | Treemap: 계층 영역 시각화 | NLChartRenderer + Recharts Treemap |
| 6 | Heatmap: 2D 매트릭스 색상 강도 시각화 | HeatmapChart.tsx (커스텀 SVG) |
| 7 | Waterfall: 누적 양수/음수 시각화 | NLChartRenderer + Recharts BarChart+Cell |
| 8 | ArtifactPanel 'dashboard' preview | GeneralChatView → openArtifactTab('dashboard') |
| 9 | 위젯별 차트 타입 override | NLDashboardRenderer + useNLChart.changeWidgetChartType |

## 테스트 시나리오

| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | 대시보드 쿼리 감지 | "종합 현황 대시보드" → isDashboardQuery → true | jest unit test | must |
| 2 | 대시보드 쿼리 감지 | "매출 추이 보여줘" → isDashboardQuery → false, isChartQuery → true | jest unit test | must |
| 3 | processDashboardQuery | 대시보드 쿼리 → DashboardResult with 2+ widgets | jest unit test | must |
| 4 | NLDashboardRenderer | DashboardConfig → grid layout 렌더링 | RTL render + data-testid | must |
| 5 | Sankey 렌더링 | SankeyData → Recharts Sankey 렌더링 | RTL render + recharts-surface | must |
| 6 | Treemap 렌더링 | TreemapData → Recharts Treemap 렌더링 | RTL render + recharts-surface | must |
| 7 | Heatmap 렌더링 | HeatmapData → SVG rect 렌더링 | RTL render + SVG rect count | must |
| 8 | Waterfall 렌더링 | Waterfall data → BarChart with positive/negative colors | RTL render + recharts-surface | must |
| 9 | 위젯별 차트 변경 | changeWidgetChartType(id, 'bar') → 해당 위젯만 변경 | jest unit test on hook | must |
| 10 | 빈 대시보드 fallback | 위젯 0개 → 빈 상태 메시지 | RTL render | should |
| 11 | 단일차트 호환 | Phase 1 단일 차트 쿼리 → 기존대로 동작 | jest regression test | must |
