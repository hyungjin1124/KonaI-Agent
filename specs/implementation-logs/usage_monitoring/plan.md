# Plan: Usage Monitoring Dashboard

## 파일 구조
| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| src/components/features/usage-monitoring/UsageMonitoringView.tsx | 메인 대시보드 컴포넌트 (KPI + 차트 그리드) | 신규 |
| src/components/features/usage-monitoring/usageMonitoringData.ts | Mock 데이터 + 타입 정의 | 신규 |
| src/components/features/usage-monitoring/index.ts | Barrel export | 신규 |
| src/components/features/usage-monitoring/UsageMonitoringView.test.tsx | 단위 테스트 | 신규 |
| src/components/AdminView.tsx | "사용량" 탭 추가 | 수정 |

## 설계 결정

### 1. 독립적 뷰 vs LiveboardView WIDGET_REGISTRY 확장

**결정**: 독립적 뷰 (UsageMonitoringView)

**이유**:
- LiveboardView의 WIDGET_REGISTRY에 usage 위젯을 추가하면 WidgetId 타입, WIDGET_METADATA, WIDGET_REGISTRY 세 곳을 수정해야 하며, 기존 대시보드 레이아웃에 영향을 줄 수 있음
- Usage Monitoring은 Admin 컨텍스트에서만 사용되므로 독립적 뷰가 적합
- KPICard, ChartWidget 공유 컴포넌트는 import해서 재사용하되, 위젯 그리드는 CSS Grid로 간소하게 구현 (react-grid-layout의 드래그/리사이즈는 Phase 2에서 추가)
- dashboard.types.ts의 WidgetId 타입 변경 불필요 → 기존 코드 무영향

### 2. 라우팅

AdminView 내 Tabs에 "사용량" 탭 추가. 별도 라우트 불필요 (Admin 탭 내부 전환).

### 3. Mock 데이터 구조

리서치 문서의 "Phase 1 MVP" 기준:
- KPI 4종: 총 토큰, 총 비용, 활성 사용자, 에이전트 실행 수
- 시계열 트렌드: 30일 일별 토큰/비용 데이터
- 에이전트 분포: PPT, 분석, 채팅, 데이터 에이전트별 사용 비율
- 모델별 비용: GPT-4o, Claude 3.5, GPT-4o-mini 등 분포

## Props Interface

```typescript
// UsageMonitoringView는 standalone — props 없음 (AdminView 내부 탭)
// 내부적으로 기간 필터 state 관리

interface UsageKPI {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  subtitle: string;
}

interface DailyUsageData {
  date: string;
  tokens: number;
  cost: number;
}

interface AgentUsageData {
  name: string;
  value: number;
  color: string;
}

interface ModelCostData {
  name: string;
  cost: number;
  tokens: number;
  color: string;
}
```

## 상태 설계
- `selectedPeriod`: '7d' | '30d' | '90d' — 기간 필터 (기본값: '30d')
- 모든 데이터는 mock — 추후 API 교체 가능하도록 데이터 레이어 분리

## 통합 지점
- AdminView.tsx에 세 번째 탭 "사용량" 추가
- 기존 KPICard (shared/atoms), ChartWidget (shared/molecules) import 사용
- Recharts (BarChart, LineChart, ComposedChart, PieChart) 사용

## Acceptance Criteria 매핑
| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | Admin에 "Usage" 탭 추가 | AdminView.tsx — TabsTrigger + TabsContent |
| 2 | KPI 카드 4종 + 전주 대비 증감 | UsageMonitoringView.tsx — KPICard 4개 |
| 3 | 일별 토큰/비용 추이 (30일) | UsageMonitoringView.tsx — ComposedChart |
| 4 | 에이전트 유형별 분포 차트 | UsageMonitoringView.tsx — BarChart (horizontal) |
| 5 | react-grid-layout + localStorage | Phase 2로 연기. Phase 1은 CSS Grid로 반응형 레이아웃 |
| 6 | 기존 KPICard/ChartWidget 재사용 | UsageMonitoringView.tsx — import 확인 |
| 7 | mock 데이터로 차트 정상 렌더링 | usageMonitoringData.ts — 전체 mock 데이터 |
| 8 | 반응형 레이아웃 | CSS Grid + Tailwind responsive classes |

**Note**: AC #5 (react-grid-layout + localStorage)는 Phase 1에서 CSS Grid 기반 레이아웃으로 대체. 반응형 대응은 충족하되, 드래그/리사이즈는 Phase 2. 이는 리서치 문서의 "점진적 구현" 전략과 일치.

## 테스트 시나리오
| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | Admin "Usage" 탭 | 탭 클릭 시 사용량 뷰 표시 | render AdminView → click 탭 → queryByText | must |
| 2 | KPI 카드 4종 렌더링 | 총 토큰/비용/사용자/실행 수 표시 | queryAllByRole → expect 4 KPI | must |
| 3 | KPI 증감 표시 | 각 카드에 trend badge 존재 | queryByText('%') | must |
| 4 | 일별 트렌드 차트 | ComposedChart 렌더링 확인 | container querySelector('svg') | must |
| 5 | 에이전트 분포 차트 | BarChart 렌더링 확인 | container querySelector('svg') 2개 | must |
| 6 | 기간 필터 동작 | 7일/30일/90일 버튼 클릭 시 활성 상태 변경 | userEvent.click → check active class | should |
| 7 | mock 데이터 정합성 | 30일 데이터 포인트 존재 | import mock → expect length >= 30 | should |
| 8 | 모델별 비용 차트 | PieChart 렌더링 확인 | container querySelector('svg') 3개 | should |
