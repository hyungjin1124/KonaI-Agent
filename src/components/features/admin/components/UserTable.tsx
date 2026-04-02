'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Users, Shield } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AdminUser, SimpleUserRole } from '../types/admin.types';
import { CURRENT_ADMIN_USER_ID } from '../data/userMockData';
import { ERP_GROUPS } from '../data/groupMockData';

// ── Types ─────────────────────────────────────────────────────────────────────

type SortField = 'name' | 'team' | 'lastActivityDate';
type SortDirection = 'asc' | 'desc';

interface UserTableProps {
  users: AdminUser[];
  onRoleChange: (userId: string, newRole: SimpleUserRole) => void;
  onRowClick?: (userId: string) => void;
  selectedUserId?: string | null;
  isPanelOpen?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseDateForSort(d: string): number {
  if (!d || d === '-') return 0;
  const cleaned = d.replace(/\./g, '-');
  return new Date(cleaned).getTime() || 0;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function UserTable({ users, onRoleChange, onRowClick, selectedUserId, isPanelOpen }: UserTableProps) {
  const [sortField, setSortField] = useState<SortField>('lastActivityDate');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const adminCount = useMemo(
    () => users.filter((u) => u.role === '관리자').length,
    [users],
  );

  // userId → 소속 ERP 그룹명 목록 사전 계산
  const userGroupsMap = useMemo<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    for (const group of ERP_GROUPS) {
      for (const member of group.members) {
        if (!map[member.userId]) map[member.userId] = [];
        map[member.userId].push(group.name);
      }
    }
    return map;
  }, []);

  const sorted = useMemo(() => {
    const copy = [...users];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') {
        cmp = a.name.localeCompare(b.name, 'ko');
      } else if (sortField === 'team') {
        cmp = a.team.localeCompare(b.team, 'ko');
      } else {
        cmp = parseDateForSort(a.lastActivityDate) - parseDateForSort(b.lastActivityDate);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [users, sortField, sortDir]);

  const toggleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return field;
      }
      setSortDir(field === 'lastActivityDate' ? 'desc' : 'asc');
      return field;
    });
  }, []);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />;
    return sortDir === 'asc'
      ? <ArrowUp className="h-3.5 w-3.5 text-gray-700" />
      : <ArrowDown className="h-3.5 w-3.5 text-gray-700" />;
  };

  // ── Empty state ───────────────────────────────────────────────────────────
  if (users.length <= 1) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-full bg-gray-100 p-4 mb-4">
          <Users className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-700 mb-1">
          ERP 사용자가 자동으로 동기화됩니다
        </p>
        <p className="text-xs text-gray-500">
          사용자 목록이 곧 표시됩니다
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
            <TableHead className="w-[180px]">
              <button
                onClick={() => toggleSort('name')}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900 transition-colors"
              >
                이름 <SortIcon field="name" />
              </button>
            </TableHead>
            <TableHead className="w-[140px]">
              <button
                onClick={() => toggleSort('team')}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900 transition-colors"
              >
                팀 <SortIcon field="team" />
              </button>
            </TableHead>
            {!isPanelOpen && (
            <TableHead className="w-[200px]">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                이메일
              </span>
            </TableHead>
            )}
            {!isPanelOpen && (
            <TableHead className="w-[180px]">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                권한 그룹
              </span>
            </TableHead>
            )}
            <TableHead className="w-[120px]">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                역할
              </span>
            </TableHead>
            <TableHead className="w-[120px]">
              <button
                onClick={() => toggleSort('lastActivityDate')}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-gray-900 transition-colors"
              >
                최근 활동일 <SortIcon field="lastActivityDate" />
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sorted.map((user) => {
            const isLastAdmin = user.role === '관리자' && adminCount <= 1;
            const isSelf = user.id === CURRENT_ADMIN_USER_ID;
            const canChangeRole = !(isSelf && isLastAdmin);

            return (
              <TableRow
                key={user.id}
                className={[
                  'group/row transition-colors',
                  onRowClick ? 'cursor-pointer' : '',
                  selectedUserId === user.id
                    ? 'bg-red-50/60 border-l-2 border-l-[#FF3C42]'
                    : 'hover:bg-gray-50/60',
                ].join(' ')}
                onClick={() => onRowClick?.(user.id)}
              >
                {/* 이름 */}
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                      style={{ backgroundColor: user.avatarColor || '#94A3B8' }}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </span>
                    {isSelf && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-gray-300 text-gray-500 font-normal"
                      >
                        나
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* 팀 */}
                <TableCell className="text-sm text-gray-600 truncate">
                  {user.team}
                </TableCell>

                {/* 이메일 */}
                {!isPanelOpen && (
                <TableCell className="text-sm text-gray-500 truncate font-mono text-[13px]">
                  {user.email}
                </TableCell>
                )}

                {/* 권한 그룹 */}
                {!isPanelOpen && (
                <TableCell>
                  {(() => {
                    const groups = userGroupsMap[user.id] ?? [];
                    if (groups.length === 0) {
                      return <span className="text-xs text-gray-400">—</span>;
                    }
                    const visible = groups.slice(0, 2);
                    const extra = groups.length - 2;
                    return (
                      <div className="flex flex-wrap gap-1 items-center">
                        {visible.map((g) => (
                          <Badge
                            key={g}
                            variant="outline"
                            className="text-[10px] font-normal border-violet-200 text-violet-700 py-0"
                          >
                            {g}
                          </Badge>
                        ))}
                        {extra > 0 && (
                          <span className="text-[11px] text-gray-400">+{extra}</span>
                        )}
                      </div>
                    );
                  })()}
                </TableCell>
                )}

                {/* 역할 — 인라인 Select */}
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(val) => {
                      if (!canChangeRole) return;
                      onRoleChange(user.id, val as SimpleUserRole);
                    }}
                    disabled={!canChangeRole}
                  >
                    <SelectTrigger
                      className={[
                        'h-7 w-[90px] text-xs border-transparent bg-transparent shadow-none',
                        'hover:border-gray-300 hover:bg-white focus:ring-1',
                        user.role === '관리자'
                          ? 'text-[#FF3C42] font-semibold'
                          : 'text-gray-600',
                        !canChangeRole && 'opacity-60 cursor-not-allowed',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-1">
                        {user.role === '관리자' && <Shield className="h-3 w-3" />}
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="일반">일반</SelectItem>
                      <SelectItem value="관리자">관리자</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>

                {/* 최근 활동일 */}
                <TableCell className="text-sm text-gray-500 tabular-nums">
                  {user.lastActivityDate}
                </TableCell>

              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
