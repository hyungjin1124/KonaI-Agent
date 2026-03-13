/**
 * Agent Configuration — Types & Mock Data
 *
 * Defines agent config types, model options, capability definitions,
 * moderation levels, and initial mock state.
 */

// --- Types ---

export interface AgentModel {
  id: string;
  name: string;
  provider: string;
  description: string;
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface ModerationLevel {
  value: number;
  label: string;
  description: string;
}

export interface AgentConfig {
  name: string;
  description: string;
  avatarColor: string;
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  capabilities: AgentCapability[];
  systemPrompt: string;
  moderationLevel: number;
  lastModified: string;
  lastModifiedBy: string;
}

// --- Constants ---

export const AVAILABLE_MODELS: AgentModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: '최신 멀티모달 모델 — 빠른 응답, 이미지 이해 지원',
  },
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    description: '균형 잡힌 성능 — 코드, 분석, 한국어에 강점',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    description: '대용량 컨텍스트 — 긴 문서 분석에 적합',
  },
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'Meta (Self-hosted)',
    description: '온프레미스 배포 가능 — 데이터 보안 우선 시나리오',
  },
];

export const DEFAULT_CAPABILITIES: AgentCapability[] = [
  {
    id: 'web_search',
    name: '웹 검색',
    description: '실시간 웹 검색을 통해 최신 정보를 참조합니다.',
    enabled: true,
  },
  {
    id: 'code_execution',
    name: '코드 실행',
    description: 'Python 코드를 실행하여 데이터 분석 및 계산을 수행합니다.',
    enabled: true,
  },
  {
    id: 'file_upload',
    name: '파일 업로드',
    description: '사용자가 업로드한 문서(PDF, Excel 등)를 분석합니다.',
    enabled: true,
  },
  {
    id: 'image_generation',
    name: '이미지 생성',
    description: 'DALL-E 등을 활용하여 이미지를 생성합니다.',
    enabled: false,
  },
  {
    id: 'data_analysis',
    name: '데이터 분석',
    description: '구조화된 데이터를 분석하고 차트를 생성합니다.',
    enabled: true,
  },
  {
    id: 'email_integration',
    name: '이메일 연동',
    description: '이메일을 읽고 작성하여 업무를 자동화합니다.',
    enabled: false,
  },
];

export const MODERATION_LEVELS: ModerationLevel[] = [
  { value: 1, label: '최소', description: '기본적인 유해 콘텐츠만 차단합니다.' },
  { value: 2, label: '낮음', description: '명백한 유해 콘텐츠와 개인정보를 차단합니다.' },
  { value: 3, label: '보통', description: '유해 콘텐츠, 개인정보, 민감 주제를 필터링합니다.' },
  { value: 4, label: '높음', description: '엄격한 콘텐츠 필터링 + 데이터 마스킹을 적용합니다.' },
  { value: 5, label: '최대', description: '모든 필터 활성화 + 응답 감사 로그를 기록합니다.' },
];

export const INITIAL_AGENT_CONFIG: AgentConfig = {
  name: 'KonaI 비서',
  description: '코나아이 엔터프라이즈 AI 비서 — 업무 자동화, 데이터 분석, 문서 작성을 지원합니다.',
  avatarColor: '#3B82F6',
  selectedModel: 'claude-sonnet-4',
  temperature: 0.7,
  maxTokens: 4096,
  capabilities: DEFAULT_CAPABILITIES,
  systemPrompt: `당신은 코나아이(KonaI)의 엔터프라이즈 AI 비서입니다.

주요 역할:
- 업무 관련 질문에 정확하고 간결하게 답변
- 데이터 분석 요청 시 구조화된 인사이트 제공
- 문서 작성 및 검토 지원
- 한국어와 영어 모두 지원

지침:
- 항상 전문적이고 정중한 톤을 유지하세요.
- 확실하지 않은 정보는 "확인이 필요합니다"라고 말하세요.
- 민감한 개인정보나 기밀 데이터는 직접 출력하지 마세요.`,
  moderationLevel: 3,
  lastModified: '2026-03-10 14:30',
  lastModifiedBy: '홍길동',
};

export const AVATAR_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16',
];
