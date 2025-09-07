# API集成说明

## 概述
已成功将侧边栏数据源从纯localStorage改为API + localStorage混合模式，提供更好的数据同步和用户体验。

## 主要变更

### 1. 新增文件
- `src/services/api.js` - API服务类，处理所有对话相关的API调用

### 2. 修改文件
- `src/App.jsx` - 集成API调用，添加加载状态管理
- `src/components/Sidebar.jsx` - 支持loading状态显示
- `src/components/Sidebar.css` - 添加loading动画样式

## 功能特性

### API集成
- **混合模式**: API优先，localStorage作为缓存和降级方案
- **错误处理**: API失败时自动降级到localStorage
- **异步同步**: 非阻塞式API同步，不影响用户体验

### 消息处理
- **流式响应**: 支持实时流式消息显示（可选）
- **智能降级**: 流式API失败时自动降级到普通API
- **本地回退**: API完全失败时使用本地规则生成回复
- **实时显示**: 流式消息带有闪烁光标效果
- **状态管理**: 自动清理流式状态，防止光标持续闪烁

### 加载状态
- **加载指示器**: 显示旋转的loading图标
- **状态管理**: 区分加载中和已加载状态
- **用户反馈**: 清晰的"加载对话中..."提示
- **思考状态**: 消息发送时显示"正在分析"动画

### 数据流
1. **启动时**: 尝试从API加载对话列表
2. **API成功**: 显示API数据，更新localStorage缓存
3. **API失败**: 降级到localStorage数据
4. **数据变更**: 同时更新localStorage和API
5. **删除操作**: 先删除API数据，再更新本地状态

### 消息流
1. **用户发送**: 立即显示用户消息和思考状态
2. **流式尝试**: 优先尝试流式API响应
3. **流式成功**: 实时显示API回复内容
4. **流式失败**: 降级到普通API调用
5. **API失败**: 使用本地规则生成回复
6. **完成显示**: 移除思考状态，显示最终回复

## 配置说明

### 环境变量
创建 `.env` 文件并配置：
```env
VITE_API_URL=http://localhost:3001/api
```

**注意**: 由于项目使用Vite构建工具，环境变量必须以 `VITE_` 前缀开头才能在客户端代码中访问。

#### 环境变量说明
- `VITE_API_URL`: API服务器的基础URL，默认为 `http://localhost:3001/api`
- 其他环境变量（如认证token）可以通过代码中的 `import.meta.env` 访问

### API端点
API服务期望以下端点：

#### 对话管理
- `GET /api/conversations` - 获取对话列表
- `POST /api/conversations` - 创建/更新对话
- `PUT /api/conversations/:id` - 更新特定对话
- `DELETE /api/conversations/:id` - 删除特定对话

#### 消息处理
- `POST /api/conversations/:id/messages` - 发送消息并获取回复
- `POST /api/conversations/:id/messages/stream` - 流式发送消息（可选）
- `GET /api/conversations/:id/messages/:messageId/response` - 获取特定消息的回复

### 认证
当前使用Bearer Token认证，token从localStorage的`auth_token`键获取。

## 使用方式

### 开发环境
1. 确保后端API服务运行在配置的URL
2. 设置认证token（如果需要）：
   ```javascript
   localStorage.setItem('auth_token', 'your_token_here')
   ```

### 生产环境
1. 设置正确的API URL环境变量
2. 配置适当的认证机制
3. 确保API服务可用性

## 降级机制
当API不可用时，系统会自动：
1. 显示localStorage中的缓存数据
2. 在控制台记录错误信息
3. 继续使用localStorage进行数据持久化
4. 用户操作不受影响

## 注意事项
- API调用是异步的，不会阻塞UI
- localStorage始终作为备份数据源
- 删除操作会同时尝试API和本地删除
- 加载状态只在初始加载时显示
