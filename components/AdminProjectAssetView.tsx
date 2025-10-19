import React, { useState, useMemo, FormEvent } from 'react';
import { ProjectDetail, Asset, Sensor } from '../types';
import { MOCK_DATA_SOURCES } from '../constants';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`}>{children}</div>
);

const Button: React.FC<{ onClick?: () => void; children: React.ReactNode; variant?: 'primary' | 'secondary' | 'danger'; className?: string, disabled?: boolean, type?: 'button' | 'submit' | 'reset' }> = ({ onClick, children, variant = 'primary', className, disabled=false, type = 'button' }) => {
    const baseClasses = 'px-4 py-2 text-base font-semibold rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
        secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300',
        danger: 'bg-red-600 text-white hover:bg-red-700',
    };
    return <button onClick={onClick} type={type} className={`${baseClasses} ${variantClasses[variant]} ${className}`} disabled={disabled}>{children}</button>;
};

const Modal: React.FC<{ children: React.ReactNode; title: string; onClose: () => void; }> = ({ children, title, onClose }) => (
    <>
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40" onClick={onClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                </div>
                <div className="flex-grow p-6 overflow-y-auto">{children}</div>
            </div>
        </div>
    </>
);

const Input: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; placeholder?: string; }> = ({ label, value, onChange, required=false, placeholder }) => (
    <div>
        <label className="block text-base font-medium text-slate-700">{label}</label>
        <input type="text" value={value} onChange={onChange} required={required} placeholder={placeholder} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
    </div>
);

const Textarea: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number }> = ({ label, value, onChange, rows=3 }) => (
    <div>
        <label className="block text-base font-medium text-slate-700">{label}</label>
        <textarea value={value} onChange={onChange} rows={rows} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
    </div>
);

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
                <Input label="프로젝트 ID" value={formData.id} onChange={(e) => handleChange('id', e.target.value)} required placeholder="예: STRUC-NEW-PROJECT-01" />
                <Input label="프로젝트명" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required placeholder="예: 수도권 제3순환고속도로 교량" />
                <Textarea label="설명" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
                <div className="flex justify-end gap-2 pt-4">
                    <Button onClick={onClose} variant="secondary" type="button">취소</Button>
                    <Button variant="primary" type="submit">저장</Button>
                </div>
            </form>
        </Modal>
    );
}

interface AssetModalProps {
    asset: Asset | null;
    projectId: string;
    onClose: () => void;
    onSave: (asset: Asset) => void;
}
const AssetModal: React.FC<AssetModalProps> = ({ asset, projectId, onClose, onSave }) => {
    const [formData, setFormData] = useState<Asset>(
        asset || {
            asset_id: '',
            project_id: projectId,
            name: '',
            type: '',
            location: '',
            design: { material: '', year: new Date().getFullYear() },
            sensors: [{ sensor_id: '', type: 'accelerometer', unit: 'g' }],
            tags: [],
        }
    );
    const isEditing = !!asset;

    const handleChange = (field: keyof Omit<Asset, 'design'|'sensors'|'tags'>, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };
    
    const handleDesignChange = (field: keyof Asset['design'], value: string | number | boolean | undefined) => {
        setFormData(prev => ({ ...prev, design: { ...prev.design, [field]: value } }));
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, tags: e.target.value.split(',').map(t => t.trim())}));
    };
    
    const handleSensorChange = (index: number, field: keyof Sensor, value: string) => {
        const newSensors = [...formData.sensors];
        const sensor = { ...newSensors[index], [field]: value };
        // Automatically set unit based on type for better UX
        if (field === 'type') {
            switch(value) {
                case 'accelerometer': sensor.unit = 'g'; break;
                case 'displacement': sensor.unit = 'mm'; break;
                case 'strain': sensor.unit = 'με'; break;
                case 'temperature': sensor.unit = '°C'; break;
            }
        }
        newSensors[index] = sensor;
        setFormData(prev => ({ ...prev, sensors: newSensors }));
    };

    const handleAddSensor = () => {
        setFormData(prev => ({...prev, sensors: [...prev.sensors, { sensor_id: '', type: 'accelerometer', unit: 'g'}]}));
    };

    const handleRemoveSensor = (index: number) => {
        setFormData(prev => ({...prev, sensors: prev.sensors.filter((_, i) => i !== index)}));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave({...formData, asset_id: formData.asset_id || `ASSET-${Date.now().toString().slice(-4)}` });
        onClose();
    };

    return (
        <Modal title={isEditing ? '자산 수정' : '새 자산 추가'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="자산 ID" value={formData.asset_id} onChange={e => handleChange('asset_id', e.target.value)} required placeholder="예: BRG-001-P3"/>
                    <Input label="자산명" value={formData.name} onChange={e => handleChange('name', e.target.value)} required placeholder="예: A3 교각"/>
                    <Input label="유형" value={formData.type} onChange={e => handleChange('type', e.target.value)} placeholder="예: 교량 교각"/>
                    <Input label="위치" value={formData.location} onChange={e => handleChange('location', e.target.value)} placeholder="예: 서울시 용산구"/>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border">
                    <h4 className="font-semibold mb-2">설계 정보</h4>
                    <div className="grid grid-cols-2 gap-4">
                         <Input label="주요 자재" value={formData.design.material} onChange={e => handleDesignChange('material', e.target.value)} />
                         <Input label="준공년도" value={String(formData.design.year)} onChange={e => handleDesignChange('year', parseInt(e.target.value, 10) || new Date().getFullYear())} />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border">
                    <h4 className="font-semibold mb-2">센서 구성</h4>
                    <div className="space-y-2">
                        {formData.sensors.map((sensor, index) => (
                             <div key={index} className="grid grid-cols-10 gap-2 items-center">
                                 <input type="text" placeholder="Sensor ID (예: ACC-P3-01)" value={sensor.sensor_id} onChange={e => handleSensorChange(index, 'sensor_id', e.target.value)} className="col-span-4 border-slate-300 rounded-md"/>
                                 <select value={sensor.type} onChange={e => handleSensorChange(index, 'type', e.target.value)} className="col-span-3 border-slate-300 rounded-md">
                                    <option value="accelerometer">Accelerometer</option>
                                    <option value="displacement">Displacement</option>
                                    <option value="strain">Strain Gauge</option>
                                    <option value="temperature">Temperature</option>
                                 </select>
                                 <input type="text" placeholder="Unit" value={sensor.unit} onChange={e => handleSensorChange(index, 'unit', e.target.value)} className="col-span-2 border-slate-300 rounded-md"/>
                                 <button type="button" onClick={() => handleRemoveSensor(index)} className="text-red-500 hover:bg-red-100 rounded-full p-1 transition-colors">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                 </button>
                             </div>
                         ))}
                    </div>
                    <Button type="button" onClick={handleAddSensor} variant="secondary" className="mt-3 text-sm py-1.5">+ 센서 추가</Button>
                </div>
                <div>
                  <label className="block text-base font-medium text-slate-700">태그 (쉼표로 구분)</label>
                  <input type="text" value={formData.tags.join(', ')} onChange={handleTagsChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button onClick={onClose} variant="secondary" type="button">취소</Button>
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

const AdminProjectAssetView: React.FC<AdminProjectAssetViewProps> = ({
    projects,
    assets,
    onSaveProject,
    onDeleteProject,
    onSaveAsset,
    onDeleteAsset,
}) => {
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects.length > 0 ? projects[0].id : null);
    
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<ProjectDetail | null>(null);
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

    const projectHealthMetrics = useMemo(() => {
        const metrics = new Map<string, { assetCount: number; dataStatus: 'OK' | 'Error' }>();
        projects.forEach(p => {
            const projectAssets = assets.filter(a => a.project_id === p.id);
            const hasError = projectAssets.some(a => {
                const sources = MOCK_DATA_SOURCES.filter(ds => ds.assetName === a.name);
                return sources.length > 0 && sources.some(ds => ds.status !== 'Online');
            });
            metrics.set(p.id, {
                assetCount: projectAssets.length,
                dataStatus: hasError ? 'Error' : 'OK'
            });
        });
        return metrics;
    }, [projects, assets]);

    const handleAddProject = () => { setEditingProject(null); setIsProjectModalOpen(true); };
    const handleEditProject = (project: ProjectDetail) => { setEditingProject(project); setIsProjectModalOpen(true); };
    const handleAddAsset = () => { if (!selectedProjectId) return; setEditingAsset(null); setIsAssetModalOpen(true); };
    const handleEditAsset = (asset: Asset) => { setEditingAsset(asset); setIsAssetModalOpen(true); };

    const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
    const selectedProjectAssets = useMemo(() => {
        if (!selectedProjectId) return [];
        return assets.filter(a => a.project_id === selectedProjectId).map(asset => {
            const sources = MOCK_DATA_SOURCES.filter(ds => ds.assetName === asset.name);
            const hasError = sources.length > 0 && sources.some(ds => ds.status !== 'Online');
            return { ...asset, hasDataError: hasError };
        });
    }, [assets, selectedProjectId]);

    const ConfigChecklistItem: React.FC<{ title: string, status: 'OK' | 'Missing', helpText: string}> = ({ title, status, helpText}) => (
        <div className="flex items-center justify-between text-base py-2">
            <div className="flex items-center gap-2">
                 {status === 'OK' 
                    ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                 }
                <span className="font-semibold text-slate-700">{title}</span>
            </div>
            <span className={status === 'OK' ? 'text-slate-500' : 'text-yellow-700 font-semibold'}>{helpText}</span>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-4xl font-bold text-slate-900">프로젝트 및 자산 관리</h2>
                <p className="mt-1 text-lg text-slate-600">시스템에 등록된 모든 프로젝트와 하위 자산을 관리합니다.</p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                <div className="xl:col-span-1 space-y-4">
                     <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold">프로젝트 목록</h3>
                        <Button onClick={handleAddProject} className="text-base px-3 py-1.5">+ 새 프로젝트</Button>
                    </div>
                    {projects.map(p => {
                        const metrics = projectHealthMetrics.get(p.id);
                        const isSelected = selectedProjectId === p.id;
                        return (
                        <Card key={p.id} className={`p-4 cursor-pointer transition-all duration-200 ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'hover:border-slate-300 hover:shadow-md'}`} onClick={() => setSelectedProjectId(p.id)}>
                             <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-xl text-slate-800">{p.name}</p>
                                    <p className="text-sm text-slate-500 font-mono">{p.id}</p>
                                </div>
                                 <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${metrics?.dataStatus === 'Error' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-green-100 text-green-800'}`}>
                                    <span className={`w-2 h-2 rounded-full ${metrics?.dataStatus === 'Error' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                    {metrics?.dataStatus === 'Error' ? 'Data Error' : 'Online'}
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t text-base flex justify-between items-center">
                                <span className="text-slate-500">자산 수: <span className="font-bold text-slate-700">{metrics?.assetCount}</span></span>
                                 <div className="flex gap-2 text-sm">
                                    <button onClick={(e) => { e.stopPropagation(); handleEditProject(p); }} className="text-slate-400 hover:text-indigo-600">수정</button>
                                    <button onClick={(e) => { e.stopPropagation(); onDeleteProject(p.id); }} className="text-slate-400 hover:text-red-600">삭제</button>
                                </div>
                            </div>
                        </Card>
                    )})}
                </div>
                <div className="xl:col-span-2">
                    <Card className="p-0">
                        <div className="p-4 border-b flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold">{selectedProject?.name || '프로젝트를 선택하세요'}</h3>
                                <p className="text-slate-500">{selectedProject?.description}</p>
                            </div>
                            <Button onClick={handleAddAsset} disabled={!selectedProjectId} className="text-base px-3 py-1.5">+ 새 자산</Button>
                        </div>
                        {selectedProjectId ? (
                          <>
                            <div className="p-4 border-b bg-slate-50/70">
                                <h4 className="font-bold text-lg mb-2">프로젝트 구성 상태</h4>
                                <ConfigChecklistItem title="팀원 할당" status={selectedProject && selectedProject.team.length > 0 ? 'OK' : 'Missing'} helpText={selectedProject && selectedProject.team.length > 0 ? `${selectedProject.team.length}명 할당됨` : '팀원 할당 필요'} />
                                <ConfigChecklistItem title="임계값 재정의" status={'Missing'} helpText={'전역 정책 사용 중'} />
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto">
                                {selectedProjectAssets.length > 0 ? (
                                    selectedProjectAssets.map(a => (
                                        <div key={a.asset_id} className={`p-4 border-b ${a.hasDataError ? 'bg-red-50' : ''}`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        {a.hasDataError && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}
                                                        <p className="font-bold text-lg">{a.name}</p>
                                                    </div>
                                                    <p className="text-sm text-slate-500 font-mono">{a.asset_id}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-base text-slate-500">센서: <span className="font-bold text-slate-700">{a.sensors.length}개</span></span>
                                                     <div className="flex gap-2 text-sm">
                                                         <button onClick={() => handleEditAsset(a)} className="text-indigo-600 hover:text-indigo-800 font-semibold">관리</button>
                                                         <button onClick={() => onDeleteAsset(a.asset_id)} className="text-red-600 hover:text-red-800 font-semibold">삭제</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="p-6 text-center text-lg text-slate-500">이 프로젝트에 등록된 자산이 없습니다.</p>
                                )}
                            </div>
                          </>
                        ) : (
                            <p className="p-6 text-center text-lg text-slate-500">프로젝트를 선택하여 자산을 확인하세요.</p>
                        )}
                    </Card>
                </div>
            </div>
            {isProjectModalOpen && <ProjectModal project={editingProject} onClose={() => setIsProjectModalOpen(false)} onSave={onSaveProject} />}
            {isAssetModalOpen && selectedProjectId && <AssetModal asset={editingAsset} projectId={selectedProjectId} onClose={() => setIsAssetModalOpen(false)} onSave={onSaveAsset} />}
        </div>
    );
};

export default AdminProjectAssetView;