import { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useAppSelector } from '@/redux/hooks';
import axios from 'axios';
import styles from './chat.module.scss';

interface Message {
  id: number;
  senderEmail: string;
  receiverEmail: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverEmail, setReceiverEmail] = useState(''); // Email người nhận
  const stompClient = useRef<Stomp.Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useAppSelector((state) => state.account.user); // Giả sử bạn lưu thông tin user trong Redux

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Kết nối WebSocket
  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient.current = Stomp.over(socket);

    stompClient.current.connect({}, () => {
      stompClient.current?.subscribe('/topic/messages', (message) => {
        const receivedMessage: Message = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      });
    });

    return () => {
      stompClient.current?.disconnect(() => {
        console.log('Disconnected');
      });
    };
  }, []);

  // Tải lịch sử tin nhắn khi chọn người nhận
  useEffect(() => {
    if (receiverEmail && currentUser?.email) {
      axios
        .get('http://localhost:8080/api/messages', {
          params: {
            sender: currentUser.email,
            receiver: receiverEmail,
            page: 0,
            size: 20,
          },
        })
        .then((response) => {
          setMessages(response.data);
        })
        .catch((error) => {
          console.error('Error fetching messages:', error);
        });
    }
  }, [receiverEmail, currentUser?.email]);

  // Cuộn xuống tin nhắn mới nhất khi messages thay đổi
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gửi tin nhắn
  const sendMessage = () => {
    if (newMessage.trim() && receiverEmail && stompClient.current) {
      const message: Message = {
        id: 0, // ID sẽ được backend tạo
        senderEmail: currentUser?.email || '',
        receiverEmail,
        content: newMessage,
        sentAt: new Date().toISOString(),
        isRead: false,
      };

      stompClient.current.send('/app/chat', {}, JSON.stringify(message));
      setNewMessage('');
    }
  };

  // Xử lý nhấn Enter để gửi tin nhắn
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className={styles.chatContainer}>
      <h2>Chat</h2>
      <div className={styles.chatBox}>
        <input
          type="text"
          placeholder="Receiver's email"
          value={receiverEmail}
          onChange={(e) => setReceiverEmail(e.target.value)}
        />
        <div className={styles.messages}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.senderEmail === currentUser?.email
                  ? styles.sentMessage
                  : styles.receivedMessage
              }
            >
              <p>{msg.content}</p>
              <span>{new Date(msg.sentAt).toLocaleTimeString()}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className={styles.inputBox}>
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;