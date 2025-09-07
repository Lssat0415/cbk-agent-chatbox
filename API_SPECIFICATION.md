# Conversation APIs 请求格式规范

## 基础信息

- **Base URL**: `http://localhost:3001/api` (可通过 `VITE_API_URL` 环境变量配置)
- **认证方式**: Bearer Token
- **Content-Type**: `application/json`
- **字符编码**: UTF-8

## 认证

所有API请求都需要在请求头中包含认证token：

```http
Authorization: Bearer <your_auth_token>
```

Token可以通过以下方式获取：
```javascript
localStorage.getItem('auth_token')
```

## API端点规范

### 1. 获取对话列表

**请求**
```http
GET /api/conversations
Authorization: Bearer <token>
Content-Type: application/json
```

**响应**
```json
[
  {
    "id": "1703123456789",
    "title": "投资咨询对话",
    "messages": [
      {
        "role": "assistant",
        "content": "您好，我是银行智能投顾助手...",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 2. 创建/保存对话

**请求**
```http
POST /api/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "1703123456789",
  "title": "投资咨询对话",
  "messages": [
    {
      "role": "assistant",
      "content": "您好，我是银行智能投顾助手...",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**响应**
```json
{
  "id": "1703123456789",
  "title": "投资咨询对话",
  "messages": [...],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 3. 更新对话

**请求**
```http
PUT /api/conversations/{conversationId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "1703123456789",
  "title": "更新后的对话标题",
  "messages": [...],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**响应**
```json
{
  "id": "1703123456789",
  "title": "更新后的对话标题",
  "messages": [...],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 4. 删除对话

**请求**
```http
DELETE /api/conversations/{conversationId}
Authorization: Bearer <token>
```

**响应**
```http
HTTP/1.1 204 No Content
```

### 5. 发送消息 (Chat功能核心API)

#### 5.1 普通消息发送

**请求**
```http
POST /api/conversations/{conversationId}/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "user",
  "content": "我偏好稳健，理财期限3年，目标年化4%，预算20万元",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**请求参数说明**
- `conversationId`: 对话ID (路径参数)
- `role`: 消息角色，固定为 "user"
- `content`: 用户输入的消息内容 (字符串)
- `timestamp`: 消息时间戳 (ISO 8601格式)

**响应**
```json
{
  "content": {
    "recommendations": [
      {
        "title": "综合资产配置方案",
        "summary": "按风险与期限给出现金/固收/权益的基准比例",
        "lines": [
          "目标风险：稳健；投资期限：3年",
          "偏好主题：教育金；预算：20万元"
        ],
        "table": [
          ["现金及货币类", "20%", "应急/流动性管理"],
          ["债券/固收+", "55%", "稳健收益基石"],
          ["股票/权益类", "25%", "中长期增值来源"]
        ]
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**响应格式说明**
- `content`: 可以是字符串或结构化对象
  - 字符串: 简单文本回复
  - 对象: 包含 `recommendations` 数组的结构化投资建议
- `timestamp`: 回复生成时间

#### 5.2 客户端处理流程

**发送前处理**
1. 验证消息内容不为空
2. 获取当前对话ID
3. 设置消息发送状态 (`isMessageSending = true`)
4. 立即显示用户消息到界面
5. 显示"正在分析"思考状态

**发送请求**
```javascript
// 客户端发送逻辑
const userMessage = {
  role: 'user',
  content: text,  // 用户输入的文本
  timestamp: new Date().toISOString()
}

// 更新对话标题（如果是第一条用户消息）
let updatedTitle = currentConv.title
if (currentConv.messages.length === 1 && currentConv.title === '新对话') {
  updatedTitle = text.length > 20 ? text.substring(0, 20) + '...' : text
}

// 添加思考状态消息
const thinkingMessage = {
  role: 'assistant',
  content: 'thinking',
  timestamp: new Date().toISOString(),
  isThinking: true
}
```

**响应处理**
1. 移除思考状态消息
2. 添加AI回复消息
3. 更新对话标题
4. 清除消息发送状态

#### 5.3 错误处理与降级

**API调用失败时的降级策略**
```javascript
try {
  // 尝试API调用
  const apiResponse = await conversationAPI.sendMessage(conversationId, text)
  // 处理API响应...
} catch (error) {
  // 降级到本地处理
  const intel = parseUserIntent(text)
  const advice = generateAdvice(intel)
  // 使用本地生成的建议...
}
```

**本地处理规则**
- 使用 `parseUserIntent()` 解析用户意图
- 使用 `generateAdvice()` 生成投资建议
- 保持与API响应相同的数据结构

### 6. 流式发送消息 (实时响应)

#### 6.1 流式消息请求

**请求**
```http
POST /api/conversations/{conversationId}/messages/stream
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "user",
  "content": "我偏好稳健，理财期限3年，目标年化4%，预算20万元",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**请求参数**
- 与普通消息发送相同
- 使用 `/stream` 端点进行流式响应

#### 6.2 流式响应格式

**响应头**
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Cache-Control
```

**响应体** (Server-Sent Events)
```http
data: {"content": "根据您的需求"}

data: {"content": "，我为您制定"}

data: {"content": "以下投资方案："}

data: {"content": "..."}

data: [DONE]
```

#### 6.3 客户端流式处理

**流式消息处理逻辑**
```javascript
// 创建流式消息对象
const streamingMessage = {
  role: 'assistant',
  content: '',
  timestamp: new Date().toISOString(),
  isAdvice: true,
  isStreaming: true
}

// 流式响应处理
await conversationAPI.sendMessageWithStream(
  conversationId, 
  text, 
  (chunk) => {
    streamedContent += chunk
    // 实时更新消息内容
    setConversations(prev =>
      prev.map(conv =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: conv.messages.map(msg => 
                msg.isStreaming 
                  ? { ...msg, content: streamedContent }
                  : msg
              )
            }
          : conv
      )
    )
  }
)

// 标记流式完成
setConversations(prev =>
  prev.map(conv =>
    conv.id === currentConversationId
      ? {
          ...conv,
          messages: conv.messages.map(msg => 
            msg.isStreaming 
              ? { ...msg, isStreaming: false }
              : msg
          )
        }
      : conv
  )
)
```

#### 6.4 流式降级机制

**三层降级策略**
1. **流式API优先**: 尝试流式响应获得最佳体验
2. **普通API备选**: 流式失败时降级到普通API
3. **本地处理兜底**: API完全失败时使用本地规则

```javascript
try {
  // 尝试流式API
  await conversationAPI.sendMessageWithStream(conversationId, text, onChunk)
} catch (streamError) {
  // 降级到普通API
  const apiResponse = await conversationAPI.sendMessage(conversationId, text)
} catch (error) {
  // 降级到本地处理
  const intel = parseUserIntent(text)
  const advice = generateAdvice(intel)
}
```

### 7. 获取消息回复

**请求**
```http
GET /api/conversations/{conversationId}/messages/{messageId}/response
Authorization: Bearer <token>
Content-Type: application/json
```

**响应**
```json
{
  "content": {
    "recommendations": [...]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 数据模型

### Conversation 对象
```typescript
interface Conversation {
  id: string;                    // 对话唯一标识
  title: string;                 // 对话标题
  messages: Message[];           // 消息列表
  createdAt: string;            // 创建时间 (ISO 8601)
  updatedAt?: string;           // 更新时间 (ISO 8601)
}
```

### Message 对象
```typescript
interface Message {
  role: 'user' | 'assistant';   // 消息角色
  content: string | object;     // 消息内容
  timestamp: string;            // 时间戳 (ISO 8601)
  isAdvice?: boolean;          // 是否为投资建议
  isThinking?: boolean;        // 是否为思考状态
  isStreaming?: boolean;       // 是否为流式消息
}
```

### Chat功能状态管理

#### 消息状态类型
```typescript
interface MessageStates {
  // 用户消息
  user: {
    role: 'user';
    content: string;
    timestamp: string;
  };
  
  // 思考状态消息
  thinking: {
    role: 'assistant';
    content: 'thinking';
    timestamp: string;
    isThinking: true;
  };
  
  // 流式消息
  streaming: {
    role: 'assistant';
    content: string;  // 逐步累积的内容
    timestamp: string;
    isAdvice: true;
    isStreaming: true;
  };
  
  // 最终回复消息
  final: {
    role: 'assistant';
    content: string | AdviceObject;
    timestamp: string;
    isAdvice: true;
  };
}
```

#### 状态转换流程
```
用户输入 → 用户消息 → 思考状态 → 流式消息 → 最终消息
    ↓           ↓         ↓         ↓         ↓
  验证内容   立即显示   显示动画   实时更新   完成显示
```

### Advice 对象
```typescript
interface Advice {
  recommendations: Recommendation[];
}

interface Recommendation {
  title: string;               // 建议标题
  summary: string;             // 建议摘要
  lines?: string[];           // 详细说明
  table?: string[][];         // 配置表格
}
```

## 错误处理

### 标准错误响应
```json
{
  "error": {
    "code": "CONVERSATION_NOT_FOUND",
    "message": "对话不存在",
    "details": "Conversation with id '123' not found"
  }
}
```

### HTTP状态码
- `200 OK` - 请求成功
- `201 Created` - 资源创建成功
- `204 No Content` - 删除成功
- `400 Bad Request` - 请求参数错误
- `401 Unauthorized` - 认证失败
- `403 Forbidden` - 权限不足
- `404 Not Found` - 资源不存在
- `500 Internal Server Error` - 服务器内部错误

## 使用示例

### Chat功能完整示例

#### JavaScript/TypeScript - 完整Chat流程
```javascript
// 1. 发送消息的完整流程
async function sendMessage(conversationId, userInput) {
  // 验证输入
  if (!userInput.trim()) return;
  
  // 设置发送状态
  setIsMessageSending(true);
  
  // 创建用户消息
  const userMessage = {
    role: 'user',
    content: userInput,
    timestamp: new Date().toISOString()
  };
  
  // 创建思考状态消息
  const thinkingMessage = {
    role: 'assistant',
    content: 'thinking',
    timestamp: new Date().toISOString(),
    isThinking: true
  };
  
  // 立即显示用户消息和思考状态
  updateConversation(conversationId, [userMessage, thinkingMessage]);
  
  try {
    // 尝试流式API
    let streamedContent = '';
    await conversationAPI.sendMessageWithStream(
      conversationId, 
      userInput, 
      (chunk) => {
        streamedContent += chunk;
        updateStreamingMessage(conversationId, streamedContent);
      }
    );
    
    // 标记流式完成
    finalizeStreamingMessage(conversationId);
    
  } catch (streamError) {
    // 降级到普通API
    const response = await conversationAPI.sendMessage(conversationId, userInput);
    replaceThinkingWithResponse(conversationId, response);
    
  } catch (error) {
    // 降级到本地处理
    const intel = parseUserIntent(userInput);
    const advice = generateAdvice(intel);
    replaceThinkingWithResponse(conversationId, advice);
  } finally {
    setIsMessageSending(false);
  }
}

// 2. 流式消息处理
async function handleStreamingResponse(conversationId, userInput) {
  const response = await fetch(`/api/conversations/${conversationId}/messages/stream`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString()
    })
  });
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.content) {
            fullResponse += data.content;
            // 实时更新UI
            updateStreamingContent(fullResponse);
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }
  
  return { content: fullResponse };
}
```

#### 基础API调用示例
```javascript
// 获取对话列表
const conversations = await fetch('/api/conversations', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}).then(res => res.json());

// 发送普通消息
const response = await fetch(`/api/conversations/${conversationId}/messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    role: 'user',
    content: '用户消息内容',
    timestamp: new Date().toISOString()
  })
}).then(res => res.json());
```

### cURL
```bash
# 获取对话列表
curl -X GET "http://localhost:3001/api/conversations" \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json"

# 发送消息
curl -X POST "http://localhost:3001/api/conversations/123/messages" \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "user",
    "content": "用户消息内容",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }'
```

## 注意事项

### 通用注意事项
1. **时间格式**: 所有时间戳使用ISO 8601格式 (`YYYY-MM-DDTHH:mm:ss.sssZ`)
2. **字符编码**: 支持UTF-8，可以处理中文内容
3. **流式响应**: 使用Server-Sent Events (SSE) 格式
4. **认证**: 所有请求都需要有效的Bearer Token
5. **错误处理**: 客户端需要处理各种HTTP状态码和错误响应
6. **降级机制**: 当API不可用时，客户端会降级到本地处理

### Chat功能特殊注意事项

#### 消息状态管理
1. **状态一致性**: 确保思考状态、流式状态正确清理
2. **并发控制**: 防止用户快速发送多条消息导致状态混乱
3. **错误恢复**: API失败时正确清理所有中间状态

#### 流式响应处理
1. **连接管理**: 正确处理流式连接的建立和断开
2. **数据解析**: 安全解析SSE数据，忽略格式错误的数据块
3. **内存管理**: 及时释放流式读取器资源

#### 用户体验优化
1. **即时反馈**: 用户消息立即显示，不等待API响应
2. **视觉指示**: 清晰的思考状态和流式输入指示
3. **错误提示**: 友好的错误信息，不影响用户操作

#### 性能考虑
1. **请求去重**: 避免重复发送相同消息
2. **状态保护**: 消息发送期间保护侧边栏状态
3. **资源清理**: 及时清理定时器和事件监听器
