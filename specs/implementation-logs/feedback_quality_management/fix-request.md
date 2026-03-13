# Fix Request: Feedback & Quality Management

## QA 판정: CONDITIONAL PASS
## 수정 사이클: 1/3

### 수정 항목

- [x] **[Major] 기간 필터를 피드백 테이블에도 적용** — `FeedbackQualityView.tsx:140-143`, `feedbackQualityData.ts:45-58`
  리서치 문서 AC-4: "기간 필터(7일/30일/90일)로 대시보드 전체 데이터를 필터링할 수 있음".
  현재 `period` state가 `getDailyQualityByPeriod`(차트)에만 전달되고, `filterFeedback`에는 기간 필터가 없음.
  수정 방향:
  - `filterFeedback` 함수에 기간 파라미터 추가 (또는 별도 날짜 필터링 함수)
  - `MOCK_FEEDBACK`의 `date` 필드를 기준으로 7일/30일/90일 필터링
  - `filteredFeedback` useMemo 의존성에 `period` 추가

- [x] **[Major] KPI 카드 그리드 반응형 적용** — `FeedbackQualityView.tsx:172`
  리서치 문서 AC-10: "반응형 레이아웃 (Tailwind responsive classes)".
  `grid grid-cols-4` 고정 → 모바일/태블릿에서 레이아웃 깨짐.
  수정 방향:
  - `grid-cols-2 lg:grid-cols-4` 또는 `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`로 변경
  - 헤더 영역의 flex 레이아웃도 필요시 반응형 처리 (`flex-col sm:flex-row`)
