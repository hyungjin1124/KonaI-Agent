# 엔터프라이즈 AI 에이전트 플랫폼 — 대시보드/인사이트 IA 심층 분석

> 리서치 대상: Datadog, ThoughtSpot, Databricks, Snowflake Snowsight, Dify, ServiceNow AI Control Tower, Salesforce Agentforce
> 목적: "대시보드"와 "라이브보드(위젯 그리드)" 통합을 위한 IA 설계 레퍼런스

---

## Datadog

### 조사 항목 1: 서비스 첫 접속 시 "홈" 화면 구성 요소

Datadog에 로그인하면 사용자는 기본적으로 "Home" 페이지에 도달하며, 이 페이지는 Infrastructure Overview 형태의 요약 화면을 보여준다. 좌측 네비게이션 메뉴에는 Infrastructure, Metrics, Logs, APM, Security, Dashboards 등 주요 제품 카테고리가 나열된다. Home 화면에는 설치된 인테그레이션 상태, 최근 활동, 추천 대시보드(out-of-the-box dashboards) 등이 표시된다. 하단 좌측에는 Bits AI 챗 버튼이 위치하여 자연어 질의가 가능하다.

### 조사 항목 2: "홈"과 "대시보드"의 관계

Datadog에서 "홈"과 "대시보드"는 완전히 분리된 개념이다. Home은 전체 인프라 상태 개요를 제공하는 랜딩 화면이고, Dashboards는 좌측 메뉴에서 별도로 접근하는 "Dashboards List" 페이지다. Dashboards List에서는 사용자가 만든 커스텀 대시보드, 팀 공유 대시보드, 인테그레이션별 프리셋(Preset) 대시보드를 리스트/검색할 수 있다. 즉, Home은 "시작점"이고 Dashboard는 "분석 도구"로 역할이 분리되어 있다.

### 조사 항목 3: 대시보드 내 위젯 유형과 커스터마이징 수준

Datadog은 업계에서 가장 풍부한 위젯 라이브러리 중 하나를 제공한다. 주요 위젯 카테고리는 다음과 같다.

그래프 위젯: Timeseries, Top List, Query Value, Table, Distribution, Pie Chart, Bar Chart, Heatmap, Geomap, Scatterplot, Treemap, Funnel, Run Chart.

그룹/레이아웃 위젯: Group(위젯을 논리적 섹션으로 묶음), Powerpacks(재사용 가능한 위젯 그룹 템플릿).

상태/모니터링 위젯: SLO Summary, Monitor Summary, Host Map, Service Map, Check Status, Alert Value, Alert Graph.

컨텐츠/로그 위젯: Log Stream, Event Stream, Event Timeline, Free Text, Image, Iframe, Note.

APM/RUM 위젯: APM Dependency Stats, Profiling 관련 위젯.

커스터마이징 수준은 매우 높다. 모든 위젯은 반응형 그리드 위에 배치되며 드래그 앤 드롭으로 크기/위치 조정이 가능하다. 위젯별로 데이터 소스(메트릭, 로그, 트레이스, 이벤트, RUM 등)를 독립적으로 지정할 수 있고, 개별 타임프레임 설정, 조건부 서식(Conditional Formatting), Custom Links 연결이 가능하다. 대시보드 전체에 Template Variables를 적용하여 동적 필터링을 제공한다. 모든 위젯과 대시보드는 JSON으로 표현되어 API를 통한 프로그래머틱 생성/관리가 가능하다. 테마는 Dark/Light 모드 지원.

### 조사 항목 4: AI가 자동 생성한 인사이트의 대시보드 통합 방식

Datadog의 AI 인사이트는 주로 Watchdog 기능을 통해 제공된다. Watchdog은 자동으로 메트릭 이상 탐지, 로그 이상 탐지, APM 트레이스 이상 탐지를 수행한다. Watchdog이 발견한 Anomaly는 List Widget 유형 중 "Watchdog Alerts"를 선택하여 대시보드에 직접 위젯으로 삽입할 수 있다. 또한, Bits AI가 대화 중 서비스 건강 상태를 조회할 때 Watchdog이 탐지한 이상 징후, 배포 변경사항 등을 자동으로 상관관계 분석하여 표면화한다. 다만 Watchdog 인사이트가 대시보드에 자동으로 "인라인 삽입"되는 것은 아니며, 사용자가 Watchdog Alerts 위젯을 직접 추가해야 한다.

### 조사 항목 5: 채팅/자연어 질문에서 생성된 분석 결과를 대시보드로 저장하는 경로

Bits AI(Bits Assistant)는 자연어 질의를 통해 메트릭, 로그, 트레이스 등을 검색할 수 있다. Bits AI의 핵심 스킬 중 하나는 "Build dashboards and widgets from natural language descriptions" 기능이다. 사용자가 "show average CPU utilization over time for production hosts"와 같이 프롬프트를 입력하면, Bits AI의 Widget Agent가 유효한 위젯 JSON 정의를 생성한다. Dashboard Agent는 이 기능을 확장하여 여러 위젯을 포함한 전체 대시보드를 자연어로 생성할 수 있다. 또한, 사용자는 Bits AI 대화에서 "Find me the example-service dashboard"처럼 기존 대시보드를 검색하고 바로 이동할 수도 있다. 로그 탐색기(Log Explorer)와 같은 뷰에서도 "Export to Dashboard" 옵션을 통해 현재 분석 결과를 기존 또는 신규 대시보드에 위젯으로 추가할 수 있다.

### 조사 항목 6: 모니터링(실행 로그, 사용량, 알림)이 대시보드와 통합인지 분리인지

Datadog에서 모니터링(Monitors/Alerts)과 대시보드는 별도 메뉴로 분리되어 있으나, 대시보드 내에서 모니터 상태를 통합 표시할 수 있다. Monitor Summary 위젯, Alert Value 위젯, Alert Graph 위젯 등을 통해 특정 모니터의 현재 상태와 히스토리를 대시보드에 시각화할 수 있다. SLO Summary 위젯도 대시보드에 직접 포함 가능하다. 로그는 Log Stream 위젯으로 대시보드에 실시간 표시가 가능하며, 로그 기반 메트릭도 Timeseries 위젯에 데이터 소스로 지정할 수 있다. 즉, 모니터링 기능 자체는 별도 섹션에서 설정하지만, 모니터링 결과는 대시보드 위젯으로 통합 시각화가 가능한 "연결형 분리" 구조다.

### 조사 항목 7: 위젯 드릴다운 인터랙션

Datadog 위젯은 다중 인터랙션 모델을 지원한다. 각 위젯 우측 상단의 풀스크린 버튼을 클릭하면 위젯을 전체 화면으로 확대하여 더 상세한 데이터를 볼 수 있다. Custom Links 기능을 통해 위젯의 데이터 포인트를 클릭하면 사용자가 정의한 URL(다른 Datadog 페이지 또는 외부 URL)로 이동할 수 있다. 이때 Template Variables가 URL에 보간(interpolation)되어 컨텍스트가 유지된다. 예: 위젯에서 특정 호스트 클릭 → APM 서비스 상세 화면으로 전환(호스트 필터 자동 적용). Group 위젯 내의 개별 위젯도 동일한 인터랙션을 지원하며, 시계열 위젯에서는 특정 시점을 클릭하여 관련 로그, 트레이스, 이벤트를 탐색할 수 있다.

### 조사 항목 8: 다른 기능과의 연결 지점

- **Log Explorer → 대시보드**: Export to Dashboard 옵션으로 로그 쿼리 결과를 대시보드 위젯으로 저장
- **APM/Metrics Explorer → 대시보드**: 탐색 중인 메트릭/트레이스 데이터를 대시보드로 내보내기
- **Monitors → 대시보드**: Monitor Summary, Alert Value, Alert Graph 위젯으로 알림 상태를 대시보드에 표시
- **Bits AI → 대시보드**: 자연어 프롬프트로 위젯 및 전체 대시보드 생성
- **Bits AI → 인시던트 관리**: Slack 채널에서 Bits AI가 인시던트 요약, 자동 타임라인 생성
- **대시보드 → Slack**: Slack 인테그레이션으로 대시보드를 Slack 채널에 임포트
- **대시보드 → 외부 공유**: Public URL 생성으로 Datadog 계정 없는 사용자에게도 공유
- **대시보드 ↔ API**: JSON 표현을 통해 Dashboard API로 프로그래머틱 생성/수정
- **Notebook → 대시보드**: Bits Data Analyst Agent가 노트북에서 생성한 시각화를 대시보드로 연결
- **Watchdog → 대시보드**: Watchdog Alerts를 List Widget 데이터 소스로 선택하여 이상 탐지 결과 표시
- **모바일 앱 → 대시보드**: 모바일 홈 화면 위젯에서 특정 대시보드 지정 가능, 탭 시 대시보드로 이동

---

## ThoughtSpot (Spotter3 / Liveboard / SpotIQ)

### 조사 항목 1: 서비스 첫 접속 시 "홈" 화면 구성 요소

ThoughtSpot에 로그인하면 Home 페이지가 표시된다. Home 페이지 상단에는 Sage/Spotter 검색 바(Search Answers)가 위치하며 자연어로 데이터를 직접 검색할 수 있다. 검색 바 아래에는 인기 KPI(Popular KPIs)가 행으로 나열되며, 이는 조직 내에서 많이 사용되는 주요 지표를 자동으로 표시한다. 그 아래에는 최근 조회한 Answers와 Liveboards가 리스트 형태로 나열된다. 우측 패널에는 "Top 5 Trending Liveboards and Answers"가 표시되어 조직 전체에서 인기 있는 콘텐츠를 보여준다. 필터 바에서는 All/Answers/Liveboards 토글, 태그별 필터, 작성자별 필터, 즐겨찾기 토글이 가능하다. 새 네비게이션 경험이 활성화된 경우, 좌측에 Home, Answers, Liveboards, SpotIQ Analysis, Monitor Subscriptions 등의 네비게이션 패널이 표시된다.

### 조사 항목 2: "홈"과 "대시보드(Liveboard)"의 관계

ThoughtSpot에서 "홈"과 "Liveboard(대시보드)"는 분리되어 있다. Home은 콘텐츠 허브 역할을 하며, 검색 진입점 + 최근/추천 콘텐츠 리스트를 보여준다. Liveboard는 별도의 메뉴 항목으로, Liveboards 리스트 페이지를 통해 접근한다. Home 페이지의 KPI Watchlist에서는 Liveboard에 핀된 KPI 차트를 개별적으로 추적할 수 있어, Home이 Liveboard의 "요약" 진입점 역할을 부분적으로 수행한다. 그러나 Home에는 위젯 그리드가 없으며, 개별 Liveboard를 열어야 위젯 기반 인터랙션이 가능하다.

### 조사 항목 3: 대시보드(Liveboard) 내 위젯 유형과 커스터마이징 수준

Liveboard는 시각화(Visualization)의 모음이다. 각 시각화는 검색(Search/Answer)을 통해 생성된 차트 또는 테이블이다. ThoughtSpot이 지원하는 차트 유형에는 Bar, Line, Pie, Donut, Area, Stacked, Scatter, Bubble, Waterfall, Funnel, Treemap, Heatmap, Pivot Table, Table, KPI Card(Headline), Geo Map 등이 포함된다. Liveboard는 탭(Tab) 기능을 지원하여 하나의 Liveboard를 여러 탭으로 분할하고, 각 탭에 관련 시각화를 그룹화할 수 있다.

커스터마이징: 시각화 크기를 자유롭게 조절할 수 있으며(Custom visualization sizes), 드래그 앤 드롭 재배치가 가능하다. Liveboard 필터(전역 필터, 필수 필터)를 적용하여 모든 시각화를 동시에 필터링할 수 있다. HTML을 Liveboard 제목/설명에 사용 가능하다. SpotterViz 에이전트를 사용하면 자연어 프롬프트 한 번으로 전체 Liveboard의 구조, 레이아웃, 스타일링, 시각화를 자동 생성할 수 있다. 다만, G2 리뷰 등에서는 Tableau이나 Power BI에 비해 차트 커스터마이징 옵션이 제한적이라는 피드백이 존재한다.

### 조사 항목 4: AI가 자동 생성한 인사이트의 대시보드 통합 방식

ThoughtSpot의 SpotIQ는 대시보드(Liveboard)에 가장 깊이 통합된 AI 인사이트 엔진 중 하나다.

**AI Highlights**: Liveboard 우측 상단의 "AI Highlights" 버튼을 클릭하면, 30초 이내에 해당 Liveboard 탭의 상위 5개 시계열 KPI에 대한 자연어 요약이 생성된다. 예상 변화(Expected Changes)와 예상치 못한 변화(Unexpected Changes)로 분류되며, 이는 SpotIQ의 이상 탐지 엔진이 생성하는 신뢰 구간(Confidence Band)을 기반으로 한다. AI Highlights는 탭 레벨에서 계산되어 각 탭마다 별도의 요약이 제공된다.

**SpotIQ Change Analysis**: AI Highlights 내에서 특정 KPI의 변화 원인을 드릴다운할 수 있다. Change Analysis는 두 시점 간 주요 변화 기여 속성(attributes)을 자동으로 식별하고, Iterative Change Analysis를 통해 각 속성을 더 깊이 드릴다운할 수 있다. 이 모든 과정이 별도 화면 전환 없이 Liveboard 내에서 진행된다.

**SpotIQ 자동 분석**: 특정 시각화에서 우클릭으로 SpotIQ 분석을 실행하면, 트렌드/상관관계/이상치 등의 인사이트가 생성되어 새 Liveboard로 저장된다.

**Anomaly-based Alerts**: SpotIQ가 KPI에서 이상 변화를 탐지하면 알림을 발송하며, 이는 기존의 Threshold-based Alerts 및 Scheduled Alerts와 함께 작동한다.

**Forecasting**: SpotIQ의 ML 모델이 과거 데이터 패턴을 분석하여 미래 트렌드를 예측하며, 이 예측 결과가 Liveboard의 시계열 차트에 오버레이된다.

### 조사 항목 5: 채팅/자연어 질문에서 생성된 분석 결과를 대시보드로 저장하는 경로

ThoughtSpot의 검색(Spotter/Sage)에서 생성된 결과는 "Answer"로 저장된다. Answer를 Liveboard에 추가하는 경로는 다음과 같다: Answer 화면 우측 상단의 "Pin" 버튼 클릭 → "Pin to Liveboard" 대화 상자에서 대상 Liveboard 선택(기존 Liveboard 또는 새 Liveboard 생성 가능) → 특정 탭 선택 또는 새 탭 생성 → Pin 클릭. 이 흐름은 "Search → Answer → Pin → Liveboard"로 정리된다. SpotterViz 에이전트는 이 과정을 자동화하여, 자연어 프롬프트 하나로 전체 Liveboard를 구조(스토리 계획) → 답변 생성(Spotter로 개별 Answer 생성) → 조립(레이아웃, 스타일링)까지 완료한다.

### 조사 항목 6: 모니터링(실행 로그, 사용량, 알림)이 대시보드와 통합인지 분리인지

ThoughtSpot에서 알림/모니터링은 별도의 "Monitor" 섹션에서 관리된다. Threshold Alerts, Scheduled Alerts, SpotIQ Anomaly Alerts는 좌측 네비게이션의 Monitor Subscriptions 메뉴에서 설정하고 관리한다. 알림은 이메일, 푸시 알림(모바일 앱) 등으로 발송되며, Liveboard 내에 알림 상태를 직접 위젯으로 표시하는 기능은 관찰되지 않는다. 사용량 분석(Liveboard 조회 수, 사용자 활동 등)은 Liveboard 상세 정보에서 최근 120일간의 조회/인터랙션 사용자 목록 확인이 가능하며, 관리자 콘솔에서 전체적인 사용량 모니터링이 가능하다.

### 조사 항목 7: 위젯 드릴다운 인터랙션

ThoughtSpot Liveboard의 드릴다운은 핵심 차별화 요소다. 모든 시각화에서 데이터 포인트를 클릭하면 Drill Down이 가능하며, 깊이 제한이 없다. 예를 들어 "Revenue by Department" → Clothing 클릭 → "Revenue by Product Name" → 특정 제품 클릭 → "Revenue by Region"으로 계속 드릴다운할 수 있다. Answer Explorer를 통해 Liveboard 내에서 시각화를 인터랙티브하게 탐색할 수 있으며, 컬럼 추가/제거, 필터 변경 등이 가능하다. Undo/Redo/Reset 버튼이 각 시각화에 제공되어 탐색 중 이전 상태로 복귀할 수 있다. 필터링, 값 제외(Exclude Values) 등의 인터랙션도 시각화 레벨에서 직접 수행 가능하다. Liveboard에서 Spotter를 호출하여 시각화에 대해 자연어로 추가 질문을 할 수도 있다.

### 조사 항목 8: 다른 기능과의 연결 지점

- **Search/Spotter → Liveboard**: Answer를 Pin 버튼으로 Liveboard에 추가
- **SpotterViz Agent → Liveboard**: 자연어 프롬프트로 전체 Liveboard 자동 생성
- **SpotIQ → Liveboard**: SpotIQ 분석 결과가 새 Liveboard로 자동 생성됨
- **AI Highlights → Liveboard**: Liveboard 내에서 버튼 클릭으로 AI 요약 표시
- **SpotIQ Change Analysis → Liveboard 내 드릴다운**: 화면 전환 없이 원인 분석 진행
- **KPI Watchlist (Home) → Liveboard**: Home에서 추적 중인 KPI 클릭 시 원본 Liveboard로 이동
- **Liveboard → PDF/TML Export**: 대시보드를 PDF로 다운로드하거나 TML 파일로 내보내기(환경 간 마이그레이션)
- **Liveboard → 외부 공유**: Live Links로 URL 공유, 수신자가 자체 필터/드릴다운 적용 가능
- **Liveboard → 임베드**: SDK를 통해 외부 웹앱에 Liveboard 임베디드
- **SpotterModel → 데이터 모델**: 자연어로 시맨틱 모델 생성 → Liveboard의 데이터 기반이 됨
- **SpotterCode → 임베드 코드**: IDE에서 임베드 로직 자동 생성
- **Monitor Alerts → 이메일/모바일 푸시**: 알림이 발생하면 사용자에게 알림 → 관련 Liveboard로 이동 유도
- **Trending (Home 우측) → Liveboard**: 인기 Liveboard를 Home에서 바로 접근

---

## Databricks (AI/BI Dashboard + Genie)

### 조사 항목 1: 서비스 첫 접속 시 "홈" 화면 구성 요소

Databricks 워크스페이스에 로그인하면 좌측 사이드바에 Home, Workspace, Compute, Data, SQL, Machine Learning 등의 메뉴가 나열된다. Home 페이지에는 최근 작업한 노트북, 대시보드, 쿼리 등의 Recents 리스트와 Quick Actions(Create SQL Worksheet 등)가 표시된다. Databricks의 대시보드 진입점은 좌측 사이드바의 "Dashboards" 메뉴이다. 별도로 "Genie" 메뉴에서 AI/BI Genie 스페이스 목록에 접근할 수 있다.

### 조사 항목 2: "홈"과 "대시보드"의 관계

Databricks에서 Home과 Dashboard는 분리되어 있다. Home은 워크스페이스 전반의 최근 활동과 빠른 액세스를 제공하는 랜딩 페이지이고, Dashboards는 별도 메뉴로 대시보드 리스트를 보여준다. Databricks는 최근 비즈니스 사용자를 위한 "단일 장소(single place)"를 지향하며, AI/BI Dashboards와 Genie를 탐색하고 Databricks Apps를 사용할 수 있는 통합 비즈니스 사용자 허브를 발전시키고 있다.

### 조사 항목 3: 대시보드 내 위젯 유형과 커스터마이징 수준

Databricks AI/BI 대시보드는 SQL 쿼리 결과를 기반으로 다양한 시각화를 제공한다. 지원되는 차트 유형: Bar Chart, Line Chart, Area Chart, Pie Chart, Scatter Plot, Pivot Table, Table, Counter(단일 값 표시), Point Map, Heatmap 등. 텍스트 위젯도 지원하여 대시보드에 마크다운/HTML 형식의 설명을 추가할 수 있다(서식 지정, 링크 삽입, 이미지 삽입 기능이 최근 강화됨).

대시보드는 다중 페이지(Pages) 구조를 지원하며, 각 페이지에 독립적인 위젯 세트를 배치할 수 있다. 위젯과 페이지 간 복사/붙여넣기가 가능하다. 필터는 글로벌(대시보드 전체), 페이지 레벨, 위젯 레벨의 3단계로 적용 가능하다. Parameters를 SQL에 바인딩하여 동적 필터(드롭다운, 다중 선택, 날짜 선택기 등)를 구현할 수 있다. 테마 커스터마이징(색상 팔레트, 폰트, 배경 등)이 가능하며 조직 브랜딩에 맞출 수 있다. AI Assistant가 자연어 프롬프트로 SQL 쿼리를 생성하고 적절한 시각화를 자동 추천한다. AI_FORECAST() 함수를 통해 차트에 예측 트렌드 오버레이도 가능하다.

### 조사 항목 4: AI가 자동 생성한 인사이트의 대시보드 통합 방식

Databricks의 AI 인사이트는 주로 Genie를 통해 제공된다. Genie는 대시보드에 기본적으로 통합(embedded)되어 있다. 대시보드를 퍼블리시하면 자동으로 Companion Genie Space가 생성되며, 퍼블리시된 대시보드 뷰어는 "Ask Genie" 버튼을 클릭하여 대시보드 데이터에 대해 자연어로 추가 질문을 할 수 있다. Genie는 질문을 해석하여 SQL을 생성하고, 텍스트 요약 + 테이블 + 시각화로 응답한다. Genie의 Research Agent(Beta)는 가설 생성, SQL 실행, 분석 보고서 작성까지 자동으로 수행한다. AI/BI Dashboard의 AI Assistant는 대시보드 편집 시 자연어로 새 시각화를 생성하거나 기존 시각화를 수정할 수 있다.

### 조사 항목 5: 채팅/자연어 질문에서 생성된 분석 결과를 대시보드로 저장하는 경로

Genie Space에서의 대화 결과는 대시보드로의 직접 저장 경로가 다소 간접적이다. Genie는 대시보드의 Companion으로 존재하며, 질문-응답은 대화 기록(Chat History)으로 저장된다. Space Editor는 대화에서 대표적인 메시지나 SQL 답변을 Benchmark Questions로 저장할 수 있다. 그러나 Genie 대화 결과를 대시보드의 새 위젯으로 직접 "핀"하는 기능은 현재 관찰되지 않는다. 대신, AI Assistant를 통해 대시보드 편집 모드에서 자연어로 새 시각화를 추가하는 것이 실질적인 "대화 → 대시보드" 경로이다. Genie Conversation API를 통해 프로그래머틱으로 Genie 결과를 가져와 커스텀 앱/대시보드에 통합하는 것도 가능하다.

### 조사 항목 6: 모니터링(실행 로그, 사용량, 알림)이 대시보드와 통합인지 분리인지

Databricks에서 대시보드 자체에 대한 모니터링(누가 조회했는지, Genie 사용량 등)은 별도의 Monitoring 페이지에서 관리된다. Service Principal ID 표시, 사용량 추적 등이 이 모니터링 페이지에 표시된다. 대시보드는 Scheduled Refresh 기능을 지원하며, 스케줄된 대시보드 스냅샷을 이메일이나 Microsoft Teams 채널로 발송(Subscription)할 수 있다. 데이터 파이프라인 모니터링이나 Job 실행 로그는 Workflows 메뉴에서 별도로 관리된다. 대시보드와 모니터링은 분리 구조이지만, 대시보드에서 모니터링 관련 데이터를 SQL로 직접 쿼리하여 시각화하는 것은 가능하다.

### 조사 항목 7: 위젯 드릴다운 인터랙션

Databricks AI/BI 대시보드는 Cross-Filtering 기능을 지원한다. 하나의 시각화에서 데이터 포인트를 클릭하면 같은 페이지의 다른 시각화가 자동으로 필터링된다. 이를 통해 다중 시각화 간 상관관계를 인터랙티브하게 탐색할 수 있다. 또한, Ask Genie 버튼으로 특정 데이터 포인트에 대해 자연어로 추가 질문을 할 수 있어, 전통적인 "클릭 → 상세 화면" 드릴다운과는 다른 "대화형 드릴다운" 패턴을 제공한다. 필터와 파라미터를 조합하여 사용자가 슬라이서/드롭다운으로 데이터를 동적으로 탐색하는 것도 가능하다.

### 조사 항목 8: 다른 기능과의 연결 지점

- **AI Assistant → 대시보드**: 자연어 프롬프트로 SQL + 시각화 자동 생성
- **Genie Space ↔ 대시보드**: 대시보드 퍼블리시 시 Companion Genie Space 자동 생성; Ask Genie로 대시보드 데이터 탐색
- **SQL Editor → 대시보드**: 쿼리 결과를 대시보드 데이터셋으로 활용
- **Unity Catalog → 대시보드/Genie**: 테이블, 뷰, Metric View를 데이터 소스로 연결; 접근 제어 상속
- **Metric Views → 대시보드/Genie**: 재사용 가능한 KPI 정의를 중앙화하여 대시보드와 Genie에서 공유
- **대시보드 → Teams/Email Subscription**: 스케줄된 스냅샷(PNG+PDF)을 Teams 채널이나 이메일로 발송
- **Genie → Slack/Teams/커스텀 앱**: Genie Conversation API로 다양한 채널에서 대화형 분석
- **Genie → Databricks Apps**: Genie Space를 Databricks App 리소스로 추가하여 커스텀 앱에 통합
- **Notebook → 대시보드**: 노트북에서 생성한 시각화를 참조하거나, 노트북의 테이블 결과를 대시보드 데이터셋으로 활용
- **대시보드 → 임베디드**: iframe 임베딩 또는 Basic Embedding으로 외부 웹앱에 삽입
- **Databricks Asset Bundles → 대시보드**: CI/CD 파이프라인에서 대시보드 태스크를 프로그래머틱하게 배포

---

## Snowflake Snowsight

### 조사 항목 1: 서비스 첫 접속 시 "홈" 화면 구성 요소

Snowsight에 로그인하면 좌측에 네비게이션 메뉴가 표시되며, 주요 항목으로 Projects(Worksheets, Dashboards), Data(Databases), AI & ML, Monitoring, Admin 등이 있다. 홈 화면(Projects 기본 화면)에서는 최근 작업한 Worksheets와 Dashboards에 빠르게 접근할 수 있으며, Quick Actions으로 "Create SQL Worksheet"를 바로 실행할 수 있다. 2025년 5월부터 새로운 Snowsight 네비게이션 메뉴가 프리뷰로 제공되고 있으며, 8월부터 점진적으로 롤아웃되고 있다. 이 업데이트로 메뉴 구조가 재편되고 있다.

### 조사 항목 2: "홈"과 "대시보드"의 관계

Snowsight에서 Home(또는 Projects 랜딩)과 Dashboard는 분리되어 있다. 대시보드는 Projects → Dashboards 경로로 접근하며, Recent/Shared With Me/My Dashboards 탭으로 나뉜다. Home은 최근 활동 중심의 네비게이션 허브이고, 대시보드는 시각화 도구다. Snowflake Intelligence(ai.snowflake.com)는 비즈니스 사용자를 위한 별도의 에이전틱 경험으로, 대시보드와는 독립적인 인터페이스에서 자연어 데이터 분석을 제공한다.

### 조사 항목 3: 대시보드 내 위젯 유형과 커스터마이징 수준

Snowsight 대시보드는 "타일(Tile)" 기반 구조로, 각 타일은 SQL 워크시트의 쿼리 결과에서 생성된 차트 또는 테이블이다. 지원 차트 유형: Bar Chart, Line Chart, Scatterplot, Heatgrid, Scorecard(단일 값 표시). 이 목록은 다른 BI 도구에 비해 상당히 제한적이다(Pie Chart, Treemap, Funnel 등 미지원). 각 쿼리당 하나의 차트만 생성 가능하다. 타일은 드래그 앤 드롭으로 재배치할 수 있다.

커스터마이징: 차트 유형 변경, 축 라벨링, 방향(수직/수평), 그룹핑, 버케팅, 집계 유형 변경이 가능하다. Appearance 섹션에서 스타일을 조정할 수 있다. 대시보드 필터(Custom Filters)를 추가하여 타일을 동적으로 필터링할 수 있다. 차트는 PNG로 다운로드 가능하다. 그러나 조건부 서식, 커스텀 색상 팔레트, 주석(annotations) 등 고급 커스터마이징은 제한적이다. Snowflake 커뮤니티에서는 Snowsight 대시보드가 "간단한 검증 및 데이터 품질 확인"에 적합하며, 본격적인 BI 시각화에는 Power BI나 Tableau 같은 도구와의 연동을 권장하는 의견이 관찰된다.

### 조사 항목 4: AI가 자동 생성한 인사이트의 대시보드 통합 방식

Snowflake의 AI 인사이트는 Snowsight 대시보드에 직접 통합되기보다, Cortex AI 서비스와 Snowflake Intelligence를 통해 별도의 인터페이스에서 제공된다. Cortex Analyst는 시맨틱 모델 파일(YAML)을 기반으로 자연어를 SQL로 변환하며, 이 결과는 Streamlit 앱이나 Snowflake Intelligence 에이전트 인터페이스에서 표시된다. Cortex AI Functions(AI_SENTIMENT, AI_CLASSIFY 등)는 SQL 함수로 제공되어 워크시트에서 직접 호출할 수 있으며, 그 결과를 차트로 시각화한 뒤 대시보드 타일로 추가하는 것은 가능하다. 그러나 "AI가 자동으로 대시보드에 인사이트를 푸시"하는 패턴(ThoughtSpot의 AI Highlights 같은)은 Snowsight 대시보드에서 관찰되지 않는다.

### 조사 항목 5: 채팅/자연어 질문에서 생성된 분석 결과를 대시보드로 저장하는 경로

Snowflake Intelligence(에이전틱 경험)에서 자연어로 질의한 결과를 Snowsight 대시보드로 직접 저장하는 공식 경로는 현재 명확히 관찰되지 않는다. Cortex Analyst 결과는 주로 Streamlit 앱이나 노트북에서 소비된다. Snowsight 대시보드의 주요 경로는 "워크시트에서 SQL 실행 → 차트 생성 → 대시보드로 이동(Move to Dashboard)"이다. Cortex Code(AI 코딩 에이전트)는 Snowsight 워크스페이스에서 자연어로 SQL을 생성할 수 있으며, 이렇게 생성된 SQL을 워크시트에 적용하고 대시보드 타일로 추가하는 것이 가능한 간접 경로이다.

### 조사 항목 6: 모니터링(실행 로그, 사용량, 알림)이 대시보드와 통합인지 분리인지

Snowsight에서 쿼리 모니터링, 웨어하우스 성능 모니터링 등은 Monitoring 메뉴(Activity → Query History, Performance Explorer)에서 별도로 관리된다. AI Observability(Cortex AI 애플리케이션의 평가, 트레이싱)는 별도의 기능으로 2025년 7월에 GA되었다. 대시보드와 모니터링은 분리되어 있으나, ACCOUNT_USAGE 뷰를 SQL로 쿼리하여 사용량/비용 데이터를 대시보드 타일로 만들 수 있다.

### 조사 항목 7: 위젯 드릴다운 인터랙션

Snowsight 대시보드의 드릴다운은 제한적이다. 차트에서 특정 데이터 포인트를 클릭하여 하위 차원으로 드릴다운하는 네이티브 기능은 관찰되지 않는다. 타일을 클릭하면 해당 워크시트로 이동하여 쿼리를 수정/재실행할 수 있는 방식이 주된 인터랙션이다. 필터를 통한 동적 데이터 탐색은 가능하다. 이는 Snowsight 대시보드가 "간단한 시각화 도구"로 포지셔닝되어 있기 때문이며, 복잡한 드릴다운은 Streamlit 앱이나 외부 BI 도구에서 구현하도록 의도된 것으로 보인다.

### 조사 항목 8: 다른 기능과의 연결 지점

- **Worksheets → 대시보드**: 워크시트를 대시보드 타일로 이동(Move to); 워크시트에서 차트 생성 후 대시보드에 추가
- **Cortex Code → Worksheets → 대시보드**: AI가 생성한 SQL을 워크시트에 적용 → 차트 → 대시보드 타일
- **Cortex AI Functions → SQL 결과 → 대시보드**: AI_SENTIMENT, AI_FORECAST 등의 결과를 차트로 시각화
- **Snowflake Intelligence → 별도 인터페이스(ai.snowflake.com)**: 자연어 분석, 차트 생성, 트렌드 탐색 (대시보드와는 독립)
- **Cortex Agents → Teams/365 Copilot**: Microsoft Teams 인터페이스에서 Cortex Agent와 대화
- **대시보드 → 공유**: 공유 링크 생성, 역할 기반 접근 제어
- **ACCOUNT_USAGE → 대시보드**: SQL로 사용량/비용 데이터를 쿼리하여 자체 모니터링 대시보드 구축
- **Snowflake Trail → 모니터링**: 인프라/파이프라인 관찰 가능성(대시보드와 분리)

---

## Dify

### 조사 항목 1: 서비스 첫 접속 시 "홈" 화면 구성 요소

Dify에 로그인하면 "Studio" 화면이 기본 랜딩 페이지로 표시되며, 사용자가 만든 AI 앱(Chatbot, Agent, Workflow, Text Generation 등) 리스트가 카드 형태로 나열된다. 상단에는 앱 생성 버튼("Create from Blank", "Create from Template")이 위치한다. 좌측 사이드바에는 Studio(앱 리스트), Knowledge(지식 베이스 관리), Tools(플러그인/도구 관리), Explore(커뮤니티 앱 탐색) 등의 메뉴가 있다. 전통적인 "대시보드"라 불리는 중앙 요약 화면은 없으며, 앱 리스트가 사실상 홈 화면이다.

### 조사 항목 2: "홈"과 "대시보드"의 관계

Dify에서 "대시보드"는 전통적인 BI 대시보드가 아니라, 각 개별 앱의 "Overview" 섹션에 존재하는 분석 대시보드를 의미한다. 즉, 글로벌 홈 대시보드는 없고, 앱별 모니터링 대시보드가 앱 내부에 존재하는 구조다. 사용자는 특정 앱을 클릭 → Overview 탭에서 해당 앱의 사용량, 성과 지표를 확인한다. 홈 화면(Studio)은 앱 관리/네비게이션 허브이고, 분석 대시보드는 앱 컨텍스트 내에 내재(embedded)되어 있다.

### 조사 항목 3: 대시보드 내 위젯 유형과 커스터마이징 수준

Dify의 앱별 Overview 대시보드는 사전 정의된(pre-defined) 메트릭 위젯으로 구성된다. 표시되는 주요 메트릭: Total Messages(대화 볼륨), Active Users(의미 있는 인터랙션을 한 사용자), Average User Interactions(세션당 참여 깊이), Token Usage(리소스 소비 및 비용). 시간 선택기(Time Selector)로 기간별 트렌드를 조회할 수 있다. 이 위젯들은 고정 구성이며, 사용자가 커스텀 위젯을 추가하거나 레이아웃을 변경하는 기능은 관찰되지 않는다. Dify는 자체 대시보드 커스터마이징보다, 외부 관찰 가능성 플랫폼(Langfuse, LangSmith, Arize Phoenix/AX)과의 연동을 통한 심화 분석을 권장한다. "Tracing app performance" 링크를 클릭하여 외부 관찰 가능성 플랫폼을 연결할 수 있다. 자체 호스팅 환경에서는 Grafana + PostgreSQL 데이터 소스로 Dify 메트릭을 임포트하여 커스텀 대시보드를 구축하는 방법도 커뮤니티에서 제공된다.

### 조사 항목 4: AI가 자동 생성한 인사이트의 대시보드 통합 방식

Dify의 내장 대시보드에 AI가 자동 생성한 인사이트를 표면화하는 기능은 관찰되지 않는다. Dify의 AI 인사이트는 주로 외부 관찰 가능성 도구에 의존한다. Arize AX를 연동하면 프로덕션 데이터에 대한 실시간 평가(정확도, 안전성, 사용자 불만 등)를 자동으로 수행하고, 대시보드에서 메트릭 트렌드를 모니터링하며, 이상 변화를 감지하면 알림을 보낼 수 있다. Langfuse 연동 시에는 프롬프트 A/B 테스팅, 트레이스 분석 등이 가능하다. Dify 자체적으로는 LLMOps 수준의 로그/주석(Annotation) 기능을 제공하여, 입출력/토큰 소비/노드별 지속 시간을 기록한다.

### 조사 항목 5: 채팅/자연어 질문에서 생성된 분석 결과를 대시보드로 저장하는 경로

Dify는 AI 앱 개발 플랫폼이지 BI 도구가 아니므로, "채팅 결과를 대시보드에 저장"하는 전통적인 경로는 해당되지 않는다. Dify 내에서 사용자의 앱 인터랙션 로그는 "Logs" 탭에서 조회할 수 있으며, 이 로그 데이터가 Overview 대시보드의 집계 메트릭으로 반영된다. Workflow의 실행 이력(Run History)도 별도 탭에서 노드별 상세 실행 결과를 확인할 수 있다. 이러한 로그/이력 데이터를 외부 분석 도구(Grafana, Arize 등)로 보내 커스텀 대시보드를 구성하는 것이 실질적인 경로다.

### 조사 항목 6: 모니터링(실행 로그, 사용량, 알림)이 대시보드와 통합인지 분리인지

Dify에서 모니터링과 대시보드는 동일한 앱 컨텍스트 내에서 탭으로 구분되어 있다. 앱 내 탭 구조: Overview(대시보드 메트릭) / Logs(실행 로그) / Annotations(주석). Overview는 집계된 사용량 메트릭을, Logs는 개별 대화/실행의 상세 로그(입출력, 토큰, 지속 시간, 사용자 피드백)를 보여준다. 이 구조는 "대시보드와 로그가 같은 공간에 있지만 별도 탭"인 부분 통합 형태다. 알림(alerting) 기능은 Dify 자체에는 내장되어 있지 않으며, 외부 관찰 가능성 도구(Arize AX 등)에 의존한다.

### 조사 항목 7: 위젯 드릴다운 인터랙션

Dify의 Overview 대시보드는 사전 정의된 메트릭 차트로 구성되어 있어, 위젯 클릭으로 드릴다운하는 인터랙션은 관찰되지 않는다. 대시보드에서 특정 메트릭을 확인한 뒤, Logs 탭으로 전환하여 개별 대화/실행 기록을 상세 조회하는 것이 사실상의 드릴다운 경로다. Workflow의 경우 Run History에서 개별 실행을 클릭하면 노드별 실행 결과(입출력, 실행 시간, 토큰)를 트레이스 뷰로 확인할 수 있다.

### 조사 항목 8: 다른 기능과의 연결 지점

- **앱 실행 → Overview 대시보드**: UI/API를 통한 앱 사용이 자동으로 Overview 메트릭에 집계
- **앱 실행 → Logs**: 모든 대화/워크플로 실행이 Logs 탭에 자동 기록
- **Overview → 외부 관찰 가능성 플랫폼**: "Tracing app performance" 링크로 Langfuse/LangSmith/Arize 연결
- **Logs → Annotations**: 로그에서 특정 대화를 선택하여 주석 추가 → 프롬프트/데이터셋 개선에 활용
- **Workflow Editor → Run History**: 워크플로 편집 화면에서 실행 이력 탭으로 전환하여 디버깅
- **Self-hosted Grafana → PostgreSQL**: Dify 데이터베이스를 Grafana 데이터 소스로 연결하여 커스텀 모니터링 대시보드 구축
- **Plugin/MCP → 앱 기능 확장**: 외부 API/도구 연동이 앱 실행에 반영되고 이는 다시 로그/대시보드에 기록됨

---

## ServiceNow AI Control Tower

### 조사 항목 1: 서비스 첫 접속 시 "홈" 화면 구성 요소

ServiceNow AI Control Tower에 접근하면 중앙 관제 대시보드가 표시된다. 이 대시보드는 조직 전체의 AI 자산(에이전트, 모델, 워크플로)을 한눈에 볼 수 있는 "Single Pane of Glass" 인터페이스다. AI 전략 대시보드(Strategic Portfolio Management 통합)에서는 AI 이니셔티브의 목표 대비 진행 상황, 투자 현황, 로드맵이 표시된다. AI 리스크 & 컴플라이언스 랜딩 페이지에서는 개별 리스크(편향, 드리프트, 보안 등)를 집계한 엔터프라이즈 AI 리스크 프로파일이 표시된다. 최상위 레벨에서 AI 자산 인벤토리(CMDB 기반), 성과 메트릭, ROI 인사이트, 컴플라이언스 상태가 요약된다.

### 조사 항목 2: "홈"과 "대시보드"의 관계

ServiceNow AI Control Tower에서 "홈"은 곧 "대시보드"다. AI Control Tower 자체가 중앙 관제 대시보드로 설계되었으며, 별도의 "홈"과 "대시보드" 분리 없이 대시보드가 진입점이자 주 화면이다. 다만 AI Control Tower 내에서 여러 관점(Strategy, Governance, Operations, Value)의 하위 대시보드/워크스페이스로 나뉜다. Zurich 릴리스(2025년 12월 GA)에서는 AI Risk & Compliance Workspace가 추가되어, 중앙 대시보드에서 리스크/컨트롤/컴플라이언스를 집중 추적할 수 있다.

### 조사 항목 3: 대시보드 내 위젯 유형과 커스터마이징 수준

AI Control Tower의 대시보드는 ServiceNow Platform Analytics(PA) 기반으로 구성된다. 주요 위젯 유형: KPI 카드(핵심 성과 지표), 도넛/파이 차트(AI 자산 분포), 바 차트(투자/비용 분석), 시계열 차트(성과 트렌드), 리스크 스코어링 대시보드(시스템 전체 리스크 점수), 테이블(AI 자산 목록, 컴플라이언스 현황). Value Dashboard에서는 AI 도입률, 성과, ROI를 실시간으로 측정한다. AI Strategy Dashboard(SPM 통합)에서는 포트폴리오 뷰, 시나리오 계획이 표시된다.

커스터마이징: ServiceNow PA(Performance Analytics) 프레임워크 위에 구축되어 있으므로, ServiceNow에 익숙한 관리자는 PA 대시보드 빌더를 통해 커스텀 위젯을 추가하거나 기존 위젯을 수정할 수 있다. 그러나 AI Control Tower의 핵심 대시보드 구성은 사전 정의된 레이아웃을 따르며, C-Suite 수준의 요약 뷰에 최적화되어 있다.

### 조사 항목 4: AI가 자동 생성한 인사이트의 대시보드 통합 방식

AI Control Tower는 자체적으로 AI 성과에 대한 분석 인사이트를 생성한다. 모델 드리프트 감지(AI 정확도가 떨어지거나 행동이 변하면 알림 발생), 휴면/과권한 에이전트 탐지, 시스템 전체 리스크 스코어링이 자동으로 수행되며 대시보드에 반영된다. Proactive App Recommendations와 유사한 방식으로, 컴플라이언스 이슈나 성과 저하를 감지하면 대시보드에 경고가 표시된다. EU AI Act, NIST AI RMF 등의 규제 준수 상태도 자동으로 평가되어 대시보드에 통합된다.

### 조사 항목 5: 채팅/자연어 질문에서 생성된 분석 결과를 대시보드로 저장하는 경로

ServiceNow의 Now Assist(AI 어시스턴트)를 통한 자연어 질의 결과를 AI Control Tower 대시보드에 직접 저장하는 경로는 명확히 관찰되지 않는다. AI Control Tower는 주로 자동화된 워크플로와 데이터 수집을 통해 대시보드를 업데이트한다. AI 자산 등록(Onboarding), 리스크 평가, 사전 배포 리뷰 등이 워크플로를 통해 진행되며, 그 결과가 대시보드에 반영된다. Flow Designer와의 통합으로 이상 탐지 시 자동 교정 워크플로를 트리거할 수 있다.

### 조사 항목 6: 모니터링(실행 로그, 사용량, 알림)이 대시보드와 통합인지 분리인지

AI Control Tower는 모니터링과 대시보드가 완전히 통합된 구조다. 이것이 핵심 설계 원칙이다. 실시간 모니터링(보안, 거버넌스, 리스크)이 대시보드에 직접 표시되며, 알림(모델 드리프트, 컴플라이언스 위반 등)도 대시보드의 경고 시스템으로 통합된다. AI 에이전트 수명주기 전체(아이디어 → 배포 → 최적화 → 퇴역)가 대시보드에서 추적된다. CMDB(Configuration Management Database) 통합으로 모든 AI 자산의 메타데이터, 의존성, 비즈니스 서비스 매핑이 대시보드에서 조회 가능하다.

### 조사 항목 7: 위젯 드릴다운 인터랙션

AI Control Tower 대시보드에서 KPI 카드나 차트를 클릭하면 기저 보고서나 상세 워크스페이스로 이동할 수 있다. 예: 리스크 스코어 위젯 클릭 → 개별 AI 모델/에이전트의 상세 리스크 평가 화면으로 전환. AI 자산 목록에서 특정 에이전트 클릭 → 해당 에이전트의 메타데이터, 입출력 형식, 관련 리스크, 컴플라이언스 상태, 성과 이력 상세 뷰. Value Dashboard에서 특정 이니셔티브 클릭 → SPM의 상세 프로젝트 뷰로 이동.

### 조사 항목 8: 다른 기능과의 연결 지점

- **CMDB → AI Control Tower 대시보드**: 모든 AI 자산(모델, 에이전트, 데이터셋)이 CMDB에 등록되어 대시보드에 자동 표시
- **AI Agent Fabric → 대시보드**: 서드파티 에이전트(Microsoft Foundry, Copilot Studio 등)의 상태도 통합 관제
- **GRC(Governance, Risk, Compliance) → 대시보드**: 리스크 평가, 컴플라이언스 검사 결과가 대시보드에 실시간 반영
- **Strategic Portfolio Management → AI Strategy Dashboard**: 포트폴리오, 로드맵, 시나리오 계획이 AI Control Tower와 통합
- **Now Assist Skill Kit / AI Agent Studio → 대시보드**: ServiceNow 네이티브 AI의 모델 선택, 라우팅 거버넌스가 대시보드에서 모니터링됨
- **Flow Designer → 자동 교정**: 대시보드에서 이상 탐지 시 Flow Designer 워크플로로 자동 교정 액션 트리거
- **대시보드 → 알림**: 모델 드리프트, 컴플라이언스 위반 시 관련 이해관계자에게 알림 발송
- **외부 AI 플랫폼(Azure OpenAI, Google Gemini 등) → 대시보드**: 서드파티 AI 모델/서비스의 성과도 통합 모니터링
- **Zurich 릴리스 AI Risk & Compliance Workspace → 대시보드**: 중앙화된 리스크/컨트롤/컴플라이언스 추적

---

## Salesforce Agentforce

### 조사 항목 1: 서비스 첫 접속 시 "홈" 화면 구성 요소

Salesforce의 홈 화면은 기본적으로 Salesforce CRM의 Home 탭이며, 어시스턴트(Activity Timeline), 최근 레코드, 대시보드 스냅샷, 뉴스 피드 등이 표시된다. Agentforce와 관련된 대시보드는 별도로 접근해야 하며, Agentforce Studio가 에이전트 빌드/테스트/최적화의 중심 허브 역할을 한다. Agentforce Analytics(기존 Legacy)는 Dashboard 탭의 "Agentforce (Default)" 폴더에서 접근하며, 새로운 Agentforce Observability는 Agentforce Studio 내에 통합되어 있다.

### 조사 항목 2: "홈"과 "대시보드"의 관계

Salesforce에서 CRM Home과 Agentforce 대시보드는 분리되어 있다. CRM Home은 영업/서비스 활동 중심의 랜딩이고, Agentforce 대시보드는 Agentforce Studio 내의 Observability 도구이다. Agentforce 3에서 도입된 "Command Center"는 별도의 집중 대시보드로, 에이전트 도입률, 피드백, 성공률, 비용, 토픽 성과를 추적한다. Service Cloud에서는 실시간 월보드(Wallboard)에 AI 에이전트와 인간 에이전트의 활동이 함께 표시되어, 컨택 센터 수퍼바이저가 한 화면에서 양쪽을 모니터링할 수 있다.

### 조사 항목 3: 대시보드 내 위젯 유형과 커스터마이징 수준

Agentforce Analytics/Observability는 Tableau 기반 시각화를 활용한다. 주요 위젯/메트릭:

Agent Analytics: 에이전트별 사용량, 효과성, 고객 피드백, KPI 트렌드(시간 경과에 따른 성과 변화), 비효율 토픽/액션 식별, Deflection Rate(편향률), Abandonment(이탈), Escalation(에스컬레이션) 등.

Agent Optimization: 세션 레벨 트레이싱(사용자 발화, LLM 호출, 도구 실행, 가드레일 체크, 응답 타이밍), 인텐트 클러스터링(프로덕션 사용 패턴 자동 분류), 품질 점수.

Agent Health Monitoring: 에이전트 에러율, 평균 인터랙션 레이턴시를 5분 간격으로 추적하는 실시간 대시보드. 커스텀 임계값 알림 설정 가능.

Command Center(Agentforce 3): 에이전트 도입률, 성공률, 비용, 토픽 성과를 종합하는 구성 가능한 대시보드.

Credit Consumption 모니터링: 에이전트별 크레딧 소비량, 사용 트렌드를 추적하여 ROI 산정.

커스터마이징: Legacy Analytics는 Data 360 리포트 기반이므로 리포트를 복제하여 수정할 수 있다. 각 부서(영업, 서비스, 마케팅 등)가 자체 메트릭에 맞는 대시보드를 커스터마이징할 수 있다. Agent Health Monitoring에서는 채널(웹, 이메일 등), 에이전트 유형별 필터링이 가능하다.

### 조사 항목 4: AI가 자동 생성한 인사이트의 대시보드 통합 방식

Agentforce Observability의 Agent Optimization 기능은 AI가 프로덕션 데이터를 분석하여 자동으로 인사이트를 생성한다. 인텐트 클러스터링이 자동으로 수행되어 "실제 사용자가 무엇을 질문하는가"를 패턴으로 분류하며, 이 결과가 대시보드에 표시된다. 비효율적인 토픽, 액션, 플로를 자동으로 식별(Actionable Insights)하고 개선을 위한 단계를 사전 제안한다. Agent Health Monitoring은 이상 탐지 시 자동 알림을 발송한다. Session Tracing Data Model이 모든 에이전트 활동을 기록하여 Agent Analytics가 Tableau 기반 시각화로 자동 요약한다.

### 조사 항목 5: 채팅/자연어 질문에서 생성된 분석 결과를 대시보드로 저장하는 경로

Agentforce에서 "채팅 결과 → 대시보드 저장"의 직접적인 경로는 에이전트 관점에서 관찰된다. 모든 에이전트 인터랙션(채팅)은 Session Tracing Data Model을 통해 Data 360에 자동 저장된다. 이 데이터가 Agent Analytics와 Agent Optimization의 대시보드를 구동한다. 즉, "채팅 → 자동 기록 → 대시보드 자동 반영" 경로가 존재한다. Salesforce CRM의 Reports & Dashboards 기능을 통해 Data 360 데이터를 기반으로 커스텀 리포트/대시보드를 생성하는 것도 가능하다.

### 조사 항목 6: 모니터링(실행 로그, 사용량, 알림)이 대시보드와 통합인지 분리인지

Agentforce Observability는 모니터링, 분석, 최적화를 단일 스튜디오(Agentforce Studio) 내에 통합한다. Agent Analytics(분석 대시보드), Agent Optimization(세션 트레이싱/인텐트 클러스터링), Agent Health Monitoring(실시간 헬스 체크 + 알림)이 모두 Agentforce Studio의 하위 기능으로 존재한다. 알림은 이메일로 발송되며, 쿨다운 기간(기본 30분)이 설정된다. 외부 모니터링 도구(Datadog, Splunk, Wayfound, Arize)와도 OpenTelemetry 기반으로 통합 가능하다. Service Cloud의 월보드에서는 AI 에이전트와 인간 에이전트의 활동이 나란히 표시된다.

### 조사 항목 7: 위젯 드릴다운 인터랙션

Agentforce Analytics의 각 대시보드 위젯에는 기저 리포트로의 링크가 포함되어 있어, 위젯 클릭 시 상세 리포트로 이동할 수 있다. Agent Optimization에서는 특정 세션 클릭 → 해당 세션의 전체 추론 체인(사용자 입력, LLM 호출, 도구 실행, 가드레일 체크, 응답) 단계별 트레이스 뷰로 전환. 인텐트 클러스터에서 특정 클러스터 클릭 → 해당 인텐트에 속하는 세션들의 상세 리스트로 드릴다운. Health Monitoring에서 에러 스파이크 구간 클릭 → 해당 시간대의 세션 트레이스로 이동하여 원인 분석.

### 조사 항목 8: 다른 기능과의 연결 지점

- **에이전트 인터랙션(채팅) → Session Tracing Data Model(Data 360) → Agent Analytics/Optimization 대시보드**: 모든 에이전트 활동이 자동으로 기록되어 대시보드에 반영
- **Agent Health Monitoring → 이메일 알림**: 에러율/레이턴시 임계값 초과 시 자동 알림
- **Agentforce Studio → Agent Optimization**: 빌드/테스트 → 배포 → 최적화의 수명주기가 Studio 내에서 통합
- **Agent Optimization → 에이전트 구성 수정**: 인사이트를 바탕으로 토픽, 액션, 가드레일을 직접 조정
- **Session Tracing → 외부 도구(Datadog, Splunk, Wayfound, Arize)**: OpenTelemetry 기반으로 기존 모니터링 스택에 에이전트 시그널 통합
- **MuleSoft Agent Fabric → 대시보드**: 에이전트 등록, ID, 정책 관리가 중앙화되어 대시보드에서 관제
- **Service Cloud 월보드 → AI 에이전트 + 인간 에이전트 통합 뷰**: 컨택 센터 수퍼바이저가 양쪽을 동시에 모니터링
- **Agentforce 3 Command Center → 부서별 커스텀 대시보드**: 영업/서비스/마케팅 등 각 부서가 자체 메트릭 대시보드 구성
- **Credit Consumption → ROI 산정**: 에이전트별 크레딧 소비를 비즈니스 성과에 매핑
- **AgentExchange(마켓플레이스) → 에이전트 배포 → 대시보드 모니터링**: 마켓플레이스에서 찾은 에이전트도 동일한 관찰 가능성 프레임워크 적용

---

## 시각 자료 모음

### Datadog

- [Datadog 대시보드 제품 페이지 — 위젯 그리드와 다양한 시각화 유형의 실 화면 스크린샷 포함](https://www.datadoghq.com/product/platform/dashboards/) — 반응형 그리드 레이아웃, 드래그 앤 드롭 위젯 편집, 다양한 차트 유형의 실제 대시보드 구성을 확인할 수 있음
- [Datadog 대시보드 공식 문서 — 위젯 설정, 데이터 소스, 커스터마이징 가이드](https://docs.datadoghq.com/dashboards/) — 위젯 유형 전체 목록과 설정 화면 캡처 포함
- [Datadog 블로그: 새 대시보드 경험 — Screenboard와 Timeboard 통합 과정](https://www.datadoghq.com/blog/datadog-dashboards/) — Screenboard/Timeboard 통합 전후 비교, 그룹 위젯, 고밀도 모드 등의 시각적 예시
- [Bits AI 공식 문서 — 자연어 대시보드 생성, 챗 인터페이스](https://docs.datadoghq.com/bits_ai/bits_assistant/) — Bits AI 챗 패널과 자연어 → 위젯/대시보드 생성 흐름
- [Datadog 블로그: DASH 2025 키노트 라운드업 — 최신 AI 기능 업데이트](https://www.datadoghq.com/blog/dash-2025-new-feature-roundup-keynote/) — Bits AI SRE, 자연어 앱 빌더, MCP 서버 등 최신 기능의 데모 설명

### ThoughtSpot (Spotter3 / Liveboard / SpotIQ)

- [ThoughtSpot Liveboard 공식 문서 — Liveboard 구조, Pin 흐름, 탭, AI Highlights](https://docs.thoughtspot.com/cloud/latest/liveboard) — Liveboard 화면 구성, Pin 버튼 위치, 탭 구조의 UI 스크린샷 확인 가능
- [ThoughtSpot AI Highlights 공식 문서 — SpotIQ AI 요약, Change Analysis](https://docs.thoughtspot.com/cloud/10.8.0.cl/liveboard-ai-highlights) — AI Highlights 버튼, 예상/비예상 변화 분류 화면
- [ThoughtSpot SpotIQ 제품 페이지 — 자동 인사이트, 예측, 이상 탐지](https://www.thoughtspot.com/product/analytics/spotiq) — SpotIQ의 AI 인사이트 표면화 방식과 Liveboard 통합 데모
- [ThoughtSpot Home 페이지 공식 문서 — Home 화면 구성, KPI Watchlist, 검색 바](https://docs.thoughtspot.com/cloud/10.14.0.cl/thoughtspot-one-homepage) — Home 페이지의 구성 요소(검색 바, KPI, 최근 활동, 트렌딩)
- [ThoughtSpot Agents(Spotter3, SpotterViz) 제품 페이지 — BI 에이전트 개요](https://www.thoughtspot.com/product/agents) — SpotterViz의 자연어 → Liveboard 자동 생성 흐름
- [ThoughtSpot G2 리뷰 — 실 사용자 피드백과 화면 캡처](https://www.g2.com/products/thoughtspot/reviews) — 실 사용 환경에서의 Liveboard/SpotIQ 사용 사례

### Databricks (AI/BI Dashboard + Genie)

- [Databricks AI/BI Dashboard 제품 페이지 — AI 어시스티드 시각화, Cross-Filtering](https://www.databricks.com/product/business-intelligence/ai-bi-dashboards) — 대시보드 편집 화면, AI Assistant 프롬프트, 크로스 필터링 데모
- [Databricks Genie 제품 페이지 — 자연어 분석, Dashboard Genie 통합](https://www.databricks.com/product/business-intelligence/genie) — Genie 대화 인터페이스, Ask Genie 버튼이 대시보드에 통합된 화면
- [Databricks AI/BI Genie GA 블로그 — Genie 아키텍처, Companion Space](https://www.databricks.com/blog/aibi-genie-now-generally-available) — Genie와 대시보드의 통합 구조 설명과 UI 스크린샷
- [Databricks 대시보드 공식 문서 — 데이터셋, 시각화, 필터 가이드](https://docs.databricks.com/aws/en/dashboards/) — 대시보드 생성 흐름, 위젯 유형, 필터 계층 구조
- [Databricks AI/BI 릴리스 노트 2025 — 최신 기능 업데이트](https://docs.databricks.com/aws/en/ai-bi/release-notes/2025) — 위젯 복사/붙여넣기, Teams 구독, 시맨틱 메타데이터 등 최신 기능

### Snowflake Snowsight

- [Snowsight 대시보드 공식 문서 — 타일 추가, 차트 설정, 공유](https://docs.snowflake.com/en/user-guide/ui-snowsight-dashboards) — 대시보드 생성 흐름, 타일 추가, 컨텍스트 셀렉터 UI
- [Snowflake Cortex AI 제품 페이지 — Cortex 서비스 개요](https://www.snowflake.com/en/product/features/cortex/) — Cortex AI의 범위(LLM 함수, Cortex Analyst, 에이전트 등)
- [Snowflake Summit 2025 하이라이트 블로그 — Intelligence, Cortex Agents 발표](https://www.snowflake.com/en/blog/announcements-snowflake-summit-2025/) — Snowflake Intelligence(ai.snowflake.com)의 에이전틱 경험 소개
- [Hevo 블로그: Snowsight 대시보드 가이드 — 차트 유형, 대시보드 생성 단계별 설명](https://hevodata.com/learn/snowflake-dashboards/) — Snowsight의 차트 유형, Inspector 패널, 대시보드 생성 과정을 상세 설명

### Dify

- [Dify 공식 문서: Dashboard(Analysis) — Overview 대시보드 메트릭](https://docs.dify.ai/en/use-dify/monitor/analysis) — Total Messages, Active Users, Token Usage 등의 대시보드 구성
- [Dify 공식 사이트 — 플랫폼 개요, 워크플로 편집기, 관찰 가능성](https://dify.ai/) — 비주얼 워크플로 빌더, 모델 관리, 모니터링 기능의 스크린샷
- [Dify GitHub — 아키텍처, Grafana 통합, 배포 가이드](https://github.com/langgenius/dify) — Grafana 대시보드 임포트, PostgreSQL 데이터 소스 설정
- [Dify x Arize 블로그 — 외부 관찰 가능성 도구 연동](https://dify.ai/blog/dify-arize-how-to-evaluate-monitor-and-improve-agents) — Arize AX와의 연동 흐름, 프로덕션 모니터링 대시보드

### ServiceNow AI Control Tower

- [ServiceNow AI Control Tower 제품 페이지 — 중앙 관제 대시보드 개요](https://www.servicenow.com/products/ai-control-tower.html) — AI Control Tower의 핵심 기능과 대시보드 UI
- [ServiceNow 뉴스룸: AI Control Tower 출시 보도자료 — 기능 상세](https://newsroom.servicenow.com/press-releases/details/2025/ServiceNow-Launches-AI-Control-Tower-a-Centralized-Command-Center-to-Govern-Manage-Secure-and-Realize-Value-From-Any-AI-Agent-Model-and-Workflow/default.aspx) — 주요 기능(실시간 리포팅, 거버넌스, 수명주기 관리) 공식 설명
- [ServiceNow 커뮤니티: Zurich 릴리스 AI Control Tower — 최신 업데이트](https://www.servicenow.com/community/grc-blog/servicenow-ai-control-tower-in-the-zurich-release-mastering-ai/ba-p/3365258) — AI Strategy Dashboard, Risk & Compliance Workspace 스크린샷
- [eesel.ai 블로그: ServiceNow AI Control Tower 2025 개요 — 아키텍처 분석](https://www.eesel.ai/blog/servicenow-ai-control-tower) — Risk & Compliance 탭, Value Dashboard 스크린샷 포함

### Salesforce Agentforce

- [Salesforce Agentforce Observability 제품 페이지 — Agent Analytics, Optimization, Health Monitoring](https://www.salesforce.com/agentforce/observability/?bc=OTH) — Agentforce Observability의 전체 기능과 대시보드 UI
- [Salesforce 블로그: Agent Health Monitoring — 실시간 헬스 대시보드](https://www.salesforce.com/blog/agent-monitoring/?bc=OTH) — 5분 간격 메트릭 추적, 알림 설정 화면
- [Salesforce 뉴스: Agentforce 3 발표 — Command Center, MCP, 100+ 산업별 액션](https://www.salesforce.com/news/press-releases/2025/06/23/agentforce-3-announcement/) — Command Center 대시보드, 월보드, 관찰 가능성 기능 설명
- [Salesforce 뉴스: Agentforce Studio Observability 도구 — 세션 트레이싱, 인텐트 클러스터링](https://www.salesforce.com/news/stories/agentforce-studio-observability-tools-announcement/?bc=OTH) — Agent Optimization 화면(인텐트 클러스터), Session Tracing Data Model 구조
- [Trailhead: Agentforce Analytics and Monitoring — 학습 모듈](https://trailhead.salesforce.com/content/learn/modules/agentforce-analytics-and-monitoring/check-on-your-agent-using-analytics) — Legacy Agentforce Analytics 대시보드, Data 360 리포트 연결 방식
