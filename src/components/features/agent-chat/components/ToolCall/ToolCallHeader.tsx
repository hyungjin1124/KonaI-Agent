import React from 'react';
import { ChevronDown } from 'lucide-react';
import ToolCallStatusIndicator from './ToolCallStatusIndicator';
import type { ToolCallHeaderProps } from './types';

/**
 * 도구 호출 위젯 헤더 (Claude Chat 스타일)
 * - 아이콘 + 도구명 + 상태 표시
 * - 상태별 배경색/테두리 스타일
 * - 클릭 시 펼치기/접기 (아코디언)
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

  // HITL 도구인지 확인
  const isHitl = status === 'awaiting-input';

  // Claude Chat 스타일 - 상태별 배경색/테두리
  const getStatusStyles = () => {
    switch (status) {
      case 'running':
        return 'bg-blue-50 border-blue-100 hover:bg-blue-100/80';
      case 'completed':
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
      case 'awaiting-input':
        return 'bg-amber-50 border-amber-200 hover:bg-amber-100/80';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  // 상태별 텍스트 색상
  const getTextColor = () => {
    switch (status) {
      case 'running':
        return 'text-blue-700';
      case 'completed':
        return 'text-gray-600';
      case 'awaiting-input':
        return 'text-amber-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border
        transition-all duration-200 text-left group
        ${getStatusStyles()}
      `}
      aria-expanded={isExpanded}
    >
      {/* 상태 표시기 */}
      <ToolCallStatusIndicator status={status} color={metadata.color} />

      {/* 도구명/상태 텍스트 */}
      <span className={`flex-1 text-sm font-medium ${getTextColor()}`}>
        {getLabel()}
      </span>

      {/* 완료 시 "완료됨" 표시 */}
      {status === 'completed' && (
        <span className="text-xs text-gray-400">완료됨</span>
      )}

      {/* 펼침/접힘 아이콘 */}
      <ChevronDown
        size={16}
        className={`
          text-gray-400 transition-transform duration-200
          group-hover:text-gray-600
          ${isExpanded ? 'rotate-180' : ''}
        `}
      />
    </button>
  );
};

export default React.memo(ToolCallHeader);
