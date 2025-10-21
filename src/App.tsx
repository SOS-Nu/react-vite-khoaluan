// App.tsx

import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAccount } from "./redux/slice/accountSlide";
import { router } from "./router"; // Import router từ file mới

// Import CSS chính
import "react-toastify/dist/ReactToastify.css";
import "./styles/app.module.scss"; // Tùy chỉnh đường dẫn nếu cần
import Loading from "./components/share/loading";

export default function App() {
  const dispatch = useAppDispatch();
  // const isLoading = useAppSelector((state) => state.account.isLoading);

  // Logic này giữ lại App.tsx là hợp lý vì nó chạy 1 lần khi app khởi động
  useEffect(() => {
    if (
      window.location.pathname === "/login" ||
      window.location.pathname === "/register"
    )
      return;
    dispatch(fetchAccount());
  }, [dispatch]);

  // Nếu bạn muốn hiển thị loading toàn trang khi fetchAccount
  // if (isLoading) {
  //   return <Loading />;
  // }

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
