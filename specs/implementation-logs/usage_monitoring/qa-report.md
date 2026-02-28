# QA Report: Usage Monitoring Dashboard

## 판정: CONDITIONAL PASS

---

## Acceptance Criteria 검증

| # | Criteria | Dev 판정 | QA 판정 | 불일치 | 비고 |
|---|----------|---------|---------|--------|------|
| 1 | Admin "Usage" 탭 추가 | PASS | PASS | - | AdminView.tsx:315-317 TabsTrigger + :357-359 TabsContent 확인 |
| 2 | KPI 카드 4종 + 전주 대비 증감 | PASS | PASS | - | UsageMonitoringView.tsx:62-96 — 4개 KPICard에 value, change, trend, subtitle 모두 전달 |
| 3 | 일별 토큰/비용 추이 (30일+) | PASS | PASS | - | 기본값 30d, ComposedChart(Bar+Line) 이중 Y축. 30/7/90일 데이터 정합성 확인 |
| 4 | 에이전트 유형별 분포 차트 | PASS | PASS | - | 수평 BarChart, 4개 에이전트(PPT/분석/채팅/데이터) |
| 5 | react-grid-layout + localStorage | PARTIAL | FAIL | ⚠️ | react-grid-layout/localStorage 전혀 미사용. CSS Grid 정적 레이아웃. plan.md에서 Phase 2 연기로 명시했으나, 원문 AC 기준 FAIL |
| 6 | KPICard/ChartWidget 재사용 | PASS | PASS | - | shared/atoms/KPICard, shared/molecules/ChartWidget import 확인 |
| 7 | mock 데이터 정상 렌더링 | PASS | PASS | - | 23개 단위 테스트 전체 PASS |
| 8 | 반응형 레이아웃 | PASS | PASS | - | grid-cols-1/2/4 + ResponsiveContainer 사용 |

- Dev 일치율: 7/8 (87.5%)
- QA 독립 판정: 7/8 passed

**AC5 불일치 상세**: Dev는 "Phase 2 연기"로 PARTIAL 판정. QA는 원문 AC("react-grid-layout 기반으로 위젯 배치가 가능하며, 레이아웃이 localStorage에 저장된다")를 기준으로 FAIL 판정. 다만 plan.md에서 의도적 설계 결정으로 연기했으므로 전체 판정에서는 CONDITIONAL PASS로 처리.

---

## 엣지 케이스 테스트

| # | 시나리오 | 결과 | 심각도 | 상세 |
|---|---------|------|--------|------|
| 1 | 빈 데이터 (getDailyUsageByPeriod → []) | WARN | major | 현재 mock 데이터로 빈 배열 불가. API 전환 시 빈 차트 영역만 표시되고 "데이터 없음" 메시지 없음 |
| 2 | 90일 대량 데이터 (90 data points) | PASS | minor | barSize=6, interval=6으로 적절 대응. 성능 이슈 없음 |
| 3 | 긴 텍스트 (모델명) | PASS | minor | `truncate` CSS 적용 확인 (UsageMonitoringView.tsx:241) |
| 4 | KPI value undefined | WARN | major | KPICard에서 `{value && (...)}` 조건 렌더. undefined 시 빈 카드 표시 (크래시 없으나 UX 불량) |
| 5 | 빠른 연속 클릭 (기간 필터) | PASS | minor | 동기적 상태 변경, React 18 자동 배칭. 경쟁 조건 없음 |
| 6 | 기간 전환 데이터 정합성 | PASS | minor | getDailyUsageByPeriod 순수 함수, slice 기반 일관성 확인 |
| 7 | 컴포넌트 언마운트 | PASS | minor | useEffect 없음, 구독 없음. 정리 불필요 |
| 8 | Tooltip formatter 타입 안전성 | PASS | minor | "토큰" 명시 처리, 나머지 $ 포맷. 현재 데이터로 정상 |
| 9 | Math.random() 비결정적 데이터 | WARN | major | 매 페이지 로드 시 다른 차트 데이터. KPI 합산값과 차트 데이터 불일치 가능 |

- 추가 테스트 작성: 해당 없음 (QA 테스트 파일 별도 작성 불필요 — 주요 이슈가 코드 변경 필요 사항이지 테스트로 검증 가능한 사항이 아님)
- 분석 항목: 9개, 이슈 발견: 3개 (0 critical, 3 major)

---

## UX 플로우 검증

### 콜백 배선 감사

| # | Provider/Component | 콜백 Prop | 연결 상태 | 심각도 | 비고 |
|---|-------------------|-----------|----------|--------|------|
| 1 | AdminView → UsageMonitoringView | (standalone, no props) | ✅ | - | plan.md 설계 의도 일치 |
| 2 | UsageMonitoringView → KPICard (×4) | title, value, change, trend, icon, subtitle | ✅ | - | 6개 필수 props 모두 전달 |
| 3 | UsageMonitoringView → KPICard | onClick (optional) | 미연결 | Low | Phase 1에서 display-only. 의도적 미연결 |
| 4 | UsageMonitoringView → ChartWidget (일별) | title, subtitle, height, insightSummary, insightDetail, expandTestId | ✅ | - | 전체 props 전달 |
| 5 | UsageMonitoringView → ChartWidget (에이전트) | insightDetail | ❌ | Medium | insightSummary는 있으나 insightDetail 누락. 클릭 시 빈 오버레이 |
| 6 | UsageMonitoringView → ChartWidget (모델비용) | insightDetail | ❌ | Medium | 위와 동일 |
| 7 | UsageMonitoringView → ChartWidget | headerRight (optional) | 미연결 | Low | Phase 1에서 불필요 |

- plan.md 통합 지점 대조: 6/6 연결 확인 (AdminView 탭, KPICard import, ChartWidget import, Recharts 사용, barrel export, AdminView import)

### 이중 상태 동기화

| # | 상태 A | 상태 B | A→B 경로 | B→A 경로 | 결과 |
|---|--------|--------|---------|---------|------|
| 1 | AdminView: searchQuery | UsageMonitoringView: period | 없음 (독립) | 없음 (독립) | ✅ |
| 2 | AdminView: users | UsageMonitoringView: KPI 데이터 | 없음 (독립) | 없음 (독립) | ✅ |

이중 상태 이슈 없음. 모든 상태가 적절히 격리됨.

### 종료 상태 시나리오

| # | 시나리오 | 기대 동작 | 실제 동작 | 결과 | 심각도 |
|---|---------|----------|----------|------|--------|
| 1 | 탭 전환 시 언마운트 | 깨끗한 언마운트 | Radix Tabs forceMount 미사용, 정상 언마운트 | PASS | - |
| 2 | 탭 재진입 시 상태 초기화 | period → 30d (기본값) | 재마운트 시 useState 기본값 복원 | PASS | - |
| 3 | 인사이트 오버레이 중 탭 전환 | 오버레이 정리 | 언마운트로 자동 정리 | PASS | - |
| 4 | insightDetail 없는 차트에서 인사이트 클릭 | 상세 내용 표시 또는 클릭 불가 | 빈 오버레이 표시 (헤더+버튼만, 본문 없음) | ISSUE | Medium |

### 핵심 사용자 플로우

#### Flow 1: Admin → Usage 탭 진입
```
[사용자] "사용량" 탭 클릭 → [Radix Tabs] value="usage" 설정 →
[TabsContent] UsageMonitoringView 마운트 → [useState] period='30d' →
[getDailyUsageByPeriod] 30일 데이터 반환 → [렌더] KPI 4개 + 차트 3개 표시
```
기대: 전체 대시보드 즉시 표시
결과: **PASS**

#### Flow 2: 기간 필터 전환 (30d → 7d)
```
[사용자] "7일" 버튼 클릭 → [onClick] setPeriod('7d') →
[리렌더] getDailyUsageByPeriod('7d') → 7일 데이터 →
[ComposedChart] barSize=24, interval=0 → [aria-pressed] "7일"=true
```
기대: 7일 차트로 전환, 활성 버튼 변경
결과: **PASS**

#### Flow 3: 인사이트 확장/축소 (일별 트렌드)
```
[사용자] 인사이트 푸터 클릭 → [ChartWidget] setShowInsight(true) →
[렌더] 오버레이 표시 (제목+상세+확인) → [사용자] X/확인 클릭 →
[stopPropagation] setShowInsight(false) → [렌더] 오버레이 제거
```
기대: 상세 분석 오버레이 표시 후 닫기
결과: **PASS** (일별 트렌드는 insightDetail 제공됨)

---

## 통합 테스트

- 컴포넌트 통합: **PASS** (AdminView ↔ UsageMonitoringView 연동 확인, KPICard/ChartWidget 공유 컴포넌트 재사용 확인)
- 빌드 통합: **PASS** (`npm run build` 성공, 13개 정적 페이지 생성)
- 타입 호환성: **PASS** (usage-monitoring 코드에 타입 에러 0건. 기존 LiveboardView/scenario hooks에 사전 존재 에러 8건 있으나 무관)
- 단위 테스트: **PASS** (23/23 통과)

---

## 접근성 검증

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | ARIA: 기간 필터 그룹 | PASS | `role="group"` + `aria-label="기간 선택"` |
| 2 | ARIA: 버튼 pressed 상태 | PASS | `aria-pressed={period === opt.value}` |
| 3 | 키보드: 기간 버튼 접근 | PASS | native `<button>` 사용 |
| 4 | 키보드: 기간 버튼 포커스 링 | FAIL | `focus-visible:` 클래스 미적용. 커스텀 버튼에 포커스 인디케이터 없음 |
| 5 | 키보드: 인사이트 푸터 접근 | FAIL | `<div onClick>` 사용 — 비포커스 요소. 키보드 사용자 접근 불가 (ChartWidget 공유 컴포넌트 이슈) |
| 6 | 색상 대비: KPI subtitle | FAIL | `text-[10px] text-gray-400` on white — 대비율 ~2.7:1, WCAG AA 4.5:1 미달 (KPICard 공유 컴포넌트 이슈) |
| 7 | 스크린리더: 차트 ARIA | FAIL | Recharts SVG에 aria-label 없음. 차트 내용이 스크린리더에 전달되지 않음 |
| 8 | 색상만 의존: 파이 차트 | FAIL | 세그먼트 구분이 색상만으로 이루어짐 (범례 텍스트는 있으나 차트 자체에 라벨 없음) |
| 9 | 모션 감소: 애니메이션 | FAIL | `animate-fade-in-up`에 `prefers-reduced-motion` 미적용 |

접근성 종합: **FAIL** (6/9 항목 실패)
- 단, #5/#6/#9는 공유 컴포넌트(ChartWidget, KPICard) 및 전역 CSS 이슈로, usage_monitoring 직접 코드 수정 범위 밖
- #4는 UsageMonitoringView 직접 코드에서 수정 가능
- #7/#8은 Recharts 특성상 별도 aria-label 래퍼 필요

---

## 발견된 이슈

### 심각도: Critical (배포 차단)
(없음)

### 심각도: Major (수정 강력 권고)
- [ ] **insightDetail 누락 (에이전트/모델 차트)** — UsageMonitoringView.tsx:172,207 — insightSummary만 제공하고 insightDetail 미제공. 클릭 시 빈 오버레이 표시. 사용자에게 "클릭 가능" 어포던스를 주고 빈 내용을 보여주는 UX 문제.

### 심각도: Minor (후속 수정 가능)
- [ ] 기간 필터 버튼에 `focus-visible:ring` 미적용 — UsageMonitoringView.tsx:49
- [ ] Math.random() 비결정적 mock 데이터 — usageMonitoringData.ts:59 — KPI 합산값과 차트 데이터 불일치 가능
- [ ] 빈 데이터 상태 UI 미구현 — API 전환 시 필요
- [ ] Recharts 차트에 aria-label 미적용 — 스크린리더 접근성
- [ ] AC5 (react-grid-layout + localStorage) Phase 2 연기 — 원문 AC 미충족이나 의도적 설계 결정

---

## 수정 요청

CONDITIONAL PASS — Major 이슈 1건에 대한 수정 필요:

| # | 수정 항목 | 관련 파일 | 심각도 | 설명 |
|---|----------|----------|--------|------|
| 1 | 에이전트 분포/모델 비용 차트에 insightDetail 추가 | UsageMonitoringView.tsx:172,207 | major | insightSummary가 있는 ChartWidget에 insightDetail도 제공하여 빈 오버레이 방지. 또는 insightDetail이 없으면 ChartWidget에서 클릭을 비활성화하는 방식도 가능 |
