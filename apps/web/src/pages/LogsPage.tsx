import React, { useEffect, useRef } from 'react';
import { EmptyState } from '../components/EmptyState';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { useAppState } from '../hooks/useAppState';

const levelTone: Record<LogEntry['level'], 'neutral' | 'success' | 'danger'> = {
  info: 'neutral',
  success: 'success',
  error: 'danger',
};

export const LogsPage = () => {
  const { logs } = useAppState();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = 0;
  }, [logs]);

  return (
    <div className='space-y-6'>
      <div>
        <p className='text-sm font-medium uppercase tracking-[0.25em] text-slate-400'>Logs</p>
        <h1 className='mt-3 text-3xl font-semibold text-slate-950'>日志</h1>
        <p className='mt-3 max-w-2xl text-sm leading-6 text-slate-500'>这里仅保留后端返回后的业务结果和前端状态信息，手机号会脱敏，密码不会写入日志。</p>
      </div>

      <SectionCard title='最近日志' description='最新内容在顶部，支持滚动查看。'>
        {logs.length === 0 ? (
          <EmptyState title='暂无日志' description='登录、查询任务或执行签到后，这里会自动记录清洗后的结果。' />
        ) : (
          <div ref={containerRef} className='max-h-[560px] space-y-3 overflow-y-auto pr-1'>
            {logs.map((log) => (
              <div key={log.id} className='rounded-3xl border border-slate-200 bg-slate-50/80 p-4'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <div className='flex items-center gap-2'>
                    <StatusBadge tone={levelTone[log.level]}>{log.level}</StatusBadge>
                    <span className='text-xs uppercase tracking-[0.24em] text-slate-400'>{log.source}</span>
                  </div>
                  <span className='text-xs text-slate-400'>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <p className='mt-3 text-sm leading-6 text-slate-700'>{log.message}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title='安全说明'>
        <div className='grid gap-4 md:grid-cols-3'>
          <div className='rounded-2xl bg-slate-50 p-4'>
            <p className='text-sm font-semibold text-slate-900'>手机号脱敏</p>
            <p className='mt-2 text-sm leading-6 text-slate-500'>日志写入前会自动清洗手机号，只显示脱敏内容。</p>
          </div>
          <div className='rounded-2xl bg-slate-50 p-4'>
            <p className='text-sm font-semibold text-slate-900'>密码隐藏</p>
            <p className='mt-2 text-sm leading-6 text-slate-500'>密码不会渲染到日志区域，命中敏感字段时会替换为 `[hidden]`。</p>
          </div>
          <div className='rounded-2xl bg-slate-50 p-4'>
            <p className='text-sm font-semibold text-slate-900'>倒序展示</p>
            <p className='mt-2 text-sm leading-6 text-slate-500'>最新日志固定在最上方，便于快速确认最近一次登录、检测和签到结果。</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};
