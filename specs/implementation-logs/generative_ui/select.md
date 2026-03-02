# Select: Generative UI (Dynamic Component Rendering)

- **ID**: generative_ui
- **Status**: not_implemented
- **Priority**: high
- **Complexity**: epic (Phase 1 Static MVP만 이번 구현 대상 — moderate 수준)
- **Contexts**: [chat_view, artifact_panel]
- **Dependencies**: 없음 (명시적 dependencies 미정의)
  - 관련 기존 자산: NLChartRenderer (implemented), ChartWidgets (implemented), KPIWidgets (implemented), ArtifactPreviewPanel (implemented)
- **Obsidian Sources**: Insights/agent-ui/patterns/generative-ui-implementation.md
- **Existing Source Files**: 없음 (신규 구현)

## 구현 범위

Review Decision에서 generative_ui는 complexity: epic으로 분류되었으나, 리서치 문서의 권장 전략에 따라 **Phase 1 (Static Component Selection MVP)**만 이번 구현 대상으로 한다.

Phase 1 Acceptance Criteria:
1. `GenerativeUIRenderer` 컴포넌트 구현 (type 기반 dispatch)
2. 6가지 이상 컴포넌트 타입 렌더링 (bar/line/pie/area/table/kpi)
3. 기존 NLChartRenderer + ChartWidgets를 카탈로그 항목으로 통합
4. ArtifactPreviewPanel에 `generative-ui` 렌더러 타입 추가
5. 에이전트 응답에서 `GenerativeUISpec` JSON 파싱 및 검증
6. 잘못된 데이터 → Fallback UI 렌더링 (오류 메시지 + 원본 데이터 표시)
7. 대화 흐름에서 "차트를 보여줘" → 자동 컴포넌트 선택 → 렌더링 동작 확인

## 선정 사유

- 8회 연속 리서치 미실행 후 2026-03-03 리서치 완료
- Google A2UI v0.8 발표, CopilotKit AG-UI 통합 등 프로토콜 표준화 진행 중
- 기존 NLChart/ChartWidgets/KPIWidgets 자산으로 Phase 1 즉시 구현 가능
- Review Decision Batch 1 APPROVED 항목
