import React, { useState } from 'react';
import { MOCK_MANAGED_RAG_DOCS, RAG_STATISTICS, MODEL_CONFIGURATION, MOCK_RAG_DOCS } from '../constants';
import { ManagedRagDoc } from '../types';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-4">
        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-base text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const AdminRagView: React.FC = () => {
    const [docs, setDocs] = useState<ManagedRagDoc[]>(MOCK_MANAGED_RAG_DOCS);
    const [modelConfig, setModelConfig] = useState(MODEL_CONFIGURATION);

    // QA Test Bench State
    const [testQuery, setTestQuery] = useState('');
    const [isTestLoading, setIsTestLoading] = useState(false);
    const [testResult, setTestResult] = useState<{ answer: string; sources: { id: string, snippet: string }[] } | null>(null);

    const handleTestQuery = () => {
        if (!testQuery) return;
        setIsTestLoading(true);
        setTestResult(null);
        // Simulate API call
        setTimeout(() => {
            const lowerQuery = testQuery.toLowerCase();
            if (lowerQuery.includes('균열폭')) {
                setTestResult({
                    answer: "콘크리트구조 설계기준(KBCS-2022-CH05-S7.3)에 따라, 일반적인 환경에 노출된 철근콘크리트 구조물의 허용 균열폭은 0.3mm입니다.",
                    sources: [ MOCK_RAG_DOCS[0] ]
                });
            } else {
                 setTestResult({
                    answer: "죄송합니다. 제공된 문헌에서 해당 질문에 대한 답변을 찾을 수 없습니다.",
                    sources: []
                });
            }
            setIsTestLoading(false);
        }, 1500);
    };

    const getStatusClass = (status: ManagedRagDoc['status']) => {
        switch (status) {
            case 'Indexed': return 'bg-green-100 text-green-800';
            case 'Processing': return 'bg-blue-100 text-blue-800';
            case 'Error': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };
    
    return (
         <div className="space-y-8">
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-4xl font-bold text-slate-900">AI 모델 / RAG 관리</h2>
                    <div className="relative group">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 hover:text-indigo-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-96 p-3 bg-slate-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                            <h4 className="font-bold mb-1 border-b pb-1">AI 모델 / RAG 관리 도움말</h4>
                            <p className="mt-2">
                                이 페이지는 기술자료 QA 시스템의 핵심 두뇌 역할을 하는 부분을 관리합니다.
                            </p>
                            <ul className="mt-2 space-y-1 list-disc list-inside">
                                <li>
                                    <strong>RAG (Retrieval-Augmented Generation):</strong> 사용자의 질문에 대해, 업로드된 내부 기술문서(지식 베이스)에서 가장 관련성 높은 정보를 먼저 검색(Retrieval)하고, 이 정보를 근거로 AI(LLM)가 답변을 생성(Generation)하는 기술입니다. 이를 통해 AI가 부정확한 정보를 지어내는 현상(Hallucination)을 방지하고, 신뢰성 높은 답변을 제공합니다.
                                </li>
                                <li>
                                    <strong>지식 베이스:</strong> QA 시스템이 답변의 근거로 사용하는 문서들의 집합입니다. 문서를 업로드하면, 시스템은 내용을 작은 단위(Chunk)로 분할하고 검색 가능하도록 인덱싱합니다.
                                </li>
                                 <li>
                                    <strong>모델 설정:</strong> QA 답변을 생성하는 AI 모델의 종류와 행동 지침(시스템 프롬프트)을 설정하여 답변의 톤, 전문성, 스타일을 제어합니다.
                                </li>
                            </ul>
                             <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-slate-800"></div>
                        </div>
                    </div>
                </div>
                <p className="mt-1 text-lg text-slate-600">기술자료 QA 시스템의 기반이 되는 지식 베이스(Knowledge Base)와 응답 생성 모델을 관리합니다.</p>
            </div>
            
            {/* Knowledge Base Overview */}
            <Card className="p-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">지식 베이스 현황</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="총 문서" value={RAG_STATISTICS.totalDocs} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>} />
                    <StatCard title="인덱싱 완료" value={`${RAG_STATISTICS.indexedDocs} (${(RAG_STATISTICS.indexedDocs/RAG_STATISTICS.totalDocs*100).toFixed(0)}%)`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                    <StatCard title="총 청크(Chunks)" value={RAG_STATISTICS.totalChunks.toLocaleString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>} />
                    <StatCard title="최근 동기화" value={RAG_STATISTICS.lastSync.split(' ')[1]} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9a9 9 0 0114.65-4.65l-2.4 2.4M20 15a9 9 0 01-14.65 4.65l2.4-2.4" /></svg>} />
                </div>
            </Card>

            <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b flex flex-wrap justify-between items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-800">관리 문서 목록</h3>
                    <div className="flex gap-2">
                         <button className="px-3 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md text-base hover:bg-slate-300">전체 재인덱싱</button>
                         <button className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md text-base hover:bg-indigo-700">+ 새 문서 업로드</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-base">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-slate-500 uppercase">파일 이름</th>
                                <th className="px-4 py-2 text-left font-medium text-slate-500 uppercase">상태</th>
                                <th className="px-4 py-2 text-right font-medium text-slate-500 uppercase">청크 수</th>
                                <th className="px-4 py-2 text-left font-medium text-slate-500 uppercase">임베딩 모델</th>
                                <th className="px-4 py-2 text-left font-medium text-slate-500 uppercase">업로드 날짜</th>
                                <th className="px-4 py-2 text-left font-medium text-slate-500 uppercase">관리</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {docs.map(doc => (
                                <tr key={doc.id}>
                                    <td className="px-4 py-3 font-semibold text-slate-800 font-mono">{doc.fileName}</td>
                                    <td className="px-4 py-3"><span className={`px-2 py-0.5 text-sm font-semibold rounded-full ${getStatusClass(doc.status)} ${doc.status === 'Processing' ? 'animate-pulse' : ''}`}>{doc.status}</span></td>
                                    <td className="px-4 py-3 text-right font-mono">{doc.chunkCount > 0 ? doc.chunkCount.toLocaleString() : '-'}</td>
                                    <td className="px-4 py-3 font-mono text-slate-500">{doc.embeddingModel}</td>
                                    <td className="px-4 py-3 text-slate-500">{doc.uploadDate}</td>
                                    <td className="px-4 py-3"><div className="flex gap-2"><button className="text-indigo-600 hover:underline">삭제</button></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Model Configuration */}
                <Card className="p-6">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">모델 설정</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="font-medium text-lg text-slate-700">QA 파운데이션 모델</label>
                            <select value={modelConfig.qaModel} onChange={e => setModelConfig(c => ({...c, qaModel: e.target.value}))} className="w-full mt-1 border-slate-300 rounded-md">
                                <option>gemini-2.5-pro</option>
                                <option>gemini-2.5-flash</option>
                            </select>
                        </div>
                         <div>
                            <label className="font-medium text-lg text-slate-700">시스템 프롬프트</label>
                            <p className="text-sm text-slate-500 mb-1">AI의 역할, 답변 스타일, 제약 조건 등을 정의합니다.</p>
                            <textarea value={modelConfig.systemPrompt} onChange={e => setModelConfig(c => ({...c, systemPrompt: e.target.value}))} rows={10} className="w-full mt-1 border-slate-300 rounded-md font-mono text-sm leading-relaxed" />
                        </div>
                        <div className="flex justify-end">
                            <button className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md text-base">설정 저장</button>
                        </div>
                    </div>
                </Card>
                {/* QA Test Bench */}
                <Card className="p-6 flex flex-col">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">QA 테스트 벤치</h3>
                    <p className="text-base text-slate-500 mb-3">설정 변경 후, 배포 전에 답변 품질을 테스트합니다.</p>
                    <div className="flex gap-2">
                        <input type="text" value={testQuery} onChange={e => setTestQuery(e.target.value)} placeholder="테스트 질문 입력..." className="flex-grow border-slate-300 rounded-md" />
                        <button onClick={handleTestQuery} disabled={isTestLoading} className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-md text-base disabled:bg-slate-400">
                            {isTestLoading ? '테스트 중...' : '테스트'}
                        </button>
                    </div>
                    <div className="mt-4 flex-grow bg-slate-50 rounded-lg p-4 border overflow-y-auto">
                        {isTestLoading && <p className="text-slate-500">답변 생성 중...</p>}
                        {testResult && (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-base text-slate-500 uppercase">AI 답변</h4>
                                    <p className="text-lg text-slate-800 mt-1">{testResult.answer}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-base text-slate-500 uppercase">참조된 근거 문헌</h4>
                                    {testResult.sources.length > 0 ? (
                                        <div className="space-y-2 mt-1">
                                        {testResult.sources.map(s => (
                                            <div key={s.id} className="p-2 border bg-white rounded-md">
                                                <p className="font-mono text-sm text-indigo-700 font-semibold">{s.id}</p>
                                                <p className="text-sm text-slate-600 italic mt-1">"...{s.snippet}..."</p>
                                            </div>
                                        ))}
                                        </div>
                                    ) : <p className="text-base text-slate-500 mt-1">참조된 문헌 없음</p>}
                                </div>
                            </div>
                        )}
                         {!isTestLoading && !testResult && <p className="text-center text-slate-500 pt-8">테스트 결과가 여기에 표시됩니다.</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminRagView;