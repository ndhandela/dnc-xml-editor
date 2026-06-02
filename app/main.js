const { app, BrowserWindow } = require('electron')
const path = require('path')

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'DNC XML Editor — TechDen Solutions',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: { nodeIntegration: false }
  })
  win.loadFile('index.html')
  win.setMenuBarVisibility(false)
})

app.on('window-all-closed', () => app.quit())
