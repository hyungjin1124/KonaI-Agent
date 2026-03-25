import React from 'react';
import { TrendingUp, TrendingDown, Minus, Users, BarChart3 } from 'lucide-react';
import { UsageStat, SkillCategory, SKILL_CATEGORIES } from '@/types/skill-management.types';
import EvalQualityBadge from './EvalQualityBadge';

interface SkillUsageStatsProps {
  stats: UsageStat[];
}

const TREND_ICON: Record<string, React.ReactNode> = {
  up: <TrendingUp size={12} className="text-green-500" />,
  down: <TrendingDown size={12} className="text-red-500" />,
  stable: <Minus size={12} className="text-gray-400" />,
};

const SkillUsageStats: React.FC<SkillUsageStatsProps> = ({ stats }) => {
  // Category distribution
  const categoryDist = stats.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});

  const totalUsers = stats.reduce((sum, s) => sum + s.activeUsers, 0);
  const totalInvocations = stats.reduce((sum, s) => sum + s.totalInvocations, 0);
  const avgPassRate = stats.filter((s) => s.avgPassRate !== null).length > 0
    ? stats.filter((s) => s.avgPassRate !== null).reduce((sum, s) => sum + (s.avgPassRate ?? 0), 0) /
      stats.filter((s) => s.avgPassRate !== null).length
    : null;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center">
          <Users size={18} className="mx-auto text-gray-400 mb-2" />
          <p className="text-xs text-gray-500 mb-1">총 활성 사용자</p>
          <p className="text-2xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center">
          <BarChart3 size={18} className="mx-auto text-gray-400 mb-2" />
          <p className="text-xs text-gray-500 mb-1">총 호출 수</p>
          <p className="text-2xl font-bold text-gray-900">{totalInvocations.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-center">
          <p className="text-xs text-gray-500 mb-1">평균 통과율</p>
          <div className="flex justify-center mt-1">
            <EvalQualityBadge passRate={avgPassRate} size="md" />
          </div>
        </div>
      </div>

      {/* Category distribution */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
          카테고리별 분포
        </h4>
        <div className="space-y-3">
          {SKILL_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
            const count = categoryDist[cat.id] || 0;
            const percentage = stats.length > 0 ? (count / stats.length) * 100 : 0;
            return (
              <div key={cat.id} className="flex items-center gap-3">
                <span className="text-sm w-24 shrink-0">{cat.emoji} {cat.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gray-900 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-12 text-right">{count}개</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top skills by usage */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            사용량 Top 스킬
          </h4>
        </div>
        <div className="divide-y divide-gray-100">
          {[...stats]
            .sort((a, b) => b.totalInvocations - a.totalInvocations)
            .slice(0, 10)
            .map((stat, i) => (
              <div key={stat.skillId} className="flex items-center gap-4 px-5 py-3">
                <span className="text-xs font-bold text-gray-400 w-6 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{stat.skillTitle}</p>
                  <p className="text-xs text-gray-400">{stat.activeUsers}명 사용 중</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <EvalQualityBadge passRate={stat.avgPassRate} />
                  {TREND_ICON[stat.trend]}
                  <span className="text-xs text-gray-500 w-16 text-right">
                    {stat.totalInvocations.toLocaleString()}회
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SkillUsageStats;
