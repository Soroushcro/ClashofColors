const { app, BrowserWindow } = require('electron');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nodeIntegrationInWorker: true
    }
  });

  mainWindow.loadFile('pages/game.html');
}

app.whenReady().then(() => {
  createWindow();
});
