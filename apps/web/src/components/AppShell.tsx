import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { maskPhone } from '../services/storage';

const navItems = [
  { to: '/', label: 'Dashboard', hint: '概览与快速操作' },
  { to: '/sign', label: '签到', hint: '核心签到工作区' },
  { to: '/courses', label: '课程', hint: '历史与沉淀记录' },
  { to: '/logs', label: '日志', hint: '结果追踪与排错' },
  { to: '/settings', label: '设置', hint: '账号与连接配置' },
];

export const AppShell = () => {
  const { session, signOut } = useAppState();

  return (
    <div className='min-h-screen px-4 py-4 sm:px-6 lg:px-8'>
      <div className='mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[290px_minmax(0,1fr)]'>
        <aside className='shadow-panel rounded-[34px] border border-black/5 bg-[color:var(--cx-dark)] px-6 py-7 text-white'>
          <div className='space-y-4'>
            <p className='text-xs uppercase tracking-[0.34em] text-stone-400'>Chaoxing Sign</p>
            <h1 className='font-display text-[2.1rem] font-semibold leading-none text-stone-50'>Control Atlas</h1>
            <p className='max-w-[16rem] text-sm leading-6 text-stone-400'>把签到系统整理成更像成熟 SaaS 控制台的工作区，而不是脚本面板。</p>
          </div>

          <div className='mt-10 rounded-[28px] border border-white/8 bg-white/5 p-5'>
            <p className='text-xs uppercase tracking-[0.24em] text-stone-500'>当前账号</p>
            <p className='mt-3 font-display text-2xl font-semibold text-stone-50'>{session?.name || '未登录'}</p>
            <p className='mt-1 text-sm text-stone-400'>{maskPhone(session?.phone || '')}</p>
            <div className='mt-5 rounded-2xl bg-emerald-100/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-emerald-200'>
              Workspace Active
            </div>
          </div>

          <nav className='mt-8 grid gap-2'>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-[22px] px-4 py-3 transition ${
                    isActive ? 'bg-[color:var(--cx-panel-strong)] text-[color:var(--cx-dark)]' : 'text-stone-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <p className='text-sm font-medium'>{item.label}</p>
                <p className='mt-1 text-xs text-current/70'>{item.hint}</p>
              </NavLink>
            ))}
          </nav>

          <button
            type='button'
            onClick={signOut}
            className='mt-8 w-full rounded-[22px] border border-white/10 px-4 py-3 text-sm font-medium text-stone-200 transition hover:border-white/30 hover:bg-white/10'
          >
            退出登录
          </button>
        </aside>

        <main className='shadow-panel rounded-[34px] border border-white/40 bg-[color:var(--cx-panel)] p-4 backdrop-blur sm:p-6 lg:p-8'>
          <div className='mb-6 flex flex-col gap-4 rounded-[28px] border border-[color:var(--cx-border)] bg-[color:var(--cx-panel-strong)] px-5 py-4 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <p className='text-xs uppercase tracking-[0.26em] text-[color:var(--cx-text-muted)]'>Dashboard Layer</p>
              <p className='mt-2 font-display text-3xl font-semibold text-[color:var(--cx-text)]'>Front-end workspace</p>
            </div>
            <div className='rounded-[22px] bg-[color:var(--cx-accent-soft)] px-4 py-3 text-sm text-[color:var(--cx-accent)]'>
              当前页面只重做产品层体验，不改后端接口行为。
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
