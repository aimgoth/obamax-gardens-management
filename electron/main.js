const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

const PRIMARY_APP_URL = 'http://107.161.174.15/~obamaxga/public/login'; // Temporary live URL
const FALLBACK_APP_URL = 'https://www.obamaxgardens.com/login'; // Main live URL

// Read logo as base64 so it works reliably in Electron
function getLogoBase64() {
    const pngPath = path.join(__dirname, '..', 'public', 'logo.png');
    const jpgPath = path.join(__dirname, '..', 'public', 'logo.jpg');
    try {
        if (fs.existsSync(pngPath)) {
            return 'data:image/png;base64,' + fs.readFileSync(pngPath).toString('base64');
        }
        if (fs.existsSync(jpgPath)) {
            return 'data:image/jpeg;base64,' + fs.readFileSync(jpgPath).toString('base64');
        }
    } catch (e) { /* ignore */ }
    return null;
}

let mainWindow;

function createSplashWindow(logoBase64) {
    const splash = new BrowserWindow({
        width: 500,
        height: 400,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        center: true,
        webPreferences: { nodeIntegration: false, contextIsolation: true }
    });

    // Build HTML with the logo embedded as base64
    const logoTag = logoBase64
        ? `<img src="${logoBase64}" alt="Logo" class="logo" id="logo">`
        : `<div class="logo-fallback">OG</div>`;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:500px; height:400px; overflow:hidden; }
  body {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    background:linear-gradient(135deg,#051a0c 0%,#0a3520 40%,#0f4d2e 70%,#063318 100%);
    border-radius:20px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    position:relative;
  }
  .bg-circle1 { position:absolute; top:-80px; right:-80px; width:300px; height:300px; border-radius:50%; background:rgba(52,211,153,0.06); border:1px solid rgba(52,211,153,0.12); }
  .bg-circle2 { position:absolute; bottom:-80px; left:-60px; width:360px; height:360px; border-radius:50%; background:rgba(52,211,153,0.04); border:1px solid rgba(52,211,153,0.08); }
  .logo {
    width:130px; height:130px; border-radius:50%; object-fit:cover;
    border:4px solid rgba(52,211,153,0.5);
    box-shadow:0 0 50px rgba(52,211,153,0.3), 0 20px 50px rgba(0,0,0,0.5);
    margin-bottom:22px;
    animation:float 3s ease-in-out infinite, glow 2s ease-in-out infinite;
  }
  .logo-fallback {
    width:130px; height:130px; border-radius:50%;
    background:linear-gradient(135deg,#16a34a,#059669);
    display:flex; align-items:center; justify-content:center;
    font-size:40px; font-weight:900; color:white;
    margin-bottom:22px; border:4px solid rgba(52,211,153,0.5);
    box-shadow:0 0 50px rgba(52,211,153,0.3);
    animation:float 3s ease-in-out infinite;
  }
  h1 { color:#fff; font-size:28px; font-weight:900; letter-spacing:0.5px; margin-bottom:6px; animation:fadeUp 0.8s ease; }
  .subtitle { color:#34d399; font-size:13px; font-weight:700; letter-spacing:3px; text-transform:uppercase; margin-bottom:28px; animation:fadeUp 0.8s 0.2s ease both; }
  .dots { display:flex; gap:10px; animation:fadeUp 0.8s 0.4s ease both; }
  .dot { width:12px; height:12px; border-radius:50%; }
  .d1 { background:#34d399; animation:bounce 1.2s 0s infinite; }
  .d2 { background:#6ee7b7; animation:bounce 1.2s 0.2s infinite; }
  .d3 { background:#a7f3d0; animation:bounce 1.2s 0.4s infinite; }
  .tagline { position:absolute; bottom:18px; color:rgba(255,255,255,0.25); font-size:11px; letter-spacing:1px; animation:fadeUp 1s 0.6s ease both; }
  @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
  @keyframes glow { 0%,100%{box-shadow:0 0 30px rgba(52,211,153,0.2),0 20px 50px rgba(0,0,0,0.4);} 50%{box-shadow:0 0 60px rgba(52,211,153,0.5),0 20px 50px rgba(0,0,0,0.5);} }
  @keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:0.5;} 40%{transform:translateY(-12px);opacity:1;} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
</style>
</head>
<body>
  <div class="bg-circle1"></div>
  <div class="bg-circle2"></div>
  ${logoTag}
  <h1>Obamax Gardens</h1>
  <p class="subtitle">✦ Management System ✦</p>
  <div class="dots"><div class="dot d1"></div><div class="dot d2"></div><div class="dot d3"></div></div>
  <span class="tagline">"Where Every Day Blooms with Excellence"</span>
</body>
</html>`;

    splash.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    return splash;
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        show: false,
        title: 'Obamax Gardens Management System',
        icon: path.join(__dirname, '..', 'public', 'logo.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        backgroundColor: '#051a0c',
    });

    Menu.setApplicationMenu(null);
    mainWindow.loadURL(PRIMARY_APP_URL);

    mainWindow.webContents.on('did-fail-load', () => {
        // Try local artisan server only if Apache URL fails.
        if (mainWindow.webContents.getURL() !== FALLBACK_APP_URL) {
            mainWindow.loadURL(FALLBACK_APP_URL);
            return;
        }
        mainWindow.loadFile(path.join(__dirname, 'error.html'));
    });

    // Ctrl+R and F5 to reload
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if ((input.control && input.key.toLowerCase() === 'r') || input.key === 'F5') {
            mainWindow.loadURL(PRIMARY_APP_URL);
            event.preventDefault();
        }
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    return mainWindow;
}

app.whenReady().then(() => {
    const logoBase64 = getLogoBase64();
    const splash = createSplashWindow(logoBase64);
    const win = createMainWindow();

    win.webContents.once('did-finish-load', () => {
        setTimeout(() => {
            splash.destroy();
            win.show();
            win.focus();
        }, 5000);
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
