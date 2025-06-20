import { Button, Container, Row, Col } from "react-bootstrap";
import { useCurrentApp } from "components/context/app.context";
import { isMobile } from "react-device-detect";
import { Link } from "react-router-dom";
import styles from "styles/client.module.scss";

const Banner = () => {
  const { theme } = useCurrentApp();

  return (
    <div
      className={`${styles["banner-section"]}`}
      style={{
        background:
          theme === "dark"
            ? "linear-gradient(to right, #0d1224, #0a0d37)"
            : "linear-gradient(to right, #fff, #eee)",
        padding: isMobile ? "2rem 1rem" : "4rem 2rem",
        borderRadius: "1rem",
        marginBottom: "2rem",
        position: "relative",
        overflow: "hidden",
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
              }}
            >
              Tìm Việc Làm Mơ Ước Với TechCorp
            </h1>
            <p
              style={{
                fontSize: isMobile ? "0.875rem" : "1rem",
                color: theme === "dark" ? "#ccc" : "#666",
                marginBottom: "1.5rem",
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
                }}
              >
                Tìm Việc Ngay
              </Button>
            </Link>
          </Col>
          <Col xs={12} md={6} className="text-center">
            <img
              src="https://via.placeholder.com/300x200?text=Banner+Image"
              alt="Banner illustration"
              style={{
                maxWidth: "100%",
                height: "auto",
                borderRadius: "0.75rem",
                opacity: theme === "dark" ? 0.9 : 1,
              }}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Banner;
