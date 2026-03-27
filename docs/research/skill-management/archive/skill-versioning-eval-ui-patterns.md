# 소프트웨어 아티팩트 버전 관리 × 품질 테스트 결과 연동 UI 패턴 조사

> 작성일: 2026-03-18  
> 목적: 에이전트 스킬의 버전별 Eval 결과를 직관적으로 보여주는 UI 설계를 위한 벤치마킹 리서치

---

## 1. Terraform Registry — 모듈 상세 페이지

### 1-1. 버전 목록 표시 방식

Terraform Registry는 모듈 상세 페이지 우측 상단에 **드롭다운 셀렉터**를 배치하여 버전을 전환한다. 드롭다운에는 시맨틱 버전(예: `3.19.0`, `3.18.1`)이 최신순으로 나열되며, 선택 즉시 해당 버전의 README, Inputs/Outputs, Dependencies, Resources 탭 콘텐츠가 전체 교체된다.

버전 드롭다운 옆에는 **사용량 메트릭**(다운로드 수, 의존 모듈 수)이 인라인으로 표시되어, "이 버전이 얼마나 널리 쓰이는가"를 즉시 가늠할 수 있다. 페이지 하단의 "Provision Instructions" 코드 블록도 선택된 버전에 맞춰 자동 갱신된다.

### 1-2. 호환성 매트릭스 및 변경 로그

Terraform Registry 자체는 전용 호환성 매트릭스 UI를 제공하지 않지만, 모듈 소스에서 파싱한 **Provider Requirements**(예: `aws >= 4.0`, `hashicorp/random ~> 3.1`)를 테이블로 렌더링한다. 이를 통해 사용자는 특정 버전이 어떤 프로바이더 버전을 요구하는지 한눈에 확인할 수 있다.

변경 로그는 GitHub 릴리스 태그와 연동되어 있다. 모듈 퍼블리셔가 Git 태그를 푸시하면 Registry 웹훅이 자동으로 새 버전을 감지하고, GitHub Release Notes가 있으면 해당 내용을 링크한다. 다만 Registry 내에서 인라인으로 changelog를 보여주는 전용 UI는 없으며, "Source Code" 링크를 통해 GitHub로 이동하는 구조이다.

### 1-3. 버전 간 전환 UI

드롭다운 선택 시 **페이지 전체가 해당 버전 컨텍스트로 전환**되는 패턴을 사용한다. URL 경로에 버전이 포함되어(`/modules/hashicorp/consul/aws/3.19.0`) 버전별 딥링크가 가능하다. 두 버전 간 diff/compare 뷰는 Registry 내에 존재하지 않으며, GitHub의 compare 기능(`v3.18.0...v3.19.0`)으로 대체한다.

### 1-4. 롤백 동작

Terraform Registry에는 "이전 버전으로 롤백" 버튼이 없다. 롤백은 사용자의 Terraform 설정 파일에서 `version = "~> 3.18.0"` 같은 버전 제약을 변경하고 `terraform init -upgrade`를 실행하는 코드 레벨 동작이다. Registry는 버전 제약 문법(`~>`, `>=`, `!=`)에 대한 가이드를 제공하여 사용자가 안전한 버전 범위를 지정하도록 돕는다.

### 1-5. 우리 시스템에의 시사점

- **드롭다운 + URL 딥링크** 패턴은 버전 전환의 표준이며, 비개발자도 직관적으로 이해 가능
- Provider Requirements 테이블처럼, 스킬 버전별 **호환 에이전트/모델 매트릭스**를 표 형태로 보여줄 수 있음
- Registry 자체에 diff 뷰가 없어 사용자가 GitHub로 이동해야 하는 점은 **불편 사례**로 참고 — 우리는 인앱 diff를 제공하는 것이 차별점

---

## 2. Docker Hub — 이미지 상세 페이지

### 2-1. 태그 목록 및 보안 스캔 결과

Docker Hub는 이미지 상세 페이지에서 **Tags 탭**을 통해 전체 태그 목록을 테이블로 제공한다. 각 행에는 태그명, OS/Architecture, 압축 크기, 최종 push 시각이 표시되며, Docker Scout(구 Snyk) 통합을 활성화한 경우 **취약점 요약 배지**가 태그 행에 인라인으로 나타난다.

태그를 클릭하면 해당 Digest 페이지로 진입하며, 여기서 **Vulnerabilities 탭**을 선택하면 심각도별(Critical → Low) 정렬된 취약점 상세 목록이 렌더링된다. 각 항목에는 CVE 식별자, 영향받는 패키지명, 도입 버전, 수정 가능 버전(있을 경우)이 포함된다.

### 2-2. 인라인 취약점 요약 방식

Docker Hub의 핵심 UX 패턴은 **태그 목록 테이블에 취약점 카운트를 컬러코딩으로 인라인 표시**하는 것이다. 예를 들어 `latest` 태그 행 옆에 `22 High / 8 Medium` 같은 배지가 붙어, 사용자가 개별 태그 페이지에 들어가지 않아도 어떤 태그가 보안적으로 안전한지 즉시 비교할 수 있다.

이 패턴은 **"태그 간 취약점 수 비교"**를 가능하게 만드는데, 시간이 지남에 따라 취약점이 줄어드는지 늘어나는지를 태그 목록만 훑어보아도 파악 가능하다.

### 2-3. 이미지 계층 정보

Docker Hub는 이미지의 레이어 구성을 보여주는 뷰를 제공한다. Docker Scout은 이를 확장하여 SBOM(Software Bill of Materials)을 자동 추출하고, 레이어별로 어떤 패키지가 도입되었는지, 그 패키지에 어떤 취약점이 있는지를 트리 구조로 시각화한다. 이는 "이 취약점이 어떤 Dockerfile 명령에서 유래했는가"를 추적하는 데 핵심적이다.

### 2-4. 롤백 및 버전 비교

Docker Hub에는 명시적 "롤백" 버튼이 없다. 롤백은 `docker pull image:v1.2.3` 같은 특정 태그를 재배포하는 운영 행위이다. 두 태그 간 diff도 Docker Hub UI에서 직접 제공하지 않으나, Docker Scout이 태그 간 취약점 수 증감을 비교하는 기능을 제공하며, `docker scout compare` CLI 명령으로 두 이미지의 SBOM 차이를 확인할 수 있다.

### 2-5. 우리 시스템에의 시사점

- **테이블 행 인라인 배지** 패턴이 가장 직관적 — 스킬 버전 목록의 각 행에 Eval 통과율을 컬러코딩 배지로 표시
- 심각도 기반 색상 체계(Critical=Red, High=Orange, Medium=Yellow)처럼, Eval 점수에도 **색상 스케일**(90+%=Green, 70-89%=Yellow, <70%=Red) 적용 가능
- SBOM → 트리 구조 분석처럼, Eval 실패 시 **어떤 시나리오에서 실패했는가**를 드릴다운으로 보여주는 구조가 유용

---

## 3. GitHub Actions Marketplace

### 3-1. 액션 버전 및 검증 배지

GitHub Actions Marketplace의 액션 상세 페이지에는 **버전 선택 드롭다운**과 함께, 퍼블리셔의 검증 상태를 나타내는 **배지 체계**가 적용된다. "Verified creator" 배지는 퍼블리셔 조직의 도메인과 이메일이 인증되었고 2FA가 활성화되었음을 의미한다. 별도로 "App meets the requirements for listing" 배지도 존재한다.

GitHub는 서드파티 코드를 분석하거나 검증하지 않으며, 배지는 순수하게 퍼블리셔의 신원 인증 상태만을 반영한다. 이는 우리 시스템에서도 **스킬 퍼블리셔 인증**과 **스킬 자체의 품질 평가**를 분리해서 보여줘야 한다는 시사점을 준다.

### 3-2. 워크플로우 통합 UX

액션 상세 페이지에서 가장 눈에 띄는 UX는 **"Use latest version" 버튼**이다. 이를 클릭하면 워크플로우 YAML 스니펫이 클립보드에 복사되며, 버전 드롭다운에서 특정 버전을 선택하면 스니펫의 `@v2.1.0` 부분이 자동 갱신된다.

사용 통계는 "used by X repositories" 형태로 표시되어 해당 액션의 대중성을 가늠하게 한다. README는 마크다운 렌더링으로 보여주며, 탭 구조로 README / Releases / Versions를 구분한다.

### 3-3. 버전 비교 및 롤백

Marketplace 내에서 두 버전을 diff하는 전용 뷰는 없다. 릴리스 목록에서 특정 릴리스의 Changelog를 확인하는 것이 최선이며, 코드 수준 비교는 소스 리포의 Compare 기능으로 대체된다. 롤백은 워크플로우 파일에서 `uses: actions/checkout@v3` → `uses: actions/checkout@v2`로 변경하여 커밋하는 방식이다.

### 3-4. 우리 시스템에의 시사점

- **"사용 코드 자동 생성 + 클립보드 복사"** 패턴은 스킬 설치 UX에 직접 적용 가능 (예: `tessl install skill@v2.0` 명령 복사 버튼)
- 퍼블리셔 인증 배지와 품질 배지를 **이중 배지 시스템**으로 분리하여, "누가 만들었나"와 "얼마나 좋은가"를 독립적으로 전달
- "used by X" 사용 통계는 **스킬 채택률 지표**로 활용 가능

---

## 4. TestRail / Allure Report — 테스트 결과 시각화

### 4-1. TestRail의 대시보드 패턴

TestRail은 테스트 실행 결과를 **실시간 대시보드**로 제공한다. 프로젝트 대시보드에 진입하면 가장 먼저 보이는 것은 **상태 요약 차트**(파이 차트 또는 도넛 차트)로, Passed/Failed/Blocked/Untested/Retest 비율이 색상으로 구분된다. 이 차트는 테스트 케이스가 추가되거나 결과가 업데이트될 때마다 실시간으로 갱신된다.

차트 아래에는 **진행률 바**(Progress bar)가 위치하며, 전체 대비 완료된 테스트의 비율을 시각적으로 보여준다. 각 차트에는 Refine 버튼이 있어 시간 범위, 프로젝트, 마일스톤 등으로 필터링할 수 있다.

### 4-2. TestRail의 트렌드 및 히스토리

TestRail의 Reports 모듈에서는 **Activity (Results Over Time)** 차트를 생성할 수 있다. 이는 시간 축(x)에 대해 통과/실패 수의 변화를 꺾은선 그래프로 보여준다. 보고서는 날짜 범위, 테스트 런 필터, 상태 필터를 조합하여 커스터마이징 가능하며, PNG/CSV/XLS로 내보내기를 지원한다.

Status Tops (Cases) 보고서는 어떤 테스트 케이스가 가장 자주 사용되거나 높은 실패율을 보이는지를 막대 그래프로 시각화한다. 이를 통해 "문제가 반복되는 영역"을 빠르게 식별할 수 있다.

### 4-3. Allure Report의 시각화 체계

Allure Report는 테스트 결과 시각화에서 가장 풍부한 UI를 제공한다. 핵심 시각 요소는 다음과 같다:

**Overview 페이지**: 중앙에 **도넛형 파이 차트**가 위치하며, 전체 테스트의 Passed/Failed/Broken/Skipped 비율을 보여준다. 차트 중앙의 숫자는 통과율(%)을 나타낸다. 마우스 오버 시 각 상태의 절대 수치와 비율이 툴팁으로 표시된다.

**Trend 그래프**: 여러 빌드에 걸친 테스트 결과의 변화를 시계열 꺾은선 그래프로 보여준다. 각 수직선이 하나의 빌드(리포트 버전)에 해당하며, 가장 오른쪽이 현재 빌드이다. Trend, Duration Trend, Retries Trend 등 다양한 트렌드 그래프가 제공된다.

**Severity 그래프**: 테스트를 심각도(Blocker, Critical, Normal, Minor, Trivial)와 상태를 교차하여 막대 그래프로 보여준다. 로그 스케일을 사용하여 유사한 값도 시각적으로 구별할 수 있게 한다.

**Timeline 뷰**: 테스트 실행의 시간적 순서를 수평 간트 차트 형태로 시각화한다. 병렬 실행되는 테스트들의 시작/종료 시점을 한눈에 파악할 수 있으며, 슬라이더로 특정 구간을 확대하거나 실행 시간 임계값 이상의 테스트만 필터링할 수 있다.

### 4-4. Allure의 히스토리 및 재시도

Allure는 동일 테스트의 **실행 히스토리**를 빌드 간에 연결하여 History 탭에서 보여준다. 테스트의 고유 식별자를 기반으로 이전 빌드 결과들을 링크하며, 각 결과의 상태 변화를 타임라인으로 추적할 수 있다. Retries 탭은 단일 빌드 내에서 같은 테스트가 여러 번 실행된 경우의 결과를 나열한다.

CI 서버용 Allure 플러그인(Jenkins, GitHub Actions 등)은 히스토리 데이터를 자동으로 누적 관리하여, 별도 설정 없이도 트렌드 그래프가 빌드마다 점진적으로 채워진다.

### 4-5. 우리 시스템에의 시사점

- **도넛 파이 차트 + 중앙 통과율 숫자** 패턴은 스킬 버전의 Eval 결과 요약에 직접 적용 가능
- **Trend 그래프**를 버전 축으로 변환하면, "v1.0 → v1.5 → v2.0으로 갈수록 Eval 점수가 어떻게 변했는가"를 직관적으로 보여줌
- Allure의 Severity × Status 교차 그래프처럼, **Eval 시나리오 카테고리별 통과/실패 비율**을 히트맵 또는 교차 차트로 표현 가능
- Timeline 뷰의 **슬라이더 기반 필터링**은 복잡한 Eval 결과를 탐색하는 데 유용한 인터랙션 패턴

---

## 5. Tessl Registry — AI 스킬 전용

### 5-1. 개요 및 포지셔닝

Tessl은 스스로를 "에이전트 스킬의 패키지 매니저"로 포지셔닝하며, npm이나 pip이 코드 의존성을 관리하듯이 에이전트 스킬을 버전 관리·평가·배포하는 플랫폼이다. Tessl Registry는 수천 개의 평가된 스킬을 인덱싱하며, 각 스킬에 품질 점수, 영향도 평가, 버전 히스토리, 저자 정보를 제공한다.

### 5-2. 버전 고정 평가 결과

Tessl의 핵심 차별화 요소는 **Eval 결과가 특정 게시 버전에 고정(pinned)**된다는 점이다. 예를 들어 v1.2.0의 Eval 결과와 v1.1.0의 결과가 독립적으로 존재하여, 특정 수정이 성능을 개선했는지 혹은 회귀를 일으켰는지를 정확히 판단할 수 있다. GitHub에서 설치할 때도 정확한 커밋 SHA에 고정(pin)된다.

스킬 상세 페이지에는 다음 탭들이 존재한다:
- **Overview**: 스킬 설명, 설치 명령, 호환 에이전트 정보
- **Review**: 스킬 품질 리뷰 결과(Validation, Implementation Quality, Activation Quality, Overall Score)
- **Evals**: Task Eval 실행 결과(Baseline vs With-Skill 비교)
- **Security**: Snyk 통합 보안 스캔 결과

### 5-3. 평가 체계 — 3단계 방법론

Tessl은 세 가지 계층의 평가를 제공한다:

**Skill Review (정적 분석)**: SKILL.md 파일의 프론트매터 유효성, 구현 품질(명확한 지시, 구체적 예시), 활성화 품질(트리거 명확성, 스코프 정의)을 LLM 기반으로 점수화한다. 레지스트리 페이지에서 각 카테고리별 점수 분해를 확인할 수 있다.

**Task Eval (동적 평가)**: Tessl이 스킬을 분석하여 시나리오와 채점 기준을 자동 생성한 뒤, 에이전트를 두 번 실행한다 — 스킬 없이(Baseline)와 스킬 적용 후(With-Skill). 격리된 컨테이너에서 실행되며, 심사 모델이 루브릭에 따라 산출물을 채점한다. 결과에는 항목별 점수, 채점 근거, 총점, Baseline vs With-Tile 비교가 포함된다.

**Repo Eval (실환경 평가, 베타)**: 실제 리포지토리의 변경 이력을 기반으로 현실적인 변경 요청에 대해 에이전트가 수행하는 성과를 평가한다.

### 5-4. CI/CD 통합

`tessl skill publish` 명령 실행 시, 이전 Eval이 없거나 타일 내용이 변경된 경우 **자동으로 새 평가가 트리거**된다. `-skip-evals` 플래그로 옵트아웃할 수 있다. CLI에서 `tessl eval list --status completed`로 평가 상태를 필터링하거나, `tessl eval view-results <id>`로 색상 코딩된 점수 표를 확인할 수 있다.

### 5-5. 레지스트리 페이지의 Eval 결과 표시

스킬 카드(목록 뷰)에는 **Overall Score 배지**가 표시되어, 상세 페이지에 들어가지 않아도 품질을 가늠할 수 있다. 2026년 3월 기준으로 Snyk 보안 점수도 카드에 인라인으로 표시되어, 품질·영향·보안 점수가 세 겹의 시그널로 동시에 노출된다.

실제 공개 사례:
- Cisco CodeGuard 보안 스킬: Overall 84%, 1.78× improvement
- ElevenLabs TTS 스킬: Overall 93%, Review 94%, 1.32× improvement
- Hugging Face tool-builder 스킬: Overall 81%, 1.63× improvement

### 5-6. 버전 비교 및 롤백

Tessl CLI의 `tessl outdated` 명령은 설치된 타일의 현재 버전, 안전 업데이트 버전, 최신 버전을 비교하여 보여주며, `tessl update`로 업데이트한다. `--force` 플래그로 breaking 업데이트를 포함할 수 있다. `tessl.json` 매니페스트에 버전이 기록되므로, 이전 버전으로의 롤백은 매니페스트의 커밋 SHA를 이전 값으로 변경하고 `tessl install`을 재실행하는 방식이다.

레지스트리 웹 UI에서의 두 버전 간 직접 diff 뷰는 현재 제공되지 않으나, Eval 결과가 버전에 고정되어 있으므로 두 버전의 Eval 탭을 각각 열어 점수를 비교할 수 있다.

### 5-7. 우리 시스템에의 시사점

- **Baseline vs With-Skill 비교 패턴**은 우리의 "v2.0이 v1.5보다 나은가?" 질문에 직접 답하는 구조
- 발행 시 자동 Eval 트리거는 **CI/CD 연동의 모범 사례**
- 카드 뷰의 **다중 배지 시스템**(품질 + 영향 + 보안)은 스킬 목록의 정보 밀도를 높이는 좋은 패턴
- "× improvement" 지표는 비개발자에게 **"이 버전이 얼마나 더 나은가"를 한 수치로 전달**하는 강력한 UX

---

## 6. 크로스 플랫폼 패턴 비교 종합

### 6-1. 버전 목록 표시 방식 비교

| 플랫폼 | 표시 방식 | 정렬 | 추가 정보 인라인 표시 |
|--------|----------|------|---------------------|
| Terraform Registry | 드롭다운 셀렉터 | 최신순 | 다운로드 수 |
| Docker Hub | 테이블 (Tags 탭) | Push 시각순 | 취약점 배지, OS/Arch, 크기 |
| GitHub Actions | 드롭다운 + Releases 목록 | 최신순 | 사용 리포 수, 검증 배지 |
| TestRail | 테스트 런 목록 테이블 | 날짜순 | 통과율 진행 바 |
| Allure Report | 빌드 히스토리 타임라인 | 시간순 | 상태별 색상 바 |
| Tessl Registry | 타일 버전 (커밋 SHA 고정) | 게시순 | Overall Score 배지, 보안 점수 |

### 6-2. 테스트/품질 결과 요약 방식 비교

| 플랫폼 | 요약 방식 | 시각 요소 | 드릴다운 가능 여부 |
|--------|----------|----------|------------------|
| Terraform Registry | 없음 (외부 CI 의존) | — | — |
| Docker Hub | 심각도별 취약점 카운트 배지 | 컬러코딩 숫자 | 예 (CVE 목록까지) |
| GitHub Actions | 검증 배지만 (코드 품질 없음) | 배지 아이콘 | 아니오 |
| TestRail | 파이 차트 + 진행률 바 | 도넛 차트, 컬러 바 | 예 (개별 케이스까지) |
| Allure Report | 상태 파이 차트 + 트렌드 그래프 | 풀 대시보드 | 예 (스텝 레벨까지) |
| Tessl Registry | Overall % + ×improvement 수치 | 점수 배지 + 카테고리 분해 | 예 (시나리오별 점수까지) |

### 6-3. 롤백 메커니즘 비교

| 플랫폼 | UI 내 롤백 버튼 | 실제 롤백 방식 |
|--------|---------------|--------------|
| Terraform Registry | 없음 | 코드에서 version 제약 변경 → terraform init |
| Docker Hub | 없음 | 특정 태그 재배포 (docker pull image:tag) |
| GitHub Actions | 없음 | 워크플로우 YAML에서 버전 태그 변경 |
| TestRail | 해당 없음 (테스트 도구) | — |
| Allure Report | 해당 없음 (리포팅 도구) | — |
| Tessl Registry | CLI 기반 | tessl.json에서 커밋 SHA 변경 → tessl install |

### 6-4. 버전 Diff/Compare 뷰 비교

| 플랫폼 | 인앱 Diff 뷰 | 대체 수단 |
|--------|-------------|----------|
| Terraform Registry | 없음 | GitHub Compare 링크 |
| Docker Hub | 없음 | Docker Scout compare CLI |
| GitHub Actions | 없음 | GitHub Compare |
| TestRail | 보고서 간 비교 (수동) | CSV 내보내기 후 비교 |
| Allure Report | History 탭 (동일 테스트의 빌드 간 비교) | 트렌드 그래프로 시각적 비교 |
| Tessl Registry | 없음 (버전별 Eval 탭 분리 열람) | CLI tessl outdated |

---

## 7. 우리 시스템 설계를 위한 종합 권장 사항

### 7-1. 버전 목록 UI

**권장: 드롭다운 + 테이블 하이브리드**

- 페이지 상단에 **현재 활성 버전 드롭다운**을 배치하여 빠른 전환 지원 (Terraform Registry 패턴)
- 하단에는 **전체 버전 히스토리 테이블**을 제공하여 한눈에 조망 (Docker Hub 패턴)
- 테이블의 각 행에 Eval 통과율 배지를 **인라인으로 표시** (Docker Hub 취약점 배지 패턴)
- 현재 활성(배포) 버전에는 "Active" 레이블을 강조 표시

### 7-2. Eval 결과 요약 표시

**권장: 3-레이어 요약 시스템**

1. **카드/목록 레벨**: Overall Score 배지 + 색상 (Green/Yellow/Red) — 원클릭 판단 가능 (Tessl 패턴)
2. **버전 상세 레벨**: 도넛 파이 차트(통과율) + Baseline vs With-Skill 비교 막대 (Allure + Tessl 혼합)
3. **드릴다운 레벨**: 시나리오별 통과/실패 상세 + 채점 근거 텍스트 (Allure 스텝 상세 패턴)

### 7-3. 버전 비교 뷰

**권장: 인앱 Side-by-Side Compare (차별화 기회)**

- 조사한 6개 플랫폼 중 **인앱 버전 비교 뷰를 제공하는 곳이 없음** — 이것이 차별화 포인트
- 좌/우 패널에 두 버전의 Eval 결과를 나란히 배치
- 시나리오별 점수 변화를 **색상 diff**(개선=Green, 퇴행=Red, 동일=Gray)로 표시
- 상단에 "v1.5 → v2.0: Overall +12%, 3개 시나리오 개선, 1개 퇴행" 같은 **원라인 요약**

### 7-4. 롤백 UX

**권장: 명시적 롤백 버튼 (차별화 기회)**

- 조사한 플랫폼들은 모두 코드/CLI 수준 롤백에 의존 — IT 관리자(비개발자)에게 부적합
- 버전 히스토리 테이블의 각 행에 **"이 버전으로 롤백" 액션 버튼** 배치
- 클릭 시 확인 다이얼로그에서 영향 범위(이 스킬을 사용 중인 에이전트 수)를 표시
- 롤백 실행 후 자동으로 Eval을 재실행하여 현재 환경에서의 정합성 검증

### 7-5. 트렌드 시각화

**권장: 버전 축 트렌드 차트 (Allure Trend 패턴 변형)**

- X축을 빌드 대신 **스킬 버전**으로 설정
- Y축에 Overall Eval Score (0-100%)
- 각 데이터 포인트에 마우스 오버 시 해당 버전의 상세 메타 표시 (게시일, 변경 요약, 시나리오 수)
- "이 스킬은 꾸준히 개선되고 있는가?" 질문에 시각적으로 즉시 답할 수 있는 구조

### 7-6. 비개발자 친화 UI 원칙

1. **숫자보다 신호등**: 87.3%보다 초록 배지 + "양호"가 직관적
2. **비교보다 결론**: "v2.0이 v1.5보다 12% 개선" 같은 자연어 요약을 차트 위에 배치
3. **한 화면 원칙**: 핵심 판단(어떤 버전을 활성화할 것인가?)에 필요한 정보를 스크롤 없이 한 화면에 제공
4. **액션 근접 배치**: "활성화" / "롤백" / "비교" 버튼을 정보와 같은 시선 높이에 배치하여 판단→행동 거리를 최소화

---

## 참고 자료

- Terraform Registry: https://registry.terraform.io — 모듈 상세 페이지, 버전 드롭다운 패턴
- Docker Hub: https://hub.docker.com — Tags 탭, 취약점 인라인 배지 패턴
- Docker Scout Docs: https://docs.docker.com/scout — SBOM 분석, 이미지 비교 CLI
- GitHub Marketplace Docs: https://docs.github.com/en/actions — 검증 배지, 게시 프로토콜
- Allure Report: https://allurereport.org/docs — 트렌드 그래프, 타임라인 뷰, 히스토리 기능
- TestRail: https://support.testrail.com — 대시보드 차트, Status Tops 보고서
- Tessl Registry: https://tessl.io/registry — 스킬 평가 체계, 버전 고정 Eval, CI/CD 통합
- Tessl Eval Docs: https://docs.tessl.io/evaluate — Task Eval, Repo Eval, Skill Review 방법론
- Snyk × Tessl 파트너십: https://snyk.io/blog/snyk-tessl-partnership — 보안 스캔 통합 사례
