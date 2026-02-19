# Research Pipeline — 리서치 브리프 생성

특정 주제에 대해 경쟁사 분석, 패턴 분석, KonaI-Agent 적용 전략을 담은
리서치 브리프를 생성하고 카탈로그를 갱신한다.

**인자**: `$ARGUMENTS`

---

## 입력 분류

`$ARGUMENTS`를 분석하여 리서치 모드를 결정한다.

### 판별 절차

1. `specs/component-catalog.yaml`에서 `$ARGUMENTS`와 일치하는 component id를 검색한다.
2. 일치하는 id가 있으면 → **컴포넌트 모드**
3. 일치하는 id가 없으면 → **자유 주제 모드**
4. `$ARGUMENTS`가 비어있으면 → 에러: "리서치 주제를 지정해주세요." 출력 후 중단.

---

## Stage 1 — 주제 분석

### 컴포넌트 모드

카탈로그에서 해당 컴포넌트 정보를 추출한다:
- `id`, `name`, `description`, `status`, `priority`, `complexity`
- `contexts`, `dependencies`, `obsidian_sources`
- `last_researched` (있으면)

기존 `obsidian_sources`가 있으면 **업데이트 모드**, 없으면 **신규 생성 모드**로 진행한다.

Vault의 `Insights/agent-ui/patterns/_CONTEXT.md`에서:
- 해당 컴포넌트의 topic registry 항목 확인
- `parent_broad` 필드로 관련 broad 문서 식별

### 자유 주제 모드

카탈로그 전체를 스캔하여 관련 컴포넌트를 탐색한다:
- 모든 컴포넌트의 `name`, `description`과 `$ARGUMENTS`를 매칭
- 관련 컴포넌트가 있으면 함께 묶어서 리서치 (하나의 리서치 문서가 여러 컴포넌트를 커버할 수 있음)
- 관련 컴포넌트가 없으면 새 컴포넌트 추가를 전제로 리서치 진행

`_CONTEXT.md`에서 관련 카테고리 및 broad 문서를 탐색한다.

### 출력

리서치 범위 정의:
- 대상 컴포넌트 ID 목록 (또는 "신규")
- 관련 broad 문서 경로
- 검색 키워드 (경쟁사명, 패턴명, 기술명)
- 모드 (신규 생성 | 업데이트)

---

## Stage 2 — 컨텍스트 수집

### 2-1. Vault 내부 컨텍스트

Vault 경로: CLAUDE.md의 Obsidian Vault 경로 참조.

**AGENTS.md 라우팅**:
- Vault 루트의 `AGENTS.md`에서 `frontend_agent` 역할의 `primary_sources` 확인
- Stage 1에서 식별된 broad 문서를 읽는다
- broad 문서의 TL;DR과 관련 섹션에서 해당 주제의 상위 맥락을 파악한다

**기존 리서치 문서** (업데이트 모드):
- `obsidian_sources`에 명시된 기존 문서를 전체 읽기
- 현재 내용의 강점과 약점 파악
- 어떤 부분이 outdated인지 식별

**제품 프로필**:
- `AI Agent Products/` 디렉토리에서 관련 경쟁사 프로필 확인
- 해당 제품의 상세 분석 중 관련 패턴 섹션 읽기

### 2-2. 외부 소스

웹 리서치로 최신 정보를 수집한다:

- **경쟁사 공식 문서**: 해당 패턴의 구현 상세, API 문서, 디자인 가이드
- **릴리즈 노트/블로그**: 최근 변경사항, 도입 배경, 설계 의도
- **오픈소스**: GitHub 레포지토리, 관련 라이브러리 README, 예제 코드
- **기술 분석**: 서드파티 분석 기사, 비교 리뷰, 벤치마크

수집 기준:
- 최소 4~6개 경쟁사/제품의 구현 사례
- 각 사례에서 "어떻게 구현했는가"와 "왜 그 방식인가" 모두 파악
- 출처 URL을 반드시 기록

### 출력

수집된 컨텍스트를 세션 내에 유지한다. 별도 파일 생성 없이 Stage 3으로 진행한다.

---

## Stage 3 — 리서치 브리프 작성

### 3-1. 문서 경로 결정

Vault 경로를 CLAUDE.md에서 확인한 뒤, 다음 규칙으로 파일 경로를 결정한다:

- 신규 생성: `{VAULT_PATH}/Insights/agent-ui/patterns/{topic-slug}.md`
- 업데이트: 기존 `obsidian_sources` 경로의 파일을 덮어쓰기

topic-slug는 kebab-case로 작성한다 (예: `citation-source-link`, `voice-agent-interaction`).

### 3-2. Frontmatter 작성

`_TEMPLATE_pattern.md`의 frontmatter 스키마를 따른다:

```yaml
---
type: insight-synthesis
topic_id: "{topic-slug}"
topic_name: "{주제 표시명}"
category: agent-ui
document_level: specific
parent_broad:
  - "{parent-broad-topic-id}"
catalog_components:
  - "{component-id-1}"
  - "{component-id-2}"
tags:
  - insight
  - agent-ui
  - pattern
  - "{추가 태그}"
status: draft
confidence: medium
last_updated: "{오늘 날짜}"
source_products: ["{product-slug-1}", "{product-slug-2}"]
source_files: []
auto_update:
  enabled: true
  keywords: ["{키워드1}", "{키워드2}"]
  feeds: []
  review_trigger:
    mode: "auto"
    threshold: 3
    priority_override: true
relevant_roles:
  - frontend_agent
---
```

### 3-3. 본문 작성

`_TEMPLATE_pattern.md`의 본문 구조를 따른다. 각 섹션의 작성 기준:

**TL;DR** (4-5 bullet):
- 모든 bullet에 인라인 출처([^N]) 필수
- Claude Code가 이것만 읽어도 구현 방향을 판단할 수 있어야 함
- 경쟁사 분석 요약 + KonaI-Agent 권장 방향 포함

**Overview** (1-2 문단):
- 이 패턴의 산업 배경
- KonaI-Agent에서 이 패턴이 필요한 이유와 시나리오

**경쟁사 구현 분석**:
- 비교 매트릭스 (최소 4~6개 제품)
- 제품별 상세 분석 (각 300자 이상)
- 각 구현의 "왜 이 방식인가" 분석 필수

**패턴 분류 및 트레이드오프**:
- 발견된 접근법을 2~4가지 패턴으로 분류
- 각 패턴의 장단점, 적합한 상황
- 테이블 형태로 비교

**KonaI-Agent 적용 전략**:
- 현재 코드베이스 상태 (source_files 기반)
- 권장 접근 (패턴 선택 + 기술 스택 결정)
- Acceptance Criteria (검증 가능한 기준, 체크리스트 형태)

**Key Considerations**:
- 구현 시 주의사항
- 성능, 접근성, 확장성 관련 사항

**References**:
- 각주 형태로 모든 출처 정리

### 3-4. 품질 기준

작성된 문서가 다음 기준을 충족하는지 확인한다:
- 총 200줄 이상 (복잡한 주제는 300줄 이상)
- 비교 매트릭스에 최소 4개 제품
- 모든 주장에 출처 인라인 각주
- Acceptance Criteria가 구체적이고 검증 가능
- "코드 스니펫" 없음 — 이것은 리서치 브리프이지 구현 가이드가 아님

업데이트 모드인 경우:
- 기존 내용 중 여전히 유효한 부분은 보존
- 변경된 부분만 업데이트하거나, 변경이 50% 이상이면 전면 재작성
- 문서 하단에 업데이트 이력 추가

---

## Stage 4 — 카탈로그 갱신

`specs/component-catalog.yaml`을 업데이트한다.

### 기존 컴포넌트 리서치인 경우

```yaml
# 변경 항목:
obsidian_sources:
  - "Insights/agent-ui/patterns/{topic-slug}.md"   # 추가 또는 유지
last_researched: "{오늘 날짜}"                       # 추가 또는 갱신
```

추가 변경 (리서치 결과에 따라):
- `priority`: 리서치에서 발견된 중요도에 따라 조정
- `complexity`: 구현 난이도 재평가
- `status`: implemented인데 개선 필요하면 `needs_update`로 변경

### 새 주제 리서치인 경우

적절한 카테고리에 새 컴포넌트 항목을 추가한다:

```yaml
- id: "{snake_case_id}"
  name: "{Component Name}"
  description: "{한줄 설명}"
  status: not_implemented
  priority: "{리서치에서 판단한 priority}"
  complexity: "{리서치에서 판단한 complexity}"
  contexts: ["{관련 context}"]
  source_files: []
  obsidian_sources:
    - "Insights/agent-ui/patterns/{topic-slug}.md"
  last_researched: "{오늘 날짜}"
```

`metadata.last_updated`도 오늘 날짜로 갱신한다.

---

## Stage 5 — _CONTEXT.md 동기화

Vault의 `Insights/agent-ui/patterns/_CONTEXT.md`를 업데이트한다.

### topic registry 업데이트

신규 문서인 경우:
- 적절한 카테고리의 topic registry에 새 항목 추가
- `catalog_components`와 `parent_broad` 매핑 설정

업데이트인 경우:
- 기존 항목의 `catalog_components` 목록 확인 및 필요시 추가

### AGENTS.md 확인

새 문서가 `AGENTS.md`의 `frontend_agent` secondary_sources에 포함될 필요가 있는지 판단한다.
포함이 필요하면 사용자에게 AGENTS.md 수정을 제안한다 (직접 수정하지 않는다).

---

## 출력

### 터미널 출력

```
═══════════════════════════════════════════════
 Research Complete: {topic_name}
═══════════════════════════════════════════════
 Mode        : {new | update}
 Document    : Insights/agent-ui/patterns/{topic-slug}.md
 Lines       : {N} lines
 Components  : {관련 component_id 목록}
 Catalog     : {변경 사항 요약}
 Next        : /implement {component_id}
═══════════════════════════════════════════════
```

### Git Commit

```
research({topic-slug}): {create | update} research brief

- Components: {component_id 목록}
- Catalog: {변경 요약}
- See Insights/agent-ui/patterns/{topic-slug}.md
```

---

## Stage 6 — 다음 액션 체이닝

리서치 완료 후, 관련 컴포넌트의 구현을 제안한다.

### 체이닝 대상 판별

카탈로그에서 이 리서치와 관련된 컴포넌트 중 구현 가능한 항목을 확인한다:
- `status`가 `not_implemented` 또는 `needs_update`
- `obsidian_sources`가 방금 생성/갱신된 문서를 포함
- `dependencies`가 모두 충족

### 실행 제안

```
리서치 완료. 관련 구현 대상:
  1. /implement {component_id_1} — {name} (priority: {p}, complexity: {c})
  2. /implement {component_id_2} — {name} (priority: {p}, complexity: {c})

실행할 항목을 선택해주세요:
  - all: 전부 순서대로 실행
  - 1: 선택한 번호만 실행
  - none: 리서치만 완료하고 종료
```

사용자가 선택하면 해당 `/implement` 를 순서대로 실행한다.

---

## 에러 처리

- **인자 없음**: "리서치 주제를 지정해주세요. 예: `/research citation_source_link` 또는 `/research voice-agent-interaction`" 출력 후 중단.
- **Vault 경로 없음**: CLAUDE.md에서 Vault 경로를 찾을 수 없으면 사용자에게 경로를 물어본다.
- **_TEMPLATE_pattern.md 없음**: 경고 출력 후 기본 구조로 문서를 생성한다.
- **웹 리서치 실패**: Vault 내부 소스(AI Agent Products/, broad 문서)만으로 진행. 외부 소스 부족을 문서에 명시한다.
- **기존 문서 충돌**: 업데이트 모드에서 기존 문서가 예상 구조와 다르면, 백업 파일(`{slug}.backup.md`)을 생성한 뒤 진행한다.
