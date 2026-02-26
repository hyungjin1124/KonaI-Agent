# Discovery Report — 2026-02-25

## 스캔 설정

- **모드**: broad
- **시간 범위**: 2026-02-24 ~ 2026-02-25 (1일간)
- **이전 리포트**: 2026-02-24-discovery.md

## 확인한 소스


| #   | 소스                   | URL                                                       | 상태                                                       |
| --- | -------------------- | --------------------------------------------------------- | -------------------------------------------------------- |
| 1   | ChatGPT changelog    | help.openai.com/en/articles/6825453-chatgpt-release-notes | 접근 실패 (403), Fallback 사용                                 |
| 2   | ChatGPT (Fallback)   | releasebot.io/updates/openai/chatgpt                      | 확인 완료 — 변경 없음 (최근: Feb 20)                               |
| 3   | Claude blog          | claude.com/blog                                           | 확인 완료 — 변경 없음 (최근: Jan 12)                               |
| 4   | Cursor changelog     | cursor.com/changelog                                      | 확인 완료 — **Cloud Agents with Computer Use (Feb 24)**      |
| 5   | Gemini release notes | gemini.google/release-notes                               | 확인 완료 — 변경 없음 (최근: Feb 19)                               |
| 6   | Windsurf changelog   | windsurf.com/changelog                                    | 확인 완료 — 변경 없음 (최근: Feb 21)                               |
| 7   | Bolt.new             | support.bolt.new/release-notes                            | 확인 완료 — 변경 없음 (최근: Feb 7-20)                             |
| 8   | v0 changelog         | v0.app/changelog                                          | 확인 완료 — 변경 없음 (최근: Feb 23)                               |
| 9   | GitHub Copilot       | releasebot.io/updates/github                              | 확인 완료 — Copilot CLI v0.0.416 (Feb 24, 마이너)               |
| 10  | Salesforce blog      | salesforce.com/blog                                       | 확인 완료 — Forrester Wave 기사 (Feb 24, UI 변경 아님)             |
| 11  | MS Copilot Studio    | learn.microsoft.com/copilot-studio                        | 확인 완료 — 변경 없음 (최근: Feb 10)                               |
| 12  | Google Agentspace    | cloud.google.com/agentspace/docs/release-notes            | 확인 완료 — 변경 없음 (최근: Feb 23)                               |
| 13  | ThoughtSpot blog     | thoughtspot.com/blog                                      | 확인 완료 — 변경 없음 (최근: ~Feb 20)                              |
| 14  | Power BI blog        | powerbi.microsoft.com/blog                                | 확인 완료 — **February 2026 Feature Summary (Feb 24)**       |
| 15  | Hex blog             | hex.tech/blog                                             | 확인 완료 — 변경 없음 (최근: Jan 28)                               |
| 16  | NNGroup              | nngroup.com/articles                                      | 확인 완료 — 변경 없음 (최근: Feb 23, AI 무관)                        |
| 17  | AG-UI                | github.com/ag-ui-protocol/ag-ui                           | 확인 완료 — THINKING→REASONING 리네이밍 커밋 (릴리스 아님)              |
| 18  | MCP TypeScript SDK   | github.com/modelcontextprotocol/typescript-sdk/releases   | 확인 완료 — v1.27.1 (Feb 24, auth/transport 수정)              |
| 19  | CopilotKit           | github.com/CopilotKit/CopilotKit/releases                 | 확인 완료 — 변경 없음 (최근: v1.51.4, Feb 17)                      |
| 20  | LangGraph            | github.com/langchain-ai/langgraph/releases                | 확인 완료 — langgraph-sdk 0.3.9 (Feb 24, SDK only)           |
| 21  | CrewAI               | github.com/crewAIInc/crewAI/releases                      | 확인 완료 — 변경 없음 (최근: v1.10.0a1, Feb 19)                    |
| 22  | Vercel AI SDK        | github.com/vercel/ai/releases                             | 확인 완료 — 30+ 패키지 패치 (Feb 24, 의존성 동기화)                     |
| 23  | Open WebUI           | github.com/open-webui/open-webui/releases                 | 확인 완료 — 변경 없음 (최근: v0.8.5, Feb 23)                       |
| 24  | LobeChat             | github.com/lobehub/lobe-chat/releases                     | 확인 완료 — Desktop Canary v2.1.34-canary.4/.5 (Feb 24, 비정식) |
| 25  | Chainlit             | github.com/Chainlit/chainlit/releases                     | 확인 완료 — 변경 없음 (최근: v2.9.6, Jan 2025)                     |


## 보충 검색 쿼리


| #   | 쿼리                                                                          | 결과 수 |
| --- | --------------------------------------------------------------------------- | ---- |
| 1   | "AI agent UI" OR "agentic interface" new feature February 2026              | 10건  |
| 2   | "human-in-the-loop" OR "AI approval" UI pattern February 2026               | 10건  |
| 3   | "conversational AI" OR "chat UI" framework release February 2026            | 10건  |
| 4   | "enterprise AI dashboard" OR "AI copilot admin" February 2026               | 10건  |
| 5   | "AI data visualization" OR "natural language query" dashboard February 2026 | 10건  |


---

## 요약

- 신규 패턴 발견: **1**건
- 개선 필요: **1**건
- 우선순위 변경 제안: **0**건
- 리서치 노후: **0**건
- 폐기 후보: **0**건
- **중복 필터링으로 제외**: **9**건

> 1일간 스캔. Cursor가 Cloud Agents with Computer Use를 발표하여 에이전트 샌드박스/프리뷰 패턴에 새로운 벤치마크 설정. Power BI가 Copilot 대폭 강화 (프롬프트 확대, 앱 자동 선택, 요약 기능).

---

## 신규 패턴 (NEW)


| #   | 패턴명                        | 설명                                                                | 발견 출처           | 관련 카테고리                                    | 권장 priority | 권장 complexity | confidence |
| --- | -------------------------- | ----------------------------------------------------------------- | --------------- | ------------------------------------------ | ----------- | ------------- | ---------- |
| 1   | Agent Computer Use Sandbox | 에이전트가 격리 VM에서 자신이 만든 소프트웨어를 직접 실행·테스트하고, 스크린샷/비디오/로그를 PR 아티팩트로 생성 | Cursor (Feb 24) | agent_action_patterns, generative_emerging | medium      | complex       | medium     |


### 상세

#### NEW-1: Agent Computer Use Sandbox

- **발견 출처**: [https://cursor.com/changelog](https://cursor.com/changelog) — "Cloud Agents with Computer Use" (2026-02-24)
- **경쟁사 현황**:
  - **Cursor**: Cloud Agents가 격리된 VM에서 개발 환경을 자동 구성하고, 생성한 코드를 직접 실행·테스트. 결과물로 스크린샷, 비디오, 실행 로그를 PR에 첨부. 웹/데스크톱/모바일/Slack/GitHub 통합
  - 기존 카탈로그의 `sandbox_mode` (에이전트 실행 결과를 실제 반영 전에 시뮬레이션) 개념을 넘어서, 에이전트가 능동적으로 환경을 구성하고 시각적 증거(비디오/스크린샷)를 생성하는 패턴
- **KonaI-Agent 관련성**: 현재 `sandbox_mode`(not_implemented, medium priority)가 정적 시뮬레이션 개념이나, Cursor의 접근법은 에이전트가 실제 환경에서 실행 후 결과를 아티팩트로 제시하는 "증거 기반 검증" 패턴. PPT 시나리오나 데이터 분석 시나리오에서 에이전트가 생성한 결과물의 실행 증거(스크린샷, 로그)를 보여주는 UX에 적용 가능
- **confidence**: medium (Cursor 1개 제품이나 정식 릴리즈이며, `sandbox_mode` 기존 컴포넌트의 방향성에 직접 영향)

---

## 개선 필요 (UPDATE)


| #   | component_id | 현재 상태           | 발견 내용                                                              | 출처                     |
| --- | ------------ | --------------- | ------------------------------------------------------------------ | ---------------------- |
| 1   | nl_to_chart  | not_implemented | Power BI Conversational App Copilot: 리포트 자동 선택 + 앱 요약 + 컨텍스트 네비게이션 | Power BI blog (Feb 24) |


### 상세

#### UPDATE-1: nl_to_chart

- **현재 구현**: not_implemented. 자연어 질문으로 차트/시각화를 자동 생성하는 컴포넌트
- **경쟁사 변화**:
  - **Power BI February 2026 Feature Summary** (Feb 24):
    - **프롬프트 입력 확대**: Copilot 프롬프트 글자수 제한 500 → 10,000자로 대폭 확대. 복잡한 분석 요청 가능
    - **Conversational App Copilot**: 사용자가 수동으로 리포트를 선택할 필요 없이, Copilot이 질문에 가장 적합한 리포트를 자동으로 찾아 응답. 대시보드 수가 많은 환경에서 탐색 부담 경감
    - **App Summarization**: "이 앱의 리포트를 요약해줘" 형태의 자연어로 앱 전체 콘텐츠 요약 가능
    - **Context-Aware Navigation**: 앱 내 curated context 기반으로 사용자를 관련 리포트/페이지로 안내
    - **Input Slicer GA**: 리포트 필터링 + 사용자 입력 수집 UI 정식 출시
  - 이전 리포트(Feb 22)에서 Databricks의 Agentic Dashboard Authoring을 UPDATE-1로 보고했으나 Power BI의 접근은 다름: Databricks는 "대시보드 전체를 NL로 생성", Power BI는 "기존 대시보드에서 NL로 탐색·요약"
- **개선 포인트**: `nl_to_chart` 리서치 시 Power BI의 Conversational App Copilot 패턴(리포트 자동 선택, 앱 요약, 컨텍스트 네비게이션) 참조. 단순 차트 생성을 넘어 "기존 대시보드 자연어 탐색" 패턴도 고려
- **confidence**: medium (Power BI 정식 릴리즈, 1개 제품이나 엔터프라이즈 영향력 대)
- **출처**: [https://powerbi.microsoft.com/en-us/blog/power-bi-february-2026-feature-summary/](https://powerbi.microsoft.com/en-us/blog/power-bi-february-2026-feature-summary/)

---

## 중복 필터링 상세 (이전 리포트와 겹침 또는 보고 기준 미달)


| #   | 항목                                                   | 이전 리포트 매핑                   | 비고                                 |
| --- | ---------------------------------------------------- | --------------------------- | ---------------------------------- |
| 1   | Google A2UI (Dec 2025 발표)                            | 2026-02-16 리포트에서 보고됨        | 날짜 범위 외 + 이미 보고됨                   |
| 2   | Databricks Agentic Dashboard Authoring               | 2026-02-22 리포트 UPDATE-1     | 이미 보고됨, 추가 진전 없음                   |
| 3   | LobeChat Desktop Canary v2.1.34-canary.4/.5 (Feb 24) | —                           | 비정식 canary 빌드, 프로덕션 아님             |
| 4   | GitHub Copilot CLI v0.0.416 (Feb 24)                 | 2026-02-24 리포트 UPDATE-1 연장선 | 마이너 패치, 최소 보고 기준 미달                |
| 5   | Vercel AI SDK 30+ 패키지 패치 (Feb 24)                    | —                           | 프로바이더 의존성 동기화, UI 패턴 무관            |
| 6   | LangGraph SDK 0.3.9 (Feb 24)                         | —                           | SDK 백엔드 `extract` 파라미터, UI 패턴 무관   |
| 7   | MCP TypeScript SDK v1.27.1 (Feb 24)                  | —                           | auth/transport 버그 수정, UI 패턴과 직접 무관 |
| 8   | Salesforce Forrester Wave 기사 (Feb 24)                | —                           | 마케팅 포지셔닝, UI 변경 아님                 |
| 9   | AG-UI THINKING→REASONING 리네이밍 (Feb 24)               | —                           | 내부 이벤트 명 변경, 릴리스 아님                |


---

## 우선순위 변경 제안 (PRIORITY_CHANGE)

> 이번 스캔에서 새 우선순위 변경 제안 없음. 이전 리포트의 `usage_monitoring: medium → high` 미적용 상태.

---

## 리서치 노후 (STALE)

> 현재 노후 항목 없음. 모든 `last_researched` 30일 이내.

---

## 폐기 후보 (DEPRECATED)

> 현재 폐기 후보 없음.

---

## 권장 다음 액션

우선순위순으로 정렬:


| #   | 액션                               | 대상                   | 이유                                                                           | priority   |
| --- | -------------------------------- | -------------------- | ---------------------------------------------------------------------------- | ---------- |
| 1   | `/research nl_to_chart`          | UPDATE-1 + 이전 리포트 누적 | Power BI Conversational App Copilot + Databricks Agentic Dashboard. 4회 연속 권장 | **high**   |
| 2   | `/research chat_input`           | 이전 리포트 누적 미실행        | Telerik AI-ready Chat 입력 모드 전환 + prefix/suffix 패턴. 4회 연속 권장                  | **medium** |
| 3   | `/research model_agent_switcher` | 이전 리포트 누적 미실행        | GitHub Copilot 에이전트 모델 피커 + Auto 모드. 4회 연속 권장                                | **medium** |


카탈로그 직접 수정 제안:


| #   | component_id     | 필드       | 현재     | 제안                                                                                     |
| --- | ---------------- | -------- | ------ | -------------------------------------------------------------------------------------- |
| 1   | usage_monitoring | priority | medium | high                                                                                   |
| 2   | sandbox_mode     | notes    | (기존)   | Cursor Cloud Agents (Feb 24): 에이전트가 VM에서 실행 후 스크린샷/비디오/로그를 아티팩트로 생성하는 "증거 기반 검증" 패턴 참고 |


> `usage_monitoring.priority → high`는 4회 연속 리포트에서 동일 제안. 미적용 상태.

---

## 누적 액션 추적

### 이전 리포트 (2026-02-24) 권장 액션 실행 여부:


| 리포트        | 액션                                             | 상태         | 비고                 |
| ---------- | ---------------------------------------------- | ---------- | ------------------ |
| 2026-02-24 | `/research chat_input`                         | **미실행**    | last_researched 없음 |
| 2026-02-24 | `/research model_agent_switcher`               | **미실행**    | last_researched 없음 |
| 2026-02-24 | `/research nl_to_chart`                        | **미실행**    | last_researched 없음 |
| 2026-02-24 | catalog: document_viewer.status → needs_update | **이미 적용됨** | 현재: needs_update ✓ |
| 2026-02-24 | catalog: usage_monitoring.priority → high      | **미적용**    | 현재: medium         |


### 누적 미실행 (3회 이상 연속 권장):


| 리포트           | 액션                                        | 연속 권장 횟수 | 비고                           |
| ------------- | ----------------------------------------- | -------- | ---------------------------- |
| 2026-02-21~25 | `/research chat_input`                    | **4회**   | 우선 실행 권장                     |
| 2026-02-21~25 | `/research model_agent_switcher`          | **4회**   | 우선 실행 권장                     |
| 2026-02-22~25 | `/research nl_to_chart`                   | **4회**   | 이번 Power BI 발견으로 priority 상향 |
| 2026-02-21~25 | catalog: usage_monitoring.priority → high | **4회**   | 카탈로그 수정만으로 완료 가능             |


