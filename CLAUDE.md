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

### Obsidian Vault (리서치 문서)

리서치 문서는 별도 Obsidian Vault에 관리된다. Catalog의 `obsidian_sources` 필드가
vault 내 상대 경로를 가리킨다.

- **Vault 경로**: `/Users/hyungjin/Documents/Obsidian Vault/KonaChain/리서치`
- **패턴 문서**: `Insights/agent-ui/patterns/{topic-slug}.md`
- **문서 구조**: 경쟁사 분석 → 패턴 트레이드오프 → KonaI-Agent 적용 전략 → Acceptance Criteria

Claude Code가 obsidian_sources를 참조할 때는 다음 경로에서 읽는다:
```
/Users/hyungjin/Documents/Obsidian Vault/KonaChain/리서치/{obsidian_sources_value}
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
