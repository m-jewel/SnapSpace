const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPresets: () => ipcRenderer.invoke('get-presets'),
  launchPreset: (presetName) => ipcRenderer.invoke('launch-preset', presetName),
  createPreset: (newPreset) => ipcRenderer.invoke('create-preset', newPreset),
  updatePreset: (data) => ipcRenderer.invoke('update-preset', data),
  removePreset: (presetName) => ipcRenderer.invoke('remove-preset', presetName),
  browseForExe: () => ipcRenderer.invoke('browse-for-exe')
});
