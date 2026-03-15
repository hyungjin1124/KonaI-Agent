# Discovery Report — 2026-03-16

## 스캔 설정
- **모드**: broad
- **시간 범위**: 2026-03-13 ~ 2026-03-16 (3일간)
- **이전 리포트**: 2026-03-13-discovery.md (broad)

## 확인한 소스

| # | 소스 | URL | 상태 |
|---|------|-----|------|
| 1 | ChatGPT changelog | help.openai.com (403) → releasebot.io | 변경 없음 (최근: Mar 11 GPT-5.1 retirement) |
| 2 | Claude blog | claude.com/blog (403) → releasebot.io | 변경 없음 (최근: Mar 12 Interactive Visualizations) |
| 3 | Cursor changelog | cursor.com/changelog | 변경 없음 (최근: Mar 11) |
| 4 | Gemini release notes | gemini.google/release-notes | 변경 없음 (최근: Feb 19) |
| 5 | Windsurf changelog | windsurf.com/changelog | 변경 없음 (최근: Mar 12 v1.9577.27) |
| 6 | Bolt.new | support.bolt.new/release-notes | 변경 없음 (최근: Mar 6) |
| 7 | v0 by Vercel | v0.dev/changelog | 변경 없음 (최근: Mar 12) |
| 8 | GitHub Copilot | releasebot.io/updates/github | 확인 완료 — **Mar 13: Skip approval for coding agent, Auto model selection GA, Structured issue fields** |
| 9 | Salesforce Agentforce | salesforce.com/blog | 변경 없음 (최근: Mar 11) |
| 10 | MS Copilot Studio | learn.microsoft.com/copilot-studio | 변경 없음 (Work IQ 이전 리포트 기록) |
| 11 | Google Agentspace | cloud.google.com/agentspace/docs/release-notes | 변경 없음 (최근: Mar 12) |
| 12 | ThoughtSpot | thoughtspot.com/blog | 접근 실패 (JS 렌더링) |
| 13 | Power BI | learn.microsoft.com/power-bi | 변경 없음 (Feb 2026 update가 최신) |
| 14 | Hex AI | hex.tech/blog | 변경 없음 (최근: ~Mar 12) |
| 15 | AG-UI | github.com/ag-ui-protocol/ag-ui/releases | 변경 없음 |
| 16 | MCP | github.com/modelcontextprotocol | 변경 없음. spec.modelcontextprotocol.io 인증서 오류로 접근 실패 |
| 17 | CopilotKit | github.com/CopilotKit/CopilotKit/releases | 변경 없음 |
| 18 | LangGraph | github.com/langchain-ai/langgraph/releases | 확인 완료 — langgraph-cli 0.4.17 (Mar 13, deep agent templates). UI 패턴 무관 |
| 19 | CrewAI | github.com/crewAIInc/crewAI/releases | 확인 완료 — 1.10.2rc1/rc2 (Mar 13-14, thread-safety fixes). 버그 수정 |
| 20 | Vercel AI SDK | github.com/vercel/ai/releases | 확인 완료 — 28건 릴리즈 (Mar 13). 프로바이더 v4 마이그레이션 + xAI reasoning summary beta |
| 21 | Open WebUI | github.com/open-webui/open-webui/releases | 변경 없음 |
| 22 | LobeChat | github.com/lobehub/lobe-chat/releases | 확인 완료 — **v2.1.41 (Mar 13): Vite SPA 마이그레이션, agent skills/benchmark, bot platform 통합** |
| 23 | Chainlit | github.com/Chainlit/chainlit/releases | 변경 없음 |
| 24 | NNGroup | nngroup.com/articles | 확인 완료 — Mar 13: 디자인 프로세스 + 리서치 도구 방법론 기사 2건. UI 패턴 무관 |

## 보충 검색 쿼리

| # | 쿼리 | 결과 수 |
|---|------|--------|
| 1 | "AI agent UI" OR "agentic interface" new feature "March 2026" | 2건 (AG-UI+A2UI 통합 — Mar 12, 이전 범위) |
| 2 | "human-in-the-loop" OR "AI approval" UI pattern "March 2026" | 1건 (MS Agent Framework tool approval — Mar 11, 이전 범위) |
| 3 | "conversational AI" OR "chat UI" framework release "March 2026" | 0건 (범위 내 해당 없음) |
| 4 | "enterprise AI dashboard" OR "AI copilot admin" "March 2026" | 3건 (MS Agent Dashboard/365 Control Plane — 이전 리포트 기록) |
| 5 | "AI data visualization" OR "natural language query" dashboard "March 2026" | 1건 (Databricks Genie Code — 이전 리포트 기록) |

---

## 요약

- 신규 패턴 발견: 0건
- 개선 필요: **3건**
- 우선순위 변경 제안: 0건
- 리서치 노후: 0건
- 폐기 후보: 0건
- **중복 필터링으로 제외**: 3건

> 3일간 스캔. GitHub Copilot이 Mar 13에 다수 업데이트 — 코딩 에이전트 Actions 워크플로우 승인 건너뛰기(관리자 설정), JetBrains IDE에서 자동 모델 선택 GA, 구조화된 이슈 필드 프리뷰. LobeChat v2.1.41이 Next.js에서 Vite SPA로 대규모 마이그레이션하며 에이전트 스킬/벤치마크 시스템 도입. 경쟁사 제품(ChatGPT, Claude, Cursor, Gemini 등)은 3일간 주요 변경 없음.

---

## 중복 필터링 상세

| # | 항목 | 이전 리포트 매핑 | 처리 |
|---|------|----------------|------|
| 1 | MS Copilot Studio Work IQ (Preview) | 2026-03-13 UPDATE-3 (prompt_management) | 제외 |
| 2 | MS Agent Dashboard / 365 Control Plane | 2026-03-11 admin — agent_registry NEW-1 | 제외 |
| 3 | Databricks Genie Code NLQ 대시보드 | 2026-03-12 broad — nl_to_chart UPDATE-2 | 제외 |

### 보고 기준 미달 제외

| # | 항목 | 사유 |
|---|------|------|
| 1 | LangGraph CLI 0.4.17 deep agent templates | 내부 CLI 도구. UI 패턴 무관 |
| 2 | CrewAI 1.10.2rc1/rc2 thread-safety fixes | 버그 수정. UI 패턴 무관 |
| 3 | Vercel AI SDK 28건 릴리즈 (프로바이더 v4 마이그레이션) | SDK 내부 프로바이더 설정 변경. UI 패턴 영향 없음 |
| 4 | Vercel AI SDK xAI reasoning summary (beta) | 1개 SDK의 베타 기능. thinking_block 컴포넌트 관련이나 아직 실험적 |
| 5 | NNGroup 기사 2건 (디자인 프로세스/리서치 방법론) | 일반 방법론. 구체적 UI 패턴 아님 |
| 6 | LobeChat Vite SPA 마이그레이션 | 아키텍처 변경. UI 패턴 아님 |
| 7 | GitHub Copilot 학생 플랜 변경 / REST API 버전 / OIDC | 인프라/정책 변경. UI 패턴 무관 |

---

## 개선 필요 (UPDATE)

| # | component_id | 현재 상태 | 발견 내용 | 출처 |
|---|-------------|----------|----------|------|
| 1 | approval_rejection | implemented | GitHub Copilot 코딩 에이전트 워크플로우 승인 건너뛰기 — 관리자가 repo 설정으로 HITL 승인 바이패스 가능 | releasebot.io/updates/github (Mar 13) |
| 2 | model_agent_switcher | implemented | GitHub Copilot 자동 모델 선택 GA — JetBrains IDE에서 동적 모델 라우팅 정식 출시 | releasebot.io/updates/github (Mar 13) |
| 3 | agent_marketplace | implemented | LobeChat v2.1.41 에이전트 스킬/벤치마크 시스템 — 에이전트에 스킬 부여 + 성능 벤치마크 | github.com/lobehub/lobe-chat (Mar 13) |

### 상세

#### UPDATE-1: approval_rejection
- **현재 구현**: HITL 기반 승인/거절/수정 인터페이스. PPT 시나리오 슬라이드 아웃라인 승인 등에서 사용. QA PASS
- **경쟁사 변화**:
  - **GitHub Copilot** (2026-03-13): 새로운 repo 설정으로 Copilot 코딩 에이전트 Actions 워크플로우에 대한 인간 승인을 건너뛸 수 있음. 관리자가 특정 repo에서 에이전트 자율 실행을 허용하는 **"trust level" 기반 승인 바이패스** 패턴
  - **패턴 의미**: HITL 승인이 "항상 필요" → "관리자가 상황별로 ON/OFF" 하는 **구성 가능한 승인 게이트**로 진화. 이전 리포트의 `variable_autonomy_control` 패턴과 연결됨
  - **MS Agent Framework** (Mar 11, 이전 기간): `needsApproval: true` 기반 도구별 승인 게이트 + confidence 기반 라우팅도 같은 방향
- **개선 포인트**:
  1. **관리자 설정 기반 승인 레벨**: 에이전트/시나리오별로 승인 필요 여부를 관리자가 설정 가능한 UI
  2. **신뢰도 기반 자동 승인**: 반복적이고 안전한 작업은 자동 승인, 위험도 높은 작업만 HITL 게이트
- **confidence**: medium (GitHub Copilot 정식 기능 + MS Agent Framework 동일 방향)

#### UPDATE-2: model_agent_switcher
- **현재 구현**: 대화 중 모델/에이전트 전환 드롭다운. QA PASS
- **경쟁사 변화**:
  - **GitHub Copilot** (2026-03-13): JetBrains IDE에서 **자동 모델 선택(auto model selection)** GA. 사용자가 모델을 수동 선택하지 않아도 작업 유형에 따라 동적으로 최적 모델을 라우팅. 모든 Copilot 플랜에서 사용 가능. 프리미엄 요청 10% 할인 인센티브 제공
  - **패턴 의미**: 수동 모델 전환 → **자동 모델 라우팅**으로의 진화. 사용자가 모델 차이를 이해할 필요 없이 시스템이 최적 모델 선택
- **개선 포인트**:
  1. **자동 모델 추천/라우팅**: 수동 드롭다운 외에 "자동" 옵션 추가 — 작업 유형에 따라 시스템이 모델 선택
  2. **모델 선택 근거 표시**: 자동 선택 시 왜 해당 모델이 선택되었는지 간략한 tooltip/indicator
- **confidence**: medium (1개 주요 제품 GA. ChatGPT도 유사한 모델 라우팅 보유)

#### UPDATE-3: agent_marketplace
- **현재 구현**: 에이전트/스킬/플러그인 마켓플레이스. 최근 구현 완료 (last_researched: 2026-03-12)
- **경쟁사 변화**:
  - **LobeChat v2.1.41** (2026-03-13): ~400 커밋 대규모 릴리즈. **에이전트 스킬(Agent Skills)** 시스템 도입 — 에이전트에 개별 스킬을 부여하고 조합하는 모듈형 구조. **벤치마크** 기능으로 에이전트 성능 비교 가능. 봇 플랫폼 통합(QQ/Telegram/Lark/Discord)으로 멀티채널 배포
  - **Cursor** (Mar 11, 이전 리포트): 30+ 플러그인 생태계
  - **패턴 수렴**: 에이전트 마켓플레이스에 "스킬 단위 조합" + "성능 벤치마크" + "멀티채널 배포"가 추가 차원으로 등장
- **개선 포인트**:
  1. **스킬 기반 에이전트 구성**: 마켓플레이스에서 개별 스킬을 선택하여 에이전트를 조합하는 UX
  2. **에이전트 벤치마크/비교**: 에이전트 성능 지표 비교 화면
- **confidence**: low (1개 OSS 프로젝트. 단, 기존 카탈로그 컴포넌트의 하위 기능으로 편입 가능)

---

## 우선순위 변경 제안 (PRIORITY_CHANGE)

해당 없음.

---

## 리서치 노후 (STALE)

해당 없음. 3일 스캔으로 30일 경과 + 변화 감지 조건을 충족하는 항목 없음.

> 참고: ppt_slide_preview (last_researched: 2026-02-16, **28일**), artifact_panel (2026-02-18, 26일), approval_rejection (2026-02-21, 23일), document_viewer (2026-02-21, 23일)이 30일에 접근 중. approval_rejection은 이번 리포트에서 UPDATE로 보고되어 리서치 갱신 권장.

---

## 폐기 후보 (DEPRECATED)

해당 없음.

---

## 권장 다음 액션

우선순위순 정렬:

| # | 액션 | 대상 | 이유 | priority |
|---|------|------|------|----------|
| 1 | `/implement prompt_management` | (이전 리포트) | 리서치 완료(Mar 13). 4회 연속 권장. 구현 착수 가능 | high |
| 2 | `/research generative_ui` Phase 2 | (이전 리포트) | ChatGPT+Claude 인터랙티브 시각화 표준화. 2회 연속 권장 | high |
| 3 | `/research approval_rejection` | UPDATE-1 | GitHub Copilot 승인 바이패스 + MS Agent Framework tool approval. 구성 가능한 승인 게이트 패턴 리서치. last_researched 23일 경과(30일 임박) | medium |
| 4 | `/research agent_marketplace` | UPDATE-3 | LobeChat 스킬/벤치마크 + Cursor 30+ 플러그인. 4회 연속 권장 | medium |
| 5 | `/research usage_monitoring` Phase 2 | (이전 리포트) | MS Agent Dashboard GA 반영. **8회 연속 권장** | medium |

카탈로그 직접 수정 제안:

| # | component_id | 필드 | 현재 | 제안 |
|---|-------------|------|------|------|
| 1 | approval_rejection | notes | (기존) | 추가: "GitHub Copilot (Mar 13): repo 설정으로 코딩 에이전트 워크플로우 승인 바이패스 가능. trust-level 기반 구성 가능한 승인 게이트 패턴." |
| 2 | model_agent_switcher | notes | (기존) | 추가: "GitHub Copilot (Mar 13): JetBrains에서 자동 모델 선택 GA. 작업 유형별 동적 모델 라우팅. 수동→자동 전환 트렌드." |

---

## 누적 액션 추적

### 이전 리포트 권장 액션 실행 여부

| 리포트 | 액션 | 상태 | 비고 |
|--------|------|------|------|
| 2026-03-13 | /research generative_ui Phase 2 | 미실행 | last_researched: 2026-03-13 (리포트 이전 갱신) |
| 2026-03-13 | /implement prompt_management | 미실행 | status: not_implemented, 변동 없음 |
| 2026-03-13 | /research nl_to_chart Phase 3 | 미실행 | last_researched: 2026-03-12, 변동 없음 |
| 2026-03-13 | /research agent_marketplace | 미실행 | last_researched: 2026-03-12, 변동 없음. **4회 연속 미실행** |
| 2026-03-13 | /research usage_monitoring Phase 2 | 미실행 | last_researched: 2026-03-01, 변동 없음. **8회 연속 미실행** |

### 누적 미실행 (3회 이상 연속 권장)

| 액션 | 연속 횟수 | 현재 상태 | 비고 |
|------|----------|----------|------|
| /research usage_monitoring Phase 2 | **8회** | Phase 1 QA PASS | MS Agent Dashboard GA 반영하여 Phase 2 설계 시급 |
| /research agent_marketplace | **4회** | implemented | LobeChat 스킬/벤치마크 + Cursor 30+ 플러그인 리서치 미착수 |
| /implement prompt_management | **4회** | not_implemented (리서치 완료) | 리서치 브리프 완료 상태. 구현만 남음 |
| /research generative_ui Phase 2 | 2회 | implemented (Phase 1 QA PASS) | ChatGPT+Claude 인터랙티브 시각화 반영 필요 |
