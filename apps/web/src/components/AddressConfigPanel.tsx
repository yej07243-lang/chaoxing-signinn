import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { isAmapConfigured } from '../services/amap';
import { LocationPreviewMap } from './LocationPreviewMap';

const fieldClassName = 'cx-input';

type NoticeTone = 'idle' | 'success' | 'warning' | 'danger';
type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

const noticeClassName: Record<NoticeTone, string> = {
  idle: 'border-[color:var(--cx-border)] bg-white/65 text-[color:var(--cx-text-muted)]',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-rose-200 bg-rose-50 text-rose-700',
};

const parseErrorMessage = (error: unknown, mode: 'search' | 'reverse') => {
  if (!(error instanceof Error)) {
    return mode === 'search' ? '地址解析失败，请稍后重试。' : '地址反查失败，请稍后重试。';
  }

  switch (error.message) {
    case 'missing-amap-key':
      return '服务器未配置高德地图 Key，暂时无法自动解析地址。';
    case 'empty-address':
      return '请输入地址或地点名称后再搜索。';
    case 'empty-location':
      return '请先填写经度和纬度。';
    case 'geocode-not-found':
      return '没有找到匹配的地址，请换一个更具体的地点名称。';
    case 'geocode-invalid-location':
      return '地址解析到了结果，但坐标数据无效，请换一个地址重试。';
    case 'reverse-geocode-not-found':
      return '无法根据当前经纬度反查地址，请检查坐标是否正确。';
    default:
      if (error.message.startsWith('amap-request-failed:')) {
        return '地址服务请求失败，请稍后重试。';
      }
      return mode === 'search' ? '地址解析失败，请换一个关键词再试。' : '地址反查失败，请检查坐标后再试。';
  }
};

export const AddressConfigPanel = ({
  value,
  onChange,
  onSave,
  saveStatus,
  onUseForSign,
  useStatus,
  useDisabled,
  useButtonLabel = '用该位置签到',
}: {
  value: AddressItem;
  onChange: (next: AddressItem) => void;
  onSave?: () => Promise<void> | void;
  saveStatus?: string;
  onUseForSign?: () => Promise<void> | void;
  useStatus?: string;
  useDisabled?: boolean;
  useButtonLabel?: string;
}) => {
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const [notice, setNotice] = useState<{ tone: NoticeTone; text: string }>({
    tone: 'idle',
    text: '输入地址后直接搜索，成功后会自动填充经纬度。',
  });
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'save' | 'use' | ''>('');
  const [autoSearchSeed, setAutoSearchSeed] = useState(0);
  const [lastResolvedKeyword, setLastResolvedKeyword] = useState('');

  const canSearch = value.address.trim().length > 0;
  const hasResolvedLocation = Boolean(value.address.trim() && value.lon.trim() && value.lat.trim());
  const mapEnabled = advancedOpen && mapOpen && isAmapConfigured();

  useEffect(() => {
    if (!autoSearchSeed) return;

    const keyword = value.address.trim();
    if (!keyword || keyword === lastResolvedKeyword) return;

    const timer = window.setTimeout(() => {
      void resolveAddress('auto');
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, [autoSearchSeed, lastResolvedKeyword, value.address]);

  const resultStatusText = useMemo(() => {
    switch (searchStatus) {
      case 'loading':
        return '正在解析地址';
      case 'success':
        return '地址解析完成';
      case 'error':
        return '地址解析失败';
      default:
        return hasResolvedLocation ? '已就绪，可直接保存或用于位置签到' : '等待搜索';
    }
  }, [hasResolvedLocation, searchStatus]);

  const updateValue = (patch: Partial<AddressItem>) => {
    onChange({
      ...value,
      ...patch,
    });
  };

  const resolveAddress = async (source: 'button' | 'enter' | 'auto') => {
    const keyword = value.address.trim();
    if (!keyword) {
      setSearchStatus('error');
      setNotice({
        tone: 'danger',
        text: '请输入地址或地点名称后再搜索。',
      });
      return;
    }

    if (source !== 'auto' || keyword !== lastResolvedKeyword) {
      setSearchStatus('loading');
      setNotice({
        tone: 'idle',
        text: source === 'auto' ? '正在自动解析地址…' : '正在搜索地址…',
      });
    }

    try {
      const result = await api.geocodeAddress(keyword);
      onChange({
        address: result.formattedAddress,
        lon: result.lon,
        lat: result.lat,
      });
      setLastResolvedKeyword(result.formattedAddress);
      setSearchStatus('success');
      setNotice({
        tone: 'success',
        text: '地址已解析成功，当前位置可以直接保存或用于位置签到。',
      });
    } catch (error) {
      setSearchStatus('error');
      setNotice({
        tone: 'danger',
        text: parseErrorMessage(error, 'search'),
      });
    }
  };

  const reverseLookup = async () => {
    setSearchStatus('loading');
    setNotice({
      tone: 'idle',
      text: '正在根据经纬度反查地址…',
    });

    try {
      const result = await api.reverseGeocode(value.lon, value.lat);
      onChange({
        address: result.formattedAddress,
        lon: result.lon,
        lat: result.lat,
      });
      setLastResolvedKeyword(result.formattedAddress);
      setSearchStatus('success');
      setNotice({
        tone: 'success',
        text: '已根据经纬度反查出地址。',
      });
    } catch (error) {
      setSearchStatus('error');
      setNotice({
        tone: 'danger',
        text: parseErrorMessage(error, 'reverse'),
      });
    }
  };

  const runSave = async () => {
    if (!onSave) return;
    try {
      setLoadingAction('save');
      await onSave();
      setNotice({
        tone: 'success',
        text: saveStatus || '默认地址已保存。',
      });
    } finally {
      setLoadingAction('');
    }
  };

  const runUse = async () => {
    if (!onUseForSign) return;
    try {
      setLoadingAction('use');
      await onUseForSign();
    } finally {
      setLoadingAction('');
    }
  };

  return (
    <div className='space-y-6'>
      <section className='space-y-4'>
        <div>
          <h3 className='font-display text-2xl font-semibold text-[color:var(--cx-text)]'>地址输入</h3>
          <p className='mt-1 text-sm leading-6 text-[color:var(--cx-text-muted)]'>输入地址或地点名称，系统会自动尝试解析，也可以手动点击搜索。</p>
        </div>

        <div className='flex flex-col gap-3 sm:flex-row'>
          <input
            value={value.address}
            onChange={(event) => {
              updateValue({ address: event.target.value });
              setAutoSearchSeed((current) => current + 1);
              if (searchStatus === 'error') {
                setSearchStatus('idle');
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void resolveAddress('enter');
              }
            }}
            className={`${fieldClassName} flex-1`}
            placeholder='请输入地址 / 地点名称'
          />
          <button
            type='button'
            onClick={() => void resolveAddress('button')}
            disabled={!canSearch || searchStatus === 'loading'}
            className='cx-btn-primary h-12'
          >
            {searchStatus === 'loading' ? '搜索中...' : '搜索地址'}
          </button>
        </div>

        <div className={`rounded-2xl border px-4 py-3 text-sm ${noticeClassName[notice.tone]}`}>{notice.text}</div>
      </section>

      <section className='space-y-4'>
        <div>
          <h3 className='font-display text-2xl font-semibold text-[color:var(--cx-text)]'>解析结果</h3>
          <p className='mt-1 text-sm leading-6 text-[color:var(--cx-text-muted)]'>搜索成功后会在这里展示签到所需的位置参数。</p>
        </div>

        <div className='grid gap-4 lg:grid-cols-2'>
          <div className='cx-muted-block lg:col-span-2'>
            <p className='cx-pretitle'>详细地址</p>
            <p className='mt-3 break-words text-sm font-medium text-[color:var(--cx-text)]'>{value.address.trim() || '尚未解析出地址'}</p>
          </div>
          <div className='cx-muted-block'>
            <p className='cx-pretitle'>经度</p>
            <p className='mt-3 text-sm font-medium text-[color:var(--cx-text)]'>{value.lon.trim() || '未获取'}</p>
          </div>
          <div className='cx-muted-block'>
            <p className='cx-pretitle'>纬度</p>
            <p className='mt-3 text-sm font-medium text-[color:var(--cx-text)]'>{value.lat.trim() || '未获取'}</p>
          </div>
          <div className='cx-muted-block lg:col-span-2'>
            <p className='cx-pretitle'>当前状态</p>
            <p className='mt-3 text-sm font-medium text-[color:var(--cx-text)]'>{resultStatusText}</p>
          </div>
        </div>
      </section>

      <section className='space-y-4'>
        <div>
          <h3 className='font-display text-2xl font-semibold text-[color:var(--cx-text)]'>主操作</h3>
          <p className='mt-1 text-sm leading-6 text-[color:var(--cx-text-muted)]'>优先使用这里的两个操作，不需要手动理解经纬度。</p>
        </div>

        <div className='flex flex-col gap-3 sm:flex-row'>
          {onSave ? (
            <button
              type='button'
              onClick={() => void runSave()}
              disabled={!hasResolvedLocation || loadingAction !== ''}
              className='cx-btn-primary h-12'
            >
              {loadingAction === 'save' ? '保存中...' : '保存为默认地址'}
            </button>
          ) : null}

          {onUseForSign ? (
            <button
              type='button'
              onClick={() => void runUse()}
              disabled={!hasResolvedLocation || useDisabled || loadingAction !== ''}
              className='cx-btn-secondary h-12'
            >
              {loadingAction === 'use' ? '提交中...' : useButtonLabel}
            </button>
          ) : null}
        </div>

        {saveStatus || useStatus ? (
          <p className='text-sm leading-6 text-[color:var(--cx-text-muted)]'>{useStatus || saveStatus}</p>
        ) : null}
      </section>

      <section className='cx-surface p-4'>
        <button
          type='button'
          onClick={() => setAdvancedOpen((current) => !current)}
          className='flex w-full items-center justify-between text-left text-sm font-semibold text-[color:var(--cx-text)]'
        >
          <span>高级选项</span>
          <span className='text-[color:var(--cx-text-muted)]'>{advancedOpen ? '收起' : '展开'}</span>
        </button>

        {advancedOpen ? (
          <div className='mt-4 space-y-5'>
            <div className='grid gap-4 lg:grid-cols-2'>
              <label className='block'>
                <span className='mb-2 block text-sm font-medium text-[color:var(--cx-text)]'>手动输入经度</span>
                <input
                  value={value.lon}
                  onChange={(event) => updateValue({ lon: event.target.value })}
                  className={fieldClassName}
                  placeholder='例如 113.516288'
                />
              </label>

              <label className='block'>
                <span className='mb-2 block text-sm font-medium text-[color:var(--cx-text)]'>手动输入纬度</span>
                <input
                  value={value.lat}
                  onChange={(event) => updateValue({ lat: event.target.value })}
                  className={fieldClassName}
                  placeholder='例如 34.817038'
                />
              </label>
            </div>

            <div className='flex flex-wrap gap-3'>
              <button
                type='button'
                onClick={() => void reverseLookup()}
                disabled={searchStatus === 'loading'}
                className='cx-btn-secondary'
              >
                坐标反查地址
              </button>
            </div>

            {isAmapConfigured() ? (
              <div className='space-y-3'>
                <button
                  type='button'
                  onClick={() => setMapOpen((current) => !current)}
                  className='cx-btn-secondary'
                >
                  {mapOpen ? '关闭地图选点' : '打开地图选点'}
                </button>

                {mapEnabled ? (
                  <LocationPreviewMap
                    lon={value.lon}
                    lat={value.lat}
                    address={value.address}
                    interactive
                    onSelect={(next) => {
                      onChange(next);
                      setSearchStatus('success');
                      setNotice({
                        tone: 'success',
                        text: '已从地图更新位置，可以直接保存或用于位置签到。',
                      });
                    }}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
};
