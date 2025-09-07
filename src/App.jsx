import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import Header from './components/Header'
import { parseUserIntent, generateAdvice } from './utils/advisor'
import conversationAPI from './services/api'
import './App.css'

const STORAGE_KEY = 'bank_advisor_conversations_v2'

function App() {
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isMessageSending, setIsMessageSending] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)

  // Detect mobile device and add protection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Add global protection for mobile sidebar
    const handleGlobalClick = (e) => {
      if (isMobile && sidebarOpen && isMessageSending) {
        // Prevent any clicks from closing sidebar during message sending
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }
    
    const handleScroll = (e) => {
      if (isMobile && sidebarOpen && isMessageSending) {
        // Prevent scroll events from affecting sidebar during message sending
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }
    
    if (isMobile) {
      document.addEventListener('click', handleGlobalClick, { capture: true })
      document.addEventListener('scroll', handleScroll, { capture: true })
    }
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      document.removeEventListener('click', handleGlobalClick, { capture: true })
      document.removeEventListener('scroll', handleScroll, { capture: true })
    }
  }, [isMobile, sidebarOpen, isMessageSending])

  // Load conversations with API integration and localStorage fallback
  useEffect(() => {
    const loadConversations = async () => {
      setIsLoadingConversations(true)
      
      try {
        // Try to load from API first
        const apiConversations = await conversationAPI.getConversations()
        setConversations(apiConversations)
        
        if (apiConversations.length > 0 && !currentConversationId) {
          setCurrentConversationId(apiConversations[0].id)
        } else if (apiConversations.length === 0) {
          createNewConversation()
        }
      } catch (error) {
        console.error('Failed to load conversations from API:', error)
        
        // Fallback to localStorage
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          try {
            const data = JSON.parse(stored)
            setConversations(data)
            if (data.length > 0 && !currentConversationId) {
              setCurrentConversationId(data[0].id)
            }
          } catch (e) {
            console.error('Failed to load conversations from localStorage:', e)
            createNewConversation()
          }
        } else {
          createNewConversation()
        }
      } finally {
        setIsLoadingConversations(false)
      }
    }
    
    loadConversations()
  }, [])

  // Save conversations to localStorage and sync to API whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      // Save to localStorage as cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
      
      // Async sync to API (non-blocking)
      conversations.forEach(async (conv) => {
        try {
          await conversationAPI.saveConversation(conv)
        } catch (error) {
          console.error('Failed to sync conversation to API:', error)
        }
      })
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

  const deleteConversation = async (id) => {
    try {
      // Try to delete from API first
      await conversationAPI.deleteConversation(id)
    } catch (error) {
      console.error('Failed to delete conversation from API:', error)
    }
    
    // Update local state
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

    // Set message sending state to protect sidebar
    setIsMessageSending(true)

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

    // Update conversation with user message and thinking state
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

    try {
      // Try streaming API first
      let streamingSupported = false
      try {
        let streamedContent = ''
        
        // Create initial assistant message for streaming
        const streamingMessage = {
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          isAdvice: true,
          isStreaming: true
        }

        // Remove thinking message and add streaming message
        setConversations(prev =>
          prev.map(conv =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  title: updatedTitle,
                  messages: conv.messages
                    .filter(m => !m.isThinking)
                    .concat(streamingMessage)
                }
              : conv
          )
        )

        // Try streaming API
        await conversationAPI.sendMessageWithStream(
          currentConversationId, 
          text, 
          (chunk) => {
            streamedContent += chunk
            // Update the streaming message with new content
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

        // Mark streaming as complete
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

        streamingSupported = true
      } catch (streamError) {
        console.log('Streaming not supported, falling back to regular API:', streamError)
        
        // Remove any streaming messages first
        setConversations(prev =>
          prev.map(conv =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  messages: conv.messages.filter(m => !m.isStreaming)
                }
              : conv
          )
        )
        
        // Fallback to regular API call
        const apiResponse = await conversationAPI.sendMessage(currentConversationId, text)
        
        // Remove thinking message and add API response
        const assistantMessage = {
          role: 'assistant',
          content: apiResponse.content || apiResponse,
          timestamp: new Date().toISOString(),
          isAdvice: true
        }

        setConversations(prev =>
          prev.map(conv =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  title: updatedTitle,
                  messages: conv.messages
                    .filter(m => !m.isThinking)
                    .concat(assistantMessage)
                }
              : conv
          )
        )
      }
    } catch (error) {
      console.error('Failed to send message to API:', error)
      
      // Remove any streaming messages first
      setConversations(prev =>
        prev.map(conv =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: conv.messages.filter(m => !m.isStreaming)
              }
            : conv
        )
      )
      
      // Fallback to local processing
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
                title: updatedTitle,
                messages: conv.messages
                  .filter(m => !m.isThinking)
                  .concat(assistantMessage)
              }
            : conv
        )
      )
    } finally {
      // Clear message sending state
      setTimeout(() => {
        setIsMessageSending(false)
      }, 500)
    }
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

  // Smart sidebar toggle with mobile protection
  const handleSidebarToggle = () => {
    // Prevent sidebar closing during message sending
    if (isMessageSending) {
      return
    }
    
    // On mobile, be more careful about closing the sidebar
    if (isMobile && sidebarOpen) {
      // Check if input is currently focused (prevent closing during input)
      const activeElement = document.activeElement
      const isInputFocused = activeElement && (
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.tagName === 'INPUT' ||
        activeElement.contentEditable === 'true'
      )
      
      if (isInputFocused) {
        // Don't close sidebar if user is typing
        return
      }
      
      // Add a small delay to prevent accidental closing
      setTimeout(() => {
        setSidebarOpen(false)
      }, 50)
    } else {
      setSidebarOpen(!sidebarOpen)
    }
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
        onToggle={handleSidebarToggle}
        isLoading={isLoadingConversations}
        header={
          <Header />
        }
      />
      
      <div className="main-content">
        <Chat
          conversation={currentConversation}
          onSendMessage={sendMessage}
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
      </div>
    </div>
  )
}

export default App