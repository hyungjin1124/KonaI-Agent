import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export type CreationStep = 'intent' | 'interview' | 'draft' | 'test' | 'complete';

const STEPS: { id: CreationStep; label: string }[] = [
  { id: 'intent', label: '목표 설정' },
  { id: 'interview', label: '상세 인터뷰' },
  { id: 'draft', label: '초안 생성' },
  { id: 'test', label: '테스트' },
  { id: 'complete', label: '완료' },
];

interface SkillCreationStepperProps {
  currentStep: CreationStep;
}

const SkillCreationStepper: React.FC<SkillCreationStepperProps> = ({ currentStep }) => {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-1.5">
              {isDone ? (
                <CheckCircle2 size={16} className="text-green-500 shrink-0" />
              ) : (
                <div
                  className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {i + 1}
                </div>
              )}
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  isCurrent ? 'text-gray-900' : isDone ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-6 h-px ${
                  i < currentIndex ? 'bg-green-300' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default SkillCreationStepper;
