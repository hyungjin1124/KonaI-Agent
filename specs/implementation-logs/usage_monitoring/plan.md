# Plan: Usage Monitoring Dashboard — Phase 2

## 파일 구조
| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| src/components/features/usage-monitoring/usageMonitoringData.ts | Phase 2 mock 데이터 + 타입 추가 | 수정 |
| src/components/features/usage-monitoring/components/HealthStatusStrip.tsx | 에이전트 Health 상태 바 | 신규 |
| src/components/features/usage-monitoring/components/AgentCostTable.tsx | 에이전트별 비용 분해 테이블 | 신규 |
| src/components/features/usage-monitoring/components/TeamBudgetSection.tsx | 팀 예산 할당 + 3단계 알림 | 신규 |
| src/components/features/usage-monitoring/components/UserUsageTable.tsx | 사용자별 사용량 테이블 | 신규 |
| src/components/features/usage-monitoring/UsageMonitoringView.tsx | Phase 2 섹션 통합 | 수정 |
| src/components/features/usage-monitoring/UsageMonitoringView.test.tsx | Phase 2 테스트 추가 | 수정 |

## Props Interface

```typescript
// HealthStatusStrip - standalone, no props
interface AgentHealthStatus {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  errorRate: number;
}

// AgentCostTable - standalone
interface AgentCostBreakdown {
  id: string;
  name: string;
  totalTokens: number;
  costUsd: number;
  billedCredits: number;
  activeUsers: number;
  weeklyTrend: number[]; // 7일 스파크라인
  color: string;
}

// TeamBudgetSection - standalone
interface TeamBudget {
  id: string;
  name: string;
  monthlyTokenQuota: number;
  currentUsage: number;
  budgetUsd: number;
  spentUsd: number;
  memberCount: number;
}

// UserUsageTable - standalone
interface UserUsageData {
  id: string;
  name: string;
  email: string;
  team: string;
  totalTokens: number;
  costUsd: number;
  activeAgents: string[];
  lastActivity: string;
}
```

## 상태 설계
- HealthStatusStrip: 상태 없음 (순수 표시)
- AgentCostTable: `sortField`, `sortDirection` (로컬 state)
- TeamBudgetSection: 상태 없음 (NotificationContext로 알림 트리거)
- UserUsageTable: `currentPage`, `teamFilter`, `sortField` (로컬 state)
- 기존 `period` state 유지 (Phase 1)

## 통합 지점
- UsageMonitoringView.tsx에 4개 섹션 추가 (Phase 1 아래)
- 섹션 순서: Health Strip → KPI → 일별 트렌드 → 에이전트/모델 차트 → 에이전트 비용 테이블 → 팀 예산 → 사용자 테이블
- NotificationContext: TeamBudgetSection에서 90%+ 초과 팀의 알림 트리거

## Acceptance Criteria 매핑
| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | 에이전트별 비용 테이블 (5개 에이전트, 정렬 가능) | AgentCostTable.tsx |
| 2 | 에이전트 행: 토큰/비용/credit/사용자/스파크라인 | AgentCostTable.tsx |
| 3 | 팀 예산 할당 (3개 팀, 75%/90% 색상 전환) | TeamBudgetSection.tsx |
| 4 | 90% 초과 시 NotificationContext 알림 | TeamBudgetSection.tsx |
| 5 | Health Status Strip (상태 닷/레이턴시/에러율) | HealthStatusStrip.tsx |
| 6 | 사용자 테이블 (페이지네이션, 팀 필터, 정렬) | UserUsageTable.tsx |
| 7 | KPICard/ChartWidget/Recharts 재사용 | AgentCostTable (스파크라인), ChartWidget 래퍼 |
| 8 | 새 의존성 없이 구현 | 전체 |

## 테스트 시나리오
| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | Health Strip 렌더링 | 4개 에이전트 상태 칩 표시 | queryByText(agent names) | must |
| 2 | Health 상태 색상 | green/yellow/red 닷 표시 | className 확인 | must |
| 3 | 에이전트 비용 테이블 | 5개 행 렌더링 + 컬럼 헤더 | queryAllByRole('row') | must |
| 4 | 비용 정렬 | 헤더 클릭 시 정렬 변경 | userEvent.click → 순서 확인 | must |
| 5 | 팀 예산 3개 팀 | 진행률 바 3개 표시 | queryByText(team names) | must |
| 6 | 예산 색상 전환 | 75%→amber, 90%→red | className 확인 | must |
| 7 | 사용자 테이블 렌더링 | 첫 페이지 5행 표시 | queryAllByRole('row') | must |
| 8 | 페이지네이션 | 다음 페이지 클릭 시 데이터 변경 | userEvent.click → 새 데이터 확인 | should |
| 9 | 팀 필터 | 특정 팀 선택 시 필터링 | userEvent.click → 행 수 확인 | should |
| 10 | 스파크라인 SVG | 에이전트 행에 SVG 렌더링 | querySelector('svg') | should |
