# Code Review Report — 2026-03-18

## Target

```
src/app/admin/page.tsx
src/app/platform-admin/page.tsx
src/components/AdminView.tsx
src/components/Sidebar.tsx
src/components/ui/confirm-dialog.tsx
src/components/ui/error-boundary.tsx
src/components/features/permission-settings/PermissionSettingsView.tsx
src/components/features/permission-settings/components/AccessMatrixCell.tsx
src/components/features/permission-settings/components/ColumnMaskingLayer.tsx
src/components/features/permission-settings/components/ConflictPreviewPanel.tsx
src/components/features/permission-settings/components/OrgRoleMappingManager.tsx
src/components/features/permission-settings/components/RoleDefinitionManager.tsx
src/components/features/permission-settings/components/RowSecurityLayer.tsx
src/components/features/permission-settings/components/TableAccessLayer.tsx
src/components/features/permission-settings/components/ViewRowsSection.tsx
src/components/features/permission-settings/data/viewTableData.ts
src/components/features/permission-settings/data/viewDefinitionData.ts
src/components/features/permission-settings/data/roleGroupUtils.ts
src/components/features/permission-settings/permissionSettingsData.ts
src/components/features/platform-admin/PlatformAdminView.tsx
src/components/features/user-management/components/DomainRoleBadge.tsx
src/components/features/user-management/components/OrgChartView.tsx
src/components/features/user-management/components/UserAccessViewModal.tsx
src/types/admin.types.ts
src/types/common.types.ts
src/constants/navigation.ts
```

## Summary

총 26개 파일 검토 결과 24건의 이슈를 발견했습니다. Critical 이슈는 없으나, **사용되지 않는 Props 선언(Dead Props in Sidebar), ErrorBoundary의 `componentDidCatch` 누락, 민감 데이터 렌더링 시 마스킹 검증 우회 가능성**이 Major 등급 이슈로 다수 확인됩니다. 전반적으로 타입 안전성은 양호하나 접근성·성능·일관성 측면에서 개선이 필요합니다.

---

## Critical Issues

Critical 이슈 없음.

> 참고: `npx tsc --noEmit` 실행 결과, 리뷰 대상 파일 범위(admin, permission-settings, platform-admin, user-management) 내의 TypeScript 오류는 발견되지 않았습니다. 컴파일 오류는 검토 대상 외 `agent-chat` 영역에 집중되어 있습니다.

---

## Major Issues

| 파일 | 라인 | 이슈 | 권장 수정 |
|------|------|------|-----------|
| `src/components/Sidebar.tsx` | 71–74, 79 | **[HIGH] 사용되지 않는 Props — Dead Interface Fields** `SidebarProps`에 `isOpen`, `toggleSidebar`, `currentView`, `onNavigate` 4개가 선언되어 있으나 컴포넌트 본문(79번째 줄 구조분해)에서 하나도 사용하지 않음. 외부에서 이를 필수 Props로 전달하는 호출부가 있다면 런타임 경고는 없지만, 타입 계약이 실제 동작과 불일치하며 리팩터링 시 혼란 유발 | `SidebarProps` 에서 미사용 필드 제거 또는 `_` 접두사로 의도적 무시를 명시 |
| `src/components/ui/error-boundary.tsx` | 15–53 | **[HIGH] `componentDidCatch` 누락** `ErrorBoundary`가 `getDerivedStateFromError`만 구현하고 `componentDidCatch`를 구현하지 않음. 에러 리포팅(Sentry, console.error 등) 로직을 추가할 수 없는 구조. 실제 프로덕션에서 에러가 조용히 삼켜짐 | `componentDidCatch(error, info) { console.error(error, info); }` 추가; 에러 리포팅 서비스 연동 포인트 확보 |
| `src/app/platform-admin/page.tsx` | 7–13 | **[HIGH] `ErrorBoundary` 미래 적용** `src/app/admin/page.tsx`는 `ErrorBoundary`로 감싸져 있으나, 동일 패턴인 `platform-admin/page.tsx`는 `ErrorBoundary` 없이 단순 `Suspense`만 사용. 플랫폼 관리자 화면 오류가 전체 앱 트리로 전파될 위험 | `ErrorBoundary`로 `Suspense` 감싸기: `admin/page.tsx` 패턴 그대로 적용 |
| `src/components/features/user-management/components/UserAccessViewModal.tsx` | 72 | **[HIGH] 실시간 권한 행렬 미반영 — 잠재적 데이터 누수** `getEffectiveAccess`가 `DEFAULT_ACCESS_MATRIX`(하드코딩된 정적 데이터)만 참조하여 관리자가 `PermissionSettingsView`에서 수정한 현재 권한 행렬을 반영하지 않음. 사용자에게 실제보다 넓은/좁은 접근 권한이 표시될 수 있음 | Props로 `accessMatrix: DomainAccessMatrix[]`를 받거나, Context를 통해 현재 행렬을 공유 |
| `src/components/features/permission-settings/components/OrgRoleMappingManager.tsx` | 248 | **[HIGH] 타입 단언 없이 string → string 처리 (`accessModules`)** `Array.isArray(m.accessModules)` 분기가 있지만 `OrgRoleMapping.accessModules`의 타입이 `string`으로 선언(admin.types.ts 222번)되어 있어 배열일 수 없음. 런타임 방어는 되지만 타입 정의와 실제 데이터 가정이 불일치 | `admin.types.ts`의 `OrgRoleMapping.accessModules`를 `string \| string[]`로 선언하거나, 배열 체크 분기 제거 |
| `src/components/features/permission-settings/permissionSettingsData.ts` | 291–305 | **[HIGH] `columnMasking` 해소 로직 단순화 오류 — `partial` 마스킹 타입 미지원** `resolveEffectivePolicy` 내 컬럼 마스킹 해소 로직이 `full` 또는 `hidden`만 설정하고 `partial`(부분 마스킹) 타입을 결과에 반영하지 않음. `MaskingType`이 세 가지 값을 지원하는데 충돌 해소 엔진이 이를 무시함 | 정책의 실제 masking 타입(full/partial/hidden)을 기반으로 우선순위 적용; 현재는 exposedRoles 유무만 체크하여 세밀도 손실 |
| `src/components/features/permission-settings/components/TableAccessLayer.tsx` | 465 | **[HIGH] 스타일 문자열 인라인 구성** `style={{ backgroundClip: 'padding-box' }}`가 JSX 렌더 내부에서 매 렌더마다 새 객체로 생성됨 (TableAccessLayer의 서브카테고리 행 렌더링은 43 × 15개 셀). 대규모 매트릭스에서 GC 부하 증가 | 컴포넌트 외부에 `const CLIP_STYLE = { backgroundClip: 'padding-box' } as const;` 상수로 선언 |
| `src/components/features/user-management/components/OrgChartView.tsx` | 307, 311 | **[HIGH] 접근성 — 체크박스 구현 오류** "하위 조직 포함" 체크박스의 클릭 핸들러가 `div`와 `span` 두 군데에 직접 onClick으로 중복 바인딩됨. `<input type="checkbox">`가 `label` 내부에 있으나 visible 요소(`div`, `span`)에도 별도 `onClick`이 붙어 이벤트 처리가 이중으로 발생. 키보드 전용 사용자가 `label`이 아닌 영역 접근 시 동작 불일치 | 클릭 핸들러는 `label`의 `htmlFor` + `input`의 기본 동작으로 일원화; `div`와 `span`의 `onClick` 제거 |

---

## Minor Issues

| 파일 | 라인 | 이슈 | 권장 수정 |
|------|------|------|-----------|
| `src/components/AdminView.tsx` | 107, 319 | **[LOW] 렌더 함수 컴포넌트화 필요** `renderUserTable()`이 일반 함수로 정의되어 있어 `renderUserTable` 호출 시 React 렌더 사이클 외부에서 새 JSX 트리를 생성. 향후 `useMemo` 최적화가 불가능한 구조 | `UserTable`이라는 별도 컴포넌트로 분리 |
| `src/components/AdminView.tsx` | 134 | **[LOW] 인라인 `style` 객체 — 매 렌더 생성** `style={{ backgroundColor: user.avatarColor }}`가 테이블 행마다 생성됨. Tailwind CSS 동적 색상이 불가한 경우이므로 허용 가능하나, 주석으로 의도 명시 필요 | 불가피한 경우 `// Tailwind 동적 색상 미지원으로 인라인 style 사용` 주석 추가 |
| `src/components/Sidebar.tsx` | 83–86 | **[LOW] `navigate` 함수 `useCallback` 미적용** `navigate`가 매 렌더마다 새로 생성됨. `navItems` 배열 및 하위 Tooltip/DropdownMenu 컴포넌트의 불필요한 리렌더 유발 가능 | `useCallback(() => { ... }, [router])` 적용 |
| `src/components/Sidebar.tsx` | 93–101 | **[LOW] `navItems` 배열 인라인 정의** 매 렌더마다 새 배열·객체(`icon: <LayoutDashboard size={20} />`)가 생성됨. React 아이콘 JSX 요소는 렌더 내부에서 생성되면 항상 새 레퍼런스 | 컴포넌트 외부나 `useMemo`로 이동 |
| `src/components/Sidebar.tsx` | 128–141 | **[LOW] 반복적인 `isActive` 분기 — 가독성 저하** `item.id === 'dashboard'`, `item.id === 'general-chat'` 등의 if-else 체인이 하드코딩됨. `NAV_ITEMS`의 `viewType` 필드를 직접 활용하면 이 분기 전체를 제거 가능 | `pathnameToViewType`의 결과를 활용한 `isActive = item.viewType === currentView` 단일 조건으로 대체 (settings 그룹 예외 처리 포함) |
| `src/components/features/permission-settings/PermissionSettingsView.tsx` | 94–96 | **[LOW] `as Record<DomainRole, string>` 타입 단언** `roleLabelMap`을 생성할 때 `Object.fromEntries(...) as Record<DomainRole, string>`로 강제 단언. `roleDefinitions`에 없는 role이 있으면 런타임에 `undefined` 접근 | 타입을 `Partial<Record<DomainRole, string>>`으로 선언하거나 기본값 보호 로직 추가 |
| `src/components/features/permission-settings/components/ConflictPreviewPanel.tsx` | 279–290 | **[LOW] `key={filter}` — 중복 키 가능성** RLS 필터 목록에서 `key={filter}`(SQL 문자열)를 사용. 동일 역할이 둘 이상의 규칙을 가지면 동일 SQL 패턴이 중복될 수 있음 | `key={idx}` 또는 `key={`filter-${idx}`}` 사용 (인덱스 키는 정적 목록에서 허용 가능) |
| `src/components/features/permission-settings/components/ColumnMaskingLayer.tsx` | 346 | **[LOW] `deleteConfirmDescription` 매 렌더 IIFE 실행** 삭제 확인 메시지를 생성하는 IIFE(`(() => { ... })()`)가 렌더 함수 내부에서 매번 실행됨 | `useMemo(() => { ... }, [deleteConfirmId, policies])` 또는 단순 `const` 변수로 추출 |
| `src/components/features/permission-settings/components/OrgRoleMappingManager.tsx` | 329 | **[LOW] `deleteConfirmDescription` IIFE 패턴** ColumnMaskingLayer, RowSecurityLayer, RoleDefinitionManager 등 4개 컴포넌트에 동일하게 반복. 코드 중복 | 공유 유틸 함수 `buildDeleteDescription(id, items, formatter)` 추출 |
| `src/components/features/permission-settings/components/RoleDefinitionManager.tsx` | 237 | **[LOW] 동일한 `deleteConfirmDescription` IIFE 패턴** 위와 동일한 이슈. 3개 컴포넌트에 걸쳐 동일 패턴 반복됨 | 위와 동일 |
| `src/components/features/permission-settings/data/viewDefinitionData.ts` | 418–424 | **[LOW] 모듈 레벨 사이드이펙트** `VIEWS_BY_SUBCATEGORY` 객체를 `for...of` 루프로 모듈 로드 시점에 빌드. 이는 모듈 레벨 사이드이펙트이며, 테스트 환경에서 모의(Mock) 처리가 어려워짐 | `buildViewsBySubcategory()` 함수로 캡슐화하여 `export const VIEWS_BY_SUBCATEGORY = buildViewsBySubcategory();`로 변경 |
| `src/components/features/user-management/components/UserAccessViewModal.tsx` | 57–65 | **[LOW] `toggleModule` `useCallback` 미적용** `toggleModule`이 매 렌더마다 새 함수 참조 생성. 모달 내 모듈 목록이 많을 경우 불필요한 버튼 리렌더 발생 | `useCallback` 적용 |
| `src/components/features/user-management/components/UserAccessViewModal.tsx` | 119–133 | **[LOW] Badge 스타일 로직 중복** `isAdmin/isMgr` 기반의 스타일 결정 로직이 `DomainRoleBadge.tsx`와 `UserAccessViewModal.tsx` 두 곳에 동일하게 복사됨 | `DomainRoleBadge` 컴포넌트 재사용 |
| `src/types/common.types.ts` | 1 | **[LOW] 불필요한 `import React`** `common.types.ts`가 `React`를 import하고 있으나 TypeScript 타입 파일에서 JSX를 사용하지 않으면 불필요한 의존성 | `React.ReactNode` 대신 `import type { ReactNode } from 'react'`로 변경하여 런타임 import 제거 |
| `src/components/features/permission-settings/PermissionSettingsView.tsx` | 44–62 | **[LOW] `PILL_COLORS` 객체가 컴포넌트 모듈에 하드코딩** 색상 설정이 15가지 색상 × 2개 클래스로 컴포넌트 파일 내에 인라인 정의됨. 프로젝트 디자인 토큰과 분리 | `src/constants/colors.ts` 등으로 이동하거나 Tailwind CSS 커스텀 테마 활용 |
| `src/components/features/platform-admin/PlatformAdminView.tsx` | 11–59 | **[LOW] 500줄 미만이나 복잡도 예비 경고** `PlatformAdminView`가 4개의 서브 탭 컴포넌트를 지연 import 없이 직접 렌더링. `TenantManagementTab` 등이 대형 컴포넌트일 경우 초기 번들에 포함됨 | 각 탭 컨텐츠에 `React.lazy` 적용 검토 |

---

## Quick Wins (Top 5)

1. **`src/app/platform-admin/page.tsx`**: `ErrorBoundary`로 `Suspense` 감싸기 — `admin/page.tsx` 패턴 복사 붙여넣기 수준 — est. **5min**

2. **`src/components/ui/error-boundary.tsx`**: `componentDidCatch` 추가로 에러 로깅 활성화 — 4줄 추가 — est. **5min**

3. **`src/components/features/user-management/components/UserAccessViewModal.tsx`** 119–133: `DomainRoleBadge` 컴포넌트 재사용으로 중복 코드 제거 — `Badge` 렌더링 블록 → `DomainRoleBadge` 1줄 교체 × 역할 수 — est. **10min**

4. **`src/types/common.types.ts`** 1번줄: `import React` → `import type { ReactNode } from 'react'`으로 교체하여 런타임 import 제거 — est. **3min**

5. **`src/components/features/permission-settings/components/TableAccessLayer.tsx`** 다중 라인: `style={{ backgroundClip: 'padding-box' }}` 인라인 객체를 모듈 상수(`CLIP_STYLE`)로 추출 — est. **5min**

---

## Metrics

- **검토 파일 수**: 26개
- **총 이슈 수**: 24건 (Critical: 0 / Major: 8 / Minor: 16)
- **Quick Wins 예상 수정 시간 합계**: 28분

---

## 상세 분석 노트

### 1. 타입 안전성 (전반적으로 양호)

검토 대상 파일 범위에서는 `any` 타입이 사실상 사용되지 않습니다. 유일한 예외는 `src/context/ScenarioContext.tsx`의 `data?: any`이며, 이는 리뷰 대상 외 파일입니다. `RoleDefinitionManager.tsx`(204번 줄)의 `as RoleDefinition['dataScope']` 단언은 런타임 검증이 바로 위에서 이루어지므로 허용 가능합니다.

### 2. XSS / 보안

`dangerouslySetInnerHTML`이 리뷰 대상 파일에서 일체 사용되지 않습니다. SQL 패턴 문자열(`sqlWherePattern`)이 `<pre>` 태그 안에 렌더링되나, React의 기본 escaping으로 XSS 위험 없습니다. 사용자가 입력한 SQL을 실제 DB에 전달하는 로직은 현재 코드베이스에 없으며 모두 UI 표시용입니다.

### 3. 데이터 마스킹 검증

`ColumnMaskingLayer`는 `salary_bonus`, `ssn`, `bank_account` 등 민감 카테고리를 화면에 렌더링할 때 Policy 카드의 `resultExample` 필드만 표시하므로 실제 데이터 노출은 없습니다. 단, `UserAccessViewModal`이 `DEFAULT_ACCESS_MATRIX`를 고정 참조하는 점(Major 이슈 #4)은 권한 표시 정확성 문제로 분류됩니다.

### 4. React 반응성 / 성능

`PermissionSettingsView`의 `accessMatrix` 상태(43개 서브카테고리 × 15개 역할 = 645개 셀)가 변경될 때 `overrideCountMap` useMemo가 재계산되며, 이는 O(views × roles) 순회를 포함합니다. 현재 `TableAccessLayer` 내부에서 이미 `accessMatrixMap`으로 O(1) 룩업을 최적화하고 있어 전반적인 성능 패턴은 양호합니다.

### 5. 접근성 (Accessibility)

대부분의 버튼에 `aria-label`이 적용되어 있고, `TabsList`에 `aria-label`이 있으며, 스킵 내비게이션(`href="#admin-content"`)도 구현되어 있습니다. `TableAccessLayer`의 모듈 토글 버튼에 `aria-expanded`와 `aria-controls`가 적절히 적용되어 있습니다. OrgChartView의 체크박스 이벤트 이중 바인딩(Major 이슈 #8)만 수정이 필요합니다.
