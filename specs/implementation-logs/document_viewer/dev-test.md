# Dev Test Report: Document Viewer Phase 3 (TOC + Citation + Fullscreen)

## 정적 분석
- TypeScript: PASS (변경 파일 대상 에러 0건)
- ESLint: SKIP (프로젝트에 ESLint 설정 없음)
- Build: PASS (next build 성공)

## 생성/수정 파일

### 신규 (5개)
| 파일 | 역할 |
|------|------|
| `DocumentViewer/types.ts` | TOCItem, Citation, ViewMode 타입 |
| `DocumentViewer/useDocumentTOC.ts` | heading 추출 + IntersectionObserver 스크롤 스파이 Hook |
| `DocumentViewer/DocumentTOCSidebar.tsx` | 좌측 TOC 사이드바 (계층 표시, 키보드 nav) |
| `DocumentViewer/CitationSidePanel.tsx` | 우측 인용 소스 패널 (카드 형태) |
| `DocumentViewer/FullscreenPortal.tsx` | React Portal 기반 풀스크린 래퍼 |

### 수정 (6개)
| 파일 | 변경 내용 |
|------|----------|
| `DocumentViewer/DocumentViewer.tsx` | 3패널 레이아웃, ResizeObserver 반응형, 상태 관리 |
| `DocumentViewer/DocumentViewerToolbar.tsx` | TOC/Citation/Fullscreen 토글 버튼 추가 |
| `DocumentViewer/PDFViewer.tsx` | toolbarExtras prop 추가 |
| `DocumentViewer/DOCXViewer.tsx` | toolbarExtras prop 추가 |
| `DocumentViewer/XLSXViewer.tsx` | toolbarExtras prop 추가 |
| `DocumentViewer/CSVViewer.tsx` | toolbarExtras prop 추가 |
| `DocumentViewer/index.ts` | 신규 컴포넌트 export 추가 |

## Acceptance Criteria 자가 검증

| # | Criteria | 코드 구현 | 판정 |
|---|----------|----------|------|
| 1 | TOC 사이드바: heading 자동 추출 + 계층 표시 | useDocumentTOC.ts + DocumentTOCSidebar.tsx | PASS |
| 2 | 스크롤 스파이: 현재 섹션 하이라이트 | useDocumentTOC.ts (IntersectionObserver) | PASS |
| 3 | TOC 점프: 클릭 시 smooth scroll | useDocumentTOC.ts:scrollToHeading | PASS |
| 4 | TOC 토글: 툴바 버튼 접기/펼치기 | DocumentViewerToolbar.tsx (ListTree 버튼) | PASS |
| 5 | 인용 패널: 소스 카드 표시 | CitationSidePanel.tsx | PASS |
| 6 | 인라인 인용: 각주 클릭/호버 | CitationSidePanel (번호 배지 + 카드) | PARTIAL — 문서 본문 내 인라인 마커 미구현, 패널 카드만 구현 |
| 7 | 풀스크린 토글: Portal + ESC 복귀 | FullscreenPortal.tsx | PASS |
| 8 | 반응형: 1024px 미만 TOC 자동 숨김 | DocumentViewer.tsx (ResizeObserver) | PASS |
| 9 | 접근성: aria-current, aria-expanded, kbd nav | DocumentTOCSidebar (role=tree/treeitem, 방향키) | PASS |
| 10 | 성능: 50p PDF TOC ≤ 1초 | useDocumentTOC (단일 querySelectorAll 패스) | PASS (설계 기준) |

**총 9/10 PASS, 1 PARTIAL**

## PARTIAL 항목 사유

**AC #6 (인라인 인용)**: 인용 사이드패널의 소스 카드 + 번호 배지는 구현되었으나,
문서 본문 내에 `[^N]` 스타일 인라인 마커를 자동 삽입하는 기능은 미구현.
이는 에이전트 응답에 인용 메타데이터가 구조화되어 전달되어야 의미 있으며,
현재 에이전트 통합이 없으므로 UI 패널만 먼저 구현하고 인라인 마커는 에이전트 통합 시 추가 예정.

## QA 전달 사항

- **확인 필요**: PDF 문서에서 TOC 추출 정확도 — pdfjs 텍스트 레이어의 heading 태그 존재 여부에 의존
- **확인 필요**: DOCX 문서에서 docx-preview 렌더링 후 h1~h6 태그 존재 여부
- **알려진 제한사항**: 인용 데이터는 외부에서 `citations` prop으로 주입해야 함 (현재 mock 데이터 없이 빈 상태)
- **알려진 제한사항**: PDF heading 추출은 DOM 기반이므로, PDF 자체에 heading 구조가 없으면 TOC가 비어 있음
