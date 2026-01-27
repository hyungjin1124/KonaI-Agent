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
