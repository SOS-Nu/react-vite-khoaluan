import { useEffect, useRef, useState } from "react";
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
import { ToastContainer } from "react-toastify";
import PaymentResult from "./components/payment/PaymentResult";

const LayoutClient = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);
  const isChatPage = location.pathname.startsWith("/chat"); // Kiểm tra nếu là trang chat

  useEffect(() => {
    if (rootRef && rootRef.current) {
      rootRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

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
        <Outlet context={[searchTerm, setSearchTerm]} />
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
