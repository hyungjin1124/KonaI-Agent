# Plan: Feedback & Quality Management

## 파일 구조
| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| src/components/features/feedback-quality/feedbackQualityData.ts | 타입, Mock 데이터, 헬퍼 | 신규 |
| src/components/features/feedback-quality/FeedbackQualityView.tsx | 메인 컴포넌트 | 신규 |
| src/components/features/feedback-quality/FeedbackQualityView.test.tsx | 단위 테스트 | 신규 |
| src/components/features/feedback-quality/index.ts | Barrel export | 신규 |
| src/components/AdminView.tsx | 8번째 탭 추가 | 수정 |
| src/components/icons/index.ts | ThumbsUp/ThumbsDown 아이콘 추가 | 수정 |

## 상태 설계
- `period`: PeriodFilter ('7d' | '30d' | '90d', 기본값 '30d')
- `feedbackFilter`: FeedbackFilter ('all' | 'positive' | 'negative', 기본값 'all')
- `searchQuery`: string (피드백 검색)

## UI 구조
1. **헤더 영역**
   - 제목 + 설명 + 기간 필터 (7일/30일/90일)

2. **KPI 카드** (4열 그리드)
   - 전체 만족도 (ThumbsUp), 응답 품질 (Target), 총 피드백 (MessageSquare), 미해결 비율 (AlertCircle)
   - 각 카드: 값 + 트렌드 (전월 대비)

3. **품질 추이 차트**
   - Recharts LineChart (3개 라인: 만족도, 긍정, 부정)
   - ResponsiveContainer 래핑

4. **피드백 테이블**
   - 피드백 필터 (전체/긍정/부정) + 검색
   - 테이블: 사용자명, 응답요약, 피드백유형 배지, 상태 배지, 코멘트, 날짜
   - 푸터: 피드백 수

## Acceptance Criteria 매핑
| # | Criteria | 구현 위치 |
|---|----------|-----------|
| AC-1 | KPI 카드 (만족도, 품질, 피드백 수, 미해결) | KPI Cards 섹션 |
| AC-2 | 품질 추이 라인 차트 | Quality Trend Chart |
| AC-3 | 피드백 목록 테이블 | Feedback Table |
| AC-4 | 피드백 유형 필터 (긍정/부정) | Feedback Filter 버튼 |
| AC-5 | 피드백 검색 | Search Input |
| AC-6 | 기간 필터 (7d/30d/90d) | Period Filter |
| AC-7 | 피드백 유형 배지 (긍정 초록/부정 빨강) | FeedbackBadge 서브컴포넌트 |
| AC-8 | 상태 배지 (검토됨/대기/해결) | StatusBadge 서브컴포넌트 |
| AC-9 | Mock 데이터 20건 이상 | MOCK_FEEDBACK 25건 |
| AC-10 | data-testid 접근성 | 주요 요소 6+ testid |
| AC-11 | useState 기반 로컬 상태 | period, feedbackFilter, searchQuery |
