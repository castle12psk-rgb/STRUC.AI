
import React, { useMemo } from 'react';
// FIX: Changed import paths to be relative.
import { Asset, SensorReading } from '../types';
import { MOCK_THRESHOLDS_DEFAULT, MOCK_ASSET_EVENT_LOG } from '../constants';

type HealthStatus = '정상' | '주의' | '경고' | '위험';

const getStatusFromShi = (shi: number): HealthStatus => {
  if (shi < 60) return '위험';
  if (shi < 80) return '경고';
  if (shi < 95) return '주의';
  return '정상';
};

const getStatusColor = (status: HealthStatus): { bg: string; text: string; } => {
  switch (status) {
    case '위험': return { bg: 'bg-red-100', text: 'text-red-800' };
    case '경고': return { bg: 'bg-orange-100', text: 'text-orange-800' };
    case '주의': return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
    default: return { bg: 'bg-green-100', text: 'text-green-800' };
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
    const color = lastVal > firstVal ? 'stroke-red-500' : 'stroke-blue-500';

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
                <path d="M 10 70 A 60 60 0 0 1 150 70" fill="none" strokeWidth="16" className="text-gray-200" strokeLinecap="round" />
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
                 <span className="text-4xl font-bold text-gray-800">{value.toFixed(1)}</span>
                 <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${getStatusColor(status).bg} ${getStatusColor(status).text}`}>
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
  if (!asset) return null;

  const assetReadings = allReadings.filter(r => r.asset_id === asset.asset_id);
  const assetEventLog = MOCK_ASSET_EVENT_LOG[asset.asset_id] || [];
  
  const { latestReadings, trendReadings } = useMemo(() => {
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
  }, [asset.sensors, assetReadings]);

  const { shi, criticalSensorInfo } = useMemo(() => {
    let maxExceededRatio = 0;
    let critInfo: { type: string, value: number, threshold: number } | null = null;
    Object.values(latestReadings).forEach(reading => {
      const sensor = asset.sensors.find(s => s.sensor_id === reading.sensor_id);
      if (sensor) {
        const thresholds = MOCK_THRESHOLDS_DEFAULT[sensor.type];
        if (thresholds && reading.value > thresholds.warning) {
          const ratio = (reading.value - thresholds.warning) / (thresholds.critical - thresholds.warning);
          if (ratio > maxExceededRatio) {
            maxExceededRatio = Math.max(0, ratio);
            critInfo = { type: sensor.type, value: reading.value, threshold: thresholds.warning };
          }
        }
      }
    });
    const calculatedShi = (1 - Math.min(maxExceededRatio, 1) * 0.5) * 100;
    return { shi: calculatedShi, criticalSensorInfo: critInfo };
  }, [latestReadings, asset.sensors]);

  const overallStatus = getStatusFromShi(shi);
  const overallStatusColor = getStatusColor(overallStatus);
  const overallStatusColorDot = getStatusColorDot(overallStatus);

  const getAiDiagnosis = () => {
    switch(overallStatus) {
      case '정상': return { title: "건전성 '정상'", message: "모든 센서 데이터가 안정적인 범위 내에 있으며, 구조물의 건전성은 '정상' 상태로 판단됩니다. 특이사항은 발견되지 않았습니다." };
      case '주의': return { title: "건전성 '주의'", message: "일부 센서에서 '주의' 수준의 변동이 감지되었으나, 아직 임계값을 초과하지는 않았습니다. 지속적인 모니터링이 권장됩니다." };
      case '경고':
      case '위험':
        const cause = criticalSensorInfo?.type === 'displacement' ? '외부 하중 증가 또는 지반 변화의 초기 징후' : '과도한 동적 하중 또는 외부 충격';
        return {
            title: `건전성 '${overallStatus}' - 즉시 검토 필요`,
            message: `종합 건전성 지수(SHI)가 ${shi.toFixed(1)}로, '${overallStatus}' 상태입니다. 특히 ${criticalSensorInfo?.type} 센서 값이 경고 임계값을 초과하여 즉각적인 주의가 필요합니다. 이는 ${cause}일 수 있으므로, 즉시 상세 데이터 분석 및 현장 점검을 권고합니다.`
        };
      default: return { title: "상태 분석 중", message: "데이터를 분석하고 있습니다." };
    }
  }
  const aiDiagnosis = getAiDiagnosis();

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg flex items-center p-2 pl-4 z-50 animate-fade-in">
        <span className={`w-2.5 h-2.5 rounded-full ${overallStatusColorDot} mr-3`}></span>
        <span className="font-semibold text-gray-800">{asset.name}</span>
        <button onClick={onToggleMinimize} className="ml-4 p-1 text-gray-500 hover:bg-gray-200 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 8a2 2 0 100 4h12a2 2 0 100-4H4z" /></svg>
        </button>
        <button onClick={onClose} className="ml-1 p-1 text-gray-500 hover:bg-gray-200 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${overallStatusColorDot}`}></span>
                <h2 className="text-xl font-bold text-gray-800">{asset.name}</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${overallStatusColor.bg} ${overallStatusColor.text}`}>{overallStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onToggleMinimize} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
              </button>
              <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          
          {/* Body */}
          <div className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-y-auto">
             <div className="lg:col-span-3 space-y-6">
                
                <div>
                  <h4 className="text-base font-semibold text-gray-700 mb-2">AI 종합 진단</h4>
                  <div className={`p-4 rounded-lg border ${overallStatusColor.bg.replace('100', '200/50').replace('bg-', 'border-')} ${overallStatusColor.bg}`}>
                      <h5 className={`font-bold ${overallStatusColor.text}`}>{aiDiagnosis.title}</h5>
                      <p className={`mt-1 text-sm ${overallStatusColor.text}`}>{aiDiagnosis.message}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-700 mb-2">실시간 센서 현황</h4>
                  <div className="space-y-2">
                    {asset.sensors.map(sensor => {
                        const reading = latestReadings[sensor.sensor_id];
                        if (!reading) return null;
                        
                        const thresholds = MOCK_THRESHOLDS_DEFAULT[sensor.type];
                        const isWarning = reading.value >= thresholds.warning;
                        const isCritical = reading.value >= thresholds.critical;
                        const valueColor = isCritical ? 'text-red-600' : isWarning ? 'text-orange-500' : 'text-gray-800';
                        const trendData = trendReadings[sensor.sensor_id];

                        return (
                            <div key={sensor.sensor_id} className="grid grid-cols-2 items-center p-3 pr-4 rounded-lg bg-white border border-gray-200/80">
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-700 capitalize">{sensor.type}</span>
                                    <span className="text-xs text-gray-500 mt-0.5">
                                      임계: {thresholds.warning.toFixed(1)} (주의) / {thresholds.critical.toFixed(1)} (경고)
                                    </span>
                                </div>
                                <div className="flex justify-end items-center gap-4">
                                    <div className="text-right">
                                        <span className={`font-mono font-semibold text-lg ${valueColor}`}>{reading.value.toFixed(2)}</span>
                                        <span className="text-gray-500 ml-1.5 text-xs">{sensor.unit}</span>
                                    </div>
                                    {sensor.type !== 'temperature' && trendData && <Sparkline data={trendData} />}
                                </div>
                            </div>
                        );
                    })}
                  </div>
                </div>
                
                <div>
                   <h4 className="text-base font-semibold text-gray-700 mb-2">주요 이력 (최근 30일)</h4>
                   <div className="bg-white border border-gray-200/80 rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
                      {assetEventLog.length > 0 ? assetEventLog.map((log, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${log.type === 'Alert' ? 'bg-orange-500' : log.type === 'Maintenance' ? 'bg-gray-500' : 'bg-blue-500'}`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{log.description}</p>
                            <p className="text-xs text-gray-500">{log.date}</p>
                          </div>
                        </div>
                      )) : <p className="text-sm text-gray-500 text-center py-4">최근 30일 내 주요 이력이 없습니다.</p>}
                   </div>
                </div>
             </div>
             
             <div className="lg:col-span-2">
                 <div className="sticky top-0 flex flex-col items-center p-4 bg-white border border-gray-200/80 rounded-lg">
                    <h4 className="text-base font-semibold text-gray-700 mb-2">종합 건전성 지수 (SHI)</h4>
                    <ShiGauge value={shi} />
                    <div className="w-full mt-4 space-y-4">
                      <h4 className="text-base font-semibold text-gray-700 border-t pt-4">자산 정보</h4>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <dt className="text-gray-500">자산 ID</dt>
                        <dd className="text-gray-800 font-mono">{asset.asset_id}</dd>
                        
                        <dt className="text-gray-500">준공년도</dt>
                        <dd className="text-gray-800">{asset.design.year}</dd>

                        <dt className="text-gray-500">주요 자재</dt>
                        <dd className="text-gray-800">{asset.design.material}</dd>
                        
                        {asset.design.seismic_grade && (<>
                            <dt className="text-gray-500">내진 등급</dt>
                            <dd className="text-gray-800">{asset.design.seismic_grade}</dd>
                        </>)}

                        {asset.design.post_tension && (<>
                            <dt className="text-gray-500">포스트텐션</dt>
                            <dd className="text-green-600 font-semibold">적용</dd>
                        </>)}
                      </dl>
                       <div className="mt-4 pt-3 border-t">
                        <h5 className="text-xs text-gray-500 mb-2">태그</h5>
                        <div className="flex flex-wrap gap-2">
                          {asset.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 text-xs text-blue-800 bg-blue-100 rounded-full font-medium">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                 </div>
             </div>
          </div>
          
          {/* Footer */}
          <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-500">최종 점검일: <span className="font-medium text-gray-700">{asset.last_inspection_date || 'N/A'}</span></p>
            <p className="text-sm text-gray-400">STRUC.AI Diagnostic Engine</p>
          </div>
        </div>
      </div>
    </>
  );
};
