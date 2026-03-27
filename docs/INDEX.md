# KonaI-Agent 문서 인덱스

> 최종 갱신: 2026-03-25
> 워크플로우: 리서치 → 기획 → IA 설계 → 와이어프레임 구현 (KonaI-Agent)

---

## 워크플로우 흐름도

```
리서치 (research/)          →  기획 (planning/)      →  IA 설계 (design/)        →  구현 (src/)
━━━━━━━━━━━━━━━━━━━━━        ━━━━━━━━━━━━━━━        ━━━━━━━━━━━━━━━━━━━        ━━━━━━━━━
경쟁사·패턴 분석               서비스 기획서            정보구조·메뉴·컴포넌트       Next.js 코드
                              상세기획서               피처 아키텍처
                                                      개별 IA 문서

    research/ux-patterns/       planning/              design/ia-design/          src/app/
    research/{topic}/                                  design/ia-research-plan    src/components/
                                                                                 src/hooks/
```

---

## 폴더 목적

| 폴더 | 목적 | 읽는 시점 |
|------|------|----------|
| **planning/** | 서비스 기획서, 상세기획서, 스킬 메뉴 브레인스토밍 등 **제품 방향성과 요구사항**을 정의하는 문서 | 프로젝트 컨텍스트 파악, 새 기능 기획 시 |
| **research/** | 경쟁사 분석, UX 패턴, 기술 벤치마크 등 **설계 의사결정의 근거**가 되는 리서치 문서 | IA 설계 전, 특정 피처 패턴 참조 시 |
| **research/ux-patterns/** | IA 설계에 **직접 입력**되는 영역별(대시보드·데이터·스킬·관리자·GNB 등) UX 패턴 분석 | 해당 IA 섹션 작업 시 |
| **research/skill-management/** | 스킬 생성·버저닝·평가·배포·공유 등 **스킬 관리 도메인** 심층 리서치 | 03-skill-ia.md 작업 시 |
| **research/platform-admin/** | 멀티테넌트 관리, 플랫폼 대시보드, 테넌트 라이프사이클 등 **관리자 도메인** 리서치 | 관리자 IA·권한 설계 시 |
| **research/nvidia/** | NVIDIA Agent Toolkit 통합 가능성 평가 | NVIDIA 연동 검토 시 |
| **design/** | IA 설계 결과물 — 정보구조, 메뉴 구조, 피처 아키텍처, 리서치→설계 브릿지 | 구현 착수 전 설계 확인 시 |
| **reports/** | 코드 리뷰, UX 리뷰, 우선순위 매트릭스 등 **품질 점검 결과** | 리뷰 후 수정 작업 시 |
| **references/** | 외부 참조 자료 — 관리자 HTML 프로토타입, 엑셀 모델, 데모 시나리오, AI 트렌드 슬라이드 | 필요 시 참조 |

---

## 현재 문서 (Active)

### 기획 — `planning/`

| 파일 | 설명 | 작성일 |
|------|------|--------|
| **KonaI-Agent-상세기획서.md** | 전체 프로덕트 상세 기획 (v1.0) | 2026-03-16 |
| **service-plan.md** | 서비스 기획서 — 리서치·설계의 컨텍스트 앵커 | 2026-03-24 |
| **skill-ia-review.md** | 스킬 IA 2차 리뷰 결과 (03-skill-ia v4.1 기준) | 2026-03-24 |
| **skill-menu-brainstorm.md** | 스킬 메뉴 구조 브레인스토밍 | 2026-03-23 |

### IA 설계 — `design/ia-design/`

| 파일 | 버전 | 설명 | 작성일 |
|------|------|------|--------|
| **information-architecture.md** | v4 | 전체 시스템 IA — 15개 리서치 문서 기반 | 2026-03-22 |
| **03-skill-ia.md** | **v7 (최신)** | 스킬 관리 IA — copy model, AI 변경 인사이트 | 2026-03-24 |
| **feature-architecture.md** | — | 피처 구조 설계 | 2026-03-21 |
| **menu-structure.md** | — | GNB·메뉴 구조 확정 | 2026-03-21 |
| **feature-map.html** | — | 인터랙티브 피처 맵 시각화 | 2026-03-21 |
| **ia-reference-from-plan.md** | — | service-plan.md에서 파생된 IA 레퍼런스 | 2026-03-21 |

| 브릿지 문서 | 설명 | 작성일 |
|-------------|------|--------|
| **design/ia-research-plan.md** | 리서치→설계 브릿지 (13개 리서치 태스크 정의) | 2026-03-20 (갱신 3/23) |
| **design/ia-tree.html** | IA 트리 인터랙티브 시각화 | 2026-03-22 |

### 리서치 — `research/`

#### 스킬 관리 (`research/skill-management/`, 4개 활성)

| 파일 | 핵심 주제 | 작성일 |
|------|----------|--------|
| **anthropic-skill-creator-2026-march-update.md** | Anthropic 스킬크리에이터 3월 업데이트 | 2026-03 |
| **skill-creator-ux-workflow-patterns.md** | 스킬 생성 워크플로우 패턴 | 2026-03 |
| **skill-versioning-with-eval-results.md** | 버저닝·평가 UI 패턴 + 평가 데이터 구조 (**병합**) | 2026-03-25 |
| **skill-discovery-and-distribution-patterns.md** | 마켓플레이스 UX + 팀 공유 워크플로우 (**병합**) | 2026-03-25 |

> 병합 원본 → `skill-management/archive/` 참조

#### 플랫폼 관리자 (`research/platform-admin/`, 3개 활성)

| 파일 | 핵심 주제 | 작성일 |
|------|----------|--------|
| **ai-platform-admin-dashboard-patterns.md** | OpenAI·Anthropic·AWS Bedrock·LangSmith 대시보드 | 2026-03 |
| **platform-admin-patterns.md** | Vercel·Supabase·Retool 멀티테넌트 패턴 | 2026-03 |
| **multi-tenant-lifecycle-and-extension-governance.md** | 테넌트 라이프사이클 + 멀티테넌트 확장 관리 (**병합**) | 2026-03-25 |

> 병합 원본 → `platform-admin/archive/` + `skill-management/archive/` 참조

#### UX 패턴 (`research/ux-patterns/`, 8개) — IA 설계의 직접 입력

| 파일 | 대응 IA 영역 | 작성일 |
|------|-------------|--------|
| **01-dashboard.md** | 홈·대시보드 IA | 2026-03-20 |
| **02-data.md** | 데이터 거버넌스 IA | 2026-03-20 |
| **03-skill.md** | → 03-skill-ia.md 직접 입력 | 2026-03-20 |
| **03-skill-more.md** | SKILL.md 오픈 표준 분석 → 스킬 거버넌스 | 2026-03-23 |
| **04-scheduled-tasks.md** | 스케줄링·자동화 IA | 2026-03-20 |
| **05-admin.md** | 관리자 IA | 2026-03-20 |
| **06-gnb.md** | GNB 구조 비교 | 2026-03-20 |
| **ai-summary-block-ui-patterns.md** | 버전 히스토리 UI → 03-skill-ia 반영 | 2026-03 |

> 교차 참조: 01-dashboard ↔ ai-platform-admin-dashboard-patterns, 02-data ↔ 05-admin (각 파일 하단 참조)

#### NVIDIA (`research/nvidia/`, 2개)

| 파일 | 핵심 주제 | 작성일 |
|------|----------|--------|
| **nvidia-agent-toolkit.md** | NVIDIA Agent Toolkit 통합 평가 | 2026-03-19 |
| **nvidia-agent-toolkit-deep.md** | 에코시스템 심층 분석 | 2026-03-19 |

#### 기타

| 파일 | 설명 |
|------|------|
| **rag-knowledge-base-ui-patterns-2026-03-11.md** | RAG 지식베이스 UI 패턴 |

### 참고자료 — `references/`

| 파일 | 설명 | 상태 |
|------|------|------|
| **admin/platform_admin_consolidated_v3.html** | 플랫폼 관리자 통합 HTML (v3) | CURRENT |
| **admin/*.xlsx** (3개) | 데이터 접근권한, 역할 시나리오, 보안 모델 | CURRENT |
| **admin/*.svg** (2개) | 보안·역할 아키텍처 다이어그램 | CURRENT |
| **Claude-Cowork/** | AI 트렌드 프레젠테이션 슬라이드 (15개 MD) | CURRENT |
| **Claude Cowork with Artifacts.jpg** | 참조 이미지 | CURRENT |
| **demo-scenario-admin-platform-skill.docx** | 관리자 플랫폼 스킬 데모 시나리오 | CURRENT |

### 리포트 — `reports/`

| 폴더 | 기간 | 최신 리포트 | 설명 |
|------|------|-----------|------|
| **skill-management-v4/** | 2026-03-24 | code-review, ux-review | **최신 반복** |
| **skills/** | 03-18 ~ 03-24 | ux-review-2026-03-24 | **최신 반복** |
| **admin/** | 03-18 ~ 03-19 | ux-priority-2026-03-19 | 초기 리뷰 |
| **platform-admin/** | 03-18 ~ 03-19 | ux-priority-2026-03-19 | 초기 리뷰 |

기타: `TASK-CONTEXT.md` (5개 핵심 태스크 라우팅), `fix-progress-2026-03-19.md`

---

## 버전 계보 (Version Lineage)

### 스킬 관리 IA — 가장 복잡한 문서 계보

```
v1  (2026-03-18)  design/archive/skill-management-ia.md        [DRAFT, 6개 리서치]
 ↓
v2  (2026-03-19)  design/archive/skill-management-ia-v2.md     [COMPLETE, 7개 리서치]
 ↓  (이름 체계 변경: skill-management-ia → 03-skill-ia)
v5  (2026-03-24)  design/ia-design/03-skill-ia-v5-archive.md   [chat edit, side-by-side diff]
 ↓
v6  (2026-03-24)  design/ia-design/03-skill-ia-v6-archive.md   [shared drive→copy model]
 ↓
v7  (2026-03-24)  design/ia-design/03-skill-ia.md              [CURRENT - manual edit 제거, AI 인사이트]
```

> v3~v4는 현재 트리에 없음 (이전 정리 시 제거된 것으로 추정)

### 전체 IA — 분리·통합 이력

```
개별 IA 문서 (2026-03-21)
  design/ia-design/archive/dashboard-ia.md
  design/ia-design/archive/data-ia.md
  design/ia-design/archive/admin-ia.md
  design/ia-design/archive/skill-ia.md (v1)
  design/ia-design/archive/cross-menu-connections.md
    ↓  (통합)
  design/ia-design/information-architecture.md (v4, 2026-03-22) [CURRENT]
  design/ia-design/feature-architecture.md (2026-03-21)         [CURRENT]
  design/ia-design/menu-structure.md (2026-03-21)               [CURRENT]
```

### 리서치 병합 이력 (2026-03-25)

```
skill-versioning-eval-ui-patterns.md + skills-eval-ui-patterns.md
    → skill-versioning-with-eval-results.md  [skill-management/]
    원본 → skill-management/archive/

skill-marketplace-ux-analysis.md + team-skill-sharing-patterns.md
    → skill-discovery-and-distribution-patterns.md  [skill-management/]
    원본 → skill-management/archive/

tenant-lifecycle-ux-patterns.md + multi-tenant-extension-management-patterns.md
    → multi-tenant-lifecycle-and-extension-governance.md  [platform-admin/]
    원본 → platform-admin/archive/ + skill-management/archive/
```

---

## 아카이브 (Archive) — 참고용, 현재 작업에는 불필요

### 리서치 아카이브

#### `research/archive/` — 프롬프트 메타 문서

| 파일 | 설명 |
|------|------|
| research-prompts.md | 6관점 딥 리서치 프롬프트 셋 |
| task2-supplementary-research-prompts.md | 플랫폼 관리자 보충 리서치 프롬프트 |
| task3-supplementary-research-prompts.md | 스킬 관리 보충 리서치 프롬프트 |

#### `research/skill-management/archive/` — 병합 원본

| 파일 | 병합된 문서 |
|------|-----------|
| skill-versioning-eval-ui-patterns.md | → skill-versioning-with-eval-results.md |
| skills-eval-ui-patterns.md | → skill-versioning-with-eval-results.md |
| skill-marketplace-ux-analysis.md | → skill-discovery-and-distribution-patterns.md |
| team-skill-sharing-patterns.md | → skill-discovery-and-distribution-patterns.md |
| multi-tenant-extension-management-patterns.md | → platform-admin/multi-tenant-lifecycle-and-extension-governance.md |

#### `research/platform-admin/archive/` — 병합 원본

| 파일 | 병합된 문서 |
|------|-----------|
| tenant-lifecycle-ux-patterns.md | → multi-tenant-lifecycle-and-extension-governance.md |

### 설계 아카이브 — `design/archive/`

| 파일 | 대체된 문서 | 작성일 |
|------|-----------|--------|
| skill-management-ia.md | → v2 → ... → 03-skill-ia.md (v7) | 2026-03-18 |
| skill-management-ia-v2.md | → 03-skill-ia v5+ | 2026-03-19 |
| platform-admin-ia.md | → information-architecture.md | 2026-03-18 |
| improvement-plan-2026-03-19.md | → feature-architecture.md | 2026-03-19 |
| phase2-implementation-plan.md | → feature-architecture.md | 2026-03-19 |
| ia-design-prompts.md | 설계 프로세스 기록용 | 2026-03-20 |

### IA 버전 아카이브 — `design/ia-design/archive/`

| 파일 | 역할 |
|------|------|
| 03-skill-ia-v5-archive.md | v5 롤백 참조용 |
| 03-skill-ia-v6-archive.md | v6 롤백 참조용 |
| dashboard-ia.md | 통합 전 대시보드 IA |
| data-ia.md | 통합 전 데이터 IA |
| admin-ia.md | 통합 전 관리자 IA |
| skill-ia.md | v1 스킬 IA |
| cross-menu-connections.md | 교차 메뉴 연결 분석 |

### 참고자료 아카이브 — `references/archive/`

| 파일 | 이유 | 작성일 |
|------|------|--------|
| chatui-refactoring-plan.md | feature-architecture로 대체 | 2026-02-02 |
| tool-ui-refactoring-plan.md | v2로 대체 → IA 설계로 대체 | 2026-02-02 |
| tool-ui-refactoring-plan-v2.md | IA 설계로 대체 | 2026-02-02 |
| PPT 생성 시나리오.md | 초기 시나리오 문서 | 2026-01-31 |

---

## 빠른 참조: "지금 뭘 봐야 하나?"

**기획 시작점**: `planning/service-plan.md` → `planning/KonaI-Agent-상세기획서.md`

**IA 설계 전체 그림**: `design/ia-design/information-architecture.md` (v4)

**스킬 관리 최신 설계**: `design/ia-design/03-skill-ia.md` (v7)

**리서치 근거 찾기**: `design/ia-research-plan.md` → 해당 `research/ux-patterns/` 파일

**코드 리뷰 최신**: `reports/skill-management-v4/` (2026-03-24)

**피처별 리서치 찾기**:

| 피처 | 리서치 폴더 |
|------|-----------|
| 스킬 관리 | `research/skill-management/` + `research/ux-patterns/03-skill*.md` |
| 플랫폼 관리자 | `research/platform-admin/` + `research/ux-patterns/05-admin.md` |
| 대시보드 | `research/ux-patterns/01-dashboard.md` |
| 데이터 거버넌스 | `research/ux-patterns/02-data.md` |
| 스케줄링 | `research/ux-patterns/04-scheduled-tasks.md` |
| GNB | `research/ux-patterns/06-gnb.md` |
| NVIDIA 통합 | `research/nvidia/` |
