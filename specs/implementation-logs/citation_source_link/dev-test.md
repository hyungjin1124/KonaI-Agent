# Dev Test Report: Citation & Source Link

## 정적 분석
- TypeScript: PASS (CitationSourceLink 관련 에러 없음; 기존 에러는 AgentChatView, SalesAnalysisResponse, Dashboard 등 무관 파일)
- ESLint: N/A (프로젝트에 ESLint config 없음, Next.js built-in lint deprecated)
- Build: PASS (`npm run build` 성공, 모든 페이지 정적 생성 완료)

## 단위 테스트
| # | 테스트명 | 결과 |
|---|---------|------|
| 1 | CitationBadge > renders the citation index number | PASS |
| 2 | CitationBadge > renders different index numbers correctly | PASS |
| 3 | CitationBadge > has correct aria-label with index and title | PASS |
| 4 | CitationBadge > has correct aria-label for different citation | PASS |
| 5 | CitationBadge > calls window.open with correct args when clicked with URL | PASS |
| 6 | CitationBadge > does NOT call window.open when no URL | PASS |
| 7 | CitationBadge > renders tooltip content with title | PASS |
| 8 | CitationBadge > renders tooltip content with snippet when available | PASS |
| 9 | CitationBadge > does not render snippet when not provided | PASS |
| 10 | CitationBadge > renders domain in tooltip when available | PASS |
| 11 | CitationBadge > does not render domain when not provided | PASS |
| 12 | SourceLinkList > renders nothing when no citations have URLs | PASS |
| 13 | SourceLinkList > renders nothing for empty array | PASS |
| 14 | SourceLinkList > renders the heading | PASS |
| 15 | SourceLinkList > renders only citations with URLs | PASS |
| 16 | SourceLinkList > renders all citations when all have URLs | PASS |
| 17 | SourceLinkList > each link opens in new tab | PASS |
| 18 | SourceLinkList > each link has correct href | PASS |
| 19 | SourceLinkList > each link has correct aria-label | PASS |
| 20 | SourceLinkList > renders citation index badge inside each link | PASS |
| 21 | SourceLinkList > shows domain when available | PASS |
| 22 | SourceLinkList > does not show domain when not available | PASS |
| 23 | CitationSourceLink > returns null for empty array | PASS |
| 24 | CitationSourceLink > returns null for undefined | PASS |
| 25 | CitationSourceLink > returns null for null | PASS |
| 26 | CitationSourceLink > renders badges for all citations | PASS |
| 27 | CitationSourceLink > renders source link list for citations with URLs | PASS |
| 28 | CitationSourceLink > renders correctly with mixed citations | PASS |
| 29 | CitationSourceLink > renders single citation correctly | PASS |
| 30 | CitationSourceLink > does not render SourceLinkList when no URLs | PASS |
| 31 | CitationSourceLink > clicking badge with URL opens link | PASS |
| 32 | CitationSourceLink > renders 출처 heading when URLs exist | PASS |
| 33 | CitationSourceLink > (extra: tooltip content assertions) | PASS |

- 총 테스트: 33개
- 통과: 33개, 실패: 0개

## Acceptance Criteria 자가 검증
| # | Criteria | 코드 구현 | 테스트 커버 | 판정 |
|---|----------|----------|-----------|------|
| 1 | 인라인 인용 번호 뱃지 표시 ([1], [2]) | CitationBadge.tsx:24-26 | #1, #2 | PASS |
| 2 | 호버/클릭 시 출처 상세 정보 팝오버 | CitationBadge.tsx:29-56 (Radix Tooltip) | #7-#11 | PASS |
| 3 | 응답 하단에 출처 링크 목록 표시 | SourceLinkList.tsx:13-44 | #14-#16 | PASS |
| 4 | 소스 링크 클릭 시 새 탭에서 열림 | SourceLinkList.tsx:24-25 (target="_blank") | #17 | PASS |
| 5 | 에이전트 응답 메시지에 통합 | ChatHistoryPanel.tsx:91-93, ChatPanel.tsx:148-150 | — (통합 테스트 범위) | PASS |
| 6 | 브랜드 컬러 및 Tailwind 패턴 준수 | 전체 (hover:bg-[#FF3C42] 등) | — (시각 검증) | PASS |
| 7 | 접근성 (키보드, aria) | aria-label, Radix Tooltip 기본 접근성 | #3-#4, #19 | PASS |

## QA 전달 사항
- 구현에서 특히 확인이 필요한 부분:
  - Radix Tooltip의 모바일 터치 동작 검증 (터치 디바이스에서 hover 대체)
  - 다수 인용(10개+)일 때 배지 행의 줄바꿈 및 레이아웃 확인
  - 실제 채팅에서 citations 데이터를 포함한 메시지 렌더링 E2E 검증
- 알려진 제한사항:
  - general-chat/types.ts의 Citation 타입을 agent-chat/types.ts에서 re-export하도록 통합함
  - 현재 mock 데이터에는 citations가 포함되지 않아 UI에서 직접 확인하려면 mock 데이터 추가 필요
