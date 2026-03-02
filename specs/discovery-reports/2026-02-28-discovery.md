# Discovery Report — 2026-02-28

## 스캔 설정

- **모드**: broad
- **시간 범위**: 2026-02-27 ~ 2026-02-28 (1일간)
- **이전 리포트**: 2026-02-27-discovery.md

## 확인한 소스

| # | 소스 | URL | 상태 |
|---|------|-----|------|
| 1 | ChatGPT changelog | releasebot.io/updates/openai/chatgpt | 확인 완료 — 변경 없음 (최근: Feb 25, Projects Knowledge Base) |
| 2 | Claude blog | claude.com/blog | 확인 완료 — 변경 없음 (최근: Jan 12, Cowork) |
| 3 | Perplexity | releasebot.io/updates/perplexity-ai | 확인 완료 — 변경 없음 (최근: Feb 20) |
| 4 | Cursor changelog | cursor.com/changelog | 확인 완료 — 변경 없음 (최근: Feb 26, Bugbot Autofix GA) |
| 5 | Gemini release notes | gemini.google/release-notes | 확인 완료 — 변경 없음 (최근: Feb 19, Gemini 3.1 Pro) |
| 6 | Windsurf changelog | windsurf.com/changelog | 확인 완료 — 변경 없음 (최근: Feb 26, v1.9566.11) |
| 7 | Bolt.new | support.bolt.new/release-notes | 확인 완료 — 변경 없음 (최근: Feb 20) |
| 8 | v0 changelog | v0.app/changelog | 확인 완료 — 변경 없음 (최근: Feb 25) |
| 9 | GitHub Copilot | github.blog | 확인 완료 — **변경 있음 (Feb 27: Copilot Metrics GA + CLI 활동 메트릭)** |
| 10 | Salesforce Agentforce | salesforce.com/news | 확인 완료 — 변경 없음 (최근: Feb 26) |
| 11 | MS Copilot Studio | microsoft.com/copilot-studio | 확인 완료 — 변경 없음 (최근: Feb 24) |
| 12 | Google Agentspace | cloud.google.com/agentspace | 확인 완료 — 변경 없음 (최근: Feb 26) |
| 13 | ThoughtSpot blog | thoughtspot.com/blog | 접근 부분 실패 — 보충 검색으로 확인, 변경 없음 |
| 14 | Power BI blog | powerbi.microsoft.com/blog | 확인 완료 — 변경 없음 (최근: Feb 24) |
| 15 | Hex blog | hex.tech/blog | 확인 완료 — 변경 없음 (최근: Jan 28) |
| 16 | AG-UI | github.com/ag-ui-protocol/ag-ui | 확인 완료 — 변경 없음 |
| 17 | MCP TypeScript SDK | github.com/modelcontextprotocol/typescript-sdk | 확인 완료 — Feb 27: v1.27.1 패치 (버그 수정) |
| 18 | CopilotKit | github.com/CopilotKit/CopilotKit | 확인 완료 — Feb 27: v1.52.1 (transport config fix) |
| 19 | LangGraph | github.com/langchain-ai/langgraph | 확인 완료 — Feb 27: v1.0.10 (serde events) |
| 20 | CrewAI | github.com/crewAIInc/crewAI | 확인 완료 — **변경 있음 (Feb 27: v1.10.0 메이저 릴리스)** |
| 21 | Vercel AI SDK | github.com/vercel/ai | 확인 완료 — Feb 27: v6.0.104 (유지보수) |
| 22 | Open WebUI | github.com/open-webui/open-webui | 확인 완료 — 변경 없음 (최근: v0.8.5, Feb 23) |
| 23 | LobeChat | github.com/lobehub/lobe-chat | 확인 완료 — Feb 27: canary 빌드만 (비정식) |
| 24 | Chainlit | github.com/Chainlit/chainlit | 확인 완료 — 변경 없음 (최근: v2.9.6, Jan 20) |
| 25 | NNGroup | nngroup.com/articles | 확인 완료 — **변경 있음 (Feb 28: GenAI for Complex Questions, Search for Critical Facts)** |

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

- 신규 패턴 발견: **0**건
- 개선 필요: **2**건
- 우선순위 변경 제안: **0**건
- 리서치 노후: **0**건
- 폐기 후보: **0**건
- **중복 필터링으로 제외**: **6**건

> 1일간 스캔. GitHub Copilot Metrics가 GA로 전환되어 조직별 CLI 활동 메트릭 대시보드를 제공 — `usage_monitoring` 컴포넌트 구현 시 참고 사례 추가. NNGroup이 "GenAI for Complex Questions, Search for Critical Facts" 연구를 게시하여 AI와 검색의 보완적 관계를 실증 — `citation_source_link` 컴포넌트의 UX 근거 강화. CrewAI 1.10.0 메이저 릴리스로 HITL in Flows, async step callbacks 등이 추가되었으나 1개 프레임워크 단독 기능으로 보고 기준 미달.

---

## 개선 필요 (UPDATE)

| # | component_id | 현재 상태 | 발견 내용 | 출처 |
|---|-------------|----------|----------|------|
| 1 | usage_monitoring | not_implemented | GitHub Copilot Metrics GA: 조직별 사용량 대시보드 + CLI 활동 메트릭. MS Agent Dashboard도 2월 GA 전환 | GitHub Blog, GitHub Changelog |
| 2 | citation_source_link | implemented | NNGroup 연구: AI는 탐색적·종합적 작업, 검색은 사실 확인·신뢰성 — 출처 표시가 AI 신뢰도의 핵심 UX 요소 | NNGroup |

### 상세

#### UPDATE-1: usage_monitoring

- **현재 구현**: not_implemented (priority: medium → 8회 연속 high 제안 중). API 사용량, 토큰 소비, 비용, 에이전트 성능 모니터링 대시보드.
- **경쟁사 변화**:
  - **GitHub Copilot** (Feb 27): Copilot Metrics GA — 조직 레벨 사용량 메트릭 대시보드. CLI 활동 메트릭 추가. 기존 엔터프라이즈 레벨에서 조직 레벨로 확대.
  - **Microsoft 365 Copilot** (Feb 2026): Agent Dashboard GA — 내부 빌트, MS 개발, 서드파티 에이전트 전체의 성능/채택 메트릭 제공.
  - **누적 동향**: GitHub Copilot Metrics GA + MS Agent Dashboard GA + Databricks AI/BI 대시보드 에이전트 — 엔터프라이즈 AI 모니터링 대시보드가 "table stakes" 수준으로 정착.
- **개선 포인트**: priority를 medium → high로 상향 필요. GitHub의 조직별 메트릭 대시보드 패턴 (사용량, 채택률, CLI 활동)을 참고하여 KonaI-Agent의 에이전트 모니터링 대시보드 설계 시 반영.
- **confidence**: high (GitHub Copilot + MS 365 Copilot 2개 제품 GA)

#### UPDATE-2: citation_source_link

- **현재 구현**: implemented (priority: medium). CitationSourceLink 컴포넌트(CitationBadge, SourceLinkList) 구현 완료.
- **UX 리서치 변화**:
  - **NNGroup** (Feb 28): "GenAI for Complex Questions, Search for Critical Facts" — 사용자는 복잡한 탐색 작업에 AI를, 사실 확인에 검색을 사용. 상호 보완적 관계.
  - **핵심 인사이트**:
    - AI 인터페이스에서 출처 링크 제공이 사용자 신뢰의 핵심 요소로 실증
    - 사용자는 "정확성이 중요한" 작업에서 검증 가능한 소스를 적극적으로 탐색
    - 에이전트 응답에 신뢰 등급(confidence level)과 소스 링크를 결합하면 UX 품질 향상
- **개선 포인트**: 현재 CitationSourceLink 구현에 confidence indicator 추가 검토. 기존 구현은 링크 나열 방식 → 출처의 신뢰도/관련도를 시각적으로 구분하는 방향으로 개선 가능.
- **confidence**: high (NNGroup 실증 연구, UX 분야 최고 권위)

---

## 중복 필터링 상세 (이전 리포트와 겹침 또는 보고 기준 미달)

| # | 항목 | 이전 리포트 매핑 | 비고 |
|---|------|---------------|------|
| 1 | GitHub Copilot Coding Agent 기능 (Feb 26) | 2026-02-27 NEW-1, UPDATE-1, UPDATE-2 | 이미 보고됨 |
| 2 | Cursor Cloud Agents / Bugbot (Feb 26) | 2026-02-27 NEW-1, UPDATE-2 | 이미 보고됨 |
| 3 | MCP TypeScript SDK v1.27.1 (Feb 27) | — | 패치 릴리스, UI 패턴 무관 |
| 4 | CopilotKit v1.52.1 (Feb 27) | — | transport config 수정, UI 패턴 무관 |
| 5 | LangGraph v1.0.10 (Feb 27) | — | serde events 내부 개선, UI 패턴 직접 영향 없음 |
| 6 | LobeChat canary v2.2.0-nightly (Feb 27) | — | 비정식 canary 빌드 |

### 보고 기준 미달 참고 사항

**CrewAI 1.10.0** (Feb 27) — 메이저 릴리스로 HITL in Flows, async step callbacks, MCP tool resolution 개선 등 유의미한 기능이 추가되었으나, 1개 프레임워크 단독 기능으로 NEW 보고 기준 미달. 다만 HITL 프레임워크 패턴의 성숙도를 보여주는 지표로 모니터링 유지.

---

## 신규 패턴 (NEW)

> 이번 스캔에서 신규 패턴 발견 없음.

---

## 우선순위 변경 제안 (PRIORITY_CHANGE)

> 이번 스캔에서 새 우선순위 변경 제안 없음. 이전 리포트의 `usage_monitoring: medium → high` 미적용 상태 (8회 연속 제안).

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
| 1 | `/research scheduled_agent_tasks` | 이전 NEW-2 | Anthropic Cowork 예약/반복 실행 UX. 엔터프라이즈 대시보드 직접 적용 가능. **3회 연속 권장** | **high** |
| 2 | `/research multi_agent_orchestration_ui` | 이전 NEW-3 | Perplexity Computer + Cursor Cloud Agents — 서브에이전트 분기·병렬 실행·핸드오프 패턴. **3회 연속 권장** | **high** |
| 3 | `/research agent_self_review` | 이전 NEW-1 | GitHub Copilot Self-review + Cursor Bugbot + Xcode 마일스톤/롤백. **2회 연속 권장** | **high** |
| 4 | `/research usage_monitoring` | UPDATE-1 | GitHub Copilot Metrics GA + MS Agent Dashboard. 엔터프라이즈 모니터링 대시보드 설계. **신규 권장** | **high** |
| 5 | `/research chat_input` | 누적 8회 | Telerik AI-ready Chat 입력 모드 전환 + prefix/suffix 패턴. **8회 연속 권장** | **medium** |

카탈로그 직접 수정 제안:

| # | component_id | 필드 | 현재 | 제안 |
|---|-------------|------|------|------|
| 1 | usage_monitoring | priority | medium | high |

> `usage_monitoring.priority → high`는 **8회 연속** 리포트에서 동일 제안. GitHub Copilot Metrics GA 전환으로 근거가 더욱 강화됨.

---

## 누적 액션 추적

### 이전 리포트 (2026-02-27) 권장 액션 실행 여부:

| 리포트 | 액션 | 상태 | 비고 |
|--------|------|------|------|
| 2026-02-27 | `/research scheduled_agent_tasks` | **미실행** | 카탈로그에 해당 component 없음 |
| 2026-02-27 | `/research multi_agent_orchestration_ui` | **미실행** | 카탈로그에 해당 component 없음 |
| 2026-02-27 | `/research agent_self_review` | **실행 완료** | last_researched: 2026-02-27, 리서치 브리프 생성됨 |
| 2026-02-27 | `/research model_agent_switcher` | **이전 실행 완료** | last_researched: 2026-02-26 |
| 2026-02-27 | `/research chat_input` | **실행 완료** | last_researched: 2026-02-27, 리서치 브리프 생성됨 |
| 2026-02-27 | catalog: usage_monitoring.priority → high | **미적용** | 현재: medium |
| 2026-02-27 | catalog: parallel_execution_view.notes 추가 | **적용 완료** | 카탈로그에 반영됨 |

### 누적 미실행 (3회 이상 연속 권장):

| 리포트 | 액션 | 연속 권장 횟수 | 비고 |
|--------|------|------------|------|
| 2026-02-21~28 | catalog: usage_monitoring.priority → high | **8회** | 카탈로그 수정만으로 완료 가능 |
| 2026-02-26~28 | `/research scheduled_agent_tasks` | **3회** | 신규 컴포넌트로 추가 후 리서치 필요 |
| 2026-02-26~28 | `/research multi_agent_orchestration_ui` | **3회** | 신규 컴포넌트로 추가 후 리서치 필요 |
