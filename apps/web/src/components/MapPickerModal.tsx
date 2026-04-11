import React, { useEffect, useRef, useState } from 'react';
import { getAmapKey, loadAmap } from '../services/amap';

interface MapPickerModalProps {
  open: boolean;
  initialValue?: Partial<AddressItem> | null;
  onClose: () => void;
  onSelect: (value: AddressItem) => void;
}

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900';

export const MapPickerModal = ({ open, initialValue, onClose, onSelect }: MapPickerModalProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const [keyword, setKeyword] = useState(initialValue?.address || '');
  const [selected, setSelected] = useState<AddressItem>({
    address: initialValue?.address || '',
    lon: initialValue?.lon || '116.397428',
    lat: initialValue?.lat || '39.90923',
  });
  const [status, setStatus] = useState('点击地图选择位置，或搜索后移动到对应区域。');

  useEffect(() => {
    if (!open) return;

    setKeyword(initialValue?.address || '');
    setSelected({
      address: initialValue?.address || '',
      lon: initialValue?.lon || '116.397428',
      lat: initialValue?.lat || '39.90923',
    });
  }, [open, initialValue?.address, initialValue?.lon, initialValue?.lat]);

  useEffect(() => {
    if (!open || !mapRef.current) return;

    let cancelled = false;

    loadAmap()
      .then((AMap) => {
        if (cancelled || !mapRef.current) return;

        geocoderRef.current = new AMap.Geocoder();
        const center = [Number(selected.lon), Number(selected.lat)];

        mapInstanceRef.current = new AMap.Map(mapRef.current, {
          zoom: 16,
          center,
          viewMode: '2D',
        });

        markerRef.current = new AMap.Marker({
          position: center,
          map: mapInstanceRef.current,
        });

        mapInstanceRef.current.on('click', (event: any) => {
          const nextValue: AddressItem = {
            address: '',
            lon: String(event.lnglat.getLng()),
            lat: String(event.lnglat.getLat()),
          };
          markerRef.current.setPosition([Number(nextValue.lon), Number(nextValue.lat)]);
          geocoderRef.current.getAddress([Number(nextValue.lon), Number(nextValue.lat)], (code: string, result: any) => {
            const address = code === 'complete' ? result.regeocode.formattedAddress : '';
            setSelected({ ...nextValue, address });
            setKeyword(address);
            setStatus(address ? '已更新地图选点。' : '已更新经纬度，请手动补全地址。');
          });
        });
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setStatus(error.message === 'missing-amap-key' ? '缺少 VITE_AMAP_KEY，无法打开地图。' : '地图加载失败，请检查 Key 或网络。');
      });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
      geocoderRef.current = null;
    };
  }, [open]);

  const moveToAddress = () => {
    if (!keyword.trim() || !window.AMap || !mapInstanceRef.current) return;

    const AMap = window.AMap;
    AMap.plugin(['AMap.PlaceSearch'], () => {
      const placeSearch = new AMap.PlaceSearch({
        pageSize: 1,
        pageIndex: 1,
      });

      placeSearch.search(keyword.trim(), (statusText: string, result: any) => {
        const poi = result?.poiList?.pois?.[0];
        if (statusText !== 'complete' || !poi?.location) {
          setStatus('没有找到匹配位置，请换个关键词或直接点击地图。');
          return;
        }

        const lon = String(poi.location.lng);
        const lat = String(poi.location.lat);
        const address = poi.address || poi.name || keyword.trim();
        mapInstanceRef.current.setCenter([Number(lon), Number(lat)]);
        markerRef.current.setPosition([Number(lon), Number(lat)]);
        setSelected({ lon, lat, address });
        setKeyword(address);
        setStatus('已定位到搜索结果，可以直接确认。');
      });
    });
  };

  const confirm = () => {
    onSelect({
      address: keyword.trim() || selected.address,
      lon: selected.lon,
      lat: selected.lat,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-5xl rounded-[32px] border border-white/70 bg-white p-5 shadow-panel sm:p-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <p className='text-sm font-medium uppercase tracking-[0.25em] text-slate-400'>Map Picker</p>
            <h2 className='mt-2 text-2xl font-semibold text-slate-950'>手动选位置</h2>
            <p className='mt-2 text-sm text-slate-500'>支持搜索地址，也支持直接点击地图取点。</p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900'
          >
            关闭
          </button>
        </div>

        {!getAmapKey() ? (
          <div className='mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800'>
            未配置 `VITE_AMAP_KEY`。请在前端环境变量中填写高德 JS API Key 后重新构建。
          </div>
        ) : null}

        <div className='mt-6 grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]'>
          <div className='space-y-4'>
            <div className='space-y-3'>
              <label className='block'>
                <span className='mb-2 block text-sm font-medium text-slate-700'>搜索地址</span>
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  className={inputClassName}
                  placeholder='例如 河南省郑州市...'
                />
              </label>
              <button
                type='button'
                onClick={moveToAddress}
                className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900'
              >
                搜索并定位
              </button>
            </div>

            <div className='rounded-3xl bg-slate-50 p-4'>
              <p className='text-sm font-medium text-slate-900'>当前选点</p>
              <p className='mt-3 text-sm text-slate-600'>地址：{keyword || selected.address || '未选择'}</p>
              <p className='mt-2 text-sm text-slate-600'>经度：{selected.lon || '-'}</p>
              <p className='mt-2 text-sm text-slate-600'>纬度：{selected.lat || '-'}</p>
              <p className='mt-3 text-xs text-slate-500'>{status}</p>
            </div>

            <button
              type='button'
              onClick={confirm}
              disabled={!selected.lon || !selected.lat}
              className='w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300'
            >
              使用这个位置
            </button>
          </div>

          <div className='overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100'>
            <div ref={mapRef} className='h-[420px] w-full sm:h-[520px]' />
          </div>
        </div>
      </div>
    </div>
  );
};
