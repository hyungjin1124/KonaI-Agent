# Dev Test Report: Session Branching / Forking

## 정적 분석
- TypeScript: **PASS** (general-chat 디렉토리 에러 0건, 프로젝트 기존 에러는 liveboard/multi-agent/hooks 등 비관련 파일)
- ESLint: **SKIP** (프로젝트에 eslint 설정 파일 없음)
- Build: **PASS** (`npm run build` 성공)

## 단위 테스트

| # | 테스트명 | 결과 |
|---|---------|------|
| 1 | 초기 상태: primary 분기 1개, 메시지 0개 | PASS |
| 2 | AC1: 메시지가 있는 상태에서 createBranch 호출 → 새 분기 생성 | PASS |
| 3 | AC1: 커스텀 이름으로 분기 생성 | PASS |
| 4 | AC2: 3개 메시지 후 2번째에서 분기 → 분기에 1,2번 메시지만 포함 | PASS |
| 5 | AC2: 분기된 메시지의 branchId가 새 분기 ID로 변경됨 | PASS |
| 6 | AC6: switchBranch 호출 → activeMessages 변경 | PASS |
| 7 | AC6: 존재하지 않는 branchId로 switchBranch → 무시 | PASS |
| 8 | AC7: deleteBranch 호출 → branches에서 제거, primary로 전환 | PASS |
| 9 | AC7: 비활성 분기 삭제 → 활성 분기 유지 | PASS |
| 10 | 엣지: 빈 세션에서 createBranch → 무시 | PASS |
| 11 | 엣지: primary 분기 삭제 불가 | PASS |
| 12 | 엣지: 분기 이름 충돌 시 자동 번호 부여 | PASS |
| 13 | addMessage: 활성 분기에 추가, messageCount 증가 | PASS |
| 14 | addMessage: branchId 자동 설정 | PASS |
| 15 | getBranchesAtMessage / hasBranches: 분기점에서 분기 목록 반환 | PASS |
| 16 | renameBranch: 분기 이름 변경 | PASS |
| 17 | resetBranching: 초기 상태로 리셋 | PASS |
| 18 | BranchIndicator: 렌더링 시 분기 수 배지 표시 | PASS |
| 19 | BranchIndicator AC3: GitBranch 아이콘과 분기 수 표시 | PASS |
| 20 | BranchIndicator AC4: 버튼 클릭 → 팝오버에 분기 목록 표시 | PASS |
| 21 | BranchIndicator AC4: 분기 클릭 → onSwitchBranch 호출 + 팝오버 닫힘 | PASS |
| 22 | BranchIndicator AC4: 활성 분기에 하이라이트 표시 | PASS |
| 23 | BranchIndicator: "새 분기 만들기" 클릭 → onCreateBranch 호출 | PASS |
| 24 | BranchIndicator: non-primary 분기 삭제 → onDeleteBranch 호출 | PASS |
| 25 | BranchIndicator: primary 분기에는 삭제 버튼 없음 | PASS |
| 26 | BranchIndicator: 배지 재클릭 → 팝오버 닫힘 | PASS |
| 27 | BranchIndicator: 각 분기의 메시지 수 표시 | PASS |

- 총 테스트: **27**개
- 통과: **27**개, 실패: **0**개

## 시나리오 커버리지

| # | 시나리오 | 우선순위 | 테스트 위치 | 결과 |
|---|---------|---------|-----------|------|
| 1 | AC1: 분기 생성 | must | useBranching.test.ts:L29-66 | PASS |
| 2 | AC2: 이력 보존 | must | useBranching.test.ts:L68-103 | PASS |
| 3 | AC3: 인디케이터 | must | BranchIndicator.test.tsx:L58-66 | PASS |
| 4 | AC4: 분기 전환 | must | BranchIndicator.test.tsx:L68-119 | PASS |
| 5 | AC5: 사이드바 분기 | must | (코드 확인 완료, 전용 테스트 없음) | PARTIAL |
| 6 | AC6: 메시지 갱신 | must | useBranching.test.ts:L105-145 | PASS |
| 7 | AC7: 분기 삭제 | must | useBranching.test.ts:L147-193 | PASS |
| 8 | AC8: 키보드 | should | (코드 확인 완료, 전용 테스트 없음) | PARTIAL |
| 9 | AC9: 삭제 확인 | should | Phase 2 연기 | DEFERRED |
| 10 | 엣지: 빈 세션 | should | useBranching.test.ts:L195-207 | PASS |
| 11 | 엣지: primary 삭제 | should | useBranching.test.ts:L209-218 | PASS |
| 12 | 엣지: 이름 충돌 | could | useBranching.test.ts:L220-240 | PASS |

- must 커버리지: **6/7** (86%)
- should 커버리지: **2/4** (50%)
- could 커버리지: **1/1** (100%)

## Acceptance Criteria 자가 검증

| # | Criteria | 코드 구현 | 테스트 커버 | 판정 |
|---|----------|----------|-----------|------|
| AC1 | 분기 생성 액션 트리거 | ChatPanel.tsx:L190-199 | useBranching.test.ts | PASS |
| AC2 | 분기 시 대화 이력 보존 | useBranching.ts:L76-109 | useBranching.test.ts | PASS |
| AC3 | 분기 시각적 인디케이터 | BranchIndicator.tsx:L40-47 | BranchIndicator.test.tsx | PASS |
| AC4 | 분기 목록 표시 + 전환 | BranchIndicator.tsx:L49-104 | BranchIndicator.test.tsx | PASS |
| AC5 | LeftSidebar 분기 표시 | LeftSidebar.tsx:L102-114 | (전용 테스트 없음) | PARTIAL |
| AC6 | 분기 전환 시 메시지 갱신 | useBranching.ts:L50-53,111-118 | useBranching.test.ts | PASS |
| AC7 | 분기 삭제 | useBranching.ts:L120-140 | useBranching.test.ts | PASS |
| AC8 | 키보드 단축키 | GeneralChatView.tsx:L117-143 | (전용 테스트 없음) | PARTIAL |
| AC9 | Undo 지원 | Phase 2 연기 | N/A | DEFERRED |

## QA 전달 사항
- AC5 (LeftSidebar 분기 표시): 코드 구현 완료. LeftSidebar 컴포넌트는 다수의 외부 의존성(ChatSessionItem, 아이콘 등)이 있어 별도 통합 테스트에서 검증 권장.
- AC8 (키보드 단축키): GeneralChatView에서 window keydown 이벤트로 구현됨. E2E 또는 통합 테스트에서 검증 권장.
- AC9 (Undo 지원): Phase 2로 연기됨. MVP에서는 삭제 확인 dialog 미구현 상태.
- 알려진 제한사항: 분기 데이터는 메모리 상태로만 관리 (서버 영속화 미구현, Phase 2).
