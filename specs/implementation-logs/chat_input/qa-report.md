# QA Report: Chat Input (Multi-modal) — Phase 1 MVP

## 판정: PASS

---

## Acceptance Criteria 검증

| # | Criteria | Dev 판정 | QA 판정 | 불일치 | 비고 |
|---|----------|---------|---------|--------|------|
| 1 | 단일 입력 컴포넌트 (UnifiedChatInput) | PASS | PASS | - | variant='default' / 'centered' 전환 동작 확인. GeneralChatView + ChatPanel 통합 완료 |
| 2 | + 메뉴 | PASS | PASS | - | PlusMenu.tsx — Radix DropdownMenu, 3개 항목 (파일/이미지/웹링크). 웹링크 disabled (Phase 2) |
| 3 | 이미지 클립보드 | PASS | PASS | - | useFileAttachment.handlePaste — clipboard image 감지 → addFiles. 텍스트 붙여넣기 기본 동작 유지 |
| 4 | 첨부 파일 칩 | PASS | PASS | - | AttachedFileChip 배열 렌더링, X 버튼 제거 동작 확인 |
| 5 | 복수 파일 지원 | PASS | PASS | - | MAX_FILES=5, flex-wrap 레이아웃, hidden input에 multiple 속성 |
| 6 | 파일 타입 검증 | PASS | PASS | - | 확장자 + MIME 타입 이중 검증. 허용 목록 17개 확장자 |
| 7 | 파일 크기 제한 | PASS | PASS | - | MAX_FILE_SIZE_BYTES=10MB, 초과 시 한국어 에러 메시지 |
| 8 | ModelSwitcher 통합 | PASS | PASS | - | showModelSwitcher prop 조건부 렌더링 |
| 9 | 접근성 | PASS | PASS | - | aria-label (textarea, send, plus menu), aria-multiline, role="group". aria-live 미구현은 Minor |

- Dev 일치율: 100%
- QA 독립 판정: 9/9 passed

---

## 엣지 케이스 테스트

| # | 시나리오 | 결과 | 심각도 | 상세 |
|---|---------|------|--------|------|
| 1 | 빈 데이터 (입력 없음, 파일 없음) | PASS | - | 전송 버튼 disabled, 칩 영역 미표시 |
| 2 | 최대 파일 수 (5개) 도달 후 6번째 추가 | PASS | - | validation error 콜백 호출 확인 |
| 3 | 매우 긴 텍스트 (5000자) | PASS | - | textarea 값 유지, 전송 버튼 활성 |
| 4 | 긴 파일명 (200자) | PASS | - | 칩에 파일명 표시 |
| 5 | 이모지 입력 | PASS | - | 정상 표시 |
| 6 | 파일명 특수문자 | PASS | - | 괄호, 한글, 공백 처리 |
| 7 | 선택적 Props 미전달 | PASS | - | 에러 없이 렌더링 |
| 8 | 빠른 연속 클릭 | PASS | - | 전송 동작 정상 |
| 9 | disabled 상태에서 Enter | PASS | - | onSend 미호출 |
| 10 | 파일 첨부 → 전송 → 파일 클리어 | PASS | - | 전송 후 파일 배열 초기화 |
| 11 | 파일만 첨부 (텍스트 없음) 전송 | PASS | - | 전송 가능 |
| 12 | 아티팩트 드래그 | PASS | - | 내부 드래그 데이터 처리 |
| 13 | 파일 트리 드래그 | PASS | - | 내부 드래그 데이터 처리 |
| 14 | 이미지 + 문서 혼합 첨부 | PASS | - | 타입별 올바른 처리 |
| 15 | 비허용 파일(.exe) 거부 | PASS | - | validation error 콜백 호출 |
| 16 | 초과 크기 파일(15MB) 거부 | PASS | - | validation error 콜백 호출 |

- 기존 QA Edge Case 테스트: 18개 (UnifiedChatInput.qa.test.tsx)
- 통과: 18개, 실패: 0개

---

## UX 플로우 검증

### 콜백 배선 감사

| # | Provider/Component | 콜백 Prop | 연결 상태 | 심각도 | 비고 |
|---|-------------------|-----------|----------|--------|------|
| 1 | GeneralChatView → UnifiedChatInput | onInputChange | ✅ | - | handleInputChange (L184) |
| 2 | GeneralChatView → UnifiedChatInput | onSend | ✅ | - | handleSend (L118) |
| 3 | GeneralChatView → UnifiedChatInput | onModelChange | ✅ | - | setSelectedModelId (L245) |
| 4 | GeneralChatView → UnifiedChatInput | onValidationError | ✅ | - | handleValidationError → showToast (L188) |
| 5 | GeneralChatView → UnifiedChatInput | textareaRef | ✅ | - | textareaRef (L241) |
| 6 | ChatPanel → UnifiedChatInput | onInputChange | ✅ | - | 부모로부터 전달, 기본값 `() => {}` |
| 7 | ChatPanel → UnifiedChatInput | onSend | ✅ | - | 부모로부터 전달, 기본값 `() => {}` |
| 8 | ChatPanel → UnifiedChatInput | onModelChange | ✅ | - | 부모로부터 전달 |
| 9 | ChatPanel → UnifiedChatInput | onValidationError | ✅ | - | 부모로부터 전달 |
| 10 | UnifiedChatInput → PlusMenu | onWebLinkClick | ❌ (의도적) | - | Phase 2 범위. 메뉴 항목 disabled 표시됨 |

- plan.md 통합 지점 대조: 4/4 연결 확인

### 이중 상태 동기화

| # | 상태 A | 상태 B | A→B 경로 | B→A 경로 | 결과 |
|---|--------|--------|---------|---------|------|
| - | (이중 상태 패턴 없음) | - | - | - | ✅ |

모든 상태가 단일 소스에서 관리됨. inputValue는 GeneralChatView, attachedFiles는 useFileAttachment, selectedModelId는 GeneralChatView.

### 종료 상태 시나리오

| # | 시나리오 | 기대 동작 | 실제 동작 | 결과 | 심각도 |
|---|---------|----------|----------|------|--------|
| 1 | 마지막 파일 제거 | 전송 버튼 disabled (텍스트 없으면) | 동일 | PASS | - |
| 2 | 모든 파일 전송 후 클리어 | 칩 영역 사라짐, 전송 버튼 상태 inputValue 기준 | 동일 | PASS | - |

### 핵심 사용자 플로우

#### Flow 1: 표준 메시지 전송
```
[사용자: 텍스트 입력] → [handleTextareaChange: onInputChange 호출] → [부모: inputValue 업데이트]
→ [사용자: Enter] → [handleKeyDown: handleSubmit 호출] → [onSend(undefined) 호출]
→ [부모: setInputValue('')] → [textarea 값 빈칸] → [전송 버튼 disabled]
```
기대: 입력 클리어, 부모에 메시지 전달
결과: PASS

#### Flow 2: 파일 첨부 → 전송
```
[사용자: Ctrl+V 이미지] → [handlePaste: 이미지 감지] → [addFiles: 검증 → readFile → 상태 추가]
→ [칩 렌더링] → [사용자: Enter] → [handleSubmit: onSend(attachedFiles) → clearFiles()]
→ [부모: 파일 + 텍스트 수신] → [칩 사라짐]
```
기대: 파일 첨부, 전송, 클리어
결과: PASS

#### Flow 3: 유효하지 않은 파일 거부 → 복구
```
[사용자: .exe 드롭] → [handleDrop → addFiles → validateFile: 실패] → [onValidationError 콜백]
→ [토스트 표시] → [사용자: .png 붙여넣기] → [검증 통과 → 첨부] → [전송 성공]
```
기대: 에러 후 정상 복구
결과: PASS

- 플로우 테스트: 8개 (UnifiedChatInput.flow.qa.test.tsx)
- 통과: 8개, 실패: 0개

---

## 통합 테스트

- 컴포넌트 통합: PASS (GeneralChatView, ChatPanel, PlusMenu, AttachedFileChip, DropZoneOverlay, ModelSwitcher — import/export/Props 호환)
- 빌드 통합: PASS (`npm run build` 성공)
- 타입 호환성: PASS (chat_input 관련 파일 타입 에러 0건. 기존 LiveboardView.tsx, usePPTScenario.ts 에러는 무관)

---

## 접근성 검증

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | ARIA 속성 | PASS | textarea: aria-label, aria-multiline. 전송: aria-label, aria-disabled. Plus menu: aria-label. Group: role="group", aria-label. Hidden inputs: aria-hidden |
| 2 | 키보드 접근성 | PASS | Enter=전송, Shift+Enter=줄바꿈, Tab=포커스 이동. PlusMenu는 Radix 기반 키보드 내비게이션 내장 |
| 3 | 포커스 관리 | PASS | PlusMenu 열기/닫기 시 Radix 기본 포커스 복원. 전송 후 textarea 포커스 미복원은 Minor |
| 4 | 색상 대비 | PASS | 전송 버튼 활성 상태: 대비 4.65:1 (AA 통과). 비활성 상태: WCAG 예외 |
| 5 | aria-live 리전 | N/A | 파일 첨부/제거 시 스크린리더 알림 미구현 (Minor — 후속 구현 가능) |

---

## 발견된 이슈

### 심각도: Critical (배포 차단)
(없음)

### 심각도: Major (수정 강력 권고)
(없음)

### 심각도: Minor (후속 수정 가능)
- [ ] **aria-live 리전 미구현** — 파일 첨부/제거 시 스크린리더에 변경 알림이 없음. `aria-live="polite"` 리전 추가 필요 — `UnifiedChatInput.tsx`
- [ ] **FileReader onerror 미처리** — `useFileAttachment.ts:readFile` 함수에서 `reader.onerror` 핸들러가 없음. 파일 읽기 실패 시 Promise가 resolve되지 않을 수 있음. 발생 확률 극히 낮으나 방어 코드 추가 권장 — `useFileAttachment.ts:68-111`
- [ ] **전송 후 textarea 자동 포커스 복원 없음** — 키보드 전용 사용자가 전송 후 바로 다음 메시지를 입력하려면 클릭이 필요할 수 있음. `handleSubmit` 후 `textareaRef.current?.focus()` 추가 권장 — `UnifiedChatInput.tsx:61-65`

---

## 수정 요청

N/A — PASS 판정이므로 수정 사이클 불필요. Minor 이슈는 후속 사이클에서 처리 가능.

---

## 테스트 요약

| 구분 | 파일 | 테스트 수 | 통과 | 실패 |
|------|------|----------|------|------|
| Dev 단위 테스트 | UnifiedChatInput.test.tsx | 20 | 20 | 0 |
| QA Edge Case | UnifiedChatInput.qa.test.tsx | 18 | 18 | 0 |
| QA Flow | UnifiedChatInput.flow.qa.test.tsx | 8 | 8 | 0 |
| **합계** | **3개 파일** | **46** | **46** | **0** |
