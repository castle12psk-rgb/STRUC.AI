import React, { useState, useMemo, useEffect } from 'react';
import { ProjectDetail, User } from '../types';
import { MOCK_ROLE_PERMISSIONS } from '../constants';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-lg shadow-lg ${className}`}>{children}</div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
  <button
    type="button"
    className={`${
      checked ? 'bg-indigo-600' : 'bg-slate-600'
    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
    onClick={() => onChange(!checked)}
  >
    <span
      className={`${
        checked ? 'translate-x-5' : 'translate-x-0'
      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
    />
  </button>
);


const getRoleClass = (role: User['role']) => {
    switch (role) {
        case 'Admin': return 'bg-red-500/10 text-red-400';
        case 'Project Manager': return 'bg-indigo-500/10 text-indigo-400';
        case 'Engineer': return 'bg-green-500/10 text-green-400';
        case 'Inspector': return 'bg-yellow-500/10 text-yellow-400';
        default: return 'bg-slate-700 text-slate-300';
    }
};

const ActivityLog: React.FC<{ user: User }> = ({ user }) => {
    if (!user.activity || user.activity.length === 0) {
        return <p className="text-slate-500">최근 활동 기록이 없습니다.</p>;
    }

    const getActivityIcon = (action: string) => {
        if (action.includes('로그인')) return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
        if (action.includes('리포트')) return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h2a2 2 0 002-2V4a2 2 0 00-2-2H9z" /><path d="M4 12a2 2 0 012-2h1.5a.5.5 0 000-1H6a2 2 0 01-2-2V4a2 2 0 012-2h1.5a.5.5 0 000-1H6a2 2 0 00-2 2v8a2 2 0 002 2h1.5a.5.5 0 000 1H6a2 2 0 01-2-2z" /></svg>;
        if (action.includes('변경')) return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM5 11a1 1 0 100 2h4a1 1 0 100-2H5z" clipRule="evenodd" /></svg>;
    };

    return (
        <div className="space-y-4">
            {user.activity.map(log => (
                <div key={log.id} className={`flex gap-3 ${log.critical ? 'p-2 bg-red-900/20 rounded-md' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${log.critical ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                        {getActivityIcon(log.action)}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-200">{log.action}: <span className="font-normal">{log.target}</span></p>
                        <p className="text-sm text-slate-500">{log.timestamp}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

interface AdminTeamViewProps {
    projects: ProjectDetail[];
    users: User[];
    onSaveUser: (user: User) => void;
    selectedProjectId: string | null;
}

const AdminTeamView: React.FC<AdminTeamViewProps> = ({ projects, users, onSaveUser, selectedProjectId }) => {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const projectUsers = useMemo(() => {
        if (!selectedProjectId) return [];
        return users.filter(u => u.projectAccess.includes(selectedProjectId));
    }, [users, selectedProjectId]);
    
    useEffect(() => {
        const currentProjectUsers = selectedProjectId ? users.filter(u => u.projectAccess.includes(selectedProjectId)) : [];
        setSelectedUserId(currentProjectUsers.length > 0 ? currentProjectUsers[0].id : null);
    }, [selectedProjectId, users]);

    const selectedUser = useMemo(() => users.find(u => u.id === selectedUserId), [users, selectedUserId]);

    const handleProjectAccessChange = (user: User, projectId: string, hasAccess: boolean) => {
        const newAccess = hasAccess 
            ? [...user.projectAccess, projectId]
            : user.projectAccess.filter(id => id !== projectId);
        onSaveUser({ ...user, projectAccess: newAccess });
    };

    const getAccessHealth = (user: User) => {
        if (user.role === 'Admin') return { status: 'OK', text: '전체 접근' };
        const accessCount = user.projectAccess.length;
        if (accessCount > 5) return { status: 'Warning', text: '과다한 접근' };
        if (accessCount === 0) return { status: 'Warning', text: '접근 없음' };
        return { status: 'OK', text: '정상' };
    };

    return (
         <div className="space-y-8">
            <div>
                <h2 className="text-4xl font-bold text-slate-100">팀원 관리</h2>
                <p className="mt-1 text-lg text-slate-400">선택된 프로젝트의 팀 구성, 접근 권한 및 활동을 관리합니다.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
                {/* Left: Member List */}
                <div className="lg:col-span-1 flex flex-col h-full">
                    <h3 className="text-2xl font-bold text-slate-100 mb-4 flex-shrink-0">
                        {projects.find(p => p.id === selectedProjectId)?.name || '...'} 팀원
                    </h3>
                    <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                        {projectUsers.map(user => {
                            const isSelected = selectedUserId === user.id;
                            const accessHealth = getAccessHealth(user);
                            return (
                                <Card key={user.id} className={`p-3 cursor-pointer transition-all duration-200 ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-slate-700/50' : 'hover:border-slate-600 hover:bg-slate-700/30'}`} onClick={() => setSelectedUserId(user.id)}>
                                    <div className="flex items-center gap-3">
                                        <img src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} className="w-12 h-12 rounded-full"/>
                                        <div>
                                            <p className="font-bold text-lg text-slate-100">{user.name}</p>
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleClass(user.role)}`}>{user.role}</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-700 text-sm space-y-1">
                                         <div className="flex justify-between">
                                            <span className="text-slate-400">최근 활동 (7일):</span>
                                            <span className="font-bold text-slate-200">{user.activity?.length || 0}건</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">접근 권한 상태:</span>
                                            <span className={`font-semibold ${accessHealth.status === 'Warning' ? 'text-yellow-400' : 'text-slate-300'}`}>{accessHealth.text}</span>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                {/* Right: Detail View */}
                <div className="lg:col-span-2 h-full">
                    {selectedUser ? (
                        <Card className="p-6 h-full flex flex-col animate-fade-in">
                            <div className="flex items-center gap-4 pb-4 border-b border-slate-700 flex-shrink-0">
                                <img src={`https://i.pravatar.cc/150?u=${selectedUser.id}`} alt={selectedUser.name} className="w-16 h-16 rounded-full"/>
                                <div>
                                    <h3 className="text-3xl font-bold text-slate-100">{selectedUser.name}</h3>
                                    <p className="text-lg text-slate-400">{selectedUser.email}</p>
                                </div>
                            </div>
                            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 overflow-y-auto pr-2">
                                {/* Access & Permissions */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-200 mb-2">프로젝트 접근 권한</h4>
                                        <div className="space-y-2 p-3 bg-slate-700/50 rounded-md border border-slate-600 max-h-48 overflow-y-auto">
                                            {projects.map(p => (
                                                <div key={p.id} className="flex items-center justify-between">
                                                    <span className="text-base text-slate-200">{p.name}</span>
                                                    <ToggleSwitch checked={selectedUser.projectAccess.includes(p.id)} onChange={checked => handleProjectAccessChange(selectedUser, p.id, checked)} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                     <div>
                                        <h4 className="font-bold text-lg text-slate-200 mb-2">역할 기반 권한 ({selectedUser.role})</h4>
                                        <div className="text-base text-slate-300 space-y-1">
                                            {MOCK_ROLE_PERMISSIONS[selectedUser.role]['리포트'].map(p => (
                                                <p key={p} className="flex items-center gap-2"><span className="text-green-400">✔</span>{p}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* Activity Log */}
                                <div>
                                    <h4 className="font-bold text-lg text-slate-200 mb-2">최근 활동 로그</h4>
                                    <div className="max-h-96 overflow-y-auto pr-2">
                                        <ActivityLog user={selectedUser} />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="flex items-center justify-center h-full text-slate-500 text-lg">
                           <p>프로젝트에 할당된 팀원이 없습니다.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminTeamView;