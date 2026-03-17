import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Briefcase, Edit2 } from '../../../icons';
import { useNotification } from '../../../../context/NotificationContext';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { TEAM_BUDGET_DATA } from '../usageMonitoringData';
import type { TeamBudget } from '../usageMonitoringData';

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

const IS_ADMIN = true; // Mock admin role check

export function TeamBudgetSection() {
  const { addAnomaly } = useNotification();
  const notifiedRef = useRef(false);
  const [teams, setTeams] = useState<TeamBudget[]>(TEAM_BUDGET_DATA);
  const [editTarget, setEditTarget] = useState<TeamBudget | null>(null);
  const [editBudgetUsd, setEditBudgetUsd] = useState(0);
  const [editTokenQuota, setEditTokenQuota] = useState(0);

  const openEditDialog = useCallback((team: TeamBudget) => {
    setEditTarget(team);
    setEditBudgetUsd(team.budgetUsd);
    setEditTokenQuota(team.monthlyTokenQuota);
  }, []);

  const handleSaveBudget = useCallback(() => {
    if (!editTarget) return;
    setTeams(prev =>
      prev.map(t =>
        t.id === editTarget.id
          ? { ...t, budgetUsd: editBudgetUsd, monthlyTokenQuota: editTokenQuota }
          : t,
      ),
    );
    setEditTarget(null);
  }, [editTarget, editBudgetUsd, editTokenQuota]);

  useEffect(() => {
    if (notifiedRef.current) return;
    const overBudgetTeams = teams.filter(
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
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 font-medium">Budget & Quotas</span>
          {IS_ADMIN && (
            <span className="text-[9px] bg-blue-50 text-blue-600 rounded px-1.5 py-0.5 font-bold">Admin</span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {teams.map((team) => {
          const percent = getUsagePercent(team.currentUsage, team.monthlyTokenQuota);
          const barColor = getBarColor(percent);
          const barBg = getBarBg(percent);

          return (
            <div key={team.id} data-testid={`team-budget-${team.id}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">{team.name}</span>
                  <span className="text-[10px] text-gray-400">{team.memberCount}명</span>
                  {IS_ADMIN && (
                    <button
                      onClick={() => openEditDialog(team)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title={`${team.name} 예산 편집`}
                      aria-label={`${team.name} 예산 편집`}
                      data-testid={`edit-budget-${team.id}`}
                    >
                      <Edit2 size={11} />
                    </button>
                  )}
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

      {/* Budget Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-[380px]" data-testid="budget-edit-dialog">
          <DialogHeader>
            <DialogTitle>{editTarget?.name} 팀 예산 편집</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">월간 예산 (USD)</Label>
              <Input
                type="number"
                value={editBudgetUsd}
                onChange={e => setEditBudgetUsd(Number(e.target.value))}
                min={0}
                data-testid="edit-budget-usd"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">월간 토큰 할당량</Label>
              <Input
                type="number"
                value={editTokenQuota}
                onChange={e => setEditTokenQuota(Number(e.target.value))}
                min={0}
                step={100000}
                data-testid="edit-token-quota"
              />
              <div className="text-[10px] text-gray-400">{formatTokens(editTokenQuota)} tokens</div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditTarget(null)}>
                취소
              </Button>
              <Button
                size="sm"
                className="bg-[#1A1A1A] hover:bg-black text-white"
                onClick={handleSaveBudget}
                data-testid="save-budget-button"
              >
                저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
