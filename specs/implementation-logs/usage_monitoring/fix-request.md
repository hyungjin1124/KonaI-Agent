# Fix Request: Usage Monitoring Dashboard

## QA 판정: CONDITIONAL PASS
## 수정 사이클: 1/3

### 수정 항목

- [x] **[Major] 에이전트 분포/모델 비용 ChartWidget에 insightDetail 누락** — `src/components/features/usage-monitoring/UsageMonitoringView.tsx:172,207`
  에이전트 유형별 실행 수 차트와 모델별 비용 분포 차트에 `insightSummary`는 제공되지만 `insightDetail`이 누락됨. ChartWidget은 `insightSummary`가 있으면 클릭 가능한 인사이트 푸터를 렌더링하며, 클릭 시 `insightDetail`을 오버레이에 표시함. `insightDetail`이 없으면 빈 오버레이가 표시되어 사용자에게 빈 모달을 보여줌.

  **수정 방향 (택1)**:
  - (A) 두 차트에 `insightDetail` JSX를 추가하여 상세 분석 내용 제공 (일별 트렌드 차트와 동일 패턴)
  - (B) `insightDetail`이 없으면 `insightSummary`만 텍스트로 표시하고 클릭을 비활성화 (ChartWidget 수정 — 영향 범위 넓음)

  **(A) 권장**: usage_monitoring 코드만 수정하므로 영향 범위가 좁음
