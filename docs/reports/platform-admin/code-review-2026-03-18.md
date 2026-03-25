# 코드 리뷰 — platform-admin — 2026-03-18

## 대상
- `src/app/platform-admin/`
- `src/components/features/platform-admin/` (전체 하위 파일)

## 요약
총 **21개 이슈** (Critical: 2, High: 7, Medium: 8, Low: 4)를 발견했습니다.
가장 중요한 패턴은 **모달 접근성 전반 부재**(포커스 관리·Escape 키 미처리)와 **런타임 크래시 가능성**(빈 배열에 대한 `data[0]` 접근)입니다.
모든 파일에서 `any` 타입은 발견되지 않았으나, `unknown` 타입을 props로 받는 setter 함수와 런타임 버그 가능성이 있는 미사용 변수가 잔존합니다.

---

## Critical 이슈

### [Critical] CSV 내보내기 시 빈 배열에서 `data[0]` 접근으로 런타임 크래시

- **파일**: `src/components/features/platform-admin/components/PlatformAuditLogTab.tsx:77`
- **설명**: `handleExport` 함수 내에서 CSV 헤더 생성 시 `Object.keys(data[0])` 를 직접 호출합니다. `filteredEvents`가 비어 있는 상태에서 CSV 내보내기 버튼을 클릭하면 `data[0]`이 `undefined`가 되어 `TypeError: Cannot convert undefined or null to object` 런타임 크래시가 발생합니다.

```tsx
// 현재 코드 (PlatformAuditLogTab.tsx:77)
const content = format === 'json'
  ? JSON.stringify(data, null, 2)
  : [Object.keys(data[0]).join(','), ...data.map(r => Object.values(r).join(','))].join('\n');

// 수정 제안
if (data.length === 0) {
  alert('내보낼 데이터가 없습니다.');
  return;
}
const content = format === 'json'
  ? JSON.stringify(data, null, 2)
  : [Object.keys(data[0]).join(','), ...data.map(r => Object.values(r).join(','))].join('\n');
```

---

### [Critical] CSV 내보내기에서 CSV 인젝션(CSV Injection) 미방어

- **파일**: `src/components/features/platform-admin/components/PlatformAuditLogTab.tsx:77`
- **설명**: `Object.values(r).join(',')` 로 CSV를 생성할 때 셀 값에 `,`, `"`, `=`, `+`, `-`, `@` 같은 문자가 포함될 경우 데이터가 깨지거나, 스프레드시트 앱에서 수식으로 실행되는 CSV 인젝션 취약점이 발생합니다. 감사 로그 데이터(`actor`, `description`, `detail`)는 외부 입력을 포함하므로 실제 운영 시 위험합니다.

```tsx
// 수정 제안: 셀 값 이스케이프 함수 추가
const escapeCSVValue = (val: unknown): string => {
  const str = String(val ?? '');
  // 수식 인젝션 방지: =, +, -, @ 시작 값 앞에 작은따옴표 추가
  const safe = str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')
    ? `'${str}`
    : str;
  // 쉼표·줄바꿈·큰따옴표 포함 시 큰따옴표로 감싸기
  return /[,"\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

// 사용
const content = [
  Object.keys(data[0]).join(','),
  ...data.map(r => Object.values(r).map(escapeCSVValue).join(','))
].join('\n');
```

---

## High 이슈

### [High] 모달 3종 모두 Escape 키 닫기 미구현 및 포커스 관리 부재

- **파일**:
  - `src/components/features/platform-admin/components/TenantCreateWizard.tsx:89`
  - `src/components/features/platform-admin/components/StatusChangeModal.tsx:56`
  - `src/components/features/platform-admin/components/AlertRuleEditorModal.tsx:82`
- **설명**: 세 모달 모두 Radix UI Dialog를 사용하지 않고 `div` + `fixed inset-0` 오버레이로 직접 구현했습니다. 그 결과 ① Escape 키로 닫기가 동작하지 않고 ② 모달 열릴 때 첫 번째 포커스 가능 요소로 포커스가 이동하지 않으며 ③ 모달 바깥으로 포커스가 탈출합니다. WCAG 2.1 AA 기준 위반(성공기준 2.1.2 No Keyboard Trap 역방향)입니다.

```tsx
// 수정 제안 1: Radix UI Dialog로 교체 (권장)
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';

// 수정 제안 2: useEffect로 Escape 키 처리 (단기 패치)
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [onClose]);
```

---

### [High] `TenantDetailPanel` 초기 상태가 prop 변경을 반영하지 않는 stale state 버그

- **파일**: `src/components/features/platform-admin/components/TenantDetailPanel.tsx:86-88`
- **설명**: 컴포넌트가 `useState(initialTenant)`로 내부 상태를 초기화하지만 `key` prop 없이 재사용됩니다. `TenantManagementTab`에서 다른 테넌트를 선택하면 `initialTenant` prop은 바뀌지만 이미 마운트된 `TenantDetailPanel`의 내부 `tenant` state는 이전 테넌트 값을 유지합니다. 즉, 테넌트 A를 선택하고 수정한 후 테넌트 B를 선택하면 상세 패널이 B의 정보가 아닌 A의 수정된 정보를 보여줄 수 있습니다.

```tsx
// 수정 제안 1: key prop으로 강제 재마운트 (TenantManagementTab.tsx:167)
{selectedTenant && (
  <TenantDetailPanel
    key={selectedTenant.id}   // 추가
    tenant={selectedTenant}
    onUpdate={handleUpdate}
  />
)}

// 수정 제안 2: useEffect로 prop 동기화
useEffect(() => {
  setTenant(initialTenant);
  setLimits(initialTenant.resourceLimits);
}, [initialTenant.id]); // id 변경 시에만 초기화
```

---

### [High] `TraceWaterfallPanel` — 슬라이드 패널이 화면 밖에서 열릴 때 overflow 처리 없음 및 닫기 키보드 지원 부재

- **파일**: `src/components/features/platform-admin/components/TraceWaterfallPanel.tsx:28`
- **설명**: 패널이 `w-[500px] fixed inset-y-0 right-0`으로 렌더되는데 화면 너비가 500px 미만인 경우 콘텐츠 일부가 잘립니다. 또한 패널을 닫는 `onClose` 버튼이 스크린 리더에 레이블이 없고(`aria-label` 미사용), Escape 키로 닫을 수 없습니다.

```tsx
// 수정 제안: 반응형 너비 + 닫기 버튼 접근성
<div className="fixed inset-y-0 right-0 w-full max-w-[500px] bg-white shadow-2xl border-l border-gray-200 flex flex-col z-50">
  ...
  <button
    onClick={onClose}
    className="text-gray-400 hover:text-gray-600 mt-0.5"
    aria-label="트레이스 패널 닫기"
  >
    <X size={16} />
  </button>
```

---

### [High] `generateHourlyVolume()` 모듈 로드 시마다 다른 값 생성 — 차트가 매 페이지 이동 시 다르게 렌더됨

- **파일**: `src/components/features/platform-admin/data/auditLogData.ts:152-165`
- **설명**: `generateHourlyVolume()` 함수가 `Math.random()`을 사용하며 모듈 최상위에서 즉시 실행(`HOURLY_VOLUME = generateHourlyVolume()`)됩니다. 이 코드는 모듈이 처음 임포트될 때 한 번 실행되므로 동일 세션 내에서는 일관성이 유지되지만, Hot Module Replacement(HMR) 또는 Fast Refresh 환경에서는 매 저장마다 차트 데이터가 달라져 예측 불가능한 렌더 결과를 초래합니다. `usageAlertData.ts`의 `generateDailyApiCalls`, `generateTokenConsumption`, `costData.ts`의 `generateCostForecast`도 동일 패턴입니다.

```typescript
// 수정 제안: 고정 시드 기반 결정론적 데이터로 대체
// 예: 시간값을 인덱스 기반 수식으로 생성
export const HOURLY_VOLUME = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, '0')}:00`,
  info: 20 + Math.round(Math.sin(h * 0.5) * 15 + 15),
  warning: 2 + Math.round(Math.abs(Math.sin(h * 0.8)) * 4),
  critical: h === 9 || h === 14 ? 1 : 0,
}));
```

---

### [High] `updateLimit` 함수 — `isNaN(Number(raw))` 로직 오류로 숫자 필드에 임의 문자열 저장 가능

- **파일**: `src/components/features/platform-admin/components/TenantDetailPanel.tsx:112-119`
- **설명**: `updateLimit` 함수는 `isNaN(Number(raw))` 가 false이면 숫자로 변환하고, true이면 원본 문자열을 그대로 저장합니다. 그러나 `ResourceLimits` 타입의 대부분 필드(`rateLimitPerMin`, `maxConcurrentSessions`, `maxUsers`, `fileStorageGb`, `dataRetentionMonths`)는 `number` 타입으로 선언되어 있습니다. 사용자가 임의 문자열("abc")을 입력하면 TypeScript 타입 정의(`number`)를 위반한 문자열 값이 저장됩니다.

```typescript
// 현재 코드 (버그)
const parsed = isNaN(Number(raw)) ? raw : Number(raw);

// 수정 제안: 숫자 필드는 파싱 실패 시 저장 거부
const updateLimit = (key: keyof ResourceLimits, raw: string) => {
  // tokenLimitPerMonth는 string 타입이므로 예외 처리
  if (key === 'tokenLimitPerMonth') {
    const updated = { ...limits, [key]: raw };
    setLimits(updated);
    const updatedTenant = { ...tenant, resourceLimits: updated };
    setTenant(updatedTenant);
    onUpdate?.(updatedTenant);
    return;
  }
  const parsed = Number(raw.replace(/,/g, ''));
  if (isNaN(parsed) || parsed < 0) return; // 유효하지 않은 입력 무시
  const updated = { ...limits, [key]: parsed };
  setLimits(updated);
  const updatedTenant = { ...tenant, resourceLimits: updated };
  setTenant(updatedTenant);
  onUpdate?.(updatedTenant);
};
```

---

### [High] `AlertRuleEditorModal` — `s.action` 타입 단언이 `AlertThresholdStep.action`의 optional 필드를 강제 캐스팅

- **파일**: `src/components/features/platform-admin/components/AlertRuleEditorModal.tsx:39`
- **설명**: `usageAlertData.ts`의 `MOCK_ALERT_RULES`에서 `action` 필드가 `'서비스 제한'`, `'429 거부'`, `'자동 승인 요청'` 같은 한국어 문자열을 사용하는 반면, `AlertAction` 타입은 `'notify' | 'throttle' | 'block'`으로 정의되어 있습니다. `as AlertAction` 강제 캐스팅으로 타입 에러는 사라지지만, 런타임에서 Action 렌더링 로직(`ACTION_OPTIONS`)이 해당 값을 처리하지 못해 의도치 않은 기본값으로 폴백됩니다.

```typescript
// 현재 코드 (타입 단언)
action: (s.action ?? 'notify') as AlertAction,

// 수정 제안: usageAlertData.ts의 action 값을 AlertAction 타입으로 통일
// usageAlertData.ts
{ threshold: '100%', channels: ['email', 'in-app', 'slack'], target: 'all', action: 'throttle' },
//                                                                                   ^^ '서비스 제한' → 'throttle'
```

---

### [High] `PlatformAuditLogTab` — 페이지네이션 정보가 `filteredEvents.length === 0`일 때 "총 0건 중 1-0" 표시

- **파일**: `src/components/features/platform-admin/components/PlatformAuditLogTab.tsx:183`
- **설명**: `filteredEvents`가 비어 있으면 `page * ITEMS_PER_PAGE + 1` = `1`로 계산되고 `Math.min(0, 0)` = `0`이 되어 "총 0건 중 1-0"이라는 잘못된 텍스트가 표시됩니다.

```tsx
// 수정 제안
<span>
  {filteredEvents.length === 0
    ? '검색 결과 없음'
    : `총 ${filteredEvents.length}건 중 ${page * ITEMS_PER_PAGE + 1}-${Math.min((page + 1) * ITEMS_PER_PAGE, filteredEvents.length)}`}
</span>
```

---

## Medium 이슈

### [Medium] `costData.ts` — `isActual` 변수가 선언되었으나 사용되지 않음 (데드 코드)

- **파일**: `src/components/features/platform-admin/data/costData.ts:69`
- **설명**: `const isActual = i >= 0; // treat all as having data for demo` 라인이 있으나 이 변수는 이후 어디에도 참조되지 않습니다. `i >= 0` 은 루프 범위(0에서 29까지 내려가는 반복)상 항상 `true`이므로 의도한 실제 데이터 vs. 예측 데이터 분기 로직이 미완성 상태입니다.

```typescript
// 제거 필요
const isActual = i >= 0; // treat all as having data for demo  ← 삭제
```

---

### [Medium] 아이콘 전용 버튼들에 `aria-label` 누락

- **파일**:
  - `src/components/features/platform-admin/components/TenantDetailPanel.tsx:59,68,206,237,240`
  - `src/components/features/platform-admin/components/TenantCreateWizard.tsx:94`
  - `src/components/features/platform-admin/components/AlertRuleEditorModal.tsx:89`
  - `src/components/features/platform-admin/components/TraceWaterfallPanel.tsx:35`
- **설명**: `<Copy>`, `<RefreshCw>`, `<Trash2>`, `<Edit2>`, `<X>` 등 아이콘만 있는 버튼에 `aria-label`이 없어 스크린 리더 사용자가 버튼의 역할을 파악할 수 없습니다.

```tsx
// 수정 예시
<button onClick={handleSave} aria-label="저장" className="text-green-600 hover:text-green-700">
  <Check size={12} />
</button>
<button onClick={handleCancel} aria-label="취소" className="text-gray-400 hover:text-gray-600">
  <X size={12} />
</button>
<Button variant="outline" size="sm" className="h-6 text-[10px] px-2" aria-label="API 키 복사">
  <Copy size={10} className="mr-0.5" />복사
</Button>
```

---

### [Medium] 토글 버튼이 `role="switch"`와 `aria-checked` 없이 구현됨

- **파일**:
  - `src/components/features/platform-admin/components/TenantCreateWizard.tsx:202-207, 214-219, 271-276`
  - `src/components/features/platform-admin/components/StatusChangeModal.tsx:139-143`
- **설명**: 커스텀 토글 스위치가 시각적으로는 switch처럼 보이지만 `role="switch"`와 `aria-checked` 속성이 없어 스크린 리더가 이를 일반 버튼으로 인식합니다. 프로젝트에 이미 Radix UI Switch 컴포넌트(`src/components/ui/switch.tsx`)가 있으며 `AlertRuleCard`에서 이미 사용 중입니다.

```tsx
// 수정 제안: 기존 Switch 컴포넌트 사용 (AlertRuleCard.tsx 패턴 참고)
import { Switch } from '../../../ui/switch';

<Switch
  checked={data.useInviteLink}
  onCheckedChange={(checked) => set('useInviteLink', checked)}
  aria-label="초대 링크로 계정 설정"
/>
```

---

### [Medium] `TenantDetailPanel` — `EditableField` 컴포넌트의 `label` 요소가 `htmlFor` 없이 텍스트만 표시

- **파일**: `src/components/features/platform-admin/components/TenantDetailPanel.tsx:28-75`
- **설명**: `EditableField` 내의 레이블 텍스트가 `<span>` 태그로 렌더되어 대응하는 `<Input>` 과 연결되지 않습니다. 스크린 리더가 입력 필드 진입 시 레이블을 읽지 못합니다.

```tsx
// 수정 제안
const EditableField: React.FC<...> = ({ label, value, unit, onSave }) => {
  const inputId = `editable-${label.replace(/\s+/g, '-')}`;
  return (
    <div className="flex items-center gap-2 py-1.5 text-sm group">
      <label htmlFor={inputId} className="text-gray-500 min-w-[100px] flex-shrink-0">{label}</label>
      {editing ? (
        <Input id={inputId} ... />
      ) : (
        // 표시 모드에는 label htmlFor 역할이 없어도 무방
        ...
      )}
    </div>
  );
};
```

---

### [Medium] `UsageAlertTab` 컴포넌트가 `ActivityMonitoringTab`과 거의 동일한 코드를 중복 보유

- **파일**:
  - `src/components/features/platform-admin/components/UsageAlertTab.tsx` (168줄)
  - `src/components/features/platform-admin/components/ActivityMonitoringTab.tsx` (138줄)
- **설명**: 두 컴포넌트 모두 동일한 `TENANT_COLORS` 상수, `levelBadge` 함수, KPI 카드 4종 레이아웃, API 호출량/토큰 소비 차트, 테넌트별 사용량 테이블을 거의 동일하게 구현하고 있습니다. `UsageAlertTab`은 `AlertManagementTab`과 기능이 겹치는 "알림 관리" 섹션도 포함합니다. `PlatformAdminView`에서 `UsageAlertTab`을 탭으로 마운트하는 코드는 없어 사실상 미사용 컴포넌트로 보입니다.

```
// 확인 필요: PlatformAdminView.tsx 탭 목록에 'usage-alert' 탭이 없음
// UsageAlertTab은 탭에 등록되지 않아 데드 컴포넌트 가능성
```

---

### [Medium] `TenantManagementTab` — 필터 상태(`statusFilter`, `searchQuery`) 변경 시 `selectedTenant` 패널이 닫히지 않아 UX 혼선

- **파일**: `src/components/features/platform-admin/components/TenantManagementTab.tsx:25-37`
- **설명**: 사용자가 테넌트 A를 선택해 상세 패널을 열고 나서 검색어를 변경하면, 테넌트 A가 필터 결과에서 사라져도 `selectedTenant` state는 유지되어 상세 패널이 계속 표시됩니다. 테넌트 카드와 상세 패널이 불일치하는 상태가 됩니다.

```typescript
// 수정 제안: 필터 변경 시 선택 해제
const handleStatusFilterChange = (value: string) => {
  setStatusFilter(value);
  setSelectedTenant(null); // 선택 초기화
};
const handleSearchQueryChange = (value: string) => {
  setSearchQuery(value);
  setSelectedTenant(null); // 선택 초기화
};
```

---

### [Medium] `AlertRuleEditorModal` — 임계치 단계가 0개가 되어도 저장 가능

- **파일**: `src/components/features/platform-admin/components/AlertRuleEditorModal.tsx:44-55`
- **설명**: `removeThreshold` 함수가 `thresholds.length > 1`일 때만 삭제 버튼을 렌더하지만, 이 조건은 UI에서만 보호합니다. 저장 시 `thresholds`가 비어 있는 경우(`thresholdSteps: []`)에 대한 검증이 없어 의도치 않은 빈 규칙이 생성될 수 있습니다.

```tsx
// 수정 제안: handleSave에 최소 1개 임계치 검증 추가
const handleSave = () => {
  if (!name.trim()) return;
  if (thresholds.length === 0) {
    alert('최소 1개의 임계치 단계가 필요합니다.');
    return;
  }
  if (thresholds.some(t => !t.threshold.trim())) {
    alert('모든 임계치 값을 입력해주세요.');
    return;
  }
  // ... 기존 저장 로직
};
```

---

### [Medium] `TenantCreateWizard` — 계약 종료일이 시작일보다 이전이어도 통과

- **파일**: `src/components/features/platform-admin/components/TenantCreateWizard.tsx:65`
- **설명**: Step 2 유효성 검사(`isStep2Valid`)가 `data.contractStart && data.contractEnd` 가 비어 있지 않으면 통과합니다. `contractEnd < contractStart` 인 경우에 대한 날짜 순서 검증이 없어 잘못된 계약 기간으로 테넌트가 생성될 수 있습니다.

```typescript
// 수정 제안
const isStep2Valid = data.plan && data.contractStart && data.contractEnd
  && new Date(data.contractEnd) > new Date(data.contractStart);
```

---

## Low 이슈

### [Low] `Cell` 컴포넌트에 배열 인덱스를 `key`로 사용

- **파일**:
  - `src/components/features/platform-admin/components/AgentTraceSection.tsx:75`
  - `src/components/features/platform-admin/components/BillingTab.tsx:111`
  - `src/components/features/platform-admin/components/CostManagementTab.tsx:98`
  - `src/components/features/platform-admin/components/AlertRuleCard.tsx:23`
  - `src/components/features/platform-admin/components/AlertRuleEditorModal.tsx:117`
- **설명**: Recharts `Cell` 컴포넌트와 임계치 단계 div에 `key={idx}`를 사용합니다. Recharts Cell의 경우 실제 영향은 미미하나, `AlertRuleEditorModal.tsx:117`의 임계치 단계 div는 순서 변경 기능이 추가될 경우 리렌더 버그로 이어집니다.

```tsx
// 수정 제안 (AlertRuleEditorModal.tsx)
{thresholds.map((t, idx) => (
  <div key={t.threshold + idx} ...>  // 또는 고유 id 부여
```

---

### [Low] 하드코딩된 브랜드 색상값 (`#534AB7`, `#4339a0`)이 여러 파일에 산재

- **파일**: `PlatformAdminView.tsx`, `TenantManagementTab.tsx`, `TenantDetailPanel.tsx`, `TenantCreateWizard.tsx`, `AlertManagementTab.tsx`, `AlertRuleEditorModal.tsx`, `BillingTab.tsx`, `StatusChangeModal.tsx`
- **설명**: 브랜드 컬러 `#534AB7`이 8개 파일에 걸쳐 18회 이상 리터럴로 사용됩니다. 디자인 토큰 또는 Tailwind 커스텀 컬러로 중앙화가 필요합니다.

```js
// tailwind.config.ts 추가 제안
theme: {
  extend: {
    colors: {
      brand: {
        DEFAULT: '#534AB7',
        dark: '#4339a0',
      }
    }
  }
}
// 사용: className="bg-brand hover:bg-brand-dark"
```

---

### [Low] `PlatformAuditLogTab` — 기간 필터 `select`가 UI에만 존재하고 실제 필터 로직과 연결되지 않음

- **파일**: `src/components/features/platform-admin/components/PlatformAuditLogTab.tsx:108-110`
- **설명**: 기간 필터 `select`가 상태 변수나 필터 함수에 연결되어 있지 않아 선택해도 아무 동작도 하지 않습니다. UX상 기능이 동작하는 것처럼 보이지만 실제로는 dead UI입니다.

```tsx
// 수정 제안: 상태 연결
const [periodFilter, setPeriodFilter] = useState('24h');
<select
  value={periodFilter}
  onChange={e => { setPeriodFilter(e.target.value); setPage(0); }}
  className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700"
>
  {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
</select>
```

---

### [Low] `ActivityMonitoringTab` — 필터 `select`들이 상태와 연결되지 않음 (dead UI)

- **파일**: `src/components/features/platform-admin/components/ActivityMonitoringTab.tsx:48-56`
- **설명**: "전체 테넌트" 및 "최근 30일" select 필터가 `onChange` 핸들러 없이 렌더만 됩니다. 같은 문제가 `UsageAlertTab.tsx:57-63`에도 있습니다.

---

## Quick Wins (Top 5)

1. **`PlatformAuditLogTab.tsx`**: `data[0]` 접근 전 `data.length === 0` 가드 추가 — 예상 5분
2. **`TenantDetailPanel.tsx`**: `TenantManagementTab`에서 `key={selectedTenant.id}` 추가로 stale state 버그 수정 — 예상 5분
3. **`TenantDetailPanel.tsx` / `TenantCreateWizard.tsx` / `StatusChangeModal.tsx`**: 커스텀 토글 버튼을 기존 `Switch` 컴포넌트로 교체하여 접근성 일괄 개선 — 예상 20분
4. **`costData.ts` / `auditLogData.ts` / `usageAlertData.ts`**: `isActual` 미사용 변수 제거 및 `Math.random()` 대신 결정론적 시드 데이터로 교체 — 예상 15분
5. **`TenantCreateWizard.tsx`**: 계약 종료일 > 시작일 날짜 검증 한 줄 추가 — 예상 5분

---

## Metrics
- 검토 파일: 28개 (컴포넌트 19개 + 데이터 파일 7개 + 타입 파일 1개 + 페이지 파일 1개)
- 총 이슈: 21개 (Critical: 2 / High: 7 / Medium: 8 / Low: 4)
- 예상 수정 시간 (Quick Wins 기준): 50분
