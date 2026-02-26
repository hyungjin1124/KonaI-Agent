import type { ReviewItem, ReviewOverallStatus } from './types';
import type { RiskLevel } from '../ApprovalGate/types';

// =============================================
// Self-Review 상수 정의
// =============================================

/** 헤더 텍스트 매핑 */
export const REVIEW_STATUS_LABELS: Record<ReviewOverallStatus, string> = {
  pending: '자체 검증 대기',
  reviewing: '자체 검증 중...',
  pass: '자체 검증 완료',
  warning: '검증 이슈 발견',
  fail: '검증 실패',
};

/** 검증 결과 → ApprovalGate riskLevel 매핑 */
export function deriveRiskLevel(items: ReviewItem[]): RiskLevel {
  const hasFail = items.some((item) => item.status === 'fail');
  if (hasFail) return 'high';

  const hasWarning = items.some((item) => item.status === 'warning');
  if (hasWarning) return 'medium';

  return 'low';
}

/** 검증 결과 요약 생성 유틸 */
export function buildSelfReviewResult(
  items: ReviewItem[],
  overallStatus: ReviewOverallStatus
) {
  const passCount = items.filter((i) => i.status === 'pass').length;
  const warningCount = items.filter((i) => i.status === 'warning').length;
  const failCount = items.filter((i) => i.status === 'fail').length;

  return {
    overallStatus,
    items,
    passCount,
    warningCount,
    failCount,
    totalCount: items.length,
    suggestedRiskLevel: deriveRiskLevel(items),
  };
}

// =============================================
// PPT 시나리오 기본 검증 규칙 (Phase 2에서 활용)
// =============================================

export const PPT_REVIEW_CHECKS = [
  { id: 'slide_count', label: '슬라이드 수 일치' },
  { id: 'data_integrity', label: '데이터 정합성 확인' },
  { id: 'layout_consistency', label: '레이아웃 일관성' },
  { id: 'reference_validity', label: '참조 유효성 검증' },
  { id: 'format_compliance', label: '포맷 규격 준수' },
] as const;
