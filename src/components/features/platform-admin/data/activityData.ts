import type {
  AgentTrace,
  AgentPerformanceMetrics,
  SkillUsageStat,
} from './platformAdminTypes';

// ---- Performance Metrics ----
export const AGENT_PERFORMANCE_METRICS: AgentPerformanceMetrics = {
  avgTtftMs: 1240,
  p50TtftMs: 980,
  p95TtftMs: 2850,
  p99TtftMs: 5120,
  avgLatencyMs: 3420,
  successRate: 94.2,
  totalTraces: 1847,
};

// ---- Trace List ----
export const MOCK_AGENT_TRACES: AgentTrace[] = [
  {
    traceId: 'tr-001',
    agentName: 'KonaI Agent',
    tenantName: '삼성전자',
    status: 'success',
    startedAt: '2026-03-18 09:12:34',
    durationMs: 4320,
    ttftMs: 820,
    tokenCount: 12450,
    cost: 0.187,
    steps: [
      { id: 's1', name: '문서 파싱', type: 'tool', startMs: 0, durationMs: 320, status: 'success' },
      { id: 's2', name: 'GPT-4o 요약', type: 'llm', startMs: 320, durationMs: 2100, status: 'success', model: 'gpt-4o', tokenCount: 8200 },
      { id: 's3', name: '조항 검색', type: 'retrieval', startMs: 2420, durationMs: 480, status: 'success' },
      { id: 's4', name: 'Claude 분석', type: 'llm', startMs: 2900, durationMs: 1100, status: 'success', model: 'claude-sonnet-4-6', tokenCount: 4250 },
      { id: 's5', name: '결과 포맷', type: 'output', startMs: 4000, durationMs: 320, status: 'success' },
    ],
  },
  {
    traceId: 'tr-002',
    agentName: 'KonaI Agent',
    tenantName: '현대자동차',
    status: 'failure',
    startedAt: '2026-03-18 09:08:11',
    durationMs: 8100,
    ttftMs: 3200,
    tokenCount: 5200,
    cost: 0.078,
    steps: [
      { id: 's1', name: '데이터 수집', type: 'tool', startMs: 0, durationMs: 1200, status: 'success' },
      { id: 's2', name: 'GPT-4o 분석', type: 'llm', startMs: 1200, durationMs: 3800, status: 'success', model: 'gpt-4o', tokenCount: 5200 },
      { id: 's3', name: '차트 생성 도구', type: 'tool', startMs: 5000, durationMs: 3100, status: 'failure' },
    ],
  },
  {
    traceId: 'tr-003',
    agentName: 'KonaI Agent',
    tenantName: '스타트업 A',
    status: 'success',
    startedAt: '2026-03-18 09:05:22',
    durationMs: 1840,
    ttftMs: 620,
    tokenCount: 3100,
    cost: 0.031,
    steps: [
      { id: 's1', name: '의도 분류', type: 'llm', startMs: 0, durationMs: 680, status: 'success', model: 'claude-haiku-4-5', tokenCount: 800 },
      { id: 's2', name: 'FAQ 검색', type: 'retrieval', startMs: 680, durationMs: 340, status: 'success' },
      { id: 's3', name: '답변 생성', type: 'llm', startMs: 1020, durationMs: 820, status: 'success', model: 'claude-haiku-4-5', tokenCount: 2300 },
    ],
  },
  {
    traceId: 'tr-004',
    agentName: 'KonaI Agent',
    tenantName: '삼성전자',
    status: 'timeout',
    startedAt: '2026-03-18 08:58:47',
    durationMs: 30000,
    ttftMs: 0,
    tokenCount: 0,
    cost: 0,
    steps: [
      { id: 's1', name: '요구사항 파싱', type: 'tool', startMs: 0, durationMs: 800, status: 'success' },
      { id: 's2', name: 'Claude 초안 작성', type: 'llm', startMs: 800, durationMs: 29200, status: 'timeout', model: 'claude-opus-4-6' },
    ],
  },
  {
    traceId: 'tr-005',
    agentName: 'KonaI Agent',
    tenantName: 'D 그룹',
    status: 'success',
    startedAt: '2026-03-18 08:55:01',
    durationMs: 6730,
    ttftMs: 1100,
    tokenCount: 18900,
    cost: 0.284,
    steps: [
      { id: 's1', name: 'DB 쿼리', type: 'tool', startMs: 0, durationMs: 420, status: 'success' },
      { id: 's2', name: '데이터 변환', type: 'tool', startMs: 420, durationMs: 1180, status: 'success' },
      { id: 's3', name: 'GPT-4o 인사이트', type: 'llm', startMs: 1600, durationMs: 3800, status: 'success', model: 'gpt-4o', tokenCount: 18900 },
      { id: 's4', name: '리포트 저장', type: 'tool', startMs: 5400, durationMs: 1330, status: 'success' },
    ],
  },
  {
    traceId: 'tr-006',
    agentName: 'KonaI Agent',
    tenantName: '현대자동차',
    status: 'success',
    startedAt: '2026-03-18 08:49:33',
    durationMs: 2100,
    ttftMs: 740,
    tokenCount: 2800,
    cost: 0.028,
    steps: [
      { id: 's1', name: '맥락 파악', type: 'llm', startMs: 0, durationMs: 900, status: 'success', model: 'claude-haiku-4-5', tokenCount: 1200 },
      { id: 's2', name: '초안 작성', type: 'llm', startMs: 900, durationMs: 1200, status: 'success', model: 'claude-haiku-4-5', tokenCount: 1600 },
    ],
  },
];

// ---- Skill Usage ----
export const MOCK_SKILL_USAGE: SkillUsageStat[] = [
  { skillId: 'sk-001', skillName: '문서 요약', category: '문서 처리', callCount: 4821, avgLatencyMs: 1240, successRate: 97.3, avgCost: 0.042 },
  { skillId: 'sk-002', skillName: '웹 검색', category: '검색', callCount: 3642, avgLatencyMs: 890, successRate: 91.5, avgCost: 0.008 },
  { skillId: 'sk-003', skillName: '코드 생성', category: '개발', callCount: 2918, avgLatencyMs: 2340, successRate: 88.9, avgCost: 0.156 },
  { skillId: 'sk-004', skillName: '데이터 분석', category: '분석', callCount: 2104, avgLatencyMs: 3120, successRate: 93.7, avgCost: 0.234 },
  { skillId: 'sk-005', skillName: '이메일 초안', category: '커뮤니케이션', callCount: 1876, avgLatencyMs: 980, successRate: 98.2, avgCost: 0.028 },
  { skillId: 'sk-006', skillName: 'SQL 쿼리 생성', category: '개발', callCount: 1543, avgLatencyMs: 1780, successRate: 85.4, avgCost: 0.089 },
  { skillId: 'sk-007', skillName: '번역', category: '언어', callCount: 1238, avgLatencyMs: 760, successRate: 99.1, avgCost: 0.015 },
  { skillId: 'sk-008', skillName: '이미지 분석', category: '비전', callCount: 892, avgLatencyMs: 1650, successRate: 90.2, avgCost: 0.067 },
];

// ---- Trace status distribution (for donut chart) ----
export const TRACE_STATUS_DIST = [
  { name: '성공', value: 1739, fill: '#22c55e' },
  { name: '실패', value: 72, fill: '#ef4444' },
  { name: '타임아웃', value: 36, fill: '#f59e0b' },
];
