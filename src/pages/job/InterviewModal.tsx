import { callEvaluateInterview, callGenerateQuestions } from "@/config/api";
import "@/styles/interview-modal.scss"; // Import file SCSS vừa tạo
import {
  IEvaluateInterviewRequest,
  IInterviewFeedbackResponse,
  IInterviewQuestion,
} from "@/types/backend";
import {
  BulbOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RobotOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import { useState } from "react";
import { Alert, Badge, Button, Form, Modal, Spinner } from "react-bootstrap";

interface IProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  jobId: string | undefined;
  jobName: string | undefined;
}

const InterviewModal = (props: IProps) => {
  const { isOpen, setIsOpen, jobId, jobName } = props;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<IInterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<IInterviewFeedbackResponse | null>(
    null,
  );

  const language = localStorage.getItem("language") || "vi";

  const handleStartInterview = async () => {
    if (!jobId) return;
    setIsLoading(true);
    try {
      const res = await callGenerateQuestions(jobId, 10, language);
      if (res && res.data) {
        setQuestions(res.data.questions);
        setAnswers(new Array(res.data.questions.length).fill(""));
        setStep(2);
      }
    } catch (error) {
      message.error("Lỗi kết nối AI");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswers = async () => {
    setIsLoading(true);
    try {
      const payload: IEvaluateInterviewRequest = {
        jobId,
        answers: questions.map((q, index) => ({
          question: q.question,
          answer: answers[index] || "Không trả lời",
        })),
      };
      const res = await callEvaluateInterview(payload, language);
      if (res && res.data) {
        setFeedback(res.data);
        setStep(3);
      }
    } catch (error) {
      message.error("Lỗi chấm điểm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setQuestions([]);
    setAnswers([]);
    setFeedback(null);
  };

  return (
    <Modal
      show={isOpen}
      onHide={() => setIsOpen(false)}
      size="lg"
      centered
      className="interview-modal-custom"
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <RobotOutlined className="me-2 text-primary" />
          Phỏng vấn giả lập AI
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: "75vh", overflowY: "auto" }}>
        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <div className="text-center py-5">
            <RobotOutlined
              style={{ fontSize: "64px", color: "var(--brand-social)" }}
            />
            <h4 className="mt-4 fw-bold">Bắt đầu thử thách chuyên môn</h4>
            <p
              className="text-muted-custom mx-auto"
              style={{ maxWidth: "500px" }}
            >
              Dựa trên vị trí <strong>{jobName}</strong>, AI sẽ tạo 10 câu hỏi
              sát thực tế để kiểm tra trình độ của bạn.
            </p>
            <Button
              className="view-vip mt-4 px-5"
              onClick={handleStartInterview}
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="sm" /> : "Bắt đầu ngay"}
            </Button>
          </div>
        )}
        {/* // Trong Step 2 (Questions) */}
        {step === 2 && (
          <div className="interview-flow px-md-4">
            <Alert
              variant="info"
              className="border-0 bg-opacity-10 mb-5 py-3 shadow-sm"
              style={{
                backgroundColor: "rgba(13, 202, 240, 0.1)",
                color: "#0dcaf0",
              }}
            >
              <BulbOutlined className="me-2" />
              Ngôn ngữ:{" "}
              <strong>{language === "vi" ? "Tiếng Việt" : "English"}</strong>
            </Alert>

            {questions.map((q, index) => (
              <div key={index} className="question-item">
                <div className="q-title">
                  <Badge bg="primary" pill style={{ minWidth: "30px" }}>
                    {index + 1}
                  </Badge>
                  <span>{q.question}</span>
                </div>

                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Viết câu trả lời của bạn..."
                  value={answers[index]}
                  onChange={(e) => {
                    const newAns = [...answers];
                    newAns[index] = e.target.value;
                    setAnswers(newAns);
                  }}
                />

                <div className="hint-text">
                  <BulbOutlined className="text-warning" />
                  <span className="fst-italic">Gợi ý: {q.hint}</span>
                </div>
              </div>
            ))}

            <div className="text-center pb-5">
              <Button
                className="view-vip btn-lg shadow"
                onClick={handleSubmitAnswers}
                disabled={isLoading}
              >
                {isLoading ? "AI đang chấm điểm..." : "Hoàn tất và Nộp bài"}
              </Button>
            </div>
          </div>
        )}
        {/* // Trong Step 3 (Results) */}
        {step === 3 && feedback && (
          <div className="interview-results px-md-4">
            <div className="result-summary-box text-center p-4 mb-5 shadow-sm">
              <TrophyOutlined style={{ fontSize: "40px", color: "#faad14" }} />
              <h2 className="fw-bold mt-2">{feedback.overallScore}/10</h2>
              <p className="text-muted-custom small">
                {feedback.generalComment}
              </p>
            </div>

            {feedback.details.map((item, idx) => (
              <div
                key={idx}
                className={`result-card-flat ${item.score >= 7 ? "high-score" : "low-score"}`}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold mb-0 text-primary">
                    Q{idx + 1}. {item.question}
                  </h6>
                  <Badge pill bg={item.score >= 7 ? "success" : "danger"}>
                    {item.score}/10
                  </Badge>
                </div>

                <div className="row g-3 mt-1">
                  <div className="col-md-6 small">
                    <div className="text-success fw-bold">
                      <CheckCircleOutlined /> Điểm mạnh
                    </div>
                    <div>{item.strengths}</div>
                  </div>
                  <div className="col-md-6 small">
                    <div className="text-danger fw-bold">
                      <CloseCircleOutlined /> Cần cải thiện
                    </div>
                    <div>{item.improvements}</div>
                  </div>
                </div>

                <div className="model-answer-box mt-3">
                  <strong className="text-primary small d-block mb-1">
                    CÂU TRẢ LỜI MẪU:
                  </strong>
                  <div
                    className="text-muted-custom italic"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {item.modelAnswer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default InterviewModal;
