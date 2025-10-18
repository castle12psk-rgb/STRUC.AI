export type Mode = 'user' | 'admin';

export type SensorType = 'accelerometer' | 'displacement' | 'strain' | 'temperature';

export interface Sensor {
  sensor_id: string;
  type: SensorType;
  unit: string;
}

export interface Asset {
  asset_id: string;
  project_id: string;
  name: string;
  type: string;
  location: string;
  last_inspection_date?: string;
  design: {
    material: string;
    year: number;
    seismic_grade?: string;
    post_tension?: boolean;
  };
  sensors: Sensor[];
  tags: string[];
}

export interface SensorReading {
  asset_id: string;
  sensor_id: string;
  timestamp: string;
  value: number;
}

export interface EventLogEntry {
  id: string;
  time: string;
  assetId: string;
  asset: string;
  event: string;
  level: '위험' | '경고' | '주의' | '정보';
  sensorId: string;
  value: number;
  threshold: number;
  unit: string;
}

export type ReportStatus = '검토 중' | '수정 요청' | '승인 대기' | '승인됨';

export interface ReviewReport {
  id: string;
  assetName: string;
  assetId: string;
  status: ReportStatus;
  author: string;
  reviewer?: string;
  approver?: string;
  lastModifiedDate: string;
  approvalDate?: string;
  safetyGrade: string;
  summary: string;
  revisionRequest?: string;
  version: string;
}

export interface ThresholdSetting {
  warning: number;
  critical: number;
  filter: 'raw' | 'moving_avg_5m' | 'kalman';
  active: boolean;
}

export type Thresholds = Record<SensorType, ThresholdSetting>;

export type AnomalyStatus = 'New' | 'Acknowledged' | 'In Progress' | 'Resolved';

export interface Anomaly {
  id: string;
  timestamp: string;
  assetId: string;
  assetName: string;
  sensorId: string;
  sensorType: Sensor['type'];
  value: number;
  threshold: number;
  unit: string;
  level: '경고' | '위험';
  status: AnomalyStatus;
  aiSummary: string;
  aiCause: string;
  aiAction: string;
}

export interface RagDoc {
  id: string;
  title: string;
  snippet: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'ai';
  content: string;
  isLoading?: boolean;
  sources?: RagDoc[];
}

export type RecipientRole = 'pm' | 'engineer' | 'inspector' | 'senior_manager';
export type NotificationChannel = 'dashboard' | 'email' | 'sms' | 'push';

export interface NotificationPolicySetting {
  recipients: RecipientRole[];
  channels: NotificationChannel[];
  escalation: string;
}

export interface NotificationPolicies {
  warning: NotificationPolicySetting;
  critical: NotificationPolicySetting;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: '리포트' | '설계도' | '기타';
  link: string;
  lastUpdated: string;
}

export interface ProjectActivity {
  id: string;
  description: string;
  user: string;
  timestamp: string;
}

export interface ProjectDetail {
  id: string;
  name: string;
  description: string;
  team: TeamMember[];
  documents: ProjectDocument[];
  activity: ProjectActivity[];
}

export interface ReportTemplate {
  name: string;
  sections: string[];
  aiStyleGuide: string;
  approvalBox: string;
}

export interface AlertTemplate {
  channel: NotificationChannel;
  level: 'warning' | 'critical';
  subject: string;
  body: string;
}

// Types for new Admin Views
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Project Manager' | 'Engineer' | 'Inspector';
  lastLogin: string;
  status: 'Active' | 'Invited' | 'Deactivated';
  projectAccess: string[];
  twoFactorEnabled: boolean;
}

export interface ManagedRagDoc {
    id: string;
    fileName: string;
    fileType: 'PDF' | 'DOCX' | 'TXT';
    fileSize: string;
    uploadDate: string;
    status: 'Indexed' | 'Processing' | 'Error';
    chunkCount: number;
    embeddingModel: string;
}

export interface DataSource {
    id: string;
    sourceName: string;
    assetName: string;
    dataType: 'Sensor Stream' | 'Manual Upload' | 'Batch Import (CSV)';
    status: 'Online' | 'Offline' | 'Error';
    lastReceived: string;
    frequency: string;
    dataVolume24h: string;
    avgLatencyMs: number;
}
