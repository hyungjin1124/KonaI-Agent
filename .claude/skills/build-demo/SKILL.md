---
name: build-demo
description: Build or extend a demo page from research and design specifications. Follows existing project patterns. Only run when explicitly invoked.
disable-model-invocation: true
---

# Build Demo

Build or extend a Next.js page based on research findings and design specs in the KonaI-Agent project.

**Target feature**: $ARGUMENTS (required — e.g., "platform-admin", "skill-management", "admin")

## Prerequisites check

Before building, verify these files exist:

1. `./design/{feature}-ia.md` — Information Architecture spec (from research-to-spec skill)
2. 리서치 폴더가 존재하고 파일이 있는지 확인:

| $ARGUMENTS | 리서치 폴더 |
|------------|-----------|
| `platform-admin` | `./research/task2-platform-admin/` |
| `skill-management` | `./research/task3-skill-management/` |
| `nvidia-toolkit` | `./research/task5-nvidia/` |
| 기타 | `./research/` 루트에서 관련 파일 검색 |

If prerequisites are missing:
- Print: "설계 문서가 없습니다. `/research-to-spec {feature}`를 먼저 실행하세요."
- STOP — do not proceed without a spec.

## Step 1: Read context

1. Read `./design/{feature}-ia.md` for page structure and component mapping
2. Read existing code for the feature (see target resolution table below)
3. Read `specs/component-catalog.yaml` for component status
4. Read `src/types/admin.types.ts` if the feature involves admin/RBAC
5. Read `src/components/ui/` to inventory available Radix UI wrappers

## Step 2: Plan implementation

Before writing any code, output the plan:

```
PLAN:
- New files: [list with paths]
- Modified files: [list with paths]
- New types: [list]
- New mock data: [added to src/data/ or lib/mock-data.ts]
- Risk: [what could break]
- Approach: [one-line summary]
진행합니다 / 확인 필요?
```

Wait for user confirmation if risk is non-trivial.

## Step 3: Build (in order)

### 3a. Types first
- Add new TypeScript interfaces/types to `src/types/{feature}.types.ts`
- Export from `src/types/index.ts`

### 3b. Mock data
- Add mock data to `src/data/{feature}-mock.ts` or `src/components/features/{feature}/data/`
- Follow existing mock data patterns (see `src/components/features/platform-admin/data/`)

### 3c. Sub-components
- Create in `src/components/features/{feature}/components/`
- One component per file, PascalCase naming
- Use existing Radix UI wrappers from `src/components/ui/`
- Use existing shared atoms: KPICard, Badge, ChartWidget from `src/components/shared/`

### 3d. Main view component
- Create `src/components/features/{feature}/{FeatureName}View.tsx`
- Follow the tab-based layout pattern used in AdminView and PlatformAdminView
- Import sub-components

### 3e. Page route
- Create or update `src/app/{route}/page.tsx`
- Use lazy loading with Suspense (same pattern as existing pages)

### 3f. Navigation
- Add route to `src/constants/navigation.ts` if it's a new top-level page
- Update `src/components/Sidebar.tsx` if needed

## Step 4: Verify

After each major component is complete:

1. Run `npx tsc --noEmit 2>&1 | head -30` — fix any TypeScript errors
2. Run `npx next lint 2>&1 | head -30` — fix any lint errors
3. Verify imports are correct (no circular dependencies)

## Step 5: Log progress

Save to `./reports/{feature}/build-progress-{date}.md` (create `./reports/{feature}/` directory if it doesn't exist):

```markdown
# Build Progress — {feature} — {date}

## Files Created
| File | Lines | Purpose |
|------|-------|---------|

## Files Modified
| File | Change | Lines Changed |
|------|--------|---------------|

## Types Added
| Type | File | Fields |
|------|------|--------|

## Remaining from IA Spec
| Page/Component | Status | Notes |
|----------------|--------|-------|
| ... | Done / Skipped / TODO | ... |

## TypeScript Check
{Output of tsc --noEmit}

## Known Limitations
- {What's mocked vs. real}
- {What needs backend support}
```

## Target resolution

| $ARGUMENTS | Route | Main component | Sub-components dir |
|------------|-------|----------------|-------------------|
| `admin` | `/admin` | `AdminView.tsx` | `src/components/features/admin/` |
| `platform-admin` | `/platform-admin` | `PlatformAdminView.tsx` | `src/components/features/platform-admin/` |
| `skill-management` | `/settings/skills` | `SkillManagementView.tsx` | `src/components/features/skill-management/` |
| `liveboard` | `/liveboard` | `LiveboardView.tsx` | `src/components/features/liveboard/` |
| `chat` | `/chat` | `GeneralChatView.tsx` | `src/components/features/general-chat/` |

## Coding rules

- **모든 빌드 로그와 리포트는 한국어로 작성한다.** 파일 경로, 코드 스니펫, 기술 용어는 원문 유지.
- Use existing shadcn/ui components (src/components/ui/) before creating custom ones
- Tailwind CSS only — no inline styles, no CSS modules
- All text content in Korean (this is a Korean enterprise product)
- Follow TypeScript strict mode — no `any`, no `@ts-ignore`
- Mock data goes in dedicated data files, never inline in components
- Charts use Recharts (already installed), not Chart.js or D3
- Icons use Lucide-react (already installed)
- Commit after each major page/component is complete
- Commit message format: `[feat] {feature}: {description}`
