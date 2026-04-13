// ============================================================================
// SkillDraftInlineCard — 채팅 인라인 요약 카드
// ============================================================================
//
// 채팅 메시지 스트림에 끼어드는 작은 카드. 클릭 시 아티팩트 패널에서 해당
// 드래프트를 다시 연다.
//
// 표시 요소:
//   - 좌측 아이콘 (Sparkles)
//   - 상태 배지 ("새로 만드는 중", "평가 중", "평가 통과", "저장 완료", "폐기됨")
//   - 드래프트 이름
//   - 진행 단계 보조 텍스트
//   - 우측 화살표 (열기 CTA)
//
// terminal 상태(SAVED / DISCARDED)일 때는 회색 톤 + 클릭 동작은 유지.
// ============================================================================

import React from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import type { SkillDraft } from '@/types/skill-draft.types';
import { USECASE_6_KEYS } from '@/types/skill-draft.types';

// ============================================================================
// Props
// ============================================================================

export interface SkillDraftInlineCardProps {
  draft: SkillDraft;
  /** 카드 클릭 시 호출 (아티팩트 패널 열기) */
  onOpen: () => void;
}

// ============================================================================
// 상태별 라벨/색상
// ============================================================================

interface StatusVisual {
  badge: string;
  badgeClass: string;
  cardClass: string;
  iconClass: string;
}

const STATUS_VISUAL: Record<SkillDraft['status'], StatusVisual> = {
  CAPTURING: {
    badge: '새로 만드는 중',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    cardClass:
      'border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300',
    iconClass: 'text-blue-600',
  },
  EVALUATING: {
    badge: '자동 평가 중',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
    cardClass:
      'border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-300',
    iconClass: 'text-amber-600',
  },
  EVAL_PASS: {
    badge: '평가 통과',
    badgeClass: 'bg-green-100 text-green-700 border-green-200',
    cardClass:
      'border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-300',
    iconClass: 'text-green-600',
  },
  EVAL_FAIL: {
    badge: '평가 실패',
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
    cardClass: 'border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300',
    iconClass: 'text-red-600',
  },
  SAVED: {
    badge: '저장 완료',
    badgeClass: 'bg-gray-200 text-gray-700 border-gray-300',
    cardClass: 'border-gray-200 bg-white hover:bg-gray-50',
    iconClass: 'text-gray-500',
  },
  DISCARDED: {
    badge: '폐기됨',
    badgeClass: 'bg-gray-100 text-gray-500 border-gray-200',
    cardClass: 'border-gray-200 bg-gray-50 hover:bg-gray-100',
    iconClass: 'text-gray-400',
  },
};

// ============================================================================
// 진행 단계 텍스트
// ============================================================================

function describeProgress(draft: SkillDraft): string {
  switch (draft.status) {
    case 'CAPTURING': {
      const filled = USECASE_6_KEYS.filter((k) => {
        const v = draft.usecase6[k];
        if (Array.isArray(v)) return v.length > 0;
        return Boolean(v && String(v).trim());
      }).length;
      return `유스케이스 ${filled} / 6 캡처 중`;
    }
    case 'EVALUATING':
      return `자동 평가 ${draft.evalRuns.length} / 3 진행 중`;
    case 'EVAL_PASS':
      return '저장 준비 완료 — 채팅에 "저장해줘"';
    case 'EVAL_FAIL':
      return '수정 후 다시 평가 가능';
    case 'SAVED':
      return '스킬 라이브러리에 저장됨';
    case 'DISCARDED':
      return '드래프트가 폐기되었습니다';
    default:
      return '';
  }
}

// ============================================================================
// Component
// ============================================================================

export const SkillDraftInlineCard: React.FC<SkillDraftInlineCardProps> = ({
  draft,
  onOpen,
}) => {
  const visual = STATUS_VISUAL[draft.status];
  const isTerminal = draft.status === 'SAVED' || draft.status === 'DISCARDED';

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`w-full max-w-md text-left flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${visual.cardClass}`}
    >
      {/* 아이콘 */}
      <div
        className={`shrink-0 w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center ${visual.iconClass}`}
      >
        <Sparkles size={18} />
      </div>

      {/* 본문 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${visual.badgeClass}`}
          >
            {visual.badge}
          </span>
          <span
            className={`text-sm font-medium truncate ${
              isTerminal ? 'text-gray-600' : 'text-gray-900'
            }`}
          >
            {draft.draftName || '이름 미정 드래프트'}
          </span>
        </div>
        <div className="mt-0.5 text-xs text-gray-500 truncate">
          {describeProgress(draft)}
        </div>
      </div>

      {/* 우측 화살표 */}
      <ChevronRight
        size={16}
        className="shrink-0 text-gray-400"
      />
    </button>
  );
};

export default SkillDraftInlineCard;
