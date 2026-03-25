# KonaI-Agent 관리자 메뉴 정보 아키텍처 설계

> **작성 일자**: 2026-03-21
> **목적**: KonaI-Agent 플랫폼의 관리자(Admin) 메뉴 정보 아키텍처 및 화면 구성 상세 설계
> **기반 자료**: `05-admin.md` 벤치마크 리서치, KonaI-Agent 프로젝트 컨텍스트
> **적용 범위**: 고객사 관리자(Client Admin) + 플랫폼 관리자(Platform Admin) 통합 메뉴

---

## 1. 메뉴 목적 (한 문장)

KonaI-Agent 플랫폼의 데이터 거버넌스, AI 거버넌스, 사용자 관리, 감시·감사를 통해 엔터프라이즈급 통제와 컴플라이언스를 실현하는 중앙 관리 허브.

---

## 2. 역할 정의 및 접근 권한 모델

### 2.1 역할 정의

| 역할 | 영문명 | 설명 | 접근 범위 |
|------|--------|------|---------|
| 고객사 관리자 | Client Admin | 고객사(현재 테넌트) 내의 사용자, 권한, 데이터 접근, AI 거버넌스 관리 | 현재 테넌트 전체 |
| 플랫폼 관리자 | Platform Admin | 플랫폼 수준의 테넌트 관리, 전체 사용량, 시스템 설정 (향후 멀티테넌트 확장 시) | 시스템 전체 |

### 2.2 현재 상태 (RBAC 미구축)

- **현재 RBAC 미구축**: 역할/권한 시스템이 실장되지 않은 상태
- **확정 테넌트 1개**: 단일 고객사 프로토타입 단계
- **구현 방식**: 관리자 메뉴 내에서 역할 기반 탭/섹션 표시/숨김으로 구현
  - 플랫폼 관리자 역할이 부여된 사용자에게만 추가 탭(테넌트 관리, 전체 사용량, 시스템 설정) 노출
  - 하위 탭은 역할 검사(role check) 후 조건부 렌더링

### 2.3 향후 확장 (멀티테넌트 SaaS)

- 향후 별도의 Platform Admin Console 분리 고려 (현재: 같은 앱 내 조건부 표시)
- SCIM, SSO, 커스텀 역할(Custom Roles) 지원 계획

---

## 3. 메뉴 구조 및 탭 구성

### 3.1 최상위 항목: "관리자" 메뉴

**위치**: GNB(상단 네비게이션)의 마지막 항목
**URL**: `/admin`
**진입 조건**: Admin 역할 소유자만 접근

### 3.2 탭 구성 (Client Admin이 항상 표시)

```
관리자 (탭 형태)
├── 사용자 관리
├── 권한 관리
├── 감시·감사
├── 사용량 모니터링
└── AI 거버넌스
```

### 3.3 추가 탭 (Platform Admin 역할일 때만 표시)

```
관리자 (탭 형태)
├── [Client Admin 탭들]
├── [구분선]
├── 테넌트 관리 (Platform Admin 전용)
├── 전체 사용량 (Platform Admin 전용)
└── 시스템 설정 (Platform Admin 전용)
```

**조건부 렌더링 로직** (TypeScript):
```tsx
const adminTabs = [
  { id: 'users', label: '사용자 관리', roles: ['client_admin', 'platform_admin'] },
  { id: 'permissions', label: '권한 관리', roles: ['client_admin', 'platform_admin'] },
  { id: 'audit', label: '감시·감사', roles: ['client_admin', 'platform_admin'] },
  { id: 'usage', label: '사용량 모니터링', roles: ['client_admin', 'platform_admin'] },
  { id: 'ai_governance', label: 'AI 거버넌스', roles: ['client_admin', 'platform_admin'] },

  // Platform Admin 전용
  { id: 'tenants', label: '테넌트 관리', roles: ['platform_admin'] },
  { id: 'platform_usage', label: '전체 사용량', roles: ['platform_admin'] },
  { id: 'system_settings', label: '시스템 설정', roles: ['platform_admin'] },
];

// 현재 사용자 역할에 따라 필터링
const visibleTabs = adminTabs.filter(tab =>
  tab.roles.includes(currentUser.role)
);
```

---

## 4. 각 탭의 화면 구성 요소

### 4.1 사용자 관리 (Users)

**목적**: 조직 내 사용자 계정 생성, 편집, 비활성화, 권한 할당
**진입 권한**: Client Admin, Platform Admin

**화면 구성**:
- **좌측 패널**:
  - 필터 (활성/비활성, 부서, 역할, 검색)
  - 빠른 작업 버튼 (사용자 초대, 일괄 업로드)

- **중앙 테이블**:
  - 사용자 목록 (이름, 이메일, 역할, 부서, 상태, 마지막 활동)
  - 정렬/페이지네이션
  - 행 선택 (일괄 작업)

- **사용자 상세 패널** (선택 시 우측 슬라이드):
  - 기본 정보 (이름, 이메일, 부서)
  - 역할 할당 (드롭다운)
  - 권한 세부 사항 (read-only)
  - 활성화/비활성화 버튼
  - 마지막 로그인 시간
  - 생성 일시, 수정 일시

**주요 작업**:
- 새 사용자 초대 (이메일 입력 → 이메일 발송)
- 역할 변경 (드롭다운 선택 후 저장)
- 사용자 비활성화 (데이터 삭제 아님)
- 일괄 초대 (CSV 업로드)
- 비밀번호 재설정 링크 발송

---

### 4.2 권한 관리 (Permissions)

**목적**: 역할 정의, 권한 할당, 데이터/기능별 접근 제어
**진입 권한**: Client Admin, Platform Admin
**구조**: 역할 → 권한 매트릭스 형태

**화면 구성**:

#### 4.2.1 역할 목록 (좌측 네비게이션)
```
└── 역할 (Roles)
    ├── 기본 역할
    │   ├── 관리자 (Admin) — 모든 권한
    │   ├── 편집자 (Editor) — 데이터 생성/수정, 에이전트 실행
    │   ├── 뷰어 (Viewer) — 읽기만
    │   └── 에이전트 (Agent User) — AI 에이전트 실행 권한
    └── 커스텀 역할
        ├── [사용자 정의 역할 1]
        └── [사용자 정의 역할 2]
```

#### 4.2.2 역할 상세 페이지
- **역할 정보**:
  - 역할명, 설명
  - 멤버 수 (링크 → 사용자 관리로 이동)

- **권한 매트릭스** (체크박스):
  - **데이터 접근**: 데이터 조회, 데이터 생성, 데이터 수정, 데이터 삭제
  - **채팅**: 채팅 접근, 채팅 이력 조회
  - **스킬**: 스킬 조회, 스킬 생성, 스킬 편집, 스킬 배포
  - **데이터 파이프라인**: 파이프라인 조회, 파이프라인 생성, 파이프라인 실행
  - **AI 거버넌스**: 정책 설정, 가드레일 관리, 콘텐츠 필터 설정, 감사 로그 조회
  - **관리자 기능**: 사용자 관리, 권한 관리, 시스템 설정

- **저장/취소 버튼**

#### 4.2.3 커스텀 역할 생성
- 모달 또는 슬라이드 패널
- 역할명, 설명 입력
- 권한 매트릭스에서 필요한 권한 선택
- 생성 후 해당 역할에 사용자 할당 가능

**주요 작업**:
- 기본 역할 권한 편집 (Admin은 제외)
- 커스텀 역할 생성/편집/삭제
- 역할별 멤버 조회

---

### 4.3 감시·감사 (Audit & Monitoring)

**목적**: 플랫폼 활동 로그 추적, 컴플라이언스 증거 확보, 보안 모니터링
**진입 권한**: Client Admin, Platform Admin

**화면 구성**:

#### 4.3.1 감사 로그 (Audit Trail)
- **필터 섹션** (좌측 또는 상단):
  - 날짜 범위 (From ~ To)
  - 이벤트 유형 (드롭다운): 로그인, 데이터 생성/수정/삭제, 권한 변경, AI 거버넌스 설정 변경, 감사 설정 변경
  - 사용자 (검색/드롭다운)
  - 리소스 유형 (데이터, 스킬, 에이전트, 권한, 정책)
  - 상태 (성공, 실패)

- **로그 테이블**:
  - 타임스탬프, 사용자, 이벤트 유형, 리소스, 변경 내용, 상태, IP 주소
  - 행 클릭 → 상세 보기 (변경 전후 값, 상세 메타데이터)

- **Export** 버튼:
  - CSV, JSON 포맷 다운로드
  - 날짜 범위 내 전체 로그 또는 필터링된 로그

**추적 대상** (리서치 기반):
- **인증**: 사용자 로그인, SSO, 비밀번호 변경
- **사용자 관리**: 사용자 초대, 역할 변경, 비활성화, 삭제
- **권한 변경**: 역할 편집, 커스텀 역할 생성, 권한 할당
- **데이터 작업**: 데이터 생성, 수정, 삭제, 대량 업로드
- **AI 거버넌스**: 가드레일 설정, 콘텐츠 필터 변경, 정책 수정
- **관리자 설정**: 시스템 설정 변경, 통합 설정

#### 4.3.2 활동 모니터 (Activity Monitor) — 선택 사항
- 실시간 활동 피드 (최근 100개 이벤트)
- 활동 유형별 색상 코딩 (로그인: 파랑, 데이터 변경: 주황, 거버넌스: 빨강)
- 사용자별 활동 그래프 (시간대별)

---

### 4.4 사용량 모니터링 (Usage Monitoring)

**목적**: 플랫폼 사용량, AI 거버넌스 규정 준수 현황, 비용 추적
**진입 권한**: Client Admin, Platform Admin

**화면 구성**:

#### 4.4.1 대시보드 (Overview)
- **Key Metrics** (KPI 카드):
  - 월간 활성 사용자 (MAU)
  - 채팅 메시지 수 (누적)
  - 실행된 스킬 수
  - 처리된 데이터 건수 (MB 또는 건 수)
  - 현재 테넌트의 비용 (월초 대비 %변화)

- **사용 추이 그래프**:
  - 월별 / 주별 사용량 라인 차트
  - 사용자별 상위 10개 에이전트
  - 데이터 파이프라인별 실행 횟수 (막대 차트)

- **AI 거버넌스 컴플라이언스**:
  - 정책 위반 횟수 (이번 달)
  - 차단된 요청 수
  - 가드레일 트리거 사건 (최근 10개)

#### 4.4.2 상세 사용 분석
- **탭**: 사용자별, 에이전트별, 데이터파이프라인별, 스킬별

  **사용자별 탭**:
  - 사용자명, 부서, 활동 날짜, 메시지 수, 스킬 실행 수, 데이터 처리량, 비용
  - 드릴다운: 개별 사용자 선택 → 활동 상세 조회

  **에이전트별 탭**:
  - 에이전트명, 생성자, 호출 횟수, 평균 응답 시간, 오류율, 총 토큰 사용량
  - 드릴다운: 에이전트 → 채팅 이력 조회 (감사 로그 연계)

#### 4.4.3 비용 추적
- 월별 누적 비용 (막대 차트)
- 비용 구성 (파이 차트): AI 토큰, 데이터 스토리지, API 호출
- 예산 설정 및 알림 (향후 확장)
- CSV 다운로드

---

### 4.5 AI 거버넌스 (AI Governance)

**목적**: AI 모델, 에이전트, 데이터 접근에 대한 중앙 거버넌스 정책 설정
**진입 권한**: Client Admin, Platform Admin
**리서치 기반**: OpenAI Workspace Settings, Microsoft Copilot Control System, ServiceNow AI Control Tower

**화면 구성**:

#### 4.5.1 가드레일 관리 (Guardrails)

**상세 구성**:
```
└── 가드레일 (Guardrails)
    ├── [가드레일 목록]
    │   ├── 가드레일명, 설명, 상태(활성/비활성), 생성 날짜
    │   ├── 행 클릭 → 상세 편집
    │   └── 추가/편집/복제/삭제 버튼
    │
    └── [가드레일 상세 페이지]
        ├── 기본 정보 (이름, 설명, 활성화 토글)
        ├── 가드레일 규칙
        │   ├── 입력 검증 (예: 특정 키워드 필터)
        │   ├── 출력 검증 (예: 민감 정보 마스킹)
        │   └── 동작 (차단, 재작성, 로깅)
        ├── 적용 범위 (모든 에이전트, 특정 에이전트, 특정 사용자)
        ├── 우선순위 (1~10)
        └── 저장/취소
```

**주요 가드레일 템플릿** (체크리스트 또는 프리셋):
- PII(개인식별정보) 필터: 주민등록번호, 신용카드 번호 자동 마스킹
- 민감 주제 필터: 규제 준수(의료, 금융, 법무), 조직 정책
- 토큰 제한: 요청당 최대 토큰 수
- 속도 제한: 사용자/IP당 분당 요청 수
- 부정 행동 필터: 명백한 거짓, 환각 탐지

#### 4.5.2 콘텐츠 필터 (Content Filters)

**상세 구성**:
```
└── 콘텐츠 필터 (Content Filters)
    ├── [필터 목록]
    │   ├── 필터명, 유형, 심각도(높음/중간/낮음), 상태
    │   └── 행 클릭 → 상세 편집
    │
    └── [필터 상세 페이지]
        ├── 기본 정보 (이름, 유형, 심각도)
        ├── 필터 규칙
        │   ├── 키워드 리스트 (또는 정규표현식)
        │   ├── 매칭 방식 (정확 매칭, 부분 매칭, 정규표현식)
        │   └── 동작 (차단, 마스킹, 로깅만)
        ├── 제외 대상 (특정 역할, 특정 사용자)
        └── 저장/취소
```

**필터 카테고리**:
- 폭력/혐오 콘텐츠
- 기밀 정보 (회사 비밀, 고객 정보)
- 부적절한 언어
- 제3자 저작권

#### 4.5.3 모델 정책 (Model Policies)

**상세 구성**:
```
└── 모델 정책 (Model Policies)
    ├── [허용 모델 목록]
    │   ├── 모델명, 제공자(OpenAI/Anthropic/Google), 비용, 상태(활성/비활성)
    │   ├── 행 선택 → 상세 정보
    │   └── 추가/편집/비활성화 버튼
    │
    └── [모델 상세 페이지]
        ├── 기본 정보 (모델명, 제공자, API 키(마스킹))
        ├── 접근 제어
        │   ├── 허용 역할 (복수 선택)
        │   └── 허용 에이전트 (복수 선택)
        ├── 비용 제한
        │   ├── 월 최대 비용
        │   ├── 사용자당 월 최대 토큰
        │   └── 알림 임계값 (80%, 100%)
        ├── 모니터링
        │   ├── 토큰 사용량 (실시간 그래프)
        │   └── 에러율, 응답 시간
        └── 저장/취소
```

**모델 제공자별 구성**:
- OpenAI (GPT-4, GPT-4o, o1 등)
- Anthropic (Claude 3.x)
- Google (Gemini Pro)
- 로컬 모델 (향후 확장)

#### 4.5.4 데이터 접근 정책 (Data Access Policies)

**상세 구성**:
```
└── 데이터 접근 정책 (Data Access Policies)
    ├── [정책 목록]
    │   ├── 정책명, 데이터 소스, 영향받는 역할, 상태
    │   └── 행 클릭 → 상세 편집
    │
    └── [정책 상세 페이지]
        ├── 기본 정보 (이름, 설명, 활성화 토글)
        ├── 데이터 소스 (드롭다운)
        │   ├── 선택된 데이터 소스명
        │   └── 스키마/필드 목록 (트리)
        ├── 접근 제어
        │   ├── 허용 역할 (복수 선택)
        │   └── 허용 에이전트 (복수 선택)
        ├── 마스킹 규칙
        │   ├── PII 필드 자동 마스킹 (체크박스)
        │   └── 커스텀 마스킹 규칙 추가
        ├── 감사
        │   ├── 데이터 접근 로깅 (체크박스)
        │   └── 접근 로그 보관 기간
        └── 저장/취소
```

#### 4.5.5 정책 대시보드 (Governance Dashboard)

- **활성 정책 수**: 가드레일, 콘텐츠 필터, 모델 정책, 데이터 접근 정책 개수
- **이번 달 정책 위반 사건**:
  - 가드레일 트리거: 차단된 요청, 마스킹된 응답
  - 콘텐츠 필터: 탐지된 부적절 콘텐츠
  - 모델 정책: 미승인 모델 접근 시도, 비용 초과
  - 데이터 접근 정책: 미승인 접근 시도, 마스킹 적용

- **위험 알림**:
  - 높음: 정책 위반이 임계값 초과 (예: 하루 10건 이상)
  - 중간: 비용 예산 80% 도달
  - 낮음: 특정 에이전트 에러율 상승

- **정책 효과도** (히트맵):
  - 에이전트별 정책 적용 현황
  - 사용자별 정책 위반 빈도

---

### 4.6 테넌트 관리 (Tenant Management) — Platform Admin 전용

**목적**: 멀티테넌트 환경에서 고객사 테넌트 생성, 관리, 비활성화
**진입 권한**: Platform Admin only

**화면 구성** (향후 멀티테넌트 확장 시):

```
└── 테넌트 관리 (Tenant Management)
    ├── [테넌트 목록]
    │   ├── 테넌트명, 관리자, 사용자 수, 생성 날짜, 상태(활성/비활성)
    │   ├── 행 클릭 → 상세 관리
    │   └── 새 테넌트 생성 버튼
    │
    └── [테넌트 상세 페이지]
        ├── 기본 정보 (이름, 설명, 도메인, 생성 날짜)
        ├── 관리자 정보 (주 관리자, 보조 관리자)
        ├── 구독 정보 (플랜, 라이선스 수, 사용량 대비 %)
        ├── 빠른 조회
        │   ├── 활성 사용자 수
        │   ├── 월 사용량
        │   └── 월 비용
        ├── 설정
        │   ├── 테넌트 비활성화 (위험 버튼)
        │   ├── 구독 관리 (플랜 변경)
        │   └── 도메인 변경
        └── 감사 로그 (이 테넌트의 모든 활동)
```

---

### 4.7 전체 사용량 (Platform Usage) — Platform Admin 전용

**목적**: 플랫폼 전체의 테넌트별, SKU별 사용량 및 비용 추적
**진입 권한**: Platform Admin only

**화면 구성**:

```
└── 전체 사용량 (Platform Usage)
    ├── 플랫폼 KPI (상단)
    │   ├── 전체 테넌트 수
    │   ├── 전체 활성 사용자 (누적)
    │   ├── 월 MRR (Monthly Recurring Revenue)
    │   └── 평균 테넌트당 비용
    │
    ├── 테넌트별 사용량 테이블
    │   ├── 테넌트명, 활성 사용자, 월 사용량, 월 비용, 비용 추이(%)
    │   ├── 정렬/필터링
    │   └── 행 클릭 → 테넌트 상세 조회
    │
    └── 사용량 분석
        ├── 월별 MRR 추이 (라인 차트)
        ├── SKU별 사용량 분포 (파이 차트)
        ├── 테넌트 상위 10 (막대 차트: 비용)
        └── 예측 (향후 3개월 예상 사용량)
```

---

### 4.8 시스템 설정 (System Settings) — Platform Admin 전용

**목적**: 플랫폼 전역 설정, 통합, 알림 정책
**진입 권한**: Platform Admin only

**화면 구성**:

```
└── 시스템 설정 (System Settings)
    ├── 일반 (General)
    │   ├── 플랫폼명, 로고, 서포트 이메일
    │   ├── 시간대, 언어 (기본값)
    │   └── 저장
    │
    ├── 인증 및 보안 (Authentication & Security)
    │   ├── SSO 설정 (SAML/OIDC) — 향후 확장
    │   ├── MFA 정책 (선택/필수)
    │   ├── 세션 타임아웃 (분)
    │   ├── IP 화이트리스트 (선택 사항)
    │   └── 저장
    │
    ├── 감사 및 준수 (Audit & Compliance)
    │   ├── 감사 로그 보관 기간 (기본 90일, 최대 180일)
    │   ├── 자동 내보내기 (클라우드 스토리지)
    │   │   ├── S3, GCS, Azure Blob 지원 (향후)
    │   │   └── 설정 저장
    │   └── 저장
    │
    ├── 알림 및 모니터링 (Notifications & Monitoring)
    │   ├── 정책 위반 알림 활성화 (토글)
    │   ├── 알림 채널 (이메일, 슬랙(향후))
    │   ├── 알림 수신자 (플랫폼 관리자 기본값)
    │   └── 저장
    │
    └── 통합 (Integrations) — 향후 확장
        ├── Slack, Teams, 기타 사외 도구 연동 설정
        └── 저장
```

---

## 5. 다른 메뉴와의 연결점

### 5.1 관리자 → 데이터 파이프라인

**목적**: 데이터 소스 접근 제어 및 권한 관리
**연결 방식**:
1. **관리자 → AI 거버넌스 → 데이터 접근 정책**에서 데이터 소스별 접근 제어 설정
2. **데이터 파이프라인** 메뉴에서는:
   - 현재 로그인한 사용자의 역할에 따라 접근 가능한 데이터 소스만 표시
   - 파이프라인 구성 시 선택 가능한 소스 = 관리자에서 허용한 소스

**UI 구현**:
```tsx
// 데이터 파이프라인에서 소스 선택 드롭다운
const availableDataSources = dataAccessPolicies
  .filter(policy => policy.allowedRoles.includes(currentUser.role))
  .map(policy => policy.dataSource);
```

---

### 5.2 관리자 → 스킬

**목적**: 스킬 접근 권한 및 배포 승인
**연결 방식**:
1. **관리자 → 권한 관리**에서 역할별로 "스킬 생성", "스킬 편집", "스킬 배포" 권한 설정
2. **관리자 → AI 거버넌스 → 가드레일**에서 스킬별 제약 조건 설정
3. **스킬** 메뉴에서는:
   - 스킬 생성/편집 권한이 없는 사용자는 "생성" 버튼 disabled
   - 스킬 배포 시 가드레일 검증 수행 (자동)

**UI 구현**:
```tsx
// 스킬 목록의 액션 버튼 활성화 여부
const canEditSkill = userPermissions.includes('skill_edit');
const canDeploySkill = userPermissions.includes('skill_deploy');

// 배포 시 가드레일 검증
async function deploySkill(skillId) {
  const guardrails = await fetchApplicableGuardrails(skillId);
  const validationResult = await validateSkillAgainstGuardrails(skillId, guardrails);
  if (validationResult.failed) {
    showWarning(`가드레일 위반: ${validationResult.violations}`);
    return; // 배포 차단
  }
  // 배포 진행
}
```

---

### 5.3 관리자 → 채팅

**목적**: 채팅 이력 추적 및 컴플라이언스 감시
**연결 방식**:
1. **관리자 → 감시·감사 → 감사 로그**에서 "채팅" 필터링 시:
   - 모든 채팅 메시지의 타임스탐프, 사용자, 에이전트, 입출력 내용 조회 가능
   - 링크 제공: "감사 로그 상세" → 해당 채팅 메시지 원본 표시

2. **관리자 → AI 거버넌스**에서 설정한 가드레일/콘텐츠 필터가:
   - **채팅** 메뉴의 에이전트 응답에 실시간 적용
   - 필터 트리거 시 사용자에게 "이 응답이 정책에 의해 수정됨" 표시 (투명성)

**UI 구현**:
```tsx
// 채팅 메시지 표시
<ChatMessage
  message={response}
  isFiltered={appliedGuardrails.length > 0}
  appliedGuardrails={appliedGuardrails}
/>

// 필터된 메시지 표시
{isFiltered && (
  <Badge color="orange">
    {appliedGuardrails.map(g => g.name).join(', ')}로 인해 수정됨
  </Badge>
)}
```

---

### 5.4 관리자 → 대시보드 (라이브보드)

**목적**: 사용량 및 성과 메트릭 가시화
**연결 방식**:
1. **관리자 → 사용량 모니터링**의 KPI 데이터가:
   - **대시보드(라이브보드)** → "관리자 대시보드" 위젯으로 표시
   - 현재 기간 사용량, 비용, 컴플라이언스 상태 한눈에 확인

2. **대시보드 커스터마이징**:
   - 관리자 역할 사용자는 "관리자 전용 위젯" 추가 가능 (감시·감사, 거버넌스 정책 위반)
   - 일반 사용자는 보이지 않음

**UI 구현** (라이브보드 위젯 예):
```tsx
<Widget title="관리자 대시보드">
  <MetricCard label="월 사용량" value={monthlyUsage} />
  <MetricCard label="월 비용" value={monthlyCost} />
  <MetricCard label="정책 위반" value={policyViolations} trend="up" />
  <Link href="/admin?tab=audit">감사 로그 보기</Link>
</Widget>
```

---

## 6. 역할별 화면 차이 (Client Admin vs Platform Admin)

### 6.1 Client Admin이 보는 화면

| 탭 | 접근 | 주요 기능 |
|----|------|---------|
| 사용자 관리 | ✅ | 현재 테넌트의 사용자만 관리 |
| 권한 관리 | ✅ | 현재 테넌트의 역할/권한만 설정 |
| 감시·감사 | ✅ | 현재 테넌트의 감사 로그만 조회 |
| 사용량 모니터링 | ✅ | 현재 테넌트의 사용량만 조회 |
| AI 거버넌스 | ✅ | 현재 테넌트의 정책만 설정 |
| 테넌트 관리 | ❌ | 미표시 |
| 전체 사용량 | ❌ | 미표시 |
| 시스템 설정 | ❌ | 미표시 |

---

### 6.2 Platform Admin이 보는 화면

| 탭 | 접근 | 주요 기능 |
|----|------|---------|
| 사용자 관리 | ✅ | 모든 테넌트의 사용자 관리 (향후) |
| 권한 관리 | ✅ | 모든 테넌트의 역할/권한 설정 (향후) |
| 감시·감사 | ✅ | 모든 테넌트의 감사 로그 조회 |
| 사용량 모니터링 | ✅ | 모든 테넌트의 사용량 조회 |
| AI 거버넌스 | ✅ | 플랫폼 기본 정책 설정 (선택 사항) |
| 테넌트 관리 | ✅ | **테넌트 생성, 구독 관리, 비활성화** |
| 전체 사용량 | ✅ | **테넌트별 사용량 및 비용 분석** |
| 시스템 설정 | ✅ | **SSO, 감사 보관, 알림, 통합 설정** |

---

## 7. 프로토타입 구현 로드맵

### 7.1 MVP (Phase 1) — 반드시 구현

**타이밍**: 프로토타입 확정
**완성도**: 기본 기능만

```
관리자 메뉴 (MVP)
├── ✅ 사용자 관리 (사용자 목록, 초대, 역할 할당, 비활성화)
├── ✅ 권한 관리 (기본 역할 4개, 권한 매트릭스 — 읽기 전용)
├── ✅ 감시·감사 (감사 로그 조회, 필터링, CSV 내보내기)
├── ✅ 사용량 모니터링 (KPI 카드, 사용자/에이전트별 사용량)
└── ✅ AI 거버넌스
    ├── 가드레일 관리 (기본 5개 템플릿, 추가/비활성화만)
    ├── 콘텐츠 필터 (기본 4개 필터, 활성화/비활성화만)
    ├── 모델 정책 (허용 모델 목록, 활성화/비활성화)
    └── 데이터 접근 정책 (간단한 역할별 접근 제어)
```

**제외 (프로토타입에서 불필요)**:
- 테넌트 관리, 전체 사용량, 시스템 설정 (Platform Admin 전용)
- 커스텀 역할 생성 (기본 역할로 충분)
- 고급 필터/정책 편집 UI (읽기만 가능)
- 실시간 활동 모니터 (감사 로그로 충분)

---

### 7.2 Phase 2 (향후 확장)

```
관리자 메뉴 (Phase 2)
├── 사용자 관리
│   ├── 일괄 사용자 CSV 업로드
│   ├── SCIM 프로비저닝 (IdP 동기화)
│   └── 비밀번호 정책 설정
├── 권한 관리
│   ├── ✅ 커스텀 역할 생성/편집
│   └── RBAC 고급 설정 (속성 기반 접근 제어)
├── 감시·감사
│   ├── 실시간 활동 모니터 (피드)
│   └── 감사 로그 자동 아카이빙 (클라우드)
├── AI 거버넌스
│   ├── ✅ 가드레일 고급 편집 (정규표현식, 커스텀 규칙)
│   ├── ✅ 콘텐츠 필터 고급 편집
│   ├── ✅ 모델별 비용 제한 및 알림
│   └── ✅ 데이터 접근 정책 고급 설정 (필드 수준 마스킹)
└── [Platform Admin 전용]
    ├── 테넌트 관리
    ├── 전체 사용량
    └── 시스템 설정 (SSO, 알림, 통합)
```

---

## 8. 구현 체크리스트 (프로토타입 MVP)

### 8.1 데이터베이스 스키마

- [ ] `users` 테이블 확장 (role, department, last_login, status)
- [ ] `roles` 테이블 (기본 4개 역할: admin, editor, viewer, agent_user)
- [ ] `permissions` 테이블 (role ↔ permission 매핑)
- [ ] `audit_logs` 테이블 (event_type, user_id, resource_id, action, timestamp, old_value, new_value)
- [ ] `guardrails` 테이블 (name, type, rules, status, applicable_to)
- [ ] `content_filters` 테이블 (name, keywords, action, severity, status)
- [ ] `model_policies` 테이블 (model_name, provider, enabled, max_monthly_cost)
- [ ] `data_access_policies` 테이블 (name, data_source, allowed_roles, masking_rules)

### 8.2 API 엔드포인트

**사용자 관리**:
- [ ] `GET /api/admin/users` (페이지네이션, 필터링)
- [ ] `POST /api/admin/users/invite` (이메일 초대)
- [ ] `PATCH /api/admin/users/{userId}/role` (역할 변경)
- [ ] `PATCH /api/admin/users/{userId}/status` (비활성화)

**권한 관리**:
- [ ] `GET /api/admin/roles`
- [ ] `GET /api/admin/roles/{roleId}/permissions`
- [ ] `PATCH /api/admin/roles/{roleId}/permissions` (프로토에서는 불가, 기본 역할만 읽기)

**감사 로그**:
- [ ] `GET /api/admin/audit-logs` (필터링, 정렬, 페이지네이션)
- [ ] `POST /api/admin/audit-logs/export` (CSV/JSON 내보내기)
- [ ] `POST /api/audit-logs/{resourceId}` (감시 대상 활동 기록)

**사용량 모니터링**:
- [ ] `GET /api/admin/usage/overview` (KPI)
- [ ] `GET /api/admin/usage/by-user` (사용자별)
- [ ] `GET /api/admin/usage/by-agent` (에이전트별)
- [ ] `GET /api/admin/usage/by-skill` (스킬별)

**AI 거버넌스**:
- [ ] `GET /api/admin/guardrails`
- [ ] `PATCH /api/admin/guardrails/{railId}/enabled` (활성화/비활성화)
- [ ] `GET /api/admin/content-filters`
- [ ] `PATCH /api/admin/content-filters/{filterId}/enabled` (활성화/비활성화)
- [ ] `GET /api/admin/model-policies`
- [ ] `GET /api/admin/data-access-policies`

### 8.3 UI 컴포넌트 (TypeScript + Tailwind)

**위치**: `src/components/features/admin/`

```
src/components/features/admin/
├── AdminLayout.tsx (탭 네비게이션)
├── UsersTab.tsx (사용자 관리)
│   ├── UsersList.tsx
│   ├── UserDetailPanel.tsx
│   └── InviteUserDialog.tsx
├── PermissionsTab.tsx (권한 관리)
│   ├── RolesList.tsx
│   ├── RoleDetailPanel.tsx
│   └── PermissionMatrix.tsx
├── AuditTab.tsx (감시·감사)
│   ├── AuditLogTable.tsx
│   ├── AuditFilters.tsx
│   └── AuditExportButton.tsx
├── UsageTab.tsx (사용량 모니터링)
│   ├── UsageOverview.tsx
│   ├── UsageChart.tsx
│   ├── UsageByUserTable.tsx
│   ├── UsageByAgentTable.tsx
│   └── UsageBySkillTable.tsx
├── AIGovernanceTab.tsx (AI 거버넌스)
│   ├── GuardrailsList.tsx
│   ├── GuardrailDetailPanel.tsx
│   ├── ContentFiltersList.tsx
│   ├── ContentFilterDetailPanel.tsx
│   ├── ModelPoliciesList.tsx
│   ├── DataAccessPoliciesList.tsx
│   └── GovernanceDashboard.tsx
└── hooks/
    ├── useAdminUsers.ts
    ├── useAdminRoles.ts
    ├── useAuditLogs.ts
    ├── useUsageData.ts
    └── useAIGovernance.ts
```

### 8.4 권한 가드 (Middleware)

```typescript
// src/middleware/adminGuard.ts
export function requireAdminRole(requiredRole: 'client_admin' | 'platform_admin') {
  return (req, res, next) => {
    const user = req.user;
    if (!user || user.role !== requiredRole && user.role !== 'platform_admin') {
      return res.status(403).json({ error: '접근 권한 없음' });
    }
    next();
  };
}
```

### 8.5 감사 로깅 (자동 기록)

```typescript
// src/lib/auditLog.ts
export async function logAuditEvent(
  userId: string,
  eventType: string, // 'login', 'user_created', 'role_changed', ...
  resourceType: string, // 'user', 'role', 'guardrail', ...
  resourceId: string,
  action: string, // 'create', 'update', 'delete'
  oldValue?: any,
  newValue?: any,
  metadata?: any
) {
  await db.auditLogs.create({
    userId,
    eventType,
    resourceType,
    resourceId,
    action,
    oldValue: JSON.stringify(oldValue),
    newValue: JSON.stringify(newValue),
    metadata: JSON.stringify(metadata),
    timestamp: new Date(),
    ipAddress: getClientIP(),
  });
}
```

### 8.6 화면 흐름 (Wireframe)

**사용자 관리 탭**:
```
[필터 섹션]
├── 상태 (활성/비활성)
├── 부서 (드롭다운)
├── 역할 (드롭다운)
└── 검색 (이름/이메일)

[액션 바]
├── [사용자 초대] 버튼
└── [일괄 업로드] 버튼

[사용자 테이블]
├── 이름 | 이메일 | 역할 | 부서 | 상태 | 마지막 활동
├── [사용자 1] → [우측 슬라이드: 상세 정보 + 역할 변경 + 비활성화]
└── [사용자 2]
```

**감시·감사 탭**:
```
[필터 섹션]
├── 날짜 범위 (From ~ To)
├── 이벤트 유형 (멀티셀렉트)
├── 사용자 (검색)
└── 리소스 유형 (멀티셀렉트)

[액션 바]
└── [내보내기 (CSV/JSON)] 버튼

[감사 로그 테이블]
├── 타임스탬프 | 사용자 | 이벤트 | 리소스 | 변경 내용 | 상태
├── [로그 1] → [행 확장: 상세 정보 + 변경 전후 값]
└── [로그 2]
```

---

## 9. 리서치 기반 설계 원칙

이 IA 설계는 다음 벤치마크 관찰에 기반합니다:

### OpenAI (ChatGPT Enterprise)
- **관찰**: Workspace Settings를 탭형 내비게이션으로 구성 (General, Permissions & Roles, Identity & Access 등)
- **적용**: 관리자 메뉴도 탭형 구성, 각 탭 내에 서브섹션 포함

### Microsoft Copilot Studio
- **관찰**: 거버넌스 기능이 여러 관리 센터에 분산 (PPAC, M365 Admin Center)
- **적용**: KonaI-Agent는 단일 앱 내에서 통합, 역할별로만 탭 표시/숨김

### Datadog
- **관찰**: Organization Settings 내 Audit Trail 섹션에서 필터링, 자연어 검색, CSV 내보내기 지원
- **적용**: 감사 로그에 동일한 UI 패턴 적용

### Snowflake
- **관찰**: 활성 역할에 따라 Admin 메뉴 가시성이 동적으로 변경 (ACCOUNTADMIN은 Cost management 보임, 다른 역할은 숨겨짐)
- **적용**: Platform Admin 역할 검사로 추가 탭 조건부 렌더링

### ServiceNow AI Control Tower
- **관찰**: 거버넌스 기능(정책 엔진, 리스크 평가, 라이프사이클 게이트)이 제품의 핵심
- **적용**: AI 거버넌스 탭에 가드레일, 콘텐츠 필터, 모델 정책, 데이터 접근 정책을 계층적으로 구성

---

## 10. 프로토타입 제외 사항 (향후 확장)

| 기능 | 이유 | 시기 |
|------|------|------|
| 테넌트 관리 | 단일 테넌트 프로토 | 멀티테넌트 SaaS 진화 시 |
| 전체 사용량 | 필요 없음 (1개 테넌트) | 멀티테넌트 SaaS 진화 시 |
| 시스템 설정 | 플랫폼 관리자 불필요 | 멀티테넌트 SaaS 진화 시 |
| SCIM 프로비저닝 | 엔터프라이즈 기능 | Phase 2 고객사 요청 시 |
| SSO (SAML/OIDC) | 엔터프라이즈 기능 | Phase 2 고객사 요청 시 |
| 커스텀 역할 생성 | 기본 역할로 충분 | Phase 2 고객사 요청 시 |
| 예약 작업(Scheduled Tasks) | 프로토 불필요 | 운영 단계 필요 시 |
| 감사 로그 자동 아카이빙 | 컴플라이언스 심화 시 | Phase 2 규제 요구 시 |

---

## 11. 마이그레이션 경로 (현재 → 향후)

### 11.1 현재 상태 (프로토타입)

```
관리자
├── 사용자 관리 (Client Admin 범위)
├── 권한 관리 (기본 역할, 읽기)
├── 감시·감사 (현재 테넌트)
├── 사용량 모니터링 (현재 테넌트)
└── AI 거버넌스 (현재 테넌트, 활성화/비활성화만)
```

### 11.2 향후 상태 (멀티테넌트 SaaS)

```
관리자 (Client Admin)
├── 사용자 관리 (현재 테넌트)
├── 권한 관리 (커스텀 역할 생성 가능)
├── 감시·감사 (현재 테넌트, 고급 필터)
├── 사용량 모니터링 (현재 테넌트)
└── AI 거버넌스 (현재 테넌트, 정책 편집 가능)

[구분선]

관리자 (Platform Admin)
├── [모든 Client Admin 기능 + 테넌트 필터링]
├── 테넌트 관리 (생성, 구독, 비활성화)
├── 전체 사용량 (테넌트별 분석)
└── 시스템 설정 (SSO, 감사, 알림, 통합)
```

---

## 12. 접근성 및 성능 고려사항

### 12.1 접근성 (A11y)

- [ ] 모든 폼 필드에 명확한 레이블
- [ ] 스크린 리더 지원 (aria-label, aria-describedby)
- [ ] 색상만으로 상태 구분 금지 (필터링, 상태 배지 등)
- [ ] 테이블 행 선택 시 체크박스 제공

### 12.2 성능

- [ ] 감사 로그: 페이지네이션 필수 (한 번에 50~100개만 로드)
- [ ] 사용량 차트: 데이터 범위 제한 (기본 3개월)
- [ ] 사용자 테이블: 검색/필터 시 debouncing (300ms)
- [ ] 드롭다운/모달: lazy loading (필요할 때만 데이터 요청)

---

## 13. 보안 고려사항

### 13.1 데이터 보호

- 감사 로그의 민감 정보 (비밀번호, API 키) 제외
- 권한 변경 이력은 감사 로그에 기록하되, 새 비밀번호는 기록하지 않음
- 모델 정책의 API 키는 마스킹 (보기/편집 시에도 마스킹, 변경만 가능)

### 13.2 역할 기반 접근 제어 (RBAC)

- 서버 측에서 검증 (클라이언트 검증만으로는 불충분)
- API 엔드포인트마다 역할 확인 미들웨어 적용
- 감사 로그에 모든 접근 시도(성공/실패) 기록

### 13.3 감시 감사 로그 불변성

- 감사 로그는 삭제 불가 (논리적 삭제만 가능, 관리자도)
- 감사 로그 수정 시도는 별도로 기록
- 감사 로그 접근 자체도 로깅 (감사의 감사)

---

## 부록 A: 용어 정의

| 용어 | 정의 |
|------|------|
| **가드레일 (Guardrail)** | AI 에이전트의 입출력 검증 규칙. 부적절한 요청/응답을 차단하거나 변경 |
| **콘텐츠 필터 (Content Filter)** | 민감 정보, 부적절한 언어 등을 탐지하고 마스킹/차단하는 규칙 |
| **모델 정책 (Model Policy)** | 특정 AI 모델의 사용 가능 여부, 비용 제한, 접근 제어 설정 |
| **데이터 접근 정책 (Data Access Policy)** | 데이터 소스별 접근 가능 역할/에이전트, 마스킹 규칙 |
| **감사 로그 (Audit Log)** | 시스템 활동(사용자, 권한, 데이터 변경 등)의 시간순 기록 |
| **컴플라이언스 (Compliance)** | 조직 정책, 규제 요구사항 준수 여부 |
| **RBAC (Role-Based Access Control)** | 사용자의 역할에 따라 접근 권한을 결정하는 방식 |

---

## 부록 B: 링크 매핑 (관리자 ↔ 다른 메뉴)

| From | To | 목적 | UI 요소 |
|------|----|----|--------|
| 관리자 → 감시·감사 | 채팅 | 특정 대화 원본 조회 | 감사 로그 행 클릭 → "채팅 보기" 링크 |
| 관리자 → AI 거버넌스 → 데이터 접근 정책 | 데이터 파이프라인 | 정책 적용 확인 | 정책명 클릭 → "영향받는 파이프라인" 리스트 |
| 관리자 → 사용량 모니터링 → 에이전트별 | 채팅 | 에이전트 성과 상세 | 에이전트명 클릭 → 채팅 이력 조회 |
| 관리자 → AI 거버넌스 → 가드레일 | 스킬 | 스킬 배포 시 검증 | 배포 전 자동으로 가드레일 검증 수행 |
| 대시보드 | 관리자 → 사용량 모니터링 | KPI 상세 조회 | 대시보드 위젯 클릭 → 관리자 사용량 탭으로 이동 |

---

**문서 버전**: 1.0
**마지막 수정**: 2026-03-21
**작성자**: Claude Code (AI Agent for KonaI-Agent)
