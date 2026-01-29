import React from 'react';
import { Check } from 'lucide-react';
import type { CoTStepIndicatorProps } from './types';

/**
 * CoT 진행 상태 표시기
 * - 진행 중: ●○○○ 형태의 도트 표시
 * - 완료: 체크마크 표시
 */
const CoTStepIndicator: React.FC<CoTStepIndicatorProps> = ({
  currentStep,
  totalSteps,
  isComplete,
}) => {
  if (isComplete) {
    return (
      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
        <Check size={14} className="text-green-600" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            index <= currentStep
              ? 'bg-[#FF3C42]'
              : 'bg-gray-300'
          } ${index === currentStep ? 'animate-pulse' : ''}`}
        />
      ))}
    </div>
  );
};

export default CoTStepIndicator;
