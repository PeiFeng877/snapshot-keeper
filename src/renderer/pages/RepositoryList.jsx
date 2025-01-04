import React, { useState, useEffect } from 'react';
import { Button, List, Empty, Dropdown, Modal, Input, message } from 'antd';
import { FolderOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { ipcRenderer } = window.require('electron');

function RepositoryList() {
  // 仓库列表数据
  const [repositories, setRepositories] = useState([]);

  // 编辑模态框状态
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRepo, setEditingRepo] = useState(null);
  const [newName, setNewName] = useState('');

  // 添加创建仓库的状态
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newRepository, setNewRepository] = useState({
    name: '',
    path: ''
  });

  // 悬浮按钮状态
  const [isHovered, setIsHovered] = useState(false);

  // 加载仓库列表
  const loadRepositories = async () => {
    try {
      const response = await ipcRenderer.invoke('repository:list');
      if (response.success) {
        setRepositories(response.data);
      } else {
        message.error(response.error || '加载仓库列表失败');
      }
    } catch (error) {
      message.error('加载仓库列表失败');
    }
  };

  // 组件加载时获取仓库列表
  useEffect(() => {
    loadRepositories();
  }, []);

  // 处理选择文件夹
  const handleSelectFolder = async () => {
    try {
      const response = await ipcRenderer.invoke('dialog:selectFolder');
      if (response.success && response.data) {
        const folderPath = response.data;
        const folderName = folderPath.split('\\').pop();
        
        setNewRepository({
          name: folderName,
          path: folderPath
        });
        
        setCreateModalVisible(true);
      }
    } catch (error) {
      message.error('选择文件夹失败');
    }
  };

  // 处理创建仓库
  const handleCreateRepository = async () => {
    try {
      const response = await ipcRenderer.invoke('repository:create', newRepository);
      if (response.success) {
        message.success('创建成功');
        setCreateModalVisible(false);
        loadRepositories();
        setNewRepository({ name: '', path: '' });
      } else {
        message.error(response.error || '创建失败');
      }
    } catch (error) {
      message.error('创建失败');
    }
  };

  // 处理打开详情页
  const handleOpenDetail = (id) => {
    ipcRenderer.invoke('window:openRepository', id);
  };

  // 右键菜单项
  const getContextMenu = (repository) => ({
    items: [
      {
        key: 'edit',
        label: '修改项目名称',
        icon: <EditOutlined />
      },
      {
        type: 'divider'
      },
      {
        key: 'delete',
        label: '删除项目',
        icon: <DeleteOutlined />,
        danger: true
      }
    ],
    onClick: ({ key }) => handleMenuClick(key, repository)
  });

  // 处理右键菜单点击
  const handleMenuClick = async (key, repository) => {
    switch (key) {
      case 'edit':
        setEditingRepo(repository);
        setNewName(repository.name);
        setEditModalVisible(true);
        break;
      case 'delete':
        try {
          const response = await ipcRenderer.invoke('repository:delete', repository.id);
          if (response.success) {
            message.success('删除成功');
            loadRepositories();
          } else {
            message.error(response.error || '删除失败');
          }
        } catch (error) {
          message.error('删除失败');
        }
        break;
    }
  };

  // 处理名称修改
  const handleNameChange = async () => {
    if (editingRepo && newName.trim()) {
      try {
        const response = await ipcRenderer.invoke('repository:update', {
          id: editingRepo.id,
          name: newName.trim()
        });
        
        if (response.success) {
          message.success('修改成功');
          setEditModalVisible(false);
          loadRepositories();
        } else {
          message.error(response.error || '修改失败');
        }
      } catch (error) {
        message.error('修改失败');
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* 创建仓库的模态框 */}
      <Modal
        title="创建仓库"
        open={createModalVisible}
        onOk={handleCreateRepository}
        onCancel={() => {
          setCreateModalVisible(false);
          setNewRepository({ name: '', path: '' });
        }}
      >
        <Input
          value={newRepository.name}
          onChange={e => setNewRepository({ ...newRepository, name: e.target.value })}
          placeholder="仓库名称"
          style={{ marginBottom: '16px' }}
        />
        <Input
          value={newRepository.path}
          disabled
          placeholder="选择文件夹"
        />
      </Modal>

      {/* 编辑名称的模态框 */}
      <Modal
        title="修改项目名称"
        open={editModalVisible}
        onOk={handleNameChange}
        onCancel={() => setEditModalVisible(false)}
      >
        <Input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="请输入新的项目名称"
        />
      </Modal>

      {/* 仓库列表 */}
      {repositories.length === 0 ? (
        <Empty description="暂无仓库" />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={repositories}
          renderItem={item => (
            <Dropdown menu={getContextMenu(item)} trigger={['contextMenu']}>
              <List.Item
                onClick={() => handleOpenDetail(item.id)}
                style={{ 
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
              >
                <List.Item.Meta
                  avatar={<FolderOutlined style={{ fontSize: '32px', color: '#1890ff' }} />}
                  title={item.name}
                  description={item.path}
                />
              </List.Item>
            </Dropdown>
          )}
        />
      )}

      {/* 悬浮按钮 */}
      <Button
        type="primary"
        style={{
          position: 'fixed',
          right: '32px',
          bottom: '32px',
          height: '48px',
          width: isHovered ? '120px' : '48px',
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={handleSelectFolder}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <PlusOutlined style={{ fontSize: '20px' }} />
        <span style={{
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s',
          marginLeft: isHovered ? '8px' : '-8px'
        }}>
          新建仓库
        </span>
      </Button>
    </div>
  );
}

export default RepositoryList;
