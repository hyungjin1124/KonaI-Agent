# Discovery Report — 2026-03-11

## 스캔 설정

- **모드**: broad
- **시간 범위**: 2026-03-06 ~ 2026-03-11 (5일간)
- **이전 리포트**: 2026-03-06-discovery.md

## 확인한 소스


| #   | 소스                    | URL                                            | 상태                                                                                                                                                                              |
| --- | --------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ChatGPT               | releasebot.io/updates/openai                   | 확인 완료 — **Skills Beta (Mar 6)**: 재사용 가능 워크플로우 지침, 워크스페이스 공유, 관리자 역할 제어. **Codex 0.113.0 (Mar 10)**: request_permissions 도구 + 런타임 승인 UI                                          |
| 2   | Claude                | releasebot.io/updates/anthropic/claude-code    | 확인 완료 — **Claude Code 2.1.70-72 (Mar 6-10)**: 노력 수준 심볼 UX 개선, ExitWorktree 도구, /loop 명령, /mcp 네이티브 관리 다이얼로그                                                                     |
| 3   | Cursor                | cursor.com/changelog                           | 확인 완료 — 변경 없음 (최근: v2.6 Mar 3)                                                                                                                                                  |
| 4   | Gemini                | gemini.google/release-notes                    | 확인 완료 — 변경 없음 (최근: Feb 19)                                                                                                                                                      |
| 5   | Windsurf              | windsurf.com/changelog                         | 확인 완료 — **v1.9577.24 (Mar 9)**: Cascade UI 렌더링 최적화, SKILL.md 지원, Jupyter Notebook Diff Zone 개선                                                                                  |
| 6   | Bolt.new              | support.bolt.new/release-notes                 | 확인 완료 — 변경 없음 (Mar 6-11 내 신규 없음)                                                                                                                                                |
| 7   | v0                    | v0.dev/changelog                               | 확인 완료 — **(Mar 9-10)**: Custom Design System 에디터 개선, Nuxt/Nuxt UI 지원 추가, Usage 페이지 토큰 비용 tooltip                                                                                |
| 8   | GitHub Copilot        | releasebot.io/updates/github                   | 확인 완료 — **VS Code v1.110 (Mar 6)**: Conversation branching(fork) UI, 에이전트 플러그인, Figma MCP Server, 공유 에이전트 메모리, 모델 피커 리디자인. **CLI v1.0.3 (Mar 9)**: Extensions, 백그라운드 작업 타임라인 알림 |
| 9   | Salesforce Agentforce | salesforce.com/news                            | 확인 완료 — **Agentforce Contact Center (Mar 10)**: AI-to-human seamless 핸드오프, 통합 음성+디지털+CRM+AI                                                                                     |
| 10  | MS Copilot Studio     | techcommunity.microsoft.com                    | 확인 완료 — **M365 Agent 사용량 리포트** Mar 출시 예정. Agent 365 본 GA는 May 1                                                                                                                 |
| 11  | Google Agentspace     | cloud.google.com/agentspace/docs/release-notes | 확인 완료 — **Data Insights Agent GA (Mar 10)**: BigQuery 데이터 인사이트 에이전트 정식 출시(allowlist)                                                                                            |
| 12  | ThoughtSpot           | thoughtspot.com/blog                           | 확인 완료 — **Mar 10**: "The New Operating Model for Analytics" 리포트 발표. UI 패턴 직접 무관                                                                                                 |
| 13  | Power BI              | powerbi.microsoft.com/blog                     | 확인 완료 — 변경 없음 (최근: Feb 24)                                                                                                                                                      |
| 14  | Hex                   | hex.tech/blog                                  | 확인 완료 — 변경 없음 (최근: Mar 3)                                                                                                                                                       |
| 15  | NNGroup               | nngroup.com/articles                           | 확인 완료 — **"GenUI In Real Life: Buttons and Checkboxes"** 게시. Claude AskUserQuestion, Google AI Mode 체크박스 사례 분석                                                                  |
| 16  | AG-UI                 | github.com/ag-ui-protocol/ag-ui                | 확인 완료 — 릴리스 없음. 활발한 커밋 진행 중 (Mar 10: Mastra 단위 테스트, Python SDK 프리릴리스)                                                                                                           |
| 17  | MCP TypeScript SDK    | github.com/modelcontextprotocol/typescript-sdk | 확인 완료 — 변경 없음 (최근: v1.27.1 Feb 24)                                                                                                                                              |
| 18  | CopilotKit            | github.com/CopilotKit/CopilotKit               | 확인 완료 — **v1.53.0 (Mar 6)**: AG-UI + MCP 미들웨어 1등 시민 지원, AI SDK v5→v6 전환, onError 콜백 추가                                                                                          |
| 19  | LangGraph             | github.com/langchain-ai/langgraph              | 확인 완료 — **v1.1.0 (Mar 10)**: Type-safe StreamPart discriminated union, GraphOutput 객체 도입                                                                                        |
| 20  | CrewAI                | github.com/crewAIInc/crewAI                    | 확인 완료 — 변경 없음 (최근: v1.10.1 Mar 4)                                                                                                                                               |
| 21  | Vercel AI SDK         | github.com/vercel/ai                           | 확인 완료 — [ai@6.0.125](mailto:ai@6.0.125) (Mar 10). @ai-sdk/gateway 업데이트, Google Gemini 임베딩 지원. UI 패턴 무관                                                                          |
| 22  | Open WebUI            | github.com/open-webui/open-webui               | 확인 완료 — **v0.8.9 (Mar 8)**: 채팅 내 파일 브라우저(Jupyter/DOCX/XLSX/PPTX/JSON 프리뷰), 스트리밍 마크다운 최적화, Artifacts 메모리 누수 수정. **v0.8.10 (Mar 9)**: OIDC 커스텀 로그아웃, 안정화                          |
| 23  | LobeChat              | github.com/lobehub/lobe-chat                   | 확인 완료 — **v2.1.38 (Mar 6)**: Electron 페이지 탭, Telegram 봇 연동, reasoning→tool call 애니메이션 수정, GPT-5.4/Gemini 3.1 Flash Lite 모델 추가. v2.1.39 (Mar 9): DB 마이그레이션                       |
| 24  | Chainlit              | github.com/Chainlit/chainlit                   | 확인 완료 — v2.10.0 (Mar 5). 스캔 범위 직전                                                                                                                                               |


## 보충 검색 쿼리


| #   | 쿼리                                                                         | 결과 수 |
| --- | -------------------------------------------------------------------------- | ---- |
| 1   | "AI agent UI" OR "agentic interface" new feature "March 2026"              | 10건  |
| 2   | "human-in-the-loop" OR "AI approval" UI pattern "March 2026"               | 10건  |
| 3   | "conversational AI" OR "chat UI" framework release "March 2026"            | 10건  |
| 4   | "enterprise AI dashboard" OR "AI copilot admin" "March 2026"               | 10건  |
| 5   | "AI data visualization" OR "natural language query" dashboard "March 2026" | 10건  |


---

## 요약

- 신규 패턴 발견: **0**건
- 개선 필요: **4**건
- 우선순위 변경 제안: **0**건
- 리서치 노후: **0**건
- 폐기 후보: **0**건
- **중복 필터링으로 제외**: **11**건

> 5일간 스캔. GitHub Copilot VS Code v1.110(Mar 6)에서 대화 분기(fork) UI를 정식 출시하여 session_branching 구현의 참조 사례 확보. Salesforce Agentforce Contact Center(Mar 10)의 AI-to-human seamless 핸드오프 패턴이 기존 approval_rejection 개선에 참조 가치. NNGroup GenUI 연구가 generative_ui Phase 1 구현을 독립적으로 검증. OpenAI Codex의 request_permissions 런타임 승인 UI가 approval_rejection의 Phase 2 개선에 참조 가능. CopilotKit v1.53.0이 AG-UI+MCP 미들웨어를 1등 시민으로 지원, multi_agent_orchestration_ui 구현 시 참조. Open WebUI v0.8.9의 채팅 내 파일 브라우저+다형 프리뷰 패턴이 Artifact Panel 확장에 참고 가능.

---

## 개선 필요 (UPDATE)


| #   | component_id                 | 현재 상태                    | 발견 내용                                                                                                                                                             | 출처                                                 |
| --- | ---------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 1   | approval_rejection           | implemented (critical)   | OpenAI Codex 0.113.0 (Mar 10): 빌트인 `request_permissions` 도구 + 런타임 승인 UI. Salesforce Agentforce Contact Center (Mar 10): AI-to-human seamless 핸드오프, 전체 대화 기록 즉시 전달 | releasebot.io/updates/openai, salesforce.com/news  |
| 2   | generative_ui                | implemented + QA PASS    | NNGroup "GenUI In Real Life" 연구 발표: Claude AskUserQuestion 위젯, Google AI Mode 체크박스를 GenUI 우수 사례로 분석. 마찰 감소, 가드레일(최대 4개 질문), 맥락적 타이밍 권장                            | nngroup.com/articles/genui-buttons-and-checkboxes/ |
| 3   | multi_agent_orchestration_ui | not_implemented (high)   | CopilotKit v1.53.0 (Mar 6): AG-UI + MCP 미들웨어를 런타임에서 직접 활성화 가능. AI SDK v6 전환. 에이전트 UI 프로토콜 연동 간소화                                                                  | github.com/CopilotKit/CopilotKit/releases          |
| 4   | session_branching            | not_implemented (medium) | GitHub Copilot VS Code v1.110 (Mar 6): Conversation branching(fork) from checkpoints — 대화 중간 지점에서 분기하여 다른 방향 탐색. 공유 에이전트 메모리                                      | releasebot.io/updates/github                       |


### 상세

#### UPDATE-1: approval_rejection

- **현재 구현**: implemented (QA 미완). 3-tier risk-based rendering (toast/inline/modal), MCP Elicitation schema form, multi-item approval, session permission.
- **경쟁사 변화**:
  - **OpenAI Codex 0.113.0 (Mar 10)**: `request_permissions` 도구를 빌트인으로 제공. 런타임에 도구 실행 전 승인 UI 자동 표시. 파괴적 명령(rm -rf 등)은 자동 블록, 안전 명령(ls 등)은 자동 승인. 사용자 패턴 기억 기능으로 반복 승인 불필요.
  - **Salesforce Agentforce Contact Center (Mar 10)**: AI 에이전트→인간 에이전트 핸드오프 시 전체 대화 이력과 고객 정보를 즉시 전달. 핸드오프 지점에서 컨텍스트 손실 없는 seamless 전환.
- **개선 포인트**:
  1. Codex의 "사용자 패턴 기억" 패턴 → session permission 확장으로 구현 가능
  2. Agentforce의 "컨텍스트 보존 핸드오프" → approval 거절 시 에이전트에게 전달하는 컨텍스트 강화
- **confidence**: medium (2개 제품에서 유사 패턴 개선)

#### UPDATE-2: generative_ui (DEFERRED 후보)

> **참고 — Open WebUI v0.8.9 (Mar 8) 관련**: 채팅 내 파일 브라우저에서 Jupyter Notebook, DOCX, XLSX, PPTX, JSON 트리뷰, Mermaid 다이어그램 등을 인라인 프리뷰. Artifacts 메모리 누수/무한 반응형 루프 수정. 스트리밍 마크다운 최적화 (콘텐츠 미변경 시 재파싱 스킵). 이 패턴들은 Artifact Panel 확장 및 Generative UI 안정화에 직접 참고 가능.

- **현재 구현**: Phase 1 MVP 완료 (QA PASS 2026-03-04). 8종 컴포넌트 type dispatch, JSON 검증, ArtifactPanel 통합.
- **UX 리서치 검증**:
  - **NNGroup "GenUI In Real Life: Buttons and Checkboxes"**: AI 채팅 내에서 체크박스, 버튼, 폼 필드 등 전통적 UI 요소를 맥락적으로 생성하는 것이 GenUI의 가장 실질적 진전으로 평가. Claude의 AskUserQuestion 위젯을 우수 사례로 분석.
  - **핵심 가이드라인**: (1) 마찰 감소가 핵심 가치, (2) 최대 4개 질문 가드레일, (3) 친숙한 UI 패턴 활용, (4) 사용자를 프롬프트 엔지니어로 만들지 말 것.
- **KonaI-Agent 관련성**: Phase 1의 8종 컴포넌트가 NNGroup 권장 사항과 대체로 일치. Phase 2(A2UI 호환)에서 "맥락적 타이밍" 로직 강화 시 참조.
- **confidence**: high (업계 UX 권위 기관의 직접 검증)

#### UPDATE-3: multi_agent_orchestration_ui

- **현재 구현**: not_implemented. 리서치 완료(2026-03-06), 5가지 패턴 분류.
- **프레임워크 변화**:
  - **CopilotKit v1.53.0 (Mar 6)**: AG-UI 프로토콜과 MCP 미들웨어를 CopilotKit 런타임에서 직접 활성화 가능. `feat: enable mcp and a2ui middleware directly from copilotkit runtime`. AI SDK v5→v6 전환 완료. 에이전트 UI 프로토콜 연동이 "미들웨어 추가" 한 줄로 간소화.
  - **LangGraph 1.1.0 (Mar 10)**: Type-safe `StreamPart` discriminated union (`ValuesStreamPart`, `UpdatesStreamPart`, `MessagesStreamPart`, `CustomStreamPart`). `GraphOutput` 객체로 `invoke()` 결과에 `.value`와 `.interrupts` 속성 제공. HITL interrupt 처리가 타입 안전하게 개선.
- **개선 포인트**:
  1. CopilotKit의 AG-UI 1등 시민 지원 → Phase 1 구현 시 AG-UI 호환 레이어 참조
  2. LangGraph StreamPart → 백엔드 스트리밍 소비 시 discriminated union 기반 메시지 분기 설계 참고
- **confidence**: high (CopilotKit AG-UI 정식 지원, LangGraph 메이저 릴리스)

#### UPDATE-4: session_branching

- **현재 구현**: not_implemented. 대화 분기/포크 기능 미구현.
- **경쟁사 변화**:
  - **GitHub Copilot VS Code v1.110 (Mar 6)**: **Conversation branching (fork) from checkpoints** — 대화 중간 지점(checkpoint)에서 분기하여 다른 방향으로 탐색 가능. 원본 대화와 분기 대화를 동시에 유지.
  - **추가 관련 기능**: 공유 에이전트 메모리(Copilot CLI, 코드 리뷰, 코딩 에이전트 간), `/autoApprove`·`/yolo` 자동 승인 워크플로우, manual context compaction (`/compact`).
  - **Figma MCP Server**: VS Code 내에서 Figma 디자인 컨텍스트 연동 — MCP 기반 외부 도구 통합 패턴.
- **개선 포인트**:
  1. Copilot의 checkpoint 기반 fork → 대화 히스토리에 체크포인트 마킹 + 분기 생성 UI 설계
  2. 분기 대화 간 시각적 구분 (트리 뷰 또는 탭 기반) 패턴 참고
- **confidence**: medium (1개 주요 제품의 정식 릴리즈)

---

## 중복 필터링 상세 (이전 리포트와 겹침 또는 보고 기준 미달)


| #   | 항목                                                | 이전 리포트 매핑           | 비고                                                                                  |
| --- | ------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------- |
| 1   | Codex App Windows (Mar 4)                         | 2026-03-06 UPDATE-1 | 이미 보고됨, 추가 진전 없음                                                                    |
| 2   | MS Agent Dashboard GA rollout                     | 2026-03-04 누적       | May 1 GA 확정. Mar 중 사용량 리포트 기능만 출시                                                   |
| 3   | Cursor 2.6 MCP Apps / Automations (Mar 3-5)       | 2026-03-05 UPDATE-1 | 이미 보고됨                                                                              |
| 4   | shadcn/ui CLI v4 + shadcn/skills (Mar 6)          | —                   | 에이전트 인식 디자인 시스템 도구. 1개 제품의 개발 도구로 KonaI-Agent UI 패턴에 직접 해당 없음. 보고 기준 미달             |
| 5   | Claude Code 2.1.70-72 (Mar 6-10)                  | —                   | /loop, /mcp, effort level UX 등. CLI/IDE 에이전트 UX 변경. 웹 채팅 UI 패턴 직접 무관. 보고 기준 미달      |
| 6   | Codex 0.112.0 model-selection surface (Mar 8)     | —                   | TUI 모델 선택 UI. 기존 model_agent_switcher 완료(QA PASS). 보고 기준 미달                         |
| 7   | Windsurf v1.9577.24 (Mar 9)                       | —                   | Cascade UI 렌더링 최적화, SKILL.md/AGENTS.md 지원. 에이전트 커스터마이징 패턴이나 1개 제품의 성능 최적화. 보고 기준 미달 |
| 8   | v0 Custom Design System 에디터 (Mar 9-10)            | —                   | Nuxt 지원, 디자인 시스템 에디터 개선. 코드 생성 도구 고유 기능. KonaI-Agent UI 패턴 직접 무관                    |
| 9   | Google Agentspace Data Insights Agent GA (Mar 10) | —                   | BigQuery 데이터 인사이트 에이전트 정식 출시. 백엔드 에이전트 GA이며 UI 패턴 변경 미수반. 보고 기준 미달                  |
| 10  | GPT-5.4 Thinking mid-stream correction (Mar 5)    | —                   | 응답 생성 중 실시간 방향 수정. 새로운 인터랙션 패러다임이나 1개 제품의 실험적 기능. 카탈로그 매핑 컴포넌트 없음. 보고 기준 미달         |
| 11  | Copilot 리디자인 모델 피커 (Mar 6)                        | —                   | 검색+rich hover 상세. 기존 model_agent_switcher 완료(QA PASS). 보고 기준 미달                     |


---

## 우선순위 변경 제안 (PRIORITY_CHANGE)

> 이번 스캔에서 새 우선순위 변경 제안 없음.

---

## 리서치 노후 (STALE)

> 현재 노후 항목 없음. 모든 `last_researched` 30일 이내.
> `ppt_slide_preview` (2026-02-16)가 23일 경과이나, 해당 분야에서 유의미한 변화 미감지.

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


| #   | component_id     | 발견 내용                                         | 비고                                                  |
| --- | ---------------- | --------------------------------------------- | --------------------------------------------------- |
| 1   | generative_ui    | NNGroup GenUI 연구 검증 → Phase 2 "맥락적 타이밍" 로직 참조 | QA PASS 완료. Phase 2(A2UI) → Phase 3(MCP Apps) 순서 유지 |
| 2   | usage_monitoring | MS Agent 365 사용량 리포트 Mar 출시 → Phase 2 참조      | QA PASS 완료. Phase 2 기획 시 반영                         |


### 연속 권장 횟수 초기화

- 이번 리포트에서 초기화 대상 없음. (이전 미실행 액션 모두 미실행 상태 유지)

### 액션 테이블

우선순위순으로 정렬:


| #   | 액션                                        | 대상       | 이유                                                                                          | priority   |
| --- | ----------------------------------------- | -------- | ------------------------------------------------------------------------------------------- | ---------- |
| 1   | `/implement multi_agent_orchestration_ui` | 이전 누적    | 리서치 완료(2026-03-06). Cursor·Copilot·Codex 3대 제품 병렬 에이전트 UI 출시. **5회 연속 권장**                  | **high**   |
| 2   | `/research agent_marketplace`             | 이전 누적    | Cursor Team Marketplaces + ChatGPT Skills Beta(Mar 6, 워크플로우 재사용+워크스페이스 공유) 패턴. **2회 연속 권장** | **medium** |
| 3   | `/research session_branching`             | UPDATE-4 | GitHub Copilot conversation fork UI(Mar 6) 출시. 미구현 상태에서 경쟁사 정식 릴리즈. 리서치 필요                  | **medium** |
| 4   | `/research usage_monitoring`              | 이전 누적    | MS Agent Dashboard GA(May 1 확정) + Agent 사용량 리포트(Mar 출시). Phase 2 기획. **5회 연속 권장**           | **medium** |


카탈로그 직접 수정 제안:


| #   | component_id                 | 필드    | 현재   | 제안                                                                                                                                                                                      |
| --- | ---------------------------- | ----- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | approval_rejection           | notes | (기존) | 추가: "OpenAI Codex 0.113.0 (Mar 10): request_permissions 빌트인 도구 + 런타임 승인 UI + 사용자 패턴 기억. Salesforce Agentforce Contact Center (Mar 10): AI-to-human seamless 핸드오프, 컨텍스트 보존 전달."          |
| 2   | agent_marketplace            | notes | (기존) | 추가: "ChatGPT Skills Beta (Mar 6): 재사용 가능 워크플로우 지침, 워크스페이스 공유, 관리자 역할 제어. skill_management → agent_marketplace 확장 패턴."                                                                   |
| 3   | multi_agent_orchestration_ui | notes | (기존) | 추가: "CopilotKit v1.53.0 (Mar 6): AG-UI + MCP 미들웨어 1등 시민 지원, AI SDK v6 전환. LangGraph 1.1.0 (Mar 10): Type-safe StreamPart discriminated union, GraphOutput 객체, HITL interrupt 타입 안전 처리." |
| 4   | session_branching            | notes | (없음) | 추가: "GitHub Copilot VS Code v1.110 (Mar 6): Conversation branching (fork) from checkpoints. 대화 중간 체크포인트에서 분기하여 다른 방향 탐색. 공유 에이전트 메모리."                                                  |


---

## 누적 액션 추적

### 이전 리포트 (2026-03-06) 권장 액션 실행 여부:


| 리포트        | 액션                                                                 | 상태        | 비고                                          |
| ---------- | ------------------------------------------------------------------ | --------- | ------------------------------------------- |
| 2026-03-06 | `/implement multi_agent_orchestration_ui`                          | **미실행**   | last_researched: 2026-03-06. Phase 1 구현 미전환 |
| 2026-03-06 | `/research agent_marketplace`                                      | **미실행**   | 리서치 미착수                                     |
| 2026-03-06 | `/research usage_monitoring`                                       | **미실행**   | last_researched: 2026-03-01. Phase 2 미착수    |
| 2026-03-06 | catalog: multi_agent_orchestration_ui.notes 추가 (Codex App Windows) | **적용 완료** | 카탈로그에 반영됨                                   |
| 2026-03-06 | catalog: parallel_execution_view.notes 추가                          | **적용 완료** | 카탈로그에 반영됨                                   |


### 누적 미실행 (3회 이상 연속 권장):


| 리포트              | 액션                                        | 연속 권장 횟수 | 비고                                    |
| ---------------- | ----------------------------------------- | -------- | ------------------------------------- |
| 2026-03-02~03-11 | `/implement multi_agent_orchestration_ui` | **5회**   | 리서치 완료. 3대 제품 병렬 에이전트 UI 출시. 구현 시급    |
| 2026-03-03~03-11 | `/research usage_monitoring`              | **5회**   | Phase 2 기획 필요. MS Agent 365 GA May 확정 |


