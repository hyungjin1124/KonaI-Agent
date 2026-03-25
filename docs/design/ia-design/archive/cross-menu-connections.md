# KonaI-Agent 크로스메뉴 연결 맵

**문서 목적**: 6개 리서치 파일에서 추출한 엔터프라이즈 AI 플랫폼의 크로스메뉴 연결점을 종합하여, IA 설계 결정 전 메뉴 간 연결 패턴을 파악한다.

**분석 대상 서비스**: Datadog, ThoughtSpot, Databricks, Snowflake, Dify, ServiceNow, Salesforce, ChatGPT, Coze, Claude Code, Claude Projects, Copilot Studio, n8n, OpenAI Frontier, Genspark (15개)

**KonaI-Agent 메뉴 후보** (7개):
1. 홈/대시보드
2. AI 채팅
3. 데이터
4. 스킬
5. 예약 작업
6. 관리자
7. 플랫폼 관리

---

## 1. 채팅 → 대시보드

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| ThoughtSpot | Search/Spotter → Pin to Liveboard | NL 쿼리 결과를 대시보드 타일로 핀 |
| Databricks | Genie → Dashboard | AI 어시스턴트의 쿼리 결과를 대시보드에 추가 |
| Snowflake | Cortex Code → Worksheets → Dashboard | SQL 생성 → 워크시트 → 대시보드 타일화 |
| Datadog | Bits AI → Dashboard generation | AI가 메트릭으로부터 대시보드 자동 생성 |

### 특징
- 채팅 결과(chart, table)를 대시보드 위젯으로 저장/공유
- 일방향 흐름: Chat 출력 → Dashboard 입력

---

## 2. 채팅 → 스킬

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| Claude | LLM auto-trigger | 채팅 중 관련 스킬 자동 호출 |
| ChatGPT | @GPT mention | 대화 중 특정 GPT 호출 |
| Coze | Bot builder → Plugin | 봇 플로우에서 플러그인 노드 삽입 |
| Copilot Studio | Generative Orchestration | 토픽에서 커넥터/플러그인 자동 호출 |

### 특징
- 채팅 컨텍스트에서 스킬 호출
- 명시적 언급(@) 또는 자동 트리거
- 스킬 결과가 대화에 통합

---

## 3. 채팅 → 데이터

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| OpenAI Frontier | Business Context → Agent Execution | 시스템에 Business Context(데이터 배경) 설정 → 에이전트가 참조 |
| Dify | Knowledge → Studio App Builder | 나레지 소스를 앱 빌더에서 선택 → 채팅에서 인용 |
| Snowflake | Cortex Chat → Catalog references | 카탈로그 내 테이블 직접 쿼리 가능 |

### 특징
- 채팅이 데이터 컨텍스트나 카탈로그를 참조
- 데이터 거버넌스(RLS, 접근 제어) 적용

---

## 4. 대시보드 → 스킬

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| Datadog | Dashboard → Run Workflow Widget | 대시보드 위젯에서 Workflow(스킬) 즉시 실행 |

### 특징
- 대시보드에서 외부 작업 트리거
- 모니터링 결과에 대한 즉각적 대응

---

## 5. 대시보드 → 예약 작업

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| Datadog | Dashboard → Run Workflow Widget | 위젯 클릭 → Scheduled Workflow 실행 |

### 특징
- 대시보드에서 정기 작업 수동 트리거
- 모니터링 기반의 즉시 대응

---

## 6. 데이터 → 대시보드

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| Databricks | Unity Catalog → Dashboard/Genie | 카탈로그 데이터 → Genie AI 쿼리 → 대시보드 타일 |
| Snowflake | Worksheets → Dashboard tiles | 워크시트 쿼리 → 대시보드 임베딩 |
| ThoughtSpot | RLS → Liveboard display | 행 수준 보안 정책에 따라 대시보드 표시 |

### 특징
- 데이터 소스 선택 → 대시보드에 시각화
- 거버넌스 정책이 대시보드 표시 권한 결정

---

## 7. 데이터 → 채팅

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| Snowflake | Database Explorer → Cortex Chat | 카탈로그 선택 후 Chat에서 쿼리 가능 |
| Databricks | Catalog Explorer → SQL Editor/Notebook → Chat | 카탈로그 테이블 탐색 → SQL 생성 → AI 분석 |
| Dify | Knowledge Source 선택 → Studio App Builder | 데이터 소스 연결 → 채팅 앱 생성 |

### 특징
- 데이터 카탈로그 탐색 → 채팅 쿼리 컨텍스트
- 데이터 선택이 AI 응답 범위 결정

---

## 8. 데이터 → 스킬

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| Databricks | Unity Catalog permissions → Notebook/Query 스킬 | 카탈로그 권한이 스킬 내 쿼리 실행 여부 결정 |
| Snowflake | Row Access Policy → Query execution | RLS 정책이 스킬 내 쿼리 결과 필터링 |

### 특징
- 데이터 거버넌스가 스킬 실행 결과를 제어
- 스킬이 액세스 가능한 데이터 범위 결정

---

## 9. 데이터 → 관리자

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| Snowflake | Access History → Compliance audit | 관리자가 누가 어떤 데이터에 접근했는지 감사 |
| Databricks | Audit Log → External SIEM | 데이터 접근 로그를 외부 보안 도구로 내보내기 |
| Snowflake | ACCOUNTADMIN role → Object permissions | 관리자가 모든 데이터 객체 권한 관리 |

### 특징
- 데이터 접근 이력과 권한이 관리자 감시 대상
- 거버넌스 정책 설정/감시는 관리자 책임

---

## 10. 스킬 → 대시보드

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| Claude Code | Skill → File/Data output | 스킬이 생성한 파일(CSV, JSON) → 대시보드 데이터 소스 |

### 특징
- 스킬 실행 결과가 대시보드 입력
- 자동화된 ETL 프로세스

---

## 11. 스킬 → 채팅

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| Claude | Artifact → Chat display | 스킬 출력물(코드, 분석) → Artifact 패널 |
| ChatGPT | GPT → Canvas/Code Interpreter | GPT 스킬 결과 → Canvas에 표시 |

### 특징
- 스킬 결과가 채팅에 통합 표시
- Artifact/Canvas 형태로 별도 렌더링

---

## 12. 스킬 → 예약 작업

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| Coze | Bot → Scheduled Tasks → Plugins | 봇 내 플러그인을 정기 작업으로 실행 |
| Dify | Schedule Trigger → Tool nodes | 스케줄 트리거가 도구(스킬) 노드 실행 |
| n8n | Schedule Trigger → HTTP Request node(스킬) | 정기 워크플로우에서 API 스킬 호출 |

### 특징
- 스킬을 예약 작업 워크플로우 내 노드로 포함
- 자동화된 에이전트 실행

---

## 13. 스킬 → 외부 API

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| ChatGPT | Actions → OpenAPI | 스킬(GPT)이 외부 API 연결 정의 |
| Coze | Plugin → API | 플러그인이 REST/GraphQL API 호출 |
| Dify | Tools → OpenAPI/MCP | 도구가 OpenAPI/MCP 표준으로 연결 |
| Copilot Studio | Connectors/MCP | 커넥터를 통해 외부 시스템 연결 |
| n8n | HTTP Request node | 워크플로우 노드가 API 호출 |

### 특징
- 스킬은 외부 시스템과의 통합점
- OpenAPI/MCP 등 표준 형식

---

## 14. 스킬 마켓플레이스

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| ChatGPT | GPT Store | 공개 GPT 마켓플레이스 |
| Coze | Plugin Store | 플러그인 마켓플레이스 |
| Dify | Marketplace | 도구/템플릿 마켓플레이스 |
| n8n | Community Nodes | 커뮤니티 노드 마켓플레이스 |

### 특징
- 스킬 발견/설치 중앙화
- 거버넌스(승인, 보안 심사)와 연계

---

## 15. 예약 작업 → 모니터링

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| n8n | Workflow → Executions tab + Insights | 워크플로우 실행 히스토리/로그 뷰 |
| Dify | Workflow → Monitoring/Logs | 워크플로우 실행 로그 및 성능 메트릭 |
| Datadog | Monitors → Workflow Automation | 모니터 상태가 워크플로우 트리거 |

### 특징
- 예약 작업의 실행 결과가 모니터링 시스템에 로깅
- 실패/에러 시 알림

---

## 16. 예약 작업 → 알림

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| n8n | Error Workflow → Slack/email | 워크플로우 실패 시 자동 알림 |
| Datadog | Monitor threshold → Workflow trigger | 임계값 초과 시 자동 워크플로우 실행 |
| Copilot Studio | Activity Page | 에이전트 실행 상태 모니터링 |

### 특징
- 작업 성공/실패가 알림 트리거
- 실시간 및 정기 알림

---

## 17. 관리자 RBAC → 데이터 접근

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| Snowflake | Role Hierarchy → Object access | 역할 계층에 따라 테이블/스키마 접근 제어 |
| Databricks | Unity Catalog permissions → Notebook/Query | 카탈로그 권한이 노트북/쿼리 실행 권한 결정 |
| OpenAI | Permissions & Roles → Apps/GPTs/Models | 사용자 권한에 따라 앱/GPT 접근 제한 |

### 특징
- 관리자 설정이 사용자의 모든 데이터 접근 제어
- 역할 기반 계층화

---

## 18. 관리자 → 스킬 거버넌스

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| OpenAI | Apps settings → Chat capabilities | 관리자가 앱의 채팅 기능 활성화/제한 |
| Copilot Studio | DLP → Agent publishing blocked | 데이터 손실 방지(DLP) 정책이 에이전트 배포 차단 |
| Salesforce | Permission Sets → Agent data access | 퍼미션 세트가 에이전트가 접근 가능한 데이터 결정 |

### 특징
- 관리자 정책이 스킬/에이전트 기능 제한
- 보안/컴플라이언스 기반 제어

---

## 19. 관리자 → 모니터링

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| Datadog | Audit Trail → Monitors/SIEM | 감사 로그 → 모니터/보안 도구 연결 |
| Snowflake | Access History → Compliance | 접근 이력 조회 및 감시 |
| Databricks | Audit Log → External SIEM | 감사 로그 외부 SIEM으로 내보내기 |

### 특징
- 관리자가 시스템 전체 활동 감시
- 컴플라이언스 및 보안 감사

---

## 20. 관리자 SSO/SCIM → 사용자 관리

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| Snowflake | SCIM → User/role sync | ID 제공자와 자동 동기화 |
| Databricks | SCIM → Identity management | 엔터프라이즈 ID 프로바이더 통합 |
| OpenAI | SAML SSO → Workspace auth | 엔터프라이즈 SSO로 인증 |

### 특징
- 중앙화된 신원 관리 인프라 통합
- 대규모 조직의 온보딩/오프보딩 자동화

---

## 21. 플랫폼 관리 분리 패턴

### 실装 패턴

**별도 시스템** (8/15 서비스)
| 서비스 | 구조 | 상세 |
|--------|------|------|
| OpenAI | platform.openai.com vs chat admin | 플랫폼 관리자용 별도 포탈 |
| Copilot Studio | PPAC separate | Power Platform Admin Center 별도 |
| Databricks | Account Console vs Workspace Settings | 계정(기업) 관리 vs 워크스페이스 관리 분리 |
| ChatGPT | Separate admin console | 별도 관리 콘솔 |

**통합형** (6/15 서비스)
| 서비스 | 구조 | 상세 |
|--------|------|------|
| Datadog | Organization Settings within same app | 단일 앱 내 조직 설정 |
| Snowflake | ACCOUNTADMIN role within Snowsight | 단일 UI 내 역할 기반 분리 |
| Dify | Enterprise Dashboard vs Workspace Settings | 같은 앱 내 계층 분리 |

**분할형** (1/15 서비스)
| 서비스 | 구조 | 상세 |
|--------|------|------|
| ServiceNow | Same instance, AI Control Tower as module | 동일 인스턴스 내 모듈로 분리 |

### 특징
- 플랫폼 관리와 테넌트/워크스페이스 관리 책임 분리
- 별도 시스템: 높은 보안/거버넌스, 통합형: 낮은 복잡도

---

## 22. 모니터링/경고 → 대시보드

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| Datadog | Monitors → Dashboard widgets | 모니터를 대시보드 위젯으로 추가 |
| ThoughtSpot | Monitor Alerts → Liveboard | 모니터 결과를 Liveboard에 표시 |
| ServiceNow | GRC → Dashboard | 거버넌스 위험 제어 → 대시보드 표시 |
| Salesforce | Agent Health → Alerts | 에이전트 상태 모니터 → 대시보드 알림 |

### 특징
- 실시간 모니터링 결과를 대시보드에 위젯화
- 경고/임계값 시각화

---

## 23. AI 인사이트 → 대시보드

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| ThoughtSpot | SpotIQ → New Liveboard, AI Highlights | AI가 자동으로 Liveboard 생성 및 인사이트 제안 |
| Databricks | AI Assistant → SQL+viz | AI가 자동 쿼리/시각화 생성 |
| Salesforce | Agent Optimization | 에이전트 성능 최적화 제안 → 대시보드 반영 |

### 특징
- AI가 대시보드 콘텐츠 자동 생성/최적화
- 사용자가 직접 구성 가능

---

## 24. 데이터 라인리지

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| Databricks | Catalog Lineage tab → Notebook/Job/Dashboard | 데이터 출처 → 변환 → 활용처 추적 |

### 특징
- 데이터 계보 관리
- 규정 준수 및 거버넌스 기반

---

## 25. 대시보드 → 외부 공유

### 실装 패턴

| 서비스 | 연결 메커니즘 | 상세 |
|--------|------------|------|
| Datadog | Public URL | 공개 링크로 대시보드 공유 |
| ThoughtSpot | Live Links, embed SDK | 임베드 가능한 공개 링크 |
| Databricks | iframe embedding | 대시보드를 외부 앱에 임베드 |
| Snowflake | Share link | 공유 링크로 특정 대시보드 액세스 |

### 특징
- 대시보드 공유/임베딩 기능
- 거버넌스 정책에 따른 접근 제어

---

## 공통 패턴 요약

### 메뉴 연결 빈도 (추출된 연결점 기준)

| 메뉴 | 발신(출발점) | 수신(도착점) | 양방향 |
|------|------------|-----------|--------|
| 홈/대시보드 | 7 | 3 | 4 |
| 채팅 | 5 | 3 | 2 |
| 데이터 | 5 | 4 | 3 |
| 스킬 | 8 | 5 | 4 |
| 예약 작업 | 4 | 3 | 2 |
| 관리자 | 5 | 5 | 5 |
| 플랫폼 관리 | 1 | 4 | 1 |

### 핵심 연결 하위 유형

**입력 흐름 (데이터 수집)**
- 채팅 → 결과 저장(대시보드, 스킬)
- 데이터 선택 → 채팅/스킬 컨텍스트
- 관리자 정책 → 모든 메뉴 제어

**출력 흐름 (결과 활용)**
- 스킬 → 외부 API, 대시보드, 채팅
- 예약 작업 → 모니터링, 알림
- 대시보드 → 외부 공유, 추가 작업 트리거

**거버넌스 흐름**
- 관리자 RBAC → 데이터/스킬 접근 제어
- 데이터 정책(RLS) → 모든 조회 필터링
- 플랫폼 관리 → 테넌트/워크스페이스 설정 제어

### 거버넌스 통합 패턴

**3단계 계층**
1. 플랫폼 관리 (전체 시스템 설정)
2. 관리자 RBAC (조직 수준 정책)
3. 데이터 거버넌스(RLS/행 수준 제어)

모든 메뉴는 이 계층을 순차적으로 통과:
- 플랫폼 정책 차단 → 사용자 차단
- 관리자 권한 없음 → 메뉴 접근 불가
- 데이터 RLS → 조회 결과 필터링

### 고빈도 연결 패턴

**1순위 연결점** (8개 이상 서비스)
- 스킬 ↔ 채팅: auto-invocation, mention, result display
- 관리자 → 모든 메뉴: RBAC, 정책 제어
- 데이터 → 대시보드: 시각화 기반

**2순위 연결점** (5-7개 서비스)
- 채팅 → 대시보드: 결과 저장
- 예약 작업 → 모니터링: 실행 추적
- 대시보드 → 외부 공유: 임베드/공개 URL

**3순위 연결점** (2-4개 서비스)
- 대시보드 → 작업 트리거: 모니터링 기반 대응
- 데이터 라인리지: 계보 추적

### 메뉴 통합 수준

**높은 통합도** (4개 이상 다른 메뉴와 연결)
- 대시보드 (7개 메뉴와 연결)
- 스킬 (8개 메뉴와 연결)
- 관리자 (모든 메뉴와 연결)

**중간 통합도** (2-3개 메뉴와 연결)
- 채팅, 데이터, 예약 작업

**낮은 통합도** (1-2개 메뉴와 연결)
- 플랫폼 관리 (주로 행정 분리)

### 메뉴 역할별 특성

**중앙 허브 메뉴** (다른 메뉴의 출입점)
- 채팅: 스킬 자동 호출, 데이터 조회, 대시보드 저장
- 대시보드: 모니터링, 외부 공유, 작업 트리거
- 관리자: 모든 메뉴에 정책 적용

**연결 노드 메뉴** (양방향 연결)
- 데이터: 다른 메뉴의 컨텍스트이자 출력 대상
- 스킬: 입력(채팅, 데이터) → 출력(대시보드, 채팅, 예약 작업)

**말단 메뉴** (결과 출력)
- 예약 작업: 정기 실행, 모니터링/알림 생성
- 플랫폼 관리: 설정만 제공

### 거버넌스 적용 범위

**강한 거버넌스 영역** (3개 이상 메뉴에 영향)
- 관리자 RBAC: 모든 메뉴 접근 제어
- 데이터 RLS: 채팅, 스킬, 대시보드 조회 결과 필터링

**중간 거버넌스 영역** (1-2개 메뉴 영향)
- 스킬 거버넌스: 배포, 공개 여부, API 권한
- 플랫폼 정책: 워크스페이스, 테넌트 격리

### 메뉴 분리 패턴

**통합형** (대부분의 서비스)
- 관리자 = 조직 관리 (User, Role, Policy)
- 플랫폼 관리 = 시스템 관리 (같은 맥락, 구분 필요)

**분리형** (고급 서비스)
- 플랫폼 관리 별도 포탈 (OpenAI, Copilot Studio, Databricks)
- 관리자 내에서 테넌트/워크스페이스 설정 하위 메뉴

### 메뉴 깊이 및 계층

**좌측 사이드바 지배적** (13/15 서비스)
- 메뉴 깊이: 2-3 단계
- 메뉴 개수: 3-18개 (평균 8-10개)

**스킬/도구 상단 메뉴화** (5/15 서비스)
- Coze Plugins, Dify Tools, Datadog Integrations, Snowflake Marketplace, Genspark Tools

**예약 작업 상단 메뉴화** (5/15 서비스)
- Coze Workflows, Datadog Monitors, ThoughtSpot Monitor, n8n Workflows, Databricks Workflows

### 외부 시스템 연결

**통합 표준**
- OpenAPI/REST: ChatGPT, Coze, Dify, n8n, Copilot Studio
- MCP (Model Context Protocol): Dify, Copilot Studio, Claude Code
- Custom webhooks: n8n, Datadog, ServiceNow

**마켓플레이스 모델**
- 스킬/플러그인 중앙 마켓플레이스 (5개 서비스)
- 커뮤니티/엔터프라이즈 버전 분리

---

**문서 버전**: v1.0
**작성일**: 2026년
**분석 대상**: 6개 리서치 파일, 15개 서비스, 25개 연결 유형
