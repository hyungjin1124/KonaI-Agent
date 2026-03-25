# Code Review Report — 2026-03-24

## Target
`src/components/features/skill-management/` (v4 신규 컴포넌트 집중)  
추가 검토: `src/app/skills/page.tsx`, `src/components/Sidebar.tsx`, `src/constants/navigation.ts`, `src/types/skill-management.types.ts`

## Summary
총 52개 파일(skill-management 디렉토리) + 3개 외부 파일을 검토했다. v4 신규 컴포넌트(SkillsPageView, TeamSkillsTab, SkillTable, SkillSlidePanel, 5개 탭, admin 4개)는 TypeScript strict mode를 준수하고 보안 취약점(XSS, eval 등)이 없어 전반적으로 양호하다. 그러나 v3 레거시 컴포넌트의 타입 시스템 파괴(48개 TS 에러), 환경변수 기반 관리자 권한 게이트의 클라이언트 사이드 우회 가능성, 미사용 admin 서브컴포넌트 2개(DeprecationQueue.tsx, CategoryManager.tsx), 중복된 카테고리 매핑 상수 등 17건의 이슈가 식별되었다.

## Critical Issues
| File | Line | Issue | Suggested Fix |
|------|------|-------|---------------|
| `src/components/features/skill-management/SkillsPageView.tsx` | 10 | **권한 우회 위험**: `IS_ADMIN`이 `process.env.NEXT_PUBLIC_SKILL_ADMIN !== 'false'`로 설정되어, 기본값이 `true`(env 미설정 시 admin 접근 허용). 클라이언트 사이드 환경변수이므로 빌드 타임에 번들에 포함되며, 브라우저 개발자 도구로 탭 렌더링을 강제할 수 있다. | 인증 컨텍스트(useAuth)에서 역할을 확인하는 방식으로 전환 필요. 최소한 서버 컴포넌트에서 세션 검증 후 prop으로 전달할 것. 현재 주석(`Phase 1: env-var based admin gate`)이 있으므로 스프린트 내 해결 계획이 있는지 확인 |
| `src/components/features/skill-management/data/skillMockData.ts` | 459-468 | **`any` 타입 5개**: 레거시 호환 export(`mockSkills`, `mockTeamPublishedSkills`, `mockApprovalRequests`, `mockUsageStats`, `mockAuditLogs`)가 모두 `any[]`로 선언됨. strict mode에서 타입 안전성 파괴 | v3 SkillManagementView가 참조하는 구 타입(`Skill`, `SkillApprovalRequest` 등)을 별도 파일(`legacy.types.ts`)로 분리하고, 해당 export에 구체 타입 적용. 또는 v3 뷰를 완전 제거 후 이 export 삭제 |
| `src/components/features/skill-management/SkillManagementView.tsx` | 전체(809줄) | **레거시 v3 뷰에서 48개 TypeScript 컴파일 에러 발생**: `Skill`, `SkillVersion`, `SkillSource`, `SkillDeployPolicy` 등 v3 타입이 `skill-management.types.ts`에서 제거되면서, 이 파일과 17개 하위 컴포넌트가 빌드 시 타입 에러 발생. `src/components/SkillManagementView.tsx`(배럴 파일)가 이 파일을 re-export하므로 트리셰이킹 되지 않으면 빌드 실패 가능 | v3 컴포넌트를 완전 제거하거나, 구 타입을 `legacy.types.ts`로 분리하여 임포트 경로 유지. `src/app/settings/skills/page.tsx`가 v3를 참조하는지 확인 후 v4 라우트(`/skills`)로 통합 |

## Major Issues
| File | Line | Issue | Suggested Fix |
|------|------|-------|---------------|
| `src/components/features/skill-management/components/SkillSlidePanelHeader.tsx` | 32 | **하드코딩된 사용자 ID**: `CURRENT_USER_ID = 'user-hong'`이 상수로 선언. `TeamSkillsTab.tsx`(L263)는 `CURRENT_USER` 객체에서 `isAdmin`을 참조하지만 같은 파일에서는 별도 상수. 향후 인증 연동 시 동기화 실패 위험 | `CURRENT_USER` 객체를 import하여 `CURRENT_USER.id` 사용, 또는 prop으로 `currentUserId` 전달 |
| `src/components/features/skill-management/components/admin/AdminTab.tsx` | 104-221, 227-273, 279-318 | **중복 구현**: `DeprecationQueue`와 `CategoryManagementSection`이 AdminTab.tsx 내부에 인라인 정의되어 있으나, `admin/DeprecationQueue.tsx`(330줄)와 `admin/CategoryManager.tsx`(275줄)에 더 완성도 높은 별도 컴포넌트가 존재. 인라인 버전은 필터링, 확장 행, role tablist 등이 없는 간소판 | 별도 파일의 `DeprecationQueue`와 `CategoryManager`를 import하여 사용하고, 인라인 버전 제거. AdminTab.tsx를 565줄에서 ~200줄로 축소 가능 |
| `src/components/features/skill-management/components/TeamSkillsTab.tsx` | 87, 106 | **setTimeout 기반 toast 관리**: `showToast`에서 `setTimeout(() => setToast(null), 3000)` 사용. cleanup 없이 unmount 시 state 업데이트 시도하면 React 경고 발생. 또한 `handleToggleActivation`(L106)에서 `setTimeout(() => showToast(...), 0)`으로 setState 콜백 내 비동기 호출은 예측 불가능한 타이밍 유발 | `useEffect`에서 cleanup 타이머 관리하거나, NotificationContext 등 전역 toast 시스템 활용. `setTimeout(fn, 0)` 패턴 대신 setState 완료 후 별도 effect에서 toast 호출 |
| `src/components/features/skill-management/components/TeamSkillsTab.tsx` | 191 | **고정 높이 인라인 스타일**: `style={{ height: 'calc(100vh - 64px)' }}`. 내비게이션 높이가 변경되면 깨짐. 반응형 환경(모바일, 여러 내비바 높이)에서 불안정 | `h-[calc(100vh-64px)]` Tailwind 임의값 사용하거나, CSS 변수(`--nav-height`)로 관리 |
| `src/components/features/skill-management/SkillsPageView.tsx` | 30-42, 48-58 | **접근성 - 탭 트리거에 role/aria 속성 누락**: Radix TabsTrigger가 기본 제공하는 접근성은 있지만, 커스텀 className 오버라이드로 시각적 상태만 처리. 관리 탭의 badge 카운트에 `aria-label` 없음 | badge에 `aria-label={${pendingSuggestionCount}건 대기 중}` 추가, 또는 `sr-only` span 추가 |
| `src/components/features/skill-management/components/SkillTable.tsx` | 129-140 | **EmptyState 버튼에 onClick 핸들러 없음**: `EmptyState` 컴포넌트의 "스킬 가져오기"와 "새 스킬 만들기" 버튼이 클릭 시 아무 동작도 하지 않음. prop으로 핸들러를 받지 않음 | `EmptyState`에 `onAddFromFile`, `onAddFromChat` prop 추가하고, `SkillTable`을 통해 전달 |
| `src/components/features/skill-management/components/admin/SuggestionReviewModal.tsx` | 218 | **인라인 스타일로 Dialog 크기 고정**: `style={{ maxWidth: '860px', width: '90vw', maxHeight: '90vh' }}`. Tailwind 클래스와 혼용 | `className="max-w-[860px] w-[90vw] max-h-[90vh]"` Tailwind 임의값으로 통일 |

## Minor Issues
| File | Line | Issue | Suggested Fix |
|------|------|-------|---------------|
| `src/components/features/skill-management/components/SkillSlidePanelHeader.tsx` L17-29, `tabs/OverviewTab.tsx` L11-23 | - | **중복 상수**: `CATEGORY_COLORS`, `CATEGORY_LABELS`가 SkillSlidePanelHeader.tsx와 OverviewTab.tsx에 각각 독립 정의. SkillTableRow.tsx에도 `CATEGORY_CONFIG` 별도 정의 | 공유 상수 파일(`data/categoryConfig.ts`)로 추출하여 단일 소스 유지 |
| `src/components/features/skill-management/components/SkillSlidePanelHeader.tsx` L17, `tabs/OverviewTab.tsx` L11 | - | **`Record<string, string>` 대신 `Record<SkillCategory, string>` 사용 필요**: 카테고리 매핑에 `string` 키 타입 사용으로 오타 방지 불가 | `Record<SkillCategory, string>`으로 변경하여 타입 안전성 확보 |
| `src/components/features/skill-management/components/admin/DeprecationQueue.tsx` | 전체 | **미사용 컴포넌트**: 330줄 분량이나 어디서도 import하지 않음 | AdminTab.tsx에서 인라인 버전 대신 이 파일을 사용하거나, 사용 계획이 없으면 삭제 |
| `src/components/features/skill-management/components/admin/CategoryManager.tsx` | 전체 | **미사용 컴포넌트**: 275줄 분량이나 어디서도 import하지 않음 | 위와 동일 |
| `src/components/features/skill-management/SkillManagementView.tsx` | 전체(809줄) | **500줄 초과 복잡도**: v3 레거시 뷰가 809줄로 복잡도 임계치 초과 | v4 전환 완료 후 삭제 예정이라면 deprecation 주석 추가. 유지한다면 분리 필요 |
| `src/components/features/skill-management/components/admin/AdminTab.tsx` | 전체(565줄) | **500줄 초과 복잡도**: 4개 섹션(SuggestionQueue, DeprecationQueue, SkillManagement, CategoryManagement)을 모두 인라인 포함 | 별도 컴포넌트 파일 활용(이미 존재)하여 orchestrator 패턴으로 경량화 |
| 다수 파일 | - | **하드코딩된 `#FF3C42` 컬러 25회 이상 사용**: `bg-[#FF3C42]`, `text-[#FF3C42]`, `hover:bg-[#e0353a]` 등 브랜드 컬러가 매직 값으로 반복 | `tailwind.config.ts`에 `brand-primary: '#FF3C42'` 토큰 정의 후 `bg-brand-primary` 등으로 통일(일부는 이미 `bg-brand-primary` 사용 중) |

## Quick Wins (Top 5)
1. `components/SkillSlidePanelHeader.tsx` L32: 하드코딩 `CURRENT_USER_ID`를 `CURRENT_USER.id` import로 변경 -- est. 5min
2. `components/admin/AdminTab.tsx`: 인라인 `DeprecationQueue`/`CategoryManagementSection` 제거, 기존 `admin/DeprecationQueue.tsx`와 `admin/CategoryManager.tsx` import 연결 -- est. 20min
3. `data/skillMockData.ts` L459-468: 레거시 `any[]` export를 빈 typed 배열 또는 `never[]`로 변경 -- est. 5min
4. `CATEGORY_COLORS`, `CATEGORY_LABELS` 중복 3곳 -> `data/categoryConfig.ts`로 추출 -- est. 15min
5. `components/TeamSkillsTab.tsx` L87: toast setTimeout에 cleanup 추가 (useRef + useEffect 패턴) -- est. 10min

## Metrics
- Files reviewed: 24 (v4 신규 20 + 외부 참조 4)
- Total issues: 17 (Critical: 3 / Major: 7 / Minor: 7)
- Estimated fix time (Quick Wins only): 55min
