# Plan: Agent Self-Review / Auto-Validation

## 파일 구조
| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| src/components/features/agent-chat/components/SelfReview/types.ts | Self-Review 타입 정의 | 신규 |
| src/components/features/agent-chat/components/SelfReview/constants.ts | 검증 항목 상수, 기본 검증 규칙 | 신규 |
| src/components/features/agent-chat/components/SelfReview/SelfReviewCard.tsx | 메인 컴포넌트 (접이식 카드) | 신규 |
| src/components/features/agent-chat/components/SelfReview/SelfReviewCheckItem.tsx | 개별 검증 항목 행 | 신규 |
| src/components/features/agent-chat/components/SelfReview/SelfReviewCard.test.tsx | 단위 테스트 | 신규 |
| src/components/features/agent-chat/components/SelfReview/index.ts | Barrel export | 신규 |

## Props Interface

```typescript
// === types.ts ===

/** 개별 검증 항목 상태 */
export type ReviewItemStatus = 'pending' | 'checking' | 'pass' | 'warning' | 'fail';

/** 전체 검증 결과 */
export type ReviewOverallStatus = 'pending' | 'reviewing' | 'pass' | 'warning' | 'fail';

/** 개별 검증 항목 */
export interface ReviewItem {
  id: string;
  label: string;
  description?: string;
  status: ReviewItemStatus;
  evidence?: ReviewEvidence;
}

/** 검증 증거 */
export interface ReviewEvidence {
  type: 'log' | 'diff' | 'screenshot' | 'data';
  label: string;
  content?: string;
  url?: string;
}

/** 검증 결과 요약 (ApprovalGate 연동용) */
export interface SelfReviewResult {
  overallStatus: ReviewOverallStatus;
  items: ReviewItem[];
  passCount: number;
  warningCount: number;
  failCount: number;
  totalCount: number;
  suggestedRiskLevel: RiskLevel; // ApprovalGate RiskLevel과 동일 타입
}

/** SelfReviewCard Props */
export interface SelfReviewCardProps {
  /** 검증 항목 목록 */
  items: ReviewItem[];
  /** 전체 검증 상태 */
  overallStatus: ReviewOverallStatus;
  /** 현재 체크 중인 항목 인덱스 (진행률 표시용) */
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
```

## 상태 설계

- **SelfReviewCard 내부 state**:
  - `internalExpanded`: boolean (외부 isExpanded가 없을 때 사용)
  - items의 상태 변화는 외부에서 props로 제어 (controlled component)

- **검증 플로우** (외부 오케스트레이터가 제어):
  1. items 모두 `pending` → overallStatus: `pending`
  2. 순차적으로 `checking` → `pass`/`warning`/`fail` 전환
  3. 모든 항목 체크 완료 → overallStatus: 최종 판정
  4. fail 있으면 `onAutoFix` 콜백 제공

## 통합 지점

- **Phase 1 (이번 구현)**: 독립 컴포넌트로 구현. 시나리오 통합은 하지 않음.
  - SelfReviewCard를 import하여 채팅 뷰에서 렌더링 가능
  - ApprovalGate와 함께 사용할 때 SelfReviewResult.suggestedRiskLevel로 동적 리스크 조절 가능

- **Phase 2 (향후)**: usePPTScenario 등 시나리오 훅에 selfReview 단계 추가

## Acceptance Criteria 매핑
| # | Criteria | 구현 위치 |
|---|----------|-----------|
| AC1 | 자체 검증 단계 실행 | SelfReviewCard overallStatus='reviewing' 상태 표시 |
| AC2 | pass/warning/fail 트래픽 라이트 + 체크리스트 | SelfReviewCheckItem 상태별 아이콘 + SelfReviewCard 항목 리스트 |
| AC3 | 접이식 상세 + 증거 링크 | Collapsible 내부 evidence 섹션 |
| AC4 | ApprovalGate 연동 | SelfReviewResult.suggestedRiskLevel 타입 호환 |
| AC5 | multi_step_progress 표시 | overallStatus로 진행 상태 판별 가능 (Phase 2 시나리오 통합 시 사용) |
| AC6 | 로딩 상태 "검증 항목 N/M 확인 중..." | currentCheckIndex prop으로 진행률 헤더 표시 |
| AC7 | 실패 시 자동 수정/이슈 전달 | onAutoFix 콜백 + isAutoFixing 상태 |
| AC8 | 키보드 접근성 | Tab 포커스, Enter 토글, Escape 축소 |
| AC9 | ScenarioStep에 selfReview 설정 | types.ts에 SelfReviewConfig 타입 정의 (Phase 2에서 ScenarioStep 연동) |

## 테스트 시나리오
| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | AC2 | items가 모두 pass일 때 → 녹색 체크 아이콘 + "자체 검증 완료" 헤더 | render + queryByText/queryByLabelText | must |
| 2 | AC2 | warning 항목 존재 → 노란 경고 아이콘 + "검증 이슈 발견" 헤더 | render + queryByText | must |
| 3 | AC2 | fail 항목 존재 → 빨간 X 아이콘 + "검증 실패" 헤더 | render + queryByText | must |
| 4 | AC6 | overallStatus='reviewing' + currentCheckIndex → "검증 항목 N/M 확인 중..." | render + queryByText | must |
| 5 | AC3 | 카드 클릭 → 접이식 확장 → 항목 상세 표시 | userEvent.click + queryByText | must |
| 6 | AC8 | Tab으로 포커스 → Enter로 토글 → Escape로 축소 | userEvent.keyboard | must |
| 7 | AC7 | fail 항목 존재 시 "자동 수정" 버튼 표시 → 클릭 시 onAutoFix 호출 | userEvent.click + mock callback | should |
| 8 | AC4 | SelfReviewResult.suggestedRiskLevel 계산 검증 | 유틸 함수 단위 테스트 | should |
| 9 | smoke | 기본 렌더링 에러 없음 | render() 호출 | must |
