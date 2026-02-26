import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Shield,
  ChevronDown,
  Loader2,
  Wrench,
} from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import type { SelfReviewCardProps, ReviewOverallStatus } from './types';
import { REVIEW_STATUS_LABELS, buildSelfReviewResult } from './constants';
import SelfReviewCheckItem from './SelfReviewCheckItem';

/** 전체 상태별 헤더 아이콘 */
function OverallStatusIcon({ status, size = 16 }: { status: ReviewOverallStatus; size?: number }) {
  switch (status) {
    case 'reviewing':
      return <Loader2 size={size} className="text-blue-500 animate-spin flex-shrink-0" aria-label="검증 중" />;
    case 'pass':
      return <ShieldCheck size={size} className="text-green-500 flex-shrink-0" aria-label="검증 완료" />;
    case 'warning':
      return <ShieldAlert size={size} className="text-amber-500 flex-shrink-0" aria-label="경고 발견" />;
    case 'fail':
      return <ShieldX size={size} className="text-red-500 flex-shrink-0" aria-label="검증 실패" />;
    case 'pending':
    default:
      return <Shield size={size} className="text-gray-400 flex-shrink-0" aria-label="검증 대기" />;
  }
}

/** 상태별 왼쪽 보더 색상 */
function getLeftBorderClass(status: ReviewOverallStatus): string {
  switch (status) {
    case 'pass':
      return 'border-l-green-500';
    case 'warning':
      return 'border-l-amber-500';
    case 'fail':
      return 'border-l-red-500';
    case 'reviewing':
      return 'border-l-blue-500';
    default:
      return 'border-l-gray-300';
  }
}

/** 상태별 배경 색상 */
function getBackgroundClass(status: ReviewOverallStatus): string {
  switch (status) {
    case 'pass':
      return 'bg-green-50/50';
    case 'warning':
      return 'bg-amber-50/50';
    case 'fail':
      return 'bg-red-50/50';
    case 'reviewing':
      return 'bg-blue-50/50';
    default:
      return 'bg-gray-50/50';
  }
}

const SelfReviewCard: React.FC<SelfReviewCardProps> = ({
  items,
  overallStatus,
  currentCheckIndex,
  isExpanded: isExpandedProp,
  onToggle,
  onReviewComplete,
  onAutoFix,
  isAutoFixing = false,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = isExpandedProp ?? internalExpanded;
  const prevStatusRef = useRef(overallStatus);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  }, [onToggle]);

  // 검증 완료 시 콜백 호출
  useEffect(() => {
    const wasReviewing = prevStatusRef.current === 'reviewing';
    const isCompleted =
      overallStatus === 'pass' ||
      overallStatus === 'warning' ||
      overallStatus === 'fail';

    if (wasReviewing && isCompleted && onReviewComplete) {
      onReviewComplete(buildSelfReviewResult(items, overallStatus));
    }

    prevStatusRef.current = overallStatus;
  }, [overallStatus, items, onReviewComplete]);

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        e.preventDefault();
        handleToggle();
      }
    },
    [isExpanded, handleToggle]
  );

  // 진행률 텍스트
  const progressText =
    overallStatus === 'reviewing' && currentCheckIndex !== undefined
      ? `검증 항목 ${currentCheckIndex + 1}/${items.length} 확인 중...`
      : undefined;

  // 결과 요약 텍스트 (완료 상태)
  const passCount = items.filter((i) => i.status === 'pass').length;
  const warningCount = items.filter((i) => i.status === 'warning').length;
  const failCount = items.filter((i) => i.status === 'fail').length;

  const hasFail = failCount > 0;
  const showAutoFix = hasFail && onAutoFix && !isAutoFixing;

  return (
    <Collapsible open={isExpanded} onOpenChange={handleToggle}>
      <div
        ref={cardRef}
        className={`rounded-lg border border-l-4 ${getLeftBorderClass(overallStatus)} ${getBackgroundClass(overallStatus)} animate-fade-in-up`}
        onKeyDown={handleKeyDown}
        role="region"
        aria-label="자체 검증 결과"
      >
        {/* 헤더 (항상 표시) */}
        <CollapsibleTrigger asChild>
          <button
            className="flex items-center justify-between w-full px-3 py-2.5 text-left hover:bg-black/[0.02] transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-expanded={isExpanded}
          >
            <div className="flex items-center gap-2 min-w-0">
              <OverallStatusIcon status={overallStatus} />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-gray-800 truncate">
                  {REVIEW_STATUS_LABELS[overallStatus]}
                </span>
                {progressText && (
                  <span className="text-[11px] text-blue-600 truncate">
                    {progressText}
                  </span>
                )}
                {overallStatus !== 'pending' && overallStatus !== 'reviewing' && (
                  <span className="text-[11px] text-gray-500 truncate">
                    {passCount} 통과
                    {warningCount > 0 && ` · ${warningCount} 경고`}
                    {failCount > 0 && ` · ${failCount} 실패`}
                  </span>
                )}
              </div>
            </div>

            <ChevronDown
              size={14}
              className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </CollapsibleTrigger>

        {/* 접이식 상세 내용 */}
        <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="px-3 pb-3 pt-0">
            {/* 검증 항목 체크리스트 */}
            <div className="border-t border-gray-200/60 pt-2 space-y-0.5">
              {items.map((item, index) => (
                <SelfReviewCheckItem
                  key={item.id}
                  item={item}
                  isActive={
                    overallStatus === 'reviewing' &&
                    currentCheckIndex === index
                  }
                />
              ))}
            </div>

            {/* 자동 수정 / 수정 중 영역 */}
            {(showAutoFix || isAutoFixing) && (
              <div className="mt-2 pt-2 border-t border-gray-200/60">
                {isAutoFixing ? (
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <Loader2 size={12} className="animate-spin" />
                    <span>자동 수정 진행 중...</span>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAutoFix?.();
                    }}
                    className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    <Wrench size={12} />
                    <span>자동 수정 시도</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default React.memo(SelfReviewCard);
