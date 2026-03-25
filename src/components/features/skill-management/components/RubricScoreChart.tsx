import React from 'react';

interface RubricAxis {
  label: string;
  score: number; // 0~100
}

interface RubricScoreChartProps {
  versionA: { label: string; axes: RubricAxis[] };
  versionB: { label: string; axes: RubricAxis[] };
}

const CHART_SIZE = 200;
const CENTER = CHART_SIZE / 2;
const RADIUS = 70;
const LEVELS = 5;

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

const RubricScoreChart: React.FC<RubricScoreChartProps> = ({ versionA, versionB }) => {
  const axes = versionA.axes;
  const n = axes.length;
  if (n < 3) return null;

  const angleStep = 360 / n;

  // Grid lines
  const gridLevels = Array.from({ length: LEVELS }, (_, i) => ((i + 1) / LEVELS) * RADIUS);

  // Polygon points
  const getPolygonPoints = (scores: number[]) =>
    scores
      .map((score, i) => {
        const r = (score / 100) * RADIUS;
        const p = polarToCartesian(CENTER, CENTER, r, i * angleStep);
        return `${p.x},${p.y}`;
      })
      .join(' ');

  const pointsA = getPolygonPoints(versionA.axes.map((a) => a.score));
  const pointsB = getPolygonPoints(versionB.axes.map((a) => a.score));

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} className="w-full max-w-[240px]">
        {/* Grid */}
        {gridLevels.map((r) => (
          <polygon
            key={r}
            points={Array.from({ length: n }, (_, i) => {
              const p = polarToCartesian(CENTER, CENTER, r, i * angleStep);
              return `${p.x},${p.y}`;
            }).join(' ')}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        ))}

        {/* Axis lines + labels */}
        {axes.map((axis, i) => {
          const end = polarToCartesian(CENTER, CENTER, RADIUS + 5, i * angleStep);
          const labelPos = polarToCartesian(CENTER, CENTER, RADIUS + 18, i * angleStep);
          return (
            <g key={axis.label}>
              <line
                x1={CENTER}
                y1={CENTER}
                x2={end.x}
                y2={end.y}
                stroke="#d1d5db"
                strokeWidth={0.5}
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[8px] fill-gray-500"
              >
                {axis.label}
              </text>
            </g>
          );
        })}

        {/* Version B polygon (behind) */}
        <polygon
          points={pointsB}
          fill="rgba(156, 163, 175, 0.15)"
          stroke="#9ca3af"
          strokeWidth={1}
        />

        {/* Version A polygon (front) */}
        <polygon
          points={pointsA}
          fill="rgba(59, 130, 246, 0.15)"
          stroke="#3b82f6"
          strokeWidth={1.5}
        />

        {/* Dots */}
        {versionA.axes.map((axis, i) => {
          const r = (axis.score / 100) * RADIUS;
          const p = polarToCartesian(CENTER, CENTER, r, i * angleStep);
          return <circle key={`a-${i}`} cx={p.x} cy={p.y} r={2.5} fill="#3b82f6" />;
        })}
        {versionB.axes.map((axis, i) => {
          const r = (axis.score / 100) * RADIUS;
          const p = polarToCartesian(CENTER, CENTER, r, i * angleStep);
          return <circle key={`b-${i}`} cx={p.x} cy={p.y} r={2} fill="#9ca3af" />;
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500/30 border border-blue-500" />
          <span className="text-gray-600">{versionA.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gray-400/20 border border-gray-400" />
          <span className="text-gray-600">{versionB.label}</span>
        </div>
      </div>
    </div>
  );
};

export default RubricScoreChart;
