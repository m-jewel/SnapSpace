const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');

// Enable electron-reload
try {
  require('electron-reload')(__dirname, {
    electron: require(path.join(__dirname, 'node_modules', 'electron'))
  });
} catch (err) {
  console.error('Failed to start electron-reload:', err);
}

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

  // Hide default Electron menu
  mainWindow.setMenuBarVisibility(false);

  // Uncomment for debugging
  mainWindow.loadFile('public/index.html');
  // mainWindow.webContents.openDevTools();
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

// Persist updated presets to the JSON file
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
    return { success: false, message: 'Preset not found' };
  }

  // Launch each item in sequence with a small delay
  for (const item of preset.items) {
    if (item.type === 'url') {
      // Open URL in default browser
      shell.openExternal(item.target);
    } else if (item.type === 'app') {
      // Launch application (see function below)
      await launchApplication(item);
      // Wait 500ms between launching apps to avoid any timing issues
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return { success: true };
});

// ---------- APP LAUNCH LOGIC ----------

/**
 * Launches a command in detached mode so that closing the app
 * doesn't re-trigger anything in the main process.
 */
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

/**
 * Checks if a command is in PATH (using "where" on Windows or "which" on Unix).
 * Returns a Promise resolving to true or false.
 */
function checkCommandExists(command) {
  return new Promise((resolve) => {
    const checkCmd = process.platform === 'win32'
      ? `where ${command}`
      : `which ${command}`;
    exec(checkCmd, (error, stdout, stderr) => {
      if (error || !stdout) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * Prompts the user to select an .exe if we can't find the command in PATH.
 */
async function promptForAppPath(item) {
  await dialog.showMessageBox(mainWindow, {
    type: 'warning',
    title: 'App Not Found',
    message: `We couldn't locate "${item.target}".\n` +
             `Please select the executable file for this app.`
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

/**
 * Main function to launch an app.
 * 1) If target is an absolute path, we run that directly.
 * 2) If it's not absolute, we check if it's in PATH.
 * 3) If not found, we prompt the user to pick an .exe, then store that path in the JSON.
 */
async function launchApplication(item) {
  let target = item.target;
  let isAbsolutePath = path.isAbsolute(target);

  // If on Windows and target isn't an absolute path, check if the command is in PATH
  if (process.platform === 'win32' && !isAbsolutePath) {
    const exists = await checkCommandExists(target);
    if (!exists) {
      console.error(`Command "${target}" not found in PATH.`);
      const newPath = await promptForAppPath(item);
      if (newPath) {
        // User selected a file, store that absolute path
        item.target = newPath;
        updatePresetsFile();
        target = newPath;
        isAbsolutePath = true;
      } else {
        // User canceled
        return;
      }
    }
  }

  // Build the final command
  let command = '';
  if (process.platform === 'win32') {
    // If it's an absolute path, just run it
    if (isAbsolutePath) {
      command = `"${target}"`;
    } else {
      // If it's in PATH, do "start" so it doesn't block
      command = `start "" "${target}"`;
    }
  } else if (process.platform === 'darwin') {
    // Mac
    if (isAbsolutePath) {
      command = `"${target}"`;
    } else {
      command = `open -a "${target}"`;
    }
  } else {
    // Linux
    command = target;
  }

  try {
    await runCommand(command);
  } catch (err) {
    console.error(`Error launching ${target}:`, err);
    // If launching fails, prompt again
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
