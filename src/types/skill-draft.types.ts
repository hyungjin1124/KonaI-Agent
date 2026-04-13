// ============================================================================
// Skill Draft Types — Phase 1
// Based on: docs/design/ia-design/skill-ia-creation-flow.md (v1)
// ============================================================================
//
// 사용자 발화 기반 스킬 생성/편집 플로우의 드래프트 엔티티 모델.
// - 채팅 세션에 1:1 종속 (D8, D10)
// - 채팅이 살아있는 한 드래프트도 살아있음 (D9)
// - 아티팩트 패널은 read-only (D11)
//
// IA Phase 1 스코프: CAPTURING → EVALUATING → EVAL_PASS|EVAL_FAIL → SAVED|DISCARDED
// ============================================================================

import type { Artifact } from '@/components/features/agent-chat/types';
import type { TeamSkill, SkillCategory } from './skill-management.types';

// --- Lifecycle Status ---
export type SkillDraftStatus =
  | 'CAPTURING'
  | 'EVALUATING'
  | 'EVAL_PASS'
  | 'EVAL_FAIL'
  | 'SAVED'
  | 'DISCARDED';

// --- 데이터 권한 판정 (D6: A/C/D 3분면) ---
export type DataPermissionVerdict =
  | 'A_FULL_PASS'      // 전량 통과
  | 'C_SCOPE_REDUCED'  // 범위 축소 후 진행
  | 'D_INFEASIBLE';    // 성립 불가

export interface DataPermissionResult {
  verdict: DataPermissionVerdict;
  /** C인 경우 축소된 범위 설명 */
  scopeReductionNote?: string;
  /** D인 경우 성립 불가 사유 */
  infeasibilityReason?: string;
}

// --- 1단계 6항목 (Recognition over Recall) ---
export interface SkillDraftUsecase6 {
  /** 언제 트리거되는가 */
  when: string;
  /** 무엇을 수행하는가 */
  what: string;
  /** 어떤 데이터를 사용하는가 */
  dataSources: string[];
  /** 어떤 형식으로 출력하는가 */
  outputFormat: string;
  /** 어떤 표현으로 호출되는가 */
  triggerPhrases: string[];
  /** 언제 성공으로 판단하는가 */
  successCriteria: string;
}

// --- Coexistence Check (D4: 역할 이어받기) ---
export interface CoexistenceNeighbor {
  skillId: string;
  name: string;
  author: string;
  /** 0~1 유사도 점수 (mock에서는 시나리오에서 직접 지정) */
  similarityScore: number;
}

export type CoexistenceUserDecision =
  | 'NEW'           // 새로 만들기
  | 'INHERIT_ROLE'  // 역할 이어받기
  | 'MERGE'         // 기존 스킬에 합치기
  | null;

export interface CoexistenceCheckResult {
  neighbors: CoexistenceNeighbor[];
  userDecision: CoexistenceUserDecision;
  /** 타인 스킬 상속/통합 시 자동 복사 폴백 */
  autoCopyFallback: boolean;
}

// --- 2단계 평가 결과 (D7: 3/3 이진 판정) ---
export interface EvalRun {
  runIndex: 1 | 2 | 3;
  executorOutput: string;
  graderVerdict: 'PASS' | 'FAIL';
  graderRationale: string;
  timestamp: string;
}

// --- 저장 시 생성될 스킬 본문 ---
export interface SkillDraftBody {
  /** description 80% 투자 원칙 */
  description: string;
  triggerConditions: string;
  /** SKILL.md 본문 */
  bodyContent: string;
  referencedDataViews: string[];
  /** 저장 시 부여할 카테고리 */
  category: SkillCategory;
}

// --- 핵심 드래프트 엔티티 ---
export interface SkillDraft {
  id: string;
  /** 1:1 종속 채팅 세션 ID (D10) */
  chatSessionId: string;
  status: SkillDraftStatus;
  createdAt: string;
  updatedAt: string;

  /** 편집 모드인 경우만 채워짐 (D14) */
  originSkillId: string | null;
  originVersion: string | null;

  /** 시나리오 진행 상태 (mock 전용) */
  scenarioId: string;
  /** 현재까지 진행된 ScenarioStep 인덱스 */
  scenarioStep: number;

  /** 6항목 캡처가 어느 정도 진행되면 자동 생성 */
  draftName: string;

  /** 1단계 캡처 데이터 — 진행 중에는 부분만 채워짐 */
  usecase6: Partial<SkillDraftUsecase6>;
  dataPermission: DataPermissionResult | null;
  coexistence: CoexistenceCheckResult | null;

  /** 2단계 자동 평가 결과 (최대 3건) */
  evalRuns: EvalRun[];

  /** 저장 직전 단계에서 채워지는 본문 */
  body: SkillDraftBody | null;
}

// --- Artifact 시스템과의 연결 ---
//
// 기존 ArtifactType / ArtifactPreviewType 에 'skill-draft' 가 추가된다
// (src/components/features/agent-chat/types.ts 참조).
// 이 인터페이스는 그 확장된 Artifact 위에 draftId 만 추가한다.
export interface SkillDraftArtifact extends Artifact {
  type: 'skill-draft';
  /** SkillDraft.id 와 동일 */
  draftId: string;
}

// --- 변환 헬퍼 시그니처 ---
//
// useSkillDraft.save() 에서 SkillDraft → TeamSkill 변환에 쓰임.
// 실제 구현은 hook 안에서 이 시그니처에 맞춰 작성한다.
export type DraftToSkillConverter = (
  draft: SkillDraft,
) => Omit<TeamSkill, 'id'>;

// --- 유틸 타입: 6항목 키 목록 ---
export const USECASE_6_KEYS: ReadonlyArray<keyof SkillDraftUsecase6> = [
  'when',
  'what',
  'dataSources',
  'outputFormat',
  'triggerPhrases',
  'successCriteria',
] as const;

export const USECASE_6_LABELS: Record<keyof SkillDraftUsecase6, string> = {
  when: '언제',
  what: '무엇을',
  dataSources: '어떤 데이터로',
  outputFormat: '출력 형식',
  triggerPhrases: '호출 표현',
  successCriteria: '성공 기준',
} as const;
