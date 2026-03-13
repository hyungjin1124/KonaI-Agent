import { useState, useCallback } from 'react';
import { NLChartType, NLChartConfig, NLChartResult, DashboardResult } from './types';
import { isChartQuery, isDashboardQuery, recommendChartType } from './chartHeuristics';
import { findMatchingDataset } from './mockChartData';
import { findMatchingDashboard } from './mockDashboardConfigs';

interface UseNLChartReturn {
  // Phase 1: 단일 차트
  chartResult: NLChartResult | null;
  isProcessing: boolean;
  processQuery: (query: string) => NLChartResult | null;
  changeChartType: (type: NLChartType) => void;
  clearChart: () => void;
  // Phase 2: 대시보드
  dashboardResult: DashboardResult | null;
  processDashboardQuery: (query: string) => DashboardResult | null;
  changeWidgetChartType: (widgetId: string, type: NLChartType) => void;
  clearDashboard: () => void;
}

export function useNLChart(): UseNLChartReturn {
  const [chartResult, setChartResult] = useState<NLChartResult | null>(null);
  const [dashboardResult, setDashboardResult] = useState<DashboardResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Phase 1: 단일 차트 처리
  const processQuery = useCallback((query: string): NLChartResult | null => {
    if (!isChartQuery(query)) {
      return null;
    }

    setIsProcessing(true);

    const dataset = findMatchingDataset(query);
    const heuristic = recommendChartType(query, dataset);

    const config: NLChartConfig = {
      chartType: heuristic.recommended,
      title: dataset.description,
      data: dataset.data,
      series: dataset.series,
      xAxisKey: dataset.xAxisKey,
      xAxisLabel: dataset.xAxisLabel,
      yAxisLabel: dataset.yAxisLabel,
      sankeyData: dataset.sankeyData,
      treemapData: dataset.treemapData,
      heatmapData: dataset.heatmapData,
    };

    const result: NLChartResult = {
      config,
      reasoning: heuristic.reasoning,
      alternatives: heuristic.alternatives,
      queryKeywords: dataset.keywords.filter((kw) =>
        query.toLowerCase().includes(kw)
      ),
    };

    setChartResult(result);
    setIsProcessing(false);

    return result;
  }, []);

  const changeChartType = useCallback((type: NLChartType) => {
    setChartResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        config: { ...prev.config, chartType: type },
      };
    });
  }, []);

  const clearChart = useCallback(() => {
    setChartResult(null);
  }, []);

  // Phase 2: 대시보드 처리
  const processDashboardQuery = useCallback((query: string): DashboardResult | null => {
    if (!isDashboardQuery(query)) {
      return null;
    }

    setIsProcessing(true);

    const template = findMatchingDashboard(query);
    if (!template) {
      setIsProcessing(false);
      return null;
    }

    const result: DashboardResult = {
      dashboardConfig: { ...template.config },
      reasoning: `"${query}"에 맞는 ${template.config.widgets.length}개 위젯 대시보드를 생성했습니다. ${template.config.description}`,
    };

    setDashboardResult(result);
    setIsProcessing(false);

    return result;
  }, []);

  const changeWidgetChartType = useCallback((widgetId: string, type: NLChartType) => {
    setDashboardResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        dashboardConfig: {
          ...prev.dashboardConfig,
          widgets: prev.dashboardConfig.widgets.map((w) =>
            w.id === widgetId
              ? { ...w, config: { ...w.config, chartType: type } }
              : w
          ),
        },
      };
    });
  }, []);

  const clearDashboard = useCallback(() => {
    setDashboardResult(null);
  }, []);

  return {
    chartResult,
    isProcessing,
    processQuery,
    changeChartType,
    clearChart,
    dashboardResult,
    processDashboardQuery,
    changeWidgetChartType,
    clearDashboard,
  };
}
