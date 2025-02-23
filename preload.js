const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPresets: () => ipcRenderer.invoke('get-presets'),
  launchPreset: (presetName) => ipcRenderer.invoke('launch-preset', presetName),
  createPreset: (newPreset) => ipcRenderer.invoke('create-preset', newPreset),
  updatePresets: (data) => ipcRenderer.invoke('updatePresets', data),
  removePreset: (presetName) => ipcRenderer.invoke('remove-preset', presetName),
  browseForExe: () => ipcRenderer.invoke('browse-for-exe'),
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  removeListener: (channel, func) => {
    ipcRenderer.removeListener(channel, func);
  }
});
