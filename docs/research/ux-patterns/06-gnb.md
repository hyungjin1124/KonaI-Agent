# 엔터프라이즈 AI 에이전트 플랫폼 GNB 구조 비교 분석

> 조사 일자: 2026-03-20
> 목적: 엔터프라이즈 AI 에이전트 플랫폼 IA 설계를 위한 벤치마킹
> 현재 메뉴 후보 (7개): 홈/대시보드, AI 채팅(확정), 데이터, 스킬, 예약 작업, 관리자(고객사용), 플랫폼 관리(서비스 제공자용)

---

## 1. OpenAI Frontier

### 조사 항목 1: GNB 유형
OpenAI Frontier는 2026년 2월 출시된 초기 단계의 엔터프라이즈 플랫폼으로, 제한된 고객(Uber, State Farm, Intuit 등)에게만 제공 중이다. 퍼블릭 UI가 공개되지 않은 상태이며, Forward Deployed Engineers(FDE)가 직접 고객사에 배치되어 아키텍처 설계를 지원하는 형태로 운영된다. 공개된 자료 기준으로 Agent Builder라는 비주얼 캔버스와 SDK 기반 프로그래매틱 제어 두 가지 개발 경로가 존재하나, 이 둘은 아직 양방향 동기화가 되지 않는다.

### 조사 항목 2: 최상위 메뉴 항목
공개된 정보로는 정확한 GNB 메뉴 목록 확인 불가. 다만 다음 핵심 기능 영역이 확인됨: Agent Builder(에이전트 빌더), Agent Identity & Access Management(에이전트 IAM), Monitoring & Audit Logs(모니터링/감사 로그), Evaluation Tools(평가 도구), ChatKit(임베더블 채팅 위젯). 기존 ChatGPT Enterprise 및 API Platform(platform.openai.com)의 사이드바에는 Home, Playground, Assistants, Fine-tuning, Batches, Storage, Usage, API Keys 등이 포함되어 있다.

### 조사 항목 3: 메뉴 개수
Frontier 자체 UI는 비공개. OpenAI API Platform 기준으로 좌측 사이드바에 약 10~12개 항목.

### 조사 항목 4: 메뉴 그루핑 원칙
OpenAI API Platform은 "빌드 도구(Playground, Assistants, Fine-tuning)" → "운영(Batches, Storage)" → "관리(Usage, API Keys, Settings)" 순서로 배열된다. Frontier는 에이전트 생명주기(빌드 → 온보딩 → 배포 → 모니터링)에 따른 그루핑이 예상된다.

### 조사 항목 5: 하위 메뉴 깊이와 관리 방식
API Platform은 1단계 사이드바 + 페이지 내 탭(예: Usage 페이지 내 Scale Tier, 모델별 필터링) 구조. Frontier에서는 Agent Builder 내에서 캔버스 기반 워크플로우 편집이 별도 컨텍스트로 동작한다.

### 조사 항목 6: "설정"의 위치와 하위 구조
API Platform 기준 Settings는 좌측 사이드바 하단에 위치. 하위에 Organization, Team, Billing, Limits, Safety 등이 포함된다.

### 조사 항목 7: 스킬/플러그인/확장 기능이 최상위 메뉴에 있는지
MCP(Model Context Protocol) 지원을 통해 Gmail, Google Drive, Zapier 등과의 표준화된 통합을 제공하나, "플러그인" 또는 "스킬"이라는 독립 최상위 메뉴로 존재하지 않는다. 에이전트별 설정 내에서 도구(Tools)로 연결한다.

### 조사 항목 8: 예약 작업/자동화가 어디에 위치하는지
Frontier에서는 에이전트가 Atlas(워크플로우 엔진)를 통해 자동화를 수행한다. 별도 "예약 작업" 메뉴보다는 에이전트 빌더 내의 트리거/스케줄 설정으로 처리되는 구조.

### 조사 항목 9: 플랫폼/서비스 제공자 관리가 같은 앱에 있는지 별도인지
Frontier는 고객사에 배포되는 단일 플랫폼이며, OpenAI의 내부 관리(모델 업데이트, 인프라)는 별도 시스템에서 이루어진다. 고객사 IT 관리자용 관리 콘솔은 기존 ChatGPT Enterprise Admin 콘솔이 통합 형태로 존재한다.

### 다른 기능과의 연결 지점
- Agent Builder → Monitoring: 에이전트 빌드 후 트레이싱/로그로 자동 연결
- Agent Builder → ChatGPT: 빌드된 에이전트가 ChatGPT 인터페이스 내에서 직접 접근 가능
- Monitoring → Evaluation: 모니터링 데이터를 기반으로 평가 도구에서 성능 최적화

---

## 2. Coze (ByteDance)

### 조사 항목 1: GNB 유형
좌측 사이드바 방식. Coze는 에이전트 개발 플랫폼(coze.com)과 사용자향 오피스 플랫폼(Coze Space, space.coze.cn) 두 가지 제품 라인이 존재한다. 오픈소스 버전(Coze Studio)은 React + TypeScript 프론트엔드, Go 백엔드 기반이다.

### 조사 항목 2: 최상위 메뉴 항목
Coze 개발 플랫폼 기준: Home(홈), Bots(봇/에이전트 목록), Workspace(워크스페이스), Plugins(플러그인), Workflows(워크플로우), Knowledge(지식 베이스), 아이콘+텍스트 병행 사용. 에이전트 설정 페이지 진입 시 좌측에 Persona & Prompt, Skills, Preview & Debug 3개 패널이 나타난다.

### 조사 항목 3: 메뉴 개수
좌측 사이드바 최상위 약 6~8개 항목.

### 조사 항목 4: 메뉴 그루핑 원칙
"자산(Bots, Plugins, Workflows, Knowledge)" → "탐색(Bot Store, Templates)" → "관리(Workspace, Settings)" 순서. 개발 자산과 탐색을 분리하는 구조.

### 조사 항목 5: 하위 메뉴 깊이와 관리 방식
봇 선택 시 에이전트 구성 페이지로 진입하며, 여기서 Persona & Prompt, Skills(플러그인/워크플로우/지식 베이스 연결), Preview & Debug가 페이지 내 패널 형태로 제공된다. 2단계 깊이.

### 조사 항목 6: "설정"의 위치와 하위 구조
워크스페이스 수준 설정은 사이드바 하단의 프로필/설정 아이콘에서 접근. 에이전트별 설정은 에이전트 구성 페이지 내에서 관리.

### 조사 항목 7: 스킬/플러그인/확장 기능이 최상위 메뉴에 있는지
Plugins가 최상위 메뉴에 독립 항목으로 존재한다. 60개 이상의 내장 플러그인과 MCP Square(MCP 생태계)를 지원한다.

### 조사 항목 8: 예약 작업/자동화가 어디에 위치하는지
Workflows가 최상위 메뉴에 독립 항목으로 존재한다. 워크플로우 내에서 스케줄/트리거를 설정할 수 있다.

### 조사 항목 9: 플랫폼/서비스 제공자 관리가 같은 앱에 있는지 별도인지
Coze Studio(오픈소스)와 Coze Loop(최적화/모니터링)가 별도 제품으로 분리되어 있다. 플랫폼 관리는 별도 시스템.

### 다른 기능과의 연결 지점
- Bots → Plugins: 봇 구성 내 Skills 패널에서 플러그인 연결
- Bots → Knowledge: 봇 구성 내에서 지식 베이스 연결
- Bots → Workflows: 봇이 워크플로우를 호출하는 구조
- Workflows → Plugins: 워크플로우 노드에서 플러그인 사용

---

## 3. Dify

### 조사 항목 1: GNB 유형
좌측 사이드바 방식. 오픈소스 AI 애플리케이션 개발 플랫폼으로 비주얼 워크플로우 빌더를 제공한다.

### 조사 항목 2: 최상위 메뉴 항목
Studio(스튜디오 — 앱 목록/빌드), Knowledge(지식 베이스), Tools(도구/플러그인), Discover(탐색 — 팀 공개 앱), 아이콘+텍스트 병행. 하단에 Workspace 선택기와 Settings.

### 조사 항목 3: 메뉴 개수
최상위 메뉴 4~5개(Studio, Knowledge, Tools, Discover + Settings).

### 조사 항목 4: 메뉴 그루핑 원칙
"빌드(Studio)" → "자산(Knowledge, Tools)" → "탐색(Discover)" → "관리(Settings)" 순서. 매우 간결한 구조로 핵심 기능에 집중한다.

### 조사 항목 5: 하위 메뉴 깊이와 관리 방식
Studio에서 앱 선택 시 워크플로우 캔버스, 프롬프트 에디터, 로그, API 접근 등이 페이지 내 탭으로 제공된다. 앱 유형(Chatflow, Workflow, Agent 등) 선택 후 비주얼 캔버스에서 노드 기반 편집. 2~3단계 깊이.

### 조사 항목 6: "설정"의 위치와 하위 구조
좌측 사이드바 최하단에 위치. 하위에 Workspace(멤버, 모델 프로바이더 설정), Account(개인 설정), 모델 프로바이더(LLM 연결), Data Source, API Extension 등이 포함된다.

### 조사 항목 7: 스킬/플러그인/확장 기능이 최상위 메뉴에 있는지
Tools가 최상위 메뉴에 독립 항목으로 존재한다. 내장 도구 및 커스텀 도구를 관리한다.

### 조사 항목 8: 예약 작업/자동화가 어디에 위치하는지
별도 예약 작업 메뉴는 없다. 워크플로우 내에서 트리거 노드(Webhook, Schedule 등)를 설정하며, 최근 Human-in-the-Loop(HITL) 노드가 추가되었다. 실행 이력은 앱 상세 페이지의 Logs 탭에서 확인.

### 조사 항목 9: 플랫폼/서비스 제공자 관리가 같은 앱에 있는지 별도인지
커뮤니티 에디션은 단일 워크스페이스. 클라우드 서비스에서는 멀티 워크스페이스를 지원하며, 관리자 기능이 같은 앱 내 Settings에 통합되어 있다. 서비스 제공자 관리는 별도.

### 다른 기능과의 연결 지점
- Studio(앱) → Knowledge: 앱 빌드 시 지식 베이스를 RAG 노드로 연결
- Studio(앱) → Tools: 워크플로우 노드에서 도구 호출
- Studio(앱) → Logs: 앱 상세 페이지 내 탭 전환

---

## 4. Microsoft Copilot Studio

### 조사 항목 1: GNB 유형
좌측 사이드바 + 에이전트 내부 상단 탭 혼합 방식. Power Platform 생태계 내에 위치하며 copilotstudio.microsoft.com에서 접근한다.

### 조사 항목 2: 최상위 메뉴 항목
좌측 사이드바: Home(홈), Create(생성), Agents(에이전트 목록), Library(커넥터 라이브러리). 에이전트 선택 후 상단 탭: Overview(개요), Knowledge(지식), Topics(토픽), Tools(도구), Actions(액션), Analytics(분석), Channels(채널), Settings(설정). 2026년 2월 신규 빌더 UI가 GA되었다.

### 조사 항목 3: 메뉴 개수
좌측 사이드바 4개 + 에이전트 내부 상단 탭 7~8개.

### 조사 항목 4: 메뉴 그루핑 원칙
좌측 사이드바는 "탐색/생성(Home, Create)" → "자산(Agents, Library)"으로 단순하게 구성. 에이전트 내부 탭은 "구성(Overview, Knowledge, Topics, Tools, Actions)" → "운영(Analytics, Channels)" → "관리(Settings)"으로 에이전트 생명주기 기반 배열.

### 조사 항목 5: 하위 메뉴 깊이와 관리 방식
에이전트 내부에서 상단 탭 → 페이지 내 세부 설정(예: Topics 탭에서 비주얼 캔버스 진입) 구조. Topics에서는 드래그&드롭 비주얼 디자이너로 대화 흐름을 설계한다. Generative AI 설정은 Settings 탭 내 서브 페이지. 3단계 깊이.

### 조사 항목 6: "설정"의 위치와 하위 구조
에이전트 내부 상단 탭의 마지막(또는 우측 상단 기어 아이콘)에 위치. 하위에 Generative AI(오케스트레이션 모드, 콘텐츠 모더레이션), Security(공유, 인증), Languages, Skills(Bot Framework 연결), Entities 등이 포함된다.

### 조사 항목 7: 스킬/플러그인/확장 기능이 최상위 메뉴에 있는지
Skills는 에이전트 내부 Settings 하위에 위치한다. Tools 탭이 에이전트 상단 탭에 별도로 존재하며, 여기서 Power Platform 커넥터, REST API, MCP 서버, 프롬프트, Agent Flows를 연결한다. Library(커넥터 라이브러리)는 좌측 사이드바 최상위에 있다.

### 조사 항목 8: 예약 작업/자동화가 어디에 위치하는지
별도 예약 작업 메뉴는 없다. Topics 내에서 트리거 기반 자동 실행을 설정하며, 자율(Autonomous) 에이전트는 이벤트 트리거로 동작한다. Power Automate와 통합하여 자동화 플로우를 구성한다.

### 조사 항목 9: 플랫폼/서비스 제공자 관리가 같은 앱에 있는지 별도인지
Microsoft Power Platform Admin Center가 별도 관리 포털로 존재한다. 환경(Environment) 관리, 거버넌스, DLP 정책 등은 Admin Center에서 처리. Copilot Studio 내에서는 에이전트 수준 관리만 가능.

### 다른 기능과의 연결 지점
- Agents → Topics: 에이전트 선택 후 Topics 탭에서 대화 흐름 설계
- Agents → Knowledge: 에이전트 내 Knowledge 탭에서 데이터 소스 연결
- Agents → Analytics: 에이전트 내 Analytics 탭에서 성능 모니터링
- Agents → Channels: 에이전트 내 Channels 탭에서 배포 채널 구성(Teams, WhatsApp 등)
- Library → Agents: 커넥터를 에이전트의 Tools/Actions에 연결

---

## 5. ChatGPT

### 조사 항목 1: GNB 유형
좌측 사이드바 방식. 대화 이력 중심의 채팅 인터페이스.

### 조사 항목 2: 최상위 메뉴 항목
좌측 사이드바: 새 채팅 버튼, 채팅 히스토리(날짜별 그루핑), Projects(프로젝트), GPTs(커스텀 GPT), Sora(비디오 생성). 하단에 사용자 프로필, Settings. 최근 Agent Store가 M365 Copilot Chat 내 좌측 내비게이션에 추가됨.

### 조사 항목 3: 메뉴 개수
최상위 고정 항목 약 4~5개(새 채팅, Projects, GPTs, Sora + 프로필/설정). 나머지는 대화 히스토리.

### 조사 항목 4: 메뉴 그루핑 원칙
"생성(새 채팅)" → "기록(대화 히스토리)" → "자산(Projects, GPTs)" → "도구(Sora)" 순서. 대화 이력이 중앙을 차지하며 기능 메뉴는 최소화.

### 조사 항목 5: 하위 메뉴 깊이와 관리 방식
대화 히스토리는 날짜별 그루핑(오늘, 어제, 7일 전 등). GPTs 진입 시 GPT Store/My GPTs로 분기. 1~2단계로 매우 얕은 깊이.

### 조사 항목 6: "설정"의 위치와 하위 구조
좌측 사이드바 최하단 프로필 클릭 → Settings. 하위에 General, Personalization, Data Controls, Security, Subscription 등.

### 조사 항목 7: 스킬/플러그인/확장 기능이 최상위 메뉴에 있는지
GPTs(커스텀 GPT)가 최상위 사이드바에 존재하며 GPT Store에서 탐색 가능. 플러그인은 GPT 내부 Actions로 통합되어 별도 최상위 메뉴는 없다.

### 조사 항목 8: 예약 작업/자동화가 어디에 위치하는지
ChatGPT 자체에는 예약 작업 기능이 없다. Frontier/Atlas를 통한 자동화가 엔터프라이즈용으로 별도 제공.

### 조사 항목 9: 플랫폼/서비스 제공자 관리가 같은 앱에 있는지 별도인지
ChatGPT Team/Enterprise에서는 관리 콘솔이 별도 탭/섹션으로 존재. 서비스 제공자(OpenAI) 관리는 platform.openai.com에서 분리 운영.

### 다른 기능과의 연결 지점
- 채팅 → GPTs: 대화 중 @멘션으로 GPT 호출
- 채팅 → Projects: 대화를 프로젝트에 할당
- GPTs → Actions: GPT 설정 내에서 외부 API 연결

---

## 6. Claude.ai

### 조사 항목 1: GNB 유형
좌측 사이드바 방식. 대화 중심 인터페이스.

### 조사 항목 2: 최상위 메뉴 항목
좌측 사이드바: 새 채팅 버튼, Starred(즐겨찾기), Recents(최근 대화), Projects(프로젝트). 하단에 프로필/Settings. 채팅 입력부에 모델 선택기, 도구 토글(Web Search, Code Execution, Artifacts 등)이 존재.

### 조사 항목 3: 메뉴 개수
최상위 고정 항목 3~4개(새 채팅, Starred, Recents, Projects). 매우 미니멀.

### 조사 항목 4: 메뉴 그루핑 원칙
"생성(새 채팅)" → "즐겨찾기/기록(Starred, Recents)" → "자산(Projects)" 순서. ChatGPT와 유사하게 대화 중심이며 도구/기능은 채팅 인터페이스에 인라인 통합.

### 조사 항목 5: 하위 메뉴 깊이와 관리 방식
Projects 진입 시 프로젝트 목록 → 개별 프로젝트(Knowledge, Instructions, Conversations) 구조. 매우 얕은 1~2단계 깊이.

### 조사 항목 6: "설정"의 위치와 하위 구조
좌측 사이드바 최하단 프로필 아이콘에서 Settings 접근. 하위에 Account, Appearance, Memory, Data Privacy, Subscription 등.

### 조사 항목 7: 스킬/플러그인/확장 기능이 최상위 메뉴에 있는지
별도 플러그인/스킬 메뉴가 없다. MCP 서버 연결을 통한 도구 확장이 Settings 내 Integrations에서 관리된다. 채팅 입력부에서 도구를 토글하는 방식.

### 조사 항목 8: 예약 작업/자동화가 어디에 위치하는지
Claude.ai 소비자 인터페이스에는 예약 작업 기능이 없다. Claude Cowork(에이전트형 데스크톱 도구)가 별도 제품으로 존재.

### 조사 항목 9: 플랫폼/서비스 제공자 관리가 같은 앱에 있는지 별도인지
Claude for Enterprise/Teams에서는 Admin Console이 같은 도메인 내 별도 섹션으로 존재. Anthropic의 API/모델 관리는 console.anthropic.com에서 별도 운영.

### 다른 기능과의 연결 지점
- 채팅 → Projects: 대화를 프로젝트에 연결
- Projects → Knowledge: 프로젝트 내에서 문서 업로드/관리
- 채팅 → MCP 도구: 대화 중 연결된 외부 서비스 자동 호출

---

## 7. Datadog

### 조사 항목 1: GNB 유형
좌측 사이드바 방식. 최근 네비게이션 리디자인을 단행하여 제품 영역별 그루핑과 플라이아웃 서브메뉴를 도입했다. 브라우저 폭에 따라 최대 3가지 네비게이션 타입이 적용된다.

### 조사 항목 2: 최상위 메뉴 항목
사이드바 상단: Search(검색, Cmd+K), Recent Pages(최근 방문), Watchdog, Service Management. 사이드바 중간(제품 영역별 아이콘): Infrastructure, APM, Digital Experience, Software Delivery, Security. 사이드바 하단(핵심 데이터): Metrics, Logs, Events, Traces. 최하단: Dashboards, Notebooks, Monitors, Integrations, Admin(Organization Settings). 아이콘+호버 시 플라이아웃 텍스트 메뉴.

### 조사 항목 3: 메뉴 개수
사이드바 최상위 아이콘 약 15~18개. 각 아이콘 호버 시 5~10개의 서브 항목이 플라이아웃으로 표시.

### 조사 항목 4: 메뉴 그루핑 원칙
"빈번 사용(상단: 검색, 최근 방문, Watchdog)" → "제품 영역(중간: Infrastructure, APM, Security 등 — 사용량 기반 정렬)" → "코어 데이터(하단: Metrics, Logs, Events)" → "크로스커팅 도구(최하단: Dashboards, Monitors, Integrations)" 순서. 사용 빈도와 데이터 흐름(수집 → 분석 → 시각화)을 기반으로 배열.

### 조사 항목 5: 하위 메뉴 깊이와 관리 방식
아이콘 호버 시 2열 플라이아웃 메뉴(좌: 핵심 기능, 우: 설정/구성 옵션). 각 제품 영역 진입 후 페이지 내 탭/필터로 세부 탐색. 2~3단계 깊이.

### 조사 항목 6: "설정"의 위치와 하위 구조
사이드바 최하단 톱니바퀴 아이콘 또는 각 제품 영역 플라이아웃 우측 열에서 접근. Organization Settings 하위에 Users, Teams, API Keys, Integrations, Security, Billing 등.

### 조사 항목 7: 스킬/플러그인/확장 기능이 최상위 메뉴에 있는지
Integrations가 사이드바 하단부에 최상위 메뉴로 존재한다. 1,000개 이상의 통합을 관리한다.

### 조사 항목 8: 예약 작업/자동화가 어디에 위치하는지
Monitors(알람/알림)가 사이드바에 독립 항목으로 존재. Workflows(자동화 플로우)는 Service Management 하위에 위치. 스케줄 기반 모니터링은 Monitors 설정 내에서 구성.

### 조사 항목 9: 플랫폼/서비스 제공자 관리가 같은 앱에 있는지 별도인지
단일 앱 내에 모든 관리 기능이 통합되어 있다. Organization Settings에서 사용자, 팀, 보안, 빌링 등을 관리. 멀티 조직 관리도 같은 인터페이스에서 전환.

### 다른 기능과의 연결 지점
- APM → Logs: 트레이스에서 연관 로그로 원클릭 피벗
- Infrastructure → APM: 호스트에서 관련 서비스로 전환
- Dashboards → 모든 데이터: 위젯에서 원본 데이터로 드릴다운
- Monitors → Workflows: 알림 발생 시 자동화 플로우 트리거
- Cmd+K(Quick Nav) → 모든 페이지: 키보드 단축키로 빠른 이동

---

## 8. ThoughtSpot

### 조사 항목 1: GNB 유형
좌측 사이드바 + 상단 탭 혼합 방식. 2025년 페르소나 기반 내비게이션 리디자인을 도입하여 Business User, Analyst, Data Engineer, Admin, Developer 별로 컨텍스트를 분리했다.

### 조사 항목 2: 최상위 메뉴 항목
좌측 패널(Insights 섹션): Home(홈), Answers(저장된 답변), Liveboards(대시보드), SpotIQ Analysis(AI 분석), Monitor(KPI 알림). 상단 탭: Insights, Data, Admin(권한에 따라). 아이콘+텍스트 병행. 앱 스위처(persona switcher)가 상단에 위치.

### 조사 항목 3: 메뉴 개수
좌측 패널 5~6개 + 상단 앱 스위처 탭 3~4개.

### 조사 항목 4: 메뉴 그루핑 원칙
"분석(Insights: Home, Answers, Liveboards, SpotIQ)" → "데이터(Data: 데이터 소스, 테이블, 모델)" → "관리(Admin: 사용자, 설정, 보안)" 순서. 페르소나 기반으로 사용자 역할에 따라 노출 메뉴가 달라진다.

### 조사 항목 5: 하위 메뉴 깊이와 관리 방식
Liveboards 진입 시 Recent/Shared With Me/My Liveboards 탭 필터. 개별 Liveboard 내에서 탭으로 시각화 그루핑. Answers는 검색 기반 네비게이션. 2단계 깊이.

### 조사 항목 6: "설정"의 위치와 하위 구조
상단 네비게이션 바의 Admin 탭에서 접근. Admin Console 사이드바에 Search & SpotIQ, Users, Groups, Permissions, Security, System Health 등이 포함된다.

### 조사 항목 7: 스킬/플러그인/확장 기능이 최상위 메뉴에 있는지
SpotIQ(AI 자동 분석)가 좌측 패널 최상위에 독립 항목으로 존재한다. 별도 플러그인 메뉴는 없으며, SpotApps(사전 구축 분석 템플릿)는 Data Workspace > Utilities에서 관리.

### 조사 항목 8: 예약 작업/자동화가 어디에 위치하는지
Monitor가 좌측 패널 최상위에 독립 항목으로 존재한다. KPI 기반 알림 스케줄링(시간별, 일별, 주별, 월별)을 설정한다.

### 조사 항목 9: 플랫폼/서비스 제공자 관리가 같은 앱에 있는지 별도인지
Admin Console이 같은 앱 내 상단 탭으로 존재. 멀티 테넌시(Orgs)를 사용하는 경우 Primary Org에서 전체 클러스터 관리.

### 다른 기능과의 연결 지점
- Answers → Liveboards: 답변을 Liveboard에 핀(Pin)
- Liveboards → SpotIQ: Liveboard 내 시각화에서 SpotIQ 분석 실행
- Liveboards → Monitor: Liveboard의 KPI를 모니터링 대상으로 설정
- Data → Answers: 데이터 소스에서 직접 검색/분석 시작

---

## 9. n8n

### 조사 항목 1: GNB 유형
좌측 사이드바 방식. 워크플로우 자동화 플랫폼으로, 에디터 UI의 3영역 레이아웃(좌측 패널, 상단 바, 캔버스)을 사용한다.

### 조사 항목 2: 최상위 메뉴 항목
좌측 패널: Projects(프로젝트), Workflows(워크플로우 목록), Credentials(자격증명), Variables(변수), Templates(템플릿), Insights(분석), Admin Panel(n8n Cloud 전용). 하단: Help, What's New. 아이콘+텍스트 병행.

### 조사 항목 3: 메뉴 개수
좌측 사이드바 최상위 약 7~8개 항목.

### 조사 항목 4: 메뉴 그루핑 원칙
"자산(Projects, Workflows, Credentials, Variables)" → "탐색(Templates)" → "운영(Insights)" → "관리(Admin Panel)" 순서. 워크플로우 생명주기(자산 → 실행 → 분석 → 관리) 기반.

### 조사 항목 5: 하위 메뉴 깊이와 관리 방식
워크플로우 선택 시 캔버스 에디터로 진입. 캔버스 내에서 노드 패널(트리거/앱/코어 노드 카테고리), 실행 이력, 버전 히스토리 등이 패널/탭으로 제공. 2단계 깊이.

### 조사 항목 6: "설정"의 위치와 하위 구조
Admin Panel(n8n Cloud 전용)에서 인스턴스 사용량, 빌링, 버전 관리. 개인 설정은 프로필 메뉴에서 접근. Variables는 최상위 메뉴에 독립적으로 분리되어 있다.

### 조사 항목 7: 스킬/플러그인/확장 기능이 최상위 메뉴에 있는지
별도 플러그인 메뉴가 없다. 노드 자체가 플러그인 역할을 하며, 캔버스 내 노드 패널에서 500개 이상의 통합 노드를 검색/추가한다.

### 조사 항목 8: 예약 작업/자동화가 어디에 위치하는지
n8n 자체가 워크플로우 자동화 플랫폼이므로 모든 워크플로우가 예약/자동화 대상이다. Schedule Trigger 노드로 크론 스케줄을 설정하며, Workflows 목록에서 Active/Inactive 토글로 관리. Insights에서 실행 분석을 제공한다.

### 조사 항목 9: 플랫폼/서비스 제공자 관리가 같은 앱에 있는지 별도인지
n8n Cloud의 경우 Admin Panel이 같은 앱 내에 존재. 셀프호스팅 커뮤니티 에디션에서는 Projects와 일부 관리 기능이 제한된다.

### 다른 기능과의 연결 지점
- Workflows → Credentials: 워크플로우 노드에서 자격증명 참조
- Workflows → Variables: 워크플로우 내에서 환경 변수 사용
- Templates → Workflows: 템플릿에서 새 워크플로우 생성
- Workflows → Insights: 실행 이력에서 분석 데이터로 연결

---

## 10. Manus (Meta 인수)

### 조사 항목 1: GNB 유형
채팅 중심 인터페이스. 프롬프트 입력 → 자율 실행 → 결과 전달 구조로, 전통적인 GNB보다는 대화형 워크스페이스에 가깝다. 2025년 3월 출시 후 2025년 12월 Meta에 인수되었으며, 2026년 3월 데스크톱 앱('My Computer' 기능)을 출시했다.

### 조사 항목 2: 최상위 메뉴 항목
공개된 웹 인터페이스 기준: 채팅 입력 영역이 중심. 좌측 또는 상단에 채팅 히스토리, 프로필/설정이 위치하는 것으로 추정. 최소한의 네비게이션 구조로, 별도 메뉴보다는 대화 컨텍스트 내에서 도구를 자동 선택하는 방식. Meta Ads Manager 내에서는 "Manage" 섹션의 도구 플라이아웃에 Manus AI 숏컷이 추가되었다.

### 조사 항목 3: 메뉴 개수
최소 2~3개(새 채팅, 히스토리, 설정) 수준으로 매우 간결.

### 조사 항목 4: 메뉴 그루핑 원칙
대화 중심(Conversation-first) 설계. 별도 기능 메뉴 없이 프롬프트에서 의도를 파악하여 도구를 자율적으로 선택.

### 조사 항목 5: 하위 메뉴 깊이와 관리 방식
실질적으로 1단계. 에이전트가 작업을 수행하는 과정이 실시간으로 표시되며(브라우저 조작, 코드 실행 등), 결과물이 파일/URL 형태로 전달.

### 조사 항목 6: "설정"의 위치와 하위 구조
프로필 메뉴에서 접근. 계정, 구독, 데이터 관리 수준. 데스크톱 앱에서는 'My Computer' 권한 제어(Allow Once, Always Allow) 설정이 추가되었다.

### 조사 항목 7: 스킬/플러그인/확장 기능이 최상위 메뉴에 있는지
별도 스킬/플러그인 메뉴가 없다. 에이전트가 필요에 따라 도구를 자동 설치하고 실행하는 구조. Google Calendar, Gmail 등 서비스 연동은 설정 내에서 관리.

### 조사 항목 8: 예약 작업/자동화가 어디에 위치하는지
별도 예약 작업 기능에 대한 공개 정보 없음. 모든 작업이 온디맨드 프롬프트 기반.

### 조사 항목 9: 플랫폼/서비스 제공자 관리가 같은 앱에 있는지 별도인지
소비자 제품으로 플랫폼 관리 개념이 해당되지 않음. Meta 인수 후 Meta Ads Manager 등 Meta 제품군에 통합 진행 중.

### 다른 기능과의 연결 지점
- 프롬프트 → 샌드박스 환경: 입력 즉시 가상 컴퓨터에서 자율 실행
- 결과물 → 파일/URL: 작업 결과를 다운로드 가능한 형태로 전달
- 데스크톱 앱 → 로컬 파일: My Computer 기능으로 로컬 파일 시스템 접근

---

## 11. Snowflake Snowsight

### 조사 항목 1: GNB 유형
좌측 사이드바 방식. 2025년 5월 네비게이션 메뉴 리디자인(Preview)을 발표하여 기능 카테고리 기반 그루핑을 도입했다.

### 조사 항목 2: 최상위 메뉴 항목
리디자인된 좌측 사이드바: **Work with data** — Projects(Worksheets/Workspaces, Notebooks, Streamlit, Dashboards, Native Apps), Ingestion(Add Data, Connectors, Copy History, Migrations, Openflow), Transformation(Dynamic Tables, Tasks, dbt Projects), AI & ML(Cortex AI, ML), Monitoring(Query History, Container Services, Job History, Traces & Logs), Marketplace. **Horizon Catalog** — Catalog(Database Explorer, Internal Marketplace, Apps), Data Sharing(Private Sharing, Provider Studio), Governance & Security(Users & Roles, Tags & Policies, Trust Center, Network Policies). **Manage** — Compute(Warehouses, Compute Pools), Admin(Accounts, Billing, Admin Contacts, Partner Connect). 아이콘+텍스트 병행. 핀(Shortcuts) 기능으로 자주 사용 페이지 고정 가능.

### 조사 항목 3: 메뉴 개수
3개 대카테고리 하위에 약 6개 중간 카테고리, 총 25개 이상의 하위 항목. 역할(Role)에 따라 노출 메뉴가 달라진다.

### 조사 항목 4: 메뉴 그루핑 원칙
"데이터 작업(Work with data: 수집 → 변환 → 분석 → 모니터링)" → "데이터 카탈로그/거버넌스(Horizon Catalog)" → "인프라 관리(Manage)" 순서. 데이터 파이프라인 흐름과 역할 기반 분리를 결합.

### 조사 항목 5: 하위 메뉴 깊이와 관리 방식
대카테고리 → 중간 카테고리(클릭하여 확장) → 개별 페이지. 3단계 깊이. Worksheets/Workspaces 진입 시 파일 기반 IDE 환경으로 전환.

### 조사 항목 6: "설정"의 위치와 하위 구조
Manage > Admin에서 조직/계정/빌링 관리. 개인 설정은 좌측 하단 프로필 메뉴에서 접근. Governance & Security에서 사용자/역할/정책 관리.

### 조사 항목 7: 스킬/플러그인/확장 기능이 최상위 메뉴에 있는지
Marketplace가 "Work with data" 카테고리 하위에 최상위 항목으로 존재한다. Native Apps는 Catalog 하위에 위치.

### 조사 항목 8: 예약 작업/자동화가 어디에 위치하는지
Transformation 카테고리 하위에 Tasks(스트림/태스크)와 Dynamic Tables가 위치한다. 데이터 파이프라인 스케줄링은 Tasks에서 관리.

### 조사 항목 9: 플랫폼/서비스 제공자 관리가 같은 앱에 있는지 별도인지
단일 Snowsight 인터페이스 내에 모든 관리 기능이 통합되어 있다. Manage > Admin에서 계정/조직/빌링을 관리하며, ACCOUNTADMIN 역할이 필요하다.

### 다른 기능과의 연결 지점
- Worksheets → Dashboards: 쿼리 결과를 대시보드 타일로 변환
- Catalog → Worksheets: 데이터 탐색기에서 테이블 선택 후 쿼리 시작
- Ingestion → Transformation: 데이터 로드 후 Dynamic Tables/Tasks로 변환 파이프라인 구성
- Monitoring → Compute: 쿼리 히스토리에서 웨어하우스 성능 확인

---

## 12. Databricks

### 조사 항목 1: GNB 유형
좌측 사이드바 방식. 통합(Unified) 네비게이션 경험을 제공하며, 이전의 페르소나 기반 전환(Data Science & Engineering / SQL / Machine Learning)을 없애고 모든 기능을 단일 사이드바로 통합했다.

### 조사 항목 2: 최상위 메뉴 항목
좌측 사이드바 상단(공통): +New(생성), Home(홈), Workspace(파일/노트북 브라우저), Recents. 사이드바 중간(제품 영역): Catalog(Unity Catalog, 데이터 탐색), SQL Editor(쿼리 에디터), Queries(저장된 쿼리), Dashboards(대시보드), AI Playground. 사이드바 하단(운영): Workflows(잡/파이프라인), Compute(클러스터, SQL 웨어하우스), Experiments(MLflow 실험), Models(모델 레지스트리), Serving(모델 서빙). 최하단: Settings(설정). 아이콘+텍스트 병행.

### 조사 항목 3: 메뉴 개수
좌측 사이드바 최상위 약 12~15개 항목.

### 조사 항목 4: 메뉴 그루핑 원칙
"공통 도구(상단: New, Home, Workspace, Recents)" → "데이터/분석(중간: Catalog, SQL Editor, Queries, Dashboards)" → "ML/AI(Experiments, Models, Serving, AI Playground)" → "운영(Workflows, Compute)" → "관리(Settings)" 순서. 이전의 페르소나 분리를 제거하고 통합 접근을 제공하되, 엔타이틀먼트(권한)에 따라 일부 항목이 잠금 표시.

### 조사 항목 5: 하위 메뉴 깊이와 관리 방식
Catalog 진입 시 데이터베이스/스키마/테이블 계층 탐색. Workflows에서 잡 선택 시 태스크/스케줄/실행 이력 탭. Workspace에서 폴더/파일 탐색 후 노트북 에디터 진입. 2~3단계 깊이.

### 조사 항목 6: "설정"의 위치와 하위 구조
좌측 사이드바 최하단에 Settings. 하위에 Workspace(일반 설정), User(개인 설정), Developer(API, Snippets), Compute(기본 클러스터), Notifications 등. 계정 수준 관리는 별도 Account Console(accounts.cloud.databricks.com)에서 운영.

### 조사 항목 7: 스킬/플러그인/확장 기능이 최상위 메뉴에 있는지
별도 플러그인 메뉴가 없다. Partner Connect(데이터 통합 파트너)는 Settings 내에서 접근. Marketplace는 별도 탭/메뉴로 제공될 수 있으나 핵심 사이드바에는 포함되지 않음.

### 조사 항목 8: 예약 작업/자동화가 어디에 위치하는지
Workflows가 사이드바에 독립 최상위 항목으로 존재한다. 잡(Jobs) 생성/스케줄링/모니터링을 담당하며, 멀티태스크 DAG 파이프라인을 지원한다.

### 조사 항목 9: 플랫폼/서비스 제공자 관리가 같은 앱에 있는지 별도인지
워크스페이스 수준 관리는 같은 앱 내 Settings에서 처리. 계정 수준 관리(사용자, 워크스페이스 생성, SSO, 네트워크 등)는 별도 Account Console에서 운영. 워크스페이스 간 전환은 상단 바 드롭다운에서 가능.

### 다른 기능과의 연결 지점
- Catalog → SQL Editor: 테이블 선택 후 쿼리 실행
- SQL Editor → Dashboards: 쿼리 결과를 대시보드로 시각화
- Notebooks → Experiments: 노트북에서 MLflow 실험 로깅
- Experiments → Models → Serving: ML 생명주기 연속 흐름
- Workflows → Notebooks/SQL: 잡에서 노트북/쿼리를 태스크로 실행

---

## 13. Genspark

### 조사 항목 1: GNB 유형
상단 내비게이션 바 + 중앙 채팅/작업 영역 방식. AI 검색엔진에서 Super Agent 워크스페이스로 피벗한 플랫폼으로, 웹 인터페이스와 브라우저 앱 두 가지 형태가 있다.

### 조사 항목 2: 최상위 메뉴 항목
상단 바: Search/Chat(검색/채팅 — 메인 입력), Hubs(프로젝트 허브), AI Chat(멀티모델 채팅), Tools(AI Slides, AI Sheets, AI Images, AI Video, AI Docs, Call For Me 등). 좌측 또는 상단에 히스토리/Sparkpages 접근. 아이콘+텍스트 병행.

### 조사 항목 3: 메뉴 개수
상단 바 주요 항목 4~6개 + 도구 서브메뉴 6~8개.

### 조사 항목 4: 메뉴 그루핑 원칙
"입력(Search/Chat)" → "프로젝트(Hubs)" → "도구(Tools — 유형별 하위 분류)" → "결과(Sparkpages)" 순서. 검색 → 실행 → 결과물 생산의 흐름을 따름.

### 조사 항목 5: 하위 메뉴 깊이와 관리 방식
Tools 메뉴에서 도구 유형 선택 → 개별 도구 인터페이스 진입. Hubs에서 프로젝트 선택 → 관련 파일/대화/결과물 확인. 2단계 깊이.

### 조사 항목 6: "설정"의 위치와 하위 구조
프로필 메뉴에서 접근. 계정, 구독, 프라이버시, 모델 설정 등.

### 조사 항목 7: 스킬/플러그인/확장 기능이 최상위 메뉴에 있는지
Super Agents(커스텀 에이전트)를 생성/관리할 수 있으며, 이는 Hubs 또는 별도 에이전트 관리 영역에서 접근 가능. 별도 "플러그인 스토어" 형태는 아니지만, 80개 이상의 내장 도구를 제공.

### 조사 항목 8: 예약 작업/자동화가 어디에 위치하는지
별도 예약 작업 메뉴는 확인되지 않음. 모든 작업이 온디맨드 프롬프트 기반.

### 조사 항목 9: 플랫폼/서비스 제공자 관리가 같은 앱에 있는지 별도인지
소비자 + 프로슈머 제품으로 플랫폼 관리 개념이 제한적. 엔터프라이즈 라이선싱 정보는 미공개.

### 다른 기능과의 연결 지점
- Search → Sparkpages: 검색 결과가 자동으로 구조화된 Sparkpage로 생성
- Hubs → Tools: 프로젝트 내에서 도구(Slides, Sheets 등) 호출
- AI Chat → Tools: 대화 중 도구 자동 호출(예: 슬라이드 생성 요청 시 AI Slides 연결)

---

## 14. Salesforce Agentforce

### 조사 항목 1: GNB 유형
Salesforce 플랫폼의 기존 네비게이션(상단 내비게이션 바) 위에 Agentforce Studio와 Agent Builder가 레이어링되는 혼합 방식. Salesforce Setup 메뉴 내에서 접근한다.

### 조사 항목 2: 최상위 메뉴 항목
Agentforce Studio(독립 허브): Agents(에이전트 목록), Agent Actions(액션 라이브러리), Testing Center(테스팅), Learning Resources(학습). Agent Builder(에이전트 내부): 좌측 사이드바에 에이전트 구성 항목(Topics, Actions, Instructions, Channels, Settings), 중앙에 Plan Tracer, 우측에 Conversation Preview. Salesforce 앱 네비게이션은 상단 탭 방식(Home, Service, Sales 등).

### 조사 항목 3: 메뉴 개수
Agentforce Studio 상단 4개 항목 + Agent Builder 좌측 사이드바 5~7개 항목.

### 조사 항목 4: 메뉴 그루핑 원칙
Agentforce Studio는 "자산(Agents, Actions)" → "품질(Testing)" → "학습(Resources)" 순서. Agent Builder 내부는 "구성(Topics, Actions, Instructions)" → "배포(Channels)" → "관리(Settings)" 순서. 에이전트 빌드 → 테스트 → 배포 생명주기를 따른다.

### 조사 항목 5: 하위 메뉴 깊이와 관리 방식
에이전트 선택 → Agent Builder 진입 → Topics/Actions 상세 편집. Topics 내에서 Classification Description, Scope, Instructions를 자연어로 설정. 3단계 깊이.

### 조사 항목 6: "설정"의 위치와 하위 구조
Agent Builder 내 좌측 사이드바의 Settings(또는 상단 우측). 하위에 언어, 톤(Casual/Neutral/Formal), 이벤트 로그 설정, 모델 선택 등. Salesforce 전체 설정은 Setup(기어 아이콘) 내에서 관리.

### 조사 항목 7: 스킬/플러그인/확장 기능이 최상위 메뉴에 있는지
Agent Actions가 Agentforce Studio 최상위에 독립 항목으로 존재한다. Actions는 Apex, Flow, Prompt Template, MuleSoft API 등 다양한 유형을 지원하며, 에이전트의 Topics에 연결된다.

### 조사 항목 8: 예약 작업/자동화가 어디에 위치하는지
Agentforce의 자율(Autonomous) 에이전트는 이벤트 트리거로 동작한다. 스케줄 기반 자동화는 Salesforce Flow/Process Builder에서 별도 관리. Omni Supervisor에서 에이전트 실시간 운영 모니터링.

### 조사 항목 9: 플랫폼/서비스 제공자 관리가 같은 앱에 있는지 별도인지
Salesforce 관리자(고객사 IT)는 Setup 내에서 Agentforce를 포함한 전체 플랫폼을 관리한다. Salesforce(서비스 제공자) 관리는 별도 시스템(Trust, Status Page 등).

### 다른 기능과의 연결 지점
- Agentforce Studio → Agent Builder: 에이전트 선택 후 빌더 진입
- Agent Builder → Salesforce Data Cloud: 에이전트가 CRM 데이터를 실시간 참조
- Agent Actions → Flows/Apex: 액션이 기존 Salesforce 비즈니스 로직을 호출
- Agents → Omni Supervisor: 배포된 에이전트의 실시간 운영 모니터링

---

## 15. ServiceNow AI Control Tower

### 조사 항목 1: GNB 유형
ServiceNow Now Platform의 기존 좌측 사이드바 네비게이션 위에 AI Control Tower가 플러그인/모듈 형태로 추가되는 구조. Now Platform의 통합 네비게이션(Application Navigator)을 사용한다.

### 조사 항목 2: 최상위 메뉴 항목
Now Platform Application Navigator(좌측 사이드바): 기존 ServiceNow 모듈 전체(Incident, Change, CMDB 등) + AI Control Tower 모듈. AI Control Tower 내부 대시보드: AI Strategy(전략 정렬), AI Governance(거버넌스 — 리스크, 컴플라이언스), AI Management(관리 — 모델 레지스트리, 에이전트 인벤토리), AI Performance(성능 — Value Dashboard). AI Agent Fabric이 에이전트 간 통신 백본으로 동작.

### 조사 항목 3: 메뉴 개수
ServiceNow Application Navigator 자체는 수백 개 모듈. AI Control Tower 모듈 내부에 약 4~6개 주요 뷰(Strategy, Governance, Management, Performance 등).

### 조사 항목 4: 메뉴 그루핑 원칙
"전략(Strategy)" → "거버넌스(Governance — 리스크, 컴플라이언스, 윤리)" → "관리(Management — 모델/에이전트 레지스트리)" → "성과(Performance — Value Dashboard)" 순서. AI 생명주기(전략 → 거버넌스 → 운영 → 가치 실현) 기반.

### 조사 항목 5: 하위 메뉴 깊이와 관리 방식
Application Navigator에서 AI Control Tower 모듈 선택 → 대시보드/리스트 뷰 → 개별 AI 자산 상세. CMDB/CSDM 연동으로 모든 AI 자산이 비즈니스 서비스에 매핑. 3~4단계 깊이.

### 조사 항목 6: "설정"의 위치와 하위 구조
Now Platform System Properties 또는 AI Control Tower 플러그인 설정 내에서 관리. Governance Roles(모델 오너, 컴플라이언스 리드, 데이터 스튜어드) 정의, 평가 메트릭 템플릿, 알림 임계값 등.

### 조사 항목 7: 스킬/플러그인/확장 기능이 최상위 메뉴에 있는지
별도 스킬/플러그인 최상위 메뉴가 없다. AI Agent Fabric을 통해 서드파티 에이전트(Adobe, Cisco, Microsoft 등)와의 연동을 관리하며, 이는 AI Management 뷰 내에서 확인.

### 조사 항목 8: 예약 작업/자동화가 어디에 위치하는지
ServiceNow Flow Designer에서 자동화 워크플로우를 구성하며, AI Control Tower의 알림/정책 위반 시 자동 교정 워크플로우를 트리거한다. 스케줄 기반 모니터링은 모델 드리프트 감지 등에서 자동 실행.

### 조사 항목 9: 플랫폼/서비스 제공자 관리가 같은 앱에 있는지 별도인지
ServiceNow는 고객사가 인스턴스를 운영하는 구조이므로, 고객사 관리자가 AI Control Tower를 포함한 전체 플랫폼을 같은 인스턴스 내에서 관리한다. ServiceNow(제공자) 관리는 별도 시스템.

### 다른 기능과의 연결 지점
- AI Control Tower → CMDB: AI 자산이 비즈니스 서비스에 자동 매핑
- AI Governance → Flow Designer: 정책 위반 시 자동 교정 워크플로우 트리거
- AI Performance → Value Dashboard: 비즈니스 KPI(생산성, 매출, 고객 만족도)와 AI 성과 연결
- AI Agent Fabric → 서드파티 에이전트: 멀티벤더 에이전트 간 통신/오케스트레이션

---

## 시각 자료 모음

### OpenAI Frontier
- [OpenAI Frontier 공식 소개 페이지](https://openai.com/business/frontier/) — Frontier의 핵심 기능(공유 컨텍스트, IAM, 감사 로그) 마케팅 자료. 실제 UI 스크린샷은 미공개 상태이므로 기능 구조 파악용.
- [Inkeep의 Frontier 분석: Agent Builder 설명](https://inkeep.com/blog/openai-frontier) — Agent Builder의 비주얼 캔버스/SDK 구조, ChatKit 위젯 등에 대한 서드파티 분석. 기능 분해 참고.

### Coze
- [Coze 공식 퀵스타트 문서](https://www.coze.com/open/docs/guides/quickstart) — 에이전트 구성 페이지(Persona & Prompt, Skills, Preview & Debug) 3패널 레이아웃 확인 가능.
- [Han Zhao의 Coze Design System 포트폴리오](https://zhaohan.design/coze/) — Coze의 디자인 시스템(컴포넌트 66종, 네비게이션 패턴 등) 상세. 내부 설계 원칙 참고.

### Dify
- [Dify 공식 사이트](https://dify.ai/) — 워크플로우 캔버스, Studio/Knowledge/Tools 네비게이션의 전반적 구조 확인.
- [Codecademy Dify 튜토리얼](https://www.codecademy.com/article/dify-ai-tutorial) — Studio 탭, Knowledge 탭의 단계별 스크린샷 제공. 실제 사용 흐름 파악용.

### Microsoft Copilot Studio
- [Copilot Studio UI 투어(TechWorkshop L300)](https://microsoft.github.io/TechExcel-Designing-your-own-copilot-using-copilot-studio/docs/Ex01/0103.html) — Home, Create, Agents, Library, 에이전트 내부 탭(Overview/Knowledge/Topics/Actions/Analytics/Channels) 전체 워크스루.
- [Copilot Studio Multi-Agent Lab](https://microsoft.github.io/mcs-labs/labs/mcs-multi-agent/) — 에이전트 내부 상단 탭 구조(Topics, Agents, Knowledge, Tools) 및 멀티에이전트 오케스트레이션 UI 상세.

### ChatGPT
- [ChatGPT 앱 인터페이스](https://chatgpt.com/) — 좌측 사이드바의 대화 히스토리, Projects, GPTs 메뉴 구조 직접 확인 가능.

### Claude.ai
- [Claude.ai 인터페이스](https://claude.ai/) — 좌측 사이드바의 Starred, Recents, Projects 미니멀 구조 직접 확인 가능.

### Datadog
- [Datadog 네비게이션 리디자인 블로그](https://www.datadoghq.com/blog/datadog-navigation-redesign/) — 사이드바 재설계의 설계 원칙(사용 빈도 기반 배치, 제품 영역별 그루핑, 코어 데이터 분리) 및 실제 UI 스크린샷 포함. 반드시 참고.
- [Datadog Quick Nav 메뉴 블로그](https://www.datadoghq.com/blog/datadog-quick-nav-menu/) — Cmd+K 기반 빠른 탐색 메뉴 설계. 대규모 메뉴 관리 전략 참고.
- [Datadog Getting Started](https://docs.datadoghq.com/getting_started/application/) — 전체 플랫폼 기능 구조와 네비게이션 설명.

### ThoughtSpot
- [ThoughtSpot Finding Your Way Around 문서](https://docs.thoughtspot.com/cloud/latest/navigating-thoughtspot) — 좌측 패널 구조(Home, Answers, Liveboards, SpotIQ, Monitor, Data, Admin) 및 페르소나 기반 내비게이션 상세.
- [ThoughtSpot 커스터마이즈 문서(임베드)](https://developers.thoughtspot.com/docs/full-app-customize) — 좌측 네비게이션 패널, 모듈러 홈페이지, HomeLeftNavItem 열거값(Home, Liveboards, Answers 등) 공개. 메뉴 구조 정확한 파악 가능.

### n8n
- [n8n Editor UI 가이드(Level 1 Course)](https://docs.n8n.io/courses/level-one/chapter-1/) — 좌측 패널(Projects, Workflows, Credentials, Variables, Templates, Insights), 캔버스 구조, 노드 패널 전체 워크스루.
- [n8n Editor UI Components(DeepWiki)](https://deepwiki.com/n8n-io/n8n-docs/7.1-quickstarts-and-tutorials) — 3영역 레이아웃(좌측 패널, 상단 바, 캔버스) 아키텍처 상세.

### Manus
- [Manus 공식 문서](https://manus.im/docs/introduction/welcome) — 자율 에이전트의 샌드박스 환경, 도구 자동 설치 구조 설명.
- [CNBC: Manus 데스크톱 앱 출시](https://www.cnbc.com/2026/03/18/metas-manus-launches-desktop-app-to-bring-its-ai-agent-onto-personal-devices.html) — My Computer 기능 및 권한 제어 UI 설명.

### Snowflake Snowsight
- [Snowsight Navigation Menu 공식 문서](https://docs.snowflake.com/user-guide/ui-snowsight-navigation) — 리디자인된 네비게이션 메뉴 전체 구조(Work with data / Horizon Catalog / Manage), 이전→신규 매핑 테이블 포함. 핵심 참조 자료.
- [Snowsight 인터페이스 가이드(Medium)](https://medium.com/@jramcloud1/07-a-comprehensive-guide-to-the-snowsight-navigation-menu-navigating-snowflake-with-ease-3fa5115e5452) — 역할 기반 메뉴 노출, 기능별 그루핑 상세 분석.

### Databricks
- [Databricks Improved Navigation 블로그](https://www.databricks.com/blog/the-improved-databricks-navigation-is-enabled-for-everyone) — 통합 네비게이션 리디자인 배경(페르소나 전환 제거), 사이드바 구조 변경사항 및 스크린샷.
- [Databricks Navigate Workspace UI 문서(AWS)](https://docs.databricks.com/aws/en/workspace/navigate-workspace) — 사이드바 항목 전체 목록, 홈페이지 구성, 검색 기능, 탭 그룹 전환 상세.

### Genspark
- [OpenAI 공식: Genspark Super Agent 사례](https://openai.com/index/genspark/) — Super Agent 아키텍처, Call For Me 기능, AI Slides/Sheets 도구 워크플로우 스크린샷 포함.
- [Lindy의 Genspark 기능 리뷰](https://www.lindy.ai/blog/genspark-ai-features) — Super Agent, AI Chat(Mixture of Agents), Hubs, 각 도구(Slides, Sheets, Images, Video)의 실제 사용 화면 및 설명.

### Salesforce Agentforce
- [Salesforce Ben: Agentforce 동작 방식](https://www.salesforceben.com/how-does-salesforces-agentforce-work/) — Agent Builder 4패널 인터페이스(좌측 사이드바, 좌측 패널, 중앙 Plan Tracer, 우측 Conversation Preview) 상세 스크린샷 및 설명.
- [Trailhead: Agent Builder 탐색](https://trailhead.salesforce.com/content/learn/modules/introduction-to-agent-builder/get-to-know-agent-builder) — Agentforce Studio 허브 구조(Agents, Agent Actions, Testing Center) 및 Agent Builder 커스터마이징 워크스루.

### ServiceNow AI Control Tower
- [ServiceNow AI Control Tower 공식 제품 페이지](https://www.servicenow.com/products/ai-control-tower.html) — 중앙 집중형 AI 거버넌스 허브의 마케팅 자료 및 기능 개요.
- [ServiceNow 커뮤니티: AI Control Tower 소개](https://www.servicenow.com/community/admin-experience-blogs/introducing-the-servicenow-ai-control-tower-from-intelligent/ba-p/3261185) — 플러그인 활성화, 거버넌스 역할 설정, 모델 온보딩, 대시보드 구성 단계별 가이드.
- [eesel.ai의 AI Control Tower 분석](https://www.eesel.ai/blog/servicenow-ai-control-tower) — Control Tower 대시보드 스크린샷, Risk & Compliance 탭, Value Dashboard 화면 포함. 실제 UI 구조 파악에 유용.
