const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Enable electron-reload (install via npm install electron-reload --save-dev)
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
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile('public/index.html');
  // Uncomment for debugging:
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

// Persist updated preset paths to file
function updatePresetsFile() {
  fs.writeFile(presetsPath, JSON.stringify({ presets: presets }, null, 2), (err) => {
    if (err) {
      console.error('Failed to update presets file:', err);
    }
  });
}

// IPC handler to get presets
ipcMain.handle('get-presets', async () => {
  return presets;
});

// IPC handler to launch a preset
ipcMain.handle('launch-preset', async (event, presetName) => {
  const preset = presets.find(p => p.name === presetName);
  if (!preset) {
    return { success: false, message: "Preset not found" };
  }
  // Process each item sequentially with a slight delay between items
  for (const item of preset.items) {
    if (item.type === 'url') {
      if (item.browser) {
        const command = `"${item.browser}" "${item.target}"`;
        runCommand(command).catch(error => {
          console.error(`Error launching ${item.target} with ${item.browser}:`, error);
        });
      } else {
        shell.openExternal(item.target);
      }
    } else if (item.type === 'app') {
      await launchApplication(item);
      // Wait 500ms between launching apps to avoid timing issues with dialogs
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  return { success: true };
});

// Use exec to launch commands and capture errors
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// Helper function to check if a command exists (using "where" on Windows or "which" on Unix)
function checkCommandExists(command) {
  return new Promise((resolve) => {
    const checkCmd = process.platform === 'win32' ? `where ${command}` : `which ${command}`;
    exec(checkCmd, (error, stdout, stderr) => {
      if (error || !stdout) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// Prompt the user to select an executable file for an app
async function promptForAppPath(item) {
  await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Application Not Found',
    message: `Could not launch "${item.target}". Please locate the executable file for this app.`
  });
  const result = await dialog.showOpenDialog(mainWindow, {
    title: `Select executable for ${item.target}`,
    properties: ['openFile'],
    filters: process.platform === 'win32' ? [{ name: 'Executables', extensions: ['exe'] }] : []
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
}

// Launch an application; if the command doesn't exist, prompt for its executable
async function launchApplication(item) {
  let target = item.target;
  let command = "";
  let isAbsolute = path.isAbsolute(target);

  // For Windows, if the target isn't an absolute path, check if the command exists in PATH.
  if (process.platform === "win32" && !isAbsolute) {
    const exists = await checkCommandExists(target);
    if (!exists) {
      console.error(`Command "${target}" not found in PATH.`);
      const newPath = await promptForAppPath(item);
      if (newPath) {
        item.target = newPath;
        updatePresetsFile();
        target = newPath;
        isAbsolute = true;
      } else {
        return;
      }
    }
  }

  if (process.platform === "win32") {
    if (isAbsolute) {
      command = `"${target}"`;
    } else {
      command = `start "" "${target}"`;
    }
  } else if (process.platform === "darwin") {
    if (isAbsolute) {
      command = `"${target}"`;
    } else {
      command = `open -a "${target}"`;
    }
  } else {
    command = target;
  }

  try {
    await runCommand(command);
  } catch (error) {
    console.error(`Error launching ${target}:`, error);
    // If launching fails, prompt the user to select the executable
    const newPath = await promptForAppPath(item);
    if (newPath) {
      item.target = newPath;
      updatePresetsFile();
      try {
        await runCommand(`"${newPath}"`);
      } catch (err) {
        console.error(`Error launching ${newPath}:`, err);
      }
    }
  }
}
