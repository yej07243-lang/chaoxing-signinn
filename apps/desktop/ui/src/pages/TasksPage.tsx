import React, { useEffect, useMemo, useState } from 'react';
import { Section } from '../components/Section';
import { useDesktopApp } from '../lib/electron';

const readFileBytes = async (file: File) => {
  const buffer = await file.arrayBuffer();
  return Array.from(new Uint8Array(buffer));
};

export const TasksPage = () => {
  const { settings, refreshDashboard, pushToast } = useDesktopApp();
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | '待签到' | '已准备'>('all');
  const [actionStatus, setActionStatus] = useState('');
  const [pendingMode, setPendingMode] = useState('');
  const [address, setAddress] = useState(settings?.defaultAddress || '');
  const [lat, setLat] = useState(settings?.defaultLat || '');
  const [lon, setLon] = useState(settings?.defaultLon || '');
  const [altitude, setAltitude] = useState(settings?.defaultAltitude || '100');
  const [signCode, setSignCode] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [qrImage, setQrImage] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [expandedAction, setExpandedAction] = useState<'general' | 'location' | 'code' | 'qr' | 'photo'>('general');

  const loadTasks = async () => {
    const payload = await window.desktopApi.getTasks();
    setTasks(payload);
  };

  useEffect(() => {
    void loadTasks();
  }, []);

  useEffect(() => {
    const handler = () => {
      void loadTasks();
      void refreshDashboard();
    };
    window.addEventListener('desktop:refresh-tasks', handler);
    return () => window.removeEventListener('desktop:refresh-tasks', handler);
  }, [refreshDashboard]);

  useEffect(() => {
    setAddress(settings?.defaultAddress || '');
    setLat(settings?.defaultLat || '');
    setLon(settings?.defaultLon || '');
    setAltitude(settings?.defaultAltitude || '100');
  }, [settings]);

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchQuery = `${task.course} ${task.type} ${task.status}`.toLowerCase().includes(query.trim().toLowerCase());
      const matchFilter = filter === 'all' ? true : task.status === filter;
      return matchQuery && matchFilter;
    });
  }, [tasks, query, filter]);

  useEffect(() => {
    if (!visibleTasks.length) {
      setSelectedTaskId('');
      return;
    }
    if (!visibleTasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(visibleTasks[0].id);
    }
  }, [visibleTasks, selectedTaskId]);

  const activeTask = visibleTasks.find((task) => task.id === selectedTaskId) || visibleTasks[0] || tasks[0] || null;
  const canUseLocation = Boolean(address && lat && lon);
  const canGeneral = Boolean(activeTask && (activeTask.signType === 0 || activeTask.signType === 3));
  const canLocation = Boolean(activeTask && activeTask.signType === 4 && canUseLocation);
  const canCode = Boolean(activeTask && activeTask.signType === 5);
  const canQr = Boolean(activeTask && activeTask.signType === 2 && canUseLocation);
  const canPhoto = Boolean(activeTask && activeTask.signType === 0);

  useEffect(() => {
    if (!activeTask) return;
    if (activeTask.signType === 4) {
      setExpandedAction('location');
    } else if (activeTask.signType === 5) {
      setExpandedAction('code');
    } else if (activeTask.signType === 2) {
      setExpandedAction('qr');
    } else if (activeTask.signType === 0) {
      setExpandedAction('photo');
    } else {
      setExpandedAction('general');
    }
  }, [activeTask?.id, activeTask?.signType]);

  const execute = async (mode: 'general' | 'location' | 'code' | 'qr-url' | 'qr-image' | 'photo') => {
    try {
      setPendingMode(mode);
      setActionStatus('');
      const baseInput: SignInput = {
        address,
        lat,
        lon,
        altitude
      };

      let result: SignResult;

      if (mode === 'code') {
        result = await window.desktopApi.sign('code', {
          ...baseInput,
          signCode
        });
      } else if (mode === 'location') {
        result = await window.desktopApi.sign('location', baseInput);
      } else if (mode === 'qr-url') {
        result = await window.desktopApi.sign('qr-url', {
          ...baseInput,
          qrUrl
        });
      } else if (mode === 'qr-image') {
        if (!qrImage) {
          throw new Error('请先选择二维码图片。');
        }
        result = await window.desktopApi.sign('qr-image', {
          ...baseInput,
          fileName: qrImage.name,
          fileType: qrImage.type,
          fileBytes: await readFileBytes(qrImage)
        });
      } else if (mode === 'photo') {
        if (!photoFile) {
          throw new Error('请先选择签到图片。');
        }
        result = await window.desktopApi.sign('photo', {
          ...baseInput,
          fileName: photoFile.name,
          fileType: photoFile.type,
          fileBytes: await readFileBytes(photoFile)
        });
      } else {
        result = await window.desktopApi.sign('general');
      }

      setActionStatus(result.success ? `操作成功：${result.task.course}` : result.message);
      await loadTasks();
      await refreshDashboard();
      pushToast({
        title: result.success ? '操作成功' : '操作失败',
        message: result.success ? `${result.task.course} 已处理` : result.message,
        tone: result.success ? 'success' : 'error'
      });
    } catch (error: any) {
      const message = error?.message || '执行失败，请稍后再试。';
      setActionStatus(message);
      pushToast({
        title: '执行失败',
        message,
        tone: 'error'
      });
    } finally {
      setPendingMode('');
    }
  };

  return (
    <div className="page-grid">
      <section className="hero-panel hero-panel--compact">
        <div className="page-hero">
          <p className="page-eyebrow">Tasks</p>
          <h1 className="page-title">任务页已经变成真实签到工作台。</h1>
          <p className="page-description">列表仍然保留，但下面的操作面板已经能对接现有后端接口执行位置、签到码、二维码和拍照签到。</p>
        </div>
      </section>

      <Section
        title="任务列表"
        description="展示课程、签到类型、截止时间和当前状态。"
        action={<span className="status-pill">{visibleTasks.length} items</span>}
      >
        <div className="toolbar-row">
          <input
            className="toolbar-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索课程、类型、状态"
          />
          <select className="toolbar-select" value={filter} onChange={(event) => setFilter(event.target.value as 'all' | '待签到' | '已准备')}>
            <option value="all">全部状态</option>
            <option value="待签到">待签到</option>
            <option value="已准备">已准备</option>
          </select>
          <button
            type="button"
            className="secondary-button"
            onClick={async () => {
              await loadTasks();
              await refreshDashboard();
              pushToast({
                title: '任务已刷新',
                message: '已重新同步当前活动和本地历史。',
                tone: 'info'
              });
            }}
          >
            刷新任务
          </button>
        </div>
        <div className="task-master-detail">
          <div className="task-list">
            {visibleTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                className={`task-list-item ${task.id === activeTask?.id ? 'is-selected' : ''}`}
                onClick={() => setSelectedTaskId(task.id)}
              >
                <div className="task-list-item-head">
                  <p className="task-list-item-title">{task.course}</p>
                  <span
                    className={`status-pill ${
                      task.status === '待签到'
                        ? 'status-pill--orange'
                        : task.status === '已准备' || task.status === '已完成'
                          ? 'status-pill--teal'
                          : task.status === '异常'
                            ? 'status-pill--pink'
                            : ''
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="task-list-item-meta">{task.type} · {task.isActive ? '当前活动' : '历史记录'}</p>
                <p className="task-list-item-meta">{new Date(task.updatedAt).toLocaleString()}</p>
              </button>
            ))}
          </div>

          <div className="task-detail-card">
            {activeTask ? (
              <>
                <p className="page-eyebrow">Selected Task</p>
                <h3 className="panel-section-title">{activeTask.course}</h3>
                <div className="task-detail-grid">
                  <div>
                    <p className="task-detail-label">签到类型</p>
                    <p className="task-detail-value">{activeTask.type}</p>
                  </div>
                  <div>
                    <p className="task-detail-label">来源</p>
                    <p className="task-detail-value">{activeTask.isActive ? '当前活动' : '历史记录'}</p>
                  </div>
                  <div>
                    <p className="task-detail-label">截止时间</p>
                    <p className="task-detail-value">{activeTask.due}</p>
                  </div>
                  <div>
                    <p className="task-detail-label">更新时间</p>
                    <p className="task-detail-value">{new Date(activeTask.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="helper-text">当前没有可查看的任务。</p>
            )}
          </div>
        </div>
      </Section>

      <Section
        title="通用位置参数"
        description="位置签到、二维码签到都会复用这里的地址、经纬度和海拔。默认值来自设置页。"
        action={canUseLocation ? <span className="status-pill status-pill--teal">Ready</span> : <span className="status-pill status-pill--orange">Need Address</span>}
      >
        <div className="form-grid">
          <label className="field">
            <span className="field-label">地址</span>
            <input className="field-input" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="请输入完整地址" />
          </label>
          <label className="field">
            <span className="field-label">纬度</span>
            <input className="field-input" value={lat} onChange={(event) => setLat(event.target.value)} placeholder="30.123456" />
          </label>
          <label className="field">
            <span className="field-label">经度</span>
            <input className="field-input" value={lon} onChange={(event) => setLon(event.target.value)} placeholder="120.123456" />
          </label>
          <label className="field">
            <span className="field-label">海拔</span>
            <input className="field-input" value={altitude} onChange={(event) => setAltitude(event.target.value)} placeholder="100" />
          </label>
        </div>
      </Section>

      <Section
        title="签到动作"
        description={`当前活动：${activeTask ? `${activeTask.course} · ${activeTask.type}` : '暂无待处理任务'}`}
      >
        <div className="action-stack">
          <article className={`action-card ${expandedAction === 'general' ? 'is-expanded' : ''}`}>
            <button type="button" className="action-card-head" onClick={() => setExpandedAction('general')}>
              <div>
                <p className="action-card-title">普通 / 手势签到</p>
                <p className="action-card-copy">适用于普通签到和手势签到。</p>
              </div>
              <span className={`status-pill ${canGeneral ? 'status-pill--teal' : 'status-pill--orange'}`}>{canGeneral ? 'Recommended' : 'Unavailable'}</span>
            </button>
            {expandedAction === 'general' ? (
              <div className="action-card-body">
                <button type="button" className="primary-button" disabled={!canGeneral || pendingMode === 'general'} onClick={() => void execute('general')}>
                  {pendingMode === 'general' ? '处理中…' : '提交普通签到'}
                </button>
              </div>
            ) : null}
          </article>

          <article className={`action-card ${expandedAction === 'location' ? 'is-expanded' : ''}`}>
            <button type="button" className="action-card-head" onClick={() => setExpandedAction('location')}>
              <div>
                <p className="action-card-title">位置签到</p>
                <p className="action-card-copy">直接复用上方已填写的位置参数。</p>
              </div>
              <span className={`status-pill ${canLocation ? 'status-pill--teal' : 'status-pill--orange'}`}>{canLocation ? 'Ready' : 'Need Match'}</span>
            </button>
            {expandedAction === 'location' ? (
              <div className="action-card-body">
                <button type="button" className="primary-button" disabled={!canLocation || pendingMode === 'location'} onClick={() => void execute('location')}>
                  {pendingMode === 'location' ? '处理中…' : '提交位置签到'}
                </button>
              </div>
            ) : null}
          </article>

          <article className={`action-card ${expandedAction === 'code' ? 'is-expanded' : ''}`}>
            <button type="button" className="action-card-head" onClick={() => setExpandedAction('code')}>
              <div>
                <p className="action-card-title">签到码</p>
                <p className="action-card-copy">输入老师发布的签到码后直接提交。</p>
              </div>
              <span className={`status-pill ${canCode ? 'status-pill--teal' : 'status-pill--orange'}`}>{canCode ? 'Ready' : 'Need Match'}</span>
            </button>
            {expandedAction === 'code' ? (
              <div className="action-card-body">
                <label className="field">
                  <span className="field-label">签到码</span>
                  <input className="field-input" value={signCode} onChange={(event) => setSignCode(event.target.value)} placeholder="输入签到码" />
                </label>
                <button type="button" className="primary-button" disabled={!canCode || !signCode.trim() || pendingMode === 'code'} onClick={() => void execute('code')}>
                  {pendingMode === 'code' ? '处理中…' : '提交签到码'}
                </button>
              </div>
            ) : null}
          </article>

          <article className={`action-card ${expandedAction === 'qr' ? 'is-expanded' : ''}`}>
            <button type="button" className="action-card-head" onClick={() => setExpandedAction('qr')}>
              <div>
                <p className="action-card-title">二维码签到</p>
                <p className="action-card-copy">支持二维码链接和图片识别两种入口。</p>
              </div>
              <span className={`status-pill ${canQr ? 'status-pill--teal' : 'status-pill--orange'}`}>{canQr ? 'Ready' : 'Need Match'}</span>
            </button>
            {expandedAction === 'qr' ? (
              <div className="action-card-body action-card-body--split">
                <div className="action-subcard">
                  <label className="field">
                    <span className="field-label">二维码链接</span>
                    <input className="field-input" value={qrUrl} onChange={(event) => setQrUrl(event.target.value)} placeholder="粘贴扫码后的完整 URL" />
                  </label>
                  <button type="button" className="primary-button" disabled={!canQr || !qrUrl.trim() || pendingMode === 'qr-url'} onClick={() => void execute('qr-url')}>
                    {pendingMode === 'qr-url' ? '处理中…' : '提交二维码链接'}
                  </button>
                </div>
                <div className="action-subcard">
                  <label className="field">
                    <span className="field-label">二维码图片</span>
                    <input type="file" accept="image/*" className="field-input field-input--file" onChange={(event) => setQrImage(event.target.files?.[0] || null)} />
                  </label>
                  <button type="button" className="primary-button" disabled={!canQr || !qrImage || pendingMode === 'qr-image'} onClick={() => void execute('qr-image')}>
                    {pendingMode === 'qr-image' ? '识别并提交中…' : '识别二维码并签到'}
                  </button>
                </div>
              </div>
            ) : null}
          </article>

          <article className={`action-card ${expandedAction === 'photo' ? 'is-expanded' : ''}`}>
            <button type="button" className="action-card-head" onClick={() => setExpandedAction('photo')}>
              <div>
                <p className="action-card-title">拍照上传签到</p>
                <p className="action-card-copy">先上传签到图片，再调用拍照签到接口完成签到。</p>
              </div>
              <span className={`status-pill ${canPhoto ? 'status-pill--teal' : 'status-pill--orange'}`}>{canPhoto ? 'Ready' : 'Need Match'}</span>
            </button>
            {expandedAction === 'photo' ? (
              <div className="action-card-body">
                <label className="field">
                  <span className="field-label">签到图片</span>
                  <input type="file" accept="image/*" className="field-input field-input--file" onChange={(event) => setPhotoFile(event.target.files?.[0] || null)} />
                </label>
                <button type="button" className="primary-button" disabled={!canPhoto || !photoFile || pendingMode === 'photo'} onClick={() => void execute('photo')}>
                  {pendingMode === 'photo' ? '上传并提交中…' : '提交拍照签到'}
                </button>
              </div>
            ) : null}
          </article>
        </div>

        {actionStatus ? <div className="inline-status">{actionStatus}</div> : null}
      </Section>
    </div>
  );
};
