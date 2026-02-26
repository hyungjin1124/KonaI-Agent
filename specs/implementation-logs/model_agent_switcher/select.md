# Select: Model / Agent Switcher

- **ID**: model_agent_switcher
- **Name**: Model / Agent Switcher
- **Description**: 대화 중 모델 또는 에이전트를 전환하는 드롭다운
- **Status**: not_implemented
- **Priority**: medium
- **Complexity**: simple
- **Contexts**: chat_view
- **Dependencies**: None
- **Obsidian Sources**:
  - Insights/agent-ui/patterns/model-agent-switcher.md
- **Existing Source Files**: None

## Component Details

**Context Routes**: ["/", "/chat"]

**Notes from Catalog**:
> Phase 1: Radix Select with inline metadata (context window, speed). Phase 2: Family grouping + pinning + hovercard. Phase 3: Auto mode + task-based suggestions.

**Review Decision Notes**:
- 6회 연속 권장 (2026-02-21부터)
- Windsurf v1.9566.9 (Feb 25, 2026): 새 Model Picker — 모델 패밀리 그루핑 + 핀(즐겨찾기) 기능
- GitHub Copilot Auto 모드 + 에이전트 피커(Feb 2026)와 함께 모델 선택 UX 강화 트렌드
- 높은 ROI: simple 복잡도 / high 사용자 가치. 2일 내 구현 가능
- 기술 스택 호환: Radix UI dropdown/popover로 구현 가능. 외부 의존성 없음

## Dependencies Check

No dependencies specified. Ready to implement.
