import React, { useEffect, useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import { signTypeLabel } from '../services/api';
import { MapPickerModal } from './MapPickerModal';
import { StatusBadge } from './StatusBadge';

const fieldClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900';

export const SignActionPanel = () => {
  const { activity, activityState, session, executeSignAction, signPending } = useAppState();
  const preset = session?.config.monitor.presetAddress?.[0];
  const [mode, setMode] = useState<'general' | 'photo'>('general');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [qrEnc, setQrEnc] = useState('');
  const [qrImage, setQrImage] = useState<File | null>(null);
  const [address, setAddress] = useState(preset?.address || '');
  const [lon, setLon] = useState(preset?.lon || '');
  const [lat, setLat] = useState(preset?.lat || '');
  const [altitude, setAltitude] = useState('100');
  const [helperText, setHelperText] = useState('按当前签到类型填写必要信息。');
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    setAddress(preset?.address || '');
    setLon(preset?.lon || '');
    setLat(preset?.lat || '');
  }, [preset?.address, preset?.lon, preset?.lat]);

  useEffect(() => {
    setPhotoFile(null);
    setQrEnc('');
    setQrImage(null);
    setMode('general');

    if (!activity) {
      setHelperText('按当前签到类型填写必要信息。');
      return;
    }

    switch (activity.otherId) {
      case 2:
        setHelperText('二维码签到支持直接粘贴 enc，也支持上传二维码图片自动解析。');
        break;
      case 4:
        setHelperText('位置签到将使用这里填写的经纬度和详细地址。');
        break;
      case 0:
        setHelperText('普通 / 拍照签到都在这里处理，可手动切换模式。');
        break;
      default:
        setHelperText('当前类型无需额外参数，可直接提交。');
        break;
    }
  }, [activity?.activeId, activity?.otherId]);

  const hasTask = activityState === 'ready' && !!activity?.activeId;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasTask) return;

    await executeSignAction({
      mode,
      photoFile,
      qrEnc,
      qrImage,
      altitude,
      address: {
        address: address.trim(),
        lon: lon.trim(),
        lat: lat.trim(),
      },
    });
  };

  return (
    <>
      <form className='space-y-5' onSubmit={onSubmit}>
        <div className='flex flex-wrap items-center gap-3'>
          <StatusBadge tone={hasTask ? 'success' : 'neutral'}>{hasTask ? '待处理' : '空闲'}</StatusBadge>
          {activity?.otherId !== undefined ? <StatusBadge>{signTypeLabel(activity.otherId)}</StatusBadge> : null}
        </div>

        <div>
          <h2 className='text-2xl font-semibold text-slate-950'>{activity?.name || '当前没有待签到任务'}</h2>
          <p className='mt-2 text-sm leading-6 text-slate-500'>{helperText}</p>
        </div>

      {activity?.otherId === 0 ? (
        <div className='flex flex-wrap gap-3'>
          <button
            type='button'
            onClick={() => setMode('general')}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              mode === 'general' ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700'
            }`}
          >
            普通签到
          </button>
          <button
            type='button'
            onClick={() => setMode('photo')}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              mode === 'photo' ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700'
            }`}
          >
            拍照签到
          </button>
        </div>
      ) : null}

      {(activity?.otherId === 0 && mode === 'photo') ? (
        <label className='block'>
          <span className='mb-2 block text-sm font-medium text-slate-700'>签到图片</span>
          <input
            type='file'
            accept='image/*'
            onChange={(event) => setPhotoFile(event.target.files?.[0] || null)}
            className={fieldClassName}
          />
        </label>
      ) : null}

        {activity?.otherId === 2 ? (
        <div className='grid gap-4 lg:grid-cols-2'>
          <label className='block lg:col-span-2'>
            <span className='mb-2 block text-sm font-medium text-slate-700'>二维码图片</span>
            <input
              type='file'
              accept='image/*'
              onChange={(event) => setQrImage(event.target.files?.[0] || null)}
              className={fieldClassName}
            />
          </label>

          <label className='block lg:col-span-2'>
            <span className='mb-2 block text-sm font-medium text-slate-700'>enc 参数</span>
            <input
              value={qrEnc}
              onChange={(event) => setQrEnc(event.target.value)}
              className={fieldClassName}
              placeholder='支持手动粘贴，或上传二维码图片自动解析'
            />
          </label>

          <label className='block'>
            <span className='mb-2 block text-sm font-medium text-slate-700'>经度</span>
            <input value={lon} onChange={(event) => setLon(event.target.value)} className={fieldClassName} />
          </label>

          <label className='block'>
            <span className='mb-2 block text-sm font-medium text-slate-700'>纬度</span>
            <input value={lat} onChange={(event) => setLat(event.target.value)} className={fieldClassName} />
          </label>

          <label className='block lg:col-span-2'>
            <span className='mb-2 block text-sm font-medium text-slate-700'>详细地址</span>
            <input value={address} onChange={(event) => setAddress(event.target.value)} className={fieldClassName} />
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

          <label className='block lg:col-span-2'>
            <span className='mb-2 block text-sm font-medium text-slate-700'>海拔</span>
            <input value={altitude} onChange={(event) => setAltitude(event.target.value)} className={fieldClassName} />
          </label>
        </div>
      ) : null}

        {activity?.otherId === 4 ? (
        <div className='grid gap-4 lg:grid-cols-2'>
          <label className='block'>
            <span className='mb-2 block text-sm font-medium text-slate-700'>经度</span>
            <input value={lon} onChange={(event) => setLon(event.target.value)} className={fieldClassName} />
          </label>

          <label className='block'>
            <span className='mb-2 block text-sm font-medium text-slate-700'>纬度</span>
            <input value={lat} onChange={(event) => setLat(event.target.value)} className={fieldClassName} />
          </label>

          <label className='block lg:col-span-2'>
            <span className='mb-2 block text-sm font-medium text-slate-700'>详细地址</span>
            <input value={address} onChange={(event) => setAddress(event.target.value)} className={fieldClassName} />
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
        </div>
      ) : null}

        <button
          type='submit'
          disabled={!hasTask || signPending}
          className='h-14 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
        >
          {signPending ? '处理中...' : '立即签到'}
        </button>
      </form>

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
    </>
  );
};
