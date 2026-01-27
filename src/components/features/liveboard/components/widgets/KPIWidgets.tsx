import React from 'react';
import { ArrowUpRight, ArrowDownRight } from '../../../../icons';

// Revenue Growth KPI Widget
export const RevenueGrowthKPI: React.FC = () => (
  <div className="flex flex-col justify-between h-full">
    <div className="flex justify-between items-start">
      <span className="text-xs text-gray-500 font-bold uppercase tracking-tight">매출 성장률 (Growth)</span>
      <span className="bg-red-50 text-[#FF3C42] text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
        <ArrowUpRight size={10} /> 13.5%
      </span>
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900">₩42억</div>
      <div className="text-[11px] text-gray-400 mt-1">목표 37억 초과 달성</div>
    </div>
  </div>
);

// Cost Efficiency KPI Widget
export const CostEfficiencyKPI: React.FC = () => (
  <div className="flex flex-col justify-between h-full">
    <div className="flex justify-between items-start">
      <span className="text-xs text-gray-500 font-bold uppercase tracking-tight">원가 효율성 (Efficiency)</span>
      <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
        <ArrowDownRight size={10} /> 6.0%p
      </span>
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900">62%</div>
      <div className="text-[11px] text-gray-400 mt-1">목표 65% 조기 달성</div>
    </div>
  </div>
);

// ASP KPI Widget
export const ASPKPI: React.FC = () => (
  <div className="flex flex-col justify-between h-full">
    <div className="flex justify-between items-start">
      <span className="text-xs text-gray-500 font-bold uppercase tracking-tight">평균 판매 단가 (ASP)</span>
      <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
        <ArrowUpRight size={10} /> 8.0%
      </span>
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900">프리미엄↑</div>
      <div className="text-[11px] text-gray-400 mt-1">Gold Edition 비중 30%</div>
    </div>
  </div>
);

// Render function wrappers for WIDGET_REGISTRY compatibility
export const renderRevenueGrowthKPI = () => <RevenueGrowthKPI />;
export const renderCostEfficiencyKPI = () => <CostEfficiencyKPI />;
export const renderASPKPI = () => <ASPKPI />;
