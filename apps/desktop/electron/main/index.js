const { app, BrowserWindow, ipcMain, nativeTheme, Tray, Menu, nativeImage, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

const isDev = process.env.NODE_ENV === 'development';
const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://127.0.0.1:5173';

let mainWindow = null;
let tray = null;
let isQuitting = false;
let staticServer = null;
let staticServerUrl = null;

const sendToRenderer = (channel, payload) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send(channel, payload);
};

const signTypeMap = {
  0: '普通签到',
  2: '二维码签到',
  3: '手势签到',
  4: '位置签到',
  5: '签到码'
};

const defaultSettings = {
  apiBaseUrl: 'http://127.0.0.1:5001',
  autoLaunch: false,
  notifications: true,
  darkMode: nativeTheme.shouldUseDarkColors,
  defaultAddress: '',
  defaultLat: '',
  defaultLon: '',
  defaultAltitude: '100'
};

const defaultSession = {
  loggedIn: false,
  account: '',
  school: '',
  displayName: '',
  phone: '',
  password: '',
  lastLoginAt: '',
  credentials: null
};

const defaultLogs = [
  {
    id: `log-${Date.now()}`,
    level: 'info',
    source: 'system',
    message: '桌面应用已启动。',
    createdAt: new Date().toISOString()
  }
];

const defaultTaskHistory = [];

const getUserDataFile = (name) => path.join(app.getPath('userData'), name);

const ensureJsonFile = (name, fallback) => {
  const target = getUserDataFile(name);
  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, JSON.stringify(fallback, null, 2));
  }
  return target;
};

const readJson = (name, fallback) => {
  try {
    const target = ensureJsonFile(name, fallback);
    return JSON.parse(fs.readFileSync(target, 'utf8'));
  } catch (_error) {
    return fallback;
  }
};

const writeJson = (name, value) => {
  const target = getUserDataFile(name);
  fs.writeFileSync(target, JSON.stringify(value, null, 2));
};

const appendLog = (entry) => {
  const logs = readJson('logs.json', defaultLogs);
  const next = [
    {
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...entry
    },
    ...logs
  ].slice(0, 80);
  writeJson('logs.json', next);
  const settings = getSettings();
  if (settings.notifications && Notification.isSupported() && (entry.level === 'success' || entry.level === 'error')) {
    new Notification({
      title: entry.level === 'success' ? 'Chaoxing Sign Desktop' : 'Chaoxing Sign Desktop',
      body: entry.message
    }).show();
  }
  return next;
};

const readWindowState = () => {
  return readJson('window-state.json', {
    width: 1440,
    height: 920
  });
};

const saveWindowState = (window) => {
  if (!window || window.isDestroyed()) return;
  const bounds = window.getBounds();
  writeJson('window-state.json', {
    width: bounds.width,
    height: bounds.height
  });
};

const sanitizeSession = (session) => ({
  loggedIn: Boolean(session.loggedIn),
  account: session.account || '',
  school: session.school || '',
  displayName: session.displayName || '',
  lastLoginAt: session.lastLoginAt || ''
});

const readTaskHistory = () => readJson('task-history.json', defaultTaskHistory);

const writeTaskHistory = (tasks) => {
  writeJson('task-history.json', tasks.slice(0, 120));
  return tasks.slice(0, 120);
};

const upsertTaskHistory = (taskLike) => {
  const history = readTaskHistory();
  const task = {
    updatedAt: new Date().toISOString(),
    isActive: false,
    source: 'history',
    ...taskLike
  };
  const next = [task, ...history.filter((item) => item.id !== task.id)];
  return writeTaskHistory(next);
};

const mergeTasks = (currentTasks, historyTasks) => {
  const activeIds = new Set(currentTasks.map((item) => item.id));
  return [
    ...currentTasks,
    ...historyTasks.filter((item) => !activeIds.has(item.id))
  ].sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
};

const normalizeBaseUrl = (value) => String(value || '').trim().replace(/\/$/, '');

const getSettings = () => {
  const saved = readJson('settings.json', defaultSettings);
  return {
    ...defaultSettings,
    ...saved
  };
};

const getApiBaseUrl = () => normalizeBaseUrl(getSettings().apiBaseUrl || defaultSettings.apiBaseUrl);

const requestJson = async (pathname, body, options = {}) => {
  const base = getApiBaseUrl();
  const url = `${base}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
  const response = await fetch(url, {
    method: options.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    throw new Error(`request-failed:${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

const requestMultipart = async (pathname, form) => {
  const base = getApiBaseUrl();
  const url = `${base}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
  const response = await fetch(url, {
    method: 'POST',
    body: form
  });

  if (!response.ok) {
    throw new Error(`request-failed:${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

const getContentType = (filePath) => {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.ico')) return 'image/x-icon';
  return 'application/octet-stream';
};

const startStaticServer = async () => {
  if (staticServerUrl) return staticServerUrl;

  const distDir = path.join(__dirname, '../../ui/dist');
  staticServer = http.createServer((req, res) => {
    const requestedPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const safePath = requestedPath === '/' ? '/index.html' : requestedPath;
    const filePath = path.join(distDir, safePath);
    const resolvedPath = filePath.startsWith(distDir) ? filePath : path.join(distDir, 'index.html');
    const fallbackPath = path.join(distDir, 'index.html');
    const targetPath = fs.existsSync(resolvedPath) ? resolvedPath : fallbackPath;

    try {
      const content = fs.readFileSync(targetPath);
      res.writeHead(200, { 'Content-Type': getContentType(targetPath) });
      res.end(content);
    } catch (_error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('failed-to-load-static-content');
    }
  });

  await new Promise((resolve) => {
    staticServer.listen(0, '127.0.0.1', resolve);
  });

  const { port } = staticServer.address();
  staticServerUrl = `http://127.0.0.1:${port}`;
  return staticServerUrl;
};

const loadStoredSession = () => {
  const saved = readJson('session.json', defaultSession);
  return {
    ...defaultSession,
    ...saved
  };
};

const persistSession = (session) => {
  writeJson('session.json', session);
  return session;
};

const buildDashboardTask = (activity, status) => {
  if (!activity || typeof activity === 'string' || !activity.activeId) {
    return [];
  }

  return [
    {
      id: String(activity.activeId),
      course: activity.name || '未命名活动',
      type: signTypeMap[activity.otherId] || '签到任务',
      due: '待立即处理',
      status,
      activeId: activity.activeId,
      signType: activity.otherId || 0,
      updatedAt: new Date().toISOString(),
      isActive: true,
      source: 'live'
    }
  ];
};

const logsToRecentSigns = (logs) => {
  return logs
    .filter((item) => item.source === 'sign' || item.source === 'activity' || item.source === 'auth')
    .slice(0, 6)
    .map((item) => ({
      id: item.id,
      course: item.message,
      status: item.level === 'success' ? '已完成' : item.level === 'error' ? '异常' : '待处理',
      time: new Date(item.createdAt).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
};

const reloginIfNeeded = async (session) => {
  if (!session.phone || !session.password) {
    return session;
  }

  const loginResult = await requestJson('/login', {
    phone: session.phone,
    password: session.password
  });

  if (typeof loginResult === 'string') {
    throw new Error(loginResult);
  }

  const next = {
    ...session,
    loggedIn: true,
    displayName: loginResult.name || session.displayName || '',
    lastLoginAt: new Date().toISOString(),
    credentials: loginResult
  };
  persistSession(next);
  appendLog({
    level: 'success',
    source: 'auth',
    message: '登录凭证已自动刷新。'
  });
  return next;
};

const fetchActivityPayload = async () => {
  let session = loadStoredSession();
  if (!session.loggedIn || !session.credentials) {
      return {
        todayStatus: '当前未登录桌面端。',
        tasks: [],
        taskHistory: readTaskHistory(),
        activity: null,
        authState: 'logged_out'
      };
  }

  const credentials = session.credentials;
  const payload = {
    uf: credentials.uf,
    _d: credentials._d,
    vc3: credentials.vc3,
    uid: credentials._uid
  };

  let activityResult = await requestJson('/activity', payload);

  if (activityResult === 'AuthRequired') {
    session = await reloginIfNeeded(session);
    const nextCredentials = session.credentials;
    activityResult = await requestJson('/activity', {
      uf: nextCredentials.uf,
      _d: nextCredentials._d,
      vc3: nextCredentials.vc3,
      uid: nextCredentials._uid
    });
  }

  if (typeof activityResult === 'string') {
    if (activityResult === 'NoActivity') {
      return {
        todayStatus: '当前没有待签到任务。',
        tasks: [],
        taskHistory: readTaskHistory(),
        activity: null,
        authState: 'connected'
      };
    }

    if (activityResult === 'NoCourse') {
      return {
        todayStatus: '当前账号没有可查询课程。',
        tasks: [],
        taskHistory: readTaskHistory(),
        activity: null,
        authState: 'connected'
      };
    }

    if (activityResult === 'Too Frequent') {
      return {
        todayStatus: '查询过于频繁，请稍后再试。',
        tasks: [],
        taskHistory: readTaskHistory(),
        activity: null,
        authState: 'connected'
      };
    }

    return {
      todayStatus: `任务查询失败：${activityResult}`,
      tasks: [],
      taskHistory: readTaskHistory(),
      activity: null,
      authState: 'degraded'
    };
  }

  const liveTasks = buildDashboardTask(activityResult, '待签到');
  if (liveTasks[0]) {
    upsertTaskHistory(liveTasks[0]);
  }

  return {
    todayStatus: `检测到待处理任务：${activityResult.name || '未命名活动'}`,
    tasks: liveTasks,
    taskHistory: mergeTasks(liveTasks, readTaskHistory()),
    activity: activityResult,
    authState: 'connected'
  };
};

const executeSign = async (mode, input = {}) => {
  let session = loadStoredSession();
  if (!session.loggedIn || !session.credentials) {
    throw new Error('未登录，无法执行签到。');
  }

  const credentials = session.credentials;
  const activityData = await fetchActivityPayload();
  const task = activityData.tasks[0];

  if (!task) {
    throw new Error('当前没有可执行的签到任务。');
  }

  if (activityData.authState === 'degraded') {
    throw new Error(activityData.todayStatus);
  }

  const basePayload = {
    uf: credentials.uf,
    _d: credentials._d,
    vc3: credentials.vc3,
    uid: credentials._uid,
    fid: credentials.fid,
    name: credentials.name,
    activeId: task.activeId
  };

  let result = '';

  if (mode === 'general' && (task.signType === 0 || task.signType === 3)) {
    result = await requestJson('/general', basePayload);
  } else if (mode === 'code') {
    result = await requestJson('/code-sign', {
      ...basePayload,
      signCode: input.signCode
    });
  } else if (mode === 'location') {
    result = await requestJson('/location', {
      ...basePayload,
      address: input.address,
      lat: input.lat,
      lon: input.lon
    });
  } else if (mode === 'qr-url') {
    result = await requestJson('/qr-sign', {
      ...basePayload,
      qrUrl: input.qrUrl,
      address: input.address,
      lat: input.lat,
      lon: input.lon,
      altitude: input.altitude || '100'
    });
  } else if (mode === 'qr-image') {
    const qrForm = new FormData();
    const qrBuffer = Buffer.from(input.fileBytes || []);
    qrForm.append('file', new Blob([qrBuffer], { type: input.fileType || 'image/png' }), input.fileName || 'qr-image.png');
    const enc = await requestMultipart('/qrocr', qrForm);
    if (!enc || enc === '识别失败') {
      throw new Error('二维码识别失败，请改用二维码链接或更清晰的图片。');
    }
    result = await requestJson('/qrcode', {
      ...basePayload,
      enc,
      address: input.address,
      lat: input.lat,
      lon: input.lon,
      altitude: input.altitude || '100'
    });
  } else if (mode === 'photo') {
    const tokenResponse = await requestJson('/uvtoken', {
      uf: credentials.uf,
      _d: credentials._d,
      vc3: credentials.vc3,
      uid: credentials._uid
    });
    const photoForm = new FormData();
    const photoBuffer = Buffer.from(input.fileBytes || []);
    photoForm.append('uf', credentials.uf);
    photoForm.append('_d', credentials._d);
    photoForm.append('_uid', credentials._uid);
    photoForm.append('vc3', credentials.vc3);
    photoForm.append('file', new Blob([photoBuffer], { type: input.fileType || 'image/jpeg' }), input.fileName || 'photo-sign.jpg');
    const uploadResult = await requestMultipart(`/upload?_token=${tokenResponse._token}`, photoForm);
    const parsedUpload = typeof uploadResult === 'string' ? JSON.parse(uploadResult) : uploadResult;
    result = await requestJson('/photo', {
      ...basePayload,
      objectId: parsedUpload.objectId
    });
  } else {
    throw new Error('当前桌面端暂未实现该签到类型的完整提交流程。');
  }

  const isSuccess = typeof result === 'string' && (result === 'success' || result.includes('成功'));
  const historyStatus = isSuccess ? '已完成' : '异常';
  upsertTaskHistory({
    ...task,
    status: historyStatus,
    due: isSuccess ? '刚刚处理' : task.due,
    isActive: false,
    source: 'history'
  });
  appendLog({
    level: isSuccess ? 'success' : 'error',
    source: 'sign',
    message: isSuccess ? `${task.course} 签到成功。` : `${task.course} 签到失败：${String(result)}`
  });

  return {
    success: isSuccess,
    message: String(result),
    task
  };
};

const createWindow = async () => {
  const windowState = readWindowState();

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: '#101215',
    title: 'Chaoxing Sign Desktop',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : undefined,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  mainWindow.on('resize', () => saveWindowState(mainWindow));
  mainWindow.on('close', () => saveWindowState(mainWindow));
  mainWindow.on('maximize', () => broadcastWindowState());
  mainWindow.on('unmaximize', () => broadcastWindowState());
  mainWindow.on('enter-full-screen', () => broadcastWindowState());
  mainWindow.on('leave-full-screen', () => broadcastWindowState());
  mainWindow.on('minimize', () => broadcastWindowState());
  mainWindow.on('restore', () => broadcastWindowState());
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      appendLog({
        level: 'info',
        source: 'system',
        message: '窗口已隐藏到托盘。'
      });
    }
  });

  if (isDev) {
    mainWindow.loadURL(devServerUrl);
    if (process.env.OPEN_DEVTOOLS === 'true') {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  } else {
    const url = await startStaticServer();
    mainWindow.loadURL(url);
  }
};

const getWindowStatePayload = () => ({
  isMaximized: Boolean(mainWindow && mainWindow.isMaximized()),
  isVisible: Boolean(mainWindow && mainWindow.isVisible()),
  notifications: Boolean(getSettings().notifications)
});

const broadcastWindowState = () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('desktop:window-state', getWindowStatePayload());
};

const createTrayImage = () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <rect width="16" height="16" rx="8" fill="#191c1f"/>
      <circle cx="8" cy="8" r="3.5" fill="#ffffff"/>
    </svg>
  `;
  return nativeImage.createFromDataURL(`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`);
};

const showMainWindow = () => {
  if (!mainWindow) return;
  if (!mainWindow.isVisible()) mainWindow.show();
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
  broadcastWindowState();
};

const quickSignFromTray = async () => {
  try {
    const result = await executeSign('general');
    appendLog({
      level: result.success ? 'success' : 'error',
      source: 'system',
      message: result.success ? '托盘快速签到已执行。' : `托盘快速签到失败：${result.message}`
    });
    sendToRenderer('desktop:command', {
      type: 'quick-sign-result',
      result
    });
    return result;
  } catch (error) {
    const message = error.message || '托盘快速签到失败';
    appendLog({
      level: 'error',
      source: 'system',
      message
    });
    sendToRenderer('desktop:command', {
      type: 'quick-sign-error',
      message
    });
    throw error;
  }
};

const createTray = () => {
  if (tray) return;
  tray = new Tray(createTrayImage());
  tray.setToolTip('Chaoxing Sign Desktop');
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: '快速签到',
      click: async () => {
        showMainWindow();
        await quickSignFromTray();
      }
    },
    {
      label: '刷新任务',
      click: () => {
        showMainWindow();
        sendToRenderer('desktop:command', {
          type: 'navigate',
          path: '/tasks',
          action: 'refresh-tasks'
        });
      }
    },
    {
      label: '打开日志',
      click: () => {
        showMainWindow();
        sendToRenderer('desktop:command', {
          type: 'navigate',
          path: '/logs'
        });
      }
    },
    { type: 'separator' },
    {
      label: '显示窗口',
      click: () => showMainWindow()
    },
    {
      label: '隐藏窗口',
      click: () => {
        if (mainWindow) mainWindow.hide();
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]));
  tray.on('click', () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      showMainWindow();
    }
  });
};

ipcMain.handle('desktop:get-app-info', () => ({
  name: app.getName(),
  version: app.getVersion(),
  platform: process.platform,
  isDev
}));

ipcMain.handle('desktop:get-window-state', () => getWindowStatePayload());
ipcMain.handle('desktop:window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
  return getWindowStatePayload();
});
ipcMain.handle('desktop:window-toggle-maximize', () => {
  if (!mainWindow) return getWindowStatePayload();
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
  return getWindowStatePayload();
});
ipcMain.handle('desktop:window-hide', () => {
  if (mainWindow) mainWindow.hide();
  return getWindowStatePayload();
});
ipcMain.handle('desktop:window-show', () => {
  showMainWindow();
  return getWindowStatePayload();
});
ipcMain.handle('desktop:quick-sign', async () => quickSignFromTray());

ipcMain.handle('desktop:get-settings', () => {
  return getSettings();
});

ipcMain.handle('desktop:save-settings', (_event, nextSettings) => {
  const merged = {
    ...defaultSettings,
    ...nextSettings
  };
  writeJson('settings.json', merged);
  nativeTheme.themeSource = merged.darkMode ? 'dark' : 'light';
  if (app.setLoginItemSettings) {
    app.setLoginItemSettings({
      openAtLogin: Boolean(merged.autoLaunch)
    });
  }
  broadcastWindowState();
  appendLog({
    level: 'info',
    source: 'system',
    message: '桌面设置已保存。'
  });
  return merged;
});

ipcMain.handle('desktop:get-session', () => {
  return sanitizeSession(loadStoredSession());
});

ipcMain.handle('desktop:login', async (_event, payload) => {
  try {
    const loginResult = await requestJson('/login', {
      phone: payload.account,
      password: payload.password
    });

    if (typeof loginResult === 'string') {
      appendLog({
        level: 'error',
        source: 'auth',
        message: '登录失败，请检查账号、密码或后端接口。'
      });
      throw new Error(loginResult);
    }

    const session = persistSession({
      loggedIn: true,
      account: payload.account,
      school: payload.school || '',
      displayName: loginResult.name || '',
      phone: payload.account,
      password: payload.password,
      lastLoginAt: new Date().toISOString(),
      credentials: loginResult
    });

    appendLog({
      level: 'success',
      source: 'auth',
      message: `桌面端登录成功：${loginResult.name || payload.account}`
    });

    return sanitizeSession(session);
  } catch (error) {
    throw new Error(error.message || '登录失败');
  }
});

ipcMain.handle('desktop:logout', () => {
  persistSession(defaultSession);
  appendLog({
    level: 'info',
    source: 'auth',
    message: '当前桌面会话已退出。'
  });
  return sanitizeSession(defaultSession);
});

ipcMain.handle('desktop:get-dashboard', async () => {
  const logs = readJson('logs.json', defaultLogs);
  const session = loadStoredSession();
  const activityData = await fetchActivityPayload();

  return {
    todayStatus: activityData.todayStatus,
    recentSigns: logsToRecentSigns(logs),
    tasks: activityData.tasks,
    taskHistory: activityData.taskHistory || mergeTasks(activityData.tasks, readTaskHistory()),
    lastSyncedAt: new Date().toISOString(),
    authState: activityData.authState,
    user: sanitizeSession(session)
  };
});

ipcMain.handle('desktop:get-tasks', async () => {
  const activityData = await fetchActivityPayload();
  return mergeTasks(activityData.tasks, activityData.taskHistory || readTaskHistory());
});

ipcMain.handle('desktop:get-logs', () => {
  return readJson('logs.json', defaultLogs);
});

ipcMain.handle('desktop:clear-logs', () => {
  writeJson('logs.json', []);
  return [];
});

ipcMain.handle('desktop:sign', async (_event, mode, input) => {
  return executeSign(mode, input);
});

app.whenReady().then(async () => {
  const settings = getSettings();
  nativeTheme.themeSource = settings.darkMode ? 'dark' : 'light';
  await createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
      createTray();
    } else {
      showMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && isQuitting) {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  if (staticServer) {
    staticServer.close();
    staticServer = null;
    staticServerUrl = null;
  }
});
