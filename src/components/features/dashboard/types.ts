import { GridLayout, Layout as GridLayoutItem } from '../../../types';

// Re-export from main types for convenience
export type { DashboardProps, Slide, WidgetId, WidgetConfig, GridLayout } from '../../../types';
export type { Layout as GridLayoutItem } from '../../../types';

// View Mode for Dashboard
export type ViewMode = 'analysis' | 'custom_dashboard';

// Composition View
export type CompositionView = 'overview' | 'platform_detail';
