import React, { useState, useRef, useEffect } from 'react'
import { Send, Sparkles } from 'lucide-react'
import Message from './Message'
import './Chat.css'

const EXAMPLE_PROMPTS = [
  '我偏好稳健，理财期限3年，目标年化4%，预算20万元，主要考虑教育金',
  '帮我制定ETF定投计划，期限5年，每月5000元，波动可接受',
  '我想要高流动性、低风险的现金管理方案，预算10万元',
  '激进一些，关注科技主题基金，期限2-3年',
  '我偏好平衡，预算30万元，理财期限3-5年，目标年化5%，并希望每月定投3000元'
]

function Chat({ conversation, onSendMessage }) {
  const [inputValue, setInputValue] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  const handleSend = () => {
    if (inputValue.trim() && !isComposing) {
      onSendMessage(inputValue)
      setInputValue('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e) => {
    setInputValue(e.target.value)
    // Auto-resize textarea
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px'
  }

  const insertExample = () => {
    const randomPrompt = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)]
    setInputValue(randomPrompt)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px'
      textareaRef.current.focus()
    }
  }

  if (!conversation) {
    return (
      <div className="chat-container">
        <div className="chat-empty">
          <div className="empty-icon">💬</div>
          <p>选择或创建一个对话开始</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-container">
      <div className="messages-container">
        <div className="messages">
          {conversation.messages.map((message, index) => (
            <Message key={index} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="composer">
        <div className="input-wrapper">
          <label htmlFor="prompt" className="input-label">
            请输入投资需求（例如：我偏好稳健，期限3年，目标年化4%）：
          </label>
          <div className="input-container">
            <textarea
              ref={textareaRef}
              id="prompt"
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder="输入你的问题，例如：我预算30万，期望稳健增值，理财期限2-3年…"
              rows="1"
              className="message-input"
            />
            <button
              className="example-btn"
              onClick={insertExample}
              title="插入示例"
            >
              <Sparkles size={16} />
            </button>
          </div>
        </div>
        
        <button
          className="btn btn-primary send-btn"
          onClick={handleSend}
          disabled={!inputValue.trim()}
        >
          <Send size={16} />
          发送
        </button>
      </div>

      <footer className="chat-footer">
        风险提示：本工具为演示用途，内容不构成任何投资建议或收益承诺。市场有风险，投资需谨慎。如需个性化方案，请联系持牌投顾并以官方合规文件为准。
      </footer>
    </div>
  )
}

export default Chat