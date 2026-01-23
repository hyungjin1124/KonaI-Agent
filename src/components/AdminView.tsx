
import React, { useState } from 'react';
import { 
  Search, Plus, Filter, MoreHorizontal, Edit2, Trash2, 
  Shield, Check, X, Lock, Users, Briefcase, Mail, Power
} from 'lucide-react';
import { User, UserRole, UserStatus, RoleConfig } from '../types';

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
    'Active': 'bg-green-100 text-green-700',
    'Inactive': 'bg-gray-100 text-gray-500',
    'Pending': 'bg-amber-100 text-amber-700'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[status]}`}>
      {status}
    </span>
  );
};

const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
    const styles = {
        'Super Admin': 'text-purple-600 bg-purple-50 border-purple-100',
        'Data Manager': 'text-blue-600 bg-blue-50 border-blue-100',
        'Viewer': 'text-gray-600 bg-gray-50 border-gray-100'
    };
    return (
        <span className={`px-2 py-1 rounded border text-xs font-medium flex items-center gap-1.5 w-fit ${styles[role]}`}>
            {role === 'Super Admin' && <Shield size={10} />}
            {role}
        </span>
    );
};

// --- Main View ---

const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'permissions'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [roles, setRoles] = useState<RoleConfig[]>(MOCK_ROLES);
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
    // In a real app, collect form data. Here we simulate update.
    setIsModalOpen(false);
    setEditingUser(null);
    alert('사용자 정보가 저장되었습니다.');
  };

  // --- Render Functions ---

  const renderUserTable = () => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">사용자 (User)</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">부서 (Dept)</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">권한 (Role)</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">상태 (Status)</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">마지막 접속</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">관리</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: user.avatarColor }}>
                                    {user.name[0]}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Briefcase size={14} className="text-gray-400" />
                                {user.department}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <RoleBadge role={user.role} />
                        </td>
                        <td className="px-6 py-4">
                            <UserStatusBadge status={user.status} />
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                            {user.lastLogin}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button 
                                    onClick={() => handleUserStatusToggle(user.id)}
                                    className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${user.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}
                                    title={user.status === 'Active' ? '비활성화' : '활성화'}
                                >
                                    <Power size={14} />
                                </button>
                                <button 
                                    onClick={() => handleEditUser(user)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="수정"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="삭제"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
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
                         <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
                             <Edit2 size={16} />
                         </button>
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-2 font-bold text-gray-500 w-1/3">Resource / Menu</th>
                                <th className="px-4 py-2 font-bold text-gray-500 text-center">View</th>
                                <th className="px-4 py-2 font-bold text-gray-500 text-center">Edit</th>
                                <th className="px-4 py-2 font-bold text-gray-500 text-center">Delete</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {roleConfig.permissions.map((perm) => (
                                <tr key={perm.id}>
                                    <td className="px-4 py-3 font-medium text-gray-700">{perm.resource}</td>
                                    <td className="px-4 py-3 text-center">
                                        {perm.canView ? <Check size={16} className="text-green-500 mx-auto" /> : <X size={16} className="text-gray-300 mx-auto" />}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {perm.canEdit ? <Check size={16} className="text-green-500 mx-auto" /> : <X size={16} className="text-gray-300 mx-auto" />}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {perm.canDelete ? <Check size={16} className="text-green-500 mx-auto" /> : <X size={16} className="text-gray-300 mx-auto" />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ))}
    </div>
  );

  return (
    <div data-testid="admin-view" className="h-full flex flex-col bg-[#F7F9FB] animate-fade-in-up overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-gray-200 shrink-0">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">사용자 및 권한 관리</h2>
            <p className="text-sm text-gray-500 mt-1">시스템 접속 사용자 계정 및 역할별 접근 권한을 설정합니다.</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <Users size={16} /> 사용자 관리
            </button>
            <button 
                onClick={() => setActiveTab('permissions')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'permissions' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <Shield size={16} /> 권한 설정
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto pb-10">
            
            {/* Toolbar (Only for Users tab) */}
            {activeTab === 'users' && (
                <div className="flex items-center justify-between mb-6">
                    <div className="relative w-80">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="이름, 이메일, 부서 검색..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#FF3C42] focus:ring-1 focus:ring-[#FF3C42] transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold transition-colors">
                            <Filter size={16} /> 필터
                        </button>
                        <button 
                            onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] hover:bg-black text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
                        >
                            <Plus size={16} /> 사용자 추가
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'users' ? renderUserTable() : renderPermissionMatrix()}
        </div>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white w-[500px] rounded-xl shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">
                        {editingUser ? '사용자 정보 수정' : '새 사용자 등록'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">이름</label>
                        <div className="relative">
                            <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" defaultValue={editingUser?.name} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#FF3C42] focus:outline-none" placeholder="홍길동" required />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">이메일</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="email" defaultValue={editingUser?.email} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#FF3C42] focus:outline-none" placeholder="example@konai.com" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">부서</label>
                            <div className="relative">
                                <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" defaultValue={editingUser?.department} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#FF3C42] focus:outline-none" placeholder="부서명" required />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">권한 (Role)</label>
                            <div className="relative">
                                <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select defaultValue={editingUser?.role || 'Viewer'} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#FF3C42] focus:outline-none appearance-none bg-white">
                                    <option value="Super Admin">Super Admin</option>
                                    <option value="Data Manager">Data Manager</option>
                                    <option value="Viewer">Viewer</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-4 flex gap-3 justify-end">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">취소</button>
                        <button type="submit" className="px-4 py-2 bg-[#FF3C42] text-white rounded-lg text-sm font-bold hover:bg-[#E02B31] transition-colors shadow-sm">저장하기</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
