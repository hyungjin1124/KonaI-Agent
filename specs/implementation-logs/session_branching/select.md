# Select: Session Branching / Forking

- **ID**: session_branching
- **Status**: partial (Phase 1 코드 구현 완료, QA 미완)
- **Priority**: medium
- **Complexity**: complex
- **Contexts**: [chat_view]
- **Dependencies**: none
- **Obsidian Sources**: Insights/agent-ui/patterns/session-branching-ui.md
- **Existing Source Files**:
  - src/components/features/general-chat/hooks/useBranching.ts
  - src/components/features/general-chat/components/BranchIndicator/BranchIndicator.tsx
  - src/components/features/general-chat/components/LeftSidebar/BranchItem.tsx

## 선정 사유

Review 2026-03-11에서 APPROVE (Batch 1). GitHub Copilot VS Code v1.110(Mar 6)에서 Conversation branching(fork) 정식 출시. 9개 제품/라이브러리 비교 리서치 완료. Phase 1 코드 구현 완료 상태로, dev test(정적 분석 + 단위 테스트 + AC 검증)가 필요.
