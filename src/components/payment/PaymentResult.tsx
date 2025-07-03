import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner, Alert, Button, Card } from "react-bootstrap";
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons";
import axios from "@/config/axios-customize"; // Dùng axios đã cấu hình của bạn
import { useAppDispatch } from "@/redux/hooks";
import { fetchAccount } from "@/redux/slice/accountSlide";

const PaymentResult = () => {
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "error" | null
  >(null);
  const [message, setMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Lấy tất cả các query params từ URL mà VNPay trả về
    const queryParams = location.search;

    const verifyPayment = async () => {
      try {
        // Gọi đến API callback của backend để xác thực
        // Backend sẽ kiểm tra chữ ký và cập nhật DB
        const res = await axios.get(
          `/api/v1/payment/vnpay/callback${queryParams}`
        );

        // Dựa vào response của backend để cập nhật giao diện
        if (res.data.status === "success") {
          setPaymentStatus("success");
          setMessage(res.data.message);
          // QUAN TRỌNG: Lấy lại thông tin user để cập nhật trạng thái VIP trong Redux
          dispatch(fetchAccount());
        } else {
          setPaymentStatus("error");
          setMessage(res.data.message || "Thanh toán thất bại.");
        }
      } catch (error: any) {
        setPaymentStatus("error");
        setMessage(
          error?.response?.data?.message ||
            "Có lỗi xảy ra khi xác thực thanh toán."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location, dispatch]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Spinner animation="border" variant="primary" />
        <h4 className="ms-3">Đang xác thực thanh toán, vui lòng chờ...</h4>
      </div>
    );
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh", padding: "20px" }}
    >
      <Card
        style={{ width: "100%", maxWidth: "500px" }}
        className="text-center"
      >
        <Card.Body>
          {paymentStatus === "success" ? (
            <>
              <CheckCircleFill color="green" size={80} />
              <Alert variant="success" className="mt-4">
                <Alert.Heading>Thanh toán thành công!</Alert.Heading>
                <p>{message}</p>
              </Alert>
              <Button variant="primary" onClick={() => navigate("/")}>
                Về trang chủ
              </Button>
            </>
          ) : (
            <>
              <XCircleFill color="red" size={80} />
              <Alert variant="danger" className="mt-4">
                <Alert.Heading>Thanh toán thất bại!</Alert.Heading>
                <p>{message}</p>
              </Alert>
              <Button variant="danger" onClick={() => navigate("/")}>
                Thử lại sau
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaymentResult;
