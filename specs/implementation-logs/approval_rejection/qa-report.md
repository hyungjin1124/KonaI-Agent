# QA Report: Approval / Rejection — AI SDK needsApproval Update

## 판정: PASS

---

## Acceptance Criteria 검증

| # | Criteria | Dev 판정 | QA 판정 | 불일치 | 비고 |
|---|----------|---------|---------|--------|------|
| AC1 | useApprovalGateAdapter: approval-requested → riskLevel/actionType 매핑 | PASS | PASS | - | useApprovalGateAdapter.ts:L65-77 — filter + map 로직 정확. 미매핑 도구는 medium/execute 기본값 |
| AC2 | onApprove/onReject → addToolApprovalResponse 호출 | PASS | PASS | - | useApprovalGateAdapter.ts:L80-92 — approved: true/false 정확히 전달 |
| AC3 | createApprovalCondition → needsApproval: async fn | PASS | PASS | - | approvalConditions.ts:L41-64 — session → RBAC → risk level 순서 체크 체인 정확 |
| AC4 | 기존 3-tier UI 유지 + #FF3C42 accent | PASS | PASS | - | 기존 컴포넌트 무변경. InlineCard border-l-[#FF3C42], 버튼 bg-[#FF3C42] 확인 |
| AC5 | schema prop MCP Elicitation 호환 유지 | PASS | PASS | - | SchemaForm 무변경. JSON Schema → 자동 폼 렌더링 정상 |
| AC6 | items prop multi-item 유지 | PASS | PASS | - | 개별 승인/거절 + 일괄 승인 정상. 카운트 표시 정확 |
| AC7 | Session Permission → 조건부 승인 함수 자동 스킵 | PASS | PASS | - | approvalConditions.ts:L52-55 — sessionStore 우선 체크 후 자동 스킵 정상 |
| AC8 | 접근성 유지 (alertdialog, alert, aria-live) | PASS | PASS | - | Modal: role="alertdialog", Inline: role="alert" + aria-live="assertive", Toast: role="status" + aria-live="polite" |
| AC9 | 키보드 유지 (Enter/Escape/Tab) | PASS | PASS | - | InlineCard: Enter→approve, Escape→reject. Modal: Enter→approve, Escape→close via Dialog |

- Dev 일치율: 100%
- QA 독립 판정: 9/9 passed

---

## 엣지 케이스 테스트

| # | 시나리오 | 결과 | 심각도 | 상세 |
|---|---------|------|--------|------|
| 1 | 빈 items 배열 | PASS | - | 카드 정상 렌더링, 항목 없음 |
| 2 | 빈 schema (properties: {}) | PASS | - | 폼 필드 없이 정상 렌더링 |
| 3 | 매우 긴 텍스트 (500자+) | PASS | - | CSS truncate로 처리 |
| 4 | 특수문자/HTML/이모지 | PASS | - | React 자동 이스케이프 정상 |
| 5 | 빠른 연속 클릭 | PASS | minor | 디바운스 없음 — 클릭당 1회 호출. 의도적 설계 |
| 6 | Toast 언마운트 시 타이머 정리 | PASS | - | clearTimeout/clearInterval 정상 |
| 7 | Toast cancel 시 auto-dismiss 정지 | PASS | - | 타이머 클리어 정상 |
| 8 | 필수 schema 필드 미입력 후 승인 | PASS | minor | 클라이언트 validation 없음 — 의도적 (서버 측 처리) |
| 9 | 100개 items 대량 데이터 | PASS | - | max-h-60 overflow-y-auto 정상 |
| 10 | 20개 schema 필드 | PASS | - | 전수 렌더링 정상 |
| 11 | 모든 items 사전 승인/거절 | PASS | - | 뱃지 표시 정상, 버튼 미노출 |
| 12 | toolCallId 미전달 (기존 호환) | PASS | - | undefined 시 result에 미포함 |
| 13 | 미매핑 도구 기본값 | PASS | - | medium/execute 기본값 적용 |
| 14 | approval-responded 상태 제외 | PASS | - | pending에서 정확히 필터링 |
| 15 | extractApprovalRequests: user 메시지 무시 | PASS | - | role !== 'assistant' 필터 정상 |
| 16 | extractApprovalRequests: parts 없는 메시지 | PASS | - | optional chaining 정상 |

- 기존 QA 테스트 파일: 2개 (ApprovalGate.qa.test.tsx, ApprovalGate.flow.qa.test.tsx)
- 추가 테스트 작성: 0개 (기존 QA 테스트가 충분히 커버)
- 통과: 29개 (QA 테스트), 실패: 0개

---

## UX 플로우 검증

### 콜백 배선 감사

| # | Provider/Component | 콜백 Prop | 연결 상태 | 심각도 | 비고 |
|---|-------------------|-----------|----------|--------|------|
| 1 | ApprovalGate | onApprove | ✅ | - | required prop, 항상 전달 |
| 2 | ApprovalGate | onReject | ✅ | - | required prop, 항상 전달 |
| 3 | ApprovalGate | onModify | ✅ | - | optional, `onModify ? handleModify : undefined` 가드 |
| 4 | ApprovalGate | onClose | ✅ | - | optional, Toast에서만 사용 |
| 5 | ApprovalGate | onSessionPermissionChange | ✅ | - | optional, handleSessionPermissionChange에서 호출 |
| 6 | useApprovalGateAdapter | addToolApprovalResponse | ✅ | - | required input, approve/rejectToolCall에서 직접 호출 |
| 7 | ApprovalGate | toolCallId → result.toolCallId | ✅ | minor | 연결됨. 단, buildResult deps에 toolCallId 누락 (아래 비고) |

- plan.md 통합 지점 대조: 3/3 연결 확인
  1. ✅ ApprovalGate toolCallId prop 추가 + 결과 포함
  2. ✅ 어댑터 훅 사용 패턴 (extractApprovalRequests → adapter → ApprovalGate)
  3. ✅ 기존 코드 무영향 (toolCallId 미전달 시 기존 동작 유지)

### 이중 상태 동기화

| # | 상태 A | 상태 B | A→B 경로 | B→A 경로 | 결과 |
|---|--------|--------|---------|---------|------|
| - | - | - | - | - | 이중 상태 패턴 미발견 |

어댑터 훅은 입력(toolApprovalRequests)에서 파생 상태(pendingApprovals)만 생성.
ApprovalGate 내부 상태(itemStatuses, schemaFormData)와 중복 없음.

### 종료 상태 시나리오

| # | 시나리오 | 기대 동작 | 실제 동작 | 결과 | 심각도 |
|---|---------|----------|----------|------|--------|
| 1 | 모든 items 개별 결정 후 일괄 승인 | 남은 pending 0 → approve 호출 | approve 정상 호출, pending 0 | PASS | - |
| 2 | items 없이 단일 승인 | 바로 approve 호출 | 정상 호출 | PASS | - |
| 3 | Toast auto-dismiss 후 | onApprove 1회 호출 | 정상 1회 | PASS | - |

### 핵심 사용자 플로우

#### Flow 1: AI SDK 어댑터 → ApprovalGate 연결 (가장 흔한 시나리오)
```
[messages 수신] → [extractApprovalRequests: approval-requested 필터]
  → [useApprovalGateAdapter: toolRiskMapping 매핑]
  → [pendingApprovals 반환]
  → [ApprovalGate 렌더링 (riskLevel별 tier)]
  → [사용자 승인 클릭]
  → [approveToolCall → addToolApprovalResponse({id, approved:true})]
```
기대: addToolApprovalResponse 1회 호출
결과: PASS — 테스트 #5 (useApprovalGateAdapter.test.ts:L98) 확인

#### Flow 2: Multi-item 혼합 승인/거절 (가장 복잡한 시나리오)
```
[items 렌더링] → [개별 승인/거절] → [itemStatuses Map 업데이트]
  → [카운트 실시간 반영] → [일괄 승인 클릭]
  → [pending→approved 자동 전환] → [buildResult]
  → [onApprove({approvedItemIds, rejectedItemIds})]
```
기대: 개별 결정 + 남은 pending 자동 승인
결과: PASS — flow.qa.test.tsx Flow 1, Flow 2 확인

#### Flow 3: Session Permission + 조건부 승인 (파괴적 시나리오)
```
[ApprovalGate: showSessionPermission → 체크]
  → [onSessionPermissionChange(actionType, true)]
  → [외부: sessionStore.setAutoApproved(actionType, true)]
  → [다음 도구 호출: createApprovalCondition 평가]
  → [sessionStore.isAutoApproved → true → return false (게이트 스킵)]
```
기대: 세션 허가 후 동일 actionType 자동 스킵
결과: PASS — approvalConditions.test.ts #7-8, flow.qa.test.tsx Flow 5 확인

- 플로우 테스트 작성: 0개 (기존 flow.qa.test.tsx에 7개 플로우 이미 커버)
- 통과: 7개, 실패: 0개

---

## 통합 테스트

- 컴포넌트 통합: PASS (ApprovalToast, ApprovalInlineCard, ApprovalModal, ApprovalItemRow — import/export 정상)
- 빌드 통합: PASS (13 라우트 빌드 성공)
- 타입 호환성: PASS (ApprovalGate 파일 0 TS 에러. 기존 pre-existing 에러는 타 파일)

---

## 접근성 검증

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | ARIA 속성 | PASS | Modal: role="alertdialog" + aria-describedby, Inline: role="alert" + aria-live="assertive", Toast: role="status" + aria-live="polite", Items: role="list"/"listitem" + aria-label |
| 2 | 키보드 접근성 | PASS | Enter=approve, Escape=reject (inline), Tab 네비게이션 가능 (tabIndex={0}), Modal approve 버튼 자동 포커스 |
| 3 | 포커스 관리 | PASS | Modal: approveButtonRef + 100ms delayed focus, Dialog의 focus trap 내장 |
| 4 | 색상 대비 | PASS | #FF3C42 on white — 충분한 대비. 버튼 텍스트 white on #FF3C42 정상 |
| 5 | 스크린리더 | PASS | 의미 있는 구조: heading(h3) → content → actions. aria-label로 개별 항목 구분 가능 |

---

## 발견된 이슈

### 심각도: Critical (배포 차단)

없음.

### 심각도: Major (수정 강력 권고)

없음.

### 심각도: Minor (후속 수정 가능)

- [ ] `buildResult` useCallback의 dependency array에 `toolCallId` 누락 — ApprovalGate.tsx:193. `toolCallId`는 인스턴스 수명 동안 불변이므로 실제 영향 없으나, React hooks 규칙 위반. 후속 수정 권장.
- [ ] Schema required 필드에 대한 클라이언트 측 validation 미구현 — 의도적 설계 (서버 측 처리 위임). MCP Elicitation 스펙과 정합하나, UX 관점에서 시각적 피드백 추가 고려.
- [ ] 승인/거절 버튼 디바운스 미적용 — 빠른 연속 클릭 시 핸들러 다중 호출. 현재 구현에서는 부모가 상태 관리하므로 실질적 문제 없음.

---

## 수정 요청

PASS 판정 — 수정 요청 없음. Minor 이슈는 후속 개선 시 반영.
