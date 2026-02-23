# Discovery Pipeline — 외부 동향 스캔

외부 동향을 스캔하여 카탈로그에 반영할 변경사항을 제안한다.
매일 실행을 전제로, 검색 소스와 쿼리는 고정하고 해석만 재량에 맡긴다.

**인자**: `$ARGUMENTS`

---

## 실행 모드 결정

`$ARGUMENTS`에 따라 스캔 범위를 결정한다:

- **비어있음** → broad 모드: 전체 소스 레지스트리를 순회한다.
- **카탈로그 카테고리 ID** → category 모드: 해당 카테고리의 매핑된 소스만 스캔한다.
- **경쟁사 이름** → competitor 모드: 해당 경쟁사 소스만 스캔한다.

카탈로그 카테고리 ID 목록:
`conversational_primitives`, `agent_action_patterns`, `hitl_patterns`,
`artifact_visualization`, `navigation_session`, `admin_operations`, `generative_emerging`

---

## 소스 레지스트리

아래 소스를 고정 대상으로 확인한다. 웹 검색으로 "알아서 찾기" 하지 않는다.
Primary URL 접근 실패 시 Fallback URL을 시도한다.

### 경쟁사 제품

| id | 제품 | Primary | Fallback |
|----|------|---------|----------|
| chatgpt | ChatGPT | help.openai.com/en/articles/6825453-chatgpt-release-notes | releasebot.io/updates/openai/chatgpt |
| claude | Claude | claude.com/blog | releasebot.io/updates/anthropic/claude |
| cursor | Cursor | cursor.com/changelog | releasebot.io/updates/cursor |
| gemini | Gemini | gemini.google/release-notes | blog.google/technology/ai |
| windsurf | Windsurf | windsurf.com/changelog | windsurf.com/blog |
| bolt | Bolt.new | support.bolt.new/release-notes | — |
| v0 | v0 by Vercel | v0.app/changelog | vercel.com/blog |
| copilot | GitHub Copilot | github.com/features/copilot/whats-new | releasebot.io/updates/github |

### 엔터프라이즈 AI 플랫폼

| id | 제품 | Primary | Fallback |
|----|------|---------|----------|
| agentforce | Salesforce Agentforce | salesforce.com/blog (agentforce 필터) | releasebot.io/updates/salesforce |
| copilot-studio | MS Copilot Studio | techcommunity.microsoft.com (copilot-studio 태그) | learn.microsoft.com/copilot-studio 릴리즈 |
| agentspace | Google Agentspace | cloud.google.com/blog/products/ai | cloud.google.com/agentspace/docs/release-notes |

### 데이터 / 분석 AI

| id | 제품 | Primary | Fallback |
|----|------|---------|----------|
| thoughtspot | ThoughtSpot Sage | thoughtspot.com/blog | — |
| powerbi | Power BI Copilot | powerbi.microsoft.com/blog | learn.microsoft.com/power-bi 릴리즈 |
| hex | Hex AI | hex.tech/blog | — |

### 프레임워크 / 프로토콜

| id | 이름 | 소스 |
|----|------|------|
| ag-ui | AG-UI | github.com/ag-ui-protocol/ag-ui/releases |
| mcp | MCP | github.com/modelcontextprotocol releases, spec.modelcontextprotocol.io |
| copilotkit | CopilotKit | github.com/CopilotKit/CopilotKit/releases |
| langgraph | LangGraph | github.com/langchain-ai/langgraph/releases, blog.langchain.dev |
| crewai | CrewAI | github.com/crewAIInc/crewAI/releases |
| vercel-ai | Vercel AI SDK | github.com/vercel/ai/releases |

### 오픈소스 AI UI

| id | 프로젝트 | 소스 |
|----|---------|------|
| open-webui | Open WebUI | github.com/open-webui/open-webui/releases |
| lobechat | LobeChat | github.com/lobehub/lobe-chat/releases |
| chainlit | Chainlit | github.com/Chainlit/chainlit/releases |

### UX 리서치

| id | 이름 | 소스 |
|----|------|------|
| nngroup | NNGroup AI | nngroup.com/articles (AI 태그) |

### 업계 동향 소스

| id | 이름 | 소스 | 쿼리 |
|----|------|------|------|
| hn | Hacker News | hn.algolia.com/api/v1/search | "AI agent UI" OR "agentic interface" |
| arxiv | arXiv | arxiv.org/search | cs.HC + cs.AI, "agent interface" OR "human-AI interaction" |

> **소스 관리 규칙**:
> - 새 경쟁사나 프레임워크 등장 시 이 레지스트리에 추가한다.
> - 소스 URL이 변경되면 이 파일을 직접 수정한다.
> - Primary URL 접근 실패 시 Fallback URL을 시도한다.
> - Fallback도 실패하면 리포트에 "접근 실패" 기록 후 다음 소스로 진행.
> - 3회 연속 접근 실패한 소스는 URL 재확인 필요 표시.
> - 새 소스 추가 시 반드시 카테고리-소스 매핑도 함께 갱신한다.

---

## 카테고리-소스 매핑

category 모드에서 해당 카테고리에 관련된 소스만 스캔한다.
broad 모드에서는 이 매핑을 무시하고 전체 레지스트리를 순회한다.

```yaml
conversational_primitives:
  - chatgpt, claude, gemini, lobechat, open-webui, nngroup

agent_action_patterns:
  - chatgpt, cursor, copilot, windsurf, agentforce, copilot-studio

hitl_patterns:
  - chatgpt, claude, cursor, agentforce, copilot-studio, chainlit
  - mcp, langgraph, crewai

artifact_visualization:
  - chatgpt, claude, v0, hex, thoughtspot, powerbi, open-webui

navigation_session:
  - chatgpt, claude, cursor, gemini, lobechat

admin_operations:
  - agentforce, copilot-studio, agentspace, copilot, powerbi

generative_emerging:
  - chatgpt, claude, gemini, bolt, v0, ag-ui, copilotkit, vercel-ai
```

---

## 쿼리 템플릿

모드별로 아래 템플릿을 사용한다. `{date_range}`는 Step 0에서 결정된 기간이다.

`{date_range}`의 검색 쿼리 적용 방식:
- **웹 검색**: `"{month} {year}"` 형태로 삽입 (예: "February 2026")
- **소스 직접 확인**: 날짜가 {시작일} ~ {종료일} 범위 내인 항목만 수집

### broad 모드

경쟁사 소스: 레지스트리의 모든 경쟁사에 대해 체인지로그/릴리즈 페이지를 직접 확인한다.
프레임워크 소스: 레지스트리의 모든 프레임워크에 대해 releases 페이지를 직접 확인한다.
보충 웹 검색 (최대 5회):
```
"AI agent UI" OR "agentic interface" new feature {date_range}
"human-in-the-loop" OR "AI approval" UI pattern {date_range}
"conversational AI" OR "chat UI" framework release {date_range}
"enterprise AI dashboard" OR "AI copilot admin" {date_range}
"AI data visualization" OR "natural language query" dashboard {date_range}
```

### category 모드

해당 카테고리의 매핑된 소스만 직접 확인한 뒤, 키워드 맵에서 쿼리를 생성한다:

```yaml
conversational_primitives:
  - "conversational AI UI" component {date_range}
  - "chat interface" streaming response pattern {date_range}
agent_action_patterns:
  - "AI agent" tool call UI {date_range}
  - "function calling" UI visualization {date_range}
hitl_patterns:
  - "human-in-the-loop" AI approval UI {date_range}
  - "AI confirmation" gate UX pattern {date_range}
artifact_visualization:
  - "AI artifact" canvas UI {date_range}
  - "code preview" AI-generated component {date_range}
navigation_session:
  - "AI session" management UI {date_range}
  - "conversation history" navigation pattern {date_range}
admin_operations:
  - "AI agent" admin dashboard governance {date_range}
  - "enterprise AI" usage monitoring metrics {date_range}
generative_emerging:
  - "generative UI" AI agent {date_range}
  - "dynamic interface" AI-generated {date_range}
```

### competitor 모드

해당 경쟁사의 레지스트리 소스를 직접 확인한 뒤, 보충 검색:
```
"{competitor_name}" new feature OR release OR update {date_range}
"{competitor_name}" UI change OR redesign {date_range}
```

---

## Step 0 — 사전 준비

### 0-1. 시간 범위 결정

`specs/discovery-reports/` 에서 가장 최근 리포트의 날짜를 확인한다.

- 최근 리포트가 있으면: `{date_range}` = "최근 리포트 날짜 ~ 오늘"
- 최근 리포트가 없으면: `{date_range}` = "최근 14일"

> 이전 리포트가 1일 전이면 1일치, 7일 전이면 7일치만 본다.
> 이렇게 하면 매일 실행해도 중복이 최소화된다.

### 0-2. 이전 리포트 로드

가장 최근 discovery report를 읽고, 기존에 보고된 항목 목록을 메모리에 유지한다.
이 목록은 Step 3에서 중복 필터링에 사용한다.

### 0-3. 미실행 액션 상태 확인

이전 리포트(들)의 권장 액션 중 실제 실행 여부를 확인한다:

- `/research {topic}` 액션: catalog에서 해당 component의 `last_researched`가
  리포트 날짜 이후로 갱신되었으면 **"실행 완료"**
- 카탈로그 수정 제안: catalog에서 해당 필드가 제안값과 일치하면 **"적용 완료"**
- 확인 결과를 리포트 하단 "누적 액션 추적" 섹션에 표시한다.

---

## Step 1 — 현재 상태 스냅샷

카탈로그와 vault의 현재 상태를 파악한다.

### 1-1. 카탈로그 로드

`specs/component-catalog.yaml`을 읽고 다음을 정리한다:

- 전체 컴포넌트 수 및 status별 분포
- `obsidian_sources`가 없는 컴포넌트 목록
- `last_researched`가 30일 이상 지난 컴포넌트 목록
- category 모드면 해당 카테고리만 필터링

### 1-2. Vault 상태 확인

Obsidian Vault에서 기존 리서치 자산을 확인한다.
Vault 경로: CLAUDE.md의 Obsidian Vault 경로 참조.

- `Insights/agent-ui/patterns/` 내 기존 리서치 브리프 목록
- `AI Agent Products/` 내 제품 프로필 목록과 각 파일의 수정 날짜
- `Insights/maintenance/` 내 최근 동향 문서 (있으면)

### 출력

이 단계의 결과는 컨텍스트에 유지한다. 별도 파일은 생성하지 않는다.

---

## Step 2 — 외부 스캔

소스 레지스트리와 쿼리 템플릿에 따라 스캔한다.

### 2-1. 소스 직접 확인

모드에 해당하는 소스 레지스트리 항목의 URL을 순회하며,
`{date_range}` 이내의 변경사항이 있는지 확인한다.

- 체인지로그/릴리즈 페이지: 날짜가 범위 내인 항목만 수집
- 블로그: 최신 포스트가 범위 내인지 확인
- Primary URL 실패 시 Fallback URL 시도

> 소스 URL 접근 실패 시 해당 소스를 건너뛰고, 리포트에 "접근 실패" 기록.

### 2-2. 보충 웹 검색

쿼리 템플릿의 검색어를 실행한다.
검색 시 반드시 `{date_range}` 기간 필터를 적용한다.

- broad 모드: 최대 5회 검색
- category 모드: 해당 카테고리 쿼리 2개 + 매핑된 소스 직접 확인
- competitor 모드: 보충 검색 2회 + 레지스트리 소스 확인

### 2-3. 수집 항목

각 발견 사항에 대해 다음을 기록한다:
- 출처 (URL)
- 발견 날짜
- 관련 키워드/패턴
- 현재 카탈로그와의 관련성 (기존 컴포넌트 매핑 또는 "신규")

---

## Step 3 — 갭 분석

수집된 정보를 현재 카탈로그와 대조하여 분류한다.

### 3-1. 중복 필터링

Step 0-2에서 로드한 이전 리포트의 항목과 대조한다.
**이미 보고된 항목은 제외한다.** 단, 이전 리포트 이후 추가 진전이 있으면 UPDATE로 재보고한다.

### 3-2. 최소 보고 기준

아래에 해당하지 않는 사소한 변경은 제외한다:

**보고 대상 (포함)**:
- 새 기능/패턴 도입 (UI에 영향을 주는 것)
- 기존 패턴의 근본적 접근 방식 변경
- 새 프레임워크/프로토콜의 정식 릴리즈 (beta 졸업)
- 업계 3개 이상 제품이 채택한 패턴

**보고 제외 (무시)**:
- 버그 수정, 성능 최적화 (UI 패턴과 무관)
- 단순 텍스트/아이콘 변경
- 1개 제품만의 실험적 기능 (아래 예외 참조)
- 백엔드/인프라 변경 (UI에 영향 없는 것)
- SDK/API 변경 (UI 패턴과 직접 관련 없는 것)

**예외 — 1개 제품이라도 보고하는 경우**:
- 카탈로그 기존 컴포넌트의 하위 기능으로 편입 가능 → **UPDATE**로 보고
- 엔터프라이즈 거버넌스/보안에 직결 → **confidence: low**로 표시하되 보고

### 3-3. Confidence 레벨

각 발견 항목에 confidence를 부여한다:

- **high**: 3개 이상 제품 채택 또는 프로토콜/표준 확립
- **medium**: 2개 제품 채택 또는 주요 1개 제품의 정식 릴리즈
- **low**: 1개 제품의 실험적/베타 기능 (예외 조건으로 보고된 경우)

### 3-4. 분류 기준

**NEW** — 카탈로그에 없는 새로운 패턴/컴포넌트
- 기존 컴포넌트 중 해당되는 것이 없음
- 보고 기준을 충족함

**UPDATE** — 기존 implemented 컴포넌트의 개선 필요
- 경쟁사가 더 나은 접근법을 도입
- 새로운 기술/라이브러리가 기존 구현을 대체할 수 있음

**PRIORITY_CHANGE** — 우선순위 조정 필요
- 업계 트렌드로 인해 특정 패턴의 중요도가 변경

**STALE** — 리서치 노후화
- `last_researched`가 30일 이상 경과
- 해당 분야에서 유의미한 변화가 감지됨
- 변화 감지 없이 30일 경과만으로는 STALE 처리하지 않음

**DEPRECATED** — 폐기 후보
- 업계에서 더 이상 사용하지 않는 패턴
- 다른 패턴으로 완전히 대체됨

---

## Step 4 — 리포트 생성

### 출력

`specs/discovery-reports/{YYYY-MM-DD}-discovery.md` 파일을 생성한다.

같은 날짜에 이미 리포트가 있으면 `-{N}` 접미사를 붙인다 (N은 2부터).
예: `2026-02-16-discovery.md`, `2026-02-16-discovery-2.md`, `2026-02-16-discovery-3.md`
※ 하이픈(`-`) 사용 통일. 언더스코어(`_`) 사용 금지.

```markdown
# Discovery Report — {YYYY-MM-DD}

## 스캔 설정
- **모드**: {broad | category:{id} | competitor:{name}}
- **시간 범위**: {시작일} ~ {종료일} ({N}일간)
- **이전 리포트**: {이전 리포트 파일명 또는 "없음"}

## 확인한 소스

| # | 소스 | URL | 상태 |
|---|------|-----|------|
| 1 | ChatGPT changelog | help.openai.com/... | 확인 완료 / 변경 없음 / 접근 실패 |
| ... | ... | ... | ... |

## 보충 검색 쿼리

| # | 쿼리 | 결과 수 |
|---|------|--------|
| 1 | "AI agent UI" new feature ... | {N}건 |
| ... | ... | ... |

---

## 요약

- 신규 패턴 발견: {N}건
- 개선 필요: {N}건
- 우선순위 변경 제안: {N}건
- 리서치 노후: {N}건
- 폐기 후보: {N}건
- **중복 필터링으로 제외**: {N}건

> 발견 사항이 0건이면 "스캔 범위 내 유의미한 변경 없음" 으로 요약하고,
> 아래 상세 섹션은 생략한다.

---

## 신규 패턴 (NEW)

| # | 패턴명 | 설명 | 발견 출처 | 관련 카테고리 | 권장 priority | 권장 complexity | confidence |
|---|--------|------|----------|-------------|--------------|----------------|------------|
| 1 | ... | ... | ... | ... | ... | ... | high/medium/low |

### 상세

#### NEW-1: {패턴명}
- **발견 출처**: {URL}
- **경쟁사 현황**: {어떤 경쟁사가 어떻게 구현했는지}
- **KonaI-Agent 관련성**: {왜 우리에게 필요한지}

---

## 개선 필요 (UPDATE)

| # | component_id | 현재 상태 | 발견 내용 | 출처 |
|---|-------------|----------|----------|------|

### 상세

#### UPDATE-1: {component_id}
- **현재 구현**: {현재 어떻게 구현되어 있는지}
- **경쟁사 변화**: {무엇이 바뀌었는지}
- **개선 포인트**: {구체적으로 뭘 바꿔야 하는지}

---

## 우선순위 변경 제안 (PRIORITY_CHANGE)

| # | component_id | 현재 priority | 제안 priority | 근거 |
|---|-------------|--------------|--------------|------|

---

## 리서치 노후 (STALE)

| # | component_id | last_researched | 경과 기간 | 감지된 변화 |
|---|-------------|----------------|----------|------------|

---

## 폐기 후보 (DEPRECATED)

| # | component_id | 근거 | 대체 패턴 |
|---|-------------|------|----------|

---

## 권장 다음 액션

우선순위순으로 정렬:

| # | 액션 | 대상 | 이유 | priority |
|---|------|------|------|----------|
| 1 | `/research {topic}` | NEW 또는 UPDATE | {이유} | high |
| 2 | ... | ... | ... | ... |

카탈로그 직접 수정 제안:
| # | component_id | 필드 | 현재 | 제안 |
|---|-------------|------|------|------|
| 1 | ... | priority | low | high |
| 2 | ... | status | implemented | deprecated |

---

## 누적 액션 추적

이전 리포트의 권장 액션 실행 여부:

| 리포트 | 액션 | 상태 | 비고 |
|--------|------|------|------|
| {이전 리포트 날짜} | /research {topic} | 실행 완료 / 미실행 | last_researched: {날짜} 또는 변동 없음 |
| {이전 리포트 날짜} | catalog: {id}.{field} → {value} | 적용 완료 / 미적용 | 현재: {현재값} |
```

### 터미널 출력

```
═══════════════════════════════════════════════
 Discovery Complete
═══════════════════════════════════════════════
 Mode        : {broad | category | competitor}
 Time Range  : {시작일} ~ {종료일} ({N}일)
 Sources     : {N} checked, {N} with changes
 Findings    : {N} NEW, {N} UPDATE, {N} PRIORITY, {N} STALE, {N} DEPRECATED
 Filtered    : {N} duplicates excluded
 Report      : specs/discovery-reports/{date}-discovery.md
═══════════════════════════════════════════════

권장 액션:
  1. /research {topic-1} — {이유} (priority: high)
  2. /research {topic-2} — {이유} (priority: medium)

카탈로그 수정 제안:
  1. {component_id}.priority: {현재} → {제안}

다음 단계: /review 실행하여 액션 승인 후 진행
```

---

## Step 5 — 다음 액션 제시

리포트 생성 후, 터미널에 권장 액션 목록을 출력한다.
실제 실행은 `/review` → `/research` 파이프라인으로 위임한다.

> `/research` 직접 실행 및 사용자 선택 프롬프트는 수행하지 않는다.
> `/review`가 배치 승인/거절의 게이트 역할을 담당한다.

---

## 에러 처리

- **카테고리 ID를 찾을 수 없음**: 유사한 카테고리 ID를 제안하고 중단.
- **경쟁사 이름 불명확**: 소스 레지스트리의 경쟁사 id 목록을 표시하고 확인 요청.
- **소스 URL 접근 실패**: Primary → Fallback 순으로 시도. 모두 실패 시 해당 소스를 건너뛰고 리포트에 "접근 실패" 기록. 나머지 소스로 계속 진행.
- **웹 검색 실패**: vault 내부 분석만으로 STALE 분류는 수행 가능. 검색 실패를 리포트에 기록.
- **발견 사항 없음**: "스캔 범위 내 유의미한 변경 없음" 메시지. 리포트에 확인한 소스 목록과 시간 범위를 기록하여 추적성 유지.
- **이전 리포트 없음**: 중복 필터링을 건너뛰고, `{date_range}`를 "최근 14일"로 설정하여 초회 실행으로 처리.
