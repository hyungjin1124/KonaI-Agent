import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { ToolCallHeaderProps } from './types';

/**
 * 도구 호출 위젯 헤더 (Reasoning 스타일)
 * - Chevron 왼쪽 배치
 * - 텍스트에만 hover 효과
 * - 실행 중 shimmer-text 애니메이션
 */
const ToolCallHeader: React.FC<ToolCallHeaderProps> = ({
  toolType,
  status,
  isExpanded,
  onToggle,
  metadata,
}) => {
  // 상태에 따른 레이블 결정
  const getLabel = () => {
    switch (status) {
      case 'running':
        return metadata.labelRunning;
      case 'completed':
        return metadata.labelComplete;
      case 'awaiting-input':
        return metadata.label;
      default:
        return metadata.label;
    }
  };

  const isRunning = status === 'running' || status === 'awaiting-input';

  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1 w-full py-0.5 text-left text-xs group"
      aria-expanded={isExpanded}
    >
      {/* 펼침/접힘 아이콘 (좌측) */}
      <ChevronDown
        size={10}
        className={`
          text-gray-400 transition-transform duration-200 flex-shrink-0
          group-hover:text-gray-600
          ${isExpanded ? 'rotate-0' : '-rotate-90'}
        `}
      />

      {/* 도구명 (텍스트에만 hover + shimmer) */}
      <span
        className={`
          flex-1
          ${isRunning ? 'shimmer-text' : 'text-completed'}
        `}
      >
        {getLabel()}
      </span>
    </button>
  );
};

export default React.memo(ToolCallHeader);
