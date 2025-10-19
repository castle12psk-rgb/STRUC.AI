import React, { useState, useMemo, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
// FIX: Changed import paths to be relative.
import { MOCK_ASSET_EVENT_LOG, MOCK_SENSOR_READINGS } from '../constants';
import { Asset, ReviewReport, ReportStatus, ReportAuditEntry } from '../types';
import { LineChart } from './LineChart';

type PhotoWithPreview = {
  id: number;
  file: File;
  previewUrl: string;
  caption: string;
};
type CrackEntry = { id: number; location: string; width_mm: number; length_mm: number; type: string; };

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const renderMarkdown = (markdownText: string, highlightText?: string) => {
    const sections = markdownText.split(/(###\s.*\n)/);
    
    return sections.map((section, index) => {
        if (section.startsWith('### ')) {
            return <h3 key={index} className="text-xl font-bold text-slate-800 mt-5 mb-2 pb-2 border-b">{section.substring(4)}</h3>;
        }
        
        const paragraphs = section.split('\n').filter(p => p.trim() !== '');
        
        return paragraphs.map((line, pIndex) => {
             const isHighlighted = highlightText && line.includes(highlightText);
             if (line.startsWith('- ')) {
                 return <li key={`${index}-${pIndex}`} className={`ml-5 text-base text-slate-700 list-disc ${isHighlighted ? 'animate-subtle-pulse rounded' : ''}`}>{line.substring(2)}</li>;
             }
             return <p key={`${index}-${pIndex}`} className={`text-base text-slate-700 mb-2 ${isHighlighted ? 'animate-subtle-pulse rounded' : ''}`}>{line}</p>;
        });
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
        e.currentTarget.classList.add('border-indigo-500', 'bg-indigo-50');
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
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
        return <Card className="p-6 text-center text-slate-500">현재 프로젝트에 등록된 자산이 없습니다.</Card>
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* INPUT COLUMN */}
            <div className="space-y-6">
                <Card className="p-6">
                     <h3 className="text-xl font-bold text-slate-800 mb-4">1단계: 자산 선택 및 데이터 확인</h3>
                     <label htmlFor="asset-select" className="block text-base font-medium text-slate-700">리포트 대상 자산</label>
                     <select 
                        id="asset-select" 
                        value={selectedAssetId || ''}
                        onChange={(e) => handleAssetChange(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-lg border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base rounded-md"
                     >
                        {assets.map(asset => <option key={asset.asset_id} value={asset.asset_id}>{asset.name}</option>)}
                     </select>
                     
                     <div className="mt-4">
                        <h4 className="text-base font-medium text-slate-700">AI 데이터 요약 (SHM 자동 연동)</h4>
                        <p className="mt-1 text-base text-slate-600 bg-slate-100 p-3 rounded-md border border-slate-200">{shmDataSummary}</p>
                     </div>
                </Card>
                
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">2단계: 현장 점검 데이터 입력</h3>
                    <div>
                        <h4 className="font-semibold text-indigo-700 mb-2">사진 증거</h4>
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
                                    <div className="w-full h-32 bg-slate-200 rounded-md flex items-center justify-center border overflow-hidden">
                                        <img src={photo.previewUrl} alt={photo.file.name} className="w-full h-full object-cover" />
                                    </div>
                                    <textarea 
                                        value={photo.caption} 
                                        onChange={(e) => handlePhotoCaptionChange(photo.id, e.target.value)}
                                        rows={3} 
                                        className="w-full text-base border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                                        placeholder="사진에 대한 설명을 입력하세요..."
                                    />
                                </div>
                            ))}
                             <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={triggerFileInput}
                                className="w-full h-full min-h-[14rem] bg-slate-50 rounded-md flex flex-col items-center justify-center border-2 border-dashed border-slate-300 text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-all duration-200 cursor-pointer"
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
                                <span className="mt-2 text-base font-medium">사진을 드래그하거나 클릭하여 추가</span>
                                <span className="mt-1 text-sm text-slate-400">Drag & Drop or Click</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <h4 className="font-semibold text-indigo-700 mb-2">균열 상세</h4>
                         <div className="space-y-2">
                         {cracks.map(crack => (
                             <div key={crack.id} className="grid grid-cols-10 gap-2 text-base">
                                <input type="text" defaultValue={crack.location} className="col-span-4 border-slate-300 rounded-md text-base" placeholder="위치 (예: P3 서측 하부)"/>
                                <input type="text" defaultValue={crack.type} className="col-span-2 border-slate-300 rounded-md text-base" placeholder="유형 (예: 휨)"/>
                                <input type="number" step="0.01" defaultValue={crack.width_mm} className="col-span-2 border-slate-300 rounded-md text-base text-right" placeholder="폭(mm)"/>
                                <input type="number" defaultValue={crack.length_mm} className="col-span-2 border-slate-300 rounded-md text-base text-right" placeholder="길이(mm)"/>
                             </div>
                         ))}
                         </div>
                    </div>
                    <div className="mt-6">
                         <h4 className="font-semibold text-indigo-700 mb-2">엔지니어 종합 의견</h4>
                         <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full text-base border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </Card>

                 <div className="flex justify-end">
                    <button onClick={generateReport} disabled={isLoading || !selectedAsset} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-lg">
                        {isLoading ? loadingStage : '3단계: AI 리포트 초안 생성'}
                    </button>
                </div>
            </div>
            
            {/* OUTPUT COLUMN */}
            <div className="sticky top-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">생성된 리포트 (초안)</h3>
                <div className="bg-slate-100 p-2 rounded-lg">
                    <Card className="p-8 min-h-[600px]">
                        {isLoading ? (
                            <div className="flex flex-col justify-center items-center h-full text-center">
                                <svg className="animate-spin h-8 w-8 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-slate-600 font-semibold">{loadingStage}</p>
                                <p className="text-base text-slate-500 mt-1">AI가 데이터를 분석하여 보고서를 작성하고 있습니다.</p>
                            </div>
                        ) : report ? (
                            <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed">
                                {renderMarkdown(report)}
                            </div>
                        ) : (
                            <div className="flex justify-center items-center h-full text-center text-slate-500">
                                <p className="text-lg">좌측의 'AI 리포트 초안 생성' 버튼을 클릭하여<br/>점검 데이터 기반 보고서를 생성하세요.</p>
                            </div>
                        )}
                    </Card>
                </div>
                {report && !isLoading && (
                    <div className="mt-4 flex justify-end gap-3">
                        <button disabled className="px-4 py-2 bg-slate-200 text-slate-500 rounded-md text-base font-semibold cursor-not-allowed">초안 저장</button>
                        <button disabled className="px-4 py-2 bg-slate-200 text-slate-500 rounded-md text-base font-semibold cursor-not-allowed">담당자에게 보내기</button>
                        <button disabled className="px-4 py-2 bg-green-600 text-white rounded-md text-base font-semibold opacity-50 cursor-not-allowed">PDF로 내보내기</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ReportsInReviewView: React.FC<{ reports: ReviewReport[] }> = ({ reports: initialReports }) => {
    const reportsWithContent = useMemo(() => initialReports.map(r => ({
        ...r,
        // Mocking full report content for detail view
        fullContent: `### 1. 개요\n본 보고서는 ${r.assetName}(${r.assetId})의 2025년 4분기 정기 안전 점검 결과를 기술한다.\n\n### 2. 점검 결과 요약\n- **종합 평가:** ${r.safetyGrade}\n- **주요 발견 사항:** ${r.summary}\n\n### 3. 데이터 기반 분석\n- 현장 점검 결과, 교각 P3 서측 하부에서 최대폭 0.35mm의 휨 균열이 발견됨. 이는 KBCS 2022 기준 허용 균열폭(0.3mm)을 초과하는 수치임.\n- SHM 시스템의 변위 센서(DISP-P3-02) 데이터 확인 결과, 최근 7일간 평균 변위가 9.1mm로 측정되어 '주의' 임계값(8.0mm)을 지속적으로 상회함. 이는 균열 발생과 연관성이 있을 수 있음.\n\n### 4. 종합 평가 및 결론\n구조물의 사용성 및 내구성에 영향을 미치는 균열이 발견되었으며, 계측 데이터 또한 이상 징후를 보이고 있어 종합적인 상태는 'C등급(보통)'으로 판단됨. 즉각적인 붕괴 위험은 없으나, 손상 가속화를 방지하기 위한 조치가 필요함.\n\n### 5. 권고 조치\n- **단기:** 해당 균열에 대한 정밀 진단 및 균열 게이지 설치를 통한 지속적인 모니터링.\n- **장기:** 균열 보수 공법 검토 및 차기 점검 시 해당 부위 집중 점검.`
    })), [initialReports]);

    const [reports, setReports] = useState(reportsWithContent);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(
        reports.find(r => r.status !== '승인됨')?.id || null
    );

    // AI Summary state
    const [aiSummary, setAiSummary] = useState<string[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [highlight, setHighlight] = useState<string | null>(null);

    const selectedReport = useMemo(() => reports.find(r => r.id === selectedReportId), [reports, selectedReportId]);

    useEffect(() => {
        if (selectedReport) {
            setIsAiLoading(true);
            setAiSummary([]);
            // Simulate Gemini API call for AI pre-review
            setTimeout(() => {
                const summaryPoints = [
                    "**기준 초과:** 보고된 균열폭(0.35mm)은 KBCS 허용 기준(0.3mm)을 초과합니다.",
                    "**데이터 일치:** SHM 변위 센서 데이터(최대 9.1mm)가 보고서의 이상 징후 판단을 뒷받침합니다.",
                    "**조치 필요:** C등급 평가 및 권고 조치는 타당하며, 즉각적인 후속 조치가 필요합니다."
                ];
                setAiSummary(summaryPoints);
                setIsAiLoading(false);
            }, 1200);
        }
    }, [selectedReport]);


    const getStatusAppearance = (status: ReportStatus) => {
        switch (status) {
            case '검토 중': return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' };
            case '수정 요청': return { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' };
            case '승인 대기': return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
            case '승인됨': return { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' };
            default: return { bg: 'bg-slate-100', text: 'text-slate-800', dot: 'bg-slate-500' };
        }
    };

    const WorkflowStep: React.FC<{ name: string, user: string, status: 'complete' | 'current' | 'pending'}> = ({ name, user, status }) => {
        const colors = {
            complete: { bg: 'bg-indigo-600', text: 'text-white' },
            current: { bg: 'bg-yellow-500', text: 'text-yellow-900' },
            pending: { bg: 'bg-slate-200', text: 'text-slate-500' }
        };
        const statusText = { complete: '완료', current: '진행중', pending: '대기' };
        
        return (
            <div className="flex-1 text-center">
                <div className={`text-xs font-bold uppercase ${status === 'pending' ? 'text-slate-400' : 'text-slate-600'}`}>{name}</div>
                <div className={`mt-1 text-sm font-semibold p-1 rounded ${colors[status].bg} ${colors[status].text}`}>{user} ({statusText[status]})</div>
            </div>
        );
    };

    const shmChartData = useMemo(() => {
        if (!selectedReport) return [];
        const readings = MOCK_SENSOR_READINGS.filter(r => r.asset_id === selectedReport.assetId && r.sensor_id === 'DISP-P3-02');
        if (readings.length === 0) return [];
        return readings.slice(0, 20).map((r, i) => ({ label: `${i}`, value: r.value })).reverse();
    }, [selectedReport]);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
            {/* Left: Report List */}
            <div className="lg:col-span-1 flex flex-col h-full">
                <Card className="p-4 flex-shrink-0">
                    <input type="text" placeholder="리포트 검색..." className="w-full border-slate-300 rounded-md shadow-sm" />
                </Card>
                <div className="flex-grow overflow-y-auto mt-4 space-y-3 pr-2">
                    {reports.filter(r => r.status !== '승인됨').map(report => (
                        <button key={report.id} onClick={() => setSelectedReportId(report.id)} className={`w-full text-left p-4 rounded-lg border-l-4 transition-all duration-200 ${selectedReportId === report.id ? 'bg-indigo-50 border-indigo-500 shadow-md' : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50 shadow-sm'}`}>
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-lg text-slate-800">{report.assetName}</h4>
                                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${getStatusAppearance(report.status).bg} ${getStatusAppearance(report.status).text}`}>{report.status}</span>
                            </div>
                            <p className="text-sm text-slate-500 font-mono">{report.id}</p>
                            <div className="mt-3 pt-3 border-t text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">평가 등급:</span>
                                    <span className="font-bold text-slate-800">{report.safetyGrade}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">검토자:</span>
                                    <span className="font-semibold text-slate-800">{report.reviewer}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right: Detail View */}
            <div className="lg:col-span-2 flex flex-col h-full">
                {selectedReport ? (
                    <Card className="flex-grow flex flex-col">
                        <div className="p-4 border-b flex-shrink-0">
                            <h3 className="text-xl font-bold text-slate-800">{selectedReport.assetName} 정기점검 보고서</h3>
                            <div className="mt-4 flex items-center gap-2">
                                <WorkflowStep name="작성" user={selectedReport.author} status="complete" />
                                <div className="flex-1 h-0.5 bg-slate-200"></div>
                                <WorkflowStep name="검토" user={selectedReport.reviewer || ''} status="current" />
                                <div className="flex-1 h-0.5 bg-slate-200"></div>
                                <WorkflowStep name="승인" user={selectedReport.approver || '미지정'} status="pending" />
                            </div>
                        </div>

                        <div className="flex-grow p-4 overflow-y-auto space-y-4">
                            {/* AI Summary */}
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                <h4 className="font-bold text-indigo-800 flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                  AI 사전 검토 요약
                                </h4>
                                {isAiLoading ? (
                                    <div className="mt-2 space-y-2">
                                        <div className="h-4 bg-indigo-200 rounded w-5/6 shimmer relative overflow-hidden"></div>
                                        <div className="h-4 bg-indigo-200 rounded w-4/6 shimmer relative overflow-hidden"></div>
                                    </div>
                                ) : (
                                    <ul className="mt-2 space-y-1 text-base list-disc list-inside text-indigo-900">
                                        <li onMouseEnter={() => setHighlight('0.35mm')} onMouseLeave={() => setHighlight(null)} className="cursor-pointer p-1 rounded hover:bg-indigo-100">{aiSummary[0]}</li>
                                        <li onMouseEnter={() => setHighlight('9.1mm')} onMouseLeave={() => setHighlight(null)} className="cursor-pointer p-1 rounded hover:bg-indigo-100">{aiSummary[1]}</li>
                                        <li className="p-1">{aiSummary[2]}</li>
                                    </ul>
                                )}
                            </div>
                            
                            {/* SHM Data Cross-check */}
                             <div className="bg-slate-50 border rounded-lg p-4">
                                <h4 className="font-bold text-slate-700">SHM 데이터 교차 검증</h4>
                                <div className="flex items-center justify-between text-sm text-slate-600 mt-1">
                                    <span>변위 센서(DISP-P3-02) 7일 동향</span>
                                    <span className={`font-bold ${highlight === '9.1mm' ? 'text-indigo-600' : ''}`}>최대값: {shmChartData[shmChartData.length-1]?.value.toFixed(2)}mm</span>
                                </div>
                                <div className={highlight === '9.1mm' ? 'animate-subtle-pulse rounded' : ''}>
                                <LineChart data={shmChartData} threshold={8.0} unit="mm" height={80} />
                                </div>
                            </div>

                            {/* Report Content */}
                            <div>
                                <h4 className="font-bold text-slate-700 mb-2">제출된 리포트 원문</h4>
                                <div className="p-4 border rounded-lg max-h-96 overflow-y-auto bg-white">
                                    {renderMarkdown(selectedReport.fullContent, highlight || undefined)}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t flex-shrink-0 flex justify-end items-center gap-3">
                            <input type="text" placeholder="수정 요청 사항 입력..." className="flex-grow border-slate-300 rounded-md" />
                            <button className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600">수정 요청</button>
                            <button className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">검토 완료 및 승인 요청</button>
                        </div>
                    </Card>
                ) : (
                    <Card className="flex items-center justify-center h-full text-slate-500">
                        <p>검토할 리포트를 선택하세요.</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

const ApprovedReportsView: React.FC<{ reports: ReviewReport[] }> = ({ reports: initialReports }) => {
    const reportsWithContent = useMemo(() => initialReports.map(r => ({
        ...r,
        fullContent: `### 1. 개요\n본 보고서는 ${r.assetName}(${r.assetId})의 2025년 3분기 정기 안전 점검 결과를 기술한다.\n\n### 2. 점검 결과 요약\n- **종합 평가:** ${r.safetyGrade}\n- **주요 발견 사항:** ${r.summary}\n\n### 3. 데이터 기반 분석\n- 현장 점검 결과 특이사항은 발견되지 않았음.\n- SHM 시스템의 모든 센서 데이터는 안정 범위 내에서 유지되고 있음.\n\n### 4. 종합 평가 및 결론\n구조물의 상태는 전반적으로 양호하며, 현재의 사용성을 저해하는 결함은 없는 것으로 판단되어 종합적인 상태는 '${r.safetyGrade}'으로 평가됨.\n\n### 5. 권고 조치\n- 현 상태 유지 및 지속적인 모니터링.`
    })), [initialReports]);

    const approvedReports = useMemo(() => reportsWithContent.filter(r => r.status === '승인됨'), [reportsWithContent]);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(approvedReports.length > 0 ? approvedReports[0].id : null);
    const [highlightedEvidence, setHighlightedEvidence] = useState<string | null>(null);

    const selectedReport = useMemo(() => approvedReports.find(r => r.id === selectedReportId), [approvedReports, selectedReportId]);
    
    // Mock key evidence for demonstration
    const keyEvidence = useMemo(() => {
        if (!selectedReport) return [];
        if (selectedReport.safetyGrade.startsWith('A')) {
            return [
                { id: 'ev1', text: 'SHM 데이터 안정', highlight: '안정 범위 내에서 유지' },
                { id: 'ev2', text: '현장 점검 특이사항 없음', highlight: '특이사항은 발견되지 않았음' },
            ];
        }
        return [{ id: 'ev1', text: '정기 점검 완료', highlight: '정기 안전 점검' }];
    }, [selectedReport]);
    
    const getGradeAppearance = (grade: string) => {
        if (grade.startsWith('A')) return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' };
        if (grade.startsWith('B')) return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' };
        return { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' };
    };
    
    const AuditTrail: React.FC<{ trail: ReportAuditEntry[] }> = ({ trail }) => (
        <div className="space-y-4">
            {trail.map((entry, index) => (
                <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${entry.status === '승인됨' ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-700'}`}>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </div>
                        {index < trail.length - 1 && <div className="w-0.5 flex-grow bg-slate-300"></div>}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800">{entry.status}</p>
                        <p className="text-sm text-slate-500">{entry.user} · {entry.timestamp}</p>
                        {entry.notes && <p className="text-sm text-slate-600 mt-1 italic bg-slate-100 p-2 rounded-md">"{entry.notes}"</p>}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
            {/* Left: Report List */}
            <div className="lg:col-span-1 flex flex-col h-full">
                <Card className="p-4 flex-shrink-0">
                    <input type="text" placeholder="승인된 리포트 검색..." className="w-full border-slate-300 rounded-md shadow-sm" />
                </Card>
                <div className="flex-grow overflow-y-auto mt-4 space-y-3 pr-2">
                    {approvedReports.map(report => {
                         const gradeStyle = getGradeAppearance(report.safetyGrade);
                         return (
                            <button key={report.id} onClick={() => setSelectedReportId(report.id)} className={`w-full text-left p-3 rounded-lg border-l-4 transition-all duration-200 ${selectedReportId === report.id ? 'bg-indigo-50 border-indigo-500 shadow-md' : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50 shadow-sm'}`}>
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-base text-slate-800">{report.assetName}</h4>
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${gradeStyle.bg} ${gradeStyle.text}`}>{report.safetyGrade}</span>
                                </div>
                                <p className="text-sm text-slate-500 font-mono mt-1">{report.id}</p>
                            </button>
                         );
                    })}
                </div>
            </div>
            {/* Right: Detail View */}
            <div className="lg:col-span-2 flex flex-col h-full">
                {selectedReport ? (
                    <div className="animate-fade-in space-y-4 h-full flex flex-col">
                      <Card className="p-4 flex-shrink-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-2xl font-bold text-slate-800">{selectedReport.assetName}</h3>
                            <p className="text-base text-slate-500 font-mono">{selectedReport.id} (v{selectedReport.version})</p>
                          </div>
                          <div className={`p-3 rounded-lg text-center border-2 ${getGradeAppearance(selectedReport.safetyGrade).border} ${getGradeAppearance(selectedReport.safetyGrade).bg}`}>
                             <p className="text-sm font-bold uppercase text-slate-500">FINAL GRADE</p>
                             <p className={`text-2xl font-extrabold ${getGradeAppearance(selectedReport.safetyGrade).text}`}>{selectedReport.safetyGrade.split(' ')[0]}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t flex justify-between items-center text-sm">
                            <div>
                                <span className="text-slate-500">승인자: </span><span className="font-semibold text-slate-800">{selectedReport.approver}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">승인일: </span><span className="font-semibold text-slate-800">{selectedReport.approvalDate}</span>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md text-sm hover:bg-indigo-700 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>PDF 내보내기</button>
                                <button className="px-3 py-2 bg-white text-slate-600 font-semibold rounded-md border hover:bg-slate-100 text-sm">공유</button>
                            </div>
                        </div>
                      </Card>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow min-h-0">
                          <Card className="md:col-span-2 p-4 flex flex-col">
                            <h4 className="font-bold text-slate-700 mb-2 flex-shrink-0">리포트 원문</h4>
                            <div className="p-2 border rounded-lg overflow-y-auto bg-slate-50/50 flex-grow">
                                {renderMarkdown(selectedReport.fullContent, highlightedEvidence || undefined)}
                            </div>
                          </Card>
                          <div className="space-y-4 flex flex-col">
                              <Card className="p-4">
                                <h4 className="font-bold text-slate-700 mb-2">핵심 근거 데이터</h4>
                                <div className="space-y-2">
                                  {keyEvidence.map(ev => (
                                    <div key={ev.id} onMouseEnter={() => setHighlightedEvidence(ev.highlight)} onMouseLeave={() => setHighlightedEvidence(null)} className="p-2 bg-slate-100 rounded-md cursor-pointer hover:bg-indigo-100 transition-colors">
                                      <p className="text-sm font-semibold text-slate-800">{ev.text}</p>
                                    </div>
                                  ))}
                                </div>
                              </Card>
                               <Card className="p-4 flex-grow flex flex-col">
                                <h4 className="font-bold text-slate-700 mb-2 flex-shrink-0">결재 타임라인</h4>
                                <div className="overflow-y-auto flex-grow pr-2">
                                {selectedReport.auditTrail && <AuditTrail trail={selectedReport.auditTrail} />}
                                </div>
                              </Card>
                          </div>
                      </div>
                    </div>
                ) : (
                    <Card className="flex items-center justify-center h-full text-slate-500">
                        <p>열람할 리포트를 선택하세요.</p>
                    </Card>
                )}
            </div>
        </div>
    );
};


interface ReportsViewProps {
  activeSubView: string;
  assets: Asset[];
  reports: ReviewReport[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ activeSubView, assets, reports }) => {
  const subView = activeSubView.split(' > ')[1] || '새 리포트';

  const renderContent = () => {
    switch(subView) {
      case '새 리포트':
        return <NewReportView assets={assets} />;
      case '검토 중':
        return <ReportsInReviewView reports={reports} />;
      case '승인됨':
        return <ApprovedReportsView reports={reports} />;
      default:
        return <NewReportView assets={assets} />;
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-slate-900">{activeSubView.replace(' > ', ' - ')}</h2>
      {renderContent()}
    </div>
  );
};

export default ReportsView;