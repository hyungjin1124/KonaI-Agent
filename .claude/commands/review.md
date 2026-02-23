# Review Pipeline — Discovery 리포트 검토

Tech Lead 관점에서 discovery 리포트의 발견 항목들을 평가하고,
상세 리서치 + 구현을 진행할 항목을 선별한다.

**인자**: `$ARGUMENTS`

---

## 입력 결정

`$ARGUMENTS`에 따라 검토 대상을 결정한다:

- **비어있음** → `specs/discovery-reports/` 에서 가장 최근 리포트를 자동 선택
- **파일명** (예: `2026-02-16-discovery.md`) → 해당 리포트를 검토
- **날짜** (예: `2026-02-16`) → 해당 날짜의 리포트를 검토

리포트를 찾을 수 없으면 에러 메시지를 출력하고 중단한다.

---

## Step 1 — 리포트 로드 및 프로젝트 컨텍스트 수집

### 1-1. Discovery 리포트 읽기

리포트에서 다음을 추출한다:
- 모든 NEW, UPDATE, PRIORITY_CHANGE, STALE, DEPRECATED 항목
- 각 항목의 발견 출처, 경쟁사 현황, 관련 카테고리
- 리포트의 권장 다음 액션 목록

### 1-2. 프로젝트 컨텍스트 수집

평가 기준이 될 프로젝트 상태를 파악한다:

**카탈로그 현황**:
- `specs/component-catalog.yaml` 로드
- status별 분포 (특히 not_implemented, research_needed 수)
- 현재 진행 중인 구현 항목 (partial 상태)

**프로젝트 목표** (CLAUDE.md에서 확인):
- 프로젝트의 핵심 기능 영역
- 기술 스택 제약 (Next.js 15, React 18, Radix UI 등)

**최근 구현 이력**:
- `specs/implementation-logs/` 에서 최근 구현된 컴포넌트 확인
- 현재 feature branch 확인 (진행 중인 작업과 충돌 방지)

---

## Step 2 — 항목별 평가

각 발견 항목을 5가지 기준으로 평가한다.

### 평가 기준

**1. 프로젝트 적합성** (필수)
- KonaI-Agent의 핵심 사용 시나리오에 해당하는가?
- 에이전트 기반 엔터프라이즈 대시보드에 맞는 패턴인가?
- B2C 전용 패턴이 아닌가?
- 평가: ESSENTIAL / RELEVANT / MARGINAL / IRRELEVANT

**2. 기술 스택 호환성** (필수)
- Next.js App Router + React 18 + TypeScript 환경에서 구현 가능한가?
- Radix UI / Tailwind CSS 기반 UI 체계와 충돌하지 않는가?
- 필요한 외부 라이브러리가 프로젝트에 적합한가?
- 평가: COMPATIBLE / ADAPTABLE / INCOMPATIBLE

**3. ROI 평가**
- 구현 난이도 (complexity) 대비 사용자 가치
- 이 패턴 없이도 제품이 동작하는가, 있으면 어떤 차별화가 되는가?
- 평가: HIGH / MEDIUM / LOW

**4. 의존성 확인**
- 선행 구현이 필요한 컴포넌트가 있는가?
- 카탈로그에서 dependencies 충족 여부 확인
- 평가: READY / BLOCKED({missing_component_id}) / PARTIAL

**5. 타이밍**
- 지금 리서치/구현하는 것이 적절한가?
- 다른 우선 구현 항목이 있어서 미룰 수 있는가?
- 업계 동향이 아직 안정화되지 않아 더 지켜볼 필요가 있는가?
- 평가: NOW / NEXT_CYCLE / WAIT / SKIP

### 평가 절차

각 항목에 대해:
1. 5가지 기준으로 평가한다.
2. 종합 판정을 내린다: **APPROVE** / **DEFER** / **REJECT**
3. 판정 근거를 2~3문장으로 작성한다.

**종합 판정 기준**:
- APPROVE: 적합성이 ESSENTIAL/RELEVANT + 호환성 COMPATIBLE/ADAPTABLE + ROI HIGH/MEDIUM + 타이밍 NOW
- DEFER: 조건은 충족하나 타이밍이 NEXT_CYCLE이거나 의존성 BLOCKED
- REJECT: 적합성 MARGINAL/IRRELEVANT 또는 호환성 INCOMPATIBLE 또는 ROI LOW

---

## Step 3 — 우선순위 결정

APPROVE된 항목들을 실행 순서로 정렬한다.

### 정렬 기준 (우선순위 높은 순)

1. 적합성 ESSENTIAL > RELEVANT
2. ROI HIGH > MEDIUM
3. 의존성 READY > PARTIAL
4. complexity simple > moderate > complex

### 배치 그룹핑

하루에 처리 가능한 작업량을 고려하여 배치로 나눈다:
- **Batch 1** (즉시 실행): 최우선 1~2개 항목. 오늘 리서치+구현 시작.
- **Batch 2** (다음 실행): 차순위 항목. Batch 1 완료 후 진행.
- **Backlog**: 승인했지만 순서가 밀린 항목.

---

## Step 4 — 리뷰 결과 저장

### 출력

`specs/review-decisions/{YYYY-MM-DD}-review.md` 파일을 생성한다:

```markdown
# Review Decision — {YYYY-MM-DD}

## 검토 대상
- **Discovery 리포트**: {리포트 파일명}
- **총 발견 항목**: {N}건
- **프로젝트 현황**: {implemented}/{total} 컴포넌트 구현 완료

---

## 평가 결과

### APPROVED ({N}건)

| # | 항목 | 유형 | 적합성 | 호환성 | ROI | 의존성 | 타이밍 | 배치 |
|---|------|------|--------|--------|-----|--------|--------|------|
| 1 | {패턴명/component_id} | NEW/UPDATE | ESSENTIAL | COMPATIBLE | HIGH | READY | NOW | 1 |
| 2 | ... | ... | ... | ... | ... | ... | ... | 2 |

#### APPROVE-1: {항목명}
- **판정 근거**: {2~3문장}
- **권장 리서치 범위**: {리서치에서 집중할 부분}
- **예상 complexity**: {simple/moderate/complex}

### DEFERRED ({N}건)

| # | 항목 | 유형 | 사유 | 재검토 시점 |
|---|------|------|------|------------|
| 1 | ... | ... | 의존성 미충족: {id} | {id} 구현 후 |

### REJECTED ({N}건)

| # | 항목 | 유형 | 사유 |
|---|------|------|------|
| 1 | ... | ... | B2C 전용 패턴, 엔터프라이즈 시나리오에 부적합 |

---

## 실행 계획

### Batch 1 (즉시 실행)
1. `/research {topic-1}` → `/implement {id-1}`
2. `/research {topic-2}` → `/implement {id-2}`

### Batch 2 (다음 실행)
1. `/research {topic-3}` → `/implement {id-3}`

### Backlog
- {topic-4}: {대기 사유}

> **형식 규칙**: Batch 항목은 반드시 `` `/research {topic}` → `/implement {id}` `` 형식이어야 한다.
> `pipeline.sh`가 이 패턴을 파싱하여 자동 실행하므로, 형식이 다르면 무시된다.
> 리서치만 필요하고 구현 대상이 불명확한 항목은 DEFER로 분류하여 Batch에 넣지 않는다.

---

## 카탈로그 직접 수정

리뷰 결과에 따라 즉시 반영할 카탈로그 변경:
| # | component_id | 필드 | 현재 | 변경 | 사유 |
|---|-------------|------|------|------|------|
| 1 | ... | priority | low | high | 업계 채택률 증가 |
```

### 터미널 출력

```
═══════════════════════════════════════════════
 Review Complete
═══════════════════════════════════════════════
 Report      : {discovery report 파일명}
 Total       : {N} items reviewed
 Approved    : {N} (Batch 1: {N}, Batch 2: {N}, Backlog: {N})
 Deferred    : {N}
 Rejected    : {N}
 Decision    : specs/review-decisions/{date}-review.md
═══════════════════════════════════════════════
```

---

## Step 5 — 다음 액션 실행

리뷰 결과를 바탕으로 사용자에게 실행을 제안한다.

### 자동 실행 제안

```
Batch 1 실행 항목 ({N}건):
  1. /research {topic-1} → /implement {id-1}
  2. /research {topic-2} → /implement {id-2}

실행할 항목을 선택해주세요:
  - all: Batch 1 전부 순서대로 실행
  - 1,2: 선택한 번호만 실행
  - none: 실행하지 않음 (리뷰 결과만 저장)
```

사용자가 선택하면 해당 항목의 `/research` → `/implement` 체인을 순서대로 실행한다.

### 카탈로그 수정 적용

카탈로그 직접 수정 항목이 있으면:
```
카탈로그 수정 {N}건:
  1. {component_id}: priority low → high
  2. {component_id}: status implemented → deprecated

적용할까요? (y/n)
```

승인하면 `specs/component-catalog.yaml`을 직접 수정하고 커밋한다.

---

## 에러 처리

- **리포트 없음**: `specs/discovery-reports/`에 리포트가 없으면 "/discover를 먼저 실행해주세요." 출력 후 중단.
- **리포트에 발견 항목 없음**: "발견 항목이 없어 검토할 내용이 없습니다." 출력 후 종료.
- **카탈로그 로드 실패**: 카탈로그 없이도 적합성/호환성 평가는 가능. 의존성 평가만 건너뛴다.
