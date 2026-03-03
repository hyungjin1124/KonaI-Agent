# Discovery Report — 2026-03-03

## 스캔 설정

- **모드**: broad
- **시간 범위**: 2026-02-28 ~ 2026-03-03 (4일간)
- **이전 리포트**: 2026-02-27-discovery.md

## 확인한 소스

| # | 소스 | URL | 상태 |
|---|------|-----|------|
| 1 | ChatGPT changelog | help.openai.com/en/articles/6825453-chatgpt-release-notes | 접근 실패 (403), Fallback 사용 |
| 2 | ChatGPT (Fallback) | releasebot.io/updates/openai/chatgpt | 확인 완료 — 변경 없음 (최근: Feb 25) |
| 3 | Claude blog | claude.com/blog | 확인 완료 — 변경 없음 (최근: Jan 12) |
| 4 | Cursor changelog | cursor.com/changelog | 확인 완료 — 변경 없음 (최근: Feb 26) |
| 5 | Gemini release notes | docs.cloud.google.com/gemini/enterprise/docs/release-notes | 확인 완료 — 변경 없음 (최근: Feb 26, 데이터소스 추가) |
| 6 | Windsurf changelog | windsurf.com/changelog | 확인 완료 — 변경 없음 (최근: Feb 25) |
| 7 | Bolt.new | support.bolt.new/release-notes | 확인 완료 — 변경 없음 (최근: Feb 20) |
| 8 | v0 changelog | v0.app/changelog | 확인 완료 — 변경 없음 (최근: Feb 23) |
| 9 | GitHub Copilot | releasebot.io/updates/github | 확인 완료 — **변경 있음 (Feb 27-Mar 2: Copilot CLI v0.0.419-421, Metrics GA)** |
| 10 | Salesforce Agentforce | salesforce.com/agentforce/what-is-new | 확인 완료 — 변경 없음 (최근: Feb 26, Agentforce for Communications) |
| 11 | MS Copilot Studio | learn.microsoft.com/copilot-studio | 확인 완료 — **변경 있음 (Mar 2026: Agent Dashboard GA 롤아웃 시작)** |
| 12 | Google Agentspace | docs.cloud.google.com/agentspace/docs/release-notes | 확인 완료 — 변경 없음 (최근: Feb 26) |
| 13 | ThoughtSpot blog | thoughtspot.com/blog | 확인 완료 — 변경 없음 (최근: Feb 18) |
| 14 | Power BI blog | powerbi.microsoft.com/blog | 확인 완료 — 변경 없음 (최근: Feb 24) |
| 15 | Hex blog | hex.tech/blog | 확인 완료 — 변경 없음 (최근: Jan 28) |
| 16 | AG-UI | github.com/ag-ui-protocol/ag-ui/releases | 확인 완료 — 릴리스 없음 (태그도 없음) |
| 17 | MCP TypeScript SDK | github.com/modelcontextprotocol/typescript-sdk/releases | 확인 완료 — 변경 없음 (최근: v1.27.1, Feb 24) |
| 18 | MCP Spec | spec.modelcontextprotocol.io | 접근 실패 (인증서 오류) |
| 19 | CopilotKit | github.com/CopilotKit/CopilotKit/releases | 확인 완료 — 변경 없음 (최근: v1.52.1, Feb 27) |
| 20 | LangGraph | github.com/langchain-ai/langgraph/releases | 확인 완료 — 변경 없음 (최근: v1.0.10, Feb 27) |
| 21 | LangChain blog | blog.langchain.com | 확인 완료 — 날짜 미표시, LangSmith Agent Builder GA 포스트 확인 |
| 22 | CrewAI | github.com/crewAIInc/crewAI/releases | 확인 완료 — 변경 없음 (최근: v1.10.1a1, Feb 27) |
| 23 | Vercel AI SDK | github.com/vercel/ai/releases | 확인 완료 — **변경 있음 (ai@6.0.105-106, 패치 업데이트)** |
| 24 | Open WebUI | github.com/open-webui/open-webui/releases | 확인 완료 — **변경 있음 (v0.8.6-0.8.7, Mar 1-2)** |
| 25 | LobeChat | github.com/lobehub/lobe-chat/releases | 확인 완료 — **변경 있음 (v2.1.34, Feb 28)** |
| 26 | Chainlit | github.com/Chainlit/chainlit/releases | 확인 완료 — 변경 없음 (최근: v2.9.6, Jan 20) |
| 27 | NNGroup | nngroup.com/articles (AI 태그) | 확인 완료 — 변경 없음 (최근: Feb 6) |

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
- 개선 필요: **3**건
- 우선순위 변경 제안: **0**건
- 리서치 노후: **0**건
- 폐기 후보: **0**건
- **중복 필터링으로 제외**: **4**건

> 4일간 스캔. Microsoft Copilot Agent Dashboard가 March 2026 GA 롤아웃 시작 — 에이전트 채택/사용량/크레딧 추적 중앙 대시보드. Open WebUI v0.8.6에서 Open Terminal 통합 (채팅 내 파일 탐색/업로드/프리뷰 도구) 도입. LobeChat v2.1.34에서 에이전트 봇 프로바이더 (Discord/Slack 외부 플랫폼 연동) 인프라 추가. Google A2UI 프로토콜 (Feb 26 발표, 이전 리포트 미포함)은 에이전트→UI 선언적 JSON 프로토콜로 generative_ui 직접 관련.

---

## 신규 패턴 (NEW)

| # | 패턴명 | 설명 | 발견 출처 | 관련 카테고리 | 권장 priority | 권장 complexity | confidence |
|---|--------|------|----------|-------------|--------------|----------------|------------|
| 1 | A2UI Protocol (Agent-to-User Interface) | 에이전트가 선언적 JSON으로 네이티브 UI를 안전하게 생성하는 오픈 프로토콜 | Google (Feb 26) + CopilotKit 공동 기여 | generative_emerging | high | moderate | high |

### 상세

#### NEW-1: A2UI Protocol (Agent-to-User Interface)

- **발견 출처**: [Google Developers Blog](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/) (Feb 26), [MarkTechPost](https://www.marktechpost.com/2025/12/22/google-introduces-a2ui-agent-to-user-interface-an-open-sourc-protocol-for-agent-driven-interfaces/) (Dec 2025 첫 소개), [The New Stack](https://thenewstack.io/agent-ui-standards-multiply-mcp-apps-and-googles-a2ui/)
- **경쟁사 현황**:
  - **Google**: A2UI v0.8 오픈소스 공개 (Apache 2.0). 에이전트가 JSON 포맷으로 UI를 선언하면 클라이언트 앱이 자체 컴포넌트로 렌더링하는 프로토콜. 코드 실행 없이 트러스트 바운더리를 넘어 안전하게 UI 생성 가능.
  - **CopilotKit**: 공동 기여자. 기존 AG-UI(Agent-User Interaction Protocol)와 상호보완 — AG-UI는 이벤트 스트리밍 레이어, A2UI는 UI 선언 레이어.
  - **Microsoft Agent Framework**: AG-UI 통합 문서에서 A2UI와의 연계 가능성 언급. HITL 승인 + 상태 동기화 + 커스텀 UI 렌더링.
- **KonaI-Agent 관련성**: `generative_ui` 컴포넌트(현재 research_needed)와 직접 관련. A2UI는 generative UI의 "Declarative" 접근 방식을 프로토콜 수준에서 표준화. 기존 AG-UI + MCP + A2UI 스택으로 에이전트 UI 파이프라인을 구성하면, 에이전트가 런타임에 UI를 동적으로 생성하면서도 보안과 일관성을 유지할 수 있음.
- **confidence**: high (Google 주도 + CopilotKit 공동 기여 + Microsoft 연동 문서 존재)

---

## 개선 필요 (UPDATE)

| # | component_id | 현재 상태 | 발견 내용 | 출처 |
|---|-------------|----------|----------|------|
| 1 | usage_monitoring | implemented | Microsoft Copilot Agent Dashboard GA (Mar 2026) — 에이전트 채택/사용량/크레딧 추적 중앙 대시보드. GitHub Copilot Metrics GA (Feb 27) — 조직/엔터프라이즈 수준 사용량 메트릭. | MS Tech Community, GitHub Changelog |
| 2 | chat_input | partial | Open WebUI v0.8.6 — Open Terminal 통합: 채팅에서 파일 탐색/업로드/프리뷰를 도구로 직접 수행. GitHub Copilot CLI v0.0.421 — MCP 폼 UX 개선 (멀티라인 입력, 필드 네비게이션), Reference Picker `#` 연동. | Open WebUI GitHub, GitHub Copilot CLI |
| 3 | conversation_sidebar | implemented | GitHub Copilot CLI v0.0.419 — `/chronicle` 커맨드: 세션 히스토리 기반 standup 요약 + 팁 생성. 대화 이력에서 자동 요약/리포트 생성 패턴. | GitHub Copilot CLI |

### 상세

#### UPDATE-1: usage_monitoring

- **현재 구현**: implemented (QA PASS). KPI 4종 + 일별 트렌드 + 에이전트별 분포 + 모델별 비용. Phase 2 (드래그/리사이즈, 사용자별 테이블, 비용 이상치 알림) 미구현.
- **경쟁사 변화**:
  - **Microsoft Copilot Agent Dashboard** (Mar 2026 GA): 에이전트 채택/사용량/크레딧 추적 중앙 대시보드. 활성 에이전트, 사용자 참여, 응답 수, 사용 유지율, 공유 등 핵심 메트릭을 한 곳에서 모니터링. AI 채택 전문가, 분석가, 리더를 위한 역할별 접근.
  - **GitHub Copilot Metrics** (Feb 27 GA): 코드 완성, IDE 사용, 모델/언어 분류, 에이전트 기능별 코드 생성량 정량화. 조직/엔터프라이즈 수준 세분화. 커스텀 엔터프라이즈 역할을 통한 세분화된 접근 제어.
  - **Databricks AI/BI** (Feb 2026): 에이전틱 대시보드 작성 — 자연어로 데이터셋/시각화/레이아웃/필터를 자동 생성. Genie 히트맵/Sankey 시각화 추가.
- **개선 포인트**: Phase 2에 다음 패턴 반영:
  1. "에이전트별 채택 메트릭" (MS Agent Dashboard 패턴) — 에이전트 활성도, 사용자 참여율, 유지율
  2. "역할별 접근 제어" — 관리자/분석가/리더 뷰 분리
  3. "코드 생성/에이전트 기능별 정량 메트릭" (GitHub Copilot Metrics 패턴)
- **confidence**: high (Microsoft + GitHub 2개 GA 릴리스)

#### UPDATE-2: chat_input

- **현재 구현**: partial. ChatInputArea(D&D, HITL, 제안칩), AttachedFileChip, DropZoneOverlay. 미구현: + 메뉴 허브, @mention 자동완성, 이미지 클립보드, 복수 파일 첨부. last_researched: 2026-03-02.
- **경쟁사 변화**:
  - **Open WebUI v0.8.6** (Mar 1): Open Terminal 통합 — 채팅에 터미널 인스턴스를 연결하여 파일 탐색/읽기/업로드를 "always-on tool"로 제공. 폴더 브라우징, 이미지/PDF 프리뷰, D&D 업로드, 디렉토리 생성/삭제, CWD(Current Working Directory)를 도구 설명에 자동 주입하여 컨텍스트 인식 명령 실행.
- **개선 포인트**: Open Terminal 패턴은 "입력" 자체보다 "입력과 파일 시스템의 통합"에 가까움. chat_input 리서치에 "채팅 내 파일 시스템 통합 도구" 패턴을 추가 참조로 포함. 단, 이미 2026-03-02 리서치 완료 상태이므로 긴급도는 낮음.
- **confidence**: medium (Open WebUI 1개 제품, 단 오픈소스 선행 지표)

---

#### UPDATE-3: conversation_sidebar

- **현재 구현**: implemented. LeftSidebar에 과거 대화 세션 목록 표시. ChatSessionItem으로 세션 선택.
- **경쟁사 변화**:
  - **GitHub Copilot CLI v0.0.419** (Feb 27): `/chronicle` 커맨드 — 세션 히스토리를 기반으로 standup 요약 자동 생성 + 팁 제공. 대화 이력을 단순 "목록"이 아닌 "인사이트"로 변환하는 패턴.
  - **GitHub Copilot CLI v0.0.421** (Mar 2): Reference Picker — `#` 기호로 Issues, PR, Discussions를 인라인 참조. 대화 내에서 외부 리소스를 컨텍스트로 연결하는 패턴.
- **개선 포인트**: 현재 conversation_sidebar는 세션 목록 표시에 한정. `/chronicle` 패턴을 참고하여 "세션 요약/인사이트" 기능 추가 검토. 단, 1개 제품의 CLI 수준 기능이므로 긴급도 낮음.
- **confidence**: low (GitHub Copilot CLI 1개 제품, CLI 전용 기능)

---

## 중복 필터링 상세 (이전 리포트와 겹침 또는 보고 기준 미달)

| # | 항목 | 이전 리포트 매핑 | 비고 |
|---|------|-----------------|------|
| 1 | Cursor Cloud Agents / Bugbot Autofix (Feb 26) | 2026-02-27 UPDATE-2 | 이미 보고됨, 추가 진전 없음 |
| 2 | GitHub Copilot Coding Agent / Self-review (Feb 26) | 2026-02-27 NEW-1 | 이미 보고됨, 추가 진전 없음 |
| 3 | Vercel AI SDK 6.0.105-106 (Feb 28-Mar 2) | — | 패치 업데이트 (의존성 갱신, 모델 ID 정리). UI 패턴 무관 |
| 4 | LobeChat v2.1.34 (Feb 28) | — | 에이전트 봇 프로바이더 인프라 추가 (Discord/Slack 연동). 관심 있지만 1개 제품의 인프라 수준 변경이므로 보고 기준 미달 |

---

## 우선순위 변경 제안 (PRIORITY_CHANGE)

> 이번 스캔에서 새 우선순위 변경 제안 없음. 이전 리포트의 `usage_monitoring: medium → high` 미적용 상태 — 이제 **카탈로그에 priority: high로 이미 반영됨** (2026-03-01 QA 이후 업데이트 확인).

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
| 1 | `/research generative_ui` | NEW-1 + 기존 research_needed | Google A2UI + AG-UI + MCP 프로토콜 스택 — generative UI의 Declarative 접근 표준화. 3개 주요 플레이어(Google, CopilotKit, Microsoft) 참여. KonaI-Agent generative_ui 구현 전략 수립 필수 | **high** |
| 2 | `/research usage_monitoring` | UPDATE-1 | MS Agent Dashboard GA + GitHub Copilot Metrics GA. Phase 2 기획에 에이전트별 채택 메트릭, 역할별 접근 제어, 코드 생성 정량화 패턴 반영 | **high** |
| 3 | `/research scheduled_agent_tasks` | 이전 리포트 누적 | Anthropic Cowork 예약/반복 실행 UX. 엔터프라이즈 대시보드 직접 적용 가능. **3회 연속 권장** | **high** |
| 4 | `/research multi_agent_orchestration_ui` | 이전 리포트 누적 | 리서치 완료(2026-03-02), 구현 단계로 전환 권장 | **medium** |
| 5 | `/research chat_input` | 누적 8회 | Open WebUI Open Terminal 통합 패턴 추가. 단, 2026-03-02 리서치 최신 상태. **8회 연속 권장이나 긴급도 낮음** | **low** |

카탈로그 직접 수정 제안:

| # | component_id | 필드 | 현재 | 제안 |
|---|-------------|------|------|------|
| 1 | generative_ui | notes | (기존) | 추가: "Google A2UI v0.8 (Feb 26, 2026): 선언적 JSON으로 UI를 안전하게 생성하는 오픈 프로토콜. AG-UI(이벤트 레이어) + A2UI(UI 선언 레이어) 상호보완. Microsoft Agent Framework도 AG-UI HITL 통합 지원." |
| 2 | usage_monitoring | notes | (기존) | 추가: "Phase 2 참조: MS Copilot Agent Dashboard (Mar 2026 GA) — 에이전트 채택/사용량/크레딧 추적. GitHub Copilot Metrics (Feb 27 GA) — 조직/엔터프라이즈 수준 세분화. Databricks AI/BI — 에이전틱 대시보드 작성(NL→대시보드)." |

---

## 누적 액션 추적

### 이전 리포트 (2026-02-27) 권장 액션 실행 여부:

| 리포트 | 액션 | 상태 | 비고 |
|--------|------|------|------|
| 2026-02-27 | `/research scheduled_agent_tasks` | **실행 완료** | last_researched: 2026-03-02, 카탈로그에 항목 추가됨 |
| 2026-02-27 | `/research multi_agent_orchestration_ui` | **실행 완료** | last_researched: 2026-03-02, 카탈로그 notes 갱신됨 |
| 2026-02-27 | `/research agent_self_review` | **실행 완료** | last_researched: 2026-02-27, 카탈로그에 항목 추가됨 |
| 2026-02-27 | `/research model_agent_switcher` | **실행 완료** | last_researched: 2026-02-26 (이전 리포트 이전 실행) |
| 2026-02-27 | `/research chat_input` | **실행 완료** | last_researched: 2026-03-02, notes 대규모 갱신 |
| 2026-02-27 | catalog: usage_monitoring.priority → high | **적용 완료** | 현재: high (2026-03-01 QA 이후 반영됨) |
| 2026-02-27 | catalog: parallel_execution_view.notes 추가 | **적용 완료** | 현재: Cursor Cloud Agents, GitHub Copilot CLI Handoff 내용 반영됨 |

### 누적 미실행 (3회 이상 연속 권장):

| 리포트 | 액션 | 연속 권장 횟수 | 비고 |
|--------|------|------------|------|
| 2026-02-21~03-03 | `/research generative_ui` | **8회** | Google A2UI 발표로 긴급도 상승. 우선 실행 권장 |
