import { getAllMessages } from "@/config/api";
import { useUsersConnected } from "@/hooks/useUsersConnected";
import { useAppSelector } from "@/redux/hooks";
import { Stomp } from "@stomp/stompjs";
import { useCallback, useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import SockJS from "sockjs-client";
import { getFirebaseImageUrl } from "./getFirebaseImageURL";
import "@/styles/stylespotfolio/chat/detail.scss"; // Import your new SCSS file
import defaultAvatar from "@/assets/avatar.svg";

// --- TypeScript Interfaces ---
interface UserInfo {
  id: number;
  email: string;
  name: string;
  avatar: string;
  role: { id: number };
  company?: {
    id: number;
    name: string;
    logoUrl: string;
    city: string;
  };
  status?: "ONLINE" | "OFFLINE";
}

const ChatPage = () => {
  const location = useLocation();
  const user = useAppSelector((state) => state?.account.user);

  const [stompClient, setStompClient] = useState<any>(null);
  const [userSelected, setUserSelected] = useState<UserInfo | null>(
    location?.state?.receiver ?? null
  );
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const userSelectedRef = useRef(userSelected);
  // No longer needed for auto-scroll: const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { res: resUsersConnected } = useUsersConnected();
  const [connectedUsers, setConnectedUsers] = useState<UserInfo[]>([]);

  useEffect(() => {
    document.title = "Tin nhắn";
    userSelectedRef.current = userSelected;
  }, [userSelected]);

  useEffect(() => {
    if (resUsersConnected?.data) {
      setConnectedUsers(resUsersConnected.data);
    }
  }, [resUsersConnected]);

  // --- WebSocket and Message Handling Logic ---
  const onMessageReceived = (payload: { body: string }) => {
    const notification = JSON.parse(payload.body);

    // 1. Lấy `senderId` một cách chính xác từ payload.
    const senderId = notification.senderId;

    // 2. Dùng `senderId` để tìm thông tin đầy đủ của người gửi
    // trong danh sách user đang kết nối.
    const sender = connectedUsers.find((user) => user.id === senderId);

    // 3. Lấy ra tên của người gửi để hiển thị (ưu tiên tên công ty).
    // Thêm tên dự phòng "Một người dùng" nếu không tìm thấy.
    const senderName =
      sender?.company?.name || sender?.name || "Một người dùng";

    // 4. So sánh ID một cách chính xác
    if (userSelectedRef.current?.id === senderId) {
      // Nếu đang mở đúng cửa sổ chat -> thêm tin nhắn vào
      const newMessage = {
        type: "receiver",
        content: notification.content,
        time: formatDate(new Date()),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    } else {
      // Nếu không -> hiển thị thông báo toast với tên người gửi đã tìm được
      toast.info(`Bạn có tin nhắn mới từ ${senderName}`);
    }
  };

  const onUserStatusChange = (payload: { body: string }) => {
    const updatedUser = JSON.parse(payload.body);
    setConnectedUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.email === updatedUser.email ? { ...u, status: updatedUser.status } : u
      )
    );
  };

  const formatDate = (timestamp: any) => {
    // 1. Khởi tạo các đối tượng Date cần thiết
    const messageDate = new Date(timestamp);
    if (isNaN(messageDate.getTime())) return "Ngày không hợp lệ"; // Kiểm tra ngày hợp lệ

    const now = new Date();

    // Tạo các bản sao của Date nhưng set giờ về 0 để so sánh ngày chính xác
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
      messageDate.getFullYear(),
      messageDate.getMonth(),
      messageDate.getDate()
    );

    // 2. Lấy chuỗi giờ và phút
    const hours = String(messageDate.getHours()).padStart(2, "0");
    const minutes = String(messageDate.getMinutes()).padStart(2, "0");
    const timeString = `${hours}:${minutes}`;

    // 3. So sánh và trả về định dạng phù hợp
    // --- Trường hợp 1: Tin nhắn trong ngày hôm nay ---
    if (startOfMessageDate.getTime() === startOfToday.getTime()) {
      return timeString; // Chỉ hiện giờ:phút (ví dụ: "14:30")
    }

    // --- Trường hợp 2: Tin nhắn từ ngày hôm qua ---
    if (startOfMessageDate.getTime() === startOfYesterday.getTime()) {
      return `Hôm qua lúc ${timeString}`; // Ví dụ: "Hôm qua lúc 09:15"
    }

    // --- Trường hợp 3: Tin nhắn cũ hơn ---
    const day = String(messageDate.getDate()).padStart(2, "0");
    const month = String(messageDate.getMonth() + 1).padStart(2, "0"); // Tháng trong JS bắt đầu từ 0
    const year = messageDate.getFullYear();
    return `${timeString} ${day}/${month}/${year}`; // Ví dụ: "10:20 05/07/2025"
  };
  const buildDataMessage = (dataMessages: any[] = []) => {
    const userId = user?.id;
    const results = dataMessages.map((data) => ({
      type: data?.sender?.id === userId ? "sender" : "receiver",
      content: data?.content,
      time: formatDate(data?.timeStamp),
    }));
    setMessages(results);
  };

  const fetchAllMessages = useCallback(async () => {
    if (!user?.id || !userSelected?.id) return;
    try {
      const res = await getAllMessages(+user.id, +userSelected.id);
      if (+res?.statusCode === 200) {
        buildDataMessage(res?.data ?? []);
      } else {
        toast.error("Lỗi khi tải tin nhắn!");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    }
  }, [user?.id, userSelected?.id]);

  useEffect(() => {
    let client: any = null;
    if (user?.email) {
      const socket = new SockJS(`${import.meta.env.VITE_BACKEND_URL}/ws`);
      client = Stomp.over(socket);
      client.connect(
        {},
        () => {
          if (client) {
            client.subscribe(
              `/user/${user.email}/queue/messages`,
              onMessageReceived
            );
            client.subscribe("/user/public", onUserStatusChange);
            client.send(
              "/app/user.addUser",
              {},
              JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.name,
                status: "ONLINE",
              })
            );
            setStompClient(client);
          }
        },
        (error: any) => {
          console.error("Lỗi kết nối WebSocket:", error);
        }
      );
    }

    const handleBeforeUnload = () => {
      if (client && client.connected) {
        client.send(
          "/app/user.disconnectUser",
          {},
          JSON.stringify({
            id: user?.id,
            email: user?.email,
            name: user?.name,
            status: "OFFLINE",
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      handleBeforeUnload();
      client?.disconnect(() => console.log("Đã ngắt kết nối WebSocket."));
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user?.id, user?.email, user?.name]);

  useEffect(() => {
    if (userSelected?.id) {
      setMessages([]);
      fetchAllMessages();
    }
  }, [userSelected?.id, fetchAllMessages]);

  // REMOVED: Auto-scrolling useEffect
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputMessage(e.target.value);
    },
    []
  );

  const handleSendMessage = () => {
    if (inputMessage.trim() && stompClient && userSelected) {
      const chatMessage = {
        sender: { id: user?.id },
        receiver: { id: userSelected.id },
        content: inputMessage.trim(),
        timeStamp: new Date(),
      };
      stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
      const newMessage = {
        type: "sender",
        content: inputMessage.trim(),
        time: formatDate(new Date()),
      };
      setMessages((prev) => [...prev, newMessage]);
      setInputMessage("");
    }
  };

  if (!user?.id) return null;

  useEffect(() => {
    // Thay "smooth" (mượt mà) thành "auto" (tự động/ngay lập tức)
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  // --- Render Method ---
  return (
    // The main container class is simplified for SCSS control
    <div className="chat-container">
      {/* Chat List / Sidebar */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <input
            type="search"
            placeholder="Search users..."
            className="form-control"
          />
        </div>
        <div className="user-list">
          {/* ... inside <div className="user-list"> */}
          {connectedUsers.length > 0 &&
            connectedUsers.map((u: UserInfo) => (
              <div
                key={u.id}
                className={`user-item ${
                  userSelected?.id === u.id ? "active" : ""
                }`}
                onClick={() => setUserSelected(u)}
              >
                <div className="position-relative">
                  <img
                    src={
                      // Ưu tiên hiển thị logo công ty nếu có
                      u.company?.logoUrl
                        ? `${import.meta.env.VITE_BACKEND_URL}/storage/company/${u.company.logoUrl}`
                        : // Nếu không, hiển thị avatar người dùng
                          u.avatar
                          ? `${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${u.avatar}`
                          : // Nếu không có cả hai, hiển thị ảnh mặc định
                            defaultAvatar
                    }
                    alt={u.company?.name || u.name} // Alt text là tên công ty hoặc tên người dùng
                    className="user-avatar"
                  />
                  <span
                    className={`status-indicator ${
                      u.status === "ONLINE" ? "online" : "offline"
                    }`}
                  ></span>
                </div>
                <div className="user-info">
                  {/* Hiển thị tên công ty nếu có, nếu không thì hiển thị tên người dùng */}
                  <h6 className="user-name">{u.company?.name || u.name}</h6>
                  <small className="user-status-text">
                    {u.status === "ONLINE" ? "Online" : "Offline"}
                  </small>
                </div>
              </div>
            ))}
          {/* ... */}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        {userSelected?.id ? (
          <>
            <header className="chat-header">
              <img
                src={
                  // Ưu tiên logo công ty nếu tồn tại
                  userSelected.company?.logoUrl
                    ? `${import.meta.env.VITE_BACKEND_URL}/storage/company/${userSelected.company.logoUrl}`
                    : // Tiếp theo là avatar người dùng
                      userSelected.avatar
                      ? `${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${userSelected.avatar}`
                      : // Cuối cùng là ảnh mặc định
                        defaultAvatar
                }
                alt={userSelected.company?.name || userSelected.name}
                className="user-avatar"
              />
              <div className="user-info">
                {/* Hiển thị tên công ty nếu có, nếu không thì hiển thị tên người dùng */}
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
                    className={`message-wrapper ${
                      isSender ? "sender" : "receiver"
                    }`}
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
              {/* REMOVED: div with ref for auto-scrolling */}
              <div ref={messagesEndRef} />
            </div>

            <footer className="chat-footer">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleSendMessage}
                >
                  gửi
                  <i className="bi bi-send-fill"></i>
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="no-chat-selected">
            <h4>Select a user to start chatting</h4>
            <p>Your conversations will appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
