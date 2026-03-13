# Select: Natural Language to Chart (Phase 2)

- **ID**: nl_to_chart
- **Status**: needs_update (Phase 1 implemented + QA PASS, Phase 2 리서치 완료)
- **Priority**: high
- **Complexity**: complex
- **Contexts**: [chat_view, liveboard]
- **Dependencies**: 없음
- **Obsidian Sources**: Insights/agent-ui/patterns/nl-to-chart-pipeline.md
- **Existing Source Files**:
  - src/components/features/nl-chart/types.ts
  - src/components/features/nl-chart/chartHeuristics.ts
  - src/components/features/nl-chart/mockChartData.ts
  - src/components/features/nl-chart/useNLChart.ts
  - src/components/features/nl-chart/NLChartRenderer.tsx
  - src/components/features/nl-chart/ChartTypeSelector.tsx
  - src/components/features/nl-chart/index.ts
  - src/components/features/nl-chart/nl-chart.test.tsx
- **Last Researched**: 2026-03-12

## Phase 2 구현 범위

Phase 1(단일 차트 생성)에서 Phase 2(멀티 위젯 대시보드 생성)로 확장:

1. **멀티 위젯 대시보드 생성**: DashboardConfig JSON + react-grid-layout
2. **고급 차트 4종 추가**: Sankey, Treemap, Heatmap, Waterfall (총 10종)
3. **대화형 대시보드 분석**: 위젯 클릭 → 후속 질문

## 선정 사유

- Review Decision 2026-03-12 Batch 1 APPROVED
- NL→대시보드 생성이 Google Gemini, Databricks AI-BI, Power BI에서 동시 채택 — 업계 표준 진화
- "단일 차트"에서 "멀티 차트+필터+레이아웃 전체 대시보드"로 패러다임 전환 확인
