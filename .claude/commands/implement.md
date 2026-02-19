# Component Implementation Pipeline

주어진 컴포넌트 ID를 기반으로 5단계 파이프라인을 실행하여 컴포넌트를 구현한다.

**Target Component**: `$ARGUMENTS`

---

## Stage 1 — Select (타겟 선정)

`specs/component-catalog.yaml`에서 타겟 컴포넌트 정보를 추출한다.

### 실행 절차

1. `specs/component-catalog.yaml` 파일을 읽는다.
2. `$ARGUMENTS`에 해당하는 component id를 찾는다.
3. 다음 정보를 추출한다:
   - `id`, `name`, `description`
   - `status` (이미 implemented이면 중단하고 사용자에게 알린다)
   - `priority`, `complexity`
   - `contexts` (이 컴포넌트가 사용되는 화면)
   - `source_files` (기존 관련 파일)
   - `obsidian_sources` (리서치 문서 경로)
   - `dependencies` (선행 컴포넌트)
4. `dependencies`에 명시된 컴포넌트가 `implemented` 또는 `partial` 상태인지 확인한다.
   - 미구현 의존성이 있으면 경고를 출력하고, 의존성 없이 구현 가능한 범위를 판단한다.

### 출력

`specs/implementation-logs/{component_id}/select.md` 파일을 생성한다:

```markdown
# Select: {component_name}

- **ID**: {id}
- **Status**: {status}
- **Priority**: {priority}
- **Complexity**: {complexity}
- **Contexts**: {contexts}
- **Dependencies**: {dependencies + 각각의 현재 status}
- **Obsidian Sources**: {obsidian_sources}
- **Existing Source Files**: {source_files}
```

---

## Stage 2 — Analyze (컨텍스트 수집)

리서치 문서와 코드베이스를 분석하여 구현에 필요한 컨텍스트를 수집한다.

### 2-1. 리서치 컨텍스트 수집

`obsidian_sources`에 명시된 리서치 문서를 읽는다.
경로는 Obsidian Vault 루트 기준 상대 경로이다.

> **Vault 경로 결정**: CLAUDE.md의 `$OBSIDIAN_VAULT_PATH` 설명을 참조한다.
> 경로를 찾을 수 없으면 사용자에게 Vault 경로를 물어본다.

리서치 문서에서 다음을 추출한다:
- **TL;DR**: 핵심 요약 (구현 방향 판단 기준)
- **경쟁사 구현 분석 > 비교 매트릭스**: 제품별 구현 방식
- **패턴 분류 및 트레이드오프**: 접근법별 장단점
- **KonaI-Agent 적용 전략 > 권장 접근**: 기술 선택 사항
- **KonaI-Agent 적용 전략 > Acceptance Criteria**: 구현 검증 기준

### 2-2. 코드베이스 컨텍스트 수집

프로젝트 코드베이스를 스캔하여 기존 패턴을 파악한다.

1. **같은 context의 기존 컴포넌트 분석**
   - catalog에서 동일 `contexts`를 가진 `implemented` 상태 컴포넌트를 찾는다.
   - 해당 컴포넌트의 `source_files`를 읽어서 파일 구조, import 패턴,
     Props 인터페이스 설계 방식을 파악한다.
   - 최소 2~3개 기존 컴포넌트를 샘플링한다.

2. **의존 컴포넌트 인터페이스 확인**
   - `dependencies`에 명시된 컴포넌트가 구현되어 있으면 해당 파일을 읽어서
     export된 컴포넌트와 Props 타입을 파악한다.

3. **공통 패턴 추출**
   - `src/components/ui/` 디렉토리를 스캔하여 사용 가능한 기본 UI 컴포넌트 목록 파악
   - `src/types/` 디렉토리에서 관련 타입 정의 확인
   - `src/hooks/` 디렉토리에서 재사용 가능한 Hook 확인

### 출력

이 단계의 출력은 별도 파일로 저장하지 않는다. 수집된 정보를 컨텍스트에 유지한 채
Stage 3으로 진행한다.

---

## Stage 3 — Plan (구현 설계)

Stage 2에서 수집한 컨텍스트를 기반으로 구현 계획을 수립한다.

### 설계 항목

1. **파일 구조 설계**
   - 생성할 파일 목록 (경로 포함)
   - 각 파일의 역할 (컴포넌트, Hook, 타입, 상수 등)
   - 기존 파일 중 수정이 필요한 파일 목록과 수정 내용 요약

2. **인터페이스 설계**
   - 메인 컴포넌트의 Props 타입 정의
   - 내부 서브컴포넌트가 필요하면 각각의 Props
   - 필요한 신규 타입/인터페이스

3. **상태 설계**
   - 컴포넌트 내부 state
   - 필요시 Context 또는 Hook으로 분리할 상태
   - 외부 데이터 연동 (API, props 등)

4. **통합 지점**
   - 이 컴포넌트를 렌더링할 상위 컴포넌트 (어디에 import하는가)
   - 라우팅 변경이 필요한 경우 해당 내용
   - 기존 컴포넌트와의 상호작용

5. **Acceptance Criteria 매핑**
   - 리서치 문서의 acceptance criteria 각 항목을 구현 계획의 어느 부분이 충족하는지 매핑

### 출력

`specs/implementation-logs/{component_id}/plan.md` 파일을 생성한다:

```markdown
# Plan: {component_name}

## 파일 구조
| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| src/components/features/... | 메인 컴포넌트 | 신규 |
| src/types/... | 타입 정의 | 신규 |
| src/components/features/.../index.tsx | 기존 뷰에 통합 | 수정 |

## Props Interface
\`\`\`typescript
interface {ComponentName}Props {
  // ...
}
\`\`\`

## 상태 설계
- ...

## 통합 지점
- ...

## Acceptance Criteria 매핑
| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | ... | ... |
```

---

## Stage 4 — Implement (코드 생성)

Plan에 따라 feature branch에서 코드를 작성한다.

### 실행 절차

1. **브랜치 생성**
   ```
   git checkout -b feature/{component_id}
   ```

2. **코드 작성**
   - Plan의 파일 구조에 따라 파일을 생성한다.
   - 기존 코드베이스의 컨벤션을 따른다 (CLAUDE.md 참조).
   - 리서치 문서의 "권장 접근"에 명시된 기술 선택을 우선한다.

3. **작성 순서** (권장)
   - 타입 정의 → Hook (있으면) → 서브 컴포넌트 → 메인 컴포넌트 → 통합 (기존 파일 수정)

4. **코드 작성 규칙**
   - 컴포넌트는 함수형 컴포넌트로 작성한다.
   - Props에는 TypeScript interface를 사용한다.
   - Tailwind CSS로 스타일링한다. 인라인 style은 동적 값만 허용한다.
   - 가능하면 `src/components/ui/`의 기존 Radix 래퍼를 재사용한다.
   - 하드코딩된 문자열은 상수로 분리를 고려한다.
   - 접근성(a11y)을 고려한다: aria 속성, 키보드 네비게이션.

---

## Stage 5 — Dev Test (개발자 테스트)

개발자 관점에서 구현 코드의 기술적 정합성, 단위 테스트, 기능 충족을 검증한다.
이 단계는 개발자가 자기 코드를 검증하는 단계이다. QA 검증은 별도 `/qa` 커맨드에서 수행한다.

### 5-1. 정적 분석

다음 커맨드를 순서대로 실행한다:

```bash
# TypeScript 컴파일 체크
npx tsc --noEmit

# ESLint 체크
npx eslint src/components/features/{관련경로} --ext .ts,.tsx

# 빌드 체크
npm run build
```

- 에러가 발생하면 수정 후 재실행한다.
- 최대 3회 반복 후에도 해결 안 되면 에러 내용을 사용자에게 보고한다.

### 5-2. 단위 테스트 작성 및 실행

구현한 컴포넌트에 대해 테스트를 작성한다.

**테스트 파일 위치**: 컴포넌트와 같은 디렉토리에 `{ComponentName}.test.tsx`

**필수 테스트 항목**:
- 컴포넌트가 에러 없이 렌더링되는가 (smoke test)
- Props에 따라 올바른 UI가 렌더링되는가
- 사용자 인터랙션(클릭, 입력 등)이 올바르게 동작하는가
- 에러/엣지 상태(빈 데이터, 로딩 등)가 올바르게 처리되는가
- 커스텀 Hook이 있으면 Hook 단독 테스트

**테스트 실행**:
```bash
npx jest --testPathPattern={component_path} --passWithNoTests
```

- 테스트 실패 시 구현 코드 또는 테스트 코드를 수정한다.
- 최대 3회 반복 후 해결 안 되면 실패 항목을 기록하고 계속 진행한다.

### 5-3. Acceptance Criteria 자가 검증

리서치 문서의 Acceptance Criteria를 하나씩 대조한다.

각 criteria에 대해:
1. 해당 기능이 코드에 구현되어 있는지 정적 분석으로 확인
2. 테스트에서 커버되고 있는지 확인
3. `PASS` / `PARTIAL` / `FAIL` 판정
4. FAIL 항목이 있으면 Stage 4로 돌아가서 보완한다 (최대 2회 반복).

### 5-4. 카탈로그 갱신

모든 dev test 통과 후:

1. `specs/component-catalog.yaml`에서 해당 컴포넌트를 업데이트한다:
   - `status`: `implemented` 또는 `partial` (PARTIAL이 있으면)
   - `source_files`: 새로 생성한 파일 경로 추가
   - `metadata.last_updated`: 오늘 날짜

2. git commit을 생성한다:
   ```
   feat({component_id}): implement {component_name}

   - Pipeline: Select → Analyze → Plan → Implement → Dev Test
   - Acceptance Criteria: X/Y passed
   - Tests: N tests written, M passed
   - See specs/implementation-logs/{component_id}/ for details
   ```

### 5-5. Dev Test 리포트 생성

`specs/implementation-logs/{component_id}/dev-test.md` 파일을 생성한다:

```markdown
# Dev Test Report: {component_name}

## 정적 분석
- TypeScript: PASS/FAIL
- ESLint: PASS/FAIL
- Build: PASS/FAIL

## 단위 테스트
| # | 테스트명 | 결과 |
|---|---------|------|
| 1 | renders without error | PASS |
| 2 | ... | ... |

- 총 테스트: {N}개
- 통과: {N}개, 실패: {N}개

## Acceptance Criteria 자가 검증
| # | Criteria | 코드 구현 | 테스트 커버 | 판정 |
|---|----------|----------|-----------|------|
| 1 | ... | {파일:라인} | {테스트명} | PASS |

## QA 전달 사항
- 구현에서 특히 확인이 필요한 부분: {개발자가 QA에게 전달할 메모}
- 알려진 제한사항: {있으면 기술}
```

### 출력

최종 dev test 결과를 터미널에 출력한다:

```
═══════════════════════════════════════════════
 Dev Test Complete: {component_name}
═══════════════════════════════════════════════
 Status      : implemented | partial
 Files       : N files created, M files modified
 Build       : PASS
 TypeCheck   : PASS
 Lint        : PASS
 Unit Tests  : N/M passed
 Acceptance  : X/Y criteria passed (self-check)
 Branch      : feature/{component_id}
 Logs        : specs/implementation-logs/{component_id}/
 Next        : /qa {component_id}
═══════════════════════════════════════════════
```

---

## 자동 선정 모드 (인자 없이 실행 시)

`$ARGUMENTS`가 비어있으면 자동 선정 모드로 동작한다.

### 선정 로직

1. `specs/component-catalog.yaml`에서 모든 컴포넌트를 로드한다.
2. 다음 조건으로 필터링한다:
   - `status`가 `not_implemented` 또는 `research_needed`
   - `obsidian_sources`가 존재 (리서치 문서가 있어야 구현 가능)
3. 다음 기준으로 정렬한다:
   - `priority`: critical > high > medium > low
   - `complexity`: simple > moderate > complex > epic
4. `dependencies`를 확인한다:
   - 모든 의존성이 `implemented`인 컴포넌트를 우선 선정
   - 의존성이 미충족이면 건너뛴다
5. 최상위 1개를 선정하고 Stage 1 출력에 선정 사유를 포함한다.

---

## 수정 모드 (QA fix-request 감지)

`specs/implementation-logs/{component_id}/fix-request.md`가 존재하면 수정 모드로 진입한다.

### 수정 모드 절차

1. **Stage 1~3 건너뜀**: 기존 `select.md`, `plan.md`를 재사용한다.
2. **fix-request.md 로드**: QA가 발견한 이슈 목록과 수정 요청을 읽는다.
3. **Stage 4 (수정)**: fix-request의 항목만 수정한다. 기존 코드의 다른 부분은 건드리지 않는다.
4. **Stage 5 (Dev Test 재실행)**: 전체 dev test를 다시 실행한다.
5. **커밋**: `fix({component_id}): {수정 내용 요약}` 메시지로 커밋.
6. **fix-request.md 정리**: 수정된 항목에 체크 표시(`[x]`)를 추가한다.

수정 모드 완료 후 터미널 출력:

```
═══════════════════════════════════════════════
 Fix Complete: {component_name}
═══════════════════════════════════════════════
 Fixed       : {N}/{M} issues from QA
 Dev Test    : PASS/FAIL
 Next        : /qa {component_id} (재검증)
═══════════════════════════════════════════════
```

---

## 에러 처리

- **컴포넌트 ID를 찾을 수 없음**: 카탈로그에 없는 ID이면 유사한 ID를 제안하고 중단.
- **obsidian_sources 없음**: 리서치 문서가 없으면 경고 출력 후 Stage 2를 코드베이스 분석만으로 진행. Acceptance Criteria는 카탈로그의 description 기반으로 추론.
- **빌드/타입 에러 반복**: 3회 시도 후 실패 시 에러 리포트 생성 후 중단.
- **의존성 미충족**: 경고 출력, 의존성 없이 가능한 범위로 구현 범위를 축소.
- **fix-request 수정 실패**: 3회 시도 후 해결 안 되면 미해결 이슈를 사용자에게 보고.
