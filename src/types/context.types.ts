import type { ReactNode } from 'react';

// PPT Config Type
export interface PPTConfig {
  theme: 'Corporate Blue' | 'Modern Dark' | 'Nature Green';
  tone: 'Data-driven' | 'Formal' | 'Storytelling';
  topics: string[];
  titleFont: string;
  bodyFont: string;
  slideCount: number;
}

// SampleInterface Context
export interface SampleInterfaceContext {
  name: string;
  scenario?: string;
  agentMessage?: string;
  type?: 'financial' | 'did' | 'ppt';
}

// SampleInterface Props
export interface SampleInterfaceProps {
  initialQuery?: string;
  initialContext?: SampleInterfaceContext;
}

// App-level Context
export interface AppScenarioData {
  context?: SampleInterfaceContext;
  query?: string;
}

// App View Mode
export type AppViewMode =
  | 'landing'
  | 'scenario_ppt'
  | 'scenario_analysis'
  | 'data_management'
  | 'skills_management'
  | 'admin_management'
  | 'history_view'
  | 'liveboard';

// Suggestion Item for SampleInterface
export interface SuggestionItem {
  title: string;
  description?: string;
  prompt: string;
  icon: ReactNode;
}

// Quick Action Chip
export interface QuickActionChip {
  icon: ReactNode;
  label: string;
}
