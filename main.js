const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile('public/index.html');
  // mainWindow.webContents.openDevTools(); Uncomment to open the DevTools.
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Load presets from presets.json
let presets = [];
const presetsPath = path.join(__dirname, 'presets.json');
try {
  const data = fs.readFileSync(presetsPath);
  const parsed = JSON.parse(data);
  presets = parsed.presets || [];
} catch (err) {
  console.error('Error loading presets:', err);
}

// IPC handlers for communication with the renderer
ipcMain.handle('get-presets', async () => {
  return presets;
});

ipcMain.handle('launch-preset', async (event, presetName) => {
  const preset = presets.find(p => p.name === presetName);
  if (!preset) {
    return { success: false, message: "Preset not found" };
  }
  preset.items.forEach(item => {
    if (item.type === 'url') {
      shell.openExternal(item.target);
    } else if (item.type === 'app') {
      launchApplication(item.target);
    }
  });
  return { success: true };
});

function launchApplication(target) {
  let command = "";
  if (process.platform === "win32") {
    command = `start "" "${target}"`;
  } else if (process.platform === "darwin") {
    command = `open -a "${target}"`;
  } else {
    // For Linux, assuming the target is available in PATH.
    command = target;
  }
  exec(command, (error) => {
    if (error) {
      console.error(`Error launching ${target}:`, error);
    }
  });
}
