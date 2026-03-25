# 에이전트 서비스 프로젝트 — 태스크 컨텍스트

> 업데이트됨: 2026-03-18
> 이 파일은 5가지 핵심 태스크를 실제 코드베이스 위치에 매핑합니다.
> 에이전트와 스킬은 목표 해결을 위해 이 파일을 참조합니다.

## 5개 태스크 (수정된 코드베이스 매핑 포함)

### 태스크 1: 고객사 관리자 페이지 개선 (P0)
- **목표**: UI/UX 검토 후 Quick Wins 수정, 이후 전략적 항목 진행
- **주요 도구**: Claude Code (`/review-page admin`)
- **대상 파일**:
  - `src/app/admin/page.tsx` — AdminView 지연 로드
  - `src/components/AdminView.tsx` (372줄, 6개 탭)
  - `src/types/admin.types.ts` (244줄, 15개 도메인 역할, 19개 ERP 모듈)
- **핵심 관심사**: RBAC 15-역할 권한 매트릭스 UI, 3단계 사용자 마법사 모달, 조직도 시각화
- **상태**: 미착수

### 태스크 2: 플랫폼 관리자 화면 개선 (P1)
- **목표**: 서비스 제공자(코나체인 팀)가 사용하는 플랫폼 관리 화면 확장
- **명확화**: CONTEXT.md에서 "내부 팀 관리자 화면 신규 개발"로 기술되었으나, 실제로는 기존 `/platform-admin` 경로를 개선·확장하는 작업
- **주요 도구**: Claude web (리서치) → Claude Code (구현)
- **대상 파일**:
  - `src/app/platform-admin/page.tsx` — PlatformAdminView 지연 로드
  - `src/components/features/platform-admin/PlatformAdminView.tsx` (59줄, 4개 탭)
  - 하위 컴포넌트: TenantManagementTab, UsageAlertTab, BillingTab, PlatformAuditLogTab
  - Mock 데이터: `src/components/features/platform-admin/data/` (5개 파일)
- **핵심 관심사**: 멀티테넌트 관리 UX, 사용량 알림 규칙, 빌링 자동화, 플랫폼 감사 로그
- **상태**: 미착수

### 태스크 3: 스킬 관리 화면 확장 (P1)
- **목표**: 에이전트 스킬 관리 화면에 최신 Anthropic Skills 시스템 반영 (skill-creator 2026-03 업데이트, 팀/조직별 스킬 관리, 마켓플레이스 확장)
- **명확화**: 기존 화면(`SkillManagementView.tsx`)을 기반으로 기능 확장. 신규 개발이 아님
- **주요 도구**: Claude web (리서치) → Claude Code (구현)
- **대상 파일**:
  - `src/app/settings/skills/page.tsx` — SkillManagementView 지연 로드
  - `src/components/SkillManagementView.tsx` (254줄, 3개 탭: 모두/내 스킬/스킬 탐색기)
  - `src/components/SkillUploadModal.tsx`
  - 관련: `src/app/settings/marketplace/page.tsx`
- **리서치 주제**: Anthropic skill-creator 2026년 3월 업데이트, 팀/조직별 스킬 공유, 스킬 버전 관리, 스킬 마켓플레이스 UX 패턴
- **상태**: 미착수

### 태스크 4: Production 레벨 기능 갭 분석 (P2)
- **목표**: 프로덕션 런칭 전 코드베이스 대비 체크리스트 점검
- **주요 도구**: Claude Code (`gap-analysis` 스킬)
- **범위**: 전체 프론트엔드 코드베이스 (`src/`)
- **평가 기준**: Auth, Security, Monitoring, Stability, Operations, UX/A11y, Cost/Usage
- **핵심 관심사**: Multi-tenant SaaS, 15-역할 RBAC, RLS + 컬럼 마스킹, LangChain/LangGraph 백엔드
- **상태**: 미착수

### 태스크 5: NVIDIA Agent Toolkit 리서치 & 팀 공유 (P0)
- **목표**: 기술 도입 검토 + 팀 지식 공유 + 제품 기능 확장 가능성 조사
- **주요 도구**: Claude web (Deep Research) + Claude Code (`researcher` 에이전트)
- **평가 기준**: Stack compatibility, maturity, feature value, migration effort, community, license
- **비교 기준**: 현재 LangChain/LangGraph 기반 아키텍처
- **출력**: `./research/nvidia-agent-toolkit.md` → 팀 공유 문서
- **상태**: 미착수

## 스킬 → 태스크 매핑

| 스킬 | 태스크 1 | 태스크 2 | 태스크 3 | 태스크 4 | 태스크 5 |
|-------|:------:|:------:|:------:|:------:|:------:|
| review-page | ✅ 주요 | ✅ | ✅ | | |
| code-review-workflow | ✅ | ✅ | ✅ | | |
| research-to-spec | | ✅ | ✅ | | |
| gap-analysis | | | | ✅ 주요 | |
| build-demo | | ✅ | ✅ | | |
| researcher (에이전트) | | ✅ | ✅ | | ✅ 주요 |

## 에이전트 → 태스크 매핑

| 에이전트 | 태스크 1 | 태스크 2 | 태스크 3 | 태스크 4 | 태스크 5 |
|-------|:------:|:------:|:------:|:------:|:------:|
| code-reviewer | ✅ | ✅ | ✅ | | |
| ux-reviewer | ✅ | ✅ | ✅ | | |
| researcher | | ✅ | ✅ | | ✅ |
