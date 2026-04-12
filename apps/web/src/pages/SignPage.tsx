import React, { useEffect, useState } from 'react';
import { AddressConfigPanel } from '../components/AddressConfigPanel';
import { QrImageSignCard } from '../components/QrImageSignCard';
import { SectionCard } from '../components/SectionCard';
import { SignActionPanel } from '../components/SignActionPanel';
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
      <div>
        <p className='text-sm font-medium uppercase tracking-[0.25em] text-slate-400'>Sign</p>
        <h1 className='mt-3 text-3xl font-semibold text-slate-950'>签到</h1>
        <p className='mt-3 max-w-2xl text-sm leading-6 text-slate-500'>
          当前页会完整展示所有签到方式，并将地址配置独立出来。位置相关参数可以通过手动输入、地址解析、坐标反查和地图选点来维护。
        </p>
      </div>

      <SectionCard
        title='地址配置'
        description='先搜索地址，再决定是保存为默认地址，还是直接用于当前的位置签到。'
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
