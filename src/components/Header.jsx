import React from 'react'
import { Trash, Download, Plus } from 'lucide-react'
import './Header.css'

function Header({ onClear, onExport, onNewChat }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand">
          <div className="logo" aria-hidden="true">🏦</div>
          <div className="title">
            <b>智能投顾</b>
          </div>
        </div>
        
{/*<div className="header-actions">
          <button 
            className="btn"
            onClick={onClear}
            title="清空当前对话"
          >
            <Trash size={16} />
            <span className="btn-text">清空</span>
          </button>
          
          <button 
            className="btn"
            onClick={onExport}
            title="导出聊天记录"
          >
            <Download size={16} />
            <span className="btn-text">导出</span>
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={onNewChat}
            title="新对话"
          >
            <Plus size={16} />
            <span className="btn-text">新对话</span>
          </button>
        </div>*/}
      </div>
    </header>
  )
}

export default Header