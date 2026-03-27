import type {
  AgentStatusKPI,
  AgentError,
  CostUsageKPI,
  DailyTokenCostData,
  ModelCostRatio,
  ModelConfig,
} from '../types/admin.types';

// ── §1 에이전트 상태 ──────────────────────────────────────────────────────────

export const AGENT_STATUS_KPI: AgentStatusKPI = {
  successRate: { value: '98.2%', change: '+0.4%' },
  failureRate: { value: '1.8%', change: '-0.4%' },
  totalExecutions: { value: '1,247', change: '+12.3%' },
};

export const AGENT_ERRORS: AgentError[] = [
  { id: 'err-01', time: '2026.03.26 14:32', userName: '류개발', errorType: 'Timeout', failedStep: 'Tool Call (DB 조회)', summary: '15초 내 응답 없음 — 커넥션 풀 포화 추정', conversationId: 'conv-201' },
  { id: 'err-02', time: '2026.03.26 13:15', userName: '이기획', errorType: 'Model Error', failedStep: '응답 생성', summary: 'Rate limit exceeded (Claude) — 재시도 3회 후 실패', conversationId: 'conv-198' },
  { id: 'err-03', time: '2026.03.26 11:47', userName: '한관리', errorType: 'Tool Error', failedStep: 'Tool Call (이메일 발송)', summary: 'SMTP 인증 실패 — 토큰 만료', conversationId: 'conv-195' },
  { id: 'err-04', time: '2026.03.26 10:05', userName: '성Biz', errorType: 'Timeout', failedStep: 'Tool Call (외부 API)', summary: 'ERP API 타임아웃 — 서버 점검 중', conversationId: 'conv-190' },
  { id: 'err-05', time: '2026.03.25 17:22', userName: '김대표', errorType: 'Model Error', failedStep: '응답 생성', summary: 'Context length exceeded (128K) — 문서 첨부 과다', conversationId: 'conv-187' },
  { id: 'err-06', time: '2026.03.25 16:04', userName: '강CFO', errorType: 'Tool Error', failedStep: 'Tool Call (차트 생성)', summary: 'Recharts render error — 데이터 형식 불일치', conversationId: 'conv-185' },
  { id: 'err-07', time: '2026.03.25 14:38', userName: '오실장', errorType: 'Timeout', failedStep: 'RAG 검색', summary: 'Vector DB 검색 30초 초과 — 인덱스 재구축 필요', conversationId: 'conv-182' },
  { id: 'err-08', time: '2026.03.25 11:11', userName: '노영업', errorType: 'Model Error', failedStep: '응답 생성', summary: 'JSON parse error — 모델 출력 형식 불일치', conversationId: 'conv-178' },
  { id: 'err-09', time: '2026.03.25 09:55', userName: '양AI', errorType: 'Tool Error', failedStep: 'Tool Call (PPT 생성)', summary: 'python-pptx 라이브러리 오류 — 템플릿 누락', conversationId: 'conv-175' },
  { id: 'err-10', time: '2026.03.24 18:30', userName: '전지원', errorType: 'Timeout', failedStep: 'Tool Call (파일 업로드)', summary: 'S3 업로드 타임아웃 — 파일 200MB 초과', conversationId: 'conv-170' },
  { id: 'err-11', time: '2026.03.24 16:44', userName: '박기획', errorType: 'Model Error', failedStep: '응답 생성', summary: 'Content filter triggered — 민감 데이터 포함', conversationId: 'conv-168' },
  { id: 'err-12', time: '2026.03.24 14:18', userName: '최혁신', errorType: 'Tool Error', failedStep: 'Tool Call (Slack 알림)', summary: 'Webhook URL 변경됨 — 404 반환', conversationId: 'conv-165' },
  { id: 'err-13', time: '2026.03.24 11:02', userName: '서인사', errorType: 'Timeout', failedStep: 'RAG 검색', summary: 'Embedding API 지연 — 배치 처리 대기열 초과', conversationId: 'conv-160' },
  { id: 'err-14', time: '2026.03.24 09:30', userName: '임재무', errorType: 'Model Error', failedStep: '응답 생성', summary: 'Function calling schema 불일치 — 툴 정의 업데이트 필요', conversationId: 'conv-158' },
  { id: 'err-15', time: '2026.03.23 17:45', userName: '조회계', errorType: 'Tool Error', failedStep: 'Tool Call (DB 조회)', summary: 'SQL injection 방지 필터 오탐 — 정상 쿼리 차단', conversationId: 'conv-155' },
  { id: 'err-16', time: '2026.03.23 15:20', userName: '배세무', errorType: 'Timeout', failedStep: 'Tool Call (외부 API)', summary: '국세청 API 응답 없음 — 시스템 점검 시간', conversationId: 'conv-150' },
  { id: 'err-17', time: '2026.03.23 13:55', userName: '문해외', errorType: 'Model Error', failedStep: '응답 생성', summary: '다국어 처리 오류 — 한/영/일 혼합 입력', conversationId: 'conv-148' },
  { id: 'err-18', time: '2026.03.23 10:30', userName: '장그룹장', errorType: 'Tool Error', failedStep: 'Tool Call (코드 실행)', summary: 'Sandbox 메모리 초과 — 대용량 데이터프레임', conversationId: 'conv-145' },
  { id: 'err-19', time: '2026.03.22 16:15', userName: '하문화', errorType: 'Timeout', failedStep: 'Tool Call (이미지 생성)', summary: 'DALL-E API 큐 대기 120초 초과', conversationId: 'conv-140' },
  { id: 'err-20', time: '2026.03.22 14:00', userName: '구부문장', errorType: 'Model Error', failedStep: '응답 생성', summary: 'Token 예산 초과 — max_tokens 설정 미달', conversationId: 'conv-138' },
  { id: 'err-21', time: '2026.03.22 11:33', userName: '남부서장', errorType: 'Tool Error', failedStep: 'Tool Call (DB 조회)', summary: 'PostgreSQL 커넥션 리셋 — 네트워크 순단', conversationId: 'conv-135' },
  { id: 'err-22', time: '2026.03.22 09:10', userName: '심SCM', errorType: 'Timeout', failedStep: 'RAG 검색', summary: '대용량 문서 임베딩 타임아웃 — 500페이지 PDF', conversationId: 'conv-130' },
  { id: 'err-23', time: '2026.03.21 17:50', userName: '황생산', errorType: 'Model Error', failedStep: '응답 생성', summary: 'Streaming 중단 — WebSocket 연결 끊김', conversationId: 'conv-128' },
  { id: 'err-24', time: '2026.03.21 15:25', userName: '안실장', errorType: 'Tool Error', failedStep: 'Tool Call (결제 API)', summary: 'PG사 API 인증 키 만료', conversationId: 'conv-125' },
  { id: 'err-25', time: '2026.03.21 10:08', userName: '권보안', errorType: 'Timeout', failedStep: 'Tool Call (보안 스캔)', summary: '취약점 스캔 타임아웃 — 스캔 대상 과다', conversationId: 'conv-120' },
];

// ── §2 비용/사용량 ──────────────────────────────────────────────────────────

export const COST_USAGE_KPI: CostUsageKPI = {
  monthCost: { value: '₩1,247,000', change: '+8.3%' },
  totalTokens: { value: '2.4M' },
  avgDailyCost: { value: '₩48,000' },
};

// 30일치 일별 토큰 + 누적 비용
export const DAILY_TOKEN_COST_DATA: DailyTokenCostData[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 2, i + 1); // March 2026
  const day = date.getDate();
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const base = isWeekend ? 0.4 : 1;

  const claude = Math.round((40 + Math.random() * 30) * base);
  const gpt4o = Math.round((15 + Math.random() * 15) * base);
  const other = Math.round((3 + Math.random() * 5) * base);
  const dailyCost = (claude * 15 + gpt4o * 10 + other * 5) * 100;

  return {
    date: `3/${day}`,
    claude,
    gpt4o,
    other,
    cumulativeCost: 0, // will be computed below
  };
});

// 누적 비용 계산
let cumCost = 0;
for (const d of DAILY_TOKEN_COST_DATA) {
  const daily = (d.claude * 15 + d.gpt4o * 10 + d.other * 5) * 100;
  cumCost += daily;
  d.cumulativeCost = Math.round(cumCost / 1000); // K₩ 단위
}

export const MODEL_COST_RATIOS: ModelCostRatio[] = [
  { model: 'Claude Opus 4', percentage: 68, amount: '₩848K', color: '#FF3C42' },
  { model: 'GPT-4o', percentage: 24, amount: '₩299K', color: '#3B82F6' },
  { model: 'Claude Haiku', percentage: 5, amount: '₩62K', color: '#F59E0B' },
  { model: '기타', percentage: 3, amount: '₩38K', color: '#94A3B8' },
];

// ── 모델 설정 ───────────────────────────────────────────────────────────────

export const MODEL_CONFIGS: ModelConfig[] = [
  { id: 'mc-01', provider: 'Anthropic', modelName: 'Claude Opus 4', apiKeyStatus: '정상', daysToExpiry: 45, isActive: true },
  { id: 'mc-02', provider: 'Anthropic', modelName: 'Claude Haiku 4.5', apiKeyStatus: '정상', daysToExpiry: 45, isActive: true },
  { id: 'mc-03', provider: 'OpenAI', modelName: 'GPT-4o', apiKeyStatus: '만료 임박', daysToExpiry: 5, isActive: true },
  { id: 'mc-04', provider: 'OpenAI', modelName: 'GPT-4o mini', apiKeyStatus: '만료', daysToExpiry: 0, isActive: false },
];
