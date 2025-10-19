import React, { useState, FormEvent, useRef, useEffect } from 'react';
// import { GoogleGenAI } from "@google/genai"; // In a real app
import { MOCK_RAG_DOCS, RAG_STATISTICS } from '../constants';
import { RagDoc, ChatMessage } from '../types';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-lg shadow-lg ${className}`}>
    {children}
  </div>
);

const UserMessage: React.FC<{ content: string }> = ({ content }) => (
    <div className="flex justify-end ml-10">
        <div className="bg-indigo-600 text-white rounded-xl rounded-br-none px-5 py-3 max-w-2xl text-lg shadow">
            {content}
        </div>
    </div>
);

const ThinkingIndicator: React.FC<{ stage: string }> = ({ stage }) => (
    <div className="flex items-center gap-2 text-slate-400">
        <div className="flex gap-1">
            <span className="w-2 h-2 bg-slate-500 rounded-full animate-[thinking-dots_1s_ease-in-out_infinite]"></span>
            <span className="w-2 h-2 bg-slate-500 rounded-full animate-[thinking-dots_1s_ease-in-out_0.2s_infinite]"></span>
            <span className="w-2 h-2 bg-slate-500 rounded-full animate-[thinking-dots_1s_ease-in-out_0.4s_infinite]"></span>
        </div>
        <span className="font-semibold">{stage}...</span>
    </div>
);

const AiMessage: React.FC<{
    message: ChatMessage;
    setHighlightedSourceId: (id: string | null) => void;
}> = ({ message, setHighlightedSourceId }) => {
    const { content, isLoading, sources, stage } = message;

    const parseAndRenderContent = (text: string) => {
        const sourceRegex = /\[S:([\w-.]+)\]/g;
        let lastIndex = 0;
        const result: React.ReactNode[] = [];
        
        text.replace(sourceRegex, (match, sourceId, offset) => {
            // Add the text before the marker
            if (offset > lastIndex) {
                result.push(text.substring(lastIndex, offset));
            }
            // The marker itself is the source, but we attach it to the next text segment
            lastIndex = offset + match.length;
            return '';
        });

        // Add any remaining text
        if (lastIndex < text.length) {
            result.push(text.substring(lastIndex));
        }
        
        let sourceIndex = 0;
        const textWithMarkers = text.replace(sourceRegex, '§SOURCE§');
        const textSegments = textWithMarkers.split('§SOURCE§');

        return textSegments.map((segment, index) => {
            if (index === 0) return <span key={index}>{segment}</span>;
            const sourceId = sources?.[sourceIndex]?.id;
            sourceIndex++;
            return (
                <span
                    key={index}
                    onMouseEnter={() => setHighlightedSourceId(sourceId || null)}
                    onMouseLeave={() => setHighlightedSourceId(null)}
                    className="bg-indigo-900/40 p-0.5 rounded-sm cursor-pointer transition-colors duration-200 hover:bg-indigo-900/60"
                >
                    {segment}
                </span>
            );
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-start mr-10">
                 <div className="bg-slate-700 text-slate-200 rounded-xl rounded-bl-none px-5 py-3 max-w-2xl text-lg shadow">
                    {stage && <ThinkingIndicator stage={stage} />}
                    {content && <p className="whitespace-pre-wrap text-lg mt-2">{content}<span className="inline-block w-2 h-4 bg-slate-400 animate-pulse ml-1" /></p>}
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-start mr-10 group">
            <div className="bg-slate-700 text-slate-200 rounded-xl rounded-bl-none px-5 py-3 max-w-2xl text-lg shadow relative">
                <p className="whitespace-pre-wrap leading-relaxed">{parseAndRenderContent(content)}</p>
                {sources && sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-600/70">
                        <h4 className="text-base font-bold text-slate-400 mb-2">근거 문헌</h4>
                        <div className="space-y-1">
                            {sources.map(doc => (
                                <div key={doc.id} className="text-base text-indigo-300 bg-indigo-900/30 px-3 py-2 rounded-md border border-indigo-500/20"
                                     onMouseEnter={() => setHighlightedSourceId(doc.id)}
                                     onMouseLeave={() => setHighlightedSourceId(null)}
                                >
                                    <span className="font-semibold font-mono">{doc.id}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                 <div className="absolute -bottom-4 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 rounded-full bg-slate-600 shadow border border-slate-500 hover:bg-slate-500" title="답변 복사">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                    <button className="p-1 rounded-full bg-slate-600 shadow border border-slate-500 hover:bg-slate-500" title="유용함">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.93L5.5 8m7 2v5m0 0v5m0-5h-5" /></svg>
                    </button>
                    <button className="p-1 rounded-full bg-slate-600 shadow border border-slate-500 hover:bg-slate-500" title="유용하지 않음">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.017c.163 0 .326.02.485.06L17 4m-7 10v5m0 0v5m0-5h5" /></svg>
                    </button>
                 </div>
            </div>
        </div>
    );
};

const KnowledgeBasePanel: React.FC<{
    activeSources: RagDoc[];
    highlightedSourceId: string | null;
}> = ({ activeSources, highlightedSourceId }) => {
    if (activeSources.length === 0) {
        return (
             <Card className="p-6 h-full flex flex-col">
                <h3 className="text-xl font-bold text-slate-100 mb-4 flex-shrink-0">지식 베이스</h3>
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                   <div className="bg-slate-700/50 p-3 rounded-md">
                       <p className="text-slate-400">총 문서</p>
                       <p className="font-bold text-2xl text-slate-100">{RAG_STATISTICS.totalDocs}개</p>
                   </div>
                   <div className="bg-slate-700/50 p-3 rounded-md">
                       <p className="text-slate-400">총 정보량 (Chunks)</p>
                       <p className="font-bold text-2xl text-slate-100">{RAG_STATISTICS.totalChunks.toLocaleString()}개</p>
                   </div>
                </div>
                <h4 className="font-semibold text-slate-300 mb-2">주요 문헌</h4>
                <div className="flex-grow space-y-2 overflow-y-auto pr-2">
                    {MOCK_RAG_DOCS.map(doc => (
                        <div key={doc.id} className="p-3 bg-slate-700/50 border border-slate-700 rounded-md">
                            <p className="font-semibold text-indigo-400 font-mono text-base truncate">{doc.id}</p>
                            <p className="text-sm text-slate-300 truncate">{doc.title}</p>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }
    
    return (
        <Card className="p-6 h-full flex flex-col">
            <h3 className="text-xl font-bold text-slate-100 mb-4 flex-shrink-0">참조된 근거 문헌</h3>
            <div className="space-y-4 overflow-y-auto flex-grow pr-2">
                {activeSources.map(doc => (
                    <div key={doc.id} className={`p-4 bg-slate-800 border-2 rounded-lg transition-all duration-300 ${highlightedSourceId === doc.id ? 'border-indigo-500 shadow-lg animate-source-pulse' : 'border-slate-700'}`}>
                        <p className="font-semibold text-indigo-400 text-base font-mono">{doc.id}</p>
                        <p className="text-base text-slate-200 mt-1">{doc.title}</p>
                        <p className="text-sm text-slate-400 mt-2 bg-slate-700/50 p-2 rounded italic">"...{doc.snippet}..."</p>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const KnowledgeQaView: React.FC = () => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [currentQuery, setCurrentQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeSources, setActiveSources] = useState<RagDoc[]>([]);
    const [highlightedSourceId, setHighlightedSourceId] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const streamResponse = (fullText: string, sources: RagDoc[]) => {
        let currentText = '';
        const interval = setInterval(() => {
            currentText = fullText.substring(0, currentText.length + Math.floor(Math.random() * 3) + 1);
            setChatHistory(prev =>
                prev.map(msg =>
                    msg.isLoading ? { ...msg, content: currentText } : msg
                )
            );

            if (currentText.length >= fullText.length) {
                clearInterval(interval);
                 setChatHistory(prev => prev.map(msg => msg.isLoading ? { ...msg, stage: '근거 자료 확인 중' } : msg));
                setActiveSources(sources);

                setTimeout(() => {
                    setIsLoading(false);
                    setChatHistory(prev =>
                        prev.map(msg =>
                            msg.isLoading ? { ...msg, content: fullText, isLoading: false, sources } : msg
                        )
                    );
                }, 800);
            }
        }, 30);
    };

    const handleSearch = (query: string) => {
        if (!query.trim() || isLoading) return;

        const userMessage: ChatMessage = { id: Date.now(), role: 'user', content: query };
        const aiLoadingMessage: ChatMessage = { id: Date.now() + 1, role: 'ai', content: '', isLoading: true, stage: '문서 검색 중' };
        
        setChatHistory(prev => [...prev, userMessage, aiLoadingMessage]);
        setIsLoading(true);
        setCurrentQuery('');
        setActiveSources([]);

        setTimeout(() => {
            setChatHistory(prev => prev.map(msg => msg.isLoading ? { ...msg, stage: '답변 생성 중' } : msg));
            
            const lowerQuery = query.toLowerCase();
            let sources: RagDoc[] = [];
            let answerWithMarkers = "죄송합니다. 관련 기술 자료를 찾을 수 없습니다. 보다 구체적인 키워드로 질문해주십시오. (예: '포스트텐션 정착부 균열') ";

            if (lowerQuery.includes('0.35mm') || lowerQuery.includes('균열폭')) {
                sources = MOCK_RAG_DOCS.filter(doc => doc.id.startsWith('KBCS-2022-CH05'));
                answerWithMarkers = "[S:KBCS-2022-CH05-S7.3]콘크리트구조 설계기준에 따라, 일반적인 환경에 노출된 철근콘크리트 구조물의 허용 균열폭은 0.3mm입니다. 따라서 0.35mm의 균열폭은 기준을 초과하는 것으로 판단됩니다. \n\n이는 구조물의 내구성에 영향을 줄 수 있는 수준으로, 해당 균열의 원인을 파악하고 적절한 보수/보강 조치를 검토해야 합니다.";
            } else if (lowerQuery.includes('포스트텐션') || lowerQuery.includes('pt')) {
                sources = MOCK_RAG_DOCS.filter(doc => doc.id.startsWith('PT-GUIDE'));
                answerWithMarkers = "포스트텐션(PT) 슬래브의 정착구 주변에서 방사형 균열이 관찰될 경우, [S:PT-GUIDE-2019-S5.2]이는 긴장재의 긴장력 손실 또는 정착부의 문제일 수 있습니다. \n\n정확한 진단을 위해서는 변형률 센서 데이터와 비교 분석하고, 필요한 경우 비파괴 검사를 통해 텐돈의 상태를 확인하는 것이 중요합니다. 특히 부식 환경에 노출된 경우, 즉각적인 조치가 필요할 수 있습니다.";
            } else if (lowerQuery.includes('내진') && lowerQuery.includes('등급 ii')) {
                sources = MOCK_RAG_DOCS.filter(doc => doc.id.startsWith('KBCS-2022-CH03'));
                answerWithMarkers = "[S:KBCS-2022-CH03-S4.1]내진등급 II에 해당하는 시설물은 KBCS-2022 기준에 따라 평균재현주기 1000년의 지진(붕괴방지수준 지진)에 대해 구조적 안전성을 유지해야 합니다. 이는 해당 지진 발생 시 구조물에 손상은 발생할 수 있으나, 붕괴되지 않고 인명을 보호할 수 있어야 함을 의미합니다.";
            }
            
            streamResponse(answerWithMarkers, sources);
        }, 1200);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSearch(currentQuery);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
            {/* Left Column: Chat Interface */}
            <div className="lg:col-span-2 flex flex-col h-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
                <div className="p-4 border-b border-slate-700">
                    <h3 className="text-2xl font-bold text-slate-100">기술자료 QA Assistant</h3>
                    <p className="text-base text-slate-400">내부 기술 문서 기반으로 정확하고 신뢰성 있는 답변을 제공합니다.</p>
                </div>
                <div ref={chatContainerRef} className="flex-grow p-6 space-y-8 overflow-y-auto">
                    {chatHistory.length === 0 ? (
                        <div className="text-center text-slate-500 h-full flex flex-col justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-indigo-700/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="mt-2 font-bold text-2xl text-slate-200">무엇이든 물어보세요</p>
                            <p className="text-base text-slate-400">KBCS, 유지관리 지침 등 내부 기술 문서를 기반으로 답변합니다.</p>
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-base max-w-2xl mx-auto">
                                <button onClick={() => handleSearch("RC 구조물의 허용 균열폭 기준은?")} className="p-3 bg-slate-700 rounded-lg hover:bg-slate-600 text-left text-slate-300 transition-colors">RC 구조물의 허용 균열폭 기준은?</button>
                                <button onClick={() => handleSearch("포스트텐션 정착부 균열 시 조치사항은?")} className="p-3 bg-slate-700 rounded-lg hover:bg-slate-600 text-left text-slate-300 transition-colors">포스트텐션 정착부 균열 시 조치사항은?</button>
                                <button onClick={() => handleSearch("내진등급 II의 의미는?")} className="p-3 bg-slate-700 rounded-lg hover:bg-slate-600 text-left text-slate-300 transition-colors">내진등급 II의 의미는?</button>
                                <button onClick={() => handleSearch("강구조물 볼트접합부 점검 방법은?")} className="p-3 bg-slate-700 rounded-lg hover:bg-slate-600 text-left text-slate-300 transition-colors">강구조물 볼트접합부 점검 방법은?</button>
                            </div>
                        </div>
                    ) : (
                        chatHistory.map(msg =>
                            msg.role === 'user' ? (
                                <UserMessage key={msg.id} content={msg.content} />
                            ) : (
                                <AiMessage key={msg.id} message={msg} setHighlightedSourceId={setHighlightedSourceId} />
                            )
                        )
                    )}
                </div>
                <div className="p-4 border-t border-slate-700">
                    <form onSubmit={handleSubmit} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={currentQuery}
                            onChange={e => setCurrentQuery(e.target.value)}
                            placeholder="궁금한 점을 여기에 입력하세요... (예: 0.35mm 균열폭은 허용 기준을 초과하나요?)"
                            className="flex-grow w-full px-5 py-3 bg-slate-700 border border-slate-600 text-white rounded-full focus:ring-2 focus:ring-indigo-500 focus:outline-none text-lg"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !currentQuery.trim()} className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        </button>
                    </form>
                </div>
            </div>
            {/* Right Column: Referenced Documents */}
            <div className="lg:col-span-1">
                 <KnowledgeBasePanel activeSources={activeSources} highlightedSourceId={highlightedSourceId} />
            </div>
        </div>
    );
};

export default KnowledgeQaView;