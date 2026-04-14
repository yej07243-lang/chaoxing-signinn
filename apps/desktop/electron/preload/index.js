const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopApi', {
  getAppInfo: () => ipcRenderer.invoke('desktop:get-app-info'),
  getWindowState: () => ipcRenderer.invoke('desktop:get-window-state'),
  minimizeWindow: () => ipcRenderer.invoke('desktop:window-minimize'),
  toggleMaximizeWindow: () => ipcRenderer.invoke('desktop:window-toggle-maximize'),
  hideWindow: () => ipcRenderer.invoke('desktop:window-hide'),
  showWindow: () => ipcRenderer.invoke('desktop:window-show'),
  quickSign: () => ipcRenderer.invoke('desktop:quick-sign'),
  onWindowStateChange: (listener) => {
    const handler = (_event, payload) => listener(payload);
    ipcRenderer.on('desktop:window-state', handler);
    return () => ipcRenderer.removeListener('desktop:window-state', handler);
  },
  onCommand: (listener) => {
    const handler = (_event, payload) => listener(payload);
    ipcRenderer.on('desktop:command', handler);
    return () => ipcRenderer.removeListener('desktop:command', handler);
  },
  getSettings: () => ipcRenderer.invoke('desktop:get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('desktop:save-settings', settings),
  getDashboard: () => ipcRenderer.invoke('desktop:get-dashboard'),
  getTasks: () => ipcRenderer.invoke('desktop:get-tasks'),
  getLogs: () => ipcRenderer.invoke('desktop:get-logs'),
  clearLogs: () => ipcRenderer.invoke('desktop:clear-logs'),
  getSession: () => ipcRenderer.invoke('desktop:get-session'),
  login: (payload) => ipcRenderer.invoke('desktop:login', payload),
  logout: () => ipcRenderer.invoke('desktop:logout'),
  sign: (mode, input) => ipcRenderer.invoke('desktop:sign', mode, input)
});
