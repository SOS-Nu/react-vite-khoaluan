import { callFetchJob } from "@/config/api";
import { convertSlug, getLocationName } from "@/config/utils";
import { IJob } from "@/types/backend";
import { Button, Col, Row } from "react-bootstrap";
import { useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import styles from "styles/client.module.scss";
import { sfIn } from "spring-filter-query-builder";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import GlowCard from "components/share/glowcard/glow-card";
import { useCurrentApp } from "components/context/app.context";
import blurImg from "assets/blur-23.svg";
import upload3 from "assets/new-badge-orange.png";
import { BsGeoAlt, BsCurrencyDollar } from "react-icons/bs";

dayjs.extend(relativeTime);

interface IProps {
  showPagination?: boolean;
}

const JobCard = (props: IProps) => {
  const { showPagination = false } = props;
  const { theme } = useCurrentApp();

  const [displayJob, setDisplayJob] = useState<IJob[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("");
  const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    fetchJob();
  }, [current, pageSize, filter, sortQuery, location]);

  const fetchJob = async () => {
    setIsLoading(true);
    let query = `page=${current}&size=${pageSize}`;
    if (filter) {
      query += `&${filter}`;
    }
    if (sortQuery) {
      query += `&${sortQuery}`;
    }

    const queryLocation = searchParams.get("location");
    const querySkills = searchParams.get("skills");
    if (queryLocation || querySkills) {
      let q = "";
      if (queryLocation) {
        q = sfIn("location", queryLocation.split(",")).toString();
      }
      if (querySkills) {
        q = queryLocation
          ? q + " and " + `${sfIn("skills", querySkills.split(","))}`
          : `${sfIn("skills", querySkills.split(","))}`;
      }
      query += `&filter=${encodeURIComponent(q)}`;
    }

    const res = await callFetchJob(query);
    if (res && res.data) {
      setDisplayJob(res.data.result);
      setTotal(res.data.meta.total);
    }
    setIsLoading(false);
  };

  const handleOnchangePage = (page: number, pageSize: number) => {
    setCurrent(page);
    setPageSize(pageSize);
  };

  return (
    <div className={`${styles["card-job-section"]}`}>
      <div className={`${styles["job-content"]}`}>
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
                <span className={styles["title"]} id="job-tilte-new">
                  Công Việc Mới Nhất
                </span>
                {!showPagination && (
                  <Col xs={24} md={2}>
                    <Link
                      to="job"
                      style={{ textDecoration: "none", padding: "0px" }}
                    >
                      {" "}
                      <Button
                        className="search-action-button"
                        style={{ padding: "0px" }}
                      >
                        Xem tất cả{" "}
                      </Button>
                    </Link>
                  </Col>
                )}
              </div>
            </Col>

            {displayJob?.map((item) => (
              <Col xs={12} md={6} key={item.id}>
                <Link
                  to={`/job/${convertSlug(item.name)}?id=${item.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <GlowCard identifier={`job-${item.id}`}>
                    <div className="p-0 pt-3 p-md-3 position-relative">
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
                              style={{ width: "24px", height: "24px" }}
                            />
                          </span>
                        </div>
                        <div className="details">
                          <div className="icon">
                            <img
                              alt="company logo"
                              src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.company?.logo}`}
                              style={{
                                width: "36px",
                                height: "36px",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                          <div className="info">
                            <p
                              className="title"
                              style={{
                                color: theme === "dark" ? "#ccc" : "#666",
                              }}
                            >
                              {item.updatedAt
                                ? dayjs(item.updatedAt).locale("en").fromNow()
                                : dayjs(item.createdAt).locale("en").fromNow()}
                            </p>
                            <p
                              className="company"
                              style={{
                                color: theme === "dark" ? "#ccc" : "#666",
                              }}
                            >
                              <BsGeoAlt
                                style={{
                                  color: theme === "dark" ? "#58aaab" : "#000",
                                  marginRight: "8px",
                                }}
                              />
                              {getLocationName(item.location)}
                            </p>
                            <p
                              className="company"
                              style={{
                                color: theme === "dark" ? "#ccc" : "#666",
                              }}
                            >
                              <BsCurrencyDollar
                                style={{
                                  color: theme === "dark" ? "orange" : "#000",
                                  marginRight: "8px",
                                }}
                              />
                              {(item.salary + "").replace(
                                /\B(?=(\d{3})+(?!\d))/g,
                                ","
                              )}{" "}
                              đ
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlowCard>
                </Link>
              </Col>
            ))}

            {(!displayJob || displayJob.length === 0) && (
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

export default JobCard;
