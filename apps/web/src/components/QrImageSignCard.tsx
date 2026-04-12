import React, { useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import { StatusBadge } from './StatusBadge';

const fieldClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900';

export const QrImageSignCard = ({
  address,
}: {
  address: AddressItem;
}) => {
  const { signPending, signQrImage, lastQrSignStatus } = useAppState();
  const [qrImage, setQrImage] = useState<File | null>(null);
  const [altitude, setAltitude] = useState('100');

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!qrImage) return;

    await signQrImage({
      qrImage,
      altitude,
      address,
    });
  };

  return (
    <form className='space-y-5' onSubmit={onSubmit}>
      <div className='flex flex-wrap items-center gap-3'>
        <StatusBadge tone='neutral'>二维码图片签到</StatusBadge>
        <StatusBadge tone={lastQrSignStatus === '签到成功' ? 'success' : 'warning'}>
          {lastQrSignStatus ? '最近结果' : '等待识别'}
        </StatusBadge>
      </div>

      <div>
        <h2 className='text-2xl font-semibold text-slate-950'>上传二维码图片直接签到</h2>
        <p className='mt-2 text-sm leading-6 text-slate-500'>
          这个入口不依赖当前检测到的活动，但会复用上方统一配置的地址和坐标。
        </p>
      </div>

      <label className='block'>
        <span className='mb-2 block text-sm font-medium text-slate-700'>二维码图片</span>
        <input
          type='file'
          accept='image/*'
          onChange={(event) => setQrImage(event.target.files?.[0] || null)}
          className={fieldClassName}
        />
      </label>

      <label className='block'>
        <span className='mb-2 block text-sm font-medium text-slate-700'>海拔</span>
        <input value={altitude} onChange={(event) => setAltitude(event.target.value)} className={fieldClassName} />
      </label>

      <div className='rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600'>
        当前地址：{address.address || '未填写'} ｜ 经度：{address.lon || '未填写'} ｜ 纬度：{address.lat || '未填写'}
      </div>

      {lastQrSignStatus ? <div className='rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700'>结果：{lastQrSignStatus}</div> : null}

      <button
        type='submit'
        disabled={!qrImage || !address.address || !address.lon || !address.lat || signPending}
        className='h-14 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
      >
        {signPending ? '识别并签到中...' : '识别二维码并签到'}
      </button>
    </form>
  );
};
