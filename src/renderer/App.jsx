import React from 'react';
import { Layout, Button } from 'antd';
import { MinusOutlined, BorderOutlined, CloseOutlined } from '@ant-design/icons';
import RepositoryList from './pages/RepositoryList';
import icon from './assets/favicon.ico';

const { Header, Content } = Layout;
const { ipcRenderer } = window.require('electron');

function App() {
  // 窗口控制函数
  const handleMinimize = () => ipcRenderer.send('window-minimize');
  const handleMaximize = () => ipcRenderer.send('window-maximize');
  const handleClose = () => ipcRenderer.send('window-close');

  return (
    <Layout style={{ height: '100vh' }}>
      {/* 自定义标题栏 */}
      <Header style={{ 
        height: '28px', 
        lineHeight: '28px',
        padding: '0 10px', 
        background: '#fff', 
        borderBottom: '1px solid #e8e8e8',
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        WebkitAppRegion: 'drag' // 使标题栏可拖动
      }}>
        {/* 左侧产品信息 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={icon} alt="logo" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
          <span style={{ fontSize: '12px' }}>云中书</span>
        </div>

        {/* 右侧窗口控制按钮 */}
        <div style={{ WebkitAppRegion: 'no-drag', display: 'flex' }}> 
          <Button 
            type="text" 
            size="small" 
            icon={<MinusOutlined />} 
            onClick={handleMinimize}
            style={{ width: '28px', height: '28px' }}
          />
          <Button 
            type="text" 
            size="small" 
            icon={<BorderOutlined />} 
            onClick={handleMaximize}
            style={{ width: '28px', height: '28px' }}
          />
          <Button 
            type="text" 
            size="small" 
            icon={<CloseOutlined />} 
            onClick={handleClose}
            style={{ width: '28px', height: '28px' }}
            className="close-button"
          />
        </div>
      </Header>

      {/* 主内容区 */}
      <Content>
        <RepositoryList />
      </Content>
    </Layout>
  );
}

export default App;
