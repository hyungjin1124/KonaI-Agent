# KonaI-Agent 데이터 접근 권한 정책

> 작성일: 2026-03-31
> 최종 수정: 2026-04-01
> 상태: Draft
> 관련 문서: [docs/references/permission-system.md](../references/permission-system.md)

---

## 1. 기본 원칙

**ERP에서 볼 수 없는 데이터는 에이전트도 답변하지 않는다.**

이 원칙에서 다음 세 가지 설계 방침이 도출된다.

1. **ERP 권한 우선**: ERP 화면에 대응하는 데이터는 ERP의 기존 권한 체계(부서별:`_TCAOrgDeptSecu`, 그룹별:`_tcagroupsecu`, 사용자별:`_tcausersecu`, 메뉴기능:`_TCAMenuFunctionSecu`)를 그대로 따른다. 데이터 범위 제어는 ERP의 코드권한 체계(`_TCACodeSecu` 등)를 반영한다. 별도의 에이전트 권한을 만들지 않는다.
2. **최소 권한 원칙**: 복합 데이터(여러 ERP 화면의 데이터를 조합한 뷰)는 원천 화면 모두에 접근 가능해야 볼 수 있다 (ALL 로직).
3. **에이전트는 읽기 전용**: 에이전트를 통한 데이터 조회만 허용한다. 입력·수정·승인(Layer 3)은 에이전트의 범위 밖이다.
4. **비ERP 소스 자체 관리**: ERP 외 데이터 소스(Jira, Excel 등)의 접근 권한은 KonaI-Agent에서 부서/사용자 단위로 직접 관리한다. ERP 그룹 개념은 비ERP 소스에 적용하지 않는다.

---

## 2. 용어 정의

| 용어 | 정의 |
|------|------|
| **뷰테이블 (View Table)** | 에이전트가 데이터를 조회할 때 참조하는 DB 뷰. ERP 테이블 또는 외부 시스템 데이터를 가공하여 조회 목적으로 구성한 것 |
| **pgmseq** | ERP 프로그램(화면) 고유 식별자. `_tcamenu`에 등록된 메뉴 화면(2,504개)을 포함하여, 전체 7,395개의 업무기능 프로그램이 존재 |
| **부서별 권한** | `_TCAOrgDeptSecu`에서 프로그램+부서 조합으로 정의한 화면 접근 권한 (409건). 부서 단위로 화면 접근을 허용/차단 |
| **그룹 (Group)** | ERP 권한 관리의 기본 단위. `_tcagroupsecu`에서 그룹별 화면 접근 허용/차단을 정의 (전체 67개 그룹, 274,382건). 사용자 1명이 복수 그룹에 속할 수 있음 (N:N) |
| **사용자 오버라이드** | `_tcausersecu`에서 특정 사용자에게 개별적으로 부여하거나 차단한 화면 권한 (2,244건). 그룹 권한보다 우선 |
| **메뉴기능 권한** | `_TCAMenuFunctionSecu`에서 사용자 단위로 최상위 메뉴(운영관리, 기본정보, 인사 등) 접근 권한을 정의 (38건). 부서/그룹 단위 할당은 존재하지 않음 |
| **코드권한** | ERP의 데이터 범위 제어 메커니즘. 화면 안에서 조회·수정 가능한 데이터 범위(부서, 사원, 회계단위 등)를 부서/그룹/사용자별로 제한. `_TCACodeSecuType`(17개 유형) → `_TCACodeSecu`(255건, 화면별 적용) → 할당 테이블(부서 984건, 그룹 12건, 사용자 194건) 3단계 구조 |
| **행 수준 보안 (RLS)** | 데이터 범위 제어. 접근 허용 여부(부서/그룹/사용자)와 별개로, 허용된 뷰 안에서 "어디까지 볼 수 있는가"를 행 단위로 제한. ERP의 코드권한 체계, 부서 컬럼 필터, 매핑 테이블 참조, 전용 정책 등 뷰테이블별로 방식이 다를 수 있으며, DB 레벨에서 강제한다 |
| **도메인 (Domain)** | 뷰테이블을 비즈니스 영역별로 분류하는 레이블. 권한 판단에는 사용되지 않으며, 관리자의 탐색과 현황 파악을 위한 분류 |
| **auth_type** | 뷰테이블의 권한 판단 방식을 지정하는 구분자. 현재 `erp_pgm`, `erp_derived` 두 가지가 정의되어 있으며, 비ERP 데이터 소스 연동 시 소스 유형에서 auth_type이 자동 결정된다 (예: source_type='jira' → auth_type='jira') |

### 뷰테이블 유형 (auth_type)

**현재 확정된 유형:**

| auth_type | 정의 | 권한 판단 방식 | 예시 |
|-----------|------|--------------|------|
| **erp_pgm** | ERP의 특정 조회 화면에 1:1 대응하는 뷰테이블 | 해당 pgmseq에 대한 ERP 권한(`_tcausersecu` → `_tcagroupsecu` → `_TCAOrgDeptSecu`) | v_bom_master ↔ BOM조회 화면 |
| **erp_derived** | ERP의 복수 화면 데이터를 조합한 뷰테이블. ERP에는 없는 화면이지만, 원천 데이터는 모두 ERP에서 온다 | 원천 pgmseq 전부에 접근 가능해야 허용 (ALL 로직) | v_cost_purchase_trend ↔ BOM조회 + 구매단가조회 |

**향후 확장:**

비ERP 데이터 소스(예: Jira, e2max 등)가 연동될 때, 해당 소스의 고유한 접근 제어 모델에 맞는 auth_type을 새로 정의한다. 각 auth_type은 아래 **공통 인터페이스**(섹션 5.1)를 구현해야 한다.

### 본 문서에서 참조하는 ERP 테이블

> 테이블 상세 스키마는 [permission-system.md](../references/permission-system.md) 참조.

**Layer 1 — 화면 접근 권한**

| 테이블 | 건수 | 역할 | PK / 주요 컬럼 |
|--------|------|------|---------------|
| `_tcauser` | 3,276 | 사용자 마스터 | `(companyseq, userseq)` / deptseq, empseq |
| `_tcagroupmember` | 3,457 | 사용자↔그룹 매핑 | `(companyseq, groupseq, memberseq)` / userseq, deptseq |
| `_tcapgm` | 6,342 | 프로그램(화면) 마스터 | `(companyseq, pgmseq)` / deptsecu, caption |
| `_tcamenu` | 17,218 | 메뉴↔프로그램 매핑 | `(companyseq, menuseq)` / pgmseq, menufunctionseq |
| `_TCAMenuFunctionSecu` | 38 | **최상위 메뉴 단위 권한**. 사용자별로 최상위 메뉴(운영관리, 기본정보 등) 접근 허용/차단 | `(CompanySeq, MenuFunctionSeq, UserSeq)` / Secu |
| `_TCAOrgDeptSecu` | 409 | **부서별 화면 접근 권한**. 프로그램+부서 조합으로 허용/차단 | `(CompanySeq, PgmSeq, DeptSeq)` / Secu |
| `_tcagroupsecu` | 274,382 | **그룹별 화면 접근 권한**. 67개 그룹에 대해 프로그램별 허용/차단 | `(companyseq, pgmseq, groupseq)` / secu (`'1'`=허용, `'2'`=차단) |
| `_tcausersecu` | 2,244 | **사용자별 화면 접근 오버라이드**. 그룹 권한보다 우선 적용 | `(companyseq, pgmseq, userseq)` / secu (`'1'`=허용, `'2'`=차단) |

**Layer 2 — 데이터 범위 제어 (코드권한)**

| 테이블 | 건수 | 역할 | PK / 주요 컬럼 |
|--------|------|------|---------------|
| `_TCACodeSecuType` | 17 | **코드권한그룹 정의**. 제어 대상의 종류 (부서, 사원, 회계단위, 급여작업군 등) | `(CompanySeq, CodeSecuSeq)` / CodeSecuName |
| `_TCACodeSecu` | 255 | **화면별 코드권한 적용**. 어떤 화면에 어떤 코드권한그룹을 적용할지 매핑 | `(CompanySeq, PgmSeq, CodeSecuSeq)` |
| `_TCACodeOrgDeptSecu` | 984 | 부서별 코드권한 할당 | `(CompanySeq, PgmSeq, DeptSeq, CodeSecuSeq, CodeSeq)` / SecuRead, SecuWrite, AllSecu |
| `_TCACodeGroupSecu` | 12 | 그룹별 코드권한 할당 | `(CompanySeq, PgmSeq, GroupSeq, CodeSecuSeq, CodeSeq)` / SecuRead, SecuWrite, AllSecu |
| `_TCACodeUserSecu` | 194 | 사용자별 코드권한 할당 | `(CompanySeq, PgmSeq, UserSeq, CodeSecuSeq, CodeSeq)` / SecuRead, SecuWrite, AllSecu, PlusMinusSecu |

**Layer 2 — 데이터 범위 제어 (BOM)**

| 테이블 | 건수 | 역할 | PK / 주요 컬럼 |
|--------|------|------|---------------|
| `_tpdbomdeptauthority` | 16,007 | **BOM 품목별 부서 접근 권한**. 품목+부서 매핑으로 조회 범위 제한 | `(companyseq, itemseq)` / deptseq (0=전체 허용) |

---

## 3. 뷰테이블 선정 기준

뷰테이블은 다음 조건을 모두 만족하는 ERP 프로그램(화면)을 대상으로 생성한다.

```
ERP 전체 프로그램 (7,395개, _tcapgm 6,342건)
    │
    ├─ 메뉴 미등록 프로그램 (4,895개) ──→ 제외
    │
    └─ 메뉴 등록 프로그램 (2,504개, 이 중 2,500개가 권한 레코드 존재)
        │
        ├─ 현업 미사용 화면 ──→ 제외 (현업 부서 인터뷰 기반)
        │
        └─ 현업 사용 화면
            │
            ├─ 입력/수정 목적 화면 ──→ 제외
            │
            └─ 조회 목적 화면 ──→ ✅ 뷰테이블 생성 대상
                                    (auth_type: erp_pgm)
```

이 외에 현업 요구로 생성하는 ERP 복합 뷰(`erp_derived`)와, 향후 연동되는 비ERP 데이터 소스 뷰가 추가된다.

---

## 4. 데이터 모델

### 4.1 agent_view_registry — 뷰테이블 등록 (전체 뷰 공통)

에이전트가 참조하는 모든 뷰테이블의 메타데이터를 관리한다.

| Column | Type | Description |
|--------|------|-------------|
| view_id | varchar (PK) | 뷰테이블 식별자 (예: `v_bom_master`) |
| view_name | varchar | 표시명 (예: `BOM 마스터 조회`) |
| description | text | 뷰테이블 설명. 에이전트가 질의에 적합한 뷰를 선택할 때 참조 |
| auth_type | varchar | 권한 판단 방식 식별자. 현재: `erp_pgm` \| `erp_derived`. 향후 데이터 소스 추가 시 확장 |
| rls_type | varchar (nullable) | RLS 적용 방식. `code_secu` \| `mapping_table` \| NULL(미적용). 추후 ERP 앱 동작 분석에서 추가 메커니즘이 발견되면 유형 확장 |
| rls_config | jsonb (nullable) | RLS 규칙 상세 설정. `code_secu`는 ERP 테이블에서 전체 자동 해석되므로 NULL, `mapping_table`만 설정 필요 (5.6절 참조) |
| domain | varchar | 분류용 도메인 (예: `생산`, `회계`, `프로젝트`) |
| is_active | boolean | 활성 여부. 비활성화 시 에이전트가 참조하지 않음 |
| created_at | timestamp | 등록일시 |
| updated_at | timestamp | 최종 수정일시 |

### 4.2 agent_view_source — ERP 원천 화면 매핑 (erp_pgm, erp_derived 전용)

뷰테이블과 ERP 프로그램(pgmseq)의 매핑을 관리한다.

| Column | Type | Description |
|--------|------|-------------|
| view_id | varchar (PK, FK) | 뷰테이블 식별자 |
| pgmseq | int (PK) | ERP 프로그램 ID |

- `erp_pgm`: 1개의 pgmseq만 등록
- `erp_derived`: 2개 이상의 pgmseq 등록 (모든 원천 화면)

### 4.3 agent_view_access — 비ERP 뷰 접근 권한

비ERP 데이터 소스 뷰테이블의 접근 권한을 관리한다. ERP 뷰(erp_pgm, erp_derived)에는 사용하지 않으며, ERP 권한 테이블에서 자동 계산한다.

| Column | Type | Description |
|--------|------|-------------|
| view_id | varchar (PK, FK) | 뷰테이블 식별자 (agent_view_registry 참조) |
| grant_type | varchar (PK) | `'dept'` \| `'user'` |
| grant_target | int (PK) | grant_type='dept'이면 deptseq, 'user'이면 userseq |
| created_at | timestamp | 등록일시 |
| created_by | int | 설정한 관리자 userseq |

- 그룹(group) grant_type은 미지원 — 비ERP 소스는 부서와 사용자 단위로만 권한 관리
- 관리자가 데이터 메뉴 > [접근 권한] 탭에서 직접 설정

### ER Diagram

```
[ERP 기존 테이블 — Layer 1 화면 접근]     [에이전트 신규 테이블]

_tcauser ─────────────┐
  (userseq, deptseq)  │
                      │
_TCAMenuFunctionSecu ─┤  ← 최상위 메뉴 단위 권한 (38건, 사용자 단위만)
  (userseq,            │
   menufunctionseq)    │
                      │         agent_view_registry
_TCAOrgDeptSecu ──────┤           (view_id, auth_type,
  (pgmseq, deptseq,   │            rls_type, rls_config, ...)
   secu)   (409건)     ├──참조──→       │
                      │               └── agent_view_source
_tcagroupmember ──────┤                    (view_id, pgmseq)
  (userseq→groupseq)  │                     ↕ ERP pgmseq 참조
                      │
_tcagroupsecu ────────┤
  (groupseq, pgmseq,  │
   secu)  (274,382건)  │
                      │
_tcausersecu ─────────┤
  (userseq, pgmseq,   │
   secu)  (2,244건)    │

[ERP 기존 테이블 — Layer 2 데이터 범위 (코드권한)]

_TCACodeSecuType ─────┐  ← 코드권한그룹 정의 (17개 유형: 부서, 사원, 회계단위 등)
  (codesecuseq)        │
                      │
_TCACodeSecu ─────────┤  ← 화면별 코드권한그룹 적용 (255건, pgmseq + codesecuseq)
  (pgmseq,             │
   codesecuseq)        │
                      │
_TCACodeOrgDeptSecu ──┤  ← 부서별 할당 (984건)
_TCACodeGroupSecu ────┤  ← 그룹별 할당 (12건)
_TCACodeUserSecu ─────┤  ← 사용자별 할당 (194건)
  (pgmseq, codesecuseq,│    securead/secuwrite/allsecu
   codeseq)            │

[ERP 기존 테이블 — Layer 2 데이터 범위 (BOM)]

_tpdbomdeptauthority ─┤  ← BOM 품목별 부서 접근 권한 (16,007건)
  (itemseq, deptseq)   │

[에이전트 신규 테이블 — 비ERP 접근 권한]

agent_view_access ────────┤  ← 비ERP 뷰 접근 권한 (부서/사용자 단위)
  (view_id, grant_type,    │    ERP 뷰에는 미사용
   grant_target)           │
```

---

## 5. 권한 판단 로직

### 5.1 공통 인터페이스

모든 auth_type은 다음 두 가지 판단을 에이전트에게 제공해야 한다.

| 판단 | 질문 | 반환 |
|------|------|------|
| **접근 허용** | 이 사용자가 이 뷰를 볼 수 있는가? | boolean (허용/차단) |
| **데이터 범위** | 볼 수 있다면, 어디까지 볼 수 있는가? | 필터 조건 (WHERE절) 또는 없음 |

구체적인 판단 방법은 auth_type마다 다르지만, 에이전트에게 돌려주는 결과의 형태는 동일하다. 향후 새로운 데이터 소스가 연동될 때, 해당 소스의 auth_type이 이 인터페이스를 구현하면 에이전트의 권한 판단 흐름에 자연스럽게 통합된다.

### 5.2 전체 흐름

```
사용자 질의
    │
    ▼
에이전트: 질의 의도 분석 → 관련 뷰테이블 후보 선정
    │  (복합 뷰와 개별 뷰가 모두 후보에 포함될 수 있음)
    │
    ▼
후보 뷰테이블 각각에 대해 auth_type 확인
    │
    ├─ erp_pgm       → resolve_erp_pgm()
    ├─ erp_derived    → resolve_erp_derived()
    └─ jira, excel 등  → resolve_custom()
    │
    ▼
각 resolve 함수가 공통 인터페이스에 따라 반환:
    → 접근 허용 여부 (boolean)
    → 데이터 범위 필터 (WHERE절 또는 없음)
    │
    ▼
허용된 뷰테이블만으로 쿼리 생성 + 필터 자동 주입
    │  (복합 뷰가 차단된 경우, 허용된 개별 뷰로 대체하여 응답 구성)
    │
    ▼
결과 반환
```

**복합 뷰 차단 시 대체 원칙**: 복합 뷰(erp_derived 등)가 원천 일부의 권한 부족으로 차단된 경우, 에이전트는 후보에 포함된 허용 가능한 개별 뷰(erp_pgm)들을 활용하여 응답을 구성한다. 복합 뷰 내부를 쪼개서 부분 응답을 만들지 않는다.

### 5.3 erp_pgm 권한 판단

```
resolve_erp_pgm(userseq, view_id):

  [접근 허용 판단]

  1. agent_view_source에서 view_id의 pgmseq 조회 → pgmseq

  2. 메뉴기능 권한 확인 (선행 필터):
     _TCAMenuFunctionSecu에서 (userseq, 해당 pgmseq의 menufunctionseq) 확인
     ├─ 레코드 존재 & secu='2' → ❌ 차단 (최상위 메뉴 단위 차단)
     └─ 레코드 없음 또는 secu='1' → Step 3으로
     ※ 38건으로 대부분의 사용자에게는 해당 없음

  3. _tcausersecu에서 (userseq, pgmseq) 확인
     ├─ 레코드 존재 & secu='1' → ✅ 허용 (오버라이드: 개인 허용)
     ├─ 레코드 존재 & secu='2' → ❌ 차단 (오버라이드: 개인 차단)
     └─ 레코드 없음 → Step 4로

  4. _tcagroupmember에서 userseq의 groupseq 목록 조회

  5. _tcagroupsecu에서 (groupseq[], pgmseq) 확인
     ├─ 하나라도 secu='1' → ✅ 허용
     └─ 모두 secu='2' 또는 레코드 없음 → Step 6으로

  6. _TCAOrgDeptSecu에서 (pgmseq, 사용자의 deptseq) 확인
     ├─ 레코드 존재 & secu='1' → ✅ 허용 (부서 단위 허용)
     ├─ 레코드 존재 & secu='2' → ❌ 차단 (부서 단위 차단)
     └─ 레코드 없음 → ❌ 차단

  ※ 위 2→3→4→5→6 순서는 ERP 앱 로직 기반 추정치이다.
    실제 ERP의 권한 축 적용 순서/우선순위는 DB만으로는 확인 불가하며,
    ERP 운영팀 확인이 필요하다 (미결 사항 10.5 참조).

  [데이터 범위 판단 — RLS]

  7. rls_type에 따라 DB RLS 정책 적용 (5.6절 참조)
     → rls_type이 NULL이면 필터 없음
```

### 5.4 erp_derived 권한 판단

```
resolve_erp_derived(userseq, view_id):

  [접근 허용 판단]

  1. agent_view_source에서 view_id의 pgmseq 목록 조회 → [pgmseq_A, pgmseq_B, ...]

  2. 각 pgmseq에 대해 resolve_erp_pgm()의 접근 허용 판단 수행

  3. ALL 로직 적용:
     ├─ 모든 pgmseq가 허용 → ✅ 허용
     └─ 하나라도 차단 → ❌ 이 뷰는 차단
        → 에이전트는 허용된 개별 뷰(erp_pgm)로 대체하여 응답 구성

  [데이터 범위 판단 — RLS]

  4. rls_type에 따라 DB RLS 정책 적용 (5.6절 참조)
```

**복합 뷰의 ALL 로직을 적용하는 이유**: 복합 뷰는 여러 원천 데이터를 조합한 결과이므로, 일부 원천만으로 부분 제공하면 데이터 정합성을 보장할 수 없다. 대신 에이전트가 사용자가 권한을 가진 개별 뷰(erp_pgm)들을 조합하여 가능한 범위 내에서 응답한다.

### 5.5 비ERP 소스 권한 판단

비ERP 데이터 소스(Jira, Excel 등)의 뷰테이블은 `agent_view_access` 테이블 기반으로 접근 권한을 판단한다. 모든 비ERP auth_type이 공통으로 사용한다.

```
resolve_custom(userseq, view_id):

  [접근 허용 판단]

  1. agent_view_access에서 view_id의 grant 목록 조회

  2. grant_type='user', grant_target=userseq인 레코드 존재
     → ✅ 허용 (사용자 직접 허용)

  3. _tcauser에서 userseq의 deptseq 조회
     grant_type='dept', grant_target=deptseq인 레코드 존재
     → ✅ 허용 (부서 단위 허용)

  4. 둘 다 없음 → ❌ 차단

  [데이터 범위 판단 — RLS]

  5. rls_type에 따라 처리
     → 비ERP 소스는 초기에 rls_type=NULL로 시작
     → 향후 소스별 RLS 메커니즘 추가 시 확장
```

부서/사용자 판단에서 사용자 직접 허용(Step 2)이 부서 허용(Step 3)보다 먼저 확인되지만, 둘 다 OR 관계이므로 우선순위 충돌은 없다.

### 5.6 행 수준 보안 (Row Level Security)

접근이 허용된 뷰테이블에 대해, **사용자가 볼 수 있는 데이터의 범위**를 행 단위로 제한한다. 이는 접근 허용 여부(그룹 + 사용자)와 별개의 레이어이다.

| 구분 | 역할 | 판단 축 |
|------|------|--------|
| 접근 허용 | 이 뷰를 볼 수 있는가? | 메뉴기능 + 사용자 오버라이드 + 그룹 + 부서 |
| 행 수준 보안 | 볼 수 있다면, 어디까지 볼 수 있는가? | RLS 규칙 (rls_type + rls_config) |

#### 5.6.1 DB 레벨 강제를 기본으로 한다

에이전트는 자연어 질의를 SQL로 변환하는 구조이므로, 애플리케이션 레벨에서 WHERE 조건을 주입하는 방식만으로는 누락 리스크가 존재한다. 따라서 **DB 레벨의 RLS 정책을 기본 강제 수단으로 사용**하고, 뷰테이블 등록 시 설정한 RLS 규칙을 기반으로 DB 정책을 자동 생성한다.

```
[뷰테이블 등록/수정]
  → rls_type 저장 (code_secu의 경우 rls_config 불필요, mapping_table만 rls_config 필요)
  → DB RLS 정책 자동 생성/갱신 (code_secu는 ERP 테이블에서 자동 해석)

[쿼리 실행 시]
  → 세션 변수 설정 (userseq, deptseq 등)
  → DB가 RLS 정책을 자동 적용하여 행 필터링
```

#### 5.6.2 rls_type 정의

DB에서 확인된 데이터 범위 제어 메커니즘만을 `rls_type`으로 정의한다. DB 근거 없이 "앱에서 이렇게 하지 않을까"라는 추측으로 유형을 만들지 않는다.

**① code_secu — ERP 코드권한 기반 필터**

ERP의 코드권한 체계(`_TCACodeSecu` + 할당 테이블)를 활용한다. `_TCACodeSecu`에 화면(pgmseq)별로 어떤 코드권한그룹이 적용되는지가 **DB에 명시적으로 등록**되어 있으므로, 이를 그대로 RLS 정책으로 변환한다. 에이전트 뷰는 ERP 원천 테이블의 컬럼명을 그대로 사용하므로, 필터 대상 컬럼도 자동으로 결정된다.

```
rls_type: 'code_secu'
rls_config: 불필요 (NULL)

→ RLS 정책 (전체 자동 해석):
  1. agent_view_source에서 pgmseq 확인
  2. _TCACodeSecu에서 pgmseq로 조회 → 적용된 코드권한그룹(CodeSecuSeq) 확인
  3. _TCACodeSecuType에서 CodeSecuSeq로 조회 → 코드권한그룹 종류 확인
     (예: CodeSecuSeq=3 → CodeSecuName="부서" → CodeSeq는 DeptSeq)
  4. 사용자에게 허용된 codeseq 목록 수집
     코드권한그룹 종류(부서/사원 등)는 CodeSeq가 무엇을 의미하는지를 결정하고,
     할당 축(부서/그룹/사용자)은 누구에게 어떤 CodeSeq를 허용할지를 결정한다.
     이 둘은 독립적이다. 예: "부서" 코드권한이라도 사용자 단위로 할당될 수 있다.
     (실제 "부서" 코드권한: 부서 할당 502건, 사용자 할당 132건, 그룹 할당 12건)

     할당 테이블 3개에서 (pgmseq + codesecuseq) 조건으로 조회:
     (a) _TCACodeUserSecu: 해당 사용자(userseq)에 직접 할당된 codeseq 중 SecuRead='1'인 목록
     (b) _TCACodeGroupSecu: 사용자가 속한 그룹(groupseq, _tcagroupmember에서 확인)에 할당된 codeseq 중 SecuRead='1'인 목록
     (c) _TCACodeOrgDeptSecu: 사용자의 소속 부서(deptseq, _tcauser에서 확인)에 할당된 codeseq 중 SecuRead='1'인 목록
     ※ 3축 간 우선순위/병합 규칙은 미결 (10.6절)
  5. 허용된 codeseq 목록을 뷰의 해당 컬럼(ERP 원천 컬럼명)에 IN 조건으로 적용

모든 정보가 ERP 테이블에서 자동 조회되므로 rls_config에 별도 저장할 값이 없다.

예: 김영수(UserSeq=100, DeptSeq=150, GroupSeq=5)가 부서별전표작성조회(PgmSeq=270)를 사용할 때
  → _TCACodeSecu(PgmSeq=270) 조회 → CodeSecuSeq=3
  → _TCACodeSecuType(CodeSecuSeq=3) 조회 → "부서" → CodeSeq = DeptSeq
  → 할당 테이블 조회 (PgmSeq=270, CodeSecuSeq=3):
    (a) _TCACodeUserSecu(UserSeq=100) → CodeSeq=150 SecuRead='1' ✅
    (b) _TCACodeGroupSecu(GroupSeq=5) → CodeSeq=150 SecuRead='1', CodeSeq=200 SecuRead='1'
    (c) _TCACodeOrgDeptSecu(DeptSeq=150) → CodeSeq=150 SecuRead='1'
  → 허용된 codeseq: {150, 200} (= DeptSeq 150, 200)
  → 뷰의 DeptSeq 컬럼에 WHERE DeptSeq IN (150, 200) 적용
```

코드권한그룹별 실제 사용 현황 (권한 할당이 존재하는 것만):

| 코드권한그룹 | 적용 화면 수 | 부서 할당 | 사용자 할당 | 그룹 할당 |
|------------|-----------|----------|-----------|---------|
| 급여작업군 | 235개 | 8건 | 14건 | — |
| 부서 (163개 코드값) | 12개 | 502건 | 132건 | 12건 |
| 사원 | 2개 | 6건 | 48건 | — |
| 회계단위 | 1개 | 2건 | — | — |
| 예산편성단위 (233개 코드값) | 1개 | 466건 | — | — |

**② mapping_table — 전용 매핑 테이블 참조**

코드권한 체계 밖에서, 별도 매핑 테이블로 데이터 범위를 제한하는 경우. 현재 DB에서 확인된 사례는 BOM 품목별 부서 권한(`_tpdbomdeptauthority`)뿐이다.

```
rls_type: 'mapping_table'
rls_config: {
  "table": "_tpdbomdeptauthority",
  "view_join_key": "item_seq",
  "mapping_join_key": "itemseq",
  "mapping_dept_key": "deptseq",
  "allow_all_value": 0
}

→ RLS 정책: 뷰의 item_seq가 _tpdbomdeptauthority에서
  사용자의 deptseq에 매핑된 itemseq이거나 deptseq=0(전체 허용)인 행만 반환
```

**③ NULL — RLS 미적용**

`_TCACodeSecu`에 코드권한이 등록되어 있지 않고, 전용 매핑 테이블도 없는 화면. 접근 허용만 판단하고 데이터 범위 제한은 없다.

> **설계 원칙**: DB에서 확인된 데이터 범위 제어 메커니즘이 없는 화면은 RLS를 적용하지 않는다. 추후 ERP 앱 동작 분석이나 현업 인터뷰에서 DB에 반영되지 않은 데이터 제한이 발견되면, 그때 해당 메커니즘에 맞는 rls_type을 새로 정의한다.

#### 5.6.3 RLS 규칙 설정 프로세스

ERP 연동 뷰(erp_pgm, erp_derived)의 RLS 규칙은 **DB에서 확인 가능한 메커니즘**을 기반으로 결정한다.

**1단계: DB에서 추출 가능한 단서 수집** (자동화 가능)

```
(a) _TCACodeSecu에서 해당 pgmseq에 코드권한그룹이 적용되는지 확인 ★ 최우선
    → 적용됨 → code_secu 유형 결정, 할당 테이블 확인으로 진행
    → 미적용 → (b)~(d) 단서로 다른 유형 결정

(b) _tacslippgmcontrols에서 해당 pgmseq의 기본 조회 컨트롤 확인
    → @DeptName() 존재 → 부서 필터 가능성 높음
    → @EmpName() 존재 → 담당자 필터 가능성 있음
    → @AccUnit(), @SlipUnit() → 회계단위/전표단위 복합 조건 가능성

(c) 해당 화면과 관련된 전용 권한/매핑 테이블 존재 여부 확인
    → _tpdbomdeptauthority처럼 데이터 × 부서 매핑이 있는 경우

(d) _tcapgm.deptsecu 확인 (6,342건 데이터 존재)
    → 프로그램별 "부서 권한 적용 여부" 플래그 확인
```

**2단계: rls_type 결정 및 등록**

```
→ _TCACodeSecu에 코드권한 등록 있음 → code_secu
→ 전용 매핑 테이블 존재 (_tpdbomdeptauthority 등) → mapping_table
→ 위 두 가지 모두 해당 없음 → NULL

→ rls_type 결정 후 agent_view_registry에 등록
  (code_secu: rls_config 불필요, mapping_table: rls_config 작성)
→ DB RLS 정책 자동 생성
```

**3단계: 검증**

```
→ 테스트 계정으로 동일 화면을 부서별/직급별로 접속하여 조회 결과 비교
→ 에이전트의 RLS 적용 결과가 ERP 화면의 실제 조회 결과와 일치하는지 확인
→ 불일치 발견 시: DB에 반영되지 않은 앱 레벨 제한이 존재할 수 있음
   → 해당 메커니즘을 분석하여 새로운 rls_type 정의를 검토
```

비ERP 데이터 소스의 경우, 해당 소스의 접근 제어 모델을 분석하여 적합한 rls_type을 결정한다.

---

## 6. 비ERP 데이터 소스 확장 가이드

### 6.1 원칙

비ERP 데이터 소스(예: Jira, e2max, CRM 등)가 연동될 때, `agent_managed`와 같은 범용 auth_type으로 통일하지 않는다. **데이터 소스마다 고유한 접근 제어 모델이 다르므로**, 연동 시점에 해당 소스에 맞는 auth_type을 새로 정의한다.

모든 비ERP 소스는 `agent_view_access` 테이블을 공유하여 부서/사용자 단위로 접근 권한을 관리한다. 소스별로 달라지는 것은 데이터 연결 방식과 RLS 로직뿐이다.

### 6.2 새로운 auth_type 정의 시 필요한 사항

| 항목 | 설명 | 예시 (Jira 연동 시) |
|------|------|-------------------|
| auth_type 식별자 | agent_view_registry에 등록할 고유 식별자 | `jira` |
| 접근 허용 로직 | `agent_view_access` 테이블 기반 부서/사용자 단위 관리 (공통) | resolve_custom() 사용 |
| 데이터 범위 로직 | 허용된 사용자가 어디까지 볼 수 있는가? 필터 방법 | Jira 프로젝트 키 기준 필터, 또는 담당자 기준 필터 |
| rls_type / rls_config | 데이터 범위 제어 방식 | NULL(초기), 또는 향후 mapping_table 등으로 확장 |
| resolve 함수 | 공통 인터페이스(접근 허용 boolean + 데이터 범위 WHERE절)를 반환 | resolve_custom(userseq, view_id) (5.5절) |

### 6.3 예시: Jira 연동 시

```
auth_type: 'jira'

접근 허용:
  1. agent_view_access에서 view_id의 grant 목록 조회
  2. resolve_custom() 사용 (부서/사용자 단위 판단)

데이터 범위 (RLS):
  - 초기: rls_type=NULL (제한 없음)
  - 향후: 프로젝트별 권한이 필요하면 rls_type=mapping_table로 확장
    (예: agent_jira_project_access: projectKey별 부서/사용자 제한)

resolve_jira(userseq, view_id):
  1. resolve_custom(userseq, view_id) → 접근 허용 여부 판단
  2. 허용 시, rls_type에 따라 데이터 범위 필터 적용
  3. 반환: 접근 허용 여부 + (필터 조건 또는 없음)
```

### 6.4 예시: e2max 연동 시

```
auth_type: 'e2max'

접근 허용: e2max 자체 권한 체계를 따를 수도 있고,
          ERP 그룹 매핑으로 관리할 수도 있다.
          → 연동 시점에 e2max의 접근 제어 모델을 분석하여 결정

데이터 범위: 결재선의 부서 정보 활용 가능 여부에 따라
            rls_type (code_secu, mapping_table 등) 결정
```

이처럼 각 데이터 소스의 접근 제어 모델을 연동 시점에 분석하고, 그에 맞는 auth_type과 권한 판단 로직을 설계한다.

---

## 7. 예시 시나리오

### 등장인물

| 이름 | 부서 (deptseq) | 소속 그룹 | 사용자 오버라이드 |
|------|---------------|----------|----------------|
| 김영수 | 생산기술팀 (150) | 기본권한, 생산관리 | 없음 |
| 박지은 | 회계팀 (200) | 기본권한, 회계관리 | `_tcausersecu`에 인사급여조회(pgmseq=3001) 허용 |
| 이대표 | 대표실 (10) | 임원(사장단) | 없음 |

### 뷰테이블 등록 현황

| view_id | view_name | auth_type | source pgmseqs | rls_type | rls_config | domain |
|---------|-----------|-----------|----------------|----------|------------|--------|
| v_bom_master | BOM 마스터 | erp_pgm | [1234] | mapping_table | `{table: _tpdbomdeptauthority, ...}` | 생산 |
| v_bom_cost | BOM 원가분석 | erp_pgm | [1235] | NULL | — | 생산 |
| v_slip_summary | 전표 현황 | erp_pgm | [2001] | code_secu | NULL | 회계 |
| v_payroll_summary | 급여 현황 | erp_pgm | [3001] | NULL | — | 인사 |
| v_cost_purchase_trend | 원가+구매단가 추이 | erp_derived | [1234, 2345] | code_secu | NULL | 생산 |

### ERP 그룹별 권한 현황 (관련 pgmseq만 발췌)

| groupseq | 그룹명 | pgmseq | 화면명 | secu |
|----------|--------|--------|--------|------|
| 5 | 생산관리 | 1234 | BOM 조회 | 1 (허용) |
| 5 | 생산관리 | 1235 | BOM 원가분석 | 2 (차단) |
| 5 | 생산관리 | 2345 | 구매단가조회 | 1 (허용) |
| 8 | 회계관리 | 2001 | 전표조회 | 1 (허용) |
| 8 | 회계관리 | 3001 | 인사급여조회 | 2 (차단) |
| 40 | 임원 | 1234 | BOM 조회 | 1 (허용) |
| 40 | 임원 | 1235 | BOM 원가분석 | 1 (허용) |
| 40 | 임원 | 2001 | 전표조회 | 1 (허용) |
| 40 | 임원 | 2345 | 구매단가조회 | 1 (허용) |
| 40 | 임원 | 3001 | 인사급여조회 | 1 (허용) |

---

### 시나리오 1: erp_pgm 기본 — 김영수가 BOM 조회

> **김영수**: "현재 BOM 등록된 품목 목록 보여줘"

**판단 과정**:

```
1. 관련 뷰: v_bom_master (auth_type: erp_pgm, pgmseq: 1234)

2. [접근 허용]
   _tcausersecu 확인: (김영수, 1234) → 레코드 없음 → 그룹으로
   김영수의 그룹: [기본권한, 생산관리(5)]
   _tcagroupsecu: (생산관리, 1234) → secu='1' ✅ 허용

3. [데이터 범위]
   rls_type: code_secu
   → _TCACodeSecu에서 pgmseq=1234 조회 → CodeSecuSeq=3 확인
   → _TCACodeSecuType → "부서" → CodeSeq = DeptSeq
   → 김영수에게 허용된 codeseq 조회 → 부서(150) 허용
   → 뷰의 DeptSeq 컬럼에 IN 조건 적용

4. 결과: 생산기술팀(150) 관련 BOM 품목만 반환
```

**에이전트 응답**: "생산기술팀 기준 BOM 등록 품목 목록입니다. (전체 320건)"

---

### 시나리오 2: erp_pgm 그룹 차단 — 김영수가 원가 분석 시도

> **김영수**: "품목별 원가 분석 보여줘"

**판단 과정**:

```
1. 관련 뷰: v_bom_cost (auth_type: erp_pgm, pgmseq: 1235)

2. [접근 허용]
   _tcausersecu 확인: (김영수, 1235) → 레코드 없음 → 그룹으로
   김영수의 그룹: [기본권한, 생산관리(5)]
   _tcagroupsecu: (생산관리, 1235) → secu='2' ❌ 차단

3. 결과: 차단
```

**에이전트 응답**: "원가 분석 데이터에 대한 접근 권한이 없습니다. 해당 권한이 필요하시면 관리자에게 문의해 주세요."

---

### 시나리오 3: erp_pgm 사용자 오버라이드 허용 — 박지은이 급여 조회

> **박지은**: "이번 달 부서별 급여 총액 알려줘"

**판단 과정**:

```
1. 관련 뷰: v_payroll_summary (auth_type: erp_pgm, pgmseq: 3001)

2. [접근 허용]
   _tcausersecu 확인: (박지은, 3001) → secu='1' ✅ 허용 (오버라이드)
   → 그룹 권한(회계관리 그룹에서 3001은 차단)과 무관하게 즉시 허용

3. [데이터 범위]
   rls_type: NULL → RLS 미적용

4. 결과: 전사 급여 데이터 반환
```

**에이전트 응답**: "이번 달 부서별 급여 총액입니다. (전체 부서)"

---

### 시나리오 4: erp_derived + ALL 로직 — 김영수가 복합 분석 요청

> **김영수**: "우리 팀 품목의 원가 추이와 구매단가 변동 같이 보여줘"

**판단 과정**:

```
1. 관련 뷰: v_cost_purchase_trend (auth_type: erp_derived, pgmseqs: [1234, 2345])

2. [접근 허용]
   pgmseq 1234 (BOM 조회):
     _tcausersecu → 없음 → _tcagroupsecu: 생산관리 secu='1' ✅
   pgmseq 2345 (구매단가조회):
     _tcausersecu → 없음 → _tcagroupsecu: 생산관리 secu='1' ✅
   ALL 로직: 1234 ✅ AND 2345 ✅ → ✅ 허용

3. [데이터 범위]
   rls_type: code_secu
   → _TCACodeSecu에서 pgmseq별 조회 → CodeSecuSeq=3 확인
   → _TCACodeSecuType → "부서" → CodeSeq = DeptSeq
   → 김영수에게 허용된 codeseq 조회 → 부서(150) 허용
   → 뷰의 DeptSeq 컬럼에 IN 조건 적용

4. 결과: 생산기술팀 관련 품목의 원가+구매단가 추이 반환
```

**에이전트 응답**: "생산기술팀 품목의 원가 추이와 구매단가 변동 분석입니다."

---

### 시나리오 5: erp_derived ALL 로직 차단 → 대체 후보 활용

> **김영수**: "품목별 원가 구성과 구매단가를 비교해줘"

에이전트가 후보로 선정한 뷰테이블:

- **v_cost_analysis** (erp_derived, pgmseqs: [1234, 1235, 2345]) — 원가 구성 + 구매단가 종합 뷰
- **v_bom_cost** (erp_pgm, pgmseq: 1235) — BOM 원가분석 개별 뷰
- **v_material_cost** (erp_pgm, pgmseq: 1234) — 자재 원가 개별 뷰
- **v_purchase_price** (erp_pgm, pgmseq: 2345) — 구매단가 개별 뷰

**판단 과정**:

```
1. v_cost_analysis (erp_derived) 권한 판단
   → pgmseqs: [1234, 1235, 2345]
   → resolve_erp_pgm(김영수, 1234) → ✅ 허용
   → resolve_erp_pgm(김영수, 1235) → ❌ 차단 (생산관리 그룹 secu='2')
   → resolve_erp_pgm(김영수, 2345) → ✅ 허용
   → ALL 로직: 1235 차단 → v_cost_analysis 전체 차단 ❌

2. 대체 후보 개별 뷰 권한 판단
   → v_bom_cost (pgmseq: 1235) → ❌ 차단
   → v_material_cost (pgmseq: 1234) → ✅ 허용
   → v_purchase_price (pgmseq: 2345) → ✅ 허용

3. 최종 사용 가능 뷰: v_material_cost, v_purchase_price
```

**에이전트 응답**: "자재 원가와 구매단가 변동 데이터를 기준으로 비교 분석해드리겠습니다. (일부 원가 구성 데이터는 접근 권한이 없어 제외되었습니다.)"

---

### 시나리오 6: 크로스 도메인 질의 — 이대표의 종합 분석

> **이대표**: "부서별 매출 대비 인건비 비율 분석해줘"

**판단 과정**:

```
1. 관련 뷰 후보:
   - v_slip_summary (erp_pgm, pgmseq: 2001) → 임원 secu='1' ✅
   - v_payroll_summary (erp_pgm, pgmseq: 3001) → 임원 secu='1' ✅

2. 모든 뷰 허용. RLS 확인:
   - v_slip_summary: rls_type=code_secu → _TCACodeSecu에서 pgmseq=2001 조회 → 코드권한그룹 확인 → 이대표에게 허용된 부서 기준 필터
   - v_payroll_summary: rls_type=NULL → RLS 미적용
```

**⚠ 여기서 설계 결정 필요**: 임원 그룹처럼 전사 데이터를 봐야 하는 사용자에 대해, 코드권한 할당이 어떻게 되어 있는지에 따라 결과가 달라진다. 임원에게 전체 부서가 코드권한으로 허용되어 있으면 자연스럽게 전사 데이터가 조회되고, 그렇지 않으면 제한된다. 아래 "10. 미결 사항"에서 다룬다.

---

## 8. 접근 권한 관리 화면

> 접근 권한 관리는 두 곳에서 제공한다: **(1) 데이터 메뉴** — 뷰테이블이 주어. 슬라이드 패널의 [접근 권한] 탭에서 "이 뷰테이블에 누가 접근 가능한가?"를 확인, **(2) 관리자 > 사용자 관리** — 사용자가 주어. 사용자 상세 패널에서 "이 사용자가 어떤 뷰테이블에 접근 가능한가?"를 확인. *[상세: service-plan.md 3.4절, 3.5절 (관리자 > 사용자 관리) / data-ia.md]*

### 8.1 데이터 메뉴 — [접근 권한] 탭

데이터 메뉴는 단일 화면(뷰테이블 목록 + 슬라이드 패널)으로 구성되며, 패널의 4개 탭 중 **[접근 권한]** 탭에서 해당 뷰테이블의 접근 권한을 확인한다.

**ERP 뷰 — 접근 가능 부서/그룹/사용자**: ERP 권한 테이블(`_TCAOrgDeptSecu`, `_tcagroupsecu`, `_tcausersecu`)에서 자동 계산한 현황을 표시. 부서별/그룹별 허용 근거 및 사용자 오버라이드를 표시. erp_derived의 경우 ALL 로직 적용 결과를 표시. 읽기 전용.

**비ERP 뷰 — 접근 가능 부서/사용자**: `agent_view_access` 테이블에서 조회하여 부서/사용자별 접근 권한 표시. [편집] 버튼으로 권한을 추가/삭제할 수 있다.

**RLS 설정**: rls_type, rls_config 표시. [편집] 버튼으로 뷰테이블 수정 다이얼로그에서 RLS 규칙을 변경할 수 있다.

- ERP 연동 뷰의 접근 권한은 ERP에서 관리되므로, 이 화면에서는 현황을 보여주고 뷰테이블 매핑만 설정한다.
- 안내 문구: "ⓘ ERP 연동 뷰의 접근 권한은 ERP 그룹별권한등록에서 관리됩니다. 비ERP 뷰는 이 화면에서 직접 관리합니다."

### 8.2 관리자 > 사용자 관리 — 뷰테이블 접근 현황

사용자 관리 화면의 슬라이드 패널에 **"뷰테이블 접근 현황"** 섹션을 추가한다. "이 사용자가 왜 이 데이터를 못 보는가?"라는 관리자의 질문에 답하는 용도이다.

**표시 내용**:
- 해당 사용자의 모든 뷰테이블에 대한 접근 허용/차단 여부와 **허용 근거**(어떤 그룹의 어떤 secu 값인지, 사용자 오버라이드인지)를 상세 표시
- erp_derived의 경우 원천 pgmseq별 판단 결과와 ALL 로직 적용 과정을 표시
- 허용된 뷰의 RLS 적용 결과(어떤 범위의 데이터를 볼 수 있는지)도 표시
- 접근 상태 필터(전체/허용/차단)로 필터링 가능

### 8.3 핵심 관리 포인트

**ERP 연동 뷰 (erp_pgm, erp_derived):**
- 데이터 메뉴에서 **접근 권한 자체를 변경하지 않는다**. 접근 권한은 ERP의 부서별권한등록(`_TCAOrgDeptSecu`), 그룹별권한등록(`_tcagroupsecu`), 사용자별권한등록(`_tcausersecu`)에서 관리한다.
- 데이터 메뉴에서는 ERP 권한을 기반으로 **자동 계산된 현황을 보여주고**, 뷰테이블의 **매핑(pgmseq)과 RLS 설정**을 관리한다.

**비ERP 데이터 소스 뷰:**
- `agent_view_access` 테이블 기반, 부서/사용자 단위로 관리자가 직접 설정한다. 그룹 단위 할당은 미지원.
- 데이터 메뉴 > [접근 권한] 탭에서 권한을 추가/삭제한다.

---

## 9. 뷰테이블 등록·관리 프로세스

### 9.1 erp_pgm 뷰테이블 등록

```
1. 현업 부서 인터뷰 → 사용 중인 조회 화면 목록 확보
2. 해당 화면의 pgmseq 확인 (_tcamenu)
3. 뷰테이블 생성 (DB)
4. agent_view_registry에 등록 (auth_type='erp_pgm')
5. agent_view_source에 pgmseq 매핑
6. RLS 규칙 설정 (5.5.3절 프로세스 수행)
   (a) _TCACodeSecu에서 코드권한 적용 여부 확인, 전용 매핑 테이블 존재 여부 확인
   (b) rls_type / rls_config 결정 후 등록 → DB RLS 정책 자동 생성
7. 접근 권한 검증: _TCAOrgDeptSecu/_tcagroupsecu/_tcausersecu 조회하여 "접근 가능 부서/그룹/사용자" 확인
   → 현업이 기대하는 대상과 일치하는지 검증
8. RLS 검증: 테스트 계정으로 부서별/직급별 조회 결과가 ERP와 일치하는지 확인
```

### 9.2 erp_derived 뷰테이블 등록

```
1. 현업 요구사항 접수 → 필요한 데이터 조합 정의
2. 원천 ERP 화면(pgmseq) 식별
3. 뷰테이블 생성 (DB)
4. agent_view_registry에 등록 (auth_type='erp_derived')
5. agent_view_source에 원천 pgmseq 전부 매핑
6. 검증: 원천 pgmseq 전부에 접근 가능한 그룹/사용자 목록 확인
   → "이 복합 뷰를 실제로 볼 수 있는 사람"이 기대와 맞는지 검증
   → ALL 로직으로 인해 접근 가능 대상이 좁아질 수 있음에 유의
```

### 9.3 비ERP 데이터 소스 뷰 등록

```
1. 데이터 소스 연동 요구사항 접수
2. 해당 소스의 접근 제어 모델 분석
3. auth_type 정의 (섹션 6.2 참고)
   - auth_type 식별자
   - 접근 허용 로직 (공통 인터페이스 구현)
   - 데이터 범위 로직
   - 전용 매핑/권한 테이블 (필요 시)
4. 뷰테이블 생성 (DB)
5. agent_view_registry에 등록 (새 auth_type)
6. 전용 테이블에 권한 매핑 설정
7. 관리자 화면에서의 해당 소스 권한 관리 UX 설계
```

---

## 10. 미결 사항

다음 항목은 추가 논의 및 결정이 필요하다.

### 10.1 erp_pgm/erp_derived 뷰의 부서 필터 해제 조건

ERP에서 임원급 사용자가 전사 데이터를 조회할 수 있는 경우, 에이전트에서도 부서 필터를 적용하지 않아야 한다. 최신 분석에서 `_tcapgm` 데이터(6,342건)와 `_TCAOrgDeptSecu`(409건)가 확인되었으나, 부서 필터 해제 조건은 여전히 불명확하다.

- `_tcapgm.deptsecu` 플래그가 `_TCAOrgDeptSecu`와 어떻게 연동되는지 확인 필요. `_TCAOrgDeptSecu`의 secu 분포가 허용 407 / 차단 2로, 대부분 "허용"이어서 실질적 차단 효과가 미미 — 이 테이블의 실제 역할 확인 필요
- `esecu`/`psecu` 플래그가 부서 범위 확장에 관여하는지 확인 필요 (`_tcagroupsecu`에서 442건만 값 존재)
- 코드권한의 "부서" 그룹(`code_secu`)이 적용된 화면에서는 코드권한 할당이 부서 필터 역할을 할 수 있음 — 코드권한과 `deptsecu` 플래그의 관계 확인 필요
- 확인 전까지는 `_TCACodeSecu`에 등록된 화면만 `code_secu` RLS를 적용하고, 등록되지 않은 화면은 `rls_type=NULL`로 처리 (5.5.2절 설계 원칙 준수)

### 10.2 다중 그룹 시 권한 충돌 해결

사용자가 여러 그룹에 속하고, 그룹별로 같은 pgmseq에 대한 권한이 다를 경우의 처리:
- **현재 설계**: 하나라도 secu='1'이면 허용 (ERP 동작 추정치와 동일)
- **확인 필요**: 실 ERP에서의 다중 그룹 충돌 해결 로직이 동일한지 검증
- **참고**: 최신 데이터 기준 그룹 소속 없는 사용자가 1,848명(56%)으로 과반수. 이 사용자들의 접근 권한이 부서별(`_TCAOrgDeptSecu`)로만 결정되는지, 아예 차단인지 확인 필요

### 10.3 권한 캐싱 및 동기화 주기

ERP 권한 변경이 에이전트에 반영되는 타이밍:
- 실시간 조회: 매 질의마다 ERP 권한 테이블을 직접 조회 → 정확하지만 성능 부담
- 캐싱: 일정 주기로 사용자별 허용 뷰 목록을 캐싱 → 빠르지만 반영 지연
- 결정 필요: 허용 가능한 권한 반영 지연 시간

### 10.4 감사 로그

에이전트를 통한 데이터 조회 이력을 기록할 것인지:
- 누가, 언제, 어떤 뷰테이블을, 어떤 질의로 조회했는지
- 차단된 접근 시도도 기록할 것인지
- 컴플라이언스 요건에 따라 결정

### 10.5 Layer 1 권한 축 적용 순서 확인

최신 분석에서 ERP의 화면 접근 권한이 4가지 축(메뉴기능/부서별/그룹별/사용자별)으로 확인되었으나, 이들의 적용 순서와 우선순위는 DB만으로 확인할 수 없다.

- 현재 `resolve_erp_pgm()`의 2→3→4→5→6 순서는 추정치
- ERP 운영팀에 확인 필요: (a) 메뉴기능 권한이 다른 권한보다 선행하는지 (b) 부서별 권한과 그룹별 권한 중 어느 것이 우선인지 (c) 권한 축 간 AND 관계인지 OR 관계인지
- 확인 결과에 따라 `resolve_erp_pgm()` 로직 수정 필요

### 10.6 코드권한 3축 할당의 우선순위

코드권한의 부서/그룹/사용자 3가지 할당 축이 동시에 존재할 때의 처리:

- 사용자 할당 > 그룹 할당 > 부서 할당 순서로 우선하는지 (Layer 1의 사용자 오버라이드와 동일한 패턴인지)
- `PlusMinusSecu` 필드(`_TCACodeUserSecu`에만 존재)가 권한 추가/제거에 어떻게 관여하는지
- 코드권한그룹 중 "급여작업군"이 235개 화면에 적용되어 있어 영향 범위가 넓음 — 급여작업군 코드권한의 실제 동작 방식 확인 필요
