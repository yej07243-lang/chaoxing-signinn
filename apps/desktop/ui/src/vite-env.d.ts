/// <reference types="vite/client" />

interface DesktopSettings {
  apiBaseUrl: string;
  autoLaunch: boolean;
  notifications: boolean;
  darkMode: boolean;
  defaultAddress: string;
  defaultLat: string;
  defaultLon: string;
  defaultAltitude: string;
}

interface DesktopSession {
  loggedIn: boolean;
  account: string;
  school: string;
  displayName: string;
  lastLoginAt: string;
}

interface DashboardTask {
  id: string;
  course: string;
  type: string;
  due: string;
  status: string;
  activeId: number;
  signType: number;
  updatedAt: string;
  isActive: boolean;
  source: 'live' | 'history';
}

interface DashboardRecord {
  id: string;
  course: string;
  status: string;
  time: string;
}

interface DashboardPayload {
  todayStatus: string;
  recentSigns: DashboardRecord[];
  tasks: DashboardTask[];
  taskHistory: DashboardTask[];
  lastSyncedAt: string;
  authState: 'connected' | 'degraded' | 'logged_out';
  user: DesktopSession;
}

interface LogEntry {
  id: string;
  level: 'info' | 'success' | 'warning' | 'error';
  source: string;
  message: string;
  createdAt: string;
}

interface SignResult {
  success: boolean;
  message: string;
  task: DashboardTask;
}

interface ToastItem {
  id: string;
  title: string;
  message?: string;
  tone?: 'info' | 'success' | 'warning' | 'error';
}

interface WindowShellState {
  isMaximized: boolean;
  isVisible: boolean;
  notifications: boolean;
}

interface DesktopCommandPayload {
  type: 'navigate' | 'quick-sign-result' | 'quick-sign-error';
  path?: string;
  action?: 'refresh-tasks';
  message?: string;
  result?: SignResult;
}

interface SignInput {
  signCode?: string;
  address?: string;
  lat?: string;
  lon?: string;
  altitude?: string;
  qrUrl?: string;
  fileName?: string;
  fileType?: string;
  fileBytes?: number[];
}

interface DesktopApi {
  getAppInfo: () => Promise<{ name: string; version: string; platform: string; isDev: boolean }>;
  getWindowState: () => Promise<WindowShellState>;
  minimizeWindow: () => Promise<WindowShellState>;
  toggleMaximizeWindow: () => Promise<WindowShellState>;
  hideWindow: () => Promise<WindowShellState>;
  showWindow: () => Promise<WindowShellState>;
  quickSign: () => Promise<SignResult>;
  onWindowStateChange: (listener: (payload: WindowShellState) => void) => () => void;
  onCommand: (listener: (payload: DesktopCommandPayload) => void) => () => void;
  getSettings: () => Promise<DesktopSettings>;
  saveSettings: (settings: DesktopSettings) => Promise<DesktopSettings>;
  getDashboard: () => Promise<DashboardPayload>;
  getTasks: () => Promise<DashboardTask[]>;
  getLogs: () => Promise<LogEntry[]>;
  clearLogs: () => Promise<LogEntry[]>;
  getSession: () => Promise<DesktopSession>;
  login: (payload: { account: string; password: string; school: string }) => Promise<DesktopSession>;
  logout: () => Promise<DesktopSession>;
  sign: (mode: 'general' | 'location' | 'code' | 'qr-url' | 'qr-image' | 'photo', input?: SignInput) => Promise<SignResult>;
}

declare global {
  interface Window {
    desktopApi: DesktopApi;
  }
}

export {};
