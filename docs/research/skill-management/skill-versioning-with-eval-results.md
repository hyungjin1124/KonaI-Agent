# 스킬 버전 관리 × Eval 품질 결과 통합 UI 패턴

> 통합 문서: skills-eval-ui-patterns.md + skill-versioning-eval-ui-patterns.md 병합
> 작성일: 2026-03-25
> 목적: 스킬 버전 관리 UI에서 평가(Eval) 데이터를 직관적으로 표시하는 통합 설계 가이드

---

## 1부: Anthropic Skill-Creator Eval 시스템 데이터 구조

### 1.1 전체 파일·디렉토리 구조

```
<skill-name>-workspace/
├── evals/
│   └── evals.json                    # 평가 케이스 정의
├── iteration-1/
│   ├── eval-<descriptive-name>/
│   │   ├── eval_metadata.json        # 개별 eval 프롬프트 + assertions
│   │   ├── with_skill/
│   │   │   ├── outputs/              # 스킬 적용 실행 결과물
│   │   │   │   └── metrics.json      # 실행 메트릭 (도구 호출 횟수 등)
│   │   │   ├── timing.json           # 실행 시간·토큰 사용량
│   │   │   └── grading.json          # 채점 결과 (통과율, 증거, 피드백)
│   │   └── without_skill/            # 베이스라인 (동일 구조)
│   │       ├── outputs/
│   │       │   └── metrics.json
│   │       ├── timing.json
│   │       └── grading.json
│   ├── benchmark.json                # 종합 벤치마크 (통계 요약)
│   ├── benchmark.md                  # 사람이 읽을 수 있는 벤치마크 요약
│   └── feedback.json                 # 리뷰어 피드백
├── iteration-2/
│   └── ...                           # 동일 구조, 이전 반복과 비교 가능
├── benchmarks/
│   └── <timestamp>/
│       └── benchmark.json            # Benchmark 모드 스냅샷
└── history.json                      # 버전 진행 이력 추적
```

---

### 1.2 Eval 실행 결과: `grading.json`

채점 에이전트(grader)가 생성하는 핵심 출력 파일이다. 다음 필드들을 포함한다:

#### expectations (기대 결과 채점)

| 필드 | 타입 | 설명 |
|------|------|------|
| `text` | string | 검증할 기대 조건 문장 |
| `passed` | boolean | 통과 여부 |
| `evidence` | string | 판단 근거 (트랜스크립트에서 추출) |

#### summary (집계 요약)

| 필드 | 타입 | 설명 |
|------|------|------|
| `passed` | int | 통과한 기대 조건 수 |
| `failed` | int | 실패한 기대 조건 수 |
| `total` | int | 전체 기대 조건 수 |
| `pass_rate` | float | 통과율 (0.0 ~ 1.0) |

#### execution_metrics (실행 메트릭)

| 필드 | 타입 | 설명 |
|------|------|------|
| `tool_calls` | object | 도구별 호출 횟수 (`Read`, `Write`, `Bash`, `Edit`, `Glob`, `Grep`) |
| `total_tool_calls` | int | 전체 도구 호출 횟수 |
| `total_steps` | int | 주요 실행 단계 수 |
| `errors_encountered` | int | 실행 중 발생한 오류 수 |
| `output_chars` | int | 출력 파일 총 문자 수 |
| `transcript_chars` | int | 트랜스크립트 문자 수 |

#### timing (실행 시간)

| 필드 | 타입 | 설명 |
|------|------|------|
| `executor_duration_seconds` | float | 실행기 소요 시간 |
| `grader_duration_seconds` | float | 채점기 소요 시간 |
| `total_duration_seconds` | float | 총 소요 시간 |

#### 기타 필드

- **claims**: 출력에서 추출·검증한 사실 주장 목록 (`claim`, `type`, `verified`, `evidence`)
- **user_notes_summary**: 불확실성, 검토 필요 항목, 우회 처리 내역
- **eval_feedback** (선택): 평가 자체에 대한 개선 제안

```json
// grading.json 예시 (간략)
{
  "summary": { "passed": 2, "failed": 1, "total": 3, "pass_rate": 0.67 },
  "timing": { "total_duration_seconds": 191.0 },
  "execution_metrics": { "total_tool_calls": 15, "errors_encountered": 0 }
}
```

---

### 1.3 Benchmark 스냅샷: `benchmark.json`

Benchmark 모드에서 동일 eval을 여러 번(기본 3회) 실행해 분산을 측정한 결과다.

#### metadata

| 필드 | 설명 |
|------|------|
| `skill_name` | 스킬 이름 |
| `executor_model` | 실행에 사용한 모델 (예: `claude-sonnet-4-20250514`) |
| `timestamp` | 벤치마크 실행 시점 (ISO 8601) |
| `evals_run` | 실행된 eval ID 목록 |
| `runs_per_configuration` | 설정당 반복 횟수 (보통 3) |

#### runs (개별 실행 결과)

각 실행은 다음 구조의 `result` 객체를 포함한다:

```json
{
  "eval_id": 1,
  "eval_name": "Ocean",
  "configuration": "with_skill",   // 또는 "without_skill"
  "run_number": 1,
  "result": {
    "pass_rate": 0.85,
    "passed": 6,
    "failed": 1,
    "total": 7,
    "time_seconds": 42.5,
    "tokens": 3800,
    "tool_calls": 18,
    "errors": 0
  }
}
```

#### run_summary (통계 집계)

`with_skill`과 `without_skill` 각각에 대해 `mean`, `stddev`, `min`, `max`를 계산한다:

```json
{
  "with_skill": {
    "pass_rate": { "mean": 0.85, "stddev": 0.05, "min": 0.80, "max": 0.90 },
    "time_seconds": { "mean": 45.0, "stddev": 12.0 },
    "tokens": { "mean": 3800, "stddev": 400 }
  },
  "without_skill": {
    "pass_rate": { "mean": 0.35, "stddev": 0.08 }
  },
  "delta": {
    "pass_rate": "+0.50",
    "time_seconds": "+13.0",
    "tokens": "+1700"
  }
}
```

> **핵심 인사이트**: `delta`가 스킬의 "부가 가치"를 한눈에 보여준다. UI에서 카드에 표시하기 적합한 값이다.

#### notes

분석기가 생성한 관찰 사항 (예: "특정 assertion이 양쪽 설정 모두 100% 통과 — 차별화 가치가 낮을 수 있음").

---

### 1.4 A/B 비교(Comparator) 결과: `comparison.json`

블라인드 비교에서 독립 에이전트가 생성하는 구조다.

#### 최상위 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `winner` | `"A"` 또는 `"B"` | 승자 |
| `reasoning` | string | 판정 이유 |

#### rubric (루브릭 점수)

A와 B 각각에 대해 두 축으로 평가한다:

- **content**: `correctness`(정확성), `completeness`(완성도), `accuracy`(정밀도) — 각 1~5점
- **structure**: `organization`(조직성), `formatting`(서식), `usability`(사용성) — 각 1~5점
- 축별 평균 (`content_score`, `structure_score`) 및 `overall_score` (두 축 합산)

#### output_quality

각 출력에 대한 요약 — `score` (1~10), `strengths` 배열, `weaknesses` 배열

#### expectation_results

각 출력의 assertion 통과율 — `passed`, `total`, `pass_rate`, `details[]`

#### 후속 분석: `analysis.json`

비교 결과를 기반으로 *왜* 승자가 이겼는지 분석한다:

- `winner_strengths` / `loser_weaknesses`: 구체적 원인
- `instruction_following`: 스킬 지시 준수도 점수(1~10)
- `improvement_suggestions`: 우선순위별 개선 제안 (`priority`, `category`, `suggestion`, `expected_impact`)
- `transcript_insights`: 실행 패턴 비교

---

### 1.5 버전 이력 추적: `history.json`

```json
{
  "started_at": "2026-01-15T10:30:00Z",
  "skill_name": "pdf",
  "current_best": "v2",
  "iterations": [
    { "version": "v0", "parent": null, "expectation_pass_rate": 0.65, "grading_result": "baseline" },
    { "version": "v1", "parent": "v0", "expectation_pass_rate": 0.75, "grading_result": "won" },
    { "version": "v2", "parent": "v1", "expectation_pass_rate": 0.85, "grading_result": "won", "is_current_best": true }
  ]
}
```

`grading_result` 가능한 값: `"baseline"`, `"won"`, `"lost"`, `"tie"`

---

### 1.6 Description 최적화 결과

`run_loop.py` 스크립트가 eval set을 train(60%)/test(40%)로 분할하고 최대 5회 반복하며 description을 개선한다. 최종 출력은:

- HTML 리포트: 반복별 트리거 정확도 시각화
- JSON: `best_description` (test 점수 기준 선택, overfitting 방지)

---

## 2부: 외부 레지스트리/마켓플레이스의 버전·품질 메타데이터 표시 패턴

### 2.1 Terraform Registry — 버전 드롭다운 + 호환성 매트릭스

#### 버전 목록 표시

Terraform Registry는 모듈 상세 페이지 우측 상단에 **드롭다운 셀렉터**를 배치하여 버전을 전환한다. 드롭다운에는 시맨틱 버전(예: `3.19.0`, `3.18.1`)이 최신순으로 나열되며, 선택 즉시 해당 버전의 README, Inputs/Outputs, Dependencies, Resources 탭 콘텐츠가 전체 교체된다.

버전 드롭다운 옆에는 **사용량 메트릭**(다운로드 수, 의존 모듈 수)이 인라인으로 표시되어, "이 버전이 얼마나 널리 쓰이는가"를 즉시 가늠할 수 있다. 페이지 하단의 "Provision Instructions" 코드 블록도 선택된 버전에 맞춰 자동 갱신된다.

#### 호환성 정보

Terraform Registry 자체는 전용 호환성 매트릭스 UI를 제공하지 않지만, 모듈 소스에서 파싱한 **Provider Requirements**(예: `aws >= 4.0`, `hashicorp/random ~> 3.1`)를 테이블로 렌더링한다. 이를 통해 사용자는 특정 버전이 어떤 프로바이더 버전을 요구하는지 한눈에 확인할 수 있다.

#### 우리 시스템에의 시사점

- **드롭다운 + URL 딥링크** 패턴은 버전 전환의 표준이며, 비개발자도 직관적으로 이해 가능
- Provider Requirements 테이블처럼, 스킬 버전별 **호환 에이전트/모델 매트릭스**를 표 형태로 보여줄 수 있음
- Registry 자체에 diff 뷰가 없어 사용자가 GitHub로 이동해야 하는 점은 **불편 사례**로 참고 — 우리는 인앱 diff를 제공하는 것이 차별점

---

### 2.2 Docker Hub — 태그 테이블 + 인라인 취약점 배지

#### 태그 목록 및 보안 스캔

Docker Hub는 이미지 상세 페이지에서 **Tags 탭**을 통해 전체 태그 목록을 테이블로 제공한다. 각 행에는 태그명, OS/Architecture, 압축 크기, 최종 push 시각이 표시되며, Docker Scout(구 Snyk) 통합을 활성화한 경우 **취약점 요약 배지**가 태그 행에 인라인으로 나타난다.

태그를 클릭하면 해당 Digest 페이지로 진입하며, 여기서 **Vulnerabilities 탭**을 선택하면 심각도별(Critical → Low) 정렬된 취약점 상세 목록이 렌더링된다. 각 항목에는 CVE 식별자, 영향받는 패키지명, 도입 버전, 수정 가능 버전(있을 경우)이 포함된다.

#### 인라인 배지 패턴

Docker Hub의 핵심 UX 패턴은 **태그 목록 테이블에 취약점 카운트를 컬러코딩으로 인라인 표시**하는 것이다. 예를 들어 `latest` 태그 행 옆에 `22 High / 8 Medium` 같은 배지가 붙어, 사용자가 개별 태그 페이지에 들어가지 않아도 어떤 태그가 보안적으로 안전한지 즉시 비교할 수 있다.

#### 우리 시스템에의 시사점

- **테이블 행 인라인 배지** 패턴이 가장 직관적 — 스킬 버전 목록의 각 행에 Eval 통과율을 컬러코딩 배지로 표시
- 심각도 기반 색상 체계(Critical=Red, High=Orange, Medium=Yellow)처럼, Eval 점수에도 **색상 스케일**(90+%=Green, 70-89%=Yellow, <70%=Red) 적용 가능
- SBOM → 트리 구조 분석처럼, Eval 실패 시 **어떤 시나리오에서 실패했는가**를 드릴다운으로 보여주는 구조가 유용

---

### 2.3 GitHub Actions Marketplace — 검증 배지 + 사용량 신호

#### 버전 선택 및 배지

GitHub Actions Marketplace의 액션 상세 페이지에는 **버전 선택 드롭다운**과 함께, 퍼블리셔의 검증 상태를 나타내는 **배지 체계**가 적용된다. "Verified creator" 배지는 퍼블리셔 조직의 도메인과 이메일이 인증되었고 2FA가 활성화되었음을 의미한다. 별도로 "App meets the requirements for listing" 배지도 존재한다.

GitHub는 서드파티 코드를 분석하거나 검증하지 않으며, 배지는 순수하게 퍼블리셔의 신원 인증 상태만을 반영한다.

#### 워크플로우 통합 UX

가장 눈에 띄는 UX는 **"Use latest version" 버튼**이다. 이를 클릭하면 워크플로우 YAML 스니펫이 클립보드에 복사되며, 버전 드롭다운에서 특정 버전을 선택하면 스니펫의 `@v2.1.0` 부분이 자동 갱신된다.

사용 통계는 "used by X repositories" 형태로 표시되어 해당 액션의 대중성을 가늠하게 한다.

#### 우리 시스템에의 시사점

- **"사용 코드 자동 생성 + 클립보드 복사"** 패턴은 스킬 설치 UX에 직접 적용 가능 (예: `tessl install skill@v2.0` 명령 복사 버튼)
- 퍼블리셔 인증 배지와 품질 배지를 **이중 배지 시스템**으로 분리하여, "누가 만들었나"와 "얼마나 좋은가"를 독립적으로 전달
- "used by X" 사용 통계는 **스킬 채택률 지표**로 활용 가능

---

### 2.4 TestRail & Allure Report — 대시보드 패턴

#### TestRail의 차트

TestRail은 테스트 실행 결과를 **실시간 대시보드**로 제공한다. 가장 먼저 보이는 것은 **상태 요약 차트**(파이 차트 또는 도넛 차트)로, Passed/Failed/Blocked/Untested/Retest 비율이 색상으로 구분된다. 이 차트는 테스트 케이스가 추가되거나 결과가 업데이트될 때마다 실시간으로 갱신된다.

차트 아래에는 **진행률 바**(Progress bar)가 위치하며, 전체 대비 완료된 테스트의 비율을 시각적으로 보여준다.

#### Allure Report의 시각화

Allure Report는 테스트 결과 시각화에서 가장 풍부한 UI를 제공한다:

- **Overview 페이지**: 중앙에 **도넛형 파이 차트**가 위치하며, 전체 테스트의 Passed/Failed/Broken/Skipped 비율을 보여준다.
- **Trend 그래프**: 여러 빌드에 걸친 테스트 결과의 변화를 시계열 꺾은선 그래프로 보여준다.
- **Severity 그래프**: 테스트를 심각도와 상태를 교차하여 막대 그래프로 보여준다.
- **Timeline 뷰**: 테스트 실행의 시간적 순서를 수평 간트 차트 형태로 시각화한다.
- **History 추적**: 동일 테스트의 실행 히스토리를 빌드 간에 연결하여 추적할 수 있다.

#### 우리 시스템에의 시사점

- **도넛 파이 차트 + 중앙 통과율 숫자** 패턴은 스킬 버전의 Eval 결과 요약에 직접 적용 가능
- **Trend 그래프**를 버전 축으로 변환하면, "v1.0 → v1.5 → v2.0으로 갈수록 Eval 점수가 어떻게 변했는가"를 직관적으로 보여줌
- Allure의 Severity × Status 교차 그래프처럼, **Eval 시나리오 카테고리별 통과/실패 비율**을 히트맵 또는 교차 차트로 표현 가능
- Timeline 뷰의 **슬라이더 기반 필터링**은 복잡한 Eval 결과를 탐색하는 데 유용한 인터랙션 패턴

---

### 2.5 Tessl Registry — AI 스킬 전용 평가 시스템

#### 개요 및 포지셔닝

Tessl은 스스로를 "에이전트 스킬의 패키지 매니저"로 포지셔닝하며, npm이나 pip이 코드 의존성을 관리하듯이 에이전트 스킬을 버전 관리·평가·배포하는 플랫폼이다. Tessl Registry는 수천 개의 평가된 스킬을 인덱싱하며, 각 스킬에 품질 점수, 영향도 평가, 버전 히스토리, 저자 정보를 제공한다.

#### 버전 고정 평가 결과

Tessl의 핵심 차별화 요소는 **Eval 결과가 특정 게시 버전에 고정(pinned)**된다는 점이다. 예를 들어 v1.2.0의 Eval 결과와 v1.1.0의 결과가 독립적으로 존재하여, 특정 수정이 성능을 개선했는지 혹은 회귀를 일으켰는지를 정확히 판단할 수 있다.

스킬 상세 페이지에는 다음 탭들이 존재한다:
- **Overview**: 스킬 설명, 설치 명령, 호환 에이전트 정보
- **Review**: 스킬 품질 리뷰 결과(Validation, Implementation Quality, Activation Quality, Overall Score)
- **Evals**: Task Eval 실행 결과(Baseline vs With-Skill 비교)
- **Security**: Snyk 통합 보안 스캔 결과

#### 평가 체계 — 3단계 방법론

**Skill Review (정적 분석)**: SKILL.md 파일의 프론트매터 유효성, 구현 품질, 활성화 품질을 LLM 기반으로 점수화한다.

**Task Eval (동적 평가)**: Tessl이 스킬을 분석하여 시나리오와 채점 기준을 자동 생성한 뒤, 에이전트를 두 번 실행한다 — 스킬 없이(Baseline)와 스킬 적용 후(With-Skill). 결과에는 항목별 점수, 채점 근거, 총점, Baseline vs With-Skill 비교가 포함된다.

**Repo Eval (실환경 평가, 베타)**: 실제 리포지토리의 변경 이력을 기반으로 현실적인 변경 요청에 대해 에이전트가 수행하는 성과를 평가한다.

#### CI/CD 통합

`tessl skill publish` 명령 실행 시, 이전 Eval이 없거나 스킬 내용이 변경된 경우 **자동으로 새 평가가 트리거**된다. 이는 버전별 Eval 결과를 자동으로 축적하는 강력한 UX이다.

#### 카드 표시 및 공개 사례

스킬 카드(목록 뷰)에는 **Overall Score 배지**가 표시되어, 상세 페이지에 들어가지 않아도 품질을 가늠할 수 있다. 2026년 3월 기준으로 Snyk 보안 점수도 카드에 인라인으로 표시되어, 품질·영향·보안 점수가 세 겹의 시그널로 동시에 노출된다.

실제 공개 사례:
- Cisco CodeGuard 보안 스킬: Overall 84%, 1.78× improvement
- ElevenLabs TTS 스킬: Overall 93%, Review 94%, 1.32× improvement
- Hugging Face tool-builder 스킬: Overall 81%, 1.63× improvement

#### 우리 시스템에의 시사점

- **Baseline vs With-Skill 비교 패턴**은 우리의 "v2.0이 v1.5보다 나은가?" 질문에 직접 답하는 구조
- 발행 시 자동 Eval 트리거는 **CI/CD 연동의 모범 사례**
- 카드 뷰의 **다중 배지 시스템**(품질 + 영향 + 보안)은 스킬 목록의 정보 밀도를 높이는 좋은 패턴
- "× improvement" 지표는 비개발자에게 **"이 버전이 얼마나 더 나은가"를 한 수치로 전달**하는 강력한 UX

---

## 3부: 우리 스킬 관리 UI에 대한 시사점

### 3.1 카드 요약에 표시할 핵심 메타데이터

비개발자 친화적 표현을 우선한다.

| 데이터 | 원본 필드 | 카드 표시 제안 | 비개발자 표현 |
|--------|-----------|---------------|--------------|
| Eval 통과율 | `grading.json → summary.pass_rate` | 원형 진행률 배지 (85%) | "테스트 통과율" |
| 스킬 효과 | `benchmark.json → delta.pass_rate` | 상승 화살표 + 수치 (+50%p) | "스킬 적용 시 개선 폭" |
| 마지막 벤치마크 | `benchmark.json → metadata.timestamp` | 상대 시간 ("3일 전") | "마지막 검증 시점" |
| 현재 최적 버전 | `history.json → current_best` | 버전 배지 (v2) | "최신 검증 버전" |
| 보안 상태 | 외부 스캐닝 결과 | 방패 아이콘 + 색상 | "안전성 확인" |

#### 색상 코딩 권장

| 범위 | 색상 | 의미 |
|------|------|------|
| 90~100% | 초록 | 매우 좋음 |
| 70~89% | 파랑/노랑 | 양호 |
| 50~69% | 주황 | 주의 필요 |
| 0~49% | 빨강 | 개선 필요 |

---

### 3.2 상세 페이지에서 펼쳐 보여줄 정보

각 레지스트리의 패턴을 종합하면 상세 페이지는 탭 구조가 효과적이다:

#### 탭 1: 개요 (Overview)
- 스킬 설명, 트리거 조건, on/off 토글
- 핵심 지표 카드 3개: 통과율, 개선 폭, 마지막 검증일

#### 탭 2: 벤치마크 (Benchmark)
- with_skill vs without_skill 비교 차트
- pass_rate, time_seconds, tokens의 mean ± stddev 표
- 분석기 관찰 노트 (notes)
- 반복(iteration) 간 통과율 추이 그래프 (history.json 기반)

#### 탭 3: 상세 결과 (Results)
- eval별 기대 조건 통과/실패 목록 (접을 수 있는 아코디언)
- 실패 케이스의 evidence 표시
- 실행 메트릭: 도구 호출 횟수, 오류 수, 소요 시간

#### 탭 4: 비교 이력 (Comparison) — 해당 시
- A/B 비교 결과의 rubric 점수 레이더 차트
- 승자/패자의 strengths/weaknesses
- improvement_suggestions 목록

---

### 3.3 레지스트리별 패턴 비교 요약

| 측면 | VS Code | Terraform | npm | Tessl | 우리 시스템 제안 |
|------|---------|-----------|-----|-------|-----------------|
| **품질 점수** | 없음 (평점 의존) | Partner 배지 | 없음 (배지 의존) | 3축 점수 | 통과율 + 개선폭 |
| **테스트 상태** | 없음 | HCP에서만 | README 배지 | Task Evals | benchmark delta |
| **보안** | 없음 | 없음 | Snyk 외부 | Snyk 통합 | 향후 연동 고려 |
| **버전 이력** | 변경 이력 탭 | version-statuses | 버전 탭 | 있음 | history.json 시각화 |
| **카드 요약** | 설치수+평점 | 다운로드+배지 | 주간다운로드 | 점수+보안 | 통과율+개선폭+시점 |

---

### 3.4 비개발자를 위한 표현 가이드라인

1. **백분율 사용**: 0.85 같은 소수 대신 "85%" 표시
2. **비교 프레임**: "스킬 없이 35% → 스킬 적용 시 85%" 같은 전후 비교
3. **자연어 상태**: "통과" / "주의 필요" / "개선 필요" 같은 라벨
4. **시각적 힌트**: 색상, 아이콘(체크마크/경고), 진행률 바 활용
5. **툴팁으로 깊이**: 카드에는 요약만, 마우스오버 시 "3개 중 2개 테스트 통과" 같은 상세 표시
6. **불확실성 표현**: stddev가 클 때는 "결과가 고르지 않음" 같은 경고 추가

---

## 4부: 종합 - Eval 데이터와 버전 UI 통합

### 4.1 버전 목록 UI (통합 설계)

**권장: 드롭다운 + 테이블 하이브리드**

- 페이지 상단에 **현재 활성 버전 드롭다운**을 배치하여 빠른 전환 지원 (Terraform Registry 패턴)
- 하단에는 **전체 버전 히스토리 테이블**을 제공하여 한눈에 조망 (Docker Hub 패턴)
- 테이블의 각 행에 Eval 통과율 배지를 **인라인으로 표시** (Docker Hub 취약점 배지 패턴)
- 현재 활성(배포) 버전에는 "Active" 레이블을 강조 표시

#### 테이블 컬럼 구성

| 컬럼 | 소스 데이터 | UI 표현 | 비고 |
|------|-----------|--------|------|
| 버전 | `history.json → version` | 텍스트 (v1.0, v1.5, v2.0) | 정렬 불가(발행순) |
| Eval 통과율 | `grading.json → summary.pass_rate` | 진행률 바 + % (Green/Yellow/Red) | 색상 코딩 적용 |
| 개선폭 | `benchmark.json → delta.pass_rate` | 화살표 + %p (Green=개선, Red=퇴행) | 비개발자 친화 |
| 마지막 검증 | `benchmark.json → metadata.timestamp` | 상대 시간 ("3일 전") | 호버 시 절대 시간 |
| 상태 | `history.json → grading_result` | 라벨 (baseline/won/lost/tie) | 배경색 구분 |
| 액션 | — | 버튼 (상세보기, 롤백, 비교) | 우측 정렬 |

### 4.2 Eval 결과 매핑: JSON → UI 요소

#### Level 1: 카드/목록 뷰 (최소 정보)

```
[스킬명] skill-v2.0
┌─────────────────────────┐
│ ████████░░ 85% 통과     │ ← pass_rate from grading.json
│ ↑ +50%p 개선 (v1.5 대비)│ ← delta from benchmark.json
│ 검증: 3일 전            │ ← timestamp from benchmark.json
│ [상세보기] [비교]       │ ← Action buttons
└─────────────────────────┘
```

#### Level 2: 버전 히스토리 테이블 (중간 정보)

```
| 버전  | 통과율        | 개선폭      | 검증 시점  | 상태    | 액션         |
|-------|---------------|-------------|----------|---------|-------------|
| v2.0  | ████████░░ 85% (Green) | ↑ +15%p | 3일 전   | Active  | [상세] [비교] [롤백] |
| v1.5  | ███████░░░ 75% (Yellow) | ↑ +10%p | 2주 전   | Stable  | [상세] [비교] |
| v1.0  | ██████░░░░ 65% (Yellow) | ↑ +30%p | 1개월 전 | Outdated| [상세] [비교] |
```

#### Level 3: 버전 상세 페이지 (전체 정보)

**탭 1: Overview**
```
┌─────────────────────────────────────────────────┐
│ 스킬: pdf-processor v2.0 (Active)               │
│                                                   │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│ │ 통과율      │ │ 개선폭      │ │ 검증        ││
│ │ 85%         │ │ +50%p       │ │ 3일 전      ││
│ │ (1개↑)      │ │ (v1.5 대비) │ │             ││
│ └─────────────┘ └─────────────┘ └─────────────┘│
│                                                   │
│ [버전 비교] [롤백] [다시 테스트]                │
└─────────────────────────────────────────────────┘
```

**탭 2: Benchmark**
```
Baseline (스킬 없음) vs With-Skill 비교
┌─────────────────────────────────────┐
│ 통과율                              │
│ Baseline: ▓░░░░░░░░░  35% (1 pass)  │
│ With-Skill: ▓▓▓▓▓▓▓▓░░  85% (6 pass)│
│ 개선: ↑ 50%p                        │
└─────────────────────────────────────┘

시간 소요:
Baseline: 45초 ± 12초
With-Skill: 58초 ± 8초
추가 시간: +13초 (29%)

토큰 사용:
Baseline: 2100 ± 200
With-Skill: 3800 ± 300
추가 토큰: +1700 (81%)

분석: With-Skill이 정확도를 크게 개선하지만 시간과 비용이 증가.
```

**탭 3: Results (상세)**
```
Eval 결과 (3개 시나리오):
┌─ Ocean (✓ 통과)
│  기대: 이미지 크기 변환 성공
│  채점: "최종 이미지가 올바른 치수 (800×600)를 가짐" ✓
│  증거: "...converted to 800x600..."
├─ PDF Merge (✓ 통과)
│  기대: 두 PDF 병합
│  ...
└─ Image Extraction (✗ 실패)
   기대: PDF 이미지 추출
   채점: "예상된 이미지 3개 중 2개만 추출됨" ✗
   증거: "Extracted 2 images from page 1"
   피드백: "특정 이미지 형식(TIFF)을 놓쳤을 수 있음"
```

#### Level 4: 버전 간 비교 (Side-by-Side)

```
                      v1.5 (71%)     →  v2.0 (85%)    변화
┌──────────────────────────────────────────────────────────┐
│ 통과율        ███████░░░ 71%   →   ████████░░ 85%   +14%│
│ 개선폭        ↑ +35%p           →   ↑ +50%p          +15%│
│ 시간 소요     52초 ± 10초       →   58초 ± 8초       +6초 │
│ 시나리오 1    ✓ 통과            →   ✓ 통과           — |
│ 시나리오 2    ✓ 통과            →   ✓ 통과           — |
│ 시나리오 3    ✗ 실패            →   ✓ 통과           ↑ |
│ 시나리오 4    ? 미실행          →   ✓ 통과           ✓ |
│ 요약          기본적이나 1개     →   확장된 기능+     |
│              시나리오 미지원     4개 시나리오 지원    |
└──────────────────────────────────────────────────────────┘

[v1.5로 롤백] [다운로드 비교 로그]
```

### 4.3 데이터 흐름: Eval JSON → UI 매핑 정리

```
grading.json
├─ summary.pass_rate (0.85)
│  └─→ 카드: "85% 통과율" (원형 진행률)
│  └─→ 테이블: 진행률 바 + 색상 (Green)
│  └─→ 상세: 도넛 파이 차트 + 중앙에 85% 숫자
│
├─ summary.{passed, failed, total} (6, 1, 7)
│  └─→ 상세 탭: 파이 차트 세그먼트
│  └─→ Results 아코디언: "6 통과 / 1 실패"
│
├─ expectations[]
│  └─→ Results 아코디언 항목별 전개
│
├─ execution_metrics
│  └─→ Results 탭: 메트릭 요약 테이블
│
└─ timing.total_duration_seconds
   └─→ Benchmark 탭: 소요 시간 비교

benchmark.json
├─ run_summary.delta.pass_rate (+0.50)
│  └─→ 카드: "↑ +50%p" (화살표 배지)
│  └─→ 테이블: +50%p Green 배지
│  └─→ Benchmark 탭: 막대 차트 (Baseline vs With-Skill)
│
├─ metadata.timestamp (ISO 8601)
│  └─→ 카드: "3일 전" (상대 시간)
│  └─→ 테이블: 상대 시간, 호버 시 절대 시간
│
├─ notes
│  └─→ Benchmark 탭: "분석" 섹션에 자연어 해석
│
└─ run_summary.{with_skill, without_skill}
   └─→ Benchmark 탭: 상세 통계 표 (mean ± stddev)

history.json
├─ current_best (v2)
│  └─→ 버전 드롭다운: 현재 선택된 버전
│  └─→ 테이블: "Active" 배지
│
├─ iterations[]
│  └─→ 버전 히스토리 테이블 렌더링
│  └─→ Trend 그래프 (X축: 버전, Y축: pass_rate)
│
└─ iterations[].grading_result
   └─→ 테이블: 상태 라벨 (baseline/won/lost/tie)
   └─→ 버전 비교 뷰: 개선 여부 표시
```

### 4.4 인터랙션 흐름

#### 사용 사례 1: "v2.0이 정말 v1.5보다 나은가?"

1. **카드 레벨** → 사용자가 스킬 카드에서 "↑ +50%p" 배지를 본다.
2. **테이블 레벨** → 버전 히스토리 테이블에서 v2.0 행의 "↑ +50%p" Green 배지와 v1.5 행의 "↑ +35%p" Yellow 배지를 비교한다.
3. **비교 뷰** → [비교] 버튼을 클릭하면 Side-by-Side 비교 페이지로 이동, 원라인 요약 "v1.5 → v2.0: Overall +14%" 확인 후 상세 메트릭을 드릴다운.

#### 사용 사례 2: "v2.0이 v1.5보다 느려질 가능성이 있나?"

1. **상세 페이지 → Benchmark 탭**에서 "시간 소요" 섹션 확인.
2. Baseline: 45초 vs With-Skill: 58초 (from run_summary)
3. v1.5 시 58초 vs v2.0 시 62초 (from history 트렌드)
4. Allure Trend 패턴 적용: X축 버전, Y축 시간 = 버전이 올라가면서 시간이 증가 추이를 시각화.
5. 도구 호출 횟수 증가 (from execution_metrics)를 원인으로 자동 표시.

#### 사용 사례 3: "왜 v1.0은 안 되는가?"

1. **테이블**에서 v1.0 행의 "실패" 또는 낮은 통과율을 본다.
2. [상세] 버튼 → v1.0의 상세 페이지 열기.
3. **Results 탭**에서 "Image Extraction (✗ 실패)" 아코디언을 펼침.
4. 피드백 텍스트: "특정 이미지 형식(TIFF)을 놓쳤을 수 있음"를 확인.
5. 인사이트: 이 문제가 v1.5, v2.0에서 해결됐음을 암시.

#### 사용 사례 4: "긴급 롤백이 필요하다"

1. **테이블**에서 v1.5 행의 [롤백] 버튼 클릭.
2. 확인 다이얼로그: "이 스킬을 사용 중인 에이전트 3개가 영향을 받습니다."
3. [확인] → 즉시 배포 설정 변경, v2.0 → v1.5로 전환.
4. 자동으로 현재 환경에서 v1.5 재 테스트 트리거 (선택적).

---

## 부록: 주요 JSON 스키마 요약 참조

### evals.json (평가 케이스 정의)

```json
{
  "skill_name": "string",
  "evals": [{
    "id": "int",
    "prompt": "string",
    "expected_output": "string",
    "files": ["string"],
    "expectations": ["string"]
  }]
}
```

### timing.json (실행 시간)

```json
{
  "total_tokens": 84852,
  "duration_ms": 23332,
  "total_duration_seconds": 23.3,
  "executor_start": "ISO timestamp",
  "executor_end": "ISO timestamp",
  "executor_duration_seconds": 165.0,
  "grader_start": "ISO timestamp",
  "grader_end": "ISO timestamp",
  "grader_duration_seconds": 26.0
}
```

### metrics.json (실행기 메트릭)

```json
{
  "tool_calls": { "Read": 5, "Write": 2, "Bash": 8, "Edit": 1, "Glob": 2, "Grep": 0 },
  "total_tool_calls": 18,
  "total_steps": 6,
  "files_created": ["filled_form.pdf"],
  "errors_encountered": 0,
  "output_chars": 12450,
  "transcript_chars": 3200
}
```

### feedback.json (리뷰어 피드백)

```json
{
  "reviews": [
    { "run_id": "eval-0-with_skill", "feedback": "차트에 축 라벨 없음", "timestamp": "..." }
  ],
  "status": "complete"
}
```

---

## 참고 자료 및 출처

### Anthropic 공식 자료
- Anthropic skill-creator: https://github.com/anthropic-ai/skill-creator
- Skill Eval System Documentation: References from skill-creator/references/schemas.md

### 외부 레지스트리 및 마켓플레이스
- **Terraform Registry**: https://registry.terraform.io — 모듈 상세 페이지, 버전 드롭다운 패턴
- **Docker Hub**: https://hub.docker.com — Tags 탭, 취약점 인라인 배지 패턴
- **Docker Scout Docs**: https://docs.docker.com/scout — SBOM 분석, 이미지 비교 CLI
- **GitHub Marketplace Docs**: https://docs.github.com/en/actions — 검증 배지, 게시 프로토콜
- **Allure Report**: https://allurereport.org/docs — 트렌드 그래프, 타임라인 뷰, 히스토리 기능
- **TestRail**: https://support.testrail.com — 대시보드 차트, Status Tops 보고서
- **Tessl Registry**: https://tessl.io/registry — 스킬 평가 체계, 버전 고정 Eval, CI/CD 통합
- **Tessl Eval Docs**: https://docs.tessl.io/evaluate — Task Eval, Repo Eval, Skill Review 방법론
- **Snyk × Tessl 파트너십**: https://snyk.io/blog/snyk-tessl-partnership — 보안 스캔 통합 사례
- **VS Code Extension Marketplace**: https://marketplace.visualstudio.com — 사회적 증거 기반 품질 신호
- **npm Registry**: https://www.npmjs.com — 배지 활용 및 외부 도구 연동 패턴

---

*이 통합 문서는 Anthropic skill-creator Eval 시스템과 6개 외부 레지스트리(Terraform, Docker, GitHub, Allure, TestRail, Tessl)의 벤치마킹 연구를 통합한 설계 가이드입니다.*
