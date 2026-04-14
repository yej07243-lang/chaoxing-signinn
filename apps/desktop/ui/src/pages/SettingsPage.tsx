import React, { useEffect, useState } from 'react';
import { Section } from '../components/Section';
import { useDesktopApp } from '../lib/electron';

export const SettingsPage = () => {
  const { settings, setSettings, refreshDashboard, pushToast } = useDesktopApp();
  const [form, setForm] = useState<DesktopSettings | null>(settings);
  const [saved, setSaved] = useState('桌面端设置会保存在本机 userData 中。');

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  if (!form) {
    return <div className="loading-screen">正在读取设置…</div>;
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = await window.desktopApi.saveSettings(form);
    setSettings(next);
    setSaved('设置已保存。当前是桌面端占位配置，后续可以逐步接入真实能力。');
    await refreshDashboard();
    pushToast({
      title: '设置已保存',
      message: '桌面端偏好和默认签到参数已经更新。',
      tone: 'success'
    });
  };

  return (
    <div className="page-grid">
      <section className="hero-panel hero-panel--compact">
        <div className="page-hero">
          <p className="page-eyebrow">Settings</p>
          <h1 className="page-title">把配置收进干净的本地偏好面板。</h1>
          <p className="page-description">API 地址、启动行为、通知与外观都通过 preload 暴露的安全接口进行读写。</p>
        </div>
      </section>

      <Section
        title="基础配置"
        description="这些设置通过 preload 暴露的安全 API 读写。"
        action={<span className="status-pill status-pill--teal">Saved Local</span>}
      >
        <form className="settings-form" onSubmit={onSubmit}>
          <label className="field">
            <span className="field-label">API 地址</span>
            <input
              className="field-input"
              value={form.apiBaseUrl}
              onChange={(event) => setForm({ ...form, apiBaseUrl: event.target.value })}
            />
          </label>

          <label className="field">
            <span className="field-label">默认地址</span>
            <input
              className="field-input"
              value={form.defaultAddress}
              onChange={(event) => setForm({ ...form, defaultAddress: event.target.value })}
              placeholder="位置签到默认地址"
            />
          </label>

          <div className="split-fields">
            <label className="field">
              <span className="field-label">默认纬度</span>
              <input
                className="field-input"
                value={form.defaultLat}
                onChange={(event) => setForm({ ...form, defaultLat: event.target.value })}
                placeholder="例如 30.123456"
              />
            </label>

            <label className="field">
              <span className="field-label">默认经度</span>
              <input
                className="field-input"
                value={form.defaultLon}
                onChange={(event) => setForm({ ...form, defaultLon: event.target.value })}
                placeholder="例如 120.123456"
              />
            </label>

            <label className="field">
              <span className="field-label">默认海拔</span>
              <input
                className="field-input"
                value={form.defaultAltitude}
                onChange={(event) => setForm({ ...form, defaultAltitude: event.target.value })}
                placeholder="100"
              />
            </label>
          </div>

          <label className="toggle-field">
            <span>开机自动启动</span>
            <input
              type="checkbox"
              checked={form.autoLaunch}
              onChange={(event) => setForm({ ...form, autoLaunch: event.target.checked })}
            />
          </label>

          <label className="toggle-field">
            <span>桌面通知</span>
            <input
              type="checkbox"
              checked={form.notifications}
              onChange={(event) => setForm({ ...form, notifications: event.target.checked })}
            />
          </label>

          <label className="toggle-field">
            <span>深色模式</span>
            <input
              type="checkbox"
              checked={form.darkMode}
              onChange={(event) => setForm({ ...form, darkMode: event.target.checked })}
            />
          </label>

          <div className="settings-actions">
            <button type="submit" className="primary-button">
              保存设置
            </button>
            <button type="button" className="secondary-button" onClick={() => setForm(settings)}>
              恢复当前值
            </button>
          </div>
          <p className="helper-text">{saved}</p>
        </form>
      </Section>
    </div>
  );
};
