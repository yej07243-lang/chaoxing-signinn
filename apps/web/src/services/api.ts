import { Decoder } from '@nuintun/qrcode';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

type RequestType = 'json' | 'text';

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: BodyInit | object;
  type?: RequestType;
}

const buildUrl = (path: string) => `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;

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
    const qrcode = new Decoder();
    const objectUrl = URL.createObjectURL(file);

    try {
      const result = await qrcode.scan(objectUrl);
      const encStart = result.data.indexOf('enc=') + 4;
      return result.data.substring(encStart, result.data.indexOf('&', encStart));
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
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
