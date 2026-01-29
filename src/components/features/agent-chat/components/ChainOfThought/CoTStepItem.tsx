import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import StreamingText from '../../../../shared/StreamingText';
import type { CoTStepItemProps } from './types';

/**
 * CoT 개별 단계 아이템
 * - 아이콘 + 라벨 + 상세 메시지 표시
 * - 상태별 스타일 적용 (active: 파란색, complete: 초록색, pending: 회색)
 */
const CoTStepItem: React.FC<CoTStepItemProps> = ({
  step,
  stepIndex,
  isActive,
  isComplete,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={`flex items-start gap-3 py-3 ${
        stepIndex > 0 ? 'border-t border-gray-100' : ''
      }`}
    >
      {/* 단계 아이콘 */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 transition-colors duration-300 ${
          isComplete
            ? 'bg-green-100'
            : isActive
            ? 'bg-blue-100 animate-pulse'
            : 'bg-gray-100'
        }`}
      >
        {isComplete ? (
          <Check size={16} className="text-green-600" />
        ) : (
          <span>{step.icon}</span>
        )}
      </div>

      {/* 단계 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`font-medium text-sm transition-colors duration-300 ${
              isComplete
                ? 'text-green-700'
                : isActive
                ? 'text-blue-700'
                : 'text-gray-500'
            }`}
          >
            {isComplete ? step.labelComplete : step.label}
          </span>
          {isActive && !isComplete && (
            <Loader2 size={14} className="animate-spin text-blue-500" />
          )}
        </div>

        {/* 상세 메시지 (활성 상태일 때만 스트리밍) */}
        {isActive && !isComplete && (
          <div className="mt-2 space-y-1">
            {step.detailMessages.map((msg, i) => (
              <StreamingText
                key={i}
                content={msg}
                as="p"
                className="text-xs text-gray-500"
                typingSpeed={15}
                startDelay={i * 400}
                showCursor={i === step.detailMessages.length - 1}
                cursorColor="bg-blue-400"
                cursorHeight="h-3"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoTStepItem;
