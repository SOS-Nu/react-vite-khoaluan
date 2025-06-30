// src/pages/user/public-cv.tsx

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, Button, Image } from "react-bootstrap";
import { Spin, notification, Result, Tag } from "antd";
import { callFetchUserDetailById } from "@/config/api";
import { IUser } from "@/types/backend";
import {
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
// FIX: Thêm import moment sau khi đã cài đặt thư viện
import moment from "moment";
import "@/styles/stylespotfolio/public-cv.scss";

const PublicCvPage = () => {
  const { id } = useParams<{ id: string }>();
  const [userData, setUserData] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) {
        setError("User ID is missing.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await callFetchUserDetailById(id);
        if (res && res.data) {
          setUserData(res.data);
        } else {
          setError("User not found or has a private profile.");
        }
      } catch (e) {
        setError("Failed to fetch data. Please try again later.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const getAvatarUrl = (avatarPath?: string | null) => {
    if (avatarPath) {
      return `${import.meta.env.VITE_BACKEND_URL}/storage/avatar/${avatarPath}`;
    } else {
      // Cung cấp một ảnh placeholder mặc định
      return `https://ui-avatars.com/api/?name=${userData?.name || "User"}&background=random&color=fff`;
    }
  };

  if (isLoading) {
    return <Spin spinning={true} fullscreen />;
  }

  if (error || !userData?.onlineResume) {
    return (
      <Container className="public-cv-container my-5">
        <Result
          status="404"
          title="Profile Not Found"
          subTitle={
            error ||
            "Sorry, the profile you are looking for does not exist or has not been created yet."
          }
          // FIX: Thay thế `type="primary"` bằng `variant="primary"` cho Button của react-bootstrap
          extra={
            <Button variant="primary" href="/">
              Back Home
            </Button>
          }
        />
      </Container>
    );
  }

  const { onlineResume, workExperiences } = userData;

  return (
    <div className="public-cv-wrapper">
      <Container className="public-cv-container my-5">
        <Row>
          {/* Cột trái - Sidebar */}
          <Col md={4} className="sidebar-col">
            <Card className="sidebar-card">
              <Card.Body className="text-center">
                <Image
                  src={getAvatarUrl(userData.avatar)}
                  roundedCircle
                  className="profile-avatar mb-3"
                />
                <h2 className="user-name">{userData.name}</h2>
                <p className="resume-title-sidebar">{onlineResume?.title}</p>

                {userData.mainResume && (
                  <a
                    href={`${import.meta.env.VITE_BACKEND_URL}/api/v1/files?fileName=${userData.mainResume}&folder=resumes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="d-block mt-3 mb-4"
                  >
                    <Button variant="primary" className="download-cv-btn">
                      <DownloadOutlined /> Download Full CV
                    </Button>
                  </a>
                )}

                <hr />

                <div className="contact-info text-start">
                  <h5 className="sidebar-heading">Contact</h5>
                  <p>
                    <MailOutlined /> &nbsp; {userData.email}
                  </p>
                  {onlineResume?.phone && (
                    <p>
                      <PhoneOutlined /> &nbsp; {onlineResume.phone}
                    </p>
                  )}
                  {userData.address && (
                    <p>
                      <HomeOutlined /> &nbsp; {userData.address}
                    </p>
                  )}
                </div>

                <hr />

                <div className="skills-info text-start">
                  <h5 className="sidebar-heading">Skills</h5>
                  <div>
                    {onlineResume?.skills?.map((skill) => (
                      <Tag color="blue" key={skill.id} className="skill-tag">
                        {skill.name}
                      </Tag>
                    ))}
                  </div>
                </div>

                <hr />

                <div className="skills-info text-start">
                  <h5 className="sidebar-heading">Languages</h5>
                  <div className="language-text">
                    {onlineResume?.languages?.split("\n").map((lang, i) => (
                      <p key={i} className="mb-1">
                        {lang}
                      </p>
                    ))}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Cột phải - Nội dung chính */}
          <Col md={8} className="main-content-col">
            <Card className="content-card mb-4">
              <Card.Body>
                <Card.Title as="h4" className="card-title-icon">
                  Summary
                </Card.Title>
                {/* FIX: Sử dụng as="div" để tránh lỗi render thẻ <p> lồng nhau */}
                <Card.Text as="div" className="summary-text">
                  {onlineResume?.summary}
                </Card.Text>
              </Card.Body>
            </Card>

            {workExperiences && workExperiences.length > 0 && (
              <Card className="content-card mb-4">
                <Card.Body>
                  <Card.Title as="h4" className="card-title-icon">
                    Work Experience
                  </Card.Title>
                  <div className="timeline">
                    {workExperiences.map((exp) => (
                      <div className="timeline-item" key={exp.id}>
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <h5 className="experience-company">
                            {exp.companyName}
                          </h5>
                          <p className="experience-duration text-muted">
                            {moment(exp.startDate).format("MMM YYYY")} -{" "}
                            {exp.endDate
                              ? moment(exp.endDate).format("MMM YYYY")
                              : "Present"}
                            &nbsp; | &nbsp; {exp.location}
                          </p>
                          <div className="experience-description">
                            {exp.description.split("\n").map((line, i) => (
                              <p key={i} className="mb-1">
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}

            <Row>
              <Col md={6}>
                <Card className="content-card mb-4">
                  <Card.Body>
                    <Card.Title as="h4" className="card-title-icon">
                      Education
                    </Card.Title>
                    <div className="simple-text">
                      {onlineResume?.educations?.split("\n").map((edu, i) => (
                        <p key={i} className="mb-1">
                          {edu}
                        </p>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="content-card mb-4">
                  <Card.Body>
                    <Card.Title as="h4" className="card-title-icon">
                      Certifications
                    </Card.Title>
                    <div className="simple-text">
                      {onlineResume?.certifications
                        ?.split("\n")
                        .map((cert, i) => (
                          <p key={i} className="mb-1">
                            {cert}
                          </p>
                        ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PublicCvPage;
