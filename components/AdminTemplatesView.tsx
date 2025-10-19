import React, { useState } from 'react';
import { MOCK_REPORT_TEMPLATES, MOCK_ALERT_TEMPLATES } from '../constants';
import { ReportTemplate, AlertTemplate } from '../types';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-slate-800 border border-slate-700 rounded-lg shadow-lg ${className}`}>
      {children}
    </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-base font-semibold rounded-t-lg border-b-2 transition-colors ${
            active ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'
        }`}
    >
        {children}
    </button>
);

const ReportTemplateEditor: React.FC<{ template: ReportTemplate, onSave: (t: ReportTemplate) => void }> = ({ template: initialTemplate, onSave }) => {
    const [template, setTemplate] = useState(initialTemplate);

    const handleSectionChange = (index: number, value: string) => {
        const newSections = [...template.sections];
        newSections[index] = value;
        setTemplate(t => ({...t, sections: newSections}));
    };
    
    const placeholders = ['{{project_name}}', '{{asset_name}}', '{{inspection_date}}', '{{author_name}}', '{{shm_summary}}'];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                <div>
                    <label className="text-base font-medium text-slate-300">템플릿 이름</label>
                    <input type="text" value={template.name} onChange={e => setTemplate(t => ({...t, name: e.target.value}))} className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-md" />
                </div>
                <div>
                    <label className="text-base font-medium text-slate-300">보고서 목차 (섹션)</label>
                    {template.sections.map((section, index) => (
                         <input key={index} type="text" value={section} onChange={e => handleSectionChange(index, e.target.value)} className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-md" />
                    ))}
                </div>
                 <div>
                    <label className="text-base font-medium text-slate-300">AI 스타일 가이드</label>
                    <select value={template.aiStyleGuide} onChange={e => setTemplate(t => ({...t, aiStyleGuide: e.target.value}))} className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-md">
                        <option>간결/전문가체</option>
                        <option>상세/설명조</option>
                    </select>
                </div>
                <div>
                    <label className="text-base font-medium text-slate-300">결재란</label>
                    <input type="text" value={template.approvalBox} onChange={e => setTemplate(t => ({...t, approvalBox: e.target.value}))} className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-md" placeholder="예: 작성-검토-승인" />
                </div>
            </div>
            <div className="md:col-span-1 bg-slate-700/50 p-4 rounded-lg">
                <h4 className="font-semibold text-base text-slate-200">사용 가능 변수</h4>
                <p className="text-sm text-slate-400 mb-2">본문에 삽입 시 자동으로 데이터가 채워집니다.</p>
                <div className="space-y-1">
                    {placeholders.map(p => <code key={p} className="text-sm block bg-slate-900 text-slate-300 p-1 rounded">{p}</code>)}
                </div>
            </div>
        </div>
    );
};

const AlertTemplateEditor: React.FC<{ templates: AlertTemplate[], onSave: (ts: AlertTemplate[]) => void }> = ({ templates: initialTemplates, onSave }) => {
    const [templates, setTemplates] = useState(initialTemplates);

    const handleTemplateChange = (index: number, field: keyof AlertTemplate, value: string) => {
        const newTemplates = [...templates];
        // @ts-ignore
        newTemplates[index][field] = value;
        setTemplates(newTemplates);
    };

    const placeholders = ['{{asset_name}}', '{{sensor_id}}', '{{current_value}}', '{{threshold_value}}', '{{unit}}'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates.map((template, index) => (
                <div key={index} className="space-y-4 border border-slate-700 p-4 rounded-lg bg-slate-900/50">
                    <h4 className="font-bold text-lg text-slate-100">{template.channel.toUpperCase()} / {template.level}</h4>
                     <div>
                        <label className="text-base font-medium text-slate-300">제목</label>
                        <input type="text" value={template.subject} onChange={e => handleTemplateChange(index, 'subject', e.target.value)} className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-md" />
                    </div>
                     <div>
                        <label className="text-base font-medium text-slate-300">본문</label>
                        <textarea rows={5} value={template.body} onChange={e => handleTemplateChange(index, 'body', e.target.value)} className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-md" />
                    </div>
                    <div className="bg-slate-700/50 p-2 rounded-md">
                        <p className="text-sm text-slate-400 mb-1">사용 가능 변수: {placeholders.join(', ')}</p>
                        <p className="text-sm text-slate-300 font-mono border-t border-slate-600 pt-2 mt-2"><b>미리보기:</b> {template.body.replace('{{asset_name}}', '한강교 A3 교각').replace('{{current_value}}', '9.1').replace('{{threshold_value}}', '8.0')}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};


const AdminTemplatesView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'report' | 'alert'>('report');
    
    const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>(MOCK_REPORT_TEMPLATES);
    const [alertTemplates, setAlertTemplates] = useState<AlertTemplate[]>(MOCK_ALERT_TEMPLATES);

    return (
        <div className="space-y-8">
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-4xl font-bold text-slate-100">템플릿 관리</h2>
                    <div className="relative group">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500 hover:text-indigo-400 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 p-3 bg-slate-800 text-slate-200 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 border border-slate-700">
                            <h4 className="font-bold mb-1 border-b border-slate-700 pb-1">템플릿 관리 도움말</h4>
                            <p className="mt-2">
                                이 페이지에서는 시스템에서 자동으로 생성되는 AI 리포트와 이상 상황 알림의 표준 양식을 관리합니다. 일관된 템플릿을 사용하면 모든 보고서와 알림이 전문적인 형식과 필수 정보를 갖추도록 보장할 수 있습니다.
                            </p>
                            <ul className="mt-2 space-y-1 list-disc list-inside">
                                <li><strong>AI 리포트 템플릿:</strong> AI가 생성하는 정기/긴급 점검 보고서의 목차, 스타일, 결재란 등을 정의합니다. <code>{'{{asset_name}}'}</code>과 같은 변수를 사용하여 동적으로 데이터를 삽입할 수 있습니다.</li>
                                <li><strong>자동 알림 템플릿:</strong> 센서 임계값 초과 시 발송되는 이메일, SMS 등의 제목과 본문 양식을 설정합니다.</li>
                            </ul>
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-slate-800"></div>
                        </div>
                    </div>
                </div>
                <p className="mt-1 text-lg text-slate-400">AI 리포트 및 자동 알림의 표준 양식을 설정합니다.</p>
            </div>

            <Card className="p-0">
                <div className="px-6 border-b border-slate-700">
                    <TabButton active={activeTab === 'report'} onClick={() => setActiveTab('report')}>AI 리포트 템플릿</TabButton>
                    <TabButton active={activeTab === 'alert'} onClick={() => setActiveTab('alert')}>자동 알림 템플릿</TabButton>
                </div>
                
                <div className="p-6">
                    {activeTab === 'report' && (
                        <ReportTemplateEditor 
                            template={reportTemplates[0]} 
                            onSave={() => {}} 
                        />
                    )}
                    {activeTab === 'alert' && (
                        <AlertTemplateEditor 
                            templates={alertTemplates}
                            onSave={() => {}}
                        />
                    )}
                </div>
                
                <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700 flex justify-end">
                    <button className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md text-base hover:bg-indigo-500">변경사항 저장</button>
                </div>
            </Card>
        </div>
    );
};

export default AdminTemplatesView;