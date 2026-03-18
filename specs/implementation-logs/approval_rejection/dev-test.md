# Dev Test Report: Approval / Rejection — AI SDK needsApproval Update

## 정적 분석
- TypeScript: PASS (ApprovalGate 파일에 에러 없음. 기존 pre-existing 에러는 무관)
- ESLint: N/A (프로젝트에 eslint config 없음)
- Build: PASS (13 라우트 빌드 성공)

## 단위 테스트

### 기존 테스트 (변경 없음, 회귀 확인)
| # | 테스트명 | 결과 |
|---|---------|------|
| 1-7 | ApprovalItemRow (renders, approve/reject, badge, role) | PASS |
| 8-12 | ApprovalToast (renders, aria, auto-dismiss, cancel, close) | PASS |
| 13-22 | ApprovalInlineCard (renders, aria, buttons, keyboard, modify, children, session) | PASS |
| 23-28 | ApprovalModal (dialog, renders, buttons, modify, children) | PASS |
| 29-58 | ApprovalGate main (smoke, risk-routing, title, handlers, multi-item, schema, session, labels, keyboard, high-risk, low-risk) | PASS |

### 신규 테스트: approvalConditions
| # | 테스트명 | 결과 |
|---|---------|------|
| 1 | returns true for high-risk action | PASS |
| 2 | returns true for medium-risk action | PASS |
| 3 | returns false for low-risk action | PASS |
| 4 | returns false when user role is in autoApproveRoles | PASS |
| 5 | returns true when user role is NOT in autoApproveRoles | PASS |
| 6 | returns true when autoApproveRoles not specified | PASS |
| 7 | returns false when session permission is set | PASS |
| 8 | session permission takes precedence over risk level | PASS |
| 9 | createRBACCondition wraps with userRole | PASS |
| 10 | createRBACCondition supports session store | PASS |
| 11 | SessionPermissionStore: returns false for unknown | PASS |
| 12 | SessionPermissionStore: returns true after set | PASS |
| 13 | SessionPermissionStore: returns false after unset | PASS |
| 14 | SessionPermissionStore: clears all | PASS |
| 15 | SessionPermissionStore: isolates action types | PASS |

### 신규 테스트: useApprovalGateAdapter
| # | 테스트명 | 결과 |
|---|---------|------|
| 1 | converts approval-requested tools to pendingApprovals | PASS |
| 2 | maps riskLevel and actionType from toolRiskMapping | PASS |
| 3 | uses medium/execute default for unmapped tools | PASS |
| 4 | excludes non-approval-requested status tools | PASS |
| 5 | approveToolCall → addToolApprovalResponse({approved: true}) | PASS |
| 6 | rejectToolCall → addToolApprovalResponse({approved: false}) | PASS |
| 7 | hasPendingApprovals is false when no requests | PASS |
| 8 | handles multiple pending approvals | PASS |

### 신규 테스트: extractApprovalRequests
| # | 테스트명 | 결과 |
|---|---------|------|
| 1 | extracts approval-requested tool invocations | PASS |
| 2 | ignores non-approval-requested states | PASS |
| 3 | ignores user messages | PASS |
| 4 | handles messages without parts | PASS |
| 5 | handles non-tool-invocation parts | PASS |
| 6 | extracts multiple requests from multiple messages | PASS |

- 총 테스트: 122개 (기존 93 + 신규 29)
- 통과: 122개, 실패: 0개

## 시나리오 커버리지
| # | 시나리오 | 우선순위 | 테스트 위치 | 결과 |
|---|---------|---------|-----------|------|
| 1 | approval-requested → pendingApprovals 포함 | must | useApprovalGateAdapter.test.ts:L17 | PASS |
| 2 | toolRiskMapping으로 riskLevel/actionType 매핑 | must | useApprovalGateAdapter.test.ts:L38 | PASS |
| 3 | approveToolCall → addToolApprovalResponse({approved:true}) | must | useApprovalGateAdapter.test.ts:L97 | PASS |
| 4 | rejectToolCall → addToolApprovalResponse({approved:false}) | must | useApprovalGateAdapter.test.ts:L115 | PASS |
| 5 | createApprovalCondition(low,admin) → false | must | approvalConditions.test.ts:L24 | PASS |
| 6 | createApprovalCondition(high,viewer) → true | must | approvalConditions.test.ts:L38 | PASS |
| 7 | SessionPermissionStore set → isAutoApproved true | must | approvalConditions.test.ts:L97 | PASS |
| 8 | session permission 스킵 → condition returns false | must | approvalConditions.test.ts:L58 | PASS |
| 9 | approval-responded → pendingApprovals에서 제외 | should | useApprovalGateAdapter.test.ts:L75 | PASS |
| 10 | autoApproveRoles 미지정 → 항상 승인 필요 | should | approvalConditions.test.ts:L46 | PASS |
| 11 | clear() 호출 → 모든 세션 허가 초기화 | should | approvalConditions.test.ts:L109 | PASS |

- must 커버리지: 8/8 (100%)
- should 커버리지: 3/3 (100%)

## Acceptance Criteria 자가 검증
| # | Criteria | 코드 구현 | 테스트 커버 | 판정 |
|---|----------|----------|-----------|------|
| AC1 | useApprovalGateAdapter: approval-requested → riskLevel/actionType 매핑 | useApprovalGateAdapter.ts:L60-75 | adapter tests #1-4 | PASS |
| AC2 | onApprove/onReject → addToolApprovalResponse 호출 | useApprovalGateAdapter.ts:L77-88 | adapter tests #5-6 | PASS |
| AC3 | createApprovalCondition → needsApproval: async fn | approvalConditions.ts:L38-59 | conditions tests #1-8 | PASS |
| AC4 | 기존 3-tier UI 유지 + #FF3C42 accent | 기존 코드 무변경 | 기존 58개 테스트 전수 PASS | PASS |
| AC5 | schema prop MCP Elicitation 호환 유지 | 기존 코드 무변경 | schema tests #45-48 | PASS |
| AC6 | items prop multi-item 유지 | 기존 코드 무변경 | multi-item tests #40-44 | PASS |
| AC7 | Session Permission → 조건부 승인 함수 자동 스킵 | approvalConditions.ts:L47-49 | conditions tests #7-8 | PASS |
| AC8 | 접근성 유지 (alertdialog, alert, aria-live) | 기존 코드 무변경 | a11y tests #9,14,23 | PASS |
| AC9 | 키보드 유지 (Enter/Escape/Tab) | 기존 코드 무변경 | keyboard tests #17-18,54-55 | PASS |

## QA 전달 사항
- Phase 2 UPDATE: AI SDK needsApproval 어댑터 레이어만 추가. 기존 ApprovalGate UI 컴포넌트 무변경.
- 신규 파일: useApprovalGateAdapter.ts, approvalConditions.ts (+ 테스트 2개)
- 기존 파일 수정: types.ts (AI SDK 호환 타입 추가 + toolCallId), ApprovalGate.tsx (toolCallId prop), index.ts (export 추가)
- 알려진 제한사항: AI SDK `useChat` 실제 연동은 백엔드 도입 시점에 E2E 검증 필요. 현재는 어댑터 레이어의 인터페이스 정합성만 테스트.
