const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, shell, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Base URL for the API
const API_BASE_URL = 'http://localhost:3000/api';

// Create a store for persisting user data
const store = new Store();

let mainWindow;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    resizable: false,
    autoHideMenuBar: true,
  });

  mainWindow.loadFile('index.html');

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Hide window instead of closing when user clicks X
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets/tray-icon.png'));
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Scan Receipt', 
      click: () => {
        if (mainWindow === null) {
          createWindow();
        } else {
          mainWindow.show();
        }
      } 
    },
    { 
      label: 'Open FinBox', 
      click: () => {
        shell.openExternal('http://localhost:3000/dashboard');
      } 
    },
    { type: 'separator' },
    { 
      label: 'Quit', 
      click: () => {
        app.isQuitting = true;
        app.quit();
      } 
    }
  ]);
  
  tray.setToolTip('FinBox Receipt Scanner');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow === null) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle authentication token storage
ipcMain.handle('save-token', (event, token) => {
  store.set('authToken', token);
  return { success: true };
});

ipcMain.handle('get-token', () => {
  return store.get('authToken');
});

ipcMain.handle('clear-token', () => {
  store.delete('authToken');
  return { success: true };
});

// Handle login with email/password
ipcMain.handle('login', async (event, email, password) => {
  try {
    mainWindow.webContents.send('scan-status', 'Redirecting to FinBox login...');
    
    // Instead of trying to authenticate directly, we'll open the FinBox web app for authentication
    const authWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });
    
    // Load the FinBox login page
    authWindow.loadURL('http://localhost:3000/sign-in');
    
    // When the window is closed, check if we have a token
    authWindow.on('closed', async () => {
      try {
        // After login, try to get a token from the API
        const response = await fetch(`${API_BASE_URL}/auth/generate-token`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to get token. Please make sure you are logged in to FinBox.');
        }
        
        const data = await response.json();
        
        // Save the token
        store.set('authToken', data.token);
        
        mainWindow.webContents.send('scan-status', 'Logged in successfully!');
        mainWindow.webContents.send('login-success', data.token);
      } catch (error) {
        console.error('Token fetch error:', error);
        mainWindow.webContents.send('scan-status', `Error: ${error.message}`);
        mainWindow.webContents.send('login-error', error.message);
      }
    });
    
    return true;
  } catch (error) {
    mainWindow.webContents.send('scan-status', `Error: ${error.message}`);
    console.error('Login error:', error);
    return null;
  }
});

// Handle file selection
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  
  return null;
});

// Handle receipt scanning
ipcMain.handle('scan-receipt', async (event, filePath) => {
  try {
    mainWindow.webContents.send('scan-status', 'Scanning receipt...');
    
    const token = store.get('authToken');
    if (!token) {
      throw new Error('Not authenticated. Please log in first.');
    }
    
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    // Create form data
    const formData = new FormData();
    formData.append('receipt', new Blob([fileBuffer]), fileName);
    
    // Send the request
    const response = await fetch(`${API_BASE_URL}/receipt-scanner`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to scan receipt');
    }
    
    mainWindow.webContents.send('scan-status', 'Receipt scanned successfully!');
    return data;
  } catch (error) {
    mainWindow.webContents.send('scan-status', `Error: ${error.message}`);
    throw error;
  }
});

// Verify token validity
ipcMain.handle('verify-token', async () => {
  try {
    const token = store.get('authToken');
    if (!token) {
      return { valid: false };
    }
    
    const response = await fetch(`${API_BASE_URL}/receipt-scanner`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      return { valid: true };
    } else {
      return { valid: false };
    }
  } catch (error) {
    return { valid: false, error: error.message };
  }
});
