import React, { useEffect, useState } from 'react';
import { AddressConfigPanel } from '../components/AddressConfigPanel';
import { EmptyState } from '../components/EmptyState';
import { SectionHeader } from '../components/SectionHeader';
import { SectionCard } from '../components/SectionCard';
import { useAppState } from '../hooks/useAppState';
import { isAmapConfigured } from '../services/amap';
import { maskPhone } from '../services/storage';

export const SettingsPage = () => {
  const { session, accounts, updateAccount, currentApiBaseUrl, signOut, clearLocalData, switchAccount, removeSavedAccount } = useAppState();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [lon, setLon] = useState('');
  const [lat, setLat] = useState('');
  const [status, setStatus] = useState('修改后会重新登录并写入 localStorage。');

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
      <SectionHeader
        eyebrow='Settings'
        title='配置中心'
        description='账号、连接地址、地图能力和本地数据都集中在这里管理。布局按成熟 SaaS 的配置分组方式重写。'
      />

      <SectionCard title='当前连接信息'>
        <div className='grid gap-4 lg:grid-cols-2'>
          <div className='cx-muted-block'>
            <p className='cx-pretitle'>当前 API 地址</p>
            <p className='mt-3 break-all text-sm font-medium text-[color:var(--cx-text)]'>{currentApiBaseUrl}</p>
          </div>
          <div className='cx-muted-block'>
            <p className='cx-pretitle'>当前保存手机号</p>
            <p className='mt-3 text-sm font-medium text-[color:var(--cx-text)]'>{maskPhone(session?.phone || '') || '未保存'}</p>
          </div>
          <div className='cx-muted-block lg:col-span-2'>
            <p className='cx-pretitle'>地图预览配置</p>
            <p className='mt-3 text-sm font-medium text-[color:var(--cx-text)]'>{isAmapConfigured() ? '已配置高德 JS API Key，可显示地图预览' : '未配置高德 JS API Key，仅保留经纬度输入'}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title='已保存账号' description='登录过的账号会保存在本地浏览器中，可以直接切换或删除。'>
        {accounts.length === 0 ? (
          <EmptyState title='还没有账号记录' description='完成一次登录后，这里会出现可切换账号列表。' />
        ) : (
          <div className='grid gap-4'>
            {accounts.map((account) => {
              const active = session?.phone === account.phone;
              return (
                <div key={account.phone} className='flex flex-col gap-4 rounded-[24px] border border-[color:var(--cx-border)] bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <p className='text-sm font-semibold text-[color:var(--cx-text)]'>{maskPhone(account.phone)}</p>
                    <p className='mt-1 text-xs text-[color:var(--cx-text-muted)]'>最近更新时间：{new Date(account.date).toLocaleString()}</p>
                  </div>
                  <div className='flex flex-wrap gap-3'>
                    <button
                      type='button'
                      onClick={() => void switchAccount(account.phone)}
                      disabled={active}
                      className='cx-btn-secondary px-4 py-2'
                    >
                      {active ? '当前账号' : '切换'}
                    </button>
                    <button
                      type='button'
                      onClick={() => removeSavedAccount(account.phone)}
                      className='cx-btn-danger px-4 py-2'
                    >
                      删除
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title='账号与位置配置'>
        <form className='grid gap-5 lg:grid-cols-2' onSubmit={onSubmit}>
          <label className='block'>
            <span className='mb-2 block text-sm font-medium text-slate-700'>手机号</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className='cx-input'
            />
          </label>

          <label className='block'>
            <span className='mb-2 block text-sm font-medium text-slate-700'>密码</span>
            <input
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className='cx-input'
            />
          </label>

          <div className='lg:col-span-2'>
            <AddressConfigPanel
              value={{ address, lon, lat }}
              onChange={(next) => {
                setAddress(next.address);
                setLon(next.lon);
                setLat(next.lat);
              }}
              saveStatus='这里修改的是账号默认地址，保存时会重新登录并更新本地存储。'
            />
          </div>

          <div className='lg:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm leading-6 text-[color:var(--cx-text-muted)]'>{status}</p>
            <button type='submit' className='cx-btn-primary'>
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
            className='cx-btn-secondary'
          >
            退出登录
          </button>
          <button
            type='button'
            onClick={clearLocalData}
            className='cx-btn-danger'
          >
            清空本地登录信息
          </button>
        </div>
      </SectionCard>
    </div>
  );
};
