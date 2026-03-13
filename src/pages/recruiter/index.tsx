// src/pages/recruiter/index.tsx

import CompanyForm from "@/components/recruiter/CompanyForm";
import RecruiterDashboard from "@/components/recruiter/RecruiterDashboard";
import { useAppSelector } from "@/redux/hooks";
import { Container, Spinner } from "react-bootstrap";

const RecruiterPage = () => {
  const user = useAppSelector((state) => state.account.user);
  const isLoading = useAppSelector((state) => state.account.isLoading);
  const isAuthenticated = useAppSelector(
    (state) => state.account.isAuthenticated,
  );
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
    if (!isAuthenticated) {
      return (
        <div className="text-center my-5">
          <p className="text-danger h5">Phiên đăng nhập đã hết hạn.</p>
          <p>Vui lòng đăng nhập lại để tiếp tục.</p>
          {/* Bạn có thể thêm nút "Đăng nhập" ở đây */}
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

    return <CompanyForm />;
  };

  const NotAuthenticated = () => {
    return (
      <div className="text-center my-5">
        <p className="text-danger h5">Phiên đăng nhập đã hết hạn.</p>
        <p>Vui lòng đăng nhập lại để tiếp tục.</p>
        {/* Bạn có thể thêm nút "Đăng nhập" ở đây */}
      </div>
    );
  };
  return (
    <Container style={{ marginTop: "80px", minHeight: "calc(100vh - 160px)" }}>
      <h1 className="mb-4">Trang Dành Cho Nhà Tuyển Dụng</h1>
      {isAuthenticated ? renderContent() : NotAuthenticated()}

      {/* --- PHẦN THÊM VÀO CHO ĐỠ TRỐNG --- */}
      <hr className="my-5" />
      {/* <BenefitsSection /> */}
      {/* <FaqSection /> */}
      {/* --- KẾT THÚC PHẦN THÊM VÀO --- */}
    </Container>
  );
};

export default RecruiterPage;
