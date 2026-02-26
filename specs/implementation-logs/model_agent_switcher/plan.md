# Plan: Model / Agent Switcher

## 개요

Phase 1 MVP 구현: Radix UI Select 기반 모델 선택 드롭다운 with inline metadata

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `src/types/model.ts` | Model 타입 정의 | 신규 |
| `src/constants/models.ts` | 모델 목록 상수 | 신규 |
| `src/components/features/model-switcher/ModelSwitcher.tsx` | 메인 컴포넌트 (Select 기반 드롭다운) | 신규 |
| `src/components/features/model-switcher/ModelSelectItem.tsx` | 개별 모델 아이템 (name + badges) | 신규 |
| `src/components/features/model-switcher/useModelSelection.ts` | 모델 선택 상태 관리 Hook | 신규 |
| `src/components/features/model-switcher/index.ts` | Export barrel | 신규 |
| `src/components/features/general-chat/GeneralChatView.tsx` | ModelSwitcher 통합 | 수정 |
| `src/components/features/model-switcher/ModelSwitcher.test.tsx` | 단위 테스트 | 신규 |

## Props Interface

### ModelSwitcher

```typescript
export interface ModelSwitcherProps {
  value?: string;                // Controlled: selected model ID
  defaultValue?: string;         // Uncontrolled: default model ID
  onValueChange?: (modelId: string) => void;  // Selection callback
  className?: string;            // Optional styling
  disabled?: boolean;            // Disable selection
}
```

### ModelSelectItem (Internal)

```typescript
interface ModelSelectItemProps {
  model: Model;
}
```

## 타입 정의

### src/types/model.ts

```typescript
export type ModelFamily = 'claude' | 'gpt' | 'gemini' | 'custom';
export type ModelSpeed = 'fast' | 'balanced' | 'thorough';

export interface Model {
  id: string;              // 'claude-opus-4-6'
  name: string;            // 'Claude Opus 4.6'
  family: ModelFamily;
  contextWindow: number;   // 200 (200k tokens)
  speed: ModelSpeed;
  costMultiplier: number;  // 1.0 (baseline), 1.5, 2.0, etc.
  supportsReasoning: boolean;
}
```

## 상수 정의

### src/constants/models.ts

MVP용 5-7개 모델 하드코딩:

```typescript
import { Model } from '@/types/model';

export const MODELS: Model[] = [
  {
    id: 'claude-opus-4-6',
    name: 'Claude Opus 4.6',
    family: 'claude',
    contextWindow: 200,
    speed: 'thorough',
    costMultiplier: 2.0,
    supportsReasoning: true,
  },
  {
    id: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4.5',
    family: 'claude',
    contextWindow: 200,
    speed: 'balanced',
    costMultiplier: 1.0,
    supportsReasoning: false,
  },
  {
    id: 'gpt-5-2',
    name: 'GPT-5.2',
    family: 'gpt',
    contextWindow: 128,
    speed: 'balanced',
    costMultiplier: 1.5,
    supportsReasoning: true,
  },
  {
    id: 'gpt-5-3-flash',
    name: 'GPT-5.3 Flash',
    family: 'gpt',
    contextWindow: 128,
    speed: 'fast',
    costMultiplier: 0.5,
    supportsReasoning: false,
  },
  {
    id: 'gemini-3-flash',
    name: 'Gemini 3 Flash',
    family: 'gemini',
    contextWindow: 100,
    speed: 'fast',
    costMultiplier: 0.3,
    supportsReasoning: false,
  },
];

export const DEFAULT_MODEL_ID = 'claude-sonnet-4-5';
```

## 상태 설계

### useModelSelection Hook

```typescript
// Phase 1: localStorage 기반 단순 state
// Phase 2+: React Context로 확장 가능

export function useModelSelection(defaultModelId: string = DEFAULT_MODEL_ID) {
  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    if (typeof window === 'undefined') return defaultModelId;
    const cached = localStorage.getItem('konai-selected-model');
    return cached || defaultModelId;
  });

  const selectedModel = useMemo(
    () => MODELS.find(m => m.id === selectedModelId) || MODELS[0],
    [selectedModelId]
  );

  const handleModelChange = useCallback((modelId: string) => {
    setSelectedModelId(modelId);
    localStorage.setItem('konai-selected-model', modelId);
  }, []);

  return {
    selectedModelId,
    selectedModel,
    models: MODELS,
    handleModelChange,
  };
}
```

## 컴포넌트 설계

### ModelSwitcher.tsx

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import { useModelSelection } from './useModelSelection';
import { ModelSelectItem } from './ModelSelectItem';

export function ModelSwitcher({
  value,
  defaultValue,
  onValueChange,
  className,
  disabled
}: ModelSwitcherProps) {
  const { models, selectedModelId, handleModelChange } = useModelSelection(defaultValue);

  const controlledValue = value ?? selectedModelId;
  const handleChange = onValueChange ?? handleModelChange;

  return (
    <Select value={controlledValue} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger className={cn("w-[240px]", className)}>
        <SelectValue placeholder="Select model" />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <ModelSelectItem key={model.id} model={model} />
        ))}
      </SelectContent>
    </Select>
  );
}
```

### ModelSelectItem.tsx

```tsx
import { SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Model } from '@/types/model';

export function ModelSelectItem({ model }: ModelSelectItemProps) {
  return (
    <SelectItem value={model.id}>
      <div className="flex items-center justify-between w-full gap-3">
        <span className="font-medium">{model.name}</span>
        <div className="flex gap-1.5">
          <Badge variant="outline" className="text-xs">
            {model.contextWindow}k
          </Badge>
          <Badge
            variant={model.speed === 'fast' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {model.speed}
          </Badge>
        </div>
      </div>
    </SelectItem>
  );
}
```

## 통합 지점

### GeneralChatView.tsx 수정

채팅 입력 영역 상단에 ModelSwitcher 추가:

**위치**: ChatPanel의 textarea 위쪽, AttachedFileChip과 같은 라인

```tsx
// Import 추가
import { ModelSwitcher } from '../model-switcher';

// State 추가
const [selectedModelId, setSelectedModelId] = useState<string>();

// JSX 수정 (ChatPanel textarea 위)
<div className="flex items-center gap-2 mb-2">
  <ModelSwitcher
    value={selectedModelId}
    onValueChange={setSelectedModelId}
    className="w-[200px]"
  />
  {attachedFile && (
    <AttachedFileChip ... />
  )}
</div>
```

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 | 우선순위 |
|---|----------|-----------|---------|
| 1 | Model dropdown visible in chat input area | GeneralChatView.tsx + ModelSwitcher.tsx | must |
| 2 | Displays 5-7 models with name, context window badge, speed badge | ModelSelectItem.tsx | must |
| 3 | Selecting a model updates chat state | useModelSelection.ts → localStorage | must |
| 4 | Keyboard navigation (↑/↓, Enter, Esc) | Radix Select (built-in) | must |
| 5 | Dropdown is responsive (mobile/desktop) | SelectTrigger className w-[240px] → responsive variant | must |
| 6 | Model selection persists across page reloads | useModelSelection.ts → localStorage | must |
| 7 | Aria-labels for screen readers | Radix Select (built-in) | must |

## 테스트 시나리오

| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | AC1 - Dropdown visible | Render ModelSwitcher → button visible | `getByRole('combobox')` | must |
| 2 | AC2 - Model list display | Open dropdown → 5-7 models visible with badges | `getAllByRole('option')`, check badge text | must |
| 3 | AC3 - Selection updates state | Select model → localStorage updated | `userEvent.selectOptions()`, check localStorage | must |
| 4 | AC4 - Keyboard nav | Press ArrowDown → focus moves | `userEvent.keyboard('{ArrowDown}')` | must |
| 5 | AC5 - Responsive width | Render at mobile/desktop breakpoints | `@testing-library/react` + CSS check | should |
| 6 | AC6 - Persistence | Reload component → previous selection restored | Mock localStorage, re-mount component | must |
| 7 | AC7 - Accessibility | Screen reader labels present | `getByLabelText()`, `toHaveAccessibleName()` | must |
| 8 | Edge: No localStorage | SSR or localStorage blocked → defaults to DEFAULT_MODEL_ID | Mock `window === undefined` | should |
| 9 | Edge: Invalid cached ID | localStorage has deleted model ID → fallback to default | Mock localStorage with invalid ID | should |

## 구현 순서

1. **타입 정의** (`src/types/model.ts`)
2. **상수 정의** (`src/constants/models.ts`)
3. **Hook** (`useModelSelection.ts`)
4. **서브 컴포넌트** (`ModelSelectItem.tsx`)
5. **메인 컴포넌트** (`ModelSwitcher.tsx`)
6. **통합** (GeneralChatView.tsx 수정)
7. **단위 테스트** (`ModelSwitcher.test.tsx`)

## 기술 노트

### Radix Select 사용 이유
- 기존 `src/components/ui/select.tsx` 활용 (zero new dependencies)
- 키보드 네비게이션, 접근성 기본 제공 (WAI-ARIA Menu Button pattern)
- 타입 안전 (TypeScript 기본 지원)

### Phase 1 제한 사항
- Family grouping 없음 (Phase 2)
- Pinning 없음 (Phase 2)
- Auto mode 없음 (Phase 3)
- Static model list (API 연동은 Phase 2+)

### 확장성
- Phase 2: `DropdownMenu` 전환 → family grouping + pinning
- Phase 3: React Context → global model selection across views
- Model data: static JSON (Phase 1) → API fetch (Phase 2) → WebSocket (Phase 3)
