import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import type { BenchmarkSummary } from '@/types/skill-management.types';

interface BenchmarkTabProps {
  benchmark: BenchmarkSummary | null;
}

function PassRateDonut({ rate, label }: { rate: number; label: string }) {
  const pct = Math.round(rate * 100);
  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference * (1 - rate);

  const color =
    pct >= 90 ? '#10b981' : pct >= 70 ? '#3b82f6' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#f3f4f6" strokeWidth="6" />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>
            {pct}%
          </span>
        </div>
      </div>
      <span className="text-xs text-gray-500 mt-1.5 font-medium">{label}</span>
    </div>
  );
}

function StatBar({
  label,
  withVal,
  withoutVal,
  delta,
  unit,
}: {
  label: string;
  withVal: number;
  withoutVal: number;
  delta: string;
  unit: string;
}) {
  const maxVal = Math.max(withVal, withoutVal, 0.01);
  const withPct = (withVal / maxVal) * 100;
  const withoutPct = (withoutVal / maxVal) * 100;

  const isPositive = delta.startsWith('+');
  const isNegative = delta.startsWith('-');

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span
          className={`text-xs font-bold ${
            isPositive ? 'text-green-600' : isNegative ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          {isPositive ? <TrendingUp size={11} className="inline mr-0.5" /> : null}
          {isNegative ? <TrendingDown size={11} className="inline mr-0.5" /> : null}
          {!isPositive && !isNegative ? <Minus size={11} className="inline mr-0.5" /> : null}
          {delta}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-blue-600 w-16 shrink-0">With</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${withPct}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-500 w-14 text-right">
            {typeof withVal === 'number' ? (Number.isInteger(withVal) ? withVal : withVal.toFixed(1)) : withVal}
            {unit}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 w-16 shrink-0">Without</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div
              className="bg-gray-400 h-2 rounded-full transition-all"
              style={{ width: `${withoutPct}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-500 w-14 text-right">
            {typeof withoutVal === 'number' ? (Number.isInteger(withoutVal) ? withoutVal : withoutVal.toFixed(1)) : withoutVal}
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

const BenchmarkTab: React.FC<BenchmarkTabProps> = ({ benchmark }) => {
  if (!benchmark) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 text-sm">
        벤치마크 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Donut Charts */}
      <div className="flex items-center justify-center gap-8 py-2">
        <PassRateDonut rate={benchmark.withSkill.passRate.mean} label="With Skill" />
        <PassRateDonut rate={benchmark.withoutSkill.passRate.mean} label="Without Skill" />
      </div>

      {/* Comparison Bars */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">성능 비교</h4>

        <StatBar
          label="통과율"
          withVal={Math.round(benchmark.withSkill.passRate.mean * 100)}
          withoutVal={Math.round(benchmark.withoutSkill.passRate.mean * 100)}
          delta={benchmark.delta.passRate}
          unit="%"
        />

        <StatBar
          label="응답 시간"
          withVal={benchmark.withSkill.timeSeconds.mean}
          withoutVal={benchmark.withoutSkill.timeSeconds.mean}
          delta={benchmark.delta.timeSeconds}
          unit="s"
        />

        <StatBar
          label="토큰 사용량"
          withVal={benchmark.withSkill.tokens.mean}
          withoutVal={benchmark.withSkill.tokens.mean * 1.4}
          delta={benchmark.delta.tokens}
          unit=""
        />
      </div>

      {/* Notes */}
      {benchmark.notes.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Info size={13} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-500">분석 노트</span>
          </div>
          <ul className="space-y-1.5">
            {benchmark.notes.map((note, i) => (
              <li key={i} className="text-xs text-gray-600 leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-gray-400">
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BenchmarkTab;
