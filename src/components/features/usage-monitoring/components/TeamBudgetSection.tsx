import React, { useEffect, useRef } from 'react';
import { Briefcase } from '../../../icons';
import { useNotification } from '../../../../context/NotificationContext';
import { TEAM_BUDGET_DATA } from '../usageMonitoringData';

function getUsagePercent(current: number, quota: number): number {
  return Math.round((current / quota) * 100);
}

function getBarColor(percent: number): string {
  if (percent >= 90) return 'bg-red-500';
  if (percent >= 75) return 'bg-amber-500';
  return 'bg-green-500';
}

function getBarBg(percent: number): string {
  if (percent >= 90) return 'bg-red-50';
  if (percent >= 75) return 'bg-amber-50';
  return 'bg-gray-100';
}

function formatTokens(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return String(value);
}

export function TeamBudgetSection() {
  const { addAnomaly } = useNotification();
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (notifiedRef.current) return;
    const overBudgetTeams = TEAM_BUDGET_DATA.filter(
      (t) => getUsagePercent(t.currentUsage, t.monthlyTokenQuota) >= 90
    );
    if (overBudgetTeams.length > 0) {
      notifiedRef.current = true;
      overBudgetTeams.forEach((team) => {
        const percent = getUsagePercent(team.currentUsage, team.monthlyTokenQuota);
        addAnomaly({
          id: `budget_alert_${team.id}_${Date.now()}`,
          type: 'warning',
          title: `${team.name} 팀 예산 ${percent}% 소진`,
          metric: 'Budget Alert',
          timestamp: '방금 전',
          description: `${team.name} 팀의 월간 토큰 할당량이 ${percent}%에 도달했습니다. 월간 예산: $${team.budgetUsd}, 사용: $${team.spentUsd}.`,
          isRead: false,
          contextData: {
            name: `${team.name} 예산 경보`,
            scenario: 'budget_alert',
            agentMessage: `${team.name} 팀의 AI 토큰 소비가 월간 할당량의 ${percent}%에 도달했습니다. 현재 추세가 지속되면 월말 전 예산을 초과할 수 있습니다.`,
          },
        });
      });
    }
  }, [addAnomaly]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-fade-in-up" data-testid="team-budget-section">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-gray-50 rounded-md text-gray-500">
            <Briefcase size={14} />
          </div>
          <span className="text-sm font-bold text-gray-900">팀별 예산 할당</span>
        </div>
        <span className="text-[10px] text-gray-400 font-medium">Budget & Quotas</span>
      </div>

      <div className="space-y-4">
        {TEAM_BUDGET_DATA.map((team) => {
          const percent = getUsagePercent(team.currentUsage, team.monthlyTokenQuota);
          const barColor = getBarColor(percent);
          const barBg = getBarBg(percent);

          return (
            <div key={team.id} data-testid={`team-budget-${team.id}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">{team.name}</span>
                  <span className="text-[10px] text-gray-400">{team.memberCount}명</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <span>{formatTokens(team.currentUsage)} / {formatTokens(team.monthlyTokenQuota)}</span>
                  <span className="font-bold">${team.spentUsd} / ${team.budgetUsd}</span>
                </div>
              </div>
              <div className={`w-full h-2 rounded-full ${barBg}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${team.name} 예산 사용률 ${percent}%`}
                />
              </div>
              <div className="flex justify-end mt-0.5">
                <span className={`text-[10px] font-bold ${
                  percent >= 90 ? 'text-red-500' : percent >= 75 ? 'text-amber-500' : 'text-gray-400'
                }`}>
                  {percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
