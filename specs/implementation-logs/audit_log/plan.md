# Plan: Audit Log

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| src/components/features/audit-log/auditLogData.ts | 타입 정의 + Mock 데이터 (50건+) + 상수 | 신규 |
| src/components/features/audit-log/AuditLogView.tsx | 메인 뷰 (KPI + 필터 + 테이블 + 상세 드로어) | 신규 |
| src/components/features/audit-log/AuditLogView.test.tsx | 단위 테스트 | 신규 |
| src/components/features/audit-log/index.ts | Barrel export | 신규 |
| src/components/AdminView.tsx | 4번째 탭 추가 (Audit Log) | 수정 |

## Props Interface

```typescript
// AuditLogView는 AdminView의 TabsContent에 직접 렌더링 — Props 없음
export const AuditLogView: React.FC = () => { ... }
```

## 타입 설계

```typescript
type ActorType = 'user' | 'agent' | 'system';
type ActionCategory = 'data_access' | 'settings_change' | 'tool_call' | 'authentication';
type Severity = 'info' | 'warning' | 'critical';
type ActionResult = 'success' | 'failure' | 'partial';
type TimeRange = '24h' | '7d' | '30d' | 'all';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: { type: ActorType; name: string; id: string };
  action: { type: string; category: ActionCategory; description: string };
  resource: { type: string; id: string; name: string };
  result: { status: ActionResult; details?: string };
  severity: Severity;
  sessionId?: string;
  reasoningSummary?: string;
  changes?: { field: string; before: string; after: string }[];
  metadata?: Record<string, string>;
}
```

## 상태 설계

모두 컴포넌트 로컬 state (기존 Admin 패턴과 동일):
- `searchQuery: string`
- `timeRange: TimeRange`
- `actorFilter: ActorType | 'all'`
- `categoryFilter: ActionCategory | 'all'`
- `severityFilter: Severity | 'all'`
- `selectedEntry: AuditLogEntry | null` (드로어 표시용)

## 통합 지점

- AdminView.tsx의 TabsList에 4번째 탭 추가
- TabsContent에 `<AuditLogView />` 렌더링
- import: `import { AuditLogView } from './features/audit-log';`

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | Admin "Audit Log" 탭 추가 | AdminView.tsx TabsTrigger + TabsContent |
| 2 | KPI 요약 바 4개 지표 | AuditLogView KPI 섹션 (KPICard 재사용) |
| 3 | 로그 테이블 6개 컬럼 | AuditLogView 테이블 섹션 |
| 4 | 시간 범위 필터 | AuditLogView timeRange state + Select |
| 5 | 액터 타입 필터 | AuditLogView actorFilter state + Select |
| 6 | 액션 타입 필터 | AuditLogView categoryFilter state + Select |
| 7 | 심각도 필터 | AuditLogView severityFilter state + Select |
| 8 | 행 클릭 → 상세 드로어 | AuditLogView Sheet + selectedEntry state |
| 9 | 드로어: before/after 변경 이력 | AuditLogView Sheet 내 changes 렌더링 |
| 10 | 드로어: 에이전트 추론 요약 | AuditLogView Sheet 내 reasoningSummary |
| 11 | 검색 키워드 필터 | AuditLogView searchQuery state + Input |
| 12 | 심각도별 색상 배지 | AuditLogView SeverityBadge 컴포넌트 |
| 13 | 반응형 레이아웃 | Tailwind responsive + overflow-x-auto |
| 14 | Mock 데이터 50건+ | auditLogData.ts |
| 15 | TypeScript strict | 전체 |
| 16 | 접근성 | ARIA labels, keyboard nav |

## 테스트 시나리오

| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | 기본 렌더링 | AuditLogView가 에러 없이 렌더링 | render + screen.getByText | must |
| 2 | KPI 4개 표시 | KPI 카드에 총 이벤트/에이전트 액션/경고/최근 활동 표시 | screen.getByText로 4개 지표 확인 | must |
| 3 | 테이블 컬럼 확인 | 6개 컬럼 헤더 존재 | screen.getByText로 컬럼명 확인 | must |
| 4 | 검색 필터링 | 검색어 입력 시 매칭 행만 표시 | userEvent.type + 행 수 확인 | must |
| 5 | 심각도 필터 | critical 선택 시 critical 행만 표시 | Select 변경 + 결과 확인 | must |
| 6 | 액터 타입 필터 | agent 선택 시 agent 행만 표시 | Select 변경 + 결과 확인 | must |
| 7 | 행 클릭 → 드로어 | 행 클릭 시 Sheet 열림 + 상세 정보 표시 | userEvent.click + Sheet 컨텐츠 확인 | must |
| 8 | 드로어 변경 이력 | settings_change 항목 클릭 시 before/after 표시 | 특정 행 클릭 + changes 텍스트 확인 | should |
| 9 | 심각도별 색상 | critical → red, warning → yellow 배지 | className 확인 | should |
| 10 | 50건+ 데이터 | mock 데이터 50건 이상 | data length 확인 | must |
