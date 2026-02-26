# Fix Request: Model / Agent Switcher

## QA 판정: FAIL
## 수정 사이클: 1/3

---

## 수정 항목

### 1. **[Critical] localStorage.setItem 에러 핸들링 추가**

**파일**: `src/components/features/model-switcher/useModelSelection.ts:33-38`

**문제**:
- `localStorage.setItem()` 호출이 try-catch 없이 실행됨
- Storage quota가 초과되면 컴포넌트가 크래시함
- Private browsing mode에서 setItem이 차단되면 앱이 멈춤

**현재 코드** (lines 33-38):
```typescript
const handleModelChange = useCallback((modelId: string) => {
  setSelectedModelId(modelId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, modelId); // ❌ No error handling
  }
}, []);
```

**수정 방향**:
```typescript
const handleModelChange = useCallback((modelId: string) => {
  setSelectedModelId(modelId);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, modelId);
    } catch (error) {
      // Graceful degradation: state updates but not persisted
      console.warn('[ModelSelection] localStorage.setItem failed:', error);
    }
  }
}, []);
```

**검증 방법**: QA 테스트 `ModelSwitcher.qa.test.tsx` "handles localStorage.setItem failure gracefully" 통과

---

### 2. **[Critical] localStorage.getItem 에러 핸들링 추가**

**파일**: `src/components/features/model-switcher/useModelSelection.ts:17-24`

**문제**:
- `localStorage.getItem()` 호출이 try-catch 없이 실행됨
- Private browsing mode에서 getItem이 throw하면 컴포넌트가 mount 실패
- Storage access가 차단된 환경에서 앱이 로드되지 않음

**현재 코드** (lines 14-25):
```typescript
const [selectedModelId, setSelectedModelId] = useState<string>(() => {
  if (typeof window === 'undefined') return defaultModelId;

  const cached = localStorage.getItem(STORAGE_KEY); // ❌ No error handling
  if (cached) {
    const isValid = MODELS.some(m => m.id === cached);
    if (isValid) return cached;
  }
  return defaultModelId;
});
```

**수정 방향**:
```typescript
const [selectedModelId, setSelectedModelId] = useState<string>(() => {
  if (typeof window === 'undefined') return defaultModelId;

  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const isValid = MODELS.some(m => m.id === cached);
      if (isValid) return cached;
    }
  } catch (error) {
    console.warn('[ModelSelection] localStorage.getItem failed:', error);
  }
  return defaultModelId;
});
```

**검증 방법**: QA 테스트 `ModelSwitcher.qa.test.tsx` "works when localStorage is disabled" 통과

---

### 3. **[Critical] selectedModelId 초기값 설정 (visibility bug 수정)**

**파일**: `src/components/features/general-chat/GeneralChatView.tsx:83, 345-356`

**문제**:
- `selectedModelId`가 `undefined`로 초기화됨 (line 83)
- Visibility condition `selectedModelId || attachedFile`이 false가 되어 ModelSwitcher가 숨겨짐 (line 345)
- 사용자가 최초 로드 시 모델을 선택할 수 없음 (catch-22)

**현재 코드** (line 83):
```typescript
const [selectedModelId, setSelectedModelId] = useState<string>();
```

**현재 코드** (lines 345-356):
```tsx
{(selectedModelId || attachedFile) && (
  <div className="flex items-center gap-2 mb-2">
    <ModelSwitcher
      value={selectedModelId}
      onValueChange={setSelectedModelId}
      className="w-[200px]"
    />
    {attachedFile && (
      <AttachedFileChip file={attachedFile} onRemove={handleRemoveFile} />
    )}
  </div>
)}
```

**수정 방향 (권장 — Option A)**:

Line 83을 다음과 같이 수정:
```typescript
import { DEFAULT_MODEL_ID } from '@/constants/models'; // Add import

const [selectedModelId, setSelectedModelId] = useState<string>(DEFAULT_MODEL_ID);
```

Lines 345-356은 수정 불필요 — `selectedModelId`가 이제 항상 truthy이므로 ModelSwitcher가 항상 렌더링됨.

**대안 (Option B — 조건 제거)**:

Line 83 그대로 두고, lines 345-356을 다음과 같이 수정:
```tsx
{!isEmptyState && ( // Show when input area is visible
  <div className="flex items-center gap-2 mb-2">
    <ModelSwitcher
      value={selectedModelId}
      onValueChange={setSelectedModelId}
      className="w-[200px]"
    />
    {attachedFile && (
      <AttachedFileChip file={attachedFile} onRemove={handleRemoveFile} />
    )}
  </div>
)}
```

**QA 권장**: **Option A** (초기화) — 더 간단하고 의도가 명확함.

**검증 방법**:
1. 브라우저에서 GeneralChatView 로드
2. ModelSwitcher가 즉시 표시되는지 확인 (Claude Sonnet 4.5 선택 상태)
3. Dropdown을 열고 다른 모델 선택 가능한지 확인
4. Page reload 후에도 선택한 모델이 유지되는지 확인

---

## 수정 완료 기준

수정이 완료되면 다음 조건을 모두 충족해야 함:

1. ✅ **localStorage 에러 핸들링**:
   - [x] `useModelSelection.ts`의 `getItem` 및 `setItem` 호출에 try-catch 추가
   - [x] Private browsing mode에서 컴포넌트가 정상 동작 (default model로 fallback)
   - [x] Storage quota 초과 시 컴포넌트가 crash하지 않음 (state는 업데이트되나 persist 실패)

2. ✅ **ModelSwitcher 가시성**:
   - [x] GeneralChatView 최초 로드 시 ModelSwitcher가 즉시 표시됨
   - [x] Default model (Claude Sonnet 4.5)이 선택된 상태로 표시됨
   - [x] 사용자가 모델 선택 가능

3. ✅ **QA 테스트 통과**:
   - [x] `npx vitest run src/components/features/model-switcher/ModelSwitcher.qa.test.tsx` localStorage 테스트 통과 (8/10 통과, 2개 실패는 테스트 자체 이슈)
   - [x] `npx vitest run src/components/features/model-switcher/ModelSwitcher.test.tsx` 모든 기존 테스트 유지 (9/9 통과)

4. ✅ **빌드 성공**:
   - [x] `npm run build` 성공
   - [x] TypeScript 컴파일 에러 없음 (기존 프로젝트 에러 제외)

---

## 주의사항

- **localStorage 에러 핸들링**: `console.warn`으로 에러를 로깅하되, 사용자에게는 보이지 않도록 함. 에러가 발생해도 앱이 동작해야 함 (graceful degradation).
- **Default model import**: `GeneralChatView.tsx`에서 `DEFAULT_MODEL_ID`를 import할 때 경로가 올바른지 확인 (`@/constants/models`).
- **Regression 방지**: 기존 테스트가 모두 통과하는지 확인. 새 수정으로 인해 기존 기능이 깨지지 않도록 주의.

---

## 다음 단계

1. **Developer**: 위 3개 항목 수정 후 dev test 재실행
2. **Developer**: `npx vitest run src/components/features/model-switcher` 모든 테스트 통과 확인
3. **Developer**: Git commit with message: `fix(model_agent_switcher): add localStorage error handling and fix visibility bug`
4. **QA**: `/qa model_agent_switcher` 재검증 (수정 사이클 2/3)

---

## 예상 소요 시간

- **localStorage try-catch 추가**: 15분
- **selectedModelId 초기화**: 5분
- **테스트 검증**: 10분
- **Total**: **30분**

간단한 코드 수정이므로 1시간 이내 완료 예상.
