# QA Report: Tool Call Display

## 판정: PASS

> 이전 판정: CONDITIONAL PASS (수정 사이클 1회 완료)
> 수정 내역: commit `4161ccd` — useMemo를 failed early return 앞으로 이동하여 React hooks 순서 위반 해결

---

## Acceptance Criteria 검증

| # | Criteria | Dev 판정 | QA 판정 | 불일치 | 비고 |
|---|----------|---------|---------|--------|------|
| 1 | 도구 식별 + 상태 즉시 구분 | PASS | PASS | - | 5개 상태별 고유 아이콘+색상+애니메이션 |
| 2 | 클릭/토글로 매개변수/결과 축소/확대 | PASS | PASS | - | Radix Collapsible 기존 구현 |
| 3 | 실행 중 로딩 상태 (스피너 + 현재진행형 레이블) | PASS | PASS | - | Loader2 animate-spin + shimmer-text |
| 4 | 실패 시 에러 메시지 + 재시도 옵션 | PASS | PASS | - | hooks 순서 위반 수정 완료 (commit 4161ccd) |
| 5 | 메시지 흐름과 자연스러운 통합 | PASS | PASS | - | 2단 아코디언 기존 구현 |
| 6 | subtools 중첩 진행 상태 | PASS | PASS | - | 기존 구현 유지 |
| 7 | TOOL_METADATA 활용 | PASS | PASS | - | 기존 패턴 유지 |
| 8 | 키보드 내비게이션 + 스크린 리더 | PASS | PASS | - | Radix + aria 속성 |

- Dev 일치율: 100% (8/8 일치)
- QA 독립 판정: 8/8 passed

---

## 엣지 케이스 테스트

| # | 시나리오 | 결과 | 심각도 | 상세 |
|---|---------|------|--------|------|
| 1 | unknown toolType 처리 | PASS | - | console.warn + null 반환 |
| 2 | failed 상태 without errorMessage | PASS | - | generic "도구 실행 실패" 표시 |
| 3 | failed 상태 without onRetry | PASS | - | 재시도 버튼 미표시 |
| 4 | result.message fallback | PASS | - | errorMessage 없을 때 result.message 사용 |
| 5 | 매우 긴 errorMessage | PASS | - | 레이아웃 깨짐 없음 |
| 6 | size=0/999 극단 아이콘 크기 | PASS | - | 크래시 없음 |
| 7 | failed overrides all toolType rendering | PASS | - | ppt_init도 failed면 에러 UI만 표시 |
| 8 | data_query 존재하지 않는 queryId | PASS | - | "불러오는 중..." 메시지 |
| 9 | 더블 클릭 onToggle | PASS | - | 각 클릭 독립 호출 |
| 10 | unknown status에 대한 default 처리 | PASS | - | pending과 동일한 회색 원 렌더링 |
| 11 | awaiting-input 상태 shimmer | PASS | - | isRunning=true로 shimmer-text 적용 |

- 추가 테스트 작성: 16개 (ToolCallDisplay.qa.test.tsx)
- 통과: 16개, 실패: 0개

---

## UX 플로우 검증

### 콜백 배선 감사

| # | Provider/Component | 콜백 Prop | 연결 상태 | 심각도 | 비고 |
|---|-------------------|-----------|----------|--------|------|
| 1 | ToolCallWidget | onRetry | ✅ → Content | - | 정상 전달 |
| 2 | ToolCallWidget | errorMessage | ✅ → Header + Content | - | 정상 전달 |
| 3 | ToolCallGroup | onRetry | ✅ → Widget | - | `() => onRetry(message.id)` |
| 4 | AgentChatView → ToolCallGroup | onRetry | ❌ 미전달 | Minor | plan.md "인터페이스만 열어둠" 명시 |
| 5 | PPTScenarioRenderer → ToolCallGroup | onRetry | ❌ 미전달 | Minor | 의도된 미연결 |
| 6 | SalesAnalysisRenderer → ToolCallGroup | onRetry | ❌ 미전달 | Minor | 의도된 미연결 |
| 7 | ToolCallGroup | onToggle | ✅ → Widget | - | 정상 전달 |

- plan.md 통합 지점 대조: 5/5 연결 확인 (4개 완전 연결 + 1개 의도된 인터페이스만)

### 이중 상태 동기화

| # | 상태 A | 상태 B | A→B 경로 | B→A 경로 | 결과 |
|---|--------|--------|---------|---------|------|
| 1 | isExpandedProp (외부) | internalExpanded (내부) | 외부 우선 | N/A (단방향) | ✅ |
| 2 | status prop | effectiveStatus (HITL) | 자동 파생 | N/A (단방향) | ✅ |

### 종료 상태 시나리오

| # | 시나리오 | 기대 동작 | 실제 동작 | 결과 | 심각도 |
|---|---------|----------|----------|------|--------|
| 1 | 모든 tool 완료 | 그룹 헤더 "X 완료" 표시 | 정상 | PASS | - |
| 2 | 빈 메시지 배열 | 렌더링 안 함 | `return null` | PASS | - |

### 핵심 사용자 플로우

#### Flow 1: 정상 실행 (running → completed)
```
[시나리오 진행] → [ToolCallGroup: message.toolStatus='running']
→ [ToolCallWidget: effectiveStatus 계산] → [Header: shimmer + labelRunning]
→ [시나리오 완료] → [Header: text-completed + labelComplete]
```
기대: 상태 전환 시 레이블과 아이콘 변경
결과: PASS

#### Flow 2: 실패 전환 (running → failed)
```
[running 상태] → [status='failed' 전환]
→ [ToolCallContent: useMemo 먼저 호출 → failed early return]
→ [에러 UI 정상 표시 + 재시도 버튼]
```
기대: 에러 UI 정상 표시
결과: PASS (hooks 순서 위반 수정 완료 — commit 4161ccd)

#### Flow 3: HITL 도구 awaiting-input 전환
```
[HITL 도구 running + selectedOption 없음]
→ [ToolCallWidget: effectiveStatus='awaiting-input']
→ [Header: shimmer-text] + [StatusIndicator: amber pulse]
```
기대: awaiting-input 상태 시각적 표시
결과: PASS

- 플로우 테스트 작성: 9개 (ToolCallDisplay.flow.qa.test.tsx)
- 통과: 9개, 실패: 0개

---

## 통합 테스트

- 컴포넌트 통합: PASS (ToolCallGroup → ToolCallWidget → ToolCallHeader/Content/StatusIndicator, import/export/props 정상)
- 빌드 통합: PASS (Next.js 빌드 성공)
- 타입 호환성: PASS (ToolCall 관련 새 에러 없음. 기존 HitlOption import 에러는 이번 변경과 무관)

---

## 접근성 검증

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | ARIA 속성 | PASS | aria-expanded, aria-label 적절히 사용 |
| 2 | 키보드 접근성 | PASS | 모든 인터랙티브 요소 button 사용 + Radix Collapsible |
| 3 | 포커스 관리 | PASS | Collapsible 열림/닫힘 시 포커스 유지 |
| 4 | 색상 대비 | PASS | 충분한 대비 (red-500, blue-500, green-500 on white) |
| 5 | 스크린 리더 | PASS | 각 아이콘 aria-label로 상태 전달 |

---

## 발견된 이슈

### 심각도: Critical (배포 차단)
- (없음)

### 심각도: Major (수정 강력 권고)
- (없음) — 이전 Major (hooks 순서 위반) 수정 완료

### 심각도: Minor (후속 수정 가능)
- [ ] **[Minor] 상위 컴포넌트에서 onRetry 미전달** — `AgentChatView.tsx`, `PPTScenarioRenderer.tsx`, `SalesAnalysisScenarioRenderer.tsx`
  - plan.md에서 "인터페이스만 열어둠"으로 의도된 제한. 백엔드 연동 시 구현 필요
- [ ] **[Minor] ToolCallGroupHeader에 aria-label 없음** — `ToolCallGroupHeader.tsx`
  - `aria-expanded`는 있으나, `aria-label`이 없어 스크린리더에서 버튼 목적 불명확
- [ ] **[Minor] 시나리오 훅에서 'failed' 상태 전환 코드 경로 없음** — `usePPTScenario.ts`
  - 현재 시나리오에서 실패를 트리거하는 로직이 없음. 백엔드 연동 시 구현 필요

---

## 테스트 요약

| 테스트 파일 | 테스트 수 | 통과 | 실패 |
|------------|---------|------|------|
| ToolCallStatusIndicator.test.tsx (dev) | 8 | 8 | 0 |
| ToolCallHeader.test.tsx (dev) | 7 | 7 | 0 |
| ToolCallDisplay.qa.test.tsx (QA 엣지) | 16 | 16 | 0 |
| ToolCallDisplay.flow.qa.test.tsx (QA 플로우) | 9 | 9 | 0 |
| **합계** | **40** | **40** | **0** |
