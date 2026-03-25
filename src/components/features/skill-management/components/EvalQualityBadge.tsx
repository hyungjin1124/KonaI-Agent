import React from 'react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

interface EvalQualityBadgeProps {
  passRate: number | null;
  stdDev?: number | null;
  size?: 'sm' | 'md';
}

const EvalQualityBadge: React.FC<EvalQualityBadgeProps> = ({
  passRate,
  stdDev,
  size = 'sm',
}) => {
  if (passRate === null) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center rounded-full font-medium bg-gray-100 text-gray-500 ${
              size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
            }`}
          >
            미검증
          </span>
        </TooltipTrigger>
        <TooltipContent>아직 평가가 실행되지 않았습니다</TooltipContent>
      </Tooltip>
    );
  }

  const pct = Math.round(passRate * 100);

  let colorClass: string;
  if (pct >= 90) {
    colorClass = 'bg-green-100 text-green-700';
  } else if (pct >= 70) {
    colorClass = 'bg-blue-100 text-blue-700';
  } else if (pct >= 50) {
    colorClass = 'bg-amber-100 text-amber-700';
  } else {
    colorClass = 'bg-red-100 text-red-700';
  }

  const isUnstable = stdDev !== null && stdDev !== undefined && stdDev > 0.1;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-flex items-center gap-1 rounded-full font-medium ${colorClass} ${
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
          }`}
        >
          {pct}%
          {isUnstable && (
            <span className="opacity-70" title="불안정 (변동성 높음)">
              ±
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        평가 통과율 {pct}% — 테스트 시나리오의 {pct}%를 통과했습니다
        {isUnstable && ' (변동성 높음)'}
      </TooltipContent>
    </Tooltip>
  );
};

export default EvalQualityBadge;
