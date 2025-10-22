// postcss.config.js
import purgecss from "@fullhuman/postcss-purgecss";

export default {
  plugins: [
    // Chỉ chạy purgecss khi build production
    process.env.NODE_ENV === "production"
      ? purgecss({
          // Đường dẫn đến TẤT CẢ các file có thể chứa class CSS
          content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

          // Giữ lại các class an toàn (ví dụ: class được thêm bởi JS, class của Antd)
          // Bạn cần thêm các class đặc biệt vào đây nếu thấy chúng bị xóa mất
          safelist: {
            standard: [
              "body",
              "html",
              // Thêm các class của Ant Design nếu bạn thấy bị lỗi style
              // Ví dụ: /ant-.*/
            ],
            deep: [
              // Giữ lại tất cả class con của Antd
              /ant-.*/,
              /rc-.*/,
            ],
          },

          // Hàm này giúp giữ lại các class của CSS Modules (ví dụ: .client_container__abc123)
          defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
        })
      : undefined,
  ],
};
