// src/pages/recruiter/index.tsx

import React from "react";
import { Container, Spinner } from "react-bootstrap";
import { useAppSelector } from "@/redux/hooks";
import BecomeVipRecruiter from "@/components/recruiter/BecomeVipRecruiter";
import CompanyForm from "@/components/recruiter/CompanyForm";
import RecruiterDashboard from "@/components/recruiter/RecruiterDashboard";

const RecruiterPage = () => {
  const user = useAppSelector((state) => state.account.user);
  const isLoading = useAppSelector((state) => state.account.isLoading);

  const renderContent = () => {
    // Trường hợp 1: Đang tải thông tin user
    if (isLoading) {
      return (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      );
    }

    // Sửa đổi ở đây: Nếu đã có công ty, hiển thị Dashboard
    if (user.company) {
      return <RecruiterDashboard />;
    }

    // Trường hợp 2: User đã có công ty -> Hiển thị form quản lý/cập nhật
    if (user.company) {
      return <CompanyForm initialData={user.company} />;
    }

    // Trường hợp 3: User là VIP nhưng chưa có công ty -> Hiển thị form tạo mới
    if (user.vip) {
      return <CompanyForm />;
    }

    // Trường hợp 4: User chưa phải VIP -> Hiển thị component yêu cầu nâng cấp
    return <BecomeVipRecruiter />;
  };

  return (
    <Container style={{ marginTop: "80px", minHeight: "calc(100vh - 160px)" }}>
      <h1 className="mb-4">Trang Dành Cho Nhà Tuyển Dụng</h1>
      {renderContent()}
    </Container>
  );
};

export default RecruiterPage;
