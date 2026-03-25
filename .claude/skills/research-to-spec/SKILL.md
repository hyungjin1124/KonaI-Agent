---
name: research-to-spec
description: Use when converting research findings into design specifications or information architecture documents. Reads research files, synthesizes into IA docs with page structure, navigation flow, and component mapping. Auto-invokes when research-then-design pattern is detected.
---

# Research to Spec Workflow

Convert research documents into actionable design specifications for the KonaI-Agent platform.

**Target feature**: $ARGUMENTS (required — e.g., "platform-admin", "skill-management", "nvidia-toolkit")

## Step 1: Gather research inputs

1. **리서치 폴더 확인**: `./research/` 하위에 $ARGUMENTS와 매칭되는 폴더를 찾아 그 안의 **모든** `.md` 파일을 읽는다.

| $ARGUMENTS | 리서치 폴더 |
|------------|-----------|
| `platform-admin` | `./research/task2-platform-admin/` |
| `skill-management` | `./research/task3-skill-management/` |
| `nvidia-toolkit` | `./research/task5-nvidia/` |
| 기타 | `./research/` 루트에서 $ARGUMENTS와 파일명이 매칭되는 `.md` 파일 |

   매칭되는 폴더가 없고 파일도 없으면 STOP: "리서치 폴더 `./research/{$ARGUMENTS 관련 폴더명}/`이 없습니다. researcher 에이전트를 먼저 실행하세요."

2. **프로젝트 내 관련 1차 소스 확인**: `.claude/skills/`, `.claude/agents/`, `.skills/skills/` 디렉토리에서 $ARGUMENTS와 관련된 파일을 찾아 읽는다.
   - 예: "skill-management" 리서치 시 `.claude/skills/skill-creator/SKILL.md`, `.skills/skills/skill-evaluator/SKILL.md` 등 존재 여부 확인
   - 웹 리서치보다는 구현 수준의 패턴과 제약을 제공할 수 있음
   - 존재하지 않으면 다음 단계로 진행

3. Read `specs/component-catalog.yaml` to check existing component status for the feature

4. If the feature has `obsidian_sources` in the catalog, read:
   `/Users/hyungjin/Documents/Obsidian Vault/KonaChain/리서치/{obsidian_sources_value}`

5. Read the current implementation (if any) to understand what already exists:

| Feature | Existing code to read |
|---------|----------------------|
| admin | `src/components/AdminView.tsx`, `src/types/admin.types.ts` |
| platform-admin | `src/components/features/platform-admin/PlatformAdminView.tsx` + all sub-components |
| skill-management | `src/components/SkillManagementView.tsx`, `src/components/SkillUploadModal.tsx` |
| liveboard | `src/components/features/liveboard/LiveboardView.tsx` |
| chat | `src/components/features/general-chat/GeneralChatView.tsx` |

## Step 1.5: Research synthesis (3+ files only)

**이 스텝은 Step 1에서 리서치 파일이 3개 이상일 때만 실행한다.**

1. 수집된 모든 리서치 파일을 읽고 **교차 주제(cross-cutting themes)**를 추출한다.
2. 다음 항목으로 요약한다 (최대 20개 불릿):
   - 공통으로 언급되는 UI 패턴 (예: "비교 뷰", "배지 시스템")
   - 반복되는 사용자 문제점 (예: "스킬 품질을 한눈에 판단하기 어려움")
   - 경쟁사/벤치마크 간 공통 전략 (예: "조직 정책 기반 접근")
   - 기술적 제약과 해결책

**예시 (Skill Management의 경우):**
```
## 리서치 종합 요약 (Synthesis)

**반복되는 UI 패턴:**
- 출처/신뢰도 배지 (4/5 문서에서 언급)
- 품질 스코어 시각화 (3/5 문서에서 eval 점수 표시)
- 비교 뷰 (마켓플레이스/벤치마크 문서)
- 권한 정책 기반 차별화 (2/5 문서)

**핵심 사용자 여정:**
1. 발견 → 비교 → 설치 (80% 문서)
2. 발견 → 검증 → 승인 요청 (조직 배포)

**설계 의사결정 지점:**
- 카테고리 수: 3~5개 권장 (모두 일치)
- 카드 vs 리스트: 카드 권장 (비주얼 신뢰도 강조)
- 권한 분류: 3계층(플랫폼/조직/개인) 권장
```

3. 이 요약을 Step 2의 입력으로 사용한다. 각 패턴/여정이 IA의 어느 부분에 반영되는지 명시한다.

## Step 2: Synthesize design requirements

1. **리서치 인사이트 종합** (3+ 파일인 경우):
   - Step 1.5의 종합 요약에서 추출한 패턴을 **구체적인 상호작용 및 시각화 설계**로 변환한다.
   - 각 패턴별로: 어느 페이지/컴포넌트에서 사용할 것인가, 어떤 상태(성공/실패/로딩)를 표시할 것인가를 정의한다.
   - 추출된 여정이 IA의 "Navigation Flow" 섹션에 완벽하게 매핑되는지 확인한다.

2. **기능별 우선순위 분류**:
   For each research finding, determine:
   - **Must-have**: directly solves an identified problem or gap
   - **Should-have**: improves experience but not blocking
   - **Could-have**: nice to have, low priority
   - **Won't-have (this phase)**: out of scope for current iteration

3. **사용자 여정별 우선순위**:
   - 추출된 각 primary/secondary journey에 대해 포함할 기능을 나열하고 우선순위를 할당한다.
   - 예: "비교 뷰 여정 = Side-by-Side eval display (Must) + 시나리오별 차이 하이라이트 (Should) + 벤치마크 원본 데이터 (Could)"

## Step 3: Create IA document

Save to `./design/{feature-slug}-ia.md`:

```markdown
# Information Architecture — {Feature Name}

> Generated: {YYYY-MM-DD}
> Based on: {list of research files used}
> Status: Draft

## Current State
{What exists today: route, component, lines of code, key limitations}

## Target State
{What the improved version should achieve, in 2-3 sentences}

## Menu Structure
```
{feature}/
├── {Section A}
│   ├── {Sub-page 1} — {purpose}
│   └── {Sub-page 2} — {purpose}
├── {Section B}
│   └── ...
└── {Settings/Config}
```

## Page Definitions
| Page | Route | Purpose | Key Components | Data Source | Priority |
|------|-------|---------|----------------|------------|----------|
| ... | /... | ... | ... | mock / API | Must / Should / Could |

## Navigation Flow
### Primary Journey: {goal}
1. User lands on {page} → sees {what}
2. Clicks {action} → navigates to {page}
3. ...

### Secondary Journey: {goal}
1. ...

## Interaction Patterns
| Pattern | Research Source | Application | Component(s) | Priority |
|---------|-----------------|-------------|--------------|----------|
| {Pattern name, e.g., "Badge-based filtering"} | {Which research file identified this} | {Where/how used in IA} | {Component(s)} | Must / Should / Could |
| ... | ... | ... | ... | ... |

*Extract key interaction patterns from research and map to specific pages/components. Examples: badge systems, multi-step wizards, side-by-side comparisons, approval workflows, policy-based UI hiding.*

## Visualization / Data Display Design
{Describe the recommended visual approach for each major data type or visualization need identified in research. Examples: quality scoring badges, trend charts, comparison views, timeline displays, status indicators.}

**Sections to include:**
- **Quality/Evaluation Display**: How eval scores, pass rates, or benchmarks are shown (color coding, badges, charts, etc.)
- **Comparison Views**: How two versions/items are displayed side-by-side
- **Hierarchical Data**: How nested or multi-level data is structured (tables, trees, cards, etc.)
- **Status/State Indicators**: Icons, colors, text patterns for different states (active, pending, blocked, etc.)
- **Volume Management**: When list/card volumes are large (100+), how filtering, search, pagination, or virtual scrolling is handled

## Component Mapping
| UI Element | Existing Component | New/Modified | Notes |
|------------|-------------------|-------------|-------|
| ... | src/components/ui/... | New | ... |
| ... | src/components/features/... | Modified | ... |

## Data Requirements
| Entity | Fields | Source | Existing Type | New Type Needed |
|--------|--------|--------|---------------|-----------------|
| ... | ... | API / mock | src/types/... | Yes / No |

## Design Tokens
{Any new colors, spacing, or typography needed beyond existing Tailwind config}

## Acceptance Criteria
1. [ ] {Testable criterion}
2. [ ] {Testable criterion}
3. ...

## Open Questions
- {Question that needs team input before implementation}
```

## Step 4: Update component catalog

If the feature exists in `specs/component-catalog.yaml`, update its status:
- `research_needed` → `needs_update` (if research is done, spec is ready)
- Add or update `obsidian_sources` if new research docs were created

## Rules

- **모든 설계 문서는 한국어로 작성한다.** 파일 경로, 컴포넌트명, 타입명, 기술 용어는 원문 유지.
- Do NOT generate code. This skill produces design documents only.
- Always reference existing components by their actual file paths.
- If research files are empty or missing, STOP and report: "No research found for {feature}. Run the researcher agent first."
- Preserve existing route structure — do not propose new routes unless the research explicitly calls for it.
- Flag any design decision that requires team discussion under "Open Questions".
