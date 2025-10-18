
import React, { useState, useMemo, FormEvent } from 'react';
// FIX: Changed import path to be relative.
import { ProjectDetail, Asset, Sensor } from '../types';

// Reusable Components
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>{children}</div>
);
// FIX: Updated Button component to accept standard button props like 'type' and made 'onClick' optional.
const Button: React.FC<{ onClick?: () => void; children: React.ReactNode; variant?: 'primary' | 'secondary' | 'danger'; className?: string, disabled?: boolean, type?: 'button' | 'submit' | 'reset' }> = ({ onClick, children, variant = 'primary', className, disabled=false, type = 'button' }) => {
    const baseClasses = 'px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        danger: 'bg-red-600 text-white hover:bg-red-700',
    };
    return <button onClick={onClick} type={type} className={`${baseClasses} ${variantClasses[variant]} ${className}`} disabled={disabled}>{children}</button>;
};
const Modal: React.FC<{ children: React.ReactNode; title: string; onClose: () => void; }> = ({ children, title, onClose }) => (
    <>
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40" onClick={onClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">&times;</button>
                </div>
                <div className="flex-grow p-6 overflow-y-auto">{children}</div>
            </div>
        </div>
    </>
);

// Form Components
const Input: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean }> = ({ label, value, onChange, required=false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input type="text" value={value} onChange={onChange} required={required} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
    </div>
);
const Textarea: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number }> = ({ label, value, onChange, rows=3 }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <textarea value={value} onChange={onChange} rows={rows} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
    </div>
);

// Project Modal
interface ProjectModalProps {
    project: ProjectDetail | null;
    onClose: () => void;
    onSave: (project: ProjectDetail) => void;
}
const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onSave }) => {
    const [formData, setFormData] = useState<ProjectDetail>(
        project || { id: '', name: '', description: '', team: [], documents: [], activity: [] }
    );
    const isEditing = !!project;

    const handleChange = (field: keyof ProjectDetail, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave({...formData, id: formData.id || `STRUC-PROJ-${Date.now().toString().slice(-4)}` });
        onClose();
    };

    return (
        <Modal title={isEditing ? '프로젝트 수정' : '새 프로젝트 추가'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="프로젝트 ID" value={formData.id} onChange={(e) => handleChange('id', e.target.value)} required />
                <Input label="프로젝트명" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
                <Textarea label="설명" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
                <div className="flex justify-end gap-2 pt-4">
                    <Button onClick={onClose} variant="secondary">취소</Button>
                    {/* FIX: Removed redundant onClick for submit button. */}
                    <Button variant="primary" type="submit">저장</Button>
                </div>
            </form>
        </Modal>
    );
}

// Asset Modal
interface AssetModalProps {
    asset: Asset | null;
    projectId: string;
    onClose: () => void;
    onSave: (asset: Asset) => void;
}
const AssetModal: React.FC<AssetModalProps> = ({ asset, projectId, onClose, onSave }) => {
    const [formData, setFormData] = useState<Asset>(
        asset || { asset_id: '', project_id: projectId, name: '', type: '', location: '', design: { material: '', year: new Date().getFullYear() }, sensors: [], tags: [] }
    );
    const isEditing = !!asset;

    const handleChange = (field: keyof Asset, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const handleDesignChange = (field: keyof Asset['design'], value: any) => {
        setFormData(prev => ({...prev, design: {...prev.design, [field]: value}}));
    }
    const handleSensorChange = (index: number, field: keyof Sensor, value: string) => {
        const newSensors = [...formData.sensors];
        newSensors[index] = {...newSensors[index], [field]: value};
        handleChange('sensors', newSensors);
    }
    const addSensor = () => {
        handleChange('sensors', [...formData.sensors, { sensor_id: '', type: 'accelerometer', unit: '' }]);
    }
    const removeSensor = (index: number) => {
        handleChange('sensors', formData.sensors.filter((_, i) => i !== index));
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave({...formData, asset_id: formData.asset_id || `ASSET-${Date.now().toString().slice(-6)}`});
        onClose();
    };

    return (
        <Modal title={isEditing ? '자산 수정' : '새 자산 추가'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="자산 ID" value={formData.asset_id} onChange={e => handleChange('asset_id', e.target.value)} required />
                    <Input label="자산명" value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
                    <Input label="유형" value={formData.type} onChange={e => handleChange('type', e.target.value)} />
                    <Input label="위치" value={formData.location} onChange={e => handleChange('location', e.target.value)} />
                </div>
                
                <div>
                    <h4 className="font-semibold text-gray-700 border-b pb-2 mb-3">설계 정보</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="주요 자재" value={formData.design.material} onChange={e => handleDesignChange('material', e.target.value)} />
                        <Input label="준공년도" value={String(formData.design.year)} onChange={e => handleDesignChange('year', parseInt(e.target.value) || 0)} />
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-700 border-b pb-2 mb-3">센서 목록</h4>
                    <div className="space-y-2">
                    {formData.sensors.map((sensor, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 items-center">
                            <input type="text" placeholder="Sensor ID" value={sensor.sensor_id} onChange={e => handleSensorChange(index, 'sensor_id', e.target.value)} className="border-gray-300 rounded-md text-sm" />
                            <select value={sensor.type} onChange={e => handleSensorChange(index, 'type', e.target.value as Sensor['type'])} className="border-gray-300 rounded-md text-sm">
                                <option value="accelerometer">accelerometer</option><option value="displacement">displacement</option><option value="strain">strain</option><option value="temperature">temperature</option>
                            </select>
                            <input type="text" placeholder="Unit" value={sensor.unit} onChange={e => handleSensorChange(index, 'unit', e.target.value)} className="border-gray-300 rounded-md text-sm" />
                            <Button onClick={() => removeSensor(index)} variant="danger" className="py-1 px-2 text-xs">삭제</Button>
                        </div>
                    ))}
                    </div>
                    <Button onClick={addSensor} variant="secondary" className="mt-2 text-xs">센서 추가</Button>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                    <Button onClick={onClose} variant="secondary">취소</Button>
                    {/* FIX: Removed redundant onClick for submit button. */}
                    <Button variant="primary" type="submit">저장</Button>
                </div>
            </form>
        </Modal>
    );
};


interface AdminProjectAssetViewProps {
    projects: ProjectDetail[];
    assets: Asset[];
    onSaveProject: (project: ProjectDetail) => void;
    onDeleteProject: (projectId: string) => void;
    onSaveAsset: (asset: Asset) => void;
    onDeleteAsset: (assetId: string) => void;
}

const AdminProjectAssetView: React.FC<AdminProjectAssetViewProps> = ({ projects, assets, onSaveProject, onDeleteProject, onSaveAsset, onDeleteAsset }) => {
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects.length > 0 ? projects[0].id : null);
    
    // Modal states
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<ProjectDetail | null>(null);
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    
    const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
    const selectedProjectAssets = useMemo(() => assets.filter(a => a.project_id === selectedProjectId), [assets, selectedProjectId]);

    const handleAddProject = () => { setEditingProject(null); setIsProjectModalOpen(true); };
    const handleEditProject = (project: ProjectDetail) => { setEditingProject(project); setIsProjectModalOpen(true); };
    const confirmDeleteProject = (projectId: string) => {
      if (window.confirm(`'${projectId}' 프로젝트와 모든 하위 자산을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
        onDeleteProject(projectId);
        if (selectedProjectId === projectId) {
            setSelectedProjectId(projects.length > 1 ? projects.filter(p => p.id !== projectId)[0].id : null);
        }
      }
    };
    
    const handleAddAsset = () => { if(selectedProjectId) { setEditingAsset(null); setIsAssetModalOpen(true); }};
    const handleEditAsset = (asset: Asset) => { setEditingAsset(asset); setIsAssetModalOpen(true); };
    const confirmDeleteAsset = (assetId: string) => {
        if (window.confirm(`'${assetId}' 자산을 삭제하시겠습니까?`)) {
            onDeleteAsset(assetId);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">프로젝트 / 자산 관리</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
                {/* Project List */}
                <Card className="lg:col-span-1 xl:col-span-1 p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">프로젝트 목록</h3>
                        <Button onClick={handleAddProject}>+ 추가</Button>
                    </div>
                    <div className="space-y-2 overflow-y-auto">
                        {projects.map(p => (
                            <button 
                                key={p.id}
                                onClick={() => setSelectedProjectId(p.id)}
                                className={`w-full text-left p-3 rounded-md transition-colors ${selectedProjectId === p.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                            >
                                <p className="font-semibold">{p.name}</p>
                                <p className="text-xs text-gray-500">{p.id} · 자산 {assets.filter(a => a.project_id === p.id).length}개</p>
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Asset List for Selected Project */}
                <Card className="lg:col-span-2 xl:col-span-3 p-0 flex flex-col">
                    {selectedProject ? (
                        <>
                        <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                            <div>
                                <h3 className="font-bold text-lg">{selectedProject.name}</h3>
                                <p className="text-sm text-gray-500">{selectedProject.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => handleEditProject(selectedProject)} variant="secondary">수정</Button>
                                <Button onClick={() => confirmDeleteProject(selectedProject.id)} variant="danger">삭제</Button>
                                <Button onClick={handleAddAsset}>+ 자산 추가</Button>
                            </div>
                        </div>
                        <div className="overflow-x-auto flex-grow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">자산명 / ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">센서 수</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">최종 점검일</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {selectedProjectAssets.map(asset => (
                                    <tr key={asset.asset_id}>
                                        <td className="px-4 py-3"><div className="font-semibold">{asset.name}</div><div className="text-xs text-gray-500 font-mono">{asset.asset_id}</div></td>
                                        <td className="px-4 py-3 text-sm">{asset.type}</td>
                                        <td className="px-4 py-3 text-sm">{asset.sensors.length}</td>
                                        <td className="px-4 py-3 text-sm">{asset.last_inspection_date || 'N/A'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEditAsset(asset)} className="text-blue-600 hover:underline">수정</button>
                                                <button onClick={() => confirmDeleteAsset(asset.asset_id)} className="text-red-600 hover:underline">삭제</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">프로젝트를 선택해주세요.</div>
                    )}
                </Card>
            </div>
            
            {/* Modals */}
            {isProjectModalOpen && <ProjectModal project={editingProject} onClose={() => setIsProjectModalOpen(false)} onSave={onSaveProject} />}
            {isAssetModalOpen && selectedProjectId && <AssetModal asset={editingAsset} projectId={selectedProjectId} onClose={() => setIsAssetModalOpen(false)} onSave={onSaveAsset} />}
        </div>
    );
};

export default AdminProjectAssetView;
