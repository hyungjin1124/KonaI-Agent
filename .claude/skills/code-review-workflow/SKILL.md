---
name: code-review-workflow
description: Use when the user asks to review, audit, or check code quality of frontend pages. Orchestrates code-reviewer and ux-reviewer agents, compiles a combined priority report. Does NOT fix code — use review-page for review + fix.
---

# Code Review Workflow

Run a comprehensive code + UX review on the specified target and produce a combined report.

**Target**: $ARGUMENTS (default: `src/app/admin/` and `src/components/AdminView.tsx`)

## Step 0: Resolve target slug

Derive `{target}` from `$ARGUMENTS` using the target resolution table below:
- `admin` → slug: `admin`
- `platform-admin` → slug: `platform-admin`
- `skills` → slug: `skills`
- `liveboard` → slug: `liveboard`
- `chat` → slug: `chat`
- A file path → slug: filename without extension (e.g., `src/components/Foo.tsx` → `foo`)
- (empty) → slug: `admin`

All output filenames MUST include `{target}` to distinguish reports across different targets.

## Step 1: Invoke code-reviewer agent

- Target: $ARGUMENTS
- Expected output: `./reports/{target}/code-review-{date}.md`
- **IMPORTANT**: Pass the exact output path to the agent. Do NOT let the agent choose its own path.
- If agent produces no output, create a placeholder file noting the failure

## Step 2: Invoke ux-reviewer agent

- Target: same as Step 1
- Expected output: `./reports/{target}/ux-review-{date}.md`
- **IMPORTANT**: Pass the exact output path to the agent. Do NOT let the agent choose its own path.
- If agent produces no output, create a placeholder file noting the failure

Steps 1 and 2 run in parallel.

## Step 3: Wait and verify

- Confirm both files exist at the exact paths specified above
- Read both files completely

## Step 4: Create combined priority matrix

- Deduplicate: if both agents flagged the same file+issue, merge into one entry
- Categorize every issue into the priority matrix (Quick Win / Strategic / Fill-in / Deprioritize)
- Save to `./reports/{target}/priority-{date}.md`

## Step 5: Present summary

- Print to stdout: total issue count, top 5 Quick Wins, estimated total fix time
- Remind user: "Run `/review-page $TARGET` to auto-fix Quick Wins"

## Output files

All files use `{date}` = YYYY-MM-DD format, `{target}` = resolved slug from Step 0.
If a file already exists for today AND same target, append `-2`, `-3`, etc.

- `./reports/{target}/code-review-{date}.md` — from code-reviewer agent
- `./reports/{target}/ux-review-{date}.md` — from ux-reviewer agent
- `./reports/{target}/priority-{date}.md` — synthesized by this skill

## Target resolution

**모든 리포트는 한국어로 작성한다.** 파일 경로, 변수명, 코드 스니펫, 기술 용어는 원문 유지.

Same mapping as review-page skill:
- `admin` → `src/components/AdminView.tsx` + `src/app/admin/`
- `platform-admin` → `src/components/features/platform-admin/` + `src/app/platform-admin/`
- `skills` → `src/components/SkillManagementView.tsx` + `src/app/settings/skills/`
- A file path → that specific file
- (empty) → default: `admin`
