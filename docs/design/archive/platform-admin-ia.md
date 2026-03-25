# Information Architecture — Platform Administration

> 생성일: 2026-03-18
> 참조 리서치:
> - `research/task2-platform-admin/platform-admin-patterns.md` (Vercel/Supabase/Retool 비교)
> - `research/task2-platform-admin/tenant-lifecycle-ux-patterns.md` (테넌트 라이프사이클 UX)
> - `research/task2-platform-admin/ai-platform-admin-dashboard-patterns.md` (AI 플랫폼 대시보드 패턴)
> Status: Draft

---

## Current State

| 항목 | 내용 |
|------|------|
| **라우트** | `/admin` (AdminView → PlatformAdminView로 탭 전환) |
| **진입점** | `src/app/admin/page.tsx` → `src/components/AdminView.tsx` → `src/components/features/platform-admin/PlatformAdminView.tsx` |
| **구조** | 수평 탭 4개 (테넌트 관리 / 사용량 및 알림 / 과금·빌링 / 감사 로그) |
| **주요 컴포넌트** | `TenantManagementTab`, `UsageAlertTab`, `BillingTab`, `PlatformAuditLogTab` |
| **타입 정의** | `src/components/features/platform-admin/data/platformAdminTypes.ts` |
| **핵심 한계** | ① 테넌트 추가 버튼만 있고 실제 생성 위저드 없음 ② 상태 전환(Active/Suspended) UI 미구현 ③ 모델별 비용 분리 없음 ④ 에이전트 실행 트레이스 없음 ⑤ 리소스 제한이 읽기 전용 (수정 UI 없음) ⑥ TenantDetailPanel이 인라인 표시 (슬라이드 패널 아님) |

---

## Target State

플랫폼 운영자(코나체인 내부 팀)가 테넌트의 전체 라이프사이클(생성→운영→위험 관리→해지)을 단일 인터페이스에서 처리할 수 있어야 한다. AI 에이전트 플랫폼 특성에 맞게 에이전트 실행 트레이스·모델별 비용 분리·예측적 알림을 제공하고, 테넌트 생성 위저드와 상태 전환 플로우를 완성하여 운영 마찰을 제거한다.

---

## Menu Structure

```
/admin (Platform Administration)
├── 테넌트 관리 (tab: tenants)
│   ├── KPI 요약 카드 (4종)
│   ├── 필터 툴바 (상태, 검색, 뷰 전환)
│   ├── 헬스 카드 뷰 / 테이블 뷰
│   ├── [신규] 테넌트 생성 위저드 (풀페이지 모달, 4단계)
│   └── 테넌트 상세 슬라이드 패널
│       ├── 기본 정보 + [신규] 상태 전환 드롭다운
│       ├── API 키 관리
│       ├── 리소스 제한 + [신규] 수정 UI
│       └── [신규] 플랜 변경 슬라이드 패널
│
├── 활동 모니터링 (tab: activity)        ← [변경] 기존 "사용량 및 알림"에서 활동 관련만 분리
│   ├── KPI 카드 (API 호출 수, 활성 세션, 에이전트 실행 수, 평균 TTFT)
│   ├── 테넌트별 API 호출 추세 차트 (면적 차트)
│   ├── 토큰 소비 입·출력 차트 (바 차트)
│   ├── [신규] 에이전트 실행 트레이스 서브탭
│   │   ├── 상태 요약 (성공/실패/타임아웃 비율 도넛)
│   │   ├── [신규] 성능 메트릭 (TTFT P50/P95/P99, 평균 레이턴시)
│   │   ├── 트레이스 목록 테이블
│   │   └── 트레이스 상세 워터폴 (슬라이드 패널)
│   ├── [신규] 스킬별 사용 빈도 테이블
│   └── [신규] 사용량/활동 CSV 내보내기 버튼
│
├── 비용 관리 (tab: cost)                 ← [신규 탭] 기존 "사용량 및 알림"에서 비용 관련 분리
│   ├── KPI 카드 (총 비용, 전월 대비 변화율, 비용 효율, 예산 대비 소진율)
│   ├── [신규] 모델별 비용 분포 도넛 차트 (상위 5개 모델 + 기타)
│   ├── [신규] 일별 비용 스택 바 차트 (모델별 색상 구분)
│   ├── [신규] 비용 예측 차트 (실선: 실적, 점선: 예측, 파선: 예산)
│   ├── 테넌트별 비용 테이블 (토큰 소비, 비용, 제한% 포함)
│   └── [신규] 비용 데이터 CSV 내보내기 버튼
│
├── 알림 관리 (tab: alerts)               ← [신규 탭] 기존 "사용량 및 알림"에서 알림 분리
│   ├── 알림 규칙 목록 + 토글
│   │   └── [보강] 각 규칙에 다단계 임계치 명시 (50% → 75% → 100%)
│   │       ├── 임계치별 채널 설정 (이메일 / 인앱 / Slack / 웹훅)
│   │       └── 임계치별 액션 설정 (알림만 / 서비스 제한 / 자동 차단)
│   ├── [신규] 이상 감지 규칙 (비용 급증, 에러율 스파이크 자동 탐지)
│   └── 알림 이력 (기존 유지)
│
├── 과금·빌링 (tab: billing)              ← 기존 유지 (수익/청구 관점)
│   ├── 빌링 KPI 카드
│   ├── 월간 수익 추세 차트
│   ├── 플랜 분포 파이 차트
│   └── 테넌트별 청구 내역 테이블
│
└── 감사 로그 (tab: audit)
    ├── 감사 KPI 카드
    ├── 타임라인 뷰 / 테이블 뷰
    ├── 필터 (이벤트 유형, 심각도, 기간)
    └── CSV / JSON 내보내기
```

---

## Page Definitions

| 페이지/섹션 | 위치 | 목적 | 핵심 컴포넌트 | 데이터 소스 | 우선순위 |
|------------|------|------|--------------|------------|---------|
| 테넌트 관리 탭 | tab=tenants | 전체 테넌트 현황 조회 및 관리 | `TenantManagementTab`, `TenantHealthCard`, `TenantTableView` | mock | Implemented |
| 테넌트 생성 위저드 | 모달 (tab=tenants) | 신규 테넌트 4단계 생성 | `TenantCreateWizard` (신규) | mock | **Must** |
| 테넌트 상세 패널 | 슬라이드 패널 (tab=tenants) | 테넌트 상세 조회·수정·상태 전환 | `TenantDetailPanel` (확장) | mock | **Must** |
| 플랜 변경 패널 | 2차 슬라이드 패널 | 인라인 플랜 업/다운그레이드 | `PlanChangeSidePanel` (신규) | mock | Should |
| 활동 모니터링 탭 | tab=activity | API 활동·에이전트 실행 모니터링 | `ActivityMonitoringTab` (기존 UsageAlertTab 리팩토링) | mock | **Must** |
| 에이전트 트레이스 섹션 | tab=activity 내 서브탭 | 에이전트 실행 경로 + 성능 메트릭 | `AgentTraceSection` (신규) | mock | **Must** |
| 스킬 사용 분석 섹션 | tab=activity 내 | 스킬별 빈도·성능 테이블 | `SkillUsageTable` (신규) | mock | Should |
| 비용 관리 탭 | tab=cost | 모델별 비용·예측·예산 관리 | `CostManagementTab` (신규) | mock | **Must** |
| 비용 예측 차트 | tab=cost 내 | 월말 예상 비용 시각화 | `CostForecastChart` (신규) | mock | **Must** |
| 알림 관리 탭 | tab=alerts | 알림 규칙 CRUD + 이상 감지 + 이력 | `AlertManagementTab` (신규) | mock | **Must** |
| 과금·빌링 탭 | tab=billing | 수익·청구·결제 관리 | `BillingTab` | mock | Implemented |
| 감사 로그 탭 | tab=audit | 이벤트 타임라인·필터·내보내기 | `PlatformAuditLogTab` | mock | Implemented |

---

## Navigation Flow

### Primary Journey 1: 신규 테넌트 온보딩
1. `/admin` 진입 → 테넌트 관리 탭 (기본값)
2. 우상단 "테넌트 추가" 버튼 클릭 → `TenantCreateWizard` 풀페이지 모달 오픈
3. Step 1: 기본 정보 입력 (회사명, 도메인, 산업군, 담당자)
4. Step 2: 플랜 & 계약 선택 (Trial / Standard / Enterprise 카드 UI)
5. Step 3: 관리자 계정 설정 (이메일, 비밀번호 or 초대링크, SSO 토글)
6. Step 4: 초기 설정 (태그, 메모, 샘플 에이전트 배포 토글) — 스킵 가능
7. 생성 완료 → 테넌트 목록에 즉시 반영 + 상태 "Trial" 자동 설정

### Primary Journey 2: 테넌트 건강 이상 대응
1. 헬스 카드 뷰에서 "위험(danger)" 카드 확인
2. 카드 클릭 → `TenantDetailPanel` 슬라이드 패널 오픈
3. 상태 드롭다운에서 현재 상태 확인 → "Suspended"로 변경 선택
4. 확인 모달: 사유 선택(계약 위반/보안/기타) + 메모 입력
5. 저장 → 패널 내 상태 뱃지 즉시 업데이트 + 알림 발송 표시

### Primary Journey 3: 사용량 이상 감지 및 조치
1. 활동 모니터링 탭 → KPI 카드에서 평균 TTFT, 에이전트 실행 수 확인
2. 에이전트 트레이스 서브탭 → 성능 메트릭에서 P99 레이턴시 스파이크 확인
3. 트레이스 목록에서 실패/타임아웃 트레이스 클릭 → 워터폴 상세 패널
4. 원인 파악 후 → 알림 관리 탭으로 이동
5. 해당 메트릭의 알림 규칙 임계치 조정 (50%→75%→100% 단계별 채널/액션 설정)

### Primary Journey 4: 비용 이상 대응
1. 비용 관리 탭 → KPI 카드에서 "예산 대비 소진율" 확인
2. 모델별 비용 도넛 차트에서 비용 급증 모델 식별
3. 일별 비용 스택 바 차트에서 급증 시점 확인
4. 비용 예측 차트에서 월말 예상 초과 여부 확인
5. 알림 관리 탭 → 해당 테넌트의 비용 알림 규칙 확인/강화
6. 필요 시 테넌트 관리 탭 → 리소스 제한 조정 또는 상태 변경

### Secondary Journey: 월간 빌링 검토
1. 과금·빌링 탭 진입
2. KPI 카드에서 이번 달 수익/미수금 확인
3. 비용 예측 차트에서 월말 예상치 vs 예산 비교
4. 테넌트별 청구 내역 테이블에서 "unpaid" 필터 적용
5. 미납 테넌트 행 클릭 → 테넌트 상세 패널로 이동 (결제 독촉 메모 추가)

---

## Component Mapping

| UI 요소 | 기존 컴포넌트 | 신규/수정 여부 | 비고 |
|---------|-------------|-------------|------|
| 탭 네비게이션 | `src/components/ui/tabs.tsx` | **수정** | 4탭 → 6탭 확장 (activity, cost, alerts 추가) |
| KPI 카드 | `src/components/shared/atoms/KPICard.tsx` | 유지 | 각 탭별 KPI 카드에 재사용 |
| 테넌트 헬스 카드 | `.../TenantHealthCard.tsx` | **수정** | Suspended 상태 회색 오버레이 + 데이터 접근 범위 배지 추가 |
| 테넌트 테이블 뷰 | `.../TenantTableView.tsx` | 유지 | 현재 구현 적합 |
| 테넌트 상세 패널 | `.../TenantDetailPanel.tsx` | **수정** | 상태 전환 드롭다운 + Suspended 시 데이터 접근 정책 표시 + 리소스 제한 편집 UI |
| 테넌트 생성 위저드 | 없음 | **신규** | `TenantCreateWizard.tsx` — 4단계 풀페이지 모달 |
| 플랜 변경 패널 | 없음 | **신규** | `PlanChangeSidePanel.tsx` — 업그레이드 즉시/다운그레이드 사이클 종료 |
| 상태 전환 모달 | 없음 | **신규** | `StatusChangeModal.tsx` — 사유 선택 + 데이터 접근 범위 설정 |
| 활동 모니터링 탭 | `.../UsageAlertTab.tsx` | **리팩토링** | `ActivityMonitoringTab.tsx`로 이름 변경, 비용/알림 분리 |
| 에이전트 트레이스 섹션 | 없음 | **신규** | `AgentTraceSection.tsx` + `TraceWaterfallPanel.tsx` (TTFT P50/P95/P99 포함) |
| 스킬 사용 테이블 | 없음 | **신규** | `SkillUsageTable.tsx` |
| 비용 관리 탭 | 없음 | **신규** | `CostManagementTab.tsx` — 모델별 비용 + 예측 + 예산 |
| 모델별 비용 도넛 차트 | 없음 | **신규** | `ModelCostDonutChart.tsx` — Recharts PieChart |
| 비용 예측 차트 | 없음 | **신규** | `CostForecastChart.tsx` — 실적/예측/예산 3라인 |
| 알림 관리 탭 | 없음 | **신규** | `AlertManagementTab.tsx` — 다단계 임계치 규칙 CRUD + 이상 감지 |
| 알림 규칙 편집 모달 | 없음 | **신규** | `AlertRuleEditorModal.tsx` — 임계치별 채널/액션 매트릭스 설정 |
| 빌링 탭 | `.../BillingTab.tsx` | 유지 | 수익/청구 관점, 비용 예측은 cost 탭으로 이동 |
| 감사 로그 탭 | `.../PlatformAuditLogTab.tsx` | 유지 | 현재 구현 적합 |
| 확인 다이얼로그 | `src/components/ui/confirm-dialog.tsx` | 재사용 | 상태 전환, 키 폐기 등에 활용 |

---

## Data Requirements

| 엔티티 | 핵심 필드 | 소스 | 기존 타입 | 신규 타입 필요 |
|--------|----------|------|----------|--------------|
| Tenant | id, name, domain, plan, status, healthScore, metrics, apiKeys, resourceLimits, **suspendedDataPolicy** | mock | `platformAdminTypes.ts` | **수정** — `suspendedDataPolicy` 필드 추가 |
| TenantCreateInput | 위저드 4단계 입력 데이터 | mock | 없음 | **Yes** — `TenantCreateInput` |
| SuspendedDataPolicy | canExportData, canViewDashboard, canAccessApi, retentionDays | mock | 없음 | **Yes** — `SuspendedDataPolicy` |
| ModelCostBreakdown | modelName, cost, tokenCount, percentage | mock | 없음 | **Yes** — `ModelCostBreakdown` |
| AgentTrace | traceId, agentName, status, durationMs, tokenCount, cost, **ttftMs**, steps[] | mock | 없음 | **Yes** — `AgentTrace`, `TraceStep` |
| AgentPerformanceMetrics | avgTtftMs, p50TtftMs, p95TtftMs, p99TtftMs, avgLatencyMs, successRate | mock | 없음 | **Yes** — `AgentPerformanceMetrics` |
| SkillUsageStat | skillId, skillName, callCount, avgLatencyMs, successRate, avgCost | mock | 없음 | **Yes** — `SkillUsageStat` |
| CostForecast | date, actualCost, forecastedCost, budget | mock | 없음 | **Yes** — `CostForecastData` |
| AlertRule | id, name, enabled, **thresholds[]**, type | mock | `AlertRule` | **수정** — 다단계 임계치 구조로 확장 |
| AlertThreshold | percent, channels[], action | mock | 없음 | **Yes** — `AlertThreshold` |
| AnomalyDetectionRule | id, metricType, sensitivity, enabled, baselineWindow | mock | 없음 | **Yes** — `AnomalyDetectionRule` |
| PlatformAuditEvent | 기존 유지 | mock | `PlatformAuditEvent` | 없음 |

---

## Design Tokens

기존 Tailwind 설정 및 프로젝트 컬러 팔레트를 그대로 활용한다. 신규 추가 불필요.

| 토큰 | 값 | 용도 |
|------|-----|------|
| Primary | `#534AB7` | 버튼, 활성 상태 강조 |
| Success | `green-500 / green-100` | 정상 상태, 성공 트레이스 |
| Warning | `yellow-500 / yellow-50` | 주의 상태, 경고 알림 |
| Danger | `red-500 / red-50` | 위험 상태, 실패 트레이스 |
| Info | `blue-500 / blue-50` | 정보성 알림, Trial 뱃지 |
| Neutral | `gray-100 ~ gray-900` | 텍스트, 보더, 배경 |

---

## Acceptance Criteria

### Phase 1 — 테넌트 생성 위저드 (Must Have)
- [ ] "테넌트 추가" 버튼 클릭 시 풀페이지 모달 오픈
- [ ] Step 1~3 필수 필드 미입력 시 "다음" 버튼 비활성화
- [ ] Step 4는 "건너뛰기" 버튼으로 스킵 가능
- [ ] 생성 완료 후 테넌트 목록에 즉시 카드 추가 (optimistic update)
- [ ] 도메인 중복 시 인라인 에러 메시지 표시

### Phase 2 — 상태 전환 플로우 + Suspended 데이터 정책 (Must Have)
- [ ] TenantDetailPanel에 상태 드롭다운 표시 (Active / Trial / Suspended / Inactive)
- [ ] 상태 변경 선택 시 확인 모달 표시 (사유 선택 필수)
- [ ] Suspended 전환 시 데이터 접근 범위 설정 UI 표시:
  - [ ] 대시보드 읽기 전용 접근 허용 여부 토글
  - [ ] 데이터 내보내기(CSV/API) 허용 여부 토글
  - [ ] API 호출 차단 여부 토글
  - [ ] 데이터 보존 기간 표시 (기본 90일)
- [ ] 변경 후 헬스 카드 및 테이블 뷰 상태 뱃지 즉시 업데이트
- [ ] Suspended 상태 테넌트는 헬스 카드에 회색 오버레이 + 데이터 정책 배지 표시

### Phase 3 — 에이전트 트레이스 + 성능 메트릭 (Must Have)
- [ ] 활동 모니터링 탭에 "에이전트 트레이스" 서브탭 추가
- [ ] 성능 메트릭 요약 카드: TTFT P50/P95/P99, 평균 레이턴시, 성공률
- [ ] 트레이스 목록: 에이전트명, 상태(✅/❌/⏰), TTFT, 실행 시간, 토큰 수, 비용 표시
- [ ] 트레이스 행 클릭 시 워터폴 다이어그램 슬라이드 패널 오픈
- [ ] 워터폴: LLM 호출 단계 / 도구 호출 단계를 색상으로 구분, 각 단계에 레이턴시 표시
- [ ] 상태 요약 도넛 차트 (성공/실패/타임아웃 비율)

### Phase 4 — 비용 관리 탭 (Must Have)
- [ ] 비용 관리 탭 신규 추가 (tab=cost)
- [ ] KPI 카드: 총 비용, 전월 대비 변화율, 비용 효율(토큰당 비용), 예산 대비 소진율
- [ ] 모델별 비용 도넛 차트 (상위 5개 모델 + 기타)
- [ ] 일별 비용 스택 바 차트 (모델별 색상 구분)
- [ ] 비용 예측 차트 (실선: 실적, 점선: 예측, 파선: 예산)
- [ ] 예산 초과 예상 시 인라인 경고 표시
- [ ] 비용 데이터 CSV 내보내기 버튼

### Phase 5 — 알림 관리 탭 (Must Have)
- [ ] 알림 관리 탭 신규 추가 (tab=alerts)
- [ ] 알림 규칙 목록: 규칙명, 대상 메트릭, 활성 토글
- [ ] 규칙 생성/편집 모달:
  - [ ] 다단계 임계치 설정 (예: 50% → 75% → 100%)
  - [ ] 각 임계치별 채널 선택 (이메일 / 인앱 / Slack / 웹훅)
  - [ ] 각 임계치별 액션 선택 (알림만 / 서비스 제한 / 자동 차단)
  - [ ] 웹훅 URL 입력 필드 (웹훅 선택 시)
- [ ] 이상 감지 규칙 섹션: 메트릭 유형, 감도, 기준선 윈도우 설정
- [ ] 알림 이력 목록 (기존 유지)

### Phase 6 — 리소스 제한 편집 (Should Have)
- [ ] TenantDetailPanel 리소스 제한 탭에서 각 항목 클릭 시 인라인 편집 모드 전환
- [ ] Hard Limit(자동 차단) + Soft Limit(경고만) 이중 임계치 UI
- [ ] 저장 버튼 클릭 시 변경 내역 타임라인에 기록

---

## Open Questions

1. **테넌트 상세 패널 표시 방식**: 현재는 인라인 표시. 슬라이드 오버 패널로 전환 시 레이아웃 변경 범위가 크다. 인라인 유지(수정만) vs 슬라이드 패널 전환 중 어느 방향이 적합한지 팀 확인 필요.

2. **에이전트 트레이스 데이터 모델**: 실제 에이전트 실행 로그가 어떤 형식으로 생성되는지 백엔드 스펙이 확정되지 않았다. 현 단계에서는 mock 데이터로 UI만 구현하고, 추후 API 연동 시 타입 조정 필요. TTFT 메트릭은 프록시/게이트웨이 레벨에서 수집 가능한지 백엔드 확인 필요.

3. **플랜 변경 즉시 적용 vs 사이클 종료 적용**: 업그레이드는 즉시, 다운그레이드는 다음 사이클 종료 시 적용하는 것이 업계 표준이나, 코나체인의 계약 구조(월정액 vs 사용량 기반)에 따라 정책이 달라질 수 있다. 비즈니스 팀 확인 필요.

4. **테넌트 관리자 뷰(셀프서비스 포털) 범위**: 리서치에서 제안된 테넌트 관리자 포털(고객사가 직접 접근)은 별도 라우트가 필요하다. 현재 `/admin`의 범위를 벗어나므로 별도 IA 문서로 분리할지 여부 확인 필요.

5. **Hard Limit 차단 로직**: OpenAI/Anthropic은 모델 레벨에서 API 호출을 차단한다. 코나체인 플랫폼의 프록시/게이트웨이 구조에서 이 차단 로직이 구현 가능한지 확인 필요. Phase 6의 Hard/Soft Limit 이중 임계치 UI 설계에 직접 영향.

6. **Suspended 테넌트 데이터 접근 정책 기본값**: Phase 2에서 Suspended 전환 시 데이터 접근 범위를 설정하도록 했는데, 기본값을 "읽기+내보내기 허용 / API 차단"으로 할지, 비즈니스 팀과 법무 팀 확인 필요. 리서치에서는 윤리적 관점에서 최소한 내보내기는 허용할 것을 권장.

7. **6탭 구조 검증**: 기존 4탭에서 6탭(활동, 비용, 알림 분리)으로 확장했는데, 탭이 많아지면 모바일/소형 화면에서 탭 바가 overflow될 수 있다. 드롭다운 또는 "더보기" 패턴이 필요한지, 아니면 데스크톱 전용으로 한정할지 확인 필요.

8. **이상 감지 구현 범위**: Phase 5 알림 관리에 이상 감지 규칙을 포함했는데, ML 기반 자동 감지는 백엔드 의존도가 높다. 현 단계에서는 "이전 N일 평균 대비 X% 초과" 같은 규칙 기반으로 시작하고, ML 기반은 후속으로 분리할지 확인 필요.
