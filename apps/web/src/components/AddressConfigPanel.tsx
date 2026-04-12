import React, { useState } from 'react';
import { api, hasAmapKey } from '../services/api';
import { LocationPreviewMap } from './LocationPreviewMap';
import { StatusBadge } from './StatusBadge';

const fieldClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900';

export const AddressConfigPanel = ({
  value,
  onChange,
  onSave,
  saveStatus,
}: {
  value: AddressItem;
  onChange: (next: AddressItem) => void;
  onSave?: () => Promise<void> | void;
  saveStatus?: string;
}) => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState<'geocode' | 'reverse' | 'save' | ''>('');

  const update = (patch: Partial<AddressItem>) => {
    onChange({
      ...value,
      ...patch,
    });
  };

  const resolveAddress = async () => {
    try {
      setLoading('geocode');
      setStatus('正在解析地址');
      const result = await api.geocodeAddress(value.address);
      onChange({
        address: result.formattedAddress,
        lon: result.lon,
        lat: result.lat,
      });
      setStatus('地址解析完成');
    } catch (error) {
      if (error instanceof Error && error.message === 'missing-amap-key') {
        setStatus('未配置高德 Key，无法自动解析地址');
      } else if (error instanceof Error && error.message === 'empty-address') {
        setStatus('请先输入地址');
      } else {
        setStatus('地址解析失败，请调整关键词或手动填写');
      }
    } finally {
      setLoading('');
    }
  };

  const reverseLookup = async () => {
    try {
      setLoading('reverse');
      setStatus('正在根据经纬度反查地址');
      const result = await api.reverseGeocode(value.lon, value.lat);
      onChange({
        address: result.formattedAddress,
        lon: result.lon,
        lat: result.lat,
      });
      setStatus('地址反查完成');
    } catch (error) {
      if (error instanceof Error && error.message === 'missing-amap-key') {
        setStatus('未配置高德 Key，无法自动反查地址');
      } else if (error instanceof Error && error.message === 'empty-location') {
        setStatus('请先填写经纬度');
      } else {
        setStatus('地址反查失败，请检查坐标是否有效');
      }
    } finally {
      setLoading('');
    }
  };

  const save = async () => {
    if (!onSave) return;
    try {
      setLoading('save');
      await onSave();
    } finally {
      setLoading('');
    }
  };

  return (
    <div className='space-y-5'>
      <div className='flex flex-wrap items-center gap-3'>
        <StatusBadge tone='neutral'>手动输入</StatusBadge>
        <StatusBadge tone='neutral'>地址解析</StatusBadge>
        <StatusBadge tone='neutral'>坐标反查</StatusBadge>
        <StatusBadge tone={hasAmapKey() ? 'success' : 'warning'}>{hasAmapKey() ? '地图选点可用' : '地图功能未配置'}</StatusBadge>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <label className='block lg:col-span-2'>
          <span className='mb-2 block text-sm font-medium text-slate-700'>详细地址</span>
          <input
            value={value.address}
            onChange={(event) => update({ address: event.target.value })}
            className={fieldClassName}
            placeholder='可输入教学楼、宿舍、校区等关键词'
          />
        </label>

        <label className='block'>
          <span className='mb-2 block text-sm font-medium text-slate-700'>经度</span>
          <input
            value={value.lon}
            onChange={(event) => update({ lon: event.target.value })}
            className={fieldClassName}
            placeholder='例如 113.516288'
          />
        </label>

        <label className='block'>
          <span className='mb-2 block text-sm font-medium text-slate-700'>纬度</span>
          <input
            value={value.lat}
            onChange={(event) => update({ lat: event.target.value })}
            className={fieldClassName}
            placeholder='例如 34.817038'
          />
        </label>

        <div className='lg:col-span-2 flex flex-wrap gap-3'>
          <button
            type='button'
            onClick={resolveAddress}
            disabled={loading !== ''}
            className='rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {loading === 'geocode' ? '解析中...' : '地址解析坐标'}
          </button>
          <button
            type='button'
            onClick={reverseLookup}
            disabled={loading !== ''}
            className='rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {loading === 'reverse' ? '反查中...' : '坐标反查地址'}
          </button>
          <button
            type='button'
            onClick={() => onChange({ address: '', lon: '', lat: '' })}
            disabled={loading !== ''}
            className='rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-900 disabled:cursor-not-allowed disabled:opacity-60'
          >
            清空
          </button>
          {onSave ? (
            <button
              type='button'
              onClick={() => void save()}
              disabled={loading !== ''}
              className='rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
            >
              {loading === 'save' ? '保存中...' : '保存为默认地址'}
            </button>
          ) : null}
        </div>

        <div className='lg:col-span-2'>
          <LocationPreviewMap
            lon={value.lon}
            lat={value.lat}
            address={value.address}
            interactive
            onSelect={(next) => {
              onChange(next);
            }}
          />
        </div>
      </div>

      <p className='text-sm text-slate-500'>{status || saveStatus || '位置签到、二维码签到、二维码图片签到都会复用这里的地址配置。'}</p>
    </div>
  );
};
