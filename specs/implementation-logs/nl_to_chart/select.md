# Select: Natural Language to Chart

- **ID**: nl_to_chart
- **Status**: not_implemented
- **Priority**: high
- **Complexity**: complex
- **Contexts**: [chat_view, liveboard]
- **Dependencies**: 없음 (명시적 의존성 없음)
- **Obsidian Sources**: Insights/agent-ui/patterns/nl-to-chart-pipeline.md
- **Existing Source Files**: 없음 (신규)
- **Last Researched**: 2026-02-25

## 기존 인프라 활용 가능성

| 기존 자산 | 상태 | 활용 방법 |
|----------|------|----------|
| `ArtifactType: 'chart'` | 정의됨 | 차트 아티팩트 타입으로 사용 |
| `ArtifactPreviewPanel` → 'chart' 라우팅 | 구현됨 | DashboardRenderer로 연결 |
| `DashboardRenderer` | 구현됨 | dashboardComponent prop으로 차트 전달 |
| `visualization_generation` ToolType | 정의됨 | 시나리오 메타데이터 활용 |
| `LazyCharts.tsx` | 구현됨 | Recharts lazy loading 재사용 |
| `ChartWidgets.tsx` (Recharts) | 구현됨 | 차트 렌더링 패턴 참조 |
| `ArtifactPanelContext` | 구현됨 | openArtifactTab()으로 탭 등록 |
| `chart.types.ts` | 구현됨 | 도메인 차트 타입 참조 |

## 선정 사유

Review Decision(2026-02-25)에서 APPROVE-1로 선정. 5회 연속 discovery 리포트에서 권장.
Databricks, Power BI, ThoughtSpot 3개 주요 제품에서 NL→시각화 패턴 동시 강화 중.
KonaI-Agent 핵심 시나리오(에이전트 기반 데이터 분석)와 직결.
