// File: axios-custumize.ts (ĐÃ SỬA)

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

const handleRefreshToken = async (): Promise<string | null> => {
  return await mutex.runExclusive(async () => {
    // Request này sẽ KHÔNG bị gắn 'Authorization' header (do logic mới ở dưới)
    const res = await instance.get<IBackendRes<AccessTokenResponse>>(
      "/api/v1/auth/refresh"
    );
    if (res && res.data) return res.data.access_token;
    else return null;
  });
};

// =================================================================
// === ĐÂY LÀ PHẦN THAY ĐỔI QUAN TRỌNG NHẤT (REQUEST INTERCEPTOR) ===
// =================================================================
instance.interceptors.request.use(function (config) {
  // Danh sách các URL không bao giờ được gửi kèm Authorization header
  const publicPaths = [
    "/api/v1/auth/login",
    "/api/v1/auth/refresh",
    "/api/v1/auth/register",
    "/api/v1/auth/send-otp",
    "/api/v1/auth/google",
    "/api/v1/auth/verify-otp-change-password",
    "/api/v1/auth/register/send-otp",
    "/api/v1/auth/register",
    // Thêm các URL public khác nếu bạn có, ví dụ:
    // "/api/v1/auth/send-otp",
    // "/api/v1/auth/verify-otp-change-password"
  ];

  // Kiểm tra xem URL của request có nằm trong danh sách public không
  // Dùng startsWith để xử lý trường hợp như /api/v1/auth/register/google
  const isPublicPath = publicPaths.some((path) => config.url?.startsWith(path));

  const accessToken = window.localStorage.getItem("access_token");

  // Chỉ đính kèm token nếu:
  // 1. Token tồn tại
  // 2. URL *KHÔNG* nằm trong danh sách public
  if (accessToken && !isPublicPath) {
    config.headers.Authorization = "Bearer " + accessToken;
  }

  // >>> Logic gắn header ngôn ngữ (Giữ nguyên) <<<
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
// === KẾT THÚC PHẦN THAY ĐỔI ===
// =================================================================

/**
 * Handle all responses.
 */
instance.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    // Logic 401 của bạn đã tốt, vì nó đã loại trừ /api/v1/auth/login
    // Giờ nó sẽ không bao giờ bị kích hoạt cho /login nữa,
    // vì request /login (đã sửa) sẽ không bao giờ gửi token hết hạn.
    if (
      error.config &&
      error.response &&
      +error.response.status === 401 &&
      !error.config.url.includes("/api/v1/auth/login") && // Dùng includes cho an toàn
      !error.config.headers[NO_RETRY_HEADER]
    ) {
      const access_token = await handleRefreshToken();
      error.config.headers[NO_RETRY_HEADER] = "true";
      if (access_token) {
        error.config.headers["Authorization"] = `Bearer ${access_token}`;
        localStorage.setItem("access_token", access_token);
        return instance.request(error.config);
      }
    }

    // Logic xử lý khi refresh token thất bại (Đã tốt)
    if (
      error.config &&
      error.response &&
      +error.response.status === 400 &&
      error.config.url === "/api/v1/auth/refresh" &&
      location.pathname.startsWith("/admin")
    ) {
      const message =
        error?.response?.data?.error ?? "Có lỗi xảy ra, vui lòng login.";
      //dispatch redux action
      store.dispatch(setRefreshTokenAction({ status: true, message }));
    }

    // Logic 403 (Đã tốt)
    if (+error.response.status === 403) {
      notification.error({
        message: error?.response?.data?.message ?? "",
        description: error?.response?.data?.error ?? "",
      });
    }

    return error?.response?.data ?? Promise.reject(error);
  }
);

export default instance;
