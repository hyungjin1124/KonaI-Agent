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
export type ArtifactType = 'document' | 'markdown' | 'ppt' | 'chart' | 'image' | 'slide-outline';

export interface Artifact {
  id: string;
  title: string;
  type: ArtifactType;
  createdAt: Date;
  messageId: string;
  fileSize?: string;
}

// =============================================
// Slide Outline HITL Types (슬라이드 개요 검토)
// =============================================

// 슬라이드 레이아웃 유형
export type SlideLayoutType =
  | 'title-only'       // 제목만
  | 'title-subtitle'   // 제목 + 부제목
  | 'title-bullets'    // 제목 + 글머리표
  | 'two-column'       // 2단 레이아웃
  | 'title-image-right'// 제목 + 우측 이미지
  | 'title-image-left' // 제목 + 좌측 이미지
  | 'chart-full'       // 차트 전체
  | 'comparison'       // 비교 레이아웃
  | 'quote'            // 인용문
  | 'section-divider'  // 섹션 구분
  | 'summary-grid';    // 요약 그리드

// 슬라이드 개요 섹션
export interface SlideOutlineSection {
  id: string;
  type: 'heading' | 'subheading' | 'bullet' | 'chart-placeholder' | 'image-placeholder' | 'data-point' | 'speaker-note';
  content: string;
  placeholder?: string;      // 비어있을 때 표시할 플레이스홀더
  dataSource?: string;       // 연결된 데이터 소스 참조
  isEdited?: boolean;        // 사용자 편집 여부
}

// 슬라이드 개요 상태
export type SlideOutlineStatus = 'draft' | 'pending-review' | 'needs-revision' | 'approved';

// 개별 슬라이드 개요
export interface SlideOutline {
  id: string;
  slideNumber: number;
  title: string;
  fileName: string;          // 예: "01_표지.md"
  layoutType: SlideLayoutType;
  markdownContent: string;   // 실제 마크다운 내용
  speakerNotes?: string;
  estimatedDuration?: string;  // 예: "2 min"
  dataConnections?: string[];  // 사용된 데이터 소스 목록
  status: SlideOutlineStatus;
  lastModifiedAt: Date;
}

// 슬라이드 개요 덱 전체
export interface SlideOutlineDeck {
  id: string;
  title: string;
  outlines: SlideOutline[];
  overallStatus: 'generating' | 'review' | 'approved' | 'generating-ppt';
  metadata: {
    estimatedTotalDuration: string;
    totalSlides: number;
    approvedSlides: number;
    createdAt: Date;
    lastModifiedAt: Date;
  };
}

// 슬라이드 개요 아티팩트 (Artifact 확장)
export interface SlideOutlineArtifact extends Artifact {
  type: 'slide-outline';
  outline: SlideOutline;
  deckId: string;
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
  // PPT 시나리오 도구
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
  | 'slide_outline_review' // 슬라이드 개요 검토 (HITL) - 사용자가 개요 승인
  | 'theme_font_select'    // 테마/폰트 선택 (HITL)
  | 'slide_generation'     // 슬라이드 제작
  | 'completion'           // 완료
  | 'todo_update'          // 진행 상황 업데이트
  // 매출 분석 시나리오 전용 (신규)
  | 'request_analysis'           // 요청 분석
  | 'analysis_scope_confirm'     // 분석 범위 확인 (HITL)
  | 'data_source_connect'        // 데이터 소스 연결
  | 'financial_data_collection'  // 재무 데이터 수집
  | 'division_data_collection'   // 사업부별 실적 수집
  | 'operation_data_collection'  // 운영 지표 수집
  | 'revenue_driver_analysis'    // 매출 동인 분석
  | 'profitability_analysis'     // 수익성 분석
  | 'anomaly_detection'          // 이상 징후 탐지
  | 'data_verification'          // 데이터 검증 (HITL)
  | 'key_insight_generation'     // 핵심 인사이트 도출
  | 'visualization_generation'   // 시각화 생성
  | 'analysis_completion'        // 분석 완료
  // 레거시 (호환성 유지)
  | 'trend_analysis'       // 트렌드 분석
  | 'insight_generation'   // 인사이트 도출
  | 'visualization';       // 시각화 생성

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

// 하위 도구 (Subtool) 인터페이스
export interface Subtool {
  id: string;
  label: string;
  description?: string;
  source?: string;        // 데이터 소스명
  metrics?: string[];     // 조회 지표 목록
  finding?: string;       // 분석 결과/발견
  findings?: Array<{ type: 'positive' | 'warning' | 'neutral'; text: string }>;
}

// 도구 메타데이터 (텍스트 스타일용)
export interface ToolMetadata {
  id: ToolType;
  label: string;
  labelRunning: string;
  labelComplete: string;
  icon: string;
  subtools?: Subtool[];   // 하위 도구 목록
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
  previewType: 'ppt' | 'dashboard' | 'chart' | 'slide-outline' | 'markdown' | null;
  markdownMode?: 'read' | 'edit'; // 마크다운 미리보기 모드
}

// 가운데 패널 상태 (Artifact Preview 독립 제어)
export interface CenterPanelState {
  isOpen: boolean;
  content: 'ppt-preview' | 'ppt-result' | 'dashboard' | 'slide-outline' | 'markdown-preview' | null;
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
