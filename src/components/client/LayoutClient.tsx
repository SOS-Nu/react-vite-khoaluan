// src/components/client/LayoutClient.tsx

import { useWebSocket } from "@/hooks/useWebSocket"; // Import hook mới
import Footer from "components/client/footer.client";
import Header from "components/client/header.client";
import ScrollToTop from "components/share/scroll.to.top";
import { useRef, useState } from "react";
import { FaRegMessage } from "react-icons/fa6";
import { Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import styles from "styles/app.module.scss"; // Bạn có thể cần điều chỉnh đường dẫn

export const LayoutClient = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const [showChatbot, setShowChatbot] = useState(false);

  const isAdminPage = location.pathname.startsWith("/admin");
  const isChatPage = location.pathname.startsWith("/chat");

  // Gọi hook để kích hoạt logic WebSocket
  const { stompClient } = useWebSocket();

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
        {/* Truyền stompClient qua Context cho các component con */}
        <Outlet context={{ stompClient: stompClient }} />
      </div>
      {!isChatPage && <Footer />}

      {!isAdminPage && !isChatPage && (
        <>
          <button
            onClick={() => setShowChatbot(true)}
            className="chatbot-trigger-btn"
          >
            <FaRegMessage size={18} />
          </button>
        </>
      )}
    </div>
  );
};
