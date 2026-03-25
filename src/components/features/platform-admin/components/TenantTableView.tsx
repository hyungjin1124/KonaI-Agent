import React, { useState, useMemo } from 'react';
import { Badge } from '../../../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../ui/table';
import type { Tenant } from '../data/platformAdminTypes';

type SortKey = 'name' | 'healthScore' | 'errorRate' | 'tokenLimitUsage';
type SortDir = 'asc' | 'desc';

interface TenantTableViewProps {
  tenants: Tenant[];
  onSelect: (tenant: Tenant) => void;
}

const healthBadge = (score: number, level: string) => {
  const style = level === 'healthy'
    ? 'bg-green-100 text-green-700 border-green-200'
    : level === 'warning'
    ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-red-100 text-red-700 border-red-200';
  return <Badge variant="outline" className={`rounded-full font-bold text-xs ${style}`}>{score}</Badge>;
};

const statusBadge = (status: string) => {
  const style = status === 'Active'
    ? 'bg-green-100 text-green-700 border-green-200'
    : status === 'Trial'
    ? 'bg-amber-100 text-amber-700 border-amber-200'
    : status === 'Suspended'
    ? 'bg-red-100 text-red-700 border-red-200'
    : 'bg-gray-100 text-gray-500 border-gray-200';
  return <Badge variant="outline" className={`rounded-full font-medium text-xs ${style}`}>{status}</Badge>;
};

const dotColor = (level: string) =>
  level === 'healthy' ? 'bg-green-500' : level === 'warning' ? 'bg-amber-500' : 'bg-red-500';

const TenantTableView: React.FC<TenantTableViewProps> = ({ tenants, onSelect }) => {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedTenants = useMemo(() => {
    if (!sortKey) return tenants;
    return [...tenants].sort((a, b) => {
      let av: string | number, bv: string | number;
      if (sortKey === 'name') { av = a.name; bv = b.name; }
      else if (sortKey === 'healthScore') { av = a.healthScore; bv = b.healthScore; }
      else if (sortKey === 'errorRate') { av = a.metrics.errorRate; bv = b.metrics.errorRate; }
      else { av = a.metrics.tokenLimitUsage; bv = b.metrics.tokenLimitUsage; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tenants, sortKey, sortDir]);

  const SortIcon: React.FC<{ col: SortKey }> = ({ col }) => {
    if (sortKey !== col) return <span className="ml-0.5 text-gray-300">⬍</span>;
    return <span className="ml-0.5 text-indigo-500">{sortDir === 'asc' ? '▲' : '▼'}</span>;
  };

  const SortableHead: React.FC<{ col: SortKey; children: React.ReactNode }> = ({ col, children }) => (
    <TableHead
      className="text-xs font-medium text-gray-500 cursor-pointer select-none hover:text-gray-800 transition-colors"
      onClick={() => handleSort(col)}
    >
      {children}<SortIcon col={col} />
    </TableHead>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <SortableHead col="name">회사명</SortableHead>
            <SortableHead col="healthScore">헬스</SortableHead>
            <TableHead className="text-xs font-medium text-gray-500">요금제</TableHead>
            <TableHead className="text-xs font-medium text-gray-500">상태</TableHead>
            <SortableHead col="errorRate">에러율</SortableHead>
            <SortableHead col="tokenLimitUsage">한도 소진</SortableHead>
            <TableHead className="text-xs font-medium text-gray-500">API 키</TableHead>
            <TableHead className="text-xs font-medium text-gray-500">최근 접속</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTenants.map(t => (
            <TableRow key={t.id} onClick={() => onSelect(t)} className="cursor-pointer hover:bg-gray-50">
              <TableCell className="font-medium text-sm">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${dotColor(t.healthLevel)}`} />
                {t.name}
              </TableCell>
              <TableCell>{healthBadge(t.healthScore, t.healthLevel)}</TableCell>
              <TableCell className="text-sm">{t.plan}</TableCell>
              <TableCell>{statusBadge(t.status)}</TableCell>
              <TableCell className={`text-sm ${t.metrics.errorRate > 5 ? 'text-red-600' : t.metrics.errorRate > 2 ? 'text-amber-600' : ''}`}>
                {t.metrics.errorRate > 0 ? `${t.metrics.errorRate}%` : '—'}
              </TableCell>
              <TableCell className={`text-sm ${t.metrics.tokenLimitUsage >= 100 ? 'text-red-600' : t.metrics.tokenLimitUsage > 75 ? 'text-amber-600' : ''}`}>
                {t.metrics.tokenLimitUsage}%
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {t.apiKeys.filter(k => k.status === 'Active').length}개 활성
              </TableCell>
              <TableCell className="text-sm text-gray-500">{t.metrics.lastActivityAgo}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TenantTableView;
