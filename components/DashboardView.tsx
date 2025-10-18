
import React, { useMemo } from 'react';
// FIX: Changed import paths to be relative.
import { MOCK_THRESHOLDS_DEFAULT } from '../constants';
import { Asset, SensorReading, EventLogEntry } from '../types';

type HealthStatus = '정상' | '주의' | '경고' | '위험';

const getStatusFromShi = (shi: number): HealthStatus => {
  if (shi < 60) return '위험';
  if (shi < 80) return '경고';
  if (shi < 95) return '주의';
  return '정상';
};

const getStatusColor = (status: HealthStatus): { bg: string; text: string; ring: string } => {
  switch (status) {
    case '위험': return { bg: 'bg-red-100', text: 'text-red-800', ring: 'ring-red-500/20' };
    case '경고': return { bg: 'bg-orange-100', text: 'text-orange-800', ring: 'ring-orange-500/20' };
    case '주의': return { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-500/20' };
    case '정상': return { bg: 'bg-green-100', text: 'text-green-800', ring: 'ring-green-500/20' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-800', ring: 'ring-gray-500/20' };
  }
};

const getStatusColorDot = (status: HealthStatus): string => {
  switch (status) {
    case '위험': return 'bg-red-500';
    case '경고': return 'bg-orange-500';
    case '주의': return 'bg-yellow-400';
    case '정상': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
}

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
    if (data.length < 2) return null;

    const width = 100;
    const height = 20;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min === 0 ? 1 : max - min;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    const color = data[data.length - 1] > data[0] ? 'stroke-red-500' : 'stroke-blue-500';

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-24 h-5" preserveAspectRatio="none">
            <polyline points={points} fill="none" className={color} strokeWidth="1.5" />
        </svg>
    );
};

const ShiGauge: React.FC<{ value: number }> = ({ value }) => {
    const status = getStatusFromShi(value);
    const colorClass = getStatusColorDot(status);

    return (
        <div className="relative w-28 h-14 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 120 60">
                <path d="M 10 50 A 50 50 0 0 1 110 50" fill="none" strokeWidth="12" className="text-gray-200" strokeLinecap="round" />
                <path 
                    d="M 10 50 A 50 50 0 0 1 110 50" 
                    fill="none" 
                    strokeWidth="12" 
                    className={colorClass.replace('bg-','stroke-')} 
                    strokeDasharray="157"
                    strokeDashoffset={157 - (value/100 * 157)}
                    strokeLinecap="round" 
                />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pt-2">
                 <span className="text-2xl font-bold text-gray-800">{value.toFixed(1)}</span>
                 <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(status).bg} ${getStatusColor(status).text}`}>
                    {status}
                 </span>
            </div>
        </div>
    );
};


const AssetCard: React.FC<{ asset: Asset; readings: SensorReading[]; onViewDetails: (assetId: string) => void; }> = ({ asset, readings, onViewDetails }) => {
  const assetReadings = readings.filter(r => r.asset_id === asset.asset_id);
  
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

  const shi = useMemo(() => {
    let maxExceededRatio = 0;
    Object.values(latestReadings).forEach(reading => {
      const sensor = asset.sensors.find(s => s.sensor_id === reading.sensor_id);
      if (sensor) {
        const thresholds = MOCK_THRESHOLDS_DEFAULT[sensor.type];
        if (thresholds && reading.value > thresholds.warning) {
          const ratio = (reading.value - thresholds.warning) / (thresholds.critical - thresholds.warning);
          if (ratio > maxExceededRatio) maxExceededRatio = ratio;
        }
      }
    });
    return (1 - Math.min(maxExceededRatio, 1) * 0.5) * 100;
  }, [latestReadings, asset.sensors]);
  
  const overallStatus = getStatusFromShi(shi);

  return (
    <Card className="p-5">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${getStatusColorDot(overallStatus)}`}></span>
            <h3 className="text-lg font-bold text-gray-800">{asset.name}</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">{asset.type} · {asset.location}</p>
        </div>
        <div className="flex-shrink-0">
          <ShiGauge value={shi} />
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-600 mb-2">실시간 센서 현황</h4>
        <div className="space-y-2">
          {asset.sensors.map(sensor => {
            const reading = latestReadings[sensor.sensor_id];
            if (!reading) return null;

            const thresholds = MOCK_THRESHOLDS_DEFAULT[sensor.type];
            const status = reading.value >= thresholds.critical ? '위험' : reading.value >= thresholds.warning ? '경고' : '정상';
            const color = getStatusColor(status);

            return (
              <div key={sensor.sensor_id} className="grid grid-cols-3 items-center text-sm p-2 rounded-lg bg-gray-50">
                <span className="font-medium text-gray-700 capitalize">{sensor.type}</span>
                <div className="text-right">
                  <span className={`font-mono font-semibold ${status !== '정상' ? color.text : 'text-gray-800'}`}>{reading.value.toFixed(2)}</span>
                  <span className="text-gray-500 ml-1 text-xs">{sensor.unit}</span>
                </div>
                <div className="flex justify-end">
                   {trendReadings[sensor.sensor_id] && <Sparkline data={trendReadings[sensor.sensor_id]} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-200 flex justify-between items-center text-sm">
         <p className="text-gray-500">최종 점검일: <span className="font-medium text-gray-700">{asset.last_inspection_date || 'N/A'}</span></p>
         <button onClick={() => onViewDetails(asset.asset_id)} className="font-semibold text-blue-600 hover:text-blue-800">상세보기 →</button>
      </div>
    </Card>
  );
};

interface DashboardViewProps {
  assets: Asset[];
  allReadings: SensorReading[];
  onViewDetails: (assetId: string) => void;
  onViewEventDetails: (event: EventLogEntry) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ assets, allReadings, onViewDetails, onViewEventDetails }) => {
    const { assetsInAlert } = useMemo(() => {
        let alertCount = 0;
        assets.forEach(asset => {
            const readings = allReadings.filter(r => r.asset_id === asset.asset_id);
            const isAlert = asset.sensors.some(sensor => {
                const latestReading = readings
                    .filter(r => r.sensor_id === sensor.sensor_id)
                    .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                if (!latestReading) return false;
                const thresholds = MOCK_THRESHOLDS_DEFAULT[sensor.type];
                return latestReading.value >= thresholds.warning;
            });
            if (isAlert) alertCount++;
        });
        return { assetsInAlert: alertCount };
    }, [assets, allReadings]);

    const eventLog: EventLogEntry[] = [
        { id: 'EVT-251016-001', time: '2025-10-16 09:10', assetId: 'BRG-SEOUL-001', asset: '한강교 A3 교각', event: '가속도(ACC-P3-01) 경고 임계값 초과', level: '경고', sensorId: 'ACC-P3-01', value: 0.143, threshold: 0.12, unit: 'g' },
        { id: 'EVT-251016-002', time: '2025-10-16 09:05', assetId: 'BRG-SEOUL-001', asset: '한강교 A3 교각', event: '변위(DISP-P3-02) 경고 임계값 초과', level: '경고', sensorId: 'DISP-P3-02', value: 9.1, threshold: 8.0, unit: 'mm' },
        { id: 'EVT-251016-003', time: '2025-10-16 08:30', assetId: 'BRG-SEOUL-001', asset: '한강교 A3 교각', event: '신규 점검 리포트 제출', level: '정보', sensorId: 'N/A', value: 0, threshold: 0, unit: ''},
        { id: 'EVT-251015-004', time: '2025-10-15 14:00', assetId: 'BLD-GANGNAM-007', asset: '강남파이낸스센터', event: '변형률(STRN-C-05) 주의 임계값 근접', level: '주의', sensorId: 'STRN-C-05', value: 1180, threshold: 1200, unit: 'με' },
    ];

    return (
        <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">종합 현황 대시보드</h2>
              <p className="mt-1 text-gray-600">선택된 프로젝트의 실시간 건전성 현황입니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-5">
                    <h4 className="text-sm font-semibold text-gray-500">총 관리 자산</h4>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{assets.length} <span className="text-lg font-medium">개</span></p>
                </Card>
                <Card className="p-5">
                    <h4 className="text-sm font-semibold text-gray-500">주의/경고 자산</h4>
                    <p className="text-3xl font-bold text-orange-600 mt-2">{assetsInAlert} <span className="text-lg font-medium">개</span></p>
                </Card>
                 <Card className="p-5">
                    <h4 className="text-sm font-semibold text-gray-500">진행중 리포트</h4>
                    <p className="text-3xl font-bold text-gray-800 mt-2">1 <span className="text-lg font-medium">건</span></p>
                </Card>
                <Card className="p-5">
                    <h4 className="text-sm font-semibold text-gray-500">주요 알람 (24H)</h4>
                    <p className="text-3xl font-bold text-red-600 mt-2">2 <span className="text-lg font-medium">건</span></p>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {assets.length > 0 ? (
                      assets.map(asset => (
                          <AssetCard key={asset.asset_id} asset={asset} readings={allReadings} onViewDetails={onViewDetails} />
                      ))
                    ) : (
                      <div className="lg:col-span-2">
                        <Card className="p-5 text-center text-gray-500">
                          이 프로젝트에는 등록된 자산이 없습니다.
                        </Card>
                      </div>
                    )}
                </div>
                <div className="xl:col-span-1">
                     <Card className="p-5 h-full">
                        <h3 className="text-lg font-bold text-gray-800">주요 이벤트 로그</h3>
                        <div className="mt-4 -mx-2">
                            {eventLog.map((log) => (
                                <button 
                                    key={log.id} 
                                    onClick={() => onViewEventDetails(log)}
                                    className="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                                    aria-label={`${log.asset} ${log.event} 상세 보기`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                            log.level === '경고' ? 'bg-orange-500' :
                                            log.level === '주의' ? 'bg-yellow-400' : 
                                            log.level === '위험' ? 'bg-red-500' : 'bg-blue-500'
                                        }`}></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">{log.event}</p>
                                            <p className="text-xs text-gray-500">{log.asset} · {log.time}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

        </div>
    );
};

export default DashboardView;
