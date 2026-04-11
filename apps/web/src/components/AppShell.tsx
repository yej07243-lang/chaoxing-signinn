import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { maskPhone } from '../services/storage';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/courses', label: '课程' },
  { to: '/logs', label: '日志' },
  { to: '/settings', label: '设置' },
];

export const AppShell = () => {
  const { session, signOut } = useAppState();

  return (
    <div className='min-h-screen px-4 py-5 sm:px-6 lg:px-8'>
      <div className='mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-7xl gap-4 lg:grid-cols-[260px_minmax(0,1fr)]'>
        <aside className='rounded-[32px] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel'>
          <div className='space-y-3'>
            <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Chaoxing Sign</p>
            <h1 className='text-2xl font-semibold leading-tight'>签到控制台</h1>
            <p className='text-sm text-slate-400'>更像产品，而不是工具页。</p>
          </div>

          <div className='mt-10 rounded-3xl bg-white/5 p-4'>
            <p className='text-xs uppercase tracking-[0.2em] text-slate-500'>当前账号</p>
            <p className='mt-3 text-lg font-semibold'>{session?.name || '未登录'}</p>
            <p className='mt-1 text-sm text-slate-400'>{maskPhone(session?.phone || '')}</p>
          </div>

          <nav className='mt-8 grid gap-2'>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type='button'
            onClick={signOut}
            className='mt-8 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10'
          >
            退出登录
          </button>
        </aside>

        <main className='rounded-[32px] border border-white/70 bg-white/70 p-4 shadow-panel backdrop-blur sm:p-6 lg:p-8'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
