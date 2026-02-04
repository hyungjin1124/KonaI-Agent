import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { ToolCallGroupHeaderProps } from './types';

/**
 * Tool 그룹 외부 아코디언 헤더 (Reasoning 스타일)
 * - Chevron 왼쪽 배치
 * - 텍스트에만 hover 효과
 * - 실행 중 shimmer-text 애니메이션 (텍스트 자체가 반짝임)
 */
const ToolCallGroupHeader: React.FC<ToolCallGroupHeaderProps> = ({
  label,
  completedCount,
  totalCount,
  isComplete,
  isRunning,
  isExpanded,
  onToggle,
  activeToolLabel,
}) => {
  // 상태에 따른 라벨 (숫자 제거)
  const getLabel = () => {
    if (isComplete) {
      return label ? `${label} 완료` : `${totalCount}개 도구 사용됨`;
    }
    if (isRunning) {
      return activeToolLabel || label || '작업 진행 중';
    }
    return label || '도구 호출 대기 중';
  };

  const displayLabel = getLabel();

  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 w-full py-1 text-left text-xs group"
      aria-expanded={isExpanded}
    >
      {/* 펼침/접힘 아이콘 (좌측) */}
      <ChevronDown
        size={12}
        className={`
          text-gray-400 transition-transform duration-200 flex-shrink-0
          group-hover:text-gray-600
          ${isExpanded ? 'rotate-0' : '-rotate-90'}
        `}
      />

      {/* 라벨 + Shimmer 효과 (텍스트에만 hover) */}
      <span
        key={displayLabel}
        className={`
          flex-1
          ${isRunning ? 'shimmer-text-fade' : 'text-completed'}
        `}
      >
        {displayLabel}
      </span>
    </button>
  );
};

export default React.memo(ToolCallGroupHeader);
