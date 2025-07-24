import { Button, Container, Row, Col } from "react-bootstrap";
import { useCurrentApp } from "components/context/app.context";
import { isMobile } from "react-device-detect";
import { Link } from "react-router-dom";
import styles from "styles/client.module.scss";
import AnimationLottie from "@/components/share/glowcard/animation-lottie";
import { CONTACT_LOTTIE } from "@/assets/lottie/string/contact";

const Banner = () => {
  const { theme } = useCurrentApp();

  return (
    <div
      className={`${styles["banner-section"]}`}
      style={{
        padding: isMobile ? "1.5rem 1rem" : "0rem 1rem",
        borderRadius: "1rem",
        marginBottom: "2rem",
        position: "relative",
        overflow: "hidden",
        minHeight: isMobile ? "auto" : "400px", // Đảm bảo chiều cao đủ cho animation
      }}
    >
      <Container>
        <Row className="align-items-center">
          <Col xs={12} md={6}>
            <h1
              style={{
                fontSize: isMobile ? "1.5rem" : "2.5rem",
                fontWeight: 700,
                color: theme === "dark" ? "#fff" : "#000",
                marginBottom: "1rem",
                lineHeight: "1.2",
              }}
            >
              Tìm Việc Làm Mơ Ước Với{" "}
              <span className="brand-red">JobHunter</span>
            </h1>
            <p
              style={{
                fontSize: isMobile ? "0.875rem" : "1rem",
                color: theme === "dark" ? "#ccc" : "#666",
                marginBottom: "1.5rem",
                lineHeight: "1.5",
              }}
            >
              Khám phá hàng ngàn cơ hội việc làm từ các công ty hàng đầu. Bắt
              đầu hành trình sự nghiệp của bạn ngay hôm nay!
            </p>
            <Link to="/job" style={{ textDecoration: "none" }}>
              <Button
                className="resize-button"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #ec4899, #8b5cf6)",
                  border: "none",
                  padding: isMobile ? "0.5rem 1rem" : "0.75rem 1.5rem",
                  fontSize: isMobile ? "0.875rem" : "1rem",
                  fontWeight: 600,
                  borderRadius: "0.5rem",
                }}
              >
                Tìm Việc Ngay
              </Button>
            </Link>
          </Col>
          <Col
            xs={12}
            md={6}
            className="d-flex flex-column align-items-center justify-content-center"
            style={{
              padding: isMobile ? "1rem 0" : "2rem 0",
              minHeight: isMobile ? "200px" : "300px", // Đảm bảo không gian cho animation
            }}
          >
            <div
              style={{
                width: isMobile ? "80%" : "60%",
                maxWidth: "400px",
                marginBottom: "0.5rem",
              }}
            >
              <AnimationLottie animationPath={JSON.parse(CONTACT_LOTTIE)} />
            </div>
            <h4
              style={{
                fontSize: isMobile ? "1rem" : "1.25rem",
                fontWeight: 500,
                color: theme === "dark" ? "#ccc" : "#666",
                textAlign: "center",
                marginTop: "0.5rem",
              }}
            >
              Khám Phá Ngay!
            </h4>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Banner;
