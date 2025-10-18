import { ProjectDetail, Asset, SensorReading, ReviewReport, Thresholds, Anomaly, RagDoc, NotificationPolicies, ReportTemplate, AlertTemplate, User, ManagedRagDoc, DataSource } from './types';

export const USER_MENU = {
  '종합 현황 대시보드': [],
  '리포트': ['새 리포트', '검토 중', '승인됨'],
  'SHM 모니터링': ['이상 알림', '라이브 스트림'],
  '기술자료 QA': [],
};

export const ADMIN_MENU = {
  '프로젝트 관리': ['프로젝트/자산', '팀원 관리'],
  '시스템 설정': ['임계값 및 정책', '리포트 템플릿'],
  '고급 설정': ['사용자 및 역할', 'AI 모델 / RAG', '데이터 수집 / ETL'],
};

export const MOCK_PROJECTS: ProjectDetail[] = [
  {
    id: 'STRUC-SEOUL-BRIDGE-01',
    name: '서울 한강교량 안전성 평가',
    description: '서울시 내 주요 한강 교량의 구조적 안전성 평가 및 실시간 모니터링 프로젝트입니다.',
    team: [
      { id: 'user-001', name: '김철수', role: 'Project Manager', avatarUrl: 'https://i.pravatar.cc/150?u=user-001' },
      { id: 'user-002', name: '이영희', role: 'Lead Structural Engineer', avatarUrl: 'https://i.pravatar.cc/150?u=user-002' },
      { id: 'user-003', name: '박민준', role: 'Field Inspector', avatarUrl: 'https://i.pravatar.cc/150?u=user-003' },
    ],
    documents: [
      { id: 'doc-01', name: '2025년 3분기 정기점검 리포트', type: '리포트', link: '#', lastUpdated: '2025-09-30' },
      { id: 'doc-02', name: 'A3 교각 구조 설계도 (v2.1)', type: '설계도', link: '#', lastUpdated: '2022-01-15' },
    ],
    activity: [
        { id: 'act-01', description: "'한강교 A3 교각' 자산 추가", user: '김철수', timestamp: '3일 전' },
        { id: 'act-02', description: "리포트 'REP-251016-001' 제출", user: '박민준', timestamp: '1일 전' },
    ]
  },
  {
    id: 'STRUC-PLANT-002',
    name: '울산 국가산업단지 플랜트 구조 진단',
    description: '울산 국가산업단지 내 노후화된 플랜트 구조물의 정밀 안전 진단 프로젝트입니다.',
    team: [
      { id: 'user-001', name: '김철수', role: 'Project Manager', avatarUrl: 'https://i.pravatar.cc/150?u=user-001' },
      { id: 'user-004', name: '최현우', role: 'Lead Structural Engineer', avatarUrl: 'https://i.pravatar.cc/150?u=user-004' },
    ],
    documents: [],
    activity: [],
  }
];

export const MOCK_ASSETS: Asset[] = [
  {
    asset_id: 'BRG-SEOUL-001',
    project_id: 'STRUC-SEOUL-BRIDGE-01',
    name: '한강교 A3 교각',
    type: '교량 교각',
    location: '서울시 용산구',
    last_inspection_date: '2025-10-15',
    design: { material: 'RC (철근콘크리트)', year: 1988, post_tension: true, seismic_grade: 'I' },
    sensors: [
      { sensor_id: 'ACC-P3-01', type: 'accelerometer', unit: 'g' },
      { sensor_id: 'DISP-P3-02', type: 'displacement', unit: 'mm' },
      { sensor_id: 'STRN-P3-03', type: 'strain', unit: 'με' },
      { sensor_id: 'TEMP-P3-04', type: 'temperature', unit: '°C' },
    ],
    tags: ['주요교통시설', '내진1등급', '포스트텐션'],
  },
  {
    asset_id: 'BLD-GANGNAM-007',
    project_id: 'STRUC-SEOUL-BRIDGE-01',
    name: '강남파이낸스센터',
    type: '초고층 빌딩',
    location: '서울시 강남구',
    last_inspection_date: '2025-08-22',
    design: { material: 'SRC (철골철근콘크리트)', year: 2001, seismic_grade: 'II' },
    sensors: [
      { sensor_id: 'ACC-C-01', type: 'accelerometer', unit: 'g' },
      { sensor_id: 'STRN-C-05', type: 'strain', unit: 'με' },
    ],
    tags: ['업무시설', '내진2등급'],
  },
  {
    asset_id: 'PLT-ULSAN-PIPE-03',
    project_id: 'STRUC-PLANT-002',
    name: 'A-3 파이프랙',
    type: '플랜트 구조물',
    location: '울산광역시 남구',
    last_inspection_date: '2025-09-05',
    design: { material: 'Steel (강재)', year: 1995 },
    sensors: [
        { sensor_id: 'TEMP-PIPE-01', type: 'temperature', unit: '°C' },
        { sensor_id: 'STRN-PIPE-02', type: 'strain', unit: 'με' },
    ],
    tags: ['노후시설', '강구조'],
  }
];

// Generate mock sensor data
const generateReadings = (): SensorReading[] => {
  const readings: SensorReading[] = [];
  const now = new Date();
  MOCK_ASSETS.forEach(asset => {
    asset.sensors.forEach(sensor => {
      for (let i = 0; i < 50; i++) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000).toISOString();
        let value = 0;
        switch (sensor.type) {
          case 'accelerometer': value = Math.random() * 0.1; break;
          case 'displacement': value = Math.random() * 5; break;
          case 'strain': value = 800 + Math.random() * 200; break;
          case 'temperature': value = 15 + Math.random() * 10; break;
        }
        if (asset.asset_id === 'BRG-SEOUL-001' && sensor.type === 'displacement' && i < 5) {
            value = 8.5 + Math.random() * 1; // Anomaly
        }
        readings.push({ asset_id: asset.asset_id, sensor_id: sensor.sensor_id, timestamp, value });
      }
    });
  });
  return readings;
};
export const MOCK_SENSOR_READINGS = generateReadings();

export const MOCK_THRESHOLDS_DEFAULT: Thresholds = {
  accelerometer: { warning: 0.12, critical: 0.2, filter: 'raw', active: true },
  displacement: { warning: 8.0, critical: 12.0, filter: 'moving_avg_5m', active: true },
  strain: { warning: 1200, critical: 1500, filter: 'kalman', active: true },
  temperature: { warning: 60, critical: 80, filter: 'raw', active: true },
};

export const MOCK_ASSET_EVENT_LOG: { [key: string]: { date: string; description: string; type: 'Alert' | 'Info' | 'Maintenance' }[] } = {
  'BRG-SEOUL-001': [
    { date: '2025-10-16', description: "변위(DISP-P3-02) 경고 임계값 초과", type: 'Alert' },
    { date: '2025-09-30', description: "정기 점검 리포트 제출", type: 'Info' },
  ]
};

export const MOCK_REVIEW_REPORTS: ReviewReport[] = [
    { id: 'REP-251016-001', assetName: '한강교 A3 교각', assetId: 'BRG-SEOUL-001', status: '검토 중', author: '박민준', reviewer: '이영희', lastModifiedDate: '2025-10-16', safetyGrade: 'C등급 (보통)', summary: '균열폭 기준 초과, 상세 분석 필요.', version: 'v1.0' },
    { id: 'REP-250912-003', assetName: '강남파이낸스센터', assetId: 'BLD-GANGNAM-007', status: '수정 요청', author: '김현우', reviewer: '이영희', lastModifiedDate: '2025-09-15', safetyGrade: 'B등급 (양호)', summary: '변형률 데이터 분석 보강 필요.', revisionRequest: '변형률 센서 데이터의 장기 추세 분석을 추가해주세요.', version: 'v1.1' },
    { id: 'REP-250801-015', assetName: '한강교 A3 교각', assetId: 'BRG-SEOUL-001', status: '승인됨', author: '박민준', reviewer: '이영희', approver: '김철수', lastModifiedDate: '2025-08-05', approvalDate: '2025-08-10', safetyGrade: 'B등급 (양호)', summary: '정기 점검 결과 특이사항 없음.', version: 'v1.0' },
];

export const MOCK_ANOMALIES: Anomaly[] = [
  { id: 'ANM-251016-001', timestamp: '2025-10-16 09:10:32', assetId: 'BRG-SEOUL-001', assetName: '한강교 A3 교각', sensorId: 'ACC-P3-01', sensorType: 'accelerometer', value: 0.143, threshold: 0.12, unit: 'g', level: '경고', status: 'New', aiSummary: "가속도 센서에서 단기적인 충격 감지. 임계값 19% 초과.", aiCause: "대형 화물차량의 과속 또는 충돌 가능성", aiAction: "CCTV 확인 및 현장 순찰 권고" },
  { id: 'ANM-251016-002', timestamp: '2025-10-16 09:05:11', assetId: 'BRG-SEOUL-001', assetName: '한강교 A3 교각', sensorId: 'DISP-P3-02', sensorType: 'displacement', value: 9.1, threshold: 8.0, unit: 'mm', level: '경고', status: 'Acknowledged', aiSummary: "변위 센서에서 지속적인 임계값 초과 감지.", aiCause: "구조적 변형 또는 센서 오류 가능성", aiAction: "정밀 데이터 분석 및 점검팀 파견 필요" },
  { id: 'ANM-251015-001', timestamp: '2025-10-15 14:00:50', assetId: 'BLD-GANGNAM-007', assetName: '강남파이낸스센터', sensorId: 'STRN-C-05', sensorType: 'strain', value: 1450, threshold: 1200, unit: 'με', level: '위험', status: 'In Progress', aiSummary: "변형률 센서에서 위험 임계값 초과. 구조적 과부하 의심.", aiCause: "미확인 하중 증가 또는 구조 부재 손상", aiAction: "즉시 현장 접근 통제 및 긴급 안전 진단팀 구성" },
  { id: 'ANM-251014-003', timestamp: '2025-10-14 18:30:00', assetId: 'PLT-ULSAN-PIPE-03', assetName: 'A-3 파이프랙', sensorId: 'TEMP-PIPE-01', sensorType: 'temperature', value: 88, threshold: 80, unit: '°C', level: '위험', status: 'Resolved', aiSummary: "온도 센서 위험 임계값 초과. 화재 위험.", aiCause: "배관 과열 또는 단열재 파손", aiAction: "긴급 냉각 조치 및 원인 파악 완료됨" },
];

export const MOCK_RAG_DOCS: RagDoc[] = [
    { id: 'KBCS-2022-CH05-S7.3', title: '콘크리트구조 설계기준 (KBCS 2022)', snippet: '...일반적인 환경에 노출된 철근콘크리트 부재의 허용 균열폭은 0.3mm를 초과하지 않아야 한다...' },
    { id: 'PT-GUIDE-2019-S5.2', title: '포스트텐션 구조물 유지관리 가이드라인 (2019)', snippet: '...정착구 주변에 발생하는 방사형 균열은 프리스트레스 손실의 징후일 수 있으므로 즉각적인 조사가 필요하다...' },
    { id: 'KBCS-2022-CH03-S4.1', title: '건축구조기준 내진설계 (KBCS 2022)', snippet: '...내진등급 II 시설물은 평균재현주기 1,000년 지진지반운동(붕괴방지수준)에 대해 붕괴되지 않고...' },
];

export const MOCK_NOTIFICATION_POLICIES: NotificationPolicies = {
  warning: {
    recipients: ['pm', 'engineer'],
    channels: ['dashboard', 'email'],
    escalation: '30분 내 미확인 시 SMS 통보',
  },
  critical: {
    recipients: ['pm', 'engineer', 'senior_manager'],
    channels: ['dashboard', 'email', 'sms', 'push'],
    escalation: '10분 내 미확인 시 모든 채널로 재통보 및 상급자 보고',
  }
};

export const MOCK_REPORT_TEMPLATES: ReportTemplate[] = [
  {
    name: '정기 점검 보고서 (표준)',
    sections: [
      '1. 개요',
      '2. 점검 결과 요약',
      '3. 데이터 기반 분석',
      '4. 종합 평가 및 결론',
      '5. 권고 조치',
      '6. 부록: 점검 사진',
    ],
    aiStyleGuide: '간결/전문가체',
    approvalBox: '작성 - 검토 - 승인',
  }
];

export const MOCK_ALERT_TEMPLATES: AlertTemplate[] = [
  {
    channel: 'email',
    level: 'warning',
    subject: '[주의] {{asset_name}} 센서 데이터 이상 감지',
    body: '시설물명: {{asset_name}}\n센서 ID: {{sensor_id}}\n현재값: {{current_value}} {{unit}}\n임계값: {{threshold_value}} {{unit}}\n\n상세 확인이 필요합니다.',
  },
  {
    channel: 'email',
    level: 'critical',
    subject: '[긴급/위험] {{asset_name}} 센서 임계값 초과',
    body: '시설물명: {{asset_name}}\n센서 ID: {{sensor_id}}\n현재값: {{current_value}} {{unit}}\n임계값: {{threshold_value}} {{unit}}\n\n즉각적인 조치가 필요합니다. 시스템에서 확인 후 대응 바랍니다.',
  },
  {
    channel: 'sms',
    level: 'warning',
    subject: '',
    body: '[주의] {{asset_name}} 이상 감지 ({{sensor_id}}). 값: {{current_value}}{{unit}}. 확인 필요.',
  },
  {
    channel: 'sms',
    level: 'critical',
    subject: '',
    body: '[긴급/위험] {{asset_name}} 임계값 초과 ({{sensor_id}}). 값: {{current_value}}{{unit}}. 즉시 조치 필요.',
  },
];

// Mock data for new Admin Views
export const MOCK_USERS: User[] = [
    { id: 'user-001', name: '김철수', email: 'cskim@struc.ai', role: 'Admin', lastLogin: '2025-10-16 10:30', status: 'Active', projectAccess: ['STRUC-SEOUL-BRIDGE-01', 'STRUC-PLANT-002'], twoFactorEnabled: true },
    { id: 'user-002', name: '이영희', email: 'yhlee@struc.ai', role: 'Project Manager', lastLogin: '2025-10-16 09:15', status: 'Active', projectAccess: ['STRUC-SEOUL-BRIDGE-01'], twoFactorEnabled: true },
    { id: 'user-003', name: '박민준', email: 'mjpark@struc.ai', role: 'Engineer', lastLogin: '2025-10-15 17:45', status: 'Active', projectAccess: ['STRUC-SEOUL-BRIDGE-01'], twoFactorEnabled: false },
    { id: 'user-004', name: '최현우', email: 'hwchoi@struc.ai', role: 'Inspector', lastLogin: '2025-10-14 11:20', status: 'Active', projectAccess: ['STRUC-PLANT-002'], twoFactorEnabled: true },
    { id: 'user-005', name: '정다인', email: 'dijung@struc.ai', role: 'Engineer', lastLogin: '초대 대기 중', status: 'Invited', projectAccess: [], twoFactorEnabled: false },
    { id: 'user-006', name: '강지원', email: 'jwkang@struc.ai', role: 'Project Manager', lastLogin: '2025-09-28 14:00', status: 'Deactivated', projectAccess: ['STRUC-PLANT-002'], twoFactorEnabled: true },
];

export const MOCK_ROLE_PERMISSIONS: { [key in User['role']]: { [category: string]: string[] } } = {
    'Admin': {
        '사용자 관리': ['사용자 초대/수정/비활성화', '역할 및 권한 수정'],
        '프로젝트 관리': ['모든 프로젝트 생성/수정/삭제', '모든 프로젝트 데이터 접근'],
        '시스템 설정': ['전역 임계값 및 정책 수정', '리포트 및 알림 템플릿 관리', 'AI 모델 및 RAG 관리', '데이터 파이프라인(ETL) 관리'],
        '리포트': ['모든 리포트 접근 및 승인'],
    },
    'Project Manager': {
        '사용자 관리': ['할당된 프로젝트에 팀원 초대'],
        '프로젝트 관리': ['할당된 프로젝트 정보 수정', '자산 추가/수정/삭제'],
        '시스템 설정': ['할당된 프로젝트의 임계값 재정의(Override)'],
        '리포트': ['리포트 최종 승인', '리포트 검토 및 수정 요청'],
        'SHM 모니터링': ['알림 확인 및 작업 지시'],
    },
    'Engineer': {
        '프로젝트 관리': ['할당된 프로젝트의 자산 정보 조회'],
        '리포트': ['새 리포트 생성 및 제출', '검토 요청된 리포트 수정'],
        'SHM 모니터링': ['라이브 데이터 조회', '이상 알림 상세 분석'],
        '기술자료 QA': ['기술 문서 조회 및 QA'],
    },
    'Inspector': {
        '리포트': ['현장 점검 데이터 기반 리포트 초안 작성'],
        'SHM 모니터링': ['이상 알림 확인 (읽기 전용)'],
        '기술자료 QA': ['기술 문서 조회 및 QA'],
    },
};

export const MOCK_MANAGED_RAG_DOCS: ManagedRagDoc[] = [
    { id: 'doc-rag-001', fileName: 'KBCS_2022_Full.pdf', fileType: 'PDF', fileSize: '15.8 MB', uploadDate: '2025-01-20', status: 'Indexed', chunkCount: 1258, embeddingModel: 'text-embedding-004' },
    { id: 'doc-rag-002', fileName: 'PT_Maintenance_Guide_2019.pdf', fileType: 'PDF', fileSize: '5.2 MB', uploadDate: '2025-01-20', status: 'Indexed', chunkCount: 312, embeddingModel: 'text-embedding-004' },
    { id: 'doc-rag-003', fileName: 'Steel_Structure_Inspection_Manual.docx', fileType: 'DOCX', fileSize: '2.1 MB', uploadDate: '2025-03-10', status: 'Processing', chunkCount: 0, embeddingModel: 'text-embedding-004' },
    { id: 'doc-rag-004', fileName: 'Seismic_Design_Notes.txt', fileType: 'TXT', fileSize: '12 KB', uploadDate: '2025-05-02', status: 'Error', chunkCount: 0, embeddingModel: 'text-embedding-004' },
];

export const RAG_STATISTICS = {
    totalDocs: MOCK_MANAGED_RAG_DOCS.length,
    indexedDocs: MOCK_MANAGED_RAG_DOCS.filter(d => d.status === 'Indexed').length,
    totalChunks: MOCK_MANAGED_RAG_DOCS.reduce((sum, doc) => sum + doc.chunkCount, 0),
    lastSync: '2025-10-16 14:30:00'
};

export const MODEL_CONFIGURATION = {
    qaModel: 'gemini-2.5-pro',
    systemPrompt: `You are STRUC.AI, a specialized AI assistant for structural engineering. Your purpose is to provide accurate, concise, and actionable answers based *only* on the provided internal technical documents (KBCS, maintenance guides, etc.).
- If the answer is not in the documents, state that clearly. Do not invent information.
- Always cite the source document ID (e.g., KBCS-2022-CH05) for all claims.
- Your tone must be professional, objective, and technical.
- Respond in Korean.`
};

export const MOCK_DATA_SOURCES: DataSource[] = [
    { id: 'src-001', sourceName: '한강교 A3 교각 센서 그룹', assetName: '한강교 A3 교각', dataType: 'Sensor Stream', status: 'Online', lastReceived: '1분 미만', frequency: '1Hz', dataVolume24h: '2.1M Records', avgLatencyMs: 180 },
    { id: 'src-002', sourceName: '강남파이낸스센터 센서 그룹', assetName: '강남파이낸스센터', dataType: 'Sensor Stream', status: 'Online', lastReceived: '1분 미만', frequency: '0.5Hz', dataVolume24h: '1.1M Records', avgLatencyMs: 250 },
    { id: 'src-003', sourceName: 'A-3 파이프랙 센서 그룹', assetName: 'A-3 파이프랙', dataType: 'Sensor Stream', status: 'Error', lastReceived: '2시간 전', frequency: '0.1Hz', dataVolume24h: '80K Records', avgLatencyMs: 1200 },
    { id: 'src-004', sourceName: '2025-3Q 정기점검 데이터', assetName: '한강교 A3 교각', dataType: 'Manual Upload', status: 'Online', lastReceived: '2025-09-30', frequency: 'N/A', dataVolume24h: '5.2K Records', avgLatencyMs: 50 },
    { id: 'src-005', sourceName: '울산 플랜트 진동 데이터', assetName: 'A-3 파이프랙', dataType: 'Batch Import (CSV)', status: 'Offline', lastReceived: '2일 전', frequency: 'Daily', dataVolume24h: '15.8M Records', avgLatencyMs: 350 },
];

export const MOCK_ETL_STATS = {
    totalSources: MOCK_DATA_SOURCES.length,
    onlineSources: MOCK_DATA_SOURCES.filter(s => s.status === 'Online').length,
    ingestionRate: '1,520', // points/min
    errors24h: 3,
};

export const MOCK_INGESTION_HISTORY: { hour: string; points: number }[] = Array.from({ length: 24 }, (_, i) => {
    const base = 85000 + Math.random() * 10000;
    const hour = `${(23 - i).toString().padStart(2, '0')}:00`;
    // Simulate a dip
    if (i > 3 && i < 6) return { hour, points: base * 0.4 };
    return { hour, points: base };
}).reverse();
