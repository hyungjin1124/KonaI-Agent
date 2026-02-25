import React from 'react';
import { NLChartType } from './types';

const CHART_TYPE_LABELS: Record<NLChartType, string> = {
  bar: '막대',
  line: '꺾은선',
  pie: '파이',
  area: '영역',
  composed: '복합',
  table: '표',
};

const CHART_TYPE_ICONS: Record<NLChartType, string> = {
  bar: '📊',
  line: '📈',
  pie: '🥧',
  area: '📉',
  composed: '📊',
  table: '📋',
};

interface ChartTypeSelectorProps {
  currentType: NLChartType;
  alternatives: NLChartType[];
  onSelect: (type: NLChartType) => void;
}

export const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  currentType,
  alternatives,
  onSelect,
}) => {
  const allTypes = [currentType, ...alternatives.filter((t) => t !== currentType)];

  return (
    <div className="flex items-center gap-1.5" role="radiogroup" aria-label="차트 유형 선택">
      {allTypes.map((type) => {
        const isActive = type === currentType;
        return (
          <button
            key={type}
            role="radio"
            aria-checked={isActive}
            onClick={() => onSelect(type)}
            className={`
              inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium
              transition-colors
              ${isActive
                ? 'bg-[#FF3C42] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            <span>{CHART_TYPE_ICONS[type]}</span>
            <span>{CHART_TYPE_LABELS[type]}</span>
          </button>
        );
      })}
    </div>
  );
};
