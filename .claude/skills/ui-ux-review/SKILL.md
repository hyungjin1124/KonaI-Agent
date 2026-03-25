---
name: ui-ux-review
description: >
  Use when the user asks to review, audit, or evaluate the UI/UX quality of frontend pages.
  Invokes the ux-reviewer agent for a comprehensive 4-part analysis: UX checklist, scenario-based
  product review, service planning perspective, and production readiness review.
  Does NOT review code quality (use code-review-workflow for that) and does NOT fix code
  (use review-page for review + fix).
  MUST trigger whenever the user mentions: UX review, UI review, usability audit, UX audit,
  사용성 리뷰, UX 분석, UI 점검, 화면 리뷰, 사용자 경험 분석, 시나리오 분석,
  or asks "이 화면 UX 괜찮아?", "사용성 문제 있어?", "UX만 봐줘" — even if they don't
  explicitly say "ui-ux-review". Also trigger when user asks to review a specific page or
  route purely from a user-experience perspective without mentioning code quality.
---

# UI/UX Review Skill

Run a comprehensive UI/UX review on the specified target using the ux-reviewer agent.
Produces a detailed UX report and a prioritized action matrix — all without touching source code.

This skill differs from `code-review-workflow` in that it focuses exclusively on UX analysis.
There is no code-reviewer agent involved. This makes it faster and more focused when the user
only needs UX insights.

**Target**: $ARGUMENTS (default: `admin`)

---

## Step 0: Resolve target slug

Derive `{target}` from `$ARGUMENTS` using this mapping:

| Input | Slug | Files |
|-------|------|-------|
| `admin` | `admin` | `src/components/AdminView.tsx` + `src/app/admin/` |
| `platform-admin` | `platform-admin` | `src/components/features/platform-admin/` + `src/app/platform-admin/` |
| `skills` | `skills` | `src/components/SkillManagementView.tsx` + `src/app/settings/skills/` |
| `liveboard` | `liveboard` | `src/components/features/liveboard/` |
| `chat` | `chat` | `src/components/features/general-chat/` |
| A file path | filename without extension | that specific file and its imports |
| (empty) | `admin` | default target |

All output filenames include `{target}` to distinguish reports across different targets.

---

## Step 1: Invoke ux-reviewer agent

Spawn the `ux-reviewer` agent as a subagent with the following instructions:

```
Target: {resolved file paths from Step 0}
Output path: ./reports/{target}/ux-review-{date}.md

Review this target following your full 4-part methodology:
- Part 1: UX Checklist (31 items)
- Part 2: Scenario-Based Product Review (personas, scenarios, field audit)
- Part 3: Service Planning Perspective (structure, feature justification, complexity)
- Part 4: Production Readiness Review (data reliability, scale, errors, security, performance)

Save the complete report to the output path specified above.
```

**IMPORTANT**:
- Pass the exact output path — do NOT let the agent choose its own.
- If the agent produces no output, create a placeholder file noting the failure.
- `{date}` is YYYY-MM-DD format. If the file already exists, append `-2`, `-3`, etc.

---

## Step 2: Wait and verify

- Confirm the report file exists at `./reports/{target}/ux-review-{date}.md`
- Read the report completely
- Verify it contains all 4 parts (Part 1 through Part 4)
- If any part is missing or incomplete, note it in Step 3 output

---

## Step 3: Create UX Priority Matrix

Read the UX report and synthesize a standalone priority matrix.

### Priority categories

Organize every issue into exactly one category:

1. **프로덕션 즉시 위험** — 출시 전 필수 수정. 보안, 데이터 유실, 접근 제어 문제.
2. **Quick Wins** — 높은 영향도 + 낮은 공수 (< 1h). 가장 먼저 해결할 항목.
3. **전략적 항목** — 높은 영향도 + 높은 공수 (> 4h). 스프린트 계획에 반영.
4. **구조 변경 제안** — 기획 레벨 변경. 탭 재구성, 기능 이동, 네비게이션 변경.
5. **운영/품질 부채** — 규모 확장 시 문제. 확장성, 성능, 로깅.
6. **보완 항목** — 낮은 영향도 + 낮은 공수. 시간 날 때 처리.
7. **후순위 항목** — 낮은 영향도 + 높은 공수. 현재 불필요.
8. **기능 부재 목록** — 시나리오 분석에서 발견된 신규 개발 필요 항목.

### Cross-reference deduplication

같은 이슈가 여러 Part에서 언급된 경우, 하나로 합치고 출처를 모두 명시한다.
예: `출처: 체크리스트 #15 / 시나리오 S3 / 프로덕션 P4-관점3`

### Output

Save to `./reports/{target}/ux-priority-{date}.md` with this structure:

```markdown
# UX 우선순위 매트릭스 — {date}

## 대상
{target path}

## 요약
- 총 이슈: {count} (체크리스트: {n} / 시나리오: {n} / 구조: {n} / 프로덕션: {n})
- 프로덕션 즉시 위험: {count}
- Quick Wins: {count} (예상 총합: {hours}시간)
- 구조 변경 제안: {count}
- 기능 부재: {count}

## 프로덕션 즉시 위험
| # | 관점 | 컴포넌트 | 이슈 | 출처 | 예상 공수 |
|---|------|---------|------|------|---------|

## Quick Wins
| # | 유형 | 컴포넌트 | 이슈 | 출처 | 예상 공수 |
|---|------|---------|------|------|---------|

## 전략적 항목
| # | 유형 | 컴포넌트 | 이슈 | 출처 | 예상 공수 |
|---|------|---------|------|------|---------|

## 구조 변경 제안
| # | 제안 | 근거 | 영향 범위 | 출처 |
|---|------|------|---------|------|

## 운영/품질 부채
| # | 분류 | 이슈 | 예상 영향 시점 | 출처 |
|---|------|------|-------------|------|

## 보완 항목
(낮은 영향도 + 낮은 공수)

## 후순위 항목
(낮은 영향도 + 높은 공수)

## 기능 부재 목록
| # | 기능명 | 관련 시나리오 | 페르소나 | 예상 공수 | 비고 |
|---|--------|------------|---------|----------|------|

## 반복 패턴
같은 마찰 유형이 3회 이상 나타나면 패턴으로 묶어 한 번에 해결하는 방안을 제시한다.
| 패턴 | 발생 횟수 | 관련 시나리오 | 통합 해결안 |
|------|---------|-------------|-----------|
```

---

## Step 4: Present summary

Print to stdout:
1. 총 이슈 수와 Part별 분포
2. 프로덕션 즉시 위험 항목 (있으면)
3. Quick Wins 상위 5개와 예상 소요 시간
4. 구조 변경 제안 요약
5. 기능 부재 항목 수

End with: `"/review-page {target}" 으로 Quick Win 자동 수정을 실행할 수 있습니다.`

---

## Output files

| File | Description |
|------|-------------|
| `./reports/{target}/ux-review-{date}.md` | ux-reviewer 에이전트가 생성한 상세 리포트 |
| `./reports/{target}/ux-priority-{date}.md` | 이 스킬이 생성한 우선순위 매트릭스 |

---

## Rules

- **모든 리포트는 한국어로 작성한다.** 파일 경로, 변수명, 코드 스니펫, 기술 용어는 원문 유지.
- NEVER modify any source files. Read-only analysis only.
- 에이전트가 생성한 리포트를 임의로 수정하지 않는다. 우선순위 매트릭스는 별도 파일로 생성한다.
- code-review-workflow와 달리 code-reviewer 에이전트를 호출하지 않는다. UX 분석만 수행한다.
- 타겟이 명시되지 않으면 admin을 기본값으로 사용한다.
