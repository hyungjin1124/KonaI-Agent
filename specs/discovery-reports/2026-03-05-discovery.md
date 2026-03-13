# Discovery Report — 2026-03-05

## 스캔 설정

- **모드**: broad
- **시간 범위**: 2026-03-05 ~ 2026-03-05 (1일간)
- **이전 리포트**: 2026-03-04-discovery.md

## 확인한 소스

| # | 소스 | URL | 상태 |
|---|------|-----|------|
| 1 | ChatGPT (Fallback) | releasebot.io/updates/openai/chatgpt | 확인 완료 — GPT-5.3 Instant (Mar 3), UI 패턴 변경 없음 |
| 2 | Claude (Fallback) | releasebot.io/updates/anthropic/claude | 확인 완료 — Memory for free users (Mar 2), 변경 없음 |
| 3 | Cursor changelog | cursor.com/changelog | 확인 완료 — **v2.6 MCP Apps + Team Marketplaces (Mar 3)** |
| 4 | Gemini release notes | blog.google/technology/ai | 접근 실패 (콘텐츠 미로드) |
| 5 | Windsurf changelog | windsurf.com/changelog | 확인 완료 — 변경 없음 (최근: Feb 26) |
| 6 | Bolt.new | support.bolt.new/release-notes | 미확인 (이전 리포트 연속 실패) |
| 7 | v0 changelog | v0.dev/changelog | 확인 완료 — Git 통합, Python 백엔드 (Mar 3). UI 패턴 무관 |
| 8 | GitHub Copilot | github.com/features/copilot/whats-new | 접근 실패 (타임아웃) |
| 9 | AG-UI | github.com/ag-ui-protocol/ag-ui/releases | 확인 완료 — 릴리스 없음 |
| 10 | MCP TypeScript SDK | github.com/modelcontextprotocol/typescript-sdk/releases | 이전 확인 기준 변경 없음 (v1.27.1, Feb 24) |
| 11 | CopilotKit | github.com/CopilotKit/CopilotKit/releases | 확인 완료 — 변경 없음 (v1.52.1, Feb 27) |
| 12 | LangGraph | github.com/langchain-ai/langgraph/releases | 확인 완료 — langgraph-cli v0.4.14 (Mar 2). CLI/보안 패치, UI 패턴 무관 |
| 13 | CrewAI | github.com/crewAIInc/crewAI/releases | 확인 완료 — 변경 없음 (v1.10.1a1, Feb 27) |
| 14 | Vercel AI SDK | github.com/vercel/ai/releases | 확인 완료 — ai@6.0.108-111 (Mar 3). 텔레메트리 인터페이스 추가, UI 패턴 무관 |
| 15 | Open WebUI | github.com/open-webui/open-webui/releases | 확인 완료 — v0.8.8 (Mar 2). Terminal/HTML preview, UI 패턴 직접 관련 낮음 |
| 16 | LobeChat | github.com/lobehub/lobe-chat/releases | 확인 완료 — canary/nightly 빌드만 (Mar 3-4), 정식 릴리스 없음 |
| 17 | Chainlit | github.com/Chainlit/chainlit/releases | 확인 완료 — 변경 없음 (v2.9.6, Jan 20) |
| 18 | NNGroup | nngroup.com/articles (AI 태그) | 확인 완료 — 변경 없음 (최근: Mar 2) |
| 19 | MS Copilot Studio | techcommunity.microsoft.com | 이전 보고 항목(Agent Dashboard GA) 지속, 추가 변경 없음 |

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

- 신규 패턴 발견: **0**건
- 개선 필요: **2**건
- 우선순위 변경 제안: **0**건
- 리서치 노후: **0**건
- 폐기 후보: **0**건
- **중복 필터링으로 제외**: **4**건

> 1일간 스캔. Cursor 2.6 (Mar 3)의 MCP Apps가 핵심 발견 — 에이전트 채팅 내에 인터랙티브 UI(차트, 다이어그램, 화이트보드)를 MCP 서버 기반으로 네이티브 렌더링. Team Marketplaces로 엔터프라이즈 플러그인 거버넌스 제공. generative_ui Phase 3(MCP Apps 통합)와 직접 관련. 대부분의 소스에서 1일간 유의미한 변경 없음.

---

## 개선 필요 (UPDATE)

| # | component_id | 현재 상태 | 발견 내용 | 출처 |
|---|-------------|----------|----------|------|
| 1 | generative_ui | implemented (Phase 1) | Cursor 2.6 MCP Apps — MCP 서버가 인터랙티브 UI(차트, 다이어그램, 화이트보드)를 에이전트 채팅 내에 네이티브 렌더링. Phase 3 MCP Apps 통합 설계의 실제 구현 사례 제공. | cursor.com/changelog/2-6 |
| 2 | agent_marketplace | not_implemented (low) | Cursor 2.6 Team Marketplaces — Teams/Enterprise 플랜에서 관리자가 프라이빗 플러그인 마켓플레이스를 생성하여 내부 배포·거버넌스·접근 제어를 중앙 관리. 기존 skill_management와 결합 가능. | cursor.com/changelog/2-6 |

### 상세

#### UPDATE-1: generative_ui

- **현재 구현**: implemented (Phase 1 Static MVP, QA PASS 2026-03-04). 8종 컴포넌트 type dispatch, JSON 파싱, ArtifactPanel 통합. Phase 2: A2UI 호환 Declarative 렌더러. Phase 3: MCP Apps 통합 계획.
- **경쟁사 변화**:
  - **Cursor 2.6 MCP Apps (Mar 3)**: MCP 서버가 생성하는 인터랙티브 UI를 에이전트 채팅 내에 직접 렌더링. Amplitude 차트, Figma 다이어그램, tldraw 화이트보드 등 서드파티 MCP 서버의 UI를 네이티브로 표시. 이는 MCP 프로토콜 위에서 Generative UI를 구현한 최초의 주요 제품 사례.
  - **이전 맥락**: Google A2UI + AG-UI + OpenAI AgentKit이 이미 프로토콜 레이어를 구축 중. Cursor가 MCP Apps로 "MCP 기반 UI 렌더링"을 실제 제품에 탑재하면서, Phase 3 설계 방향의 유효성 확인.
- **개선 포인트**:
  1. Phase 3 MCP Apps 통합 설계 시 Cursor의 MCP Apps 구현 패턴 참조 (MCP 서버 → UI 렌더링 파이프라인)
  2. 서드파티 MCP 서버의 UI 컴포넌트를 샌드박스 내에서 안전하게 렌더링하는 보안 모델 검토
  3. A2UI(Google), AG-UI, MCP Apps(Cursor) 3대 프로토콜의 UI 렌더링 접근 비교 분석 필요
- **confidence**: high (Cursor 정식 릴리스, MCP 생태계의 UI 확장 확인)

#### UPDATE-2: agent_marketplace

- **현재 구현**: not_implemented (low priority). 별도 소스 파일 없음.
- **경쟁사 변화**:
  - **Cursor 2.6 Team Marketplaces (Mar 3)**: Teams/Enterprise 플랜 관리자가 프라이빗 플러그인 마켓플레이스를 생성. 중앙 거버넌스, 접근 제어, 내부 배포 관리. 설정 페이지에서 플러그인 배포·관리 가능.
  - 기존 `skill_management` (implemented)에 "팀 내부 공유 + 거버넌스" 레이어 추가 패턴.
- **개선 포인트**:
  1. `skill_management`의 기존 구현(SkillManagementView, SkillUploadModal)을 확장하여 팀 마켓플레이스 기능 추가
  2. 관리자 접근 제어 + 배포 승인 플로우 설계
  3. 공개 마켓플레이스 vs 팀 프라이빗 마켓플레이스의 UX 분리
- **confidence**: medium (Cursor 1개 제품이나, 엔터프라이즈 거버넌스에 직결)

---

## 중복 필터링 상세 (이전 리포트와 겹침 또는 보고 기준 미달)

| # | 항목 | 이전 리포트 매핑 | 비고 |
|---|------|---------------|------|
| 1 | OpenAI AgentKit (Mar 4 발표) | 2026-03-04 NEW-1 | 이미 보고됨, 추가 진전 없음 |
| 2 | Google A2UI Protocol (Feb 26) | 2026-03-03 NEW-1 → 2026-03-04 중복 | 이미 보고됨 |
| 3 | MS Agent Dashboard GA (Mar) | 2026-03-04 UPDATE 누적 | 이미 보고됨, 추가 진전 없음 |
| 4 | GPT-5.3 Instant (Mar 3) | — | 대화 품질 개선. UI 패턴 변경 없음. 보고 기준 미달 |

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

### 완료 컴포넌트 필터링

완료 컴포넌트 (`status: implemented` + `qa_verdict: PASS`):
- `model_agent_switcher` — 액션 제외
- `usage_monitoring` — 액션 제외
- `generative_ui` — Phase 1 완료이나 Phase 2/3 계획 존재. UPDATE 발견이므로 **DEFERRED 후보**로 표기

### DEFERRED 후보 (Phase 2 개선)

| # | component_id | 발견 내용 | 비고 |
|---|-------------|----------|------|
| 1 | generative_ui | Cursor MCP Apps 패턴 → Phase 3 참조 | QA PASS 완료. Phase 2(A2UI) → Phase 3(MCP Apps) 순서로 개선 예정 |

### 연속 권장 횟수 초기화

- `/research generative_ui`: 이전 9회 연속 권장 → generative_ui가 QA PASS 완료되었으므로 **0으로 초기화**. Phase 2/3 리서치는 별도 요청 시 진행.

### 액션 테이블

우선순위순으로 정렬:

| # | 액션 | 대상 | 이유 | priority |
|---|------|------|------|----------|
| 1 | `/implement multi_agent_orchestration_ui` | 이전 누적 | 리서치 완료(2026-03-02), 구현 단계로 전환 권장. **3회 연속 권장** | **high** |
| 2 | `/research agent_marketplace` | UPDATE-2 | Cursor Team Marketplaces 패턴. 기존 skill_management 확장으로 팀 플러그인 거버넌스 설계 | **medium** |
| 3 | `/research usage_monitoring` | 이전 누적 | MS Agent Dashboard GA + GitHub Copilot Metrics GA. Phase 2 기획. **3회 연속 권장** | **medium** |

카탈로그 직접 수정 제안:

| # | component_id | 필드 | 현재 | 제안 |
|---|-------------|------|------|------|
| 1 | generative_ui | notes | (기존) | 추가: "Cursor 2.6 MCP Apps (Mar 3): MCP 서버 기반 인터랙티브 UI(차트, 다이어그램, 화이트보드)를 에이전트 채팅 내 네이티브 렌더링. Phase 3 MCP Apps 통합 설계의 실제 구현 사례." |
| 2 | agent_marketplace | notes | (없음) | 추가: "Cursor 2.6 Team Marketplaces (Mar 3): Teams/Enterprise 관리자가 프라이빗 플러그인 마켓플레이스 생성·배포·거버넌스. skill_management 확장으로 구현 가능." |
| 3 | agent_marketplace | priority | low | medium |

---

## 누적 액션 추적

### 이전 리포트 (2026-03-04) 권장 액션 실행 여부:

| 리포트 | 액션 | 상태 | 비고 |
|--------|------|------|------|
| 2026-03-04 | `/research generative_ui` | **초기화** | generative_ui QA PASS (2026-03-04). Phase 1 완료. 연속 권장 카운터 0으로 리셋 |
| 2026-03-04 | `/research workflow_builder` | **미실행** | last_researched 없음. 1회 권장 |
| 2026-03-04 | `/research usage_monitoring` | **미실행** | last_researched: 2026-03-01. Phase 2 미착수 |
| 2026-03-04 | `/implement multi_agent_orchestration_ui` | **미실행** | last_researched: 2026-03-02. 구현 단계 미전환 |
| 2026-03-04 | catalog: workflow_builder.notes 추가 | **미적용** | 현재: 기존 notes 유지 |
| 2026-03-04 | catalog: generative_ui.notes 추가 | **적용 완료** | AgentKit ChatKit 내용 반영됨 |

### 누적 미실행 (3회 이상 연속 권장):

| 리포트 | 액션 | 연속 권장 횟수 | 비고 |
|--------|------|-------------|------|
| 2026-03-02~03-05 | `/implement multi_agent_orchestration_ui` | **3회** | 리서치 완료 상태. 구현 전환 권장 |
| 2026-03-03~03-05 | `/research usage_monitoring` | **3회** | Phase 2 기획 필요 |
