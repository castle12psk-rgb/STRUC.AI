

import React, { useState, useEffect, useRef } from 'react';
import { Asset } from '../types';

interface CctvDetailModalProps {
  asset: Asset;
  onClose: () => void;
}

const ControlButton: React.FC<{ children: React.ReactNode; label: string; }> = ({ children, label }) => (
    <button className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors group" aria-label={label}>
        <div className="p-2 bg-slate-700/50 group-hover:bg-slate-600 rounded-full">{children}</div>
        <span className="text-xxs">{label}</span>
    </button>
);

const PTZController: React.FC = () => (
    <div className="grid grid-cols-3 gap-1 w-24 h-24 p-1">
        <div/>
        <button className="bg-slate-700/50 hover:bg-slate-600 rounded-md flex items-center justify-center text-slate-300 transition-colors">↑</button>
        <div/>
        <button className="bg-slate-700/50 hover:bg-slate-600 rounded-md flex items-center justify-center text-slate-300 transition-colors">←</button>
        <div className="bg-slate-700/50 rounded-full flex items-center justify-center text-slate-300">●</div>
        <button className="bg-slate-700/50 hover:bg-slate-600 rounded-md flex items-center justify-center text-slate-300 transition-colors">→</button>
        <div/>
        <button className="bg-slate-700/50 hover:bg-slate-600 rounded-md flex items-center justify-center text-slate-300 transition-colors">↓</button>
        <div/>
    </div>
);


export const CctvDetailModal: React.FC<CctvDetailModalProps> = ({ asset, onClose }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    useEffect(() => {
        if (videoRef.current) {
            // Programmatically play the video to ensure autoplay works across browsers
            videoRef.current.play().catch(error => {
                console.error("Video autoplay was prevented:", error);
                // Handle autoplay failure if necessary
            });
        }
    }, []);

    const eventLogs = [
        { time: '14:32:11', event: '움직임 감지 - Zone A', type: 'motion' },
        { time: '14:31:58', event: '차량 진입', type: 'object' },
        { time: '14:29:05', event: '안전모 미착용자 감지', type: 'alert' },
        { time: '14:28:40', event: '움직임 감지 - Zone C', type: 'motion' },
    ];

    return (
        <>
            <div className="fixed inset-0 bg-black/70 z-50 animate-fade-in" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col animate-fade-in">
                    {/* Header */}
                    <div className="flex justify-between items-center p-3 border-b border-slate-700 bg-slate-800 rounded-t-xl flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <h2 className="text-xl font-bold text-slate-100">실시간 CCTV 통합 관제</h2>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-700 rounded-full" aria-label="닫기">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow flex p-4 gap-4 min-h-0">
                        {/* Video Feed */}
                        <div className="flex-grow flex flex-col gap-3">
                            <div className="flex-grow bg-black border border-slate-700 rounded-lg relative overflow-hidden">
                                {/* Mock Video */}
                                <video
                                    ref={videoRef}
                                    src="https://cdn.coverr.co/videos/coverr-a-bridge-in-the-city-570/1080p.mp4"
                                    className="w-full h-full object-cover"
                                    loop
                                    muted
                                    playsInline
                                />
                                
                                {/* Video Overlay */}
                                <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-3 flex flex-col justify-between">
                                    <div className="flex justify-between items-start text-white">
                                        <div>
                                            <h3 className="font-bold text-lg drop-shadow-lg">{asset.name}</h3>
                                            <p className="text-sm font-mono opacity-80 drop-shadow-lg">{asset.asset_id}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-red-600/80 rounded-full text-sm font-bold">
                                                <div className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span></div>
                                                LIVE
                                            </div>
                                            <p className="font-mono mt-1 text-lg drop-shadow-lg">{currentTime.toLocaleTimeString('ko-KR')}</p>
                                        </div>
                                    </div>
                                    <div/>
                                </div>
                            </div>
                            {/* Controls */}
                            <div className="flex-shrink-0 h-28 bg-slate-800 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                     <PTZController />
                                     <div className="h-16 w-px bg-slate-700" />
                                     <div className="flex flex-col justify-center gap-2">
                                        <ControlButton label="Zoom In"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg></ControlButton>
                                        <ControlButton label="Zoom Out"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg></ControlButton>
                                     </div>
                                </div>
                                <div className="flex-grow mx-6">
                                    <div className="w-full h-1.5 bg-slate-700 rounded-full relative">
                                        <div className="absolute top-0 left-0 h-full bg-indigo-500 w-3/4 rounded-full"></div>
                                        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full left-3/4 -ml-2"></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>-00:30:00</span>
                                        <span>-00:15:00</span>
                                        <span>Live</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <ControlButton label="Snapshot"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg></ControlButton>
                                    <ControlButton label="Record"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" /></svg></ControlButton>
                                </div>
                            </div>
                        </div>
                        {/* AI Analysis Sidebar */}
                        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                             <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                                <h3 className="font-bold text-slate-100 mb-3">AI 객체 탐지 (실시간)</h3>
                                <div className="space-y-2 text-base">
                                    <div className="flex justify-between items-center"><span className="text-slate-300">차량 (Vehicles)</span><span className="font-mono font-bold text-lg text-indigo-400">2</span></div>
                                    <div className="flex justify-between items-center"><span className="text-slate-300">사람 (Personnel)</span><span className="font-mono font-bold text-lg text-indigo-400">1</span></div>
                                    <div className="flex justify-between items-center"><span className="text-slate-300">중장비 (Equipment)</span><span className="font-mono font-bold text-lg text-indigo-400">0</span></div>
                                </div>
                             </div>
                              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex-grow flex flex-col min-h-0">
                                <h3 className="font-bold text-slate-100 mb-3 flex-shrink-0">주요 이벤트 로그</h3>
                                <div className="flex-grow space-y-2 overflow-y-auto pr-2 text-sm">
                                    {eventLogs.map((log, i) => (
                                        <div key={i} className={`flex items-start gap-2 p-2 rounded-md ${log.type === 'alert' ? 'bg-red-500/10' : 'bg-slate-700/50'}`}>
                                            <span className="font-mono text-slate-500">{log.time}</span>
                                            <p className={`${log.type === 'alert' ? 'text-red-400 font-semibold' : 'text-slate-300'}`}>{log.event}</p>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
