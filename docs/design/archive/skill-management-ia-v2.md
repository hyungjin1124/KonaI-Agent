# Information Architecture — Skill Management v2

> Generated: 2026-03-19
> Based on: 7 research documents (anthropic-skill-creator, multi-tenant-extension-management, skill-creator-ux-workflow, skill-marketplace-ux-analysis, skill-versioning-eval-ui, skills-eval-ui-patterns, team-skill-sharing-patterns)
> Status: Research Complete — Ready for Design Implementation
> Reviewd against: CLAUDE.md guidelines, component-catalog.yaml, existing SkillManagementView

---

## Executive Summary

현재 KonaI-Agent는 6개의 하드코딩된 스킬을 `on/off` 토글로 관리하는 단순 구조입니다. 향후 20–500개 스킬 규모로 확장되려면, **3계층 권한 구조(플랫폼 → 테넌트 → 개인)**, **Eval 기반 품질 메타데이터**, **대화형 생성 워크플로우**, **팀 공유 및 업데이트 알림 시스템**이 필수적입니다.

본 IA v2는 Anthropic skill-creator의 핵심 패턴(Intent Interview, Eval Viewer, Benchmark, A/B Compare, Description Optimization)을 웹 UI에 적용하고, Microsoft Teams, Figma, Slack의 거버넌스 모델을 결합한 종합 설계입니다.

---

## Current State

**기존 구현** (`src/components/features/skill-management/`):
- SkillManagementView.tsx: 메인 뷰, 토글 관리
- SkillCard.tsx: 기본 카드 (이름, 설명, on/off)
- SkillDetailPanel.tsx: 부분적 상세 정보 (설명, 트리거)
- SkillUploadWizard.tsx: .skill 파일 드래그앤드롭 업로드
- OrgSkillManagementPanel.tsx: 조직 관리자용 (미완성)
- SkillApprovalQueue.tsx: 승인 워크플로우 (미완성)

**제약사항**:
- 스킬 품질(Eval 점수, 통과율) 정보 부재
- 버전 관리 UI 없음
- 팀 내 공유 메커니즘 없음
- 대화형 생성 인터페이스 없음
- 스킬 트리거 최적화 도구 없음

---

## Target State

KonaI-Agent의 Skill Management v2는 다음을 달성합니다:

1. **확장 가능한 마켓플레이스**: 검색, 카테고리, 태그 필터로 20–500개 스킬 탐색
2. **품질 가시화**: Eval 통과율, 개선율, 보안 점수를 카드 및 상세 페이지에 표시
3. **대화형 생성**: Chat 기반 스킬 Intent 캡처 → 자동 draft → Test Case 설정 → Eval 실행
4. **3계층 거버넌스**: 플랫폼 강제 정책 → 테넌트 추천/승인 → 개인 선택적 활성화
5. **팀 협업**: 공유, 업데이트 알림, 포크/링크 추적
6. **Phase 2 고급 기능**: Description 최적화, Blind A/B Compare, 버전 비교 뷰

---

## Menu Structure

```
Skill Management /
├── 스킬 탐색 (Marketplace)
│   ├── 추천 스킬 섹션
│   ├── 카테고리별 탐색 (문서, 데이터, 도구연동, 콘텐츠, 자동화, 도메인)
│   └── 스킬 상세 페이지 (평가 탭, 버전 탭, 공유 탭)
│
├── 내 스킬 관리 (My Skills)
│   ├── 활성 스킬 목록 (in-use, pinned, organized by category)
│   ├── 스킬 상세 패널 (on/off, 설정, 평가 이력)
│   └── 스킬 생성 대화 (Chat 기반 Intent Interview + Eval Runner)
│
├── 팀 스킬 (Team Skills) — Phase 2
│   ├── 팀 라이브러리 (publish된 스킬 목록)
│   ├── 내가 공유한 스킬 (관리, 피드백 수집)
│   └── 업데이트 알림 (Accept/Skip)
│
└── 관리 (Admin) — 테넌트 관리자 전용
    ├── 스킬 정책 설정 (Mandatory/Recommended/Allowed/Blocked)
    ├── 승인 대기열 (요청 검토 및 승인)
    ├── 팀별 정책 할당
    └── 감사 로그 (설치, 활성화, 공유 이력)
```

---

## Page Definitions

| Page | Route | Purpose | Key Components | Data Source | Priority |
|------|-------|---------|----------------|------------|----------|
| **Marketplace Home** | `/skills` | 스킬 발견의 진입점, 추천 + 카테고리 탐색 | SearchBar, CategoryTabs, RecommendedCarousel, CategoryGrid, SkillCard (basic) | API `/skills/recommended`, `/skills/featured` | **Must** |
| **Skill Detail** | `/skills/:skillId` | 스킬 상세 정보, Eval 결과, 공유/설치 액션 | SkillDetailPanel, EvalViewer (Outputs/Benchmark tabs), VersionSelector, ShareButton, PublishButton | API `/skills/:skillId`, `/skills/:skillId/evals` | **Must** |
| **My Active Skills** | `/skills/active` | 개인이 활성화한 스킬 목록, on/off 토글 | ActiveSkillList, SkillCard (installed version), QuickToggle | Local state + API `/skills/user/active` | **Must** |
| **Skill Create Hub** | `/skills/create` | 스킬 생성 방식 선택 허브 — 4가지 경로 분기 | SkillCreateHub (3가지 카드: 대화형/업로드/캡처), 마켓플레이스 설치는 카탈로그 카드에서 직접 | — | **Should** |
| **Skill Create — 대화형** | `/skills/create/chat` | Intent Interview → Draft → Test → Eval | SkillCreationChat, SkillDraftPreview, SkillCreationStepper, TestCaseForm, EvalRunnerPanel | Chat context | **Should** |
| **Skill Create — 업로드** | `/skills/create/upload` | 기존 파일 업로드 (Phase 1 구현 완료) | SkillUploadWizard | File upload | **Must** (완료) |
| **Skill Create — 워크플로우 캡처** | `/skills/create/capture` | 채팅 이력에서 도구 사용 패턴 추출 → 자동 스킬화 | WorkflowCaptureWizard, ChatHistorySelector, SkillDraftPreview | Chat history | **Should** |
| **Skill Detail — Evaluations Tab** | `/skills/:skillId/evaluations` | Eval 시스템 통합, 개별 평가 사례 및 벤치마크 | OutputsTab (individual eval), BenchmarkTab (summary stats), FormalGrades | Workspace storage (AWS S3 or backend) | **Should** |
| **Version History & Rollback** | `/skills/:skillId/versions` | 버전별 Eval 비교, 롤백 UI | VersionHistoryTable, VersionSelector (dropdown), RollbackConfirmModal | API `/skills/:skillId/versions`, history.json | **Should** |
| **Version Comparison** | `/skills/:skillId/compare/:versionA/:versionB` | Side-by-side Eval 비교 (차별화 포인트) | ComparisonSidebar, DeltaSummary, RubricScoreChart, ImprovementSuggestions | comparison.json, analysis.json | **Could** |
| **Team Skills Library** | `/skills/team` | 팀 내 Publish된 스킬 목록 (Phase 2) | TeamSkillLibrary, PublishWorkflow, UpdateNotificationPanel | API `/skills/team`, `/skills/shared-with-me` | **Could** |
| **Skill Management Admin** | `/admin/skills` | 테넌트 관리자: 정책 설정, 승인, 감사 (Phase 1–2) | OrgSkillManagementPanel, SkillPolicyPanel, ApprovalQueue, AuditLog | API `/admin/skills/policies`, `/admin/skills/requests` | **Should** |
| **Skill Create — Description Optimization** | `/skills/:skillId/optimize-description` | 트리거 정확도 최적화 UI (Phase 2) | QueryListEditor, OptimizationProgressIndicator, ResultsDisplay | run_loop.py backend integration | **Could** |

---

## Navigation Flow

### Primary Journey: "스킬 발견 → 설치 → 활성화"

```
1. User lands on /skills → Marketplace 홈 화면
   └─ sees: 추천 스킬 carousel + 카테고리 탭 (문서, 데이터, 도구, 콘텐츠, 자동화, 도메인)

2. Clicks [카테고리] 또는 uses 검색바 → /skills?category=문서&search=...
   └─ sees: 필터된 스킬 목록 (그리드 또는 리스트 뷰)

3. Clicks 스킬 카드 → /skills/:skillId
   └─ sees: 상세 정보 (설명, 제작자, Eval 통과율 배지, 태그)

4. Reviews Evaluations tab:
   └─ Outputs tab: 개별 eval 사례 (with/without 비교)
   └─ Benchmark tab: 통과율 차트 + 개선 폭 수치

5. Clicks [설치] 또는 [활성화]
   └─ Skill added to /skills/active with toggle ON

6. (If already installed) Clicks [비활성화]
   └─ Skill toggle OFF (but remains in /skills/active list)
```

### Secondary Journey: "대화형 스킬 생성 → Eval 실행 → 공유"

```
1. User requests in chat: "내가 Excel 스킬을 만들고 싶어"
   └─ Chat detects skill-creation intent

2. Agent invokes skill-creator workflow:
   a) Interview phase (Intent Capture 4가지 질문)
   b) User confirms SKILL.md draft (in Artifact panel)
   c) Test case setup (2-3 realistic prompts auto-generated)
   d) Eval execution (with-skill vs without-skill parallel)
   e) Results viewing (generate_review.py logic → UI)

3. User reviews Eval results in embedded detail panel
   └─ Individual outputs tab + Benchmark comparison

4. Clicks [이 스킬을 팀에 공유]
   └─ Publish workflow: 변경 요약 작성 → 범위 선택 (팀/조직)

5. Team admin reviews in /admin/skills/approval-queue
   └─ Approves (또는 requests changes)
   └─ Skill appears in team marketplace
```

### Tertiary Journey: "팀 스킬 업데이트 알림 → Accept/Skip"

```
1. Team author publishes v2.0 of "Notion Workspace Manager"

2. All users with skill installed receive in-app notification:
   └─ "v2.0 available: 성능 +15%, 새 기능: 배치 작업"

3. User clicks notification → /skills/:skillId/update-review
   └─ sees: side-by-side v1.5 vs v2.0 Eval results
   └─ Delta summary (개선: +15%, 퇴행: 0)

4. Clicks [업데이트 적용] or [이전 버전 유지]
   └─ Skill version updates or reverts
   └─ Rollback triggered if user selects revert
```

### Quaternary Journey: "버전 관리 및 롤백" (Phase 2)

```
1. User clicks /skills/:skillId/versions
   └─ sees: 버전 히스토리 테이블 (v1.0, v1.5, v2.0 각각 Eval 통과율 배지)

2. Compares v1.5 vs v2.0:
   a) Clicks 버전 선택 → 상세 페이지 재로드 (Eval 결과 전환)
   b) (또는) Clicks [비교] → /skills/:skillId/compare/v1.5/v2.0
      └─ Side-by-side 패널, 색상 diff (Green/Red/Gray)

3. Needs to rollback to v1.5:
   a) Clicks [이 버전으로 롤백] 버튼 (v1.5 행)
   b) Confirmation modal: "이 스킬을 사용 중인 3개 에이전트에 영향"
   c) Confirms → 즉시 롤백 + Eval 재실행

4. Sees 롤백 결과 알림
```

---

## Interaction Patterns

| Pattern | Research Source | Application | Component(s) | Priority |
|---------|-----------------|-------------|--------------|----------|
| **3계층 권한 정책** | multi-tenant-extension-management, team-skill-sharing | Skill 활성화/비활성화 상태 결정 (Mandatory/Recommended/Allowed/Blocked) | SkillCard (배지), SkillDetailPanel, OrgSkillManagementPanel | **Must** |
| **Eval 통과율 배지** | skills-eval-ui-patterns, skill-versioning-eval-ui | 스킬 카드 및 버전 목록에 색상 배지 표시 (Green/Yellow/Red) | EvalQualityBadge, VersionHistoryTable | **Must** |
| **Source 신뢰 신호** | skill-marketplace-ux-analysis, multi-tenant-extension-management | "Anthropic", "Partner", "Team", "Personal" 라벨로 제작자 구분 | SkillSourceBadge (카드에 inline 표시) | **Must** |
| **카테고리 필터 + 검색** | skill-marketplace-ux-analysis | 6개 시나리오 중심 카테고리 + 텍스트 검색 + 태그 필터 | CategoryFilterBar, SearchBar, FilterChips | **Must** |
| **With-skill vs Without-skill 비교** | skill-creator-ux-workflow, skills-eval-ui-patterns | Eval Benchmark 탭에서 양측 성능 병렬 표시 | BenchmarkTab (통과율 차트, 시간/토큰 비교) | **Must** |
| **업데이트 알림 + Accept/Skip** | team-skill-sharing-patterns | 팀 공유 스킬 업데이트 시 인앱 알림, 사용자 선택 | NotificationPanel, VersionReviewModal | **Should** |
| **Publish 워크플로우** | team-skill-sharing-patterns, anthropic-skill-creator | "Publish" 클릭 → 변경 요약 입력 → 범위 선택 → 확인 | PublishWorkflow (modal), SkillDetailPanel (publish button) | **Should** |
| **Side-by-side 버전 비교** | skill-versioning-eval-ui-patterns | 두 버전의 Eval 결과를 좌우 패널로 나란히 표시 (다른 제품 없음 = 차별화) | ComparisonSidebar, DeltaSummary, RubricScoreChart | **Could** |
| **명시적 롤백 버튼** | skill-versioning-eval-ui-patterns | 버전 히스토리 행에 "이 버전으로 롤백" 버튼 배치 (다른 제품 없음) | RollbackConfirmModal, VersionHistoryTable | **Could** |
| **Intent Interview (Chat)** | skill-creator-ux-workflow | "What should this skill enable?" 등 4가지 질문을 Chat에서 자동 제시 | GeneralChatView (embedded in skill creation flow), ArtifactPanel | **Should** |
| **Eval Viewer (Outputs + Benchmark tabs)** | skill-creator-ux-workflow, skills-eval-ui-patterns | HTML 평가 뷰어를 UI 탭 형태로 적응, 개별 eval 사례 + 정량 통계 | OutputsTab, BenchmarkTab, FormalGradesAccordion | **Should** |
| **Description 최적화 UI (Phase 2)** | skill-creator-ux-workflow | Query 목록 편집기 + 최적화 실행 버튼 + 진행 표시기 + 결과 표시 | QueryListEditor, OptimizationProgressIndicator, DescriptionResultsDisplay | **Could** |
| **A/B 비교 뷰 (Phase 2)** | skill-creator-ux-workflow | 두 스킬 버전의 Rubric 점수를 레이더 차트로 비교 + Comparator 결과 표시 | RubricScoreChart, ComparisonResult Panel | **Could** |
| **포크/링크 추적 (Phase 2)** | team-skill-sharing-patterns | "Linked (원본 동기화)" vs "Forked (독립)" 상태 표시 | SkillDetailPanel (metadata), LinkStatusBadge | **Could** |
| **사용량 분석 대시보드 (Phase 2)** | team-skill-sharing-patterns, skills-eval-ui-patterns | 관리자: 설치 수, 활성 사용자, 호출 빈도, 성공/실패율 표시 | AdminAnalyticsDashboard, UsageChart (Line/Bar), SkillMetricsPanel | **Could** |
| **Assertion 기반 형식화 등급** | skills-eval-ui-patterns | Eval 결과에서 각 assertion의 pass/fail + 근거 텍스트 표시 (collapsed accordion) | FormalGradesAccordion, AssertionDetailRow | **Should** |
| **Progress Bar + 상태 요약** | skill-versioning-eval-ui-patterns | Eval 실행 중 "2/3 완료" 진행률 바 표시 + 최종 요약 | EvalProgressIndicator, SummaryCard | **Should** |

---

## Visualization / Data Display Design

### Quality/Evaluation Display

**카드 요약 (Marketplace 리스트)**:
- **통과율 배지**: 원형 진행률 UI (85%) 또는 컬러코딩 숫자 (Green≥90%, Yellow 70–89%, Orange 50–69%, Red<50%)
- **개선율 수치**: 상승 화살표 + "Baseline 35% → With-skill 85% (+50%p)" 자연어
- **마지막 검증**: 상대 시간 ("3일 전") 및 tooltop에 timestamp
- **제작자 신뢰 신호**: 소스 배지 (Anthropic/Partner/Team/Personal) + 체크마크 (인증 완료)

**버전 히스토리 테이블**:
- **행별 메타데이터**: 버전명, 게시일, Eval 통과율 배지 (인라인), 변경 요약
- **색상 코딩**: 각 행의 배지 배경색으로 품질 상태 즉시 판별
- **액션 버튼**: [비교], [롤백], [세부정보] (호버 시 나타나거나 우측 메뉴)

**벤치마크 탭 (Skill Detail)**:
- **도넛 파이 차트** (Allure Report 패턴): With-skill 통과율을 중앙 숫자로 표시, Passed/Failed를 도넛 호 색상으로 구분
- **막대 비교 차트**: With-skill vs Without-skill의 mean ± stddev를 좌우 막대로 표시
  - Y축: Pass rate (%), Time (s), Tokens
  - 범례: With (파랑), Without (회색), Delta (초록/빨강)
- **분석기 관찰**: Notes 섹션에 "Assertion 'Output is PDF' passes 100% in both — non-discriminating" 같은 패턴 표시
- **추이 그래프 (Phase 2)**: X축 버전, Y축 Overall Score (0–100%), 트렌드라인으로 "이 스킬이 꾸준히 개선 중인가?" 시각화

**개별 Eval 결과 (Outputs 탭)**:
- **좌측 패널**: 현재 eval 선택 (Dropdown 또는 Carousel Prev/Next)
- **중앙 콘텐츠**: Prompt 표시 + 실행 결과물 (텍스트/이미지/PDF 렌더링)
  - 파일 타입별 렌더링: 텍스트는 인라인, 이미지는 base64 data URI, PDF는 iframe, Excel은 클라이언트 처리
- **형식화 등급** (Collapsed accordion):
  - 각 expectation의 text, passed (boolean), evidence (텍스트)
  - Summary: {passed: 2, failed: 1, total: 3, pass_rate: 67%}
- **Formal Grades 헤더**: "✅ 2 passed / ❌ 1 failed" 색상 강조
- **피드백 textarea**: auto-save to IndexedDB or backend
- **이전 반복 비교** (iteration 2+): Collapsed section에서 이전 버전 eval 시각화

### Comparison Views

**Side-by-Side Eval 비교** (v1.5 vs v2.0):
- **좌측 패널**: v1.5 상세 (도넛 차트 + assertions)
- **우측 패널**: v2.0 상세 (동일 레이아웃)
- **중앙 Delta 요약**:
  - 한 줄 요약: "v1.5 → v2.0: Overall +12%, 3개 시나리오 개선, 1개 퇴행"
  - 색상 칩: Green (+12%), Red (-3%), Gray (no change) 각 항목별
- **시나리오 그리드** (아래): 각 eval 카테고리별 점수 변화 히트맵
  - 행: Eval 이름, 열: With-skill vs Without-skill, 색상: 개선/퇴행/동일

**Rubric 점수 비교** (A/B 비교 후 Phase 2):
- **레이더 차트**: Content, Structure 축에 5점 스케일로 A/B 점수 표시
- **점수 분해 테이블**: Correctness, Completeness, Accuracy (Content 축) / Organization, Formatting, Usability (Structure 축) 각 1–5점 나열
- **Text 근거**: "Output A is more complete (5/5 vs 3/5) but both have formatting issues"

### Hierarchical Data (스킬 목록)

**계층 1: 카테고리 섹션** (Marketplace):
- "⭐ 추천 스킬" (수평 carousel, 3–5개)
- "📄 문서 작성" (그리드 또는 리스트, 모두보기 링크)
- "📊 데이터 분석" (동일)
- ...

**계층 2: 카드 (3–4열 그리드)**:
- 각 카드: 아이콘 + 이름 + 설명(1줄) + 제작자 + 통과율 배지

**계층 3: 상세 페이지**:
- 헤더: 큰 아이콘 + 이름 + 제작자 + Eval 배지 (통과율, 보안)
- 탭: Overview / Evaluations / Versions / Team / (Share)
- 각 탭 내 접힘 섹션 (Accordion)

### Status/State Indicators

**스킬 카드 상태 배지**:
| 배지 | 색상/아이콘 | 의미 |
|------|-----------|------|
| 🔒 **필수** | Red Lock | 플랫폼/조직 강제 배포, 끌 수 없음 |
| ⭐ **추천** | Blue Star | 조직 추천, 기본 활성화, 끌 수 있음 |
| ✅ **승인됨** | Green Check | 승인 목록에 포함, 자유 추가/제거 |
| 🛡️ **검증됨** | Shield | 플랫폼 보안 검증 완료 |
| 👤 **내가 추가** | User Icon | 개인이 직접 추가 |
| ⚠️ **주의** | Orange Warning | Eval 실패율 높음 (<50%) |
| 🔄 **업데이트 가능** | Blue Arrow | 새 버전 사용 가능 |

**활성화 상태**:
| 상태 | 표현 | 설명 |
|------|------|------|
| Active | Toggle ON (Blue) | 현재 사용 중 |
| Inactive | Toggle OFF (Gray) | 설치되었지만 비활성화 |
| Installing | Spinner | 설치 진행 중 |
| Pending Approval | Hourglass Badge | 관리자 검토 대기 중 |
| Blocked | Red Lock Badge | 조직 정책에 의해 차단 |

### Volume Management (100+ 스킬)

**검색 & 필터**:
- **텍스트 검색**: 스킬 이름, 설명, 태그 색인 (사전 입력 자동완성)
- **카테고리 탭**: 6개 (전체, 문서, 데이터, 도구, 콘텐츠, 자동화, 도메인)
- **추가 필터** (dropdown):
  - 상태: 모두 / 활성화된 / 권장 / 새로운
  - 평가: 90%+ / 70–89% / <70%
  - 제작자: Anthropic / Partner / Team / Personal
  - 최근 업데이트: 이번주 / 이번달 / 3개월

**정렬**:
- 추천도 (관리자 설정)
- 인기도 (설치 수)
- 평가 점수 (높은 순)
- 최신 업데이트

**페이지네이션/가상 스크롤**:
- Phase 1: 페이지네이션 (20개 per page)
- Phase 2: 가상 스크롤 (무한 로드) for 500+ 스킬

---

## Component Mapping

| UI Element | Existing Component | New/Modified | Notes |
|------------|-------------------|-------------|-------|
| **Marketplace Grid** | — | New | src/components/features/skill-management/components/SkillMarketplace.tsx |
| **Search Bar** | — | New | src/components/features/skill-management/components/SearchBar.tsx (Radix Combobox) |
| **Category Filter Tabs** | CategoryFilterBar.tsx | Modified | 6개 시나리오 중심 카테고리 추가 |
| **Skill Card** | SkillCard.tsx | Modified | Eval 배지, 소스 배지, 상태 배지 추가 |
| **Skill Detail Panel** | SkillDetailPanel.tsx | Modified | Evaluations 탭 추가, 공유/공개 UI 통합 |
| **Eval Outputs Tab** | — | New | src/components/features/skill-management/components/EvalViewer/OutputsTab.tsx (generate_review.py 로직 적응) |
| **Eval Benchmark Tab** | — | New | src/components/features/skill-management/components/EvalViewer/BenchmarkTab.tsx (도넛 차트, 비교 막대) |
| **Formal Grades Accordion** | — | New | src/components/features/skill-management/components/EvalViewer/FormalGradesAccordion.tsx |
| **Version History Table** | VersionHistoryTable.tsx | Modified | Eval 배지, 롤백 버튼, 비교 링크 추가 |
| **Eval Quality Badge** | EvalQualityBadge.tsx | Modified | 백분율 + 색상 + 불확실성 표시 |
| **Skill Source Badge** | SkillSourceBadge.tsx | Existing | (이미 구현, 유지) |
| **Rollback Modal** | RollbackConfirmModal.tsx | Existing | (이미 구현, 영향 범위 표시 강화) |
| **Publish Workflow Modal** | — | New | src/components/features/skill-management/components/PublishWorkflow.tsx (변경 요약, 범위 선택) |
| **Update Notification Panel** | — | New | src/components/features/skill-management/components/UpdateNotificationPanel.tsx (Accept/Skip) |
| **Skill Creation Chat** | GeneralChatView | Existing | (기존 채팅, skill-creator 플로우 트리거) |
| **Skill Creation Artifact Panel** | ArtifactPanel.tsx | Modified | SKILL.md draft 렌더링, inline edit |
| **Test Case Form** | — | New | src/components/features/skill-management/components/TestCaseForm.tsx (eval prompt 리스트) |
| **Eval Runner Progress** | — | New | src/components/features/skill-management/components/EvalProgressIndicator.tsx (N/total 완료 표시) |
| **Comparison Sidebar** | — | New (Phase 2) | src/components/features/skill-management/components/ComparisonSidebar.tsx (Side-by-side Eval) |
| **Org Skill Policy Panel** | OrgSkillManagementPanel.tsx | Modified | 3계층 정책 (Mandatory/Recommended/Allowed/Blocked) UI 확대 |
| **Approval Queue** | SkillApprovalQueue.tsx | Modified | 요청 검토 UI (제목, 변경사항, 승인/거절 액션) |
| **Admin Analytics Dashboard** | — | New (Phase 2) | src/components/features/skill-management/components/AdminAnalyticsDashboard.tsx |

---

## Data Requirements

| Entity | Fields | Source | Existing Type | New Type Needed |
|--------|--------|--------|---------------|-----------------|
| **Skill** | id, name, description, category, tags, source (platform/partner/team/personal), version, created_at, updated_at | API | src/types/skill.types.ts | `SkillWithEval` (metadata + latestEvalSummary) |
| **SkillVersion** | version, skill_id, published_at, changelog, eval_id, eval_pass_rate, eval_improvement_delta, is_current_best | API | — | New: `SkillVersionWithEval` |
| **SkillEval** | id, skill_id, version, eval_name, pass_rate (with_skill), pass_rate (without_skill), delta, timestamp, assertions[], benchmark_summary, timing | S3 or backend | — | New: `SkillEvalResult` (from Anthropic benchmark.json schema) |
| **EvalAssertion** | text, passed (boolean), evidence | S3 | — | New: `Assertion` |
| **BenchmarkResult** | with_skill (pass_rate, time, tokens), without_skill (pass_rate, time, tokens), delta, notes | S3 | — | New: `BenchmarkSummary` |
| **SkillPolicy** | skill_id, tenant_id, team_id, policy_level (mandatory/recommended/allowed/blocked), applied_at, applied_by | API | — | New: `SkillPolicy` |
| **SkillShare** | skill_id, source_user_id, target_user_id/team_id, link_type (linked/forked), status (active/inactive), version_pinned | API | — | New: `SkillShare` (Phase 2) |
| **SkillUsage** | skill_id, user_id, activated_at, deactivated_at, call_count, success_count, failure_count | Analytics backend | — | New: `SkillUsageAnalytics` (Phase 2) |
| **UpdateNotification** | skill_id, user_id, old_version, new_version, created_at, status (pending/accepted/skipped) | API | — | New: `UpdateNotification` |

---

## Design Tokens

### 색상 (Eval 점수 기반)

**Pass Rate / Quality Score**:
- **Green** (#10b981): 90–100% (매우 양호, "추천")
- **Blue** (#3b82f6): 70–89% (양호, "사용 가능")
- **Yellow** (#f59e0b): 50–69% (주의 필요, "검토 권장")
- **Red** (#ef4444): 0–49% (개선 필요, "사용 권장 안 함")

**정책 상태**:
- **Lock Red** (#dc2626): Mandatory (필수, 끌 수 없음)
- **Star Blue** (#2563eb): Recommended (추천, 기본 활성)
- **Check Green** (#059669): Allowed (승인, 자유 추가/제거)
- **Gray** (#9ca3af): Blocked (차단)

**배지 배경**:
- Anthropic: Indigo-50
- Partner: Orange-50
- Team: Green-50
- Personal: Purple-50

### Typography

- **카드 제목**: font-semibold, text-base
- **카드 설명**: font-normal, text-sm, text-gray-600
- **배지 텍스트**: font-medium, text-xs
- **탭 제목**: font-semibold, text-lg
- **상세 섹션**: font-medium, text-sm

### Spacing

- **카드 패딩**: p-4
- **섹션 마진**: my-6
- **배지 갭**: gap-2
- **테이블 행 높이**: h-12

---

## Acceptance Criteria

1. [ ] **Marketplace 페이지** 구현:
   - [ ] 6개 카테고리별 그리드 표시 (최소 20개 스킬)
   - [ ] 검색바 + 필터 드롭다운 (상태, 평가, 제작자, 업데이트)
   - [ ] 스킬 카드 (이름, 설명, 제작자, Eval 배지, 소스 배지) 표시
   - [ ] "⭐ 추천" 섹션 (상위 3–5개 스킬)

2. [ ] **Skill Detail 페이지** 확장:
   - [ ] Overview 탭: 설명, 트리거, Eval 배지, 공유 버튼
   - [ ] Evaluations 탭:
     - [ ] Outputs 탭: eval 사례 선택 → Prompt + 결과물 렌더링 + 형식화 등급 (accordion)
     - [ ] Benchmark 탭: 도넛 차트 (통과율) + 막대 비교 (with/without) + 분석 노트
   - [ ] Versions 탭: 버전 히스토리 테이블 (버전명, 날짜, Eval 배지, 비교/롤백 버튼)

3. [ ] **Eval Quality Badge** 구현:
   - [ ] 원형 진행률 UI 또는 컬러코딩 숫자 표시
   - [ ] Green (90%+) / Blue (70–89%) / Yellow (50–69%) / Red (<50%)
   - [ ] Hover 시 "3개 중 2개 통과" 같은 상세 표시

4. [ ] **3계층 권한 UI**:
   - [ ] 카드 배지: "필수" (Red Lock) / "추천" (Blue Star) / "승인됨" (Green Check)
   - [ ] on/off 토글 상태: 필수는 비활성화, 추천/승인은 활성화 가능
   - [ ] Admin 패널: 정책 설정 (Mandatory/Recommended/Allowed/Blocked) UI

5. [ ] **Publish 워크플로우** (Phase 1 또는 2):
   - [ ] Skill Detail에 [공유] 또는 [팀에 공개] 버튼
   - [ ] Modal: 변경 요약 입력 + 범위 선택 (개인/팀/조직)
   - [ ] 확인 후 skill 상태 변경

6. [ ] **Eval Viewer 기본 기능**:
   - [ ] Eval 실행 결과 파일 로드 (with_skill, without_skill 디렉토리)
   - [ ] Outputs 탭: 파일 타입별 렌더링 (텍스트 inline, 이미지 base64, PDF iframe)
   - [ ] Benchmark 탭: benchmark.json 파싱 → 차트 표시
   - [ ] 피드백 textarea (auto-save)

7. [ ] **업데이트 알림** (Phase 2):
   - [ ] 원본 스킬 새 버전 퍼블리시 시 사용자에게 in-app 알림
   - [ ] 알림 클릭 → version-review 모달 (old vs new Eval 비교)
   - [ ] [업데이트 적용] / [이전 버전 유지] 선택

8. [ ] **비개발자 친화성**:
   - [ ] 모든 숫자는 백분율 (85%) 또는 자연어 ("양호")로 표현
   - [ ] 색상 신호 (Green/Yellow/Red) 우선
   - [ ] 원클릭 활성화/비활성화 (설치 과정 제거)
   - [ ] 1스크린 내 핵심 판단 정보 (스크롤 최소화)

9. [ ] **성능 & 접근성**:
   - [ ] 20+ 스킬 로드 시 <2초 (페이지네이션 또는 가상 스크롤)
   - [ ] 모든 배지, 버튼에 aria-label
   - [ ] 키보드 네비게이션 (Tab, Enter, Escape)
   - [ ] WCAG 2.1 AA 준수 (색상 대비, 포커스 표시)

10. [ ] **테스트 커버리지**:
    - [ ] EvalQualityBadge: 색상 매핑, 불확실성 표시
    - [ ] VersionHistoryTable: 정렬, 롤백 확인
    - [ ] BenchmarkTab: 차트 데이터 정확성, delta 계산
    - [ ] 메인 플로우: 스킬 발견 → 상세 → 활성화 → 업데이트

---

## Open Questions

1. **Eval 저장소**: Eval 결과(with_skill, without_skill, benchmark.json, grading.json)를 어디에 저장할 것인가?
   - 옵션 A: AWS S3 (대용량, 버전 관리 용이)
   - 옵션 B: 백엔드 DB (접근 제어 강화, 쿼리 최적화)
   - **영향**: IA의 데이터 파이프라인 결정

2. **Real-time Eval 실행**: 스킬 상세 페이지에서 사용자가 "이 스킬 다시 평가" 버튼을 클릭하면?
   - 백엔드에서 skill-creator의 subagent 워크플로우 재실행?
   - UI에서 진행 표시?
   - **영향**: Backend API 설계, EvalProgressIndicator 구현

3. **Skill 버전 관리 전략**: SKILL.md 내용 변경 시 자동 version bump 또는 수동?
   - Anthropic: 수동 (semantic versioning, publish 시)
   - **영향**: SkillDetailPanel의 버전 선택 로직, 업데이트 알림 트리거

4. **포크(Fork) vs 링크(Linked)**: 팀 공유 스킬을 개인이 커스터마이징하려면?
   - 독립 복사본(Forked) 생성 → 관리 부담 증가
   - 원본 동기화(Linked) + 개인 오버라이드 → 복잡성 증가
   - **영향**: Phase 2 SkillShare 모델, 관리자 대시보드

5. **승인 워크플로우 정책**: 조직 전체 공개 스킬은 누가 승인?
   - 플랫폼 관리자만?
   - 테넌트 관리자?
   - 워크플로우 수정 요청 가능?
   - **영향**: OrgSkillManagementPanel, SkillApprovalQueue 권한 설계

6. **Description 최적화 UX**: trigger eval을 몇 개 만들어야 하는가?
   - Anthropic: 20개 (8–10 should_trigger + 8–10 should_not_trigger)
   - 사용자가 수동으로 편집 가능한가?
   - **영향**: QueryListEditor UI 복잡도, run_loop.py 통합

7. **보안 검증**: 팀에서 공유된 스킬을 일반 사용자가 설치하면, 보안 리뷰 단계가 필요한가?
   - Anthropic: "신뢰할 수 있는 소스의 스킬만 사용"이라고 경고만 함
   - 코드 스캔 (Snyk 통합)?
   - **영향**: PublishWorkflow, 관리자 대시보드 보안 탭

8. **비개발자 대상**: Skill 설명, 트리거 조건을 한국어로만 제공?
   - 영어 원본도 병기?
   - 자동 번역?
   - **영향**: SkillCard, SkillDetailPanel의 다국어 구조

---

## Implementation Roadmap

### Phase 1 (MVP — 4–6주)

**목표**: 20–50개 스킬로 시작하는 기본 마켓플레이스 + Eval 시각화

- [ ] Marketplace 페이지 (카테고리, 검색, 그리드)
- [ ] Skill Detail 확장 (Evaluations 탭: Outputs + Benchmark)
- [ ] EvalQualityBadge (색상 코딩)
- [ ] Version History Table (기본)
- [ ] 3계층 권한 배지 표시
- [ ] on/off 토글 (기존 유지)
- [ ] 비개발자 친화 색상/텍스트

### Phase 2 (Advanced — 6–8주)

**목표**: 팀 공유, 대화형 생성, Eval 고급 기능

- [ ] Publish 워크플로우
- [ ] 팀 스킬 라이브러리
- [ ] 업데이트 알림 + Accept/Skip
- [ ] Skill Creation Chat (Intent Interview)
- [ ] Test Case Form + Eval Runner UI
- [ ] Side-by-side 버전 비교
- [ ] Rollback UI 강화
- [ ] 관리자 대시보드 기본 (정책 설정, 승인 대기열)

### Phase 3 (Polish — 4–6주)

**목표**: 500+ 스킬 지원, 고급 분석, 포크/링크 추적

- [ ] 가상 스크롤 (500+ 스킬)
- [ ] AI 시맨틱 검색
- [ ] Description 최적화 UI
- [ ] Blind A/B Compare (Comparator agent)
- [ ] 사용량 분석 대시보드
- [ ] 포크/링크 상태 추적
- [ ] 라이브러리 애널리틱스
- [ ] 스킬 스프롤 자동 아카이브

---

## References

**Anthropic Skill Creator**:
- `.skills/skills/skill-creator/SKILL.md` (Intent Interview, Eval System, Comparator, Analyzer patterns)
- `eval-viewer/generate_review.py` (HTML 평가 뷰어 로직)
- `scripts/run_loop.py` (Description Optimization algorithm)
- `references/schemas.md` (evals.json, grading.json, benchmark.json, comparison.json schemas)

**벤치마크 제품**:
- Figma Library Publish (3-level sharing, update notification, publisher model)
- Slack Enterprise Grid (3-level policy management, approval workflow)
- Microsoft Teams (app permission policies, pre-install vs allow, managed vs personal)
- Tessl Registry (skill review 3-axis, task evals, security integration)
- VS Code Marketplace (extension card, version history, ratings)
- Allure Report (test visualization: donut chart, trend graph, timeline)
- Docker Hub (tag table with inline vulnerability badges, exploit of inline metadata pattern)

**팀 협업**:
- Zapier Shared Folders (folder-based sharing, app credential isolation)
- Notion Workspace Hierarchy (Open/Closed/Private access levels)
- Make Teams (public vs team templates, ownership transfer)

**기존 코드베이스**:
- `src/components/features/skill-management/*` (현재 구현)
- `src/components/ChatInterface.tsx`, `GeneralChatView.tsx` (Chat 통합 기반)
- `src/types/skill.types.ts` (기존 타입 정의)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-19 | Claude Agent (research-to-spec) | Initial synthesis from 7 research documents, comprehensive IA v2 |

---

**이 문서는 /research/task3-skill-management/의 모든 7개 리서치 파일과 기존 구현을 종합하여 작성되었습니다.**
