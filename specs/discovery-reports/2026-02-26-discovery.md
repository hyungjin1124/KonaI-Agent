# Discovery Report — 2026-02-26

## 스캔 설정
- **모드**: broad
- **시간 범위**: 2026-02-25 ~ 2026-02-26 (1일간)
- **이전 리포트**: 2026-02-25-discovery-2.md

## 확인한 소스

| # | 소스 | URL | 상태 |
|---|------|-----|------|
| 1 | ChatGPT changelog | help.openai.com/en/articles/6825453-chatgpt-release-notes | 접근 실패 (403), Fallback 사용 |
| 2 | ChatGPT (Fallback) | releasebot.io/updates/openai/chatgpt | 확인 완료 — **변경 있음 (Feb 25: Projects Knowledge Base)** |
| 3 | Claude blog | claude.com/blog | 확인 완료 — 변경 없음 (최근: Jan 12) |
| 4 | Cursor changelog | cursor.com/changelog | 확인 완료 — 변경 없음 (최근: Feb 24, Cloud Agents) |
| 5 | Gemini release notes | gemini.google/release-notes | 확인 완료 — 변경 없음 (최근: Feb 19) |
| 6 | Windsurf changelog | windsurf.com/changelog | 확인 완료 — **변경 있음 (Feb 25: v1.9566.9, Model Picker)** |
| 7 | Bolt.new | support.bolt.new/release-notes | 확인 완료 — 변경 없음 (최근: Feb 20) |
| 8 | v0 changelog | v0.app/changelog | 확인 완료 — 변경 없음 (최근: Feb 23) |
| 9 | GitHub Copilot | github.com/features/copilot/whats-new | 확인 완료 — 변경 있음 (Feb 25: 페이지 콘텐츠 업데이트, 신기능 없음) |
| 10 | Salesforce Agentforce | salesforce.com/news | 확인 완료 — Feb 25: Q4 FY26 실적 발표 (UI 변경 없음) |
| 11 | MS Copilot Studio | learn.microsoft.com/copilot-studio | 확인 완료 — 변경 없음 (February 2026 rollout 진행 중) |
| 12 | Google Agentspace | cloud.google.com/agentspace + 9to5google | 확인 완료 — **변경 있음 (Feb 25: Gemini Enterprise 모바일 앱)** |
| 13 | ThoughtSpot blog | thoughtspot.com/blog | 확인 완료 — 변경 없음 (최근: Feb 18) |
| 14 | Power BI blog | powerbi.microsoft.com/blog | 확인 완료 — 변경 없음 (최근: Feb 24) |
| 15 | Hex blog | hex.tech/blog | 확인 완료 — 변경 없음 (최근: Jan 28) |
| 16 | AG-UI | github.com/ag-ui-protocol/ag-ui/releases | 확인 완료 — 릴리스 없음 |
| 17 | MCP TypeScript SDK | github.com/modelcontextprotocol/typescript-sdk/releases | 확인 완료 — 변경 없음 (최근: v1.27.1, Feb 24) |
| 18 | MCP Spec | spec.modelcontextprotocol.io | 접근 실패 (인증서 오류) |
| 19 | CopilotKit | github.com/CopilotKit/CopilotKit/releases | 확인 완료 — 변경 없음 (최근: v1.51.4, Feb 17) |
| 20 | LangGraph | github.com/langchain-ai/langgraph/releases | 확인 완료 — 변경 없음 (최근: SDK v0.3.9, Feb 24) |
| 21 | CrewAI | github.com/crewAIInc/crewAI/releases | 확인 완료 — 변경 없음 (최근: v1.10.0a1, Feb 19) |
| 22 | Vercel AI SDK | github.com/vercel/ai/releases | 확인 완료 — Feb 25: @ai-sdk/togetherai env var 변경 (UI 무관) |
| 23 | Open WebUI | github.com/open-webui/open-webui/releases | 확인 완료 — 변경 없음 (최근: v0.8.5, Feb 23) |
| 24 | LobeChat | github.com/lobehub/lobe-chat/releases | 확인 완료 — Feb 25: canary v2.1.34-canary.6 (비정식) |
| 25 | Chainlit | github.com/Chainlit/chainlit/releases | 확인 완료 — 변경 없음 (최근: v2.9.6, Jan 2025) |
| 26 | NNGroup | nngroup.com/articles | 확인 완료 — 변경 없음 (최근: Feb 6) |

## 보충 검색 쿼리

| # | 쿼리 | 결과 수 |
|---|------|--------|
| 1 | "AI agent UI" OR "agentic interface" new feature February 2026 | 10건 |
| 2 | "human-in-the-loop" OR "AI approval" UI pattern February 2026 | 10건 |
| 3 | "conversational AI" OR "chat UI" framework release February 2026 | 10건 |
| 4 | "enterprise AI dashboard" OR "AI copilot admin" February 2026 | 10건 |
| 5 | "AI data visualization" OR "natural language query" dashboard February 2026 | 10건 |

---

## 요약

- 신규 패턴 발견: **1**건
- 개선 필요: **2**건
- 우선순위 변경 제안: **0**건
- 리서치 노후: **0**건
- 폐기 후보: **0**건
- **중복 필터링으로 제외**: **7**건

> 1일간 스캔. ChatGPT Projects에 지식 베이스 기능 추가(앱/대화/텍스트 소스 축적). Windsurf에 모델 패밀리 그루핑 + 핀 기능의 새 Model Picker 출시. Google이 A2UI(Agent-to-UI) 프로토콜을 공개 — 에이전트가 크로스플랫폼으로 UI를 동적 생성하는 상호운용 포맷.

---

## 신규 패턴 (NEW)

| # | 패턴명 | 설명 | 발견 출처 | 관련 카테고리 | 권장 priority | 권장 complexity | confidence |
|---|--------|------|----------|-------------|--------------|----------------|------------|
| 1 | A2UI (Agent-to-UI Protocol) | 에이전트가 크로스플랫폼 UI를 동적 생성하는 상호운용 포맷 | Google Developers Blog | generative_emerging | medium | complex | low |

### 상세

#### NEW-1: A2UI (Agent-to-UI Protocol)
- **발견 출처**: https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/
- **경쟁사 현황**: Google이 A2UI 프로젝트를 공개. 에이전트가 컨텍스트에 적합한 UI 인터페이스를 생성하여 프론트엔드 애플리케이션에 전달하는 상호운용 포맷. AG-UI(CopilotKit)의 이벤트 스트리밍 프로토콜과 달리 UI 렌더링 스펙에 초점.
- **KonaI-Agent 관련성**: 기존 카탈로그의 `generative_ui`와 밀접. A2UI는 에이전트가 구조화된 UI 스펙을 반환하는 "Declarative" 방식의 구체적 프로토콜 구현체. AG-UI(이벤트 스트리밍) + A2UI(UI 스펙) + MCP(도구 호출) 3개 프로토콜의 역할 분담이 명확해지고 있어, `generative_ui` 리서치 시 A2UI 스펙을 참조 모델로 포함할 가치가 있음.
- **confidence**: low (Google 1개 제품, 공개 직후 — 아직 채택 사례 미확인)

---

## 개선 필요 (UPDATE)

| # | component_id | 현재 상태 | 발견 내용 | 출처 |
|---|-------------|----------|----------|------|
| 1 | model_agent_switcher | not_implemented | Windsurf Feb 25: 새 Model Picker — 모델 패밀리 그루핑, 핀(즐겨찾기) 기능 | Windsurf changelog |
| 2 | memory_management | not_implemented | ChatGPT Feb 25: Projects에 지식 베이스 기능 — 앱, 대화, 텍스트 소스를 추가하여 living knowledge base 구축 | releasebot.io/updates/openai/chatgpt |

### 상세

#### UPDATE-1: model_agent_switcher
- **현재 구현**: not_implemented (priority: medium, complexity: simple). 대화 중 모델 또는 에이전트를 전환하는 드롭다운
- **경쟁사 변화**:
  - **Windsurf v1.9566.9** (Feb 25, 2026): 새 Model Picker 출시
    - **모델 패밀리 그루핑**: 같은 패밀리의 모델을 그룹으로 묶어 표시 (예: Claude 4.x → Claude 패밀리)
    - **Hovercard**: 모델 상세 정보 + reasoning effort/speed 토글을 호버 카드로 제공
    - **핀(Pin) 기능**: 자주 쓰는 모델을 상단에 고정
    - 기존 GitHub Copilot의 에이전트 모델 피커 + Auto 모드(2/21 리포트)에 이어 Windsurf도 모델 선택 UX 개선
  - **누적 동향**: GitHub Copilot(Auto 모드 + 에이전트 피커) + Windsurf(패밀리 그루핑 + 핀) — 2개 제품이 모델 피커 UX 강화
- **개선 포인트**: `model_agent_switcher` 리서치 시 Windsurf의 패밀리 그루핑 + 핀 패턴, GitHub Copilot의 Auto 모드 + 에이전트 피커 패턴을 함께 참조. 패밀리 그루핑은 모델 수 증가에 따른 필수 UX 패턴이 되고 있음.
- **confidence**: medium (Windsurf + GitHub Copilot 2개 제품에서 모델 피커 UX 동시 강화)

#### UPDATE-2: memory_management
- **현재 구현**: not_implemented (priority: low, complexity: complex). 에이전트의 장기 기억, 학습 내용, 지식을 관리하는 인터페이스
- **경쟁사 변화**:
  - **ChatGPT Projects** (Feb 25, 2026): "living knowledge base" 기능 추가
    - 앱(외부 서비스), 대화 이력, 빠른 텍스트 입력 등 다양한 소스를 프로젝트에 추가
    - 프로젝트 단위로 에이전트가 참조할 지식을 축적하고 관리
    - 기존 ChatGPT Memory(자동 학습)와 달리 사용자 주도로 구조화된 지식 관리
  - Claude의 Projects(2025~)와 유사하나, ChatGPT는 "소스 추가" 경로를 앱/대화/텍스트로 확장하여 더 다양한 입력 채널 제공
- **개선 포인트**: `memory_management`의 범위를 "에이전트 자동 학습 관리"에서 "사용자 주도 지식 베이스 관리"로 확장 검토. 프로젝트/워크스페이스 단위 지식 관리는 엔터프라이즈 환경에서 특히 중요 (팀별 지식 격리, 접근 제어)
- **confidence**: medium (ChatGPT + Claude 2개 제품에서 프로젝트 기반 지식 관리 패턴 확립)

---

## 중복 필터링 상세 (이전 리포트와 겹침 또는 보고 기준 미달)

| # | 항목 | 이전 리포트 매핑 | 비고 |
|---|------|---------------|------|
| 1 | Salesforce Q4 FY26 실적 발표 (Feb 25) | 2026-02-25-2 UPDATE-2 | Agentforce Builder는 이미 보고됨. 실적 발표는 UI 패턴 무관 |
| 2 | Databricks AI/BI 시각화 강화 | 2026-02-25-2 UPDATE-1 | 이미 보고됨, 추가 진전 없음 |
| 3 | GitHub Copilot Org Metrics Dashboard (Feb 20) | 2026-02-25 리포트 시점 이전 | 이미 존재, 새 항목 아님 |
| 4 | Vercel AI SDK @ai-sdk/togetherai env var 변경 (Feb 25) | — | 백엔드 환경변수 변경, UI 패턴 무관 |
| 5 | LobeChat canary v2.1.34-canary.6 (Feb 25) | — | 비정식 canary 빌드 |
| 6 | GitHub Copilot 페이지 콘텐츠 업데이트 (Feb 25) | — | 마케팅 페이지 업데이트, 신기능 없음 |
| 7 | Microsoft Security Dashboard for AI (Feb 2026 preview) | — | 보안 거버넌스 도구, AI agent UI 패턴과 직접 관련 약함 |

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

| # | 액션 | 대상 | 이유 | priority |
|---|------|------|------|----------|
| 1 | `/research model_agent_switcher` | UPDATE-1 + 누적 6회 | Windsurf 패밀리 그루핑+핀 + GitHub Copilot Auto 모드. 2개 제품에서 모델 피커 UX 동시 강화. **6회 연속 권장** | **medium** |
| 2 | `/research chat_input` | 누적 6회 | Telerik AI-ready Chat 입력 모드 전환 + prefix/suffix 패턴. **6회 연속 권장** | **medium** |
| 3 | `/research generative_ui` | NEW-1 | Google A2UI 프로토콜 공개 — AG-UI+A2UI+MCP 프로토콜 역할 분담 구체화. 기존 generative_ui 리서치에 A2UI 스펙 반영 필요 | **low** |

카탈로그 직접 수정 제안:

| # | component_id | 필드 | 현재 | 제안 |
|---|-------------|------|------|------|
| 1 | usage_monitoring | priority | medium | high |
| 2 | memory_management | notes | (없음) | 추가: ChatGPT Projects (Feb 25, 2026): living knowledge base — 앱/대화/텍스트 소스를 프로젝트에 추가하여 에이전트 참조 지식 축적. 사용자 주도 구조화 지식 관리 패턴. Claude Projects와 유사하나 입력 채널 다양화. |
| 3 | model_agent_switcher | notes | (없음) | 추가: Windsurf v1.9566.9 (Feb 25, 2026): 새 Model Picker — 모델 패밀리 그루핑 + 핀(즐겨찾기) 기능. GitHub Copilot Auto 모드 + 에이전트 피커(Feb 2026)와 함께 모델 선택 UX 강화 트렌드. |

> `usage_monitoring.priority → high`는 6회 연속 리포트에서 동일 제안. 미적용 상태.

---

## 누적 액션 추적

### 이전 리포트 (2026-02-25-2) 권장 액션 실행 여부:

| 리포트 | 액션 | 상태 | 비고 |
|--------|------|------|------|
| 2026-02-25-2 | `/research nl_to_chart` | **실행 완료** | last_researched: 2026-02-25, status: implemented |
| 2026-02-25-2 | `/research chat_input` | **미실행** | last_researched 없음 |
| 2026-02-25-2 | `/research model_agent_switcher` | **미실행** | last_researched 없음 |
| 2026-02-25-2 | catalog: usage_monitoring.priority → high | **미적용** | 현재: medium |
| 2026-02-25-2 | catalog: workflow_builder.notes 추가 | **미적용** | 현재: 기존 notes 유지 |

### 누적 미실행 (3회 이상 연속 권장):

| 리포트 | 액션 | 연속 권장 횟수 | 비고 |
|--------|------|-------------|------|
| 2026-02-21~26 | `/research chat_input` | **6회** | 우선 실행 권장 |
| 2026-02-21~26 | `/research model_agent_switcher` | **6회** | Windsurf+Copilot 2개 제품에서 동시 강화 |
| 2026-02-21~26 | catalog: usage_monitoring.priority → high | **6회** | 카탈로그 수정만으로 완료 가능 |
