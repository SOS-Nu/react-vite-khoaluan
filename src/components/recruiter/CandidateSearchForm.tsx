// src/components/recruiter/CandidateSearchForm.tsx
import React, { useState } from "react";
import { Form, Button, Card, Row, Col, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { callFindCandidatesByAI } from "@/config/api";
import { ICandidate } from "@/types/backend";

interface IProps {
  setIsSearching: (isSearching: boolean) => void;
  setCandidates: (candidates: ICandidate[]) => void;
}

const CandidateSearchForm = (props: IProps) => {
  const { setIsSearching, setCandidates } = props;
  const [jobDescription, setJobDescription] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // >>> THAY ĐỔI LOGIC VALIDATION <<<
    // Chỉ cần 1 trong 2 trường có dữ liệu là được
    if (!jobDescription && !cvFile) {
      toast.error(
        "Vui lòng nhập mô tả công việc hoặc tải lên file mô tả công việc."
      );
      return;
    }

    setIsSearching(true);

    // >>> THAY ĐỔI CÁCH TẠO FORMDATA <<<
    // Chỉ thêm vào form data những trường có giá trị
    const formData = new FormData();
    if (jobDescription) {
      formData.append("jobDescription", jobDescription);
    }
    if (cvFile) {
      formData.append("cv", cvFile);
    }

    try {
      const res = await callFindCandidatesByAI(formData);
      if (res.data?.candidates && res.data.candidates.length > 0) {
        setCandidates(res.data.candidates);
        toast.success(
          `Tìm thấy ${res.data.candidates.length} ứng viên phù hợp!`
        );
      } else {
        setCandidates([]);
        toast.info("Không tìm thấy ứng viên nào khớp với yêu cầu.");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra trong quá trình tìm kiếm.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header as="h5">Tìm kiếm ứng viên thông minh</Card.Header>
      <Card.Body>
        <p>
          Nhập mô tả công việc hoặc tải lên file mô tả để AI tìm giúp bạn những
          ứng viên phù hợp nhất.
        </p>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>1. Mô tả công việc (Job Description)</Form.Label>
            <Form.Control
              as="textarea"
              rows={8}
              placeholder="I. Mô tả công việc..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </Form.Group>
          <div className="text-center my-3 fw-bold">HOẶC</div>
          <Form.Group className="mb-3">
            <Form.Label>2. Tải lên một file mô tả</Form.Label>
            <Form.Control
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.files) {
                  setCvFile(e.target.files[0]);
                }
              }}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            <i className="bi bi-search me-2"></i>
            Tìm kiếm
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CandidateSearchForm;
