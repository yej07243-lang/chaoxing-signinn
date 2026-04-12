import React, { useEffect, useRef, useState } from 'react';
import { isAmapConfigured, loadAmap } from '../services/amap';
import { api } from '../services/api';

export const LocationPreviewMap = ({
  lon,
  lat,
  address,
  interactive = false,
  onSelect,
}: {
  lon: string;
  lat: string;
  address: string;
  interactive?: boolean;
  onSelect?: (value: AddressItem) => void;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;

    loadAmap()
      .then((AMap) => {
        if (disposed || !containerRef.current) return;

        const hasPoint = Boolean(lon && lat);
        const center = hasPoint ? [Number(lon), Number(lat)] : [116.397428, 39.90923];

        if (!mapRef.current) {
          mapRef.current = new AMap.Map(containerRef.current, {
            zoom: hasPoint ? 16 : 11,
            center,
            resizeEnable: true,
          });
          mapRef.current.addControl(new AMap.Scale());
          mapRef.current.addControl(new AMap.ToolBar({ position: 'RB' }));

          if (interactive) {
            mapRef.current.on('click', async (event: any) => {
              const nextLon = String(event.lnglat.lng);
              const nextLat = String(event.lnglat.lat);
              setStatus('已选中地图位置，正在回填地址');

              try {
                const result = await api.reverseGeocode(nextLon, nextLat);
                if (disposed) return;
                onSelect?.({
                  lon: result.lon,
                  lat: result.lat,
                  address: result.formattedAddress,
                });
                setStatus('地图选点成功，已同步地址');
              } catch (_error) {
                if (disposed) return;
                onSelect?.({
                  lon: nextLon,
                  lat: nextLat,
                  address,
                });
                setStatus('地图选点成功，未能自动反查地址，请手动补充');
              }
            });
          }
        } else {
          mapRef.current.setCenter(center);
        }

        if (hasPoint && !markerRef.current) {
          markerRef.current = new AMap.Marker({
            position: center,
            title: address || '签到位置',
            draggable: interactive,
          });
          mapRef.current.add(markerRef.current);
          if (interactive) {
            markerRef.current.on('dragend', async (event: any) => {
              const nextLon = String(event.lnglat.lng);
              const nextLat = String(event.lnglat.lat);
              setStatus('已拖动标记，正在回填地址');

              try {
                const result = await api.reverseGeocode(nextLon, nextLat);
                if (disposed) return;
                onSelect?.({
                  lon: result.lon,
                  lat: result.lat,
                  address: result.formattedAddress,
                });
                setStatus('标记位置已更新');
              } catch (_error) {
                if (disposed) return;
                onSelect?.({
                  lon: nextLon,
                  lat: nextLat,
                  address,
                });
                setStatus('位置已更新，未能自动反查地址');
              }
            });
          }
        } else if (hasPoint && markerRef.current) {
          markerRef.current.setPosition(center);
          markerRef.current.setTitle(address || '签到位置');
          markerRef.current.setDraggable?.(interactive);
        } else if (!hasPoint && markerRef.current) {
          mapRef.current.remove(markerRef.current);
          markerRef.current = null;
        }

        if (!interactive) {
          setStatus('');
        }
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
    if (interactive && isAmapConfigured()) {
      return (
        <div className='space-y-3'>
          <div className='overflow-hidden rounded-2xl border border-slate-200 bg-slate-100'>
            <div ref={containerRef} className='h-64 w-full sm:h-80' />
          </div>
          <p className='text-sm text-slate-500'>点击地图即可选点，也可以先手动填写经纬度后再微调位置。</p>
          {status ? <p className='text-sm text-amber-700'>{status}</p> : null}
        </div>
      );
    }

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
