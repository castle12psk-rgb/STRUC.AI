import React, { useState, useMemo } from 'react';
// FIX: Changed import paths to be relative.
import { MOCK_THRESHOLDS_DEFAULT, MOCK_PROJECTS, MOCK_NOTIFICATION_POLICIES } from '../constants';
import { Thresholds, ThresholdSetting, NotificationPolicies, RecipientRole, NotificationChannel, NotificationPolicySetting, SensorType } from '../types';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
  <button
    type="button"
    className={`${
      checked ? 'bg-blue-600' : 'bg-gray-200'
    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
    onClick={() => onChange(!checked)}
  >
    <span
      className={`${
        checked ? 'translate-x-5' : 'translate-x-0'
      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
    />
  </button>
);


const AdminThresholdsView: React.FC = () => {
  // Global policies state
  const [globalThresholds, setGlobalThresholds] = useState<Thresholds>(MOCK_THRESHOLDS_DEFAULT);
  const [editedGlobalThresholds, setEditedGlobalThresholds] = useState<Thresholds>(JSON.parse(JSON.stringify(MOCK_THRESHOLDS_DEFAULT)));

  // Project overrides state
  const [projectOverrides, setProjectOverrides] = useState<{ [key: string]: Partial<Thresholds> }>({
    'STRUC-PLANT-002': {
      'temperature': { warning: 70, critical: 85, filter: 'kalman', active: true }
    }
  });
  const [editedProjectOverrides, setEditedProjectOverrides] = useState(JSON.parse(JSON.stringify(projectOverrides)));
  const [selectedProjectId, setSelectedProjectId] = useState(MOCK_PROJECTS[0].id);
  
  // Notification policies state
  const [notificationPolicies, setNotificationPolicies] = useState<NotificationPolicies>(MOCK_NOTIFICATION_POLICIES);
  const [editedNotificationPolicies, setEditedNotificationPolicies] = useState<NotificationPolicies>(JSON.parse(JSON.stringify(MOCK_NOTIFICATION_POLICIES)));
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');

  const handleGlobalChange = (sensorType: keyof Thresholds, field: keyof ThresholdSetting, value: any) => {
    setEditedGlobalThresholds(prev => ({
        ...prev,
        [sensorType]: { ...prev[sensorType], [field]: value }
    }));
  };
  
  const handleProjectOverrideChange = (sensorType: keyof Thresholds, field: keyof ThresholdSetting, value: any) => {
    setEditedProjectOverrides((prev: { [key: string]: Partial<Thresholds> }) => {
      const newOverrides = JSON.parse(JSON.stringify(prev));
      if (!newOverrides[selectedProjectId]) newOverrides[selectedProjectId] = {};
      if (!newOverrides[selectedProjectId][sensorType]) {
        // When enabling override for the first time, copy global as base
        newOverrides[selectedProjectId][sensorType] = { ...globalThresholds[sensorType] };
      }
      newOverrides[selectedProjectId][sensorType]![field] = value;
      return newOverrides;
    });
  };

  const toggleProjectOverride = (sensorType: keyof Thresholds) => {
     setEditedProjectOverrides((prev: { [key: string]: Partial<Thresholds> }) => {
      const newOverrides = JSON.parse(JSON.stringify(prev));
      if (newOverrides[selectedProjectId]?.[sensorType]) {
        delete newOverrides[selectedProjectId][sensorType];
        if(Object.keys(newOverrides[selectedProjectId]).length === 0) {
            delete newOverrides[selectedProjectId];
        }
      } else {
         if (!newOverrides[selectedProjectId]) newOverrides[selectedProjectId] = {};
         newOverrides[selectedProjectId][sensorType] = { ...globalThresholds[sensorType] };
      }
      return newOverrides;
    });
  };
  
  const handleNotificationChange = (level: 'warning' | 'critical', field: keyof NotificationPolicySetting, value: any) => {
    setEditedNotificationPolicies(prev => ({
      ...prev,
      [level]: { ...prev[level], [field]: value }
    }));
  };

  const handleSave = (section: string) => {
    // In a real app, this would be an API call per section.
    if (section === 'global') setGlobalThresholds(editedGlobalThresholds);
    if (section === 'project') setProjectOverrides(editedProjectOverrides);
    if (section === 'notification') setNotificationPolicies(editedNotificationPolicies);
    
    setUpdateSuccess(`${section} settings updated successfully!`);
    setTimeout(() => setUpdateSuccess(''), 3000);
  };
  
  const recipientRoles: { id: RecipientRole, name: string }[] = [
    { id: 'pm', name: 'Project Manager' },
    { id: 'engineer', name: 'Structural Engineer' },
    { id: 'inspector', name: 'Field Inspector' },
    { id: 'senior_manager', name: 'Senior Manager' }
  ];

  const notificationChannels: { id: NotificationChannel, name: string }[] = [
    { id: 'dashboard', name: 'System Dashboard' },
    { id: 'email', name: 'Email' },
    { id: 'sms', name: 'SMS' },
    { id: 'push', name: 'Mobile App Push' }
  ];


  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-gray-900">임계값 및 정책</h2>
            <div className="relative group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 hover:text-blue-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-96 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                    <h4 className="font-bold mb-1 border-b pb-1">임계값 및 정책 도움말</h4>
                    <p className="mt-2">
                        이 페이지는 자동화된 SHM(구조물 건전성 모니터링) 시스템의 핵심 규칙을 정의합니다.
                    </p>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                        <li><strong>전역 임계값 정책:</strong> 모든 프로젝트에 기본으로 적용되는 센서 데이터의 '주의' 및 '경고' 기준값입니다. 이는 시스템 전체의 안전 기준선 역할을 합니다.</li>
                        <li><strong>프로젝트별 재정의 (Override):</strong> 특정 교량이나 플랜트처럼 고유한 특성을 가진 자산에 대해 전역 정책 대신 특별한 임계값을 설정하는 기능입니다.</li>
                        <li><strong>알림 및 통보 정책:</strong> 임계값이 초과되었을 때, 어떤 등급의 담당자에게 어떤 채널(대시보드, 이메일, SMS 등)로 알림을 보낼지, 그리고 미확인 시 어떻게 에스컬레이션할지 결정합니다. 이는 신속하고 정확한 초기 대응을 보장하는 데 필수적입니다.</li>
                    </ul>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-gray-800"></div>
                </div>
            </div>
        </div>
        <p className="mt-1 text-gray-600">전사 표준 정책과 프로젝트별 특별 정책을 설정하여 모니터링 및 알림 규칙을 관리합니다.</p>
      </div>
      
      {/* Global Thresholds */}
      <Card>
        <h3 className="text-xl font-bold text-gray-800 mb-1">전역 임계값 정책</h3>
        <p className="text-sm text-gray-500 mb-4">모든 프로젝트에 기본으로 적용되는 표준 임계값입니다.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-2">센서 유형</th>
                <th className="px-4 py-2">데이터 필터</th>
                <th className="px-4 py-2 text-right">주의 (Warning)</th>
                <th className="px-4 py-2 text-right">경고 (Critical)</th>
                <th className="px-4 py-2 text-center">활성화 상태</th>
              </tr>
            </thead>
            <tbody>
              {/* FIX: Use Object.keys with type casting to preserve type information during iteration. */}
              {(Object.keys(editedGlobalThresholds) as Array<keyof Thresholds>).map((type) => {
                const values = editedGlobalThresholds[type];
                return (
                <tr key={type} className="border-b">
                  <td className="px-4 py-2 font-medium capitalize">{type}</td>
                  <td className="px-4 py-2">
                    <select value={values.filter} onChange={(e) => handleGlobalChange(type, 'filter', e.target.value)} className="w-40 border-gray-300 rounded-md text-sm p-1">
                      <option value="raw">Raw Data</option>
                      <option value="moving_avg_5m">Moving Average (5min)</option>
                      <option value="kalman">Kalman Filter</option>
                    </select>
                  </td>
                  <td className="px-4 py-2"><input type="number" step="0.01" value={values.warning} onChange={e => handleGlobalChange(type, 'warning', parseFloat(e.target.value))} className="w-24 text-right border-gray-300 rounded-md p-1" /></td>
                  <td className="px-4 py-2"><input type="number" step="0.01" value={values.critical} onChange={e => handleGlobalChange(type, 'critical', parseFloat(e.target.value))} className="w-24 text-right border-gray-300 rounded-md p-1" /></td>
                  <td className="px-4 py-2 text-center"><ToggleSwitch checked={values.active} onChange={checked => handleGlobalChange(type, 'active', checked)} /></td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
            <button onClick={() => handleSave('global')} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md text-sm">전역 정책 저장</button>
        </div>
      </Card>
      
      {/* Project Overrides */}
      <Card>
        <h3 className="text-xl font-bold text-gray-800 mb-1">프로젝트별 재정의 (Override)</h3>
        <p className="text-sm text-gray-500 mb-4">특정 프로젝트의 고유 환경을 반영하여 표준 임계값을 재정의합니다.</p>
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">대상 프로젝트: </label>
          <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="ml-2 border-gray-300 rounded-md p-2 text-sm">
            {MOCK_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-2">센서 유형</th>
                <th className="px-4 py-2">정책</th>
                <th className="px-4 py-2">데이터 필터</th>
                <th className="px-4 py-2 text-right">주의 (Warning)</th>
                <th className="px-4 py-2 text-right">경고 (Critical)</th>
                <th className="px-4 py-2 text-center">재정의 활성화</th>
              </tr>
            </thead>
            <tbody>
              {/* FIX: Use Object.keys with type casting to preserve type information during iteration. */}
              {(Object.keys(globalThresholds) as Array<keyof Thresholds>).map((type) => {
                const globalValues = globalThresholds[type];
                const overriddenValues = editedProjectOverrides[selectedProjectId]?.[type];
                const isOverridden = !!overriddenValues;
                const values = isOverridden ? overriddenValues : globalValues;
                return (
                 <tr key={type} className={`border-b ${isOverridden ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-2 font-medium capitalize">{type}</td>
                    <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${isOverridden ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>
                            {isOverridden ? 'Project Override' : 'Global Default'}
                        </span>
                    </td>
                    <td className="px-4 py-2">
                      <select disabled={!isOverridden} value={values.filter} onChange={(e) => handleProjectOverrideChange(type, 'filter', e.target.value)} className="w-40 border-gray-300 rounded-md text-sm p-1 disabled:bg-gray-100 disabled:text-gray-500">
                         <option value="raw">Raw Data</option>
                         <option value="moving_avg_5m">Moving Average (5min)</option>
                         <option value="kalman">Kalman Filter</option>
                      </select>
                    </td>
                    <td className="px-4 py-2"><input type="number" step="0.01" disabled={!isOverridden} value={values.warning} onChange={e => handleProjectOverrideChange(type, 'warning', parseFloat(e.target.value))} className="w-24 text-right border-gray-300 rounded-md p-1 disabled:bg-gray-100 disabled:text-gray-500"/></td>
                    <td className="px-4 py-2"><input type="number" step="0.01" disabled={!isOverridden} value={values.critical} onChange={e => handleProjectOverrideChange(type, 'critical', parseFloat(e.target.value))} className="w-24 text-right border-gray-300 rounded-md p-1 disabled:bg-gray-100 disabled:text-gray-500"/></td>
                    <td className="px-4 py-2 text-center"><ToggleSwitch checked={isOverridden} onChange={() => toggleProjectOverride(type)} /></td>
                 </tr>
                )
              })}
            </tbody>
           </table>
        </div>
        <div className="mt-4 flex justify-end">
            <button onClick={() => handleSave('project')} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md text-sm">프로젝트 정책 저장</button>
        </div>
      </Card>
      
      {/* Notification Policies */}
      <Card>
        <h3 className="text-xl font-bold text-gray-800 mb-1">알림 및 통보 정책</h3>
        <p className="text-sm text-gray-500 mb-4">이상 상황 발생 시 알림을 받을 대상과 채널을 설정합니다.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* FIX: Use Object.keys with type casting to preserve type information during iteration. */}
            {(Object.keys(editedNotificationPolicies) as Array<keyof NotificationPolicies>).map((level) => {
                const policy = editedNotificationPolicies[level];
                return (
                <div key={level} className={`p-4 rounded-lg ${level === 'critical' ? 'bg-red-50' : 'bg-orange-50'}`}>
                    <h4 className={`text-lg font-bold ${level === 'critical' ? 'text-red-700' : 'text-orange-700'}`}>{level === 'critical' ? '위험 (Critical) 단계' : '경고 (Warning) 단계'}</h4>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="font-semibold text-sm text-gray-700">수신 그룹</label>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {recipientRoles.map(role => (
                                    <label key={role.id} className="flex items-center text-sm">
                                        <input type="checkbox"
                                          checked={policy.recipients.includes(role.id)}
                                          onChange={e => {
                                              const newRecipients = e.target.checked ? [...policy.recipients, role.id] : policy.recipients.filter(r => r !== role.id);
                                              handleNotificationChange(level, 'recipients', newRecipients);
                                          }}
                                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        <span className="ml-2 text-gray-600">{role.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                         <div>
                            <label className="font-semibold text-sm text-gray-700">알림 채널</label>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {notificationChannels.map(ch => (
                                    <label key={ch.id} className="flex items-center text-sm">
                                        <input type="checkbox"
                                          checked={policy.channels.includes(ch.id)}
                                          onChange={e => {
                                              const newChannels = e.target.checked ? [...policy.channels, ch.id] : policy.channels.filter(c => c !== ch.id);
                                              handleNotificationChange(level, 'channels', newChannels);
                                          }}
                                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        <span className="ml-2 text-gray-600">{ch.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold text-sm text-gray-700">에스컬레이션 정책</label>
                            <input type="text"
                                value={policy.escalation}
                                onChange={e => handleNotificationChange(level, 'escalation', e.target.value)}
                                placeholder="예: 15분 내 미확인 시 상급자에게 통보"
                                className="w-full mt-1 border-gray-300 rounded-md text-sm p-2"
                            />
                        </div>
                    </div>
                </div>
            )})}
        </div>
         <div className="mt-4 flex justify-end">
            <button onClick={() => handleSave('notification')} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md text-sm">알림 정책 저장</button>
        </div>
      </Card>
      
      {updateSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
            {updateSuccess}
        </div>
      )}
    </div>
  );
};

export default AdminThresholdsView;
