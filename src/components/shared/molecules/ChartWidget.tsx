import React, { memo, useState } from 'react';
import { Sparkles, ChevronRight, X, Lightbulb } from '../../icons';
import { Breadcrumb } from '../atoms';
import { Button } from '../../ui/button';

export interface ChartWidgetProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number;
  headerRight?: React.ReactNode;
  drillPath?: string[];
  onBreadcrumbClick?: (index: number) => void;
  className?: string;
  insightSummary?: string;
  insightDetail?: React.ReactNode;
  expandTestId?: string;
}

export const ChartWidget = memo<ChartWidgetProps>(
  ({
    title,
    subtitle,
    children,
    height = 220,
    headerRight,
    drillPath,
    onBreadcrumbClick,
    className = '',
    insightSummary,
    insightDetail,
    expandTestId,
  }) => {
    const [showInsight, setShowInsight] = useState(false);

    return (
      <div
        className={`bg-white rounded-xl border border-gray-200 shadow-sm animate-fade-in-up relative overflow-hidden flex flex-col ${className}`}
      >
        <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 min-h-[40px]">
          <div className="flex items-center gap-2">
            {drillPath && onBreadcrumbClick && (
              <Breadcrumb path={drillPath} onBack={onBreadcrumbClick} />
            )}
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-gray-900 leading-tight">{title}</h3>
              {/* Compact subtitle or hide if needed for extreme compactness */}
              {/* {subtitle && <p className="text-[10px] text-gray-400">{subtitle}</p>} */}
            </div>
          </div>
          {headerRight}
        </div>
        <div style={{ height: `${height}px`, width: '100%' }} className="p-3">
          {children}
        </div>

        {/* AI Insight & Action Footer - Compact */}
        {insightSummary && (
          <div
            data-testid={expandTestId}
            onClick={() => setShowInsight(true)}
            className="border-t border-gray-100 bg-blue-50/30 py-1.5 px-3 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors group"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Sparkles size={10} className="text-blue-500 shrink-0" />
              <span className="text-[10px] font-semibold text-gray-600 truncate">
                {insightSummary}
              </span>
            </div>
            <ChevronRight
              size={12}
              className="text-gray-400 group-hover:text-blue-500 transition-colors"
            />
          </div>
        )}

        {/* AI Insight Overlay Modal */}
        {showInsight && (
          <div
            data-testid="widget-modal"
            className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col p-6 animate-fade-in-up"
          >
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
                  <Lightbulb size={18} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">AI Detailed Analysis</h4>
                  <p className="text-xs text-gray-500">데이터 기반 상세 분석 및 액션 제안</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInsight(false);
                }}
                className="rounded-full text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="prose prose-sm max-w-none text-gray-700">{insightDetail}</div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInsight(false);
                }}
                className="px-4 py-2 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 h-auto"
              >
                확인 완료
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ChartWidget.displayName = 'ChartWidget';

export default ChartWidget;
