// 从 electron 包中引入 app 和 BrowserWindow 模块
// app 模块控制应用程序的事件生命周期
// BrowserWindow 模块创建和管理应用程序窗口
const { app, BrowserWindow, ipcMain, globalShortcut, dialog } = require('electron')

// 引入 Node.js 的 path 模块，用于处理文件和目录的路径
const path = require('path')

// 添加仓库服务的引用
const { createRepository, getRepositories, deleteRepository } = require('./services/repository');

let mainWindow;
const detailWindows = new Set();  // 用于管理所有详情窗口

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

    // 处理窗口关闭
    ipcMain.on('window-close', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win) {
            win.close();
        }
    });
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
    if (process.platform !== 'darwin' && detailWindows.size === 0) {
        app.quit();
    }
});

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

/**
 * 处理创建仓库的 IPC 请求
 */
ipcMain.handle('repository:create', async (event, { name, path }) => {
    try {
        // 调用仓库服务创建新仓库（添加 await）
        const repository = await createRepository(name, path);
        
        return {
            success: true,
            data: repository
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
});

/**
 * 处理获取仓库列表的 IPC 请求
 */
ipcMain.handle('repository:list', async () => {
    try {
        // 调用仓库服务获取所有仓库（添加 await）
        const repositories = await getRepositories();
        
        return {
            success: true,
            data: repositories
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
});

/**
 * 处理选择文件夹的 IPC 请求
 * 打开系统文件夹选择对话框
 * 返回格式：
 * - success: 是否成功
 * - data: 选中的文件夹路径（成功时）
 * - error: 错误信息（失败时）
 */
ipcMain.handle('dialog:selectFolder', async () => {
    try {
        // 打开文件夹选择对话框
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],  // 只允许选择文件夹
            title: '选择文件夹',  // 对话框标题
            buttonLabel: '选择此文件夹'  // 确认按钮文本
        });

        // 用户取消选择
        if (result.canceled) {
            return {
                success: true,
                data: null
            };
        }

        // 返回选中的文件夹路径
        return {
            success: true,
            data: result.filePaths[0]  // 返回第一个选中的路径
        };
    } catch (error) {
        // 发生错误
        return {
            success: false,
            error: error.message || '选择文件夹失败'
        };
    }
}); 

// 添加删除仓库的处理器
ipcMain.handle('repository:delete', async (event, id) => {
    try {
        await deleteRepository(id);
        return {
            success: true
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}); 

// 添加详情窗口的最小化和最大化处理
ipcMain.on('window-minimize-detail', (event) => {
    // 从事件中获取发送请求的窗口实例
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        win.minimize();  // 最小化当前窗口
    }
});

ipcMain.on('window-maximize-detail', (event) => {
    // 从事件中获取发送请求的窗口实例
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        // 根据当前状态切换最大化/还原
        if (win.isMaximized()) {
            win.restore();  // 如果已最大化，则还原
        } else {
            win.maximize();  // 如果未最大化，则最大化
        }
    }
});

// 处理窗口关闭
ipcMain.on('window-close', (event) => {
    // 从事件中获取发送请求的窗口实例
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        win.close();  // 关闭当前窗口
    }
});

// 处理详情窗口关闭
ipcMain.on('window-close-detail', (event) => {
    // 从事件中获取发送请求的窗口实例
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        win.close();  // 关闭当前详情窗口
    }
});

// 创建仓库详情窗口的处理器
ipcMain.handle('window:openRepository', async (event, id) => {
    const detailWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        frame: false,  // 无边框窗口
        webPreferences: {
            nodeIntegration: true,  // 启用 Node.js 集成
            contextIsolation: false  // 禁用上下文隔离
        }
    });

    // 默认打开开发者工具
    detailWindow.webContents.openDevTools();

    // 将窗口添加到管理集合
    detailWindows.add(detailWindow);

    // 当窗口关闭时从集合中移除
    detailWindow.on('closed', () => {
        detailWindows.delete(detailWindow);
    });

    // 加载页面时添加窗口类型标记
    detailWindow.loadFile(
        path.join(__dirname, '../renderer/index.html'),
        { 
            search: 'repository=detail',  // 添加窗口类型标记
            hash: `/repository/${id}`     // 路由参数
        }
    );
}); 