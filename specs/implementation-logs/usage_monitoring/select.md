# Select: Usage Monitoring Dashboard — Phase 2

- **ID**: usage_monitoring
- **Status**: implemented (Phase 1 QA PASS, Phase 2 리서치 완료)
- **Priority**: high
- **Complexity**: complex
- **Contexts**: [monitoring, admin]
- **Dependencies**: 없음 (KPICard, ChartWidget, NotificationContext 모두 implemented)
- **Obsidian Sources**: Insights/agent-ui/patterns/usage-monitoring-dashboard.md
- **Existing Source Files**:
  - src/components/features/usage-monitoring/UsageMonitoringView.tsx
  - src/components/features/usage-monitoring/usageMonitoringData.ts
  - src/components/features/usage-monitoring/index.ts
  - src/components/features/usage-monitoring/UsageMonitoringView.test.tsx

## Phase 2 범위 (Review Decision 2026-03-16)

Phase 1(KPI 4종 + 시계열 + 에이전트/모델 분포) 위에 4개 섹션 추가:

1. **에이전트 Health Status Strip** — 뷰 상단 컴팩트 바, 에이전트별 상태 닷/레이턴시/에러율
2. **에이전트별 비용 분해 테이블** — 정렬 가능, 7일 스파크라인, billed credits
3. **팀/코스트센터 예산 할당** — 진행률 바(green/amber/red) + NotificationContext 알림
4. **사용자별 사용량 테이블** — 페이지네이션, 팀 필터, 토큰 기준 정렬

## 통합 대상 카탈로그 컴포넌트

- `cost_budget_controls` → 팀 예산 할당 섹션으로 통합
- `system_health_dashboard` → Health Status Strip으로 통합

## 선정 사유

- 8회 연속 discovery 권장 후 최초 실행
- MS Agent Dashboard GA + GitHub cost center + Salesforce Health 패턴 반영
- Phase 1 QA PASS 상태에서 확장
