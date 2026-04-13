// ============================================================================
// useSkillDraft — 드래프트 상태머신 + 단일 인스턴스 제약
// ============================================================================
//
// 한 채팅 세션에 1개의 SkillDraft 만 살아있을 수 있다 (D10).
// 채팅 세션이 바뀌면 자동으로 reset 된다 (D9 — 채팅 종속 lifecycle).
//
// 상태 전이:
//   create → CAPTURING
//   transitionTo('EVALUATING')   ← 사용자 발화 트리거
//   transitionTo('EVAL_PASS' | 'EVAL_FAIL')
//   transitionTo('CAPTURING')    ← FAIL 후 회복
//   save() → SAVED  (TeamSkill 반환)
//   discard() → DISCARDED
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  SkillDraft,
  SkillDraftStatus,
  DraftToSkillConverter,
} from '@/types/skill-draft.types';
import type { TeamSkill } from '@/types/skill-management.types';
import {
  SCENARIO_BY_ID,
  type SkillDraftScenario,
} from '../data/skillDraftScenarios';

interface CreateParams {
  scenarioId: string;
  chatSessionId: string;
  /** 편집 모드인 경우 */
  originSkill?: TeamSkill;
}

export interface UseSkillDraftReturn {
  draft: SkillDraft | null;
  scenario: SkillDraftScenario | null;
  create: (params: CreateParams) => SkillDraft | null;
  applyPatch: (patch: Partial<SkillDraft>) => void;
  transitionTo: (next: SkillDraftStatus) => void;
  appendEvalRun: (run: SkillDraft['evalRuns'][number]) => void;
  save: () => Omit<TeamSkill, 'id'> | null;
  discard: () => void;
  reset: () => void;
}

const ts = () => new Date().toISOString();

const newId = () =>
  `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// --- SkillDraft → TeamSkill 변환 ---
const convertDraftToSkill: DraftToSkillConverter = (draft) => {
  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  })();

  const body = draft.body;
  if (!body) {
    throw new Error('Cannot convert draft without body');
  }

  // Eval result 변환 (skill-management.types 기준)
  const evalResult = {
    evaluatedAt: today,
    qualityStatus: 'verified' as const,
    testPrompts: draft.evalRuns.map((run) => ({
      prompt: `Run ${run.runIndex}`,
      passed: run.graderVerdict === 'PASS',
      expectations: [
        {
          id: `exp-${run.runIndex}`,
          label: '평가 기준',
          passed: run.graderVerdict === 'PASS',
          evidence: run.graderRationale,
        },
      ],
    })),
  };

  return {
    name: draft.draftName,
    description: body.description.slice(0, 120),
    fullDescription: body.description,
    category: body.category,
    author: '나',
    authorId: 'current-user',
    createdAt: today,
    lastModifiedAt: today,
    version: draft.originVersion ? bumpVersion(draft.originVersion) : 'v1',
    callCount: 0,
    activatedBy: ['current-user'],
    isActivatedByMe: true,
    status: 'active',
    creationSource: 'chat',
    instructionBody: body.bodyContent,
    parameters: [],
    attachments: [],
    versionHistory: [
      {
        version: draft.originVersion ? bumpVersion(draft.originVersion) : 'v1',
        modifiedAt: today,
        modifiedBy: '나',
        changeEntries: draft.originSkillId
          ? [{ tag: '변경', subject: '대화로 편집됨' }]
          : [{ tag: '추가', subject: '대화로 신규 생성됨' }],
      },
    ],
    evalResult,
  };
};

const bumpVersion = (v: string): string => {
  const m = v.match(/^v(\d+)$/);
  if (m) return `v${parseInt(m[1], 10) + 1}`;
  return `${v}+1`;
};

export function useSkillDraft(chatSessionId: string): UseSkillDraftReturn {
  const [draft, setDraft] = useState<SkillDraft | null>(null);
  const scenarioRef = useRef<SkillDraftScenario | null>(null);

  // 채팅 세션 변경 시 reset
  useEffect(() => {
    setDraft(null);
    scenarioRef.current = null;
  }, [chatSessionId]);

  const create = useCallback(
    (params: CreateParams): SkillDraft | null => {
      const scenario = SCENARIO_BY_ID.get(params.scenarioId);
      if (!scenario) return null;

      // 단일 인스턴스 제약 — 이미 살아있는 드래프트가 있으면 거부
      // (실제 호출처에서 가드하지만 안전망)
      // SAVED/DISCARDED 상태는 종료된 것으로 간주하고 새로 만들 수 있음
      const isAlive =
        draft &&
        draft.status !== 'SAVED' &&
        draft.status !== 'DISCARDED' &&
        draft.chatSessionId === params.chatSessionId;
      if (isAlive) return null;

      const fresh: SkillDraft = {
        id: newId(),
        chatSessionId: params.chatSessionId,
        status: 'CAPTURING',
        createdAt: ts(),
        updatedAt: ts(),
        originSkillId: params.originSkill?.id ?? null,
        originVersion: params.originSkill?.version ?? null,
        scenarioId: scenario.id,
        scenarioStep: 0,
        draftName: scenario.draftNameTemplate,
        usecase6: params.originSkill
          ? {
              when: '',
              what: params.originSkill.description,
              dataSources: [],
              outputFormat: '',
              triggerPhrases: [],
              successCriteria: '',
            }
          : {},
        dataPermission: null,
        coexistence: null,
        evalRuns: [],
        body: null,
      };

      scenarioRef.current = scenario;
      setDraft(fresh);
      return fresh;
    },
    [draft],
  );

  const applyPatch = useCallback((patch: Partial<SkillDraft>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, ...patch, updatedAt: ts() };
    });
  }, []);

  const transitionTo = useCallback((next: SkillDraftStatus) => {
    setDraft((prev) => {
      if (!prev) return prev;
      // EVAL_FAIL → CAPTURING 전이 시 evalRuns 비우기
      if (prev.status === 'EVAL_FAIL' && next === 'CAPTURING') {
        return { ...prev, status: next, evalRuns: [], updatedAt: ts() };
      }
      // EVALUATING 진입 시 evalRuns 초기화
      if (next === 'EVALUATING') {
        return { ...prev, status: next, evalRuns: [], updatedAt: ts() };
      }
      return { ...prev, status: next, updatedAt: ts() };
    });
  }, []);

  const appendEvalRun = useCallback((run: SkillDraft['evalRuns'][number]) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        evalRuns: [...prev.evalRuns, run],
        updatedAt: ts(),
      };
    });
  }, []);

  const save = useCallback((): Omit<TeamSkill, 'id'> | null => {
    if (!draft) return null;
    if (draft.status !== 'EVAL_PASS') return null;

    // body 가 비어있으면 시나리오에서 채워넣음
    const scenario = scenarioRef.current;
    const body = draft.body ?? scenario?.bodyOnSave ?? null;
    if (!body) return null;

    const draftWithBody: SkillDraft = { ...draft, body };
    const skill = convertDraftToSkill(draftWithBody);

    setDraft({ ...draftWithBody, status: 'SAVED', updatedAt: ts() });
    return skill;
  }, [draft]);

  const discard = useCallback(() => {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, status: 'DISCARDED', updatedAt: ts() };
    });
  }, []);

  const reset = useCallback(() => {
    setDraft(null);
    scenarioRef.current = null;
  }, []);

  return {
    draft,
    scenario: scenarioRef.current,
    create,
    applyPatch,
    transitionTo,
    appendEvalRun,
    save,
    discard,
    reset,
  };
}
