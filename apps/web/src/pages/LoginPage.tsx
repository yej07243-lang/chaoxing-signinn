import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginHeroArt } from '../components/LoginHeroArt';
import { StatusBadge } from '../components/StatusBadge';
import { useAppState } from '../hooks/useAppState';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, loginStatus, authState, session } = useAppState();
  const [phone, setPhone] = useState(session?.phone || '');
  const [password, setPassword] = useState(session?.password || '');
  const [rememberMe, setRememberMe] = useState(true);
  const [targetGaze, setTargetGaze] = useState({ x: 0, y: 0 });
  const [gaze, setGaze] = useState({ x: 0, y: 0 });

  const from = (location.state as { from?: string } | null)?.from || '/';

  useEffect(() => {
    let frame = 0;

    const animate = () => {
      setGaze((current) => {
        const nextX = current.x + (targetGaze.x - current.x) * 0.16;
        const nextY = current.y + (targetGaze.y - current.y) * 0.16;
        return {
          x: Math.abs(nextX) < 0.01 ? 0 : nextX,
          y: Math.abs(nextY) < 0.01 ? 0 : nextY,
        };
      });
      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [targetGaze]);

  const orangeEyeStyle = useMemo(
    () => ({
      transform: `translate(${gaze.x * 0.18}px, ${gaze.y * 0.22}px)`,
    }),
    [gaze.x, gaze.y]
  );

  const orangeHeadStyle = useMemo(
    () => ({
      transform: `translate(${gaze.x * 0.1}px, ${gaze.y * 0.12}px) rotate(${gaze.x * 0.18}deg)`,
      transformOrigin: '145px 320px',
    }),
    [gaze.x, gaze.y]
  );

  const purpleHeadStyle = useMemo(
    () => ({
      transform: `translate(${gaze.x * 0.2}px, ${gaze.y * 0.22}px) rotate(${gaze.x * 0.22}deg)`,
      transformOrigin: '248px 144px',
    }),
    [gaze.x, gaze.y]
  );

  const purpleEyeStyle = useMemo(
    () => ({
      transform: `translate(${gaze.x * 0.52}px, ${gaze.y * 0.48}px)`,
    }),
    [gaze.x, gaze.y]
  );

  const darkHeadStyle = useMemo(
    () => ({
      transform: `translate(${gaze.x * 0.12}px, ${gaze.y * 0.14}px) rotate(${gaze.x * 0.14}deg)`,
      transformOrigin: '320px 210px',
    }),
    [gaze.x, gaze.y]
  );

  const darkEyeStyle = useMemo(
    () => ({
      transform: `translate(${gaze.x * 0.66}px, ${gaze.y * 0.32}px)`,
    }),
    [gaze.x, gaze.y]
  );

  const yellowHeadStyle = useMemo(
    () => ({
      transform: `translate(${gaze.x * 0.34}px, ${gaze.y * 0.06}px) rotate(${gaze.x * 0.12}deg)`,
      transformOrigin: '398px 248px',
    }),
    [gaze.x, gaze.y]
  );

  const yellowEyeStyle = useMemo(
    () => ({
      transform: `translate(${gaze.x * 0.72}px, ${gaze.y * 0.12}px)`,
    }),
    [gaze.x, gaze.y]
  );

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await signIn(phone.trim(), password);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  const handleStagePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (event.clientX - centerX) / rect.width;
    const offsetY = (event.clientY - centerY) / rect.height;

    setTargetGaze({
      x: Math.max(-6, Math.min(6, offsetX * 18)),
      y: Math.max(-4, Math.min(4, offsetY * 14)),
    });
  };

  const resetGaze = () => {
    setTargetGaze({ x: 0, y: 0 });
  };

  return (
    <div className='min-h-screen overflow-hidden bg-[#1f2027] px-4 py-8 sm:px-6 lg:px-8'>
      <div className='mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center'>
        <div className='shadow-panel animate-rise relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-[#f4f2ef]'>
          <section
            className='relative min-h-[760px] overflow-hidden bg-[#f4f2ef] lg:pr-[390px]'
            onPointerMove={handleStagePointerMove}
            onPointerLeave={resetGaze}
          >
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_left_bottom,rgba(255,154,84,0.28),transparent_24%),radial-gradient(circle_at_left_top,rgba(125,92,255,0.24),transparent_28%)]' />
            <div className='animate-pulse-soft absolute -left-10 top-16 h-52 w-52 rounded-full bg-[#8f74ff]/20 blur-3xl' />
            <div className='animate-float-slower absolute bottom-10 left-10 h-44 w-44 rounded-full bg-[#ff9250]/20 blur-3xl' />
            <div className='absolute left-10 top-8 rounded-full border border-black/10 bg-white/75 px-4 py-2 text-xs font-medium tracking-[0.18em] text-black/55 backdrop-blur'>
              SIGN-IN STAGE
            </div>

            <div className='relative flex min-h-[760px] items-center justify-center px-6 lg:justify-start lg:px-16'>
              <div className='animate-float-soft relative h-[430px] w-[430px] scale-[0.8] sm:scale-90 lg:scale-100'>
                <LoginHeroArt
                  orangeHeadStyle={orangeHeadStyle}
                  orangeEyeStyle={orangeEyeStyle}
                  purpleHeadStyle={purpleHeadStyle}
                  purpleEyeStyle={purpleEyeStyle}
                  darkHeadStyle={darkHeadStyle}
                  darkEyeStyle={darkEyeStyle}
                  yellowHeadStyle={yellowHeadStyle}
                  yellowEyeStyle={yellowEyeStyle}
                />
              </div>
            </div>

            <section className='absolute inset-x-4 top-4 bottom-4 rounded-[28px] bg-white/92 p-6 shadow-[0_24px_60px_rgba(20,20,24,0.12)] backdrop-blur sm:inset-x-8 sm:p-8 lg:inset-y-3 lg:right-3 lg:left-auto lg:w-[360px] lg:p-10'>
              <div className='mx-auto flex h-full w-full max-w-sm flex-col justify-center'>
                <div className='flex justify-center'>
                  <div className='animate-rise flex h-12 w-12 items-center justify-center rounded-full bg-[#1f2027] text-white'>
                    <span className='text-lg'>✦</span>
                  </div>
                </div>

                <div className='mt-6 text-center'>
                  <p className='font-display text-[2.65rem] font-semibold leading-none tracking-[-0.03em] text-[#1f2027]'>欢迎回来</p>
                  <p className='mt-3 text-[13px] leading-6 tracking-[0.01em] text-black/42'>输入你的超星账号信息，进入签到控制台。</p>
                </div>

                <form className='mt-10 space-y-5' onSubmit={onSubmit}>
                  <label className='block'>
                    <span className='mb-2 block text-[13px] font-medium tracking-[0.01em] text-[#1f2027]'>手机号</span>
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className='w-full border-0 border-b border-black/16 bg-transparent px-0 py-[11px] text-[15px] tracking-[0.01em] text-[#1f2027] outline-none transition placeholder:text-black/26 focus:border-black'
                      placeholder='请输入手机号'
                      autoComplete='username'
                    />
                  </label>

                  <label className='block'>
                    <span className='mb-2 block text-[13px] font-medium tracking-[0.01em] text-[#1f2027]'>密码</span>
                    <input
                      type='password'
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className='w-full border-0 border-b border-black/16 bg-transparent px-0 py-[11px] text-[15px] tracking-[0.01em] text-[#1f2027] outline-none transition placeholder:text-black/26 focus:border-black'
                      placeholder='请输入密码'
                      autoComplete='current-password'
                    />
                  </label>

                  <div className='flex items-center justify-between gap-3 pt-1 text-[11px] tracking-[0.01em] text-black/40'>
                    <label className='inline-flex items-center gap-2'>
                      <input
                        type='checkbox'
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                        className='h-3.5 w-3.5 rounded border-black/20 accent-[#1f2027]'
                      />
                      <span>记住我 30 天</span>
                    </label>
                    <button type='button' className='transition hover:text-black/65'>
                      忘记密码？
                    </button>
                  </div>

                  <div className='flex items-center justify-between gap-3 pt-1 text-[11px] tracking-[0.01em] text-black/40'>
                    <span>登录信息仅保存在本地浏览器</span>
                    <StatusBadge tone={authState === 'authenticated' ? 'success' : authState === 'error' ? 'danger' : authState === 'loading' ? 'warning' : 'neutral'}>
                      {authState === 'authenticated' ? '已登录' : authState === 'error' ? '失败' : authState === 'loading' ? '处理中' : '待输入'}
                    </StatusBadge>
                  </div>

                  <button
                    type='submit'
                    disabled={authState === 'loading'}
                    className='mt-4 flex h-[52px] w-full items-center justify-center rounded-full bg-[#1f2027] text-[15px] font-semibold tracking-[0.01em] text-white transition hover:opacity-92 disabled:cursor-not-allowed disabled:bg-black/20'
                  >
                    {authState === 'loading' ? '登录中...' : 'Log In'}
                  </button>
                </form>

                <div className='mt-5 rounded-full bg-[#f4f4f3] px-5 py-[15px] text-center text-[14px] font-medium tracking-[0.01em] text-black/58'>
                  使用当前界面风格重写，不复制原仓库代码
                </div>

                <div className='mt-8 rounded-[22px] bg-[#f5f5f4] px-4 py-4'>
                  <div className='flex items-center justify-between gap-3'>
                    <p className='text-[13px] font-medium tracking-[0.01em] text-[#1f2027]'>登录状态</p>
                    <StatusBadge tone={authState === 'authenticated' ? 'success' : authState === 'error' ? 'danger' : authState === 'loading' ? 'warning' : 'neutral'}>
                      {authState === 'authenticated' ? '已登录' : authState === 'error' ? '失败' : authState === 'loading' ? '处理中' : '待输入'}
                    </StatusBadge>
                  </div>
                  <p className='mt-3 text-[13px] leading-6 tracking-[0.01em] text-black/50'>{loginStatus || '等待输入'}</p>
                </div>

                <p className='mt-8 text-center text-[11px] tracking-[0.02em] text-black/38'>
                  还没有工作区账号？ <span className='font-semibold text-black/60'>先在超星完成账号准备</span>
                </p>
              </div>
            </section>
          </section>
        </div>
      </div>
    </div>
  );
};
