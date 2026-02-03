import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { ToolCallGroupHeaderProps } from './types';

/**
 * Tool 그룹 외부 아코디언 헤더 (텍스트 스타일)
 * - 호버시 배경 효과 및 화살표 표시
 * - 실행 중 애니메이션 적용
 */
const ToolCallGroupHeader: React.FC<ToolCallGroupHeaderProps> = ({
  label,
  completedCount,
  totalCount,
  isComplete,
  isRunning,
  isExpanded,
  onToggle,
}) => {
  // 상태에 따른 라벨
  const getLabel = () => {
    if (isComplete) {
      return label ? `${label} 완료` : `${totalCount}개 도구 사용됨`;
    }
    if (isRunning) {
      return label
        ? `${label} (${completedCount}/${totalCount})`
        : `작업 진행 중 (${completedCount}/${totalCount})`;
    }
    return label || '도구 호출 대기 중';
  };

  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center gap-1.5 w-full py-1
        transition-all duration-200 text-left group
        text-xs text-muted-foreground
        hover:text-foreground hover:bg-muted/50 rounded px-1 -mx-1
      `}
      aria-expanded={isExpanded}
    >
      {/* 라벨 (실행 중이면 애니메이션) */}
      <span className={`flex-1 ${isRunning ? 'animate-pulse' : ''}`}>
        {getLabel()}
      </span>

      {/* 펼침/접힘 아이콘 (우측) */}
      <ChevronRight
        size={12}
        className={`
          opacity-0 group-hover:opacity-100
          text-gray-400 transition-all duration-200
          ${isExpanded ? 'rotate-90' : ''}
        `}
      />
    </button>
  );
};

export default React.memo(ToolCallGroupHeader);
