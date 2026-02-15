# Plan: Citation & Source Link

## 파일 구조
| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| src/components/features/agent-chat/types.ts | Citation, SourceLink 타입 추가 | 수정 |
| src/components/features/agent-chat/components/CitationSourceLink/CitationBadge.tsx | 인라인 인용 번호 뱃지 (호버 시 출처 상세) | 신규 |
| src/components/features/agent-chat/components/CitationSourceLink/SourceLinkList.tsx | 응답 하단 출처 링크 목록 | 신규 |
| src/components/features/agent-chat/components/CitationSourceLink/CitationSourceLink.tsx | 메인 래퍼 (인라인 뱃지 + 하단 목록 조합) | 신규 |
| src/components/features/agent-chat/components/CitationSourceLink/index.ts | barrel export | 신규 |
| src/components/features/agent-chat/components/ChatHistoryPanel.tsx | ChatMessage에 citations 필드 추가, 렌더링 통합 | 수정 |
| src/components/features/general-chat/types.ts | ChatMessage에 citations 필드 추가 | 수정 |

## Props Interface
```typescript
// 타입 정의 (types.ts에 추가)
interface Citation {
  id: string;
  index: number;        // 인용 번호 (1, 2, 3...)
  title: string;        // 출처 제목
  url?: string;         // 출처 URL
  domain?: string;      // 도메인명 (e.g., "wikipedia.org")
  snippet?: string;     // 인용 텍스트 미리보기
}

// CitationSourceLink 메인 컴포넌트
interface CitationSourceLinkProps {
  citations: Citation[];
}

// CitationBadge (인라인 뱃지)
interface CitationBadgeProps {
  citation: Citation;
}

// SourceLinkList (하단 출처 목록)
interface SourceLinkListProps {
  citations: Citation[];
}
```

## 상태 설계
- 컴포넌트 자체 상태 없음 (stateless, props-driven)
- Tooltip/Popover 열림 상태는 Radix UI가 내부 관리
- 부모 컴포넌트에서 `citations` 배열을 전달

## 통합 지점
- **ChatHistoryPanel.tsx**: 에이전트 텍스트 메시지 하단에 `<CitationSourceLink>` 렌더링
  - `ChatMessage` 인터페이스에 `citations?: Citation[]` 필드 추가
  - `isSimpleTextMessage` 분기에서 citations 존재 시 렌더
- **ChatPanel.tsx**: assistant 메시지 하단에 동일하게 렌더링 가능 (선택적)

## Acceptance Criteria 매핑
| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | 인라인 인용 번호 뱃지 표시 ([1], [2]) | CitationBadge.tsx |
| 2 | 호버/클릭 시 출처 상세 정보 팝오버 | CitationBadge.tsx (Tooltip 사용) |
| 3 | 응답 하단에 출처 링크 목록 표시 | SourceLinkList.tsx |
| 4 | 소스 링크 클릭 시 새 탭에서 열림 | SourceLinkList.tsx (target="_blank") |
| 5 | 에이전트 응답 메시지에 통합 | ChatHistoryPanel.tsx 수정 |
| 6 | 브랜드 컬러 및 Tailwind 패턴 준수 | 전체 컴포넌트 스타일링 |
| 7 | 접근성 (키보드, aria) | Radix 기반 Tooltip/Popover 사용 |
