# Tool 호출 UI 리팩토링 계획 v2

## 목표

PPT 생성 시나리오의 Tool 호출 UI를 **Claude Chat 스타일의 2단계 아코디언 구조**로 변경합니다.

- **외부 아코디언**: 전체 Tool 호출 그룹을 감싸는 컨테이너
- **내부 아코디언**: 개별 Tool 호출 위젯들

---

## 동작 방식

### 시나리오 진행 중
```
[● 작업 진행 중... (3/10)] ▼ (펼침)
├── [✓ 계획 수립 완료됨] ▶ (접힘)
├── [✓ 데이터 소스 선택 완료됨] ▶ (접힘)
└── [● ERP 연결 중...] ▼ (펼침 - 현재 실행 중)
      - 상세 내용...
```

### 시나리오 완료 후
```
[✓ 10개의 도구 사용됨] ▶ (접힘)
```

### 완료 후 외부 아코디언 클릭 시
```
[✓ 10개의 도구 사용됨] ▼ (펼침)
├── [✓ 계획 수립 완료됨] ▶ (접힘)
├── [✓ 데이터 소스 선택 완료됨] ▶ (접힘)
├── [✓ ERP 연결 완료됨] ▶ (접힘)
├── [✓ 데이터 조회 완료됨] ▶ (접힘)
└── [✓ 슬라이드 생성 완료됨] ▶ (접힘)
```

### 완료 후 개별 Tool 클릭 시
```
[✓ 10개의 도구 사용됨] ▼ (펼침)
├── [✓ 계획 수립 완료됨] ▼ (펼침)
│     - 상세 내용...
├── [✓ 데이터 소스 선택 완료됨] ▶ (접힘)
└── ...
```

---

## 새로운 컴포넌트 구조

```
src/components/features/agent-chat/components/ToolCall/
├── ToolCallGroup.tsx          # 🆕 외부 아코디언 (전체 Tool 그룹)
├── ToolCallGroupHeader.tsx    # 🆕 외부 아코디언 헤더
├── ToolCallWidget.tsx         # 내부 아코디언 (개별 Tool) - 기존 유지
├── ToolCallHeader.tsx         # 내부 아코디언 헤더 - 기존 유지
├── ToolCallContent.tsx        # Tool 상세 내용 - 기존 유지
├── ToolCallStatusIndicator.tsx
├── constants.ts
├── types.ts                   # 🔄 타입 추가
└── index.ts                   # 🔄 export 추가
```

---

## Phase 1: 타입 정의 추가

**파일**: `src/components/features/agent-chat/components/ToolCall/types.ts`

```typescript
// 🆕 ToolCallGroup Props
export interface ToolCallGroupProps {
  /** 그룹 내 Tool 메시지 목록 */
  messages: ScenarioMessage[];
  /** 그룹 펼침 상태 */
  isGroupExpanded: boolean;
  /** 그룹 토글 핸들러 */
  onGroupToggle: () => void;
  /** 현재 활성화된 Tool 메시지 ID */
  activeToolMessageId: string | null;
  /** 개별 Tool 토글 핸들러 */
  onToolToggle: (messageId: string) => void;
  /** 시나리오 완료 여부 */
  isScenarioComplete: boolean;
  /** 시나리오 진행 중 여부 */
  isScenarioRunning: boolean;
  /** 현재 단계 ID */
  currentStepId: string | null;
  /** 완료된 단계 ID Set */
  completedStepIds: Set<string>;
  
  // HITL 관련 Props
  onHitlSelect?: (stepId: string, optionId: string) => void;
  onValidationConfirm?: () => void;
  onPptSetupComplete?: () => void;
  
  // PPT Config Props
  pptConfig?: PPTConfig;
  onPptConfigUpdate?: <K extends keyof PPTConfig>(key: K, value: PPTConfig[K]) => void;
  validationData?: ValidationData;
}

// 🆕 ToolCallGroupHeader Props
export interface ToolCallGroupHeaderProps {
  /** 완료된 Tool 수 */
  completedCount: number;
  /** 전체 Tool 수 */
  totalCount: number;
  /** 시나리오 완료 여부 */
  isComplete: boolean;
  /** 시나리오 진행 중 여부 */
  isRunning: boolean;
  /** 펼침 상태 */
  isExpanded: boolean;
  /** 토글 핸들러 */
  onToggle: () => void;
}
```

---

## Phase 2: ToolCallGroupHeader 컴포넌트 생성

**파일**: `src/components/features/agent-chat/components/ToolCall/ToolCallGroupHeader.tsx`

```typescript
import React from 'react';
import { ChevronDown, Loader2, Check, Wrench } from 'lucide-react';
import type { ToolCallGroupHeaderProps } from './types';

/**
 * Tool 그룹 외부 아코디언 헤더
 * - 진행 중: "작업 진행 중... (3/10)"
 * - 완료: "10개의 도구 사용됨"
 */
const ToolCallGroupHeader: React.FC<ToolCallGroupHeaderProps> = ({
  completedCount,
  totalCount,
  isComplete,
  isRunning,
  isExpanded,
  onToggle,
}) => {
  // 상태에 따른 라벨
  const getLabel = () => {
    if (isComplete) {
      return `${totalCount}개의 도구 사용됨`;
    }
    if (isRunning) {
      return `작업 진행 중... (${completedCount}/${totalCount})`;
    }
    return '도구 호출 대기 중';
  };

  // 상태에 따른 아이콘
  const StatusIcon = () => {
    if (isComplete) {
      return (
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <Check size={12} className="text-white" strokeWidth={3} />
        </div>
      );
    }
    if (isRunning) {
      return (
        <div className="w-5 h-5 flex items-center justify-center text-blue-500">
          <Loader2 size={16} className="animate-spin" />
        </div>
      );
    }
    return (
      <div className="w-5 h-5 flex items-center justify-center text-gray-400">
        <Wrench size={16} />
      </div>
    );
  };

  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl
        transition-all duration-200 text-left group
        ${isComplete
          ? 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
          : isRunning
            ? 'bg-blue-50 border border-blue-200'
            : 'bg-gray-50 border border-gray-200'
        }
      `}
      aria-expanded={isExpanded}
    >
      {/* 상태 아이콘 */}
      <StatusIcon />

      {/* 라벨 */}
      <span className={`
        flex-1 text-sm font-medium
        ${isComplete ? 'text-gray-700' : isRunning ? 'text-blue-700' : 'text-gray-600'}
      `}>
        {getLabel()}
      </span>

      {/* 펼침/접힘 아이콘 */}
      <ChevronDown
        size={16}
        className={`
          text-gray-400 transition-transform duration-200
          group-hover:text-gray-600
          ${isExpanded ? 'rotate-180' : ''}
        `}
      />
    </button>
  );
};

export default React.memo(ToolCallGroupHeader);
```

---

## Phase 3: ToolCallGroup 컴포넌트 생성

**파일**: `src/components/features/agent-chat/components/ToolCall/ToolCallGroup.tsx`

```typescript
import React, { useMemo } from 'react';
import ToolCallGroupHeader from './ToolCallGroupHeader';
import ToolCallWidget from './ToolCallWidget';
import type { ToolCallGroupProps } from './types';

/**
 * Tool 그룹 외부 아코디언 컴포넌트
 * - 전체 Tool 호출을 하나의 그룹으로 감싸는 컨테이너
 * - 시나리오 완료 시 자동으로 접힘
 * - Claude Chat 스타일의 2단계 아코디언 구조
 */
const ToolCallGroup: React.FC<ToolCallGroupProps> = ({
  messages,
  isGroupExpanded,
  onGroupToggle,
  activeToolMessageId,
  onToolToggle,
  isScenarioComplete,
  isScenarioRunning,
  currentStepId,
  completedStepIds,
  onHitlSelect,
  onValidationConfirm,
  onPptSetupComplete,
  pptConfig,
  onPptConfigUpdate,
  validationData,
}) => {
  // Tool 메시지만 필터링
  const toolMessages = useMemo(() => 
    messages.filter(msg => msg.type === 'tool-call'),
    [messages]
  );

  // 완료된 Tool 수 계산
  const completedCount = useMemo(() => 
    toolMessages.filter(msg => msg.toolStatus === 'completed').length,
    [toolMessages]
  );

  const totalCount = toolMessages.length;

  // Tool 메시지가 없으면 렌더링하지 않음
  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="mb-4 animate-fade-in-up">
      {/* 외부 아코디언 헤더 */}
      <ToolCallGroupHeader
        completedCount={completedCount}
        totalCount={totalCount}
        isComplete={isScenarioComplete}
        isRunning={isScenarioRunning}
        isExpanded={isGroupExpanded}
        onToggle={onGroupToggle}
      />

      {/* 외부 아코디언 콘텐츠 (내부 Tool 목록) */}
      {isGroupExpanded && (
        <div className={`
          mt-2 ml-4 pl-4 border-l-2 border-gray-200
          space-y-2
          animate-accordion-down
        `}>
          {toolMessages.map((message) => {
            const isExpanded = activeToolMessageId === message.id;
            
            // HITL 도구는 입력 대기 중일 때 강제 펼침
            const isHitlAwaitingInput = 
              message.toolStatus === 'running' || 
              message.toolStatus === 'awaiting-input';
            const shouldExpand = message.isHumanInTheLoop 
              ? (isHitlAwaitingInput || isExpanded)
              : isExpanded;

            return (
              <ToolCallWidget
                key={message.id}
                toolType={message.toolType!}
                status={message.toolStatus || 'pending'}
                isExpanded={shouldExpand}
                onToggle={() => onToolToggle(message.id)}
                isHitl={message.isHumanInTheLoop}
                hitlOptions={message.hitlOptions}
                selectedOption={message.hitlSelectedOption}
                onHitlSelect={onHitlSelect 
                  ? (optionId) => onHitlSelect(message.id, optionId) 
                  : undefined
                }
                input={message.toolInput}
                pptConfig={pptConfig}
                onPptConfigUpdate={onPptConfigUpdate}
                onPptSetupComplete={onPptSetupComplete}
                validationData={validationData}
                onValidationConfirm={onValidationConfirm}
                currentStepId={currentStepId}
                completedStepIds={completedStepIds}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(ToolCallGroup);
```

---

## Phase 4: usePPTScenario 훅 수정

**파일**: `src/hooks/usePPTScenario.ts`

### 4.1 새로운 상태 추가

```typescript
// 기존 상태
const [activeToolMessageId, setActiveToolMessageId] = useState<string | null>(null);

// 🆕 외부 아코디언(그룹) 펼침 상태 추가
const [isGroupExpanded, setIsGroupExpanded] = useState<boolean>(true);
```

### 4.2 시나리오 완료 시 그룹 접기

```typescript
const executeStep = useCallback((stepIndex: number) => {
  if (stepIndex >= PPT_SCENARIO_STEPS.length) {
    setIsComplete(true);
    setIsRunning(false);
    setActiveToolMessageId(null);
    setIsGroupExpanded(false); // 🔥 시나리오 완료 시 외부 아코디언 접기
    onScenarioComplete?.();
    return;
  }
  // ...
}, [/* deps */]);
```

### 4.3 시나리오 시작 시 그룹 펼치기

```typescript
const startScenario = useCallback(() => {
  if (isRunning || isComplete) return;

  setIsRunning(true);
  setIsPaused(false);
  setIsComplete(false);
  setMessages([]);
  setCompletedStepIds(new Set());
  setActiveToolMessageId(null);
  setIsGroupExpanded(true); // 🔥 시나리오 시작 시 외부 아코디언 펼치기
  stepIndexRef.current = 0;

  executeStep(0);
}, [isRunning, isComplete, executeStep]);
```

### 4.4 그룹 토글 함수 추가

```typescript
// 🆕 외부 아코디언 토글
const toggleGroup = useCallback(() => {
  setIsGroupExpanded(prev => !prev);
}, []);
```

### 4.5 반환값 업데이트

```typescript
return {
  // 기존 반환값
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
  activeToolMessageId,
  isMessageExpanded,
  
  // 🆕 추가 반환값
  isGroupExpanded,
  toggleGroup,
};
```

---

## Phase 5: PPTScenarioRenderer 수정

**파일**: `src/components/features/agent-chat/components/PPTScenarioRenderer.tsx`

### 5.1 훅에서 새 값 받기

```typescript
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
  activeToolMessageId,
  // 🆕 추가
  isGroupExpanded,
  toggleGroup,
} = usePPTScenario({ ... });
```

### 5.2 렌더링 로직 변경

기존의 개별 Tool 메시지 렌더링 방식에서 `ToolCallGroup` 사용으로 변경:

```typescript
// Before: 개별 메시지 순회하며 렌더링
{messages.map((message, index) => renderMessage(message, index))}

// After: Agent 텍스트와 Tool 그룹 분리
const renderMessages = useCallback(() => {
  const agentMessages = messages.filter(msg => msg.type === 'agent-text');
  const toolMessages = messages.filter(msg => msg.type === 'tool-call');

  return (
    <>
      {/* 초기 에이전트 메시지 */}
      {agentMessages.length > 0 && (
        <div className="mb-4">
          {renderAgentMessage(agentMessages[0])}
        </div>
      )}

      {/* Tool 그룹 (모든 Tool을 하나의 아코디언으로) */}
      {toolMessages.length > 0 && (
        <ToolCallGroup
          messages={messages}
          isGroupExpanded={isGroupExpanded}
          onGroupToggle={toggleGroup}
          activeToolMessageId={activeToolMessageId}
          onToolToggle={toggleMessageExpand}
          isScenarioComplete={isComplete}
          isScenarioRunning={isRunning}
          currentStepId={currentStepId}
          completedStepIds={completedStepIds}
          onHitlSelect={handleHitlSelect}
          onValidationConfirm={confirmValidation}
          onPptSetupComplete={completePptSetup}
          pptConfig={pptConfig}
          onPptConfigUpdate={onPptConfigUpdate}
          validationData={validationData}
        />
      )}

      {/* 최종 에이전트 응답 */}
      {isComplete && (
        <PPTDoneResponse
          slideCount={pptConfig.slideCount}
          onRequestSalesAnalysis={onRequestSalesAnalysis}
          isRightPanelCollapsed={isRightPanelCollapsed}
          currentDashboardType="ppt"
          onOpenRightPanel={onOpenRightPanel}
        />
      )}
    </>
  );
}, [
  messages, isGroupExpanded, toggleGroup, activeToolMessageId,
  toggleMessageExpand, isComplete, isRunning, currentStepId,
  completedStepIds, /* ... 기타 deps */
]);
```

---

## Phase 6: index.ts 업데이트

**파일**: `src/components/features/agent-chat/components/ToolCall/index.ts`

```typescript
// 🆕 추가 export
export { default as ToolCallGroup } from './ToolCallGroup';
export { default as ToolCallGroupHeader } from './ToolCallGroupHeader';

// Types
export type {
  // 🆕 추가
  ToolCallGroupProps,
  ToolCallGroupHeaderProps,
  // 기존
  ToolCallWidgetProps,
  ToolCallHeaderProps,
  // ...
} from './types';
```

---

## Phase 7: 애니메이션 추가 (tailwind.config.js)

기존 Phase 5의 애니메이션 설정 유지 (이미 추가되어 있다면 스킵)

---

## 구현 순서

### Step 1: types.ts 수정
1. `ToolCallGroupProps` 타입 추가
2. `ToolCallGroupHeaderProps` 타입 추가

### Step 2: ToolCallGroupHeader.tsx 생성
1. 외부 아코디언 헤더 컴포넌트 구현
2. 진행 상태/완료 상태별 UI 구현

### Step 3: ToolCallGroup.tsx 생성
1. 외부 아코디언 컨테이너 컴포넌트 구현
2. 내부 ToolCallWidget 목록 렌더링

### Step 4: usePPTScenario.ts 수정
1. `isGroupExpanded` 상태 추가
2. `toggleGroup` 함수 추가
3. 시나리오 시작/완료 시 그룹 펼침/접힘 로직
4. 반환값 업데이트

### Step 5: PPTScenarioRenderer.tsx 수정
1. 훅에서 새 값 받기
2. `ToolCallGroup` 컴포넌트 사용으로 렌더링 로직 변경

### Step 6: index.ts 수정
1. 새 컴포넌트 export 추가

---

## 테스트 체크리스트

### 외부 아코디언 (그룹)
- [ ] 시나리오 시작 시 외부 아코디언이 펼쳐지는지 확인
- [ ] 시나리오 진행 중 외부 아코디언 헤더에 진행률 표시되는지 확인 (예: "3/10")
- [ ] 시나리오 완료 시 외부 아코디언이 자동으로 접히는지 확인
- [ ] 완료 후 외부 아코디언 헤더에 "N개의 도구 사용됨" 표시되는지 확인
- [ ] 완료 후 외부 아코디언 클릭 시 내부 Tool 목록이 보이는지 확인

### 내부 아코디언 (개별 Tool)
- [ ] 새 Tool 실행 시 해당 Tool이 자동으로 펼쳐지는지 확인
- [ ] Tool 완료 시 해당 Tool이 자동으로 접히는지 확인
- [ ] HITL Tool은 입력 완료까지 강제로 펼쳐져 있는지 확인
- [ ] 완료된 Tool을 수동으로 클릭하면 상세 내용이 보이는지 확인
- [ ] 한 번에 하나의 Tool만 펼쳐지는지 확인

### 전체 흐름
- [ ] 시나리오 전체 흐름이 정상 동작하는지 확인
- [ ] 애니메이션이 부드럽게 동작하는지 확인
- [ ] 에이전트 텍스트 메시지가 정상 표시되는지 확인
- [ ] 최종 PPTDoneResponse가 정상 표시되는지 확인

---

## 예상 최종 결과

### 시나리오 진행 중
```
🤖 Q4 2025 경영 실적 보고서 PPT 생성을 요청하셨군요...

[● 작업 진행 중... (5/10)] ▼
│
├── [✓ 계획 수립 완료됨] ▶
├── [✓ 데이터 소스 선택 완료됨] ▶
├── [✓ ERP 연결 완료됨] ▶
├── [✓ 병렬 데이터 조회 완료됨] ▶
└── [● 데이터 검증 중...] ▼
      📊 매출액: 1,258억원 (YoY +12.3%)
      📊 영업이익: 189억원 (YoY +20.3%)
      [확인] [수정]
```

### 시나리오 완료 후
```
🤖 Q4 2025 경영 실적 보고서 PPT 생성을 요청하셨군요...

[✓ 10개의 도구 사용됨] ▶

🎉 PPT 생성이 완료되었습니다!
   - 총 8장의 슬라이드가 생성되었습니다.
   [다운로드] [매출 분석 요청]
```

### 완료 후 그룹 펼침 시
```
🤖 Q4 2025 경영 실적 보고서 PPT 생성을 요청하셨군요...

[✓ 10개의 도구 사용됨] ▼
│
├── [✓ 계획 수립 완료됨] ▶
├── [✓ 데이터 소스 선택 완료됨] ▶
├── [✓ ERP 연결 완료됨] ▶
├── [✓ 병렬 데이터 조회 완료됨] ▶
├── [✓ 손익계산서 조회 완료됨] ▶
├── [✓ 사업부별 손익 조회 완료됨] ▶
├── [✓ 생산/물류 KPI 조회 완료됨] ▶
├── [✓ 고객/매출 분석 조회 완료됨] ▶
├── [✓ 데이터 검증 완료됨] ▶
└── [✓ 슬라이드 생성 완료됨] ▶

🎉 PPT 생성이 완료되었습니다!
```

---

## 참고: Claude Chat Tool UI 특징

1. **2단계 아코디언 구조**
   - 외부: 전체 Tool 그룹 (진행률/완료 표시)
   - 내부: 개별 Tool (상세 내용)

2. **자동 펼침/접힘**
   - 진행 중: 외부 펼침 + 현재 Tool 펼침
   - 완료 시: 외부 접힘

3. **깔끔한 요약**
   - 완료 후 "N개의 도구 사용됨"으로 간결하게 표시
   - 필요시 펼쳐서 상세 확인 가능

4. **시각적 계층 구조**
   - 들여쓰기 + 세로선으로 Tool 그룹 표현
   - 상태별 색상/아이콘 차별화
