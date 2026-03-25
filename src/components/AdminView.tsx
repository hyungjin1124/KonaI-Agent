'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Search, Plus, Filter, Edit2, Trash2, Eye, Upload, X,
  Shield, Users, Briefcase, Power, BarChart2, FileText, Sparkles,
  List, GitBranch, ArrowUpDown, ArrowUp, ArrowDown,
} from './icons';
import { UsageMonitoringView } from './features/usage-monitoring';
import { AuditLogView } from './features/audit-log';
import { AIQualitySummaryTab } from './features/ai-quality/AIQualitySummaryTab';
import { PermissionSettingsView } from './features/permission-settings';
import { UserFormModal, MOCK_ENHANCED_USERS as USER_MGMT_USERS } from './features/user-management';
import { BulkUserImportModal } from './features/user-management/components/BulkUserImportModal';
import { OrgChartView } from './features/user-management/components/OrgChartView';
import { UserAccessViewModal } from './features/user-management/components/UserAccessViewModal';
import { DomainRoleBadge } from './features/user-management/components/DomainRoleBadge';
import { EnhancedUser, DomainRole, UserStatus, DomainAccessMatrix } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ConfirmDialog } from './ui/confirm-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';

// --- Sub-Components ---

const UserStatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
  const styles = {
    'Active': 'bg-green-100 text-green-700 border-green-200',
    'Inactive': 'bg-gray-100 text-gray-500 border-gray-200',
    'Pending': 'bg-amber-100 text-amber-700 border-amber-200'
  };
  return (
    <Badge variant="outline" className={`rounded-full font-bold ${styles[status]}`}>
      {status}
    </Badge>
  );
};


// --- Main View ---

const ADMIN_TABS = ['users', 'permissions', 'usage', 'audit', 'ai-quality'] as const;
type AdminTab = typeof ADMIN_TABS[number];

const AdminView: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const rawTab = searchParams.get('tab');
  const activeTab: AdminTab = ADMIN_TABS.includes(rawTab as AdminTab) ? (rawTab as AdminTab) : 'users';
  const handleTabChange = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<EnhancedUser[]>(USER_MGMT_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EnhancedUser | null>(null);
  const [userViewMode, setUserViewMode] = useState<'list' | 'orgchart'>('list');
  const [accessViewUser, setAccessViewUser] = useState<EnhancedUser | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [statusToggleUserId, setStatusToggleUserId] = useState<string | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [currentAccessMatrix, setCurrentAccessMatrix] = useState<DomainAccessMatrix[] | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [userPage, setUserPage] = useState(0);
  const [sortField, setSortField] = useState<'name' | 'department' | 'lastLogin' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Unique departments & roles for filters
  const uniqueDepts = useMemo(() => [...new Set(users.map(u => u.department))].sort(), [users]);
  const uniqueRoles = useMemo(() => [...new Set(users.flatMap(u => u.roles))].sort(), [users]);

  const USERS_PER_PAGE = 20;

  // Filter users based on search + dropdown filters
  const filteredUsers = useMemo(() =>
    users.filter(user => {
      if (statusFilter !== 'ALL' && user.status !== statusFilter) return false;
      if (deptFilter !== 'ALL' && user.department !== deptFilter) return false;
      if (roleFilter !== 'ALL' && !user.roles.includes(roleFilter as DomainRole)) return false;
      const q = searchQuery.toLowerCase();
      if (q) {
        return (
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.department.toLowerCase().includes(q) ||
          (user.orgPath?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    }),
    [users, searchQuery, statusFilter, deptFilter, roleFilter],
  );

  const sortedUsers = useMemo(() => {
    if (!sortField) return filteredUsers;
    return [...filteredUsers].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name, 'ko');
      else if (sortField === 'department') cmp = a.department.localeCompare(b.department, 'ko');
      else if (sortField === 'lastLogin') cmp = (a.lastLogin ?? '').localeCompare(b.lastLogin ?? '');
      return sortDir === 'desc' ? -cmp : cmp;
    });
  }, [filteredUsers, sortField, sortDir]);

  const handleSort = useCallback((field: 'name' | 'department' | 'lastLogin') => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setUserPage(0);
  }, [sortField]);

  const hasActiveFilters = statusFilter !== 'ALL' || deptFilter !== 'ALL' || roleFilter !== 'ALL' || searchQuery !== '';

  const resetFilters = useCallback(() => {
    setStatusFilter('ALL');
    setDeptFilter('ALL');
    setRoleFilter('ALL');
    setSearchQuery('');
    setUserPage(0);
  }, []);

  const totalUserPages = Math.ceil(sortedUsers.length / USERS_PER_PAGE);
  const pagedUsers = sortedUsers.slice(userPage * USERS_PER_PAGE, (userPage + 1) * USERS_PER_PAGE);

  // Handlers
  const handleUserStatusToggle = useCallback((id: string) => {
    const user = users.find(u => u.id === id);
    if (user?.status === 'Active') {
      setStatusToggleUserId(id);
    } else {
      setUsers(prev => prev.map(u =>
        u.id === id ? { ...u, status: 'Active' } : u,
      ));
      showToast('사용자가 활성화되었습니다.');
    }
  }, [users, showToast]);

  const handleDeleteUser = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const handleEditUser = useCallback((user: EnhancedUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  }, []);

  const handleSaveUser = useCallback((savedUser: EnhancedUser) => {
    setUsers(prev => {
      const exists = prev.find(u => u.id === savedUser.id);
      if (exists) {
        showToast('사용자 정보가 수정되었습니다.');
        return prev.map(u => u.id === savedUser.id ? savedUser : u);
      }
      showToast('사용자가 추가되었습니다.');
      return [...prev, savedUser];
    });
  }, [showToast]);

  const handleBulkImport = useCallback((imported: EnhancedUser[]) => {
    setUsers(prev => [...prev, ...imported]);
    showToast(`${imported.length}명의 사용자가 일괄 등록되었습니다.`);
  }, [showToast]);

  // --- Render Functions ---

  const SortIcon = ({ field }: { field: 'name' | 'department' | 'lastLogin' }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-gray-300" />;
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  const renderUserTable = () => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
            <caption className="sr-only">사용자 목록</caption>
            <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <button onClick={() => handleSort('name')} className="inline-flex items-center gap-1 hover:text-gray-700" aria-label="사용자 이름 정렬">
                            사용자 (User) <SortIcon field="name" />
                        </button>
                    </TableHead>
                    <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <button onClick={() => handleSort('department')} className="inline-flex items-center gap-1 hover:text-gray-700" aria-label="부서 정렬">
                            부서 (Dept) <SortIcon field="department" />
                        </button>
                    </TableHead>
                    <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">직급</TableHead>
                    <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">권한 (Role)</TableHead>
                    <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">상태 (Status)</TableHead>
                    <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <button onClick={() => handleSort('lastLogin')} className="inline-flex items-center gap-1 hover:text-gray-700" aria-label="마지막 접속 정렬">
                            마지막 접속 <SortIcon field="lastLogin" />
                        </button>
                    </TableHead>
                    <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">관리</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedUsers.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={7} className="p-8 text-center">
                            <p className="text-gray-500 text-sm mb-3">검색 결과가 없습니다.</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
                                className="text-xs"
                            >
                                <Plus size={14} className="mr-1" /> 사용자 추가
                            </Button>
                        </TableCell>
                    </TableRow>
                )}
                {pagedUsers.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div aria-hidden="true" className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: user.avatarColor }}>
                                    {user.name[0]}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-[200px]" title={user.email}>{user.email}</div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Briefcase size={14} className="text-gray-400 shrink-0" aria-hidden="true" />
                                <span className="truncate max-w-[180px]" title={user.orgPath || user.department}>
                                  {user.orgPath || user.department}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                            {user.positionLevel && (
                              <Badge variant="outline" className={`rounded-full font-bold text-xs whitespace-nowrap ${
                                user.positionLevel === '임원'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : user.positionLevel === '관리자'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-gray-50 text-gray-600 border-gray-200'
                              }`}>
                                {user.positionLevel}
                              </Badge>
                            )}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map(role => (
                                <DomainRoleBadge key={role} role={role} />
                              ))}
                            </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                            <UserStatusBadge status={user.status} />
                        </TableCell>
                        <TableCell className="px-6 py-4 text-xs text-gray-500 font-mono">
                            {user.lastLogin}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-gray-500 hover:bg-gray-100"
                                    onClick={() => setAccessViewUser(user)}
                                    title="접근 가능 뷰 보기"
                                    aria-label="접근 가능 뷰 보기"
                                >
                                    <Eye size={14} aria-hidden="true" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-9 w-9 ${user.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}
                                    onClick={() => handleUserStatusToggle(user.id)}
                                    title={user.status === 'Active' ? '비활성화' : '활성화'}
                                    aria-label={user.status === 'Active' ? '비활성화' : '활성화'}
                                >
                                    <Power size={14} aria-hidden="true" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-blue-600 hover:bg-blue-50"
                                    onClick={() => handleEditUser(user)}
                                    title="수정"
                                    aria-label="수정"
                                >
                                    <Edit2 size={14} aria-hidden="true" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-red-600 hover:bg-red-50"
                                    onClick={() => handleDeleteUser(user.id)}
                                    title="삭제"
                                    aria-label="삭제"
                                >
                                    <Trash2 size={14} aria-hidden="true" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        <div className="flex items-center justify-between text-xs text-gray-500 px-4 py-2 border-t border-gray-100">
          <span>{sortedUsers.length === 0 ? '결과 없음' : `총 ${sortedUsers.length}건 중 ${userPage * USERS_PER_PAGE + 1}–${Math.min((userPage + 1) * USERS_PER_PAGE, sortedUsers.length)}`}</span>
          <nav aria-label="사용자 목록 페이지네이션" className="flex gap-1">
            <button disabled={userPage === 0} onClick={() => setUserPage(p => p - 1)} aria-label="이전 페이지" className="h-7 px-2 text-[11px] border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50">&larr; 이전</button>
            <button disabled={userPage >= totalUserPages - 1} onClick={() => setUserPage(p => p + 1)} aria-label="다음 페이지" className="h-7 px-2 text-[11px] border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50">다음 &rarr;</button>
          </nav>
        </div>
    </div>
  );

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} data-testid="admin-view" className="h-full flex flex-col bg-[#F7F9FB] animate-fade-in-up overflow-hidden">
      <a href="#admin-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:text-xs focus:bg-blue-600 focus:text-white focus:rounded">
        본문 바로가기
      </a>
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-gray-200 shrink-0">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="text-sm text-gray-500 mt-1">사용자 관리, 권한 설정, AI 사용량 모니터링을 관리합니다.</p>
          </div>
          <TabsList aria-label="관리자 메뉴" className="bg-gray-100 p-1 rounded-lg h-auto">
            <TabsTrigger value="users" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
                <Users size={16} aria-hidden="true" /> 사용자 관리
            </TabsTrigger>
            <TabsTrigger value="permissions" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
                <Shield size={16} aria-hidden="true" /> 권한 설정
            </TabsTrigger>
            <TabsTrigger value="usage" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
                <BarChart2 size={16} aria-hidden="true" /> 사용량
            </TabsTrigger>
            <TabsTrigger value="audit" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
                <FileText size={16} aria-hidden="true" /> 감사 로그
            </TabsTrigger>
            <TabsTrigger value="ai-quality" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
                <Sparkles size={16} aria-hidden="true" /> AI 품질 관리
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Main Content */}
      <main id="admin-content" className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto pb-10">
            <TabsContent value="users" className="mt-0">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {/* View Toggle */}
                        <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
                            <button
                                onClick={() => setUserViewMode('list')}
                                aria-pressed={userViewMode === 'list'}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                    userViewMode === 'list'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <List size={14} aria-hidden="true" /> 리스트
                            </button>
                            <button
                                onClick={() => setUserViewMode('orgchart')}
                                aria-pressed={userViewMode === 'orgchart'}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                    userViewMode === 'orgchart'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <GitBranch size={14} aria-hidden="true" /> 조직도
                            </button>
                        </div>
                        {userViewMode === 'list' && (
                            <>
                                <div className="relative w-56">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
                                    <Input
                                        type="search"
                                        aria-label="사용자 검색"
                                        placeholder="이름, 이메일, 부서 검색..."
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setUserPage(0); }}
                                        className="pl-10"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={e => { setStatusFilter(e.target.value); setUserPage(0); }}
                                    aria-label="상태 필터"
                                    className="h-9 text-xs border border-gray-200 rounded-md px-2 bg-white text-gray-700"
                                >
                                    <option value="ALL">전체 상태</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Pending">Pending</option>
                                </select>
                                <select
                                    value={deptFilter}
                                    onChange={e => { setDeptFilter(e.target.value); setUserPage(0); }}
                                    aria-label="부서 필터"
                                    className="h-9 text-xs border border-gray-200 rounded-md px-2 bg-white text-gray-700"
                                >
                                    <option value="ALL">전체 부서</option>
                                    {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <select
                                    value={roleFilter}
                                    onChange={e => { setRoleFilter(e.target.value); setUserPage(0); }}
                                    aria-label="역할 필터"
                                    className="h-9 text-xs border border-gray-200 rounded-md px-2 bg-white text-gray-700"
                                >
                                    <option value="ALL">전체 역할</option>
                                    {uniqueRoles.map(r => <option key={r} value={r}>{r.replace('ROLE_', '')}</option>)}
                                </select>
                                {hasActiveFilters && (
                                    <button
                                        onClick={resetFilters}
                                        className="h-9 px-2.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center gap-1"
                                        aria-label="필터 초기화"
                                    >
                                        <X size={13} aria-hidden="true" /> 초기화
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsBulkImportOpen(true)}
                            className="text-gray-700 border-gray-300"
                        >
                            <Upload size={16} className="mr-2" /> CSV 임포트
                        </Button>
                        <Button
                            onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
                            className="bg-[#1A1A1A] hover:bg-black text-white shadow-sm"
                        >
                            <Plus size={16} className="mr-2" /> 사용자 추가
                        </Button>
                    </div>
                </div>
                {userViewMode === 'list' ? (
                    renderUserTable()
                ) : (
                    <OrgChartView
                        users={users}
                        onEditUser={handleEditUser}
                        onDeleteUser={handleDeleteUser}
                    />
                )}
            </TabsContent>

            <TabsContent value="permissions" className="mt-0">
                <PermissionSettingsView onAccessMatrixChange={setCurrentAccessMatrix} />
            </TabsContent>

            <TabsContent value="usage" className="mt-0">
                <UsageMonitoringView />
            </TabsContent>

            <TabsContent value="audit" className="mt-0">
                <AuditLogView />
            </TabsContent>

            <TabsContent value="ai-quality" className="mt-0">
                <AIQualitySummaryTab />
            </TabsContent>

        </div>
      </main>

      {/* User Form Modal (3-step wizard) */}
      <UserFormModal
        open={isModalOpen}
        user={editingUser}
        existingEmails={users.map(u => u.email)}
        onSave={handleSaveUser}
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
      />

      {/* User Access View Modal */}
      <UserAccessViewModal
        user={accessViewUser}
        open={!!accessViewUser}
        onClose={() => setAccessViewUser(null)}
        accessMatrix={currentAccessMatrix}
        onNavigateToPermissions={() => handleTabChange('permissions')}
      />

      {/* Bulk User Import Modal */}
      <BulkUserImportModal
        open={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={handleBulkImport}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteConfirmId}
        title="사용자 삭제"
        description="정말로 이 사용자를 삭제하시겠습니까?"
        confirmLabel="삭제"
        destructive
        onConfirm={() => {
          if (deleteConfirmId) {
            setUsers(prev => prev.filter(u => u.id !== deleteConfirmId));
            showToast('사용자가 삭제되었습니다.', 'error');
          }
          setDeleteConfirmId(null);
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Status Toggle Confirm Dialog */}
      <ConfirmDialog
        open={!!statusToggleUserId}
        title="사용자 비활성화"
        description="이 사용자를 비활성화하시겠습니까? 비활성화된 사용자는 시스템에 로그인할 수 없습니다."
        confirmLabel="비활성화"
        destructive
        onConfirm={() => {
          if (statusToggleUserId) {
            setUsers(prev => prev.map(u =>
              u.id === statusToggleUserId ? { ...u, status: 'Inactive' as const } : u,
            ));
            showToast('사용자가 비활성화되었습니다.', 'info');
          }
          setStatusToggleUserId(null);
        }}
        onCancel={() => setStatusToggleUserId(null)}
      />

      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 text-white text-sm rounded-lg shadow-lg animate-fade-in-up ${
            toast.type === 'success' ? 'bg-green-600' :
            toast.type === 'error' ? 'bg-red-600' :
            'bg-gray-700'
          }`}
        >
          <span>{toast.msg}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-1 text-white/70 hover:text-white"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      )}
    </Tabs>
  );
};

export default AdminView;
