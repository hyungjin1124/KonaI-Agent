# Fix Request: Tool Call Display

## QA 판정: CONDITIONAL PASS
## 수정 사이클: 1/3

### 수정 항목

- [x] **[Major] React hooks 순서 위반: running → failed 전환 시 "Rendered fewer hooks" 에러** — `src/components/features/agent-chat/components/ToolCall/ToolCallContent.tsx:79,134`

  **문제**: `status === 'failed'` early return (line 79)이 `useMemo` (line 134) 이전에 위치하여, `running` → `failed` 상태 전환 시 hooks 호출 순서가 달라짐. React가 "Rendered fewer hooks than expected" 에러를 발생시킴.

  **수정 방향**: `useMemo` (line 134의 `scenarioTodos`)를 `failed` early return (line 79) **앞으로** 이동. hooks는 항상 컴포넌트 최상위에서 조건 없이 호출되어야 함.

  **검증**: QA 테스트 `ToolCallDisplay.flow.qa.test.tsx`의 "transitions from running → failed causes hooks order violation" 테스트가 이 이슈를 재현. 수정 후 해당 테스트를 정상 전환 검증으로 변경할 것.
