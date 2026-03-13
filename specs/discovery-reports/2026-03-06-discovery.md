# Discovery Report — 2026-03-06

## 스캔 설정

- **모드**: broad
- **시간 범위**: 2026-03-05 ~ 2026-03-06 (1일간)
- **이전 리포트**: 2026-03-05-discovery.md

## 확인한 소스

| # | 소스 | URL | 상태 |
|---|------|-----|------|
| 1 | ChatGPT | help.openai.com/en/articles/6825453-chatgpt-release-notes | 확인 완료 — **Codex App for Windows (Mar 4)**: 병렬 에이전트 실행, isolated worktrees, editable diffs |
| 2 | Claude | releasebot.io/updates/anthropic/claude | 확인 완료 — 변경 없음 (최근: Mar 2 Memory for free users) |
| 3 | Cursor | cursor.com/changelog | 확인 완료 — 변경 없음 (최근: v2.6 Mar 3) |
| 4 | Gemini | gemini.google/release-notes | 확인 완료 — 변경 없음 (최근: Feb 19 Gemini 3.1 Pro) |
| 5 | Windsurf | windsurf.com/changelog | 확인 완료 — 변경 없음 (최근: Feb 26) |
| 6 | Bolt.new | support.bolt.new/release-notes | 확인 완료 — 변경 없음 (최근: Feb 2025) |
| 7 | v0 | v0.dev/changelog | 확인 완료 — 변경 없음 (최근: Mar 4 preview panel, model selection) |
| 8 | GitHub Copilot | github.com/features/copilot/whats-new | 확인 완료 — 변경 없음 (최근: Mar 4 CLI river breakout) |
| 9 | Salesforce Agentforce | salesforce.com/blog | 확인 완료 — 변경 없음 (최근: Feb 25) |
| 10 | MS Copilot Studio | techcommunity.microsoft.com | 확인 완료 — 변경 없음 (Feb 2026 업데이트 지속) |
| 11 | Google Agentspace | docs.cloud.google.com/agentspace/docs/release-notes | 확인 완료 — Mar 4: GitHub 데이터 커넥터, Google Docs/Sheets 내보내기. UI 패턴 무관 |
| 12 | ThoughtSpot | thoughtspot.com/blog | 접근 실패 (콘텐츠 미로드) |
| 13 | Power BI | powerbi.microsoft.com/blog | 확인 완료 — 변경 없음 (최근: Feb 24 Feature Summary) |
| 14 | Hex | hex.tech/blog | 확인 완료 — 변경 없음 (최근: Jan 28 Context Studio) |
| 15 | NNGroup | nngroup.com/articles | 확인 완료 — 변경 없음 (최근: Mar 2) |
| 16 | AG-UI | github.com/ag-ui-protocol/ag-ui/releases | 확인 완료 — 릴리스 없음 |
| 17 | MCP TypeScript SDK | github.com/modelcontextprotocol/typescript-sdk/releases | 확인 완료 — 변경 없음 (최근: v1.27.1 Feb 24) |
| 18 | CopilotKit | github.com/CopilotKit/CopilotKit/releases | 확인 완료 — 변경 없음 (최근: v1.52.1 Feb 27) |
| 19 | LangGraph | github.com/langchain-ai/langgraph/releases | 확인 완료 — 변경 없음 (최근: cli v0.4.14 Mar 2) |
| 20 | CrewAI | github.com/crewAIInc/crewAI/releases | 확인 완료 — v1.10.1 (Mar 4). Gemini GenAI 업그레이드, 버그 수정. UI 패턴 무관 |
| 21 | Vercel AI SDK | github.com/vercel/ai/releases | 확인 완료 — ai@6.0.115-116 (Mar 5). SSRF 방지 보안 패치. UI 패턴 무관 |
| 22 | Open WebUI | github.com/open-webui/open-webui/releases | 확인 완료 — 변경 없음 (최근: v0.8.8 Mar 2) |
| 23 | LobeChat | github.com/lobehub/lobe-chat/releases | 확인 완료 — v2.1.36 (Mar 5). Marketplace API 토큰 주입 수정. UI 패턴 무관 |
| 24 | Chainlit | github.com/Chainlit/chainlit/releases | 확인 완료 — 변경 없음 (최근: v2.9.6 Jan 20) |

## 보충 검색 쿼리

| # | 쿼리 | 결과 수 |
|---|------|--------|
| 1 | "AI agent UI" OR "agentic interface" new feature March 2026 | 10건 |
| 2 | "human-in-the-loop" OR "AI approval" UI pattern March 2026 | 10건 |
| 3 | "conversational AI" OR "chat UI" framework release March 2026 | 10건 |
| 4 | "enterprise AI dashboard" OR "AI copilot admin" March 2026 | 10건 |
| 5 | "AI data visualization" OR "natural language query" dashboard March 2026 | 10건 |

---

## 요약

- 신규 패턴 발견: **0**건
- 개선 필요: **1**건
- 우선순위 변경 제안: **0**건
- 리서치 노후: **0**건
- 폐기 후보: **0**건
- **중복 필터링으로 제외**: **4**건

> 1일간 스캔. 대부분의 소스에서 유의미한 변경 없음. OpenAI Codex App Windows 출시(Mar 4)가 이전 리포트에서 미보고된 항목으로 감지됨 — 병렬 에이전트 실행과 editable diffs 패턴이 multi_agent_orchestration_ui 및 parallel_execution_view와 관련. 보안 패치와 마이너 버그 수정 외에 주요 UI 패턴 변경 없음.

---

## 개선 필요 (UPDATE)

| # | component_id | 현재 상태 | 발견 내용 | 출처 |
|---|-------------|----------|----------|------|
| 1 | multi_agent_orchestration_ui | not_implemented (high) | OpenAI Codex App for Windows (Mar 4) — 다수 Codex 에이전트 병렬 실행, isolated worktrees, editable diffs, 데스크톱/CLI/IDE 간 seamless 전환 | help.openai.com/en/articles/6825453-chatgpt-release-notes |

### 상세

#### UPDATE-1: multi_agent_orchestration_ui

- **현재 구현**: not_implemented. 리서치 완료(2026-03-05), Phase 1 구현 진행 중(useMultiAgentOrchestration + 12 UI 파일). 5가지 패턴 분류(Transparent Supervisor, Visible Orchestrator Tree, Visual Graph Editor, Role-Based Crew Builder, Code-First Command Center).
- **경쟁사 변화**:
  - **OpenAI Codex App for Windows (Mar 4)**: Codex 에이전트를 다수 병렬 실행하는 Windows 네이티브 앱 출시. 각 에이전트가 isolated worktree에서 독립적으로 작업하며, editable diffs로 결과를 검토·수정. 데스크톱 앱, CLI, IDE 간 seamless 워크플로우 전환.
  - **이전 맥락**: Cursor 2.5 비동기 서브에이전트(Feb), GitHub Copilot CLI Handoff(Feb 26)에 이어, OpenAI가 Codex App으로 "병렬 에이전트 실행 + diff 기반 검토" 패턴을 제품화. 3대 코딩 AI 제품(Cursor, Copilot, Codex)이 모두 병렬 에이전트 UI를 출시한 상태.
- **개선 포인트**:
  1. Phase 1 구현 시 "Code-First Command Center" 패턴에 Codex App의 병렬 에이전트 실행 UX 참조 (isolated worktree 개념 → 에이전트별 독립 컨텍스트)
  2. Editable diffs 패턴은 `inline_edit`(diff_review_patterns) 컴포넌트와 연계 가능
  3. 3개 제품(Cursor, Copilot, Codex) 공통 패턴: 에이전트 상태 카드 + 병렬 진행 표시 + diff 기반 결과 검토
- **confidence**: high (3개 주요 제품이 병렬 에이전트 UI 채택)

---

## 중복 필터링 상세 (이전 리포트와 겹침 또는 보고 기준 미달)

| # | 항목 | 이전 리포트 매핑 | 비고 |
|---|------|---------------|------|
| 1 | OpenAI AgentKit/ChatKit (Mar 4) | 2026-03-04 NEW-1 | 이미 보고됨, 추가 진전 없음 |
| 2 | Cursor 2.6 MCP Apps (Mar 3) | 2026-03-05 UPDATE-1 | 이미 보고됨 |
| 3 | MS Agent Dashboard GA | 2026-03-04 누적 | 이미 보고됨, Mar rollout 지속 |
| 4 | Vercel AI SDK 6.0.115-116 (Mar 5) | — | SSRF 보안 패치. UI 패턴 변경 없음. 보고 기준 미달 |

---

## 우선순위 변경 제안 (PRIORITY_CHANGE)

> 이번 스캔에서 새 우선순위 변경 제안 없음.

---

## 리서치 노후 (STALE)

> 현재 노후 항목 없음. 모든 `last_researched` 30일 이내.

---

## 폐기 후보 (DEPRECATED)

> 현재 폐기 후보 없음.

---

## 권장 다음 액션

### 완료 컴포넌트 필터링

완료 컴포넌트 (`status: implemented` + `qa_verdict: PASS`):
- `model_agent_switcher` — 액션 제외
- `usage_monitoring` — 액션 제외
- `generative_ui` — Phase 1 완료. UPDATE 발견 시 **DEFERRED 후보**로 표기

### DEFERRED 후보 (Phase 2 개선)

| # | component_id | 발견 내용 | 비고 |
|---|-------------|----------|------|
| 1 | generative_ui | Cursor MCP Apps → Phase 3 참조 (이전 보고) | QA PASS 완료. Phase 2(A2UI) → Phase 3(MCP Apps) 순서로 개선 예정 |

### 연속 권장 횟수 초기화

- 이번 리포트에서 초기화 대상 없음.

### 액션 테이블

우선순위순으로 정렬:

| # | 액션 | 대상 | 이유 | priority |
|---|------|------|------|----------|
| 1 | `/implement multi_agent_orchestration_ui` | UPDATE-1 + 이전 누적 | 리서치 완료(2026-03-05). Cursor·Copilot·Codex 3대 제품이 병렬 에이전트 UI 출시. 구현 전환 시급. **4회 연속 권장** | **high** |
| 2 | `/research agent_marketplace` | 이전 누적 | Cursor Team Marketplaces 패턴. 기존 skill_management 확장으로 팀 플러그인 거버넌스 설계 | **medium** |
| 3 | `/research usage_monitoring` | 이전 누적 | MS Agent Dashboard GA + GitHub Copilot Metrics GA. Phase 2 기획. **4회 연속 권장** | **medium** |

카탈로그 직접 수정 제안:

| # | component_id | 필드 | 현재 | 제안 |
|---|-------------|------|------|------|
| 1 | multi_agent_orchestration_ui | notes | (기존) | 추가: "OpenAI Codex App Windows (Mar 4): 다수 에이전트 병렬 실행, isolated worktrees, editable diffs. Cursor·Copilot·Codex 3대 제품 모두 병렬 에이전트 UI 출시." |
| 2 | parallel_execution_view | notes | (기존) | 추가: "OpenAI Codex App Windows (Mar 4): 병렬 에이전트 isolated worktree + editable diff 패턴. 3대 코딩 AI(Cursor 2.5, Copilot CLI, Codex App) 공통 채택." |

---

## 누적 액션 추적

### 이전 리포트 (2026-03-05) 권장 액션 실행 여부:

| 리포트 | 액션 | 상태 | 비고 |
|--------|------|------|------|
| 2026-03-05 | `/implement multi_agent_orchestration_ui` | **미실행** | last_researched: 2026-03-05. Phase 1 구현 미전환 |
| 2026-03-05 | `/research agent_marketplace` | **미실행** | 리서치 미착수 |
| 2026-03-05 | `/research usage_monitoring` | **미실행** | last_researched: 2026-03-01. Phase 2 미착수 |
| 2026-03-05 | catalog: generative_ui.notes 추가 (Cursor MCP Apps) | **적용 완료** | 카탈로그에 반영됨 |
| 2026-03-05 | catalog: agent_marketplace.notes 추가 | **적용 완료** | 카탈로그에 반영됨 |
| 2026-03-05 | catalog: agent_marketplace.priority → medium | **적용 완료** | 현재: medium |

### 누적 미실행 (3회 이상 연속 권장):

| 리포트 | 액션 | 연속 권장 횟수 | 비고 |
|--------|------|-------------|------|
| 2026-03-02~03-06 | `/implement multi_agent_orchestration_ui` | **4회** | 리서치 완료. 3대 제품 병렬 에이전트 UI 출시. 구현 시급 |
| 2026-03-03~03-06 | `/research usage_monitoring` | **4회** | Phase 2 기획 필요 |
