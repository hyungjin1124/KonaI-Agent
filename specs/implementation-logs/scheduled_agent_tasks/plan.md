# Plan: Scheduled Agent Tasks

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `src/components/features/scheduled-tasks/types.ts` | 타입 정의 (ScheduledTask, RecurrenceType 등) | 신규 |
| `src/components/features/scheduled-tasks/scheduledTasksData.ts` | Mock 데이터 + 헬퍼 | 신규 |
| `src/components/features/scheduled-tasks/useScheduledTasks.ts` | 상태 관리 Hook (CRUD + 필터) | 신규 |
| `src/components/features/scheduled-tasks/components/TaskStatusBadge.tsx` | 상태 뱃지 (active/paused/completed/failed) | 신규 |
| `src/components/features/scheduled-tasks/components/ScheduleForm.tsx` | 생성/편집 다이얼로그 폼 | 신규 |
| `src/components/features/scheduled-tasks/components/TaskTable.tsx` | 예약 작업 테이블 (목록 + 액션) | 신규 |
| `src/components/features/scheduled-tasks/components/ExecutionHistory.tsx` | 실행 이력 패널 | 신규 |
| `src/components/features/scheduled-tasks/ScheduledTasksView.tsx` | 메인 뷰 컴포넌트 (KPI + 테이블 + 이력) | 신규 |
| `src/components/features/scheduled-tasks/index.ts` | Barrel export | 신규 |
| `src/components/features/scheduled-tasks/ScheduledTasksView.test.tsx` | 단위 테스트 | 신규 |
| `src/components/AdminView.tsx` | Admin 탭에 "예약 작업" 탭 추가 | 수정 |

## Props Interface

```typescript
// 메인 뷰 — Props 없음 (AdminView에서 탭 콘텐츠로 렌더링)
export const ScheduledTasksView: React.FC = () => { ... }

// ScheduleForm
interface ScheduleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ScheduledTask | null; // null이면 생성, 값 있으면 편집
  onSave: (task: Omit<ScheduledTask, 'id' | 'createdAt' | 'executionHistory'>) => void;
}

// TaskTable
interface TaskTableProps {
  tasks: ScheduledTask[];
  onEdit: (task: ScheduledTask) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
  onRunNow: (id: string) => void;
  onViewHistory: (task: ScheduledTask) => void;
}

// ExecutionHistory
interface ExecutionHistoryProps {
  task: ScheduledTask | null;
  onClose: () => void;
}

// TaskStatusBadge
interface TaskStatusBadgeProps {
  status: TaskStatus;
}
```

## 상태 설계

### useScheduledTasks Hook
```typescript
// State
- tasks: ScheduledTask[] — 전체 작업 목록 (mock 데이터 초기화)
- filter: TaskStatusFilter — 상태 필터 (all/active/paused/completed/failed)

// Actions
- addTask(task) — 새 작업 추가
- updateTask(id, updates) — 작업 수정
- deleteTask(id) — 작업 삭제
- pauseTask(id) — 상태 → paused
- resumeTask(id) — 상태 → active
- runNow(id) — 즉시 실행 (mock: 이력에 추가)

// Computed
- filteredTasks — filter 적용된 목록
- kpiSummary — KPI 계산 (활성/일시정지/총 실행/성공률)
```

## 통합 지점

1. **AdminView** (`src/components/AdminView.tsx`)
   - import 추가: `import { ScheduledTasksView } from './features/scheduled-tasks';`
   - icon import 추가: `Clock` (from icons)
   - TabsTrigger 추가: `<TabsTrigger value="scheduled">🕐 예약 작업</TabsTrigger>`
   - TabsContent 추가: `<TabsContent value="scheduled"><ScheduledTasksView /></TabsContent>`

2. **라우팅**: 변경 불필요 (기존 `/admin` 라우트의 탭으로 통합)

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | 사용자가 예약 작업을 생성/편집/일시정지/재개/삭제할 수 있다 | ScheduleForm (생성/편집) + TaskTable 액션 버튼 (일시정지/재개/삭제) + useScheduledTasks Hook |
| 2 | 사이드바에 예약 작업 목록이 상태 뱃지와 함께 표시된다 | → Phase 1 범위: AdminView 탭으로 구현. 사이드바 통합은 Phase 2 |
| 3 | 최소 4가지 빈도 옵션(1회, 매일, 매주, 매월)을 지원한다 | ScheduleForm의 RecurrenceType select (once/daily/weekly/monthly) |
| 4 | 실행 이력(시간, 상태, 결과 요약)을 조회할 수 있다 | ExecutionHistory 패널 |
| 5 | 작업 완료/실패 시 인앱 알림이 표시된다 | → Phase 1: "즉시 실행" 시 NotificationContext.addAnomaly 호출로 시뮬레이션 |
| 6 | 관리자가 전체 예약 작업을 조회/관리할 수 있다 | ScheduledTasksView (Admin 탭 전체 화면) |

**Phase 1 범위 결정**: AC #2의 "사이드바"는 Admin 탭의 작업 목록으로 대체. 실제 Sidebar.tsx 수정은 Phase 2로 DEFER (사이드바 공간 경합 고려). AC #5는 mock 시뮬레이션으로 구현.

## 테스트 시나리오

| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | AC1: CRUD | 렌더링 → "새 작업" 버튼 클릭 → 폼 표시 확인 | RTL: render + findByText + fireEvent.click | must |
| 2 | AC1: CRUD | 작업 생성 → 폼 입력 → 저장 → 테이블에 표시 | RTL: userEvent.type + userEvent.click | must |
| 3 | AC1: 일시정지/재개 | 활성 작업의 일시정지 버튼 → 상태 변경 확인 | RTL: fireEvent.click + Badge 텍스트 확인 | must |
| 4 | AC1: 삭제 | 삭제 버튼 → 작업 제거 확인 | RTL: fireEvent.click + queryByText null 확인 | must |
| 5 | AC2: 상태 뱃지 | 각 상태(active/paused/completed/failed)의 뱃지 색상/텍스트 | RTL: render TaskStatusBadge + className 확인 | must |
| 6 | AC3: 빈도 옵션 | 폼에서 4가지 빈도 옵션 확인 | RTL: ScheduleForm render + select options 확인 | must |
| 7 | AC4: 실행 이력 | "이력 보기" 클릭 → ExecutionHistory 패널 표시 | RTL: fireEvent.click + 이력 항목 확인 | should |
| 8 | AC6: 관리자 뷰 | KPI 카드 4개 렌더링 확인 | RTL: data-testid로 KPI 카드 확인 | must |
| 9 | - | 필터 변경 시 테이블 필터링 동작 | RTL: 필터 클릭 → 테이블 행 수 변경 확인 | should |
| 10 | - | 빈 상태 (작업 없음) 표시 | RTL: 빈 tasks → 빈 상태 메시지 확인 | could |
