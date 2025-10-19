
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
  },
  {
    id: 'STRUC-RAIL-003',
    name: '경부고속철도 제2구간 교량 모니터링',
    description: '경부고속철도 2구간에 위치한 주요 장대교량의 실시간 진동 및 변위 모니터링.',
    team: [
      { id: 'user-001', name: '김철수', role: 'Project Manager', avatarUrl: 'https://i.pravatar.cc/150?u=user-001' },
      { id: 'user-002', name: '이영희', role: 'Lead Structural Engineer', avatarUrl: 'https://i.pravatar.cc/150?u=user-002' },
      { id: 'user-005', name: '정다인', role: 'Data Analyst', avatarUrl: 'https://i.pravatar.cc/150?u=user-005' },
    ],
    documents: [
      { id: 'doc-03', name: '2025년 2분기 진동 분석 리포트', type: '리포트', link: '#', lastUpdated: '2025-06-28' },
    ],
    activity: [
        { id: 'act-03', description: "'KTX 제2한강철교' 자산 추가", user: '김철수', timestamp: '10일 전' },
    ]
  },
  {
    id: 'STRUC-BUSAN-TOWER-01',
    name: '부산 LCT 타워 풍하중 및 내진 성능 평가',
    description: '부산 해운대에 위치한 초고층 빌딩 LCT 타워의 풍하중 응답 및 내진 성능 실시간 분석.',
    team: [
      { id: 'user-004', name: '최현우', role: 'Lead Structural Engineer', avatarUrl: 'https://i.pravatar.cc/150?u=user-004' },
      { id: 'user-008', name: '한지민', role: 'AI Specialist', avatarUrl: 'https://i.pravatar.cc/150?u=user-008' },
      { id: 'user-006', name: '강지원', role: 'Safety Inspector', avatarUrl: 'https://i.pravatar.cc/150?u=user-006' },
    ],
    documents: [
      { id: 'doc-04', name: '풍동실험 결과 보고서', type: '리포트', link: '#', lastUpdated: '2023-01-20' },
      { id: 'doc-05', name: '내진성능평가 최종 보고서', type: '리포트', link: '#', lastUpdated: '2024-05-10' },
    ],
    activity: [
        { id: 'act-04', description: "'LCT-CORE-SENSOR-01' 센서 교체", user: '강지원', timestamp: '5일 전' },
    ]
  },
  {
    id: 'STRUC-TUNNEL-GANGWON-01',
    name: '강원도 구 국도 터널 정밀안전진단',
    description: '노후화된 강원도 소재 구 국도 터널의 구조적 안정성 및 보수보강 필요성 진단.',
    team: [
      { id: 'user-007', name: '윤서준', role: 'Geotechnical Engineer', avatarUrl: 'https://i.pravatar.cc/150?u=user-007' },
      { id: 'user-003', name: '박민준', role: 'Field Inspector', avatarUrl: 'https://i.pravatar.cc/150?u=user-003' },
    ],
    documents: [
      { id: 'doc-06', name: '터널 내벽 균열 지도 (2025)', type: '설계도', link: '#', lastUpdated: '2025-07-15' },
    ],
    activity: [
        { id: 'act-05', description: "변위계 'TUN-DISP-03' 경고 임계값 초과", user: '시스템', timestamp: '2시간 전' },
    ]
  },
  {
    id: 'STRUC-DAM-CHUNGJU-01',
    name: '충주 다목적댐 실시간 누수 및 변형 모니터링',
    description: '충주 다목적댐의 댐체 변위, 누수량, 수압 등을 실시간으로 모니터링하여 안정성을 평가.',
    team: [
      { id: 'user-001', name: '김철수', role: 'Project Manager', avatarUrl: 'https://i.pravatar.cc/150?u=user-001' },
      { id: 'user-007', name: '윤서준', role: 'Geotechnical Engineer', avatarUrl: 'https://i.pravatar.cc/150?u=user-007' },
    ],
    documents: [
      { id: 'doc-07', name: '2025년 상반기 안전점검 종합보고서', type: '리포트', link: '#', lastUpdated: '2025-09-01' },
    ],
    activity: [
        { id: 'act-06', description: "누수 센서 'DAM-LEAK-W10' 점검", user: '윤서준', timestamp: '7일 전' },
    ]
  },
  {
    id: 'STRUC-STADIUM-WC-01',
    name: '서울월드컵경기장 지붕 구조물 안전성 평가',
    description: '서울월드컵경기장의 대공간 케이블 지붕 구조물에 대한 장력 및 변위 모니터링.',
    team: [
      { id: 'user-002', name: '이영희', role: 'Lead Structural Engineer', avatarUrl: 'https://i.pravatar.cc/150?u=user-002' },
      { id: 'user-005', name: '정다인', role: 'Data Analyst', avatarUrl: 'https://i.pravatar.cc/150?u=user-005' },
    ],
    documents: [
      { id: 'doc-08', name: '지붕 케이블 장력 측정 데이터 (2025)', type: '기타', link: '#', lastUpdated: '2025-08-16' },
    ],
    activity: [
        { id: 'act-07', description: "리포트 'REP-250815-002' 제출", user: '이영희', timestamp: '1개월 전' },
    ]
  },
  {
    id: 'STRUC-PORT-INCHEON-01',
    name: '인천 신항 컨테이너 크레인 구조 진단',
    description: '인천 신항에 설치된 대형 컨테이너 크레인의 피로 수명 평가 및 구조 건전성 모니터링.',
    team: [
      { id: 'user-004', name: '최현우', role: 'Lead Structural Engineer', avatarUrl: 'https://i.pravatar.cc/150?u=user-004' },
      { id: 'user-006', name: '강지원', role: 'Safety Inspector', avatarUrl: 'https://i.pravatar.cc/150?u=user-006' },
    ],
    documents: [
        { id: 'doc-09', name: '크레인 구조해석 모델링 파일', type: '기타', link: '#', lastUpdated: '2023-11-01' },
    ],
    activity: [
        { id: 'act-08', description: "변형률 센서 'CRN-STR-08' 신규 설치", user: '강지원', timestamp: '12일 전' },
    ]
  },
  {
    id: 'STRUC-SUBWAY-SEOUL-09',
    name: '서울 지하철 9호선 인접 공사 영향 분석',
    description: '서울 지하철 9호선 노선 인근에서 진행되는 대규모 건축 공사의 영향 분석 및 역사 구조물 안정성 모니터링.',
    team: [
      { id: 'user-007', name: '윤서준', role: 'Geotechnical Engineer', avatarUrl: 'https://i.pravatar.cc/150?u=user-007' },
      { id: 'user-003', name: '박민준', role: 'Field Inspector', avatarUrl: 'https://i.pravatar.cc/150?u=user-003' },
    ],
    documents: [
      { id: 'doc-10', name: '계측관리 중간보고서', type: '리포트', link: '#', lastUpdated: '2025-10-05' },
    ],
    activity: [
        { id: 'act-09', description: "'9-STATION-05' 자산 추가", user: '윤서준', timestamp: '1개월 전' },
    ]
  },
  {
    id: 'STRUC-HERITAGE-SUWON-01',
    name: '수원 화성 성곽 구조 안정성 모니터링',
    description: '유네스코 세계문화유산인 수원 화성 성곽의 주요 구조물에 대한 변위 및 기울기 모니터링.',
    team: [
      { id: 'user-001', name: '김철수', role: 'Project Manager', avatarUrl: 'https://i.pravatar.cc/150?u=user-001' },
      { id: 'user-006', name: '강지원', role: 'Safety Inspector', avatarUrl: 'https://i.pravatar.cc/150?u=user-006' },
    ],
    documents: [
      { id: 'doc-11', name: '2025년 정기 안전점검 결과보고서', type: '리포트', link: '#', lastUpdated: '2025-10-01' },
    ],
    activity: [
        { id: 'act-10', description: "'HWASUNG-WALL-E03' 경사계 데이터 분석", user: '강지원', timestamp: '6일 전' },
    ]
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
    snapshot_url: 'https://images.pexels.com/photos/1643221/pexels-photo-1643221.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
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
    snapshot_url: 'https://images.pexels.com/photos/373934/pexels-photo-373934.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
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
    snapshot_url: 'https://images.pexels.com/photos/2883153/pexels-photo-2883153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    design: { material: 'Steel (강재)', year: 1995 },
    sensors: [
        { sensor_id: 'TEMP-PIPE-01', type: 'temperature', unit: '°C' },
        { sensor_id: 'STRN-PIPE-02', type: 'strain', unit: 'με' },
    ],
    tags: ['노후시설', '강구조'],
  },
  {
    asset_id: 'KR-BRIDGE-05',
    project_id: 'STRUC-RAIL-003',
    name: 'KTX 제2한강철교',
    type: '철도교량',
    location: '서울시 동작구',
    last_inspection_date: '2025-09-20',
    snapshot_url: 'https://images.pexels.com/photos/226466/pexels-photo-226466.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    design: { material: 'Steel Box Girder', year: 2004, seismic_grade: 'I' },
    sensors: [
        { sensor_id: 'ACC-KTX-01', type: 'accelerometer', unit: 'g' },
        { sensor_id: 'DISP-KTX-02', type: 'displacement', unit: 'mm' },
    ],
    tags: ['고속철도', '강교'],
  },
  {
    asset_id: 'LCT-LANDMARK-TOWER',
    project_id: 'STRUC-BUSAN-TOWER-01',
    name: 'LCT 랜드마크 타워',
    type: '초고층 빌딩',
    location: '부산시 해운대구',
    last_inspection_date: '2025-10-01',
    snapshot_url: 'https://images.pexels.com/photos/10981358/pexels-photo-10981358.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    design: { material: 'RC (철근콘크리트)', year: 2019, seismic_grade: '특' },
    sensors: [
      { sensor_id: 'ACC-LCT-TOP', type: 'accelerometer', unit: 'g' },
      { sensor_id: 'STRN-LCT-CORE', type: 'strain', unit: 'με' },
    ],
    tags: ['초고층', '내진특등급'],
  },
  {
    asset_id: 'TUN-GW-003',
    project_id: 'STRUC-TUNNEL-GANGWON-01',
    name: '구 대관령 터널',
    type: '도로 터널',
    location: '강원도 평창군',
    last_inspection_date: '2025-07-11',
    snapshot_url: 'https://images.pexels.com/photos/159624/tunnel-light-car-fast-159624.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    design: { material: 'NATM', year: 1975 },
    sensors: [
        { sensor_id: 'DISP-TUN-03', type: 'displacement', unit: 'mm' },
    ],
    tags: ['노후시설', '터널'],
  },
  {
    asset_id: 'DAM-CJ-MAIN',
    project_id: 'STRUC-DAM-CHUNGJU-01',
    name: '충주댐 본댐',
    type: '콘크리트 중력식 댐',
    location: '충청북도 충주시',
    last_inspection_date: '2025-08-30',
    snapshot_url: 'https://images.pexels.com/photos/33355/dam-barrage-댐-저수지.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    design: { material: 'Concrete', year: 1985 },
    sensors: [
        { sensor_id: 'DISP-DAM-Crest', type: 'displacement', unit: 'mm' },
        { sensor_id: 'TEMP-DAM-Body', type: 'temperature', unit: '°C' },
    ],
    tags: ['수자원시설', '댐'],
  },
  {
    asset_id: 'STADIUM-SWS-ROOF',
    project_id: 'STRUC-STADIUM-WC-01',
    name: '서울월드컵경기장 지붕',
    type: '대공간구조',
    location: '서울시 마포구',
    last_inspection_date: '2025-08-15',
    snapshot_url: 'https://images.pexels.com/photos/1341279/pexels-photo-1341279.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    design: { material: 'Steel Cable', year: 2001 },
    sensors: [
        { sensor_id: 'STRN-CABLE-12', type: 'strain', unit: 'με' },
        { sensor_id: 'DISP-ROOF-05', type: 'displacement', unit: 'mm' },
    ],
    tags: ['케이블구조', '경기장'],
  },
  {
    asset_id: 'CRN-INC-008',
    project_id: 'STRUC-PORT-INCHEON-01',
    name: '컨테이너 크레인 8호기',
    type: '항만시설',
    location: '인천광역시 연수구',
    last_inspection_date: '2025-09-18',
    snapshot_url: 'https://images.pexels.com/photos/4481258/pexels-photo-4481258.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    design: { material: 'Steel (강재)', year: 2015 },
    sensors: [
        { sensor_id: 'STRN-CRN-BOOM', type: 'strain', unit: 'με' },
    ],
    tags: ['강구조', '항만'],
  },
  {
    asset_id: 'SUB-9-STATION-05',
    project_id: 'STRUC-SUBWAY-SEOUL-09',
    name: '9호선 신논현역',
    type: '지하철 역사',
    location: '서울시 강남구',
    last_inspection_date: '2025-10-10',
    snapshot_url: 'https://images.pexels.com/photos/1033729/pexels-photo-1033729.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    design: { material: 'RC (철근콘크리트)', year: 2009 },
    sensors: [
        { sensor_id: 'DISP-STN-WALL', type: 'displacement', unit: 'mm' },
        { sensor_id: 'ACC-STN-PLATFORM', type: 'accelerometer', unit: 'g' },
    ],
    tags: ['지하구조물', '교통시설'],
  },
  {
    asset_id: 'HWASUNG-WALL-E03',
    project_id: 'STRUC-HERITAGE-SUWON-01',
    name: '화성 동북포루',
    type: '문화재',
    location: '경기도 수원시',
    last_inspection_date: '2025-09-25',
    snapshot_url: 'https://images.pexels.com/photos/6710675/pexels-photo-6710675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    design: { material: 'Brick and Stone', year: 1796 },
    sensors: [
        { sensor_id: 'TILT-HW-01', type: 'displacement', unit: 'deg' },
    ],
    tags: ['문화재', '조적조'],
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

        const isRecent = i < 5;

        // '주의' 상태 자산 (3개)
        // 1. 한강교 A3 교각 (기존)
        if (isRecent && asset.asset_id === 'BRG-SEOUL-001' && sensor.type === 'displacement') {
            value = 8.5 + Math.random() * 0.5; // SHI ~90 (주의)
        }
        // 2. 강남파이낸스센터
        if (isRecent && asset.asset_id === 'BLD-GANGNAM-007' && sensor.type === 'strain') {
            value = 1280 + Math.random() * 40; // SHI ~85 (주의)
        }
        // 3. A-3 파이프랙
        if (isRecent && asset.asset_id === 'PLT-ULSAN-PIPE-03' && sensor.type === 'temperature') {
            value = 66 + Math.random() * 2; // SHI ~80 (주의)
        }

        // '경고' 상태 자산 (3개)
        // 1. KTX 제2한강철교
        if (isRecent && asset.asset_id === 'KR-BRIDGE-05' && sensor.type === 'accelerometer') {
            value = 0.165 + Math.random() * 0.01; // SHI ~70 (경고)
        }
        // 2. LCT 랜드마크 타워
        if (isRecent && asset.asset_id === 'LCT-LANDMARK-TOWER' && sensor.type === 'strain') {
            value = 1400 + Math.random() * 30; // SHI ~65 (경고)
        }
        // 3. 구 대관령 터널
        if (isRecent && asset.asset_id === 'TUN-GW-003' && sensor.type === 'displacement') {
            value = 10.8 + Math.random() * 0.4; // SHI ~60 (경고)
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
  ],
  'KR-BRIDGE-05': [
    { date: '2025-10-17', description: "가속도(ACC-KTX-01) 경고 임계값 초과", type: 'Alert' },
  ],
  'DAM-CJ-MAIN': [
     { date: '2025-10-01', description: "리포트 'REP-251001-001' 제출", type: 'Info' },
  ]
};

export const MOCK_REVIEW_REPORTS: ReviewReport[] = [
    { id: 'REP-251016-001', assetName: '한강교 A3 교각', assetId: 'BRG-SEOUL-001', status: '검토 중', author: '박민준', reviewer: '이영희', lastModifiedDate: '2025-10-16', safetyGrade: 'C등급 (보통)', summary: '균열폭 기준 초과, 상세 분석 필요.', version: 'v1.0' },
    { id: 'REP-250912-003', assetName: '강남파이낸스센터', assetId: 'BLD-GANGNAM-007', status: '수정 요청', author: '김현우', reviewer: '이영희', lastModifiedDate: '2025-09-15', safetyGrade: 'B등급 (양호)', summary: '변형률 데이터 분석 보강 필요.', revisionRequest: '변형률 센서 데이터의 장기 추세 분석을 추가해주세요.', version: 'v1.1' },
    { 
      id: 'REP-250801-015', 
      assetName: '한강교 A3 교각', 
      assetId: 'BRG-SEOUL-001', 
      status: '승인됨', 
      author: '박민준', 
      reviewer: '이영희', 
      approver: '김철수', 
      lastModifiedDate: '2025-08-05', 
      approvalDate: '2025-08-10', 
      safetyGrade: 'B등급 (양호)', 
      summary: '정기 점검 결과 특이사항 없음.', 
      version: 'v1.0',
      auditTrail: [
        { status: '작성됨', user: '박민준', timestamp: '2025-08-01 14:30' },
        { status: '제출됨', user: '박민준', timestamp: '2025-08-01 17:00' },
        { status: '검토됨', user: '이영희', timestamp: '2025-08-05 11:00', notes: '데이터 및 분석 내용 이상 없음. 승인 요청합니다.' },
        { status: '승인됨', user: '김철수', timestamp: '2025-08-10 09:45' }
      ]
    },
    { id: 'REP-250925-001', assetName: 'KTX 제2한강철교', assetId: 'KR-BRIDGE-05', status: '검토 중', author: '정다인', reviewer: '이영희', lastModifiedDate: '2025-09-25', safetyGrade: 'B등급 (양호)', summary: '열차 통과 시 진동 데이터 분석 결과, 허용치 이내임.', version: 'v1.0' },
    { 
      id: 'REP-251002-001', 
      assetName: 'LCT 랜드마크 타워', 
      assetId: 'LCT-LANDMARK-TOWER', 
      status: '승인됨', 
      author: '한지민', 
      reviewer: '최현우', 
      approver: '김철수', 
      lastModifiedDate: '2025-10-02', 
      approvalDate: '2025-10-08', 
      safetyGrade: 'A등급 (최상)', 
      summary: '태풍 대비 풍하중 모니터링 결과 이상 없음.', 
      version: 'v1.0',
      auditTrail: [
        { status: '작성됨', user: '한지민', timestamp: '2025-10-02 10:00' },
        { status: '제출됨', user: '한지민', timestamp: '2025-10-02 11:30' },
        { status: '검토됨', user: '최현우', timestamp: '2025-10-06 16:00', notes: '확인 완료.' },
        { status: '승인됨', user: '김철수', timestamp: '2025-10-08 10:10' }
      ]
    },
    { id: 'REP-251001-001', assetName: '충주댐 본댐', assetId: 'DAM-CJ-MAIN', status: '승인 대기', author: '윤서준', reviewer: '김철수', lastModifiedDate: '2025-10-01', safetyGrade: 'B등급 (양호)', summary: '누수량 및 변위 계측 결과 안정 범위 내 유지 중.', version: 'v1.0' },
    { 
      id: 'REP-250820-003', 
      assetName: '서울월드컵경기장 지붕', 
      assetId: 'STADIUM-SWS-ROOF', 
      status: '승인됨', 
      author: '이영희', 
      reviewer: '김철수', 
      approver: '김철수', 
      lastModifiedDate: '2025-08-20', 
      approvalDate: '2025-08-25', 
      safetyGrade: 'B등급 (양호)', 
      summary: '하절기 케이블 장력 측정 결과 특이사항 없음.', 
      version: 'v1.0',
      auditTrail: [
        { status: '작성됨', user: '이영희', timestamp: '2025-08-20 13:00' },
        { status: '제출됨', user: '이영희', timestamp: '2025-08-20 13:05' },
        { status: '검토됨', user: '김철수', timestamp: '2025-08-22 18:00', notes: '확인.'},
        { status: '승인됨', user: '김철수', timestamp: '2025-08-25 11:00' }
      ]
    },
    { 
      id: 'REP-251010-002', 
      assetName: '수원 화성 동북포루', 
      assetId: 'HWASUNG-WALL-E03', 
      status: '승인됨', 
      author: '강지원', 
      reviewer: '김철수', 
      approver: '김철수', 
      lastModifiedDate: '2025-10-10', 
      approvalDate: '2025-10-15', 
      safetyGrade: 'A등급 (최상)', 
      summary: '정기 계측 결과 구조적 안정성 양호.', 
      version: 'v2.1',
      auditTrail: [
        { status: '작성됨', user: '강지원', timestamp: '2025-10-10 09:00' },
        { status: '제출됨', user: '강지원', timestamp: '2025-10-10 09:30' },
        { status: '검토됨', user: '김철수', timestamp: '2025-10-12 14:00', notes: 'v2.1 업데이트 내용 확인.' },
        { status: '승인됨', user: '김철수', timestamp: '2025-10-15 10:00' }
      ]
    },
];

export const MOCK_ANOMALIES: Anomaly[] = [
  { id: 'ANM-251016-001', timestamp: '2025-10-16 09:10:32', assetId: 'BRG-SEOUL-001', assetName: '한강교 A3 교각', sensorId: 'ACC-P3-01', sensorType: 'accelerometer', value: 0.143, threshold: 0.12, unit: 'g', level: '경고', status: 'New', aiSummary: "가속도 센서에서 단기적인 충격 감지. 임계값 19% 초과.", aiCause: "대형 화물차량의 과속 또는 충돌 가능성", aiAction: "CCTV 확인 및 현장 순찰 권고" },
  { id: 'ANM-251016-002', timestamp: '2025-10-16 09:05:11', assetId: 'BRG-SEOUL-001', assetName: '한강교 A3 교각', sensorId: 'DISP-P3-02', sensorType: 'displacement', value: 9.1, threshold: 8.0, unit: 'mm', level: '경고', status: 'Acknowledged', aiSummary: "변위 센서에서 지속적인 임계값 초과 감지.", aiCause: "구조적 변형 또는 센서 오류 가능성", aiAction: "정밀 데이터 분석 및 점검팀 파견 필요" },
  { id: 'ANM-251017-001', timestamp: '2025-10-17 08:30:00', assetId: 'KR-BRIDGE-05', assetName: 'KTX 제2한강철교', sensorId: 'ACC-KTX-01', sensorType: 'accelerometer', value: 0.131, threshold: 0.12, unit: 'g', level: '경고', status: 'New', aiSummary: "열차 통과 시 비정상적인 진동 패턴 감지.", aiCause: "선로 이상 또는 차량의 불균형 가능성", aiAction: "유사 시간대 데이터 비교 분석 및 선로 점검팀 통보" },
  { id: 'ANM-251017-002', timestamp: '2025-10-17 02:00:15', assetId: 'TUN-GW-003', assetName: '구 대관령 터널', sensorId: 'DISP-TUN-03', sensorType: 'displacement', value: 13.5, threshold: 12.0, unit: 'mm', level: '위험', status: 'In Progress', aiSummary: "터널 내벽 변위가 위험 임계값을 초과. 붕괴 위험.", aiCause: "주변 지반 변형 또는 지하수위 급변 가능성", aiAction: "즉시 현장 접근 통제 및 긴급 안전 진단 실시" },
  { id: 'ANM-251015-001', timestamp: '2025-10-15 14:00:50', assetId: 'BLD-GANGNAM-007', assetName: '강남파이낸스센터', sensorId: 'STRN-C-05', sensorType: 'strain', value: 1450, threshold: 1200, unit: 'με', level: '위험', status: 'In Progress', aiSummary: "변형률 센서에서 위험 임계값 초과. 구조적 과부하 의심.", aiCause: "미확인 하중 증가 또는 구조 부재 손상", aiAction: "즉시 현장 접근 통제 및 긴급 안전 진단팀 구성" },
  { id: 'ANM-251014-003', timestamp: '2025-10-14 18:30:00', assetId: 'PLT-ULSAN-PIPE-03', assetName: 'A-3 파이프랙', sensorId: 'TEMP-PIPE-01', sensorType: 'temperature', value: 88, threshold: 80, unit: '°C', level: '위험', status: 'Resolved', aiSummary: "온도 센서 위험 임계값 초과. 화재 위험.", aiCause: "배관 과열 또는 단열재 파손", aiAction: "긴급 냉각 조치 및 원인 파악 완료됨" },
  { id: 'ANM-251013-001', timestamp: '2025-10-13 11:45:00', assetId: 'STADIUM-SWS-ROOF', assetName: '서울월드컵경기장 지붕', sensorId: 'STRN-CABLE-12', sensorType: 'strain', value: 1350, threshold: 1200, unit: 'με', level: '경고', status: 'Acknowledged', aiSummary: "지붕 케이블 장력 센서에서 경고 임계값 초과.", aiCause: "강풍 또는 적설 하중의 영향 가능성", aiAction: "기상 데이터와 상관관계 분석 및 전반적인 케이블 장력 재점검 필요" },
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
    { 
      id: 'user-001', name: '김철수', email: 'cskim@struc.ai', role: 'Admin', lastLogin: '2025-10-16 10:30', status: 'Active', 
      projectAccess: ['STRUC-SEOUL-BRIDGE-01', 'STRUC-PLANT-002', 'STRUC-DAM-CHUNGJU-01', 'STRUC-HERITAGE-SUWON-01'], 
      twoFactorEnabled: true,
      activity: [
        { id: 'act-u1-1', action: '로그인', target: '시스템', timestamp: '2025-10-16 10:30:15' },
        { id: 'act-u1-2', action: '리포트 승인', target: 'REP-251010-002', timestamp: '2025-10-15 10:00:00' },
        { id: 'act-u1-3', action: '사용자 역할 변경', target: '이영희 (Engineer -> Project Manager)', timestamp: '2025-10-14 11:05:00', critical: true },
        { id: 'act-u1-4', action: '자산 추가', target: '한강교 A3 교각', timestamp: '2025-10-12 09:40:21' },
      ]
    },
    { 
      id: 'user-002', name: '이영희', email: 'yhlee@struc.ai', role: 'Project Manager', lastLogin: '2025-10-16 09:15', status: 'Active', 
      projectAccess: ['STRUC-SEOUL-BRIDGE-01', 'STRUC-RAIL-003', 'STRUC-STADIUM-WC-01'], 
      twoFactorEnabled: true,
      activity: [
        { id: 'act-u2-1', action: '로그인', target: '시스템', timestamp: '2025-10-16 09:15:45' },
        { id: 'act-u2-2', action: '리포트 검토', target: 'REP-251016-001', timestamp: '2025-10-16 09:20:11' },
        { id: 'act-u2-3', action: '자산 정보 조회', target: 'KTX 제2한강철교', timestamp: '2025-10-15 14:30:00' },
      ]
    },
    { 
      id: 'user-003', name: '박민준', email: 'mjpark@struc.ai', role: 'Engineer', lastLogin: '2025-10-15 17:45', status: 'Active', 
      projectAccess: ['STRUC-SEOUL-BRIDGE-01', 'STRUC-TUNNEL-GANGWON-01', 'STRUC-SUBWAY-SEOUL-09'], 
      twoFactorEnabled: false,
      activity: [
        { id: 'act-u3-1', action: '로그인', target: '시스템', timestamp: '2025-10-15 17:45:03' },
        { id: 'act-u3-2', action: '리포트 제출', target: 'REP-251016-001', timestamp: '2025-10-16 17:00:00' },
        { id: 'act-u3-3', action: 'QA 질의', target: '기술자료 QA', timestamp: '2025-10-15 18:00:15' },
      ]
    },
    { 
      id: 'user-004', name: '최현우', email: 'hwchoi@struc.ai', role: 'Inspector', lastLogin: '2025-10-14 11:20', status: 'Active', 
      projectAccess: ['STRUC-PLANT-002', 'STRUC-BUSAN-TOWER-01', 'STRUC-PORT-INCHEON-01'], 
      twoFactorEnabled: true,
      activity: [
        { id: 'act-u4-1', action: '로그인', target: '시스템', timestamp: '2025-10-14 11:20:00' },
      ]
    },
    { id: 'user-005', name: '정다인', email: 'dijung@struc.ai', role: 'Engineer', lastLogin: '초대 대기 중', status: 'Invited', projectAccess: [], twoFactorEnabled: false },
    { id: 'user-006', name: '강지원', email: 'jwkang@struc.ai', role: 'Project Manager', lastLogin: '2025-09-28 14:00', status: 'Deactivated', projectAccess: ['STRUC-BUSAN-TOWER-01', 'STRUC-PORT-INCHEON-01', 'STRUC-HERITAGE-SUWON-01'], twoFactorEnabled: true },
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
    { id: 'src-006', sourceName: 'KTX 제2한강철교 진동 센서', assetName: 'KTX 제2한강철교', dataType: 'Sensor Stream', status: 'Online', lastReceived: '1분 미만', frequency: '10Hz', dataVolume24h: '12.5M Records', avgLatencyMs: 120 },
    { id: 'src-007', sourceName: 'LCT 타워 풍하중 센서', assetName: 'LCT 랜드마크 타워', dataType: 'Sensor Stream', status: 'Online', lastReceived: '1분 미만', frequency: '2Hz', dataVolume24h: '4.2M Records', avgLatencyMs: 220 },
    { id: 'src-008', sourceName: '구 대관령 터널 변위계', assetName: '구 대관령 터널', dataType: 'Sensor Stream', status: 'Online', lastReceived: '5분 미만', frequency: '0.1Hz', dataVolume24h: '120K Records', avgLatencyMs: 800 },
    { id: 'src-009', sourceName: '충주댐 본댐 계측 시스템', assetName: '충주댐 본댐', dataType: 'Sensor Stream', status: 'Online', lastReceived: '10분 미만', frequency: '0.05Hz', dataVolume24h: '60K Records', avgLatencyMs: 1500 },
    { id: 'src-010', sourceName: '인천 신항 크레인 데이터', assetName: '컨테이너 크레인 8호기', dataType: 'Sensor Stream', status: 'Offline', lastReceived: '8시간 전', frequency: '1Hz', dataVolume24h: '2.0M Records', avgLatencyMs: 400 },
    { id: 'src-011', sourceName: '수원화성 정기계측 데이터', assetName: '화성 동북포루', dataType: 'Manual Upload', status: 'Online', lastReceived: '2025-09-25', frequency: 'Quarterly', dataVolume24h: '1.2K Records', avgLatencyMs: 20 },
];

export const MOCK_ETL_STATS = {
    totalSources: MOCK_DATA_SOURCES.length,
    onlineSources: MOCK_DATA_SOURCES.filter(s => s.status === 'Online').length,
    ingestionRate: '1,520', // points/min
    errors24h: MOCK_DATA_SOURCES.filter(s => s.status === 'Error').length,
};

export const MOCK_INGESTION_HISTORY: { hour: string; points: number }[] = Array.from({ length: 24 }, (_, i) => {
    const base = 85000 + Math.random() * 10000;
    const hour = `${(23 - i).toString().padStart(2, '0')}:00`;
    // Simulate a dip
    if (i > 3 && i < 6) return { hour, points: base * 0.4 };
    return { hour, points: base };
}).reverse();