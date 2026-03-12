// ── Types ──────────────────────────────────────────────

export type PromptStatus = 'draft' | 'active' | 'archived';
export type PromptCategory = 'system' | 'task' | 'persona' | 'guard' | 'custom';

export interface PromptVersion {
  version: number;
  content: string;
  createdAt: string;
  createdBy: string;
  changeSummary: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: PromptCategory;
  status: PromptStatus;
  currentVersion: number;
  content: string;
  variables: string[];
  description: string;
  versions: PromptVersion[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  charCount: number;
}

// ── Constants ──────────────────────────────────────────

export const PROMPT_CATEGORIES: { value: PromptCategory; label: string }[] = [
  { value: 'system', label: '시스템' },
  { value: 'task', label: '태스크' },
  { value: 'persona', label: '페르소나' },
  { value: 'guard', label: '가드레일' },
  { value: 'custom', label: '커스텀' },
];

export const PROMPT_STATUSES: { value: PromptStatus; label: string }[] = [
  { value: 'draft', label: '초안' },
  { value: 'active', label: '활성' },
  { value: 'archived', label: '보관' },
];

export const STATUS_STYLES: Record<PromptStatus, string> = {
  draft: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  archived: 'bg-gray-50 text-gray-500 border-gray-200',
};

export const CATEGORY_STYLES: Record<PromptCategory, string> = {
  system: 'bg-blue-50 text-blue-700 border-blue-200',
  task: 'bg-purple-50 text-purple-700 border-purple-200',
  persona: 'bg-pink-50 text-pink-700 border-pink-200',
  guard: 'bg-red-50 text-red-700 border-red-200',
  custom: 'bg-gray-50 text-gray-600 border-gray-200',
};

// ── Helpers ────────────────────────────────────────────

export function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
}

export function filterTemplates(
  templates: PromptTemplate[],
  filters: {
    search?: string;
    category?: string;
    status?: string;
  },
): PromptTemplate[] {
  return templates.filter((t) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filters.category && filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.status && filters.status !== 'all' && t.status !== filters.status) return false;
    return true;
  });
}

export function getCategoryLabel(category: PromptCategory): string {
  return PROMPT_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

export function getStatusLabel(status: PromptStatus): string {
  return PROMPT_STATUSES.find((s) => s.value === status)?.label ?? status;
}

// ── Mock Data ──────────────────────────────────────────

export const MOCK_TEMPLATES: PromptTemplate[] = [
  {
    id: 'pt-001',
    name: '기본 어시스턴트',
    category: 'system',
    status: 'active',
    currentVersion: 3,
    content:
      '당신은 {{company_name}}의 AI 어시스턴트입니다. 사용자의 질문에 정확하고 친절하게 답변하세요. 답변은 {{language}}로 작성하세요.',
    variables: ['company_name', 'language'],
    description: '범용 AI 어시스턴트의 기본 시스템 프롬프트',
    versions: [
      { version: 1, content: '당신은 AI 어시스턴트입니다.', createdAt: '2026-01-15', createdBy: '김관리', changeSummary: '초기 버전' },
      { version: 2, content: '당신은 {{company_name}}의 AI 어시스턴트입니다. 사용자의 질문에 정확하게 답변하세요.', createdAt: '2026-02-01', createdBy: '김관리', changeSummary: '회사명 변수 추가' },
      { version: 3, content: '당신은 {{company_name}}의 AI 어시스턴트입니다. 사용자의 질문에 정확하고 친절하게 답변하세요. 답변은 {{language}}로 작성하세요.', createdAt: '2026-02-20', createdBy: '박개발', changeSummary: '언어 변수 및 친절 톤 추가' },
    ],
    createdAt: '2026-01-15',
    updatedAt: '2026-02-20',
    createdBy: '김관리',
    charCount: 79,
  },
  {
    id: 'pt-002',
    name: '데이터 분석가',
    category: 'persona',
    status: 'active',
    currentVersion: 2,
    content:
      '당신은 {{department}} 부서의 수석 데이터 분석가입니다. SQL, Python, 통계 분석에 전문성을 갖추고 있습니다. 데이터 기반의 인사이트를 제공하고, 시각화 제안도 함께 해주세요.',
    variables: ['department'],
    description: '데이터 분석 업무 특화 페르소나',
    versions: [
      { version: 1, content: '당신은 데이터 분석가입니다.', createdAt: '2026-01-20', createdBy: '이분석', changeSummary: '초기 버전' },
      { version: 2, content: '당신은 {{department}} 부서의 수석 데이터 분석가입니다. SQL, Python, 통계 분석에 전문성을 갖추고 있습니다.', createdAt: '2026-02-10', createdBy: '이분석', changeSummary: '부서 변수 및 전문성 상세화' },
    ],
    createdAt: '2026-01-20',
    updatedAt: '2026-02-10',
    createdBy: '이분석',
    charCount: 97,
  },
  {
    id: 'pt-003',
    name: '보고서 작성기',
    category: 'task',
    status: 'active',
    currentVersion: 2,
    content:
      '다음 데이터를 분석하여 {{report_type}} 형식의 보고서를 작성하세요. 보고서에는 요약, 핵심 지표, 개선 제안을 포함하세요. 대상 독자는 {{audience}}입니다.',
    variables: ['report_type', 'audience'],
    description: '정형 보고서 자동 생성용 태스크 프롬프트',
    versions: [
      { version: 1, content: '데이터를 분석하여 보고서를 작성하세요.', createdAt: '2026-02-01', createdBy: '최기획', changeSummary: '초기 버전' },
      { version: 2, content: '다음 데이터를 분석하여 {{report_type}} 형식의 보고서를 작성하세요.', createdAt: '2026-02-15', createdBy: '최기획', changeSummary: '보고서 유형/독자 변수 추가' },
    ],
    createdAt: '2026-02-01',
    updatedAt: '2026-02-15',
    createdBy: '최기획',
    charCount: 95,
  },
  {
    id: 'pt-004',
    name: '개인정보 가드레일',
    category: 'guard',
    status: 'active',
    currentVersion: 2,
    content:
      '절대로 사용자의 개인정보(이름, 전화번호, 주민등록번호, 카드번호)를 외부에 노출하지 마세요. 개인정보가 포함된 질문에는 "개인정보 보호를 위해 해당 정보는 처리할 수 없습니다"라고 응답하세요.',
    variables: [],
    description: '개인정보 보호를 위한 가드레일 프롬프트',
    versions: [
      { version: 1, content: '개인정보를 노출하지 마세요.', createdAt: '2026-01-25', createdBy: '정보안', changeSummary: '초기 버전' },
      { version: 2, content: '절대로 사용자의 개인정보(이름, 전화번호, 주민등록번호, 카드번호)를 외부에 노출하지 마세요.', createdAt: '2026-02-05', createdBy: '정보안', changeSummary: '구체적 개인정보 유형 명시' },
    ],
    createdAt: '2026-01-25',
    updatedAt: '2026-02-05',
    createdBy: '정보안',
    charCount: 108,
  },
  {
    id: 'pt-005',
    name: '코드 리뷰어',
    category: 'persona',
    status: 'active',
    currentVersion: 2,
    content:
      '당신은 10년 경력의 시니어 소프트웨어 엔지니어입니다. {{language}} 코드를 리뷰하고, 버그, 성능 이슈, 보안 취약점을 지적하세요. 개선 제안은 구체적인 코드 예시와 함께 제시하세요.',
    variables: ['language'],
    description: '코드 리뷰 특화 페르소나',
    versions: [
      { version: 1, content: '코드를 리뷰해주세요.', createdAt: '2026-02-10', createdBy: '박개발', changeSummary: '초기 버전' },
      { version: 2, content: '당신은 10년 경력의 시니어 소프트웨어 엔지니어입니다. {{language}} 코드를 리뷰하고, 버그, 성능 이슈, 보안 취약점을 지적하세요.', createdAt: '2026-02-25', createdBy: '박개발', changeSummary: '경력 및 리뷰 범위 상세화' },
    ],
    createdAt: '2026-02-10',
    updatedAt: '2026-02-25',
    createdBy: '박개발',
    charCount: 105,
  },
  {
    id: 'pt-006',
    name: '고객 응대 에이전트',
    category: 'system',
    status: 'active',
    currentVersion: 3,
    content:
      '당신은 {{company_name}} 고객센터의 AI 상담원입니다. 고객의 문의에 공감하며 친절하게 응대하세요. 해결이 어려운 문제는 "담당자에게 연결해드리겠습니다"라고 안내하세요. 응대 언어는 {{language}}입니다.',
    variables: ['company_name', 'language'],
    description: '고객 응대용 시스템 프롬프트',
    versions: [
      { version: 1, content: '고객 문의에 응대하세요.', createdAt: '2026-01-18', createdBy: '한서비스', changeSummary: '초기 버전' },
      { version: 2, content: '당신은 고객센터의 AI 상담원입니다. 고객의 문의에 공감하며 친절하게 응대하세요.', createdAt: '2026-02-03', createdBy: '한서비스', changeSummary: '공감 톤 추가' },
      { version: 3, content: '당신은 {{company_name}} 고객센터의 AI 상담원입니다. 고객의 문의에 공감하며 친절하게 응대하세요.', createdAt: '2026-02-28', createdBy: '한서비스', changeSummary: '회사명/언어 변수 추가, 에스컬레이션 안내' },
    ],
    createdAt: '2026-01-18',
    updatedAt: '2026-02-28',
    createdBy: '한서비스',
    charCount: 118,
  },
  {
    id: 'pt-007',
    name: '요약 생성기',
    category: 'task',
    status: 'draft',
    currentVersion: 1,
    content:
      '다음 문서를 {{max_length}}자 이내로 요약하세요. 핵심 논점과 결론을 반드시 포함하세요. 불필요한 수식어는 제거하고 간결하게 작성하세요.',
    variables: ['max_length'],
    description: '문서 요약 태스크 프롬프트 (초안)',
    versions: [
      { version: 1, content: '다음 문서를 {{max_length}}자 이내로 요약하세요.', createdAt: '2026-03-01', createdBy: '최기획', changeSummary: '초기 버전' },
    ],
    createdAt: '2026-03-01',
    updatedAt: '2026-03-01',
    createdBy: '최기획',
    charCount: 72,
  },
  {
    id: 'pt-008',
    name: '할루시네이션 방지',
    category: 'guard',
    status: 'active',
    currentVersion: 2,
    content:
      '확실하지 않은 정보에 대해서는 "확인이 필요합니다"라고 답변하세요. 추측이나 가정을 사실처럼 제시하지 마세요. 출처를 명시할 수 있는 경우 반드시 출처를 포함하세요.',
    variables: [],
    description: '허위 정보 생성 방지 가드레일',
    versions: [
      { version: 1, content: '모르는 것은 모른다고 하세요.', createdAt: '2026-02-08', createdBy: '정보안', changeSummary: '초기 버전' },
      { version: 2, content: '확실하지 않은 정보에 대해서는 "확인이 필요합니다"라고 답변하세요. 추측이나 가정을 사실처럼 제시하지 마세요.', createdAt: '2026-02-18', createdBy: '정보안', changeSummary: '출처 명시 규칙 추가' },
    ],
    createdAt: '2026-02-08',
    updatedAt: '2026-02-18',
    createdBy: '정보안',
    charCount: 89,
  },
  {
    id: 'pt-009',
    name: '번역 에이전트',
    category: 'task',
    status: 'active',
    currentVersion: 2,
    content:
      '다음 텍스트를 {{source_lang}}에서 {{target_lang}}로 번역하세요. 원문의 톤과 뉘앙스를 최대한 유지하세요. 전문 용어는 원어를 괄호로 병기하세요.',
    variables: ['source_lang', 'target_lang'],
    description: '다국어 번역 태스크 프롬프트',
    versions: [
      { version: 1, content: '텍스트를 번역하세요.', createdAt: '2026-02-12', createdBy: '김관리', changeSummary: '초기 버전' },
      { version: 2, content: '다음 텍스트를 {{source_lang}}에서 {{target_lang}}로 번역하세요. 원문의 톤과 뉘앙스를 최대한 유지하세요.', createdAt: '2026-02-22', createdBy: '김관리', changeSummary: '언어 변수 및 톤 유지 규칙 추가' },
    ],
    createdAt: '2026-02-12',
    updatedAt: '2026-02-22',
    createdBy: '김관리',
    charCount: 85,
  },
  {
    id: 'pt-010',
    name: '회의록 작성기',
    category: 'task',
    status: 'draft',
    currentVersion: 1,
    content:
      '다음 회의 내용을 정리하여 회의록을 작성하세요. 참석자: {{attendees}}. 형식: 안건별 논의 내용, 결정 사항, 액션 아이템(담당자/기한 포함)으로 구성하세요.',
    variables: ['attendees'],
    description: '회의록 자동 생성 태스크 프롬프트 (초안)',
    versions: [
      { version: 1, content: '다음 회의 내용을 정리하여 회의록을 작성하세요.', createdAt: '2026-03-05', createdBy: '최기획', changeSummary: '초기 버전' },
    ],
    createdAt: '2026-03-05',
    updatedAt: '2026-03-05',
    createdBy: '최기획',
    charCount: 91,
  },
  {
    id: 'pt-011',
    name: '영업 제안서 도우미',
    category: 'persona',
    status: 'archived',
    currentVersion: 2,
    content:
      '당신은 {{industry}} 업종 전문 영업 컨설턴트입니다. 고객의 니즈를 파악하고, 맞춤형 제안서를 작성하세요. ROI 분석과 경쟁사 대비 장점을 반드시 포함하세요.',
    variables: ['industry'],
    description: '영업 제안서 작성 보조 (v1 → 폐기)',
    versions: [
      { version: 1, content: '제안서를 작성하세요.', createdAt: '2026-01-10', createdBy: '강영업', changeSummary: '초기 버전' },
      { version: 2, content: '당신은 {{industry}} 업종 전문 영업 컨설턴트입니다.', createdAt: '2026-01-28', createdBy: '강영업', changeSummary: '업종 변수 및 ROI 분석 요구 추가' },
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-01-28',
    createdBy: '강영업',
    charCount: 94,
  },
  {
    id: 'pt-012',
    name: 'SQL 쿼리 생성기',
    category: 'task',
    status: 'active',
    currentVersion: 2,
    content:
      '사용자의 자연어 질문을 {{db_type}} SQL 쿼리로 변환하세요. 테이블 스키마: {{schema}}. 쿼리는 최적화된 형태로 작성하고, 주석으로 각 절의 목적을 설명하세요.',
    variables: ['db_type', 'schema'],
    description: 'NL-to-SQL 변환 태스크 프롬프트',
    versions: [
      { version: 1, content: 'SQL 쿼리를 작성하세요.', createdAt: '2026-02-05', createdBy: '이분석', changeSummary: '초기 버전' },
      { version: 2, content: '사용자의 자연어 질문을 {{db_type}} SQL 쿼리로 변환하세요. 테이블 스키마: {{schema}}.', createdAt: '2026-02-20', createdBy: '이분석', changeSummary: 'DB 유형/스키마 변수 추가, 주석 요구' },
    ],
    createdAt: '2026-02-05',
    updatedAt: '2026-02-20',
    createdBy: '이분석',
    charCount: 98,
  },
];
