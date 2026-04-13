import React, { useEffect, useRef } from 'react';
import { EmptyState } from '../components/EmptyState';
import { SectionHeader } from '../components/SectionHeader';
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
      <SectionHeader
        eyebrow='Logs'
        title='日志与回溯'
        description='这里保留清洗后的业务结果和前端状态，不展示敏感凭证。布局重写为更像产品时间线，而不是单纯文本堆叠。'
      />

      <SectionCard title='最近日志' description='最新内容在顶部，支持滚动查看。'>
        {logs.length === 0 ? (
          <EmptyState title='暂无日志' description='登录、查询任务或执行签到后，这里会自动记录清洗后的结果。' />
        ) : (
          <div ref={containerRef} className='max-h-[560px] space-y-3 overflow-y-auto pr-1'>
            {logs.map((log) => (
              <div key={log.id} className='rounded-[26px] border border-[color:var(--cx-border)] bg-white/65 p-4'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <div className='flex items-center gap-2'>
                    <StatusBadge tone={levelTone[log.level]}>{log.level}</StatusBadge>
                    <span className='text-xs uppercase tracking-[0.24em] text-[color:var(--cx-text-muted)]'>{log.source}</span>
                  </div>
                  <span className='text-xs text-[color:var(--cx-text-muted)]'>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <p className='mt-3 text-sm leading-6 text-[color:var(--cx-text)]'>{log.message}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title='安全说明'>
        <div className='grid gap-4 md:grid-cols-3'>
          <div className='cx-muted-block'>
            <p className='text-sm font-semibold text-[color:var(--cx-text)]'>手机号脱敏</p>
            <p className='mt-2 text-sm leading-6 text-[color:var(--cx-text-muted)]'>日志写入前会自动清洗手机号，只显示脱敏内容。</p>
          </div>
          <div className='cx-muted-block'>
            <p className='text-sm font-semibold text-[color:var(--cx-text)]'>密码隐藏</p>
            <p className='mt-2 text-sm leading-6 text-[color:var(--cx-text-muted)]'>密码不会渲染到日志区域，命中敏感字段时会替换为 `[hidden]`。</p>
          </div>
          <div className='cx-muted-block'>
            <p className='text-sm font-semibold text-[color:var(--cx-text)]'>倒序展示</p>
            <p className='mt-2 text-sm leading-6 text-[color:var(--cx-text-muted)]'>最新日志固定在最上方，便于快速确认最近一次登录、检测和签到结果。</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};
