const SESSION_KEY = 'cx-sign:session';
const LOGS_KEY = 'cx-sign:logs';
const COURSES_KEY = 'cx-sign:courses';
const API_OVERRIDE_KEY = 'cx-sign:api-base';

const DEFAULT_MAX_LOGS = 120;

export const defaultConfig: UserConfig = {
  monitor: {
    delay: 0,
    presetAddress: [
      {
        lon: '',
        lat: '',
        address: '',
      },
    ],
  },
  mailing: {
    enabled: false,
    host: '',
    ssl: true,
    port: 465,
    user: '',
    pass: '',
    to: '',
  },
  cqserver: {
    cq_enabled: false,
    ws_url: '',
    target_type: 'private',
    target_id: 0,
  },
};

const canUseStorage = () => typeof window !== 'undefined' && !!window.localStorage;

export const maskPhone = (phone: string) => {
  if (!phone) return '';
  if (phone.length < 7) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
};

export const sanitizeMessage = (message: string, session?: Partial<StoredSession> | null) => {
  let result = message;

  if (session?.phone) {
    result = result.split(session.phone).join(maskPhone(session.phone));
  }

  if (session?.password) {
    result = result.split(session.password).join('[hidden]');
  }

  result = result.replace(/(password|passwd|密码)\s*[:：=]\s*([^\s,;]+)/gi, '$1: [hidden]');
  result = result.replace(/\b1\d{10}\b/g, (phone) => maskPhone(phone));

  return result;
};

export const readSession = (): StoredSession | null => {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as StoredSession;
    return value;
  } catch (_error) {
    return null;
  }
};

export const writeSession = (session: StoredSession | null) => {
  if (!canUseStorage()) return;
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }

  const payload: StoredSession = {
    phone: session.phone,
    password: session.password,
    name: session.name,
    fid: session.fid,
    lv: session.lv,
    uf: session.uf,
    vc3: session.vc3,
    _d: session._d,
    _uid: session._uid,
    date: session.date,
    monitor: session.monitor,
    config: {
      ...defaultConfig,
      monitor: {
        ...defaultConfig.monitor,
        presetAddress: session.config.monitor.presetAddress.slice(0, 1),
      },
    },
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
};

export const readLogs = (): LogEntry[] => {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(LOGS_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as LogEntry[];
  } catch (_error) {
    return [];
  }
};

export const writeLogs = (logs: LogEntry[]) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, DEFAULT_MAX_LOGS)));
};

export const appendLog = (logs: LogEntry[], entry: Omit<LogEntry, 'id' | 'createdAt'>) => {
  return [
    {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
    },
    ...logs,
  ].slice(0, DEFAULT_MAX_LOGS);
};

export const readCourses = (): CourseListItem[] => {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(COURSES_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as CourseListItem[];
  } catch (_error) {
    return [];
  }
};

export const writeCourses = (courses: CourseListItem[]) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
};

export const readApiOverride = () => {
  if (!canUseStorage()) return '';
  return window.localStorage.getItem(API_OVERRIDE_KEY) || '';
};

export const writeApiOverride = (value: string) => {
  if (!canUseStorage()) return;
  if (!value) {
    window.localStorage.removeItem(API_OVERRIDE_KEY);
    return;
  }
  window.localStorage.setItem(API_OVERRIDE_KEY, value);
};

export const clearAppStorage = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(LOGS_KEY);
  window.localStorage.removeItem(COURSES_KEY);
  window.localStorage.removeItem(API_OVERRIDE_KEY);
};

export const mergeCourse = (
  courses: CourseListItem[],
  activity: ActivityItem,
  status: CourseListItem['status'],
  hasTask: boolean
) => {
  const id = `${activity.courseId ?? 'activity'}:${activity.classId ?? activity.activeId ?? activity.name}`;
  const item: CourseListItem = {
    id,
    name: activity.name,
    hasTask,
    status,
    updatedAt: new Date().toISOString(),
    courseId: activity.courseId,
    classId: activity.classId,
  };

  const next = courses.filter((course) => course.id !== id);
  return [item, ...next].slice(0, 30);
};
