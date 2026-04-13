# KonaI-Agent — Project Guide for Claude Code

## Project Overview

KonaI-Agent는 AI 에이전트 기반 엔터프라이즈 대시보드 애플리케이션이다.
채팅 인터페이스, 에이전트 시나리오 오케스트레이션, 라이브보드 대시보드,
관리자 패널 등 다양한 뷰를 포함한다.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 18, Tailwind CSS, Radix UI
- **Visualization**: Recharts, react-grid-layout, ReactFlow
- **State**: React Context (전역 상태), 컴포넌트 로컬 state
- **Language**: TypeScript (strict mode)

## Directory Structure

```
src/
├── app/                          # Next.js App Router 페이지
│   ├── page.tsx                  # 메인 페이지
│   ├── chat/                     # 채팅 뷰
│   ├── admin/                    # 관리자 뷰
│   ├── data/                     # 데이터 파이프라인
│   └── agent/                    # 에이전트 시나리오 (ppt, analysis)
│
├── components/
│   ├── ui/                       # Base UI 컴포넌트 (Radix UI 래핑)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   ├── features/                 # Feature 단위 컴포넌트 그룹
│   │   ├── general-chat/         # 채팅 기능
│   │   │   ├── GeneralChatView.tsx
│   │   │   └── components/
│   │   │       ├── ChatPanel/
│   │   │       └── LeftSidebar/
│   │   ├── liveboard/            # 대시보드
│   │   │   ├── LiveboardView.tsx
│   │   │   └── components/widgets/
│   │   ├── dashboard/            # 대시보드 하위 기능
│   │   │   ├── components/
│   │   │   └── data/
│   │   ├── ppt/                  # PPT 생성 시나리오
│   │   └── data/                 # 데이터 관리
│   │
│   ├── ChatInterface.tsx         # 공통 채팅 인터페이스
│   ├── ChatHistoryView.tsx       # 채팅 이력 뷰
│   ├── AdminView.tsx             # 관리자 뷰
│   ├── Sidebar.tsx               # 글로벌 네비게이션
│   └── ...
│
├── hooks/                        # Custom React Hooks
│   ├── useScenarioOrchestration.ts
│   ├── usePPTScenario.ts
│   └── useSlideOutlineHITL.ts
│
├── context/                      # React Context Providers
│   └── NotificationContext.tsx
│
├── constants/                    # 상수 정의
│   ├── navigation.ts
│   └── widgets.ts
│
├── types/                        # TypeScript 타입 정의
│
└── lib/                          # 유틸리티, API 클라이언트
```

## Naming Conventions

- **컴포넌트 파일**: PascalCase (`ChatPanel.tsx`, `DrillDownContextMenu.tsx`)
- **Hook 파일**: camelCase, `use` prefix (`useScenarioOrchestration.ts`)
- **상수 파일**: camelCase (`navigation.ts`, `widgets.ts`)
- **타입 파일**: camelCase 또는 PascalCase (프로젝트 기존 패턴 따름)
- **디렉토리**: kebab-case (`general-chat/`, `left-sidebar/`)

## Component Conventions

### 새 컴포넌트 작성 시 규칙

1. **Feature 컴포넌트**는 `src/components/features/{feature-name}/` 아래에 배치
2. **공유 UI 프리미티브**는 `src/components/ui/` 아래에 배치
3. 컴포넌트 Props는 같은 파일 또는 `src/types/`에 인터페이스로 정의
4. Radix UI를 기본 프리미티브로 사용 — 가능하면 Radix 컴포넌트를 래핑
5. 스타일링은 Tailwind CSS utility classes 사용 (인라인 style 지양)
6. 복잡한 상태 로직은 커스텀 Hook으로 분리 (`src/hooks/`)

### 컴포넌트 파일 구조 (권장)

```tsx
// 1. Imports
import { useState, useCallback } from 'react';
import { SomeRadixComponent } from '@radix-ui/react-xxx';

// 2. Types
interface ComponentNameProps {
  // ...
}

// 3. Component
export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // hooks
  // handlers
  // render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

## Key References

### Component Catalog

- **위치**: `specs/component-catalog.yaml`
- **역할**: 컴포넌트의 상태 추적 + 코드 매핑
- **핵심 필드**: `status`, `priority`, `source_files`, `obsidian_sources`, `last_researched`

Status 값:
- `implemented` — 구현 완료
- `partial` — 부분 구현
- `not_implemented` — 미구현
- `research_needed` — 리서치 필요 (신규 발견)
- `needs_update` — 구현 완료이나 개선 리서치 발견
- `deprecated` — 더 이상 필요 없음 (대체됨)

### Obsidian Vault (단일 지식 출처)

**Karpathy LLM Wiki 원칙**: KonaI-Agent의 모든 비-코드 산출물(설계·기획·결정·참조·리서치)은 Vault에서 단일 출처로 관리하며, 코드 저장소(`docs/`)에는 자동화·QA 산출물(`reports/`), 바이너리 참조(`references/*.{xlsx,docx,html}`), `INDEX.md`만 잔존한다.

- **Vault 루트**: `/Users/hyungjin/Documents/Obsidian Vault/KonaChain`
- **두 대분류**:
  - `KonaChain/KonaI-Agent/` — 프로젝트 산출물
    - `설계/` (IA, 와이어프레임 프롬프트, skill creation 프로토콜) + `archive/`
    - `기획/` (상세 기획서, 데이터 접근 정책, 서비스 플랜)
    - `ADR/` (`ADR-XXXX-*.md`)
    - `참조/` (외부 자료, Cowork 슬라이드, 다이어그램) + `archive/`, `admin/`
    - `_CONTEXT.md` (구조 가이드)
  - `KonaChain/리서치/Insights/` — 3-Layer 리서치 (raw → synthesis → decision)
    - 카테고리: `agent-ui/`, `agent-skills/`, `knowledge-data/`, `platform-admin/`, `skill-management-ux/`, `market/`, `open-source/`
    - 각 카테고리 하위 `sources/`에 raw-research 원문 보관
    - `agent-ui/patterns/{topic-slug}.md` 형태의 synthesis 문서
- **catalog 매핑 필드**:
  - `obsidian_sources` — Vault 루트(`KonaChain`) 기준 상대 경로 (예: `리서치/Insights/agent-ui/patterns/markdown-renderer.md` 또는 `KonaI-Agent/설계/menu-structure.md`)
  - `last_researched` — 마지막 리서치 일자
- **synthesis ↔ raw 역참조**: synthesis 문서의 frontmatter `related_raw_sources`로 동일 카테고리 `sources/` 내 원문을 역연결

Claude Code가 obsidian_sources를 참조할 때 경로 조립:
```
/Users/hyungjin/Documents/Obsidian Vault/KonaChain/{obsidian_sources_value}
```

### AGENTS.md (Vault 라우팅 허브)

Vault 루트의 `AGENTS.md`는 역할별 문서 라우팅 가이드이다.
`/research`와 `/discover` 파이프라인에서 `frontend_agent` 역할의
`primary_sources`를 참조하여 broad 문서 컨텍스트를 수집한다.

- **위치**: `{Vault 경로}/AGENTS.md`
- **용도**: 리서치 시 broad 문서 → specific 문서 계층 탐색의 시작점

### Context 라우팅

| Context | Routes | 설명 |
|---------|--------|------|
| chat_view | `/`, `/chat` | 메인 대화 인터페이스 |
| artifact_panel | `/chat` | 에이전트 생성 결과물 패널 |
| liveboard | `/`, `/liveboard` | 위젯 기반 대시보드 |
| admin | `/admin`, `/settings` | 관리자 인터페이스 |
| monitoring | — | 모니터링 |
| data_pipeline | `/data` | 데이터 파이프라인 |
| agent_scenario | `/agent/ppt`, `/agent/analysis` | 멀티스텝 시나리오 |
| global | `*` | 공통 |

## Automation Pipeline

5단계 역할 기반 파이프라인. 각 커맨드가 하나의 역할(서브에이전트)을 맡는다.
각 단계는 별도 Claude Code 세션에서 실행하며, 파일 기반으로 핸드오프한다.

### 전체 플로우

```
/discover (Scanner)
    ↓ discovery report
/review (Tech Lead) ← 사용자 체크포인트
    ↓ approved items
/research (Researcher)
    ↓ catalog 갱신
/implement (Developer) + Dev Test
    ↓ implementation logs
/qa (QA Engineer)
    ↓ PASS → 완료
    ↓ FAIL → fix-request → /implement 수정 모드 → /qa 재검증 (최대 3회)
```

### 커맨드 요약

| 커맨드 | 역할 | 입력 | 출력 |
|--------|------|------|------|
| `/discover` | Scanner | (선택) 카테고리/경쟁사 | discovery report |
| `/review` | Tech Lead | (선택) 리포트 파일명 | review decision (APPROVE/DEFER/REJECT) |
| `/research {topic}` | Researcher | component_id 또는 자유 주제 | 리서치 문서 + catalog 갱신 |
| `/implement {id}` | Developer | component_id | 소스 코드 + dev test + 단위 테스트 |
| `/qa {id}` | QA Engineer | component_id | QA report (PASS/CONDITIONAL/FAIL) |

### 오케스트레이션 스크립트

```bash
# 전체 파이프라인 (discover부터)
./scripts/pipeline.sh

# review부터 시작 (discover는 이미 실행)
./scripts/pipeline.sh --from=review

# discover만 실행 (매일 자동화용)
./scripts/pipeline.sh --discover-only
```

### 개별 커맨드 사용 예

```bash
# 전체 동향 스캔
/discover

# 특정 경쟁사 스캔
/discover cursor

# 최근 리포트 검토
/review

# 기존 컴포넌트 리서치
/research citation_source_link

# 컴포넌트 구현 + dev test
/implement citation_source_link

# QA 검증
/qa citation_source_link

# 자동 선정 모드
/implement
/qa
```

### 핸드오프 파일

| 파일 | 생성자 | 소비자 |
|------|--------|--------|
| `specs/discovery-reports/{date}.md` | /discover | /review |
| `specs/review-decisions/{date}.md` | /review | 사용자, /research |
| `specs/implementation-logs/{id}/select.md` | /implement | /qa |
| `specs/implementation-logs/{id}/plan.md` | /implement | /qa |
| `specs/implementation-logs/{id}/dev-test.md` | /implement | /qa |
| `specs/implementation-logs/{id}/qa-report.md` | /qa | /implement (수정 모드) |
| `specs/implementation-logs/{id}/fix-request.md` | /qa | /implement (수정 모드) |

## 워크플로우 오케스트레이션

### 1. 플랜 모드 기본값

– 비자명한 작업(3단계 이상 또는 아키텍처 결정)에는 반드시 아래 포맷으로 플랜을 출력한 후 진행할 것:
  ```
  PLAN:
  - 수정 파일: [목록]
  - 리스크: [잘못될 경우 무엇이 깨지는가]
  - 접근 방식: [한 줄 요약]
  진행합니다 / 확인 필요?
  ```
– 일이 틀어지면 즉시 STOP하고 위 포맷으로 재계획 — 계속 밀어붙이지 말 것
– 빌드뿐 아니라 검증 단계에도 위 포맷 적용
– 모호한 요청은 스펙을 먼저 작성하고 확인받은 후 진행

### 2. 서브에이전트 전략

메인 컨텍스트 윈도우 오염을 막기 위해 Task 도구로 서브에이전트를 적극 활용한다.

서브에이전트를 써야 하는 상황:
– 독립적으로 실행 가능한 작업이 2개 이상 병렬로 존재할 때
– 리서치/탐색 결과가 메인 작업 컨텍스트를 오염시킬 위험이 있을 때
– 테스트 실행, 로그 분석처럼 결과만 필요하고 과정은 불필요할 때
– 파일 분석 범위가 넓어 메인 컨텍스트에 다 담기 어려울 때

서브에이전트 호출 규칙:
– 에이전트당 태스크는 반드시 1개. "이것저것 알아봐"는 금지
– 호출 전에 다음을 명시할 것:
  ```
  Task: [단일 목적 동사로 시작하는 구체적 지시]
  Input: [필요한 컨텍스트만, 전체 코드베이스 넘기기 금지]
  Output: [원하는 결과 포맷 — 요약/파일/불리언 등]
  ```
– 결과를 받은 후 메인에서 통합. 서브에이전트끼리 직접 통신 금지

용도별 사용 기준:
| 상황 | 서브에이전트 | 메인 처리 |
|------|------------|---------|
| 특정 패턴 리서치 | ✅ | |
| 3개 이상 파일 병렬 분석 | ✅ | |
| 독립 테스트 스위트 실행 | ✅ | |
| 단일 파일 수정 | | ✅ |
| 2단계 이하 간단 작업 | | ✅ |
| 컨텍스트 공유가 필수인 작업 | | ✅ |

금지 사항:
– 모호한 분할 ("전반부는 너, 후반부는 서브에이전트")
– 서브에이전트에 전체 코드베이스 컨텍스트 전달
– 결과 불확실한 채로 메인 작업에 반영

### 3. 자기개선 루프

세션 시작 시 필수 절차 (순서 엄수, 생략 금지):
1. tasks/todo.md 읽기 — 미완료 항목 확인
2. tasks/lessons.md 읽기 — 과거 실수 패턴 숙지 후 이번 세션에 반영
3. 위 두 파일을 읽지 않은 상태로 작업 시작 금지

세션 중 기록:
– 사용자로부터 수정 받을 때마다 tasks/lessons.md에 즉시 추가:
  ```
  [날짜] 문제: [무엇이 틀렸는가] → 해결: [어떻게 고쳤는가]
  ```
– 동일한 실수가 반복되면 해당 레슨 상단으로 이동시킬 것

### 4. 완료 전 검증

완료 기준은 다음 세 가지. 모두 충족 시 완료로 표시할 것:
1. 주요 요구사항 충족
2. 새로운 오류 미발생
3. 실행 환경이 있으면 테스트 후 결과 명시, 없으면 예상 동작을 명확히 기술

– 위 세 가지를 충족했다면 완료로 표시. 완벽함을 이유로 보류 금지
– 변경 전후 동작 차이가 있다면 반드시 명시
– 검증은 체크리스트로만 판단. 추가 자문 루프 금지

### 5. 우아함 추구 (균형 잡힌)

– 작업 완료 후 딱 한 번: "불필요한 복잡도가 추가됐는가?" 체크. Yes면 단순화, No면 즉시 완료
– 이 체크는 1회로 끝낼 것 — 반복 루프, 추가 리팩토링 금지
– 간단하고 명확한 작업은 이 과정 생략

### 6. 자율 버그 수정

– 버그 리포트를 받으면 지시 없이 바로 수정
– 수정 순서: 로그 확인 → 원인 특정 → 최소 범위 수정 → 결과 명시
– 원인 파악 전 수정 금지 — 증상만 보고 패치하지 말 것
– CI 실패 테스트는 말하지 않아도 직접 수정

## 태스크 관리

1. 계획 우선: tasks/todo.md에 체크 가능한 항목으로 계획 작성
2. 계획 검증: 구현 시작 전 확인
3. 진행 추적: 진행하면서 항목 완료 표시
4. 변경 설명: 각 단계에서 고수준 요약 제공
5. 결과 문서화: tasks/todo.md에 검토 섹션 추가
6. 레슨 캡처: 수정 후 tasks/lessons.md 업데이트

## 핵심 원칙

– 단순함 우선: 모든 변경을 최대한 단순하게. 최소한의 코드 영향.
– 근본 원인 탐색: 임시 수정 없음. 시니어 개발자 기준.
– 최소 영향: 변경은 필요한 부분만. 새로운 버그 도입 금지.