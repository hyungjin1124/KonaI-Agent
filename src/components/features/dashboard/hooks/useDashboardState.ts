import { useState, useEffect, useCallback, useMemo } from 'react';
import { WidgetId, GridLayout, Layout as GridLayoutItem } from '../../../../types';
import { storageService } from '../../../../services';
import { ViewMode, CompositionView } from '../types';

interface UseDashboardStateReturn {
  // View state
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  compositionView: CompositionView;
  setCompositionView: (view: CompositionView) => void;
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;

  // Widget state
  pinnedWidgets: WidgetId[];
  pinnedSet: Set<WidgetId>;
  layout: GridLayout;
  isLayoutChanged: boolean;

  // Toast
  toastMessage: string | null;
  showToast: (message: string) => void;

  // Handlers
  togglePin: (widgetId: WidgetId) => void;
  handleLayoutChange: (newLayout: GridLayout) => void;
  saveLayout: () => void;
}

// Widget Registry configuration for default sizes
const WIDGET_DEFAULTS: Record<WidgetId, { minW: number; minH: number; defaultW: number; defaultH: number }> = {
  'revenue_growth_kpi': { minW: 2, minH: 2, defaultW: 4, defaultH: 3 },
  'cost_efficiency_kpi': { minW: 2, minH: 2, defaultW: 4, defaultH: 3 },
  'asp_kpi': { minW: 2, minH: 2, defaultW: 4, defaultH: 3 },
  'revenue_bridge_chart': { minW: 4, minH: 4, defaultW: 6, defaultH: 8 },
  'cost_correlation_chart': { minW: 4, minH: 4, defaultW: 6, defaultH: 8 },
  'anomaly_cost_chart': { minW: 4, minH: 4, defaultW: 6, defaultH: 8 },
  'monthly_trend_chart': { minW: 4, minH: 4, defaultW: 12, defaultH: 8 },
  'business_composition_chart': { minW: 4, minH: 4, defaultW: 6, defaultH: 8 },
  'top_clients_chart': { minW: 4, minH: 4, defaultW: 6, defaultH: 8 },
  'yoy_growth_chart': { minW: 4, minH: 4, defaultW: 6, defaultH: 8 },
};

export function useDashboardState(): UseDashboardStateReturn {
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('analysis');
  const [compositionView, setCompositionView] = useState<CompositionView>('overview');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Widget state
  const [pinnedWidgets, setPinnedWidgets] = useState<WidgetId[]>([]);
  const [layout, setLayout] = useState<GridLayout>([]);
  const [isLayoutChanged, setIsLayoutChanged] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Set 기반 O(1) 조회 최적화
  const pinnedSet = useMemo(() => new Set(pinnedWidgets), [pinnedWidgets]);

  // Toast helper
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

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

  // Toggle pin with useCallback and functional setState
  const togglePin = useCallback((widgetId: WidgetId) => {
    setPinnedWidgets(prev => {
      const isPinned = prev.includes(widgetId);
      if (isPinned) {
        showToast("위젯 고정이 해제되었습니다.");
        return prev.filter(id => id !== widgetId);
      } else {
        showToast("위젯이 '나만의 대시보드'에 추가되었습니다.");
        return [...prev, widgetId];
      }
    });

    // Update layout when widgets change
    setLayout(prevLayout => {
      const isPinned = prevLayout.some(item => item.i === widgetId);
      if (!isPinned) {
        const widgetConf = WIDGET_DEFAULTS[widgetId];
        const newItem: GridLayoutItem = {
          i: widgetId,
          x: (prevLayout.length * widgetConf.defaultW) % 12,
          y: Infinity,
          w: widgetConf.defaultW,
          h: widgetConf.defaultH,
          minW: widgetConf.minW,
          minH: widgetConf.minH
        };
        return [...prevLayout, newItem];
      } else {
        return prevLayout.filter(l => l.i !== widgetId);
      }
    });
  }, [showToast]);

  // Handle layout change
  const handleLayoutChange = useCallback((newLayout: GridLayout) => {
    setLayout(newLayout);
    setIsLayoutChanged(true);
  }, []);

  // Save layout
  const saveLayout = useCallback(() => {
    setLayout(currentLayout => {
      setPinnedWidgets(currentPinned => {
        const result = storageService.saveDashboard(currentLayout, currentPinned);
        if (result.success) {
          setIsLayoutChanged(false);
          showToast("대시보드 구성이 성공적으로 저장되었습니다.");
        } else {
          showToast("저장에 실패했습니다.");
        }
        return currentPinned;
      });
      return currentLayout;
    });
  }, [showToast]);

  return {
    viewMode,
    setViewMode,
    compositionView,
    setCompositionView,
    currentSlide,
    setCurrentSlide,
    pinnedWidgets,
    pinnedSet,
    layout,
    isLayoutChanged,
    toastMessage,
    showToast,
    togglePin,
    handleLayoutChange,
    saveLayout,
  };
}
