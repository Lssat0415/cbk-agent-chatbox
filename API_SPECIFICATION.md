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

### 5. 发送消息

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

### 6. 流式发送消息

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

**响应** (Server-Sent Events)
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"content": "根据您的需求"}

data: {"content": "，我为您制定"}

data: {"content": "以下投资方案："}

data: {"content": "..."}

data: [DONE]
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

### JavaScript/TypeScript
```javascript
// 获取对话列表
const conversations = await fetch('/api/conversations', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}).then(res => res.json());

// 发送消息
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

1. **时间格式**: 所有时间戳使用ISO 8601格式 (`YYYY-MM-DDTHH:mm:ss.sssZ`)
2. **字符编码**: 支持UTF-8，可以处理中文内容
3. **流式响应**: 使用Server-Sent Events (SSE) 格式
4. **认证**: 所有请求都需要有效的Bearer Token
5. **错误处理**: 客户端需要处理各种HTTP状态码和错误响应
6. **降级机制**: 当API不可用时，客户端会降级到本地处理
