import React from 'react';
import { Loader2, Check, AlertCircle, CircleDot, Circle } from 'lucide-react';
import type { ToolCallStatusIndicatorProps } from './types';

/**
 * 도구 호출 상태 아이콘 표시기
 * - pending: 빈 원
 * - running: 스피너 (회전 애니메이션)
 * - completed: 체크 아이콘
 * - failed: 에러 아이콘
 * - awaiting-input: 점이 있는 원 (pulse 애니메이션)
 */
const ToolCallStatusIndicator: React.FC<ToolCallStatusIndicatorProps> = ({
  status,
  size = 12,
}) => {
  switch (status) {
    case 'running':
      return (
        <Loader2
          size={size}
          className="text-blue-500 animate-spin flex-shrink-0"
          aria-label="실행 중"
        />
      );
    case 'completed':
      return (
        <Check
          size={size}
          className="text-green-500 flex-shrink-0"
          aria-label="완료"
        />
      );
    case 'failed':
      return (
        <AlertCircle
          size={size}
          className="text-red-500 flex-shrink-0"
          aria-label="실패"
        />
      );
    case 'awaiting-input':
      return (
        <CircleDot
          size={size}
          className="text-amber-500 animate-pulse flex-shrink-0"
          aria-label="입력 대기"
        />
      );
    case 'pending':
    default:
      return (
        <Circle
          size={size}
          className="text-gray-300 flex-shrink-0"
          aria-label="대기"
        />
      );
  }
};

export default React.memo(ToolCallStatusIndicator);
