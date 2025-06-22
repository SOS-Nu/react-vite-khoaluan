import { Container, Row, Col, Spinner } from "react-bootstrap";
import { useCurrentApp } from "components/context/app.context";
import { isMobile } from "react-device-detect";
import styles from "styles/client.module.scss";
import SimpleGlowCard from "components/share/glowcard/simple.glow-card";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import CountUp from "react-countup";
import { useState, useEffect, useRef } from "react";
import { IDashboardData } from "@/types/backend";
import { callGetDashboard } from "@/config/api";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Introduction = () => {
  const { theme } = useCurrentApp();
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const [dashboardData, setDashboardData] = useState<IDashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const res = await callGetDashboard();
        if (res && res.data) {
          setDashboardData(res.data);
        }
      } catch (error) {
        console.error("API Call Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!isLoading && chartRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      observer.observe(chartRef.current);

      return () => {
        if (chartRef.current) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          observer.unobserve(chartRef.current);
        }
      };
    }
  }, [isLoading]);

  const stats = {
    jobs: dashboardData?.totalJobs ?? 0,
    companies: dashboardData?.totalCompanies ?? 0,
    users: dashboardData?.totalUsers ?? 0,
    successfulUsers: dashboardData?.totalResumesApproved ?? 0,
  };

  const chartData = {
    labels: ["Công việc", "Công ty", "Người dùng", "Hồ sơ duyệt"],
    datasets: [
      {
        label: "Thống kê",
        data: [stats.jobs, stats.companies, stats.users, stats.successfulUsers],
        backgroundColor: ["#28a745", "#ec4899", "#58aaab", "#ff9100"],
        borderColor: theme === "dark" ? "#1f1f1f" : "#fff",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: theme === "dark" ? "#ccc" : "#666",
          font: { size: isMobile ? 10 : 12 },
        },
        grid: { color: theme === "dark" ? "#3e3e3e" : "#e0e0e0" },
      },
      x: {
        ticks: {
          color: theme === "dark" ? "#ccc" : "#666",
          font: { size: isMobile ? 10 : 12 },
        },
        grid: { display: false },
      },
    },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: theme === "dark" ? "#ccc" : "#666",
          font: { size: isMobile ? 12 : 14 },
        },
      },
      tooltip: {
        backgroundColor: theme === "dark" ? "#1f1f1f" : "#fff",
        titleColor: theme === "dark" ? "#fff" : "#000",
        bodyColor: theme === "dark" ? "#ccc" : "#666",
        borderColor: theme === "dark" ? "#3e3e3e" : "#ccc",
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y.toLocaleString("en-US");
            return `${label}: ${value}`;
          },
        },
      },
    },
    animation: { duration: 2000, easing: "easeOutQuad" },
  } as const;

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "400px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div
      className={`${styles["introduction-section"]}`}
      style={{
        padding: isMobile ? "2rem 1rem" : "2rem 0rem",
        backgroundColor: theme === "dark" ? "#101123" : "#f8f9fa",
        borderRadius: "1rem",
        marginBottom: "2rem",
        animation: isVisible ? "fadeIn 1s ease-in-out" : "none",
        minHeight: "400px",
      }}
    >
      <Container>
        <Row className="align-items-center">
          <Col xs={12} md={6}>
            <h2
              style={{
                fontSize: isMobile ? "1.5rem" : "2rem",
                fontWeight: 700,
                color: theme === "dark" ? "#fff" : "#000",
                marginBottom: "1rem",
              }}
            >
              Về <span className="brand-red">JobHunter </span>
            </h2>
            <p
              style={{
                fontSize: isMobile ? "0.875rem" : "1rem",
                color: theme === "dark" ? "#ccc" : "#666",
                marginBottom: "1.5rem",
              }}
            >
              <span className="brand-red">JobHunter</span> là nền tảng tuyển
              dụng hàng đầu, kết nối hàng ngàn ứng viên với các cơ hội việc làm
              từ những công ty uy tín. Hãy bắt đầu hành trình sự nghiệp của bạn
              ngay hôm nay!
            </p>
            <Row className="g-3">
              <Col xs={6} sm={3}>
                <SimpleGlowCard identifier="stat-jobs">
                  <div
                    className="p-2 text-center"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: isMobile ? "100px" : "120px",
                      minHeight: isMobile ? "100px" : "120px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: isMobile ? "1.25rem" : "1.5rem",
                        fontWeight: 600,
                        color: "#28a745",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {isVisible ? (
                        <CountUp
                          end={stats.jobs}
                          duration={2.5}
                          separator=","
                        />
                      ) : (
                        "0"
                      )}
                    </p>
                    <p
                      style={{
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        color: theme === "dark" ? "#ccc" : "#666",
                        marginBottom: 0,
                        lineHeight: "1.2",
                      }}
                    >
                      Công việc
                    </p>
                  </div>
                </SimpleGlowCard>
              </Col>
              <Col xs={6} sm={3}>
                <SimpleGlowCard identifier="stat-companies">
                  <div
                    className="p-2 text-center"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: isMobile ? "100px" : "120px",
                      minHeight: isMobile ? "100px" : "120px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: isMobile ? "1.25rem" : "1.5rem",
                        fontWeight: 600,
                        color: "#ec4899",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {isVisible ? (
                        <CountUp
                          end={stats.companies}
                          duration={2.5}
                          separator=","
                        />
                      ) : (
                        "0"
                      )}
                    </p>
                    <p
                      style={{
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        color: theme === "dark" ? "#ccc" : "#666",
                        marginBottom: 0,
                        lineHeight: "1.2",
                      }}
                    >
                      Công ty
                    </p>
                  </div>
                </SimpleGlowCard>
              </Col>
              <Col xs={6} sm={3}>
                <SimpleGlowCard identifier="stat-users">
                  <div
                    className="p-2 text-center"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: isMobile ? "100px" : "120px",
                      minHeight: isMobile ? "100px" : "120px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: isMobile ? "1.25rem" : "1.5rem",
                        fontWeight: 600,
                        color: "#58aaab",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {isVisible ? (
                        <CountUp
                          end={stats.users}
                          duration={2.5}
                          separator=","
                        />
                      ) : (
                        "0"
                      )}
                    </p>
                    <p
                      style={{
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        color: theme === "dark" ? "#ccc" : "#666",
                        marginBottom: 0,
                        lineHeight: "1.2",
                      }}
                    >
                      Người dùng
                    </p>
                  </div>
                </SimpleGlowCard>
              </Col>
              <Col xs={6} sm={3}>
                <SimpleGlowCard identifier="stat-successful-users">
                  <div
                    className="p-2 text-center"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: isMobile ? "100px" : "120px",
                      minHeight: isMobile ? "100px" : "120px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: isMobile ? "1.25rem" : "1.5rem",
                        fontWeight: 600,
                        color: "#ff9100",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {isVisible ? (
                        <CountUp
                          end={stats.successfulUsers}
                          duration={2.5}
                          separator=","
                        />
                      ) : (
                        "0"
                      )}
                    </p>
                    <p
                      style={{
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        color: theme === "dark" ? "#ccc" : "#666",
                        marginBottom: 0,
                        lineHeight: "1.2",
                      }}
                    >
                      Hồ sơ duyệt
                    </p>
                  </div>
                </SimpleGlowCard>
              </Col>
            </Row>
          </Col>
          <Col xs={12} md={6} className="text-center mt-4 mt-md-0">
            <div
              ref={chartRef}
              style={{
                position: "relative",
                height: isMobile ? "250px" : "300px",
                maxWidth: "100%",
                margin: "0 auto",
                animation: isVisible ? "scaleUp 1s ease-in-out" : "none",
              }}
            >
              {isVisible && (
                <Bar key="chart" data={chartData} options={chartOptions} />
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Introduction;
