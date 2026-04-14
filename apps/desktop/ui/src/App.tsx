import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ShellLayout } from './components/ShellLayout';
import { ToastViewport } from './components/ToastViewport';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { LogsPage } from './pages/LogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TasksPage } from './pages/TasksPage';

export type AppContextValue = {
  settings: DesktopSettings | null;
  session: DesktopSession | null;
  dashboard: DashboardPayload | null;
  toasts: ToastItem[];
  setSettings: React.Dispatch<React.SetStateAction<DesktopSettings | null>>;
  setSession: React.Dispatch<React.SetStateAction<DesktopSession | null>>;
  refreshDashboard: () => Promise<void>;
  pushToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
};

export const AppContext = React.createContext<AppContextValue | null>(null);

export default function App() {
  const [settings, setSettings] = useState<DesktopSettings | null>(null);
  const [session, setSession] = useState<DesktopSession | null>(null);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [ready, setReady] = useState(false);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, ...toast }].slice(-4));
    window.setTimeout(() => {
      dismissToast(id);
    }, 3600);
  }, [dismissToast]);

  const refreshDashboard = useCallback(async () => {
    try {
      const nextDashboard = await window.desktopApi.getDashboard();
      setDashboard(nextDashboard);
    } catch (_error) {
      setDashboard(null);
      pushToast({
        title: '刷新失败',
        message: '无法同步桌面摘要，请检查后端接口。',
        tone: 'error'
      });
    }
  }, [pushToast]);

  useEffect(() => {
    const bootstrap = async () => {
      const [nextSettings, nextSession] = await Promise.all([
        window.desktopApi.getSettings(),
        window.desktopApi.getSession()
      ]);
      setSettings(nextSettings);
      setSession(nextSession);
      if (nextSession.loggedIn) {
        await refreshDashboard();
      }
      setReady(true);
    };

    void bootstrap();
  }, [refreshDashboard]);

  useEffect(() => {
    if (!settings) return;
    document.documentElement.dataset.theme = settings.darkMode ? 'dark' : 'light';
  }, [settings]);

  if (!ready) {
    return (
      <div className="boot-screen">
        <div className="boot-panel">
          <p className="boot-title">Chaoxing Sign Desktop</p>
          <p className="boot-subtitle">正在初始化桌面工作区…</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ settings, session, dashboard, toasts, setSettings, setSession, refreshDashboard, pushToast, dismissToast }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={session?.loggedIn ? <ShellLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to={session?.loggedIn ? '/' : '/login'} replace />} />
      </Routes>
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </AppContext.Provider>
  );
}
