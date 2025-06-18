import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer"; // Import hook
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaGithub,
  FaDribbble,
  FaGooglePlay,
} from "react-icons/fa";
import { FaApple } from "react-icons/fa6";
import bg from "assets/section.svg";

const footerLinks = {
  about: {
    title: "Về chúng tôi",
    items: ["Giới thiệu", "Cơ hội việc làm", "Tin tức", "Đối tác"],
  },
  services: {
    title: "Dịch vụ",
    items: ["Tư vấn CV", "Phỏng vấn thử", "Xây dựng lộ trình", "Workshop"],
  },
  career: {
    title: "Nghề nghiệp",
    items: ["Blog", "Hướng dẫn", "Sự kiện", "Cộng đồng"],
  },
  contact: {
    title: "Contact Me",
    items: [
      { type: "text", label: "Hotline: ", value: "+84 377 586 305" },
      { type: "text", label: "Email: ", value: "careernest@gmail.com" },
    ],
  },
};

const Footer = () => {
  // Sử dụng hook useInView để theo dõi footer
  const { ref, inView } = useInView({
    triggerOnce: true, // Chỉ chạy animation một lần
    threshold: 0.4, // Kích hoạt khi 10% của footer hiện ra
  });

  return (
    // Gắn `ref` và thêm class `is-visible` khi footer trong tầm nhìn
    <footer ref={ref} className={`site-footer ${inView ? "is-visible" : ""}`}>
      <div
        style={{
          backgroundImage: `url(${bg})`,
          width: "100%",
          height: "100%", // Khớp với chiều cao footer
          position: "absolute",
          top: 0,
          left: 0,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover", // Hoặc "contain" tùy thuộc vào ảnh
          backgroundPosition: "center", // Căn giữa ảnh
          zIndex: 0, // Đặt dưới tất cả nội dung
          pointerEvents: "none", // Không chặn sự kiện chuột
        }}
      ></div>
      <Container>
        <div className="footer-top py-4 py-lg-4 pt-lg-5">
          <Row className="g-4 g-lg-5">
            <Col lg={7} xl={8}>
              <Row className="g-4">
                {/* Thêm class animate và style delay cho từng cột */}
                <Col
                  xs={6}
                  md={3}
                  className="footer-links animate-on-scroll"
                  style={{ animationDelay: "100ms" }}
                >
                  <h6 className="footer-title">{footerLinks.about.title}</h6>
                  <ul>
                    {footerLinks.about.items.map((item, index) => (
                      <li key={index}>
                        <a href="#">{item}</a>
                      </li>
                    ))}
                  </ul>
                </Col>

                <Col
                  xs={6}
                  md={3}
                  className="footer-links animate-on-scroll"
                  style={{ animationDelay: "200ms" }}
                >
                  <h6 className="footer-title">{footerLinks.services.title}</h6>
                  <ul>
                    {footerLinks.services.items.map((item, index) => (
                      <li key={index}>
                        <a href="#">{item}</a>
                      </li>
                    ))}
                  </ul>
                </Col>

                <Col
                  xs={6}
                  md={3}
                  className="footer-links animate-on-scroll"
                  style={{ animationDelay: "300ms" }}
                >
                  <h6 className="footer-title">{footerLinks.career.title}</h6>
                  <ul>
                    {footerLinks.career.items.map((item, index) => (
                      <li key={index}>
                        <a href="#">{item}</a>
                      </li>
                    ))}
                  </ul>
                </Col>

                <Col
                  xs={6}
                  md={3}
                  className="footer-links animate-on-scroll"
                  style={{ animationDelay: "400ms" }}
                >
                  <h6 className="footer-title">{footerLinks.contact.title}</h6>
                  <ul>
                    {footerLinks.contact.items.map((item, index) => (
                      <li key={index} className="contact-item">
                        <span>{item.label}</span>
                        <span className="contact-value">{item.value}</span>
                      </li>
                    ))}
                  </ul>
                </Col>
              </Row>
            </Col>

            <Col
              lg={5}
              xl={4}
              className="mt-0 mt-lg-0 animate-on-scroll"
              style={{ animationDelay: "500ms", paddingTop: "30px" }}
            >
              <div className="newsletter-box">
                <Form>
                  <Form.Group className="mb-3" controlId="newsletterEmail">
                    <Form.Label className="fw-semibold mb-2">
                      Đăng ký nhận bản tin
                    </Form.Label>
                    <div className="d-flex">
                      <Form.Control
                        type="email"
                        placeholder="Nhập email của bạn"
                        className="me-2"
                      />
                      <Button type="submit" className="resize-button">
                        Đăng ký
                      </Button>
                    </div>
                  </Form.Group>
                </Form>
                <hr className="divider my-4" />
                <div>
                  <p className="fw-semibold mb-3">Tải ứng dụng</p>
                  <div className="d-sm-flex gap-3">
                    <a href="#" className="app-download-btn mb-2 mb-sm-0">
                      <FaGooglePlay className="app-icon" />
                      <div>
                        <div className="text-xs">Tải về trên</div>
                        <div className="font-sans fw-semibold">Google Play</div>
                      </div>
                    </a>
                    <a href="#" className="app-download-btn">
                      <FaApple className="app-icon" />
                      <div>
                        <div className="text-xs">Tải về trên</div>
                        <div className="font-sans fw-semibold">App Store</div>
                      </div>
                    </a>
                  </div>
                </div>
                <hr className="divider my-3 my-lg-4" />
                <div className="d-flex justify-content-start gap-4 social-icons">
                  <a href="#">
                    <FaFacebook />
                  </a>
                  <a href="#">
                    <FaInstagram />
                  </a>
                  <a href="#">
                    <FaTwitter />
                  </a>
                  <a href="#">
                    <FaGithub />
                  </a>
                  <a href="#">
                    <FaDribbble />
                  </a>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        <div className="footer-bottom py-3 py-lg-4">
          <p className="mb-0 text-center">
            JobHunter Cơ hội việc làm, chỉ một cú click! &copy; President SOS Nu{" "}
            {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
