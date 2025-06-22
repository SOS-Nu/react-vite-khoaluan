// src/pages/auth/login.tsx

import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { GoogleLogin } from "@react-oauth/google";

import {
  Container,
  Card,
  Form,
  Button,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { message, notification } from "antd";

import styles from "styles/auth.module.scss";
import { callLogin, callLoginWithGoogle } from "@/config/api";
import { setUserLoginInfo } from "@/redux/slice/accountSlide";

const LoginPage = () => {
  const googleLoginRef = useRef<HTMLDivElement>(null);
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

  // ===> TỐI ƯU HÓA <===
  useEffect(() => {
    if (isAuthenticated) {
      // Dùng navigate để chuyển trang, không gây reload lại trang
      navigate(callback || "/");
    }
  }, [isAuthenticated, navigate, callback]); // Thêm các dependency cần thiết

  const onFinish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Ngăn hành vi mặc định của form
    setIsSubmit(true);
    const form = event.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement)
      .value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    const res = await callLogin(username, password);
    setIsSubmit(false);
    if (res?.data) {
      localStorage.setItem("access_token", res.data.access_token);
      dispatch(setUserLoginInfo(res.data.user));
      message.success("Đăng nhập thành công");
      navigate(callback || "/");
    } else {
      notification.error({
        message: "Có lỗi xảy ra",
        description: res.message,
      });
    }
  };

  return (
    <div
      className={`${styles["login-page-bootstrap"]} vh-100 d-flex align-items-center justify-content-center`}
    >
      <Card className={styles["login-card"]}>
        <Card.Body>
          <h2 className="text-center fw-bold mb-4">Đăng Nhập</h2>
          <Form onSubmit={onFinish}>
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

          <Button
            className={`w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 ${styles["google-login-btn"]}`}
            onClick={() => {
              if (googleLoginRef.current) {
                // Tìm phần tử có thể click được bên trong
                const clickableElement =
                  googleLoginRef.current.querySelector<HTMLElement>(
                    '[role="button"]'
                  );

                if (clickableElement) {
                  console.log(
                    "Tìm thấy phần tử có thể click, đang click...",
                    clickableElement
                  );
                  clickableElement.click();
                } else {
                  console.error(
                    "Không tìm thấy phần tử Google Login có thể click được bên trong ref."
                  );
                }
              }
            }}
          >
            <FcGoogle size={22} />
            Đăng nhập với Google
          </Button>

          <div ref={googleLoginRef} style={{ display: "none" }}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                if (credentialResponse.credential) {
                  try {
                    const res = await callLoginWithGoogle(
                      credentialResponse.credential
                    );
                    if (res?.data) {
                      localStorage.setItem(
                        "access_token",
                        res.data.access_token
                      );
                      dispatch(setUserLoginInfo(res.data.user));
                      message.success("Đăng nhập bằng Google thành công!");
                      // navigate đã được gọi trong useEffect nên không cần gọi lại ở đây
                    } else {
                      notification.error({
                        message: "Đăng nhập thất bại",
                        description:
                          res?.message ?? "Có lỗi xảy ra, vui lòng thử lại.",
                      });
                    }
                  } catch (error) {
                    notification.error({
                      message: "Đăng nhập thất bại",
                      description:
                        "Có lỗi xảy ra trong quá trình xác thực với máy chủ.",
                    });
                  }
                }
              }}
              onError={() => {
                notification.error({
                  message: "Đăng nhập Google thất bại",
                  description:
                    "Không thể kết nối với Google. Vui lòng thử lại.",
                });
              }}
            />
          </div>

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
