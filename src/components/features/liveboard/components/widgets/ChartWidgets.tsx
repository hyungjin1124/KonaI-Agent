import React from 'react';
import {
  BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { TrendingUp, Factory, Target } from '../../../../icons';
import { revenueFactorData, costCorrelationData, anomalyCostTrendData } from '../../constants/mockData';
import { TooltipFormatterProps } from '../../../../../types';

// Revenue Bridge Chart
export const RevenueBridgeChart: React.FC = () => (
  <div className="flex flex-col h-full">
    <div className="flex justify-between items-start mb-2 shrink-0">
      <div>
        <h3 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
          <TrendingUp size={16} className="text-[#FF3C42]" /> 매출 증감 요인 분석
        </h3>
        <p className="text-xs text-gray-500">11월(37억) → 12월(42억) 성장 요인 분해</p>
      </div>
    </div>
    <div className="flex-1 w-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={revenueFactorData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            width={100}
            tick={{ fontSize: 11, fontWeight: 'bold', fill: '#374151' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: '#F9FAFB' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            formatter={(value: number, _name: string, props: TooltipFormatterProps) => [
              `₩${value}억`,
              props.payload.description
            ]}
          />
          <Bar dataKey="value" barSize={24} radius={[0, 4, 4, 0]}>
            {revenueFactorData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.type === 'increase' ? '#FF3C42' : '#1F2937'}
                fillOpacity={entry.type === 'increase' ? 0.9 : 0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-2 flex gap-4 justify-center text-xs text-gray-500 shrink-0">
      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#1F2937]"></div>기본/확정 매출</div>
      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#FF3C42]"></div>성장 요인 (물량/단가)</div>
    </div>
  </div>
);

// Cost Correlation Chart
export const CostCorrelationChart: React.FC = () => (
  <div className="flex flex-col h-full">
    <div className="flex justify-between items-start mb-2 shrink-0">
      <div>
        <h3 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
          <Factory size={16} className="text-blue-600" /> 자동화율과 원가율 상관관계
        </h3>
        <p className="text-xs text-gray-500">공정 자동화 확대에 따른 원가 효율성 개선 추이</p>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
        <Target size={12} /> 목표 원가율: 65%
      </div>
    </div>
    <div className="flex-1 w-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={costCorrelationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} dy={10} />
          <YAxis
            yAxisId="left"
            orientation="left"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
            label={{ value: '자동화율(%)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#666' } }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
            domain={[50, 80]}
            label={{ value: '원가율(%)', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#666' } }}
          />
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Bar yAxisId="left" dataKey="automation" name="공정 자동화율" barSize={32} fill="#E5E7EB" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="costRatio" name="제조 원가율" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// Anomaly Cost Chart
export const AnomalyCostChart: React.FC = () => (
  <div className="flex flex-col h-full">
    <div className="flex justify-between items-start mb-4 shrink-0">
      <div>
        <h3 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
          시간대별 원가율 추이 (Real-time)
        </h3>
        <p className="text-xs text-gray-500">금일(28일) 공정 데이터 스트림</p>
      </div>
    </div>
    <div className="flex-1 w-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={anomalyCostTrendData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
          <YAxis domain={[50, 80]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          <ReferenceLine y={65} label={{ value: 'Target (65%)', fill: 'blue', fontSize: 10, position: 'insideTopRight' }} stroke="blue" strokeDasharray="3 3" />
          <ReferenceLine y={68} label={{ value: 'Limit (68%)', fill: 'red', fontSize: 10, position: 'insideTopRight' }} stroke="red" />
          <Line type="monotone" dataKey="cost" stroke="#FF3C42" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// Render function wrappers for WIDGET_REGISTRY compatibility
export const renderRevenueBridgeChart = () => <RevenueBridgeChart />;
export const renderCostCorrelationChart = () => <CostCorrelationChart />;
export const renderAnomalyCostChart = () => <AnomalyCostChart />;
