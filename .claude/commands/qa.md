# QA Pipeline — 품질 검증

QA Engineer 관점에서 구현된 컴포넌트를 검증한다.
개발자(implement)와는 다른 시각으로 접근한다:
- 개발자는 "의도한 대로 동작하는가"를 본다.
- QA는 "의도하지 않은 상황에서도 견고한가"를 본다.

**인자**: `$ARGUMENTS`

---

## 입력 결정

`$ARGUMENTS`에 따라 검증 대상을 결정한다:

- **component_id** → 해당 컴포넌트를 검증
- **비어있음** → `specs/implementation-logs/`에서 dev-test.md가 있지만 qa-report.md가 없는 가장 최근 컴포넌트를 자동 선택

component_id가 카탈로그에 없거나, dev-test.md가 없으면 에러 출력 후 중단.

> dev-test.md가 없다는 것은 `/implement`의 Dev Test 단계를 거치지 않았다는 의미이다.
> QA는 Dev Test를 통과한 코드만 검증한다.

---

## Step 1 — 검증 컨텍스트 수집

### 1-1. 구현 정보 로드

다음 파일들을 읽는다:
- `specs/implementation-logs/{component_id}/select.md` — 컴포넌트 사양
- `specs/implementation-logs/{component_id}/plan.md` — 구현 계획
- `specs/implementation-logs/{component_id}/dev-test.md` — 개발자 테스트 결과
- `specs/component-catalog.yaml`에서 해당 컴포넌트의 `source_files`

### 1-2. 리서치 문서 로드

카탈로그의 `obsidian_sources`에서 리서치 문서를 읽고 Acceptance Criteria를 추출한다.
QA는 리서치 문서의 Acceptance Criteria를 **개발자와 독립적으로** 해석한다.

### 1-3. 소스 코드 로드

`source_files`에 명시된 모든 파일을 읽어서 실제 구현을 파악한다.
개발자의 테스트 파일(`*.test.tsx`)도 함께 읽는다.

### 1-4. 관련 컴포넌트 확인

카탈로그에서 같은 `contexts`를 가진 다른 implemented 컴포넌트를 확인한다.
이 컴포넌트들과의 통합 지점을 파악한다.

---

## Step 2 — Acceptance Criteria 독립 검증

리서치 문서의 Acceptance Criteria를 **QA 관점에서** 재해석하여 검증한다.

### 검증 방식

개발자의 자가 검증(dev-test.md의 Acceptance Criteria 섹션)과 **별도로** 평가한다.

각 criteria에 대해:
1. 코드에서 해당 기능이 구현된 위치를 직접 찾는다 (dev-test.md 참조하지 않음)
2. 구현이 criteria의 **의도**를 충족하는지 판단한다 (형식적 충족 vs 실질적 충족)
3. 판정: `PASS` / `PARTIAL` / `FAIL` + 근거

개발자와 QA의 판정이 다르면 **QA 판정을 우선**한다.

---

## Step 3 — 엣지 케이스 테스트

개발자가 놓칠 수 있는 시나리오를 점검한다.

### 3-1. 데이터 경계 테스트

- **빈 데이터**: 데이터가 없을 때 UI가 적절히 표시되는가 (빈 상태 메시지, 스켈레톤 등)
- **대량 데이터**: 리스트가 100개, 1000개일 때 성능/레이아웃 문제는 없는가
- **긴 텍스트**: 이름이나 설명이 매우 길 때 레이아웃이 깨지지 않는가
- **특수 문자**: HTML 엔티티, 이모지, 다국어 텍스트 처리
- **null/undefined**: 선택적 Props가 없을 때 에러가 나지 않는가

### 3-2. 사용자 인터랙션 테스트

- **빠른 연속 클릭**: 버튼을 빠르게 여러 번 클릭하면 어떻게 되는가
- **동시 액션**: 로딩 중 다른 액션을 시도하면 어떻게 되는가
- **키보드 네비게이션**: Tab, Enter, Escape 키가 올바르게 동작하는가
- **포커스 관리**: 모달/다이얼로그 열고 닫을 때 포커스가 올바르게 이동하는가

### 3-3. 상태 전환 테스트

- **로딩 → 성공**: 정상 흐름
- **로딩 → 실패**: 에러 상태 표시 + 재시도 가능 여부
- **성공 → 실패**: 이미 표시된 데이터가 에러 후 어떻게 되는가
- **언마운트**: 비동기 작업 중 컴포넌트가 언마운트되면 메모리 누수가 없는가

### 테스트 작성

발견한 엣지 케이스에 대해 추가 테스트를 작성한다:
- 파일 위치: `{ComponentName}.qa.test.tsx`
- 개발자의 기존 테스트 파일은 수정하지 않는다.

```bash
npx jest --testPathPattern={component_path} --passWithNoTests
```

---

## Step 3.5 — UX 플로우 검증

단일 컴포넌트 엣지 케이스(Step 3)를 넘어, **여러 컴포넌트를 관통하는 사용자 시나리오**를 추적하여
상태 동기화, 콜백 연결, 레이아웃 반응의 정합성을 검증한다.

### 3.5-1. 콜백 배선 감사 (Callback Wiring Audit)

컴포넌트가 Context/Provider를 제공하거나 소비할 때,
**선언된 콜백이 실제로 연결되어 있는지** 코드 레벨에서 전수 조사한다.

#### 검증 절차

1. **Provider 콜백 전수 조사**
   - 대상 컴포넌트가 사용하는 모든 Context Provider를 찾는다.
   - Provider의 Props interface에서 콜백 타입(`on*Change`, `on*`, `() => void`)을 추출한다.
   - 해당 Provider가 JSX에서 생성되는 **모든 위치**를 찾는다.
   - 각 위치에서 해당 콜백 Props가 실제로 전달되는지 확인한다.
   - **Optional 콜백(`?`)이라도 `plan.md` 통합 지점에 명시된 것은 반드시 연결되어야 한다.**

2. **이벤트 핸들러 Props 연결 확인**
   - 대상 컴포넌트의 Props interface에서 콜백 Props를 추출한다.
   - 해당 컴포넌트를 렌더링하는 **모든 부모 컴포넌트**에서 콜백이 전달되는지 확인한다.
   - 전달된 콜백이 실제로 의미 있는 동작을 수행하는지 확인한다 (`() => {}` 빈 함수 경고).

3. **useImperativeHandle/Ref 메서드 호출 확인**
   - 대상 컴포넌트가 ref를 통해 메서드를 노출하면, 해당 ref를 사용하는 모든 위치에서
     노출된 메서드가 적절한 시점에 호출되는지 확인한다.

4. **plan.md 통합 지점 대조**
   - `plan.md`에 "통합 지점" 관련 섹션이 있으면 명시된 연동 사항을 하나씩 대조한다.
   - 각 통합 지점이 코드에서 실현되었는지 확인한다.
   - **미연결 통합 지점은 Critical 이슈로 보고한다.**

#### 판정 기준
- 모든 필수 콜백이 연결됨: PASS
- Optional 콜백이 미연결이나 기능 영향 없음: PASS (비고에 기록)
- `plan.md`에 명시된 통합 지점이 미연결: FAIL (Critical)
- 콜백이 연결되었으나 빈 함수로 전달됨: 기능에 따라 Major/Minor

### 3.5-2. 이중 상태 동기화 추적 (Dual State Sync Trace)

같은 의미의 상태가 2곳 이상에서 관리되는 **이중 상태 패턴**을 식별하고,
동기화가 올바른지 검증한다.

#### 이중 상태 패턴 식별

다음 패턴이 있는지 코드에서 탐색한다:
- **Context 파생 상태 + 부모 로컬 상태**: Context 내부에서 파생된 상태와
  부모 컴포넌트에서 별도 `useState`로 관리하는 상태가 같은 의미를 나타내는 경우
- **Ref Bridge 패턴**: Context 메서드를 ref로 노출하여 외부에서 접근하는 경우
- **복수 상태 소스**: 같은 개념(예: "패널이 열려있는가")의 상태가 2곳 이상에서 관리되는 경우

#### 동기화 검증

식별된 각 이중 상태 쌍에 대해:
1. 상태 A가 변경될 때 상태 B가 업데이트되는 경로를 추적한다.
2. 상태 B가 변경될 때 상태 A가 업데이트되는 경로를 추적한다.
3. **양방향 모두** 동기화 경로가 존재하는지 확인한다.
4. 단방향만 존재하면 동기화가 끊기는 시나리오를 구체적으로 기록한다.

### 3.5-3. 종료 상태 시나리오 (Terminal State Scenarios)

컴포넌트가 관리하는 컬렉션(탭, 리스트, 선택 항목 등)에서
**마지막 항목이 제거되는 종료 상태**의 UI 반응을 검증한다.

#### 검증 대상 시나리오

컴포넌트의 기능에 따라 해당되는 시나리오를 선별하여 검증한다:

1. **마지막 항목 제거 (Close Last Item)**
   - 탭/리스트/선택에서 마지막 항목을 제거했을 때:
     - 부모 컴포넌트의 레이아웃이 올바르게 적응하는가? (패널 접힘, 영역 확장 등)
     - 빈 상태로 남지 않고 적절한 동작(패널 닫힘, 빈 상태 UI 등)이 발생하는가?

2. **레이아웃 복원**
   - 패널/모달이 열리면서 다른 UI를 자동으로 숨겼다면,
     닫힐 때 숨겨진 UI가 올바르게 복원되는가?

3. **양방향 진입/퇴장 경로**
   - 같은 기능에 여러 진입/퇴장 경로가 있는 경우
     (예: 버튼으로 열기 vs. 사이드바에서 열기, 개별 닫기 vs. 전체 닫기),
     **어떤 경로 조합이든** 최종 UI 상태가 일관적인가?

### 3.5-4. 핵심 사용자 플로우 추적 (Critical User Flow Trace)

대상 컴포넌트가 관여하는 핵심 시나리오를 2~3개 선정하여,
시작부터 끝까지 상태 변화 체인을 추적한다.

#### 플로우 선정 기준

- 대상 컴포넌트가 관여하는 가장 **흔한 사용 시나리오** 1~2개
- 대상 컴포넌트가 관여하는 가장 **파괴적인 시나리오** (닫기, 제거, 리셋) 1개

#### 추적 방법

각 플로우에 대해 상태 변화 체인을 문서화한다:

```
[사용자 액션] → [컴포넌트: 핸들러] → [상태 변경] → [콜백/Effect] → ... → [최종 UI 상태]
```

최종 UI가 기대 상태와 다르면 이슈로 보고한다.

### 테스트 작성

발견한 플로우 이슈에 대해 추가 테스트를 작성한다:
- 파일 위치: `{ComponentName}.flow.qa.test.tsx`
- Provider + 부모 컴포넌트를 함께 렌더링하여 상태 전파를 검증한다.
- 개발자의 기존 테스트 파일, QA 엣지 케이스 테스트 파일과 분리한다.

```bash
npx jest --testPathPattern={component_path} --passWithNoTests
```

---

## Step 4 — 통합 테스트

### 4-1. 컴포넌트 통합 확인

같은 `contexts`의 다른 컴포넌트와의 통합을 코드 레벨에서 확인한다:
- import/export가 올바른가
- 공유 state나 context를 올바르게 사용하는가
- Props 인터페이스가 상위 컴포넌트와 호환되는가
- 이벤트 핸들러가 올바르게 연결되는가 (상세 검증은 Step 3.5 콜백 배선 감사 참조)

### 4-2. 빌드 통합 확인

전체 프로젝트 빌드가 통과하는지 확인한다:

```bash
npm run build
```

### 4-3. 타입 호환성 확인

새로 추가된 타입이 기존 타입과 충돌하지 않는지 확인한다:

```bash
npx tsc --noEmit
```

---

## Step 5 — 접근성 검증

### 필수 확인 항목

- `aria-label`, `aria-describedby` 등 ARIA 속성이 적절한가
- 인터랙티브 요소가 키보드로 접근 가능한가
- 색상 대비가 충분한가 (텍스트, 아이콘)
- 스크린리더가 의미를 전달할 수 있는 구조인가
- 포커스 인디케이터가 visible인가

### 검증 방식

소스 코드를 정적 분석하여 위 항목을 확인한다.
Radix UI 기반 컴포넌트는 기본 접근성이 내장되어 있으므로, 커스텀 부분만 집중 확인한다.

---

## Step 6 — QA 리포트 생성

### 판정 기준

전체 결과를 종합하여 최종 판정한다:

- **PASS**: 모든 Acceptance Criteria 충족 + 심각한 엣지 케이스 없음 + 통합 문제 없음
- **CONDITIONAL PASS**: 경미한 이슈가 있지만 배포 가능. 이슈를 기록하고 후속 수정 권고.
- **FAIL**: Acceptance Criteria 미충족 또는 심각한 엣지 케이스 발견. 수정 후 재검증 필요.

### 출력

`specs/implementation-logs/{component_id}/qa-report.md` 파일을 생성한다:

```markdown
# QA Report: {component_name}

## 판정: {PASS | CONDITIONAL PASS | FAIL}

---

## Acceptance Criteria 검증

| # | Criteria | Dev 판정 | QA 판정 | 불일치 | 비고 |
|---|----------|---------|---------|--------|------|
| 1 | ... | PASS | PASS | - | |
| 2 | ... | PASS | PARTIAL | ⚠️ | {QA 근거} |

- Dev 일치율: {N}%
- QA 독립 판정: {X}/{Y} passed

---

## 엣지 케이스 테스트

| # | 시나리오 | 결과 | 심각도 | 상세 |
|---|---------|------|--------|------|
| 1 | 빈 데이터 | PASS/FAIL | critical/major/minor | ... |
| 2 | 빠른 연속 클릭 | PASS/FAIL | ... | ... |

- 추가 테스트 작성: {N}개 ({qa.test.tsx 파일 경로})
- 통과: {N}개, 실패: {N}개

---

## UX 플로우 검증

### 콜백 배선 감사

| # | Provider/Component | 콜백 Prop | 연결 상태 | 심각도 | 비고 |
|---|-------------------|-----------|----------|--------|------|
| 1 | ... | on*Change | ✅/❌ | -/Critical/Major | ... |

- plan.md 통합 지점 대조: {X}/{Y} 연결 확인

### 이중 상태 동기화

| # | 상태 A | 상태 B | A→B 경로 | B→A 경로 | 결과 |
|---|--------|--------|---------|---------|------|
| 1 | ... | ... | 있음/없음 | 있음/없음 | ✅/⚠️ |

### 종료 상태 시나리오

| # | 시나리오 | 기대 동작 | 실제 동작 | 결과 | 심각도 |
|---|---------|----------|----------|------|--------|
| 1 | 마지막 항목 제거 | ... | ... | PASS/FAIL | ... |

### 핵심 사용자 플로우

#### Flow 1: {시나리오명}
```
[사용자 액션] → [핸들러] → [상태 변경] → ... → [최종 UI 상태]
```
기대: ...
결과: PASS/FAIL

- 플로우 테스트 작성: {N}개 ({flow.qa.test.tsx 파일 경로})
- 통과: {N}개, 실패: {N}개

---

## 통합 테스트

- 컴포넌트 통합: PASS/FAIL ({확인한 컴포넌트 목록})
- 빌드 통합: PASS/FAIL
- 타입 호환성: PASS/FAIL

---

## 접근성 검증

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | ARIA 속성 | PASS/FAIL | ... |
| 2 | 키보드 접근성 | PASS/FAIL | ... |
| 3 | 포커스 관리 | PASS/FAIL | ... |

---

## 발견된 이슈

### 심각도: Critical (배포 차단)
- [ ] {이슈 설명} — {파일:라인}

### 심각도: Major (수정 강력 권고)
- [ ] {이슈 설명} — {파일:라인}

### 심각도: Minor (후속 수정 가능)
- [ ] {이슈 설명} — {파일:라인}

---

## 수정 요청

FAIL 또는 CONDITIONAL PASS인 경우, `/implement`에 전달할 수정 사항:

| # | 수정 항목 | 관련 파일 | 심각도 | 설명 |
|---|----------|----------|--------|------|
| 1 | ... | ... | critical | ... |
```

### 터미널 출력

```
═══════════════════════════════════════════════
 QA Complete: {component_name}
═══════════════════════════════════════════════
 Verdict     : {PASS | CONDITIONAL PASS | FAIL}
 Acceptance  : {X}/{Y} passed (QA independent)
 Edge Cases  : {N} tested, {N} issues found
 UX Flows    : {N} flows traced, {N} issues found
 Callbacks   : {N} audited, {N} unwired
 Integration : PASS/FAIL
 A11y        : PASS/FAIL
 Issues      : {N} critical, {N} major, {N} minor
 Report      : specs/implementation-logs/{component_id}/qa-report.md
═══════════════════════════════════════════════
```

---

## Step 7 — FAIL 시 수정 사이클

QA 판정이 FAIL인 경우, 수정 사이클을 시작한다.

### 자동 수정 제안

```
QA 검증 결과: FAIL
수정이 필요한 항목 {N}건:
  1. [Critical] {이슈 설명}
  2. [Major] {이슈 설명}
  3. ...

수정을 진행할까요?
  - fix: /implement의 Stage 4(코드 수정)로 돌아가 수정 후 재검증
  - skip: 이슈를 기록하고 현재 상태로 종료
```

사용자가 `fix`를 선택하면:
1. QA 리포트의 수정 요청 사항을 `specs/implementation-logs/{component_id}/fix-request.md`에 저장
2. `/implement {component_id}` 를 실행한다. implement는 fix-request.md를 감지하면 **수정 모드**로 동작한다:
   - Stage 1~3 건너뜀 (기존 select.md, plan.md 재사용)
   - Stage 4에서 fix-request.md의 항목만 수정
   - Stage 5에서 dev test 재실행
3. Dev test 통과 후 다시 `/qa {component_id}` 실행
4. **최대 3회** 반복. 3회 후에도 FAIL이면 이슈를 기록하고 사용자에게 보고한다.

### 수정 모드 (implement가 감지)

`specs/implementation-logs/{component_id}/fix-request.md`가 존재하면:
- implement는 수정 모드로 진입한다.
- 기존 구현을 기반으로 fix-request의 항목만 수정한다.
- 커밋 메시지에 `fix({component_id})` prefix를 사용한다.

---

## 에러 처리

- **component_id 없음**: 자동 선택 시 dev-test.md가 있는 컴포넌트가 없으면 "검증 대상이 없습니다." 출력 후 중단.
- **dev-test.md 없음**: "/implement를 먼저 실행해주세요." 출력 후 중단.
- **리서치 문서 없음**: Acceptance Criteria 없이 엣지 케이스와 통합 테스트만 수행. 리포트에 "Acceptance Criteria 미검증" 명시.
- **테스트 실행 실패**: 테스트 프레임워크 설정 문제인 경우, 설정을 수정하거나 수동 검증으로 대체. 리포트에 기록.
- **수정 사이클 3회 초과**: "3회 수정 시도 후에도 미해결 이슈가 있습니다." 보고 후 중단. 이슈 목록을 사용자에게 전달.
