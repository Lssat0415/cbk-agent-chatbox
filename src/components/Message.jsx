import React from 'react'
import './Message.css'

function Message({ message }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'numeric',
      day: 'numeric'
    })
  }

  const renderAdvice = (advice) => {
    const { recommendations } = advice

    return (
      <div className="advice-content">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="recommendation-block">
            <div className="rec-title">{rec.title}</div>
            <div className="rec-summary">{rec.summary}</div>
            
            {rec.lines && rec.lines.length > 0 && (
              <ul className="rec-lines">
                {rec.lines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            )}
            
            {rec.table && (
              <div className="alloc-table">
                <table>
                  <thead>
                    <tr>
                      <th>类别</th>
                      <th>建议占比</th>
                      <th>说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rec.table.map((row, i) => (
                      <tr key={i}>
                        <td>{row[0]}</td>
                        <td>{row[1]}</td>
                        <td>
                          <span className="badge">{row[2]}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
        
        <details className="disclaimer">
          <summary>重要说明与风险提示</summary>
          <div className="disclaimer-content">
            本回复基于关键词规则生成，不代表真实投顾意见，也不构成投资建议或收益承诺。市场有风险，投资需谨慎。请结合自身情况，并以官方合规文件与披露为准。
          </div>
        </details>
      </div>
    )
  }

  const renderContent = () => {
    if (message.isThinking) {
      return (
        <div className="thinking">
          正在分析 
          <span className="loader">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </span>
        </div>
      )
    }

    if (message.isStreaming) {
      return (
        <div className="streaming-message">
          <div className="message-text">{message.content}</div>
          <span className="streaming-cursor">|</span>
        </div>
      )
    }

    if (message.isAdvice && typeof message.content === 'object') {
      return renderAdvice(message.content)
    }

    // Handle API response - could be string or object
    if (typeof message.content === 'string') {
      // Try to parse as JSON for structured advice
      try {
        const parsedContent = JSON.parse(message.content)
        if (parsedContent.recommendations) {
          return renderAdvice(parsedContent)
        }
      } catch (e) {
        // Not JSON, treat as plain text
      }
    }

    return <div className="message-text">{message.content}</div>
  }

  return (
    <div className={`message ${message.role}`}>
      <div className="message-avatar">
        {message.role === 'assistant' ? 'B' : '我'}
      </div>
      
      <div className="message-content">
        <div className={`message-bubble ${message.role}`}>
          {renderContent()}
        </div>
        <div className="message-meta">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  )
}

export default Message