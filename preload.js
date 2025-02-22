const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPresets: () => ipcRenderer.invoke('get-presets'),
  launchPreset: (presetName) => ipcRenderer.invoke('launch-preset', presetName)
});
