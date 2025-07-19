// AppContext.tsx

import { createContext, useContext, useEffect, useState } from "react";
// 1. Import các thành phần cần thiết từ antd
import { ConfigProvider, theme as antdTheme } from "antd";

interface IAppContext {
  theme: ThemeContextType;
  setTheme: (v: ThemeContextType) => void;
}

type ThemeContextType = "light" | "dark";

const AppContext = createContext<IAppContext | null>(null);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [theme, setThemeState] = useState<ThemeContextType>(() => {
    // Logic khởi tạo theme của bạn vẫn giữ nguyên
    const initialTheme =
      (localStorage.getItem("theme") as ThemeContextType) || "light";
    return initialTheme;
  });

  // Tạo một hàm setTheme mới để vừa cập nhật state, vừa lưu vào localStorage
  const setTheme = (newTheme: ThemeContextType) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    // Bạn vẫn có thể giữ dòng này nếu dùng chung với Bootstrap
    document.documentElement.setAttribute("data-bs-theme", newTheme);
  };

  useEffect(() => {
    // Logic này chỉ cần chạy một lần lúc khởi tạo để set thuộc tính cho <html>
    const initialTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-bs-theme", initialTheme);
  }, []);

  // 2. Định nghĩa cấu hình theme cho Ant Design
  const themeConfig = {
    // Sử dụng thuật toán theme tương ứng từ Ant Design
    // theme.darkAlgorithm cho theme tối
    // theme.defaultAlgorithm cho theme sáng
    algorithm:
      theme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {/* 3. Bọc children bằng ConfigProvider và truyền theme vào */}
      <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>
    </AppContext.Provider>
  );
};

export const useCurrentApp = () => {
  const currentAppContext = useContext(AppContext);

  if (!currentAppContext) {
    throw new Error(
      "useCurrentApp has to be used within <AppContext.Provider>"
    );
  }

  return currentAppContext;
};
