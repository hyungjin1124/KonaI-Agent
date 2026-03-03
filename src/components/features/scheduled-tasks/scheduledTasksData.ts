import type { ScheduledTask, RecurrenceType, TaskStatusFilter } from './types';

// --- Recurrence Labels ---

export const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'once', label: '1회' },
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
];

export const STATUS_FILTER_OPTIONS: { value: TaskStatusFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '활성' },
  { value: 'paused', label: '일시정지' },
  { value: 'completed', label: '완료' },
  { value: 'failed', label: '실패' },
];

export const WEEKDAY_OPTIONS = [
  { value: 0, label: '일요일' },
  { value: 1, label: '월요일' },
  { value: 2, label: '화요일' },
  { value: 3, label: '수요일' },
  { value: 4, label: '목요일' },
  { value: 5, label: '금요일' },
  { value: 6, label: '토요일' },
];

// --- Mock Tasks ---

export const MOCK_SCHEDULED_TASKS: ScheduledTask[] = [
  {
    id: 'task-1',
    name: '주간 매출 리포트 생성',
    instructions: '지난 7일간의 매출 데이터를 분석하여 주요 KPI 변동과 인사이트를 포함한 주간 리포트를 생성합니다.',
    recurrence: 'weekly',
    scheduledTime: '09:00',
    scheduledDay: 1,
    status: 'active',
    createdAt: '2026-02-15T10:00:00',
    nextRun: '2026-03-09T09:00:00',
    lastRun: '2026-03-02T09:00:00',
    executionHistory: [
      { id: 'exec-1-1', executedAt: '2026-03-02T09:00:00', status: 'success', durationMs: 45200, resultSummary: '주간 매출 리포트 생성 완료. 전주 대비 +12.3% 성장.' },
      { id: 'exec-1-2', executedAt: '2026-02-24T09:00:00', status: 'success', durationMs: 38400, resultSummary: '주간 매출 리포트 생성 완료. 전주 대비 -2.1% 하락.' },
      { id: 'exec-1-3', executedAt: '2026-02-17T09:00:00', status: 'failure', durationMs: 12100, resultSummary: '데이터 소스 연결 실패. 재시도 필요.' },
    ],
  },
  {
    id: 'task-2',
    name: '일일 이상치 탐지',
    instructions: '전일 트랜잭션 데이터에서 이상치를 탐지하고, 임계값을 초과하는 항목을 알림으로 보고합니다.',
    recurrence: 'daily',
    scheduledTime: '07:30',
    status: 'active',
    createdAt: '2026-02-20T14:00:00',
    nextRun: '2026-03-03T07:30:00',
    lastRun: '2026-03-02T07:30:00',
    executionHistory: [
      { id: 'exec-2-1', executedAt: '2026-03-02T07:30:00', status: 'success', durationMs: 28700, resultSummary: '이상치 2건 탐지. 알림 발송 완료.' },
      { id: 'exec-2-2', executedAt: '2026-03-01T07:30:00', status: 'success', durationMs: 31200, resultSummary: '이상치 0건. 정상 범위 내.' },
    ],
  },
  {
    id: 'task-3',
    name: '월간 비용 분석',
    instructions: '이전 달의 AI 사용 비용을 모델별, 부서별로 분석하여 비용 최적화 제안을 생성합니다.',
    recurrence: 'monthly',
    scheduledTime: '10:00',
    scheduledDay: 1,
    status: 'active',
    createdAt: '2026-01-05T11:00:00',
    nextRun: '2026-04-01T10:00:00',
    lastRun: '2026-03-01T10:00:00',
    executionHistory: [
      { id: 'exec-3-1', executedAt: '2026-03-01T10:00:00', status: 'success', durationMs: 67300, resultSummary: '2월 비용 $2,847. GPT-4o 비중 62%. 비용 절감 3개 제안 생성.' },
      { id: 'exec-3-2', executedAt: '2026-02-01T10:00:00', status: 'success', durationMs: 58100, resultSummary: '1월 비용 $2,530. 전월 대비 +8.2%. Haiku 모델 전환 권장.' },
    ],
  },
  {
    id: 'task-4',
    name: '경쟁사 뉴스 모니터링',
    instructions: '주요 경쟁사(카카오, 네이버, 토스)의 AI 관련 뉴스를 수집하고 요약합니다.',
    recurrence: 'daily',
    scheduledTime: '08:00',
    status: 'paused',
    createdAt: '2026-02-10T09:00:00',
    nextRun: null,
    lastRun: '2026-02-28T08:00:00',
    executionHistory: [
      { id: 'exec-4-1', executedAt: '2026-02-28T08:00:00', status: 'success', durationMs: 52400, resultSummary: '뉴스 5건 수집. 카카오 AI 에이전트 출시 관련 기사 포함.' },
    ],
  },
  {
    id: 'task-5',
    name: '데이터 품질 점검',
    instructions: '핵심 데이터 파이프라인의 데이터 품질을 점검하고, 결측치/중복/형식 오류를 보고합니다.',
    recurrence: 'weekly',
    scheduledTime: '06:00',
    scheduledDay: 1,
    status: 'failed',
    createdAt: '2026-02-01T10:00:00',
    nextRun: null,
    lastRun: '2026-03-02T06:00:00',
    executionHistory: [
      { id: 'exec-5-1', executedAt: '2026-03-02T06:00:00', status: 'failure', durationMs: 5400, resultSummary: '데이터 파이프라인 접근 권한 만료. 관리자 승인 필요.' },
      { id: 'exec-5-2', executedAt: '2026-02-24T06:00:00', status: 'failure', durationMs: 3200, resultSummary: '타임아웃 — 데이터 소스 응답 없음.' },
    ],
  },
  {
    id: 'task-6',
    name: '2025 연간 보고서 생성',
    instructions: '2025년 연간 실적 데이터를 분석하여 종합 보고서를 생성합니다.',
    recurrence: 'once',
    scheduledTime: '14:00',
    status: 'completed',
    createdAt: '2026-01-15T09:00:00',
    nextRun: null,
    lastRun: '2026-01-20T14:00:00',
    executionHistory: [
      { id: 'exec-6-1', executedAt: '2026-01-20T14:00:00', status: 'success', durationMs: 128400, resultSummary: '연간 보고서 생성 완료. 48페이지, 12개 차트 포함.' },
    ],
  },
];

// --- Helpers ---

export function getRecurrenceLabel(recurrence: RecurrenceType): string {
  return RECURRENCE_OPTIONS.find(o => o.value === recurrence)?.label ?? recurrence;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}초`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}분 ${remainingSeconds}초` : `${minutes}분`;
}
