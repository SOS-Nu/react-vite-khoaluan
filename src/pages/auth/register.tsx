// src/pages/auth/register.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Button,
  InputGroup,
  Spinner,
  Container,
} from "react-bootstrap";
import { message, notification } from "antd";
import { IUser } from "@/types/backend";
import { callRegister, callSendOtp } from "@/config/api";
import styles from "styles/auth.module.scss";
import { FaArrowLeft } from "react-icons/fa";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);

  // State để quản lý các bước (1: điền form, 2: nhập OTP)
  const [step, setStep] = useState(1);

  // State để lưu trữ dữ liệu form từ bước 1
  const [formData, setFormData] = useState<IUser | null>(null);

  // State cho mã OTP
  const [otp, setOtp] = useState("");

  // Hàm xử lý khi submit form ở bước 1 (Gửi OTP)
  const handleSendOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmit(true);

    try {
      // --- CÁCH LẤY DỮ LIỆU FORM AN TOÀN HƠN ---
      const form = event.currentTarget;
      const data = new FormData(form);
      const formValues = Object.fromEntries(data.entries());

      const userData: IUser = {
        name: formValues.name as string,
        email: formValues.email as string,
        password: formValues.password as string,
        age: +(formValues.age as string), // Dấu '+' để chuyển string sang number
        gender: formValues.gender as string,
        address: formValues.address as string,
      };

      // === BẮT ĐẦU DEBUG ===
      console.log("Bước 1: Dữ liệu form đã thu thập:", userData);

      // Kiểm tra xem dữ liệu có hợp lệ không trước khi tiếp tục
      if (!userData.email || !userData.name || !userData.password) {
        notification.error({
          message: "Vui lòng điền đầy đủ thông tin bắt buộc.",
        });
        setIsSubmit(false);
        return;
      }

      setFormData(userData); // Lưu dữ liệu sạch vào state

      const res = await callSendOtp(userData.email);
      console.log("Bước 2: Kết quả từ API send-otp:", res);

      // Điều kiện kiểm tra thành công chặt chẽ hơn
      // Giả sử API thành công sẽ trả về một đối tượng có chứa 'message' hoặc có statusCode là 200/201
      if (res && res.message) {
        console.log("Bước 3: API thành công, chuẩn bị chuyển sang bước 2...");
        message.success("Mã OTP đã được gửi đến email của bạn!");

        setStep(2);

        console.log("Bước 4: Đã gọi hàm setStep(2)!");
      } else {
        // Trường hợp API trả về 200 OK nhưng body là lỗi logic
        console.error("API không trả về kết quả thành công mong đợi.", res);
        notification.error({
          message: "Phản hồi không hợp lệ",
          description:
            res?.message || "Không nhận được phản hồi thành công từ máy chủ.",
        });
      }
    } catch (error: any) {
      console.error("Đã xảy ra lỗi trong quá trình gửi OTP:", error);
      notification.error({
        message: "Có lỗi xảy ra",
        description:
          error?.response?.data?.message ||
          "Không thể gửi OTP, vui lòng thử lại.",
      });
    } finally {
      console.log("Bước 5: Hoàn tất xử lý, setIsSubmit(false)");
      setIsSubmit(false);
    }
  };

  // Hàm xử lý khi hoàn tất đăng ký ở bước 2
  const handleCompleteRegistration = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!formData || !otp) {
      notification.error({
        message: "Dữ liệu không hợp lệ hoặc thiếu mã OTP.",
      });
      return;
    }

    setIsSubmit(true);
    const { name, email, password, age, gender, address } = formData;
    try {
      const res = await callRegister(
        name,
        email,
        password as string,
        age,
        gender,
        address,
        otp
      );
      if (res?.data?.id) {
        message.success("Đăng ký tài khoản thành công!");
        navigate("/login");
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description:
            res.message && Array.isArray(res.message)
              ? res.message[0]
              : res.message,
          duration: 5,
        });
      }
    } catch (error: any) {
      notification.error({
        message: "Có lỗi xảy ra",
        description:
          error?.response?.data?.message ||
          "Đăng ký thất bại, vui lòng thử lại.",
      });
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <div
      className={`${styles["login-page-bootstrap"]} vh-100 d-flex align-items-center justify-content-center`}
    >
      <Card className={styles["login-card"]}>
        <Card.Body>
          {/* === STEP 2: NHẬP OTP === */}
          {step === 2 && (
            <Form onSubmit={handleCompleteRegistration}>
              <div
                onClick={() => setStep(1)}
                className="d-flex align-items-center gap-2 mb-4"
                style={{ cursor: "pointer" }}
              >
                <FaArrowLeft />
                <span>Quay lại</span>
              </div>
              <h3 className="text-center fw-bold mb-2">Xác thực OTP</h3>
              <p className="text-center text-muted mb-4">
                Một mã xác thực đã được gửi đến email <br />
                <strong style={{ color: "#333" }}>{formData?.email}</strong>
              </p>
              <Form.Group className="mb-3" controlId="otp">
                <Form.Label>Mã OTP</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập 6 chữ số"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </Form.Group>
              <Button
                variant="primary"
                type="submit"
                className="w-100 fw-semibold"
                disabled={isSubmit}
              >
                {isSubmit ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : (
                  "Hoàn tất đăng ký"
                )}
              </Button>
            </Form>
          )}

          {/* === STEP 1: ĐIỀN THÔNG TIN === */}
          {step === 1 && (
            <>
              <h2 className="text-center fw-bold mb-4">Đăng Ký Tài Khoản</h2>
              <Form onSubmit={handleSendOtp}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ tên</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập họ tên"
                    name="name"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Nhập email"
                    name="email"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập mật khẩu"
                    name="password"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Tuổi</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Nhập tuổi"
                    name="age"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Giới tính</Form.Label>
                  <Form.Select name="gender" required>
                    <option value="" disabled>
                      Chọn giới tính
                    </option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Địa chỉ</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập địa chỉ"
                    name="address"
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 fw-semibold"
                  disabled={isSubmit}
                >
                  {isSubmit ? (
                    <Spinner as="span" animation="border" size="sm" />
                  ) : (
                    "Đăng ký"
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4">
                Đã có tài khoản?{" "}
                <Link to="/login" className={styles["register-link"]}>
                  Đăng Nhập
                </Link>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default RegisterPage;
