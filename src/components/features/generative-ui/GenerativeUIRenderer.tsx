import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type {
  GenerativeUIRendererProps,
  GenerativeUISpec,
  ChartDataSpec,
  KPIDataSpec,
  StatGridDataSpec,
  TableDataSpec,
} from './types';
import { parseGenerativeUISpec } from './parseGenerativeUI';
import { GenerativeUIFallback } from './GenerativeUIFallback';

const PIE_COLORS = ['#FF3C42', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export const GenerativeUIRenderer: React.FC<GenerativeUIRendererProps> = ({
  spec,
  onError,
  className = '',
  compact = false,
}) => {
  // Re-validate spec at render time
  const result = parseGenerativeUISpec(spec);
  if (!result.success) {
    onError?.(result.error);
    return <GenerativeUIFallback error={result.error} rawData={result.rawData} />;
  }

  const validSpec = result.spec;

  return (
    <div className={`flex flex-col h-full bg-white ${className}`} data-testid="generative-ui-renderer">
      {/* Header — compact 모드에서 축소 */}
      {(validSpec.title || validSpec.description) && (
        <div className={compact ? 'px-4 pt-3 pb-2 border-b border-gray-100' : 'px-6 pt-5 pb-3 border-b border-gray-100'}>
          {validSpec.title && (
            <h3 className={compact ? 'text-sm font-semibold text-gray-900' : 'text-base font-semibold text-gray-900'}>{validSpec.title}</h3>
          )}
          {validSpec.description && (
            <p className="text-xs text-gray-500 mt-1">{validSpec.description}</p>
          )}
        </div>
      )}

      {/* Content — compact 모드에서 padding 축소 */}
      <div className={`flex-1 min-h-0 ${compact ? 'p-3' : 'p-4'}`}>
        {renderComponent(validSpec)}
      </div>
    </div>
  );
};

function renderComponent(spec: GenerativeUISpec): React.ReactNode {
  switch (spec.type) {
    case 'bar-chart':
      return renderBarChart(spec.data as ChartDataSpec);
    case 'line-chart':
      return renderLineChart(spec.data as ChartDataSpec);
    case 'pie-chart':
      return renderPieChart(spec.data as ChartDataSpec);
    case 'area-chart':
      return renderAreaChart(spec.data as ChartDataSpec);
    case 'composed-chart':
      return renderComposedChart(spec.data as ChartDataSpec);
    case 'data-table':
      return renderDataTable(spec.data as TableDataSpec);
    case 'kpi-card':
      return renderKPICard(spec.data as KPIDataSpec);
    case 'stat-grid':
      return renderStatGrid(spec.data as StatGridDataSpec);
    default:
      return <GenerativeUIFallback error={`Unknown type: "${spec.type}"`} rawData={spec} />;
  }
}

// ─── Chart Renderers (Recharts 재활용) ───────────────────────────

function renderBarChart(data: ChartDataSpec) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={data.xAxisKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} label={data.yAxisLabel ? { value: data.yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
        <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        <Legend />
        {data.series.map((s) => (
          <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function renderLineChart(data: ChartDataSpec) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={data.xAxisKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} label={data.yAxisLabel ? { value: data.yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
        <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        <Legend />
        {data.series.map((s) => (
          <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function renderPieChart(data: ChartDataSpec) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data.data}
          dataKey={data.series[0]?.dataKey ?? 'value'}
          nameKey={data.xAxisKey}
          cx="50%"
          cy="50%"
          outerRadius="70%"
          label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={{ strokeWidth: 1 }}
        >
          {data.data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

function renderAreaChart(data: ChartDataSpec) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={data.xAxisKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        <Legend />
        {data.series.map((s) => (
          <Area key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color} fill={s.color} fillOpacity={0.2} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function renderComposedChart(data: ChartDataSpec) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data.data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={data.xAxisKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} label={data.yAxisLabel ? { value: data.yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
        <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        <Legend />
        {data.series.map((s) => {
          if (s.type === 'line') {
            return <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color} strokeWidth={2} dot={{ r: 4 }} />;
          }
          if (s.type === 'area') {
            return <Area key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color} fill={s.color} fillOpacity={0.2} />;
          }
          return <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} />;
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ─── KPI & Stat Renderers ────────────────────────────────────────

function renderKPICard(data: KPIDataSpec) {
  return (
    <div className="flex flex-col justify-between h-full" data-testid="generative-ui-kpi">
      <div className="flex justify-between items-start">
        <span className="text-xs text-gray-500">{data.label}</span>
        {data.change && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${
            data.change.direction === 'up'
              ? 'bg-red-50 text-[#FF3C42]'
              : 'bg-blue-50 text-blue-600'
          }`}>
            {data.change.direction === 'up'
              ? <ArrowUpRight size={10} />
              : <ArrowDownRight size={10} />}
            {data.change.value}%
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">
          {typeof data.value === 'number' ? data.value.toLocaleString() : data.value}
        </div>
        {data.subtitle && (
          <div className="text-[11px] text-gray-400">{data.subtitle}</div>
        )}
      </div>
    </div>
  );
}

function renderStatGrid(data: StatGridDataSpec) {
  const cols = data.items.length <= 2 ? 2 : data.items.length <= 4 ? 2 : 3;

  return (
    <div
      className={`grid gap-4 h-full`}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      data-testid="generative-ui-stat-grid"
    >
      {data.items.map((item, i) => (
        <div key={i} className="p-4 bg-gray-50 rounded-lg">
          {renderKPICard(item)}
        </div>
      ))}
    </div>
  );
}

// ─── Table Renderer ──────────────────────────────────────────────

function renderDataTable(data: TableDataSpec) {
  return (
    <div className="overflow-auto h-full" data-testid="generative-ui-table">
      <table className="w-full text-sm" role="table">
        <thead>
          <tr className="border-b border-gray-200">
            {data.columns.map((col) => (
              <th key={col.key} className="text-left py-2 px-3 font-medium text-gray-700">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
              {data.columns.map((col) => (
                <td key={col.key} className="py-2 px-3 text-gray-600">
                  {typeof row[col.key] === 'number'
                    ? (row[col.key] as number).toLocaleString()
                    : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
