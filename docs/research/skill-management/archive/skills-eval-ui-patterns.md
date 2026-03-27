# 스킬 Eval 데이터 구조 & 품질 메타데이터 UI 패턴 조사

> 작성일: 2026-03-18  
> 목적: 스킬 관리 UI에 Eval 통과율·벤치마크 점수 등 품질 메타데이터를 추가하기 위한 기초 조사

---

## 1부: Anthropic skill-creator Eval 시스템 데이터 구조

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

## 2부: 외부 레지스트리/마켓플레이스의 품질 메타데이터 표시 패턴

### 2.1 VS Code Extension Marketplace

#### 카드/목록 아이템 요약

| 표시 요소 | 형태 | 설명 |
|-----------|------|------|
| 설치 수 | 숫자 + 아이콘 | 예: "2.3M installs" |
| 평균 평점 | 별 5개 + 숫자 | 예: ★★★★☆ (4.2) |
| 게시자 인증 배지 | 체크마크 아이콘 | 도메인 소유 확인된 게시자 |
| 가격 라벨 | 텍스트 배지 | "Free" / "Free Trial" |

#### 상세 페이지 펼침 정보

- **통계 사이드바**: 버전, 마지막 업데이트, 설치 수, 평점 분포 (1~5별 막대그래프)
- **호환성**: 지원하는 VS Code 최소 버전, 엔진 호환성
- **README 내 배지**: 개발자가 자발적으로 삽입하는 shields.io 배지 (빌드 상태, 커버리지 등)
- **리뷰 탭**: 최근 리뷰, 평점 트렌드 (최근 리뷰 기준 건강 상태 판별 가능)
- **변경 이력**: Changelog 탭

> **특징**: 마켓플레이스 자체는 테스트 커버리지나 빌드 상태를 강제하지 않는다. 품질 신호는 주로 "사회적 증거"(설치 수, 평점, 인증 배지)에 의존한다.

---

### 2.2 Terraform Registry

#### 카드/목록 아이템 요약

| 표시 요소 | 형태 | 설명 |
|-----------|------|------|
| 다운로드 수 | 숫자 | 모듈 사용량 |
| Partner 배지 | 라벨 | HashiCorp 공식 검증 모듈 |
| 최신 버전 | 텍스트 | 시맨틱 버전 |

#### 상세 페이지 펼침 정보

- **버전별 상태**: API 응답에 `version-statuses` 배열 포함 — 각 버전이 `"ok"`, `"pending"` 등의 상태를 가짐
- **입출력·의존성 문서**: Inputs, Outputs, Dependencies, Resources 자동 생성
- **HCP Terraform 통합 시**: 자동 테스트 실행 — 커밋마다 테스트하고 브랜치 기반 버전 발행 전 검증
- **"Bad" 버전 마킹**: 관리자가 특정 버전을 "bad"으로 표시하고 이유를 기록 가능
- **테스트 생성**: HCP Terraform은 private 모듈에 대해 자동으로 테스트 파일 생성 기능 제공

> **특징**: 공개 레지스트리에서는 테스트 상태를 직접 표시하지 않지만, HCP Terraform(private registry)에서는 버전별 테스트 통과/실패를 관리한다. 호환성 매트릭스는 Terraform/Provider 버전 조합으로 표현된다.

---

### 2.3 npm 패키지 상세 페이지

#### 카드/목록 아이템 요약 (npmjs.com 검색 결과)

| 표시 요소 | 형태 | 설명 |
|-----------|------|------|
| 주간 다운로드 | 숫자 | 예: "1,234,567 weekly downloads" |
| 최신 버전 | 텍스트 | 시맨틱 버전 |
| 마지막 게시 | 상대 시간 | 예: "published 3 days ago" |

#### 상세 페이지 펼침 정보

- **오른쪽 사이드바**: 주간 다운로드 수, 라이선스, 마지막 게시일, unpacked 크기, 파일 수, 총 파일 수, 의존성 수
- **README 내 배지** (개발자 자율): 빌드 상태(CI), 테스트 커버리지(Coveralls/Codecov), 번들 크기(Bundlephobia), 의존성 상태(David DM), npm 버전
- **외부 도구 연동**: Bundlephobia(번들 크기 분석), npmcharts(다운로드 트렌드 비교), Snyk(보안 취약점)
- **버전 탭**: 전체 버전 이력, 각 버전별 태그(latest, next 등)

> **특징**: npm 자체는 테스트 커버리지나 빌드 상태를 강제하지 않는다. ICSE 2018 연구(CMU STRUDEL)에 따르면 npm 패키지의 46%가 1개 이상의 배지를 사용하며, 가장 흔한 것은 CI 빌드 상태 배지(31.5%)이다. 배지 중 "assessment signal"(제3자 서비스가 실제로 분석한 결과)이 "conventional signal"(단순 선언)보다 신뢰도가 높다.

---

### 2.4 Tessl Registry (스킬 레지스트리)

#### 카드/목록 아이템 요약

| 표시 요소 | 형태 | 설명 |
|-----------|------|------|
| 품질 점수 | 종합 점수(%) | Validation + Implementation + Activation 점수 |
| 보안 점수 | Snyk 보안 등급 | 스킬 카드에 직접 표시됨 |
| Impact 등급 | 등급 표시 | 에이전트 성공에 대한 기여도 |

#### 상세 페이지 펼침 정보

Tessl은 스킬 품질을 세 가지 하위 점수로 분해한다:

- **Validation Score**: 필수 필드, 트리거 힌트, 워크플로 구조, 메타데이터 완성도
- **Implementation Score**: 코드 품질, 보안 관행, 에러 처리
- **Activation Score**: LLM-as-a-judge가 description을 평가 — 에이전트가 스킬을 얼마나 잘 발견·로드하는지

각 하위 점수에는 구체적인 항목별 피드백이 포함된다:

```
Content: 77%
  conciseness: 2/4
  actionability: 3/4
  workflow_clarity: 3/4
  progressive_disclosure: 2/4
```

#### Task Evals (2025년 신규)

Tessl은 최근 "Task Evals" 기능을 출시했다. 스킬을 분석해 시나리오를 자동 생성하고, 에이전트를 두 번 실행한다:

1. **Baseline** (스킬 없이): 에이전트가 기본 능력으로 수행
2. **With-skill** (스킬 적용): 스킬을 로드한 상태로 수행

결과에서 baseline 대비 with-skill 점수의 차이가 "스킬이 실제로 에이전트 행동을 얼마나 바꾸는지" 보여준다.

#### 보안 탭

Snyk 파트너십을 통해 모든 스킬에 보안 스캐닝이 적용된다:
- 프롬프트 인젝션, 악성 페이로드, 자격 증명 오용 등 검사
- 보안 점수가 카드와 상세 페이지 모두에 표시
- CLI 설치 시에도 보안 이슈 경고

> **특징**: Tessl은 이 조사 대상 중 "에이전트 스킬"이라는 개념에 가장 밀접한 레지스트리이다. 특히 "스킬이 있을 때 vs 없을 때" 비교 패턴은 Anthropic의 skill-creator benchmark 구조와 매우 유사하다.

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

### 3.3 레지스트리별 패턴 비교 요약

| 측면 | VS Code | Terraform | npm | Tessl | 우리 시스템 제안 |
|------|---------|-----------|-----|-------|-----------------|
| **품질 점수** | 없음 (평점 의존) | Partner 배지 | 없음 (배지 의존) | 3축 점수 | 통과율 + 개선폭 |
| **테스트 상태** | 없음 | HCP에서만 | README 배지 | Task Evals | benchmark delta |
| **보안** | 없음 | 없음 | Snyk 외부 | Snyk 통합 | 향후 연동 고려 |
| **버전 이력** | 변경 이력 탭 | version-statuses | 버전 탭 | 있음 | history.json 시각화 |
| **카드 요약** | 설치수+평점 | 다운로드+배지 | 주간다운로드 | 점수+보안 | 통과율+개선폭+시점 |

### 3.4 비개발자를 위한 표현 가이드라인

1. **백분율 사용**: 0.85 같은 소수 대신 "85%" 표시
2. **비교 프레임**: "스킬 없이 35% → 스킬 적용 시 85%" 같은 전후 비교
3. **자연어 상태**: "통과" / "주의 필요" / "개선 필요" 같은 라벨
4. **시각적 힌트**: 색상, 아이콘(체크마크/경고), 진행률 바 활용
5. **툴팁으로 깊이**: 카드에는 요약만, 마우스오버 시 "3개 중 2개 테스트 통과" 같은 상세 표시
6. **불확실성 표현**: stddev가 클 때는 "결과가 고르지 않음" 같은 경고 추가

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

*이 문서는 Anthropic skill-creator 시스템의 `references/schemas.md` 및 `SKILL.md`, 그리고 VS Code Marketplace, Terraform Registry, npm, Tessl Registry에 대한 웹 조사를 기반으로 작성되었습니다.*
