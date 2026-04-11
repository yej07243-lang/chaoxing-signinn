import { Html5Qrcode } from 'html5-qrcode';
import { readApiOverride } from './storage';

const TEMP_DIRECT_API_BASE_URL = 'http://198.176.63.96:5000';
const PROXY_API_BASE_URL = '/api';

const normalizeBaseUrl = (value: string) => value.trim().replace(/\/$/, '');

export const getApiBaseUrl = () => {
  const override = normalizeBaseUrl(readApiOverride());
  if (override) return override;

  const envBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || '');
  if (envBaseUrl) return envBaseUrl;

  return TEMP_DIRECT_API_BASE_URL;
};

export const getApiBaseOptions = () => {
  return {
    active: getApiBaseUrl(),
    env: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || ''),
    proxy: PROXY_API_BASE_URL,
    direct: TEMP_DIRECT_API_BASE_URL,
  };
};

export const hasAmapKey = () => Boolean((import.meta.env.VITE_AMAP_KEY || '').trim());

type RequestType = 'json' | 'text';

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: BodyInit | object;
  type?: RequestType;
}

interface GeocodeResult {
  lon: string;
  lat: string;
  formattedAddress: string;
}

const buildUrl = (path: string) => `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

const request = async <T>(path: string, options: RequestOptions = {}) => {
  const method = options.method || 'GET';
  const type = options.type || 'json';
  const headers: Record<string, string> = {};
  let body = options.body as BodyInit | undefined;

  if (body && Object.prototype.toString.call(body) === '[object Object]') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers,
    body,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  if (type === 'text') {
    return response.text() as Promise<T>;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return response.text() as Promise<T>;
};

const requestAmap = async (address: string) => {
  const key = (import.meta.env.VITE_AMAP_KEY || '').trim();
  if (!key) {
    throw new Error('missing-amap-key');
  }

  const url = `https://restapi.amap.com/v3/geocode/geo?key=${encodeURIComponent(key)}&address=${encodeURIComponent(address)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`amap-request-failed:${response.status}`);
  }
  return response.json() as Promise<any>;
};

const credentialsPayload = (session: StoredSession) => ({
  uf: session.uf,
  _d: session._d,
  vc3: session.vc3,
  uid: session._uid,
  fid: session.fid,
  name: session.name,
});

export const api = {
  async login(phone: string, password: string) {
    return request<StoredSession | 'AuthFailed'>('/login', {
      method: 'POST',
      body: {
        phone,
        password,
      },
    });
  },

  async fetchActivity(session: StoredSession) {
    return request<ActivityItem | 'NoActivity' | 'AuthRequired' | 'NoCourse' | 'Too Frequent'>('/activity', {
      method: 'POST',
      body: {
        uf: session.uf,
        _d: session._d,
        vc3: session.vc3,
        uid: session._uid,
      },
    });
  },

  async fetchMonitorStatus(phone: string) {
    return request<{ code: number; msg: string }>(`/monitor/status/${phone}`);
  },

  async generalSign(session: StoredSession, activeId: number) {
    return request<string>('/general', {
      method: 'POST',
      type: 'text',
      body: {
        ...credentialsPayload(session),
        activeId,
      },
    });
  },

  async locationSign(session: StoredSession, activeId: number, address: AddressItem) {
    return request<string>('/location', {
      method: 'POST',
      type: 'text',
      body: {
        ...credentialsPayload(session),
        activeId,
        lat: address.lat,
        lon: address.lon,
        address: address.address,
      },
    });
  },

  async qrcodeSign(session: StoredSession, activeId: number, enc: string, address: AddressItem, altitude = '100') {
    return request<string>('/qrcode', {
      method: 'POST',
      type: 'text',
      body: {
        ...credentialsPayload(session),
        activeId,
        enc,
        lat: address.lat,
        lon: address.lon,
        address: address.address,
        altitude,
      },
    });
  },

  async qrSign(session: StoredSession, qrUrl: string, address: AddressItem, altitude = '100') {
    return request<string>('/qr-sign', {
      method: 'POST',
      type: 'text',
      body: {
        ...credentialsPayload(session),
        qrUrl,
        lat: address.lat,
        lon: address.lon,
        address: address.address,
        altitude,
      },
    });
  },

  async getUploadToken(session: StoredSession) {
    return request<{ _token: string }>('/uvtoken', {
      method: 'POST',
      body: {
        uf: session.uf,
        _d: session._d,
        vc3: session.vc3,
        uid: session._uid,
      },
    });
  },

  async uploadPhoto(session: StoredSession, file: File, token: string) {
    const form = new FormData();
    form.append('uf', session.uf);
    form.append('_d', session._d);
    form.append('_uid', session._uid);
    form.append('vc3', session.vc3);
    form.append('file', file);

    return request<string>(`/upload?_token=${token}`, {
      method: 'POST',
      body: form,
      type: 'text',
    });
  },

  async photoSign(session: StoredSession, activeId: number, objectId: string) {
    return request<string>('/photo', {
      method: 'POST',
      type: 'text',
      body: {
        ...credentialsPayload(session),
        activeId,
        objectId,
      },
    });
  },

  async parseQRCode(file: File) {
    const hostId = 'html5-qrcode-image-reader';
    let host = document.getElementById(hostId);
    if (!host) {
      host = document.createElement('div');
      host.id = hostId;
      host.style.display = 'none';
      document.body.appendChild(host);
    }

    const scanner = new Html5Qrcode(hostId);

    try {
      const decodedText = await scanner.scanFile(file, true);
      return decodedText;
    } finally {
      try {
        scanner.clear();
      } catch (_error) {
        // html5-qrcode 在 scanFile 场景下清理失败不影响主流程
      }
    }
  },

  async geocodeAddress(address: string): Promise<GeocodeResult> {
    const keyword = address.trim();
    if (!keyword) {
      throw new Error('empty-address');
    }

    const data = await requestAmap(keyword);
    if (data.status !== '1' || !Array.isArray(data.geocodes) || data.geocodes.length === 0) {
      throw new Error('geocode-not-found');
    }

    const first = data.geocodes[0];
    const [lon, lat] = String(first.location || '').split(',');
    if (!lon || !lat) {
      throw new Error('geocode-invalid-location');
    }

    return {
      lon,
      lat,
      formattedAddress: first.formatted_address || keyword,
    };
  },
};

export const signTypeLabel = (otherId?: number) => {
  switch (otherId) {
    case 0:
      return '普通 / 拍照签到';
    case 2:
      return '二维码签到';
    case 3:
      return '手势签到';
    case 4:
      return '位置签到';
    case 5:
      return '签到码签到';
    default:
      return '待识别';
  }
};
