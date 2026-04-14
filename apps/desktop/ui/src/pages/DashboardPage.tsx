import React, { useEffect, useState } from 'react';
import { Section } from '../components/Section';
import { StatCard } from '../components/StatCard';
import { useDesktopApp } from '../lib/electron';

export const DashboardPage = () => {
  const { dashboard, refreshDashboard, pushToast } = useDesktopApp();
  const [signing, setSigning] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    void refreshDashboard();
  }, [refreshDashboard]);

  if (!dashboard) {
    return <div className="loading-screen">正在加载桌面摘要…</div>;
  }

  const currentTask = dashboard.tasks[0];
  const canRunGeneralSign = currentTask ? currentTask.signType === 0 || currentTask.signType === 3 : false;

  const onSign = async () => {
    if (!canRunGeneralSign) {
      setStatus('当前任务不是普通/手势签到，需在后续版本补齐对应动作。');
      return;
    }
    try {
      setSigning(true);
      const result = await window.desktopApi.sign('general');
      setStatus(result.success ? '已尝试执行当前普通签到。' : result.message);
      await refreshDashboard();
      pushToast({
        title: result.success ? '签到成功' : '签到失败',
        message: result.success ? result.task.course : result.message,
        tone: result.success ? 'success' : 'error'
      });
    } catch (error: any) {
      const message = error?.message || '签到执行失败。';
      setStatus(message);
      pushToast({
        title: '签到失败',
        message,
        tone: 'error'
      });
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="page-grid">
      <section className="hero-panel">
        <div className="page-hero">
          <p className="page-eyebrow">Today</p>
          <h1 className="page-title">把签到任务收进一个更安静的桌面工作区。</h1>
          <p className="page-description">{dashboard.todayStatus}</p>
        </div>
        <div className="hero-aside">
          <div className="hero-aside-label">今日摘要</div>
          <div className="hero-aside-value">{dashboard.tasks.length} 个任务</div>
          <p className="hero-aside-copy">最近状态同步、任务列表与运行日志都以本地面板形式承载。</p>
          <button type="button" className="primary-button" onClick={onSign} disabled={!dashboard.tasks.length || signing || !canRunGeneralSign}>
            {signing ? '执行中…' : canRunGeneralSign ? '尝试普通签到' : '当前任务需专用动作'}
          </button>
          {status ? <p className="helper-text">{status}</p> : null}
        </div>
      </section>

      <div className="stats-grid">
        <StatCard
          label="今日任务"
          value={String(dashboard.tasks.length)}
          description="当前待处理活动，直接来自 apps/server。"
          tone="blue"
        />
        <StatCard
          label="历史任务"
          value={String(dashboard.taskHistory.length)}
          description="桌面端会本地积累处理过的签到任务历史。"
          tone="teal"
        />
        <StatCard
          label="运行模式"
          value="Desktop"
          description="当前界面来自独立桌面端前端，不复用网页端。"
          tone="pink"
        />
      </div>

      <Section
        title="最近签到记录"
        description="最近完成或待处理的签到历史。"
        action={<button type="button" className="secondary-button" onClick={() => void refreshDashboard()}>刷新摘要</button>}
      >
        <div className="record-grid">
          {dashboard.recentSigns.map((record) => (
            <article key={record.id} className="record-card">
              <div>
                <p className="record-card-title">{record.course}</p>
                <p className="record-card-meta">{record.time}</p>
              </div>
              <span
                className={`status-pill ${
                  record.status === '已签到' || record.status === '已完成' ? 'status-pill--teal' : 'status-pill--orange'
                }`}
              >
                {record.status}
              </span>
            </article>
          ))}
        </div>
      </Section>

      <Section title="待处理关注点" description="这一区域更接近桌面端快速巡检，而不是网页仪表盘。">
        <div className="bullet-board">
          {dashboard.taskHistory.slice(0, 6).map((task) => (
            <article key={task.id} className="bullet-item">
              <p className="bullet-title">{task.course}</p>
              <p className="bullet-meta">
                {task.type} · {new Date(task.updatedAt).toLocaleString()}
              </p>
              <p className="bullet-copy">{task.status}{task.isActive ? ' · 当前活动' : ''}</p>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
};
