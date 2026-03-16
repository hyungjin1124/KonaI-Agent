import React, { useState, useMemo } from 'react';
import { Users, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from '../../../icons';
import { USER_USAGE_DATA, TEAM_BUDGET_DATA } from '../usageMonitoringData';

const PAGE_SIZE = 5;

type SortField = 'totalTokens' | 'costUsd';
type SortDir = 'asc' | 'desc';

function formatTokens(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return String(value);
}

export function UserUsageTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('totalTokens');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const teams = useMemo(() => ['all', ...TEAM_BUDGET_DATA.map((t) => t.name)], []);

  const filtered = useMemo(() => {
    let data = [...USER_USAGE_DATA];
    if (teamFilter !== 'all') {
      data = data.filter((u) => u.team === teamFilter);
    }
    data.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDir === 'desc' ? -diff : diff;
    });
    return data;
  }, [teamFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  function handleTeamFilter(team: string) {
    setTeamFilter(team);
    setCurrentPage(1);
  }

  function SortIcon({ field }: { field: SortField }) {
    if (field !== sortField) return <ChevronDown size={12} className="text-gray-300" />;
    return sortDir === 'desc'
      ? <ChevronDown size={12} className="text-gray-700" />
      : <ChevronUp size={12} className="text-gray-700" />;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-fade-in-up" data-testid="user-usage-table">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-gray-50 rounded-md text-gray-500">
            <Users size={14} />
          </div>
          <span className="text-sm font-bold text-gray-900">사용자별 사용량</span>
        </div>
        <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg" role="group" aria-label="팀 필터">
          {teams.map((team) => (
            <button
              key={team}
              onClick={() => handleTeamFilter(team)}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                teamFilter === team
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-pressed={teamFilter === team}
            >
              {team === 'all' ? '전체' : team}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-2 text-xs font-bold text-gray-500">사용자</th>
              <th className="text-left py-2 px-2 text-xs font-bold text-gray-500">팀</th>
              <th
                className="text-right py-2 px-2 text-xs font-bold text-gray-500 cursor-pointer select-none"
                onClick={() => handleSort('totalTokens')}
              >
                <span className="inline-flex items-center gap-0.5">
                  토큰 <SortIcon field="totalTokens" />
                </span>
              </th>
              <th
                className="text-right py-2 px-2 text-xs font-bold text-gray-500 cursor-pointer select-none"
                onClick={() => handleSort('costUsd')}
              >
                <span className="inline-flex items-center gap-0.5">
                  비용 <SortIcon field="costUsd" />
                </span>
              </th>
              <th className="text-left py-2 px-2 text-xs font-bold text-gray-500">활성 에이전트</th>
              <th className="text-right py-2 px-2 text-xs font-bold text-gray-500">최근 활동</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-2 px-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-900">{user.name}</span>
                    <span className="text-[10px] text-gray-400">{user.email}</span>
                  </div>
                </td>
                <td className="py-2 px-2 text-xs text-gray-600">{user.team}</td>
                <td className="text-right py-2 px-2 text-xs text-gray-600">{formatTokens(user.totalTokens)}</td>
                <td className="text-right py-2 px-2 text-xs font-bold text-gray-900">${user.costUsd.toFixed(1)}</td>
                <td className="py-2 px-2">
                  <div className="flex gap-1 flex-wrap">
                    {user.activeAgents.map((agent) => (
                      <span key={agent} className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                        {agent}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="text-right py-2 px-2 text-[10px] text-gray-400">{user.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-[10px] text-gray-400">
            {filtered.length}명 중 {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="이전 페이지"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-gray-600 font-medium px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="다음 페이지"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
