import React, { useEffect, useState } from 'react';
import { Section } from '../components/Section';
import { useDesktopApp } from '../lib/electron';

export const LogsPage = () => {
  const { pushToast } = useDesktopApp();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      const payload = await window.desktopApi.getLogs();
      setLogs(payload);
    };
    void load();
  }, []);

  const visibleLogs = logs.filter((log) => {
    return `${log.source} ${log.level} ${log.message}`.toLowerCase().includes(query.trim().toLowerCase());
  });

  return (
    <div className="page-grid">
      <section className="hero-panel hero-panel--compact">
        <div className="page-hero">
          <p className="page-eyebrow">Logs</p>
          <h1 className="page-title">日志页优先服务排查，而不是展示。</h1>
          <p className="page-description">本地日志流先以占位数据呈现，后续可接系统日志、业务日志与 server 返回。</p>
        </div>
      </section>

      <Section
        title="日志流"
        description="最新记录显示在最前面。"
        action={
          <button
            type="button"
            className="secondary-button"
            onClick={async () => {
              const next = await window.desktopApi.clearLogs();
              setLogs(next);
              pushToast({
                title: '日志已清空',
                message: '本地运行日志已经被清理。',
                tone: 'info'
              });
            }}
          >
            清空日志
          </button>
        }
      >
        <div className="toolbar-row">
          <input
            className="toolbar-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索来源、级别或消息"
          />
        </div>
        <div className="logs-list">
          {visibleLogs.map((log) => (
            <article key={log.id} className="log-card">
              <div className="log-card-head">
                <span
                  className={`status-pill ${
                    log.level === 'success'
                      ? 'status-pill--teal'
                      : log.level === 'info'
                        ? 'status-pill--blue'
                        : 'status-pill--orange'
                  }`}
                >
                  {log.level}
                </span>
                <span className="log-source">{log.source}</span>
                <span className="log-time">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
              <p className="log-message">{log.message}</p>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
};
