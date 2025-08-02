import { useState, useEffect } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Spinner,
  InputGroup,
  Alert,
} from "react-bootstrap";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { useAppSelector } from "@/redux/hooks";
import {
  callChangePassword,
  callSendOtpChangePassword,
  callVerifyOtpAndChangePassword,
} from "@/config/api";
import { notification } from "antd";

interface IAlert {
  show: boolean;
  variant: "success" | "danger";
  message: string;
}

const ChangePasswordTab = () => {
  const user = useAppSelector((state) => state.account.user);

  // State cho đổi mật khẩu bằng mật khẩu cũ
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho hiển thị/ẩn mật khẩu
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // State cho chế độ quên mật khẩu
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpEmail, setOtpEmail] = useState(user.email);
  const [otpCode, setOtpCode] = useState("");
  const [newPasswordOtp, setNewPasswordOtp] = useState("");
  const [confirmPasswordOtp, setConfirmPasswordOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [alert, setAlert] = useState<IAlert>({
    show: false,
    variant: "success",
    message: "",
  });

  // State cho đếm ngược
  const [countdown, setCountdown] = useState(0);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);

  // Effect xử lý bộ đếm ngược
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Hàm xử lý đổi mật khẩu với mật khẩu cũ (ĐÃ ĐƯỢC THÊM LẠI)
  const handleSubmitWithOldPassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setAlert({ ...alert, show: false });

    if (newPassword !== confirmPassword) {
      setAlert({
        show: true,
        variant: "danger",
        message: "Mật khẩu mới không khớp!",
      });
      return;
    }

    setIsSubmitting(true);
    const res = await callChangePassword(oldPassword, newPassword);
    setIsSubmitting(false);

    if (res?.statusCode === 200) {
      notification.success({
        message: "Thành công!",
        description: res.message,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      notification.error({
        message: "Có lỗi xảy ra!",
        description: res?.message ?? "Không thể đổi mật khẩu.",
      });
    }
  };

  // Hàm xử lý gửi yêu cầu OTP
  const handleRequestOtp = async () => {
    if (!otpEmail) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng nhập địa chỉ email.",
      });
      return;
    }
    setIsRequestingOtp(true);
    const res = await callSendOtpChangePassword(otpEmail);
    setIsRequestingOtp(false);

    if (res?.statusCode === 200) {
      notification.success({
        message: "Thành công!",
        description: `Mã OTP đã được gửi đến email ${otpEmail}`,
      });
      setOtpSent(true);
      setCountdown(60);
    } else {
      notification.error({
        message: "Có lỗi xảy ra!",
        description: res?.message ?? "Không thể gửi mã OTP.",
      });
    }
  };

  // Hàm xử lý xác thực OTP và đổi mật khẩu
  const handleSubmitWithOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPasswordOtp !== confirmPasswordOtp) {
      setAlert({
        show: true,
        variant: "danger",
        message: "Mật khẩu mới không khớp!",
      });
      return;
    }
    setAlert({ ...alert, show: false });
    setIsVerifyingOtp(true);
    const res = await callVerifyOtpAndChangePassword(
      otpEmail!,
      otpCode,
      newPasswordOtp
    );
    setIsVerifyingOtp(false);

    if (res?.statusCode === 200) {
      notification.success({
        message: "Thành công!",
        description: "Đổi mật khẩu thành công.",
      });
      setIsOtpMode(false);
      setOtpSent(false);
      setCountdown(0);
      setOtpEmail(user.email);
      setOtpCode("");
      setNewPasswordOtp("");
      setConfirmPasswordOtp("");
    } else {
      notification.error({
        message: "Có lỗi xảy ra!",
        description: res?.message ?? "Mã OTP không hợp lệ hoặc đã hết hạn.",
      });
    }
  };

  // Giao diện đổi mật khẩu bằng mật khẩu cũ (ĐÃ ĐƯỢC THÊM LẠI ĐẦY ĐỦ)
  const renderDefaultForm = () => (
    <Form onSubmit={handleSubmitWithOldPassword}>
      {alert.show && (
        <Alert
          variant={alert.variant}
          onClose={() => setAlert({ ...alert, show: false })}
          dismissible
        >
          {alert.message}
        </Alert>
      )}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu cũ</Form.Label>
            <InputGroup>
              <Form.Control
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <InputGroup.Text onClick={() => setShowOld(!showOld)}>
                {showOld ? <BsEyeSlashFill /> : <BsEyeFill />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu mới</Form.Label>
            <InputGroup>
              <Form.Control
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <InputGroup.Text onClick={() => setShowNew(!showNew)}>
                {showNew ? <BsEyeSlashFill /> : <BsEyeFill />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Xác nhận mật khẩu mới</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <InputGroup.Text onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <BsEyeSlashFill /> : <BsEyeFill />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>
      <Button
        variant="primary"
        type="submit"
        disabled={isSubmitting}
        className="update-btn"
      >
        {isSubmitting ? (
          <>
            <Spinner as="span" animation="border" size="sm" /> &nbsp; Đang xử
            lý...
          </>
        ) : (
          "Lưu thay đổi"
        )}
      </Button>
      <div className="mt-3">
        <a
          href="#"
          onClick={() => setIsOtpMode(true)}
          className="text-primary"
          style={{ textDecoration: "none" }}
        >
          Quên mật khẩu?
        </a>
      </div>
    </Form>
  );

  // Giao diện cho quy trình quên mật khẩu
  const renderOtpForm = () => (
    <div>
      {!otpSent ? (
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleRequestOtp();
          }}
        >
          <p>Vui lòng nhập email của bạn để nhận mã xác thực.</p>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="email"
                    value={otpEmail!}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    required
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isRequestingOtp}
                    className="update-btn"
                  >
                    {isRequestingOtp ? "Đang gửi..." : "Gửi mã"}
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      ) : (
        <Form onSubmit={handleSubmitWithOtp}>
          {alert.show && (
            <Alert
              variant={alert.variant}
              onClose={() => setAlert({ ...alert, show: false })}
              dismissible
            >
              {alert.message}
            </Alert>
          )}
          <p>
            Một mã OTP đã được gửi tới email <strong>{otpEmail}</strong>. Vui
            lòng kiểm tra và nhập vào bên dưới.
          </p>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Mã OTP</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Nhập mã OTP"
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={handleRequestOtp}
                    disabled={countdown > 0 || isRequestingOtp}
                  >
                    {countdown > 0
                      ? `Gửi lại sau (${countdown}s)`
                      : "Gửi lại mã"}
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu mới</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showNew ? "text" : "password"}
                    value={newPasswordOtp}
                    onChange={(e) => setNewPasswordOtp(e.target.value)}
                    required
                  />
                  <InputGroup.Text onClick={() => setShowNew(!showNew)}>
                    {showNew ? <BsEyeSlashFill /> : <BsEyeFill />}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showConfirm ? "text" : "password"}
                    value={confirmPasswordOtp}
                    onChange={(e) => setConfirmPasswordOtp(e.target.value)}
                    required
                  />
                  <InputGroup.Text onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <BsEyeSlashFill /> : <BsEyeFill />}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          <Button variant="primary" type="submit" disabled={isVerifyingOtp}>
            {isVerifyingOtp ? "Đang xác thực..." : "Xác nhận và đổi mật khẩu"}
          </Button>
        </Form>
      )}
      <div className="mt-3">
        <a
          href="#"
          onClick={() => {
            setIsOtpMode(false);
            setOtpSent(false);
            setCountdown(0);
            setOtpEmail(user.email);
          }}
          className="text-primary"
          style={{ textDecoration: "none" }}
        >
          Quay lại
        </a>
      </div>
    </div>
  );

  return (
    <div className="change-password-container p-3">
      {isOtpMode ? renderOtpForm() : renderDefaultForm()}
    </div>
  );
};

export default ChangePasswordTab;
