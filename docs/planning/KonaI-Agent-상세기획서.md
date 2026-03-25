# KonaI-Agent 상세 기획서

> **문서 버전**: v1.0
> **작성일**: 2026-03-16
> **기준**: 현재 구현 완료된 프론트엔드 기준

---

## 1. 프로젝트 개요

### 1.1 제품 정의

KonaI-Agent는 **AI 에이전트 기반 엔터프라이즈 대시보드 애플리케이션**이다. 자연어 대화를 통해 데이터 분석, 보고서 생성, 멀티 에이전트 오케스트레이션을 수행하며, 관리자 패널을 통해 사용자·권한·사용량·프롬프트 등을 중앙 관리한다.

### 1.2 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| UI 라이브러리 | React 18, Tailwind CSS 3.4, Radix UI |
| 데이터 시각화 | Recharts 2.12, react-grid-layout 1.4, ReactFlow 11.10 |
| 상태 관리 | React Context API (NotificationContext, ToastContext, ScenarioContext) |
| 언어 | TypeScript (strict mode) |
| 테스트 | Vitest 2.0, React Testing Library 16.3, jsdom 28.1 |
| 부가 도구 | Puppeteer (캡처 자동화), docx/xlsx (문서 생성), React Markdown |

### 1.3 대상 사용자

| 역할 | 주요 활동 |
|------|----------|
| 일반 사용자 | 자연어 질의, 차트 생성, PPT/보고서 요청, 대시보드 열람 |
| 데이터 매니저 | 데이터 파이프라인 구성, 데이터 소스 관리 |
| 관리자 (Super Admin) | 사용자·권한·프롬프트·에이전트 설정, 감사 로그 조회 |

---

## 2. 정보 아키텍처 및 라우팅

### 2.1 라우트 맵

```
/                           → 메인 대시보드 (LiveboardView + ChatInterface)
/login                      → 로그인 페이지
/chat                       → 일반 채팅 (GeneralChatView)
/liveboard                  → 위젯 대시보드 (LiveboardView)
/history                    → 채팅 이력 (ChatHistoryView)
/data                       → 데이터 파이프라인 (DataManagementView)
/admin                      → 관리자 대시보드 (AdminView, 6개 탭)
/agent/ppt                  → PPT 생성 시나리오
/agent/analysis             → 데이터 분석 시나리오
/agent/orchestration        → 멀티 에이전트 오케스트레이션
/settings/agent-config      → 에이전트 설정
/settings/prompt-management → 프롬프트 관리
/settings/scheduled-tasks   → 예약 작업
/settings/skills            → Skill 관리
/settings/marketplace       → 에이전트 마켓플레이스
```

### 2.2 레이아웃 계층

```
RootLayout (HTML, Pretendard 폰트)
  └─ ClientProviders
       ├─ TooltipProvider
       ├─ NotificationProvider (이상 징후 알림)
       ├─ ToastProvider (토스트 알림)
       ├─ ScenarioProvider (시나리오 상태 전달)
       └─ AuthGuard (인증 가드)
            └─ AppShell (Sidebar + main)
                 └─ Page (라우트별 페이지)
```

### 2.3 네비게이션 구조

사이드바(Sidebar)는 전 페이지 공통으로 표시된다.

| 메뉴 | 라우트 | 아이콘 |
|------|--------|--------|
| Dashboard | `/` | LayoutDashboard |
| 채팅 | `/chat` | MessageSquare |
| Data Management | `/data` | Database |
| Admin | `/admin` | Shield |
| Chat History | `/history` | History |
| Settings (드롭다운) | — | Settings |
| └ Skill 관리 | `/settings/skills` | — |
| └ 에이전트 설정 | `/settings/agent-config` | — |
| └ 프롬프트 관리 | `/settings/prompt-management` | — |
| └ 예약 작업 | `/settings/scheduled-tasks` | — |
| └ 마켓플레이스 | `/settings/marketplace` | — |

사이드바 하단에는 알림 벨(NotificationPopup)과 프로필 드롭다운(ProfileDropdown)이 위치한다.

---

## 3. 전역 상태 관리

### 3.1 NotificationContext — 이상 징후 알림

실시간 이상 징후(Anomaly) 알림을 관리한다. 사이드바 벨 아이콘의 미읽음 카운트 뱃지와 연동된다.

**데이터 모델**:

```
Anomaly {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  metric: string
  timestamp: string
  description: string
  isRead: boolean
  contextData: { name, scenario, agentMessage }
}
```

**인터페이스**: anomalies 목록 조회, unreadCount 확인, markAsRead, markAllAsRead, addAnomaly

**초기 모의 데이터**: 제조 원가율 급등 경보(critical), 일본 지사 매출 감소 예측(warning)

### 3.2 ToastContext — 토스트 알림

info, success, error, warning 4종류의 토스트 알림을 관리한다.

**인터페이스**: showToast, dismissToast, clearAllToasts

### 3.3 ScenarioContext — 시나리오 트리거

메인 대시보드(ChatInterface)에서 에이전트 시나리오 페이지로 쿼리와 컨텍스트를 전달한다.

**인터페이스**: triggerScenario(mode, data), clearScenario

**시나리오 모드**: scenario_ppt, scenario_analysis, scenario_multi_agent

---

## 4. 인증 및 보안

### 4.1 인증 (AuthGuard)

AuthGuard 컴포넌트가 `/login` 이외의 모든 페이지에 로그인 가드를 적용한다. `isLoggedIn` 상태를 관리하며, 미인증 시 LoginView를 표시한다.

### 4.2 로그인 화면 (LoginView)

좌측에 브랜드 영역(다크 테마, KonaAgent 로고 및 설명), 우측에 로그인 폼(이메일, 비밀번호, 로그인 상태 유지 체크박스)을 배치한다. 768px 이하에서는 폼만 표시된다. 현재 데모 모드로 이메일+비밀번호 입력 시 1초 지연 후 로그인 처리한다.

### 4.3 역할 기반 접근 제어 (RBAC)

15개 도메인 역할을 정의한다: ROLE_SYS_ADMIN, ROLE_FIN_ADMIN, ROLE_FIN_USER, ROLE_SALES_MGR, ROLE_SALES_REP, ROLE_HR_ADMIN, ROLE_HR_USER, ROLE_MFG_ADMIN, ROLE_MFG_OPERATOR, ROLE_SCM_ADMIN, ROLE_SCM_USER, ROLE_IT_ADMIN, ROLE_DATA_ENGINEER, ROLE_EXEC, ROLE_AUDITOR.

3층 데이터 접근 제어를 구현한다:
1. **테이블 수준**: 역할별 테이블 접근 허용/거부 매트릭스
2. **행 수준**: 부서코드, 사업영역, 법인코드 기반 WHERE 필터
3. **컬럼 마스킹**: 급여, SSN, 계좌번호 등 민감 컬럼에 REDACT/HASH/PARTIAL 마스킹 적용

---

## 5. 주요 기능 상세

### 5.1 메인 대시보드 (`/`)

**컴포넌트**: ChatInterface + LiveboardView

ChatInterface는 하단에 텍스트 입력 영역을 배치하고 상단에 LiveboardView를 표시한다. 사용자 입력을 퍼지 매칭으로 분석하여 적절한 시나리오 페이지로 라우팅한다.

**시나리오 트리거 규칙**:
- "PPT" + ("보고서" | "생성" | "Q4" | "만들어") → `/agent/ppt`
- "멀티 에이전트" | "에이전트 팀" | "종합 보고서" → `/agent/orchestration`
- 기타 → `/agent/analysis`

LiveboardView는 react-grid-layout 기반 11개 위젯을 드래그/드롭/리사이즈 가능한 그리드로 표시한다.

**위젯 목록**:

| 카테고리 | 위젯 |
|---------|------|
| KPI (3개) | 매출 성장률, 원가 효율성, 평균 판매 단가 |
| 차트 (7개) | 매출 증감 분석, 자동화율-원가율 상관관계, 월별 추이, 사업부별 구성, Top 5 거래처, YoY 성장률, 시간대별 원가율 추이 |
| 분석 (1개) | 이상 감지 차트 |

위젯 클릭 시 "Ask Agent" 이벤트를 발행하여 ChatInterface가 수신한다.

### 5.2 일반 채팅 (`/chat`)

**컴포넌트**: GeneralChatView

3패널 구조: 좌측 사이드바(세션 히스토리 + 분기 관리), 중앙 채팅 패널(메시지 표시 + 입력), 우측 사이드바(진행 작업 + 아티팩트 미리보기).

**핵심 기능**:

1. **분기(Branching)**: Ctrl+Shift+B로 분기 생성, Ctrl+[ / Ctrl+]로 분기 전환 가능. 메시지 레벨에서 분기점 지정.
2. **자연어 → 차트 자동 생성**: "월별 매출 추이", "사업부별 비교" 등의 쿼리 입력 시 NL-Chart 엔진이 적절한 차트를 자동 생성.
3. **대시보드 자동 생성**: "종합 현황 대시보드", "심층 분석 대시보드" 등의 쿼리로 멀티 위젯 대시보드 자동 생성.
4. **파일 첨부**: 드래그 & 드롭 또는 명시적 첨부. 파일 타입 자동 감지.
5. **모델 선택**: ModelSwitcher로 LLM 모델 전환 가능 (Claude Opus 4.6, Claude Sonnet 4.5, GPT-5.2, GPT-5.3 Flash, Gemini 3 Flash).

**채팅 입력 (UnifiedChatInput)**: 텍스트 입력, 파일 첨부, 모델 선택, 전송 버튼을 통합한 입력 컴포넌트.

### 5.3 PPT 생성 시나리오 (`/agent/ppt`)

**컴포넌트**: AgentChatView + usePPTScenario + PPTScenarioRenderer

10단계 시나리오를 순차 실행한다:

| 단계 | 그룹명 | 설명 | HITL |
|------|--------|------|------|
| 1 | 작업 계획 수립 | 전체 실행 계획 생성 | — |
| 2 | 데이터 소스 선택 | 사용 가능한 데이터 소스 목록 제시 | ✅ 선택 |
| 3 | 데이터 조회 | 선택된 소스에서 병렬 쿼리 실행 | — |
| 4 | 데이터 검증 | 조회 결과 검증 및 승인 게이트 | ✅ 승인/반려 |
| 5 | PPT 설정 | 테마, 톤, 슬라이드 수 등 구성 | ✅ 폼 입력 |
| 6 | 슬라이드 구성 | 슬라이드 레이아웃 설계 | — |
| 7 | 슬라이드 개요 검토 | 생성될 슬라이드 개요 확인 | ✅ 검토/수정 |
| 8 | 테마/폰트 선택 | 시각적 스타일 결정 | ✅ 선택 |
| 9 | 슬라이드 생성 | 실제 콘텐츠 생성 (스트리밍 표시) | — |
| 10 | 완료 | 결과물 제시 및 다운로드 | — |

**PPT 설정 (PPTConfig)**:
```
theme: 'Corporate Blue' | 'Modern Dark' | 'Nature Green'
tone: string
topics: string[]
titleFont: string
bodyFont: string
slideCount: number
```

**슬라이드 렌더링**: SlideContentRenderer가 테마별 스타일(배경, 강조색, 텍스트 색상)을 자동 적용한다. SlideStreamingRenderer가 생성 중인 슬라이드를 실시간 타이핑 커서와 함께 표시한다. SlideThumbnailList가 전체 슬라이드 목록을 섬네일로 보여준다.

### 5.4 데이터 분석 시나리오 (`/agent/analysis`)

**컴포넌트**: AgentChatView + useSalesAnalysisScenario + SalesAnalysisScenarioRenderer

PPT 시나리오와 유사한 구조로, 데이터 조회 → 분석 실행 → 결과 시각화 → 인사이트 도출 단계를 거친다. 기본 쿼리: "Q4 매출 실적을 분석해주세요."

### 5.5 멀티 에이전트 오케스트레이션 (`/agent/orchestration`)

**컴포넌트**: AgentChatView + MultiAgentScenarioRenderer

여러 에이전트가 병렬로 작업을 수행하고 결과를 조율한다.

**UI 구성**:
- OrchestrationSummaryBanner: 전체 진행 상황 요약
- AgentTaskList: 에이전트별 작업 카드 (pending → running → completed/failed)
- AgentDetailView: 선택된 에이전트의 상세 정보 및 도구 호출 기록
- HandoffIndicator: 에이전트 간 핸드오프 시각화
- AgentResultsSummary: 최종 결과 요약

**작업 상태 흐름**: Pending → Running (진행률 표시) → Completed ✓ / Failed ✗

### 5.6 자연어 차트 (NL-Chart)

**컴포넌트**: NLChartRenderer, NLDashboardRenderer, ChartTypeSelector, HeatmapChart

자연어 쿼리를 분석하여 적절한 차트 유형과 데이터를 자동 매칭한다.

**지원 차트 유형**: bar, line, pie, area, composed, heatmap, sankey, treemap

**응답 구조**:
```
NLChartResult {
  config: NLChartConfig    // 차트 설정 (유형, 데이터, 축 등)
  reasoning: string        // 해당 차트 유형 선택 이유
  alternatives: NLChartType[]  // 대안 차트 유형 목록
}
```

ChartTypeSelector를 통해 사용자가 대안 차트 유형으로 즉시 전환할 수 있다.

### 5.7 생성형 UI (Generative UI)

**컴포넌트**: GenerativeUIRenderer, InlineGenerativeUI, GenerativeUIFallback

AI가 생성한 UI 스펙을 실시간으로 렌더링한다. 에이전트 응답 메시지에 포함된 UI 스펙을 `extractGenerativeUIFromMessage` 함수가 추출하고, GenerativeUIRenderer가 해당 유형에 맞는 컴포넌트로 렌더링한다.

**지원 UI 유형**: bar-chart, line-chart, pie-chart, area-chart, composed-chart, data-table, kpi-card, stat-grid

`a2uiCatalog`에 사용 가능한 UI 유형 목록이 정의되어 있다.

---

## 6. 관리자 기능

### 6.1 관리자 대시보드 (`/admin`)

**컴포넌트**: AdminView (6개 탭)

#### 탭 1: 사용자 관리

사용자 목록을 테이블로 표시하며 검색, 필터링, 추가, 수정, 활성화/비활성화, 삭제 기능을 제공한다.

**사용자 모델 (EnhancedUser)**:
```
id, name, email, department, division, position,
roles: DomainRole[] (다중 역할),
templateCode?: TemplateCode,
status: 'Active' | 'Inactive' | 'Pending',
lastLogin, avatarColor
```

초기 모의 데이터 15명이 다양한 부서(재무, 영업, 인사, 제조, IT 등)와 역할로 구성되어 있다.

#### 탭 2: 권한 설정 (PermissionSettingsView)

6개 서브탭으로 구성된다:
1. **테이블 접근**: 15 역할 × 43 서브카테고리 접근 레벨 매트릭스. 셀 클릭으로 none/read/write/admin 전환.
2. **행 보안**: WHERE 필터 규칙 설정 (부서코드, 사업영역, 법인코드 기반).
3. **컬럼 마스킹**: 민감 컬럼에 REDACT/HASH/PARTIAL 마스킹 정책 적용.
4. **충돌 미리보기**: 여러 역할을 선택하면 실제 적용될 최종 권한을 시뮬레이션.
5. **역할 정의**: 역할 생성/수정/삭제 (RoleDefinitionManager).
6. **조직 매핑**: 사용자-조직-역할 매핑 관리 (OrgRoleMappingManager).

변경된 셀은 `modifiedCells` Set으로 추적하며, KPI로 접근 가능 셀 비율, 수정 건수, 충돌 건수를 표시한다.

#### 탭 3: 사용량 모니터링 (UsageMonitoringView)

KPI 4종(총 토큰 사용량, 총 비용, 활성 에이전트, 평균 응답 시간)과 3개 차트(일일 사용량 추이, 모델별 비용 분포, 에이전트별 사용량)를 표시한다.

추가 구성요소: HealthStatusStrip(시스템 상태), AgentCostTable(에이전트별 비용), TeamBudgetSection(팀 예산), UserUsageTable(사용자별 사용량).

기간 필터: 7일, 30일, 90일.

#### 탭 4: 감사 로그 (AuditLogView)

KPI 3종(총 이벤트 수, 이번 달 중요 이벤트, 최근 7일 이상 이벤트)과 이벤트 테이블을 표시한다.

필터: 시간 범위(7일/30일/90일), 행위자(사용자/에이전트/시스템), 액션(데이터 변경/접근/삭제), 심각도(info/warning/critical).

상세 시트를 통해 개별 이벤트의 전체 정보를 확인한다.

#### 탭 5: 시스템 프롬프트 (PromptManagementView, 관리자 모드)

프롬프트 템플릿 CRUD, 버전별 불변 스냅샷, 인라인 테스트 패널, 모델 바인딩, 모더레이션 레벨(low/medium/high) 설정을 제공한다. 템플릿 상태: draft, active, archived.

#### 탭 6: 피드백 품질 (FeedbackQualityView)

KPI 4종(만족도, 품질 점수, 총 피드백, 미해결 피드백)과 품질 추이 차트, 피드백 목록 테이블을 표시한다. 피드백 상태: new, reviewing, resolved.

### 6.2 데이터 파이프라인 (`/data`)

**컴포넌트**: DataManagementView

ReactFlow 기반 비주얼 에디터로 데이터 파이프라인을 구성한다.

**3존 구조**:
- Input Zone: 데이터 소스 (CSV, API, DB 등)
- Transform Zone: 데이터 처리 (필터, 조인, 집계 등)
- Output Zone: 결과 출력 (테이블, 파일, API 등)

커스텀 노드(DatasetNode)가 컬럼 수와 상태 아이콘을 표시한다. 하단에 데이터 미리보기 테이블(11 컬럼, 2,450행)이 위치한다.

---

## 7. 설정 기능

### 7.1 에이전트 설정 (`/settings/agent-config`)

**컴포넌트**: AgentConfigView

5개 섹션의 폼으로 구성된다:
1. **기본 정보**: 이름, 설명, 아바타
2. **모델 선택**: LLM 모델, 온도(temperature), 최대 토큰
3. **기능 토글**: 웹 검색, 코드 실행, 파일 업로드, 이미지 생성, 데이터 분석, 이메일 연동
4. **시스템 프롬프트**: 텍스트 영역 + 문자 카운트
5. **콘텐츠 모더레이션**: 민감도 슬라이더

### 7.2 프롬프트 관리 (`/settings/prompt-management`)

**컴포넌트**: PromptManagementView (사용자 모드)

관리자 탭의 프롬프트 관리와 동일한 컴포넌트를 사용자 모드로 렌더링한다. 사용자 자신의 프롬프트 템플릿만 관리할 수 있다.

### 7.3 예약 작업 (`/settings/scheduled-tasks`)

**컴포넌트**: ScheduledTasksView

KPI + 작업 목록 테이블 + 생성/편집 폼 + 실행 이력으로 구성된다.

**작업 상태**: pending, running, completed, failed, paused

**반복 유형**: once, hourly, daily, weekly, monthly

**기능**: 작업 CRUD, 일시 중지/재개, 즉시 실행(Run Now), 실행 이력 추적

### 7.4 Skill 관리 (`/settings/skills`)

**컴포넌트**: SkillManagementView + SkillUploadModal

Skill 목록 조회, 업로드(모달), 활성화/비활성화, 삭제 기능을 제공한다.

### 7.5 에이전트 마켓플레이스 (`/settings/marketplace`)

**컴포넌트**: AgentMarketplaceView

그리드 형태로 에이전트/플러그인을 브라우징한다.

**플러그인 유형**: mcp_server, mcp_app, skill

**플러그인 상태**: available, installed, update_available

**기능**: 검색 + 카테고리 필터, 별점(1-5), 설치/제거, 활성화/비활성화, 상세 보기(시트)

### 7.6 지식 기반 (Knowledge Base)

**컴포넌트**: KnowledgeBaseView

컬렉션 그리드와 문서 테이블 2개 탭으로 구성된다.

**기능**: 컬렉션 관리(생성, 구독, 설정), 문서 업로드(드래그 & 드롭), 검색 + 유형별 필터링, 상태 추적(indexed, processing, failed, pending)

---

## 8. HITL (Human-In-The-Loop) 상호작용 패턴

에이전트 시나리오 실행 중 사용자 개입이 필요한 지점에서 HITL 패턴이 작동한다.

**흐름**:
```
useScenarioOrchestration (단계 실행)
  ↓ isHitl 스텝 도달
  ├─ 시나리오 일시 정지 (isPaused = true)
  └─ HITL 패널 표시 (activeHitl 설정)
       ↓
  사용자가 옵션 선택
       ↓
  resumeWithHitlSelection(stepId, selectedOption)
  ├─ 메시지 상태 업데이트 (toolStatus: 'completed')
  └─ 다음 단계 실행
```

**LangGraph 호환**: runStatus ('idle' | 'running' | 'interrupted' | 'completed'), interruptPayload (node_id, tool_type, question, options)

---

## 9. 공통 컴포넌트 체계

### 9.1 UI 프리미티브 (Radix UI 래퍼)

`src/components/ui/` 디렉토리에 24개 이상의 Radix UI 래퍼를 관리한다: button, input, textarea, select, dialog, sheet, tabs, badge, dropdown-menu, table, checkbox, radio-group, tooltip, popover, switch, avatar, breadcrumb, scroll-area, progress, collapsible, label, accordion, separator, slider.

모든 컴포넌트는 Tailwind CSS + CVA(class-variance-authority)로 스타일링한다.

### 9.2 공유 Atoms

| 컴포넌트 | 용도 |
|---------|------|
| KPICard | KPI 메트릭 표시 (값, 추이, 변화율) |
| ChatBubble | 채팅 메시지 버블 |
| Breadcrumb | 네비게이션 경로 |

### 9.3 공유 Molecules

| 컴포넌트 | 용도 |
|---------|------|
| ChartWidget | 차트 래퍼 (제목 + 차트 + AI 인사이트) |
| CustomResizeHandle | 그리드 리사이즈 핸들 |
| DepthLimitNotice | 드릴다운 깊이 제한 알림 |

### 9.4 마크다운 렌더링

MarkdownRenderer, CodeBlock, markdownComponents를 통해 에이전트 응답의 마크다운을 HTML로 렌더링한다.

### 9.5 아이콘

Lucide React에서 62개 이상의 아이콘을 import하여 사용한다. next.config.ts의 optimizePackageImports로 자동 트리 셰이킹한다.

---

## 10. 대시보드 드릴다운

### 10.1 개요

Dashboard 컴포넌트는 차트 클릭 시 드릴다운을 지원한다.

**UI 흐름**: 차트 데이터 포인트 클릭 → DrillDownContextMenu 표시 → 드릴 레벨 증가 → 상세 데이터 표시 → Breadcrumb으로 레벨 이동

**상태 관리**: useDashboardState 훅이 드릴 레벨, 선택 데이터, 컨텍스트 메뉴 위치를 추적한다.

### 10.2 모의 드릴 데이터

revenueFactorDrillData, costCorrelationDrillData, kpiDrillData 등 각 위젯별 드릴다운 데이터가 준비되어 있다.

---

## 11. 모델 선택 (Model Switcher)

**컴포넌트**: ModelSwitcher + ModelSelectItem + useModelSelection

Radix Select 기반 드롭다운으로 LLM 모델을 선택한다.

| 모델 | 컨텍스트 | 특징 |
|------|---------|------|
| Claude Opus 4.6 | 200K | Reasoning 지원 |
| Claude Sonnet 4.5 | 200K | 기본값 |
| GPT-5.2 | 128K | — |
| GPT-5.3 Flash | 128K | 고속 |
| Gemini 3 Flash | 200K | 고속 |

제어/비제어 모드 모두 지원하며, localStorage에 선택값을 자동 저장한다.

---

## 12. 알림 시스템

```
이상 징후 발생
  ↓
NotificationContext.addAnomaly()
  ↓
Sidebar 벨 아이콘 (unreadCount 뱃지)
  ↓
NotificationPopup (드롭다운)
  ├─ 이상 징후 목록 표시
  └─ 클릭 → router.push() + triggerScenario()
       ↓
  관련 분석/대시보드 페이지로 이동
```

---

## 13. 성능 최적화 전략

### 13.1 코드 스플리팅

모든 페이지 컴포넌트를 `React.lazy`로 동적 import한다. Suspense 폴백으로 스피너를 표시한다.

### 13.2 패키지 최적화

next.config.ts에서 lucide-react, recharts, lodash를 optimizePackageImports 대상으로 지정하여 트리 셰이킹한다.

### 13.3 메모이제이션

useMemo로 계산값, useCallback으로 함수를 메모이제이션한다. Context는 필요한 범위에서만 업데이트한다.

### 13.4 빌드 설정

TypeScript 에러와 ESLint 경고를 빌드 시 무시하도록 설정하여 마이그레이션 기간 중 빌드 안정성을 확보한다.

---

## 14. 테스트 전략

| 테스트 유형 | 커맨드 | 설명 |
|------------|--------|------|
| 전체 테스트 | `npm test` | Watch 모드 |
| 단위 테스트 | `npm run test:unit` | 컴포넌트/훅 단위 |
| 통합 테스트 | `npm run test:integration` | 기능 간 연동 |
| E2E 테스트 | `npm run test:e2e` | Playwright/Cypress |
| 캡처 테스트 | `npm run test:capture` | Puppeteer 스크린샷 |

---

## 15. 구현 현황 및 제한사항

### 15.1 구현 완료 (20개 기능)

모든 기능의 메인 뷰가 구현 완료되었다: GeneralChatView, AgentChatView, LiveboardView, Dashboard, PermissionSettingsView, MultiAgentOrchestration, NLChartRenderer, NLDashboardRenderer, ModelSwitcher, KnowledgeBaseView, AuditLogView, ScheduledTasksView, UsageMonitoringView, FeedbackQualityView, GenerativeUIRenderer, PromptManagementView, AgentConfigView, AgentMarketplaceView, SlideContentRenderer, 모든 UI 베이스 컴포넌트.

### 15.2 부분 구현

| 기능 | 상태 | 비고 |
|------|------|------|
| PPTScenarioRenderer | 기본 렌더링 완성 | 스트리밍 애니메이션 최적화 가능 |
| SalesAnalysisScenarioRenderer | UI 완성 | 실제 데이터 연동 미흡 |
| MultiAgentScenarioRenderer | 오케스트레이션 로직 완성 | 실시간 상태 업데이트 개선 필요 |

### 15.3 현재 제한사항

| 항목 | 현재 상태 | 향후 방향 |
|------|----------|----------|
| 백엔드 연동 | 모의 데이터만 사용 | REST/GraphQL API 연동 |
| 실시간 업데이트 | 시뮬레이션 | WebSocket 지원 |
| 파일 업로드 | UI만 구현 | 실제 업로드 처리 |
| 데이터 저장 | localStorage 부분 사용 | 영구 저장소 (DB) |
| 권한 검증 | UI 로직만 존재 | 서버 사이드 권한 검증 |

---

## 부록 A: 커스텀 훅 목록

| 훅 | 위치 | 목적 |
|----|------|------|
| useScenarioOrchestration | hooks/ | 범용 시나리오 실행 오케스트레이션 |
| usePPTScenario | hooks/ | PPT 생성 10단계 시나리오 |
| useSalesAnalysisScenario | hooks/ | 매출 분석 시나리오 |
| useSlideOutlineHITL | hooks/ | 슬라이드 개요 HITL 관리 |
| useDashboardState | hooks/ | 대시보드 드릴다운 상태 |
| useAutoResize | hooks/ | 텍스트 입력 자동 리사이즈 |
| useScrollToBottom | hooks/ | 채팅 자동 스크롤 |
| useScrollToBottomButton | hooks/ | 하단 스크롤 버튼 제어 |
| useClickOutside | hooks/ | 외부 클릭 감지 |
| useTextStreaming | hooks/ | 텍스트 스트리밍 효과 |
| useChatHistory | hooks/ | 채팅 이력 조회/저장 |
| useRightPanel | hooks/ | 우측 패널 제어 |
| useCaptureStateInjection | hooks/ | Puppeteer 캡처 자동화 |

## 부록 B: 타입 파일 목록

| 파일 | 주요 정의 |
|------|----------|
| common.types.ts | ViewType, UserRole, UserStatus, User, Permission |
| context.types.ts | PPTConfig, SampleInterfaceContext, AppViewMode |
| admin.types.ts | 15개 DomainRole, EnhancedUser, TableAccessPolicy, RowFilterRule, ColumnMaskPolicy |
| dashboard.types.ts | 대시보드 데이터 타입 |
| liveboard.types.ts | 위젯 데이터 타입 |
| langgraph.types.ts | RunStatus, InterruptPayload, HitlOption, ToolType |

## 부록 C: 디렉토리 구조 전체

```
src/
├── app/                              # Next.js App Router (17개 페이지)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── ClientProviders.tsx
│   ├── login/page.tsx
│   ├── chat/page.tsx
│   ├── admin/page.tsx
│   ├── liveboard/page.tsx
│   ├── history/page.tsx
│   ├── data/page.tsx
│   ├── agent/ppt/page.tsx
│   ├── agent/analysis/page.tsx
│   ├── agent/orchestration/page.tsx
│   └── settings/{agent-config,prompt-management,scheduled-tasks,skills,marketplace}/page.tsx
│
├── components/
│   ├── ui/                          # Radix UI 래퍼 (24개+)
│   ├── features/                    # 기능 모듈 (20개)
│   │   ├── general-chat/
│   │   ├── agent-chat/
│   │   ├── liveboard/
│   │   ├── dashboard/
│   │   ├── ppt/
│   │   ├── permission-settings/
│   │   ├── multi-agent/
│   │   ├── nl-chart/
│   │   ├── model-switcher/
│   │   ├── knowledge-base/
│   │   ├── audit-log/
│   │   ├── scheduled-tasks/
│   │   ├── usage-monitoring/
│   │   ├── feedback-quality/
│   │   ├── generative-ui/
│   │   ├── prompt-management/
│   │   ├── agent-config/
│   │   ├── agent-marketplace/
│   │   ├── data/
│   │   └── index.ts
│   ├── shared/{atoms,molecules,markdown}/
│   ├── icons/
│   ├── widgets/
│   ├── lazy/
│   ├── Sidebar.tsx
│   ├── ChatInterface.tsx
│   ├── LoginView.tsx
│   ├── AdminView.tsx
│   ├── DataManagementView.tsx
│   ├── AuthGuard.tsx
│   └── ...기타 공통 컴포넌트
│
├── context/                          # React Context (3개)
├── hooks/                            # 커스텀 훅 (13개)
├── types/                            # TypeScript 타입 (9개+)
├── constants/                        # 상수 (5개)
├── lib/                              # 유틸리티
├── services/                         # 서비스
└── data/                             # 목업 데이터
```
