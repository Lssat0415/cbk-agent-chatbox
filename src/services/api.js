// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

class ConversationAPI {
  async getConversations() {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  }

  async saveConversation(conversation) {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(conversation)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  }

  async updateConversation(id, conversation) {
    const response = await fetch(`${API_BASE_URL}/conversations/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(conversation)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  }

  async deleteConversation(id) {
    const response = await fetch(`${API_BASE_URL}/conversations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  }

  async sendMessage(conversationId, message) {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  }

  async sendMessageWithStream(conversationId, message, onChunk) {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages/stream`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullResponse = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                fullResponse += data.content
                onChunk(data.content)
              }
            } catch (e) {
              // Ignore parsing errors for malformed chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return { content: fullResponse }
  }

  async getMessageResponse(conversationId, messageId) {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages/${messageId}/response`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  }

  getAuthToken() {
    // 从localStorage或其他地方获取认证token
    return localStorage.getItem('auth_token')
  }
}

export default new ConversationAPI()
