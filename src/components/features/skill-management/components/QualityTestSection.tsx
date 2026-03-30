'use client';

import React, { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, ChevronRight, Lightbulb } from 'lucide-react';
import type { SkillEvalResult, EvalTestPrompt, EvalExpectation } from '@/types/skill-management.types';

// ── Props ─────────────────────────────────────────────────────────────────────

interface QualityTestSectionProps {
  evalResult: SkillEvalResult;
}

// ── Expectation row ──────────────────────────────────────────────────────────

function ExpectationRow({ expectation }: { expectation: EvalExpectation }) {
  return (
    <div className="flex items-start gap-2 py-1">
      {expectation.passed ? (
        <CheckCircle2 size={13} className="text-green-500 shrink-0 mt-0.5" />
      ) : (
        <XCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
      )}
      <span className="text-xs xl:text-sm text-gray-700">
        <span className="font-medium">{expectation.label}</span>
        <span className="text-gray-400 mx-1.5">—</span>
        <span className="text-gray-500">&ldquo;{expectation.evidence}&rdquo;</span>
      </span>
    </div>
  );
}

// ── Failed evidence inline ───────────────────────────────────────────────────

function FailedEvidenceInline({ expectations }: { expectations: EvalExpectation[] }) {
  const failed = expectations.filter((e) => !e.passed);
  if (failed.length === 0) return null;

  return (
    <div className="mt-1 space-y-0.5">
      {failed.map((e) => (
        <div key={e.id} className="flex items-start gap-1.5 pl-6">
          <span className="text-gray-400 shrink-0 text-xs xl:text-sm">→</span>
          <span className="text-xs xl:text-sm text-gray-500">
            <span className="font-medium text-gray-600">{e.label}</span>
            <span className="text-gray-300 mx-1">:</span>
            {e.evidence}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Test prompt item ─────────────────────────────────────────────────────────

interface TestPromptItemProps {
  prompt: EvalTestPrompt;
  isExpanded: boolean;
  onToggle: () => void;
}

function TestPromptItem({ prompt, isExpanded, onToggle }: TestPromptItemProps) {
  return (
    <div className="group">
      {/* Prompt row */}
      <div className="flex items-start gap-2">
        {/* Status icon */}
        {prompt.passed ? (
          <CheckCircle2 size={15} className="text-green-500 shrink-0 mt-0.5" />
        ) : (
          <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
        )}

        {/* Prompt text */}
        <span className="text-xs xl:text-sm text-gray-700 flex-1 min-w-0 leading-relaxed">
          &ldquo;{prompt.prompt}&rdquo;
        </span>

        {/* Toggle button */}
        <button
          onClick={onToggle}
          className="shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] xl:text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label={isExpanded ? '검증 상세 접기' : '검증 상세 펼치기'}
        >
          <ChevronRight
            size={11}
            className={[
              'transition-transform duration-200',
              isExpanded ? 'rotate-90' : '',
            ].join(' ')}
          />
          검증
        </button>
      </div>

      {/* Failed evidence inline (always visible for failed prompts) */}
      {!prompt.passed && !isExpanded && (
        <FailedEvidenceInline expectations={prompt.expectations} />
      )}

      {/* Expanded expectations detail */}
      {isExpanded && (
        <div className="mt-1.5 ml-1 pl-5 border-l border-gray-100 space-y-0">
          {prompt.expectations.map((exp) => (
            <ExpectationRow key={exp.id} expectation={exp} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Analysis note block ──────────────────────────────────────────────────────

function AnalysisNoteBlock({ note }: { note: string }) {
  return (
    <div className="rounded-md bg-amber-50/60 border-l-2 border-amber-300 pl-3 pr-3 py-2.5 mt-3">
      <div className="flex items-start gap-2">
        <Lightbulb size={13} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="text-[10px] xl:text-xs font-semibold text-amber-600 tracking-wide">
            참고
          </span>
          <p className="text-xs xl:text-sm text-gray-600 leading-relaxed mt-0.5">
            {note}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function QualityTestSection({ evalResult }: QualityTestSectionProps) {
  const [expandedPrompts, setExpandedPrompts] = useState<Set<number>>(new Set());

  const togglePrompt = useCallback((index: number) => {
    setExpandedPrompts((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const passedCount = evalResult.testPrompts.filter((p) => p.passed).length;
  const totalCount = evalResult.testPrompts.length;

  return (
    <div className="space-y-3 py-2">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs xl:text-sm font-semibold text-gray-400 uppercase tracking-wider">
          품질 테스트
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={[
              'text-[10px] xl:text-xs font-bold px-1.5 py-0.5 rounded-full',
              evalResult.qualityStatus === 'verified'
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-500',
            ].join(' ')}
          >
            {passedCount}/{totalCount} 통과
          </span>
          <span className="text-[11px] xl:text-xs text-gray-400">
            {evalResult.evaluatedAt} 검증
          </span>
        </div>
      </div>

      {/* Test prompt list */}
      <div className="space-y-2.5">
        {evalResult.testPrompts.map((prompt, index) => (
          <TestPromptItem
            key={index}
            prompt={prompt}
            isExpanded={expandedPrompts.has(index)}
            onToggle={() => togglePrompt(index)}
          />
        ))}
      </div>

      {/* Analysis note (conditional) */}
      {evalResult.analysisNote && (
        <AnalysisNoteBlock note={evalResult.analysisNote} />
      )}
    </div>
  );
}
