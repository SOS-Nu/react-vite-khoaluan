import { getAllMessages } from "@/config/api";

import { useUsersConnected } from "@/hooks/useUsersConnected";

import { useAppSelector } from "@/redux/hooks";

import { Stomp } from "@stomp/stompjs";

import { useCallback, useEffect, useRef, useState } from "react";

import { useLocation } from "react-router-dom";

import { toast } from "react-toastify";

import SockJS from "sockjs-client";

import { getFirebaseImageUrl } from "./getFirebaseImageURL";

// --- Định nghĩa các kiểu dữ liệu (TypeScript Interfaces) ---

// Cập nhật: đổi firstName thành name

interface UserInfo {
  id: number;

  email: string;

  name: string; // <--- THAY ĐỔI

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

  const [isChatListVisible, setIsChatListVisible] = useState(true);

  const [stompClient, setStompClient] = useState<any>(null);

  const [userSelected, setUserSelected] = useState<UserInfo | null>(
    location?.state?.receiver ?? null
  );

  const [inputMessage, setInputMessage] = useState<string>("");

  const [messages, setMessages] = useState<any[]>([]);

  // Sử dụng ref để có giá trị userSelected mới nhất trong closure của WebSocket

  const userSelectedRef = useRef(userSelected);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Dùng state để quản lý danh sách user, giúp cập nhật status real-time

  const { res: resUsersConnected } = useUsersConnected();

  const [connectedUsers, setConnectedUsers] = useState<UserInfo[]>([]);

  useEffect(() => {
    document.title = "Tin nhắn";

    userSelectedRef.current = userSelected;
  }, [userSelected]);

  // Cập nhật state `connectedUsers` khi có dữ liệu từ hook

  useEffect(() => {
    if (resUsersConnected?.data) {
      setConnectedUsers(resUsersConnected.data);
    }
  }, [resUsersConnected]);

  // --- Các hàm xử lý sự kiện và logic ---

  const onMessageReceived = (payload: { body: string }) => {
    const notification = JSON.parse(payload.body); // Đây là ChatNotificationDTO

    // Nếu đang chat với người gửi, thêm tin nhắn vào cửa sổ chat

    if (userSelectedRef.current?.id === notification.senderId) {
      const newMessage = {
        type: "receiver",

        content: notification.content,

        time: formatDate(new Date()), // Tin nhắn mới hiển thị giờ hiện tại
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
    } else {
      // Nếu không, chỉ hiển thị thông báo

      toast.info("Bạn có tin nhắn mới!");
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
    const date = new Date(timestamp);

    if (isNaN(date.getTime())) return "Invalid date";

    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes()
      ).padStart(2, "0")}`;
    } else {
      return `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1
      ).padStart(2, "0")}/${date.getFullYear()}`;
    }
  };

  const buildDataMessage = (dataMessages: any[] = []) => {
    const userId = user?.id;

    const results = dataMessages.map((data) => ({
      type: data?.sender?.id === userId ? "sender" : "receiver",

      content: data?.content,

      // Cập nhật: dùng timeStamp thay vì createdAt

      time: formatDate(data?.timeStamp), // <--- THAY ĐỔI
    }));

    setMessages(results);
  };

  const fetchAllMessages = useCallback(async () => {
    if (!user?.id || !userSelected?.id) return;
    try {
      const res = await getAllMessages(+user.id, +userSelected.id);

      // SỬA Ở ĐÂY: Bỏ ".data" khi truy cập
      if (+res?.statusCode === 200) {
        // SỬA Ở ĐÂY: Truyền `res.data` thay vì `res.data.data`
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
            // Lắng nghe tin nhắn cá nhân

            client.subscribe(
              `/user/${user.email}/queue/messages`,

              onMessageReceived
            );

            // Lắng nghe trạng thái online/offline của user khác

            client.subscribe("/user/public", onUserStatusChange);

            // Gửi thông tin user hiện tại lên để báo online

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
      setMessages([]); // Xóa tin nhắn cũ trước khi fetch tin nhắn mới

      fetchAllMessages();
    }
  }, [userSelected?.id, fetchAllMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  // --- Phần render với Bootstrap ---

  return (
    <div className="d-flex vh-100 pt-5">
      {/* Left Sidebar (Icons) */}

      <aside
        className="d-flex flex-column align-items-center p-3 border-end"
        style={{ width: "80px" }}
      >
        <button
          onClick={() => setIsChatListVisible(!isChatListVisible)}
          className="btn btn-primary mb-4"
        >
          <i className="bi bi-list"></i>
        </button>

        <nav className="flex-grow-1">
          <a href="#" className="position-relative d-block">
            <div className="btn btn-outline-secondary position-relative">
              <i className="bi bi-chat-dots-fill"></i>

              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {connectedUsers.length}
              </span>
            </div>
          </a>
        </nav>
      </aside>

      {/* Chat List */}

      {isChatListVisible && (
        <aside
          className="d-none d-lg-block border-end"
          style={{ width: "320px" }}
        >
          <div className="p-3">
            <input
              type="search"
              placeholder="Search"
              className="form-control"
            />
          </div>

          <div
            className="overflow-auto"
            style={{ height: "calc(100vh - 120px)" }}
          >
            <div className="list-group list-group-flush">
              {connectedUsers.length > 0 &&
                connectedUsers.map((u: UserInfo) => (
                  <button
                    key={u.id}
                    className={`list-group-item list-group-item-action ${
                      userSelected?.id === u.id ? "active" : ""
                    }`}
                    onClick={() => setUserSelected(u)}
                  >
                    <div className="d-flex align-items-center">
                      <img
                        src={
                          u.role?.id === 2
                            ? getFirebaseImageUrl(u.avatar, "companies")
                            : getFirebaseImageUrl(u.avatar, "users")
                        }
                        alt={u.name} // <--- THAY ĐỔI
                        className="rounded-circle me-3"
                        style={{
                          width: "50px",

                          height: "50px",

                          objectFit: "cover",
                        }}
                      />

                      <div className="flex-grow-1">
                        {/* // Cập nhật: dùng u.name */}

                        <h6 className="mb-0 text-truncate">{u.name}</h6>

                        <small className="text-muted">Click to chat</small>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </aside>
      )}

      {/* Main Chat Area */}

      <main className="d-flex flex-column flex-grow-1 position-relative">
        {userSelected?.id ? (
          <>
            <header className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <div>
                {/* // Cập nhật: dùng userSelected.name */}

                <h5 className="mb-0">{userSelected.name}</h5>

                {userSelected.status === "ONLINE" ? (
                  <span className="text-success small">
                    <i className="bi bi-circle-fill me-1"></i> Online
                  </span>
                ) : (
                  <span className="text-secondary small">
                    <i className="bi bi-circle-fill me-1"></i> Offline
                  </span>
                )}
              </div>
            </header>

            <div
              className="flex-grow-1 overflow-auto p-4"
              style={{ maxHeight: "calc(100vh - 220px)" }} // Điều chỉnh chiều cao
            >
              {messages.map((message: any, index: any) => {
                const isSender = message.type === "sender";

                return (
                  <div
                    key={index}
                    className={`d-flex mb-3 ${isSender ? "justify-content-end" : "justify-content-start"}`}
                  >
                    <div
                      className="d-flex align-items-end"
                      style={{ maxWidth: "70%" }}
                    >
                      {!isSender && (
                        <img
                          src={
                            userSelected.role?.id === 2
                              ? getFirebaseImageUrl(
                                  userSelected.avatar,

                                  "companies"
                                )
                              : getFirebaseImageUrl(
                                  userSelected.avatar,

                                  "users"
                                )
                          }
                          alt="avatar"
                          className="rounded-circle me-2"
                          style={{ width: "40px", height: "40px" }}
                        />
                      )}

                      <div>
                        <div
                          className={`p-3 rounded-3 ${isSender ? "bg-primary text-white" : "bg-light text-dark"}`}
                        >
                          <p className="mb-0">{message.content}</p>
                        </div>

                        <small
                          className={`text-muted d-block ${isSender ? "text-end" : "text-start"} mt-1`}
                        >
                          {message.time}
                        </small>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            <footer className="p-3 bg-white border-top mt-auto">
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
                  <i className="bi bi-send-fill"></i>
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="d-flex flex-grow-1 justify-content-center align-items-center text-muted">
            <h4>Chọn một người để bắt đầu trò chuyện</h4>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
