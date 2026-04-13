import React, { useEffect, useState } from 'react';
import { AddressConfigPanel } from '../components/AddressConfigPanel';
import { EmptyState } from '../components/EmptyState';
import { QrImageSignCard } from '../components/QrImageSignCard';
import { SectionHeader } from '../components/SectionHeader';
import { SectionCard } from '../components/SectionCard';
import { SignActionPanel } from '../components/SignActionPanel';
import { StatusBadge } from '../components/StatusBadge';
import { useAppState } from '../hooks/useAppState';

export const SignPage = () => {
  const { activity, activityState, session, updatePresetAddress, executeSignAction, signPending } = useAppState();
  const hasTask = activityState === 'ready' && !!activity?.activeId;
  const preset = session?.config.monitor.presetAddress?.[0];
  const [address, setAddress] = useState<AddressItem>({
    address: '',
    lon: '',
    lat: '',
  });
  const [saveStatus, setSaveStatus] = useState('当前地址配置会被位置签到、二维码签到和二维码图片签到共用。');
  const [useStatus, setUseStatus] = useState('位置签到时，优先在这里完成地址搜索并直接提交。');

  useEffect(() => {
    setAddress({
      address: preset?.address || '',
      lon: preset?.lon || '',
      lat: preset?.lat || '',
    });
  }, [preset?.address, preset?.lon, preset?.lat]);

  const saveAddress = async () => {
    updatePresetAddress(address);
    setSaveStatus('默认地址已保存到当前账号');
  };

  const useForLocationSign = async () => {
    if (activity?.otherId !== 4) {
      setUseStatus(hasTask ? '当前任务不是位置签到，请在下方选择对应签到方式。' : '当前没有可用的位置签到任务。');
      return;
    }

    await executeSignAction({
      address,
    });
    setUseStatus('已提交位置签到请求，请查看下方最近结果。');
  };

  return (
    <div className='space-y-6'>
      <SectionHeader
        eyebrow='Sign'
        title='签到工作区'
        description='把所有签到方式、位置参数和二维码入口集中成一个稳定工作台。这里强调当前任务、地址上下文和最近结果。'
      />

      <section className='grid gap-4 xl:grid-cols-[1.1fr_0.9fr]'>
        <div className='shadow-panel overflow-hidden rounded-[34px] border border-[color:var(--cx-border)] bg-[color:var(--cx-panel-strong)]'>
          <div className='grid h-full gap-0 lg:grid-cols-[1.1fr_0.9fr]'>
            <div className='p-7 sm:p-8'>
              <p className='cx-pretitle'>Current Mission</p>
              <h2 className='font-display mt-4 text-4xl font-semibold leading-[0.95] text-[color:var(--cx-text)]'>
                {hasTask ? activity?.name || '检测到签到活动' : '当前没有待签到活动'}
              </h2>
              <p className='mt-4 text-sm leading-7 text-[color:var(--cx-text-muted)]'>
                {hasTask
                  ? '当前活动已经准备好，可以直接在下方选择对应方式提交。位置相关方式会优先读取这里保存的默认地址。'
                  : '当前没有任务时，页面仍保留完整操作面板，便于你提前配置地址或直接走二维码图片签到。'}
              </p>
              <div className='mt-6 flex flex-wrap gap-3'>
                <StatusBadge tone={hasTask ? 'success' : 'neutral'}>{hasTask ? '任务已就绪' : '等待任务'}</StatusBadge>
                {activity?.otherId !== undefined ? <StatusBadge>{`类型 ${activity.otherId}`}</StatusBadge> : null}
              </div>
            </div>
            <div className='bg-[color:var(--cx-dark)] p-7 text-white sm:p-8'>
              <p className='cx-pretitle text-stone-500'>Preset Address</p>
              <div className='mt-5 space-y-4'>
                <div className='rounded-[24px] bg-white/6 p-4'>
                  <p className='text-sm text-stone-400'>默认地址</p>
                  <p className='mt-2 text-sm leading-6 text-stone-100'>{address.address || '尚未配置'}</p>
                </div>
                <div className='rounded-[24px] bg-emerald-200/10 p-4'>
                  <p className='text-sm text-emerald-100/80'>当前位置参数</p>
                  <p className='mt-2 text-sm leading-6 text-emerald-50'>
                    经度 {address.lon || '--'} ｜ 纬度 {address.lat || '--'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!hasTask ? (
          <EmptyState title='当前没有活动' description='可以先维护地址配置，或者直接使用二维码图片签到入口，任务出现后无需重新整理参数。' />
        ) : null}
      </section>

      <SectionCard
        title='地址配置'
        description='先搜索地址，再决定是保存为默认地址，还是直接用于当前的位置签到。这里是整个签到页的共享上下文。'
      >
        <AddressConfigPanel
          value={address}
          onChange={setAddress}
          onSave={saveAddress}
          saveStatus={saveStatus}
          onUseForSign={useForLocationSign}
          useStatus={useStatus}
          useDisabled={signPending || activity?.otherId !== 4}
        />
      </SectionCard>

      <SectionCard
        title='所有签到方式'
        description={hasTask ? '检测到可签到活动，可直接从下方对应方式提交。' : '当前没有检测到可签到活动，下方签到方式会保留展示，二维码图片签到仍可独立使用。'}
      >
        <SignActionPanel address={address} />
      </SectionCard>

      <SectionCard title='二维码图片签到' description='上传二维码图片后直接识别并签到，同样复用上面的地址配置。'>
        <QrImageSignCard address={address} />
      </SectionCard>
    </div>
  );
};
