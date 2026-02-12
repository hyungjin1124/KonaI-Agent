import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, ComposedChart, ReferenceLine, Legend, Cell
} from 'recharts';
import {
  TrendingUp, Download, PanelRightClose,
  ArrowLeft, Share2, Factory,
  Play, ChevronLeft, ChevronRight, LayoutGrid, Layout, ArrowUpRight, ArrowDownRight,
  Target, Pin, PinOff, Move, Save, X, Check, AlertTriangle
} from '../../icons';
import { Responsive, WidthProvider } from 'react-grid-layout';
import _ from 'lodash';
import {
  DashboardProps,
  Slide,
  WidgetId,
  WidgetConfig,
  GridLayout,
  Layout as GridLayoutItem,
  TooltipFormatterProps
} from '../../../types';
import { storageService } from '../../../services';
import { CHART_COLORS } from '../../../constants';
import { DrillDownContextMenu } from './components/DrillDownContextMenu';
import { Breadcrumb } from '../../shared/atoms';
import {
  revenueFactorDrillData,
  costCorrelationDrillData,
  kpiDrillData,
  type RevenueFactorDrillPoint,
  type CostCorrelationDrillPoint,
  type KPIDrillPoint,
} from './data/drillDownData';

const ResponsiveGridLayout = WidthProvider(Responsive);

// --- Static Data Moved Outside Component to Prevent Re-renders (Fix for Issue 1) ---

const monthlyData = [
  { name: '1월', sales: 8.2, lastYear: 7.5 },
  { name: '2월', sales: 8.5, lastYear: 7.8 },
  { name: '3월', sales: 9.1, lastYear: 8.2 },
  { name: '4월', sales: 9.8, lastYear: 8.5 },
  { name: '5월', sales: 10.2, lastYear: 9.1 },
  { name: '6월', sales: 10.5, lastYear: 9.4 },
  { name: '7월', sales: 11.2, lastYear: 9.8 },
  { name: '8월', sales: 11.5, lastYear: 10.2 },
  { name: '9월', sales: 12.1, lastYear: 10.5 },
  { name: '10월', sales: 12.8, lastYear: 11.2 },
  { name: '11월', sales: 13.5, lastYear: 11.8 },
  { name: '12월', sales: 15.1, lastYear: 12.5 },
];

const pieData = [
  { name: '플랫폼', value: 38 },
  { name: '핀테크', value: 27 },
  { name: '커머스', value: 20 },
  { name: 'B2B 솔루션', value: 10 },
  { name: '해외사업', value: 5 },
];

const platformDetailData = [
  { name: '지역화폐', value: 45 },
  { name: '코나카드', value: 30 },
  { name: '택시 앱', value: 15 },
  { name: '기타 플랫폼', value: 10 },
];

const clientData = [
  { name: '고객A', value: 14.2 },
  { name: '고객B', value: 12.8 },
  { name: '고객C', value: 10.5 },
  { name: '고객D', value: 9.2 },
  { name: '고객E', value: 8.5 },
];

const revenueFactorData = [
  { name: '11월 매출 (기본)', value: 37, type: 'base', description: '전월 실적' },
  { name: '물량 효과 (Q)', value: 3.5, type: 'increase', description: 'A은행 +20만장' },
  { name: '단가 효과 (P)', value: 1.5, type: 'increase', description: 'ASP +8%' },
  { name: '12월 매출 (확정)', value: 42, type: 'total', description: '당월 실적' },
];

const costCorrelationData = [
  { name: '10월', automation: 40, costRatio: 68 },
  { name: '11월', automation: 55, costRatio: 65 },
  { name: '12월', automation: 75, costRatio: 62 },
];

const anomalyCostTrendData = [
  { time: '09:00', cost: 62 },
  { time: '10:00', cost: 63 },
  { time: '11:00', cost: 62 },
  { time: '12:00', cost: 64 },
  { time: '13:00', cost: 72 }, // Spike
  { time: '14:00', cost: 71 },
  { time: '15:00', cost: 69 }, // Recovering
];

const didRevenueData = [
  { name: 'Q1', domestic: 85, overseas: 145 },
  { name: 'Q2', domestic: 92, overseas: 160 },
  { name: 'Q3', domestic: 88, overseas: 185 },
  { name: 'Q4', domestic: 105, overseas: 210 },
];

const COLORS = ['#000000', '#555555', '#848383', '#AAAAAA', '#E5E7EB'];

// --- Render Functions Moved Outside (Fix for Issue 1) ---

const renderRevenueGrowthKPI = () => (
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

const renderCostEfficiencyKPI = () => (
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

const renderASPKPI = () => (
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

const renderRevenueBridgeChart = () => (
  <div className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-2 shrink-0">
          <div>
              <h3 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#FF3C42]"/> 매출 증감 요인 분석
              </h3>
              <p className="text-xs text-gray-500">11월(37억) → 12월(42억) 성장 요인 분해</p>
          </div>
      </div>
      <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={revenueFactorData} margin={{top: 5, right: 30, left: 40, bottom: 5}}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis type="number" hide />
                  <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={100} 
                      tick={{fontSize: 11, fontWeight: 'bold', fill: '#374151'}} 
                      axisLine={false} 
                      tickLine={false} 
                  />
                  <Tooltip
                      cursor={{fill: '#F9FAFB'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                      formatter={(value: number, _name: string, props: TooltipFormatterProps) => [
                          `₩${value}억`,
                          props.payload.description || ''
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

const renderCostCorrelationChart = () => (
  <div className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-2 shrink-0">
          <div>
              <h3 className="text-sm font-bold text-black mb-1 flex items-center gap-2">
                  <Factory size={16} className="text-blue-600"/> 자동화율과 원가율 상관관계
              </h3>
              <p className="text-xs text-gray-500">공정 자동화 확대에 따른 원가 효율성 개선 추이</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
              <Target size={12} /> 목표 원가율: 65%
          </div>
      </div>
      <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={costCorrelationData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} dy={10} />
                  <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{fontSize: 11}} label={{ value: '자동화율(%)', angle: -90, position: 'insideLeft', style: {fontSize: 10, fill: '#666'} }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 11}} domain={[50, 80]} label={{ value: '원가율(%)', angle: 90, position: 'insideRight', style: {fontSize: 10, fill: '#666'} }} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
                  <Bar yAxisId="left" dataKey="automation" name="공정 자동화율" barSize={32} fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="costRatio" name="제조 원가율" stroke="#2563EB" strokeWidth={3} dot={{r: 4, fill: '#2563EB'}} />
              </ComposedChart>
          </ResponsiveContainer>
      </div>
  </div>
);

// --- Drill-Down Chart Render Functions (Vercel rendering-hoist-jsx: module level) ---

const renderDrillDownBarChart = (data: RevenueFactorDrillPoint[]) => (
  <div className="flex-1 w-full min-h-0">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
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
            props.payload.description || '',
          ]}
        />
        <Bar dataKey="value" barSize={24} radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={`drill-cell-${index}`} fill="#FF3C42" fillOpacity={0.9} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const renderDrillDownComposedChart = (data: CostCorrelationDrillPoint[]) => (
  <div className="flex-1 w-full min-h-0">
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} dy={10} />
        <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} domain={[50, 80]} />
        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
        <Bar yAxisId="left" dataKey="automation" name="공정 자동화율" barSize={32} fill="#E5E7EB" radius={[4, 4, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey="costRatio" name="제조 원가율" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB' }} />
      </ComposedChart>
    </ResponsiveContainer>
  </div>
);

const renderDrillDownLineChart = (data: KPIDrillPoint[]) => (
  <div className="flex-1 w-full min-h-0">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        <Line type="monotone" dataKey="value" stroke="#FF3C42" strokeWidth={3} dot={{ r: 4, fill: '#FF3C42' }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const renderAnomalyCostChart = () => (
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
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                  <YAxis domain={[50, 80]} axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <ReferenceLine y={65} label={{ value: 'Target (65%)', fill: 'blue', fontSize: 10, position: 'insideTopRight' }} stroke="blue" strokeDasharray="3 3" />
                  <ReferenceLine y={68} label={{ value: 'Limit (68%)', fill: 'red', fontSize: 10, position: 'insideTopRight' }} stroke="red" />
                  <Line type="monotone" dataKey="cost" stroke="#FF3C42" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
          </ResponsiveContainer>
      </div>
  </div>
);

// --- Widget Registry ---
const WIDGET_REGISTRY: Record<WidgetId, WidgetConfig> = {
  'revenue_growth_kpi': { id: 'revenue_growth_kpi', title: '매출 성장률', minW: 2, minH: 2, defaultW: 4, defaultH: 3, render: renderRevenueGrowthKPI },
  'cost_efficiency_kpi': { id: 'cost_efficiency_kpi', title: '원가 효율성', minW: 2, minH: 2, defaultW: 4, defaultH: 3, render: renderCostEfficiencyKPI },
  'asp_kpi': { id: 'asp_kpi', title: '평균 판매 단가', minW: 2, minH: 2, defaultW: 4, defaultH: 3, render: renderASPKPI },
  'revenue_bridge_chart': { id: 'revenue_bridge_chart', title: '매출 증감 요인 분석', minW: 4, minH: 4, defaultW: 6, defaultH: 8, render: renderRevenueBridgeChart },
  'cost_correlation_chart': { id: 'cost_correlation_chart', title: '자동화율과 원가율 상관관계', minW: 4, minH: 4, defaultW: 6, defaultH: 8, render: renderCostCorrelationChart },
  'anomaly_cost_chart': { id: 'anomaly_cost_chart', title: '시간대별 원가율 추이', minW: 4, minH: 4, defaultW: 6, defaultH: 8, render: renderAnomalyCostChart },
  // Fallback/Placeholders for standard charts if needed in future
  'monthly_trend_chart': { id: 'monthly_trend_chart', title: '월별 매출 추이', minW: 4, minH: 4, defaultW: 12, defaultH: 8, render: () => <div>Chart Placeholder</div> },
  'business_composition_chart': { id: 'business_composition_chart', title: '사업부별 매출 구성', minW: 4, minH: 4, defaultW: 6, defaultH: 8, render: () => <div>Chart Placeholder</div> },
  'top_clients_chart': { id: 'top_clients_chart', title: '주요 거래처 Top 5', minW: 4, minH: 4, defaultW: 6, defaultH: 8, render: () => <div>Chart Placeholder</div> },
  'yoy_growth_chart': { id: 'yoy_growth_chart', title: 'YoY 성장률', minW: 4, minH: 4, defaultW: 6, defaultH: 8, render: () => <div>Chart Placeholder</div> },
};

// --- Widget Wrapper Component (Moved outside Dashboard to prevent re-mounts) ---
interface WidgetWrapperProps {
  id: WidgetId;
  children: React.ReactNode;
  className?: string;
  isPinned: boolean;
  onToggle: (id: WidgetId) => void;
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ id, children, className = "", isPinned, onToggle }) => {
  return (
    <div className={`relative group h-full ${className}`}>
      {children}
      <button 
        onClick={(e) => { e.stopPropagation(); onToggle(id); }}
        // Fix: Stop propagation on mousedown/touch to prevent drag initiation on button click
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 shadow-sm ${
          isPinned 
            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
        }`}
        title={isPinned ? "대시보드에서 제거" : "대시보드에 고정"}
      >
        {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
      </button>
    </div>
  );
};

// --- Skeleton Components ---
const KPICardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
    <div className="h-3 skeleton-shimmer rounded w-1/3 mb-3" />
    <div className="h-7 skeleton-shimmer rounded w-2/3 mb-2" />
    <div className="h-2.5 skeleton-shimmer rounded w-1/4" />
  </div>
);

const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-64' }) => (
  <div className={`bg-white rounded-xl p-4 border border-gray-100 shadow-sm ${height}`}>
    <div className="h-3 skeleton-shimmer rounded w-1/5 mb-4" />
    <div className="flex items-end justify-around h-[calc(100%-2.5rem)] gap-1.5 px-2">
      {[35, 55, 40, 70, 45, 60, 42, 75, 50, 65, 48, 80].map((h, i) => (
        <div key={i} className="skeleton-shimmer rounded-t flex-1" style={{ height: `${h}%` }} />
      ))}
    </div>
  </div>
);

const DashboardSkeleton: React.FC = () => (
  <div className="flex flex-col gap-4 h-full p-4">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
      <div className="h-5 skeleton-shimmer rounded w-48" />
      <div className="flex gap-2">
        <div className="h-8 w-8 skeleton-shimmer rounded-lg" />
        <div className="h-8 w-8 skeleton-shimmer rounded-lg" />
        <div className="h-8 w-8 skeleton-shimmer rounded-lg" />
      </div>
    </div>
    {/* KPI Cards Row */}
    <div className="grid grid-cols-3 gap-3">
      <KPICardSkeleton />
      <KPICardSkeleton />
      <KPICardSkeleton />
    </div>
    {/* Charts Row */}
    <div className="flex-1 grid grid-cols-2 gap-4">
      <ChartSkeleton height="h-full" />
      <ChartSkeleton height="h-full" />
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ type = 'financial', scenario, onTogglePanel, isLoading = false }) => {
  const [compositionView, setCompositionView] = useState<'overview' | 'platform_detail'>('overview');
  const [currentSlide, setCurrentSlide] = useState(0);

  // --- Dynamic Dashboard State ---
  const [pinnedWidgets, setPinnedWidgets] = useState<WidgetId[]>([]);
  const [layout, setLayout] = useState<GridLayout>([]);
  const [isLayoutChanged, setIsLayoutChanged] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Phase 4: Set 기반 O(1) 조회 최적화
  const pinnedSet = useMemo(() => new Set(pinnedWidgets), [pinnedWidgets]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // --- Drill-Down State (Karpathy: no separate hook — only 2 states) ---
  const [drillState, setDrillState] = useState<{
    activeChart: string;
    path: string[];
    elementName: string;
    dimensionId: string;
  } | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number;
    chartId: string; elementName: string; formattedValue: string;
    dimensions: { id: string; label: string }[];
  } | null>(null);

  // --- Drill-Down Handlers ---
  // Vercel js-early-exit: bail on non-drillable elements
  const handleChartClick = useCallback((chartId: string, name: string, value: number, x: number, y: number) => {
    const drillInfo = chartId === 'revenue_bridge'
      ? revenueFactorDrillData[name]
      : costCorrelationDrillData[name];
    if (!drillInfo) return;
    setContextMenu({
      x, y,
      chartId, elementName: name,
      formattedValue: chartId === 'cost_correlation' ? `${value}%` : `₩${value}억`,
      dimensions: drillInfo.dimensions.map(d => ({ id: d.id, label: d.label })),
    });
  }, []);

  const handleDrillDown = useCallback((dimensionId: string) => {
    if (!contextMenu) return;
    const drillInfo = contextMenu.chartId === 'revenue_bridge'
      ? revenueFactorDrillData[contextMenu.elementName]
      : costCorrelationDrillData[contextMenu.elementName];
    if (!drillInfo) return;
    const dim = drillInfo.dimensions.find(d => d.id === dimensionId);
    if (!dim) return;
    const titles: Record<string, string> = {
      revenue_bridge: '매출 증감 요인',
      cost_correlation: '자동화율/원가율',
    };
    setDrillState({
      activeChart: contextMenu.chartId,
      path: [titles[contextMenu.chartId] || 'KPI', contextMenu.elementName, dim.label],
      elementName: contextMenu.elementName,
      dimensionId,
    });
    setContextMenu(null);
  }, [contextMenu]);

  const handleKPIClick = useCallback((kpiId: string, label: string) => {
    const drillInfo = kpiDrillData[kpiId];
    if (!drillInfo) return;
    const firstDim = drillInfo.dimensions[0];
    setDrillState({
      activeChart: `kpi_${kpiId}`,
      path: ['KPI', label, firstDim.label],
      elementName: kpiId,
      dimensionId: firstDim.id,
    });
  }, []);

  const handleDrillBack = useCallback((index: number) => {
    if (index === 0) setDrillState(null);
  }, []);

  const handleAddToContext = useCallback(() => {
    if (!contextMenu) return;
    showToast(`"${contextMenu.elementName}" 데이터가 에이전트 컨텍스트에 추가되었습니다.`);
    setContextMenu(null);
  }, [contextMenu, showToast]);

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

  // --- Pin Functionality (useCallback으로 최적화) ---

  const togglePin = useCallback((widgetId: WidgetId) => {
    setPinnedWidgets(prev => {
      const isPinned = prev.includes(widgetId);
      const newPinnedWidgets = isPinned
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId];

      // Update layout and save to localStorage
      setLayout(prevLayout => {
        let newLayout: GridLayout;
        if (!isPinned) {
          // Add to layout
          const widgetConf = WIDGET_REGISTRY[widgetId];
          const newItem: GridLayoutItem = {
            i: widgetId,
            x: (prevLayout.length * widgetConf.defaultW) % 12,
            y: Infinity,
            w: widgetConf.defaultW,
            h: widgetConf.defaultH,
            minW: widgetConf.minW,
            minH: widgetConf.minH
          };
          newLayout = [...prevLayout, newItem];
        } else {
          // Remove from layout
          newLayout = prevLayout.filter(l => l.i !== widgetId);
        }

        // 즉시 localStorage에 자동 저장
        storageService.saveDashboard(newLayout, newPinnedWidgets);

        return newLayout;
      });

      // 토스트 메시지
      if (isPinned) {
        showToast("위젯이 My Dashboard에서 제거되었습니다.");
      } else {
        showToast("위젯이 My Dashboard에 추가 및 저장되었습니다.");
      }

      return newPinnedWidgets;
    });
  }, [showToast]);

  const handleLayoutChange = useCallback((newLayout: GridLayout) => {
    setLayout(newLayout);
    setIsLayoutChanged(true);
  }, []);

  const saveLayout = useCallback(() => {
    // 함수형 setState로 현재 상태 접근
    setLayout(currentLayout => {
      setPinnedWidgets(currentPinned => {
        const result = storageService.saveDashboard(currentLayout, currentPinned);
        if (result.success) {
          setIsLayoutChanged(false);
          showToast("대시보드 구성이 성공적으로 저장되었습니다.");
        } else {
          showToast("저장에 실패했습니다.");
        }
        return currentPinned; // 상태 변경 없음
      });
      return currentLayout; // 상태 변경 없음
    });
  }, [showToast]);

  // Toast Component
  const Toast = () => {
    if (!toastMessage) return null;
    return (
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-md text-white px-5 py-3 rounded-full shadow-2xl text-sm font-bold animate-fade-in-up z-50 flex items-center gap-2.5">
        <div className="bg-green-500 rounded-full p-0.5">
            <Check size={12} className="text-white" strokeWidth={3} />
        </div>
        {toastMessage}
      </div>
    );
  };

  // --- Anomaly Specific Widget Renderer ---
  const renderAnomalyCostSpikeChart = () => (
    <div className="flex flex-col gap-4 h-full animate-fade-in-up pb-2">
       {/* Real-time Alert Header */}
       <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 shrink-0">
          <div className="p-2 bg-red-100 rounded-full text-[#FF3C42] animate-pulse">
             <AlertTriangle size={24} />
          </div>
          <div>
             <h4 className="text-red-900 font-bold text-sm">실시간 이상 징후 감지 (Anomaly Detected)</h4>
             <p className="text-red-800 text-xs mt-0.5">13:00 기준 원가율 급등 (72%) - 허용 임계치(68%) 초과</p>
          </div>
       </div>

       <WidgetWrapper 
          id="anomaly_cost_chart" 
          className="flex-1 w-full min-h-0 bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
          isPinned={pinnedSet.has('anomaly_cost_chart')}
          onToggle={togglePin}
       >
            {renderAnomalyCostChart()}
       </WidgetWrapper>
    </div>
  );

  // --- Render Views ---

  // --- Drill-Enabled Chart Renderers (inside component for onClick access) ---
  const renderRevenueBridgeWithDrill = () => (
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
                props.payload.description || '',
              ]}
            />
            <Bar
              dataKey="value"
              barSize={24}
              radius={[0, 4, 4, 0]}
              className="cursor-pointer"
              onClick={(data: { name: string; value: number }, index: number, event: React.MouseEvent) => {
                const svg = (event.target as Element).closest('svg');
                if (!svg) return;
                const bars = svg.querySelectorAll('.recharts-bar-rectangle');
                const bar = bars[index];
                if (!bar) return;
                const rect = bar.getBoundingClientRect();
                handleChartClick('revenue_bridge', data.name, data.value, rect.right + 4, rect.top + rect.height / 2);
              }}
            >
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

  const renderCostCorrelationWithDrill = () => (
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
            <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} label={{ value: '자동화율(%)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#666' } }} />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} domain={[50, 80]} label={{ value: '원가율(%)', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#666' } }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar
              yAxisId="left"
              dataKey="automation"
              name="공정 자동화율"
              barSize={32}
              fill="#E5E7EB"
              radius={[4, 4, 0, 0]}
              className="cursor-pointer"
              onClick={(data: { name: string; automation: number }, index: number, event: React.MouseEvent) => {
                const svg = (event.target as Element).closest('svg');
                if (!svg) return;
                const bars = svg.querySelectorAll('.recharts-bar-rectangle');
                const bar = bars[index];
                if (!bar) return;
                const rect = bar.getBoundingClientRect();
                handleChartClick('cost_correlation', data.name, data.automation, rect.left + rect.width / 2, rect.top);
              }}
            />
            <Line yAxisId="right" type="monotone" dataKey="costRatio" name="제조 원가율" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderAnalysisView = () => (
    <div className="flex flex-col gap-4 h-full animate-fade-in-up pb-2">
        {/* Row 1: Key Drivers Summary — KPI cards with drill-down click */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
             <WidgetWrapper
                id="revenue_growth_kpi"
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#FF3C42] transition-colors shadow-sm cursor-pointer"
                isPinned={pinnedSet.has('revenue_growth_kpi')}
                onToggle={togglePin}
             >
                <div onClick={() => handleKPIClick('revenue', '매출 성장률')}>
                  {renderRevenueGrowthKPI()}
                </div>
             </WidgetWrapper>
             <WidgetWrapper
                id="cost_efficiency_kpi"
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-500 transition-colors shadow-sm cursor-pointer"
                isPinned={pinnedSet.has('cost_efficiency_kpi')}
                onToggle={togglePin}
             >
                <div onClick={() => handleKPIClick('cost', '원가 효율성')}>
                  {renderCostEfficiencyKPI()}
                </div>
             </WidgetWrapper>
             <WidgetWrapper
                id="asp_kpi"
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-amber-500 transition-colors shadow-sm cursor-pointer"
                isPinned={pinnedSet.has('asp_kpi')}
                onToggle={togglePin}
             >
                <div onClick={() => handleKPIClick('asp', '평균 판매 단가')}>
                  {renderASPKPI()}
                </div>
             </WidgetWrapper>
        </div>

        {/* Row 2: Charts — conditional drill-down rendering (Vercel: ternary) */}
        <div className="flex-1 min-h-0 flex flex-col gap-4">
            <WidgetWrapper
                id="revenue_bridge_chart"
                className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                isPinned={pinnedSet.has('revenue_bridge_chart')}
                onToggle={togglePin}
            >
                {drillState?.activeChart === 'revenue_bridge' ? (() => {
                  const drillInfo = revenueFactorDrillData[drillState.elementName];
                  const dimension = drillInfo?.dimensions.find(d => d.id === drillState.dimensionId);
                  if (!drillInfo || !dimension) return renderRevenueBridgeWithDrill();
                  return (
                    <div className="flex flex-col h-full">
                      <Breadcrumb path={drillState.path} onBack={handleDrillBack} />
                      <h3 className="text-sm font-bold text-gray-900 mb-1">{drillInfo.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{dimension.label} 기준</p>
                      {renderDrillDownBarChart(dimension.data)}
                    </div>
                  );
                })() : drillState?.activeChart?.startsWith('kpi_') ? (() => {
                  const drillInfo = kpiDrillData[drillState.elementName];
                  const dimension = drillInfo?.dimensions.find(d => d.id === drillState.dimensionId);
                  if (!drillInfo || !dimension) return renderRevenueBridgeWithDrill();
                  return (
                    <div className="flex flex-col h-full">
                      <Breadcrumb path={drillState.path} onBack={handleDrillBack} />
                      <h3 className="text-sm font-bold text-gray-900 mb-1">{drillInfo.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{dimension.label} 기준</p>
                      {renderDrillDownLineChart(dimension.data)}
                    </div>
                  );
                })() : (
                  renderRevenueBridgeWithDrill()
                )}
            </WidgetWrapper>

            <WidgetWrapper
                id="cost_correlation_chart"
                className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                isPinned={pinnedSet.has('cost_correlation_chart')}
                onToggle={togglePin}
            >
                {drillState?.activeChart === 'cost_correlation' ? (() => {
                  const drillInfo = costCorrelationDrillData[drillState.elementName];
                  const dimension = drillInfo?.dimensions.find(d => d.id === drillState.dimensionId);
                  if (!drillInfo || !dimension) return renderCostCorrelationWithDrill();
                  return (
                    <div className="flex flex-col h-full">
                      <Breadcrumb path={drillState.path} onBack={handleDrillBack} />
                      <h3 className="text-sm font-bold text-gray-900 mb-1">{drillInfo.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{dimension.label} 기준</p>
                      {renderDrillDownComposedChart(dimension.data)}
                    </div>
                  );
                })() : (
                  renderCostCorrelationWithDrill()
                )}
            </WidgetWrapper>
        </div>

        {/* Context Menu (Vercel: ternary conditional) */}
        {contextMenu !== null ? (
          <DrillDownContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            elementName={contextMenu.elementName}
            formattedValue={contextMenu.formattedValue}
            dimensions={contextMenu.dimensions}
            onDrillDown={handleDrillDown}
            onAddToContext={handleAddToContext}
            onClose={() => setContextMenu(null)}
          />
        ) : null}
    </div>
  );

  const renderDashboardEditor = () => {
    return (
        <div className="h-full flex flex-col animate-fade-in-up">
            {/* Editor Toolbar (Always Visible - Fix for Issue 2) */}
            <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <LayoutGrid size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">나만의 대시보드 편집</h3>
                        <p className="text-[10px] text-gray-500">위젯을 드래그하여 배치하세요</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setViewMode('analysis')}
                        className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                        <ArrowLeft size={14} /> 분석 뷰
                    </button>
                    <button 
                        onClick={saveLayout}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm ${isLayoutChanged ? 'bg-[#FF3C42] hover:bg-[#E02B31] text-white animate-pulse' : 'bg-gray-800 hover:bg-black text-white'}`}
                    >
                        <Save size={14} /> 저장하기
                    </button>
                </div>
            </div>

            {/* Grid Canvas or Empty State */}
            {pinnedWidgets.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                    <LayoutGrid size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium">고정된 위젯이 없습니다.</p>
                    <p className="text-xs mt-1">분석 화면에서 <Pin size={10} className="inline"/> 아이콘을 눌러 위젯을 추가하세요.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 rounded-xl border border-dashed border-gray-200 relative">
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={{ lg: layout }}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
                        rowHeight={30}
                        onLayoutChange={handleLayoutChange}
                        draggableHandle=".drag-handle"
                        margin={[12, 12]}
                    >
                        {layout.map((item) => {
                            const widget = WIDGET_REGISTRY[item.i as WidgetId];
                            return (
                                <div key={item.i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group">
                                    {/* Widget Header for Dragging */}
                                    <div className="drag-handle h-8 bg-gray-50 border-b border-gray-100 flex items-center justify-between px-3 cursor-move hover:bg-gray-100 transition-colors shrink-0">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                            <Move size={10} /> {widget?.title}
                                        </span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); togglePin(item.i); }}
                                            // Fix: Stop propagation on mousedown/touch to prevent drag initiation on button click
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onTouchStart={(e) => e.stopPropagation()}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                    {/* Widget Content */}
                                    <div className="flex-1 p-3 min-h-0 overflow-hidden relative">
                                        {widget?.render()}
                                        {/* Overlay to prevent chart interactions while dragging */}
                                        <div className="absolute inset-0 z-0 pointer-events-none group-hover:pointer-events-auto"></div>
                                    </div>
                                </div>
                            );
                        })}
                    </ResponsiveGridLayout>
                </div>
            )}
        </div>
    );
  };

  // --- PPT Slides (Enhanced) ---
  const slides: Slide[] = [
    { id: 1, layout: 'title', title: 'Q4 2025\n경영 실적 보고서', subtitle: '2025.12.31 | 전략기획실' },
    { id: 2, layout: 'list', title: '목차', items: ['01. 경영 성과 요약', '02. 주요 재무 지표', '03. 사업부별 성과', '04. 2026 목표 및 전략'] },
    { id: 3, layout: 'bullets', title: 'Executive Summary', items: ['매출 3,700억 원 달성 (YoY +12.5%)', '영업이익 500억 원 기록 (이익률 13.5%)', 'DID 해외 사업 매출 비중 66% 돌파'] },
    { id: 4, layout: 'chart', title: '재무 성과 (Financial Highlights)', chartType: 'bar' },
    { id: 5, layout: 'bullets', title: '주요 사업 성과', items: ['플랫폼 사업부: 월간 활성 사용자(MAU) 15% 증가', 'DID 사업부: 메탈 카드 원가율 1.7%p 절감', '글로벌 파트너십 3건 신규 체결'] },
    { id: 6, layout: 'split', title: '향후 계획', left: 'R&D 투자 확대\n- 차세대 보안 칩셋 개발\n- 블록체인 플랫폼 고도화', right: '신규 사옥 이전 준비\n- 업무 환경 개선\n- 스마트 오피스 구축' },
    { id: 7, layout: 'center', title: 'Q&A', subtitle: '감사합니다' },
  ];

  const renderSlideContent = (slide: Slide) => {
      switch(slide.layout) {
          case 'title':
              return (
                  <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up">
                      <div className="w-20 h-20 bg-black rounded-full mb-8 flex items-center justify-center">
                          <span className="text-white font-bold text-2xl">K</span>
                      </div>
                      <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight whitespace-pre-line">{slide.title}</h1>
                      <div className="h-1 w-24 bg-[#FF3C42] mb-6"></div>
                      <p className="text-xl text-gray-500">{slide.subtitle}</p>
                  </div>
              );
          case 'list':
              return (
                  <div className="h-full flex flex-col p-4 animate-fade-in-up">
                      <h2 className="text-3xl font-bold text-gray-900 mb-10 pb-4 border-b-2 border-gray-100">{slide.title}</h2>
                      <div className="flex-1 flex flex-col justify-center space-y-6 pl-8">
                          {slide.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4 text-2xl font-medium text-gray-700">
                                  <span className="text-[#FF3C42] font-bold">{idx + 1}.</span>
                                  <span>{item.replace(/^\d+\.\s/, '')}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              );
          case 'bullets':
              return (
                  <div className="h-full flex flex-col p-4 animate-fade-in-up">
                      <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-gray-100">{slide.title}</h2>
                      <div className="flex-1 flex flex-col justify-center space-y-6">
                          {slide.items?.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                  <div className="mt-2.5 w-2 h-2 rounded-full bg-[#FF3C42] shrink-0"></div>
                                  <p className="text-xl leading-relaxed text-gray-700">{item}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              );
          case 'chart':
               return (
                  <div className="h-full flex flex-col p-4 animate-fade-in-up">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4 pb-4 border-b-2 border-gray-100">{slide.title}</h2>
                      <div className="flex-1 w-full h-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="lastYear" name="2024" fill="#E5E7EB" />
                                <Bar dataKey="sales" name="2025" fill="#000000" />
                            </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-center text-sm text-gray-500 mt-4">단위: 십억 원 (KRW Billion)</p>
                  </div>
               );
          case 'split':
              return (
                  <div className="h-full flex flex-col p-4 animate-fade-in-up">
                      <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-gray-100">{slide.title}</h2>
                      <div className="flex-1 grid grid-cols-2 gap-12">
                          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                              <h3 className="text-xl font-bold text-[#FF3C42] mb-4">전략 과제 A</h3>
                              <p className="whitespace-pre-line text-lg text-gray-700 leading-relaxed">{slide.left}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                              <h3 className="text-xl font-bold text-blue-600 mb-4">전략 과제 B</h3>
                              <p className="whitespace-pre-line text-lg text-gray-700 leading-relaxed">{slide.right}</p>
                          </div>
                      </div>
                  </div>
              );
          case 'center':
              return (
                  <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up bg-slate-900 text-white rounded-lg -m-12 p-12">
                      <h1 className="text-6xl font-bold mb-6">{slide.title}</h1>
                      <p className="text-2xl text-gray-300">{slide.subtitle}</p>
                  </div>
              );
          default:
              return null;
      }
  };

  const renderCommonHeader = () => (
      <div className="flex items-center justify-between pb-2 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">
            {scenario === 'anomaly_cost_spike' ? (
                <span className="flex items-center gap-2 text-red-600">
                    <AlertTriangle size={20} /> [경보] 이상 징후 정밀 분석
                </span>
            ) : scenario === 'sales_analysis' ? (
                '매출 상승 원인 및 원가 분석 (12월)'
            ) : type === 'did' ? 'DID Business Unit Analysis' : '2025 Performance Dashboard'}
            </h2>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2 text-gray-500 hover:text-black hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200" title="공유하기">
             <Share2 size={18} />
           </button>
           <button className="p-2 text-gray-500 hover:text-black hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200" title="데이터 다운로드">
             <Download size={18} />
           </button>
           <button
             onClick={onTogglePanel}
             className="p-2 text-gray-500 hover:text-black hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
             title="패널 접기"
           >
             <PanelRightClose size={18} />
           </button>
        </div>
      </div>
  );

  const handlePieClick = (data: { name: string; value: number } | null) => {
    if (data && data.name === '플랫폼') {
      setCompositionView('platform_detail');
    }
  };

  // --- Main Render ---

  if (type === 'ppt') {
     return (
        <div className="flex h-full flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
            {/* PPT Header */}
            <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 bg-white shrink-0">
                <div className="flex items-center gap-2">
                    <Layout className="text-[#FF3C42]" size={18} />
                    <span className="font-semibold text-sm text-gray-800">Q4 2025 경영 실적 보고서.pptx</span>
                    <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded">Auto-Saved</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="프레젠테이션 시작"><Play size={18} className="fill-current"/></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="다운로드"><Download size={18} /></button>
                    <button className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md flex items-center gap-1.5 hover:bg-gray-800 transition-colors ml-2">
                        <Share2 size={12} /> Share
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden bg-[#F3F4F6]">
                {/* Thumbnails Sidebar */}
                <div className="w-52 bg-white border-r border-gray-200 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar shrink-0">
                    {slides.map((slide, idx) => (
                        <div 
                            key={slide.id} 
                            onClick={() => setCurrentSlide(idx)}
                            className={`group cursor-pointer flex flex-col gap-1 transition-all ${currentSlide === idx ? 'opacity-100 scale-[1.02]' : 'opacity-60 hover:opacity-100'}`}
                        >
                            <div className="flex justify-between items-center px-1">
                                <span className={`text-[10px] font-bold ${currentSlide === idx ? 'text-[#FF3C42]' : 'text-gray-400'}`}>{idx + 1}</span>
                            </div>
                            <div className={`aspect-video w-full rounded-lg border-2 overflow-hidden bg-white relative shadow-sm transition-all ${currentSlide === idx ? 'border-[#FF3C42] ring-2 ring-red-50' : 'border-gray-100 group-hover:border-gray-300'}`}>
                                {/* Mini Preview - Simplified Layout Representation */}
                                <div className="absolute inset-0 p-2 flex flex-col">
                                    {slide.layout === 'title' && (
                                        <div className="flex flex-col items-center justify-center h-full gap-1">
                                            <div className="w-4 h-4 rounded-full bg-gray-200"/>
                                            <div className="w-16 h-1 bg-gray-800 rounded"/>
                                            <div className="w-8 h-0.5 bg-gray-300 rounded"/>
                                        </div>
                                    )}
                                    {slide.layout === 'list' && (
                                        <div className="flex flex-col h-full gap-1 pt-1 pl-1">
                                            <div className="w-10 h-1 bg-gray-800 rounded mb-1"/>
                                            <div className="w-16 h-0.5 bg-gray-300 rounded"/>
                                            <div className="w-16 h-0.5 bg-gray-300 rounded"/>
                                            <div className="w-16 h-0.5 bg-gray-300 rounded"/>
                                        </div>
                                    )}
                                    {(slide.layout === 'bullets' || slide.layout === 'split') && (
                                        <div className="flex flex-col h-full gap-1 pt-1 pl-1">
                                            <div className="w-12 h-1 bg-gray-800 rounded mb-1"/>
                                            <div className="flex gap-1">
                                                <div className="w-1 h-1 rounded-full bg-gray-300"/>
                                                <div className="w-20 h-0.5 bg-gray-300 rounded"/>
                                            </div>
                                            <div className="flex gap-1">
                                                <div className="w-1 h-1 rounded-full bg-gray-300"/>
                                                <div className="w-18 h-0.5 bg-gray-300 rounded"/>
                                            </div>
                                        </div>
                                    )}
                                    {slide.layout === 'chart' && (
                                        <div className="flex flex-col h-full gap-1 pt-1">
                                            <div className="w-12 h-1 bg-gray-800 rounded ml-1 mb-1"/>
                                            <div className="flex items-end justify-center h-full gap-1 pb-1">
                                                <div className="w-2 h-4 bg-gray-200 rounded-t"/>
                                                <div className="w-2 h-6 bg-gray-300 rounded-t"/>
                                                <div className="w-2 h-3 bg-gray-200 rounded-t"/>
                                                <div className="w-2 h-5 bg-gray-300 rounded-t"/>
                                            </div>
                                        </div>
                                    )}
                                    {slide.layout === 'center' && (
                                        <div className="flex flex-col items-center justify-center h-full bg-gray-800 -m-2">
                                            <div className="w-10 h-1 bg-white/50 rounded"/>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Preview Area */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                   <div className="flex-1 p-8 md:p-12 flex items-center justify-center overflow-auto">
                        <div className="aspect-video w-full max-w-5xl bg-white shadow-xl rounded-lg border border-gray-200 flex flex-col transition-all duration-300 relative">
                             {/* Slide Content Render */}
                             {renderSlideContent(slides[currentSlide])}
                             
                             {/* Slide Footer */}
                             {slides[currentSlide].layout !== 'center' && (
                                <div className="absolute bottom-4 right-6 text-xs text-gray-300 font-medium">
                                    CONFIDENTIAL | 2025
                                </div>
                             )}
                        </div>
                   </div>

                   {/* Floating Pagination Controls */}
                   <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-white px-2 py-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 z-10">
                        <button 
                            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                            disabled={currentSlide === 0}
                            className="p-1.5 hover:bg-gray-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        <div className="px-3 flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-700 min-w-[3rem] text-center">
                                {currentSlide + 1} <span className="text-gray-300">/</span> {slides.length}
                            </span>
                        </div>

                        <button 
                            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                            disabled={currentSlide === slides.length - 1}
                            className="p-1.5 hover:bg-gray-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                        
                        <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
                        
                        <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-black transition-colors" title="모두 보기">
                            <LayoutGrid size={14} />
                        </button>
                   </div>
                </div>
            </div>
        </div>
     );
  }

  // Skeleton UI 렌더링 (isLoading일 때)
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in-up p-4 h-full relative">
      {/* Toast Notification Container */}
      <Toast />

      {renderCommonHeader()}

      {/* Conditional Rendering based on Scenario or Type */}
      {scenario === 'anomaly_cost_spike' ? (
          renderAnomalyCostSpikeChart()
      ) : scenario === 'sales_analysis' ? (
          renderAnalysisView()
      ) : type === 'did' ? (
        /* --- DID Dashboard Layout (Unchanged) --- */
        <div className="flex flex-col gap-6">
           <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-[#10B981] transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">DID 분기별 매출 구성</p>
                        <h4 className="text-xl font-bold text-gray-900 mt-1">Global 66% 달성</h4>
                    </div>
                </div>
                <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={didRevenueData}><Bar dataKey="domestic" fill="#3B82F6" /><Bar dataKey="overseas" fill="#10B981" /></BarChart>
                    </ResponsiveContainer>
                </div>
           </div>
           
           {/* Additional DID Charts for consistency if needed */}
        </div>
      ) : (
        /* --- Financial Dashboard Layout (Default) --- */
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
             <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                 <h3 className="text-sm font-bold text-black mb-0.5">월별 매출 추이</h3>
                 <div className="h-64 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData}><Line type="monotone" dataKey="sales" stroke="#000" strokeWidth={2} /></LineChart>
                    </ResponsiveContainer>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
