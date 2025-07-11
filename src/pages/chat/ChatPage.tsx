import { useCallback, useEffect, useState, useRef } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setActiveChatUserId,
  setMessages,
  addMessage,
} from "@/redux/slice/chatSlice";
import { getAllMessages } from "@/config/api";
import { useUsersConnected } from "@/hooks/useUsersConnected";
import { toast } from "react-toastify";
import defaultAvatar from "@/assets/avatar.svg";
import "@/styles/stylespotfolio/chat/detail.scss";
import { UserInfo } from "@/types/backend";

// --- TypeScript Interfaces ---

const ChatPage = () => {
  // Lấy stompClient từ LayoutClient thông qua Outlet context
  const { stompClient } = useOutletContext<{ stompClient: any }>();

  const dispatch = useAppDispatch();
  const location = useLocation();

  // Lấy state từ Redux
  const user = useAppSelector((state) => state.account.user);
  const messages = useAppSelector((state) => state.chat.messages);

  // State cục bộ của component
  const [userSelected, setUserSelected] = useState<UserInfo | null>(
    location?.state?.receiver ?? null
  );
  const [inputMessage, setInputMessage] = useState<string>("");
  const [connectedUsers, setConnectedUsers] = useState<UserInfo[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { res: resUsersConnected } = useUsersConnected();

  // Cập nhật danh sách người dùng online
  useEffect(() => {
    if (resUsersConnected?.data) {
      setConnectedUsers(resUsersConnected.data);
    }
  }, [resUsersConnected]);

  // Cập nhật active chat user trong Redux store
  useEffect(() => {
    document.title = "Tin nhắn";
    dispatch(setActiveChatUserId(userSelected?.id ?? null));

    // Khi component unmount (rời khỏi trang), báo cho Redux là không còn chat nào active
    return () => {
      dispatch(setActiveChatUserId(null));
    };
  }, [userSelected, dispatch]);

  const formatDate = (timestamp: any) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Ngày không hợp lệ";
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfYesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1
    );
    const startOfMessageDate = new Date(
      date.getFullYear(), // Sửa thành 'date'
      date.getMonth(),
      date.getDate()
    );
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const timeString = `${hours}:${minutes}`;

    if (startOfMessageDate.getTime() === startOfToday.getTime())
      return timeString;
    if (startOfMessageDate.getTime() === startOfYesterday.getTime())
      return `Hôm qua lúc ${timeString}`;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${timeString} ${day}/${month}/${year}`;
  };

  // Lấy tin nhắn cũ khi chọn một người dùng
  const fetchAllMessages = useCallback(async () => {
    if (!user?.id || !userSelected?.id) return;
    try {
      const res = await getAllMessages(+user.id, +userSelected.id);
      if (+res?.statusCode === 200) {
        const formattedMessages = (res.data ?? []).map((data: any) => ({
          type: data?.sender?.id === user.id ? "sender" : "receiver",
          content: data?.content,
          time: formatDate(data?.timeStamp),
        }));
        // Đẩy toàn bộ tin nhắn cũ vào Redux store
        dispatch(setMessages(formattedMessages));
      } else {
        toast.error("Lỗi khi tải tin nhắn!");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [user?.id, userSelected?.id, dispatch]);

  useEffect(() => {
    if (userSelected?.id) {
      fetchAllMessages();
    } else {
      // Nếu không chọn ai, làm trống danh sách tin nhắn trong Redux
      dispatch(setMessages([]));
    }
  }, [userSelected?.id, fetchAllMessages, dispatch]);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() && stompClient && userSelected && user) {
      const chatMessage = {
        sender: { id: user.id, name: user.name }, // Gửi kèm thông tin người gửi
        receiver: { id: userSelected.id },
        content: inputMessage.trim(),
        timeStamp: new Date().toISOString(),
      };
      stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));

      // Để cập nhật UI ngay lập tức, ta thêm tin nhắn gửi đi vào Redux
      const newMessage = {
        type: "sender",
        content: inputMessage.trim(),
        time: formatDate(new Date()),
      };
      dispatch(addMessage(newMessage));
      setInputMessage("");
    }
  };

  if (!user?.id) return null;

  return (
    <div className="chat-container">
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <input
            type="search"
            placeholder="Tìm kiếm người dùng..."
            className="form-control"
          />
        </div>
        <div className="user-list">
          {[...connectedUsers] // 1. Tạo bản sao của mảng để không thay đổi state gốc
            .sort((a, b) => {
              // 2. Logic sắp xếp
              const aTime = a.lastMessage?.timestamp;
              const bTime = b.lastMessage?.timestamp;

              // Nếu b không có tin nhắn -> đẩy xuống dưới
              if (!bTime) return -1;
              // Nếu a không có tin nhắn -> đẩy xuống dưới
              if (!aTime) return 1;

              // So sánh thời gian, tin nhắn mới hơn (thời gian lớn hơn) sẽ ở trên
              return new Date(bTime).getTime() - new Date(aTime).getTime();
            })
            .filter((u) => u.id !== user.id) // Lọc ra chính mình
            .map((u: UserInfo) => (
              <div
                key={u.id}
                className={`user-item ${userSelected?.id === u.id ? "active" : ""}`}
                onClick={() => setUserSelected(u)}
              >
                <div className="position-relative">
                  <img
                    src={
                      u.company?.logoUrl
                        ? `${import.meta.env.VITE_BACKEND_URL}/storage/company/${u.company.logoUrl}`
                        : u.avatar
                          ? `${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${u.avatar}`
                          : defaultAvatar
                    }
                    alt={u.company?.name || u.name}
                    className="user-avatar"
                  />
                  <span
                    className={`status-indicator ${u.status === "ONLINE" ? "online" : "offline"}`}
                  ></span>
                </div>
                <div className="user-info">
                  <h6 className="user-name">{u.company?.name || u.name}</h6>
                  <div className="last-message-preview">
                    {/* Phần nội dung tin nhắn */}
                    <span className="last-message-content">
                      {u.lastMessage ? (
                        <>
                          {u.lastMessage.senderId === user.id && (
                            <strong>Bạn: </strong>
                          )}
                          {u.lastMessage.content}
                        </>
                      ) : // Fallback khi chưa có tin nhắn
                      u.status === "ONLINE" ? (
                        "Online"
                      ) : (
                        "Offline"
                      )}
                    </span>

                    {/* Phần thời gian, chỉ hiển thị khi có tin nhắn */}
                    {u.lastMessage?.timestamp && (
                      <small className="last-message-time">
                        {formatDate(u.lastMessage.timestamp)}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </aside>

      <main className="chat-main">
        {userSelected?.id ? (
          <>
            <header className="chat-header">
              <img
                src={
                  userSelected.company?.logoUrl
                    ? `${import.meta.env.VITE_BACKEND_URL}/storage/company/${userSelected.company.logoUrl}`
                    : userSelected.avatar
                      ? `${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${userSelected.avatar}`
                      : defaultAvatar
                }
                alt={userSelected.company?.name || userSelected.name}
                className="user-avatar"
              />
              <div className="user-info">
                <h5 className="user-name mb-0">
                  {userSelected.company?.name || userSelected.name}
                </h5>
                <span
                  className={
                    userSelected.status === "ONLINE"
                      ? "text-success small"
                      : "text-secondary small"
                  }
                >
                  <i className="bi bi-circle-fill me-1"></i>
                  {userSelected.status === "ONLINE" ? "Online" : "Offline"}
                </span>
              </div>
            </header>
            <div className="message-area">
              {messages.map((message: any, index: any) => {
                const isSender = message.type === "sender";
                return (
                  <div
                    key={index}
                    className={`message-wrapper ${isSender ? "sender" : "receiver"}`}
                  >
                    {!isSender && (
                      <img
                        src={
                          userSelected.company?.logoUrl
                            ? `${import.meta.env.VITE_BACKEND_URL}/storage/company/${userSelected.company?.logoUrl}`
                            : userSelected.avatar
                              ? `${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${userSelected.avatar}`
                              : defaultAvatar
                        }
                        alt="avatar"
                        className="message-avatar"
                      />
                    )}
                    <div className="message-content">
                      <div className="message-bubble">
                        <p className="mb-0">{message.content}</p>
                      </div>
                      <small className="message-time">{message.time}</small>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <footer className="chat-footer">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập tin nhắn..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleSendMessage}
                >
                  <i className="bi bi-send-fill"></i> Gửi
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="no-chat-selected">
            <h4>Chọn một người dùng để bắt đầu trò chuyện</h4>
            <p>Cuộc trò chuyện của bạn sẽ xuất hiện ở đây.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
