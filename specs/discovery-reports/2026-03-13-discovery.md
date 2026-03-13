# Discovery Report — 2026-03-13

## 스캔 설정
- **모드**: broad
- **시간 범위**: 2026-03-12 ~ 2026-03-13 (1일간)
- **이전 리포트**: 2026-03-12-discovery.md (broad)

## 확인한 소스

| # | 소스 | URL | 상태 |
|---|------|-----|------|
| 1 | ChatGPT changelog | help.openai.com (403) → releasebot.io | 변경 없음 (최근: Mar 10 Interactive Math/Science) |
| 2 | Claude blog | claude.com/blog | 확인 완료 — **Interactive Charts, Diagrams & Visualizations (Mar 12)** |
| 3 | Cursor changelog | cursor.com/changelog | 변경 없음 (최근: Mar 11 30+ Plugins) |
| 4 | Gemini release notes | gemini.google/release-notes | 변경 없음 (최근: Feb 19) |
| 5 | Windsurf changelog | windsurf.com/changelog | 변경 없음 (최근: Mar 9 v1.9577.24) |
| 6 | Bolt.new | support.bolt.new/release-notes | 변경 없음 (최근: Mar 6) |
| 7 | v0 by Vercel | v0.app/changelog | 변경 없음 (최근: Mar 11 bug fixes) |
| 8 | GitHub Copilot | github.com/features/copilot/whats-new | 변경 없음 |
| 9 | Salesforce Agentforce | salesforce.com/blog | 변경 없음 |
| 10 | MS Copilot Studio | learn.microsoft.com/copilot-studio | 확인 완료 — **Work IQ (Preview, Mar 2026) + Prompt Builder 개선 (Feb 2026)** |
| 11 | Google Agentspace | cloud.google.com/agentspace/docs/release-notes | 변경 없음 (최근: Mar 11, 이전 리포트 기록) |
| 12 | ThoughtSpot | thoughtspot.com/blog + globenewswire.com | 확인 완료 — **Spotter Semantics 발표 (Mar 12)**: AI 시맨틱 레이어 + Metrics Catalog + Spotter Agents + MCP 서버 |
| 13 | Power BI | learn.microsoft.com/power-bi | 변경 없음 (Feb 2026 update가 최신) |
| 14 | Hex AI | hex.tech/blog | 변경 없음 |
| 15 | AG-UI | github.com/ag-ui-protocol/ag-ui/releases | 변경 없음 (최근: Mar 11 PR #1257) |
| 16 | MCP | github.com/modelcontextprotocol | 확인 불가 (직접 확인 미수행) |
| 17 | CopilotKit | github.com/CopilotKit/CopilotKit/releases | 변경 없음 (최근: Mar 6 v1.53.0) |
| 18 | LangGraph | github.com/langchain-ai/langgraph/releases | 변경 없음 (최근: Mar 11 1.1.1) |
| 19 | CrewAI | github.com/crewAIInc/crewAI/releases | 변경 없음 (최근: Mar 11 alpha) |
| 20 | Vercel AI SDK | github.com/vercel/ai/releases | 확인 완료 — @ai-sdk/xai@4.0.0-beta.6 (Mar 12, Responses API default) |
| 21 | Open WebUI | github.com/open-webui/open-webui/releases | 변경 없음 (최근: Mar 9) |
| 22 | LobeChat | github.com/lobehub/lobe-chat/releases | 확인 완료 — v2.1.40 (Mar 12, DB schema: topic description) |
| 23 | Chainlit | github.com/Chainlit/chainlit/releases | 변경 없음 (최근: Mar 5 v2.10.0) |
| 24 | LangChain blog | blog.langchain.com | 변경 없음 |
| 25 | NNGroup | nngroup.com/articles | 변경 없음 (최근: Mar 9) |

## 보충 검색 쿼리

| # | 쿼리 | 결과 수 |
|---|------|--------|
| 1 | "AI agent UI" OR "agentic interface" new feature "March 2026" | 10건 |
| 2 | "human-in-the-loop" OR "AI approval" UI pattern "March 2026" | 0건 |
| 3 | "conversational AI" OR "chat UI" framework release "March 2026" | 10건 |
| 4 | "enterprise AI dashboard" OR "AI copilot admin" "March 2026" | 10건 |
| 5 | "AI data visualization" OR "natural language query" dashboard "March 2026" | 10건 |

---

## 요약

- 신규 패턴 발견: 0건
- 개선 필요: **4건**
- 우선순위 변경 제안: 0건
- 리서치 노후: 0건
- 폐기 후보: 0건
- **중복 필터링으로 제외**: 6건

> 1일간 스캔. Claude가 Mar 12에 대화 내 인터랙티브 시각화(차트, 다이어그램) 생성 기능을 정식 출시하여, ChatGPT Interactive Math/Science Visuals(Mar 10)에 이어 2일 만에 두 번째 주요 경쟁사가 인터랙티브 Generative UI를 프로덕션에 배포. 이로써 "대화 내 인터랙티브 시각화 생성"이 업계 표준 패턴으로 확립. ThoughtSpot이 같은 날(Mar 12) Spotter Semantics를 발표하여 AI 시맨틱 레이어 + Metrics Catalog + 역할별 Spotter Agents + MCP 서버를 공개 — NL→Analytics 신뢰성 패턴의 새로운 기준. MS Copilot Studio는 Work IQ(Preview)로 M365 데이터 연결 및 프롬프트 빌더 인라인 편집 개선을 발표.

---

## 중복 필터링 상세

| # | 항목 | 이전 리포트 매핑 | 처리 |
|---|------|----------------|------|
| 1 | MS Agent Dashboard (Mar 2026 GA) | 2026-03-11 admin — agent_registry NEW-1 | 제외 |
| 2 | MS Agent Registry in admin center | 2026-03-11 admin — agent_registry NEW-1 | 제외 |
| 3 | Databricks AI-BI NL→Dashboard | 2026-03-12 broad — nl_to_chart UPDATE-2 | 제외 |
| 4 | Google Agentspace 커넥터+액션 | 2026-03-12 broad — integration_management UPDATE-6 | 제외 |
| 5 | Vercel AI SDK @ai-sdk/xai@4.0.0-beta.6 (Mar 12) | — | xAI 프로바이더의 Responses API 기본값 변경. 내부 프로바이더 설정 변경으로 UI 패턴 영향 없음. 보고 기준 미달 | 제외 |
| 6 | LobeChat v2.1.40 (Mar 12) | — | DB 스키마 마이그레이션(topic description 컬럼 추가). 백엔드 변경으로 UI 패턴 영향 미미. 보고 기준 미달 | 제외 |

---

## 개선 필요 (UPDATE)

| # | component_id | 현재 상태 | 발견 내용 | 출처 |
|---|-------------|----------|----------|------|
| 1 | generative_ui | implemented (QA PASS) | Claude Interactive Visualizations — 대화 내 인터랙티브 차트/다이어그램 인라인 생성 | claude.com/blog (Mar 12) |
| 2 | nl_to_chart | implemented | Claude + ChatGPT 동시 대화 내 시각화 생성 → "질문하면 차트" 패턴 표준화 | claude.com/blog (Mar 12) |
| 3 | prompt_management | not_implemented | MS Copilot Studio Prompt Builder 인라인 편집 + 모델별 콘텐츠 모더레이션 감도 설정 | learn.microsoft.com/copilot-studio (Mar 2026) |
| 4 | nl_to_chart | implemented | ThoughtSpot Spotter Semantics — AI 시맨틱 레이어 + Metrics Catalog + MCP 서버 출시 | globenewswire.com (Mar 12) |

### 상세

#### UPDATE-1: generative_ui
- **현재 구현**: Phase 1 Static MVP. 8종 컴포넌트 type dispatch, JSON 기반 선언적 렌더링. QA PASS (2026-03-04)
- **경쟁사 변화**:
  - **Claude Interactive Visualizations** (2026-03-12): 대화 내에서 인터랙티브 차트, 다이어그램, 시각화를 **인라인으로 직접 생성**. Artifact 패널이 아닌 대화 흐름 내에 임시적으로 표시되며, 대화가 진행되면서 변화하거나 사라짐. 모든 플랜에서 기본 활성화.
  - **핵심 차별점**: Claude는 시각화를 "대화 보조 도구"로 정의 — Artifact(영구, 공유 가능)와 구별. 사용자가 조정을 요청하면 시각화가 동적으로 업데이트.
  - **ChatGPT Interactive Math/Science** (Mar 10, 이전 리포트 기록): 70+ 수학/과학 인터랙티브 시각화, 변수 실시간 조작
  - **업계 트렌드**: **2일 간격으로 ChatGPT(Mar 10) → Claude(Mar 12)** 순서로 인터랙티브 Generative UI를 정식 출시. 대화 내 동적 시각화가 업계 표준 패턴으로 확립
- **개선 포인트**:
  1. **인라인 임시 시각화 모드**: Artifact(영구 패널)와 별도로, 대화 흐름 내 인라인 시각화 지원 (Claude 패턴)
  2. **시각화 동적 업데이트**: 사용자 요청에 따라 기존 시각화를 수정/확장하는 인터랙션
  3. **Phase 2 인터랙티브 컴포넌트 우선순위 상향**: ChatGPT+Claude 동시 채택으로 confidence: high
- **confidence**: **high** (ChatGPT + Claude 2대 AI 챗봇이 2일 간격으로 동일 패턴 정식 출시)

#### UPDATE-2: nl_to_chart
- **현재 구현**: Phase 1+2 완료. Heuristic 차트 타입 추천 + 멀티 위젯 대시보드 + 10종 차트
- **경쟁사 변화**:
  - **Claude** (Mar 12): "draw this as a diagram" 또는 "visualize how this might change over time" 같은 자연어 명령으로 차트/다이어그램을 대화 내 즉시 생성
  - 이전 리포트의 Gemini NL→Spreadsheet, Databricks NL→Dashboard에 더해, Claude도 NL→Chart 패턴 채택
  - **패턴 수렴**: ChatGPT, Claude, Gemini, Databricks, Power BI — 5대 플랫폼이 NL→시각화 패턴 보유
- **개선 포인트**:
  1. **대화 내 즉석 시각화**: 별도 대시보드 빌더 없이 대화 중 "이것을 차트로 그려줘" 패턴 지원
  2. **시각화 수정 대화**: 생성된 차트에 대해 "색상 변경", "축 범위 조정" 등 후속 대화로 수정
- **confidence**: high (5개 이상 플랫폼 동시 채택)

#### UPDATE-3: prompt_management
- **현재 구현**: not_implemented. 리서치 브리프 작성 완료 (2026-03-11, last_researched)
- **경쟁사 변화**:
  - **MS Copilot Studio Prompt Builder** (Feb-Mar 2026):
    1. **콘텐츠 모더레이션 감도 프롬프트별 설정**: hate/fairness, sexual, violence, self-harm 카테고리별 low/high 감도 제어 — 규제 산업 및 문서 처리 시나리오 지원
    2. **인라인 편집**: 에이전트 도구 상세에서 프롬프트 인스트럭션과 설정을 직접 편집 — 모델 선택, 입력, 지식, 테스트를 단일 화면에서 수행
    3. **Claude 모델 선택**: Opus 4.6, Sonnet 4.5 선택 가능 — 프롬프트별 reasoning depth/quality/latency/cost 세밀 제어
  - **Work IQ** (Preview, Mar 2026): Microsoft 365 파일/이메일/미팅/채팅의 실시간 인사이트를 에이전트에 연결하는 도구 — 프롬프트와 지식 소스의 통합 관리 맥락
- **개선 포인트**:
  1. **프롬프트별 콘텐츠 모더레이션**: 프롬프트 편집 화면에 safety 감도 설정 UI 추가
  2. **인라인 프롬프트 테스트**: 프롬프트 편집 → 즉시 테스트 → 결과 확인의 단일 화면 UX
  3. **모델 바인딩 세밀화**: 프롬프트별 모델 선택 + 비용/지연시간/품질 트레이드오프 표시
- **confidence**: medium (1개 제품의 정식 기능이나, 엔터프라이즈 프롬프트 관리의 표준 기대사항)

#### UPDATE-4: nl_to_chart (ThoughtSpot Spotter Semantics)
- **현재 구현**: Phase 1+2 완료. Heuristic 차트 타입 추천 + 멀티 위젯 대시보드 + 10종 차트
- **경쟁사 변화**:
  - **ThoughtSpot Spotter Semantics** (2026-03-12): AI 네이티브 시맨틱 레이어를 공개하여 자연어→SQL 변환의 신뢰성을 근본적으로 개선:
    1. **Metrics Catalog**: 중앙 집중 메트릭 관리 UI. 커스텀 메트릭/코호트/캘린더/수식을 비주얼 인터페이스로 정의. 메트릭 드리프트 방지
    2. **Next-gen Search Tokens**: 결정론적 SQL 생성 + 쿼리 라우팅(상세/집계 테이블 자동 선택)으로 NL 쿼리 정확도 향상
    3. **Spotter Agents**: 역할별(분석가/엔지니어/개발자/비즈니스) 분석 워크플로우 자동화 에이전트
    4. **MCP 서버 출시**: Snowflake/Databricks/dbt와 상호운용 가능한 Model Context Protocol 서버 공개
  - **패턴 의미**: NL→Analytics의 "정확도 문제"를 시맨틱 레이어로 해결하는 접근. Heuristic 기반 차트 타입 추천(현 KonaI-Agent)에서 시맨틱 레이어 기반 정밀 매핑으로의 진화 방향 제시
- **개선 포인트**:
  1. **Metrics Catalog UI**: 메트릭 정의/관리 화면 — NL 쿼리의 신뢰성 기반 마련
  2. **역할별 에이전트 분석**: Spotter Agents처럼 사용자 역할에 따른 분석 워크플로우 최적화
  3. **MCP 기반 데이터 소스 통합**: ThoughtSpot + Databricks + 기타 플랫폼의 MCP 서버 채택 확산 추세 반영
- **confidence**: medium (1개 제품의 정식 발표이나, NL→Analytics 분야 선도 기업의 아키텍처 전환)

---

## 우선순위 변경 제안 (PRIORITY_CHANGE)

해당 없음.

---

## 리서치 노후 (STALE)

해당 없음. 1일 스캔으로 30일 경과 + 변화 감지 조건을 충족하는 항목 없음.

> 참고: tool_call_display (last_researched: 2026-02-23, 18일), approval_rejection (2026-02-21, 20일), document_viewer (2026-02-21, 20일), artifact_panel (2026-02-18, 23일), ppt_slide_preview (2026-02-16, 25일)이 30일에 접근 중이나, 해당 분야에서 유의미한 변화가 감지되지 않아 STALE 처리하지 않음.

---

## 폐기 후보 (DEPRECATED)

해당 없음.

---

## 권장 다음 액션

우선순위순 정렬:

| # | 액션 | 대상 | 이유 | priority |
|---|------|------|------|----------|
| 1 | `/research generative_ui` (Phase 2) | UPDATE-1 | ChatGPT(Mar 10)+Claude(Mar 12) 동시 인터랙티브 시각화 출시. confidence: high. Phase 2 인터랙티브 컴포넌트 설계에 두 경쟁사 패턴 반영 필요 | high |
| 2 | `/implement prompt_management` | UPDATE-3 | 리서치 완료 상태(Mar 11). MS Copilot Studio의 인라인 편집+모더레이션+모델 바인딩 패턴이 기존 리서치 브리프와 일치. 구현 착수 가능 | high |
| 3 | `/research nl_to_chart` (Phase 3) | UPDATE-2 | 5대 플랫폼(ChatGPT, Claude, Gemini, Databricks, Power BI)이 NL→시각화 보유. 대화형 시각화 수정 패턴 리서치 필요 | medium |
| 4 | `/research agent_marketplace` | (이전 리포트) | 3회 연속 권장. Cursor 30+ 플러그인 생태계 리서치 | medium |
| 5 | `/research usage_monitoring` Phase 2 | (이전 리포트) | 7회 연속 권장. MS Agent Dashboard GA 반영 | medium |

카탈로그 직접 수정 제안:

| # | component_id | 필드 | 현재 | 제안 |
|---|-------------|------|------|------|
| 1 | generative_ui | notes | (기존) | 추가: "Claude Interactive Visualizations (Mar 12): 대화 내 인라인 인터랙티브 차트/다이어그램 생성. Artifact와 구별되는 임시 시각화. ChatGPT(Mar 10)+Claude(Mar 12) 동시 출시로 인터랙티브 Generative UI가 업계 표준 확립." |
| 2 | prompt_management | notes | (기존) | 추가: "MS Copilot Studio (Feb-Mar 2026): 프롬프트별 콘텐츠 모더레이션 감도 설정(low/high), 에이전트 도구 내 인라인 프롬프트 편집(모델선택+입력+지식+테스트 통합), Claude Opus 4.6/Sonnet 4.5 모델 선택." |

---

## 누적 액션 추적

### 이전 리포트 권장 액션 실행 여부

| 리포트 | 액션 | 상태 | 비고 |
|--------|------|------|------|
| 2026-03-12 | /research nl_to_chart Phase 2 | **실행 완료** | last_researched: 2026-03-12, Phase 2 구현 완료 |
| 2026-03-12 | /research generative_ui Phase 2 | 미실행 | 변동 없음 |
| 2026-03-12 | /research agent_marketplace | 미실행 | 3회 연속 미실행 |
| 2026-03-12 | /research integration_management | 미실행 | 변동 없음 |
| 2026-03-12 | /implement scheduled_agent_tasks | 미실행 | 변동 없음 |
| 2026-03-12 | /research context_window_indicator | 미실행 | 변동 없음 |
| 2026-03-12 | catalog: context_window_indicator.priority low→medium | 미적용 | 현재: low (구 값 유지) |
| 2026-03-11 (admin) | /research admin_agent_registry | 미실행 | 변동 없음 |
| 2026-03-11 (admin) | /research prompt_management | **실행 완료** | last_researched: 2026-03-11, 리서치 브리프 작성 완료 |
| 2026-03-11 (admin) | /research cost_budget_controls | 미실행 | 변동 없음 |
| 2026-03-11 (admin) | /research system_health_dashboard | 미실행 | 변동 없음 |
| 2026-03-11 (admin) | /research integration_management | 미실행 | 변동 없음 |
| 2026-03-11 (admin) | /research data_retention_privacy | 미실행 | 변동 없음 |
| 2026-03-11 (admin) | /research usage_monitoring Phase 2 | 미실행 | **7회 연속 권장** |

### 누적 미실행 (3회 이상 연속 권장)

| 액션 | 연속 횟수 | 현재 상태 | 비고 |
|------|----------|----------|------|
| /research usage_monitoring Phase 2 | 7회 | Phase 1 QA PASS | MS Agent Dashboard GA 반영하여 Phase 2 설계 시급 |
| /research agent_marketplace | 3회 | not_implemented | Cursor 30+ 플러그인 생태계 리서치 미착수 |
