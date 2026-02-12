
import React, { useState } from 'react';
import {
  Search, Plus, Filter, Edit2, Trash2,
  Shield, Check, X, Lock, Users, Briefcase, Mail, Power
} from './icons';
import { User, UserRole, UserStatus, RoleConfig } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
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

// --- Mock Data ---

const MOCK_USERS: User[] = [
  { id: '1', name: '홍길동', email: 'gildong.hong@konai.com', department: '전략기획실', role: 'Super Admin', status: 'Active', lastLogin: '2025-12-28 09:30', avatarColor: '#FF3C42' },
  { id: '2', name: '김철수', email: 'cs.kim@konai.com', department: 'DID사업부', role: 'Data Manager', status: 'Active', lastLogin: '2025-12-27 18:00', avatarColor: '#3B82F6' },
  { id: '3', name: '이영희', email: 'yh.lee@konai.com', department: '플랫폼개발팀', role: 'Viewer', status: 'Inactive', lastLogin: '2025-12-20 10:15', avatarColor: '#10B981' },
  { id: '4', name: '박민수', email: 'ms.park@konai.com', department: '영업본부', role: 'Viewer', status: 'Active', lastLogin: '2025-12-28 08:45', avatarColor: '#F59E0B' },
  { id: '5', name: '최지은', email: 'je.choi@konai.com', department: '재무팀', role: 'Data Manager', status: 'Pending', lastLogin: '-', avatarColor: '#8B5CF6' },
];

const MOCK_ROLES: RoleConfig[] = [
  {
    role: 'Super Admin',
    description: '시스템의 모든 기능과 데이터에 대한 완전한 접근 권한',
    dataScope: 'All',
    permissions: [
      { id: 'p1', resource: 'Dashboard', canView: true, canEdit: true, canDelete: true },
      { id: 'p2', resource: 'Data Management', canView: true, canEdit: true, canDelete: true },
      { id: 'p3', resource: 'User Management', canView: true, canEdit: true, canDelete: true },
    ]
  },
  {
    role: 'Data Manager',
    description: '데이터 관리 및 분석 기능에 대한 편집 권한',
    dataScope: 'Department',
    permissions: [
      { id: 'p1', resource: 'Dashboard', canView: true, canEdit: true, canDelete: false },
      { id: 'p2', resource: 'Data Management', canView: true, canEdit: true, canDelete: false },
      { id: 'p3', resource: 'User Management', canView: false, canEdit: false, canDelete: false },
    ]
  },
  {
    role: 'Viewer',
    description: '할당된 대시보드 및 리포트 조회 권한',
    dataScope: 'Self',
    permissions: [
      { id: 'p1', resource: 'Dashboard', canView: true, canEdit: false, canDelete: false },
      { id: 'p2', resource: 'Data Management', canView: true, canEdit: false, canDelete: false },
      { id: 'p3', resource: 'User Management', canView: false, canEdit: false, canDelete: false },
    ]
  },
];

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

const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
    const styles = {
        'Super Admin': 'text-purple-600 bg-purple-50 border-purple-100',
        'Data Manager': 'text-blue-600 bg-blue-50 border-blue-100',
        'Viewer': 'text-gray-600 bg-gray-50 border-gray-100'
    };
    return (
        <Badge variant="outline" className={`font-medium ${styles[role]}`}>
            {role === 'Super Admin' && <Shield size={10} className="mr-1" />}
            {role}
        </Badge>
    );
};

// --- Main View ---

const AdminView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [roles] = useState<RoleConfig[]>(MOCK_ROLES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    setEditingUser(null);
    alert('사용자 정보가 저장되었습니다.');
  };

  // --- Render Functions ---

  const renderUserTable = () => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">사용자 (User)</TableHead>
                    <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">부서 (Dept)</TableHead>
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
                                <Briefcase size={14} className="text-gray-400" />
                                {user.department}
                            </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                            <RoleBadge role={user.role} />
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

  const renderPermissionMatrix = () => (
    <div className="space-y-6">
        {roles.map((roleConfig) => (
            <div key={roleConfig.role} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">{roleConfig.role}</h3>
                            <RoleBadge role={roleConfig.role} />
                        </div>
                        <p className="text-sm text-gray-500">{roleConfig.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 flex items-center gap-1.5">
                             <Lock size={12} /> Data Scope: {roleConfig.dataScope}
                         </div>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-black">
                             <Edit2 size={16} />
                         </Button>
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="px-4 py-2 font-bold text-gray-500 w-1/3">Resource / Menu</TableHead>
                                <TableHead className="px-4 py-2 font-bold text-gray-500 text-center">View</TableHead>
                                <TableHead className="px-4 py-2 font-bold text-gray-500 text-center">Edit</TableHead>
                                <TableHead className="px-4 py-2 font-bold text-gray-500 text-center">Delete</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roleConfig.permissions.map((perm) => (
                                <TableRow key={perm.id}>
                                    <TableCell className="px-4 py-3 font-medium text-gray-700">{perm.resource}</TableCell>
                                    <TableCell className="px-4 py-3 text-center">
                                        {perm.canView ? <Check size={16} className="text-green-500 mx-auto" /> : <X size={16} className="text-gray-300 mx-auto" />}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-center">
                                        {perm.canEdit ? <Check size={16} className="text-green-500 mx-auto" /> : <X size={16} className="text-gray-300 mx-auto" />}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-center">
                                        {perm.canDelete ? <Check size={16} className="text-green-500 mx-auto" /> : <X size={16} className="text-gray-300 mx-auto" />}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        ))}
    </div>
  );

  return (
    <Tabs defaultValue="users" data-testid="admin-view" className="h-full flex flex-col bg-[#F7F9FB] animate-fade-in-up overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-gray-200 shrink-0">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">사용자 및 권한 관리</h2>
            <p className="text-sm text-gray-500 mt-1">시스템 접속 사용자 계정 및 역할별 접근 권한을 설정합니다.</p>
          </div>
          <TabsList className="bg-gray-100 p-1 rounded-lg h-auto">
            <TabsTrigger value="users" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
                <Users size={16} /> 사용자 관리
            </TabsTrigger>
            <TabsTrigger value="permissions" className="px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm gap-2">
                <Shield size={16} /> 권한 설정
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
                {renderPermissionMatrix()}
            </TabsContent>
        </div>
      </div>

      {/* User Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) setEditingUser(null);
      }}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>
                    {editingUser ? '사용자 정보 수정' : '새 사용자 등록'}
                </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveUser} className="space-y-4">
                <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500 uppercase">이름</Label>
                    <div className="relative">
                        <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                        <Input type="text" defaultValue={editingUser?.name} className="pl-9" placeholder="홍길동" required />
                    </div>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs font-bold text-gray-500 uppercase">이메일</Label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                        <Input type="email" defaultValue={editingUser?.email} className="pl-9" placeholder="example@konai.com" required />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-500 uppercase">부서</Label>
                        <div className="relative">
                            <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                            <Input type="text" defaultValue={editingUser?.department} className="pl-9" placeholder="부서명" required />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-gray-500 uppercase">권한 (Role)</Label>
                        <div className="relative">
                            <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                            <Select defaultValue={editingUser?.role || 'Viewer'}>
                                <SelectTrigger className="pl-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                                    <SelectItem value="Data Manager">Data Manager</SelectItem>
                                    <SelectItem value="Viewer">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex gap-3 justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>취소</Button>
                    <Button type="submit" className="bg-[#FF3C42] hover:bg-[#E02B31] text-white shadow-sm">저장하기</Button>
                </div>
            </form>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
};

export default AdminView;
