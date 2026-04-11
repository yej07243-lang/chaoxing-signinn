import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, loginStatus, authState, session, accounts, currentApiBaseUrl } = useAppState();
  const [phone, setPhone] = useState(session?.phone || '');
  const [password, setPassword] = useState(session?.password || '');

  const from = (location.state as { from?: string } | null)?.from || '/';

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await signIn(phone.trim(), password);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center px-4 py-10'>
      <div className='grid w-full max-w-5xl overflow-hidden rounded-[36px] border border-white/80 bg-white/80 shadow-panel backdrop-blur lg:grid-cols-[1.15fr_0.85fr]'>
        <section className='hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between'>
          <div>
            <p className='text-xs uppercase tracking-[0.35em] text-slate-400'>Chaoxing Sign</p>
            <h1 className='mt-6 max-w-md text-5xl font-semibold leading-tight'>把签到页面做成真正可用的控制台。</h1>
            <p className='mt-6 max-w-md text-base leading-7 text-slate-300'>
              一个更清晰的登录流程、一个更稳定的 Dashboard，以及适合手机和桌面的统一体验。
            </p>
          </div>
          <div className='rounded-[28px] border border-white/10 bg-white/5 p-6'>
            <p className='text-sm text-slate-300'>你现在看到的是前端产品层，不展示后端内部日志，也不会在界面中暴露账号密码。</p>
          </div>
        </section>

        <section className='p-6 sm:p-10'>
          <div className='mx-auto max-w-md'>
            <p className='text-sm font-medium text-slate-500'>账号登录</p>
            <h2 className='mt-3 text-3xl font-semibold text-slate-950'>进入签到控制台</h2>
            <p className='mt-3 text-sm leading-6 text-slate-500'>输入手机号与密码。登录信息仅保存在浏览器 localStorage。</p>

            <div className='mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
              <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>当前 API</p>
              <p className='mt-2 break-all text-sm font-medium text-slate-700'>{currentApiBaseUrl}</p>
            </div>

            {accounts.length > 0 ? (
              <div className='mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-4'>
                <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>已保存账号</p>
                <div className='mt-3 flex flex-wrap gap-2'>
                  {accounts.map((account) => (
                    <button
                      key={account.phone}
                      type='button'
                      onClick={() => {
                        setPhone(account.phone);
                        setPassword(account.password);
                      }}
                      className='rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-900'
                    >
                      {account.phone.slice(0, 3)}****{account.phone.slice(-4)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <form className='mt-10 space-y-5' onSubmit={onSubmit}>
              <label className='block'>
                <span className='mb-2 block text-sm font-medium text-slate-700'>手机号</span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900'
                  placeholder='请输入手机号'
                  autoComplete='username'
                />
              </label>

              <label className='block'>
                <span className='mb-2 block text-sm font-medium text-slate-700'>密码</span>
                <input
                  type='password'
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900'
                  placeholder='请输入密码'
                  autoComplete='current-password'
                />
              </label>

              <button
                type='submit'
                disabled={authState === 'loading'}
                className='flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {authState === 'loading' ? '登录中...' : '登录'}
              </button>
            </form>

            <div className={`mt-6 rounded-2xl px-4 py-3 text-sm ${
              authState === 'error' ? 'bg-rose-50 text-rose-700' : authState === 'loading' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-600'
            }`}>
              登录状态：{loginStatus || '等待输入'}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
