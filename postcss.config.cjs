// postcss.config.cjs

module.exports = {
  plugins: [
    // Bỏ HẾT code của purgeCss.
    // Bạn có thể giữ lại autoprefixer nếu cần,
    // hoặc để trống như này nếu không cần gì cả.
  ],
};
//thêm vào chế độ chạy uat ở packagejson
// --emptyOutDir
