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
import { NLChartConfig, NLChartType, NLChartResult } from './types';
import { ChartTypeSelector } from './ChartTypeSelector';

const PIE_COLORS = ['#FF3C42', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

interface NLChartRendererProps {
  result: NLChartResult;
  onChangeChartType: (type: NLChartType) => void;
}

export const NLChartRenderer: React.FC<NLChartRendererProps> = ({
  result,
  onChangeChartType,
}) => {
  const { config, reasoning, alternatives } = result;

  return (
    <div className="flex flex-col h-full bg-white" data-testid="nl-chart-renderer">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">{config.title}</h3>
        <p className="text-xs text-gray-500 mt-1">{reasoning}</p>
      </div>

      {/* Chart Type Selector */}
      <div className="px-6 py-2 border-b border-gray-100">
        <ChartTypeSelector
          currentType={config.chartType}
          alternatives={alternatives}
          onSelect={onChangeChartType}
        />
      </div>

      {/* Chart */}
      <div className="flex-1 px-4 py-4 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart(config)}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

function renderChart(config: NLChartConfig): React.ReactElement {
  const { chartType, data, series, xAxisKey, xAxisLabel, yAxisLabel } = config;

  switch (chartType) {
    case 'bar':
      return (
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined} />
          <YAxis tick={{ fontSize: 12 }} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
          <Tooltip />
          <Legend />
          {series.map((s) => (
            <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      );

    case 'line':
      return (
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
          <Tooltip />
          <Legend />
          {series.map((s) => (
            <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          ))}
        </LineChart>
      );

    case 'pie':
      return (
        <PieChart>
          <Pie
            data={data}
            dataKey={series[0]?.dataKey ?? 'value'}
            nameKey={xAxisKey}
            cx="50%"
            cy="50%"
            outerRadius="70%"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={{ strokeWidth: 1 }}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      );

    case 'area':
      return (
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {series.map((s) => (
            <Area key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color} fill={s.color} fillOpacity={0.2} />
          ))}
        </AreaChart>
      );

    case 'composed':
      return (
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
          <Tooltip />
          <Legend />
          {series.map((s) => {
            if (s.type === 'line') {
              return <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color} strokeWidth={2} dot={{ r: 4 }} />;
            }
            return <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} />;
          })}
        </ComposedChart>
      );

    case 'table':
    default:
      return renderTable(config);
  }
}

function renderTable(config: NLChartConfig): React.ReactElement {
  const { data, series, xAxisKey } = config;
  const columns = [xAxisKey, ...series.map((s) => s.dataKey)];
  const headers = [config.xAxisLabel || xAxisKey, ...series.map((s) => s.name)];

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-sm" role="table">
        <thead>
          <tr className="border-b border-gray-200">
            {headers.map((h) => (
              <th key={h} className="text-left py-2 px-3 font-medium text-gray-700">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col} className="py-2 px-3 text-gray-600">
                  {typeof row[col] === 'number'
                    ? (row[col] as number).toLocaleString()
                    : row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) as unknown as React.ReactElement;
}
