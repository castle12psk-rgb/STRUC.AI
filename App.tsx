import React, { useState, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ReportsView from './components/ReportsView';
import ShmMonitorView from './components/ShmMonitorView';
import KnowledgeQaView from './components/KnowledgeQaView';
import ProjectManagementView from './components/ProjectManagementView';
import AdminProjectAssetView from './components/AdminProjectAssetView';
import AdminThresholdsView from './components/AdminThresholdsView';
import AdminTemplatesView from './components/AdminTemplatesView';
import AdminUsersView from './components/AdminUsersView';
import AdminRagView from './components/AdminRagView';
import AdminEtlView from './components/AdminEtlView';
import PlaceholderView from './components/PlaceholderView';
import { AssetDetailModal } from './components/AssetDetailModal';
import { EventDetailModal } from './components/EventDetailModal';

import { Mode, Asset, SensorReading, ProjectDetail, ReviewReport, EventLogEntry } from './types';
import { MOCK_PROJECTS, MOCK_ASSETS, MOCK_SENSOR_READINGS, MOCK_REVIEW_REPORTS } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('user');
  const [activeView, setActiveView] = useState('종합 현황 대시보드');
  
  const [projects, setProjects] = useState<ProjectDetail[]>(MOCK_PROJECTS);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [readings, setReadings] = useState<SensorReading[]>(MOCK_SENSOR_READINGS);
  const [reports, setReports] = useState<ReviewReport[]>(MOCK_REVIEW_REPORTS);

  const [selectedProjectId, setSelectedProjectId] = useState(MOCK_PROJECTS[0].id);

  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null);
  const [isDetailModalMinimized, setIsDetailModalMinimized] = useState(false);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventLogEntry | null>(null);

  const toggleMode = () => {
    setMode(prevMode => {
      const newMode = prevMode === 'user' ? 'admin' : 'user';
      setActiveView(newMode === 'user' ? '종합 현황 대시보드' : '프로젝트 관리 > 프로젝트/자산');
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

  const { projectAssets, selectedProject } = useMemo(() => {
    return {
      projectAssets: assets.filter(asset => asset.project_id === selectedProjectId),
      selectedProject: projects.find(p => p.id === selectedProjectId)
    };
  }, [assets, projects, selectedProjectId]);

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
        return <ReportsView activeSubView={activeView} assets={projectAssets} />;
      case 'SHM 모니터링':
        return <ShmMonitorView activeSubView={activeView} />;
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
        return <ProjectManagementView project={selectedProject} assets={projectAssets} allReadings={readings} allReports={reports} onViewDetails={handleViewDetails} />;
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
    <div className="flex h-screen bg-gray-100 font-sans">
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