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
      <div className='shadow-panel grid w-full max-w-6xl overflow-hidden rounded-[40px] border border-white/50 bg-[color:var(--cx-panel)] backdrop-blur lg:grid-cols-[1.08fr_0.92fr]'>
        <section className='hidden bg-[color:var(--cx-dark)] p-10 text-white lg:flex lg:flex-col lg:justify-between'>
          <div>
            <p className='text-xs uppercase tracking-[0.35em] text-stone-400'>Chaoxing Sign</p>
            <h1 className='font-display mt-6 max-w-md text-6xl font-semibold leading-[0.95]'>Sign into a clearer workspace.</h1>
            <p className='mt-6 max-w-md text-base leading-7 text-stone-300'>
              参考 `careercompass` 的产品页气质，改成更像应用首页的登录界面，减少工具页感。
            </p>
          </div>
          <div className='space-y-4'>
            <div className='rounded-[28px] border border-white/10 bg-white/5 p-6'>
              <p className='text-sm text-stone-300'>你现在看到的是重做后的前端产品层，不展示后端内部日志，也不会在界面中暴露账号密码。</p>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='rounded-[24px] bg-white/6 p-5'>
                <p className='text-xs uppercase tracking-[0.18em] text-stone-500'>Experience</p>
                <p className='mt-3 font-display text-3xl text-stone-50'>01</p>
                <p className='mt-2 text-sm text-stone-400'>Warm dashboard direction</p>
              </div>
              <div className='rounded-[24px] bg-emerald-200/10 p-5'>
                <p className='text-xs uppercase tracking-[0.18em] text-emerald-200/70'>Focus</p>
                <p className='mt-3 font-display text-3xl text-emerald-100'>UI</p>
                <p className='mt-2 text-sm text-emerald-100/80'>Keep sign flow intact</p>
              </div>
            </div>
          </div>
        </section>

        <section className='bg-[color:var(--cx-panel-strong)] p-6 sm:p-10'>
          <div className='mx-auto max-w-md'>
            <p className='text-sm font-medium uppercase tracking-[0.24em] text-[color:var(--cx-text-muted)]'>账号登录</p>
            <h2 className='font-display mt-3 text-5xl font-semibold leading-none text-[color:var(--cx-text)]'>进入签到控制台</h2>
            <p className='mt-4 text-sm leading-6 text-[color:var(--cx-text-muted)]'>输入手机号与密码。登录信息仅保存在浏览器 `localStorage`。</p>

            <div className='mt-7 rounded-[24px] border border-[color:var(--cx-border)] bg-white/70 px-4 py-4'>
              <p className='text-xs uppercase tracking-[0.2em] text-[color:var(--cx-text-muted)]'>当前 API</p>
              <p className='mt-2 break-all text-sm font-medium text-[color:var(--cx-text)]'>{currentApiBaseUrl}</p>
            </div>

            {accounts.length > 0 ? (
              <div className='mt-6 rounded-[24px] border border-[color:var(--cx-border)] bg-white/70 px-4 py-4'>
                <p className='text-xs uppercase tracking-[0.2em] text-[color:var(--cx-text-muted)]'>已保存账号</p>
                <div className='mt-3 flex flex-wrap gap-2'>
                  {accounts.map((account) => (
                    <button
                      key={account.phone}
                      type='button'
                      onClick={() => {
                        setPhone(account.phone);
                        setPassword(account.password);
                      }}
                      className='rounded-full border border-[color:var(--cx-border)] bg-[color:var(--cx-bg-soft)] px-3 py-1.5 text-sm font-medium text-[color:var(--cx-text)] transition hover:border-[color:var(--cx-text)]'
                    >
                      {account.phone.slice(0, 3)}****{account.phone.slice(-4)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <form className='mt-10 space-y-5' onSubmit={onSubmit}>
              <label className='block'>
                <span className='mb-2 block text-sm font-medium text-[color:var(--cx-text)]'>手机号</span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className='w-full rounded-[22px] border border-[color:var(--cx-border)] bg-white/80 px-4 py-3 outline-none transition focus:border-[color:var(--cx-text)]'
                  placeholder='请输入手机号'
                  autoComplete='username'
                />
              </label>

              <label className='block'>
                <span className='mb-2 block text-sm font-medium text-[color:var(--cx-text)]'>密码</span>
                <input
                  type='password'
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className='w-full rounded-[22px] border border-[color:var(--cx-border)] bg-white/80 px-4 py-3 outline-none transition focus:border-[color:var(--cx-text)]'
                  placeholder='请输入密码'
                  autoComplete='current-password'
                />
              </label>

              <button
                type='submit'
                disabled={authState === 'loading'}
                className='flex w-full items-center justify-center rounded-[22px] bg-[color:var(--cx-dark)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {authState === 'loading' ? '登录中...' : '登录'}
              </button>
            </form>

            <div className={`mt-6 rounded-[22px] px-4 py-3 text-sm ${
              authState === 'error' ? 'bg-rose-50 text-rose-700' : authState === 'loading' ? 'bg-amber-50 text-amber-700' : 'bg-white/70 text-[color:var(--cx-text-muted)]'
            }`}>
              登录状态：{loginStatus || '等待输入'}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
