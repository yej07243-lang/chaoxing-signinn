import React from 'react';
import { SectionCard } from '../components/SectionCard';
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
          <p className='text-sm font-medium uppercase tracking-[0.25em] text-[color:var(--cx-text-muted)]'>Overview</p>
          <h1 className='font-display mt-3 text-5xl font-semibold leading-none text-[color:var(--cx-text)]'>Dashboard</h1>
          <p className='mt-4 max-w-2xl text-sm leading-6 text-[color:var(--cx-text-muted)]'>聚合账号、当前任务和最近结果。首页参考 `careercompass` 的讲述式布局，只保留你真正会立即查看的信息。</p>
        </div>

        <div className='flex flex-wrap gap-3'>
          <button
            type='button'
            onClick={() => refreshActivity()}
            className='rounded-[22px] border border-[color:var(--cx-border)] bg-white/75 px-4 py-3 text-sm font-semibold text-[color:var(--cx-text)] transition hover:border-[color:var(--cx-text)]'
          >
            立即检测签到
          </button>
          <button
            type='button'
            disabled={!hasTask || signPending}
            onClick={signCurrentTask}
            className='rounded-[22px] bg-[color:var(--cx-dark)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-stone-300'
          >
            {signPending ? '签到中...' : '立即签到'}
          </button>
        </div>
      </div>

      <section className='shadow-panel overflow-hidden rounded-[34px] border border-[color:var(--cx-border)] bg-[color:var(--cx-panel-strong)]'>
        <div className='grid gap-0 lg:grid-cols-[1.15fr_0.85fr]'>
          <div className='p-7 sm:p-8'>
            <p className='text-xs uppercase tracking-[0.26em] text-[color:var(--cx-text-muted)]'>Signature View</p>
            <h2 className='font-display mt-4 max-w-xl text-5xl font-semibold leading-[0.94] text-[color:var(--cx-text)]'>
              {hasTask ? activity?.name || '发现新的签到任务' : '当前没有待签到活动'}
            </h2>
            <p className='mt-4 max-w-xl text-sm leading-7 text-[color:var(--cx-text-muted)]'>
              {hasTask
                ? '系统已经检测到可执行任务。你可以直接在这里发起签到，或者进入签到页选择更具体的方式。'
                : activityState === 'loading'
                  ? '正在向后端拉取活动信息，稍后会自动刷新当前状态。'
                  : '当后端检测到课程活动后，这里会切换成任务主视图，并突出显示最适合立即操作的入口。'}
            </p>
            <div className='mt-6 flex flex-wrap gap-3'>
              <StatusBadge tone={hasTask ? 'success' : 'warning'}>{hasTask ? 'Task Ready' : 'Standby'}</StatusBadge>
              <StatusBadge tone={monitorActive ? 'success' : 'neutral'}>{monitorActive ? 'Monitor Active' : 'Monitor Idle'}</StatusBadge>
              {activity?.name ? <StatusBadge>{activity.name}</StatusBadge> : null}
            </div>
          </div>
          <div className='bg-[color:var(--cx-dark)] p-7 text-white sm:p-8'>
            <p className='text-xs uppercase tracking-[0.24em] text-stone-500'>Quick Notes</p>
            <div className='mt-6 space-y-4'>
              <div className='rounded-[24px] bg-white/6 p-4'>
                <p className='text-sm text-stone-300'>当前账号</p>
                <p className='mt-2 font-display text-3xl text-white'>{statValue(session?.name || '')}</p>
              </div>
              <div className='rounded-[24px] bg-emerald-200/10 p-4'>
                <p className='text-sm text-emerald-100/80'>最近签到</p>
                <p className='mt-2 text-lg font-semibold text-emerald-50'>{statValue(lastSignStatus)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className='grid gap-4 lg:grid-cols-4'>
        <SectionCard title='当前账号'>
          <div className='space-y-3'>
            <div>
              <p className='text-sm text-[color:var(--cx-text-muted)]'>姓名</p>
              <p className='font-display mt-1 text-3xl font-semibold text-[color:var(--cx-text)]'>{statValue(session?.name || '')}</p>
            </div>
            <div>
              <p className='text-sm text-[color:var(--cx-text-muted)]'>手机号</p>
              <p className='mt-1 text-base font-medium text-[color:var(--cx-text)]'>{maskPhone(session?.phone || '') || '未保存'}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title='登录状态'>
          <div className='space-y-3'>
            <StatusBadge tone={authState === 'authenticated' ? 'success' : authState === 'error' ? 'danger' : 'warning'}>
              {authState === 'authenticated' ? '已登录' : authState === 'loading' ? '登录中' : '未登录'}
            </StatusBadge>
            <p className='text-xl font-semibold text-[color:var(--cx-text)]'>{loginStatus || (authState === 'authenticated' ? '凭证可用' : '等待登录')}</p>
            <p className='text-sm leading-6 text-[color:var(--cx-text-muted)]'>当前账号的会话状态与接口可用性会体现在这里。</p>
          </div>
        </SectionCard>

        <SectionCard title='最近签到状态'>
          <div className='space-y-3'>
            <StatusBadge tone={lastSignStatus === '签到成功' ? 'success' : 'neutral'}>
              {lastSignStatus ? '最近结果' : '等待签到'}
            </StatusBadge>
            <p className='text-xl font-semibold text-[color:var(--cx-text)]'>{statValue(lastSignStatus)}</p>
            <p className='text-sm leading-6 text-[color:var(--cx-text-muted)]'>如果后端返回错误或需要额外参数，结果会在日志页保留。</p>
          </div>
        </SectionCard>

        <SectionCard title='运行状态'>
          <div className='space-y-3'>
            <StatusBadge tone={monitorActive ? 'success' : 'warning'}>
              {monitorActive ? '监听中' : '未监听'}
            </StatusBadge>
            <p className='text-xl font-semibold text-[color:var(--cx-text)]'>{hasTask ? '有可签到任务' : activityState === 'loading' ? '正在查询' : '当前无任务'}</p>
            <p className='text-sm leading-6 text-[color:var(--cx-text-muted)]'>首页不暴露技术日志，只保留状态级信息。</p>
          </div>
        </SectionCard>
      </div>

      <SectionCard title='签到入口' description='可选的签到方式已集中到侧边栏的“签到”页面，首页保留检测和快速发起。'>
        <div className='rounded-[26px] border border-[color:var(--cx-border)] bg-white/60 p-6'>
          <p className='font-display text-2xl font-semibold text-[color:var(--cx-text)]'>前往“签到”页面</p>
          <p className='mt-2 text-sm leading-6 text-[color:var(--cx-text-muted)]'>
            在“签到”页面中可以选择当前活动签到、拍照签到、位置签到和二维码图片签到。
          </p>
        </div>
      </SectionCard>
    </div>
  );
};
