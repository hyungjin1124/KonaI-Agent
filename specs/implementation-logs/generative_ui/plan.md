# Plan: Generative UI (Phase 1 — Static Component Selection MVP)

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `src/components/features/generative-ui/types.ts` | GenerativeUISpec 타입, 카탈로그 타입 | 신규 |
| `src/components/features/generative-ui/catalog.ts` | 컴포넌트 카탈로그 정의 (타입→렌더러 매핑) | 신규 |
| `src/components/features/generative-ui/GenerativeUIRenderer.tsx` | 메인 디스패처 컴포넌트 | 신규 |
| `src/components/features/generative-ui/GenerativeUIFallback.tsx` | 오류/미지원 타입 Fallback UI | 신규 |
| `src/components/features/generative-ui/parseGenerativeUI.ts` | JSON 파싱 + 검증 유틸 | 신규 |
| `src/components/features/generative-ui/index.ts` | 배럴 export | 신규 |
| `src/components/features/generative-ui/GenerativeUIRenderer.test.tsx` | 단위 테스트 | 신규 |
| `src/components/features/agent-chat/types.ts` | ArtifactPreviewType에 'generative-ui' 추가 | 수정 |
| `src/components/features/agent-chat/components/ArtifactPreviewPanel/renderers/GenerativeUIRendererAdapter.tsx` | ArtifactPanel용 렌더러 어댑터 | 신규 |
| `src/components/features/agent-chat/components/ArtifactPreviewPanel/renderers/index.ts` | GenerativeUIRendererAdapter export 추가 | 수정 |
| `src/components/features/agent-chat/components/ArtifactPreviewPanel/ArtifactPreviewPanel.tsx` | 'generative-ui' case 추가 | 수정 |
| `src/components/features/agent-chat/AgentChatView.tsx` | GenerativeUISpec 감지 및 아티팩트 패널 연동 | 수정 |

## Props Interface

```typescript
// --- GenerativeUI Core Types ---

type GenerativeComponentType =
  | 'bar-chart'
  | 'line-chart'
  | 'pie-chart'
  | 'area-chart'
  | 'composed-chart'
  | 'data-table'
  | 'kpi-card'
  | 'stat-grid';

interface GenerativeUISpec {
  type: GenerativeComponentType;
  title?: string;
  description?: string;
  data: unknown;
  options?: Record<string, unknown>;
  layout?: {
    width?: 'full' | 'half' | 'third';
  };
}

// --- Renderer Props ---

interface GenerativeUIRendererProps {
  spec: GenerativeUISpec;
  onError?: (error: string) => void;
  className?: string;
}

// --- Catalog ---

interface CatalogEntry {
  type: GenerativeComponentType;
  label: string;
  description: string;
  render: (spec: GenerativeUISpec) => React.ReactNode;
  validateData: (data: unknown) => boolean;
}
```

## 상태 설계

- **컴포넌트 내부 state**: GenerativeUIRenderer는 stateless (spec → render)
- **에러 상태**: parseGenerativeUI에서 검증 실패 시 Fallback 렌더링 (별도 state 불필요)
- **AgentChatView 확장**: 기존 `chatHistory` 메시지에 `generativeUISpec?: GenerativeUISpec` 필드 추가. 별도 state 불요.
- **ArtifactPanel 연동**: 기존 ArtifactPanelContext의 `generativeUISpecs: Record<string, GenerativeUISpec>` 추가 (탭 ID → spec 매핑)

## 통합 지점

1. **ArtifactPreviewPanel**: `'generative-ui'` previewType 추가 → GenerativeUIRendererAdapter가 Context에서 spec을 가져와 GenerativeUIRenderer에 전달
2. **AgentChatView**: 에이전트 응답에서 GenerativeUISpec JSON 블록 감지 → 아티팩트 탭 오픈 → 기존 NLChart 플로우와 공존 (NLChart가 먼저 실행, GenerativeUI는 더 넓은 범위)
3. **GeneralChatView**: 기존 NLChart 플로우 유지. GenerativeUI는 Phase 1에서 AgentChatView만 지원 (차후 확장)
4. **라우팅 변경**: 없음

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | `GenerativeUIRenderer` 컴포넌트 구현 (type 기반 dispatch) | `generative-ui/GenerativeUIRenderer.tsx` — catalog.ts의 렌더러 매핑으로 dispatch |
| 2 | 6가지 이상 컴포넌트 타입 렌더링 | `catalog.ts` — bar/line/pie/area/composed/table/kpi/stat-grid (8종) |
| 3 | 기존 NLChartRenderer + ChartWidgets를 카탈로그 항목으로 통합 | `catalog.ts` — NLChartRenderer의 Recharts 차트 + KPIWidgets 스타일 재활용 |
| 4 | ArtifactPreviewPanel에 'generative-ui' 렌더러 타입 추가 | `ArtifactPreviewPanel.tsx` + `GenerativeUIRendererAdapter.tsx` |
| 5 | 에이전트 응답에서 GenerativeUISpec JSON 파싱 및 검증 | `parseGenerativeUI.ts` — JSON 추출 + 타입 검증 |
| 6 | 잘못된 데이터 → Fallback UI 렌더링 | `GenerativeUIFallback.tsx` — 에러 메시지 + 원본 데이터 |
| 7 | 대화 흐름에서 자동 렌더링 동작 확인 | `AgentChatView.tsx` — GenerativeUISpec 감지 → 아티팩트 탭 오픈 |

## 테스트 시나리오

| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | GenerativeUIRenderer type dispatch | 각 타입별 spec 전달 → 해당 차트/테이블 렌더링 | RTL render + screen.getByRole/getByText | must |
| 2 | 6가지+ 컴포넌트 타입 | 8종 타입 각각 렌더링 확인 | RTL render + snapshot 또는 element 존재 확인 | must |
| 3 | NLChart/ChartWidgets 통합 | bar-chart spec → Recharts BarChart 렌더링 | RTL render + Recharts 컨테이너 존재 확인 | must |
| 4 | ArtifactPanel 통합 | previewType='generative-ui' → GenerativeUIRendererAdapter 렌더링 | 유닛 테스트에서 직접 렌더 | should |
| 5 | JSON 파싱 검증 | 유효/무효 JSON → 파싱 결과 확인 | parseGenerativeUI 유닛 테스트 | must |
| 6 | Fallback UI | 잘못된 type/data → Fallback 렌더링 | RTL render + error message 확인 | must |
| 7 | 빈 데이터 → Fallback | data가 null/undefined → Fallback 표시 | RTL render + fallback element 확인 | should |
| 8 | 대화 흐름 통합 | AgentChatView 레벨의 통합은 수동 확인 (E2E) | DevTest 자가검증으로 대체 | could |
