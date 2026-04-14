import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDesktopApp } from '../lib/electron';

const navItems = [
  { to: '/', label: '概览', hint: '今日状态与摘要', index: '01' },
  { to: '/tasks', label: '任务', hint: '待处理活动列表', index: '02' },
  { to: '/logs', label: '日志', hint: '系统与业务日志', index: '03' },
  { to: '/settings', label: '设置', hint: 'API、通知与偏好', index: '04' }
];

export const ShellLayout = () => {
  const navigate = useNavigate();
  const { session, dashboard, setSession, refreshDashboard, pushToast } = useDesktopApp();
  const [appInfo, setAppInfo] = useState<{ name: string; version: string; platform: string } | null>(null);
  const [windowState, setWindowState] = useState<WindowShellState | null>(null);

  useEffect(() => {
    const load = async () => {
      const [info, shellState] = await Promise.all([
        window.desktopApi.getAppInfo(),
        window.desktopApi.getWindowState()
      ]);
      setAppInfo(info);
      setWindowState(shellState);
    };
    void load();
  }, []);

  useEffect(() => {
    void refreshDashboard();
  }, [refreshDashboard]);

  useEffect(() => {
    const unsubscribe = window.desktopApi.onWindowStateChange((payload) => {
      setWindowState(payload);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = window.desktopApi.onCommand(async (payload) => {
      if (payload.type === 'navigate' && payload.path) {
        navigate(payload.path);
        if (payload.action === 'refresh-tasks') {
          window.dispatchEvent(new CustomEvent('desktop:refresh-tasks'));
          pushToast({
            title: '任务刷新',
            message: '已从托盘触发任务刷新。',
            tone: 'info'
          });
        }
        return;
      }

      if (payload.type === 'quick-sign-result' && payload.result) {
        await refreshDashboard();
        pushToast({
          title: payload.result.success ? '快速签到成功' : '快速签到失败',
          message: payload.result.success ? payload.result.task.course : payload.result.message,
          tone: payload.result.success ? 'success' : 'error'
        });
        return;
      }

      if (payload.type === 'quick-sign-error') {
        pushToast({
          title: '快速签到失败',
          message: payload.message || '托盘快速签到失败。',
          tone: 'error'
        });
      }
    });
    return unsubscribe;
  }, [navigate, pushToast, refreshDashboard]);

  const onLogout = async () => {
    const next = await window.desktopApi.logout();
    setSession(next);
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">
            <span />
            <span />
          </div>
          <div>
            <p className="sidebar-eyebrow">Desktop Workspace</p>
            <h1 className="sidebar-title">Chaoxing Sign</h1>
          </div>
        </div>

        <div className="sidebar-intro">
          <p className="sidebar-copy">用独立桌面前端承接签到、日志、配置与运行状态，界面只服务于高频操作。</p>
        </div>

        <div className="sidebar-account">
          <p className="sidebar-section-label">当前账号</p>
          <p className="sidebar-account-name">{session?.account || '未登录'}</p>
          <p className="sidebar-account-meta">{session?.school || '未设置学校'}</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
            >
              <span className="sidebar-link-index">{item.index}</span>
              <span className="sidebar-link-body">
                <span className="sidebar-link-title">{item.label}</span>
                <span className="sidebar-link-hint">{item.hint}</span>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div>
            <p className="sidebar-section-label">桌面环境</p>
            <p className="sidebar-footer-meta">
              {appInfo?.platform || 'platform'} · v{appInfo?.version || '0.0.0'}
            </p>
          </div>
          <button type="button" className="ghost-button" onClick={onLogout}>
            退出登录
          </button>
        </div>
      </aside>

      <div className="workspace">
        <div className="window-chrome">
          <div className="window-chrome-drag">
            <div className="window-chrome-dots">
              <span />
              <span />
              <span />
            </div>
            <p className="window-chrome-title">Chaoxing Sign Desktop</p>
          </div>
          <div className="window-chrome-actions">
            <span className={`status-pill ${dashboard?.authState === 'connected' ? 'status-pill--teal' : dashboard?.authState === 'degraded' ? 'status-pill--orange' : ''}`}>
              {dashboard?.authState === 'connected' ? 'Server Online' : dashboard?.authState === 'degraded' ? 'Needs Attention' : 'Logged Out'}
            </span>
            <span className={`status-pill ${windowState?.notifications ? 'status-pill--blue' : ''}`}>
              {windowState?.notifications ? 'Notifications On' : 'Notifications Off'}
            </span>
            <div className="window-control-group">
              <button type="button" className="window-control" onClick={() => void window.desktopApi.minimizeWindow()}>
                _
              </button>
              <button type="button" className="window-control" onClick={() => void window.desktopApi.toggleMaximizeWindow()}>
                {windowState?.isMaximized ? '▢' : '□'}
              </button>
              <button type="button" className="window-control window-control--close" onClick={() => void window.desktopApi.hideWindow()}>
                ×
              </button>
            </div>
          </div>
        </div>

        <header className="topbar">
          <div className="topbar-copy">
            <p className="topbar-eyebrow">Desktop Console</p>
            <h2 className="topbar-title">本地桌面应用层</h2>
          </div>
          <div className="topbar-status">
            <span className="status-pill status-pill--teal">Connected UI</span>
            <span className="status-pill">Server Ready</span>
            <span className="status-pill">Local State</span>
            {dashboard?.tasks?.length ? <span className="status-pill status-pill--blue">{dashboard.tasks.length} Active</span> : null}
            {!windowState?.isVisible ? <span className="status-pill status-pill--orange">Tray Hidden</span> : null}
          </div>
        </header>

        <main className="workspace-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
