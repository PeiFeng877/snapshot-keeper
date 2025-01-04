import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Button } from 'antd';
import { MinusOutlined, BorderOutlined, CloseOutlined, HomeOutlined } from '@ant-design/icons';
import RepositoryList from './pages/RepositoryList';
import RepositoryDetail from './pages/RepositoryDetail';
import icon from './assets/favicon.ico';

const { Header, Content } = Layout;
const { ipcRenderer } = window.require('electron');

function App() {
  // 获取路由相关的 hooks
  const location = useLocation();
  const navigate = useNavigate();

  // 通过 URL search 参数判断窗口类型
  const isDetailWindow = window.location.search.includes('repository=detail');

  /**
   * 处理窗口最小化
   * 根据窗口类型发送不同的最小化事件
   */
  const handleMinimize = () => {
    if (isDetailWindow) {
      ipcRenderer.send('window-minimize-detail');
    } else {
      ipcRenderer.send('window-minimize');
    }
  };

  /**
   * 处理窗口最大化/还原
   * 根据窗口类型发送不同的最大化事件
   */
  const handleMaximize = () => {
    if (isDetailWindow) {
      ipcRenderer.send('window-maximize-detail');
    } else {
      ipcRenderer.send('window-maximize');
    }
  };

  /**
   * 处理窗口关闭
   * 详情窗口：只关闭当前窗口
   * 主窗口：可能触发应用退出
   */
  const handleClose = () => {
    if (isDetailWindow) {
      ipcRenderer.send('window-close-detail');
    } else {
      ipcRenderer.send('window-close');
    }
  };

  /**
   * 处理返回主页
   * 通过路由导航回到仓库列表页
   */
  const handleHome = () => {
    navigate('/');
  };

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
        {/* 左侧区域：根据窗口类型显示不同内容 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isDetailWindow ? (
            // 详情窗口：显示主页图标和标题
            <>
              <Button 
                type="text"
                icon={<HomeOutlined />}
                onClick={handleHome}
                style={{ 
                  WebkitAppRegion: 'no-drag',  // 按钮区域不可拖动
                  width: '28px', 
                  height: '28px',
                  marginRight: '8px'
                }}
              />
              <span style={{ fontSize: '12px' }}>仓库详情</span>
            </>
          ) : (
            // 主窗口：显示应用图标和名称
            <>
              <img src={icon} alt="logo" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              <span style={{ fontSize: '12px' }}>云中书</span>
            </>
          )}
        </div>

        {/* 右侧窗口控制按钮 */}
        <div style={{ WebkitAppRegion: 'no-drag', display: 'flex' }}> 
          {/* 最小化按钮 */}
          <Button 
            type="text" 
            size="small" 
            icon={<MinusOutlined />} 
            onClick={handleMinimize}
            style={{ width: '28px', height: '28px' }}
          />
          {/* 最大化/还原按钮 */}
          <Button 
            type="text" 
            size="small" 
            icon={<BorderOutlined />} 
            onClick={handleMaximize}
            style={{ width: '28px', height: '28px' }}
          />
          {/* 关闭按钮 */}
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

      {/* 主内容区：路由配置 */}
      <Content>
        <Routes>
          <Route path="/" element={<RepositoryList />} />
          <Route path="/repository/:id" element={<RepositoryDetail />} />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
