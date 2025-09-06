import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import Header from './components/Header'
import { parseUserIntent, generateAdvice } from './utils/advisor'
import './App.css'

const STORAGE_KEY = 'bank_advisor_conversations_v2'

function App() {
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Load conversations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setConversations(data)
        if (data.length > 0 && !currentConversationId) {
          setCurrentConversationId(data[0].id)
        }
      } catch (e) {
        console.error('Failed to load conversations:', e)
      }
    } else {
      // Create initial conversation
      createNewConversation()
    }
  }, [])

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    }
  }, [conversations])

  const createNewConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: '新对话',
      messages: [
        {
          role: 'assistant',
          content: '您好，我是银行智能投顾助手。请描述您的投资需求，例如风险偏好、目标年化、投资期限与预算等，我将为您给出参考配置。',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    }
    setConversations(prev => [newConversation, ...prev])
    setCurrentConversationId(newConversation.id)
    return newConversation
  }

  const deleteConversation = (id) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id)
      
      // If deleting current conversation, switch to another or create new
      if (id === currentConversationId) {
        if (filtered.length > 0) {
          setCurrentConversationId(filtered[0].id)
        } else {
          // Create a new conversation if none left
          const newConv = createNewConversation()
          return [newConv]
        }
      }
      
      return filtered
    })
  }

  const clearAllConversations = () => {
    if (!confirm('确认清空所有对话历史？此操作不可撤销。')) return
    localStorage.removeItem(STORAGE_KEY)
    setConversations([])
    createNewConversation()
  }

  const sendMessage = async (text) => {
    if (!text.trim()) return

    const currentConv = conversations.find(c => c.id === currentConversationId)
    if (!currentConv) return

    // Add user message
    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    }

    // Update conversation title if it's the first user message
    let updatedTitle = currentConv.title
    if (currentConv.messages.length === 1 && currentConv.title === '新对话') {
      // Use first 20 characters of the message as title
      updatedTitle = text.length > 20 ? text.substring(0, 20) + '...' : text
    }

    // Add thinking message
    const thinkingMessage = {
      role: 'assistant',
      content: 'thinking',
      timestamp: new Date().toISOString(),
      isThinking: true
    }

    setConversations(prev =>
      prev.map(conv =>
        conv.id === currentConversationId
          ? {
              ...conv,
              title: updatedTitle,
              messages: [...conv.messages, userMessage, thinkingMessage]
            }
          : conv
      )
    )

    // Simulate processing delay
    setTimeout(() => {
      const intel = parseUserIntent(text)
      const advice = generateAdvice(intel)

      const assistantMessage = {
        role: 'assistant',
        content: advice,
        timestamp: new Date().toISOString(),
        isAdvice: true
      }

      setConversations(prev =>
        prev.map(conv =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: conv.messages
                  .filter(m => !m.isThinking)
                  .concat(assistantMessage)
              }
            : conv
        )
      )
    }, 650)
  }

  const exportConversation = () => {
    const current = conversations.find(c => c.id === currentConversationId)
    if (!current) return

    const exportText = current.messages
      .map(m => {
        const role = m.role === 'assistant' ? '助手' : '用户'
        const content = typeof m.content === 'string' 
          ? m.content 
          : '【投资建议】' + JSON.stringify(m.content.recommendations.map(r => r.title)).replace(/"/g, '')
        return `[${role}] ${content}`
      })
      .join('\n\n')

    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat_export_${new Date().getTime()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const currentConversation = conversations.find(c => c.id === currentConversationId)

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="main-content">
        <Header
          onClear={() => {
            if (!currentConversation) return
            if (!confirm('确认清空当前对话？')) return
            setConversations(prev =>
              prev.map(conv =>
                conv.id === currentConversationId
                  ? {
                      ...conv,
                      messages: [{
                        role: 'assistant',
                        content: '您好，我是银行智能投顾助手。请描述您的投资需求，例如风险偏好、目标年化、投资期限与预算等，我将为您给出参考配置。',
                        timestamp: new Date().toISOString()
                      }]
                    }
                  : conv
              )
            )
          }}
          onExport={exportConversation}
          onNewChat={createNewConversation}
        />
        
        <Chat
          conversation={currentConversation}
          onSendMessage={sendMessage}
        />
      </div>
    </div>
  )
}

export default App