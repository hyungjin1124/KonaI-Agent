/**
 * Prompt Management — Types, Constants & Mock Data
 *
 * Prompt template registry with immutable snapshot versioning,
 * model binding, content moderation sensitivity, and inline testing.
 */

import { MODELS } from '@/constants/models';

// --- Types ---

export type PromptStatus = 'draft' | 'active' | 'archived';
export type ModerationLevel = 'low' | 'medium' | 'high';
export type PromptCategory = 'system' | 'task' | 'safety' | 'persona' | 'custom';

export interface PromptVersion {
  version: number;
  content: string;
  modelId: string;
  moderationLevel: ModerationLevel;
  changeNote: string;
  createdAt: string;
  createdBy: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: PromptCategory;
  content: string;
  status: PromptStatus;
  modelId: string;
  moderationLevel: ModerationLevel;
  currentVersion: number;
  versions: PromptVersion[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// --- Constants ---

export const CATEGORY_OPTIONS: { value: PromptCategory; label: string }[] = [
  { value: 'system', label: '시스템' },
  { value: 'task', label: '태스크' },
  { value: 'safety', label: '안전' },
  { value: 'persona', label: '페르소나' },
  { value: 'custom', label: '커스텀' },
];

export const STATUS_OPTIONS: { value: PromptStatus; label: string }[] = [
  { value: 'draft', label: '초안' },
  { value: 'active', label: '활성' },
  { value: 'archived', label: '보관' },
];

export const MODERATION_OPTIONS: { value: ModerationLevel; label: string; description: string }[] = [
  { value: 'low', label: 'Low', description: '최소 필터링 — 내부 문서 처리용' },
  { value: 'medium', label: 'Medium', description: '표준 필터링 — 일반 업무용' },
  { value: 'high', label: 'High', description: '최대 필터링 — 고객 대면용' },
];

export const MODEL_OPTIONS = MODELS.map(m => ({ value: m.id, label: m.name }));

export const CATEGORY_COLORS: Record<PromptCategory, string> = {
  system: 'bg-blue-50 text-blue-700 border-blue-200',
  task: 'bg-purple-50 text-purple-700 border-purple-200',
  safety: 'bg-red-50 text-red-700 border-red-200',
  persona: 'bg-amber-50 text-amber-700 border-amber-200',
  custom: 'bg-gray-50 text-gray-600 border-gray-200',
};

export const STATUS_STYLES: Record<PromptStatus, string> = {
  draft: 'bg-gray-50 text-gray-600 border-gray-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  archived: 'bg-gray-100 text-gray-500 border-gray-300',
};

// --- Helpers ---

export function filterTemplates(
  templates: PromptTemplate[],
  search: string,
  categoryFilter: string,
  statusFilter: string,
): PromptTemplate[] {
  return templates.filter(t => {
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });
}

export function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.slice(2, -2)))];
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function getModelName(modelId: string): string {
  const model = MODELS.find(m => m.id === modelId);
  return model?.name ?? modelId;
}

// --- Mock Test Responses ---

const MOCK_RESPONSES: Record<string, string> = {
  default: '안녕하세요! 요청하신 내용을 분석하겠습니다. 다음과 같은 결과를 확인해 주세요:\n\n1. 입력된 변수를 기반으로 컨텍스트를 구성했습니다.\n2. 관련 정책 및 가이드라인을 참조했습니다.\n3. 최적의 응답을 생성했습니다.\n\n추가 질문이 있으시면 말씀해 주세요.',
  system: '시스템 프롬프트가 적용되었습니다. 설정된 역할과 지침에 따라 응답합니다. 현재 모더레이션 레벨에 맞게 콘텐츠를 필터링하고 있습니다.',
  safety: '안전 가이드라인을 준수하여 응답합니다. 요청된 내용은 컴플라이언스 기준을 충족하며, 추가적인 검증이 필요한 경우 관리자에게 에스컬레이션됩니다.',
};

export function getMockResponse(category: PromptCategory): string {
  return MOCK_RESPONSES[category] ?? MOCK_RESPONSES.default;
}

// --- Mock Data (10+ templates, each with 2+ versions) ---

export const MOCK_TEMPLATES: PromptTemplate[] = [
  {
    id: 'pt-001',
    name: '고객 응대 기본 프롬프트',
    category: 'system',
    content: '당신은 {{company_name}}의 고객 지원 전문가입니다. 다음 규칙을 따르세요:\n\n1. 항상 정중하고 전문적인 톤을 유지합니다.\n2. 고객의 문제를 정확히 파악한 후 답변합니다.\n3. 모르는 내용은 솔직히 안내하고, 담당 부서로 연결합니다.\n4. 개인정보는 절대 요청하거나 노출하지 않습니다.\n\n응대 언어: {{language}}',
    status: 'active',
    modelId: 'claude-sonnet-4-5',
    moderationLevel: 'high',
    currentVersion: 3,
    versions: [
      { version: 1, content: '고객 응대 프롬프트 초기 버전', modelId: 'claude-sonnet-4-5', moderationLevel: 'medium', changeNote: '최초 생성', createdAt: '2026-02-01 09:00', createdBy: '김관리' },
      { version: 2, content: '개인정보 보호 조항 추가', modelId: 'claude-sonnet-4-5', moderationLevel: 'high', changeNote: '개인정보 보호 규정 강화 반영', createdAt: '2026-02-15 14:30', createdBy: '김관리' },
      { version: 3, content: '당신은 {{company_name}}의 고객 지원 전문가입니다...', modelId: 'claude-sonnet-4-5', moderationLevel: 'high', changeNote: '다국어 지원 변수 추가', createdAt: '2026-03-01 10:00', createdBy: '이운영' },
    ],
    createdAt: '2026-02-01',
    updatedAt: '2026-03-01',
    createdBy: '김관리',
  },
  {
    id: 'pt-002',
    name: '데이터 분석 리포트 생성',
    category: 'task',
    content: '다음 데이터를 분석하여 {{report_type}} 리포트를 작성해 주세요.\n\n분석 기간: {{period}}\n핵심 KPI: {{kpi_list}}\n\n리포트 구조:\n1. 요약 (Executive Summary)\n2. 주요 지표 분석\n3. 트렌드 및 인사이트\n4. 권장 액션 아이템',
    status: 'active',
    modelId: 'claude-opus-4-6',
    moderationLevel: 'low',
    currentVersion: 2,
    versions: [
      { version: 1, content: '데이터 분석 리포트 초기 버전', modelId: 'gpt-5-2', moderationLevel: 'low', changeNote: '최초 생성', createdAt: '2026-02-10 11:00', createdBy: '박분석' },
      { version: 2, content: '다음 데이터를 분석하여...', modelId: 'claude-opus-4-6', moderationLevel: 'low', changeNote: '모델 변경 (GPT→Claude Opus) + KPI 변수 추가', createdAt: '2026-03-05 09:00', createdBy: '박분석' },
    ],
    createdAt: '2026-02-10',
    updatedAt: '2026-03-05',
    createdBy: '박분석',
  },
  {
    id: 'pt-003',
    name: '컴플라이언스 검토 에이전트',
    category: 'safety',
    content: '당신은 {{domain}} 분야의 컴플라이언스 검토 전문가입니다.\n\n검토 기준:\n- 개인정보보호법 준수 여부\n- 금융소비자보호법 해당 조항\n- 내부 통제 기준 {{policy_version}} 적합성\n\n검토 결과는 [적합/부적합/조건부 적합]으로 판정하고, 부적합 시 구체적 사유와 개선 방안을 제시합니다.',
    status: 'active',
    modelId: 'claude-opus-4-6',
    moderationLevel: 'high',
    currentVersion: 4,
    versions: [
      { version: 1, content: '컴플라이언스 기본 프롬프트', modelId: 'claude-sonnet-4-5', moderationLevel: 'medium', changeNote: '최초 생성', createdAt: '2026-01-20 10:00', createdBy: '한보안' },
      { version: 2, content: '금융소비자보호법 조항 추가', modelId: 'claude-sonnet-4-5', moderationLevel: 'high', changeNote: '금융 규제 반영', createdAt: '2026-02-05 15:00', createdBy: '한보안' },
      { version: 3, content: '판정 기준 3단계로 변경', modelId: 'claude-opus-4-6', moderationLevel: 'high', changeNote: '모델 업그레이드 + 판정 기준 정교화', createdAt: '2026-02-20 11:30', createdBy: '강감사' },
      { version: 4, content: '당신은 {{domain}} 분야의 컴플라이언스...', modelId: 'claude-opus-4-6', moderationLevel: 'high', changeNote: '도메인 변수 추가로 범용성 확보', createdAt: '2026-03-08 09:00', createdBy: '강감사' },
    ],
    createdAt: '2026-01-20',
    updatedAt: '2026-03-08',
    createdBy: '한보안',
  },
  {
    id: 'pt-004',
    name: '친근한 AI 어시스턴트',
    category: 'persona',
    content: '당신은 "{{assistant_name}}"이라는 이름의 친근한 AI 어시스턴트입니다.\n\n성격: 밝고 긍정적이며, 이모지를 적절히 사용합니다.\n전문 분야: {{expertise}}\n말투: 존댓말을 사용하되, 딱딱하지 않은 대화체로 소통합니다.\n\n금지 사항:\n- 정치/종교/사회적 민감 주제 논의\n- 의료/법률 전문 조언 제공\n- 개인정보 수집 시도',
    status: 'active',
    modelId: 'claude-sonnet-4-5',
    moderationLevel: 'medium',
    currentVersion: 2,
    versions: [
      { version: 1, content: '친근한 AI 어시스턴트 기본', modelId: 'gpt-5-3-flash', moderationLevel: 'medium', changeNote: '최초 생성', createdAt: '2026-02-12 14:00', createdBy: '이기획' },
      { version: 2, content: '당신은 "{{assistant_name}}"이라는...', modelId: 'claude-sonnet-4-5', moderationLevel: 'medium', changeNote: '금지 사항 강화 + 모델 변경', createdAt: '2026-03-02 16:00', createdBy: '이기획' },
    ],
    createdAt: '2026-02-12',
    updatedAt: '2026-03-02',
    createdBy: '이기획',
  },
  {
    id: 'pt-005',
    name: '내부 문서 요약 태스크',
    category: 'task',
    content: '다음 문서를 요약해 주세요.\n\n요약 형식: {{format}}\n요약 길이: {{length}}자 이내\n핵심 키워드 추출: {{extract_keywords}}\n\n요약 시 원문의 핵심 논지를 유지하되, 불필요한 반복이나 장식적 표현은 제거합니다.',
    status: 'active',
    modelId: 'gemini-3-flash',
    moderationLevel: 'low',
    currentVersion: 3,
    versions: [
      { version: 1, content: '문서 요약 기본', modelId: 'gpt-5-3-flash', moderationLevel: 'low', changeNote: '최초 생성', createdAt: '2026-01-25 10:00', createdBy: '최개발' },
      { version: 2, content: '키워드 추출 기능 추가', modelId: 'gpt-5-3-flash', moderationLevel: 'low', changeNote: '키워드 추출 변수 추가', createdAt: '2026-02-08 11:00', createdBy: '최개발' },
      { version: 3, content: '다음 문서를 요약해 주세요...', modelId: 'gemini-3-flash', moderationLevel: 'low', changeNote: '비용 최적화를 위해 Gemini Flash로 전환', createdAt: '2026-03-10 14:00', createdBy: '박분석' },
    ],
    createdAt: '2026-01-25',
    updatedAt: '2026-03-10',
    createdBy: '최개발',
  },
  {
    id: 'pt-006',
    name: '코드 리뷰 자동화',
    category: 'task',
    content: '다음 {{language}} 코드를 리뷰해 주세요.\n\n리뷰 관점:\n1. 보안 취약점 (OWASP Top 10)\n2. 성능 최적화 기회\n3. 코드 컨벤션 준수\n4. 테스트 커버리지 개선 제안\n\n결과 형식: 심각도(Critical/Major/Minor) 별로 분류하여 제시합니다.',
    status: 'active',
    modelId: 'claude-opus-4-6',
    moderationLevel: 'low',
    currentVersion: 2,
    versions: [
      { version: 1, content: '코드 리뷰 기본 프롬프트', modelId: 'claude-sonnet-4-5', moderationLevel: 'low', changeNote: '최초 생성', createdAt: '2026-02-18 09:00', createdBy: '최개발' },
      { version: 2, content: '다음 {{language}} 코드를 리뷰해 주세요...', modelId: 'claude-opus-4-6', moderationLevel: 'low', changeNote: 'OWASP 기준 추가 + Opus 업그레이드', createdAt: '2026-03-06 11:00', createdBy: '최개발' },
    ],
    createdAt: '2026-02-18',
    updatedAt: '2026-03-06',
    createdBy: '최개발',
  },
  {
    id: 'pt-007',
    name: '영업 제안서 초안 생성',
    category: 'task',
    content: '{{client_name}} 고객을 위한 {{product}} 제안서 초안을 작성해 주세요.\n\n고객 산업: {{industry}}\n예상 규모: {{deal_size}}\n경쟁 상황: {{competitors}}\n\n제안서 구성:\n1. 고객 Pain Point 분석\n2. 솔루션 매핑\n3. 기대 효과 (ROI)\n4. 구축 일정 및 비용\n5. 레퍼런스 사례',
    status: 'draft',
    modelId: 'claude-opus-4-6',
    moderationLevel: 'medium',
    currentVersion: 1,
    versions: [
      { version: 1, content: '{{client_name}} 고객을 위한...', modelId: 'claude-opus-4-6', moderationLevel: 'medium', changeNote: '최초 생성', createdAt: '2026-03-11 10:00', createdBy: '김영업' },
    ],
    createdAt: '2026-03-11',
    updatedAt: '2026-03-11',
    createdBy: '김영업',
  },
  {
    id: 'pt-008',
    name: '회의록 자동 정리',
    category: 'task',
    content: '다음 회의 내용을 정리해 주세요.\n\n회의 유형: {{meeting_type}}\n참석자: {{attendees}}\n\n정리 형식:\n- 주요 논의 사항 (bullet)\n- 결정 사항 (Decision Log)\n- 액션 아이템 (담당자, 기한 포함)\n- 다음 회의 안건',
    status: 'active',
    modelId: 'claude-sonnet-4-5',
    moderationLevel: 'low',
    currentVersion: 2,
    versions: [
      { version: 1, content: '회의록 정리 기본', modelId: 'gpt-5-2', moderationLevel: 'low', changeNote: '최초 생성', createdAt: '2026-02-20 15:00', createdBy: '이기획' },
      { version: 2, content: '다음 회의 내용을 정리해 주세요...', modelId: 'claude-sonnet-4-5', moderationLevel: 'low', changeNote: 'Decision Log 형식 추가 + 모델 변경', createdAt: '2026-03-03 09:30', createdBy: '이기획' },
    ],
    createdAt: '2026-02-20',
    updatedAt: '2026-03-03',
    createdBy: '이기획',
  },
  {
    id: 'pt-009',
    name: '민감 정보 필터링 가드',
    category: 'safety',
    content: '당신은 콘텐츠 안전 필터입니다. 모든 입출력에 대해 다음을 검사합니다:\n\n1. 개인식별정보(PII): 주민번호, 전화번호, 이메일, 계좌번호\n2. 기업비밀: {{confidential_keywords}} 포함 여부\n3. 유해 콘텐츠: 혐오 발언, 차별적 표현\n\n탐지 시: [FILTERED] 태그로 마스킹하고, 탐지 로그를 생성합니다.\n탐지 심각도: {{severity_threshold}} 이상만 블록합니다.',
    status: 'active',
    modelId: 'claude-sonnet-4-5',
    moderationLevel: 'high',
    currentVersion: 3,
    versions: [
      { version: 1, content: 'PII 필터링 기본', modelId: 'claude-sonnet-4-5', moderationLevel: 'high', changeNote: '최초 생성', createdAt: '2026-01-15 10:00', createdBy: '한보안' },
      { version: 2, content: '기업비밀 키워드 검사 추가', modelId: 'claude-sonnet-4-5', moderationLevel: 'high', changeNote: '기업비밀 보호 항목 추가', createdAt: '2026-02-10 14:00', createdBy: '한보안' },
      { version: 3, content: '당신은 콘텐츠 안전 필터입니다...', modelId: 'claude-sonnet-4-5', moderationLevel: 'high', changeNote: '심각도 임계값 변수 추가', createdAt: '2026-03-07 16:00', createdBy: '한보안' },
    ],
    createdAt: '2026-01-15',
    updatedAt: '2026-03-07',
    createdBy: '한보안',
  },
  {
    id: 'pt-010',
    name: '다국어 번역 전문가',
    category: 'persona',
    content: '당신은 {{source_lang}}에서 {{target_lang}}으로 전문 번역하는 번역가입니다.\n\n번역 원칙:\n1. 원문의 의미와 뉘앙스를 최대한 보존합니다.\n2. {{domain}} 분야의 전문 용어를 정확히 사용합니다.\n3. 문화적 맥락을 고려한 자연스러운 표현을 사용합니다.\n4. 번역이 어려운 부분은 [역주: ...] 형태로 설명을 추가합니다.',
    status: 'active',
    modelId: 'claude-sonnet-4-5',
    moderationLevel: 'low',
    currentVersion: 2,
    versions: [
      { version: 1, content: '번역 프롬프트 기본', modelId: 'gpt-5-2', moderationLevel: 'low', changeNote: '최초 생성', createdAt: '2026-02-25 11:00', createdBy: '이기획' },
      { version: 2, content: '당신은 {{source_lang}}에서...', modelId: 'claude-sonnet-4-5', moderationLevel: 'low', changeNote: '도메인 변수 추가 + 역주 기능', createdAt: '2026-03-09 10:00', createdBy: '이기획' },
    ],
    createdAt: '2026-02-25',
    updatedAt: '2026-03-09',
    createdBy: '이기획',
  },
  {
    id: 'pt-011',
    name: 'FAQ 자동 응답 (레거시)',
    category: 'system',
    content: '자주 묻는 질문에 대해 미리 정의된 답변을 제공합니다.\n\n답변 소스: 내부 FAQ 데이터베이스\n매칭 방식: 의미 유사도 기반\n답변 불확실 시: "담당자에게 연결해 드리겠습니다" 안내',
    status: 'archived',
    modelId: 'gpt-5-3-flash',
    moderationLevel: 'medium',
    currentVersion: 2,
    versions: [
      { version: 1, content: 'FAQ 기본 프롬프트', modelId: 'gpt-5-3-flash', moderationLevel: 'low', changeNote: '최초 생성', createdAt: '2026-01-10 09:00', createdBy: '김CS' },
      { version: 2, content: '자주 묻는 질문에 대해...', modelId: 'gpt-5-3-flash', moderationLevel: 'medium', changeNote: '불확실 응답 처리 추가', createdAt: '2026-02-01 11:00', createdBy: '김CS' },
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-02-01',
    createdBy: '김CS',
  },
  {
    id: 'pt-012',
    name: '이메일 초안 작성',
    category: 'custom',
    content: '{{recipient_role}}에게 보내는 {{email_type}} 이메일을 작성해 주세요.\n\n톤: {{tone}}\n핵심 내용: {{key_points}}\n첨부 파일 언급: {{attachments}}\n\n이메일 구조: 인사 → 목적 → 본문 → 요청사항 → 마무리',
    status: 'draft',
    modelId: 'claude-sonnet-4-5',
    moderationLevel: 'medium',
    currentVersion: 1,
    versions: [
      { version: 1, content: '{{recipient_role}}에게 보내는...', modelId: 'claude-sonnet-4-5', moderationLevel: 'medium', changeNote: '최초 생성', createdAt: '2026-03-12 14:00', createdBy: '이기획' },
    ],
    createdAt: '2026-03-12',
    updatedAt: '2026-03-12',
    createdBy: '이기획',
  },
];
