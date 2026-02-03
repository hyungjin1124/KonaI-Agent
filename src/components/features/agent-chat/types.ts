import { SampleInterfaceContext, PPTConfig } from '../../../types';

// Agent Chat View Props
export interface AgentChatViewProps {
  initialQuery?: string;
  initialContext?: SampleInterfaceContext;
}

// Quick Action Chip
export interface QuickActionChip {
  icon: React.ReactNode;
  label: string;
}

// Suggestion Item
export interface SuggestionItem {
  title: string;
  description?: string;
  prompt: string;
  icon: React.ReactNode;
}

// PPT Status
export type PPTStatus = 'idle' | 'setup' | 'generating' | 'done';

// Dashboard Type
export type DashboardType = 'financial' | 'did' | 'ppt';

// Panel Resize State
export interface PanelResizeState {
  isRightPanelCollapsed: boolean;
  rightPanelWidth: number;
  isResizing: boolean;
}

// PPT Generation State
export interface PPTGenerationState {
  status: PPTStatus;
  progress: number;
  currentStage: number;
  config: PPTConfig;
}

// Slide Types for PPT Generation
export type SlideType = 'cover' | 'toc' | 'content' | 'chart' | 'comparison' | 'summary';

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'donut';
  labels: string[];
  values: number[];
}

export interface SlideContent {
  type: SlideType;
  title: string;
  subtitle?: string;
  bodyText?: string[];
  bulletPoints?: string[];
  chartData?: ChartData;
}

export interface SlideItem {
  id: number;
  status: 'pending' | 'generating' | 'completed';
  content: SlideContent;
}

export interface StreamingState {
  currentSlideId: number;
  streamedContent: {
    title: string;
    subtitle: string;
    bulletPoints: string[];
  };
  isStreaming: boolean;
  cursorVisible: boolean;
}

// Artifact Types for generated files
export type ArtifactType = 'document' | 'markdown' | 'ppt' | 'chart' | 'image';

export interface Artifact {
  id: string;
  title: string;
  type: ArtifactType;
  createdAt: Date;
  messageId: string;
  fileSize?: string;
}

// Right Panel Type
export type RightPanelType = 'dashboard' | 'ppt' | 'artifacts';

// =============================================
// Tool Call Types (PPT 생성 시나리오용)
// =============================================

// 메시지 타입 (도구 호출과 답변 구분)
export type ScenarioMessageType = 'user' | 'agent-text' | 'tool-call';

// 도구 타입
export type ToolType =
  | 'ppt_init'             // 프레젠테이션 초기화
  | 'deep_thinking'        // 심층 사고 (계획 수립)
  | 'data_source_select'   // 데이터 소스 선택 (HITL)
  | 'erp_connect'          // ERP 연결
  | 'parallel_data_query'  // 병렬 데이터 조회 (여러 쿼리 동시 표시)
  | 'data_query'           // 개별 데이터 조회 (상세 결과 표시)
  | 'data_validation'      // 데이터 검증 (HITL)
  | 'ppt_setup'            // PPT 세부 설정 (HITL)
  | 'web_search'           // 웹 검색
  | 'slide_planning'       // 슬라이드 개요 계획
  | 'slide_generation'     // 슬라이드 제작
  | 'completion'           // 완료
  | 'todo_update';         // 진행 상황 업데이트

// 도구 상태
export type ToolStatus = 'pending' | 'running' | 'completed' | 'awaiting-input';

// Human-In-The-Loop 옵션
export interface HitlOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  recommended?: boolean;
}

// 도구 호출 결과
export interface ToolCallResult {
  success: boolean;
  data?: Record<string, unknown>;
  message?: string;
}

// 시나리오 메시지 인터페이스
export interface ScenarioMessage {
  id: string;
  type: ScenarioMessageType;
  timestamp: Date;

  // user 또는 agent-text 타입일 때
  content?: string;

  // tool-call 타입일 때
  toolType?: ToolType;
  toolStatus?: ToolStatus;
  toolInput?: Record<string, unknown>;
  toolResult?: ToolCallResult;

  // Human-In-The-Loop 관련
  isHumanInTheLoop?: boolean;
  hitlOptions?: HitlOption[];
  hitlSelectedOption?: string;

  // 연결된 슬라이드 ID
  linkedSlideIds?: number[];
}

// 도구 메타데이터 (텍스트 스타일용)
export interface ToolMetadata {
  id: ToolType;
  label: string;
  labelRunning: string;
  labelComplete: string;
  icon: string;
}

// 시나리오 단계 정의
export interface ScenarioStep {
  id: string;
  type: ScenarioMessageType;
  toolType?: ToolType;
  agentContent?: string;
  isHitl?: boolean;
  isAsyncTool?: boolean; // 외부 완료 신호를 기다리는 비동기 도구 (예: slide_generation)
  delayMs?: number;
  dependsOn?: string;
}

// 데이터 소스 옵션
export interface DataSourceOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  recommended?: boolean;
  connectedSources?: string[];
}

// 데이터 검증 요약
export interface DataValidationSummary {
  revenue: string;
  revenueGrowth: string;
  operatingProfit: string;
  operatingProfitGrowth: string;
  dataDate: string;
  dataSources: string[];
}

// 병렬 데이터 조회 쿼리
export interface ParallelDataQuery {
  id: string;
  source: string;      // 데이터 소스명 (영림원, E2MAX, Platform Portal)
  query: string;       // 조회 쿼리명
  period: string;      // 조회 기간
  status: 'pending' | 'running' | 'completed';
}

// 개별 데이터 조회 결과
export interface DataQueryResult {
  id: string;
  source: string;
  queryName: string;
  period: string;
  timestamp: string;
  data: DataQueryTableRow[];
  sparqlQuery?: string;  // 가상 SPARQL 쿼리
}

// 데이터 조회 테이블 행
export interface DataQueryTableRow {
  label: string;
  current: string;
  previous?: string;
  change?: string;
}

// =============================================
// Cowork Layout Types (Claude Cowork 스타일 UI)
// =============================================

// 진행 상태 타입
export interface ProgressTask {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number; // 0-100
}

// Context 아이템 타입
export type ContextItemType = 'file' | 'connector' | 'data-source' | 'folder';

export interface ContextItem {
  id: string;
  type: ContextItemType;
  name: string;
  icon?: string;
  status?: 'connected' | 'disconnected' | 'loading';
  children?: ContextItem[];
}

// 우측 사이드바 섹션 타입
export type SidebarSection = 'progress' | 'artifacts' | 'context';

// 우측 사이드바 상태
export interface RightSidebarState {
  isCollapsed: boolean;
  expandedSections: SidebarSection[];
}

// Artifact Preview 상태
export interface ArtifactPreviewState {
  isOpen: boolean;
  selectedArtifact: Artifact | null;
  previewType: 'ppt' | 'dashboard' | 'chart' | null;
}

// 가운데 패널 상태 (Artifact Preview 독립 제어)
export interface CenterPanelState {
  isOpen: boolean;
  content: 'ppt-preview' | 'dashboard' | null;
}

// 레이아웃 모드
export type LayoutMode = 'two-panel' | 'three-panel';

// =============================================
// Task Group Types (Claude Cowork 스타일 다중 아코디언)
// =============================================

// 작업 그룹 정의 (렌더링용 외부 아코디언 단위)
export interface TaskGroup {
  id: string;                        // 그룹 고유 ID
  label: string;                     // 그룹 라벨 (예: "데이터 수집")
  toolStepIds: string[];             // 포함된 도구 단계 ID들
  followingTextStepId?: string;      // 그룹 후 표시될 텍스트 단계 ID
}

// 렌더링 세그먼트 (그룹 또는 텍스트)
export type RenderSegment =
  | { type: 'tool-group'; group: TaskGroup; messages: ScenarioMessage[] }
  | { type: 'text'; message: ScenarioMessage };

// 그룹별 펼침 상태
export type GroupExpandState = Record<string, boolean>;
