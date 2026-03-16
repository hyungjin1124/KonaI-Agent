# QA Report: Usage Monitoring Dashboard — Phase 2

## 판정: PASS

---

## Acceptance Criteria 검증

| # | Criteria | Dev 판정 | QA 판정 | 불일치 | 비고 |
|---|----------|---------|---------|--------|------|
| 1 | 에이전트별 비용 테이블 (5개, 정렬 가능) | PASS | PASS | - | 3개 필드(costUsd, totalTokens, activeUsers) 정렬 지원 |
| 2 | 에이전트 행: 토큰/비용/credit/사용자/스파크라인 | PASS | PASS | - | SparkLine: Recharts LineChart 80x24px |
| 3 | 팀 예산 (3팀, 75%/90% 색상 전환) | PASS | PASS | - | Engineering 62%(green), Sales 93%(red), Support 20%(green) |
| 4 | 90% 초과 시 NotificationContext 알림 | PASS | PASS | - | notifiedRef로 중복 방지, Sales 팀 트리거 확인 |
| 5 | Health Status Strip (상태 닷/레이턴시/에러율) | PASS | PASS | - | down 상태는 오프라인 라벨, 3/5 정상 카운트 |
| 6 | 사용자 테이블 (페이지네이션, 팀 필터, 정렬) | PASS | PASS | - | PAGE_SIZE=5, 필터 변경 시 페이지 리셋 |
| 7 | KPICard/ChartWidget/Recharts 재사용 | PASS | PASS | - | KPICard 4개, ChartWidget 4개, Recharts 다수 |
| 8 | 새 의존성 없이 구현 | PASS | PASS | - | package.json 미변경 확인 |

- Dev 일치율: 100%
- QA 독립 판정: 8/8 passed

---

## 엣지 케이스 테스트

| # | 시나리오 | 결과 | 심각도 | 상세 |
|---|---------|------|--------|------|
| 1 | 정렬 방향 토글 (같은 헤더 2회 클릭) | PASS | - | desc→asc→desc 순환 정상 |
| 2 | 정렬 필드 전환 시 desc 리셋 | PASS | - | 다른 필드 클릭 시 desc 기본값 |
| 3 | 토큰 기준 정렬 | PASS | - | |
| 4 | 페이지네이션 첫 페이지 prev 비활성 | PASS | - | disabled 속성 정상 |
| 5 | 페이지네이션 마지막 페이지 next 비활성 | PASS | - | |
| 6 | 페이지별 카운트 텍스트 정확성 | PASS | - | 1-5, 6-10, 11-12 |
| 7 | 팀 필터 변경 시 페이지 리셋 | PASS | - | setCurrentPage(1) 호출 확인 |
| 8 | 각 팀별 필터 결과 정확성 | PASS | - | 4개 팀(all + 3) 모두 정상 |
| 9 | 필터 결과 1페이지 이내일 때 페이지네이션 숨김 | PASS | - | Support(3명) 시 페이지네이션 미표시 |
| 10 | 진행률 바 width 100% 상한 | PASS | - | Math.min(percent, 100) |
| 11 | 중복 알림 방지 (re-render) | PASS | - | notifiedRef 패턴 |
| 12 | 알림 내용 정확성 (팀명, %) | PASS | - | Sales 93% 경고 |
| 13 | 예산 색상 임계값 정확성 | PASS | - | green/amber/red 3단계 |
| 14 | down 에이전트 latency 미표시 | PASS | - | 오프라인 라벨만 표시 |
| 15 | degraded 에이전트 yellow 닷 | PASS | - | |
| 16 | healthy/total 카운트 | PASS | - | 3/5 정상 |
| 17 | 비용 테이블 전체 값 검증 | PASS | - | 5개 에이전트 비용 정확 |
| 18 | 사용자 테이블 비용 정렬 | PASS | - | |

- 추가 테스트 작성: 18개 (UsageMonitoringView.qa.test.tsx)
- 통과: 18개, 실패: 0개

---

## UX 플로우 검증

### 콜백 배선 감사

| # | Provider/Component | 콜백 Prop | 연결 상태 | 심각도 | 비고 |
|---|-------------------|-----------|----------|--------|------|
| 1 | NotificationContext | addAnomaly | ✅ | - | TeamBudgetSection에서 정상 호출 |
| 2 | UsageMonitoringView | (standalone 컴포넌트 4개) | ✅ | - | Props 전달 없이 standalone 동작 |

- plan.md 통합 지점 대조: 3/3 연결 확인
  - UsageMonitoringView에 4개 섹션 추가 ✅
  - 섹션 순서 plan.md와 일치 ✅
  - NotificationContext 알림 트리거 ✅

### 이중 상태 동기화

이중 상태 패턴 없음. 모든 Phase 2 컴포넌트가 standalone(자체 로컬 state만 사용).

### 종료 상태 시나리오

| # | 시나리오 | 기대 동작 | 실제 동작 | 결과 | 심각도 |
|---|---------|----------|----------|------|--------|
| 1 | Support 팀 필터(3명, 1페이지) | 페이지네이션 숨김 | 페이지네이션 숨김 | PASS | - |
| 2 | 빈 필터 결과 가능성 | 빈 상태 메시지 표시 | 빈 tbody만 표시 | N/A | minor (현재 mock 데이터에서 발생 불가) |

### 핵심 사용자 플로우

#### Flow 1: 예산 경보 확인
```
[페이지 마운트] → [TeamBudgetSection useEffect] → [90%+ 필터] → [addAnomaly] → [NotificationContext 업데이트]
```
기대: Sales 팀 93% 경고 알림 1회
결과: PASS

#### Flow 2: 사용자 테이블 필터+정렬+페이지네이션
```
[팀 필터 클릭] → [handleTeamFilter] → [setTeamFilter + setCurrentPage(1)] → [filtered useMemo] → [UI 업데이트]
```
기대: 필터 변경 시 페이지 1로 리셋, 결과 수 정확
결과: PASS

#### Flow 3: 에이전트 비용 정렬 전환
```
[헤더 클릭] → [handleSort] → [같은 필드: dir 토글 / 다른 필드: desc 리셋] → [sorted useMemo] → [테이블 재렌더링]
```
기대: 정렬 방향 정확, 필드 전환 시 desc 기본값
결과: PASS

---

## 통합 테스트

- 컴포넌트 통합: PASS (HealthStatusStrip, AgentCostTable, TeamBudgetSection, UserUsageTable → UsageMonitoringView)
- 빌드 통합: PASS (Next.js build 성공, 18개 라우트 정상 생성)
- 타입 호환성: PASS (usage-monitoring 관련 TS 에러 0건, 기존 agent-chat 에러는 Phase 2와 무관)
- 단위 테스트: PASS (52/52 dev + 18/18 QA = 70개 전체 통과)

---

## 접근성 검증

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | ARIA 속성 | PASS | role="group", aria-label, aria-pressed, role="progressbar" 적절히 사용 |
| 2 | 키보드 접근성 | PASS (minor) | 정렬 헤더(th onClick)에 tabIndex/role 미설정 — 키보드 접근 불가 |
| 3 | 포커스 관리 | PASS | 모달 없는 단순 뷰 — 이슈 없음 |
| 4 | 색상 대비 | PASS (minor) | text-gray-400 + text-[10px] 조합은 대비 부족 가능 |

---

## 발견된 이슈

### 심각도: Critical (배포 차단)
없음

### 심각도: Major (수정 강력 권고)
없음

### 심각도: Minor (후속 수정 가능)
- [ ] **[A11y]** 정렬 가능 테이블 헤더(`th onClick`)에 `tabIndex={0}`, `role="button"`, `onKeyDown` 미설정 — 키보드 전용 사용자가 정렬 기능에 접근 불가 — AgentCostTable.tsx:79-103, UserUsageTable.tsx:93-108
- [ ] **[A11y]** `text-gray-400` + `text-[10px]` 보조 텍스트 조합이 WCAG AA 색상 대비 기준(4.5:1) 미달 가능 — 여러 파일의 보조 텍스트
- [ ] **[UX]** ChartWidget의 subtitle prop이 주석 처리되어 AgentCostTable의 `총 $2,847` subtitle이 렌더링되지 않음 — ChartWidget.tsx:47-48
- [ ] **[UX]** UserUsageTable에서 빈 필터 결과 시 빈 상태(empty state) 메시지 미구현 — UserUsageTable.tsx (현재 mock 데이터에서는 발생하지 않음)

---

## 수정 요청

PASS 판정이므로 수정 사이클 없음. Minor 이슈는 후속 개선 시 반영 권장.
