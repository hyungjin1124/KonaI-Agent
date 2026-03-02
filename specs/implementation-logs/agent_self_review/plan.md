# Plan: Agent Self-Review / Auto-Validation

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| src/components/features/agent-chat/components/SelfReview/types.ts | 타입 정의 | 신규 |
| src/components/features/agent-chat/components/SelfReview/constants.ts | 헬퍼 함수 (deriveRiskLevel, buildSelfReviewResult) | 신규 |
| src/components/features/agent-chat/components/SelfReview/SelfReviewCheckItem.tsx | 개별 검증 항목 서브컴포넌트 | 신규 |
| src/components/features/agent-chat/components/SelfReview/SelfReviewCard.tsx | 메인 컴포넌트 | 신규 |
| src/components/features/agent-chat/components/SelfReview/index.ts | Barrel export | 신규 |
| src/components/features/agent-chat/components/SelfReview/SelfReviewCard.test.tsx | 단위 테스트 | 신규 |

## Props Interface

```typescript
// types.ts

import type { RiskLevel } from '../ApprovalGate/types';

export type ReviewItemStatus = 'pending' | 'checking' | 'pass' | 'warning' | 'fail';
export type ReviewOverallStatus = 'pending' | 'reviewing' | 'pass' | 'warning' | 'fail';
export type ReviewEvidenceType = 'log' | 'diff' | 'screenshot' | 'data';

export interface ReviewEvidence {
  type: ReviewEvidenceType;
  label: string;
}

export interface ReviewItem {
  id: string;
  label: string;
  status: ReviewItemStatus;
  description?: string;
  evidence?: ReviewEvidence[];
}

export interface SelfReviewResult {
  overallStatus: ReviewOverallStatus;
  passCount: number;
  warningCount: number;
  failCount: number;
  totalCount: number;
  suggestedRiskLevel: RiskLevel;
  items: ReviewItem[];
}

export interface SelfReviewConfig {
  enabled: boolean;
  checks?: string[];
  autoFixEnabled?: boolean;
  maxAutoFixAttempts?: number;
}

export interface SelfReviewCardProps {
  items: ReviewItem[];
  overallStatus: ReviewOverallStatus;
  isExpanded?: boolean;
  onToggle?: () => void;
  currentCheckIndex?: number;
  onReviewComplete?: (result: SelfReviewResult) => void;
  isAutoFixing?: boolean;
  onAutoFix?: () => void;
}
```

## 상태 설계

- `internalExpanded: boolean` — Uncontrolled 모드에서 사용. `isExpanded` prop이 있으면 무시
- `prevStatusRef: React.MutableRefObject<ReviewOverallStatus>` — `reviewing` → 완료 전이 감지용

## 통합 지점

- Phase 1: Standalone 컴포넌트. 직접적인 기존 파일 수정 없음
- `ApprovalGate/types.ts`에서 `RiskLevel` 타입을 임포트하여 연동
- `index.ts`에서 barrel export로 외부 사용 준비

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| AC1 | 자체 검증 단계 실행 | SelfReviewCard.tsx — overallStatus prop으로 라이프사이클 관리 |
| AC2 | pass/warning/fail 트래픽 라이트 + 체크리스트 | SelfReviewCard.tsx — OverallStatusIcon + SelfReviewCheckItem |
| AC3 | 접이식 상세 + 증거 링크 | SelfReviewCard.tsx — Radix Collapsible + SelfReviewCheckItem evidence |
| AC4 | ApprovalGate 연동 | constants.ts — deriveRiskLevel() + SelfReviewResult.suggestedRiskLevel |
| AC5 | multi_step_progress 표시 | types.ts — ReviewOverallStatus 타입 호환성 |
| AC6 | 로딩 상태 표시 | SelfReviewCard.tsx — currentCheckIndex + progressText |
| AC7 | 실패 시 자동 수정 | SelfReviewCard.tsx — onAutoFix + isAutoFixing props |
| AC8 | 키보드 접근성 | SelfReviewCard.tsx — Tab/Enter/Escape 핸들링 |
| AC9 | ScenarioStep selfReview 설정 | types.ts — SelfReviewConfig 타입 |

## 테스트 시나리오

| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | AC1 | overallStatus 5가지 상태 렌더링 | RTL render + getByText | must |
| 2 | AC2 | pass/warning/fail 아이콘 + 카운트 표시 | RTL render + getByText | must |
| 3 | AC3 | 접이식 토글 → 상세/증거 표시 | userEvent.click + queryByText | must |
| 4 | AC4 | deriveRiskLevel 매핑 검증 | 유닛 테스트 | must |
| 5 | AC4 | buildSelfReviewResult 결과 검증 | 유닛 테스트 | must |
| 6 | AC6 | "검증 항목 N/M 확인 중..." 텍스트 | RTL render + getByText | must |
| 7 | AC7 | fail 시 자동 수정 버튼 + isAutoFixing 스피너 | RTL + userEvent.click | must |
| 8 | AC8 | Escape 키 → 축소 | fireEvent.keyDown | must |
| 9 | AC1 | reviewing→pass 전이 시 onReviewComplete 호출 | rerender + mock.calls | must |
| 10 | AC1 | non-reviewing 전이 시 onReviewComplete 미호출 | rerender + expect not called | should |
| 11 | AC3 | Controlled/Uncontrolled 모드 전환 | isExpanded prop + onToggle | should |
| 12 | - | 빈 items 배열 처리 | render + no crash | should |
| 13 | AC7 | onAutoFix stopPropagation | userEvent.click + onToggle not called | should |
