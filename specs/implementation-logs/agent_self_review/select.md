# Select: Agent Self-Review / Auto-Validation

- **ID**: agent_self_review
- **Status**: not_implemented (QA 테스트 파일만 존재, 구현 코드 부재)
- **Priority**: high
- **Complexity**: moderate
- **Contexts**: [chat_view, agent_scenario]
- **Dependencies**:
  - tool_call_display: implemented
  - approval_rejection: implemented
- **Obsidian Sources**: Insights/agent-ui/patterns/agent-self-review.md
- **Existing Source Files**: (없음 — QA 테스트 파일만 존재)
  - src/components/features/agent-chat/components/SelfReview/SelfReviewCard.qa.test.tsx
  - src/components/features/agent-chat/components/SelfReview/SelfReviewCard.flow.qa.test.tsx

## 비고

- 이전 세션에서 QA 리포트(qa-report.md, PASS)와 QA 테스트 파일이 생성되었으나, 실제 구현 코드는 커밋/저장되지 않은 상태
- 전체 구현 파이프라인을 처음부터 실행 필요
- 기존 QA 테스트 파일은 구현 코드의 인터페이스 참고 자료로 활용 가능
