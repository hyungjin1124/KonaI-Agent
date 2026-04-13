// ============================================================================
// Skill Draft Scenarios — Mock 데이터
// ============================================================================
//
// Phase 1 mock 시나리오. LLM 호출 없이 키워드 매칭과 단계 테이블로 구동된다.
//
// 한 시나리오는 다음 단계를 가진다:
//   1) 시나리오 시작 → initialAgentMessage
//   2) CAPTURING — usecase6 6항목 캡처 (steps 배열 6+개)
//   3) 진행 트리거 발화 → 자동 권한·Coexistence 결정 → EVALUATING
//   4) runEval — 회차 1/2/3 결과 (PASS 또는 FAIL 시나리오)
//   5) FAIL 시: 회복 키워드 발화 → 6항목 패치 + CAPTURING 복귀
//   6) "다시 검증" → 두 번째 EVALUATING (forcePass=true)
//   7) PASS → 저장
// ============================================================================

import type {
  SkillDraft,
  SkillDraftBody,
  SkillDraftUsecase6,
  EvalRun,
  CoexistenceCheckResult,
  DataPermissionResult,
} from '@/types/skill-draft.types';

// --- 단계 인터페이스 ---

export interface ScenarioStep {
  /** 이 단계에서 에이전트가 하는 발화 */
  agentMessage: string;
  /** 사용자 답변을 받아 드래프트에 적용할 패치 */
  applyPatch: (
    input: string,
    draft: SkillDraft,
  ) => Partial<SkillDraft>;
  /** 단계 완료 후 자동 시스템 액션 */
  autoAction?: 'SET_PERMISSION' | 'SET_COEXISTENCE' | 'NONE';
}

export interface SkillDraftScenario {
  id: string;
  /** 이 시나리오를 트리거하는 사용자 발화 키워드 */
  triggerKeywords: string[];
  /** "○○ 스킬" 형태로 자동 채워질 이름 */
  draftNameTemplate: string;
  /** 시나리오 시작 시 에이전트 첫 발화 */
  initialAgentMessage: string;
  /** 6항목 캡처 단계 */
  steps: ScenarioStep[];
  /** 진행 트리거 발화 키워드 */
  progressKeywords: string[];
  /** 데이터 권한 자동 결정값 */
  dataPermission: DataPermissionResult;
  /** Coexistence 자동 결정값 */
  coexistence: CoexistenceCheckResult;

  /** 1차 평가에서 FAIL이 발생하는가 */
  hasFailFirstRun: boolean;
  /** 1차 평가 결과 (FAIL 또는 PASS) */
  firstEvalRuns: EvalRun[];
  /** 2차 평가 결과 (항상 PASS) */
  secondEvalRuns: EvalRun[];
  /** FAIL 후 에이전트가 채팅에 띄울 회복 제안 */
  failRecoveryHint: string;
  /** 사용자가 회복 발화로 보내는 키워드 */
  failRecoveryKeywords: string[];
  /** 회복 발화 적용 시 patch */
  failRecoveryPatch: (draft: SkillDraft) => Partial<SkillDraft>;

  /** 저장 시 본문 */
  bodyOnSave: SkillDraftBody;
}

// --- 공통 유틸 ---

const ts = () => new Date().toISOString();

const mergeUsecase = (
  draft: SkillDraft,
  patch: Partial<SkillDraftUsecase6>,
): Partial<SkillDraft> => ({
  usecase6: { ...draft.usecase6, ...patch },
  updatedAt: ts(),
});

// ============================================================================
// 시나리오 1 — 매출 리포트 스킬 (PASS 메인 경로)
// ============================================================================

const SALES_REPORT_PASS_RUNS: EvalRun[] = [
  {
    runIndex: 1,
    executorOutput: '월 매출 리포트 표 생성 (사업부별 4행)',
    graderVerdict: 'PASS',
    graderRationale: '표 형식 + 사업부 4개 + 전월비/전년동월비 컬럼 모두 충족',
    timestamp: ts(),
  },
  {
    runIndex: 2,
    executorOutput: '월 매출 리포트 표 생성 (사업부별 4행, 합계 행 포함)',
    graderVerdict: 'PASS',
    graderRationale: '컬럼·정렬·합계 행 모두 기대와 일치',
    timestamp: ts(),
  },
  {
    runIndex: 3,
    executorOutput: '월 매출 리포트 표 + 전월비 색상 강조',
    graderVerdict: 'PASS',
    graderRationale: '시각적 강조까지 포함, 통과',
    timestamp: ts(),
  },
];

export const SALES_REPORT_SCENARIO: SkillDraftScenario = {
  id: 'sales-report',
  triggerKeywords: ['매출 리포트', '매출리포트', '매출 보고서', '매출보고서'],
  draftNameTemplate: '월간 매출 리포트',
  initialAgentMessage:
    '좋습니다. "월간 매출 리포트" 스킬을 함께 만들어볼게요. 먼저 몇 가지를 확인할게요.\n\n**언제** 이 스킬이 트리거되어야 하나요? (예: "매월 초", "분기 마감 후")',
  steps: [
    // Step 0 — when
    {
      agentMessage:
        '**언제** 이 스킬이 트리거되어야 하나요? (예: "매월 초", "분기 마감 후")',
      applyPatch: (input, draft) => mergeUsecase(draft, { when: input }),
    },
    // Step 1 — what
    {
      agentMessage:
        '**무엇을** 수행해야 하나요? (한 줄로 설명해주세요)',
      applyPatch: (input, draft) => mergeUsecase(draft, { what: input }),
    },
    // Step 2 — dataSources
    {
      agentMessage:
        '**어떤 데이터**를 사용해야 하나요? (쉼표로 구분, 예: "ERP 매출 테이블, 사업부 마스터")',
      applyPatch: (input, draft) =>
        mergeUsecase(draft, {
          dataSources: input
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
    },
    // Step 3 — outputFormat
    {
      agentMessage:
        '**어떤 형식**으로 출력하면 되나요? (예: "마크다운 표", "PPT 한 장")',
      applyPatch: (input, draft) => mergeUsecase(draft, { outputFormat: input }),
    },
    // Step 4 — triggerPhrases
    {
      agentMessage:
        '사용자가 **어떤 표현**으로 이 스킬을 호출할 것 같나요? (쉼표로 구분, 예: "매출 정리해줘, 매출 리포트")',
      applyPatch: (input, draft) =>
        mergeUsecase(draft, {
          triggerPhrases: input
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
    },
    // Step 5 — successCriteria
    {
      agentMessage:
        '**성공 기준**은 무엇인가요? (예: "사업부별 합계가 정확하면 OK")',
      applyPatch: (input, draft) => ({
        ...mergeUsecase(draft, { successCriteria: input }),
      }),
      autoAction: 'SET_PERMISSION',
    },
  ],
  progressKeywords: ['진행', '이대로', '검증', '평가', '다음', 'go'],
  dataPermission: {
    verdict: 'A_FULL_PASS',
  },
  coexistence: {
    neighbors: [],
    userDecision: 'NEW',
    autoCopyFallback: false,
  },
  hasFailFirstRun: false,
  firstEvalRuns: SALES_REPORT_PASS_RUNS,
  secondEvalRuns: SALES_REPORT_PASS_RUNS,
  failRecoveryHint: '',
  failRecoveryKeywords: [],
  failRecoveryPatch: (draft) => ({ updatedAt: ts() }),
  bodyOnSave: {
    description:
      '매월 정해진 시점에 ERP 매출 테이블과 사업부 마스터를 조인해 "월간 매출 리포트"를 마크다운 표로 생성한다. 사업부별 행 + 전월비/전년동월비 컬럼이 기본 출력이며, 합계 행이 마지막에 들어간다.',
    triggerConditions:
      '"매출 정리해줘", "이번 달 매출 리포트" 등 월간 매출 요약 요청 발화. 매월 1일~5일 사이의 발화는 우선순위 상승.',
    bodyContent: `# 월간 매출 리포트

## 입력
- 대상 월 (사용자 발화에서 추출, 없으면 직전 월)

## 절차
1. ERP 매출 테이블에서 대상 월 데이터 조회
2. 사업부 마스터와 join
3. 사업부별 합계 + 전월비 + 전년동월비 계산
4. 마크다운 표로 출력 + 합계 행 추가

## 출력 형식
| 사업부 | 매출 | 전월비 | 전년동월비 |
|--------|------|--------|-----------|
| ...    | ...  | ...    | ...       |
| **합계** | ... | ... | ... |
`,
    referencedDataViews: ['erp_sales_monthly', 'business_unit_master'],
    category: 'data-analysis',
  },
};

// ============================================================================
// 시나리오 2 — 회의록 요약 스킬 (FAIL → 회복 → PASS)
// ============================================================================

const MEETING_FAIL_RUNS: EvalRun[] = [
  {
    runIndex: 1,
    executorOutput: '회의록 요약 (3 단락)',
    graderVerdict: 'PASS',
    graderRationale: '핵심 결정/액션/이슈 3 단락 구조 충족',
    timestamp: ts(),
  },
  {
    runIndex: 2,
    executorOutput: '회의록 요약 (긴 산문 형식)',
    graderVerdict: 'FAIL',
    graderRationale: '액션 아이템이 글머리표가 아닌 산문으로 출력됨 — 출력 형식 명세 부족',
    timestamp: ts(),
  },
  {
    runIndex: 3,
    executorOutput: '회의록 요약 (3 단락)',
    graderVerdict: 'PASS',
    graderRationale: '구조 회복',
    timestamp: ts(),
  },
];

const MEETING_PASS_RUNS: EvalRun[] = [
  {
    runIndex: 1,
    executorOutput: '회의록 요약 (액션 아이템 글머리표 명시)',
    graderVerdict: 'PASS',
    graderRationale: '액션 아이템 글머리표 강제 명세가 추가되어 안정적',
    timestamp: ts(),
  },
  {
    runIndex: 2,
    executorOutput: '회의록 요약 (액션 아이템 글머리표 명시)',
    graderVerdict: 'PASS',
    graderRationale: '동일하게 안정',
    timestamp: ts(),
  },
  {
    runIndex: 3,
    executorOutput: '회의록 요약 (액션 아이템 글머리표 명시)',
    graderVerdict: 'PASS',
    graderRationale: '3회 모두 동일 구조 유지',
    timestamp: ts(),
  },
];

export const MEETING_NOTES_SCENARIO: SkillDraftScenario = {
  id: 'meeting-notes',
  triggerKeywords: ['회의록', '미팅 노트', '회의 요약'],
  draftNameTemplate: '회의록 요약',
  initialAgentMessage:
    '좋습니다. "회의록 요약" 스킬을 함께 만들어볼게요.\n\n**언제** 이 스킬이 트리거되어야 하나요? (예: "회의 직후", "팀 미팅 종료 시")',
  steps: [
    {
      agentMessage:
        '**언제** 이 스킬이 트리거되어야 하나요? (예: "회의 직후", "팀 미팅 종료 시")',
      applyPatch: (input, draft) => mergeUsecase(draft, { when: input }),
    },
    {
      agentMessage: '**무엇을** 수행해야 하나요?',
      applyPatch: (input, draft) => mergeUsecase(draft, { what: input }),
    },
    {
      agentMessage:
        '**어떤 데이터**를 사용해야 하나요? (예: "회의록 텍스트, 참석자 목록")',
      applyPatch: (input, draft) =>
        mergeUsecase(draft, {
          dataSources: input
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
    },
    {
      agentMessage: '**어떤 형식**으로 출력하면 되나요?',
      applyPatch: (input, draft) => mergeUsecase(draft, { outputFormat: input }),
    },
    {
      agentMessage:
        '사용자가 **어떤 표현**으로 호출할 것 같나요? (쉼표로 구분)',
      applyPatch: (input, draft) =>
        mergeUsecase(draft, {
          triggerPhrases: input
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
    },
    {
      agentMessage: '**성공 기준**은 무엇인가요?',
      applyPatch: (input, draft) =>
        mergeUsecase(draft, { successCriteria: input }),
      autoAction: 'SET_PERMISSION',
    },
  ],
  progressKeywords: ['진행', '이대로', '검증', '평가', '다음', 'go'],
  dataPermission: {
    verdict: 'A_FULL_PASS',
  },
  coexistence: {
    neighbors: [],
    userDecision: 'NEW',
    autoCopyFallback: false,
  },
  hasFailFirstRun: true,
  firstEvalRuns: MEETING_FAIL_RUNS,
  secondEvalRuns: MEETING_PASS_RUNS,
  failRecoveryHint:
    '2회차 검증에서 액션 아이템이 산문으로 출력됐습니다. 출력 형식에 "액션 아이템은 반드시 글머리표"라고 명시하면 안정될 것 같습니다. 어떻게 수정할까요?',
  failRecoveryKeywords: ['글머리', '글머리표', '불릿', '표', '형식'],
  failRecoveryPatch: (draft) => ({
    usecase6: {
      ...draft.usecase6,
      outputFormat:
        (draft.usecase6.outputFormat ?? '') +
        ' (액션 아이템은 반드시 글머리표 형식)',
    },
    updatedAt: ts(),
  }),
  bodyOnSave: {
    description:
      '회의록 텍스트를 받아 핵심 결정 / 액션 아이템 / 미해결 이슈 3 단락으로 요약한다. 액션 아이템은 반드시 글머리표 형식으로 출력한다.',
    triggerConditions:
      '"회의록 정리해줘", "미팅 노트 요약" 등 회의록 요약 요청 발화.',
    bodyContent: `# 회의록 요약

## 입력
- 회의록 원문 텍스트
- (선택) 참석자 목록

## 출력 형식
### 핵심 결정
- (결정 1)
- (결정 2)

### 액션 아이템
- [ ] (담당자) (액션)
- [ ] (담당자) (액션)

### 미해결 이슈
- (이슈 1)
- (이슈 2)
`,
    referencedDataViews: [],
    category: 'document',
  },
};

// ============================================================================
// 시나리오 레지스트리
// ============================================================================

export const SCENARIOS: SkillDraftScenario[] = [
  SALES_REPORT_SCENARIO,
  MEETING_NOTES_SCENARIO,
];

export const SCENARIO_BY_ID = new Map(
  SCENARIOS.map((s) => [s.id, s] as const),
);

/** 사용자 발화에서 시나리오 ID 추출 (없으면 null) */
export function findScenarioByUtterance(
  utterance: string,
): SkillDraftScenario | null {
  const lower = utterance.toLowerCase();
  for (const scenario of SCENARIOS) {
    if (scenario.triggerKeywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return scenario;
    }
  }
  return null;
}
