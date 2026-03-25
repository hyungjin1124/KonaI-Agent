# 엔터프라이즈 AI 에이전트 플랫폼 — 관리자 IA 심층 분석 리포트

> 조사 일자: 2026-03-20  
> 목적: 엔터프라이즈 AI 에이전트 플랫폼의 관리자(Admin) 및 플랫폼 관리(Platform Admin) 화면 IA 설계를 위한 벤치마크 리서치  
> 원칙: 관찰 사실만 기록하며, 결론이나 권장안은 포함하지 않음

---

## 1. OpenAI (ChatGPT Enterprise / API Platform)

### 조사 항목 1: 테넌트/워크스페이스 Admin과 플랫폼/조직 Admin의 분리 방식

OpenAI는 2025년에 **Global Admin Console**(admin.openai.com)을 도입하여 계층 구조를 새롭게 구성하였다. 최상위에 **Tenant**라는 개념이 존재하며, 하나의 Tenant 아래에 여러 ChatGPT 워크스페이스와 여러 API Platform Organization을 포함할 수 있다. Global Admin Console에서는 **Global Admin**이라는 새로운 역할이 존재하며, 이 역할은 도메인 관리(추가/삭제/인증), 모든 워크스페이스·Organization에 걸친 SSO 설정, 계정 병합 정책(AAC) 등을 관리한다.

ChatGPT Enterprise 워크스페이스 내부에서는 **Workspace Owner**, **Admin**, **Member** 세 가지 역할이 존재한다. Workspace Owner가 가장 높은 권한을 가지며 빌링, 설정, ID 관리를 포함한 전체 워크스페이스 제어 권한을 가진다. Admin은 사용자 초대/제거, 커넥터 설정, 그룹 관리 등 일부 설정을 관리할 수 있다.

API Platform Organization은 ChatGPT Enterprise 워크스페이스와 **별도 멤버십으로 관리**된다. API Platform에서는 Organization → Project 계층 구조로, Organization 역할과 Project 역할이 분리되어 RBAC 기반 권한 제어가 적용된다. Groups를 통해 SCIM 기반 IdP 동기화도 지원한다.

즉, OpenAI는 **같은 도메인 내 서로 다른 포탈(Global Admin Console, ChatGPT 워크스페이스 설정, API Platform 대시보드)**로 분기하는 구조이며, Tenant 수준 관리와 개별 워크스페이스/Organization 수준 관리가 계층적으로 분리되어 있다.

### 조사 항목 2: 고객사(테넌트) Admin 하위 구조 트리

ChatGPT Enterprise **Workspace Settings** 하위 구조는 2025년 10월 업데이트 이후 다음과 같다:

- **General**
  - Workspace name / image
  - Workspace Policy (AI 정책 모달 — 조직 AI 정책 안내)
  - Early Model Access 토글
  - Data retention 설정 (최소 90일)
  - Feature 활성화/비활성화 (Canvas, Web Search, Deep Research 등)
- **Permissions & Roles** (구 Settings & permissions)
  - Default roles 설정
  - Custom roles 생성/관리 (RBAC)
  - 역할별 사용량 제한(Spend controls) 설정
  - 역할별 기능 접근 제어 (Codex, Apps 등)
- **Identity & Access** (구 Identity & provisioning + IP allowlist 통합)
  - SSO (SAML) 설정
  - SCIM 프로비저닝
  - Domain verification
  - Account merge 정책
  - IP allowlist
  - MFA 설정
- **Members**
  - 사용자 목록 / 초대 / 제거
  - Groups 관리 (SCIM 연동 그룹 포함)
  - 역할 할당
- **Apps** (구 Connectors)
  - 앱별 활성화/비활성화
  - 역할별 앱 접근 제어 (RBAC)
  - 앱별 write action 활성화
  - Custom apps / MCP connectors 관리
  - Developer mode 설정
- **GPTs**
  - 최대 공유 범위 설정 (workspace only / private invite)
  - 제3자 GPT 허용/차단
  - Action 도메인 allowlist
- **Models**
  - Legacy 모델 활성화 설정
  - Early Model Access 토글
- **Company Knowledge**
  - 조직 지식 소스 관리
- **Usage** (구 User Analytics)
  - Overview (채택/참여 트렌드)
  - Benchmark (업계 중앙값 대비 비교)
  - Task insights (SCIM 그룹 기반 분석)
  - Impact survey (자기보고 성과)
  - 사용자별/GPT별 사용 리포트 다운로드

### 조사 항목 3: 플랫폼/조직 Admin 하위 구조 트리

**Global Admin Console** (admin.openai.com):

- **Domains**: 도메인 추가/삭제/인증
- **SSO**: 모든 워크스페이스·Organization 걸친 SAML SSO 설정
- **Workspaces**: 연결된 ChatGPT 워크스페이스 목록
- **Organizations**: 연결된 API Platform Organization 목록

**API Platform Dashboard** (platform.openai.com):

- **Organization Settings**
  - General (이름, billing)
  - Members (사용자/그룹)
  - Roles (Organization 수준 / Project 수준 커스텀 역할)
  - API Keys (Admin Keys 포함)
  - Security (SSO, SCIM)
- **Projects**
  - Project별 Keys, Files, Resources
  - Project별 역할 설정
- **Usage**: API 사용량 모니터링
- **Billing**: 과금 정보
- **Admin Keys**: Admin API Keys 생성/관리 (감사 로그 및 관리 작업용)
- **Audit Logs**: Admin and Audit Logs API

### 조사 항목 4: AI 거버넌스(가드레일, 콘텐츠 필터, 모델 정책) 배치 위치

AI 거버넌스 관련 설정은 여러 위치에 분산되어 있다:

- **Workspace Settings → General → Workspace Policy**: 조직의 AI 정책을 모달 형태로 사용자에게 안내하는 기능. 관리자가 자유 텍스트로 정책 내용을 작성할 수 있다.
- **Workspace Settings → General**: 기능별 활성화/비활성화 (Canvas 코드 실행, Web search, GPT actions 등)
- **Workspace Settings → Permissions & Roles → Custom Roles**: RBAC를 통해 역할별로 접근 가능한 기능·모델·앱을 세밀하게 제어
- **Workspace Settings → Apps**: 커넥터/앱별 활성화 여부 및 write action 허용 여부
- **Workspace Settings → GPTs**: GPT 공유 범위 제한, 제3자 GPT 차단, Action 도메인 allowlist
- **Workspace Settings → General → Data retention**: 데이터 보관 기간 정책 (최소 90일)
- **Codex 관련 거버넌스**: Codex Admin 역할 별도 존재, Agent approvals & security 설정에서 에이전트 런타임 보안 제어

콘텐츠 필터링 자체에 대한 별도 관리자 제어 페이지는 공개 문서에서 확인되지 않으며, OpenAI 플랫폼 수준에서 기본 적용되는 것으로 관찰된다.

### 조사 항목 5: 감사 로그 접근 구조와 상세 수준

OpenAI는 2025년에 **Compliance Logs Platform**을 출시하여 감사 로그 체계를 대폭 강화하였다. 기존 Compliance API(상태 기반 엔드포인트)에 더하여, 새로운 이벤트·트랜잭션 기반 데이터를 불변(immutable)한 시간 구간 JSONL 로그 파일로 제공한다. 주요 로그 카테고리는 다음과 같다:

- **ChatGPT Audit Logs**: 워크스페이스 설정 변경 이력
- **Authentication Logs**: 사용자 인증 활동 추적
- **Codex Usage Logs**: Codex 사용 이력
- **Conversation Logs** (기존 Compliance API): 대화 메타데이터, GPT 활동

분-단위 지연시간(minutes-level latency)으로 데이터를 제공하며, 단일 수집 패턴으로 모든 로그 카테고리를 처리한다. 서드파티 컴플라이언스 통합(DLP, e-Discovery, SIEM 등)도 지원한다.

접근 방식: API Platform에서 Admin API Key를 생성하여 프로그래밍 방식으로 접근하거나, 서드파티 컴플라이언스 제공업체 통합을 활용한다.

### 조사 항목 6: 사용량/비용 모니터링 위치

- **Workspace Settings → Usage**: 워크스페이스 수준의 채택·참여 분석. 사용자별·GPT별 리포트 다운로드 가능. 그룹별 필터링, 태스크 유형별 분석, 업계 벤치마크 비교 기능이 포함된다.
- **Workspace Settings → Permissions & Roles**: 역할별 사용량 제한(spend controls) 설정 — 크레딧 풀을 역할별로 분배하여 과지출을 방지
- **API Platform → Usage**: API 호출량, 토큰 사용량 모니터링
- **API Platform → Billing**: 비용 정보 확인
- **Codex Analytics API / Dashboard**: Codex 전용 채택·영향 분석

### 조사 항목 7: 역할별 메뉴 가시성 정책

- **Owner**: 모든 Workspace Settings 접근 가능 (빌링, ID 관리, 전체 설정)
- **Admin**: 사용자 관리, 일부 설정(Connectors/Apps 등) 관리 가능. 빌링·ID 관리 접근 불가
- **Member**: Workspace Settings 접근 불가. 일반 ChatGPT 사용 및 GPT 생성만 가능 (워크스페이스 정책에 따라)
- Enterprise에서는 RBAC Custom Roles를 통해 세밀한 기능별 접근 제어가 가능하며, 역할에 할당되지 않은 기능은 UI에서 비활성화(disable)된다

### 조사 항목 8: 다른 기능과의 연결 지점

- **Permissions & Roles(RBAC) → Apps/GPTs/Models**: 역할에 설정된 권한이 사용자의 앱·GPT·모델 접근 범위를 직접 결정
- **Apps 설정 → 채팅 경험**: 관리자가 활성화한 앱만 사용자 채팅에서 사용 가능
- **GPTs 설정 → GPT Store/공유**: 최대 공유 범위가 GPT 게시·공유 범위를 제한
- **Data retention 정책 → 대화 이력**: 보관 기간 설정이 사용자 대화 이력 참조 범위에 영향
- **Workspace Policy → 사용자 온보딩**: AI 정책 모달이 사용자 첫 접속 시 표시
- **SCIM 그룹 → Usage Analytics**: SCIM 그룹 기반 분석 세그먼트가 Task insights에 반영
- **Compliance API → SIEM/DLP**: 감사 로그가 외부 보안·컴플라이언스 도구로 연동
- **Codex Admin 역할 → Codex 설정**: 별도 Codex 관리 권한이 Codex의 정책·거버넌스·설정 관리로 연결
- **Global Admin Console SSO → 워크스페이스/Organization 인증**: 테넌트 수준 SSO가 하위 모든 워크스페이스·Organization에 적용

---

## 2. Microsoft Copilot Studio

### 조사 항목 1: 테넌트/워크스페이스 Admin과 플랫폼/조직 Admin의 분리 방식

Microsoft Copilot Studio는 **Power Platform 생태계** 위에 구축되어 있으며, 관리는 여러 관리 센터에 걸쳐 분산되어 있다:

- **Microsoft 365 Admin Center**: 테넌트 수준 라이선스 관리, Copilot 설정, 커넥터 활성화/차단, 에이전트 관리
- **Power Platform Admin Center (PPAC)**: 환경(Environment) 생성·관리, DLP 정책, 테넌트 설정, Copilot 사용량 분석
- **Copilot Studio**: 에이전트 빌더 (개별 에이전트 제작·편집·게시)
- **Microsoft Purview**: 데이터 보안, DLP, 컴플라이언스 감사

역할은 **Tenant Admin**과 **Environment Admin**으로 분리된다. Tenant Admin은 테넌트 전체에 적용되는 DLP 정책, 설정, 라이선스를 관리한다. Environment Admin은 특정 환경 내의 에이전트, 리소스, 사용자 권한을 관리한다. 같은 포탈(PPAC) 내에서 역할 범위에 따라 보이는 메뉴와 설정이 달라진다.

즉, **단일 앱이 아닌 여러 관리 센터에 분산된 구조**이며, 역할(Tenant Admin vs Environment Admin)에 따라 각 관리 센터에서의 접근 범위가 달라진다.

### 조사 항목 2: 고객사(테넌트) Admin 하위 구조 트리

Power Platform Admin Center의 Copilot Studio 관련 메뉴:

- **Copilot** (좌측 내비게이션)
  - **Get started**: Copilot 학습 리소스, 보안 기본 사항, 책임 AI 원칙 문서
  - **What's new**: 새로운 AI 기능 알림/업데이트
  - **Copilot Studio**
    - Usage: Copilot Studio 에이전트 사용량 분석
    - Settings: 에이전트 관련 설정 (환경별/환경 그룹별 구성 가능)
  - **Power Apps**: Power Apps 내 Copilot 사용량
  - **Dynamics 365 Sales**: Dynamics 365 Copilot 사용량
  - **Power Pages**: Power Pages Copilot 관리
- **Environments**: 환경 생성/관리, 보안 역할 할당, Maker 권한 부여
- **Security** → **Data and privacy** → **Data policy**
  - DLP 정책 생성/편집
  - 커넥터 분류 (Business / Non-business / Blocked)
  - 정책 범위 설정 (전체 테넌트 / 특정 환경)
- **Manage** → **Tenant settings**
  - 'Publish Copilots with AI features' 토글
  - Generative AI 기능 활성화/비활성화
  - Cross-geo 데이터 이동 설정

Microsoft 365 Admin Center의 Copilot 관련 메뉴:

- **Copilot** (좌측 내비게이션)
  - **Overview**: Security 탭 (Purview 통합), Management 탭
  - **Agents**: 에이전트 관리 (활성화/차단/삭제)
  - **Connectors**: 커넥터 활성화/차단
  - **Search**: 검색 설정 (약어, 조직 웹사이트)
  - **Settings**: Copilot 관련 전반 설정
  - **Licenses**: 라이선스 관리, 메시지 용량 모니터링 (선불/종량과금)

### 조사 항목 3: 플랫폼/조직 Admin 하위 구조 트리

Microsoft의 경우 서비스 제공자(Microsoft) 자체의 "플랫폼 관리" 화면은 고객에게 노출되지 않는다. 고객의 Tenant Admin이 가장 상위 관리 역할이다. 다만, **Copilot Control System**이라는 통합 거버넌스 프레임워크가 존재하며, 이는 여러 관리 센터에 걸친 정책을 아우른다:

- **Management Controls**: 라이선스 관리, 에이전트/커넥터 관리, DLP, ALM(Application Lifecycle Management), 공유 규칙
- **Security & Governance**: Purview DLP, 민감도 라벨, 감사 로그, Baseline security mode
- **Adoption & Impact**: 사용량 분석, 비용 추적

### 조사 항목 4: AI 거버넌스 배치 위치

- **Power Platform Admin Center → Security → Data policy**: Copilot Studio 전용 DLP 커넥터 분류. 인증 요구, 채널 차단, generative AI 기능 제어 등을 DLP 정책으로 관리
- **Power Platform Admin Center → Manage → Tenant settings**: 'Publish Copilots with AI features' 토글로 생성형 AI 기능 전체 활성화/비활성화
- **Microsoft 365 Admin Center → Copilot → Overview → Security 탭**: Purview 통합 카드 — 데이터 유출 방지, 과공유 관리, 데이터 컴플라이언스
- **Microsoft Purview**: 민감도 라벨 기반 Copilot DLP (특정 민감도 라벨이 적용된 파일을 Copilot이 처리하지 못하도록 차단)
- **SharePoint Advanced Management (SAM)**: Copilot 라이선스에 포함. 콘텐츠 접근 관리, 과공유 수정, 사이트 소유자 관리
- **Copilot Studio 에이전트 내부**: 에이전트별 인증 설정 (Microsoft Entra ID 인증 필수/선택)
- **Agent 365 Portal**: Tuned agents 인벤토리, 차단/삭제 가능

### 조사 항목 5: 감사 로그 접근 구조와 상세 수준

- **Microsoft Purview Audit**: Copilot 활동 로그가 Microsoft Purview 감사에 통합. 에이전트 상호작용, 사용자 활동, 데이터 접근 이력 추적
- **Microsoft Sentinel 연동**: 엔드유저 활동 감사가 Sentinel을 통해 보안 모니터링으로 연결
- **Power Platform Admin Center**: 환경별 활동 로그
- 감사 범위: 에이전트 게시/수정, DLP 위반, 사용자 인증, 커넥터 활동

### 조사 항목 6: 사용량/비용 모니터링 위치

- **Power Platform Admin Center → Copilot → Copilot Studio → Usage**: 에이전트별 사용량, MAU(Monthly Active Users) 추적
- **Microsoft 365 Admin Center → Copilot → Licenses**: 라이선스 할당, 메시지 용량 모니터링 (선불·종량)
- **Power Platform Admin Center → Copilot → Dynamics 365 Sales**: Dynamics 365 Copilot 사용량

### 조사 항목 7: 역할별 메뉴 가시성 정책

- **Tenant Admin**: PPAC 및 M365 Admin Center의 모든 Copilot 관련 설정에 접근 가능
- **Environment Admin**: 본인이 관리하는 환경 내 설정만 접근 가능. 테넌트 수준 DLP 정책은 읽기만 가능
- **Maker (에이전트 제작자)**: Copilot Studio에서 에이전트 빌드·편집·게시. 관리 센터 접근 불가
- **End User**: 에이전트 사용만 가능

Copilot 설정 페이지의 경우, 환경 접근 권한이 있는 테넌트 사용자도 설정을 '열람'할 수 있으나, 편집은 Admin 역할이 필요하다.

### 조사 항목 8: 다른 기능과의 연결 지점

- **DLP 정책(PPAC) → Copilot Studio 에이전트 게시**: DLP 위반 시 에이전트 게시가 차단됨. 이미 게시된 에이전트도 실시간 DLP 적용
- **Copilot Control System → Microsoft Purview**: 보안 탭에서 Purview DLP·민감도 라벨·컴플라이언스 카드로 직접 이동
- **ALM(Power Platform Solutions) → Copilot Studio**: 개발·테스트·운영 환경 간 에이전트 이동
- **Microsoft Entra ID → 에이전트 인증**: 에이전트의 인증 정책이 Entra ID 조건부 접근·MFA와 연동
- **SharePoint Advanced Management → Copilot 데이터 접근**: SAM에서 설정한 접근 권한·과공유 수정이 Copilot의 데이터 참조 범위에 직접 영향
- **M365 Admin Center 커넥터 설정 → Copilot 기능**: 커넥터 차단/활성화가 Copilot의 외부 도구 사용 범위를 결정
- **Agent 365 Portal → Tuned Agents**: Copilot Tuning으로 생성된 에이전트의 인벤토리·관리·삭제가 여기서 이루어짐

---

## 3. Datadog

### 조사 항목 1: 테넌트/워크스페이스 Admin과 플랫폼/조직 Admin의 분리 방식

Datadog는 **Multi-Org Account** 기능을 통해 부모-자식 조직 구조를 지원한다. 부모 조직(Parent Org)이 자식 조직(Child Org)을 생성할 수 있으며, 이 기능은 Datadog 지원팀에 요청하여 활성화해야 한다. 부모 조직의 Admin은 자식 조직의 생성 및 빌링을 관리한다.

개별 조직 내에서는 세 가지 기본 관리 역할이 있다: **Datadog Admin**, **Standard**, **Read Only**. Custom Roles를 생성하여 세밀한 RBAC 적용도 가능하다.

이 구조는 **같은 앱(Datadog 웹 인터페이스) 내에서 조직 간 전환**하는 방식이다. 좌측 하단 계정 메뉴에서 Organization Settings를 클릭하거나, 상단 헤더 드롭다운에서 조직을 전환할 수 있다. 별도의 "플랫폼 관리" 포탈은 존재하지 않으며, 부모 조직 Admin이 Multi-Org 관리 기능을 담당한다.

### 조사 항목 2: 고객사(테넌트) Admin 하위 구조 트리

**Organization Settings** 하위 구조:

- **Users**: 사용자 추가/편집/비활성화
- **Teams**: 팀 관리 (자산 조직화)
- **Service Accounts**: 비대화형 계정 관리 (앱 키 소유용)
- **Roles**: RBAC 역할 관리 (기본 역할 + Custom Roles)
- **Groups**: 사용자 그룹 (SAML 매핑 대상)
- **SAML**: SSO 설정, Strict Mode, Attribute Mapping
- **API Keys**: API 키 생성/복사/폐기
- **Application Keys**: 앱 키 생성/관리, 인가 범위(scope) 설정, OTR(One-Time Read) 모드
- **Client Tokens**: 클라이언트 측 토큰 관리
- **Remote Configuration**: 인프라에 배포된 Datadog 컴포넌트의 원격 구성
- **OAuth Apps**: OAuth 앱 조회/관리
- **Preferences**: 조직 이름 변경, 홈페이지 설정 (Dashboard List 또는 개별 Dashboard)
- **COMPLIANCE** 섹션:
  - **Audit Trail**: Audit Events Explorer로 이동 (별도 탭)
  - **Audit Trail Settings**: 보관 기간 설정, 클라우드 스토리지 아카이빙
- **SECURITY** 섹션:
  - Session duration 설정
  - Idle timeout 설정
  - Sharing settings (위젯 외부 공유 허용 여부)
  - Login methods
- **ACCESS** 섹션:
  - 위 Users, Teams, Roles 등이 포함

### 조사 항목 3: 플랫폼/조직 Admin 하위 구조 트리

Datadog는 별도의 "플랫폼 관리" 포탈이 없다. Multi-Org 구조의 부모 조직 Admin이 수행하는 관리 기능은 다음과 같다:

- **자식 조직 생성**: API(`POST /api/v1/org`)를 통해 자식 조직 생성. `org_management` 권한 필요
- **빌링 관리**: `parent_billing` 유형으로 자식 조직 빌링을 부모에서 통합 관리
- **사용량 모니터링**: 부모 조직에서 자식 조직 포함 전체 사용량 조회
- **공유 설정**: 조직 간 대시보드·데이터 공유 설정 (Datadog 지원팀 요청 필요)

### 조사 항목 4: AI 거버넌스 배치 위치

Datadog는 관측 가능성(Observability) 플랫폼으로, 자체적인 AI 에이전트 거버넌스 기능보다는 **LLM Observability** 제품군을 통해 고객의 AI 시스템을 모니터링하는 데 초점을 맞추고 있다. 관리자 관점에서의 AI 거버넌스 관련 설정은 Organization Settings 내에 별도 섹션으로 존재하지 않으며, LLM Observability는 제품 메뉴의 독립 섹션으로 존재한다.

### 조사 항목 5: 감사 로그 접근 구조와 상세 수준

- **접근 경로**: Organization Settings → COMPLIANCE → Audit Trail → Audit Events Explorer (별도 탭으로 열림)
- **또는**: 좌측 내비게이션 → Security → Audit Trail
- **필터링**: Event Names (Dashboards, Monitors, Authentication 등), Authentication Attributes (Actor, API Key ID, User email), Status, Method, 기타 Facet
- **NLQ(Natural Language Query)**: 자연어로 감사 이벤트 검색 가능 (예: "Who modified the payment dashboard last week")
- **상세 수준**: 모든 API 요청을 감사 이벤트로 기록 (request events), 제품별 상태 변경 이벤트 (product-specific events)
- **추적 대상**: 대시보드·모니터 변경, 사용자 로그인, 역할 변경, API 키 생성/삭제/수정, 인덱스 보관 기간 변경, 메트릭 변경/삭제 등
- **보관**: 기본 90일, 연장 가능. 클라우드 스토리지 아카이빙 설정 가능
- **모니터링 연동**: Audit Trail Monitor 생성 가능 (임계값 기반 알림)
- **Cloud SIEM 연동**: 감사 이벤트를 Cloud SIEM에서 위협 탐지 및 보안 신호 생성에 활용 가능

### 조사 항목 6: 사용량/비용 모니터링 위치

- **좌측 내비게이션 → Plan & Usage**: 조직의 인프라 호스트, 로그 볼륨, APM 스팬 등 사용량 확인
- **Organization Settings → Preferences**: Out-of-contract retention periods 활성화 (온디맨드 과금 발생)
- **Audit Trail**: 비용에 영향을 미치는 설정 변경(예: 로그 보관 기간 변경)을 감사 이벤트로 추적
- Multi-Org 구조에서 부모 조직은 전체 자식 조직의 사용량을 통합 조회 가능

### 조사 항목 7: 역할별 메뉴 가시성 정책

- **Datadog Admin**: Organization Settings 전체 접근, 사용자·역할·키·감사 로그 관리
- **Standard**: 대부분의 기능 접근 가능, 민감한 관리 기능(사용자 관리, 조직 설정, 빌링) 제한
- **Read Only**: 읽기만 가능
- **Custom Roles**: 개별 권한을 조합하여 정의. **Automatic Updates** 옵션으로 새 권한 자동 추가 여부 설정 가능
- **Preview Mode 권한**: 새 권한을 미리 테스트할 수 있는 옵트인 기능. 관리자가 미리 역할 구성을 업데이트하여 강제 적용 시 혼란 방지

### 조사 항목 8: 다른 기능과의 연결 지점

- **RBAC 역할 → 로그 접근**: Restriction queries를 통해 역할별로 접근 가능한 로그 범위를 제한 (예: `team:acme` 태그 기반)
- **API Keys → Agent 배포**: Agent가 Datadog에 데이터를 전송하려면 API 키 필요. 키 관리가 인프라 모니터링에 직접 영향
- **Application Keys → API 접근**: 앱 키의 인가 범위(scope)가 API를 통한 데이터 접근 범위 결정
- **Audit Trail → Monitors**: Audit Trail Monitor를 생성하여 감사 이벤트 기반 알림 설정
- **Audit Trail → Cloud SIEM**: 감사 이벤트가 보안 신호 생성으로 연결
- **Teams → 자산 관리**: 팀 설정이 대시보드, 모니터, 서비스 등의 소유권·접근 구조와 연결
- **SAML 매핑 → 역할 할당**: IdP 속성이 Datadog 역할에 자동 매핑

---

## 4. Snowflake

### 조사 항목 1: 테넌트/워크스페이스 Admin과 플랫폼/조직 Admin의 분리 방식

Snowflake는 **Organization → Account** 계층 구조를 가진다. 시스템 정의 역할로 관리 범위가 명확히 분리된다:

- **ORGADMIN**: 조직(Organization) 수준 관리. 새 계정 생성, 조직 내 모든 계정 조회, 리전 확인, 조직 전체 사용량 조회. ORGADMIN은 향후 GLOBALORGADMIN으로 전환 예정
- **ACCOUNTADMIN**: 개별 계정(Account) 수준 최상위 역할. SYSADMIN + SECURITYADMIN 권한을 포함. 계정 수준 파라미터 설정, 빌링·크레딧 조회, SQL 실행 중지 권한
- **SECURITYADMIN**: 보안 관리. 전역 오브젝트 권한 부여(MANAGE GRANTS), 사용자·역할 생성/모니터링/관리
- **USERADMIN**: 사용자·역할 생성·관리 (SECURITYADMIN보다 제한적)
- **SYSADMIN**: 시스템 오브젝트 관리. Warehouse, Database, Schema 등 생성
- **PUBLIC**: 모든 사용자에게 자동 부여되는 기본 역할

이 모든 역할은 **같은 Snowsight 인터페이스** 내에서 역할 전환(switch role)으로 접근한다. 별도의 포탈 분리는 없으며, 활성 역할에 따라 보이는 메뉴와 실행 가능한 작업이 달라진다. ORGADMIN은 일반 계정에서 조직 수준 작업을 수행하며, 기본 역할 계층에 들어가지 않는 독립적인 역할이다.

### 조사 항목 2: 고객사(테넌트) Admin 하위 구조 트리

Snowsight 좌측 내비게이션의 **Admin** 섹션:

- **Admin**
  - **Cost management**: 사용량·빌링 정보 (ACCOUNTADMIN만 기본 접근. MONITOR USAGE 권한 부여로 다른 역할에 열기 가능)
  - **Warehouses**: Warehouse 생성/관리/모니터링
  - **Resource Monitors**: Warehouse 크레딧 사용량 모니터 설정 (임계값 기반 알림·중지)
  - **Users & Roles**: (USERADMIN/SECURITYADMIN/ACCOUNTADMIN 접근)
    - Users: 사용자 생성/관리, 기본 역할 지정, MFA 설정
    - Roles: 역할 생성/관리, 역할 계층(hierarchy) 그래프 시각화, 권한 부여
- **Governance & security** (좌측 내비게이션 별도 섹션)
  - **Users & roles**: 위와 동일
  - **Policies**: 네트워크 정책, 비밀번호 정책, 세션 정책 등
  - **Tags**: 오브젝트 태깅 (데이터 분류)
  - **Access History**: 데이터 접근 이력
  - **Dashboards**: 거버넌스 대시보드

### 조사 항목 3: 플랫폼/조직 Admin 하위 구조 트리

ORGADMIN 역할로 접근하는 조직 수준 관리 기능:

- **Accounts**: 조직 내 모든 계정 목록 조회, 새 계정 생성
- **Regions**: 조직에 활성화된 리전 조회
- **Usage**: 조직 전체 사용량 정보 조회
- **Organization Profile**: 조직 정보 관리

ORGADMIN은 개별 계정 내부의 오브젝트(테이블, 뷰 등)에 직접 접근하는 것이 아니라, 계정 생성·조직 수준 모니터링에 집중하는 역할이다.

### 조사 항목 4: AI 거버넌스 배치 위치

Snowflake는 데이터 플랫폼으로, AI 거버넌스는 주로 **데이터 접근 제어**와 **모델 레지스트리** 수준에서 다뤄진다:

- **Governance & security → Policies**: 행 접근 정책(Row Access Policy), 컬럼 마스킹 정책(Dynamic Data Masking) 등이 AI/ML 워크로드의 데이터 접근에도 적용
- **Snowpark ML / Model Registry**: ML 모델 등록·버전 관리·배포 (별도 AI 거버넌스 대시보드는 아님)
- Snowflake Cortex(AI 서비스) 관련 거버넌스 설정은 Admin 섹션이 아닌 각 서비스 사용 시점에서 구성

### 조사 항목 5: 감사 로그 접근 구조와 상세 수준

- **SNOWFLAKE 데이터베이스 → ACCOUNT_USAGE 스키마**: 사전 정의된 뷰를 통해 감사 데이터 조회
  - `LOGIN_HISTORY`: 로그인 이력
  - `QUERY_HISTORY`: 쿼리 실행 이력
  - `ACCESS_HISTORY`: 데이터 접근 이력 (어떤 역할이 어떤 테이블에 접근했는지)
  - `SESSIONS`: 세션 정보
  - `GRANTS_TO_ROLES` / `GRANTS_TO_USERS`: 권한 부여 이력
- **접근 방법**: SQL 쿼리를 통해 직접 조회. ACCOUNTADMIN이 기본 접근 가능하며, `IMPORTED PRIVILEGES ON DATABASE snowflake` 권한 부여로 다른 역할에 열기 가능
- **Governance & security → Access History**: Snowsight UI에서 시각적으로 접근 이력 확인

### 조사 항목 6: 사용량/비용 모니터링 위치

- **Admin → Cost management**: 크레딧 사용량, 스토리지, 데이터 전송 비용 (ACCOUNTADMIN만 기본 접근)
- **Admin → Resource Monitors**: Warehouse별 크레딧 사용량 임계값 설정. 임계값 도달 시 알림 전송 또는 Warehouse 일시 중지
- **ORGADMIN → Usage**: 조직 전체 사용량 조회 (계정별 분석)
- **SNOWFLAKE.ACCOUNT_USAGE → METERING_HISTORY / STORAGE_USAGE**: SQL로 상세 사용량 데이터 조회

### 조사 항목 7: 역할별 메뉴 가시성 정책

- Snowsight에서는 **활성 역할**에 따라 Admin 메뉴 접근 범위가 동적으로 변경된다
- ACCOUNTADMIN: Admin 섹션 전체 접근 (Cost management, Warehouses, Resource Monitors, Users & Roles)
- SYSADMIN: Warehouses 관리 접근 가능, Users & Roles 제한적
- SECURITYADMIN: Users & Roles 전체 접근, Warehouse 관리는 제한적
- USERADMIN: Users & Roles 내 사용자·역할 생성/관리만 가능
- PUBLIC / Custom Roles: 부여된 권한에 따라 접근 범위 결정
- Cost management는 ACCOUNTADMIN에게만 기본 표시되며, MONITOR USAGE 권한을 부여받지 않은 역할에는 메뉴가 보이지 않음

### 조사 항목 8: 다른 기능과의 연결 지점

- **역할 계층(Role Hierarchy) → 오브젝트 접근**: 역할 계층 구조가 데이터베이스·스키마·테이블 접근 권한을 결정
- **Resource Monitors → Warehouse 실행**: 모니터 임계값 도달 시 Warehouse가 자동 중지되어 쿼리 실행에 직접 영향
- **Network Policies → 접속 제어**: Admin에서 설정한 네트워크 정책이 사용자의 Snowflake 접속 IP를 제한
- **Row Access Policy / Dynamic Data Masking → 쿼리 결과**: 거버넌스 정책이 사용자의 쿼리 결과에서 특정 행/컬럼을 필터링·마스킹
- **SCIM 프로비저닝 → 사용자 관리**: 외부 IdP와의 자동 동기화가 사용자·역할 생성/삭제에 연동
- **Access History → 컴플라이언스 감사**: 데이터 접근 이력이 외부 감사·컴플라이언스 도구와 연동 가능

---

## 5. Databricks

### 조사 항목 1: 테넌트/워크스페이스 Admin과 플랫폼/조직 Admin의 분리 방식

Databricks는 **Account Console**(accounts.cloud.databricks.com)과 **Workspace UI** 두 개의 분리된 인터페이스를 운영한다:

- **Account Console**: Account Admin이 접근. 전체 계정에 걸친 워크스페이스 생성, 클라우드 리소스 설정, 사용량 데이터 조회, 계정 수준 ID 관리, 설정, 구독 관리. Unity Catalog 메타스토어 생성도 여기서 수행
- **Workspace UI**: Workspace Admin이 접근. 개별 워크스페이스 내의 ID 관리, 컴퓨트 제어, 설정, RBAC 위임

즉, **물리적으로 분리된 두 개의 웹 인터페이스**가 존재한다. Account Admin은 Account Console에서 전역 관리를 수행하고, Workspace Admin은 각 Workspace UI 내 Settings 페이지에서 워크스페이스 수준 관리를 수행한다.

추가적으로 다음 특수 역할이 존재한다:

- **Metastore Admin**: Unity Catalog 메타스토어의 모든 보안 오브젝트에 대한 권한·소유권 관리. 선택적(optional) 역할
- **Marketplace Admin**: Databricks Marketplace 리스팅 관리
- **Billing Admin**: 서버리스 예산 정책 관리

Account Admin은 Workspace Admin 역할을 위임할 수 있으며, `RestrictWorkspaceAdmins` 설정으로 Workspace Admin의 권한 범위를 제한할 수도 있다.

### 조사 항목 2: 고객사(테넌트) Admin 하위 구조 트리

**Workspace UI → Settings** (Workspace Admin 접근):

- **Identity and access**
  - Users: 워크스페이스 사용자 추가/관리
  - Groups: 그룹 관리
  - Service Principals: 서비스 주체 관리
  - Permissions: 워크스페이스 수준 접근 제어
- **Compute**
  - Compute policies: 클러스터 정책 설정
  - Allowed instance types
  - Unity Catalog access 관련 컴퓨트 설정
- **Workspace settings**
  - General: 워크스페이스 이름, 기본 설정
  - Features: 기능 활성화/비활성화
  - Security: 보안 관련 워크스페이스 설정
  - Notifications: 알림 설정
- **Developer settings**
  - Git integration
  - Personal access tokens
  - Partner Connect

### 조사 항목 3: 플랫폼/조직 Admin 하위 구조 트리

**Account Console** (Account Admin 접근):

- **Workspaces**: 워크스페이스 목록, 생성, 구성 (Identity federation 상태 확인 포함)
- **Catalog** (Unity Catalog):
  - Metastores: 메타스토어 목록, 생성, 워크스페이스 할당
  - 메타스토어별: Workspaces 탭, Metastore Admin 설정
- **Users and groups**:
  - Users: 계정 수준 사용자 관리
  - Groups: 계정 수준 그룹 관리
  - Service principals: 서비스 주체 관리
  - Workspace assignments: 사용자/그룹의 워크스페이스 할당
- **Settings**:
  - Account settings
  - Identity providers (SSO, SCIM)
  - Feature enablement
- **Usage**: 계정 전체 사용량 데이터 (워크스페이스별 분석)
- **Budgets**: 서버리스 예산 정책 관리 (Billing Admin 역할)
- **Cloud resources**: 클라우드 인프라 설정

### 조사 항목 4: AI 거버넌스 배치 위치

- **Account Console → Catalog (Unity Catalog)**: Unity Catalog가 데이터·AI 자산의 중앙 거버넌스 레이어로 기능. 카탈로그·스키마·테이블·모델·함수에 대한 권한 관리
- **Unity Catalog → Model Registry**: ML 모델의 등록·버전 관리·접근 제어. Metastore Admin 또는 카탈로그 소유자가 모델 접근 권한 관리
- **Workspace Settings → Features**: AI/ML 관련 기능 활성화/비활성화 (예: Serverless 컴퓨트)
- **Workspace-Catalog Bindings**: 특정 워크스페이스에서만 특정 카탈로그에 접근 가능하도록 바인딩. 프로덕션 데이터가 개발 워크스페이스에서 접근되지 않도록 제어
- Account Admin이 `RestrictWorkspaceAdmins` 설정으로 Workspace Admin의 Unity Catalog 권한을 제한할 수 있음

### 조사 항목 5: 감사 로그 접근 구조와 상세 수준

- **Audit Log Delivery**: 클라우드 스토리지(S3, ADLS, GCS)로 감사 로그를 자동 전달하도록 설정
- **System Tables**: `system.access.audit` 테이블에서 SQL로 감사 로그 조회
- **추적 대상**: 워크스페이스 접근, 클러스터 생성/삭제, 노트북 실행, Unity Catalog 권한 변경, 사용자 관리 활동 등
- 감사 로그에는 Unity Catalog의 권한 부여(grant) 활동도 기록되므로, 데이터 접근 권한 변경 이력 추적 가능

### 조사 항목 6: 사용량/비용 모니터링 위치

- **Account Console → Usage**: 계정 전체 사용량 대시보드. 워크스페이스별, SKU별 분석
- **Account Console → Budgets**: 서버리스 예산 정책 설정 및 모니터링
- **System Tables**: `system.billing.usage` 등 시스템 테이블에서 SQL로 상세 사용량·비용 분석
- Workspace Admin은 본인 워크스페이스 내 컴퓨트 사용량을 확인할 수 있으나, 계정 전체 빌링은 Account Admin/Billing Admin만 접근

### 조사 항목 7: 역할별 메뉴 가시성 정책

- **Account Admin**: Account Console 전체 접근. 모든 워크스페이스 관리 가능
- **Workspace Admin**: Workspace UI 내 Settings 페이지 접근. Account Console은 접근 불가 (별도 Account Admin 역할 필요)
- **Metastore Admin**: Account Console의 Catalog 섹션에서 메타스토어 관리. 워크스페이스 UI에서도 Unity Catalog 관련 권한 행사
- **Billing Admin**: Account Console의 Budgets 섹션 접근
- **일반 사용자**: Settings 페이지 접근 불가. 본인에게 부여된 역할·권한 범위 내에서 데이터·컴퓨트 사용

Account Admin은 Workspace Admin 권한을 제한(`RestrictWorkspaceAdmins`)하여 Unity Catalog 자동 기본 권한을 축소할 수 있다.

### 조사 항목 8: 다른 기능과의 연결 지점

- **Unity Catalog 권한 → 노트북/쿼리**: 카탈로그·스키마·테이블 접근 권한이 사용자의 노트북·SQL 쿼리 실행 결과에 직접 영향
- **Workspace-Catalog Bindings → 데이터 격리**: Account Admin이 설정한 바인딩이 워크스페이스별 데이터 접근 범위를 결정
- **SCIM 프로비저닝 → ID 관리**: IdP 동기화가 Account Console의 사용자·그룹 관리와 자동 연동
- **Compute Policies → 클러스터 생성**: Workspace Admin이 설정한 컴퓨트 정책이 사용자의 클러스터 생성 옵션을 제한
- **Identity Federation → 워크스페이스 할당**: Account Console에서 관리하는 계정 수준 ID가 워크스페이스에 할당되어야 워크스페이스 접근 가능
- **Audit Log → 외부 SIEM**: 감사 로그 전달 설정이 외부 보안 모니터링 도구와 연동
- **Service Principals → CI/CD**: 서비스 주체가 자동화 파이프라인에서 API 접근 시 사용되며, 권한은 Unity Catalog RBAC로 제어

---

## 6. Dify

### 조사 항목 1: 테넌트/워크스페이스 Admin과 플랫폼/조직 Admin의 분리 방식

Dify는 **Cloud 서비스(SaaS)**와 **Community Edition(오픈소스)**에서 구조가 다르다.

**Dify Cloud**:

- 워크스페이스가 팀 협업의 기본 단위이며, 첫 로그인 시 자동으로 워크스페이스가 생성되고 관리자(Owner)가 된다
- 워크스페이스 내에서 Owner, Admin, Editor, Member 네 가지 역할 존재
- 별도의 "플랫폼 관리" 포탈은 없으며, Dify가 플랫폼 사업자로서 인프라를 관리

**Dify Enterprise**:

- **Enterprise Dashboard(관리자 백엔드)**와 **Workspace**가 분리되어 있다
- **System Administrator**: Enterprise Dashboard에서 전체 멤버 관리, 인증 방법 설정, SSO 구성, 워크스페이스 관리 등을 수행
- **Workspace Owner/Admin**: 개별 워크스페이스 내에서 팀원, 모델 프로바이더, 앱, 지식베이스 등을 관리
- System Administrator와 Workspace Owner는 별도의 역할이며, System Administrator가 Members 목록에 추가되어야 워크스페이스 생성/참여 가능

즉, Enterprise 에디션에서는 **Enterprise Dashboard(플랫폼 관리)와 Workspace(테넌트 관리)가 분리**되어 있으나, 같은 도메인 내에서 접근한다.

**Community Edition**: 단일 워크스페이스만 지원. 다중 워크스페이스 생성 불가.

### 조사 항목 2: 고객사(테넌트) Admin 하위 구조 트리

**Workspace Settings** (워크스페이스 내 Settings):

- **Members**: 팀 멤버 초대/관리, 역할 변경 (Owner, Admin, Editor, Member)
- **Model Providers**: 모델 프로바이더 설정
  - System Providers: Dify 구독을 통한 모델 접근 (별도 설정 불필요)
  - Custom Providers: 자체 API 키로 외부 모델 프로바이더(OpenAI, Anthropic, Google 등) 직접 연결
  - 프로바이더별 활성화/비활성화, API 키 입력
- **Billing**: 구독 관리, 요금제 변경 (Professional ↔ Team), 리소스 사용량 확인
- **Account** (개인 설정):
  - Language/Timezone
  - Password
  - Integrations

각 역할의 권한 요약:

- **Owner**: 팀 멤버 관리, 멤버 권한 조정, 모델 프로바이더 설정, 앱 생성/삭제, 지식베이스 생성, 도구 라이브러리 설정 등 모든 권한
- **Admin**: 멤버 권한 조정 불가. 팀 멤버 추가/제거, 모델 프로바이더 설정, 앱·지식베이스·도구 관리
- **Editor**: 앱 생성/편집, 지식베이스 관리. 멤버·모델 프로바이더 설정 불가
- **Member**: 앱 사용만 가능

### 조사 항목 3: 플랫폼/조직 Admin 하위 구조 트리

**Dify Enterprise Dashboard** (System Administrator 접근):

- **System Settings**
  - System Administrators: 시스템 관리자 추가/제거/비활성화
  - Members: 전체 조직 멤버 관리 (초대, 비밀번호 리셋, 비활성화/삭제)
- **Authentication Methods**
  - Workspace Settings: 인증 방법 활성화/비활성화 (Email+Password, Email+Verification Code)
  - SSO 설정: SAML, OIDC, OAuth2 구성
  - Account creation 정책: 자가 가입 허용, 개인 스페이스 자동 생성
- **Workspace Management**: 전체 워크스페이스 목록 조회/관리
- **Model Configuration**: 엔터프라이즈 수준 모델 프로바이더 설정
- **Web App Settings**:
  - Web App 접근 권한 제어 (내부 사용자, 외부 SSO, 특정 멤버, 공개)
  - Web App External User Authentication (SSO)

### 조사 항목 4: AI 거버넌스 배치 위치

- **Workspace Settings → Model Providers**: 사용 가능한 AI 모델을 워크스페이스 수준에서 제어. Admin/Owner만 프로바이더 추가/제거 가능
- **Dify Enterprise Dashboard → Model Configuration**: 엔터프라이즈 수준에서 허용 모델 프로바이더를 중앙 관리
- **Dify Enterprise Dashboard → Authentication → SSO**: Web App 접근에 SSO 인증을 강제하여 AI 앱 사용자 신원 확인
- **Web App Access Permissions**: 앱별로 접근 가능한 사용자/그룹을 제어하여 AI 앱의 데이터 노출 범위 관리
- 별도의 가드레일/콘텐츠 필터 관리 UI는 Dify 관리자 화면에서 확인되지 않으며, 개별 앱 빌드 단계에서 프롬프트·워크플로 수준으로 제어하는 구조

### 조사 항목 5: 감사 로그 접근 구조와 상세 수준

- Dify Cloud 및 Community Edition에서 별도의 감사 로그(Audit Trail) UI는 공개 문서에서 확인되지 않음
- Dify Enterprise에서는 엔터프라이즈 수준의 감사·로깅 기능이 존재할 가능성이 있으나, 공개 문서에서 상세 구조는 명시되지 않음
- 앱 실행 이력은 개별 앱의 Logs 탭에서 확인 가능 (대화 이력, 입력/출력, 토큰 사용량 등)

### 조사 항목 6: 사용량/비용 모니터링 위치

- **Workspace Settings → Billing**: 팀 리소스 사용 통계 조회 (벡터 스토리지, 문서 업로드, OpenAI 대화 쿼터 등)
- **개별 앱 → Overview**: 앱별 사용량·성능 통계
- **개별 앱 → Logs**: 대화별 토큰 사용량, 비용 추적
- Dify Cloud에서는 구독 플랜별 사용량 제한이 Billing 페이지에서 모니터링됨

### 조사 항목 7: 역할별 메뉴 가시성 정책

- **Owner**: Settings의 모든 탭 접근 가능 (Members, Model Providers, Billing)
- **Admin**: Members 관리 가능 (단, 다른 멤버의 권한 변경 불가), Model Providers 설정 가능, Billing 접근 가능
- **Editor**: Settings 내 Members·Model Providers 설정 접근 불가. 앱·지식베이스 생성/편집만 가능
- **Member**: Settings 접근 제한. 앱 사용만 가능
- **System Administrator (Enterprise)**: Enterprise Dashboard 전체 접근. 워크스페이스에 멤버로 추가되지 않으면 워크스페이스 내부 접근 불가

### 조사 항목 8: 다른 기능과의 연결 지점

- **Model Providers 설정 → 앱 빌드**: 워크스페이스에 설정된 모델 프로바이더만 앱 빌드 시 사용 가능
- **Members 역할 → 앱 편집 권한**: Editor 이상만 앱 편집 가능, Member는 사용만 가능
- **Enterprise SSO → Web App 접근**: System Administrator가 설정한 SSO가 Web App 외부 사용자 인증에 적용
- **Billing 리소스 제한 → 앱 실행**: 쿼터 초과 시 앱 실행이 제한될 수 있음
- **Workspace 권한 → Explorer**: 팀 멤버가 공개 앱을 Discover/Explorer 영역에서 사용
- **Enterprise Dashboard 멤버 관리 → 워크스페이스 멤버**: Enterprise 수준 멤버 추가/삭제가 워크스페이스 접근 가능 인원에 영향

---

## 7. Salesforce Agentforce

### 조사 항목 1: 테넌트/워크스페이스 Admin과 플랫폼/조직 Admin의 분리 방식

Salesforce Agentforce는 **Salesforce 플랫폼의 Setup 환경** 위에 구축되어 있다. Salesforce의 기존 관리 체계를 그대로 활용한다:

- **System Administrator**: Salesforce org(조직) 전체의 설정, 사용자 관리, 보안, 커스터마이징을 담당하는 최상위 관리 역할. Setup 메뉴 전체에 접근 가능
- **Agentforce 관련 관리**: System Administrator가 Setup 내에서 에이전트 설정, 권한 관리, 배포를 수행
- Salesforce는 **단일 org 내에서 Setup이라는 통합 관리 환경**을 제공하며, 별도의 "플랫폼 관리" 포탈은 고객에게 노출되지 않음

멀티 테넌트 관점에서 Salesforce는 SaaS 플랫폼이므로, 각 고객사는 자체 Salesforce org를 가지며 Salesforce가 인프라 수준의 플랫폼 관리를 담당한다.

역할 분리의 특징: Agentforce에서는 **Agent User**라는 별도의 시스템 사용자 개념이 존재한다. 이는 에이전트가 작업을 수행할 때 사용하는 사용자 계정으로, Permission Set을 통해 에이전트의 데이터 접근 범위가 결정된다. Agent User의 권한 설정은 일반 사용자 권한 관리와 같은 메커니즘(Permission Sets)을 사용하지만, 에이전트에 특화된 권한 세트를 별도로 구성해야 한다.

### 조사 항목 2: 고객사(테넌트) Admin 하위 구조 트리

Salesforce **Setup** 내 Agentforce 관련 메뉴:

- **Platform Tools → Agents** (또는 Setup Quick Find → "Agents")
  - Agent Builder: 에이전트 생성/편집/활성화. Topics, Actions, Instructions 구성
  - Agent for Setup (Beta): 관리자를 돕는 내장 에이전트. 사용자 관리, 오브젝트/필드 생성, 권한 문제 트러블슈팅
- **Platform Tools → Einstein**
  - Einstein Setup: Einstein AI 기능 전반 활성화
  - Einstein Bots: 봇 관리 (Agentforce Service Agent의 기반)
- **Administration → Users**
  - Users: 사용자 관리
  - Permission Sets: 권한 세트 생성/관리 (Agentforce 접근 권한 포함)
  - Permission Set Groups: 권한 세트 그룹
  - Profiles: 프로필 관리
  - Roles: 역할 계층 관리
- **Administration → Security**
  - Session Settings
  - Login Flows
  - Auth Providers (SSO)
- **Platform Tools → Feature Settings → Service**
  - Omni-Channel: 에이전트(인간+AI)의 라우팅 설정
  - Embedded Service: 웹사이트에 에이전트 임베딩 설정
  - Messaging: 메시징 채널 설정
  - Queues: 케이스 배정 큐
- **Agentforce Default Admin Permission Set**: 에이전트 관리에 필요한 권한을 묶은 기본 권한 세트
- **Agent Access (Permission Sets 내)**: 역할별로 어떤 Agentforce for employee 에이전트에 접근 가능한지 설정

### 조사 항목 3: 플랫폼/조직 Admin 하위 구조 트리

Salesforce는 SaaS 플랫폼이므로 고객에게 "플랫폼 관리" 포탈을 노출하지 않는다. Salesforce의 멀티 테넌트 인프라 관리는 Salesforce 내부에서 수행된다.

고객이 접근하는 가장 상위 관리 수준은 **org 단위의 System Administrator** 역할이다. 멀티 org 환경(예: 개발/스테이징/프로덕션)을 운영하는 경우, 각 org는 독립적으로 관리되며, Change Sets 또는 DevOps Center를 통해 org 간 배포를 관리한다.

### 조사 항목 4: AI 거버넌스 배치 위치

- **Setup → Einstein**: Einstein AI 기능 전반의 활성화/비활성화
- **Permission Sets → Agent User 권한**: 에이전트가 접근할 수 있는 데이터(오브젝트, 필드)를 Permission Set으로 세밀하게 제어. Principle of Least Privilege 적용이 권장됨
- **Agent Builder → Topics/Instructions**: 에이전트의 행동 범위를 자연어 지시문으로 가드레일 설정
- **Agent Builder → Actions**: 에이전트가 실행할 수 있는 작업(Flow, Apex Action 등)을 명시적으로 정의
- **Omni-Channel Routing**: AI 에이전트와 인간 에이전트 간 에스컬레이션 규칙 설정
- **Digital Wallet**: Agentforce 대화 소비량 모니터링 (사용량 기반 과금)
- 별도의 "AI 거버넌스 대시보드"는 없으며, Salesforce의 기존 접근 제어 메커니즘(Permission Sets, Profiles, Sharing Rules)이 AI 에이전트에도 동일하게 적용됨

### 조사 항목 5: 감사 로그 접근 구조와 상세 수준

- **Setup → Security → View Setup Audit Trail**: Setup 변경 이력 (최근 180일, 최대 20건 UI 표시, CSV 다운로드로 전체 조회)
- **Setup → Event Monitoring** (Shield 추가 라이선스): Login, API, Report Export 등 상세 이벤트 로그
- **Einstein Conversation Insights**: AI 에이전트 대화 분석 (감사 목적보다는 성과 분석)
- **Agentforce 대화 로그**: 에이전트가 처리한 대화는 Salesforce 레코드(Case, Chat Transcript 등)로 저장되어 표준 Salesforce 감사 체계로 추적 가능

### 조사 항목 6: 사용량/비용 모니터링 위치

- **Digital Wallet**: Agentforce 대화 크레딧 소비량 모니터링. 선불·종량 과금 모두 지원
- **Setup → Company Information**: 조직 전반 리소스 사용량 (API 호출 제한, 스토리지 등)
- **Einstein Analytics / Reports**: 에이전트 성과·사용량 분석 리포트 생성 가능

### 조사 항목 7: 역할별 메뉴 가시성 정책

- **System Administrator**: Setup 전체 접근, Agentforce 설정·관리 가능
- **Agentforce Default Admin Permission Set 보유자**: 에이전트 생성/편집/관리. Customize Application 권한 또는 해당 Permission Set 필요
- **일반 사용자 (Agent Access Permission Set 보유)**: 할당된 Agentforce for employee 에이전트만 사용 가능. 에이전트 설정·관리 접근 불가
- **Agent User (에이전트 전용 사용자)**: Permission Set으로 정의된 데이터 접근 범위 내에서만 작동

Setup의 각 메뉴는 사용자의 Profile/Permission Set에 따라 가시성이 결정된다.

### 조사 항목 8: 다른 기능과의 연결 지점

- **Permission Sets → Agent 데이터 접근**: 에이전트용 Permission Set이 에이전트의 오브젝트·필드 접근 범위를 직접 결정
- **Agent Builder → Flows/Apex Actions**: 에이전트 Action이 기존 비즈니스 프로세스(Flow, Apex)와 연결
- **Omni-Channel → Service Console**: AI 에이전트와 인간 에이전트 간 케이스 라우팅·에스컬레이션
- **Embedded Service → 웹사이트/앱**: 에이전트 배포 채널 설정이 외부 채널로 연결
- **Data Cloud → Agent Context**: Data Cloud의 통합 고객 데이터가 에이전트의 의사결정 컨텍스트로 활용
- **Slack 연동 → Agent 채널**: Agentforce for employee 에이전트를 Slack에서 사용 가능
- **Setup Audit Trail → 변경 이력**: 에이전트 설정 변경이 Setup 감사 로그에 기록
- **Digital Wallet → 빌링**: 에이전트 대화 소비가 비용으로 연결

---

## 8. ServiceNow AI Control Tower

### 조사 항목 1: 테넌트/워크스페이스 Admin과 플랫폼/조직 Admin의 분리 방식

ServiceNow AI Control Tower는 **Now Platform 위에 구축된 거버넌스 레이어**로, ServiceNow 인스턴스 내에서 작동한다. ServiceNow의 기존 역할 기반 접근 제어(RBAC) 체계를 활용하되, AI 거버넌스에 특화된 역할들을 추가로 정의한다:

**AI 거버넌스 전용 역할**:

- **AI Asset Owner**: AI 자산의 정확성, 라이프사이클 진행, 가치 실현에 대한 책임
- **AI Steward**: 내부 정책·규제 요구·리스크 관리 표준 준수 보장
- **AI Risk & Compliance Manager**: AI 사용을 통제하는 리스크·컴플라이언스 프레임워크 구성·유지
- **AI Compliance Officer**: 조직 전체 AI 리스크·컴플라이언스 활동 감독
- **AI Assessor**: 할당된 AI 시스템에 대한 평가·인증 수행
- **AI Compliance Contributor**: 거버넌스 운영 지원·컴플라이언스 활동 참여
- **AI Compliance Reader**: 감사·가시성 목적의 읽기 전용 접근
- **AI Governance Workspace Reader**: 거버넌스 워크스페이스 전반의 AI 시스템 가시성
- **GenAI Admin**: Now Assist 등 생성형 AI 기능의 데이터 사용 통제

ServiceNow는 SaaS 플랫폼이므로 인프라 수준의 "플랫폼 관리"는 ServiceNow가 담당한다. 고객은 자체 인스턴스 내에서 AI Control Tower를 구성하여 사용한다.

### 조사 항목 2: 고객사(테넌트) Admin 하위 구조 트리

**AI Control Tower 워크스페이스** 내 구조:

- **AI Strategy** (Strategic Portfolio Management 연동)
  - AI Demand 관리
  - AI Roadmap
  - AI Portfolio
  - Scenario Planning
  - Goal Framework (진행률 추적)
  - AI Strategy Dashboard
- **AI Inventory / AI Catalog**
  - 모든 AI 자산(모델, 에이전트, 워크플로) 등록·카탈로깅
  - CMDB 연동으로 기술 자산과 비즈니스 서비스 매핑
  - 메타데이터 관리 (의도, 범위, 입출력 형식, 관련 리스크)
  - ServiceNow 네이티브 + 서드파티 AI 모두 포함
- **AI Governance**
  - GRC 통합 (Governance, Risk, Compliance)
  - 정책 정의 및 자동화 엔진
  - 리스크 평가 템플릿 (공정성, 정확성, 비즈니스 임팩트, 드리프트)
  - EU AI Act, ISO/IEC 42001 매핑
  - 승인 워크플로 (에이전트 배포 전 승인 프로세스)
- **AI Lifecycle Management**
  - Intake → Assessment → Development → Deployment → Monitoring → Retirement
  - 각 단계별 게이트 및 거버넌스 체크포인트
  - AI Use Case 등록 (Employee Center → Technology Services → AI Assets)
  - 모델 드리프트 탐지 및 알림
- **Performance Dashboards**
  - 실시간 AI 성과 모니터링
  - 비즈니스 아웃컴 매핑 (생산성, 매출, 고객 만족도)
  - ROI 추적
  - 채택 메트릭
- **AI Agent Fabric** 관리
  - 에이전트 간 통신(MCP, A2A 프로토콜) 감독
  - 크로스 에이전트 보안
  - 성능 병목 탐지
- **Model Provider Governance** (Zurich 릴리스)
  - Now Assist/AI Agent에 사용 가능한 모델 프로바이더 제한 (AWS Anthropic, Azure OpenAI, Google Gemini)
  - AI Agent Studio/Now Assist Skill Kit 연동으로 허용 모델만 선택 가능

### 조사 항목 3: 플랫폼/조직 Admin 하위 구조 트리

ServiceNow는 SaaS 플랫폼이므로 고객에게 별도의 "플랫폼 관리" 인터페이스를 제공하지 않는다. 고객 인스턴스의 **System Administrator**가 가장 상위 관리 역할이며, AI Control Tower 내의 역할은 위 조사 항목 1에서 설명한 AI 거버넌스 전용 역할들이다.

단, AI Control Tower는 **ServiceNow 네이티브 + 서드파티 AI 모두를 관리**하는 구조이므로, 사실상 고객 조직 전체의 AI 에코시스템을 관리하는 "조직 수준" 거버넌스 도구의 역할을 한다.

### 조사 항목 4: AI 거버넌스 배치 위치

AI Control Tower **자체가 AI 거버넌스 전용 도구**이다. 거버넌스 기능이 제품의 핵심이므로 모든 기능이 거버넌스와 관련된다:

- **정책 엔진**: 규칙을 한 번 정의하면 모든 AI 자산에 일관 적용. 자동 모니터링 및 알림
- **리스크 평가**: 가이드 템플릿으로 AI 유스케이스를 일관성 있게 평가
- **모델 프로바이더 제한**: AI Agent Studio에서 사용 가능한 모델을 허용 목록으로 제한
- **라이프사이클 게이트**: 각 단계(Intake → Assessment → Development → Deployment)에서 거버넌스 체크포인트 적용
- **Now Assist Guardian / Data Privacy 연동**: 일관된 보안 정책을 모든 AI 에이전트에 적용

### 조사 항목 5: 감사 로그 접근 구조와 상세 수준

- AI Control Tower 내에서 **모든 AI 자산의 라이프사이클 활동이 감사 가능한 형태로 기록**
- 각 AI Use Case는 등록부터 퇴역까지의 모든 단계 변경, 승인, 평가 이력이 추적
- **ServiceNow 기본 Audit 기능**과 연동: 레코드 수준 변경 이력, 사용자 활동 로그
- **GRC 통합**: 규제 준수 증거로 활용 가능한 감사 이력 자동 생성
- **Performance Dashboards**: 경영진 보고 및 규제 증거로 활용

### 조사 항목 6: 사용량/비용 모니터링 위치

- **AI Control Tower → Performance Dashboards**: AI 성과·사용량 실시간 모니터링. 모델 정확도, 속도, 비용, 드리프트 추적
- **AI Strategy (SPM 연동)**: AI 투자 추적, 목표 대비 진행률 모니터링
- **AI Inventory**: 각 AI 자산의 비즈니스 서비스 매핑을 통해 자산별 비용·가치 분석
- ServiceNow 인스턴스 자체의 라이선스·사용량 관리는 ServiceNow 표준 관리 기능에서 수행

### 조사 항목 7: 역할별 메뉴 가시성 정책

AI Control Tower는 역할별로 대시보드 뷰가 다르게 제공된다:

- **C-Suite (CIO, CTO, CAIO, CEO)**: 전사 AI 성과, 리스크, 전략 정렬 대시보드. ROI·채택 메트릭·비즈니스 임팩트 조회
- **AI Compliance Officer / AI Steward**: 거버넌스 정책, 리스크 평가, 컴플라이언스 활동 관리
- **AI Asset Owner**: 본인이 담당하는 AI 자산의 라이프사이클·성과·리스크 관리
- **AI Assessor**: 할당된 AI 시스템의 평가·인증 수행
- **AI Compliance Reader**: 읽기 전용 접근으로 감사·가시성 확보
- **GenAI Admin**: Now Assist 등 생성형 AI 기능의 데이터 사용 설정
- **IT / Governance Teams**: 비용 관리, 서비스 품질, 표준화된 승인 워크플로

### 조사 항목 8: 다른 기능과의 연결 지점

- **CMDB → AI Inventory**: ServiceNow의 기존 기술 자산 인벤토리(CMDB)와 AI 자산이 연결되어 비즈니스 서비스 매핑
- **GRC 모듈 → AI Governance**: 기존 ServiceNow GRC(위험·컴플라이언스) 워크플로가 AI 거버넌스에 통합
- **Strategic Portfolio Management → AI Strategy**: SPM의 포트폴리오·로드맵 관리가 AI 이니셔티브 전략과 연결
- **AI Agent Fabric → AI Control Tower**: 에이전트 간 통신이 Control Tower에서 모니터링·보안 관리
- **Now Assist Skill Kit → Model Provider Governance**: 커스텀 스킬 빌드 시 허용된 모델 프로바이더만 선택 가능
- **Now Assist Guardian / Data Privacy → 보안 정책**: 일관된 보안·프라이버시 정책이 모든 AI 에이전트에 적용
- **Flow Designer → 거버넌스 워크플로**: AI Control Tower의 알림·정정 워크플로가 Flow Designer로 트리거
- **Employee Center → AI Use Case 등록**: 사용자가 Technology Services → AI Assets에서 새 AI 유스케이스를 요청하면 Control Tower로 연결
- **Virtual Agent → 거버넌스 알림**: 거버넌스 이슈 발생 시 Virtual Agent를 통해 관련 팀에 알림

---

## 시각 자료 모음

### OpenAI (ChatGPT Enterprise)

- [ChatGPT Enterprise Workspace Settings 페이지](https://help.openai.com/en/articles/8411955-what-workspace-settings-can-i-control-for-my-workspace) — 워크스페이스 설정 전체 구조(General, Permissions & Roles, Identity & Access 등 탭 구성)를 보여주는 공식 도움말. 2025년 10월 UI 업데이트 반영.
- [Global Admin Console 공식 문서](https://help.openai.com/en/articles/12289294-global-admin-console) — Tenant → Workspace/Organization 계층 구조와 Global Admin 역할을 설명하는 공식 문서. 테넌트 수준 관리 화면 구성을 확인할 수 있음.
- [Workspace Analytics 공식 문서](https://help.openai.com/en/articles/10875114-user-analytics-for-chatgpt-enterprise-and-edu) — Usage 대시보드 (Overview, Benchmark, Task insights, Impact) 구성을 설명. 분석 UI 레이아웃 참고.
- [OpenAI Academy — Feature Controls and Integrations](https://academy.openai.com/public/clubs/admins-6o6xf/resources/feature-controls-and-integrations-with-your-tools) — Settings 페이지 스크린샷 포함. GPTs 탭, Connectors 설정, Compliance API 구성을 시각적으로 보여줌.
- [OpenAI RBAC 가이드](https://developers.openai.com/api/docs/guides/rbac) — API Platform의 Organization → Project 계층 RBAC 구조. 역할·권한 모델 시각 자료.

### Microsoft Copilot Studio

- [Power Platform Admin Center — Copilot Hub 공식 문서](https://learn.microsoft.com/en-us/power-platform/admin/copilot/copilot-hub) — PPAC 내 Copilot 영역(Get started, What's new, Copilot Studio Usage, Settings) 구조를 설명. 관리 센터 내비게이션 구조 참고.
- [DLP 정책 구성 공식 문서](https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-data-loss-prevention) — Copilot Studio DLP 커넥터 분류 화면. 데이터 정책 구성 UI 참고.
- [Copilot Control System Management Controls](https://learn.microsoft.com/en-us/copilot/microsoft-365/copilot-control-system/management-controls) — Copilot Control System 전체 아키텍처. M365 Admin Center, PPAC, Copilot Studio에 걸친 관리 포인트 구조 파악에 유용.
- [Security and Governance Innovations — Ignite 2025](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/security-and-governance-innovations-for-microsoft-365-copilot-and-agents-from-ig/4476172) — M365 Admin Center의 Copilot Security 탭 스크린샷, Purview 통합 카드, SharePoint Admin Agent 등 최신 UI 포함.
- [Practical365 — Copilot Studio Beginner's Guide](https://practical365.com/copilot-studio-beginner-guide/) — PPAC에서 환경 생성, DLP 정책 설정, 라이선스 관리 화면의 실제 스크린샷 포함. 관리자 워크플로 파악에 유용.

### Datadog

- [Organization Settings 공식 문서](https://docs.datadoghq.com/account_management/org_settings/) — Organization Settings 전체 섹션 구조(Users, Teams, Roles, API Keys, Audit Trail 등)를 설명하는 공식 문서.
- [Audit Trail 공식 문서](https://docs.datadoghq.com/account_management/audit_trail/) — Audit Events Explorer UI, 필터링 옵션, NLQ(자연어 쿼리) 기능을 설명. 감사 로그 UI 구조 참고.
- [Audit Trail Best Practices 블로그](https://www.datadoghq.com/blog/audit-trail-best-practices/) — 대시보드 변경 추적, API 키 모니터링 등 감사 활용 시나리오와 UI 스크린샷 포함.
- [RBAC Permissions 공식 문서](https://docs.datadoghq.com/account_management/rbac/permissions/) — 전체 권한 목록, Custom Role 생성, Automatic Updates 설정. 역할 관리 UI 구조 참고.

### Snowflake

- [Access Control Configuration 공식 문서](https://docs.snowflake.com/en/user-guide/security-access-control-configure) — Snowsight UI에서 Users & Roles 관리, 역할 계층 그래프, Cost management 접근 구조를 설명.
- [Access Control Overview 공식 문서](https://docs.snowflake.com/en/user-guide/security-access-control-overview) — Organization → Account → Database → Schema 계층 다이어그램. ORGADMIN에서 PUBLIC까지 역할 계층 시각화 포함.
- [Access Control Best Practices](https://docs.snowflake.com/en/user-guide/security-access-control-considerations) — ACCOUNTADMIN, SYSADMIN, SECURITYADMIN 역할 분리 원칙과 역할 계층 설계 패턴. 관리 구조 설계 참고.

### Databricks

- [Administration Overview 공식 문서](https://docs.databricks.com/aws/en/admin/admin-concepts) — Account Console vs Workspace UI 분리 구조, 각 관리자 역할(Account Admin, Workspace Admin, Metastore Admin, Billing Admin)의 책임 범위를 설명.
- [Unity Catalog Admin Privileges 공식 문서](https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/admin-privileges) — Unity Catalog에서의 각 관리자 역할별 기본 권한, RestrictWorkspaceAdmins 설정. 거버넌스 권한 구조 참고.
- [Enable Workspace for Unity Catalog 공식 문서](https://docs.databricks.com/aws/en/data-governance/unity-catalog/enable-workspaces) — Account Console에서 메타스토어 생성·워크스페이스 할당 과정. 플랫폼 관리 워크플로 참고.

### Dify

- [Dify Workspace 공식 문서](https://docs.dify.ai/guides/workspace) — 워크스페이스 기본 구조, Cloud vs Community Edition 차이, 역할 체계 설명.
- [Dify Model Providers 공식 문서](https://docs.dify.ai/en/use-dify/workspace/model-providers) — System Provider vs Custom Provider 구조, 역할별 접근 권한 설명. 모델 관리 UI 구조 참고.
- [Dify Enterprise System Settings 문서](https://enterprise-docs.dify.ai/en-us/administrator-guide/system-settings) — Enterprise Dashboard의 System Administrator 관리 기능. 플랫폼 관리와 워크스페이스 관리의 분리 구조 확인.
- [Dify Enterprise Authentication 문서](https://enterprise-docs.dify.ai/en-us/administrator-guide/authentication) — Enterprise 수준 인증 방법 설정, SSO, 계정 생성 정책. 플랫폼 수준 보안 설정 구조 참고.
- [Dify Legacy Docs — Team Members Management](https://legacy-docs.dify.ai/guides/management/team-members-management) — Owner, Admin, Editor, Member 역할별 권한 매트릭스. 역할 구조 참고.

### Salesforce Agentforce

- [Salesforce Admins Blog — Agentforce Permissions](https://admin.salesforce.com/blog/2025/get-agentforce-ready-move-from-profiles-to-permission-sets-how-i-solved-it) — Permission Set 기반 Agentforce 접근 제어 설계 패턴. 실무 관리자의 구현 사례와 스크린샷.
- [Trailhead — Grant Access and Use Agentforce](https://trailhead.salesforce.com/content/learn/projects/quick-start-create-employee-agents-in-agentforce/grant-access-and-use-the-agents) — Permission Set 생성, Agent Access 설정, Agentforce UI 사용 과정의 단계별 스크린샷 포함.
- [Setup with Agentforce Beta — Salesforce Admins Blog](https://admin.salesforce.com/blog/2025/introducing-setup-powered-by-agentforce) — Agent for Setup의 Setup 내 동작 UI. 관리자 경험의 AI 에이전트 통합 방식 참고.
- [Salesforce Ben — Agent for Setup](https://www.salesforceben.com/agent-for-setup-your-salesforce-admin-ai-assistant/) — Agent for Setup 데모, Agents Setup 페이지 UI, 권한 요구사항 등 실제 화면 포함.
- [Twistellar — How to Create Agentforce Service Agent](https://twistellar.com/blog/how-to-create-salesforce-agentforce-service-agent) — Agent Builder UI, Permission Set 구성, Omni-Channel 설정 등 단계별 스크린샷 포함.

### ServiceNow AI Control Tower

- [ServiceNow AI Control Tower 공식 제품 페이지](https://www.servicenow.com/products/ai-control-tower.html) — 제품 개요, 주요 기능(Strategy, Governance, Management, Performance), 대시보드 UI 미리보기.
- [ServiceNow Newsroom — AI Control Tower Launch](https://newsroom.servicenow.com/press-releases/details/2025/ServiceNow-Launches-AI-Control-Tower-a-Centralized-Command-Center-to-Govern-Manage-Secure-and-Realize-Value-From-Any-AI-Agent-Model-and-Workflow/default.aspx) — Knowledge 2025 발표 자료. AI Control Tower + AI Agent Fabric 아키텍처 개요.
- [ServiceNow Community — AI Without Chaos: Deep Dive](https://www.servicenow.com/community/servicenow-ai-platform-forum/ai-without-chaos-a-deep-dive-into-ai-control-tower/td-p/3455272) — AI Control Tower 역할 구조, 라이프사이클 관리, AI Use Case 등록 프로세스의 상세 설명. 역할별 접근 구조와 워크플로 참고에 매우 유용.
- [ServiceNow Community — Zurich Release Mastering AI Governance](https://www.servicenow.com/community/grc-blog/servicenow-ai-control-tower-in-the-zurich-release-mastering-ai/ba-p/3365258) — Zurich 릴리스(2025.12 GA)의 신기능. AI Strategy Dashboard, Model Provider Governance, 확장된 AI Inventory 등.
- [ServiceNow Community — Introducing AI Control Tower](https://www.servicenow.com/community/admin-experience-blogs/introducing-the-servicenow-ai-control-tower-from-intelligent/ba-p/3261185) — 구현 가이드: 역할 정의, 모델 온보딩, 평가 메트릭 정의, 대시보드 활용 시나리오.
- [nowai.dev — Developer's Guide to AI Control Tower](https://nowai.dev/blog/ai-control-tower/) — 기술적 아키텍처, AI Agent Fabric 연동, Now Assist Skill Kit 통합, 단계별 구현 가이드. 개발자 관점 참고.

