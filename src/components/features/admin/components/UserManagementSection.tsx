'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { UserTable } from './UserTable';
import { UserSlidePanel } from './UserSlidePanel';
import { ADMIN_USERS, TEAM_LIST } from '../data/userMockData';
import type { AdminUser, SimpleUserRole } from '../types/admin.types';

interface UserManagementSectionProps {
  initialUserId?: string | null;
}

export function UserManagementSection({
  initialUserId,
}: UserManagementSectionProps) {
  const [users, setUsers] = useState<AdminUser[]>(ADMIN_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialUserId ?? null);

  const isPanelOpen = selectedUserId !== null;

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  const filteredUsers = useMemo(() => {
    let result = users;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }

    if (filterTeam !== 'all') {
      result = result.filter((u) => u.team === filterTeam);
    }

    if (filterRole !== 'all') {
      result = result.filter((u) => u.role === filterRole);
    }

    return result;
  }, [users, searchQuery, filterTeam, filterRole]);

  const handleRoleChange = useCallback((userId: string, newRole: SimpleUserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    );
  }, []);

  const handleRowClick = useCallback((userId: string) => {
    setSelectedUserId(userId);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedUserId(null);
  }, []);

  const activeFiltersCount = [filterTeam, filterRole].filter(
    (f) => f !== 'all',
  ).length;

  return (
    <div className="flex flex-col h-full">
      {/* Section Header */}
      <div className="shrink-0 flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">사용자 관리</h2>
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        {/* Filter bar */}
        <div className="shrink-0 space-y-3 mb-4">
          <p className="text-sm text-gray-500">
            <Users className="inline h-3.5 w-3.5 mr-1 text-gray-400" />
            등록된 사용자 {users.length}명
            {activeFiltersCount > 0 && (
              <span className="text-gray-400"> · 필터 적용 결과 {filteredUsers.length}명</span>
            )}
          </p>

          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 max-w-[280px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="이름 또는 이메일 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>

            <Select value={filterTeam} onValueChange={setFilterTeam}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="팀" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 팀</SelectItem>
                {TEAM_LIST.map((team) => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="h-8 w-[100px] text-xs">
                <SelectValue placeholder="역할" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 역할</SelectItem>
                <SelectItem value="일반">일반</SelectItem>
                <SelectItem value="관리자">관리자</SelectItem>
              </SelectContent>
            </Select>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-gray-700 h-8 px-2"
                onClick={() => {
                  setSearchQuery('');
                  setFilterTeam('all');
                  setFilterRole('all');
                }}
              >
                초기화
              </Button>
            )}
          </div>
        </div>

        {/* Table + Panel layout */}
        <div className="relative flex flex-1 min-h-0 overflow-hidden">
          <div
            className={[
              'flex flex-col min-h-0 overflow-hidden transition-all duration-300 ease-in-out',
              isPanelOpen ? 'w-[55%]' : 'w-full',
            ].join(' ')}
          >
            <div className="flex-1 overflow-y-auto">
              <UserTable
                users={filteredUsers}
                onRoleChange={handleRoleChange}
                onRowClick={handleRowClick}
                selectedUserId={selectedUserId}
                isPanelOpen={isPanelOpen}
              />
            </div>
          </div>

          <div
            className={[
              'shrink-0 border-l border-gray-200 bg-white overflow-hidden transition-all duration-300 ease-in-out',
              isPanelOpen
                ? 'w-[45%] opacity-100'
                : 'w-0 opacity-0 pointer-events-none',
            ].join(' ')}
          >
            {isPanelOpen && selectedUser && (
              <UserSlidePanel
                key={selectedUserId}
                user={selectedUser}
                onClose={handleClosePanel}
              />
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
