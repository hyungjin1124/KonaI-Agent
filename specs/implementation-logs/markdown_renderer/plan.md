# Plan: Markdown Renderer

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| src/components/shared/markdown/MarkdownRenderer.tsx | 통합 마크다운 렌더러 컴포넌트 | 신규 |
| src/components/shared/markdown/markdownComponents.tsx | 커스텀 컴포넌트 맵 (기존 확장) | 신규 |
| src/components/shared/markdown/CodeBlock.tsx | 코드 블록 전용 (Copy 버튼, 언어 라벨) | 신규 |
| src/components/shared/markdown/index.ts | barrel export | 신규 |
| src/components/features/general-chat/components/ChatPanel/ChatPanel.tsx | AI 메시지에 MarkdownRenderer 적용 | 수정 |
| src/components/shared/atoms/ChatBubble.tsx | 수동 파싱 → MarkdownRenderer로 교체 | 수정 |
| src/components/features/agent-chat/components/MarkdownPreviewPanel/MarkdownPreviewPanel.tsx | 공통 markdownComponents 사용으로 전환 | 수정 |
| src/components/features/agent-chat/components/MarkdownPreviewPanel/markdownComponents.tsx | deprecated — shared로 이동 | 삭제 대상 (import 리다이렉트) |

## Props Interface

```typescript
interface MarkdownRendererProps {
  content: string;
  className?: string;
  /** 채팅 버블 내부용 컴팩트 모드 (더 작은 여백/글꼴) */
  compact?: boolean;
}
```

## 상태 설계

- 내부 state 없음 — 순수 렌더링 컴포넌트
- React.memo로 동일 content에 대한 재렌더링 방지
- remarkPlugins 배열은 모듈 레벨 상수로 선언 (매 렌더마다 새 배열 방지)

## 통합 지점

1. **ChatPanel.tsx**: AI 메시지(`message.type === 'assistant'`) 렌더링 시 `<p>` → `<MarkdownRenderer content={message.content} compact />`
2. **ChatBubble.tsx**: `renderMessage()` 수동 파싱 → `<MarkdownRenderer content={message} compact />`
3. **MarkdownPreviewPanel.tsx**: 자체 markdownComponents import를 shared에서 가져오도록 변경

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | 통합 MarkdownRenderer 컴포넌트 | shared/markdown/MarkdownRenderer.tsx |
| 2 | GFM 완전 지원 (테이블, 태스크 리스트, 취소선, 자동 링크) | remark-gfm 플러그인 + markdownComponents.tsx |
| 3 | 헤딩(h1-h6) 시각적 구분 | markdownComponents.tsx h1-h6 |
| 4 | 코드 블록: 언어 라벨, Copy 버튼, monospace, 배경색 | CodeBlock.tsx |
| 5 | 인라인 코드: 배경색 + monospace | markdownComponents.tsx code |
| 6 | 블록쿼트: 좌측 보더 + 배경색 | markdownComponents.tsx blockquote |
| 7 | 이미지: max-width 제한 | markdownComponents.tsx img |
| 8 | 링크: 새 탭, 시각적 구분 | markdownComponents.tsx a |
| 9 | 중첩 마크다운 정상 처리 | react-markdown 기본 동작 |
| 10 | ChatBubble 수동 파싱 교체 | ChatBubble.tsx 수정 |
| 11 | 보안: HTML sanitize | react-markdown 기본 동작 (HTML 렌더링 안 함) |
| 12 | 성능: React.memo | MarkdownRenderer.tsx memo 래핑 |
