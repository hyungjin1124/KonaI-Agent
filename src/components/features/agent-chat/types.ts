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
