import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next"; // Import hook
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

const Footer = () => {
  const { t } = useTranslation(); // Sử dụng hook useTranslation

  // Xây dựng cấu trúc links từ file ngôn ngữ
  const footerLinks = {
    about: {
      title: t("footer.about.title"),
      items: t("footer.about.items", { returnObjects: true }) as string[],
    },
    services: {
      title: t("footer.services.title"),
      items: t("footer.services.items", { returnObjects: true }) as string[],
    },
    career: {
      title: t("footer.career.title"),
      items: t("footer.career.items", { returnObjects: true }) as string[],
    },
    contact: {
      title: t("footer.contact.title"),
      items: [
        {
          type: "text",
          label: t("footer.contact.hotline"),
          value: "+84 385382597",
        },
        {
          type: "text",
          label: t("footer.contact.email"),
          value: "nu1412sos@gmail.com",
        },
      ],
    },
  };

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1, // Giảm ngưỡng để kích hoạt sớm hơn
  });

  return (
    <footer ref={ref} className={`site-footer ${inView ? "is-visible" : ""}`}>
      <div
        style={{
          backgroundImage: `url(${bg})`,
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
          pointerEvents: "none",
        }}
      ></div>
      <Container>
        <div className="footer-top py-4 py-lg-4 pt-lg-5">
          <Row className="g-4 g-lg-5">
            <Col lg={7} xl={8}>
              <Row className="g-4">
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
                      {t("footer.newsletter.title")}
                    </Form.Label>
                    <div className="d-flex">
                      <Form.Control
                        type="email"
                        placeholder={t("footer.newsletter.placeholder")}
                        className="me-2"
                      />
                      <Button type="submit" className="resize-button">
                        {t("footer.newsletter.button")}
                      </Button>
                    </div>
                  </Form.Group>
                </Form>
                <hr className="divider my-4" />
                <div>
                  <p className="fw-semibold mb-3">{t("footer.app.title")}</p>
                  <div className="d-sm-flex gap-3">
                    <a href="#" className="app-download-btn mb-2 mb-sm-0">
                      <FaGooglePlay className="app-icon" />
                      <div>
                        <div className="text-xs">
                          {t("footer.app.download")}
                        </div>
                        <div className="font-sans fw-semibold">
                          {t("footer.app.googlePlay")}
                        </div>
                      </div>
                    </a>
                    <a href="#" className="app-download-btn">
                      <FaApple className="app-icon" />
                      <div>
                        <div className="text-xs">
                          {t("footer.app.download")}
                        </div>
                        <div className="font-sans fw-semibold">
                          {t("footer.app.appStore")}
                        </div>
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
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
