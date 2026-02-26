import type { RiskLevel } from '../ApprovalGate/types';

// =============================================
// Self-Review / Auto-Validation Types
// =============================================

/** 개별 검증 항목 상태 */
export type ReviewItemStatus = 'pending' | 'checking' | 'pass' | 'warning' | 'fail';

/** 전체 검증 결과 상태 */
export type ReviewOverallStatus = 'pending' | 'reviewing' | 'pass' | 'warning' | 'fail';

/** 검증 증거 */
export interface ReviewEvidence {
  type: 'log' | 'diff' | 'screenshot' | 'data';
  label: string;
  content?: string;
}

/** 개별 검증 항목 */
export interface ReviewItem {
  id: string;
  label: string;
  description?: string;
  status: ReviewItemStatus;
  evidence?: ReviewEvidence;
}

/** 검증 결과 요약 (ApprovalGate 연동용) */
export interface SelfReviewResult {
  overallStatus: ReviewOverallStatus;
  items: ReviewItem[];
  passCount: number;
  warningCount: number;
  failCount: number;
  totalCount: number;
  /** ApprovalGate riskLevel과 호환 — 동적 리스크 조절에 사용 */
  suggestedRiskLevel: RiskLevel;
}

/** SelfReviewCard Props */
export interface SelfReviewCardProps {
  /** 검증 항목 목록 */
  items: ReviewItem[];
  /** 전체 검증 상태 */
  overallStatus: ReviewOverallStatus;
  /** 현재 체크 중인 항목 인덱스 (진행률 표시용, 0-based) */
  currentCheckIndex?: number;
  /** 외부 제어 펼침 상태 */
  isExpanded?: boolean;
  /** 펼침 토글 콜백 */
  onToggle?: () => void;
  /** 검증 완료 후 콜백 */
  onReviewComplete?: (result: SelfReviewResult) => void;
  /** 자동 수정 요청 콜백 (fail 항목 존재 시) */
  onAutoFix?: () => void;
  /** 자동 수정 진행 중 */
  isAutoFixing?: boolean;
}

/** SelfReviewCheckItem Props */
export interface SelfReviewCheckItemProps {
  item: ReviewItem;
  /** 이 항목이 현재 체크 중인지 */
  isActive?: boolean;
}

/** 시나리오 정의에서 selfReview 설정 (Phase 2 연동 준비) */
export interface SelfReviewConfig {
  /** 검증 항목 ID 목록 (constants에서 정의) */
  checkIds: string[];
  /** 자동 수정 허용 여부 */
  allowAutoFix?: boolean;
  /** 최대 자동 수정 횟수 */
  maxAutoFixAttempts?: number;
}
