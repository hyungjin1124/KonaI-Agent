import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Hash } from 'lucide-react';
import type { EvalResult } from '@/types/skill-management.types';
import EvalQualityBadge from './EvalQualityBadge';
import FormalGradesAccordion from './FormalGradesAccordion';

interface OutputsTabProps {
  evalResults: EvalResult[];
}

const OutputsTab: React.FC<OutputsTabProps> = ({ evalResults }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  if (evalResults.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 text-sm">
        평가 결과가 없습니다.
      </div>
    );
  }

  const current = evalResults[currentIdx];
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < evalResults.length - 1;

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            disabled={!hasPrev}
            onClick={() => setCurrentIdx((i) => i - 1)}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="이전 평가"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-bold text-gray-700">
            {currentIdx + 1} / {evalResults.length}
          </span>
          <button
            disabled={!hasNext}
            onClick={() => setCurrentIdx((i) => i + 1)}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="다음 평가"
          >
            <ChevronRight size={14} />
          </button>
        </div>
        <span className="text-xs text-gray-500 font-medium truncate max-w-[200px]">
          {current.evalName}
        </span>
      </div>

      {/* Prompt */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">프롬프트</p>
        <p className="text-sm text-gray-800 leading-relaxed">{current.prompt}</p>
      </div>

      {/* With/Without comparison */}
      <div className="grid grid-cols-2 gap-3">
        {/* With Skill */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3">
          <p className="text-xs font-bold text-blue-700 mb-2">With Skill</p>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">통과율</span>
              <EvalQualityBadge passRate={current.withSkill.passRate} size="sm" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock size={11} />
              {current.withSkill.timeSeconds.toFixed(1)}s
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Hash size={11} />
              {current.withSkill.tokens} tokens
            </div>
          </div>
        </div>

        {/* Without Skill */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs font-bold text-gray-500 mb-2">Without Skill</p>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">통과율</span>
              <EvalQualityBadge passRate={current.withoutSkill.passRate} size="sm" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock size={11} />
              {current.withoutSkill.timeSeconds.toFixed(1)}s
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Hash size={11} />
              {current.withoutSkill.tokens} tokens
            </div>
          </div>
        </div>
      </div>

      {/* Formal Grades */}
      <FormalGradesAccordion
        assertions={current.withSkill.assertions}
        label="With Skill 등급"
      />
      <FormalGradesAccordion
        assertions={current.withoutSkill.assertions}
        label="Without Skill 등급"
      />
    </div>
  );
};

export default OutputsTab;
