const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getPresets: () => ipcRenderer.invoke("get-presets"),
  launchPreset: (name) => ipcRenderer.invoke("launch-preset", name),
  createPreset: (newPreset) => ipcRenderer.invoke("create-preset", newPreset),
  updatePreset: (updatedPreset) =>
    ipcRenderer.invoke("update-preset", updatedPreset),
  removePreset: (name) => ipcRenderer.invoke("remove-preset", name),
  focusWindow: () => ipcRenderer.invoke("focus-window"),
  browseForExe: () => ipcRenderer.invoke("browse-for-exe"),

  // Add receive method with all valid channels
  receive: (channel, func) => {
    const validChannels = [
      "get-presets",
      "launch-preset",
      "create-preset",
      "update-preset",
      "remove-preset",
      "focus-window",
      "browse-for-exe",
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});
