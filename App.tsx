

import React, { useState, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ReportsView from './components/ReportsView';
import ShmMonitorView from './components/ShmMonitorView';
import KnowledgeQaView from './components/KnowledgeQaView';
import ProjectManagementView from './components/ProjectManagementView';
import AdminProjectAssetView from './components/AdminProjectAssetView';
import AdminTeamView from './components/AdminTeamView';
import AdminThresholdsView from './components/AdminThresholdsView';
import AdminTemplatesView from './components/AdminTemplatesView';
import AdminUsersView from './components/AdminUsersView';
import AdminRagView from './components/AdminRagView';
import AdminEtlView from './components/AdminEtlView';
import PlaceholderView from './components/PlaceholderView';
import { AssetDetailModal } from './components/AssetDetailModal';
import { EventDetailModal } from './components/EventDetailModal';

import { Mode, Asset, SensorReading, ProjectDetail, ReviewReport, EventLogEntry, Anomaly, User } from './types';
import { MOCK_PROJECTS, MOCK_ASSETS, MOCK_SENSOR_READINGS, MOCK_REVIEW_REPORTS, MOCK_ANOMALIES, MOCK_USERS } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('user');
  const [activeView, setActiveView] = useState('종합 현황 대시보드');
  
  const [projects, setProjects] = useState<ProjectDetail[]>(MOCK_PROJECTS);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [readings, setReadings] = useState<SensorReading[]>(MOCK_SENSOR_READINGS);
  const [reports, setReports] = useState<ReviewReport[]>(MOCK_REVIEW_REPORTS);
  const [anomalies, setAnomalies] = useState<Anomaly[]>(MOCK_ANOMALIES);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  
  const ALL_PROJECTS_ID = 'ALL_PROJECTS';
  
  const [selectedProjectId, setSelectedProjectId] = useState(ALL_PROJECTS_ID);

  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null);
  const [isDetailModalMinimized, setIsDetailModalMinimized] = useState(false);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventLogEntry | null>(null);

  const toggleMode = () => {
    setMode(prevMode => {
      const newMode = prevMode === 'user' ? 'admin' : 'user';
      setActiveView(newMode === 'user' ? '종합 현황 대시보드' : '프로젝트 관리 > 프로젝트/자산');
      // If switching to admin mode while "All Projects" is selected,
      // default to the first project because "All Projects" isn't a valid choice in admin mode.
      if (newMode === 'admin' && selectedProjectId === ALL_PROJECTS_ID) {
          if (projects.length > 0) {
            setSelectedProjectId(projects[0].id);
          }
      }
      return newMode;
    });
  };

  const handleSaveProject = useCallback((projectToSave: ProjectDetail) => {
    setProjects(prev => {
        const index = prev.findIndex(p => p.id === projectToSave.id);
        if (index > -1) {
            const newProjects = [...prev];
            newProjects[index] = projectToSave;
            return newProjects;
        }
        return [...prev, projectToSave];
    });
  }, []);

  const handleDeleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setAssets(prev => prev.filter(a => a.project_id !== projectId));
  }, []);

  const handleSaveAsset = useCallback((assetToSave: Asset) => {
    setAssets(prev => {
        const index = prev.findIndex(a => a.asset_id === assetToSave.asset_id);
        if (index > -1) {
            const newAssets = [...prev];
            newAssets[index] = assetToSave;
            return newAssets;
        }
        return [...prev, assetToSave];
    });
  }, []);

  const handleDeleteAsset = useCallback((assetId: string) => {
    setAssets(prev => prev.filter(a => a.asset_id !== assetId));
  }, []);
  
  const handleSaveUser = useCallback((userToSave: User) => {
    setUsers(prev => {
        const index = prev.findIndex(u => u.id === userToSave.id);
        if (index > -1) {
            const newUsers = [...prev];
            newUsers[index] = userToSave;
            return newUsers;
        }
        return [...prev, userToSave];
    });
  }, []);


  const {
    projectAssets,
    selectedProject,
    projectReports,
    projectAnomalies,
  } = useMemo(() => {
    const isAllProjects = selectedProjectId === ALL_PROJECTS_ID;

    const currentProjectAssets = isAllProjects
      ? assets
      : assets.filter(asset => asset.project_id === selectedProjectId);
    
    const assetIdSet = new Set(currentProjectAssets.map(a => a.asset_id));

    const currentProject = isAllProjects
      ? {
          id: ALL_PROJECTS_ID,
          name: '전체 프로젝트',
          description: '모든 프로젝트의 종합 현황을 표시합니다.',
          team: [], documents: [], activity: []
        } as ProjectDetail
      : projects.find(p => p.id === selectedProjectId);
    
    const currentReports = reports.filter(report => assetIdSet.has(report.assetId));
    const currentAnomalies = anomalies.filter(anomaly => assetIdSet.has(anomaly.assetId));

    return {
      projectAssets: currentProjectAssets,
      selectedProject: currentProject,
      projectReports: currentReports,
      projectAnomalies: currentAnomalies,
    };
  }, [assets, projects, reports, anomalies, selectedProjectId]);

  const handleViewDetails = (assetId: string) => {
    const asset = assets.find(a => a.asset_id === assetId);
    if (asset) {
        setSelectedAssetForDetail(asset);
        setIsDetailModalMinimized(false);
    }
  };
  
  const handleViewEventDetails = (event: EventLogEntry) => {
    setSelectedEventForDetail(event);
  };

  const handleCloseDetailModal = () => {
    setSelectedAssetForDetail(null);
  };
  
  const handleToggleMinimize = () => {
    setIsDetailModalMinimized(prev => !prev);
  }

  const renderActiveView = () => {
    const [mainView, subView] = activeView.split(' > ');

    switch (mainView) {
      case '종합 현황 대시보드':
        return <DashboardView assets={projectAssets} allReadings={readings} onViewDetails={handleViewDetails} onViewEventDetails={handleViewEventDetails} />;
      case '리포트':
        return <ReportsView activeSubView={activeView} assets={projectAssets} reports={projectReports} />;
      case 'SHM 모니터링':
        return <ShmMonitorView activeSubView={activeView} anomalies={projectAnomalies} />;
      case '기술자료 QA':
        return <KnowledgeQaView />;
      case '프로젝트 관리':
        if (subView === '프로젝트/자산') {
          return <AdminProjectAssetView 
                    projects={projects}
                    assets={assets}
                    onSaveProject={handleSaveProject}
                    onDeleteProject={handleDeleteProject}
                    onSaveAsset={handleSaveAsset}
                    onDeleteAsset={handleDeleteAsset}
                 />;
        }
        if (subView === '팀원 관리') {
            return <AdminTeamView 
                    projects={projects}
                    users={users}
                    onSaveUser={handleSaveUser}
                    selectedProjectId={selectedProjectId}
                   />;
        }
        return <ProjectManagementView project={selectedProject} assets={projectAssets} allReadings={readings} allReports={projectReports} onViewDetails={handleViewDetails} />;
      case '시스템 설정':
          if (subView === '임계값 및 정책') {
              return <AdminThresholdsView />;
          }
          if (subView === '리포트 템플릿') {
              return <AdminTemplatesView />;
          }
          return <PlaceholderView title={activeView} />;
      case '고급 설정':
          if (subView === '사용자 및 역할') {
              return <AdminUsersView />;
          }
          if (subView === 'AI 모델 / RAG') {
              return <AdminRagView />;
          }
          if (subView === '데이터 수집 / ETL') {
              return <AdminEtlView />;
          }
          return <PlaceholderView title={activeView} />;
      default:
        return <PlaceholderView title={activeView} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <Sidebar
        mode={mode}
        activeView={activeView}
        setActiveView={setActiveView}
        toggleMode={toggleMode}
        projects={projects.map(p => ({ id: p.id, name: p.name }))}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        {renderActiveView()}
      </main>
      
      <AssetDetailModal 
        asset={selectedAssetForDetail} 
        allReadings={readings} 
        onClose={handleCloseDetailModal} 
        onToggleMinimize={handleToggleMinimize}
        isMinimized={isDetailModalMinimized}
      />

      <EventDetailModal
        event={selectedEventForDetail}
        onClose={() => setSelectedEventForDetail(null)}
      />
    </div>
  );
};

export default App;