let amapPromise: Promise<any> | null = null;

const AMAP_JS_API_URL = 'https://webapi.amap.com/maps?v=2.0';

export const getAmapKey = () => (import.meta.env.VITE_AMAP_KEY || '').trim();
export const getAmapSecurityCode = () => (import.meta.env.VITE_AMAP_SECURITY_CODE || '').trim();
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
    const existing = document.querySelector<HTMLScriptElement>('script[data-amap-jsapi="true"]');
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.AMap) resolve(window.AMap);
      });
      existing.addEventListener('error', () => reject(new Error('amap-load-failed')));
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.dataset.amapJsapi = 'true';
    script.src = `${AMAP_JS_API_URL}&key=${encodeURIComponent(key)}&plugin=AMap.Scale,AMap.ToolBar,AMap.Geocoder`;
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
