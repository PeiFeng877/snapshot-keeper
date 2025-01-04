import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';

// 创建 React 根节点
const root = ReactDOM.createRoot(document.getElementById('root'));

// 渲染应用
root.render(
    <ConfigProvider locale={zhCN}>
        <App />
    </ConfigProvider>
); 