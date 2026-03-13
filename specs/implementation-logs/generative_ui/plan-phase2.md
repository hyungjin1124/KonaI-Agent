# Plan: Generative UI — Phase 2 (Inline Ephemeral Visualization)

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `src/components/features/generative-ui/types.ts` | Phase 2 타입 추가 (InlineGenerativeUIRendererProps, A2UICatalog) | 수정 |
| `src/components/features/generative-ui/InlineGenerativeUI.tsx` | 인라인 임시 시각화 래퍼 (메시지 버블 내 렌더링) | 신규 |
| `src/components/features/generative-ui/useInlineGenerativeUI.ts` | 인라인 시각화 상태 관리 Hook (파싱, 동적 업데이트) | 신규 |
| `src/components/features/generative-ui/a2uiCatalog.ts` | A2UI 호환 카탈로그 정의 (8개 컴포넌트 타입) | 신규 |
| `src/components/features/generative-ui/index.ts` | Phase 2 export 추가 | 수정 |
| `src/components/features/generative-ui/GenerativeUIRenderer.tsx` | compact 모드 지원 추가 | 수정 |
| `src/components/features/general-chat/components/ChatPanel/ChatPanel.tsx` | assistant 메시지에 인라인 시각화 렌더링 삽입 | 수정 |
| `src/components/features/generative-ui/InlineGenerativeUI.test.tsx` | Phase 2 단위 테스트 | 신규 |

## Props Interface

```typescript
// --- Phase 2 신규 타입 ---

/** 인라인 시각화 렌더러 Props */
interface InlineGenerativeUIProps {
  /** 에이전트 메시지 콘텐츠 (generative-ui 코드펜스 포함) */
  messageContent: string;
  /** 메시지 ID (동적 업데이트 참조용) */
  messageId: string;
  /** Artifact 패널로 전환 콜백 */
  onSaveToArtifact?: (spec: GenerativeUISpec) => void;
  /** 추가 CSS 클래스 */
  className?: string;
}

/** A2UI 호환 카탈로그 엔트리 */
interface A2UICatalogEntry {
  type: GenerativeComponentType;
  displayName: string;
  description: string;
  category: 'chart' | 'metric' | 'data';
  schema: {
    dataType: string;
    requiredFields: string[];
    optionalFields?: string[];
  };
}

/** A2UI 카탈로그 전체 */
interface A2UICatalog {
  version: string;
  vendor: string;
  components: A2UICatalogEntry[];
}

/** 동적 업데이트 Spec (기존 시각화 참조 + 데이터 교체) */
interface GenerativeUIUpdateSpec {
  targetMessageId: string;
  update: Partial<GenerativeUISpec>;
}

/** GenerativeUIRendererProps 확장 */
interface GenerativeUIRendererProps {
  spec: GenerativeUISpec;
  onError?: (error: string) => void;
  className?: string;
  compact?: boolean; // Phase 2: 인라인 모드 시 축소 렌더링
}
```

## 상태 설계

- **ChatPanel 레벨**: 상태 없음. `message.content`에서 `extractGenerativeUIFromMessage()`로 on-demand 파싱
- **InlineGenerativeUI 내부**: `useState<GenerativeUISpec | null>` — 파싱 결과 캐싱 (동일 메시지 재파싱 방지)
- **동적 업데이트**: 후속 메시지의 `GenerativeUIUpdateSpec`이 `targetMessageId`를 참조하면, 해당 메시지의 인라인 시각화를 업데이트된 spec으로 교체. 전체 교체 방식 (접근 1).
- **Artifact 전환**: `onSaveToArtifact` 콜백으로 기존 ArtifactPanel 플로우 활용 (Phase 1 인프라 재사용)

## 통합 지점

1. **ChatPanel.tsx**: assistant 메시지 렌더링 부분 (line 162-168) — `MarkdownRenderer` 다음, `CitationSourceLink` 전에 `InlineGenerativeUI` 삽입
2. **GenerativeUIRenderer.tsx**: `compact` prop 추가 — 인라인 모드에서 padding/header 축소, 차트 높이 제한 (max 320px)
3. **기존 ArtifactPanel 플로우**: "Artifact로 저장" 클릭 시 Phase 1의 동일 경로 사용 — spec을 `generativeUISpecs` state에 추가하고 탭 오픈

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | 대화 흐름 내 인라인 렌더링 | `ChatPanel.tsx` — InlineGenerativeUI 삽입, `InlineGenerativeUI.tsx` |
| 2 | 인터랙티브 요소 (호버, 툴팁) | `GenerativeUIRenderer.tsx` — Recharts Tooltip/hover 이미 구현, compact 모드에서 유지 |
| 3 | Artifact로 저장 전환 | `InlineGenerativeUI.tsx` — "Artifact로 저장" 버튼 + onSaveToArtifact 콜백 |
| 4 | 후속 대화 동적 업데이트 | `useInlineGenerativeUI.ts` — targetMessageId 기반 spec 교체, `ChatPanel.tsx` — specs Map 관리 |
| 5 | 데이터 부분 갱신 | `useInlineGenerativeUI.ts` — Partial spec merge (전체 교체 후 Recharts 애니메이션으로 자연스러운 전환) |
| 6 | 스크롤 시 자연스러운 표시 | CSS + max-height 제한 + overflow hidden. 스크롤 가상화는 기존 ChatPanel 스크롤 활용 |
| 7 | Fallback UI 유지 | `GenerativeUIFallback.tsx` 재사용 (Phase 1 동일) |
| 8 | A2UI 카탈로그 정의 | `a2uiCatalog.ts` — 8개 컴포넌트 JSON Schema |

## 테스트 시나리오

| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | 인라인 렌더링 | generative-ui 코드펜스 포함 메시지 → 인라인 차트 렌더링 | RTL render InlineGenerativeUI + getByTestId | must |
| 2 | 코드펜스 없는 메시지 | 일반 텍스트 메시지 → 인라인 시각화 미표시 | RTL render + queryByTestId null | must |
| 3 | 인터랙티브 요소 | bar-chart spec → Recharts 툴팁 작동 확인 | RTL render + Recharts 컨테이너 존재 | must |
| 4 | Artifact 저장 | "Artifact로 저장" 클릭 → onSaveToArtifact 호출 | RTL userEvent.click + mock callback | must |
| 5 | 동적 업데이트 | targetMessageId 매칭 → spec 교체 렌더링 | RTL rerender + 새 데이터 확인 | must |
| 6 | 부분 갱신 | update에 data만 포함 → 기존 title/type 유지 + 데이터만 교체 | RTL rerender + title 유지 + 새 데이터 | must |
| 7 | Fallback | 잘못된 JSON → Fallback UI 표시 | RTL render + getByTestId("generative-ui-fallback") | must |
| 8 | A2UI 카탈로그 | 카탈로그에 8개 컴포넌트 정의 확인 | 유닛 테스트 (import + length check + 필드 검증) | must |
| 9 | compact 모드 | compact=true → 축소 렌더링 (max-height 적용) | RTL render + className 확인 | should |
| 10 | 빈 코드펜스 | ```generative-ui\n``` (빈 JSON) → Fallback | RTL render + Fallback 확인 | should |
