// src/pages/auth/login.tsx

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

// 1. Bỏ <GoogleLogin>, thêm hook useGoogleLogin
import { useGoogleLogin } from "@react-oauth/google";

import {
  Container,
  Card,
  Form,
  Button,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc"; // Thêm icon Google cho đẹp
import { message, notification } from "antd";

import styles from "styles/auth.module.scss";
import { callLogin, callLoginWithGoogle } from "@/config/api";
import { setUserLoginInfo } from "@/redux/slice/accountSlide";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSubmit, setIsSubmit] = useState(false);
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(
    (state) => state.account.isAuthenticated
  );
  const [showPassword, setShowPassword] = useState(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const callback = params.get("callback");

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated]);

  const onFinish = async (event: React.FormEvent<HTMLFormElement>) => {
    // ... (logic onFinish giữ nguyên)
  };

  // 2. Khởi tạo hook useGoogleLogin
  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log(tokenResponse);
      // Xử lý logic sau khi đăng nhập Google thành công
      // Ví dụ: gửi access_token đến backend của bạn để xác thực
      // và nhận về JWT token của hệ thống
      // callLoginWithGoogle(tokenResponse.access_token).then(res => ...);
      message.success("Đăng nhập Google thành công!");
    },
    onError: () => {
      notification.error({
        message: "Đăng nhập Google thất bại",
        description: "Đã có lỗi xảy ra trong quá trình đăng nhập với Google.",
      });
    },
  });

  return (
    <div
      className={`${styles["login-page-bootstrap"]} vh-100 d-flex align-items-center justify-content-center`}
    >
      <Card className={styles["login-card"]}>
        <Card.Body>
          <h2 className="text-center fw-bold mb-4">Đăng Nhập</h2>
          <Form onSubmit={onFinish}>
            {/* ... Form.Group cho email và password giữ nguyên ... */}
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Nhập email của bạn"
                name="username"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Mật khẩu</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  name="password"
                  required
                />
                <InputGroup.Text
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles["password-toggle-icon"]}
                >
                  {showPassword ? <BsEyeSlashFill /> : <BsEyeFill />}
                </InputGroup.Text>
              </InputGroup>
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
                "Đăng nhập"
              )}
            </Button>
          </Form>

          <div className="d-flex align-items-center my-4">
            <hr className="flex-grow-1" />
            <span className="mx-3 text-muted">Or</span>
            <hr className="flex-grow-1" />
          </div>

          {/* ================================================================ */}
          {/* ====> 3. THAY THẾ <GoogleLogin> BẰNG NÚT BUTTON TÙY CHỈNH <==== */}
          <Button
            className={`w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 ${styles["google-login-btn"]}`}
            onClick={() => loginWithGoogle()}
          >
            <FcGoogle size={22} />
            Đăng nhập với Google
          </Button>
          {/* ================================================================ */}

          <p className="text-center mt-4">
            Chưa có tài khoản?{" "}
            <Link to="/register" className={styles["register-link"]}>
              Đăng Ký
            </Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoginPage;
