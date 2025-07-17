import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  UploadOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "@/redux/hooks";
// <<< THÊM IMPORT MỚI
import { callEvaluateCVWithAI, callFetchUserDetailById } from "@/config/api";
import { IUser } from "@/types/backend"; // <<< THÊM IMPORT MỚI
import {
  message,
  Tag,
  List,
  Typography,
  Descriptions,
  Divider,
  Spin,
} from "antd";
import "./CVAIEvaluation.scss";

// (Các interface IEvaluationResult, etc. giữ nguyên như cũ)
interface IImprovementSuggestion {
  area: string;
  suggestion: string;
}

interface IRoadmapStep {
  step: number;
  action: string;
  reason: string;
}

interface ISuggestedJob {
  jobTitle: string;
  companyName: string;
  matchReason: string;
  jobId: number;
}

interface IEvaluationResult {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: IImprovementSuggestion[];
  estimatedSalaryRange: string;
  suggestedRoadmap: IRoadmapStep[];
  relevantJobs: ISuggestedJob[];
}

const CVAIEvaluationPage = () => {
  const user = useAppSelector((state) => state.account.user);
  const [evaluationType, setEvaluationType] = useState<"online" | "upload">(
    "online"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IEvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // <<< THÊM STATE MỚI ĐỂ LƯU DỮ LIỆU CV CHI TIẾT
  const [fullUserData, setFullUserData] = useState<IUser | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState<boolean>(true);

  // <<< SỬA ĐỔI: DÙNG DỮ LIỆU ĐÃ FETCH ĐỂ KIỂM TRA
  const hasOnlineResume =
    fullUserData?.onlineResume && fullUserData.onlineResume.id;

  // <<< THÊM USEEFFECT ĐỂ GỌI API LẤY CHI TIẾT USER
  useEffect(() => {
    const fetchUserDetail = async () => {
      if (user?.id) {
        setIsFetchingProfile(true);
        try {
          const res = await callFetchUserDetailById(user.id);
          if (res && res.data) {
            setFullUserData(res.data);
            // Tự động chuyển evaluationType nếu user không có online CV
            if (!res.data.onlineResume) {
              setEvaluationType("upload");
            }
          }
        } catch (e) {
          message.error("Could not fetch your profile data.");
        } finally {
          setIsFetchingProfile(false);
        }
      } else {
        setIsFetchingProfile(false);
        setEvaluationType("upload"); // Nếu không có user, bắt buộc upload
      }
    };

    fetchUserDetail();
  }, [user.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleEvaluate = async () => {
    if (evaluationType === "upload" && !selectedFile) {
      setError("Please select a CV file to evaluate.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      if (evaluationType === "upload" && selectedFile) {
        formData.append("cvFile", selectedFile);
      }

      // <<< THÊM LOGIC LẤY VÀ GỬI NGÔN NGỮ >>>
      // Lấy ngôn ngữ từ localStorage, mặc định là 'vi' nếu không tìm thấy
      const language = localStorage.getItem("i18nextLng") || "vi";
      formData.append("language", language);
      // <<< KẾT THÚC LOGIC THÊM >>>

      const res = await callEvaluateCVWithAI(formData);

      if (res && res.data) {
        setResult(res.data);
        message.success("AI evaluation completed successfully!");
      } else {
        setError(res.message ?? "An unknown error occurred.");
      }
    } catch (e: any) {
      setError(e.message || "Failed to get evaluation from AI.");
      message.error("An error occurred during evaluation.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderResults = () => {
    // ... (Giữ nguyên không đổi)
    if (!result) return null;

    return (
      <Card className="result-card mt-5">
        <Card.Header as="h4">
          <RobotOutlined /> AI Evaluation Result
        </Card.Header>
        <Card.Body>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Overall Score">
              <Tag color={result.overallScore > 75 ? "green" : "orange"}>
                {result.overallScore} / 100
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Summary">
              {result.summary}
            </Descriptions.Item>
            <Descriptions.Item label="Estimated Salary">
              {result.estimatedSalaryRange}
            </Descriptions.Item>
          </Descriptions>

          <Divider>Strengths</Divider>
          <List
            bordered
            dataSource={result.strengths}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />

          <Divider>Areas for Improvement</Divider>
          <List
            bordered
            dataSource={result.improvements}
            renderItem={(item) => (
              <List.Item>
                <strong>{item.area}:</strong> {item.suggestion}
              </List.Item>
            )}
          />

          <Divider>Suggested Improvement Roadmap</Divider>
          <List
            bordered
            dataSource={result.suggestedRoadmap}
            renderItem={(item) => (
              <List.Item>
                <Typography.Text>
                  <strong>
                    Step {item.step}: {item.action}
                  </strong>{" "}
                  - {item.reason}
                </Typography.Text>
              </List.Item>
            )}
          />

          <Divider>Relevant Jobs For You</Divider>
          <List
            bordered
            dataSource={result.relevantJobs}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <a
                    href={`/job/detail/${item.jobId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>,
                ]}
              >
                <List.Item.Meta
                  title={`${item.jobTitle} at ${item.companyName}`}
                  description={item.matchReason}
                />
              </List.Item>
            )}
          />
        </Card.Body>
      </Card>
    );
  };

  // <<< SỬA ĐỔI: THÊM SPIN KHI ĐANG FETCH PROFILE
  if (isFetchingProfile) {
    return <Spin spinning={true} fullscreen tip="Loading your profile..." />;
  }

  return (
    <Container className="cv-evaluation-container my-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="evaluation-card">
            <Card.Body>
              <div className="text-center mb-4">
                <h1 className="evaluation-title">AI-Powered CV Analysis</h1>
                <p className="evaluation-subtitle">
                  Get instant feedback on your CV and a personalized career
                  roadmap.
                </p>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Choose your CV source:</Form.Label>
                <div className="d-flex gap-3">
                  <Button
                    variant={
                      evaluationType === "online"
                        ? "primary"
                        : "outline-secondary"
                    }
                    onClick={() => setEvaluationType("online")}
                    disabled={!hasOnlineResume} // <<< SỬA ĐỔI: Logic disable vẫn giữ nguyên
                  >
                    Use My Online Profile
                  </Button>
                  <Button
                    variant={
                      evaluationType === "upload"
                        ? "primary"
                        : "outline-secondary"
                    }
                    onClick={() => setEvaluationType("upload")}
                  >
                    Upload a New CV
                  </Button>
                </div>
                {!hasOnlineResume && (
                  <Alert variant="info" className="mt-2">
                    You don't have an Online Profile yet. Please{" "}
                    <a href="/resume/create">create one</a> or upload a file.
                  </Alert>
                )}
              </Form.Group>
              {evaluationType === "online" && (
                <div className="mt-2 text-muted">
                  Selected file: <strong>{fullUserData?.mainResume}</strong>
                </div>
              )}

              {evaluationType === "upload" && (
                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label>Upload your CV (PDF, DOC, DOCX)</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                  />
                </Form.Group>
              )}

              {error && <Alert variant="danger">{error}</Alert>}

              <div className="d-grid">
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleEvaluate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />{" "}
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <ThunderboltOutlined /> Start AI Evaluation
                    </>
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>

          {renderResults()}
        </Col>
      </Row>
    </Container>
  );
};

export default CVAIEvaluationPage;
