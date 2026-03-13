# Plan: Multi-Agent Orchestration UI

## 접근 방식

리서치 문서의 "Visible Orchestrator + Sidebar Task List 하이브리드" Phase 1 MVP를 구현한다.
데모 프로젝트이므로 시뮬레이션된 멀티 에이전트 실행을 시각적으로 보여주는 것이 핵심이다.

핵심 구현 (이미 완료):
1. **Agent Task List 사이드바** — 에이전트별 상태 카드 리스트
2. **Agent Detail View** — 에이전트 카드 클릭 시 해당 에이전트의 실행 로그
3. **Orchestration Summary Banner** — "N개 에이전트가 작업 중" 요약
4. **시뮬레이션 Hook** — 복수 에이전트 병렬/순차 시뮬레이션

추가 구현 (통합 작업):
5. **전용 라우트** — `/agent/orchestration` 페이지
6. **Dashboard 트리거** — ChatInterface에서 키워드 감지 → 라우트 이동
7. **AgentChatView 통합** — 시나리오 라우팅, completion handler, done response
8. **MultiAgentDoneResponse** — 히스토리 메시지 전용 완료 뷰

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `src/components/features/multi-agent/types.ts` | 멀티 에이전트 타입 정의 | 기존 |
| `src/components/features/multi-agent/constants.ts` | 에이전트 메타데이터 + 시뮬레이션 시나리오 | 기존 |
| `src/components/features/multi-agent/useMultiAgentOrchestration.ts` | 멀티 에이전트 오케스트레이션 Hook | 기존 |
| `src/components/features/multi-agent/AgentTaskCard.tsx` | 개별 에이전트 상태 카드 | 기존 |
| `src/components/features/multi-agent/AgentTaskList.tsx` | 에이전트 리스트 섹션 | 기존 |
| `src/components/features/multi-agent/AgentDetailView.tsx` | 선택된 에이전트의 상세 실행 로그 | 기존 |
| `src/components/features/multi-agent/OrchestrationSummaryBanner.tsx` | 요약 배너 | 기존 |
| `src/components/features/multi-agent/HandoffIndicator.tsx` | 핸드오프 시각적 인디케이터 | 기존 |
| `src/components/features/multi-agent/AgentResultsSummary.tsx` | 전체 완료 후 결과 종합 뷰 | 기존 |
| `src/components/features/multi-agent/MultiAgentScenarioRenderer.tsx` | 메인 오케스트레이션 컴포넌트 | 기존 |
| `src/components/features/multi-agent/index.ts` | 모듈 export | 기존 |
| `src/components/features/multi-agent/MultiAgentOrchestration.test.tsx` | 테스트 | 기존 |
| `src/app/agent/orchestration/page.tsx` | 전용 라우트 페이지 | **신규** |
| `src/components/features/agent-chat/components/AgentResponse/MultiAgentDoneResponse.tsx` | 히스토리용 Done 응답 | **신규** |
| `src/components/features/agent-chat/AgentChatView.tsx` | 시나리오 라우팅 + 트리거 | **수정** |
| `src/components/ChatInterface.tsx` | Dashboard 트리거 감지 | **수정** |
| `src/app/page.tsx` | Dashboard → 오케스트레이션 라우팅 | **수정** |
| `src/types/context.types.ts` | AppViewMode 타입 확장 | **수정** |
| `src/context/ScenarioContext.tsx` | 시나리오 트리거 처리 | **수정** |

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | 2개 이상 에이전트 동시 실행, 사이드바 리스트로 시각적 구분 | AgentTaskList + useMultiAgentOrchestration |
| 2 | 에이전트 카드에 이름/역할 아이콘/상태 배지 실시간 전환 | AgentTaskCard |
| 3 | 에이전트 카드에 현재 작업 설명 실시간 업데이트 | AgentTaskCard (currentAction) |
| 4 | 에이전트 카드 클릭 시 상세 실행 로그 전환 | AgentDetailView |
| 5 | 핸드오프 시 시각적 인디케이터 | HandoffIndicator |
| 6 | 전체 완료 후 결과 종합 뷰 | AgentResultsSummary |
| 7 | 실패 에이전트 에러 표시 + 재시도 | AgentTaskCard (error state) + retryAgent |
| 8 | 채팅에 "N개 에이전트 작업 중" 요약 | OrchestrationSummaryBanner |
| 9 | 시나리오 트리거 가능 | 채팅 키워드 + 전용 라우트 + Dashboard 트리거 |

## 테스트 시나리오

| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | AC1 | 4개 에이전트 시나리오 시작 → 사이드바에 4개 카드 렌더링 확인 | RTL render + queryAllByRole | must |
| 2 | AC2 | 에이전트 상태 pending→running→completed 전환 시 배지 변경 확인 | RTL rerender + getByText | must |
| 3 | AC3 | running 에이전트의 currentAction이 업데이트되면 화면 반영 확인 | RTL getByText | must |
| 4 | AC4 | 에이전트 카드 클릭 → selectedAgentId 변경 + 상세 뷰 렌더링 | userEvent.click + queryByTestId | must |
| 5 | AC5 | 핸드오프 이벤트 발생 → HandoffIndicator 렌더링 확인 | RTL getByText(reason) | must |
| 6 | AC6 | 모든 에이전트 완료 → AgentResultsSummary 렌더링 확인 | RTL queryByText("결과 종합") | must |
| 7 | AC7 | failed 에이전트 → 에러 메시지 표시 + 재시도 버튼 존재 | RTL getByRole('button', { name: /재시도/ }) | must |
| 8 | AC8 | orchestration running → "N개 에이전트가 작업 중" 배너 표시 | RTL getByText(/작업 중/) | must |
| 9 | - | smoke test: 기본 렌더링 확인 | RTL render without crash | must |
| 10 | - | Hook 단독 테스트: startOrchestration 후 상태 전환 | renderHook + act | should |
