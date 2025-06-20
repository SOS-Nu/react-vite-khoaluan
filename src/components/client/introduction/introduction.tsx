import { Container, Row, Col } from "react-bootstrap";
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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Introduction = () => {
  const { theme } = useCurrentApp();

  // Hard-coded data for stats and chart
  const stats = {
    jobs: 10000,
    companies: 500,
    users: 100000,
    successfulUsers: 5000,
  };

  const chartData = {
    labels: ["Công việc", "Công ty", "Người dùng", "Người tìm được việc"],
    datasets: [
      {
        label: "Thống kê",
        data: [stats.jobs, stats.companies, stats.users, stats.successfulUsers],
        backgroundColor: [
          "#28a745", // Xanh lá cây (Công việc)
          "#ec4899", // Hồng (Công ty)
          "#58aaab", // Xanh lam (Người dùng)
          "#ff9100", // Cam (Người tìm được việc)
        ],
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
        grid: {
          color: theme === "dark" ? "#3e3e3e" : "#e0e0e0",
        },
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
    animation: {
      duration: 2000,
      easing: "easeOutQuad",
    },
  };

  return (
    <div
      className={`${styles["introduction-section"]}`}
      style={{
        padding: isMobile ? "2rem 1rem" : "3rem 2rem",
        backgroundColor: theme === "dark" ? "#101123" : "#f8f9fa",
        borderRadius: "1rem",
        marginBottom: "2rem",
        animation: "fadeIn 1s ease-in-out",
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
              Về TechCorp
            </h2>
            <p
              style={{
                fontSize: isMobile ? "0.875rem" : "1rem",
                color: theme === "dark" ? "#ccc" : "#666",
                marginBottom: "1.5rem",
              }}
            >
              TechCorp là nền tảng tuyển dụng hàng đầu, kết nối hàng ngàn ứng
              viên với các cơ hội việc làm từ những công ty uy tín. Hãy tham gia
              ngay để xây dựng sự nghiệp mơ ước!
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
                      height: isMobile ? "80px" : "100px",
                      minHeight: isMobile ? "80px" : "100px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: isMobile ? "1.25rem" : "1.5rem",
                        fontWeight: 600,
                        color: theme === "dark" ? "#28a745" : "#28a745",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <CountUp end={stats.jobs} duration={2.5} separator="," />
                    </p>
                    <p
                      style={{
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        color: theme === "dark" ? "#ccc" : "#666",
                        marginBottom: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
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
                      height: isMobile ? "80px" : "100px",
                      minHeight: isMobile ? "80px" : "100px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: isMobile ? "1.25rem" : "1.5rem",
                        fontWeight: 600,
                        color: theme === "dark" ? "#ec4899" : "#ec4899",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <CountUp
                        end={stats.companies}
                        duration={2.5}
                        separator=","
                      />
                    </p>
                    <p
                      style={{
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        color: theme === "dark" ? "#ccc" : "#666",
                        marginBottom: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
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
                      height: isMobile ? "80px" : "100px",
                      minHeight: isMobile ? "80px" : "100px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: isMobile ? "1.25rem" : "1.5rem",
                        fontWeight: 600,
                        color: theme === "dark" ? "#58aaab" : "#58aaab",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <CountUp end={stats.users} duration={2.5} separator="," />
                    </p>
                    <p
                      style={{
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        color: theme === "dark" ? "#ccc" : "#666",
                        marginBottom: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
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
                      height: isMobile ? "80px" : "100px",
                      minHeight: isMobile ? "80px" : "100px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: isMobile ? "1.25rem" : "1.5rem",
                        fontWeight: 600,
                        color: theme === "dark" ? "#ff9100" : "#ff9100",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <CountUp
                        end={stats.successfulUsers}
                        duration={2.5}
                        separator=","
                      />
                    </p>
                    <p
                      style={{
                        fontSize: isMobile ? "0.75rem" : "0.875rem",
                        color: theme === "dark" ? "#ccc" : "#666",
                        marginBottom: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Người tìm được việc
                    </p>
                  </div>
                </SimpleGlowCard>
              </Col>
            </Row>
          </Col>
          <Col xs={12} md={6} className="text-center">
            <div
              style={{
                position: "relative",
                height: isMobile ? "200px" : "300px",
                maxWidth: "100%",
                margin: "0 auto",
                animation: "scaleUp 1s ease-in-out",
              }}
            >
              <Bar data={chartData} options={chartOptions} />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Introduction;
