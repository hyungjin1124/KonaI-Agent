import React from 'react';
import { ChevronDown, Loader2, Check, Wrench } from 'lucide-react';
import type { ToolCallGroupHeaderProps } from './types';

/**
 * Tool 그룹 외부 아코디언 헤더 (Claude Chat 스타일)
 * - 진행 중: "작업 진행 중... (3/10)"
 * - 완료: "10개의 도구 사용됨"
 */
const ToolCallGroupHeader: React.FC<ToolCallGroupHeaderProps> = ({
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
      return `${totalCount}개의 도구 사용됨`;
    }
    if (isRunning) {
      return `작업 진행 중... (${completedCount}/${totalCount})`;
    }
    return '도구 호출 대기 중';
  };

  // 상태에 따른 아이콘
  const StatusIcon = () => {
    if (isComplete) {
      return (
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <Check size={12} className="text-white" strokeWidth={3} />
        </div>
      );
    }
    if (isRunning) {
      return (
        <div className="w-5 h-5 flex items-center justify-center text-blue-500">
          <Loader2 size={16} className="animate-spin" />
        </div>
      );
    }
    return (
      <div className="w-5 h-5 flex items-center justify-center text-gray-400">
        <Wrench size={16} />
      </div>
    );
  };

  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl
        transition-all duration-200 text-left group
        ${isComplete
          ? 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
          : isRunning
            ? 'bg-blue-50 border border-blue-200'
            : 'bg-gray-50 border border-gray-200'
        }
      `}
      aria-expanded={isExpanded}
    >
      {/* 상태 아이콘 */}
      <StatusIcon />

      {/* 라벨 */}
      <span className={`
        flex-1 text-sm font-medium
        ${isComplete ? 'text-gray-700' : isRunning ? 'text-blue-700' : 'text-gray-600'}
      `}>
        {getLabel()}
      </span>

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

export default React.memo(ToolCallGroupHeader);
