// src/pages/chat/ChatPage.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { message } from 'antd';
import { WebSocketService } from '@/services/websocket';
import { useUsersConnected } from '@/hooks/useUsersConnected';
import { getAllMessages } from '@/config/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { IChatMessage, IUser, Message } from '@/types/backend';
import { convertSlug } from '@/config/utils';
import styles from '../../styles/chat.module.scss';

const ChatPage = () => {
  const location = useLocation();
  const user = useAppSelector((state) => state.account.user) as IUser;
  const navigate = useNavigate();

  const [isChatListVisible, setIsChatListVisible] = useState(true);
  const [userSelected, setUserSelected] = useState<IUser>(
    (location?.state as any)?.receiver ?? {}
  );
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const userSelectedRef = useRef<IUser>(userSelected);
  const [openPopup, setOpenPopup] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsService = useRef(new WebSocketService()).current;

  const { res: usersConnected, refetch: refetchUsersConnected } = useUsersConnected();

  useEffect(() => {
    document.title = 'Tin nhắn';
    userSelectedRef.current = userSelected;
  }, [userSelected]);

  useEffect(() => {
    if (user?.email) {
      wsService.connect(
        user,
        () => refetchUsersConnected(),
        (msg) => {
          if (msg.receiverId === user?.id && !userSelectedRef.current?.id) {
            message.info('Có ai đó gửi tin nhắn!');
          }
          setMessages((prev) => [
            ...prev,
            { type: 'receiver', content: msg?.content },
          ]);
        }
      );
    }
    return () => wsService.disconnect();
  }, [user?.email]);

  useEffect(() => {
    if (userSelected?.id) fetchAllMessages();
  }, [userSelected?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenPopup(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenPopup(false), 150);
  };

  function formatDate(createdAt: string | number) {
    const date = new Date(
      typeof createdAt === 'number' ? createdAt * 1000 : createdAt
    );
    if (isNaN(date.getTime())) return 'Invalid date';

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } else {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  const buildDataMessage = (dataMessages: IChatMessage[] = []) => {
    const userId = user?.id;
    const results = dataMessages.map((data) => ({
      type: data?.sender?.id === userId ? 'sender' : 'receiver',
      content: data?.content,
      time: formatDate(data?.createdAt || ''),
    }));
    setMessages(results);
  };

  const fetchAllMessages = useCallback(async () => {
    try {
      const res = await getAllMessages(Number(user?.id), Number(userSelected?.id));
      if (res?.statusCode === 200) {
        buildDataMessage(res?.data ?? []);
      } else {
        toast.error(res?.message ?? 'Fetching messages failed!');
      }
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    }
  }, [user?.id, userSelected?.id]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputMessage(e.target.value);
    },
    []
  );

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const receiver = { id: userSelected?.id };
      const sender = { id: user?.id };
      const chatMessage = {
        sender,
        receiver,
        content: inputMessage.trim(),
        timeStamp: new Date().toISOString(),
      };
      wsService.sendMessage(chatMessage);
      setMessages((prev) => [
        ...prev,
        { type: 'sender', content: inputMessage.trim() },
      ]);
      setInputMessage('');
    }
  };

  if (!user?.id) return null;

  return (
    <div className={styles.chatContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarIcon}>
          <svg
            onClick={() => setIsChatListVisible(!isChatListVisible)}
            className={styles.toggleIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </div>
        <nav className={styles.nav}>
          <div className={styles.navItem}>
            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className={styles.badge}>{usersConnected?.length ?? 0}</span>
          </div>
        </nav>
      </aside>

      {/* Chat List */}
      {isChatListVisible && (
        <aside className={styles.chatList}>
          <div className={styles.search}>
            <input
              type="search"
              placeholder="Tìm kiếm"
              className={styles.searchInput}
            />
            <svg
              className={styles.searchIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className={styles.userList}>
            {usersConnected?.map((u) => (
              <div
                key={u.id}
                className={styles.userItem}
                onClick={() => setUserSelected(u)}
              >
                <div className={styles.userAvatar}>
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/user/${u.avatar || 'default.png'}`}
                    alt={u.name}
                    className={styles.avatarImg}
                  />
                </div>
                <div className={styles.userInfo}>
                  <h3 className={styles.userName}>{u.name}</h3>
                  <p className={styles.userMessage}>Xem tin nhắn</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* Main Chat */}
      <main className={styles.chatMain}>
        {userSelected?.id ? (
          <>
            <header className={styles.chatHeader}>
              <div className={styles.headerInfo}>
                <h1
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={handleMouseEnter}
                  onTouchEnd={handleMouseLeave}
                  className={styles.headerName}
                  onClick={() =>
                    navigate(`/company/${convertSlug(userSelected?.company?.name || '')}?id=${userSelected?.company?.id}`)
                  }
                >
                  {userSelected?.name}
                </h1>
                <span
                  className={
                    userSelected?.status === 'ONLINE'
                      ? styles.statusOnline
                      : styles.statusOffline
                  }
                >
                  {userSelected?.status === 'ONLINE' ? 'Online' : 'Offline'}
                </span>
              </div>
            </header>

            {openPopup && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className={styles.popup}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={handleMouseEnter}
                  onTouchEnd={handleMouseLeave}
                >
                  <div className={styles.popupContent}>
                    <img
                      className={styles.popupAvatar}
                      src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${userSelected?.company?.logo || 'default.png'}`}
                      alt={userSelected?.company?.name}
                    />
                    <h3 className={styles.popupName}>{userSelected?.company?.name}</h3>
                    <div className={styles.popupLocation}>
                      <svg
                        className={styles.locationIcon}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5.64 16.36a9 9 0 1 1 12.72 0l-5.65 5.66a1 1 0 0 1-1.42 0l-5.65-5.66zm11.31-1.41a7 7 0 1 0-9.9 0L12 19.9l4.95-4.95zM12 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                      </svg>
                      {userSelected?.company?.address}
                    </div>
                    <button
                      className={styles.popupButton}
                      onClick={() =>
                        navigate(`/company/${convertSlug(userSelected?.company?.name || '')}?id=${userSelected?.company?.id}`)
                      }
                    >
                      Xem thông tin
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            <div className={styles.messages}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={msg.type === 'sender' ? styles.sent : styles.received}
                >
                  <div className={styles.messageContent}>
                    <p>{msg.content}</p>
                    <span>{msg.time}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <footer className={styles.inputArea}>
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                className={styles.messageInput}
                value={inputMessage}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
              />
              <button className={styles.sendButton} onClick={handleSendMessage}>
                <svg className={styles.sendIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </footer>
          </>
        ) : (
          <p className={styles.noChat}>Chọn một người dùng để bắt đầu chat</p>
        )}
      </main>
    </div>
  );
};

export default ChatPage;