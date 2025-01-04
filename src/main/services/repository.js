// 使用 CommonJS 的导入
const path = require('path');
const fs = require('fs');

// 异步初始化 Store
let store;
async function initStore() {
    const Store = (await import('electron-store')).default;
    store = new Store({
        name: 'repositories',
        defaults: {
            repositories: []
        }
    });
}

// 初始化 store
initStore();

/**
 * 生成唯一的仓库ID
 * 格式：repo_时间戳
 */
function generateRepositoryId() {
    return `repo_${Date.now()}`;
}

/**
 * 验证仓库信息
 * @param {string} name - 仓库名称
 * @param {string} folderPath - 文件夹路径
 */
async function validateRepository(name, folderPath) {
    // 验证名称
    if (!name || name.trim() === '') {
        throw new Error('仓库名称不能为空');
    }

    // 验证路径
    if (!folderPath || folderPath.trim() === '') {
        throw new Error('文件夹路径不能为空');
    }

    // 验证文件夹是否存在
    if (!fs.existsSync(folderPath)) {
        throw new Error('文件夹不存在');
    }

    // 验证路径是否已被使用
    const repositories = await store.get('repositories');
    if (repositories.some(repo => repo.path === folderPath)) {
        throw new Error('该文件夹已被其他仓库使用');
    }
}

/**
 * 创建新仓库
 * @param {string} name - 仓库名称
 * @param {string} folderPath - 文件夹路径
 */
async function createRepository(name, folderPath) {
    try {
        // 验证输入信息
        await validateRepository(name, folderPath);
        
        // 创建仓库对象
        const now = new Date().toISOString();
        const repository = {
            id: generateRepositoryId(),
            name: name.trim(),
            path: folderPath,
            createTime: now,
            updateTime: now,
            lastSnapshotTime: null,
            snapshotCount: 0,
            activeSnapshotId: null
        };

        // 获取现有仓库列表
        const repositories = await store.get('repositories');
        
        // 添加新仓库
        repositories.push(repository);
        
        // 保存更新后的列表
        await store.set('repositories', repositories);

        return repository;
    } catch (error) {
        throw error;
    }
}

/**
 * 获取所有仓库列表
 */
async function getRepositories() {
    return store.get('repositories');
}

/**
 * 删除仓库
 * @param {string} id - 仓库ID
 */
async function deleteRepository(id) {
    const repositories = await store.get('repositories');
    const newRepositories = repositories.filter(repo => repo.id !== id);
    await store.set('repositories', newRepositories);
}

// 添加更新仓库函数
async function updateRepository(id, updates) {
    const repositories = await store.get('repositories');
    const index = repositories.findIndex(repo => repo.id === id);
    
    if (index === -1) {
        throw new Error('仓库不存在');
    }

    repositories[index] = {
        ...repositories[index],
        ...updates,
        updateTime: new Date().toISOString()
    };

    await store.set('repositories', repositories);
}

// 导出函数
module.exports = {
    createRepository,
    getRepositories,
    deleteRepository,
    updateRepository
}; 