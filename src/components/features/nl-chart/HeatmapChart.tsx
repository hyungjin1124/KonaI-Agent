import React, { useMemo, useState } from 'react';
import { HeatmapDataPoint } from './types';

interface HeatmapChartProps {
  data: HeatmapDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
}

const CELL_SIZE = 56;
const LABEL_WIDTH = 60;
const LABEL_HEIGHT = 32;
const PADDING = 8;

function getColor(value: number, min: number, max: number): string {
  const ratio = max === min ? 0.5 : (value - min) / (max - min);
  // Blue (low) → Green (mid) → Red (high)
  if (ratio < 0.5) {
    const t = ratio * 2;
    const r = Math.round(59 + t * (16 - 59));
    const g = Math.round(130 + t * (185 - 130));
    const b = Math.round(246 + t * (129 - 246));
    return `rgb(${r},${g},${b})`;
  }
  const t = (ratio - 0.5) * 2;
  const r = Math.round(16 + t * (255 - 16));
  const g = Math.round(185 + t * (60 - 185));
  const b = Math.round(129 + t * (66 - 129));
  return `rgb(${r},${g},${b})`;
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({ data }) => {
  const [hoveredCell, setHoveredCell] = useState<{ x: string; y: string; value: number } | null>(null);

  const { xLabels, yLabels, min, max } = useMemo(() => {
    const xs = [...new Set(data.map((d) => d.x))];
    const ys = [...new Set(data.map((d) => d.y))];
    const values = data.map((d) => d.value);
    return {
      xLabels: xs,
      yLabels: ys,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [data]);

  const svgWidth = LABEL_WIDTH + xLabels.length * CELL_SIZE + PADDING * 2;
  const svgHeight = LABEL_HEIGHT + yLabels.length * CELL_SIZE + PADDING * 2 + 40; // +40 for legend

  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => map.set(`${d.x}-${d.y}`, d.value));
    return map;
  }, [data]);

  return (
    <div className="relative w-full h-full flex items-center justify-center" data-testid="heatmap-chart">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-full"
        style={{ maxWidth: svgWidth, maxHeight: svgHeight }}
      >
        {/* Y-axis labels */}
        {yLabels.map((label, yi) => (
          <text
            key={`y-${label}`}
            x={LABEL_WIDTH - 4}
            y={LABEL_HEIGHT + PADDING + yi * CELL_SIZE + CELL_SIZE / 2}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-gray-600"
            fontSize={11}
          >
            {label}
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map((label, xi) => (
          <text
            key={`x-${label}`}
            x={LABEL_WIDTH + PADDING + xi * CELL_SIZE + CELL_SIZE / 2}
            y={LABEL_HEIGHT - 4}
            textAnchor="middle"
            className="fill-gray-600"
            fontSize={11}
          >
            {label}
          </text>
        ))}

        {/* Cells */}
        {yLabels.map((yLabel, yi) =>
          xLabels.map((xLabel, xi) => {
            const value = dataMap.get(`${xLabel}-${yLabel}`) ?? 0;
            const isHovered = hoveredCell?.x === xLabel && hoveredCell?.y === yLabel;
            return (
              <g key={`${xLabel}-${yLabel}`}>
                <rect
                  x={LABEL_WIDTH + PADDING + xi * CELL_SIZE}
                  y={LABEL_HEIGHT + PADDING + yi * CELL_SIZE}
                  width={CELL_SIZE - 2}
                  height={CELL_SIZE - 2}
                  rx={4}
                  fill={getColor(value, min, max)}
                  opacity={isHovered ? 1 : 0.85}
                  stroke={isHovered ? '#1F2937' : 'transparent'}
                  strokeWidth={isHovered ? 2 : 0}
                  onMouseEnter={() => setHoveredCell({ x: xLabel, y: yLabel, value })}
                  onMouseLeave={() => setHoveredCell(null)}
                  style={{ cursor: 'pointer' }}
                />
                <text
                  x={LABEL_WIDTH + PADDING + xi * CELL_SIZE + (CELL_SIZE - 2) / 2}
                  y={LABEL_HEIGHT + PADDING + yi * CELL_SIZE + (CELL_SIZE - 2) / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={12}
                  fontWeight={600}
                  fill="#fff"
                  pointerEvents="none"
                >
                  {value}
                </text>
              </g>
            );
          })
        )}

        {/* Legend */}
        {(() => {
          const legendY = LABEL_HEIGHT + PADDING + yLabels.length * CELL_SIZE + 16;
          const legendWidth = 120;
          const legendX = LABEL_WIDTH + PADDING;
          return (
            <g>
              <defs>
                <linearGradient id="heatmap-legend-gradient">
                  <stop offset="0%" stopColor={getColor(min, min, max)} />
                  <stop offset="50%" stopColor={getColor((min + max) / 2, min, max)} />
                  <stop offset="100%" stopColor={getColor(max, min, max)} />
                </linearGradient>
              </defs>
              <rect x={legendX} y={legendY} width={legendWidth} height={10} rx={3} fill="url(#heatmap-legend-gradient)" />
              <text x={legendX} y={legendY + 22} fontSize={10} className="fill-gray-500">{min}</text>
              <text x={legendX + legendWidth} y={legendY + 22} fontSize={10} textAnchor="end" className="fill-gray-500">{max}</text>
            </g>
          );
        })()}
      </svg>

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none"
          style={{ top: 8, right: 8 }}
        >
          {hoveredCell.y} / {hoveredCell.x}: <span className="font-semibold">{hoveredCell.value}</span>
        </div>
      )}
    </div>
  );
};
