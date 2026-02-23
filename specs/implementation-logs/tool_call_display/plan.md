# Plan: Tool Call Display

## 현황 분석

`tool_call_display`는 완전히 새로운 컴포넌트가 아니라 **기존 ToolCall 컴포넌트들의 완성**이다.
현재 13개 파일이 존재하지만, 리서치 AC 기준으로 다음이 미구현:

1. `ToolCallStatusIndicator`가 `null` 반환 (빈 컴포넌트)
2. 에러/실패 상태 렌더링 없음
3. 헤더에 상태 아이콘(스피너/체크/에러) 없음
4. 재시도 옵션 없음
5. `ToolStatus`에 `'failed'` 상태 없음

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `src/components/features/agent-chat/types.ts` | `ToolStatus`에 `'failed'` 추가 | 수정 |
| `src/components/features/agent-chat/components/ToolCall/ToolCallStatusIndicator.tsx` | 상태별 아이콘 렌더링 (spinner/check/error) | 수정 |
| `src/components/features/agent-chat/components/ToolCall/ToolCallHeader.tsx` | StatusIndicator 통합, 에러 상태 스타일링 | 수정 |
| `src/components/features/agent-chat/components/ToolCall/ToolCallContent.tsx` | 실패 상태 fallback 렌더링 + 재시도 버튼 | 수정 |
| `src/components/features/agent-chat/components/ToolCall/ToolCallWidget.tsx` | `onRetry` prop 추가, failed 상태 처리 | 수정 |
| `src/components/features/agent-chat/components/ToolCall/types.ts` | `onRetry` prop, 에러 관련 타입 추가 | 수정 |
| `src/components/features/agent-chat/components/ToolCall/ToolCallGroup.tsx` | `onRetry` prop 전달 | 수정 |

## Props Interface 변경

### ToolCallStatusIndicatorProps (수정)
```typescript
export interface ToolCallStatusIndicatorProps {
  status: ToolStatus;
  size?: number;  // 아이콘 크기 (기본 12)
}
```

### ToolCallHeaderProps (수정)
```typescript
export interface ToolCallHeaderProps {
  toolType: ToolType;
  status: ToolStatus;
  isExpanded: boolean;
  onToggle: () => void;
  metadata: ToolMetadata;
  errorMessage?: string;  // 실패 시 간략 메시지
}
```

### ToolCallWidgetProps (수정)
```typescript
// 기존 props에 추가:
onRetry?: () => void;     // 재시도 콜백
errorMessage?: string;    // 에러 메시지
```

### ToolCallContentProps (수정)
```typescript
// 기존 props에 추가:
onRetry?: () => void;     // 재시도 콜백
errorMessage?: string;    // 에러 메시지
```

### ToolCallGroupProps (수정)
```typescript
// 기존 props에 추가:
onRetry?: (messageId: string) => void;  // 그룹 레벨 재시도
```

## 상태 설계

### ToolStatus 확장
```
'pending' → 'running' → 'completed'
                      → 'failed'     (신규)
            'awaiting-input'
```

- `'failed'` 상태 추가: 도구 실행 실패 시 에러 표시 + 재시도 옵션 활성화
- 기존 `'pending'`, `'running'`, `'completed'`, `'awaiting-input'`은 그대로 유지

### ToolCallStatusIndicator 상태별 렌더링
| 상태 | 아이콘 | 스타일 |
|------|--------|--------|
| `pending` | 빈 원 (○) | `text-gray-300` |
| `running` | Loader2 (lucide, spin) | `text-blue-500 animate-spin` |
| `completed` | Check (lucide) | `text-green-500` |
| `failed` | AlertCircle (lucide) | `text-red-500` |
| `awaiting-input` | CircleDot (lucide) | `text-amber-500 animate-pulse` |

## 통합 지점

- **ToolCallHeader**: `ToolCallStatusIndicator`를 ChevronDown과 레이블 사이에 배치
- **ToolCallContent**: switch 문 끝에 `failed` 상태 분기 추가 (에러 메시지 + 재시도 버튼)
- **ToolCallWidget**: `onRetry`, `errorMessage` prop 수신 → Header와 Content로 전달
- **ToolCallGroup**: `onRetry` prop 수신 → 개별 ToolCallWidget에 `onRetry={() => onRetry?.(message.id)}` 전달
- **상위 컴포넌트(AgentChatView 등)**: 현재 시나리오에서 실패 상태가 없으므로 prop만 추가하고, 실제 retry 로직은 백엔드 연동 시 구현. 지금은 인터페이스만 열어둠.

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | 도구 식별 + 상태 즉시 구분 | `ToolCallStatusIndicator` 상태별 아이콘 + `ToolCallHeader` 레이블 |
| 2 | 클릭/토글로 매개변수/결과 축소/확대 | 기존 `ToolCallWidget` Collapsible (이미 구현) |
| 3 | 실행 중 로딩 상태 (스피너 + 현재진행형 레이블) | `ToolCallStatusIndicator` Loader2 spin + 기존 shimmer-text + labelRunning |
| 4 | 실패 시 에러 메시지 + 재시도 옵션 | `ToolCallContent` failed fallback + `onRetry` prop chain |
| 5 | 메시지 흐름과 자연스러운 통합 | 기존 ToolCallGroup → ToolCallWidget 2단 아코디언 (이미 구현) |
| 6 | subtools 중첩 진행 상태 | 기존 ToolCallContent의 parallel_data_query, slide_generation 등 (이미 구현) |
| 7 | TOOL_METADATA 활용 (새 도구는 메타데이터만 추가) | 기존 패턴 유지 (이미 구현) |
| 8 | 키보드 내비게이션 + 스크린 리더 | Radix Collapsible 기본 접근성 + `aria-label` 보강 |
