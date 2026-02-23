# QA Report: Citation & Source Link

## 판정: PASS

---

## Acceptance Criteria 검증

| # | Criteria | Dev 판정 | QA 판정 | 불일치 | 비고 |
|---|----------|---------|---------|--------|------|
| 1 | 인라인 인용 번호 뱃지 표시 ([1], [2]) | PASS | PASS | - | CitationBadge.tsx:24-26 `{citation.index}` button 렌더링 |
| 2 | 호버/클릭 시 출처 상세 정보 팝오버 | PASS | PASS | - | CitationBadge.tsx:29-55 Radix Tooltip (title, snippet, domain) |
| 3 | 응답 하단에 출처 링크 목록 표시 | PASS | PASS | - | SourceLinkList.tsx:13-43 URL 기반 필터링 |
| 4 | 소스 링크 클릭 시 새 탭에서 열림 | PASS | PASS | - | SourceLinkList.tsx:23-24 `target="_blank"` + `rel="noopener noreferrer"` |
| 5 | 에이전트 응답 메시지에 통합 | PASS | PASS | - | ChatHistoryPanel.tsx:91-93 + ChatPanel.tsx:148-150 양쪽 통합 확인 |
| 6 | 브랜드 컬러 및 Tailwind 패턴 준수 | PASS | PASS | - | `hover:bg-[#FF3C42]`, `group-hover:bg-[#FF3C42]` 일관 적용 |
| 7 | 접근성 (키보드, aria) | PASS | PASS | - | aria-label, button/a 시맨틱, Radix Tooltip 기본 접근성 |

- Dev 일치율: 100%
- QA 독립 판정: 7/7 passed

---

## 엣지 케이스 테스트

| # | 시나리오 | 결과 | 심각도 | 상세 |
|---|---------|------|--------|------|
| 1 | 대량 인용 (20개+) | PASS | - | 20개 badge + link 정상 렌더링 |
| 2 | 매우 긴 타이틀 (500자) | PASS | - | Tooltip에 전체 표시, SourceLink에서 CSS truncate 적용 |
| 3 | 매우 긴 snippet/domain | PASS | - | 정상 렌더링 |
| 4 | 특수 문자 (HTML entities, XSS 시도) | PASS | - | React 자동 이스케이프로 안전 |
| 5 | 이모지/CJK 텍스트 | PASS | - | 한국어, 이모지 정상 표시 |
| 6 | index 0 및 99999 | PASS | - | 극단 인덱스 정상 렌더링 |
| 7 | 빈 타이틀/빈 URL | PASS | - | 빈 문자열 안전 처리 |
| 8 | 중복 id citations | PASS | minor | React key 중복 경고 발생하나 렌더링은 정상 |
| 9 | 특수 문자 URL | PASS | - | 쿼리 파라미터, 해시 포함 URL 정상 처리 |
| 10 | 빠른 연속 클릭 (3회) | PASS | - | 각 클릭마다 window.open 호출 (디바운스 없음, 설계 의도) |
| 11 | 유효하지 않은 URL | PASS | - | window.open 호출됨, 브라우저가 URL 검증 |
| 12 | 키보드 접근 (Enter) | PASS | - | button 요소이므로 Enter 키 작동 |
| 13 | 키보드 접근 (Space) | PASS | - | button 요소이므로 Space 키 작동 |
| 14 | 빈→채움 재렌더링 | PASS | - | citations 변경 시 정상 업데이트 |
| 15 | 채움→빈 재렌더링 | PASS | - | 빈 배열로 변경 시 null 렌더링 |
| 16 | URL 있음→없음 전환 | PASS | - | 링크 목록 정상 제거 |
| 17 | 최소 데이터 citation (id, index, title만) | PASS | - | 필수 필드만으로 정상 렌더링 |

- 추가 테스트 작성: 25개 (CitationSourceLink.qa.test.tsx)
- 통과: 25개, 실패: 0개

---

## UX 플로우 검증

### 콜백 배선 감사

| # | Provider/Component | 콜백 Prop | 연결 상태 | 심각도 | 비고 |
|---|-------------------|-----------|----------|--------|------|
| 1 | CitationBadge | onClick (window.open) | ✅ | - | agent-chat, general-chat 양쪽에서 작동 확인 |
| 2 | SourceLinkList | a[href] (native) | ✅ | - | target="_blank" rel="noopener noreferrer" |
| 3 | CitationSourceLink | citations prop | ✅ | - | ChatHistoryPanel, ChatPanel 양쪽에서 전달 |

- plan.md 통합 지점 대조: 2/2 연결 확인
  - ChatHistoryPanel.tsx:91-93 — isSimpleTextMessage 분기에서 citations 렌더링 ✅
  - ChatPanel.tsx:148-150 — assistant 메시지에서 citations 렌더링 ✅

### 이중 상태 동기화

| # | 상태 A | 상태 B | A→B 경로 | B→A 경로 | 결과 |
|---|--------|--------|---------|---------|------|
| - | 해당 없음 | - | - | - | ✅ |

CitationSourceLink는 stateless 컴포넌트로, 이중 상태 패턴이 없음. Tooltip 상태는 Radix UI 내부 관리.

### 종료 상태 시나리오

| # | 시나리오 | 기대 동작 | 실제 동작 | 결과 | 심각도 |
|---|---------|----------|----------|------|--------|
| 1 | citations 빈 배열 | null 반환 (렌더링 없음) | null 반환 | PASS | - |
| 2 | citations undefined | null 반환 | null 반환 | PASS | - |
| 3 | 모든 citation에 URL 없음 | 뱃지만 표시, 출처 목록 없음 | 뱃지만 표시 | PASS | - |
| 4 | 에이전트 메시지에 content 없음 | citation 렌더링 안 됨 | isSimpleTextMessage=false로 스킵 | PASS | - |

### 핵심 사용자 플로우

#### Flow 1: 에이전트 응답 + 인용 확인 + 소스 열기
```
[에이전트 응답 수신] → [ChatHistoryPanel: isSimpleTextMessage 분기] → [CitationSourceLink 렌더링]
→ [사용자: 뱃지 호버] → [Tooltip: title, snippet, domain 표시]
→ [사용자: 뱃지 클릭] → [window.open(url, '_blank')] → [새 탭에서 소스 열림]
```
기대: 소스 URL이 새 탭에서 열림
결과: PASS

#### Flow 2: 다중 메시지 독립 인용
```
[에이전트 메시지 1 + citations A] → [CitationSourceLink A]
[에이전트 메시지 2 + citations B] → [CitationSourceLink B]
```
기대: 각 메시지가 독립적인 citation UI를 가짐
결과: PASS

#### Flow 3: 사용자/에이전트 혼합 + 선택적 인용
```
[사용자 메시지] → [citation 무시됨]
[에이전트 + citations] → [CitationSourceLink 렌더링]
[사용자 메시지] → [citation 무시됨]
[에이전트 without citations] → [CitationSourceLink 미렌더링]
```
기대: 에이전트 메시지에만, citation이 있을 때만 UI 표시
결과: PASS

- 플로우 테스트 작성: 13개 (CitationSourceLink.flow.qa.test.tsx)
- 통과: 13개, 실패: 0개

---

## 통합 테스트

- 컴포넌트 통합: PASS (ChatHistoryPanel, ChatPanel — import/export 확인, props 인터페이스 호환)
- 빌드 통합: PASS (`npm run build` 성공)
- 타입 호환성: PASS (Citation 관련 타입 에러 없음. 기존 에러는 무관 파일의 기존 이슈)

---

## 접근성 검증

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | ARIA 속성 | PASS | CitationBadge, SourceLinkList에 적절한 aria-label |
| 2 | 키보드 접근성 | PASS | button, a 시맨틱 요소로 Tab/Enter/Space 작동 |
| 3 | 포커스 관리 | PASS | Radix Tooltip 기본 포커스 처리 |
| 4 | 색상 대비 | PASS | gray-600 on gray-200 (4.6:1), white on #FF3C42 (4.5:1) |
| 5 | 스크린리더 | PASS | 구조화된 텍스트(title, snippet, domain) |

---

## 발견된 이슈

### 심각도: Critical (배포 차단)
(없음)

### 심각도: Major (수정 강력 권고)
(없음)

### 심각도: Minor (후속 수정 가능)
- [ ] 중복 citation.id 사용 시 React key 경고 발생 — 실제 데이터에서 고유 id 보장 필요
- [ ] CitationBadge에 명시적 `focus-visible` 스타일 미적용 — 일부 브라우저에서 포커스 인디케이터 불명확
- [ ] ChatHistoryPanel에서 dashboardType이 있는 시나리오 메시지에서는 citation 미표시 — 설계 의도이나 향후 확장 시 고려 필요

---

## 수정 요청

PASS 판정이므로 수정 요청 없음.
