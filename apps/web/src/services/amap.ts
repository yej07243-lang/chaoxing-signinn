let amapPromise: Promise<any> | null = null;

const AMAP_URL = 'https://webapi.amap.com/maps?v=2.0';

export const getAmapKey = () => import.meta.env.VITE_AMAP_KEY || '';
export const getAmapSecurityCode = () => import.meta.env.VITE_AMAP_SECURITY_CODE || '';
export const isAmapConfigured = () => Boolean(getAmapKey());

export const loadAmap = () => {
  const key = getAmapKey();
  const securityCode = getAmapSecurityCode();

  if (!key) {
    return Promise.reject(new Error('missing-amap-key'));
  }

  if (securityCode) {
    window._AMapSecurityConfig = {
      securityJsCode: securityCode,
    };
  }

  if (window.AMap) {
    return Promise.resolve(window.AMap);
  }

  if (amapPromise) {
    return amapPromise;
  }

  amapPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-amap-loader="true"]');
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.AMap) resolve(window.AMap);
      });
      existing.addEventListener('error', () => reject(new Error('amap-load-failed')));
      return;
    }

    const script = document.createElement('script');
    script.src = `${AMAP_URL}&key=${key}&plugin=AMap.Geocoder,AMap.AutoComplete,AMap.PlaceSearch`;
    script.async = true;
    script.dataset.amapLoader = 'true';
    script.onload = () => {
      if (window.AMap) {
        resolve(window.AMap);
      } else {
        reject(new Error('amap-unavailable'));
      }
    };
    script.onerror = () => reject(new Error('amap-load-failed'));
    document.head.appendChild(script);
  });

  return amapPromise;
};
