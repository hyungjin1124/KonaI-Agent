# Discovery Report — 2026-03-19

## 스캔 설정
- **모드**: broad
- **시간 범위**: 2026-03-18 ~ 2026-03-19 (1일간)
- **이전 리포트**: 2026-03-18-discovery.md (broad)

## 확인한 소스

| # | 소스 | URL | 상태 |
|---|------|-----|------|
| 1 | ChatGPT changelog | releasebot.io/updates/openai/chatgpt | 변경 없음 (최근: Mar 17 모델 피커 개인화) |
| 2 | Claude blog | releasebot.io/updates/anthropic/claude | 변경 없음 (최근: Mar 17 Cowork Dispatch) |
| 3 | Cursor changelog | cursor.com/changelog | 변경 없음 (최근: Mar 11 30+ Plugins) |
| 4 | Gemini release notes | gemini.google/release-notes | 변경 없음 (최근: Feb 19 Gemini 3.1 Pro) |
| 5 | Windsurf changelog | windsurf.com/changelog | 변경 없음 (최근: Mar 17 GPT-5.4 Mini 지원) |
| 6 | Bolt.new | support.bolt.new/release-notes | 변경 없음 (최근: Mar 6) |
| 7 | v0 by Vercel | v0.dev/changelog | 변경 없음 (최근: Mar 16) |
| 8 | GitHub Copilot | github.com/features/copilot/whats-new | 변경 없음 (Mar 18 페이지 업데이트, 기존 CLI GA 하이라이트) |
| 9 | Salesforce Agentforce | salesforce.com/blog | 변경 없음 |
| 10 | MS Copilot Studio | techcommunity.microsoft.com | **접근 실패** (3회 연속 — URL 재확인 필요) |
| 11 | Google Agentspace | cloud.google.com/agentspace/docs/release-notes | 변경 없음 (최근: Mar 13 SharePoint 필터링) |
| 12 | ThoughtSpot | thoughtspot.com/blog | **접근 실패** (3회 연속 — JS 렌더링 이슈) |
| 13 | Power BI | powerbi.microsoft.com/blog | **확인 완료** — Mar 18: March 2026 Feature Summary 발표 |
| 14 | Hex AI | hex.tech/blog | 변경 없음 (최근: Mar 10) |
| 15 | AG-UI | github.com/ag-ui-protocol/ag-ui/releases | 변경 없음 (태그 릴리스 없음) |
| 16 | MCP | github.com/modelcontextprotocol | 변경 없음 (최근: 2025-11-25) |
| 17 | CopilotKit | github.com/CopilotKit/CopilotKit/releases | 변경 없음 (최근: Mar 12 v1.54.0) |
| 18 | LangGraph | github.com/langchain-ai/langgraph/releases | 변경 없음 (최근: Mar 15 cli 0.4.18) |
| 19 | CrewAI | github.com/crewAIInc/crewAI/releases | 확인 완료 — v1.11.0 정식 릴리스 (Mar 18). Plan-Execute 패턴, LLM 응답 처리 개선 |
| 20 | Vercel AI SDK | github.com/vercel/ai/releases | 확인 완료 — ai@7.0.0-beta.22 외 10개 패키지 (Mar 18). 의존성 업데이트, VideoModel 추가 |
| 21 | Open WebUI | github.com/open-webui/open-webui/releases | 변경 없음 (최근: Mar 9 v0.8.10) |
| 22 | LobeChat | github.com/lobehub/lobe-chat/releases | 확인 완료 — Desktop nightly/canary 빌드 다수 (Mar 18). 프로덕션 대상 아님 |
| 23 | Chainlit | github.com/Chainlit/chainlit/releases | 변경 없음 (최근: v2.10.0, 약 1년간 릴리스 없음) |
| 24 | NNGroup | nngroup.com/articles | 변경 없음 (최근: Mar 16 AI Editor Tips) |

## 보충 검색 쿼리

| # | 쿼리 | 결과 수 |
|---|------|--------|
| 1 | "AI agent UI" OR "agentic interface" new feature "March 2026" | 4건 (AgentKit ChatKit 신규, 나머지 이전 범위) |
| 2 | "human-in-the-loop" OR "AI approval" UI pattern "March 2026" | 4건 (AI SDK 6 needsApproval 신규, 나머지 이전 범위) |
| 3 | "conversational AI" OR "chat UI" framework release "March 2026" | 4건 (assistant-ui 신규 발견, 나머지 이전 범위) |
| 4 | "enterprise AI dashboard" OR "AI copilot admin" "March 2026" | 4건 (MS Security Dashboard 추적 해소, 나머지 기존 보고) |
| 5 | "AI data visualization" OR "natural language query" dashboard "March 2026" | 2건 (기존 보고 항목) |

---

## 요약

- 신규 패턴 발견: 1건
- 개선 필요: 2건
- 우선순위 변경 제안: 0건
- 리서치 노후: 0건
- 폐기 후보: 0건
- **중복 필터링으로 제외**: 5건

---

## 신규 패턴 (NEW)

| # | 패턴명 | 설명 | 발견 출처 | 관련 카테고리 | 권장 priority | 권장 complexity | confidence |
|---|--------|------|----------|-------------|--------------|----------------|------------|
| 1 | OpenAI AgentKit (ChatKit GA) | OpenAI의 임베더블 채팅 UI 툴킷 GA + Connector Registry | openai.com/index/introducing-agentkit/ | conversational_primitives, admin_operations | medium | moderate | medium |

### 상세

#### NEW-1: OpenAI AgentKit — ChatKit GA + Connector Registry

- **발견 출처**: https://openai.com/index/introducing-agentkit/ (Oct 2025 발표, Mar 2026 GA 단계 진입)
- **경쟁사 현황**: OpenAI가 에이전트 개발 통합 플랫폼 AgentKit을 GA 출시 중. 3가지 구성요소:
  - **ChatKit** (GA): 커스터마이즈 가능한 채팅 기반 에이전트 UI를 제품에 임베딩하는 툴킷. 스트리밍, 도구 호출 시각화, 승인 게이트 기본 제공
  - **Agent Builder** (Beta): 시각적 캔버스에서 멀티 에이전트 워크플로 설계 및 버전 관리
  - **Connector Registry** (Beta rollout): 관리자가 데이터/도구 연결을 중앙 관리. Dropbox, Google Drive, SharePoint, Teams, 타사 MCP 지원
- **KonaI-Agent 관련성**: ChatKit은 채팅 UI 구현의 경쟁 벤치마크로 활용 가능. Connector Registry는 에이전트 도구 관리 UI 패턴에 직접적 참고 가치. 특히 MCP 서버 연결 관리 UI는 admin_operations 카테고리와 관련

---

## 개선 필요 (UPDATE)

| # | component_id | 현재 상태 | 발견 내용 | 출처 |
|---|-------------|----------|----------|------|
| 1 | approval_rejection | partial | AI SDK 6 `needsApproval` 네이티브 HITL 패턴 발견 | ai-sdk.dev/cookbook/next/human-in-the-loop |
| 2 | (liveboard 관련) | implemented | Power BI Translytical Task Flows GA — 대시보드 write-back 패턴 | powerbi.microsoft.com/blog |

### 상세

#### UPDATE-1: approval_rejection — AI SDK 6 `needsApproval` 네이티브 HITL

- **현재 구현**: 커스텀 HITL 훅(`useSlideOutlineHITL.ts` 등)으로 시나리오별 개별 구현. `isHitl` 플래그와 `resumeWithHitlSelection()` 콜백 조합
- **경쟁사 변화**: Vercel AI SDK 6이 도구 정의에 `needsApproval: true` 한 줄 추가로 HITL 승인 게이트를 자동 생성하는 선언적 패턴 제공:
  - 조건부 승인: `needsApproval`에 async 함수 전달 가능 (예: $1000 이상 결제만 승인 필요)
  - 프론트엔드: `useChat` 훅에서 `approval-requested` 상태 감지 후 approve/deny 버튼 렌더링
  - `addToolApprovalResponse`로 사용자 결정 전송
- **개선 포인트**: Next.js 15 스택과 직접 호환. 현재 커스텀 HITL 구현을 표준화 가능. 조건부 승인 패턴은 15-role RBAC과 결합하여 역할별 승인 임계치 설정에 활용 가능. 기존 리서치(last_researched: 2026-02-21)에 이 패턴 반영 필요

#### UPDATE-2: Liveboard 위젯 액션 — Power BI Translytical Task Flows GA

- **현재 구현**: Liveboard 위젯은 읽기 전용 시각화 중심. 위젯에서 직접 데이터 수정/워크플로 트리거는 미구현
- **경쟁사 변화**: Power BI March 2026 Feature Summary (Mar 18 발표)에서 Translytical Task Flows GA:
  - 리포트 내에서 직접 레코드 수정 및 워크플로 트리거 가능 (write-back 패턴)
  - AI Narrative auto-refresh, Modern visual defaults (Fluent 2) 포함
- **개선 포인트**: Liveboard의 위젯-to-action 흐름에 write-back 패턴 참고. 데이터 시각화 → 즉시 액션 전환 UX 패턴

---

## 우선순위 변경 제안 (PRIORITY_CHANGE)

해당 없음.

---

## 리서치 노후 (STALE)

해당 없음.

> ppt_slide_preview: last_researched 2026-02-16 (31일 경과). 단, 스캔 범위 내 관련 변화 미감지 → STALE 미처리 유지.

---

## 폐기 후보 (DEPRECATED)

해당 없음.

---

## 중복 필터링 상세

| # | 항목 | 이전 리포트 매핑 | 처리 |
|---|------|----------------|------|
| 1 | Oracle+Google+CopilotKit 3-Layer + A2UI | 2026-03-13 broad | 제외 |
| 2 | MS Agent Dashboard / 365 Control Plane | 2026-03-11 admin | 제외 |
| 3 | Databricks Genie Code / One GA | 2026-03-12 broad | 제외 |
| 4 | GPT-5.4 / GPT-5.3 Instant / ChatSpark | 이전 다수 리포트 | 제외 |
| 5 | MS AG-UI HITL 공식 문서 | 2026-03-18 broad | 제외 |

### 보고 기준 미달 제외

| # | 항목 | 사유 |
|---|------|------|
| 1 | CrewAI v1.11.0 (Mar 18) | Plan-Execute 패턴, LLM 응답 처리 개선. 백엔드/SDK 변경, UI 패턴 직접 영향 없음 |
| 2 | Vercel AI SDK ai@7.0.0-beta.22 (Mar 18) | 의존성 동기화 + VideoModel 추가. Beta 단계, UI 패턴 변경 아님 |
| 3 | LobeChat Desktop nightly 다수 (Mar 18) | 자동 nightly 빌드. 안정 릴리스 아님 |
| 4 | World AgentKit (Mar 17) | AI 에이전트 인간 신원 증명 SDK. 1개 제품 실험적. 엔터프라이즈 직접 관련성 낮음 |
| 5 | Galileo Agent Control (Mar 13) | 오픈소스 에이전트 거버넌스 레이어. 초기 단계, 1개 프로젝트 |
| 6 | GitHub Copilot Metrics GA (Feb 27) | 이전 범위 |

### 주목 사항 (다음 스캔 시 추적)

- **assistant-ui React 채팅 라이브러리**: 50k+ 월간 다운로드, YC 포트폴리오. AI SDK, LangGraph, Mastra 백엔드 통합 지원. 스트리밍, 자동스크롤, 재시도, 첨부파일, 마크다운, 코드 하이라이팅, 음성 입력, 접근성 기본 제공. 단일 OSS 프로젝트이나 트래픽이 유의미하여 채팅 UI 기술 평가 시 참고 대상 (github.com/assistant-ui/assistant-ui)
- **Chainlit 활동 저하**: 약 1년간 신규 릴리스 없음 (최근: v2.10.0). 프로젝트 활성도 모니터링 필요
- **Vercel AI SDK v7.0 GA 예정**: v7.0 beta 진행 중. GA 릴리스 시 `@ai-sdk/gateway`(모델 라우팅)와 `@ai-sdk/langchain` 통합이 멀티모델 전략에 영향. 계속 모니터링

---

## 권장 다음 액션

우선순위순 정렬:

| # | 액션 | 대상 | 이유 | priority |
|---|------|------|------|----------|
| 1 | `/implement prompt_management` | (이전 리포트) | 리서치 완료(Mar 13). **7회 연속 권장**. 구현 착수 가능 | high |
| 2 | `/research approval_rejection` | UPDATE-1 | AI SDK 6 `needsApproval` 네이티브 HITL 패턴 반영. last_researched 26일 경과 | high |
| 3 | `/research generative_ui` Phase 2 | (이전 리포트) | ChatGPT+Claude 인터랙티브 시각화 표준화. **5회 연속 권장** | high |
| 4 | `/research agent_marketplace` | (이전 리포트) | LobeChat 스킬/벤치마크+Cursor 30+ 플러그인. **7회 연속 권장** | medium |
| 5 | `/research usage_monitoring` Phase 2 | (이전 리포트) | MS Agent Dashboard + Security Dashboard 반영. **11회 연속 권장** | medium |

카탈로그 직접 수정 제안:

| # | component_id | 필드 | 현재 | 제안 |
|---|-------------|------|------|------|
| 1 | approval_rejection | status | partial | needs_update |

---

## 누적 액션 추적

### 이전 리포트 권장 액션 실행 여부

| 리포트 | 액션 | 상태 | 비고 |
|--------|------|------|------|
| 2026-03-18 | /implement prompt_management | 미실행 | status: not_implemented, 변동 없음 |
| 2026-03-18 | /research generative_ui Phase 2 | 미실행 | last_researched: 2026-03-13, 변동 없음 |
| 2026-03-18 | /research approval_rejection | 미실행 | last_researched: 2026-02-21, 변동 없음 |
| 2026-03-18 | /research agent_marketplace | 미실행 | last_researched: 2026-03-12, 변동 없음 |
| 2026-03-18 | /research usage_monitoring Phase 2 | 미실행 | last_researched: 2026-03-01, 변동 없음 |

### 누적 미실행 (3회 이상 연속 권장)

| 액션 | 연속 횟수 | 현재 상태 | 비고 |
|------|----------|----------|------|
| /research usage_monitoring Phase 2 | **11회** | Phase 1+2 구현 진행 중 | MS Agent Dashboard + Security Dashboard 반영 |
| /implement prompt_management | **7회** | not_implemented (리서치 완료) | 리서치 브리프 완료. 구현만 남음 |
| /research agent_marketplace | **7회** | implemented | LobeChat 스킬/벤치마크+Cursor 30+ 플러그인 |
| /research generative_ui Phase 2 | **5회** | implemented (Phase 1 QA PASS) | ChatGPT+Claude 인터랙티브 시각화 반영 필요 |

### 30일 경과/임박 컴포넌트

| component_id | last_researched | 경과 | 비고 |
|--------------|----------------|------|------|
| ppt_slide_preview | 2026-02-16 | **31일** | 변화 미감지 → STALE 미처리 유지 |
| artifact_panel | 2026-02-18 | 29일 | 내일 30일 도달 |
| approval_rejection | 2026-02-21 | 26일 | UPDATE 발견 — 리서치 권장 |
| document_viewer | 2026-02-21 | 26일 | |

### URL 접근 실패 추적

| 소스 | URL | 연속 실패 | 비고 |
|------|-----|----------|------|
| MS Copilot Studio | techcommunity.microsoft.com / learn.microsoft.com/copilot-studio | **3회** ⚠️ | URL 변경 권장: `learn.microsoft.com/en-us/microsoft-copilot-studio/whats-new` |
| ThoughtSpot | thoughtspot.com/blog | **3회** ⚠️ | JS 렌더링 이슈. WebSearch 기반 대체 확인 방식 권장 |

### 추적 항목 해소

| 항목 | 이전 상태 | 해소 결과 |
|------|----------|----------|
| MS Security Dashboard for AI | 다음 스캔에서 재확인 (2026-03-18) | **해소**: Feb 13 Public Preview 발표 확인. AI 리스크 관리/평가/완화 대시보드. Copilot Control System의 일부. 추가 라이선스 비용 없음. admin_operations 참고 가치 있으나 별도 카탈로그 항목까지는 불필요 |
