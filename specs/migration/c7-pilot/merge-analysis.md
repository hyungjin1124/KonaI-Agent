# C7 파일럿: diff-viewer 분석 리포트

- 날짜: 2026-04-07
- 쌍: `docs/research/skill-management/diff-viewer-patterns-R2.md` ↔ `Vault/리서치/Insights/agent-ui/patterns/diff-review-patterns.md`
- 목적: duplication-report.md §3 C 카테고리 병합 정책의 파일럿. 이 쌍에서 얻은 경험을 나머지 C1·C2·C3·C4·C5·C6·C8에 일반화한다.

---

## 0. 결론 선언 (TL;DR)

**이 쌍은 중복이 아니다.** 파일명이 비슷해서 "주제 중복"으로 분류됐지만, 실제 내용은 **서로 다른 사용자 시나리오**를 다룬다.

- **Vault `diff-review-patterns.md` (12KB)** — **Edit flow**. Agent가 생성한 artifact를 user가 하이라이트해서 수정 지시를 내리는 "AI-assisted inpainting" 패턴. Claude Artifacts, ChatGPT Canvas, Cursor, v0, Copilot Workspace의 **직접 편집 UX** 비교.
- **docs `diff-viewer-patterns-R2.md` (31KB)** — **Review flow**. 스킬(SKILL.md) 버전 이력을 PM·기획자가 비교·검토하는 "version diff viewer" 패턴. GitHub, Google Docs, Notion, WordPress, Confluence의 **버전 비교 UX** 리서치.

두 파일은 diff라는 단어만 공유할 뿐, **대상 artifact도 다르고**(agent output vs skill version), **사용자 목적도 다르고**(편집 vs 리뷰), **비교하는 경쟁사도 완전히 다르다**. 병합하면 오히려 두 관점이 뒤섞여 문서가 망가진다.

**올바른 조치: 분리 이관(split migration)**. Vault에 기존 파일을 유지하고, docs 문서는 **신규 Vault 파일**로 이관한다. 두 파일을 서로 `related_patterns` 프론트매터로 연결한다.

---

## 1. 내용 구조 비교

| 항목 | Vault `diff-review-patterns.md` | docs `diff-viewer-patterns-R2.md` |
|---|---|---|
| 주제 | Agent output을 user가 수정하는 inline edit 패턴 | 스킬 버전(v1 → v2) 비교 리뷰 UX |
| 경쟁사 | Claude Artifacts, ChatGPT Canvas, Cursor, v0, Copilot Workspace | GitHub, Google Docs, Notion, WordPress, Confluence |
| 사용자 시나리오 | "방금 AI가 뽑은 outline의 이 섹션만 고쳐줘" | "어제 v3 → 오늘 v4로 뭐가 바뀌었는지 PM이 검토" |
| 핵심 UI 패턴 | Highlight-to-Edit, Direct Manipulation, Per-Hunk Diff, Prompt-Only, File-by-File | Unified/Split view, word-level diff, rendered vs raw, fold/expand, side-by-side |
| 비교 대상 단위 | selection(영역) + instruction | v1 전문 ↔ v2 전문 |
| KonaI-Agent 적용 | artifact panel inpainting | 스킬 상세 화면의 버전 히스토리 탭 |
| catalog 연결 | `inline_edit` 컴포넌트 | (현재 미연결 — skill 버전 UI 쪽) |
| 크기 | 12,126 B | 31,855 B |
| 작성 시점 | 2026-02-15 | 2026-03-25 |

**관찰 1**: 두 파일의 frontmatter/형식이 전혀 다르다. Vault는 YAML frontmatter + insight-synthesis 템플릿, docs는 플레인 markdown. 이건 Vault가 "raw/insight 계층"으로 정리된 반면, docs는 "one-shot research report"이기 때문이다. 이 차이는 나머지 C 쌍 전부에서 동일하게 나타날 가능성이 크다.

**관찰 2**: "비개발자"라는 docs의 타겟 키워드는 Vault에 없다. Vault는 "developer-friendly AI tools"를, docs는 "non-developer skill version review"를 다룬다. **사용자 층이 다르다.**

**관찰 3**: 중첩되는 경쟁사가 **0개**다. Vault는 AI-native 도구, docs는 전통 CMS·위키. 레퍼런스 목록도 완전히 분리.

---

## 2. 중복이 아니라면 왜 파일명이 같을까

"diff"라는 키워드가 두 영역 모두에서 쓰이기 때문. 영어 "diff"는 본래 동사·명사 모호하다:
- Vault가 쓰는 "diff review" = "AI가 제안한 변경안 리뷰" (before/after 제안)
- docs가 쓰는 "diff viewer" = "두 버전 사이 변경사항 뷰어" (v1/v2 비교)

duplication-report.md가 파일명만 보고 "주제 동일"로 묶은 것은 **휴리스틱 오탐**. Phase 2 진단에서는 이 레벨까지 못 봤음. C 카테고리의 다른 쌍들도 비슷한 오탐이 있을 수 있으니, **파일럿 결과를 토대로 duplication-report.md의 C 카테고리를 재검토**해야 한다 (아래 §5 참조).

---

## 3. 권장 조치

### 3-1. Vault 기존 파일: 그대로 유지
`Vault/리서치/Insights/agent-ui/patterns/diff-review-patterns.md`는 건드리지 않는다. 프론트매터에 `related_patterns: [version-diff-viewer]` 한 줄만 추가.

### 3-2. docs 파일: 신규 Vault 파일로 이관
목적지: `Vault/리서치/Insights/agent-ui/patterns/version-diff-viewer-patterns.md` (신규)

이관 시 변환:
1. **프론트매터 추가** — insight-synthesis 템플릿을 따라 topic_id, category, status, last_updated 등 채움
2. **"3. KonaI-Agent 적용 권장안" 섹션은 분리** — ADR로 이동 (§3-3)
3. 섹션 1, 2, 4 (경쟁사 분석 + 패턴 비교 + 핵심 인사이트)만 Vault 파일에 남김 — "일반 패턴" 계층
4. 제목 변경: "비개발자 대상 자연어 diff 뷰어 UX 리서치" → "Version Diff Viewer Patterns for Prose (Non-Developer)"
5. 참고 링크는 References 섹션으로 정리
6. `related_patterns: [diff-review-patterns]` 추가 — 두 파일을 상호 링크

### 3-3. KonaI-Agent 적용 결정: ADR 신규 생성
목적지: `docs/20-decisions/ADR-0001-skill-version-diff-viewer.md` (신규 — 현재 `docs/20-decisions/` 폴더도 없으므로 함께 생성)

내용:
- Context: 스킬 버전 이력 diff 뷰어 설계 결정이 필요한 배경
- Decision: "Confluence + Google Docs 하이브리드" 패턴 채택 (word-level + rendered WYSIWYG + fold)
- Consequences: 구현 복잡도, 접근성, 한국어 특성 반영
- `obsidian_sources: [리서치/Insights/agent-ui/patterns/version-diff-viewer-patterns.md]` 백링크

docs 원본 섹션 3의 "3.1 패널 권장안", "3.2 전체 확장 권장안", "3.3 AI 요약 연동", "3.4 렌더링 vs 원문"이 ADR의 Decision 본문이 된다.

### 3-4. docs 원본 처리
`docs/research/skill-management/diff-viewer-patterns-R2.md`는 ADR 생성 후 **삭제**한다. 히스토리는 git log로 복원 가능하므로 archive 불필요. 다만 Step 1·2처럼 conservative를 원하면 `docs/research/skill-management/archive/` 이동도 가능.

---

## 4. 파일럿이 드러낸 규칙

이 쌍에서 얻은 규칙 4가지를 C1~C8 전체에 적용한다:

### 규칙 1: "주제 중복"은 `diff --brief` 수준으로는 판정 불가
파일명·경쟁사·목차까지 확인해야 "같은 주제를 다른 각도로" vs "다른 주제인데 키워드만 겹침"이 구분된다. 기계적 파일명 매칭으로는 둘을 혼동한다.

### 규칙 2: C 카테고리의 기본 조치는 "병합(merge)"이 아니라 "분리(split)"이다
- 병합: 두 파일이 같은 주제를 다루되 관점이 상호 보완일 때
- 분리: 두 파일이 "비슷해 보이는 서로 다른 주제"일 때 — 각자 Vault 신규 파일로 이관, 상호 링크

C7에서 확인된 건 분리 케이스. 다른 쌍이 병합인지 분리인지는 **각각 내용을 직접 비교해야 판정 가능**하다.

### 규칙 3: 모든 docs→Vault 이관은 3단계 구조로
- **일반 패턴 (Vault)**: 경쟁사·트렌드·패턴 분류 — long-lived
- **KonaI-Agent 적용 결정 (ADR)**: 왜 그 중에서 X를 골랐는지 — decision record, 바뀌면 새 ADR
- **구현 세부 (specs/component-catalog.yaml)**: acceptance criteria, status — 자동화 파이프라인용

하나의 docs 파일에 이 세 개가 섞여 있으면 이관 시 반드시 분리한다. C7 docs 파일이 전형적인 예시 (섹션 1-2 = 패턴, 섹션 3 = 결정, 섹션 4 = 인사이트로 패턴 재확인).

### 규칙 4: 프론트매터 템플릿은 Vault insight-synthesis를 따른다
Vault 쪽은 이미 일관된 YAML 템플릿(type, topic_id, category, document_level, parent_broad, catalog_components, tags, status, confidence, last_updated, source_products, source_files, auto_update, relevant_roles)을 쓰고 있다. docs→Vault 이관 파일도 동일 템플릿으로 prepend해야 그래프뷰·태그·로봇 커맨드가 모두 동작한다.

---

## 5. duplication-report.md 수정 제안

파일럿 결과로 C 카테고리 분류를 재검토해야 한다. 특히:

- **C7**: "append/merge" → "split + cross-link" (이번 파일럿으로 확정)
- **C1·C2·C3·C4**: 같은 휴리스틱 오탐 가능성. 파일 내용 비교 후 split인지 merge인지 재판정
- **C5·C6**: docs가 Vault 파일보다 훨씬 상세한 케이스 — 이 두 개가 진짜 merge 케이스일 가능성 높음
- **C8**: docs 3개를 Vault 1개에 통합 — 진짜 merge 케이스

C 카테고리 8쌍 중 **실제 merge는 3~4쌍**, 나머지는 split일 가능성. 이 가설을 C1 한 쌍 더 검증해야 확정된다.

---

## 6. 다음 액션

**단기 (이번 세션에서)**
1. 본 analysis 문서에 사용자 승인 받기
2. 승인 후 `c7-pilot/version-diff-viewer-patterns.md` 초안 생성 (Vault로 갈 파일 프리뷰)
3. 승인 후 `c7-pilot/ADR-0001-skill-version-diff-viewer.md` 초안 생성
4. 둘 다 승인되면 실제 Vault/docs로 배포하는 `step3-c7-migration.sh` 작성 및 실행

**중기**
5. 같은 방법으로 C1 파일럿 (01-dashboard.md ↔ dashboard-composition.md) 실시. split인지 merge인지 재판정.
6. C1 결과에 따라 duplication-report.md §3 C 카테고리 재분류
7. 재분류된 C 카테고리 8쌍에 각각 split/merge 절차 적용

**장기**
8. C 카테고리 처리 완료 후 D-1, D-2, D-3, D-4, D-6, D-7 일괄 이관 (Step 3 원래 계획)
9. Step 4 (catalog 경로 치환 + 심볼릭 링크)
10. Step 5 (스키마 문서 갱신, WIKI.md)
