// ============================================================================
// useSkillIntentDetection — 사용자 발화 의도 감지
// ============================================================================
//
// LLM 호출 없이 키워드/정규식으로 다음 의도를 감지한다.
//
//   - 새 스킬 생성 의도 ("매출 리포트 스킬 만들어줘")
//   - 진행/검증 의도 ("이대로 진행해줘", "다시 검증")
//   - 저장 의도 ("저장해줘")
//   - 폐기 의도 ("취소", "폐기", "필요 없어")
//
// 감지 결과는 GeneralChatView.handleSend 가 분기에 사용한다.
// 드래프트 현재 상태를 같이 받아 의도 충돌을 방지한다.
// ============================================================================

import { useCallback } from 'react';
import type { SkillDraft } from '@/types/skill-draft.types';
import { findScenarioByUtterance } from '../data/skillDraftScenarios';

export interface SkillIntentResult {
  /** 새 드래프트를 생성할 의도가 있고, 활성 드래프트가 없는 상태 */
  isCreateIntent: boolean;
  /** 매칭된 시나리오 ID (isCreateIntent 일 때만 의미) */
  scenarioId?: string;

  /** 캡처 → 평가 진입 의도 */
  isProgressIntent: boolean;
  /** 저장 의도 */
  isSaveIntent: boolean;
  /** 폐기 의도 */
  isDiscardIntent: boolean;
  /** FAIL 후 회복 발화로 해석 가능한 입력 */
  isRecoveryIntent: boolean;
}

const CREATE_KEYWORDS = ['스킬 만들', '스킬로 만들', '스킬로 저장', '스킬 추가'];
const PROGRESS_KEYWORDS = [
  '이대로',
  '진행',
  '평가해',
  '검증해',
  '검증해줘',
  '다시 검증',
  '평가 시작',
];
const SAVE_KEYWORDS = ['저장해', '저장하자', '저장해줘', '라이브러리에', '등록해'];
const DISCARD_KEYWORDS = ['취소', '폐기', '필요 없', '그만', '그만두', '버려'];

const matchAny = (text: string, keywords: string[]): boolean => {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
};

export function useSkillIntentDetection() {
  const detect = useCallback(
    (utterance: string, currentDraft: SkillDraft | null): SkillIntentResult => {
      const trimmed = utterance.trim();

      // 폐기 의도는 어느 상태에서든 우선 처리
      const isDiscardIntent =
        currentDraft !== null &&
        currentDraft.status !== 'SAVED' &&
        currentDraft.status !== 'DISCARDED' &&
        matchAny(trimmed, DISCARD_KEYWORDS);

      // 저장 의도는 EVAL_PASS 상태에서만 의미
      const isSaveIntent =
        currentDraft?.status === 'EVAL_PASS' &&
        matchAny(trimmed, SAVE_KEYWORDS);

      // 진행 의도는 CAPTURING (1차 진입) 또는 EVAL_FAIL→CAPTURING 후 (재검증)
      const isProgressIntent =
        currentDraft !== null &&
        currentDraft.status === 'CAPTURING' &&
        // 최소 4항목은 채워졌을 때만 진행 의미가 있음
        Object.values(currentDraft.usecase6).filter((v) => {
          if (Array.isArray(v)) return v.length > 0;
          return Boolean(v);
        }).length >= 4 &&
        matchAny(trimmed, PROGRESS_KEYWORDS);

      // 회복 의도는 EVAL_FAIL 상태에서만 의미 — 시나리오의 키워드 기반 매칭은
      // useScriptedSkillScenario 가 담당. 여기서는 단순히 "FAIL 상태이고
      // discard/save/progress 도 아니면 회복 후보" 로 표시.
      const isRecoveryIntent =
        currentDraft?.status === 'EVAL_FAIL' &&
        !isDiscardIntent &&
        !isSaveIntent &&
        trimmed.length > 0;

      // 새 생성 의도 — 활성 드래프트가 없을 때만
      const hasActiveDraft =
        currentDraft !== null &&
        currentDraft.status !== 'SAVED' &&
        currentDraft.status !== 'DISCARDED';

      let isCreateIntent = false;
      let scenarioId: string | undefined;

      if (!hasActiveDraft) {
        // "스킬" 키워드 + 시나리오 매칭
        const looksLikeCreate = matchAny(trimmed, CREATE_KEYWORDS);
        if (looksLikeCreate) {
          const scenario = findScenarioByUtterance(trimmed);
          if (scenario) {
            isCreateIntent = true;
            scenarioId = scenario.id;
          }
        }
      }

      return {
        isCreateIntent,
        scenarioId,
        isProgressIntent,
        isSaveIntent,
        isDiscardIntent,
        isRecoveryIntent,
      };
    },
    [],
  );

  return { detect };
}
