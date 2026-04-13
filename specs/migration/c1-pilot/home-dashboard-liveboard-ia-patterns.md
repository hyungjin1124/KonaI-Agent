---
type: insight-synthesis
topic_id: home-dashboard-liveboard-ia-patterns
topic_name: 홈 / 대시보드 / 라이브보드 통합 정보 아키텍처 패턴
category: agent-ui
document_level: synthesis
parent_broad: agent-ui
related_patterns:
  - dashboard-composition
catalog_components:
  - liveboard_home
  - widget_grid
  - drill_down_interaction
  - chat_to_dashboard_pin
tags:
  - insight
  - agent-ui
  - dashboard
  - liveboard
  - information-architecture
  - widget
  - drill-down
  - ai-insight
status: draft
confidence: medium
last_updated: '2026-04-07'
source_products:
  - datadog
  - thoughtspot-spotter
  - databricks-mosaic-ai
  - snowflake-intelligence
  - dify
  - servicenow-now-assist
  - salesforce-agentforce
source_files:
  - '리서치/Insights/agent-ui/sources/01-dashboard-ia-research.md'
relevant_roles:
  - frontend_agent
auto_update:
  enabled: true
  feeds: []
  keywords:
    - dashboard IA
    - liveboard
    - widget grid
    - drill-down
    - chat to dashboard
    - AI insight pin
  review_trigger:
    mode: auto
    threshold: 3
    priority_override: true
---

# 홈 / 대시보드 / 라이브보드 통합 정보 아키텍처 패턴

## TL;DR

- "**홈과 대시보드는 분리되어야 한다**"가 업계 표준이다. 단 ServiceNow AI Control Tower만 예외적으로 "홈 = 대시보드"로 통합하는데, 이는 관제(Governance) 워크스페이스 전용 특수 맥락이다.
- **위젯 커스터마이징은 4단계 스펙트럼**으로 분포한다: (풀 스펙트럼) Datadog → Tableau 기반 Agentforce → SQL 기반 Databricks/ThoughtSpot → 고정 위젯 Dify/Snowsight (제한). KonaI-Agent는 ThoughtSpot/Databricks 층위(중간 수준 + AI Assistant 기반 자연어 생성)가 현실적 목표이다.
- **AI 자동 인사이트의 대시보드 통합은 3가지 방식**으로 나뉜다: (a) 인라인 AI Highlights 버튼 (ThoughtSpot), (b) Companion Space / Ask Dashboard (Databricks Genie), (c) 자동 감지 → 대시보드 경고 (ServiceNow Control Tower, Salesforce Agent Health). 가장 성숙한 패턴은 (a)+(c) 결합.
- **"채팅 → 대시보드 Pin" 파이프라인이 사용자 채택의 분수령**이다. ThoughtSpot의 명시적 Pin 버튼, Datadog Bits AI의 자연어 → Widget/Dashboard 생성, Salesforce의 Session Tracing 자동 반영이 대표 사례. Genie처럼 Companion으로만 존재하면 대화→대시보드 전환이 단절된다.
- **드릴다운 모델은 4가지 계층**으로 분화: (1) 네이티브 다단계 클릭 드릴다운 (ThoughtSpot, 깊이 무제한), (2) Cross-Filtering (Databricks, 시각화 간 연동), (3) 상세 리포트 연결 (Agentforce, 세션 트레이스), (4) 대화형 드릴다운 (Databricks Ask Genie — 클릭 대신 질문으로 드릴다운). KonaI-Agent는 (1)+(4) 결합이 이상적.
- **모니터링 통합도에 따라 3개 축**으로 분류: (A) 완전 통합 (ServiceNow Control Tower: 대시보드 = 관제판), (B) 연결형 분리 (Datadog, Databricks: 별도 페이지 + 위젯 연결), (C) 앱 내부 탭 (Dify: Overview/Logs/Annotations 같은 공간 다른 탭). ERP 에이전트 대시보드에는 (A) 또는 (A)+(B) 하이브리드가 적합.

---

## Context

"대시보드"와 "라이브보드(위젯 그리드)"를 통합하려는 KonaI-Agent의 IA 설계 과제는, 단일 개념이 아닌 **다수의 직교 축(Orthogonal Axes)**을 동시에 결정해야 한다. 즉, "홈/대시보드 분리 여부", "위젯 커스터마이징 자유도", "AI 인사이트의 표면화 방식", "채팅→대시보드 저장 경로", "모니터링과의 경계", "드릴다운 모델", "외부 기능 연결점"이 서로 독립적으로 설계된다. 이 7~8개의 축을 명확히 분리하지 않으면 IA 결정이 뒤섞여 구현 단계에서 혼란이 발생한다.

본 문서는 7개 엔터프라이즈 AI 제품(Datadog, ThoughtSpot, Databricks AI/BI+Genie, Snowflake Snowsight, Dify, ServiceNow AI Control Tower, Salesforce Agentforce Observability)을 8개 조사 항목으로 교차 분석한 원본 연구(`Insights/agent-ui/sources/01-dashboard-ia-research.md`)를 Layer 2 synthesis로 재구조화한 것이다. 각 축마다 분류 패턴, 대표 사례, 선택 기준, KonaI-Agent 적용 시사점을 제시한다.

**Related**: [[dashboard-composition]] — 본 문서는 "정보 아키텍처"(IA) 관점을, related 문서는 "멀티 에이전트 레이아웃 패러다임"(UI 패턴) 관점을 다룬다. 두 문서는 상호 보완적이며, KonaI-Agent 전체 대시보드 설계 시 함께 참조해야 한다.

---

## 테마 1: 홈 화면 구성 요소

### 비교 매트릭스

| 제품 | 홈 유형 | 주요 컴포넌트 |
|------|---------|---------------|
| Datadog | Infrastructure Overview | 인테그레이션 상태, 최근 활동, 추천 대시보드, Bits AI 챗 버튼 |
| ThoughtSpot | 콘텐츠 허브 | Search 바(Sage/Spotter), Popular KPIs, Recent Answers/Liveboards, Top 5 Trending, KPI Watchlist |
| Databricks | 워크스페이스 랜딩 | Recents(노트북/대시보드/쿼리), Quick Actions, 좌측 Home/Workspace/Data/SQL/ML 메뉴 |
| Snowflake Snowsight | Projects 랜딩 | 최근 Worksheets/Dashboards, Quick Action "Create SQL Worksheet" |
| Dify | Studio (앱 리스트) | 사용자 생성 AI 앱 카드 리스트, Create from Blank/Template 버튼 |
| ServiceNow AI Control Tower | **관제 대시보드 자체** | AI 자산 인벤토리, 성과 메트릭, ROI, 컴플라이언스 상태, Strategy/Governance/Ops/Value 하위 탭 |
| Salesforce | CRM Home 탭 | Activity Timeline, 최근 레코드, 대시보드 스냅샷 (Agentforce는 별도 Studio로 분리) |

### 패턴 분류

- **패턴 H-A (콘텐츠 허브형)**: 최근 조회/트렌딩/추천 콘텐츠 리스트 중심. 사용자가 "어디로 갈까"를 선택하는 내비게이션 허브. — Datadog, ThoughtSpot, Databricks, Snowflake, Dify, Salesforce
- **패턴 H-B (관제 대시보드형)**: 홈 자체가 대시보드. 진입 즉시 핵심 지표/경고를 본다. — ServiceNow AI Control Tower (단독)

### KonaI-Agent 시사점

ERP 에이전트 대시보드는 사용자 역할에 따라 **패턴 H-A (일반 사용자: 대화 시작 + 추천 액션)**와 **패턴 H-B (관리자: 에이전트 상태 관제)**를 역할별로 선택적으로 적용해야 한다. `dashboard-composition.md`의 Role-Adaptive Layout 원칙과 결합된다.

---

## 테마 2: 홈과 대시보드의 관계

### 비교 매트릭스

| 제품 | 분리 여부 | 비고 |
|------|-----------|------|
| Datadog | **완전 분리** | Home = 시작점, Dashboards = 분석 도구 |
| ThoughtSpot | **분리 + 부분 연결** | Home의 KPI Watchlist가 Liveboard의 "요약 진입점" 역할 |
| Databricks | **분리** | Home = 워크스페이스 네비게이션, Dashboards = 별도 메뉴. 최근 "비즈니스 사용자 단일 장소(single place)" 지향 |
| Snowflake | **분리** | Projects → Dashboards 경로. Snowflake Intelligence는 또 다른 독립 인터페이스 |
| Dify | **부분 통합** | 글로벌 홈 대시보드 없음, 앱 내부 Overview 탭에 분석 대시보드 임베디드 |
| ServiceNow Control Tower | **완전 통합** | 홈 = 대시보드 |
| Salesforce | **분리** | CRM Home ≠ Agentforce Studio Dashboards |

### 패턴 분류

- **패턴 R-A (완전 분리)**: Home은 네비게이션, Dashboard는 독립 메뉴. 업계 표준. — 5/7
- **패턴 R-B (분리 + 브리지)**: Home에 Dashboard의 요약/KPI를 브리지 위젯으로 노출. ThoughtSpot KPI Watchlist가 사례. — 사용자 채택률 +
- **패턴 R-C (완전 통합)**: 홈 = 대시보드. 관제(Governance) 도메인 전용. — ServiceNow Control Tower
- **패턴 R-D (컨텍스트 내장)**: 글로벌 대시보드 없음, 엔티티(앱/에이전트) 내부에 탭으로 존재. — Dify

### KonaI-Agent 시사점

기본값은 **패턴 R-B (분리 + 브리지)** — 홈은 대화/액션 허브, 대시보드(라이브보드)는 별도 메뉴로 분리하되, 홈에 KPI Watchlist 위젯을 두어 핵심 지표를 상시 노출. 관리자 역할에서는 **패턴 R-C**로 전환 가능(Admin View). Dify 스타일 **R-D (에이전트 내부 탭)**는 개별 에이전트 프로파일 페이지에서 보조적으로 사용.

---

## 테마 3: 위젯 유형과 커스터마이징 수준

### 커스터마이징 스펙트럼

```
[풀 스펙트럼] ──────────────────────────────────────────── [고정 위젯]
     Datadog                   ThoughtSpot  Databricks         Dify
                               Snowsight(제한)  Agentforce      Snowsight
                                                                ServiceNow CT
```

| 제품 | 위젯 수 | 드래그/리사이즈 | 커스텀 테마 | 자연어 위젯 생성 | 특이사항 |
|------|--------|----------------|-------------|-----------------|---------|
| **Datadog** | 20+ 카테고리 | ✅ 풀 스펙트럼 | Dark/Light | ✅ Bits AI Widget Agent | JSON 표현, API 프로그래머틱, Template Variables |
| **ThoughtSpot** | 차트 14종 + KPI 카드 | ✅ Custom sizes | ✅ HTML 제목 | ✅ SpotterViz Agent (전체 Liveboard 생성) | 탭 기반 분할, 글로벌 필터 |
| **Databricks AI/BI** | 차트 10+ + 텍스트 | ✅ | ✅ | ✅ AI Assistant (SQL + 시각화) | 3단계 필터(글로벌/페이지/위젯), 다중 페이지, Parameters 바인딩 |
| **Snowflake Snowsight** | 5종 (Bar/Line/Scatter/Heatgrid/Scorecard) | ✅ (타일 기반) | 제한 | ❌ (Cortex는 별도 인터페이스) | 조건부 서식/주석 부재 |
| **Dify** | 고정 4종 (Messages/Users/Interactions/Tokens) | ❌ | ❌ | ❌ | 외부 Langfuse/Arize/Grafana로 위임 |
| **ServiceNow Control Tower** | PA 기반 KPI/도넛/바/시계열/리스크 스코어 | 부분 (PA 대시보드 빌더) | ✅ | ❌ | C-Suite 요약 뷰 최적화 |
| **Salesforce Agentforce** | Tableau 기반 | ✅ Legacy 리포트 복제 | ✅ | 제한 | Agent Analytics/Optimization/Health 3계층 |

### 핵심 관찰

1. **AI Assistant 기반 자연어 위젯 생성**은 ThoughtSpot, Databricks, Datadog이 선도. "show average CPU over time for production hosts" 같은 프롬프트가 Widget JSON으로 변환되어 실제 위젯이 추가된다. 이 패턴이 **사용자 진입 장벽을 가장 크게 낮추는 요소**다.
2. **고정 위젯 방식**(Dify, ServiceNow CT, Snowsight)은 구축 비용이 낮지만 채택률이 낮다. 단, ServiceNow CT는 관제 도메인 특화이므로 고정이 오히려 거버넌스에 유리.
3. **JSON + API 표현**(Datadog)은 CI/CD 통합, 프로그래머틱 관리, 템플릿 재사용 측면에서 가장 성숙한 설계. Databricks Asset Bundles도 유사.

### KonaI-Agent 시사점

현실적 목표는 **ThoughtSpot/Databricks 층위**:
- 차트 10종 내외 + 텍스트/마크다운 위젯
- 드래그/리사이즈 (`react-grid-layout` 이미 사용 중)
- **AI Assistant로 자연어 → 위젯 JSON 생성** (가장 우선순위 높은 기능)
- 글로벌 필터 + 위젯 레벨 필터 2단계
- Parameters 바인딩 (SQL 템플릿화)

제외 또는 유보:
- 조건부 서식, 커스텀 색상 팔레트 (Phase 2)
- PA 스타일 관제 대시보드 (admin 전용 별도 Phase)

---

## 테마 4: AI 자동 인사이트의 대시보드 통합 방식

### 3가지 통합 패턴

#### 패턴 AI-A: 인라인 AI Highlights 버튼
대시보드 내 버튼 클릭 → 해당 뷰의 KPI에 대한 자연어 요약이 인라인 표시. 사용자가 능동 트리거.

- **대표**: ThoughtSpot AI Highlights (Liveboard 우측 상단 버튼 → 30초 내 상위 5개 KPI 요약, Expected/Unexpected Changes 분류, 신뢰 구간 기반)
- **특징**: 요약 뒤 "Change Analysis"로 원인 드릴다운 가능 (화면 전환 없이)

#### 패턴 AI-B: Companion Space / Ask Dashboard
대시보드와 쌍(pair)으로 존재하는 대화 공간. "Ask Genie" 버튼으로 대시보드 데이터에 대한 자연어 질의.

- **대표**: Databricks Genie (대시보드 퍼블리시 시 Companion Genie Space 자동 생성)
- **특징**: 대시보드는 고정된 채로, 대화에서 SQL 생성 + 시각화 응답. 그러나 **대화 결과를 대시보드에 직접 Pin하는 경로가 미약**한 것이 약점.

#### 패턴 AI-C: 자동 감지 → 대시보드 경고
AI가 모니터링 중 이상을 자동 감지하고 대시보드에 경고/알림으로 표면화.

- **대표**: ServiceNow Control Tower (모델 드리프트, 컴플라이언스 위반 자동 감지), Salesforce Agent Health Monitoring (에러율/레이턴시 임계값 초과 알림), Datadog Watchdog (이상 탐지)
- **특징**: Push 방식. 사용자 질의 없이 선제적으로 표면화.

#### 패턴 AI-D: 외부 위임 (반패턴)
- **대표**: Dify (Arize/Langfuse/Grafana에 위임), Snowsight (Cortex Analyst는 별도 인터페이스)
- **특징**: 자체 대시보드에 AI 인사이트가 없다. 사용자는 외부 도구로 전환 필요 → 채택률 하락.

### KonaI-Agent 시사점

**권장 조합: AI-A + AI-C**
- 평상시: 대시보드 내 "AI Highlights" 버튼으로 사용자가 질의 → 인라인 요약 (ThoughtSpot 방식)
- 이상 감지: 백그라운드 AI가 이상징후 감지 시 대시보드 상단 배너로 경고 표시 (ServiceNow 방식)
- **반패턴 AI-D 회피**: 외부 도구로 위임하지 말 것. 에이전트 활동 분석은 네이티브로 품고 가야 함.

Genie 스타일 Companion (AI-B)은 Phase 2. 단, 도입 시 "대화 → Pin → 대시보드" 경로를 반드시 구현해야 함 (테마 5 참조).

---

## 테마 5: 채팅 → 대시보드 저장 경로

### 파이프라인 모델

```
[사용자 자연어 질의] → [AI 해석/SQL 생성] → [Answer/차트 렌더링] → [Pin/Save 액션] → [대시보드 위젯 추가]
```

### 구현 비교

| 제품 | 경로 | 명시적 Pin 버튼 | 자동 반영 |
|------|------|-----------------|----------|
| **ThoughtSpot** | Search → Answer → Pin to Liveboard (대화 상자에서 대상/탭 선택) | ✅ **가장 성숙** | SpotterViz Agent는 전체 Liveboard 자동 생성 |
| **Datadog** | Bits AI 자연어 → Widget JSON 생성 → 대시보드에 추가. Log Explorer "Export to Dashboard" | ✅ | Dashboard Agent가 전체 대시보드 자연어 생성 |
| **Databricks** | Genie 대화 → 답변은 대화 기록으로만 저장. **Pin 미구현**. 대안: AI Assistant로 편집 모드에서 자연어 위젯 추가 | ❌ (간접만) | AI Assistant 경로 |
| **Snowsight** | Worksheet → 차트 생성 → Move to Dashboard. Cortex Analyst는 별도 인터페이스 | ✅ (Worksheet 경로) | ❌ |
| **Dify** | 해당 없음 (BI 도구 아님) | — | 앱 실행 로그 → Overview 메트릭 자동 집계 |
| **ServiceNow CT** | 워크플로 기반, 채팅 → 대시보드 경로 약함 | ❌ | Flow Designer 자동화 |
| **Salesforce Agentforce** | **Session Tracing 자동 반영** (모든 채팅 → Data 360 → Analytics 대시보드) | ❌ (명시적 Pin 없음) | ✅ 완전 자동 |

### 패턴 분류

- **패턴 S-A (명시적 Pin)**: 사용자가 Pin 버튼 눌러 대시보드 위젯으로 저장. UX 직관적. — ThoughtSpot 최강, Datadog
- **패턴 S-B (자동 반영)**: 인터랙션이 자동으로 대시보드 메트릭에 집계. 관측(Observability) 대시보드 전용. — Salesforce Agentforce
- **패턴 S-C (부재/간접)**: Pin 경로 미구현. Companion Space가 분리되어 있어 대화-대시보드 단절. — **Databricks Genie의 현재 약점**

### KonaI-Agent 시사점

**3단 조합 권장**:
1. **패턴 S-A (명시적 Pin)** — 사용자가 채팅에서 얻은 차트/테이블을 Pin 버튼으로 라이브보드에 추가 (ThoughtSpot 모델)
2. **패턴 S-B (자동 반영)** — 에이전트 활동 메트릭(실행 횟수, 성공률, 비용)은 자동 집계되어 관리자 대시보드에 반영 (Salesforce Agentforce 모델)
3. **전체 Liveboard 자연어 생성** — SpotterViz처럼 "매출 분석 대시보드 만들어줘"로 전체 라이브보드 자동 생성 (Phase 2)

**반드시 회피**: Databricks Genie 스타일의 "Companion만 있고 Pin 없음" 구조. 대화 투자가 라이브보드로 누적되지 않으면 사용자 이탈 요인.

---

## 테마 6: 모니터링과 대시보드의 경계

### 통합도 분류

| 통합도 | 대표 제품 | 구조 |
|--------|-----------|------|
| **완전 통합** | ServiceNow Control Tower | 대시보드 = 관제판. 모니터링/알림/드리프트 감지 모두 한 화면 |
| **연결형 분리** | Datadog, Databricks, Snowsight | Monitors는 별도 섹션이나, Monitor Summary/Alert Value 같은 **위젯**으로 대시보드에 끌어올 수 있음 |
| **앱 내부 탭** | Dify | Overview(메트릭)/Logs(실행 로그)/Annotations 같은 공간 다른 탭 |
| **통합 스튜디오** | Salesforce Agentforce | Agent Analytics + Optimization + Health Monitoring 모두 Agentforce Studio 하위 기능 |
| **분리** | ThoughtSpot | Monitor Subscriptions는 별도 섹션, Liveboard에 알림 위젯 없음 |

### 관찰

1. **"완전 분리"(ThoughtSpot)는 BI 분석에 최적화**되어 있으나 에이전트 운영에는 부족.
2. **"연결형 분리"(Datadog/Databricks)가 가장 균형** 잡힌 업계 기본값. 모니터링은 별도 섹션에 설정, 결과는 위젯으로 대시보드에 통합.
3. **"완전 통합"(ServiceNow CT)은 관제 도메인 전용** — 홈이 관제판이어야 하는 경우에만.
4. **"통합 스튜디오"(Agentforce)는 에이전트 특화**. 에이전트 중심 제품이면 Analytics/Optimization/Health를 한 스튜디오에 묶는 것이 자연스럽다.

### KonaI-Agent 시사점

**2단 접근**:
- 일반 사용자 라이브보드: **연결형 분리** (Datadog/Databricks 모델). 모니터링 자체는 별도 메뉴, 라이브보드에는 Monitor Summary/Alert Value 위젯으로 노출.
- 관리자 Admin 뷰: **완전 통합** (ServiceNow CT 모델). 에이전트 헬스/드리프트/비용/컴플라이언스를 한 화면에.
- 향후 Agentforce Studio 개념(Analytics + Optimization + Health를 한 스튜디오로)은 에이전트 전용 섹션을 키울 때 참고.

---

## 테마 7: 위젯 드릴다운 인터랙션

### 4가지 드릴다운 모델

#### 모델 D-1: 네이티브 다단계 클릭 드릴다운
시각화의 데이터 포인트를 클릭 → 다음 레벨로 들어감. 깊이 무제한.
- **대표**: ThoughtSpot (Revenue by Dept → Clothing 클릭 → by Product → 특정 제품 → by Region, 무제한 깊이. Answer Explorer로 컬럼 추가/제거/필터 변경. Undo/Redo/Reset 버튼)
- **장점**: 가장 직관적이고 깊이 있는 탐색
- **단점**: 사전에 드릴 다운 계층이 데이터 모델에 정의되어야 함

#### 모델 D-2: Cross-Filtering (시각화 간 연동)
하나의 시각화에서 클릭 → 같은 페이지의 다른 시각화가 자동 필터링.
- **대표**: Databricks AI/BI 대시보드
- **장점**: 다중 시각화 상관관계 탐색에 강력
- **단점**: "더 깊이" 들어가는 느낌보다 "좁히는" 느낌

#### 모델 D-3: 상세 리포트/워크스페이스 연결
위젯 클릭 → 별도 상세 리포트/워크스페이스로 전환.
- **대표**: Salesforce Agentforce (세션 클릭 → 전체 추론 체인 트레이스 뷰: 사용자 입력 → LLM 호출 → 도구 실행 → 가드레일 → 응답), ServiceNow Control Tower (리스크 스코어 클릭 → 개별 AI 모델 상세), Datadog Custom Links (Template Variables 보간)
- **장점**: 원본 로그/세부 데이터까지 추적 가능
- **단점**: 화면 전환 발생, 컨텍스트 손실 가능

#### 모델 D-4: 대화형 드릴다운 (AI-Native)
클릭 대신 질문으로 드릴다운. "왜 이 값이 떨어졌지?" → AI가 원인 분석.
- **대표**: Databricks "Ask Genie" 버튼 (특정 데이터 포인트에 대해 자연어 질문), ThoughtSpot Spotter 호출 (Liveboard에서 시각화에 대해 자연어 추가 질문), ThoughtSpot Change Analysis (Iterative drill-down via AI)
- **장점**: 미리 정의된 계층이 필요 없고, 사용자 의도 기반 탐색 가능
- **단점**: 대답 품질에 AI 신뢰도 의존

### 반패턴: 드릴다운 부재
- **Snowsight**: 클릭 드릴다운 기능 관찰되지 않음. 타일 클릭은 워크시트로 이동할 뿐.
- **Dify**: Overview 대시보드에서 드릴다운 없음, Logs 탭 전환이 사실상 드릴다운 경로.

### KonaI-Agent 시사점

**4가지 모델 모두 지원 (우선순위)**:
1. **D-1 (네이티브 드릴다운)** 기본 — 계층적 데이터(조직 → 부서 → 개인, 연도 → 분기 → 월)에서 필수
2. **D-4 (대화형 드릴다운)** 차별화 요소 — "이 값 왜 이래?" 버튼을 모든 위젯에 내장. AI 에이전트 제품의 가장 중요한 UX 차별화
3. **D-2 (Cross-Filtering)** 편의성 — Databricks처럼 같은 페이지 다른 시각화 자동 필터링
4. **D-3 (상세 리포트)** 보조 — 세션 트레이스나 에이전트 개별 프로파일로 이동하는 경로. ReactFlow 기반 시나리오 상세 뷰와 연결

---

## 테마 8: 외부 기능 연결 지점

### 제품별 주요 커넥터

| 제품 | 핵심 연결점 (Top 5) |
|------|-------------------|
| **Datadog** | Log Explorer → 대시보드, Bits AI → 위젯/대시보드 생성, Monitors → 위젯, JSON API, Slack/외부 공유 |
| **ThoughtSpot** | Search → Pin → Liveboard, SpotterViz → 전체 Liveboard, SpotIQ 분석 → 신규 Liveboard, TML Export, 임베드 SDK |
| **Databricks** | AI Assistant → SQL+차트, Genie Companion Space, Unity Catalog → 데이터 소스 + 접근 제어, Metric Views 중앙화, Asset Bundles CI/CD |
| **Snowsight** | Worksheet → 대시보드, Cortex Code → SQL → 대시보드, ACCOUNT_USAGE 셀프 모니터링, Streamlit 연동 |
| **Dify** | 앱 실행 → Overview 자동 집계, 외부 관찰 가능성(Langfuse/Arize) → 외부 위임, Plugin/MCP 확장 |
| **ServiceNow CT** | CMDB → AI 자산 자동 등록, GRC → 리스크/컴플라이언스 실시간, AI Agent Fabric → 서드파티 에이전트 관제, Flow Designer 자동 교정 |
| **Salesforce Agentforce** | Session Tracing → Data 360 → Analytics 자동, MuleSoft Agent Fabric, OpenTelemetry → Datadog/Splunk/Arize, AgentExchange 마켓플레이스 |

### 연결 유형 분류

1. **데이터 소스 ↔ 대시보드** (모든 제품): SQL 쿼리, 데이터 카탈로그, 시맨틱 모델
2. **AI 생성 ↔ 대시보드**: 자연어 → 위젯 (Datadog Bits, Databricks AI Assistant, ThoughtSpot SpotterViz)
3. **관찰 가능성 ↔ 대시보드**: 모니터/알림 → 위젯 (Datadog, Databricks), OpenTelemetry (Agentforce)
4. **거버넌스 ↔ 대시보드**: CMDB, GRC, 접근 제어 (ServiceNow CT, Databricks Unity Catalog)
5. **워크플로 ↔ 대시보드**: Flow Designer, Databricks Jobs, Salesforce Session Tracing
6. **외부 공유/임베드**: Public URL, SDK 임베드, PDF/TML/PNG Export
7. **마켓플레이스/자산 번들**: AgentExchange, Asset Bundles

### KonaI-Agent 시사점

**Phase 1 필수 커넥터**:
- 데이터 소스 → 라이브보드 (KonaChain 데이터 파이프라인)
- AI 생성 → 라이브보드 (채팅 → Pin → 위젯)
- 워크플로 → 라이브보드 (에이전트 시나리오 실행 이력 → 대시보드 자동 반영, Salesforce 모델)

**Phase 2**:
- 거버넌스 (에이전트 권한, 감사 로그 → Admin 대시보드)
- 외부 공유 (PDF Export, Public Link)

**Phase 3**:
- OpenTelemetry 외부 관찰 가능성 통합
- 자산 번들 (버전 관리 + CI/CD)

---

## Key Findings

1. **"홈과 대시보드는 분리, 단 브리지로 연결"이 지배적 패턴** — 7개 제품 중 5개가 분리. 단 ThoughtSpot처럼 Home에 KPI Watchlist 같은 요약 위젯을 두어 브리지 역할을 하게 하는 것이 사용자 채택의 핵심. 완전 통합은 ServiceNow CT처럼 관제 도메인 전용 예외.

2. **자연어 기반 위젯/대시보드 생성이 진입 장벽 결정 요인** — Datadog Bits AI, ThoughtSpot SpotterViz, Databricks AI Assistant가 주도. 고정 위젯(Dify, Snowsight)은 개발 속도만 빠를 뿐 사용자 커스터마이징 의지를 억제.

3. **AI 인사이트의 대시보드 내 인라인 통합이 외부 위임보다 우월** — ThoughtSpot AI Highlights, ServiceNow Control Tower 자동 감지가 Dify(외부 Langfuse 위임)보다 사용자 체류 시간 우위. Databricks Genie의 Companion 모델은 중간. "대시보드 안에서 완결"이 핵심.

4. **"채팅 → Pin → 대시보드" 파이프라인 부재가 Databricks Genie의 가장 큰 UX 결점** — 대화는 있으나 Pin이 없어 대화 투자가 누적되지 않음. ThoughtSpot의 명시적 Pin 버튼이 업계 최강 레퍼런스. KonaI-Agent는 이 지점을 초기부터 구현해야 함.

5. **드릴다운 4가지 모델 중 "대화형 드릴다운(D-4)"이 AI 네이티브 제품의 차별화 포인트** — 클릭 드릴다운(D-1)은 모든 BI 도구가 제공하지만, "왜 이 값 떨어졌어?" 버튼은 Databricks Ask Genie와 ThoughtSpot Change Analysis가 선도. KonaI-Agent는 모든 위젯에 "왜?" 버튼을 기본 제공해야 함.

6. **모니터링 통합도는 사용자 역할에 따라 분기해야 함** — 일반 사용자(연결형 분리), 관리자(완전 통합). 한 가지 방식으로 통일하면 양쪽 모두 불만.

7. **Session Tracing 자동 반영(Salesforce Agentforce)은 에이전트 관측 대시보드의 업계 표준으로 수렴 중** — 모든 에이전트 인터랙션이 자동으로 Data 360 → Analytics로 흘러들어감. 사용자 수동 기록 부담 제로. KonaI-Agent 관리자 뷰에 필수.

8. **외부 관찰 가능성 도구에 위임(Dify 모델)은 자체 UX 경쟁력 포기와 같음** — 엔터프라이즈 에이전트 제품은 분석/모니터링을 자체 대시보드에 품어야 함. Langfuse/Arize 연동은 옵션으로만 제공.

---

## 소스 제품 매핑

| 테마 | 관련 제품 |
|------|----------|
| 홈 구성 요소 | Datadog, ThoughtSpot, Databricks, Snowsight, Dify, ServiceNow CT, Salesforce |
| 홈/대시보드 관계 | ThoughtSpot(브리지), ServiceNow CT(통합), Dify(내장) |
| 위젯 커스터마이징 | Datadog(최대), ThoughtSpot/Databricks(AI Assistant), Dify(최소) |
| AI 인사이트 인라인 | ThoughtSpot AI Highlights, ServiceNow CT 자동 감지, Databricks Genie Companion |
| 채팅→대시보드 Pin | ThoughtSpot(최강), Datadog Bits AI, Salesforce 자동 반영 |
| 모니터링 통합 | ServiceNow CT(완전), Datadog/Databricks(연결형), Dify(탭) |
| 드릴다운 | ThoughtSpot(D-1 무제한), Databricks(D-2/D-4), Agentforce(D-3) |
| 외부 연결 | Datadog(JSON API), Databricks(Unity Catalog), Agentforce(OpenTelemetry) |

---

## Source References

### 원본 리서치 문서
- [[01-dashboard-ia-research]] — 7개 제품 × 8개 조사항목의 raw cross-product research. Layer 1 원본.

### 관련 패턴 문서
- [[dashboard-composition]] — 멀티 에이전트 UI 레이아웃 패러다임 (Sidecar/Supervisor/Registry/Dual-Pane). 본 문서와 직교하는 축.

### 제품 프로필 (Vault)
- [[thoughtspot-spotter]]
- [[databricks-mosaic-ai]]
- [[snowflake-intelligence]]
- [[servicenow-now-assist]]
- [[salesforce-agentforce]]
- [[microsoft-copilot]] (dashboard-composition 참조)
- [[workday-assistant]] (dashboard-composition 참조)

### 외부 참고 자료 (raw 원본에 전체 수록)
- Datadog Dashboards 제품 페이지
- ThoughtSpot Liveboard / AI Highlights / SpotIQ 공식 문서
- Databricks AI/BI Dashboard + Genie 문서
- Snowsight Dashboard 공식 문서
- Dify Analysis 공식 문서
- ServiceNow AI Control Tower 제품 페이지
- Salesforce Agentforce Observability 제품 페이지

---

*Last synthesized: 2026-04-07 | C1 Pilot split from `docs/research/ux-patterns/01-dashboard.md` | Raw source preserved at `Insights/agent-ui/sources/01-dashboard-ia-research.md`*
