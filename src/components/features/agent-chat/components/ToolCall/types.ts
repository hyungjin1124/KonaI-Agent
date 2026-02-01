import { ToolType, ToolStatus, ToolCallResult, HitlOption, ToolMetadata } from '../../types';
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
