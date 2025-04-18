import { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useAppSelector } from '@/redux/hooks';
import axios from 'axios';
import Cookies from 'js-cookie'; // Thêm js-cookie
import debounce from 'lodash/debounce';
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
  const [receiverEmail, setReceiverEmail] = useState<string>('');
  const [conversationEmails, setConversationEmails] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const stompClient = useRef<Stomp.Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useAppSelector((state) => state.account.user);

  // Lấy access_token từ cookie
  const accessToken = Cookies.get('access_token'); // Giả sử cookie có tên là 'access_token'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Hàm tạo destination riêng cho cặp người dùng
  const createConversationDestination = (senderEmail: string, receiverEmail: string) => {
    const emails = [senderEmail, receiverEmail].sort();
    return `/queue/conversation/${emails[0]}/${emails[1]}`;
  };

  // Tải danh sách người nhắn tin
  useEffect(() => {
    if (currentUser?.email && accessToken) {
      console.log('Fetching conversations for user:', currentUser.email);
      axios
        .get('http://localhost:8080/api/v1/conversations', {
          params: { userEmail: currentUser.email },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          console.log('Conversations response:', response.data);
          setConversationEmails(response.data);
          const storedEmail = localStorage.getItem('selectedReceiverEmail');
          if (storedEmail && response.data.includes(storedEmail)) {
            setReceiverEmail(storedEmail);
          } else if (response.data.length > 0) {
            setReceiverEmail(response.data[0]);
            localStorage.setItem('selectedReceiverEmail', response.data[0]);
          }
        })
        .catch((error) => {
          console.error('Error fetching conversations:', error.response?.data || error.message);
          setErrorMessage('Could not fetch conversations. Please try again.');
        });
    }
  }, [currentUser?.email, accessToken]);

  useEffect(() => {
    if (receiverEmail) {
      localStorage.setItem('selectedReceiverEmail', receiverEmail);
    }
  }, [receiverEmail]);

  // Kết nối WebSocket với JWT từ cookie
  useEffect(() => {
    if (!currentUser?.email || !accessToken) return;

    const socket = new SockJS('http://localhost:8080/ws');
    stompClient.current = Stomp.over(socket);

    stompClient.current.connect(
      { Authorization: `Bearer ${accessToken}` },
      () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);

        // Subscribe vào destination riêng
        if (receiverEmail) {
          const destination = createConversationDestination(currentUser.email, receiverEmail);
          stompClient.current?.subscribe(destination, (message) => {
            const receivedMessage: Message = JSON.parse(message.body);
            setMessages((prevMessages) => [...prevMessages, receivedMessage]);
            if (
              receivedMessage.senderEmail !== currentUser?.email &&
              !conversationEmails.includes(receivedMessage.senderEmail)
            ) {
              setConversationEmails((prev) => [...prev, receivedMessage.senderEmail]);
            }
          });
        }
      },
      (error) => {
        console.error('WebSocket connection error:', error);
        setIsConnected(false);
        setErrorMessage('Failed to connect to chat server.');
      }
    );

    return () => {
      if (isConnected && stompClient.current) {
        stompClient.current.disconnect(() => {
          console.log('>>> DISCONNECT');
          setIsConnected(false);
        });
      }
    };
  }, [currentUser?.email, receiverEmail, accessToken, conversationEmails]);

  // Debounce hàm gọi API
  const fetchMessages = useRef(
    debounce((sender: string, receiver: string) => {
      console.log('Fetching messages for:', { sender, receiver });
      setErrorMessage(null);
      axios
        .get('http://localhost:8080/api/v1/messages', {
          params: {
            sender,
            receiver,
            page: 0,
            size: 20,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setMessages(response.data);
        })
        .catch((error) => {
          console.error('Error fetching messages:', error.response?.data || error.message);
          setErrorMessage('Could not fetch messages. Please check the email and try again.');
        });
    }, 500)
  ).current;

  // Tải tin nhắn khi chọn người nhận hoặc làm mới trang
  useEffect(() => {
    if (receiverEmail && currentUser?.email && accessToken) {
      fetchMessages(currentUser.email, receiverEmail);
    }
  }, [receiverEmail, currentUser?.email, accessToken]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() && receiverEmail && stompClient.current && isConnected) {
      const message: Message = {
        id: 0,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className={styles.chatContainer}>
      <h2>Chat</h2>
      <div className={styles.chatLayout}>
        <div className={styles.sidebar}>
          <h3>Conversations</h3>
          <input
            type="text"
            placeholder="Enter email to start chatting"
            value={receiverEmail}
            onChange={(e) => setReceiverEmail(e.target.value)}
            className={styles.emailInput}
          />
          {conversationEmails.length === 0 ? (
            <p>No conversations yet.</p>
          ) : (
            <ul className={styles.conversationList}>
              {conversationEmails.map((email) => (
                <li
                  key={email}
                  className={`${styles.conversationItem} ${
                    email === receiverEmail ? styles.active : ''
                  }`}
                  onClick={() => setReceiverEmail(email)}
                >
                  {email}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.chatBox}>
          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
          {receiverEmail ? (
            <>
              <h4>Chat with {receiverEmail}</h4>
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
            </>
          ) : (
            <p>Select a conversation to start chatting.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;