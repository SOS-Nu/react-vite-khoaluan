import { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useAppSelector } from '@/redux/hooks';
import axios from 'axios';
import Cookies from 'js-cookie';
import debounce from 'lodash/debounce';
import styles from './chat.module.scss';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  senderEmail: string;
  receiverEmail: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

const ChatPage = () => {
  console.log('ChatPage rendered');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverEmail, setReceiverEmail] = useState<string>('');
  const [conversationEmails, setConversationEmails] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const stompClient = useRef<Stomp.Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useAppSelector((state) => state.account.user);
  const refreshToken = Cookies.get('refresh_token');
  const navigate = useNavigate();

  console.log('Current User:', currentUser);
  console.log('Refresh Token:', refreshToken);
  console.log('Access Token:', accessToken);
  console.log('All cookies:', Cookies.get());

  // Chuyển hướng nếu chưa đăng nhập
  useEffect(() => {
    if (!refreshToken || !currentUser?.email) {
      console.log('Missing refresh token or user email, redirecting to login');
      setErrorMessage('Please log in to access chat.');
      navigate('/login');
    }
  }, [refreshToken, currentUser?.email, navigate]);

  // Tự động refresh token khi gặp lỗi 401
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && !error.config._retry && refreshToken) {
          console.log('Access token expired, attempting to refresh');
          error.config._retry = true;
          try {
            const response = await axios.post(
              'http://localhost:8080/api/v1/auth/refresh',
              {},
              {
                headers: {
                  Authorization: `Bearer ${refreshToken}`,
                },
              }
            );
            const newAccessToken = response.data.access_token;
            console.log('New access token:', newAccessToken);
            setAccessToken(newAccessToken);
            error.config.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(error.config);
          } catch (refreshError) {
            console.error('Refresh token failed:', refreshError.response?.data || refreshError.message);
            setErrorMessage('Session expired. Please log in again.');
            navigate('/login');
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshToken, navigate]);

  // Lấy access_token khi trang tải
  useEffect(() => {
    if (refreshToken && !accessToken && currentUser?.email) {
      console.log('Fetching initial access token');
      axios
        .post(
          'http://localhost:8080/api/v1/auth/refresh',
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        )
        .then((response) => {
          const newAccessToken = response.data.access_token;
          console.log('Initial access token:', newAccessToken);
          setAccessToken(newAccessToken);
        })
        .catch((error) => {
          console.error('Error fetching initial access token:', error.response?.data || error.message);
          setErrorMessage('Cannot authenticate. Please log in again.');
          navigate('/login');
        });
    }
  }, [refreshToken, accessToken, currentUser?.email, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createConversationDestination = (senderEmail: string, receiverEmail: string) => {
    const emails = [senderEmail, receiverEmail].sort();
    return `/queue/conversation/${emails[0]}/${emails[1]}`;
  };

  // Tải danh sách cuộc trò chuyện
  useEffect(() => {
    if (!accessToken || !currentUser?.email) {
      console.log('No access token or user email, skipping conversations fetch');
      return;
    }

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
          console.log('Setting receiverEmail from localStorage:', storedEmail);
          setReceiverEmail(storedEmail);
        } else if (response.data.length > 0) {
          console.log('Setting receiverEmail from response:', response.data[0]);
          setReceiverEmail(response.data[0]);
          localStorage.setItem('selectedReceiverEmail', response.data[0]);
        }
      })
      .catch((error) => {
        console.error('Error fetching conversations:', error.response?.data || error.message);
        setErrorMessage('Could not fetch conversations. Please try again.');
      });
  }, [currentUser?.email, accessToken]);

  // Lưu receiverEmail vào localStorage
  useEffect(() => {
    if (receiverEmail) {
      console.log('Saving receiverEmail to localStorage:', receiverEmail);
      localStorage.setItem('selectedReceiverEmail', receiverEmail);
    }
  }, [receiverEmail]);

  // Kết nối WebSocket
  useEffect(() => {
    if (!currentUser?.email || !accessToken) {
      console.log('Cannot initialize WebSocket. Missing:', {
        hasEmail: !!currentUser?.email,
        hasToken: !!accessToken,
      });
      return;
    }

    console.log('Initializing WebSocket with token:', accessToken);
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient.current = Stomp.over(socket);

    stompClient.current.connect(
      { Authorization: `Bearer ${accessToken}` },
      () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
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
  }, [currentUser?.email, accessToken]);

  // Subscribe vào destination riêng
  useEffect(() => {
    if (isConnected && stompClient.current && receiverEmail && currentUser?.email) {
      const destination = createConversationDestination(currentUser.email, receiverEmail);
      console.log('Subscribing to:', destination);
      const subscription = stompClient.current.subscribe(destination, (message) => {
        const receivedMessage: Message = JSON.parse(message.body);
        console.log('Received message:', receivedMessage);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        if (
          receivedMessage.senderEmail !== currentUser?.email &&
          !conversationEmails.includes(receivedMessage.senderEmail)
        ) {
          setConversationEmails((prev) => [...prev, receivedMessage.senderEmail]);
        }
      });

      return () => {
        subscription?.unsubscribe();
        console.log('Unsubscribed from:', destination);
      };
    }
  }, [isConnected, receiverEmail, currentUser?.email, conversationEmails]);

  // Tải tin nhắn
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
          console.log('Messages fetched:', response.data);
          setMessages(response.data);
        })
        .catch((error) => {
          console.error('Error fetching messages:', error.response?.data || error.message);
          setErrorMessage('Could not fetch messages. Please check the email and try again.');
        });
    }, 500)
  ).current;

  useEffect(() => {
    if (receiverEmail && currentUser?.email && accessToken) {
      console.log('Triggering fetchMessages for:', { sender: currentUser.email, receiver: receiverEmail });
      fetchMessages(currentUser.email, receiverEmail);
    }
  }, [receiverEmail, currentUser?.email, accessToken]);

  // Cuộn xuống cuối danh sách tin nhắn
  useEffect(() => {
    console.log('Scrolling to bottom. Messages length:', messages.length);
    scrollToBottom();
  }, [messages]);

  // Gửi tin nhắn
  const sendMessage = () => {
    console.log('Attempting to send message', {
      newMessage: newMessage.trim(),
      receiverEmail,
      isConnected,
      hasStompClient: !!stompClient.current,
      currentUserEmail: currentUser?.email,
      hasAccessToken: !!accessToken,
    });

    if (newMessage.trim() && receiverEmail && stompClient.current && isConnected && currentUser?.email && accessToken) {
      const message: Message = {
        id: 0,
        senderEmail: currentUser.email,
        receiverEmail,
        content: newMessage,
        sentAt: new Date().toISOString(),
        isRead: false,
      };

      console.log('Sending message:', message);
      stompClient.current.send('/app/chat', {}, JSON.stringify(message));
      setNewMessage('');
    } else {
      console.error('Cannot send message. Missing requirements:', {
        hasMessage: !!newMessage.trim(),
        hasReceiver: !!receiverEmail,
        hasStompClient: !!stompClient.current,
        isConnected,
        hasUserEmail: !!currentUser?.email,
        hasAccessToken: !!accessToken,
      });
      setErrorMessage('Cannot send message. Please check your input and connection.');
    }
  };

  // Xử lý phím Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    console.log('Key pressed:', e.key);
    if (e.key === 'Enter') {
      console.log('Enter key pressed, calling sendMessage');
      sendMessage();
    }
  };

  return (
    <div className={styles.chatContainer}>
      <h2>Chat</h2>
      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
      <div className={styles.chatLayout}>
        <div className={styles.sidebar}>
          <h3>Conversations</h3>
          <input
            type="text"
            placeholder="Enter email to start chatting"
            value={receiverEmail}
            onChange={(e) => {
              console.log('Receiver email changed:', e.target.value);
              setReceiverEmail(e.target.value);
            }}
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
                  onClick={() => {
                    console.log('Selected conversation:', email);
                    setReceiverEmail(email);
                  }}
                >
                  {email}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.chatBox}>
          {receiverEmail ? (
            <>
              <h4>Chat with {receiverEmail}</h4>
              <div className={styles.messages}>
                {messages.length === 0 ? (
                  <p>No messages yet.</p>
                ) : (
                  messages.map((msg) => (
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
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className={styles.inputBox}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => {
                    console.log('Message input changed:', e.target.value);
                    setNewMessage(e.target.value);
                  }}
                  onKeyPress={handleKeyPress}
                />
                <button
                  onClick={() => {
                    console.log('Send button clicked');
                    sendMessage();
                  }}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <p>Select or enter an email to start chatting.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;