import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Area, Cell, ReferenceLine, LabelList, AreaChart, PieChart, Pie
} from 'recharts';
import {
  Send, User, Bot, Sparkles, ChevronRight, MoreHorizontal,
  Save, Share2, TrendingUp, TrendingDown, Minus,
  CreditCard, Cpu, Globe, ArrowRight, CheckCircle2, AlertCircle,
  FileText, Download, X, Search, Bell, Clock, CheckSquare, Square,
  Database, Code, ChevronDown, Flame, Filter, Calendar, AlertTriangle,
  History, Settings, PlayCircle, PlusCircle, LayoutDashboard, ExternalLink, FileDown,
  ChevronLeft, Layout, Box, CalendarDays, Map, MessageSquare, PanelRightClose, PanelRightOpen,
  MousePointerClick, List, Paperclip, Banknote, Smartphone, BarChart2, Zap, Lightbulb, ArrowUpRight, ArrowDownRight, Factory, Target,
  Edit2, RotateCcw, Check, Move
} from 'lucide-react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import _ from 'lodash';
import {
  DrillLevel,
  DrillState,
  DrillMenuState,
  DrillMenuData,
  Turn,
  AgentContextData,
  GridLayout,
  Layout as GridLayoutItem,
  TooltipFormatterProps,
  LabelListRenderProps,
  LineDotRenderProps
} from '../types';
import { storageService } from '../services';

const ResponsiveGridLayout = WidthProvider(Responsive);

// --- Props Interface Update ---
interface LiveboardViewProps {
  onAskAgent?: (data: AgentContextData) => void;
}

// Custom Resize Handle Props
interface CustomResizeHandleProps {
  handleAxis?: string;
  [key: string]: unknown;
}

// --- Custom Resize Handle Component ---
const CustomResizeHandle = React.forwardRef<HTMLDivElement, CustomResizeHandleProps>(({ handleAxis: _handleAxis, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`absolute bottom-0 right-0 cursor-se-resize z-[50] p-1.5 transition-colors group hover:bg-gray-100 rounded-tl-lg`}
      {...props}
    >
      <ArrowDownRight 
        size={16} 
        strokeWidth={3} 
        className="text-gray-300 group-hover:text-[#FF3C42] transition-colors" 
      />
    </div>
  );
});

// --- Atomic Components ---

// 1. Breadcrumb (Navigation Clarity)
const Breadcrumb: React.FC<{ path: string[], onBack: (index: number) => void }> = ({ path, onBack }) => (
  <nav className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
    {path.map((item, idx) => (
      <React.Fragment key={idx}>
        <span 
          onClick={() => onBack(idx)}
          className={`cursor-pointer transition-colors ${idx === path.length - 1 ? 'text-[#FF3C42]' : 'hover:text-gray-600'}`}
        >
          {item}
        </span>
        {idx < path.length - 1 && <ChevronRight size={10} />}
      </React.Fragment>
    ))}
  </nav>
);

// 2. Depth Limit Notice (Graceful Boundaries)
const DepthLimitNotice: React.FC<{ onRedirect: () => void }> = ({ onRedirect }) => (
  <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
    <AlertCircle size={24} className="text-gray-400 mb-2" />
    <h4 className="text-xs font-bold text-gray-700 mb-1">상세 데이터 분석 한계 도달</h4>
    <p className="text-[10px] text-gray-500 mb-3">현재 보고서의 심도는 3단계까지입니다.<br/>원천 데이터 및 트랜잭션 단위 분석은 ERP를 활용하세요.</p>
    <button 
      onClick={onRedirect}
      className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-[10px] font-bold rounded-lg hover:bg-gray-800 transition-all"
    >
      Kona ERP 시스템 바로가기 <ExternalLink size={10} />
    </button>
  </div>
);

// 3. Chat Bubble with Bold Parsing
interface ChatBubbleProps {
  speaker: 'ai' | 'user';
  message: string;
  timestamp: string;
  isInterim?: boolean;
}
const ChatBubble: React.FC<ChatBubbleProps> = ({ speaker, message, timestamp, isInterim }) => {
  // Enhanced markdown parsing for lists and bold text
  const renderMessage = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={partIdx} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      // Handle simple list items (starting with - or 1.)
      if (line.trim().startsWith('- ') || /^\d+\./.test(line.trim())) {
          return <div key={lineIdx} className="pl-4 mb-1">{renderedParts}</div>;
      }
      // Handle headers (###)
      if (line.trim().startsWith('###')) {
          return <h3 key={lineIdx} className="text-sm font-bold mt-3 mb-1 text-gray-800">{line.replace('###', '').trim()}</h3>
      }
      
      return <div key={lineIdx} className="min-h-[1.2em]">{renderedParts}</div>;
    });
  };

  return (
    <div className={`flex w-full mb-6 animate-fade-in-up ${speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] ${speaker === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
          speaker === 'ai' ? 'bg-gray-900 text-white' : 'bg-[#FF3C42] text-white'
        }`}>
          {speaker === 'ai' ? <span className="font-bold text-xs">AI</span> : <User size={16} />}
        </div>
        <div className={`flex flex-col ${speaker === 'user' ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-line ${
            speaker === 'ai' 
              ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm' 
              : 'bg-[#FF3C42] text-white rounded-tr-sm'
          } ${isInterim ? 'animate-pulse text-gray-500' : ''}`}>
            {renderMessage(message)}
          </div>
          <span className="text-[10px] text-gray-400 mt-1.5 px-1 flex items-center gap-1">
            {timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};

// KPI Card (Shared) - Compacted
interface MultiMetric {
    label: string;
    value: string;
    status?: 'warning' | 'normal';
}

interface KPICardProps {
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

const KPICard: React.FC<KPICardProps> = ({ title, value, change, trend, icon, subtitle, isStock, onClick, footerBadge, multiMetrics }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-3 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 animate-fade-in-up group ${isStock ? 'flex flex-col justify-between' : ''} ${onClick ? 'cursor-pointer hover:border-[#FF3C42] hover:shadow-md' : 'hover:shadow-md'}`}
  >
    <div className="flex justify-between items-start mb-1">
      <div className="flex items-center gap-1.5">
        {icon && <div className="p-1 bg-gray-50 rounded-md text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">{icon}</div>}
        <span className="text-gray-500 text-xs font-medium">{title}</span>
      </div>
      {change && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
          trend === 'up' ? 'bg-red-50 text-[#FF3C42]' : 
          trend === 'down' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
        }`}>
          {trend === 'up' ? <TrendingUp size={8} /> : trend === 'down' ? <TrendingDown size={8} /> : <Minus size={8} />}
          {change}
        </span>
      )}
    </div>
    
    <div className="flex flex-col">
      {value && <div className="text-xl font-bold text-gray-900 tracking-tight">{value}</div>}
      
      {multiMetrics && (
          <div className="flex flex-col gap-1 mt-1">
              {multiMetrics.map((metric, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium">{metric.label}</span>
                      <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-900">{metric.value}</span>
                          {metric.status === 'warning' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" title="Warning"></span>}
                      </div>
                  </div>
              ))}
          </div>
      )}

      {subtitle && <div className="text-[10px] text-gray-400 mt-0.5 font-medium truncate">{subtitle}</div>}
      
      {footerBadge && (
          <div className="mt-2">
              {footerBadge}
          </div>
      )}
    </div>
  </div>
);

// Chart Widget (Shared)
interface ChartWidgetProps {
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
}

const ChartWidget: React.FC<ChartWidgetProps> = ({ 
    title, subtitle, children, height = 220, headerRight, drillPath, 
    onBreadcrumbClick, className = '', insightSummary, insightDetail 
}) => {
    const [showInsight, setShowInsight] = useState(false);

    return (
        <div className={`bg-white rounded-xl border border-gray-200 shadow-sm animate-fade-in-up relative overflow-hidden flex flex-col ${className}`}>
            <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 min-h-[40px]">
            <div className="flex items-center gap-2">
                {drillPath && onBreadcrumbClick && <Breadcrumb path={drillPath} onBack={onBreadcrumbClick} />}
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
                    onClick={() => setShowInsight(true)}
                    className="border-t border-gray-100 bg-blue-50/30 py-1.5 px-3 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors group"
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Sparkles size={10} className="text-blue-500 shrink-0" />
                        <span className="text-[10px] font-semibold text-gray-600 truncate">{insightSummary}</span>
                    </div>
                    <ChevronRight size={12} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
            )}

            {/* AI Insight Overlay Modal */}
            {showInsight && (
                <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col p-6 animate-fade-in-up">
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
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowInsight(false); }}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <div className="prose prose-sm max-w-none text-gray-700">
                            {insightDetail}
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowInsight(false); }}
                            className="px-4 py-2 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
                        >
                            확인 완료
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Widget Logic for Custom Dashboard (Duplicated from Dashboard.tsx to allow rendering in Landing) ---

export type WidgetId = 'revenue_growth_kpi' | 'cost_efficiency_kpi' | 'asp_kpi' | 'revenue_bridge_chart' | 'cost_correlation_chart' | 'monthly_trend_chart' | 'business_composition_chart' | 'top_clients_chart' | 'yoy_growth_chart' | 'anomaly_cost_chart';

export interface WidgetConfig {
    id: WidgetId;
    title: string;
    minW: number;
    minH: number;
    defaultW: number;
    defaultH: number;
    render: () => React.ReactNode;
}

// Data for Custom Widgets
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

// --- Anomaly Data: Cost Spike Scenario ---
const anomalyCostTrendData = [
  { time: '09:00', cost: 62 },
  { time: '10:00', cost: 63 },
  { time: '11:00', cost: 62 },
  { time: '12:00', cost: 64 },
  { time: '13:00', cost: 72 }, // Spike
  { time: '14:00', cost: 71 },
  { time: '15:00', cost: 69 }, // Recovering
];

// Custom Renderers
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


// --- Mock Data for Default View (Unchanged) ---
const salesTrendData2025 = [
  { name: '10월', sales: 32 },
  { name: '11월', sales: 37 },
  { name: '12월', sales: 42, active: true },
];

const metalProductData = [
  { name: 'Standard', value: 18.5, color: '#000000' },
  { name: 'Gold Premium', value: 12.2, color: '#FFD700' },
  { name: 'LED Metal', value: 8.4, color: '#FF3C42' },
  { name: 'Bio-Metal', value: 2.9, color: '#E5E7EB' },
];

const metalDailyData = [
  { day: '12/22', revenue: 1.2 },
  { day: '12/23', revenue: 1.5 },
  { day: '12/24', revenue: 1.8 },
  { day: '12/25', revenue: 0.8 }, 
  { day: '12/26', revenue: 2.4 }, 
  { day: '12/27', revenue: 2.2 }, 
  { day: '12/28', revenue: 2.3 }, 
];

const productBreakdownData = [
  { name: 'Standard Metal', value: 450, color: '#000000' },
  { name: 'Gold/Premium', value: 320, color: '#FFD700' },
  { name: 'LED Metal', value: 180, color: '#FF3C42' },
];
const japanScenarioData = {
  '9.0': { revenue: 1120, profit: 72, margin: 6.4 },
  '9.5': { revenue: 1180, profit: 80, margin: 6.8 },
  '10.0': { revenue: 1240, profit: 95, margin: 7.7 },
};
const costEfficiencyData = [
  { name: '10월', ratio: 68, cost: 21.8, target: 65 },
  { name: '11월', ratio: 65, cost: 24.0, target: 65 },
  { name: '12월', ratio: 62, cost: 26.0, target: 65 },
];
const didAnalysisData = [
  { name: '10월', orders: 2.5, revenue: 1.8 },
  { name: '11월', orders: 2.2, revenue: 2.0 },
  { name: '12월', orders: 1.7, revenue: 1.9 },
];
const customerGrowthData = [
  { name: 'A은행', nov: 5.0, dec: 12.0, growth: 140.0 },
  { name: 'B카드', nov: 8.0, dec: 11.0, growth: 37.5 },
  { name: 'C카드', nov: 15.0, dec: 14.0, growth: -6.7 },
  { name: '기타', nov: 9.0, dec: 5.0, growth: -44.4 },
];

const benchmarkData = [
  { name: '자사(Kona I)', cost: 62, fill: '#FF3C42' },
  { name: '경쟁사 A', cost: 68, fill: '#9CA3AF' },
  { name: '경쟁사 B', cost: 71, fill: '#9CA3AF' },
  { name: '경쟁사 C', cost: 65, fill: '#9CA3AF' },
];

const ANALYST_REPORT_RESPONSE = `
**[2026년 사업 전망 보고서]**

**1. 종합 전망**
추가해주신 12월 4주차 데이터를 포함하여 분석한 결과, 2026년은 **매출 5,200억 원(+18% YoY)** 달성이 유력합니다.

**2. 핵심 성장 동력**
*   **프리미엄 라인업 확대:** Gold Edition 및 LED Metal 카드의 수요가 전년 대비 45% 증가할 것으로 예측됩니다.
*   **글로벌 시장 침투:** 일본 및 동남아 시장의 수주 잔고가 1분기부터 매출로 실현됩니다.

**3. 리스크 요인 및 대응**
*   원자재 공급망 불안정성이 존재하나, 장기 계약을 통해 2026년 상반기 물량은 이미 확보되었습니다.

상세한 내용은 하단의 리포트 파일을 다운로드하여 확인하시기 바랍니다.
`;

// --- Main View Component ---

const LiveboardView: React.FC<LiveboardViewProps> = ({ onAskAgent }) => {
  // --- State Management ---
  const [showFullDashboard, setShowFullDashboard] = useState(true); 
  const [isAgentOpen, setIsAgentOpen] = useState(true); 
  const [agentInput, setAgentInput] = useState("");
  
  // Tab State for Custom Dashboard
  const [activeDashboardTab, setActiveDashboardTab] = useState<'default' | 'custom'>('default');
  const [customLayout, setCustomLayout] = useState<GridLayout>([]);
  const [customWidgets, setCustomWidgets] = useState<WidgetId[]>([]);

  // Layout Editing State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editLayout, setEditLayout] = useState<GridLayout>([]);
  const [originalLayout, setOriginalLayout] = useState<GridLayout>([]);

  // New State for Time Filter Dropdown
  const [timeFilter, setTimeFilter] = useState('월간'); 
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
  const timeOptions = ['일간', '주간', '월간', '연간'];
  
  // Scenario States
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [history, setHistory] = useState<Turn[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [dashboardComponents, setDashboardComponents] = useState<React.ReactNode[]>([]);
  
  // Drill-down States (for Full Dashboard)
  const [metalDrill, setMetalDrill] = useState<DrillState>({ level: 1, path: ['Metal Card'] });
  
  // Task: Drill-down Menu State with Data Payload
  const [metalMenu, setMetalMenu] = useState<DrillMenuState>({ isOpen: false, step: 'initial', x: 0, y: 0, data: null });
  // Task: Active Context Data for Agent
  const [activeContextData, setActiveContextData] = useState<DrillMenuData | null>(null);

  // Task: Widget Selection State for Save Form (Mock)
  const [widgetSelection, setWidgetSelection] = useState([
    { id: 'kpi', title: '주요 경영 지표 (Main KPIs)', type: 'KPI Grid', date: '2025.12.28', checked: true },
    { id: 'chart1', title: '메탈카드 월별 매출 추이', type: 'Line Chart', date: '2025.12.28', checked: true },
    { id: 'chart2', title: '원가율 개선 추이', type: 'Composed Chart', date: '2025.12.28', checked: true },
    { id: 'chart3', title: '고객사별 매출 성장 분석', type: 'Bar Chart', date: '2025.12.28', checked: true },
    { id: 'chart4', title: 'DID 칩 수주 vs 매출 흐름', type: 'Composed Chart', date: '2025.12.28', checked: true },
    { id: 'stock', title: '주식 관련 재무 지표', type: 'Stock Grid', date: '2025.12.28', checked: true },
  ]);

  const [clientDrill, setClientDrill] = useState<DrillState>({ level: 1, path: ['Client Growth'] });
  const [japanDrill, setJapanDrill] = useState<DrillState>({ level: 1, path: ['Japan P&L'], context: '9.5' });
  const [didDrill, setDidDrill] = useState<DrillState>({ level: 1, path: ['DID Chip'] });

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const dashboardEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null); 

  // Load Saved Dashboard on Mount or Tab Change
  useEffect(() => {
    if (activeDashboardTab === 'custom') {
      const { layout, widgets } = storageService.loadDashboard();

      if (layout) {
        setCustomLayout(layout);
      }
      if (widgets) {
        setCustomWidgets(widgets);
      }
    }
  }, [activeDashboardTab]);

  // Common Back Handler
  const handleBack = (drillSetter: React.Dispatch<React.SetStateAction<DrillState>>, index: number) => {
    drillSetter((prev: DrillState) => ({
      level: (index + 1) as DrillLevel,
      path: prev.path.slice(0, index + 1),
      context: index === 0 ? undefined : prev.context
    }));
    // Reset menu state when navigating back
    setMetalMenu({ isOpen: false, step: 'initial', x: 0, y: 0, data: null });
  };

  const handleAgentSubmit = () => {
    if(!agentInput.trim()) return;
    
    const userMessage = agentInput;
    const newTurnId = Date.now();
    
    // Check for specific analyst request with context
    const isAnalystRequest = userMessage.includes("원인") || userMessage.includes("분석") || userMessage.includes("제안");

    let responseMessage = "요청하신 데이터를 분석하고 있습니다. 대시보드 지표와 연동하여 상세 리포트를 생성 중입니다...";
    
    // Task: Inject specific analyst report if context matches request
    if (isAnalystRequest) {
        responseMessage = ANALYST_REPORT_RESPONSE;
        // Requirement: Interaction Logic - Auto scroll down will be handled by useEffect [history]
    }

    setHistory(prev => [...prev, { id: newTurnId, userMessage: userMessage, aiMessage: responseMessage, widgets: [], quickReplies: [], isInterim: false }]);
    setAgentInput("");
    
    // Input resizing will be handled by useEffect now
  };

  // Task 1: Robust Auto-resize logic using useEffect
  useEffect(() => {
    if (inputRef.current) {
        // Reset height to auto first to correctly calculate scrollHeight when shrinking
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [agentInput]);

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAgentInput(e.target.value);
  };

  // --- Layout Editing Handlers ---
  const handleEditToggle = () => {
    if (!isEditMode) {
        // Enter edit mode
        setOriginalLayout(JSON.parse(JSON.stringify(customLayout))); // Deep copy for backup
        setEditLayout(customLayout); // Set temp layout for editing
    }
    setIsEditMode(!isEditMode);
  };

  const handleSaveLayout = () => {
    setCustomLayout(editLayout);
    localStorage.setItem('my_dashboard_layout', JSON.stringify(editLayout));
    setIsEditMode(false);
    // Optional: Toast notification here
  };

  const handleCancelEdit = () => {
    setCustomLayout(originalLayout);
    setEditLayout(originalLayout);
    setIsEditMode(false);
  };

  const handleResetLayout = () => {
    if (window.confirm('대시보드를 초기화하시겠습니까? 저장된 설정이 모두 삭제됩니다.')) {
        localStorage.removeItem('my_dashboard_layout');
        localStorage.removeItem('my_dashboard_widgets');
        setCustomLayout([]);
        setCustomWidgets([]);
        setIsEditMode(false);
    }
  };

  // --- Widget Renderers ---

  // 1. Scenario Widgets (Static/Simplified for building the dashboard)
  const renderKPIGrid = (onMetalClick?: () => void) => (
    <div className="flex flex-col gap-4 mb-6">
        {/* Row 1: Main KPIs */}
        <div key="kpi-grid-1" className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up">
            <KPICard 
                title="메탈 카드 매출" 
                value="₩42억" 
                change="+13.5%" 
                trend="up" 
                icon={<CreditCard size={18}/>} 
                onClick={onMetalClick}
            />
            <KPICard title="DID 칩셋 수주" value="₩18억" change="-8.0%" trend="down" icon={<Cpu size={18}/>} />
            <KPICard title="일본 지사 영업이익률" value="-3.2%" change="-0.5%" trend="down" icon={<TrendingDown size={18}/>} />
        </div>

        {/* Row 2: Secondary KPIs (New Addition) */}
        <div key="kpi-grid-2" className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up delay-100">
             {/* Card 1: Operating Cash Flow */}
             <KPICard 
                title="영업현금흐름" 
                value="+₩48억 (월)"
                change="+45.5%"
                trend="up"
                icon={<Banknote size={18} />}
                footerBadge={
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                        목표 120% 달성 <CheckCircle2 size={12} className="fill-green-600 text-white" />
                    </span>
                }
             />
             
             {/* Card 2: Local Currency Platform */}
             <KPICard 
                title="지역화폐 플랫폼" 
                icon={<Smartphone size={18} />}
                multiMetrics={[
                    { label: "거래액", value: "₩175억" },
                    { label: "매출", value: "₩1.8억" },
                    { label: "이익", value: "-₩0.3억", status: "warning" },
                ]}
             />
        </div>
    </div>
  );

  const renderSalesGrowthChart = (showInsight = false) => (
    <ChartWidget 
        key="sales-growth" 
        title="메탈카드 월별 매출 추이" 
        subtitle="2025년 4분기 (단위: 억 원)"
        insightSummary={showInsight ? "12월 매출 급증 (+13.5%) 및 성장 동력 분석" : undefined}
        insightDetail={showInsight ? (
            <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h5 className="font-bold text-blue-900 mb-2">📈 Growth Factor</h5>
                    <p className="text-sm text-blue-800">12월 매출 42억 원 달성은 A은행 신규 발급 물량(20만 장)의 조기 소진과 B카드 프리미엄 라인업(Gold Edition) 확대에 기인합니다. 특히 B카드의 경우 객단가가 8% 상승하며 질적 성장을 견인했습니다.</p>
                </div>
                <div>
                    <h5 className="font-bold text-gray-900 mb-2">Suggested Actions</h5>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        <li>1월 설 연휴 대비 12월 4주차 추가 생산 가동</li>
                        <li>A은행 대상 VMI(재고관리) 제안으로 1월 물량 선확보</li>
                    </ul>
                </div>
            </div>
        ) : undefined}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={salesTrendData2025} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} dy={5} tick={{fontSize: 10}} />
          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} domain={[25, 45]} />
          <Tooltip />
          <Line type="monotone" dataKey="sales" name="매출액" stroke="#000" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6, fill: '#FF3C42'}} animationDuration={2000} />
        </LineChart>
      </ResponsiveContainer>
    </ChartWidget>
  );

  const renderCostRatioChart = (showInsight = false) => (
    <ChartWidget 
        key="cost-ratio" 
        title="원가율 개선 추이 (Cost Efficiency)" 
        subtitle="목표 원가율 65% 대비 성과"
        insightSummary={showInsight ? "자동화 공정 도입에 따른 원가율 3%p 개선 효과" : undefined}
        insightDetail={showInsight ? (
            <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <h5 className="font-bold text-green-900 mb-2">📉 Efficiency Gain</h5>
                    <p className="text-sm text-green-800">10월 68%에서 12월 62%로 원가율이 지속 하락 중입니다. 이는 메탈 카드 후가공 공정의 자동화율이 40%에서 75%로 확대됨에 따라 노무비가 절감된 효과입니다.</p>
                </div>
                <div>
                    <h5 className="font-bold text-gray-900 mb-2">Expansion Plan</h5>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        <li>자동화 설비 2호기 도입 검토 (Q1 2026)</li>
                        <li>불량률 0.5% 미만 유지 시 원가율 60% 달성 가능</li>
                    </ul>
                </div>
            </div>
        ) : undefined}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={costEfficiencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} dy={5} tick={{fontSize: 10}} />
          <YAxis axisLine={false} tickLine={false} unit="%" domain={[50, 80]} tick={{fontSize: 10}} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          <Bar dataKey="ratio" name="실제 원가율" barSize={20} fill="#FF3C42" radius={[4, 4, 0, 0]} animationDuration={2000} />
          <Line type="monotone" dataKey="target" name="Target (65%)" stroke="#9CA3AF" strokeDasharray="5 5" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartWidget>
  );

  const renderCustomerAnalysisWidget = (showInsight = false) => (
    <ChartWidget 
        key="customer-analysis"
        title="고객사별 매출 성장 분석"
        subtitle="Growth Rate Breakdown by Client"
        insightSummary={showInsight ? "A은행 급성장(140%) vs C카드 감소(-6.7%) 원인" : undefined}
        insightDetail={showInsight ? (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                        <h5 className="font-bold text-purple-900 mb-1">A은행 (Positive)</h5>
                        <p className="text-xs text-purple-800">신규 카드 런칭 효과로 전월 대비 140% 성장. 1월까지 발주 물량 확정 상태.</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <h5 className="font-bold text-gray-900 mb-1">C카드 (Negative)</h5>
                        <p className="text-xs text-gray-700">연말 프로모션 종료로 인한 일시적 감소. 1월 설 프로모션으로 반등 예상.</p>
                    </div>
                </div>
                <div>
                    <h5 className="font-bold text-gray-900 mb-2">Strategy</h5>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        <li>A은행: 전담 영업팀 배치 및 주간 공급 회의 정례화</li>
                        <li>C카드: 신규 폼팩터(LED Metal) 제안으로 객단가 방어</li>
                    </ul>
                </div>
            </div>
        ) : undefined}
    >
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={customerGrowthData} margin={{ top: 0, right: 35, left: 10, bottom: 0 }} barGap={2}>
                    <CartesianGrid stroke="#f5f5f5" horizontal={true} vertical={true} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={40} tickLine={false} axisLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#374151'}} />
                    <Tooltip cursor={{fill: '#F9FAFB'}} formatter={(value: number) => [`₩${value}억`, '매출']} />
                    <Legend wrapperStyle={{fontSize: '10px'}} iconType="circle" />
                    <Bar dataKey="nov" name="11월 매출" fill="#8B5CF6" barSize={8} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="dec" name="12월 매출" fill="#000" barSize={8} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="growth" position="right" content={(props: LabelListRenderProps) => {
                            const { x, y, height, value } = props;
                            const numValue = Number(value);
                            return (
                                <g transform={`translate(${x + 5},${y + height / 2 + 3})`}>
                                    <text x={0} y={0} fill={numValue > 0 ? (numValue > 100 ? '#FF3C42' : '#059669') : '#6B7280'} fontSize="9" fontWeight="bold">
                                        {numValue > 0 ? '+' : ''}{numValue}%
                                    </text>
                                </g>
                            );
                        }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    </ChartWidget>
  );

  const renderBenchmarkChart = (showInsight = false) => (
    <ChartWidget 
        key="benchmark-chart" 
        title="경쟁사 대비 원가율 벤치마크" 
        subtitle="단위: % (낮을수록 좋음)"
        insightSummary={showInsight ? "경쟁사 대비 6%p 원가 우위 확보 및 유지 전략" : undefined}
        insightDetail={showInsight ? (
            <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <h5 className="font-bold text-red-900 mb-2">🏆 Competitive Edge</h5>
                    <p className="text-sm text-red-800">당사 원가율(62%)은 경쟁사 평균(68%) 대비 확실한 우위를 점하고 있습니다. 이는 자체 칩셋(Kona Chip) 사용 비중이 경쟁사 대비 30% 높기 때문입니다.</p>
                </div>
                <div>
                    <h5 className="font-bold text-gray-900 mb-2">Maintain Gap</h5>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        <li>원자재(메탈 플레이트) 장기 공급 계약 체결로 단가 변동성 최소화</li>
                        <li>칩셋 내재화 비율 80%까지 확대 (현재 65%)</li>
                    </ul>
                </div>
            </div>
        ) : undefined}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={benchmarkData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} domain={[50, 80]} />
          <Tooltip />
          <Bar dataKey="cost" name="원가율" barSize={30} radius={[4, 4, 0, 0]}>
            {benchmarkData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <LabelList dataKey="cost" position="top" formatter={(val: number) => `${val}%`} style={{fontSize: 10, fontWeight: 'bold'}} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWidget>
  );

  const renderDIDAnalysisChart = (showInsight = false) => (
    <ChartWidget 
        key="did-analysis" 
        title="DID 칩 수주 vs 매출 흐름" 
        subtitle="2025년 4분기 | 단위: 억 원" 
        insightSummary={showInsight ? "입찰 지연에 따른 수주 감소와 1월 회복 전망" : undefined}
        insightDetail={showInsight ? (
            <div className="space-y-4">
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <h5 className="font-bold text-amber-900 mb-2">⚠️ Risk: Delayed Bidding</h5>
                    <p className="text-sm text-amber-800">12월 수주액 감소는 행안부 모바일 신분증 프로젝트 입찰이 1월로 연기된 영향입니다. 이는 구조적 문제가 아닌 시점(Timing) 이슈입니다.</p>
                </div>
                <div>
                    <h5 className="font-bold text-gray-900 mb-2">Recovery Plan</h5>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        <li>1월 중순 입찰 확정 시 수주액 25억 원 즉시 회복 예상</li>
                        <li>기존 수주 잔고(Backlog) 1.9억 원으로 단기 매출 방어 가능</li>
                    </ul>
                </div>
            </div>
        ) : undefined}
        headerRight={
            <div className="flex items-center gap-2 px-2 py-0.5 bg-amber-50 rounded-full border border-amber-100">
                <AlertTriangle size={10} className="text-amber-500" />
                <span className="text-[10px] font-bold text-amber-700">입찰 지연</span>
            </div>
        }
    >
      <ResponsiveContainer width="100%" height="100%">
        {/* Task 2: Chart Colors Enhanced - Revenue: Slate-500 (#64748B), Orders: Brand Red (#FF3C42) */}
        <ComposedChart data={didAnalysisData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} dy={5} tick={{fontSize: 10}} />
          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} domain={[0, 3]} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          <Bar dataKey="revenue" name="매출액 (Revenue)" barSize={30} fill="#64748B" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="orders" name="수주액 (Orders)" stroke="#FF3C42" strokeWidth={3} dot={{r: 4}} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartWidget>
  );

  const renderReportDownloadWidget = () => (
    <div key="report-download" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 animate-fade-in-up flex items-center justify-between group hover:border-blue-300 transition-colors cursor-pointer mb-4">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center shrink-0 border border-blue-200">
                <FileText size={20} />
            </div>
            <div>
                <h4 className="text-xs font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">2026_Business_Outlook_Report.docx</h4>
                <div className="flex items-center gap-2">
                    <p className="text-[10px] text-gray-500">생성일: 2025.12.28 | 크기: 2.4MB</p>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">NEW</span>
                </div>
            </div>
        </div>
        <button className="p-2 bg-gray-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-gray-500 border border-gray-100 hover:border-blue-600">
            <Download size={18} />
        </button>
    </div>
  );

  const renderStockGrid = () => (
    <div key="stock-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in-up">
      <KPICard title="현재가" value="₩8,250" change="+150▲" trend="up" isStock subtitle="코나아이 (052400)" />
      <KPICard title="PER" value="12.3배" isStock subtitle="업종 평균 15.2배" />
      <KPICard title="PBR" value="1.8배" isStock subtitle="업종 평균 2.1배" />
      <KPICard title="시가총액" value="1,247억" isStock subtitle="KOSDAQ 상위권" />
    </div>
  );

  // Reordered renderFinalSummary to ensure it is defined before use in handleTurn
  const renderFinalSummary = () => (
    <div key="final-summary" className="bg-white rounded-2xl border border-gray-200 shadow-sm animate-fade-in-up mb-6 overflow-hidden">
        <div className="p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">대시보드 구성 완료</h2>
            <p className="text-gray-500 mb-8 max-w-md">요청하신 'CEO 일일 브리핑' 대시보드의 모든 설정이 성공적으로 저장되었습니다.</p>
            
            {/* Dashboard Summary Table of Contents */}
            <div className="w-full max-w-md bg-gray-50 rounded-xl border border-gray-100 p-5 mb-8 text-left">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <LayoutDashboard size={12} />
                    대시보드 구성 요약
                </h3>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF3C42] mt-1.5 shrink-0"></div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">주요 경영 지표 (KPIs)</p>
                            <p className="text-xs text-gray-500">메탈 카드 매출, DID 수주액, 영업이익률</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0"></div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">사업부별 상세 분석</p>
                            <p className="text-xs text-gray-500">메탈카드 매출 추이, 원가율 분석, DID 수주 흐름</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0"></div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">고객 및 시장 데이터</p>
                            <p className="text-xs text-gray-500">고객사별 성장률, 코나아이 주가 지표</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Action Button to Open Full Dashboard */}
            <button 
                onClick={() => setShowFullDashboard(true)}
                className="w-full max-w-sm py-4 bg-black text-white rounded-2xl text-lg font-bold hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-3 group"
            >
                <span>대시보드 열기</span>
                <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
            <p className="mt-4 text-xs text-gray-400 flex items-center gap-2">
                <Clock size={12} /> 최종 저장 시각: 2025.12.28 08:16:51
            </p>
        </div>
    </div>
  );

  // Added handleTurn function
  const handleTurn = (step: number, message: string) => {
      if (step === 6) {
          // Add User Message
          const userTurn: Turn = {
              id: Date.now(),
              userMessage: message,
              aiMessage: "설정을 저장하고 있습니다...",
              widgets: [],
              quickReplies: []
          };
          setHistory(prev => [...prev, userTurn]);

          setTimeout(() => {
              const aiTurn: Turn = {
                  id: Date.now() + 1,
                  aiMessage: "저장이 완료되었습니다. 대시보드 구성을 확인해주세요.",
                  widgets: [renderFinalSummary()],
                  quickReplies: []
              };
              setHistory(prev => [...prev, aiTurn]);
          }, 800);
      }
  };

  const renderDashboardSaveForm = () => (
    <div key="save-settings-form" className="bg-white rounded-2xl border border-gray-200 shadow-sm animate-fade-in-up mb-6 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <div className="p-2 bg-black rounded-lg text-white"><Save size={18} /></div>
            <div>
                <h3 className="text-lg font-bold text-gray-900">대시보드 저장</h3>
                <p className="text-xs text-gray-500">Liveboard Settings</p>
            </div>
        </div>
        <div className="p-6 space-y-6">
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">대시보드 이름</label>
                <input type="text" defaultValue="CEO 일일 브리핑" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF3C42] focus:bg-white transition-all font-semibold text-gray-800" />
            </div>
            
            {/* Task: Widget Selection UI */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">포함할 위젯 선택 ({widgetSelection.filter(w => w.checked).length})</label>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setWidgetSelection(prev => prev.map(w => ({ ...w, checked: true })))}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700"
                        >
                            Select All
                        </button>
                        <span className="text-gray-300 text-[10px]">|</span>
                        <button 
                            onClick={() => setWidgetSelection(prev => prev.map(w => ({ ...w, checked: false })))}
                            className="text-[10px] font-bold text-gray-400 hover:text-gray-600"
                        >
                            Deselect All
                        </button>
                    </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden max-h-[240px] overflow-y-auto custom-scrollbar">
                    {widgetSelection.map((widget) => (
                        <div 
                            key={widget.id} 
                            onClick={() => setWidgetSelection(prev => prev.map(w => w.id === widget.id ? { ...w, checked: !w.checked } : w))}
                            className={`flex items-center gap-3 p-3 border-b border-gray-100 last:border-0 cursor-pointer transition-colors hover:bg-white ${widget.checked ? 'bg-blue-50/30' : ''}`}
                        >
                            <div className={`shrink-0 text-gray-400 ${widget.checked ? 'text-[#FF3C42]' : ''}`}>
                                {widget.checked ? <CheckSquare size={16} /> : <Square size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold truncate ${widget.checked ? 'text-gray-900' : 'text-gray-500'}`}>{widget.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-medium">{widget.type}</span>
                                    <span className="text-[10px] text-gray-400">{widget.date}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all">취소</button>
            <button onClick={() => handleTurn(6, "저장해 줘.")} className="px-6 py-2.5 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-800 transition-all flex items-center gap-2">
                <CheckCircle2 size={16} /> 
                <span>{widgetSelection.filter(w => w.checked).length}개 위젯 저장하기</span>
            </button>
        </div>
    </div>
  );

  // 2. Full Dashboard Drill-Down Renderers
  const renderMetalWidget = () => {
    // Level 3: Visualization (Product/Date)
    if (metalDrill.level === 3) {
      if (metalDrill.context === 'product') {
        // Option A: Product Breakdown
        return (
          <ChartWidget 
            title="12월 제품별 메탈카드 매출" subtitle="단위: 억 원 (Product Breakdown)" 
            drillPath={metalDrill.path} onBreadcrumbClick={(idx) => handleBack(setMetalDrill, idx)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metalProductData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={90} tickLine={false} axisLine={false} tick={{fontSize: 12, fontWeight: 600}} />
                <Tooltip cursor={{fill: '#f9fafb'}} />
                <Bar dataKey="value" barSize={24} radius={[0, 4, 4, 0]}>
                    {metalProductData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <LabelList dataKey="value" position="right" fontSize={11} fontWeight="bold" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartWidget>
        );
      } else if (metalDrill.context === 'date') {
        // Option B: Daily Trend
        return (
          <ChartWidget 
             title="12월 일자별 메탈카드 매출" subtitle="2025년 12월 4주차 (단위: 억 원)" 
             drillPath={metalDrill.path} onBreadcrumbClick={(idx) => handleBack(setMetalDrill, idx)}
          >
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metalDailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" name="매출" stroke="#000" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
             </ResponsiveContainer>
          </ChartWidget>
        );
      }
    }

    // Task: Overlay Popup Menu for Drill Down Interaction
    // This replaces the previous full-widget swap (Level 2) with a popup overlay on Level 1
    const renderDrillPopup = () => {
        if (!metalMenu.isOpen) return null;

        return (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/5 rounded-2xl backdrop-blur-[1px] animate-fade-in-up" onClick={() => setMetalMenu({ ...metalMenu, isOpen: false })}>
                {metalMenu.step === 'initial' ? (
                    // Step 1: Initial Choice (Drill Down vs Ask Agent)
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-[200px] flex flex-col gap-1 transform scale-100 transition-all" onClick={(e) => e.stopPropagation()}>
                        <div className="px-3 py-2 border-b border-gray-100 mb-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {metalMenu.data ? `${metalMenu.data.name} 데이터 분석` : '데이터 분석'}
                            </span>
                        </div>
                        <button 
                            onClick={() => setMetalMenu({ ...metalMenu, step: 'options' })}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-[#FF3C42] rounded-lg transition-colors text-left"
                        >
                            <MousePointerClick size={16} />
                            드릴다운 (Drill-down)
                        </button>
                        <button 
                            onClick={() => {
                                setMetalMenu({ ...metalMenu, isOpen: false });
                                // Task 2: Interaction Redesign - Navigate to SampleInterface
                                if (onAskAgent) {
                                    onAskAgent(metalMenu.data);
                                }
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-left"
                        >
                            <Bot size={16} />
                            에이전트에게 질문
                        </button>
                    </div>
                ) : (
                    // Step 2: Dimension Selection
                    // Task 1: UI Update - All buttons look active/enabled
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-[220px] flex flex-col gap-1 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 mb-1">
                            <button onClick={() => setMetalMenu({ ...metalMenu, step: 'initial' })} className="hover:bg-gray-100 rounded p-1 -ml-1">
                                <ChevronLeft size={14} className="text-gray-500" />
                            </button>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">분석 기준 선택</span>
                        </div>
                        
                        <button 
                            onClick={() => {
                                setMetalMenu({ ...metalMenu, isOpen: false });
                                setMetalDrill({ level: 3, path: ['Metal Card', '제품별'], context: 'product' });
                            }}
                            className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-[#FF3C42] rounded-lg transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3"><Box size={16} /> 제품별 (Product)</div>
                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-[#FF3C42]" />
                        </button>
                        
                        <button 
                            onClick={() => {
                                setMetalMenu({ ...metalMenu, isOpen: false });
                                setMetalDrill({ level: 3, path: ['Metal Card', '일자별'], context: 'date' });
                            }}
                            className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-[#FF3C42] rounded-lg transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3"><CalendarDays size={16} /> 일자별 (Date)</div>
                             <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-[#FF3C42]" />
                        </button>

                        {/* Task 1: Visually active but functionally null/alert */}
                        <button 
                             onClick={() => alert("준비 중인 기능입니다.")}
                             className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-[#FF3C42] rounded-lg transition-colors text-left group"
                        >
                             <div className="flex items-center gap-3"><Calendar size={16} /> 주차별 (Week)</div>
                             <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-[#FF3C42]" />
                        </button>
                        
                        <button 
                             onClick={() => alert("준비 중인 기능입니다.")}
                             className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-[#FF3C42] rounded-lg transition-colors text-left group"
                        >
                             <div className="flex items-center gap-3"><Map size={16} /> 국가별 (Country)</div>
                             <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-[#FF3C42]" />
                        </button>
                    </div>
                )}
            </div>
        )
    };

    // Level 1: Monthly Trend (Default) - Task 1: Bug Fix with robust handler and safe checks
    return (
      <ChartWidget 
        title="메탈카드 월별 매출" subtitle="2025년 4분기 (단위: 억 원)" height={220}
        drillPath={metalDrill.path} onBreadcrumbClick={(idx) => handleBack(setMetalDrill, idx)}
        headerRight={
           <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
             <div className="w-1.5 h-1.5 rounded-full bg-[#FF3C42] animate-pulse"></div>
             <span>12월 클릭하여 상세 분석</span>
           </div>
        }
        className="relative overflow-hidden" // Ensure popup stays within bounds
        insightSummary="12월 매출 급증 (+13.5%) 및 성장 동력 분석"
        insightDetail={
            <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h5 className="font-bold text-blue-900 mb-2">📈 Growth Factor</h5>
                    <p className="text-sm text-blue-800">12월 매출 42억 원 달성은 A은행 신규 발급 물량(20만 장)의 조기 소진과 B카드 프리미엄 라인업(Gold Edition) 확대에 기인합니다. 특히 B카드의 경우 객단가가 8% 상승하며 질적 성장을 견인했습니다.</p>
                </div>
                <div>
                    <h5 className="font-bold text-gray-900 mb-2">Suggested Actions</h5>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        <li>1월 설 연휴 대비 12월 4주차 추가 생산 가동</li>
                        <li>A은행 대상 VMI(재고관리) 제안으로 1월 물량 선확보</li>
                    </ul>
                </div>
            </div>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={salesTrendData2025}
            onClick={(data: { activePayload?: Array<{ payload: { name: string; value: number } }> } | null) => {
                 // Enhanced safety check for Task 1
                 if (data && data.activePayload && data.activePayload[0] && data.activePayload[0].payload.name === '12월') {
                     // Instead of direct drill down, open the popup menu (Task 1)
                     // Task: Capture specific payload data for context injection
                     setMetalMenu({ isOpen: true, step: 'initial', x: 0, y: 0, data: data.activePayload[0].payload });
                 }
            }}
          >
            <CartesianGrid stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Line 
                type="monotone" 
                dataKey="sales" 
                name="매출" 
                stroke="#000" 
                strokeWidth={3} 
                dot={(props: LineDotRenderProps) => {
                    const { cx, cy, payload } = props;
                    if (payload.name === '12월') {
                        // Visual cue added for clickability
                        return (
                            <circle cx={cx} cy={cy} r={6} fill="#FF3C42" stroke="white" strokeWidth={2} className="cursor-pointer hover:scale-125 transition-transform" />
                        );
                    }
                    return <circle cx={cx} cy={cy} r={4} fill="#000" />;
                }}
                activeDot={{r: 8, stroke: "#FF3C42", strokeWidth: 2}} 
                cursor="pointer" 
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Render the popup menu overlay */}
        {renderDrillPopup()}
      </ChartWidget>
    );
  };

  const renderClientWidget = () => {
    // Task 3: November Comparison Feature Implementation
    // Replaces simple BarChart with clustered BarChart for MoM comparison
    if (clientDrill.level === 3) {
      return (
        <ChartWidget 
          title="고객사별 제품군 상세 분석" 
          drillPath={clientDrill.path} onBreadcrumbClick={(idx) => handleBack(setClientDrill, idx)}
        >
          <DepthLimitNotice onRedirect={() => alert("ERP 시스템으로 이동합니다.")} />
        </ChartWidget>
      );
    }
    if (clientDrill.level === 2) {
      const clientName = clientDrill.context || 'A은행';
      return (
        <ChartWidget 
          title={`${clientName} 제품군별 매출 비중`} subtitle="상세 품목 구성 (단위: 만 장)"
          drillPath={clientDrill.path} onBreadcrumbClick={(idx) => handleBack(setClientDrill, idx)}
          headerRight={<div className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded">HOT: Gold Metal</div>}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={productBreakdownData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                onClick={() => setClientDrill(prev => ({ level: 3, path: [...prev.path, 'Depth Limit'] }))}
              >
                {productBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartWidget>
      );
    }
    return (
      <ChartWidget 
        title="고객사별 매출 성장 분석" subtitle="전월 대비 성장 비교 (MoM)" height={220}
        drillPath={clientDrill.path} onBreadcrumbClick={(idx) => handleBack(setClientDrill, idx)}
        insightSummary="A은행 급성장(140%) vs C카드 감소(-6.7%) 원인"
        insightDetail={
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                        <h5 className="font-bold text-purple-900 mb-1">A은행 (Positive)</h5>
                        <p className="text-xs text-purple-800">신규 카드 런칭 효과로 전월 대비 140% 성장. 1월까지 발주 물량 확정 상태.</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <h5 className="font-bold text-gray-900 mb-1">C카드 (Negative)</h5>
                        <p className="text-xs text-gray-700">연말 프로모션 종료로 인한 일시적 감소. 1월 설 프로모션으로 반등 예상.</p>
                    </div>
                </div>
                <div>
                    <h5 className="font-bold text-gray-900 mb-2">Strategy</h5>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        <li>A은행: 전담 영업팀 배치 및 주간 공급 회의 정례화</li>
                        <li>C카드: 신규 폼팩터(LED Metal) 제안으로 객단가 방어</li>
                    </ul>
                </div>
            </div>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          {/* Task 2: Chart Colors Enhanced - Nov: Slate-400 (#94A3B8), Dec: Slate-800 (#1E293B) */}
          <BarChart 
            layout="vertical" 
            data={customerGrowthData} // Using existing data which has nov/dec fields
            margin={{right: 40, left: 10}}
            barGap={2}
          >
            <CartesianGrid stroke="#f0f0f0" vertical={true} horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={50} axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
            <Tooltip cursor={{fill: '#F9FAFB'}} />
            <Legend iconType="circle" wrapperStyle={{fontSize: '10px'}} />
            {/* Task 3: Explicitly showing Nov vs Dec */}
            <Bar dataKey="nov" name="11월 매출" fill="#94A3B8" barSize={8} radius={[0, 4, 4, 0]} />
            <Bar 
                dataKey="dec" 
                name="12월 매출" 
                fill="#1E293B" 
                barSize={8} 
                radius={[0, 4, 4, 0]}
                onClick={(data) => setClientDrill({ level: 2, path: ['Client Growth', data.name], context: data.name })}
                cursor="pointer"
            >
               <LabelList 
                    dataKey="growth" 
                    position="right" 
                    formatter={(v: number) => `${v > 0 ? '+' : ''}${v}%`} 
                    style={{fontSize: 9, fontWeight: 'bold', fill: '#666'}} 
                />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartWidget>
    );
  };

  const renderJapanWidget = () => {
    const currentScenario = japanScenarioData[japanDrill.context as keyof typeof japanScenarioData];
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 animate-fade-in-up flex flex-col justify-between h-[288px]">
        <div>
            <Breadcrumb path={japanDrill.path} onBack={(idx) => handleBack(setJapanDrill, idx)} />
            <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">일본 지사 손익 시뮬레이션</h3>
            <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-gray-400">JPY/KRW:</span>
                {['9.0', '9.5', '10.0'].map(val => (
                <button 
                    key={val}
                    onClick={() => setJapanDrill({ level: 2, path: ['Japan P&L', `Rate: ${val}`], context: val })}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${japanDrill.context === val ? 'bg-[#FF3C42] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                    {val}
                </button>
                ))}
            </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] font-bold text-gray-400 mb-0.5 uppercase tracking-wider text-center">예상 매출</p>
                <p className="text-sm font-bold text-gray-900 text-center">{currentScenario.revenue.toLocaleString()} M</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] font-bold text-gray-400 mb-0.5 uppercase tracking-wider text-center">예상 영업이익</p>
                <p className="text-sm font-bold text-[#FF3C42] text-center">{currentScenario.profit.toLocaleString()} M</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] font-bold text-gray-400 mb-0.5 uppercase tracking-wider text-center">예상 이익률</p>
                <p className="text-sm font-bold text-gray-900 text-center">{currentScenario.margin}%</p>
                </div>
            </div>
        </div>
        
        <div className="p-3 border border-blue-50 bg-blue-50/30 rounded-lg flex items-start gap-2">
          <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
            환율 <strong>{japanDrill.context}원</strong> 적용 시 영업이익은 <strong>{currentScenario.profit}백만 엔</strong>으로 전망됩니다. 
          </p>
        </div>
      </div>
    );
  };

  // ... (rest of the file remains same, ensure to keep Info component at end)
  
  // --- Render Logic ---

  if (showFullDashboard) {
    return (
      <div className="flex w-full h-full bg-[#F7F9FB] overflow-hidden animate-fade-in-up">
        {/* Main Dashboard Content - Task 2: Split Layout (Flex 1) */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
            <div className="max-w-7xl mx-auto w-full">
                
                {/* Tab Navigation for Dashboard Views */}
                <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-1 sticky top-0 bg-[#F7F9FB] z-10 pt-2">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => {
                                if (isEditMode) handleCancelEdit();
                                setActiveDashboardTab('default');
                            }}
                            className={`px-4 py-2 text-sm font-bold transition-all relative ${activeDashboardTab === 'default' ? 'text-[#FF3C42]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Default Dashboard
                            {activeDashboardTab === 'default' && <div className="absolute bottom-[-5px] left-0 right-0 h-0.5 bg-[#FF3C42] rounded-full"></div>}
                        </button>
                        <button 
                            onClick={() => setActiveDashboardTab('custom')}
                            className={`px-4 py-2 text-sm font-bold transition-all relative ${activeDashboardTab === 'custom' ? 'text-[#FF3C42]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            My Dashboard
                            {activeDashboardTab === 'custom' && <div className="absolute bottom-[-5px] left-0 right-0 h-0.5 bg-[#FF3C42] rounded-full"></div>}
                        </button>
                    </div>

                    {/* Time Filter Dropdown (Added) */}
                    {activeDashboardTab === 'default' && (
                        <div className="relative">
                            <button 
                                onClick={() => setIsTimeFilterOpen(!isTimeFilterOpen)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                            >
                                <Calendar size={14} className="text-gray-500" />
                                <span>{timeFilter}</span>
                                <ChevronDown size={12} className="text-gray-400" />
                            </button>
                            
                            {isTimeFilterOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsTimeFilterOpen(false)}></div>
                                    <div className="absolute top-full right-0 mt-1 w-24 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 animate-fade-in-up">
                                        {timeOptions.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => {
                                                    setTimeFilter(option);
                                                    setIsTimeFilterOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${timeFilter === option ? 'text-[#FF3C42] bg-red-50' : 'text-gray-700'}`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Layout Editing Controls (Visible only in Custom Tab) */}
                    {activeDashboardTab === 'custom' && (
                        <div className="flex items-center gap-2">
                            {isEditMode ? (
                                <>
                                    <button 
                                        onClick={handleResetLayout}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="레이아웃 초기화"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                    <button 
                                        onClick={handleCancelEdit}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X size={14} /> 취소
                                    </button>
                                    <button 
                                        onClick={handleSaveLayout}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-black text-white hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <Check size={14} /> 저장
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={handleEditToggle}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-black hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
                                >
                                    <Edit2 size={14} /> 편집
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {activeDashboardTab === 'default' ? (
                    <>
                        {/* KPI Row - Consolidated into single flexible grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <KPICard title="현재가" value="₩8,250" change="+1.8%▲" trend="up" isStock subtitle="코나아이" />
                            <KPICard title="메탈 매출" value="₩42억" change="+13.5%" trend="up" icon={<CreditCard size={16}/>} />
                            <KPICard title="DID 수주" value="₩18억" change="-8.0%" trend="down" icon={<Cpu size={16}/>} />
                            <KPICard title="영업이익률" value="13.2%" change="+2.1%" trend="up" icon={<TrendingUp size={16}/>} />
                        </div>

                        {/* Main Charts Grid - Compact 2x2 Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                            {/* Row 1 */}
                            {renderMetalWidget()}
                            {renderJapanWidget()}
                            
                            {/* Row 2 - Now Side by Side */}
                            {renderClientWidget()}
                            {renderDIDAnalysisChart(true)}
                        </div>
                    </>
                ) : (
                    /* Custom Dashboard Renderer */
                    /* Task: Added p-3 to match Editor margin visually */
                    <div className={`min-h-[600px] relative p-3 transition-colors rounded-2xl ${isEditMode ? 'bg-gray-100/50 border-2 border-dashed border-gray-300' : ''}`}>
                        {customWidgets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-96 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
                                <LayoutDashboard size={48} className="mb-4 opacity-20" />
                                <p className="text-sm font-medium text-gray-500">저장된 대시보드가 없습니다.</p>
                                <p className="text-xs mt-1 text-gray-400">분석 화면에서 위젯을 고정하고 저장해주세요.</p>
                            </div>
                        ) : (
                            <ResponsiveGridLayout
                                className="layout"
                                layouts={{ lg: isEditMode ? editLayout : customLayout }}
                                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                                // Fix: Matches Editor's 12-column grid to ensure ratio consistency on desktop
                                cols={{ lg: 12, md: 12, sm: 12, xs: 4, xxs: 2 }}
                                rowHeight={30}
                                isDraggable={isEditMode}
                                isResizable={isEditMode}
                                // Fix: Inject custom resize handle to ensure high Z-index visibility above chart overlay
                                resizeHandle={<CustomResizeHandle />}
                                onLayoutChange={(layout: GridLayout) => {
                                    if (isEditMode) setEditLayout(layout);
                                }}
                                draggableHandle=".grid-drag-handle"
                                margin={[12, 12]}
                            >
                                {(isEditMode ? editLayout : customLayout).map((item) => {
                                    const widget = WIDGET_REGISTRY[item.i as WidgetId];
                                    return (
                                        <div key={item.i} className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-full transition-all ${isEditMode ? 'border-[#FF3C42] ring-1 ring-[#FF3C42] ring-opacity-50' : 'border-gray-200 hover:shadow-md'}`}>
                                            <div className={`h-8 flex items-center px-3 shrink-0 justify-between ${isEditMode ? 'bg-red-50 border-b border-red-100 cursor-move grid-drag-handle' : 'bg-gray-50 border-b border-gray-100'}`}>
                                                <span className={`text-[10px] font-bold uppercase flex items-center gap-1.5 ${isEditMode ? 'text-[#FF3C42]' : 'text-gray-500'}`}>
                                                     {isEditMode && <Move size={10} />}
                                                     {widget?.title}
                                                </span>
                                                {/* Issue 3 Fix: Widget Deletion Button Added Here */}
                                                {isEditMode && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent drag start
                                                            setEditLayout(editLayout.filter(l => l.i !== item.i));
                                                            // Also remove from widget list tracking if necessary, but editLayout drives the view in edit mode
                                                        }}
                                                        // Fix: Prevent drag on button click by stopping mouse down and touch start
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        onTouchStart={(e) => e.stopPropagation()}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-100"
                                                        title="위젯 삭제"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex-1 p-3 min-h-0 relative pointer-events-auto">
                                                {widget?.render()}
                                                {/* In edit mode, overlay transparent div to prevent chart interaction interference while dragging */}
                                                {isEditMode && <div className="absolute inset-0 z-10 bg-transparent"></div>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </ResponsiveGridLayout>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* ... (Right Agent Panel Logic if any) ... */}
      </div>
    );
  }

  // ... (Return for Scenario View remains same) ...
  return (
      <div className="flex w-full h-full bg-[#F7F9FB] overflow-hidden relative">
          {/* ... */}
      </div>
  );
};

const Info: React.FC<{ size?: number, className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export default LiveboardView;
