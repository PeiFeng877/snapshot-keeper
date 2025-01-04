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
  const location = useLocation();
  const navigate = useNavigate();
  const isDetailWindow = window.location.search.includes('repository=detail');

  const handleMinimize = () => {
    if (isDetailWindow) {
      ipcRenderer.send('window-minimize-detail');
    } else {
      ipcRenderer.send('window-minimize');
    }
  };

  const handleMaximize = () => {
    if (isDetailWindow) {
      ipcRenderer.send('window-maximize-detail');
    } else {
      ipcRenderer.send('window-maximize');
    }
  };

  const handleClose = () => {
    if (isDetailWindow) {
      ipcRenderer.send('window-close-detail');
    } else {
      ipcRenderer.send('window-close');
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ 
        height: '28px', 
        lineHeight: '28px',
        padding: '0 10px', 
        background: '#fff', 
        borderBottom: '1px solid #e8e8e8',
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        WebkitAppRegion: 'drag'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isDetailWindow ? (
            <>
              <Button 
                type="text"
                icon={<HomeOutlined />}
                onClick={handleHome}
                style={{ 
                  WebkitAppRegion: 'no-drag',
                  width: '28px', 
                  height: '28px',
                  marginRight: '8px'
                }}
              />
              <span style={{ fontSize: '12px' }}>仓库详情</span>
            </>
          ) : (
            <>
              <img src={icon} alt="logo" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              <span style={{ fontSize: '12px' }}>云中书</span>
            </>
          )}
        </div>

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
