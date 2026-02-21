# Plan: Document Viewer Phase 3 — TOC + Citation Panel + Fullscreen

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `src/components/features/agent-chat/components/DocumentViewer/DocumentTOCSidebar.tsx` | TOC 사이드바 (heading 계층 표시, 스크롤 스파이) | 신규 |
| `src/components/features/agent-chat/components/DocumentViewer/CitationSidePanel.tsx` | 인용 사이드패널 (소스 카드 목록) | 신규 |
| `src/components/features/agent-chat/components/DocumentViewer/FullscreenPortal.tsx` | 풀스크린 React Portal 래퍼 | 신규 |
| `src/components/features/agent-chat/components/DocumentViewer/useDocumentTOC.ts` | heading 추출 + 스크롤 스파이 Hook | 신규 |
| `src/components/features/agent-chat/components/DocumentViewer/types.ts` | TOCItem, Citation, ViewMode 타입 | 신규 |
| `src/components/features/agent-chat/components/DocumentViewer/DocumentViewer.tsx` | 3패널 레이아웃 통합 | 수정 |
| `src/components/features/agent-chat/components/DocumentViewer/DocumentViewerToolbar.tsx` | TOC/Citation/Fullscreen 토글 버튼 추가 | 수정 |
| `src/components/features/agent-chat/components/DocumentViewer/PDFViewer.tsx` | TOC 추출용 콜백, scrollContainerRef 노출 | 수정 |
| `src/components/features/agent-chat/components/DocumentViewer/DOCXViewer.tsx` | heading DOM 추출용 콜백 노출 | 수정 |
| `src/components/features/agent-chat/components/DocumentViewer/index.ts` | 신규 컴포넌트 export 추가 | 수정 |

## Types (신규)

```typescript
// types.ts
interface TOCItem {
  id: string;           // unique ID (heading-0, heading-1, ...)
  level: number;        // 1~6
  text: string;         // heading 텍스트
  element?: HTMLElement; // DOM 참조 (스크롤 대상)
}

interface Citation {
  id: string;
  number: number;       // 인라인 각주 번호
  title: string;        // 소스 제목
  url?: string;         // 원본 URL
  excerpt?: string;     // 발췌문
}

type ViewMode = 'embedded' | 'maximized' | 'fullscreen';
```

## 상태 설계

### DocumentViewer (확장)
- `tocItems: TOCItem[]` — 추출된 heading 목록
- `citations: Citation[]` — 인용 소스 목록 (초기: mock 데이터)
- `showTOC: boolean` — TOC 사이드바 토글
- `showCitations: boolean` — 인용 패널 토글
- `viewMode: ViewMode` — embedded | maximized | fullscreen
- `activeTOCId: string | null` — 스크롤 스파이로 감지된 현재 섹션

### useDocumentTOC Hook
- Input: `containerRef`, `fileType`
- Output: `{ tocItems, activeTOCId, scrollToHeading }`
- IntersectionObserver 기반 스크롤 스파이

## 통합 지점

1. **DocumentViewer.tsx** — 개별 뷰어를 감싸는 3패널 레이아웃:
   ```
   [TOC Sidebar (접이식)] | [Viewer Content] | [Citation Panel (접이식)]
   ```
2. **DocumentViewerToolbar.tsx** — 기존 버튼 그룹에 TOC(ListTree), Citation(Quote), Fullscreen(Maximize2) 토글 추가
3. **PDFViewer/DOCXViewer** — heading 추출 결과를 상위로 전달하는 콜백 prop 추가
4. **FullscreenPortal** — viewMode='fullscreen' 시 React Portal로 뷰포트 전체 점유

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | TOC 사이드바: heading 자동 추출 + 계층 표시 | useDocumentTOC + DocumentTOCSidebar |
| 2 | 스크롤 스파이: 현재 섹션 하이라이트 | useDocumentTOC (IntersectionObserver) |
| 3 | TOC 점프: 클릭 시 smooth scroll | DocumentTOCSidebar → scrollToHeading |
| 4 | TOC 토글: 툴바 버튼 | DocumentViewerToolbar |
| 5 | 인용 패널: 소스 카드 표시 | CitationSidePanel |
| 6 | 인라인 인용: 각주 클릭/호버 | CitationSidePanel + CSS |
| 7 | 풀스크린 토글: Portal + ESC 복귀 | FullscreenPortal + DocumentViewerToolbar |
| 8 | 반응형: 1024px 미만 TOC 자동 숨김 | DocumentViewer CSS + ResizeObserver |
| 9 | 접근성: aria-current, aria-expanded, kbd nav | DocumentTOCSidebar + FullscreenPortal |
| 10 | 성능: 50p PDF TOC ≤ 1초 | useDocumentTOC 최적화 |

## 구현 순서

1. types.ts (타입 정의)
2. useDocumentTOC.ts (heading 추출 Hook)
3. DocumentTOCSidebar.tsx (TOC UI)
4. CitationSidePanel.tsx (인용 UI)
5. FullscreenPortal.tsx (풀스크린 래퍼)
6. DocumentViewerToolbar.tsx 수정 (토글 버튼)
7. PDFViewer.tsx / DOCXViewer.tsx 수정 (heading 콜백)
8. DocumentViewer.tsx 수정 (3패널 레이아웃 통합)
9. index.ts 수정 (export)
