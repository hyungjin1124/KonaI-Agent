import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DeltaItem {
  label: string;
  oldValue: number | null;
  newValue: number | null;
  unit: string;
  isPercentage?: boolean;
}

interface DeltaSummaryProps {
  items: DeltaItem[];
}

const DeltaSummary: React.FC<DeltaSummaryProps> = ({ items }) => {
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const delta =
          item.oldValue !== null && item.newValue !== null
            ? item.newValue - item.oldValue
            : null;
        const isImproved = delta !== null && delta > 0;
        const isRegressed = delta !== null && delta < 0;

        return (
          <div
            key={item.label}
            className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-xl"
          >
            <span className="text-xs font-medium text-gray-600">{item.label}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                {item.oldValue !== null
                  ? item.isPercentage
                    ? `${Math.round(item.oldValue * 100)}%`
                    : `${item.oldValue}${item.unit}`
                  : '-'}
              </span>
              <span className="text-gray-300">→</span>
              <span className="text-xs font-bold text-gray-900">
                {item.newValue !== null
                  ? item.isPercentage
                    ? `${Math.round(item.newValue * 100)}%`
                    : `${item.newValue}${item.unit}`
                  : '-'}
              </span>
              {delta !== null && (
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                    isImproved
                      ? 'text-green-700 bg-green-50'
                      : isRegressed
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-500 bg-gray-100'
                  }`}
                >
                  {isImproved && <TrendingUp size={10} />}
                  {isRegressed && <TrendingDown size={10} />}
                  {!isImproved && !isRegressed && <Minus size={10} />}
                  {item.isPercentage
                    ? `${delta >= 0 ? '+' : ''}${Math.round(delta * 100)}%p`
                    : `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}${item.unit}`}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DeltaSummary;
