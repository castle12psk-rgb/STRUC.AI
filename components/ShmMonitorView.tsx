
import React, { useState, useEffect, useMemo } from 'react';
// FIX: Changed import paths to be relative.
import { MOCK_ASSETS, MOCK_THRESHOLDS_DEFAULT, MOCK_ANOMALIES } from '../constants';
import { Sensor, Thresholds, Asset, Anomaly, AnomalyStatus } from '../types';
import { LineChart } from './LineChart';


interface ShmMonitorViewProps {
  activeSubView: string;
}

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const AnomalyAlertsView: React.FC = () => {
    const [anomalies, setAnomalies] = useState<Anomaly[]>(MOCK_ANOMALIES);
    const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(MOCK_ANOMALIES.find(a => a.status === 'New')?.id || MOCK_ANOMALIES[0]?.id || null);

    // Filters
    const [statusFilter, setStatusFilter] = useState<AnomalyStatus | 'ALL'>('ALL');
    const [levelFilter, setLevelFilter] = useState<'ALL' | '경고' | '위험'>('ALL');
    const [assetFilter, setAssetFilter] = useState<string>('ALL');

    const filteredAnomalies = useMemo(() => {
        return anomalies
            .filter(a => statusFilter === 'ALL' || a.status === statusFilter)
            .filter(a => levelFilter === 'ALL' || a.level === levelFilter)
            .filter(a => assetFilter === 'ALL' || a.assetId === assetFilter)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [anomalies, statusFilter, levelFilter, assetFilter]);
    
    const selectedAnomaly = useMemo(() => {
        return anomalies.find(a => a.id === selectedAnomalyId);
    }, [selectedAnomalyId, anomalies]);

    const handleAcknowledge = (id: string) => {
        setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status: 'Acknowledged' } : a));
    };

    const uniqueAssets = useMemo(() => {
      const assetsMap = new Map<string, string>();
      MOCK_ANOMALIES.forEach(a => assetsMap.set(a.assetId, a.assetName));
      return Array.from(assetsMap, ([id, name]) => ({ id, name }));
    }, []);

    const getLevelAppearance = (level: '경고' | '위험') => {
        return level === '위험' 
            ? { text: 'text-red-800', bg: 'bg-red-100', border: 'border-red-500' }
            : { text: 'text-orange-800', bg: 'bg-orange-100', border: 'border-orange-500' };
    };
    
    const getStatusAppearance = (status: AnomalyStatus) => {
        switch(status) {
            case 'New': return { text: 'text-blue-800', bg: 'bg-blue-100' };
            case 'Acknowledged': return { text: 'text-purple-800', bg: 'bg-purple-100' };
            case 'In Progress': return { text: 'text-yellow-800', bg: 'bg-yellow-100' };
            case 'Resolved': return { text: 'text-green-800', bg: 'bg-green-100' };
            default: return { text: 'text-gray-800', bg: 'bg-gray-100' };
        }
    };

    const chartData = useMemo(() => {
        if (!selectedAnomaly) return [];
        
        const { threshold, value } = selectedAnomaly;
        const baseValue = threshold * 0.8;
        const peak = value * 1.05;
        const data = Array.from({ length: 21 }, (_, i) => {
            let val;
            const pos = i / 10;
            if (pos <= 1) val = baseValue + (peak - baseValue) * pos;
            else val = peak - (peak - baseValue) * (pos - 1) * 0.7;
            val += (Math.random() - 0.5) * (peak - baseValue) * 0.1;
            return { label: `T-${10 - i}m`, value: parseFloat(val.toFixed(3)) };
        });
        return data;
    }, [selectedAnomaly]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
            {/* Left Column: Alert List */}
            <div className="lg:col-span-1 flex flex-col h-full">
                <Card className="p-4 flex-shrink-0">
                    <h3 className="font-bold text-gray-800 mb-3">필터</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                            <label className="text-xs text-gray-500">심각도</label>
                            <select onChange={e => setLevelFilter(e.target.value as any)} value={levelFilter} className="w-full mt-1 border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="ALL">전체</option>
                                <option value="위험">위험</option>
                                <option value="경고">경고</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">상태</label>
                            <select onChange={e => setStatusFilter(e.target.value as any)} value={statusFilter} className="w-full mt-1 border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="ALL">전체</option>
                                <option value="New">New</option>
                                <option value="Acknowledged">Acknowledged</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">자산</label>
                            <select onChange={e => setAssetFilter(e.target.value)} value={assetFilter} className="w-full mt-1 border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="ALL">전체</option>
                                {uniqueAssets.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                            </select>
                        </div>
                    </div>
                </Card>
                <div className="flex-grow overflow-y-auto mt-4 space-y-3 pr-2">
                    {filteredAnomalies.map(anomaly => {
                        const levelStyle = getLevelAppearance(anomaly.level);
                        const statusStyle = getStatusAppearance(anomaly.status);
                        const isSelected = anomaly.id === selectedAnomalyId;
                        return (
                            <button 
                                key={anomaly.id} 
                                onClick={() => setSelectedAnomalyId(anomaly.id)}
                                className={`w-full text-left p-3 rounded-lg border-l-4 transition-all duration-200 ${isSelected ? `bg-blue-50 shadow-md ${levelStyle.border}` : `bg-white hover:bg-gray-50 shadow-sm ${levelStyle.border.replace('-500', '-300')}`}`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${levelStyle.bg} ${levelStyle.text}`}>{anomaly.level}</span>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>{anomaly.status}</span>
                                </div>
                                <h4 className="font-bold text-gray-800 mt-2">{anomaly.assetName}</h4>
                                <p className="text-sm text-gray-600 font-mono">{anomaly.sensorId} ({anomaly.sensorType})</p>
                                <p className="text-xs text-gray-400 mt-1">{anomaly.timestamp}</p>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Right Column: Details */}
            <div className="lg:col-span-2 flex flex-col h-full">
                <Card className="p-6 flex-grow overflow-y-auto">
                    {selectedAnomaly ? (
                        <div className="space-y-6">
                            <div>
                                <h3 className={`text-xl font-bold ${getLevelAppearance(selectedAnomaly.level).text}`}>{selectedAnomaly.level} 이벤트: {selectedAnomaly.assetName}</h3>
                                <p className="text-sm text-gray-500">{selectedAnomaly.timestamp}</p>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-700 mb-2">AI 분석 요약</h4>
                                <p className="text-sm text-gray-600">{selectedAnomaly.aiSummary}</p>
                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <strong className="text-gray-500">추정 원인:</strong> {selectedAnomaly.aiCause}
                                  </div>
                                  <div>
                                    <strong className="text-gray-500">권고 조치:</strong> {selectedAnomaly.aiAction}
                                  </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="bg-white p-4 rounded-lg border">
                                    <h4 className="text-sm font-semibold text-gray-500">측정 데이터</h4>
                                    <div className="mt-1">
                                        <span className={`text-3xl font-bold font-mono ${getLevelAppearance(selectedAnomaly.level).text}`}>{selectedAnomaly.value.toFixed(2)}</span>
                                        <span className="ml-2 text-gray-600">{selectedAnomaly.unit}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">임계값: {selectedAnomaly.threshold.toFixed(2)} {selectedAnomaly.unit}</div>
                               </div>
                               <div className="bg-white p-4 rounded-lg border">
                                  <h4 className="text-sm font-semibold text-gray-500 mb-1">이벤트 전후 데이터 추세</h4>
                                  <LineChart data={chartData} threshold={selectedAnomaly.threshold} eventIndex={10} unit={selectedAnomaly.unit} height={80} />
                               </div>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-3">대응 및 조치</h4>
                                <div className="flex flex-wrap gap-3">
                                    <button 
                                        onClick={() => handleAcknowledge(selectedAnomaly.id)}
                                        disabled={selectedAnomaly.status !== 'New'}
                                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        확인 (Acknowledge)
                                    </button>
                                    <button className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-800">작업 지시 생성</button>
                                    <button className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-md border hover:bg-gray-100">상세 분석 요청</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-center text-gray-500">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
                                <h3 className="mt-2 font-medium">알림을 선택하세요</h3>
                                <p className="text-sm mt-1">좌측 목록에서 알림을 선택하면 상세 정보가 표시됩니다.</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};


const LiveStreamChart: React.FC<{ data: { value: number }[], thresholds: Thresholds[keyof Thresholds] }> = ({ data, thresholds }) => {
    const width = 300;
    const height = 80;
    const padding = { top: 5, right: 5, bottom: 5, left: 5 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const values = data.map(d => d.value);
    const yMax = Math.max(thresholds.critical * 1.2, ...values);
    const yMin = Math.min(0, ...values);
    const yRange = yMax - yMin === 0 ? 1 : yMax - yMin;

    const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
    const getY = (value: number) => padding.top + chartHeight - ((value - yMin) / yRange) * chartHeight;

    const path = data.map((point, i) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getY(point.value)}`).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20" preserveAspectRatio="none">
            <line x1={0} y1={getY(thresholds.critical)} x2={width} y2={getY(thresholds.critical)} className="stroke-red-500/50" strokeWidth="1" strokeDasharray="3,3" />
            <line x1={0} y1={getY(thresholds.warning)} x2={width} y2={getY(thresholds.warning)} className="stroke-orange-500/50" strokeWidth="1" strokeDasharray="3,3" />
            <path d={path} fill="none" className="stroke-blue-600" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
};

const SensorLiveCard: React.FC<{ sensor: Sensor, data: { value: number }[], thresholds: Thresholds[keyof Thresholds] }> = ({ sensor, data, thresholds }) => {
    const latestValue = data.length > 0 ? data[data.length - 1].value : 0;
    
    const { status, colorClass, dotClass } = useMemo(() => {
        if (latestValue >= thresholds.critical) return { status: '경고', colorClass: 'text-red-600', dotClass: 'bg-red-500' };
        if (latestValue >= thresholds.warning) return { status: '주의', colorClass: 'text-orange-500', dotClass: 'bg-orange-400' };
        return { status: '정상', colorClass: 'text-blue-600', dotClass: 'bg-blue-500' };
    }, [latestValue, thresholds]);

    return (
        <Card className="flex flex-col p-4">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-gray-800 capitalize">{sensor.type}</h4>
                    <p className="text-xs text-gray-500 font-mono">{sensor.sensor_id}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${dotClass}`}></div>
                    <span className={`text-sm font-semibold ${colorClass}`}>{status}</span>
                </div>
            </div>
            <div className="my-2 text-right">
                <span className={`text-3xl font-bold font-mono ${colorClass}`}>{latestValue.toFixed(3)}</span>
                <span className="ml-1.5 text-gray-500">{sensor.unit}</span>
            </div>
            <div className="flex-grow flex items-end">
                {data.length > 1 && <LiveStreamChart data={data} thresholds={thresholds} />}
            </div>
            <div className="text-xs text-gray-400 mt-2 flex justify-between">
                <span>경고: {thresholds.warning}</span>
                <span>위험: {thresholds.critical}</span>
            </div>
        </Card>
    );
};

const SensorExplanation: React.FC = () => {
    const explanations = [
        {
          title: "가속도계 (Accelerometer)",
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h4l2.667 8L14.333 6 17 14h4" /></svg>,
          description: "구조물의 동적인 움직임과 진동을 측정합니다. 지진, 강풍, 또는 차량 통행으로 인한 미세한 떨림을 감지하여 구조물의 동적 안정성과 피로 수명을 평가하는 데 사용됩니다. g (중력가속도) 단위로 표시됩니다."
        },
        {
          title: "변위계 (Displacement Sensor)",
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" /></svg>,
          description: "구조물이나 특정 지점의 위치 변화, 즉 변위를 측정합니다. 교량의 처짐, 건물의 기울어짐, 지반의 침하 등을 mm 단위로 정밀하게 감시하여 구조물의 전체적인 거동을 파악하는 데 핵심적인 역할을 합니다."
        },
        {
          title: "변형률계 (Strain Gauge)",
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15m-6 0l-3.75 3.75M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9" /></svg>,
          description: "구조 부재가 힘을 받을 때 늘어나거나 줄어드는 미세한 변형 정도를 측정합니다. 이 변형률 데이터를 통해 부재가 받고 있는 응력(stress)을 계산할 수 있으며, 과도한 하중이나 재료의 피로도를 평가하는 데 필수적입니다. με (마이크로스트레인) 단위로 표시됩니다."
        },
        {
          title: "온도계 (Temperature Sensor)",
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5" stroke="none" /><path d="M13.5 4.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /><path d="M12 6.75v10.5" /><path d="M12 17.25a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" stroke="none" /><path d="M12 6.75v10.5" stroke="none" /><path d="M12 17.25a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" /><path d="M13.5 4.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" stroke="none" /><path d="M12 6.75v10.5" /><path d="M12 17.25a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" stroke="none" /><path d="M13.5 4.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /><path d="M12 6.75v10.5" /><path d="M12 17.25a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" stroke="none" /><path d="M13.5 4.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /><path d="M12 6.75v10.5" /><path d="M12 17.25a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" /><path d="M13.5 4.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /><path d="M12 6.75v10.5" /><path d="M12 17.25a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" /></svg>,
          description: "구조물 내/외부의 온도를 측정합니다. 온도의 변화는 재료의 팽창과 수축을 유발하여 구조물에 추가적인 응력을 발생시킬 수 있습니다. 온도 데이터를 통해 다른 센서(변위, 변형률) 측정값에서 열에 의한 영향을 분리하여 분석할 수 있습니다."
        }
    ];

    return (
        <Card className="mt-6 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">센서 유형별 상세 설명</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {explanations.map(item => (
                    <div key={item.title} className="flex items-start gap-4">
                        <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-lg p-3 mt-1">
                            {item.icon}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-700">{item.title}</h4>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};


const LiveStreamView: React.FC = () => {
    const [isLive, setIsLive] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState<Asset>(MOCK_ASSETS[0]);
    const [selectedSensorIds, setSelectedSensorIds] = useState<string[]>(MOCK_ASSETS[0].sensors.map(s => s.sensor_id));
    const [liveData, setLiveData] = useState<{ [key: string]: { value: number }[] }>({});
    const timeWindowSeconds = 60;

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isLive) return;

            setLiveData(prevData => {
                const newData = { ...prevData };
                selectedSensorIds.forEach(id => {
                    const sensor = selectedAsset.sensors.find(s => s.sensor_id === id);
                    if (!sensor) return;

                    const currentData = newData[id] || [];
                    const lastValue = currentData.length > 0 ? currentData[currentData.length - 1].value : (MOCK_THRESHOLDS_DEFAULT[sensor.type].warning / 2);
                    
                    // Simulate realistic sensor data fluctuation
                    const fluctuation = (Math.random() - 0.5) * (MOCK_THRESHOLDS_DEFAULT[sensor.type].warning * 0.05);
                    let nextValue = lastValue + fluctuation;

                    // Occasionally spike to test thresholds
                    if (Math.random() < 0.02) {
                        nextValue += MOCK_THRESHOLDS_DEFAULT[sensor.type].warning * (0.5 + Math.random());
                    }
                     if (Math.random() < 0.005) {
                        nextValue = MOCK_THRESHOLDS_DEFAULT[sensor.type].warning * 0.1;
                    }

                    newData[id] = [...currentData, { value: nextValue }].slice(-timeWindowSeconds);
                });
                return newData;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isLive, selectedSensorIds, selectedAsset]);
    
    const handleAssetChange = (assetId: string) => {
        const newAsset = MOCK_ASSETS.find(a => a.asset_id === assetId);
        if (newAsset) {
            setSelectedAsset(newAsset);
            setSelectedSensorIds(newAsset.sensors.map(s => s.sensor_id));
            setLiveData({});
        }
    };

    const handleSensorSelectionChange = (sensorId: string) => {
        setSelectedSensorIds(prev => {
            if (prev.includes(sensorId)) {
                return prev.filter(id => id !== sensorId);
            } else {
                return [...prev, sensorId];
            }
        });
    };

    return (
        <div className="space-y-6">
            <Card className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <label htmlFor="asset-select-live" className="block text-xs font-medium text-gray-500">자산 선택</label>
                            <select 
                                id="asset-select-live"
                                value={selectedAsset.asset_id}
                                onChange={e => handleAssetChange(e.target.value)}
                                className="mt-1 border-gray-300 rounded-md shadow-sm text-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {MOCK_ASSETS.map(asset => <option key={asset.asset_id} value={asset.asset_id}>{asset.name}</option>)}
                            </select>
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-gray-500">센서 채널</label>
                           <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                            {selectedAsset.sensors.map(sensor => (
                                <label key={sensor.sensor_id} className="flex items-center text-sm">
                                    <input 
                                        type="checkbox"
                                        checked={selectedSensorIds.includes(sensor.sensor_id)}
                                        onChange={() => handleSensorSelectionChange(sensor.sensor_id)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-gray-700 capitalize">{sensor.type}</span>
                                </label>
                            ))}
                           </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsLive(!isLive)}
                        className={`px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2 transition-colors ${isLive ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                    >
                         {isLive ? (
                            <>
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                                </span>
                                Live
                            </>
                         ) : (
                            <>
                                 <span className="flex h-2.5 w-2.5"><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-500"></span></span>
                                Paused
                            </>
                         )}
                    </button>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {selectedSensorIds.map(id => {
                    const sensor = selectedAsset.sensors.find(s => s.sensor_id === id);
                    if (!sensor) return null;
                    const data = liveData[id] || [];
                    const thresholds = MOCK_THRESHOLDS_DEFAULT[sensor.type];
                    return <SensorLiveCard key={id} sensor={sensor} data={data} thresholds={thresholds} />
                })}
            </div>
            {selectedSensorIds.length === 0 && <p className="text-center text-gray-500 col-span-full">모니터링할 센서를 선택해주세요.</p>}
            <SensorExplanation />
        </div>
    );
};


const ShmMonitorView: React.FC<ShmMonitorViewProps> = ({ activeSubView }) => {
  const subView = activeSubView.split(' > ')[1] || '이상 알림';

  const renderContent = () => {
    switch(subView) {
      case '이상 알림':
        return <AnomalyAlertsView />;
      case '라이브 스트림':
        return <LiveStreamView />;
      default:
        return <AnomalyAlertsView />;
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">{activeSubView.replace(' > ', ' - ')}</h2>
      {renderContent()}
    </div>
  );
};

export default ShmMonitorView;
