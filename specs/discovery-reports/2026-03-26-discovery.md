# Discovery Report — 2026-03-26

## 스캔 설정
- **모드**: broad
- **시간 범위**: 2026-03-19 ~ 2026-03-26 (7일간)
- **이전 리포트**: 2026-03-19-discovery.md (broad)

## 확인한 소스

| # | 소스 | URL | 상태 |
|---|------|-----|------|
| 1 | ChatGPT changelog | releasebot.io/updates/openai/chatgpt | **확인 완료** — Library 파일 관리(Mar 23), Shopping 비교 UI(Mar 24) |
| 2 | Claude blog | releasebot.io/updates/anthropic/claude | **확인 완료** — Computer Use Dispatch(Mar 23), Claude Code auto mode(Mar 24) |
| 3 | Cursor changelog | cursor.com/changelog | **확인 완료** — Self-hosted Cloud Agents(Mar 25), Composer 2(Mar 19) |
| 4 | Gemini release notes | gemini.google/release-notes | **확인 완료** — Workspace AI 통합, Drive AI Overview, Pixel agentic tasks |
| 5 | Windsurf changelog | windsurf.com/changelog | 변경 없음 (버그 수정만) |
| 6 | Bolt.new | support.bolt.new/release-notes | 변경 없음 (최근: Mar 13) |
| 7 | v0 by Vercel | v0.dev/changelog | **확인 완료** — Element screenshot attachment(Mar 20), Git sync 개선 |
| 8 | GitHub Copilot | github.blog/changelog/label/copilot/ | **확인 완료** — PR 내 @copilot 수정 요청(Mar 24), Agent 세션 로그 추적(Mar 20) |
| 9 | Salesforce Agentforce | salesforce.com/agentforce | 변경 없음 (Spring '26 롤아웃 중, 날짜 특정 불가) |
| 10 | MS Copilot Studio | learn.microsoft.com/copilot-studio/whats-new | **확인 완료** — Work IQ Preview (M365 work insights 연결) |
| 11 | Google Agentspace | cloud.google.com/agentspace/docs/release-notes | **확인 완료** — Data Insights Agent GA(Mar 24), OneDrive 필터링(Mar 24), Docusign Connector(Mar 23) |
| 12 | ThoughtSpot | thoughtspot.com/new-features (웹 검색 대체) | **확인 완료** — KPI Charts 세밀 제어, Liveboard 다운로드 개선 (3월) |
| 13 | Power BI | powerbi.microsoft.com/blog | **확인 완료** — TMDL View on Web Preview(Mar 20), Modern Visual Defaults(Mar 18) |
| 14 | Hex AI | hex.tech/blog | 변경 없음 (날짜 특정 불가) |
| 15 | AG-UI | github.com/ag-ui-protocol/ag-ui/releases | 변경 없음 (릴리스 없음) |
| 16 | MCP TS SDK | github.com/modelcontextprotocol/typescript-sdk | **확인 완료** — v1.28.0(Mar 25): OAuth 개선, inputSchema validation |
| 17 | CopilotKit | github.com/CopilotKit/CopilotKit/releases | 변경 없음 (최근: Mar 12 v1.54.0) |
| 18 | LangGraph | github.com/langchain-ai/langgraph/releases | **확인 완료** — langgraph-cli 0.4.19(Mar 20): deploy revisions list |
| 19 | CrewAI | github.com/crewAIInc/crewAI/releases | **확인 완료** — v1.11.1(Mar 23), v1.12.0a1~a3(Mar 25): Agent Skills, 계층적 메모리 격리, HITL 버그 수정 |
| 20 | Vercel AI SDK | github.com/vercel/ai/releases | **확인 완료** — ai@6.0.138, v7 beta.38~42(Mar 24): OTEL 개선, rerank 디커플링 |
| 21 | Open WebUI | github.com/open-webui/open-webui/releases | 변경 없음 (최근: Mar 9 v0.8.10) |
| 22 | LobeChat | github.com/lobehub/lobe-chat/releases | **확인 완료** — v2.1.44(Mar 20): Agent Documents, Context Engine, 카테고리 mention 메뉴, slash actions |
| 23 | Chainlit | github.com/Chainlit/chainlit/releases | 변경 없음 (최근: v2.10.0, ~1년간 릴리스 없음) |
| 24 | NNGroup | nngroup.com/articles | **확인 완료** — Outcome-Oriented Design(Mar 23), AI Chatbot Purpose(Mar 20) |

## 보충 검색 쿼리

| # | 쿼리 | 결과 수 |
|---|------|--------|
| 1 | "AI agent UI" OR "agentic interface" new feature "March 2026" | 10건 (GitHub "execution is the new interface", Perplexity Comet iOS, Opera Neon Intelligent Mode) |
| 2 | "human-in-the-loop" OR "AI approval" UI pattern "March 2026" | 0건 |
| 3 | "conversational AI" OR "chat UI" framework release "March 2026" | 10건 (GPT-5.4 mid-response correction, assistant-ui 라이브러리 재확인) |
| 4 | "enterprise AI dashboard" OR "AI copilot admin" March 2026 | 10건 (MS Agent 365 Control Plane, Zendesk Admin Copilot, M365 에이전트 거버넌스) |
| 5 | "AI data visualization" OR "natural language query" dashboard March 2026 | 10건 (Databricks Genie Code, ThoughtSpot Spotter Semantics 재확인) |

---

## 요약

- 신규 패턴 발견: 2건
- 개선 필요: 3건
- 우선순위 변경 제안: 0건
- 리서치 노후: 1건
- 폐기 후보: 0건
- **중복 필터링으로 제외**: 6건

---

## 신규 패턴 (NEW)

| # | 패턴명 | 설명 | 발견 출처 | 관련 카테고리 | 권장 priority | 권장 complexity | confidence |
|---|--------|------|----------|-------------|--------------|----------------|------------|
| 1 | Artifact Library / File Manager | 에이전트 생성 아티팩트를 자동 저장·관리하는 파일 라이브러리 | ChatGPT Library(Mar 23) | artifact_visualization, navigation_session | medium | moderate | medium |
| 2 | Agent Dispatch (비동기 위임) | 사용자 부재 시 에이전트가 자율적으로 작업 수행하고 결과를 큐잉하는 UX | Claude Dispatch(Mar 23), Claude Code auto mode(Mar 24) | agent_action_patterns, hitl_patterns | medium | complex | medium |

### 상세

#### NEW-1: Artifact Library / File Manager

- **발견 출처**: ChatGPT Library (Mar 23) — Plus/Pro/Business 대상 GA
- **경쟁사 현황**:
  - **ChatGPT**: Library 탭에서 업로드/생성 파일 자동 저장 및 브라우징. Composer에서 최근 파일 접근 가능. 대화 종료 후에도 아티팩트 지속
  - **LobeChat v2.1.44**: Agent Documents 기능으로 지식 관리 도구 구현 (Mar 20)
  - **Google Drive**: AI Overview로 검색 결과 상단에 AI 요약+인용 표시
- **KonaI-Agent 관련성**: 현재 Artifact Panel은 세션 내 일시적 표시만 지원. 에이전트가 생성한 PPT, 차트, 문서 등을 세션 간 지속·관리하는 Library 패턴은 엔터프라이즈 워크플로에서 필수. 2개 이상 제품(ChatGPT + LobeChat)이 동시 도입하여 패턴 확립 초기 단계

#### NEW-2: Agent Dispatch (비동기 위임)

- **발견 출처**: Claude Computer Use Dispatch (Mar 23), Claude Code auto mode (Mar 24)
- **경쟁사 현황**:
  - **Claude Dispatch**: Pro/Max 사용자가 부재 중에도 에이전트가 화면 위 파일 열기/도구 실행/네비게이션 수행. 작업 완료 후 결과 대기
  - **Claude Code auto mode**: 안전한 액션을 AI가 자율 판단하여 실행. 위험 액션만 승인 요청
  - **Cursor Self-hosted Agents** (Mar 25): 에이전트가 자체 클라우드에서 비동기 작업 수행
  - **GitHub Copilot**: Agent 세션 로그 실시간 추적 (Mar 20), Raycast 모니터링
- **KonaI-Agent 관련성**: 비동기 에이전트 위임은 현재 시나리오 오케스트레이션(`isAsyncTool`)과 개념적으로 유사하나, "사용자 부재 중 자율 실행 + 결과 큐잉 + 감독 대시보드" 패턴이 Claude/Cursor/GitHub에서 동시에 강화됨. 엔터프라이즈 환경에서 에이전트 자율성 레벨 설정 UI + 실행 로그 모니터링이 새로운 표준으로 부상

---

## 개선 필요 (UPDATE)

| # | component_id | 현재 상태 | 발견 내용 | 출처 |
|---|-------------|----------|----------|------|
| 1 | agent_marketplace | implemented | LobeChat v2.1.44의 카테고리 mention 메뉴 + Skill activity switching | LobeChat GitHub |
| 2 | usage_monitoring | implemented | MS Agent 365 Control Plane: 에이전트 거버넌스 대시보드 + Zendesk Admin Copilot | MS 365 Blog, Zendesk |
| 3 | (liveboard 위젯) | implemented | ThoughtSpot KPI Charts 세밀 제어: 누락값 처리, 변화량 표시 옵션 | ThoughtSpot |

### 상세

#### UPDATE-1: agent_marketplace — LobeChat Skill 발견성 UX 강화

- **현재 구현**: 카드 그리드 기반 마켓플레이스. 검색/필터/정렬 지원. QA PASS
- **경쟁사 변화**: LobeChat v2.1.44 (Mar 20)에서:
  - 채팅 입력에 카테고리 기반 mention 메뉴 도입 — `@`로 에이전트/스킬을 인라인 호출
  - Slash action tags + command bus 시스템으로 스킬 접근성 강화
  - Skill activity switching 지원 — 대화 중 스킬 전환
- **개선 포인트**: 마켓플레이스 단독 페이지 외에, 채팅 입력에서 직접 스킬/에이전트를 호출하는 인라인 접근 패턴 검토. `@mention` 자동완성(chat_input Phase 2 계획)과 연동 가능

#### UPDATE-2: usage_monitoring — MS Agent 365 거버넌스 Control Plane

- **현재 구현**: Phase 1+2 완료. 에이전트별 비용 분해, 팀 예산 할당, Health Status Strip, 사용자별 사용량. QA PASS
- **경쟁사 변화**:
  - **MS Agent 365** (Mar 9 발표, 3월 중 확산): 에이전트 배포·조직·거버넌스 통합 Control Plane. ID/컴플라이언스/보안(Entra + Defender), 대시보드+알림 통합 옵서빌리티. 위험 에이전트 차단, 비활성/소유자 없는 에이전트 자동 제거
  - **Zendesk Admin Copilot** (Mar 17 EAP): 관리자 AI 어시스턴트가 설정 최적화·문제 진단·워크플로 구축 지원
  - **GitHub Copilot Metrics**: 코딩 에이전트 활성 사용자 지표 추가 (Mar 25)
- **개선 포인트**: Phase 3에서 에이전트 라이프사이클 거버넌스(위험 에이전트 차단, 비활성 자동 정리) + 에이전트 활동 로그 모니터링 패턴 반영 검토

#### UPDATE-3: Liveboard 위젯 — ThoughtSpot KPI 세밀 제어

- **현재 구현**: 위젯 기반 대시보드. Recharts + react-grid-layout
- **경쟁사 변화**: ThoughtSpot 2026년 3월 업데이트:
  - KPI Charts: 누락 날짜 처리(갭/무시/0), 이전 값 표시/숨김, 변화량 표시(% vs 절대값), 증가를 긍정/부정으로 지정
  - Liveboard 다운로드: CSV/XLSX, 개별 시각화 선택 다운로드, 스케줄 이메일 시각화 선택
- **개선 포인트**: KPI 위젯의 설정 패널에 누락값 처리·변화량 포맷 옵션 추가 검토. 대시보드 내보내기 시 개별 위젯 선택 패턴

---

## 우선순위 변경 제안 (PRIORITY_CHANGE)

해당 없음.

---

## 리서치 노후 (STALE)

| # | component_id | last_researched | 경과 기간 | 감지된 변화 |
|---|-------------|----------------|----------|------------|
| 1 | artifact_panel | 2026-02-18 | **36일** | ChatGPT Library(아티팩트 지속 관리), LobeChat Agent Documents(지식 관리 도구) — 아티팩트 라이프사이클 패턴 변화 |

> ppt_slide_preview: last_researched 2026-02-16 (38일 경과). 직접적 UI 패턴 변화 미감지 → STALE 미처리 유지.

---

## 폐기 후보 (DEPRECATED)

해당 없음.

---

## 중복 필터링 상세

| # | 항목 | 이전 리포트 매핑 | 처리 |
|---|------|----------------|------|
| 1 | OpenAI AgentKit ChatKit GA | 2026-03-19 NEW-1 | 제외 |
| 2 | AI SDK 6 needsApproval HITL | 2026-03-19 UPDATE-1 | 제외 (approval_rejection 리서치 실행됨) |
| 3 | Power BI Translytical Task Flows | 2026-03-19 UPDATE-2 | 제외 |
| 4 | assistant-ui React 라이브러리 | 2026-03-19 주목 사항 | 제외 (추가 진전 없음) |
| 5 | Databricks Genie Code | 2026-03-12 broad | 제외 |
| 6 | MS Security Dashboard | 2026-03-19 해소 | 제외 |

### 보고 기준 미달 제외

| # | 항목 | 사유 |
|---|------|------|
| 1 | MCP TS SDK v1.28.0 (Mar 25) | OAuth/inputSchema 개선. 인프라 수준, UI 패턴 직접 영향 없음 |
| 2 | LangGraph CLI 0.4.19 (Mar 20) | CLI 명령어 추가. UI 영향 없음 |
| 3 | Vercel AI SDK v7 beta.38~42 (Mar 24) | OTEL/rerank 개선. Beta 단계, UI 패턴 변경 아님 |
| 4 | CrewAI v1.12.0a (Mar 25) | Agent Skills 개념 흥미로우나 alpha 프리릴리즈. UI 프레임워크 아님 |
| 5 | Cursor Composer 2 (Mar 19) | 모델+가격 변경. 코드 에디터 특화, 엔터프라이즈 대시보드 패턴 아님 |
| 6 | Gemini Pixel agentic tasks | 모바일 특화. 엔터프라이즈 대시보드 직접 관련성 낮음 |
| 7 | v0 Element screenshot (Mar 20) | 코드 생성 도구 특화. 1개 제품 실험적 |
| 8 | ChatGPT Codex for Students (Mar 20) | 교육 크레딧 프로그램. UI 변경 아님 |
| 9 | Opera Neon Intelligent Mode (Feb 26) | 브라우저 에이전트 라우팅. 날짜 범위 밖 |
| 10 | Perplexity Comet iOS (Mar 26) | 브라우저 자동화. 엔터프라이즈 대시보드 아님 |

### 주목 사항 (다음 스캔 시 추적)

- **LobeChat v2.1.44 Agent Documents + Context Engine**: 90+ 커밋 대규모 릴리스. 지식 관리 도구, 참조 토픽 컨텍스트 주입, 카테고리 mention 메뉴, slash commands, 서버 측 context compression. 개별 기능이 여러 카탈로그 컴포넌트에 걸쳐 참고 가치 있음
- **NNGroup "Outcome-Oriented Design" (Mar 23)**: AI 시대 디자인 프레임워크. 단일 인터페이스 최적화 → adaptive framework 전환 제안. 에이전트 시나리오 UX 설계 방향성에 참고
- **NNGroup "AI Chatbot Purpose" (Mar 20)**: 사이트 AI 챗봇의 가치 제안 불명확 시 사용자 이탈. 챗봇 온보딩/가이드 UX 설계에 참고
- **GitHub Copilot PR 내 @copilot 수정 요청 (Mar 24)**: 에이전트-인간 인라인 피드백 패턴. HITL 시나리오 UX 참고
- **Vercel AI SDK v7 beta 진행 중**: beta.42까지 빠른 이터레이션. GA 릴리스 시 마이그레이션 검토 대상 유지
- **Chainlit 활동 저하**: 약 1년간 릴리스 없음. 프로젝트 활성도 모니터링 지속

---

## 권장 다음 액션

우선순위순 정렬:

| # | 액션 | 대상 | 이유 | priority |
|---|------|------|------|----------|
| 1 | `/research artifact_panel` | STALE + NEW-1 관련 | 36일 경과 + ChatGPT Library/LobeChat Agent Documents로 아티팩트 라이프사이클 패턴 변화. 리서치 갱신 필수 | high |
| 2 | `/research generative_ui` Phase 3 | (이전 리포트) | MCP Apps 통합 단계. **6회 연속 권장** | high |
| 3 | `/research agent_marketplace` | UPDATE-1 | LobeChat 인라인 mention/slash 스킬 접근 패턴. **8회 연속 권장** | medium |
| 4 | `/research usage_monitoring` Phase 3 | UPDATE-2 | MS Agent 365 거버넌스 Control Plane + Zendesk Admin Copilot. **12회 연속 권장** | medium |

카탈로그 직접 수정 제안:

| # | component_id | 필드 | 현재 | 제안 |
|---|-------------|------|------|------|
| 1 | artifact_panel | status | implemented | needs_update |

---

## 누적 액션 추적

### 이전 리포트 권장 액션 실행 여부

| 리포트 | 액션 | 상태 | 비고 |
|--------|------|------|------|
| 2026-03-19 | /implement prompt_management | 미실행 → **실행 완료** | status: implemented, qa_verdict: PASS (2026-03-13에 이미 완료 상태였음) |
| 2026-03-19 | /research approval_rejection | **실행 완료** | last_researched: 2026-03-19 (갱신됨), status: implemented, qa_verdict: PASS |
| 2026-03-19 | /research generative_ui Phase 2 | 미실행 | last_researched: 2026-03-13, 변동 없음. Phase 2 구현까지 완료. Phase 3 전환 필요 |
| 2026-03-19 | /research agent_marketplace | 미실행 | last_researched: 2026-03-12, 변동 없음 |
| 2026-03-19 | /research usage_monitoring Phase 2 | 미실행 | last_researched: 2026-03-16, 변동 없음. Phase 2 구현 완료. Phase 3 전환 필요 |
| 2026-03-19 | catalog: approval_rejection.status → needs_update | **해소** | approval_rejection 리서치+구현 완료로 status: implemented, qa: PASS |

### 누적 미실행 (3회 이상 연속 권장)

| 액션 | 연속 횟수 | 현재 상태 | 비고 |
|------|----------|----------|------|
| /research usage_monitoring Phase 3 | **12회** | Phase 1+2 구현 완료 | MS Agent 365 거버넌스 + Zendesk Admin Copilot 반영 |
| /research agent_marketplace | **8회** | implemented | LobeChat 인라인 mention + slash 스킬 접근 |
| /research generative_ui Phase 3 | **6회** | Phase 2 구현 완료 | MCP Apps 통합 단계 |

### 30일 경과/임박 컴포넌트

| component_id | last_researched | 경과 | 비고 |
|--------------|----------------|------|------|
| ppt_slide_preview | 2026-02-16 | **38일** | 변화 미감지 → STALE 미처리 유지 |
| artifact_panel | 2026-02-18 | **36일** | 변화 감지 → **STALE 처리** |
| document_viewer | 2026-02-21 | **33일** | 직접 변화 미감지 |
| tool_call_display | 2026-02-23 | **31일** | 직접 변화 미감지 |
| markdown_renderer | 2026-02-24 | **30일** | 직접 변화 미감지 |
| model_agent_switcher | 2026-02-26 | 28일 | |
| self_review_card | 2026-02-27 | 27일 | |

### URL 접근 실패 추적

| 소스 | URL | 연속 실패 | 비고 |
|------|-----|----------|------|
| ThoughtSpot | thoughtspot.com/blog | 연속 실패 (JS 렌더링) | 웹 검색으로 대체 확인 중. thoughtspot.com/new-features 도 JS 이슈 |

> MS Copilot Studio: learn.microsoft.com/en-us/microsoft-copilot-studio/whats-new 로 URL 변경 후 **접근 성공**. 실패 카운터 리셋.

### 추적 항목 해소

| 항목 | 이전 상태 | 해소 결과 |
|------|----------|----------|
| approval_rejection 리서치 | 2026-03-19 UPDATE-1 권장 | **해소**: last_researched 2026-03-19 갱신, AI SDK needsApproval 어댑터 계층 구현, QA PASS |
| prompt_management 구현 | 7회 연속 권장 | **해소**: status: implemented, QA PASS (2026-03-13). 이전 리포트에서 이미 완료였으나 리포트 갱신 미반영 |
