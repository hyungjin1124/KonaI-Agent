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
  Sankey,
  Treemap,
} from 'recharts';
import { NLChartConfig, NLChartType, NLChartResult, TreemapDataItem } from './types';
import { ChartTypeSelector } from './ChartTypeSelector';
import { HeatmapChart } from './HeatmapChart';

const PIE_COLORS = ['#FF3C42', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
const WATERFALL_POSITIVE = '#10B981';
const WATERFALL_NEGATIVE = '#EF4444';
const WATERFALL_TOTAL = '#3B82F6';

interface NLChartRendererProps {
  result: NLChartResult;
  onChangeChartType: (type: NLChartType) => void;
  compact?: boolean;
}

export const NLChartRenderer: React.FC<NLChartRendererProps> = ({
  result,
  onChangeChartType,
  compact = false,
}) => {
  const { config, reasoning, alternatives } = result;

  return (
    <div className="flex flex-col h-full bg-white" data-testid="nl-chart-renderer">
      {/* Header */}
      <div className={`px-6 ${compact ? 'pt-3 pb-2' : 'pt-5 pb-3'} border-b border-gray-100`}>
        <h3 className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-gray-900`}>{config.title}</h3>
        {!compact && <p className="text-xs text-gray-500 mt-1">{reasoning}</p>}
      </div>

      {/* Chart Type Selector */}
      {!compact && (
        <div className="px-6 py-2 border-b border-gray-100">
          <ChartTypeSelector
            currentType={config.chartType}
            alternatives={alternatives}
            onSelect={onChangeChartType}
          />
        </div>
      )}

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

    case 'sankey':
      return renderSankey(config);

    case 'treemap':
      return renderTreemap(config);

    case 'heatmap':
      return renderHeatmap(config);

    case 'waterfall':
      return renderWaterfall(config);

    case 'table':
    default:
      return renderTable(config);
  }
}

function renderSankey(config: NLChartConfig): React.ReactElement {
  const { sankeyData } = config;
  if (!sankeyData) return renderTable(config);

  return (
    <Sankey
      data={sankeyData}
      nodeWidth={12}
      nodePadding={24}
      linkCurvature={0.5}
      margin={{ top: 10, right: 40, left: 40, bottom: 10 }}
      link={{ stroke: '#94A3B8', strokeOpacity: 0.4 }}
    >
      <Tooltip />
    </Sankey>
  ) as unknown as React.ReactElement;
}

function renderTreemap(config: NLChartConfig): React.ReactElement {
  const { treemapData } = config;
  if (!treemapData) return renderTable(config);

  return (
    <Treemap
      data={treemapData}
      dataKey="size"
      aspectRatio={4 / 3}
      stroke="#fff"
      content={<TreemapContent />}
    >
      <Tooltip formatter={(value: number) => `${value.toLocaleString()}억원`} />
    </Treemap>
  ) as unknown as React.ReactElement;
}

interface TreemapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  color?: string;
  depth?: number;
  root?: TreemapDataItem;
}

const TreemapContent: React.FC<TreemapContentProps> = ({
  x = 0, y = 0, width = 0, height = 0, name = '', color, depth = 0,
}) => {
  if (width < 30 || height < 20) return null;

  const fill = color || PIE_COLORS[(depth ?? 0) % PIE_COLORS.length];

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
        rx={4}
        opacity={0.85}
      />
      {width > 50 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize={Math.min(12, width / 6)}
          fontWeight={600}
        >
          {name}
        </text>
      )}
    </g>
  );
};

function renderHeatmap(config: NLChartConfig): React.ReactElement {
  const { heatmapData, xAxisLabel, yAxisLabel } = config;
  if (!heatmapData) return renderTable(config);

  return (
    <HeatmapChart data={heatmapData} xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel} />
  ) as unknown as React.ReactElement;
}

function renderWaterfall(config: NLChartConfig): React.ReactElement {
  const { data, xAxisKey, xAxisLabel, yAxisLabel } = config;

  return (
    <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey={xAxisKey} tick={{ fontSize: 11 }} label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined} />
      <YAxis tick={{ fontSize: 12 }} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
      <Tooltip
        formatter={(value: number, name: string) => {
          if (name === 'base') return [null, ''];
          return [`${value > 0 ? '+' : ''}${value.toLocaleString()}억원`, '증감'];
        }}
      />
      <Bar dataKey="base" stackId="waterfall" fill="transparent" />
      <Bar dataKey="value" stackId="waterfall">
        {data.map((entry, index) => {
          const val = entry.value as number;
          const isFirst = index === 0;
          const isLast = index === data.length - 1;
          let fill = val >= 0 ? WATERFALL_POSITIVE : WATERFALL_NEGATIVE;
          if (isFirst || isLast) fill = WATERFALL_TOTAL;
          return <Cell key={`cell-${index}`} fill={fill} />;
        })}
      </Bar>
    </BarChart>
  );
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
