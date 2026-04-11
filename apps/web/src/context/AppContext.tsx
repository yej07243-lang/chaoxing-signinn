import React, { createContext, useEffect, useMemo, useState } from 'react';
import { api, signTypeLabel } from '../services/api';
import {
  appendLog,
  defaultConfig,
  mergeCourse,
  readCourses,
  readLogs,
  readSession,
  sanitizeMessage,
  writeCourses,
  writeLogs,
  writeSession,
} from '../services/storage';

type ActivityState = 'idle' | 'loading' | 'ready' | 'empty' | 'error';
type AuthState = 'idle' | 'loading' | 'authenticated' | 'error';

interface AppContextValue {
  session: StoredSession | null;
  activity: ActivityItem | null;
  activityState: ActivityState;
  authState: AuthState;
  logs: LogEntry[];
  courses: CourseListItem[];
  loginStatus: string;
  lastSignStatus: string;
  monitorActive: boolean;
  signPending: boolean;
  signIn: (phone: string, password: string, options?: { silent?: boolean }) => Promise<boolean>;
  signOut: () => void;
  refreshActivity: (options?: { silent?: boolean }) => Promise<void>;
  signCurrentTask: () => Promise<void>;
  executeSignAction: (payload: SignActionPayload) => Promise<void>;
  updateAccount: (phone: string, password: string, address: AddressItem) => Promise<boolean>;
}

export const AppContext = createContext<AppContextValue | null>(null);

const FIVE_DAYS = 1000 * 60 * 60 * 24 * 5;

const toSession = (phone: string, password: string, data: StoredSession | Omit<StoredSession, 'phone' | 'password' | 'date' | 'monitor' | 'config'>, current?: StoredSession | null): StoredSession => ({
  ...data,
  phone,
  password,
  date: new Date().toISOString(),
  monitor: current?.monitor || false,
  config: current?.config || defaultConfig,
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<StoredSession | null>(() => readSession());
  const [activity, setActivity] = useState<ActivityItem | null>(null);
  const [activityState, setActivityState] = useState<ActivityState>('idle');
  const [authState, setAuthState] = useState<AuthState>(() => (readSession() ? 'authenticated' : 'idle'));
  const [logs, setLogs] = useState<LogEntry[]>(() => readLogs());
  const [courses, setCourses] = useState<CourseListItem[]>(() => readCourses());
  const [loginStatus, setLoginStatus] = useState('');
  const [lastSignStatus, setLastSignStatus] = useState('');
  const [monitorActive, setMonitorActive] = useState(false);
  const [signPending, setSignPending] = useState(false);

  const pushLog = (entry: Omit<LogEntry, 'id' | 'createdAt'>, activeSession: StoredSession | null = session) => {
    setLogs((prev) => {
      const next = appendLog(prev, {
        ...entry,
        message: sanitizeMessage(entry.message, activeSession),
      });
      writeLogs(next);
      return next;
    });
  };

  const persistSession = (value: StoredSession | null) => {
    setSession(value);
    writeSession(value);
  };

  const persistCourses = (value: CourseListItem[]) => {
    setCourses(value);
    writeCourses(value);
  };

  const signIn = async (phone: string, password: string, options?: { silent?: boolean }) => {
    try {
      setAuthState('loading');
      if (!options?.silent) {
        setLoginStatus('正在验证账号');
      }

      const result = await api.login(phone, password);
      if (result === 'AuthFailed') {
        setAuthState('error');
        setLoginStatus('登录失败，请检查账号和密码');
        pushLog({ level: 'error', source: 'auth', message: '登录失败，请检查账号或密码' }, null);
        return false;
      }

      const nextSession = toSession(phone, password, result, session);
      persistSession(nextSession);
      setAuthState('authenticated');
      setLoginStatus(options?.silent ? '' : '登录成功');
      pushLog({ level: 'success', source: 'auth', message: '账号登录成功，凭证已更新' }, nextSession);
      return true;
    } catch (_error) {
      setAuthState('error');
      setLoginStatus('服务暂时不可用');
      pushLog({ level: 'error', source: 'system', message: '登录请求失败，请稍后重试' }, null);
      return false;
    }
  };

  const signOut = () => {
    persistSession(null);
    setActivity(null);
    setActivityState('idle');
    setAuthState('idle');
    setLoginStatus('');
    setLastSignStatus('');
    setMonitorActive(false);
  };

  const refreshActivity = async (options?: { silent?: boolean }) => {
    if (!session) return;

    try {
      setActivityState('loading');
      const result = await api.fetchActivity(session);

      if (typeof result === 'string') {
        setActivity(null);

        if (result === 'AuthRequired') {
          const refreshed = await signIn(session.phone, session.password, { silent: true });
          if (refreshed) {
            setActivityState('idle');
            await refreshActivity(options);
            return;
          }
          setActivityState('error');
          return;
        }

        if (result === 'NoActivity' || result === 'NoCourse') {
          setActivityState('empty');
          if (!options?.silent) {
            pushLog({
              level: 'info',
              source: 'activity',
              message: result === 'NoCourse' ? '当前账号没有可查询课程' : '当前没有待签到任务',
            });
          }
          return;
        }

        setActivityState('error');
        pushLog({ level: 'error', source: 'activity', message: '签到任务查询失败，请稍后重试' });
        return;
      }

      setActivity(result);
      setActivityState('ready');
      const nextCourses = mergeCourse(courses, result, '未签到', true);
      persistCourses(nextCourses);

      if (!options?.silent) {
        pushLog({
          level: 'info',
          source: 'activity',
          message: `检测到新的签到任务：${result.name}（${signTypeLabel(result.otherId)}）`,
        });
      }
    } catch (_error) {
      setActivityState('error');
      pushLog({ level: 'error', source: 'system', message: '签到任务加载失败' });
    }
  };

  const signCurrentTask = async () => {
    await executeSignAction({});
  };

  const executeSignAction = async (payload: SignActionPayload) => {
    if (!session || !activity?.activeId) return;

    try {
      setSignPending(true);
      let result = '';
      const presetAddress = session.config.monitor.presetAddress.find((item) => item.address && item.lon && item.lat) || null;
      const selectedAddress = payload.address?.address && payload.address.lon && payload.address.lat ? payload.address : presetAddress;

      switch (activity.otherId) {
        case 4:
          if (!selectedAddress) {
            result = '位置签到需要先在设置页填写地址和经纬度';
          } else {
            result = await api.locationSign(session, activity.activeId, selectedAddress);
          }
          break;
        case 2:
          if (!selectedAddress) {
            result = '二维码签到需要经纬度和地址';
            break;
          }
          {
            let enc = payload.qrEnc?.trim() || '';
            if (!enc && payload.qrImage) {
              enc = await api.parseQRCode(payload.qrImage);
            }

            if (!enc || enc === '识别失败') {
              result = '二维码解析失败，请手动填写 enc';
              break;
            }

            result = await api.qrcodeSign(session, activity.activeId, enc, selectedAddress, payload.altitude || '100');
          }
          break;
        case 0: {
          if (payload.mode === 'photo') {
            if (!payload.photoFile) {
              result = '拍照签到需要先选择图片';
              break;
            }
            const token = await api.getUploadToken(session);
            const uploadResult = await api.uploadPhoto(session, payload.photoFile, token._token);
            const objectId = JSON.parse(uploadResult).objectId;
            result = await api.photoSign(session, activity.activeId, objectId);
            break;
          }
          result = await api.generalSign(session, activity.activeId);
          break;
        }
        case 3:
        case 5:
        default:
          result = await api.generalSign(session, activity.activeId);
          break;
      }

      const success = result === 'success';
      const text = success ? '签到成功' : result;

      setLastSignStatus(text);
      pushLog({
        level: success ? 'success' : 'error',
        source: 'sign',
        message: `${activity.name}：${text}`,
      });

      const nextCourses = mergeCourse(courses, activity, success ? '已签到' : '需要配置', !success);
      persistCourses(nextCourses);

      if (success) {
        setActivity(null);
        setActivityState('empty');
      }
    } catch (_error) {
      setLastSignStatus('签到请求失败');
      pushLog({ level: 'error', source: 'system', message: '签到请求失败，请稍后重试' });
    } finally {
      setSignPending(false);
    }
  };

  const updateAccount = async (phone: string, password: string, address: AddressItem) => {
    const loggedIn = await signIn(phone, password);
    if (!loggedIn) return false;

    const current = readSession();
    if (!current) return false;

    const nextSession: StoredSession = {
      ...current,
      phone,
      password,
      config: {
        ...current.config,
        monitor: {
          ...current.config.monitor,
          presetAddress: [address],
        },
      },
    };

    persistSession(nextSession);
    pushLog({ level: 'success', source: 'auth', message: '设置已保存' }, nextSession);
    return true;
  };

  useEffect(() => {
    writeLogs(logs);
  }, [logs]);

  useEffect(() => {
    writeCourses(courses);
  }, [courses]);

  useEffect(() => {
    if (!session) return;

    const refreshSession = async () => {
      if (Date.now() - new Date(session.date).getTime() > FIVE_DAYS) {
        await signIn(session.phone, session.password, { silent: true });
      }
      await refreshActivity({ silent: true });

      try {
        const monitor = await api.fetchMonitorStatus(session.phone);
        setMonitorActive(monitor.code === 200);
      } catch (_error) {
        setMonitorActive(false);
      }
    };

    refreshSession();
  }, []);

  const value = useMemo<AppContextValue>(() => ({
    session,
    activity,
    activityState,
    authState,
    logs,
    courses,
    loginStatus,
    lastSignStatus,
    monitorActive,
    signPending,
    signIn,
    signOut,
    refreshActivity,
    signCurrentTask,
    executeSignAction,
    updateAccount,
  }), [session, activity, activityState, authState, logs, courses, loginStatus, lastSignStatus, monitorActive, signPending]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
