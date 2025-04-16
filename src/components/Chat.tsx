// src/components/Chat.tsx
import React, { useEffect, useState } from 'react';
import { WebSocketService, Message } from '../services/websocketService';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('receiver@example.com');
  const userEmail = 'sender@example.com'; // Lấy từ auth context sau
  const wsService = new WebSocketService(userEmail, (newMessage) => {
    setMessages((prev) => [...prev, newMessage]);
  });

  useEffect(() => {
    wsService.connect();
    // Tải lịch sử tin nhắn
    fetch(`http://localhost:8080/api/messages?sender=${userEmail}&receiver=${receiverEmail}`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error('Error fetching messages:', err));

    return () => wsService.disconnect();
  }, [userEmail, receiverEmail]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        senderEmail: userEmail,
        receiverEmail,
        content: newMessage,
      };
      wsService.sendMessage(message);
      setNewMessage('');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Chat with {receiverEmail}</h2>
      <div style={{ height: '400px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              textAlign: msg.senderEmail === userEmail ? 'right' : 'left',
              margin: '10px',
            }}
          >
            <p style={{ background: msg.senderEmail === userEmail ? '#e0f7fa' : '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
              <strong>{msg.senderEmail}:</strong> {msg.content}
            </p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '10px' }}
        />
        <button onClick={handleSendMessage} style={{ padding: '10px 20px' }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;