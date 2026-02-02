# ChatUI 리팩토링 계획: Claude Cowork 스타일 적용

## 📋 프로젝트 개요

### 목적
현재 AgentChatView의 2-Panel 레이아웃을 Claude Cowork 스타일의 3-Panel 레이아웃으로 변경합니다. 기존 PPT 생성 시나리오 로직은 100% 유지하면서 UI 구조만 변경합니다.

### 참조 UI 구조 (Claude Cowork)

**Artifacts 닫힘 상태:**
```
┌─────────────────────────────────────────────────────────────────┐
│                         Header                                  │
├────────────────────────────────┬────────────────────────────────┤
│                                │  ┌──────────────────────────┐  │
│                                │  │ Progress                 │  │
│                                │  │ (Planned tasks + status) │  │
│      Main Conversation         │  └──────────────────────────┘  │
│      (Chat Panel)              │  ┌──────────────────────────┐  │
│                                │  │ Artifacts                │  │
│                                │  │ (What Claude creates)    │  │
│                                │  └──────────────────────────┘  │
│                                │  ┌──────────────────────────┐  │
│                                │  │ Context                  │  │
│                                │  │ (Files + connectors)     │  │
│                                │  └──────────────────────────┘  │
├────────────────────────────────┴                                ┤
│        Input Area              |                                │
└─────────────────────────────────────────────────────────────────┘
```

**Artifacts 열림 상태:**
```
┌───────────────────────────────────────────────────────────────────────────┐
│                              Header                                       │
├──────────────────────┬──────────────────────────┬─────────────────────────┤
│                      │                          │  ┌───────────────────┐  │
│                      │                          │  │ Progress          │  │
│  Main Conversation   │    Artifact Preview      │  └───────────────────┘  │
│  (Chat Panel)        │    (PPT/Dashboard/etc)   │  ┌───────────────────┐  │
│                      │                          │  │ Artifacts         │  │
│                      │                          │  └───────────────────┘  │
│                      │                          │  ┌───────────────────┐  │
│                      │                          │  │ Context           │  │
│                      │                          │  └───────────────────┘  │
├──────────────────────┴                          |                         |
│       Input Area     |                          |                         │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 변경 범위

### 변경 O (UI 구조)
- 레이아웃 구조: 2-Panel → 3-Panel
- 우측 패널: 단일 컨텐츠 → Progress/Artifacts/Context 섹션 분리
- 중앙 패널: Artifact Preview 패널 신규 추가
- 패널 너비 조절 로직

### 변경 X (기존 로직 유지)
- PPT 생성 시나리오 흐름 (`pptScenario.ts`)
- PPTScenarioRenderer 렌더링 로직
- usePPTScenario 훅 로직
- 도구 호출(Tool Call) 위젯들
- HITL(Human-in-the-Loop) 인터랙션
- 채팅 히스토리 관리
- 슬라이드 생성 상태 관리

---

## 📁 파일 변경 목록

### 신규 생성 파일

| 파일 경로 | 설명 |
|-----------|------|
| `src/components/features/agent-chat/components/RightSidebar/RightSidebar.tsx` | 우측 사이드바 컨테이너 (Progress + Artifacts + Context) |
| `src/components/features/agent-chat/components/RightSidebar/ProgressSection.tsx` | Progress 섹션 컴포넌트 |
| `src/components/features/agent-chat/components/RightSidebar/ArtifactsSection.tsx` | Artifacts 목록 섹션 컴포넌트 |
| `src/components/features/agent-chat/components/RightSidebar/ContextSection.tsx` | Context 섹션 컴포넌트 |
| `src/components/features/agent-chat/components/RightSidebar/index.ts` | 내보내기 |
| `src/components/features/agent-chat/components/ArtifactPreviewPanel/ArtifactPreviewPanel.tsx` | 중앙 Artifact 미리보기 패널 |
| `src/components/features/agent-chat/components/ArtifactPreviewPanel/index.ts` | 내보내기 |
| `src/components/features/agent-chat/layouts/CoworkLayout.tsx` | 새로운 3-Panel 레이아웃 컴포넌트 |

### 수정 파일

| 파일 경로 | 변경 내용 |
|-----------|-----------|
| `src/components/features/agent-chat/AgentChatView.tsx` | 레이아웃 구조 변경, 상태 관리 조정 |
| `src/components/features/agent-chat/types.ts` | 새로운 타입 정의 추가 |
| `src/components/features/agent-chat/components/ArtifactsPanel/ArtifactsPanel.tsx` | ArtifactsSection 호환 또는 통합 |

### 삭제 또는 비활성화 (선택)

| 파일 경로 | 사유 |
|-----------|------|
| - | 기존 컴포넌트는 새 구조에서 재사용 또는 감싸기 |

---

## 🏗️ 상세 구현 계획

### Phase 1: 타입 정의 및 상태 관리

#### 1.1 타입 정의 추가 (`types.ts`)

```typescript
// 진행 상태 타입
export interface ProgressTask {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number; // 0-100
}

// Context 아이템 타입
export interface ContextItem {
  id: string;
  type: 'file' | 'connector' | 'data-source';
  name: string;
  icon?: string;
  status?: 'connected' | 'disconnected' | 'loading';
}

// 우측 사이드바 상태
export interface RightSidebarState {
  isCollapsed: boolean;
  expandedSections: ('progress' | 'artifacts' | 'context')[];
}

// Artifact Preview 상태
export interface ArtifactPreviewState {
  isOpen: boolean;
  selectedArtifact: Artifact | null;
  previewType: 'ppt' | 'dashboard' | 'chart' | null;
}

// 레이아웃 모드
export type LayoutMode = 'two-panel' | 'three-panel';
```

#### 1.2 AgentChatView 상태 추가

```typescript
// 기존 상태 유지 + 신규 상태 추가
const [layoutMode, setLayoutMode] = useState<LayoutMode>('two-panel');
const [artifactPreview, setArtifactPreview] = useState<ArtifactPreviewState>({
  isOpen: false,
  selectedArtifact: null,
  previewType: null,
});
const [rightSidebarState, setRightSidebarState] = useState<RightSidebarState>({
  isCollapsed: false,
  expandedSections: ['progress', 'artifacts'],
});
const [progressTasks, setProgressTasks] = useState<ProgressTask[]>([]);
const [contextItems, setContextItems] = useState<ContextItem[]>([]);
```

---

### Phase 2: 우측 사이드바 컴포넌트 구현

#### 2.1 RightSidebar 컨테이너

```typescript
// RightSidebar.tsx
interface RightSidebarProps {
  isCollapsed: boolean;
  expandedSections: ('progress' | 'artifacts' | 'context')[];
  onToggleSection: (section: 'progress' | 'artifacts' | 'context') => void;
  onToggleCollapse: () => void;
  // Progress Props
  tasks: ProgressTask[];
  // Artifacts Props
  artifacts: Artifact[];
  selectedArtifactId?: string;
  onArtifactSelect: (artifact: Artifact) => void;
  onArtifactDownload: (artifact: Artifact) => void;
  // Context Props
  contextItems: ContextItem[];
}
```

**레이아웃 구조:**
```
┌─────────────────────────────────┐
│ [Progress Section]              │
│ ├─ Task 1: ✓ Completed         │
│ ├─ Task 2: ◐ In Progress       │
│ └─ Task 3: ○ Pending           │
├─────────────────────────────────┤
│ [Artifacts Section]             │
│ ├─ 📄 Report.pptx              │
│ ├─ 📊 Sales Chart              │
│ └─ 📈 Analysis.xlsx            │
├─────────────────────────────────┤
│ [Context Section]               │
│ ├─ 🔗 ERP System (Connected)   │
│ ├─ 📁 Q4_Data.xlsx             │
│ └─ 🌐 Market Research API      │
└─────────────────────────────────┘
```

#### 2.2 ProgressSection 컴포넌트

```typescript
// ProgressSection.tsx
interface ProgressSectionProps {
  tasks: ProgressTask[];
  isExpanded: boolean;
  onToggle: () => void;
}

// 기능:
// - 시나리오 단계를 Progress 태스크로 매핑
// - 완료/진행중/대기 상태 시각화
// - 접기/펼치기 지원
```

**PPT 시나리오 태스크 매핑:**
```typescript
const PPT_SCENARIO_TASKS: ProgressTask[] = [
  { id: 'planning', label: '작업 계획 수립', status: 'pending' },
  { id: 'data_source', label: '데이터 소스 선택', status: 'pending' },
  { id: 'data_query', label: '데이터 조회', status: 'pending' },
  { id: 'data_validation', label: '데이터 검증', status: 'pending' },
  { id: 'ppt_setup', label: 'PPT 설정', status: 'pending' },
  { id: 'slide_generation', label: '슬라이드 생성', status: 'pending' },
  { id: 'completion', label: '완료', status: 'pending' },
];
```

#### 2.3 ArtifactsSection 컴포넌트

```typescript
// ArtifactsSection.tsx
interface ArtifactsSectionProps {
  artifacts: Artifact[];
  selectedArtifactId?: string;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: (artifact: Artifact) => void;
  onDownload: (artifact: Artifact) => void;
}

// 기능:
// - 생성된 Artifact 목록 표시
// - 클릭 시 중앙 패널에서 미리보기
// - 다운로드 버튼
// - 선택 상태 하이라이트
```

#### 2.4 ContextSection 컴포넌트

```typescript
// ContextSection.tsx
interface ContextSectionProps {
  items: ContextItem[];
  isExpanded: boolean;
  onToggle: () => void;
}

// 기능:
// - 연결된 데이터 소스 표시 (ERP, MES 등)
// - 참조 파일 목록
// - 연결 상태 표시
```

---

### Phase 3: Artifact Preview 패널 구현 

#### 3.1 ArtifactPreviewPanel 컴포넌트

```typescript
// ArtifactPreviewPanel.tsx
interface ArtifactPreviewPanelProps {
  isOpen: boolean;
  artifact: Artifact | null;
  previewType: 'ppt' | 'dashboard' | 'chart' | null;
  onClose: () => void;
  // PPT Preview Props (기존 PPTGenPanel 재사용)
  pptConfig?: PPTConfig;
  pptStatus?: PPTStatus;
  slides?: SlideItem[];
  // Dashboard Preview Props
  dashboardType?: DashboardType;
  dashboardScenario?: string;
}

// 기능:
// - artifact.type에 따라 적절한 미리보기 렌더링
// - PPT: 기존 PPTGenPanel 재사용
// - Chart: 기존 Dashboard 컴포넌트 재사용
// - 닫기 버튼
// - 리사이즈 핸들
```

**렌더링 로직:**
```typescript
const renderPreview = () => {
  if (!artifact) return null;
  
  switch (artifact.type) {
    case 'ppt':
      return (
        <PPTGenPanel
          status={pptStatus}
          config={pptConfig}
          slides={slides}
          // ... 기존 props
        />
      );
    case 'chart':
      return (
        <DashboardPreview
          type={dashboardType}
          scenario={dashboardScenario}
        />
      );
    default:
      return <GenericPreview artifact={artifact} />;
  }
};
```

---

### Phase 4: CoworkLayout 통합 레이아웃

#### 4.1 CoworkLayout 컴포넌트

```typescript
// CoworkLayout.tsx
interface CoworkLayoutProps {
  // 좌측 패널 (대화)
  leftPanel: React.ReactNode;
  // 중앙 패널 (Artifact Preview - 조건부)
  centerPanel?: React.ReactNode;
  isCenterPanelOpen: boolean;
  // 우측 패널 (사이드바)
  rightPanel: React.ReactNode;
  isRightPanelCollapsed: boolean;
  // 하단 (입력 영역)
  inputArea: React.ReactNode;
  // 리사이즈
  onCenterResize?: (width: number) => void;
  onRightResize?: (width: number) => void;
}
```

**너비 계산 로직:**
```typescript
const getLayoutWidths = () => {
  const RIGHT_PANEL_WIDTH = 320; // 고정 또는 최소 너비
  const RIGHT_PANEL_COLLAPSED_WIDTH = 0;
  
  if (isRightPanelCollapsed) {
    // 우측 접힘: 좌측 100% (또는 좌측 + 중앙)
    if (isCenterPanelOpen) {
      return { left: '50%', center: '50%', right: '0%' };
    }
    return { left: '100%', center: '0%', right: '0%' };
  }
  
  if (isCenterPanelOpen) {
    // 3-Panel 모드
    return {
      left: '35%',
      center: 'calc(65% - 320px)',
      right: '320px'
    };
  }
  
  // 2-Panel 모드 (중앙 닫힘)
  return {
    left: 'calc(100% - 320px)',
    center: '0%',
    right: '320px'
  };
};
```

---

### Phase 5: AgentChatView 통합

#### 5.1 레이아웃 적용

```typescript
// AgentChatView.tsx 변경

// Before: 기존 2-Panel 직접 렌더링
// After: CoworkLayout 사용

return (
  <CoworkLayout
    leftPanel={
      <ChatPanel
        chatHistory={chatHistory}
        onSend={handleSend}
        // ... 기존 props
      />
    }
    centerPanel={
      artifactPreview.isOpen && (
        <ArtifactPreviewPanel
          artifact={artifactPreview.selectedArtifact}
          previewType={artifactPreview.previewType}
          onClose={() => setArtifactPreview({ isOpen: false, selectedArtifact: null, previewType: null })}
          // PPT props
          pptConfig={pptConfig}
          pptStatus={pptStatus}
          slides={pptSlides}
          // ...
        />
      )
    }
    isCenterPanelOpen={artifactPreview.isOpen}
    rightPanel={
      <RightSidebar
        isCollapsed={rightSidebarState.isCollapsed}
        expandedSections={rightSidebarState.expandedSections}
        onToggleSection={handleToggleSection}
        onToggleCollapse={() => setRightSidebarState(prev => ({ ...prev, isCollapsed: !prev.isCollapsed }))}
        tasks={progressTasks}
        artifacts={artifacts}
        selectedArtifactId={artifactPreview.selectedArtifact?.id}
        onArtifactSelect={handleArtifactSelect}
        onArtifactDownload={handleDownloadArtifact}
        contextItems={contextItems}
      />
    }
    isRightPanelCollapsed={rightSidebarState.isCollapsed}
    inputArea={<InputArea ... />}
  />
);
```

#### 5.2 시나리오 Progress 연동

```typescript
// usePPTScenario 훅의 상태를 Progress 태스크로 변환
useEffect(() => {
  const tasks = mapScenarioToProgressTasks(
    completedStepIds,
    currentStepId,
    PPT_SCENARIO_STEPS
  );
  setProgressTasks(tasks);
}, [completedStepIds, currentStepId]);

// 매핑 함수
const mapScenarioToProgressTasks = (
  completedStepIds: string[],
  currentStepId: string | null,
  steps: ScenarioStep[]
): ProgressTask[] => {
  // 시나리오 단계를 그룹화하여 Progress 태스크로 변환
  const taskGroups = [
    { id: 'planning', label: '작업 계획 수립', stepIds: ['agent_greeting', 'tool_planning'] },
    { id: 'data_source', label: '데이터 소스 선택', stepIds: ['tool_data_source', 'agent_data_source_confirm'] },
    { id: 'data_query', label: '데이터 조회', stepIds: ['tool_erp_connect', 'tool_parallel_query', 'tool_data_query_1', 'tool_data_query_2', 'tool_data_query_3', 'tool_data_query_4'] },
    { id: 'data_validation', label: '데이터 검증', stepIds: ['tool_data_validation', 'agent_validation_confirm'] },
    { id: 'ppt_setup', label: 'PPT 설정', stepIds: ['tool_ppt_setup', 'agent_setup_confirm'] },
    { id: 'slide_generation', label: '슬라이드 생성', stepIds: ['tool_web_search', 'tool_slide_planning', 'tool_slide_generation'] },
    { id: 'completion', label: '완료', stepIds: ['tool_completion', 'agent_final'] },
  ];
  
  return taskGroups.map(group => {
    const allCompleted = group.stepIds.every(id => completedStepIds.includes(id));
    const anyRunning = group.stepIds.includes(currentStepId || '');
    
    return {
      id: group.id,
      label: group.label,
      status: allCompleted ? 'completed' : anyRunning ? 'running' : 'pending',
    };
  });
};
```

#### 5.3 Context 연동

```typescript
// PPT 시나리오의 데이터 소스 선택에 따른 Context 업데이트
const handleDataSourceSelect = (selectedSources: string[]) => {
  const contextItems: ContextItem[] = selectedSources.map(source => ({
    id: `source-${source}`,
    type: 'connector' as const,
    name: source,
    status: 'connected',
  }));
  setContextItems(contextItems);
};
```

---

### Phase 6: 스타일링 및 애니메이션

#### 6.1 TailwindCSS 클래스 정의

```css
/* 우측 사이드바 */
.right-sidebar {
  @apply w-80 h-full bg-gray-50 border-l border-gray-200 flex flex-col;
}

.right-sidebar-section {
  @apply border-b border-gray-200 last:border-b-0;
}

.right-sidebar-section-header {
  @apply px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100;
}

.right-sidebar-section-content {
  @apply px-4 py-2;
}

/* Progress 섹션 */
.progress-task {
  @apply flex items-center gap-3 py-2;
}

.progress-task-status {
  @apply w-5 h-5 rounded-full flex items-center justify-center;
}

.progress-task-status--pending {
  @apply bg-gray-200;
}

.progress-task-status--running {
  @apply bg-blue-500 animate-pulse;
}

.progress-task-status--completed {
  @apply bg-green-500;
}

/* Artifact Preview Panel */
.artifact-preview-panel {
  @apply h-full bg-white border-l border-r border-gray-200;
}

/* 레이아웃 전환 애니메이션 */
.layout-panel {
  @apply transition-all duration-300 ease-in-out;
}
```

#### 6.2 애니메이션

```typescript
// 패널 열림/닫힘 애니메이션
const panelVariants = {
  open: { width: 'auto', opacity: 1 },
  closed: { width: 0, opacity: 0 },
};

// 섹션 접기/펼치기 애니메이션
const sectionVariants = {
  expanded: { height: 'auto', opacity: 1 },
  collapsed: { height: 0, opacity: 0 },
};
```

---

## 🔗 기존 로직 연결 포인트

### PPTScenarioRenderer 연결
- 변경 없음
- 좌측 대화 패널에서 기존대로 렌더링

### PPTGenPanel 연결
- ArtifactPreviewPanel에서 래핑
- props 전달 구조 유지

### usePPTScenario 훅 연결
- Progress 상태 동기화 추가
- `onStepStart`, `onStepComplete` 콜백 활용

### Artifact 관리
- 기존 artifacts 상태 유지
- ArtifactsSection에서 표시
- 클릭 시 ArtifactPreviewPanel로 연결

---

## ✅ 체크리스트

### Phase 1: 타입 및 상태
- [ ] types.ts에 새로운 인터페이스 추가
- [ ] AgentChatView에 신규 상태 추가
- [ ] 상태 초기화 로직 검증

### Phase 2: 우측 사이드바
- [ ] RightSidebar 컨테이너 구현
- [ ] ProgressSection 구현
- [ ] ArtifactsSection 구현
- [ ] ContextSection 구현
- [ ] 섹션 접기/펼치기 동작 확인

### Phase 3: Artifact Preview
- [ ] ArtifactPreviewPanel 구현
- [ ] PPTGenPanel 통합
- [ ] Dashboard 통합
- [ ] 리사이즈 핸들 구현

### Phase 4: 레이아웃
- [ ] CoworkLayout 구현
- [ ] 2-Panel ↔ 3-Panel 전환 로직
- [ ] 너비 계산 로직 검증

### Phase 5: 통합
- [ ] AgentChatView 리팩토링
- [ ] Progress 연동
- [ ] Context 연동
- [ ] 기존 시나리오 정상 동작 확인

### Phase 6: 스타일링
- [ ] TailwindCSS 클래스 적용
- [ ] 애니메이션 추가
- [ ] 반응형 대응

### 테스트
- [ ] PPT 생성 시나리오 전체 흐름 테스트
- [ ] Artifact 선택 및 미리보기 테스트
- [ ] 패널 리사이즈 테스트
- [ ] 섹션 접기/펼치기 테스트

---

## 📐 컴포넌트 구조도

```
AgentChatView
├── CoworkLayout
│   ├── LeftPanel (ChatPanel)
│   │   ├── ChatHistory
│   │   │   ├── UserMessage
│   │   │   └── AgentMessage
│   │   │       └── PPTScenarioRenderer (기존 유지)
│   │   │           ├── ToolCallWidget
│   │   │           └── AgentResponse
│   │   └── InputArea
│   │
│   ├── CenterPanel (ArtifactPreviewPanel) [조건부]
│   │   ├── PPTGenPanel (type: ppt)
│   │   ├── DashboardPreview (type: chart)
│   │   └── GenericPreview (기타)
│   │
│   └── RightPanel (RightSidebar)
│       ├── ProgressSection
│       │   └── ProgressTaskList
│       ├── ArtifactsSection
│       │   └── ArtifactList
│       └── ContextSection
│           └── ContextItemList
```

---

## ⚠️ 주의사항

1. **기존 로직 보존**: PPT 시나리오의 모든 단계(도구 호출, HITL, 스트리밍 등)가 정상 동작해야 함
2. **상태 동기화**: Progress 상태는 시나리오 진행 상태와 실시간 동기화 필요
3. **성능**: 불필요한 리렌더링 방지 (React.memo, useMemo, useCallback 활용)
4. **접근성**: 키보드 네비게이션, ARIA 속성 추가
5. **반응형**: 모바일에서는 우측 사이드바 오버레이 모드로 전환 고려

---

## 🚀 시작하기

1. Phase 1부터 순차적으로 진행
2. 각 Phase 완료 시 기존 시나리오 동작 확인
3. 문제 발생 시 해당 Phase 내에서 해결 후 다음 진행