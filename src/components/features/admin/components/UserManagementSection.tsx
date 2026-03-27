'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserTable } from './UserTable';
import { MemberDirectoryModal } from './MemberDirectoryModal';
import { ADMIN_USERS, TEAM_LIST } from '../data/userMockData';
import type { AdminUser, SimpleUserRole, SimpleUserStatus, DirectoryMember } from '../types/admin.types';

// ── Component ─────────────────────────────────────────────────────────────────

export function UserManagementSection() {
  // State
  const [users, setUsers] = useState<AdminUser[]>(ADMIN_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filtered users
  const filteredUsers = useMemo(() => {
    let result = users;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }

    // Team filter
    if (filterTeam !== 'all') {
      result = result.filter((u) => u.team === filterTeam);
    }

    // Role filter
    if (filterRole !== 'all') {
      result = result.filter((u) => u.role === filterRole);
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter((u) => u.status === filterStatus);
    }

    return result;
  }, [users, searchQuery, filterTeam, filterRole, filterStatus]);

  // Handlers
  const handleRoleChange = useCallback((userId: string, newRole: SimpleUserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    );
  }, []);

  const handleStatusToggle = useCallback((userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: (u.status === '활성' ? '비활성' : '활성') as SimpleUserStatus }
          : u,
      ),
    );
  }, []);

  const handleAddMembers = useCallback((members: DirectoryMember[], role: SimpleUserRole) => {
    const avatarColors = [
      '#FF3C42', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B',
      '#14B8A6', '#EC4899', '#F43F5E', '#6366F1', '#0EA5E9',
    ];

    const newUsers: AdminUser[] = members.map((m, i) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      team: m.team,
      role,
      status: '활성' as SimpleUserStatus,
      lastActivityDate: '-',
      avatarColor: avatarColors[i % avatarColors.length],
    }));

    setUsers((prev) => [...prev, ...newUsers]);
  }, []);

  // Active filters count
  const activeFiltersCount = [filterTeam, filterRole, filterStatus].filter(
    (f) => f !== 'all',
  ).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">사용자 관리</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            등록된 사용자 {users.length}명
            {activeFiltersCount > 0 && (
              <span className="text-gray-400"> · 필터 적용 결과 {filteredUsers.length}명</span>
            )}
          </p>
        </div>
        <Button
          size="sm"
          className="bg-[#FF3C42] hover:bg-[#e63539] text-white gap-1.5"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          사용자 추가
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1 max-w-[280px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="이름 또는 이메일 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        {/* Team filter */}
        <Select value={filterTeam} onValueChange={setFilterTeam}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="팀" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 팀</SelectItem>
            {TEAM_LIST.map((team) => (
              <SelectItem key={team} value={team}>
                {team}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Role filter */}
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

        {/* Status filter */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 w-[100px] text-xs">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            <SelectItem value="활성">활성</SelectItem>
            <SelectItem value="비활성">비활성</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500 hover:text-gray-700 h-8 px-2"
            onClick={() => {
              setSearchQuery('');
              setFilterTeam('all');
              setFilterRole('all');
              setFilterStatus('all');
            }}
          >
            초기화
          </Button>
        )}
      </div>

      {/* Table */}
      <UserTable
        users={filteredUsers}
        onRoleChange={handleRoleChange}
        onStatusToggle={handleStatusToggle}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Add Member Modal */}
      <MemberDirectoryModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAdd={handleAddMembers}
      />
    </div>
  );
}
