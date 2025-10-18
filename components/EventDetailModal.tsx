
import React, { useMemo } from 'react';
// FIX: Changed import path to be relative.
import { EventLogEntry } from '../types';
import { LineChart } from './LineChart';

interface EventDetailModalProps {
  event: EventLogEntry | null;
  onClose: () => void;
}

const getLevelAppearance = (level: EventLogEntry['level']) => {
  switch (level) {
    case '위험': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500/50' };
    case '경고': return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-500/50' };
    case '주의': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500/50' };
    case '정보': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500/50' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500/50' };
  }
};

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
  const chartData = useMemo(() => {
    if (!event || !event.value || event.sensorId === 'N/A') return [];
    
    const baseValue = event.threshold * 0.8;
    const peak = event.value * 1.05; // Make the peak slightly higher for visual effect
    const data = Array.from({ length: 21 }, (_, i) => {
        let value;
        const position = i / 10; // 0 to 2
        if (position <= 1) { // Ramp up
            value = baseValue + (peak - baseValue) * (position);
        } else { // Ramp down
            value = peak - (peak - baseValue) * (position - 1) * 0.7;
        }
        // Add some noise
        value += (Math.random() - 0.5) * (peak - baseValue) * 0.1;

        return {
            label: `T-${10 - i}m`,
            value: parseFloat(value.toFixed(3))
        };
    });
    return data;
  }, [event]);

  if (!event) return null;
  
  const appearance = getLevelAppearance(event.level);
  const isSensorEvent = event.sensorId !== 'N/A';

  const getAiSummary = () => {
    if (!isSensorEvent) {
        return {
            title: "정보성 이벤트",
            message: "관리 시스템에서 생성된 정보성 이벤트입니다. '신규 점검 리포트 제출'은 담당자의 검토 및 승인 프로세스가 필요함을 의미합니다. 관련 문서를 확인해주십시오."
        }
    }
    switch (event.level) {
        case '경고':
            return {
                title: "AI 분석 요약: 즉시 검토 필요",
                message: `[${event.sensorId}] 센서에서 '${event.level}' 임계값(${event.threshold}${event.unit})을 초과한 ${event.value}${event.unit} 값이 감지되었습니다. 이는 구조물에 비정상적인 하중이 작용했거나, 외부 환경의 급격한 변화가 원인일 수 있습니다. 데이터 추세 분석 결과, 단기적인 급등 패턴이 관찰되므로 즉각적인 원인 파악 및 현장 점검을 강력히 권고합니다.`
            }
        case '주의':
            return {
                title: "AI 분석 요약: 지속적인 모니터링 필요",
                message: `[${event.sensorId}] 센서 값이 '${event.level}' 임계값(${event.threshold}${event.unit})에 근접하고 있습니다. 현재 측정값은 ${event.value}${event.unit}입니다. 즉각적인 위험은 낮으나, 손상으로 발전할 수 있는 초기 징후일 가능성이 있습니다. 해당 센서의 데이터를 집중적으로 모니터링하고, 다음 정기 점검 시 주의 깊게 확인할 것을 권고합니다.`
            }
        default:
            return {
                title: "정보성 이벤트",
                message: "시스템에서 생성된 정보성 이벤트입니다."
            }
    }
  }
  const aiSummary = getAiSummary();

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${appearance.bg} ${appearance.text}`}>{event.level}</span>
              <h2 className="text-lg font-bold text-gray-800 truncate">이벤트 상세: {event.event}</h2>
            </div>
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors" aria-label="닫기">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          {/* Body */}
          <div className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2">AI 분석 요약</h3>
                <div className={`p-3 rounded-md border ${appearance.bg} ${appearance.border}`}>
                    <h4 className={`font-semibold text-sm ${appearance.text}`}>{aiSummary.title}</h4>
                    <p className={`mt-1 text-sm ${appearance.text} text-opacity-90`}>{aiSummary.message}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3">이벤트 상세 정보</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex"><dt className="w-24 text-gray-500">이벤트 ID</dt><dd className="font-mono text-gray-700">{event.id}</dd></div>
                  <div className="flex"><dt className="w-24 text-gray-500">발생 시각</dt><dd className="font-medium text-gray-700">{event.time}</dd></div>
                  <div className="flex"><dt className="w-24 text-gray-500">대상 자산</dt><dd className="font-medium text-gray-700">{event.asset} ({event.assetId})</dd></div>
                  {isSensorEvent && (
                    <>
                    <div className="flex"><dt className="w-24 text-gray-500">관련 센서</dt><dd className="font-mono text-gray-700">{event.sensorId}</dd></div>
                    <div className="flex items-baseline"><dt className="w-24 text-gray-500">측정값</dt><dd className={`font-mono font-bold text-xl ${appearance.text}`}>{event.value.toLocaleString()}<span className="text-sm ml-1 font-sans text-gray-500">{event.unit}</span></dd></div>
                    <div className="flex items-baseline"><dt className="w-24 text-gray-500">임계값</dt><dd className="font-mono font-semibold text-lg text-orange-600">{event.threshold.toLocaleString()}<span className="text-sm ml-1 font-sans text-gray-500">{event.unit}</span></dd></div>
                    </>
                  )}
                  <div className="flex"><dt className="w-24 text-gray-500">상태</dt><dd className="font-semibold text-blue-600">New</dd></div>
                </dl>
              </div>
            </div>
            {/* Right Column */}
            <div className="space-y-6">
                {isSensorEvent ? (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-2">이벤트 전후 센서 데이터 (추정)</h3>
                        <LineChart data={chartData} threshold={event.threshold} eventIndex={10} unit={event.unit} width={380} height={200} />
                    </div>
                ) : <div />}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-3">대응 및 조치</h3>
                    <div className="flex flex-col space-y-2">
                        <button className="w-full text-left p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold">확인 (Acknowledge)</button>
                        <button className="w-full text-left p-3 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-semibold">작업 지시 생성</button>
                        <button className="w-full text-left p-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm font-semibold">상세 분석 요청...</button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
