# 코드 리뷰 — 2026-03-18 (실행 2)

## 대상
- `src/app/admin/page.tsx`
- `src/components/AdminView.tsx`
- `src/components/features/permission-settings/PermissionSettingsView.tsx`
- `src/components/features/permission-settings/components/AccessMatrixCell.tsx`
- `src/components/features/permission-settings/components/TableAccessLayer.tsx`
- `src/components/features/permission-settings/components/ViewRowsSection.tsx`
- `src/components/features/permission-settings/components/RowSecurityLayer.tsx`
- `src/components/features/permission-settings/components/ColumnMaskingLayer.tsx`
- `src/components/features/permission-settings/components/RoleDefinitionManager.tsx`
- `src/components/features/permission-settings/components/OrgRoleMappingManager.tsx`
- `src/components/features/permission-settings/components/ConflictPreviewPanel.tsx`
- `src/components/features/permission-settings/data/viewTableData.ts`
- `src/components/features/permission-settings/data/roleGroupUtils.ts`
- `src/components/ui/confirm-dialog.tsx`

## 요약
- 총 이슈: 19개
- 심각: 2개 | 주요: 9개 | 경미: 8개

---

## 이슈

---

### [심각] 안전하지 않은 타입 어설션이 도메인 역할 문자열에 대한 TypeScript의 타입 시스템을 무시함

**파일**: `src/components/features/permission-settings/components/RowSecurityLayer.tsx:296-297`, `OrgRoleMappingManager.tsx:264-266`, `RoleDefinitionManager.tsx:208`, `ColumnMaskingLayer.tsx:474,487`

**설명**: 폼 필드는 역할/filterBase/positionLevel을 `EditFormState`에서 일반 `string`으로 저장한 후 런타임 검증 없이 저장 시점에 `as` 어설션을 통해 branded union 타입(`DomainRole`, `RlsFilterBase`, `PositionLevel`)으로 캐스트합니다. `<select>` 엘리먼트가 유니언에 존재하지 않는 옵션 값을 렌더링하면(예: 데이터 업데이트 후), 저장된 객체는 조용히 나중에 깨진 매트릭스 조회 또는 접근 제어 오류 계산을 일으키는 잘못된 역할 코드를 포함합니다.

```tsx
// RowSecurityLayer.tsx:296-297
role: editTarget.role as DomainRole,        // editTarget.role은 string — ''일 수 있음
filterBase: editTarget.filterBase as RlsFilterBase, // 동일
```

라인 292의 가드 `if (!editTarget.role || !editTarget.filterBase) return;`는 falsy-empty 확인에 올바르지만, 비어있지 않은 잘못된 문자열은 여전히 미확인된 채로 통과합니다.

**수정 제안**: 저장 전에 명시적 멤버십 확인을 추가하십시오 — 예: `if (!DOMAIN_ROLES.includes(editTarget.role as DomainRole)) return;`. 또는 `EditFormState.role`을 `DomainRole | ''`로 타입하고 타입 술어 가드를 사용하십시오.

---

### [심각] React 훅을 사용하는 파일에 `'use client'` 지시문이 누락됨

**파일**: `src/components/features/permission-settings/PermissionSettingsView.tsx:1`, `TableAccessLayer.tsx:1`, `RowSecurityLayer.tsx:1`, `ColumnMaskingLayer.tsx:1`, `RoleDefinitionManager.tsx:1`, `OrgRoleMappingManager.tsx:1`, `ConflictPreviewPanel.tsx:1`, `ViewRowsSection.tsx:1`, `AccessMatrixCell.tsx:1`

**설명**: 권한 설정 컴포넌트 중 어느 것도 맨 위에 `'use client'`을 선언하지 않습니다. 프로젝트는 기본적으로 모든 컴포넌트가 서버 컴포넌트인 Next.js 15 App Router를 사용합니다. 이들 파일 각각은 `useState`, `useCallback` 또는 `useMemo` — 클라이언트 컴포넌트에서만 법적인 훅을 호출합니다. 앱은 현재 작동합니다. `AdminView.tsx`(자신도 `'use client'`이 누락됨)가 `src/app/admin/page.tsx`(`'use client'`)의 동적 임포트를 통해 지연 로드되기 때문입니다. 지연 경계가 클라이언트 상태를 아래로 전파하지만 이는 암묵적이고 취약합니다. 이들 컴포넌트 중 하나라도 서버 컴포넌트 컨텍스트에서 임포트되면(예: 공유 레이아웃 또는 다른 경로), 런타임에 오류를 발생시킵니다.

`AdminView.tsx` 자체도 라인 1에 `'use client'`이 누락되어 있습니다.

**수정 제안**: React 훅 또는 브라우저 API를 사용하는 모든 컴포넌트 파일의 첫 번째 줄로 `'use client';`을 추가하십시오. 최소한: `AdminView.tsx`, `PermissionSettingsView.tsx`, 및 위에 나열된 모든 하위 컴포넌트.

---

### [주요] `handleEditUser`가 `useCallback`으로 메모이제이션되지 않음

**파일**: `src/components/AdminView.tsx:89-92`

**설명**: `handleDeleteUser`와 `handleUserStatusToggle`은 `useCallback`으로 감싸져 있지만, `handleEditUser`는 컴포넌트 본문에 직접 정의된 일반 함수입니다. `renderUserTable()`(인라인으로 사용)과 `OrgChartView`에 `onEditUser` prop을 통해 모두 전달됩니다. 이로 인해 `OrgChartView`는 매 렌더링마다 새로운 함수 참조를 받아 `OrgChartView` 내부의 모든 `React.memo` 최적화를 깨뜨립니다.

```tsx
// AdminView.tsx:89
const handleEditUser = (user: EnhancedUser) => {   // <-- useCallback 아님
  setEditingUser(user);
  setIsModalOpen(true);
};
```

**수정 제안**: `handleEditUser`를 `useCallback`으로 감싸고 빈 의존성 배열을 포함하십시오, 안정적인 상태 설정자만 호출하므로.

---

### [주요] `getOverrideCount`가 메모이제이션 없이 렌더 루프에서 호출됨 — 행당 O(뷰 × 역할 × 부범주)

**파일**: `src/components/features/permission-settings/components/TableAccessLayer.tsx:467`

**설명**: `getOverrideCount(subcat.id, accessMatrix)`는 각 렌더링마다 모든 보이는 부범주 행에 대해 호출됩니다. 함수는 부범주의 모든 뷰와 모든 매트릭스 항목(15개 역할 × N개 뷰)을 반복합니다. 43개 부범주와 최대 약 10개 뷰가 각각 있으면, 이는 매 키 입력 또는 상태 변경마다 수백 개의 중첩 반복을 생성합니다. 이를 보호하는 메모이제이션이 없습니다.

```tsx
// TableAccessLayer.tsx:467
const overrideCount = getOverrideCount(subcat.id, accessMatrix);
```

**수정 제안**: `accessMatrix`를 키로 하는 `useMemo` 내부에서 `Record<string, number>` 오버라이드 카운트 맵을 미리 계산하십시오. 미리 계산된 맵을 렌더 루프에 전달하십시오.

---

### [주요] 인라인 IIFE가 `ConfirmDialog` description prop을 계산하는 데 사용됨 — 매 렌더링마다 새 함수 생성

**파일**: `src/components/features/permission-settings/components/RowSecurityLayer.tsx:518-523`, `ColumnMaskingLayer.tsx:553-557`, `OrgRoleMappingManager.tsx:731-735`, `RoleDefinitionManager.tsx:507-515`

**설명**: 네 컴포넌트 모두 즉시 호출된 함수 표현식 `{(() => { ... })()`을 JSX에 직접 사용하여 `<ConfirmDialog>`의 `description` prop을 계산합니다. 이는 확인 대화가 닫혀 있을 때에도(React가 모든 props를 평가하기 때문에) 매 렌더링마다 새로운 클로저와 새로운 문자열을 생성합니다. 또한 확인 메시지 로직을 테스트하고 읽기 어렵게 만듭니다.

```tsx
// RowSecurityLayer.tsx:518
description={(() => {
  const rule = rules.find(r => r.id === deleteConfirmId);
  if (!rule) return '규칙을 삭제하시겠습니까?';
  ...
})()}
```

**수정 제안**: 파생된 설명을 `useMemo` 또는 반환 문 전에 계산된 전용 로컬 변수로 추출하십시오, 예:
```tsx
const deleteConfirmDescription = useMemo(() => {
  const rule = rules.find(r => r.id === deleteConfirmId);
  ...
}, [deleteConfirmId, rules]);
```

---

### [주요] `renderGroupedRoleOptions`는 컴포넌트 내부에 정의된 일반 함수 — 메모이제이션 무시

**파일**: `src/components/features/permission-settings/components/OrgRoleMappingManager.tsx:327-340`

**설명**: `renderGroupedRoleOptions`는 라인 327에서 컴포넌트 본문 내에 일반 함수로 선언됩니다. 라인 607에서 JSX로 호출됩니다. React는 이 함수를 다시 실행하는 것을 피할 수 없고, 안정적인 식별자가 없으며, 자식 `<select>` 엘리먼트에 `React.memo`가 도움을 주는 것을 방지합니다. 또한 간단히 인라인되거나 적절히 메모이제이션된 컴포넌트로 추출될 수 있는 JSX를 반환합니다.

**수정 제안**: 상태/props에 의존하면 `useCallback`으로 추출하거나, 더 나은 방법은 모듈 범위로 이동하여 상수로 설정하십시오, 런타임 의존성이 없으므로(`GROUPED_ROLES`는 모듈 수준 상수).

---

### [주요] `roleLabelMap` prop이 `Record<string, string>`으로 타입되지만 `DomainRole` 키에 대해 사용됨 — 타입이 너무 느슨함

**파일**: `src/components/features/permission-settings/components/RowSecurityLayer.tsx:86`, `ColumnMaskingLayer.tsx:19`, `OrgRoleMappingManager.tsx:112`

**설명**: `roleLabelMap` prop은 세 컴포넌트 모두에서 `Record<string, string>`으로 타입됩니다. `PermissionSettingsView.tsx:91`에서 전달되는 실제 값은 `Record<DomainRole, string>`입니다. 더 느슨한 타입 지정은 호출자가 컴파일 오류 없이 임의의 `Record<string, string>`을(잘못된 키를 가진 맵 포함) 전달할 수 있음을 의미합니다. null-coalescing 폴백 `roleLabelMap[rule.role] ?? rule.role`은 오설정을 조용히 숨깁니다.

**수정 제안**: prop 타입을 `Record<DomainRole, string>`으로 변경하십시오(부분 맵이 의도된 경우 `Partial<Record<DomainRole, string>>`) 컴파일 시간 정확성 확인을 위해.

---

### [주요] 관리자 패널 계층 어디에도 ErrorBoundary가 없음

**파일**: `src/app/admin/page.tsx`, `src/components/AdminView.tsx`

**설명**: 전체 관리자 패널 — 6개 탭 패널, 345개 뷰 × 15개 역할의 권한 매트릭스, 충돌 미리보기 엔진을 포함하여 — ErrorBoundary 래퍼가 0개입니다. 하위 컴포넌트가 렌더링 중에 오류를 발생시키면(예: 잘못된 형태의 `accessMatrix` 항목, `VIEWS_BY_SUBCATEGORY`의 누락된 부범주 ID, 또는 데이터 로드 실패), 전체 관리자 페이지는 빈 화면으로 언마운트되고 복구 경로가 없습니다.

**수정 제안**: `src/app/admin/page.tsx`에서 `<AdminView />`를 catch-all `<ErrorBoundary>`로 감싸십시오. 한 탭의 실패가 다른 탭을 중단시키지 않도록 개별 `<TabsContent>` 패널을 탭 수준 경계로 감싸는 것을 고려하십시오.

---

### [주요] `PermissionSettingsView`가 368줄을 초과하고 6개 탭 상태를 가짐; `domainOrder` 상수가 컴포넌트 본문 내부에 정의됨

**파일**: `src/components/features/permission-settings/PermissionSettingsView.tsx:190`

**설명**: `const domainOrder: RoleDomain[]`(라인 190)이 컴포넌트 함수 내부에 정의됩니다. 이 값은 절대 변경되지 않습니다 — 이는 고정 상수입니다. 컴포넌트 내부에서 정의하면 매 렌더링마다 새 배열 참조를 할당하여 이에 대한 모든 동등성 확인을 잘못되게 만들고 불필요한 오버헤드를 추가합니다.

추가로 컴포넌트는 6개 별도 탭(accessMatrix, modifiedCells, roleDefinitions, orgRoleMappings, rlsRules, maskPolicies)에 대한 상태를 관리하는데, 이는 더 작은 컨텍스트 또는 커스텀 훅으로 분할되어야 함을 시사합니다.

**수정 제안**: `domainOrder`를 모듈 범위로 이동하십시오. 탭 상태를 `usePermissionSettings` 커스텀 훅으로 추출하는 것을 고려하십시오.

---

### [주요] `ColumnMaskingLayer.handleSave`: ID 생성 로직이 편집 모드에서 깨짐

**파일**: `src/components/features/permission-settings/components/ColumnMaskingLayer.tsx:307`

**설명**: 라인 307의 ID 폴백 로직은 모순적입니다:

```tsx
id: isCreateMode
  ? `MASK-${String(Date.now()).slice(-4)}`
  : (editingId ?? `MASK-${String(Date.now()).slice(-4)}`),
```

`isCreateMode`는 `editingId === null`으로 파생됩니다(라인 224). 따라서 편집 모드의 `editingId ?? fallback` 분기는 절대 폴백에 도달할 수 없습니다 — `isCreateMode`이 false일 때 `editingId`은 항상 null이 아닙니다. 중복된 폴백 표현식은 복사-붙여넣기된 혼동된 로직을 나타냅니다. 더 중요하게, `Date.now()`의 마지막 4자리를 슬라이싱하면 10000개의 가능한 ID만 생성되어 많은 정책을 빠르게 생성할 때 충돌이 발생할 가능성이 높습니다.

**수정 제안**: `crypto.randomUUID()` 또는 단조 카운터와 같은 적절한 ID 전략을 사용하십시오. 죽은 폴백 분기를 제거하십시오.

---

### [경미] `src/components/features/permission-settings/components/TableAccessLayer.tsx`와 `OrgRoleMappingManager.tsx`가 500줄을 초과함

**파일**: `TableAccessLayer.tsx` (569줄), `OrgRoleMappingManager.tsx` (746줄), `RowSecurityLayer.tsx` (536줄), `ColumnMaskingLayer.tsx` (568줄)

**설명**: 5개 권한 설정 컴포넌트 파일 중 4개가 500줄을 초과합니다. `OrgRoleMappingManager.tsx`는 746줄에 이릅니다. 리뷰 체크리스트에 따르면 500줄 이상의 파일은 복잡도 우려입니다. 각 파일은 여러 하위 컴포넌트, 폼 상태 인터페이스, 그리고 추출될 수 있는 헬퍼 함수를 포함합니다.

**수정 제안**: 폼 대화를 형제 `*FormDialog.tsx` 파일로 추출하고, 순수 헬퍼 함수(예: `deriveRlsFilter`, `buildDataScopeDisplay`, `parseDataScopeType`)를 함께 배치된 `utils.ts` 파일로 이동하십시오.

---

### [경미] `DATA_SCOPE_OPTIONS` 상수가 두 파일에 복제됨

**파일**: `src/components/features/permission-settings/components/RoleDefinitionManager.tsx:19-28`, `OrgRoleMappingManager.tsx:22-31`

**설명**: 동일한 `DATA_SCOPE_OPTIONS` 배열이 `RoleDefinitionManager.tsx`와 `OrgRoleMappingManager.tsx` 모두에 정의됩니다. 배열은 동일한 형태(`{ value: string; label: string }[]`)를 가지지만 약간 다른 타입 지정 — `RoleDefinitionManager`는 `{ value: string }`을 사용하고 `OrgRoleMappingManager`는 `{ value: DataScopeType }`을 사용합니다. 허용된 범위 옵션의 변경은 두 위치에서 모두 이루어져야 합니다.

**수정 제안**: 정규 `DATA_SCOPE_OPTIONS`을 공유 상수 파일로 이동하십시오(예: `permissionSettingsData.ts` 또는 기능 내부의 새 `constants.ts`) 그리고 두 컴포넌트에서 가져오십시오.

---

### [경미] `AdminView`에서 인라인 `style={{ backgroundColor: user.avatarColor }}` — Tailwind 외부의 동적 색상

**파일**: `src/components/AdminView.tsx:125`

**설명**: 아바타 배경은 `user.avatarColor`의 동적 16진수 색상을 포함한 런타임 `style` prop을 사용합니다. 버그는 아니지만, 이는 Tailwind 디자인 토큰 시스템을 우회하고 `bg-{color}-{shade}` 유틸리티를 사용하는 코드베이스의 나머지와 불일치를 생성합니다. 또한 아바타 색상이 디자인 시스템 팔레트로 제한되지 않음을 의미합니다.

**수정 제안**: `avatarColor`를 `EnhancedUser` 타입에서 Tailwind 호환 클래스 문자열의 유한 집합으로 제한하고(예: `'bg-blue-500' | 'bg-green-500' | ...`) 인라인 스타일이 아닌 className으로 적용하십시오.

---

### [경미] TableAccessLayer의 `style={{ writingMode: 'horizontal-tb' }}`과 `style={{ backgroundClip: 'padding-box' }}` — Tailwind로 표현 가능한 값에 대한 인라인 스타일

**파일**: `src/components/features/permission-settings/components/TableAccessLayer.tsx:393`, `430`, `479`; `ViewRowsSection.tsx:87`, `127`

**설명**: `writingMode: 'horizontal-tb'`은 브라우저 기본값이고 효과가 없습니다. 그 존재는 세로 쓰기 모드 실험의 남은 것을 시사합니다. `backgroundClip: 'padding-box'`는 고정 열 배경 bleed-through를 수정하는 데 사용되고 정당한 CSS 트릭이지만, 4개의 별개 위치에서 사용됩니다; 공유 유틸리티 클래스로 추상화되어야 합니다.

**수정 제안**: 무작동 `writingMode: 'horizontal-tb'` 스타일을 제거하십시오. `backgroundClip: 'padding-box'`를 Tailwind 플러그인 또는 공유 CSS 클래스로 추상화하십시오(예: Tailwind의 내장 유틸리티를 사용할 경우 `bg-clip-padding`).

---

### [경미] `ConfirmDialog` description prop이 IIFE 결과를 렌더링하지만 `description` 타입은 `string` — `DialogDescription`이 non-string을 받으면 런타임 타입 불일치 가능

**파일**: `src/components/ui/confirm-dialog.tsx:17`

**설명**: `description`은 `string`으로 타입됩니다(`React.ReactNode` 아님), 하지만 호출자는 문자열 반환 IIFE의 결과를 전달합니다, 이는 괜찮습니다. 그러나 `DialogDescription`(Radix UI 컴포넌트)은 자신의 자식을 렌더링하므로, 향후 호출자가 실수로 JSX를 전달하면 TypeScript 타입이 너무 제한적입니다. 반대로, `RoleDefinitionManager.tsx:513`의 설명 텍스트는 매핑 참조에 대한 경고 텍스트를 포함할 수 있습니다 — 이 경고 텍스트는 순수 `string` prop으로는 불가능한 시각적 강조(굵게/색상)의 이점을 얻을 것입니다.

**수정 제안**: `ConfirmDialogProps`에서 `description`을 `React.ReactNode`로 확장하여 파괴적 확인 대화에서 스타일된 콘텐츠를 허용하십시오.

---

### [경미] `ColumnMaskingLayer.tsx`와 `OrgRoleMappingManager.tsx`의 죽은 빈 주석 블록

**파일**: `src/components/features/permission-settings/components/ColumnMaskingLayer.tsx:64-67`, `OrgRoleMappingManager.tsx:41-43`

**설명**: 두 파일 모두 개발에서 남은 빈 주석 처리된 섹션 블록을 가집니다:

```tsx
// ---------------------------------------------------------------------------
// Domain-grouped roles for exposed roles section          (ColumnMaskingLayer:64)
// ---------------------------------------------------------------------------
                                                           (공백 — 섹션 제거됨)
```

```tsx
// ============================================================================
// Grouped roles by domain (using DOMAIN_ROLE_DEFINITIONS)  (OrgRoleMappingManager:41)
// ============================================================================
                                                           (공백)
```

이들 섹션은 이전에 `GROUPED_ROLES`이 `roleGroupUtils.ts`로 이동했을 때 제거된 코드를 포함했습니다. 헤더는 죽은 주석 잡음으로 남습니다.

**수정 제안**: 빈 섹션 주석 블록을 제거하십시오.

---

### [경미] `SectionHeader` 컴포넌트가 `OrgRoleMappingManager` 내부에 정의됨 — 다른 곳에서 재사용되지 않지만 중첩 범위를 추가함

**파일**: `src/components/features/permission-settings/components/OrgRoleMappingManager.tsx:157-164`

**설명**: `SectionHeader` 함수 컴포넌트는 자신의 파일로 추출되거나 공유 `ui/` 컴포넌트가 아닌 주요 컴포넌트와 동일한 파일 내부에 정의됩니다. 대화 폼에서만 사용되지만, 다른 컴포넌트 파일 내부에서 컴포넌트를 정의하면 이들을 연결하고 독립적 재사용 또는 테스트를 방지합니다.

**수정 제안**: `SectionHeader`를 공유 위치로 이동하거나 최소한 모듈 수준 선언으로 파일 상단으로(여기서는 이미 그 경우입니다 — 주요 컴포넌트 내부가 아닌 모듈 범위에 있습니다). 이는 경미한 참고입니다; 범위가 의도된 경우 조치가 필요하지 않습니다.

---

### [경미] `maskingBadgeClass`는 `ConflictPreviewPanel.ColumnMaskingSection` 컴포넌트 본문 내부에 정의된 순수 함수

**파일**: `src/components/features/permission-settings/components/ConflictPreviewPanel.tsx:182-191`

**설명**: `maskingBadgeClass`는 리터럴 유니언을 문자열로 매핑하는 순수 조회 함수입니다. props 또는 상태에 대한 의존성이 없으며 `ColumnMaskingSection`의 매 렌더링마다 재정의됩니다.

```tsx
// ConflictPreviewPanel.tsx:182
const maskingBadgeClass = (type: 'full' | 'partial' | 'hidden') => {
  switch (type) { ... }
};
```

**수정 제안**: 모듈 범위로 `const` 레코드 조회로 이동하십시오:
```ts
const MASKING_BADGE_CLASS: Record<'full' | 'partial' | 'hidden', string> = {
  full: 'bg-green-50 text-green-700',
  partial: 'bg-amber-50 text-amber-700',
  hidden: 'bg-red-50 text-red-600',
};
```

---

### [경미] 하드코딩된 한국어 UI 문자열이 전체적으로 — i18n 시스템을 사용하지 않음

**파일**: 검토된 모든 컴포넌트 파일

**설명**: 관리자 패널의 모든 사용자 보이는 문자열은 하드코딩된 한국어입니다(예: `'사용자 관리'`, `'권한 설정'`, `'행 보안 규칙 관리'`, `'정말로 이 사용자를 삭제하시겠습니까?'`). 프로젝트 CLAUDE.md는 현재 i18n 시스템을 참조하지 않지만, 문자열은 일부 위치에서 영어 레이블과 혼합됩니다(`AdminView.tsx:111-117`에서 열 헤더 `사용자 (User)`, `부서 (Dept)`), 이는 일관되지 않은 지역화 전략을 나타냅니다. 향후 i18n 요구사항이 발생하면, 이들 문자열을 추출하려면 모든 컴포넌트를 건드려야 합니다.

**수정 제안**: 지금은 일관된 규칙을 확립하고 따르십시오 — 항상 영어 번역을 괄호로 포함하거나 이들을 버리십시오. i18n이 추가되면, 메시지 카탈로그를 정의하고 리터럴을 `t('key')` 호출로 바꾸십시오.

---

## Quick Wins (상위 항목)

1. `src/components/AdminView.tsx` + 모든 권한 설정 컴포넌트: 각 파일에 `'use client';` 지시문 추가 — 예상 시간 5분
2. `src/components/AdminView.tsx:89`: `handleEditUser`를 `useCallback`으로 감싸기 — 예상 시간 5분
3. `src/components/features/permission-settings/PermissionSettingsView.tsx:190`: `domainOrder`를 모듈 범위로 이동 — 예상 시간 2분
4. `src/components/features/permission-settings/components/ConflictPreviewPanel.tsx:182`: `maskingBadgeClass`를 모듈 범위 `const` 레코드로 이동 — 예상 시간 5분
5. `src/components/features/permission-settings/components/ColumnMaskingLayer.tsx:64`, `OrgRoleMappingManager.tsx:41`: 죽은 빈 주석 섹션 헤더 제거 — 예상 시간 3분

## 수치
- 검토된 파일: 14개
- 총 이슈: 19개 (심각: 2개 / 주요: 9개 / 경미: 8개)
- 예상 수정 시간 (Quick Wins만): 20분
