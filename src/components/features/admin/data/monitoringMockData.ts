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
  { id: 'err-01', time: '03.26 14:32', userName: '류개발', userTeam: 'AI사업팀', requestSummary: '3월 매출 데이터 분석..', errorType: 'Timeout', failedStep: '데이터 조회', summary: '15초 내 응답 없음', errorMessage: 'Connection timed out after 15s to db.kona.com:5432', model: 'Claude Opus 4', skill: '매출 분석', retryCount: '2/3', conversationId: 'conv-201', similarErrorCount: 4, affectedUserCount: 3, estimatedCause: 'DB 서버 커넥션 풀 포화' },
  { id: 'err-02', time: '03.26 13:15', userName: '이기획', userTeam: '사업1팀', requestSummary: '주간 실적 보고서 생성..', errorType: 'Model Error', failedStep: '응답 생성', summary: 'Rate limit 초과', errorMessage: 'anthropic.RateLimitError: 429', model: 'Claude Opus 4', skill: '보고서 생성', retryCount: '3/3', conversationId: 'conv-198', similarErrorCount: 2, affectedUserCount: 2, estimatedCause: 'API 요청 한도 초과' },
  { id: 'err-03', time: '03.26 11:47', userName: '한관리', userTeam: '경영지원팀', requestSummary: '거래처 담당자 메일 발송..', errorType: 'Tool Error', failedStep: '이메일 발송', summary: 'SMTP 인증 실패', errorMessage: 'SMTPAuthenticationError: 535', model: 'Claude Opus 4', skill: '이메일 발송', retryCount: '1/3', conversationId: 'conv-195', similarErrorCount: 1, affectedUserCount: 1, estimatedCause: 'SMTP 인증 토큰 만료' },
  { id: 'err-04', time: '03.26 10:05', userName: '성Biz', userTeam: '사업1팀', requestSummary: '분기별 매출 추이 비교..', errorType: 'Timeout', failedStep: '외부 API 호출', summary: 'ERP API 타임아웃', errorMessage: 'Connection timed out after 30s to erp.kona.com', model: 'GPT-4o', skill: '매출 분석', retryCount: '3/3', conversationId: 'conv-190', similarErrorCount: 4, affectedUserCount: 4, estimatedCause: 'ERP 서버 응답 지연' },
  { id: 'err-05', time: '03.25 17:22', userName: '김대표', userTeam: '경영진', requestSummary: '전략 문서 요약해줘..', errorType: 'Model Error', failedStep: '응답 생성', summary: 'Context length 초과', errorMessage: 'InvalidRequestError: max context length exceeded', model: 'Claude Opus 4', skill: null, retryCount: '0/3', conversationId: 'conv-187', similarErrorCount: 1, affectedUserCount: 1, estimatedCause: '과대 문서 첨부' },
  { id: 'err-06', time: '03.25 16:04', userName: '강CFO', userTeam: '경영진', requestSummary: '영업이익 차트 만들어줘..', errorType: 'Tool Error', failedStep: '차트 생성', summary: 'Recharts 렌더 오류', errorMessage: 'TypeError: Cannot read properties of undefined', model: 'Claude Opus 4', skill: '차트 생성', retryCount: '1/3', conversationId: 'conv-185', similarErrorCount: 1, affectedUserCount: 1, estimatedCause: '스킬 출력 형식 불일치' },
  { id: 'err-07', time: '03.25 14:38', userName: '오실장', userTeam: '사업1팀', requestSummary: '계약서 내용 검색해줘..', errorType: 'Timeout', failedStep: 'RAG 검색', summary: 'Vector DB 30초 초과', errorMessage: 'TimeoutError: Vector search exceeded 30000ms', model: 'Claude Opus 4', skill: '문서 검색', retryCount: '2/3', conversationId: 'conv-182', similarErrorCount: 3, affectedUserCount: 2, estimatedCause: 'Vector DB 인덱스 성능 저하' },
  { id: 'err-08', time: '03.25 11:11', userName: '노영업', userTeam: '사업1팀', requestSummary: '고객 데이터 정제해줘..', errorType: 'Model Error', failedStep: '응답 생성', summary: 'JSON 파싱 오류', errorMessage: 'SyntaxError: Unexpected token <', model: 'GPT-4o', skill: '데이터 정제', retryCount: '2/3', conversationId: 'conv-178', similarErrorCount: 1, affectedUserCount: 1, estimatedCause: '모델 출력 파싱 실패' },
  { id: 'err-09', time: '03.25 09:55', userName: '양AI', userTeam: 'AI사업팀', requestSummary: '분기 보고 PPT 생성..', errorType: 'Tool Error', failedStep: 'PPT 생성', summary: '템플릿 파일 누락', errorMessage: 'FileNotFoundError: Template not found', model: 'Claude Opus 4', skill: 'PPT 생성', retryCount: '0/3', conversationId: 'conv-175', similarErrorCount: 1, affectedUserCount: 1, estimatedCause: '템플릿 파일 누락' },
  { id: 'err-10', time: '03.24 18:30', userName: '전지원', userTeam: '경영지원팀', requestSummary: '회의록 파일 업로드..', errorType: 'Timeout', failedStep: '파일 업로드', summary: 'S3 업로드 타임아웃', errorMessage: 'TimeoutError: Upload exceeded 60000ms', model: 'Claude Opus 4', skill: null, retryCount: '1/3', conversationId: 'conv-170', similarErrorCount: 1, affectedUserCount: 1, estimatedCause: '대용량 파일 업로드' },
  { id: 'err-11', time: '03.24 16:44', userName: '박기획', userTeam: '사업1팀', requestSummary: '급여 데이터 정제해줘..', errorType: 'Model Error', failedStep: '응답 생성', summary: 'Content filter 작동', errorMessage: 'ContentFilterError: Response blocked', model: 'GPT-4o', skill: '데이터 정제', retryCount: '0/3', conversationId: 'conv-168', similarErrorCount: 1, affectedUserCount: 1, estimatedCause: '안전 필터 트리거' },
  { id: 'err-12', time: '03.24 14:18', userName: '최혁신', userTeam: 'AI사업팀', requestSummary: '배포 완료 알림 보내줘..', errorType: 'Tool Error', failedStep: 'Slack 알림', summary: 'Webhook 404 반환', errorMessage: 'HTTPError: 404 Not Found', model: 'Claude Opus 4', skill: 'Slack 알림', retryCount: '2/3', conversationId: 'conv-165', similarErrorCount: 2, affectedUserCount: 2, estimatedCause: 'Webhook URL 변경됨' },
  { id: 'err-13', time: '03.24 11:02', userName: '서인사', userTeam: '경영지원팀', requestSummary: '인사 규정 찾아줘..', errorType: 'Timeout', failedStep: 'RAG 검색', summary: 'Embedding API 지연', errorMessage: 'TimeoutError: Embedding API exceeded 20000ms', model: 'Claude Opus 4', skill: '문서 검색', retryCount: '2/3', conversationId: 'conv-160', similarErrorCount: 3, affectedUserCount: 3, estimatedCause: 'Embedding API 과부하' },
  { id: 'err-14', time: '03.24 09:30', userName: '임재무', userTeam: '경영지원팀', requestSummary: '분기 재무제표 분석..', errorType: 'Model Error', failedStep: '응답 생성', summary: 'Tool schema 불일치', errorMessage: 'InvalidRequestError: Tool schema validation failed', model: 'GPT-4o', skill: '재무 분석', retryCount: '1/3', conversationId: 'conv-158', similarErrorCount: 1, affectedUserCount: 1, estimatedCause: '스킬 스키마 불일치' },
  { id: 'err-15', time: '03.23 17:45', userName: '조회계', userTeam: '경영지원팀', requestSummary: '2월 결산 매출 조회..', errorType: 'Tool Error', failedStep: 'DB 조회', summary: 'SQL 필터 오탐', errorMessage: 'SecurityError: Query blocked', model: 'Claude Opus 4', skill: '매출 분석', retryCount: '0/3', conversationId: 'conv-155', similarErrorCount: 1, affectedUserCount: 1, estimatedCause: '보안 필터 오탐' },
  { id: 'err-16', time: '03.23 15:20', userName: '배세무', userTeam: '경영지원팀', requestSummary: '부가세 신고 자료 조회..', errorType: 'Timeout', failedStep: '외부 API 호출', summary: '국세청 API 응답 없음', errorMessage: 'Connection timed out after 30s', model: 'Claude Opus 4', skill: '세무 조회', retryCount: '3/3', conversationId: 'conv-150', similarErrorCount: 2, affectedUserCount: 2, estimatedCause: '국세청 API 점검' },
  { id: 'err-17', time: '03.23 13:55', userName: '문해외', userTeam: '사업1팀', requestSummary: '일본 거래처 메일 번역..', errorType: 'Model Error', failedStep: '응답 생성', summary: '다국어 인코딩 오류', errorMessage: 'EncodingError: Mixed encoding detected', model: 'GPT-4o', skill: null, retryCount: '1/3', conversationId: 'conv-148', similarErrorCount: 1, affectedUserCount: 1, estimatedCause: '다국어 혼합 입력 처리 실패' },
  { id: 'err-18', time: '03.23 10:30', userName: '장그룹장', userTeam: '경영진', requestSummary: '전사 실적 데이터 정리..', errorType: 'Tool Error', failedStep: '코드 실행', summary: 'Sandbox 메모리 초과', errorMessage: 'MemoryError: Sandbox exceeded 512MB', model: 'Claude Opus 4', skill: '데이터 정제', retryCount: '0/3', conversationId: 'conv-145', similarErrorCount: 1, affectedUserCount: 1, estimatedCause: '대용량 데이터 처리' },
  { id: 'err-19', time: '03.22 16:15', userName: '하문화', userTeam: '마케팅팀', requestSummary: '신제품 홍보 이미지..', errorType: 'Timeout', failedStep: '이미지 생성', summary: 'DALL-E 큐 대기 초과', errorMessage: 'TimeoutError: Image generation exceeded 120000ms', model: 'GPT-4o', skill: '이미지 생성', retryCount: '1/3', conversationId: 'conv-140', similarErrorCount: 1, affectedUserCount: 1, estimatedCause: 'DALL-E API 과부하' },
  { id: 'err-20', time: '03.22 14:00', userName: '구부문장', userTeam: '경영진', requestSummary: '월간 경영 보고서..', errorType: 'Model Error', failedStep: '응답 생성', summary: 'Token 예산 초과', errorMessage: 'InvalidRequestError: max_tokens insufficient', model: 'Claude Opus 4', skill: '보고서 생성', retryCount: '0/3', conversationId: 'conv-138', similarErrorCount: 1, affectedUserCount: 1, estimatedCause: 'max_tokens 설정 부족' },
  { id: 'err-21', time: '03.22 11:33', userName: '남부서장', userTeam: '사업1팀', requestSummary: '팀별 영업 실적 조회..', errorType: 'Tool Error', failedStep: 'DB 조회', summary: 'DB 커넥션 리셋', errorMessage: 'ConnectionResetError: reset by peer', model: 'Claude Opus 4', skill: '매출 분석', retryCount: '2/3', conversationId: 'conv-135', similarErrorCount: 4, affectedUserCount: 4, estimatedCause: 'DB 네트워크 순단' },
  { id: 'err-22', time: '03.22 09:10', userName: '심SCM', userTeam: '사업1팀', requestSummary: '공급망 보고서 찾아줘..', errorType: 'Timeout', failedStep: 'RAG 검색', summary: '임베딩 타임아웃', errorMessage: 'TimeoutError: Embedding exceeded 60000ms', model: 'Claude Opus 4', skill: '문서 검색', retryCount: '1/3', conversationId: 'conv-130', similarErrorCount: 3, affectedUserCount: 1, estimatedCause: '대용량 문서 임베딩' },
  { id: 'err-23', time: '03.21 17:50', userName: '황생산', userTeam: '사업1팀', requestSummary: '생산 일정 알려줘..', errorType: 'Model Error', failedStep: '응답 생성', summary: 'WebSocket 연결 끊김', errorMessage: 'WebSocketError: Connection closed', model: 'Claude Opus 4', skill: null, retryCount: '1/3', conversationId: 'conv-128', similarErrorCount: 1, affectedUserCount: 1, estimatedCause: '네트워크 불안정' },
  { id: 'err-24', time: '03.21 15:25', userName: '안실장', userTeam: '경영지원팀', requestSummary: '이번 달 결제 내역 조회..', errorType: 'Tool Error', failedStep: '결제 API 호출', summary: 'PG사 API 키 만료', errorMessage: 'AuthenticationError: API key expired', model: 'GPT-4o', skill: '결제 조회', retryCount: '0/3', conversationId: 'conv-125', similarErrorCount: 1, affectedUserCount: 1, estimatedCause: 'PG사 API 키 만료' },
  { id: 'err-25', time: '03.21 10:08', userName: '권보안', userTeam: 'AI사업팀', requestSummary: '보안 취약점 스캔 실행..', errorType: 'Timeout', failedStep: '보안 스캔', summary: '스캔 타임아웃', errorMessage: 'TimeoutError: Security scan exceeded 300000ms', model: 'Claude Opus 4', skill: '보안 스캔', retryCount: '1/3', conversationId: 'conv-120', similarErrorCount: 1, affectedUserCount: 1, estimatedCause: '스캔 범위 과다' },
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

// 범례용 모델별 누적 토큰 계산 (K 단위)
export const MODEL_TOKEN_TOTALS = {
  claude: DAILY_COST_DATA.reduce((sum, d) => sum + d.claudeTokens, 0),
  gpt4o: DAILY_COST_DATA.reduce((sum, d) => sum + d.gpt4oTokens, 0),
  other: DAILY_COST_DATA.reduce((sum, d) => sum + d.otherTokens, 0),
};

// ── 모델 설정 ───────────────────────────────────────────────────────────────

export const MODEL_CONFIGS: ModelConfig[] = [
  { id: 'mc-01', provider: 'Anthropic', modelName: 'Claude Opus 4', apiKeyStatus: '정상', daysToExpiry: 45, isActive: true },
  { id: 'mc-02', provider: 'Anthropic', modelName: 'Claude Haiku 4.5', apiKeyStatus: '정상', daysToExpiry: 45, isActive: true },
  { id: 'mc-03', provider: 'OpenAI', modelName: 'GPT-4o', apiKeyStatus: '만료 임박', daysToExpiry: 5, isActive: true },
  { id: 'mc-04', provider: 'OpenAI', modelName: 'GPT-4o mini', apiKeyStatus: '만료', daysToExpiry: 0, isActive: false },
];
