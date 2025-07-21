import { convertSlug, getLocationName } from "@/config/utils";
import { ICompany } from "@/types/backend";
import { isMobile } from "react-device-detect";
import { Link } from "react-router-dom";
import styles from "styles/client.module.scss";
import SimpleGlowCard from "components/share/glowcard/simple.glow-card";
import { useCurrentApp } from "components/context/app.context";
import blurImg from "assets/blur-23.svg";
import upload3 from "assets/top-rated.png";
import { BsGeoAlt, BsBriefcase, BsPeople } from "react-icons/bs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button, Container, Row, Col, Spinner } from "react-bootstrap";

dayjs.extend(relativeTime);

interface IProps {
  companies: ICompany[] | null;
  isLoading: boolean;
  title?: string;
  showPagination?: boolean;
  companyListRef?: any;
}

const CompanyCard = (props: IProps) => {
  const {
    companies,
    isLoading,
    title = "Nhà Tuyển Dụng Hàng Đầu",
    showPagination,
    companyListRef,
  } = props;
  const { theme } = useCurrentApp();

  return (
    <div className={`${styles["company-section"]}`} ref={companyListRef}>
      <div className={`${styles["company-content"]}`}>
        {isLoading ? (
          <div style={{ textAlign: "center", margin: "50px 0" }}>
            <Spinner
              animation="border"
              variant={theme === "dark" ? "light" : "dark"}
            />
          </div>
        ) : (
          <Container fluid>
            <Row className="g-4">
              <Col xs={12}>
                <div
                  className={
                    isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]
                  }
                >
                  <span className={styles["title"]} id="company-title-new">
                    {title}
                  </span>
                  {!showPagination && (
                    <Col xs={12} md={2}>
                      <Link
                        to="company"
                        style={{ textDecoration: "none", padding: "0px" }}
                      >
                        <Button
                          className="search-action-button"
                          style={{ padding: "0px" }}
                          variant="primary"
                        >
                          Xem tất cả
                        </Button>
                      </Link>
                    </Col>
                  )}
                </div>
              </Col>

              {companies?.map((item) => (
                <Col xs={12} sm={6} md={4} key={item.id}>
                  <Link
                    to={`/company/${convertSlug(item.name ?? "")}?id=${item.id}`}
                    style={{ textDecoration: "none" }}
                    target="_blank" // Thêm dòng này
                    rel="noopener noreferrer" // Và thêm dòng này để bảo mật
                  >
                    <SimpleGlowCard identifier={`company-${item.id}`}>
                      <div className="p-0 pt-2 p-md-2 pb-2 position-relative">
                        {theme === "dark" && (
                          <img
                            style={{
                              position: "absolute",
                              bottom: 0,
                              opacity: 0.8,
                              width: "100%",
                              height: 200,
                            }}
                            src={blurImg}
                            alt="Blur background"
                          />
                        )}
                        <div className="experience-container">
                          <div className="duration-text">
                            <p
                              style={{
                                ...(theme === "dark"
                                  ? {
                                      background:
                                        "linear-gradient(90deg, #1b74ff, #a880ff 96.79%)",
                                      WebkitBackgroundClip: "text",
                                      backgroundClip: "text",
                                      color: "transparent",
                                    }
                                  : { color: "#000" }),
                                fontWeight: 600,
                              }}
                            >
                              {item.name}
                            </p>
                            <span
                              className="wave"
                              role="img"
                              aria-labelledby="wave"
                            >
                              <img
                                src={upload3}
                                alt="Wave icon"
                                style={{ width: "30px", height: "30px" }}
                              />
                            </span>
                          </div>
                          <div
                            className="details"
                            style={{
                              top: "-10px",
                              position: "relative",
                              minHeight: "190px",
                            }}
                          >
                            <div className="icon">
                              <img
                                alt="company logo"
                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.logo}`}
                                style={{
                                  width: "140px",
                                  height: "140px",
                                  objectFit: "cover",
                                  borderRadius: "20px",
                                }}
                              />
                            </div>
                            <div className="info">
                              <p
                                className="company"
                                style={{
                                  color: theme === "dark" ? "#ccc" : "#666",
                                  fontSize: "0.875rem",
                                  marginBottom: "0.25rem",
                                }}
                              >
                                <BsBriefcase
                                  style={{
                                    color:
                                      theme === "dark" ? "#58aaab" : "#000",
                                    marginRight: "6px",
                                  }}
                                />
                                Lĩnh vực: {item.field || "N/A"}
                              </p>
                              <p
                                className="company"
                                style={{
                                  color: theme === "dark" ? "#ccc" : "#666",
                                  fontSize: "0.875rem",
                                  marginBottom: "0.25rem",
                                }}
                              >
                                <BsPeople
                                  style={{
                                    color:
                                      theme === "dark" ? "#58aaab" : "#000",
                                    marginRight: "6px",
                                  }}
                                />
                                Quy mô: {item.scale || "N/A"}
                              </p>
                              <p
                                className="time"
                                style={{
                                  color: theme === "dark" ? "#ccc" : "#666",
                                  fontSize: "0.875rem",
                                  marginBottom: "0.25rem",
                                }}
                              >
                                {item.updatedAt
                                  ? dayjs(item.updatedAt).locale("en").fromNow()
                                  : dayjs(item.createdAt)
                                      .locale("en")
                                      .fromNow()}
                              </p>
                            </div>
                            <p
                              className="location"
                              style={{
                                position: "absolute",
                                bottom: "-5px",
                                left: "10px",
                                color: theme === "dark" ? "#ccc" : "#666",
                                fontSize: "0.9375rem",
                                marginBottom: "0",
                              }}
                            >
                              <BsGeoAlt
                                style={{
                                  color: theme === "dark" ? "#58aaab" : "#000",
                                  marginRight: "6px",
                                }}
                              />
                              {getLocationName(item?.location!)}
                            </p>
                            <div
                              className="total-job"
                              style={{
                                position: "absolute",
                                bottom: "0px",
                                right: "10px",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <div
                                style={{
                                  backgroundColor: "#28a745",
                                  color: "#fff",
                                  fontSize: "0.75rem",
                                  fontWeight: 500,
                                  borderRadius: "50%",
                                  width: "32px",
                                  height: "32px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  textAlign: "center",
                                  lineHeight: "1.2",
                                }}
                              >
                                {item.totalJobs || 0}
                              </div>
                              <span
                                style={{
                                  color: theme === "dark" ? "#ccc" : "#666",
                                  fontSize: "1rem",
                                  fontWeight: 500,
                                }}
                              >
                                Jobs
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SimpleGlowCard>
                  </Link>
                </Col>
              ))}

              {(!companies || companies.length === 0) && (
                <Col
                  xs={12}
                  className="text-center"
                  style={{ padding: "50px 0" }}
                >
                  <p>Không có dữ liệu công ty</p>
                </Col>
              )}
            </Row>
          </Container>
        )}
      </div>
    </div>
  );
};

export default CompanyCard;
