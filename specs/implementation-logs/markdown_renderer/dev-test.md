# Dev Test Report: Markdown Renderer

## 정적 분석
- TypeScript: PASS (신규/수정 파일에 에러 없음)
- ESLint: PASS
- Build: PASS

## 단위 테스트

| # | 테스트명 | 결과 |
|---|---------|------|
| 1 | renders without error with empty content | PASS |
| 2 | renders plain text content | PASS |
| 3 | applies custom className | PASS |
| 4 | renders h1 | PASS |
| 5 | renders h2 | PASS |
| 6 | renders h3 | PASS |
| 7 | renders h4 | PASS |
| 8 | renders h5 | PASS |
| 9 | renders h6 | PASS |
| 10 | headings are visually distinct (compact vs normal mode) | PASS |
| 11 | renders bold text | PASS |
| 12 | renders italic text | PASS |
| 13 | renders inline code | PASS |
| 14 | renders strikethrough text (GFM) | PASS |
| 15 | renders unordered list | PASS |
| 16 | renders ordered list | PASS |
| 17 | renders task list (GFM) | PASS |
| 18 | renders table | PASS |
| 19 | renders table headers | PASS |
| 20 | renders table rows | PASS |
| 21 | table has horizontal scroll wrapper | PASS |
| 22 | renders code block with language label | PASS |
| 23 | renders code block content | PASS |
| 24 | renders copy button in code block | PASS |
| 25 | renders blockquote with correct styling | PASS |
| 26 | renders links that open in new tab | PASS |
| 27 | renders images with max-width constraint | PASS |
| 28 | does not render raw HTML | PASS |
| 29 | does not render dangerous HTML elements | PASS |
| 30 | renders bold inside list items | PASS |
| 31 | renders inline code inside bold | PASS |
| 32 | renders with compact styling when compact=true | PASS |
| 33 | renders with normal styling when compact=false | PASS |
| 34 | CodeBlock renders code content | PASS |
| 35 | CodeBlock displays language label | PASS |
| 36 | CodeBlock shows "code" as default language | PASS |
| 37 | CodeBlock shows copy button that changes to 복사됨 after click | PASS |

- 총 테스트: 37개
- 통과: 37개, 실패: 0개

## Acceptance Criteria 자가 검증

| # | Criteria | 코드 구현 | 테스트 커버 | 판정 |
|---|----------|----------|-----------|------|
| 1 | 통합 MarkdownRenderer 컴포넌트 (chat_view + artifact_panel) | MarkdownRenderer.tsx + ChatPanel.tsx/ChatBubble.tsx 통합 + MarkdownPreviewPanel.tsx 공유 | smoke test, className test | PASS |
| 2 | GFM 완전 지원 (테이블, 태스크 리스트, 취소선, 자동 링크) | remark-gfm 플러그인 + markdownComponents.tsx | tables, task list, strikethrough tests | PASS |
| 3 | 헤딩(h1-h6) 시각적 구분 | markdownComponents.tsx h1-h6 | headings 6개 + compact 모드 test | PASS |
| 4 | 코드 블록: 언어 라벨, Copy 버튼, monospace, 배경색 | CodeBlock.tsx | code block 3개 test | PASS |
| 5 | 인라인 코드: 배경색 + monospace | markdownComponents.tsx code | inline code test | PASS |
| 6 | 블록쿼트: 좌측 보더 + 배경색 | markdownComponents.tsx blockquote | blockquote test | PASS |
| 7 | 이미지: max-width 제한 | markdownComponents.tsx img | image test | PASS |
| 8 | 링크: 새 탭, 시각적 구분 | markdownComponents.tsx a | link test | PASS |
| 9 | 중첩 마크다운 정상 처리 | react-markdown 기본 동작 | nested markdown 2개 test | PASS |
| 10 | ChatBubble 수동 파싱 교체 | ChatBubble.tsx 수정 완료 | - | PASS |
| 11 | 보안: HTML sanitize | react-markdown 기본 동작 (HTML 비렌더링) | security 2개 test | PASS |
| 12 | 성능: React.memo | MarkdownRenderer.tsx memo 래핑 | - | PASS |

## 파일 변경 요약

### 신규 파일 (4개)
- `src/components/shared/markdown/MarkdownRenderer.tsx` — 통합 마크다운 렌더러
- `src/components/shared/markdown/markdownComponents.tsx` — 커스텀 컴포넌트 맵 (compact/normal 모드)
- `src/components/shared/markdown/CodeBlock.tsx` — 코드 블록 (언어 라벨, Copy 버튼)
- `src/components/shared/markdown/index.ts` — barrel export

### 수정 파일 (4개)
- `src/components/features/general-chat/components/ChatPanel/ChatPanel.tsx` — AI 메시지에 MarkdownRenderer 적용
- `src/components/shared/atoms/ChatBubble.tsx` — 수동 regex 파싱 → MarkdownRenderer 교체
- `src/components/features/agent-chat/components/MarkdownPreviewPanel/MarkdownPreviewPanel.tsx` — 공유 markdownComponents 사용
- `src/components/features/agent-chat/components/MarkdownPreviewPanel/index.ts` — re-export를 shared에서 가져오도록 변경

### 테스트 파일 (1개)
- `src/components/shared/markdown/MarkdownRenderer.test.tsx` — 37개 단위 테스트

## QA 전달 사항
- Phase 1 (MVP) 구현: react-markdown + remark-gfm 기반. 코드 구문 강조(Shiki)는 Phase 2
- CodeBlock의 Copy 기능은 navigator.clipboard API 의존 — HTTPS 환경에서만 동작
- 기존 MarkdownPreviewPanel의 markdownComponents.tsx는 삭제하지 않음 (호환성 유지). 향후 정리 가능
- compact 모드는 채팅 버블 내부에서 더 작은 여백/글꼴 적용
