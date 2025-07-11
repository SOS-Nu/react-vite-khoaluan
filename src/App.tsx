import { useCallback, useEffect, useRef, useState } from "react";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import NotFound from "components/share/not.found";
import Loading from "components/share/loading";
import LoginPage from "pages/auth/login";
import RegisterPage from "pages/auth/register";
import LayoutAdmin from "components/admin/layout.admin";
import ProtectedRoute from "components/share/protected-route.ts";
import Header from "components/client/header.client";
import Footer from "components/client/footer.client";
import HomePage from "pages/home";
import styles from "styles/app.module.scss";
import DashboardPage from "./pages/admin/dashboard";
import CompanyPage from "./pages/admin/company";
import PermissionPage from "./pages/admin/permission";
import ResumePage from "./pages/admin/resume";
import RolePage from "./pages/admin/role";
import UserPage from "./pages/admin/user";
import { fetchAccount } from "./redux/slice/accountSlide";
import LayoutApp from "./components/share/layout.app";
import ViewUpsertJob from "./components/admin/job/upsert.job";
import ClientJobPage from "./pages/job";

import ClientCompanyPage from "./pages/company";
import ClientCompanyDetailPage from "./pages/company/detail";
import JobTabs from "./pages/admin/job/job.tabs";
import { App as AntdApp } from "antd";

import { AppContextProvider } from "./components/context/app.context";
import RecruiterPage from "./pages/recruiter";
import ScrollToTop from "./components/share/scroll.to.top";
import CreateOnlineResumePage from "./pages/resume/create-online";
import PublicCvPage from "./pages/user/public-cv";
import ChatPage from "./pages/chat/ChatPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import PaymentResult from "./components/payment/PaymentResult";
import { addMessage, setMessages } from "./redux/slice/chatSlice";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { useUsersConnected } from "./hooks/useUsersConnected";
import { UserInfo } from "./types/backend";

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
    date.getFullYear(),
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

const LayoutClient = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<any>(null);

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.account.user);
  const activeChatUserId = useAppSelector(
    (state) => state.chat.activeChatUserId
  );

  const { res: resUsersConnected } = useUsersConnected();
  const [connectedUsers, setConnectedUsers] = useState<UserInfo[]>([]);

  useEffect(() => {
    if (resUsersConnected?.data) {
      setConnectedUsers(resUsersConnected.data);
    }
  }, [resUsersConnected]);

  const activeChatUserIdRef = useRef(activeChatUserId);
  const connectedUsersRef = useRef(connectedUsers);

  useEffect(() => {
    activeChatUserIdRef.current = activeChatUserId;
    connectedUsersRef.current = connectedUsers;
  }, [activeChatUserId, connectedUsers]);

  const isChatPage = location.pathname.startsWith("/chat");
  // --- Nâng cấp onUserStatusChange ---
  const onUserStatusChange = useCallback((payload: { body: string }) => {
    const updatedUser = JSON.parse(payload.body);
    setConnectedUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.email === updatedUser.email ? { ...u, status: updatedUser.status } : u
      )
    );
  }, []);

  // Main WebSocket Connection Effect

  useEffect(() => {
    // 1. Điều kiện tiên quyết: Chỉ thực hiện khi người dùng đã đăng nhập (có email)
    if (!user?.email) return;

    // --- Hàm xử lý khi nhận được tin nhắn mới ---
    const onMessageReceived = (payload: { body: string }) => {
      const notification = JSON.parse(payload.body);
      const { senderId, content, timeStamp } = notification;

      // Cập nhật state `connectedUsers` để hiển thị tin nhắn mới nhất trên sidebar
      setConnectedUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === senderId
            ? {
                ...u,
                lastMessage: {
                  content: content,
                  senderId: senderId,
                  timestamp: timeStamp,
                },
              }
            : u
        )
      );

      const sender = connectedUsersRef.current.find((u) => u.id === senderId);

      // Hiển thị thông báo (toast) nếu không ở trong cuộc trò chuyện với người gửi
      if (senderId !== activeChatUserIdRef.current) {
        const senderName =
          sender?.company?.name || sender?.name || "Một người dùng";
        toast.info(`Bạn có tin nhắn mới từ ${senderName}`);
      }

      // Chỉ thêm tin nhắn vào Redux store nếu đang mở đúng cửa sổ chat của người gửi
      if (user && senderId === activeChatUserIdRef.current) {
        const newMessage = {
          type: "receiver", // Tin nhắn nhận được
          content: content,
          time: formatDate(new Date(timeStamp)),
        };
        dispatch(addMessage(newMessage));
      }
    };

    // 2. Ngăn chặn việc tạo kết nối lặp lại nếu đã có kết nối
    if (stompClientRef.current) {
      return;
    }

    // 3. Khởi tạo kết nối WebSocket
    const socket = new SockJS(`${import.meta.env.VITE_BACKEND_URL}/ws`);
    const client = Stomp.over(socket);
    stompClientRef.current = client; // Lưu lại instance của client để sử dụng ở các nơi khác

    // Tắt log debug của StompJS ra console
    client.debug = () => {};

    // 4. Kết nối tới server
    client.connect({}, () => {
      // a. Đăng ký nhận tin nhắn riêng tư (chỉ user hiện tại nhận được)
      client.subscribe(`/user/${user.email}/queue/messages`, onMessageReceived);

      // b. Đăng ký nhận các cập nhật trạng thái chung (online/offline) từ tất cả user
      client.subscribe("/user/public", onUserStatusChange);

      // c. Gửi thông tin của người dùng hiện tại lên server để thông báo "tôi đã online"
      client.send(
        "/app/user.addUser",
        {},
        JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          company: user.company,
          status: "ONLINE",
        })
      );
    });

    // 5. Hàm dọn dẹp (cleanup function) -> sẽ chạy khi component unmount
    return () => {
      if (stompClientRef.current?.connected) {
        // Ngắt kết nối khỏi WebSocket server
        stompClientRef.current.disconnect();
        stompClientRef.current = null; // Reset ref để có thể kết nối lại sau này
      }
    };
  }, [user, dispatch, onUserStatusChange]); // Mảng phụ thuộc của useEffect

  return (
    <div className="layout-app" ref={rootRef}>
      <ScrollToTop />
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className={styles["content-app"]}>
        <Outlet context={{ stompClient: stompClientRef.current }} />
      </div>
      {!isChatPage && <Footer />}
    </div>
  );
};
const queryClient = new QueryClient();

export default function App() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.account.isLoading);

  useEffect(() => {
    if (
      window.location.pathname === "/login" ||
      window.location.pathname === "/register"
    )
      return;
    dispatch(fetchAccount());
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <QueryClientProvider client={queryClient}>
          <AppContextProvider>
            <LayoutApp>
              <LayoutClient />
            </LayoutApp>
          </AppContextProvider>
        </QueryClientProvider>
      ),
      errorElement: <NotFound />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "job", element: <ClientJobPage /> },
        // { path: "job/:id", element: <ClientJobDetailPage /> },
        { path: "company", element: <ClientCompanyPage /> },
        { path: "company/:id", element: <ClientCompanyDetailPage /> },
        {
          path: "recruiter",
          element: (
            <ProtectedRoute>
              <RecruiterPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "resume/create",
          element: (
            <ProtectedRoute>
              <CreateOnlineResumePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "user/online-resumes/:id",
          element: <PublicCvPage />,
        },
        // {
        //   path: "chat/detail",
        //   element: (
        //     <ProtectedRoute>
        //       <ChatPage />
        //     </ProtectedRoute>
        //   ),
        // },
        {
          path: "/payment/result",
          element: (
            <ProtectedRoute>
              <PaymentResult />
            </ProtectedRoute>
          ),
        },
        {
          path: "chat/detail", // đường dẫn tương đối
          element: (
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          ),
        },
        // { path: "chat", element: <ChatPage /> },
      ],
    },

    {
      path: "/admin",
      element: (
        <AntdApp>
          <LayoutApp>
            <LayoutAdmin />{" "}
          </LayoutApp>
        </AntdApp>
      ),
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "company",
          element: (
            <ProtectedRoute>
              <CompanyPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "user",
          element: (
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          ),
        },

        {
          path: "job",
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute>
                  <JobTabs />
                </ProtectedRoute>
              ),
            },
            {
              path: "upsert",
              element: (
                <ProtectedRoute>
                  <ViewUpsertJob />
                </ProtectedRoute>
              ),
            },
          ],
        },

        {
          path: "resume",
          element: (
            <ProtectedRoute>
              <ResumePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "permission",
          element: (
            <ProtectedRoute>
              <PermissionPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "role",
          element: (
            <ProtectedRoute>
              <RolePage />
            </ProtectedRoute>
          ),
        },
      ],
    },

    {
      path: "/login",
      element: <LoginPage />,
    },

    {
      path: "/register",
      element: <RegisterPage />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
