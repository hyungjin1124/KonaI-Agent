# Discovery Report — 2026-03-17

## 스캔 설정
- **모드**: broad
- **시간 범위**: 2026-03-16 ~ 2026-03-17 (1일간)
- **이전 리포트**: 2026-03-16-discovery.md (broad)

## 확인한 소스

| # | 소스 | URL | 상태 |
|---|------|-----|------|
| 1 | ChatGPT changelog | releasebot.io/updates/openai/chatgpt | 변경 없음 (최근: Mar 11 GPT-5.1 retirement) |
| 2 | Claude blog | releasebot.io/updates/anthropic/claude | 변경 없음 (최근: Mar 12 Interactive Visualizations) |
| 3 | Cursor changelog | cursor.com/changelog | 변경 없음 (최근: Mar 11 30+ Plugins) |
| 4 | Gemini release notes | gemini.google/release-notes | 변경 없음 (최근: Feb 19) |
| 5 | Windsurf changelog | windsurf.com/changelog | 변경 없음 (최근: Mar 12 v1.9577.27) |
| 6 | Bolt.new | support.bolt.new/release-notes | 변경 없음 (최근: Mar 6) |
| 7 | v0 by Vercel | v0.dev/changelog | 변경 없음 (최근: Mar 12) |
| 8 | GitHub Copilot | releasebot.io/updates/github | 변경 없음 (최근: Mar 13 Copilot CLI v1.0.5) |
| 9 | Salesforce Agentforce | salesforce.com/blog | 변경 없음 (최근: Mar 13) |
| 10 | MS Copilot Studio | learn.microsoft.com/copilot-studio | 접근 실패 (404) |
| 11 | Google Agentspace | cloud.google.com/agentspace/docs/release-notes | 변경 없음 (최근: Mar 13 SharePoint 필터링) |
| 12 | ThoughtSpot | thoughtspot.com/blog | 접근 실패 (JS 렌더링) |
| 13 | Power BI | learn.microsoft.com/power-bi | 변경 없음 (Feb 2026 update가 최신) |
| 14 | Hex AI | hex.tech/blog | 변경 없음 (최근: ~Mar 11) |
| 15 | AG-UI | github.com/ag-ui-protocol/ag-ui/releases | 변경 없음 (태그 릴리스 없음) |
| 16 | MCP | github.com/modelcontextprotocol | 변경 없음 (최근: 2025-11-25) |
| 17 | CopilotKit | github.com/CopilotKit/CopilotKit/releases | 확인 완료 — v1.54.0 (Mar 12): runTool() API, Standard Schema 지원. 이전 기간 |
| 18 | LangGraph | github.com/langchain-ai/langgraph/releases | 확인 완료 — langgraph-cli 0.4.18 (Mar 15). 에러 메시지 업데이트만 |
| 19 | CrewAI | github.com/crewAIInc/crewAI/releases | 확인 완료 — **1.11.0rc1 (Mar 16)**: Plan-Execute 패턴, A2A 인증 |
| 20 | Vercel AI SDK | github.com/vercel/ai/releases | 확인 완료 — **v4.0.0-beta (Mar 16)**: 17개 프로바이더 beta 일괄. 의존성 업데이트만 |
| 21 | Open WebUI | github.com/open-webui/open-webui/releases | 변경 없음 (최근: Mar 9) |
| 22 | LobeChat | github.com/lobehub/lobe-chat/releases | 확인 완료 — **v2.1.43 (Mar 16)**: BM25 전문 검색 인덱스. 백엔드 전용 |
| 23 | Chainlit | github.com/Chainlit/chainlit/releases | 변경 없음 (최근: Mar 5 v2.10.0) |
| 24 | NNGroup | nngroup.com/articles | 확인 완료 — Mar 16: "3 Tips to Make AI a Better Editor" (AI 프롬프팅 UX, 7분 영상) |

## 보충 검색 쿼리

| # | 쿼리 | 결과 수 |
|---|------|--------|
| 1 | "AI agent UI" OR "agentic interface" new feature "March 2026" | 10건 (Oracle+Google+CopilotKit 3-Layer — Mar 12, 이전 범위) |
| 2 | "human-in-the-loop" OR "AI approval" UI pattern "March 2026" | 10건 (CHI 2026 논문, MS AG-UI HITL 문서 — 이전 범위) |
| 3 | "conversational AI" OR "chat UI" framework release "March 2026" | 10건 (GPT-5.4 Mar 5, ChatSpark Mar 3 — 이전 범위) |
| 4 | "enterprise AI dashboard" OR "AI copilot admin" "March 2026" | 10건 (MS Agent Dashboard/Registry Mar 9 — 이전 리포트 기록) |
| 5 | "AI data visualization" OR "natural language query" dashboard "March 2026" | 10건 (Databricks Genie Code — 이전 리포트 기록) |

---

## 요약

- 신규 패턴 발견: 0건
- 개선 필요: 0건
- 우선순위 변경 제안: 0건
- 리서치 노후: 0건
- 폐기 후보: 0건
- **중복 필터링으로 제외**: 2건

> 스캔 범위 내 유의미한 변경 없음. 1일간 스캔. Mar 16에 릴리스된 항목은 CrewAI 1.11.0rc1 (Plan-Execute 패턴, 백엔드 프레임워크), Vercel AI SDK v4.0.0-beta (프로바이더 의존성 업데이트), LobeChat v2.1.43 (BM25 검색, 백엔드 전용) — 모두 UI 패턴 보고 기준 미달. NNGroup "AI as Editor" 기사는 일반 방법론으로 구체적 UI 패턴 아님. 보충 검색 결과는 모두 이전 리포트에서 다룬 항목이거나 스캔 범위 이전 기간.

---

## 중복 필터링 상세

| # | 항목 | 이전 리포트 매핑 | 처리 |
|---|------|----------------|------|
| 1 | MS Agent Dashboard / 365 Control Plane | 2026-03-11 admin — agent_registry NEW-1, 2026-03-16 중복 필터 | 제외 |
| 2 | Databricks Genie Code NLQ 대시보드 | 2026-03-12 broad — nl_to_chart UPDATE-2, 2026-03-16 중복 필터 | 제외 |

### 보고 기준 미달 제외

| # | 항목 | 사유 |
|---|------|------|
| 1 | CrewAI 1.11.0rc1 Plan-Execute (Mar 16) | 백엔드 오케스트레이션 프레임워크. RC 릴리스. UI 패턴 무관 |
| 2 | Vercel AI SDK v4.0.0-beta 17개 프로바이더 (Mar 16) | 프로바이더 의존성 업데이트만. API 변경 없음 |
| 3 | LobeChat v2.1.43 BM25 전문 검색 (Mar 16) | 백엔드 DB 인덱스 추가. UI 패턴 무관 |
| 4 | LangGraph CLI 0.4.18 (Mar 15) | 에러 메시지 업데이트만. UI 패턴 무관 |
| 5 | NNGroup "3 Tips to Make AI a Better Editor" (Mar 16) | 일반 AI 프롬프팅 방법론 영상. 구체적 UI 패턴 아님 |
| 6 | CopilotKit v1.54.0 runTool()/Standard Schema (Mar 12) | SDK 내부 API. 이전 기간. UI 패턴 직접 영향 없음 |
| 7 | CHI 2026 터미널 에이전트 UI 논문 (arxiv) | 학술 논문. 제품 변경 아님 |

---

## 권장 다음 액션

우선순위순 정렬:

| # | 액션 | 대상 | 이유 | priority |
|---|------|------|------|----------|
| 1 | `/implement prompt_management` | (이전 리포트) | 리서치 완료(Mar 13). **5회 연속 권장**. 구현 착수 가능 | high |
| 2 | `/research generative_ui` Phase 2 | (이전 리포트) | ChatGPT+Claude 인터랙티브 시각화 표준화. **3회 연속 권장** | high |
| 3 | `/research approval_rejection` | (이전 리포트) | GitHub Copilot 승인 바이패스+MS Agent Framework. last_researched 24일 경과(30일 임박) | medium |
| 4 | `/research agent_marketplace` | (이전 리포트) | LobeChat 스킬/벤치마크+Cursor 30+ 플러그인. **5회 연속 권장** | medium |
| 5 | `/research usage_monitoring` Phase 2 | (이전 리포트) | MS Agent Dashboard GA 반영. **9회 연속 권장** | medium |

카탈로그 직접 수정 제안:

해당 없음 (이전 리포트 제안과 동일, 추가 변경 없음).

---

## 누적 액션 추적

### 이전 리포트 권장 액션 실행 여부

| 리포트 | 액션 | 상태 | 비고 |
|--------|------|------|------|
| 2026-03-16 | /implement prompt_management | 미실행 | status: not_implemented, 변동 없음 |
| 2026-03-16 | /research generative_ui Phase 2 | 미실행 | last_researched: 2026-03-13, 변동 없음 |
| 2026-03-16 | /research approval_rejection | 미실행 | last_researched: 2026-02-21, 변동 없음 |
| 2026-03-16 | /research agent_marketplace | 미실행 | last_researched: 2026-03-12, 변동 없음 |
| 2026-03-16 | /research usage_monitoring Phase 2 | 미실행 | last_researched: 2026-03-01, 변동 없음 |
| 2026-03-16 | catalog: approval_rejection.notes 추가 | 미적용 | notes 변동 없음 |
| 2026-03-16 | catalog: model_agent_switcher.notes 추가 | 미적용 | notes 변동 없음 |

### 누적 미실행 (3회 이상 연속 권장)

| 액션 | 연속 횟수 | 현재 상태 | 비고 |
|------|----------|----------|------|
| /research usage_monitoring Phase 2 | **9회** | Phase 1+2 구현 진행 중 | MS Agent Dashboard GA 반영하여 Phase 2 설계 |
| /implement prompt_management | **5회** | not_implemented (리서치 완료) | 리서치 브리프 완료. 구현만 남음 |
| /research agent_marketplace | **5회** | implemented | LobeChat 스킬/벤치마크+Cursor 30+ 플러그인 |
| /research generative_ui Phase 2 | **3회** | implemented (Phase 1 QA PASS) | ChatGPT+Claude 인터랙티브 시각화 반영 필요 |

### 30일 임박 컴포넌트

| component_id | last_researched | 경과 | 비고 |
|--------------|----------------|------|------|
| ppt_slide_preview | 2026-02-16 | **29일** | 다음 스캔에서 30일 경과. 변화 감지 시 STALE 처리 |
| artifact_panel | 2026-02-18 | 27일 | |
| approval_rejection | 2026-02-21 | 24일 | 이번 리포트에서 리서치 권장 (UPDATE 이력) |
| document_viewer | 2026-02-21 | 24일 | |
