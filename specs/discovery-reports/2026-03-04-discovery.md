# Discovery Report — 2026-03-04

## 스캔 설정
- **모드**: broad
- **시간 범위**: 2026-03-03 ~ 2026-03-04 (1일간)
- **이전 리포트**: 2026-03-03-discovery.md

## 확인한 소스

| # | 소스 | URL | 상태 |
|---|------|-----|------|
| 1 | ChatGPT (Fallback) | releasebot.io/updates/openai/chatgpt | 확인 완료 — 변경 없음 (최근: Feb 25) |
| 2 | Claude blog | claude.ai/blog | 접근 실패 (403) |
| 3 | Claude (Fallback) | releasebot.io/updates/anthropic/claude | 미확인 (Primary 접근 실패) |
| 4 | Cursor changelog | cursor.com/changelog | 확인 완료 — 변경 없음 (최근: Feb 26, Bugbot Autofix) |
| 5 | Gemini release notes | gemini.google/release-notes | 접근 실패 (타임아웃) |
| 6 | Windsurf changelog | windsurf.com/changelog | 확인 완료 — 변경 없음 (최근: Feb 26, v1.9566.11) |
| 7 | Bolt.new | support.bolt.new/release-notes | 접근 실패 (sibling error) |
| 8 | v0 changelog | v0.dev/changelog | 접근 실패 (타임아웃) |
| 9 | GitHub Copilot | github.com/features/copilot/whats-new | 접근 실패 (sibling error) |
| 10 | Salesforce Agentforce | salesforce.com/agentforce | 미확인 |
| 11 | MS Copilot Studio | techcommunity.microsoft.com | 확인 완료 — 이전 보고 항목(Agent Dashboard GA) 지속 |
| 12 | Google Agentspace | cloud.google.com/agentspace | 미확인 |
| 13 | ThoughtSpot | thoughtspot.com/blog | 미확인 |
| 14 | Power BI | powerbi.microsoft.com/blog | 미확인 |
| 15 | Hex | hex.tech/blog | 미확인 |
| 16 | AG-UI | github.com/ag-ui-protocol/ag-ui/releases | 확인 완료 — 릴리스 없음 (태그 없음) |
| 17 | MCP TypeScript SDK | github.com/modelcontextprotocol/typescript-sdk/releases | 확인 완료 — 변경 없음 (최근: v1.27.1, Feb 24) |
| 18 | MCP Spec | spec.modelcontextprotocol.io | 접근 실패 (인증서 오류, 2회 연속) |
| 19 | CopilotKit | github.com/CopilotKit/CopilotKit/releases | 확인 완료 — 변경 없음 (최근: v1.52.1, Feb 27) |
| 20 | LangGraph | github.com/langchain-ai/langgraph/releases | 확인 완료 — 변경 없음 (최근: v1.0.10, Feb 27) |
| 21 | LangChain blog | blog.langchain.com | 확인 완료 — 리다이렉트 확인, 날짜 미표시 |
| 22 | CrewAI | github.com/crewAIInc/crewAI/releases | 확인 완료 — 변경 없음 (최근: v1.10.1a1, Feb 27) |
| 23 | Vercel AI SDK | github.com/vercel/ai/releases | 확인 완료 — 변경 없음 |
| 24 | Open WebUI | github.com/open-webui/open-webui/releases | 확인 완료 — 변경 없음 (최근: v0.8.7, Mar 2) |
| 25 | LobeChat | github.com/lobehub/lobe-chat/releases | 확인 완료 — 변경 없음 (최근: v2.1.34, Feb 28) |
| 26 | Chainlit | github.com/Chainlit/chainlit/releases | 확인 완료 — 변경 없음 (최근: v2.9.6, Jan 20) |
| 27 | NNGroup | nngroup.com/articles (AI 태그) | 확인 완료 — 변경 없음 |

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

- 신규 패턴 발견: **1**건
- 개선 필요: **1**건
- 우선순위 변경 제안: **0**건
- 리서치 노후: **0**건
- 폐기 후보: **0**건
- **중복 필터링으로 제외**: **4**건

> 1일간 스캔. OpenAI AgentKit 발표 — Agent Builder(비주얼 멀티에이전트 워크플로우 캔버스) + ChatKit(채팅 임베딩 툴킷)이 generative_ui 및 workflow_builder에 직접 관련. GPT-5.4 리크 정보(2M 컨텍스트, 강화된 에이전틱 기능)는 보도일 Mar 3. 대부분의 소스에서 1일간 유의미한 변경 없음.

---

## 신규 패턴 (NEW)

| # | 패턴명 | 설명 | 발견 출처 | 관련 카테고리 | 권장 priority | 권장 complexity | confidence |
|---|--------|------|----------|-------------|--------------|----------------|------------|
| 1 | OpenAI AgentKit | 비주얼 멀티에이전트 워크플로우 빌더(Agent Builder) + 채팅 임베딩 툴킷(ChatKit) + 커넥터 레지스트리의 통합 에이전트 개발 플랫폼 | OpenAI 공식 발표 | generative_emerging, agent_action_patterns | high | complex | high |

### 상세

#### NEW-1: OpenAI AgentKit

- **발견 출처**: [OpenAI — Introducing AgentKit](https://openai.com/index/introducing-agentkit/)
- **경쟁사 현황**:
  - **OpenAI**: AgentKit은 3개 핵심 컴포넌트로 구성:
    1. **Agent Builder** — 비주얼 캔버스에서 멀티에이전트 워크플로우를 드래그&드롭으로 생성, 버전 관리 가능
    2. **Connector Registry** — 외부 서비스/API/도구 연결을 중앙 레지스트리로 관리
    3. **ChatKit** — 커스터마이즈 가능한 채팅 기반 에이전트 경험을 임베딩하는 드롭인 툴킷
  - 기존 ChatGPT Agents, API + Assistants API와 별개로, 엔터프라이즈 개발자 대상의 통합 빌더 도구
- **KonaI-Agent 관련성**:
  - `workflow_builder` (현재 not_implemented, medium priority) — Agent Builder의 비주얼 캔버스 패턴 직접 참조
  - `generative_ui` — ChatKit이 에이전트 UI를 드롭인으로 제공하는 패턴은 Phase 1 Static MVP 접근과 유사
  - `multi_agent_orchestration_ui` — Agent Builder의 멀티에이전트 오케스트레이션 비주얼 에디터 패턴
- **confidence**: high (OpenAI 공식 발표, 엔터프라이즈 대상)

---

## 개선 필요 (UPDATE)

| # | component_id | 현재 상태 | 발견 내용 | 출처 |
|---|-------------|----------|----------|------|
| 1 | approval_rejection | implemented | Microsoft HITL with AG-UI 공식 문서 공개 — ApprovalRequiredAIFunction을 AG-UI "client tool calls"로 변환하는 패턴. 기존 구현에 AG-UI 이벤트 기반 승인 프로토콜 추가 검토 필요. | learn.microsoft.com |

### 상세

#### UPDATE-1: approval_rejection

- **현재 구현**: implemented (Phase 1 완료). ApprovalGate 3-tier risk-based rendering (toast/inline/modal), MCP Elicitation schema form, multi-item approval. last_researched: 2026-02-21.
- **경쟁사 변화**:
  - **Microsoft Agent Framework + AG-UI HITL**: [공식 문서](https://learn.microsoft.com/en-us/agent-framework/integrations/ag-ui/human-in-the-loop) 공개. `ApprovalRequiredAIFunction`을 AG-UI의 "client tool calls" 이벤트로 변환하여 프론트엔드에 승인 UI를 동적으로 요청하는 패턴. AG-UI 프로토콜 위에서 표준화된 HITL 인터페이스 구현 가능.
  - **EU AI Act 고위험 AI 시스템 규정** (2026-08-02 전면 시행 예정): HITL이 법적 요구사항으로 격상. 기존 구현의 감사 로그, 정책 기반 승인 체계 강화 필요.
  - **Permit.io + LangGraph 통합**: 정책 기반 동적 승인 규칙. 도구 호출별 configurable policy로 HITL 미들웨어 구성.
- **개선 포인트**:
  1. AG-UI 이벤트 기반 승인 프로토콜 검토 (Phase 2)
  2. 감사 로그 연동 (`audit_log` 컴포넌트와 병행)
  3. EU AI Act 준수를 위한 문서화된 승인 이력 보관
- **confidence**: medium (Microsoft 공식 문서 1건 + 규제 동향)

---

## 중복 필터링 상세 (이전 리포트와 겹침 또는 보고 기준 미달)

| # | 항목 | 이전 리포트 매핑 | 비고 |
|---|------|-----------------|------|
| 1 | Google A2UI Protocol (Feb 26) | 2026-03-03 NEW-1 | 이미 보고됨, 추가 진전 없음 |
| 2 | MS Copilot Agent Dashboard GA (Mar 2026) | 2026-03-03 UPDATE-1 | 이미 보고됨, 추가 진전 없음 |
| 3 | GitHub Copilot Metrics GA (Feb 27) | 2026-03-03 UPDATE-1 | 이미 보고됨, 추가 진전 없음 |
| 4 | ChatSpark Conversational AI Platform (Mar 3) | — | 엔터프라이즈 고객서비스 플랫폼. AI Agent + CoPilot 통합이나, KonaI-Agent 카탈로그 범위(에이전트 대시보드 UI 패턴)와 직접 관련 낮음. 보고 기준 미달 |

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

우선순위순으로 정렬:

| # | 액션 | 대상 | 이유 | priority |
|---|------|------|------|----------|
| 1 | `/research generative_ui` | NEW-1 + 기존 research_needed | OpenAI AgentKit(Agent Builder + ChatKit) + Google A2UI + AG-UI + MCP 프로토콜 스택 — 3대 프로토콜 레이어 모두 활발. **9회 연속 권장. 최우선 실행 필수.** | **high** |
| 2 | `/research workflow_builder` | NEW-1 관련 | OpenAI Agent Builder의 비주얼 멀티에이전트 워크플로우 캔버스 패턴. 기존 ReactFlow 기반 DataManagementView 확장 가능. | **medium** |
| 3 | `/research usage_monitoring` | 이전 누적 | MS Agent Dashboard GA + GitHub Copilot Metrics GA. Phase 2 기획. **2회 연속 권장** | **high** |
| 4 | `/implement multi_agent_orchestration_ui` | 이전 누적 | 리서치 완료(2026-03-02), 구현 단계로 전환 권장. **2회 연속 권장** | **medium** |

카탈로그 직접 수정 제안:

| # | component_id | 필드 | 현재 | 제안 |
|---|-------------|------|------|------|
| 1 | workflow_builder | notes | "DataManagementView의 ReactFlow 기반을 확장하여 구현 가능." | 추가: "OpenAI AgentKit Agent Builder: 비주얼 캔버스에서 멀티에이전트 워크플로우 생성/버전관리. Connector Registry로 외부 서비스 중앙 관리." |
| 2 | generative_ui | notes | (기존) | 추가: "OpenAI AgentKit ChatKit: 드롭인 채팅 에이전트 임베딩 툴킷. Agent Builder + ChatKit + Connector Registry 통합 플랫폼." |

---

## 누적 액션 추적

### 이전 리포트 (2026-03-03) 권장 액션 실행 여부:

| 리포트 | 액션 | 상태 | 비고 |
|--------|------|------|------|
| 2026-03-03 | `/research generative_ui` | **미실행** | last_researched: 2026-03-03 (리서치 실행됨). 단, NEW-1(A2UI) 통합 리서치 필요 |
| 2026-03-03 | `/research usage_monitoring` | **미실행** | last_researched: 2026-03-01. Phase 2 기획 미착수 |
| 2026-03-03 | `/research scheduled_agent_tasks` | **실행 완료** | last_researched: 2026-03-03, 카탈로그 갱신 확인 |
| 2026-03-03 | `/research multi_agent_orchestration_ui` | **실행 완료** (이전 리포트 기준) | last_researched: 2026-03-02. 구현 단계 전환 권장 |
| 2026-03-03 | catalog: generative_ui.notes 추가 | **적용 완료** | A2UI + AG-UI + MCP Apps 내용 반영됨 |
| 2026-03-03 | catalog: usage_monitoring.notes 추가 | **적용 완료** | MS Agent Dashboard + GitHub Copilot Metrics 내용 반영됨 |

### 누적 미실행 (3회 이상 연속 권장):

| 리포트 | 액션 | 연속 권장 횟수 | 비고 |
|--------|------|------------|------|
| 2026-02-21~03-04 | `/research generative_ui` | **9회** | OpenAI AgentKit 추가. 최우선 실행 권장 |
