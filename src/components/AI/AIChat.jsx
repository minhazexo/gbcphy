import React, { useState } from 'react';
import { getGeminiResponse } from '../../utils/gemini';
import './AIChat.css';

const AIChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your AI assistant. How can I help you today?' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const response = await getGeminiResponse(input);
    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setLoading(false);
  };

  return (
    <div className="ai-chat-container">
      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-bubble">{msg.text}</div>
          </div>
        ))}
        {loading && <div className="loading">AI is thinking...</div>}
      </div>
      <div className="chat-input">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything..."
        />
        <button onClick={handleSend} disabled={loading}>Send</button>
      </div>
    </div>
  );
};

export default AIChat;
