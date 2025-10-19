import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_DATA_SOURCES, MOCK_ETL_STATS, MOCK_INGESTION_HISTORY } from '../constants';
import { DataSource } from '../types';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-lg shadow-lg ${className}`}>
    {children}
  </div>
);

const StatCard: React.FC<{ title: string; value: string | number; subtext?: string; icon: React.ReactNode }> = ({ title, value, subtext, icon }) => (
    <div className="bg-slate-700/50 p-4 rounded-lg flex items-start gap-4">
        <div className="bg-indigo-900/30 text-indigo-400 p-3 rounded-full mt-1">{icon}</div>
        <div>
            <p className="text-base text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-slate-100">{value}</p>
            {subtext && <p className="text-sm text-slate-400">{subtext}</p>}
        </div>
    </div>
);

const IngestionChart: React.FC<{ data: { hour: string; points: number }[] }> = ({ data }) => {
    const maxPoints = Math.max(...data.map(d => d.points));
    return (
        <div className="h-40 flex items-end justify-between gap-1 px-2">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end items-center group">
                    <div className="absolute -top-7 text-xs bg-slate-900 text-white px-2 py-1 rounded-md invisible group-hover:visible transition-opacity">
                        {d.points.toLocaleString()}
                    </div>
                    <div 
                        className="w-full bg-indigo-500/50 hover:bg-indigo-500 rounded-t-sm transition-colors"
                        style={{ height: `${(d.points / maxPoints) * 100}%` }}
                    />
                    <div className={`text-sm mt-1 ${i % 3 === 0 ? 'text-slate-500' : 'text-transparent'}`}>{d.hour.split(':')[0]}</div>
                </div>
            ))}
        </div>
    );
};

const LogViewer: React.FC<{ source: DataSource }> = ({ source }) => {
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        setLogs([`[INFO] Initializing log stream for ${source.id}...`]);
        const interval = setInterval(() => {
            const timestamp = new Date().toISOString();
            let logLine = `[INFO] ${timestamp}: Ping received. Latency: ${source.avgLatencyMs + (Math.random() * 50 - 25)}ms.`;
            if (Math.random() < 0.1) {
                logLine = `[WARN] ${timestamp}: Latency spike detected. Current: ${source.avgLatencyMs + 100 + Math.random() * 100}ms.`;
            }
             if (source.status === 'Error' && Math.random() < 0.3) {
                logLine = `[ERROR] ${timestamp}: Failed to connect to endpoint. Retrying...`;
            }
            setLogs(prev => [logLine, ...prev].slice(0, 100));
        }, 2000);

        return () => clearInterval(interval);
    }, [source]);

    return (
        <div className="bg-slate-900 text-white font-mono text-sm p-4 rounded-lg h-full overflow-y-auto">
            {logs.map((log, i) => {
                const color = log.startsWith('[ERROR]') ? 'text-red-400' : log.startsWith('[WARN]') ? 'text-yellow-400' : 'text-slate-300';
                return <p key={i} className={color}><span className="text-slate-500 mr-2">{logs.length - i}</span>{log}</p>
            })}
        </div>
    );
};


const AdminEtlView: React.FC = () => {
    const [selectedSource, setSelectedSource] = useState<DataSource | null>(MOCK_DATA_SOURCES[0]);

    const getStatusClass = (status: DataSource['status']) => {
        switch (status) {
            case 'Online': return { dot: 'bg-green-500', text: 'text-green-400' };
            case 'Offline': return { dot: 'bg-slate-500', text: 'text-slate-400' };
            case 'Error': return { dot: 'bg-red-500', text: 'text-red-400' };
            default: return { dot: 'bg-slate-500', text: 'text-slate-400' };
        }
    };
    
    return (
         <div className="space-y-8">
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-4xl font-bold text-slate-100">데이터 수집 / ETL 관리</h2>
                    <div className="relative group">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500 hover:text-indigo-400 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 p-3 bg-slate-800 text-slate-200 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 border border-slate-700">
                            <h4 className="font-bold mb-1 border-b border-slate-700 pb-1">데이터 수집 / ETL 관리 도움말</h4>
                            <p className="mt-2">
                                이 페이지에서는 STRUC.AI 플랫폼으로 들어오는 모든 데이터의 흐름을 관리하고 모니터링합니다.
                            </p>
                            <ul className="mt-2 space-y-1 list-disc list-inside">
                                <li>
                                    <strong>ETL (Extract, Transform, Load):</strong> 현장 센서, 수동 업로드 파일 등 다양한 소스로부터 원시 데이터를 추출(Extract)하고, 시스템에서 분석 가능한 표준 형식으로 변환(Transform)한 후, 데이터베이스에 적재(Load)하는 전체 과정을 의미합니다.
                                </li>
                                <li>
                                    <strong>주요 모니터링 항목:</strong> 상태, 처리량, 지연시간, 실시간 로그 등을 통해 데이터 파이프라인의 안정성을 확보합니다.
                                </li>
                            </ul>
                             <p className="mt-2 border-t border-slate-600 pt-2 text-slate-300">
                                안정적인 데이터 파이프라인은 정확한 구조물 건전성 분석과 신뢰도 높은 AI 진단의 기반이 됩니다.
                            </p>
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-slate-800"></div>
                        </div>
                    </div>
                </div>
                <p className="mt-1 text-lg text-slate-400">센서 및 외부 시스템으로부터의 데이터 수집 파이프라인 상태를 모니터링합니다.</p>
            </div>
            
             <Card className="p-6">
                <h3 className="text-2xl font-bold text-slate-100 mb-4">파이프라인 현황</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="총 데이터 소스" value={MOCK_ETL_STATS.totalSources} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7l8-4 8 4" /></svg>} />
                    <StatCard title="활성 소스" value={`${MOCK_ETL_STATS.onlineSources} / ${MOCK_ETL_STATS.totalSources}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                    <StatCard title="데이터 처리량" value={MOCK_ETL_STATS.ingestionRate} subtext="points/min" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
                    <StatCard title="오류 (24H)" value={MOCK_ETL_STATS.errors24h} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-28rem)] min-h-[500px]">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card className="p-0 overflow-hidden flex-1 flex flex-col">
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                            <h3 className="text-xl font-bold text-slate-100">데이터 소스 목록</h3>
                            <button className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-md text-sm hover:bg-indigo-500">+ 새 소스 연결</button>
                        </div>
                        <div className="overflow-x-auto flex-grow">
                            <table className="min-w-full divide-y divide-slate-700 text-base">
                                <thead className="bg-slate-900/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-slate-400 uppercase">상태</th>
                                        <th className="px-4 py-2 text-left font-medium text-slate-400 uppercase">소스/자산</th>
                                        <th className="px-4 py-2 text-left font-medium text-slate-400 uppercase">24H 처리량</th>
                                        <th className="px-4 py-2 text-right font-medium text-slate-400 uppercase">지연시간</th>
                                        <th className="px-4 py-2 text-left font-medium text-slate-400 uppercase">마지막 수신</th>
                                        <th className="px-4 py-2 text-left font-medium text-slate-400 uppercase">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-800 divide-y divide-slate-700">
                                    {MOCK_DATA_SOURCES.map(source => {
                                        const statusStyle = getStatusClass(source.status);
                                        return (
                                        <tr key={source.id} onClick={() => setSelectedSource(source)} className={`cursor-pointer hover:bg-indigo-900/20 ${selectedSource?.id === source.id ? 'bg-indigo-900/20' : ''}`}>
                                            <td className="px-4 py-3"><div className="flex items-center"><div className={`w-2.5 h-2.5 rounded-full mr-2 ${statusStyle.dot}`}></div><span className={statusStyle.text}>{source.status}</span></div></td>
                                            <td className="px-4 py-3"><div className="font-semibold text-slate-200">{source.sourceName}</div><div className="text-sm text-slate-400">{source.assetName}</div></td>
                                            <td className="px-4 py-3 font-mono text-slate-300">{source.dataVolume24h}</td>
                                            <td className="px-4 py-3 text-right font-mono text-slate-300">{source.avgLatencyMs}ms</td>
                                            <td className="px-4 py-3 text-slate-400">{source.lastReceived}</td>
                                            <td className="px-4 py-3"><div className="flex gap-2"><button className="text-indigo-400 hover:underline text-sm">재시도</button><button className="text-slate-400 hover:underline text-sm">일시정지</button></div></td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                    <Card className="p-4 flex-shrink-0">
                         <h3 className="text-xl font-bold text-slate-100 mb-2">데이터 처리량 (24H)</h3>
                         <IngestionChart data={MOCK_INGESTION_HISTORY} />
                    </Card>
                </div>
                <Card className="p-4 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-100 mb-2">실시간 로그</h3>
                    <p className="text-base text-slate-400 mb-3 font-mono">{selectedSource?.sourceName || 'No source selected'}</p>
                    <div className="flex-grow min-h-0">
                        {selectedSource ? <LogViewer source={selectedSource} /> : <div className="flex items-center justify-center h-full text-slate-500">데이터 소스를 선택하세요.</div>}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminEtlView;