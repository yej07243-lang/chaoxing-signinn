declare module '@nuintun/qrcode';

type SignTypeId = 0 | 2 | 3 | 4 | 5;

interface StoredSession {
  phone: string;
  password: string;
  name: string;
  fid: string;
  lv: string;
  uf: string;
  vc3: string;
  _d: string;
  _uid: string;
  date: string;
  monitor: boolean;
  config: UserConfig;
}

interface UserConfig {
  monitor: MonitorConfig;
  mailing: MailingConfig;
  cqserver: CQServerConfig;
}

interface AddressItem {
  lon: string;
  lat: string;
  address: string;
}

type PresetAddress = AddressItem[];

interface MonitorConfig {
  delay: number;
  presetAddress: PresetAddress;
}

interface MailingConfig {
  enabled: boolean;
  host: string;
  ssl: boolean;
  port: number;
  user: string;
  pass: string;
  to: string;
}

interface CQServerConfig {
  cq_enabled: boolean;
  ws_url: string;
  target_type: string;
  target_id: number;
}

interface ActivityItem {
  name: string;
  activeId?: number;
  courseId?: string | number;
  classId?: string | number;
  otherId?: SignTypeId;
}

interface CourseListItem {
  id: string;
  name: string;
  hasTask: boolean;
  status: '已签到' | '未签到' | '待处理' | '需要配置';
  updatedAt: string;
  courseId?: string | number;
  classId?: string | number;
}

interface LogEntry {
  id: string;
  level: 'info' | 'success' | 'error';
  source: 'auth' | 'activity' | 'sign' | 'system';
  message: string;
  createdAt: string;
}

interface SignActionPayload {
  mode?: 'general' | 'photo';
  photoFile?: File | null;
  qrEnc?: string;
  qrImage?: File | null;
  qrUrl?: string;
  signCode?: string;
  address?: AddressItem | null;
  altitude?: string;
}

interface Window {
  AMap?: any;
  _AMapSecurityConfig?: {
    securityJsCode?: string;
  };
}
