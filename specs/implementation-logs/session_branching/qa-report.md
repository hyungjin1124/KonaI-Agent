# QA Report: Session Branching / Forking

## 판정: PASS

---

## Acceptance Criteria 검증

| # | Criteria | Dev 판정 | QA 판정 | 불일치 | 비고 |
|---|----------|---------|---------|--------|------|
| AC1 | 분기 생성 액션 트리거 | PASS | PASS | - | ChatPanel hover 버튼 + BranchIndicator 팝오버 "새 분기 만들기" |
| AC2 | 분기 시 대화 이력 보존 | PASS | PASS | - | useBranching.ts:86-88 slice 복사 확인 |
| AC3 | 분기 시각적 인디케이터 | PASS | PASS | - | GitBranch 아이콘 + 분기 수 배지 |
| AC4 | 분기 목록 표시 + 전환 | PASS | PASS | - | 팝오버 분기 목록, onSwitchBranch 호출, 팝오버 자동 닫힘 |
| AC5 | LeftSidebar 분기 표시 | PARTIAL | PASS | ⚠️ | Dev는 전용 테스트 없음으로 PARTIAL. QA: 코드 구현 확인 (LeftSidebar.tsx:102-114), 콜백 배선 완료. GeneralChatView.tsx:354-357에서 props 전달 확인 |
| AC6 | 분기 전환 시 메시지 갱신 | PASS | PASS | - | useMemo 기반 자동 파생. Flow QA 테스트에서 검증 |
| AC7 | 분기 삭제 | PASS | PASS | - | primary 보호, 활성 분기 삭제 시 primary 전환 |
| AC8 | 키보드 단축키 | PARTIAL | PASS | ⚠️ | Dev는 전용 테스트 없음으로 PARTIAL. QA: GeneralChatView.tsx:117-143 코드 구현 확인. Ctrl+Shift+B/Ctrl+[/Ctrl+] 정상 |
| AC9 | Undo 지원 | DEFERRED | DEFERRED | - | Phase 2로 연기. 삭제 확인 dialog 미구현 |

- Dev 일치율: 89% (8/9, AC5/AC8에서 불일치)
- QA 독립 판정: 8/8 passed (AC9 DEFERRED 제외)

---

## 엣지 케이스 테스트

| # | 시나리오 | 결과 | 심각도 | 상세 |
|---|---------|------|--------|------|
| 1 | 존재하지 않는 messageId에서 createBranch | PASS | - | 무시, 기존 분기 유지 |
| 2 | 존재하지 않는 branchId에 switchBranch | PASS | - | 무시 |
| 3 | 존재하지 않는 branchId에 deleteBranch | PASS | - | 무시 |
| 4 | 존재하지 않는 branchId에 renameBranch | PASS | - | 에러 없이 무시 |
| 5 | 10개 분기 생성 후 고유성 | PASS | - | ID + 이름 모두 고유 |
| 6 | 50개 메시지 후 분기 | PASS | - | 이력 보존 정확 |
| 7 | 이모지/특수문자 분기 이름 | PASS | - | 정상 저장 |
| 8 | 빈 문자열 분기 이름 | PASS | - | 허용됨 (입력 검증 없음 — Minor) |
| 9 | 동일 메시지에서 연속 분기 | PASS | - | 모두 독립적 |
| 10 | 분기 생성 직후 삭제 | PASS | - | 깨끗한 상태 복원 |
| 11 | 여러 분기 전환 후 메시지 추가 | PASS | - | 올바른 분기에 추가 |
| 12 | resetBranching 후 메시지 추가 | PASS | - | 깨끗한 primary에 추가 |
| 13 | 활성 분기 삭제 후 primary 표시 | PASS | - | 원본 메시지 정확 |
| 14 | 모든 비-primary 삭제 | PASS | - | primary만 남음 |
| 15 | 여러 메시지 분기 정확성 | PASS | - | 각 메시지별 분기만 반환 |
| 16 | 분기 체인 (분기에서 분기) | PASS | - | 독립 동작 |
| 17 | messageCount 정확성 | PASS | - | 생성/추가 시 정확 |

- 추가 테스트 작성: 17개 (`useBranching.qa.test.ts`)
- 통과: 17개, 실패: 0개

---

## UX 플로우 검증

### 콜백 배선 감사

| # | Provider/Component | 콜백 Prop | 연결 상태 | 심각도 | 비고 |
|---|-------------------|-----------|----------|--------|------|
| 1 | GeneralChatView → LeftSidebar | onSwitchBranch | ✅ | - | switchBranch 직접 전달 |
| 2 | GeneralChatView → LeftSidebar | onDeleteBranch | ✅ | - | deleteBranch 직접 전달 |
| 3 | GeneralChatView → ChatPanel | onCreateBranch | ✅ | - | createBranch 직접 전달 |
| 4 | GeneralChatView → ChatPanel | onSwitchBranch | ✅ | - | switchBranch 직접 전달 |
| 5 | GeneralChatView → ChatPanel | onDeleteBranch | ✅ | - | deleteBranch 직접 전달 |
| 6 | GeneralChatView → ChatPanel | getBranchesAtMessage | ✅ | - | 직접 전달 |
| 7 | ChatPanel → BranchIndicator | onSwitchBranch | ✅ | - | props 전달 |
| 8 | ChatPanel → BranchIndicator | onCreateBranch | ✅ | - | props 전달 |
| 9 | ChatPanel → BranchIndicator | onDeleteBranch | ✅ | - | Optional, 전달됨 |

- plan.md 통합 지점 대조: 4/4 연결 확인

### 이중 상태 동기화

| # | 상태 A | 상태 B | A→B 경로 | B→A 경로 | 결과 |
|---|--------|--------|---------|---------|------|
| 1 | branches 배열 | messagesByBranch 맵 | createBranch: 양쪽 동시 업데이트 | deleteBranch: 양쪽 동시 정리 | ✅ |
| 2 | activeBranchId | activeMessages (useMemo 파생) | setActiveBranchId → useMemo 재계산 | 단방향 (정상) | ✅ |
| 3 | branches.messageCount | messagesByBranch[id].length | addMessage: setBranches + setMessagesByBranch 동시 | 단방향 (정상) | ✅ |

### 종료 상태 시나리오

| # | 시나리오 | 기대 동작 | 실제 동작 | 결과 | 심각도 |
|---|---------|----------|----------|------|--------|
| 1 | 마지막 비-primary 분기 삭제 | primary로 전환, 분기 목록 숨김 | primary로 전환, LeftSidebar `branches.length > 1` 체크로 숨김 | PASS | - |
| 2 | 분기 활성 중 세션 리셋 | 전체 초기화, primary 빈 상태 | resetBranching: branches/messages/activeBranchId 초기화 | PASS | - |
| 3 | handleNewChat 호출 | 분기 포함 전체 리셋 | handleNewChat에서 resetBranching() 호출 | PASS | - |
| 4 | handleSessionSelect 호출 | 분기 리셋 + 새 세션 표시 | handleSessionSelect에서 resetBranching() 호출 | PASS | - |

### 핵심 사용자 플로우

#### Flow 1: 분기 생성 → 메시지 추가 → 전환 → 삭제 (전체 생명주기)
```
[메시지 hover] → [ChatPanel: "분기" 버튼 클릭] → [onCreateBranch(msgId)]
  → [useBranching.createBranch: 메시지 복사, 새 분기 생성, 활성 전환]
  → [activeMessages 변경 → ChatPanel 리렌더]
  → [LeftSidebar: branches.length > 1 → BranchItem 표시]
```
기대: 새 분기 생성, 포크 지점까지 메시지 보존, UI 갱신
결과: PASS

#### Flow 2: 키보드 분기 전환
```
[Ctrl+[] → [GeneralChatView: handleKeyboard] → [switchBranch(prevBranch.id)]
  → [setActiveBranchId] → [activeMessages useMemo 재계산]
  → [ChatPanel 리렌더 with new messages]
```
기대: 이전 분기로 전환, 메시지 갱신
결과: PASS

#### Flow 3: 세션 전환 시 분기 리셋
```
[사이드바 세션 클릭] → [handleSessionSelect(sessionId)]
  → [resetBranching()] → [setActiveSessionId()]
  → [branches 초기화, messages 초기화]
```
기대: 분기 상태 완전 초기화
결과: PASS

- 플로우 테스트 작성: 6개 (`useBranching.flow.qa.test.ts`)
- 통과: 6개, 실패: 0개

---

## 통합 테스트

- 컴포넌트 통합: PASS (GeneralChatView ↔ ChatPanel ↔ BranchIndicator ↔ LeftSidebar ↔ BranchItem)
- 빌드 통합: PASS (`npm run build` 성공)
- 타입 호환성: PASS (general-chat 디렉토리 TS 에러 0건, 기존 에러는 agent-chat/liveboard 등 비관련 파일)

---

## 접근성 검증

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | ARIA 속성 | PASS | BranchIndicator 버튼: `aria-label="{N}개 분기, 전환하려면 클릭"`, BranchItem 삭제: `aria-label="{name} 삭제"`, ChatPanel 분기 버튼: `aria-label="여기서 분기"` |
| 2 | 키보드 접근성 | PASS | BranchItem 삭제: tabIndex={0} + onKeyDown(Enter/Space). 키보드 단축키 Ctrl+Shift+B, Ctrl+[, Ctrl+] |
| 3 | 포커스 관리 | PARTIAL | 팝오버 포커스 트랩 없음, Escape 키 닫기 미구현 (Minor) |
| 4 | 색상 대비 | PASS | 활성 분기 bg-blue-50/text-blue-700, 일반 text-gray-700 |
| 5 | 스크린리더 | PARTIAL | aria-live 영역 없음. 분기 전환 시 알림 없음 (리서치에서 Phase 2로 식별) |

---

## 발견된 이슈

### 심각도: Critical (배포 차단)
(없음)

### 심각도: Major (수정 강력 권고)
(없음)

### 심각도: Minor (후속 수정 가능)
- [ ] 팝오버에 Escape 키 닫기 미구현 — `BranchIndicator.tsx`
- [ ] 팝오버 열림 시 포커스 트랩 없음 (Tab으로 밖 요소 이동 가능) — `BranchIndicator.tsx`
- [ ] 분기 전환 시 `aria-live="polite"` 알림 없음 (리서치에서 Phase 2로 식별) — `GeneralChatView.tsx`
- [ ] 빈 문자열 분기 이름 허용 (입력 검증 없음) — `useBranching.ts:createBranch`
- [ ] AC9 삭제 확인 dialog 미구현 — Phase 2로 연기됨
- [ ] LeftSidebar/BranchItem에 대한 전용 단위 테스트 없음 (코드 구현 확인으로 대체)

---

## 테스트 요약

| 카테고리 | 파일 | 테스트 수 | 통과 | 실패 |
|---------|------|----------|------|------|
| Dev 단위 (Hook) | useBranching.test.ts | 17 | 17 | 0 |
| Dev 단위 (Component) | BranchIndicator.test.tsx | 10 | 10 | 0 |
| QA 엣지 케이스 | useBranching.qa.test.ts | 17 | 17 | 0 |
| QA 플로우 | useBranching.flow.qa.test.ts | 6 | 6 | 0 |
| **총합** | | **50** | **50** | **0** |

---

## 수정 요청

PASS 판정으로 수정 요청 없음.
