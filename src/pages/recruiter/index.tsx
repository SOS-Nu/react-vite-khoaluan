// Trong file: src/pages/recruiter/index.tsx

import React from "react";
import { Container } from "react-bootstrap";

const RecruiterPage = () => {
  return (
    <Container style={{ marginTop: "80px", minHeight: "calc(100vh - 160px)" }}>
      <h1>Trang Quản lý cho Nhà Tuyển Dụng</h1>
      <p>
        Chào mừng bạn đến với khu vực dành riêng cho nhà tuyển dụng. Tại đây bạn
        có thể đăng tin, quản lý hồ sơ ứng viên và nhiều hơn nữa.
      </p>
      {/* Thêm các component khác cho trang này ở đây */}
    </Container>
  );
};

export default RecruiterPage;
