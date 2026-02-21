# Discovery Report — 2026-02-21

## 스캔 설정
- **모드**: broad
- **시간 범위**: 2026-02-16 ~ 2026-02-21 (5일간)
- **이전 리포트**: 2026-02-16-discovery-3.md

## 확인한 소스

| # | 소스 | URL | 상태 |
|---|------|-----|------|
| 1 | ChatGPT changelog | help.openai.com/en/articles/6825453-chatgpt-release-notes | 확인 완료 — Deep Research UI 리디자인 (Feb 20) |
| 2 | OpenAI blog/index | openai.com/index | 확인 완료 |
| 3 | Anthropic news / Claude blog | claude.com/blog | 확인 완료 — Claude Code 2.1.45-47 (Feb 18-19), Security Preview (Feb 20) |
| 4 | Claude changelog | releasebot.io/updates/anthropic/claude | 확인 완료 — Sonnet 4.6 (Feb 17), 웹 도구 GA (Feb 17) |
| 5 | Cursor changelog | releasebot.io/updates/cursor | 확인 완료 — v2.5 + 3건 업데이트 (Feb 18-20) |
| 6 | Cursor blog | cursor.com/blog | 확인 완료 |
| 7 | Windsurf changelog | windsurf.com/changelog | 확인 완료 — 모델 추가만 (Feb 17, 19) |
| 8 | Windsurf blog | windsurf.com/blog | 확인 완료 — 변경 없음 |
| 9 | Gemini / Google AI blog | blog.google/technology/ai, gemini.google/release-notes | 확인 완료 — Deep Think 추론 모드, Workspace 사용량 리포트 (Feb 16-19) |
| 10 | v0 changelog | v0.app/changelog | 확인 완료 — 버그 수정만 (Feb 16) |
| 11 | Bolt.new | support.bolt.new/release-notes | 확인 완료 — 변경 없음 |
| 12 | GitHub Copilot | releasebot.io/updates/github | 확인 완료 — 모델 피커, CLI 크로스세션 메모리, 조직 메트릭스 (Feb 19-21) |
| 13 | AG-UI | github.com/ag-ui-protocol/ag-ui | 확인 완료 — 변경 없음 |
| 14 | MCP TypeScript SDK | github.com/modelcontextprotocol/typescript-sdk | 확인 완료 — v1.27.0 (Feb 16), elicitation/sampling 스트리밍 |
| 15 | CopilotKit | github.com/CopilotKit/CopilotKit/releases | 확인 완료 — v1.51.4 (Feb 17), 스레드 격리 수정 |
| 16 | LangGraph | github.com/langchain-ai/langgraph/releases | 확인 완료 — v1.0.9 릴리즈 |
| 17 | CrewAI | github.com/crewAIInc/crewAI/releases | 확인 완료 — v1.10.0a1 pre-release (Feb 19) |
| 18 | Vercel AI SDK | github.com/vercel/ai/releases | 확인 완료 — v6.0.97 (Feb 20) |

## 보충 검색 쿼리

| # | 쿼리 | 결과 수 |
|---|------|--------|
| 1 | "AI agent UI" OR "agentic interface" new feature February 2026 | 10건 |
| 2 | "human-in-the-loop" OR "AI approval" UI pattern February 2026 | 10건 |
| 3 | "conversational AI" OR "chat UI" framework release February 2026 | 10건 |

---

## 요약

- 신규 패턴 발견: **2**건
- 개선 필요: **5**건
- 우선순위 변경 제안: **1**건
- 리서치 노후: **0**건
- 폐기 후보: **0**건
- **중복 필터링으로 제외**: **4**건

---

## 신규 패턴 (NEW)

| # | 패턴명 | 설명 | 발견 출처 | 관련 카테고리 | 권장 priority | 권장 complexity |
|---|--------|------|----------|-------------|--------------|----------------|
| 1 | Agent Sandbox / Permission Control UI | 에이전트 실행 환경의 네트워크·파일시스템 접근 권한을 세밀하게 제어하는 UI (도메인 허용목록, 경로 제한, 엔터프라이즈 정책 적용) | Cursor 2.5 (Feb 18) | admin_operations | medium | moderate |
| 2 | Live Plan Preview with Inline Collaboration | 에이전트가 실행 계획을 반복 수정하는 과정을 실시간 프리뷰로 보여주며, 사용자가 인라인 코멘트로 개입하는 HITL 협업 패턴 | Claude Code 2.1.47 (Feb 19) | hitl_patterns | high | complex |

### 상세

#### NEW-1: Agent Sandbox / Permission Control UI
- **발견 출처**: Cursor 2.5 (Feb 18, 2026) — releasebot.io/updates/cursor, cursor-changelog.com
- **경쟁사 현황**:
  - **Cursor 2.5**: 샌드박스 네트워크 접근 제어 3가지 모드 (user config only / user config + defaults / allow all), 파일시스템 경로 제한, 엔터프라이즈 관리자 대시보드에서 조직 전체 정책 강제
  - 샌드박스 에이전트는 비샌드박스 대비 40% 적은 인터럽션 발생
  - NVIDIA 등 대형 기업 도입
- **KonaI-Agent 관련성**: 엔터프라이즈 대시보드에서 에이전트의 자율성 수준을 제어하는 `variable_autonomy_control` 및 `agent_config`와 연관. 에이전트가 접근 가능한 데이터 소스·API를 관리자가 제어하는 UI가 엔터프라이즈 시나리오에서 필수적. 현재 카탈로그의 `variable_autonomy_control`과 `agent_config`의 하위 기능으로 편입 가능하므로 별도 컴포넌트 추가보다는 기존 컴포넌트 리서치 갱신 권장

#### NEW-2: Live Plan Preview with Inline Collaboration
- **발견 출처**: Claude Code 2.1.47 (Feb 19, 2026) — claude.com/blog/preview-review-and-merge-with-claude-code
- **경쟁사 현황**:
  - **Claude Code 2.1.47**: VS Code에서 에이전트가 실행 계획을 반복 수정할 때 플랜 프리뷰가 자동 업데이트. 사용자가 인라인 코멘트를 달면 에이전트가 반영
  - **Claude Code Security Preview** (Feb 20): 다단계 검증에서 각 단계마다 인간 승인 필요 ("developers always make the call")
  - **ChatGPT Deep Research** (Feb 20): 리서치 계획 편집 + 실행 중 방향 전환
  - **Cursor CLI Plan Mode** (Feb 19): 클라우드/로컬 빌드 선택 + 키보드 단축키 기반 결정 메뉴
  - 3개 이상 경쟁사가 동시에 "실행 전/중 계획 편집 + 실시간 프리뷰" 패턴 채택
- **KonaI-Agent 관련성**: PPT 시나리오의 슬라이드 아웃라인 HITL 단계를 실시간 프리뷰 + 인라인 코멘트 방식으로 강화 가능. 현재 `approval_rejection` 및 `inline_edit`의 상위 패턴으로, 별도 컴포넌트보다는 이 두 컴포넌트의 리서치 갱신 시 반영 권장

---

## 개선 필요 (UPDATE)

| # | component_id | 현재 상태 | 발견 내용 | 출처 |
|---|-------------|----------|----------|------|
| 1 | document_viewer | implemented | ChatGPT Deep Research UI 리디자인: 사이드바 진입점 + 인터랙티브 인덱스·인용 사이드패널 + 풀스크린 토글 | ChatGPT Release Notes (Feb 20) |
| 2 | chat_input | partial | Telerik/Kendo UI Q1 2026: AI-ready Chat 컴포넌트 (single/multiline/auto-expand, prefix/suffix 커스텀, speech-to-text, file selection, IChatClient 통합) | telerik.com/blogs (Feb 18) |
| 3 | approval_rejection | partial | CrewAI v1.10.0a1: async HITL, LangGraph v1.0.9: sequential interrupt 수정, MCP TS SDK v1.27.0: elicitation, Claude Code: 다단계 검증 | 다수 (Feb 16-20) |
| 4 | model_agent_switcher | not_implemented | GitHub Copilot Agent Model Picker: 에이전트 워크플로우 내 모델 선택 UI (Claude/GPT-5 변형) + Auto 모드 | GitHub (Feb 19) |
| 5 | usage_monitoring | not_implemented | GitHub 조직 레벨 Copilot 사용량 메트릭스 대시보드 (Public Preview); Gemini Workspace 사용량 리포트 GA | GitHub (Feb 21), Google (Feb 16) |

### 상세

#### UPDATE-1: document_viewer
- **현재 구현**: Phase 1+2 구현 완료 (react-pdf, docx-preview). `last_researched: 2026-02-16`
- **경쟁사 변화**:
  - **ChatGPT Deep Research UI 리디자인** (Feb 20, 2026 — 이전 리포트의 Feb 11 풀스크린 뷰어와 별도):
    - **사이드바 진입점**: Deep Research를 사이드바에서 직접 시작/관리
    - **인터랙티브 인덱스 + 인용 사이드패널**: 문서 내 섹션 네비게이션 + 출처 인용을 사이드 패널로 분리
    - **풀스크린 토글**: 채팅 내 뷰 ↔ 풀스크린 전환
    - 이전 리포트(Feb 16)에서 보고된 "풀스크린 뷰어 + TOC + 출처 사이드바"의 구체적 UI 구현이 확정됨
- **개선 포인트**: 현재 DocumentViewer에 TOC 사이드바, 인용/출처 패널, 풀스크린 토글 기능 추가 검토. 리서치 브리프 갱신 필요
- **출처**:
  - https://releasebot.io/updates/openai/chatgpt
  - https://help.openai.com/en/articles/6825453-chatgpt-release-notes

#### UPDATE-2: chat_input
- **현재 구현**: partial. 기본 textarea 구현됨. 멀티모달 확장 필요
- **경쟁사 변화**:
  - **Telerik/Kendo UI 2026 Q1 Release** (Feb 18, 2026):
    - **3가지 입력 모드**: single-line, multiline, auto-expand
    - **Prefix/Suffix 커스텀 콘텐츠**: 입력창 앞뒤에 커스텀 UI 요소 배치
    - **빌트인 액션**: speech-to-text, file selection 등 네이티브 통합
    - **IChatClient 통합**: Microsoft.Extensions.AI로 AI 파이프라인 자동 연결
  - 이 패턴은 KonaI-Agent의 ChatInputArea가 참조할 수 있는 상용 UI 프레임워크의 AI-ready 입력 컴포넌트 표준
- **개선 포인트**: 현재 리서치 브리프(`multimodal-input-patterns.md`)에 Telerik Chat 컴포넌트의 입력 모드 전환 + prefix/suffix 패턴 반영 필요
- **출처**:
  - https://www.telerik.com/blogs/next-productivity-leap-telerik-kendo-ui-2026-q1-release

#### UPDATE-3: approval_rejection
- **현재 구현**: partial. PPT 시나리오 훅에 결합됨. 범용 ApprovalGate 컴포넌트 분리 필요
- **프레임워크/경쟁사 변화**:
  - **MCP TypeScript SDK v1.27.0** (Feb 16, 2026):
    - **Elicitation**: MCP 서버가 도구 실행 중 일시 정지하여 사용자에게 JSON Schema 기반 구조화된 입력 폼 요청 가능. HITL의 프로토콜 레벨 표준화
    - **Sampling 스트리밍**: 태스크 기반 실행에서 elicitation/sampling 스트리밍 메서드 추가
  - **CrewAI v1.10.0a1** (Feb 19, 2026 pre-release):
    - **Async HITL 지원**: 비동기 환경에서의 HITL 워크플로우 구현
    - **User input handling in Flows**: Flow 실행 중 사용자 입력 요청/대기/재개 패턴
  - **LangGraph v1.0.9** (Feb 19, 2026):
    - **Sequential interrupt 수정**: functional API에서 여러 interrupt를 순차적으로 처리할 때의 버그 수정. HITL 워크플로우 안정성 향상
  - **Vercel AI SDK v6.0.97** (Feb 20, 2026):
    - **ToolLoopAgent experimental callbacks**: 에이전트 스텝 완료 후 콜백, 전체 완료 콜백 지원. UI에서 에이전트 진행 상태를 실시간 추적하는 데 활용 가능
  - **Claude Code Security Preview** (Feb 20, 2026):
    - **다단계 검증 + 인간 게이팅**: AI 코드 분석에서 각 검증 단계마다 인간 승인 필수. "developers always make the call"
- **개선 포인트**: 현재 리서치 브리프(`approval-gate-component.md`)에 MCP elicitation (프로토콜 레벨 HITL), async HITL 패턴, sequential interrupt 핸들링, 다단계 검증 게이팅 패턴 반영 필요
- **출처**:
  - https://github.com/modelcontextprotocol/typescript-sdk (v1.27.0)
  - https://github.com/crewAIInc/crewAI/releases/tag/1.10.0a1
  - https://github.com/langchain-ai/langgraph/releases
  - https://github.com/vercel/ai/releases/tag/ai%406.0.97
  - https://claude.com/blog/preview-review-and-merge-with-claude-code

#### UPDATE-4: model_agent_switcher
- **현재 구현**: not_implemented. priority: medium
- **경쟁사 변화**:
  - **GitHub Copilot Coding Agent Model Picker** (Feb 19, 2026):
    - Business/Enterprise 사용자가 에이전트 워크플로우 내에서 Claude Opus/Sonnet 또는 GPT-5 변형 중 선택
    - **Auto 모드**: 성능 최적화를 위한 자동 모델 선택
  - 이 패턴은 KonaI-Agent에서 시나리오별로 다른 모델을 선택하거나 자동 선택하는 UI에 직접 적용 가능
- **개선 포인트**: 모델/에이전트 전환 컴포넌트 리서치 시 Auto 모드 패턴 포함 검토
- **출처**:
  - https://releasebot.io/updates/github
  - https://github.com/features/copilot/whats-new

#### UPDATE-5: usage_monitoring
- **현재 구현**: not_implemented. priority: medium
- **경쟁사 변화**:
  - **GitHub** (Feb 21, 2026): 조직 레벨 Copilot 사용량 메트릭스 대시보드 Public Preview. Enterprise 없이도 조직 단위 채택률 분석 가능. 최소 권한 역할 지원
  - **Google** (Feb 16, 2026): Gemini Workspace 사용량 리포트 전체 롤아웃. 관리자가 조직 내 Gemini 사용 현황 추적
  - 2개 이상 대형 경쟁사가 동시에 AI 에이전트 사용량 모니터링 대시보드 출시 → 엔터프라이즈 필수 기능으로 자리잡는 추세
- **개선 포인트**: 엔터프라이즈 KonaI-Agent 배포 시 관리자 대시보드에 에이전트 사용량/채택률 메트릭스 포함 필요
- **출처**:
  - https://releasebot.io/updates/github
  - https://gemini.google/release-notes/

---

## 중복 필터링 상세 (이전 리포트와 겹침)

이전 리포트(2026-02-16-discovery-3.md)와 중복되어 제외된 항목:

| # | 항목 | 이전 리포트 매핑 | 비고 |
|---|------|----------------|------|
| 1 | Cursor 비동기 서브에이전트 | 이전 리포트 중복항목 #1 Background Agent Manager | Cursor 2.5에서 공식 GA — 이전에 보고됨 |
| 2 | ChatGPT Deep Research 풀스크린 뷰어 (Feb 11) | 이전 리포트 UPDATE-1 document_viewer | Feb 11 기능은 이미 보고. Feb 20 UI 리디자인은 추가 진전으로 UPDATE 재보고 |
| 3 | Cursor 플러그인 마켓플레이스 | 이전 리포트 중복항목 #7 Arena Mode 등 | 단일 제품 개발자 확장 기능. 직접적 UI 패턴 아님 |
| 4 | Vercel AI SDK 6 Agent 추상화 | 이전 리포트 중복항목 #5 | SDK 레벨. v6.0.97 callbacks는 추가 진전으로 UPDATE-3에 포함 |

---

## 우선순위 변경 제안 (PRIORITY_CHANGE)

| # | component_id | 현재 priority | 제안 priority | 근거 |
|---|-------------|--------------|--------------|------|
| 1 | usage_monitoring | medium | high | GitHub, Google 모두 조직 레벨 AI 사용량 대시보드 출시. 엔터프라이즈 필수 기능으로 급부상 |

> 이전 리포트의 5건 제안도 아직 적용 대기 중.

---

## 리서치 노후 (STALE)

> 현재 노후 항목 없음. `last_researched` 30일 경과 컴포넌트 없음 (최근: 2026-02-18).

---

## 폐기 후보 (DEPRECATED)

> 현재 폐기 후보 없음.

---

## 권장 다음 액션

우선순위순으로 정렬:

| # | 액션 | 대상 | 이유 | priority |
|---|------|------|------|----------|
| 1 | `/research document_viewer` | UPDATE-1 | Deep Research UI 리디자인 확정 (사이드바 진입점 + 인터랙티브 인덱스·인용 패널 + 풀스크린 토글). 기존 브리프 갱신 필요 | **high** |
| 2 | `/research approval_rejection` | UPDATE-3 + NEW-2 | MCP elicitation, CrewAI async HITL, LangGraph sequential interrupt, Claude Code 다단계 검증, 라이브 플랜 프리뷰 패턴. HITL 브리프 대폭 갱신 필요 | **high** |
| 3 | `/research chat_input` | UPDATE-2 | Telerik AI-ready Chat 컴포넌트의 입력 모드 전환 + prefix/suffix + 빌트인 액션 패턴. 멀티모달 입력 브리프 갱신 | **medium** |
| 4 | `/research model_agent_switcher` | UPDATE-4 | GitHub Copilot 에이전트 모델 피커 + Auto 모드 참조. 컴포넌트 초기 리서치 | **medium** |

카탈로그 직접 수정 제안:

| # | component_id | 필드 | 현재 | 제안 |
|---|-------------|------|------|------|
| 1 | document_viewer | status | implemented | needs_update |
| 2 | usage_monitoring | priority | medium | high |

> 이전 리포트의 카탈로그 수정 제안 5건도 아직 미적용 상태. 함께 검토 필요.
