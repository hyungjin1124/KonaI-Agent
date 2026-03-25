# 스킬 관리 코드 리뷰 — 2026-03-24

## 대상
- `src/components/features/skill-management/` (54개 파일)
- `src/components/SkillManagementView.tsx` (re-export)
- `src/app/settings/skills/page.tsx`
- `src/types/skill-management.types.ts`

## 요약

총 **34건** 이슈 발견 (Critical: 5 / Major: 15 / Minor: 14). 가장 심각한 패턴은 **(1) 두 개의 독립적인 SkillManagementView가 공존하면서 구 버전이 삭제되지 않은 아키텍처 혼란**, **(2) 활성화 토글의 이중 이벤트 발화 버그**, **(3) 환경 변수 기반 관리자 권한 우회 가능성**이다.

---

## 사용자 보고 이슈 분석

### 1. 불필요한 여백이 너무 많음

**원인**: `SkillsPageView.tsx`가 실제로 렌더링되는 v4 컴포넌트인데, `src/app/settings/skills/page.tsx`는 여전히 구 `SkillManagementView`를 로드하고 있다. 구 버전(`SkillManagementView.tsx` 810줄)은 `max-w-5xl mx-auto px-8` (라인 447, 492)로 최대 너비를 1024px으로 제한하고, page.tsx에서도 `max-w-5xl mx-auto px-6` (라인 19)를 추가로 적용한다. 이 이중 제한이 넓은 화면에서 양쪽에 큰 여백을 만든다.

**관련 코드 위치**:
- `src/app/settings/skills/page.tsx` 라인 14: `lazy(() => import('../../../components/SkillManagementView'))` -- 구 버전 로드
- `src/app/settings/skills/page.tsx` 라인 19: `<div className="max-w-5xl mx-auto px-6 pt-4">`
- `src/components/features/skill-management/SkillManagementView.tsx` 라인 447: `max-w-5xl mx-auto`
- 반면 `SkillsPageView.tsx` (v4)는 `max-w-[1400px]` (라인 22)으로 더 넓은 레이아웃을 사용

**결론**: page.tsx가 v4 `SkillsPageView`가 아닌 구 `SkillManagementView`를 로드하고 있어 좁은 레이아웃이 적용됨. SkillsPageView로 교체하면 해결된다.

### 2. 우측 패널이 열렸을 때 UI가 깨져보임

**원인 1 — 고정 비율 레이아웃**: `TeamSkillsTab.tsx`에서 패널이 열리면 테이블 `w-[55%]`, 패널 `w-[45%]` (라인 253-254, 309-310)로 고정 비율을 사용한다. 뷰포트가 작을 때 테이블 컬럼들이 찌그러지며, 특히 숨겨지는 컬럼의 transition이 `opacity-0 w-0 overflow-hidden p-0`으로 처리되어 (SkillTableRow.tsx 라인 200-202) 테이블 셀이 사라지면서 남은 컬럼 폭이 불균형해진다.

**원인 2 — colSpan 불일치**: `SkillTable.tsx`의 `GroupHeaderRow`에 전달되는 `colSpan`은 `visibleColumns.length`로 계산되지만 (라인 182), 실제 `<TableHead>` 렌더링은 모든 COLUMNS를 렌더링하고 `isHidden` 시 `w-0`만 적용한다 (라인 195-212). 따라서 DOM에는 8개 `<th>`가 있지만 `colSpan`은 4개만 커버하여 그룹 헤더 행의 너비가 절반만 차지하게 된다.

**원인 3 — 인라인 style 높이**: `TeamSkillsTab.tsx` 라인 247에서 `style={{ height: 'calc(100vh - 64px)' }}`를 인라인으로 설정하는데, 실제 헤더 높이(breadcrumb + page header + tab strip)와 64px이 맞지 않을 수 있다.

**관련 코드 위치**:
- `src/components/features/skill-management/components/TeamSkillsTab.tsx` 라인 247, 250-256, 306-312
- `src/components/features/skill-management/components/SkillTable.tsx` 라인 174-182, 195-213, 220-225
- `src/components/features/skill-management/components/SkillTableRow.tsx` 라인 198-209, 211-219, 227-238, 241-252

### 3. 활성화/비활성화가 정상 작동하지 않음

**원인 — 이중 이벤트 발화**: `SkillTableRow.tsx` 라인 260-269에서 Switch 컴포넌트의 이벤트 처리가 잘못되어 있다.

```tsx
// 라인 261: 외부 div에 onClick으로 onToggle() 호출
<div onClick={handleToggleClick} onMouseDown={handleToggleCheckedChange}>
  // 라인 263: Switch의 onCheckedChange에서도 onToggle() 호출
  <Switch
    checked={skill.isActivatedByMe}
    onCheckedChange={() => onToggle()}
  />
</div>
```

`handleToggleClick`은 `e.stopPropagation()`을 호출하고 `onToggle()`을 실행한다 (라인 134-137). 동시에 Switch의 `onCheckedChange`도 `() => onToggle()`을 호출한다. Radix Switch는 클릭 시 내부적으로 `onCheckedChange`를 트리거하므로, 한 번의 클릭에 `onToggle()`이 **두 번** 호출된다. 두 번 호출되면 `isActivatedByMe`가 `true → false → true`로 원래 상태로 돌아오므로, 사용자에게는 토글이 작동하지 않는 것처럼 보인다.

또한 `handleToggleCheckedChange` (라인 139-141)는 `e.stopPropagation()`만 하고 실제 토글 로직은 없는 빈 핸들러인데, onMouseDown에 바인딩되어 있어 의도가 불분명하다.

**관련 코드 위치**:
- `src/components/features/skill-management/components/SkillTableRow.tsx` 라인 134-141, 260-269

**수정 방안**: 외부 div의 onClick 핸들러를 제거하고, Switch의 `onCheckedChange`만 사용하되 행 클릭 이벤트 전파를 `onCheckedChange` 내에서 차단해야 한다.

```tsx
// 수정 예시
<div onClick={(e) => e.stopPropagation()}>
  <Switch
    checked={skill.isActivatedByMe}
    onCheckedChange={() => onToggle()}
    aria-label={...}
  />
</div>
```

---

## 추가 발견 이슈

### [P1] Critical

| # | 파일 | 라인 | 이슈 | 수정 제안 |
|---|------|------|------|----------|
| C1 | `SkillTableRow.tsx` | 134-141, 260-269 | **이중 onToggle 호출**: div onClick + Switch onCheckedChange 모두 onToggle()을 호출하여 토글이 두 번 발화. 결과적으로 상태가 원래대로 돌아감 | div의 onClick을 e.stopPropagation()만 수행하도록 변경, onToggle은 Switch의 onCheckedChange에서만 호출 |
| C2 | `SkillManagementView.tsx` (구버전) | 8-20 | **존재하지 않는 타입 import**: `Skill`, `SkillVersion`, `SkillSource`, `SkillDeployPolicy`, `SkillApprovalRequest`, `SkillManagementTab`, `AdminSubTab`, `ApprovalStatus`, `PolicySettings`, `PublishMetadata`, `SkillCreationPath` 등이 `skill-management.types.ts`에서 삭제되었으나 구 버전이 계속 import. TypeScript 컴파일 에러 다수 발생 | 구 SkillManagementView.tsx 전체를 제거하고 SkillsPageView.tsx로 교체 |
| C3 | `SkillManagementView.tsx` (구버전) | 42 | **환경변수 기반 관리자 권한**: `process.env.NEXT_PUBLIC_SKILL_ADMIN !== 'false'`로 관리자 여부 판단. 클라이언트에 노출되는 NEXT_PUBLIC_ 변수이므로 누구나 DevTools에서 확인 가능하고, 기본값이 `true` (환경변수 미설정 시 관리자 권한 부여) | 인증 컨텍스트 기반으로 교체 필요. 최소한 기본값을 `false`로 변경 |
| C4 | `SkillsPageView.tsx` | 10 | **동일한 환경변수 관리자 권한 문제**: v4에서도 같은 패턴 사용 | C3과 동일하게 인증 컨텍스트로 교체 |
| C5 | `skillMockData.ts` | 526-535 | **5개의 `any[]` 타입 export**: 레거시 호환용 빈 배열이 `any[]`로 선언됨. eslint-disable 주석으로 우회 | 구 SkillManagementView 제거 시 함께 삭제하거나, 적절한 타입(`never[]` 또는 구체 타입)으로 교체 |

### [P2] Major

| # | 파일 | 라인 | 이슈 | 수정 제안 |
|---|------|------|------|----------|
| M1 | `SkillTable.tsx` | 174-182, 220-225 | **GroupHeaderRow colSpan 불일치**: 실제 렌더링되는 `<th>` 수는 항상 8개(hidden 포함)인데, colSpan은 `visibleColumns.length`(패널 열림 시 4)로 계산. 그룹 헤더 행이 테이블 절반만 차지함 | colSpan을 항상 `COLUMNS.length` (8)로 고정 |
| M2 | `TeamSkillsTab.tsx` | 247 | **하드코딩된 높이 계산**: `style={{ height: 'calc(100vh - 64px)' }}` 인라인 스타일. 실제 헤더 높이가 달라지면 스크롤/오버플로우 문제 발생 | `h-full` + 부모 flex 컨테이너로 교체하거나, CSS 변수 사용 |
| M3 | `TeamSkillsTab.tsx` | 94-100 | **수동 Toast 구현**: sonner/toast 라이브러리가 프로젝트에 이미 있는데 (구 SkillManagementView에서 사용), 독자적인 toast 상태관리 + 타이머를 구현 | 프로젝트 표준인 `sonner`의 `toast` 사용 |
| M4 | `TeamSkillsTab.tsx` | 129-133 | **setState 콜백 내 side-effect**: `handleToggleActivation`에서 `setSkills` 콜백 내부에서 `setTimeout(() => showToast(...), 0)`을 호출. setState updater function 내에서 side-effect 발생은 React 안티패턴 | setState 완료 후 별도로 toast 호출하거나, useEffect로 분리 |
| M5 | `DraftEditContent.tsx` | 124 | **eslint-disable 주석으로 exhaustive-deps 무시**: `useEffect`의 dependency에 `draft.draftId`만 포함하고 `draft.description`, `draft.instructionBody`, `draft.parameters`는 누락. draftId가 같으면서 내용이 변경되는 케이스에서 동기화 실패 | exhaustive-deps를 올바르게 적용하거나, draft 객체의 참조 비교를 사용 |
| M6 | `DraftEditContent.tsx` | 224-232 | **key={i} 사용 (배열 인덱스)**: ParamRow의 key로 배열 인덱스를 사용. 파라미터 순서 변경/삭제 시 React가 잘못된 컴포넌트를 재사용하여 입력값 혼란 발생 | `param.key` 또는 고유 ID를 key로 사용 |
| M7 | `SkillSlidePanel.tsx` | 281, 289 | **인라인 style `maxHeight: '300px'`**: diff 보기에서 인라인 스타일로 max-height 지정. Tailwind 유틸리티(`max-h-72` 등) 대신 사용 | `className="max-h-72 overflow-auto"`로 교체 |
| M8 | `SkillSlidePanelHeader.tsx` | 46 | **`skill.status`와 `isActivatedByMe` 혼동**: 패널 헤더에서 `skill.status === 'active'`로 "활성화 중"을 표시하는데, 이는 스킬 자체의 상태(active/deprecated)이지 사용자의 활성화 여부가 아님. 기획서 3.2절에 따르면 패널에서는 "활성화 중" 또는 "비활성"(개인 사용 여부) 텍스트를 표시해야 함 | `skill.isActivatedByMe`로 변경 |
| M9 | `AdminTab.tsx` | 190-196 | **관리자 스킬 상태가 팀 스킬과 분리**: `adminSkills`가 `[...mockTeamSkills]`로 별도 복사본. AdminTab에서 삭제/폐기해도 TeamSkillsTab의 skills 배열에 반영되지 않음 | 상위 컴포넌트에서 단일 상태 관리 후 props로 전달, 또는 Context 사용 |
| M10 | `SkillSlidePanel.tsx` | 29 | **`import()` 동적 타입 표현식**: `onSaveDraft?: (updates: Partial<import('@/types/skill-management.types').PersonalDraft>) => void` — Props 인터페이스 내에서 동적 import 사용. 가독성 저하 | 상단에서 `import type { PersonalDraft }` 후 `Partial<PersonalDraft>` 사용 (이미 import 있음) |
| M11 | 다수 컴포넌트 | - | **CATEGORY_LABELS/CATEGORY_COLORS 중복 정의**: `SkillTableRow.tsx`, `SkillSlidePanelHeader.tsx`, `OverviewTab.tsx`, `AdminSkillTable.tsx` 등 최소 4곳에서 동일한 카테고리 레이블/색상 매핑을 각각 정의 | 공통 상수 파일(예: `data/categoryConfig.ts`)로 추출 |
| M12 | `SkillTable.tsx` | 116-143 | **EmptyState 버튼에 onClick 미연결**: "스킬 가져오기"와 "새 스킬 만들기" 버튼에 onClick 핸들러가 없음. 클릭해도 아무 동작 안 함 | 부모로부터 핸들러를 props로 받아 연결 |
| M13 | `CategoryFilterBar.tsx` | 28 | **존재하지 않는 속성 접근**: `SKILL_CATEGORIES` 항목에 `emoji` 속성이 없는데 `cat.emoji`를 참조. TypeScript 컴파일 에러 | emoji 속성 추가하거나 해당 코드 제거 |
| M14 | `SkillSlidePanelHeader.tsx` | 53 | **삭제 조건 로직 오류**: `showDeprecateRequest = skill.usageCount > 1 && !isAuthor`. 기획서 6.5절에 따르면 "다른 활성화 사용자가 있을 때" 폐기 요청이어야 하는데, 현재 코드는 작성자 본인이면 usageCount와 무관하게 항상 "삭제" 표시. 작성자가 아닌데 usageCount가 1이면 "삭제"가 표시되어 다른 사용자의 스킬을 직접 삭제할 수 있음 | 작성자 여부와 다른 사용자의 활성화 여부를 분리하여 판단. isAuthor + usageCount > 1이면 폐기 요청, !isAuthor이면 삭제 불가 (관리자만 가능) |
| M15 | `SkillsPageView.tsx` | 13-16 | **mockPendingSuggestions를 빈 deps useMemo로 계산**: deps가 `[]`이므로 suggestions가 업데이트되어도 badge count가 갱신되지 않음. 현재는 mock이라 문제없지만, 실제 데이터 연동 시 버그 | deps에 suggestions 배열 참조 추가 또는 직접 계산 |

### [P3] Minor

| # | 파일 | 라인 | 이슈 | 수정 제안 |
|---|------|------|------|----------|
| m1 | `SkillManagementView.tsx` (구버전) | 1-809 | **809줄 단일 컴포넌트**: 과도한 단일 파일 복잡도. v4에서 분리되었으나 구 파일이 남아있음 | 구 파일 제거 |
| m2 | `SkillManagementView.tsx` (구버전) | 1-809 | **사용되지 않는 레거시 파일**: page.tsx에서 로드되나 v4(SkillsPageView.tsx)가 존재. 두 버전이 공존하여 혼란 유발 | 구 파일 삭제, page.tsx에서 SkillsPageView 로드 |
| m3 | `SkillSlidePanel.tsx` | 326 | **JSON.stringify로 깊은 비교**: `JSON.stringify(skill.parameters) === JSON.stringify(skill.myDraft.parameters)` — 성능상 비효율적이고, 속성 순서에 민감 | lodash `isEqual` 또는 커스텀 deep compare 사용 |
| m4 | `DraftEditContent.tsx` | 200 | **인라인 style `minHeight: '200px'`**: Tailwind `min-h-[200px]` 대신 인라인 스타일 사용 | `className="min-h-[200px]"`로 교체 |
| m5 | `SuggestionReviewModal.tsx` | 204 | **인라인 style `maxWidth/width/maxHeight`**: 모달 크기를 인라인 스타일로 지정 | Tailwind 유틸리티 클래스 사용 |
| m6 | `SkillSlidePanel.tsx` | 53 | **DraftEditHeader에 너무 많은 props (8개)**: 구조 분해가 길어짐 | props 객체로 그룹화하거나 Context 사용 검토 |
| m7 | `TeamSkillsTab.tsx` | 50 | **미사용 상태 가능성 — toast**: 독자 toast 구현이 sonner로 교체 시 불필요해짐 | M3 해결 시 자연 해소 |
| m8 | `SkillSourceBadge.tsx` | - | **SkillSource 타입 미존재**: `skill-management.types.ts`에서 `SkillSource`가 `SkillCreationSource`로 변경되었으나 이 파일은 여전히 `SkillSource`를 import. 컴파일 에러 | `SkillCreationSource`로 교체하고 값 매핑 업데이트 |
| m9 | `CategoryFilterBar.tsx` | 28 | **emoji 속성 참조 오류로 컴파일 실패**: TS2339 에러 | SKILL_CATEGORIES 정의에 emoji 추가하거나 코드에서 emoji 참조 제거 |
| m10 | `DeprecationQueue.tsx` | 132 | **컴포넌트 내부에서 상수 배열 정의**: `FILTER_TABS`가 렌더 함수 안에서 매번 새 배열 생성 | 컴포넌트 외부로 이동 |
| m11 | `AdminTab.tsx` | 303-324 | **컴포넌트 내부에서 상수 객체 정의**: `SECTION_META`가 매 렌더마다 새 객체 생성 | 컴포넌트 외부로 이동 |
| m12 | `SkillSlidePanel.tsx` | 204-210 | **컴포넌트 내부 TAB_ITEMS 배열**: 매 렌더마다 새 배열 생성 | `useMemo` 또는 컴포넌트 외부 정의 (attachmentCount 의존성 있으므로 useMemo 권장) |
| m13 | `SkillSlidePanelHeader.tsx` | 98-99 | **`skill.status === 'active'` vs 기획서 의미**: '활성화 중'이라는 텍스트가 기획서에서는 "개인 활성화 상태"를 의미하는데, 코드에서는 스킬 자체의 상태를 표시. M8과 연관 | M8 수정 시 함께 해결 |
| m14 | 전체 | - | **i18n 미적용**: 모든 한국어 문자열이 하드코딩되어 있음. 현 단계에서는 의도적일 수 있으나, 향후 다국어 지원 시 대규모 수정 필요 | i18n 키로 점진적 교체 계획 수립 |

---

## 기획 대비 구현 상태

| 기능 (03-skill-ia.md 기준) | 상태 | 비고 |
|---|---|---|
| 팀 스킬 테이블 (활성화/비활성 그룹 분리) | 구현됨 | SkillTable.tsx에서 그룹 분리 및 정렬 적용 |
| 테이블 컬럼 (이름, 설명, 카테고리, 작성자, 수정일, 버전, 사용횟수, 활성화) | 구현됨 | 기획 명세와 일치 |
| 패널 열림 시 테이블 컬럼 축약 | 구현됨 | collapsible 컬럼 정의 + opacity/width transition |
| 슬라이드 패널 (스킬 상세) | 구현됨 | 5개 탭 (개요/본문/첨부/버전/제안) |
| 슬라이드 패널 전체 확장 | 구현됨 | isExpanded 토글로 w-full 전환 |
| 활성화 토글 (테이블에서만) | **버그** | 이중 이벤트로 작동 안 함 (C1) |
| 패널에서 상태 텍스트만 표시 | **오류** | skill.status 대신 isActivatedByMe 사용해야 함 (M8) |
| 개인 수정본 (편집 시 자동 생성) | 구현됨 | makePersonalDraft + handleStartDraft |
| 수정본 편집 모드 (원본/편집/diff 토글) | 구현됨 | DraftEditHeader + DraftEditContent |
| 개선 제안 제출 | 구현됨 | handleSubmitSuggestion |
| 관리자 탭 — 신규 스킬 검토 | 구현됨 | NewSkillReviewSection |
| 관리자 탭 — 제안 대기열 | 구현됨 | SuggestionQueue + SuggestionReviewModal |
| 관리자 탭 — 폐기 요청 | 구현됨 | DeprecationQueue |
| 관리자 탭 — 전체 스킬 관리 | 구현됨 | AdminSkillTable |
| 관리자 탭 — 카테고리 관리 | 구현됨 | CategoryManager |
| 스킬 추가 — 채팅에서 만들기 | **스텁** | Toast "준비 중" 표시만 |
| 스킬 추가 — 파일에서 가져오기 | **스텁** | Toast "준비 중" 표시만 |
| 검색 + 필터 (카테고리/상태/작성자) | 구현됨 | SkillFilters.tsx |
| 삭제 권한 분기 (사용 여부 기반) | **부분** | 로직이 기획과 다름 (M14) |
| 빈 상태 화면 | 구현됨 | SkillTable EmptyState (단, 버튼 미연결 M12) |
| 버전 비교 (diff) | **미구현** | VersionHistoryTab에서 두 버전 간 diff 비교 UI 없음. 기획서 3.2절 D항 "버전 비교: 선택한 두 버전 간 diff 표시" 미구현 |
| 버전 복원 (관리자) | **미구현** | 기획서 3.2절 D항 "이전 버전으로 되돌리기 (관리자만)" 미구현 |
| 관리자 카테고리 변경 | 구현됨 | AdminSkillTable 드롭다운 메뉴 |
| 수정본 테스트 기능 | **미구현** | 기획서 3.3절 "[테스트] 클릭 → 내 채팅에서 수정본 적용" 미구현 |
| 관리자 vs 일반 사용자 탭 분기 | 구현됨 | 환경변수 기반 (보안 문제 있음 C3/C4) |

---

## 권장 수정 사항

### 즉시 수정 (Quick Wins)

1. **`SkillTableRow.tsx` 라인 260-269**: Switch 이중 이벤트 수정 — est. **10min**
   - 외부 div의 onClick에서 `onToggle()` 제거, `e.stopPropagation()`만 유지
   - Switch의 `onCheckedChange`에서만 `onToggle()` 호출

2. **`SkillTable.tsx` 라인 182**: GroupHeaderRow colSpan을 `COLUMNS.length`로 고정 — est. **5min**

3. **`src/app/settings/skills/page.tsx` 라인 14**: 구 SkillManagementView 대신 v4 SkillsPageView를 lazy import — est. **10min**
   ```tsx
   const SkillsPageView = lazy(() => import('../../../components/features/skill-management/SkillsPageView'));
   ```

4. **`SkillSlidePanelHeader.tsx` 라인 46**: `skill.status === 'active'`를 `skill.isActivatedByMe`로 변경 — est. **5min**

5. **`skillMockData.ts` 라인 526-535**: `any[]`를 `never[]`로 교체 (eslint-disable 제거 가능) — est. **5min**

### 스프린트 내 수정

6. **환경변수 관리자 권한을 인증 컨텍스트로 교체** (C3/C4): `useAdminGuard` hook이 이미 프로젝트에 존재 (`src/hooks/useAdminGuard.ts`). 이를 활용하여 교체
7. **AdminTab 상태 분리 해소** (M9): 팀 스킬과 관리자 스킬이 별도 state인 문제. Context 또는 상위 상태로 통합
8. **카테고리 상수 중복 제거** (M11): 공통 `categoryConfig.ts` 파일로 추출
9. **구 SkillManagementView.tsx 완전 삭제** (m1/m2): 레거시 코드 정리
10. **삭제 권한 로직 기획 맞춤 수정** (M14): 작성자/비작성자/관리자별 분기 구현

---

## Metrics
- Files reviewed: 29
- Total issues: 34 (Critical: 5 / Major: 15 / Minor: 14)
- Estimated fix time (Quick Wins only): 35min
