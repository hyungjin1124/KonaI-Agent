import { useState, useCallback } from 'react';
import { NLChartType, NLChartConfig, NLChartResult } from './types';
import { isChartQuery, recommendChartType } from './chartHeuristics';
import { findMatchingDataset } from './mockChartData';

interface UseNLChartReturn {
  chartResult: NLChartResult | null;
  isProcessing: boolean;
  processQuery: (query: string) => NLChartResult | null;
  changeChartType: (type: NLChartType) => void;
  clearChart: () => void;
}

export function useNLChart(): UseNLChartReturn {
  const [chartResult, setChartResult] = useState<NLChartResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  return {
    chartResult,
    isProcessing,
    processQuery,
    changeChartType,
    clearChart,
  };
}
