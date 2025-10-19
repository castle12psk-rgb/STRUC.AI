import React, { useState, useMemo, FormEvent } from 'react';
import { MOCK_USERS, MOCK_PROJECTS, MOCK_ROLE_PERMISSIONS } from '../constants';
import { User, ProjectDetail } from '../types';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-lg shadow-lg ${className}`}>
    {children}
  </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-base font-semibold rounded-t-lg border-b-2 transition-colors ${
            active ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'
        }`}
    >
        {children}
    </button>
);

const UserEditModal: React.FC<{
    user: User | null;
    projects: ProjectDetail[];
    onClose: () => void;
    onSave: (user: User) => void;
}> = ({ user, projects, onClose, onSave }) => {
    const isEditing = user !== null;
    const [formData, setFormData] = useState<User>(
        user || {
            id: '', name: '', email: '', role: 'Engineer', status: 'Invited', 
            lastLogin: '초대 대기 중', projectAccess: [], twoFactorEnabled: false
        }
    );

    const handleChange = (field: keyof User, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleProjectAccessChange = (projectId: string) => {
        const newAccess = formData.projectAccess.includes(projectId)
            ? formData.projectAccess.filter(id => id !== projectId)
            : [...formData.projectAccess, projectId];
        handleChange('projectAccess', newAccess);
    };
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: formData.id || `user-${Date.now().toString().slice(-4)}`
        });
        onClose();
    };

    return (
        <>
         <div className="fixed inset-0 bg-black bg-opacity-60 z-40" onClick={onClose} />
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Card className="p-0 w-full max-w-2xl">
                 <form onSubmit={handleSubmit}>
                    <div className="p-4 border-b border-slate-700">
                        <h3 className="text-xl font-bold text-slate-100">{isEditing ? '사용자 정보 수정' : '새 사용자 초대'}</h3>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-base font-medium text-slate-300">이름</label>
                                <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} required className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-md"/>
                            </div>
                            <div>
                                <label className="text-base font-medium text-slate-300">이메일</label>
                                <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} required className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-md"/>
                            </div>
                        </div>
                        <div>
                             <label className="text-base font-medium text-slate-300">역할</label>
                             <select value={formData.role} onChange={e => handleChange('role', e.target.value)} className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-md">
                                <option>Admin</option>
                                <option>Project Manager</option>
                                <option>Engineer</option>
                                <option>Inspector</option>
                             </select>
                        </div>
                        <div>
                            <label className="text-base font-medium text-slate-300">프로젝트 접근 권한</label>
                            <div className="mt-2 p-3 border border-slate-600 rounded-md max-h-40 overflow-y-auto space-y-2">
                                {projects.map(p => (
                                    <label key={p.id} className="flex items-center">
                                        <input type="checkbox"
                                            checked={formData.projectAccess.includes(p.id)}
                                            onChange={() => handleProjectAccessChange(p.id)}
                                            className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-indigo-600"
                                        />
                                        <span className="ml-2 text-base text-slate-200">{p.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                         <div className="flex items-center">
                            <input type="checkbox" id="2fa-toggle" checked={formData.twoFactorEnabled} onChange={e => handleChange('twoFactorEnabled', e.target.checked)} className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-indigo-600"/>
                            <label htmlFor="2fa-toggle" className="ml-2 text-base font-medium text-slate-300">2단계 인증(2FA) 사용 강제</label>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 text-slate-200 rounded-md hover:bg-slate-500">취소</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500">저장</button>
                    </div>
                </form>
            </Card>
         </div>
        </>
    );
};

// Main Component
const AdminUsersView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
    const [users, setUsers] = useState<User[]>(MOCK_USERS);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<User['role'] | 'All'>('All');
    const [statusFilter, setStatusFilter] = useState<User['status'] | 'All'>('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [selectedRole, setSelectedRole] = useState<User['role']>('Project Manager');

    const filteredUsers = useMemo(() => {
        return users
            .filter(u => roleFilter === 'All' || u.role === roleFilter)
            .filter(u => statusFilter === 'All' || u.status === statusFilter)
            .filter(u => 
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [users, searchTerm, roleFilter, statusFilter]);
    
    const handleAddUser = () => { setEditingUser(null); setIsModalOpen(true); };
    const handleEditUser = (user: User) => { setEditingUser(user); setIsModalOpen(true); };
    
    const handleSaveUser = (userToSave: User) => {
        setUsers(prev => {
            const index = prev.findIndex(u => u.id === userToSave.id);
            if (index > -1) {
                const newUsers = [...prev];
                newUsers[index] = userToSave;
                return newUsers;
            }
            return [...prev, userToSave];
        });
    };

    const getRoleClass = (role: User['role']) => {
        switch (role) {
            case 'Admin': return 'bg-red-500/10 text-red-400';
            case 'Project Manager': return 'bg-indigo-500/10 text-indigo-400';
            case 'Engineer': return 'bg-green-500/10 text-green-400';
            case 'Inspector': return 'bg-yellow-500/10 text-yellow-400';
            default: return 'bg-slate-700 text-slate-300';
        }
    };
    
    const getStatusClass = (status: User['status']) => {
        switch(status) {
            case 'Active': return { dot: 'bg-green-500', text: 'text-green-400' };
            case 'Invited': return { dot: 'bg-yellow-500', text: 'text-yellow-400' };
            case 'Deactivated': return { dot: 'bg-slate-500', text: 'text-slate-400' };
        }
    };

    const renderUsersTab = () => (
         <Card className="p-0 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-700">
                <div className="flex flex-wrap justify-between items-center gap-4">
                     <div className="flex items-center gap-2">
                        <input type="text" placeholder="이름 또는 이메일 검색..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-slate-700 border-slate-600 text-white rounded-md w-48"/>
                        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)} className="bg-slate-700 border-slate-600 text-white rounded-md"><option value="All">모든 역할</option><option>Admin</option><option>Project Manager</option><option>Engineer</option><option>Inspector</option></select>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="bg-slate-700 border-slate-600 text-white rounded-md"><option value="All">모든 상태</option><option>Active</option><option>Invited</option><option>Deactivated</option></select>
                    </div>
                    <button onClick={handleAddUser} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md text-base hover:bg-indigo-500">
                        + 새 사용자 초대
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto flex-grow">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-900/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium text-slate-400 uppercase">사용자</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-slate-400 uppercase">역할</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-slate-400 uppercase">상태</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-slate-400 uppercase">프로젝트 접근</th>
                            <th className="px-6 py-3 text-center text-sm font-medium text-slate-400 uppercase">2FA</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-slate-400 uppercase">최근 로그인</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-slate-400 uppercase">관리</th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                        {filteredUsers.map(user => {
                            const statusStyle = getStatusClass(user.status);
                            return (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-semibold text-lg text-slate-100">{user.name}</div>
                                    <div className="text-base text-slate-400">{user.email}</div>
                                </td>
                                <td className="px-6 py-4"><span className={`px-2.5 py-0.5 text-sm font-medium rounded-full ${getRoleClass(user.role)}`}>{user.role}</span></td>
                                <td className="px-6 py-4"><div className="flex items-center"><div className={`w-2.5 h-2.5 rounded-full mr-2 ${statusStyle.dot}`}></div><span className={statusStyle.text}>{user.status}</span></div></td>
                                <td className="px-6 py-4 text-base text-slate-300">{user.projectAccess.length > 0 ? `${user.projectAccess.length}개 프로젝트` : '없음'}</td>
                                <td className="px-6 py-4 text-center">{user.twoFactorEnabled ? <span className="text-green-400 text-lg">✔</span> : <span className="text-slate-500 text-lg">✖</span>}</td>
                                <td className="px-6 py-4 text-base text-slate-400">{user.lastLogin}</td>
                                <td className="px-6 py-4"><button onClick={() => handleEditUser(user)} className="text-indigo-400 hover:underline">수정</button></td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        </Card>
    );
    
    const renderRolesTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-4 md:col-span-1">
                 <h3 className="text-xl font-bold text-slate-100 mb-2">역할 목록</h3>
                 <div className="space-y-1">
                     {Object.keys(MOCK_ROLE_PERMISSIONS).map(role => (
                        <button key={role} onClick={() => setSelectedRole(role as User['role'])} className={`w-full text-left p-3 rounded-md ${selectedRole === role ? 'bg-indigo-900/30' : 'hover:bg-slate-700'}`}>
                             <span className={`px-2.5 py-0.5 text-sm font-medium rounded-full ${getRoleClass(role as User['role'])}`}>{role}</span>
                        </button>
                     ))}
                 </div>
            </Card>
            <Card className="p-6 md:col-span-2">
                <h3 className="text-xl font-bold text-slate-100 mb-4">{selectedRole} 권한 상세</h3>
                <div className="space-y-4">
                    {Object.entries(MOCK_ROLE_PERMISSIONS[selectedRole]).map(([category, permissions]) => (
                        <div key={category}>
                            <h4 className="font-semibold text-slate-300 text-lg border-b border-slate-700 pb-2">{category}</h4>
                            <ul className="mt-2 space-y-1 text-base text-slate-300">
                                {(permissions as string[]).map(p => <li key={p} className="flex items-center"><span className="text-green-400 mr-2">✔</span>{p}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-4xl font-bold text-slate-100">사용자 및 역할 관리</h2>
                    <div className="relative group">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500 hover:text-indigo-400 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-96 p-3 bg-slate-800 text-slate-200 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 border border-slate-700">
                            <h4 className="font-bold mb-1 border-b border-slate-700 pb-1">사용자 및 역할 관리 도움말</h4>
                            <p className="mt-2">
                                이 페이지에서는 시스템에 접근하는 사용자와 각 사용자가 수행할 수 있는 작업을 제어합니다. 역할 기반 접근 제어(RBAC) 모델을 사용하여 보안과 데이터 무결성을 보장합니다.
                            </p>
                            <ul className="mt-2 space-y-1 list-disc list-inside">
                                <li>
                                    <strong>사용자 관리:</strong> 시스템에 접근할 사용자를 초대, 수정, 비활성화합니다. 각 사용자에게 특정 프로젝트 접근 권한을 부여할 수 있습니다.
                                </li>
                                <li>
                                    <strong>역할 및 권한:</strong> 'Admin', 'Project Manager' 등 사전에 정의된 역할별로 시스템 기능에 대한 접근 권한이 정해져 있습니다. 사용자는 할당된 역할에 따라 허용된 작업만 수행할 수 있습니다.
                                </li>
                            </ul>
                            <p className="mt-2 border-t border-slate-600 pt-2 text-slate-300">
                                정확한 사용자 및 역할 관리는 민감한 구조물 데이터를 보호하고, 작업자의 실수를 방지하는 데 필수적입니다.
                            </p>
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-slate-800"></div>
                        </div>
                    </div>
                </div>
                <p className="mt-1 text-lg text-slate-400">시스템 사용자 계정을 관리하고 역할 기반 접근 제어(RBAC)를 설정합니다.</p>
            </div>
            <div className="border-b border-slate-700">
                <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>사용자 관리</TabButton>
                <TabButton active={activeTab === 'roles'} onClick={() => setActiveTab('roles')}>역할 및 권한</TabButton>
            </div>
            
            {activeTab === 'users' ? renderUsersTab() : renderRolesTab()}

            {isModalOpen && <UserEditModal user={editingUser} projects={MOCK_PROJECTS} onClose={() => setIsModalOpen(false)} onSave={handleSaveUser} />}
        </div>
    );
};

export default AdminUsersView;