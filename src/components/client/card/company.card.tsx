import { convertSlug, getLocationName } from "@/config/utils";
import { ICompany } from "@/types/backend";
import { Col, Row, Spin } from "antd"; // Sử dụng Spin của Antd
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

dayjs.extend(relativeTime);

// Sửa lại props để nhận dữ liệu từ bên ngoài
interface IProps {
  companies: ICompany[] | null;
  isLoading: boolean;
  title?: string;
}

const CompanyCard = (props: IProps) => {
  // Lấy dữ liệu từ props
  const { companies, isLoading, title = "Nhà Tuyển Dụng Hàng Đầu" } = props;
  const { theme } = useCurrentApp();

  // XÓA BỎ TOÀN BỘ LOGIC `useState` và `useEffect` fetch dữ liệu ở đây

  return (
    <div className={`${styles["company-section"]}`}>
      <div className={`${styles["company-content"]}`}>
        {isLoading ? (
          <div style={{ textAlign: "center", margin: "50px 0" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            <Col xs={24}>
              <div
                className={
                  isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]
                }
              >
                <span className={styles["title"]} id="company-title-new">
                  {title}
                </span>
              </div>
            </Col>

            {/* Sử dụng biến `companies` từ props */}
            {companies?.map((item) => (
              <Col xs={24} sm={12} md={8} key={item.id}>
                <Link
                  to={`/company/${convertSlug(item.name ?? "")}?id=${item.id}`}
                  style={{ textDecoration: "none" }}
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
                                      "linear-gradient(-45deg, #ff9100 10%, #ff9100 35%, #ff530f 70%, #e62c6d 100%)",
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
                              src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${item?.logo}`}
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
                                  color: theme === "dark" ? "#58aaab" : "#000",
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
                                  color: theme === "dark" ? "#58aaab" : "#000",
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
                                : dayjs(item.createdAt).locale("en").fromNow()}
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
                            {getLocationName(item.location)}
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
                              {/* Sửa lại để lấy đúng trường totalJobs */}
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
                xs={24}
                className="text-center"
                style={{ padding: "50px 0" }}
              >
                <p>Không có dữ liệu công ty</p>
              </Col>
            )}
          </Row>
        )}
        {/* XÓA BỎ PHẦN PAGINATION Ở ĐÂY, VÌ ĐÃ CHUYỂN LÊN TRANG CHA */}
      </div>
    </div>
  );
};

export default CompanyCard;
