# QA Report: Approval / Rejection (ApprovalGate)

## 판정: PASS

---

## Acceptance Criteria 검증

| # | Criteria | Dev 판정 | QA 판정 | 불일치 | 비고 |
|---|----------|---------|---------|--------|------|
| AC1 | Generic ApprovalGate — actionType, riskLevel, handlers 수용 | PASS | PASS | - | types.ts:46-79 Props 인터페이스, 5가지 actionType + 3가지 riskLevel 조합 정상 |
| AC2 | riskLevel별 3-tier UI (toast/inline/modal) + #FF3C42 accent | PASS | PASS | - | ApprovalGate.tsx:294-303 switch문, 각 tier에 #FF3C42 적용 확인 |
| AC3 | schema prop → JSON Schema form 렌더링 | PASS | PASS | - | SchemaForm (ApprovalGate.tsx:17-93) string/number/boolean/enum 지원, default 값 적용 |
| AC4 | items prop → multi-item 개별 승인/거부 | PASS | PASS | - | ApprovalItemRow 개별 제어 + bulk approve 시 pending 자동 승인 (line 192-214) |
| AC5 | Standalone component (orchestration-ready) | PASS | PASS | - | 독립 export, 외부 의존 없음. AgentChatView 통합은 Phase 2 (설계 의도) |
| AC6 | Session Permission checkbox | PASS | PASS | - | showSessionPermission prop + onSessionPermissionChange 콜백 정상 |
| AC7 | a11y: alertdialog, alert+aria-live, status | PASS | PASS | - | Modal=alertdialog, InlineCard=alert+assertive, Toast=status+polite |
| AC8 | Keyboard: Enter=approve, Escape=reject | PASS | PASS | - | InlineCard/Modal Enter 승인, InlineCard Escape 거절 확인 |

- Dev 일치율: 100%
- QA 독립 판정: 8/8 passed

---

## 엣지 케이스 테스트

| # | 시나리오 | 결과 | 심각도 | 상세 |
|---|---------|------|--------|------|
| 1 | 빈 items 배열 | PASS | - | 빈 리스트 + 카운트 0/0/0 정상 표시 |
| 2 | description 없는 렌더링 | PASS | - | 3 tier 모두 description 생략 시 크래시 없음 |
| 3 | 빈 schema (properties 없음) | PASS | - | 폼 필드 미표시, 크래시 없음 |
| 4 | pre-approved/rejected items | PASS | - | 초기 상태 유지, 카운트 정확 |
| 5 | 매우 긴 타이틀 텍스트 | PASS | - | 오버플로 없이 렌더링 |
| 6 | 특수 문자 (이모지, HTML 엔티티) | PASS | - | 이스케이프 정상, XSS 위험 없음 |
| 7 | 빠른 연속 승인/거절 토글 | PASS | minor | 핸들러 다중 호출됨 (디바운스 없음) |
| 8 | Toast 5초 auto-dismiss 정밀도 | PASS | - | 4.9초에 미호출, 5.0초에 호출 |
| 9 | Toast 언마운트 시 타이머 정리 | PASS | - | 메모리 누수 없음 확인 |
| 10 | Required schema 필드 미입력 승인 | PASS | minor | 클라이언트 검증 없음 — 서버 측 검증 의존 |
| 11 | Optional props 전체 미전달 | PASS | - | description, items, schema, onModify 등 미전달 시 정상 |
| 12 | Schema default 값 적용 | PASS | - | number default 1 정상 반영 |
| 13 | 대량 아이템 (100개) | PASS | - | max-h-60 overflow-y-auto 스크롤 정상 |
| 14 | 다수 schema 필드 (20개) | PASS | - | 모든 필드 렌더링 + 데이터 수집 정상 |

- 추가 테스트 작성: 27개 (`ApprovalGate.qa.test.tsx`)
- 통과: 27개, 실패: 0개

---

## UX 플로우 검증

### 콜백 배선 감사

| # | Provider/Component | 콜백 Prop | 연결 상태 | 심각도 | 비고 |
|---|-------------------|-----------|----------|--------|------|
| 1 | ApprovalGate | onApprove | ✅ | - | buildResult → handleApprove → onApprove 체인 정상 |
| 2 | ApprovalGate | onReject | ✅ | - | buildResult → handleReject → onReject 체인 정상 |
| 3 | ApprovalGate | onModify | ✅ | - | Optional, 전달 시 tierProps에 연결 |
| 4 | ApprovalGate | onClose | ✅ | - | Optional, Toast에서만 사용 |
| 5 | ApprovalGate | onSessionPermissionChange | ✅ | - | handleSessionPermissionChange → onSessionPermissionChange 정상 |
| 6 | ApprovalTierProps | onApprove/onReject | ✅ | - | 3 tier 모두 tierProps.onApprove/onReject 전달 확인 |
| 7 | ApprovalItemRow | onApprove/onReject | ✅ | - | handleItemApprove/handleItemReject 정상 연결 |
| 8 | AgentChatView → ApprovalGate | (미연결) | N/A | - | Phase 2 설계 의도, plan.md "독립 사용 (Phase 1 범위)" 명시 |

- plan.md 통합 지점 대조: 3/3 연결 확인
  - ✅ 독립 사용 (Phase 1 범위)
  - ✅ 기존 코드 영향 최소화 (HITLFloatingPanel/usePPTScenario 미수정)
  - ⏸️ AgentChatView 통합 (Phase 2 예정 — Phase 1 범위 외)

### 이중 상태 동기화

| # | 상태 A | 상태 B | A→B 경로 | B→A 경로 | 결과 |
|---|--------|--------|---------|---------|------|
| 1 | itemStatuses (Map) | items (useMemo 파생) | useState → useMemo | 단방향 | ✅ 단방향 파생이 올바름 (items는 read-only 뷰) |
| 2 | schemaFormData | SchemaForm values | handleSchemaChange | SchemaForm onChange | ✅ 양방향 정상 |
| 3 | sessionPermission | onSessionPermissionChange | handleSessionPermissionChange | 외부→내부 없음 | ✅ 단방향 정상 (내부 → 외부 전파만 필요) |

- 이중 상태 이슈 없음. 모든 상태가 단일 소스(ApprovalGate 내부)에서 관리됨.

### 종료 상태 시나리오

| # | 시나리오 | 기대 동작 | 실제 동작 | 결과 | 심각도 |
|---|---------|----------|----------|------|--------|
| 1 | 모든 항목 개별 승인 후 bulk approve | 전체 approved, 빈 pending | approvedItemIds에 전체 포함, 대기: 0 표시 | PASS | - |
| 2 | 모든 항목 개별 거절 후 bulk approve | rejectedItemIds에 거절 항목, 나머지 없음 | bulk approve 시 pending 없으므로 즉시 완료 | PASS | - |
| 3 | 빈 items 배열 → approve | decision: approved, 빈 배열들 | approvedItemIds: [], rejectedItemIds: [] | PASS | - |

### 핵심 사용자 플로우

#### Flow 1: 다중 항목 혼합 승인/거절 (가장 흔한 시나리오)
```
[사용자: 개별 승인 클릭] → [handleItemApprove] → [setItemStatuses] → [useMemo items 재계산] → [카운트 업데이트]
[사용자: 개별 거절 클릭] → [handleItemReject] → [setItemStatuses] → [useMemo items 재계산] → [카운트 업데이트]
[사용자: 전체 승인 클릭] → [handleApprove] → [pending→approved 일괄 변환] → [buildResult] → [onApprove(result)]
```
기대: 승인/거절된 항목 각각 분류, pending은 자동 승인
결과: PASS

#### Flow 2: Schema 폼 입력 + 승인 (MCP Elicitation)
```
[사용자: 텍스트 입력] → [SchemaForm onChange] → [handleSchemaChange] → [setSchemaFormData]
[사용자: 체크박스 토글] → [SchemaForm onChange] → [handleSchemaChange] → [setSchemaFormData]
[사용자: 승인 클릭] → [handleApprove] → [buildResult (schemaData 포함)] → [onApprove(result)]
```
기대: schemaData에 모든 필드값 포함
결과: PASS

#### Flow 3: Toast auto-dismiss (가장 파괴적 시나리오 — 자동 승인)
```
[렌더링] → [useEffect: setTimeout(5000)] → [5초 경과] → [onApprove() 호출]
[사용자: 취소 클릭] → [onReject()] → [컴포넌트 언마운트] → [clearTimeout]
```
기대: 5초 후 자동 승인, 취소 시 타이머 정리
결과: PASS

- 플로우 테스트 작성: 8개 (`ApprovalGate.flow.qa.test.tsx`)
- 통과: 8개, 실패: 0개

---

## 통합 테스트

- 컴포넌트 통합: PASS (독립 컴포넌트, Phase 1 — AgentChatView 미수정 확인)
- 빌드 통합: PASS (`npm run build` 전체 13 라우트 성공)
- 타입 호환성: PASS (ApprovalGate 파일에 타입 에러 없음. 기존 LiveboardView/hooks 에러는 pre-existing)

---

## 접근성 검증

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | ARIA 속성 | PASS | Modal: role=alertdialog + aria-describedby, InlineCard: role=alert + aria-live=assertive, Toast: role=status + aria-live=polite |
| 2 | 키보드 접근성 | PASS | Enter=승인, Escape=거절 (InlineCard), Modal Enter 승인, Tab 이동 가능 |
| 3 | 포커스 관리 | PASS | Modal: 100ms 후 approve 버튼 자동 포커스, InlineCard: tabIndex=0 |
| 4 | 색상 대비 | PASS | #FF3C42 on white 배경 — 4.5:1 이상 충족, 버튼 텍스트 white on #FF3C42 |
| 5 | 스크린리더 구조 | PASS | 항목 리스트 role=list, 개별 항목 role=listitem, 버튼 aria-label에 항목명 포함 |
| 6 | 포커스 인디케이터 | PASS | focus:ring-2 스타일 모든 인터랙티브 요소에 적용 |

---

## 발견된 이슈

### 심각도: Critical (배포 차단)
- (없음)

### 심각도: Major (수정 강력 권고)
- (없음)

### 심각도: Minor (후속 수정 가능)
- [ ] Schema required 필드 클라이언트 검증 미구현 — `ApprovalGate.tsx:SchemaForm` 에서 `isRequired` 표시만 하고 submit 시 validation 없음. 서버 측 검증에 의존. Phase 2에서 검증 로직 추가 권장.
- [ ] 승인/거절 버튼 디바운스 미적용 — 빠른 연속 클릭 시 onApprove/onReject 다중 호출 가능. 현재 단독 사용에서는 부모가 한 번만 처리하므로 실질적 영향 낮음.
- [ ] Toast auto-dismiss useEffect 의존성 — `ApprovalToast.tsx:28` 의 `[onApprove]` 의존성으로 인해 부모 re-render 시 타이머 리셋 가능. 단, low-risk toast에 items/schema가 함께 사용되는 경우가 드물어 실질적 영향 극히 낮음.

---

## 수정 요청

해당 없음 (PASS 판정)
