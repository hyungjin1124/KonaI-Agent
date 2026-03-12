# Select: Agent Marketplace / Store

- **ID**: agent_marketplace
- **Status**: not_implemented
- **Priority**: medium
- **Complexity**: complex
- **Contexts**: [admin]
- **Dependencies**: 없음 (독립 컴포넌트)
- **Obsidian Sources**: Insights/agent-ui/patterns/agent-marketplace-ui.md
- **Existing Source Files**: 없음 (신규 구현)

## 관련 기존 자산

| 자산 | 활용 방안 |
|------|----------|
| `SkillManagementView.tsx` | 검색/필터/토글 패턴 참조 (코드 재사용 아님, 별도 컴포넌트로 구현) |
| `SkillUploadModal.tsx` | 커스텀 플러그인 업로드 패턴 참조 |
| `AdminView.tsx` | 탭 추가 통합 |
| Admin feature pattern (4-file) | {View}.tsx + {data}Data.ts + index.ts + {View}.test.tsx |

## 선정 사유

- Review Decision 2026-03-12 APPROVE-2
- 3회 연속 권장 미실행 항목
- MCP 기반 플러그인 생태계가 "실험적" → "프로덕션급" 전환 확인
- 리서치 브리프 완료 (2026-03-12)
