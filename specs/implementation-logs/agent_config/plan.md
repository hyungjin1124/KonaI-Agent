# Plan: Agent Configuration

## 파일 구조
| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| src/components/features/agent-config/agentConfigData.ts | 타입 + Mock 데이터 + 상수 | 신규 |
| src/components/features/agent-config/AgentConfigView.tsx | 메인 설정 뷰 (5섹션 Card Form) | 신규 |
| src/components/features/agent-config/AgentConfigView.test.tsx | Vitest 단위 테스트 | 신규 |
| src/components/features/agent-config/index.ts | Barrel export | 신규 |
| src/components/AdminView.tsx | 5번째 탭 "에이전트 설정" 추가 | 수정 |
| src/components/icons/index.ts | Sliders 아이콘 추가 (필요시) | 수정 |

## Props Interface
```typescript
// agentConfigData.ts

interface AgentModel {
  id: string;
  name: string;
  provider: string;
  description: string;
}

interface AgentCapability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: string; // Lucide icon name reference
}

interface ModerationLevel {
  value: number;
  label: string;
  description: string;
}

interface AgentConfig {
  name: string;
  description: string;
  avatarColor: string;
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  capabilities: AgentCapability[];
  systemPrompt: string;
  moderationLevel: number;
  lastModified: string;
  lastModifiedBy: string;
}
```

## 상태 설계
- `config: AgentConfig` — 전체 설정 상태 (useState)
- `isDirty: boolean` — 변경 사항 있는지 여부
- `isSaving: boolean` — 저장 중 상태 (버튼 로딩)
- 외부 데이터 없음 (mock 데이터 기반)

## 통합 지점
- AdminView.tsx에 5번째 TabsTrigger + TabsContent 추가
- `import { AgentConfigView } from './features/agent-config';`
- 아이콘: Bot 또는 Settings (이미 icons/index.ts에 존재)

## UI 구조 (5개 Card 섹션)
1. **기본 정보** — 에이전트 이름 Input + 설명 Textarea + 아바타 컬러 피커
2. **모델 설정** — 모델 Select 드롭다운 + temperature 레인지 + max_tokens 레인지
3. **기능 설정** — 5~6개 Switch 토글 (Web Search, Code Execution, File Upload, Image Generation, Data Analysis)
4. **시스템 프롬프트** — 대형 Textarea + 글자 수 카운터
5. **콘텐츠 모더레이션** — 5단계 레인지 슬라이더 + 수준 라벨 + 설명

하단: 저장 버튼 (변경 시 활성화) + "마지막 수정" 표시

## Acceptance Criteria 매핑
| # | Criteria | 구현 위치 |
|---|----------|-----------|
| AC-1 | 에이전트 기본 정보 폼 | 섹션 1: 이름 Input + 설명 Textarea |
| AC-2 | 모델 선택 드롭다운 | 섹션 2: Select (3개 모델) |
| AC-3 | 모델 파라미터 슬라이더 | 섹션 2: temperature + maxTokens range |
| AC-4 | 기능 토글 Switch | 섹션 3: 5개 Switch |
| AC-5 | 시스템 프롬프트 Textarea | 섹션 4: Textarea + 글자 수 |
| AC-6 | 모더레이션 감도 슬라이더 | 섹션 5: range 5단계 |
| AC-7 | 저장 버튼 + 피드백 | 하단 버튼, isSaving 상태 |
| AC-8 | Card 구분 | 각 섹션 Card 래퍼 |
| AC-9 | 접근성 | aria-label, keyboard nav |
| AC-10 | 반응형 | Tailwind responsive |
| AC-11 | mock + useState | agentConfigData.ts + useState |
| AC-12 | data-testid | 주요 요소에 부착 |

## 테스트 시나리오
| # | Acceptance Criteria | 시나리오 | 테스트 방법 | 우선순위 |
|---|---------------------|---------|-----------|---------|
| 1 | 렌더링 | 컴포넌트가 에러 없이 렌더 | render + getByTestId | must |
| 2 | AC-1 | 이름, 설명 필드 표시 | getByLabelText or getByPlaceholder | must |
| 3 | AC-2 | 모델 드롭다운 표시 | getByText(모델명) | must |
| 4 | AC-3 | temperature/maxTokens 표시 | getByRole('slider') | must |
| 5 | AC-4 | 5개 기능 Switch 표시 | getAllByRole('switch') → length >= 5 | must |
| 6 | AC-5 | 시스템 프롬프트 영역 | getByPlaceholder(프롬프트) | must |
| 7 | AC-6 | 모더레이션 슬라이더 표시 | getByText(수준 라벨) | must |
| 8 | AC-7 | 저장 버튼 | getByRole('button', { name: /저장/ }) | must |
| 9 | AC-4 | Switch 토글 시 상태 변경 | userEvent.click + 상태 확인 | should |
| 10 | AC-8 | Card 섹션 구분 | 5개 섹션 Card 확인 | should |
| 11 | AC-11 | mock 데이터 유효성 | MOCK 상수 검증 | should |
