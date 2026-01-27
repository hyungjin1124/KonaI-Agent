import React, { memo } from 'react';
import { TrendingUp, TrendingDown, Minus } from '../../icons';

export interface MultiMetric {
  label: string;
  value: string;
  status?: 'warning' | 'normal';
}

export interface KPICardProps {
  title: string;
  value?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  subtitle?: string;
  isStock?: boolean;
  onClick?: () => void;
  footerBadge?: React.ReactNode;
  multiMetrics?: MultiMetric[];
}

export const KPICard = memo<KPICardProps>(
  ({ title, value, change, trend, icon, subtitle, isStock, onClick, footerBadge, multiMetrics }) => (
    <div
      onClick={onClick}
      className={`bg-white p-3 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 animate-fade-in-up group ${
        isStock ? 'flex flex-col justify-between' : ''
      } ${onClick ? 'cursor-pointer hover:border-[#FF3C42] hover:shadow-md' : 'hover:shadow-md'}`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-1.5">
          {icon && (
            <div className="p-1 bg-gray-50 rounded-md text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              {icon}
            </div>
          )}
          <span className="text-gray-500 text-xs font-medium">{title}</span>
        </div>
        {change && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
              trend === 'up'
                ? 'bg-red-50 text-[#FF3C42]'
                : trend === 'down'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp size={8} />
            ) : trend === 'down' ? (
              <TrendingDown size={8} />
            ) : (
              <Minus size={8} />
            )}
            {change}
          </span>
        )}
      </div>

      <div className="flex flex-col">
        {value && (
          <div className="text-xl font-bold text-gray-900 tracking-tight">{value}</div>
        )}

        {multiMetrics && (
          <div className="flex flex-col gap-1 mt-1">
            {multiMetrics.map((metric, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">{metric.label}</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-gray-900">{metric.value}</span>
                  {metric.status === 'warning' && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-yellow-400"
                      title="Warning"
                    ></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {subtitle && (
          <div className="text-[10px] text-gray-400 mt-0.5 font-medium truncate">
            {subtitle}
          </div>
        )}

        {footerBadge && <div className="mt-2">{footerBadge}</div>}
      </div>
    </div>
  )
);

KPICard.displayName = 'KPICard';

export default KPICard;
