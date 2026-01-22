import { useState, useEffect, useCallback } from 'react';
import { GridLayout, WidgetId, DashboardViewMode, Layout } from '../types';
import { storageService } from '../services';
import { WIDGET_METADATA } from '../constants';

interface UseDashboardStateReturn {
  // View Mode
  viewMode: DashboardViewMode;
  setViewMode: (mode: DashboardViewMode) => void;

  // Pinned Widgets
  pinnedWidgets: WidgetId[];
  togglePin: (widgetId: WidgetId) => void;
  isPinned: (widgetId: WidgetId) => boolean;

  // Layout
  layout: GridLayout;
  handleLayoutChange: (newLayout: GridLayout) => void;

  // Save/Reset
  isLayoutChanged: boolean;
  saveLayout: () => boolean;
  resetLayout: () => void;

  // Toast
  toastMessage: string | null;
  showToast: (message: string) => void;
}

export function useDashboardState(): UseDashboardStateReturn {
  const [viewMode, setViewMode] = useState<DashboardViewMode>('analysis');
  const [pinnedWidgets, setPinnedWidgets] = useState<WidgetId[]>([]);
  const [layout, setLayout] = useState<GridLayout>([]);
  const [isLayoutChanged, setIsLayoutChanged] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved layout on mount
  useEffect(() => {
    const { layout: savedLayout, widgets: savedWidgets } = storageService.loadDashboard();

    if (savedLayout) {
      setLayout(savedLayout);
    }

    if (savedWidgets) {
      setPinnedWidgets(savedWidgets);
    }
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const togglePin = useCallback(
    (widgetId: WidgetId) => {
      const wasPinned = pinnedWidgets.includes(widgetId);

      if (wasPinned) {
        setPinnedWidgets((prev) => prev.filter((id) => id !== widgetId));
        setLayout((prev) => prev.filter((l) => l.i !== widgetId));
        showToast('위젯 고정이 해제되었습니다.');
      } else {
        setPinnedWidgets((prev) => [...prev, widgetId]);
        const metadata = WIDGET_METADATA[widgetId];
        const newItem: Layout = {
          i: widgetId,
          x: (layout.length * metadata.defaultW) % 12,
          y: Infinity,
          w: metadata.defaultW,
          h: metadata.defaultH,
          minW: metadata.minW,
          minH: metadata.minH,
        };
        setLayout((prev) => [...prev, newItem]);
        showToast("위젯이 '나만의 대시보드'에 추가되었습니다.");
      }
      setIsLayoutChanged(true);
    },
    [pinnedWidgets, layout, showToast]
  );

  const isPinned = useCallback(
    (widgetId: WidgetId) => {
      return pinnedWidgets.includes(widgetId);
    },
    [pinnedWidgets]
  );

  const handleLayoutChange = useCallback((newLayout: GridLayout) => {
    setLayout(newLayout);
    setIsLayoutChanged(true);
  }, []);

  const saveLayout = useCallback((): boolean => {
    const result = storageService.saveDashboard(layout, pinnedWidgets);

    if (result.success) {
      setIsLayoutChanged(false);
      showToast('대시보드 구성이 성공적으로 저장되었습니다.');
      return true;
    } else {
      showToast('저장에 실패했습니다.');
      return false;
    }
  }, [layout, pinnedWidgets, showToast]);

  const resetLayout = useCallback(() => {
    storageService.clearDashboard();
    setLayout([]);
    setPinnedWidgets([]);
    setIsLayoutChanged(false);
  }, []);

  return {
    viewMode,
    setViewMode,
    pinnedWidgets,
    togglePin,
    isPinned,
    layout,
    handleLayoutChange,
    isLayoutChanged,
    saveLayout,
    resetLayout,
    toastMessage,
    showToast,
  };
}
