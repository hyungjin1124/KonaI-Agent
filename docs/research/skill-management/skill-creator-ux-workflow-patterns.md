# Skill Creator UX Workflow Patterns
## Research Document: Anthropic Skill-Creator for KonaI-Agent Integration

**Date**: March 2026
**Source**: Analysis of `/sessions/.skills/skills/skill-creator/SKILL.md` and supporting agents/scripts
**Scope**: UX patterns for skill creation workflows, evaluation interactions, and KonaI-Agent service integration

---

## 1. 대화형 스킬 생성 워크플로우 분석

### 1.1 Intent Capture → Review 루프

skill-creator의 핵심 워크플로우는 5단계 반복 루프로 설계되어 있다:

1. **Intent Capture**: 사용자가 원하는 스킬의 목표를 구두로 설명 (기존 대화 이력에서 추출 가능)
2. **Interview & Research**: 엣지 케이스, 입출력 형식, 성공 기준 상세화
3. **Write SKILL.md**: 프론트매터 + 본문 작성
4. **Run Test Cases**: 2-3개의 realistic 프롬프트로 with_skill + baseline 병렬 실행
5. **Evaluate & Iterate**: 정성/정량 평가 후 피드백 기반 개선

**워크플로우 특징**:
- 비선형 설계: 사용자가 "don't need to run evaluations, just vibe with me"면 스킵 가능
- 협업형: 각 단계에서 사용자 확인 (interview → test cases → benchmark 리뷰)
- 에이전트 자동성: subagent를 활용한 병렬 기준선 실행 및 grading

### 1.2 Intent Capture의 4가지 핵심 질문 (SKILL.md §Capture Intent)

```
1. What should this skill enable Claude to do?
   → 스킬의 기능적 목표 정의

2. When should this skill trigger? (what user phrases/contexts)
   → triggering 조건 (설명에 포함되어야 함)

3. What's the expected output format?
   → 스킬 결과물의 구조/형식 명시

4. Should we set up test cases to verify the skill works?
   → 기술 스킬(파일 변환, 데이터 추출, 고정 워크플로우) → Yes
   → 주관적 스킬(라이팅 스타일, 아트) → No (사용자 선택)
```

**conversation history에서 intent 추출**:
- 도구 사용 패턴 추적
- 사용자의 수정 사항 (corrections) 기록
- 입출력 형식 실제 관찰
- 사용자에게 격차(gaps) 확인 후 진행

### 1.3 Interview & Research Phase의 Edge Case Handling

SKILL.md는 다음을 proactively 질의하도록 명시:

```
- Edge cases: 어떤 비정상 입력이 들어올 수 있는가?
- Input/output formats: 정확한 파일 형식, 구조
- Example files: 실제 예제 파일로 테스트
- Success criteria: 객관적 검증 가능한 기준
- Dependencies: 외부 MCP, 라이브러리
```

이 단계에서 MCPs를 병렬 검색 (available MCPs 확인):
- 문서 검색, 유사 스킬 찾기, 모범 사례 조사
- subagent 활용 가능 시 병렬화 (오버헤드 감소)
- 사용자 부담 최소화 위해 사전 컨텍스트 수집

### 1.4 Test Case Design 패턴

**evals.json 스키마** (§Test Cases / references/schemas.md):

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "User's realistic task prompt",
      "expected_output": "Description of expected result",
      "files": ["evals/files/sample.pdf"],
      "expectations": [
        "The output includes X",
        "The skill used script Y"
      ]
    }
  ]
}
```

**Test case 작성 원칙**:
- 2-3개의 realistic prompt (실제 사용자가 말할 법한 내용)
- 사용자 확인: "Do these look right, or do you want to add more?"
- assertions는 run 중에 작성 (병렬화) — 운영 최적화

---

## 2. Eval Viewer 인터랙션 패턴

### 2.1 HTML 기반 평가 시스템 (generate_review.py)

**아키텍처**:
- Python 스크립트: generate_review.py (stdlib만 사용, 의존성 0)
- 입력: workspace 디렉토리 (runs 찾기)
- 출력: 자체 포함된 HTML 페이지 + HTTP 서버 또는 static 파일
- 메커니즘: 모든 output을 base64로 embed → 단일 HTML 파일로 제공

**실행**:
```bash
python generate_review.py <workspace>/iteration-N \
  --skill-name "my-skill" \
  --benchmark <workspace>/iteration-N/benchmark.json \
  --previous-workspace <workspace>/iteration-N-1>  # iteration 2+ 이상
```

**Headless 환경용 static 모드**:
```bash
python generate_review.py <workspace>/iteration-N \
  --static /path/to/output.html
```
→ Cowork/헤드리스 환경에서 feedback.json을 파일 다운로드로 처리

### 2.2 Outputs Tab: 단일 평가 사례 보기

**구성 요소**:

1. **Prompt 표시**:
   - eval_metadata.json의 `prompt` 필드에서 추출
   - 또는 transcript.md에서 regex 추출: `## Eval Prompt\n\n(...)`

2. **Output 렌더링** (파일 타입별):
   ```
   - Text (.txt, .md, .json, .csv, .py): 인라인 표시
   - Image (.png, .jpg, .svg, .webp): <img> 태그 (base64 data URI)
   - PDF: <iframe> 또는 base64 링크
   - Excel (.xlsx): base64 buffer (openpyxl 등으로 클라이언트에서 처리)
   - Binary/unknown: base64 다운로드 링크
   ```

   **파일 탐색 로직** (build_run):
   - run_dir/outputs/ 내 모든 파일 이터레이션
   - METADATA_FILES 제외 (transcript.md, user_notes.md, metrics.json)
   - 각 파일을 embed_file() 호출하여 dict 변환

3. **Previous Output (iteration 2+)**:
   - collapsed section으로 표시
   - --previous-workspace 경로에서 자동 로드
   - 이전 반복과의 비교 용이

4. **Formal Grades** (grading.json 존재 시):
   - collapsed section
   - 각 assertion의 pass/fail + evidence
   - summary: {passed, failed, total, pass_rate}
   - grading.json 필드명 정확성 중요:
     ```json
     {
       "expectations": [
         {"text": "...", "passed": true, "evidence": "..."}
       ],
       "summary": {"passed": N, "failed": M, "total": K}
     }
     ```

5. **Feedback 텍스트박스**:
   - 각 평가마다 textarea
   - auto-save (변경 감지 + 자동 저장)
   - Previous Feedback (iteration 2+): textbox 아래 표시

### 2.3 Benchmark Tab: 정량 비교

**표시 내용**:
- **Pass rates**: with_skill vs without_skill (mean ± stddev, min/max)
- **Timing**: 평균 실행 시간 (초)
- **Token usage**: 평균 토큰 수
- **Per-eval breakdowns**: 각 평가별 run 결과
- **Analyst observations**: analyzer 생성 notes (패턴, 이상치, 트레이드오프)

**benchmark.json 스키마** (references/schemas.md):

```json
{
  "metadata": {
    "skill_name": "pdf",
    "executor_model": "claude-sonnet-4-20250514",
    "timestamp": "2026-01-15T10:30:00Z",
    "evals_run": [1, 2, 3],
    "runs_per_configuration": 3
  },
  "runs": [
    {
      "eval_id": 1,
      "eval_name": "descriptive-name",
      "configuration": "with_skill",  // 정확히 이 문자열
      "run_number": 1,
      "result": {
        "pass_rate": 0.85,
        "passed": 6,
        "total": 7,
        "time_seconds": 42.5,
        "tokens": 3800,
        "tool_calls": 18,
        "errors": 0
      },
      "expectations": [
        {"text": "...", "passed": true, "evidence": "..."}
      ]
    }
  ],
  "run_summary": {
    "with_skill": {
      "pass_rate": {"mean": 0.85, "stddev": 0.05},
      "time_seconds": {"mean": 45.0, "stddev": 12.0},
      "tokens": {"mean": 3800, "stddev": 400}
    },
    "without_skill": { /* ... */ },
    "delta": {
      "pass_rate": "+0.50",
      "time_seconds": "+13.0",
      "tokens": "+1700"
    }
  },
  "notes": [
    "Assertion 'Output is PDF' passes 100% in both - non-discriminating",
    "Eval 3 shows high variance (50% ± 40%) - may be flaky"
  ]
}
```

**필드명 정확성**:
- "configuration" (not "config")
- "result" 내 nested structure (top-level이 아님)
- "with_skill", "without_skill" 정확한 문자열
- viewer가 이 정확한 구조를 기대함

### 2.4 Navigation & Interaction

**Navigation patterns**:
- Prev/Next 버튼 (평가 사례 간 이동)
- Arrow keys (좌/우 방향키)
- Benchmark 탭 (정량 통계로 전환)

**Submit All Reviews**:
- 버튼 클릭 → feedback.json 생성/다운로드
- 구조:
  ```json
  {
    "reviews": [
      {
        "run_id": "eval-0-with_skill",
        "feedback": "the chart is missing axis labels",
        "timestamp": "2026-01-15T10:35:22Z"
      },
      {
        "run_id": "eval-1-with_skill",
        "feedback": "",
        "timestamp": "..."
      }
    ],
    "status": "complete"
  }
  ```
- 빈 feedback = 사용자가 만족함

**Viewer 종료**:
```bash
kill $VIEWER_PID 2>/dev/null
```

---

## 3. 테스트-피드백-개선 반복 루프

### 3.1 With-skill vs Without-skill 병렬 실행

**중요 원칙**: 동시 시작 (§Step 1: Spawn all runs)
- with-skill 실행 후 baseline 실행 X
- **같은 turn에서 모두 spawn** → 동시 완료 (빠른 피드백)

**subagent 호출 패턴** (SKILL.md):

```
With-skill run:
- Skill path: <path-to-skill>
- Task: <eval prompt>
- Input files: <eval files if any, or "none">
- Save outputs to: <workspace>/iteration-<N>/eval-<ID>/with_skill/outputs/

Baseline run:
- **Creating new skill**: no skill (same prompt, no skill path)
  Save to: without_skill/outputs/
- **Improving existing skill**: snapshot of old version
  Save to: old_skill/outputs/
```

**디렉토리 구조**:
```
<workspace>/
├── iteration-1/
│   ├── eval-0-edge-case-1/
│   │   ├── with_skill/
│   │   │   ├── outputs/        # 스킬로 생성한 결과
│   │   │   ├── transcript.md
│   │   │   ├── metrics.json
│   │   │   └── timing.json
│   │   ├── without_skill/
│   │   │   ├── outputs/        # 기준선 (스킬 없음)
│   │   │   ├── transcript.md
│   │   │   └── ...
│   │   ├── eval_metadata.json
│   │   └── grading.json        # 두 run의 grading 결과
│   ├── eval-1-complex-case/
│   │   └── ...
│   ├── benchmark.json
│   └── feedback.json           # 사용자 리뷰 (submit 후)
├── iteration-2/
│   └── ... (이전 버전 스킬 스냅샷 포함)
```

### 3.2 Assertion 기반 정량 평가

**Assertion 설계 원칙** (Step 2: While runs in progress):

```
Good assertions:
- Objectively verifiable (지표화 가능)
- Descriptive names (결과 창에서 즉시 이해 가능)
- Discriminating (올바른 실행만 통과)

Bad assertions:
- Subjective (writing style, design quality)
- Trivial (파일 존재만 확인, 내용 X)
- Non-discriminating (skill 있든 없든 통과)
```

**grading.json 생성** (Step 4: Grade, aggregate, launch viewer):

Grader agent (agents/grader.md) 호출:
- 입력: expectations, transcript_path, outputs_dir
- 과정: Transcript 읽기 → Output 파일 검증 → Assertion 평가
- 출력: grading.json (expectations[], summary, claims, eval_feedback)

**프로그래밍 방식 검증**:
- Assertion이 자동화 가능 → script 작성 (빠르고 신뢰성 높음)
- Assertion이 휴리스틱 → grader agent (정확성 > 속도)

### 3.3 Aggregation & Benchmark 생성

**aggregation 스크립트**:
```bash
python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <name>
```

출력:
- benchmark.json (정확한 스키마 준수)
- benchmark.md (마크다운 요약)
- mean ± stddev 계산
- delta (with_skill - without_skill)

### 3.4 Analyst Pass: 패턴 발견

**analyzer agent** (agents/analyzer.md > "Analyzing Benchmark Results" 섹션):

**체크항목**:
1. **Per-assertion patterns**:
   - 100% pass (both configs) → non-discriminating
   - 100% fail (both configs) → broken or beyond capability
   - Pass with_skill, fail without → 명확한 skill 가치
   - Fail with_skill, pass without → 스킬이 해치는 경우
   - High variance → 불안정한 assertion

2. **Cross-eval patterns**:
   - 특정 eval 타입 일관되게 어려움/쉬움
   - Variance가 큰 eval → flaky
   - 예상 외 결과

3. **Metrics patterns**:
   - 실행 시간 증가분 vs 정확도 개선 trade-off
   - 토큰 사용량 이상치
   - Resource overhead

**출력**: notes (JSON array of strings)
```json
[
  "Assertion 'Output is PDF' passes 100% in both - non-discriminating",
  "Eval 3 shows high variance (50% ± 40%) - run 2 had unusual failure",
  "Without-skill runs consistently fail on table extraction (0% pass rate)",
  "Skill adds 13s avg time but improves pass rate by 50%"
]
```

### 3.5 Feedback 읽기 & 개선 주기

**Step 5: Read feedback**:
```json
{
  "reviews": [
    {"run_id": "eval-0-with_skill", "feedback": "chart missing axis labels"},
    {"run_id": "eval-1-with_skill", "feedback": ""},
    {"run_id": "eval-2-with_skill", "feedback": "perfect!"}
  ],
  "status": "complete"
}
```

- 빈 feedback = 만족 (개선 불필요)
- 특정 feedback이 있는 case에 집중

**Generalization 원칙** (§How to think about improvements):

> "We're trying to create skills used a million times across many different prompts. Iterating only on a few examples because it's fast, but overfitting is useless. Rather than fiddly changes, try branching out with different metaphors or working patterns."

→ 예제 3개에 과적합(overfitting)되지 않도록 일반화된 개선

**Iteration loop**:
1. 스킬 개선 (feedback 기반)
2. 모든 test case를 iteration-<N+1>/로 재실행 (with-skill + baseline)
3. Viewer 실행 (--previous-workspace 포함)
4. 사용자 리뷰 대기
5. feedback 읽기 → 반복

**종료 조건**:
- 사용자 "happy"
- feedback all empty
- 의미있는 진전 없음

---

## 4. Blind A/B 비교 워크플로우 (Advanced)

### 4.1 Blind Comparator Agent (agents/comparator.md)

**목적**: 두 스킬 버전 간 엄격한 비교 (어느 것이 실제로 더 나은가?)

**특징**: 비교자 에이전트는 어떤 skill이 어떤 output을 만들었는지 모름
- Output A, Output B 제시 (skill 정보 숨김)
- 순수 output 품질 기반 판단

**입력**:
- output_a_path, output_b_path
- eval_prompt (실행했던 원본 태스크)
- expectations (optional, 보조 증거)

### 4.2 Rubric Scoring (Content + Structure)

**Content Rubric** (output이 무엇을 포함하는가):
```
| Criterion | 1 (Poor) | 3 (Acceptable) | 5 (Excellent) |
|-----------|----------|----------------|---------------|
| Correctness | Major errors | Minor errors | Fully correct |
| Completeness | Missing key | Mostly complete | All present |
| Accuracy | Significant | Minor inaccuracy | Accurate |
```

**Structure Rubric** (output 조직):
```
| Criterion | 1 | 3 | 5 |
|-----------|---|---|---|
| Organization | Disorganized | Reasonably org. | Clear, logical |
| Formatting | Inconsistent | Mostly consistent | Professional |
| Usability | Difficult | Usable w/ effort | Easy to use |
```

**점수 계산**:
- 각 criterion 1-5 점수
- Content score = content criteria 평균 (1-5)
- Structure score = structure criteria 평균 (1-5)
- Overall score = (content + structure) / 2 × 5 = 1-10 스케일

### 4.3 Comparison Output (comparison.json)

```json
{
  "winner": "A",  // "A", "B", or "TIE"
  "reasoning": "Output A provides complete solution...",

  "rubric": {
    "A": {
      "content": {"correctness": 5, "completeness": 5, "accuracy": 4},
      "structure": {"organization": 4, "formatting": 5, "usability": 4},
      "content_score": 4.7,
      "structure_score": 4.3,
      "overall_score": 9.0
    },
    "B": { /* ... */ }
  },

  "output_quality": {
    "A": {
      "score": 9,
      "strengths": ["Complete", "Well-formatted"],
      "weaknesses": ["Minor style inconsistency"]
    }
  },

  "expectation_results": {
    "A": {
      "passed": 4,
      "total": 5,
      "pass_rate": 0.80,
      "details": [...]
    }
  }
}
```

### 4.4 Post-hoc Analyzer (agents/analyzer.md)

**역할**: "unblind" 후 왜 승자가 이겼는지 분석

**입력**:
- winner ("A" or "B")
- winner_skill_path, loser_skill_path
- winner_transcript_path, loser_transcript_path
- comparison_result_path

**과정**:
1. 비교 결과 읽기
2. 양쪽 skill SKILL.md + 참고 파일 읽기
3. 양쪽 transcript 읽기
4. Instruction following 평가 (양쪽 각각 1-10)
5. Winner strengths 식별 (명확한 지시, 나은 script, 포괄적 예제 등)
6. Loser weaknesses 식별 (모호한 지시, 부족한 도구, edge case 미처리 등)
7. 개선 제안 (우선순위: high/medium/low)

**분석.json 출력**:
```json
{
  "comparison_summary": {
    "winner": "A",
    "winner_skill": "path/to/winner",
    "loser_skill": "path/to/loser",
    "comparator_reasoning": "..."
  },

  "winner_strengths": [
    "Clear step-by-step instructions",
    "Included validation script"
  ],

  "loser_weaknesses": [
    "Vague instructions 'process appropriately'",
    "No validation script"
  ],

  "instruction_following": {
    "winner": {"score": 9, "issues": ["Minor: skipped optional logging"]},
    "loser": {"score": 6, "issues": ["Did not use template", "Invented own approach"]}
  },

  "improvement_suggestions": [
    {
      "priority": "high",
      "category": "instructions",  // or "tools", "examples", "error_handling", "structure", "references"
      "suggestion": "Replace vague 'process appropriately' with explicit steps",
      "expected_impact": "Would eliminate ambiguity"
    }
  ]
}
```

**사용 시기**: Optional, subagent 필요
- 사용자가 "is the new version actually better?" 물을 때
- Human review loop만으로 충분하면 사용 안 함

---

## 5. Description 최적화 루프

### 5.1 Description 역할

SKILL.md frontmatter의 `description` 필드:
- Claude의 `available_skills` 리스트에 나타남 (name + description)
- 스킬 triggering의 **유일한 메커니즘**
- Undertriggering 문제 방지: "pushy" 설명 권장

**예시**:

Bad (undertrigger 위험):
> "How to build a simple fast dashboard to display internal Anthropic data."

Good (pushy, clear when to use):
> "How to build a simple fast dashboard to display internal Anthropic data. Make sure to use this skill whenever the user mentions dashboards, data visualization, internal metrics, or wants to display any kind of company data, even if they don't explicitly ask for a 'dashboard.'"

### 5.2 Trigger Eval Query 생성 (Step 1)

**구성**: 20개 eval query (8-10 should_trigger + 8-10 should_not_trigger)

```json
[
  {"query": "user's realistic prompt with details", "should_trigger": true},
  {"query": "another prompt", "should_trigger": false}
]
```

**Should-trigger queries (8-10)**:
- Coverage: 동일 intent의 여러 표현 (formal, casual)
- User가 스킬/파일 타입 명시 안 함 → 하지만 명확히 필요
- Uncommon use cases
- 경쟁 스킬과의 경계 (이 스킬이 이겨야 함)

**Should-not-trigger queries (8-10)**:
- **Near-misses** (가장 가치있음): 키워드/개념은 유사하나 다른 도구가 적절
- 인접 도메인 (adjacent domains)
- 모호한 표현 (naive keyword match 하면 틀림)
- 스킬이 다루는 것과 접하나 다른 맥락

**Bad practices**:
- "Write fibonacci function" as negative for PDF skill (너무 명백)
- Should-not-trigger가 명백히 무관한 경우

**Good practices**:
- 구체적 세부 사항 (파일 경로, 컬럼명, 회사명, URL)
- 작은 백스토리
- 소문자, 약자, 오타, 캐주얼한 표현
- 길이 다양

**Bad query**:
```
"Format this data"
"Extract text from PDF"
"Create a chart"
```

**Good query**:
```
"ok so my boss just sent me this xlsx file (in downloads, 'Q4 sales final FINAL v2.xlsx')
and she wants me to add a column that shows profit margin %. Revenue in C, costs in D"
```

### 5.3 사용자 리뷰 (Step 2)

**Template**: assets/eval_review.html
```html
__EVAL_DATA_PLACEHOLDER__         → JSON array (no quotes)
__SKILL_NAME_PLACEHOLDER__        → skill name
__SKILL_DESCRIPTION_PLACEHOLDER__ → current description
```

**프로세스**:
1. HTML template 읽기
2. Placeholder 교체
3. /tmp/eval_review_<skill-name>.html에 쓰기
4. open /tmp/eval_review_<skill-name>.html
5. 사용자가 browser에서 수정 (쿼리 추가/제거, should_trigger 토글)
6. "Export Eval Set" → ~/Downloads/eval_set.json
7. 최신 버전 확인 (eval_set.json 또는 eval_set (1).json 등)

### 5.4 최적화 루프 실행 (Step 3)

**명령**:
```bash
python -m scripts.run_loop \
  --eval-set <path-to-trigger-eval.json> \
  --skill-path <path-to-skill> \
  --model <model-id> \
  --max-iterations 5 \
  --verbose
```

**내부 동작** (scripts/run_loop.py):

1. **Train/Test Split** (60/40):
   ```python
   def split_eval_set(eval_set, holdout=0.4, seed=42):
       # should_trigger별로 분리 → stratified split
       trigger = [e for e in eval_set if e["should_trigger"]]
       no_trigger = [e for e in eval_set if not e["should_trigger"]]
       # shuffle → split
       train_set, test_set = ...
   ```

2. **Max 5 iterations**:
   ```
   For iteration 1 to 5:
     a. Current description로 train + test set 평가 (각 query 3회 실행)
     b. Score 계산 (pass rate)
     c. Train score로는 improvement detect, test score로 overfitting 방지
     d. Claude 호출: 실패한 query 분석 → 개선된 description 제안
     e. 새 description으로 다시 평가
     f. Test score 개선 없으면 early stop
   ```

3. **Best Description 선택**:
   - Test score (train score X) 기반
   - Overfitting 방지

4. **Output**: JSON
   ```json
   {
     "original_description": "...",
     "best_description": "optimized description",
     "best_score": 0.95,
     "iterations_run": 5,
     "history": [
       {
         "iteration": 1,
         "description": "...",
         "train_passed": 8,
         "train_total": 12,
         "test_passed": 3,
         "test_total": 5
       }
     ]
   }
   ```

### 5.5 Triggering 메커니즘 이해

**Important**: 스킬은 Claude가 할 수 없을 때만 trigger됨

```
Simple queries → Claude handles directly (skill 미trigger)
  e.g., "read this PDF", "format this text"

Complex, multi-step, specialized queries → trigger if description matches
  e.g., "extract all quarterly revenue trends from 50 PDFs and create comparison charts"
```

→ Eval query는 **substantive**해야 함 (단순 쿼리는 poor test case)

### 5.6 Result 적용 (Step 4)

- best_description을 SKILL.md frontmatter에 업데이트
- Before/after 비교 표시
- 스코어 리포팅

---

## 6. Progressive Disclosure 아키텍처

### 6.1 3-Level Loading System

**Level 1: Metadata** (~100 words, always in context)
```yaml
name: example-skill
description: When to trigger, what it does, key context cues
```

**Level 2: SKILL.md body** (<500 lines, loaded when triggered)
- Main instructions, examples, workflow steps
- References to bundled resources with clear guidance

**Level 3: Bundled resources** (unlimited, loaded as needed)
```
skill-name/
├── SKILL.md
├── scripts/    # Deterministic code (can execute without loading)
├── references/ # Docs loaded into context as needed
└── assets/     # Templates, icons, fonts for output
```

### 6.2 Domain Organization Pattern (Multi-variant)

**Use case**: 스킬이 여러 도메인/프레임워크 지원

```
cloud-deploy/
├── SKILL.md          # Main workflow + selection logic
└── references/
    ├── aws.md        # AWS-specific guidance
    ├── gcp.md        # GCP-specific guidance
    └── azure.md      # Azure-specific guidance
```

**로딩 원칙**:
- Claude는 관련 reference 파일만 읽음
- SKILL.md에서 "관련 reference 파일 읽기" 가이드 제공

**SKILL.md 구조 제안**:
- 500줄 근처 → 추가 hierarchy + clear pointers
- 예: "For AWS, see references/aws.md" with explicit instruction when to read

### 6.3 Bundled Resources 조직

**scripts/** (deterministic, executable):
- Input/output 명확
- Side effect 없음 (또는 minimal)
- SKILL.md에서 호출 시점 명시
- 예: validate_output.py, create_docx.py

**references/** (documentation):
- Docs, templates, examples
- >300줄 → TOC 포함
- 로딩 시점 명확히 지시

**assets/** (output templates, static files):
- Templates for generated files
- Icons, fonts, stylesheets
- Runtime에 사용

### 6.4 Principle of Lack of Surprise

**보안/신뢰**:
- Malware, exploit code, system compromise X
- Skill 내용은 설명과 일치
- "Roleplay" 류는 OK

---

## 7. KonaI-Agent 서비스 적용 시사점

### 7.1 대화형 생성 UI → 웹 기반 위저드

**패턴**: skill-creator의 Interview phase + writer phase → KonaI-Agent chat 기반

**설계**:
1. **Chat Message Format**:
   - User: "I want a skill that..."
   - Agent: "Let me ask some clarifying questions"
   - Interview 4가지 질문 자동 제시
   - User feedback capture → 구조화된 intent spec

2. **SKILL.md Auto-Draft**:
   - Agent이 interview responses 기반 draft 생성
   - User에게 "Here's my draft. Please review" 제시
   - Inline edit or request rewrite

3. **Test Case Wizard**:
   - 2-3개 realistic prompt 자동 생성 (agent)
   - User confirm/modify
   - evals.json 저장

**UI 컴포넌트**:
- GeneralChatView: Interview questions + responses
- Artifact panel: SKILL.md draft 인라인 에디터
- Test case form: prompt 리스트 + edit 컨트롤

### 7.2 Eval Viewer → Skill Detail Panel의 평가 탭

**현재**: skill-creator는 generate_review.py (독립 HTML/server)

**KonaI-Agent 적응**:
1. **Eval Viewer as Tab**:
   - Skill detail panel에 "Evaluations" 탭
   - benchmark.json + grading.json 표시
   - Outputs 탭 (단일 eval case) + Benchmark 탭 (정량 비교)

2. **Inline Rendering** (현재 generate_review.py 로직 재사용):
   - Output file embedding (base64 images, text rendering)
   - Formal grades (assertions pass/fail)
   - Feedback textarea with auto-save to IndexedDB or backend

3. **Navigation**:
   - Eval selector dropdown (eval-0-with_skill, eval-1-without_skill 등)
   - or carousel (prev/next)

4. **Feedback Integration**:
   - Submit → backend save (feedback.json)
   - Skill improve 다음 iteration fetch (--previous-workspace 개념)

### 7.3 A/B 비교 뷰 (Phase 2)

**미래 기능**: skill version comparison

**패턴**: Blind A/B comparator + analyzer 적용

**UI**:
- Version selector (v1, v2 etc.)
- Rubric scores side-by-side
- Winner/reasoning
- Improvement suggestions (analyzer output)

**구현**:
- Backend: comparator + analyzer subagent 호출
- Frontend: comparison.json + analysis.json 렌더링

### 7.4 Description 최적화 → Trigger Accuracy Panel (Phase 2)

**미래 기능**: trigger description fine-tuning

**UI**:
- "Optimize Triggering" button in Skill detail
- Query generator (should_trigger 리스트 auto-generate + user edit)
- Run optimization loop (background task)
- Results: iteration history + best_description

**구현**:
- Trigger eval 위저드 (Query list editor)
- run_loop.py backend integration (async task)
- Live progress indicator (iteration N/5)
- Final score display + "Apply to Description" button

### 7.5 Progressive Disclosure → 3-Layer Skill Card

**현재**: Skill card (name + description)

**개선**:
1. **Layer 1**: Card view (metadata)
   - Skill name + short description
   - Status badge (implemented, partial, deprecated)
   - Trigger count (optional, analytics)

2. **Layer 2**: Detail panel (SKILL.md body)
   - Click card → side panel open
   - SKILL.md 전체 + references 로딩 지시
   - "See references/aws.md for AWS setup"
   - Evaluations tab (위에서 언급)

3. **Layer 3**: Drill-down
   - references/ 파일 expansion
   - scripts/ 코드 뷰
   - assets/ 템플릿 프리뷰

**구현**:
- Skill card component: metadata only
- SkillDetailPanel: expandable references
- ReferenceViewer: file content + syntax highlighting

### 7.6 통합 Skill Management Workflow

**KonaI-Agent Skill Management 전체 흐름**:

```
1. Create
   Chat-based interview → draft SKILL.md → test case setup

2. Test & Evaluate
   Run test cases (subagent) → generate benchmark.json → eval viewer in panel

3. Iterate
   User feedback (eval panel) → improve skill → re-run tests

4. Optimize (Phase 2)
   Description optimization → trigger accuracy analysis

5. A/B Compare (Phase 2)
   Version comparison → rubric scoring → improvement suggestions

6. Publish
   Final skill → skill marketplace or team gallery
```

**데이터 흐름**:
- Skill SKILL.md: backend storage
- Test results: workspace directories (filesystem or S3)
- Feedback: feedback.json (backend)
- Benchmark: benchmark.json (backend cache for fast display)
- Version history: history.json (skill detail panel "Versions" tab)

---

## 8. 기술 구현 세부사항

### 8.1 Workspace 디렉토리 구조 (코드 레퍼런스)

**경로**: skill-creator/eval-viewer/generate_review.py, line 60-82 (find_runs)

```python
def find_runs(workspace: Path) -> list[dict]:
    """Recursively find directories containing outputs/"""
    runs: list[dict] = []
    _find_runs_recursive(workspace, workspace, runs)
    runs.sort(key=lambda r: (r.get("eval_id", float("inf")), r["id"]))
    return runs

def _find_runs_recursive(root: Path, current: Path, runs: list[dict]) -> None:
    if not current.is_dir():
        return

    outputs_dir = current / "outputs"
    if outputs_dir.is_dir():
        run = build_run(root, current)
        if run:
            runs.append(run)
        return

    skip = {"node_modules", ".git", "__pycache__", "skill", "inputs"}
    for child in sorted(current.iterdir()):
        if child.is_dir() and child.name not in skip:
            _find_runs_recursive(root, child, runs)
```

**발견 논리**:
- outputs/ 존재 = run 디렉토리
- skip list로 무관 디렉토리 제외
- 재귀적 탐색 (iteration-N/eval-M 등 깊이 제약 없음)

### 8.2 File Embedding (generate_review.py, line 149-200)

```python
def embed_file(path: Path) -> dict:
    """Read and return embedded representation"""
    ext = path.suffix.lower()
    mime = get_mime_type(path)

    if ext in TEXT_EXTENSIONS:
        # Inline as text
        return {"name": path.name, "type": "text", "content": content}
    elif ext in IMAGE_EXTENSIONS:
        # Base64 data URI
        b64 = base64.b64encode(path.read_bytes()).decode("ascii")
        return {"name": path.name, "type": "image", "mime": mime, "data_uri": f"data:{mime};base64,{b64}"}
    elif ext == ".pdf":
        # Base64 for embed in iframe
        b64 = base64.b64encode(path.read_bytes()).decode("ascii")
        return {"name": path.name, "type": "pdf", "data_uri": f"data:{mime};base64,{b64}"}
    elif ext == ".xlsx":
        # Base64 for client-side Excel.js processing
        b64 = base64.b64encode(path.read_bytes()).decode("ascii")
        return {"name": path.name, "type": "xlsx", "data_b64": b64}
    else:
        # Binary → base64 download link
        ...
```

**지원 타입**:
- TEXT_EXTENSIONS: .txt, .md, .json, .csv, .py, .js, .ts, .yaml, .xml, .html, .css, .sh, .sql, .r, .toml
- IMAGE_EXTENSIONS: .png, .jpg, .jpeg, .gif, .svg, .webp
- PDF: iframe embed
- XLSX: 클라이언트 Excel.js
- Binary: base64 다운로드

### 8.3 Metrics & Timing Capture (SKILL.md §Step 3)

**Capture 시점**: Subagent task 완료 시 notification에 포함
- total_tokens
- duration_ms

**저장** (즉시, 나중에 복구 불가):
```json
{
  "total_tokens": 84852,
  "duration_ms": 23332,
  "total_duration_seconds": 23.3,
  "executor_start": "2026-01-15T10:30:00Z",
  "executor_end": "2026-01-15T10:32:45Z"
}
```

→ benchmark.json에 통합 (run_summary 계산)

### 8.4 Grading Automation (agents/grader.md)

**프로세스**:
1. Transcript 읽기 (execution steps 추적)
2. Output files 검증 (content verification, not just existence)
3. Assertion 평가 (각각에 pass/fail + evidence)
4. Claims 추출 & 검증 (factual, process, quality)
5. User notes 읽기 (uncertainties, workarounds)
6. Eval quality 피드백 (assertions 자체의 개선 제안)

**Output schema** (schemas.md):
- expectations[]: {text, passed, evidence}
- summary: {passed, failed, total, pass_rate}
- execution_metrics: {tool_calls: {Read, Write, Bash, ...}}
- timing: {executor_duration_seconds, grader_duration_seconds}
- claims: {claim, type: "factual"|"process"|"quality", verified, evidence}
- eval_feedback: {suggestions, overall}

### 8.5 Description Optimization Algorithm (run_loop.py)

**Train/Test Split** (line 24-44):
```python
def split_eval_set(eval_set, holdout=0.4, seed=42):
    # Stratified by should_trigger
    trigger = [e for e in eval_set if e["should_trigger"]]
    no_trigger = [e for e in eval_set if not e["should_trigger"]]

    random.shuffle(trigger)
    random.shuffle(no_trigger)

    n_trigger_test = max(1, int(len(trigger) * holdout))
    n_no_trigger_test = max(1, int(len(no_trigger) * holdout))

    test_set = trigger[:n_trigger_test] + no_trigger[:n_no_trigger_test]
    train_set = trigger[n_trigger_test:] + no_trigger[n_no_trigger_test:]

    return train_set, test_set
```

**Loop Iteration** (line 79-137):
```
For iteration 1..5:
  Evaluate all_queries (train + test) in one batch
  Split results back into train/test by query matching
  Calculate pass rates
  Append to history
  If test_results better: continue
  Else: early stop (best_description found)

  Claude: propose improved description based on failed queries
```

**Best Selection**:
- Test score 기반 (overfitting 방지)
- JSON output: {original_description, best_description, iterations_run, history}

---

## 9. 핵심 설계 원칙 정리

### 9.1 Skill Creator의 근본 철학

1. **Generalization over Overfitting**
   - Test case 3개에 최적화 X
   - 일반화된 지시문으로 전개

2. **Why > MUST**
   - ALWAYS/NEVER 지양
   - 이유 설명으로 이해 도모
   - LLM의 theory of mind 활용

3. **Progressive Disclosure**
   - Metadata (100w) → SKILL.md (<500l) → Resources (unlimited)
   - 필요할 때만 로드

4. **Blind Comparison**
   - Bias 제거 (어느 skill이 만들었는지 모름)
   - Quality 순수 평가

5. **Human in the Loop**
   - User evaluation 중심
   - Quantitative 는 보조
   - Feedback loop 반복

### 9.2 KonaI-Agent 적용 핵심 시사

| 패턴 | Skill Creator | KonaI-Agent |
|------|--------------|------------|
| **Intent Capture** | CLI interview | Chat-based wizard in GeneralChatView |
| **SKILL.md Draft** | Agent writes + user confirms | Artifact panel with inline editor |
| **Test Case Setup** | evals.json interactive | Test case form in wizard |
| **Eval Running** | Subagent parallel execution | Backend task queue |
| **Eval Viewer** | Standalone HTML/server | Skill detail panel "Evaluations" tab |
| **Feedback** | feedback.json download | Backend storage + fetch for next iteration |
| **Description Opt.** | CLI run_loop.py | "Optimize Triggering" UI (Phase 2) |
| **A/B Compare** | CLI blind comparator | Version comparison view (Phase 2) |
| **Workspace** | Filesystem (iteration-N/) | S3 or backend storage |
| **Progressive Disclosure** | 3-level loading | Skill card → detail panel → drill-down |

### 9.3 단계적 구현 로드맵

**Phase 1** (MVP):
- Chat-based skill creation (interview + draft)
- Test case setup
- Run tests (subagent)
- Eval viewer in detail panel (benchmark + formal grades)
- Feedback collection → improve loop

**Phase 2** (Advanced):
- Description optimization UI
- Blind A/B comparison
- Version history / comparison view
- Trigger accuracy analysis panel

**Phase 3** (Polish):
- Skill marketplace integration
- Analytics (trigger counts, success rates)
- Skill templating (template-from-skill)
- Collaborative skill development

---

## 10. 참고 파일 맵

| 파일 | 목적 | 주요 섹션 |
|------|------|---------|
| SKILL.md | Main workflow guide | Capture Intent, Test Cases, Evaluating, Improving, Description Optimization |
| agents/grader.md | Assertion grading logic | Process, Output Format, Guidelines |
| agents/comparator.md | Blind A/B comparison | Rubric, Scoring, Output Format |
| agents/analyzer.md | Post-hoc analysis + benchmark patterns | Instruction Following, Improvements, Benchmark Analysis |
| references/schemas.md | JSON structure specs | evals.json, grading.json, benchmark.json, comparison.json, analysis.json |
| eval-viewer/generate_review.py | HTML eval viewer | find_runs, embed_file, build_run |
| scripts/run_loop.py | Description optimization | split_eval_set, loop iteration, best selection |
| scripts/aggregate_benchmark.py | Benchmark aggregation | Statistics calculation, delta computation |
| scripts/run_eval.py | Eval execution | Trigger testing, pass rate calculation |

---

## 결론

Skill Creator는 **conversation-driven iterative skill development** 플랫폼이다.
핵심 UX 패턴들 (Intent Interview, Eval Viewer, A/B Comparison, Description Optimization)은
KonaI-Agent의 웹 기반 skill management 기능으로 직접 이식 가능하다.

특히:
- **Chat-based Interview** → GeneralChatView에 통합된 위저드
- **Eval Viewer** → Skill detail panel의 탭 기반 인터페이스
- **Progressive Disclosure** → Skill card → detail panel → drill-down
- **Feedback Loop** → Backend 기반 iteration tracking

이러한 패턴들은 사용자 중심의 skill 개발 경험을 제공하면서도,
정량적 평가와 blind comparison을 통해 객관성을 보장한다.

---

**Document Version**: 1.0
**Last Updated**: March 2026
**Reviewed By**: UX Research for KonaI-Agent Skill Management
