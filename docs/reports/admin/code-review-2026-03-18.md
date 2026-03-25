# 코드 리뷰 리포트 — 관리자 패널
날짜: 2026-03-18

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

## 요약
- 총 이슈: 22개
- 심각: 2개 | 높음: 8개 | 중간: 7개 | 낮음: 5개

가장 중요한 문제점은: (1) 보안이 중요한 역할 접근 맵을 초기화할 때 사용되는 안전하지 않은 `as never` 타입 어설션, (2) `AdminView`에서 `useMemo` 없이 렌더링할 때마다 재계산되는 `filteredUsers`입니다. 코드베이스의 구조는 전반적으로 잘 되어 있지만, `window.confirm` 사용이 광범위하게(5곳) 존재하고, 렌더 루프 내 `O(n)` 배열 조회, 그리고 `buildGroupedRoles` 함수가 세 파일에 정확히 복제되어 있습니다.

---

## 이슈

### [심각] 보안이 중요한 역할 접근 맵에서 안전하지 않은 `as never` 타입 어설션

**파일**: `src/components/features/permission-settings/PermissionSettingsView.tsx:147`

**문제**: `roleAccessMap`이 `{} as never`로 초기화됩니다. 이는 이 객체에 대한 모든 TypeScript 타입 체크를 억제합니다. `roleAccessMap`은 각 역할이 접근할 수 있는 데이터를 결정하는 `resolveEffectivePolicy`에 직접 전달되는 데이터입니다. 런타임에 맵이 잘못된 형태라면(예: 새로운 역할이 추가되었지만 매트릭스 항목이 없음), TypeScript는 조용히 통과합니다. `as never`는 가장 극단적인 안전하지 않은 캐스트로, 모든 타입 제약을 무시합니다.

```ts
// 라인 147 — 현재
const map: Record<DomainRole, Record<string, AccessLevel>> = {} as never;
```

**수정 제안**: 적절한 타입 안전 초기화 패턴을 사용하십시오. `{} as Record<DomainRole, Record<string, AccessLevel>>`은 오류를 억제하지 않고 타입 계약을 유지하거나, 부분 채우기가 의도된 경우 `Partial<Record<...>>`을 사용하십시오.

```ts
const map: Partial<Record<DomainRole, Record<string, AccessLevel>>> = {};
```

---

### [심각] 잠재적으로 정의되지 않은 맵 항목에 대한 Non-null 어설션

**파일**: `src/components/features/permission-settings/PermissionSettingsView.tsx:178`

**문제**: `map[def.domain]!.push(def)`는 non-null 어설션 연산자(`!`)를 사용합니다. 위의 줄이 존재하지 않을 때 `map[def.domain] = []`을 초기화하지만, 향후 리팩터가 이 보장을 조용히 깨뜨릴 수 있습니다. strict 모드 TypeScript에서는 이를 정확히 잠재적으로 정의되지 않은 것으로 식별하며, `!`은 수정이 아닌 우회입니다.

```ts
// 라인 176-178
if (!map[def.domain]) map[def.domain] = [];
map[def.domain]!.push(def);  // <- 안전하지 않음
```

**수정 제안**: Non-null 어설션을 피하기 위해 로컬 변수를 사용하십시오:

```ts
if (!map[def.domain]) map[def.domain] = [];
const bucket = map[def.domain];
if (bucket) bucket.push(def);
```

---

### [높음] `filteredUsers` 매 렌더링마다 재계산됨 (`useMemo` 누락)

**파일**: `src/components/AdminView.tsx:79–87`

**문제**: `filteredUsers`는 `users.filter(...)`를 사용하여 컴포넌트 본문 내에 할당된 일반 변수입니다. 매 렌더링마다 재계산됩니다 — 형제 입력 필드의 매 키 입력, 모달 상태 변경, 상태 토글 클릭을 포함하여 — `users`와 `searchQuery`가 변경되지 않았더라도입니다. 전체 사용자 목록이 있으면 매 렌더링마다 낭비되는 O(n) 통과입니다.

```ts
// 라인 79 — 현재 (매 렌더링마다 재계산)
const filteredUsers = users.filter(user => { ... });
```

**수정 제안**: `useMemo`로 감싸십시오:

```ts
const filteredUsers = useMemo(() =>
  users.filter(user => {
    const q = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.department.toLowerCase().includes(q) ||
      (user.orgPath?.toLowerCase().includes(q) ?? false)
    );
  }),
  [users, searchQuery],
);
```

---

### [높음] `handleUserStatusToggle`과 `handleDeleteUser`가 `useCallback`으로 감싸지지 않음

**파일**: `src/components/AdminView.tsx:90–103`

**문제**: `handleUserStatusToggle`(라인 90)과 `handleDeleteUser`(라인 99)는 매 렌더링마다 다시 생성됩니다. 둘 다 큰 사용자 테이블의 `onClick` 핸들러에 전달되어 각 렌더 사이클마다 모든 테이블 행이 새 함수 참조를 받게 합니다. 테이블 행 버튼이 메모이제이션되지 않았으므로 현재는 자식 재렌더링을 유발하지 않지만, 향후 행 컴포넌트가 `React.memo`로 감싸질 때 메모이제이션을 무시하고 매 렌더링마다 불필요한 JS 할당을 생성합니다.

**수정 제안**: 둘 다 `useCallback`으로 감싸십시오. `handleUserStatusToggle`은 현재 오래된 `users` 변수를 클로저로 포함합니다 — 올바르려면 함수형 업데이터 형식을 사용해야 합니다:

```ts
const handleUserStatusToggle = useCallback((id: string) => {
  setUsers(prev => prev.map(u =>
    u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u
  ));
}, []);

const handleDeleteUser = useCallback((id: string) => {
  if (confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
    setUsers(prev => prev.filter(u => u.id !== id));
  }
}, []);
```

---

### [높음] 중첩 루프 내 모든 셀 렌더링에서 호출되는 O(n) `accessMatrix.find`

**파일**: `src/components/features/permission-settings/components/TableAccessLayer.tsx:35–42`
**파일**: `src/components/features/permission-settings/components/ViewRowsSection.tsx:157`

**문제**: `getAccessLevel`은 모든 셀 렌더링에서 `accessMatrix.find(m => m.role === role)`을 호출합니다. 매트릭스는 15개의 역할을 가지고 있고, 테이블은 최대 43개 부범주 × 15개 역할 = 645개 셀을 렌더링합니다. 각 셀은 15개 항목의 배열에서 `find`를 호출하여, 렌더링당 약 645개의 선형 검색을 총합합니다. 마찬가지로, `ViewRowsSection`은 라인 157에서 뷰 행당 `accessMatrix.find(m => m.role === role)`을 호출합니다 — 모든 345개 뷰가 확장되면, 이는 렌더링당 345 × 15 = 5,175개 검색에 이릅니다.

또한 라인 52의 `getOverrideCount`는 각 부범주 행 렌더링마다 부범주의 모든 뷰 × 모든 매트릭스 항목을 스캔합니다.

**수정 제안**: `TableAccessLayer`에서 `useMemo`를 사용하여 `Map<DomainRole, DomainAccessMatrix>` 조회를 한 번 구축하고 아래로 전달하십시오:

```ts
const matrixByRole = useMemo(
  () => new Map(accessMatrix.map(m => [m.role, m])),
  [accessMatrix],
);
```

그런 다음 `accessMatrix.find(m => m.role === role)`을 `matrixByRole.get(role)`로 바꾸십시오.

---

### [높음] 5개 위치에서 파괴적 작업에 사용되는 `window.confirm`

**파일**: `src/components/AdminView.tsx:100`
**파일**: `src/components/features/permission-settings/components/RowSecurityLayer.tsx:343`
**파일**: `src/components/features/permission-settings/components/ColumnMaskingLayer.tsx:349`
**파일**: `src/components/features/permission-settings/components/OrgRoleMappingManager.tsx:319`
**파일**: `src/components/features/permission-settings/components/RoleDefinitionManager.tsx:236`

**문제**: `window.confirm()`은 차단 브라우저 대화 상자입니다:
1. 스타일을 지정할 수 없음 — 디자인 시스템을 깨뜨립니다.
2. JS 스레드와 이벤트 루프를 차단합니다.
3. 샌드박스된 iframe에서 작동하지 않음 (조용히 `false`를 반환), 이는 엔터프라이즈 임베딩 시나리오에서 일반적입니다.
4. 서버 측 렌더링 컨텍스트에서 실패합니다.
5. ARIA 패턴을 사용하는 스크린 리더에 접근할 수 없습니다.

**수정 제안**: 인라인 확인 UI로 대체하십시오(예: `src/components/ui/dialog`를 통해 사용 가능한 작은 Radix `AlertDialog` 컴포넌트). 공유 `useConfirmDialog` 훅은 이 모든 5개 호출 위치에서 DRY 원칙을 적용할 수 있습니다.

---

### [높음] `buildGroupedRoles` 함수가 세 파일에 정확히 복제됨

**파일**: `src/components/features/permission-settings/components/RowSecurityLayer.tsx:58–73`
**파일**: `src/components/features/permission-settings/components/ColumnMaskingLayer.tsx:70–85`
**파일**: `src/components/features/permission-settings/components/OrgRoleMappingManager.tsx:43–60`

**문제**: `buildGroupedRoles` 함수와 그 결과로 나온 `GROUPED_ROLES` 상수가 세 파일에 정확히 복사되어 붙여집니다. 향후 도메인 순서, 역할 필터링 또는 그룹화 로직의 변경은 세 곳에서 모두 이루어져야 합니다 — 고전적인 DRY 위반입니다. 이는 서로 다른 계층의 그룹화 간 불일치가 드롭다운에서 역할이 누락되는 결과를 초래할 수 있는 보안에 민감한 권한 관리 기능에서 특히 위험합니다.

**수정 제안**: 공유 유틸리티 파일로 추출하십시오(예: `src/components/features/permission-settings/utils/roleGroupUtils.ts`), 그리고 세 소비자 모두에서 가져오십시오.

---

### [높음] `DomainRoleBadge`/`RoleBadge` 스타일링 로직이 네 파일에 복제됨

**파일**: `src/components/AdminView.tsx:51–66` (DomainRoleBadge)
**파일**: `src/components/features/permission-settings/components/OrgRoleMappingManager.tsx:134–148` (DomainRoleBadge)
**파일**: `src/components/features/permission-settings/components/RoleDefinitionManager.tsx:59–73` (RoleBadge)

**문제**: 역할 배지 스타일링 로직 — `role.includes('ADMIN')`을 통한 `isAdmin`/`isMgr` 감지 및 세 가지 색상 변형 — 이 약간 다른 구현으로 세 위치에 복제됩니다. `AdminView`는 `DomainRoleBadge`를 사용하고, `OrgRoleMappingManager`는 동일한 로직을 가진 자신의 `DomainRoleBadge`를 정의하고, `RoleDefinitionManager`는 동일한 패턴을 가진 `RoleBadge`를 정의합니다. 역할 명명 규칙 변경은 세 파일 모두를 건드려야 합니다.

**수정 제안**: `src/components/features/permission-settings/components/shared/RoleBadge.tsx`에서 단일 `RoleBadge` 컴포넌트를 정의하고 모든 곳에서 가져오십시오.

---

### [높음] 아이콘 전용 작업 버튼에 `aria-label` 누락

**파일**: `src/components/AdminView.tsx:186–222` (테이블 행의 Eye, Power, Edit2, Trash2 버튼)
**파일**: `src/components/features/permission-settings/components/RowSecurityLayer.tsx:187–201` (RuleCard의 편집/삭제 버튼)
**파일**: `src/components/features/permission-settings/components/ColumnMaskingLayer.tsx:150–165` (PolicyCard의 편집/삭제 버튼)
**파일**: `src/components/features/permission-settings/components/RoleDefinitionManager.tsx:343–356` (편집/삭제 테이블 행 버튼)
**파일**: `src/components/features/permission-settings/components/OrgRoleMappingManager.tsx:499–512` (편집/삭제 테이블 행 버튼)

**문제**: 아이콘 전용 버튼은 도구 설명 텍스트를 위해 `title` 속성을 사용하지만 `aria-label` 속성이 누락되어 있습니다. `title` 속성은 스크린 리더에 의해 일관되게 공지되지 않습니다. WCAG 2.1 SC 4.1.2에 따르면, 대화형 컨트롤은 접근 가능한 이름을 가져야 합니다. 나열된 라인의 `RuleCard` 및 `PolicyCard` 버튼에는 `title` 또는 `aria-label`이 전혀 없습니다.

**수정 제안**: 모든 아이콘 전용 버튼에 `aria-label`을 추가하십시오:

```tsx
// 예: RowSecurityLayer.tsx 라인 187
<button
  onClick={() => onEdit(rule)}
  className="text-gray-400 hover:text-blue-600 transition-colors p-1"
  title="편집"
  aria-label="규칙 편집"
>
  <Edit2 size={13} />
</button>
```

---

### [높음] `handleUserStatusToggle`이 오래된 `users` 상태를 클로저로 포함

**파일**: `src/components/AdminView.tsx:90–97`

**문제**: `handleUserStatusToggle`은 클로저 스코프에서 `users`를 참조합니다:

```ts
const handleUserStatusToggle = (id: string) => {
  setUsers(users.map(u => { ... }));  // users에 대한 오래된 클로저
};
```

두 개의 상태 토글이 재렌더링 전에 빠르게 연달아 실행되면(예: 테스트에서의 프로그래매틱 호출 또는 빠른 사용자 입력), 두 번째 호출은 원본 `users` 스냅샷에서 작동하여 첫 번째 업데이트를 버립니다. 함수형 `setUsers(prev => ...)` 패턴은 항상 파생 상태 업데이트에 올바릅니다.

**수정 제안**: 함수형 상태 업데이트를 사용하십시오(위의 `handleUserStatusToggle`에 대한 높음 이슈에서 표시됨).

---

### [중간] `OrgRoleMappingManager`이 760줄을 초과함 — 복잡도 우려

**파일**: `src/components/features/permission-settings/components/OrgRoleMappingManager.tsx` (761줄)

**문제**: 이 단일 파일은 다음을 포함합니다: 컴포넌트의 데이터 상수, 5개 유틸리티 함수, 3개 하위 컴포넌트(`DomainRoleBadge`, `SectionHeader`), 20개 필드 폼 상태 타입, 12개의 `useState`/`useMemo`/`useCallback` 훅을 가진 주요 컴포넌트, 300줄 JSX 테이블, 그리고 200줄 대화. 이는 단일 책임 원칙을 위반하고 부작용 없이 파일을 검토, 테스트 또는 확장하기가 매우 어렵게 만듭니다.

**수정 제안**: 다음으로 분할하십시오:
- `OrgRoleMappingManager.tsx` — 얇은 오케스트레이션 컴포넌트(~150줄)
- `OrgRoleMappingTable.tsx` — 읽기 전용 테이블 뷰
- `OrgRoleMappingDialog.tsx` — 생성/편집 대화
- `orgRoleMappingUtils.ts` — `deriveRlsFilter`, `buildDataScopeDisplay`, `parseDataScopeType`

---

### [중간] `ColumnMaskingLayer.tsx`가 `editingId`와 함께 중복된 `isCreateMode` 상태를 가짐

**파일**: `src/components/features/permission-settings/components/ColumnMaskingLayer.tsx:241`

**문제**: 컴포넌트는 `editingId: string | null`과 `isCreateMode: boolean`을 독립적인 상태 변수로 유지합니다. 이들은 항상 함께 설정되고 의미론적으로 겹칩니다: `isCreateMode === true`는 `editingId === null`과 동등합니다. 이는 경쟁 조건 또는 버그가 있는 향후 편집으로 인해 `isCreateMode`가 `true`일 수 있고 동시에 `editingId`도 null이 아닐 수 있는 불일치를 만듭니다(또는 그 반대). `RowSecurityLayer`와 대조적으로, 이는 파생 상수로 `isCreateMode`를 올바르게 파생시킵니다: `const isCreateMode = editingId === null`.

**수정 제안**: `isCreateMode` 상태를 제거하고 파생시키십시오:

```ts
// 제거: const [isCreateMode, setIsCreateMode] = useState(false);
const isCreateMode = editingId === null;
```

---

### [중간] `getOverrideCount`가 모든 부범주 행 렌더링에서 호출됨

**파일**: `src/components/features/permission-settings/components/TableAccessLayer.tsx:52–66, 458`

**문제**: `getOverrideCount(subcat.id, accessMatrix)`는 각 부범주 행에 대한 렌더 루프 중 인라인으로 호출됩니다(라인 458). 이 함수는 부범주의 모든 뷰를 반복한 후 모든 15개 매트릭스 항목을 반복하여 오버라이드를 계산합니다 — 부범주당 렌더링당 O(뷰 × 역할). 43개 부범주와 평균 각각 8개 뷰가 있으면, 이는 테이블의 전체 렌더링당 대략 43 × 8 × 15 = 5,160회 반복입니다.

**수정 제안**: `accessMatrix`를 키로 하는 `useMemo`에서 오버라이드 계산을 미리 계산하십시오:

```ts
const overrideCountBySubcat = useMemo(() => {
  const counts: Record<string, number> = {};
  for (const subcat of VIEW_SUBCATEGORIES) {
    counts[subcat.id] = getOverrideCount(subcat.id, accessMatrix);
  }
  return counts;
}, [accessMatrix]);
```

---

### [중간] `renderGroupedRoleOptions`가 `OrgRoleMappingManager`에서 메모이제이션되지 않은 렌더 함수로 정의됨

**파일**: `src/components/features/permission-settings/components/OrgRoleMappingManager.tsx:360–373`

**문제**: `renderGroupedRoleOptions`는 컴포넌트 본문 내에 정의된 일반 함수입니다. `useCallback`으로 감싸지지 않으며 컴포넌트가 아닌 JSX를 직접 반환합니다. React에서 JSX를 반환하는 함수는 컴포넌트(PascalCase)여야 하거나 최소한 인수를 취하지 않을 때 `useCallback`으로 메모이제이션되어야 합니다. 이 패턴은 또한 React가 이를 안정적인 엘리먼트 트리로 추적하는 것을 방지하여 불필요한 DOM diffing을 일으킵니다.

**수정 제안**: 메모이제이션된 컴포넌트로 변환하거나 컴포넌트 외부의 정적 엘리먼트로 추출하십시오(`GROUPED_ROLES`는 모듈 수준 상수이므로):

```tsx
// 정적, 컴포넌트 외부에 정의됨 — 컴포넌트 범위의 props가 필요 없음
const GroupedRoleOptions = () => (
  <>
    <option value="">선택</option>
    {GROUPED_ROLES.map(group => (
      <optgroup key={group.domain} label={group.domainLabel}>
        {group.roles.map(r => (
          <option key={r.code} value={r.code}>{r.displayName}</option>
        ))}
      </optgroup>
    ))}
  </>
);
```

---

### [중간] `ConflictPreviewPanel`의 `toggleModule`이 `TableAccessSummary`에서 `useCallback`으로 감싸지지 않음

**파일**: `src/components/features/permission-settings/components/ConflictPreviewPanel.tsx:92–102`

**문제**: `toggleModule`이 `useCallback` 없이 정의됩니다. 각 모듈 행 버튼의 `onClick`으로 전달됩니다. `TableAccessSummary`가 메모이제이션되지 않았으므로 현재 무해하지만, 코드베이스 전체에서 핸들러 안정성에 대한 일관되지 않은 접근 방식을 나타냅니다. 이 기능의 모든 형제 컴포넌트는 일관되게 `useCallback`을 사용합니다.

**수정 제안**: `useCallback`으로 감싸십시오:

```ts
const toggleModule = useCallback((code: string) => {
  setExpandedModules(prev => {
    const next = new Set(prev);
    if (next.has(code)) next.delete(code); else next.add(code);
    return next;
  });
}, []);
```

---

### [중간] `RowSecurityLayer`의 `SqlPreview`가 Lucide 아이콘 대신 raw `<svg>`를 사용함

**파일**: `src/components/features/permission-settings/components/RowSecurityLayer.tsx:139–153`

**문제**: 같은 기능의 다른 곳에서 이미 임포트되어 사용 중인 Lucide `ChevronDown` 아이콘을 사용하지 않고(예: `OrgRoleMappingManager.tsx:2`) raw SVG chevron이 인라인으로 하드코딩되어 있습니다. 이는 Lucide 시스템과의 아이콘 일관성 계약을 깨뜨리고, 아이콘 라이브러리가 변경되면 이 SVG가 누락될 수 있다는 의미입니다.

**수정 제안**: `'../../../icons'`에서 `ChevronDown`을 임포트하고 사용하십시오.

---

### [낮음] `SENSITIVITY_DISPLAY`가 `Record<string, ...>` 대신 타입 리터럴 유니언으로 타이핑됨

**파일**: `src/components/features/permission-settings/data/viewTableData.ts:261`

**문제**: `SENSITIVITY_DISPLAY`는 `Record<string, { label: string; color: string; bgColor: string }>`으로 타이핑됩니다. 실제 키는 `'매우높음' | '높음' | '중간' | '낮음'`입니다. `string`을 키 타입으로 사용하는 것은 TypeScript가 키 조회에서 오타를 포착하지 못한다는 의미입니다(예: `SENSITIVITY_DISPLAY['높음s']`은 오류 없이 컴파일됨).

**수정 제안**: 리터럴 타입을 정의하고 사용하십시오:

```ts
type SensitivityLabel = '매우높음' | '높음' | '중간' | '낮음';
export const SENSITIVITY_DISPLAY: Record<SensitivityLabel, { label: string; color: string; bgColor: string }> = { ... };
```

---

### [낮음] 인라인 `style={{ backgroundColor: user.avatarColor }}`는 CSS 변수를 사용할 수 있음

**파일**: `src/components/AdminView.tsx:141`

**문제**: `style={{ backgroundColor: user.avatarColor }}`는 `AdminView`의 유일한 인라인 스타일입니다. 이는 인라인 스타일이 필요한 유일한 정당한 경우(데이터의 동적 색상)이지만, 프로젝트의 Tailwind 전용 스타일 규칙과의 경미한 불일치로 주목할 가치가 있습니다.

**참고**: Tailwind는 임의의 런타임 색상 값을 처리할 수 없으므로 이는 현재 상태로 수용 가능합니다. 문서화 이외의 조치는 필요하지 않습니다.

---

### [낮음] `PILL_COLORS` 상수가 `PermissionSettingsView` 컴포넌트 본문 내부에 정의됨

**파일**: `src/components/features/permission-settings/PermissionSettingsView.tsx:183–199`

**문제**: `PILL_COLORS` 객체(17개 항목)가 컴포넌트 함수 본문 내부에 정의됩니다. 이는 데이터가 절대 변경되지 않음에도 불구하고 매 렌더링마다 새로운 객체 참조가 생성된다는 의미입니다. 정적 조회 테이블의 경우 성능 영향은 무시할 수 있지만, 의도를 전달하고 할당을 피하기 위해 모듈 수준에서 정의되어야 합니다.

**수정 제안**: `PILL_COLORS` 상수를 모듈 범위로 이동하십시오(`PermissionSettingsView` 함수 외부).

---

### [낮음] `TableAccessLayer`가 `STICKY_LEFT_WIDTH`와 `CELL_WIDTH`를 컴포넌트 범위 상수로 정의함

**파일**: `src/components/features/permission-settings/components/TableAccessLayer.tsx:334–335`

**문제**: `STICKY_LEFT_WIDTH = 'w-[320px] min-w-[320px]'`와 `CELL_WIDTH = 'w-14 min-w-[56px]'`가 `TableAccessLayer` 함수 본문 내부에 정의된 후 props로 `ViewRowsSection`으로 전달됩니다. 이들은 동적 값이 없는 순수 레이아웃 상수입니다. 함수 본문 내부에서 정의하면 매 렌더링마다 문자열 참조가 재생성되고 prop 문자열을 통해 부모와 자식 간의 레이아웃 계약이 암묵적으로 연결됩니다.

**수정 제안**: 모듈 수준 상수로 이동하고 내보내십시오, `ViewRowsSection`이 props로 받지 않고 직접 임포트할 수 있도록.

---

### [낮음] `ConflictPreviewPanel`이 `rowFilters` 맵에서 배열 인덱스를 `key`로 사용함

**파일**: `src/components/features/permission-settings/components/ConflictPreviewPanel.tsx:281`

**문제**: `result.rowFilters.map((filter, idx) => <div key={idx}>...)`은 배열 인덱스를 React 키로 사용합니다. 필터가 재정렬되거나 중간에 하나가 삽입/제거되면, React가 DOM 노드를 잘못 재사용하여 잠재적으로 오래된 렌더링 아티팩트를 일으킬 수 있습니다. `rowFilters`는 SQL 문자열이므로, 필터 값 자체가 안정적이고 충분히 고유한 키입니다.

**수정 제안**:
```tsx
{result.rowFilters.map((filter) => (
  <div key={filter}>
```

---

## Quick Wins (상위 항목)

1. **`src/components/features/permission-settings/PermissionSettingsView.tsx:147`**: `{} as never`를 `{} as Partial<Record<DomainRole, Record<string, AccessLevel>>>`로 바꾸기 — 심각한 안전하지 않은 캐스트 제거 — 예상 시간 **5분**

2. **`src/components/AdminView.tsx:79`**: `useMemo([users, searchQuery])`에서 `filteredUsers` 감싸기 — 매 렌더링마다 중복되는 O(n) 필터 제거 — 예상 시간 **5분**

3. **`src/components/features/permission-settings/PermissionSettingsView.tsx:183`**: `PILL_COLORS` 상수를 컴포넌트 함수 외부로 이동 — 무노력 정확성 개선 — 예상 시간 **2분**

4. **`src/components/features/permission-settings/components/ConflictPreviewPanel.tsx:281`**: `rowFilters` 맵에서 `key={idx}`를 `key={filter}`로 바꾸기 — 잠재적 오래된 렌더링 버그 방지 — 예상 시간 **2분**

5. **`src/components/features/permission-settings/components/ColumnMaskingLayer.tsx:241`**: `isCreateMode` 상태를 제거하고 `const isCreateMode = editingId === null`로 파생시키기 — 상태 불일치 위험 제거 및 `RowSecurityLayer` 패턴과 정렬 — 예상 시간 **5분**

---

## 수치
- 검토된 파일: 12개
- 총 이슈: 22개 (심각: 2개 / 높음: 8개 / 중간: 7개 / 낮음: 5개)
- 예상 수정 시간 (Quick Wins만): 19분
