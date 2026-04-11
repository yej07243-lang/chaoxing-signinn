import React from 'react';
import { SectionCard } from '../components/SectionCard';
import { SignActionPanel } from '../components/SignActionPanel';
import { StatusBadge } from '../components/StatusBadge';
import { useAppState } from '../hooks/useAppState';
import { maskPhone } from '../services/storage';

const statValue = (value: string) => value || '暂无';

export const DashboardPage = () => {
  const {
    session,
    activity,
    activityState,
    authState,
    loginStatus,
    lastSignStatus,
    monitorActive,
    refreshActivity,
    signCurrentTask,
    signPending,
  } = useAppState();

  const hasTask = activityState === 'ready' && !!activity?.activeId;

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
        <div>
          <p className='text-sm font-medium uppercase tracking-[0.25em] text-slate-400'>Overview</p>
          <h1 className='mt-3 text-3xl font-semibold text-slate-950'>Dashboard</h1>
          <p className='mt-3 max-w-2xl text-sm leading-6 text-slate-500'>聚合账号、当前任务和最近结果，首页只展示用户真正关心的信息。</p>
        </div>

        <div className='flex flex-wrap gap-3'>
          <button
            type='button'
            onClick={() => refreshActivity()}
            className='rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900'
          >
            立即检测签到
          </button>
          <button
            type='button'
            disabled={!hasTask || signPending}
            onClick={signCurrentTask}
            className='rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
          >
            {signPending ? '签到中...' : '立即签到'}
          </button>
        </div>
      </div>

      <div className='grid gap-4 lg:grid-cols-4'>
        <SectionCard title='当前账号'>
          <div className='space-y-3'>
            <div>
              <p className='text-sm text-slate-500'>姓名</p>
              <p className='mt-1 text-xl font-semibold text-slate-950'>{statValue(session?.name || '')}</p>
            </div>
            <div>
              <p className='text-sm text-slate-500'>手机号</p>
              <p className='mt-1 text-base font-medium text-slate-900'>{maskPhone(session?.phone || '') || '未保存'}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title='登录状态'>
          <div className='space-y-3'>
            <StatusBadge tone={authState === 'authenticated' ? 'success' : authState === 'error' ? 'danger' : 'warning'}>
              {authState === 'authenticated' ? '已登录' : authState === 'loading' ? '登录中' : '未登录'}
            </StatusBadge>
            <p className='text-xl font-semibold text-slate-950'>{loginStatus || (authState === 'authenticated' ? '凭证可用' : '等待登录')}</p>
            <p className='text-sm text-slate-500'>当前账号的会话状态与接口可用性会体现在这里。</p>
          </div>
        </SectionCard>

        <SectionCard title='最近签到状态'>
          <div className='space-y-3'>
            <StatusBadge tone={lastSignStatus === '签到成功' ? 'success' : 'neutral'}>
              {lastSignStatus ? '最近结果' : '等待签到'}
            </StatusBadge>
            <p className='text-xl font-semibold text-slate-950'>{statValue(lastSignStatus)}</p>
            <p className='text-sm text-slate-500'>如果后端返回错误或需要额外参数，结果会在日志页保留。</p>
          </div>
        </SectionCard>

        <SectionCard title='运行状态'>
          <div className='space-y-3'>
            <StatusBadge tone={monitorActive ? 'success' : 'warning'}>
              {monitorActive ? '监听中' : '未监听'}
            </StatusBadge>
            <p className='text-xl font-semibold text-slate-950'>{hasTask ? '有可签到任务' : activityState === 'loading' ? '正在查询' : '当前无任务'}</p>
            <p className='text-sm text-slate-500'>首页不暴露技术日志，只保留状态级信息。</p>
          </div>
        </SectionCard>
      </div>

      <SectionCard title='立即签到' description='保留后端原有接口，不改变业务逻辑，只重做前端交互。'>
        <SignActionPanel />
      </SectionCard>
    </div>
  );
};
