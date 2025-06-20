import { callFetchCompany } from "@/config/api";
import { convertSlug, getLocationName } from "@/config/utils";
import { ICompany } from "@/types/backend";
import { Button, Col, Row } from "react-bootstrap";
import { useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import { Link, useNavigate } from "react-router-dom";
import styles from "styles/client.module.scss";
import SimpleGlowCard from "components/share/glowcard/simple.glow-card";
import { useCurrentApp } from "components/context/app.context";
import blurImg from "assets/blur-23.svg";
import upload3 from "assets/top-rated.png";
import { BsGeoAlt, BsBriefcase, BsPeople } from "react-icons/bs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

interface IProps {
  showPagination?: boolean;
}

const CompanyCard = (props: IProps) => {
  const { showPagination = false } = props;
  const { theme } = useCurrentApp();

  const [displayCompany, setDisplayCompany] = useState<ICompany[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("");
  const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompany();
  }, [current, pageSize, filter, sortQuery]);

  const fetchCompany = async () => {
    setIsLoading(true);
    let query = `page=${current}&size=${pageSize}`;
    if (filter) {
      query += `&${filter}`;
    }
    if (sortQuery) {
      query += `&${sortQuery}`;
    }

    const res = await callFetchCompany(query);
    if (res && res.data) {
      setDisplayCompany(res.data.result);
      setTotal(res.data.meta.total);
    }
    setIsLoading(false);
  };

  const handleOnchangePage = (page: number, pageSize: number) => {
    setCurrent(page);
    setPageSize(pageSize);
  };

  const handleViewDetailCompany = (item: ICompany) => {
    if (item.name) {
      const slug = convertSlug(item.name);
      navigate(`/company/${slug}?id=${item.id}`);
    }
  };

  return (
    <div className={`${styles["company-section"]}`}>
      <div className={`${styles["company-content"]}`}>
        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <Row className="g-4">
            <Col xs={12}>
              <div
                className={
                  isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]
                }
              >
                <span className={styles["title"]} id="company-title-new">
                  Nhà Tuyển Dụng Hàng Đầu
                </span>
                {!showPagination && (
                  <Col xs={24} md={2}>
                    <Link
                      to="company"
                      style={{ textDecoration: "none", padding: "0px" }}
                    >
                      <Button
                        className="search-action-button"
                        style={{ padding: "0px" }}
                      >
                        Xem tất cả
                      </Button>
                    </Link>
                  </Col>
                )}
              </div>
            </Col>

            {displayCompany?.map((item) => (
              <Col xs={12} md={4} key={item.id}>
                <Link
                  to={`/company/${convertSlug(item.name)}?id=${item.id}`}
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
                                  color: theme === "dark" ? "#58aaab" : "#000",
                                  marginRight: "6px",
                                }}
                              />
                              Lĩnh vực: {item.field || "Công Nghệ Thông Tin"}
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
                              Quy mô: {item.scale || "100-500"}
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
                              {item.totalJob || 10}
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

            {(!displayCompany || displayCompany.length === 0) && (
              <Col xs={12} className="text-center">
                <p>Không có dữ liệu</p>
              </Col>
            )}
          </Row>
        )}
        {showPagination && total > 0 && (
          <Row className="mt-4">
            <Col xs={12} className="d-flex justify-content-center">
              <nav>
                <ul className="pagination">
                  {Array.from(
                    { length: Math.ceil(total / pageSize) },
                    (_, i) => (
                      <li
                        key={i}
                        className={`page-item ${current === i + 1 ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handleOnchangePage(i + 1, pageSize)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    )
                  )}
                </ul>
              </nav>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
};

export default CompanyCard;
