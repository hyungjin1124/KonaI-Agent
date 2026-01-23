import { ReactNode } from 'react';
import { GridLayout, WidgetId } from './dashboard.types';

// Drill-down State Types
export type DrillLevel = 1 | 2 | 3;

export interface DrillState {
  level: DrillLevel;
  path: string[];
  context?: unknown;
}

// Drill Menu State
export interface DrillMenuState {
  isOpen: boolean;
  step: 'initial' | 'options';
  x: number;
  y: number;
  data?: DrillMenuData | null;
}

export interface DrillMenuData {
  name: string;
  value: number;
  month?: string;
  details?: Record<string, unknown>;
}

// Chat/Conversation Types
export interface Turn {
  id: number;
  type?: 'report' | 'normal';
  userMessage?: string;
  aiMessage: string;
  widgets: ReactNode[];
  quickReplies: string[];
  checkboxOptions?: string[];
  dropdownOptions?: string[];
  dropdownLabel?: string;
  isInterim?: boolean;
}

// Widget Selection for Save Form
export interface WidgetSelectionItem {
  id: string;
  title: string;
  type: string;
  date: string;
  checked: boolean;
}

// Liveboard Props
export interface LiveboardViewProps {
  onAskAgent?: (data: AgentContextData) => void;
}

// Agent Context Data (replaces 'any' in various places)
export interface AgentContextData {
  name: string;
  scenario: string;
  agentMessage?: string;
  query?: string;
  type?: 'financial' | 'did' | 'ppt';
  metrics?: Record<string, unknown>;
}

// Time Filter
export type TimeFilterOption = '일간' | '주간' | '월간' | '연간';

// Dashboard Tab
export type DashboardTab = 'default' | 'custom';

// Liveboard State (for hook return type)
export interface LiveboardState {
  // Tab/View State
  activeDashboardTab: DashboardTab;

  // Custom Dashboard Layout
  customLayout: GridLayout;
  customWidgets: WidgetId[];

  // Edit Mode
  isEditMode: boolean;
  editLayout: GridLayout;

  // Time Filter
  timeFilter: TimeFilterOption;
  isTimeFilterOpen: boolean;

  // Chat State
  agentInput: string;
  history: Turn[];
  isTyping: boolean;

  // Drill States
  metalDrill: DrillState;
  metalMenu: DrillMenuState;

  // Widget Selection
  widgetSelection: WidgetSelectionItem[];
}
