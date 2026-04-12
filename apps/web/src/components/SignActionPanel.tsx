import React, { useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import { signTypeLabel } from '../services/api';
import { StatusBadge } from './StatusBadge';

const fieldClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900';

type SignMethodCard = {
  id: string;
  title: string;
  description: string;
  matches: boolean;
  renderBody: () => React.ReactNode;
};

export const SignActionPanel = ({
  address,
}: {
  address: AddressItem;
}) => {
  const { activity, activityState, executeSignAction, signPending, lastSignStatus } = useAppState();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [qrEnc, setQrEnc] = useState('');
  const [qrImage, setQrImage] = useState<File | null>(null);
  const [signCode, setSignCode] = useState('');
  const [altitude, setAltitude] = useState('100');

  const hasTask = activityState === 'ready' && !!activity?.activeId;

  const submit = async (payload: SignActionPayload) => {
    if (!hasTask) return;
    await executeSignAction({
      ...payload,
      altitude,
      address,
    });
  };

  const currentType = activity?.otherId;
  const cards: SignMethodCard[] = [
      {
        id: 'general',
        title: '普通签到',
        description: '适用于普通签到活动，也可作为拍照签到前的快速判断入口。',
        matches: currentType === 0,
        renderBody: () => (
          <button
            type='button'
            onClick={() => void submit({ mode: 'general' })}
            disabled={!hasTask || currentType !== 0 || signPending}
            className='h-12 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
          >
            {signPending && currentType === 0 ? '处理中...' : '提交普通签到'}
          </button>
        ),
      },
      {
        id: 'photo',
        title: '拍照签到',
        description: '上传签到图片后走拍照签到流程，和普通签到并列展示。',
        matches: currentType === 0,
        renderBody: () => (
          <div className='space-y-4'>
            <label className='block'>
              <span className='mb-2 block text-sm font-medium text-slate-700'>签到图片</span>
              <input
                type='file'
                accept='image/*'
                onChange={(event) => setPhotoFile(event.target.files?.[0] || null)}
                className={fieldClassName}
              />
            </label>
            <button
              type='button'
              onClick={() => void submit({ mode: 'photo', photoFile })}
              disabled={!hasTask || currentType !== 0 || !photoFile || signPending}
              className='h-12 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
            >
              {signPending && currentType === 0 ? '处理中...' : '提交拍照签到'}
            </button>
          </div>
        ),
      },
      {
        id: 'gesture',
        title: '手势签到',
        description: '后端直接走通用签到接口，界面单独保留一个入口，避免看不到这种方式。',
        matches: currentType === 3,
        renderBody: () => (
          <button
            type='button'
            onClick={() => void submit({})}
            disabled={!hasTask || currentType !== 3 || signPending}
            className='h-12 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
          >
            {signPending && currentType === 3 ? '处理中...' : '提交手势签到'}
          </button>
        ),
      },
      {
        id: 'location',
        title: '位置签到',
        description: '使用上方地址配置中的坐标和详细地址提交。',
        matches: currentType === 4,
        renderBody: () => (
          <div className='space-y-4'>
            <div className='rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600'>
              当前地址：{address.address || '未填写'} ｜ 经度：{address.lon || '未填写'} ｜ 纬度：{address.lat || '未填写'}
            </div>
            <button
              type='button'
              onClick={() => void submit({})}
              disabled={!hasTask || currentType !== 4 || !address.address || !address.lon || !address.lat || signPending}
              className='h-12 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
            >
              {signPending && currentType === 4 ? '处理中...' : '使用当前地址签到'}
            </button>
          </div>
        ),
      },
      {
        id: 'qrcode',
        title: '二维码签到',
        description: '支持上传二维码图片自动解析 enc，也支持手动粘贴 enc；位置参数同样复用地址配置。',
        matches: currentType === 2,
        renderBody: () => (
          <div className='space-y-4'>
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
              <span className='mb-2 block text-sm font-medium text-slate-700'>enc 参数</span>
              <input
                value={qrEnc}
                onChange={(event) => setQrEnc(event.target.value)}
                className={fieldClassName}
                placeholder='可留空，上传二维码图片后自动识别'
              />
            </label>

            <label className='block'>
              <span className='mb-2 block text-sm font-medium text-slate-700'>海拔</span>
              <input value={altitude} onChange={(event) => setAltitude(event.target.value)} className={fieldClassName} />
            </label>

            <button
              type='button'
              onClick={() => void submit({ qrEnc, qrImage })}
              disabled={!hasTask || currentType !== 2 || (!qrEnc.trim() && !qrImage) || !address.address || !address.lon || !address.lat || signPending}
              className='h-12 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
            >
              {signPending && currentType === 2 ? '处理中...' : '提交二维码签到'}
            </button>
          </div>
        ),
      },
      {
        id: 'code',
        title: '签到码签到',
        description: '输入老师发布的签到码后直接提交。',
        matches: currentType === 5,
        renderBody: () => (
          <div className='space-y-4'>
            <label className='block'>
              <span className='mb-2 block text-sm font-medium text-slate-700'>签到码</span>
              <input
                value={signCode}
                onChange={(event) => setSignCode(event.target.value)}
                className={fieldClassName}
                placeholder='输入签到码'
              />
            </label>
            <button
              type='button'
              onClick={() => void submit({ signCode })}
              disabled={!hasTask || currentType !== 5 || !signCode.trim() || signPending}
              className='h-12 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
            >
              {signPending && currentType === 5 ? '处理中...' : '提交签到码签到'}
            </button>
          </div>
        ),
      },
    ];

  return (
    <div className='space-y-5'>
      <div className='flex flex-wrap items-center gap-3'>
        <StatusBadge tone={hasTask ? 'success' : 'neutral'}>{hasTask ? '检测到待签到任务' : '当前无活动'}</StatusBadge>
        {activity?.otherId !== undefined ? <StatusBadge>{signTypeLabel(activity.otherId)}</StatusBadge> : null}
      </div>

      <div>
        <h2 className='text-2xl font-semibold text-slate-950'>{activity?.name || '当前没有待签到任务'}</h2>
        <p className='mt-2 text-sm leading-6 text-slate-500'>
          所有签到方式都固定展示在这里。当前活动对应的方式会高亮可用，其余方式保留为可见但不可提交状态。
        </p>
      </div>

      <div className='grid gap-4 xl:grid-cols-2'>
        {cards.map((card) => {
          const disabled = !hasTask || !card.matches;

          return (
            <section
              key={card.id}
              className={`rounded-3xl border p-5 transition ${
                card.matches ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className='flex flex-wrap items-center gap-3'>
                <StatusBadge tone={card.matches ? 'success' : 'neutral'}>{card.title}</StatusBadge>
                <StatusBadge tone={disabled ? 'warning' : 'success'}>
                  {disabled ? (hasTask ? `当前活动不是${card.title}` : '等待活动') : '可提交'}
                </StatusBadge>
              </div>

              <p className='mt-4 text-sm leading-6 text-slate-500'>{card.description}</p>
              <div className='mt-5'>{card.renderBody()}</div>
            </section>
          );
        })}
      </div>

      {lastSignStatus ? <div className='rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700'>最近结果：{lastSignStatus}</div> : null}
    </div>
  );
};
