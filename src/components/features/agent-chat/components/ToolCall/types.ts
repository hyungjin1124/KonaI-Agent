import { ToolType, ToolStatus, ToolCallResult, HitlOption, ToolMetadata, ScenarioMessage, DataValidationSummary } from '../../types';
import { PPTConfig } from '../../../../../types';

// ToolCallWidget Props
export interface ToolCallWidgetProps {
  toolType: ToolType;
  status: ToolStatus;
  input?: Record<string, unknown>;
  result?: ToolCallResult;
  isExpanded?: boolean;
  onToggle?: () => void;

  // Human-In-The-Loop
  isHitl?: boolean;
  hitlOptions?: HitlOption[];
  selectedOption?: string;
  onHitlSelect?: (optionId: string) => void;

  // PPT Setup 전용
  pptConfig?: PPTConfig;
  onPptConfigUpdate?: <K extends keyof PPTConfig>(key: K, value: PPTConfig[K]) => void;
  onPptSetupComplete?: () => void;

  // 데이터 검증 전용
  validationData?: {
    revenue: string;
    revenueGrowth: string;
    operatingProfit: string;
    operatingProfitGrowth: string;
    dataDate: string;
    dataSources: string[];
  };
  onValidationConfirm?: () => void;
  onValidationModify?: () => void;

  // 시나리오 진행 상태 (동적 Todo list 용)
  currentStepId?: string | null;
  completedStepIds?: Set<string>;
}

// ToolCallHeader Props
export interface ToolCallHeaderProps {
  toolType: ToolType;
  status: ToolStatus;
  isExpanded: boolean;
  onToggle: () => void;
  metadata: ToolMetadata;
}

// ToolCallContent Props
export interface ToolCallContentProps {
  toolType: ToolType;
  status: ToolStatus;
  input?: Record<string, unknown>;
  result?: ToolCallResult;

  // HITL Props 전달
  isHitl?: boolean;
  hitlOptions?: HitlOption[];
  selectedOption?: string;
  onHitlSelect?: (optionId: string) => void;

  // PPT Setup Props
  pptConfig?: PPTConfig;
  onPptConfigUpdate?: <K extends keyof PPTConfig>(key: K, value: PPTConfig[K]) => void;
  onPptSetupComplete?: () => void;

  // 데이터 검증 Props
  validationData?: {
    revenue: string;
    revenueGrowth: string;
    operatingProfit: string;
    operatingProfitGrowth: string;
    dataDate: string;
    dataSources: string[];
  };
  onValidationConfirm?: () => void;
  onValidationModify?: () => void;

  // 시나리오 진행 상태 (동적 Todo list 용)
  currentStepId?: string | null;
  completedStepIds?: Set<string>;

  // 스트리밍 건너뛰기 (완료 후 재펼침 시)
  skipStreaming?: boolean;
}

// ToolCallStatusIndicator Props
export interface ToolCallStatusIndicatorProps {
  status: ToolStatus;
  color?: string;
}

// 개별 도구 변형 컴포넌트 공통 Props
export interface ToolVariantProps {
  status: ToolStatus;
  input?: Record<string, unknown>;
  result?: ToolCallResult;
}

// DataSourceSelect Tool Props
export interface DataSourceSelectToolProps extends ToolVariantProps {
  options: HitlOption[];
  selectedOption?: string;
  onSelect: (optionId: string) => void;
}

// DataValidation Tool Props
export interface DataValidationToolProps extends ToolVariantProps {
  validationData: {
    revenue: string;
    revenueGrowth: string;
    operatingProfit: string;
    operatingProfitGrowth: string;
    dataDate: string;
    dataSources: string[];
  };
  onConfirm: () => void;
  onModify: () => void;
}

// PPTSetup Tool Props
export interface PPTSetupToolProps extends ToolVariantProps {
  config: PPTConfig;
  onConfigUpdate: <K extends keyof PPTConfig>(key: K, value: PPTConfig[K]) => void;
  onComplete: () => void;
}

// DeepThinking Tool Props
export interface DeepThinkingToolProps extends ToolVariantProps {
  todos?: Array<{
    id: string;
    label: string;
    completed: boolean;
  }>;
}

// DataQuery Tool Props
export interface DataQueryToolProps extends ToolVariantProps {
  queryName?: string;
  querySource?: string;
  queryData?: Record<string, unknown>;
}

// SlideGeneration Tool Props
export interface SlideGenerationToolProps extends ToolVariantProps {
  currentSlide?: number;
  totalSlides?: number;
  slideTitle?: string;
}

// =============================================
// Tool Group Types (2단계 아코디언 구조)
// =============================================

// ToolCallGroup Props (외부 아코디언)
export interface ToolCallGroupProps {
  /** 그룹 내 모든 메시지 (tool-call만 필터링됨) */
  messages: ScenarioMessage[];
  /** 그룹 펼침 상태 */
  isGroupExpanded: boolean;
  /** 그룹 토글 핸들러 */
  onGroupToggle: () => void;
  /** 현재 활성화된 Tool 메시지 ID (내부 아코디언) */
  activeToolMessageId: string | null;
  /** 개별 Tool 토글 핸들러 */
  onToolToggle: (messageId: string) => void;
  /** 시나리오 완료 여부 */
  isScenarioComplete: boolean;
  /** 시나리오 진행 중 여부 */
  isScenarioRunning: boolean;
  /** 현재 단계 ID */
  currentStepId: string | null;
  /** 완료된 단계 ID Set */
  completedStepIds: Set<string>;

  // HITL 관련 Props
  onHitlSelect?: (stepId: string, optionId: string) => void;
  onValidationConfirm?: () => void;
  onPptSetupComplete?: () => void;

  // PPT Config Props
  pptConfig?: PPTConfig;
  onPptConfigUpdate?: <K extends keyof PPTConfig>(key: K, value: PPTConfig[K]) => void;
  validationData?: DataValidationSummary;

  // 슬라이드 생성 상태
  slideGenerationState?: {
    currentSlide: number;
    completedSlides: number[];
    totalSlides: number;
  };
}

// ToolCallGroupHeader Props (외부 아코디언 헤더)
export interface ToolCallGroupHeaderProps {
  /** 완료된 Tool 수 */
  completedCount: number;
  /** 전체 Tool 수 */
  totalCount: number;
  /** 시나리오 완료 여부 */
  isComplete: boolean;
  /** 시나리오 진행 중 여부 */
  isRunning: boolean;
  /** 펼침 상태 */
  isExpanded: boolean;
  /** 토글 핸들러 */
  onToggle: () => void;
}
