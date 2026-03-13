# Select: Generative UI — Phase 2 (Inline Ephemeral Visualization)

- **ID**: generative_ui
- **Status**: implemented (Phase 1 QA PASS, Phase 2 UPDATE)
- **Priority**: high
- **Complexity**: complex (Phase 2: Inline Ephemeral + Dynamic Update)
- **Contexts**: [chat_view, artifact_panel]
- **Dependencies**: 없음 (명시적 dependencies 미정의)
  - Phase 1 구현 완료 자산: GenerativeUIRenderer, parseGenerativeUI, GenerativeUIFallback, GenerativeUIRendererAdapter
  - 관련 자산: NLChartRenderer, ChartWidgets, KPIWidgets, ArtifactPreviewPanel, ChatPanel
- **Obsidian Sources**: Insights/agent-ui/patterns/generative-ui-implementation.md (Phase 2 리서치 완료 2026-03-13)
- **Existing Source Files**:
  - src/components/features/generative-ui/types.ts
  - src/components/features/generative-ui/parseGenerativeUI.ts
  - src/components/features/generative-ui/GenerativeUIRenderer.tsx
  - src/components/features/generative-ui/GenerativeUIFallback.tsx
  - src/components/features/generative-ui/index.ts
  - src/components/features/generative-ui/GenerativeUIRenderer.test.tsx
  - src/components/features/agent-chat/components/ArtifactPreviewPanel/renderers/GenerativeUIRendererAdapter.tsx

## 구현 범위

Phase 2는 리서치 문서의 Acceptance Criteria 기반으로 **인라인 임시 시각화 + 동적 업데이트 + A2UI 카탈로그**를 구현한다.

### Phase 2 Acceptance Criteria:
1. 에이전트 응답 내 `GenerativeUISpec`이 대화 흐름 내 인라인으로 렌더링됨
2. 인라인 시각화에 인터랙티브 요소(호버, 클릭, 툴팁) 작동
3. "Artifact로 저장" 버튼으로 Ephemeral → Persistent 전환 가능
4. 후속 대화에서 에이전트가 기존 시각화를 수정한 응답을 반환하면 업데이트 적용
5. 데이터 부분 갱신(전체 재렌더링 없이 데이터만 교체) 지원
6. 인라인 시각화가 대화 스크롤 시 자연스럽게 표시/숨김
7. 잘못된 데이터 → Fallback UI 렌더링 유지
8. KonaI-Agent 커스텀 A2UI 카탈로그 JSON Schema 정의 (최소 6개 컴포넌트)

## 선정 사유

- Review Decision 2026-03-13 Batch 2 APPROVED
- Claude(Mar 12) + ChatGPT(Mar 10) 동시 인라인 시각화 출시로 업계 표준 확립
- Phase 1 QA PASS 상태에서 확장 구현
- 리서치 브리프 Phase 2 업데이트 완료 (2026-03-13)
