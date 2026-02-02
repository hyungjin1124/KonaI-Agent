# Tool 호출 UI 리팩토링 계획

## 목표

PPT 생성 시나리오의 Tool 호출 UI를 **Claude Chat 스타일**로 변경합니다.
핵심은 **아코디언 방식**으로 현재 실행 중인 툴만 펼쳐지고, 완료되면 자동으로 접히는 UX입니다.

---

## 현재 구조 분석

### 관련 파일 목록

```
src/components/features/agent-chat/
├── components/
│   ├── PPTScenarioRenderer.tsx      # 시나리오 메인 렌더러
│   └── ToolCall/
│       ├── ToolCallWidget.tsx       # 도구 호출 위젯 (메인)
│       ├── ToolCallHeader.tsx       # 헤더 컴포넌트
│       ├── ToolCallContent.tsx      # 상세 내용 컴포넌트
│       ├── ToolCallStatusIndicator.tsx # 상태 표시기
│       ├── constants.ts             # 메타데이터 상수
│       ├── types.ts                 # 타입 정의
│       └── index.ts                 # export
├── scenarios/
│   └── pptScenario.ts               # 시나리오 단계 정의
└── types.ts                         # 공통 타입

src/hooks/
└── usePPTScenario.ts                # 시나리오 로직 훅
```

### 현재 동작 방식

1. 새 도구 메시지 생성 시 `expandedMessageIds`에 추가 → **기본 펼침**
2. 사용자가 수동으로 `toggleMessageExpand` 호출해야 접힘
3. 여러 도구가 동시에 펼쳐질 수 있음

### 문제점

- 완료된 도구도 펼쳐진 상태로 유지됨
- 여러 도구가 동시에 펼쳐져 있어 시각적 혼란
- Claude Chat의 깔끔한 아코디언 UX와 다름

---

## 변경 계획

### Phase 1: 아코디언 로직 구현 (usePPTScenario.ts)

#### 1.1 상태 관리 변경

**파일**: `src/hooks/usePPTScenario.ts`

**변경 사항**:
- `expandedMessageIds: Set<string>` → `activeToolMessageId: string | null` 로 변경
- 한 번에 하나의 도구만 펼쳐지도록 단일 상태로 관리

```typescript
// Before
const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(new Set());

// After
const [activeToolMessageId, setActiveToolMessageId] = useState<string | null>(null);
```

#### 1.2 도구 완료 시 자동 접힘 로직

**파일**: `src/hooks/usePPTScenario.ts`

**변경 사항**:
- 도구 상태가 `completed`로 변경될 때 `activeToolMessageId`를 `null`로 설정
- 다음 도구 실행 시 해당 도구의 messageId를 `activeToolMessageId`로 설정

```typescript
// executeStep 함수 내부 - 새 도구 실행 시
setMessages(prev => [...prev, newMessage]);
setActiveToolMessageId(newMessage.id); // 새 도구를 활성화

// 도구 완료 시
timerRef.current = setTimeout(() => {
  setMessages(prev =>
    prev.map(msg =>
      msg.id === newMessage.id
        ? { ...msg, toolStatus: 'completed' }
        : msg
    )
  );
  setActiveToolMessageId(null); // 완료 시 접기
  // ... 다음 단계 실행
}, step.delayMs);
```

#### 1.3 토글 함수 수정

```typescript
// Before
const toggleMessageExpand = useCallback((messageId: string) => {
  setExpandedMessageIds(prev => {
    const next = new Set(prev);
    if (next.has(messageId)) {
      next.delete(messageId);
    } else {
      next.add(messageId);
    }
    return next;
  });
}, []);

// After
const toggleMessageExpand = useCallback((messageId: string) => {
  setActiveToolMessageId(prev => prev === messageId ? null : messageId);
}, []);
```

#### 1.4 펼침 상태 계산 헬퍼

```typescript
// 추가
const isMessageExpanded = useCallback((messageId: string) => {
  return activeToolMessageId === messageId;
}, [activeToolMessageId]);
```

#### 1.5 시나리오 완료 시 모든 도구 접힘

**중요**: 모든 도구가 완료되고 시나리오가 종료되면, 모든 도구가 접힌 상태로 표시되어야 합니다.

```typescript
// executeStep 함수 내부 - 시나리오 완료 시
const executeStep = useCallback((stepIndex: number) => {
  if (stepIndex >= PPT_SCENARIO_STEPS.length) {
    setIsComplete(true);
    setIsRunning(false);
    setActiveToolMessageId(null); // 🔥 시나리오 완료 시 모든 도구 접기
    onScenarioComplete?.();
    return;
  }
  // ...
}, [/* deps */]);
```

#### 1.6 시나리오 완료 상태에서 펼침 동작

시나리오가 완료된 후에도 사용자가 개별 도구를 클릭하면 상세 내용을 볼 수 있어야 합니다.

```typescript
// 시나리오 완료 후에도 토글은 정상 동작
const toggleMessageExpand = useCallback((messageId: string) => {
  // isComplete 상태와 관계없이 토글 가능
  setActiveToolMessageId(prev => prev === messageId ? null : messageId);
}, []);
```

---

### Phase 2: PPTScenarioRenderer 수정

**파일**: `src/components/features/agent-chat/components/PPTScenarioRenderer.tsx`

#### 2.1 Props 변경

```typescript
// usePPTScenario 훅에서 받는 값 변경
const {
  messages,
  currentStepId,
  isRunning,
  isPaused,
  isComplete,
  validationData,
  completedStepIds,
  startScenario,
  resumeWithHitlSelection,
  confirmValidation,
  completePptSetup,
  completeSlideGeneration,
  toggleMessageExpand,
  activeToolMessageId,        // 변경: expandedMessageIds → activeToolMessageId
  isMessageExpanded,          // 추가: 펼침 상태 확인 함수
} = usePPTScenario({ ... });
```

#### 2.2 renderMessage 함수 수정

```typescript
const renderMessage = useCallback((message: ScenarioMessage, index: number) => {
  // 변경: Set 확인 → 단일 ID 비교
  const isExpanded = isMessageExpanded(message.id);
  
  // 또는 HITL 대기 중인 경우 강제 펼침
  const isHitlAwaitingInput = message.toolStatus === 'running' || 
                              message.toolStatus === 'awaiting-input';
  const shouldExpand = isHitlAwaitingInput || isExpanded;
  
  // ... 나머지 렌더링 로직
}, [isMessageExpanded, /* ... */]);
```

---

### Phase 3: ToolCallWidget 스타일 개선

**파일**: `src/components/features/agent-chat/components/ToolCall/ToolCallWidget.tsx`

#### 3.1 애니메이션 추가

접히고 펼쳐지는 애니메이션을 부드럽게 처리합니다.

```typescript
// ToolCallWidget 내부
{isExpanded && (
  <div
    className={`
      mt-1.5 p-3 bg-white border rounded-lg
      animate-accordion-down  // 펼침 애니메이션
      ${metadata.borderColor}
    `}
  >
    <ToolCallContent ... />
  </div>
)}
```

#### 3.2 Tailwind 애니메이션 추가

**파일**: `tailwind.config.js`

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'accordion-down': {
          from: { height: 0, opacity: 0 },
          to: { height: 'var(--radix-accordion-content-height)', opacity: 1 }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)', opacity: 1 },
          to: { height: 0, opacity: 0 }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  }
}
```

---

### Phase 4: ToolCallHeader 스타일 개선 (Claude Chat 스타일)

**파일**: `src/components/features/agent-chat/components/ToolCall/ToolCallHeader.tsx`

#### 4.1 Claude Chat 스타일 헤더

```typescript
const ToolCallHeader: React.FC<ToolCallHeaderProps> = ({
  toolType,
  status,
  isExpanded,
  onToggle,
  metadata,
}) => {
  const getLabel = () => {
    switch (status) {
      case 'running':
        return metadata.labelRunning;
      case 'completed':
        return metadata.labelComplete;
      case 'awaiting-input':
        return `${metadata.label}`;
      default:
        return metadata.label;
    }
  };

  const isHitl = status === 'awaiting-input';
  
  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl
        transition-all duration-200 text-left group
        ${status === 'completed' 
          ? 'bg-gray-50 hover:bg-gray-100' 
          : status === 'running'
            ? 'bg-blue-50 border border-blue-100'
            : isHitl
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-gray-50 hover:bg-gray-100'
        }
      `}
      aria-expanded={isExpanded}
    >
      {/* 상태 표시기 */}
      <ToolCallStatusIndicator status={status} color={metadata.color} />

      {/* 도구명 */}
      <span className={`
        flex-1 text-sm font-medium
        ${status === 'completed' ? 'text-gray-600' : 'text-gray-900'}
      `}>
        {getLabel()}
      </span>

      {/* 완료 시간 또는 진행 표시 */}
      {status === 'completed' && (
        <span className="text-xs text-gray-400">완료됨</span>
      )}

      {/* 펼침/접힘 아이콘 */}
      <ChevronDown
        size={16}
        className={`
          text-gray-400 transition-transform duration-200
          ${isExpanded ? 'rotate-180' : ''}
        `}
      />
    </button>
  );
};
```

---

### Phase 5: HITL 도구 예외 처리

#### 5.1 HITL 도구는 입력 완료까지 강제 펼침

**파일**: `src/hooks/usePPTScenario.ts`

```typescript
// HITL 단계 진입 시
if (step.isHitl) {
  setIsPaused(true);
  setActiveToolMessageId(newMessage.id); // HITL은 강제 펼침
  onHitlRequired?.(step.id, step.toolType);
  return;
}

// HITL 완료 시 (resumeWithHitlSelection 등)
const resumeWithHitlSelection = useCallback((stepId: string, selectedOption: string) => {
  // ... 상태 업데이트
  setActiveToolMessageId(null); // 완료 후 접기
  // ... 다음 단계 진행
}, []);
```

---

## 구현 순서

### Step 1: usePPTScenario.ts 수정
1. `expandedMessageIds` → `activeToolMessageId` 상태 변경
2. `isMessageExpanded` 헬퍼 함수 추가
3. `toggleMessageExpand` 함수 수정
4. 도구 실행/완료 시 `activeToolMessageId` 관리 로직 추가
5. HITL 도구 예외 처리
6. **시나리오 완료 시 `activeToolMessageId`를 `null`로 설정하여 모든 도구 접기**

### Step 2: PPTScenarioRenderer.tsx 수정
1. 훅에서 반환받는 값 변경
2. `renderMessage` 함수 내 펼침 상태 로직 수정

### Step 3: ToolCallHeader.tsx 스타일 개선
1. Claude Chat 스타일로 UI 변경
2. 상태별 배경색/테두리 스타일 적용

### Step 4: ToolCallWidget.tsx 애니메이션 추가
1. 펼침/접힘 애니메이션 적용

### Step 5: tailwind.config.js 업데이트
1. 아코디언 애니메이션 키프레임 추가

---

## 예상 결과

### Before (현재)
```
[도구 1: 계획 수립] ▼ (펼침)
  - 상세 내용...

[도구 2: 데이터 소스 선택] ▼ (펼침)
  - 상세 내용...

[도구 3: ERP 연결] ▼ (펼침)
  - 상세 내용...
```

### After (변경 후)
```
[✓ 계획 수립 완료됨] ▶ (접힘)

[✓ 데이터 소스 선택 완료됨] ▶ (접힘)

[● ERP 연결 중...] ▼ (펼침 - 현재 실행 중)
  - 상세 내용...
```

### 시나리오 완료 후
```
[✓ 계획 수립 완료됨] ▶ (접힘)

[✓ 데이터 소스 선택 완료됨] ▶ (접힘)

[✓ ERP 연결 완료됨] ▶ (접힘)

[✓ 데이터 조회 완료됨] ▶ (접힘)

[✓ 슬라이드 생성 완료됨] ▶ (접힘)

🎉 PPT 생성이 완료되었습니다!
```
→ **모든 도구가 접힌 상태**로 깔끔하게 표시되며, 사용자가 필요시 개별 클릭하여 상세 확인 가능

---

## 테스트 체크리스트

- [ ] 새 도구 실행 시 자동으로 펼쳐지는지 확인
- [ ] 도구 완료 시 자동으로 접히는지 확인
- [ ] 완료된 도구를 수동으로 클릭하면 펼쳐지는지 확인
- [ ] HITL 도구는 입력 완료까지 강제로 펼쳐져 있는지 확인
- [ ] 한 번에 하나의 도구만 펼쳐지는지 확인 (수동 토글 시)
- [ ] **시나리오 완료 시 모든 도구가 접힌 상태인지 확인**
- [ ] **시나리오 완료 후 개별 도구 클릭 시 상세 내용 확인 가능한지 확인**
- [ ] 애니메이션이 부드럽게 동작하는지 확인
- [ ] 시나리오 전체 흐름이 정상 동작하는지 확인

---

## 참고: Claude Chat Tool UI 특징

1. **간결한 헤더**: 아이콘 + 도구명 + 상태만 표시
2. **상태별 스타일링**:
   - 실행 중: 파란색 계열 배경 + 스피너
   - 완료: 회색 배경 + 체크 아이콘
   - 대기: 노란색 계열 배경
3. **자동 아코디언**: 현재 실행 중인 도구만 펼침
4. **클릭 토글**: 완료된 도구는 클릭으로 상세 확인 가능
