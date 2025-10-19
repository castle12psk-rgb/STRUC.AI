import React, { useMemo } from 'react';
// FIX: Changed import paths to be relative.
import { ProjectDetail, Asset, SensorReading, ReviewReport, TeamMember, ProjectDocument, ProjectActivity } from '../types';
import { MOCK_THRESHOLDS_DEFAULT } from '../constants';

type HealthStatus = '정상' | '주의' | '경고' | '위험';

const getStatusFromShi = (shi: number): HealthStatus => {
  if (shi < 60) return '위험';
  if (shi < 80) return '경고';
  if (shi < 95) return '주의';
  return '정상';
};

const getStatusColorDot = (status: HealthStatus): string => {
  switch (status) {
    case '위험': return 'bg-red-500';
    case '경고': return 'bg-orange-500';
    case '주의': return 'bg-yellow-400';
    case '정상': return 'bg-green-500';
    default: return 'bg-slate-500';
  }
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-lg shadow-lg ${className}`}>
    {children}
  </div>
);

const ProjectHeader: React.FC<{ project: ProjectDetail, assetCount: number, alertCount: number, reportCount: number }> = ({ project, assetCount, alertCount, reportCount }) => (
    <div>
        <h2 className="text-4xl font-bold text-slate-100">{project.name}</h2>
        <p className="mt-1 text-lg text-slate-400">{project.description}</p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-5">
                <h4 className="text-base font-semibold text-slate-400">총 관리 자산</h4>
                <p className="text-4xl font-bold text-slate-100 mt-2">{assetCount} <span className="text-xl font-medium text-slate-300">개</span></p>
            </Card>
            <Card className="p-5">
                <h4 className="text-base font-semibold text-slate-400">주의/경고 자산</h4>
                <p className={`text-4xl font-bold mt-2 ${alertCount > 0 ? 'text-orange-400' : 'text-slate-100'}`}>{alertCount} <span className="text-xl font-medium text-slate-300">개</span></p>
            </Card>
            <Card className="p-5">
                <h4 className="text-base font-semibold text-slate-400">진행중 리포트</h4>
                <p className="text-4xl font-bold text-slate-100 mt-2">{reportCount} <span className="text-xl font-medium text-slate-300">건</span></p>
            </Card>
            <Card className="p-5">
                <h4 className="text-base font-semibold text-slate-400">참여 팀원</h4>
                <p className="text-4xl font-bold text-slate-100 mt-2">{project.team.length} <span className="text-xl font-medium text-slate-300">명</span></p>
            </Card>
        </div>
    </div>
);

const AssetTable: React.FC<{ assets: Asset[], allReadings: SensorReading[], onViewDetails: (assetId: string) => void }> = ({ assets, allReadings, onViewDetails }) => {
    const assetHealthData = useMemo(() => {
        return assets.map(asset => {
            const readings = allReadings.filter(r => r.asset_id === asset.asset_id);
            let maxExceededRatio = 0;
            let criticalSensorInfo: { type: string, value: number, unit: string, status: HealthStatus } | null = null;
            
            asset.sensors.forEach(sensor => {
                const latestReading = readings
                    .filter(r => r.sensor_id === sensor.sensor_id)
                    .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                if (!latestReading) return;

                const thresholds = MOCK_THRESHOLDS_DEFAULT[sensor.type];
                if (thresholds && latestReading.value >= thresholds.warning) {
                    const ratio = (latestReading.value - thresholds.warning) / (thresholds.critical - thresholds.warning);
                    if (ratio > maxExceededRatio) {
                        maxExceededRatio = Math.max(0, ratio);
                        const status = latestReading.value >= thresholds.critical ? '위험' : '경고';
                        criticalSensorInfo = { type: sensor.type, value: latestReading.value, unit: sensor.unit, status };
                    }
                }
            });

            const shi = (1 - Math.min(maxExceededRatio, 1) * 0.5) * 100;
            const overallStatus = getStatusFromShi(shi);

            return {
                ...asset,
                overallStatus,
                criticalSensorInfo,
            };
        });
    }, [assets, allReadings]);

    return (
        <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
                <h3 className="text-xl font-bold text-slate-100">관리 자산 목록</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-slate-400 uppercase tracking-wider">상태</th>
                            <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-slate-400 uppercase tracking-wider">자산명</th>
                            <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-slate-400 uppercase tracking-wider">주요 이상 데이터</th>
                            <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-slate-400 uppercase tracking-wider">최종 점검일</th>
                            <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-slate-400 uppercase tracking-wider">관리</th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                        {assetHealthData.map(asset => {
                            const statusColor = getStatusColorDot(asset.overallStatus);
                            return (
                                <tr key={asset.asset_id} className="hover:bg-slate-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full ${statusColor} mr-2`}></div>
                                            <span className="text-base font-semibold text-slate-200">{asset.overallStatus}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-base font-bold text-slate-100">{asset.name}</div>
                                        <div className="text-sm text-slate-400 font-mono">{asset.asset_id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base">
                                        {asset.criticalSensorInfo ? (
                                            <div className={`font-mono font-semibold ${asset.criticalSensorInfo.status === '위험' ? 'text-red-400' : 'text-orange-400'}`}>
                                                {asset.criticalSensorInfo.type}: {asset.criticalSensorInfo.value.toFixed(2)} {asset.criticalSensorInfo.unit}
                                            </div>
                                        ) : <span className="text-slate-500">-</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-400">{asset.last_inspection_date || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium">
                                        <button onClick={() => onViewDetails(asset.asset_id)} className="text-indigo-400 hover:text-indigo-300">상세보기</button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const ProjectSidebar: React.FC<{ project: ProjectDetail }> = ({ project }) => {
    const getDocIcon = (type: ProjectDocument['type']) => {
        switch (type) {
            case '리포트': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2-2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
            case '설계도': return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>;
            default: return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" /></svg>;
        }
    }
    return (
        <div className="space-y-6">
            <Card className="p-4">
                <h3 className="text-lg font-bold text-slate-100 mb-3">참여 팀원</h3>
                <div className="space-y-3">
                    {project.team.map(member => (
                        <div key={member.id} className="flex items-center gap-3">
                            <img src={member.avatarUrl} alt={member.name} className="w-9 h-9 rounded-full" />
                            <div>
                                <p className="text-base font-semibold text-slate-100">{member.name}</p>
                                <p className="text-sm text-slate-400">{member.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            <Card className="p-4">
                <h3 className="text-lg font-bold text-slate-100 mb-3">주요 문서</h3>
                <div className="space-y-2">
                    {project.documents.map(doc => (
                        <a href={doc.link} key={doc.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-700/50">
                            <div className="flex-shrink-0">{getDocIcon(doc.type)}</div>
                            <div>
                                <p className="text-base font-medium text-slate-200 leading-tight">{doc.name}</p>
                                <p className="text-sm text-slate-400">Updated: {doc.lastUpdated}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </Card>
            <Card className="p-4">
                <h3 className="text-lg font-bold text-slate-100 mb-3">최근 활동</h3>
                <div className="space-y-3">
                    {project.activity.map(act => (
                        <div key={act.id} className="text-base">
                            <p className="text-slate-200">{act.description}</p>
                            <p className="text-sm text-slate-500">{act.user} · {act.timestamp}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};


interface ProjectManagementViewProps {
  project?: ProjectDetail;
  assets: Asset[];
  allReadings: SensorReading[];
  allReports: ReviewReport[];
  onViewDetails: (assetId: string) => void;
}

const ProjectManagementView: React.FC<ProjectManagementViewProps> = ({ project, assets, allReadings, allReports, onViewDetails }) => {
    
    const { assetsInAlert, reportsInProgress } = useMemo(() => {
        let alertCount = 0;
        assets.forEach(asset => {
            const hasAlert = asset.sensors.some(sensor => {
                const latestReading = allReadings
                    .filter(r => r.asset_id === asset.asset_id && r.sensor_id === sensor.sensor_id)
                    .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                if (!latestReading) return false;
                const thresholds = MOCK_THRESHOLDS_DEFAULT[sensor.type];
                return latestReading.value >= thresholds.warning;
            });
            if (hasAlert) alertCount++;
        });

        const reportCount = allReports.filter(r => 
            assets.some(a => a.asset_id === r.assetId) &&
            r.status !== '승인됨'
        ).length;

        return { assetsInAlert: alertCount, reportsInProgress: reportCount };
    }, [assets, allReadings, allReports]);


    if (!project) {
        return (
            <Card className="p-6 text-center text-slate-400">
                프로젝트 정보를 불러올 수 없습니다.
            </Card>
        );
    }
    
    return (
        <div className="space-y-8">
            <ProjectHeader 
                project={project}
                assetCount={assets.length}
                alertCount={assetsInAlert}
                reportCount={reportsInProgress}
            />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <div className="xl:col-span-2">
                    <AssetTable assets={assets} allReadings={allReadings} onViewDetails={onViewDetails} />
                </div>
                <div className="xl:col-span-1">
                    <ProjectSidebar project={project} />
                </div>
            </div>
        </div>
    );
};

export default ProjectManagementView;