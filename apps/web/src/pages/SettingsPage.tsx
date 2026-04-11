import React, { useEffect, useState } from 'react';
import { MapPickerModal } from '../components/MapPickerModal';
import { SectionCard } from '../components/SectionCard';
import { useAppState } from '../hooks/useAppState';
import { maskPhone } from '../services/storage';

export const SettingsPage = () => {
  const { session, updateAccount, currentApiBaseUrl, signOut, clearLocalData } = useAppState();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [lon, setLon] = useState('');
  const [lat, setLat] = useState('');
  const [status, setStatus] = useState('修改后会重新登录并写入 localStorage。');
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    if (!session) return;
    setPhone(session.phone);
    setPassword(session.password);
    const preset = session.config.monitor.presetAddress[0];
    setAddress(preset?.address || '');
    setLon(preset?.lon || '');
    setLat(preset?.lat || '');
  }, [session]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('正在保存');

    const success = await updateAccount(phone.trim(), password, {
      address: address.trim(),
      lon: lon.trim(),
      lat: lat.trim(),
    });

    setStatus(success ? '保存成功，账号信息和位置参数已更新' : '保存失败，请检查账号信息');
  };

  return (
    <div className='space-y-6'>
      <div>
        <p className='text-sm font-medium uppercase tracking-[0.25em] text-slate-400'>Settings</p>
        <h1 className='mt-3 text-3xl font-semibold text-slate-950'>设置</h1>
        <p className='mt-3 max-w-2xl text-sm leading-6 text-slate-500'>这里只保留用户实际会修改的内容：账号、密码以及位置签到需要的基础地址参数。</p>
      </div>

      <SectionCard title='当前连接信息'>
        <div className='grid gap-4 lg:grid-cols-2'>
          <div className='rounded-2xl bg-slate-50 p-4'>
            <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>当前 API 地址</p>
            <p className='mt-3 break-all text-sm font-medium text-slate-800'>{currentApiBaseUrl}</p>
          </div>
          <div className='rounded-2xl bg-slate-50 p-4'>
            <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>当前保存手机号</p>
            <p className='mt-3 text-sm font-medium text-slate-800'>{maskPhone(session?.phone || '') || '未保存'}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title='账号与位置配置'>
        <form className='grid gap-5 lg:grid-cols-2' onSubmit={onSubmit}>
          <label className='block'>
            <span className='mb-2 block text-sm font-medium text-slate-700'>手机号</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900'
            />
          </label>

          <label className='block'>
            <span className='mb-2 block text-sm font-medium text-slate-700'>密码</span>
            <input
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900'
            />
          </label>

          <label className='block lg:col-span-2'>
            <span className='mb-2 block text-sm font-medium text-slate-700'>详细地址</span>
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900'
              placeholder='位置签到时使用'
            />
          </label>

          <div className='lg:col-span-2'>
            <button
              type='button'
              onClick={() => setMapOpen(true)}
              className='rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900'
            >
              地图选点
            </button>
          </div>

          <label className='block'>
            <span className='mb-2 block text-sm font-medium text-slate-700'>经度</span>
            <input
              value={lon}
              onChange={(event) => setLon(event.target.value)}
              className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900'
              placeholder='例如 113.516288'
            />
          </label>

          <label className='block'>
            <span className='mb-2 block text-sm font-medium text-slate-700'>纬度</span>
            <input
              value={lat}
              onChange={(event) => setLat(event.target.value)}
              className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900'
              placeholder='例如 34.817038'
            />
          </label>

          <div className='lg:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm text-slate-500'>{status}</p>
            <button type='submit' className='rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800'>
              保存设置
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title='本地数据'>
        <div className='flex flex-col gap-4 sm:flex-row'>
          <button
            type='button'
            onClick={signOut}
            className='rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900'
          >
            退出登录
          </button>
          <button
            type='button'
            onClick={clearLocalData}
            className='rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700'
          >
            清空本地登录信息
          </button>
        </div>
      </SectionCard>

      <MapPickerModal
        open={mapOpen}
        initialValue={{ address, lon, lat }}
        onClose={() => setMapOpen(false)}
        onSelect={(value) => {
          setAddress(value.address);
          setLon(value.lon);
          setLat(value.lat);
        }}
      />
    </div>
  );
};
