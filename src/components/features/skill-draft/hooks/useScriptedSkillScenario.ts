// ============================================================================
// useScriptedSkillScenario — Mock 시나리오 진행 엔진
// ============================================================================
//
// SkillDraftScenario 의 단계 테이블을 따라 사용자 입력을 처리하고,
// 다음 에이전트 발화 + 드래프트 패치를 결정한다.
//
// 평가는 setTimeout 으로 회차별 결과를 누적하는 방식으로 시뮬레이션한다.
// ============================================================================

import { useCallback } from 'react';
import type { SkillDraft, EvalRun } from '@/types/skill-draft.types';
import {
  SCENARIO_BY_ID,
  type SkillDraftScenario,
} from '../data/skillDraftScenarios';

interface AdvanceResult {
  /** 드래프트에 적용할 패치 */
  patch: Partial<SkillDraft>;
  /** 다음 에이전트 발화 */
  nextAgentMessage: string;
  /** 모든 6항목이 채워졌는지 */
  isCaptureComplete: boolean;
}

interface RecoveryResult {
  patch: Partial<SkillDraft>;
  acknowledgement: string;
}

export interface UseScriptedSkillScenarioReturn {
  /** 시나리오 시작 (첫 발화 반환) */
  start: (scenarioId: string) => string;

  /** CAPTURING 단계에서 사용자 입력 처리 */
  advance: (userInput: string, draft: SkillDraft) => AdvanceResult;

  /** 평가 실행 (회차마다 콜백으로 결과 push) */
  runEval: (
    scenarioId: string,
    isFirstAttempt: boolean,
    onRun: (run: EvalRun) => void,
  ) => Promise<{ pass: boolean }>;

  /** FAIL 후 회복 발화 처리 */
  applyRecovery: (
    scenarioId: string,
    userInput: string,
    draft: SkillDraft,
  ) => RecoveryResult | null;
}

const RUN_INTERVAL_MS = 800;

export function useScriptedSkillScenario(): UseScriptedSkillScenarioReturn {
  const start = useCallback((scenarioId: string): string => {
    const scenario = SCENARIO_BY_ID.get(scenarioId);
    return scenario?.initialAgentMessage ?? '';
  }, []);

  const advance = useCallback(
    (userInput: string, draft: SkillDraft): AdvanceResult => {
      const scenario = SCENARIO_BY_ID.get(draft.scenarioId);
      if (!scenario) {
        return {
          patch: {},
          nextAgentMessage: '',
          isCaptureComplete: false,
        };
      }

      const currentStep = scenario.steps[draft.scenarioStep];
      if (!currentStep) {
        return {
          patch: {},
          nextAgentMessage: '',
          isCaptureComplete: true,
        };
      }

      const stepPatch = currentStep.applyPatch(userInput, draft);
      const nextStepIndex = draft.scenarioStep + 1;
      const isLast = nextStepIndex >= scenario.steps.length;

      // autoAction 처리
      const extraPatch: Partial<SkillDraft> = {};
      if (currentStep.autoAction === 'SET_PERMISSION') {
        extraPatch.dataPermission = scenario.dataPermission;
        extraPatch.coexistence = scenario.coexistence;
      }

      const finalPatch: Partial<SkillDraft> = {
        ...stepPatch,
        ...extraPatch,
        scenarioStep: nextStepIndex,
      };

      let nextAgentMessage: string;
      if (isLast) {
        nextAgentMessage = `좋습니다. 6항목을 모두 확인했어요.\n\n• 데이터 권한: 통과 (${scenario.dataPermission.verdict})\n• 유사 스킬: 없음\n\n준비가 되셨다면 "이대로 진행해줘" 라고 말씀해주세요. 자동 평가를 시작할게요.`;
      } else {
        const next = scenario.steps[nextStepIndex];
        nextAgentMessage = next.agentMessage;
      }

      return {
        patch: finalPatch,
        nextAgentMessage,
        isCaptureComplete: isLast,
      };
    },
    [],
  );

  const runEval = useCallback(
    async (
      scenarioId: string,
      isFirstAttempt: boolean,
      onRun: (run: EvalRun) => void,
    ): Promise<{ pass: boolean }> => {
      const scenario = SCENARIO_BY_ID.get(scenarioId);
      if (!scenario) return { pass: false };

      const runs = isFirstAttempt
        ? scenario.firstEvalRuns
        : scenario.secondEvalRuns;

      for (const run of runs) {
        await new Promise<void>((resolve) =>
          setTimeout(() => {
            onRun({ ...run, timestamp: new Date().toISOString() });
            resolve();
          }, RUN_INTERVAL_MS),
        );
      }

      const pass = runs.every((r) => r.graderVerdict === 'PASS');
      return { pass };
    },
    [],
  );

  const applyRecovery = useCallback(
    (
      scenarioId: string,
      userInput: string,
      draft: SkillDraft,
    ): RecoveryResult | null => {
      const scenario = SCENARIO_BY_ID.get(scenarioId);
      if (!scenario) return null;
      if (!scenario.hasFailFirstRun) return null;

      // 키워드 매칭 — 하나라도 포함되면 회복으로 인정
      const lower = userInput.toLowerCase();
      const matched = scenario.failRecoveryKeywords.some((kw) =>
        lower.includes(kw.toLowerCase()),
      );
      if (!matched) {
        return {
          patch: {},
          acknowledgement:
            '말씀하신 내용을 어떻게 6항목에 반영해야 할지 잘 모르겠어요. 출력 형식이나 트리거 조건처럼 구체적인 지시를 주시면 더 정확하게 반영할 수 있어요.',
        };
      }

      const patch = scenario.failRecoveryPatch(draft);
      return {
        patch: { ...patch, status: 'CAPTURING' },
        acknowledgement:
          '반영했습니다. 준비가 되시면 "다시 검증해줘" 라고 말씀해주세요.',
      };
    },
    [],
  );

  return { start, advance, runEval, applyRecovery };
}
