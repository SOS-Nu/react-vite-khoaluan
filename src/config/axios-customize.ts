// File: axios-custumize.ts (ĐÃ CẬP NHẬT LOGIC 401)

import { IBackendRes } from "@/types/backend";
import { Mutex } from "async-mutex";
import axiosClient from "axios";
import { store } from "@/redux/store";
import { setRefreshTokenAction } from "@/redux/slice/accountSlide";
import { notification } from "antd";
import i18next from "i18next";
interface AccessTokenResponse {
  access_token: string;
}

const instance = axiosClient.create({
  baseURL: import.meta.env.VITE_BACKEND_URL as string,
  withCredentials: true,
});

const mutex = new Mutex();
const NO_RETRY_HEADER = "x-no-retry";

// Hàm này của bạn đã tốt, giữ nguyên
const handleRefreshToken = async (): Promise<string | null> => {
  return await mutex.runExclusive(async () => {
    // Request này sẽ KHÔNG bị gắn 'Authorization' header (do logic mới ở dưới)
    const res = await instance.get<IBackendRes<AccessTokenResponse>>(
      "/api/v1/auth/refresh"
    );

    // `res` ở đây là `res.data` từ interceptor response thành công
    // Giả sử IBackendRes là { data: { access_token: "..." }, message: "..." }
    if (res && res.data && res.data.access_token) {
      return res.data.access_token;
    } else {
      // Trường hợp 200 OK nhưng không có token
      throw new Error(res.message ?? "Refresh token failed or expired");
    }
  });
};

// Request interceptor của bạn đã tốt, giữ nguyên
instance.interceptors.request.use(function (config) {
  const publicPaths = [
    "/api/v1/auth/login",
    "/api/v1/auth/refresh",
    "/api/v1/auth/register",
    "/api/v1/auth/send-otp",
    "/api/v1/auth/google",
    "/api/v1/auth/verify-otp-change-password",
    "/api/v1/auth/register/send-otp",
    "/api/v1/auth/register",
  ];

  const isPublicPath = publicPaths.some((path) => config.url?.startsWith(path));
  const accessToken = window.localStorage.getItem("access_token");

  if (accessToken && !isPublicPath) {
    config.headers.Authorization = "Bearer " + accessToken;
  }

  const language = i18next.language;
  if (language) {
    config.headers["Accept-Language"] = language;
  }

  if (!config.headers.Accept && config.headers["Content-Type"]) {
    config.headers.Accept = "application/json";
    config.headers["Content-Type"] = "application/json; charset=utf-8";
  }
  return config;
});

// =================================================================
// === THAY THẾ TOÀN BỘ LOGIC RESPONSE INTERCEPTOR CỦA BẠN ===
// =================================================================
instance.interceptors.response.use(
  (res) => res.data, // Giữ nguyên logic thành công
  async (error) => {
    // Chỉ xử lý khi có config, response và status
    if (!error.config || !error.response) {
      return Promise.reject(error);
    }

    // === ĐỊNH NGHĨA MESSAGE LOGOUT ===
    // Chỉ logout khi gặp message này
    const logoutMessage = "Refresh Token không hợp lệ (Session không tồn tại)";

    // Logic 401 (Thử refresh)
    if (
      +error.response.status === 401 &&
      !error.config.headers[NO_RETRY_HEADER]
    ) {
      // Lỗi 401 từ /refresh hoặc /login -> Lỗi "cứng"
      if (
        error.config.url.includes("/api/v1/auth/refresh") ||
        error.config.url.includes("/api/v1/auth/login")
      ) {
        const message =
          error?.response?.data?.message ??
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";

        // === SỬA ĐỔI VỊ TRÍ 1 ===
        // Chỉ logout nếu message khớp
        if (message === logoutMessage) {
          store.dispatch(setRefreshTokenAction({ status: true, message }));
        }

        return Promise.reject(error.response?.data ?? error);
      }

      // Lỗi 401 từ các API khác (fetchAccount, ...) -> Thử refresh
      try {
        const newAccessToken = await handleRefreshToken();

        if (newAccessToken) {
          // 1. Lưu token mới
          window.localStorage.setItem("access_token", newAccessToken);
          // 2. Cập nhật header cho request *gốc*
          error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
          // 3. Đánh dấu là đã retry
          error.config.headers[NO_RETRY_HEADER] = "true";
          // 4. Thực hiện lại request gốc
          return instance(error.config);
        } else {
          throw new Error("Không thể lấy token mới.");
        }
      } catch (refreshError: any) {
        // Các lỗi khác (như "Không có cookie") sẽ chỉ reject mà không logout
        return Promise.reject(refreshError);
      }
    }

    // Logic 400 (Lỗi 400 từ /refresh gọi trực tiếp, ví dụ từ ChangePasswordTab)
    if (
      +error.response.status === 400 &&
      error.config.url === "/api/v1/auth/refresh"
    ) {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        "Có lỗi xảy ra, vui lòng login.";

      // === VỊ TRÍ 3 (Giữ nguyên) ===
      // Đây sẽ là nơi DUY NHẤT xử lý lỗi 400 từ /refresh
      if (message === logoutMessage) {
        store.dispatch(setRefreshTokenAction({ status: true, message }));
      }
    }

    // Logic 403 (Giữ nguyên)
    if (+error.response.status === 403) {
      notification.error({
        message: error?.response?.data?.message ?? "",
        description: error?.response?.data?.error ?? "",
      });
    }

    // Trả về lỗi cho các trường hợp khác
    return Promise.reject(error.response?.data ?? error);
  }
);
// =================================================================
// === KẾT THÚC PHẦN THAY ĐỔI ===
// =================================================================

export default instance;
