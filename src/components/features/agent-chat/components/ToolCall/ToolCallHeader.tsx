import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { ToolCallHeaderProps } from './types';

/**
 * 도구 호출 위젯 헤더 (텍스트 스타일)
 * - 도구명 + 화살표
 * - 클릭 시 펼치기/접기 (아코디언)
 * - 실행 중 상태에 애니메이션 적용
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
      className={`
        flex items-center gap-1 w-full py-0.5
        transition-all duration-200 text-left group
        text-xs text-muted-foreground
        hover:text-foreground hover:bg-muted/50 rounded px-1 -mx-1
      `}
      aria-expanded={isExpanded}
    >
      {/* 도구명 (실행 중이면 애니메이션) */}
      <span className={`flex-1 ${isRunning ? 'animate-pulse' : ''}`}>
        {getLabel()}
      </span>

      {/* 펼침/접힘 아이콘 (우측) */}
      <ChevronRight
        size={10}
        className={`
          opacity-0 group-hover:opacity-100
          text-gray-400 transition-all duration-200
          ${isExpanded ? 'rotate-90' : ''}
        `}
      />
    </button>
  );
};

export default React.memo(ToolCallHeader);
