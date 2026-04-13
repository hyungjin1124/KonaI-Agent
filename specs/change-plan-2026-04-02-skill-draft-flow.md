# Change Plan — 사용자 발화 기반 스킬 생성/편집 플로우 (Phase 1)

> **작성일**: 2026-04-02
> **근거 문서**:
> - [skill-ia-creation-flow.md](../docs/design/ia-design/skill-ia-creation-flow.md) (v1, IA 단일 출처)
> - [skill-creation-protocol.md](../docs/design/ia-design/skill-creation-protocol.md) (v3, 프로토콜)
> - [skill-ia.md (archive)](../docs/design/ia-design/archive/skill-ia.md) (v12, 저장된 스킬 IA)
> **상태**: 구현 대기

---

## 0. 컨텍스트

KonaI-Agent의 스킬 생성·편집 진입점을 **사용자 발화 단일 경로**로 일원화한다.
기존의 §3 Skill 메뉴 "새 스킬 만들기" 모달 / 업로드 위저드 / 워크플로우 캡처 위저드는 모두
범용 채팅 + 아티팩트 패널 surface 위에서 IA `skill-ia-creation-flow.md` v1이 정의한
드래프트 엔티티 모델로 대체된다.

이 문서는 IA Phase 1 스코프를 코드로 옮기기 위한 변경 계획이다.
구현은 별도 `/implement` 세션에서 수행하며, 본 문서는 그 세션의 입력 명세가 된다.

---

## 1. 사용자 결정 (4건)

| # | 결정 항목 | 결정 |
|---|----------|------|
| U1 | Mock 구동 방식 | **스크립티드 시나리오 1~2개** (LLM 호출 없음, 키워드 + 단계별 응답 테이블) |
| U2 | 구현 범위 | **PASS 경로 + FAIL 1개 + 폐기** = IA Phase 1 그대로 (편집 경로 D14 포함, FAIL 루프 상한 제외) |
| U3 | §3 Skill 메뉴 연계 | **D13 + 빈 상태 안내까지 포함** (버튼 제거 + 빈 상태/필터 라인 안내) |
| U4 | 기존 잔재 처리 | **삭제** (`SkillCreateHub.tsx`, `SkillCreationChat.tsx`, `SkillDraftPreview.tsx`) |

---

## 2. 아키텍처 개요

### 2.1 핵심 추가 요소

| 분류 | 이름 | 역할 |
|------|------|------|
| **타입** | `skill-draft.types.ts` | `SkillDraft`, `SkillDraftStatus`, `SkillDraftArtifact`, 6항목·평가·Coexistence 스키마 |
| **상태 훅** | `useSkillDraft` | CAPTURING ↔ EVALUATING ↔ EVAL_PASS / EVAL_FAIL / SAVED / DISCARDED 상태머신 + 단일 채팅 세션 종속 |
| **의도 감지 훅** | `useSkillIntentDetection` | 사용자 발화에서 "스킬로 만들어줘" 류 의도 감지 (키워드 + 정규식) |
| **시나리오 엔진** | `useScriptedSkillScenario` | U1의 스크립티드 시나리오를 단계별로 재생 (사용자 답변에 따라 다음 에이전트 응답·드래프트 패치를 결정) |
| **렌더러** | `SkillDraftRenderer` | 아티팩트 패널의 새 `previewType: 'skill-draft'` 렌더러 (§A~§E read-only) |
| **인라인 카드** | `SkillDraftInlineCard` | 채팅 내 인라인 요약 카드 (상태 배지 + 드래프트 이름 + 패널 열기 CTA) |
| **시나리오 데이터** | `skillDraftScenarios.ts` | PASS·FAIL·DISCARDED 3개 스크립트 (1~2개 유스케이스 커버) |

### 2.2 기존 시스템과의 통합 지점

- **`ArtifactPanelContext`**: `'skill-draft'`를 `ArtifactType` / `ArtifactPreviewType` 양쪽에 추가하고, Provider에 `skillDrafts: Map<draftId, SkillDraft>` 주입 채널을 새로 단다.
- **`GeneralChatView.handleSend`**: 의도 감지 → `useSkillDraft.create` → `artifactPanelRef.current?.openArtifactTab(skillDraftArtifact, 'skill-draft')` 순서. 기존 `isDashboardQuery` / `processQuery` 분기 옆에 `isSkillDraftIntent` 분기를 추가한다.
- **`ArtifactPreviewPanel.renderContent`**: switch에 `case 'skill-draft':` 추가 → `SkillDraftRenderer` 호출. 기존 PPT/마크다운/대시보드 등 렌더러와 동일 패턴.
- **`SkillsPageView` / `TeamSkillsTab`**: 신규 진입 버튼·모달은 본래 없지만 **빈 상태 메시지와 필터 옆 안내 라인**이 빠져 있어 U3 D13 사양을 새로 추가한다. `handleChatEdit` 콜백은 기존 토스트 → 실제 새 채팅 세션 생성 + 원본 드래프트 복제로 교체.

### 2.3 데이터 흐름 (PASS 경로)

```
[GeneralChatView 입력]
   │ "매출 리포트 스킬로 만들어줘"
   ▼
[useSkillIntentDetection.detect()]
   │ → { isSkillIntent: true, scenarioId: 'sales-report' }
   ▼
[useSkillDraft.create({ scenarioId, chatSessionId })]
   │ → draft = { id, status: 'CAPTURING', usecase6: {}, ... }
   │ → useScriptedSkillScenario.start(scenarioId)
   │ → 첫 에이전트 응답 (1번째 6항목 질문) 채팅에 추가
   │ → SkillDraftInlineCard 채팅에 추가
   ▼
[artifactPanelRef.openArtifactTab(draftArtifact, 'skill-draft')]
   │ → 패널 자동 오픈 → SkillDraftRenderer 마운트
   ▼
[사용자가 6항목 답변 × 6회 발화]
   │ 매 답변마다 useScriptedSkillScenario.advance(answer)
   │ → draft.usecase6 패치 → 패널 실시간 업데이트
   │ → 마지막에 데이터 권한·Coexistence 자동 결정
   ▼
[사용자 발화: "이대로 진행해줘"]
   │ → useSkillDraft.transitionTo('EVALUATING')
   │ → useScriptedSkillScenario.runEval() (3회 시뮬레이션, 각 회차 setTimeout)
   ▼
[3/3 PASS → useSkillDraft.transitionTo('EVAL_PASS')]
   │ → 패널 §E "스킬 라이브러리에 저장" CTA 활성
   ▼
[사용자 클릭 또는 발화 "저장해줘"]
   │ → useSkillDraft.save() → 새 TeamSkill v1 생성
   │ → onSkillsChange((prev) => [newSkill, ...prev])
   │ → status: 'SAVED' → 인라인 카드가 "저장 완료 → 스킬 보기" 링크로 전환
```

FAIL 경로는 `runEval()`이 2/3 PASS를 반환 → `EVAL_FAIL` → 채팅에 수정 제안 메시지 → 사용자가 "출력은 항상 표 형식으로 고정해줘" 발화 → `useScriptedSkillScenario.advance(...)` 가 6항목 패치 + 자동으로 `transitionTo('CAPTURING')` → 다시 "검증해줘" 발화 시 EVALUATING → 두 번째 시도는 3/3 PASS 분기.

폐기 경로는 어느 상태에서든 "취소"/"폐기"/"필요 없어" 키워드 감지 시 `useSkillDraft.discard()` → `EVALUATING` 이상이면 채팅에 확인 프롬프트(인라인 카드 위에 시스템 메시지) → 확인 시 `'DISCARDED'` 전이 + 인라인 카드 비활성화.

---

## 3. 신규 파일

### 3.1 타입

**`src/types/skill-draft.types.ts`** (신규)

```ts
import type { Artifact } from '@/components/features/agent-chat/types';
import type { TeamSkill } from './skill-management.types';

export type SkillDraftStatus =
  | 'CAPTURING'
  | 'EVALUATING'
  | 'EVAL_PASS'
  | 'EVAL_FAIL'
  | 'SAVED'
  | 'DISCARDED';

export type DataPermissionVerdict =
  | 'A_FULL_PASS'
  | 'C_SCOPE_REDUCED'
  | 'D_INFEASIBLE';

export interface SkillDraftUsecase6 {
  when: string;
  what: string;
  dataSources: string[];
  outputFormat: string;
  triggerPhrases: string[];
  successCriteria: string;
}

export interface DataPermissionResult {
  verdict: DataPermissionVerdict;
  scopeReductionNote?: string;
  infeasibilityReason?: string;
}

export interface CoexistenceNeighbor {
  skillId: string;
  name: string;
  author: string;
  similarityScore: number;
}

export type CoexistenceUserDecision =
  | 'NEW'
  | 'INHERIT_ROLE'
  | 'MERGE'
  | null;

export interface CoexistenceCheckResult {
  neighbors: CoexistenceNeighbor[];
  userDecision: CoexistenceUserDecision;
  autoCopyFallback: boolean;
}

export interface EvalRun {
  runIndex: 1 | 2 | 3;
  executorOutput: string;
  graderVerdict: 'PASS' | 'FAIL';
  graderRationale: string;
  timestamp: string;
}

export interface SkillDraftBody {
  description: string;
  triggerConditions: string;
  bodyContent: string;
  referencedDataViews: string[];
}

export interface SkillDraft {
  id: string;
  chatSessionId: string;
  status: SkillDraftStatus;
  createdAt: string;
  updatedAt: string;

  /** 편집 모드만 채워짐 */
  originSkillId: string | null;
  originVersion: string | null;

  /** 시나리오 진행 상태 (mock 전용) */
  scenarioId: string;
  scenarioStep: number;

  draftName: string;          // 6항목 캡처 후 자동 생성
  usecase6: Partial<SkillDraftUsecase6>;
  dataPermission: DataPermissionResult | null;
  coexistence: CoexistenceCheckResult | null;
  evalRuns: EvalRun[];
  body: SkillDraftBody | null;
}

/** Artifact 타입 시스템과의 연결 */
export interface SkillDraftArtifact extends Artifact {
  type: 'skill-draft';
  draftId: string;
}

/** 저장 시 TeamSkill로 변환하는 헬퍼 시그니처 (구현은 useSkillDraft 안에서) */
export type DraftToSkillConverter = (
  draft: SkillDraft,
) => Omit<TeamSkill, 'id'>;
```

### 3.2 시나리오 데이터

**`src/components/features/skill-draft/data/skillDraftScenarios.ts`** (신규)

PASS/FAIL/DISCARDED 3개 분기를 한 시나리오에 묶고, 다음 구조로 단계 테이블을 정의한다.

```ts
export interface ScenarioStep {
  /** CAPTURING 단계의 i번째 에이전트 발화 */
  agentMessage: string;
  /** 사용자 답변 시 드래프트에 적용할 패치 (함수 형태로 prevDraft 받기) */
  applyPatch: (input: string, draft: SkillDraft) => Partial<SkillDraft>;
  /** 단계 완료 후 자동 시스템 액션 (옵션) */
  autoAction?: 'SET_PERMISSION_A' | 'SET_COEXISTENCE_NONE';
}

export interface SkillDraftScenario {
  id: string;
  triggerKeywords: string[];   // useSkillIntentDetection이 매칭하는 키워드
  draftNameTemplate: string;
  steps: ScenarioStep[];       // 6항목 + 진행 트리거 발화
  evalPassRuns: EvalRun[];     // 3/3 PASS용 결과 세트
  evalFailFirstRuns: EvalRun[];// 1차 시도용 2/3 PASS 결과 세트
  failRecoveryHint: string;    // FAIL 후 에이전트 제안 문구
  failRecoveryKeywords: string[]; // 사용자 수정 발화 키워드 → 자동 회복
  bodyOnSave: SkillDraftBody;
}

export const SCENARIOS: SkillDraftScenario[] = [
  // (1) 매출 리포트 스킬 — 메인 PASS 시나리오
  // (2) 회의록 요약 스킬 — FAIL 1차 후 회복 PASS 시나리오 (선택)
];
```

> 시나리오는 1~2개. 둘 다 만들기 어렵다면 매출 리포트 1개에 PASS + FAIL 분기를 모두 담는다 (사용자 답변 키워드로 분기).

### 3.3 훅

**`src/components/features/skill-draft/hooks/useSkillDraft.ts`** (신규)

상태머신 전이 함수와 단일 인스턴스 제약 (한 채팅 세션에 1개) 보장.

```ts
export interface UseSkillDraftReturn {
  draft: SkillDraft | null;
  create: (params: { scenarioId: string; chatSessionId: string }) => SkillDraft;
  applyPatch: (patch: Partial<SkillDraft>) => void;
  transitionTo: (next: SkillDraftStatus) => void;
  save: () => TeamSkill | null;     // SAVED 전이 + TeamSkill 변환
  discard: () => void;
  reset: () => void;
}
```

내부 구현은 `useState<SkillDraft | null>` + `useCallback` 헬퍼. 채팅 세션 변경 시 `useEffect`로 자동 reset.

**`src/components/features/skill-draft/hooks/useSkillIntentDetection.ts`** (신규)

```ts
export interface SkillIntentResult {
  isSkillIntent: boolean;
  scenarioId?: string;
  isDiscardIntent?: boolean;
  isProgressIntent?: boolean;     // "이대로 진행" / "검증해줘"
  isSaveIntent?: boolean;         // "저장해줘"
}

export function useSkillIntentDetection(): {
  detect: (utterance: string, currentDraft: SkillDraft | null) => SkillIntentResult;
};
```

키워드 + 시나리오 매칭으로 분류. 진행/저장/폐기 의도는 현재 드래프트 상태에 따라 다르게 해석.

**`src/components/features/skill-draft/hooks/useScriptedSkillScenario.ts`** (신규)

시나리오 단계 진행 + 평가 시뮬레이션을 담당.

```ts
export interface UseScriptedSkillScenarioReturn {
  start: (scenarioId: string) => { initialAgentMessage: string };
  advance: (
    userInput: string,
    draft: SkillDraft,
  ) => {
    patch: Partial<SkillDraft>;
    nextAgentMessage: string;
    isCaptureComplete: boolean;
  };
  runEval: (
    draft: SkillDraft,
    forcePass: boolean,
  ) => Promise<{ runs: EvalRun[]; pass: boolean }>;
}
```

- `runEval`은 setTimeout으로 1초 간격 3회 결과 누적 (UX상 진행 표시)
- `forcePass`는 FAIL 후 두 번째 시도에서 항상 PASS로 떨어지도록 시나리오에서 결정

### 3.4 컴포넌트

**`src/components/features/skill-draft/components/SkillDraftRenderer.tsx`** (신규)

`ArtifactPreviewPanel`에서 호출되는 read-only 렌더러. IA §4.2 패널 구조 그대로 §A~§E 섹션을 표시한다. 액션 바(§E)의 콜백은 props로 받는다.

```tsx
interface SkillDraftRendererProps {
  draft: SkillDraft;
  onSave: () => void;
  onDiscard: () => void;
}
```

- §A 유스케이스 6항목: CAPTURING이면 체크리스트 (채워진 항목/전체), 이후엔 확정 요약
- §B 데이터 권한: A/C/D 색상 구분 + C·D는 사유 노트
- §C Coexistence: 근접 스킬 목록 + 사용자 결정 결과 ("새로 만들기 선택됨")
- §D 자동 평가: 회차별 PASS/FAIL 칩 + Grader rationale
- §E 액션 바: EVAL_PASS면 [저장] CTA, 전 상태 [폐기]

스타일은 기존 `MarkdownRenderer` / `SlideOutlineRenderer` 와 동일한 톤 (Tailwind, 좁은 패딩, 회색 보더).

**`src/components/features/skill-draft/components/SkillDraftInlineCard.tsx`** (신규)

채팅 내 인라인 카드. 클릭 시 `artifactPanelRef.openArtifactTab` 호출로 패널 재오픈.

```tsx
interface SkillDraftInlineCardProps {
  draft: SkillDraft;
  onOpen: () => void;
}
```

상태 배지 ("새로 만드는 중", "저장 완료", "폐기됨") + 드래프트 이름 + 진행 단계 문구 + 우측 화살표.

### 3.5 디렉토리 구조

```
src/
├── components/features/skill-draft/   ← 신규
│   ├── components/
│   │   ├── SkillDraftRenderer.tsx
│   │   └── SkillDraftInlineCard.tsx
│   ├── hooks/
│   │   ├── useSkillDraft.ts
│   │   ├── useSkillIntentDetection.ts
│   │   └── useScriptedSkillScenario.ts
│   └── data/
│       └── skillDraftScenarios.ts
└── types/
    └── skill-draft.types.ts            ← 신규
```

---

## 4. 기존 파일 수정

### 4.1 아티팩트 시스템 확장

**`src/components/features/agent-chat/types.ts`**
- `ArtifactType`에 `'skill-draft'` 추가
- `ArtifactPreviewType`에 `'skill-draft'` 추가
- 기존 패턴(`SlideOutlineArtifact`)에 맞춰 `SkillDraftArtifact` 인터페이스를 export 또는 위 신규 타입에서 re-export

**`src/components/features/agent-chat/components/ArtifactPreviewPanel/ArtifactPreviewPanel.tsx`**
- `renderContent()` switch에 `case 'skill-draft':` 추가
- `useArtifactPanel()` Provider에서 `skillDrafts` Map 또는 `currentDraft` 주입을 받아 `SkillDraftRenderer`에 전달
- 저장·폐기 콜백은 Provider에 등록한 `onSkillDraftSave` / `onSkillDraftDiscard` 핸들러를 호출

**`src/components/features/agent-chat/context/ArtifactPanelContext.tsx`**
- Provider state에 `skillDrafts: Map<string, SkillDraft>` 와 핸들러 등록 슬롯 추가
- `setSkillDraft(draft)` / `removeSkillDraft(draftId)` / `registerSkillDraftHandlers({ onSave, onDiscard })` API 노출
- 새 ArtifactTab의 `previewType === 'skill-draft'` 시 데이터 조회 경로

**`src/components/features/agent-chat/components/ArtifactTabBar`** (또는 동등 파일)
- `'skill-draft'` 아이콘·라벨 매핑 추가 (lucide-react `Sparkles` 또는 `Wand2` 권장)

### 4.2 채팅 통합

**`src/components/features/general-chat/GeneralChatView.tsx`**
- `useSkillDraft`, `useSkillIntentDetection`, `useScriptedSkillScenario` 마운트
- `handleSend` 안에서:
  1. `intentDetection.detect(input, draft)` 호출
  2. `isSkillIntent && !draft` → `useSkillDraft.create()` → `start()` → `addMessage(agent)` → `artifactPanelRef.openArtifactTab(draftArtifact, 'skill-draft')` → `setSkillDraft(draft)` (Context에 주입)
  3. `draft && !isProgressIntent && !isSaveIntent && !isDiscardIntent` → `advance(input, draft)` → patch 적용 → 에이전트 응답 추가
  4. `isProgressIntent && draft.status === 'CAPTURING'` → `transitionTo('EVALUATING')` → `runEval` 비동기 실행 → 결과에 따라 `EVAL_PASS` / `EVAL_FAIL`
  5. `isSaveIntent && draft.status === 'EVAL_PASS'` → `useSkillDraft.save()` → 새 TeamSkill을 외부에 전달 (콜백 prop 또는 글로벌 store)
  6. `isDiscardIntent` → 확인 단계 후 `discard()`
- `ArtifactPanelBridge` 등록 단계에서 `skill-draft` 핸들러 (`onSave`, `onDiscard`) 콜백을 Context에 등록

> **참고**: 저장된 TeamSkill을 어디로 보낼지는 현재 채팅 뷰가 SkillsPageView와 분리돼 있어 직접 연결이 안 된다. Phase 1에서는 **localStorage 또는 글로벌 React Context** 한쪽 (둘 중 가벼운 쪽)으로 임시 저장 + `mockTeamSkills` 초기값과 합쳐서 SkillsPageView가 읽도록 한다. 영구 저장소는 Phase 2 작업.

### 4.3 §3 Skill 메뉴 (D13)

**`src/components/features/skill-management/components/TeamSkillsTab.tsx`**
- 현재 "새 스킬 만들기" 버튼은 이미 없음 → **빈 상태 분기 추가**가 핵심
- `filteredSkills.length === 0 && skills.length === 0` 분기를 새로 만들고 다음 표시:
  ```
  ┌────────────────────────────────────┐
  │   아직 등록된 스킬이 없습니다.       │
  │   새 스킬은 AI 채팅에서 만들 수      │
  │   있습니다 →                        │
  │   [AI 채팅으로 가기]                │
  └────────────────────────────────────┘
  ```
- 클릭 시 `router.push('/chat?prompt=...')` 또는 `usePathname` + `useRouter`로 chat 라우트 이동
- `SkillFilters` 우측에 작은 인라인 안내 라인 `💡 새 스킬은 AI 채팅에서` 텍스트 링크 추가 (스킬 0개가 아닐 때도 노출)

**`src/components/features/skill-management/components/SkillSlidePanel.tsx`** (간접)
- `onChatEdit` prop의 호출 경로를 그대로 두되, `TeamSkillsTab.handleChatEdit`를 다음으로 교체:
  ```ts
  const handleChatEdit = useCallback((skill: TeamSkill) => {
    router.push(`/chat?editSkillId=${skill.id}`);
  }, [router]);
  ```
- chat 라우트의 `GeneralChatView`가 query string `editSkillId`를 읽어 `useSkillDraft.create({ originSkillId, ... })` 로 편집 모드 드래프트를 생성한다.

### 4.4 시나리오 자동 트리거 (선택)

`SkillsPageView`에서 [AI 채팅으로 가기] 클릭 시 `?prompt=...` 또는 `?intent=create-skill` 쿼리를 같이 넘겨, `GeneralChatView`가 마운트 직후 시스템 메시지 한 줄(`"어떤 스킬을 만들어볼까요?"`)을 자동으로 띄우게 한다. 이 부분은 기존 라우팅 패턴(`useSearchParams`) 활용.

---

## 5. 삭제할 파일 (U4)

```
src/components/features/skill-management/components/SkillCreateHub.tsx
src/components/features/skill-management/components/SkillCreationChat.tsx
src/components/features/skill-management/components/SkillDraftPreview.tsx
```

세 파일 모두 import 그래프에서 고립돼 있고, 존재하지 않는 `SkillCreationPath` / `Skill` 타입을 참조해 빌드 시 dead code다.
삭제 전 마지막 한 번 더 `Grep` 으로 다른 import가 없는지 확인.

> **유지**: `SkillCreationStepper.tsx`, `SkillUploadWizard.tsx`, `WorkflowCaptureWizard.tsx` 는 별도 검증 후 결정. 이번 스코프에서는 건드리지 않는다.

---

## 6. 구현 순서 (Phase 분할)

| Step | 작업 | 산출물 |
|------|------|--------|
| **S1** | 타입·시나리오 데이터 정의 | `skill-draft.types.ts`, `skillDraftScenarios.ts` |
| **S2** | 훅 3종 구현 + 단위 동작 (콘솔 로그로) 확인 | `useSkillDraft.ts`, `useSkillIntentDetection.ts`, `useScriptedSkillScenario.ts` |
| **S3** | 렌더러·인라인 카드 + Storybook 없이 임시 데모 페이지 1매로 시각 확인 | `SkillDraftRenderer.tsx`, `SkillDraftInlineCard.tsx` |
| **S4** | `agent-chat/types.ts` + Context + ArtifactPreviewPanel 확장 (skill-draft 등록) | 위 3개 파일 수정 |
| **S5** | `GeneralChatView.handleSend` 의도 분기 + Bridge 핸들러 등록 | `GeneralChatView.tsx` 수정 |
| **S6** | PASS 시나리오 E2E 수동 테스트 | 매출 리포트 시나리오 동작 |
| **S7** | FAIL 시나리오 + DISCARDED 분기 추가·검증 | 두 번째 시나리오 또는 분기 |
| **S8** | §3 빈 상태·필터 라인 안내 + `handleChatEdit` 교체 | `TeamSkillsTab.tsx` 수정 |
| **S9** | 편집 경로 (D14): chat 라우트의 `editSkillId` 파싱 → `create({ originSkillId })` | `GeneralChatView.tsx` 추가, `useSkillDraft` 보강 |
| **S10** | 잔재 3파일 삭제 + 빌드/타입체크 통과 확인 | 삭제 + `npm run build` |

각 Step은 메인 컨텍스트에서 직접 진행한다 (서브에이전트 사용 없음 — 파일 수가 많지만 모두 좁은 범위).
S6/S7 검증은 dev 서버에서 수동 시나리오 재생.

---

## 7. 검증 계획

### 7.1 자동 검증
- `npm run build` (또는 `npm run typecheck`) — 모든 신규·수정 파일 타입 안전성
- 잔재 3파일 삭제 후 import 누락 없는지 빌드로 확인

### 7.2 수동 시나리오 (E2E)

**시나리오 A — PASS 경로**
1. `/chat` 진입 → "매출 리포트 스킬로 만들어줘" 입력
2. 인라인 카드 + 패널 자동 오픈, §A 6항목 체크리스트 0/6
3. 6번 답변 발화 → 매번 패널 §A 진행률 갱신, §B/§C 자동 확정
4. "이대로 진행해줘" → 패널 §D에 회차 1/2/3 PASS 결과가 1초 간격으로 등장
5. EVAL_PASS 배지 + §E [스킬 라이브러리에 저장] 활성화
6. "저장해줘" → 인라인 카드가 "저장 완료 → 스킬 보기"로 변화
7. `/skills` 이동 → 팀 스킬 테이블 최상단에 새 스킬 v1

**시나리오 B — FAIL → 회복 → PASS**
1. 시나리오 A를 한 번 더 시작 (또는 두 번째 시나리오)
2. "이대로 진행해줘" 시점에 `runEval` 이 1차에서 2/3 PASS를 반환하도록 시나리오 분기
3. 채팅에 수정 제안 메시지 등장, EVAL_FAIL 배지
4. "출력은 항상 표 형식으로 고정해줘" 발화 → §A 의 outputFormat 패치 + CAPTURING 복귀
5. "다시 검증해줘" → EVAL_PASS → 저장

**시나리오 C — 폐기**
1. 시나리오 A 진행 중 6항목 절반쯤에서 "취소해줘" 발화
2. CAPTURING 단계라 확인 프롬프트 없이 즉시 DISCARDED 전이
3. 인라인 카드가 회색 "드래프트 폐기됨" 으로 비활성

**시나리오 D — 편집 경로 (D14)**
1. `/skills` → 임의 스킬 행 클릭 → 패널 [채팅에서 편집]
2. `/chat?editSkillId=...` 로 이동 → 새 채팅 자동 생성
3. 패널이 원본 스킬 내용으로 채워진 CAPTURING 드래프트로 자동 오픈
4. "트리거 조건만 바꿔줘" 발화 → 동일 PASS 경로 → 저장 시 새 버전 누적

**시나리오 E — §3 빈 상태**
1. `mockTeamSkills`를 임시로 빈 배열로 만들고 `/skills`
2. 빈 상태 카드 + [AI 채팅으로 가기] 노출 확인
3. 클릭 → `/chat?intent=create-skill` 로 이동, 에이전트 첫 메시지 자동 표시

### 7.3 회귀 위험
- `ArtifactType` enum 확장은 기존 switch 문 모두 영향 — TypeScript exhaustive check가 잡아냄
- `ArtifactPanelContext` API 추가는 기존 소비자에 영향 없음 (옵셔널)
- `GeneralChatView.handleSend`는 기존 분기 (대시보드/일반 쿼리) 위에 의도 감지를 **선두에** 두므로, 의도 감지 실패 시 기존 경로로 fall-through 보장 필요

---

## 8. 스코프 밖 (Phase 2 이후)

- 인터럽트 카드 진입 (에이전트 선제 제안)
- FAIL 루프 N회 상한 + 자동 포기 권고
- 다중 드래프트 (한 채팅 ≥2)
- 실제 LLM 연동 (Executor/Grader)
- 드래프트 영속성 (현재는 in-memory + 페이지 리로드 시 소실)
- 관리자 뷰의 드래프트 가시성
- 마켓플레이스 참조 스킬의 편집 금지 표시

---

## 9. 리스크 & 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 채팅과 SkillsPageView가 분리된 라우트라 새 스킬을 즉시 §3 테이블에 반영하기 어려움 | 시나리오 A 마지막 단계가 끊김 | localStorage + 페이지 마운트 시 머지, 또는 가벼운 React Context (`SkillsStoreProvider`) 도입 |
| `useScriptedSkillScenario` 가 단계 진행을 잘못 매칭해 사용자 발화가 무한 루프 | UX 파괴 | 답변 키워드 매칭 실패 시 기본 fall-through(다음 단계 강제 진행) 보장 + 콘솔 경고 |
| `ArtifactPreviewPanel` 의 기존 props (documentData 등)와 충돌 | 다른 아티팩트 깨짐 | Context 확장은 기존 필드 건드리지 않고 추가만, switch case도 끝에 추가 |
| 잔재 3파일 삭제 시 어딘가에서 import (검색 누락) | 빌드 실패 | 삭제 전 `Grep "SkillCreateHub|SkillCreationChat|SkillDraftPreview"` 재실행 + 빌드 |
| 기존 `handleChatEdit` 가 토스트만 띄우고 끝났던 동작에 의존하는 다른 경로 존재 | 사이드 이펙트 | `Grep "handleChatEdit"` 로 호출처 전수 확인 후 교체 |

---

## 10. 산출물 체크리스트

구현 완료 시 다음이 모두 충족되어야 한다.

- [ ] 신규 9개 파일 생성 (타입 1, 시나리오 1, 훅 3, 컴포넌트 2, 디렉토리 구조 2)
- [ ] 기존 5개 파일 수정 (`agent-chat/types.ts`, `ArtifactPreviewPanel`, `ArtifactPanelContext`, `ArtifactTabBar`, `GeneralChatView`)
- [ ] §3 1개 파일 수정 (`TeamSkillsTab`)
- [ ] 잔재 3개 파일 삭제
- [ ] 시나리오 A~E 수동 실행 통과
- [ ] `npm run build` 통과
- [ ] `tasks/lessons.md` 업데이트 (작업 중 발견한 패턴)

---

## 11. 변경 이력

| 버전 | 날짜 | 변경 |
|------|------|------|
| v1 | 2026-04-02 | 초안. 사용자 결정 4건 반영, IA Phase 1 스코프 그대로 옮김. |
