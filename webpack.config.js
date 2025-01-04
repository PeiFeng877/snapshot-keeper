// 引入 Node.js 的路径处理模块
const path = require('path');

// 导出 webpack 配置对象
module.exports = {
    // 设置为开发模式，不会压缩代码，方便调试
    mode: 'development',
    
    // 指定打包的入口文件，webpack 从这里开始构建
    entry: './src/renderer/index.jsx',
    
    // 配置打包后文件的输出位置和命名
    output: {
        // 输出目录，使用绝对路径
        path: path.resolve(__dirname, 'dist'),
        // 打包后的文件名
        filename: 'renderer.js',
    },
    
    // 配置模块处理规则
    module: {
        rules: [
            // 处理 JSX 和 JavaScript 文件的规则
            {
                test: /\.jsx?$/,              // 匹配 .js 和 .jsx 文件
                exclude: /node_modules/,       // 排除 node_modules 目录
                use: {
                    loader: 'babel-loader',    // 使用 babel 转换代码
                    options: {
                        // 配置 babel 预设，转换 React 和新版 JS 语法
                        presets: ['@babel/preset-react', '@babel/preset-env']
                    }
                }
            },
            // 处理 CSS 文件的规则
            {
                test: /\.css$/,               // 匹配 .css 文件
                use: [
                    'style-loader',           // 将 CSS 注入到 DOM 中
                    'css-loader'              // 解析 CSS 文件
                ]
            },
            {
                test: /\.(ico|png|jpg|jpeg|gif)$/i,
                type: 'asset/resource'  // 使用资源模块处理图片文件
            }
        ]
    },
    
    // 配置模块如何解析
    resolve: {
        // 自动解析这些扩展名的文件，引入时可以省略扩展名
        extensions: ['.js', '.jsx', '.json']
    }
}; 