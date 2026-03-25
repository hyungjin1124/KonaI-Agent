// ============================================================================
// Skill Management Types — v7 Copy-Based Model
// Based on: design/ia-design/03-skill-ia.md (v7)
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
export type SkillCreationSource = 'chat' | 'copied';

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

// --- Copy Source Metadata ---
export interface CopySource {
  originalSkillId: string;
  originalSkillName: string;
  originalAuthor: string;
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

// --- Filter State ---
export type SkillStatusFilter = 'all' | 'activated' | 'deactivated';

// --- Team Member ---
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}
