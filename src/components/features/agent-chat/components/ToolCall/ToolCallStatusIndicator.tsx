import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import type { ToolCallStatusIndicatorProps } from './types';

/**
 * 도구 호출 상태 표시기
 * - pending: 회색 원
 * - running: 회전 애니메이션
 * - completed: 체크마크
 * - awaiting-input: 깜빡이는 원 (HITL)
 */
const ToolCallStatusIndicator: React.FC<ToolCallStatusIndicatorProps> = ({
  status,
  color = 'text-gray-400',
}) => {
  switch (status) {
    case 'completed':
      return (
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <Check size={12} className="text-white" strokeWidth={3} />
        </div>
      );

    case 'running':
      return (
        <div className={`w-5 h-5 flex items-center justify-center ${color}`}>
          <Loader2 size={16} className="animate-spin" />
        </div>
      );

    case 'awaiting-input':
      return (
        <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center animate-pulse">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
        </div>
      );

    case 'pending':
    default:
      return (
        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-gray-300" />
        </div>
      );
  }
};

export default React.memo(ToolCallStatusIndicator);
