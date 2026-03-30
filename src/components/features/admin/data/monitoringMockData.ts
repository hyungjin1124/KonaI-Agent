import type {
  AgentStatusKPI,
  AgentError,
  CostUsageKPI,
  DailyCostData,
  ModelConfig,
} from '../types/admin.types';

// ── §1 에이전트 상태 ──────────────────────────────────────────────────────────

export const AGENT_STATUS_KPI: AgentStatusKPI = {
  successRate: { value: '98.2%', change: '+0.4%' },
  failureRate: { value: '1.8%', change: '-0.4%' },
  totalExecutions: { value: '1,247', change: '+12.3%' },
};

export const AGENT_ERRORS: AgentError[] = [
  { id: 'err-01', time: '2026.03.26 14:32', userName: '류개발', userTeam: 'AI사업팀', errorType: 'Timeout', failedStep: 'Tool Call (DB 조회)', summary: '15초 내 응답 없음 — 커넥션 풀 포화 추정', errorMessage: 'Connection timed out after 15s to db.kona.com:5432', model: 'Claude Opus 4', skill: '매출 분석', retryCount: '2/3', conversationId: 'conv-201', similarErrorCount: 4, affectedUsers: '류개발 외 2명', estimatedCause: 'DB 서버 커넥션 풀 포화 (내부 인프라)' },
  { id: 'err-02', time: '2026.03.26 13:15', userName: '이기획', userTeam: '사업1팀', errorType: 'Model Error', failedStep: '응답 생성', summary: 'Rate limit exceeded (Claude) — 재시도 3회 후 실패', errorMessage: 'anthropic.RateLimitError: 429 Too Many Requests', model: 'Claude Opus 4', skill: '보고서 생성', retryCount: '3/3', conversationId: 'conv-198', similarErrorCount: 2, affectedUsers: '이기획 외 1명', estimatedCause: 'API 요청 한도 초과 (외부 의존성)' },
  { id: 'err-03', time: '2026.03.26 11:47', userName: '한관리', userTeam: '경영지원팀', errorType: 'Tool Error', failedStep: 'Tool Call (이메일 발송)', summary: 'SMTP 인증 실패 — 토큰 만료', errorMessage: 'SMTPAuthenticationError: 535 Authentication failed', model: 'Claude Opus 4', skill: '이메일 발송', retryCount: '1/3', conversationId: 'conv-195', similarErrorCount: 1, affectedUsers: '한관리', estimatedCause: 'SMTP 인증 토큰 만료 (내부 설정)' },
  { id: 'err-04', time: '2026.03.26 10:05', userName: '성Biz', userTeam: '사업1팀', errorType: 'Timeout', failedStep: 'Tool Call (외부 API)', summary: 'ERP API 타임아웃 — 서버 점검 중', errorMessage: 'Connection timed out after 30s to erp.kona.com:443', model: 'GPT-4o', skill: '매출 분석', retryCount: '3/3', conversationId: 'conv-190', similarErrorCount: 4, affectedUsers: '성Biz 외 3명', estimatedCause: 'ERP 서버 응답 지연 (외부 의존성)' },
  { id: 'err-05', time: '2026.03.25 17:22', userName: '김대표', userTeam: '경영진', errorType: 'Model Error', failedStep: '응답 생성', summary: 'Context length exceeded (128K) — 문서 첨부 과다', errorMessage: 'InvalidRequestError: max context length 128000 tokens exceeded', model: 'Claude Opus 4', skill: null, retryCount: '0/3', conversationId: 'conv-187', similarErrorCount: 1, affectedUsers: '김대표', estimatedCause: '과대 문서 첨부 (사용자 입력)' },
  { id: 'err-06', time: '2026.03.25 16:04', userName: '강CFO', userTeam: '경영진', errorType: 'Tool Error', failedStep: 'Tool Call (차트 생성)', summary: 'Recharts render error — 데이터 형식 불일치', errorMessage: 'TypeError: Cannot read properties of undefined (reading "map")', model: 'Claude Opus 4', skill: '차트 생성', retryCount: '1/3', conversationId: 'conv-185', similarErrorCount: 1, affectedUsers: '강CFO', estimatedCause: '스킬 출력 형식 불일치 (내부 — 스킬 수정 필요)' },
  { id: 'err-07', time: '2026.03.25 14:38', userName: '오실장', userTeam: '사업1팀', errorType: 'Timeout', failedStep: 'RAG 검색', summary: 'Vector DB 검색 30초 초과 — 인덱스 재구축 필요', errorMessage: 'TimeoutError: Vector search exceeded 30000ms', model: 'Claude Opus 4', skill: '문서 검색', retryCount: '2/3', conversationId: 'conv-182', similarErrorCount: 3, affectedUsers: '오실장 외 1명', estimatedCause: 'Vector DB 인덱스 성능 저하 (내부 인프라)' },
  { id: 'err-08', time: '2026.03.25 11:11', userName: '노영업', userTeam: '사업1팀', errorType: 'Model Error', failedStep: '응답 생성', summary: 'JSON parse error — 모델 출력 형식 불일치', errorMessage: 'SyntaxError: Unexpected token < in JSON at position 0', model: 'GPT-4o', skill: '데이터 정제', retryCount: '2/3', conversationId: 'conv-178', similarErrorCount: 1, affectedUsers: '노영업', estimatedCause: '모델 출력 파싱 실패 (내부 — 프롬프트 조정 필요)' },
  { id: 'err-09', time: '2026.03.25 09:55', userName: '양AI', userTeam: 'AI사업팀', errorType: 'Tool Error', failedStep: 'Tool Call (PPT 생성)', summary: 'python-pptx 라이브러리 오류 — 템플릿 누락', errorMessage: 'FileNotFoundError: Template "quarterly_report.pptx" not found', model: 'Claude Opus 4', skill: 'PPT 생성', retryCount: '0/3', conversationId: 'conv-175', similarErrorCount: 1, affectedUsers: '양AI', estimatedCause: '템플릿 파일 누락 (내부 — 배포 확인 필요)' },
  { id: 'err-10', time: '2026.03.24 18:30', userName: '전지원', userTeam: '경영지원팀', errorType: 'Timeout', failedStep: 'Tool Call (파일 업로드)', summary: 'S3 업로드 타임아웃 — 파일 200MB 초과', errorMessage: 'TimeoutError: Upload exceeded 60000ms for 210MB file', model: 'Claude Opus 4', skill: null, retryCount: '1/3', conversationId: 'conv-170', similarErrorCount: 1, affectedUsers: '전지원', estimatedCause: '대용량 파일 업로드 (사용자 입력 — 파일 크기 제한 안내)' },
  { id: 'err-11', time: '2026.03.24 16:44', userName: '박기획', userTeam: '사업1팀', errorType: 'Model Error', failedStep: '응답 생성', summary: 'Content filter triggered — 민감 데이터 포함', errorMessage: 'ContentFilterError: Response blocked by safety filter', model: 'GPT-4o', skill: '데이터 정제', retryCount: '0/3', conversationId: 'conv-168', similarErrorCount: 1, affectedUsers: '박기획', estimatedCause: '안전 필터 트리거 (모델 정책)' },
  { id: 'err-12', time: '2026.03.24 14:18', userName: '최혁신', userTeam: 'AI사업팀', errorType: 'Tool Error', failedStep: 'Tool Call (Slack 알림)', summary: 'Webhook URL 변경됨 — 404 반환', errorMessage: 'HTTPError: 404 Not Found for webhook endpoint', model: 'Claude Opus 4', skill: 'Slack 알림', retryCount: '2/3', conversationId: 'conv-165', similarErrorCount: 2, affectedUsers: '최혁신 외 1명', estimatedCause: 'Webhook URL 변경됨 (외부 의존성 — Slack 설정 확인)' },
  { id: 'err-13', time: '2026.03.24 11:02', userName: '서인사', userTeam: '경영지원팀', errorType: 'Timeout', failedStep: 'RAG 검색', summary: 'Embedding API 지연 — 배치 처리 대기열 초과', errorMessage: 'TimeoutError: Embedding API exceeded 20000ms', model: 'Claude Opus 4', skill: '문서 검색', retryCount: '2/3', conversationId: 'conv-160', similarErrorCount: 3, affectedUsers: '서인사 외 2명', estimatedCause: 'Embedding API 과부하 (외부 의존성)' },
  { id: 'err-14', time: '2026.03.24 09:30', userName: '임재무', userTeam: '경영지원팀', errorType: 'Model Error', failedStep: '응답 생성', summary: 'Function calling schema 불일치 — 툴 정의 업데이트 필요', errorMessage: 'InvalidRequestError: Tool schema validation failed', model: 'GPT-4o', skill: '재무 분석', retryCount: '1/3', conversationId: 'conv-158', similarErrorCount: 1, affectedUsers: '임재무', estimatedCause: '스킬 스키마 불일치 (내부 — 스킬 업데이트 필요)' },
  { id: 'err-15', time: '2026.03.23 17:45', userName: '조회계', userTeam: '경영지원팀', errorType: 'Tool Error', failedStep: 'Tool Call (DB 조회)', summary: 'SQL injection 방지 필터 오탐 — 정상 쿼리 차단', errorMessage: 'SecurityError: Query blocked by SQL injection filter', model: 'Claude Opus 4', skill: '매출 분석', retryCount: '0/3', conversationId: 'conv-155', similarErrorCount: 1, affectedUsers: '조회계', estimatedCause: '보안 필터 오탐 (내부 — 필터 규칙 조정 필요)' },
  { id: 'err-16', time: '2026.03.23 15:20', userName: '배세무', userTeam: '경영지원팀', errorType: 'Timeout', failedStep: 'Tool Call (외부 API)', summary: '국세청 API 응답 없음 — 시스템 점검 시간', errorMessage: 'Connection timed out after 30s to api.nts.go.kr', model: 'Claude Opus 4', skill: '세무 조회', retryCount: '3/3', conversationId: 'conv-150', similarErrorCount: 2, affectedUsers: '배세무 외 1명', estimatedCause: '국세청 API 점검 (외부 의존성)' },
  { id: 'err-17', time: '2026.03.23 13:55', userName: '문해외', userTeam: '사업1팀', errorType: 'Model Error', failedStep: '응답 생성', summary: '다국어 처리 오류 — 한/영/일 혼합 입력', errorMessage: 'EncodingError: Mixed encoding detected in input', model: 'GPT-4o', skill: null, retryCount: '1/3', conversationId: 'conv-148', similarErrorCount: 1, affectedUsers: '문해외', estimatedCause: '다국어 혼합 입력 처리 실패 (내부 — 인코딩 처리 개선)' },
  { id: 'err-18', time: '2026.03.23 10:30', userName: '장그룹장', userTeam: '경영진', errorType: 'Tool Error', failedStep: 'Tool Call (코드 실행)', summary: 'Sandbox 메모리 초과 — 대용량 데이터프레임', errorMessage: 'MemoryError: Sandbox exceeded 512MB limit', model: 'Claude Opus 4', skill: '데이터 정제', retryCount: '0/3', conversationId: 'conv-145', similarErrorCount: 1, affectedUsers: '장그룹장', estimatedCause: '대용량 데이터 처리 (사용자 입력 — 데이터 분할 안내)' },
  { id: 'err-19', time: '2026.03.22 16:15', userName: '하문화', userTeam: '마케팅팀', errorType: 'Timeout', failedStep: 'Tool Call (이미지 생성)', summary: 'DALL-E API 큐 대기 120초 초과', errorMessage: 'TimeoutError: Image generation exceeded 120000ms', model: 'GPT-4o', skill: '이미지 생성', retryCount: '1/3', conversationId: 'conv-140', similarErrorCount: 1, affectedUsers: '하문화', estimatedCause: 'DALL-E API 대기열 과부하 (외부 의존성)' },
  { id: 'err-20', time: '2026.03.22 14:00', userName: '구부문장', userTeam: '경영진', errorType: 'Model Error', failedStep: '응답 생성', summary: 'Token 예산 초과 — max_tokens 설정 미달', errorMessage: 'InvalidRequestError: max_tokens 4096 insufficient for response', model: 'Claude Opus 4', skill: '보고서 생성', retryCount: '0/3', conversationId: 'conv-138', similarErrorCount: 1, affectedUsers: '구부문장', estimatedCause: '토큰 예산 부족 (내부 — max_tokens 설정 상향 필요)' },
  { id: 'err-21', time: '2026.03.22 11:33', userName: '남부서장', userTeam: '사업1팀', errorType: 'Tool Error', failedStep: 'Tool Call (DB 조회)', summary: 'PostgreSQL 커넥션 리셋 — 네트워크 순단', errorMessage: 'ConnectionResetError: Connection to db.kona.com reset by peer', model: 'Claude Opus 4', skill: '매출 분석', retryCount: '2/3', conversationId: 'conv-135', similarErrorCount: 4, affectedUsers: '남부서장 외 3명', estimatedCause: 'DB 네트워크 순단 (내부 인프라)' },
  { id: 'err-22', time: '2026.03.22 09:10', userName: '심SCM', userTeam: '사업1팀', errorType: 'Timeout', failedStep: 'RAG 검색', summary: '대용량 문서 임베딩 타임아웃 — 500페이지 PDF', errorMessage: 'TimeoutError: Embedding exceeded 60000ms for 500-page document', model: 'Claude Opus 4', skill: '문서 검색', retryCount: '1/3', conversationId: 'conv-130', similarErrorCount: 3, affectedUsers: '심SCM', estimatedCause: '대용량 문서 임베딩 (사용자 입력 — 문서 분할 안내)' },
  { id: 'err-23', time: '2026.03.21 17:50', userName: '황생산', userTeam: '사업1팀', errorType: 'Model Error', failedStep: '응답 생성', summary: 'Streaming 중단 — WebSocket 연결 끊김', errorMessage: 'WebSocketError: Connection closed unexpectedly during streaming', model: 'Claude Opus 4', skill: null, retryCount: '1/3', conversationId: 'conv-128', similarErrorCount: 1, affectedUsers: '황생산', estimatedCause: '네트워크 불안정 (사용자 환경)' },
  { id: 'err-24', time: '2026.03.21 15:25', userName: '안실장', userTeam: '경영지원팀', errorType: 'Tool Error', failedStep: 'Tool Call (결제 API)', summary: 'PG사 API 인증 키 만료', errorMessage: 'AuthenticationError: API key expired for payment gateway', model: 'GPT-4o', skill: '결제 조회', retryCount: '0/3', conversationId: 'conv-125', similarErrorCount: 1, affectedUsers: '안실장', estimatedCause: 'PG사 API 키 만료 (외부 의존성 — 키 갱신 필요)' },
  { id: 'err-25', time: '2026.03.21 10:08', userName: '권보안', userTeam: 'AI사업팀', errorType: 'Timeout', failedStep: 'Tool Call (보안 스캔)', summary: '취약점 스캔 타임아웃 — 스캔 대상 과다', errorMessage: 'TimeoutError: Security scan exceeded 300000ms', model: 'Claude Opus 4', skill: '보안 스캔', retryCount: '1/3', conversationId: 'conv-120', similarErrorCount: 1, affectedUsers: '권보안', estimatedCause: '스캔 범위 과다 (사용자 입력 — 범위 축소 안내)' },
];

// ── §2 비용/사용량 ──────────────────────────────────────────────────────────

export const COST_USAGE_KPI: CostUsageKPI = {
  monthCost: { value: '₩1,247,000', change: '+8.3%' },
  totalTokens: { value: '2.4M' },
  avgDailyCost: { value: '₩48,000' },
};

// 단가 기준 (₩/1K tokens)
const COST_PER_K = { claude: 1500, gpt4o: 1000, other: 500 };

// 30일치 일별 비용 데이터 (단일 Y축 비용 기준)
export const DAILY_COST_DATA: DailyCostData[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 2, i + 1); // March 2026
  const day = date.getDate();
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const base = isWeekend ? 0.4 : 1;

  // 토큰 수 (K 단위)
  const claudeTokens = Math.round((40 + Math.random() * 30) * base);
  const gpt4oTokens = Math.round((15 + Math.random() * 15) * base);
  const otherTokens = Math.round((3 + Math.random() * 5) * base);

  // 비용 (₩ 단위)
  const claude = claudeTokens * COST_PER_K.claude;
  const gpt4o = gpt4oTokens * COST_PER_K.gpt4o;
  const other = otherTokens * COST_PER_K.other;

  return {
    date: `3/${day}`,
    claude,
    gpt4o,
    other,
    claudeTokens,
    gpt4oTokens,
    otherTokens,
  };
});

// 범례용 모델별 누적 금액 계산
export const MODEL_TOTALS = {
  claude: DAILY_COST_DATA.reduce((sum, d) => sum + d.claude, 0),
  gpt4o: DAILY_COST_DATA.reduce((sum, d) => sum + d.gpt4o, 0),
  other: DAILY_COST_DATA.reduce((sum, d) => sum + d.other, 0),
};

// ── 모델 설정 ───────────────────────────────────────────────────────────────

export const MODEL_CONFIGS: ModelConfig[] = [
  { id: 'mc-01', provider: 'Anthropic', modelName: 'Claude Opus 4', apiKeyStatus: '정상', daysToExpiry: 45, isActive: true },
  { id: 'mc-02', provider: 'Anthropic', modelName: 'Claude Haiku 4.5', apiKeyStatus: '정상', daysToExpiry: 45, isActive: true },
  { id: 'mc-03', provider: 'OpenAI', modelName: 'GPT-4o', apiKeyStatus: '만료 임박', daysToExpiry: 5, isActive: true },
  { id: 'mc-04', provider: 'OpenAI', modelName: 'GPT-4o mini', apiKeyStatus: '만료', daysToExpiry: 0, isActive: false },
];
