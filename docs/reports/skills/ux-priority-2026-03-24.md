# UX 우선순위 매트릭스 — 2026-03-24

## 대상
- `src/app/settings/skills/page.tsx`
- `src/components/features/skill-management/` (전체)
- `src/components/SkillManagementView.tsx` (레거시)

## 요약
- 총 이슈: 45 (체크리스트: 31 / 시나리오: 26 / 구조: 5 / 프로덕션: 10 — 중복 통합 후 순 45건)
- 프로덕션 즉시 위험: **2**
- Quick Wins: **10** (예상 총합: 5시간)
- 전략적 항목: **6** (예상 총합: 26~37시간)
- 구조 변경 제안: **3**
- 운영/품질 부채: **4**
- 기능 부재: **8**

---

## 프로덕션 즉시 위험

출시 전 필수 수정. 보안·접근 제어 문제.

| # | 관점 | 컴포넌트 | 이슈 | 출처 | 예상 공수 |
|---|------|---------|------|------|---------|
| P1 | 보안/접근 제어 | `SkillsPageView.tsx:27` | `IS_ADMIN` 기본값이 `true` (`NEXT_PUBLIC_SKILL_ADMIN !== 'false'`). 환경 변수 미설정 시 모든 사용자에게 관리자 UI 전체(스킬 삭제·폐기·카테고리 변경) 노출 | P4 관점1 | 0.5h |
| P2 | 보안/접근 제어 | `SkillSlidePanelHeader.tsx:38,58` | `CURRENT_USER_ID`가 `'user-hong'`으로 하드코딩 — 삭제·폐기 버튼 표시 여부 판단이 항상 단일 mock 사용자 기준으로 동작 | P4 관점2 / 시나리오 S6 | 1h |

> **즉시 조치**: P1은 `process.env.NEXT_PUBLIC_SKILL_ADMIN === 'true'` 로 조건 반전, P2는 인증 컨텍스트(prop 또는 hook)로 currentUserId 주입

---

## Quick Wins

높은 영향도 + 낮은 공수 (< 1h). 가장 먼저 해결할 항목.

| # | 유형 | 컴포넌트 | 이슈 | 출처 | 예상 공수 |
|---|------|---------|------|------|---------|
| Q1 | 피드백 부재 | `AdminReviewPanel.tsx:144-155` | 승인/반려 후 Sonner toast 없음 — 성공 여부 불명확 | 체크리스트 #19 / 시나리오 S3 마찰점1 | 0.5h |
| Q2 | 피드백 부재 | `DraftEditContent.tsx:100-114` | 저장(`handleSave`) 후 확인 피드백 없음 — isDirty만 리셋, toast/inline 메시지 없음 | 시나리오 S2 마찰점2 | 0.5h |
| Q3 | 피드백 부재 | `CategoryManager.tsx:90-94` | 카테고리 설명 저장 후 피드백 없음 | 체크리스트 #20 / 시나리오 S5 마찰점1 | 0.5h |
| Q4 | Dead End (alert) | `DraftEditContent.tsx:248, 337-343` | "테스트" · "파일 교체" 버튼이 브라우저 `alert("준비 중")` 사용 — 브랜드 불일치 | 체크리스트 #3 #4 | 0.5h |
| Q5 | 위치 비직관 | `AdminReviewPanel.tsx:213` | "확인 (미검토 제거)" 레이블이 모호 — "공개 승인"인지 "목록 제거"인지 불명확 | 시나리오 S3 마찰점5 | 0.25h |
| Q6 | 기능 부재 | `SkillFilters.tsx:62-69` | 검색어 clearable X 버튼 없음 — 수동 삭제 필요 | 체크리스트 #12 / 시나리오 S1 마찰점1 | 0.5h |
| Q7 | toast 일원화 | `TeamSkillsTab.tsx:100-106` | 자체 커스텀 toast 구현 — Sonner와 스타일 불일치 | 체크리스트 #14 / 시나리오 S1 마찰점2 | 1h |
| Q8 | 용어 난해 | `SkillSlidePanel.tsx:47-118` (DraftEditHeader) | "수정본" 용어 처음 접하는 사용자에게 개인 작업본인지 팀 공유본인지 불명확 | 시나리오 S2 마찰점4 | 0.5h |
| Q9 | 기능 부재 | `VersionHistoryTab.tsx:128-134` | "복원" 버튼 UI만 있고 실제 복원 미작동(로컬 toast만) — 사용자 오해 유발 | 체크리스트 #5 / 시나리오 S7 마찰점2 / P4 관점7 | 0.25h (disabled 처리 시) |
| Q10 | Dead End | `SkillFilters.tsx:118-135` | "추가" 버튼이 클릭 가능으로 보이나 toast("준비 중")만 발생 — disabled + tooltip이 더 정직 | 체크리스트 #1 / 시나리오 S4 마찰점2 | 0.5h |

**Quick Wins 예상 총합: ~5시간**

---

## 전략적 항목

높은 영향도 + 높은 공수 (> 4h). 스프린트 계획에 반영.

| # | 유형 | 컴포넌트 | 이슈 | 출처 | 예상 공수 |
|---|------|---------|------|------|---------|
| S1 | 기능 부재 | `TeamSkillsTab.tsx`, `SkillFilters.tsx` | 스킬 생성 경로 완전 차단 — 레거시 `SkillCreateHub` · `SkillCreationChat` · `WorkflowCaptureWizard`가 신규 뷰에 미연결 | 시나리오 S4 / 체크리스트 #1 | 8~12h |
| S2 | 구조 변경 | `SkillsPageView.tsx`, `TeamSkillsTab.tsx`, `AdminTab.tsx` | 두 탭이 각자 `useState<TeamSkill[]>` 독립 초기화 — 관리자 카테고리 변경·승인이 팀원 뷰에 미반영 | P3 구조변경 #2 / 시나리오 S3 마찰점3 / S8 마찰점2 | 6~8h |
| S3 | 기능 부재 | `DraftEditContent.tsx` | 파라미터 편집 UI 없음 — draft에서 파라미터(`key`, `type`, `defaultValue`) 변경 불가 | 체크리스트 #25 / 시나리오 S2 마찰점1 | 4~6h |
| S4 | 기능 부재 | `TeamSkillsTab.tsx:232-241` | 폐기 요청이 삭제 ConfirmDialog와 동일 처리 — 관리자 검토 플로우가 별도로 존재하지 않음 | 시나리오 S6 마찰점3 | 4~6h |
| S5 | 품질 부채 | `TeamSkillsTab.tsx`, `SkillSlidePanel.tsx` | 미저장 draft 상태에서 탭 전환·뒤로가기 시 경고 없음 — 편집 작업 유실 가능 | P4 관점3 | 2~3h |
| S6 | 기능 부재 | `SkillSlidePanelHeader.tsx`, `SkillSlidePanel.tsx` | 슬라이드 패널 내에서 활성화 토글 불가 — 확인 후 활성화하려면 패널 닫고 테이블 Switch 찾아야 함 | 시나리오 S1 마찰점3 | 2h |

---

## 구조 변경 제안

기획 레벨 변경. 탭 재구성, 기능 이동, 아키텍처 변경.

| # | 제안 | 근거 | 영향 범위 | 출처 |
|---|------|------|---------|------|
| A1 | 레거시 `SkillManagementView` 공식 폐기 및 제거 | 실제 라우트에서 사용되지 않고 `mockSkills: []` 빈 배열로 비어 있음. 두 스킬 관리 화면이 코드베이스에 공존하여 개발자 혼란 유발 | `src/components/SkillManagementView.tsx`, `src/components/features/skill-management/SkillManagementView.tsx` + 관련 컴포넌트 15개+ | P3 기능존폐 / 체크리스트 #9 / P4 관점6 |
| A2 | `SkillsPageView` 레벨 단일 스킬 state 도입 | `TeamSkillsTab`과 `AdminTab`이 각자 독립 state를 가지면 관리자 작업(카테고리 변경, 승인)이 서로 미반영됨. `SkillsPageView`에서 단일 배열을 관리하고 props로 내려보내는 구조로 개선 | `SkillsPageView.tsx`, `TeamSkillsTab.tsx`, `AdminTab.tsx` | P3 구조변경 #2 |
| A3 | "처리 대기" 섹션 레이블 → "검토 대기열" 또는 "승인 대기"로 변경 | 관리자 업무 모델에서 "처리 대기"보다 "검토 대기열"이 더 직관적 — 무엇을 처리하는 섹션인지 명확히 전달 | `AdminTab.tsx:42` (NAV_ITEMS 레이블 1줄 수정) | P3 구조 리뷰 |

---

## 운영/품질 부채

규모 확장 시 문제. 확장성, 성능, 로깅.

| # | 분류 | 이슈 | 예상 영향 시점 | 출처 |
|---|------|------|-------------|------|
| D1 | 규모 확장 | `SkillTable` · `AdminSkillTable` · `UnifiedQueue` — 클라이언트 전용 필터링, 페이지네이션 없음. 100건 이상 시 렌더링 지연·스크롤 과밀 | 스킬 50건 이상 등록 시 | P4 규모확장 |
| D2 | 상태 동기화 | `AdminTab`의 `unreviewedSkills` ↔ `adminSkills` 독립 state — 처리 대기 승인 결과가 스킬 관리 탭에 실시간 미반영 | 실 운영 첫 달 | 시나리오 S3 마찰점3 / P4 관점9 |
| D3 | 운영 가시성 | 분석 이벤트 없음 — 스킬 활성화율, 제안 제출 빈도, 승인/반려 비율 측정 불가 | KPI 보고 시점 | P4 운영가시성 |
| D4 | 오류 경계 | `AdminTab` · `TeamSkillsTab` 레벨 ErrorBoundary 없음 — 컴포넌트 에러 시 전체 페이지 크래시 | 예측 불가 (버그 발생 시 즉시) | 체크리스트 #18 |

---

## 보완 항목

낮은 영향도 + 낮은 공수. 시간 날 때 처리.

1. **`UnifiedQueue` truncate tooltip**: 스킬명 `max-w-[160px]`, 요약 `max-w-[200px]` 절단 텍스트에 `title` 속성 추가 — 0.25h (체크리스트 #28)
2. **미사용 `AdminSubSection` 타입 제거**: `skill-management.types.ts:147`에 남아 있는 미사용 타입 정리 — 0.25h (체크리스트 #10)
3. **`DraftEditContent` changeSummary 글자 수 카운터**: "최소 10자" 안내 + 카운터 표시 — 0.5h (체크리스트 #22)
4. **레거시에 `@deprecated` 주석 추가**: 제거 전 임시 조치 — 0.25h (체크리스트 #9)
5. **`CategoryManager` read-only 필드 안내**: `skillCount` 하단에 "자동 집계" 라벨 추가 — 0.25h (체크리스트 #24)
6. **`AdminSkillTable` 빈 상태 행동 유도**: "필터 초기화" 버튼 추가 — 0.25h (체크리스트 #15)

---

## 후순위 항목

낮은 영향도 + 높은 공수. 현재 불필요.

1. **`SkillTable` 컬럼 헤더 정렬**: 이름순·수정일순 클릭 정렬 — 3~4h (체크리스트 #26)
2. **`VersionHistoryTab` instructionBody diff**: `SkillVersionEntry`에 `body` 필드 추가 후 좌우 split diff — 6~8h (시나리오 S7 마찰점1)
3. **분석 이벤트 tracking 구현**: 활성화·제안·승인 주요 이벤트 — 4~6h (P4 운영가시성)
4. **`CategoryManager` label 편집**: 카테고리 이름 인라인 편집 — 2~3h (시나리오 S5 마찰점2)

---

## 기능 부재 목록

시나리오 분석에서 발견된 신규 개발 필요 항목.

| # | 기능명 | 관련 시나리오 | 페르소나 | 예상 공수 | 비고 |
|---|--------|------------|---------|----------|------|
| F1 | 스킬 생성 경로 (채팅·파일·워크플로우) | S4 | 팀원, 개발자 | 8~12h | 레거시 `SkillCreateHub` · `SkillCreationChat` · `WorkflowCaptureWizard` 재활용 가능 |
| F2 | 파라미터 편집 UI (Draft) | S2 | 팀원 | 4~6h | type별 Input/Switch/NumberInput 분기 |
| F3 | 폐기 요청 전용 플로우 (사유 입력 → 대기열 등록) | S6 | 스킬 작성자 | 4~6h | `DeprecationRequest` 생성 로직 포함 |
| F4 | 버전 복원 기능 (instructionBody 롤백) | S7 | 팀원, 관리자 | 2~4h | `VersionHistoryTab` → `SkillSlidePanel` → `TeamSkillsTab` 콜백 체인 연결 |
| F5 | 처리 완료 이력 조회 (대기열 과거 이력) | S3 | 관리자 | 2~3h | `UnifiedQueue` 필터에 "처리 완료" 탭 추가 |
| F6 | 카테고리 추가/삭제 | S5 | 관리자 | 3~4h | `SkillCategoryConfig` CRUD + `CategoryManager` UI |
| F7 | 패널 내 활성화 토글 | S1 | 팀원 | 2h | `SkillSlidePanelHeader`에 Switch + `onToggleActivation` prop 추가 |
| F8 | 스킬 미리보기 (채팅 테스트) | S1 | 팀원 | 8h+ | 채팅 인터페이스 연동 필요 |

---

## 반복 패턴

같은 마찰 유형이 3회 이상 나타난 패턴 — 한 번에 통합 해결 권장.

| 패턴 | 발생 횟수 | 관련 시나리오 | 통합 해결안 |
|------|---------|-------------|-----------|
| **피드백 부재** (액션 후 toast 없음) | 6회 (AdminReviewPanel 승인/반려, DraftEditContent 저장, CategoryManager 저장, AdminTab 카테고리 변경, AdminTab 폐기 승인/반려) | S2, S3, S5, S8 | Sonner `toast` 일원화 작업 시 전체 일괄 처리. `TeamSkillsTab` 자체 toast도 동시 제거 (Q7과 묶음) |
| **Dead End** (버튼 클릭 → alert 또는 toast만) | 5회 (채팅 만들기, 채팅 편집, 테스트, 파일 교체, 추가 버튼) | S1, S2, S4 | `disabled + tooltip` 패턴으로 일괄 전환. "베타 준비 중" 문구 토큰화하여 재사용 |
| **상태 불일치** (두 컴포넌트가 같은 데이터를 별도 state로 관리) | 3회 (unreviewedSkills ↔ adminSkills, adminSkills ↔ TeamSkillsTab.skills, suggestionApproval ↔ adminSkills.instructionBody) | S3, S8 | 전략적 항목 S2의 "단일 스킬 state" 도입으로 근본 해결 |
