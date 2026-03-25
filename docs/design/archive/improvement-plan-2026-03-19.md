# Admin & Platform Admin 개선 계획

**작성일**: 2026-03-19
**근거**: UX Review 2차 검증 결과 + 사용자 피드백
**리포트 출처**:
- `reports/admin/ux-review-2026-03-19-2.md`
- `reports/admin/ux-priority-2026-03-19-2.md`
- `reports/platform-admin/ux-review-2026-03-19-2.md`
- `reports/platform-admin/ux-priority-2026-03-19-2.md`

---

## Phase 1: 즉시 수정 (Quick Wins + 사용자 요청)

예상 소요: **1일**

### 1-1. Admin — AI 품질관리 탭에서 "프롬프트 조회" 서브탭 제거

**사용자 요청**: 시스템 프롬프트를 클라이언트에게 보여줄 필요 없음 → 프롬프트 조회 서브탭 아예 제거

**변경 내용**:
- `AIQualitySummaryTab.tsx`에서 서브탭 토글 UI 제거
- `PromptManagementView` import 및 렌더링 제거
- `FeedbackSummaryView`만 직접 렌더링 (서브탭 없이 단일 뷰)
- 제목/설명 텍스트를 "AI 피드백 현황" 등으로 변경

**수정 파일**:
```
src/components/features/ai-quality/AIQualitySummaryTab.tsx
```

**변경 전**:
```tsx
// 서브탭: prompts | feedback
// PromptManagementView mode="user" 렌더링
```

**변경 후**:
```tsx
// 서브탭 없이 FeedbackSummaryView만 렌더링
// PromptManagementView 관련 코드 전부 제거
```

**참고**: PlatformAIQualityTab(Platform Admin용)은 mode="admin"으로 프롬프트 관리 기능을 계속 유지. 여기는 플랫폼 관리자 전용이므로 프롬프트 CRUD가 필요.

**예상 공수**: 30분

---

### 1-2. Admin — 이메일 중복 검증

**출처**: 프로덕션 즉시 위험 #1

**변경 내용**:
- `UserFormModal.tsx`에서 이메일 입력 시 기존 사용자 목록과 중복 체크
- 중복 시 에러 메시지 "이미 등록된 이메일입니다" 표시
- 제출 버튼 비활성화

**수정 파일**:
```
src/components/AdminView.tsx (사용자 목록을 모달에 전달)
src/components/features/admin/UserFormModal.tsx (중복 검증 로직)
```

**예상 공수**: 1시간

---

### 1-3. Platform Admin — Quick Wins 4개

#### a) KPI 동적 계산

**변경 내용**:
- `TENANT_KPI` 하드코딩 제거
- `MOCK_TENANTS` 배열에서 total, healthy, warning, danger 수를 동적 계산
- apiKeys도 tenants의 apiKeys 배열에서 합산

**수정 파일**:
```
src/components/features/platform-admin/data/tenantData.ts
src/components/features/platform-admin/components/TenantManagementTab.tsx
```

**예상 공수**: 1시간

#### b) AlertRuleEditorModal — target 필드 UI 노출

**변경 내용**:
- `target: 'all' as const` 하드코딩 → 드롭다운 UI로 선택 가능하게
- 옵션: "전체(all)" / 개별 테넌트 선택

**수정 파일**:
```
src/components/features/platform-admin/components/AlertRuleEditorModal.tsx
```

**예상 공수**: 30분

#### c) API 키 복사 핸들러

**변경 내용**:
- "복사" 버튼에 `navigator.clipboard.writeText(key.keyPrefix + '...')` 연결
- 토스트 메시지: "API 키가 클립보드에 복사되었습니다"
- "재발급" 버튼에 ConfirmDialog 연결

**수정 파일**:
```
src/components/features/platform-admin/components/TenantDetailPanel.tsx
```

**예상 공수**: 1시간

#### d) 데이터 신선도 표시

**변경 내용**:
- 각 탭 상단에 "마지막 업데이트: {timestamp}" 표시
- 현재 Audit Log만 있는 패턴을 다른 탭에도 적용

**수정 파일**:
```
src/components/features/platform-admin/components/TenantManagementTab.tsx
src/components/features/platform-admin/components/ActivityMonitoringTab.tsx
src/components/features/platform-admin/components/CostManagementTab.tsx
src/components/features/platform-admin/components/AlertManagementTab.tsx
src/components/features/platform-admin/components/BillingTab.tsx
```

**예상 공수**: 1시간

---

## Phase 2: 핵심 신규 기능 (사용자 명시 요청)

예상 소요: **3–4일**

### 2-1. Platform Admin — Conversations(대화 모니터링) 탭

**사용자 요청**: 테넌트별로 어떤 대화가 이뤄지고 있는지 확인

**설계 방향**:
- 기존 `ActivityMonitoringTab`의 에이전트 트레이스와는 별개
- 실제 사용자-에이전트 간 대화 세션 레벨 추적

**신규 타입** (platformAdminTypes.ts에 추가):
```typescript
interface ConversationSummary {
  conversationId: string;
  tenantId: string;
  tenantName: string;
  userId: string;
  userName: string;
  agentName: string;
  startedAt: string;       // ISO timestamp
  lastMessageAt: string;
  messageCount: number;
  status: 'active' | 'completed' | 'abandoned';
  avgResponseTimeSec: number;
  tokenCount: number;
  topic?: string;           // 자동 분류 (선택)
  satisfactionScore?: number; // 1-5 (피드백 연결)
}

interface ConversationKPI {
  activeConversations: number;
  totalToday: number;
  avgMessagesPerConversation: number;
  avgResponseTimeSec: number;
  completionRate: number;    // completed / total %
}
```

**신규 컴포넌트**:
```
src/components/features/platform-admin/components/ConversationsTab.tsx
```

**UI 구성**:
1. KPI 카드 5개 (활성 대화, 오늘 총 대화, 평균 메시지 수, 평균 응답시간, 완료율)
2. 테넌트 필터 드롭다운
3. 대화 목록 테이블 (테넌트, 사용자, 에이전트, 시작시간, 메시지 수, 상태, 응답시간)
4. 대화 클릭 → 슬라이드오버에서 메시지 타임라인 (보안 고려하여 요약만 표시)

**Mock 데이터**:
```
src/components/features/platform-admin/data/conversationData.ts
```

**PlatformAdminView 변경**:
- PA_TABS에 `'conversations'` 추가
- 탭 트리거 추가 (MessageCircle 아이콘 + "대화 모니터링")
- TabsContent 추가

**예상 공수**: 8–10시간

---

### 2-2. Platform Admin — Errors(에러 대시보드) 탭

**사용자 요청**: 테넌트별 어떤 에러가 있는지 확인

**신규 타입** (platformAdminTypes.ts에 추가):
```typescript
type ErrorCategory = 'timeout' | 'validation' | 'permission' | 'rate_limit'
  | 'model_error' | 'internal' | 'network' | 'unknown';

type ErrorSeverity = 'critical' | 'warning' | 'info';

interface PlatformError {
  errorId: string;
  tenantId: string;
  tenantName: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  endpoint: string;
  model?: string;
  occurredAt: string;       // ISO timestamp
  userId?: string;
  conversationId?: string;  // 관련 대화 연결
  stackTrace?: string;
  resolved: boolean;
}

interface ErrorKPI {
  totalErrors24h: number;
  criticalCount: number;
  topCategory: ErrorCategory;
  errorRateTrend: 'increasing' | 'stable' | 'decreasing';
  affectedTenants: number;
}

interface ErrorRateTimeSeries {
  timestamp: string;
  total: number;
  byCategory: Record<ErrorCategory, number>;
}
```

**신규 컴포넌트**:
```
src/components/features/platform-admin/components/ErrorDashboardTab.tsx
```

**UI 구성**:
1. KPI 카드 (24시간 에러, Critical 수, 최빈 에러 유형, 추세, 영향 테넌트)
2. 에러율 시계열 차트 (Recharts AreaChart, 시간별)
3. 에러 유형별 분포 (BarChart)
4. 테넌트 필터 + 카테고리 필터 + 기간 필터
5. 에러 목록 테이블 (시간, 테넌트, 유형, 심각도, 메시지, 상태)
6. 에러 클릭 → 상세 슬라이드오버 (스택 트레이스, 관련 대화, 관련 트레이스)

**Mock 데이터**:
```
src/components/features/platform-admin/data/errorData.ts
```

**예상 공수**: 10–12시간

---

### 2-3. Platform Admin — Feedback(피드백 모니터링) 탭

**사용자 요청**: 테넌트별 어떤 피드백이 있는지 확인

**설계 참고**: 기존 `feedback-quality/feedbackQualityData.ts`에 `FeedbackItem`, `ConversationContext` 타입이 이미 존재. 이를 확장하여 테넌트별 필터링 추가.

**신규 타입** (platformAdminTypes.ts에 추가):
```typescript
interface PlatformFeedbackItem {
  feedbackId: string;
  tenantId: string;
  tenantName: string;
  userId: string;
  userName: string;
  conversationId: string;
  type: 'positive' | 'negative' | 'neutral';
  rating?: number;          // 1-5
  comment: string;
  category?: string;        // '응답 품질' | '속도' | '정확성' | '기타'
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  respondedAt?: string;
  responseNote?: string;
}

interface FeedbackKPI {
  totalFeedback30d: number;
  avgRating: number;
  positiveRate: number;     // %
  pendingCount: number;
  topIssueCategory: string;
}
```

**신규 컴포넌트**:
```
src/components/features/platform-admin/components/FeedbackMonitoringTab.tsx
```

**UI 구성**:
1. KPI 카드 (총 피드백, 평균 평점, 긍정률, 미답변 수, 주요 이슈)
2. 감정 분포 차트 (PieChart: 긍정/중립/부정)
3. 피드백 추이 차트 (AreaChart: 일별 피드백 수 + 평균 평점)
4. 테넌트 필터 + 감정 필터 + 상태 필터 + 평점 필터
5. 피드백 목록 테이블 (시간, 테넌트, 사용자, 평점, 감정, 코멘트 요약, 상태)
6. 피드백 클릭 → 상세 (전체 코멘트, 관련 대화 링크, 대응 노트 입력)

**Mock 데이터**:
```
src/components/features/platform-admin/data/feedbackData.ts
```

**예상 공수**: 10–12시간

---

### 2-4. PlatformAdminView 탭 재구성

**변경**: 기존 7개 + 신규 3개 = 10개 탭이 되므로 그룹핑 적용

**제안 구조** (탭 순서):
```
Operations
├─ 테넌트 관리        (tenants)        [기존]
├─ 대화 모니터링      (conversations)  [신규]
├─ 에러 대시보드      (errors)         [신규]
├─ 활동 모니터링      (activity)       [기존]
├─ 알림 관리         (alerts)         [기존]

Business Intelligence
├─ 비용 관리         (cost)           [기존]
├─ 과금/빌링         (billing)        [기존]
├─ 감사 로그         (audit)          [기존]

Quality & Customer
├─ 피드백 모니터링    (feedback)       [신규]
├─ AI 품질 관리      (ai-quality)     [기존]
```

**구현 방식**: TabsList 내에 시각적 구분자(divider 또는 섹션 레이블)를 추가. 탭 자체는 flat 구조 유지.

**수정 파일**:
```
src/components/features/platform-admin/PlatformAdminView.tsx
```

**예상 공수**: 2시간

---

## Phase 3: 나머지 Quick Wins & 접근성 (Admin + Platform Admin)

예상 소요: **1–2일**

### 3-1. Admin Quick Wins

| # | 항목 | 파일 | 공수 |
|---|------|------|------|
| 1 | 페이지네이션 aria-label 추가 | AdminView.tsx | 0.5h |
| 2 | 필터 초기화 버튼 | AdminView.tsx | 0.5h |
| 3 | CSV 다운로드 aria-label | UsageMonitoringView.tsx | 0.2h |
| 4 | 감사 로그 CSV 헤더 한글 통일 | AuditLogView.tsx | 0.5h |
| 5 | 권한 설정 초기화/저장 버튼 순서 변경 | PermissionSettingsView.tsx | 0.5h |
| 6 | 테이블 열 정렬 (이름/부서/접속) | AdminView.tsx | 1.5h |

### 3-2. Platform Admin 잔여 항목

| # | 항목 | 파일 | 공수 |
|---|------|------|------|
| 1 | API 키 발급 모달 (이름/스코프/만료일) | 신규 + TenantDetailPanel.tsx | 4h |
| 2 | "청구서 일괄 발행" 핸들러 | BillingTab.tsx | 4h |
| 3 | ARIA 라벨 일괄 보강 | 전체 탭 컴포넌트 | 4h |
| 4 | 통화 불일치 수정 ($ → KRW 통일) | CostManagementTab.tsx, BillingTab.tsx | 2h |

---

## Phase 4: 구조/운영 부채 (후속 스프린트)

### 4-1. 탭 간 공통 필터 컨텍스트

```
src/components/features/platform-admin/context/PlatformAdminContext.tsx
```
- 테넌트 필터, 기간 필터를 Context로 공유
- 탭 전환 시 필터 유지

### 4-2. 성능 최적화
- 테이블 가상화 (react-window)
- 차트 데이터 포인트 제한

### 4-3. 모바일 반응형
- Admin: 테이블 → 카드 레이아웃 전환
- Platform Admin: 데스크톱 우선이지만 기본 반응형 보장

### 4-4. 에러 처리 / API 연동 기반
- API 클라이언트 레이어 추상화
- 네트워크 에러 UI (ErrorAlert + retry)
- 세션 만료 → 재로그인 리다이렉트

---

## 전체 타임라인 요약

| Phase | 범위 | 예상 소요 | 우선순위 |
|-------|------|---------|---------|
| **Phase 1** | Quick Wins + 프롬프트 탭 제거 | 1일 | P0 — 즉시 |
| **Phase 2** | Conversations + Errors + Feedback 탭 | 3–4일 | P0 — 이번 스프린트 |
| **Phase 3** | 나머지 Quick Wins + 접근성 | 1–2일 | P1 — Phase 2 직후 |
| **Phase 4** | 구조/운영 부채 | 3–5일 | P2 — 다음 스프린트 |

**총 예상**: 8–12일 (Phase 1–3 기준 5–7일)

---

## 파일 변경 매트릭스

### 수정 파일
| 파일 | Phase | 변경 유형 |
|------|-------|---------|
| `AIQualitySummaryTab.tsx` | 1-1 | 프롬프트 서브탭 제거 |
| `AdminView.tsx` | 1-2, 3-1 | 이메일 중복 전달, Quick Wins |
| `UserFormModal.tsx` | 1-2 | 이메일 중복 검증 |
| `TenantManagementTab.tsx` | 1-3a, 1-3d | KPI 동적 계산, 신선도 표시 |
| `tenantData.ts` | 1-3a | TENANT_KPI → 동적 계산 헬퍼 |
| `AlertRuleEditorModal.tsx` | 1-3b | target 필드 UI |
| `TenantDetailPanel.tsx` | 1-3c | API 키 복사 핸들러 |
| `ActivityMonitoringTab.tsx` | 1-3d | 신선도 표시 |
| `CostManagementTab.tsx` | 1-3d, 3-2 | 신선도 표시, 통화 통일 |
| `AlertManagementTab.tsx` | 1-3d | 신선도 표시 |
| `BillingTab.tsx` | 1-3d, 3-2 | 신선도 표시, 청구서 발행, 통화 통일 |
| `PlatformAdminView.tsx` | 2-4 | 탭 재구성 + 신규 탭 등록 |
| `platformAdminTypes.ts` | 2-1,2-2,2-3 | 신규 타입 정의 |
| `PermissionSettingsView.tsx` | 3-1 | 버튼 순서 변경 |
| `UsageMonitoringView.tsx` | 3-1 | aria-label |
| `AuditLogView.tsx` | 3-1 | CSV 헤더 한글화 |

### 신규 파일
| 파일 | Phase | 설명 |
|------|-------|------|
| `ConversationsTab.tsx` | 2-1 | 대화 모니터링 탭 |
| `conversationData.ts` | 2-1 | Mock 대화 데이터 |
| `ErrorDashboardTab.tsx` | 2-2 | 에러 대시보드 탭 |
| `errorData.ts` | 2-2 | Mock 에러 데이터 |
| `FeedbackMonitoringTab.tsx` | 2-3 | 피드백 모니터링 탭 |
| `feedbackData.ts` | 2-3 | Mock 피드백 데이터 |
