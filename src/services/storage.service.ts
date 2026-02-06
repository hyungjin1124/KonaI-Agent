import { GridLayout, WidgetId } from '../types';

// Storage Keys Enum
export enum StorageKey {
  DASHBOARD_LAYOUT = 'my_dashboard_layout',
  DASHBOARD_WIDGETS = 'my_dashboard_widgets',
  USER_PREFERENCES = 'user_preferences',
}

// Storage Result Type for consistent error handling
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

class StorageService {
  private isAvailable: boolean;
  private cache: Map<string, unknown> = new Map();

  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  private checkAvailability(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      console.warn('localStorage is not available');
      return false;
    }
  }

  // Generic get with type safety (cached)
  get<T>(key: StorageKey): StorageResult<T> {
    if (!this.isAvailable) {
      return { success: false, error: new Error('Storage not available') };
    }

    // Return from cache if available
    if (this.cache.has(key)) {
      return { success: true, data: this.cache.get(key) as T };
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return { success: true, data: undefined };
      }
      const parsed = JSON.parse(item) as T;
      this.cache.set(key, parsed);
      return { success: true, data: parsed };
    } catch (error) {
      console.error(`Failed to read from storage [${key}]:`, error);
      return { success: false, error: error as Error };
    }
  }

  // Generic set with type safety (invalidates cache)
  set<T>(key: StorageKey, value: T): StorageResult<void> {
    if (!this.isAvailable) {
      return { success: false, error: new Error('Storage not available') };
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Update cache with the new value
      this.cache.set(key, value);
      return { success: true };
    } catch (error) {
      console.error(`Failed to write to storage [${key}]:`, error);
      // Invalidate cache on failure to stay consistent
      this.cache.delete(key);
      return { success: false, error: error as Error };
    }
  }

  // Remove item (invalidates cache)
  remove(key: StorageKey): StorageResult<void> {
    if (!this.isAvailable) {
      return { success: false, error: new Error('Storage not available') };
    }

    try {
      localStorage.removeItem(key);
      this.cache.delete(key);
      return { success: true };
    } catch (error) {
      console.error(`Failed to remove from storage [${key}]:`, error);
      this.cache.delete(key);
      return { success: false, error: error as Error };
    }
  }

  // Dashboard-specific helpers
  getDashboardLayout(): StorageResult<GridLayout> {
    return this.get<GridLayout>(StorageKey.DASHBOARD_LAYOUT);
  }

  setDashboardLayout(layout: GridLayout): StorageResult<void> {
    return this.set(StorageKey.DASHBOARD_LAYOUT, layout);
  }

  getDashboardWidgets(): StorageResult<WidgetId[]> {
    return this.get<WidgetId[]>(StorageKey.DASHBOARD_WIDGETS);
  }

  setDashboardWidgets(widgets: WidgetId[]): StorageResult<void> {
    return this.set(StorageKey.DASHBOARD_WIDGETS, widgets);
  }

  // Save both layout and widgets together
  saveDashboard(layout: GridLayout, widgets: WidgetId[]): StorageResult<void> {
    const layoutResult = this.setDashboardLayout(layout);
    const widgetsResult = this.setDashboardWidgets(widgets);

    if (!layoutResult.success || !widgetsResult.success) {
      return {
        success: false,
        error: new Error('Failed to save dashboard configuration'),
      };
    }

    return { success: true };
  }

  // Load both layout and widgets together
  loadDashboard(): { layout: GridLayout | undefined; widgets: WidgetId[] | undefined } {
    const layoutResult = this.getDashboardLayout();
    const widgetsResult = this.getDashboardWidgets();

    return {
      layout: layoutResult.success ? layoutResult.data : undefined,
      widgets: widgetsResult.success ? widgetsResult.data : undefined,
    };
  }

  clearDashboard(): void {
    this.remove(StorageKey.DASHBOARD_LAYOUT);
    this.remove(StorageKey.DASHBOARD_WIDGETS);
  }

  // Clear the entire in-memory cache
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const storageService = new StorageService();
