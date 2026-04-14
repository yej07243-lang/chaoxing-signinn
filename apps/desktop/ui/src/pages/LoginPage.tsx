import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDesktopApp } from '../lib/electron';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setSession, refreshDashboard, pushToast } = useDesktopApp();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setPending(true);
      setError('');
      const session = await window.desktopApi.login({ account, password, school });
      setSession(session);
      await refreshDashboard();
      pushToast({
        title: '登录成功',
        message: session.displayName || session.account,
        tone: 'success'
      });
      navigate('/', { replace: true });
    } catch (nextError: any) {
      const message = nextError?.message || '登录失败，请检查 API 地址或账号密码。';
      setError(message);
      pushToast({
        title: '登录失败',
        message,
        tone: 'error'
      });
    } finally {
      setPending(false);
    }
  };

  const fillExample = () => {
    setAccount((current) => current || '13800000000');
    setPassword((current) => current || 'your-password');
    setSchool((current) => current || '示例学校');
  };

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="auth-copy">
          <p className="auth-eyebrow">Desktop Sign Suite</p>
          <h1 className="auth-title">更干净的签到桌面端。</h1>
          <p className="auth-description">
            这不是把网页塞进 Electron，而是一层重新实现的本地工作区。布局、留白、
            状态和交互都按桌面工具来组织，后续直接对接现有 `apps/server`。
          </p>
          <div className="auth-badges">
            <span className="status-pill">Electron</span>
            <span className="status-pill">React + Vite</span>
            <span className="status-pill status-pill--teal">Dark Mode</span>
          </div>
          <div className="auth-highlights">
            <article className="auth-feature-card">
              <p className="auth-feature-label">工作流</p>
              <p className="auth-feature-value">登录、任务、日志、设置</p>
            </article>
            <article className="auth-feature-card auth-feature-card--blue">
              <p className="auth-feature-label">桌面行为</p>
              <p className="auth-feature-value">本地渲染、预加载桥接、安全隔离</p>
            </article>
          </div>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="auth-form-copy">
            <p className="panel-kicker">Sign In</p>
            <h2 className="auth-form-title">进入你的桌面控制台</h2>
          </div>

          <label className="field">
            <span className="field-label">账号</span>
            <input
              className="field-input"
              value={account}
              onChange={(event) => setAccount(event.target.value)}
              placeholder="请输入账号"
            />
          </label>

          <label className="field">
            <span className="field-label">密码</span>
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入密码"
            />
          </label>

          <label className="field">
            <span className="field-label">学校</span>
            <input
              className="field-input"
              value={school}
              onChange={(event) => setSchool(event.target.value)}
              placeholder="请输入学校"
            />
          </label>

          <div className="auth-form-actions">
            <button type="submit" className="primary-button" disabled={pending}>
              {pending ? '正在连接…' : '进入桌面端'}
            </button>
            <button type="button" className="secondary-button" onClick={fillExample} disabled={pending}>
              填入示例
            </button>
          </div>

          {error ? <p className="helper-text helper-text--error">{error}</p> : null}
          <p className="helper-text">当前登录将直接请求桌面设置中的后端 API，默认地址是本机 `http://127.0.0.1:5001`。</p>
        </form>
      </div>
    </div>
  );
};
