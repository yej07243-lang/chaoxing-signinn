import React, { useEffect, useRef, useState } from 'react';
import { isAmapConfigured, loadAmap } from '../services/amap';

export const LocationPreviewMap = ({
  lon,
  lat,
  address,
}: {
  lon: string;
  lat: string;
  address: string;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!containerRef.current || !lon || !lat) return;

    let disposed = false;

    loadAmap()
      .then((AMap) => {
        if (disposed || !containerRef.current) return;

        const center = [Number(lon), Number(lat)];

        if (!mapRef.current) {
          mapRef.current = new AMap.Map(containerRef.current, {
            zoom: 16,
            center,
            resizeEnable: true,
          });
          mapRef.current.addControl(new AMap.Scale());
          mapRef.current.addControl(new AMap.ToolBar({ position: 'RB' }));
        } else {
          mapRef.current.setCenter(center);
        }

        if (!markerRef.current) {
          markerRef.current = new AMap.Marker({
            position: center,
            title: address || '签到位置',
          });
          mapRef.current.add(markerRef.current);
        } else {
          markerRef.current.setPosition(center);
          markerRef.current.setTitle(address || '签到位置');
        }

        setStatus('');
      })
      .catch((error: Error) => {
        if (disposed) return;
        setStatus(
          error.message === 'missing-amap-key'
            ? '未配置高德地图 Key，无法显示地图预览。'
            : '地图预览加载失败，请检查 Key、白名单或安全密钥配置。'
        );
      });

    return () => {
      disposed = true;
    };
  }, [lon, lat, address]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  if (!lon || !lat) {
    return (
      <div className='rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500'>
        解析地址或手动填写经纬度后，这里会显示位置预览。
      </div>
    );
  }

  if (!isAmapConfigured()) {
    return (
      <div className='rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800'>
        未配置高德地图 Key，当前只保留经纬度结果，不显示地图预览。
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-slate-100'>
        <div ref={containerRef} className='h-64 w-full sm:h-80' />
      </div>
      {status ? <p className='text-sm text-amber-700'>{status}</p> : null}
    </div>
  );
};
