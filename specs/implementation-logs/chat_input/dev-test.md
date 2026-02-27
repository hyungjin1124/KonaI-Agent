# Dev Test Report: Chat Input (Multi-modal) — Phase 1 MVP

## 정적 분석
- TypeScript: PASS (0 errors in changed files)
- ESLint: N/A (ESLint config not set up in project)
- Build: PASS (`npm run build` successful)

## 단위 테스트
| # | 테스트명 | 결과 |
|---|---------|------|
| 1 | renders with textarea and send button in default variant | PASS |
| 2 | renders centered variant without border-t | PASS |
| 3 | renders default variant with border-t | PASS |
| 4 | renders plus menu trigger button | PASS |
| 5 | renders ModelSwitcher when showModelSwitcher is true | PASS |
| 6 | does not render ModelSwitcher when showModelSwitcher is false | PASS |
| 7 | textarea has aria-label | PASS |
| 8 | send button has aria-label | PASS |
| 9 | plus menu has aria-label | PASS |
| 10 | calls onSend when Enter is pressed | PASS |
| 11 | does not call onSend when Shift+Enter is pressed | PASS |
| 12 | does not call onSend when input is empty | PASS |
| 13 | send button is disabled when no input | PASS |
| 14 | send button is enabled when there is input | PASS |
| 15 | calls onSend when send button is clicked with input | PASS |
| 16 | handles image paste from clipboard | PASS |
| 17 | removes file chip when X is clicked | PASS |
| 18 | disables textarea and send button when disabled | PASS |
| 19 | calls onValidationError for unsupported file types | PASS |
| 20 | calls onValidationError for oversized files | PASS |

- 총 테스트: 20개
- 통과: 20개, 실패: 0개

## 시나리오 커버리지
| # | 시나리오 | 우선순위 | 테스트 위치 | 결과 |
|---|---------|---------|-----------|------|
| 1 | variant='default' 렌더 → textarea + send 버튼 표시 | must | test:L76-82 | PASS |
| 2 | variant='centered' 렌더 → 중앙 배치 확인 | must | test:L85-89 | PASS |
| 3 | Plus 버튼 클릭 → 메뉴 트리거 확인 | must | test:L96-99 | PASS |
| 4 | Ctrl+V로 이미지 붙여넣기 → 첨부 파일 추가 | must | test:L166-180 | PASS |
| 5 | 파일 제거 버튼 클릭 → 해당 파일 제거 | must | test:L184-203 | PASS |
| 6 | .exe 파일 추가 → 에러 콜백 호출 | must | test:L217-237 | PASS |
| 7 | 15MB 파일 추가 → 에러 콜백 호출 | must | test:L240-263 | PASS |
| 8 | showModelSwitcher=true → ModelSwitcher 렌더 | should | test:L104-114 | PASS |
| 9 | textarea aria-label, 전송 버튼 aria-label | must | test:L120-136 | PASS |
| 10 | Enter 키 → onSend 호출 | must | test:L141-149 | PASS |
| 11 | Shift+Enter → onSend 미호출 | should | test:L152-160 | PASS |

- must 커버리지: 8/8 (100%)
- should 커버리지: 2/2 (100%)

## Acceptance Criteria 자가 검증
| # | Criteria | 코드 구현 | 테스트 커버 | 판정 |
|---|----------|----------|-----------|------|
| 1 | 단일 입력 컴포넌트 | UnifiedChatInput variant prop | tests 1-3 | PASS |
| 2 | + 메뉴 | PlusMenu.tsx (Radix DropdownMenu, 3 항목) | test 4 | PASS |
| 3 | 이미지 클립보드 | useFileAttachment.handlePaste | test 16 | PASS |
| 4 | 첨부 파일 칩 | AttachedFileChip 배열 렌더링 | tests 16-17 | PASS |
| 5 | 복수 파일 지원 | MAX_FILES=5, flex-wrap 레이아웃 | hook 코드 | PASS |
| 6 | 파일 타입 검증 | constants.ts ALLOWED_EXTENSIONS | test 19 | PASS |
| 7 | 파일 크기 제한 | MAX_FILE_SIZE_BYTES=10MB | test 20 | PASS |
| 8 | ModelSwitcher 통합 | showModelSwitcher prop | tests 5-6 | PASS |
| 9 | 접근성 | aria-label, aria-multiline, aria-disabled | tests 7-9 | PASS |

## QA 전달 사항
- + 메뉴의 DropdownMenu 상호작용(클릭 → 파일 선택 다이얼로그 열림)은 JSDOM 한계로 E2E 수준에서 확인 필요
- "웹 링크 추가" 메뉴 항목은 Phase 2에서 구현 예정 (현재 disabled 상태)
- 대시보드 ChatInputArea는 수정하지 않음 — HITL/제안칩 등 대시보드 전용 기능과 결합되어 있어 통합 시 리스크가 큼
- 알려진 제한사항: 이미지 파일 미리보기 썸네일은 dataURL로 저장되나 칩 UI에 실제 렌더링하지 않음 (AttachedFileChip이 아이콘만 표시)
