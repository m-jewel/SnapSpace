const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile('public/index.html');
  // mainWindow.webContents.openDevTools(); // For debugging
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

// ---------- LOAD PRESETS ----------

let presets = [];
const presetsPath = path.join(__dirname, 'presets.json');

try {
  const data = fs.readFileSync(presetsPath, 'utf8');
  const parsed = JSON.parse(data);
  presets = parsed.presets || [];
} catch (err) {
  console.error('Error loading presets:', err);
}

function updatePresetsFile() {
  fs.writeFile(presetsPath, JSON.stringify({ presets }, null, 2), (err) => {
    if (err) {
      console.error('Failed to update presets file:', err);
    }
  });
}

// ---------- IPC HANDLERS ----------

ipcMain.handle('get-presets', async () => {
  return presets;
});

ipcMain.handle('launch-preset', async (event, presetName) => {
  const preset = presets.find(p => p.name === presetName);
  if (!preset) {
    return { success: false, message: "Preset not found" };
  }
  for (const item of preset.items) {
    if (item.type === 'url') {
      shell.openExternal(item.target);
    } else if (item.type === 'app') {
      await launchApplication(item);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  return { success: true };
});

ipcMain.handle('create-preset', async (event, newPreset) => {
  if (!newPreset.name || !Array.isArray(newPreset.items)) {
    return { success: false, message: "Invalid preset data" };
  }
  presets.push(newPreset);
  updatePresetsFile();
  return { success: true };
});

ipcMain.handle('update-preset', async (event, updatedPreset) => {
  if (!updatedPreset.oldName || !updatedPreset.newName) {
    return { success: false, message: "Invalid update data" };
  }
  const idx = presets.findIndex(p => p.name === updatedPreset.oldName);
  if (idx < 0) {
    return { success: false, message: "Preset not found" };
  }
  // Overwrite with new data
  presets[idx].name = updatedPreset.newName;
  presets[idx].description = updatedPreset.description || '';
  presets[idx].items = updatedPreset.items || [];
  presets[idx].icon = updatedPreset.icon;
  updatePresetsFile();
  return { success: true };
});

ipcMain.handle('remove-preset', async (event, presetName) => {
  const idx = presets.findIndex(p => p.name === presetName);
  if (idx < 0) {
    return { success: false, message: "Preset not found" };
  }
  presets.splice(idx, 1);
  updatePresetsFile();
  return { success: true };
});

ipcMain.handle('focus-window', () => {
  if (mainWindow) {
    mainWindow.focus();
  }
});

ipcMain.handle('browse-for-exe', async () => {
  // Show a file dialog for picking an executable (on Windows, .exe)
  const result = await dialog.showOpenDialog({
    title: 'Select Executable',
    properties: ['openFile'],
    filters: [
      { name: 'Executables', extensions: ['exe', 'app'] } 
      // adjust for Mac (.app), Linux, or more
    ]
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

// ---------- APP LAUNCH LOGIC ----------

function runCommand(command) {
  return new Promise((resolve, reject) => {
    try {
      const child = spawn(command, {
        shell: true,
        detached: true,
        stdio: 'ignore'
      });
      child.on('error', err => reject(err));
      child.unref();
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

function checkCommandExists(command) {
  return new Promise((resolve) => {
    const checkCmd = process.platform === 'win32'
      ? `where ${command}`
      : `which ${command}`;
    exec(checkCmd, (error, stdout) => {
      if (error || !stdout) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

async function promptForAppPath(item) {
  await dialog.showMessageBox(mainWindow, {
    type: 'warning',
    title: 'App Not Found',
    message: `We couldn't locate "${item.target}".\nPlease select the executable file for this app.`
  });
  const result = await dialog.showOpenDialog(mainWindow, {
    title: `Select executable for ${item.target}`,
    properties: ['openFile'],
    filters: process.platform === 'win32'
      ? [{ name: 'Executables', extensions: ['exe'] }]
      : []
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
}

async function launchApplication(item) {
  let target = item.target;
  let isAbsolutePath = path.isAbsolute(target);

  // If on Windows and not absolute, check PATH
  if (process.platform === 'win32' && !isAbsolutePath) {
    const exists = await checkCommandExists(target);
    if (!exists) {
      console.error(`Command "${target}" not found in PATH.`);
      const newPath = await promptForAppPath(item);
      if (newPath) {
        item.target = newPath;
        updatePresetsFile();
        target = newPath;
        isAbsolutePath = true;
      } else {
        return;
      }
    }
  }

  let command = "";
  if (process.platform === 'win32') {
    if (isAbsolutePath) {
      command = `"${target}"`;
    } else {
      command = `start "" "${target}"`;
    }
  } else if (process.platform === 'darwin') {
    if (isAbsolutePath) {
      command = `"${target}"`;
    } else {
      command = `open -a "${target}"`;
    }
  } else {
    command = target;
  }

  try {
    await runCommand(command);
  } catch (err) {
    console.error(`Error launching ${target}:`, err);
    const newPath = await promptForAppPath(item);
    if (newPath) {
      item.target = newPath;
      updatePresetsFile();
      try {
        await runCommand(`"${newPath}"`);
      } catch (err2) {
        console.error(`Error launching ${newPath}:`, err2);
      }
    }
  }
}
