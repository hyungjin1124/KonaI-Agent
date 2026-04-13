// ============================================================================
// SkillDraftRenderer — 아티팩트 패널 read-only 렌더러
// ============================================================================
//
// IA §4.2 패널 구조에 따라 §A~§E 5개 섹션을 표시한다.
//
//   §A 유스케이스 6항목
//   §B 데이터 권한 (A/C/D)
//   §C Coexistence (근접 스킬 + 사용자 결정)
//   §D 자동 평가 결과 (회차별 PASS/FAIL)
//   §E 액션 바 (저장 / 폐기)
//
// 모든 입력은 채팅 발화를 통해 들어오므로 이 컴포넌트는 표시 + 액션 버튼만 담당.
// ============================================================================

import React from 'react';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  XCircle,
  Sparkles,
  Trash2,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import type {
  SkillDraft,
  DataPermissionResult,
  CoexistenceCheckResult,
  EvalRun,
} from '@/types/skill-draft.types';
import { USECASE_6_KEYS, USECASE_6_LABELS } from '@/types/skill-draft.types';

// ============================================================================
// Props
// ============================================================================

export interface SkillDraftRendererProps {
  draft: SkillDraft;
  /** EVAL_PASS 상태에서 [저장] 클릭 */
  onSave: () => void;
  /** 어느 상태에서든 [폐기] 클릭 */
  onDiscard: () => void;
}

// ============================================================================
// 상태 배지
// ============================================================================

const STATUS_LABEL: Record<SkillDraft['status'], string> = {
  CAPTURING: '유스케이스 캡처 중',
  EVALUATING: '자동 평가 중',
  EVAL_PASS: '평가 통과',
  EVAL_FAIL: '평가 실패',
  SAVED: '저장 완료',
  DISCARDED: '폐기됨',
};

const STATUS_COLOR: Record<SkillDraft['status'], string> = {
  CAPTURING: 'bg-blue-100 text-blue-700 border-blue-200',
  EVALUATING: 'bg-amber-100 text-amber-700 border-amber-200',
  EVAL_PASS: 'bg-green-100 text-green-700 border-green-200',
  EVAL_FAIL: 'bg-red-100 text-red-700 border-red-200',
  SAVED: 'bg-gray-100 text-gray-700 border-gray-200',
  DISCARDED: 'bg-gray-100 text-gray-500 border-gray-200',
};

// ============================================================================
// Sub-components
// ============================================================================

function SectionHeader({
  index,
  title,
  hint,
}: {
  index: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline gap-2 mb-2">
      <span className="text-xs font-mono text-gray-400">§{index}</span>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </div>
  );
}

// --- §A 유스케이스 6항목 ---

function Usecase6Section({ draft }: { draft: SkillDraft }) {
  const filledCount = USECASE_6_KEYS.filter((k) => {
    const v = draft.usecase6[k];
    if (Array.isArray(v)) return v.length > 0;
    return Boolean(v && String(v).trim());
  }).length;

  const isCapturing = draft.status === 'CAPTURING';

  return (
    <section className="px-4 py-4 border-b border-gray-100">
      <SectionHeader
        index="A"
        title="유스케이스 6항목"
        hint={`${filledCount} / 6`}
      />
      <ul className="space-y-2 mt-3">
        {USECASE_6_KEYS.map((key) => {
          const value = draft.usecase6[key];
          const isFilled = Array.isArray(value)
            ? value.length > 0
            : Boolean(value && String(value).trim());
          const displayValue = Array.isArray(value)
            ? value.join(', ')
            : (value as string | undefined) ?? '';

          return (
            <li key={key} className="flex items-start gap-2 text-sm">
              {isFilled ? (
                <CheckCircle2
                  size={16}
                  className="text-green-600 mt-0.5 shrink-0"
                />
              ) : (
                <Circle size={16} className="text-gray-300 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-500">
                  {USECASE_6_LABELS[key]}
                </div>
                <div
                  className={
                    isFilled
                      ? 'text-gray-900 break-words'
                      : 'text-gray-400 italic'
                  }
                >
                  {isFilled ? displayValue : isCapturing ? '응답 대기 중' : '—'}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// --- §B 데이터 권한 ---

function DataPermissionSection({
  permission,
}: {
  permission: DataPermissionResult | null;
}) {
  if (!permission) {
    return (
      <section className="px-4 py-4 border-b border-gray-100">
        <SectionHeader index="B" title="데이터 권한" />
        <div className="text-sm text-gray-400 italic">
          6항목 캡처 후 자동으로 판정합니다.
        </div>
      </section>
    );
  }

  const verdictMeta: Record<
    DataPermissionResult['verdict'],
    { label: string; color: string; icon: React.ReactNode }
  > = {
    A_FULL_PASS: {
      label: 'A · 전량 통과',
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: <ShieldCheck size={16} className="text-green-600" />,
    },
    C_SCOPE_REDUCED: {
      label: 'C · 범위 축소 후 진행',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <AlertTriangle size={16} className="text-amber-600" />,
    },
    D_INFEASIBLE: {
      label: 'D · 성립 불가',
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: <XCircle size={16} className="text-red-600" />,
    },
  };

  const meta = verdictMeta[permission.verdict];

  return (
    <section className="px-4 py-4 border-b border-gray-100">
      <SectionHeader index="B" title="데이터 권한" />
      <div
        className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-sm ${meta.color}`}
      >
        <span className="mt-0.5">{meta.icon}</span>
        <div className="flex-1">
          <div className="font-medium">{meta.label}</div>
          {permission.scopeReductionNote && (
            <div className="mt-1 text-xs text-amber-800">
              {permission.scopeReductionNote}
            </div>
          )}
          {permission.infeasibilityReason && (
            <div className="mt-1 text-xs text-red-800">
              {permission.infeasibilityReason}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// --- §C Coexistence Check ---

function CoexistenceSection({
  coexistence,
}: {
  coexistence: CoexistenceCheckResult | null;
}) {
  if (!coexistence) {
    return (
      <section className="px-4 py-4 border-b border-gray-100">
        <SectionHeader index="C" title="유사 스킬 점검" />
        <div className="text-sm text-gray-400 italic">
          6항목 캡처 후 자동으로 검사합니다.
        </div>
      </section>
    );
  }

  const decisionLabel: Record<NonNullable<typeof coexistence.userDecision>, string> = {
    NEW: '새 스킬로 만들기',
    INHERIT_ROLE: '기존 스킬 역할 이어받기',
    MERGE: '기존 스킬에 합치기',
  };

  return (
    <section className="px-4 py-4 border-b border-gray-100">
      <SectionHeader index="C" title="유사 스킬 점검" />
      {coexistence.neighbors.length === 0 ? (
        <div className="text-sm text-gray-700">
          유사한 스킬이 없습니다. 새로 만들어도 충돌이 없어요.
        </div>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {coexistence.neighbors.map((n) => (
            <li
              key={n.skillId}
              className="flex items-center justify-between px-3 py-1.5 rounded border border-gray-200 bg-gray-50"
            >
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate">{n.name}</div>
                <div className="text-xs text-gray-500">{n.author}</div>
              </div>
              <span className="text-xs font-mono text-gray-500 shrink-0 ml-2">
                {Math.round(n.similarityScore * 100)}%
              </span>
            </li>
          ))}
        </ul>
      )}
      {coexistence.userDecision && (
        <div className="mt-2 text-xs text-gray-600">
          결정:{' '}
          <span className="font-medium text-gray-800">
            {decisionLabel[coexistence.userDecision]}
          </span>
          {coexistence.autoCopyFallback && ' · 자동 복사 폴백'}
        </div>
      )}
    </section>
  );
}

// --- §D 자동 평가 ---

function EvalRunsSection({
  evalRuns,
  status,
}: {
  evalRuns: EvalRun[];
  status: SkillDraft['status'];
}) {
  const isEvaluating = status === 'EVALUATING';
  const totalRuns = 3;

  return (
    <section className="px-4 py-4 border-b border-gray-100">
      <SectionHeader
        index="D"
        title="자동 평가"
        hint={
          evalRuns.length > 0 ? `${evalRuns.length} / ${totalRuns}` : undefined
        }
      />
      {evalRuns.length === 0 && !isEvaluating && (
        <div className="text-sm text-gray-400 italic">
          준비가 되면 채팅에 "이대로 진행해줘"라고 말씀해주세요.
        </div>
      )}
      {evalRuns.length === 0 && isEvaluating && (
        <div className="flex items-center gap-2 text-sm text-amber-700">
          <Loader2 size={14} className="animate-spin" />
          평가 준비 중...
        </div>
      )}

      <div className="space-y-2">
        {evalRuns.map((run) => {
          const isPass = run.graderVerdict === 'PASS';
          return (
            <div
              key={run.runIndex}
              className={`px-3 py-2 rounded-lg border text-sm ${
                isPass
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs ${
                    isPass
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {run.runIndex}
                </span>
                <span
                  className={isPass ? 'text-green-800' : 'text-red-800'}
                >
                  {isPass ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-700">
                {run.executorOutput}
              </div>
              <div
                className={`mt-1 text-xs ${
                  isPass ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {run.graderRationale}
              </div>
            </div>
          );
        })}

        {isEvaluating && evalRuns.length < totalRuns && (
          <div className="px-3 py-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 text-sm flex items-center gap-2 text-amber-700">
            <Loader2 size={14} className="animate-spin" />
            회차 {evalRuns.length + 1} 진행 중...
          </div>
        )}
      </div>
    </section>
  );
}

// --- §E 액션 바 ---

function ActionBar({
  draft,
  onSave,
  onDiscard,
}: {
  draft: SkillDraft;
  onSave: () => void;
  onDiscard: () => void;
}) {
  const canSave = draft.status === 'EVAL_PASS';
  const isTerminal = draft.status === 'SAVED' || draft.status === 'DISCARDED';

  return (
    <section className="px-4 py-3 bg-gray-50">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canSave}
          onClick={onSave}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            canSave
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Sparkles size={14} />
          스킬 라이브러리에 저장
        </button>
        <button
          type="button"
          disabled={isTerminal}
          onClick={onDiscard}
          className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
            isTerminal
              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-white'
          }`}
        >
          <Trash2 size={14} />
          폐기
        </button>
      </div>
      {!canSave && !isTerminal && (
        <div className="mt-2 text-xs text-gray-500">
          [저장]은 자동 평가가 모두 통과해야 활성화됩니다.
        </div>
      )}
    </section>
  );
}

// ============================================================================
// Main Renderer
// ============================================================================

export const SkillDraftRenderer: React.FC<SkillDraftRendererProps> = ({
  draft,
  onSave,
  onDiscard,
}) => {
  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs text-gray-500">스킬 드래프트</div>
            <h2 className="text-base font-semibold text-gray-900 truncate">
              {draft.draftName || '이름 미정'}
            </h2>
          </div>
          <span
            className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLOR[draft.status]}`}
          >
            {STATUS_LABEL[draft.status]}
          </span>
        </div>
        {draft.originSkillId && (
          <div className="mt-1.5 text-xs text-gray-500">
            편집 모드 · 원본 {draft.originVersion}
          </div>
        )}
      </div>

      {/* §A~§D 본문 — 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto">
        <Usecase6Section draft={draft} />
        <DataPermissionSection permission={draft.dataPermission} />
        <CoexistenceSection coexistence={draft.coexistence} />
        <EvalRunsSection evalRuns={draft.evalRuns} status={draft.status} />
      </div>

      {/* §E 액션 바 — 하단 고정 */}
      <div className="border-t border-gray-200 shrink-0">
        <ActionBar draft={draft} onSave={onSave} onDiscard={onDiscard} />
      </div>
    </div>
  );
};

export default SkillDraftRenderer;
