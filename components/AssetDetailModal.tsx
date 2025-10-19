
import React, { useMemo, useState } from 'react';
// FIX: Changed import paths to be relative.
import { Asset, SensorReading } from '../types';
import { MOCK_THRESHOLDS_DEFAULT, MOCK_ASSET_EVENT_LOG } from '../constants';
import { CctvDetailModal } from './CctvDetailModal';

type HealthStatus = '정상' | '주의' | '경고' | '위험';

const getStatusFromShi = (shi: number): HealthStatus => {
  if (shi < 60) return '위험';
  if (shi < 80) return '경고';
  if (shi < 95) return '주의';
  return '정상';
};

const getStatusColor = (status: HealthStatus): { bg: string; text: string; } => {
  switch (status) {
    case '위험': return { bg: 'bg-red-500/10', text: 'text-red-400' };
    case '경고': return { bg: 'bg-orange-500/10', text: 'text-orange-400' };
    case '주의': return { bg: 'bg-yellow-500/10', text: 'text-yellow-400' };
    default: return { bg: 'bg-green-500/10', text: 'text-green-400' };
  }
};

const getStatusColorDot = (status: HealthStatus): string => {
  switch (status) {
    case '위험': return 'bg-red-500';
    case '경고': return 'bg-orange-500';
    case '주의': return 'bg-yellow-400';
    default: return 'bg-green-500';
  }
}

const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
    if (data.length < 2) return null;

    const width = 120;
    const height = 25;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min === 0 ? 1 : max - min;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    const lastVal = data[data.length - 1];
    const firstVal = data[0];
    const color = lastVal > firstVal ? 'stroke-red-500' : 'stroke-indigo-400';

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-28 h-6" preserveAspectRatio="none">
            <polyline points={points} fill="none" className={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
};

const ShiGauge: React.FC<{ value: number }> = ({ value }) => {
    const status = getStatusFromShi(value);
    const colorClass = getStatusColorDot(status);

    return (
        <div className="relative w-48 h-24 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 160 80">
                <path d="M 10 70 A 60 60 0 0 1 150 70" fill="none" strokeWidth="16" className="text-slate-700" strokeLinecap="round" />
                 <path 
                    d="M 10 70 A 60 60 0 0 1 150 70" 
                    fill="none" 
                    strokeWidth="16" 
                    className={colorClass.replace('bg-','stroke-')} 
                    strokeDasharray="188.5"
                    strokeDashoffset={188.5 - (value/100 * 188.5)}
                    strokeLinecap="round" 
                />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pt-4">
                 <span className="text-5xl font-bold text-slate-100">{value.toFixed(1)}</span>
                 <span className={`text-base font-semibold px-2.5 py-0.5 rounded-full ${getStatusColor(status).bg} ${getStatusColor(status).text}`}>
                    {status}
                 </span>
            </div>
        </div>
    );
};

interface AssetDetailModalProps {
  asset: Asset | null;
  allReadings: SensorReading[];
  onClose: () => void;
  onToggleMinimize: () => void;
  isMinimized: boolean;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ asset, allReadings, onClose, onToggleMinimize, isMinimized }) => {
  const [isCctvModalOpen, setIsCctvModalOpen] = useState(false);
  
  const assetReadings = useMemo(() => {
    if (!asset) return [];
    return allReadings.filter(r => r.asset_id === asset.asset_id);
  }, [asset, allReadings]);
  
  const { latestReadings, trendReadings } = useMemo(() => {
    if (!asset) return { latestReadings: {}, trendReadings: {} };
    
    const latest: { [key: string]: SensorReading } = {};
    const trends: { [key: string]: number[] } = {};
    
    asset.sensors.forEach(sensor => {
      const sensorReadings = assetReadings
        .filter(r => r.sensor_id === sensor.sensor_id)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      if (sensorReadings.length > 0) {
        latest[sensor.sensor_id] = sensorReadings[sensorReadings.length - 1];
        trends[sensor.sensor_id] = sensorReadings.slice(-7).map(r => r.value);
      }
    });
    return { latestReadings: latest, trendReadings: trends };
  }, [asset, assetReadings]);

  const { shi, criticalSensorInfo } = useMemo(() => {
    if (!asset) return { shi: 100, criticalSensorInfo: null };

    let maxExceededRatio = 0;
    let critInfo: { type: string, value: number, threshold: number, status: HealthStatus } | null = null;
    
    Object.values(latestReadings).forEach((reading: SensorReading) => {
        const sensor = asset.sensors.find(s => s.sensor_id === reading.sensor_id);
        if (sensor) {
            const thresholds = MOCK_THRESHOLDS_DEFAULT[sensor.type];
            if (thresholds && reading.value > thresholds.warning) {
                const ratio = (reading.value - thresholds.warning) / (thresholds.critical - thresholds.warning);
                if (ratio > maxExceededRatio) {
                    maxExceededRatio = Math.max(0, ratio);
                    const status = reading.value >= thresholds.critical ? '위험' : '경고';
                    critInfo = { type: sensor.type, value: reading.value, threshold: thresholds.critical, status };
                }
            }
        }
    });

    return { 
        shi: (1 - Math.min(maxExceededRatio, 1) * 0.5) * 100, 
        criticalSensorInfo: critInfo 
    };
  }, [asset, latestReadings]);

  if (!asset) return null;

  const assetEventLog = MOCK_ASSET_EVENT_LOG[asset.asset_id] || [];
  
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggleMinimize}
          className="bg-slate-800 p-4 rounded-lg shadow-lg flex items-center gap-3 text-lg font-bold text-slate-100 hover:bg-slate-700 border border-slate-600"
        >
          <span className={`w-3 h-3 rounded-full ${getStatusColorDot(getStatusFromShi(shi))}`}></span>
          {asset.name}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 1v-4m0 0h-4m4 0l-5 5" /></svg>
        </button>
      </div>
    );
  }
  
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-40" onClick={onClose}></div>
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-slate-900 shadow-2xl z-50 flex flex-col animate-slide-in-from-right">
        {/* Header */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
          <div>
            <p className="text-sm text-indigo-400 font-semibold">자산 상세 정보</p>
            <h2 className="text-2xl font-bold text-slate-100">{asset.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onToggleMinimize} className="p-2 text-slate-400 hover:bg-slate-700 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg></button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-700 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          {/* Summary */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-slate-100 text-lg">종합 건전성 지수 (SHI)</h3>
              <p className="text-base text-slate-400 max-w-xs">모든 센서 데이터를 종합하여<br />자산의 현재 건전성 상태를 나타냅니다.</p>
              {criticalSensorInfo && (
                <div className={`mt-3 p-2 rounded-md text-sm ${getStatusColor(criticalSensorInfo.status).bg} ${getStatusColor(criticalSensorInfo.status).text}`}>
                  <strong>주요 이상:</strong> <span className="font-mono">{criticalSensorInfo.type} {criticalSensorInfo.value.toFixed(2)} (임계값: {criticalSensorInfo.threshold})</span>
                </div>
              )}
            </div>
            <ShiGauge value={shi} />
          </div>

          {/* Sensor Details */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
                <h3 className="font-bold text-slate-100 text-lg">센서 상세 현황</h3>
                <button 
                  onClick={() => setIsCctvModalOpen(true)}
                  className="flex items-center gap-2 text-sm text-slate-300 bg-slate-700 px-3 py-1 rounded-full hover:bg-slate-600 hover:text-white transition-all transform hover:scale-105" 
                  aria-label="실시간 CCTV 영상 보기"
                >
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </div>
                    Live CCTV
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </button>
            </div>
            <div className="space-y-3">
              {asset.sensors.map(sensor => {
                const reading = latestReadings[sensor.sensor_id];
                const thresholds = MOCK_THRESHOLDS_DEFAULT[sensor.type];
                const trend = trendReadings[sensor.sensor_id] || [];

                let status: HealthStatus = '정상';
                if (reading && thresholds) {
                  if (reading.value >= thresholds.critical) status = '위험';
                  else if (reading.value >= thresholds.warning) status = '경고';
                }
                const statusColor = getStatusColor(status);
                
                return (
                  <div key={sensor.sensor_id} className="grid grid-cols-4 items-center gap-4 text-base p-2 rounded-md bg-slate-900/70">
                    <div className="font-medium capitalize text-slate-300">{sensor.type}</div>
                    <div className="text-right">
                      {reading ? (
                        <>
                          <span className={`font-mono font-bold text-lg ${statusColor.text}`}>{reading.value.toFixed(2)}</span>
                          <span className="text-base ml-1 text-slate-400">{sensor.unit}</span>
                        </>
                      ) : <span className="text-slate-500">N/A</span>}
                    </div>
                    <div className="flex justify-end">{trend.length > 0 && <Sparkline data={trend} />}</div>
                    <div className={`font-semibold text-right ${statusColor.text}`}>{status}</div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Asset Info & Event Log */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <h3 className="font-bold text-slate-100 text-lg mb-3">자산 정보</h3>
              <dl className="space-y-2 text-base">
                 <div className="flex"><dt className="w-24 text-slate-400">자산 ID</dt><dd className="font-mono text-slate-300">{asset.asset_id}</dd></div>
                 <div className="flex"><dt className="w-24 text-slate-400">유형</dt><dd className="text-slate-300">{asset.type}</dd></div>
                 <div className="flex"><dt className="w-24 text-slate-400">준공년도</dt><dd className="text-slate-300">{asset.design.year}</dd></div>
                 <div className="flex"><dt className="w-24 text-slate-400">주요 자재</dt><dd className="text-slate-300">{asset.design.material}</dd></div>
                 <div className="flex"><dt className="w-24 text-slate-400">태그</dt><dd className="flex flex-wrap gap-1">{asset.tags.map(t => <span key={t} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{t}</span>)}</dd></div>
              </dl>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <h3 className="font-bold text-slate-100 text-lg mb-3">최근 이력</h3>
              <ul className="space-y-2">
                {assetEventLog.length > 0 ? assetEventLog.map((log, i) => (
                  <li key={i} className="text-base">
                    <span className={`font-semibold ${log.type === 'Alert' ? 'text-orange-400' : 'text-slate-200'}`}>{log.description}</span>
                    <p className="text-sm text-slate-500">{log.date}</p>
                  </li>
                )) : <p className="text-base text-slate-500">최근 이벤트가 없습니다.</p>}
              </ul>
            </div>
          </div>

        </div>
      </div>
      {isCctvModalOpen && <CctvDetailModal asset={asset} onClose={() => setIsCctvModalOpen(false)} />}
    </>
  );
};
