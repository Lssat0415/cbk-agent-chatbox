import React from 'react'
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import './Sidebar.css'

function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isOpen,
  onToggle
}) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return '今天'
    } else if (diffDays === 1) {
      return '昨天'
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }
  }

  // Group conversations by date
  const groupedConversations = conversations.reduce((groups, conv) => {
    const dateKey = formatDate(conv.createdAt)
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(conv)
    return groups
  }, {})

  return (
    <>
      <div className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          <button 
            className="btn btn-primary new-chat-btn"
            onClick={onNewConversation}
            title="新对话"
          >
            <Plus size={18} />
            {isOpen && <span>新对话</span>}
          </button>
          
          <button 
            className="btn btn-icon toggle-btn"
            onClick={onToggle}
            title={isOpen ? '收起侧边栏' : '展开侧边栏'}
          >
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {isOpen && (
          <div className="conversation-list">
            {Object.entries(groupedConversations).map(([dateKey, convs]) => (
              <div key={dateKey} className="conversation-group">
                <div className="group-date">{dateKey}</div>
                {convs.map(conv => (
                  <div
                    key={conv.id}
                    className={`conversation-item ${
                      conv.id === currentConversationId ? 'active' : ''
                    }`}
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    <MessageSquare size={16} className="conv-icon" />
                    <span className="conv-title truncate" title={conv.title}>
                      {conv.title}
                    </span>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('确认删除这个对话？')) {
                          onDeleteConversation(conv.id)
                        }
                      }}
                      title="删除对话"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ))}
            
            {conversations.length === 0 && (
              <div className="empty-state">
                <MessageSquare size={32} />
                <p>暂无对话历史</p>
                <p className="hint">点击"新对话"开始</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onToggle}
        />
      )}
    </>
  )
}

export default Sidebar