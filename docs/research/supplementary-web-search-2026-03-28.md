# Discovery Pipeline 보충 웹 검색 결과 (2026-03-28)

> Researched: 2026-03-28
> Researcher: Claude Code (researcher agent)
> Status: Final

## Executive Summary

5건의 보충 웹 검색을 수행했다. 2026-03-27~28에 해당하는 신규 발견은 매우 제한적이다. 유일하게 확인된 March 27 발표는 OpenAI Codex 0.117.0 릴리즈(Plugin 워크플로우 체계 강화)이며, UI 패턴 관련성은 낮다. 다만 3월 중순~하순 범위에서 KonaI-Agent에 참고할 만한 주요 트렌드 3건을 확인했다: (1) HITL Protocol v0.8 오픈 표준 (3/26), (2) Microsoft AG-UI HITL 패턴 공식 문서화, (3) Databricks Genie Code의 에이전틱 대시보드 오서링.

---

## 검색 결과 요약 테이블

| # | 검색 쿼리 | 관련 결과 수 | 3/27-28 신규 발견 | KonaI-Agent UI 관련성 |
|---|-----------|:-----------:|:----------------:|:-------------------:|
| 1 | "AI agent UI" OR "agentic interface" new feature "March 2026" | 10건 | 없음 (기존: AG-UI + A2UI 3/12 통합) | 높음 — AG-UI/A2UI 프로토콜 |
| 2 | "human-in-the-loop" OR "AI approval" UI pattern "March 2026" | 10건 | 간접 — HITL Protocol v0.8 (3/26) | 매우 높음 — HITL 표준화 |
| 3 | "conversational AI" OR "chat UI" framework release "March 2026" | 10건 | 1건 — Codex 0.117.0 (3/27) | 낮음 — CLI 도구 |
| 4 | "enterprise AI dashboard" OR "AI copilot admin" "March 2026" | 10건 | 없음 (기존: MS Agent 365 발표) | 높음 — 에이전트 거버넌스 대시보드 |
| 5 | "AI data visualization" OR "natural language query" dashboard "March 2026" | 10건 | 없음 (기존: Databricks Genie Code) | 중간 — NLQ 대시보드 패턴 |

---

## March 27-28 특정 발견

### 확인된 발표: OpenAI Codex 0.117.0 (March 27, 2026)

- **내용**: Plugin이 first-class 워크플로우로 승격, Sub-agent 경로 기반 주소 체계 도입, App-server TUI가 기본 활성화
- **UI 관련성**: 낮음. CLI/터미널 기반 개발 도구의 내부 개선이며, 웹 기반 엔터프라이즈 대시보드 UI 패턴과 직접 관련 없음
- **출처**: [OpenAI Release Notes - Releasebot](https://releasebot.io/updates/openai)

### March 27-28 이외 발견 없음

나머지 4건의 검색에서 3/27-28 날짜로 특정된 새로운 릴리즈나 발표는 확인되지 않았다.

---

## 3월 중순~하순 주요 트렌드 (기존 스캔에서 누락된 항목)

### 1. HITL Protocol v0.8 — 오픈 표준 (March 26, 2026)

**제품**: HITL Protocol (오픈소스)
**GitHub**: [rotorstar/hitl-protocol](https://github.com/rotorstar/hitl-protocol)

에이전트 워크플로우에서 사람의 결정을 요청하는 방법을 표준화하는 오픈 프로토콜이다. OAuth가 인증을 표준화한 것처럼, HITL Protocol은 에이전트-사람 간 승인/선택/입력 흐름을 표준화한다.

**핵심 메커니즘**:
- 서비스가 HTTP 202 + HITL 오브젝트(리뷰 URL 포함) 반환
- 에이전트가 URL을 사용자에게 전달 (CLI, Slack, WhatsApp 등 채널 무관)
- 사용자는 브라우저에서 카드/폼/버튼으로 결정 — 채팅 텍스트 벽이 아닌 적절한 UI 제공
- 결과를 polling, SSE, callback으로 회수

**5가지 리뷰 타입**: Approval (편집 사이클 포함), Selection, Input, Confirmation, Escalation

**v0.8 신규 (3/26)**: Channel-Native Actions — 간단한 결정의 경우 URL 대신 메시징 네이티브 버튼을 직접 렌더링

**KonaI-Agent 관련성**: 매우 높음. 현재 `usePPTScenario` 훅의 `isHitl` 패턴과 직접 대응. 향후 스킬 실행 시 사용자 승인 플로우를 이 표준에 맞출 수 있음.

### 2. Microsoft AG-UI HITL 패턴 — 공식 구현 가이드

**제품**: Microsoft Agent Framework + AG-UI
**문서**: [Human-in-the-Loop with AG-UI](https://learn.microsoft.com/en-us/agent-framework/integrations/ag-ui/human-in-the-loop)

Microsoft가 AG-UI 프로토콜을 통한 HITL 구현 패턴을 공식 문서화했다 (Python + C#).

**핵심 패턴**:
- `approval_mode` 데코레이터: `always_require`, `never_require`, `conditional`
- 서버 → 클라이언트: `APPROVAL_REQUEST` 이벤트 (도구명, 인수, 메시지 포함)
- 클라이언트 → 서버: `APPROVAL_RESPONSE` (approvalId + approved boolean)
- Bidirectional Middleware 패턴으로 양방향 변환 처리

**KonaI-Agent 관련성**: 높음. LangGraph 기반 백엔드에서 AG-UI 프로토콜 채택 시 HITL 구현의 참조 아키텍처로 활용 가능.

### 3. Databricks Genie Code — 에이전틱 대시보드 오서링 (March 2026)

**제품**: Databricks Genie Code
**출처**: [Databricks Launches Genie Code](https://www.databricks.com/company/newsroom/press-releases/databricks-launches-genie-code-bringing-agentic-engineering-data)

Databricks Assistant가 Genie Code로 리브랜딩되면서 자율 에이전트 모드가 GA.

**대시보드 관련 기능**:
- 자연어 프롬프트로 데이터셋 + 시각화 + 레이아웃 + 필터를 멀티스텝으로 자동 생성
- 시계열 차트에서 우클릭 → "변화 설명 요청" → 에이전트가 변화 드라이버 자동 분석
- Dual y-axis 차트 정상 생성 지원

**KonaI-Agent 관련성**: 중간. 라이브보드 위젯의 자연어 기반 생성/수정 UX 설계 시 참고할 패턴.

### 4. Oracle + Google + CopilotKit 통합 (March 12, 2026)

**이미 알려진 항목이나 상세 보완**.

세 레이어의 역할 분담:
- **Oracle Open Agent Specification**: 프레임워크 무관한 에이전트 정의
- **AG-UI (CopilotKit)**: 에이전트-프론트엔드 간 실시간 양방향 스트림 (메시지, 도구 호출, 상태 업데이트)
- **A2UI (Google)**: 에이전트가 필요한 UI를 구조화된 JSONL로 기술 → CopilotKit이 자동 렌더링

**KonaI-Agent 관련성**: 높음. 에이전트가 UI 위젯을 동적으로 요청하는 패턴은 아티팩트 패널 확장에 직접 적용 가능.

### 5. Microsoft Agent 365 + Copilot Control System 업데이트

**이미 알려진 항목이나 대시보드 UI 관련 상세 보완**.

- **Agent Dashboard**: 조직 내 모든 에이전트(자체 빌드, MS 제공, 서드파티)의 채택·성과 메트릭 통합 뷰
- **Action Segments** (March 2026 GA 예정): 사용자 행동 기반 타겟 메시지 — "비활성 Copilot 사용자"에게 온보딩 가이드 자동 발송
- **Drilldown by indirect groups**: 간접 그룹별 Copilot 채택/영향도 탐색

**KonaI-Agent 관련성**: 높음. 멀티테넌트 관리자 대시보드의 에이전트 활동 모니터링, 사용자 세그먼트 기반 관리 패턴 참고.

---

## 제외된 항목

다음은 검색 결과에 포함되었으나 요청에 따라 제외한 항목이다:

- ChatGPT Library 기능 (기존 알려진 항목)
- Claude Agent Dispatch / Interactive Apps (기존 알려진 항목)
- LobeChat Agent Documents (기존 알려진 항목)
- GPT-5.4 릴리즈 (모델 업데이트, UI 패턴이 아님)
- 버그 수정, 성능 최적화만 해당하는 업데이트
- 마케팅/프로모션 콘텐츠

---

## 권장 후속 조치

1. **HITL Protocol v0.8 심층 리서치** — 현재 `isHitl` 패턴과의 매핑 분석, 프로토콜 채택 비용 평가 (우선도: 높음)
2. **AG-UI + A2UI 프로토콜 PoC** — LangGraph 백엔드와 Next.js 프론트엔드 간 AG-UI 연동 가능성 검증 (우선도: 중간)
3. **Microsoft Agent Dashboard UI 패턴 벤치마크** — 멀티테넌트 관리자 뷰 설계에 Agent 365 Dashboard 패턴 반영 (우선도: 중간)

---

## Sources

- [AG-UI Protocol GitHub](https://github.com/ag-ui-protocol/ag-ui) — AG-UI 프로토콜 공식 저장소
- [A2UI Official Site](https://a2ui.org/) — Google의 Agent-to-UI 표준
- [Oracle Agent Spec + A2UI + AG-UI 통합 발표](https://blogs.oracle.com/ai-and-datascience/announcing-agent-spec-for-a2ui-copilotkit-ag-ui) — 3사 통합 발표
- [HITL Protocol v0.8](https://github.com/rotorstar/hitl-protocol) — Human-in-the-Loop 오픈 프로토콜 (3/26 업데이트)
- [Microsoft AG-UI HITL 문서](https://learn.microsoft.com/en-us/agent-framework/integrations/ag-ui/human-in-the-loop) — 공식 HITL 구현 가이드
- [OpenAI Release Notes - Releasebot](https://releasebot.io/updates/openai) — Codex 0.117.0 (3/27)
- [Databricks Genie Code 발표](https://www.databricks.com/company/newsroom/press-releases/databricks-launches-genie-code-bringing-agentic-engineering-data) — 에이전틱 대시보드 오서링
- [Databricks AI/BI Release Notes 2026](https://docs.databricks.com/aws/en/ai-bi/release-notes/2026) — 대시보드 기능 상세
- [Microsoft Agent 365 보안 업데이트](https://openclawai.io/blog/microsoft-agent-365-rsac-2026-security-copilot/) — 에이전트 거버넌스
- [Microsoft 365 Copilot Blog - March 2026](https://www.microsoft.com/en-us/microsoft-365/blog/2026/03/09/powering-frontier-transformation-with-copilot-and-agents/) — Copilot + Agent 전략
- [CopilotKit Generative UI 2026 가이드](https://www.copilotkit.ai/blog/the-developer-s-guide-to-generative-ui-in-2026) — Generative UI 패턴 개요
- [Permit.io HITL Best Practices](https://www.permit.io/blog/human-in-the-loop-for-ai-agents-best-practices-frameworks-use-cases-and-demo) — HITL 프레임워크 비교
