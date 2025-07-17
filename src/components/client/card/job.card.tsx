// src/components/client/card/job.card.tsx

import { convertSlug, getLocationName } from "@/config/utils";
import { IJob } from "@/types/backend";
import { Link, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import SimpleGlowCard from "components/share/glowcard/simple.glow-card";
import { useCurrentApp } from "components/context/app.context";
import blurImg from "assets/blur-23.svg";
import upload3 from "assets/new-badge-orange.png";
import { BsGeoAlt, BsCurrencyDollar, BsClock } from "react-icons/bs";
import { Button, Col, Row } from "react-bootstrap";
import { isMobile } from "react-device-detect";
import styles from "@/styles/client.module.scss";
import React from "react";

dayjs.extend(relativeTime);

interface IProps {
  jobs: IJob[] | null;
  isLoading: boolean;
  title?: string;
  showPagination?: boolean;
  isListPage?: boolean;
  showButtonAllJob?: boolean;
}

const JobCard = (props: IProps) => {
  const {
    jobs,
    isLoading,
    title = "Danh sách công việc",
    showPagination,
    isListPage = false,
    showButtonAllJob,
  } = props;
  const { theme } = useCurrentApp();

  // JobCard sẽ tự lấy searchParams để quyết định highlight
  const [searchParams] = useSearchParams();
  const selectedJobId = searchParams.get("id");

  return (
    <div className="card-job-section">
      <div className="job-content">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            <Col xs={12}>
              <div
                className={
                  isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]
                }
              >
                {!isListPage && (
                  <span className={styles["title"]} id="job-tilte-new">
                    Công Việc Mới Nhất
                  </span>
                )}
                {!showButtonAllJob && (
                  <Col xs={12} md={2}>
                    <Link
                      to="job"
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

            {jobs?.map((item) => {
              const columnClass = isListPage
                ? "col-12"
                : "col-12 col-sm-6 col-md-4";

              // TỰ QUYẾT ĐỊNH VIỆC HIGHLIGHT
              const isSelected = String(item.id) === selectedJobId;

              // === START: THAY ĐỔI LOGIC TẠI ĐÂY ===
              const relevantDate = item.updatedAt || item.createdAt;
              const timeAgoString = dayjs(relevantDate).locale("en").fromNow();

              // THAY ĐỔI SỐ NGÀY TẠI ĐÂY
              // Thay số 2 thành 3 nếu muốn là 3 ngày
              const numberOfDays = 3;
              const isNew =
                dayjs().diff(dayjs(relevantDate), "day") < numberOfDays;
              // === END: THAY ĐỔI LOGIC TẠI ĐÂY ===

              // Tạo link mới vẫn giữ lại các param cũ và cập nhật 'id'
              const newSearchParams = new URLSearchParams(
                searchParams.toString()
              );
              newSearchParams.set("id", item.id!);
              const linkTo = `/job?${newSearchParams.toString()}`;

              return (
                <div className={columnClass} key={item.id}>
                  <div className={isSelected ? "selected-job-card" : ""}>
                    <Link to={linkTo} style={{ textDecoration: "none" }}>
                      <SimpleGlowCard
                        identifier={`job-${item.id}`}
                        className={isSelected ? "selected-job-card" : ""}
                      >
                        {/* Nội dung bên trong không thay đổi */}
                        <div className="p-0 pt-2 p-md-2 position-relative">
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
                                  marginBottom: "0.25rem",
                                }}
                              >
                                {item.name}
                                {/* HIỂN THỊ CÓ ĐIỀU KIỆN */}
                                {isNew && (
                                  <span
                                    className="wave"
                                    role="img"
                                    aria-labelledby="wave"
                                  >
                                    <img
                                      src={upload3}
                                      alt="Wave icon"
                                      style={{
                                        width: "20px",
                                        height: "20px",
                                        marginLeft: "4px",
                                      }}
                                    />
                                  </span>
                                )}
                              </p>
                            </div>
                            <div
                              className="details"
                              style={{ padding: "0.5rem" }}
                            >
                              <div className="icon">
                                <img
                                  alt="company logo"
                                  src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.company?.logo}`}
                                  style={{
                                    width: "80px",
                                    height: "80px",
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
                                  {item.company?.name ?? "TechCorp"}
                                </p>
                                <p
                                  className="company"
                                  style={{
                                    color: theme === "dark" ? "#ccc" : "#666",
                                    fontSize: "0.875rem",
                                    marginBottom: "0.25rem",
                                  }}
                                >
                                  <BsGeoAlt
                                    style={{
                                      color:
                                        theme === "dark" ? "#58aaab" : "#000",
                                      marginRight: "6px",
                                    }}
                                  />
                                  {getLocationName(item.location)}
                                </p>
                                <p
                                  className="company"
                                  style={{
                                    color: theme === "dark" ? "#ccc" : "#666",
                                    fontSize: "0.875rem",
                                    marginBottom: "0.25rem",
                                  }}
                                >
                                  <BsCurrencyDollar
                                    style={{
                                      color:
                                        theme === "dark" ? "orange" : "#000",
                                      marginRight: "6px",
                                      fontSize: "0.875rem",
                                      gap: "1",
                                    }}
                                  />
                                  {(item.salary + "").replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    ","
                                  )}{" "}
                                  đ
                                </p>
                                {/* Thêm phần level */}
                                <p
                                  className="company"
                                  style={{
                                    color: theme === "dark" ? "#ccc" : "#666",
                                    fontSize: "0.875rem",
                                    marginBottom: "0.25rem",
                                  }}
                                >
                                  <span
                                    style={{
                                      color:
                                        theme === "dark" ? "#58aaab" : "#000",
                                      marginRight: "6px",
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    📊{" "}
                                    {/* Icon tùy chọn, có thể thay bằng icon khác */}
                                  </span>
                                  {item.level || "Không xác định"}
                                </p>
                                <p
                                  className="time"
                                  style={{
                                    color: theme === "dark" ? "#ccc" : "#666",
                                    fontSize: "0.875rem",
                                    marginBottom: "0.25rem",
                                  }}
                                >
                                  <BsClock
                                    style={{
                                      color:
                                        theme === "dark" ? "#58aaab" : "#000",
                                      marginRight: "6px",
                                      fontSize: "0.875rem",
                                    }}
                                  />
                                  {item.updatedAt
                                    ? dayjs(item.updatedAt)
                                        .locale("en")
                                        .fromNow()
                                    : dayjs(item.createdAt)
                                        .locale("en")
                                        .fromNow()}
                                </p>
                              </div>
                            </div>
                            <div
                              className="skills"
                              style={{ padding: "0.5rem" }}
                            >
                              <p
                                style={{
                                  color: theme === "dark" ? "#ccc" : "#666",
                                  fontSize: "0.875rem",
                                  marginBottom: "0.5rem",
                                  fontWeight: 500,
                                }}
                              >
                                Kỹ năng yêu cầu:
                              </p>
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "0.5rem",
                                }}
                              >
                                {item.skills?.map((skill, index) => (
                                  <span
                                    key={index}
                                    style={{
                                      backgroundColor:
                                        theme === "dark" ? "#333" : "#f0f0f0",
                                      color: theme === "dark" ? "#fff" : "#333",
                                      padding: "0.2rem 0.4rem",
                                      borderRadius: "0.2rem",
                                      fontSize: "0.75rem",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {skill.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </SimpleGlowCard>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(JobCard); // Memoize cả JobCard để tối ưu hơn nữa
