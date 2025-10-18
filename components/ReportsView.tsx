
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
// FIX: Changed import paths to be relative.
import { MOCK_ASSET_EVENT_LOG, MOCK_REVIEW_REPORTS } from '../constants';
import { Asset, ReviewReport, ReportStatus } from '../types';

type PhotoWithPreview = {
  id: number;
  file: File;
  previewUrl: string;
  caption: string;
};
type CrackEntry = { id: number; location: string; width_mm: number; length_mm: number; type: string; };

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const renderMarkdown = (markdownText: string) => {
    // A simple markdown renderer to style the AI output
    return markdownText.split('\n').map((line, index, arr) => {
        if (line.startsWith('### ')) {
            return <h3 key={index} className="text-xl font-bold text-gray-800 mt-6 mb-3 pb-2 border-b">{line.substring(4)}</h3>;
        }
        if (line.startsWith('- ')) {
            // Check if it's part of a list
            const isList = (arr[index-1] && arr[index-1].startsWith('- ')) || (arr[index+1] && arr[index+1].startsWith('- '));
            if (isList) {
               return <li key={index} className="ml-5 text-gray-700 list-disc">{line.substring(2)}</li>;
            }
        }
        if (line.trim() === '') {
            return <br key={index} />;
        }
        return <p key={index} className="text-gray-700 mb-2">{line}</p>;
    });
};

interface NewReportViewProps {
    assets: Asset[];
}

const NewReportView: React.FC<NewReportViewProps> = ({ assets }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState('');
    const [report, setReport] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // State for the interactive form
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(assets.length > 0 ? assets[0].asset_id : null);
    const [photos, setPhotos] = useState<PhotoWithPreview[]>([]);
    const [cracks, setCracks] = useState<CrackEntry[]>([{ id: 1, location: 'P3 서측 하부', width_mm: 0.35, length_mm: 420, type: 'flexural' }]);
    const [notes, setNotes] = useState('최근 화물차 통행량 증가 보고');
    
    const selectedAsset = useMemo(() => assets.find(a => a.asset_id === selectedAssetId), [assets, selectedAssetId]);
    
    // Auto-populated SHM data summary (mocked)
    const shmDataSummary = useMemo(() => {
      if (!selectedAsset) return "자산을 선택해주세요.";
      const events = MOCK_ASSET_EVENT_LOG[selectedAsset.asset_id];
      if (events && events.length > 0) {
        return `최근 주요 이벤트: "${events[0].description}" (${events[0].date}). 지속적인 모니터링 필요.`;
      }
      return "최근 30일 내 SHM 시스템에서 감지된 특이사항 없음.";
    }, [selectedAsset]);

    useEffect(() => {
        // Reset form when project changes assets list
        if (assets.length > 0 && !assets.find(a => a.asset_id === selectedAssetId)) {
            setSelectedAssetId(assets[0].asset_id);
        } else if (assets.length === 0) {
            setSelectedAssetId(null);
        }
    }, [assets, selectedAssetId]);
    
    // Cleanup object URLs to prevent memory leaks
    useEffect(() => {
      return () => {
        photos.forEach(photo => URL.revokeObjectURL(photo.previewUrl));
      };
    }, []); // Empty dependency array means this runs only on mount and unmount

    const handleAssetChange = (newAssetId: string) => {
        if (newAssetId === selectedAssetId) {
            return;
        }

        // Clean up object URLs from previous photos to prevent memory leaks
        photos.forEach(photo => URL.revokeObjectURL(photo.previewUrl));
        
        // Reset all relevant form states to their initial, empty values
        setPhotos([]);
        setCracks([{ id: Date.now(), location: '', width_mm: 0, length_mm: 0, type: '' }]);
        setNotes('');
        setReport(''); // Clear the previously generated report
        
        // Set the new asset ID
        setSelectedAssetId(newAssetId);
    };

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const newPhotos: PhotoWithPreview[] = Array.from(files)
            .filter(file => file.type.startsWith('image/'))
            .map(file => ({
                id: Date.now() + Math.random(),
                file,
                previewUrl: URL.createObjectURL(file),
                caption: ''
            }));
        setPhotos(prev => [...prev, ...newPhotos]);
    };

    const handleRemovePhoto = (id: number) => {
        setPhotos(prev => {
            const photoToRemove = prev.find(p => p.id === id);
            if (photoToRemove) {
                URL.revokeObjectURL(photoToRemove.previewUrl);
            }
            return prev.filter(p => p.id !== id);
        });
    };

    const handlePhotoCaptionChange = (id: number, caption: string) => {
        setPhotos(prev => prev.map(p => p.id === id ? { ...p, caption } : p));
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
        handleFiles(e.dataTransfer.files);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const generateReport = async () => {
        if (!selectedAsset) {
            setReport("### 오류\n\n리포트를 생성할 자산을 먼저 선택해주세요.");
            return;
        }
        setIsLoading(true);
        setReport('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const prompt = `
                You are a world-class AI assistant, acting as a Senior Structural Engineer with 20 years of experience in safety diagnostics for critical infrastructure. Your task is to generate a professional, data-driven structural safety inspection report in Korean, formatted in clear Markdown. You must synthesize automatically-collected SHM data with manually-entered field inspection data.

                **1. Asset Information (from System):**
                - Asset: ${selectedAsset.name} (${selectedAsset.asset_id})
                - Type: ${selectedAsset.type}
                - Location: ${selectedAsset.location}
                - Design: ${selectedAsset.design.material}, Built ${selectedAsset.design.year}

                **2. Automatically-Collected Data (from SHM System):**
                - AI Data Summary: "${shmDataSummary}"

                **3. Field Inspection Data (from Engineer):**
                - Photos and Field Observations:
                  - ${photos.map(p => `"${p.caption}"`).join('\n  - ') || "사진 없음"}
                - Detailed Crack Measurements:
                  - ${cracks.map(c => `Location: ${c.location}, Width: ${c.width_mm}mm, Length: ${c.length_mm}mm, Type: ${c.type}`).join('\n  - ')}
                - Engineer's Notes: "${notes}"

                **4. Report Generation Instructions:**
                - **Language:** Korean
                - **Format:** Markdown
                - **Persona:** Senior Structural Engineer. Be formal, objective, and technical.
                - **Analysis Requirement:** Critically analyze all provided data. Specifically, compare the crack width(s) against the Korean Building Code (KBC) standard for RC structures (allowable width: 0.3mm). Connect the SHM data summary and the engineer's notes to the observed physical damage.
                - **Structure:** Generate the report using the following sections exactly as named:
                  - ### **1. 개요 (Overview)**
                  - ### **2. 점검 결과 요약 (Inspection Results Summary)**
                  - ### **3. 데이터 기반 분석 (Data-Based Analysis)** (Provide in-depth analysis here, referencing KBC standards)
                  - ### **4. 종합 평가 및 결론 (Overall Assessment & Conclusion)** (Assign a safety grade like 'C등급: 보통')
                  - ### **5. 권고 조치 (Recommended Actions)** (Provide specific, actionable short-term and long-term recommendations)
                - **Final Output:** Generate ONLY the Markdown report content. Do not include any text before "### 1. 개요".
            `;
            
            setLoadingStage('데이터 분석 중...');
            await new Promise(res => setTimeout(res, 500));
            setLoadingStage('구조적 안정성 평가 중...');
            await new Promise(res => setTimeout(res, 500));
            setLoadingStage('보고서 초안 생성 중...');

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setReport(response.text);
        } catch (error) {
            console.error("Error generating report:", error);
            setReport("### 오류 발생\n보고서 생성 중 오류가 발생했습니다. Gemini API 설정을 확인하거나 잠시 후 다시 시도해주세요.");
        } finally {
            setIsLoading(false);
            setLoadingStage('');
        }
    };
    
    if (assets.length === 0) {
        return <Card className="p-6 text-center text-gray-500">현재 프로젝트에 등록된 자산이 없습니다.</Card>
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* INPUT COLUMN */}
            <div className="space-y-6">
                <Card className="p-6">
                     <h3 className="text-lg font-bold text-gray-800 mb-4">1단계: 자산 선택 및 데이터 확인</h3>
                     <label htmlFor="asset-select" className="block text-sm font-medium text-gray-700">리포트 대상 자산</label>
                     <select 
                        id="asset-select" 
                        value={selectedAssetId || ''}
                        onChange={(e) => handleAssetChange(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                     >
                        {assets.map(asset => <option key={asset.asset_id} value={asset.asset_id}>{asset.name}</option>)}
                     </select>
                     
                     <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700">AI 데이터 요약 (SHM 자동 연동)</h4>
                        <p className="mt-1 text-sm text-gray-600 bg-gray-100 p-3 rounded-md border border-gray-200">{shmDataSummary}</p>
                     </div>
                </Card>
                
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">2단계: 현장 점검 데이터 입력</h3>
                    <div>
                        <h4 className="font-semibold text-blue-600 mb-2">사진 증거</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {photos.map((photo) => (
                                <div key={photo.id} className="relative group flex flex-col gap-2">
                                    <button
                                        onClick={() => handleRemovePhoto(photo.id)}
                                        className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="사진 삭제"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                    <div className="w-full h-32 bg-gray-200 rounded-md flex items-center justify-center border overflow-hidden">
                                        <img src={photo.previewUrl} alt={photo.file.name} className="w-full h-full object-cover" />
                                    </div>
                                    <textarea 
                                        value={photo.caption} 
                                        onChange={(e) => handlePhotoCaptionChange(photo.id, e.target.value)}
                                        rows={3} 
                                        className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                                        placeholder="사진에 대한 설명을 입력하세요..."
                                    />
                                </div>
                            ))}
                             <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={triggerFileInput}
                                className="w-full h-full min-h-[14rem] bg-gray-50 rounded-md flex flex-col items-center justify-center border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-all duration-200 cursor-pointer"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleFiles(e.target.files)}
                                    className="hidden"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                <span className="mt-2 text-sm font-medium">사진을 드래그하거나 클릭하여 추가</span>
                                <span className="mt-1 text-xs text-gray-400">Drag & Drop or Click</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <h4 className="font-semibold text-blue-600 mb-2">균열 상세</h4>
                         <div className="space-y-2">
                         {cracks.map(crack => (
                             <div key={crack.id} className="grid grid-cols-10 gap-2 text-sm">
                                <input type="text" defaultValue={crack.location} className="col-span-4 border-gray-300 rounded-md text-sm" placeholder="위치 (예: P3 서측 하부)"/>
                                <input type="text" defaultValue={crack.type} className="col-span-2 border-gray-300 rounded-md text-sm" placeholder="유형 (예: 휨)"/>
                                <input type="number" step="0.01" defaultValue={crack.width_mm} className="col-span-2 border-gray-300 rounded-md text-sm text-right" placeholder="폭(mm)"/>
                                <input type="number" defaultValue={crack.length_mm} className="col-span-2 border-gray-300 rounded-md text-sm text-right" placeholder="길이(mm)"/>
                             </div>
                         ))}
                         </div>
                    </div>
                    <div className="mt-6">
                         <h4 className="font-semibold text-blue-600 mb-2">엔지니어 종합 의견</h4>
                         <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </Card>

                 <div className="flex justify-end">
                    <button onClick={generateReport} disabled={isLoading || !selectedAsset} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl">
                        {isLoading ? loadingStage : '3단계: AI 리포트 초안 생성'}
                    </button>
                </div>
            </div>
            
            {/* OUTPUT COLUMN */}
            <div className="sticky top-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">생성된 리포트 (초안)</h3>
                <div className="bg-gray-100 p-2 rounded-lg">
                    <Card className="p-8 min-h-[600px]">
                        {isLoading ? (
                            <div className="flex flex-col justify-center items-center h-full text-center">
                                <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-gray-600 font-semibold">{loadingStage}</p>
                                <p className="text-sm text-gray-500 mt-1">AI가 데이터를 분석하여 보고서를 작성하고 있습니다.</p>
                            </div>
                        ) : report ? (
                            <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
                                {renderMarkdown(report)}
                            </div>
                        ) : (
                            <div className="flex justify-center items-center h-full text-center text-gray-500">
                                <p>좌측의 'AI 리포트 초안 생성' 버튼을 클릭하여<br/>점검 데이터 기반 보고서를 생성하세요.</p>
                            </div>
                        )}
                    </Card>
                </div>
                {report && !isLoading && (
                    <div className="mt-4 flex justify-end gap-3">
                        <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-md text-sm font-semibold cursor-not-allowed">초안 저장</button>
                        <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-md text-sm font-semibold cursor-not-allowed">담당자에게 보내기</button>
                        <button disabled className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-semibold opacity-50 cursor-not-allowed">PDF로 내보내기</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ReportsInReviewView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ReportStatus | '전체'>('전체');

    const filteredReports = useMemo(() => {
        return MOCK_REVIEW_REPORTS
            .filter(report => report.status !== '승인됨')
            .filter(report => statusFilter === '전체' || report.status === statusFilter)
            .filter(report => 
                report.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (report.reviewer && report.reviewer.toLowerCase().includes(searchTerm.toLowerCase()))
            );
    }, [searchTerm, statusFilter]);
    
    const getStatusAppearance = (status: ReportStatus) => {
        switch (status) {
            case '검토 중': return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' };
            case '수정 요청': return { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' };
            case '승인 대기': return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
            case '승인됨': return { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
        }
    };
    
    const StatusBadge: React.FC<{ status: ReportStatus, revisionRequest?: string }> = ({ status, revisionRequest }) => {
        const { bg, text, dot } = getStatusAppearance(status);
        const content = (
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
                <span className={`w-2 h-2 mr-1.5 rounded-full ${dot}`}></span>
                {status}
            </div>
        );

        if (status === '수정 요청' && revisionRequest) {
            return (
                <div className="relative group">
                    {content}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        <span className="font-bold">수정 요청 사유:</span> {revisionRequest}
                    </div>
                </div>
            );
        }
        return content;
    };


    return (
        <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input 
                        type="text" 
                        placeholder="리포트 제목, ID, 담당자 검색..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">상태:</label>
                    <select 
                        id="status-filter"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as ReportStatus | '전체')}
                        className="border-gray-300 rounded-md shadow-sm text-sm py-2 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option>전체</option>
                        <option>검토 중</option>
                        <option>수정 요청</option>
                        <option>승인 대기</option>
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">리포트 제목</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">담당자 (작성/검토)</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수정일</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">종합 평가</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredReports.map((report) => (
                            <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={report.status} revisionRequest={report.revisionRequest} /></td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900">{report.assetName} 정기점검 보고서</div>
                                    <div className="text-xs text-gray-500 font-mono">{report.id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <div>{report.author} / <span className="font-medium text-gray-800">{report.reviewer}</span></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.lastModifiedDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-800">{report.safetyGrade}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-xs">{report.summary}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <button className="text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-100" title="검토"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg></button>
                                        <button className="text-green-600 hover:text-green-800 p-1.5 rounded-md hover:bg-green-100" title="승인"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
                                        <button className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-100" title="반려"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredReports.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">검토할 리포트가 없습니다.</h3>
                    <p className="mt-1 text-sm text-gray-500">필터 조건을 변경하거나 새 리포트를 생성해주세요.</p>
                </div>
            )}
        </Card>
    );
};

const ApprovedReportsView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredReports = useMemo(() => {
        return MOCK_REVIEW_REPORTS
            .filter(report => report.status === '승인됨')
            .filter(report => 
                report.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (report.approver && report.approver.toLowerCase().includes(searchTerm.toLowerCase()))
            );
    }, [searchTerm]);

    const SafetyGradeBadge: React.FC<{ grade: string }> = ({ grade }) => {
        const getGradeColor = (g: string) => {
            if (g.startsWith('A')) return 'bg-green-100 text-green-800';
            if (g.startsWith('B')) return 'bg-blue-100 text-blue-800';
            if (g.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
            if (g.startsWith('D')) return 'bg-orange-100 text-orange-800';
            return 'bg-gray-100 text-gray-800';
        };
        return (
            <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${getGradeColor(grade)}`}>
                {grade}
            </span>
        );
    };

    return (
         <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input 
                        type="text" 
                        placeholder="자산명, ID, 승인자 검색..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                {/* Placeholder for future advanced filters */}
                 <button className="text-sm text-blue-600 font-medium hover:text-blue-800">
                    상세 필터
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">리포트 ID (버전)</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">자산명</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">종합 평가</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결재 라인 (작성/검토/승인)</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">승인일</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredReports.map((report) => (
                            <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900 font-mono">{report.id}</div>
                                    <div className="text-xs text-gray-500">Version: {report.version}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{report.assetName}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><SafetyGradeBadge grade={report.safetyGrade} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {report.author} / {report.reviewer} / <span className="font-bold text-gray-900">{report.approver}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.approvalDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <button className="text-gray-500 hover:text-blue-600 p-1.5 rounded-md hover:bg-gray-100" title="상세보기"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg></button>
                                        <button className="text-gray-500 hover:text-green-600 p-1.5 rounded-md hover:bg-gray-100" title="PDF 내보내기"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></button>
                                        <button className="text-gray-500 hover:text-purple-600 p-1.5 rounded-md hover:bg-gray-100" title="이력 보기"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredReports.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">승인된 리포트가 없습니다.</h3>
                    <p className="mt-1 text-sm text-gray-500">검색어를 확인하거나 필터를 조정해주세요.</p>
                </div>
            )}
        </Card>
    );
};


interface ReportsViewProps {
  activeSubView: string;
  assets: Asset[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ activeSubView, assets }) => {
  const subView = activeSubView.split(' > ')[1] || '새 리포트';

  const renderContent = () => {
    switch(subView) {
      case '새 리포트':
        return <NewReportView assets={assets} />;
      case '검토 중':
        return <ReportsInReviewView />;
      case '승인됨':
        return <ApprovedReportsView />;
      default:
        return <NewReportView assets={assets} />;
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">{activeSubView.replace(' > ', ' - ')}</h2>
      {renderContent()}
    </div>
  );
};

export default ReportsView;
