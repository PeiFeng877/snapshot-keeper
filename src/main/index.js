// 从 electron 包中引入 app 和 BrowserWindow 模块
// app 模块控制应用程序的事件生命周期
// BrowserWindow 模块创建和管理应用程序窗口
const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron')

// 引入 Node.js 的 path 模块，用于处理文件和目录的路径
const path = require('path')

let mainWindow;

// 创建窗口的函数
function createWindow() {
    // 创建一个新的浏览器窗口
    mainWindow = new BrowserWindow({
        width: 1200,  // 窗口宽度
        height: 800, // 窗口高度
        frame: false,  // 去掉默认的标题栏
        webPreferences: {
            // 允许在渲染进程中使用 Node.js API
            nodeIntegration: true,
            // 禁用上下文隔离
            // 注意：在生产环境中，建议启用上下文隔离以提高安全性
            contextIsolation: false
        }
    })

    // 加载应用的 index.html
    // __dirname 是当前文件所在目录的路径
    // path.join 用于拼接路径
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    
    // 默认打开开发者工具
    mainWindow.webContents.openDevTools()

    // 添加刷新快捷键 (Ctrl+R 或 Command+R)
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.control && input.key.toLowerCase() === 'r' || 
            input.meta && input.key.toLowerCase() === 'r') {
            mainWindow.reload()
        }
    })

    // 处理窗口控制事件
    ipcMain.on('window-minimize', () => {
        mainWindow.minimize()
    })

    ipcMain.on('window-maximize', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.restore()
        } else {
            mainWindow.maximize()
        }
    })

    ipcMain.on('window-close', () => {
        mainWindow.close()
    })
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
// 某些 API 只能在此事件发生后才能使用
app.whenReady().then(() => {
    createWindow();

    // 注册 F12 快捷键来打开/关闭开发者工具
    const ret = globalShortcut.register('F12', () => {
        console.log('F12 was pressed');  // 添加日志
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.toggleDevTools();
        }
    });

    if (!ret) {
        console.log('F12 registration failed');  // 检查注册是否成功
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// 当所有窗口都被关闭时退出应用
app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出
    // 否则绝大部分应用及其菜单栏会保持激活
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// 在开发模式下监听文件变化
if (process.env.NODE_ENV === 'development') {
    require('electron-reload')(__dirname, {
        electron: require('electron')
    })
} 

// 添加快捷键清理
app.on('will-quit', () => {
    // 注销所有快捷键
    globalShortcut.unregisterAll();
}); 