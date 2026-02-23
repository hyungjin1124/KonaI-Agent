# Discovery Report — 2026-02-22

## 스캔 설정
- **모드**: broad
- **시간 범위**: 2026-02-21 ~ 2026-02-22 (1일간)
- **이전 리포트**: 2026-02-21-discovery.md

## 확인한 소스

| # | 소스 | URL | 상태 |
|---|------|-----|------|
| 1 | ChatGPT changelog | help.openai.com/en/articles/6825453-chatgpt-release-notes | 접근 실패 (403) |
| 2 | Claude blog | claude.com/blog | 확인 완료 — 변경 없음 (최근: Jan 12) |
| 3 | Claude releases | releasebot.io/updates/anthropic/claude | 확인 완료 — 변경 없음 (최근: Feb 17) |
| 4 | Cursor changelog | releasebot.io/updates/cursor | 확인 완료 — 변경 없음 (최근: Feb 20) |
| 5 | Cursor changelog (official) | cursor.com/changelog | 확인 완료 — 변경 없음 (최근: Feb 18) |
| 6 | Gemini release notes | gemini.google/release-notes | 확인 완료 — 변경 없음 (최근: Feb 19) |
| 7 | Google AI blog | blog.google/technology/ai | 확인 완료 — 콘텐츠 파싱 불가 (JS 렌더링) |
| 8 | Windsurf changelog | windsurf.com/changelog | 확인 완료 — v1.9552.25 버그 수정 (Feb 21) |
| 9 | v0 changelog | v0.app/changelog | 확인 완료 — 변경 없음 (최근: Feb 16) |
| 10 | Bolt.new | support.bolt.new/release-notes | 확인 완료 — 변경 없음 (최근: Feb 6) |
| 11 | GitHub Copilot | github.com/features/copilot/whats-new | 확인 완료 — 변경 없음 (최근: Feb 18) |
| 12 | GitHub Copilot releases | releasebot.io/updates/github | 확인 완료 — **Copilot CLI 0.0.414 (Feb 21)**: MCP 도구 통합 + 권한 상승 다이얼로그 |
| 13 | AG-UI | github.com/ag-ui-protocol/ag-ui/releases | 확인 완료 — 릴리즈 없음 |
| 14 | MCP TypeScript SDK | github.com/modelcontextprotocol/typescript-sdk/releases | 확인 완료 — 변경 없음 (최근: v1.27.0, Feb 16) |
| 15 | CopilotKit | github.com/CopilotKit/CopilotKit/releases | 확인 완료 — 변경 없음 (최근: v1.51.4, Feb 17) |
| 16 | LangGraph | github.com/langchain-ai/langgraph/releases | 확인 완료 — 변경 없음 (최근: v1.0.9, Feb 19) |
| 17 | CrewAI | github.com/crewAIInc/crewAI/releases | 확인 완료 — 변경 없음 (최근: v1.10.0a1, Feb 19) |
| 18 | Vercel AI SDK | github.com/vercel/ai/releases | 확인 완료 — 변경 없음 (최근: v6.0.97, Feb 20) |
| 19 | Open WebUI | github.com/open-webui/open-webui/releases | 확인 완료 — 변경 없음 (최근: v0.8.3, Feb 17) |
| 20 | LobeChat | github.com/lobehub/lobe-chat/releases | 확인 완료 — **v2.1.33 릴리즈 (Feb 21)** |
| 21 | Chainlit | github.com/Chainlit/chainlit/releases | 확인 완료 — 변경 없음 (최근: v2.9.6, Jan 2025) |
| 22 | Salesforce blog | salesforce.com/blog | 확인 완료 — 변경 없음 (최근: Feb 20) |
| 23 | MS Copilot Studio | techcommunity.microsoft.com/tag/copilot-studio | 접근 실패 (태그 페이지 없음) |
| 24 | Google Agentspace blog | cloud.google.com/blog/products/ai | 확인 완료 — 콘텐츠 파싱 불가 (JS 렌더링) |
| 25 | Google Agentspace release notes | cloud.google.com/agentspace/docs/release-notes | 확인 완료 — 변경 없음 (최근: Feb 19) |
| 26 | ThoughtSpot blog | thoughtspot.com/blog | 확인 완료 — 변경 없음 |
| 27 | Power BI blog | powerbi.microsoft.com/blog | 확인 완료 — 변경 없음 (최근: Feb 10) |
| 28 | Hex blog | hex.tech/blog | 확인 완료 — 변경 없음 (최근: Feb 18) |
| 29 | NNGroup | nngroup.com/articles | 확인 완료 — 변경 없음 (최근: Feb 20) |

## 보충 검색 쿼리

| # | 쿼리 | 결과 수 |
|---|------|--------|
| 1 | "AI agent UI" OR "agentic interface" new feature February 2026 | 10건 |
| 2 | "human-in-the-loop" OR "AI approval" UI pattern February 2026 | 10건 |
| 3 | "AI data visualization" OR "natural language query" dashboard February 2026 | 10건 |
| 4 | "enterprise AI dashboard" OR "AI copilot admin" February 2026 | 10건 |
| 5 | OpenAI AgentKit launch February 2026 | 10건 |

---

## 요약

- 신규 패턴 발견: **0**건
- 개선 필요: **3**건
- 우선순위 변경 제안: **0**건
- 리서치 노후: **0**건
- 폐기 후보: **0**건
- **중복 필터링으로 제외**: **3**건

> 1일간 스캔으로 발견 범위가 좁음. 주말(토-일)에 해당하여 대부분의 소스에서 변경 없음.

---

## 개선 필요 (UPDATE)

| # | component_id | 현재 상태 | 발견 내용 | 출처 |
|---|-------------|----------|----------|------|
| 1 | nl_to_chart, dashboard_builder | not_implemented | Databricks AI/BI: 에이전틱 대시보드 오쏘링 Beta — NL로 데이터셋 검색, 시각화 생성, 필터 설정, 다중 페이지 레이아웃을 단일 프롬프트로 E2E 생성 | Databricks Blog (Feb 2026) |
| 2 | memory_management | not_implemented | LobeChat v2.1.33: 에이전트 메모리 확장 (effort/tool configuration), 에이전트 벤치마크 지원, 비디오 생성 | LobeChat GitHub (Feb 21) |
| 3 | tool_call_display, approval_rejection | not_implemented / implemented | GitHub Copilot CLI 0.0.414: Explore 에이전트에서 MCP 도구 사용 + autopilot 계획 수락 시 권한 상승 다이얼로그 | Releasebot/GitHub (Feb 21) |

### 상세

#### UPDATE-1: nl_to_chart + dashboard_builder
- **현재 구현**: 둘 다 not_implemented. `nl_to_chart`: priority high, `dashboard_builder`: priority medium
- **경쟁사 변화**:
  - **Databricks AI/BI 2026년 2월 업데이트**:
    - **에이전틱 대시보드 오쏘링 (Beta)**: 자연어 단일 프롬프트로 관련 테이블 검색 → 데이터셋 생성 → 시각화 생성 → 필터 설정 → 다중 페이지 레이아웃 구성을 E2E 자동 수행
    - **대시보드 어시스턴트**: 멀티스텝 대시보드 워크플로우를 NL 프롬프트로 자동화 (데이터셋, 시각화, 레이아웃, 필터)
    - **12열 그리드 레이아웃**: 기존 6열에서 12열로 확장하여 위젯 배치 유연성 향상
    - **Heatmap + Sankey 시각화**: Genie에서 새 차트 유형 자동 생성 지원
    - **Databricks One**: 비즈니스 사용자 전용 단순화된 UI — 대시보드 조회 + NL 질의 + AI 앱을 단일 진입점으로 통합
    - **Genie Research (Beta)**: 심층 탐색적 분석 — 계획 수립 → 다중 SQL 실행 → 반복 추론
  - 이 패턴은 NL-to-Chart + Dashboard Builder의 통합 에이전틱 접근 방식으로, KonaI-Agent의 라이브보드에 자연어 기반 위젯/대시보드 자동 생성 기능을 추가하는 데 직접 참조 가능
- **개선 포인트**: `nl_to_chart` 리서치 시 Databricks의 에이전틱 파이프라인 (NL → 테이블 선택 → SQL → 시각화) 및 Genie Research의 multi-step 분석 패턴 반영 필요. `dashboard_builder` 리서치 시 12열 그리드 레이아웃 + NL 기반 레이아웃 자동 구성 반영 필요
- **출처**:
  - https://www.databricks.com/blog/whats-new-aibi-february-2026-roundup
  - https://docs.databricks.com/aws/en/ai-bi/release-notes/2026

#### UPDATE-2: memory_management
- **현재 구현**: not_implemented. priority: low
- **경쟁사 변화**:
  - **LobeChat v2.1.33** (Feb 21, 2026):
    - **에이전트 메모리 확장**: effort/tool configuration으로 메모리 기능 세분화. 에이전트가 어떤 도구와 수준으로 기억을 관리할지 설정 가능
    - **에이전트 벤치마크 지원**: 에이전트 성능을 측정/비교하는 벤치마크 프레임워크 추가
    - **데스크톱 에디터 이미지 업로드**: 데스크톱 앱에서 직접 이미지 업로드 지원
    - **82 커밋, 854 파일 변경**: 대규모 릴리즈
    - 보안 수정: path traversal 취약점 해결
  - 오픈소스 AI UI 프로젝트에서 에이전트 메모리 관리가 정식 기능으로 추가된 것은 해당 패턴의 성숙도가 높아지고 있음을 시사
- **개선 포인트**: `memory_management` 컴포넌트 리서치 시 LobeChat의 effort/tool 기반 메모리 설정 UI 참조. 단, 현재 priority: low이므로 즉시 리서치보다는 동향 추적 수준
- **출처**:
  - https://github.com/lobehub/lobe-chat/releases/tag/v2.1.33

#### UPDATE-3: tool_call_display + approval_rejection
- **현재 구현**: `tool_call_display`: not_implemented (priority: critical). `approval_rejection`: implemented (last_researched: 2026-02-21)
- **경쟁사 변화**:
  - **GitHub Copilot CLI 0.0.414** (Feb 21, 2026):
    - **Explore 에이전트 MCP 도구 통합**: CLI의 Explore 에이전트가 이용 가능한 MCP 도구를 자동 감지하여 사용. 에이전트가 MCP 서버의 도구를 호출하는 흐름이 CLI 레벨에서 공식 지원
    - **권한 상승 다이얼로그 (Permission Elevation)**: autopilot 모드에서 계획을 수락할 때 도구 에러 방지를 위한 권한 상승 확인 다이얼로그 추가. HITL의 한 형태로, "승인 없이 자동 실행 → 위험한 동작 전 권한 확인" 패턴
  - 이전 리포트(Feb 21)에서 보고한 `approval_rejection` UPDATE-3 (MCP elicitation, Claude Code 다단계 검증)과 같은 맥락. GitHub Copilot도 동일한 "에이전트 자율 실행 + 위험 시 인간 게이팅" 패턴을 채택
- **개선 포인트**: `tool_call_display` 리서치 시 MCP 도구 자동 감지 + 호출 시각화 패턴 참조. `approval_rejection`의 기존 리서치에 permission elevation 패턴 추가 메모
- **출처**:
  - https://releasebot.io/updates/github

---

## 중복 필터링 상세 (이전 리포트와 겹침)

| # | 항목 | 이전 리포트 매핑 | 비고 |
|---|------|----------------|------|
| 1 | Windsurf v1.9552.25 버그 수정 (Feb 21) | — | 단순 버그 수정 (GitHub PR 확장 호환성). 최소 보고 기준 미달 |
| 2 | LobeChat 모델 추가 (Sonnet 4.6, Gemini 3.1 Pro) | 이전 리포트 소스 #4, #9 | 모델 출시 자체는 이전 리포트에서 이미 보고 |
| 3 | Microsoft 365 Copilot Dashboard 라이선스 완화 | 이전 리포트 UPDATE-5 usage_monitoring | 이전 리포트의 GitHub/Google 사용량 대시보드 트렌드와 같은 맥락. 추가 진전이나 이전 보고 UPDATE 범위 내 |

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
| 1 | `/research chat_input` | 이전 리포트 UPDATE-2 (미실행) | Telerik AI-ready Chat 컴포넌트 입력 모드 전환 + prefix/suffix 패턴. 이전 리포트에서 권장했으나 미실행 | **medium** |
| 2 | `/research model_agent_switcher` | 이전 리포트 UPDATE-4 (미실행) | GitHub Copilot 에이전트 모델 피커 + Auto 모드. 이전 리포트에서 권장했으나 미실행 | **medium** |
| 3 | `/research nl_to_chart` | UPDATE-1 | Databricks 에이전틱 대시보드 오쏘링의 NL → 시각화 파이프라인 패턴 참조 | **medium** |

카탈로그 직접 수정 제안:

| # | component_id | 필드 | 현재 | 제안 |
|---|-------------|------|------|------|
| 1 | document_viewer | status | implemented | needs_update |
| 2 | usage_monitoring | priority | medium | high |

> 위 2건은 이전 리포트(2026-02-21)에서도 동일 제안. 아직 미적용 상태.

---

## 누적 액션 추적

### 이전 리포트 (2026-02-21) 권장 액션 실행 여부:

| 리포트 | 액션 | 상태 | 비고 |
|--------|------|------|------|
| 2026-02-21 | `/research document_viewer` | **실행 완료** | last_researched: 2026-02-21 |
| 2026-02-21 | `/research approval_rejection` | **실행 완료** | last_researched: 2026-02-21 |
| 2026-02-21 | `/research chat_input` | **미실행** | last_researched 없음 |
| 2026-02-21 | `/research model_agent_switcher` | **미실행** | last_researched 없음 |
| 2026-02-21 | catalog: document_viewer.status → needs_update | **미적용** | 현재: implemented |
| 2026-02-21 | catalog: usage_monitoring.priority → high | **미적용** | 현재: medium |
