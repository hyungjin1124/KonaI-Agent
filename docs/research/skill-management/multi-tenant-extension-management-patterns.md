# 멀티테넌트 SaaS 확장(Extension) 관리 UX 패턴 비교 분석

> 작성일: 2026-03-18  
> 대상 시스템: 코나체인 (멀티테넌트 AI 에이전트 플랫폼)  
> 목적: 3계층 스킬 관리 체계 설계를 위한 벤치마크 분석

---

## 1. Executive Summary

본 문서는 멀티테넌트 SaaS 제품 5개의 확장/플러그인/앱 관리 패턴을 분석하고, 코나체인의 3계층(플랫폼 → 테넌트 → 개인) 스킬 관리 체계에 가장 적합한 모델을 추천한다.

핵심 발견사항:
- **Microsoft Teams**가 유일하게 완전한 3계층(조직 → 팀 → 개인) 모델을 구현하고 있으며, 코나체인의 구조와 가장 유사하다.
- **Slack Enterprise Grid**는 조직→워크스페이스→개인의 계층 구조를 가지지만, 개인 레벨의 자율성이 제한적이다.
- **Salesforce**는 관리자 중심의 강력한 접근 제어를 제공하며, Permission Set 기반 세분화가 뛰어나다.
- **Notion**은 페이지 단위 연결(connection) 모델이라는 독특한 접근을 취한다.
- **Shopify**는 스토어 오너 중심의 단순한 2계층 모델이다.

**추천:** Microsoft Teams의 3계층 정책 모델 + Salesforce의 Permission Set 세분화 + Slack의 승인 워크플로를 결합한 하이브리드 모델.

---

## 2. 제품별 상세 분석

### 2.1 Slack (워크스페이스 / Enterprise Grid)

#### 관리 계층 구조

Slack은 플랜에 따라 2계층 또는 3계층 모델을 제공한다.

**일반 워크스페이스 (2계층):**
- **워크스페이스 오너/관리자**: 앱 승인(Approve), 제한(Restrict), 앱 관리자(App Manager) 지정
- **일반 멤버**: 사전 승인된 앱 설치, 미승인 앱 요청(Request) 제출

**Enterprise Grid (3계층):**
- **조직(Org) 관리자**: 조직 전체 앱 정책 설정, 전체 워크스페이스에 앱 배포, 조직 수준에서 앱 승인/제한
- **워크스페이스 오너**: 개별 워크스페이스 내 앱 관리 (조직 정책 범위 내에서)
- **일반 멤버**: 승인된 앱만 설치 가능, 미승인 앱은 요청을 통해서만 접근

#### 정책 설정 방식

- **전체 조직 기본 활성화**: Organization Policies에서 앱을 승인 후 특정 워크스페이스에 일괄 배포. Org 관리자가 앱을 org-level에서 설치하면 선택한 모든 워크스페이스에 즉시 추가된다.
- **특정 팀만 사용 가능**: 조직 수준에서 앱을 승인하되, 특정 워크스페이스에만 설치하는 방식으로 구현. 워크스페이스별로 독립적인 승인/제한이 가능하며, 조직 수준에서 승인된 앱도 개별 워크스페이스에서 독립적으로 제한할 수 있다.
- **자동화 규칙**: 특정 조건(앱 scope 유형, 요청된 워크스페이스 등)에 따라 자동으로 승인/제한하는 Automation Rule을 설정할 수 있다.

#### 개인 커스터마이즈 범위

- 사전 승인된(Pre-approved) 앱은 자유롭게 설치 가능
- 앱 승인이 활성화된 경우, 승인되지 않은 앱은 요청만 가능
- 개인이 앱의 알림 설정이나 개인 환경설정은 조정할 수 있으나, 앱 자체를 설치/제거하는 것은 관리자 정책에 종속
- Slack은 앱별 개인 토글(켜기/끄기) 기능을 별도로 제공하지 않음

#### UI 구분 방식

- **Pre-Approved 카테고리**: Slack Marketplace 내 별도 "Pre-Approved" 카테고리로 관리자가 사전 승인한 앱을 표시
- **설치 상태 표시**: 앱 목록에서 "Installed" 상태로 구분
- **관리자 설치 vs 개인 설치**에 대한 명시적 배지나 라벨은 없음. 대신 앱 관리 대시보드에서 "누가 요청/설치했는지" 이력으로 확인 가능

#### 강제 vs 선택

- 조직/워크스페이스 수준에서 설치된 앱을 개인이 비활성화할 수 없음 (강제)
- 관리자가 제한(Restrict)한 앱은 이미 설치되어 있더라도 사용 지속은 가능하지만, 관리자가 명시적으로 제거하면 완전히 차단됨
- 개인은 자신이 설치한 앱만 제거 가능

---

### 2.2 Salesforce AppExchange

#### 관리 계층 구조

Salesforce는 엄격한 관리자 중심 모델을 채택한다.

- **시스템 관리자(System Administrator)**: AppExchange 패키지 설치, 라이선스 할당, Permission Set 관리
- **권한이 부여된 사용자**: "Download AppExchange Packages" 퍼미션이 있는 사용자도 설치 가능하나, 이는 사실상 관리자 수준의 권한(Customize Application, Modify All Data 등)을 필요로 함
- **일반 사용자**: 설치 권한 없음. 관리자가 할당한 Permission Set/Profile에 따라 기능 접근

#### 정책 설정 방식

- **전체 조직 기본 활성화**: 패키지 설치 시 "Install for All Users" 옵션 선택. 모든 프로필에 대해 Full Access가 자동 부여됨
- **특정 팀만 사용 가능**: 설치 시 "Install for Specific Profiles" 선택 후 프로필별로 접근 수준(Full Access / Read Only / No Access) 지정. 또는 설치 후 Permission Set을 생성하여 특정 사용자/그룹에만 할당
- **Permission Set License**: 패키지 라이선스 + 권한을 하나의 Permission Set으로 묶어 한 번에 할당하는 방식도 지원
- **Permission Set Group**: 여러 Permission Set을 그룹화하여 역할(Role) 기반으로 일괄 배포

#### 개인 커스터마이즈 범위

- 사용자는 앱을 직접 설치하거나 제거할 수 없음
- Permission Set이 부여된 범위 내에서만 기능 사용 가능
- 앱 내부 설정(예: 대시보드 레이아웃, 알림 선호도)은 개인이 조정 가능하나, 핵심 기능 접근은 관리자가 통제
- 사용자가 AppExchange를 브라우징하고 테스트 드라이브할 수는 있으나, 실제 설치는 불가

#### UI 구분 방식

- **Installed Packages 페이지**: Setup 메뉴에서 조직에 설치된 모든 패키지 목록을 확인 가능
- **Permission Set Assignment**: 사용자 레코드에서 할당된 Permission Set을 통해 어떤 앱에 접근 가능한지 확인
- **Managed Package License**: 사용자 레코드의 "Managed Packages" 섹션에서 할당된 라이선스 확인 가능
- **"Built for your org" 섹션**: 커스텀 앱은 Teams Store 내 별도 섹션에 표시
- 관리자 설치 vs 개인 설치 구분은 해당 사항 없음 (모든 설치가 관리자를 통해 이루어짐)

#### 강제 vs 선택

- 완전 강제 모델. 관리자가 설치하고 권한을 부여하면 사용자는 해당 기능에 자동으로 노출됨
- 사용자는 앱을 "끌" 수 없음. 앱 탭이나 컴포넌트가 프로필/Permission Set에 의해 표시되면 숨길 수 없음
- 관리자만이 라이선스를 회수하거나 Permission Set을 제거하여 접근을 차단할 수 있음

---

### 2.3 Shopify App Store

#### 관리 계층 구조

Shopify는 스토어 오너 중심의 비교적 단순한 모델이다.

- **스토어 오너**: 앱 설치/제거에 대한 전체 권한, 결제 승인, 스태프 권한 관리
- **스태프 멤버**: "Manage and install apps and channels" 퍼미션이 부여된 경우에만 앱 설치 가능. "Approve app charges" 퍼미션은 별도로 부여해야 유료 앱 활성화 가능
- **Plus 플랜의 조직(Organization)**: 여러 스토어를 묶는 상위 계층이 존재하며, 조직 수준 역할(Organization Role)로 관리

#### 정책 설정 방식

- **전체 스토어 기본 활성화**: 오너가 앱을 설치하면 해당 스토어의 모든 스태프가 앱을 볼 수 있음. 단, 앱이 접근하는 데이터 영역에 대한 스태프 퍼미션이 있어야 실제 사용 가능
- **특정 스태프만 사용 가능**: 스태프별 퍼미션을 세분화하여 "Apps and Channels" 카테고리 내에서 제어. 단, 이미 설치된 앱의 사용 자체를 스태프별로 토글하는 기능은 제한적이며, 주로 앱이 접근하는 데이터 영역(Orders, Products, Customers 등)의 퍼미션으로 간접 제어
- Shopify Plus에서는 커스텀 역할(Custom Role)을 생성하여 더 세분화된 권한 설정 가능

#### 개인 커스터마이즈 범위

- 스태프는 "Manage and install apps" 퍼미션이 없으면 앱을 설치/제거할 수 없음
- 이미 설치된 앱의 개인 설정 조정은 앱 자체의 구현에 따라 다름
- 스태프가 자신만의 앱을 독립적으로 설치하는 개념은 없음 (모든 앱은 스토어 수준)

#### UI 구분 방식

- **Settings > Apps 페이지**: 설치된 모든 앱 목록을 한눈에 확인
- **Activity and Permissions 섹션**: 각 앱의 데이터 접근 영역, 최근 활동, 미사용 권한(30일 이상) 표시
- **Privacy 섹션**: 앱이 접근할 수 있는 개인정보 유형을 카테고리별로 표시
- **"Made by Shopify" 표시**: Shopify 자체 앱은 활동 추적에서 제외되며, 별도로 신뢰 표시
- 관리자 설치 vs 스태프 설치에 대한 배지 구분은 없음 (설치 이력으로만 추적)

#### 강제 vs 선택

- 강제 모델. 오너가 설치한 앱은 적절한 퍼미션을 가진 모든 스태프에게 노출됨
- 스태프가 개별적으로 앱을 숨기거나 비활성화할 수 없음
- 오너만이 앱을 제거할 수 있음

---

### 2.4 Notion

#### 관리 계층 구조

Notion은 워크스페이스 오너 중심 모델에 페이지 단위 연결(connection)이라는 독특한 계층을 추가한다.

- **조직(Organization) 오너** (Enterprise): 여러 워크스페이스에 걸친 보안/통합 정책 설정, Admin Console 관리
- **워크스페이스 오너**: 통합(Connection) 승인/제한, 승인 목록(Approved List) 관리, 멤버의 연결 추가 권한 제어
- **일반 멤버**: 승인된 연결을 특정 페이지에 추가. 단, 워크스페이스 오너가 제한한 경우 승인 목록의 연결만 사용 가능

#### 정책 설정 방식

- **전체 조직 기본 활성화**: 워크스페이스 오너가 연결을 설치하면 모든 멤버가 해당 연결을 페이지에 추가 가능. Enterprise에서는 조직 오너가 Admin Console의 Security 탭에서 전체 워크스페이스에 통합 정책을 일괄 적용(Bulk Apply)할 수 있음
- **특정 팀만 사용 가능**: "Only from approved list" 설정을 통해 멤버가 사용할 수 있는 연결을 제한. 워크스페이스 오너가 특정 연결의 페이지 접근 범위를 지정할 수 있으며, "Who can manage page access"를 Workspace owners로 설정하면 일반 멤버는 연결을 페이지에 추가/제거할 수 없음
- Notion 자체 연결(Notion-built)은 자동 승인 옵션 제공

#### 개인 커스터마이즈 범위

- 승인 목록 내의 연결은 자유롭게 페이지에 추가/제거 가능
- 멤버가 연결한 페이지에서만 해당 연결이 활성화됨 (페이지 단위 범위 지정)
- 연결의 capability(읽기/수정/삽입)는 연결 자체에 설정되어 있어 개인이 조정 불가
- Enterprise에서 "Workspace owners" only 설정 시 멤버의 연결 관리 권한이 완전히 차단됨

#### UI 구분 방식

- **Settings > Connections**: Workspace 탭(관리자용 보안/컴플라이언스 연결)과 Member 탭(멤버 연결 관리)으로 분리
- **페이지 ••• 메뉴**: 각 페이지에 연결된 통합 목록 표시. "Add connections" 버튼으로 추가
- **Approved connections 목록**: 승인된 연결 옆에 설치한 사용자 이름 표시
- **"Connected by [사용자명]"**: 누가 연결을 추가했는지 표시
- 관리자 설치(워크스페이스 레벨) vs 개인 연결(페이지 레벨)이 구조적으로 분리되어 있어 자연스럽게 구분됨

#### 강제 vs 선택

- 선택 모델에 가까움. 워크스페이스 수준에서 연결이 승인되어도, 개인이 특정 페이지에 연결을 추가하지 않으면 활성화되지 않음
- 단, 보안/컴플라이언스 연결(SIEM, DLP)은 워크스페이스 전체에 적용되어 개인이 끌 수 없음
- 워크스페이스 오너는 특정 사용자의 연결 접근을 Revoke(회수)할 수 있음

---

### 2.5 Microsoft Teams

#### 관리 계층 구조

Microsoft Teams는 가장 완전한 3계층 모델을 제공한다.

- **IT 관리자 (조직)**: Teams Admin Center에서 전체 조직의 앱 허용/차단, 앱 권한 정책(Permission Policy), 앱 설정 정책(Setup Policy) 관리. 2025년 4월부터 App Centric Management로 마이그레이션 중
- **팀 오너**: 팀 내 앱 추가/제거 (관리자 정책 범위 내), 커스텀 앱 업로드 허용 여부 설정
- **개인 사용자**: 개인 범위(Personal scope)에서 앱 추가, 관리자가 핀(pin)한 앱 사용, 허용된 앱 탐색 및 설치

#### 정책 설정 방식

- **전체 조직 기본 활성화**: Global (Org-wide default) 정책에서 앱을 허용하면 전체 사용자에게 적용. App Setup Policy에서 특정 앱을 핀(pin)하거나 자동 설치(pre-install)하여 모든 사용자의 앱 바에 기본으로 표시 가능
- **특정 팀만 사용 가능**: 커스텀 App Permission Policy를 생성하여 특정 사용자/그룹에 할당. Microsoft Apps, Third-party Apps, Custom Apps 카테고리별로 "Allow all / Block all / Allow specific / Block specific" 옵션 제공. App Centric Management에서는 앱별로 "Available to everyone / Available to specific users and groups / Available to no one" 3단계로 설정
- **핀 설정**: App Setup Policy로 특정 사용자 그룹의 앱 바에 원하는 앱을 핀. FirstlineWorker 같은 빌트인 프리셋도 제공
- **권한 등급**: 앱별 High / Medium / Low 권한 수준(Privilege Level)을 자동 계산하여 관리자에게 위험도 표시

#### 개인 커스터마이즈 범위

- **User Pinning**: 관리자가 허용한 경우 사용자가 앱 바에서 앱을 직접 핀/언핀 가능. 관리자가 핀한 앱의 순서도 변경 가능 (User pinning 설정이 켜져 있을 때)
- **개인 앱 추가**: 허용된 앱 중에서 자유롭게 개인 범위로 추가
- **팀 앱 추가**: 팀 오너가 허용한 경우 팀 채널에 앱 탭 추가 가능
- **커스텀 앱 업로드**: 관리자가 허용한 경우 사용자가 직접 커스텀 앱 업로드 (sideloading)

#### UI 구분 방식

- **"Built for your org" 섹션**: Teams Store 내에서 조직 커스텀 앱 별도 표시
- **핀된 앱 vs 수동 추가 앱**: 앱 바에서 관리자가 핀한 앱은 상단에 고정 표시. 사용자가 추가한 앱은 하단에 배치
- **"Added by your admin" 표시**: 관리자가 사전 설치(pre-install)한 앱에 표시
- **앱 카테고리**: Microsoft Apps / Third-party Apps / Custom Apps로 구분 표시
- **권한 수준 뱃지**: Admin Center에서 High / Medium / Low 권한 수준 표시
- **차단 상태**: "Blocked by admin" 또는 "Blocked by publisher" 상태 표시

#### 강제 vs 선택

- **하이브리드 모델**:
  - 관리자가 Setup Policy로 사전 설치(pre-install)한 앱은 강제로 사용자에게 표시되며, 사용자가 제거할 수 없음
  - 관리자가 핀한 앱은 앱 바에 고정되지만, User Pinning이 켜져 있으면 순서 변경 가능
  - 관리자가 허용(Allow)만 한 앱은 사용자가 자유롭게 추가/제거 가능 (선택)
  - 관리자가 차단(Block)한 앱은 사용자가 설치, 발견, 사용 모두 불가 (강제 차단)

---

## 3. 비교표

| 비교 항목 | Slack (Enterprise Grid) | Salesforce AppExchange | Shopify App Store | Notion | Microsoft Teams |
|-----------|------------------------|----------------------|-------------------|--------|-----------------|
| **관리 계층 수** | 3계층 (Org → Workspace → 멤버) | 2계층 (Admin → User) | 2계층 (Owner → Staff) | 2~3계층 (Org → Workspace → 멤버) | 3계층 (IT Admin → Team → 개인) |
| **설치 주체** | 관리자 승인 후 멤버 설치 | 관리자 전용 | 오너 또는 권한된 스태프 | 관리자 또는 멤버 (정책에 따라) | 관리자 사전설치 또는 사용자 추가 |
| **정책 배포 단위** | Org 정책 → Workspace 단위 | 프로필/Permission Set → 사용자 단위 | 스태프 퍼미션 → 개인 단위 | Workspace → 페이지 단위 | 정책 → 사용자/그룹 단위 |
| **"전체 활성화" 방법** | Org-level 앱 설치 후 워크스페이스 배포 | "Install for All Users" 선택 | 앱 설치 시 자동 (데이터 퍼미션 기반) | 워크스페이스에 연결 추가 | Global Policy에서 Allow + Setup Policy로 Pin/Pre-install |
| **"특정 팀만" 방법** | 특정 워크스페이스에만 설치 | Permission Set으로 사용자/그룹에 할당 | 스태프 퍼미션으로 간접 제어 | Approved List + 페이지 접근 관리 | Custom Permission Policy → 사용자/그룹 할당 |
| **개인 커스터마이즈** | 승인된 앱 설치, 알림 설정 | 앱 내부 설정만 가능 | 앱 내부 설정만 가능 | 페이지에 연결 추가/제거 | 앱 추가/제거, 핀 순서 변경 |
| **관리자 설치 UI 구분** | Pre-Approved 카테고리 | 해당 없음 (전부 관리자 설치) | 없음 (설치 이력으로만) | Workspace 탭 vs Member 탭 분리 | "Added by your admin" 라벨, 핀 위치 |
| **강제 배포 앱 끄기** | 불가 (강제) | 불가 (강제) | 불가 (강제) | 부분 가능 (보안 연결 제외) | 사전설치 앱은 불가, 허용 앱은 제거 가능 |
| **승인 워크플로** | 멤버 요청 → 관리자 승인/제한 | 없음 (관리자 직접 설치) | 없음 (오너 직접 설치) | 없음 (Approved List 방식) | 사용자가 Store에서 요청 가능 |
| **자동화 규칙** | Automation Rule (scope 기반 자동 승인) | 없음 (수동) | 없음 (수동) | 없음 (수동) | App Centric Management 자동 마이그레이션 |

---

## 4. 핵심 UX 패턴 분석

### 4.1 "관리자 설치" vs "내가 추가" 구분 패턴

| 제품 | 구분 방식 | 시각적 표현 |
|------|----------|------------|
| **Slack** | Pre-Approved 카테고리 분류 | Marketplace 내 별도 카테고리 탭 |
| **Salesforce** | 구분 불필요 (전부 관리자 설치) | Permission Set 기반 접근 제어만 존재 |
| **Shopify** | 구분 미제공 | 앱 활동 이력(Activity log)으로만 추적 |
| **Notion** | 구조적 분리 (Workspace vs Page level) | Settings 탭 분리 + 페이지 메뉴 연결 표시 |
| **Teams** | 명시적 라벨 + 위치 차별화 | "Added by your admin" 라벨, 앱 바 상단 고정 |

**시사점:** Microsoft Teams의 "Added by your admin" 라벨과 앱 바 내 위치 차별화가 가장 직관적이다. 코나체인에서는 스킬 카드에 "플랫폼 제공" / "조직 배포" / "내가 추가" 배지를 붙이는 방식을 권장한다.

### 4.2 강제(Mandatory) vs 선택(Optional) 배포 패턴

세 가지 패턴이 관찰된다:

1. **완전 강제 (Salesforce, Shopify)**: 관리자가 설치하면 권한 있는 모든 사용자에게 노출. 개인이 끌 수 없음.
2. **완전 선택 (Notion)**: 워크스페이스에 연결이 있어도 개인이 페이지에 추가해야 활성화.
3. **하이브리드 (Teams, Slack)**: 관리자가 강제 배포(pin/pre-install)할 수도 있고, 허용만(allow) 해서 선택에 맡길 수도 있음.

**시사점:** 코나체인에 하이브리드 모델을 권장한다. 핵심 AI 스킬(예: 보안 정책, 컴플라이언스)은 강제 배포하고, 생산성 스킬은 테넌트 관리자가 "추천" 또는 "허용"으로 설정하여 개인 선택에 맡기는 구조가 적합하다.

### 4.3 승인 워크플로 패턴

| 패턴 | 적용 제품 | 설명 |
|------|----------|------|
| **요청-승인 (Request-Approve)** | Slack, Teams | 사용자가 원하는 앱을 요청하면 관리자가 검토 후 승인/거절 |
| **사전 승인 목록 (Approved List)** | Notion, Slack | 관리자가 미리 허용 목록을 만들고, 사용자는 목록 내에서 자유롭게 선택 |
| **완전 관리자 통제 (Admin Only)** | Salesforce, Shopify | 설치 자체가 관리자 전용 작업 |

**시사점:** 코나체인에서는 "사전 승인 목록 + 요청-승인" 이중 구조를 권장한다. 테넌트 관리자가 승인 목록을 관리하되, 목록에 없는 스킬은 사용자가 요청할 수 있는 워크플로를 제공한다.

---

## 5. 코나체인 3계층 모델 설계 추천

### 5.1 추천 아키텍처

```
┌─────────────────────────────────────────────────────┐
│  플랫폼 관리자 (코나체인 팀)                          │
│  ─ 전체 스킬 카탈로그 관리                            │
│  ─ 보안 검증 완료 스킬에 "Verified" 배지 부여          │
│  ─ 특정 스킬을 전체 테넌트에 강제 배포 가능             │
│  ─ 위험 스킬 전체 차단 가능                           │
├─────────────────────────────────────────────────────┤
│  테넌트 관리자 (고객사 IT 관리자)                      │
│  ─ 스킬 정책 설정:                                   │
│    • 강제(Mandatory): 전 사용자에게 자동 활성화         │
│    • 추천(Recommended): 기본 활성화, 개인이 끌 수 있음  │
│    • 허용(Allowed): 카탈로그에 표시, 개인이 직접 추가   │
│    • 차단(Blocked): 카탈로그에서 숨김                  │
│  ─ 승인 목록(Approved List) 관리                      │
│  ─ 사용자 요청에 대한 승인/거절 워크플로                │
│  ─ 사용자 그룹별 정책 할당                            │
├─────────────────────────────────────────────────────┤
│  개인 사용자                                         │
│  ─ "허용" 스킬 자유 추가/제거                          │
│  ─ "추천" 스킬 비활성화 가능                           │
│  ─ "강제" 스킬은 끌 수 없음 (배지로 이유 설명)          │
│  ─ 미승인 스킬 요청(Request) 제출                     │
│  ─ 개인 스킬 설정(파라미터) 커스터마이즈                │
└─────────────────────────────────────────────────────┘
```

### 5.2 UI 설계 추천

#### 스킬 목록 화면 재구성

현재 "내 스킬" / "스킬 탐색" 2분류를 다음과 같이 확장:

| 기존 | 개선안 |
|------|--------|
| 내 스킬 | **활성 스킬** (내가 사용 중인 모든 스킬) |
| 스킬 탐색 | **스킬 카탈로그** (추가 가능한 스킬 탐색) |
| (없음) | **관리** (테넌트 관리자 전용: 정책 설정, 요청 관리) |

#### 스킬 카드 배지 시스템

| 배지 | 색상/아이콘 | 의미 |
|------|-----------|------|
| 🔒 **필수** | 빨간색 잠금 아이콘 | 플랫폼 또는 조직이 강제 배포. 끌 수 없음 |
| ⭐ **추천** | 파란색 별 아이콘 | 조직 관리자가 추천. 기본 활성화되나 끌 수 있음 |
| ✅ **승인됨** | 초록색 체크 아이콘 | 승인 목록에 포함. 자유롭게 추가/제거 가능 |
| 🛡️ **검증됨** | 방패 아이콘 | 플랫폼이 보안 검증 완료 |
| 👤 **내가 추가** | 사용자 아이콘 | 개인이 직접 추가한 스킬 |

#### 상태 전환 흐름

```
스킬 카탈로그에서 발견
    │
    ├── 승인 목록에 있음 → [추가] 버튼 활성 → 즉시 활성화
    │
    ├── 승인 목록에 없음 → [요청] 버튼 표시 → 테넌트 관리자 검토
    │                                          ├── 승인 → 사용자에게 알림 → 활성화
    │                                          └── 거절 → 사용자에게 사유 안내
    │
    └── 차단됨 → 카탈로그에 표시 안 됨 (또는 "조직 정책에 의해 사용 불가" 표시)
```

### 5.3 벤치마크 모델별 차용 요소

| 차용 요소 | 출처 | 적용 방식 |
|----------|------|----------|
| 3계층 정책 계층 구조 | Microsoft Teams | 플랫폼 → 테넌트 → 개인의 정책 상속 및 오버라이드 |
| App Centric Management | Microsoft Teams | 스킬별로 "누가 사용 가능한지"를 개별 설정하는 UI |
| Pre-Approved List | Slack, Notion | 테넌트 관리자가 승인 목록을 관리하고 멤버는 목록 내 자유 선택 |
| Request-Approve 워크플로 | Slack | 미승인 스킬에 대한 요청→검토→승인 흐름 |
| Permission Set 세분화 | Salesforce | 스킬별 접근 권한을 사용자 그룹 단위로 세밀하게 제어 |
| 페이지 단위 연결 | Notion | 개인이 특정 워크플로/에이전트에만 스킬을 연결하는 범위 지정 |
| 강제/추천/허용 3단계 | Microsoft Teams | Mandatory(Pin+Pre-install) / Recommended / Allowed 구분 |
| "Added by admin" 라벨 | Microsoft Teams | 스킬 카드에 출처(플랫폼/조직/개인) 명시 |
| Activity & Permissions 추적 | Shopify | 스킬별 데이터 접근 범위와 최근 활동 내역 표시 |
| Automation Rule | Slack | 특정 조건 충족 시 자동 승인하는 규칙 엔진 |

### 5.4 구현 우선순위

| 순위 | 기능 | 복잡도 | 영향도 |
|------|------|--------|--------|
| P0 | 스킬 카드 배지 시스템 (필수/추천/승인/내가 추가) | 낮음 | 높음 |
| P0 | 테넌트 관리자의 스킬 정책 설정 (강제/추천/허용/차단) | 중간 | 높음 |
| P1 | 승인 목록(Approved List) 관리 UI | 중간 | 높음 |
| P1 | "활성 스킬" / "스킬 카탈로그" 화면 재구성 | 낮음 | 중간 |
| P2 | 요청-승인 워크플로 (알림 포함) | 높음 | 중간 |
| P2 | 사용자 그룹별 정책 할당 | 높음 | 중간 |
| P3 | 스킬별 Activity & Permissions 추적 | 높음 | 낮음 |
| P3 | 자동 승인 규칙 엔진 | 높음 | 낮음 |

---

## 6. 최종 추천

코나체인의 3계층 스킬 관리에 가장 적합한 모델은 **Microsoft Teams의 3계층 정책 프레임워크를 기반으로, Slack의 승인 워크플로와 Salesforce의 Permission Set 세분화를 결합한 하이브리드 모델**이다.

그 이유는 다음과 같다.

첫째, Microsoft Teams만이 코나체인과 동일한 "플랫폼 운영자 → 조직 관리자 → 개인 사용자"의 3계층 구조를 가지고 있다. Teams의 Org-wide setting → Permission Policy → Setup Policy의 계층적 정책 상속 모델은 코나체인의 "플랫폼 스킬 카탈로그 → 테넌트 스킬 정책 → 개인 스킬 구성"에 직접 매핑된다.

둘째, Slack의 Request-Approve 워크플로는 AI 에이전트 플랫폼에서 특히 중요하다. 새로운 AI 스킬이 조직 데이터에 접근할 수 있으므로, 테넌트 관리자가 승인 게이트를 통해 보안과 컴플라이언스를 통제할 수 있어야 한다.

셋째, Salesforce의 Permission Set 모델은 "같은 스킬이라도 부서/역할에 따라 다른 수준의 접근 권한을 부여"하는 세분화를 가능하게 한다. AI 에이전트 플랫폼에서는 스킬이 접근하는 데이터 범위가 곧 보안 경계이므로, 이 수준의 세분화가 필수적이다.

Teams의 강제(Pre-install)/추천(Pin)/허용(Allow)/차단(Block) 4단계 정책에 Notion의 "페이지 단위 연결" 아이디어를 더해, 개인 사용자가 특정 에이전트나 워크플로에만 스킬을 활성화할 수 있는 범위 지정(scoping) 기능까지 고려하면, 가장 유연하면서도 안전한 3계층 스킬 관리 체계를 구축할 수 있을 것이다.

---

## 부록: 참고 자료

- Slack Help Center — Manage app approval for your workspace
- Slack Developer Docs — Managing app approvals (Enterprise Grid)
- Microsoft Learn — Manage app permission policies in Microsoft Teams
- Microsoft Learn — App centric management to manage user access
- Microsoft Learn — Manage agents and app setup policies
- Notion Help Center — Enterprise connection settings
- Notion Help Center — Add & manage integrations
- Shopify Help Center — Managing apps / Permissions
- Salesforce — Application Installation Guide
- Salesforce Developer Docs — Permission Sets and Profile Settings in Packages
