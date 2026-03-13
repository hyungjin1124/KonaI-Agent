import React, { useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { DashboardConfig, NLChartType, NLChartResult } from './types';
import { NLChartRenderer } from './NLChartRenderer';
import 'react-grid-layout/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface NLDashboardRendererProps {
  dashboardConfig: DashboardConfig;
  onChangeWidgetChartType?: (widgetId: string, type: NLChartType) => void;
  onWidgetClick?: (widgetId: string) => void;
}

export const NLDashboardRenderer: React.FC<NLDashboardRendererProps> = ({
  dashboardConfig,
  onChangeWidgetChartType,
  onWidgetClick,
}) => {
  const { title, description, widgets, layout } = dashboardConfig;

  const handleChangeChartType = useCallback(
    (widgetId: string) => (type: NLChartType) => {
      onChangeWidgetChartType?.(widgetId, type);
    },
    [onChangeWidgetChartType]
  );

  if (widgets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400" data-testid="dashboard-empty">
        <p>대시보드에 표시할 위젯이 없습니다.</p>
      </div>
    );
  }

  const layoutConfig = layout.map((item) => ({
    ...item,
    static: true,
  }));

  return (
    <div className="flex flex-col h-full bg-gray-50" data-testid="nl-dashboard-renderer">
      {/* Dashboard Header */}
      <div className="px-6 pt-5 pb-3 bg-white border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>

      {/* Grid Layout */}
      <div className="flex-1 overflow-auto p-4">
        <ResponsiveGridLayout
          layouts={{ lg: layoutConfig }}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={{ lg: 12, md: 12, sm: 6 }}
          rowHeight={120}
          isDraggable={false}
          isResizable={false}
          margin={[12, 12]}
        >
          {widgets.map((widget) => {
            const widgetResult: NLChartResult = {
              config: widget.config,
              reasoning: '',
              alternatives: [],
              queryKeywords: [],
            };

            return (
              <div
                key={widget.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onWidgetClick?.(widget.id)}
                data-testid={`dashboard-widget-${widget.id}`}
              >
                <NLChartRenderer
                  result={widgetResult}
                  onChangeChartType={handleChangeChartType(widget.id)}
                  compact
                />
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};
