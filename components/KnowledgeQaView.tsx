
import React, { useState, FormEvent, useRef, useEffect } from 'react';
// FIX: Changed import paths to be relative.
import { MOCK_RAG_DOCS } from '../constants';
import { RagDoc, ChatMessage } from '../types';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const UserMessage: React.FC<{ content: string }> = ({ content }) => (
    <div className="flex justify-end">
        <div className="bg-blue-600 text-white rounded-lg rounded-br-none px-4 py-3 max-w-lg">
            {content}
        </div>
    </div>
);

const AiMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const { content, isLoading, sources } = message;

    return (
        <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-4 py-3 max-w-lg">
                <p className="whitespace-pre-wrap">{content}{isLoading && <span className="inline-block w-2 h-4 bg-gray-600 animate-pulse ml-1" />}</p>
                {!isLoading && sources && sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-300">
                        <h4 className="text-xs font-semibold text-gray-500 mb-2">참조된 근거 문헌</h4>
                        <div className="space-y-1">
                            {sources.map(doc => (
                                <div key={doc.id} className="text-xs text-blue-700 font-mono bg-blue-50 px-2 py-1 rounded">
                                    {doc.id}
                                </div>
                            ))}
                        </div>
                         <div className="mt-4 flex items-center gap-2">
                             <span className="text-xs text-gray-500">이 답변이 유용했나요?</span>
                             <button className="p-1 rounded-full hover:bg-gray-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.93L5.5 8m7 2v5m0 0v5m0-5h-5" /></svg></button>
                             <button className="p-1 rounded-full hover:bg-gray-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.017c.163 0 .326.02.485.06L17 4m-7 10v5m0 0v5m0-5h5" /></svg></button>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const KnowledgeQaView: React.FC = () => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [currentQuery, setCurrentQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const streamResponse = (fullText: string, sources: RagDoc[]) => {
        let currentText = '';
        const interval = setInterval(() => {
            currentText = fullText.substring(0, currentText.length + 2);
            setChatHistory(prev =>
                prev.map(msg =>
                    msg.isLoading ? { ...msg, content: currentText } : msg
                )
            );

            if (currentText.length >= fullText.length) {
                clearInterval(interval);
                setIsLoading(false);
                setChatHistory(prev =>
                    prev.map(msg =>
                        msg.isLoading ? { ...msg, content: fullText, isLoading: false, sources } : msg
                    )
                );
            }
        }, 15);
    };

    const handleSearch = (query: string) => {
        if (!query.trim() || isLoading) return;

        const userMessage: ChatMessage = { id: Date.now(), role: 'user', content: query };
        const aiLoadingMessage: ChatMessage = { id: Date.now() + 1, role: 'ai', content: '', isLoading: true };
        
        setChatHistory(prev => [...prev, userMessage, aiLoadingMessage]);
        setIsLoading(true);
        setCurrentQuery('');

        // --- RAG & Generation Simulation ---
        setTimeout(() => {
            const lowerQuery = query.toLowerCase();
            let sources: RagDoc[] = [];
            let answer = "죄송합니다. 관련 기술 자료를 찾을 수 없습니다. 보다 구체적인 키워드로 질문해주십시오. (예: '포스트텐션 정착부 균열') ";

            if (lowerQuery.includes('0.35mm') || lowerQuery.includes('균열폭')) {
                sources = MOCK_RAG_DOCS.filter(doc => doc.id.startsWith('KBCS-2022-CH05'));
                answer = "콘크리트구조 설계기준(KBCS-2022-CH05-S7.3)에 따라, 일반적인 환경에 노출된 철근콘크리트 구조물의 허용 균열폭은 0.3mm입니다. 따라서 0.35mm의 균열폭은 기준을 초과하는 것으로 판단됩니다. \n\n이는 구조물의 내구성에 영향을 줄 수 있는 수준으로, 해당 균열의 원인을 파악하고 적절한 보수/보강 조치를 검토해야 합니다.";
            } else if (lowerQuery.includes('포스트텐션') || lowerQuery.includes('pt')) {
                sources = MOCK_RAG_DOCS.filter(doc => doc.id.startsWith('PT-GUIDE'));
                answer = "포스트텐션(PT) 슬래브의 정착구 주변에서 방사형 균열이 관찰될 경우, 이는 긴장재의 긴장력 손실 또는 정착부의 문제일 수 있습니다. (PT-GUIDE-2019-S5.2) \n\n정확한 진단을 위해서는 변형률 센서 데이터와 비교 분석하고, 필요한 경우 비파괴 검사를 통해 텐돈의 상태를 확인하는 것이 중요합니다. 특히 부식 환경에 노출된 경우, 즉각적인 조치가 필요할 수 있습니다.";
            } else if (lowerQuery.includes('내진') && lowerQuery.includes('등급 ii')) {
                sources = MOCK_RAG_DOCS.filter(doc => doc.id.startsWith('KBCS-2022-CH03'));
                answer = "내진등급 II에 해당하는 시설물은 KBCS-2022-CH03-S4.1 기준에 따라 평균재현주기 1000년의 지진(붕괴방지수준 지진)에 대해 구조적 안전성을 유지해야 합니다. 이는 해당 지진 발생 시 구조물에 손상은 발생할 수 있으나, 붕괴되지 않고 인명을 보호할 수 있어야 함을 의미합니다. 이를 위해 설계 시 연성능력을 확보하는 것이 매우 중요합니다.";
            }

            streamResponse(answer, sources);

        }, 500);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSearch(currentQuery);
    };
    
    const latestAiSources = chatHistory.slice().reverse().find(m => m.role === 'ai' && !m.isLoading && m.sources)?.sources || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
            {/* Left Column: Chat Interface */}
            <div className="lg:col-span-2 flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800">기술자료 QA Assistant</h3>
                    <p className="text-sm text-gray-500">내부 기술 문서 기반으로 정확한 답변을 제공합니다.</p>
                </div>
                <div ref={chatContainerRef} className="flex-grow p-4 space-y-6 overflow-y-auto">
                    {chatHistory.length === 0 ? (
                        <div className="text-center text-gray-500 h-full flex flex-col justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="mt-2 font-medium">무엇이든 물어보세요</p>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <button onClick={() => handleSearch("RC 구조물의 허용 균열폭 기준은?")} className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200">RC 구조물의 허용 균열폭 기준은?</button>
                                <button onClick={() => handleSearch("포스트텐션 정착부 균열 시 조치사항은?")} className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200">포스트텐션 정착부 균열 시 조치사항은?</button>
                                <button onClick={() => handleSearch("내진등급 II의 의미는?")} className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200">내진등급 II의 의미는?</button>
                                <button onClick={() => handleSearch("강구조물 볼트접합부 점검 방법은?")} className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200">강구조물 볼트접합부 점검 방법은?</button>
                            </div>
                        </div>
                    ) : (
                        chatHistory.map(msg =>
                            msg.role === 'user' ? (
                                <UserMessage key={msg.id} content={msg.content} />
                            ) : (
                                <AiMessage key={msg.id} message={msg} />
                            )
                        )
                    )}
                </div>
                <div className="p-4 border-t bg-white">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={currentQuery}
                            onChange={e => setCurrentQuery(e.target.value)}
                            placeholder="궁금한 점을 여기에 입력하세요..."
                            className="flex-grow w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !currentQuery.trim()} className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:bg-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        </button>
                    </form>
                </div>
            </div>
            {/* Right Column: Referenced Documents */}
            <div className="lg:col-span-1">
                 <Card className="p-4 h-full flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex-shrink-0">근거 문헌</h3>
                    {latestAiSources.length > 0 ? (
                        <div className="space-y-3 overflow-y-auto flex-grow">
                            {latestAiSources.map(doc => (
                                <div key={doc.id} className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                    <p className="font-semibold text-blue-700 text-sm font-mono">{doc.id}</p>
                                    <p className="text-sm text-gray-800 mt-1">{doc.title}</p>
                                    <p className="text-xs text-gray-500 mt-2 italic">"...{doc.snippet}..."</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-grow flex items-center justify-center text-center text-gray-500">
                            <p>답변에 사용된 근거 문헌이 여기에 표시됩니다.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default KnowledgeQaView;
