# Phase 2 Implementation Plan — Skill Management

> Generated: 2026-03-19
> Based on: design/skill-management-ia-v2.md
> Backend: Mock 데이터 유지 (프론트엔드 UI 중심)
> 예상 기간: 6–8주 (4 스프린트 × 2주)

---

## 의존 관계 맵

```
Sprint 1: Foundation
├── Eval Viewer 탭 확장 (Outputs + Benchmark)
├── 정책-동작 연동 아키텍처 ★ Phase 1 이월
└── 업로드 위저드 확장 (tags, source) ★ Phase 1 이월

Sprint 2: Publish + Team (Sprint 1에 의존)
├── Publish 워크플로우 ← 업로드 위저드 확장 필요
├── 팀 스킬 라이브러리 ← Publish 워크플로우 필요
└── 업데이트 알림 + Accept/Skip ← 팀 라이브러리 필요

Sprint 3: 대화형 생성 + 비교 (Sprint 1에 의존)
├── Skill Creation Chat (Intent Interview) ← Eval Viewer 필요
├── Test Case Form + Eval Runner UI ← Eval Viewer 필요
└── Side-by-side 버전 비교 ← Eval 데이터 구조 필요

Sprint 4: Polish + Admin
├── Rollback UI 강화
├── 관리자 대시보드 확장
└── Description Optimization UI (여유 시)
```

---

## Sprint 1: Foundation (2주)

**목표**: Phase 2 기능의 기반이 되는 Eval 시각화 강화 + Phase 1 이월 설계 항목 해소

### 1-1. Eval Viewer 탭 확장 (Should)

**현재**: SkillDetailPanel에 "평가 결과" 탭이 있으나 시나리오 리스트만 표시
**목표**: skill-creator의 Eval Viewer 패턴을 적용한 Outputs + Benchmark 2개 서브탭

| 컴포넌트 | 신규/수정 | 내용 |
|---------|----------|------|
| `OutputsTab.tsx` | 신규 | 개별 eval 사례: 프롬프트 + with/without 결과 비교 + evidence 표시 |
| `BenchmarkTab.tsx` | 신규 | 통과율 도넛 차트 + with/without 비교 막대 + delta 수치 |
| `FormalGradesAccordion.tsx` | 신규 | assertion별 pass/fail 접을 수 있는 아코디언 |
| `SkillDetailPanel.tsx` | 수정 | "평가 결과" 탭을 Outputs/Benchmark 서브탭으로 분리 |

**Mock 데이터 확장**: `skillMockData.ts`에 `grading.json`, `benchmark.json` 구조 추가

```typescript
// 추가할 타입
interface EvalAssertion {
  text: string;
  passed: boolean;
  evidence: string;
}
interface EvalResult {
  evalId: number;
  evalName: string;
  prompt: string;
  withSkill: { passRate: number; assertions: EvalAssertion[]; timeSeconds: number; tokens: number };
  withoutSkill: { passRate: number; assertions: EvalAssertion[]; timeSeconds: number; tokens: number };
}
interface BenchmarkSummary {
  withSkill: { passRate: StatValue; timeSeconds: StatValue; tokens: StatValue };
  withoutSkill: { passRate: StatValue; timeSeconds: StatValue };
  delta: { passRate: string; timeSeconds: string; tokens: string };
  notes: string[];
}
```

**예상 공수**: 3일

### 1-2. 정책-동작 연동 아키텍처 (Phase 1 이월)

**현재**: `SkillPolicyPanel.onSave`가 settings를 버림 — 정책 변경이 스킬 동작에 미반영
**목표**: 정책 상태를 SkillManagementView에 저장하고, 각 핸들러에서 참조

| 변경 대상 | 내용 |
|----------|------|
| `SkillManagementView.tsx` | `policySettings` 상태 추가, `onSave`에서 저장 |
| `handleUpload` | 신규 스킬의 `deployPolicy`를 `policySettings.defaultPolicy`에서 결정 |
| `handleToggle` | `evalMinPassRate` 미달 스킬 활성화 시 경고 표시 |
| `SkillPolicyPanel.tsx` | 정책 변경 시 "영향받는 스킬 N개" 미리보기 추가 |

**예상 공수**: 2일

### 1-3. 업로드 위저드 확장 (Phase 1 이월)

**현재**: tags 미수집, source 자동 'personal', 활성화 옵션 없음
**목표**: Phase 2 Publish 워크플로우의 기반이 되는 확장

| 변경 | 내용 |
|------|------|
| tags 입력 | Chip input 컴포넌트 추가 (comma-separated → 태그 배열) |
| source 선택 | 관리자인 경우 "개인/조직" 선택 드롭다운 노출 |
| 즉시 활성화 | "업로드 후 바로 활성화" 체크박스 추가 |
| 공개 범위 | "개인 전용" / "조직 배포 요청" 라디오 (Publish 기반) |

**예상 공수**: 2일

### Sprint 1 검증 기준
- [ ] Eval 상세 패널에서 Outputs/Benchmark 서브탭 전환 가능
- [ ] 정책 "차단"으로 설정 → 신규 스킬이 blocked로 생성됨
- [ ] 업로드 시 tags 입력 → 카탈로그 카드에 태그 표시됨
- [ ] TypeScript 빌드 오류 없음

---

## Sprint 2: Publish + Team (2주)

**목표**: 팀 공유 워크플로우 구현 — Figma 라이브러리 모델 적용

### 2-1. Publish 워크플로우 (Should)

스킬 상세 패널에 "팀에 공유" 버튼 추가 → Publish 모달

| 컴포넌트 | 신규/수정 | 내용 |
|---------|----------|------|
| `PublishWorkflowModal.tsx` | 신규 | 3단계: 변경 요약 입력 → 범위 선택(팀/조직) → 확인 |
| `SkillDetailPanel.tsx` | 수정 | 개요 탭에 "팀에 공유" 버튼 추가 (personal 스킬만) |

**Publish 상태 모델**:
```typescript
type PublishStatus = 'draft' | 'published' | 'pending_review';
interface PublishMetadata {
  publishedAt: Date;
  changelog: string;
  scope: 'team' | 'org';
  publishedBy: string;
}
```

**예상 공수**: 2일

### 2-2. 팀 스킬 라이브러리 (Could)

카탈로그 탭 옆에 "팀 스킬" 탭 추가

| 컴포넌트 | 신규/수정 | 내용 |
|---------|----------|------|
| `TeamSkillLibrary.tsx` | 신규 | Publish된 팀 스킬 목록 (카드 그리드 재사용) |
| `SkillManagementView.tsx` | 수정 | 4번째 탭 "팀 스킬" 추가 |

**Mock 데이터**: 기존 12개 스킬 중 source='org'인 것 + 새로 publish된 것을 팀 라이브러리에 표시

**예상 공수**: 2일

### 2-3. 업데이트 알림 + Accept/Skip (Should)

**현재**: `pendingUpdate` 배지는 있으나 확인 없이 즉시 적용
**목표**: Figma의 업데이트 리뷰 모델 적용

| 컴포넌트 | 신규/수정 | 내용 |
|---------|----------|------|
| `UpdateReviewModal.tsx` | 신규 | changelog 표시 + 이전/새 버전 Eval 비교 + Accept/Skip |
| `SkillManagementView.tsx` | 수정 | `handleApplyUpdate`에 확인 모달 삽입 |
| `ActiveSkillList.tsx` | 수정 | 업데이트 대기 스킬에 알림 배지 강화 |

**예상 공수**: 2일

### Sprint 2 검증 기준
- [ ] personal 스킬에서 "팀에 공유" → Publish 모달 → 팀 스킬 탭에 노출
- [ ] 팀 스킬 탭에서 팀원이 publish한 스킬 카드 확인 가능
- [ ] 업데이트 적용 시 리뷰 모달에서 changelog + Eval 비교 확인 후 결정
- [ ] TypeScript 빌드 오류 없음

---

## Sprint 3: 스킬 생성 경로 다양화 + 비교 (2주)

**목표**: 파일 업로드 1가지였던 스킬 생성 경로를 4가지로 확장 + Side-by-side 비교

> **배경**: 리서치에서 식별된 스킬 생성/획득 방식은 4가지이다:
> 1. 파일 업로드 (.zip/.skill) — Phase 1에서 구현 완료
> 2. 대화형 생성 (Intent Interview → Draft → Test → Eval) — 이번 Sprint
> 3. 마켓플레이스 설치 (카탈로그 원클릭) — Phase 1에서 부분 구현 (ON/OFF만)
> 4. 기존 워크플로우 캡처 ("이걸 스킬로 만들어줘") — 이번 Sprint
>
> 출처: `skill-creator-ux-workflow-patterns.md` §1, `team-skill-sharing-patterns.md` §1.1

### 3-0. 스킬 생성 진입점 통합 (Must)

현재 "스킬 추가" 버튼은 바로 업로드 위저드를 여는데, 이를 **생성 방식 선택 허브**로 변경

| 컴포넌트 | 신규/수정 | 내용 |
|---------|----------|------|
| `SkillCreateHub.tsx` | 신규 | 3가지 생성 경로 선택 카드: "대화로 만들기" / "파일 업로드" / "워크플로우에서 캡처" |
| `SkillManagementView.tsx` | 수정 | "스킬 추가" 클릭 → SkillCreateHub 모달 → 경로 선택 후 해당 위저드로 분기 |

**카드 구성**:
```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  💬 대화로 만들기  │  │  📁 파일 업로드   │  │  🔄 워크플로우    │
│                  │  │                  │  │    캡처          │
│  에이전트와 대화   │  │  .zip 또는 .skill │  │  채팅에서 수행한  │
│  하며 스킬을      │  │  파일을 드래그    │  │  작업을 자동으로  │
│  단계별로 생성    │  │  앤드롭으로 업로드 │  │  스킬로 변환     │
│                  │  │                  │  │                  │
│  [시작하기]      │  │  [업로드하기]     │  │  [캡처하기]      │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

**예상 공수**: 0.5일

### 3-1. 대화형 스킬 생성 — Intent Interview (Should)

skill-creator의 Capture Intent → Interview → Draft 패턴을 웹 UI로 구현

| 컴포넌트 | 신규/수정 | 내용 |
|---------|----------|------|
| `SkillCreationChat.tsx` | 신규 | Chat 기반 인터뷰 UI — 에이전트가 4가지 질문을 순차 제시, 사용자 응답 수집 |
| `SkillDraftPreview.tsx` | 신규 | 우측 패널에 SKILL.md 초안 실시간 렌더링 (편집 가능, Markdown preview) |
| `SkillCreationStepper.tsx` | 신규 | 진행 단계 표시: Intent → Interview → Draft → Test → Complete |

**Intent Interview 4가지 질문** (skill-creator §Capture Intent에서 차용):
1. "이 스킬이 에이전트가 무엇을 할 수 있게 해야 하나요?" → 기능적 목표
2. "어떤 상황에서 이 스킬이 트리거되어야 하나요?" → triggering 조건
3. "예상 출력 형식은 무엇인가요?" → 결과물 구조
4. "테스트 케이스를 설정할까요?" → 검증 방식 선택

**Interview 심화 질문** (skill-creator §Interview and Research에서 차용):
- Edge cases, 입출력 형식, 예제 파일, 성공 기준, 의존성 (MCP 등)
- 사용자가 간단한 스킬을 원하면 스킵 가능 ("just vibe with me" 패턴)

**Mock 동작**: 질문→응답 수집 후 SKILL.md YAML frontmatter + 본문 자동 생성 (템플릿 기반)

**예상 공수**: 3일

### 3-2. 워크플로우 캡처 — "이걸 스킬로 만들어줘" (Should)

기존 채팅 이력에서 도구 사용 패턴을 추출하여 자동으로 스킬화하는 경로

| 컴포넌트 | 신규/수정 | 내용 |
|---------|----------|------|
| `WorkflowCaptureWizard.tsx` | 신규 | 채팅 이력 선택 → 패턴 추출 미리보기 → SKILL.md 초안 생성 |
| `ChatHistorySelector.tsx` | 신규 | 최근 채팅 세션 목록에서 캡처 대상 선택 UI |

**캡처 추출 항목** (skill-creator §Capture Intent의 conversation history 패턴):
- 도구 사용 패턴 (어떤 도구를 어떤 순서로 호출했는가)
- 사용자 수정 사항 (corrections) 기록
- 입출력 형식 실제 관찰
- 사용자에게 격차(gaps) 확인 후 진행

**Mock 동작**: 하드코딩된 3개 채팅 이력 → 선택 시 추출된 패턴 미리보기 → SKILL.md 초안

**예상 공수**: 2일

### 3-3. Test Case Form + Eval Runner UI (Should)

방식 2(대화형)와 방식 4(캡처)에서 생성된 초안을 테스트하는 공통 컴포넌트

| 컴포넌트 | 신규/수정 | 내용 |
|---------|----------|------|
| `TestCaseForm.tsx` | 신규 | 테스트 프롬프트 2-3개 입력 + expected output 기술 + assertion 정의 |
| `EvalRunnerPanel.tsx` | 신규 | with_skill vs without_skill 병렬 실행 시뮬레이션 — 진행률 바 + 결과 요약 |

**Mock 동작**: 테스트 입력 후 2-3초 지연 시뮬레이션, mock grading.json 결과 → Sprint 1 OutputsTab/BenchmarkTab 재사용

**예상 공수**: 2일

### 3-4. 마켓플레이스 설치 경험 개선 (Should)

현재 카탈로그의 ON/OFF 토글을 실제 "설치" 개념으로 확장

| 컴포넌트 | 신규/수정 | 내용 |
|---------|----------|------|
| `SkillCard.tsx` | 수정 | 미설치 스킬: "설치" 버튼 표시 / 설치됨: ON/OFF 토글 |
| `SkillDetailPanel.tsx` | 수정 | 미설치 시 "설치하기" CTA + 요구사항(MCP 등) 안내 |

**상태 모델 확장**:
```typescript
type SkillInstallStatus = 'not_installed' | 'installed_active' | 'installed_inactive';
```

**예상 공수**: 1일

### 3-5. Side-by-side 버전 비교 (Could — 차별화 포인트)

IA v2에서 "다른 제품에 없음"으로 식별된 차별화 기능

| 컴포넌트 | 신규/수정 | 내용 |
|---------|----------|------|
| `VersionCompareView.tsx` | 신규 | 좌우 패널: 각 버전의 Eval 결과 + Delta 요약 |
| `DeltaSummary.tsx` | 신규 | 개선(초록)/퇴행(빨강)/동일(회색) 색상 diff |
| `RubricScoreChart.tsx` | 신규 | 레이더 차트 (Recharts) — content/structure 축 비교 |
| `VersionHistoryTable.tsx` | 수정 | 각 행에 "비교" 체크박스 추가, 2개 선택 시 비교 뷰 진입 |

**예상 공수**: 3일

### Sprint 3 검증 기준
- [ ] "스킬 추가" 클릭 → 3가지 생성 경로 선택 허브 표시
- [ ] "대화로 만들기" → 4가지 질문 순차 표시 → SKILL.md 프리뷰 생성
- [ ] "워크플로우 캡처" → 채팅 이력 선택 → 패턴 추출 → SKILL.md 초안
- [ ] 테스트 케이스 입력 → Eval 실행 시뮬레이션 → 결과 확인 (OutputsTab 재사용)
- [ ] 미설치 스킬에 "설치" 버튼 표시 → 설치 후 ON/OFF 토글로 전환
- [ ] 버전 이력에서 2개 버전 선택 → Side-by-side 비교 뷰 진입
- [ ] 레이더 차트에 rubric 점수 표시
- [ ] TypeScript 빌드 오류 없음

---

## Sprint 4: Polish + Admin (2주)

**목표**: UX 완성도 높이기 + 관리자 도구 확장

### 4-1. Rollback UI 강화

| 변경 | 내용 |
|------|------|
| 롤백 사유 입력 | `RollbackConfirmModal`에 textarea 추가 |
| 롤백 이력 표시 | `VersionHistoryTable`에 "롤백됨" 배지 + 사유 tooltip |
| 비전문가 안내 개선 | 안내 텍스트를 자연어로 변경 |

**예상 공수**: 1일

### 4-2. 관리자 대시보드 확장

| 컴포넌트 | 신규/수정 | 내용 |
|---------|----------|------|
| `SkillUsageStats.tsx` | 신규 | 스킬별 활성화 사용자 수, 카테고리별 분포 차트 |
| `AuditLogPanel.tsx` | 신규 | 변경 이력 (활성화/비활성화/정책 변경/롤백/승인) 시간순 목록 |
| `OrgSkillManagementPanel.tsx` | 수정 | CSV 내보내기 버튼 추가 |

**Mock 데이터**: 최근 30일 가상 사용 로그 생성

**예상 공수**: 3일

### 4-3. Description Optimization UI (여유 시)

| 컴포넌트 | 신규/수정 | 내용 |
|---------|----------|------|
| `DescriptionOptimizerPanel.tsx` | 신규 | should-trigger/should-not-trigger 쿼리 입력 + 최적화 결과 표시 |
| `TriggerAccuracyChart.tsx` | 신규 | iteration별 정확도 추이 라인 차트 |

**예상 공수**: 2일 (여유 시)

### Sprint 4 검증 기준
- [ ] 롤백 시 사유 입력 가능 + 이력에 사유 표시
- [ ] 관리 탭에 사용량 통계 + 감사 로그 표시
- [ ] (여유 시) Description 최적화 UI에서 쿼리 입력 + 결과 확인
- [ ] 전체 Phase 2 UX 리뷰 실행 → 크리티컬 이슈 없음
- [ ] TypeScript 빌드 오류 없음

---

## 산출물 요약

### 신규 컴포넌트 (예상 20개)

| Sprint | 컴포넌트 | 복잡도 |
|--------|---------|--------|
| 1 | OutputsTab, BenchmarkTab, FormalGradesAccordion | 중 |
| 2 | PublishWorkflowModal, TeamSkillLibrary, UpdateReviewModal | 중 |
| 3 | SkillCreateHub, SkillCreationChat, SkillDraftPreview, SkillCreationStepper, WorkflowCaptureWizard, ChatHistorySelector, TestCaseForm, EvalRunnerPanel, VersionCompareView, DeltaSummary, RubricScoreChart | 중~상 |
| 4 | SkillUsageStats, AuditLogPanel, (DescriptionOptimizerPanel, TriggerAccuracyChart) | 중 |

### 스킬 생성 경로 (Sprint 3 핵심 변경)

| # | 생성 경로 | 진입점 | 컴포넌트 | 상태 |
|---|----------|--------|---------|------|
| 1 | 파일 업로드 (.zip/.skill) | SkillCreateHub → SkillUploadWizard | 기존 | Phase 1 완료 |
| 2 | 대화형 생성 (Intent Interview) | SkillCreateHub → SkillCreationChat | 신규 | Sprint 3 |
| 3 | 마켓플레이스 설치 (원클릭) | 카탈로그 카드 "설치" 버튼 | SkillCard 수정 | Sprint 3 |
| 4 | 워크플로우 캡처 (채팅 이력 변환) | SkillCreateHub → WorkflowCaptureWizard | 신규 | Sprint 3 |

### 수정 컴포넌트 (예상 6개)

| 컴포넌트 | 주요 변경 |
|---------|----------|
| SkillManagementView | policySettings 상태, 4번째 탭, 정책-핸들러 연동 |
| SkillDetailPanel | Eval 서브탭, Publish 버튼, 비교 진입점 |
| SkillUploadWizard | tags, source, 즉시 활성화, 공개 범위 |
| VersionHistoryTable | 비교 체크박스, 롤백 배지 |
| ActiveSkillList | 업데이트 알림 배지 강화 |
| SkillPolicyPanel | 영향 범위 미리보기 |

### Mock 데이터 확장

| 추가할 데이터 | 대상 파일 |
|-------------|----------|
| EvalResult[], BenchmarkSummary | skillMockData.ts |
| PublishMetadata | skillMockData.ts |
| AuditLogEntry[] | skillMockData.ts (신규 섹션) |
| UsageStats | skillMockData.ts (신규 섹션) |

---

## 리스크 관리

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Sprint 3 대화형 생성이 예상보다 복잡 | 일정 지연 | Chat 통합 범위를 축소 (독립 페이지로 분리) |
| Recharts 레이더 차트 커스터마이즈 어려움 | UI 품질 저하 | D3.js 직접 렌더링으로 대체 |
| Mock 데이터 구조가 향후 API와 불일치 | 재작업 | API 스키마 초안을 먼저 합의하고 mock을 맞춤 |
| Phase 1 UX 이슈 재발견 | 우선순위 충돌 | Sprint 4에 버퍼 1-2일 확보 |

---

## 실행 체크리스트

- [ ] Sprint 1 시작 전: skillMockData.ts에 Eval 데이터 구조 추가
- [ ] Sprint 2 시작 전: Publish 상태 모델 타입 정의 확정
- [ ] Sprint 3 시작 전: GeneralChatView 진입점 확인 + 임베딩 가능 여부 검증
- [ ] Sprint 4 시작 전: 전체 UX 리뷰 1회 실행 (ui-ux-review 스킬)
- [ ] Phase 2 완료 후: IA v2 대비 구현 현황 매핑 업데이트
