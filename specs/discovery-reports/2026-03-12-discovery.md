# Discovery Report — 2026-03-12

## 스캔 설정
- **모드**: broad
- **시간 범위**: 2026-03-11 ~ 2026-03-12 (1일간)
- **이전 리포트**: 2026-03-11-discovery-2.md (category:admin_operations)

## 확인한 소스

| # | 소스 | URL | 상태 |
|---|------|-----|------|
| 1 | ChatGPT changelog | releasebot.io/updates/openai/chatgpt | 확인 완료 — Interactive Math/Science Visuals (Mar 10) |
| 2 | OpenAI 전체 | releasebot.io/updates/openai | 확인 완료 — Codex 0.114.0 (Mar 11) |
| 3 | Claude blog | releasebot.io/updates/anthropic/claude | 확인 완료 — 변경 없음 (최근: Mar 2 Memory) |
| 4 | Cursor changelog | cursor.com/changelog | 확인 완료 — 30+ Marketplace Plugins (Mar 11) |
| 5 | Gemini/Google blog | blog.google/technology/ai | 확인 완료 — Workspace Gemini 통합 (Mar 10) |
| 6 | Windsurf changelog | windsurf.com/changelog | 확인 완료 — v1.9577.1024 (Mar 9) |
| 7 | Bolt.new | 웹 검색 | 변경 없음 |
| 8 | v0 by Vercel | 웹 검색 | 변경 없음 |
| 9 | GitHub Copilot | github.com/features/copilot/whats-new | 확인 완료 — 변경 없음 (최근: Mar 4 Memory) |
| 10 | Salesforce Agentforce | 웹 검색 | 변경 없음 |
| 11 | MS Copilot Studio | microsoft.com/microsoft-365/blog | 확인 완료 — Wave 3 발표 (Mar 9) |
| 12 | Google Agentspace | docs.cloud.google.com/agentspace/docs/release-notes | 확인 완료 — **Google Chat Data Connector (Mar 11)**: Google Chat 데이터 소스 연결 Public Preview. **GitHub/SharePoint/Notion/Shopify Actions (Mar 11)**: 4대 플랫폼 액션 지원 Public Preview |
| 13 | ThoughtSpot | 웹 검색 | 변경 없음 |
| 14 | Power BI | 웹 검색 | 변경 없음 |
| 15 | Hex AI | 웹 검색 | 변경 없음 |
| 16 | AG-UI | github.com/ag-ui-protocol/ag-ui | 확인 완료 — **PR #1257 (Mar 11, merged)**: `messages-tuple` 스트림 모드 추가로 LangGraph Platform 스트리밍 호환성 수정 |
| 17 | CopilotKit | GitHub releases | 변경 없음 (최근: v0.8.10 Mar 9) |
| 18 | LangGraph | GitHub releases | 확인 완료 — **langgraph-sdk 0.3.11 (Mar 11)**: cron tz 지원 + v1.1.0 연동. 1.1.0은 이전 리포트 기록 |
| 19 | CrewAI | GitHub releases | 확인 완료 — 1.10.2a1 (Mar 11, alpha) |
| 20 | Vercel AI SDK | GitHub releases | 확인 완료 — 6.0.126 (Mar 11, CORS 패치) |
| 21 | Open WebUI | GitHub releases | 변경 없음 (최근: Mar 9 LobeChat v2.1.39) |
| 22 | LobeChat | GitHub releases | 변경 없음 (nightly/canary만, 정식 없음) |
| 23 | Chainlit | GitHub releases | 확인 완료 — 1.10.2a1 (Mar 11, alpha) |
| 24 | Databricks AI-BI | docs.databricks.com | 확인 완료 — March 2026 릴리즈 다수 |

## 보충 검색 쿼리

| # | 쿼리 | 결과 수 |
|---|------|--------|
| 1 | "AI agent UI" OR "agentic interface" new feature "March 2026" | 10건 |
| 2 | "human-in-the-loop" OR "AI approval" UI pattern "March 2026" | 10건 |
| 3 | "conversational AI" OR "chat UI" framework release "March 2026" | 10건 |
| 4 | "enterprise AI dashboard" OR "AI copilot admin" new feature "March 2026" | 10건 |
| 5 | "AI data visualization" OR "natural language query" dashboard "March 2026" | 10건 |

---

## 요약

- 신규 패턴 발견: 0건
- 개선 필요: **6건**
- 우선순위 변경 제안: **1건**
- 리서치 노후: 0건
- 폐기 후보: 0건
- **중복 필터링으로 제외**: 7건

> 1일간 스캔. Google Agentspace가 Mar 11에 Google Chat Data Connector와 GitHub/SharePoint/Notion/Shopify 액션 4종 Public Preview를 동시 출시하여 integration_management 패턴 강화. AG-UI 프로토콜이 LangGraph Platform과의 `messages-tuple` 스트리밍 호환성을 수정(PR #1257)하여 multi_agent_orchestration_ui 구현 시 AG-UI+LangGraph 연동 안정성 확보. Cursor가 30+ 파트너 플러그인을 일괄 추가하여 MCP 기반 플러그인 생태계가 프로덕션급으로 진화. ChatGPT Interactive Math/Science Visuals(Mar 10)이 Generative UI의 대규모 인터랙티브 배포 사례를 확립. Databricks AI-BI의 NL->Dashboard 패턴이 nl_to_chart Phase 2 방향에 참조 가능.

---

## 중복 필터링 상세

| # | 항목 | 이전 리포트 매핑 | 처리 |
|---|------|----------------|------|
| 1 | LangGraph 1.1.0 Type-Safe Streaming | 2026-03-11 broad — 이미 기록 | 제외 |
| 2 | Codex 0.113.0 request_permissions | 2026-03-11 broad — 이미 기록 | 제외 |
| 3 | MS Agent 365 Registry / Agent Dashboard | 2026-03-11 admin — 이미 기록 | 제외 |
| 4 | MS Copilot Studio Wave 3 Cowork | 2026-03-11 broad — 이미 기록 | 제외 |
| 5 | Windsurf SKILL.md 지원 | 기능 자체는 Mar 8 릴리즈, 이전 범위 | 제외 |
| 6 | CrewAI v1.10.2a1 동적 도구 검색 + MCP 수정 (Mar 11) | — | alpha 프리릴리스. 동적 tool search(토큰 절약)와 MCP 연결 안정화는 에이전트 프레임워크 내부 최적화. KonaI-Agent UI 패턴에 직접 해당 없음. 보고 기준 미달 | 제외 |
| 7 | Vercel AI SDK CORS 수정 ai@6.0.126 (Mar 11) | — | 브라우저 호환성 버그 수정 (Safari/Firefox User-Agent 헤더 제거). UI 패턴 변경 아님. 보고 기준 미달 | 제외 |

---

## 개선 필요 (UPDATE)

| # | component_id | 현재 상태 | 발견 내용 | 출처 |
|---|-------------|----------|----------|------|
| 1 | generative_ui | implemented (QA PASS) | ChatGPT Interactive Math/Science Visuals — 대화 내 인터랙티브 시각화 생성 | OpenAI (Mar 10) |
| 2 | nl_to_chart | implemented | Gemini NL→Spreadsheet + Databricks NL→Dashboard 패턴 확산 | Google (Mar 10), Databricks (Mar 2026) |
| 3 | scheduled_agent_tasks | not_implemented | Codex 0.114.0 Hooks Engine — SessionStart/Stop 이벤트 기반 자동화 | OpenAI (Mar 11) |
| 4 | agent_marketplace | not_implemented | Cursor 30+ Marketplace Plugins 일괄 추가 — MCP 기반 플러그인 생태계 급속 확장 | Cursor (Mar 11) |
| 5 | multi_agent_orchestration_ui | implemented (QA PASS) | AG-UI PR #1257 (Mar 11): LangGraph Platform `messages-tuple` 스트림 모드 호환. AG-UI+LangGraph 통합 안정성 향상 | github.com/ag-ui-protocol/ag-ui/pull/1257 |
| 6 | integration_management | research_needed (high) | Google Agentspace (Mar 11): Google Chat Data Connector + GitHub/SharePoint/Notion/Shopify 액션 Public Preview. 5종 통합 동시 출시 | docs.cloud.google.com/agentspace/docs/release-notes |

### 상세

#### UPDATE-1: generative_ui
- **현재 구현**: Phase 1 Static MVP. 8종 컴포넌트 type dispatch, JSON 기반 선언적 렌더링. QA PASS (2026-03-04)
- **경쟁사 변화**:
  - **ChatGPT Interactive Math/Science Visuals** (2026-03-10): 대화 내에서 70+ 수학/과학 개념에 대한 **인터랙티브 시각화를 동적으로 생성**. 사용자가 변수를 실시간으로 조작(슬라이더, 수식 편집)하면 그래프/시각화가 즉시 업데이트. 전체 로그인 사용자 대상 롤아웃. 주 1.4억 사용자가 수학/과학 질문에 ChatGPT 사용 중
  - **UI 패턴**: 에이전트가 컨텍스트에 맞는 인터랙티브 위젯을 대화 내 동적 생성 → **Generative UI의 실전 대규모 배포 사례**
  - **Codex 0.114.0 Mention Picker** (Mar 11): `$` mention picker에 Skills/Apps/Plugins 카테고리 라벨링 추가. 플러그인 우선 노출
- **개선 포인트**:
  1. **Phase 2 인터랙티브 컴포넌트**: 현재 Static 렌더링에서 사용자 입력(슬라이더, 필드)에 반응하는 인터랙티브 컴포넌트 지원 추가
  2. **수식/그래프 동적 생성**: ChatGPT 패턴처럼 수학적 시각화를 에이전트가 생성하는 기능
  3. **A2UI 호환**: Phase 2 계획의 A2UI Declarative 렌더러와 결합
- **confidence**: medium (1개 제품의 대규모 정식 배포이나, 다른 제품에서도 유사 패턴 확산 중)

#### UPDATE-2: nl_to_chart
- **현재 구현**: Phase 1 완료. Heuristic 차트 타입 추천 + Recharts 동적 렌더링 + ArtifactPanel 통합. 6종 차트 타입
- **경쟁사 변화**:
  - **Google Gemini Workspace Sheets** (2026-03-10): 자연어 프롬프트 하나로 **테이블 + 대시보드 + 시각화를 포함한 전체 스프레드시트 생성**. "Fill with Gemini"으로 셀을 자동 채우기 (커스텀 텍스트, 카테고리, Google 검색 실시간 데이터). 95명 참가 비교 연구 진행
  - **Databricks AI-BI** (2026-03 릴리즈): NL→Dashboard assistant가 **멀티스텝 대시보드 워크플로우 자동화** — 데이터셋 생성, 시각화, 레이아웃, 필터를 자연어로 지시. Genie가 기본 활성화되어 발행 대시보드에서 질문 가능. Heatmap/Sankey 시각화 추가
  - **업계 트렌드**: "대시보드 만들기"에서 "질문 던지기"로 전환 가속. 2026년 말까지 모든 주요 플랫폼이 대화형 분석 제공 예상 (웹 검색 분석)
- **개선 포인트**:
  1. **NL→전체 대시보드 생성**: 단일 차트가 아닌 여러 차트+필터+레이아웃을 한 번에 생성하는 패턴
  2. **실시간 데이터 연동**: Fill with Gemini처럼 셀에 실시간 외부 데이터 주입
  3. **Heatmap/Sankey 등 고급 차트 타입 추가**: Databricks 패턴 참조
- **confidence**: high (Google, Databricks, Power BI 등 3개 이상 플랫폼 동시 채택)

#### UPDATE-3: scheduled_agent_tasks
- **현재 구현**: 미구현 (not_implemented). 리서치 완료 (2026-03-02). ChatGPT Tasks/Gemini/Claude Cowork 패턴 분석됨
- **경쟁사 변화**:
  - **Codex CLI 0.114.0** (2026-03-11): Experimental **hooks engine** 도입 — `SessionStart`, `Stop` 이벤트에 커스텀 명령 바인딩. WebSocket 기반 healthz/readyz 엔드포인트로 에이전트 상태 모니터링 지원
  - **Windsurf** (2026-03-08): "Execute custom commands at key points during Cascade's workflow, including on model response for auditing purposes" — Enterprise 기능으로 워크플로우 후킹 제공
  - **Cursor Automations** (2026-03-05, 이전 리포트 기록): always-on 에이전트, 이벤트 트리거(Slack, Linear, GitHub, PagerDuty, 웹훅)
- **개선 포인트**:
  1. **이벤트 트리거 지원**: 스케줄 외에 웹훅, Slack 이벤트 등 이벤트 기반 트리거 패턴 반영
  2. **Hooks/Lifecycle 이벤트**: 에이전트 세션 시작/종료/응답 시점에 커스텀 액션 실행
  3. **상태 모니터링 엔드포인트**: 에이전트 헬스체크 UI (system_health_dashboard과 연계 가능)
- **confidence**: medium (Codex+Windsurf+Cursor 3개 제품이 hooks/automation 패턴 도입, 그러나 UI 패턴보다는 백엔드 인프라에 가까움)

---

#### UPDATE-4: agent_marketplace
- **현재 구현**: 미구현 (not_implemented, priority: medium). 카탈로그 notes에 Cursor 2.6 Team Marketplaces (Mar 3) + ChatGPT Skills Beta (Mar 6) 기록
- **경쟁사 변화**:
  - **Cursor 30+ Marketplace Plugins** (2026-03-11): Atlassian, Datadog, GitLab, Glean, Hugging Face, monday.com, PlanetScale 등 **30개 이상 파트너 플러그인 일괄 추가**. 대부분 MCP 통합 포함. Cloud agents에서 수동/자동 트리거 시 사용 가능. Teams/Enterprise 관리자가 프라이빗 마켓플레이스 관리
  - **패턴 의미**: 플러그인 생태계가 "실험적 기능"에서 **"30+ 파트너 참여 프로덕션 생태계"**로 진화. MCP Apps(인터랙티브 UI) + MCP Servers(백엔드 통합) + 관리자 거버넌스의 3계층 구조 확립
- **개선 포인트**:
  1. **MCP 기반 플러그인 카탈로그**: 설치/해제 가능한 플러그인 목록 UI
  2. **관리자 거버넌스**: 팀별 허용 플러그인 제어, 프라이빗 마켓플레이스
  3. **플러그인 → 인터랙티브 UI 연결**: MCP Apps 패턴으로 플러그인이 채팅 내 UI 렌더링
- **confidence**: medium (Cursor+ChatGPT 2개 제품이 정식 기능으로 도입)

#### UPDATE-5: multi_agent_orchestration_ui
- **현재 구현**: implemented (QA PASS). AG-UI+LangGraph 기반 멀티 에이전트 오케스트레이션 UI 구현 완료.
- **프레임워크 변화**:
  - **AG-UI PR #1257 (Mar 11, merged)**: `messages-tuple` 스트림 모드를 `@ag-ui/langgraph` 기본 스트림 모드에 추가. LangGraph Platform 배포 환경에서 `events` 스트림 모드가 `on_chat_model_stream` 데이터를 생산하지 않는 경우(예: `langchain`의 `create_agent`로 빌드된 그래프) 스트리밍이 동작하지 않던 문제 수정.
  - **근본 원인**: (1) `messages-tuple` SSE 이벤트 타입이 `"messages"`이나 필터에서 `"messages-tuple"`과 매칭 실패로 누락, (2) `messages-tuple` 데이터가 `[AIMessageChunk, metadata]` 배열 형태로 도착하여 기존 핸들러 비호환.
  - **langgraph-sdk 0.3.11 (Mar 11)**: cron timezone 지원 추가 + v1.1.0 릴리스 연동 의존성 업데이트.
- **KonaI-Agent 관련성**: 구현 완료된 multi_agent_orchestration_ui가 AG-UI+LangGraph 통합을 사용 중이라면, `@ag-ui/langgraph` 패키지를 최신 버전으로 업데이트하여 `messages-tuple` 호환성 확보 필요. 이전 버전 사용 시 LangGraph Platform 배포에서 스트리밍 미작동 위험.
- **confidence**: high (AG-UI 공식 통합 코드 직접 수정)

#### UPDATE-6: integration_management
- **현재 구현**: research_needed (admin ops 리포트 NEW-7에서 최초 발견, 리서치 미착수).
- **경쟁사 변화**:
  - **Google Agentspace (Mar 11)**: Google Chat Data Connector가 Public Preview로 출시. 조직 내 Google Chat 데이터를 Gemini Enterprise에 검색 가능한 데이터 소스로 연결. 동시에 GitHub, Microsoft SharePoint, Notion, Shopify 커넥터에 액션(Action) 지원 추가 (Public Preview).
  - **의미**: 데이터 커넥터(읽기)에서 액션(쓰기/실행)으로 확장. 에이전트가 외부 시스템을 조회할 뿐 아니라 직접 조작 가능. 관리자가 이러한 커넥터+액션을 등록/해제/권한 관리하는 UI 필요성 강화.
- **개선 포인트**:
  1. **커넥터+액션 분리 권한 관리**: 읽기(데이터 소스 연결)와 쓰기(액션 실행)를 별도 권한으로 제어하는 UX
  2. **멀티 플랫폼 커넥터 카탈로그**: GitHub, SharePoint, Notion, Shopify, Google Chat 등 다양한 외부 서비스를 일관된 UI로 관리
  3. **액션 실행 로그**: 에이전트가 외부 시스템에 수행한 액션의 감사 로그 (audit_log와 연계)
- **confidence**: medium (1개 제품의 신규 기능이나, 커넥터+액션 분리 패턴이 엔터프라이즈 보편적 요구사항)

---

## 우선순위 변경 제안 (PRIORITY_CHANGE)

| # | component_id | 현재 priority | 제안 priority | 근거 |
|---|-------------|--------------|--------------|------|
| 1 | context_window_indicator | low | **medium** | Windsurf가 컨텍스트 윈도우 인디케이터를 정식 구현. Cursor도 세션 메모리/컨텍스트 표시. 사용자가 에이전트 컨텍스트 한계를 인지하고 새 세션 시작 결정에 필요한 핵심 UX 요소 |

---

## 리서치 노후 (STALE)

해당 없음. 1일 스캔으로 30일 경과 + 변화 감지 조건을 충족하는 항목 없음.

---

## 폐기 후보 (DEPRECATED)

해당 없음.

---

## 권장 다음 액션

우선순위순 정렬:

| # | 액션 | 대상 | 이유 | priority |
|---|------|------|------|----------|
| 1 | `/research nl_to_chart` (Phase 2) | UPDATE-2 | Gemini NL→Spreadsheet + Databricks NL→Dashboard로 패턴 진화. 기존 단일 차트→전체 대시보드 생성 패턴 리서치 필요 | high |
| 2 | `/research generative_ui` (Phase 2) | UPDATE-1 | ChatGPT Interactive Visuals로 인터랙티브 생성 UI 대규모 배포 확인. Phase 2 A2UI 호환 설계 업데이트 필요 | high |
| 3 | `/research agent_marketplace` | UPDATE-4 | Cursor 30+ 플러그인 생태계 확립. MCP 기반 3계층 구조 리서치 필요 | medium |
| 4 | `/research integration_management` | UPDATE-6 | Google Agentspace Mar 11 커넥터+액션 5종 동시 출시. 읽기/쓰기 분리 권한 UX 리서치 필요 | medium |
| 5 | `/implement scheduled_agent_tasks` | UPDATE-3 | 리서치 완료 상태. Codex hooks + Cursor Automations + Windsurf 후킹 패턴 추가 반영 후 구현 | medium |
| 6 | `/research context_window_indicator` | PRIORITY_CHANGE-1 | Windsurf 정식 구현, 사용자 UX 핵심. 간단한 구현이므로 리서치 후 바로 구현 가능 | medium |

카탈로그 직접 수정 제안:

| # | component_id | 필드 | 현재 | 제안 |
|---|-------------|------|------|------|
| 1 | context_window_indicator | priority | low | medium |
| 2 | multi_agent_orchestration_ui | notes | (기존) | 추가: "AG-UI PR #1257 (Mar 11): `messages-tuple` 스트림 모드 추가로 LangGraph Platform 배포 환경 스트리밍 호환성 수정. `@ag-ui/langgraph` 최신 버전 사용 권장." |
| 3 | integration_management | notes | (기존) | 추가: "Google Agentspace (Mar 11): Google Chat Data Connector + GitHub/SharePoint/Notion/Shopify 액션 Public Preview. 커넥터별 읽기/쓰기(액션) 권한 분리 관리 패턴 참조." |

---

## 누적 액션 추적

### 이전 리포트 권장 액션 실행 여부

| 리포트 | 액션 | 상태 | 비고 |
|--------|------|------|------|
| 2026-03-11 (admin) | /research audit_log | **실행 완료** | last_researched: 2026-03-11, status: implemented |
| 2026-03-11 (admin) | /research agent_config | **실행 완료** | last_researched: 2026-03-11, status: implemented |
| 2026-03-11 (admin) | /research knowledge_base_management | **실행 완료** | last_researched: 2026-03-11, status: implemented |
| 2026-03-11 (admin) | /research feedback_quality_management | **실행 완료** | last_researched: 2026-03-11, status: implemented |
| 2026-03-11 (admin) | /research admin_agent_registry | 미실행 | 카탈로그 추가만 완료, 리서치 브리프 미작성 |
| 2026-03-11 (admin) | /research prompt_management | 미실행 | 변동 없음 |
| 2026-03-11 (admin) | /research cost_budget_controls | 미실행 | 변동 없음 |
| 2026-03-11 (admin) | /research system_health_dashboard | 미실행 | 변동 없음 |
| 2026-03-11 (admin) | /research integration_management | 미실행 | 변동 없음 |
| 2026-03-11 (admin) | /research data_retention_privacy | 미실행 | 변동 없음 |
| 2026-03-11 (admin) | /research usage_monitoring Phase 2 | 미실행 | **6회 연속 권장** |
| 2026-03-11 (broad) | /implement multi_agent_orchestration_ui | **실행 완료** | status: implemented, QA PASS (2026-03-06) |
| 2026-03-11 (broad) | /research agent_marketplace | 미실행 | 2회 연속 미실행 |
| 2026-03-11 (broad) | /research session_branching | **실행 완료** | last_researched: 2026-03-11, status: implemented |

### 누적 미실행 (3회 이상 연속 권장)

| 액션 | 연속 횟수 | 현재 상태 | 비고 |
|------|----------|----------|------|
| /research usage_monitoring Phase 2 | 6회 | Phase 1 QA PASS | admin 리서치와 병합하여 Phase 2 설계 권장 |

### 완료 하이라이트

2026-03-11 리포트 이후 대규모 실행 완료:
- **4건 admin 컴포넌트** 리서치+구현 완료 (audit_log, agent_config, knowledge_base_management, feedback_quality_management)
- **multi_agent_orchestration_ui** 구현+QA PASS
- **session_branching** 리서치+구현 완료
