import React from 'react';

interface TriggerAccuracyChartProps {
  iterations: { iteration: number; accuracy: number }[];
}

const CHART_WIDTH = 280;
const CHART_HEIGHT = 120;
const PADDING = { top: 10, right: 20, bottom: 25, left: 35 };

const TriggerAccuracyChart: React.FC<TriggerAccuracyChartProps> = ({ iterations }) => {
  if (iterations.length === 0) return null;

  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const maxAcc = 1;
  const minAcc = 0;

  const getX = (i: number) =>
    PADDING.left + (i / Math.max(iterations.length - 1, 1)) * innerWidth;
  const getY = (acc: number) =>
    PADDING.top + (1 - (acc - minAcc) / (maxAcc - minAcc)) * innerHeight;

  const pathD = iterations
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.accuracy)}`)
    .join(' ');

  return (
    <div>
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
        정확도 추이
      </h4>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="w-full"
          style={{ maxWidth: CHART_WIDTH }}
        >
          {/* Y-axis gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <g key={v}>
              <line
                x1={PADDING.left}
                y1={getY(v)}
                x2={CHART_WIDTH - PADDING.right}
                y2={getY(v)}
                stroke="#f3f4f6"
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 5}
                y={getY(v) + 3}
                textAnchor="end"
                className="text-[8px] fill-gray-400"
              >
                {Math.round(v * 100)}%
              </text>
            </g>
          ))}

          {/* Line */}
          <path d={pathD} fill="none" stroke="#1a1a1a" strokeWidth={2} />

          {/* Dots */}
          {iterations.map((p, i) => (
            <g key={p.iteration}>
              <circle
                cx={getX(i)}
                cy={getY(p.accuracy)}
                r={4}
                fill="white"
                stroke="#1a1a1a"
                strokeWidth={2}
              />
              {/* Value label */}
              <text
                x={getX(i)}
                y={getY(p.accuracy) - 8}
                textAnchor="middle"
                className="text-[8px] fill-gray-600 font-medium"
              >
                {Math.round(p.accuracy * 100)}%
              </text>
              {/* X-axis label */}
              <text
                x={getX(i)}
                y={CHART_HEIGHT - 5}
                textAnchor="middle"
                className="text-[8px] fill-gray-400"
              >
                #{p.iteration}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default TriggerAccuracyChart;
