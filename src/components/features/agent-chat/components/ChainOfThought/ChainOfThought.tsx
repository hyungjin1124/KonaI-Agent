import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import CoTStepIndicator from './CoTStepIndicator';
import CoTStepItem from './CoTStepItem';
import { COT_STEPS, DEFAULT_STEP_DURATION } from './constants';
import type { ChainOfThoughtProps } from './types';

/**
 * Chain of Thought 메인 컴포넌트
 * - 접히는 섹션(Collapsible) 형태
 * - 4단계 자동 진행 (분석 → 검색 → 추론 → 생성)
 * - 완료 시 onComplete 콜백 호출
 */
const ChainOfThought: React.FC<ChainOfThoughtProps> = ({
  isActive,
  onComplete,
  stepDuration = DEFAULT_STEP_DURATION,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isAllComplete, setIsAllComplete] = useState(false);

  // 단계 자동 진행 로직
  useEffect(() => {
    if (!isActive || isAllComplete) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = prev + 1;

        // 현재 단계 완료 처리
        setCompletedSteps((s) => new Set(s).add(prev));

        // 마지막 단계 완료
        if (nextStep >= COT_STEPS.length) {
          setIsAllComplete(true);
          clearInterval(timer);
          return prev;
        }

        return nextStep;
      });
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isActive, stepDuration, isAllComplete]);

  // 모든 단계 완료 시 콜백 호출
  useEffect(() => {
    if (isAllComplete && onComplete) {
      // 마지막 단계 애니메이션 후 콜백 호출
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAllComplete, onComplete]);

  // 펼치기/접기 토글
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  if (!isActive) return null;

  return (
    <div className="mb-4 animate-fade-in-up">
      {/* Collapsible 헤더 */}
      <button
        onClick={toggleExpanded}
        className="flex items-center gap-3 w-full p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-left"
        aria-expanded={isExpanded}
        aria-controls="cot-details"
      >
        {/* 진행 상태 표시기 */}
        <CoTStepIndicator
          currentStep={currentStep}
          totalSteps={COT_STEPS.length}
          isComplete={isAllComplete}
        />

        {/* 요약 텍스트 */}
        <span className="flex-1 text-sm text-gray-600">
          {isAllComplete
            ? '사고 과정 완료'
            : `${COT_STEPS[currentStep].label}... (${currentStep + 1}/${COT_STEPS.length})`}
        </span>

        {/* 펼침/접힘 아이콘 */}
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expandable 상세 섹션 */}
      {isExpanded && (
        <div
          id="cot-details"
          className="mt-2 p-4 bg-white border border-gray-200 rounded-lg animate-fade-in-up"
          aria-live="polite"
        >
          {COT_STEPS.map((step, index) => (
            <CoTStepItem
              key={step.id}
              step={step}
              stepIndex={index}
              isActive={currentStep === index && !isAllComplete}
              isComplete={completedSteps.has(index) || isAllComplete}
              isVisible={index <= currentStep || isAllComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChainOfThought;
