import React from 'react';
import { ChevronDown } from 'lucide-react';
import ToolCallStatusIndicator from './ToolCallStatusIndicator';
import type { ToolCallHeaderProps } from './types';

/**
 * 도구 호출 위젯 헤더
 * - 아이콘 + 도구명 + 상태 표시
 * - 클릭 시 펼치기/접기
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
        return `${metadata.label} (입력 대기)`;
      default:
        return metadata.label;
    }
  };

  // HITL 도구인 경우 강조 스타일
  const isHitl = status === 'awaiting-input';
  const borderClass = isHitl
    ? 'border-amber-300 bg-amber-50'
    : `${metadata.borderColor} ${metadata.bgColor}`;

  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center gap-2 w-full px-3 py-2 rounded-lg border
        transition-all duration-200 text-left group
        hover:shadow-sm
        ${borderClass}
      `}
      aria-expanded={isExpanded}
    >
      {/* 상태 표시기 */}
      <ToolCallStatusIndicator status={status} color={metadata.color} />

      {/* 도구명/상태 텍스트 */}
      <span className={`flex-1 text-sm font-medium ${metadata.color}`}>
        {getLabel()}
      </span>

      {/* 펼침/접힘 아이콘 */}
      <ChevronDown
        size={16}
        className={`
          text-gray-400 transition-transform duration-300
          group-hover:text-gray-600
          ${isExpanded ? 'rotate-180' : ''}
        `}
      />
    </button>
  );
};

export default React.memo(ToolCallHeader);
