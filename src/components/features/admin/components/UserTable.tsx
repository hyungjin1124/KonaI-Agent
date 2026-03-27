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
import { UserActionMenu } from './UserActionMenu';
import type { AdminUser, SimpleUserRole } from '../types/admin.types';
import { CURRENT_ADMIN_USER_ID } from '../data/userMockData';

// ── Types ─────────────────────────────────────────────────────────────────────

type SortField = 'name' | 'team' | 'lastActivityDate';
type SortDirection = 'asc' | 'desc';

interface UserTableProps {
  users: AdminUser[];
  onRoleChange: (userId: string, newRole: SimpleUserRole) => void;
  onStatusToggle: (userId: string) => void;
  onOpenAddModal: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseDateForSort(d: string): number {
  if (!d || d === '-') return 0;
  const cleaned = d.replace(/\./g, '-');
  return new Date(cleaned).getTime() || 0;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function UserTable({ users, onRoleChange, onStatusToggle, onOpenAddModal }: UserTableProps) {
  const [sortField, setSortField] = useState<SortField>('lastActivityDate');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const adminCount = useMemo(
    () => users.filter((u) => u.role === '관리자').length,
    [users],
  );

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
          팀원을 추가하여 함께 사용해보세요
        </p>
        <p className="text-xs text-gray-500 mb-4">
          멤버 디렉토리에서 팀원을 선택하여 추가할 수 있습니다.
        </p>
        <Button
          size="sm"
          className="bg-[#FF3C42] hover:bg-[#e63539] text-white"
          onClick={onOpenAddModal}
        >
          사용자 추가
        </Button>
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
            <TableHead className="w-[200px]">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                이메일
              </span>
            </TableHead>
            <TableHead className="w-[120px]">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                역할
              </span>
            </TableHead>
            <TableHead className="w-[80px]">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                상태
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
            <TableHead className="w-[44px]" />
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
                className="group/row hover:bg-gray-50/60 transition-colors"
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
                <TableCell className="text-sm text-gray-500 truncate font-mono text-[13px]">
                  {user.email}
                </TableCell>

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

                {/* 상태 */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={[
                      'rounded-full text-[11px] font-medium px-2 py-0.5',
                      user.status === '활성'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-500 border-gray-200',
                    ].join(' ')}
                  >
                    {user.status}
                  </Badge>
                </TableCell>

                {/* 최근 활동일 */}
                <TableCell className="text-sm text-gray-500 tabular-nums">
                  {user.lastActivityDate}
                </TableCell>

                {/* 액션 메뉴 */}
                <TableCell className="px-1">
                  {!isSelf && (
                    <UserActionMenu
                      status={user.status}
                      userName={user.name}
                      onToggleStatus={() => onStatusToggle(user.id)}
                    />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
