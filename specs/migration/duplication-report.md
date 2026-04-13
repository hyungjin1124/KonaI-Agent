# docs/ ↔ Obsidian Vault 중복 진단 리포트

- 생성일: 2026-04-06
- 목적: `docs/`를 Obsidian Vault로 이관하기 전, 두 위치의 문서를 주제별로 매칭하고 중복·유일·부분중복을 분류해 마이그레이션 규모와 병합 전략을 확정한다.
- 범위
  - `docs/research/`, `docs/design/`, `docs/planning/` (81개 .md, `docs/reports/`는 자동생성물이라 제외)
  - `Vault/리서치/Insights/` (79개 .md), `Vault/UI/` (15개 .md), `Vault/리서치 - 개인/` (24개 .md)
- 진단 도구: 파일 크기 비교, mtime 비교, MD5 해시 비교, diff 라인 수, 키워드 매칭

---

## 0. 결론 요약 (Executive Summary)

| 카테고리 | 건수 | 조치 |
|---|---|---|
| **A. 완전 중복 (MD5 동일)** | 2쌍 | docs 원본 유지, Vault 사본 삭제 후 심볼릭 링크로 재연결 |
| **B. 갈라진 중복 (diverged duplicate)** | 2쌍 | docs가 최신 — Vault 버전 archive로 이동 후 docs를 단일 진실로 병합 |
| **C. 주제 중복 (thematic overlap)** | 8쌍 | 관점이 다름 — Vault는 "일반 패턴", docs는 "KonaI-Agent 적용" 으로 역할 분리 후 양쪽 유지 |
| **D. docs에만 있음 (유일)** | 58건 | Vault 새 카테고리로 이관 |
| **E. Vault에만 있음 (유일)** | 62건+ | 그대로 유지 (raw 계층) |

**핵심 수치**
- docs/ 이관 대상 총 65개 파일(A 2 + B 2 + C의 docs 측 8 + D 58 중 docs측, 일부 중복 카운트). 순 이관 파일 = 62~63개 추정.
- 완전 동일한 바이너리 중복은 단 2개(`admin-ia.en.md`, `data-ia.en.md`). 나머지 divergence는 docs가 **더 새 버전**.
- Vault 쪽이 더 최신인 케이스 = **0건**. 즉, 이관 과정에서 Vault 쪽을 덮어쓰는 케이스만 발생한다. 데이터 손실 리스크 없음.

**즉시 결정 가능한 액션**
1. `Vault/UI/admin-ia.en.md`, `Vault/UI/data-ia.en.md` — 삭제 후 재연결 (MD5 동일이므로 리스크 제로).
2. `Vault/UI/data-ia.md`, `Vault/UI/03-skill-ia.md` — `Vault/UI/archive/`로 이동, docs 쪽을 단일 진실로 승격.
3. `docs/research/skill-management/` 21개 — Vault에 대응이 매우 약함. **새 카테고리 `Vault/리서치/Insights/skill-management-ux/`를 만들어 일괄 이관**.

---

## 1. 카테고리 A — 완전 중복 (MD5 동일)

바이트 단위로 동일. 이전에 한번 복사한 뒤 양쪽을 건드리지 않은 케이스.

| # | docs 경로 | Vault 경로 | 크기 | MD5 |
|---|---|---|---|---|
| A1 | `docs/design/ia-design/admin-ia.en.md` | `UI/admin-ia.en.md` | 56,984 B | `6746a462...8c942` |
| A2 | `docs/design/ia-design/data-ia.en.md` | `UI/data-ia.en.md` | 49,417 B | `f2c710e5...5e7a7` |

**권장 조치**: Vault 쪽 파일 삭제 → 이관 완료 후 `Vault/KonaI-Agent/설계/` 심볼릭 링크로 재노출. MD5 확인됐으므로 diff 리뷰 없이 즉시 처리 가능.

---

## 2. 카테고리 B — 갈라진 중복 (diverged duplicate)

과거 동기화됐던 파일이 한쪽에서만 계속 갱신되어 내용이 벌어진 케이스. **모든 경우 docs 쪽이 최신**.

| # | 파일 쌍 | docs 크기/mtime | Vault 크기/mtime | diff 라인 | 판정 |
|---|---|---|---|---|---|
| B1 | `docs/design/ia-design/data-ia.md` ↔ `UI/data-ia.md` | 50,787 B / 2026-04-02 10:11 | 30,172 B / 2026-04-01 14:15 | 999 | docs가 SoT |
| B2 | `docs/design/ia-design/skill-ia.md` ↔ `UI/03-skill-ia.md` | 78,760 B / 2026-04-02 10:11 | 29,549 B / 2026-03-24 09:41 | 1,366 | docs가 SoT, Vault는 v5 근방 |

**권장 조치**
1. `Vault/UI/data-ia.md`, `Vault/UI/03-skill-ia.md` → `Vault/UI/archive/`로 이동 (히스토리 보존).
2. docs 쪽 파일을 `Vault/KonaI-Agent/설계/`로 이관.
3. `specs/component-catalog.yaml`의 관련 엔트리 경로 일괄 치환.

---

## 3. 카테고리 C — 주제 중복 (thematic overlap)

> **⚠️ 2026-04-07 규칙 개정** — C7·C1 두 파일럿 실행 결과 기반
>
> 최초(2026-04-06) 설계는 "append/merge"를 섞어 제시했으나, C7과 C1 파일럿을 실제로 배포해본 결과 **파일명 유사성은 false-positive 신호**였다. 두 경우 모두 토픽 축이 직교(orthogonal)해서 merge가 불가능했고, split + 3-layer 구조가 정답이었다.
>
> **개정 규칙: C 카테고리 기본값 = Full Split (3-Layer)**
>
> 1. **Raw layer** — docs 원본을 Vault `Insights/{category}/sources/` 아래에 `raw-research` 프론트매터(`document_level: raw`, `status: archived`, `synthesized_into: [...]`, `auto_update.enabled: false`)로 보존 (1:1 복사)
> 2. **Synthesis layer** — docs + Vault 기존 synthesis를 재구성한 **신규 패턴 파일**을 Vault `Insights/{category}/`에 생성. `insight-synthesis` 프론트매터(`document_level: synthesis`, `parent_broad: {topic}`, `related_patterns: [...]`, `catalog_components: [...]`) 필수
> 3. **Decision layer** — KonaI-Agent 적용 결정이 명확한 경우에만 `docs/20-decisions/ADR-*.md` 생성 (선택). C1처럼 원본에 적용 전략이 없는 경우는 ADR 생략하고 `confidence: medium`으로 표시
> 4. **양방향 링크** — 기존 Vault synthesis 파일의 프론트매터 `related_patterns`에 신규 파일명 주입 필수 (Python inline injection)
> 5. **Merge가 허용되는 예외 조건** (모두 충족 시에만): 내용 중복 ≥70% AND 동일 layer(raw↔raw 또는 synthesis↔synthesis) AND 관점 축 동일
>
> C7·C1 모두 예외 조건을 만족하지 않아 split으로 처리됨. 아래 표의 "개정 전략" 컬럼은 이 규칙을 반영한 최종 결정이다.

| # | docs 파일 | Vault 대응 파일 | 관계 | **개정 전략 (2026-04-07)** | 상태 |
|---|---|---|---|---|---|
| C1 | `docs/research/ux-patterns/01-dashboard.md` (IA·메뉴 관점, 57KB) | `Insights/agent-ui/dashboard-composition.md` (위젯 합성 관점) | 관점 직교 (IA vs 합성 패러다임) | **Split**: raw→`agent-ui/sources/01-dashboard-ia-research.md`, synthesis→`agent-ui/home-dashboard-liveboard-ia-patterns.md` (신규, 8테마), 양방향 related_patterns 링크 | ✅ **배포완료** (파일럿 2호, 7/7 검증) |
| C2 | `docs/research/ux-patterns/03-skill.md` + `03-skill-more.md` (96KB) | `Insights/agent-skills/agent-skill-design.md`, `agent-marketplace-ecosystem.md`, `agent-ui/patterns/agent-marketplace-ui.md` | 경쟁사 범위 확장 | **Split 기본 적용**: raw→`agent-skills/sources/03-skill-ia-research.md`, synthesis→기존 Vault 파일 3개에 `related_patterns` 상호 링크 (신규 synthesis 파일은 내용 검토 후 판단) | ⏳ 대기 |
| C3 | `docs/research/ux-patterns/04-scheduled-tasks.md` (42KB) | `Insights/agent-ui/patterns/scheduled-agent-tasks.md` + `agent-task-scheduling.md` | Vault 쪽이 컴포넌트 세분화 | **Split 기본 적용**: raw→`agent-ui/sources/04-scheduled-tasks-ia-research.md`, 기존 두 synthesis 파일 갱신·링크 | ⏳ 대기 |
| C4 | `docs/research/ux-patterns/rag-knowledge-base-ui-patterns-2026-03-11.md` (30KB) | `Insights/knowledge-data/rag-architecture-comparison.md` + `agent-ui/patterns/knowledge-base-management-ui.md` | UI vs 아키텍처 관점 구분 | **Split 기본 적용**: raw→`knowledge-data/sources/rag-kb-ui-patterns.md`, 두 synthesis 모두 `related_patterns` 추가 | ⏳ 대기 |
| C5 | `docs/research/skill-management/skill-marketplace-ux-analysis.md` (36KB) | `Insights/agent-skills/agent-marketplace-ecosystem.md` (기술 생태계) + `patterns/agent-marketplace-ui.md` (UI) | 보완적 — docs가 UX 심층 | **Split 기본 적용**: raw→`agent-skills/sources/skill-marketplace-ux.md`, 기존 두 synthesis 링크 (merge 예외 조건 평가 필요 — UX 축이 유사하면 append 고려) | ⏳ 대기 |
| C6 | `docs/research/skill-management/skill-discovery-and-distribution-patterns.md` (45KB) | `Insights/agent-skills/agent-skill-design.md` 일부 | docs가 훨씬 상세 | **Split + 신규 synthesis**: raw→`agent-skills/sources/skill-discovery-distribution.md`, 신규 synthesis `agent-skills/skill-discovery-distribution-patterns.md` | ⏳ 대기 |
| C7 | `docs/research/skill-management/diff-viewer-patterns-R2.md` (31KB) | `Insights/agent-ui/patterns/diff-review-patterns.md` | 주제 동일하나 관점 축 다름 | **Split**: 신규 `agent-ui/patterns/version-diff-viewer-patterns.md`, 기존 `diff-review-patterns.md`에 `related_patterns` 주입, ADR-0001 생성 | ✅ **배포완료** (파일럿 1호, 6/6 검증) |
| C8 | `docs/research/skill-management/skill-versioning-eval-ui-patterns.md` + `skills-eval-ui-patterns.md` + `skill-versioning-with-eval-results.md` (74KB 합계) | `Insights/agent-ui/patterns/agent-self-review.md` (약한 연결) | 약한 중복 | **Split + 신규 synthesis**: raw 3개→`agent-ui/sources/`, 신규 synthesis `agent-ui/patterns/skill-eval-versioning-ui.md`, `agent-self-review.md`에 링크 | ⏳ 대기 |

**파일럿 검증 결과 (2/8 완료)**:
- C7 (2026-04-06): 6/6 verification OK, 파일 3개 생성 (synthesis, ADR, raw 보존 없음), docs 원본 삭제
- C1 (2026-04-07): 7/7 verification OK, 파일 2개 생성 + 폴더 1개 신설 (`agent-ui/sources/`), docs 원본 삭제

**공통 규칙 (개정)**:
1. 모든 C 케이스는 기본적으로 **Split**로 처리. Merge는 위 예외 조건 충족 시에만.
2. Raw layer 파일은 `auto_update.enabled: false` + `status: archived`로 프리즈.
3. Synthesis 파일의 `source_files`는 Vault 경로 기준(`'리서치/Insights/agent-ui/sources/...'`) 으로 기록.
4. 결정 요약 ADR은 **선택** — docs 원본에 KonaI-Agent 적용 전략이 명시된 경우에만 생성. 아니면 synthesis `confidence: medium`으로 표시하고 ADR 생략.
5. 이관 스크립트는 `step3-c{N}-migration.sh` 템플릿으로 표준화. 7-phase 구조(사전검증 → mkdir → cp synthesis → cp raw → inject related_patterns → rm docs → 사후검증 + MD5).

---

## 4. 카테고리 D — docs에만 있음 (Vault에 대응 없음)

### D-1. UX 리서치 (Vault `agent-ui/`에 대응 없음)

| docs 파일 | 크기 | 이관 목적지(제안) |
|---|---|---|
| `docs/research/ux-patterns/02-data.md` | 52KB | `Insights/knowledge-data/data-management-ia-comparison.md` |
| `docs/research/ux-patterns/05-admin.md` | 66KB | `Insights/platform-admin/enterprise-admin-ia-comparison.md` (신규 카테고리) |
| `docs/research/ux-patterns/06-gnb.md` | 48KB | `Insights/agent-ui/gnb-navigation-patterns.md` |
| `docs/research/ux-patterns/ai-summary-block-ui-patterns.md` | 27KB | `Insights/agent-ui/patterns/ai-summary-blocks.md` |

### D-2. 플랫폼 관리자 리서치 (Vault 카테고리 자체 없음 — **신규 카테고리 필요**)

| docs 파일 | 크기 |
|---|---|
| `docs/research/platform-admin/ai-platform-admin-dashboard-patterns.md` | 29KB |
| `docs/research/platform-admin/multi-tenant-lifecycle-and-extension-governance.md` | 48KB |
| `docs/research/platform-admin/platform-admin-patterns.md` | 19KB |
| `docs/research/platform-admin/tenant-lifecycle-ux-patterns.md` | 24KB |
| `docs/research/platform-admin/task2-supplementary-research-prompts.md` | 8KB |

→ 제안 목적지: `Vault/리서치/Insights/platform-admin/` (신규)

### D-3. 스킬 관리 UX 리서치 (대부분 유일 — **가장 큰 이관 덩어리**)

docs/research/skill-management/ **22개** 중 C5–C8에서 다룬 5개(marketplace-ux-analysis, discovery-and-distribution, diff-viewer, versioning-eval + skills-eval + versioning-with-eval)를 제외한 **17개**. 대부분 Vault `agent-skills/`가 4개뿐이라 대응이 없다.

- `skill-creator-ux-workflow-patterns.md` (37KB)
- `skill-ux-research-plan.md` (16KB)
- `skill-ux-research-prompts.md` (26KB)
- `skill-ux-supplemental-research.md` (16KB)
- `agent-skills-research.md` (28KB)
- `agent-skills-open-standard-analysis.md` (33KB)
- `anthropic-skill-creator-2026-march-update.md` (14KB)
- `file-explorer-and-viewer-R6.md` (25KB)
- `multi-tenant-extension-management-patterns.md` (28KB)
- `table-panel-layout-and-team-discovery-R1-R4.md` (38KB)
- `team-skill-sharing-patterns.md` (21KB)
- `usage-metrics-and-copy-ux-R3-R5.md` (30KB)
- `supplemental-research-G1-G4.md` (25KB)
- `research-prompts.md` (21KB)
- `task2-supplementary-research-prompts.md` (8KB)
- `task3-supplementary-research-prompts.md` (14KB)

→ 제안 목적지: `Vault/리서치/Insights/skill-management-ux/` (신규 서브카테고리)

### D-4. 경쟁사·Changelog·NVIDIA

| docs 파일 | 크기 | 목적지 |
|---|---|---|
| `docs/research/competitor/competitor-changelog-2026-03-26.md` | 9KB | `Vault/리서치/AI Daily News/2026-03-26.md`로 merge 또는 `Insights/market/changelog-digest.md` |
| `docs/research/competitor/competitor-changelog-2026-03-27.md` | 7KB | 동일 |
| `docs/research/competitor/supplementary-web-search-2026-03-28.md` | 9KB | 동일 |
| `docs/research/nvidia/nvidia-agent-toolkit.md` | 12KB | `Insights/open-source/nvidia-agent-toolkit.md` |
| `docs/research/nvidia/nvidia-agent-toolkit-deep.md` | 19KB | 동일 |

### D-5. IA 설계 문서 (KonaI-Agent 고유) — **wiki 계층의 핵심**

이것들이 Karpathy 패턴에서 "compiled wiki" 본체. 새 Vault 루트 `Vault/KonaI-Agent/설계/`로 이관.

| docs 파일 | 크기 | 목적지 |
|---|---|---|
| `docs/design/ia-design/information-architecture.md` | 23KB | `Vault/KonaI-Agent/설계/information-architecture.md` |
| `docs/design/ia-design/feature-architecture.md` | 16KB | `Vault/KonaI-Agent/설계/feature-architecture.md` |
| `docs/design/ia-design/menu-structure.md` | 6KB | `Vault/KonaI-Agent/설계/menu-structure.md` |
| `docs/design/ia-design/admin-ia.md` (한글 원본, 60KB) | 60KB | `Vault/KonaI-Agent/설계/admin-ia.md` |
| `docs/design/ia-design/skill-creation-protocol.md` | 47KB | `Vault/KonaI-Agent/설계/skill-creation-protocol.md` |
| `docs/design/ia-design/skill-creation-protocol-critique.md` | 11KB | 동일 경로 |
| `docs/design/ia-design/reference-from-plan.md` | 8KB | 동일 경로 |
| `docs/design/ia-research-plan.md` | 59KB | `Vault/KonaI-Agent/설계/ia-research-plan.md` |

(B1·B2에서 다룬 data-ia, skill-ia도 여기로 합류)

### D-6. Archive (과거 버전)

| 파일군 | 개수 | 목적지 |
|---|---|---|
| `docs/design/archive/*.md` | 6 | `Vault/KonaI-Agent/설계/archive/` |
| `docs/design/ia-design/archive/*.md` | 7 | 동일 (병합) |

### D-7. 기획 (Planning)

| docs 파일 | 크기 | 목적지 |
|---|---|---|
| `docs/planning/service-plan.md` | 29KB | `Vault/KonaI-Agent/기획/service-plan.md` |
| `docs/planning/KonaI-Agent-상세기획서.md` | 24KB | 동일 폴더 |
| `docs/planning/data-access-policy.md` + `.en.md` | 88KB | 동일 폴더 |
| `docs/planning/skill-ia-review.md` | 11KB | 동일 폴더 |
| `docs/planning/skill-menu-brainstorm.md` | 12KB | 동일 폴더 |
| `docs/planning/skill-research-gap-analysis.md` | 8KB | 동일 폴더 |

---

## 5. 카테고리 E — Vault에만 있음 (참고용)

이관 대상 아님. docs/의 어떤 문서와도 대응하지 않는 Vault 문서들. Karpathy 패턴의 "raw" 계층으로 유지.

- `Insights/agent-runtime/*` 5개 (memory, orchestration, parallel 등 런타임 기술 리서치)
- `Insights/agent-skills/*` 4개 (tool-calling, MCP 기술 관점)
- `Insights/agent-ui/patterns/*` 36개 중 C 카테고리에 엮이지 않은 약 30개 (component-catalog의 `obsidian_sources`가 직접 참조)
- `Insights/knowledge-data/*` 4개
- `Insights/market/*` 5개
- `Insights/open-source/*` 3개
- `Insights/protocols/*` 2개
- `Insights/security-evaluation/*` 3개
- `Insights/strategy/*` 6개
- `UI/wireframe/*`, `UI/화면정의서/*` — 와이어프레임 원본

---

## 6. 이관 규모 집계

| 분류 | docs 측 파일 수 | 비고 |
|---|---|---|
| A. 완전 중복 → Vault에서 삭제 후 심볼릭링크 | 2 | 리스크 제로 |
| B. 갈라진 중복 → Vault archive 이동 후 docs 승격 | 2 | docs가 SoT |
| C. 주제 중복 → Vault에 merge/append | 8 | 관점 다름, 병합 필요 |
| D-1. 유일 UX 리서치 | 4 | |
| D-2. 유일 platform-admin 리서치 | 5 | 신규 카테고리 |
| D-3. 유일 skill-management UX 리서치 | 16 | 가장 큰 덩어리 |
| D-4. 유일 competitor/nvidia | 5 | |
| D-5. 유일 IA 설계 | 8 | wiki 본체 |
| D-6. 유일 archive | 13 | |
| D-7. 유일 planning | 7 | |
| **총 docs→Vault 이관 파일** | **70** | (C 중복 포함 계산, 실제 순 이관 62~65개) |

**Vault 측 신규 생성 예상 폴더**
1. `Vault/KonaI-Agent/설계/` (+ archive/)
2. `Vault/KonaI-Agent/기획/`
3. `Vault/KonaI-Agent/ADR/` (C 카테고리 ADR 축약용)
4. `Vault/리서치/Insights/platform-admin/`
5. `Vault/리서치/Insights/skill-management-ux/`

---

## 7. 다음 단계 (Phase 3 실행 플랜)

### Step 1: 리스크 제로 이관 (A·B 카테고리, 30분)
- [ ] `Vault/UI/admin-ia.en.md`, `Vault/UI/data-ia.en.md` 삭제 (MD5 검증 완료)
- [ ] `Vault/UI/data-ia.md`, `Vault/UI/03-skill-ia.md` → `Vault/UI/archive/` 이동
- [ ] 4개 파일의 정본을 `Vault/KonaI-Agent/설계/`로 이동

### Step 2: 독립 유일 문서 일괄 이관 (D-1 ~ D-7, 1~2시간)
- [ ] 목적지 5개 신규 폴더 생성
- [ ] `rsync -av` 또는 `git mv` 기반 스크립트로 이관 (한글 경로 주의)
- [ ] 각 파일 프론트매터에 `source: docs/...` 메타 추가 (출처 추적)

### Step 3: 주제 중복 병합 (C 카테고리, 1일 — 파일당 수동 병합 필요)
- [ ] C1~C8 쌍별로 LLM 병합 초안 생성 → 사람 리뷰 → 커밋
- [ ] 각 쌍에 대해 `docs/20-decisions/ADR-*.md` 축약 요약 한 개 생성
- [ ] ADR 프론트매터에 `obsidian_sources` 필드 채우기

### Step 4: 파이프라인 정합성 (반나절)
- [ ] `specs/component-catalog.yaml`의 `source_files` 중 `docs/` 참조 전수 치환
- [ ] `docs/` → Vault 심볼릭 링크 생성 (`KonaI-Agent/docs → Vault/KonaI-Agent`)
- [ ] `.gitignore`에 심볼릭 링크 타겟 추가
- [ ] `/discover`, `/research`, `/implement`, `/qa` 4개 슬래시 커맨드에서 `docs/` 경로 참조 동작 검증

### Step 5: 스키마 문서 갱신
- [ ] `docs/WIKI.md` 생성 — 3계층 운영 규약
- [ ] `CLAUDE.md` Key References 섹션에 `docs/`→Vault 이관 사실 반영
- [ ] `Vault/AGENTS.md`에 `KonaI-Agent/` 경로 추가 (frontend_agent 역할 등)

---

## 8. 검증 포인트 (Spot Check)

이 리포트의 신뢰도를 확인하려면 다음 샘플 쌍을 사람이 직접 열어보면 된다.

1. **A1 확인**: `diff Vault/UI/admin-ia.en.md docs/design/ia-design/admin-ia.en.md` → 출력 없어야 함 (이미 확인됨)
2. **B2 확인**: `docs/design/ia-design/skill-ia.md`의 목차와 `Vault/UI/03-skill-ia.md`의 목차를 비교 → docs 쪽에 "Eval 데이터 구조", "버전 히스토리 패널" 등 v7/v11 요소가 있어야 함
3. **C1 확인**: `docs/research/ux-patterns/01-dashboard.md` 첫 30줄과 `Vault/Insights/agent-ui/dashboard-composition.md` 첫 30줄을 비교 → 전자는 메뉴 IA·경쟁사 비교, 후자는 위젯 합성 패턴이어야 관점 분리 가설이 맞다
4. **D-3 확인**: `Vault/Insights/agent-skills/` 디렉토리에 파일이 4개뿐인지 확인 → docs/research/skill-management/의 21개와 규모 차이 확인

---

## 9. 결론 및 권장 사항

- **이관은 안전하다**. 리스크가 있는 divergence는 모두 docs 쪽이 최신이라 Vault 쪽을 덮어쓰면 된다. 반대 방향 손실은 없다.
- **가장 이득이 큰 부분**은 A·B 4개(30분 작업)로, 이 네 파일만 정리해도 "Vault에 있는 IA 문서가 옛날 버전"이라는 가장 짜증나는 상황이 사라진다.
- **가장 큰 덩어리**는 D-3의 스킬 관리 UX 리서치 16개. 이건 Vault `agent-skills/` 카테고리가 얇았다는 신호이기도 하고, Karpathy 패턴의 "일반 패턴 축적"을 위해서라도 당연히 Vault가 받아야 하는 내용이다.
- **C 카테고리의 병합**이 가장 품이 많이 든다. 쌍별로 수동 리뷰가 필요하지만, 이 덕분에 "일반 패턴(Vault) vs 적용 결정(docs ADR)" 경계가 자연스럽게 만들어진다. 이관이 끝난 뒤부터는 새 리서치는 Vault에만, 새 결정은 ADR에만 쓰면 되는 명확한 규칙이 선다.

**다음으로 제가 바로 할 수 있는 것**
1. Step 1(A·B 카테고리 리스크 제로 이관)을 스크립트로 만들어 dry-run 실행
2. D-5 IA 설계 문서 8개에 대한 이관 스크립트 작성 (target 경로 포함)
3. C 카테고리 8쌍 각각에 대한 병합 초안을 LLM으로 생성해 리뷰용 PR 묶음 준비

어느 것부터 진행할지 알려주세요.
