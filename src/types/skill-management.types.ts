// ============================================================================
// Skill Management Types — v9 Eval-Based Model
// Based on: design/ia-design/skill-ia.md (v9)
// ============================================================================

// --- Skill Category (업무 기능 기준) ---
export type SkillCategory = 'data-analysis' | 'document' | 'automation' | 'communication';

export const SKILL_CATEGORIES: { id: SkillCategory | 'all'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'data-analysis', label: '데이터 분석' },
  { id: 'document', label: '문서 생성' },
  { id: 'automation', label: '업무 자동화' },
  { id: 'communication', label: '커뮤니케이션' },
];

// --- Skill Creation Source ---
export type SkillCreationSource = 'chat' | 'copied' | 'marketplace-ref';

// --- Skill Status ---
export type SkillStatus = 'active' | 'deprecated';

// --- AI Change Summary ---
export type ChangeTag = '추가' | '변경' | '삭제' | '개선';

export interface ChangeEntry {
  tag: ChangeTag;
  /** 변경 대상 + 무엇이 어떻게 바뀌었는지 (한 줄) */
  subject: string;
  /** → 왜 바뀌었는지 또는 사용자에게 미치는 영향 (선택적) */
  impact?: string;
}

// --- Quality Eval (v9: Anthropic eval 구조 — expectations+evidence) ---
export type QualityStatus = 'verified' | 'partial-failure';

export interface EvalExpectation {
  id: string;
  /** 사람이 읽을 수 있는 항목명 (예: "차트 형식", "기간 정확성") */
  label: string;
  passed: boolean;
  /** Grader가 판정한 근거 (예: "꺾은선 차트 형태로 출력됨") */
  evidence: string;
}

export interface EvalTestPrompt {
  /** 자연어 테스트 프롬프트 */
  prompt: string;
  /** 모든 expectations 통과 시 true */
  passed: boolean;
  expectations: EvalExpectation[];
}

export interface SkillEvalResult {
  /** 마지막 Eval 실행 시점 (yyyy.mm.dd) */
  evaluatedAt: string;
  qualityStatus: QualityStatus;
  testPrompts: EvalTestPrompt[];
  /** 💡 참고 — AI 분석 노트 (유의미할 때만 존재) */
  analysisNote?: string;
}

// --- Dynamic Version Comparison (비연속 버전 비교) ---
export interface DynamicComparisonEntry {
  tag: ChangeTag;
  subject: string;
  impact?: string;
  /** 해당 변경이 발생한 버전 (예: "v3에서 추가") */
  occurredIn?: string;
}

// --- Copy Source Metadata ---
export interface CopySource {
  originalSkillId: string;
  originalSkillName: string;
  originalAuthor: string;
  /** 특정 버전 복사 시 기록 */
  baseVersion?: string;
}

// --- Version Entry ---
export interface SkillVersionEntry {
  version: string;
  modifiedAt: string;
  modifiedBy: string;
  /** 구조화된 AI 변경 요약 (v7: 태그 리스트) */
  changeEntries: ChangeEntry[];
  /** 복구로 생성된 버전인 경우 */
  isRestore?: boolean;
  /** 복구 원본 버전 */
  restoredFrom?: string;
  /** 해당 버전 시점의 프롬프트 스냅샷 (원문 비교용) */
  promptSnapshot?: string;
}

// --- Core Skill Interface (Team Skill) ---
export interface TeamSkill {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  category: SkillCategory;
  author: string;
  authorId: string;
  createdAt: string;
  lastModifiedAt: string;
  version: string;
  /** 채팅에서 실제 실행된 총 횟수 */
  callCount: number;
  /** 이 스킬을 활성화한 팀원 ID 목록 */
  activatedBy: string[];
  isActivatedByMe: boolean;
  status: SkillStatus;
  creationSource: SkillCreationSource;

  // Copy source (only for copied skills)
  copySource?: CopySource;

  // Skill body content
  instructionBody: string;
  parameters: SkillParameter[];
  attachments: SkillAttachment[];

  // Version history
  versionHistory: SkillVersionEntry[];

  // Eval result (v9: 모든 스킬은 생성·편집 시 자동 검증됨)
  evalResult: SkillEvalResult;

  // Marketplace fields (v10/v11 — all optional for backward compat)
  isMarketplaceRef?: boolean;
  marketplaceRefId?: string;
  isPublishedToMarketplace?: boolean;
  authorTeam?: string;
}

export interface SkillParameter {
  key: string;
  type: 'string' | 'number' | 'boolean';
  value: string;
  defaultValue: string;
  description: string;
}

export interface SkillAttachment {
  id: string;
  path: string;
  fileName: string;
  fileType: 'text' | 'script' | 'binary';
  content?: string;
  size: number;
}

// --- Marketplace Skill (v10/v11) ---
export interface MarketplaceSkill extends TeamSkill {
  authorTeam: string;
  orgCallCount: number;
  activeTeamCount: number;
  copyCount: number;
  isPopular: boolean;
}

// --- Filter State ---
export type SkillStatusFilter = 'all' | 'activated' | 'deactivated';
export type SkillSourceFilter = 'all' | 'team' | 'marketplace';

// --- Team Member ---
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}
