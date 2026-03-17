
import React, { useState, useCallback } from 'react';
import {
  Search, Plus, Filter, Edit2, Trash2,
  Shield, Users, Briefcase, Power, BarChart2, FileText, MessageSquare, Sparkles
} from './icons';
import { UsageMonitoringView } from './features/usage-monitoring';
import { AuditLogView } from './features/audit-log';
import { FeedbackQualityView } from './features/feedback-quality';
import { PromptManagementView } from './features/prompt-management';
import { PermissionSettingsView } from './features/permission-settings';
import { UserFormModal, MOCK_ENHANCED_USERS as USER_MGMT_USERS } from './features/user-management';
import { EnhancedUser, DomainRole, UserStatus } from '../types';
import { ROLE_LABEL_MAP } from './features/permission-settings/data/viewTableData';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
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

const DomainRoleBadge: React.FC<{ role: DomainRole }> = ({ role }) => {
    const label = ROLE_LABEL_MAP[role] ?? role;
    const isAdmin = role.includes('ADMIN') || role === 'ROLE_EXEC';
    const isMgr = role.includes('MGR');
    const style = isAdmin
      ? 'text-purple-600 bg-purple-50 border-purple-100'
      : isMgr
        ? 'text-blue-600 bg-blue-50 border-blue-100'
        : 'text-gray-600 bg-gray-50 border-gray-100';
    return (
        <Badge variant="outline" className={`font-medium text-xs ${style}`}>
            {isAdmin && <Shield size={10} className="mr-1" />}
            {label}
        </Badge>
    );
};

// --- Main View ---

const AdminView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<EnhancedUser[]>(USER_MGMT_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EnhancedUser | null>(null);

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const q = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.department.toLowerCase().includes(q) ||
      (user.orgPath?.toLowerCase().includes(q) ?? false)
    );
  });

  // Handlers
  const handleUserStatusToggle = (id: string) => {
    setUsers(users.map(u => {
        if (u.id === id) {
            return { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' };
        }
        return u;
    }));
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
        setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleEditUser = (user: EnhancedUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = useCallback((savedUser: EnhancedUser) => {
    setUsers(prev => {
      const exists = prev.find(u => u.id === savedUser.id);
      if (exists) {
        return prev.map(u => u.id === savedUser.id ? savedUser : u);
      }
      return [...prev, savedUser];
    });
  }, []);

  // --- Render Functions ---

  const renderUserTable = () => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">사용자 (User)</TableHead>
                    <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">부서 (Dept)</TableHead>
                    <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">직급</TableHead>
                    <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">권한 (Role)</TableHead>
                    <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">상태 (Status)</TableHead>
                    <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">마지막 접속</TableHead>
                    <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">관리</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: user.avatarColor }}>
                                    {user.name[0]}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Briefcase size={14} className="text-gray-400 shrink-0" />
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
                                    className={`h-7 w-7 ${user.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}
                                    onClick={() => handleUserStatusToggle(user.id)}
                                    title={user.status === 'Active' ? '비활성화' : '활성화'}
                                >
                                    <Power size={14} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                                    onClick={() => handleEditUser(user)}
                                    title="수정"
                                >
                                    <Edit2 size={14} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-600 hover:bg-red-50"
                                    onClick={() => handleDeleteUser(user.id)}
                                    title="삭제"
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">
                검색 결과가 없습니다.
            </div>
        )}
    </div>
  );

  return (
    <Tabs defaultValue="users" data-testid="admin-view" className="h-full flex flex-col bg-[#F7F9FB] animate-fade-in-up overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-gray-200 shrink-0">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">관리자 대시보드</h2>
            <p className="text-sm text-gray-500 mt-1">사용자 관리, 권한 설정, AI 사용량 모니터링을 관리합니다.</p>
          </div>
          <TabsList className="bg-gray-100 p-1 rounded-lg h-auto">
            <TabsTrigger value="users" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
                <Users size={16} /> 사용자 관리
            </TabsTrigger>
            <TabsTrigger value="permissions" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
                <Shield size={16} /> 권한 설정
            </TabsTrigger>
            <TabsTrigger value="usage" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
                <BarChart2 size={16} /> 사용량
            </TabsTrigger>
            <TabsTrigger value="audit" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
                <FileText size={16} /> 감사 로그
            </TabsTrigger>
            <TabsTrigger value="prompt-management" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
                <Sparkles size={16} /> 시스템 프롬프트
            </TabsTrigger>
            <TabsTrigger value="feedback-quality" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
                <MessageSquare size={16} /> 피드백 품질
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto pb-10">
            <TabsContent value="users" className="mt-0">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="relative w-80">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <Input
                            type="text"
                            placeholder="이름, 이메일, 부서 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Filter size={16} className="mr-2" /> 필터
                        </Button>
                        <Button
                            onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
                            className="bg-[#1A1A1A] hover:bg-black text-white shadow-sm"
                        >
                            <Plus size={16} className="mr-2" /> 사용자 추가
                        </Button>
                    </div>
                </div>
                {renderUserTable()}
            </TabsContent>

            <TabsContent value="permissions" className="mt-0">
                <PermissionSettingsView />
            </TabsContent>

            <TabsContent value="usage" className="mt-0">
                <UsageMonitoringView />
            </TabsContent>

            <TabsContent value="audit" className="mt-0">
                <AuditLogView />
            </TabsContent>

            <TabsContent value="prompt-management" className="mt-0">
                <PromptManagementView mode="admin" />
            </TabsContent>

            <TabsContent value="feedback-quality" className="mt-0">
                <FeedbackQualityView />
            </TabsContent>

        </div>
      </div>

      {/* User Form Modal (3-step wizard) */}
      <UserFormModal
        open={isModalOpen}
        user={editingUser}
        onSave={handleSaveUser}
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
      />
    </Tabs>
  );
};

export default AdminView;
