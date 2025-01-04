import React, { useState } from 'react';
import { Button, List, Empty, Dropdown, Modal, Input } from 'antd';
import { FolderOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

function RepositoryList() {
  // 仓库列表数据
  const [repositories, setRepositories] = useState([
    {
      name: 'Mars Here I Come',
      path: 'D:\\Milky Way\\Solar System\\Mars Here I Come',
      updateTime: '2024-06-27 17:04',
      icon: null
    }
  ]);

  // 编辑模态框状态
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRepo, setEditingRepo] = useState(null);
  const [newName, setNewName] = useState('');

  // 处理创建新仓库
  const handleCreateRepository = () => {
    const newRepo = {
      name: `仓库 ${repositories.length + 1}`,
      path: '/path/to/repo',
      updateTime: new Date().toLocaleString()
    };
    setRepositories([...repositories, newRepo]);
  };

  // 处理右键菜单点击
  const handleMenuClick = (key, repository) => {
    switch (key) {
      case 'edit':
        // 打开编辑模态框
        setEditingRepo(repository);
        setNewName(repository.name);
        setEditModalVisible(true);
        break;
      case 'delete':
        // 删除项目
        setRepositories(repositories.filter(repo => repo.name !== repository.name));
        break;
    }
  };

  // 处理名称修改
  const handleNameChange = () => {
    if (editingRepo && newName.trim()) {
      setRepositories(repositories.map(repo => 
        repo.name === editingRepo.name 
          ? { ...repo, name: newName.trim() } 
          : repo
      ));
      setEditModalVisible(false);
    }
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

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#fff',
      height: '100%'
    }}>
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

      {repositories.length === 0 ? (
        // 空状态显示
        <div style={{ textAlign: 'center', marginTop: '20%' }}>
          <Empty description="暂无仓库">
            <Button type="primary" onClick={handleCreateRepository}>
              新建仓库
            </Button>
          </Empty>
        </div>
      ) : (
        <div>
          {/* 修改表头，移除分组标签 */}
          <div style={{
            display: 'flex',
            padding: '0 16px 16px 16px',
            borderBottom: '1px solid #f0f0f0',
            color: '#999'
          }}>
            <div style={{ flex: 1 }}>项目名称</div>
            <div style={{ width: '200px', textAlign: 'right' }}>更新时间</div>
          </div>

          {/* 修改列表项，添加右键菜单 */}
          <List
            itemLayout="horizontal"
            dataSource={repositories}
            renderItem={item => (
              <Dropdown
                menu={getContextMenu(item)}
                trigger={['contextMenu']}
              >
                <List.Item
                  style={{ 
                    padding: '16px', 
                    borderRadius: '8px', 
                    marginBottom: '8px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',  // 添加鼠标指针样式
                    transition: 'background-color 0.3s',  // 添加过渡效果
                    ':hover': {
                      backgroundColor: '#f5f5f5'  // 鼠标悬停效果
                    }
                  }}
                  actions={[
                    <span style={{ color: '#999', width: '200px', textAlign: 'right' }}>{item.updateTime}</span>
                  ]}
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
        </div>
      )}
    </div>
  );
}

export default RepositoryList;
