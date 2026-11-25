import { useState } from 'react';

export default function AgentChatPanel() {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: '你好，我是選課助理（目前為前端假資料模式，之後會接上後端與 LangGraph）。',
    },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = { sender: 'user', text: chatInput.trim() };
    const replyMsg = {
      sender: 'assistant',
      text: `已收到你的訊息：「${chatInput.trim()}」（目前尚未連接後端 Agent）。`,
    };
    setMessages((prev) => [...prev, userMsg, replyMsg]);
    setChatInput('');
  };

  return (
    <div
      style={{
        border: '1px solid #999',
        padding: '12px',
        marginTop: '24px',
        borderRadius: '6px',
      }}
    >
      <h3>選課助理對話區（預留 Agent 介面）</h3>
      <div
        style={{
          maxHeight: '180px',
          overflowY: 'auto',
          marginBottom: '10px',
        }}
      >
        {messages.map((m, idx) => (
          <div key={idx} style={{ marginBottom: '6px' }}>
            <strong>{m.sender === 'user' ? '你' : '助理'}：</strong>
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="輸入想測試的訊息..."
          style={{ flex: 1, padding: '6px' }}
        />
        <button type="submit" style={{ cursor: 'pointer' }}>
          送出
        </button>
      </form>
    </div>
  );
}