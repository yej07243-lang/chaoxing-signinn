import React, { useEffect, useState } from 'react';
import { AddressConfigPanel } from '../components/AddressConfigPanel';
import { QrImageSignCard } from '../components/QrImageSignCard';
import { SectionCard } from '../components/SectionCard';
import { SignActionPanel } from '../components/SignActionPanel';
import { useAppState } from '../hooks/useAppState';

export const SignPage = () => {
  const { activity, activityState, session, updatePresetAddress } = useAppState();
  const hasTask = activityState === 'ready' && !!activity?.activeId;
  const preset = session?.config.monitor.presetAddress?.[0];
  const [address, setAddress] = useState<AddressItem>({
    address: '',
    lon: '',
    lat: '',
  });
  const [saveStatus, setSaveStatus] = useState('当前地址配置会被位置签到、二维码签到和二维码图片签到共用。');

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

  return (
    <div className='space-y-6'>
      <div>
        <p className='text-sm font-medium uppercase tracking-[0.25em] text-slate-400'>Sign</p>
        <h1 className='mt-3 text-3xl font-semibold text-slate-950'>签到</h1>
        <p className='mt-3 max-w-2xl text-sm leading-6 text-slate-500'>
          当前页会完整展示所有签到方式，并将地址配置独立出来。位置相关参数可以通过手动输入、地址解析、坐标反查和地图选点来维护。
        </p>
      </div>

      <SectionCard
        title='地址配置'
        description='这一栏单独负责维护签到地址。保存后会写回当前账号的默认地址配置。'
      >
        <AddressConfigPanel value={address} onChange={setAddress} onSave={saveAddress} saveStatus={saveStatus} />
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
