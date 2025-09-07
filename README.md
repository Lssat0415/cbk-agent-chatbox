# CBK Agent Chatbox

> 银行智能投顾助手聊天界面 - 一个现代化的React聊天应用，支持实时对话和智能投资建议生成

## 📋 项目概述

这是一个基于React的智能聊天应用，专为银行投顾场景设计。用户可以输入投资需求，系统会生成个性化的投资建议。项目采用现代化的前端技术栈，支持流式响应和智能降级机制。

### 🎯 核心功能
- 💬 **智能对话**: 基于用户需求生成个性化投资建议
- 🔄 **流式响应**: 支持实时流式消息显示，提升用户体验
- 📱 **响应式设计**: 完美适配桌面端和移动端
- 💾 **数据持久化**: 支持localStorage和API双重数据存储
- 🎨 **现代UI**: 简洁美观的用户界面设计

## 🏗️ 技术架构

### 前端技术栈
```
┌─────────────────────────────────────────┐
│               用户界面层                  │
├─────────────────────────────────────────┤
│  React 18 + Vite + Lucide React + CSS3  │
├─────────────────────────────────────────┤
│              业务逻辑层                   │
├─────────────────────────────────────────┤
│    状态管理 + API服务 + 工具函数          │
├─────────────────────────────────────────┤
│              数据存储层                   │
├─────────────────────────────────────────┤
│    localStorage + 远程API + 降级机制     │
└─────────────────────────────────────────┘
```

### 核心技术点

#### 1. **React 18 + Vite**
- **React 18**: 最新版本的React框架，支持并发特性
- **Vite**: 极速的前端构建工具，开发体验优秀
- **Hooks**: 使用useState、useEffect等现代React特性

#### 2. **组件化架构**
```
App.jsx (主应用)
├── Sidebar.jsx (侧边栏 - 对话列表)
├── Chat.jsx (聊天界面)
│   └── Message.jsx (消息组件)
└── Header.jsx (头部组件)
```

#### 3. **状态管理**
- **本地状态**: 使用React Hooks管理组件状态
- **全局状态**: 通过props传递和Context共享
- **持久化**: localStorage + API双重存储

#### 4. **API集成架构**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   流式API       │    │   普通API       │    │   本地处理      │
│  (最佳体验)     │───▶│  (稳定可靠)     │───▶│   (兜底方案)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
   实时流式响应              一次性完整响应           规则生成建议
```

#### 5. **响应式设计**
- **CSS Grid + Flexbox**: 现代布局技术
- **CSS变量**: 主题色彩统一管理
- **媒体查询**: 移动端适配
- **动态视口**: 支持移动端动态视口高度

## 🚀 快速开始

### 环境要求
确保你的开发环境满足以下要求：

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | 16.0+ | JavaScript运行环境 |
| npm | 8.0+ | 包管理器 |
| 现代浏览器 | Chrome 90+, Firefox 88+, Safari 14+ | 支持ES2020+ |

### 安装步骤

#### 1. 克隆项目
```bash
# 使用Git克隆项目
git clone <repository-url>
cd cbk-agent-chatbox

# 或者直接下载ZIP文件并解压
```

#### 2. 安装依赖
```bash
# 安装项目依赖
npm install

# 或者使用yarn
yarn install
```

#### 3. 配置环境变量
创建 `.env` 文件（在项目根目录）：
```env
# API服务器地址
VITE_API_URL=http://localhost:3001/api

# 可选：认证token（如果需要）
# VITE_AUTH_TOKEN=your_token_here
```

#### 4. 启动开发服务器
```bash
# 启动开发服务器
npm run dev

# 或者使用yarn
yarn dev
```

#### 5. 访问应用
打开浏览器访问：`http://localhost:3000`

### 构建生产版本
```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 📁 项目结构详解

```
cbk-agent-chatbox/
├── public/                 # 静态资源
│   └── index.html         # HTML模板
├── src/                   # 源代码目录
│   ├── components/        # React组件
│   │   ├── Chat.jsx      # 聊天界面组件
│   │   ├── Chat.css      # 聊天界面样式
│   │   ├── Message.jsx   # 消息组件
│   │   ├── Message.css   # 消息样式
│   │   ├── Sidebar.jsx   # 侧边栏组件
│   │   ├── Sidebar.css   # 侧边栏样式
│   │   ├── Header.jsx    # 头部组件
│   │   └── Header.css    # 头部样式
│   ├── services/         # API服务层
│   │   └── api.js       # API调用封装
│   ├── utils/           # 工具函数
│   │   └── advisor.js   # 投资建议生成逻辑
│   ├── App.jsx          # 主应用组件
│   ├── App.css          # 主应用样式
│   ├── main.jsx         # 应用入口文件
│   └── index.css        # 全局样式
├── .env.example         # 环境变量示例
├── package.json         # 项目配置
├── vite.config.js       # Vite配置
└── README.md           # 项目说明
```

### 核心文件说明

#### `src/App.jsx` - 主应用组件
- 管理全局状态（对话列表、当前对话等）
- 处理消息发送和接收
- 实现API调用和降级逻辑

#### `src/services/api.js` - API服务层
- 封装所有API调用
- 实现流式响应处理
- 提供统一的错误处理

#### `src/utils/advisor.js` - 投资建议生成
- 解析用户投资需求
- 生成结构化投资建议
- 本地降级处理逻辑

#### `src/components/` - 组件目录
- **Chat.jsx**: 聊天界面，处理消息输入和显示
- **Message.jsx**: 消息组件，支持多种消息类型
- **Sidebar.jsx**: 侧边栏，显示对话列表
- **Header.jsx**: 头部组件，显示应用标题

## 🔧 开发指南

### 开发环境设置

#### 1. 代码编辑器推荐
- **VS Code**: 推荐使用，配合以下插件：
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Auto Rename Tag
  - Bracket Pair Colorizer

#### 2. 开发工具
```bash
# 安装开发依赖
npm install -D eslint prettier

# 代码格式化
npm run format

# 代码检查
npm run lint
```

### 添加新功能

#### 1. 添加新的消息类型
```javascript
// 在 Message.jsx 中添加新的消息类型
const renderContent = () => {
  if (message.isThinking) {
    return <ThinkingMessage />;
  }
  
  if (message.isStreaming) {
    return <StreamingMessage />;
  }
  
  // 添加新的消息类型
  if (message.isCustom) {
    return <CustomMessage />;
  }
  
  return <DefaultMessage />;
};
```

#### 2. 扩展API功能
```javascript
// 在 services/api.js 中添加新方法
class ConversationAPI {
  async newFeature(data) {
    const response = await fetch(`${API_BASE_URL}/new-feature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
}
```

#### 3. 自定义样式主题
```css
/* 在 src/index.css 中修改CSS变量 */
:root {
  --primary: #3b82f6;        /* 主色调 */
  --secondary: #64748b;      /* 次要色调 */
  --background: #ffffff;     /* 背景色 */
  --text: #1e293b;          /* 文字色 */
  --border: #e2e8f0;        /* 边框色 */
  --sidebar-bg: #f8fafc;    /* 侧边栏背景 */
}
```

## 🎨 样式系统

### CSS架构
- **CSS变量**: 统一的主题色彩管理
- **模块化样式**: 每个组件独立的CSS文件
- **响应式设计**: 移动端优先的设计理念
- **现代布局**: Grid + Flexbox布局

### 主题定制
```css
/* 深色主题示例 */
[data-theme="dark"] {
  --background: #1e293b;
  --text: #f1f5f9;
  --sidebar-bg: #334155;
  --border: #475569;
}
```

## 🚀 部署指南

### 静态部署
```bash
# 构建生产版本
npm run build

# 部署到静态服务器
# 将 dist/ 目录上传到服务器
```

### Docker部署
```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔍 潜在增强点

### 1. 功能增强
- [ ] **用户认证系统**: 添加登录/注册功能
- [ ] **多语言支持**: 国际化(i18n)支持
- [ ] **主题切换**: 深色/浅色主题切换
- [ ] **消息搜索**: 对话历史搜索功能
- [ ] **文件上传**: 支持图片/文档上传
- [ ] **语音输入**: 语音转文字功能
- [ ] **消息导出**: 支持PDF/Word导出

### 2. 技术优化
- [ ] **状态管理**: 集成Redux/Zustand
- [ ] **类型安全**: 添加TypeScript支持
- [ ] **测试覆盖**: 单元测试和集成测试
- [ ] **性能优化**: 虚拟滚动、懒加载
- [ ] **PWA支持**: 离线使用能力
- [ ] **WebSocket**: 实时双向通信

### 3. 用户体验
- [ ] **快捷键支持**: 键盘快捷键操作
- [ ] **拖拽功能**: 文件拖拽上传
- [ ] **消息编辑**: 支持消息编辑和删除
- [ ] **表情包**: 表情符号支持
- [ ] **消息模板**: 常用消息模板
- [ ] **智能提示**: 输入自动补全

### 4. 开发体验
- [ ] **代码规范**: ESLint + Prettier配置
- [ ] **Git Hooks**: 提交前代码检查
- [ ] **CI/CD**: 自动化部署流程
- [ ] **文档生成**: 自动生成API文档
- [ ] **错误监控**: 集成错误追踪系统

## 📚 学习资源

### 技术栈学习
- [React官方文档](https://react.dev/)
- [Vite官方文档](https://vitejs.dev/)
- [CSS Grid指南](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox指南](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

### 项目相关
- [API规范文档](./API_SPECIFICATION.md)
- [API集成说明](./API_INTEGRATION.md)

## 🤝 贡献指南

### 如何贡献
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 代码规范
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循React最佳实践
- 添加必要的注释和文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持与反馈

- 🐛 **Bug报告**: 请提交Issue
- 💡 **功能建议**: 欢迎提出改进建议
- 📧 **联系邮箱**: [your-email@example.com]
- 💬 **讨论区**: 项目GitHub Discussions

---

**开始你的开发之旅吧！** 🚀 这个项目是学习现代React开发的绝佳示例，包含了状态管理、API集成、响应式设计等核心概念。
